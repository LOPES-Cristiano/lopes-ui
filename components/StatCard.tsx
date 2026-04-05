"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatCardColor =
  | "default" | "indigo" | "blue" | "emerald" | "amber" | "red" | "violet" | "teal";

export type StatCardTrend = {
  value: number;        // e.g. 12.5 (percentage)
  label?: string;       // e.g. "vs. mês anterior"
  inverted?: boolean;   // e.g. for "despesas": going up is bad
};

export type SparkPoint = { value: number };

export type StatCardProps = {
  title: string;
  value: string | number;
  /** Secondary unit or context (e.g. "usuários", "/ mês") */
  unit?: string;
  /** Previous period value — shown as small secondary text */
  previousValue?: string | number;
  trend?: StatCardTrend;
  /** Sparkline data — last N points */
  spark?: SparkPoint[];
  icon?: LucideIcon;
  color?: StatCardColor;
  /** Loading skeleton */
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  componentId?: string;
};

// ── Color maps ────────────────────────────────────────────────────────────────

const COLOR_ICON_BG: Record<StatCardColor, string> = {
  default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
  indigo:  "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
  blue:    "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  amber:   "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
  red:     "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400",
  violet:  "bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
  teal:    "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400",
};

const SPARK_COLOR: Record<StatCardColor, string> = {
  default: "#a1a1aa",
  indigo:  "#6366f1",
  blue:    "#3b82f6",
  emerald: "#10b981",
  amber:   "#f59e0b",
  red:     "#ef4444",
  violet:  "#8b5cf6",
  teal:    "#14b8a6",
};

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: SparkPoint[]; color: string }) {
  if (data.length < 2) return null;

  const W = 80;
  const H = 28;
  const PAD = 2;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${W - PAD},${H - PAD} L ${PAD},${H - PAD} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Trend badge ───────────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: StatCardTrend }) {
  const isPositive = trend.inverted ? trend.value < 0 : trend.value > 0;
  const isNeutral = trend.value === 0;
  const abs = Math.abs(trend.value);

  const cls = twMerge(
    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
    isNeutral
      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
      : isPositive
        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
        : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400",
  );

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span className={cls}>
      <Icon size={10} strokeWidth={2} />
      {isNeutral ? "—" : `${abs.toFixed(abs < 10 ? 1 : 0)}%`}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={twMerge("animate-pulse rounded bg-zinc-100 dark:bg-zinc-800", className)} />
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StatCard({
  title,
  value,
  unit,
  previousValue,
  trend,
  spark,
  icon: Icon,
  color = "default",
  loading = false,
  onClick,
  className,
  componentId,
}: StatCardProps) {
  const sparkColor = SPARK_COLOR[color];

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={twMerge(
        "group/stat relative flex flex-col gap-3 rounded-2xl border border-zinc-100 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900 p-5 text-left w-full",
        onClick && "cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md hover:shadow-zinc-900/5 dark:hover:shadow-black/20 transition-all duration-150",
        className,
      )}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Top row: icon + sparkline */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={twMerge("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", COLOR_ICON_BG[color])}>
              {loading ? <Skeleton className="h-5 w-5 rounded" /> : <Icon size={18} strokeWidth={1.75} />}
            </div>
          )}
          <div className="min-w-0">
            {loading
              ? <Skeleton className="h-3.5 w-24 rounded" />
              : <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">{title}</p>
            }
          </div>
        </div>

        {spark && !loading && (
          <div className="shrink-0 opacity-70 group-hover/stat:opacity-100 transition-opacity">
            <Sparkline data={spark} color={sparkColor} />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-8 w-28 rounded mt-1" />
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                {value}
              </span>
              {unit && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{unit}</span>
              )}
            </div>
          )}

          {/* Previous period */}
          {!loading && previousValue !== undefined && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Anterior: <span className="font-medium text-zinc-500 dark:text-zinc-400">{previousValue}</span>
            </p>
          )}
        </div>

        {/* Trend */}
        {!loading && trend && (
          <div className="shrink-0 flex flex-col items-end gap-0.5">
            <TrendBadge trend={trend} />
            {trend.label && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </Tag>
  );
}
