"use client";

import React, { useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { ExternalLink, type LucideIcon } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActionTileColor =
  | "primary"
  | "indigo"
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "violet"
  | "teal"
  | "orange"
  | "pink"
  | "zinc";

export type ActionGridItem = {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  color?: ActionTileColor;
  badge?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
};

export type ActionGridCardProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional right-side header slot (e.g. "Personalizar" link or action button) */
  headerAction?: React.ReactNode;
  items: ActionGridItem[];
  columns?: 2 | 3 | 4;
  size?: "sm" | "md";
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const TILE_COLOR_CLS: Record<ActionTileColor, string> = {
  primary: "bg-primary/10 text-primary",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  red: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
  pink: "bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400",
  zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const COLS_MAP: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

// ── ActionGridCard (Mantine UI "Actions grid" card) ──────────────────────────

export default function ActionGridCard({
  title,
  subtitle,
  headerAction,
  items,
  columns = 3,
  size = "md",
  className,
  componentId,
  hideIfDenied = false,
}: ActionGridCardProps) {
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => {
        const allowed = !item.componentId || canAccess(item.componentId);
        if (!allowed && item.hideIfDenied !== false) return false;
        return true;
      })
      .map((item) => {
        const allowed = !item.componentId || canAccess(item.componentId);
        return { ...item, disabled: Boolean(item.disabled || !allowed) };
      });
  }, [items, canAccess]);

  if (!hasRootPermission && hideIfDenied) return null;

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-surface-foreground shadow-xs",
        !hasRootPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-bold text-foreground">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0 text-xs">{headerAction}</div>}
        </div>
      )}

      <div className={twMerge("grid gap-2.5", COLS_MAP[columns])}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const color = item.color ?? "primary";
          const tileInner = (
            <div
              className={twMerge(
                "group/tile relative flex flex-col items-center justify-center rounded-xl border border-transparent bg-muted/45 text-center transition-all duration-150",
                size === "sm" ? "gap-1.5 p-3" : "gap-2 p-4",
                item.disabled
                  ? "opacity-45 cursor-not-allowed"
                  : "cursor-pointer hover:border-border hover:bg-surface hover:shadow-md hover:shadow-zinc-900/5 dark:hover:shadow-black/25 hover:-translate-y-0.5 active:translate-y-0",
              )}
            >
              {item.badge && (
                <span className="absolute top-2 right-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                  {item.badge}
                </span>
              )}

              <div
                className={twMerge(
                  "flex items-center justify-center rounded-xl transition-transform duration-150 group-hover/tile:scale-105",
                  size === "sm" ? "h-9 w-9" : "h-11 w-11",
                  TILE_COLOR_CLS[color],
                )}
              >
                <Icon size={size === "sm" ? 18 : 22} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 w-full">
                <p className="truncate text-xs font-semibold text-foreground">{item.label}</p>
                {item.description && (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>

              {item.href && item.external && (
                <ExternalLink
                  size={11}
                  className="absolute bottom-2 right-2 text-muted-foreground opacity-0 transition-opacity group-hover/tile:opacity-100"
                />
              )}
            </div>
          );

          if (item.href && !item.disabled) {
            return (
              <a
                key={item.id}
                {...(item.componentId ? { "data-component-id": item.componentId } : {})}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => item.onClick?.()}
                className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {tileInner}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              {...(item.componentId ? { "data-component-id": item.componentId } : {})}
              disabled={item.disabled}
              onClick={item.disabled ? undefined : item.onClick}
              className="block w-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {tileInner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── SwitchesCard (Mantine UI "Card with switches" settings panel) ────────────

export type SwitchCardItem = {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  componentId?: string;
};

export type SwitchesCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  items: SwitchCardItem[];
  /** Optional controlled map of `{ [itemId]: boolean }` */
  values?: Record<string, boolean>;
  onChange?: (id: string, checked: boolean, nextValues: Record<string, boolean>) => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

export function SwitchesCard({
  title,
  description,
  icon: HeaderIcon,
  items,
  values,
  onChange,
  className,
  componentId,
  hideIfDenied = false,
}: SwitchesCardProps) {
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const [internalValues, setInternalValues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of items) {
      init[item.id] = Boolean(item.defaultChecked);
    }
    return init;
  });

  if (!hasRootPermission && hideIfDenied) return null;

  const currentMap = values ?? internalValues;

  const handleToggle = (item: SwitchCardItem) => {
    const itemAllowed = !item.componentId || canAccess(item.componentId);
    if (item.disabled || !itemAllowed || !hasRootPermission) return;

    const nextChecked = !currentMap[item.id];
    const nextMap = { ...currentMap, [item.id]: nextChecked };
    if (values === undefined) {
      setInternalValues(nextMap);
    }
    onChange?.(item.id, nextChecked, nextMap);
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col rounded-2xl border border-border bg-surface p-5 text-surface-foreground shadow-xs",
        !hasRootPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 pb-4">
        {HeaderIcon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HeaderIcon size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Switch Rows */}
      <div className="divide-y divide-border border-t border-border">
        {items.map((item) => {
          const ItemIcon = item.icon;
          const checked = Boolean(currentMap[item.id]);
          const itemAllowed = !item.componentId || canAccess(item.componentId);
          const isDisabled = Boolean(item.disabled || !itemAllowed);

          return (
            <div
              key={item.id}
              {...(item.componentId ? { "data-component-id": item.componentId } : {})}
              onClick={() => handleToggle(item)}
              className={twMerge(
                "flex items-center justify-between gap-4 py-3.5 first:pt-3.5 last:pb-0 transition-colors",
                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                {ItemIcon && (
                  <ItemIcon size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={item.title}
                disabled={isDisabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(item);
                }}
                className={twMerge(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  checked ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700",
                  isDisabled ? "cursor-not-allowed" : "cursor-pointer",
                )}
              >
                <span
                  aria-hidden="true"
                  className={twMerge(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-150",
                    checked ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ActionGridCard };
