"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { twMerge } from "tailwind-merge";
import { X, CheckCircle2, AlertTriangle, Info, XCircle, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AlertVariant = "info" | "success" | "warning" | "danger" | "neutral";
export type AlertAccent = "none" | "left" | "top";

export type AlertAction = {
  label: string;
  onClick: () => void;
  variant?: "solid" | "ghost";
};

export type AlertProps = {
  title?: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  variant?: AlertVariant;
  /** Thick colored accent border on left or top */
  accent?: AlertAccent;
  /** Override the default icon */
  icon?: LucideIcon | null;
  /** Show × dismiss button */
  dismissible?: boolean;
  /** Called when dismissed */
  onDismiss?: () => void;
  /** Automatically call onDismiss/onClose after N milliseconds */
  autoCloseMs?: number;
  /** CTA buttons */
  actions?: AlertAction[];
  /** When true, renders as a modal dialog instead of an inline banner */
  dialog?: boolean;
  /** Controls visibility (required when dialog=true) */
  open?: boolean;
  /** Called when the dialog should close (backdrop / Escape) */
  onClose?: () => void;
  className?: string;
  /** Access-control identifier */
  componentId?: string;
};

// ── Composable Subcomponents (shadcn/ui compatible) ───────────────────────────

export function AlertTitle({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h5 className={twMerge("font-semibold text-sm leading-snug tracking-tight", className)}>
      {children}
    </h5>
  );
}

export function AlertDescription({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge("text-sm leading-relaxed mt-0.5 [&_p]:leading-relaxed", className)}>
      {children}
    </div>
  );
}

// ── Style maps ────────────────────────────────────────────────────────────────

type S = {
  bg: string; border: string; accentLeft: string; accentTop: string; title: string; body: string;
  icon: string; iconBg: string; dismiss: string;
  actionSolid: string; actionGhost: string;
};

const STYLES: Record<AlertVariant, S> = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800/60",
    accentLeft: "border-l-4 border-l-blue-500", accentTop: "border-t-4 border-t-blue-500",
    title: "text-blue-900 dark:text-blue-200", body: "text-blue-700 dark:text-blue-300", icon: "text-blue-500 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/50",
    dismiss: "text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:text-blue-300 dark:hover:bg-blue-900/40",
    actionSolid: "bg-blue-600 text-white hover:bg-blue-700",
    actionGhost: "text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/60",
    accentLeft: "border-l-4 border-l-emerald-500", accentTop: "border-t-4 border-t-emerald-500",
    title: "text-emerald-900 dark:text-emerald-200", body: "text-emerald-700 dark:text-emerald-300", icon: "text-emerald-500 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    dismiss: "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100 dark:text-emerald-500 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/40",
    actionSolid: "bg-emerald-600 text-white hover:bg-emerald-700",
    actionGhost: "text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800/60",
    accentLeft: "border-l-4 border-l-amber-500", accentTop: "border-t-4 border-t-amber-500",
    title: "text-amber-900 dark:text-amber-200", body: "text-amber-700 dark:text-amber-300", icon: "text-amber-500 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/50",
    dismiss: "text-amber-400 hover:text-amber-600 hover:bg-amber-100 dark:text-amber-500 dark:hover:text-amber-300 dark:hover:bg-amber-900/40",
    actionSolid: "bg-amber-500 text-white hover:bg-amber-600",
    actionGhost: "text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800/60",
    accentLeft: "border-l-4 border-l-red-500", accentTop: "border-t-4 border-t-red-500",
    title: "text-red-900 dark:text-red-200", body: "text-red-700 dark:text-red-300", icon: "text-red-500 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/50",
    dismiss: "text-red-400 hover:text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:text-red-300 dark:hover:bg-red-900/40",
    actionSolid: "bg-red-600 text-white hover:bg-red-700",
    actionGhost: "text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40",
  },
  neutral: {
    bg: "bg-zinc-50 dark:bg-zinc-800/50", border: "border-zinc-200 dark:border-zinc-700",
    accentLeft: "border-l-4 border-l-zinc-500", accentTop: "border-t-4 border-t-zinc-500",
    title: "text-zinc-900 dark:text-zinc-100", body: "text-zinc-600 dark:text-zinc-300", icon: "text-zinc-500 dark:text-zinc-400", iconBg: "bg-zinc-100 dark:bg-zinc-700",
    dismiss: "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-700",
    actionSolid: "bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-100",
    actionGhost: "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
  },
};

const DEFAULT_ICON: Record<AlertVariant, LucideIcon> = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger:  XCircle,
  neutral: Info,
};

// ── Inner content ─────────────────────────────────────────────────────────────

function AlertContent({
  title, description, children, variant = "neutral", accent = "none", icon, dismissible, onDismiss, actions,
  dialog, s, className, componentId,
}: AlertProps & { s: S }) {
  const IconComponent = icon === null ? null : (icon ?? DEFAULT_ICON[variant ?? "neutral"]);

  if (dialog) {
    return (
      <div
        {...(componentId ? { "data-component-id": componentId } : {})}
        className="w-full relative flex flex-col gap-1 select-none"
        role="alertdialog"
      >
        <div className="flex gap-4 items-start pr-8">
          {IconComponent && (
            <span className={twMerge("shrink-0 flex h-10 w-10 items-center justify-center rounded-2xl", s.iconBg)}>
              <IconComponent size={20} strokeWidth={2} className={s.icon} />
            </span>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-bold text-lg text-foreground leading-snug">{title}</h3>
            )}
            {description && (
              <div className="text-sm leading-relaxed text-muted-foreground mt-2">
                {description}
              </div>
            )}
            {children}
          </div>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex justify-end gap-3 mt-6">
            {actions.map((a, i) => (
              <button
                data-component-id={`erp.alert.action-${i}`}
                key={i}
                type="button"
                onClick={a.onClick}
                className={twMerge(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer shadow-xs",
                  a.variant === "ghost"
                    ? "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                    : twMerge("bg-[var(--primary)] text-primary-foreground hover:bg-[var(--primary-hover)]", 
                        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
                        variant === "warning" && "bg-amber-500 text-white hover:bg-amber-600",
                        variant === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
                        variant === "info" && "bg-blue-600 text-white hover:bg-blue-700"
                      )
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        {dismissible && (
          <button
            data-component-id="erp.alert.dismiss"
            type="button"
            aria-label="Fechar"
            onClick={onDismiss}
            className="absolute -top-1 -right-1 text-muted-foreground hover:text-foreground rounded-xl p-1.5 hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex gap-3 rounded-xl border p-4",
        s.bg,
        s.border,
        accent === "left" && s.accentLeft,
        accent === "top" && s.accentTop,
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      {IconComponent && (
        <span className={twMerge("mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg", s.iconBg)}>
          <IconComponent size={16} strokeWidth={2} className={s.icon} />
        </span>
      )}

      <div className={twMerge("flex-1 min-w-0", s.body)}>
        {title && (
          <p className={twMerge("font-semibold text-sm leading-snug", s.title)}>{title}</p>
        )}
        {description && (
          <div className={twMerge("text-sm leading-relaxed mt-0.5", s.body, !title && "mt-0")}>
            {description}
          </div>
        )}
        {children}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {actions.map((a, i) => (
              <button
                data-component-id={`erp.alert.banner-action-${i}`}
                key={i}
                type="button"
                onClick={a.onClick}
                className={twMerge(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 cursor-pointer",
                  a.variant === "ghost" ? s.actionGhost : s.actionSolid,
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {dismissible && (
        <button
          data-component-id="erp.alert.banner-dismiss"
          type="button"
          aria-label="Fechar"
          onClick={onDismiss}
          className={twMerge("shrink-0 rounded-lg p-1 transition-colors duration-150 cursor-pointer", s.dismiss)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ── Alert (main export) ───────────────────────────────────────────────────────

export default function Alert({
  variant = "neutral",
  dialog = false,
  open,
  onClose,
  autoCloseMs,
  onDismiss,
  ...rest
}: AlertProps) {
  const s = STYLES[variant];
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(!!dialog && !!open);

  useEffect(() => {
    if (!autoCloseMs || autoCloseMs <= 0) return;
    if (dialog && !open) return;
    const timer = setTimeout(() => {
      if (dialog) onClose?.();
      else onDismiss?.();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [autoCloseMs, dialog, open, onClose, onDismiss]);

  useEffect(() => {
    if (!dialog || !open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [dialog, open, onClose]);

  if (!dialog) {
    return <AlertContent {...rest} onDismiss={onDismiss} variant={variant} s={s} dialog={false} />;
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={twMerge(
          "relative z-10 w-full sm:min-w-[480px] max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl outline-none",
          variant === "info" && "border-l-4 border-l-blue-500",
          variant === "success" && "border-l-4 border-l-emerald-500",
          variant === "warning" && "border-l-4 border-l-amber-500",
          variant === "danger" && "border-l-4 border-l-red-500",
          variant === "neutral" && "border-l-4 border-l-zinc-400 dark:border-l-zinc-600",
        )}
        aria-modal="true"
      >
        <AlertContent {...rest} variant={variant} s={s} dialog dismissible={rest.dismissible} onDismiss={onClose} />
      </div>
    </div>,
    document.body,
  );
}
