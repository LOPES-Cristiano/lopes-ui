"use client";

import React, { useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Which edge the drawer slides in from. Default: "right" */
  side?: DrawerSide;
  /** Width (left/right) or height (top/bottom). Default: "md" */
  size?: DrawerSize;
  /** Heading shown in the drawer header */
  title?: React.ReactNode;
  /** Subtext below the title */
  description?: React.ReactNode;
  /** Main content */
  children?: React.ReactNode;
  /** Sticky footer slot */
  footer?: React.ReactNode;
  /** Whether clicking the backdrop closes the drawer. Default: true */
  closeOnBackdrop?: boolean;
  /** Additional class names for the panel */
  className?: string;
};

// ── Size maps ─────────────────────────────────────────────────────────────────

const horizontalSizes: Record<DrawerSize, string> = {
  sm:   "w-80",
  md:   "w-[420px]",
  lg:   "w-[560px]",
  xl:   "w-[720px]",
  full: "w-full",
};

const verticalSizes: Record<DrawerSize, string> = {
  sm:   "h-1/4",
  md:   "h-2/5",
  lg:   "h-3/5",
  xl:   "h-4/5",
  full: "h-full",
};

// ── Slide-in / slide-out transforms ──────────────────────────────────────────

const translateClosed: Record<DrawerSide, string> = {
  right:  "translate-x-full",
  left:   "-translate-x-full",
  top:    "-translate-y-full",
  bottom: "translate-y-full",
};

const panelPosition: Record<DrawerSide, string> = {
  right:  "inset-y-0 right-0",
  left:   "inset-y-0 left-0",
  top:    "inset-x-0 top-0",
  bottom: "inset-x-0 bottom-0",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Drawer({
  open,
  onClose,
  side = "right",
  size = "md",
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  className,
}: DrawerProps) {
  // useSyncExternalStore gives false on the server and true on the client,
  // preventing the createPortal from rendering during SSR and causing hydration
  // mismatches in React 19 when open=true on first render.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useBodyScrollLock(open);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleEscape]);

  const isHorizontal = side === "left" || side === "right";
  const sizeClass = isHorizontal ? horizontalSizes[size] : verticalSizes[size];

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
        className={twMerge(clsx(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ))}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        className={twMerge(clsx(
          "fixed z-50 flex flex-col",
          "bg-white dark:bg-zinc-900",
          "shadow-2xl",
          isHorizontal ? "max-h-screen" : "max-w-screen",
          panelPosition[side],
          sizeClass,
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0 translate-y-0" : translateClosed[side],
          className,
        ))}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
            <div className="min-w-0">
              {title && (
                <h2
                  id="drawer-title"
                  className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 rounded-md p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-5 py-4 border-t border-zinc-200 dark:border-zinc-700">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
