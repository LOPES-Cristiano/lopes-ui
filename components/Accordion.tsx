"use client";

import React, { useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AccordionItem = {
  id?: string;
  title: string;
  /** Sub-title shown to the right of the title (collapsed width) */
  subtitle?: string;
  /** Lucide icon before the title */
  icon?: LucideIcon;
  /** Badge / chip shown after the title */
  badge?: string | number;
  content: React.ReactNode;
  disabled?: boolean;
  /** Open by default */
  defaultOpen?: boolean;
};

export type AccordionVariant = "default" | "bordered" | "separated";

export type AccordionProps = {
  items: AccordionItem[];
  /** Allow multiple panels open simultaneously */
  multiple?: boolean;
  variant?: AccordionVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Access-control identifier emitted on the root wrapper */
  componentId?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE = {
  sm: { trigger: "px-3 py-2.5 text-sm gap-2",   content: "px-3 pb-3 text-sm",   icon: 14, chevron: 13 },
  md: { trigger: "px-4 py-3 text-sm gap-2.5",   content: "px-4 pb-4 text-sm",   icon: 16, chevron: 14 },
  lg: { trigger: "px-5 py-4 text-base gap-3",   content: "px-5 pb-5 text-base", icon: 18, chevron: 16 },
} as const;

const VARIANT_WRAP: Record<AccordionVariant, string> = {
  default:   "divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden",
  bordered:  "divide-y divide-zinc-200 dark:divide-zinc-700",
  separated: "flex flex-col gap-2",
};

const VARIANT_ITEM: Record<AccordionVariant, string> = {
  default:   "bg-white dark:bg-zinc-900",
  bordered:  "bg-white dark:bg-zinc-900",
  separated: "rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900",
};

// ── Panel ─────────────────────────────────────────────────────────────────────

function Panel({
  item,
  open,
  onToggle,
  size = "md",
  variant = "default",
  headingId,
  panelId,
}: {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
  size?: AccordionProps["size"];
  variant?: AccordionVariant;
  headingId: string;
  panelId: string;
}) {
  const s = SIZE[size ?? "md"];
  const Icon = item.icon;

  return (
    <div className={VARIANT_ITEM[variant]}>
      {/* Trigger */}
      <button
        type="button"
        id={headingId}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={item.disabled}
        onClick={onToggle}
        className={twMerge(
          "flex w-full items-center text-left transition-colors duration-150 select-none",
          s.trigger,
          open ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-200",
          item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800",
        )}
      >
        {Icon && (
          <span className="shrink-0 text-zinc-400 dark:text-zinc-500">
            <Icon size={s.icon} strokeWidth={1.75} />
          </span>
        )}
        <span className="flex-1 font-medium leading-snug">{item.title}</span>
        {item.badge !== undefined && (
          <span className="ml-auto shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-px text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 leading-none">
            {item.badge}
          </span>
        )}
        {item.subtitle && !open && (
          <span className="ml-2 shrink-0 text-xs text-zinc-400 truncate max-w-[8rem]">{item.subtitle}</span>
        )}
        <ChevronDown
          size={s.chevron}
          className={twMerge(
            "ml-auto shrink-0 text-zinc-400 transition-transform duration-200",
            open && "rotate-180",
            item.badge !== undefined && "ml-2",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Content (CSS grid animation) */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className={twMerge("text-zinc-600 dark:text-zinc-400 leading-relaxed", s.content)}>
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Accordion (main export) ───────────────────────────────────────────────────

export default function Accordion({
  items,
  multiple = false,
  variant = "default",
  size = "md",
  className,
  componentId,
}: AccordionProps) {
  const baseId = useId();

  const [openSet, setOpenSet] = useState<Set<number>>(() => {
    const init = new Set<number>();
    items.forEach((item, i) => { if (item.defaultOpen) init.add(i); });
    return init;
  });

  function toggle(i: number) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        if (!multiple) next.clear();
        next.add(i);
      }
      return next;
    });
  }

  return (
    <div
      className={twMerge(VARIANT_WRAP[variant], className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {items.map((item, i) => (
        <Panel
          key={item.id ?? i}
          item={item}
          open={openSet.has(i)}
          onToggle={() => !item.disabled && toggle(i)}
          size={size}
          variant={variant}
          headingId={`${baseId}-h-${i}`}
          panelId={`${baseId}-p-${i}`}
        />
      ))}
    </div>
  );
}
