"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

// ─── Variants ─────────────────────────────────────────────────────────────────

type PageVariant = "404" | "403" | "500" | "info" | "custom";

const variantStyles: Record<
  PageVariant,
  {
    bg: string;
    codeText: string;
    iconGradient: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    divider: string;
  }
> = {
  "404": {
    bg: "from-indigo-50/60 via-white to-blue-50/40",
    codeText: "text-indigo-100",
    iconGradient: "from-indigo-500 to-blue-600",
    pillBg: "bg-indigo-50",
    pillText: "text-indigo-600",
    pillBorder: "border-indigo-200",
    divider: "bg-indigo-100",
  },
  "403": {
    bg: "from-amber-50/60 via-white to-orange-50/40",
    codeText: "text-amber-100",
    iconGradient: "from-amber-500 to-orange-500",
    pillBg: "bg-amber-50",
    pillText: "text-amber-600",
    pillBorder: "border-amber-200",
    divider: "bg-amber-100",
  },
  "500": {
    bg: "from-rose-50/60 via-white to-red-50/40",
    codeText: "text-rose-100",
    iconGradient: "from-rose-500 to-red-600",
    pillBg: "bg-rose-50",
    pillText: "text-rose-600",
    pillBorder: "border-rose-200",
    divider: "bg-rose-100",
  },
  info: {
    bg: "from-sky-50/60 via-white to-cyan-50/40",
    codeText: "text-sky-100",
    iconGradient: "from-sky-500 to-cyan-500",
    pillBg: "bg-sky-50",
    pillText: "text-sky-600",
    pillBorder: "border-sky-200",
    divider: "bg-sky-100",
  },
  custom: {
    bg: "from-zinc-50/60 via-white to-slate-50/40",
    codeText: "text-zinc-100",
    iconGradient: "from-zinc-500 to-slate-600",
    pillBg: "bg-zinc-50",
    pillText: "text-zinc-600",
    pillBorder: "border-zinc-200",
    divider: "bg-zinc-100",
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type StatusPageProps = {
  componentId?: string;
  variant?: PageVariant;
  code?: string | number;
  pill?: string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactElement<{ className?: string }>;
  actions?: React.ReactNode;
  homeHref?: string;
  className?: string;
  inline?: boolean;
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function StatusPage({
  variant = "custom",
  code,
  pill,
  title,
  description,
  icon,
  actions,
  homeHref = "/",
  className,
  componentId,
  inline = false,
}: StatusPageProps) {
  const s = variantStyles[variant];

  return (
    <div
      className={twMerge(
        inline
          ? twMerge("relative isolate overflow-hidden flex items-center justify-center bg-gradient-to-br px-4 py-6", s.bg)
          : twMerge("relative isolate min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br px-6", s.bg),
        className
      )}
      {...(componentId ? { ['data-component-id']: componentId } : {})}
    >
      {/* Subtle dot pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, #00000008 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Giant faded status code in background */}
      {code && (
        <span
          aria-hidden
          className={twMerge(
            "pointer-events-none absolute select-none font-black leading-none",
            "text-[clamp(160px,30vw,320px)]",
            s.codeText,
            "-bottom-6 right-6 opacity-80"
          )}
        >
          {code}
        </span>
      )}

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl shadow-black/5 border border-white/60 px-10 py-12 text-center">
          
          {/* Icon */}
          {icon && (
            <div
              className={twMerge(
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
                s.iconGradient
              )}
            >
              {React.cloneElement(icon, { className: "w-9 h-9 text-white" })}
            </div>
          )}

          {/* Pill */}
          {pill && (
            <span
              className={twMerge(
                "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium tracking-wide mb-4",
                s.pillBg,
                s.pillText,
                s.pillBorder
              )}
            >
              {pill}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {title}
          </h1>

          {/* Divider */}
          <div className={twMerge("mx-auto mt-5 mb-4 h-px w-12 rounded-full", s.divider)} />

          {/* Description */}
          {description && (
            <p className="text-sm leading-relaxed text-zinc-500">
              {description}
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions ?? (
              <a
                href={homeHref}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 active:scale-95"
              >
                ← Voltar para Início
              </a>
            )}
          </div>
        </div>

        {/* Footer hint */}
        {code && (
          <p className="mt-6 text-center text-xs text-zinc-400">
            Código de status: <span className="font-semibold">{code}</span>
          </p>
        )}
      </div>
    </div>
  );
}
