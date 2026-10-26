"use client";

import React, { useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { registerModal, unregisterModal } from "./Modal";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

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
  /** Keep children mounted while the drawer is closed. Default: false */
  keepMounted?: boolean;
  /** Additional class names for the panel */
  className?: string;
};

// ── Size maps ─────────────────────────────────────────────────────────────────

const horizontalSizes: Record<DrawerSize, string> = {
  sm:   "w-full sm:w-80",
  md:   "w-full sm:w-[420px]",
  lg:   "w-full sm:w-[560px]",
  xl:   "w-full md:w-[min(860px,92vw)]",
  "2xl": "w-full lg:w-[50vw]",
  "3xl": "w-full lg:w-[min(1040px,88vw)]",
  "4xl": "w-full lg:w-[min(1200px,92vw)]",
  "5xl": "w-full xl:w-[min(1440px,94vw)]",
  full: "w-full",
};

const verticalSizes: Record<DrawerSize, string> = {
  sm:   "h-1/4",
  md:   "h-2/5",
  lg:   "h-3/5",
  xl:   "h-4/5",
  "2xl": "h-[90vh]",
  "3xl": "h-[92vh]",
  "4xl": "h-[94vh]",
  "5xl": "h-[96vh]",
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
  keepMounted = false,
  className,
}: DrawerProps) {
  // useSyncExternalStore gives false on the server and true on the client,
  // preventing the createPortal from rendering during SSR and causing hydration
  // mismatches in React 19 when open=true on first render.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useBodyScrollLock(open);

  const onCloseRef = React.useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const handleClose = () => onCloseRef.current();
    registerModal(handleClose);
    return () => unregisterModal(handleClose);
  }, [open]);

  const isHorizontal = side === "left" || side === "right";
  const sizeClass = isHorizontal ? horizontalSizes[size] : verticalSizes[size];
  
  if (!mounted || (!open && !keepMounted)) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
        className={cn(
          "fixed inset-0 z-[6000] bg-black/55 backdrop-blur-xs transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        className={cn(
          "fixed z-[6010] flex flex-col overflow-hidden border border-border bg-card",
          "shadow-2xl",
          "dark:shadow-black/60",
          open ? "" : "pointer-events-none opacity-0",
          isHorizontal ? "max-h-screen" : "max-w-screen",
          panelPosition[side],
          sizeClass,
          "transition-[transform,opacity,box-shadow] duration-300 ease-out",
          open ? "translate-x-0 translate-y-0 opacity-100 pointer-events-auto" : translateClosed[side],
          className,
        )} 
      >
        {/* Header */}
        {(title || description) && (
          <div className="shrink-0 border-b border-border bg-[var(--surface)]/95 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title && (
                <h2
                  id="drawer-title"
                  className="truncate text-base font-semibold text-[var(--surface-foreground)]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <div className="mt-1 text-sm leading-relaxed text-[var(--surface-muted-foreground)]">
                  {description}
                </div>
              )}
            </div>
            <button
              data-component-id="erp.drawer.close"
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 cursor-pointer rounded-xl p-1.5 text-muted-foreground opacity-70 transition-all hover:opacity-100 hover:bg-muted focus:outline-none active:scale-95 border-none"
            >
              <X className="h-4 w-4" />
            </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-[var(--surface)] px-5 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="min-w-0 shrink-0 border-t border-border bg-[var(--surface)]/95 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
