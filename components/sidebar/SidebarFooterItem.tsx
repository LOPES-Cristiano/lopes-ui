'use client';

import type { SidebarFooterItem as SidebarFooterItemType } from './Sidebar.types';
import { useSidebar } from './SidebarContext';
import { SidebarTooltip } from './SidebarTooltip';

export function SidebarFooterItem({ item }: { item: SidebarFooterItemType }) {
  const { effectiveCollapsed, handleNavigate } = useSidebar();
  const Icon = item.icon;

  const itemClass = [
    'group/fi flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150 text-left',
    item.danger
      ? 'text-[var(--sidebar-danger-foreground)] hover:bg-[var(--sidebar-danger-hover-background)] hover:text-[var(--sidebar-danger-hover-foreground)] cursor-pointer'
      : 'text-[var(--sidebar-item-foreground)] hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)] cursor-pointer',
  ].join(' ');

  const cid = item.componentId ? { 'data-component-id': item.componentId } : {};

  const content = (
    <>
      <span
        className={`shrink-0 transition-colors ${
          item.danger
            ? 'text-[var(--sidebar-danger-foreground)] group-hover/fi:text-[var(--sidebar-danger-hover-foreground)]'
            : 'text-[var(--sidebar-icon-foreground)] group-hover/fi:text-[var(--sidebar-icon-hover-foreground)]'
        }`}
      >
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span
        className={[
          'truncate text-sm leading-none transition-opacity duration-200 ease-out',
          effectiveCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-full',
        ].join(' ')}
      >
        {item.label}
      </span>
    </>
  );

  const el = item.href ? (
    <a
      href={item.href}
      aria-label={item.label}
      className={itemClass}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        item.onClick?.();
        if (item.href) handleNavigate(item.href);
      }}
      {...cid}
    >
      {content}
    </a>
  ) : (
    <button
      data-component-id={item.componentId ?? `erp.sidebar.footer-${item.label}`}
      type="button"
      aria-label={item.label}
      onClick={item.onClick}
      className={itemClass}
      {...cid}
    >
      {content}
    </button>
  );

  return effectiveCollapsed ? <SidebarTooltip label={item.label}>{el}</SidebarTooltip> : el;
}
