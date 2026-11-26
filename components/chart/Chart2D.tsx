"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import {
  buildAreaPath,
  buildCurvePath,
  computeNiceScale,
  describeArcPath,
  describeSectorPath,
  type Point2D,
} from "./math";
import { DEFAULT_CHART_COLORS, getChartPalette } from "./palette";
import type {
  ChartColor,
  ChartCurve,
  ChartDataPoint,
  ChartType,
  ResolvedChartSeries,
} from "./types";

export interface Chart2DRendererProps {
  uid: string;
  type: ChartType;
  data: ChartDataPoint[];
  series: ResolvedChartSeries[];
  valueKey: string;
  height: number;
  showGrid: boolean;
  showLegend: boolean;
  showValues: boolean;
  stacked: boolean;
  curve: ChartCurve;
  maxReference: number;
  valueFormatter: (v: number) => string;
  axisFormatter: (v: number) => string;
  centerLabel?: string;
  centerSublabel?: string;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  onDataPointClick?: (point: ChartDataPoint, index: number) => void;
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>, fallback = 560) {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = Math.round(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}

export function Chart2DRenderer(props: Chart2DRendererProps) {
  switch (props.type) {
    case "horizontal-bar":
      return <HorizontalBar2D {...props} />;
    case "donut":
    case "pie":
      return <CircularChart2D {...props} isPie={props.type === "pie"} />;
    case "radial":
      return <RadialChart2D {...props} />;
    case "radar":
      return <RadarChart2D {...props} />;
    case "funnel":
      return <FunnelChart2D {...props} />;
    case "bar":
    case "area":
    case "line":
    case "composed":
    default:
      return <CartesianChart2D {...props} />;
  }
}

/* ── Cartesian 2D (Bar, Area, Line, Composed) ─────────────────────────────── */

function CartesianChart2D({
  uid,
  type,
  data,
  series,
  height,
  showGrid,
  showValues,
  stacked,
  curve,
  valueFormatter,
  axisFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart2DRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef, 560);

  const rawMax = useMemo(() => {
    let max = 0;
    for (const d of data) {
      if (stacked && type === "bar") {
        const sum = series.reduce((acc, s) => acc + Math.max(0, Number(d[s.key]) || 0), 0);
        if (sum > max) max = sum;
      } else {
        for (const s of series) {
          const v = Math.max(0, Number(d[s.key]) || 0);
          if (v > max) max = v;
        }
      }
    }
    return max;
  }, [data, series, stacked, type]);

  const scale = useMemo(() => computeNiceScale(rawMax, 4), [rawMax]);

  const maxAxisLabelChars = useMemo(
    () => Math.max(...scale.ticks.map((t) => axisFormatter(t).length), 3),
    [scale.ticks, axisFormatter],
  );

  const padLeft = showGrid ? Math.max(46, Math.min(82, maxAxisLabelChars * 6.8 + 14)) : 12;
  const padRight = 16;
  const padTop = showValues ? 22 : 12;
  const padBottom = 30;
  const plotW = Math.max(120, width - padLeft - padRight);
  const plotH = Math.max(90, height - padTop - padBottom);

  const count = Math.max(1, data.length);
  const isBarLike = type === "bar" || type === "composed";
  const slotW = plotW / count;

  const getCenterX = (i: number) =>
    isBarLike
      ? padLeft + slotW * i + slotW / 2
      : count === 1
        ? padLeft + plotW / 2
        : padLeft + (i / (count - 1)) * plotW;

  const getY = (val: number) => {
    const ratio = scale.max > 0 ? Math.max(0, Math.min(1, val / scale.max)) : 0;
    return padTop + plotH - ratio * plotH;
  };

  // Thin X labels automatically based on available horizontal room
  const maxVisibleLabels = Math.max(2, Math.floor(plotW / 58));
  const labelStep = Math.max(1, Math.ceil(data.length / maxVisibleLabels));

  const barSeries = useMemo(() => {
    if (type === "bar") return series;
    if (type === "composed") {
      return series.filter((s, idx) => (s.renderAs ?? (idx === 0 ? "bar" : "line")) === "bar");
    }
    return [];
  }, [series, type]);

  const lineAreaSeries = useMemo(() => {
    if (type === "area" || type === "line") return series;
    if (type === "composed") {
      return series.filter((s, idx) => (s.renderAs ?? (idx === 0 ? "bar" : "line")) !== "bar");
    }
    return [];
  }, [series, type]);

  // Tooltip data for hovered index
  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const tooltipRows: ChartTooltipRow[] = useMemo(() => {
    if (!activePoint) return [];
    return series.map((s) => ({
      key: s.key,
      label: s.label,
      value: valueFormatter(Number(activePoint[s.key]) || 0),
      color: s.color,
    }));
  }, [activePoint, series, valueFormatter]);

  const stackedTotal = useMemo(() => {
    if (!activePoint || !stacked || series.length < 2) return undefined;
    const sum = series.reduce((acc, s) => acc + (Number(activePoint[s.key]) || 0), 0);
    return valueFormatter(sum);
  }, [activePoint, stacked, series, valueFormatter]);

  const hoveredXPct =
    hoveredIndex !== null ? (getCenterX(hoveredIndex) / Math.max(1, width)) * 100 : 50;

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none tabular-nums"
      style={{ height }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ChartTooltip
        visible={hoveredIndex !== null && Boolean(activePoint)}
        title={activePoint?.label ?? ""}
        rows={tooltipRows}
        xPct={hoveredXPct}
        yPct={4}
        totalLabel={stackedTotal ? "Total" : undefined}
        totalValue={stackedTotal}
      />

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full h-full overflow-visible"
        role="group"
        aria-label="Área do gráfico"
      >
        <defs>
          {series.map((s) => {
            const p = getChartPalette(s.color);
            return (
              <React.Fragment key={s.key}>
                <linearGradient id={`c2d-bar-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.fillStart} stopOpacity={1} />
                  <stop offset="100%" stopColor={p.stroke} stopOpacity={0.82} />
                </linearGradient>
                <linearGradient id={`c2d-area-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.fillStart} stopOpacity={0.3} />
                  <stop offset="65%" stopColor={p.fillStart} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={p.fillStart} stopOpacity={0.0} />
                </linearGradient>
              </React.Fragment>
            );
          })}
        </defs>

        {/* Horizontal gridlines & Y ticks */}
        {showGrid &&
          scale.ticks.map((tick) => {
            const y = Math.round(getY(tick)) + 0.5;
            const isZero = tick === 0;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  x2={padLeft + plotW}
                  y1={y}
                  y2={y}
                  className={isZero ? "stroke-border" : "stroke-border/65"}
                  strokeDasharray={isZero ? undefined : "3 4"}
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-muted-foreground font-mono text-[10.5px]"
                >
                  {axisFormatter(tick)}
                </text>
              </g>
            );
          })}

        {/* Hover column spotlight */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          isBarLike ? (
            <rect
              x={padLeft + slotW * hoveredIndex + 3}
              y={padTop}
              width={Math.max(4, slotW - 6)}
              height={plotH}
              rx={8}
              className="fill-muted/55 transition-opacity duration-150"
            />
          ) : (
            <line
              x1={getCenterX(hoveredIndex)}
              x2={getCenterX(hoveredIndex)}
              y1={padTop}
              y2={padTop + plotH}
              className="stroke-muted-foreground/45"
              strokeWidth={1.25}
              strokeDasharray="3 3"
            />
          )
        )}

        {/* Bars layer (for bar & composed) */}
        {barSeries.length > 0 &&
          data.map((d, i) => {
            const isHovered = hoveredIndex === i;
            const dimmed = hoveredIndex !== null && !isHovered;
            const groupMaxW = Math.min(slotW * 0.72, stacked ? 44 : 56);
            const cx = getCenterX(i);

            if (stacked && type === "bar") {
              let accVal = 0;
              const totalVal = barSeries.reduce((a, s) => a + Math.max(0, Number(d[s.key]) || 0), 0);
              const barW = Math.max(8, groupMaxW);
              const x = cx - barW / 2;
              return (
                <g
                  key={i}
                  style={{ opacity: dimmed ? 0.45 : 1 }}
                  className="transition-opacity duration-150"
                >
                  {barSeries.map((s, sIdx) => {
                    const val = Math.max(0, Number(d[s.key]) || 0);
                    const yBottom = getY(accVal);
                    accVal += val;
                    const yTop = getY(accVal);
                    const segH = Math.max(0, yBottom - yTop);
                    if (segH < 0.5) return null;
                    const isTopSegment = sIdx === barSeries.length - 1;
                    return (
                      <rect
                        key={s.key}
                        x={x}
                        y={yTop}
                        width={barW}
                        height={Math.max(1, segH - (sIdx > 0 ? 1 : 0))}
                        rx={isTopSegment ? 5 : 1.5}
                        fill={`url(#c2d-bar-${uid}-${s.key})`}
                        className="transition-[y,height,opacity] duration-300"
                      />
                    );
                  })}
                  {showValues && totalVal > 0 && (
                    <text
                      x={cx}
                      y={getY(totalVal) - 6}
                      textAnchor="middle"
                      className="fill-foreground/85 font-mono text-[10px] font-semibold"
                    >
                      {axisFormatter(totalVal)}
                    </text>
                  )}
                </g>
              );
            }

            const gap = barSeries.length > 1 ? 4 : 0;
            const singleW = Math.max(
              6,
              Math.min(34, (groupMaxW - gap * (barSeries.length - 1)) / barSeries.length),
            );
            const totalW = singleW * barSeries.length + gap * (barSeries.length - 1);
            const startX = cx - totalW / 2;

            return (
              <g
                key={i}
                style={{ opacity: dimmed ? 0.45 : 1 }}
                className="transition-opacity duration-150"
              >
                {barSeries.map((s, sIdx) => {
                  const val = Math.max(0, Number(d[s.key]) || 0);
                  const yTop = getY(val);
                  const barH = Math.max(val > 0 ? 3 : 0, padTop + plotH - yTop);
                  const bx = startX + sIdx * (singleW + gap);
                  return (
                    <g key={s.key}>
                      <rect
                        x={bx}
                        y={padTop + plotH - barH}
                        width={singleW}
                        height={barH}
                        rx={Math.min(6, singleW / 2)}
                        fill={`url(#c2d-bar-${uid}-${s.key})`}
                        className="transition-[y,height,opacity] duration-300"
                      />
                      {/* Specular top highlight */}
                      {barH > 8 && (
                        <line
                          x1={bx + 2}
                          x2={bx + singleW - 2}
                          y1={padTop + plotH - barH + 1}
                          y2={padTop + plotH - barH + 1}
                          stroke="white"
                          strokeOpacity={0.35}
                          strokeWidth={1}
                          strokeLinecap="round"
                        />
                      )}
                      {showValues && val > 0 && (
                        <text
                          x={bx + singleW / 2}
                          y={padTop + plotH - barH - 6}
                          textAnchor="middle"
                          className="fill-foreground/85 font-mono text-[10px] font-semibold"
                        >
                          {axisFormatter(val)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

        {/* Area / Line layer */}
        {lineAreaSeries.map((s) => {
          const p = getChartPalette(s.color);
          const pts: Point2D[] = data.map((d, i) => ({
            x: getCenterX(i),
            y: getY(Math.max(0, Number(d[s.key]) || 0)),
          }));
          if (pts.length === 0) return null;

          const renderMode = s.renderAs ?? (type === "area" ? "area" : "line");
          const linePath = buildCurvePath(pts, curve);
          const areaPath =
            renderMode === "area" ? buildAreaPath(pts, padTop + plotH, curve) : "";

          return (
            <g key={s.key}>
              {renderMode === "area" && (
                <path d={areaPath} fill={`url(#c2d-area-${uid}-${s.key})`} />
              )}
              <path
                d={linePath}
                fill="none"
                stroke={p.stroke}
                strokeWidth={2.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? "5 4" : undefined}
              />
              {pts.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                const showDot = isHovered || data.length <= 12;
                if (!showDot) return null;
                return (
                  <g key={i}>
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={8}
                        fill={p.stroke}
                        fillOpacity={0.18}
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 4.5 : 3}
                      className="fill-surface"
                      stroke={p.stroke}
                      strokeWidth={isHovered ? 2.5 : 2}
                    />
                    {showValues && (isHovered || data.length <= 8) && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        className="fill-foreground/85 font-mono text-[10px] font-semibold"
                      >
                        {axisFormatter(Number(data[i]?.[s.key]) || 0)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels aligned precisely to each slot/point */}
        {data.map((d, i) => {
          const isVisible =
            data.length <= maxVisibleLabels ||
            i === 0 ||
            i === data.length - 1 ||
            i % labelStep === 0;
          if (!isVisible) return null;
          const isHovered = hoveredIndex === i;
          return (
            <text
              key={d.label + i}
              x={getCenterX(i)}
              y={height - 8}
              textAnchor="middle"
              className={cn(
                "text-[11px] transition-colors",
                isHovered ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
              )}
            >
              {d.label.length > 14 ? `${d.label.slice(0, 12)}…` : d.label}
            </text>
          );
        })}

        {/* Transparent interactive hit columns (mouse + keyboard) */}
        {data.map((d, i) => {
          const x = isBarLike
            ? padLeft + slotW * i
            : i === 0
              ? padLeft
              : (getCenterX(i - 1) + getCenterX(i)) / 2;
          const nextX = isBarLike
            ? padLeft + slotW * (i + 1)
            : i === count - 1
              ? padLeft + plotW
              : (getCenterX(i) + getCenterX(i + 1)) / 2;
          return (
            <rect
              key={`hit-${i}`}
              x={x}
              y={padTop}
              width={Math.max(8, nextX - x)}
              height={plotH + padBottom}
              fill="transparent"
              className="cursor-pointer focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`${d.label}: ${series
                .map((s) => `${s.label} ${valueFormatter(Number(d[s.key]) || 0)}`)
                .join(", ")}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
              onClick={() => {
                setHoveredIndex(hoveredIndex === i ? null : i);
                onDataPointClick?.(d, i);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDataPointClick?.(d, i);
                }
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ── Horizontal Bar 2D ────────────────────────────────────────────────────── */

function HorizontalBar2D({
  data,
  series,
  height,
  stacked,
  showValues,
  valueFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart2DRendererProps) {
  const maxVal = useMemo(() => {
    let max = 0;
    for (const d of data) {
      if (stacked) {
        const sum = series.reduce((acc, s) => acc + Math.max(0, Number(d[s.key]) || 0), 0);
        if (sum > max) max = sum;
      } else {
        for (const s of series) {
          const v = Math.max(0, Number(d[s.key]) || 0);
          if (v > max) max = v;
        }
      }
    }
    return computeNiceScale(max, 4).max;
  }, [data, series, stacked]);

  const totalAll = useMemo(() => {
    if (series.length !== 1) return 0;
    const key = series[0]!.key;
    return data.reduce((acc, d) => acc + Math.max(0, Number(d[key]) || 0), 0);
  }, [data, series]);

  return (
    <div
      className="flex flex-col justify-center gap-3 py-1 tabular-nums"
      style={{ minHeight: height }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {data.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const dimmed = hoveredIndex !== null && !isHovered;
        const rowSum = series.reduce((acc, s) => acc + Math.max(0, Number(item[s.key]) || 0), 0);
        const sharePct = totalAll > 0 ? Math.round((rowSum / totalAll) * 100) : null;

        return (
          <div
            key={item.label + i}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setHoveredIndex(i)}
            onFocus={() => setHoveredIndex(i)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => onDataPointClick?.(item, i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDataPointClick?.(item, i);
              }
            }}
            className={cn(
              "group rounded-lg px-2 py-1.5 -mx-2 transition-[background-color,opacity] duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              isHovered && "bg-muted/60",
              dimmed && "opacity-50",
            )}
          >
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className="text-xs font-medium text-foreground truncate">{item.label}</span>
              <span className="inline-flex items-baseline gap-2 shrink-0 font-mono text-xs font-semibold text-foreground">
                <span>{valueFormatter(rowSum)}</span>
                {sharePct !== null && (
                  <span className="text-[10.5px] font-normal text-muted-foreground w-8 text-right">
                    {sharePct}%
                  </span>
                )}
              </span>
            </div>

            {stacked || series.length === 1 ? (
              <div className="h-3 w-full rounded-full bg-muted/80 overflow-hidden flex gap-0.5">
                {series.map((s) => {
                  const val = Math.max(0, Number(item[s.key]) || 0);
                  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  const palette = getChartPalette((item.color as ChartColor) ?? s.color);
                  return (
                    <div
                      key={s.key}
                      style={{
                        width: `${Math.max(val > 0 ? 1.5 : 0, pct)}%`,
                        background: `linear-gradient(90deg, ${palette.stroke}, ${palette.fillStart})`,
                      }}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-[width] duration-300"
                    />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {series.map((s) => {
                  const val = Math.max(0, Number(item[s.key]) || 0);
                  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  const palette = getChartPalette(s.color);
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted/75 overflow-hidden">
                        <div
                          style={{
                            width: `${Math.max(val > 0 ? 1.5 : 0, pct)}%`,
                            background: `linear-gradient(90deg, ${palette.stroke}, ${palette.fillStart})`,
                          }}
                          className="h-full rounded-full transition-[width] duration-300"
                        />
                      </div>
                      {showValues && (
                        <span className="font-mono text-[10px] text-muted-foreground w-14 text-right shrink-0">
                          {valueFormatter(val)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Donut & Pie 2D ───────────────────────────────────────────────────────── */

function CircularChart2D({
  uid,
  data,
  valueKey,
  height,
  showLegend,
  valueFormatter,
  centerLabel,
  centerSublabel,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
  isPie,
}: Chart2DRendererProps & { isPie: boolean }) {
  const total = useMemo(
    () => data.reduce((acc, d) => acc + Math.max(0, Number(d[valueKey]) || 0), 0),
    [data, valueKey],
  );

  const size = Math.max(168, Math.min(height, 232));
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 12;
  const innerR = isPie ? 0 : outerR * 0.62;
  const padAngle = data.length > 1 ? 0.025 : 0;

  const slices = useMemo(() => {
    let cursor = -Math.PI / 2;
    return data.map((d, i) => {
      const val = Math.max(0, Number(d[valueKey]) || 0);
      const pct = total > 0 ? val / total : 0;
      const sweep = pct * Math.PI * 2;
      const start = cursor + padAngle / 2;
      const end = Math.max(start, cursor + sweep - padAngle / 2);
      const mid = cursor + sweep / 2;
      cursor += sweep;
      const color = (d.color as ChartColor) || DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length]!;
      return {
        item: d,
        label: d.label,
        val,
        pct,
        color,
        palette: getChartPalette(color),
        start,
        end,
        mid,
      };
    });
  }, [data, valueKey, total, padAngle]);

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col @md:flex-row items-center justify-center gap-6 py-2 tabular-nums">
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            {slices.map((s, idx) => (
              <linearGradient
                key={idx}
                id={`c2d-slice-${uid}-${idx}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={s.palette.fillStart} />
                <stop offset="100%" stopColor={s.palette.stroke} />
              </linearGradient>
            ))}
          </defs>

          {/* Subtle base track for donut */}
          {!isPie && (
            <circle
              cx={cx}
              cy={cy}
              r={(outerR + innerR) / 2}
              fill="none"
              strokeWidth={outerR - innerR}
              className="stroke-muted/50"
            />
          )}

          {slices.map((s, idx) => {
            const isHovered = hoveredIndex === idx;
            const dimmed = hoveredIndex !== null && !isHovered;
            const expand = isHovered ? 5 : 0;
            const dx = Math.cos(s.mid) * (isHovered ? 4 : 0);
            const dy = Math.sin(s.mid) * (isHovered ? 4 : 0);
            const dPath = describeSectorPath(
              cx,
              cy,
              outerR + expand,
              isPie ? 0 : Math.max(0, innerR - (isHovered ? 1 : 0)),
              s.start,
              s.end,
            );
            return (
              <path
                key={s.label + idx}
                d={dPath}
                fill={`url(#c2d-slice-${uid}-${idx})`}
                transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`}
                style={{ opacity: dimmed ? 0.42 : 1 }}
                className="cursor-pointer transition-[opacity,transform] duration-200 focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${s.label}: ${valueFormatter(s.val)} (${Math.round(s.pct * 100)}%)`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onFocus={() => setHoveredIndex(idx)}
                onBlur={() => setHoveredIndex(null)}
                onClick={() => onDataPointClick?.(s.item, idx)}
              />
            );
          })}
        </svg>

        {!isPie && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
              {activeSlice
                ? valueFormatter(activeSlice.val)
                : (centerLabel ?? valueFormatter(total))}
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-muted-foreground truncate max-w-[122px]">
              {activeSlice
                ? `${activeSlice.label} · ${Math.round(activeSlice.pct * 100)}%`
                : (centerSublabel ?? "Total")}
            </span>
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-col gap-1.5 w-full min-w-0 @md:flex-1 @md:max-w-sm">
          {slices.map((s, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <button
                key={s.label + idx}
                type="button"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(idx)}
                onBlur={() => setHoveredIndex(null)}
                onClick={() => onDataPointClick?.(s.item, idx)}
                className={cn(
                  "flex flex-col gap-1 rounded-lg px-2.5 py-1.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  isHovered ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-3 text-xs w-full">
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden="true"
                      className={cn("size-2.5 rounded-full shrink-0", s.palette.bgClass)}
                    />
                    <span className="font-medium text-foreground truncate">{s.label}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 shrink-0">
                    <span className="font-mono font-semibold text-foreground">
                      {valueFormatter(s.val)}
                    </span>
                    {valueFormatter(s.val).trim() !== `${Math.round(s.pct * 100)}%` && (
                      <span className="font-mono text-[11px] text-muted-foreground w-9 text-right">
                        {Math.round(s.pct * 100)}%
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${Math.max(2, s.pct * 100)}%`,
                      backgroundColor: s.palette.base,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Radial / Concentric Gauge 2D ─────────────────────────────────────────── */

function RadialChart2D({
  data,
  valueKey,
  height,
  showLegend,
  maxReference,
  valueFormatter,
  centerLabel,
  centerSublabel,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart2DRendererProps) {
  const size = Math.max(176, Math.min(height, 240));
  const cx = size / 2;
  const cy = size / 2;
  const count = Math.max(1, Math.min(data.length, 5));
  const items = data.slice(0, 5);
  const strokeW = count <= 2 ? 14 : count === 3 ? 11 : 9;
  const ringGap = strokeW + 6;
  const startAngle = -Math.PI / 2;

  const avg = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((a, d) => a + (Number(d[valueKey]) || 0), 0);
    return Math.round(sum / items.length);
  }, [items, valueKey]);

  const active = hoveredIndex !== null ? items[hoveredIndex] : null;

  return (
    <div className="flex flex-col @md:flex-row items-center justify-center gap-6 py-2 tabular-nums">
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {items.map((d, idx) => {
            const r = size / 2 - 12 - idx * ringGap;
            if (r < 22) return null;
            const val = Math.max(0, Number(d[valueKey]) || 0);
            const pct = Math.max(0, Math.min(1, val / Math.max(1, maxReference)));
            const color = (d.color as ChartColor) || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]!;
            const palette = getChartPalette(color);
            const isHovered = hoveredIndex === idx;
            const dimmed = hoveredIndex !== null && !isHovered;

            return (
              <g
                key={d.label + idx}
                style={{ opacity: dimmed ? 0.38 : 1 }}
                className="transition-opacity duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onClick={() => onDataPointClick?.(d, idx)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  strokeWidth={strokeW}
                  className="stroke-muted/65"
                />
                <path
                  d={describeArcPath(cx, cy, r, startAngle, startAngle + pct * Math.PI * 2)}
                  fill="none"
                  stroke={palette.base}
                  strokeWidth={isHovered ? strokeW + 2 : strokeW}
                  strokeLinecap="round"
                  className="transition-[stroke-width] duration-150"
                />
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
            {active
              ? valueFormatter(Number(active[valueKey]) || 0)
              : (centerLabel ?? valueFormatter(avg))}
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground truncate max-w-[100px]">
            {active ? active.label : (centerSublabel ?? "Média")}
          </span>
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-col gap-2 w-full min-w-0 @md:flex-1 @md:max-w-sm">
          {items.map((d, idx) => {
            const val = Math.max(0, Number(d[valueKey]) || 0);
            const pct = Math.min(100, Math.round((val / Math.max(1, maxReference)) * 100));
            const color = (d.color as ChartColor) || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]!;
            const palette = getChartPalette(color);
            const isHovered = hoveredIndex === idx;
            return (
              <button
                key={d.label + idx}
                type="button"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onDataPointClick?.(d, idx)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                  isHovered ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <span className="inline-flex items-center gap-2 min-w-0">
                  <span className={cn("size-2.5 rounded-full shrink-0", palette.bgClass)} />
                  <span className="font-medium text-foreground truncate">{d.label}</span>
                </span>
                <span className="inline-flex items-center gap-2 shrink-0 font-mono">
                  <span className="font-semibold text-foreground">{valueFormatter(val)}</span>
                  {valueFormatter(val).trim() !== `${pct}%` && (
                    <span className="text-[11px] text-muted-foreground w-9 text-right">{pct}%</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Radar / Spider 2D ────────────────────────────────────────────────────── */

function RadarChart2D({
  data,
  series,
  height,
  valueFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart2DRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef, 420);
  const size = Math.min(width, Math.max(220, height));
  const cx = width / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const count = Math.max(3, data.length);

  const maxVal = useMemo(() => {
    let m = 0;
    for (const d of data) {
      for (const s of series) {
        const v = Math.max(0, Number(d[s.key]) || 0);
        if (v > m) m = v;
      }
    }
    return computeNiceScale(m, 4).max;
  }, [data, series]);

  const pointAt = (axisIdx: number, ratio: number): Point2D => {
    const angle = -Math.PI / 2 + (axisIdx / count) * Math.PI * 2;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    };
  };

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const tooltipRows: ChartTooltipRow[] = useMemo(() => {
    if (!activePoint) return [];
    return series.map((s) => ({
      key: s.key,
      label: s.label,
      value: valueFormatter(Number(activePoint[s.key]) || 0),
      color: s.color,
    }));
  }, [activePoint, series, valueFormatter]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none tabular-nums"
      style={{ height: size }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ChartTooltip
        visible={hoveredIndex !== null && Boolean(activePoint)}
        title={activePoint?.label ?? ""}
        rows={tooltipRows}
        xPct={50}
        yPct={4}
      />
      <svg width={width} height={size} viewBox={`0 0 ${width} ${size}`} className="overflow-visible">
        {/* Concentric polygon web */}
        {[0.25, 0.5, 0.75, 1].map((level) => {
          const pts = Array.from({ length: count }, (_, i) => pointAt(i, level));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
          return (
            <path
              key={level}
              d={d}
              fill="none"
              className="stroke-border/80"
              strokeWidth={1}
              strokeDasharray={level < 1 ? "2 3" : undefined}
            />
          );
        })}

        {/* Spokes & axis labels */}
        {data.map((d, i) => {
          const edge = pointAt(i, 1);
          const lbl = pointAt(i, 1.18);
          const anchor =
            Math.abs(lbl.x - cx) < 10 ? "middle" : lbl.x > cx ? "start" : "end";
          return (
            <g key={d.label + i}>
              <line
                x1={cx}
                y1={cy}
                x2={edge.x}
                y2={edge.y}
                className="stroke-border/70"
                strokeWidth={1}
              />
              <text
                x={lbl.x}
                y={lbl.y}
                textAnchor={anchor}
                dominantBaseline="central"
                className={cn(
                  "text-[11px] font-medium cursor-pointer transition-colors",
                  hoveredIndex === i ? "fill-foreground font-semibold" : "fill-muted-foreground",
                )}
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => onDataPointClick?.(d, i)}
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Series polygons */}
        {series.map((s) => {
          const palette = getChartPalette(s.color);
          const pts = data.map((d, i) => {
            const val = Math.max(0, Number(d[s.key]) || 0);
            return pointAt(i, maxVal > 0 ? val / maxVal : 0);
          });
          const path =
            pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
            " Z";
          return (
            <g key={s.key}>
              <path
                d={path}
                fill={palette.base}
                fillOpacity={0.18}
                stroke={palette.stroke}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {pts.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === i ? 5 : 3.2}
                  className="fill-surface cursor-pointer"
                  stroke={palette.stroke}
                  strokeWidth={2}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={() => onDataPointClick?.(data[i]!, i)}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Funnel 2D ────────────────────────────────────────────────────────────── */

function FunnelChart2D({
  data,
  valueKey,
  height,
  valueFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart2DRendererProps) {
  const maxVal = useMemo(
    () => Math.max(1, ...data.map((d) => Math.max(0, Number(d[valueKey]) || 0))),
    [data, valueKey],
  );
  const firstVal = Math.max(1, Number(data[0]?.[valueKey]) || maxVal);

  return (
    <div
      className="flex flex-col justify-center gap-2 py-1 tabular-nums"
      style={{ minHeight: height }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {data.map((item, i) => {
        const val = Math.max(0, Number(item[valueKey]) || 0);
        const pctOfFirst = Math.round((val / firstVal) * 100);
        const widthPct = Math.max(22, (val / maxVal) * 100);
        const prevVal = i > 0 ? Math.max(1, Number(data[i - 1]?.[valueKey]) || 1) : null;
        const stepConv = prevVal !== null ? Math.round((val / prevVal) * 100) : null;
        const color = (item.color as ChartColor) || DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length]!;
        const palette = getChartPalette(color);
        const isHovered = hoveredIndex === i;
        const dimmed = hoveredIndex !== null && !isHovered;

        return (
          <div
            key={item.label + i}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setHoveredIndex(i)}
            onFocus={() => setHoveredIndex(i)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => onDataPointClick?.(item, i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDataPointClick?.(item, i);
              }
            }}
            style={{ opacity: dimmed ? 0.5 : 1 }}
            className="grid grid-cols-[minmax(96px,140px)_1fr_auto] items-center gap-3 cursor-pointer transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-lg"
          >
            <div className="text-right min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{item.label}</div>
              {stepConv !== null && (
                <div className="text-[10px] font-mono text-muted-foreground">
                  {stepConv}% etapa ant.
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <div
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${palette.stroke}, ${palette.fillStart})`,
                }}
                className={cn(
                  "h-9 rounded-lg flex items-center justify-center px-3 text-white font-mono text-xs font-semibold shadow-xs transition-[transform,filter] duration-150",
                  isHovered && "scale-[1.02] brightness-110",
                )}
              >
                <span className="truncate drop-shadow-xs">{valueFormatter(val)}</span>
              </div>
            </div>

            <span className="font-mono text-xs font-semibold text-muted-foreground w-10 text-right">
              {pctOfFirst}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
