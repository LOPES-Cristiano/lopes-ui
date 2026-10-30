"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MentionOption = {
  /** Inserted token after the trigger prefix (e.g. "ana.lima" -> "@ana.lima") */
  value: string;
  /** Visible name in the dropdown */
  label: string;
  /** Optional subtitle / role / branch */
  description?: string;
  /** Optional avatar image URL */
  avatar?: string;
  /** Optional custom initials or icon */
  icon?: React.ReactNode;
  /** Optional right-side badge text */
  badge?: string;
  disabled?: boolean;
};

export type MentionsFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called whenever an option is picked from the mention menu */
  onSelect?: (option: MentionOption, prefix: string) => void;
  /**
   * Options list (used for all prefixes) OR a map keyed by prefix character
   * (e.g. `{ "@": users, "#": orders }`).
   */
  options: readonly MentionOption[] | Record<string, readonly MentionOption[]>;
  /** Single prefix or list of trigger prefixes (default: "@") */
  prefix?: string | readonly string[];
  /** Character inserted after a mention (default: " ") */
  split?: string;
  /** Render a multiline textarea instead of a single-line input (default: true) */
  multiline?: boolean;
  rows?: number;
  autoResize?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: "default" | "filled" | "underlined" | "borderless";
  emptyMessage?: string;
  maxLength?: number;
  showCount?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectActiveMention(
  text: string,
  cursor: number,
  prefixes: readonly string[]
): { prefix: string; query: string; startIndex: number } | null {
  const before = text.slice(0, cursor);
  let best: { prefix: string; query: string; startIndex: number } | null = null;

  for (const p of prefixes) {
    if (!p) continue;
    const regex = new RegExp(`(?:^|\\s)(${escapeRegExp(p)})([\\wÀ-ÿ._-]*)$`);
    const match = before.match(regex);
    if (match) {
      const matchedPrefix = match[1];
      const query = match[2] ?? "";
      const startIndex = before.length - (matchedPrefix.length + query.length);
      if (!best || startIndex > best.startIndex) {
        best = { prefix: matchedPrefix, query, startIndex };
      }
    }
  }

  return best;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MentionsField({
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  error,
  helpText,
  hint,
  width,
  className,
  id: idProp,
  name,
  value: controlledValue,
  defaultValue = "",
  onChange,
  onSelect,
  options,
  prefix = "@",
  split = " ",
  multiline = true,
  rows = 3,
  autoResize = true,
  placeholder = "Digite @ para mencionar...",
  disabled = false,
  readOnly = false,
  variant = "default",
  emptyMessage = "Nenhuma sugestão encontrada",
  maxLength,
  showCount = false,
  componentId,
  hideIfDenied = false,
}: MentionsFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  const [internalVal, setInternalVal] = useState(defaultValue);
  const currentValue = controlledValue !== undefined ? controlledValue : internalVal;

  const [activeTrigger, setActiveTrigger] = useState<{
    prefix: string;
    query: string;
    startIndex: number;
  } | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const prefixes = useMemo(
    () => (typeof prefix === "string" ? [prefix] : Array.from(prefix)),
    [prefix]
  );

  const filteredOptions = useMemo(() => {
    if (!activeTrigger) return [];
    const source: readonly MentionOption[] = Array.isArray(options)
      ? options
      : ((options as Record<string, readonly MentionOption[]>)[activeTrigger.prefix] ?? []);
    const q = normalizeText(activeTrigger.query);
    if (!q) return source;
    return source.filter(
      (opt) =>
        normalizeText(opt.label).includes(q) ||
        normalizeText(opt.value).includes(q) ||
        (opt.description ? normalizeText(opt.description).includes(q) : false)
    );
  }, [activeTrigger, options]);

  const safeHighlightIdx =
    filteredOptions.length === 0 ? 0 : Math.min(highlightIdx, filteredOptions.length - 1);

  useEffect(() => {
    if (!activeTrigger) return;
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTrigger(null);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [activeTrigger]);

  useEffect(() => {
    if (!multiline || !autoResize) return;
    const el = fieldRef.current;
    if (el && el instanceof HTMLTextAreaElement) {
      el.style.height = "auto";
      el.style.height = `${Math.max(rows * 24, el.scrollHeight)}px`;
    }
  }, [currentValue, multiline, autoResize, rows]);

  const updateText = (next: string, cursorPos?: number) => {
    if (controlledValue === undefined) setInternalVal(next);
    onChange?.(next);
    if (cursorPos !== undefined) {
      const detected = detectActiveMention(next, cursorPos, prefixes);
      setActiveTrigger(detected);
      setHighlightIdx(0);
    } else {
      setActiveTrigger(null);
    }
  };

  const insertMention = (opt: MentionOption) => {
    if (!activeTrigger || opt.disabled) return;
    const el = fieldRef.current;
    const cursor = el?.selectionStart ?? currentValue.length;
    const before = currentValue.slice(0, activeTrigger.startIndex);
    const after = currentValue.slice(cursor);
    const token = `${activeTrigger.prefix}${opt.value}${split}`;
    const nextValue = `${before}${token}${after}`;
    const nextCursor = before.length + token.length;

    if (controlledValue === undefined) setInternalVal(nextValue);
    onChange?.(nextValue);
    onSelect?.(opt, activeTrigger.prefix);
    setActiveTrigger(null);

    requestAnimationFrame(() => {
      if (fieldRef.current) {
        fieldRef.current.focus();
        fieldRef.current.setSelectionRange(nextCursor, nextCursor);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!activeTrigger) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setActiveTrigger(null);
      return;
    }
    if (filteredOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      const candidate = filteredOptions[safeHighlightIdx];
      if (candidate && !candidate.disabled) {
        e.preventDefault();
        insertMention(candidate);
      }
    }
  };

  if (!hasPermission && hideIfDenied) return null;

  const variantClasses =
    variant === "underlined"
      ? "rounded-none border-0 border-b-2 border-zinc-300 dark:border-zinc-700 bg-transparent px-1 focus:border-primary focus:ring-0"
      : variant === "borderless"
        ? "rounded-xl border border-transparent bg-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50 focus:ring-2 focus:ring-primary/20"
        : variant === "filled"
          ? "rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/80 focus:bg-white dark:focus:bg-zinc-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
          : "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-primary focus:ring-2 focus:ring-primary/20";

  const sharedInputClasses = twMerge(
    "w-full px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all",
    variantClasses,
    error && "border-red-500 dark:border-red-500 focus:ring-red-500/20",
    effectiveDisabled && "opacity-55 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/50"
  );

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div ref={containerRef} data-component-id={componentId} className="relative w-full">
        {multiline ? (
          <textarea
            ref={(el) => {
              fieldRef.current = el;
            }}
            id={id}
            name={name}
            rows={rows}
            value={currentValue}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            onChange={(e) => updateText(e.target.value, e.target.selectionStart ?? undefined)}
            onClick={(e) => {
              const pos = e.currentTarget.selectionStart;
              if (pos !== null) {
                setActiveTrigger(detectActiveMention(e.currentTarget.value, pos, prefixes));
              }
            }}
            onKeyDown={handleKeyDown}
            className={twMerge(sharedInputClasses, "resize-y leading-relaxed")}
          />
        ) : (
          <input
            ref={(el) => {
              fieldRef.current = el;
            }}
            id={id}
            name={name}
            type="text"
            value={currentValue}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            onChange={(e) => updateText(e.target.value, e.target.selectionStart ?? undefined)}
            onClick={(e) => {
              const pos = e.currentTarget.selectionStart;
              if (pos !== null) {
                setActiveTrigger(detectActiveMention(e.currentTarget.value, pos, prefixes));
              }
            }}
            onKeyDown={handleKeyDown}
            className={twMerge(sharedInputClasses, "h-10")}
          />
        )}

        {(showCount || maxLength !== undefined) && (
          <div className="mt-1 flex justify-end text-[11px] font-mono text-zinc-400">
            {currentValue.length}
            {maxLength !== undefined ? ` / ${maxLength}` : ""}
          </div>
        )}

        {activeTrigger && (
          <div
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1.5 w-72 max-w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <span>Sugestões ({activeTrigger.prefix})</span>
              <span>↑↓ Enter</span>
            </div>
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-zinc-400">{emptyMessage}</div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isHighlighted = idx === safeHighlightIdx;
                  const initials = opt.label
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() ?? "")
                    .join("");

                  return (
                    <button
                      key={`${activeTrigger.prefix}-${opt.value}`}
                      type="button"
                      disabled={opt.disabled}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(opt);
                      }}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      className={twMerge(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors cursor-pointer",
                        isHighlighted
                          ? "bg-primary/10 text-primary"
                          : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                        opt.disabled && "opacity-45 cursor-not-allowed"
                      )}
                    >
                      {opt.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={opt.avatar}
                          alt={opt.label}
                          className="h-7 w-7 shrink-0 rounded-full object-cover"
                        />
                      ) : opt.icon ? (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">
                          {opt.icon}
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                          {initials}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold">{opt.label}</span>
                          {opt.badge && (
                            <span className="shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div className="truncate text-[11px] text-zinc-400">
                          {opt.description ?? `${activeTrigger.prefix}${opt.value}`}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

export { MentionsField as Mentions };
