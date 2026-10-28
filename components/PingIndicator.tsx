"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PingStatus =
  | "online"
  | "offline"
  | "degraded"
  | "maintenance"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type PingSize = "xs" | "sm" | "md" | "lg" | "xl";
export type PingAnimation = "ping" | "bounce" | "pulse" | "none";

export type PingIndicatorProps = {
  status?: PingStatus;
  /** Show a text label next to the dot. */
  label?: boolean;
  /** Custom label override (falls back to status name in pt-BR). */
  labelText?: string;
  size?: PingSize;
  /** Animate — pulsing ring. Default: true */
  animate?: boolean;
  /** Specific animation preset (daisyUI status-ping / status-bounce support) */
  animation?: PingAnimation;
  className?: string;
};

// ── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<PingStatus, { dot: string; ring: string; label: string }> = {
  online:      { dot: "bg-emerald-500", ring: "bg-emerald-400", label: "Online" },
  offline:     { dot: "bg-zinc-400",    ring: "bg-zinc-300",    label: "Offline" },
  degraded:    { dot: "bg-amber-500",   ring: "bg-amber-400",   label: "Degradado" },
  maintenance: { dot: "bg-sky-500",     ring: "bg-sky-400",     label: "Manutenção" },
  primary:     { dot: "bg-primary",     ring: "bg-primary/70",  label: "Ativo" },
  info:        { dot: "bg-sky-500",     ring: "bg-sky-400",     label: "Informação" },
  success:     { dot: "bg-emerald-500", ring: "bg-emerald-400", label: "Sucesso" },
  warning:     { dot: "bg-amber-500",   ring: "bg-amber-400",   label: "Atenção" },
  danger:      { dot: "bg-rose-500",    ring: "bg-rose-400",    label: "Crítico" },
};

const dotSizeClasses: Record<PingSize, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
};

const labelSizeClasses: Record<PingSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
  xl: "text-base",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PingIndicator({
  status = "online",
  label = false,
  labelText,
  size = "md",
  animate = true,
  animation,
  className,
}: PingIndicatorProps) {
  const config = statusConfig[status];
  const isActive = status !== "offline";
  const resolvedAnim: PingAnimation =
    animation ?? (animate && isActive ? "ping" : "none");

  return (
    <span
      className={twMerge(clsx("inline-flex items-center gap-1.5", className))}
      aria-label={labelText ?? config.label}
    >
      {/* Dot with optional ping ring or bounce */}
      <span className={twMerge(clsx("relative flex shrink-0", dotSizeClasses[size]))}>
        {resolvedAnim === "ping" && isActive && (
          <span
            aria-hidden="true"
            className={twMerge(
              clsx(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                config.ring,
              )
            )}
          />
        )}
        <span
          className={twMerge(
            clsx(
              "relative inline-flex rounded-full h-full w-full",
              config.dot,
              resolvedAnim === "bounce" && "animate-bounce",
              resolvedAnim === "pulse" && "animate-pulse",
            )
          )}
        />
      </span>

      {label && (
        <span
          className={twMerge(
            clsx(
              "font-medium text-zinc-700 dark:text-zinc-300",
              labelSizeClasses[size],
            )
          )}
        >
          {labelText ?? config.label}
        </span>
      )}
    </span>
  );
}
