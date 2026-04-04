"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import type { LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardVariant =
  | "default"   // white bg, light border
  | "outlined"  // transparent bg, visible border
  | "elevated"  // white bg, shadow, no border
  | "filled"    // subtle tinted bg, no border
  | "ghost";    // no bg, no border — pure container

export type CardShadow = "none" | "sm" | "md" | "lg" | "xl";

export type CardRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl";

export type CardColor =
  | "default"
  | "primary"   // indigo
  | "success"   // emerald
  | "warning"   // amber
  | "danger"    // red
  | "info"      // sky
  | "violet"
  | "pink"
  | "teal";

export type CardProps = {
  /** Visual style */
  variant?: CardVariant;
  /** Color scheme (mainly affects `filled` variant) */
  color?: CardColor;
  /** Drop shadow */
  shadow?: CardShadow;
  /** Border radius */
  radius?: CardRadius;
  /** Show a top accent bar */
  accent?: boolean;
  /** Makes the card interactive (hover lift effect) */
  hoverable?: boolean;
  /** Makes the card clickable */
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  /** Access-control identifier */
  componentId?: string;
};

// ── Card.Header ───────────────────────────────────────────────────────────────

export type CardHeaderProps = {
  /** Main title */
  title?: React.ReactNode;
  /** Subtitle / description below the title */
  description?: React.ReactNode;
  /** Lucide icon displayed in a badge on the left */
  icon?: LucideIcon;
  /** Icon badge color */
  iconColor?: CardColor;
  /** Slot on the right side (badge, button, etc.) */
  action?: React.ReactNode;
  className?: string;
};

// ── Card.Footer ───────────────────────────────────────────────────────────────

export type CardFooterProps = {
  /** Alignment: left (default) | center | right | between */
  align?: "left" | "center" | "right" | "between";
  /** Render a top divider */
  divider?: boolean;
  children?: React.ReactNode;
  className?: string;
};

// ── Style maps ────────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default:  "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
  outlined: "bg-transparent border border-zinc-300 dark:border-zinc-700",
  elevated: "bg-white dark:bg-zinc-900 border-transparent",
  filled:   "border-transparent",
  ghost:    "bg-transparent border-transparent",
};

const SHADOW_CLASSES: Record<CardShadow, string> = {
  none: "",
  sm:   "shadow-sm",
  md:   "shadow-md",
  lg:   "shadow-lg",
  xl:   "shadow-xl",
};

const RADIUS_CLASSES: Record<CardRadius, string> = {
  none: "rounded-none",
  sm:   "rounded-sm",
  md:   "rounded-md",
  lg:   "rounded-lg",
  xl:   "rounded-xl",
  "2xl":"rounded-2xl",
};

type ColorStyle = {
  filled: string;
  accent: string;
  iconBg: string;
  iconText: string;
};

const COLOR_STYLES: Record<CardColor, ColorStyle> = {
  default: {
    filled:   "bg-zinc-50 dark:bg-zinc-800/50",
    accent:   "bg-zinc-400",
    iconBg:   "bg-zinc-100 dark:bg-zinc-800",
    iconText: "text-zinc-600 dark:text-zinc-400",
  },
  primary: {
    filled:   "bg-indigo-50 dark:bg-indigo-950/40",
    accent:   "bg-indigo-500",
    iconBg:   "bg-indigo-100 dark:bg-indigo-900/50",
    iconText: "text-indigo-600 dark:text-indigo-300",
  },
  success: {
    filled:   "bg-emerald-50 dark:bg-emerald-950/40",
    accent:   "bg-emerald-500",
    iconBg:   "bg-emerald-100 dark:bg-emerald-900/50",
    iconText: "text-emerald-600 dark:text-emerald-300",
  },
  warning: {
    filled:   "bg-amber-50 dark:bg-amber-950/40",
    accent:   "bg-amber-400",
    iconBg:   "bg-amber-100 dark:bg-amber-900/50",
    iconText: "text-amber-600 dark:text-amber-300",
  },
  danger: {
    filled:   "bg-red-50 dark:bg-red-950/40",
    accent:   "bg-red-500",
    iconBg:   "bg-red-100 dark:bg-red-900/50",
    iconText: "text-red-600 dark:text-red-300",
  },
  info: {
    filled:   "bg-sky-50 dark:bg-sky-950/40",
    accent:   "bg-sky-500",
    iconBg:   "bg-sky-100 dark:bg-sky-900/50",
    iconText: "text-sky-600 dark:text-sky-300",
  },
  violet: {
    filled:   "bg-violet-50 dark:bg-violet-950/40",
    accent:   "bg-violet-500",
    iconBg:   "bg-violet-100 dark:bg-violet-900/50",
    iconText: "text-violet-600 dark:text-violet-300",
  },
  pink: {
    filled:   "bg-pink-50 dark:bg-pink-950/40",
    accent:   "bg-pink-500",
    iconBg:   "bg-pink-100 dark:bg-pink-900/50",
    iconText: "text-pink-600 dark:text-pink-300",
  },
  teal: {
    filled:   "bg-teal-50 dark:bg-teal-950/40",
    accent:   "bg-teal-500",
    iconBg:   "bg-teal-100 dark:bg-teal-900/50",
    iconText: "text-teal-600 dark:text-teal-300",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

export function CardHeader({
  title,
  description,
  icon: Icon,
  iconColor = "default",
  action,
  className,
}: CardHeaderProps) {
  const c = COLOR_STYLES[iconColor];
  return (
    <div className={twMerge("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className={twMerge(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            c.iconBg, c.iconText
          )}>
            <Icon size={17} />
          </span>
        )}
        <div className="min-w-0">
          {title && (
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug truncate">{title}</p>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge("px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  align = "left",
  divider = false,
  className,
}: CardFooterProps) {
  const alignClass = {
    left:    "justify-start",
    center:  "justify-center",
    right:   "justify-end",
    between: "justify-between",
  }[align];

  return (
    <div className={twMerge(
      "flex items-center flex-wrap gap-2 px-5 pb-5",
      alignClass,
      divider && "border-t border-zinc-100 dark:border-zinc-800 pt-4",
      className,
    )}>
      {children}
    </div>
  );
}

export function CardImage({
  src,
  alt = "",
  height = "h-44",
}: {
  src: string;
  alt?: string;
  height?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={twMerge("w-full object-cover", height)}
    />
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export default function Card({
  variant = "default",
  color = "default",
  shadow = "none",
  radius = "xl",
  accent = false,
  hoverable = false,
  onClick,
  children,
  className,
  componentId,
}: CardProps) {
  const c = COLOR_STYLES[color];
  const isClickable = hoverable || !!onClick;

  const classes = twMerge(
    "flex flex-col overflow-hidden transition-all duration-200",
    VARIANT_CLASSES[variant],
    variant === "filled" ? c.filled : "",
    SHADOW_CLASSES[shadow],
    RADIUS_CLASSES[radius],
    isClickable && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
    className,
  );

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      className={classes}
      onClick={onClick}
      type={onClick ? "button" : undefined}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {accent && (
        <div className={twMerge("h-1 w-full shrink-0", c.accent)} />
      )}
      {children}
    </Tag>
  );
}
