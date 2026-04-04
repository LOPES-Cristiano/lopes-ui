"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimelineColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type TimelineLayout = "left" | "right" | "alternate";
export type TimelineSize   = "sm" | "md" | "lg";
export type ConnectorStyle = "solid" | "dashed" | "dotted";

export type TimelineItem = {
  id?: string;
  /** Main heading of the event */
  title: React.ReactNode;
  /** Body text / extra detail */
  description?: React.ReactNode;
  /** Date / time label */
  date?: React.ReactNode;
  /** Custom Lucide icon for the dot */
  icon?: LucideIcon;
  /** Dot / connector accent color */
  color?: TimelineColor;
  /** Optional badge/tag label */
  badge?: string;
};

export type TimelineProps = {
  items: TimelineItem[];
  layout?: TimelineLayout;
  size?: TimelineSize;
  connectorStyle?: ConnectorStyle;
  className?: string;
  componentId?: string;
};

// ── Style maps ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<TimelineColor, { dot: string; ring: string; badge: string }> = {
  default: {
    dot:   "bg-zinc-400 border-zinc-400",
    ring:  "ring-zinc-100 dark:ring-zinc-800",
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  },
  primary: {
    dot:   "bg-indigo-500 border-indigo-500",
    ring:  "ring-indigo-100 dark:ring-indigo-900/50",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  success: {
    dot:   "bg-emerald-500 border-emerald-500",
    ring:  "ring-emerald-100 dark:ring-emerald-900/50",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  warning: {
    dot:   "bg-amber-400 border-amber-400",
    ring:  "ring-amber-100 dark:ring-amber-900/50",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  danger: {
    dot:   "bg-red-500 border-red-500",
    ring:  "ring-red-100 dark:ring-red-900/50",
    badge: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  info: {
    dot:   "bg-sky-500 border-sky-500",
    ring:  "ring-sky-100 dark:ring-sky-900/50",
    badge: "bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300",
  },
};

const CONNECTOR_STYLE: Record<ConnectorStyle, string> = {
  solid:  "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

type SizeTokens = {
  dot: string;
  icon: number;
  title: string;
  body: string;
  date: string;
  badge: string;
  gap: string;
};

const SIZE_MAP: Record<TimelineSize, SizeTokens> = {
  sm: { dot: "w-6 h-6",  icon: 12, title: "text-sm",  body: "text-xs",  date: "text-[11px]", badge: "text-[10px] px-1.5 py-0.5", gap: "gap-3"  },
  md: { dot: "w-8 h-8",  icon: 14, title: "text-sm",  body: "text-sm",  date: "text-xs",     badge: "text-xs px-2 py-0.5",        gap: "gap-4"  },
  lg: { dot: "w-10 h-10", icon: 18, title: "text-base", body: "text-sm", date: "text-sm",    badge: "text-xs px-2.5 py-1",         gap: "gap-5"  },
};

// ── Dot ───────────────────────────────────────────────────────────────────────

function Dot({
  item,
  size,
}: {
  item: TimelineItem;
  size: TimelineSize;
}) {
  const color  = item.color ?? "default";
  const c      = COLOR_MAP[color];
  const s      = SIZE_MAP[size];
  const Icon   = item.icon;

  return (
    <div
      className={twMerge(
        "shrink-0 flex items-center justify-center rounded-full z-10",
        "ring-4 border-2",
        s.dot, c.dot, c.ring,
        Icon ? "text-white" : "",
      )}
      aria-hidden="true"
    >
      {Icon && <Icon size={s.icon} />}
    </div>
  );
}

// ── Single item (left or right card) ─────────────────────────────────────────

function EventCard({
  item,
  size,
  align,
}: {
  item: TimelineItem;
  size: TimelineSize;
  align: "left" | "right";
}) {
  const s = SIZE_MAP[size];
  const color = item.color ?? "default";
  const c = COLOR_MAP[color];

  return (
    <div
      className={twMerge(
        "flex flex-col",
        align === "right" ? "items-end text-right" : "items-start text-left",
      )}
    >
      <div className="flex flex-col gap-0.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm px-4 py-3 max-w-sm w-full">
        <div className={twMerge("flex items-center gap-2", align === "right" ? "flex-row-reverse" : "")}>
          <p className={twMerge("font-semibold text-zinc-800 dark:text-zinc-200", s.title)}>
            {item.title}
          </p>
          {item.badge && (
            <span className={twMerge("rounded-full font-medium leading-none", s.badge, c.badge)}>
              {item.badge}
            </span>
          )}
        </div>
        {item.description && (
          <p className={twMerge("text-zinc-500 dark:text-zinc-400 mt-0.5", s.body)}>
            {item.description}
          </p>
        )}
        {item.date && (
          <p className={twMerge("text-zinc-400 mt-1", s.date)}>
            {item.date}
          </p>
        )}
      </div>
    </div>
  );
}

// ── SimpleCard — for left/right full-width layouts ────────────────────────────

function SimpleCard({ item, size }: { item: TimelineItem; size: TimelineSize }) {
  const s = SIZE_MAP[size];
  const color = item.color ?? "default";
  const c = COLOR_MAP[color];

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <p className={twMerge("font-semibold text-zinc-800 dark:text-zinc-200", s.title)}>
          {item.title}
        </p>
        {item.badge && (
          <span className={twMerge("rounded-full font-medium leading-none", s.badge, c.badge)}>
            {item.badge}
          </span>
        )}
      </div>
      {item.description && (
        <p className={twMerge("text-zinc-500 dark:text-zinc-400", s.body)}>{item.description}</p>
      )}
      {item.date && (
        <p className={twMerge("text-zinc-400 mt-0.5", s.date)}>{item.date}</p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Timeline({
  items,
  layout = "left",
  size = "md",
  connectorStyle = "solid",
  className,
  componentId,
}: TimelineProps) {
  const s = SIZE_MAP[size];
  const connCls = CONNECTOR_STYLE[connectorStyle];

  // ── Alternate layout ───────────────────────────────────────────────────────
  if (layout === "alternate") {
    return (
      <div
        role="list"
        className={twMerge("relative isolate", className)}
        {...(componentId ? { "data-component-id": componentId } : {})}
      >
        {/* center line */}
        <div
          className={twMerge(
            "absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-l-2 border-zinc-200 dark:border-zinc-700",
            connCls,
          )}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-8">
          {items.map((item, i) => {
            const isLeft = i % 2 === 0;

            return (
              <div key={item.id ?? i} role="listitem" className="relative flex items-center">
                {/* Left side */}
                <div className="flex-1 pr-6 flex justify-end">
                  {isLeft ? null : <EventCard item={item} size={size} align="right" />}
                </div>

                {/* Center dot */}
                <div className="shrink-0 z-10">
                  <Dot item={item} size={size} />
                </div>

                {/* Right side */}
                <div className="flex-1 pl-6">
                  {isLeft ? <EventCard item={item} size={size} align="left" /> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Left / Right layouts ───────────────────────────────────────────────────
  const isRight = layout === "right";

  return (
    <div
      role="list"
      className={twMerge("relative isolate", className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      <div className={twMerge("flex flex-col", s.gap)}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <div
              key={item.id ?? i}
              role="listitem"
              className={twMerge(
                "relative flex",
                isRight ? "flex-row-reverse" : "flex-row",
                s.gap,
              )}
            >
              {/* Dot column */}
              <div className="flex flex-col items-center">
                <Dot item={item} size={size} />
                {!isLast && (
                  <div
                    className={twMerge(
                      "flex-1 w-0 border-l-2 border-zinc-200 dark:border-zinc-700 my-1 min-h-[20px]",
                      connCls,
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
              <div className={twMerge("pb-2 flex-1", isLast && "pb-0")}>
                <SimpleCard item={item} size={size} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
