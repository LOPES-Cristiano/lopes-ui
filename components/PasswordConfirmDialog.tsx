"use client";

import React, { useState, useId } from "react";
import { twMerge } from "tailwind-merge";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import Modal from "./Modal";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PasswordConfirmTone = "primary" | "warning" | "danger";

export type PasswordConfirmPayload = {
  password: string;
  username?: string;
  reason?: string;
};

export type PasswordConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Async or sync verification handler. Throw an Error to display inline feedback, or pass `error` prop. */
  onConfirm: (payload: PasswordConfirmPayload) => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  /** Severity color theme. Default: "primary" */
  tone?: PasswordConfirmTone;
  /** Display badge showing the current operator confirming their own password (e.g. "Carlos Eduardo · Gerente") */
  userBadge?: string;
  /** Require typing supervisor username/matricula (for supervisor override flows). Default: false */
  requireUsername?: boolean;
  usernameLabel?: string;
  usernamePlaceholder?: string;
  defaultUsername?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  /** Require an audit justification reason before confirming. Default: false */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** External server error message */
  error?: string;
  loading?: boolean;
  componentId?: string;
};

const TONE_STYLES: Record<
  PasswordConfirmTone,
  {
    iconBg: string;
    btnCls: string;
    Icon: typeof ShieldCheck;
  }
> = {
  primary: {
    iconBg: "bg-primary/10 text-primary",
    btnCls: "bg-primary hover:bg-primary-hover text-primary-foreground",
    Icon: ShieldCheck,
  },
  warning: {
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    btnCls: "bg-amber-600 hover:bg-amber-500 text-white",
    Icon: ShieldAlert,
  },
  danger: {
    iconBg: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
    btnCls: "bg-red-600 hover:bg-red-500 text-white",
    Icon: ShieldAlert,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PasswordConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar autorização",
  description = "Informe sua senha para autenticar e registrar esta operação.",
  tone = "primary",
  userBadge,
  requireUsername = false,
  usernameLabel = "Usuário / Matrícula do Supervisor",
  usernamePlaceholder = "Ex: supervisor.pvh",
  defaultUsername = "",
  passwordLabel = "Senha de autorização",
  passwordPlaceholder = "Digite sua senha",
  requireReason = false,
  reasonLabel = "Justificativa para auditoria",
  reasonPlaceholder = "Descreva o motivo desta liberação...",
  confirmLabel = "Autorizar operação",
  cancelLabel = "Cancelar",
  error: externalError,
  loading = false,
  componentId,
}: PasswordConfirmDialogProps) {
  const uid = useId();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const openKey = `${open}:${defaultUsername}`;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (prevOpenKey !== openKey) {
    setPrevOpenKey(openKey);
    if (open) {
      setUsername(defaultUsername);
      setPassword("");
      setReason("");
      setShowPassword(false);
      setInternalError(null);
      setCapsLock(false);
    }
  }

  const isBusy = loading || submitting;
  const activeError = externalError || internalError;
  const cfg = TONE_STYLES[tone];
  const HeaderIcon = cfg.Icon;

  const canSubmit =
    hasPermission &&
    password.trim().length > 0 &&
    (!requireUsername || username.trim().length > 0) &&
    (!requireReason || reason.trim().length >= 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isBusy) return;
    setInternalError(null);
    setSubmitting(true);
    try {
      await onConfirm({
        password,
        username: requireUsername ? username.trim() : undefined,
        reason: requireReason || reason.trim() ? reason.trim() : undefined,
      });
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "Não foi possível validar a senha informada.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState("CapsLock"));
  };

  return (
    <Modal open={open} onClose={isBusy ? () => {} : onClose} size="sm">
      <form
        onSubmit={handleSubmit}
        {...(componentId ? { "data-component-id": componentId } : {})}
        className="flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div
            className={twMerge(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              cfg.iconBg,
            )}
          >
            <HeaderIcon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {description && (
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Operator identity chip */}
        {userBadge && !requireUsername && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-foreground">
            <UserCheck size={15} className="shrink-0 text-primary" />
            <span className="truncate font-medium">{userBadge}</span>
          </div>
        )}

        {/* Supervisor Username */}
        {requireUsername && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${uid}-user`}
              className="text-xs font-semibold text-foreground"
            >
              {usernameLabel} <span className="text-danger">*</span>
            </label>
            <input
              id={`${uid}-user`}
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={usernamePlaceholder}
              disabled={isBusy}
              autoComplete="username"
              className="w-full rounded-xl border border-input-border bg-input px-3.5 py-2.5 text-sm text-input-foreground placeholder:text-input-placeholder focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        )}

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${uid}-pw`}
            className="text-xs font-semibold text-foreground"
          >
            {passwordLabel} <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id={`${uid}-pw`}
              type={showPassword ? "text" : "password"}
              autoFocus={!requireUsername}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (internalError) setInternalError(null);
              }}
              onKeyUp={checkCaps}
              onKeyDown={checkCaps}
              placeholder={passwordPlaceholder}
              disabled={isBusy}
              autoComplete="current-password"
              className={twMerge(
                "w-full rounded-xl border bg-input pl-9 pr-10 py-2.5 text-sm text-input-foreground placeholder:text-input-placeholder focus:outline-none focus:ring-2",
                activeError
                  ? "border-danger focus:border-danger focus:ring-danger/20"
                  : "border-input-border focus:border-ring focus:ring-ring/20",
              )}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {capsLock && (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle size={12} />
              Caps Lock está ativado
            </p>
          )}
        </div>

        {/* Audit Reason */}
        {requireReason && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${uid}-reason`}
              className="text-xs font-semibold text-foreground"
            >
              {reasonLabel} <span className="text-danger">*</span>
            </label>
            <textarea
              id={`${uid}-reason`}
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              disabled={isBusy}
              className="w-full resize-none rounded-xl border border-input-border bg-input px-3.5 py-2 text-sm text-input-foreground placeholder:text-input-placeholder focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        )}

        {/* Error Banner */}
        {activeError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            {activeError}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-1 flex items-center justify-end gap-2.5 border-t border-border pt-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={!canSubmit || isBusy}
            className={twMerge(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
              cfg.btnCls,
            )}
          >
            {isBusy && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export { PasswordConfirmDialog };
