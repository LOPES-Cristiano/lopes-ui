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
    toggleGroup,
    searchQuery,
    setCollapsed,
    handleNavigate,
  } = useSidebar();

  const groupId = resolveGroupId(group, index);
  const canCollapse = Boolean(group.label) && (group.collapsible ?? groupsCollapsible);
  const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);
  const open = isSearching || !canCollapse || !collapsedGroupIds.has(groupId);
  const groupContentId = `nav-group-content-${groupId}`;
  const GroupIcon = group.icon;
  const isGroupActive = group.items.some(hasActiveDescendant);

  // ── MODO COLAPSADO: Exibe os ícones de todos os itens do grupo diretamente ──
  if (effectiveCollapsed) {
    return (
      <div className="w-full space-y-1 my-0.5">
        {index > 0 && (
          <div className="my-1.5 mx-auto w-5 border-t border-[var(--sidebar-border)] opacity-30" />
        )}
        {group.items.map((item, i) => (
          <SidebarNavItem
            key={item.id ?? `${item.label}-${i}`}
            item={item}
            onNavigate={onNavigate}
            isTopLevelWithoutGroup={true}
          />
        ))}
      </div>
    );
  }

  // ── MODO EXPANDIDO: Grupo com destaque visual (maior que os itens) ──
  return (
    <div className="w-full">
      {index > 0 && (
        <div className="my-2 mx-2 border-t border-[var(--sidebar-border)] opacity-20" />
      )}
      {group.label ? (
        <div>
          {canCollapse ? (
            <button
              data-component-id={`erp.sidebar.nav-group-${groupId}`}
              type="button"
              aria-expanded={open}
              aria-controls={groupContentId}
              onClick={() => toggleGroup(groupId)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer select-none group/grp text-left focus:outline-none hover:bg-white/[0.08] transition-all duration-150"
            >
              <span className="flex items-center gap-2 text-[13.5px] font-normal text-[var(--sidebar-foreground)] group-hover/grp:text-white transition-colors tracking-tight">
                {GroupIcon && (
                  <GroupIcon
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-[var(--sidebar-icon-foreground)] opacity-90 group-hover/grp:opacity-100 group-hover/grp:scale-105 transition-transform"
                  />
                )}
                {group.label}
              </span>
              <div className="flex items-center gap-1.5">
                {!open && isGroupActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm animate-pulse" />
                )}
                <ChevronDown
                  size={14}
                  className={`text-[var(--sidebar-icon-foreground)] opacity-70 group-hover/grp:opacity-100 group-hover/grp:text-[var(--sidebar-icon-hover-foreground)] transition-transform duration-200 ${
                    open ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </button>
          ) : (
            <div className="flex items-center px-2.5 py-1.5 text-[13.5px] font-bold text-[var(--sidebar-foreground)] tracking-tight">
              {GroupIcon && (
                <GroupIcon
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 mr-2 text-[var(--sidebar-icon-foreground)] opacity-90"
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
          <div className="pt-0.5 pb-1 space-y-0.5">
            {group.items.map((item, i) => (
              <SidebarNavItem
                key={item.id ?? `${item.label}-${i}`}
                item={item}
                onNavigate={onNavigate}
                isTopLevelWithoutGroup={!group.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
