"use client";

import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { calcCursorPos, calcSubMenuPos } from "@/hooks/useSmartPosition";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContextMenuItem = {
  /** Unique key */
  id?: string;
  label?: string;
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
};

// ── Position ──────────────────────────────────────────────────────────────────

type Pos = { x: number; y: number };

const MENU_W  = 224; // min-w-56
const ITEM_H  = 34;
const MENU_PAD = 16; // top + bottom padding

// ── Sub-menu context ──────────────────────────────────────────────────────────

const CloseCtx = createContext<() => void>(() => {});

// ── Menu item ─────────────────────────────────────────────────────────────────

function MenuItem({
  item,
  onSelect,
}: {
  item: ContextMenuItem;
  onSelect?: (item: ContextMenuItem) => void;
}) {
  const close = useContext(CloseCtx);
  const [subVisible, setSubVisible] = useState(false);
  const [subPlacement, setSubPlacement] = useState<{ side: "left" | "right"; topOffset: number }>({
    side: "right",
    topOffset: -4,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const hasChildren = !!item.children?.length;
  const Icon = item.icon;

  function revealSub() {
    if (btnRef.current) {
      const subH = (item.children?.length ?? 0) * ITEM_H + MENU_PAD;
      setSubPlacement(calcSubMenuPos(btnRef.current.getBoundingClientRect(), MENU_W, subH));
    }
    setSubVisible(true);
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (item.disabled || hasChildren) return;
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
      {Icon && (
        <span className={twMerge("shrink-0", item.danger ? "text-red-400 dark:text-red-500" : "text-zinc-400 dark:text-zinc-500 group-hover/mi:text-zinc-600 dark:group-hover/mi:text-zinc-300")}>
          <Icon size={14} strokeWidth={1.75} />
        </span>
      )}
      <span className="flex flex-1 flex-col min-w-0">
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

  if (hasChildren) {
    return (
      <div
        className="relative group/sub"
        onMouseEnter={revealSub}
        onMouseLeave={() => setSubVisible(false)}
      >
        <button
          ref={btnRef}
          type="button"
          className={itemCls}
          tabIndex={item.disabled ? -1 : 0}
          onFocus={revealSub}
          onBlur={() => setSubVisible(false)}
          aria-haspopup="menu"
          {...(item.componentId ? { "data-component-id": item.componentId } : {})}
        >
          {inner}
        </button>
        {subVisible && (
          <div
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
                <MenuItem item={child} onSelect={onSelect} />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={item.disabled ? -1 : 0}
      className={itemCls}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(e as unknown as React.MouseEvent); }}
      {...(item.componentId ? { "data-component-id": item.componentId } : {})}
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
}: {
  items: ContextMenuItem[];
  pos: Pos;
  onSelect?: (item: ContextMenuItem) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Focus trap + keyboard nav
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const focusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])"));
    focusable()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      const items = focusable();
      const idx = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
      if (e.key === "Escape")    { e.preventDefault(); onClose(); }
      if (e.key === "Tab")       { e.preventDefault(); onClose(); }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Context menu"
      style={{ top: pos.y, left: pos.x, minWidth: MENU_W }}
      className="fixed z-[110] rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] focus:outline-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.id ?? `${item.label}-${i}`}>
          {item.divider && <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />}
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
}: ContextMenuProps) {
  const [pos, setPos] = useState<Pos | null>(null);

  const close = useCallback(() => setPos(null), []);

  function open(x: number, y: number) {
    if (disabled) return;
    setPos(calcCursorPos({ x, y }, MENU_W, items.length * ITEM_H + MENU_PAD));
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

  // Close on outside click / scroll / resize
  useEffect(() => {
    if (!pos) return;
    function dismiss(e: MouseEvent | KeyboardEvent | Event) {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      close();
    }
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("scroll",    dismiss, true);
    document.addEventListener("resize",    dismiss);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("scroll",    dismiss, true);
      document.removeEventListener("resize",    dismiss);
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
          <MenuPanel items={items} pos={pos} onSelect={onSelect} onClose={close} />,
          document.body,
        )
      }
    </CloseCtx.Provider>
  );
}
