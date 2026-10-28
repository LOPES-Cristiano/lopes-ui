"use client";

import React, { useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff, X } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type TextFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  // ── Identity ──────────────────────────────────────────────────────────────
  id?: string;
  name?: string;

  // ── Behaviour ─────────────────────────────────────────────────────────────
  type?: "text" | "email" | "url" | "password" | "search" | "tel";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  /** Minimum character length */
  minLength?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Built-in password visibility toggle when type="password" (default: true) */
  showPasswordToggle?: boolean;
  /** Renders a clear (×) button when the field has text */
  clearable?: boolean;
  /** Callback invoked when the clear button is clicked */
  onClear?: () => void;
  /** Shows a live character counter (e.g. "12/50") */
  showCount?: boolean;

  // ── Appearance ────────────────────────────────────────────────────────────
  size?: "sm" | "md" | "lg";
  /** default = outlined border; filled = filled background */
  variant?: "default" | "filled";
  /** Icon rendered inside the input on the left */
  leftIcon?: React.ReactElement<{ className?: string; size?: number }>;
  /** Icon rendered inside the input on the right */
  rightIcon?: React.ReactElement<{ className?: string; size?: number }>;
  /** Text attached as a left addon (e.g. "https://") */
  prefix?: string;
  /** Text attached as a right addon (e.g. ".com" | "kg") */
  suffix?: string;
  inputClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const SIZE = {
  sm: { h: "h-8",  text: "text-xs",   pl: "pl-2.5", pr: "pr-2.5", padL: "pl-8",  padR: "pr-8",  iconSz: 14, iL: "left-2.5", iR: "right-2.5", aff: "px-2.5 text-xs"  },
  md: { h: "h-10", text: "text-sm",   pl: "pl-3",   pr: "pr-3",   padL: "pl-9",  padR: "pr-9",  iconSz: 15, iL: "left-3",   iR: "right-3",   aff: "px-3 text-sm"    },
  lg: { h: "h-12", text: "text-base", pl: "pl-4",   pr: "pr-4",   padL: "pl-11", padR: "pr-11", iconSz: 17, iL: "left-4",   iR: "right-4",   aff: "px-4 text-base"  },
} as const;

export default function TextField({
  label, labelInline, orientation, labelWidth, required, tooltip, labelAction, error, helpText, hint, width, className,
  id: idProp, name, type = "text", placeholder,
  value, defaultValue, onChange, onBlur, onFocus, onKeyDown,
  disabled, readOnly, autoComplete, inputMode, autoFocus, minLength, maxLength,
  showPasswordToggle = true, clearable = false, onClear, showCount = false,
  size = "sm", variant = "default",
  leftIcon, rightIcon, prefix, suffix,
  inputClassName, componentId, hideIfDenied = false,
}: TextFieldProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const effectiveDisabled = disabled || !hasPermission;
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const s = SIZE[size];

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [uncontrolledText, setUncontrolledText] = useState(defaultValue ?? "");

  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorRef = React.useRef<number | null>(null);

  const currentText = value !== undefined ? (value ?? "") : uncontrolledText;
  const isPasswordField = type === "password";
  const canTogglePassword = isPasswordField && showPasswordToggle && !effectiveDisabled;
  const canClear = clearable && Boolean(currentText) && !effectiveDisabled && !readOnly;
  const resolvedType = isPasswordField && passwordVisible ? "text" : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    cursorRef.current = e.target.selectionStart;
    if (value === undefined) {
      setUncontrolledText(e.target.value);
    }
    onChange?.(e);
  };

  const handleClear = () => {
    if (value === undefined) {
      setUncontrolledText("");
    }
    if (inputRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(inputRef.current, "");
      const event = new Event("input", { bubbles: true });
      inputRef.current.dispatchEvent(event);
      inputRef.current.focus();
    }
    onClear?.();
  };

  React.useLayoutEffect(() => {
    if (inputRef.current && cursorRef.current !== null && document.activeElement === inputRef.current) {
      try {
        inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      } catch {}
    }
  }, [value]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const hasInteractiveRight = canTogglePassword || canClear;
  const hasAffix = Boolean(leftIcon || rightIcon || prefix || suffix || hasInteractiveRight);

  const countNode = showCount ? (
    <span className="tabular-nums text-[11px] text-zinc-400 dark:text-zinc-500">
      {maxLength !== undefined ? `${currentText.length}/${maxLength}` : currentText.length}
    </span>
  ) : null;

  const resolvedLabelAction = labelAction ?? countNode;

  const baseInput = twMerge(
    "w-full font-sans transition-colors duration-150 outline-hidden",
    "text-zinc-900 placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800/60 dark:disabled:text-zinc-500",
    "read-only:cursor-default read-only:bg-zinc-50 dark:read-only:bg-zinc-800/40",
    s.h, s.text,
  );

  const standaloneCls = twMerge(
    baseInput,
    s.pl, s.pr,
    "rounded-md",
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
    inputClassName,
  );

  const wrapCls = twMerge(
    "relative flex items-center rounded-md transition-colors duration-150",
    variant === "default" && [
      "border bg-white dark:bg-zinc-900",
      error
        ? "border-rose-500 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
        : "border-zinc-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-zinc-700 dark:focus-within:border-primary",
    ],
    variant === "filled" && [
      "border border-transparent bg-zinc-100 dark:bg-zinc-800",
      error
        ? "border-rose-500 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:bg-white dark:focus-within:bg-zinc-900"
        : "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white dark:focus-within:bg-zinc-900",
    ],
  );

  const rightPadClass =
    (canTogglePassword && canClear) || ((canTogglePassword || canClear) && rightIcon)
      ? "pr-14"
      : rightIcon || canTogglePassword || canClear
        ? s.padR
        : s.pr;

  const inputCls = twMerge(
    baseInput,
    "bg-transparent border-0 focus:ring-0 focus:outline-hidden",
    leftIcon ? s.padL : s.pl,
    rightPadClass,
    inputClassName,
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
      labelAction={resolvedLabelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      {!hasAffix ? (
        <input
          ref={inputRef}
          id={id}
          data-component-id={componentId}
          name={name ?? `input_off_${id}`}
          type={resolvedType}
          placeholder={placeholder}
          value={value === null ? "" : value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          disabled={effectiveDisabled}
          readOnly={readOnly}
          autoComplete={autoComplete ?? (type === "password" ? "current-password" : "off")}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
          data-form-type="other"
          inputMode={inputMode}
          autoFocus={autoFocus}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={standaloneCls}
        />
      ) : (
        <div className={wrapCls}>
          {leftIcon && (
            <span className={twMerge("pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-400", s.iL)}>
              {React.cloneElement(leftIcon, { size: s.iconSz })}
            </span>
          )}
          {prefix && (
            <span className={twMerge("shrink-0 select-none self-stretch flex items-center border-r border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400", s.aff)}>
              {prefix}
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            data-component-id={componentId}
            name={name ?? `input_off_${id}`}
            type={resolvedType}
            placeholder={placeholder}
            value={value === null ? "" : value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            disabled={effectiveDisabled}
            readOnly={readOnly}
            autoComplete={autoComplete ?? (type === "password" ? "current-password" : "off")}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            inputMode={inputMode}
            autoFocus={autoFocus}
            minLength={minLength}
            maxLength={maxLength}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            className={inputCls}
          />
          {suffix && (
            <span className={twMerge("shrink-0 select-none self-stretch flex items-center border-l border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400", s.aff)}>
              {suffix}
            </span>
          )}
          {(rightIcon || hasInteractiveRight) && (
            <span className={twMerge("absolute top-1/2 -translate-y-1/2 flex items-center gap-1 text-zinc-400", s.iR)}>
              {canClear && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Limpar campo"
                  onClick={handleClear}
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X size={s.iconSz - 1} />
                </button>
              )}
              {canTogglePassword && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setPasswordVisible((prev) => !prev)}
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {passwordVisible ? <EyeOff size={s.iconSz} /> : <Eye size={s.iconSz} />}
                </button>
              )}
              {rightIcon && (
                <span className="pointer-events-none inline-flex items-center">
                  {React.cloneElement(rightIcon, { size: s.iconSz })}
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </FieldWrapper>
  );
}
