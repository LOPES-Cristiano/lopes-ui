'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { calcSmartPos } from '../hooks/useSmartPosition';
import { sanitizeSafeHref } from '../utils/sanitize';
import { useAccessControl } from './useAccessControl';

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = 'default' | 'info' | 'success' | 'warning' | 'danger';

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  /** Date object or ISO string */
  timestamp: Date | string;
  read?: boolean;
  /** Navigates to this URL when the row is clicked */
  href?: string;
  /** Fired after marking as read, alongside href navigation */
  onClick?: () => void;
  /** Custom icon — overrides the type default */
  icon?: LucideIcon;
  type?: NotificationType;
  /** Related entity shown as a small tag below the description */
  reference?: { label: string; href?: string };
  /** Avatar image URL */
  avatar?: string;
  /** Initials shown when there is no avatar image */
  avatarFallback?: string;
};

export type NotificationBellProps = {
  notifications?: NotificationItem[];
  loading?: boolean;
  footer?: React.ReactNode;
  viewAllHref?: string;
  onViewAll?: () => void;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function toDate(ts: Date | string): Date {
  return ts instanceof Date ? ts : new Date(ts);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

type DateGroup = 'Hoje' | 'Ontem' | 'Esta semana' | 'Anteriores';
const GROUP_ORDER: DateGroup[] = ['Hoje', 'Ontem', 'Esta semana', 'Anteriores'];

function getGroup(ts: Date | string): DateGroup {
  const diffDays = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(toDate(ts)).getTime()) / 86_400_000
  );
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays <= 7) return 'Esta semana';
  return 'Anteriores';
}

function groupNotifications(items: NotificationItem[]) {
  const map = new Map<DateGroup, NotificationItem[]>();
  for (const item of items) {
    const g = getGroup(item.timestamp);
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(item);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
}

function formatTimestamp(ts: Date | string): string {
  const d = toDate(ts);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return (
    d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' }),
    }) +
    ' · ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: LucideIcon; bg: string; iconCls: string }> = {
  default: {
    icon: Bell,
    bg: 'bg-header-command-panel-hover',
    iconCls: 'text-header-command-panel-muted',
  },
  info: {
    icon: Info,
    bg: 'bg-header-command-panel-active',
    iconCls: 'text-header-command-panel-active-foreground',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconCls: 'text-emerald-500 dark:text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    iconCls: 'text-amber-500 dark:text-amber-400',
  },
  danger: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-950/50',
    iconCls: 'text-red-500 dark:text-red-400',
  },
};

// ── NotificationRow ───────────────────────────────────────────────────────────

function NotificationRow({
  item,
  onMarkRead,
  onDismiss,
  onNotificationClick,
}: {
  item: NotificationItem;
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onNotificationClick?: (n: NotificationItem) => void;
}) {
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const cfg = TYPE_CONFIG[item.type ?? 'default'];
  const Icon = item.icon ?? cfg.icon;
  const safeHref = item.href ? sanitizeSafeHref(item.href) : null;
  const safeRefHref = item.reference?.href ? sanitizeSafeHref(item.reference.href) : null;

  const handleClick = () => {
    if (!item.read) onMarkRead?.(item.id);
    onNotificationClick?.(item);
    item.onClick?.();
  };

  const innerBody = (
    <>
      {/* Unread dot */}
      {!item.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-header-command-panel-active-foreground shrink-0" />
      )}

      {/* Avatar or type icon */}
      <div className="mt-0.5 shrink-0">
        {item.avatar || item.avatarFallback ? (
          <div className="h-9 w-9 rounded-full overflow-hidden bg-header-profile-avatar flex items-center justify-center shrink-0">
            {item.avatar && failedAvatar !== item.avatar ? (
              <img
                src={item.avatar}
                alt={item.title}
                width={36}
                height={36}
                onError={() => setFailedAvatar(item.avatar ?? null)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-header-profile-avatar-foreground">
                {item.avatarFallback || getInitials(item.title)}
              </span>
            )}
          </div>
        ) : (
          <div
            className={twMerge(
              'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
              cfg.bg
            )}
          >
            <Icon size={16} className={cfg.iconCls} />
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 space-y-0.5 pr-7 text-left">
        <p
          className={twMerge(
            'text-sm leading-snug text-header-command-panel-foreground',
            !item.read && 'font-medium'
          )}
        >
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-header-command-panel-muted leading-snug line-clamp-2">
            {item.description}
          </p>
        )}
        {item.reference && !safeRefHref && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-header-command-panel-active-foreground">
            {item.reference.label}
          </span>
        )}
        <p suppressHydrationWarning className="text-[11px] text-header-command-panel-muted pt-0.5 tabular-nums">
          {formatTimestamp(item.timestamp)}
        </p>
      </div>
    </>
  );

  const triggerCls =
    'flex w-full items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';

  return (
    <div
      className={twMerge(
        'group/row relative transition-colors',
        'hover:bg-header-command-panel-hover',
        !item.read && 'bg-header-command-panel-active'
      )}
    >
      {safeHref ? (
        <a href={safeHref} onClick={handleClick} className={triggerCls}>
          {innerBody}
        </a>
      ) : (
        <button type="button" onClick={handleClick} className={triggerCls}>
          {innerBody}
        </button>
      )}

      {/* Sibling reference link when reference has its own href */}
      {item.reference && safeRefHref && (
        <div className="px-5 pb-2.5 -mt-2 pl-[4.25rem]">
          <a
            href={safeRefHref}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-header-command-panel-active-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {item.reference.label}
            <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Sibling actions — visible on hover and keyboard focus */}
      {(onDismiss || (!item.read && onMarkRead)) && (
        <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1 opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 transition-opacity">
          {onDismiss && (
            <button
              data-component-id={`erp.notification.dismiss-${item.id}`}
              type="button"
              aria-label="Dispensar notificação"
              onClick={() => onDismiss(item.id)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-header-command-panel-muted hover:text-header-command-panel-foreground hover:bg-header-command-panel-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
          {!item.read && onMarkRead && (
            <button
              data-component-id={`erp.notification.mark-read-${item.id}`}
              type="button"
              aria-label="Marcar como lida"
              onClick={() => onMarkRead(item.id)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-header-command-panel-muted hover:text-header-command-panel-active-foreground hover:bg-header-command-panel-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
            >
              <Check size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationBell({
  notifications = [],
  loading = false,
  footer,
  viewAllHref,
  onViewAll,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onNotificationClick,
  className,
  componentId,
  hideIfDenied = true,
}: NotificationBellProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupNotifications(notifications);

  const openPanel = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const panelW = window.innerWidth >= 640 ? 416 : 352;
    const panelH = Math.min(530, window.innerHeight * 0.8);
    const { top, left } = calcSmartPos({ anchor: r, panelW, panelH, gap: 8, preferH: 'end' });
    setPos({ top, left });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const safeViewAllHref = viewAllHref ? sanitizeSafeHref(viewAllHref) : null;

  const footerContent =
    footer !== undefined ? (
      footer
    ) : safeViewAllHref ? (
      <a
        href={safeViewAllHref}
        onClick={() => {
          onViewAll?.();
          setOpen(false);
        }}
        className="text-xs font-semibold text-header-command-panel-active-foreground hover:underline flex items-center gap-1 py-1 px-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Ver todas as notificações</span>
        <ExternalLink size={12} />
      </a>
    ) : onViewAll ? (
      <button
        data-component-id="erp.notification.view-all"
        type="button"
        onClick={() => {
          onViewAll();
          setOpen(false);
        }}
        className="text-xs font-semibold text-header-command-panel-active-foreground hover:underline flex items-center gap-1 py-1 px-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <span>Ver todas as notificações</span>
        <ExternalLink size={12} />
      </button>
    ) : null;

  return (
    <>
      {/* Bell trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={!hasPermission}
        data-component-id={componentId || 'erp.header.btn.notificacoes'}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={twMerge(
          'group relative inline-flex h-9 w-9 items-center justify-center rounded-xl',
          'bg-transparent text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
          open && 'bg-muted text-foreground',
          className
        )}
      >
        <Bell size={19} className="stroke-[1.75]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs leading-none tabular-nums">
            <span className="translate-y-[0.5px] leading-none text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Panel (portal) */}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notificações"
            data-floating-open="true"
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[9200] w-[22rem] sm:w-[26rem] rounded-2xl flex flex-col bg-header-command-panel text-header-command-panel-foreground border border-header-command-panel-border shadow-2xl overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-header-command-panel-border shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-header-command-panel-foreground">
                  Notificações
                </span>
                {!loading && unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-header-command-panel-active px-1.5 text-[11px] font-semibold text-header-command-panel-active-foreground tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!loading && unreadCount > 0 && onMarkAllRead && (
                  <button
                    data-component-id="erp.notification.mark-all-read"
                    type="button"
                    onClick={onMarkAllRead}
                    className="inline-flex min-h-7 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-header-command-panel-muted hover:text-header-command-panel-foreground hover:bg-header-command-panel-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    Marcar todas
                  </button>
                )}
                <button
                  data-component-id="erp.notification.close"
                  type="button"
                  aria-label="Fechar notificações"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-header-command-panel-muted hover:text-header-command-panel-foreground hover:bg-header-command-panel-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto overscroll-contain max-h-[min(30rem,70dvh)] divide-y divide-header-command-panel-border">
              {loading ? (
                <div
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  className="divide-y divide-header-command-panel-border"
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3.5 animate-pulse">
                      <div className="h-9 w-9 rounded-full bg-header-command-panel-hover shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2 py-0.5">
                        <div className="h-3.5 w-3/4 rounded bg-header-command-panel-hover" />
                        <div className="h-3 w-full rounded bg-header-command-panel-hover opacity-70" />
                        <div className="h-2.5 w-20 rounded bg-header-command-panel-hover opacity-50" />
                      </div>
                    </div>
                  ))}
                  <span className="sr-only">Carregando notificações...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                  <div className="h-12 w-12 rounded-full bg-header-command-panel-hover flex items-center justify-center">
                    <Bell size={22} className="text-header-command-panel-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-header-command-panel-foreground">
                      Tudo em dia
                    </p>
                    <p className="text-xs text-header-command-panel-muted mt-0.5">
                      Nenhuma notificação por enquanto.
                    </p>
                  </div>
                </div>
              ) : (
                grouped.map(({ group, items }) => (
                  <div key={group}>
                    <div className="sticky top-0 z-10 bg-header-command-panel-hover backdrop-blur-sm px-4 py-1.5 border-b border-header-command-panel-border">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-header-command-panel-muted">
                        {group}
                      </span>
                    </div>
                    {items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onMarkRead={onMarkRead}
                        onDismiss={onDismiss}
                        onNotificationClick={onNotificationClick}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Panel footer */}
            {footerContent && (
              <div className="border-t border-header-command-panel-border p-2 bg-header-command-panel shrink-0 flex items-center justify-center">
                {footerContent}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default NotificationBell;
