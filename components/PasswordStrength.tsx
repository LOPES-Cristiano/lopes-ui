"use client";

import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export type PasswordStrengthProps = {
  password: string;
  /** Show hint text below the bar */
  showHint?: boolean;
  className?: string;
  componentId?: string;
};

// ── Scoring logic ─────────────────────────────────────────────────────────────

type ScoreResult = {
  level: PasswordStrengthLevel;
  label: string;
  hint: string;
};

function scorePassword(pw: string): ScoreResult {
  if (!pw) return { level: 0, label: "", hint: "" };

  let score = 0;
  const missing: string[] = [];

  if (pw.length >= 8)  score++; else missing.push("mín. 8 caracteres");
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++; else missing.push("letra maiúscula");
  if (/[0-9]/.test(pw)) score++; else missing.push("número");
  if (/[^A-Za-z0-9]/.test(pw)) score++; else missing.push("símbolo (!@#…)");

  // Clamp 1–4
  const level = Math.max(1, Math.min(4, score)) as PasswordStrengthLevel;

  const labels: Record<PasswordStrengthLevel, string> = {
    0: "",
    1: "Muito fraca",
    2: "Fraca",
    3: "Média",
    4: "Forte",
  };
  // Override to "Muito forte" when all 5 criteria are met
  const label = score >= 5 ? "Muito forte" : labels[level];

  const hint = missing.length
    ? `Adicione: ${missing.slice(0, 2).join(", ")}`
    : score >= 5
    ? "Ótima senha!"
    : "";

  return { level, label, hint };
}

// ── Segment colors ────────────────────────────────────────────────────────────

const SEG_ACTIVE: Record<PasswordStrengthLevel, string> = {
  0: "",
  1: "bg-red-500",
  2: "bg-amber-400",
  3: "bg-yellow-400",
  4: "bg-emerald-500",
};

const LABEL_CLS: Record<PasswordStrengthLevel, string> = {
  0: "text-zinc-400",
  1: "text-red-600 dark:text-red-400",
  2: "text-amber-600 dark:text-amber-400",
  3: "text-yellow-600 dark:text-yellow-400",
  4: "text-emerald-600 dark:text-emerald-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PasswordStrength({
  password,
  showHint = true,
  className,
  componentId,
}: PasswordStrengthProps) {
  const { level, label, hint } = useMemo(() => scorePassword(password), [password]);

  // Use 5 segments so "very strong" fills all
  const SEGMENTS = 5;
  // Map level 1–4 → fill 1,2,3,5 segments; "very strong" (score≥5) expressed as label override
  const filledCount = password
    ? level === 4 && password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)
      ? 5
      : level
    : 0;

  return (
    <div
      className={twMerge("w-full space-y-1.5", className)}
      data-component-id={componentId}
    >
      {/* Segments */}
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={twMerge(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < filledCount
                ? filledCount >= 5
                  ? "bg-emerald-500"
                  : SEG_ACTIVE[level as PasswordStrengthLevel]
                : "bg-zinc-200 dark:bg-zinc-700"
            )}
          />
        ))}
      </div>

      {/* Label + hint */}
      {password && (
        <div className="flex items-center justify-between">
          <span
            className={twMerge(
              "text-xs font-medium transition-colors",
              filledCount >= 5 ? "text-emerald-600 dark:text-emerald-400" : LABEL_CLS[level]
            )}
          >
            {filledCount >= 5 ? "Muito forte" : label}
          </span>
          {showHint && hint && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 text-right max-w-[60%]">
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
