"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatCardColor =
  | "default"
  | "indigo"
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "violet"
  | "teal";

export type StatCardTrend = {
  value: number; // e.g. 12.5 (percentage)
  label?: string; // e.g. "vs. mês anterior"
  inverted?: boolean; // e.g. for "despesas": going up is bad
};

export type SparkPoint = { value: number; label?: string };

export type StatCardProps = {
  title: string;
  value: string | number;
  /** Secondary unit or context (e.g. "pedidos", "/ mês") */
  unit?: string;
  /** Previous period value — shown as small secondary text */
  previousValue?: string | number;
  trend?: StatCardTrend;
  /** Sparkline data — last N points */
  spark?: SparkPoint[];
  /** Optional progress percentage (0–100) towards a target goal */
  progress?: number;
  /** Optional label for the progress bar (e.g. "82% da meta mensal") */
  progressLabel?: React.ReactNode;
  /** Optional footer slot at the bottom of the card */
  footer?: React.ReactNode;
  icon?: LucideIcon;
  color?: StatCardColor;
  /** Loading skeleton */
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Color maps ────────────────────────────────────────────────────────────────

const COLOR_ICON_BG: Record<StatCardColor, string> = {
  default: "bg-muted text-muted-foreground",
  indigo: "bg-brand-soft text-brand",
  blue: "bg-info-soft text-info",
  emerald: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  violet: "bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
  teal: "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400",
};

const SPARK_COLOR: Record<StatCardColor, string> = {
  default: "var(--surface-muted-foreground)",
  indigo: "var(--brand)",
  blue: "var(--info)",
  emerald: "var(--success)",
  amber: "var(--warning)",
  red: "var(--danger)",
  violet: "#8b5cf6",
  teal: "#14b8a6",
};

const DEFAULT_SEGMENT_PALETTE: string[] = [
  "var(--brand)",
  "var(--success)",
  "var(--warning)",
  "var(--info)",
  "#8b5cf6",
  "#14b8a6",
  "var(--danger)",
];

function resolveStatHexColor(color: StatCardColor | string | undefined, fallbackIndex = 0): string {
  if (!color) return DEFAULT_SEGMENT_PALETTE[fallbackIndex % DEFAULT_SEGMENT_PALETTE.length];
  if (color in SPARK_COLOR) return SPARK_COLOR[color as StatCardColor];
  return color;
}

// ── Sparkline with interactive hover dot & tooltip ────────────────────────────

function Sparkline({ data, color }: { data: SparkPoint[]; color: string }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const gradId = React.useId();

  if (data.length < 2) return null;

  const W = 80;
  const H = 28;
  const PAD = 2;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return { x, y, value: v, label: data[i].label };
  });

  const pts = coords.map((c) => `${c.x},${c.y}`);
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${W - PAD},${H - PAD} L ${PAD},${H - PAD} Z`;
  const activePoint = hoverIdx !== null ? coords[hoverIdx] : null;

  return (
    <div
      className="relative inline-flex items-center"
      onMouseLeave={() => setHoverIdx(null)}
    >
      {activePoint && (
        <div className="pointer-events-none absolute -top-6 right-0 z-10 rounded bg-popover px-1.5 py-0.5 text-[10px] font-mono font-semibold tabular-nums text-popover-foreground border border-border shadow-[var(--shadow-floating)] whitespace-nowrap">
          {activePoint.label ? `${activePoint.label}: ` : ""}
          {activePoint.value.toLocaleString("pt-BR")}
        </div>
      )}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const idx = Math.round(relX * (values.length - 1));
          setHoverIdx(idx);
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {activePoint && (
          <circle cx={activePoint.x} cy={activePoint.y} r={2.5} fill={color} />
        )}
      </svg>
    </div>
  );
}

// ── Trend badge ───────────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: StatCardTrend }) {
  const isPositive = trend.inverted ? trend.value < 0 : trend.value > 0;
  const isNeutral = trend.value === 0;
  const abs = Math.abs(trend.value);

  const cls = twMerge(
    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
    isNeutral
      ? "bg-muted text-muted-foreground"
      : isPositive
        ? "bg-success-soft text-success-soft-foreground"
        : "bg-danger-soft text-danger-soft-foreground",
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
    <div className={twMerge("animate-pulse motion-reduce:animate-none rounded bg-muted", className)} />
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
  progress,
  progressLabel,
  footer,
  icon: Icon,
  color = "default",
  loading = false,
  onClick,
  className,
  componentId,
  hideIfDenied = false,
}: StatCardProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  if (!hasPermission && hideIfDenied) return null;

  const sparkColor = SPARK_COLOR[color];
  const clampedProgress =
    typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      role={onClick && hasPermission ? "button" : undefined}
      tabIndex={onClick && hasPermission ? 0 : undefined}
      onClick={hasPermission ? onClick : undefined}
      onKeyDown={
        onClick && hasPermission
          ? (e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={twMerge(
        "@container/stat group/stat relative flex flex-col gap-1.5 sm:gap-3 rounded-[var(--radius-card)] border border-border",
        "bg-card p-2.5 sm:p-5 text-left text-card-foreground shadow-[var(--shadow-card)] w-full",
        !hasPermission && "opacity-60 pointer-events-none",
        onClick &&
          hasPermission &&
          "cursor-pointer hover:border-border-strong hover:shadow-[var(--shadow-floating)] transition-[border-color,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      {/* Top row: icon + sparkline */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {Icon && (
            <div
              className={twMerge(
                "h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0",
                COLOR_ICON_BG[color],
              )}
            >
              {loading ? (
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
              ) : (
                <Icon className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {loading ? (
              <Skeleton className="h-3 sm:h-3.5 w-16 sm:w-24 rounded" />
            ) : (
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                {title}
              </p>
            )}
          </div>
        </div>

        {spark && !loading && (
          <div className="hidden sm:block shrink-0 opacity-75 group-hover/stat:opacity-100 transition-opacity">
            <Sparkline data={spark} color={sparkColor} />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-28 rounded mt-1" />
          ) : (
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-base sm:text-2xl font-black tracking-tight tabular-nums text-foreground leading-none">
                {value}
              </span>
              {unit && (
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {unit}
                </span>
              )}
            </div>
          )}

          {/* Previous period */}
          {!loading && previousValue !== undefined && (
            <p className="hidden sm:block text-[11px] text-muted-foreground mt-1 tabular-nums">
              Anterior:{" "}
              <span className="font-medium text-foreground/80">{previousValue}</span>
            </p>
          )}
        </div>

        {/* Trend */}
        {!loading && trend && (
          <div className="shrink-0 flex flex-col items-end gap-0.5">
            <TrendBadge trend={trend} />
            {trend.label && (
              <span className="hidden sm:block text-[10px] text-muted-foreground whitespace-nowrap">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Target Goal Progress Bar */}
      {!loading && clampedProgress !== undefined && (
        <div className="mt-1 flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${clampedProgress}%`, backgroundColor: sparkColor }}
            />
          </div>
          {progressLabel && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{progressLabel}</span>
              <span className="font-mono font-semibold tabular-nums">{Math.round(clampedProgress)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Optional Footer */}
      {!loading && footer && (
        <div className="mt-1 border-t border-border/80 pt-2.5 text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}

// ── StatGroup (joined stats container with dividers) ─────────────────────────

export type StatGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function StatGroup({
  orientation = "horizontal",
  className,
  children,
  ...props
}: StatGroupProps) {
  return (
    <div
      className={twMerge(
        "inline-flex w-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]",
        orientation === "vertical"
          ? "flex-col divide-y divide-border"
          : "flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border",
        "[&>*]:flex-1 [&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── StatsSegmentsCard (Mantine UI "Stats with segments" variation) ───────────

export type StatSegment = {
  label: string;
  value: string | number;
  /** Percentage share (0–100) */
  share: number;
  color?: StatCardColor | string;
};

export type StatsSegmentsCardProps = {
  title: string;
  totalValue: string | number;
  subtitle?: string;
  trend?: StatCardTrend;
  icon?: LucideIcon;
  segments: StatSegment[];
  loading?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

export function StatsSegmentsCard({
  title,
  totalValue,
  subtitle,
  trend,
  icon: Icon,
  segments,
  loading = false,
  className,
  componentId,
  hideIfDenied = false,
}: StatsSegmentsCardProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!hasPermission && hideIfDenied) return null;

  const totalShare = segments.reduce((acc, s) => acc + Math.max(0, s.share), 0) || 100;

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-card p-5 text-card-foreground shadow-[var(--shadow-card)]",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            {loading ? (
              <Skeleton className="h-8 w-36 rounded" />
            ) : (
              <span className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums text-foreground leading-none">
                {totalValue}
              </span>
            )}
            {!loading && trend && <TrendBadge trend={trend} />}
          </div>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
            {title}
            {subtitle ? <span className="opacity-75"> · {subtitle}</span> : null}
          </p>
        </div>

        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
            <Icon size={20} strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Multi-segment stacked bar */}
      {loading ? (
        <Skeleton className="h-4 w-full rounded-full" />
      ) : (
        <div
          className="flex h-4 w-full overflow-hidden rounded-lg bg-muted p-0.5 gap-0.5"
          role="img"
          aria-label={`Distribuição de ${title}`}
        >
          {segments.map((seg, i) => {
            const widthPct = Math.max(0, (seg.share / totalShare) * 100);
            const hex = resolveStatHexColor(seg.color, i);
            const dimmed = hoveredIdx !== null && hoveredIdx !== i;
            return (
              <div
                key={`${seg.label}-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ width: `${widthPct}%`, backgroundColor: hex }}
                title={`${seg.label}: ${seg.value} (${seg.share}%)`}
                className={twMerge(
                  "flex items-center justify-center rounded-[5px] text-[10px] font-bold text-white transition-opacity duration-150 select-none overflow-hidden",
                  dimmed && "opacity-45",
                )}
              >
                {widthPct >= 14 ? `${Math.round(seg.share)}%` : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Breakdown columns */}
      <div
        className="grid gap-3 pt-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(Math.max(segments.length, 1), 4)}, minmax(0, 1fr))`,
        }}
      >
        {segments.map((seg, i) => {
          const hex = resolveStatHexColor(seg.color, i);
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={`${seg.label}-col-${i}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ borderBottomColor: hex }}
              className={twMerge(
                "flex flex-col justify-between gap-1 border-b-[3px] pb-2 transition-opacity duration-150",
                hoveredIdx !== null && !isHovered && "opacity-55",
              )}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {seg.label}
              </span>
              <div className="flex items-baseline justify-between gap-1.5 flex-wrap tabular-nums">
                <span className="text-sm font-bold text-foreground">{seg.value}</span>
                <span className="text-xs font-mono font-semibold" style={{ color: hex }}>
                  {seg.share}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── StatsRingCard (Mantine UI "Stats with ring progress" variation) ──────────

export type StatsRingMetric = {
  label: string;
  value: string | number;
};

export type StatsRingCardProps = {
  title: string;
  /** Main KPI value (e.g. "1.840" or "R$ 412.500") */
  value: string | number;
  /** Secondary caption next to or under main value (e.g. "entregas concluídas") */
  subtitle?: string;
  /** Progress percentage 0–100 */
  progress: number;
  /** Custom label inside the ring center (defaults to `${Math.round(progress)}%`) */
  ringLabel?: React.ReactNode;
  /** Ring diameter in px. Default: 96 */
  ringSize?: number;
  /** Ring stroke thickness in px. Default: 9 */
  thickness?: number;
  color?: StatCardColor;
  /** Optional secondary metrics row */
  stats?: StatsRingMetric[];
  loading?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

export function StatsRingCard({
  title,
  value,
  subtitle,
  progress,
  ringLabel,
  ringSize = 96,
  thickness = 9,
  color = "indigo",
  stats,
  loading = false,
  className,
  componentId,
  hideIfDenied = false,
}: StatsRingCardProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  if (!hasPermission && hideIfDenied) return null;

  const clamped = Math.max(0, Math.min(100, progress));
  const strokeColor = SPARK_COLOR[color];
  const radius = (ringSize - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-border bg-card p-5 text-card-foreground shadow-[var(--shadow-card)]",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {/* Left metrics */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <p className="text-sm font-bold text-foreground truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            {loading ? (
              <Skeleton className="h-7 w-24 rounded" />
            ) : (
              <>
                <span className="text-2xl font-black tracking-tight tabular-nums text-foreground leading-none">
                  {value}
                </span>
                {subtitle && (
                  <span className="text-xs font-medium text-muted-foreground">{subtitle}</span>
                )}
              </>
            )}
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/70 pt-2.5">
            {stats.map((st, idx) => (
              <div key={`${st.label}-${idx}`} className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {st.label}
                </p>
                <p className="text-sm font-bold tabular-nums text-foreground">{st.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right radial ring */}
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: ringSize, height: ringSize }}
      >
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="-rotate-90"
          aria-label={`${Math.round(clamped)}%`}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-muted"
          />
          {!loading && (
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={thickness}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
            />
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {loading ? (
            <Skeleton className="h-4 w-9 rounded" />
          ) : (
            <span className="text-sm font-black tracking-tight tabular-nums text-foreground">
              {ringLabel ?? `${Math.round(clamped)}%`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
