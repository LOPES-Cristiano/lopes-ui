"use client";

import React, { useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TableSize   = "xs" | "sm" | "md" | "lg";
export type TableVariant = "default" | "striped" | "bordered" | "minimal";
export type TableSortDirection = "asc" | "desc" | null;

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
  /** Pin column to the left or right edge while scrolling horizontally */
  sticky?: "left" | "right";
  /** Enable click-to-sort on this column */
  sortable?: boolean;
  /** Custom comparator when sortable=true */
  sortFn?: (a: T, b: T) => number;
  /** Header className */
  headerClassName?: string;
  /** Cell className */
  cellClassName?: string;
  /** Summary calculation: 'sum' | 'count' | 'avg' | 'min' | 'max' | custom function */
  summary?: "sum" | "count" | "avg" | "min" | "max" | ((rows: T[]) => React.ReactNode);
  /** Label/symbol prepended to calculated summary */
  summaryLabel?: string;
  /** Custom formatter for calculated numeric summary */
  summaryFormat?: (val: number) => React.ReactNode;
  /** Custom className for summary cell */
  summaryClassName?: string;
};

export type TableProps<T = Record<string, unknown>> = {
  columns: TableColumn<T>[];
  rows: T[];
  /** Show skeleton loading rows instead of data */
  loading?: boolean;
  /** Number of skeleton rows when loading=true (default: 5) */
  skeletonRows?: number;
  /** Row key extractor — defaults to `index` */
  rowKey?: (row: T, index: number) => string | number;
  /** Clicked row callback */
  onRowClick?: (row: T, index: number) => void;
  /** Dynamic row className */
  rowClassName?: (row: T, index: number) => string | undefined;
  /** Visual variant */
  variant?: TableVariant;
  /** Alternating row background stripes (daisyUI table-zebra alias) */
  zebra?: boolean;
  /** Cell / row density */
  size?: TableSize;
  /** Alias for size (daisyUI / compact table density) */
  density?: TableSize;
  /** Sticky first header row */
  stickyHeader?: boolean;
  /** Pin header and footer rows while scrolling vertically (daisyUI table-pin-rows alias) */
  pinRows?: boolean;
  /** Show horizontal borders between rows */
  dividers?: boolean;
  /** Highlight row on hover */
  hoverable?: boolean;
  /** Whether to show calculated summary footer */
  showSummary?: boolean;
  /** Manual summary values per column key */
  summaryValues?: Record<string, React.ReactNode>;
  /** Custom footer node */
  footerSlot?: React.ReactNode;
  /** Empty state content */
  emptySlot?: React.ReactNode;
  /** Caption shown below the table */
  caption?: React.ReactNode;
  /** Wrap table in a scroll container */
  scrollable?: boolean;
  /** Rounded corner style */
  rounded?: "none" | "sm" | "md" | "lg" | "xl";
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

// ── Summary helper ────────────────────────────────────────────────────────────

function computeColumnSummary<T>(col: TableColumn<T>, rows: T[]): React.ReactNode {
  if (!col.summary) return null;

  if (typeof col.summary === "function") {
    return col.summary(rows);
  }

  if (col.summary === "count") {
    const label = col.summaryLabel ?? "#";
    return `${label} ${rows.length}`;
  }

  const numericVals = rows
    .map((r) => {
      const val = (r as Record<string, unknown>)[col.key];
      return typeof val === "number" ? val : Number(val);
    })
    .filter((v) => !isNaN(v) && isFinite(v));

  if (numericVals.length === 0) return "-";

  let raw = 0;
  let symbol = "";

  switch (col.summary) {
    case "sum":
      raw = numericVals.reduce((acc, v) => acc + v, 0);
      symbol = col.summaryLabel?.trim() || "";
      if (/^total(:)?$/i.test(symbol)) symbol = "";
      break;
    case "avg":
      raw = numericVals.reduce((acc, v) => acc + v, 0) / numericVals.length;
      symbol = col.summaryLabel ?? "x̄";
      break;
    case "min":
      raw = Math.min(...numericVals);
      symbol = col.summaryLabel ?? "min";
      break;
    case "max":
      raw = Math.max(...numericVals);
      symbol = col.summaryLabel ?? "max";
      break;
  }

  const formatted = col.summaryFormat ? col.summaryFormat(raw) : raw.toLocaleString("pt-BR");
  return symbol ? `${symbol} ${formatted}` : formatted;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Table<T = Record<string, unknown>>({
  columns,
  rows,
  loading = false,
  skeletonRows = 5,
  rowKey,
  onRowClick,
  rowClassName,
  variant = "default",
  zebra = false,
  size,
  density,
  stickyHeader = false,
  pinRows = false,
  dividers = true,
  hoverable = true,
  showSummary = false,
  summaryValues,
  footerSlot,
  emptySlot,
  caption,
  scrollable = true,
  rounded = "xl",
  className,
  tableClassName,
  componentId,
}: TableProps<T>) {
  const effectiveSize: TableSize = density ?? size ?? "md";
  const effectiveStickyHeader = stickyHeader || pinRows;
  const effectiveStriped = variant === "striped" || zebra;
  const { canAccess } = useAccessControl();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<TableSortDirection>(null);

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable) return;
    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      if (col.sortFn) {
        return sortDir === "asc" ? col.sortFn(a, b) : -col.sortFn(a, b);
      }
      const va = (a as Record<string, unknown>)[sortKey];
      const vb = (b as Record<string, unknown>)[sortKey];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va ?? "");
      const sb = String(vb ?? "");
      return sortDir === "asc" ? sa.localeCompare(sb, "pt-BR") : sb.localeCompare(sa, "pt-BR");
    });
    return copy;
  }, [rows, sortKey, sortDir, columns]);

  // Calculate summaries if requested
  const columnSummaries = useMemo(() => {
    if (!showSummary && !summaryValues) return null;
    return columns.map((col) => {
      if (summaryValues && col.key in summaryValues) {
        return summaryValues[col.key];
      }
      return computeColumnSummary(col, sortedRows);
    });
  }, [showSummary, summaryValues, columns, sortedRows]);

  if (componentId && !canAccess(componentId)) {
    return null;
  }

  const headerBg =
    variant === "minimal"
      ? "bg-transparent"
      : "bg-zinc-50 dark:bg-zinc-900";

  const rowClass = (row: T, idx: number) =>
    twMerge(
      effectiveStriped && idx % 2 === 1 ? "bg-zinc-50/70 dark:bg-zinc-800/40" : "bg-white dark:bg-zinc-950",
      dividers && "border-b border-zinc-100 dark:border-zinc-800 last:border-0",
      hoverable && "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60",
      onRowClick && "cursor-pointer",
      rowClassName ? rowClassName(row, idx) : undefined,
    );

  const bordered = variant === "bordered";

  const hasAnySummary = columnSummaries?.some((v) => v !== null && v !== undefined) ?? false;
  const firstSummaryIdx = columnSummaries ? columnSummaries.findIndex((v) => v !== null && v !== undefined) : -1;
  const labelTargetIdx = firstSummaryIdx > 0 ? firstSummaryIdx - 1 : -1;

  const roundedClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge("w-full", className)}
    >
      <div className={twMerge(
        "w-full overflow-hidden border",
        roundedClasses[rounded] ?? "rounded-xl",
        bordered ? "border-zinc-200 dark:border-zinc-700" : "border-zinc-200 dark:border-zinc-800",
        scrollable && "overflow-x-auto",
      )}>
        <table className={twMerge("w-full border-collapse", tableClassName)}>
          {/* Head */}
          <thead>
            <tr className={twMerge(headerBg, bordered && "border-b border-zinc-200 dark:border-zinc-700")}>
              {columns.map((col) => {
                const isSorted = sortKey === col.key && sortDir !== null;
                return (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col) : undefined}
                    className={twMerge(
                      SIZE_TH[effectiveSize],
                      "font-semibold text-zinc-600 dark:text-zinc-400 tracking-wide uppercase whitespace-nowrap",
                      effectiveStickyHeader && "sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 shadow-[0_1px_0_0_#e4e4e7] dark:shadow-[0_1px_0_0_#27272a]",
                      col.sticky === "left" && "sticky left-0 z-20 bg-zinc-50 dark:bg-zinc-900",
                      col.sticky === "right" && "sticky right-0 z-20 bg-zinc-50 dark:bg-zinc-900",
                      col.sortable && "cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200",
                      bordered && "border-x border-zinc-200 dark:border-zinc-700 first:border-l-0 last:border-r-0",
                      ALIGN[col.align ?? "left"],
                      col.headerClassName,
                    )}
                    style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                  >
                    {col.sortable ? (
                      <span className="inline-flex items-center gap-1">
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </span>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr
                  key={`skeleton-${rIdx}`}
                  className={twMerge(
                    "bg-white dark:bg-zinc-950",
                    dividers && "border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={SIZE_TD[effectiveSize]}>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-zinc-400 text-sm"
                >
                  {emptySlot ?? "Nenhum dado encontrado."}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => (
                <tr
                  key={rowKey ? rowKey(row, idx) : idx}
                  className={rowClass(row, idx)}
                  onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                >
                  {columns.map((col) => {
                    const raw = (row as Record<string, unknown>)[col.key];
                    const cell = col.render ? col.render(raw, row, idx) : (raw as React.ReactNode);
                    return (
                      <td
                        key={col.key}
                        className={twMerge(
                          SIZE_TD[effectiveSize],
                          "text-zinc-700 dark:text-zinc-300",
                          col.sticky === "left" && "sticky left-0 z-10 bg-inherit",
                          col.sticky === "right" && "sticky right-0 z-10 bg-inherit",
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

          {/* Summary / Footer */}
          {footerSlot ? (
            <tfoot className="border-t-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-semibold text-xs">
              {footerSlot}
            </tfoot>
          ) : hasAnySummary && columnSummaries && !loading ? (
            <tfoot className="border-t-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50/90 dark:bg-zinc-900/90 font-bold text-xs text-zinc-800 dark:text-zinc-200">
              <tr>
                {columns.map((col, idx) => {
                  let val = columnSummaries[idx];
                  if ((val === null || val === undefined) && idx === labelTargetIdx) {
                    val = (
                      <span className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Total
                      </span>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      className={twMerge(
                        SIZE_TD[effectiveSize],
                        "font-semibold",
                        bordered && "border-x border-zinc-200 dark:border-zinc-700 first:border-l-0 last:border-r-0",
                        ALIGN[col.align ?? (idx === labelTargetIdx ? "right" : "left")],
                        col.summaryClassName,
                      )}
                    >
                      {val ?? ""}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {caption && (
        <p className="mt-2 text-xs text-zinc-400 text-center">{caption}</p>
      )}
    </div>
  );
}
