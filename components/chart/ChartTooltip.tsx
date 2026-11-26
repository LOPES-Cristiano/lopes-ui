"use client";

import React from "react";
import { cn } from "../../utils/cn";
import { getChartPalette } from "./palette";
import type { ChartColor } from "./types";

export interface ChartTooltipRow {
  key: string;
  label: string;
  value: string;
  color: ChartColor;
  share?: string;
}

export interface ChartTooltipProps {
  visible: boolean;
  title: string;
  rows: ChartTooltipRow[];
  /** Horizontal anchor in percentage (0..100) relative to chart container */
  xPct: number;
  /** Vertical anchor in percentage (0..100) relative to chart container */
  yPct?: number;
  totalLabel?: string;
  totalValue?: string;
}

export function ChartTooltip({
  visible,
  title,
  rows,
  xPct,
  yPct = 10,
  totalLabel,
  totalValue,
}: ChartTooltipProps) {
  if (!visible || rows.length === 0) return null;

  const clampedX = Math.max(4, Math.min(96, xPct));
  const clampedY = Math.max(4, Math.min(72, yPct));

  const alignClass =
    clampedX < 24
      ? "translate-x-0"
      : clampedX > 76
        ? "-translate-x-full"
        : "-translate-x-1/2";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
      className={cn(
        "pointer-events-none absolute z-30 min-w-[164px] max-w-[240px] rounded-xl border border-border/90 bg-popover/96 backdrop-blur-md px-3 py-2.5 shadow-[var(--shadow-floating)] transition-[left,top,opacity,transform] duration-150",
        alignClass,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-1.5 mb-1.5">
        <span className="text-[11px] font-semibold tracking-tight text-foreground truncate">
          {title}
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => {
          const palette = getChartPalette(row.color);
          return (
            <div
              key={row.key}
              className="flex items-center justify-between gap-3 text-xs leading-none"
            >
              <span className="inline-flex items-center gap-1.5 text-muted-foreground min-w-0">
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full shrink-0", palette.bgClass)}
                />
                <span className="truncate">{row.label}</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5 shrink-0 tabular-nums">
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {row.value}
                </span>
                {row.share && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {row.share}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {totalLabel && totalValue && (
        <div className="mt-2 pt-1.5 border-t border-border/70 flex items-center justify-between gap-3 text-[11px] tabular-nums">
          <span className="font-medium text-muted-foreground">{totalLabel}</span>
          <span className="font-mono font-bold text-foreground">{totalValue}</span>
        </div>
      )}
    </div>
  );
}
