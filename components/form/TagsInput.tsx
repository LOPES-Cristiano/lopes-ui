"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import { Check, Plus, Tag as TagIcon, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TagColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "violet"
  | "pink"
  | "orange"
  | "teal";

export type CheckableTagProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  icon?: React.ReactNode;
  color?: TagColor;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  componentId?: string;
};

export type CheckableTagGroupOption = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type CheckableTagGroupProps = {
  options: readonly CheckableTagGroupOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  multiple?: boolean;
  color?: TagColor;
  size?: "sm" | "md" | "lg";
  className?: string;
  componentId?: string;
};

export type TagsInputProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  /**
   * - `"input"` (default): pill container with live text entry (Enter / comma / semicolon adds tags)
   * - `"inline-add"`: Ant Design EditableTagGroup style with `+ Nova Tag` dashed button & double-click inline editing
   */
  mode?: "input" | "inline-add";
  /** Label on the `+ Nova Tag` button when `mode="inline-add"` */
  addButtonLabel?: string;
  placeholder?: string;
  suggestions?: readonly string[];
  color?: TagColor;
  maxTags?: number;
  allowDuplicates?: boolean;
  /** Allow double-clicking an existing tag to edit it in place (default: true) */
  editableTags?: boolean;
  /** Optional validator returning an error message string or null/true */
  validateTag?: (tag: string) => boolean | string | null;
  disabled?: boolean;
  clearable?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Palette ───────────────────────────────────────────────────────────────────

const TAG_PALETTE: Record<TagColor, { pill: string; active: string }> = {
  default: {
    pill: "border-border bg-surface-muted text-surface-foreground",
    active: "border-primary bg-primary text-primary-foreground",
  },
  primary: {
    pill: "border-brand-border bg-brand-soft text-brand-soft-foreground",
    active: "border-primary bg-primary text-primary-foreground",
  },
  success: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300",
    active: "border-emerald-600 bg-emerald-600 text-white",
  },
  warning: {
    pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300",
    active: "border-amber-500 bg-amber-500 text-white",
  },
  danger: {
    pill: "border-danger-border bg-danger-soft text-danger-soft-foreground",
    active: "border-danger bg-danger text-danger-foreground",
  },
  info: {
    pill: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300",
    active: "border-sky-500 bg-sky-500 text-white",
  },
  violet: {
    pill: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-300",
    active: "border-violet-600 bg-violet-600 text-white",
  },
  pink: {
    pill: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800/60 dark:bg-pink-950/50 dark:text-pink-300",
    active: "border-pink-600 bg-pink-600 text-white",
  },
  orange: {
    pill: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/50 dark:text-orange-300",
    active: "border-orange-500 bg-orange-500 text-white",
  },
  teal: {
    pill: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/60 dark:bg-teal-950/50 dark:text-teal-300",
    active: "border-teal-600 bg-teal-600 text-white",
  },
};

// ── Ant Design Tag.CheckableTag ───────────────────────────────────────────────

export function CheckableTag({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  icon,
  color = "primary",
  size = "md",
  disabled = false,
  children,
  className,
  componentId,
}: CheckableTagProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internal;
  const palette = TAG_PALETTE[color];

  const szCls =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] gap-1"
      : size === "lg"
        ? "px-3.5 py-1.5 text-sm gap-1.5"
        : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      data-component-id={componentId}
      onClick={() => {
        if (disabled) return;
        const next = !isChecked;
        if (controlledChecked === undefined) setInternal(next);
        onChange?.(next);
      }}
      className={twMerge(
        "inline-flex items-center rounded-lg border font-medium transition-[color,background-color,border-color,box-shadow,opacity] select-none cursor-pointer",
        szCls,
        isChecked
          ? twMerge(palette.active, "shadow-2xs")
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:bg-surface-hover",
        disabled && "opacity-45 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {icon ?? (isChecked ? <Check size={12} strokeWidth={2.5} /> : null)}
      <span>{children}</span>
    </button>
  );
}

export function CheckableTagGroup({
  options,
  value: controlledValue,
  defaultValue = [],
  onChange,
  multiple = true,
  color = "primary",
  size = "md",
  className,
  componentId,
}: CheckableTagGroupProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const selected = controlledValue !== undefined ? controlledValue : internal;

  const toggle = (val: string) => {
    const isActive = selected.includes(val);
    let next: string[];
    if (multiple) {
      next = isActive ? selected.filter((v) => v !== val) : [...selected, val];
    } else {
      next = isActive ? [] : [val];
    }
    if (controlledValue === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div data-component-id={componentId} className={twMerge("flex flex-wrap items-center gap-2", className)}>
      {options.map((opt) => (
        <CheckableTag
          key={opt.value}
          checked={selected.includes(opt.value)}
          onChange={() => toggle(opt.value)}
          icon={opt.icon}
          color={color}
          size={size}
          disabled={opt.disabled}
        >
          {opt.label}
        </CheckableTag>
      ))}
    </div>
  );
}

// ── Main TagsInput / EditableTagGroup Component ──────────────────────────────

export default function TagsInput({
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
  defaultValue = [],
  onChange,
  mode = "input",
  addButtonLabel = "Nova Tag",
  placeholder = "Adicionar tag e pressionar Enter...",
  suggestions = [],
  color = "primary",
  maxTags,
  allowDuplicates = false,
  editableTags = true,
  validateTag,
  disabled = false,
  clearable = true,
  componentId,
  hideIfDenied = false,
}: TagsInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const tags = controlledValue !== undefined ? controlledValue : internalTags;

  const [draft, setDraft] = useState("");
  const [inlineAdding, setInlineAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!suggestions.length) return [];
    const q = draft.trim().toLowerCase();
    return suggestions
      .filter((s) => {
        if (!allowDuplicates && tags.some((t) => t.toLowerCase() === s.toLowerCase())) {
          return false;
        }
        return !q || s.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [suggestions, draft, tags, allowDuplicates]);

  if (!hasPermission && hideIfDenied) return null;

  const palette = TAG_PALETTE[color];
  const atLimit = maxTags !== undefined && tags.length >= maxTags;

  const commitTags = (next: string[]) => {
    if (controlledValue === undefined) setInternalTags(next);
    onChange?.(next);
  };

  const tryAddTags = (rawInput: string): boolean => {
    const parts = rawInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return false;

    const next = [...tags];
    for (const candidate of parts) {
      if (maxTags !== undefined && next.length >= maxTags) break;
      if (!allowDuplicates && next.some((t) => t.toLowerCase() === candidate.toLowerCase())) {
        continue;
      }
      if (validateTag) {
        const res = validateTag(candidate);
        if (res === false) {
          setValidationMsg(`Tag inválida: "${candidate}"`);
          return false;
        }
        if (typeof res === "string" && res.length > 0) {
          setValidationMsg(res);
          return false;
        }
      }
      next.push(candidate);
    }

    setValidationMsg(null);
    commitTags(next);
    return true;
  };

  const removeTagAt = (index: number) => {
    if (effectiveDisabled) return;
    commitTags(tags.filter((_, i) => i !== index));
  };

  const startEditingTag = (index: number) => {
    if (!editableTags || effectiveDisabled) return;
    setEditingIdx(index);
    setEditingDraft(tags[index] ?? "");
    requestAnimationFrame(() => editInputRef.current?.focus());
  };

  const commitEditedTag = () => {
    if (editingIdx === null) return;
    const trimmed = editingDraft.trim();
    if (!trimmed) {
      removeTagAt(editingIdx);
    } else if (
      allowDuplicates ||
      !tags.some((t, idx) => idx !== editingIdx && t.toLowerCase() === trimmed.toLowerCase())
    ) {
      const next = [...tags];
      next[editingIdx] = trimmed;
      commitTags(next);
    }
    setEditingIdx(null);
    setEditingDraft("");
  };

  const renderTagPill = (tag: string, idx: number) => {
    if (editingIdx === idx) {
      return (
        <input
          key={`edit-${idx}`}
          ref={editInputRef}
          type="text"
          value={editingDraft}
          onChange={(e) => setEditingDraft(e.target.value)}
          onBlur={commitEditedTag}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitEditedTag();
            } else if (e.key === "Escape") {
              setEditingIdx(null);
              setEditingDraft("");
            }
          }}
          className="h-6 w-28 rounded-lg border border-ring bg-input px-2 text-xs text-input-foreground outline-none ring-2 ring-ring/20"
        />
      );
    }

    return (
      <span
        key={`${tag}-${idx}`}
        onDoubleClick={() => startEditingTag(idx)}
        title={editableTags ? "Duplo-clique para editar" : undefined}
        className={twMerge(
          "inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium transition-colors select-none",
          palette.pill,
          editableTags && !effectiveDisabled && "cursor-text"
        )}
      >
        <span className="truncate">{tag}</span>
        {!effectiveDisabled && (
          <button
            type="button"
            aria-label={`Remover ${tag}`}
            onClick={(e) => {
              e.stopPropagation();
              removeTagAt(idx);
            }}
            className="rounded-sm p-0.5 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X aria-hidden="true" size={11} />
          </button>
        )}
      </span>
    );
  };

  const activeError = error || validationMsg || undefined;

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
      error={activeError}
      helpText={helpText}
      hint={hint ?? (maxTags ? `${tags.length}/${maxTags}` : undefined)}
      width={width}
      className={className}
    >
      {name && <input type="hidden" name={name} value={JSON.stringify(tags)} />}

      {mode === "inline-add" ? (
        <div
          data-component-id={componentId}
          className="flex flex-wrap items-center gap-2 py-1"
        >
          {tags.map((t, idx) => renderTagPill(t, idx))}

          {!atLimit && !effectiveDisabled && (
            inlineAdding ? (
              <input
                ref={inputRef}
                id={id}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  if (draft.trim()) tryAddTags(draft);
                  setDraft("");
                  setInlineAdding(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    if (tryAddTags(draft)) {
                      setDraft("");
                      setInlineAdding(false);
                    }
                  } else if (e.key === "Escape") {
                    setDraft("");
                    setInlineAdding(false);
                  }
                }}
                placeholder={addButtonLabel}
                className="h-6.5 w-32 rounded-lg border border-ring bg-input px-2 text-xs text-input-foreground outline-none ring-2 ring-ring/20"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInlineAdding(true);
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border-strong bg-transparent px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <Plus aria-hidden="true" size={12} />
                <span>{addButtonLabel}</span>
              </button>
            )
          )}
        </div>
      ) : (
        <div data-component-id={componentId} className="relative w-full">
          <div
            onClick={() => !effectiveDisabled && inputRef.current?.focus()}
            className={twMerge(
              "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-input-border bg-input px-2.5 py-1.5 transition-[color,background-color,border-color,box-shadow] cursor-text",
              focused && "border-ring ring-2 ring-ring/20",
              activeError && "border-danger ring-danger/20",
              effectiveDisabled && "opacity-55 cursor-not-allowed bg-surface-muted"
            )}
          >
            {tags.map((t, idx) => renderTagPill(t, idx))}

            {!atLimit && (
              <input
                ref={inputRef}
                id={id}
                type="text"
                value={draft}
                disabled={effectiveDisabled}
                placeholder={tags.length === 0 ? placeholder : ""}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  if (draft.trim()) {
                    if (tryAddTags(draft)) setDraft("");
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(",") || val.includes(";")) {
                    if (tryAddTags(val)) setDraft("");
                  } else {
                    setDraft(val);
                    if (validationMsg) setValidationMsg(null);
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  if (/[,;\n]/.test(pasted)) {
                    e.preventDefault();
                    tryAddTags(pasted);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (draft.trim()) {
                      e.preventDefault();
                      if (tryAddTags(draft)) setDraft("");
                    }
                  } else if (e.key === "Backspace" && !draft && tags.length > 0) {
                    removeTagAt(tags.length - 1);
                  }
                }}
                className="min-w-[110px] flex-1 bg-transparent text-xs text-input-foreground placeholder:text-input-placeholder outline-none"
              />
            )}

            {clearable && tags.length > 0 && !effectiveDisabled && (
              <button
                type="button"
                aria-label="Remover todas as tags"
                onClick={(e) => {
                  e.stopPropagation();
                  commitTags([]);
                }}
                className="ml-auto rounded-md p-0.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <X aria-hidden="true" size={14} />
              </button>
            )}
          </div>

          {focused && filteredSuggestions.length > 0 && !atLimit && (
            <div className="absolute left-0 top-full z-40 mt-1.5 flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-border bg-popover p-2.5 shadow-lg">
              <span className="mr-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <TagIcon size={11} /> Sugestões:
              </span>
              {filteredSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (tryAddTags(sug)) setDraft("");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted px-2 py-0.5 text-xs text-surface-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  <Plus size={10} />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </FieldWrapper>
  );
}
