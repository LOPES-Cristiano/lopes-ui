"use client";

import React, { useRef, useState, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { Send, Paperclip, Smile, X, Mic, Reply } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComposerVariant = "minimal" | "toolbar";

export type ComposerReplyTo = {
  senderName: string;
  content: string;
  onCancel: () => void;
};

/** A suggestabl entity e.g. { ref_id: "VENDA123", label: "Venda #123 – Loja Centro" } */
export type EntitySuggestion = {
  ref_id: string;
  label: string;
  meta?: string;
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
  /**
   * If provided, typing @ will trigger a suggestion dropdown
   * from this list (filtered by what the user types after @).
   */
  entitySuggestions?: EntitySuggestion[];
  className?: string;
  componentId?: string;
};

// ── Detect @-mention query ────────────────────────────────────────────────────

/** Returns the current @query being typed, or null if cursor isn't inside one */
function getMentionQuery(text: string, cursor: number): string | null {
  const before = text.slice(0, cursor);
  const match = before.match(/@([A-Za-z0-9]*)$/);
  return match ? match[1] : null;
}

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
  entitySuggestions = [],
  className,
  componentId,
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;

  // Filtered suggestions
  const filtered = mentionQuery !== null && entitySuggestions.length > 0
    ? entitySuggestions.filter((s) =>
        s.ref_id.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        s.label.toLowerCase().includes(mentionQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const showSuggestions = filtered.length > 0;
  const clampedActiveIdx = filtered.length > 0 ? Math.min(activeIdx, filtered.length - 1) : 0;

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setValue("");
    setMentionQuery(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const pickSuggestion = useCallback((suggestion: EntitySuggestion) => {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? value.length;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursor);
    const inserted = `@${suggestion.ref_id} `;
    const next = before + inserted + after;
    setValue(next);
    setMentionQuery(null);
    // Restore focus + move cursor
    requestAnimationFrame(() => {
      el.focus();
      const pos = (before + inserted).length;
      el.setSelectionRange(pos, pos);
    });
  }, [value, mentionStart]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        pickSuggestion(filtered[clampedActiveIdx]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);

    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;

    // Detect @-mention
    const cursor = el.selectionStart ?? next.length;
    const query = getMentionQuery(next, cursor);
    if (query !== null) {
      // Find the start of the @ in the text
      const before = next.slice(0, cursor);
      const atIdx = before.lastIndexOf("@");
      setMentionStart(atIdx);
      setMentionQuery(query);
    } else {
      setMentionQuery(null);
    }
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge("relative flex flex-col bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800", className)}
    >
      {/* @-mention suggestions popover */}
      {showSuggestions && (
        <div
          className={clsx(
            "absolute bottom-full left-2 right-2 mb-1 z-50",
            "rounded-xl border border-zinc-200 dark:border-zinc-700",
            "bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-900/15",
            "overflow-hidden",
          )}
          role="listbox"
          aria-label="Sugestões de entidade"
        >
          <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Objetos correspondentes
            </span>
          </div>
          {filtered.map((s, i) => (
            <button
              key={s.ref_id}
              type="button"
              role="option"
              aria-selected={i === clampedActiveIdx}
              onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                i === clampedActiveIdx
                  ? "bg-indigo-50 dark:bg-indigo-900/30"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800",
              )}
            >
              <code className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                @{s.ref_id}
              </code>
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">{s.label}</span>
              {s.meta && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">{s.meta}</span>
              )}
            </button>
          ))}
          <div className="px-3 py-1 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[9px] text-zinc-300 dark:text-zinc-600">
              ↑↓ navegar · Enter confirmar · Esc fechar
            </span>
          </div>
        </div>
      )}

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
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-autocomplete={entitySuggestions.length > 0 ? "list" : undefined}
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

