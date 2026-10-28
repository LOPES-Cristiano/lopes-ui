"use client";

import React from "react";
import type { CSSProperties } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils/cn";
import { X, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "default"
  | "neutral"
  | "secondary"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "violet"
  | "pink"
  | "orange"
  | "teal"
  | "outline";

export type BadgeAppearance = "soft" | "solid" | "outline";

export type BadgeSize = "xs" | "sm" | "md" | "lg";

export type BadgeProps = {
  label?: React.ReactNode;
  children?: React.ReactNode;
  /** Numeric badge value (supports maxCount formatting like 99+) */
  count?: number;
  /** Maximum numeric count before showing "{maxCount}+" (default: 99) */
  maxCount?: number;
  variant?: BadgeVariant;
  /** Visual style: soft (default), solid, or outline */
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  /** Filled background vs soft/subtle */
  solid?: boolean;
  /** Pill shape (default) vs rectangle */
  square?: boolean;
  /** Colored dot before the label */
  dot?: boolean;
  /** Lucide icon before the label */
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  /** Show × remove button */
  onRemove?: () => void;
  /** Render the badge as its child element (e.g., <a> or <Link>) via Radix Slot */
  asChild?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Access-control identifier */
  componentId?: string;
};

// ── Style maps ────────────────────────────────────────────────────────────────

type V = { soft: string; solid: string; outline: string; dot: string };

const VARIANTS: Record<BadgeVariant, V> = {
  default: {
    soft:    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    solid:   "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900",
    outline: "bg-transparent border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
    dot:     "bg-zinc-400",
  },
  neutral: {
    soft:    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    solid:   "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900",
    outline: "bg-transparent border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
    dot:     "bg-zinc-400",
  },
  secondary: {
    soft:    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    solid:   "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900",
    outline: "bg-transparent border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
    dot:     "bg-zinc-400",
  },
  outline: {
    soft:    "bg-transparent border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
    solid:   "bg-transparent border border-zinc-500 text-zinc-900 dark:border-zinc-400 dark:text-zinc-100",
    outline: "bg-transparent border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
    dot:     "bg-zinc-400",
  },
  primary: {
    soft:    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    solid:   "bg-indigo-600 text-white",
    outline: "bg-transparent border border-indigo-400 text-indigo-700 dark:border-indigo-500/60 dark:text-indigo-300",
    dot:     "bg-indigo-500",
  },
  success: {
    soft:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    solid:   "bg-emerald-600 text-white",
    outline: "bg-transparent border border-emerald-400 text-emerald-700 dark:border-emerald-500/60 dark:text-emerald-300",
    dot:     "bg-emerald-500",
  },
  warning: {
    soft:    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    solid:   "bg-amber-500 text-white",
    outline: "bg-transparent border border-amber-400 text-amber-700 dark:border-amber-500/60 dark:text-amber-300",
    dot:     "bg-amber-400",
  },
  danger: {
    soft:    "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    solid:   "bg-red-600 text-white",
    outline: "bg-transparent border border-red-400 text-red-700 dark:border-red-500/60 dark:text-red-300",
    dot:     "bg-red-500",
  },
  info: {
    soft:    "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    solid:   "bg-sky-500 text-white",
    outline: "bg-transparent border border-sky-400 text-sky-700 dark:border-sky-500/60 dark:text-sky-300",
    dot:     "bg-sky-400",
  },
  violet: {
    soft:    "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    solid:   "bg-violet-600 text-white",
    outline: "bg-transparent border border-violet-400 text-violet-700 dark:border-violet-500/60 dark:text-violet-300",
    dot:     "bg-violet-500",
  },
  pink: {
    soft:    "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
    solid:   "bg-pink-600 text-white",
    outline: "bg-transparent border border-pink-400 text-pink-700 dark:border-pink-500/60 dark:text-pink-300",
    dot:     "bg-pink-500",
  },
  orange: {
    soft:    "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    solid:   "bg-orange-500 text-white",
    outline: "bg-transparent border border-orange-400 text-orange-700 dark:border-orange-500/60 dark:text-orange-300",
    dot:     "bg-orange-400",
  },
  teal: {
    soft:    "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
    solid:   "bg-teal-600 text-white",
    outline: "bg-transparent border border-teal-400 text-teal-700 dark:border-teal-500/60 dark:text-teal-300",
    dot:     "bg-teal-500",
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
  children,
  count,
  maxCount = 99,
  variant = "default",
  appearance,
  size = "sm",
  solid = false,
  square = false,
  dot = false,
  icon,
  onRemove,
  asChild = false,
  className,
  style,
  componentId,
}: BadgeProps) {
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const s = SIZES[size] ?? SIZES.sm;

  const resolvedAppearance: BadgeAppearance =
    appearance ?? (variant === "outline" ? "outline" : solid ? "solid" : "soft");

  const colorCls =
    resolvedAppearance === "solid"
      ? v.solid
      : resolvedAppearance === "outline"
        ? v.outline
        : v.soft;

  const shapeCls = square ? "rounded-md" : "rounded-full";
  const formattedCount =
    typeof count === "number" ? (count > maxCount ? `${maxCount}+` : String(count)) : undefined;
  const content = children ?? label ?? formattedCount;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComp = icon as React.ComponentType<{ size?: number; className?: string }>;
      return <IconComp size={s.icon} className="shrink-0" />;
    }
    return null;
  };

  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      {...(componentId ? { "data-component-id": componentId } : {})}
      style={style}
      className={cn(
        "inline-flex items-center font-semibold leading-none select-none whitespace-nowrap transition-colors",
        s.base, s.px, s.text, colorCls, shapeCls,
        className,
      )}
    >
      {asChild ? (
        content
      ) : (
        <>
          {dot && !icon && (
            <span className={cn("shrink-0 rounded-full", s.dot, v.dot)} aria-hidden="true" />
          )}
          {renderIcon()}
          {content}
          {onRemove && (
            <button
              data-component-id="erp.badge.remove"
              type="button"
              aria-label="Remover"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="shrink-0 rounded-full opacity-60 hover:opacity-100 transition-opacity ml-0.5 -mr-0.5"
            >
              <X size={s.x} strokeWidth={2.5} />
            </button>
          )}
        </>
      )}
    </Comp>
  );
}
