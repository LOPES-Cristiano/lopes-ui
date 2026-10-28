"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

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
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
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

  const currentText = value !== undefined ? (value ?? "") : uncontrolledText;
  const canClear = clearable && Boolean(currentText) && !effectiveDisabled && !readOnly;

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) {
      setUncontrolledText(e.target.value);
    }
    adjustHeight();
    onChange?.(e);
  };

  const handleClear = () => {
    if (value === undefined) {
      setUncontrolledText("");
    }
    if (textareaRef.current) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      setter?.call(textareaRef.current, "");
      textareaRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      textareaRef.current.focus();
    }
    onClear?.();
  };

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const countNode = showCount ? (
    <span className="tabular-nums text-[11px] text-zinc-400 dark:text-zinc-500">
      {maxLength !== undefined ? `${currentText.length}/${maxLength}` : currentText.length}
    </span>
  ) : null;

  return (
    <FieldWrapper
      id={id}
      label={label}
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
      <div className="relative">
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
          onFocus={onFocus}
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
            "w-full rounded-lg font-sans transition-colors duration-150 outline-none",
            "text-zinc-900 placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
            "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800/60 dark:disabled:text-zinc-500",
            "read-only:cursor-default read-only:bg-zinc-50 dark:read-only:bg-zinc-800/40",
            autoResize && "resize-none overflow-y-auto",
            SIZE[size],
            canClear && "pr-8",
            variant === "default" && [
              "border bg-white dark:bg-zinc-900",
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-zinc-300 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:focus:border-primary",
            ],
            variant === "filled" && [
              "border border-transparent bg-zinc-100 dark:bg-zinc-800",
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-white dark:focus:bg-zinc-900"
                : "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-zinc-900",
            ],
            textareaClassName,
          )}
        />
        {canClear && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Limpar texto"
            onClick={handleClear}
            className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}
