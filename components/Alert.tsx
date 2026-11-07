"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
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
  /** Ant Design custom close text button (e.g. "Entendi" or "Ocultar") instead of × icon */
  closeText?: React.ReactNode;
  /** Ant Design edge-to-edge top banner mode (no side borders or border-radius) */
  banner?: boolean;
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
    <h5 className={twMerge("font-semibold text-sm leading-snug tracking-tight text-balance", className)}>
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
    <div className={twMerge("text-sm leading-relaxed mt-0.5 text-pretty [&_p]:leading-relaxed", className)}>
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
    bg: "bg-info-soft", border: "border-info-border",
    accentLeft: "border-l-4 border-l-info", accentTop: "border-t-4 border-t-info",
    title: "text-info-soft-foreground", body: "text-info-soft-foreground/90", icon: "text-info", iconBg: "bg-info/15",
    dismiss: "text-info-soft-foreground/70 hover:text-info-soft-foreground hover:bg-info/15",
    actionSolid: "bg-info text-info-foreground hover:opacity-90",
    actionGhost: "text-info-soft-foreground hover:bg-info/15",
  },
  success: {
    bg: "bg-success-soft", border: "border-success-border",
    accentLeft: "border-l-4 border-l-success", accentTop: "border-t-4 border-t-success",
    title: "text-success-soft-foreground", body: "text-success-soft-foreground/90", icon: "text-success", iconBg: "bg-success/15",
    dismiss: "text-success-soft-foreground/70 hover:text-success-soft-foreground hover:bg-success/15",
    actionSolid: "bg-success text-success-foreground hover:opacity-90",
    actionGhost: "text-success-soft-foreground hover:bg-success/15",
  },
  warning: {
    bg: "bg-warning-soft", border: "border-warning-border",
    accentLeft: "border-l-4 border-l-warning", accentTop: "border-t-4 border-t-warning",
    title: "text-warning-soft-foreground", body: "text-warning-soft-foreground/90", icon: "text-warning", iconBg: "bg-warning/15",
    dismiss: "text-warning-soft-foreground/70 hover:text-warning-soft-foreground hover:bg-warning/15",
    actionSolid: "bg-warning text-warning-foreground hover:opacity-90",
    actionGhost: "text-warning-soft-foreground hover:bg-warning/15",
  },
  danger: {
    bg: "bg-danger-soft", border: "border-danger-border",
    accentLeft: "border-l-4 border-l-danger", accentTop: "border-t-4 border-t-danger",
    title: "text-danger-soft-foreground", body: "text-danger-soft-foreground/90", icon: "text-danger", iconBg: "bg-danger/15",
    dismiss: "text-danger-soft-foreground/70 hover:text-danger-soft-foreground hover:bg-danger/15",
    actionSolid: "bg-danger text-danger-foreground hover:opacity-90",
    actionGhost: "text-danger-soft-foreground hover:bg-danger/15",
  },
  neutral: {
    bg: "bg-muted/60", border: "border-border",
    accentLeft: "border-l-4 border-l-muted-foreground", accentTop: "border-t-4 border-t-muted-foreground",
    title: "text-foreground", body: "text-muted-foreground", icon: "text-muted-foreground", iconBg: "bg-muted",
    dismiss: "text-muted-foreground hover:text-foreground hover:bg-muted",
    actionSolid: "bg-primary text-primary-foreground hover:bg-primary-hover",
    actionGhost: "text-foreground hover:bg-muted",
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
  title, description, children, variant = "neutral", accent = "none", icon, dismissible, closeText, banner = false, onDismiss, actions,
  dialog, s, className, componentId, titleId, descriptionId,
}: AlertProps & { s: S; titleId?: string; descriptionId?: string }) {
  const IconComponent = icon === null ? null : (icon ?? DEFAULT_ICON[variant ?? "neutral"]);
  const showDismiss = Boolean(dismissible || closeText);

  if (dialog) {
    return (
      <div
        {...(componentId ? { "data-component-id": componentId } : {})}
        className="w-full relative flex flex-col gap-1"
      >
        <div className="flex gap-4 items-start pr-8">
          {IconComponent && (
            <span className={twMerge("shrink-0 flex h-10 w-10 items-center justify-center rounded-xl", s.iconBg)}>
              <IconComponent size={20} strokeWidth={2} className={s.icon} />
            </span>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 id={titleId} className="font-bold text-lg text-foreground leading-snug text-balance">{title}</h3>
            )}
            {description && (
              <div id={descriptionId} className="text-sm leading-relaxed text-muted-foreground mt-2 text-pretty">
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
                  "rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold transition-colors duration-150 cursor-pointer shadow-[var(--shadow-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  a.variant === "ghost"
                    ? "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent shadow-none"
                    : twMerge("bg-primary text-primary-foreground hover:bg-primary-hover", 
                        variant === "danger" && "bg-danger text-danger-foreground hover:opacity-90",
                        variant === "warning" && "bg-warning text-warning-foreground hover:opacity-90",
                        variant === "success" && "bg-success text-success-foreground hover:opacity-90",
                        variant === "info" && "bg-info text-info-foreground hover:opacity-90"
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
            className="absolute -top-1 -right-1 text-muted-foreground hover:text-foreground rounded-[var(--radius-control)] p-1.5 hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
        "flex gap-3 border",
        banner
          ? "w-full rounded-none border-x-0 border-t-0 px-4 py-2.5 items-center"
          : "rounded-[var(--radius-card)] p-4",
        s.bg,
        s.border,
        !banner && accent === "left" && s.accentLeft,
        !banner && accent === "top" && s.accentTop,
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      {IconComponent && (
        <span
          className={twMerge(
            "shrink-0 flex items-center justify-center rounded-lg",
            banner ? "h-6 w-6" : "mt-0.5 h-8 w-8",
            s.iconBg,
          )}
        >
          <IconComponent size={banner ? 14 : 16} strokeWidth={2} className={s.icon} />
        </span>
      )}

      <div className={twMerge("flex-1 min-w-0", s.body)}>
        {title && (
          <p className={twMerge("font-semibold text-sm leading-snug text-balance", s.title)}>{title}</p>
        )}
        {description && (
          <div className={twMerge("text-sm leading-relaxed mt-0.5 text-pretty", s.body, !title && "mt-0")}>
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
                  "rounded-[var(--radius-control)] px-3 py-1.5 text-xs font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  a.variant === "ghost" ? s.actionGhost : s.actionSolid,
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showDismiss && (
        <button
          data-component-id="erp.alert.banner-dismiss"
          type="button"
          aria-label={typeof closeText === "string" ? closeText : "Fechar"}
          onClick={onDismiss}
          className={twMerge(
            "shrink-0 rounded-[var(--radius-control)] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            closeText ? "px-2 py-1 text-xs font-semibold" : "p-1",
            s.dismiss,
          )}
        >
          {closeText ?? <X size={14} />}
        </button>
      )}
    </div>
  );
}

// ── Alert (main export) ───────────────────────────────────────────────────────

export default function Alert({
  variant,
  banner = false,
  dialog = false,
  open,
  onClose,
  autoCloseMs,
  onDismiss,
  ...rest
}: AlertProps) {
  const resolvedVariant: AlertVariant = variant ?? (banner ? "warning" : "neutral");
  const s = STYLES[resolvedVariant];
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

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
    const panel = dialogRef.current;
    const raf = requestAnimationFrame(() => {
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) focusables[0].focus();
      else panel.focus();
    });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key === "Tab" && panel) {
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [dialog, open, onClose]);

  if (!dialog) {
    return <AlertContent {...rest} banner={banner} onDismiss={onDismiss} variant={resolvedVariant} s={s} dialog={false} />;
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xs animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={rest.title ? titleId : undefined}
        aria-describedby={rest.description ? descriptionId : undefined}
        tabIndex={-1}
        className={twMerge(
          "relative z-10 w-full sm:min-w-[480px] max-w-lg rounded-[var(--radius-overlay)] bg-card border border-border p-6 shadow-[var(--shadow-overlay)] outline-none animate-in fade-in-0 zoom-in-95 duration-200",
          resolvedVariant === "info" && "border-l-4 border-l-info",
          resolvedVariant === "success" && "border-l-4 border-l-success",
          resolvedVariant === "warning" && "border-l-4 border-l-warning",
          resolvedVariant === "danger" && "border-l-4 border-l-danger",
          resolvedVariant === "neutral" && "border-l-4 border-l-border",
        )}
      >
        <AlertContent
          {...rest}
          variant={resolvedVariant}
          s={s}
          dialog
          dismissible={rest.dismissible}
          onDismiss={onClose}
          titleId={titleId}
          descriptionId={descriptionId}
        />
      </div>
    </div>,
    document.body,
  );
}
