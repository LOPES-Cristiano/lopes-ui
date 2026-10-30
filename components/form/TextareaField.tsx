"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Check, Copy, Maximize2, Minimize2, Plus, X } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type TextareaQuickInsert = {
  label: string;
  value: string;
};

export type TextareaFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  /** Automatically grows/shrinks height to fit content */
  autoResize?: boolean;
  /** Maximum height in pixels when autoResize is enabled */
  maxAutoHeight?: number;
  /** Shows a live character counter (e.g. "42/250") */
  showCount?: boolean;
  /** Shows a clear (×) button when text is present */
  clearable?: boolean;
  onClear?: () => void;
  /** Shows a one-click copy button in the top-right corner */
  copyable?: boolean;
  /** Allows opening a comfortable expanded modal overlay for long notes */
  expandable?: boolean;
  /** Optional clickable quick-insert chips rendered below the textarea */
  quickInserts?: TextareaQuickInsert[];
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "contained";
  textareaClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const SIZE = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-3 py-2",
  lg: "text-base px-4 py-2.5",
} as const;

export default function TextareaField({
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
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  disabled,
  readOnly,
  autoFocus,
  rows = 3,
  minLength,
  maxLength,
  autoResize = false,
  maxAutoHeight = 320,
  showCount = false,
  clearable = false,
  onClear,
  copyable = false,
  expandable = false,
  quickInserts,
  size = "md",
  variant = "default",
  textareaClassName,
  componentId,
  hideIfDenied = false,
}: TextareaFieldProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || !hasPermission;

  const autoId = useId();
  const id = idProp ?? autoId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uncontrolledText, setUncontrolledText] = useState(defaultValue ?? "");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const currentText = value !== undefined ? (value ?? "") : uncontrolledText;
  const canClear = clearable && Boolean(currentText) && !effectiveDisabled && !readOnly;
  const canCopy = copyable && Boolean(currentText);
  const isContained = variant === "contained" && Boolean(label);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !autoResize) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, maxAutoHeight);
    el.style.height = `${nextHeight}px`;
  }, [autoResize, maxAutoHeight]);

  useEffect(() => {
    adjustHeight();
  }, [currentText, adjustHeight]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  const dispatchNativeValue = (nextVal: string) => {
    if (value === undefined) {
      setUncontrolledText(nextVal);
    }
    if (textareaRef.current) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      setter?.call(textareaRef.current, nextVal);
      textareaRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      textareaRef.current.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) {
      setUncontrolledText(e.target.value);
    }
    adjustHeight();
    onChange?.(e);
  };

  const handleClear = () => {
    dispatchNativeValue("");
    onClear?.();
  };

  const handleInsertSnippet = (snippetText: string) => {
    if (effectiveDisabled || readOnly) return;
    const el = textareaRef.current;
    const start = el?.selectionStart ?? currentText.length;
    const end = el?.selectionEnd ?? currentText.length;
    const prefixSpace =
      start > 0 && !/\s$/.test(currentText.slice(0, start)) ? " " : "";
    const nextVal =
      currentText.slice(0, start) + prefixSpace + snippetText + currentText.slice(end);
    dispatchNativeValue(nextVal);
  };

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const countNode = showCount ? (
    <span className="tabular-nums text-[11px] text-muted-foreground">
      {maxLength !== undefined ? `${currentText.length}/${maxLength}` : currentText.length}
    </span>
  ) : null;

  const hasCornerActions = canClear || canCopy || expandable;

  return (
    <FieldWrapper
      id={id}
      label={isContained ? undefined : label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction ?? countNode}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div
        className={twMerge(
          "relative",
          isContained && [
            "rounded-xl border bg-surface px-3 pt-2 pb-1.5 transition-all duration-150",
            error
              ? "border-danger focus-within:ring-2 focus-within:ring-danger/20"
              : "border-input-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
          ]
        )}
      >
        {isContained && (
          <div className="mb-0.5 flex items-center justify-between">
            <label
              htmlFor={id}
              className="text-[11px] font-semibold tracking-tight text-muted-foreground"
            >
              {label}
              {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
            {countNode}
          </div>
        )}

        <textarea
          ref={textareaRef}
          id={id}
          data-component-id={componentId}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value === null ? "" : value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
          onKeyDown={onKeyDown}
          disabled={effectiveDisabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={twMerge(
            "w-full font-sans transition-colors duration-150 outline-none",
            "text-foreground placeholder:text-muted-foreground/70",
            "disabled:cursor-not-allowed disabled:opacity-60",
            autoResize && "resize-none overflow-y-auto",
            isContained
              ? "bg-transparent text-sm p-0"
              : [
                  "rounded-lg",
                  SIZE[size],
                  hasCornerActions && "pr-16",
                  variant === "default" && [
                    "border bg-surface",
                    error
                      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
                      : "border-input-border focus:border-primary focus:ring-2 focus:ring-primary/20",
                  ],
                  variant === "filled" && [
                    "border border-transparent bg-surface-muted",
                    error
                      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20 focus:bg-surface"
                      : "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface",
                  ],
                ],
            textareaClassName
          )}
        />

        {hasCornerActions && (
          <div className="absolute right-2 top-2 flex items-center gap-0.5">
            {canCopy && (
              <button
                type="button"
                tabIndex={-1}
                title="Copiar texto"
                aria-label="Copiar texto"
                onClick={() => {
                  navigator.clipboard?.writeText(currentText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            )}
            {expandable && (
              <button
                type="button"
                tabIndex={-1}
                title="Expandir editor"
                aria-label="Expandir editor"
                onClick={() => setExpanded(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
              >
                <Maximize2 size={13} />
              </button>
            )}
            {canClear && (
              <button
                type="button"
                tabIndex={-1}
                aria-label="Limpar texto"
                onClick={handleClear}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Insert Snippet Chips */}
      {quickInserts && quickInserts.length > 0 && !readOnly && !effectiveDisabled && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {quickInserts.map((qi) => (
            <button
              key={qi.label}
              type="button"
              onClick={() => handleInsertSnippet(qi.value)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
            >
              <Plus size={10} />
              <span>{qi.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Expanded Fullscreen Modal for comfortable editing */}
      {expanded &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) setExpanded(false);
            }}
          >
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold">{label || "Edição expandida"}</span>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer"
                >
                  <Minimize2 size={14} />
                </button>
              </div>
              <textarea
                autoFocus
                rows={12}
                value={currentText}
                readOnly={readOnly}
                disabled={effectiveDisabled}
                placeholder={placeholder}
                onChange={(e) => dispatchNativeValue(e.target.value)}
                className="w-full resize-y bg-surface p-4 text-sm leading-relaxed text-foreground outline-none"
              />
              <div className="flex items-center justify-between border-t border-border bg-surface-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
                <span>{currentText.length} caracteres</span>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </FieldWrapper>
  );
}
