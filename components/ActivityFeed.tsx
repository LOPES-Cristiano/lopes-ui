"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import type { LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActivityEventColor =
  | "zinc"
  | "indigo"
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "violet"
  | "pink"
  | "teal";

export type ActivityEvent = {
  id: string;
  title: string;
  description?: string;
  /** LucideIcon component */
  icon?: LucideIcon;
  color?: ActivityEventColor;
  /** Actor who triggered the event */
  actor?: {
    name: string;
    /** Initials — shown when no avatarUrl */
    initials?: string;
    avatarUrl?: string;
  };
  timestamp: Date | string;
};

export type ActivityFeedProps = {
  events: ActivityEvent[];
  loading?: boolean;
  /** Max-height with overflow-y-auto */
  maxHeight?: string;
  /** Label for the load-more button */
  loadMoreLabel?: string;
  onLoadMore?: () => void;
  className?: string;
  componentId?: string;
};

// ── Color maps ────────────────────────────────────────────────────────────────

const DOT_BG: Record<ActivityEventColor, string> = {
  zinc:    "bg-zinc-400 dark:bg-zinc-500",
  indigo:  "bg-indigo-500 dark:bg-indigo-400",
  blue:    "bg-blue-500 dark:bg-blue-400",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  amber:   "bg-amber-400 dark:bg-amber-300",
  red:     "bg-red-500 dark:bg-red-400",
  violet:  "bg-violet-500 dark:bg-violet-400",
  pink:    "bg-pink-500 dark:bg-pink-400",
  teal:    "bg-teal-500 dark:bg-teal-400",
};

const ICON_BG: Record<ActivityEventColor, string> = {
  zinc:    "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
  indigo:  "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
  blue:    "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  amber:   "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
  red:     "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400",
  violet:  "bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
  pink:    "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400",
  teal:    "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400",
};

const ACTOR_BG: Record<ActivityEventColor, string> = {
  zinc:    "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
  indigo:  "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300",
  blue:    "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300",
  emerald: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300",
  amber:   "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300",
  red:     "bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300",
  violet:  "bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300",
  pink:    "bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300",
  teal:    "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300",
};

// ── Relative time (pt-BR, no deps) ────────────────────────────────────────────

function relativeTime(ts: Date | string): string {
  const date = ts instanceof Date ? ts : new Date(ts);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "agora mesmo";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "ontem";
  if (diffD < 7) return `há ${diffD} dias`;
  if (diffD < 30) return `há ${Math.floor(diffD / 7)} sem.`;
  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `há ${diffM} mes${diffM > 1 ? "es" : ""}`;
  return `há ${Math.floor(diffM / 12)} ano${Math.floor(diffM / 12) > 1 ? "s" : ""}`;
}

// ── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="w-px flex-1 mt-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="pb-6 flex-1 min-w-0 pt-1 space-y-2">
        <div className="h-3.5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-64 rounded bg-zinc-100 dark:bg-zinc-800/70" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ActivityFeed({
  events,
  loading = false,
  maxHeight,
  loadMoreLabel = "Carregar mais",
  onLoadMore,
  className,
  componentId,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div
        className={twMerge("py-2", className)}
        data-component-id={componentId}
      >
        {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  return (
    <div
      className={twMerge("py-2", maxHeight && "overflow-y-auto", className)}
      style={maxHeight ? { maxHeight } : undefined}
      data-component-id={componentId}
    >
      {events.map((event, idx) => {
        const color = event.color ?? "zinc";
        const isLast = idx === events.length - 1;
        const Icon = event.icon;

        return (
          <div key={event.id} className="flex gap-3 sm:gap-4">
            {/* Left column — dot/icon + line */}
            <div className="flex flex-col items-center">
              {Icon ? (
                <div
                  className={twMerge(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    ICON_BG[color]
                  )}
                >
                  <Icon size={15} />
                </div>
              ) : (
                <div
                  className={twMerge(
                    "w-2.5 h-2.5 rounded-full mt-[11px] shrink-0",
                    DOT_BG[color]
                  )}
                />
              )}
              {!isLast && (
                <div className="w-px flex-1 mt-1 bg-zinc-200 dark:bg-zinc-700" />
              )}
            </div>

            {/* Right column — content */}
            <div className={twMerge("min-w-0 flex-1", !isLast ? "pb-5" : "pb-1")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                  {event.title}
                </p>
                <time
                  dateTime={
                    event.timestamp instanceof Date
                      ? event.timestamp.toISOString()
                      : event.timestamp
                  }
                  className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap mt-0.5 shrink-0"
                  suppressHydrationWarning
                >
                  {relativeTime(event.timestamp)}
                </time>
              </div>

              {event.description && (
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {event.description}
                </p>
              )}

              {event.actor && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {event.actor.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.actor.avatarUrl}
                      alt={event.actor.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className={twMerge(
                        "w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center",
                        ACTOR_BG[color]
                      )}
                    >
                      {event.actor.initials ??
                        event.actor.name
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {event.actor.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {onLoadMore && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={onLoadMore}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1"
          >
            {loadMoreLabel}
          </button>
        </div>
      )}
    </div>
  );
}
