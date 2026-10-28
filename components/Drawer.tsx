"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  /** Show drag handle pill on bottom/top drawers (Vaul / shadcn Drawer style). Default: true for bottom/top */
  showHandle?: boolean;
  /** Allow resizing horizontal drawers by dragging the edge. Default: false */
  resizable?: boolean;
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
  showHandle,
  resizable = false,
  className,
}: DrawerProps) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useBodyScrollLock(open);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      setDragOffsetY(0);
      return;
    }
    const handleClose = () => onCloseRef.current();
    registerModal(handleClose);
    return () => unregisterModal(handleClose);
  }, [open]);

  // Focus Trap & focus restoration
  useEffect(() => {
    if (!open) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const focusTimer = requestAnimationFrame(() => {
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        panel.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      prevFocused?.focus?.();
    };
  }, [open]);

  const isHorizontal = side === "left" || side === "right";
  const sizeClass = isHorizontal ? horizontalSizes[size] : verticalSizes[size];
  const displayHandle = showHandle ?? !isHorizontal;

  // Touch/Pointer drag-to-dismiss for bottom/top drawer (Vaul / shadcn pattern)
  const handleHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isHorizontal) return;
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    if (side === "bottom" && delta > 0) {
      setDragOffsetY(delta);
    } else if (side === "top" && delta < 0) {
      setDragOffsetY(delta);
    }
  };

  const handleHandlePointerUp = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    if (Math.abs(dragOffsetY) > 100) {
      setDragOffsetY(0);
      onClose();
    } else {
      setDragOffsetY(0);
    }
  };

  // Horizontal resize handler
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isHorizontal || !resizable) return;
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelRef.current?.getBoundingClientRect().width ?? 420;

    const onMove = (moveEvent: PointerEvent) => {
      const delta = side === "right" ? startX - moveEvent.clientX : moveEvent.clientX - startX;
      const nextW = Math.min(Math.max(280, startW + delta), window.innerWidth - 32);
      setCustomWidth(nextW);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (!mounted || (!open && !rendered && !keepMounted)) return null;

  const isShown = open && visible;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
        className={cn(
          "fixed inset-0 z-[6000] bg-black/55 backdrop-blur-xs transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isShown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        style={{
          ...(customWidth && isHorizontal ? { width: `${customWidth}px` } : {}),
          ...(dragOffsetY !== 0 ? { transform: `translate3d(0, ${dragOffsetY}px, 0)` } : {}),
        }}
        className={cn(
          "fixed z-[6010] flex flex-col overflow-hidden border border-border bg-card outline-none will-change-transform",
          "shadow-2xl",
          "dark:shadow-black/60",
          side === "bottom" && "rounded-t-2xl",
          side === "top" && "rounded-b-2xl",
          isShown ? "" : "pointer-events-none opacity-0",
          isHorizontal ? "max-h-screen" : "max-w-screen",
          panelPosition[side],
          !customWidth && sizeClass,
          dragOffsetY === 0 && "transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isShown ? "translate-x-0 translate-y-0 opacity-100 pointer-events-auto" : translateClosed[side],
          className,
        )}
      >
        {/* Optional Resize Edge for Horizontal Drawers */}
        {resizable && isHorizontal && (
          <div
            onPointerDown={handleResizePointerDown}
            className={cn(
              "absolute inset-y-0 z-20 w-1.5 cursor-col-resize hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors",
              side === "right" ? "left-0" : "right-0"
            )}
            title="Arraste para redimensionar"
          />
        )}

        {/* Drag Handle for Bottom Drawer */}
        {displayHandle && side === "bottom" && (
          <div
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            className="flex w-full shrink-0 cursor-grab active:cursor-grabbing items-center justify-center pt-3 pb-1 bg-[var(--surface)] touch-none"
          >
            <div className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
        )}

        {/* Header */}
        {(title || description) && (
          <div className="shrink-0 border-b border-border bg-[var(--surface)]/95 px-4 sm:px-5 py-3.5 sm:py-4">
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
        <div className="min-w-0 flex-1 overflow-y-auto bg-[var(--surface)] px-4 sm:px-5 py-4 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="min-w-0 shrink-0 border-t border-border bg-[var(--surface)]/95 px-4 sm:px-5 py-3.5 sm:py-4">
            {footer}
          </div>
        )}

        {/* Drag Handle for Top Drawer */}
        {displayHandle && side === "top" && (
          <div
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            className="flex w-full shrink-0 cursor-grab active:cursor-grabbing items-center justify-center pt-1 pb-3 bg-[var(--surface)] touch-none"
          >
            <div className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
