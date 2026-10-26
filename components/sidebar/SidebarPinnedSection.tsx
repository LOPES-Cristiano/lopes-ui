'use client';

import React from 'react';
import { Pin } from 'lucide-react';
import type { SidebarNavGroup } from './Sidebar.types';
import { useSidebar } from './SidebarContext';
import { SidebarNavItem } from './SidebarNavItem';
import { flattenNavItems, getItemPinId } from './utils/navigation';

export function SidebarPinnedSection({
  groups,
  onNavigate,
}: {
  groups: SidebarNavGroup[];
  onNavigate?: (href: string) => void;
}) {
  const { effectiveCollapsed, pinnedIds } = useSidebar();
  if (pinnedIds.size === 0) return null;

  const pinned = flattenNavItems(groups).filter((item) => pinnedIds.has(getItemPinId(item)));
  if (pinned.length === 0) return null;

  return (
    <div className="pb-2">
      {!effectiveCollapsed && (
        <div className="flex items-center justify-between px-2.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Pin size={11} className="text-amber-400 fill-amber-400/30" />
            <span className="app-chrome-muted-text font-semibold uppercase tracking-widest text-[10px] text-[var(--sidebar-group-foreground)]">
              Fixados
            </span>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/10 text-[var(--sidebar-group-foreground)] leading-none">
            {pinned.length}
          </span>
        </div>
      )}
      <div className={effectiveCollapsed ? 'space-y-1' : 'space-y-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.07]'}>
        {pinned.map((item) => (
          <SidebarNavItem
            key={`pinned-${getItemPinId(item)}`}
            item={item}
            variant="pinned"
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <div className="mt-3 border-t border-[var(--sidebar-border)]" />
    </div>
  );
}

