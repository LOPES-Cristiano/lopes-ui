"use client";

import React, { createContext, useContext, useState, useCallback, useLayoutEffect, useEffect } from "react";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Pin,
  PinOff,
  type LucideIcon,
} from "lucide-react";
import { useShell } from "@/components/ShellContext";

// ── Context ───────────────────────────────────────────────────────────────────

type SidebarCtx = {
  collapsed: boolean;
  pinnable: boolean;
  pinnedIds: Set<string>;
  togglePin: (id: string) => void;
};
const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  pinnable: false,
  pinnedIds: new Set(),
  togglePin: () => {},
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
  return (
    <div className="relative group/tt w-full">
      {children}
      <div
        role="tooltip"
        className={[
          "pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2",
          "flex items-center gap-1.5 whitespace-nowrap select-none",
          "rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl",
          "opacity-0 scale-95 group-hover/tt:opacity-100 group-hover/tt:scale-100",
          "transition-all duration-150 ease-out",
        ].join(" ")}
      >
        {label}
        {badge !== undefined && (
          <span className="rounded-full bg-white/20 px-1.5 py-px text-[9px] font-bold leading-none">{badge}</span>
        )}
        {/* seta */}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-zinc-900" />
      </div>
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
          <Pin size={9} className="text-zinc-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Fixados</span>
        </div>
      )}
      <div className="space-y-0.5">
        {pinned.map((item) => {
          const id = getItemPinId(item);
          const Icon = item.icon;
          const row = (
            <div
              className={[
            "group/pin flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
            "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
            "dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          ].join(" ")}
              onClick={() => { if (onNavigate && item.href) onNavigate(item.href); else if (item.href) window.location.hash = item.href.replace(/.*#/, ""); }}
            >
              {Icon ? (
                <span className="shrink-0 text-zinc-400"><Icon size={16} strokeWidth={1.75} /></span>
              ) : (
                <span className="shrink-0 flex items-center justify-center"><Pin size={12} className="text-zinc-300" /></span>
              )}
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-sm">{item.label}</span>
                  <button
                    type="button"
                    title="Desafixar"
                    onClick={(e) => { e.stopPropagation(); togglePin(id); }}
                    className="shrink-0 rounded p-0.5 opacity-0 group-hover/pin:opacity-100 text-zinc-300 hover:text-zinc-500 transition-opacity"
                  >
                    <X size={11} />
                  </button>
                </>
              )}
            </div>
          );
          return collapsed ? (
            <Tooltip key={id} label={item.label}>{row}</Tooltip>
          ) : (
            <div key={id}>{row}</div>
          );
        })}
      </div>
      <div className="mt-2 border-t border-zinc-100 dark:border-zinc-800" />
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
    depth > 0 ? "pl-[1.875rem] pr-2.5 py-1.5 gap-2" : "px-2.5 py-2 gap-2.5",
    item.disabled ? "cursor-not-allowed opacity-40 pointer-events-none" : "cursor-pointer",
    item.active
      ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
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
    <span className={`shrink-0 transition-all duration-150 ${item.active ? "text-white dark:text-zinc-900" : "text-zinc-400 dark:text-zinc-400 group-hover/nav:text-zinc-600 dark:group-hover/nav:text-zinc-200"} ${iconFade}`}>
      <Icon size={16} strokeWidth={1.75} />
    </span>
  ) : depth > 0 ? (
    <span className={`shrink-0 h-1.5 w-1.5 rounded-full transition-all ${item.active ? "bg-white dark:bg-zinc-900" : "bg-zinc-300 dark:bg-zinc-500 group-hover/nav:bg-zinc-600 dark:group-hover/nav:bg-zinc-300"}`} />
  ) : null;

  const labelEl = (
    <span className={["flex flex-1 items-center justify-between gap-1.5 overflow-hidden transition-[opacity,max-width] duration-200", collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"].join(" ")}>
      <span className="flex flex-col min-w-0">
        <span className="truncate text-sm leading-snug">{item.label}</span>
        {item.description && !collapsed && (
          <span className={`truncate text-[10px] leading-snug mt-0.5 ${item.active ? "text-white/60 dark:text-zinc-900/60" : "text-zinc-400 dark:text-zinc-500"}`}>{item.description}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {item.badge !== undefined && <SidebarBadge value={item.badge} variant={item.badgeVariant} />}
        {hasChildren && (
          <ChevronDown size={13} className={`text-zinc-400 transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`} />
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
            ? "opacity-100 text-amber-500 hover:text-amber-700"
            : "opacity-0 group-hover/nav:opacity-100 text-zinc-400 hover:text-zinc-600",
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
            ? "opacity-100 text-amber-500 hover:text-amber-700"
            : "opacity-0 group-hover/nav:opacity-100 text-zinc-400 hover:text-zinc-600",
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
      {item.divider && <div className="my-1.5 border-t border-zinc-100" />}
      {collapsed && depth === 0 ? (
        <Tooltip label={item.label} badge={item.badge}>{wrappedRow}</Tooltip>
      ) : wrappedRow}
      {/* Sub-items accordion */}
      {hasChildren && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-in-out"
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
  const { collapsed } = useSidebar();
  const [open, setOpen] = useState(!group.defaultCollapsed);

  return (
    <div>
      {group.label && !collapsed && (
        <div
          className={["flex items-center justify-between px-2.5 mb-1", group.collapsible ? "cursor-pointer select-none group/grp" : ""].join(" ")}
          onClick={group.collapsible ? () => setOpen((s) => !s) : undefined}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-hover/grp:text-zinc-600 dark:group-hover/grp:text-zinc-400 transition-colors">
            {group.label}
          </span>
          {group.collapsible && (
            <ChevronDown size={12} className={`text-zinc-300 dark:text-zinc-500 group-hover/grp:text-zinc-400 transition-all duration-200 ${open ? "" : "-rotate-90"}`} />
          )}
        </div>
      )}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
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

// ── User Block ────────────────────────────────────────────────────────────────

function UserBlock({ user }: { user: SidebarUser }) {
  const { collapsed } = useSidebar();

  const avatarEl = (
    <div className="relative shrink-0">
      <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 text-zinc-700 dark:text-zinc-300 text-xs font-semibold ring-2 ring-white dark:ring-zinc-950">
        {user.avatar
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          : <span>{user.initials ?? user.name.slice(0, 2).toUpperCase()}</span>}
      </div>
      {user.status && (
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${statusDot[user.status]} ring-2 ring-white dark:ring-zinc-950`} />
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip label={`${user.name}${user.status ? ` · ${statusLabel[user.status]}` : ""}`}>
        <div className="flex justify-center py-1">{avatarEl}</div>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2.5 ring-1 ring-zinc-100 dark:ring-zinc-800">
      {avatarEl}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{user.name}</p>
        <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500 leading-snug">{user.role ?? user.email ?? ""}</p>
      </div>
      {user.status && (
        <div className="shrink-0 flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${statusDot[user.status]}`} />
          <span className="text-[10px] text-zinc-400 capitalize">{statusLabel[user.status]}</span>
        </div>
      )}
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
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50",
      ].join(" ")}
      {...(item.componentId ? { "data-component-id": item.componentId } : {})}
    >
      <span className={`shrink-0 transition-colors ${item.danger ? "text-red-400 group-hover/fi:text-red-500" : "text-zinc-400 dark:text-zinc-400 group-hover/fi:text-zinc-600 dark:group-hover/fi:text-zinc-200"}`}>
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span className={["truncate text-sm leading-none transition-[opacity,max-width] duration-200", collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"].join(" ")}>
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
}: SidebarProps) {
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
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (!pinnable || typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(pinsStorageKey);
      if (stored) return new Set(JSON.parse(stored) as string[]);
    } catch {}
    return new Set();
  });

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!pinnable) return;
    try {
      if (pinnedIds.size > 0) localStorage.setItem(pinsStorageKey, JSON.stringify([...pinnedIds]));
      else localStorage.removeItem(pinsStorageKey);
    } catch {}
  }, [pinnedIds, pinsStorageKey, pinnable]);

  return (
    <SidebarContext.Provider value={{ collapsed: isCollapsed, pinnable, pinnedIds, togglePin }}>
      {/* Mobile backdrop */}
      <div
        className={["fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300", isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"].join(" ")}
        onClick={closeMobile}
      />

      {/* Sidebar panel */}
      <aside
        className={[
          "flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800",
          "duration-300 ease-in-out",
          isCollapsed ? "w-[4.5rem]" : "w-64",
          "fixed inset-y-0 left-0 z-[70] shadow-xl",
          "md:relative md:z-auto md:inset-auto md:shadow-none",
          "transition-transform md:transition-[width]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        ].join(" ")}
      >
        {/* ── Header (hidden when Shell is managing it) ──────────────── */}
        {!shell && (
        <div className={["flex shrink-0 items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 py-4", isCollapsed ? "justify-center px-2" : "px-4"].join(" ")}>
          {logo && (
            <div className="shrink-0">
              {isCollapsed && title
                ? <Tooltip label={title}><div>{logo}</div></Tooltip>
                : logo}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              {title && <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{title}</p>}
              {subtitle && <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">{subtitle}</p>}
            </div>
          )}
          {headerExtra && !isCollapsed && <div className="shrink-0">{headerExtra}</div>}
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={closeMobile} className="md:hidden rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <X size={15} />
            </button>
            {collapsible && (
              <button type="button" onClick={toggle} className="hidden md:flex rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" title={isCollapsed ? "Expandir" : "Recolher"}>
                {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </button>
            )}
          </div>
        </div>
        )}

        {/* ── Body (scrollável) ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-3 space-y-4">
          {/* Announcements — ocultos no modo collapsed */}
          {!isCollapsed && announcements.length > 0 && (
            <div className="space-y-2">
              {announcements.map((a) => (
                <AnnouncementCard key={a.id} item={a} />
              ))}
            </div>
          )}

          {/* Grupos de navegação */}
          {groups.length > 0 && (
            <nav aria-label="Sidebar navigation" className="space-y-4">
              {/* Pinned items section */}
              {pinnable && <PinnedSection groups={groups} onNavigate={onNavigate} />}
              {groups.map((g, gi) => (
                <NavGroup key={g.id ?? `g-${gi}`} group={g} onNavigate={onNavigate} />
              ))}
            </nav>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 px-2 py-3 space-y-0.5">
          {shell && collapsible && (
            <button
              type="button"
              onClick={toggle}
              title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
              className={[
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2",
                "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300",
                "transition-colors",
                isCollapsed ? "justify-center" : "",
              ].join(" ")}
            >
              {isCollapsed ? <PanelLeftOpen size={16} strokeWidth={1.75} /> : <PanelLeftClose size={16} strokeWidth={1.75} />}
              {!isCollapsed && <span className="text-sm">Recolher</span>}
            </button>
          )}
          {footerItems.map((fi, i) => (
            <FooterItem key={`fi-${i}`} item={fi} />
          ))}
          {footerExtra && !isCollapsed && <div className="pt-2">{footerExtra}</div>}
          {user && (
            <div className="pt-2">
              <UserBlock user={user} />
            </div>
          )}
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}
