"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { ChevronRight, Slash, Home, MoreHorizontal, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BreadcrumbSeparator = "chevron" | "slash" | "dot";

export type BreadcrumbItem = {
  label: string;
  href?: string;
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
  className?: string;
  componentId?: string;
};

// ── Separator ─────────────────────────────────────────────────────────────────

function Sep({ type }: { type: BreadcrumbSeparator }) {
  if (type === "slash") {
    return <Slash className="w-3 h-3 text-zinc-300 dark:text-zinc-600" strokeWidth={2} />;
  }
  if (type === "dot") {
    return <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 flex-shrink-0" />;
  }
  return <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" strokeWidth={2} />;
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
        className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50 font-medium cursor-default select-none"
      >
        {content}
      </span>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
        aria-label={homeOnly ? item.label : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 cursor-default">
      {content}
    </span>
  );
}

// ── Collapsed ellipsis button ─────────────────────────────────────────────────

function EllipsisButton({
  hiddenItems,
  onExpand,
}: {
  hiddenItems: BreadcrumbItem[];
  onExpand: () => void;
}) {
  const title = hiddenItems.map((i) => i.label).join(" › ");

  return (
    <button
      type="button"
      title={title}
      aria-label={`Mostrar ${hiddenItems.length} itens ocultos: ${title}`}
      onClick={onExpand}
      className="flex items-center justify-center w-6 h-6 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <MoreHorizontal className="w-3.5 h-3.5" />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Breadcrumb({
  items,
  separator = "chevron",
  homeIcon = false,
  maxItems,
  className,
  componentId,
}: BreadcrumbProps) {
  const [collapsed, setCollapsed] = React.useState(true);

  const shouldCollapse =
    maxItems !== undefined && items.length > maxItems && collapsed;

  // Build the visible item list
  let visibleItems: BreadcrumbItem[];
  let hiddenItems: BreadcrumbItem[] = [];

  if (shouldCollapse && maxItems !== undefined) {
    // Always show first + last; fill remaining slots with items from the start/end
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
      className={twMerge("flex items-center", className)}
    >
      <ol className="flex items-center flex-wrap gap-y-1 text-sm">
        {visibleItems.map((item, index) => {
          const isCurrent = index === visibleItems.length - 1 && !shouldCollapse;
          const isFirst = index === 0;
          const isHome = homeIcon && isFirst;
          const sep = item.separator ?? separator;

          // Inject the ellipsis button in the gap between head and tail
          const showEllipsis =
            shouldCollapse &&
            hiddenItems.length > 0 &&
            index === 1; // right after the first item

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {/* Separator (skip before first item) */}
              {index > 0 && (
                <li
                  aria-hidden="true"
                  className="mx-1.5 flex items-center"
                >
                  <Sep type={sep} />
                </li>
              )}

              {/* Collapsed ellipsis */}
              {showEllipsis && (
                <>
                  <li aria-hidden="true" className="mx-1.5 flex items-center">
                    <Sep type={sep} />
                  </li>
                  <li className="flex items-center">
                    <EllipsisButton
                      hiddenItems={hiddenItems}
                      onExpand={() => setCollapsed(false)}
                    />
                  </li>
                </>
              )}

              {/* Wait — if collapsed + this is index 1 onward (the tail), we need a separator before the ellipsis */}
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
