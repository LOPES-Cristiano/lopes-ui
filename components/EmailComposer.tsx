"use client";

import React, { useRef, useState, useCallback, useId, useEffect } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import {
  Send,
  Paperclip,
  X,
  ChevronDown,
  ChevronUp,
  Minus,
  Maximize2,
  Minimize2,
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Code2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import RichTextEditor, { type ToolbarGroup } from "./RichTextEditor";
import { useAccessControl } from "./useAccessControl";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { safeSetHTML } from "../utils/sanitize";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./primitives/tooltip";
import {
  type EmailAttachment,
  type EmailPayload,
  type EmailRecipient,
  emailPayloadSchema,
} from "./schemas/email-composer";

export type { EmailAttachment, EmailPayload, EmailRecipient };

export type EmailTemplate = {
  id: string;
  label: string;
  subject?: string;
  body: string;
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
  /** HTML email signature — shown below body, styled and sanitized separately */
  signature?: string;
  /** Autocomplete suggestions for recipient fields */
  contactSuggestions?: EmailRecipient[];
  /** Canned email templates for quick fill */
  templates?: EmailTemplate[];
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
  /** Async image uploader passed down to RichTextEditor */
  onUploadImage?: (file: File) => Promise<string> | string;
  attachments?: EmailAttachment[];
  sending?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

function attachIcon(mime: string, name?: string) {
  const lowerMime = (mime ?? "").toLowerCase();
  const lowerName = (name ?? "").toLowerCase();
  if (lowerMime.startsWith("image/")) return FileImage;
  if (lowerMime.startsWith("video/")) return FileVideo;
  if (lowerMime.startsWith("audio/")) return FileAudio;
  if (
    lowerMime.includes("spreadsheet") ||
    lowerMime.includes("excel") ||
    lowerMime.includes("csv") ||
    /\.(xlsx?|csv|ods)$/.test(lowerName)
  ) {
    return FileSpreadsheet;
  }
  if (lowerMime.includes("pdf") || lowerMime.includes("text") || lowerMime.includes("word")) {
    return FileText;
  }
  if (
    lowerMime.includes("zip") ||
    lowerMime.includes("tar") ||
    lowerMime.includes("gz") ||
    lowerMime.includes("rar") ||
    /\.(zip|rar|7z|tar|gz)$/.test(lowerName)
  ) {
    return Archive;
  }
  if (lowerMime.includes("javascript") || lowerMime.includes("json") || lowerMime.includes("xml")) {
    return Code2;
  }
  return File;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Chip({
  recipient,
  onRemove,
  componentId,
}: {
  recipient: EmailRecipient;
  onRemove: () => void;
  componentId?: string;
}) {
  return (
    <span className="inline-flex max-w-[240px] items-center gap-1 rounded-full border border-border bg-surface-muted pl-2.5 pr-0.5 py-0.5 text-xs font-medium text-foreground">
      <span className="truncate">{recipient.name ?? recipient.email}</span>
      <button
        data-component-id={componentId}
        type="button"
        aria-label={`Remover ${recipient.email}`}
        onClick={onRemove}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
      >
        <X size={11} />
      </button>
    </span>
  );
}

function RecipientField({
  label,
  recipients,
  onChange,
  suggestions = [],
  componentId,
}: {
  label: string;
  recipients: EmailRecipient[];
  onChange: (r: EmailRecipient[]) => void;
  suggestions?: EmailRecipient[];
  componentId?: string;
}) {
  const [input, setInput] = useState("");
  const [showSug, setShowSug] = useState(false);
  const inputId = useId();

  const filtered = suggestions.filter(
    (s) =>
      (s.name?.toLowerCase().includes(input.toLowerCase()) ||
        s.email.toLowerCase().includes(input.toLowerCase())) &&
      !recipients.find((r) => r.email === s.email)
  );

  const add = useCallback(
    (r: EmailRecipient) => {
      onChange([...recipients, r]);
      setInput("");
      setShowSug(false);
    },
    [recipients, onChange]
  );

  const removeAt = (idx: number) => {
    onChange(recipients.filter((_, i) => i !== idx));
  };

  const commitInput = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/) ?? null;
    if (match) {
      add({ name: match[1].trim(), email: match[2].trim() });
    } else if (trimmed.includes("@")) {
      add({ email: trimmed });
    }
  }, [input, add]);

  const hasFloatingSuggestions = showSug && filtered.length > 0;

  return (
    <div className="flex min-h-8 items-start gap-2 border-b border-border px-4 py-2">
      <label
        htmlFor={inputId}
        className="w-8 shrink-0 pt-1.5 text-xs font-semibold text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative flex flex-1 flex-wrap items-center gap-1.5">
        {recipients.map((r, i) => (
          <Chip
            key={`${r.email}-${i}`}
            recipient={r}
            onRemove={() => removeAt(i)}
            componentId={componentId ? `${componentId}.chip.remove` : undefined}
          />
        ))}
        <input
          data-component-id={componentId ? `${componentId}.input` : undefined}
          id={inputId}
          type="email"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSug(true);
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (
              e.key === "Enter" ||
              e.key === "," ||
              (e.key === "Tab" && !e.shiftKey && input.trim().length > 0)
            ) {
              e.preventDefault();
              commitInput();
            }
            if (e.key === "Backspace" && !input && recipients.length > 0) {
              removeAt(recipients.length - 1);
            }
            if (e.key === "Escape" && showSug) {
              e.stopPropagation();
              setShowSug(false);
            }
          }}
          onBlur={() => {
            commitInput();
            setTimeout(() => setShowSug(false), 150);
          }}
          onFocus={() => {
            if (input) setShowSug(true);
          }}
          placeholder={recipients.length === 0 ? "nome@email.com" : ""}
          className="min-w-[140px] flex-1 bg-transparent py-1 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {hasFloatingSuggestions && (
          <div
            data-floating-open="true"
            role="listbox"
            className="absolute left-0 top-full z-[9200] mt-1 max-h-48 w-64 overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface py-1 shadow-xl"
          >
            {filtered.map((s) => (
              <button
                data-component-id={componentId ? `${componentId}.suggestion` : undefined}
                key={s.email}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(s);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:bg-surface-hover transition-colors cursor-pointer"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {(s.name ?? s.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  {s.name && (
                    <p className="truncate text-xs font-medium text-foreground">{s.name}</p>
                  )}
                  <p className="truncate text-[11px] text-muted-foreground">{s.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_TOOLBAR: ToolbarGroup[] = ["history", "inline", "align", "list", "link"];

export default function EmailComposer({
  defaultTo = [],
  defaultCc = [],
  defaultBcc = [],
  defaultSubject = "",
  defaultBody = "",
  signature,
  contactSuggestions = [],
  templates = [],
  bodyToolbar = DEFAULT_TOOLBAR,
  title = "Nova mensagem",
  mode = "window",
  minimized: controlledMinimized,
  onSend,
  onDiscard,
  onAttach,
  onRemoveAttachment,
  onUploadImage,
  attachments = [],
  sending = false,
  className,
  componentId,
  hideIfDenied = false,
}: EmailComposerProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [to, setTo] = useState<EmailRecipient[]>(defaultTo);
  const [cc, setCc] = useState<EmailRecipient[]>(defaultCc);
  const [bcc, setBcc] = useState<EmailRecipient[]>(defaultBcc);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [showCc, setShowCc] = useState(defaultCc.length > 0);
  const [showBcc, setShowBcc] = useState(defaultBcc.length > 0);
  const [minimized, setMinimized] = useState(controlledMinimized ?? false);
  const [maximized, setMaximized] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const subjectInputId = useId();

  useBodyScrollLock(maximized);

  useEffect(() => {
    if (!signatureRef.current) return;
    safeSetHTML(signatureRef.current, signature ?? "");
  }, [signature, minimized, maximized]);

  useEffect(() => {
    if (!maximized && !templatesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (templatesOpen) {
        e.preventDefault();
        e.stopPropagation();
        setTemplatesOpen(false);
        return;
      }
      if (maximized) {
        e.preventDefault();
        e.stopPropagation();
        setMaximized(false);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [maximized, templatesOpen]);

  if (!hasPermission && hideIfDenied) return null;

  const handleSend = async () => {
    if (!onSend || sending) return;
    setValidationError(null);
    const validation = emailPayloadSchema.safeParse({
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
    });
    if (!validation.success) {
      const issue = validation.error.issues[0];
      setValidationError(issue ? issue.message : "Verifique os destinatários e o assunto do e-mail.");
      return;
    }
    await onSend(validation.data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    await onAttach?.(files);
    e.target.value = "";
  };

  const isWindow = mode === "window";

  const windowCls = twMerge(
    "relative flex flex-col bg-surface text-foreground border border-border shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 transition-all duration-150",
    maximized
      ? "fixed inset-3 sm:inset-6 z-[9500] !w-auto !max-w-none rounded-2xl overscroll-contain"
      : isWindow
        ? "w-[560px] max-w-full"
        : "w-full",
    !maximized && (isWindow && !minimized ? "rounded-2xl" : "rounded-t-2xl"),
    isDragOver && "ring-2 ring-primary",
    !hasPermission && "opacity-60 pointer-events-none",
    className
  );

  const composerElement = (
    <TooltipProvider delayDuration={250}>
      <div
        data-component-id={componentId}
        data-floating-open={maximized ? "true" : undefined}
        role={maximized ? "dialog" : undefined}
        aria-modal={maximized ? true : undefined}
        aria-label={maximized ? title : undefined}
        className={windowCls}
        onDragOver={(e) => {
          if (!onAttach) return;
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          if (!onAttach) return;
          e.preventDefault();
          setIsDragOver(false);
          const files = Array.from(e.dataTransfer.files ?? []);
          if (files.length > 0) void onAttach(files);
        }}
      >
        {/* Title bar */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <span className="truncate text-sm font-semibold text-foreground">{title}</span>
          <div className="flex items-center gap-1">
            {!maximized && (
              <button
                data-component-id={componentId ? `${componentId}.minimize` : undefined}
                type="button"
                onClick={() => setMinimized((s) => !s)}
                aria-label={minimized ? "Expandir janela" : "Minimizar janela"}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
              >
                {minimized ? <ChevronUp size={13} /> : <Minus size={13} />}
              </button>
            )}
            {isWindow && (
              <button
                data-component-id={componentId ? `${componentId}.maximize` : undefined}
                type="button"
                onClick={() => {
                  setMinimized(false);
                  setMaximized((m) => !m);
                }}
                aria-label={maximized ? "Restaurar janela" : "Maximizar janela"}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
              >
                {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            )}
            {onDiscard && (
              <button
                data-component-id={componentId ? `${componentId}.discard` : undefined}
                type="button"
                aria-label="Descartar mensagem"
                onClick={onDiscard}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Body (hidden when minimized) */}
        {!minimized && (
          <>
            {validationError && (
              <div
                role="alert"
                className="flex items-center justify-between gap-2 border-b border-danger/30 bg-danger/10 px-4 py-2 text-xs font-medium text-danger"
              >
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  {validationError}
                </span>
                <button
                  type="button"
                  aria-label="Fechar aviso"
                  onClick={() => setValidationError(null)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-danger/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Recipient fields */}
            <div className="shrink-0">
              <RecipientField
                label="Para"
                recipients={to}
                onChange={(next) => {
                  setTo(next);
                  if (validationError) setValidationError(null);
                }}
                suggestions={contactSuggestions}
                componentId={componentId ? `${componentId}.to` : undefined}
              />
              {showCc && (
                <RecipientField
                  label="CC"
                  recipients={cc}
                  onChange={setCc}
                  suggestions={contactSuggestions}
                  componentId={componentId ? `${componentId}.cc` : undefined}
                />
              )}
              {showBcc && (
                <RecipientField
                  label="BCC"
                  recipients={bcc}
                  onChange={setBcc}
                  suggestions={contactSuggestions}
                  componentId={componentId ? `${componentId}.bcc` : undefined}
                />
              )}

              {(!showCc || !showBcc) && (
                <div className="flex items-center gap-3 border-b border-border px-4 py-1.5">
                  {!showCc && (
                    <button
                      data-component-id={componentId ? `${componentId}.show-cc` : undefined}
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="min-h-6 px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors cursor-pointer"
                    >
                      + CC
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      data-component-id={componentId ? `${componentId}.show-bcc` : undefined}
                      type="button"
                      onClick={() => setShowBcc(true)}
                      className="min-h-6 px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors cursor-pointer"
                    >
                      + BCC
                    </button>
                  )}
                </div>
              )}

              {/* Subject */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                <label
                  htmlFor={subjectInputId}
                  className="w-14 shrink-0 text-xs font-semibold text-muted-foreground"
                >
                  Assunto
                </label>
                <input
                  id={subjectInputId}
                  data-component-id={componentId ? `${componentId}.subject` : undefined}
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Assunto do e-mail"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                />
              </div>
            </div>

            {/* Body editor */}
            <div className="flex-1 min-h-0 flex flex-col">
              <RichTextEditor
                value={body}
                onChange={setBody}
                toolbar={bodyToolbar}
                onUploadImage={onUploadImage}
                variant="borderless"
                minHeight={maximized ? "20rem" : "12rem"}
                maxHeight={maximized ? "none" : "28rem"}
                placeholder="Escreva sua mensagem ou digite '/' para comandos..."
                editorClassName="text-sm"
                componentId={componentId ? `${componentId}.body` : undefined}
              />
            </div>

            {/* Sanitized Signature */}
            {signature && (
              <div className="border-t border-dashed border-border px-4 py-3">
                <div
                  ref={signatureRef}
                  className="text-xs text-muted-foreground [&_a]:text-primary [&_a]:underline"
                />
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2.5">
                {attachments.map((att) => {
                  const AttIcon = attachIcon(att.type, att.name);
                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted/60 pl-2.5 pr-1 py-1"
                    >
                      <AttIcon size={13} className="shrink-0 text-muted-foreground" />
                      <span className="max-w-[140px] truncate text-xs text-foreground">
                        {att.name}
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                        {fmtSize(att.size)}
                      </span>
                      {onRemoveAttachment && (
                        <button
                          data-component-id={
                            componentId ? `${componentId}.attachment.remove` : undefined
                          }
                          type="button"
                          aria-label={`Remover ${att.name}`}
                          onClick={() => onRemoveAttachment(att.id)}
                          className="ml-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-2.5">
              <div className="flex items-center gap-1">
                <input
                  data-component-id={componentId ? `${componentId}.attachment.file` : undefined}
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      data-component-id={componentId ? `${componentId}.attachment.add` : undefined}
                      type="button"
                      aria-label="Anexar arquivo"
                      onClick={() => fileRef.current?.click()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                    >
                      <Paperclip size={15} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Anexar arquivo (ou arraste para a janela)</TooltipContent>
                </Tooltip>

                {templates.length > 0 && (
                  <div className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label="Inserir modelo de e-mail"
                          aria-expanded={templatesOpen}
                          onClick={() => setTemplatesOpen((p) => !p)}
                          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                        >
                          <Sparkles size={13} />
                          <span className="hidden sm:inline">Modelos</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Inserir modelo de e-mail</TooltipContent>
                    </Tooltip>
                    {templatesOpen && (
                      <div
                        data-floating-open="true"
                        className="absolute bottom-full left-0 mb-1.5 z-[9200] w-60 rounded-xl border border-border bg-surface p-1 shadow-xl"
                      >
                        {templates.map((tpl) => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => {
                              if (tpl.subject) setSubject(tpl.subject);
                              setBody(tpl.body);
                              setTemplatesOpen(false);
                            }}
                            className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:bg-surface-hover cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-foreground">{tpl.label}</span>
                            {tpl.subject && (
                              <span className="truncate text-[10px] text-muted-foreground">
                                {tpl.subject}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  data-component-id={componentId ? `${componentId}.more-options` : undefined}
                  type="button"
                  aria-label="Mostrar CC e BCC"
                  onClick={() => {
                    setShowCc(true);
                    setShowBcc(true);
                  }}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                >
                  <ChevronDown size={15} />
                </button>
              </div>

              <button
                data-component-id={componentId ? `${componentId}.send` : undefined}
                type="button"
                onClick={handleSend}
                disabled={sending || to.length === 0}
                className={twMerge(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer",
                  "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  sending && "cursor-wait"
                )}
              >
                <Send size={14} className={sending ? "animate-pulse" : ""} />
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );

  if (maximized && typeof document !== "undefined") {
    return createPortal(
      <>
        <div
          className="fixed inset-0 z-[9490] bg-black/50 backdrop-blur-xs"
          onClick={() => setMaximized(false)}
        />
        {composerElement}
      </>,
      document.body
    );
  }

  return composerElement;
}
