"use client";

import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Check, ChevronRight, Circle, type LucideIcon } from "lucide-react";
import { calcCursorPos, calcSubMenuPos } from "@/hooks/useSmartPosition";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContextMenuItemType = "item" | "checkbox" | "radio";

export type ContextMenuItem = {
  /** Unique key */
  id?: string;
  label?: string;
  /** Optional group/section header rendered above this item */
  sectionTitle?: string;
  /** Item type: standard action, checkbox toggle, or radio option */
  type?: ContextMenuItemType;
  /** Checked state when type is "checkbox" or "radio" */
  checked?: boolean;
  /** Called when checkbox/radio state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Decorative icon */
  icon?: LucideIcon;
  /** Keyboard shortcut shown on the right, e.g. "⌘K", "Ctrl+S" */
  shortcut?: string;
  /** Secondary description below the label */
  description?: string;
  disabled?: boolean;
  /** Visual separator rendered BEFORE this item */
  divider?: boolean;
  /** Red danger style */
  danger?: boolean;
  onClick?: () => void;
  /** Nested sub-menu items */
  children?: ContextMenuItem[];
  /** Access-control identifier — emitted as data-component-id */
  componentId?: string;
  /** If false, disables the item instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type ContextMenuTrigger = "contextmenu" | "click" | "both";

export type ContextMenuProps = {
  /** Items to render in the menu */
  items: ContextMenuItem[];
  /** What event opens the menu (default: "contextmenu") */
  trigger?: ContextMenuTrigger;
  children: React.ReactNode;
  /** Called when any item is selected */
  onSelect?: (item: ContextMenuItem) => void;
  disabled?: boolean;
  className?: string;
  header?: React.ReactNode;
  /** Access-control identifier for the context menu */
  componentId?: string;
};

// ── Position ──────────────────────────────────────────────────────────────────

type Pos = { x: number; y: number };

const MENU_W  = 224; // min-w-56
const ITEM_H  = 34;
const MENU_PAD = 16; // top + bottom padding

// ── Sub-menu context ──────────────────────────────────────────────────────────

const CloseCtx = createContext<() => void>(() => {});

function filterContextMenuItems(
  items: ContextMenuItem[],
  canAccess: (id: string) => boolean
): ContextMenuItem[] {
  const result: ContextMenuItem[] = [];
  for (const item of items) {
    const allowed = !item.componentId || canAccess(item.componentId);
    if (!allowed && item.hideIfDenied !== false) {
      continue;
    }
    const filteredChildren = item.children
      ? filterContextMenuItems(item.children, canAccess)
      : undefined;
    if (item.children && item.children.length > 0 && (!filteredChildren || filteredChildren.length === 0)) {
      continue;
    }
    result.push({
      ...item,
      disabled: Boolean(item.disabled || !allowed),
      children: filteredChildren,
    });
  }
  return result;
}

// ── Menu item ─────────────────────────────────────────────────────────────────

function MenuItem({
  item,
  onSelect,
  onCloseSub,
}: {
  item: ContextMenuItem;
  onSelect?: (item: ContextMenuItem) => void;
  onCloseSub?: () => void;
}) {
  const close = useContext(CloseCtx);
  const [subVisible, setSubVisible] = useState(false);
  const [subPlacement, setSubPlacement] = useState<{ side: "left" | "right"; topOffset: number }>({
    side: "right",
    topOffset: -4,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const hasChildren = !!item.children?.length;
  const Icon = item.icon;
  const itemType = item.type ?? "item";

  function revealSub(focusFirst = false) {
    if (btnRef.current) {
      const subH = (item.children?.length ?? 0) * ITEM_H + MENU_PAD;
      setSubPlacement(calcSubMenuPos(btnRef.current.getBoundingClientRect(), MENU_W, subH));
    }
    setSubVisible(true);
    if (focusFirst) {
      requestAnimationFrame(() => {
        const first = subRef.current?.querySelector<HTMLElement>("[role^='menuitem']:not([disabled])");
        first?.focus();
      });
    }
  }

  function hideSub(returnFocus = false) {
    setSubVisible(false);
    if (returnFocus) {
      btnRef.current?.focus();
    }
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (item.disabled) return;
    if (hasChildren) {
      revealSub(true);
      return;
    }
    if (itemType === "checkbox") {
      item.onCheckedChange?.(!item.checked);
    } else if (itemType === "radio") {
      item.onCheckedChange?.(true);
    }
    item.onClick?.();
    onSelect?.(item);
    close();
  }

  const itemCls = twMerge(
    "group/mi relative flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm select-none outline-none transition-colors duration-100",
    item.disabled
      ? "cursor-not-allowed opacity-40 pointer-events-none"
      : item.danger
        ? "cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 dark:focus:bg-red-950/40"
        : "cursor-pointer text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800",
  );

  const inner = (
    <>
      {itemType === "checkbox" ? (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
          {item.checked ? <Check size={14} strokeWidth={2.5} /> : null}
        </span>
      ) : itemType === "radio" ? (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
          {item.checked ? <Circle size={8} className="fill-current" /> : null}
        </span>
      ) : Icon ? (
        <span className={twMerge("shrink-0", item.danger ? "text-red-400 dark:text-red-500" : "text-zinc-400 dark:text-zinc-500 group-hover/mi:text-zinc-600 dark:group-hover/mi:text-zinc-300")}>
          <Icon size={14} strokeWidth={1.75} />
        </span>
      ) : null}
      <span className="flex flex-1 flex-col min-w-0 text-left">
        <span className="truncate leading-snug font-medium">{item.label}</span>
        {item.description && (
          <span className="truncate text-[11px] text-zinc-400 dark:text-zinc-500 leading-snug mt-0.5">{item.description}</span>
        )}
      </span>
      {item.shortcut && !hasChildren && (
        <span className="ml-auto shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">{item.shortcut}</span>
      )}
      {hasChildren && (
        <ChevronRight size={12} className="ml-auto shrink-0 text-zinc-400" />
      )}
    </>
  );

  const ariaRole =
    itemType === "checkbox"
      ? "menuitemcheckbox"
      : itemType === "radio"
        ? "menuitemradio"
        : "menuitem";

  if (hasChildren) {
    return (
      <div
        className="relative group/sub"
        onMouseEnter={() => revealSub(false)}
        onMouseLeave={() => setSubVisible(false)}
      >
        <button
          data-component-id={item.componentId ?? (item.id ? `erp.context-menu.${item.id}` : "erp.context-menu.item")}
          ref={btnRef}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          aria-expanded={subVisible}
          aria-haspopup="menu"
          className={itemCls}
          tabIndex={item.disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              revealSub(true);
            } else if (e.key === "ArrowLeft" && onCloseSub) {
              e.preventDefault();
              e.stopPropagation();
              onCloseSub();
            }
          }}
        >
          {inner}
        </button>
        {subVisible && (
          <div
            ref={subRef}
            style={{
              top: subPlacement.topOffset,
              ...(subPlacement.side === "right"
                ? { left: "100%", marginLeft: 2 }
                : { right: "100%", marginRight: 2 }),
            }}
            className="absolute z-[120] min-w-[180px] rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
            role="menu"
          >
            {item.children!.map((child, ci) => (
              <React.Fragment key={child.id ?? `${child.label}-${ci}`}>
                {child.divider && <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />}
                {child.sectionTitle && (
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {child.sectionTitle}
                  </div>
                )}
                <MenuItem
                  item={child}
                  onSelect={onSelect}
                  onCloseSub={() => hideSub(true)}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      data-component-id={item.componentId ?? (item.id ? `erp.context-menu.${item.id}` : "erp.context-menu.item")}
      type="button"
      role={ariaRole}
      disabled={item.disabled}
      aria-checked={itemType === "checkbox" || itemType === "radio" ? Boolean(item.checked) : undefined}
      tabIndex={item.disabled ? -1 : 0}
      className={itemCls}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        } else if (e.key === "ArrowLeft" && onCloseSub) {
          e.preventDefault();
          e.stopPropagation();
          onCloseSub();
        }
      }}
    >
      {inner}
    </button>
  );
}

// ── Menu panel ────────────────────────────────────────────────────────────────

function MenuPanel({
  items,
  pos,
  onSelect,
  onClose,
  header,
  panelRef,
  componentId,
}: {
  items: ContextMenuItem[];
  pos: Pos;
  onSelect?: (item: ContextMenuItem) => void;
  onClose: () => void;
  header?: React.ReactNode;
  panelRef: React.RefObject<HTMLDivElement | null>;
  componentId?: string;
}) {
  // Focus trap + keyboard nav
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const focusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>("[role^='menuitem']:not([disabled])"));
    focusable()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      const activeMenu = (document.activeElement as HTMLElement | null)?.closest("[role='menu']") ?? el;
      const menuItems = Array.from(
        activeMenu!.querySelectorAll<HTMLElement>(":scope > [role^='menuitem']:not([disabled]), :scope > div > [role^='menuitem']:not([disabled])")
      );
      const list = menuItems.length > 0 ? menuItems : focusable();
      const idx = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") { e.preventDefault(); list[(idx + 1) % list.length]?.focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); list[(idx - 1 + list.length) % list.length]?.focus(); }
      if (e.key === "Home")      { e.preventDefault(); list[0]?.focus(); }
      if (e.key === "End")       { e.preventDefault(); list[list.length - 1]?.focus(); }
      if (e.key === "Escape")    { e.preventDefault(); e.stopPropagation(); onClose(); }
      if (e.key === "Tab")       { e.preventDefault(); onClose(); }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [onClose, panelRef]);

  return (
    <div
      ref={panelRef}
      role="menu"
      data-component-id={componentId}
      data-floating-open="true"
      aria-label="Context menu"
      style={{ top: pos.y, left: pos.x, minWidth: MENU_W }}
      className="pointer-events-auto fixed z-[9999] rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] focus:outline-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {header && (
        <div className="px-1 py-1 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
          {header}
        </div>
      )}
      {items.map((item, i) => (
        <React.Fragment key={item.id ?? `${item.label}-${i}`}>
          {item.divider && <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />}
          {item.sectionTitle && (
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {item.sectionTitle}
            </div>
          )}
          <MenuItem item={item} onSelect={onSelect} />
        </React.Fragment>
      ))}
    </div>
  );
}

// ── ContextMenu (main export) ─────────────────────────────────────────────────

export default function ContextMenu({
  items,
  trigger = "contextmenu",
  children,
  onSelect,
  disabled = false,
  className,
  header,
  componentId,
}: ContextMenuProps) {
  const [pos, setPos] = useState<Pos | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const visibleItems = useMemo(
    () => filterContextMenuItems(items, canAccess),
    [items, canAccess]
  );

  const close = useCallback(() => setPos(null), []);

  function open(x: number, y: number) {
    if (disabled || !hasRootPermission || visibleItems.length === 0) return;
    setPos(calcCursorPos({ x, y }, MENU_W, visibleItems.length * ITEM_H + MENU_PAD));
  }

  function handleContextMenu(e: React.MouseEvent) {
    if (trigger === "click") return;
    e.preventDefault();
    e.stopPropagation();
    open(e.clientX, e.clientY);
  }

  function handleClick(e: React.MouseEvent) {
    if (trigger === "contextmenu") return;
    e.stopPropagation();
    open(e.clientX, e.clientY);
  }

  // Close on outside click / Escape / scroll / resize
  useEffect(() => {
    if (!pos) return;
    function handleMouseDown(e: MouseEvent) {
      if (panelRef.current?.contains(e.target as Node)) return;
      close();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    }
    function handleScroll(e: Event) {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      close();
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown",   handleKeyDown);
    document.addEventListener("scroll",    handleScroll, true);
    window.addEventListener("resize",      close);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown",   handleKeyDown);
      document.removeEventListener("scroll",    handleScroll, true);
      window.removeEventListener("resize",      close);
    };
  }, [pos, close]);

  return (
    <CloseCtx.Provider value={close}>
      <div
        className={twMerge("contents", className)}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {children}
      </div>
      {pos && typeof document !== "undefined" &&
        createPortal(
          <MenuPanel
            panelRef={panelRef}
            items={visibleItems}
            pos={pos}
            onSelect={onSelect}
            onClose={close}
            header={header}
            componentId={componentId}
          />,
          document.body,
        )
      }
    </CloseCtx.Provider>
  );
}
