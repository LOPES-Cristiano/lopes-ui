"use client";

import React, { useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { Search, ExternalLink, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AppItem = {
  id: string;
  label: string;
  description?: string;
  /** Lucide icon — takes precedence over logoUrl */
  icon?: LucideIcon;
  /** Image/logo URL — shown when no icon is provided */
  logoUrl?: string;
  /** Initials shown when neither icon nor logoUrl are available */
  initials?: string;
  href?: string;
  onClick?: () => void;
  /** Badge label (e.g. "Novo", "Beta", "3") */
  badge?: string;
  /** Category for grouping */
  category?: string;
  /** Highlight with an accent color */
  color?: "indigo" | "blue" | "emerald" | "amber" | "red" | "violet" | "pink" | "teal" | "orange" | "zinc";
  /** Mark as unavailable / maintenance */
  disabled?: boolean;
  /** Opens link in new tab (default true when href is set) */
  external?: boolean;
  componentId?: string;
};

export type AppLauncherProps = {
  apps: AppItem[];
  /** Show a search bar above the grid (default: true when apps.length > 6) */
  searchable?: boolean;
  /** Group apps by `category` field (default: false) */
  grouped?: boolean;
  /** Number of columns: "auto" uses responsive CSS grid (default) */
  columns?: 2 | 3 | 4 | 5 | 6 | "auto";
  /** Card size */
  size?: "sm" | "md" | "lg";
  /** Show app description below the label */
  showDescription?: boolean;
  /** Title shown above the launcher */
  title?: string;
  className?: string;
  componentId?: string;
};

// ── Color palettes ────────────────────────────────────────────────────────────

const COLOR_BG: Record<string, string> = {
  indigo:  "bg-indigo-50  dark:bg-indigo-950/40",
  blue:    "bg-blue-50    dark:bg-blue-950/40",
  emerald: "bg-emerald-50 dark:bg-emerald-950/40",
  amber:   "bg-amber-50   dark:bg-amber-950/40",
  red:     "bg-red-50     dark:bg-red-950/40",
  violet:  "bg-violet-50  dark:bg-violet-950/40",
  pink:    "bg-pink-50    dark:bg-pink-950/40",
  teal:    "bg-teal-50    dark:bg-teal-950/40",
  orange:  "bg-orange-50  dark:bg-orange-950/40",
  zinc:    "bg-zinc-100   dark:bg-zinc-800",
};

const COLOR_ICON: Record<string, string> = {
  indigo:  "text-indigo-600  dark:text-indigo-400",
  blue:    "text-blue-600    dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber:   "text-amber-600   dark:text-amber-400",
  red:     "text-red-600     dark:text-red-400",
  violet:  "text-violet-600  dark:text-violet-400",
  pink:    "text-pink-600    dark:text-pink-400",
  teal:    "text-teal-600    dark:text-teal-400",
  orange:  "text-orange-600  dark:text-orange-400",
  zinc:    "text-zinc-600    dark:text-zinc-400",
};

// ── Single app card ───────────────────────────────────────────────────────────

const SIZE_ICON: Record<string, string> = {
  sm: "h-9 w-9 rounded-xl text-xs",
  md: "h-12 w-12 rounded-2xl text-sm",
  lg: "h-16 w-16 rounded-3xl text-base",
};

const SIZE_ICON_PX: Record<string, number> = { sm: 18, md: 22, lg: 28 };

const SIZE_LABEL: Record<string, string> = {
  sm: "text-[11px] font-medium",
  md: "text-xs font-semibold",
  lg: "text-sm font-semibold",
};

const SIZE_DESC: Record<string, string> = {
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-xs",
};

const SIZE_PAD: Record<string, string> = {
  sm: "gap-1.5 p-3",
  md: "gap-2 p-4",
  lg: "gap-3 p-5",
};

function AppCard({
  app,
  size = "md",
  showDescription = false,
}: {
  app: AppItem;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}) {
  const color = app.color ?? "zinc";
  const Icon = app.icon;
  const iconSz = SIZE_ICON_PX[size];

  const iconBg = twMerge(
    "flex items-center justify-center shrink-0 font-bold",
    SIZE_ICON[size],
    COLOR_BG[color],
    COLOR_ICON[color],
  );

  const visual = (
    <div className={iconBg}>
      {Icon ? (
        <Icon size={iconSz} strokeWidth={1.75} />
      ) : app.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.logoUrl} alt={app.label} width={iconSz} height={iconSz} className="object-contain" />
      ) : (
        <span>{app.initials ?? app.label.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );

  const inner = (
    <div
      className={twMerge(
        "relative flex flex-col items-center text-center",
        SIZE_PAD[size],
        "rounded-2xl border border-zinc-100 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900",
        "transition-all duration-150",
        app.disabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md hover:shadow-zinc-900/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
      )}
      {...(app.componentId ? { "data-component-id": app.componentId } : {})}
    >
      {/* Badge */}
      {app.badge && (
        <span className="absolute -top-1.5 -right-1.5 z-10 inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
          {app.badge}
        </span>
      )}

      {visual}

      <div className="w-full mt-0.5 min-w-0">
        <p className={twMerge(SIZE_LABEL[size], "truncate text-zinc-800 dark:text-zinc-200 leading-snug")}>
          {app.label}
        </p>
        {showDescription && app.description && (
          <p className={twMerge(SIZE_DESC[size], "text-zinc-400 dark:text-zinc-500 truncate mt-0.5 leading-snug")}>
            {app.description}
          </p>
        )}
      </div>

      {/* External hint */}
      {app.href && app.external !== false && (
        <ExternalLink size={10} className="absolute bottom-2 right-2 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover/card:opacity-100 transition-opacity" />
      )}
    </div>
  );

  if (app.href && !app.disabled) {
    return (
      <a
        href={app.href}
        target={app.external !== false ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="group/card block"
        onClick={() => app.onClick?.()}
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      className="group/card"
      role={app.onClick ? "button" : undefined}
      tabIndex={app.onClick && !app.disabled ? 0 : undefined}
      onClick={app.disabled ? undefined : app.onClick}
      onKeyDown={app.disabled ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); app.onClick?.(); } }}
    >
      {inner}
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────

const COLS_CLS: Record<string | number, string> = {
  2:      "grid-cols-2",
  3:      "grid-cols-3",
  4:      "grid-cols-2 sm:grid-cols-4",
  5:      "grid-cols-3 sm:grid-cols-5",
  6:      "grid-cols-3 sm:grid-cols-6",
  auto:   "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
};

function AppGrid({
  apps,
  columns = "auto",
  size,
  showDescription,
}: {
  apps: AppItem[];
  columns?: AppLauncherProps["columns"];
  size?: AppLauncherProps["size"];
  showDescription?: boolean;
}) {
  return (
    <div className={twMerge("grid gap-3", COLS_CLS[columns ?? "auto"])}>
      {apps.map((app) => (
        <AppCard key={app.id} app={app} size={size} showDescription={showDescription} />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AppLauncher({
  apps,
  searchable,
  grouped = false,
  columns = "auto",
  size = "md",
  showDescription = false,
  title,
  className,
  componentId,
}: AppLauncherProps) {
  const [query, setQuery] = useState("");
  const showSearch = searchable ?? apps.length > 6;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q),
    );
  }, [apps, query]);

  const groupMap = useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, AppItem[]>();
    for (const app of filtered) {
      const cat = app.category ?? "Outros";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(app);
    }
    return map;
  }, [filtered, grouped]);

  return (
    <div
      className={twMerge("flex flex-col gap-5", className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Header */}
      {(title || showSearch) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {title && (
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 shrink-0">{title}</h2>
          )}
          {showSearch && (
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar aplicativo..."
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
              />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
          <Search size={28} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum aplicativo encontrado para <strong>&ldquo;{query}&rdquo;</strong>
          </p>
        </div>
      )}

      {/* Grouped */}
      {groupMap
        ? Array.from(groupMap.entries()).map(([cat, items]) => (
            <div key={cat} className="flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {cat}
              </p>
              <AppGrid apps={items} columns={columns} size={size} showDescription={showDescription} />
            </div>
          ))
        : filtered.length > 0 && (
            <AppGrid apps={filtered} columns={columns} size={size} showDescription={showDescription} />
          )
      }
    </div>
  );
}
