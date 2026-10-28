"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type FilterChip = {
  id: string;
  label: string;
  operator?: string;
  value?: string;
  icon?: React.ReactNode;
};

export type FilterBarProps = {
  filters: FilterChip[];
  onRemove?: (id: string) => void;
  /** Called when a filter chip itself is clicked (e.g. to open an inline editor) */
  onFilterClick?: (chip: FilterChip) => void;
  onClearAll?: () => void;
  clearAllLabel?: string;
  hideClearAll?: boolean;
  /** Collapse extra filters behind a "+N filtros" pill when count exceeds this number */
  maxVisibleFilters?: number;
  className?: string;
};

export default function FilterBar({
  filters,
  onRemove,
  onFilterClick,
  onClearAll,
  clearAllLabel = "Limpar tudo",
  hideClearAll = false,
  maxVisibleFilters,
  className,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  if (filters.length === 0) return null;

  const shouldCollapse =
    maxVisibleFilters !== undefined && filters.length > maxVisibleFilters && !expanded;
  const visibleFilters = shouldCollapse ? filters.slice(0, maxVisibleFilters) : filters;
  const hiddenCount = filters.length - visibleFilters.length;

  return (
    <div
      className={twMerge(clsx("flex flex-wrap items-center gap-2", className))}
      role="list"
      aria-label="Filtros ativos"
    >
      {visibleFilters.map((chip) => (
        <span
          key={chip.id}
          role="listitem"
          onClick={onFilterClick ? () => onFilterClick(chip) : undefined}
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-3 py-1",
            "text-sm font-medium",
            "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
            "border border-zinc-200 dark:border-zinc-700",
            onFilterClick && "cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors",
          )}
        >
          {chip.icon && <span className="shrink-0 opacity-70">{chip.icon}</span>}
          <span>{chip.label}</span>
          {chip.value && (
            <span className="text-zinc-500 dark:text-zinc-400">
              {chip.operator ? ` ${chip.operator} ` : ": "}
              <strong className="font-semibold text-zinc-800 dark:text-zinc-100">{chip.value}</strong>
            </span>
          )}
          {onRemove && (
            <button
              data-component-id={`erp.filter-bar.remove-${chip.id}`}
              type="button"
              aria-label={`Remover filtro ${chip.label}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(chip.id);
              }}
              className={clsx(
                "ml-0.5 rounded-full p-0.5 cursor-pointer",
                "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "transition-colors",
              )}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          +{hiddenCount} {hiddenCount === 1 ? "filtro" : "filtros"}
        </button>
      )}

      {!hideClearAll && filters.length > 1 && onClearAll && (
        <button
          data-component-id="erp.filter-bar.clear-all"
          type="button"
          onClick={onClearAll}
          className={clsx(
            "text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
            "underline underline-offset-2 transition-colors cursor-pointer",
          )}
        >
          {clearAllLabel}
        </button>
      )}
    </div>
  );
}
