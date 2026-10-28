"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import {
  Inbox, FileSearch, Lock, AlertTriangle, WifiOff,
  PackageOpen, Frown, Loader2, type LucideIcon,
} from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Built-in illustration presets */
export type EmptyStatePreset =
  | "empty"         // generic empty list
  | "search"        // no search results
  | "error"         // something went wrong
  | "no-access"     // permission denied
  | "offline"       // connection error
  | "not-found"     // 404 inline
  | "custom";       // bring your own icon/illustration

export type EmptyStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  /** Access-control identifier for this action button */
  componentId?: string;
  /** If false, disables the action button instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type EmptyStateProps = {
  /** Short preset name — picks default icon + copy */
  preset?: EmptyStatePreset;
  /** Override title regardless of preset */
  title?: string;
  /** Override description regardless of preset */
  description?: string;
  /** Custom Lucide icon or element (overrides preset icon) */
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> | React.ReactNode;
  /** Custom illustration node (overrides icon entirely) */
  illustration?: React.ReactNode;
  /** One or two action buttons */
  actions?: EmptyStateAction[];
  /** Layout size */
  size?: "sm" | "md" | "lg";
  /** Orientation layout ("vertical" centered default or "horizontal" compact banner) */
  layout?: "vertical" | "horizontal";
  /** Fill 100% of parent height and center vertically */
  fill?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Preset data ───────────────────────────────────────────────────────────────

type PresetConfig = {
  icon: LucideIcon;
  iconBg: string;
  iconCls: string;
  title: string;
  description: string;
};

const PRESETS: Record<Exclude<EmptyStatePreset, "custom">, PresetConfig> = {
  empty: {
    icon: Inbox,
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconCls: "text-zinc-400 dark:text-zinc-500",
    title: "Nenhum item encontrado",
    description: "Ainda não há dados para exibir aqui.",
  },
  search: {
    icon: FileSearch,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconCls: "text-blue-500 dark:text-blue-400",
    title: "Nenhum resultado",
    description: "Nenhum item corresponde à sua busca. Tente outros termos.",
  },
  error: {
    icon: AlertTriangle,
    iconBg: "bg-red-50 dark:bg-red-950/40",
    iconCls: "text-red-500 dark:text-red-400",
    title: "Algo deu errado",
    description: "Ocorreu um erro ao carregar os dados. Tente novamente.",
  },
  "no-access": {
    icon: Lock,
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconCls: "text-amber-500 dark:text-amber-400",
    title: "Acesso negado",
    description: "Você não tem permissão para visualizar este conteúdo.",
  },
  offline: {
    icon: WifiOff,
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconCls: "text-zinc-500 dark:text-zinc-400",
    title: "Sem conexão",
    description: "Verifique sua conexão com a internet e tente novamente.",
  },
  "not-found": {
    icon: PackageOpen,
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconCls: "text-zinc-400 dark:text-zinc-500",
    title: "Não encontrado",
    description: "O item que você procura não existe ou foi removido.",
  },
};

// ── Size maps ─────────────────────────────────────────────────────────────────

const ICON_SIZE: Record<NonNullable<EmptyStateProps["size"]>, number> = {
  sm: 20,
  md: 28,
  lg: 36,
};

const WRAP_SIZE: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
};

const GAP: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "gap-3 py-6",
  md: "gap-4 py-10",
  lg: "gap-5 py-14",
};

const TITLE_CLS: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-lg font-semibold",
};

const DESC_CLS: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "text-xs max-w-xs",
  md: "text-sm max-w-sm",
  lg: "text-sm max-w-md",
};

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({ action, size }: { action: EmptyStateAction; size: NonNullable<EmptyStateProps["size"]> }) {
  const { canAccess } = useAccessControl();
  const hasPermission = !action.componentId || canAccess(action.componentId);
  const hideIfDenied = action.hideIfDenied ?? true;

  if (!hasPermission && hideIfDenied) return null;

  const isDisabled = Boolean(action.disabled || action.loading || !hasPermission);
  const cls = twMerge(
    "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors",
    size === "sm" ? "px-3 py-1.5 text-xs" : size === "md" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm",
    isDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer",
    action.variant === "secondary"
      ? "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300",
  );

  const inner = (
    <>
      {action.loading ? (
        <Loader2 size={14} className="animate-spin shrink-0" />
      ) : (
        action.icon && <span className="shrink-0">{action.icon}</span>
      )}
      <span>{action.label}</span>
    </>
  );

  if (action.href && !isDisabled) {
    return (
      <a data-component-id={action.componentId ?? "erp.empty-state.action"} href={action.href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button
      data-component-id={action.componentId ?? "erp.empty-state.action"}
      type="button"
      disabled={isDisabled}
      className={cls}
      onClick={action.onClick}
    >
      {inner}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmptyState({
  preset = "empty",
  title,
  description,
  icon: CustomIcon,
  illustration,
  actions,
  size = "md",
  layout = "vertical",
  fill = false,
  className,
  componentId,
  hideIfDenied = true,
}: EmptyStateProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  const config = preset !== "custom" ? PRESETS[preset] : null;

  const resolvedTitle       = title       ?? config?.title       ?? "Sem dados";
  const resolvedDescription = description ?? config?.description ?? "";

  const iconBg  = config?.iconBg  ?? "bg-zinc-100 dark:bg-zinc-800";
  const iconCls = config?.iconCls ?? "text-zinc-400 dark:text-zinc-500";

  const renderIcon = () => {
    if (!CustomIcon) {
      const FallbackIcon = config?.icon ?? Frown;
      return <FallbackIcon size={ICON_SIZE[size]} className={iconCls} strokeWidth={1.5} />;
    }
    if (React.isValidElement(CustomIcon)) {
      return CustomIcon;
    }
    if (typeof CustomIcon === "function" || typeof CustomIcon === "object") {
      const Comp = CustomIcon as React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
      return <Comp size={ICON_SIZE[size]} className={iconCls} strokeWidth={1.5} />;
    }
    return null;
  };

  if (layout === "horizontal") {
    return (
      <div
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={twMerge(
          "flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-left",
          fill && "h-full",
          className,
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {illustration ?? (
            <div
              className={twMerge(
                "flex items-center justify-center rounded-xl shrink-0",
                WRAP_SIZE[size],
                iconBg,
              )}
            >
              {renderIcon()}
            </div>
          )}
          <div className="min-w-0">
            <p className={twMerge(TITLE_CLS[size], "text-zinc-800 dark:text-zinc-200")}>
              {resolvedTitle}
            </p>
            {resolvedDescription && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {resolvedDescription}
              </p>
            )}
          </div>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {actions.map((a, i) => (
              <ActionBtn key={i} action={a} size={size} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col items-center text-center",
        GAP[size],
        fill && "h-full justify-center",
        className,
      )}
    >
      {/* Illustration or icon */}
      {illustration ?? (
        <div
          className={twMerge(
            "flex items-center justify-center rounded-2xl shrink-0",
            WRAP_SIZE[size],
            iconBg,
          )}
        >
          {renderIcon()}
        </div>
      )}

      {/* Copy */}
      <div className="space-y-1.5">
        <p className={twMerge(TITLE_CLS[size], "text-zinc-800 dark:text-zinc-200")}>
          {resolvedTitle}
        </p>
        {resolvedDescription && (
          <p className={twMerge(DESC_CLS[size], "text-zinc-500 dark:text-zinc-400 leading-relaxed mx-auto")}>
            {resolvedDescription}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {actions.map((a, i) => (
            <ActionBtn key={i} action={a} size={size} />
          ))}
        </div>
      )}
    </div>
  );
}
