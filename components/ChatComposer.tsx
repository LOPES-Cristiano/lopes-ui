"use client";

import React, { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Send, Paperclip, Smile, X, Mic, Reply } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComposerVariant = "minimal" | "toolbar";

export type ComposerReplyTo = {
  senderName: string;
  content: string;
  onCancel: () => void;
};

export type ChatComposerProps = {
  placeholder?: string;
  onSend?: (value: string) => void;
  onAttach?: () => void;
  onEmoji?: () => void;
  onVoice?: () => void;
  replyTo?: ComposerReplyTo;
  disabled?: boolean;
  /**
   * "toolbar" (default) — shows attach + emoji left of textarea
   * "minimal" — just textarea + send/mic
   */
  variant?: ComposerVariant;
  className?: string;
  componentId?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatComposer({
  placeholder = "Escreva uma mensagem…",
  onSend,
  onAttach,
  onEmoji,
  onVoice,
  replyTo,
  disabled = false,
  variant = "toolbar",
  className,
  componentId,
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge("flex flex-col bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800", className)}
    >
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-start gap-2 px-3 pt-2.5 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
          <Reply size={14} className="text-indigo-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 border-l-2 border-indigo-400 pl-2">
            <p className="text-xs font-semibold text-indigo-600 truncate">{replyTo.senderName}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={replyTo.onCancel}
            className="p-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label="Cancelar resposta"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-1.5 px-2.5 py-2.5">
        {/* Left toolbar (attach + emoji) */}
        {variant === "toolbar" && (
          <div className="flex gap-0.5 shrink-0 pb-0.5">
            {onAttach && (
              <button
                onClick={onAttach}
                disabled={disabled}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-40"
                aria-label="Anexar arquivo"
              >
                <Paperclip size={18} />
              </button>
            )}
            {onEmoji && (
              <button
                onClick={onEmoji}
                disabled={disabled}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-40"
                aria-label="Inserir emoji"
              >
                <Smile size={18} />
              </button>
            )}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={twMerge(
            "flex-1 resize-none rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2",
            "text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300",
            "min-h-[38px] max-h-[120px] transition-colors leading-relaxed",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Right: send or mic */}
        <div className="shrink-0 pb-0.5">
          {canSend ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="flex items-center justify-center p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40"
              aria-label="Enviar mensagem"
            >
              <Send size={16} />
            </button>
          ) : onVoice ? (
            <button
              onClick={onVoice}
              disabled={disabled}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-40"
              aria-label="Gravar áudio"
            >
              <Mic size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
