"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export type CountdownVariant = "inline" | "boxed" | "cards" | "compact";
export type CountdownSize = "sm" | "md" | "lg" | "xl";
export type CountdownTone = "default" | "primary" | "success" | "warning" | "danger";

export type CountdownTimeParts = {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type CountdownProps = {
  /** Target future Date, timestamp (ms), or ISO string */
  targetDate?: Date | string | number;
  /** Initial days to count down from (combined with hours/minutes/seconds) */
  days?: number;
  /** Initial hours to count down from (combined with days/minutes/seconds) */
  hours?: number;
  /** Initial minutes to count down from (combined with days/hours/seconds) */
  minutes?: number;
  /** Duration in seconds (or seconds part when combined with days/hours/minutes) */
  seconds?: number;
  /** Or static/controlled numerical value (0-99) when used as a single daisyUI `<Countdown value={42} />` digit */
  value?: number;
  variant?: CountdownVariant;
  size?: CountdownSize;
  tone?: CountdownTone;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  /** Custom labels for units */
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
  /** Pause the countdown */
  paused?: boolean;
  /** Automatically restart duration countdown when reaching 0 (default: false) */
  loop?: boolean;
  /** Callback fired when timer reaches 0 */
  onComplete?: () => void;
  /** Callback fired on each tick */
  onTick?: (parts: CountdownTimeParts) => void;
  /** Access-control identifier */
  componentId?: string;
  hideIfDenied?: boolean;
  className?: string;
};

const SIZE_CLS: Record<
  CountdownSize,
  { digit: string; label: string; box: string; gap: string }
> = {
  sm: { digit: "text-base", label: "text-[10px]", box: "px-2.5 py-1.5 min-w-[50px]", gap: "gap-2" },
  md: { digit: "text-xl", label: "text-[10px]", box: "px-3 py-2 min-w-[62px]", gap: "gap-2.5" },
  lg: { digit: "text-2xl sm:text-3xl", label: "text-[11px]", box: "px-3.5 py-2.5 min-w-[74px]", gap: "gap-3" },
  xl: { digit: "text-3xl sm:text-4xl", label: "text-xs", box: "px-4 py-3 min-w-[86px]", gap: "gap-3.5" },
};

const TONE_BOX_CLS: Record<CountdownTone, string> = {
  default:
    "bg-zinc-50 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100 border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xs",
  primary:
    "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/70 shadow-2xs",
  success:
    "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/70 shadow-2xs",
  warning:
    "bg-amber-50/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/70 shadow-2xs",
  danger:
    "bg-rose-50/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/70 shadow-2xs",
};

const TONE_TEXT_CLS: Record<CountdownTone, string> = {
  default: "text-zinc-900 dark:text-zinc-100",
  primary: "text-indigo-600 dark:text-indigo-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-rose-600 dark:text-rose-400",
};

function computeParts(totalSec: number): CountdownTimeParts {
  const clamped = Math.max(0, Math.floor(totalSec));
  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return { totalSeconds: clamped, days, hours, minutes, seconds };
}

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

const DIGITS_0_TO_99 = Array.from({ length: 100 }, (_, i) => pad2(i));

/**
 * Animated two-digit rolling display (daisyUI `.countdown` odometer style)
 * Uses explicit `1.2em` row heights with `shrink-0` and GPU `translate3d`
 * so digits never squash inside flex containers and roll smoothly at 60fps.
 */
export function CountdownDigit({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(99, Math.floor(Number.isFinite(value) ? value : 0)));
  return (
    <span
      aria-live="polite"
      aria-label={pad2(clamped)}
      className={cn(
        "relative inline-block h-[1.2em] overflow-hidden font-mono font-bold leading-[1.2em] tabular-nums align-middle select-none",
        className
      )}
    >
      <span
        style={{
          transform: `translate3d(0, -${clamped * 1.2}em, 0)`,
        }}
        className="flex flex-col will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        {DIGITS_0_TO_99.map((digits, i) => (
          <span
            key={i}
            aria-hidden={i !== clamped}
            className="flex h-[1.2em] shrink-0 items-center justify-center leading-[1.2em]"
          >
            {digits}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Countdown({
  targetDate,
  days: daysProp,
  hours: hoursProp,
  minutes: minutesProp,
  seconds: secondsProp,
  value: singleValue,
  variant = "boxed",
  size = "md",
  tone = "default",
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  labels,
  paused = false,
  loop = false,
  onComplete,
  onTick,
  componentId,
  hideIfDenied = true,
  className,
}: CountdownProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  // Calculate explicit duration in seconds when days/hours/minutes/seconds props are used
  const durationSeconds = useMemo(() => {
    if (
      daysProp !== undefined ||
      hoursProp !== undefined ||
      minutesProp !== undefined ||
      secondsProp !== undefined
    ) {
      return Math.max(
        0,
        Math.floor(
          (daysProp ?? 0) * 86400 +
            (hoursProp ?? 0) * 3600 +
            (minutesProp ?? 0) * 60 +
            (secondsProp ?? 0)
        )
      );
    }
    return undefined;
  }, [daysProp, hoursProp, minutesProp, secondsProp]);

  // Parse targetDate once and guard against inline `new Date(Date.now() + X)` re-renders
  const rawTargetMs = useMemo(() => {
    if (targetDate === undefined) return undefined;
    const ms =
      targetDate instanceof Date
        ? targetDate.getTime()
        : typeof targetDate === "number"
          ? targetDate
          : new Date(targetDate).getTime();
    return Number.isNaN(ms) ? undefined : ms;
  }, [targetDate instanceof Date ? targetDate.getTime() : targetDate]);

  const stableTargetMsRef = useRef<number | undefined>(rawTargetMs);
  if (rawTargetMs === undefined) {
    stableTargetMsRef.current = undefined;
  } else if (
    stableTargetMsRef.current === undefined ||
    Math.abs(rawTargetMs - stableTargetMsRef.current) > 5000
  ) {
    // Only update target timestamp if it changed by > 5s (ignores inline Date.now() jitter on parent re-renders)
    stableTargetMsRef.current = rawTargetMs;
  }
  const effectiveTargetMs = stableTargetMsRef.current;

  const computeInitialSeconds = (): number => {
    if (durationSeconds !== undefined) {
      return durationSeconds;
    }
    if (effectiveTargetMs !== undefined) {
      return Math.max(0, Math.floor((effectiveTargetMs - Date.now()) / 1000));
    }
    return 3600; // Default 1 hour fallback if neither duration nor targetDate is provided
  };

  const [remaining, setRemaining] = useState<number>(computeInitialSeconds);

  // Sync when duration props or effectiveTargetMs meaningfully change
  useEffect(() => {
    setRemaining(computeInitialSeconds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds, effectiveTargetMs]);

  // Main 1-second tick interval
  useEffect(() => {
    if (singleValue !== undefined || paused) return;

    const timer = setInterval(() => {
      setRemaining((prev) => {
        let next: number;
        if (effectiveTargetMs !== undefined && durationSeconds === undefined) {
          next = Math.max(0, Math.floor((effectiveTargetMs - Date.now()) / 1000));
        } else {
          if (prev <= 0) {
            return loop && durationSeconds ? durationSeconds : 0;
          }
          next = prev - 1;
        }

        const parts = computeParts(next);
        onTickRef.current?.(parts);

        if (next === 0 && prev > 0) {
          onCompleteRef.current?.();
          if (loop && durationSeconds) {
            return durationSeconds;
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [singleValue, paused, effectiveTargetMs, durationSeconds, loop]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const s = SIZE_CLS[size];

  // Single-number mode (`<Countdown value={45} />`)
  if (singleValue !== undefined) {
    return (
      <span
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={cn("inline-flex items-center", s.digit, TONE_TEXT_CLS[tone], className)}
      >
        <CountdownDigit value={singleValue} />
      </span>
    );
  }

  const parts = computeParts(remaining);
  const unitLabels = {
    days: labels?.days ?? "dias",
    hours: labels?.hours ?? "horas",
    minutes: labels?.minutes ?? "min",
    seconds: labels?.seconds ?? "seg",
  };

  const units: { key: string; value: number; label: string }[] = [];
  if (showDays) {
    units.push({ key: "days", value: Math.min(99, parts.days), label: unitLabels.days });
  }
  if (showHours) {
    units.push({ key: "hours", value: parts.hours, label: unitLabels.hours });
  }
  if (showMinutes) {
    units.push({ key: "minutes", value: parts.minutes, label: unitLabels.minutes });
  }
  if (showSeconds) {
    units.push({ key: "seconds", value: parts.seconds, label: unitLabels.seconds });
  }

  if (variant === "compact") {
    return (
      <div
        role="timer"
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={cn(
          "inline-flex items-center font-mono font-bold tabular-nums",
          s.digit,
          TONE_TEXT_CLS[tone],
          className
        )}
      >
        {units.map((u, idx) => (
          <React.Fragment key={u.key}>
            <CountdownDigit value={u.value} />
            {idx < units.length - 1 && (
              <span className="mx-0.5 opacity-60">:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        role="timer"
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={cn("inline-flex flex-wrap items-baseline", s.gap, className)}
      >
        {units.map((u) => (
          <span key={u.key} className="inline-flex items-baseline gap-1">
            <CountdownDigit
              value={u.value}
              className={cn(s.digit, TONE_TEXT_CLS[tone])}
            />
            <span className={cn("font-medium text-zinc-500 dark:text-zinc-400", s.label)}>
              {u.label}
            </span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      role="timer"
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn("inline-flex flex-wrap items-center", s.gap, className)}
    >
      {units.map((u) => (
        <div
          key={u.key}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl text-center transition-colors",
            s.box,
            variant === "cards"
              ? "bg-zinc-900 text-white dark:bg-zinc-950 dark:text-zinc-50 shadow-md border border-zinc-800"
              : TONE_BOX_CLS[tone]
          )}
        >
          <CountdownDigit value={u.value} className={s.digit} />
          <span
            className={cn(
              "mt-0.5 uppercase tracking-wider font-medium opacity-75",
              s.label
            )}
          >
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
