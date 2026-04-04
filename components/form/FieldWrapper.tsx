"use client";

import React from "react";
import { HelpCircle, AlertCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

export type FieldWrapperProps = {
  id?: string;
  label?: string;
  /** Render label on the left, horizontally aligned with the input */
  labelInline?: boolean;
  /** Tailwind width class for the inline label column (default: "w-28") */
  labelWidth?: string;
  required?: boolean;
  /** Message shown on hover of the ? icon next to the label */
  tooltip?: string;
  /** Validation error — shown in red, replaces helpText */
  error?: string;
  /** Subtle helper text below the field */
  helpText?: string;
  /** Tailwind width class applied to the outer wrapper (e.g. "w-full", "w-64") */
  width?: string;
  children: React.ReactNode;
  className?: string;
};

export default function FieldWrapper({
  id,
  label,
  labelInline = false,
  labelWidth = "w-28",
  required,
  tooltip,
  error,
  helpText,
  width,
  children,
  className,
}: FieldWrapperProps) {
  const labelNode = label ? (
    <label
      htmlFor={id}
      className={twMerge(
        "select-none text-sm font-medium leading-none",
        error ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-200",
        labelInline && twMerge("shrink-0 pt-[9px]", labelWidth),
      )}
    >
      {label}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-red-500">
          *
        </span>
      )}
      {tooltip && (
        <span className="group/tip relative ml-1.5 inline-flex cursor-default align-middle">
          <HelpCircle
            size={13}
            className="text-zinc-400 transition-colors group-hover/tip:text-zinc-600"
          />
          <span
            role="tooltip"
            className={[
              "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2",
              "rounded-lg bg-zinc-900 px-3 py-2 text-xs leading-snug text-white shadow-lg",
              "opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100",
            ].join(" ")}
          >
            {tooltip}
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"
            />
          </span>
        </span>
      )}
    </label>
  ) : null;

  const subline = error ? (
    <p
      id={id ? `${id}-error` : undefined}
      className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400"
    >
      <AlertCircle size={11} className="shrink-0" />
      {error}
    </p>
  ) : helpText ? (
    <p
      id={id ? `${id}-help` : undefined}
      className="text-xs leading-snug text-zinc-400 dark:text-zinc-500"
    >
      {helpText}
    </p>
  ) : null;

  if (labelInline) {
    return (
      <div className={twMerge(width, className)}>
        <div className="flex items-start gap-3">
          {labelNode}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {children}
            {subline}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge("flex flex-col gap-1.5", width, className)}>
      {labelNode}
      {children}
      {subline}
    </div>
  );
}
