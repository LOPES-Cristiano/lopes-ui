"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Info,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  Bookmark,
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CalloutVariant = "info" | "tip" | "success" | "warning" | "danger" | "neutral";

export type CalloutProps = {
  variant?: CalloutVariant;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Custom LucideIcon, ReactNode, or `false` to hide the icon */
  icon?: LucideIcon | React.ReactNode | false;
  /** Allow collapsing/expanding the callout body */
  collapsible?: boolean;
  /** Initial expanded state when `collapsible` is true. Default: true */
  defaultOpen?: boolean;
  /** Optional footer or right-side action buttons */
  actions?: React.ReactNode;
  /** Optional dismiss handler (renders an X close button) */
  onDismiss?: () => void;
  /** Left accent border style. Default: true */
  accentBorder?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const VARIANT_CONFIG: Record<
  CalloutVariant,
  {
    icon: LucideIcon;
    wrapper: string;
    accent: string;
    iconCls: string;
    titleCls: string;
  }
> = {
  info: {
    icon: Info,
    wrapper:
      "bg-blue-50/75 border-blue-200/80 text-blue-950 dark:bg-blue-950/30 dark:border-blue-900/60 dark:text-blue-100",
    accent: "border-l-4 border-l-blue-500 dark:border-l-blue-400",
    iconCls: "text-blue-600 dark:text-blue-400",
    titleCls: "text-blue-900 dark:text-blue-200",
  },
  tip: {
    icon: Lightbulb,
    wrapper:
      "bg-violet-50/75 border-violet-200/80 text-violet-950 dark:bg-violet-950/30 dark:border-violet-900/60 dark:text-violet-100",
    accent: "border-l-4 border-l-violet-500 dark:border-l-violet-400",
    iconCls: "text-violet-600 dark:text-violet-400",
    titleCls: "text-violet-900 dark:text-violet-200",
  },
  success: {
    icon: CheckCircle2,
    wrapper:
      "bg-emerald-50/75 border-emerald-200/80 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-100",
    accent: "border-l-4 border-l-emerald-500 dark:border-l-emerald-400",
    iconCls: "text-emerald-600 dark:text-emerald-400",
    titleCls: "text-emerald-900 dark:text-emerald-200",
  },
  warning: {
    icon: AlertTriangle,
    wrapper:
      "bg-amber-50/80 border-amber-200/90 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-100",
    accent: "border-l-4 border-l-amber-500 dark:border-l-amber-400",
    iconCls: "text-amber-600 dark:text-amber-400",
    titleCls: "text-amber-900 dark:text-amber-200",
  },
  danger: {
    icon: OctagonAlert,
    wrapper:
      "bg-red-50/80 border-red-200/85 text-red-950 dark:bg-red-950/30 dark:border-red-900/60 dark:text-red-100",
    accent: "border-l-4 border-l-red-500 dark:border-l-red-400",
    iconCls: "text-red-600 dark:text-red-400",
    titleCls: "text-red-900 dark:text-red-200",
  },
  neutral: {
    icon: Bookmark,
    wrapper: "bg-muted/55 border-border text-foreground",
    accent: "border-l-4 border-l-zinc-400 dark:border-l-zinc-500",
    iconCls: "text-muted-foreground",
    titleCls: "text-foreground",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Callout({
  variant = "info",
  title,
  children,
  icon,
  collapsible = false,
  defaultOpen = true,
  actions,
  onDismiss,
  accentBorder = true,
  className,
  componentId,
  hideIfDenied = false,
}: CalloutProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const [open, setOpen] = useState(defaultOpen);

  if (!hasPermission && hideIfDenied) return null;

  const cfg = VARIANT_CONFIG[variant];
  const DefaultIcon = cfg.icon;

  const renderIcon = () => {
    if (icon === false) return null;
    if (icon === undefined) {
      return <DefaultIcon size={18} className={twMerge("mt-0.5 shrink-0", cfg.iconCls)} />;
    }
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
      const CustomIcon = icon as LucideIcon;
      return <CustomIcon size={18} className={twMerge("mt-0.5 shrink-0", cfg.iconCls)} />;
    }
    return <span className={twMerge("mt-0.5 shrink-0", cfg.iconCls)}>{icon}</span>;
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      role={variant === "danger" || variant === "warning" ? "alert" : "note"}
      className={twMerge(
        "relative rounded-xl border px-4 py-3.5 text-sm transition-colors",
        cfg.wrapper,
        accentBorder && cfg.accent,
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {renderIcon()}

        <div className="min-w-0 flex-1">
          {(title || collapsible) && (
            <div
              onClick={collapsible ? () => setOpen((v) => !v) : undefined}
              className={twMerge(
                "flex items-center justify-between gap-2",
                collapsible && "cursor-pointer select-none",
              )}
            >
              {title ? (
                <div className={twMerge("font-semibold leading-snug", cfg.titleCls)}>{title}</div>
              ) : (
                <span />
              )}

              {collapsible && (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={open ? "Recolher detalhes" : "Expandir detalhes"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md opacity-70 hover:bg-black/5 dark:hover:bg-white/10 hover:opacity-100 transition-all cursor-pointer"
                >
                  <ChevronDown
                    size={15}
                    className={twMerge("transition-transform duration-150", open && "rotate-180")}
                  />
                </button>
              )}
            </div>
          )}

          {(!collapsible || open) && children && (
            <div
              className={twMerge(
                "text-xs sm:text-sm leading-relaxed opacity-90",
                title && "mt-1",
              )}
            >
              {children}
            </div>
          )}

          {(!collapsible || open) && actions && (
            <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={onDismiss}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-60 hover:bg-black/5 dark:hover:bg-white/10 hover:opacity-100 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export { Callout };
