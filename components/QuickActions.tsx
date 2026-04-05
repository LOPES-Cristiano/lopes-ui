"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuickAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip override (defaults to label) */
  tooltip?: string;
};

export type QuickActionsProps = {
  actions: QuickAction[];
  /** Floating position. Default: "bottom-right" */
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left";
  className?: string;
};

// ── Position map ──────────────────────────────────────────────────────────────

const positionClasses: Record<Required<QuickActionsProps>["position"], string> = {
  "bottom-right":  "bottom-6 right-6",
  "bottom-left":   "bottom-6 left-6",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "top-right":     "top-6 right-6",
  "top-left":      "top-6 left-6",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuickActions({
  actions,
  position = "bottom-right",
  className,
}: QuickActionsProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const isBottom = position.startsWith("bottom");

  return (
    <div
      className={twMerge(clsx(
        "fixed z-50 flex flex-col items-center gap-2",
        positionClasses[position],
        !isBottom && "flex-col-reverse",
        className,
      ))}
    >
      {/* Action items — shown when open */}
      <div
        className={clsx(
          "flex flex-col gap-2",
          isBottom ? "flex-col-reverse" : "flex-col",
          "transition-all duration-200 origin-bottom",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
        )}
        aria-hidden={!open}
      >
        {actions.map((action) => (
          <div key={action.id} className="relative group flex items-center justify-end gap-2">
            {/* Tooltip */}
            <span
              aria-hidden="true"
              className={clsx(
                "absolute right-12 whitespace-nowrap",
                "rounded-md bg-zinc-900 dark:bg-zinc-700 text-white text-xs px-2 py-1",
                "transition-opacity",
                hovered === action.id ? "opacity-100" : "opacity-0",
              )}
            >
              {action.tooltip ?? action.label}
            </span>

            {/* Button */}
            <button
              type="button"
              aria-label={action.label}
              disabled={action.disabled}
              onClick={() => { action.onClick(); setOpen(false); }}
              onMouseEnter={() => setHovered(action.id)}
              onMouseLeave={() => setHovered(null)}
              className={clsx(
                "w-10 h-10 rounded-full shadow-md",
                "flex items-center justify-center",
                "bg-white dark:bg-zinc-800",
                "border border-zinc-200 dark:border-zinc-700",
                "text-zinc-700 dark:text-zinc-200",
                "hover:bg-zinc-50 dark:hover:bg-zinc-700",
                "transition-all active:scale-95",
                action.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center">{action.icon}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Toggle FAB */}
      <button
        type="button"
        aria-label={open ? "Fechar ações rápidas" : "Abrir ações rápidas"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-12 h-12 rounded-full shadow-lg",
          "flex items-center justify-center",
          "bg-zinc-900 dark:bg-zinc-100",
          "text-white dark:text-zinc-900",
          "hover:bg-zinc-700 dark:hover:bg-zinc-300",
          "transition-all duration-200",
          open && "rotate-45",
        )}
      >
        {/* + icon via CSS */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
