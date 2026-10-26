"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { ChevronRight, X, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PageHeaderCrumb = {
  label: string;
  href?: string;
};

export type PageHeaderProps = {
  /** Main page title */
  title: string;
  /** Optional subtitle / description below the title */
  description?: string;
  /** Lucide icon displayed to the left of the title */
  icon?: LucideIcon;
  /** Breadcrumb items rendered above the title */
  breadcrumbs?: PageHeaderCrumb[];
  /** Slot for action buttons (top-right) */
  actions?: React.ReactNode;
  /** Badge / status chip next to the title */
  badge?: React.ReactNode;
  /** Visual variant */
  variant?: "default" | "muted" | "bordered";
  /** Remove horizontal padding (useful when inside a padded container) */
  noPadding?: boolean;
  className?: string;
  componentId?: string;
  /** Callback para fechar / sair da tela */
  onClose?: () => void;
};

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Crumbs({ items }: { items: PageHeaderCrumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRight
                size={12}
                className="text-zinc-300 dark:text-zinc-600 shrink-0"
                strokeWidth={2}
              />
            )}
            {isLast || !item.href ? (
              <span
                className={twMerge(
                  "text-xs font-medium",
                  isLast
                    ? "text-zinc-500 dark:text-zinc-400"
                    : "text-zinc-400 dark:text-zinc-500",
                )}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  actions,
  badge,
  variant = "default",
  noPadding = false,
  className,
  componentId,
  onClose,
}: PageHeaderProps) {
  const wrapCls = twMerge(
    "w-full",
    variant === "bordered" && "border-b border-zinc-200 dark:border-zinc-800 pb-5",
    variant === "muted" && "bg-zinc-50 dark:bg-zinc-900/60 rounded-xl px-5 py-4",
    !noPadding && variant === "default" && "py-1",
    className,
  );

  return (
    <div
      className={wrapCls}
      >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-2">
          <Crumbs items={breadcrumbs} />
        </div>
      )}

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0 w-full sm:w-auto">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {Icon && (
              <div className="shrink-0 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <Icon size={18} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                  {title}
                </h1>
                {badge && <div className="shrink-0">{badge}</div>}
              </div>
              {description && (
                <p className="mt-0.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2 sm:line-clamp-none">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Botão Fechar no Mobile (topo direito alinhado ao título) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar e sair da tela"
              title="Fechar e sair da tela"
              className="sm:hidden shrink-0 cursor-pointer rounded-xl p-1.5 text-muted-foreground opacity-70 transition-all hover:opacity-100 hover:bg-muted focus:outline-none active:scale-95 border-none"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Actions e Botão Fechar no Desktop */}
        {(actions || onClose) && (
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end shrink-0">
            {actions}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar e sair da tela"
                title="Fechar e sair da tela"
                className="hidden sm:inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl p-1.5 text-muted-foreground opacity-70 transition-all hover:opacity-100 hover:bg-muted focus:outline-none active:scale-95 border-none"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
