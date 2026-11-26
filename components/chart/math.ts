import type { ChartCurve } from "./types";

export interface Point2D {
  x: number;
  y: number;
}

export interface NiceScale {
  max: number;
  step: number;
  ticks: number[];
}

/**
 * Computes human-friendly rounded axis ticks (e.g. 0, 200, 400, 600, 800)
 * instead of arbitrary fractional values.
 */
export function computeNiceScale(rawMax: number, tickCount = 4): NiceScale {
  if (!Number.isFinite(rawMax) || rawMax <= 0) {
    const step = 25;
    return { max: 100, step, ticks: [0, 25, 50, 75, 100] };
  }

  const padded = rawMax * 1.06;
  const roughStep = padded / tickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 2.5) niceNormalized = 2.5;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;

  const step = niceNormalized * magnitude;
  const max = Math.ceil(padded / step) * step;
  const ticks: number[] = [];
  const count = Math.round(max / step);
  for (let i = 0; i <= count; i++) {
    ticks.push(Number((i * step).toPrecision(12)));
  }

  return { max, step, ticks };
}

/**
 * Compact PT-BR number formatter for dense axes when no custom axisFormatter is provided.
 */
export function formatCompactPtBr(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} bi`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  if (abs >= 10_000) {
    return `${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }
  return value.toLocaleString("pt-BR");
}

const f1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");

/**
 * Monotone cubic Hermite spline (Fritsch-Carlson) for smooth, non-overshooting curves.
 */
export function buildCurvePath(points: Point2D[], curve: ChartCurve = "smooth"): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${f1(points[0]!.x)} ${f1(points[0]!.y)}`;

  if (curve === "linear" || n === 2) {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${f1(p.x)} ${f1(p.y)}`)
      .join(" ");
  }

  if (curve === "step") {
    const cmds = [`M ${f1(points[0]!.x)} ${f1(points[0]!.y)}`];
    for (let i = 1; i < n; i++) {
      const prev = points[i - 1]!;
      const curr = points[i]!;
      const midX = (prev.x + curr.x) / 2;
      cmds.push(`H ${f1(midX)} V ${f1(curr.y)} H ${f1(curr.x)}`);
    }
    return cmds.join(" ");
  }

  // Monotone cubic Hermite interpolation
  const dx: number[] = [];
  const dy: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dxi = points[i + 1]!.x - points[i]!.x;
    const dyi = points[i + 1]!.y - points[i]!.y;
    dx.push(dxi);
    dy.push(dyi);
    slopes.push(dxi !== 0 ? dyi / dxi : 0);
  }

  const tangents: number[] = new Array(n).fill(0);
  tangents[0] = slopes[0]!;
  tangents[n - 1] = slopes[n - 2]!;

  for (let i = 1; i < n - 1; i++) {
    const sPrev = slopes[i - 1]!;
    const sNext = slopes[i]!;
    if (sPrev * sNext <= 0) {
      tangents[i] = 0;
    } else {
      const common = dx[i - 1]! + dx[i]!;
      tangents[i] = (3 * common) / ((common + dx[i]!) / sPrev + (common + dx[i - 1]!) / sNext);
    }
  }

  const cmds = [`M ${f1(points[0]!.x)} ${f1(points[0]!.y)}`];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const h = dx[i]!;
    const c1x = p0.x + h / 3;
    const c1y = p0.y + (tangents[i]! * h) / 3;
    const c2x = p1.x - h / 3;
    const c2y = p1.y - (tangents[i + 1]! * h) / 3;
    cmds.push(`C ${f1(c1x)} ${f1(c1y)}, ${f1(c2x)} ${f1(c2y)}, ${f1(p1.x)} ${f1(p1.y)}`);
  }

  return cmds.join(" ");
}

/**
 * Generates a closed SVG area path under a curve down to baselineY.
 */
export function buildAreaPath(points: Point2D[], baselineY: number, curve: ChartCurve = "smooth"): string {
  if (points.length === 0) return "";
  const line = buildCurvePath(points, curve);
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return `${line} L ${f1(last.x)} ${f1(baselineY)} L ${f1(first.x)} ${f1(baselineY)} Z`;
}

/**
 * Generates an SVG annular sector (donut slice) or pie wedge path.
 * Angles are in radians where -PI/2 is 12 o'clock.
 */
export function describeSectorPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0.0001) return "";

  // Handle full circle (nearly 2*PI) gracefully with two half arcs
  if (sweep >= Math.PI * 2 - 0.001) {
    const mid = startAngle + Math.PI;
    return [
      describeSectorPath(cx, cy, outerR, innerR, startAngle, mid),
      describeSectorPath(cx, cy, outerR, innerR, mid, startAngle + Math.PI * 2 - 0.002),
    ].join(" ");
  }

  const largeArc = sweep > Math.PI ? 1 : 0;
  const ox1 = cx + outerR * Math.cos(startAngle);
  const oy1 = cy + outerR * Math.sin(startAngle);
  const ox2 = cx + outerR * Math.cos(endAngle);
  const oy2 = cy + outerR * Math.sin(endAngle);

  if (innerR <= 0.5) {
    return `M ${f1(cx)} ${f1(cy)} L ${f1(ox1)} ${f1(oy1)} A ${f1(outerR)} ${f1(outerR)} 0 ${largeArc} 1 ${f1(ox2)} ${f1(oy2)} Z`;
  }

  const ix1 = cx + innerR * Math.cos(endAngle);
  const iy1 = cy + innerR * Math.sin(endAngle);
  const ix2 = cx + innerR * Math.cos(startAngle);
  const iy2 = cy + innerR * Math.sin(startAngle);

  return [
    `M ${f1(ox1)} ${f1(oy1)}`,
    `A ${f1(outerR)} ${f1(outerR)} 0 ${largeArc} 1 ${f1(ox2)} ${f1(oy2)}`,
    `L ${f1(ix1)} ${f1(iy1)}`,
    `A ${f1(innerR)} ${f1(innerR)} 0 ${largeArc} 0 ${f1(ix2)} ${f1(iy2)}`,
    "Z",
  ].join(" ");
}

/**
 * Generates an open SVG circular arc path (used for radial rings / gauges).
 */
export function describeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0.0001) return "";
  const clampedSweep = Math.min(sweep, Math.PI * 2 - 0.002);
  const end = startAngle + clampedSweep;
  const largeArc = clampedSweep > Math.PI ? 1 : 0;
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  return `M ${f1(x1)} ${f1(y1)} A ${f1(radius)} ${f1(radius)} 0 ${largeArc} 1 ${f1(x2)} ${f1(y2)}`;
}
