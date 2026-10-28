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

// ── Sub-components ───────────────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-surface-foreground mb-1"
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
  componentId,
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
  componentId?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        data-component-id={componentId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={twMerge(
          "w-full rounded-lg border bg-input px-3.5 py-2.5 text-sm text-input-foreground",
          "placeholder:text-input-placeholder",
          "focus:outline-none focus-visible:ring-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          hasError
            ? "border-danger focus-visible:ring-danger"
            : "border-input-border focus-visible:ring-ring",
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
  rememberLabel = "Lembrar de mim",
  submitLabel = "Entrar",
  forgotPasswordLabel = "Esqueceu a senha?",
  error,
  loading = false,
  onSubmit,
  onForgotPassword,
  className,
  componentId,
}: LoginFormProps) {
  const uid = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLoading = loading || submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await onSubmit({ email, password, remember });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={twMerge(
        "w-full max-w-sm mx-auto bg-surface text-surface-foreground rounded-2xl border border-border shadow-sm p-8 space-y-6",
        className
      )}
      data-component-id={componentId}
    >
      {/* Header */}
      {(logo || title) && (
        <div className="text-center space-y-2">
          {logo && <div className="flex justify-center mb-3">{logo}</div>}
          {title && <h1 className="text-xl font-bold text-surface-foreground">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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
                data-component-id={componentId ? `${componentId}.oauth.${p.id}` : `erp.login.oauth.${p.id}`}
                type="button"
                onClick={p.onClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{dividerLabel}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <Label htmlFor={`${uid}-email`}>{emailLabel}</Label>
          <InputBase
            id={`${uid}-email`}
            componentId={componentId ? `${componentId}.email` : "erp.login.email"}
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
                data-component-id={componentId ? `${componentId}.forgot-password` : "erp.login.forgot-password"}
                onClick={onForgotPassword}
                className="text-xs text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {forgotPasswordLabel}
              </button>
            )}
          </div>
          <InputBase
            id={`${uid}-password`}
            componentId={componentId ? `${componentId}.password` : "erp.login.password"}
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
              data-component-id={componentId ? `${componentId}.toggle-password` : "erp.login.toggle-password"}
              tabIndex={-1}
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-surface-foreground focus:outline-none"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </InputBase>
        </div>

        {/* Server error */}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            data-component-id={componentId ? `${componentId}.remember` : "erp.login.remember"}
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-input-border accent-primary cursor-pointer"
          />
          <span className="text-sm text-muted-foreground">{rememberLabel}</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          data-component-id={componentId ? `${componentId}.submit` : "erp.login.submit"}
          disabled={isLoading}
          className="w-full rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground text-sm font-semibold px-4 py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
