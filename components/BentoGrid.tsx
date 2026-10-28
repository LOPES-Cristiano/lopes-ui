"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAccessControl, type AccessControlProps } from "./useAccessControl";

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement>, AccessControlProps {
  /** Número de colunas em telas grandes */
  columns?: 2 | 3 | 4;
}

export interface BentoCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, AccessControlProps {
  /** Título do card */
  title: React.ReactNode;
  /** Descrição abaixo do título */
  description?: React.ReactNode;
  /** Ícone exibido acima do título */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Badge ou tag no canto superior */
  badge?: React.ReactNode;
  /** Ilustração, preview ou gráfico exibido no topo do card */
  header?: React.ReactNode;
  /** Quantidade de colunas ocupadas no grid (1, 2 ou 3) */
  colSpan?: 1 | 2 | 3;
  /** Quantidade de linhas ocupadas no grid (1 ou 2) */
  rowSpan?: 1 | 2;
  /** Texto do link de ação (CTA) */
  cta?: string;
  /** URL do link de ação */
  href?: string;
  /** Callback ao clicar no CTA */
  onCtaClick?: () => void;
  /** Destaque visual na borda/gradiente */
  featured?: boolean;
}

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const COL_SPAN_MAP: Record<1 | 2 | 3, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
};

const ROW_SPAN_MAP: Record<1 | 2, string> = {
  1: "row-span-1",
  2: "md:row-span-2",
};

export function BentoGrid({
  columns = 3,
  className,
  children,
  permission,
  role,
  permissions,
  roles,
  requireAll,
  onUnauthorized,
  fallback = null,
  ...props
}: BentoGridProps) {
  const access = useAccessControl({
    permission,
    role,
    permissions,
    roles,
    requireAll,
    onUnauthorized,
  });

  if (!access.allowed) return <>{fallback}</>;

  return (
    <div
      className={cn("grid auto-rows-[minmax(180px,auto)] gap-4", COL_MAP[columns], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  icon: Icon,
  badge,
  header,
  colSpan = 1,
  rowSpan = 1,
  cta,
  href,
  onCtaClick,
  featured = false,
  className,
  children,
  permission,
  role,
  permissions,
  roles,
  requireAll,
  onUnauthorized,
  fallback = null,
  ...props
}: BentoCardProps) {
  const access = useAccessControl({
    permission,
    role,
    permissions,
    roles,
    requireAll,
    onUnauthorized,
  });

  if (!access.allowed) return <>{fallback}</>;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300",
        featured
          ? "border-indigo-500/40 bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-indigo-950/30 dark:via-zinc-900 dark:to-zinc-900 shadow-sm hover:shadow-md hover:border-indigo-500/70"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm",
        COL_SPAN_MAP[colSpan],
        ROW_SPAN_MAP[rowSpan],
        className
      )}
      {...props}
    >
      {/* Top visual slot */}
      {header && <div className="mb-4 flex-1 min-h-0 overflow-hidden rounded-xl">{header}</div>}

      {/* Content */}
      <div className="flex flex-col gap-2">
        {(Icon || badge) && (
          <div className="flex items-center justify-between gap-2 mb-1">
            {Icon ? (
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105",
                  featured
                    ? "border-indigo-200 bg-indigo-600 text-white dark:border-indigo-800"
                    : "border-zinc-200/80 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-200"
                )}
              >
                <Icon size={18} />
              </div>
            ) : (
              <span />
            )}
            {badge && <div>{badge}</div>}
          </div>
        )}

        <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>

        {description && (
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        )}

        {children && <div className="mt-2">{children}</div>}

        {(cta || href || onCtaClick) && (
          <div className="mt-3 pt-1">
            {href ? (
              <a
                href={href}
                onClick={onCtaClick}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <span>{cta ?? "Saiba mais"}</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onCtaClick}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <span>{cta ?? "Explorar"}</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BentoGrid;
