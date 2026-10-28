"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type ProgressTone = "default" | "primary" | "info" | "success" | "warning" | "danger";
export type ProgressSize = "sm" | "md" | "lg";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Value between 0 and max */
  value?: number;
  max?: number;
  variant?: "linear" | "circular";
  tone?: ProgressTone;
  size?: ProgressSize;
  /** Custom pixel diameter for circular / radial progress (daisyUI --size equivalent) */
  sizePx?: number;
  /** Custom stroke thickness in pixels for circular / radial progress (daisyUI --thickness equivalent) */
  thicknessPx?: number;
  /** Animated indeterminate state */
  indeterminate?: boolean;
  /** Diagonal stripe pattern (linear only) */
  striped?: boolean;
  /** Shows percentage label */
  showValue?: boolean;
  /** Optional header label above linear bar or inside circular bar */
  label?: React.ReactNode;
  formatValue?: (percentage: number, value: number, max: number) => React.ReactNode;
};

const TONE_BAR_CLS: Record<ProgressTone, string> = {
  default: "bg-zinc-900 dark:bg-zinc-100",
  primary: "bg-indigo-600 dark:bg-indigo-500",
  info: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

const TONE_STROKE_CLS: Record<ProgressTone, string> = {
  default: "stroke-zinc-900 dark:stroke-zinc-100",
  primary: "stroke-indigo-600 dark:stroke-indigo-400",
  info: "stroke-sky-500",
  success: "stroke-emerald-500",
  warning: "stroke-amber-500",
  danger: "stroke-rose-500",
};

const LINEAR_HEIGHT_CLS: Record<ProgressSize, string> = {
  sm: "h-2",
  md: "h-2.5",
  lg: "h-3.5",
};

const CIRCULAR_DIM: Record<ProgressSize, { px: number; stroke: number; text: string }> = {
  sm: { px: 48, stroke: 4, text: "text-[11px]" },
  md: { px: 64, stroke: 5, text: "text-xs" },
  lg: { px: 80, stroke: 6, text: "text-sm" },
};

export default function Progress({
  value = 0,
  max = 100,
  variant = "linear",
  tone = "primary",
  size = "md",
  sizePx,
  thicknessPx,
  indeterminate = false,
  striped = false,
  showValue = false,
  label,
  formatValue,
  className,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.max(0, Math.min(safeMax, value));
  const percentage = Math.round((clamped / safeMax) * 100);
  const formattedText = formatValue
    ? formatValue(percentage, clamped, safeMax)
    : `${percentage}%`;

  if (variant === "circular") {
    const presetDim = CIRCULAR_DIM[size];
    const px = sizePx ?? presetDim.px;
    const stroke = thicknessPx ?? presetDim.stroke;
    const radius = (px - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = indeterminate
      ? circumference * 0.7
      : circumference - (percentage / 100) * circumference;

    return (
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: px, height: px }}
        {...props}
      >
        <svg
          width={px}
          height={px}
          viewBox={`0 0 ${px} ${px}`}
          className={cn("-rotate-90", indeterminate && "animate-spin")}
        >
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-zinc-200 dark:stroke-zinc-800"
          />
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-300 ease-out", TONE_STROKE_CLS[tone])}
          />
        </svg>
        {(showValue || label) && (
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center font-semibold tabular-nums text-zinc-800 dark:text-zinc-100",
              presetDim.text,
            )}
          >
            {label ?? formattedText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-xs">
          {label ? (
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
          ) : (
            <span />
          )}
          {showValue && !indeterminate && (
            <span className="font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
              {formattedText}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800",
          LINEAR_HEIGHT_CLS[size],
        )}
      >
        <div
          style={{ width: indeterminate ? "40%" : `${percentage}%` }}
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            TONE_BAR_CLS[tone],
            indeterminate && "animate-pulse",
            striped &&
              "bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]",
          )}
        />
      </div>
    </div>
  );
}

/**
 * RadialProgress — daisyUI `radial-progress` shortcut component
 */
export function RadialProgress(props: Omit<ProgressProps, "variant">) {
  return <Progress showValue {...props} variant="circular" />;
}
