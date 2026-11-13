'use client';

import { ChevronDown } from 'lucide-react';
import type { SidebarNavGroup as SidebarNavGroupType } from './Sidebar.types';
import { useSidebar } from './SidebarContext';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarTooltip } from './SidebarTooltip';
import { resolveGroupId, hasActiveDescendant } from './utils/navigation';

export function SidebarNavGroup({
  group,
  index = 0,
  onNavigate,
}: {
  group: SidebarNavGroupType;
  index?: number;
  onNavigate?: (href: string) => void;
}) {
  const {
    effectiveCollapsed,
    groupsCollapsible,
    collapsedGroupIds,
    collapsedGroupMode,
    toggleGroup,
    setCollapsed,
    searchQuery,
  } = useSidebar();

  const groupId = resolveGroupId(group, index);
  const hasGroupLabel = Boolean(group.label);
  const canCollapse = hasGroupLabel && (group.collapsible ?? groupsCollapsible);
  const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);
  const useCollapsedGroupIcon =
    effectiveCollapsed && hasGroupLabel && collapsedGroupMode === 'group-icons';

  const open = useCollapsedGroupIcon
    ? false
    : effectiveCollapsed || isSearching || !canCollapse || !collapsedGroupIds.has(groupId);
  const groupContentId = `nav-group-content-${groupId}`;
  const GroupIcon = group.icon;
  const isGroupActive = group.items.some(hasActiveDescendant);

  return (
    <div className={effectiveCollapsed ? 'w-full my-0.5' : 'w-full'}>
      {index > 0 && !useCollapsedGroupIcon && (
        <div
          className={
            effectiveCollapsed
              ? 'my-1.5 mx-auto w-5 border-t border-[var(--sidebar-border)] opacity-30'
              : 'mt-3 mb-2 mx-2 border-t border-[var(--sidebar-border)] opacity-35'
          }
        />
      )}

      {useCollapsedGroupIcon ? (
        <SidebarTooltip label={group.label!} delayMs={120}>
          <button
            data-component-id={`erp.sidebar.nav-group-collapsed-${groupId}`}
            type="button"
            aria-label={group.label}
            onClick={() => {
              if (collapsedGroupIds.has(groupId)) {
                toggleGroup(groupId);
              }
              setCollapsed(false);
            }}
            className={`relative w-9 h-9 mx-auto flex items-center justify-center rounded-lg cursor-pointer select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isGroupActive
                ? 'bg-[var(--sidebar-item-active-background)] text-[var(--sidebar-item-active-foreground)] shadow-xs'
                : 'text-[var(--sidebar-icon-foreground)] hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)]'
            }`}
          >
            {GroupIcon ? (
              <GroupIcon size={18} strokeWidth={1.8} className="shrink-0" />
            ) : (
              <span className="text-[11px] font-bold">{group.label!.charAt(0).toUpperCase()}</span>
            )}
          </button>
        </SidebarTooltip>
      ) : !effectiveCollapsed && group.label ? (
        <div className="mb-1">
          {canCollapse ? (
            <button
              data-component-id={`erp.sidebar.nav-group-${groupId}`}
              type="button"
              aria-expanded={open}
              aria-controls={groupContentId}
              onClick={() => toggleGroup(groupId)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer select-none group/grp text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-[var(--sidebar-item-hover-background)] transition-all duration-150"
            >
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--sidebar-group-foreground)] group-hover/grp:text-[var(--sidebar-group-hover-foreground)] transition-colors">
                {GroupIcon && (
                  <GroupIcon
                    size={13.5}
                    strokeWidth={2}
                    className="shrink-0 text-[var(--sidebar-group-foreground)] opacity-80 group-hover/grp:opacity-100 group-hover/grp:text-[var(--sidebar-group-hover-foreground)] transition-all"
                  />
                )}
                {group.label}
              </span>
              <div className="flex items-center gap-1.5">
                {!open && isGroupActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--sidebar-foreground)] shadow-sm animate-pulse" />
                )}
                <ChevronDown
                  size={13}
                  className={`text-[var(--sidebar-group-foreground)] opacity-70 group-hover/grp:opacity-100 group-hover/grp:text-[var(--sidebar-group-hover-foreground)] transition-transform duration-200 ${
                    open ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </button>
          ) : (
            <div className="flex items-center px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--sidebar-group-foreground)]">
              {GroupIcon && (
                <GroupIcon
                  size={13.5}
                  strokeWidth={2}
                  className="shrink-0 mr-2 text-[var(--sidebar-group-foreground)] opacity-80"
                />
              )}
              {group.label}
            </div>
          )}
        </div>
      ) : null}

      {/* Itens do grupo */}
      <div
        id={groupContentId}
        className="grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className={effectiveCollapsed ? 'space-y-1' : 'pt-0.5 pb-1 space-y-0.5'}>
            {group.items.map((item, i) => (
              <SidebarNavItem
                key={item.id ?? `${item.label}-${i}`}
                item={item}
                scopePrefix={groupId}
                onNavigate={onNavigate}
                isTopLevelWithoutGroup={effectiveCollapsed || !hasGroupLabel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
