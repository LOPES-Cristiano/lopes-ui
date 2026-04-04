"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { BellOff, Pin } from "lucide-react";
import Avatar from "@/components/Avatar";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChatConversationItemProps = {
  name: string;
  avatarSrc?: string;
  lastMessage?: string;
  timestamp?: string;
  /** Number of unread messages */
  unread?: number;
  /** Show online dot on avatar */
  online?: boolean;
  /** Highlighted active state */
  active?: boolean;
  /** Muted conversation (bell icon) */
  muted?: boolean;
  /** Pinned conversation (pin icon) */
  pinned?: boolean;
  onClick?: () => void;
  className?: string;
  componentId?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatConversationItem({
  name,
  avatarSrc,
  lastMessage,
  timestamp,
  unread = 0,
  online,
  active = false,
  muted = false,
  pinned = false,
  onClick,
  className,
  componentId,
}: ChatConversationItemProps) {
  const hasUnread = unread > 0;

  return (
    <button
      onClick={onClick}
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
        active
          ? "bg-indigo-50 hover:bg-indigo-100"
          : "hover:bg-zinc-50",
        className
      )}
    >
      <Avatar
        name={name}
        src={avatarSrc}
        size="md"
        status={online ? "online" : undefined}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0">
        {/* Row 1: Name + meta icons + timestamp */}
        <div className="flex items-center justify-between gap-1">
          <span className={twMerge(
            "text-sm font-semibold truncate",
            active ? "text-indigo-700" : "text-zinc-800"
          )}>
            {name}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {pinned && <Pin size={11} className="text-zinc-400" />}
            {muted  && <BellOff size={11} className="text-zinc-400" />}
            {timestamp && (
              <span className={twMerge(
                "text-[11px]",
                hasUnread ? "text-indigo-600 font-semibold" : "text-zinc-400"
              )}>
                {timestamp}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Last message preview + unread badge */}
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className={twMerge(
            "text-xs truncate leading-relaxed",
            hasUnread ? "text-zinc-700 font-medium" : "text-zinc-400"
          )}>
            {lastMessage ?? ""}
          </p>
          {hasUnread && (
            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
