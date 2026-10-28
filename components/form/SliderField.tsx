"use client";

import React, { useId, useState } from "react";
import { cn } from "@/utils/cn";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type SliderMark = {
  value: number;
  label?: React.ReactNode;
};

export type SliderFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  /** Single number or [min, max] range tuple */
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  onChange?: (value: any) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (val: number) => string;
  marks?: SliderMark[];
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

export default function SliderField({
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  error,
  helpText,
  hint,
  width,
  className,
  id: idProp,
  name,
  value: controlledValue,
  defaultValue = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  formatValue = (v) => String(v),
  marks,
  componentId,
  hideIfDenied = false,
}: SliderFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [internalValue, setInternalValue] = useState<number | [number, number]>(defaultValue);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  if (!hasPermission && hideIfDenied) return null;

  const current = controlledValue ?? internalValue;
  const isRange = Array.isArray(current);
  const safeSpan = Math.max(1e-6, max - min);

  const updateValue = (next: number | [number, number]) => {
    if (effectiveDisabled) return;
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const valueDisplay = isRange
    ? `${formatValue(current[0])} – ${formatValue(current[1])}`
    : formatValue(current as number);

  const valueBadge = showValue ? (
    <span className="font-semibold tabular-nums text-xs text-zinc-700 dark:text-zinc-300">
      {valueDisplay}
    </span>
  ) : null;

  const leftPct = isRange
    ? ((Math.min(current[0], current[1]) - min) / safeSpan) * 100
    : 0;
  const rightPct = isRange
    ? ((Math.max(current[0], current[1]) - min) / safeSpan) * 100
    : (((current as number) - min) / safeSpan) * 100;

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction ?? valueBadge}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div
        data-component-id={componentId}
        className={cn("relative flex flex-col gap-2.5 pt-2 pb-1", effectiveDisabled && "opacity-50 pointer-events-none")}
      >
        <div className="relative flex h-5 items-center">
          {/* Track */}
          <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              style={{
                marginLeft: `${Math.max(0, Math.min(100, leftPct))}%`,
                width: `${Math.max(0, Math.min(100, rightPct - leftPct))}%`,
              }}
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
            />
          </div>

          {!isRange ? (
            <input
              id={id}
              name={name}
              type="range"
              min={min}
              max={max}
              step={step}
              disabled={effectiveDisabled}
              value={current as number}
              onChange={(e) => updateValue(Number(e.target.value))}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
          ) : (
            <>
              <input
                id={`${id}-min`}
                type="range"
                min={min}
                max={max}
                step={step}
                disabled={effectiveDisabled}
                value={current[0]}
                onChange={(e) => {
                  const nextMin = Math.min(Number(e.target.value), current[1]);
                  updateValue([nextMin, current[1]]);
                }}
                className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer"
              />
              <input
                id={`${id}-max`}
                type="range"
                min={min}
                max={max}
                step={step}
                disabled={effectiveDisabled}
                value={current[1]}
                onChange={(e) => {
                  const nextMax = Math.max(Number(e.target.value), current[0]);
                  updateValue([current[0], nextMax]);
                }}
                className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer"
              />
            </>
          )}

          {/* Visual Thumb(s) */}
          {isRange ? (
            <>
              <span
                aria-hidden="true"
                style={{ left: `calc(${Math.max(0, Math.min(100, leftPct))}% - 9px)` }}
                className="pointer-events-none absolute h-4.5 w-4.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-zinc-900 shadow-sm"
              />
              <span
                aria-hidden="true"
                style={{ left: `calc(${Math.max(0, Math.min(100, rightPct))}% - 9px)` }}
                className="pointer-events-none absolute h-4.5 w-4.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-zinc-900 shadow-sm"
              />
            </>
          ) : (
            <span
              aria-hidden="true"
              style={{ left: `calc(${Math.max(0, Math.min(100, rightPct))}% - 9px)` }}
              className="pointer-events-none absolute h-4.5 w-4.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-zinc-900 shadow-sm"
            />
          )}
        </div>

        {marks && marks.length > 0 && (
          <div className="relative h-5 w-full text-[11px] text-zinc-400 dark:text-zinc-500">
            {marks.map((mark) => {
              const pct = Math.max(0, Math.min(100, ((mark.value - min) / safeSpan) * 100));
              const alignCls =
                pct <= 4
                  ? "translate-x-0 text-left"
                  : pct >= 96
                    ? "-translate-x-full text-right"
                    : "-translate-x-1/2 text-center";
              return (
                <button
                  key={mark.value}
                  type="button"
                  disabled={effectiveDisabled}
                  onClick={() => !isRange && updateValue(mark.value)}
                  style={{ left: `${pct}%` }}
                  className={cn(
                    "absolute top-0 whitespace-nowrap hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors",
                    alignCls
                  )}
                >
                  {mark.label ?? formatValue(mark.value)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
