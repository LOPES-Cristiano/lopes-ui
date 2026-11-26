"use client";

import React, { useId, useMemo, useState } from "react";
import { Box, Layers } from "lucide-react";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";
import { Chart2DRenderer } from "./chart/Chart2D";
import { Chart3DRenderer } from "./chart/Chart3D";
import { formatCompactPtBr } from "./chart/math";
import { DEFAULT_CHART_COLORS, getChartPalette } from "./chart/palette";
import type {
  ChartProps,
  ChartVariant,
  ResolvedChartSeries,
} from "./chart/types";

export type {
  ChartBarShape,
  ChartColor,
  ChartCurve,
  ChartDataPoint,
  ChartProps,
  ChartSeries,
  ChartType,
  ChartVariant,
} from "./chart/types";
export { CHART_PALETTE, DEFAULT_CHART_COLORS } from "./chart/palette";
export { computeNiceScale, formatCompactPtBr } from "./chart/math";

const defaultFormat = (v: number) => v.toLocaleString("pt-BR");

const SINGLE_VALUE_TYPES = new Set(["donut", "pie", "radial", "funnel"]);

export default function Chart({
  type = "bar",
  variant = "2d",
  allowVariantToggle = false,
  barShape = "prism",
  curve = "smooth",
  data,
  series,
  valueKey = "value",
  height = 240,
  title,
  subtitle,
  headerExtra,
  showLegend = true,
  interactiveLegend = true,
  showGrid = true,
  showValues = false,
  stacked = false,
  showBench = true,
  azimuth = 36,
  elevation = 26,
  valueFormatter = defaultFormat,
  axisFormatter,
  centerLabel,
  centerSublabel,
  maxReference = 100,
  emptyMessage = "Nenhum dado disponível para exibir.",
  onDataPointClick,
  bordered = true,
  className,
  componentId,
  hideIfDenied = true,
}: ChartProps) {
  const uid = useId().replace(/:/g, "");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(() => new Set());
  const [localVariant, setLocalVariant] = useState<ChartVariant | null>(null);

  const activeVariant: ChartVariant = localVariant ?? variant;
  const resolvedAxisFormatter = axisFormatter ?? (valueFormatter === defaultFormat ? formatCompactPtBr : valueFormatter);

  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  const resolvedSeries: ResolvedChartSeries[] = useMemo(() => {
    if (series && series.length > 0) {
      return series.map((s, idx) => ({
        key: s.key,
        label: s.label,
        color: s.color ?? DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]!,
        renderAs: s.renderAs,
        dashed: s.dashed,
      }));
    }
    if (data.length === 0) return [{ key: valueKey, label: "Valor", color: "indigo" }];
    const keys = Object.keys(data[0]!).filter(
      (k) => k !== "label" && k !== "color" && typeof data[0]![k] === "number",
    );
    if (keys.length === 0) return [{ key: valueKey, label: "Valor", color: "indigo" }];
    return keys.map((k, idx) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      color: DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]!,
    }));
  }, [series, data, valueKey]);

  const visibleSeries = useMemo(() => {
    const filtered = resolvedSeries.filter((s) => !hiddenSeries.has(s.key));
    return filtered.length > 0 ? filtered : resolvedSeries;
  }, [resolvedSeries, hiddenSeries]);

  const toggleSeries = (key: string) => {
    if (!interactiveLegend || resolvedSeries.length <= 1) return;
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (resolvedSeries.length - next.size > 1) {
        next.add(key);
      }
      return next;
    });
  };

  if (!hasAccess && hideIfDenied) {
    return null;
  }

  const isSingleValueType = SINGLE_VALUE_TYPES.has(type);
  const showHeaderLegend = showLegend && !isSingleValueType && resolvedSeries.length > 0;
  const hasHeader = Boolean(title || subtitle || headerExtra || allowVariantToggle || showHeaderLegend);

  return (
    <figure
      data-component-id={componentId}
      data-chart-type={type}
      data-chart-variant={activeVariant}
      className={cn(
        "lopes-chart relative @container flex flex-col min-w-0",
        bordered &&
          "rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:p-5 shadow-[var(--shadow-card)]",
        !hasAccess && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {/* Header & Controls */}
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && (
                <figcaption className="text-sm font-semibold tracking-tight text-foreground leading-snug">
                  {title}
                </figcaption>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Series Legend */}
            {showHeaderLegend && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Séries do gráfico">
                {resolvedSeries.map((s) => {
                  const palette = getChartPalette(s.color);
                  const isHidden = hiddenSeries.has(s.key);
                  const canToggle = interactiveLegend && resolvedSeries.length > 1;
                  const Tag = canToggle ? "button" : "span";
                  return (
                    <Tag
                      key={s.key}
                      {...(canToggle
                        ? {
                            type: "button" as const,
                            "aria-pressed": !isHidden,
                            onClick: () => toggleSeries(s.key),
                          }
                        : {})}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition-[color,background-color,opacity,border-color]",
                        canToggle
                          ? "cursor-pointer border border-border/70 bg-muted/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          : "text-muted-foreground",
                        isHidden ? "opacity-45 line-through text-muted-foreground" : "text-foreground/90",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn("size-2 rounded-full shrink-0", palette.bgClass)}
                      />
                      <span>{s.label}</span>
                    </Tag>
                  );
                })}
              </div>
            )}

            {/* 2D / 3D Variant Toggle */}
            {allowVariantToggle && (
              <div
                role="group"
                aria-label="Dimensão do gráfico"
                className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-[11px] font-medium"
              >
                <button
                  type="button"
                  aria-pressed={activeVariant === "2d"}
                  onClick={() => setLocalVariant("2d")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 transition-[color,background-color,box-shadow] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    activeVariant === "2d"
                      ? "bg-surface text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Layers size={11} aria-hidden="true" />
                  2D
                </button>
                <button
                  type="button"
                  aria-pressed={activeVariant === "3d"}
                  onClick={() => setLocalVariant("3d")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 transition-[color,background-color,box-shadow] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    activeVariant === "3d"
                      ? "bg-surface text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Box size={11} aria-hidden="true" />
                  3D
                </button>
              </div>
            )}

            {headerExtra}
          </div>
        </div>
      )}

      {/* Body */}
      {data.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/25 text-xs text-muted-foreground"
          style={{ height }}
        >
          {emptyMessage}
        </div>
      ) : activeVariant === "3d" ? (
        <Chart3DRenderer
          uid={uid}
          type={type}
          data={data}
          series={visibleSeries}
          valueKey={valueKey}
          height={height}
          showGrid={showGrid}
          showLegend={showLegend}
          showValues={showValues}
          stacked={stacked}
          barShape={barShape}
          showBench={showBench}
          azimuth={azimuth}
          elevation={elevation}
          maxReference={maxReference}
          valueFormatter={valueFormatter}
          axisFormatter={resolvedAxisFormatter}
          centerLabel={centerLabel}
          centerSublabel={centerSublabel}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          onDataPointClick={onDataPointClick}
        />
      ) : (
        <Chart2DRenderer
          uid={uid}
          type={type}
          data={data}
          series={visibleSeries}
          valueKey={valueKey}
          height={height}
          showGrid={showGrid}
          showLegend={showLegend}
          showValues={showValues}
          stacked={stacked}
          curve={curve}
          maxReference={maxReference}
          valueFormatter={valueFormatter}
          axisFormatter={resolvedAxisFormatter}
          centerLabel={centerLabel}
          centerSublabel={centerSublabel}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          onDataPointClick={onDataPointClick}
        />
      )}

      {/* Accessible Screen-Reader Data Table Fallback */}
      {data.length > 0 && (
        <table className="sr-only">
          <caption>{title ?? "Dados do gráfico"}</caption>
          <thead>
            <tr>
              <th scope="col">Categoria</th>
              {isSingleValueType ? (
                <th scope="col">Valor</th>
              ) : (
                visibleSeries.map((s) => (
                  <th key={s.key} scope="col">
                    {s.label}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.label + idx}>
                <th scope="row">{row.label}</th>
                {isSingleValueType ? (
                  <td>{valueFormatter(Number(row[valueKey]) || 0)}</td>
                ) : (
                  visibleSeries.map((s) => (
                    <td key={s.key}>{valueFormatter(Number(row[s.key]) || 0)}</td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  );
}
