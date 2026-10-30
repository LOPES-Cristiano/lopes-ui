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

/** Ant Design status indicator preset */
export type BadgeStatus = "processing" | "success" | "error" | "warning" | "default";

export type BadgeProps = {
  label?: React.ReactNode;
  children?: React.ReactNode;
  /** Status indicator mode (Ant Design <Badge status="processing" text="..." />) */
  status?: BadgeStatus;
  /** Text displayed beside the status indicator dot */
  text?: React.ReactNode;
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

const STATUS_DOTS: Record<BadgeStatus, { dot: string; ring?: string }> = {
  processing: { dot: "bg-indigo-500", ring: "bg-indigo-400" },
  success:    { dot: "bg-emerald-500" },
  error:      { dot: "bg-red-500" },
  warning:    { dot: "bg-amber-500" },
  default:    { dot: "bg-zinc-400" },
};

// ── Badge ─────────────────────────────────────────────────────────────────────

export default function Badge({
  label,
  children,
  status,
  text,
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
  if (status) {
    const st = STATUS_DOTS[status] ?? STATUS_DOTS.default;
    const statusText = text ?? children ?? label;
    return (
      <span
        {...(componentId ? { "data-component-id": componentId } : {})}
        style={style}
        className={cn(
          "inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 select-none",
          className,
        )}
      >
        <span className="relative inline-flex h-2 w-2 shrink-0">
          {st.ring && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                st.ring,
              )}
              aria-hidden="true"
            />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", st.dot)} aria-hidden="true" />
        </span>
        {statusText !== undefined && statusText !== null && <span>{statusText}</span>}
      </span>
    );
  }

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

// ── BadgeRibbon (Ant Design Badge.Ribbon) ─────────────────────────────────────

export type BadgeRibbonProps = {
  /** Text or node rendered inside the corner ribbon */
  text: React.ReactNode;
  /** Corner side where the ribbon overhangs (default: "end") */
  placement?: "end" | "start";
  /** Color theme matching BadgeVariant (default: "primary") */
  variant?: BadgeVariant;
  /** Wrapped card or container content */
  children: React.ReactNode;
  className?: string;
  ribbonClassName?: string;
  componentId?: string;
};

const RIBBON_COLORS: Record<BadgeVariant, { bg: string; fold: string }> = {
  default:   { bg: "bg-zinc-700 text-white",    fold: "text-zinc-900" },
  neutral:   { bg: "bg-zinc-700 text-white",    fold: "text-zinc-900" },
  secondary: { bg: "bg-zinc-700 text-white",    fold: "text-zinc-900" },
  outline:   { bg: "bg-zinc-800 text-white",    fold: "text-zinc-950" },
  primary:   { bg: "bg-indigo-600 text-white",  fold: "text-indigo-900" },
  success:   { bg: "bg-emerald-600 text-white", fold: "text-emerald-900" },
  warning:   { bg: "bg-amber-500 text-white",   fold: "text-amber-800" },
  danger:    { bg: "bg-red-600 text-white",     fold: "text-red-900" },
  info:      { bg: "bg-sky-500 text-white",     fold: "text-sky-800" },
  violet:    { bg: "bg-violet-600 text-white",  fold: "text-violet-900" },
  pink:      { bg: "bg-pink-600 text-white",    fold: "text-pink-900" },
  orange:    { bg: "bg-orange-500 text-white",  fold: "text-orange-800" },
  teal:      { bg: "bg-teal-600 text-white",    fold: "text-teal-900" },
};

export function BadgeRibbon({
  text,
  placement = "end",
  variant = "primary",
  children,
  className,
  ribbonClassName,
  componentId,
}: BadgeRibbonProps) {
  const c = RIBBON_COLORS[variant] ?? RIBBON_COLORS.primary;
  const isStart = placement === "start";

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn("relative", className)}
    >
      {children}
      <div
        className={cn(
          "pointer-events-none absolute top-3 z-10 select-none",
          isStart ? "-left-2" : "-right-2",
        )}
      >
        <div
          className={cn(
            "px-2.5 py-1 text-[11px] font-semibold leading-none tracking-tight shadow-sm",
            isStart ? "rounded-r-md rounded-tl-sm" : "rounded-l-md rounded-tr-sm",
            c.bg,
            ribbonClassName,
          )}
        >
          {text}
        </div>
        {/* 3D folded corner triangle */}
        <svg
          width="8"
          height="6"
          viewBox="0 0 8 6"
          aria-hidden="true"
          className={cn(
            "block",
            isStart ? "mr-auto" : "ml-auto",
            c.fold,
          )}
        >
          {isStart ? (
            <polygon points="0,0 8,0 8,6" fill="currentColor" />
          ) : (
            <polygon points="0,0 8,0 0,6" fill="currentColor" />
          )}
        </svg>
      </div>
    </div>
  );
}
