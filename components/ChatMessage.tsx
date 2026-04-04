"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { Check, CheckCheck, AlertCircle, Clock, Paperclip, Play, File } from "lucide-react";
import Avatar from "@/components/Avatar";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
export type MessageType   = "text" | "image" | "audio" | "attachment" | "typing";

export type MessageReaction = {
  emoji: string;
  count: number;
  reacted?: boolean;
};

export type MessageReplyTo = {
  senderName: string;
  content: string;
};

export type MessageAttachment = {
  name: string;
  size?: string;
};

export type ChatMessageProps = {
  content?: string;
  senderName?: string;
  avatarSrc?: string;
  /** true = current user's message (right-aligned, indigo bubble) */
  mine?: boolean;
  timestamp?: string;
  status?: MessageStatus;
  type?: MessageType;
  replyTo?: MessageReplyTo;
  reactions?: MessageReaction[];
  attachment?: MessageAttachment;
  imageUrl?: string;
  imageAlt?: string;
  audioDuration?: string;
  /**
   * Show avatar + sender name.
   * Set false for consecutive messages from the same sender.
   * @default true
   */
  showAvatar?: boolean;
  onReact?: (emoji: string) => void;
  className?: string;
  componentId?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const WAVEFORM_HEIGHTS = [8, 14, 20, 12, 18, 22, 10, 16, 24, 14, 20, 8, 18, 12, 22, 16, 10, 20, 14, 8];

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === "sending")   return <Clock       size={12} className="text-indigo-300" />;
  if (status === "sent")      return <Check       size={12} className="text-indigo-300" />;
  if (status === "delivered") return <CheckCheck  size={12} className="text-indigo-300" />;
  if (status === "read")      return <CheckCheck  size={12} className="text-indigo-100" />;
  if (status === "failed")    return <AlertCircle size={12} className="text-red-400" />;
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatMessage({
  content,
  senderName,
  avatarSrc,
  mine = false,
  timestamp,
  status,
  type = "text",
  replyTo,
  reactions,
  attachment,
  imageUrl,
  imageAlt,
  audioDuration,
  showAvatar = true,
  onReact,
  className,
  componentId,
}: ChatMessageProps) {

  // ── Typing indicator ──────────────────────────────────────────────────────
  if (type === "typing") {
    return (
      <div className={twMerge("flex items-end gap-2", className)}>
        {showAvatar
          ? <Avatar name={senderName} src={avatarSrc} size="sm" className="shrink-0" />
          : <div className="w-8 shrink-0" />
        }
        <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3.5">
          <div className="flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isMine  = mine;
  const hasMedia = type === "image" || type === "attachment" || type === "audio";

  // ── Bubble styles ─────────────────────────────────────────────────────────
  const bubbleCls = isMine
    ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
    : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-bl-sm";

  const timestampCls = isMine ? "text-indigo-200" : "text-zinc-400";

  const replyBgCls = isMine
    ? "bg-indigo-700 border-indigo-400 text-indigo-100"
    : "bg-zinc-50 dark:bg-zinc-700 border-indigo-400 text-zinc-500 dark:text-zinc-300";

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex items-end gap-2 group",
        isMine ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar / spacer */}
      {showAvatar
        ? <Avatar name={senderName} src={avatarSrc} size="sm" className="shrink-0" />
        : <div className="w-8 shrink-0" />
      }

      {/* Column: name + bubble + reactions */}
      <div className={twMerge("flex flex-col gap-1 max-w-[75%]", isMine ? "items-end" : "items-start")}>

        {/* Sender name — others only, first in group */}
        {!isMine && showAvatar && senderName && (
          <span className="text-xs font-semibold text-zinc-500 ml-1">{senderName}</span>
        )}

        {/* Bubble */}
        <div className={bubbleCls}>

          {/* Reply quote */}
          {replyTo && (
            <div className={twMerge(
              "mx-2 mt-2 px-2.5 py-1.5 rounded-xl text-xs border-l-2",
              replyBgCls
            )}>
              <p className="font-semibold mb-0.5">{replyTo.senderName}</p>
              <p className="line-clamp-2 opacity-90">{replyTo.content}</p>
            </div>
          )}

          {/* Image */}
          {type === "image" && imageUrl && (
            <div className={twMerge("overflow-hidden rounded-xl", replyTo ? "mt-1.5 mx-2" : "")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imageAlt ?? "imagem"}
                className="max-w-[220px] max-h-[220px] object-cover block"
              />
            </div>
          )}

          {/* Attachment */}
          {type === "attachment" && attachment && (
            <div className="flex items-center gap-3 px-3.5 py-2.5 min-w-[210px]">
              <div className={twMerge(
                "flex items-center justify-center w-9 h-9 rounded-xl shrink-0",
                isMine ? "bg-indigo-500" : "bg-zinc-100 dark:bg-zinc-700"
              )}>
                <File size={16} className={isMine ? "text-white" : "text-zinc-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                {attachment.size && (
                  <p className={twMerge("text-xs", isMine ? "text-indigo-200" : "text-zinc-400")}>
                    {attachment.size}
                  </p>
                )}
              </div>
              <Paperclip size={14} className={isMine ? "text-indigo-200" : "text-zinc-400"} />
            </div>
          )}

          {/* Audio */}
          {type === "audio" && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 min-w-[200px]">
              <button className={twMerge(
                "flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors",
                isMine ? "bg-indigo-500 hover:bg-indigo-400" : "bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600"
              )}>
                <Play size={14} fill="currentColor" className={isMine ? "text-white" : "text-zinc-600"} />
              </button>
              <div className="flex items-end gap-0.5 h-6 flex-1">
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className={twMerge("w-1 rounded-full", isMine ? "bg-indigo-300" : "bg-zinc-300")}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              {audioDuration && (
                <span className={twMerge("text-xs shrink-0", isMine ? "text-indigo-200" : "text-zinc-400")}>
                  {audioDuration}
                </span>
              )}
            </div>
          )}

          {/* Text */}
          {content && (
            <p className={twMerge(
              "text-sm px-3.5 leading-relaxed whitespace-pre-wrap break-words",
              hasMedia || replyTo ? "pt-1.5 pb-1" : "py-2.5"
            )}>
              {content}
            </p>
          )}

          {/* Timestamp + status */}
          {(timestamp || (isMine && status)) && (
            <div className="flex items-center justify-end gap-1 px-3 pb-2">
              {timestamp && (
                <span className={twMerge("text-[10px]", timestampCls)}>{timestamp}</span>
              )}
              {isMine && status && <StatusIcon status={status} />}
            </div>
          )}
        </div>

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className={twMerge("flex flex-wrap gap-1 px-1", isMine ? "justify-end" : "justify-start")}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact?.(r.emoji)}
                className={twMerge(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  r.reacted
                      ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-300"
                )}
              >
                <span>{r.emoji}</span>
                <span className="font-medium">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
