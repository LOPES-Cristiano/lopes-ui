"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { GripHorizontal, GripVertical } from "lucide-react";

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
  storageKey,
  onSplitChange,
  first,
  second,
  className,
}: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) setSplit(parsed);
      }
    } catch {}
  }, [storageKey]);

  const updateSplit = useCallback(
    (next: number) => {
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
      if (collapsible && ratio < minFirst / 2) {
        updateSplit(0);
      } else {
        updateSplit(Math.min(maxFirst, Math.max(minFirst, ratio)));
      }
    },
    [direction, minFirst, maxFirst, collapsible, updateSplit]
  );

  const stopDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  // Double-click on divider resets to defaultSplit
  const handleDoubleClick = useCallback(() => {
    updateSplit(defaultSplit);
  }, [defaultSplit, updateSplit]);

  // Keyboard nudge
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      const isH = direction === "horizontal";
      if ((isH && e.key === "ArrowLeft") || (!isH && e.key === "ArrowUp")) {
        e.preventDefault();
        updateSplit(Math.max(collapsible ? 0 : minFirst, split - step));
      } else if ((isH && e.key === "ArrowRight") || (!isH && e.key === "ArrowDown")) {
        e.preventDefault();
        updateSplit(Math.min(maxFirst, split + step));
      } else if (e.key === "Home") {
        e.preventDefault();
        updateSplit(minFirst);
      } else if (e.key === "End") {
        e.preventDefault();
        updateSplit(maxFirst);
      }
    },
    [direction, minFirst, maxFirst, collapsible, split, updateSplit]
  );

  const isH = direction === "horizontal";
  const firstStyle = isH ? { width: `${split}%` } : { height: `${split}%` };
  const secondStyle = isH ? { width: `${100 - split}%` } : { height: `${100 - split}%` };

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
      <div style={firstStyle} className="overflow-hidden min-w-0 min-h-0">
        {first}
      </div>

      {/* Divider (shadcn/ui ResizableHandle style) */}
      <div
        role="separator"
        aria-orientation={isH ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(split)}
        aria-valuemin={collapsible ? 0 : minFirst}
        aria-valuemax={maxFirst}
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
        {withHandle && (
          <div
            className={clsx(
              "z-10 flex items-center justify-center rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-2xs transition-colors group-hover/handle:border-indigo-400 group-hover/handle:text-indigo-600 dark:group-hover/handle:text-indigo-300",
              isH ? "h-6 w-3.5" : "h-3.5 w-6"
            )}
          >
            {isH ? <GripVertical className="h-3 w-3" /> : <GripHorizontal className="h-3 w-3" />}
          </div>
        )}
      </div>

      {/* Second pane */}
      <div style={secondStyle} className="overflow-hidden min-w-0 min-h-0">
        {second}
      </div>
    </div>
  );
}
