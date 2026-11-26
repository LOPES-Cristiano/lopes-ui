"use client";

import React, { useMemo } from "react";
import { cn } from "../../utils/cn";
import {
  boxCorners,
  cylinder,
  depthOf,
  extrude,
  fitProjection,
  insetPlan,
  iso,
  lineOnTop,
  pathOf,
  planOutline,
  segment,
  slabOf,
  topTicks,
  type Flat,
  type Plan,
  type Plane,
  type Point3,
  type Projection,
  type SolidPaths,
} from "../isometric/iso-kit";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import { computeNiceScale } from "./math";
import { DEFAULT_CHART_COLORS, getChartPalette, isoMaterialStyles } from "./palette";
import type {
  ChartBarShape,
  ChartColor,
  ChartDataPoint,
  ChartType,
  ResolvedChartSeries,
} from "./types";

export interface Chart3DRendererProps {
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
  barShape: ChartBarShape;
  showBench: boolean;
  azimuth: number;
  elevation: number;
  maxReference: number;
  valueFormatter: (v: number) => string;
  axisFormatter: (v: number) => string;
  centerLabel?: string;
  centerSublabel?: string;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  onDataPointClick?: (point: ChartDataPoint, index: number) => void;
}

/* ── Shared Isometric Solid Renderer ──────────────────────────────────────── */

function ColoredIsoSolid({
  paths,
  color,
  opacity = 1,
  highlighted = false,
  dimmed = false,
  liftPx = 0,
  className,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ariaLabel,
}: {
  paths: SolidPaths;
  color: ChartColor;
  opacity?: number;
  highlighted?: boolean;
  dimmed?: boolean;
  liftPx?: number;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const mat = isoMaterialStyles(color);
  return (
    <g
      className={cn(
        "lopes-iso-solid transition-[opacity,transform,filter] duration-200",
        onClick && "cursor-pointer",
        highlighted && "brightness-110",
        className,
      )}
      style={{
        opacity: dimmed ? opacity * 0.42 : opacity,
        transform: liftPx !== 0 ? `translateY(${-liftPx}px)` : undefined,
      }}
      role={ariaLabel ? "button" : undefined}
      tabIndex={ariaLabel ? 0 : undefined}
      aria-label={ariaLabel}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <path d={paths.fill} fill={mat.paper} stroke="none" />
      {paths.shades.map((d, i) =>
        d ? <path key={i} d={d} fill={mat.shades[i]} stroke="none" /> : null,
      )}
      <path d={paths.top} fill={mat.top} stroke="none" />
      {paths.crease && (
        <path
          d={paths.crease}
          fill="none"
          stroke={mat.crease}
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {paths.bevel && (
        <path
          d={paths.bevel}
          fill="none"
          stroke={mat.crease}
          strokeWidth={0.65}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <path
        d={paths.outline}
        fill="none"
        stroke={mat.edge}
        strokeWidth={highlighted ? 1.15 : 0.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function IsoBenchBase({
  bench,
  bz,
  proj,
}: {
  bench: Plan;
  bz: number;
  proj: Projection;
}) {
  const art = useMemo(() => {
    const halo = slabOf(bench, -4, 4, proj, 6).fill;
    const slab = slabOf(bench, 0, bz, proj, 8, 0.9);
    const groove = planOutline(insetPlan(bench, 4), bz, proj, 8);
    const ticks = topTicks(
      bench.x + 16,
      bench.x + bench.w - 16,
      12,
      4,
      bench.y + bench.d - 7,
      bz,
      [2, 4],
      proj,
      "x",
    );
    return { halo, slab, groove, ticks };
  }, [bench, bz, proj]);

  return (
    <g className="lopes-iso-bench pointer-events-none" aria-hidden="true">
      <path className="isx-halo" d={art.halo} />
      <g data-c="base">
        <path className="isx-fill" d={art.slab.fill} />
        {art.slab.shades.map((d, i) =>
          d ? <path key={i} className={`isx-s${i}`} d={d} /> : null,
        )}
        <path className="isx-top" d={art.slab.top} />
        <path className="isx-ln isx-crease" d={art.slab.crease} />
        {art.slab.bevel && <path className="isx-ln isx-bevel" d={art.slab.bevel} />}
        <path className="isx-ln isx-edge" d={art.slab.outline} />
      </g>
      <path className="isx-ln isx-faint" d={art.groove} />
      <path className="isx-ln isx-faint" d={art.ticks.minor} />
      <path className="isx-ln isx-mid" d={art.ticks.major} />
    </g>
  );
}

/* ── Main 3D Router ───────────────────────────────────────────────────────── */

export function Chart3DRenderer(props: Chart3DRendererProps) {
  switch (props.type) {
    case "horizontal-bar":
      return <HorizontalBar3D {...props} />;
    case "area":
    case "line":
      return <AreaLine3D {...props} />;
    case "composed":
      return <Composed3D {...props} />;
    case "donut":
    case "pie":
      return <Circular3D {...props} isPie={props.type === "pie"} />;
    case "radial":
      return <Radial3D {...props} />;
    case "funnel":
      return <Funnel3D {...props} />;
    case "radar":
      return <Radar3D {...props} />;
    case "bar":
    default:
      return <Bar3D {...props} />;
  }
}

/* ── 1. Bar 3D (Isometric Columns: Prism or Cylinder, Grouped or Stacked) ── */

function Bar3D({
  data,
  series,
  height,
  showGrid,
  showValues,
  stacked,
  barShape,
  showBench,
  azimuth,
  elevation,
  valueFormatter,
  axisFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart3DRendererProps) {
  const vbW = 560;
  const vbH = Math.max(240, height);
  const BZ = 8;
  const maxZ = 108;

  const rawMax = useMemo(() => {
    let m = 0;
    for (const d of data) {
      if (stacked) {
        const sum = series.reduce((a, s) => a + Math.max(0, Number(d[s.key]) || 0), 0);
        if (sum > m) m = sum;
      } else {
        for (const s of series) {
          const v = Math.max(0, Number(d[s.key]) || 0);
          if (v > m) m = v;
        }
      }
    }
    return m;
  }, [data, series, stacked]);

  const scale = useMemo(() => computeNiceScale(rawMax, 4), [rawMax]);
  const n = Math.max(1, data.length);
  const seriesCount = Math.max(1, series.length);
  const xLabelStep = n <= 7 ? 1 : Math.ceil(n / 5);

  const benchW = Math.max(260, Math.min(390, n <= 7 ? n * 58 + 44 : n * 26 + 44));
  const benchD = stacked ? 104 : Math.max(108, Math.min(180, seriesCount * 42 + 44));
  const bench: Plan = useMemo(
    () => ({ x: 0, y: 0, w: benchW, d: benchD, r: 7 }),
    [benchW, benchD],
  );

  const proj = useMemo(() => {
    const pts: Point3[] = [
      ...boxCorners(bench, -4, BZ + maxZ + 14),
      [-26, bench.d, BZ + maxZ],
      [-20, bench.d + 14, 0],
      [bench.w + 6, bench.d + 14, 0],
    ];
    return fitProjection(pts, vbW, vbH, {
      pad: 6,
      headroom: 8,
      azimuth,
      elevation,
    });
  }, [bench, vbW, vbH, azimuth, elevation]);

  const innerX0 = 22;
  const innerX1 = bench.w - 22;
  const innerY0 = 20;
  const innerY1 = bench.d - 20;
  const slotX = (innerX1 - innerX0) / n;
  const laneY = (innerY1 - innerY0) / (stacked ? 1 : seriesCount);

  // Build depth-sorted 3D column solids
  const solids = useMemo(() => {
    const list: Array<{
      id: string;
      dataIdx: number;
      seriesIdx: number;
      color: ChartColor;
      val: number;
      paths: SolidPaths;
      topCenter: Flat;
      depth: number;
      label: string;
      seriesLabel: string;
    }> = [];

    data.forEach((d, i) => {
      const cx = innerX0 + slotX * i + slotX / 2;
      if (stacked) {
        let accZ = BZ;
        const bw = Math.min(26, slotX * 0.58);
        const bd = Math.min(26, (innerY1 - innerY0) * 0.56);
        const cy = (innerY0 + innerY1) / 2;

        series.forEach((s, sIdx) => {
          const val = Math.max(0, Number(d[s.key]) || 0);
          const h = scale.max > 0 ? Math.max(val > 0 ? 3 : 0, (val / scale.max) * maxZ) : 0;
          if (h <= 0.1) return;
          const paths =
            barShape === "cylinder"
              ? cylinder(cx, cy, Math.min(bw, bd) / 2, accZ, h, proj, 28, 0.7)
              : slabOf({ x: cx - bw / 2, y: cy - bd / 2, w: bw, d: bd, r: 2.2 }, accZ, h, proj, 6, 0.7);
          const topCenter = iso([cx, cy, accZ + h], proj);
          list.push({
            id: `${i}-${s.key}`,
            dataIdx: i,
            seriesIdx: sIdx,
            color: (d.color as ChartColor) ?? s.color,
            val,
            paths,
            topCenter,
            depth: depthOf([cx, cy, accZ + h / 2], proj) + sIdx * 0.01,
            label: d.label,
            seriesLabel: s.label,
          });
          accZ += h + 0.6;
        });
      } else {
        const bw = Math.min(24, slotX * 0.58);
        const bd = Math.min(24, laneY * 0.62);

        series.forEach((s, sIdx) => {
          const val = Math.max(0, Number(d[s.key]) || 0);
          const h = scale.max > 0 ? Math.max(val > 0 ? 3 : 0, (val / scale.max) * maxZ) : 0;
          const cy = innerY0 + laneY * sIdx + laneY / 2;
          if (h <= 0.1) return;
          const paths =
            barShape === "cylinder"
              ? cylinder(cx, cy, Math.min(bw, bd) / 2, BZ, h, proj, 28, 0.7)
              : slabOf({ x: cx - bw / 2, y: cy - bd / 2, w: bw, d: bd, r: 2.2 }, BZ, h, proj, 6, 0.7);
          const topCenter = iso([cx, cy, BZ + h], proj);
          list.push({
            id: `${i}-${s.key}`,
            dataIdx: i,
            seriesIdx: sIdx,
            color: (series.length === 1 ? (d.color as ChartColor) : undefined) ?? s.color,
            val,
            paths,
            topCenter,
            depth: depthOf([cx, cy, BZ + h / 2], proj),
            label: d.label,
            seriesLabel: s.label,
          });
        });
      }
    });

    return list.sort((a, b) => a.depth - b.depth);
  }, [data, series, stacked, barShape, scale.max, innerX0, slotX, innerY0, innerY1, laneY, proj]);

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const tooltipRows: ChartTooltipRow[] = useMemo(() => {
    if (!activePoint) return [];
    return series.map((s) => ({
      key: s.key,
      label: s.label,
      value: valueFormatter(Number(activePoint[s.key]) || 0),
      color: (series.length === 1 ? (activePoint.color as ChartColor) : undefined) ?? s.color,
    }));
  }, [activePoint, series, valueFormatter]);

  const hoveredAnchor = useMemo(() => {
    if (hoveredIndex === null) return { xPct: 50, yPct: 8 };
    const cx = innerX0 + slotX * hoveredIndex + slotX / 2;
    const [sx, sy] = iso([cx, bench.d / 2, BZ + maxZ * 0.65], proj);
    return {
      xPct: (sx / vbW) * 100,
      yPct: Math.max(4, Math.min(55, (sy / vbH) * 100 - 14)),
    };
  }, [hoveredIndex, innerX0, slotX, bench.d, proj, vbW, vbH]);

  return (
    <div
      className="isx lopes-chart-3d relative w-full select-none tabular-nums"
      style={{ height: Math.max(240, height + 24) }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ChartTooltip
        visible={hoveredIndex !== null && Boolean(activePoint)}
        title={activePoint?.label ?? ""}
        rows={tooltipRows}
        xPct={hoveredAnchor.xPct}
        yPct={hoveredAnchor.yPct}
        totalLabel={stacked && series.length > 1 ? "Total" : undefined}
        totalValue={
          stacked && series.length > 1 && activePoint
            ? valueFormatter(
                series.reduce((acc, s) => acc + (Number(activePoint[s.key]) || 0), 0),
              )
            : undefined
        }
      />

      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

        {/* 3D Back-Wall Grid & Y Ticks */}
        {showGrid && (
          <g className="pointer-events-none" aria-hidden="true">
            {scale.ticks.map((tick) => {
              const z = BZ + (tick / scale.max) * maxZ;
              const backX = segment([innerX0 - 8, 8, z], [innerX1 + 8, 8, z], proj);
              const backY = segment([8, 8, z], [8, bench.d - 6, z], proj);
              const [lx, ly] = iso([0, bench.d, z], proj);
              return (
                <g key={tick}>
                  <path
                    d={backX}
                    className="stroke-border/75"
                    strokeWidth={0.85}
                    strokeDasharray={tick === 0 ? undefined : "3 3"}
                    fill="none"
                  />
                  <path
                    d={backY}
                    className="stroke-border/55"
                    strokeWidth={0.85}
                    strokeDasharray={tick === 0 ? undefined : "3 3"}
                    fill="none"
                  />
                  <text
                    x={lx - 12}
                    y={ly}
                    textAnchor="end"
                    dominantBaseline="central"
                    className="fill-muted-foreground font-mono text-[10px]"
                  >
                    {axisFormatter(tick)}
                  </text>
                </g>
              );
            })}
            {/* Floor slot guides */}
            {data.map((_, i) => {
              const cx = innerX0 + slotX * i + slotX / 2;
              return (
                <path
                  key={i}
                  d={lineOnTop([cx, 12], [cx, bench.d - 12], BZ, proj)}
                  className="stroke-border/45"
                  strokeWidth={0.75}
                  fill="none"
                />
              );
            })}
          </g>
        )}

        {/* Interactive floor slot pads (allows hovering even 0-value days cleanly) */}
        {data.map((d, i) => {
          const x0 = innerX0 + slotX * i;
          const x1 = x0 + slotX;
          const isHovered = hoveredIndex === i;
          const padPoly = pathOf(
            [
              iso([x0 + 1, 12, BZ], proj),
              iso([x1 - 1, 12, BZ], proj),
              iso([x1 - 1, bench.d - 12, BZ], proj),
              iso([x0 + 1, bench.d - 12, BZ], proj),
            ],
            true,
          );
          return (
            <path
              key={`slot-${i}`}
              d={padPoly}
              className={cn(
                "cursor-pointer transition-colors duration-150",
                isHovered ? "fill-brand/12" : "fill-transparent",
              )}
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={() => onDataPointClick?.(d, i)}
            />
          );
        })}

        {/* Depth-Sorted 3D Solids */}
        {solids.map((s) => {
          const isHovered = hoveredIndex === s.dataIdx;
          const dimmed = hoveredIndex !== null && !isHovered;
          return (
            <ColoredIsoSolid
              key={s.id}
              paths={s.paths}
              color={s.color}
              highlighted={isHovered}
              dimmed={dimmed}
              liftPx={isHovered ? 4 : 0}
              ariaLabel={`${s.label} — ${s.seriesLabel}: ${valueFormatter(s.val)}`}
              onMouseEnter={() => setHoveredIndex(s.dataIdx)}
              onClick={() => onDataPointClick?.(data[s.dataIdx]!, s.dataIdx)}
            />
          );
        })}

        {/* Value Labels Layer (always on top of 3D solids) */}
        {showValues &&
          solids.map((s) => {
            if (stacked && s.seriesIdx !== series.length - 1) return null;
            const isHovered = hoveredIndex === s.dataIdx;
            return (
              <text
                key={`val-${s.id}`}
                x={s.topCenter[0]}
                y={s.topCenter[1] - (isHovered ? 13 : 9)}
                textAnchor="middle"
                style={{ paintOrder: "stroke" }}
                stroke="var(--surface, #ffffff)"
                strokeWidth={3.5}
                strokeLinejoin="round"
                className="fill-foreground font-mono text-[9px] font-semibold pointer-events-none"
              >
                {axisFormatter(
                  stacked
                    ? series.reduce((a, sr) => a + (Number(data[s.dataIdx]?.[sr.key]) || 0), 0)
                    : s.val,
                )}
              </text>
            );
          })}

        {/* Front X-Axis Labels (auto-thinned for dense series, anchored right-to-left outside bench edge) */}
        {data.map((d, i) => {
          const isEdge = i === 0 || i === data.length - 1;
          const isStep = i % xLabelStep === 0 && data.length - 1 - i >= Math.max(2, Math.ceil(xLabelStep * 0.65));
          const isHovered = hoveredIndex === i;
          const visible = data.length <= 7 || isEdge || isStep || isHovered;
          if (!visible) return null;
          const cx = innerX0 + slotX * i + slotX / 2;
          const [lx, ly] = iso([cx, bench.d + 10, 0], proj);
          return (
            <text
              key={d.label + i}
              x={lx - 4}
              y={ly + 4}
              textAnchor="end"
              dominantBaseline="central"
              style={isHovered ? { paintOrder: "stroke" } : undefined}
              stroke={isHovered ? "var(--surface, #ffffff)" : undefined}
              strokeWidth={isHovered ? 3.5 : undefined}
              className={cn(
                "text-[10.5px] cursor-pointer transition-colors",
                isHovered ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
              )}
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={() => onDataPointClick?.(d, i)}
            >
              {d.label.length > 14 ? `${d.label.slice(0, 12)}…` : d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── 2. Horizontal Bar 3D (Extruded Slabs on Isometric Deck) ──────────────── */

function HorizontalBar3D({
  data,
  series,
  height,
  stacked,
  showBench,
  azimuth,
  elevation,
  valueFormatter,
  axisFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart3DRendererProps) {
  const vbW = 560;
  const vbH = Math.max(250, Math.round(height * 1.12));
  const BZ = 8;
  const n = Math.max(1, data.length);

  const rawMax = useMemo(() => {
    let m = 0;
    for (const d of data) {
      if (stacked) {
        const sum = series.reduce((a, s) => a + Math.max(0, Number(d[s.key]) || 0), 0);
        if (sum > m) m = sum;
      } else {
        for (const s of series) {
          const v = Math.max(0, Number(d[s.key]) || 0);
          if (v > m) m = v;
        }
      }
    }
    return m;
  }, [data, series, stacked]);

  const scale = useMemo(() => computeNiceScale(rawMax, 4), [rawMax]);
  const benchW = 240;
  const benchD = Math.max(130, Math.min(220, n * 34 + 34));
  const bench: Plan = useMemo(
    () => ({ x: 0, y: 0, w: benchW, d: benchD, r: 7 }),
    [benchW, benchD],
  );

  const proj = useMemo(() => {
    const pts: Point3[] = [
      ...boxCorners(bench, -6, BZ + 26),
      [-34, bench.d / 2, BZ],
      [bench.w + 26, bench.d / 2, BZ],
    ];
    return fitProjection(pts, vbW, vbH, { pad: 16, headroom: 12, azimuth, elevation });
  }, [bench, vbW, vbH, azimuth, elevation]);

  const innerX0 = 18;
  const maxBarLen = benchW - 38;
  const innerY0 = 18;
  const slotY = (benchD - 36) / n;

  const solids = useMemo(() => {
    const list: Array<{
      id: string;
      dataIdx: number;
      color: ChartColor;
      paths: SolidPaths;
      depth: number;
      endPt: Flat;
      val: number;
    }> = [];

    data.forEach((d, i) => {
      const cy = innerY0 + slotY * i + slotY / 2;
      const barD = Math.min(18, slotY * 0.58);
      let accX = innerX0;

      series.forEach((s) => {
        const val = Math.max(0, Number(d[s.key]) || 0);
        const len = scale.max > 0 ? Math.max(val > 0 ? 8 : 0, (val / scale.max) * maxBarLen) : 0;
        if (len <= 0.1) return;
        const x0 = stacked ? accX : innerX0;
        const paths = slabOf(
          { x: x0, y: cy - barD / 2, w: len, d: barD, r: 2.2 },
          BZ,
          12,
          proj,
          6,
          0.6,
        );
        list.push({
          id: `${i}-${s.key}`,
          dataIdx: i,
          color: (series.length === 1 ? (d.color as ChartColor) : undefined) ?? s.color,
          paths,
          depth: depthOf([x0 + len / 2, cy, BZ + 6], proj),
          endPt: iso([x0 + len + 8, cy, BZ + 7], proj),
          val,
        });
        if (stacked) accX += len + 1.5;
      });
    });

    return list.sort((a, b) => a.depth - b.depth);
  }, [data, series, stacked, scale.max, innerX0, maxBarLen, innerY0, slotY, proj]);

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const tooltipRows: ChartTooltipRow[] = useMemo(() => {
    if (!activePoint) return [];
    return series.map((s) => ({
      key: s.key,
      label: s.label,
      value: valueFormatter(Number(activePoint[s.key]) || 0),
      color: (series.length === 1 ? (activePoint.color as ChartColor) : undefined) ?? s.color,
    }));
  }, [activePoint, series, valueFormatter]);

  return (
    <div
      className="isx lopes-chart-3d relative w-full select-none tabular-nums"
      style={{ height: Math.max(240, height + 24) }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ChartTooltip
        visible={hoveredIndex !== null && Boolean(activePoint)}
        title={activePoint?.label ?? ""}
        rows={tooltipRows}
        xPct={50}
        yPct={5}
      />

      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full overflow-visible">
        {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

        {solids.map((s) => {
          const isHovered = hoveredIndex === s.dataIdx;
          const dimmed = hoveredIndex !== null && !isHovered;
          return (
            <g key={s.id}>
              <ColoredIsoSolid
                paths={s.paths}
                color={s.color}
                highlighted={isHovered}
                dimmed={dimmed}
                liftPx={isHovered ? 3.5 : 0}
                ariaLabel={`${data[s.dataIdx]?.label}: ${valueFormatter(s.val)}`}
                onMouseEnter={() => setHoveredIndex(s.dataIdx)}
                onClick={() => onDataPointClick?.(data[s.dataIdx]!, s.dataIdx)}
              />
              {series.length === 1 && (
                <text
                  x={s.endPt[0]}
                  y={s.endPt[1]}
                  textAnchor="start"
                  dominantBaseline="central"
                  className="fill-foreground/85 font-mono text-[10px] font-semibold pointer-events-none"
                >
                  {axisFormatter(s.val)}
                </text>
              )}
            </g>
          );
        })}

        {data.map((d, i) => {
          const cy = innerY0 + slotY * i + slotY / 2;
          const [lx, ly] = iso([-10, cy, BZ + 4], proj);
          return (
            <text
              key={d.label + i}
              x={lx}
              y={ly}
              textAnchor="end"
              dominantBaseline="central"
              className={cn(
                "text-[10.5px] cursor-pointer",
                hoveredIndex === i ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
              )}
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={() => onDataPointClick?.(d, i)}
            >
              {d.label.length > 14 ? `${d.label.slice(0, 12)}…` : d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── 3. Area & Line 3D (Isometric Extruded Ribbons / Ridges) ──────────────── */

function AreaLine3D({
  type,
  data,
  series,
  height,
  showGrid,
  showBench,
  azimuth,
  elevation,
  valueFormatter,
  axisFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart3DRendererProps) {
  const vbW = 560;
  const vbH = Math.max(250, Math.round(height * 1.15));
  const BZ = 8;
  const maxZ = 98;
  const isArea = type === "area";

  const rawMax = useMemo(() => {
    let m = 0;
    for (const d of data) {
      for (const s of series) {
        const v = Math.max(0, Number(d[s.key]) || 0);
        if (v > m) m = v;
      }
    }
    return m;
  }, [data, series]);

  const scale = useMemo(() => computeNiceScale(rawMax, 4), [rawMax]);
  const n = Math.max(2, data.length);
  const benchW = 280;
  const benchD = Math.max(110, series.length * 46 + 44);
  const bench: Plan = useMemo(
    () => ({ x: 0, y: 0, w: benchW, d: benchD, r: 7 }),
    [benchW, benchD],
  );

  const proj = useMemo(() => {
    const pts: Point3[] = [
      ...boxCorners(bench, -4, BZ + maxZ + 12),
      [-28, bench.d, BZ + maxZ],
      [-24, bench.d + 16, 0],
      [bench.w + 8, bench.d + 16, 0],
    ];
    return fitProjection(pts, vbW, vbH, { pad: 12, headroom: 14, azimuth, elevation });
  }, [bench, vbW, vbH, azimuth, elevation]);

  const innerX0 = 22;
  const innerX1 = benchW - 22;
  const getX = (i: number) => innerX0 + (i / (n - 1)) * (innerX1 - innerX0);
  const getZ = (v: number) => BZ + (scale.max > 0 ? Math.max(0, v / scale.max) * maxZ : 0);

  const innerY0 = 24;
  const laneStep = (benchD - 48) / Math.max(1, series.length);
  const ribbonThick = isArea ? Math.min(18, laneStep * 0.42) : Math.min(10, laneStep * 0.28);

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

  const hoveredAnchor = useMemo(() => {
    if (hoveredIndex === null) return { xPct: 50, yPct: 6 };
    const [sx] = iso([getX(hoveredIndex), benchD / 2, BZ + maxZ * 0.7], proj);
    return { xPct: (sx / vbW) * 100, yPct: 5 };
  }, [hoveredIndex, benchD, proj, vbW]);

  return (
    <div
      className="isx lopes-chart-3d relative w-full select-none tabular-nums"
      style={{ height: Math.max(240, height + 24) }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ChartTooltip
        visible={hoveredIndex !== null && Boolean(activePoint)}
        title={activePoint?.label ?? ""}
        rows={tooltipRows}
        xPct={hoveredAnchor.xPct}
        yPct={hoveredAnchor.yPct}
      />

      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full overflow-visible">
        {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

        {/* Back grid */}
        {showGrid && (
          <g className="pointer-events-none" aria-hidden="true">
            {scale.ticks.map((tick) => {
              const z = BZ + (tick / scale.max) * maxZ;
              const [lx, ly] = iso([0, bench.d, z], proj);
              return (
                <g key={tick}>
                  <path
                    d={segment([innerX0 - 6, 10, z], [innerX1 + 6, 10, z], proj)}
                    className="stroke-border/75"
                    strokeWidth={0.85}
                    strokeDasharray={tick === 0 ? undefined : "3 3"}
                    fill="none"
                  />
                  <path
                    d={segment([10, 10, z], [10, bench.d - 6, z], proj)}
                    className="stroke-border/55"
                    strokeWidth={0.85}
                    strokeDasharray={tick === 0 ? undefined : "3 3"}
                    fill="none"
                  />
                  <text
                    x={lx - 12}
                    y={ly}
                    textAnchor="end"
                    dominantBaseline="central"
                    className="fill-muted-foreground font-mono text-[10px]"
                  >
                    {axisFormatter(tick)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Series 3D Ribbons (back-to-front by Y lane) */}
        {series.map((s, sIdx) => {
          const yBack = innerY0 + laneStep * sIdx + (laneStep - ribbonThick) / 2;
          const yFront = yBack + ribbonThick;
          const mat = isoMaterialStyles(s.color);
          const palette = getChartPalette(s.color);

          const topBackPts: Flat[] = data.map((d, i) =>
            iso([getX(i), yBack, getZ(Math.max(0, Number(d[s.key]) || 0))], proj),
          );
          const topFrontPts: Flat[] = data.map((d, i) =>
            iso([getX(i), yFront, getZ(Math.max(0, Number(d[s.key]) || 0))], proj),
          );
          const baseFrontPts: Flat[] = data.map((_, i) => iso([getX(i), yFront, BZ], proj));
          const endWallPts: Flat[] = [
            topBackPts[topBackPts.length - 1]!,
            topFrontPts[topFrontPts.length - 1]!,
            baseFrontPts[baseFrontPts.length - 1]!,
            iso([getX(data.length - 1), yBack, BZ], proj),
          ];

          const frontWallD = pathOf([...topFrontPts, ...[...baseFrontPts].reverse()], true);
          const topRibbonSegments = data.slice(0, -1).map((_, i) =>
            pathOf([topBackPts[i]!, topBackPts[i + 1]!, topFrontPts[i + 1]!, topFrontPts[i]!], true),
          );

          return (
            <g key={s.key}>
              {/* Translucent vertical area wall */}
              {isArea && (
                <>
                  <path
                    d={frontWallD}
                    fill={mat.shades[2]}
                    fillOpacity={0.78}
                    stroke={mat.edge}
                    strokeWidth={0.75}
                    strokeLinejoin="round"
                  />
                  <path
                    d={pathOf(endWallPts, true)}
                    fill={mat.shades[0]}
                    fillOpacity={0.86}
                    stroke={mat.edge}
                    strokeWidth={0.75}
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Top 3D ribbon face */}
              {topRibbonSegments.map((dSeg, i) => (
                <path
                  key={i}
                  d={dSeg}
                  fill={mat.top}
                  fillOpacity={isArea ? 0.96 : 0.92}
                  stroke={mat.edge}
                  strokeWidth={0.7}
                  strokeLinejoin="round"
                />
              ))}

              {/* Crisp illuminated top ridge stroke */}
              <path
                d={pathOf(topFrontPts)}
                fill="none"
                stroke={palette.stroke}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive data vertices */}
              {data.map((d, i) => {
                const pt = topFrontPts[i]!;
                const isHovered = hoveredIndex === i;
                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onClick={() => onDataPointClick?.(d, i)}
                  >
                    {isHovered && (
                      <>
                        <path
                          d={segment(
                            [getX(i), yFront, BZ],
                            [getX(i), yFront, getZ(Math.max(0, Number(d[s.key]) || 0))],
                            proj,
                          )}
                          stroke={palette.stroke}
                          strokeWidth={1.2}
                          strokeDasharray="2 2"
                        />
                        <circle cx={pt[0]} cy={pt[1]} r={7} fill={palette.base} fillOpacity={0.22} />
                      </>
                    )}
                    <circle
                      cx={pt[0]}
                      cy={pt[1]}
                      r={isHovered ? 4 : 2.6}
                      className="fill-surface"
                      stroke={palette.stroke}
                      strokeWidth={1.8}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Front X-Axis Labels */}
        {data.map((d, i) => {
          const step = data.length <= 7 ? 1 : Math.ceil(data.length / 5);
          const isHovered = hoveredIndex === i;
          const isVisible =
            data.length <= 7 ||
            i === 0 ||
            i === data.length - 1 ||
            (i % step === 0 && data.length - 1 - i >= Math.max(1, Math.floor(step / 2))) ||
            isHovered;
          if (!isVisible) return null;
          const [lx, ly] = iso([getX(i), bench.d + 10, 0], proj);
          return (
            <text
              key={d.label + i}
              x={lx - 4}
              y={ly + 4}
              textAnchor="end"
              dominantBaseline="central"
              className={cn(
                "text-[10.5px] cursor-pointer",
                isHovered ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
              )}
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={() => onDataPointClick?.(d, i)}
            >
              {d.label.length > 13 ? `${d.label.slice(0, 11)}…` : d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── 4. Composed 3D (Isometric Columns + Floating 3D Target Ribbon) ───────── */

function Composed3D(props: Chart3DRendererProps) {
  const {
    data,
    series,
    height,
    showGrid,
    barShape,
    showBench,
    azimuth,
    elevation,
    valueFormatter,
    axisFormatter,
    hoveredIndex,
    setHoveredIndex,
    onDataPointClick,
  } = props;

  const barSeries = useMemo(
    () => series.filter((s, idx) => (s.renderAs ?? (idx === 0 ? "bar" : "line")) === "bar"),
    [series],
  );
  const lineSeries = useMemo(
    () => series.filter((s, idx) => (s.renderAs ?? (idx === 0 ? "bar" : "line")) !== "bar"),
    [series],
  );

  const vbW = 560;
  const vbH = Math.max(250, Math.round(height * 1.15));
  const BZ = 8;
  const maxZ = 102;
  const n = Math.max(2, data.length);

  const rawMax = useMemo(() => {
    let m = 0;
    for (const d of data) {
      for (const s of series) {
        const v = Math.max(0, Number(d[s.key]) || 0);
        if (v > m) m = v;
      }
    }
    return m;
  }, [data, series]);

  const scale = useMemo(() => computeNiceScale(rawMax, 4), [rawMax]);
  const benchW = Math.max(260, Math.min(400, n * 54 + 48));
  const benchD = 112;
  const bench: Plan = useMemo(() => ({ x: 0, y: 0, w: benchW, d: benchD, r: 7 }), [benchW]);

  const proj = useMemo(() => {
    const pts: Point3[] = [
      ...boxCorners(bench, -4, BZ + maxZ + 14),
      [-28, bench.d, BZ + maxZ],
      [-24, bench.d + 16, 0],
      [bench.w + 8, bench.d + 16, 0],
    ];
    return fitProjection(pts, vbW, vbH, { pad: 12, headroom: 14, azimuth, elevation });
  }, [bench, vbW, vbH, azimuth, elevation]);

  const innerX0 = 24;
  const innerX1 = benchW - 24;
  const slotX = (innerX1 - innerX0) / n;
  const getCenterX = (i: number) => innerX0 + slotX * i + slotX / 2;
  const getZ = (v: number) => BZ + (scale.max > 0 ? Math.max(0, v / scale.max) * maxZ : 0);

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
      className="isx lopes-chart-3d relative w-full select-none tabular-nums"
      style={{ height: Math.max(240, height + 24) }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ChartTooltip
        visible={hoveredIndex !== null && Boolean(activePoint)}
        title={activePoint?.label ?? ""}
        rows={tooltipRows}
        xPct={50}
        yPct={4}
      />

      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full overflow-visible">
        {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

        {showGrid &&
          scale.ticks.map((tick) => {
            const z = BZ + (tick / scale.max) * maxZ;
            const [lx, ly] = iso([0, bench.d, z], proj);
            return (
              <g key={tick} className="pointer-events-none">
                <path
                  d={segment([innerX0 - 8, 10, z], [innerX1 + 8, 10, z], proj)}
                  className="stroke-border/75"
                  strokeWidth={0.85}
                  strokeDasharray={tick === 0 ? undefined : "3 3"}
                  fill="none"
                />
                <path
                  d={segment([10, 10, z], [10, bench.d - 6, z], proj)}
                  className="stroke-border/55"
                  strokeWidth={0.85}
                  strokeDasharray={tick === 0 ? undefined : "3 3"}
                  fill="none"
                />
                <text
                  x={lx - 12}
                  y={ly}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-muted-foreground font-mono text-[10px]"
                >
                  {axisFormatter(tick)}
                </text>
              </g>
            );
          })}

        {/* Back lane: 3D columns */}
        {data.map((d, i) => {
          const cx = getCenterX(i);
          const cy = 42;
          const bw = Math.min(24, slotX * 0.54);
          const isHovered = hoveredIndex === i;
          const dimmed = hoveredIndex !== null && !isHovered;

          return barSeries.map((s) => {
            const val = Math.max(0, Number(d[s.key]) || 0);
            const h = Math.max(val > 0 ? 3 : 0, getZ(val) - BZ);
            if (h <= 0.1) return null;
            const paths =
              barShape === "cylinder"
                ? cylinder(cx, cy, bw / 2, BZ, h, proj, 26, 0.7)
                : slabOf({ x: cx - bw / 2, y: cy - bw / 2, w: bw, d: bw, r: 2.2 }, BZ, h, proj, 6, 0.7);
            return (
              <ColoredIsoSolid
                key={`${i}-${s.key}`}
                paths={paths}
                color={s.color}
                highlighted={isHovered}
                dimmed={dimmed}
                liftPx={isHovered ? 4 : 0}
                ariaLabel={`${d.label} — ${s.label}: ${valueFormatter(val)}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => onDataPointClick?.(d, i)}
              />
            );
          });
        })}

        {/* Front lane: Floating 3D trend ribbon closely aligned to columns */}
        {lineSeries.map((s) => {
          const yBack = 64;
          const yFront = 74;
          const mat = isoMaterialStyles(s.color);
          const palette = getChartPalette(s.color);
          const backPts = data.map((d, i) =>
            iso([getCenterX(i), yBack, getZ(Math.max(0, Number(d[s.key]) || 0))], proj),
          );
          const frontPts = data.map((d, i) =>
            iso([getCenterX(i), yFront, getZ(Math.max(0, Number(d[s.key]) || 0))], proj),
          );

          return (
            <g key={s.key}>
              {data.slice(0, -1).map((_, i) => (
                <path
                  key={i}
                  d={pathOf([backPts[i]!, backPts[i + 1]!, frontPts[i + 1]!, frontPts[i]!], true)}
                  fill={mat.top}
                  fillOpacity={0.92}
                  stroke={mat.edge}
                  strokeWidth={0.75}
                />
              ))}
              <path
                d={pathOf(frontPts)}
                fill="none"
                stroke={palette.stroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {frontPts.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt[0]}
                  cy={pt[1]}
                  r={hoveredIndex === i ? 4.5 : 3}
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

        {data.map((d, i) => {
          const step = data.length <= 7 ? 1 : Math.ceil(data.length / 5);
          const isHovered = hoveredIndex === i;
          const isVisible =
            data.length <= 7 ||
            i === 0 ||
            i === data.length - 1 ||
            (i % step === 0 && data.length - 1 - i >= Math.max(1, Math.floor(step / 2))) ||
            isHovered;
          if (!isVisible) return null;
          const [lx, ly] = iso([getCenterX(i), bench.d + 10, 0], proj);
          return (
            <text
              key={d.label + i}
              x={lx - 4}
              y={ly + 4}
              textAnchor="end"
              dominantBaseline="central"
              className={cn(
                "text-[10.5px] cursor-pointer",
                isHovered ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
              )}
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={() => onDataPointClick?.(d, i)}
            >
              {d.label.length > 13 ? `${d.label.slice(0, 11)}…` : d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── 5. Donut & Pie 3D (True 3D Extruded Annular/Pie Wedges with Explode) ── */

function buildWedgeRing(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
  arcSteps = 22,
): Plane[] {
  const sweep = endAngle - startAngle;
  const steps = Math.max(4, Math.round((sweep / (Math.PI * 2)) * arcSteps * 2));
  const ring: Plane[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (i / steps) * sweep;
    ring.push([cx + outerR * Math.cos(a), cy + outerR * Math.sin(a)]);
  }
  if (innerR > 1) {
    for (let i = steps; i >= 0; i--) {
      const a = startAngle + (i / steps) * sweep;
      ring.push([cx + innerR * Math.cos(a), cy + innerR * Math.sin(a)]);
    }
  } else {
    ring.push([cx, cy]);
  }
  return ring;
}

function Circular3D({
  data,
  valueKey,
  height,
  showLegend,
  showBench,
  azimuth,
  elevation,
  valueFormatter,
  centerLabel,
  centerSublabel,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
  isPie,
}: Chart3DRendererProps & { isPie: boolean }) {
  const total = useMemo(
    () => data.reduce((acc, d) => acc + Math.max(0, Number(d[valueKey]) || 0), 0),
    [data, valueKey],
  );

  const vbW = 340;
  const vbH = 240;
  const BZ = 6;
  const outerR = 76;
  const innerR = isPie ? 0 : 42;
  const thickness = 24;
  const bench: Plan = useMemo(() => ({ x: -94, y: -94, w: 188, d: 188, r: 14 }), []);

  const proj = useMemo(() => {
    const pts = boxCorners(bench, -6, BZ + thickness + 16);
    return fitProjection(pts, vbW, vbH, {
      pad: 14,
      headroom: 8,
      azimuth,
      elevation: Math.max(30, elevation + 6),
    });
  }, [bench, azimuth, elevation]);

  const padAngle = data.length > 1 ? 0.032 : 0;

  const slices = useMemo(() => {
    let cursor = -Math.PI / 2;
    return data.map((d, i) => {
      const val = Math.max(0, Number(d[valueKey]) || 0);
      const pct = total > 0 ? val / total : 0;
      const sweep = pct * Math.PI * 2;
      const start = cursor + padAngle / 2;
      const end = Math.max(start + 0.01, cursor + sweep - padAngle / 2);
      const mid = cursor + sweep / 2;
      cursor += sweep;
      const color = (d.color as ChartColor) || DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length]!;
      const isHovered = hoveredIndex === i;
      const explode = isHovered ? 8 : 0;
      const zOffset = isHovered ? 6 : 0;
      const ox = Math.cos(mid) * explode;
      const oy = Math.sin(mid) * explode;
      const ring = buildWedgeRing(ox, oy, outerR, innerR, start, end, 24);
      const paths = extrude(ring, BZ + zOffset, thickness, proj, { convex: false });
      const midR = (outerR + innerR) / 2;
      const depth = depthOf([ox + Math.cos(mid) * midR, oy + Math.sin(mid) * midR, BZ + zOffset], proj);

      return {
        idx: i,
        item: d,
        label: d.label,
        val,
        pct,
        color,
        palette: getChartPalette(color),
        paths,
        depth,
      };
    });
  }, [data, valueKey, total, padAngle, hoveredIndex, innerR, proj]);

  const sortedSlices = useMemo(() => [...slices].sort((a, b) => a.depth - b.depth), [slices]);
  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col @md:flex-row items-center justify-center gap-5 py-1 tabular-nums">
      <div
        className="isx lopes-chart-3d relative flex flex-col items-center justify-center shrink-0 w-full max-w-[320px]"
        style={{ height: Math.max(210, Math.min(height + 16, 260)) }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full overflow-visible">
          {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

          {sortedSlices.map((s) => {
            const isHovered = hoveredIndex === s.idx;
            const dimmed = hoveredIndex !== null && !isHovered;
            return (
              <ColoredIsoSolid
                key={s.label + s.idx}
                paths={s.paths}
                color={s.color}
                highlighted={isHovered}
                dimmed={dimmed}
                ariaLabel={`${s.label}: ${valueFormatter(s.val)} (${Math.round(s.pct * 100)}%)`}
                onMouseEnter={() => setHoveredIndex(s.idx)}
                onClick={() => onDataPointClick?.(s.item, s.idx)}
              />
            );
          })}
        </svg>

        {/* Crisp readout pill below/over 3D circular chart */}
        <div className="pointer-events-none -mt-3 rounded-full border border-border/80 bg-surface/95 backdrop-blur-sm px-3.5 py-1 shadow-xs text-center">
          <span className="font-mono text-xs font-bold text-foreground">
            {activeSlice
              ? valueFormatter(activeSlice.val)
              : (centerLabel ?? valueFormatter(total))}
          </span>
          <span className="mx-1.5 text-border">·</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {activeSlice
              ? `${activeSlice.label} (${Math.round(activeSlice.pct * 100)}%)`
              : (centerSublabel ?? "Total")}
          </span>
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-col gap-1.5 w-full min-w-0 @md:flex-1 @md:max-w-sm">
          {slices.map((s) => {
            const isHovered = hoveredIndex === s.idx;
            return (
              <button
                key={s.label + s.idx}
                type="button"
                onMouseEnter={() => setHoveredIndex(s.idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onDataPointClick?.(s.item, s.idx)}
                className={cn(
                  "flex flex-col gap-1 rounded-lg px-2.5 py-1.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  isHovered ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-3 text-xs w-full">
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span className={cn("size-2.5 rounded-full shrink-0", s.palette.bgClass)} />
                    <span className="font-medium text-foreground truncate">{s.label}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 shrink-0 font-mono">
                    <span className="font-semibold text-foreground">{valueFormatter(s.val)}</span>
                    {valueFormatter(s.val).trim() !== `${Math.round(s.pct * 100)}%` && (
                      <span className="text-[11px] text-muted-foreground w-9 text-right">
                        {Math.round(s.pct * 100)}%
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted/80 overflow-hidden">
                  <div
                    className="h-full rounded-full"
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

/* ── 6. Radial 3D (Concentric Isometric 3D Arc Rings) ─────────────────────── */

function Radial3D({
  data,
  valueKey,
  height,
  showLegend,
  showBench,
  azimuth,
  elevation,
  maxReference,
  valueFormatter,
  centerLabel,
  centerSublabel,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart3DRendererProps) {
  const items = data.slice(0, 5);
  const vbW = 340;
  const vbH = 240;
  const BZ = 6;
  const bench: Plan = useMemo(() => ({ x: -94, y: -94, w: 188, d: 188, r: 14 }), []);

  const proj = useMemo(() => {
    const pts = boxCorners(bench, -6, BZ + 26);
    return fitProjection(pts, vbW, vbH, {
      pad: 14,
      headroom: 8,
      azimuth,
      elevation: Math.max(30, elevation + 6),
    });
  }, [bench, azimuth, elevation]);

  const ringWidth = 10;
  const ringGap = 14;

  const rings = useMemo(() => {
    return items.map((d, idx) => {
      const outerR = 78 - idx * ringGap;
      const innerR = Math.max(16, outerR - ringWidth);
      const val = Math.max(0, Number(d[valueKey]) || 0);
      const pct = Math.max(0.02, Math.min(0.98, val / Math.max(1, maxReference)));
      const color = (d.color as ChartColor) || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]!;
      const start = -Math.PI / 2;
      const end = start + pct * Math.PI * 2;
      const trackRing = buildWedgeRing(0, 0, outerR, innerR, 0, Math.PI * 1.98, 28);
      const valueRing = buildWedgeRing(0, 0, outerR, innerR, start, end, 28);
      return {
        idx,
        item: d,
        val,
        pct,
        color,
        palette: getChartPalette(color),
        track: extrude(trackRing, BZ, 4, proj, { convex: false }),
        solid: extrude(valueRing, BZ + 4, 10 + (hoveredIndex === idx ? 4 : 0), proj, { convex: false }),
      };
    });
  }, [items, valueKey, maxReference, proj, hoveredIndex]);

  const avg = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round(items.reduce((a, d) => a + (Number(d[valueKey]) || 0), 0) / items.length);
  }, [items, valueKey]);
  const active = hoveredIndex !== null ? rings[hoveredIndex] : null;

  return (
    <div className="flex flex-col @md:flex-row items-center justify-center gap-5 py-1 tabular-nums">
      <div
        className="isx lopes-chart-3d relative flex flex-col items-center justify-center shrink-0 w-full max-w-[320px]"
        style={{ height: Math.max(210, Math.min(height + 16, 260)) }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full overflow-visible">
          {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

          {rings.map((r) => (
            <g key={`track-${r.idx}`} data-c="mid" opacity={0.45} className="pointer-events-none">
              <path className="isx-fill" d={r.track.fill} />
              <path className="isx-top" d={r.track.top} />
            </g>
          ))}

          {rings.map((r) => {
            const isHovered = hoveredIndex === r.idx;
            const dimmed = hoveredIndex !== null && !isHovered;
            return (
              <ColoredIsoSolid
                key={`val-${r.idx}`}
                paths={r.solid}
                color={r.color}
                highlighted={isHovered}
                dimmed={dimmed}
                ariaLabel={`${r.item.label}: ${valueFormatter(r.val)}`}
                onMouseEnter={() => setHoveredIndex(r.idx)}
                onClick={() => onDataPointClick?.(r.item, r.idx)}
              />
            );
          })}
        </svg>

        <div className="pointer-events-none -mt-3 rounded-full border border-border/80 bg-surface/95 backdrop-blur-sm px-3.5 py-1 shadow-xs text-center">
          <span className="font-mono text-xs font-bold text-foreground">
            {active ? valueFormatter(active.val) : (centerLabel ?? valueFormatter(avg))}
          </span>
          <span className="mx-1.5 text-border">·</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {active ? active.item.label : (centerSublabel ?? "Média")}
          </span>
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-col gap-1.5 w-full min-w-0 @md:flex-1 @md:max-w-sm">
          {rings.map((r) => (
            <button
              key={r.item.label + r.idx}
              type="button"
              onMouseEnter={() => setHoveredIndex(r.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onDataPointClick?.(r.item, r.idx)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                hoveredIndex === r.idx ? "bg-muted" : "hover:bg-muted/50",
              )}
            >
              <span className="inline-flex items-center gap-2 min-w-0">
                <span className={cn("size-2.5 rounded-full shrink-0", r.palette.bgClass)} />
                <span className="font-medium text-foreground truncate">{r.item.label}</span>
              </span>
              <span className="inline-flex items-center gap-2 shrink-0 font-mono">
                <span className="font-semibold text-foreground">{valueFormatter(r.val)}</span>
                {valueFormatter(r.val).trim() !== `${Math.round(r.pct * 100)}%` && (
                  <span className="text-[11px] text-muted-foreground w-9 text-right">
                    {Math.round(r.pct * 100)}%
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 7. Funnel 3D (Isometric Stacked Architectural Pyramid Tiers) ─────────── */

function Funnel3D({
  data,
  valueKey,
  height,
  showBench,
  azimuth,
  elevation,
  valueFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart3DRendererProps) {
  const vbW = 540;
  const vbH = Math.max(250, Math.round(height * 1.15));
  const BZ = 6;
  const n = Math.max(1, data.length);
  const maxVal = Math.max(1, ...data.map((d) => Math.max(0, Number(d[valueKey]) || 0)));
  const firstVal = Math.max(1, Number(data[0]?.[valueKey]) || maxVal);
  const tierH = 15;
  const tierGap = 4;
  const totalH = n * (tierH + tierGap);
  const bench: Plan = useMemo(() => ({ x: -90, y: -90, w: 180, d: 180, r: 10 }), []);

  const proj = useMemo(() => {
    const pts = boxCorners(bench, -4, BZ + totalH + 14);
    return fitProjection(pts, 270, vbH, { pad: 12, headroom: 8, azimuth, elevation });
  }, [bench, totalH, vbH, azimuth, elevation]);

  // Funnel convention: stage 0 (widest) at TOP, final converted stage at BOTTOM, rendered bottom-to-top for painter's order!
  const tiers = useMemo(() => {
    return data
      .map((d, idx) => {
        const val = Math.max(0, Number(d[valueKey]) || 0);
        const ratio = Math.max(0.28, val / maxVal);
        const side = 136 * Math.sqrt(ratio);
        const z = BZ + (n - 1 - idx) * (tierH + tierGap);
        const color = (d.color as ChartColor) || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]!;
        const paths = slabOf({ x: -side / 2, y: -side / 2, w: side, d: side, r: 5 }, z, tierH, proj, 6, 0.8);
        const anchorRight = iso([side / 2, 0, z + tierH * 0.55], proj);
        const labelY = 26 + idx * ((vbH - 52) / Math.max(1, n - 1));
        return {
          idx,
          item: d,
          val,
          pct: Math.round((val / firstVal) * 100),
          color,
          paths,
          z,
          anchorRight,
          labelY,
        };
      })
      .sort((a, b) => a.z - b.z);
  }, [data, valueKey, maxVal, firstVal, n, proj, vbH]);

  return (
    <div
      className="isx lopes-chart-3d relative w-full select-none tabular-nums"
      style={{ height: Math.max(240, height + 24) }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full overflow-visible">
        {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

        {tiers.map((t) => {
          const isHovered = hoveredIndex === t.idx;
          const dimmed = hoveredIndex !== null && !isHovered;
          const palette = getChartPalette(t.color);
          return (
            <g key={t.item.label + t.idx}>
              <ColoredIsoSolid
                paths={t.paths}
                color={t.color}
                highlighted={isHovered}
                dimmed={dimmed}
                liftPx={isHovered ? 4 : 0}
                ariaLabel={`${t.item.label}: ${valueFormatter(t.val)} (${t.pct}%)`}
                onMouseEnter={() => setHoveredIndex(t.idx)}
                onClick={() => onDataPointClick?.(t.item, t.idx)}
              />
              {/* Clean leader line & right-column callout */}
              <g
                className="cursor-pointer transition-opacity duration-150"
                style={{ opacity: dimmed ? 0.45 : 1 }}
                onMouseEnter={() => setHoveredIndex(t.idx)}
                onClick={() => onDataPointClick?.(t.item, t.idx)}
              >
                <path
                  d={`M ${t.anchorRight[0].toFixed(1)} ${t.anchorRight[1].toFixed(1)} L 274 ${t.labelY.toFixed(1)} L 288 ${t.labelY.toFixed(1)}`}
                  fill="none"
                  className={isHovered ? "stroke-foreground/60" : "stroke-border"}
                  strokeWidth={isHovered ? 1.25 : 0.9}
                  strokeDasharray="2 2"
                />
                <circle
                  cx={288}
                  cy={t.labelY}
                  r={2.8}
                  fill={palette.base}
                />
                <text
                  x={297}
                  y={t.labelY}
                  textAnchor="start"
                  dominantBaseline="central"
                  className={cn(
                    "text-[11px]",
                    isHovered ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
                  )}
                >
                  {t.item.label} ·{" "}
                  <tspan className="font-mono font-bold fill-foreground">
                    {valueFormatter(t.val)}
                  </tspan>{" "}
                  <tspan className="font-mono text-[10px]">({t.pct}%)</tspan>
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── 8. Radar 3D (Isometric Tilted Web + Extruded 3D Prism) ───────────────── */

function Radar3D({
  data,
  series,
  height,
  showBench,
  azimuth,
  elevation,
  valueFormatter,
  hoveredIndex,
  setHoveredIndex,
  onDataPointClick,
}: Chart3DRendererProps) {
  const vbW = 460;
  const vbH = Math.max(240, Math.round(height * 1.1));
  const BZ = 6;
  const radius = 74;
  const count = Math.max(3, data.length);
  const bench: Plan = useMemo(() => ({ x: -92, y: -92, w: 184, d: 184, r: 14 }), []);

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

  const proj = useMemo(() => {
    const pts = boxCorners(bench, -6, BZ + 36);
    return fitProjection(pts, vbW, vbH, {
      pad: 18,
      headroom: 8,
      azimuth,
      elevation: Math.max(32, elevation + 8),
    });
  }, [bench, vbW, vbH, azimuth, elevation]);

  const planePt = (i: number, ratio: number): Plane => {
    const a = -Math.PI / 2 + (i / count) * Math.PI * 2;
    return [Math.cos(a) * radius * ratio, Math.sin(a) * radius * ratio];
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
      className="isx lopes-chart-3d relative w-full select-none tabular-nums"
      style={{ height: Math.max(240, height + 20) }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <ChartTooltip
        visible={hoveredIndex !== null && Boolean(activePoint)}
        title={activePoint?.label ?? ""}
        rows={tooltipRows}
        xPct={50}
        yPct={4}
      />

      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-full overflow-visible">
        {showBench && <IsoBenchBase bench={bench} bz={BZ} proj={proj} />}

        {/* Isometric web rings */}
        {[0.33, 0.66, 1].map((lvl) => {
          const pts = Array.from({ length: count }, (_, i) => {
            const [px, py] = planePt(i, lvl);
            return iso([px, py, BZ], proj);
          });
          return (
            <path
              key={lvl}
              d={pathOf(pts, true)}
              fill="none"
              className="stroke-border/80"
              strokeWidth={0.9}
              strokeDasharray={lvl < 1 ? "2 3" : undefined}
            />
          );
        })}

        {/* Spokes & labels */}
        {data.map((d, i) => {
          const [ex, ey] = planePt(i, 1);
          const [lx, ly] = planePt(i, 1.32);
          const [sx, sy] = iso([lx, ly, BZ + 4], proj);
          return (
            <g key={d.label + i}>
              <path
                d={lineOnTop([0, 0], [ex, ey], BZ, proj)}
                className="stroke-border/65"
                strokeWidth={0.85}
                fill="none"
              />
              <text
                x={sx}
                y={sy}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn(
                  "text-[10.5px] cursor-pointer",
                  hoveredIndex === i ? "fill-foreground font-semibold" : "fill-muted-foreground font-medium",
                )}
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => onDataPointClick?.(d, i)}
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Extruded 3D prisms per series */}
        {series.map((s, sIdx) => {
          const ring: Plane[] = data.map((d, i) => {
            const val = Math.max(0, Number(d[s.key]) || 0);
            return planePt(i, maxVal > 0 ? Math.max(0.08, val / maxVal) : 0.08);
          });
          const zBase = BZ + sIdx * 10;
          const solid = extrude(ring, zBase, 11, proj, { convex: false });
          return (
            <ColoredIsoSolid
              key={s.key}
              paths={solid}
              color={s.color}
              opacity={series.length > 1 ? 0.78 : 0.9}
            />
          );
        })}
      </svg>
    </div>
  );
}
