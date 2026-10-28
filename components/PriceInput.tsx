"use client";

import React, { useCallback, useId } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import FieldWrapper, { type FieldWrapperProps } from "./form/FieldWrapper";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PriceInputProps = Omit<FieldWrapperProps, "children" | "id" | "error"> & {
  /** Controlled value in decimal units (e.g. 1234.56 for R$ 1.234,56) */
  value?: number | null;
  onChange?: (value: number | null) => void;
  /** ISO 4217 currency code. Default: "BRL" */
  currency?: string;
  /** BCP 47 locale for formatting. Default: "pt-BR" */
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Show an error ring (boolean) or validation message (string) when used with FieldWrapper */
  error?: boolean | string;
  /** Minimum allowed decimal value */
  min?: number;
  /** Maximum allowed decimal value */
  max?: number;
  /** Allow negative amounts */
  allowNegative?: boolean;
  size?: "sm" | "md" | "lg";
  id?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format raw cents integer (e.g. 123456) → display string (e.g. "1.234,56") */
function centsToDisplay(cents: number, locale: string): string {
  const abs = Math.abs(cents);
  const formatted = (abs / 100).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-${formatted}` : formatted;
}

/** Strip non-digit chars and return raw cents integer */
function inputToCents(raw: string, allowNegative: boolean): number {
  const isNeg = allowNegative && raw.trim().startsWith("-");
  const digits = raw.replace(/\D/g, "");
  const parsed = parseInt(digits || "0", 10);
  return isNeg ? -parsed : parsed;
}

const SIZE_CLS = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function PriceInput({
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  helpText,
  hint,
  width,
  value,
  onChange,
  currency = "BRL",
  locale = "pt-BR",
  placeholder = "R$ 0,00",
  disabled = false,
  readOnly = false,
  error = false,
  min,
  max,
  allowNegative = false,
  size = "md",
  id: idProp,
  name,
  className,
  inputClassName,
  "aria-label": ariaLabel,
  componentId,
  hideIfDenied = false,
}: PriceInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);
  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : undefined;
  const hasWrapperMeta = Boolean(label || errorMessage || helpText || hint || tooltip || labelAction);

  // Derive formatter's currency symbol
  const symbol = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? currency;

  // Display string from controlled value
  const displayValue =
    value === null || value === undefined
      ? ""
      : centsToDisplay(Math.round(value * 100), locale);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly || !onChange) return;
      const raw = e.target.value;
      if (!raw.replace(/\D/g, "")) {
        onChange(null);
        return;
      }
      const cents = inputToCents(raw, allowNegative);
      let nextVal = cents === 0 ? (raw.trim() === "0" ? 0 : null) : cents / 100;
      if (nextVal !== null) {
        if (min !== undefined && nextVal < min) nextVal = min;
        if (max !== undefined && nextVal > max) nextVal = max;
      }
      onChange(nextVal);
    },
    [onChange, readOnly, allowNegative, min, max],
  );

  if (!hasPermission && hideIfDenied) return null;

  const inputElement = (
    <div
      className={twMerge(clsx(
        "relative flex w-full items-center",
        "rounded-md border bg-white dark:bg-zinc-900 transition-all duration-150",
        SIZE_CLS[size],
        hasError
          ? "border-red-400 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10"
          : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus-within:border-zinc-500 dark:focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-500/10",
        effectiveDisabled && "opacity-60 cursor-not-allowed",
        !hasWrapperMeta && className,
      ))}
    >
      {/* Currency symbol */}
      <span
        aria-hidden="true"
        className="select-none pl-3 pr-1.5 font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
      >
        {symbol}
      </span>

      <input
        data-component-id={componentId || (idProp ? `erp.price-input.${idProp}` : "erp.price-input")}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel ?? label}
        aria-invalid={hasError ? true : undefined}
        placeholder={placeholder ? "0,00" : undefined}
        value={displayValue}
        onChange={handleChange}
        disabled={effectiveDisabled}
        readOnly={readOnly}
        required={required}
        className={twMerge(clsx(
          "flex-1 min-w-0 bg-transparent py-2 pr-3",
          "text-right tabular-nums leading-none",
          "text-zinc-900 dark:text-zinc-100",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
          "outline-none",
          effectiveDisabled && "cursor-not-allowed",
          inputClassName,
        ))}
      />
    </div>
  );

  if (!hasWrapperMeta) {
    return inputElement;
  }

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
      error={errorMessage}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      {inputElement}
    </FieldWrapper>
  );
}
