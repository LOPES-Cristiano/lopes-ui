"use client";

import React, { useCallback, useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import FieldWrapper, { type FieldWrapperProps } from "./form/FieldWrapper";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CurrencyOption = {
  code: string;
  label?: string;
};

export type PriceInputProps = Omit<FieldWrapperProps, "children" | "id" | "error"> & {
  /** Controlled value in decimal units (e.g. 1234.56 for R$ 1.234,56) */
  value?: number | string | null;
  /** Uncontrolled initial decimal value */
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  /** ISO 4217 currency code. Default: "BRL" */
  currency?: string;
  /** Optional list of selectable currencies (Mantine UI Currency Input pattern) */
  currencies?: CurrencyOption[];
  onCurrencyChange?: (currency: string) => void;
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
  variant?: "default" | "filled" | "contained";
  id?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function centsToDisplay(cents: number, locale: string): string {
  const abs = Math.abs(cents);
  const formatted = (abs / 100).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-${formatted}` : formatted;
}

function inputToCents(raw: string, allowNegative: boolean): number {
  const isNeg = allowNegative && raw.trim().startsWith("-");
  const digits = raw.replace(/\D/g, "");
  const parsed = parseInt(digits || "0", 10);
  return isNeg ? -parsed : parsed;
}

function normalizeNumericValue(val: number | string | null | undefined): number | null {
  if (val === null || val === undefined || val === "") return null;
  const num = typeof val === "number" ? val : Number(val);
  return Number.isFinite(num) ? num : null;
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
  defaultValue = null,
  onChange,
  currency: currencyProp = "BRL",
  currencies,
  onCurrencyChange,
  locale = "pt-BR",
  placeholder = "R$ 0,00",
  disabled = false,
  readOnly = false,
  error = false,
  min,
  max,
  allowNegative = false,
  size = "md",
  variant = "default",
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

  const [uncontrolledVal, setUncontrolledVal] = useState<number | null>(defaultValue);
  const [internalCurrency, setInternalCurrency] = useState(currencyProp);

  const activeCurrency = onCurrencyChange ? currencyProp : internalCurrency;
  const isControlled = value !== undefined;
  const numericValue = isControlled ? normalizeNumericValue(value) : uncontrolledVal;

  const isContained = variant === "contained" && Boolean(label);
  const hasWrapperMeta = Boolean(
    (!isContained && label) || errorMessage || helpText || hint || tooltip || labelAction
  );

  const symbol =
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: activeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? activeCurrency;

  const displayValue =
    numericValue === null ? "" : centsToDisplay(Math.round(numericValue * 100), locale);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const raw = e.target.value;
      if (!raw.replace(/\D/g, "")) {
        if (!isControlled) setUncontrolledVal(null);
        onChange?.(null);
        return;
      }
      const cents = inputToCents(raw, allowNegative);
      let nextVal = cents === 0 ? (raw.trim() === "0" ? 0 : null) : cents / 100;
      if (nextVal !== null) {
        if (min !== undefined && nextVal < min) nextVal = min;
        if (max !== undefined && nextVal > max) nextVal = max;
      }
      if (!isControlled) setUncontrolledVal(nextVal);
      onChange?.(nextVal);
    },
    [onChange, readOnly, allowNegative, min, max, isControlled]
  );

  if (!hasPermission && hideIfDenied) return null;

  const currencySelector =
    currencies && currencies.length > 0 ? (
      <select
        aria-label="Selecionar moeda"
        disabled={effectiveDisabled || readOnly}
        value={activeCurrency}
        onChange={(e) => {
          setInternalCurrency(e.target.value);
          onCurrencyChange?.(e.target.value);
        }}
        className="h-full border-l border-border bg-surface-muted/60 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer rounded-r-md"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label ?? c.code}
          </option>
        ))}
      </select>
    ) : null;

  const inputElement = isContained ? (
    <div
      className={twMerge(
        "relative flex w-full items-center rounded-xl border bg-surface transition-all duration-150 overflow-hidden",
        hasError
          ? "border-danger focus-within:ring-2 focus-within:ring-danger/20"
          : "border-input-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
        effectiveDisabled && "opacity-60 cursor-not-allowed",
        !hasWrapperMeta && className
      )}
    >
      <div className="flex-1 min-w-0 px-3 pt-2 pb-1.5">
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold tracking-tight text-muted-foreground"
        >
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span aria-hidden="true" className="select-none text-xs font-semibold text-muted-foreground">
            {symbol}
          </span>
          <input
            data-component-id={
              componentId || (idProp ? `erp.price-input.${idProp}` : "erp.price-input")
            }
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
            className={twMerge(
              "flex-1 min-w-0 bg-transparent text-right text-sm font-semibold tabular-nums text-foreground placeholder:text-muted-foreground/60 outline-none",
              inputClassName
            )}
          />
        </div>
      </div>
      {currencySelector}
    </div>
  ) : (
    <div
      className={twMerge(
        clsx(
          "relative flex w-full items-center overflow-hidden rounded-md transition-all duration-150",
          SIZE_CLS[size],
          variant === "filled"
            ? "border border-transparent bg-surface-muted focus-within:bg-surface"
            : "border bg-surface",
          hasError
            ? "border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20"
            : "border-input-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
          effectiveDisabled && "opacity-60 cursor-not-allowed",
          !hasWrapperMeta && className
        )
      )}
    >
      <span
        aria-hidden="true"
        className="select-none pl-3 pr-1.5 font-medium text-muted-foreground whitespace-nowrap"
      >
        {symbol}
      </span>

      <input
        data-component-id={
          componentId || (idProp ? `erp.price-input.${idProp}` : "erp.price-input")
        }
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
        className={twMerge(
          clsx(
            "flex-1 min-w-0 bg-transparent py-2 pr-3",
            "text-right tabular-nums leading-none",
            "text-foreground placeholder:text-muted-foreground/60 outline-none",
            effectiveDisabled && "cursor-not-allowed",
            inputClassName
          )
        )}
      />

      {currencySelector}
    </div>
  );

  if (!hasWrapperMeta) {
    return inputElement;
  }

  return (
    <FieldWrapper
      id={id}
      label={isContained ? undefined : label}
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

export { PriceInput as CurrencyField };
export type { PriceInputProps as CurrencyFieldProps };
