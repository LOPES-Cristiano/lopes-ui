'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useShell } from '../ShellContext';
import { useAccessControl } from '../useAccessControl';
import { filterNavGroups } from '@/utils/filterNavItems';

import type {
  SidebarNavGroup as SidebarNavGroupType,
  SidebarNavItem as SidebarNavItemType,
  SidebarProps,
} from './Sidebar.types';
import { SidebarContext } from './SidebarContext';
import { SidebarAnnouncementCard } from './SidebarAnnouncement';
import { SidebarFooterItem } from './SidebarFooterItem';
import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarPinnedSection } from './SidebarPinnedSection';
import { SidebarToolbar } from './SidebarToolbar';
import { SidebarTooltip } from './SidebarTooltip';
import { SidebarUserMenu } from './SidebarUserMenu';
import { useSidebarAutoCollapse } from './hooks/useSidebarAutoCollapse';
import { useSidebarGroups } from './hooks/useSidebarGroups';
import { useSidebarPins } from './hooks/useSidebarPins';

function filterGroupsBySearch(groups: SidebarNavGroupType[], query: string): SidebarNavGroupType[] {
  const q = query.toLowerCase().trim();
  if (!q) return groups;

  const matchItem = (item: SidebarNavItemType): SidebarNavItemType | null => {
    const labelMatches = item.label?.toLowerCase().includes(q);
    const descMatches = item.description?.toLowerCase().includes(q);
    const childrenMatches: SidebarNavItemType[] = [];

    if (item.children && Array.isArray(item.children)) {
      for (const child of item.children) {
        const matchedChild = matchItem(child);
        if (matchedChild) childrenMatches.push(matchedChild);
      }
    }

    if (labelMatches || descMatches || childrenMatches.length > 0) {
      return {
        ...item,
        children: item.children ? (childrenMatches.length > 0 ? childrenMatches : item.children) : undefined,
      };
    }
    return null;
  };

  return groups
    .map((group) => {
      const groupLabelMatches = group.label?.toLowerCase().includes(q);
      const filteredItems = group.items
        .map(matchItem)
        .filter((item): item is any => item !== null);

      if (groupLabelMatches) {
        return group;
      }
      if (filteredItems.length > 0) {
        return {
          ...group,
          items: filteredItems,
        };
      }
      return null;
    })
    .filter((g): g is SidebarNavGroupType => g !== null);
}

export function Sidebar({
  showToolbar = true,
  toolbarActions = [],
  onRefresh,
  onHome,
  onAddItem,
  onAddGroup,
  searchPlaceholder = 'Filtrar itens...',
  pinnable = false,
  pinsStorageKey = 'sidebar-pins',
  logo,
  title,
  subtitle,
  headerExtra,
  announcements = [],
  onAnnouncementDismiss,
  dismissedAnnouncementIds = [],
  groups = [],
  groupsCollapsible = false,
  groupsStorageKey = 'sidebar-groups',
  onNavigate,
  autoCollapseAfterNavigation = false,
  autoCollapseDelay = 0,
  user,
  footerItems = [],
  userMenuItems,
  footerExtra,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  collapsible = true,
  mobileOpen = false,
  onMobileOpenChange,
  className = '',
  isolated = false,
  variant = 'default',
  canAccess,
  showItemIcons = true,
}: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const accessControl = useAccessControl();
  const effectiveCanAccess = canAccess ?? accessControl.canAccess;

  const visibleGroups = useMemo(
    () => filterNavGroups(groups, effectiveCanAccess),
    [groups, effectiveCanAccess],
  );
  const filteredGroups = useMemo(
    () => filterGroupsBySearch(visibleGroups, searchQuery),
    [visibleGroups, searchQuery],
  );

  const visibleFooterItems = footerItems.filter((fi) => !fi.componentId || effectiveCanAccess(fi.componentId));
  const visibleUserMenuItems = userMenuItems
    ? userMenuItems.filter((item) => !item.componentId || effectiveCanAccess(item.componentId))
    : visibleFooterItems;

  const isWorkspace = variant === 'workspace';
  const isIsolated = isolated;

  const shellRaw = useShell();
  const shell = isIsolated ? null : shellRaw;

  // Un-controlled collapse state
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('shell_sidebar_collapsed');
      if (stored !== null) setInternalCollapsed(stored === 'true');
    } catch {}
  }, []);

  // Register sidebar with shell context cleanly
  useLayoutEffect(() => {
    if (shell) return shell._registerSidebar();
  }, [shell]);

  // Resolve collapsed state: shell > controlled prop > internal state
  const isCollapsed = shell
    ? shell.sidebarCollapsed
    : controlledCollapsed ?? internalCollapsed;

  // Unified collapse toggle callback
  const setCollapsed = useCallback(
    (value: boolean) => {
      if (!collapsible) return;
      if (shell) {
        shell.setSidebarCollapsed(value);
      } else if (controlledCollapsed === undefined) {
        setInternalCollapsed(value);
      }
      onCollapsedChange?.(value);
    },
    [collapsible, shell, controlledCollapsed, onCollapsedChange],
  );

  // Auto-collapse / hover-expansion hook
  const { isHovered, handleMouseEnter, handleMouseLeave, resetHover } = useSidebarAutoCollapse({
    delay: autoCollapseDelay ?? 4000,
    isCollapsed,
    disabled: !collapsible || (autoCollapseDelay != null && autoCollapseDelay <= 0),
    onAutoCollapse: () => {
      setCollapsed(true);
    },
  });

  // Resolve mobile open state and mobile drawer closer
  const isMobileOpen = shell ? shell.mobileSidebarOpen : mobileOpen;
  const closeMobile = useCallback(() => {
    if (shell) shell.setMobileSidebarOpen(false);
    else onMobileOpenChange?.(false);
  }, [shell, onMobileOpenChange]);

  // Combined navigation handler (navigates + closes mobile drawer + resets hover)
  const handleNavigate = useCallback(
    (href: string) => {
      if (onNavigate) {
        onNavigate(href);
      } else if (href) {
        if (typeof window !== 'undefined' && href.includes('#')) {
          try {
            const url = new URL(href, window.location.origin);
            if (url.pathname === window.location.pathname && url.hash) {
              const targetEl = document.getElementById(decodeURIComponent(url.hash.slice(1)));
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(window.history.state, '', href);
              } else {
                void router.push(href);
              }
            } else {
              void router.push(href);
            }
          } catch {
            void router.push(href);
          }
        } else {
          void router.push(href);
        }
      }
      closeMobile();
      resetHover();
      if (autoCollapseAfterNavigation) {
        setCollapsed(true);
      }
    },
    [onNavigate, router, closeMobile, resetHover, autoCollapseAfterNavigation, setCollapsed],
  );

  // Visually collapsed state and mode resolution (on mobile drawer, always expand full width)
  const isMobileDrawer = isMobileOpen;
  const effectiveCollapsed = isMobileDrawer ? false : isCollapsed ? !isHovered : false;
  const visuallyCollapsed = isMobileDrawer ? false : effectiveCollapsed;
  const mode = isMobileDrawer ? 'expanded' : (!effectiveCollapsed ? 'expanded' : 'collapsed');

  // Custom hooks for safe, validated local storage persistence
  const { pinnedIds, togglePin } = useSidebarPins(pinnable, pinsStorageKey, visibleGroups);
  const {
    collapsedGroupIds,
    toggleGroup,
    collapseAll: collapseAllGroups,
    expandAll: expandAllGroups,
    toggleAll: toggleAllGroups,
    allCollapsed: allGroupsCollapsed,
  } = useSidebarGroups(
    groupsCollapsible,
    groupsStorageKey,
    visibleGroups,
  );

  const activeAnnouncements = useMemo(() => {
    const dismissedSet = new Set(dismissedAnnouncementIds);
    return announcements.filter((a) => !dismissedSet.has(a.id));
  }, [announcements, dismissedAnnouncementIds]);

  return (
    <SidebarContext.Provider
      value={{
        collapsed: isCollapsed,
        isHovered,
        visuallyCollapsed,
        effectiveCollapsed,
        mode,
        pinnable,
        pinnedIds,
        groupsCollapsible,
        collapsedGroupIds,
        allGroupsCollapsed,
        searchQuery,
        setSearchQuery,
        setCollapsed,
        togglePin,
        toggleGroup,
        collapseAllGroups,
        expandAllGroups,
        toggleAllGroups,
        handleNavigate,
        closeMobile,
        showItemIcons,
      }}
    >
      {/* Mobile backdrop */}
      <div
        className={[
          'fixed inset-0 z-[60] bg-black/50 md:hidden transition-opacity duration-300',
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={closeMobile}
      />

      {/* Sidebar panel */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={(e) => {
          const target = e.target as HTMLElement | null;
          if (target && typeof target.matches === 'function') {
            try {
              if (!target.matches(':focus-visible') && target.tagName !== 'INPUT') {
                return;
              }
            } catch {}
          }
          handleMouseEnter();
        }}
        onBlurCapture={(e) => {
          const related = e.relatedTarget as Node | null;
          if (related && !e.currentTarget.contains(related)) {
            handleMouseLeave();
          }
        }}
        className={[
          'flex flex-col h-screen md:h-full overflow-visible bg-[var(--sidebar-background)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] select-none',
          effectiveCollapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[82vw] max-w-[280px] md:w-[var(--sidebar-width)]',
          // Mobile: drawer fixed; desktop: part of layout flow
          'fixed inset-y-0 left-0 z-[70] shadow-none md:shadow-none lg:shadow-[var(--sidebar-shadow)] md:relative md:inset-auto md:z-10 md:translate-x-0 md:h-full',
          // Smooth transition for collapse width and mobile slide-in
          'transition-all duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className,
        ].join(' ')}
      >
        {/* Header */}
        <div
          className={[
            'relative flex shrink-0 border-b border-[var(--sidebar-border)] transition-all duration-200 justify-between items-center h-16 min-h-[64px] px-3.5',
            effectiveCollapsed ? 'justify-center px-1.5' : '',
          ].join(' ')}
        >
          {/* Logo + Título / Subtítulo */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 w-full justify-center">
            {logo && (
              <div className={!title && !subtitle || effectiveCollapsed ? 'w-full flex items-center justify-center text-center' : 'shrink-0'}>
                {effectiveCollapsed && (title || subtitle) ? (
                  <SidebarTooltip label={subtitle ? `${title} — ${subtitle}` : (title ?? '')}>
                    <div className="flex items-center justify-center">{logo}</div>
                  </SidebarTooltip>
                ) : (
                  logo
                )}
              </div>
            )}

            {!effectiveCollapsed && (title || subtitle) && (
              <div className="min-w-0 flex-1 overflow-hidden">
                {title && (
                  <p className="text-xs font-bold leading-snug text-[var(--sidebar-foreground)] truncate">
                    {title}
                  </p>
                )}
                {subtitle && (
                  <p className="text-[10px] text-[var(--sidebar-muted-foreground)] leading-tight truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* headerExtra — expanded only */}
          {!effectiveCollapsed && headerExtra && (
            <div className="shrink-0 pl-1">{headerExtra}</div>
          )}

          {/* Mobile close button */}
          <button
            data-component-id="erp.sidebar.mobile-close"
            type="button"
            aria-label="Fechar menu"
            onClick={closeMobile}
            className="md:hidden rounded-lg p-1.5 shrink-0 text-[var(--sidebar-toggle-foreground)] hover:bg-[var(--sidebar-toggle-hover-background)] hover:text-[var(--sidebar-toggle-hover-foreground)] transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div
          className={[
            'flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-3 space-y-3',
            effectiveCollapsed
              ? 'px-1.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              : 'px-2',
          ].join(' ')}
        >
          {/* Toolbar (Header Actions & Quick Search) */}
          {showToolbar && (
            <SidebarToolbar
              onRefresh={onRefresh}
              onHome={onHome}
              onAddItem={onAddItem}
              onAddGroup={onAddGroup}
              toolbarActions={toolbarActions}
              searchPlaceholder={searchPlaceholder}
            />
          )}

          {/* Navigation groups */}
          {filteredGroups.length > 0 ? (
            <nav aria-label="Sidebar navigation" className="space-y-0.5">
              {/* Pinned items section */}
              {pinnable && !searchQuery && (
                <SidebarPinnedSection groups={visibleGroups} onNavigate={handleNavigate} />
              )}
              {filteredGroups.map((g, gi) => (
                <SidebarNavGroup
                  key={g.id ?? `g-${gi}`}
                  group={g}
                  index={gi}
                  onNavigate={handleNavigate}
                />
              ))}
            </nav>
          ) : searchQuery ? (
            <div className="px-3 py-6 text-center text-xs text-[var(--sidebar-group-foreground)]">
              <p>Nenhum item encontrado para &quot;{searchQuery}&quot;</p>
              <button
                data-component-id="erp.sidebar.search-clear"
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 inline-flex items-center justify-center text-primary hover:underline cursor-pointer"
              >
                Limpar busca
              </button>
            </div>
          ) : null}

          {/* Announcements — positioned cleanly at bottom of navigation */}
          {activeAnnouncements.length > 0 && (
            <div
              className={[
                'space-y-2 pt-2 transition-opacity duration-200 ease-out',
                effectiveCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
              ].join(' ')}
            >
              {activeAnnouncements.map((a) => (
                <SidebarAnnouncementCard
                  key={a.id}
                  item={a}
                  onDismiss={onAnnouncementDismiss}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer — só renderiza se houver conteúdo */}
        {(visibleFooterItems.length > 0 || footerExtra || user) && (
          <div className="shrink-0 border-t border-[var(--sidebar-border)] px-2 py-3 space-y-0.5">
            {!user &&
              visibleFooterItems.map((fi, i) => (
                <SidebarFooterItem key={`fi-${i}`} item={fi} />
              ))}
            {footerExtra && (
              <div
                className={[
                  'pt-2 overflow-hidden transition-all duration-[250ms] ease-out',
                  effectiveCollapsed
                    ? 'max-h-0 opacity-0 pointer-events-none'
                    : 'max-h-96 opacity-100',
                ].join(' ')}
              >
                {footerExtra}
              </div>
            )}
            {user && (
              <div className="pt-2">
                <SidebarUserMenu user={user} footerItems={visibleUserMenuItems} />
              </div>
            )}
          </div>
        )}
      </aside>
    </SidebarContext.Provider>
  );
}

export default Sidebar;
