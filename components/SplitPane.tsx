"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GripHorizontal,
  GripVertical,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SplitPaneDirection = "horizontal" | "vertical";

export type SplitPaneProps = {
  direction?: SplitPaneDirection;
  /** Initial size of the first pane as a percentage (0–100). Default: 50 */
  defaultSplit?: number;
  /** Minimum first-pane size (%). Default: 10 */
  minFirst?: number;
  /** Maximum first-pane size (%). Default: 90 */
  maxFirst?: number;
  /** Show a visual grip handle pill in the center of the divider (shadcn/ui ResizableHandle style). Default: true */
  withHandle?: boolean;
  /** Allow collapsing the first pane when dragged below minFirst / 2 */
  collapsible?: boolean;
  /** Ant Design Splitter: render one-click collapse/expand chevron buttons on the divider */
  showCollapseButtons?: boolean;
  /** Optional localStorage key to persist the user's chosen split ratio */
  storageKey?: string;
  /** Callback when split ratio changes */
  onSplitChange?: (split: number) => void;
  /** First pane content */
  first: React.ReactNode;
  /** Second pane content */
  second: React.ReactNode;
  className?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SplitPane({
  direction = "horizontal",
  defaultSplit = 50,
  minFirst = 10,
  maxFirst = 90,
  withHandle = true,
  collapsible = false,
  showCollapseButtons = false,
  storageKey,
  onSplitChange,
  first,
  second,
  className,
}: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const prevOpenSplitRef = useRef(defaultSplit);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    let rafId: number | null = null;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) {
          rafId = window.requestAnimationFrame(() => {
            if (parsed > 0 && parsed < 100) {
              prevOpenSplitRef.current = parsed;
            }
            setSplit(parsed);
          });
        }
      }
    } catch {}
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [storageKey]);

  const updateSplit = useCallback(
    (next: number) => {
      if (next > 0 && next < 100) {
        prevOpenSplitRef.current = next;
      }
      setSplit(next);
      onSplitChange?.(next);
      if (storageKey && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, String(next));
        } catch {}
      }
    },
    [onSplitChange, storageKey]
  );

  const startDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let ratio: number;
      if (direction === "horizontal") {
        ratio = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        ratio = ((e.clientY - rect.top) / rect.height) * 100;
      }
      if ((collapsible || showCollapseButtons) && ratio < minFirst / 2) {
        updateSplit(0);
      } else if (showCollapseButtons && ratio > 100 - (100 - maxFirst) / 2) {
        updateSplit(100);
      } else {
        updateSplit(Math.min(maxFirst, Math.max(minFirst, ratio)));
      }
    },
    [direction, minFirst, maxFirst, collapsible, showCollapseButtons, updateSplit]
  );

  const stopDrag = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  // Double-click on divider resets to defaultSplit
  const handleDoubleClick = useCallback(() => {
    updateSplit(defaultSplit);
  }, [defaultSplit, updateSplit]);

  // Ant Design Splitter collapse/expand handlers
  const handleCollapseFirst = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (split >= 100) {
        updateSplit(prevOpenSplitRef.current || defaultSplit);
      } else {
        updateSplit(0);
      }
    },
    [split, defaultSplit, updateSplit]
  );

  const handleCollapseSecond = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (split <= 0) {
        updateSplit(prevOpenSplitRef.current || defaultSplit);
      } else {
        updateSplit(100);
      }
    },
    [split, defaultSplit, updateSplit]
  );

  // Keyboard nudge
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      const isH = direction === "horizontal";
      if ((isH && e.key === "ArrowLeft") || (!isH && e.key === "ArrowUp")) {
        e.preventDefault();
        updateSplit(Math.max(collapsible || showCollapseButtons ? 0 : minFirst, split - step));
      } else if ((isH && e.key === "ArrowRight") || (!isH && e.key === "ArrowDown")) {
        e.preventDefault();
        updateSplit(Math.min(showCollapseButtons ? 100 : maxFirst, split + step));
      } else if (e.key === "Home") {
        e.preventDefault();
        updateSplit(minFirst);
      } else if (e.key === "End") {
        e.preventDefault();
        updateSplit(maxFirst);
      }
    },
    [direction, minFirst, maxFirst, collapsible, showCollapseButtons, split, updateSplit]
  );

  const isH = direction === "horizontal";
  const firstStyle = isH ? { width: `${split}%` } : { height: `${split}%` };
  const secondStyle = isH ? { width: `${100 - split}%` } : { height: `${100 - split}%` };
  const isFirstCollapsed = split <= 0;
  const isSecondCollapsed = split >= 100;

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      className={twMerge(
        clsx(
          "flex overflow-hidden",
          isH ? "flex-row" : "flex-col",
          className
        )
      )}
    >
      {/* First pane */}
      <div
        style={firstStyle}
        aria-hidden={isFirstCollapsed || undefined}
        className={clsx(
          "overflow-hidden min-w-0 min-h-0",
          !isDragging && "transition-[width,height] duration-150 ease-out"
        )}
      >
        {first}
      </div>

      {/* Divider (shadcn/ui ResizableHandle + Ant Design Splitter collapse triggers) */}
      <div
        role="separator"
        aria-orientation={isH ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(split)}
        aria-valuemin={collapsible || showCollapseButtons ? 0 : minFirst}
        aria-valuemax={showCollapseButtons ? 100 : maxFirst}
        title="Arraste para redimensionar (duplo-clique para restaurar)"
        tabIndex={0}
        onPointerDown={startDrag}
        onDoubleClick={handleDoubleClick}
        onKeyDown={onKeyDown}
        className={clsx(
          "group/handle relative shrink-0 z-10 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          "bg-zinc-200 dark:bg-zinc-800",
          "hover:bg-indigo-400 dark:hover:bg-indigo-600",
          "active:bg-indigo-500 dark:active:bg-indigo-500",
          "transition-colors",
          isH ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"
        )}
      >
        {showCollapseButtons ? (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className={clsx(
              "z-20 flex items-center justify-center gap-0.5",
              isH ? "flex-col" : "flex-row"
            )}
          >
            {!isFirstCollapsed && (
              <button
                type="button"
                onClick={handleCollapseFirst}
                aria-label={isSecondCollapsed ? "Restaurar divisão" : "Recolher primeiro painel"}
                title={isSecondCollapsed ? "Restaurar divisão" : "Recolher primeiro painel"}
                className={clsx(
                  "flex items-center justify-center rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 shadow-xs hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer",
                  isH ? "h-5 w-4" : "h-4 w-5"
                )}
              >
                {isH ? <ChevronLeft className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </button>
            )}

            {withHandle && !isFirstCollapsed && !isSecondCollapsed && (
              <div
                className={clsx(
                  "flex items-center justify-center rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-2xs pointer-events-none",
                  isH ? "h-5 w-3.5" : "h-3.5 w-5"
                )}
              >
                {isH ? <GripVertical className="h-2.5 w-2.5" /> : <GripHorizontal className="h-2.5 w-2.5" />}
              </div>
            )}

            {!isSecondCollapsed && (
              <button
                type="button"
                onClick={handleCollapseSecond}
                aria-label={isFirstCollapsed ? "Restaurar divisão" : "Recolher segundo painel"}
                title={isFirstCollapsed ? "Restaurar divisão" : "Recolher segundo painel"}
                className={clsx(
                  "flex items-center justify-center rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 shadow-xs hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer",
                  isH ? "h-5 w-4" : "h-4 w-5"
                )}
              >
                {isH ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        ) : (
          withHandle && (
            <div
              className={clsx(
                "z-10 flex items-center justify-center rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-2xs transition-colors group-hover/handle:border-indigo-400 group-hover/handle:text-indigo-600 dark:group-hover/handle:text-indigo-300",
                isH ? "h-6 w-3.5" : "h-3.5 w-6"
              )}
            >
              {isH ? <GripVertical className="h-3 w-3" /> : <GripHorizontal className="h-3 w-3" />}
            </div>
          )
        )}
      </div>

      {/* Second pane */}
      <div
        style={secondStyle}
        aria-hidden={isSecondCollapsed || undefined}
        className={clsx(
          "overflow-hidden min-w-0 min-h-0",
          !isDragging && "transition-[width,height] duration-150 ease-out"
        )}
      >
        {second}
      </div>
    </div>
  );
}

export { SplitPane as Splitter };
