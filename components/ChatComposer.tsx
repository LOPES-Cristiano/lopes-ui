"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { Send, Paperclip, Smile, X, Mic, Reply, Zap } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComposerVariant = "minimal" | "toolbar";

export type ComposerReplyTo = {
  senderName: string;
  content: string;
  onCancel: () => void;
};

/** A suggestable entity e.g. { ref_id: "VENDA123", label: "Venda #123 – Filial Porto Velho" } */
export type EntitySuggestion = {
  ref_id: string;
  label: string;
  meta?: string;
};

export type ChatQuickReply = {
  command: string;
  label: string;
  text: string;
};

export type ChatComposerProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onSend?: (value: string, attachments?: File[]) => void;
  onAttach?: () => void;
  onEmoji?: () => void;
  onVoice?: () => void;
  /** Enables built-in file attachment picker & clipboard paste staging */
  allowAttachments?: boolean;
  /** Enables built-in EmojiPicker popover on Smile button (default: true in toolbar mode) */
  enableEmojiPicker?: boolean;
  /** Quick canned responses triggered by typing `/` at the start of the message */
  quickReplies?: ChatQuickReply[];
  replyTo?: ComposerReplyTo;
  disabled?: boolean;
  variant?: ComposerVariant;
  entitySuggestions?: EntitySuggestion[];
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Detect @-mention query (Portuguese accents, hyphens, dots supported) ────

function getMentionQuery(text: string, cursor: number): string | null {
  const before = text.slice(0, cursor);
  const match = before.match(/@([\wÀ-ÿ.-]*)$/);
  return match ? match[1] : null;
}

function getSlashQuery(text: string, cursor: number): string | null {
  const before = text.slice(0, cursor);
  const match = before.match(/^\/([\wÀ-ÿ-]*)$/);
  return match ? match[1] : null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatComposer({
  value: controlledValue,
  onChange,
  placeholder = "Escreva uma mensagem…",
  onSend,
  onAttach,
  onEmoji,
  onVoice,
  allowAttachments = false,
  enableEmojiPicker = true,
  quickReplies = [],
  replyTo,
  disabled = false,
  variant = "toolbar",
  entitySuggestions = [],
  className,
  componentId,
  hideIfDenied = false,
}: ChatComposerProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setText = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(0);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emojiOpen) return;
    const onDocDown = (e: MouseEvent) => {
      if (emojiContainerRef.current && !emojiContainerRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [emojiOpen]);

  const canSend = value.trim().length > 0 || stagedFiles.length > 0;

  const filteredMentions =
    mentionQuery !== null && entitySuggestions.length > 0
      ? entitySuggestions
          .filter(
            (s) =>
              s.ref_id.toLowerCase().includes(mentionQuery.toLowerCase()) ||
              s.label.toLowerCase().includes(mentionQuery.toLowerCase())
          )
          .slice(0, 8)
      : [];

  const filteredQuickReplies =
    slashQuery !== null && quickReplies.length > 0
      ? quickReplies
          .filter(
            (q) =>
              q.command.toLowerCase().includes(slashQuery.toLowerCase()) ||
              q.label.toLowerCase().includes(slashQuery.toLowerCase())
          )
          .slice(0, 8)
      : [];

  const showMentions = filteredMentions.length > 0;
  const showQuickReplies = !showMentions && filteredQuickReplies.length > 0;
  const activeListLen = showMentions
    ? filteredMentions.length
    : showQuickReplies
      ? filteredQuickReplies.length
      : 0;
  const clampedActiveIdx = activeListLen > 0 ? Math.min(activeIdx, activeListLen - 1) : 0;

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if ((!trimmed && stagedFiles.length === 0) || effectiveDisabled) return;
    if (stagedFiles.length > 0) {
      onSend?.(trimmed, stagedFiles);
    } else {
      onSend?.(trimmed);
    }
    setText("");
    setStagedFiles([]);
    setMentionQuery(null);
    setSlashQuery(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, stagedFiles, effectiveDisabled, onSend, setText]);

  const pickSuggestion = useCallback(
    (suggestion: EntitySuggestion) => {
      const el = textareaRef.current;
      if (!el) return;
      const cursor = el.selectionStart ?? value.length;
      const before = value.slice(0, mentionStart);
      const after = value.slice(cursor);
      const inserted = `@${suggestion.ref_id} `;
      const next = before + inserted + after;
      setText(next);
      setMentionQuery(null);
      requestAnimationFrame(() => {
        el.focus();
        const pos = (before + inserted).length;
        el.setSelectionRange(pos, pos);
      });
    },
    [value, mentionStart, setText]
  );

  const pickQuickReply = useCallback(
    (reply: ChatQuickReply) => {
      setText(reply.text);
      setSlashQuery(null);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(reply.text.length, reply.text.length);
      });
    },
    [setText]
  );

  const insertEmojiAtCursor = useCallback(
    (emoji: string) => {
      const el = textareaRef.current;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? value.length;
      const next = value.slice(0, start) + emoji + value.slice(end);
      setText(next);
      requestAnimationFrame(() => {
        if (!el) return;
        el.focus();
        const pos = start + emoji.length;
        el.setSelectionRange(pos, pos);
      });
    },
    [value, setText]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions || showQuickReplies) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, activeListLen - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (showMentions) pickSuggestion(filteredMentions[clampedActiveIdx]);
        else pickQuickReply(filteredQuickReplies[clampedActiveIdx]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        setSlashQuery(null);
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
    setText(next);

    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;

    const cursor = el.selectionStart ?? next.length;
    const mQuery = getMentionQuery(next, cursor);
    if (mQuery !== null) {
      const before = next.slice(0, cursor);
      setMentionStart(before.lastIndexOf("@"));
      setMentionQuery(mQuery);
      setSlashQuery(null);
      return;
    }
    setMentionQuery(null);

    const sQuery = getSlashQuery(next, cursor);
    if (sQuery !== null) {
      setSlashQuery(sQuery);
    } else {
      setSlashQuery(null);
    }
  };

  if (!hasPermission && hideIfDenied) return null;

  const showAttachButton = Boolean(onAttach || allowAttachments);
  const showEmojiButton = Boolean(onEmoji || enableEmojiPicker);

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "relative flex flex-col border-t border-border bg-surface text-foreground",
        className
      )}
    >
      {/* @-mention or /-quick-reply suggestions popover */}
      {(showMentions || showQuickReplies) && (
        <div
          className="absolute bottom-full left-2 right-2 mb-1 z-50 overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
          role="listbox"
          aria-label={showMentions ? "Sugestões de entidade" : "Respostas rápidas"}
        >
          <div className="border-b border-border px-3 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {showMentions ? "Objetos correspondentes" : "Respostas rápidas (/)"}
            </span>
          </div>
          {showMentions
            ? filteredMentions.map((s, i) => (
                <button
                  key={s.ref_id}
                  type="button"
                  role="option"
                  aria-selected={i === clampedActiveIdx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickSuggestion(s);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={clsx(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer",
                    i === clampedActiveIdx ? "bg-primary/10" : "hover:bg-surface-hover"
                  )}
                >
                  <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                    @{s.ref_id}
                  </code>
                  <span className="flex-1 truncate text-sm text-foreground">{s.label}</span>
                  {s.meta && (
                    <span className="shrink-0 text-xs text-muted-foreground">{s.meta}</span>
                  )}
                </button>
              ))
            : filteredQuickReplies.map((q, i) => (
                <button
                  key={q.command}
                  type="button"
                  role="option"
                  aria-selected={i === clampedActiveIdx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickQuickReply(q);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={clsx(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer",
                    i === clampedActiveIdx ? "bg-primary/10" : "hover:bg-surface-hover"
                  )}
                >
                  <span className="inline-flex items-center gap-1 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                    <Zap size={10} />/{q.command}
                  </span>
                  <span className="flex-1 truncate text-xs text-muted-foreground">{q.label}</span>
                </button>
              ))}
          <div className="border-t border-border px-3 py-1">
            <span className="text-[10px] text-muted-foreground">
              ↑↓ navegar · Enter confirmar · Esc fechar
            </span>
          </div>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-start gap-2 border-b border-border px-3 pt-2.5 pb-1.5">
          <Reply size={14} className="mt-0.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1 border-l-2 border-primary pl-2">
            <p className="truncate text-xs font-semibold text-foreground">{replyTo.senderName}</p>
            <p className="truncate text-xs text-muted-foreground">{replyTo.content}</p>
          </div>
          <button
            type="button"
            onClick={replyTo.onCancel}
            className="rounded-md p-0.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
            aria-label="Cancelar resposta"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Staged file chips */}
      {stagedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
          {stagedFiles.map((f, idx) => (
            <span
              key={`${f.name}-${idx}`}
              className="inline-flex max-w-[200px] items-center gap-1.5 rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs"
            >
              <Paperclip size={11} className="shrink-0 text-muted-foreground" />
              <span className="truncate text-foreground">{f.name}</span>
              <button
                type="button"
                aria-label={`Remover ${f.name}`}
                onClick={() => setStagedFiles((prev) => prev.filter((_, i) => i !== idx))}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-danger cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5 px-2.5 py-2.5">
        {variant === "toolbar" && (
          <div className="flex shrink-0 gap-0.5 pb-0.5">
            {showAttachButton && (
              <>
                {allowAttachments && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length > 0) setStagedFiles((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    onAttach?.();
                    if (allowAttachments) fileInputRef.current?.click();
                  }}
                  disabled={effectiveDisabled}
                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Anexar arquivo"
                >
                  <Paperclip size={18} />
                </button>
              </>
            )}

            {showEmojiButton && (
              <div ref={emojiContainerRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    onEmoji?.();
                    if (enableEmojiPicker) setEmojiOpen((o) => !o);
                  }}
                  disabled={effectiveDisabled}
                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Inserir emoji"
                >
                  <Smile size={18} />
                </button>
                {enableEmojiPicker && emojiOpen && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <EmojiPicker
                      onSelectEmoji={(em) => {
                        insertEmojiAtCursor(em);
                        setEmojiOpen(false);
                      }}
                      onClose={() => setEmojiOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            if (!allowAttachments) return;
            const pastedFiles = Array.from(e.clipboardData?.files ?? []);
            if (pastedFiles.length > 0) {
              setStagedFiles((prev) => [...prev, ...pastedFiles]);
            }
          }}
          placeholder={placeholder}
          disabled={effectiveDisabled}
          rows={1}
          aria-autocomplete={entitySuggestions.length > 0 ? "list" : undefined}
          className={twMerge(
            "flex-1 resize-none rounded-2xl border border-input-border bg-surface-muted/60 px-3.5 py-2",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "focus:bg-surface focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring",
            "min-h-[38px] max-h-[120px] transition-colors leading-relaxed",
            effectiveDisabled && "opacity-50 cursor-not-allowed"
          )}
        />

        <div className="shrink-0 pb-0.5">
          {canSend ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={effectiveDisabled}
              className="flex items-center justify-center rounded-xl bg-primary p-2 text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Enviar mensagem"
            >
              <Send size={16} />
            </button>
          ) : onVoice ? (
            <button
              type="button"
              onClick={onVoice}
              disabled={effectiveDisabled}
              className="rounded-xl p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
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
