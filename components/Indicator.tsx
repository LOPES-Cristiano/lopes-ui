"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type IndicatorPosition =
  | "top-start"
  | "top-center"
  | "top-end"
  | "middle-start"
  | "middle-center"
  | "middle-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

export type IndicatorTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type IndicatorProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Content inside the badge/indicator (omit for a small dot) */
  badge?: React.ReactNode;
  /** Position of the indicator relative to the child element (default: "top-end") */
  position?: IndicatorPosition;
  tone?: IndicatorTone;
  /** Show an animated ping halo around the indicator */
  ping?: boolean;
  /** Hide the indicator dynamically (e.g. when count === 0) */
  hidden?: boolean;
  /** Render the indicator inline with custom node instead of default pill */
  rawBadge?: boolean;
  badgeClassName?: string;
};

const POSITION_CLS: Record<IndicatorPosition, string> = {
  "top-start": "-top-2 -left-2",
  "top-center": "-top-2 left-1/2 -translate-x-1/2",
  "top-end": "-top-2 -right-2",
  "middle-start": "top-1/2 -left-2 -translate-y-1/2",
  "middle-center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "middle-end": "top-1/2 -right-2 -translate-y-1/2",
  "bottom-start": "-bottom-2 -left-2",
  "bottom-center": "-bottom-2 left-1/2 -translate-x-1/2",
  "bottom-end": "-bottom-2 -right-2",
};

const TONE_CLS: Record<IndicatorTone, string> = {
  default: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900",
  primary: "bg-indigo-600 text-white",
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-white",
  danger: "bg-rose-500 text-white",
  info: "bg-sky-500 text-white",
};

export default function Indicator({
  badge,
  position = "top-end",
  tone = "primary",
  ping = false,
  hidden = false,
  rawBadge = false,
  badgeClassName,
  className,
  children,
  ...props
}: IndicatorProps) {
  const isDot = badge === undefined || badge === null || badge === "";

  return (
    <div className={cn("relative inline-flex", className)} {...props}>
      {children}
      {!hidden && (
        <span
          className={cn(
            "pointer-events-none absolute z-10 inline-flex items-center justify-center",
            POSITION_CLS[position],
            badgeClassName
          )}
        >
          {rawBadge ? (
            badge
          ) : (
            <span className="relative inline-flex items-center justify-center">
              {ping && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    TONE_CLS[tone]
                  )}
                />
              )}
              <span
                className={cn(
                  "relative inline-flex items-center justify-center rounded-full font-bold leading-none ring-2 ring-white dark:ring-zinc-950 shadow-xs",
                  TONE_CLS[tone],
                  isDot
                    ? "h-2.5 w-2.5"
                    : "min-w-[18px] h-[18px] px-1 text-[10px] tabular-nums"
                )}
              >
                {!isDot ? badge : null}
              </span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}
