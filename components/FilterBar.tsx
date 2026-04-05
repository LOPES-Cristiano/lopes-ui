"use client";

import React from "react";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FilterChip = {
  /** Unique key */
  id: string;
  /** Human-readable label */
  label: string;
  /** Optional: value shown next to label, e.g. the chosen option */
  value?: string;
};

export type FilterBarProps = {
  filters: FilterChip[];
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
  /** Label shown on the "clear all" button. Default: "Limpar tudo" */
  clearAllLabel?: string;
  /** Hide the "clear all" button. Default: false */
  hideClearAll?: boolean;
  className?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function FilterBar({
  filters,
  onRemove,
  onClearAll,
  clearAllLabel = "Limpar tudo",
  hideClearAll = false,
  className,
}: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div
      className={twMerge(clsx(
        "flex flex-wrap items-center gap-2",
        className,
      ))}
      role="list"
      aria-label="Filtros ativos"
    >
      {filters.map((chip) => (
        <span
          key={chip.id}
          role="listitem"
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-3 py-1",
            "text-sm font-medium",
            "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
            "border border-zinc-200 dark:border-zinc-700",
          )}
        >
          <span>{chip.label}</span>
          {chip.value && (
            <span className="text-zinc-400 dark:text-zinc-500">: {chip.value}</span>
          )}
          {onRemove && (
            <button
              type="button"
              aria-label={`Remover filtro ${chip.label}`}
              onClick={() => onRemove(chip.id)}
              className={clsx(
                "ml-0.5 rounded-full p-0.5",
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

      {!hideClearAll && filters.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className={clsx(
            "text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
            "underline underline-offset-2 transition-colors",
          )}
        >
          {clearAllLabel}
        </button>
      )}
    </div>
  );
}
