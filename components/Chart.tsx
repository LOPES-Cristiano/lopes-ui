"use client";

import React, { useId, useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { useAccessControl, type AccessControlProps } from "./useAccessControl";

export type ChartColor = "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "zinc";

export interface ChartSeries {
  key: string;
  label: string;
  color?: ChartColor;
}

export interface ChartDataPoint {
  label: string;
  [key: string]: string | number;
}

export interface ChartProps extends AccessControlProps {
  /** Tipo de gráfico */
  type?: "bar" | "area" | "line" | "donut";
  /** Dados do gráfico */
  data: ChartDataPoint[];
  /** Séries para gráficos bar / area / line */
  series?: ChartSeries[];
  /** Chave de valor para gráfico donut (default: "value") */
  valueKey?: string;
  /** Altura do gráfico em pixels */
  height?: number;
  /** Título opcional no cabeçalho do card */
  title?: string;
  /** Subtítulo / descrição opcional */
  subtitle?: string;
  /** Exibe legenda das séries */
  showLegend?: boolean;
  /** Exibe linhas de grade horizontais */
  showGrid?: boolean;
  /** Empilha barras no modo bar */
  stacked?: boolean;
  /** Função para formatar valores numéricos (ex: moeda, %) */
  valueFormatter?: (value: number) => string;
  /** Texto central no gráfico de rosca (Donut) */
  centerLabel?: string;
  /** Subtexto central no gráfico de rosca (Donut) */
  centerSublabel?: string;
  /** Envolve em container com borda/card */
  bordered?: boolean;
  className?: string;
}

const COLOR_PALETTE: Record<
  ChartColor,
  { stroke: string; fill: string; hex: string; bgClass: string; textClass: string }
> = {
  indigo: {
    stroke: "#4f46e5",
    fill: "#6366f1",
    hex: "#4f46e5",
    bgClass: "bg-indigo-600",
    textClass: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    stroke: "#059669",
    fill: "#10b981",
    hex: "#10b981",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    stroke: "#d97706",
    fill: "#f59e0b",
    hex: "#f59e0b",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    stroke: "#e11d48",
    fill: "#f43f5e",
    hex: "#f43f5e",
    bgClass: "bg-rose-500",
    textClass: "text-rose-600 dark:text-rose-400",
  },
  sky: {
    stroke: "#0284c7",
    fill: "#0ea5e9",
    hex: "#0ea5e9",
    bgClass: "bg-sky-500",
    textClass: "text-sky-600 dark:text-sky-400",
  },
  violet: {
    stroke: "#7c3aed",
    fill: "#8b5cf6",
    hex: "#8b5cf6",
    bgClass: "bg-violet-500",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  zinc: {
    stroke: "#52525b",
    fill: "#71717a",
    hex: "#71717a",
    bgClass: "bg-zinc-500",
    textClass: "text-zinc-600 dark:text-zinc-400",
  },
};

const DEFAULT_COLORS: ChartColor[] = ["indigo", "emerald", "amber", "rose", "sky", "violet", "zinc"];

const defaultFormat = (v: number) => v.toLocaleString("pt-BR");

export default function Chart({
  type = "bar",
  data,
  series,
  valueKey = "value",
  height = 240,
  title,
  subtitle,
  showLegend = true,
  showGrid = true,
  stacked = false,
  valueFormatter = defaultFormat,
  centerLabel,
  centerSublabel,
  bordered = true,
  className,
  permission,
  role,
  permissions,
  roles,
  requireAll,
  onUnauthorized,
  fallback = null,
}: ChartProps) {
  const uid = useId().replace(/:/g, "");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const access = useAccessControl({
    permission,
    role,
    permissions,
    roles,
    requireAll,
    onUnauthorized,
  });

  const resolvedSeries: Required<ChartSeries>[] = useMemo(() => {
    if (series && series.length > 0) {
      return series.map((s, idx) => ({
        key: s.key,
        label: s.label,
        color: s.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      }));
    }
    if (data.length === 0) return [{ key: valueKey, label: "Valor", color: "indigo" }];
    const keys = Object.keys(data[0]).filter((k) => k !== "label" && k !== "color" && typeof data[0][k] === "number");
    if (keys.length === 0) return [{ key: valueKey, label: "Valor", color: "indigo" }];
    return keys.map((k, idx) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    }));
  }, [series, data, valueKey]);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 100;
    let max = 0;
    for (const d of data) {
      if (stacked && type === "bar") {
        const sum = resolvedSeries.reduce((acc, s) => acc + (Number(d[s.key]) || 0), 0);
        if (sum > max) max = sum;
      } else {
        for (const s of resolvedSeries) {
          const val = Number(d[s.key]) || 0;
          if (val > max) max = val;
        }
      }
    }
    return max <= 0 ? 100 : Math.ceil(max * 1.1);
  }, [data, resolvedSeries, stacked, type]);

  if (!access.allowed) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        bordered && "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5",
        className
      )}
    >
      {/* Header & Legend */}
      {(title || subtitle || (showLegend && type !== "donut" && resolvedSeries.length > 1)) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          {showLegend && type !== "donut" && (
            <div className="flex flex-wrap items-center gap-3">
              {resolvedSeries.map((s) => {
                const palette = COLOR_PALETTE[s.color];
                return (
                  <div key={s.key} className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className={cn("size-2.5 rounded-sm shrink-0", palette.bgClass)} />
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      {type === "donut" ? (
        <DonutChartBody
          data={data}
          valueKey={valueKey}
          height={height}
          valueFormatter={valueFormatter}
          centerLabel={centerLabel}
          centerSublabel={centerSublabel}
          showLegend={showLegend}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
        />
      ) : type === "bar" ? (
        <BarChartBody
          data={data}
          series={resolvedSeries}
          maxValue={maxValue}
          height={height}
          showGrid={showGrid}
          stacked={stacked}
          valueFormatter={valueFormatter}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
        />
      ) : (
        <AreaLineChartBody
          uid={uid}
          type={type}
          data={data}
          series={resolvedSeries}
          maxValue={maxValue}
          height={height}
          showGrid={showGrid}
          valueFormatter={valueFormatter}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
        />
      )}
    </div>
  );
}

/* ── Bar Chart Body ──────────────────────────────────────────────────────── */

function BarChartBody({
  data,
  series,
  maxValue,
  height,
  showGrid,
  stacked,
  valueFormatter,
  hoveredIndex,
  setHoveredIndex,
}: {
  data: ChartDataPoint[];
  series: Required<ChartSeries>[];
  maxValue: number;
  height: number;
  showGrid: boolean;
  stacked: boolean;
  valueFormatter: (v: number) => string;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
}) {
  const ticks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div className="relative select-none" style={{ height }}>
      {/* Horizontal grid lines */}
      {showGrid && (
        <div className="absolute inset-0 bottom-6 flex flex-col justify-between pointer-events-none">
          {ticks.map((t) => (
            <div key={t} className="flex items-center gap-2 w-full">
              <span className="w-12 text-right text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                {valueFormatter(Math.round(maxValue * t))}
              </span>
              <div className="flex-1 border-b border-dashed border-zinc-200/80 dark:border-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {/* Bars container */}
      <div
        className={cn(
          "relative h-full flex items-end justify-between gap-2 pb-6 pt-2",
          showGrid ? "pl-14" : "pl-0"
        )}
      >
        {data.map((item, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={item.label + i}
              className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Hover Tooltip */}
              {isHovered && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 shadow-lg min-w-[130px] whitespace-nowrap">
                  <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                    {item.label}
                  </p>
                  <div className="space-y-1">
                    {series.map((s) => {
                      const val = Number(item[s.key]) || 0;
                      const palette = COLOR_PALETTE[s.color];
                      return (
                        <div key={s.key} className="flex items-center justify-between gap-3 text-xs">
                          <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                            <span className={cn("size-2 rounded-full", palette.bgClass)} />
                            {s.label}
                          </span>
                          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                            {valueFormatter(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bars */}
              <div
                className={cn(
                  "w-full max-w-[44px] h-full flex items-end justify-center gap-1 px-0.5 rounded-t-md transition-colors",
                  isHovered && "bg-zinc-100/60 dark:bg-zinc-800/40"
                )}
              >
                {stacked ? (
                  <div className="w-full h-full flex flex-col-reverse justify-start overflow-hidden rounded-t-md">
                    {series.map((s) => {
                      const val = Number(item[s.key]) || 0;
                      const pct = Math.max(0, Math.min(100, (val / maxValue) * 100));
                      const palette = COLOR_PALETTE[s.color];
                      return (
                        <div
                          key={s.key}
                          style={{ height: `${pct}%` }}
                          className={cn("w-full transition-all duration-300", palette.bgClass)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  series.map((s) => {
                    const val = Number(item[s.key]) || 0;
                    const pct = Math.max(val > 0 ? 2 : 0, Math.min(100, (val / maxValue) * 100));
                    const palette = COLOR_PALETTE[s.color];
                    return (
                      <div
                        key={s.key}
                        style={{ height: `${pct}%` }}
                        className={cn(
                          "flex-1 rounded-t-md transition-all duration-300",
                          palette.bgClass,
                          hoveredIndex !== null && !isHovered && "opacity-55"
                        )}
                      />
                    );
                  })
                )}
              </div>

              {/* X-axis label */}
              <span className="absolute bottom-0 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Area / Line Chart Body ──────────────────────────────────────────────── */

function AreaLineChartBody({
  uid,
  type,
  data,
  series,
  maxValue,
  height,
  showGrid,
  valueFormatter,
  hoveredIndex,
  setHoveredIndex,
}: {
  uid: string;
  type: "area" | "line";
  data: ChartDataPoint[];
  series: Required<ChartSeries>[];
  maxValue: number;
  height: number;
  showGrid: boolean;
  valueFormatter: (v: number) => string;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
}) {
  const svgW = 640;
  const svgH = 200;
  const padX = 16;
  const padY = 14;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  const count = Math.max(1, data.length);
  const getX = (idx: number) => (count === 1 ? svgW / 2 : padX + (idx / (count - 1)) * plotW);
  const getY = (val: number) => padY + plotH - Math.min(1, Math.max(0, val / maxValue)) * plotH;

  return (
    <div className="relative select-none" style={{ height }}>
      <div className="relative h-[calc(100%-24px)] w-full">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {series.map((s) => {
              const palette = COLOR_PALETTE[s.color];
              return (
                <linearGradient key={s.key} id={`grad-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.fill} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={palette.fill} stopOpacity={0.0} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Grid lines */}
          {showGrid &&
            [0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = padY + plotH * t;
              return (
                <line
                  key={t}
                  x1={padX}
                  x2={svgW - padX}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeWidth={1}
                />
              );
            })}

          {/* Series paths */}
          {series.map((s) => {
            const palette = COLOR_PALETTE[s.color];
            const pts = data.map((d, i) => ({
              x: getX(i),
              y: getY(Number(d[s.key]) || 0),
            }));
            if (pts.length === 0) return null;

            const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
            const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(padY + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padY + plotH).toFixed(1)} Z`;

            return (
              <g key={s.key}>
                {type === "area" && <path d={areaPath} fill={`url(#grad-${uid}-${s.key})`} />}
                <path
                  d={linePath}
                  fill="none"
                  stroke={palette.stroke}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === i ? 5 : 3}
                    fill={palette.stroke}
                    className="transition-all duration-150"
                  />
                ))}
              </g>
            );
          })}

          {/* Hover vertical guide line */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <line
              x1={getX(hoveredIndex)}
              x2={getX(hoveredIndex)}
              y1={padY}
              y2={padY + plotH}
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-zinc-400 dark:text-zinc-600"
              strokeWidth={1.5}
            />
          )}
        </svg>

        {/* Interactive hover columns */}
        <div className="absolute inset-0 flex">
          {data.map((item, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={item.label + i}
                className="relative flex-1 h-full"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 shadow-lg min-w-[135px] whitespace-nowrap">
                    <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                      {item.label}
                    </p>
                    <div className="space-y-1">
                      {series.map((s) => {
                        const val = Number(item[s.key]) || 0;
                        const palette = COLOR_PALETTE[s.color];
                        return (
                          <div key={s.key} className="flex items-center justify-between gap-3 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                              <span className={cn("size-2 rounded-full", palette.bgClass)} />
                              {s.label}
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              {valueFormatter(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex items-center justify-between pt-1.5 px-2">
        {data.map((d, i) => (
          <span key={d.label + i} className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Donut Chart Body ────────────────────────────────────────────────────── */

function DonutChartBody({
  data,
  valueKey,
  height,
  valueFormatter,
  centerLabel,
  centerSublabel,
  showLegend,
  hoveredIndex,
  setHoveredIndex,
}: {
  data: ChartDataPoint[];
  valueKey: string;
  height: number;
  valueFormatter: (v: number) => string;
  centerLabel?: string;
  centerSublabel?: string;
  showLegend: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
}) {
  const total = data.reduce((acc, d) => acc + (Number(d[valueKey]) || 0), 0);
  const size = Math.min(height, 200);
  const strokeWidth = 24;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  const segments = useMemo(() => {
    let accumulatedPct = 0;
    return data.map((d, i) => {
      const val = Number(d[valueKey]) || 0;
      const pct = total > 0 ? val / total : 0;
      const colorName = (d.color as ChartColor) || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const palette = COLOR_PALETTE[colorName] ?? COLOR_PALETTE.indigo;
      const dashArray = `${pct * circumference} ${circumference}`;
      const dashOffset = -accumulatedPct * circumference;
      accumulatedPct += pct;
      return {
        label: d.label,
        val,
        pct,
        palette,
        dashArray,
        dashOffset,
      };
    });
  }, [data, valueKey, total, circumference]);

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-100 dark:text-zinc-800"
          />
          {segments.map((seg, idx) => (
            <circle
              key={seg.label + idx}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.palette.hex}
              strokeWidth={hoveredIndex === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              className="transition-all duration-200 cursor-pointer"
              style={{
                opacity: hoveredIndex !== null && hoveredIndex !== idx ? 0.45 : 1,
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {activeSegment ? valueFormatter(activeSegment.val) : centerLabel ?? valueFormatter(total)}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[110px]">
            {activeSegment
              ? `${activeSegment.label} (${Math.round(activeSegment.pct * 100)}%)`
              : centerSublabel ?? "Total"}
          </span>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {segments.map((seg, idx) => (
            <div
              key={seg.label + idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                hoveredIndex === idx
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("size-2.5 rounded-sm shrink-0", seg.palette.bgClass)} />
                <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {valueFormatter(seg.val)}
                </span>
                <span className="text-[11px] text-zinc-400 w-9 text-right">
                  {Math.round(seg.pct * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
