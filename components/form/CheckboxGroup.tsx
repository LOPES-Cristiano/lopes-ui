"use client";

import React, { useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

export type CheckboxOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Icon rendered inside card/button variants */
  icon?: React.ReactNode;
};

export type CheckboxGroupProps = Omit<FieldWrapperProps, "children"> & {
  name?: string;
  options: CheckboxOption[];
  /** Controlled selected values */
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** If true, multiple options can be selected simultaneously */
  multiple?: boolean;
  /** Visual shape of the checkbox indicator (default variant only) */
  shape?: "square" | "circle";
  /** Layout direction (default variant only) */
  direction?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
  /**
   * default — classic checkbox/radio list
   * card    — bordered card tiles (supports icon, description, grid)
   * button  — inline pill/toggle buttons
   */
  variant?: "default" | "card" | "button";
  /** Number of columns for the card variant grid */
  columns?: 1 | 2 | 3 | 4;
  componentId?: string;
};

// ── Size tokens  ─────────────────────────────────────────────────────────────

const SZ = {
  sm: { box: "h-4 w-4",   dot: "h-2 w-2",     iconSz: 9,  text: "text-sm",  desc: "text-xs",  gap: "gap-2",   radius: "rounded" },
  md: { box: "h-5 w-5",   dot: "h-2.5 w-2.5", iconSz: 11, text: "text-sm",  desc: "text-xs",  gap: "gap-2.5", radius: "rounded-[5px]" },
  lg: { box: "h-6 w-6",   dot: "h-3 w-3",     iconSz: 13, text: "text-base",desc: "text-sm",  gap: "gap-3",   radius: "rounded-md" },
} as const;

const CARD_COLS: Record<1 | 2 | 3 | 4, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

const BTN_SIZE = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-xl",
} as const;

// ── Shared indicator (checkbox/radio dot) ────────────────────────────────────

function Indicator({ checked, shape, size, multiple }: {
  checked: boolean; shape: "square" | "circle"; size: "sm" | "md" | "lg"; multiple: boolean;
}) {
  const sz = SZ[size];
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        "relative shrink-0 flex items-center justify-center",
        "border-2 transition-all duration-200 ease-out",
        "peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-1",
        sz.box,
        shape === "circle" || !multiple
          ? twMerge(
              "rounded-full",
              checked
                ? "border-indigo-600 bg-indigo-50"
                : "border-zinc-300 bg-white group-hover/cb:border-indigo-400",
            )
          : twMerge(
              sz.radius,
              checked
                ? "border-indigo-600 bg-indigo-600"
                : "border-zinc-300 bg-white group-hover/cb:border-indigo-400",
            ),
      )}
    >
      {(shape === "circle" || !multiple) ? (
        <span
          className={twMerge(
            "rounded-full bg-indigo-600 transition-all duration-200 ease-out",
            sz.dot,
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      ) : (
        <span
          className={twMerge(
            "text-white transition-all duration-200 ease-out",
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <Check size={sz.iconSz} strokeWidth={3} />
        </span>
      )}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CheckboxGroup({
  label, labelInline, labelWidth, required, tooltip, error, helpText, width, className,
  name, options,
  value: controlledValue,
  defaultValue,
  onChange,
  multiple = true,
  shape = "square",
  direction = "vertical",
  size = "md",
  variant = "default",
  columns = 2,
  componentId,
}: CheckboxGroupProps) {
  const groupId = useId();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selected = controlledValue ?? internalValue;

  const toggle = (val: string) => {
    let next: string[];
    if (multiple) {
      next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
    } else {
      next = selected.includes(val) ? [] : [val];
    }
    if (!controlledValue) setInternalValue(next);
    onChange?.(next);
  };

  const sz = SZ[size];

  // ── card variant ──────────────────────────────────────────────────────────
  if (variant === "card") {
    return (
      <FieldWrapper
        label={label} labelInline={labelInline} labelWidth={labelWidth}
        required={required} tooltip={tooltip} error={error} helpText={helpText}
        width={width} className={className}
      >
        <div
          role={multiple ? "group" : "radiogroup"}
          className={twMerge("grid gap-3", CARD_COLS[columns])}
          {...(componentId ? { "data-component-id": componentId } : {})}
        >
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            const optId = `${groupId}-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={twMerge(
                  "group/cb relative flex flex-col gap-3 rounded-xl border-2 p-4 cursor-pointer select-none",
                  "transition-all duration-150",
                  checked
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
                  opt.disabled && "cursor-not-allowed opacity-50 pointer-events-none",
                )}
              >
                <input
                  id={optId}
                  type={multiple ? "checkbox" : "radio"}
                  name={name ?? groupId}
                  value={opt.value}
                  checked={checked}
                  disabled={opt.disabled}
                  onChange={() => toggle(opt.value)}
                  className="peer sr-only"
                />
                {/* Top row: icon + indicator */}
                <div className="flex items-start justify-between gap-2">
                  {opt.icon ? (
                    <div className={twMerge(
                      "flex items-center justify-center rounded-lg shrink-0",
                      "h-10 w-10 transition-colors duration-150",
                      checked ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-500 group-hover/cb:bg-zinc-200",
                    )}>
                      {opt.icon}
                    </div>
                  ) : null}
                  <div className="ml-auto">
                    <Indicator checked={checked} shape={multiple ? "square" : "circle"} size={size} multiple={multiple} />
                  </div>
                </div>
                {/* Text */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className={twMerge(sz.text, "font-semibold leading-snug", checked ? "text-indigo-900" : "text-zinc-800")}>
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className={twMerge(sz.desc, "leading-snug", checked ? "text-indigo-600/70" : "text-zinc-400")}>
                      {opt.description}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </FieldWrapper>
    );
  }

  // ── button variant ────────────────────────────────────────────────────────
  if (variant === "button") {
    return (
      <FieldWrapper
        label={label} labelInline={labelInline} labelWidth={labelWidth}
        required={required} tooltip={tooltip} error={error} helpText={helpText}
        width={width} className={className}
      >
        <div
          role={multiple ? "group" : "radiogroup"}
          className="flex flex-wrap gap-2"
          {...(componentId ? { "data-component-id": componentId } : {})}
        >
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            const optId = `${groupId}-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={twMerge(
                  "group/cb inline-flex items-center gap-1.5 cursor-pointer select-none font-medium border-2 transition-all duration-150",
                  BTN_SIZE[size],
                  checked
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
                  opt.disabled && "cursor-not-allowed opacity-50 pointer-events-none",
                )}
              >
                <input
                  id={optId}
                  type={multiple ? "checkbox" : "radio"}
                  name={name ?? groupId}
                  value={opt.value}
                  checked={checked}
                  disabled={opt.disabled}
                  onChange={() => toggle(opt.value)}
                  className="peer sr-only"
                />
                {opt.icon && (
                  <span className={twMerge("shrink-0", checked ? "text-white" : "text-zinc-400")}>
                    {opt.icon}
                  </span>
                )}
                {opt.label}
                {checked && multiple && (
                  <span className="ml-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/30">
                    <Check size={8} strokeWidth={3} />
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </FieldWrapper>
    );
  }

  // ── default variant ───────────────────────────────────────────────────────
  return (
    <FieldWrapper
      label={label} labelInline={labelInline} labelWidth={labelWidth}
      required={required} tooltip={tooltip} error={error} helpText={helpText}
      width={width} className={className}
    >
      <div
        role={multiple ? "group" : "radiogroup"}
        className={twMerge(
          "flex",
          direction === "horizontal" ? "flex-row flex-wrap gap-x-5 gap-y-2.5" : "flex-col gap-2.5",
        )}
        {...(componentId ? { "data-component-id": componentId } : {})}
      >
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          const optId = `${groupId}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={twMerge(
                "group/cb flex cursor-pointer select-none",
                sz.gap,
                opt.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                id={optId}
                type={multiple ? "checkbox" : "radio"}
                name={name ?? groupId}
                value={opt.value}
                checked={checked}
                disabled={opt.disabled}
                onChange={() => toggle(opt.value)}
                className="peer sr-only"
              />
              <span className="mt-px">
                <Indicator checked={checked} shape={shape} size={size} multiple={multiple} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className={twMerge(sz.text, "font-medium text-zinc-800 leading-snug")}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className={twMerge(sz.desc, "text-zinc-400 leading-snug")}>
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
