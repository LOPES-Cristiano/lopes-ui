"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal" | "both";
  maxHeight?: number | string;
  /** Renders subtle top/bottom (or left/right) fade shadows when content is scrollable */
  showScrollShadows?: boolean;
  viewportClassName?: string;
};

export default function ScrollArea({
  orientation = "vertical",
  maxHeight,
  showScrollShadows = false,
  viewportClassName,
  className,
  style,
  children,
  ...props
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [shadows, setShadows] = useState({
    top: false,
    bottom: false,
    left: false,
    right: false,
  });

  const updateShadows = useCallback(() => {
    const el = viewportRef.current;
    if (!el || !showScrollShadows) return;

    const top = el.scrollTop > 4;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;

    setShadows({ top, bottom, left, right });
  }, [showScrollShadows]);

  useEffect(() => {
    if (!showScrollShadows) return;
    updateShadows();
    window.addEventListener("resize", updateShadows);
    return () => window.removeEventListener("resize", updateShadows);
  }, [showScrollShadows, updateShadows, children]);

  return (
    <div
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      style={style}
      {...props}
    >
      {showScrollShadows && shadows.top && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5 bg-gradient-to-b from-white dark:from-zinc-900 to-transparent"
        />
      )}
      {showScrollShadows && shadows.left && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent"
        />
      )}

      <div
        ref={viewportRef}
        onScroll={showScrollShadows ? updateShadows : undefined}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
        className={cn(
          "h-full w-full rounded-[inherit]",
          orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
          orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
          orientation === "both" && "overflow-auto",
          "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/80 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600",
          viewportClassName,
        )}
      >
        {children}
      </div>

      {showScrollShadows && shadows.bottom && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent"
        />
      )}
      {showScrollShadows && shadows.right && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent"
        />
      )}
    </div>
  );
}
