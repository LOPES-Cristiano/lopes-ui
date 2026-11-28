"use client";

import React, { useRef, useState, useId, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { twMerge } from "tailwind-merge";
import { useAccessControl } from "./useAccessControl";

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
  /** Renders a visual separator after every N digits (e.g. groupSize={3} -> 000 - 000) */
  groupSize?: number;
  /** Accessible label for the OTP group container */
  ariaLabel?: string;
  className?: string;
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

export function InputOTPSeparator({ className }: { className?: string }) {
  return (
    <span
      role="separator"
      aria-hidden="true"
      className={twMerge("px-0.5 text-zinc-400 dark:text-zinc-500 select-none font-medium", className)}
    >
      −
    </span>
  );
}

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
  groupSize,
  ariaLabel = "Código de verificação",
  className,
  componentId,
  hideIfDenied = false,
}: OTPInputProps) {
  const uid = useId();
  const reducedMotion = useReducedMotion();
  const [internal, setInternal] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

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

  if (!hasPermission && hideIfDenied) return null;

  return (
    <motion.div
      role="group"
      aria-label={ariaLabel}
      initial={false}
      animate={error && !reducedMotion ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.36, ease: "easeInOut" }}
      className={twMerge("flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-full", className)}
      data-component-id={componentId}
    >
      {Array.from({ length }).map((_, idx) => {
        const showSeparator =
          Boolean(groupSize && groupSize > 0 && idx > 0 && idx % groupSize === 0);
        const filled = Boolean(digits[idx]);

        return (
          <React.Fragment key={`${uid}-${idx}`}>
            {showSeparator && <InputOTPSeparator />}
            <motion.input
              data-component-id={componentId ? `${componentId}.slot-${idx}` : `erp.otp.slot-${idx}`}
              ref={(el) => { inputsRef.current[idx] = el; }}
              id={idx === 0 ? `${uid}-0` : undefined}
              type={mask ? "password" : "text"}
              inputMode={inputMode}
              maxLength={1}
              value={digits[idx]}
              disabled={effectiveDisabled}
              autoComplete={idx === 0 ? "one-time-code" : "off"}
              aria-label={`Dígito ${idx + 1} de ${length}`}
              aria-invalid={error || undefined}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onFocus={handleFocus}
              initial={false}
              animate={filled && !reducedMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={twMerge(
                "w-9 h-10 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-semibold rounded-[var(--radius-control)] border focus-visible:outline-none transition-[color,background-color,border-color,box-shadow]",
                "bg-[var(--input-background)] text-[var(--input-foreground)]",
                "caret-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error
                  ? "border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                  : [
                      "border-[var(--input-border)]",
                      "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-0",
                      filled
                        ? "border-brand/70"
                        : "",
                    ].join(" ")
              )}
            />
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}
