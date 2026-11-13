"use client";

import React from "react";
import { Hand, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";

export type TouchChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type TouchChartReadoutItem = {
  key?: string;
  label: string;
  value: React.ReactNode;
  color?: string;
};

export type TouchChartReadout = {
  /** Inspected X-axis category / date / period label */
  label: React.ReactNode;
  items: TouchChartReadoutItem[];
};

export type TouchChartCardProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerExtra?: React.ReactNode;
  /** Optional interactive legend chips to toggle chart series on mobile & desktop */
  series?: TouchChartSeries[];
  /** Keys of currently hidden series */
  hiddenSeriesKeys?: ReadonlySet<string> | string[];
  onToggleSeries?: (seriesKey: string) => void;
  /** Fixed touch inspection readout shown above the chart so finger never obscures values */
  activeReadout?: TouchChartReadout | null;
  onClearReadout?: () => void;
  /** Subtle mobile hint shown in the readout bar when no point is actively touched */
  touchHint?: React.ReactNode;
  /** Show the touch hint bar on mobile even before interaction (default: false) */
  showIdleHintOnMobile?: boolean;
  /** Height className for the chart viewport (default: "h-[230px] sm:h-[300px]") */
  chartHeightClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

function isSeriesHidden(
  hidden: TouchChartCardProps["hiddenSeriesKeys"],
  key: string,
): boolean {
  if (!hidden) return false;
  if (Array.isArray(hidden)) return hidden.includes(key);
  return hidden.has(key);
}

export function TouchChartCard({
  title,
  subtitle,
  icon,
  headerExtra,
  series,
  hiddenSeriesKeys,
  onToggleSeries,
  activeReadout,
  onClearReadout,
  touchHint = "Toque no gráfico para inspecionar valores",
  showIdleHintOnMobile = false,
  chartHeightClassName = "h-[230px] sm:h-[300px]",
  footer,
  children,
  className,
  bodyClassName,
  componentId,
  hideIfDenied = false,
}: TouchChartCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  const hasHeader = Boolean(title || subtitle || icon || headerExtra);
  const hasSeriesChips = Boolean(series && series.length > 0);

  return (
    <section
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn(
        "flex flex-col rounded-[var(--radius-card)] border border-border bg-card text-card-foreground shadow-[var(--shadow-card)] overflow-hidden",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-2.5 px-3.5 sm:px-5 pt-3.5 sm:pt-4 pb-2">
          <div className="flex items-start gap-2.5 min-w-0">
            {icon && (
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerExtra && <div className="shrink-0">{headerExtra}</div>}
        </div>
      )}

      {/* Interactive Series Filter Chips */}
      {hasSeriesChips && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3.5 sm:px-5 pb-2">
          {series!.map((s) => {
            const hidden = isSeriesHidden(hiddenSeriesKeys, s.key);
            const interactive = Boolean(onToggleSeries);
            const Tag = interactive ? "button" : "span";
            return (
              <Tag
                key={s.key}
                {...(interactive
                  ? {
                      type: "button" as const,
                      "aria-pressed": !hidden,
                      onClick: () => onToggleSeries?.(s.key),
                    }
                  : {})}
                className={cn(
                  "inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-all",
                  interactive &&
                    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-95",
                  hidden
                    ? "border-border/60 bg-muted/40 text-muted-foreground opacity-55 line-through"
                    : "border-border bg-surface text-foreground shadow-2xs",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.label}</span>
              </Tag>
            );
          })}
        </div>
      )}

      {/* Sticky Touch Readout Bar (keeps inspected values visible above the finger) */}
      <AnimatePresence initial={false} mode="wait">
        {activeReadout ? (
          <motion.div
            key="active-readout"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
            className="mx-3.5 sm:mx-5 mb-2 flex items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary truncate">
                {activeReadout.label}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                {activeReadout.items.map((item, idx) => (
                  <span
                    key={item.key ?? idx}
                    className="inline-flex items-center gap-1 tabular-nums"
                  >
                    {item.color && (
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <span className="text-muted-foreground text-[11px]">{item.label}:</span>
                    <strong className="font-bold text-foreground">{item.value}</strong>
                  </span>
                ))}
              </div>
            </div>
            {onClearReadout && (
              <button
                type="button"
                aria-label="Limpar inspeção"
                onClick={onClearReadout}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        ) : showIdleHintOnMobile && touchHint ? (
          <div
            key="idle-hint"
            className="mx-3.5 mb-2 flex items-center gap-1.5 rounded-lg bg-muted/45 px-2.5 py-1.5 text-[11px] text-muted-foreground sm:hidden"
          >
            <Hand size={12} className="shrink-0 text-primary/80" />
            <span className="truncate">{touchHint}</span>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Chart Canvas Area */}
      <div
        className={cn(
          "w-full min-w-0 px-2 sm:px-4 pb-3 touch-pan-y select-none",
          chartHeightClassName,
          bodyClassName,
        )}
      >
        {children}
      </div>

      {footer && (
        <div className="border-t border-border/70 bg-muted/20 px-3.5 sm:px-5 py-2.5 text-xs">
          {footer}
        </div>
      )}
    </section>
  );
}

export default TouchChartCard;
