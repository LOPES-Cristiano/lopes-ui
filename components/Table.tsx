"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TableSize   = "xs" | "sm" | "md" | "lg";
export type TableVariant = "default" | "striped" | "bordered" | "minimal";

export type TableColumn<T = Record<string, unknown>> = {
  /** Unique key — also used to read `row[key]` when no `render` is provided */
  key: string;
  /** Column header label */
  label: React.ReactNode;
  /** Custom cell renderer */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Horizontal alignment */
  align?: "left" | "center" | "right";
  /** Fixed column width (CSS value) */
  width?: string;
  /** Header className */
  headerClassName?: string;
  /** Cell className */
  cellClassName?: string;
};

export type TableProps<T = Record<string, unknown>> = {
  columns: TableColumn<T>[];
  rows: T[];
  /** Row key extractor — defaults to `index` */
  rowKey?: (row: T, index: number) => string | number;
  /** Clicked row callback */
  onRowClick?: (row: T, index: number) => void;
  /** Visual variant */
  variant?: TableVariant;
  /** Cell / row density */
  size?: TableSize;
  /** Sticky first header row */
  stickyHeader?: boolean;
  /** Show horizontal borders between rows */
  dividers?: boolean;
  /** Highlight row on hover */
  hoverable?: boolean;
  /** Empty state content */
  emptySlot?: React.ReactNode;
  /** Caption shown below the table */
  caption?: React.ReactNode;
  /** Wrap table in a scroll container */
  scrollable?: boolean;
  className?: string;
  tableClassName?: string;
  componentId?: string;
};

// ── Style helpers ─────────────────────────────────────────────────────────────

const SIZE_TH: Record<TableSize, string> = {
  xs: "px-3 py-1.5 text-[11px]",
  sm: "px-3 py-2   text-xs",
  md: "px-4 py-3   text-xs",
  lg: "px-5 py-4   text-sm",
};

const SIZE_TD: Record<TableSize, string> = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-3 py-2   text-sm",
  md: "px-4 py-3   text-sm",
  lg: "px-5 py-4   text-base",
};

const ALIGN: Record<string, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Table<T = Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  onRowClick,
  variant = "default",
  size = "md",
  stickyHeader = false,
  dividers = true,
  hoverable = true,
  emptySlot,
  caption,
  scrollable = true,
  className,
  tableClassName,
  componentId,
}: TableProps<T>) {
  const headerBg =
    variant === "minimal"
      ? "bg-transparent"
      : "bg-zinc-50 dark:bg-zinc-900";

  const rowClass = (idx: number) =>
    twMerge(
      variant === "striped" && idx % 2 === 1 ? "bg-zinc-50/70 dark:bg-zinc-800/40" : "bg-white dark:bg-zinc-950",
      dividers && "border-b border-zinc-100 dark:border-zinc-800 last:border-0",
      hoverable && "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60",
      onRowClick && "cursor-pointer",
    );

  const bordered = variant === "bordered";

  return (
    <div
      className={twMerge("w-full", className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      <div className={twMerge(
        "w-full rounded-xl overflow-hidden border",
        bordered ? "border-zinc-200 dark:border-zinc-700" : "border-zinc-200 dark:border-zinc-800",
        scrollable && "overflow-x-auto",
      )}>
        <table className={twMerge("w-full border-collapse", tableClassName)}>
          {/* Head */}
          <thead>
            <tr className={twMerge(headerBg, bordered && "border-b border-zinc-200 dark:border-zinc-700")}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={twMerge(
                    SIZE_TH[size],
                    "font-semibold text-zinc-600 dark:text-zinc-400 tracking-wide uppercase whitespace-nowrap",
                    stickyHeader && "sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 shadow-[0_1px_0_0_#e4e4e7] dark:shadow-[0_1px_0_0_#27272a]",
                    bordered && "border-x border-zinc-200 dark:border-zinc-700 first:border-l-0 last:border-r-0",
                    ALIGN[col.align ?? "left"],
                    col.headerClassName,
                  )}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-zinc-400 text-sm"
                >
                  {emptySlot ?? "Nenhum dado encontrado."}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={rowKey ? rowKey(row, idx) : idx}
                  className={rowClass(idx)}
                  onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                >
                  {columns.map((col) => {
                    const raw = (row as Record<string, unknown>)[col.key];
                    const cell = col.render ? col.render(raw, row, idx) : (raw as React.ReactNode);
                    return (
                      <td
                        key={col.key}
                        className={twMerge(
                          SIZE_TD[size],
                          "text-zinc-700 dark:text-zinc-300",
                          bordered && "border-x border-zinc-100 dark:border-zinc-800 first:border-l-0 last:border-r-0",
                          ALIGN[col.align ?? "left"],
                          col.cellClassName,
                        )}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {caption && (
        <p className="mt-2 text-xs text-zinc-400 text-center">{caption}</p>
      )}
    </div>
  );
}
