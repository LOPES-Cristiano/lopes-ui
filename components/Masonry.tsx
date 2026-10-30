"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import { twMerge } from "tailwind-merge";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MasonryResponsiveColumns = {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

export type MasonryItem = {
  key: string | number;
  /** Optional relative height hint to balance columns even more evenly */
  heightHint?: number;
  children: React.ReactNode;
};

export type MasonryProps = {
  /** Number of columns or responsive breakpoint map (default: `{ base: 1, sm: 2, lg: 3 }`) */
  columns?: number | MasonryResponsiveColumns;
  /** Gap between columns and cards in px (default: 16) */
  gap?: number;
  /** Declarative items array (optional — you can also pass JSX `children` directly) */
  items?: readonly MasonryItem[];
  children?: React.ReactNode;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Breakpoint resolver ───────────────────────────────────────────────────────

function resolveColumnCount(
  columns: number | MasonryResponsiveColumns,
  viewportWidth: number
): number {
  if (typeof columns === "number") return Math.max(1, columns);
  if (viewportWidth >= 1280 && columns.xl !== undefined) return Math.max(1, columns.xl);
  if (viewportWidth >= 1024 && columns.lg !== undefined) return Math.max(1, columns.lg);
  if (viewportWidth >= 768 && columns.md !== undefined) return Math.max(1, columns.md);
  if (viewportWidth >= 640 && columns.sm !== undefined) return Math.max(1, columns.sm);
  return Math.max(1, columns.base ?? 1);
}

function subscribeViewportResize(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resize", onStoreChange, { passive: true });
  return () => window.removeEventListener("resize", onStoreChange);
}

function getViewportWidthSnapshot(): number {
  return typeof window !== "undefined" ? window.innerWidth : 1024;
}

function getServerViewportWidthSnapshot(): number {
  return 1024;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Masonry({
  columns = { base: 1, sm: 2, lg: 3 },
  gap = 16,
  items,
  children,
  className,
  componentId,
  hideIfDenied = true,
}: MasonryProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const viewportWidth = useSyncExternalStore(
    subscribeViewportResize,
    getViewportWidthSnapshot,
    getServerViewportWidthSnapshot
  );

  const colCount = useMemo(
    () => resolveColumnCount(columns, viewportWidth),
    [columns, viewportWidth]
  );

  const normalizedEntries = useMemo((): MasonryItem[] => {
    if (items && items.length > 0) return Array.from(items);
    return React.Children.toArray(children).map((child, idx) => ({
      key: React.isValidElement(child) && child.key !== null ? String(child.key) : idx,
      children: child,
    }));
  }, [items, children]);

  const distributedColumns = useMemo(() => {
    const buckets: MasonryItem[][] = Array.from({ length: colCount }, () => []);
    const heights = new Array<number>(colCount).fill(0);

    normalizedEntries.forEach((entry, index) => {
      if (entry.heightHint !== undefined && entry.heightHint > 0) {
        let shortestIdx = 0;
        for (let c = 1; c < colCount; c++) {
          if (heights[c] < heights[shortestIdx]) shortestIdx = c;
        }
        buckets[shortestIdx].push(entry);
        heights[shortestIdx] += entry.heightHint + gap;
      } else {
        const colIdx = index % colCount;
        buckets[colIdx].push(entry);
      }
    });

    return buckets;
  }, [normalizedEntries, colCount, gap]);

  if (!hasPermission && hideIfDenied) return null;

  return (
    <div
      data-component-id={componentId}
      style={{ gap }}
      className={twMerge("flex w-full items-start", className)}
    >
      {distributedColumns.map((bucket, colIdx) => (
        <div
          key={`masonry-col-${colIdx}`}
          style={{ gap }}
          className="flex min-w-0 flex-1 flex-col"
        >
          {bucket.map((entry) => (
            <div key={entry.key} className="w-full min-w-0">
              {entry.children}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
