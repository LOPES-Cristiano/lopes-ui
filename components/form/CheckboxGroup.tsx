"use client";

import React, { useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type CheckboxOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Icon rendered inside card/button variants */
  icon?: React.ReactNode;
  componentId?: string;
  hideIfDenied?: boolean;
};

export type CheckboxGroupProps = Omit<FieldWrapperProps, "children"> & {
  name?: string;
  options: CheckboxOption[];
  /** Controlled selected values */
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
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
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
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
        "border-2 transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-out",
        "peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-focus-visible:ring-offset-1",
        sz.box,
        shape === "circle" || !multiple
          ? twMerge(
              "rounded-full",
              checked
                ? "border-brand bg-brand-soft"
                : "border-input-border bg-input group-hover/cb:border-brand/60",
            )
          : twMerge(
              sz.radius,
              checked
                ? "border-brand bg-brand"
                : "border-input-border bg-input group-hover/cb:border-brand/60",
            ),
      )}
    >
      {(shape === "circle" || !multiple) ? (
        <span
          className={twMerge(
            "rounded-full bg-brand transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out",
            sz.dot,
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      ) : (
        <span
          className={twMerge(
            "text-brand-foreground transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out",
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
  disabled = false,
  multiple = true,
  shape = "square",
  direction = "vertical",
  size = "md",
  variant = "default",
  columns = 2,
  componentId,
  hideIfDenied = false,
}: CheckboxGroupProps) {
  const groupId = useId();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selected = controlledValue ?? internalValue;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const groupDisabled = Boolean(disabled || !hasPermission);

  if (!hasPermission && hideIfDenied) return null;

  const visibleOptions = options.filter((opt) => {
    const optAllowed = !opt.componentId || canAccess(opt.componentId);
    if (!optAllowed && opt.hideIfDenied) return false;
    return true;
  });

  const toggle = (val: string) => {
    if (groupDisabled) return;
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
        >
          {visibleOptions.map((opt) => {
            const checked = selected.includes(opt.value);
            const optId = `${groupId}-${opt.value}`;
            const optAllowed = !opt.componentId || canAccess(opt.componentId);
            const isOptDisabled = Boolean(groupDisabled || opt.disabled || !optAllowed);
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={twMerge(
                  "group/cb relative flex flex-col gap-3 rounded-xl border-2 p-4 cursor-pointer select-none",
                  "transition-[color,background-color,border-color,box-shadow,opacity] duration-150",
                  checked
                    ? "border-brand bg-brand-soft/60 shadow-sm"
                    : "border-border bg-surface hover:border-border-strong hover:bg-surface-hover",
                  isOptDisabled && "cursor-not-allowed opacity-50 pointer-events-none",
                )}
              >
                <input
                  id={optId}
                  type={multiple ? "checkbox" : "radio"}
                  name={name ?? groupId}
                  value={opt.value}
                  checked={checked}
                  disabled={isOptDisabled}
                  onChange={() => !isOptDisabled && toggle(opt.value)}
                  className="peer sr-only"
                  data-component-id={opt.componentId ?? (componentId ? `${componentId}.${opt.value}` : undefined)}
                />
                <div className="flex items-start justify-between gap-2">
                  {opt.icon ? (
                    <div className={twMerge(
                      "flex items-center justify-center rounded-lg shrink-0",
                      "h-10 w-10 transition-colors duration-150",
                      checked ? "bg-brand-soft text-brand" : "bg-surface-muted text-muted-foreground group-hover/cb:bg-surface-hover",
                    )}>
                      {opt.icon}
                    </div>
                  ) : null}
                  <div className="ml-auto">
                    <Indicator checked={checked} shape={multiple ? "square" : "circle"} size={size} multiple={multiple} />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className={twMerge(sz.text, "font-semibold leading-snug", checked ? "text-brand-soft-foreground" : "text-foreground")}>
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className={twMerge(sz.desc, "leading-snug", checked ? "text-brand/80" : "text-muted-foreground")}>
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
        >
          {visibleOptions.map((opt) => {
            const checked = selected.includes(opt.value);
            const optId = `${groupId}-${opt.value}`;
            const optAllowed = !opt.componentId || canAccess(opt.componentId);
            const isOptDisabled = Boolean(groupDisabled || opt.disabled || !optAllowed);
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={twMerge(
                  "group/cb inline-flex items-center gap-1.5 cursor-pointer select-none font-medium border-2 transition-[color,background-color,border-color,box-shadow,opacity] duration-150",
                  BTN_SIZE[size],
                  checked
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-surface border-border text-surface-foreground hover:border-border-strong hover:bg-surface-hover",
                  isOptDisabled && "cursor-not-allowed opacity-50 pointer-events-none",
                )}
              >
                <input
                  id={optId}
                  type={multiple ? "checkbox" : "radio"}
                  name={name ?? groupId}
                  value={opt.value}
                  checked={checked}
                  disabled={isOptDisabled}
                  onChange={() => !isOptDisabled && toggle(opt.value)}
                  className="peer sr-only"
                  data-component-id={opt.componentId ?? (componentId ? `${componentId}.${opt.value}` : undefined)}
                />
                {opt.icon && (
                  <span className={twMerge("shrink-0", checked ? "text-primary-foreground" : "text-muted-foreground")}>
                    {opt.icon}
                  </span>
                )}
                {opt.label}
                {checked && multiple && (
                  <span className="ml-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary-foreground/20 text-primary-foreground">
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
      >
        {visibleOptions.map((opt) => {
          const checked = selected.includes(opt.value);
          const optId = `${groupId}-${opt.value}`;
          const optAllowed = !opt.componentId || canAccess(opt.componentId);
          const isOptDisabled = Boolean(groupDisabled || opt.disabled || !optAllowed);

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={twMerge(
                "group/cb flex cursor-pointer select-none",
                sz.gap,
                isOptDisabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                id={optId}
                type={multiple ? "checkbox" : "radio"}
                name={name ?? groupId}
                value={opt.value}
                checked={checked}
                disabled={isOptDisabled}
                onChange={() => !isOptDisabled && toggle(opt.value)}
                className="peer sr-only"
                data-component-id={opt.componentId ?? (componentId ? `${componentId}.${opt.value}` : undefined)}
              />
              <span className="mt-px">
                <Indicator checked={checked} shape={shape} size={size} multiple={multiple} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className={twMerge(sz.text, "font-medium text-foreground leading-snug")}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className={twMerge(sz.desc, "text-muted-foreground leading-snug")}>
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
