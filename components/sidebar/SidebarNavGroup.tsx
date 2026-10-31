'use client';

import { ChevronDown } from 'lucide-react';
import type { SidebarNavGroup as SidebarNavGroupType } from './Sidebar.types';
import { useSidebar } from './SidebarContext';
import { SidebarNavItem } from './SidebarNavItem';
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
    toggleGroup,
    searchQuery,
  } = useSidebar();

  const groupId = resolveGroupId(group, index);
  const canCollapse = Boolean(group.label) && (group.collapsible ?? groupsCollapsible);
  const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);
  const open = effectiveCollapsed || isSearching || !canCollapse || !collapsedGroupIds.has(groupId);
  const groupContentId = `nav-group-content-${groupId}`;
  const GroupIcon = group.icon;
  const isGroupActive = group.items.some(hasActiveDescendant);

  return (
    <div className={effectiveCollapsed ? 'w-full my-0.5' : 'w-full'}>
      {index > 0 && (
        <div
          className={
            effectiveCollapsed
              ? 'my-1.5 mx-auto w-5 border-t border-[var(--sidebar-border)] opacity-30'
              : 'mt-3 mb-2 mx-2 border-t border-[var(--sidebar-border)] opacity-35'
          }
        />
      )}
      {!effectiveCollapsed && group.label ? (
        <div className="mb-1">
          {canCollapse ? (
            <button
              data-component-id={`erp.sidebar.nav-group-${groupId}`}
              type="button"
              aria-expanded={open}
              aria-controls={groupContentId}
              onClick={() => toggleGroup(groupId)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer select-none group/grp text-left focus:outline-none hover:bg-[var(--sidebar-item-hover-background)] transition-all duration-150"
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
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className={effectiveCollapsed ? 'space-y-1' : 'pt-0.5 pb-1 space-y-0.5'}>
            {group.items.map((item, i) => (
              <SidebarNavItem
                key={item.id ?? `${item.label}-${i}`}
                item={item}
                onNavigate={onNavigate}
                isTopLevelWithoutGroup={effectiveCollapsed || !group.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
