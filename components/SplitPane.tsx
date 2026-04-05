"use client";

import React, { useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

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
  first,
  second,
  className,
}: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let ratio: number;
    if (direction === "horizontal") {
      ratio = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      ratio = ((e.clientY - rect.top) / rect.height) * 100;
    }
    setSplit(Math.min(maxFirst, Math.max(minFirst, ratio)));
  }, [direction, minFirst, maxFirst]);

  const stopDrag = useCallback(() => { dragging.current = false; }, []);

  // Keyboard nudge
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    const isH = direction === "horizontal";
    if ((isH && e.key === "ArrowLeft") || (!isH && e.key === "ArrowUp")) {
      setSplit((v) => Math.max(minFirst, v - step));
    } else if ((isH && e.key === "ArrowRight") || (!isH && e.key === "ArrowDown")) {
      setSplit((v) => Math.min(maxFirst, v + step));
    }
  }, [direction, minFirst, maxFirst]);

  const isH = direction === "horizontal";
  const firstStyle = isH ? { width: `${split}%` } : { height: `${split}%` };
  const secondStyle = isH ? { width: `${100 - split}%` } : { height: `${100 - split}%` };

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      className={twMerge(clsx(
        "flex overflow-hidden",
        isH ? "flex-row" : "flex-col",
        className,
      ))}
    >
      {/* First pane */}
      <div style={firstStyle} className="overflow-hidden min-w-0 min-h-0">
        {first}
      </div>

      {/* Divider */}
      <div
        role="separator"
        aria-orientation={isH ? "vertical" : "horizontal"}
        aria-valuenow={split}
        aria-valuemin={minFirst}
        aria-valuemax={maxFirst}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={onKeyDown}
        className={clsx(
          "shrink-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "bg-zinc-200 dark:bg-zinc-700",
          "hover:bg-blue-300 dark:hover:bg-blue-600",
          "active:bg-blue-400 dark:active:bg-blue-500",
          "transition-colors",
          isH
            ? "w-1 cursor-col-resize hover:w-1.5 active:w-1.5"
            : "h-1 cursor-row-resize hover:h-1.5 active:h-1.5",
        )}
      />

      {/* Second pane */}
      <div style={secondStyle} className="overflow-hidden min-w-0 min-h-0">
        {second}
      </div>
    </div>
  );
}
