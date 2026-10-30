"use client";

import React, { useState } from "react";
import { AlertTriangle, HelpCircle, Info, Loader2, OctagonAlert, type LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Popover, PopoverContent, PopoverTrigger } from "./primitives/popover";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PopconfirmVariant = "warning" | "danger" | "info" | "primary";

export type PopconfirmProps = {
  /** Trigger element (e.g. `<Button>` or icon button) */
  children: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: PopconfirmVariant;
  /** Custom Lucide icon or `null` to hide */
  icon?: LucideIcon | React.ReactNode | null;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  /** Supports synchronous or async Promise callbacks (keeps popover open with spinner while pending) */
  onConfirm?: () => unknown | Promise<unknown>;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  disabled?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Styles ────────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  PopconfirmVariant,
  {
    DefaultIcon: LucideIcon;
    iconCls: string;
    iconBg: string;
    confirmCls: string;
  }
> = {
  warning: {
    DefaultIcon: AlertTriangle,
    iconCls: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    confirmCls: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/30",
  },
  danger: {
    DefaultIcon: OctagonAlert,
    iconCls: "text-red-500 dark:text-red-400",
    iconBg: "bg-red-50 dark:bg-red-950/50",
    confirmCls: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/30",
  },
  info: {
    DefaultIcon: Info,
    iconCls: "text-sky-500 dark:text-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-950/50",
    confirmCls: "bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-500/30",
  },
  primary: {
    DefaultIcon: HelpCircle,
    iconCls: "text-primary",
    iconBg: "bg-primary/10",
    confirmCls: "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary/30",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Popconfirm({
  children,
  title,
  description,
  variant = "warning",
  icon,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  showCancel = true,
  onConfirm,
  onCancel,
  open: controlledOpen,
  onOpenChange,
  side = "top",
  align = "center",
  disabled = false,
  className,
  componentId,
  hideIfDenied = false,
}: PopconfirmProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!hasPermission && hideIfDenied) return null;

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const effectiveDisabled = disabled || !hasPermission;
  const cfg = VARIANT_CONFIG[variant];

  const setOpen = (next: boolean) => {
    if (loading) return;
    if (effectiveDisabled && next) return;
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    if (!onConfirm) {
      setOpen(false);
      return;
    }
    try {
      const result = onConfirm();
      if (result && typeof (result as Promise<void>).then === "function") {
        setLoading(true);
        await result;
      }
      if (controlledOpen === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    onCancel?.();
    setOpen(false);
  };

  if (effectiveDisabled) {
    return children;
  }

  const renderIcon = () => {
    if (icon === null) return null;
    if (icon === undefined) {
      const DefIcon = cfg.DefaultIcon;
      return <DefIcon size={16} className={cfg.iconCls} />;
    }
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
      const CustomIcon = icon as LucideIcon;
      return <CustomIcon size={16} className={cfg.iconCls} />;
    }
    return icon;
  };

  const iconNode = renderIcon();

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        data-component-id={componentId}
        className={twMerge(
          "w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xl",
          className
        )}
      >
        <div className="flex items-start gap-2.5">
          {iconNode && (
            <span
              className={twMerge(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                cfg.iconBg
              )}
            >
              {iconNode}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
              {title}
            </div>
            {description && (
              <div className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {description}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-end gap-2">
          {showCancel && (
            <button
              type="button"
              disabled={loading}
              onClick={handleCancel}
              className="inline-flex h-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={twMerge(
              "inline-flex h-7 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all outline-none focus-visible:ring-2 disabled:opacity-60 cursor-pointer",
              cfg.confirmCls
            )}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
