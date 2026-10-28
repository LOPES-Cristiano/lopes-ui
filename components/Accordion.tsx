"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

export type AccordionItem = {
  id?: string;
  title: React.ReactNode;
  /** Sub-title shown to the right of the title (collapsed width) */
  subtitle?: React.ReactNode;
  /** Lucide icon before the title */
  icon?: LucideIcon;
  /** Badge / chip shown after the title */
  badge?: React.ReactNode;
  /** Extra Tailwind classes applied to the badge chip (e.g. custom color) */
  badgeClassName?: string;
  /** Extra Tailwind classes applied to the leading icon wrapper */
  iconClassName?: string;
  /** Extra actions/buttons on the right (outside the toggle button) */
  actions?: React.ReactNode;
  content: React.ReactNode;
  /** Extra Tailwind classes applied to the content panel wrapper */
  contentClassName?: string;
  disabled?: boolean;
  /** Open by default */
  defaultOpen?: boolean;
  /** Keep content mounted in DOM even when closed (default: true) */
  keepMounted?: boolean;
  className?: string;
  /** Access-control identifier for this accordion item */
  componentId?: string;
  /** If false, disables the item instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type AccordionVariant = "default" | "bordered" | "separated" | "splitted" | "flush" | "minimal";

export type AccordionProps = {
  items: AccordionItem[];
  /** Allow multiple panels open simultaneously */
  multiple?: boolean;
  /** Controlled open item IDs or indexes */
  openIds?: (string | number)[];
  /** Callback fired when a panel is toggled */
  onToggle?: (id: string | number) => void;
  variant?: AccordionVariant;
  chevronPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  /** Keep collapsed panels mounted in DOM (default: true for CSS grid transition) */
  keepMounted?: boolean;
  className?: string;
  /** Access-control identifier emitted on the root wrapper */
  componentId?: string;
  /** If true, hides the entire accordion when access is denied (default: true) */
  hideIfDenied?: boolean;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE = {
  sm: {
    trigger: "px-3 py-2.5 text-sm gap-2",
    content: "px-3 pb-3 text-sm",
    icon: 14,
    chevron: 13,
  },
  md: {
    trigger: "px-4 py-3 text-sm gap-2.5",
    content: "px-4 pb-4 text-sm",
    icon: 16,
    chevron: 14,
  },
  lg: {
    trigger: "px-5 py-4 text-base gap-3",
    content: "px-5 pb-5 text-base",
    icon: 18,
    chevron: 16,
  },
} as const;

const VARIANT_WRAP: Record<AccordionVariant, string> = {
  default:
    "divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden",
  bordered: "divide-y divide-zinc-200 dark:divide-zinc-700",
  separated: "flex flex-col gap-2",
  splitted: "flex flex-col gap-2.5",
  flush: "divide-y divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800",
  minimal: "flex flex-col gap-1 border-0 bg-transparent divide-y-0",
};

const VARIANT_ITEM: Record<AccordionVariant, string> = {
  default: "bg-white dark:bg-zinc-900",
  bordered: "bg-white dark:bg-zinc-900",
  separated:
    "rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900",
  splitted:
    "rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs",
  flush: "bg-transparent",
  minimal: "bg-transparent border-0 rounded-lg hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors",
};

// ── Panel ─────────────────────────────────────────────────────────────────────

function Panel({
  item,
  open,
  onToggle,
  onTriggerKeyDown,
  size = "md",
  variant = "default",
  chevronPosition,
  keepMounted = true,
  headingId,
  panelId,
}: {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
  onTriggerKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  size?: AccordionProps["size"];
  variant?: AccordionVariant;
  chevronPosition?: "left" | "right";
  keepMounted?: boolean;
  headingId: string;
  panelId: string;
}) {
  const s = SIZE[size ?? "md"];
  const Icon = item.icon;
  const isLeftChevron = chevronPosition === "left" || !!item.actions;
  const shouldMountContent = open || (item.keepMounted ?? keepMounted);

  const chevronEl = (
    <ChevronDown
      size={s.chevron}
      className={twMerge(
        "shrink-0 text-zinc-400 transition-transform duration-200",
        isLeftChevron
          ? open ? "rotate-0" : "-rotate-90"
          : open ? "rotate-180" : "rotate-0",
      )}
      aria-hidden="true"
    />
  );

  return (
    <div className={twMerge(VARIANT_ITEM[variant], item.className)}>
      {/* Trigger & Header */}
      {item.actions ? (
        <div
          id={headingId}
          data-component-id={item.componentId ?? `erp.accordion.item-${item.id}`}
          data-accordion-trigger="true"
          role="button"
          tabIndex={item.disabled ? -1 : 0}
          aria-expanded={open}
          aria-controls={panelId}
          aria-disabled={item.disabled || undefined}
          onClick={item.disabled ? undefined : onToggle}
          onKeyDown={(e) => {
            if (!item.disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onToggle();
              return;
            }
            onTriggerKeyDown?.(e);
          }}
          className={twMerge(
            "flex w-full items-center justify-between gap-3 text-left transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-inset",
            s.trigger,
            open
              ? "text-zinc-900 dark:text-zinc-50 border-b border-zinc-200/70 dark:border-zinc-800/80"
              : "text-zinc-700 dark:text-zinc-200",
            item.disabled
              ? "cursor-not-allowed opacity-40"
              : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {chevronEl}
            {Icon && (
              <span
                className={twMerge(
                  "shrink-0 text-zinc-400 dark:text-zinc-500",
                  item.iconClassName,
                )}
              >
                <Icon size={s.icon} strokeWidth={1.75} />
              </span>
            )}
            <div className="flex-1 min-w-0">{item.title}</div>
            {item.badge !== undefined && (
              <span
                className={twMerge(
                  "shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-px text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 leading-none",
                  item.badgeClassName,
                )}
              >
                {item.badge}
              </span>
            )}
            {item.subtitle && !open && (
              <span className="shrink-0 text-xs text-zinc-400 truncate max-w-[12rem]">
                {item.subtitle}
              </span>
            )}
          </div>

          <div
            className="shrink-0 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {item.actions}
          </div>
        </div>
      ) : (
        <button
          data-component-id={item.componentId ?? `erp.accordion.item-${item.id}`}
          data-accordion-trigger="true"
          type="button"
          id={headingId}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={item.disabled}
          onClick={onToggle}
          onKeyDown={onTriggerKeyDown}
          className={twMerge(
            "flex w-full items-center text-left transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-inset",
            s.trigger,
            open
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 dark:text-zinc-200",
            item.disabled
              ? "cursor-not-allowed opacity-40"
              : variant === "flush"
                ? "cursor-pointer hover:underline"
                : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800",
          )}
        >
          {isLeftChevron && chevronEl}
          {Icon && (
            <span
              className={twMerge(
                "shrink-0 text-zinc-400 dark:text-zinc-500",
                item.iconClassName,
              )}
            >
              <Icon size={s.icon} strokeWidth={1.75} />
            </span>
          )}
          <span className="flex-1 font-medium leading-snug min-w-0">{item.title}</span>
          {item.badge !== undefined && (
            <span
              className={twMerge(
                "ml-auto shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-px text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 leading-none",
                item.badgeClassName,
              )}
            >
              {item.badge}
            </span>
          )}
          {item.subtitle && !open && (
            <span className="ml-2 shrink-0 text-xs text-zinc-400 truncate max-w-[12rem]">
              {item.subtitle}
            </span>
          )}
          {!isLeftChevron && (
            <ChevronDown
              size={s.chevron}
              className={twMerge(
                "shrink-0 text-zinc-400 transition-transform duration-200",
                item.badge !== undefined ? "ml-2" : "ml-auto",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          )}
        </button>
      )}

      {/* Content (CSS grid animation) */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!open && !shouldMountContent}
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {shouldMountContent && (
            <div
              className={twMerge(
                "text-zinc-600 dark:text-zinc-400 leading-relaxed",
                item.contentClassName ?? s.content,
              )}
            >
              {item.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Accordion (main export) ───────────────────────────────────────────────────

export default function Accordion({
  items: rawItems,
  multiple = false,
  openIds,
  onToggle: onToggleProp,
  variant = "default",
  chevronPosition = "right",
  size = "md",
  keepMounted = true,
  className,
  componentId,
  hideIfDenied = true,
}: AccordionProps) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const items = useMemo(() => {
    return rawItems
      .filter((item) => {
        const allowed = !item.componentId || canAccess(item.componentId);
        if (!allowed && item.hideIfDenied !== false) return false;
        return true;
      })
      .map((item) => {
        const allowed = !item.componentId || canAccess(item.componentId);
        return {
          ...item,
          disabled: Boolean(item.disabled || !allowed),
        };
      });
  }, [rawItems, canAccess]);

  const [openSet, setOpenSet] = useState<Set<string | number>>(() => {
    const init = new Set<string | number>();
    rawItems.forEach((item, i) => {
      if (item.defaultOpen) init.add(item.id ?? i);
    });
    return init;
  });

  if (!hasRootPermission && hideIfDenied) return null;

  const isControlled = openIds !== undefined;

  function toggle(id: string | number) {
    if (!hasRootPermission) return;
    if (onToggleProp) {
      onToggleProp(id);
    }
    if (!isControlled) {
      setOpenSet((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!multiple) next.clear();
          next.add(id);
        }
        return next;
      });
    }
  }

  // WAI-ARIA Accordion keyboard navigation (ArrowDown, ArrowUp, Home, End)
  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const container = rootRef.current;
    if (!container) return;

    const triggers = Array.from(
      container.querySelectorAll<HTMLElement>('[data-accordion-trigger="true"]:not([disabled]):not([aria-disabled="true"])')
    );
    const currentIndex = triggers.indexOf(e.currentTarget);
    if (currentIndex === -1 || triggers.length === 0) return;

    e.preventDefault();
    let nextIndex = currentIndex;
    if (e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % triggers.length;
    } else if (e.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = triggers.length - 1;
    }
    triggers[nextIndex]?.focus();
  }

  return (
    <div
      ref={rootRef}
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(VARIANT_WRAP[variant], !hasRootPermission && "opacity-50 pointer-events-none", className)}
    >
      {items.map((item, i) => {
        const id = item.id ?? i;
        const isOpen = isControlled ? openIds.includes(id) : openSet.has(id);

        return (
          <Panel
            key={id}
            item={item}
            open={isOpen}
            onToggle={() => !item.disabled && toggle(id)}
            onTriggerKeyDown={handleTriggerKeyDown}
            size={size}
            variant={variant}
            chevronPosition={chevronPosition}
            keepMounted={keepMounted}
            headingId={`${baseId}-h-${i}`}
            panelId={`${baseId}-p-${i}`}
          />
        );
      })}
    </div>
  );
}

// ── MinimizavelGroup (Variante compacta para grupos) ──────────────────────────

export type MinimizavelGroupProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

export function MinimizavelGroup({
  title,
  subtitle,
  badge,
  defaultOpen = true,
  open: controlledOpen,
  onToggle,
  children,
  className,
  triggerClassName,
  contentClassName,
  componentId,
  hideIfDenied = true,
}: MinimizavelGroupProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  const handleToggle = () => {
    if (!hasPermission) return;
    const next = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onToggle?.(next);
  };

  return (
    <div
      data-component-id={componentId}
      className={twMerge("group/minimizavel flex flex-col transition-all", !hasPermission && "opacity-50 pointer-events-none", className)}
    >
      <button
        data-component-id={componentId ? `${componentId}.trigger` : "erp.accordion.minimizavel-trigger"}
        type="button"
        disabled={!hasPermission}
        onClick={handleToggle}
        className={twMerge(
          "flex w-full items-center justify-between py-1.5 px-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 select-none transition-colors",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            size={14}
            className={twMerge(
              "shrink-0 text-slate-400 transition-transform duration-200",
              isOpen ? "rotate-0" : "-rotate-90"
            )}
          />
          <span className="truncate">{title}</span>
          {badge}
        </div>
        {subtitle && <span className="text-[11px] text-slate-400 font-normal">{subtitle}</span>}
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className={twMerge("pt-1", contentClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
