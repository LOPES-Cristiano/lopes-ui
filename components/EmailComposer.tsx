"use client";

import React, { useRef, useState, useCallback, useId } from "react";
import { twMerge } from "tailwind-merge";
import {
  Send, Paperclip, X, ChevronDown, ChevronUp,
  Minus, Maximize2, File, FileText, FileImage,
  FileVideo, FileAudio, Archive, Code2,
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { type ToolbarGroup } from "@/components/RichTextEditor";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EmailRecipient = {
  email: string;
  name?: string;
};

export type EmailAttachment = {
  id: string;
  name: string;
  size: number;   // bytes
  type: string;   // MIME type
  /** For preview/download — a URL or blob URL */
  url?: string;
};

export type EmailComposerProps = {
  /** Initial TO recipients */
  defaultTo?: EmailRecipient[];
  /** Initial CC */
  defaultCc?: EmailRecipient[];
  /** Initial BCC */
  defaultBcc?: EmailRecipient[];
  /** Initial subject */
  defaultSubject?: string;
  /** Initial HTML body */
  defaultBody?: string;
  /** HTML email signature — shown below body, styled separately */
  signature?: string;
  /** Autocomplete suggestions for recipient fields */
  contactSuggestions?: EmailRecipient[];
  /** Toolbar groups for the body editor */
  bodyToolbar?: ToolbarGroup[];
  /** Shown in the window title bar */
  title?: string;
  /** Controls the windowed state */
  mode?: "window" | "inline";
  /** Window is minimized */
  minimized?: boolean;
  onSend?: (payload: EmailPayload) => void | Promise<void>;
  onDiscard?: () => void;
  /** Called when files are attached */
  onAttach?: (files: File[]) => void | Promise<EmailAttachment[]>;
  /** Called when an attachment is removed */
  onRemoveAttachment?: (id: string) => void;
  attachments?: EmailAttachment[];
  sending?: boolean;
  className?: string;
  componentId?: string;
};

export type EmailPayload = {
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  subject: string;
  body: string;
  attachments: EmailAttachment[];
};

// ── Attachment icon ───────────────────────────────────────────────────────────

function attachIcon(mime: string) {
  if (mime.startsWith("image/")) return FileImage;
  if (mime.startsWith("video/")) return FileVideo;
  if (mime.startsWith("audio/")) return FileAudio;
  if (mime.includes("pdf") || mime.includes("text")) return FileText;
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("gz")) return Archive;
  if (mime.includes("javascript") || mime.includes("json") || mime.includes("xml")) return Code2;
  if (mime.includes("sheet") || mime.includes("csv")) return File;
  return File;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Recipient chip ────────────────────────────────────────────────────────────

function Chip({ recipient, onRemove }: { recipient: EmailRecipient; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 pl-2.5 pr-1 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[220px]">
      <span className="truncate">{recipient.name ?? recipient.email}</span>
      <button
        type="button"
        aria-label={`Remover ${recipient.email}`}
        onClick={onRemove}
        className="shrink-0 rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-500"
      >
        <X size={10} />
      </button>
    </span>
  );
}

// ── Recipient input field ─────────────────────────────────────────────────────

function RecipientField({
  label,
  recipients,
  onChange,
  suggestions = [],
}: {
  label: string;
  recipients: EmailRecipient[];
  onChange: (r: EmailRecipient[]) => void;
  suggestions?: EmailRecipient[];
}) {
  const [input, setInput] = useState("");
  const [showSug, setShowSug] = useState(false);
  const inputId = useId();

  const filtered = suggestions.filter(
    (s) =>
      (s.name?.toLowerCase().includes(input.toLowerCase()) ||
        s.email.toLowerCase().includes(input.toLowerCase())) &&
      !recipients.find((r) => r.email === s.email),
  );

  const add = useCallback(
    (r: EmailRecipient) => {
      onChange([...recipients, r]);
      setInput("");
      setShowSug(false);
    },
    [recipients, onChange],
  );

  const removeAt = (idx: number) => {
    onChange(recipients.filter((_, i) => i !== idx));
  };

  const commitInput = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // Accept "Name <email>" or plain email
    const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/) ?? null;
    if (match) {
      add({ name: match[1].trim(), email: match[2].trim() });
    } else if (trimmed.includes("@")) {
      add({ email: trimmed });
    }
  }, [input, add]);

  return (
    <div className="flex items-start gap-2 min-h-8 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
      <label htmlFor={inputId} className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 pt-1.5 w-8 shrink-0">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5 flex-1 relative">
        {recipients.map((r, i) => (
          <Chip key={`${r.email}-${i}`} recipient={r} onRemove={() => removeAt(i)} />
        ))}
        <input
          id={inputId}
          type="email"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSug(true); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
              e.preventDefault();
              commitInput();
            }
            if (e.key === "Backspace" && !input && recipients.length > 0) {
              removeAt(recipients.length - 1);
            }
            if (e.key === "Escape") setShowSug(false);
          }}
          onBlur={() => { commitInput(); setTimeout(() => setShowSug(false), 150); }}
          onFocus={() => { if (input) setShowSug(true); }}
          placeholder={recipients.length === 0 ? "nome@email.com" : ""}
          className="flex-1 min-w-[140px] bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 outline-none"
          autoComplete="off"
        />

        {/* Suggestions dropdown */}
        {showSug && filtered.length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1 max-h-48 overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.email}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(s); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {(s.name ?? s.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  {s.name && <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>}
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{s.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const DEFAULT_TOOLBAR: ToolbarGroup[] = ["history", "inline", "align", "list", "link"];

export default function EmailComposer({
  defaultTo = [],
  defaultCc = [],
  defaultBcc = [],
  defaultSubject = "",
  defaultBody = "",
  signature,
  contactSuggestions = [],
  bodyToolbar = DEFAULT_TOOLBAR,
  title = "Nova mensagem",
  mode = "window",
  minimized: controlledMinimized,
  onSend,
  onDiscard,
  onAttach,
  onRemoveAttachment,
  attachments = [],
  sending = false,
  className,
  componentId,
}: EmailComposerProps) {
  const [to,      setTo]      = useState<EmailRecipient[]>(defaultTo);
  const [cc,      setCc]      = useState<EmailRecipient[]>(defaultCc);
  const [bcc,     setBcc]     = useState<EmailRecipient[]>(defaultBcc);
  const [subject, setSubject] = useState(defaultSubject);
  const [body,    setBody]    = useState(defaultBody);
  const [showCc,  setShowCc]  = useState(defaultCc.length > 0);
  const [showBcc, setShowBcc] = useState(defaultBcc.length > 0);
  const [minimized, setMinimized] = useState(controlledMinimized ?? false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!onSend || sending) return;
    await onSend({ to, cc, bcc, subject, body, attachments });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    await onAttach?.(files);
    e.target.value = "";
  };

  const isWindow = mode === "window";

  const windowCls = twMerge(
    "flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl shadow-zinc-900/10 dark:shadow-black/40",
    isWindow
      ? "w-[560px] max-w-full"
      : "w-full",
    isWindow && !minimized ? "rounded-2xl" : "rounded-t-2xl",
    className,
  );

  return (
    <div
      className={windowCls}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{title}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMinimized((s) => !s)}
            aria-label={minimized ? "Expandir" : "Minimizar"}
            className="h-6 w-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {minimized ? <ChevronUp size={13} /> : <Minus size={13} />}
          </button>
          {isWindow && (
            <button
              type="button"
              aria-label="Tela cheia"
              className="h-6 w-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Maximize2 size={12} />
            </button>
          )}
          {onDiscard && (
            <button
              type="button"
              aria-label="Descartar"
              onClick={onDiscard}
              className="h-6 w-6 flex items-center justify-center rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Body (hidden when minimized) */}
      {!minimized && (
        <>
          {/* Recipient fields */}
          <div className="shrink-0">
            <RecipientField label="Para" recipients={to} onChange={setTo} suggestions={contactSuggestions} />
            {showCc  && <RecipientField label="CC"  recipients={cc}  onChange={setCc}  suggestions={contactSuggestions} />}
            {showBcc && <RecipientField label="BCC" recipients={bcc} onChange={setBcc} suggestions={contactSuggestions} />}

            {/* CC/BCC toggles */}
            {(!showCc || !showBcc) && (
              <div className="flex items-center gap-3 px-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                {!showCc && (
                  <button type="button" onClick={() => setShowCc(true)}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    + CC
                  </button>
                )}
                {!showBcc && (
                  <button type="button" onClick={() => setShowBcc(true)}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    + BCC
                  </button>
                )}
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 w-14 shrink-0">
                Assunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto do email"
                className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 outline-none"
              />
            </div>
          </div>

          {/* Body editor */}
          <div className="flex-1 min-h-0">
            <RichTextEditor
              value={body}
              onChange={setBody}
              toolbar={bodyToolbar}
              variant="borderless"
              minHeight="12rem"
              maxHeight="28rem"
              placeholder="Escreva sua mensagem..."
              editorClassName="text-sm"
            />
          </div>

          {/* Signature */}
          {signature && (
            <div className="border-t border-dashed border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <div
                className="text-xs text-zinc-400 dark:text-zinc-500 [&_a]:text-blue-500 dark:[&_a]:text-blue-400"
                dangerouslySetInnerHTML={{ __html: signature }}
              />
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
              {attachments.map((att) => {
                const AttIcon = attachIcon(att.type);
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 pl-2.5 pr-1.5 py-1"
                  >
                    <AttIcon size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">{att.name}</span>
                    <span className="text-[10px] text-zinc-400 shrink-0">{fmtSize(att.size)}</span>
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        aria-label={`Remover ${att.name}`}
                        onClick={() => onRemoveAttachment(att.id)}
                        className="ml-0.5 shrink-0 rounded p-0.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 shrink-0">
            <div className="flex items-center gap-1">
              {/* Attach */}
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                aria-label="Anexar arquivo"
                onClick={() => fileRef.current?.click()}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Paperclip size={15} />
              </button>
              {/* Show CC/BCC hint */}
              <button
                type="button"
                aria-label="Mais opções"
                onClick={() => { setShowCc(true); setShowBcc(true); }}
                className="h-8 w-8 hidden sm:flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronDown size={15} />
              </button>
            </div>

            {/* Send */}
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || to.length === 0}
              className={twMerge(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                sending && "cursor-wait",
              )}
            >
              <Send size={14} className={sending ? "animate-pulse" : ""} />
              {sending ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
