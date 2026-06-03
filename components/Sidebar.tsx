"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ArrowLeftFromLine,
  X,
  Pin,
  PinOff,
  type LucideIcon,
} from "lucide-react";
import { useShell } from "@/components/ShellContext";
import { filterNavGroups } from "@/utils/filterNavItems";

// ── Context ───────────────────────────────────────────────────────────────────

type SidebarCtx = {
  collapsed: boolean;
  pinnable: boolean;
  pinnedIds: Set<string>;
  groupsCollapsible: boolean;
  collapsedGroupIds: Set<string>;
  togglePin: (id: string) => void;
  toggleGroup: (id: string) => void;
};
const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  pinnable: false,
  pinnedIds: new Set(),
  groupsCollapsible: false,
  collapsedGroupIds: new Set(),
  togglePin: () => {},
  toggleGroup: () => {},
});
const useSidebar = () => useContext(SidebarContext);

// ── Pin helpers ───────────────────────────────────────────────────────────────

const getItemPinId = (item: SidebarNavItem): string =>
  (item.id ?? item.href ?? item.label) as string;

function flattenNavItems(groups: SidebarNavGroup[]): SidebarNavItem[] {
  const result: SidebarNavItem[] = [];
  const walk = (items: SidebarNavItem[]) => {
    for (const item of items) {
      if (!item.divider) result.push(item);
      if (item.children) walk(item.children);
    }
  };
  for (const g of groups) walk(g.items);
  return result;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type SidebarNavItem = {
  id?: string;
  /** Identifier for access control (emitted as data-component-id) */
  componentId?: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeVariant?: "default" | "success" | "warning" | "danger" | "info";
  description?: string;
  disabled?: boolean;
  active?: boolean;
  divider?: boolean;
  children?: SidebarNavItem[];
  onClick?: () => void;
};

export type SidebarNavGroup = {
  id?: string;
  /** Título do grupo (hidden quando collapsed) */
  label?: string;
  /** Permite recolher o grupo clicando no label */
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  items: SidebarNavItem[];
};

export type SidebarAnnouncement = {
  id: string;
  title?: string;
  body: string;
  variant?: "info" | "warning" | "success" | "danger" | "neutral";
  icon?: LucideIcon;
  timestamp?: string;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
};

export type SidebarUser = {
  name: string;
  email?: string;
  avatar?: string;
  /** Ex: "CL" — exibido quando não há avatar */
  initials?: string;
  status?: "online" | "away" | "busy" | "offline";
  role?: string;
};

export type SidebarFooterItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  /** Identifier for access control (emitted as data-component-id) */
  componentId?: string;
};

export type SidebarProps = {
  // ── Pins
  /** Allow users to pin nav items to the top Fixados section */
  pinnable?: boolean;
  /** localStorage key for persisted pins (default: "sidebar-pins") */
  pinsStorageKey?: string;
  // ── Header
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerExtra?: React.ReactNode;
  // ── Announcements / avisos
  announcements?: SidebarAnnouncement[];
  // ── Navigation
  groups?: SidebarNavGroup[];
  groupsCollapsible?: boolean;
  groupsStorageKey?: string;
  onNavigate?: (href: string) => void;
  // ── Footer
  user?: SidebarUser;
  footerItems?: SidebarFooterItem[];
  footerExtra?: React.ReactNode;
  // ── Collapse
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
  collapsible?: boolean;
  // ── Mobile
  mobileOpen?: boolean;
  onMobileOpenChange?: (v: boolean) => void;
  // ── Style
  className?: string;
  /**
   * Optional access check. When provided, nav items and footer items whose
   * `componentId` returns false are hidden. Items without `componentId` are
   * always shown. Parents with all children filtered out are also hidden.
   */
  canAccess?: (componentId: string) => boolean;
  /**
   * When true, this Sidebar does not register with ShellContext.
   * Use for demo/preview instances that should not affect the app layout.
   */
  isolated?: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const badgeClasses: Record<NonNullable<SidebarNavItem["badgeVariant"]>, string> = {
  default: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  danger:  "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
  info:    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
};

function SidebarBadge({ value, variant = "default" }: { value: string | number; variant?: SidebarNavItem["badgeVariant"] }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-px text-[10px] font-semibold leading-none ${badgeClasses[variant ?? "default"]}`}>
      {value}
    </span>
  );
}

// ── Tooltip (exibido apenas no modo collapsed) ─────────────────────────────────

function Tooltip({ label, badge, children }: { label: string; badge?: string | number; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement | null>(null);

  const onEnter = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 12 });
    setShow(true);
  };

  return (
    <div ref={ref} className="w-full" onMouseEnter={onEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && createPortal(
        <div
          role="tooltip"
          aria-hidden="true"
          className="pointer-events-none fixed flex items-center gap-1.5 whitespace-nowrap select-none rounded-lg bg-[var(--sidebar-tooltip-background)] px-2.5 py-1.5 text-xs font-medium text-[var(--sidebar-tooltip-foreground)] shadow-xl z-[9999]"
          style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
        >
          {label}
          {badge !== undefined && (
            <span className="rounded-full bg-[var(--sidebar-tooltip-badge-background)] px-1.5 py-px text-[9px] font-bold leading-none">{badge}</span>
          )}
          {/* Arrow pointing left toward the sidebar */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[var(--sidebar-tooltip-background)]" />
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Status ─────────────────────────────────────────────────────────────────────

const statusDot: Record<NonNullable<SidebarUser["status"]>, string> = {
  online:  "bg-emerald-500",
  away:    "bg-amber-400",
  busy:    "bg-red-500",
  offline: "bg-zinc-400",
};
const statusLabel: Record<NonNullable<SidebarUser["status"]>, string> = {
  online: "Online", away: "Ausente", busy: "Ocupado", offline: "Offline",
};

// ── Announcement card ─────────────────────────────────────────────────────────

const annStyles: Record<NonNullable<SidebarAnnouncement["variant"]>, { bar: string; bg: string; title: string; body: string }> = {
  neutral: { bar: "bg-zinc-400",    bg: "bg-zinc-50",    title: "text-zinc-800",    body: "text-zinc-500"    },
  info:    { bar: "bg-blue-500",    bg: "bg-blue-50",    title: "text-blue-900",    body: "text-blue-600"    },
  warning: { bar: "bg-amber-400",   bg: "bg-amber-50",   title: "text-amber-900",   body: "text-amber-700"   },
  success: { bar: "bg-emerald-500", bg: "bg-emerald-50", title: "text-emerald-900", body: "text-emerald-700" },
  danger:  { bar: "bg-red-500",     bg: "bg-red-50",     title: "text-red-900",     body: "text-red-600"     },
};

function AnnouncementCard({ item, onDismiss }: { item: SidebarAnnouncement; onDismiss?: () => void }) {
  const [visible, setVisible] = useState(true);
  const s = annStyles[item.variant ?? "neutral"];
  const Icon = item.icon;

  if (!visible) return null;

  return (
    <div className={`relative overflow-hidden rounded-xl ${s.bg} ring-1 ring-black/[0.05]`}>
      {/* barra colorida à esquerda */}
      <div className={`absolute inset-y-0 left-0 w-1 ${s.bar} rounded-l-xl`} />
      <div className="pl-4 pr-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {Icon && (
              <span className={`mt-0.5 shrink-0 ${s.body}`}><Icon size={13} strokeWidth={2} /></span>
            )}
            <div className="min-w-0 flex-1">
              {item.title && (
                <p className={`text-xs font-semibold leading-snug ${s.title}`}>{item.title}</p>
              )}
              <p className={`text-[11px] leading-snug mt-0.5 ${s.body}`}>{item.body}</p>
              {item.timestamp && (
                <p className={`text-[10px] mt-1.5 opacity-60 ${s.body}`}>{item.timestamp}</p>
              )}
              {item.action && (
                <button
                  type="button"
                  onClick={item.action.onClick}
                  className={`mt-2 text-[11px] font-semibold underline underline-offset-2 hover:opacity-75 transition-opacity ${s.title}`}
                >
                  {item.action.label} →
                </button>
              )}
            </div>
          </div>
          {item.dismissible && (
            <button
              type="button"
              aria-label="Dispensar"
              onClick={() => { setVisible(false); onDismiss?.(); }}
              className={`shrink-0 mt-0.5 rounded p-0.5 opacity-50 hover:opacity-100 transition-opacity ${s.title}`}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────

// ── Pinned section ───────────────────────────────────────────────────────────

function PinnedSection({ groups, onNavigate }: { groups: SidebarNavGroup[]; onNavigate?: (href: string) => void }) {
  const { collapsed, pinnedIds, togglePin } = useSidebar();
  if (pinnedIds.size === 0) return null;

  const pinned = flattenNavItems(groups).filter((item) => pinnedIds.has(getItemPinId(item)));
  if (pinned.length === 0) return null;

  return (
    <div className="pb-1">
      {!collapsed && (
        <div className="flex items-center gap-1.5 px-2.5 mb-1">
          <Pin size={9} className="text-[var(--sidebar-group-foreground)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sidebar-group-foreground)]">Fixados</span>
        </div>
      )}
      <div className="space-y-0.5">
        {pinned.map((item) => {
          const id = getItemPinId(item);
          const Icon = item.icon;
          const row = (
            <a
              href={item.href ?? undefined}
              className={[
                `group/pin flex items-center rounded-lg py-2 transition-colors ${collapsed ? "justify-center px-2" : "gap-2.5 px-2.5"}`,
                "text-[var(--sidebar-item-foreground)] hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)]",
              ].join(" ")}
              onClick={(e) => { if (onNavigate && item.href) { e.preventDefault(); onNavigate(item.href); } }}
            >
              {Icon ? (
                <span className="shrink-0 text-[var(--sidebar-icon-foreground)]"><Icon size={16} strokeWidth={1.75} /></span>
              ) : (
                <span className="shrink-0 flex items-center justify-center"><Pin size={12} className="text-[var(--sidebar-icon-foreground)]" /></span>
              )}
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-sm">{item.label}</span>
                  <button
                    type="button"
                    title="Desafixar"
                    onClick={(e) => { e.stopPropagation(); togglePin(id); }}
                    className="shrink-0 rounded p-0.5 opacity-0 group-hover/pin:opacity-100 text-[var(--sidebar-pin-foreground)] hover:text-[var(--sidebar-pin-hover-foreground)] transition-opacity"
                  >
                    <X size={11} />
                  </button>
                </>
              )}
            </a>
          );
          return collapsed ? (
            <Tooltip key={id} label={item.label}>{row}</Tooltip>
          ) : (
            <div key={id}>{row}</div>
          );
        })}
      </div>
      <div className="mt-2 border-t border-[var(--sidebar-border)]" />
    </div>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────

function NavItem({ item, depth = 0, onNavigate }: { item: SidebarNavItem; depth?: number; onNavigate?: (href: string) => void }) {
  const { collapsed, pinnable, pinnedIds, togglePin } = useSidebar();
  const [subOpen, setSubOpen] = useState(false);
  const hasChildren = !!item.children?.length;
  const Icon = item.icon;

  const handleClick = () => {
    if (item.disabled) return;
    if (hasChildren) { setSubOpen((s) => !s); return; }
    item.onClick?.();
    if (onNavigate && item.href) onNavigate(item.href);
  };

  const rowBase = [
    "relative flex w-full items-center rounded-lg transition-all duration-150 select-none",
    depth > 0 ? "pl-[1.875rem] pr-2.5 py-1.5 gap-2" : collapsed ? "justify-center py-2 px-2" : "px-2.5 py-2 gap-2.5",
    item.disabled ? "cursor-not-allowed opacity-40 pointer-events-none" : "cursor-pointer",
    item.active
      ? "bg-[var(--sidebar-item-active-background)] text-[var(--sidebar-item-active-foreground)] shadow-sm"
      : "text-[var(--sidebar-item-foreground)] hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)]",
  ].filter(Boolean).join(" ");

  const itemPinId = getItemPinId(item);
  const isPinned = pinnedIds.has(itemPinId);
  const cid = item.componentId ? { "data-component-id": item.componentId } : {};

  // When pinnable, the icon (depth=0) fades on hover to reveal the pin overlay.
  // For depth>0 the pin lives in the indentation area so no fade needed on the dot.
  const iconFade = pinnable && !collapsed && depth === 0 && Icon
    ? isPinned ? "opacity-0" : "group-hover/nav:opacity-0"
    : "";

  const iconEl = Icon ? (
    <span className={`shrink-0 transition-all duration-150 ${item.active ? "text-[var(--sidebar-item-active-foreground)]" : "text-[var(--sidebar-icon-foreground)] group-hover/nav:text-[var(--sidebar-icon-hover-foreground)]"} ${iconFade}`}>
      <Icon size={16} strokeWidth={1.75} />
    </span>
  ) : depth > 0 ? (
    <span className={`shrink-0 h-1.5 w-1.5 rounded-full transition-all ${item.active ? "bg-[var(--sidebar-item-active-foreground)]" : "bg-[var(--sidebar-dot-background)] group-hover/nav:bg-[var(--sidebar-dot-hover-background)]"}`} />
  ) : null;

  const labelEl = (
    <span className={["flex flex-1 items-center justify-between gap-1.5 overflow-hidden transition-opacity duration-200 ease-out", collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"].join(" ")}>
      <span className="flex flex-col min-w-0">
        <span className="truncate text-sm leading-snug">{item.label}</span>
        {item.description && !collapsed && (
          <span className={`truncate text-[10px] leading-snug mt-0.5 ${item.active ? "text-[var(--sidebar-item-active-muted)]" : "text-[var(--sidebar-muted-foreground)]"}`}>{item.description}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {item.badge !== undefined && <SidebarBadge value={item.badge} variant={item.badgeVariant} />}
        {hasChildren && (
          <ChevronDown size={13} className={`text-[var(--sidebar-icon-foreground)] transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`} />
        )}
      </span>
    </span>
  );

  const rowContent = <>{iconEl}{labelEl}</>;

  const row = item.href && !hasChildren ? (
    <a
      href={item.disabled ? undefined : item.href}
      className={rowBase}
      onClick={(e) => { if (onNavigate && item.href && !item.disabled) { e.preventDefault(); handleClick(); } }}
      {...cid}
    >
      {rowContent}
    </a>
  ) : (
    <button type="button" className={rowBase} onClick={handleClick} disabled={item.disabled} {...cid}>
      {rowContent}
    </button>
  );

  // Pin button rendered as sibling (avoids button-inside-button).
  // depth=0: overlays the left icon (icon fades on hover, pin appears in its place).
  // depth>0: sits in the indentation gap (left-2), never touching the text.
  const pinBtn = pinnable && !collapsed && (Icon || depth > 0) ? (
    depth === 0 ? (
      <button
        type="button"
        title={isPinned ? "Desafixar" : "Fixar"}
        onClick={(e) => { e.stopPropagation(); togglePin(itemPinId); }}
        className={[
          "absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded transition-all z-10",
          isPinned
            ? "opacity-100 text-[var(--sidebar-pin-active-foreground)] hover:text-[var(--sidebar-pin-active-hover-foreground)]"
            : "opacity-0 group-hover/nav:opacity-100 text-[var(--sidebar-pin-foreground)] hover:text-[var(--sidebar-pin-hover-foreground)]",
        ].join(" ")}
      >
        {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
      </button>
    ) : (
      <button
        type="button"
        title={isPinned ? "Desafixar" : "Fixar"}
        onClick={(e) => { e.stopPropagation(); togglePin(itemPinId); }}
        className={[
          "absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 rounded transition-all z-10",
          isPinned
            ? "opacity-100 text-[var(--sidebar-pin-active-foreground)] hover:text-[var(--sidebar-pin-active-hover-foreground)]"
            : "opacity-0 group-hover/nav:opacity-100 text-[var(--sidebar-pin-foreground)] hover:text-[var(--sidebar-pin-hover-foreground)]",
        ].join(" ")}
      >
        {isPinned ? <PinOff size={10} /> : <Pin size={10} />}
      </button>
    )
  ) : null;

  const wrappedRow = (
    <div className="relative group/nav">
      {row}
      {pinBtn}
    </div>
  );

  return (
    <>
      {item.divider && <div className="my-1.5 border-t border-[var(--sidebar-border)]" />}
      {collapsed && depth === 0 ? (
        <Tooltip label={item.label} badge={item.badge}>{wrappedRow}</Tooltip>
      ) : wrappedRow}
      {/* Sub-items accordion */}
      {hasChildren && (
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: subOpen && !collapsed ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="pt-0.5 pb-1 space-y-0.5">
              {item.children!.map((child, ci) => (
                <NavItem key={child.id ?? `${child.label}-${ci}`} item={child} depth={depth + 1} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Nav Group ─────────────────────────────────────────────────────────────────

function NavGroup({ group, onNavigate }: { group: SidebarNavGroup; onNavigate?: (href: string) => void }) {
  const { collapsed, groupsCollapsible, collapsedGroupIds, toggleGroup } = useSidebar();
  const groupId = group.id ?? group.label ?? "group";
  const canCollapse = group.collapsible ?? groupsCollapsible;
  const open = !canCollapse || !collapsedGroupIds.has(groupId);

  return (
    <div>
      {group.label && (
        <div
          className={["flex items-center justify-between px-2.5 mb-1 overflow-hidden transition-opacity duration-200 ease-out", collapsed ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-10", canCollapse ? "cursor-pointer select-none group/grp" : ""].join(" ")}
          onClick={canCollapse ? () => toggleGroup(groupId) : undefined}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sidebar-group-foreground)] group-hover/grp:text-[var(--sidebar-group-hover-foreground)] transition-colors">
            {group.label}
          </span>
          {canCollapse && (
            <ChevronDown size={12} className={`text-[var(--sidebar-icon-foreground)] group-hover/grp:text-[var(--sidebar-icon-hover-foreground)] transition-all duration-300 ${open ? "" : "-rotate-90"}`} />
          )}
        </div>
      )}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5">
            {group.items.map((item, i) => (
              <NavItem key={item.id ?? `${item.label}-${i}`} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── User Popover ─────────────────────────────────────────────────────────────

function UserPopover({ user, footerItems }: { user: SidebarUser; footerItems: SidebarFooterItem[] }) {
  const { collapsed } = useSidebar();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const avatarEl = (
    <div className="relative shrink-0">
      <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-[var(--sidebar-avatar-background)] text-[var(--sidebar-avatar-foreground)] text-xs font-semibold ring-2 ring-[var(--sidebar-avatar-ring)]">
        {user.avatar
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          : <span>{user.initials ?? user.name.slice(0, 2).toUpperCase()}</span>}
      </div>
      {user.status && (
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${statusDot[user.status]} ring-2 ring-[var(--sidebar-avatar-ring)]`} />
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip label={`${user.name}${user.status ? ` · ${statusLabel[user.status]}` : ""}`}>
        <button
          type="button"
          aria-label="Menu do perfil"
          onClick={() => setOpen((s) => !s)}
          className="flex w-full justify-center py-1"
        >
          {avatarEl}
        </button>
      </Tooltip>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Menu do perfil"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center gap-2.5 rounded-xl bg-[var(--sidebar-user-background)] px-3 py-2.5 ring-1 ring-[var(--sidebar-user-border)] hover:bg-[var(--sidebar-user-hover-background)] transition-colors"
      >
        {avatarEl}
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-[var(--sidebar-user-name)] leading-snug">{user.name}</p>
          <p className="truncate text-[11px] text-[var(--sidebar-user-muted)] leading-snug">{user.role ?? user.email ?? ""}</p>
        </div>
        <ChevronDown size={13} className={`shrink-0 text-[var(--sidebar-icon-foreground)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Menu — opens upward */}
      <div
        role="menu"
        className={[
          "absolute bottom-full left-0 right-0 mb-2 rounded-xl bg-[var(--sidebar-popover-background)] text-[var(--sidebar-popover-foreground)] shadow-xl ring-1 ring-[var(--sidebar-popover-border)] overflow-hidden z-50",
          "transition-all duration-150 ease-out origin-bottom",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 px-3 py-3 border-b border-[var(--sidebar-border)]">
          {avatarEl}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--sidebar-user-name)] truncate">{user.name}</p>
            <p className="text-xs text-[var(--sidebar-user-muted)] truncate">{user.email ?? user.role ?? ""}</p>
          </div>
        </div>
        {footerItems.length > 0 && (
          <div className="py-1">
            {footerItems.map((fi, i) => {
              const Icon = fi.icon;
              const cls = [
                "group flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100",
                fi.danger
                  ? "text-[var(--sidebar-danger-foreground)] hover:bg-[var(--sidebar-danger-hover-background)] cursor-pointer"
                  : "text-[var(--sidebar-popover-foreground)] hover:bg-[var(--sidebar-popover-hover-background)] cursor-pointer",
              ].join(" ");
              const inner = (
                <>
                  <span className={`shrink-0 ${fi.danger ? "text-[var(--sidebar-danger-foreground)] group-hover:text-[var(--sidebar-danger-hover-foreground)]" : "text-[var(--sidebar-icon-foreground)] group-hover:text-[var(--sidebar-icon-hover-foreground)]"}`}>
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 text-left leading-snug">{fi.label}</span>
                </>
              );
              return fi.href ? (
                <a key={i} href={fi.href} className={cls} role="menuitem" {...(fi.componentId ? { "data-component-id": fi.componentId } : {})}>
                  {inner}
                </a>
              ) : (
                <button key={i} type="button" role="menuitem" className={cls} onClick={() => { setOpen(false); fi.onClick?.(); }} {...(fi.componentId ? { "data-component-id": fi.componentId } : {})}>
                  {inner}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Footer Item ───────────────────────────────────────────────────────────────

function FooterItem({ item }: { item: SidebarFooterItem }) {
  const { collapsed } = useSidebar();
  const Icon = item.icon;

  const btn = (
    <button
      type="button"
      onClick={item.onClick}
      className={[
        "group/fi flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150",
        item.danger
          ? "text-[var(--sidebar-danger-foreground)] hover:bg-[var(--sidebar-danger-hover-background)] hover:text-[var(--sidebar-danger-hover-foreground)]"
          : "text-[var(--sidebar-item-foreground)] hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)]",
      ].join(" ")}
      {...(item.componentId ? { "data-component-id": item.componentId } : {})}
    >
      <span className={`shrink-0 transition-colors ${item.danger ? "text-[var(--sidebar-danger-foreground)] group-hover/fi:text-[var(--sidebar-danger-hover-foreground)]" : "text-[var(--sidebar-icon-foreground)] group-hover/fi:text-[var(--sidebar-icon-hover-foreground)]"}`}>
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span className={["truncate text-sm leading-none transition-opacity duration-200 ease-out", collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"].join(" ")}>
        {item.label}
      </span>
    </button>
  );

  return collapsed ? <Tooltip label={item.label}>{btn}</Tooltip> : btn;
}

// ── Sidebar (main export) ─────────────────────────────────────────────────────

export default function Sidebar({
  pinnable = false,
  pinsStorageKey = "sidebar-pins",
  logo,
  title,
  subtitle,
  headerExtra,
  announcements = [],
  groups = [],
  groupsCollapsible = false,
  groupsStorageKey = "sidebar-groups",
  onNavigate,
  user,
  footerItems = [],
  footerExtra,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  collapsible = true,
  mobileOpen = false,
  onMobileOpenChange,
  className = "",
  isolated = false,
  canAccess,
}: SidebarProps) {
  const visibleGroups = canAccess ? filterNavGroups(groups, canAccess) : groups;
  const visibleFooterItems = canAccess
    ? footerItems.filter((fi) => !fi.componentId || canAccess(fi.componentId))
    : footerItems;

  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const shellRaw = useShell();
  // Isolated sidebars (demos/previews) never connect to the shell so they
  // don't affect the app header layout or mobile drawer behaviour.
  const shell = isolated ? null : shellRaw;

  // Register this sidebar with the shell context (so Header knows one is present)
  useLayoutEffect(() => {
    if (shell) return shell._registerSidebar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve collapsed state: shell > controlled prop > internal
  const isCollapsed = shell
    ? shell.sidebarCollapsed
    : controlledCollapsed !== undefined
    ? controlledCollapsed
    : internalCollapsed;

  // Resolve mobile open state
  const isMobileOpen = shell ? shell.mobileSidebarOpen : mobileOpen;
  const closeMobile = () => {
    if (shell) shell.setMobileSidebarOpen(false);
    else onMobileOpenChange?.(false);
  };

  const toggle = useCallback(() => {
    if (shell) {
      shell.toggleSidebar();
    } else {
      const next = !isCollapsed;
      setInternalCollapsed(next);
      onCollapsedChange?.(next);
    }
  }, [shell, isCollapsed, onCollapsedChange]);

  // ── Pins state (localStorage-backed) ──────────────────────────────────────
  // Always start empty to match the SSR-rendered HTML, then hydrate from
  // localStorage in a useEffect to avoid hydration mismatches.
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(
    () => new Set(groups.filter((group) => group.defaultCollapsed).map((group) => group.id ?? group.label ?? "group"))
  );

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((id: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Load persisted pins from localStorage after first mount
  useEffect(() => {
    if (!pinnable) return;
    try {
      const stored = localStorage.getItem(pinsStorageKey);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        if (ids.length > 0) queueMicrotask(() => setPinnedIds(new Set(ids)));
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pinnable) return;
    try {
      if (pinnedIds.size > 0) localStorage.setItem(pinsStorageKey, JSON.stringify([...pinnedIds]));
      else localStorage.removeItem(pinsStorageKey);
    } catch {}
  }, [pinnedIds, pinsStorageKey, pinnable]);

  useEffect(() => {
    if (!groupsCollapsible) return;
    try {
      const stored = localStorage.getItem(groupsStorageKey);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        queueMicrotask(() => setCollapsedGroupIds(new Set(ids)));
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!groupsCollapsible) return;
    try {
      if (collapsedGroupIds.size > 0) localStorage.setItem(groupsStorageKey, JSON.stringify([...collapsedGroupIds]));
      else localStorage.removeItem(groupsStorageKey);
    } catch {}
  }, [collapsedGroupIds, groupsCollapsible, groupsStorageKey]);

  return (
    <SidebarContext.Provider value={{ collapsed: isCollapsed, pinnable, pinnedIds, groupsCollapsible, collapsedGroupIds, togglePin, toggleGroup }}>
      {/* Mobile backdrop */}
      <div
        className={["fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300", isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"].join(" ")}
        onClick={closeMobile}
      />

      {/* Desktop spacer — in-flow vazio, apenas reserva largura no layout */}
      <div
        aria-hidden
        className="hidden md:block shrink-0 bg-[var(--sidebar-background)] border-r border-[var(--sidebar-border)]"
        style={{
          width: isCollapsed ? "4.5rem" : "16rem",
          transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Sidebar panel */}
      <aside
        className={[
          "flex flex-col h-full overflow-visible bg-[var(--sidebar-background)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)]",
          isCollapsed ? "w-[4.5rem]" : "w-64",
          // Sempre fixed — no mobile: cobre a tela; no desktop: abaixo do header
          "fixed inset-y-0 left-0 z-[70] shadow-[var(--sidebar-shadow)]",
          "md:top-16 md:shadow-none md:z-30",
          // Mobile: anima translateX | Desktop: anima width sem impacto no layout do doc
          "transition-[transform,width] duration-300 ease-out",
          "md:transition-[width] md:duration-[250ms] md:[will-change:width]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        ].join(" ")}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className={[
          "relative flex shrink-0 border-b border-[var(--sidebar-border)]",
          isCollapsed ? "flex-col items-center gap-2 py-3 px-2" : "flex-row items-center gap-2 py-4 px-4",
        ].join(" ")}>
          {/* Toggle — first slot in collapsed (top), last in expanded (right) */}
          {collapsible && (
            <button
              type="button"
              onClick={toggle}
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
              title={isCollapsed ? "Expandir" : "Recolher"}
              className={[
                "hidden md:flex shrink-0 items-center justify-center text-[var(--sidebar-toggle-foreground)]  hover:bg-[var(--sidebar-toggle-hover-background)] hover:text-[var(--sidebar-toggle-hover-foreground)] transition-colors",
                isCollapsed
                  ? "rounded-lg p-1.5"
                  : "absolute right-0 top-1/2 z-20 h-7 w-7 -translate-y-1/2 translate-x-1/2 rounded-full border border-[var(--sidebar-border)] bg-[var(--sidebar-background)] shadow-[0_10px_24px_rgba(15,23,42,0.18)]",
              ].join(" ")}
            >
              <ArrowLeftFromLine size={15} className={["transition-transform duration-300 ease-out", isCollapsed ? "rotate-180" : ""].join(" ")} />
            </button>
          )}

          {/* Logo — second slot in collapsed, first in expanded */}
          {logo && (
            <div className="shrink-0">
              {isCollapsed && title
                ? <Tooltip label={title}><div>{logo}</div></Tooltip>
                : logo}
            </div>
          )}

          {/* Title + subtitle — expanded only */}
          <div className={["flex-1 min-w-0 overflow-hidden transition-opacity duration-200 ease-out", isCollapsed ? "hidden" : "opacity-100"].join(" ")}>
            {title && <p className="truncate text-sm font-bold text-[var(--sidebar-foreground)] leading-snug">{title}</p>}
            {subtitle && <p className="truncate text-[11px] text-[var(--sidebar-muted-foreground)]">{subtitle}</p>}
          </div>

          {/* headerExtra — expanded only */}
          {headerExtra && (
            <div className={["min-w-0 overflow-hidden transition-opacity duration-200 ease-out", isCollapsed ? "hidden" : "flex-1  pr-3 opacity-100"].join(" ")}>
              {headerExtra}
            </div>
          )}

          {/* Mobile close button */}
          <button type="button" aria-label="Fechar menu" onClick={closeMobile} className="md:hidden rounded-lg p-1.5 shrink-0 text-[var(--sidebar-toggle-foreground)] hover:bg-[var(--sidebar-toggle-hover-background)] hover:text-[var(--sidebar-toggle-hover-foreground)] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* ── Body (scrollável) ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-3 space-y-4">
          {/* Announcements — ocultos no modo collapsed */}
          {announcements.length > 0 && (
            <div className={["space-y-2 transition-opacity duration-200 ease-out", isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"].join(" ")}>
              {announcements.map((a) => (
                <AnnouncementCard key={a.id} item={a} />
              ))}
            </div>
          )}

          {/* Grupos de navegação */}
          {visibleGroups.length > 0 && (
            <nav aria-label="Sidebar navigation" className="space-y-4">
              {/* Pinned items section */}
              {pinnable && <PinnedSection groups={visibleGroups} onNavigate={onNavigate} />}
              {visibleGroups.map((g, gi) => (
                <NavGroup key={g.id ?? `g-${gi}`} group={g} onNavigate={onNavigate} />
              ))}
            </nav>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-[var(--sidebar-border)] px-2 py-3 space-y-0.5">
          {!user && visibleFooterItems.map((fi, i) => (
            <FooterItem key={`fi-${i}`} item={fi} />
          ))}
          {footerExtra && <div className={["pt-2 overflow-hidden transition-opacity duration-200 ease-out", isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"].join(" ")}>{footerExtra}</div>}
          {user && (
            <div className="pt-2">
              <UserPopover user={user} footerItems={visibleFooterItems} />
            </div>
          )}
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}
