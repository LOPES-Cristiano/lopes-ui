"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";

export type PaginationProps = {
  /** 1-based current page */
  page: number;
  /** Total number of pages (optional if totalItems and pageSize are provided) */
  totalPages?: number;
  /** Total number of records */
  totalItems?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Available page size options (e.g. [10, 25, 50, 100]) */
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /** Number of sibling page buttons around the active page */
  siblingCount?: number;
  /** Show First / Last jump buttons */
  showEdges?: boolean;
  /** Show "Mostrando X-Y de Z" summary text */
  showSummary?: boolean;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

function buildPageRange(current: number, total: number, siblings: number): (number | "ellipsis")[] {
  const totalNumbers = siblings * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblings;
    const leftRange = Array.from({ length: leftCount }, (_, i) => i + 1);
    return [...leftRange, "ellipsis", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblings;
    const rightRange = Array.from({ length: rightCount }, (_, i) => total - rightCount + i + 1);
    return [1, "ellipsis", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, "ellipsis", ...middleRange, "ellipsis", total];
}

export default function Pagination({
  page,
  totalPages: totalPagesProp,
  totalItems,
  pageSize = 10,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  siblingCount = 1,
  showEdges = true,
  showSummary = true,
  size = "sm",
  disabled = false,
  className,
}: PaginationProps) {
  const totalPages = useMemo(() => {
    if (totalPagesProp !== undefined) return Math.max(1, totalPagesProp);
    if (totalItems !== undefined && pageSize > 0) {
      return Math.max(1, Math.ceil(totalItems / pageSize));
    }
    return 1;
  }, [totalPagesProp, totalItems, pageSize]);

  const safePage = Math.max(1, Math.min(totalPages, page));
  const pages = useMemo(
    () => buildPageRange(safePage, totalPages, siblingCount),
    [safePage, totalPages, siblingCount],
  );

  const btnSizeCls = size === "sm" ? "h-8 min-w-8 px-2 text-xs" : "h-9 min-w-9 px-2.5 text-sm";

  const startItem = totalItems && totalItems > 0 ? (safePage - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(safePage * pageSize, totalItems) : 0;

  return (
    <nav
      role="navigation"
      aria-label="Paginação"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
        {showSummary && totalItems !== undefined && (
          <span className="tabular-nums">
            Mostrando <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{startItem}</strong>–
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{endItem}</strong> de{" "}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</strong>
          </span>
        )}

        {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <label className="inline-flex items-center gap-1.5">
            <span>Por página:</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none focus:border-primary"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="inline-flex items-center justify-center sm:justify-end gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
        {showEdges && (
          <button
            type="button"
            aria-label="Primeira página"
            disabled={disabled || safePage <= 1}
            onClick={() => onPageChange(1)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
              btnSizeCls,
            )}
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        <button
          type="button"
          aria-label="Página anterior"
          disabled={disabled || safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
            btnSizeCls,
          )}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Compact mobile indicator (< 640px) */}
        <span className="sm:hidden inline-flex items-center justify-center px-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums">
          {safePage} <span className="mx-1 text-zinc-400 font-normal">/</span> {totalPages}
        </span>

        {pages.map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              aria-hidden="true"
              className={cn("hidden sm:inline-flex items-center justify-center text-zinc-400", btnSizeCls)}
            >
              <MoreHorizontal size={14} />
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === safePage ? "page" : undefined}
              disabled={disabled}
              onClick={() => onPageChange(item)}
              className={cn(
                "hidden sm:inline-flex items-center justify-center rounded-lg font-medium tabular-nums transition-colors cursor-pointer",
                btnSizeCls,
                item === safePage
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Próxima página"
          disabled={disabled || safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
            btnSizeCls,
          )}
        >
          <ChevronRight size={14} />
        </button>

        {showEdges && (
          <button
            type="button"
            aria-label="Última página"
            disabled={disabled || safePage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
              btnSizeCls,
            )}
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </nav>
  );
}
