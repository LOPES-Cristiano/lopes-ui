"use client";

import React, { useRef, useState, useId, useCallback } from "react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OTPInputProps = {
  /** Number of digit boxes */
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  /** Called when all slots are filled */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  /** Visual state */
  error?: boolean;
  /** Show mask (● instead of digit) */
  mask?: boolean;
  /** Numeric-only keyboard on mobile */
  inputMode?: "numeric" | "text";
  className?: string;
  componentId?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  mask = false,
  inputMode = "numeric",
  className,
  componentId,
}: OTPInputProps) {
  const uid = useId();
  const [internal, setInternal] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Use controlled value when provided
  const digits: string[] = value !== undefined
    ? Array.from({ length }, (_, i) => value[i] ?? "")
    : internal;

  const updateDigits = useCallback(
    (next: string[]) => {
      if (value === undefined) setInternal(next);
      const joined = next.join("");
      onChange?.(joined);
      if (next.every((d) => d !== "") && joined.length === length) {
        onComplete?.(joined);
      }
    },
    [value, onChange, onComplete, length]
  );

  const focusAt = (idx: number) => {
    inputsRef.current[Math.max(0, Math.min(length - 1, idx))]?.focus();
  };

  const handleChange = (idx: number, raw: string) => {
    // Strip non-numeric for numeric mode
    const filtered = inputMode === "numeric" ? raw.replace(/\D/g, "") : raw;
    if (!filtered) return;

    // Handle paste of multiple chars
    if (filtered.length > 1) {
      const chars = filtered.slice(0, length);
      const next = [...digits];
      chars.split("").forEach((c, i) => {
        if (idx + i < length) next[idx + i] = c;
      });
      updateDigits(next);
      focusAt(Math.min(idx + chars.length, length - 1));
      return;
    }

    const next = [...digits];
    next[idx] = filtered[0];
    updateDigits(next);
    if (idx < length - 1) focusAt(idx + 1);
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        updateDigits(next);
      } else if (idx > 0) {
        const next = [...digits];
        next[idx - 1] = "";
        updateDigits(next);
        focusAt(idx - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusAt(idx - 1);
    }
    if (e.key === "ArrowRight" && idx < length - 1) {
      e.preventDefault();
      focusAt(idx + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const filtered = inputMode === "numeric" ? text.replace(/\D/g, "") : text;
    const chars = filtered.slice(0, length);
    const next = Array(length).fill("");
    chars.split("").forEach((c, i) => { next[i] = c; });
    updateDigits(next);
    focusAt(Math.min(chars.length, length - 1));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div
      className={twMerge("flex items-center gap-2", className)}
      data-component-id={componentId}
    >
      {Array.from({ length }).map((_, idx) => (
        <input
          key={`${uid}-${idx}`}
          ref={(el) => { inputsRef.current[idx] = el; }}
          id={idx === 0 ? `${uid}-0` : undefined}
          type={mask ? "password" : "text"}
          inputMode={inputMode}
          maxLength={1}
          value={digits[idx]}
          disabled={disabled}
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          aria-label={`Dígito ${idx + 1} de ${length}`}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e)  => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className={twMerge(
            "w-11 h-12 text-center text-lg font-semibold rounded-lg border outline-none transition-all",
            "bg-white dark:bg-zinc-900",
            "text-zinc-900 dark:text-zinc-100",
            "caret-transparent select-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-400 dark:border-red-600 focus:ring-2 focus:ring-red-400"
              : [
                  "border-zinc-300 dark:border-zinc-700",
                  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0",
                  digits[idx]
                    ? "border-indigo-400 dark:border-indigo-600"
                    : "",
                ].join(" ")
          )}
        />
      ))}
    </div>
  );
}
