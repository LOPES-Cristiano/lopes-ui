"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { twMerge } from "tailwind-merge";
import { X, CheckCircle2, AlertTriangle, Info, XCircle, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AlertVariant = "info" | "success" | "warning" | "danger" | "neutral";

export type AlertAction = {
  label: string;
  onClick: () => void;
  variant?: "solid" | "ghost";
};

export type AlertProps = {
  title?: string;
  description?: string | React.ReactNode;
  variant?: AlertVariant;
  /** Override the default icon */
  icon?: LucideIcon | null;
  /** Show × dismiss button */
  dismissible?: boolean;
  /** Called when dismissed */
  onDismiss?: () => void;
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

// ── Style maps ────────────────────────────────────────────────────────────────

type S = {
  bg: string; border: string; title: string; body: string;
  icon: string; iconBg: string; dismiss: string;
  actionSolid: string; actionGhost: string;
};

const STYLES: Record<AlertVariant, S> = {
  info: {
    bg: "bg-blue-50", border: "border-blue-200",
    title: "text-blue-900", body: "text-blue-700", icon: "text-blue-500", iconBg: "bg-blue-100",
    dismiss: "text-blue-400 hover:text-blue-600 hover:bg-blue-100",
    actionSolid: "bg-blue-600 text-white hover:bg-blue-700",
    actionGhost: "text-blue-700 hover:bg-blue-100",
  },
  success: {
    bg: "bg-emerald-50", border: "border-emerald-200",
    title: "text-emerald-900", body: "text-emerald-700", icon: "text-emerald-500", iconBg: "bg-emerald-100",
    dismiss: "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100",
    actionSolid: "bg-emerald-600 text-white hover:bg-emerald-700",
    actionGhost: "text-emerald-700 hover:bg-emerald-100",
  },
  warning: {
    bg: "bg-amber-50", border: "border-amber-200",
    title: "text-amber-900", body: "text-amber-700", icon: "text-amber-500", iconBg: "bg-amber-100",
    dismiss: "text-amber-400 hover:text-amber-600 hover:bg-amber-100",
    actionSolid: "bg-amber-500 text-white hover:bg-amber-600",
    actionGhost: "text-amber-700 hover:bg-amber-100",
  },
  danger: {
    bg: "bg-red-50", border: "border-red-200",
    title: "text-red-900", body: "text-red-700", icon: "text-red-500", iconBg: "bg-red-100",
    dismiss: "text-red-400 hover:text-red-600 hover:bg-red-100",
    actionSolid: "bg-red-600 text-white hover:bg-red-700",
    actionGhost: "text-red-700 hover:bg-red-100",
  },
  neutral: {
    bg: "bg-zinc-50", border: "border-zinc-200",
    title: "text-zinc-900", body: "text-zinc-600", icon: "text-zinc-500", iconBg: "bg-zinc-100",
    dismiss: "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100",
    actionSolid: "bg-zinc-800 text-white hover:bg-zinc-900",
    actionGhost: "text-zinc-700 hover:bg-zinc-100",
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
  title, description, variant = "neutral", icon, dismissible, onDismiss, actions,
  dialog, s, componentId,
}: AlertProps & { s: S }) {
  const IconComponent = icon === null ? null : (icon ?? DEFAULT_ICON[variant ?? "neutral"]);

  return (
    <div
      className={twMerge(
        "flex gap-3",
        dialog
          ? "w-full"
          : twMerge("rounded-xl border p-4", s.bg, s.border),
      )}
      role={dialog ? "alertdialog" : "alert"}
      aria-live={dialog ? undefined : "polite"}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Icon */}
      {IconComponent && (
        <span className={twMerge("mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg", s.iconBg)}>
          <IconComponent size={16} strokeWidth={2} className={s.icon} />
        </span>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={twMerge("font-semibold text-sm leading-snug", s.title)}>{title}</p>
        )}
        {description && (
          <div className={twMerge("text-sm leading-relaxed mt-0.5", s.body, !title && "mt-0")}>
            {description}
          </div>
        )}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {actions.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={a.onClick}
                className={twMerge(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                  a.variant === "ghost" ? s.actionGhost : s.actionSolid,
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          type="button"
          aria-label="Fechar"
          onClick={onDismiss}
          className={twMerge("shrink-0 rounded-lg p-1 transition-colors duration-150", s.dismiss)}
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
  ...rest
}: AlertProps) {
  const s = STYLES[variant];
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(!!dialog && !!open);

  // Focus trap & Escape for dialog
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

  // Inline banner
  if (!dialog) {
    return <AlertContent {...rest} variant={variant} s={s} dialog={false} />;
  }

  // Dialog mode — portal
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={twMerge(
          "relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl outline-none",
          s.bg, s.border,
        )}
        aria-modal="true"
      >
        <AlertContent {...rest} variant={variant} s={s} dialog dismissible={rest.dismissible} onDismiss={onClose} />
      </div>
    </div>,
    document.body,
  );
}
