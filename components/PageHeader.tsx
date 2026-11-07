"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { ChevronRight, X, type LucideIcon } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

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
  hideIfDenied?: boolean;
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
          <React.Fragment key={`${item.label}-${i}`}>
            {i > 0 && (
              <ChevronRight
                size={12}
                className="text-muted-foreground/50 shrink-0"
                strokeWidth={2}
              />
            )}
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? "page" : undefined}
                className={twMerge(
                  "text-xs font-medium",
                  isLast
                    ? "text-foreground/80"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  hideIfDenied = true,
  onClose,
}: PageHeaderProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const wrapCls = twMerge(
    "w-full",
    variant === "bordered" && "border-b border-border pb-5",
    variant === "muted" && "bg-muted/60 rounded-xl px-5 py-4",
    !noPadding && variant === "default" && "py-1",
    className,
  );

  return (
    <div
      className={wrapCls}
      data-component-id={componentId || undefined}
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
              <div className="shrink-0 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-muted text-muted-foreground">
                <Icon size={18} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight truncate">
                  {title}
                </h1>
                {badge && <div className="shrink-0">{badge}</div>}
              </div>
              {description && (
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground leading-snug line-clamp-2 sm:line-clamp-none">
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
              className="sm:hidden inline-flex min-h-8 min-w-8 items-center justify-center shrink-0 cursor-pointer rounded-xl p-1.5 text-muted-foreground opacity-75 transition-all hover:opacity-100 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 border-none"
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
                className="hidden sm:inline-flex min-h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl p-1.5 text-muted-foreground opacity-75 transition-all hover:opacity-100 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 border-none"
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
