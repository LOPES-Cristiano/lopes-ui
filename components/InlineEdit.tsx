"use client";

import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

export type InlineEditOption = {
  value: string;
  label: string;
};

export type InlineEditProps = {
  value?: string;
  defaultValue?: string;
  /** Called when the user confirms an edit. Supports async promises with loading/rollback. */
  onSave?: (nextValue: string) => void | Promise<void>;
  onCancel?: () => void;
  type?: "text" | "textarea" | "number" | "select";
  /** Options when `type="select"` */
  options?: InlineEditOption[];
  /** Custom display formatter when not editing (e.g. currency formatting) */
  formatDisplay?: (value: string) => React.ReactNode;
  placeholder?: string;
  /** Trigger edit on single `"click"` (default) or `"doubleClick"` */
  trigger?: "click" | "doubleClick";
  /** Behaviour when input loses focus: `"save"` (default) or `"cancel"` */
  blurAction?: "save" | "cancel";
  /** Show action buttons (✓ / ×) next to the input. Default: true */
  showActions?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  inputClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const TEXT_SIZE = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base font-semibold",
} as const;

export default function InlineEdit({
  value: controlledValue,
  defaultValue = "",
  onSave,
  onCancel,
  type = "text",
  options = [],
  formatDisplay,
  placeholder = "Clique para editar...",
  trigger = "click",
  blurAction = "save",
  showActions = true,
  size = "md",
  disabled = false,
  readOnly = false,
  className,
  inputClassName,
  componentId,
  hideIfDenied = false,
}: InlineEditProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const isControlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const committedValue = isControlled ? controlledValue : uncontrolled;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(committedValue);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(
    null
  );

  const syncKey = `${editing}:${committedValue}`;
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey);
  if (prevSyncKey !== syncKey) {
    setPrevSyncKey(syncKey);
    if (!editing) {
      setDraft(committedValue);
    }
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if ("select" in inputRef.current && type !== "textarea") {
        inputRef.current.select();
      }
    }
  }, [editing, type]);

  if (!hasPermission && hideIfDenied) return null;

  const startEditing = () => {
    if (effectiveDisabled || readOnly || saving) return;
    setDraft(committedValue);
    setSaveError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(committedValue);
    setSaveError(null);
    setEditing(false);
    onCancel?.();
  };

  const confirmEditing = async () => {
    if (saving) return;
    const next = type === "textarea" ? draft : draft.trim();
    if (next === committedValue) {
      setEditing(false);
      setSaveError(null);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await onSave?.(next);
      if (!isControlled) setUncontrolled(next);
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    const isEmpty = !committedValue;
    const selectLabel =
      type === "select"
        ? (options.find((o) => o.value === committedValue)?.label ?? committedValue)
        : committedValue;

    const rendered = isEmpty
      ? placeholder
      : formatDisplay
        ? formatDisplay(committedValue)
        : selectLabel;

    return (
      <div
        data-component-id={componentId}
        role={!readOnly && !effectiveDisabled ? "button" : undefined}
        tabIndex={!readOnly && !effectiveDisabled ? 0 : undefined}
        onClick={trigger === "click" ? startEditing : undefined}
        onDoubleClick={trigger === "doubleClick" ? startEditing : undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startEditing();
          }
        }}
        className={twMerge(
          "group/inline inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          TEXT_SIZE[size],
          !readOnly &&
            !effectiveDisabled &&
            "cursor-pointer hover:bg-surface-hover",
          effectiveDisabled && "opacity-55 cursor-not-allowed",
          isEmpty ? "text-muted-foreground italic" : "text-foreground",
          className
        )}
      >
        <span className={twMerge("min-w-0", type === "textarea" ? "whitespace-pre-wrap" : "truncate")}>
          {rendered}
        </span>
        {!readOnly && !effectiveDisabled && (
          <Pencil
            size={12}
            className="shrink-0 text-muted-foreground opacity-0 group-hover/inline:opacity-100 transition-opacity"
          />
        )}
      </div>
    );
  }

  const sharedInputCls = twMerge(
    "w-full rounded-lg border border-primary bg-surface px-2.5 py-1 text-foreground outline-none ring-2 ring-primary/15",
    TEXT_SIZE[size],
    inputClassName
  );

  return (
    <div
      data-component-id={componentId}
      className={twMerge("flex flex-col gap-1", className)}
    >
      <div className="flex items-start gap-1.5">
        {type === "textarea" ? (
          <textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            rows={3}
            value={draft}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (!showActions) {
                if (blurAction === "save") void confirmEditing();
                else cancelEditing();
              }
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                void confirmEditing();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEditing();
              }
            }}
            className={sharedInputCls}
          />
        ) : type === "select" ? (
          <select
            ref={(el) => {
              inputRef.current = el;
            }}
            value={draft}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void confirmEditing();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEditing();
              }
            }}
            className={sharedInputCls}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            type={type}
            value={draft}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (!showActions) {
                if (blurAction === "save") void confirmEditing();
                else cancelEditing();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void confirmEditing();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEditing();
              }
            }}
            className={sharedInputCls}
          />
        )}

        {showActions && (
          <div className="flex shrink-0 items-center gap-1 pt-0.5">
            <button
              type="button"
              aria-label="Salvar alteração"
              disabled={saving}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void confirmEditing()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            </button>
            <button
              type="button"
              aria-label="Cancelar edição"
              disabled={saving}
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelEditing}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {saveError && <p className="text-xs font-medium text-danger">{saveError}</p>}
    </div>
  );
}
