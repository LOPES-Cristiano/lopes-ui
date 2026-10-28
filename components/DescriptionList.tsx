"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { CopyButton } from "./Snippet";
import { useAccessControl } from "./useAccessControl";

export interface DescriptionItem {
  key?: string;
  /** Rótulo da propriedade */
  label: React.ReactNode;
  /** Valor exibido */
  value: React.ReactNode;
  /** Permite copiar este texto ao clicar no ícone */
  copyValue?: string;
  /** Quantidade de colunas ocupadas no modo grid */
  span?: 1 | 2 | 3;
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Lista de pares chave/valor */
  items: DescriptionItem[];
  /** Título opcional no topo */
  title?: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Ações no cabeçalho */
  extra?: React.ReactNode;
  /** Layout de distribuição */
  layout?: "horizontal" | "grid" | "stacked";
  /** Colunas quando layout="grid" */
  columns?: 2 | 3 | 4;
  /** Adiciona borda externa e divisórias */
  bordered?: boolean;
  /** Linhas zebradas */
  striped?: boolean;
  /** Densidade de espaçamento */
  size?: "sm" | "md" | "lg";
}

const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const SPAN_CLASSES: Record<1 | 2 | 3, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
};

export default function DescriptionList({
  items,
  title,
  subtitle,
  extra,
  layout = "horizontal",
  columns = 2,
  bordered = true,
  striped = false,
  size = "md",
  className,
  componentId,
  hideIfDenied = true,
  ...props
}: DescriptionListProps) {
  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  if (!hasAccess && hideIfDenied) return null;

  const padClasses = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-sm",
  }[size];

  return (
    <div
      className={cn(
        "w-full overflow-hidden",
        bordered && "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
        className
      )}
    >
      {(title || subtitle || extra) && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3",
            bordered
              ? "border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5 bg-zinc-50/50 dark:bg-zinc-900/50"
              : "mb-3"
          )}
        >
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          {extra && <div className="flex items-center gap-2">{extra}</div>}
        </div>
      )}

      {layout === "grid" ? (
        <dl
          className={cn(
            "grid",
            GRID_COLS[columns],
            bordered && "divide-y sm:divide-y-0 gap-px bg-zinc-200 dark:bg-zinc-800"
          )}
          {...props}
        >
          {items.map((item, idx) => (
            <div
              key={item.key ?? idx}
              className={cn(
                "flex flex-col justify-between gap-1 bg-white dark:bg-zinc-900",
                padClasses,
                item.span && SPAN_CLASSES[item.span]
              )}
            >
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</dt>
              <dd className="flex items-center justify-between gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                <span className="min-w-0 break-words">{item.value}</span>
                {item.copyValue && <CopyButton value={item.copyValue} size="xs" />}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800" {...props}>
          {items.map((item, idx) => (
            <div
              key={item.key ?? idx}
              className={cn(
                padClasses,
                layout === "horizontal"
                  ? "grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-center"
                  : "flex flex-col gap-1",
                striped && idx % 2 === 1 && "bg-zinc-50/60 dark:bg-zinc-800/30"
              )}
            >
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</dt>
              <dd
                className={cn(
                  "flex items-center justify-between gap-2 font-medium text-zinc-900 dark:text-zinc-100",
                  layout === "horizontal" && "sm:col-span-2"
                )}
              >
                <span className="min-w-0 break-words">{item.value}</span>
                {item.copyValue && <CopyButton value={item.copyValue} size="xs" />}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
