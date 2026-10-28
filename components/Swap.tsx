"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export type SwapEffect = "rotate" | "flip" | "fade";

export type SwapProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  /** Content shown when active === true */
  onElement: React.ReactNode;
  /** Content shown when active === false */
  offElement: React.ReactNode;
  /** Optional content shown when indeterminate === true */
  indeterminateElement?: React.ReactNode;
  /** Controlled active state */
  active?: boolean;
  /** Default active state when uncontrolled */
  defaultActive?: boolean;
  /** Indeterminate state overrides on/off display */
  indeterminate?: boolean;
  /** Visual transition effect (default: "rotate") */
  effect?: SwapEffect;
  /** Callback fired when toggled */
  onChange?: (active: boolean) => void;
  /** Access-control identifier */
  componentId?: string;
  /** If false, disables the swap button instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export default function Swap({
  onElement,
  offElement,
  indeterminateElement,
  active: controlledActive,
  defaultActive = false,
  indeterminate = false,
  effect = "rotate",
  onChange,
  disabled = false,
  componentId,
  hideIfDenied = true,
  className,
  onClick,
  ...props
}: SwapProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = controlledActive !== undefined ? controlledActive : internalActive;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || effectiveDisabled) return;
    const next = !isActive;
    if (controlledActive === undefined) {
      setInternalActive(next);
    }
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={indeterminate ? "mixed" : isActive}
      disabled={effectiveDisabled}
      {...(componentId ? { "data-component-id": componentId } : {})}
      onClick={handleToggle}
      style={effect === "flip" ? { perspective: "400px" } : undefined}
      className={cn(
        "relative inline-grid place-content-center select-none rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        effectiveDisabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
        className
      )}
      {...props}
    >
      {/* Indeterminate Layer */}
      {indeterminateElement && (
        <span
          aria-hidden={!indeterminate}
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center transition-all duration-300 ease-out",
            indeterminate
              ? "opacity-100 scale-100 rotate-0"
              : "pointer-events-none opacity-0 scale-75"
          )}
        >
          {indeterminateElement}
        </span>
      )}

      {/* ON Element */}
      <span
        aria-hidden={indeterminate || !isActive}
        style={
          effect === "flip"
            ? {
                transform: !indeterminate && isActive ? "rotateY(0deg)" : "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }
            : undefined
        }
        className={cn(
          "col-start-1 row-start-1 inline-flex items-center justify-center transition-all duration-300 ease-out",
          !indeterminate && isActive
            ? "opacity-100 scale-100 rotate-0"
            : cn(
                "pointer-events-none opacity-0",
                effect === "rotate" && "-rotate-45 scale-75",
                effect === "fade" && "scale-90"
              )
        )}
      >
        {onElement}
      </span>

      {/* OFF Element */}
      <span
        aria-hidden={indeterminate || isActive}
        style={
          effect === "flip"
            ? {
                transform: !indeterminate && !isActive ? "rotateY(0deg)" : "rotateY(-180deg)",
                backfaceVisibility: "hidden",
              }
            : undefined
        }
        className={cn(
          "col-start-1 row-start-1 inline-flex items-center justify-center transition-all duration-300 ease-out",
          !indeterminate && !isActive
            ? "opacity-100 scale-100 rotate-0"
            : cn(
                "pointer-events-none opacity-0",
                effect === "rotate" && "rotate-45 scale-75",
                effect === "fade" && "scale-90"
              )
        )}
      >
        {offElement}
      </span>
    </button>
  );
}
