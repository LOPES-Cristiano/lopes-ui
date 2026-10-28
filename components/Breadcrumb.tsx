"use client";

import React from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { ChevronRight, Slash, Home, MoreHorizontal, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./primitives/dropdown-menu";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BreadcrumbSeparator = "chevron" | "slash" | "dot";
export type BreadcrumbCollapseMode = "dropdown" | "expand";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  /** Override component-level separator before this item */
  separator?: BreadcrumbSeparator;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /** Separator between items */
  separator?: BreadcrumbSeparator;
  /** Replace the first item with a Home icon */
  homeIcon?: boolean;
  /**
   * Collapse middle items when the breadcrumb has more than `maxItems`.
   * The first and last items are always shown. Defaults to `undefined` (no collapse).
   */
  maxItems?: number;
  /**
   * How collapsed items behave when clicking "...":
   * - "dropdown" (default, shadcn/ui style): opens a menu with the hidden items
   * - "expand": expands all items inline
   */
  collapseMode?: BreadcrumbCollapseMode;
  className?: string;
  componentId?: string;
};

// ── Separator ─────────────────────────────────────────────────────────────────

function Sep({ type }: { type: BreadcrumbSeparator }) {
  if (type === "slash") {
    return <Slash className="w-3 h-3 text-header-breadcrumb-separator" strokeWidth={2} />;
  }
  if (type === "dot") {
    return <span className="w-1 h-1 rounded-full bg-header-breadcrumb-separator flex-shrink-0" />;
  }
  return <ChevronRight className="w-3.5 h-3.5 text-header-breadcrumb-separator" strokeWidth={2} />;
}

// ── Item link / span ──────────────────────────────────────────────────────────

function BreadcrumbLink({
  item,
  isCurrent,
  homeOnly,
}: {
  item: BreadcrumbItem;
  isCurrent: boolean;
  homeOnly?: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <span className="flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />}
      {!homeOnly && <span>{item.label}</span>}
    </span>
  );

  if (isCurrent) {
    return (
      <span
        aria-current="page"
        className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold cursor-default select-none"
      >
        {content}
      </span>
    );
  }

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={item.onClick}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        aria-label={homeOnly ? item.label : undefined}
      >
        {content}
      </Link>
    );
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded cursor-pointer"
        aria-label={homeOnly ? item.label : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 cursor-default font-normal">
      {content}
    </span>
  );
}

// ── Collapsed ellipsis button (shadcn/ui BreadcrumbEllipsis + DropdownMenu) ───

function EllipsisButton({
  hiddenItems,
  collapseMode = "dropdown",
  onExpand,
}: {
  hiddenItems: BreadcrumbItem[];
  collapseMode?: BreadcrumbCollapseMode;
  onExpand: () => void;
}) {
  const title = hiddenItems.map((i) => i.label).join(" › ");

  const triggerBtn = (
    <button
      data-component-id="erp.breadcrumb.expand"
      type="button"
      title={title}
      aria-label={`Mostrar ${hiddenItems.length} itens ocultos: ${title}`}
      onClick={collapseMode === "expand" ? onExpand : undefined}
      className="flex items-center justify-center w-6 h-6 rounded hover:bg-header-control-hover text-header-breadcrumb-muted hover:text-header-breadcrumb-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-breadcrumb-focus-ring cursor-pointer"
    >
      <MoreHorizontal className="w-3.5 h-3.5" />
    </button>
  );

  if (collapseMode === "expand") {
    return triggerBtn;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerBtn}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {hiddenItems.map((hidden, idx) => {
          const HiddenIcon = hidden.icon;
          if (hidden.href) {
            return (
              <DropdownMenuItem key={`${hidden.label}-${idx}`} asChild>
                <Link href={hidden.href} onClick={hidden.onClick} className="flex items-center gap-2">
                  {HiddenIcon && <HiddenIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span>{hidden.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem
              key={`${hidden.label}-${idx}`}
              onClick={() => {
                if (hidden.onClick) hidden.onClick();
                else onExpand();
              }}
              className="flex items-center gap-2"
            >
              {HiddenIcon && <HiddenIcon className="w-3.5 h-3.5 text-muted-foreground" />}
              <span>{hidden.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Breadcrumb({
  items,
  separator = "chevron",
  homeIcon = false,
  maxItems,
  collapseMode = "dropdown",
  className,
  componentId,
}: BreadcrumbProps) {
  const [collapsed, setCollapsed] = React.useState(true);

  const shouldCollapse =
    maxItems !== undefined && items.length > maxItems && collapsed;

  let visibleItems: BreadcrumbItem[];
  let hiddenItems: BreadcrumbItem[] = [];

  if (shouldCollapse && maxItems !== undefined) {
    const keep = Math.max(2, maxItems);
    const head = items.slice(0, 1);
    const tail = items.slice(-(keep - 1));
    hiddenItems = items.slice(1, items.length - (keep - 1));
    visibleItems = [...head, ...tail];
  } else {
    visibleItems = items;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      data-component-id={componentId}
      className={twMerge(
        "flex min-w-0 max-w-full items-center overflow-hidden",
        className,
      )}
    >
      <ol className="flex min-w-0 max-w-full flex-nowrap items-center overflow-hidden whitespace-nowrap text-sm">
        {visibleItems.map((item, index) => {
          const isCurrent = index === visibleItems.length - 1;
          const isFirst = index === 0;
          const isHome = homeIcon && isFirst;
          const sep = item.separator ?? separator;

          const showEllipsis =
            shouldCollapse &&
            hiddenItems.length > 0 &&
            index === 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {/* Collapsed ellipsis right after the first item */}
              {showEllipsis && (
                <>
                  <li aria-hidden="true" className="mx-1.5 flex items-center">
                    <Sep type={sep} />
                  </li>
                  <li className="flex items-center">
                    <EllipsisButton
                      hiddenItems={hiddenItems}
                      collapseMode={collapseMode}
                      onExpand={() => setCollapsed(false)}
                    />
                  </li>
                </>
              )}

              {/* Separator before this item (including after ellipsis) */}
              {index > 0 && (
                <li
                  aria-hidden="true"
                  className="mx-1.5 flex items-center"
                >
                  <Sep type={sep} />
                </li>
              )}

              <li className="flex items-center">
                <BreadcrumbLink
                  item={isHome ? { ...item, icon: item.icon ?? Home } : item}
                  isCurrent={isCurrent}
                  homeOnly={isHome && !item.label}
                />
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
