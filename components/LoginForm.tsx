"use client";

import React, { useState, useId } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoginFormOAuthProvider = {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginFormProps = {
  /** App logo / branding slot */
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** OAuth buttons shown above the divider */
  oauthProviders?: LoginFormOAuthProvider[];
  /** Label for the divider between OAuth and email form */
  dividerLabel?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  rememberLabel?: string;
  submitLabel?: string;
  forgotPasswordLabel?: string;
  /** Validation error message (from server / parent) */
  error?: string;
  loading?: boolean;
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  onForgotPassword?: () => void;
  className?: string;
  componentId?: string;
};

// ── PasswordStrength is used internally ──────────────────────────────────────
// (We import the standalone component so it can also be used independently)

// ── Sub-components ───────────────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
    >
      {children}
    </label>
  );
}

function InputBase({
  id,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  hasError,
  children,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  hasError?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={twMerge(
          "w-full rounded-lg border bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
          "focus:outline-none focus-visible:ring-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          hasError
            ? "border-red-400 dark:border-red-600 focus-visible:ring-red-400"
            : "border-zinc-300 dark:border-zinc-700 focus-visible:ring-indigo-500",
          children ? "pr-11" : ""
        )}
      />
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginForm({
  logo,
  title = "Entrar na conta",
  subtitle = "Use seu e-mail e senha para acessar o sistema.",
  oauthProviders,
  dividerLabel = "ou continue com e-mail",
  emailLabel = "E-mail",
  emailPlaceholder = "seu@email.com",
  passwordLabel = "Senha",
  passwordPlaceholder = "••••••••",
  rememberLabel = "Manter conectado",
  submitLabel = "Entrar",
  forgotPasswordLabel = "Esqueci a senha",
  error,
  loading = false,
  onSubmit,
  onForgotPassword,
  className,
  componentId,
}: LoginFormProps) {
  const uid = useId();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [busy, setBusy]         = useState(false);

  const isLoading = loading || busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setBusy(true);
    try {
      await Promise.resolve(onSubmit({ email, password, remember }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={twMerge(
        "w-full max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 space-y-6",
        className
      )}
      data-component-id={componentId}
    >
      {/* Header */}
      {(logo || title) && (
        <div className="text-center space-y-2">
          {logo && <div className="flex justify-center mb-3">{logo}</div>}
          {title && <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h1>}
          {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
      )}

      {/* OAuth Providers */}
      {oauthProviders && oauthProviders.length > 0 && (
        <div className="space-y-2">
          {oauthProviders.map((p) => {
            const ProviderIcon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={p.onClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <ProviderIcon size={18} />
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Divider */}
      {oauthProviders && oauthProviders.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{dividerLabel}</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <Label htmlFor={`${uid}-email`}>{emailLabel}</Label>
          <InputBase
            id={`${uid}-email`}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={emailPlaceholder}
            autoComplete="email"
            disabled={isLoading}
            hasError={!!error}
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor={`${uid}-password`}>{passwordLabel}</Label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                {forgotPasswordLabel}
              </button>
            )}
          </div>
          <InputBase
            id={`${uid}-password`}
            type={showPw ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder={passwordPlaceholder}
            autoComplete="current-password"
            disabled={isLoading}
            hasError={!!error}
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </InputBase>
        </div>

        {/* Server error */}
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600 cursor-pointer"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{rememberLabel}</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
