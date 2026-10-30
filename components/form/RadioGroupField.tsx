"use client";

import React, { useId, useState } from "react";
import { cn } from "@/utils/cn";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type RadioOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
};

export type RadioGroupVariant = "default" | "cards" | "buttons" | "buttons-solid";

export type RadioGroupFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Layout direction of the radio options */
  direction?: "vertical" | "horizontal";
  /**
   * - `default`: classic radio circles
   * - `cards`: rich selectable cards (shadcn/ui ChoiceCard pattern)
   * - `buttons`: Ant Design `Radio.Button` joined outline group (`buttonStyle="outline"`)
   * - `buttons-solid`: Ant Design `Radio.Button` joined solid-active group (`buttonStyle="solid"`)
   */
  variant?: RadioGroupVariant;
  /** Size for `buttons` / `buttons-solid` variants */
  size?: "sm" | "md" | "lg";
  /** Grid columns when variant="cards" */
  columns?: 1 | 2 | 3;
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

const CARD_COLS: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
};

function RadioIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
        checked
          ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/60"
          : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900 group-hover/rg:border-indigo-400"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-150",
          checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      />
    </span>
  );
}

export default function RadioGroupField({
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
  name: nameProp,
  options,
  value: controlledValue,
  defaultValue = "",
  onChange,
  disabled = false,
  direction = "vertical",
  variant = "default",
  size = "md",
  columns,
  componentId,
  hideIfDenied = false,
}: RadioGroupFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const groupName = nameProp ?? `radio-group-${id}`;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  if (!hasPermission && hideIfDenied) return null;

  const selectedValue = controlledValue ?? internalValue;

  const visibleOptions = options.filter((opt) => {
    const optAllowed = !opt.componentId || canAccess(opt.componentId);
    if (!optAllowed && opt.hideIfDenied) return false;
    return true;
  });

  const selectOption = (val: string) => {
    if (effectiveDisabled) return;
    if (controlledValue === undefined) setInternalValue(val);
    onChange?.(val);
  };

  const resolvedColumns: 1 | 2 | 3 =
    columns ?? (variant === "cards" && visibleOptions.length === 3 ? 3 : variant === "cards" && direction === "horizontal" ? 2 : 1);

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div
        role="radiogroup"
        aria-invalid={error ? true : undefined}
        data-component-id={componentId}
        className={cn(
          variant === "buttons" || variant === "buttons-solid"
            ? "inline-flex max-w-full flex-wrap sm:flex-nowrap items-stretch rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-x divide-zinc-200 dark:divide-zinc-800"
            : variant === "cards" && resolvedColumns > 1
              ? cn("grid gap-3.5", CARD_COLS[resolvedColumns])
              : cn(
                  "flex",
                  direction === "horizontal" ? "flex-row flex-wrap gap-x-6 gap-y-3" : "flex-col gap-2.5"
                )
        )}
      >
        {visibleOptions.map((option) => {
          const isChecked = option.value === selectedValue;
          const optAllowed = !option.componentId || canAccess(option.componentId);
          const isOptionDisabled = Boolean(effectiveDisabled || option.disabled || !optAllowed);
          const optId = `${id}-${option.value}`;
          const optComponentId = option.componentId ?? (componentId ? `${componentId}.${option.value}` : undefined);

          if (variant === "buttons" || variant === "buttons-solid") {
            const isSolid = variant === "buttons-solid";
            const btnSizeCls =
              size === "sm"
                ? "px-3 py-1.5 text-xs gap-1.5"
                : size === "lg"
                  ? "px-5 py-2.5 text-sm gap-2"
                  : "px-3.5 py-2 text-xs sm:text-sm gap-1.5";
            return (
              <label
                key={option.value}
                htmlFor={optId}
                className={cn(
                  "relative inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150 select-none",
                  btnSizeCls,
                  isChecked
                    ? isSolid
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "bg-primary/10 text-primary font-semibold ring-1 ring-inset ring-primary"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 hover:text-primary",
                  isOptionDisabled && "opacity-45 pointer-events-none cursor-not-allowed"
                )}
              >
                <input
                  id={optId}
                  data-component-id={optComponentId}
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isChecked}
                  disabled={isOptionDisabled}
                  onChange={() => !isOptionDisabled && selectOption(option.value)}
                  className="peer sr-only"
                />
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <span className="whitespace-nowrap">{option.label}</span>
              </label>
            );
          }

          if (variant === "cards") {
            return (
              <label
                key={option.value}
                htmlFor={optId}
                className={cn(
                  "group/rg relative flex cursor-pointer items-start gap-3.5 rounded-xl border-2 p-4 transition-all duration-150 select-none",
                  isChecked
                    ? "border-indigo-600 bg-indigo-50/40 shadow-2xs dark:border-indigo-500 dark:bg-indigo-950/35"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50",
                  isOptionDisabled && "opacity-50 pointer-events-none cursor-not-allowed",
                )}
              >
                <input
                  id={optId}
                  data-component-id={optComponentId}
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isChecked}
                  disabled={isOptionDisabled}
                  onChange={() => !isOptionDisabled && selectOption(option.value)}
                  className="peer sr-only"
                />
                <RadioIndicator checked={isChecked} />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className={cn(
                      "text-sm font-semibold leading-snug",
                      isChecked ? "text-indigo-950 dark:text-indigo-200" : "text-zinc-900 dark:text-zinc-100"
                    )}>
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.icon && (
                    <span className="shrink-0 text-zinc-400 dark:text-zinc-500">
                      {option.icon}
                    </span>
                  )}
                </div>
              </label>
            );
          }

          return (
            <label
              key={option.value}
              htmlFor={optId}
              className={cn(
                "group/rg inline-flex cursor-pointer items-start gap-2.5 select-none",
                isOptionDisabled && "opacity-50 pointer-events-none cursor-not-allowed",
              )}
            >
              <input
                id={optId}
                data-component-id={optComponentId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={isChecked}
                disabled={isOptionDisabled}
                onChange={() => !isOptionDisabled && selectOption(option.value)}
                className="peer sr-only"
              />
              <RadioIndicator checked={isChecked} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                  {option.label}
                </div>
                {option.description && (
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
