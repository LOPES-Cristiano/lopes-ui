"use client";

import React, { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../utils/cn";
import { hasOpenFloatingOverlay, hasOpenHigherModalOverlay } from "../utils/overlay";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

// ── Global Open-Drawer Stack (topmost Escape + stacked z-index) ───────────────

type DrawerStackEntry = {
  id: string;
  onClose: () => void;
};

const drawerStack: DrawerStackEntry[] = [];
const stackListeners = new Set<() => void>();
let stackIdsSnapshot: string[] = [];
const EMPTY_STACK: string[] = [];

function notifyStackChange() {
  stackIdsSnapshot = drawerStack.map((item) => item.id);
  for (const listener of stackListeners) {
    listener();
  }
}

function subscribeStack(listener: () => void) {
  stackListeners.add(listener);
  return () => {
    stackListeners.delete(listener);
  };
}

function getStackSnapshot(): string[] {
  return stackIdsSnapshot;
}

function getServerStackSnapshot(): string[] {
  return EMPTY_STACK;
}

function handleGlobalDrawerEsc(e: KeyboardEvent) {
  if (e.key !== "Escape" || drawerStack.length === 0) return;
  if (e.defaultPrevented || hasOpenHigherModalOverlay()) {
    return;
  }
  e.stopImmediatePropagation();
  e.preventDefault();
  const top = drawerStack[drawerStack.length - 1];
  top?.onClose();
}

function registerDrawerEntry(entry: DrawerStackEntry) {
  drawerStack.push(entry);
  if (drawerStack.length === 1 && typeof window !== "undefined") {
    window.addEventListener("keydown", handleGlobalDrawerEsc, true);
  }
  notifyStackChange();
}

function unregisterDrawerEntry(id: string) {
  const idx = drawerStack.findIndex((item) => item.id === id);
  if (idx !== -1) {
    drawerStack.splice(idx, 1);
  }
  if (drawerStack.length === 0 && typeof window !== "undefined") {
    window.removeEventListener("keydown", handleGlobalDrawerEsc, true);
  }
  notifyStackChange();
}

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
  /** Optional icon or badge rendered next to the title */
  headerIcon?: React.ReactNode;
  /** Optional actions rendered in the header next to the close button */
  headerExtra?: React.ReactNode;
  /** Main content */
  children?: React.ReactNode;
  /** Sticky footer slot */
  footer?: React.ReactNode;
  /** Whether clicking the backdrop closes the drawer. Default: true */
  closeOnBackdrop?: boolean;
  /** Keep children mounted while the drawer is closed. Default: false */
  keepMounted?: boolean;
  /** Show drag handle pill on bottom/top drawers. Default: true for bottom/top */
  showHandle?: boolean;
  /** Allow resizing horizontal drawers by dragging the edge. Default: false */
  resizable?: boolean;
  /** Remove default padding on the scrollable content container */
  noPadding?: boolean;
  /** Form layout: spaced body with standard padding (replaces the former FormDrawer). Default: false */
  form?: boolean;
  /** Highlighted summary block shown above the body (only with `form`) */
  summary?: React.ReactNode;
  /** Additional class names for the summary block (only with `form`) */
  summaryClassName?: string;
  /** Additional class names for the inner body wrapper (only with `form`) */
  bodyClassName?: string;
  /** Additional class names for the panel */
  className?: string;
  /** Additional class names for the scrollable body content area */
  contentClassName?: string;
  /** Additional class names for the footer container */
  footerClassName?: string;
  componentId?: string;
};

// ── Size maps ─────────────────────────────────────────────────────────────────

const horizontalSizes: Record<DrawerSize, string> = {
  sm: "w-full sm:w-80",
  md: "w-full sm:w-[440px]",
  lg: "w-full sm:w-[580px]",
  xl: "w-full md:w-[min(860px,92vw)]",
  "2xl": "w-full lg:w-[min(980px,92vw)]",
  "3xl": "w-full lg:w-[min(1080px,92vw)]",
  "4xl": "w-full lg:w-[min(1220px,94vw)]",
  "5xl": "w-full xl:w-[min(1440px,95vw)]",
  full: "w-full",
};

const verticalSizes: Record<DrawerSize, string> = {
  sm: "h-1/4",
  md: "h-2/5",
  lg: "h-3/5",
  xl: "h-4/5",
  "2xl": "h-[90dvh]",
  "3xl": "h-[92dvh]",
  "4xl": "h-[94dvh]",
  "5xl": "h-[96dvh]",
  full: "h-full",
};

// ── Slide-in / slide-out transforms ──────────────────────────────────────────

const translateClosed: Record<DrawerSide, string> = {
  right: "translate-x-full",
  left: "-translate-x-full",
  top: "-translate-y-full",
  bottom: "translate-y-full",
};

const panelPosition: Record<DrawerSide, string> = {
  right: "inset-y-0 right-0 border-l border-border",
  left: "inset-y-0 left-0 border-r border-border",
  top: "inset-x-0 top-0 border-b border-border rounded-b-[var(--radius-overlay)]",
  bottom: "inset-x-0 bottom-0 border-t border-border rounded-t-[var(--radius-overlay)]",
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

// ── Component ─────────────────────────────────────────────────────────────────

export default function Drawer({
  open,
  onClose,
  side = "right",
  size = "md",
  title,
  description,
  headerIcon,
  headerExtra,
  children,
  footer,
  closeOnBackdrop = true,
  keepMounted = false,
  showHandle,
  resizable = false,
  noPadding = false,
  form = false,
  summary,
  summaryClassName,
  bodyClassName,
  className,
  contentClassName,
  footerClassName,
  componentId,
}: DrawerProps) {
  const drawerId = useId();
  const titleId = `${drawerId}-title`;
  const descriptionId = `${drawerId}-description`;
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setRendered(true);
    } else {
      setVisible(false);
      setDragOffsetY(0);
    }
  }

  useEffect(() => {
    if (open) {
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
    if (!open) return;
    registerDrawerEntry({
      id: drawerId,
      onClose: () => onCloseRef.current(),
    });
    return () => unregisterDrawerEntry(drawerId);
  }, [open, drawerId]);

  const stackIds = useSyncExternalStore(
    subscribeStack,
    getStackSnapshot,
    getServerStackSnapshot
  );

  const stackIdx = Math.max(0, stackIds.indexOf(drawerId));
  const isTopmost = stackIds.length === 0 || stackIds[stackIds.length - 1] === drawerId;
  const backdropZ = 6000 + stackIdx * 20;
  const panelZ = 6010 + stackIdx * 20;

  // Focus Trap & focus restoration (only active for topmost drawer, yielding to higher modals/popovers)
  useEffect(() => {
    if (!open || !isTopmost) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const focusTimer = requestAnimationFrame(() => {
      if (!panel || panel.contains(document.activeElement)) return;
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        panel.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panel || hasOpenHigherModalOverlay()) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
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
  }, [open, isTopmost]);

  const isHorizontal = side === "left" || side === "right";
  const sizeClass = isHorizontal ? horizontalSizes[size] : verticalSizes[size];
  const displayHandle = showHandle ?? !isHorizontal;

  // Touch/Pointer drag-to-dismiss for bottom/top drawer
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
    const startW = panelRef.current?.getBoundingClientRect().width ?? 440;

    const onMove = (moveEvent: PointerEvent) => {
      const delta = side === "right" ? startX - moveEvent.clientX : moveEvent.clientX - startX;
      const nextW = Math.min(Math.max(300, startW + delta), window.innerWidth - 24);
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
        onClick={
          closeOnBackdrop
            ? () => {
                if (!hasOpenFloatingOverlay()) {
                  onClose();
                }
              }
            : undefined
        }
        style={{ zIndex: backdropZ }}
        className={cn(
          "fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isShown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        {...(componentId ? { "data-component-id": componentId } : {})}
        data-drawer-panel="true"
        data-state={open ? "open" : "closed"}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        style={{
          zIndex: panelZ,
          ...(customWidth && isHorizontal ? { width: `${customWidth}px` } : {}),
          ...(dragOffsetY !== 0 ? { transform: `translate3d(0, ${dragOffsetY}px, 0)` } : {}),
        }}
        className={cn(
          "fixed flex flex-col min-h-0 overflow-hidden bg-card text-card-foreground outline-none will-change-transform",
          "shadow-[var(--shadow-overlay)]",
          isShown ? "" : "pointer-events-none opacity-0",
          isHorizontal ? "h-dvh max-h-dvh" : "w-dvw max-w-dvw",
          panelPosition[side],
          !customWidth && sizeClass,
          dragOffsetY === 0 && "transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isShown ? "translate-x-0 translate-y-0 opacity-100 pointer-events-auto" : translateClosed[side],
          className,
        )}
      >
        {/* Optional Resize Edge for Horizontal Drawers */}
        {resizable && isHorizontal && (
          <div
            onPointerDown={handleResizePointerDown}
            className={cn(
              "hidden sm:block absolute inset-y-0 z-20 w-1.5 cursor-col-resize hover:bg-brand/40 active:bg-brand transition-colors",
              side === "right" ? "left-0" : "right-0"
            )}
            aria-hidden="true"
          />
        )}

        {/* Drag Handle for Bottom Drawer */}
        {displayHandle && side === "bottom" && (
          <div
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            className="flex w-full shrink-0 cursor-grab active:cursor-grabbing items-center justify-center pt-3 pb-1 bg-card touch-none"
          >
            <div className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        )}

        {/* Header */}
        {(title || description || headerExtra || headerIcon) && (
          <div className="shrink-0 border-b border-border bg-card/95 px-4 sm:px-5 py-3.5 sm:py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {headerIcon && (
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-border/60 bg-brand-soft text-brand">
                    {headerIcon}
                  </div>
                )}
                <div className="min-w-0">
                  {title && (
                    <h2
                      id={titleId}
                      className="truncate text-base font-semibold text-balance text-foreground leading-snug"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <div
                      id={descriptionId}
                      className="mt-0.5 text-xs sm:text-sm leading-relaxed text-pretty text-muted-foreground"
                    >
                      {description}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {headerExtra}
                <button
                  data-component-id={componentId ? `${componentId}.close` : "erp.drawer.close"}
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-control)] text-muted-foreground opacity-75 transition-colors hover:opacity-100 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-95 border-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-card",
            !noPadding && !form && "px-4 sm:px-5 py-4 sm:py-5",
            side === "bottom" && !footer && "lopes-safe-bottom",
            contentClassName
          )}
        >
          {form ? (
            <div className={cn("space-y-5", !noPadding && "p-5 md:p-6")}>
              {summary && (
                <div
                  className={cn(
                    "rounded-[var(--radius-card)] border border-border bg-muted/40 p-4 shadow-[var(--shadow-card)]",
                    summaryClassName
                  )}
                >
                  {summary}
                </div>
              )}
              <div className={cn("space-y-5", bodyClassName)}>{children}</div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "min-w-0 shrink-0 border-t border-border bg-muted/20 px-4 sm:px-5 py-3.5 sm:py-4",
              side === "bottom" && "lopes-safe-bottom",
              footerClassName
            )}
          >
            {footer}
          </div>
        )}

        {/* Drag Handle for Top Drawer */}
        {displayHandle && side === "top" && (
          <div
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            className="flex w-full shrink-0 cursor-grab active:cursor-grabbing items-center justify-center pt-1 pb-3 bg-card touch-none"
          >
            <div className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
