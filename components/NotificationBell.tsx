"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  Bell, Check, CheckCheck, X, ExternalLink,
  Info, CheckCircle2, AlertTriangle, AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { calcSmartPos } from "@/hooks/useSmartPosition";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = "default" | "info" | "success" | "warning" | "danger";

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
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  className?: string;
  componentId?: string;
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDate(ts: Date | string): Date {
  return ts instanceof Date ? ts : new Date(ts);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

type DateGroup = "Hoje" | "Ontem" | "Esta semana" | "Anteriores";
const GROUP_ORDER: DateGroup[] = ["Hoje", "Ontem", "Esta semana", "Anteriores"];

function getGroup(ts: Date | string): DateGroup {
  const diffDays = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(toDate(ts)).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays <= 7) return "Esta semana";
  return "Anteriores";
}

function groupNotifications(items: NotificationItem[]) {
  const map = new Map<DateGroup, NotificationItem[]>();
  for (const item of items) {
    const g = getGroup(item.timestamp);
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(item);
  }
  return GROUP_ORDER
    .filter((g) => map.has(g))
    .map((g) => ({ group: g, items: map.get(g)! }));
}

function formatTimestamp(ts: Date | string): string {
  const d = toDate(ts);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return (
    d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      ...(sameYear ? {} : { year: "numeric" }),
    }) +
    " · " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: LucideIcon; bg: string; iconCls: string }> = {
  default: { icon: Bell,          bg: "bg-zinc-100 dark:bg-zinc-800",         iconCls: "text-zinc-500 dark:text-zinc-400" },
  info:    { icon: Info,          bg: "bg-blue-50 dark:bg-blue-950/50",       iconCls: "text-blue-500 dark:text-blue-400" },
  success: { icon: CheckCircle2,  bg: "bg-emerald-50 dark:bg-emerald-950/50", iconCls: "text-emerald-500 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-950/50",     iconCls: "text-amber-500 dark:text-amber-400" },
  danger:  { icon: AlertCircle,   bg: "bg-red-50 dark:bg-red-950/50",         iconCls: "text-red-500 dark:text-red-400" },
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
  const cfg = TYPE_CONFIG[item.type ?? "default"];
  const Icon = item.icon ?? cfg.icon;

  const handleClick = () => {
    if (!item.read) onMarkRead?.(item.id);
    onNotificationClick?.(item);
    item.onClick?.();
  };

  const content = (
    <div
      className={twMerge(
        "group/row relative flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors select-none",
        "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
        !item.read && "bg-blue-50/50 dark:bg-blue-950/20",
      )}
    >
      {/* Unread dot */}
      {!item.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
      )}

      {/* Avatar or type icon */}
      <div className="mt-0.5 shrink-0">
        {item.avatar || item.avatarFallback ? (
          <div className="h-9 w-9 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
            {item.avatar
              ? <Image src={item.avatar} alt="" width={36} height={36} className="h-full w-full object-cover" />
              : <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{item.avatarFallback}</span>
            }
          </div>
        ) : (
          <div className={twMerge("h-9 w-9 rounded-full flex items-center justify-center shrink-0", cfg.bg)}>
            <Icon size={16} className={cfg.iconCls} />
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 space-y-0.5 pr-6">
        <p className={twMerge(
          "text-sm leading-snug text-zinc-800 dark:text-zinc-200",
          !item.read && "font-medium",
        )}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2">
            {item.description}
          </p>
        )}
        {item.reference && (
          <span
            onClick={(e) => { e.stopPropagation(); if (item.reference?.href) window.location.href = item.reference.href; }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {item.reference.label}
            {item.reference.href && <ExternalLink size={9} />}
          </span>
        )}
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
          {formatTimestamp(item.timestamp)}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
        {onDismiss && (
          <button
            type="button"
            aria-label="Dispensar"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(item.id); }}
            className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={12} />
          </button>
        )}
        {!item.read && onMarkRead && (
          <button
            type="button"
            aria-label="Marcar como lida"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMarkRead(item.id); }}
            className="rounded p-0.5 text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <Check size={12} />
          </button>
        )}
      </div>
    </div>
  );

  if (item.href) {
    return (
      <a href={item.href} className="block" onClick={handleClick}>
        {content}
      </a>
    );
  }
  return (
    <div role="button" tabIndex={0} onClick={handleClick} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}>
      {content}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotificationBell({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onNotificationClick,
  className,
  componentId,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupNotifications(notifications);

  const openPanel = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    // Panel width: 26rem (416px) on sm+, 22rem (352px) on mobile.
    // Panel height: header ~48px + scrollable list capped at min(480, 70dvh).
    const panelW = window.innerWidth >= 640 ? 416 : 352;
    const panelH = Math.min(530, window.innerHeight * 0.8);
    const { top, left } = calcSmartPos({ anchor: r, panelW, panelH, gap: 8, preferH: "end" });
    setPos({ top, left });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Bell trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={twMerge(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
          "text-zinc-500 dark:text-zinc-400 transition-colors",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200",
          open && "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200",
          className,
        )}
        {...(componentId ? { "data-component-id": componentId } : {})}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-zinc-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel (portal) */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notificações"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] w-[22rem] sm:w-[26rem] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 overflow-hidden"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notificações</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 px-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <CheckCheck size={12} />
                  Marcar todas
                </button>
              )}
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-[min(30rem,70dvh)] divide-y divide-zinc-100 dark:divide-zinc-800">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Bell size={22} className="text-zinc-300 dark:text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tudo em dia</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Nenhuma notificação por enquanto.</p>
                </div>
              </div>
            ) : (
              grouped.map(({ group, items }) => (
                <div key={group}>
                  {/* Group label */}
                  <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-950/80 backdrop-blur-sm px-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
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
        </div>,
        document.body,
      )}
    </>
  );
}
