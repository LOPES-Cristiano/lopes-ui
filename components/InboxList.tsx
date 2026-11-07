"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { Paperclip, Star, StarOff } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

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
  componentId?: string;
  hideIfDenied?: boolean;
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
      <div className="shrink-0 w-9 h-9 rounded-full bg-muted" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="w-1/3 h-3 rounded bg-muted" />
        <div className="w-2/3 h-2.5 rounded bg-muted" />
        <div className="w-full h-2 rounded bg-muted/70" />
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
  componentId,
  hideIfDenied = true,
}: InboxListProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  if (loading) {
    return (
      <div
        data-component-id={componentId || undefined}
        className={twMerge(clsx("divide-y divide-border", className))}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        data-component-id={componentId || undefined}
        className={twMerge(
          clsx("flex flex-col items-center justify-center py-16 text-muted-foreground", className),
        )}
      >
        <span className="text-sm">Nenhuma mensagem</span>
      </div>
    );
  }

  return (
    <ul
      data-component-id={componentId || undefined}
      className={twMerge(clsx("divide-y divide-border", className))}
      aria-label="Caixa de entrada"
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <li
            key={item.id}
            className={clsx(
              "relative flex items-start transition-colors",
              isSelected ? "bg-primary/10" : "hover:bg-muted/50",
            )}
          >
            <button
              type="button"
              aria-current={isSelected ? "true" : undefined}
              onClick={() => onSelect?.(item.id)}
              className={clsx(
                "flex flex-1 min-w-0 items-start gap-3 px-4 py-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                onToggleStar && "pr-11",
              )}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.from}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground/80 select-none">
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
                      item.unread
                        ? "font-semibold text-foreground"
                        : "font-normal text-foreground/80",
                    )}
                  >
                    {item.from}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="shrink-0 text-xs text-muted-foreground tabular-nums"
                  >
                    {formatDate(item.date)}
                  </span>
                </div>
                <div
                  className={clsx(
                    "text-sm truncate",
                    item.unread
                      ? "font-medium text-foreground/95"
                      : "text-muted-foreground",
                  )}
                >
                  {item.subject}
                </div>
                {item.preview && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.preview}
                  </p>
                )}
                {(item.hasAttachment || item.unread) && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.unread && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        aria-label="Não lido"
                      />
                    )}
                    {item.hasAttachment && (
                      <Paperclip className="w-3 h-3 text-muted-foreground" aria-label="Anexo" />
                    )}
                  </div>
                )}
              </div>
            </button>

            {/* Sibling Star Button */}
            {onToggleStar && (
              <button
                data-component-id={`erp.inbox.star-${item.id}`}
                type="button"
                aria-label={item.starred ? "Remover estrela" : "Marcar com estrela"}
                aria-pressed={Boolean(item.starred)}
                onClick={() => onToggleStar(item.id)}
                className="absolute right-2.5 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors text-muted-foreground/60 hover:text-amber-400 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                {item.starred ? (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
