"use client";

import React from "react";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href?: string;
  /** Identifier for access control (emitted as data-component-id) */
  componentId?: string;
  /** Ícone lucide-react exibido antes do label */
  icon?: LucideIcon;
  /** Badge numérico ou texto exibido após o label (ex: "Novo", 3) */
  badge?: string | number;
  /** Texto descritivo exibido abaixo do label no dropdown */
  description?: string;
  /** Item desabilitado — não clicável */
  disabled?: boolean;
  /** Separador visual antes deste item */
  divider?: boolean;
  children?: NavItem[];
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function NavBadge({ value }: { value: string | number }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-px text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 leading-none">
      {value}
    </span>
  );
}

function L2Item({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: (href: string) => void;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  const inner = (
    <span className="flex items-center gap-2.5 w-full">
      {Icon && (
        <span className="shrink-0 text-zinc-500 dark:text-zinc-400 group-hover/item:text-zinc-900 dark:group-hover/item:text-zinc-100 transition-colors">
          <Icon size={15} strokeWidth={1.75} />
        </span>
      )}
      <span className="flex flex-col flex-1 min-w-0 text-left">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 leading-snug flex items-center gap-1">
          {item.label}
          {item.badge !== undefined && <NavBadge value={item.badge} />}
        </span>
        {item.description && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 leading-snug mt-0.5 truncate">{item.description}</span>
        )}
      </span>
      {hasChildren && <ChevronRight size={12} className="shrink-0 text-zinc-300 ml-auto" />}
    </span>
  );

  const baseClass = [
    "group/item relative flex items-center w-full px-3 py-2 rounded-md transition-colors duration-100",
    item.disabled
      ? "cursor-not-allowed opacity-40 pointer-events-none"
      : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800",
  ].join(" ");

  if (hasChildren) {
    return (
      <div className="relative group/l2">
        <button
          type="button"
          className={baseClass}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " " || e.key === "ArrowRight") && item.children?.length) {
              e.preventDefault();
              (e.currentTarget.parentElement?.querySelector("[role='menuitem']") as HTMLElement | null)?.focus();
            }
          }}
          disabled={item.disabled}
          role="menuitem"
          tabIndex={0}
          {...(item.componentId ? { "data-component-id": item.componentId } : {})}
        >
          {inner}
        </button>

        {/* Level 3 */}
        <div
          className="absolute left-full top-0 -ml-1 hidden group-hover/l2:block bg-white dark:bg-zinc-900 rounded-xl shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] z-30 min-w-[11rem] p-1"
          role="menu"
        >
          {item.children!.map((g, gi) => (
            <React.Fragment key={`${g.href ?? "#"}-${gi}`}>
              {g.divider && <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />}
              <L2Item item={g} onNavigate={onNavigate} />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <a
      href={item.disabled ? undefined : (item.href ?? "#")}
      role="menuitem"
      tabIndex={item.disabled ? -1 : 0}
      className={baseClass}
      onClick={(e) => {
        if (item.disabled) return;
        if (onNavigate && item.href) {
          e.preventDefault();
          onNavigate(item.href);
        }
      }}
      {...(item.componentId ? { "data-component-id": item.componentId } : {})}
    >
      {inner}
    </a>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

export default function Nav({
  items,
  onNavigate,
  dropdown = false,
}: {
  items: NavItem[];
  onNavigate?: (href: string) => void;
  dropdown?: boolean;
}) {
  return (
    <nav className="hidden md:flex md:items-center md:gap-1">
      {items.map((n, idx) => {
        const key = `${n.href ?? "#"}-${n.label}-${idx}`;
        const Icon = n.icon;

        if (dropdown && n.children && n.children.length) {
          return (
            <div key={key} className="relative group/l1">
              <button
                type="button"
                className={[
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  n.disabled
                    ? "cursor-not-allowed opacity-40"
                    : "text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer",
                ].join(" ")}
                aria-haspopup="menu"
                disabled={n.disabled}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && n.children?.length) {
                    e.preventDefault();
                    (e.currentTarget.parentElement?.querySelector("[role='menuitem']") as HTMLElement | null)?.focus();
                  }
                }}
                {...(n.componentId ? { "data-component-id": n.componentId } : {})}
              >
                {Icon && <Icon size={14} strokeWidth={1.75} className="text-zinc-400 dark:text-zinc-500" />}
                {n.label}
                {n.badge !== undefined && <NavBadge value={n.badge} />}
                <ChevronDown
                  size={12}
                  className="text-zinc-400 dark:text-zinc-500 transition-transform duration-150 group-hover/l1:rotate-180"
                />
              </button>

              {/* Level 2 dropdown */}
              <div
                className="absolute left-0 top-full pt-1 hidden group-hover/l1:block z-20"
                role="menu"
                aria-label={`${n.label} submenu`}
              >
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] min-w-[12rem] p-1">
                  {n.children.map((c, ci) => (
                    <React.Fragment key={`${c.href ?? "#"}-${ci}`}>
                      {c.divider && <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />}
                      <L2Item item={c} onNavigate={onNavigate} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <a
            key={key}
            href={n.disabled ? undefined : (n.href ?? "#")}
            onClick={(e) => {
              if (n.disabled) return;
              if (onNavigate && n.href) {
                e.preventDefault();
                onNavigate(n.href);
              }
            }}
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
              n.disabled
                ? "cursor-not-allowed opacity-40"
                : "text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            ].join(" ")}
            {...(n.componentId ? { "data-component-id": n.componentId } : {})}
          >
            {Icon && <Icon size={14} strokeWidth={1.75} className="text-zinc-400 dark:text-zinc-500" />}
            {n.label}
            {n.badge !== undefined && <NavBadge value={n.badge} />}
          </a>
        );
      })}
    </nav>
  );
}
