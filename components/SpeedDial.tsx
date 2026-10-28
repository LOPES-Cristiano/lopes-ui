"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export type SpeedDialDirection = "up" | "down" | "left" | "right";
export type SpeedDialPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "inline";

export type SpeedDialAction = {
  id: string;
  label: string;
  icon: LucideIcon | React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  /** Access-control identifier for this specific action */
  componentId?: string;
  /** If false, renders the action button disabled instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type SpeedDialProps = {
  actions: SpeedDialAction[];
  /** Direction in which action buttons expand (default: "up") */
  direction?: SpeedDialDirection;
  /** Floating viewport position or inline container (default: "bottom-right") */
  position?: SpeedDialPosition;
  /** How the speed dial opens (default: "click") */
  trigger?: "click" | "hover";
  /** Main trigger icon when closed (default: Plus) */
  icon?: LucideIcon | React.ReactNode;
  /** Main trigger icon when open (default: X) */
  activeIcon?: LucideIcon | React.ReactNode;
  /** Optional text label on the main trigger button (extended FAB) */
  label?: React.ReactNode;
  /** Always show action labels next to buttons instead of only on hover (default: true for up/down) */
  showLabels?: boolean;
  /** Visual color of the main FAB button */
  variant?: "primary" | "dark" | "light";
  /** Size of the main FAB button */
  size?: "sm" | "md" | "lg";
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Access-control identifier for the entire SpeedDial */
  componentId?: string;
  /** If false, disables the FAB instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
  className?: string;
  ariaLabel?: string;
};

const POSITION_CLS: Record<SpeedDialPosition, string> = {
  "bottom-right": "fixed bottom-6 right-6 z-40",
  "bottom-left": "fixed bottom-6 left-6 z-40",
  "top-right": "fixed top-6 right-6 z-40",
  "top-left": "fixed top-6 left-6 z-40",
  inline: "relative inline-flex z-20",
};

const DIRECTION_CONTAINER_CLS: Record<SpeedDialDirection, string> = {
  up: "bottom-full mb-3 left-1/2 -translate-x-1/2 flex-col-reverse items-center",
  down: "top-full mt-3 left-1/2 -translate-x-1/2 flex-col items-center",
  left: "right-full mr-3 top-1/2 -translate-y-1/2 flex-row-reverse items-center",
  right: "left-full ml-3 top-1/2 -translate-y-1/2 flex-row items-center",
};

const MAIN_SIZE_CLS = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-14 w-14 text-lg",
};

const EXTENDED_SIZE_CLS = {
  sm: "h-10 px-3.5 text-xs gap-1.5",
  md: "h-12 px-4 text-sm gap-2",
  lg: "h-14 px-5 text-base gap-2.5",
};

const ACTION_SIZE_CLS = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-11 w-11",
};

const MAIN_VARIANT_CLS = {
  primary:
    "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500",
  dark:
    "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-200",
  light:
    "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700",
};

const ACTION_TONE_CLS: Record<NonNullable<SpeedDialAction["tone"]>, string> = {
  default:
    "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700",
  primary:
    "bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-500",
  success:
    "bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-500",
  warning:
    "bg-amber-500 text-white border border-amber-400 hover:bg-amber-400",
  danger:
    "bg-rose-600 text-white border border-rose-500 hover:bg-rose-500",
};

function renderIconNode(
  icon: LucideIcon | React.ReactNode | undefined,
  fallback: React.ReactNode,
  size = 18
) {
  if (!icon) return fallback;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
    const IconComp = icon as LucideIcon;
    return <IconComp size={size} />;
  }
  return icon;
}

export default function SpeedDial({
  actions,
  direction = "up",
  position = "bottom-right",
  trigger = "click",
  icon,
  activeIcon,
  label,
  showLabels = false,
  variant = "primary",
  size = "md",
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  componentId,
  hideIfDenied = true,
  className,
  ariaLabel = "Ações rápidas",
}: SpeedDialProps) {
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const [internalOpen, setInternalOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const visibleActions = actions.filter((action) => {
    const allowed = !action.componentId || canAccess(action.componentId);
    if (!allowed && action.hideIfDenied !== false) return false;
    return true;
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  if (!hasRootPermission && hideIfDenied) {
    return null;
  }

  if (visibleActions.length === 0 && !disabled) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled || !hasRootPermission);
  const iconPx = size === "sm" ? 16 : size === "lg" ? 22 : 19;

  return (
    <div
      ref={rootRef}
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn(POSITION_CLS[position], " inline-flex items-center", className)}
      onMouseEnter={
        trigger === "hover" && !effectiveDisabled ? () => setOpen(true) : undefined
      }
      onMouseLeave={
        trigger === "hover" && !effectiveDisabled ? () => setOpen(false) : undefined
      }
    >
      {/* Expanded Actions */}
      <div
        role="menu"
        aria-hidden={!isOpen}
        className={cn(
          "absolute flex gap-2.5",
          DIRECTION_CONTAINER_CLS[direction],
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {visibleActions.map((action, idx) => {
          const allowed = !action.componentId || canAccess(action.componentId);
          const actionDisabled = Boolean(action.disabled || !allowed);
          const tone = action.tone ?? "default";
          const isVertical = direction === "up" || direction === "down";
          const labelLeft = position.endsWith("right") || direction === "up" || direction === "down";

          const closedOffsetCls =
            direction === "up"
              ? "translate-y-3 scale-75 opacity-0"
              : direction === "down"
                ? "-translate-y-3 scale-75 opacity-0"
                : direction === "left"
                  ? "translate-x-3 scale-75 opacity-0"
                  : "-translate-x-3 scale-75 opacity-0";

          return (
            <div
              key={action.id}
              style={{
                transitionDelay: isOpen
                  ? `${idx * 35}ms`
                  : `${(visibleActions.length - 1 - idx) * 20}ms`,
              }}
              className={cn(
                "group relative flex items-center will-change-[transform,opacity] transition-[transform,opacity] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "translate-x-0 translate-y-0 scale-100 opacity-100" : closedOffsetCls
              )}
            >
              {/* Action Label / Tooltip */}
              {action.label && (
                <span
                  className={cn(
                    "pointer-events-none whitespace-nowrap rounded-lg bg-zinc-900/95 px-2.5 py-1 text-xs font-medium text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900 transition-opacity duration-150",
                    isVertical
                      ? labelLeft
                        ? "absolute right-full mr-2.5"
                        : "absolute left-full ml-2.5"
                      : "absolute bottom-full mb-2 left-1/2 -translate-x-1/2",
                    showLabels ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                  )}
                >
                  {action.label}
                </span>
              )}

              <button
                type="button"
                role="menuitem"
                aria-label={action.label}
                disabled={actionDisabled}
                {...(action.componentId ? { "data-component-id": action.componentId } : {})}
                onClick={() => {
                  if (actionDisabled) return;
                  if (action.href && typeof window !== "undefined") {
                    window.location.href = action.href;
                  }
                  action.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-center rounded-full shadow-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  ACTION_SIZE_CLS[size],
                  ACTION_TONE_CLS[tone],
                  actionDisabled
                    ? "opacity-45 cursor-not-allowed"
                    : "hover:scale-105 active:scale-95"
                )}
              >
                {renderIconNode(action.icon, null, iconPx - 2)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Trigger FAB */}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={effectiveDisabled}
        onClick={() => {
          if (effectiveDisabled) return;
          setOpen(!isOpen);
        }}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          label ? EXTENDED_SIZE_CLS[size] : MAIN_SIZE_CLS[size],
          MAIN_VARIANT_CLS[variant],
          effectiveDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-[1.03] active:scale-95"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center transition-transform duration-200",
            isOpen && !activeIcon && "rotate-45"
          )}
        >
          {isOpen && activeIcon
            ? renderIconNode(activeIcon, <X size={iconPx} />, iconPx)
            : renderIconNode(icon, <Plus size={iconPx} />, iconPx)}
        </span>
        {label && <span>{label}</span>}
      </button>
    </div>
  );
}
