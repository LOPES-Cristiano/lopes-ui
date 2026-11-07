"use client";

import React from "react";
import type { CSSProperties } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils/cn";
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
    soft:    "bg-surface-muted text-surface-foreground border border-border/60",
    solid:   "bg-primary text-primary-foreground",
    outline: "bg-transparent border border-border-strong text-surface-foreground",
    dot:     "bg-muted-foreground",
  },
  neutral: {
    soft:    "bg-surface-muted text-surface-foreground border border-border/60",
    solid:   "bg-primary text-primary-foreground",
    outline: "bg-transparent border border-border-strong text-surface-foreground",
    dot:     "bg-muted-foreground",
  },
  secondary: {
    soft:    "bg-secondary text-secondary-foreground",
    solid:   "bg-primary text-primary-foreground",
    outline: "bg-transparent border border-border-strong text-secondary-foreground",
    dot:     "bg-muted-foreground",
  },
  outline: {
    soft:    "bg-transparent border border-border-strong text-surface-foreground",
    solid:   "bg-transparent border border-foreground text-foreground",
    outline: "bg-transparent border border-border-strong text-surface-foreground",
    dot:     "bg-muted-foreground",
  },
  primary: {
    soft:    "bg-brand-soft text-brand-soft-foreground border border-brand-border/60",
    solid:   "bg-brand text-brand-foreground",
    outline: "bg-transparent border border-brand-border text-brand-soft-foreground",
    dot:     "bg-brand",
  },
  success: {
    soft:    "bg-success-soft text-success-soft-foreground border border-success-border/60",
    solid:   "bg-success text-success-foreground",
    outline: "bg-transparent border border-success-border text-success-soft-foreground",
    dot:     "bg-success",
  },
  warning: {
    soft:    "bg-warning-soft text-warning-soft-foreground border border-warning-border/60",
    solid:   "bg-warning text-warning-foreground",
    outline: "bg-transparent border border-warning-border text-warning-soft-foreground",
    dot:     "bg-warning",
  },
  danger: {
    soft:    "bg-danger-soft text-danger-soft-foreground border border-danger-border/60",
    solid:   "bg-destructive text-destructive-foreground",
    outline: "bg-transparent border border-danger-border text-danger-soft-foreground",
    dot:     "bg-danger",
  },
  info: {
    soft:    "bg-info-soft text-info-soft-foreground border border-info-border/60",
    solid:   "bg-info text-info-foreground",
    outline: "bg-transparent border border-info-border text-info-soft-foreground",
    dot:     "bg-info",
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
  processing: { dot: "bg-brand", ring: "bg-brand/70" },
  success:    { dot: "bg-success" },
  error:      { dot: "bg-danger" },
  warning:    { dot: "bg-warning" },
  default:    { dot: "bg-muted-foreground/70" },
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
          "inline-flex items-center gap-2 text-xs text-surface-foreground select-none",
          className,
        )}
      >
        <span className="relative inline-flex h-2 w-2 shrink-0">
          {st.ring && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full opacity-75",
                st.ring,
              )}
              aria-hidden="true"
            />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", st.dot)} aria-hidden="true" />
        </span>
        {statusText !== undefined && statusText !== null && <span className="lopes-trim-cap">{statusText}</span>}
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
        typeof count === "number" && "tabular-nums",
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
          {content !== undefined && content !== null && (
            <span className="lopes-trim-cap">{content}</span>
          )}
          {onRemove && (
            <button
              data-component-id="erp.badge.remove"
              type="button"
              aria-label="Remover"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="shrink-0 inline-flex items-center justify-center rounded-full p-0.5 opacity-65 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-opacity ml-0.5 -mr-0.5 cursor-pointer"
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
  default:   { bg: "bg-primary text-primary-foreground",       fold: "text-zinc-900" },
  neutral:   { bg: "bg-primary text-primary-foreground",       fold: "text-zinc-900" },
  secondary: { bg: "bg-secondary text-secondary-foreground",   fold: "text-zinc-500" },
  outline:   { bg: "bg-zinc-800 text-white",                   fold: "text-zinc-950" },
  primary:   { bg: "bg-brand text-brand-foreground",           fold: "text-indigo-900" },
  success:   { bg: "bg-success text-success-foreground",       fold: "text-emerald-900" },
  warning:   { bg: "bg-warning text-warning-foreground",       fold: "text-amber-900" },
  danger:    { bg: "bg-destructive text-destructive-foreground", fold: "text-red-900" },
  info:      { bg: "bg-info text-info-foreground",             fold: "text-sky-900" },
  violet:    { bg: "bg-violet-600 text-white",                 fold: "text-violet-900" },
  pink:      { bg: "bg-pink-600 text-white",                   fold: "text-pink-900" },
  orange:    { bg: "bg-orange-500 text-white",                 fold: "text-orange-800" },
  teal:      { bg: "bg-teal-600 text-white",                   fold: "text-teal-900" },
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
