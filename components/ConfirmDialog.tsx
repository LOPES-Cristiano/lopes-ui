"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { AlertTriangle, Trash2, type LucideIcon } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConfirmDialogVariant = "danger" | "warning" | "info";

export type ConfirmDialogProps = {
  open: boolean;
  /** Dialog title */
  title?: string;
  /** Descriptive body text */
  description?: string;
  /** Optional extra content inside the dialog */
  children?: React.ReactNode;
  /** Visual tone */
  variant?: ConfirmDialogVariant;
  /** Override the default icon for the variant */
  icon?: LucideIcon;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Whether the confirm action is loading */
  loading?: boolean;
  /** Called when user confirms — can return a Promise */
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  className?: string;
  componentId?: string;
};

// ── Variant config ───────────────────────────────────────────────────────────

type VConfig = {
  icon: LucideIcon;
  iconBg: string;
  iconCls: string;
  btn: string;
  btnHover: string;
};

const VARIANTS: Record<ConfirmDialogVariant, VConfig> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-50 dark:bg-red-950/40",
    iconCls: "text-red-600 dark:text-red-400",
    btn: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white",
    btnHover: "",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconCls: "text-amber-500 dark:text-amber-400",
    btn: "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white",
    btnHover: "",
  },
  info: {
    icon: AlertTriangle,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconCls: "text-blue-500 dark:text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white",
    btnHover: "",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  variant = "danger",
  icon: CustomIcon,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
  className,
  componentId,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(open);

  const cfg = VARIANTS[variant];
  const Icon = CustomIcon ?? cfg.icon;
  const isLoading = loading || busy;

  const handleConfirm = async () => {
    if (isLoading) return;
    const result = onConfirm();
    if (result instanceof Promise) {
      setBusy(true);
      try { await result; } finally { setBusy(false); }
    }
  };

  // Focus cancel button when dialog opens
  React.useEffect(() => {
    if (open) setTimeout(() => cancelRef.current?.focus(), 50);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={twMerge(
          "relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900",
          "border border-zinc-200 dark:border-zinc-700",
          "shadow-2xl shadow-zinc-900/20 dark:shadow-black/60",
          "p-6 flex flex-col gap-4",
          className,
        )}
      >
        {/* Icon + title */}
        <div className="flex items-start gap-4">
          <div
            className={twMerge(
              "shrink-0 flex items-center justify-center h-10 w-10 rounded-xl",
              cfg.iconBg,
            )}
          >
            <Icon size={20} className={cfg.iconCls} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 pt-0.5">
            {title && (
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-tight"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Extra content */}
        {children && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{children}</div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            ref={cancelRef}
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => { void handleConfirm(); }}
            className={twMerge(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50",
              cfg.btn,
              isLoading && "cursor-wait",
            )}
          >
            {isLoading && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
