"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { Paperclip, Star, StarOff } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type InboxItem = {
  id: string;
  /** Sender display name */
  from: string;
  /** Subject line */
  subject: string;
  /** Preview snippet (first line of body) */
  preview?: string;
  /** ISO date string or Date object */
  date: string | Date;
  /** Whether this message is unread */
  unread?: boolean;
  /** Whether this message is starred */
  starred?: boolean;
  /** Whether there are attachments */
  hasAttachment?: boolean;
  /** Optional avatar URL; falls back to initials */
  avatarUrl?: string;
};

export type InboxListProps = {
  items: InboxItem[];
  /** Currently selected item id */
  selectedId?: string;
  onSelect?: (id: string) => void;
  onToggleStar?: (id: string) => void;
  /** Loading skeleton count */
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(raw: string | Date): string {
  const d = typeof raw === "string" ? new Date(raw) : raw;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return d.toLocaleDateString("pt-BR", { weekday: "short" });
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="shrink-0 w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="w-1/3 h-3 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="w-2/3 h-2.5 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="w-full h-2 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InboxList({
  items,
  selectedId,
  onSelect,
  onToggleStar,
  loading = false,
  skeletonCount = 6,
  className,
}: InboxListProps) {
  if (loading) {
    return (
      <div className={twMerge(clsx("divide-y divide-zinc-100 dark:divide-zinc-800", className))}>
        {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={twMerge(clsx("flex flex-col items-center justify-center py-16 text-zinc-400", className))}>
        <span className="text-sm">Nenhuma mensagem</span>
      </div>
    );
  }

  return (
    <ul
      className={twMerge(clsx("divide-y divide-zinc-100 dark:divide-zinc-800", className))}
      role="listbox"
      aria-label="Caixa de entrada"
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <li
            key={item.id}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect?.(item.id)}
            className={clsx(
              "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
              isSelected
                ? "bg-blue-50 dark:bg-blue-950/30"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
            )}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-0.5">
              {item.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.avatarUrl}
                  alt={item.from}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 select-none">
                  {initials(item.from)}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={clsx(
                    "text-sm truncate",
                    item.unread ? "font-semibold text-zinc-900 dark:text-zinc-100" : "font-normal text-zinc-700 dark:text-zinc-300",
                  )}
                >
                  {item.from}
                </span>
                <span suppressHydrationWarning className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDate(item.date)}
                </span>
              </div>
              <div
                className={clsx(
                  "text-sm truncate",
                  item.unread ? "font-medium text-zinc-800 dark:text-zinc-200" : "text-zinc-600 dark:text-zinc-400",
                )}
              >
                {item.subject}
              </div>
              {item.preview && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                  {item.preview}
                </p>
              )}
              {/* Badges row */}
              {(item.hasAttachment || item.unread) && (
                <div className="flex items-center gap-1.5 mt-1">
                  {item.unread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-label="Não lido" />
                  )}
                  {item.hasAttachment && (
                    <Paperclip className="w-3 h-3 text-zinc-400" aria-label="Anexo" />
                  )}
                </div>
              )}
            </div>

            {/* Star */}
            {onToggleStar && (
              <button
                type="button"
                aria-label={item.starred ? "Remover estrela" : "Marcar com estrela"}
                onClick={(e) => { e.stopPropagation(); onToggleStar(item.id); }}
                className="shrink-0 mt-0.5 p-1 rounded transition-colors text-zinc-300 hover:text-amber-400 dark:text-zinc-600 dark:hover:text-amber-400"
              >
                {item.starred
                  ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  : <StarOff className="w-4 h-4" />
                }
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
