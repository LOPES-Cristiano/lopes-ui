import type { ChartColor } from "./types";

export interface ChartPaletteEntry {
  /** Base semantic color (CSS var with hex fallback) */
  base: string;
  /** High-contrast stroke for lines/edges */
  stroke: string;
  /** Gradient start color for fills */
  fillStart: string;
  /** Gradient end color for fills */
  fillEnd: string;
  /** Tailwind dot/swatch background class */
  bgClass: string;
  /** Tailwind text class */
  textClass: string;
  /** Raw hex used for OKLab color-mix() in 3D isometric shading */
  hex: string;
}

export const CHART_PALETTE: Record<ChartColor, ChartPaletteEntry> = {
  indigo: {
    base: "var(--chart-1, #4f46e5)",
    stroke: "var(--chart-1, #4f46e5)",
    fillStart: "var(--chart-1, #6366f1)",
    fillEnd: "color-mix(in oklab, var(--chart-1, #4f46e5) 12%, transparent)",
    bgClass: "bg-indigo-600 dark:bg-indigo-400",
    textClass: "text-indigo-600 dark:text-indigo-400",
    hex: "#4f46e5",
  },
  emerald: {
    base: "var(--chart-3, #10b981)",
    stroke: "var(--chart-3, #059669)",
    fillStart: "var(--chart-3, #10b981)",
    fillEnd: "color-mix(in oklab, var(--chart-3, #10b981) 12%, transparent)",
    bgClass: "bg-emerald-500 dark:bg-emerald-400",
    textClass: "text-emerald-600 dark:text-emerald-400",
    hex: "#10b981",
  },
  amber: {
    base: "var(--chart-4, #f59e0b)",
    stroke: "var(--chart-4, #d97706)",
    fillStart: "var(--chart-4, #f59e0b)",
    fillEnd: "color-mix(in oklab, var(--chart-4, #f59e0b) 12%, transparent)",
    bgClass: "bg-amber-500 dark:bg-amber-400",
    textClass: "text-amber-600 dark:text-amber-400",
    hex: "#f59e0b",
  },
  rose: {
    base: "var(--chart-5, #f43f5e)",
    stroke: "var(--chart-5, #e11d48)",
    fillStart: "var(--chart-5, #f43f5e)",
    fillEnd: "color-mix(in oklab, var(--chart-5, #f43f5e) 12%, transparent)",
    bgClass: "bg-rose-500 dark:bg-rose-400",
    textClass: "text-rose-600 dark:text-rose-400",
    hex: "#f43f5e",
  },
  sky: {
    base: "var(--chart-2, #0ea5e9)",
    stroke: "var(--chart-2, #0284c7)",
    fillStart: "var(--chart-2, #0ea5e9)",
    fillEnd: "color-mix(in oklab, var(--chart-2, #0ea5e9) 12%, transparent)",
    bgClass: "bg-sky-500 dark:bg-sky-400",
    textClass: "text-sky-600 dark:text-sky-400",
    hex: "#0ea5e9",
  },
  violet: {
    base: "var(--chart-6, #8b5cf6)",
    stroke: "var(--chart-6, #7c3aed)",
    fillStart: "var(--chart-6, #8b5cf6)",
    fillEnd: "color-mix(in oklab, var(--chart-6, #8b5cf6) 12%, transparent)",
    bgClass: "bg-violet-500 dark:bg-violet-400",
    textClass: "text-violet-600 dark:text-violet-400",
    hex: "#8b5cf6",
  },
  teal: {
    base: "#14b8a6",
    stroke: "#0d9488",
    fillStart: "#14b8a6",
    fillEnd: "color-mix(in oklab, #14b8a6 12%, transparent)",
    bgClass: "bg-teal-500 dark:bg-teal-400",
    textClass: "text-teal-600 dark:text-teal-400",
    hex: "#14b8a6",
  },
  orange: {
    base: "#f97316",
    stroke: "#ea580c",
    fillStart: "#f97316",
    fillEnd: "color-mix(in oklab, #f97316 12%, transparent)",
    bgClass: "bg-orange-500 dark:bg-orange-400",
    textClass: "text-orange-600 dark:text-orange-400",
    hex: "#f97316",
  },
  cyan: {
    base: "#06b6d4",
    stroke: "#0891b2",
    fillStart: "#06b6d4",
    fillEnd: "color-mix(in oklab, #06b6d4 12%, transparent)",
    bgClass: "bg-cyan-500 dark:bg-cyan-400",
    textClass: "text-cyan-600 dark:text-cyan-400",
    hex: "#06b6d4",
  },
  zinc: {
    base: "#71717a",
    stroke: "#52525b",
    fillStart: "#71717a",
    fillEnd: "color-mix(in oklab, #71717a 12%, transparent)",
    bgClass: "bg-zinc-500 dark:bg-zinc-400",
    textClass: "text-zinc-600 dark:text-zinc-400",
    hex: "#71717a",
  },
};

export const DEFAULT_CHART_COLORS: ChartColor[] = [
  "indigo",
  "emerald",
  "sky",
  "amber",
  "rose",
  "violet",
  "teal",
  "orange",
  "cyan",
  "zinc",
];

export function getChartPalette(color?: ChartColor): ChartPaletteEntry {
  if (color && color in CHART_PALETTE) {
    return CHART_PALETTE[color];
  }
  return CHART_PALETTE.indigo;
}

/**
 * Generates directional 4-shade isometric CSS colors in `oklab` space so neutrals
 * never shift hue and chromatic colors preserve natural saturation & contrast.
 */
export function isoMaterialStyles(color: ChartColor): {
  top: string;
  shades: [string, string, string, string];
  paper: string;
  edge: string;
  crease: string;
} {
  const base = getChartPalette(color).base;
  return {
    top: `color-mix(in oklab, ${base} 62%, white)`,
    shades: [
      `color-mix(in oklab, ${base} 66%, black)`,
      `color-mix(in oklab, ${base} 80%, black)`,
      base,
      `color-mix(in oklab, ${base} 84%, white)`,
    ],
    paper: base,
    edge: `color-mix(in oklab, ${base} 46%, black)`,
    crease: `color-mix(in oklab, ${base} 44%, white)`,
  };
}
