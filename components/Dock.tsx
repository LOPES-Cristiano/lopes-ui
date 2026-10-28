"use client";

import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export type DockSize = "xs" | "sm" | "md" | "lg";
export type DockPosition = "bottom" | "top" | "inline";

export type DockItem = {
  id: string;
  label: string;
  icon: LucideIcon | React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
  /** Access-control identifier for this dock item */
  componentId?: string;
  /** If false, renders the item disabled instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type DockProps = {
  items: DockItem[];
  /** Currently active item ID (overrides item.active if provided) */
  activeId?: string;
  onSelect?: (item: DockItem) => void;
  position?: DockPosition;
  size?: DockSize;
  /** Show labels below icons (default: true on mobile/standard, false when compact) */
  showLabels?: boolean;
  /** Enable macOS-style hover magnification effect (default: true) */
  magnify?: boolean;
  /** Visual style of the dock container */
  variant?: "floating" | "full";
  /** Access-control identifier for the entire Dock */
  componentId?: string;
  /** If false, disables the dock instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
  className?: string;
};

const SIZE_MAP: Record<
  DockSize,
  { container: string; btn: string; icon: number; label: string }
> = {
  xs: { container: "px-1.5 sm:px-2 py-1.5 gap-0.5 sm:gap-1", btn: "px-2 sm:px-2.5 pt-1.5 pb-2", icon: 16, label: "text-[10px]" },
  sm: { container: "px-2 sm:px-2.5 py-1.5 gap-1 sm:gap-1.5", btn: "px-2.5 sm:px-3 pt-1.5 pb-2.5", icon: 18, label: "text-[10px] sm:text-[11px]" },
  md: { container: "px-2.5 sm:px-3.5 py-1.5 sm:py-2 gap-1 sm:gap-2", btn: "px-2.5 sm:px-4 pt-1.5 sm:pt-2 pb-2.5 sm:pb-3", icon: 20, label: "text-[10px] sm:text-xs" },
  lg: { container: "px-3 sm:px-4 py-2 sm:py-2.5 gap-1.5 sm:gap-2.5", btn: "px-3 sm:px-4.5 pt-2 sm:pt-2.5 pb-3 sm:pb-3.5", icon: 24, label: "text-[11px] sm:text-xs" },
};

function renderDockIcon(icon: LucideIcon | React.ReactNode, size: number) {
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
    const IconComp = icon as LucideIcon;
    return <IconComp size={size} />;
  }
  return icon;
}

export default function Dock({
  items,
  activeId,
  onSelect,
  position = "inline",
  size = "md",
  showLabels = true,
  magnify = true,
  variant = "floating",
  componentId,
  hideIfDenied = true,
  className,
}: DockProps) {
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!hasRootPermission && hideIfDenied) {
    return null;
  }

  const visibleItems = items.filter((item) => {
    const allowed = !item.componentId || canAccess(item.componentId);
    if (!allowed && item.hideIfDenied !== false) return false;
    return true;
  });

  if (visibleItems.length === 0) return null;

  const s = SIZE_MAP[size];

  const positionCls =
    position === "bottom"
      ? variant === "floating"
        ? "fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
        : "fixed bottom-0 inset-x-0 z-40"
      : position === "top"
        ? variant === "floating"
          ? "fixed top-4 left-1/2 -translate-x-1/2 z-40"
          : "fixed top-0 inset-x-0 z-40"
        : "relative inline-flex";

  const surfaceCls =
    variant === "floating"
      ? "rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl"
      : "w-full justify-around border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm";

  return (
    <nav
      aria-label="Dock navigation"
      {...(componentId ? { "data-component-id": componentId } : {})}
      onMouseLeave={() => setHoveredIdx(null)}
      className={cn("flex max-w-full overflow-x-auto no-scrollbar items-center", positionCls, surfaceCls, s.container, className)}
    >
      {visibleItems.map((item, idx) => {
        const isAllowed = hasRootPermission && (!item.componentId || canAccess(item.componentId));
        const isDisabled = Boolean(item.disabled || !isAllowed);
        const isActive = activeId !== undefined ? activeId === item.id : Boolean(item.active);

        // Calculate magnification scale based on distance from hovered icon
        let scaleStyle: React.CSSProperties | undefined;
        if (magnify && hoveredIdx !== null && !isDisabled) {
          const distance = Math.abs(hoveredIdx - idx);
          if (distance === 0) {
            scaleStyle = { transform: "translate3d(0, -4px, 0) scale3d(1.16, 1.16, 1)" };
          } else if (distance === 1) {
            scaleStyle = { transform: "translate3d(0, -1.5px, 0) scale3d(1.06, 1.06, 1)" };
          }
        }

        return (
          <button
            key={item.id}
            type="button"
            disabled={isDisabled}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            {...(item.componentId ? { "data-component-id": item.componentId } : {})}
            onMouseEnter={() => setHoveredIdx(idx)}
            onClick={() => {
              if (isDisabled) return;
              if (item.href && typeof window !== "undefined") {
                window.location.href = item.href;
              }
              item.onClick?.();
              onSelect?.(item);
            }}
            style={scaleStyle}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-xl origin-bottom will-change-transform transition-[transform,background-color,color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              s.btn,
              isActive
                ? "bg-indigo-50/90 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100",
              isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
            )}
          >
            <span className="relative inline-flex items-center justify-center">
              {renderDockIcon(item.icon, s.icon)}
              {item.badge !== undefined && item.badge !== null && (
                <span className="absolute -top-2 -right-3 flex min-w-[18px] h-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </span>

            {showLabels ? (
              <span className={cn("mt-1.5 leading-none tracking-tight whitespace-nowrap", s.label)}>
                {item.label}
              </span>
            ) : (
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                {item.label}
              </span>
            )}

            {/* Active bottom dot indicator (daisyUI dock-active style) */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-1 h-1 w-5 rounded-full bg-indigo-600 dark:bg-indigo-400"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
