'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import type { SidebarFooterItem, SidebarUser } from './Sidebar.types';
import { useSidebar } from './SidebarContext';
import { SidebarTooltip } from './SidebarTooltip';

const statusDot: Record<NonNullable<SidebarUser['status']>, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  busy: 'bg-red-500',
  offline: 'bg-zinc-400',
};

const statusLabel: Record<NonNullable<SidebarUser['status']>, string> = {
  online: 'Online',
  away: 'Ausente',
  busy: 'Ocupado',
  offline: 'Offline',
};

export function SidebarUserMenu({
  user,
  footerItems = [],
}: {
  user: SidebarUser;
  footerItems?: SidebarFooterItem[];
}) {
  const { effectiveCollapsed, handleNavigate } = useSidebar();
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ bottom: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard Escape & Click Outside listeners
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (effectiveCollapsed) {
        setPopoverPos({
          bottom: window.innerHeight - rect.bottom,
          left: rect.right + 12,
        });
      }
    }
    setOpen((prev) => !prev);
  };

  const avatarEl = (
    <div className="relative shrink-0">
      <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-[var(--sidebar-avatar-background)] text-[var(--sidebar-avatar-foreground)] text-xs font-semibold ring-2 ring-[var(--sidebar-avatar-ring)]">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <span>{user.initials ?? user.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      {user.status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${statusDot[user.status]} ring-2 ring-[var(--sidebar-avatar-ring)]`}
        />
      )}
    </div>
  );

  const menuContent = (
    <div
      role="menu"
      ref={containerRef}
      className={[
        'rounded-xl bg-[var(--sidebar-popover-background)] text-[var(--sidebar-popover-foreground)] shadow-xl ring-1 ring-[var(--sidebar-popover-border)] overflow-hidden z-[120]',
        effectiveCollapsed
          ? 'fixed min-w-56 animate-in fade-in zoom-in-95 duration-150'
          : 'absolute bottom-full left-0 right-0 mb-2 transition-all duration-150 ease-out origin-bottom z-[90]',
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none hidden',
      ].join(' ')}
      style={
        effectiveCollapsed && open
          ? { bottom: popoverPos.bottom, left: popoverPos.left }
          : undefined
      }
    >
      <div className="flex items-center gap-3 px-3 py-3 border-b border-[var(--sidebar-border)]">
        {avatarEl}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--sidebar-user-name)] truncate">
            {user.name}
          </p>
          <p className="text-xs text-[var(--sidebar-user-muted)] truncate">
            {user.email ?? user.role ?? ''}
          </p>
        </div>
      </div>
      {footerItems.length > 0 && (
        <div className="py-1">
          {footerItems.map((fi, i) => {
            const Icon = fi.icon;
            const cls = [
              'group flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100',
              fi.danger
                ? 'text-[var(--sidebar-danger-foreground)] hover:bg-[var(--sidebar-danger-hover-background)] cursor-pointer'
                : 'text-[var(--sidebar-popover-foreground)] hover:bg-[var(--sidebar-popover-hover-background)] cursor-pointer',
            ].join(' ');

            const inner = (
              <>
                <span
                  className={`shrink-0 ${
                    fi.danger
                      ? 'text-[var(--sidebar-danger-foreground)] group-hover:text-[var(--sidebar-danger-hover-foreground)]'
                      : 'text-[var(--sidebar-icon-foreground)] group-hover:text-[var(--sidebar-icon-hover-foreground)]'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </span>
                <span className="flex-1 text-left leading-snug">{fi.label}</span>
              </>
            );

            return fi.href ? (
              <a
                key={i}
                href={fi.href}
                className={cls}
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  fi.onClick?.();
                  if (fi.href) handleNavigate(fi.href);
                }}
                >
                {inner}
              </a>
            ) : (
              <button
                data-component-id={fi.componentId || `erp.sidebar.user-menu-${i}`}
                key={i}
                type="button"
                role="menuitem"
                className={cls}
                onClick={() => {
                  setOpen(false);
                  fi.onClick?.();
                }}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (effectiveCollapsed) {
    return (
      <div className="relative">
        <SidebarTooltip label={`${user.name}${user.status ? ` · ${statusLabel[user.status]}` : ''}`}>
          <button
            data-component-id="erp.sidebar.user-menu-trigger"
            ref={triggerRef}
            type="button"
            aria-label="Menu do perfil"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={toggleOpen}
            className="flex w-full justify-center py-1 cursor-pointer focus:outline-none"
          >
            {avatarEl}
          </button>
        </SidebarTooltip>
        {typeof document !== 'undefined' && open && createPortal(menuContent, document.body)}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        data-component-id="erp.sidebar.user-menu-trigger-mobile"
        ref={triggerRef}
        type="button"
        aria-label="Menu do perfil"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggleOpen}
        className="flex w-full items-center gap-2.5 rounded-xl bg-[var(--sidebar-user-background)] px-3 py-2.5 ring-1 ring-[var(--sidebar-user-border)] hover:bg-[var(--sidebar-user-hover-background)] transition-colors cursor-pointer"
      >
        {avatarEl}
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-[var(--sidebar-user-name)] leading-snug">
            {user.name}
          </p>
          <p className="truncate text-[11px] text-[var(--sidebar-user-muted)] leading-snug">
            {user.role ?? user.email ?? ''}
          </p>
        </div>
        <ChevronDown
          size={13}
          className={`shrink-0 text-[var(--sidebar-icon-foreground)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {menuContent}
    </div>
  );
}
