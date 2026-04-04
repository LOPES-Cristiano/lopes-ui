"use client";

import React, { useId } from "react";
import { twMerge } from "tailwind-merge";
import { HelpCircle, AlertCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SwitchProps = {
  id?: string;
  name?: string;
  label?: string;
  /** Label rendered to the right of the toggle (inline). Use instead of `label` for compact rows. */
  inlineLabel?: string;
  /** Description rendered below the label */
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  /** Tooltip shown on hover of the ? icon */
  tooltip?: string;
  /** Validation error */
  error?: string;
  /** Subtle helper text below the toggle */
  helpText?: string;
  size?: "sm" | "md" | "lg";
  /** Color of the track when ON */
  color?: "indigo" | "emerald" | "sky" | "rose" | "amber" | "zinc";
  /** When true, the label is rendered to the left of the toggle */
  labelLeft?: boolean;
  /** Tailwind width class of the outer wrapper */
  width?: string;
  className?: string;
  /** Access-control identifier — emitted as data-component-id */
  componentId?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE = {
  sm: { track: "h-4 w-7",   thumb: "h-3 w-3",   translate: "translate-x-3", text: "text-xs",  gap: "gap-2"   },
  md: { track: "h-5 w-9",   thumb: "h-3.5 w-3.5", translate: "translate-x-4", text: "text-sm",  gap: "gap-2.5" },
  lg: { track: "h-6 w-11",  thumb: "h-4.5 w-4.5", translate: "translate-x-5", text: "text-base", gap: "gap-3"  },
} as const;

const TRACK_ON: Record<NonNullable<SwitchProps["color"]>, string> = {
  indigo:  "bg-indigo-600",
  emerald: "bg-emerald-500",
  sky:     "bg-sky-500",
  rose:    "bg-rose-500",
  amber:   "bg-amber-400",
  zinc:    "bg-zinc-700",
};

const FOCUS_RING: Record<NonNullable<SwitchProps["color"]>, string> = {
  indigo:  "peer-focus-visible:ring-indigo-400",
  emerald: "peer-focus-visible:ring-emerald-400",
  sky:     "peer-focus-visible:ring-sky-400",
  rose:    "peer-focus-visible:ring-rose-400",
  amber:   "peer-focus-visible:ring-amber-400",
  zinc:    "peer-focus-visible:ring-zinc-500",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Switch({
  id: idProp,
  name,
  label,
  inlineLabel,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  required = false,
  tooltip,
  error,
  helpText,
  size = "md",
  color = "indigo",
  labelLeft = false,
  width,
  className,
  componentId,
}: SwitchProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];

  // Controlled vs uncontrolled
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
  const isChecked = checked !== undefined ? checked : internalChecked;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    const next = e.target.checked;
    if (checked === undefined) setInternalChecked(next);
    onChange?.(next);
  }

  // ── Toggle visual ──────────────────────────────────────────────────────────
  const toggleEl = (
    <label
      htmlFor={id}
      className={twMerge(
        "relative shrink-0 inline-flex cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        role="switch"
        aria-checked={isChecked}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        className="peer sr-only"
        {...(componentId ? { "data-component-id": componentId } : {})}
      />
      {/* Track */}
      <span
        className={twMerge(
          "flex items-center rounded-full transition-colors duration-200 ease-in-out",
          s.track,
          isChecked ? TRACK_ON[color] : "bg-zinc-200",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1",
          FOCUS_RING[color],
          error && "ring-2 ring-red-400",
        )}
        aria-hidden="true"
      >
        {/* Thumb */}
        <span
          className={twMerge(
            "ml-0.5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out",
            s.thumb,
            isChecked ? s.translate : "translate-x-0",
          )}
        />
      </span>
    </label>
  );

  // ── Inline label (right of toggle) ─────────────────────────────────────────
  const inlineLabelEl = inlineLabel ? (
    <label
      htmlFor={id}
      className={twMerge(
        "flex flex-col cursor-pointer select-none leading-snug",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className={twMerge("font-medium text-zinc-800", s.text)}>{inlineLabel}</span>
      {description && (
        <span className="text-xs text-zinc-400 mt-0.5">{description}</span>
      )}
    </label>
  ) : null;

  // ── Top label (above toggle) ───────────────────────────────────────────────
  const topLabelEl = label ? (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={id}
        className={twMerge(
          "block text-sm font-medium leading-none select-none",
          error ? "text-red-600" : "text-zinc-700",
          disabled && "opacity-50",
        )}
      >
        {label}
        {required && <span aria-hidden="true" className="ml-0.5 text-red-500">*</span>}
      </label>
      {tooltip && (
        <span className="group/tip relative inline-flex cursor-default">
          <HelpCircle size={13} className="text-zinc-400 transition-colors group-hover/tip:text-zinc-600" />
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 w-max max-w-[14rem] rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-xl opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100 transition-all duration-150"
          >
            {tooltip}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-zinc-900" />
          </span>
        </span>
      )}
    </div>
  ) : null;

  // ── Error / help text ──────────────────────────────────────────────────────
  const subTextEl = error ? (
    <p id={`${id}-error`} className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle size={11} strokeWidth={2.5} className="shrink-0" />
      {error}
    </p>
  ) : helpText ? (
    <p id={`${id}-help`} className="text-xs text-zinc-400 mt-1">{helpText}</p>
  ) : null;

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className={twMerge("flex flex-col gap-1", width, className)}>
      {topLabelEl}
      <div className={twMerge("flex items-center", s.gap, labelLeft && "flex-row-reverse justify-end")}>
        {toggleEl}
        {inlineLabelEl}
      </div>
      {subTextEl}
    </div>
  );
}
