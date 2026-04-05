"use client";

import React, { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PriceInputProps = {
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
  /** Show an error ring */
  error?: boolean;
  id?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format raw cents integer (e.g. 123456) → display string (e.g. "1.234,56") */
function centsToDisplay(cents: number, locale: string): string {
  return (cents / 100).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Strip non-digit chars and return raw cents integer */
function inputToCents(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return parseInt(digits || "0", 10);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PriceInput({
  value,
  onChange,
  currency = "BRL",
  locale = "pt-BR",
  placeholder = "R$ 0,00",
  disabled = false,
  readOnly = false,
  error = false,
  id,
  name,
  className,
  inputClassName,
  "aria-label": ariaLabel,
}: PriceInputProps) {
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
    value == null || value === 0
      ? ""
      : centsToDisplay(Math.round(value * 100), locale);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly || !onChange) return;
      const cents = inputToCents(e.target.value);
      onChange(cents === 0 ? null : cents / 100);
    },
    [onChange, readOnly],
  );

  return (
    <div
      className={twMerge(clsx(
        "relative inline-flex items-center",
        "rounded-md border bg-white dark:bg-zinc-900 transition-all duration-150",
        error
          ? "border-red-400 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10"
          : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus-within:border-zinc-500 dark:focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-500/10",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      ))}
    >
      {/* Currency symbol */}
      <span
        aria-hidden="true"
        className="select-none pl-3 pr-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
      >
        {symbol}
      </span>

      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder ? "0,00" : undefined}
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        className={twMerge(clsx(
          "flex-1 min-w-0 bg-transparent py-2 pr-3",
          "text-sm text-right tabular-nums leading-none",
          "text-zinc-900 dark:text-zinc-100",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
          "outline-none",
          disabled && "cursor-not-allowed",
          inputClassName,
        ))}
      />
    </div>
  );
}
