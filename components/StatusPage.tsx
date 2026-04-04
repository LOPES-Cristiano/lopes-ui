"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

// ─── Variants ─────────────────────────────────────────────────────────────────

type PageVariant = "404" | "403" | "500" | "info" | "custom";

const variantStyles: Record<
  PageVariant,
  {
    codeGradient: string;
    iconGradient: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    hr: string;
  }
> = {
  "404": {
    codeGradient: "from-indigo-400 to-blue-500 dark:from-indigo-300 dark:to-blue-400",
    iconGradient: "from-indigo-500 to-blue-600",
    pillBg: "bg-indigo-50 dark:bg-indigo-950/60",
    pillText: "text-indigo-600 dark:text-indigo-400",
    pillBorder: "border-indigo-200 dark:border-indigo-800",
    hr: "bg-indigo-200 dark:bg-indigo-800",
  },
  "403": {
    codeGradient: "from-amber-400 to-orange-500 dark:from-amber-300 dark:to-orange-400",
    iconGradient: "from-amber-500 to-orange-500",
    pillBg: "bg-amber-50 dark:bg-amber-950/60",
    pillText: "text-amber-600 dark:text-amber-400",
    pillBorder: "border-amber-200 dark:border-amber-800",
    hr: "bg-amber-200 dark:bg-amber-800",
  },
  "500": {
    codeGradient: "from-rose-400 to-red-600 dark:from-rose-300 dark:to-red-400",
    iconGradient: "from-rose-500 to-red-600",
    pillBg: "bg-rose-50 dark:bg-rose-950/60",
    pillText: "text-rose-600 dark:text-rose-400",
    pillBorder: "border-rose-200 dark:border-rose-800",
    hr: "bg-rose-200 dark:bg-rose-800",
  },
  info: {
    codeGradient: "from-sky-400 to-cyan-500 dark:from-sky-300 dark:to-cyan-400",
    iconGradient: "from-sky-500 to-cyan-500",
    pillBg: "bg-sky-50 dark:bg-sky-950/60",
    pillText: "text-sky-600 dark:text-sky-400",
    pillBorder: "border-sky-200 dark:border-sky-800",
    hr: "bg-sky-200 dark:bg-sky-800",
  },
  custom: {
    codeGradient: "from-zinc-400 to-slate-600 dark:from-zinc-300 dark:to-slate-400",
    iconGradient: "from-zinc-500 to-slate-600",
    pillBg: "bg-zinc-50 dark:bg-zinc-800/60",
    pillText: "text-zinc-600 dark:text-zinc-400",
    pillBorder: "border-zinc-200 dark:border-zinc-700",
    hr: "bg-zinc-200 dark:bg-zinc-800",
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
        "relative isolate overflow-hidden flex items-center justify-center bg-white dark:bg-zinc-950 px-6",
        inline ? "py-16" : "min-h-screen",
        className
      )}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Subtle dot texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(0 0 0 / 0.045) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xl py-20">

        {/* Hero: code number or icon */}
        {code ? (
          <span
            className={twMerge(
              "block select-none font-black leading-none tracking-tighter",
              "text-[clamp(96px,20vw,200px)]",
              "bg-gradient-to-br bg-clip-text text-transparent",
              s.codeGradient
            )}
          >
            {code}
          </span>
        ) : icon ? (
          <div
            className={twMerge(
              "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
              s.iconGradient
            )}
          >
            {React.cloneElement(icon, { className: "w-8 h-8 text-white" })}
          </div>
        ) : null}

        {/* Pill */}
        {pill && (
          <span
            className={twMerge(
              "mt-5 inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium tracking-wide",
              s.pillBg,
              s.pillText,
              s.pillBorder
            )}
          >
            {pill}
          </span>
        )}

        {/* Title */}
        <h1
          className={twMerge(
            "font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50",
            code ? "mt-5 text-4xl sm:text-5xl" : "mt-4 text-4xl"
          )}
        >
          {title}
        </h1>

        {/* Accent rule */}
        <div className={twMerge("mt-5 h-px w-12 rounded-full", s.hr)} />

        {/* Description */}
        {description && (
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {actions ?? (
            <a
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 dark:hover:bg-white active:scale-95"
            >
              ← Voltar para Início
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
