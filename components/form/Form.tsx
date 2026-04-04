"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

// ── FormRow ───────────────────────────────────────────────────────────────────

export type FormRowProps = {
  /** Number of columns in the responsive grid */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between grid cells */
  gap?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
};

const COL: Record<NonNullable<FormRowProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const GAP: Record<NonNullable<FormRowProps["gap"]>, string> = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export function FormRow({ columns = 1, gap = "md", children, className }: FormRowProps) {
  return (
    <div className={twMerge("grid", COL[columns], GAP[gap], className)}>
      {children}
    </div>
  );
}

// ── FormSection ───────────────────────────────────────────────────────────────

export type FormSectionProps = {
  /** Section heading */
  title?: string;
  /** Optional description below the heading */
  description?: string;
  /** Show a subtle divider line under the header */
  divider?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({
  title, description, divider = true, children, className,
}: FormSectionProps) {
  return (
    <div className={twMerge("space-y-4", className)}>
      {(title || description) && (
        <div className={twMerge(divider && "pb-3 border-b border-zinc-100 dark:border-zinc-800")}>
          {title && (
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────

export type FormProps = {
  /** Optional title at the top of the form */
  title?: string;
  /** Optional descriptive subtitle */
  description?: string;
  /** Slot for action buttons rendered in the footer */
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  children: React.ReactNode;
  /** Tighter vertical spacing between fields */
  compact?: boolean;
  /** Wrap in a card-style bordered container */
  card?: boolean;
  componentId?: string;
};

export default function Form({
  title, description, footer, onSubmit,
  className, children, compact = false, card = false, componentId,
}: FormProps) {
  const sp = compact ? "space-y-4" : "space-y-6";

  const inner = (
    <form
      onSubmit={onSubmit}
      className={twMerge(sp, !card && className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
        </div>
      )}
      <div className={sp}>{children}</div>
      {footer && (
        <div
          className={twMerge(
            "flex flex-wrap items-center gap-3",
            !compact && "border-t border-zinc-100 dark:border-zinc-800 pt-4",
          )}
        >
          {footer}
        </div>
      )}
    </form>
  );

  if (card) {
    return (
      <div
        className={twMerge(
          "rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 shadow-sm",
          compact ? "p-4" : "p-6",
          className,
        )}
      >
        {inner}
      </div>
    );
  }

  return inner;
}
