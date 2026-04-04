"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { X, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "default" | "primary" | "success" | "warning" | "danger"
  | "info" | "violet" | "pink" | "orange" | "teal";

export type BadgeSize = "xs" | "sm" | "md" | "lg";

export type BadgeProps = {
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Filled background vs soft/subtle */
  solid?: boolean;
  /** Pill shape (default) vs rectangle */
  square?: boolean;
  /** Colored dot before the label */
  dot?: boolean;
  /** Lucide icon before the label */
  icon?: LucideIcon;
  /** Show × remove button */
  onRemove?: () => void;
  className?: string;
  /** Access-control identifier */
  componentId?: string;
};

// ── Style maps ────────────────────────────────────────────────────────────────

type V = { soft: string; solid: string; dot: string };

const VARIANTS: Record<BadgeVariant, V> = {
  default: {
    soft:  "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    solid: "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900",
    dot:   "bg-zinc-400",
  },
  primary: {
    soft:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    solid: "bg-indigo-600 text-white",
    dot:   "bg-indigo-500",
  },
  success: {
    soft:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    solid: "bg-emerald-600 text-white",
    dot:   "bg-emerald-500",
  },
  warning: {
    soft:  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    solid: "bg-amber-500 text-white",
    dot:   "bg-amber-400",
  },
  danger: {
    soft:  "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    solid: "bg-red-600 text-white",
    dot:   "bg-red-500",
  },
  info: {
    soft:  "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    solid: "bg-sky-500 text-white",
    dot:   "bg-sky-400",
  },
  violet: {
    soft:  "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    solid: "bg-violet-600 text-white",
    dot:   "bg-violet-500",
  },
  pink: {
    soft:  "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
    solid: "bg-pink-600 text-white",
    dot:   "bg-pink-500",
  },
  orange: {
    soft:  "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    solid: "bg-orange-500 text-white",
    dot:   "bg-orange-400",
  },
  teal: {
    soft:  "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
    solid: "bg-teal-600 text-white",
    dot:   "bg-teal-500",
  },
};

const SIZES: Record<BadgeSize, { base: string; text: string; dot: string; icon: number; x: number; px: string }> = {
  xs: { base: "h-4",   text: "text-[10px]", dot: "h-1.5 w-1.5", icon: 10, x: 10, px: "px-1.5 gap-1"   },
  sm: { base: "h-5",   text: "text-[11px]", dot: "h-2 w-2",     icon: 11, x: 11, px: "px-2 gap-1"     },
  md: { base: "h-6",   text: "text-xs",     dot: "h-2 w-2",     icon: 12, x: 12, px: "px-2.5 gap-1.5" },
  lg: { base: "h-7",   text: "text-sm",     dot: "h-2.5 w-2.5", icon: 13, x: 13, px: "px-3 gap-1.5"   },
};

// ── Badge ─────────────────────────────────────────────────────────────────────

export default function Badge({
  label,
  variant = "default",
  size = "sm",
  solid = false,
  square = false,
  dot = false,
  icon: Icon,
  onRemove,
  className,
  componentId,
}: BadgeProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  const colorCls = solid ? v.solid : v.soft;
  const shapeCls = square ? "rounded-md" : "rounded-full";

  return (
    <span
      className={twMerge(
        "inline-flex items-center font-semibold leading-none select-none whitespace-nowrap",
        s.base, s.px, s.text, colorCls, shapeCls,
        className,
      )}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {dot && !Icon && (
        <span className={twMerge("shrink-0 rounded-full", s.dot, v.dot)} aria-hidden="true" />
      )}
      {Icon && (
        <Icon size={s.icon} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      )}
      {label}
      {onRemove && (
        <button
          type="button"
          aria-label="Remover"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="shrink-0 rounded-full opacity-60 hover:opacity-100 transition-opacity ml-0.5 -mr-0.5"
        >
          <X size={s.x} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
