"use client";

import React, { useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff, X } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type TextFieldMask =
  | "cpf"
  | "cnpj"
  | "cpf-cnpj"
  | "cep"
  | "phone"
  | "date"
  | "time"
  | "plate"
  | "nfe-key";

export type TextFieldVariant =
  | "default"
  | "filled"
  | "contained"
  | "floating"
  | "underlined"
  | "borderless";

export function applyInputMask(
  input: string,
  mask: TextFieldMask | ((val: string) => string)
): { formatted: string; unmasked: string } {
  if (typeof mask === "function") {
    const formatted = mask(input);
    return { formatted, unmasked: input.replace(/[^a-zA-Z0-9]/g, "") };
  }

  if (mask === "plate") {
    const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
    const formatted =
      clean.length > 3 ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean;
    return { formatted, unmasked: clean };
  }

  const digits = input.replace(/\D/g, "");

  switch (mask) {
    case "cpf": {
      const d = digits.slice(0, 11);
      let f = d;
      if (d.length > 9) f = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
      else if (d.length > 6) f = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
      else if (d.length > 3) f = `${d.slice(0, 3)}.${d.slice(3)}`;
      return { formatted: f, unmasked: d };
    }
    case "cnpj": {
      const d = digits.slice(0, 14);
      let f = d;
      if (d.length > 12)
        f = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
      else if (d.length > 8)
        f = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
      else if (d.length > 5) f = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
      else if (d.length > 2) f = `${d.slice(0, 2)}.${d.slice(2)}`;
      return { formatted: f, unmasked: d };
    }
    case "cpf-cnpj": {
      return digits.length <= 11
        ? applyInputMask(digits, "cpf")
        : applyInputMask(digits, "cnpj");
    }
    case "cep": {
      const d = digits.slice(0, 8);
      const f = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
      return { formatted: f, unmasked: d };
    }
    case "phone": {
      const d = digits.slice(0, 11);
      let f = d;
      if (d.length > 10) f = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
      else if (d.length > 6) f = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      else if (d.length > 2) f = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      else if (d.length > 0) f = `(${d}`;
      return { formatted: f, unmasked: d };
    }
    case "date": {
      const d = digits.slice(0, 8);
      let f = d;
      if (d.length > 4) f = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
      else if (d.length > 2) f = `${d.slice(0, 2)}/${d.slice(2)}`;
      return { formatted: f, unmasked: d };
    }
    case "time": {
      const d = digits.slice(0, 4);
      const f = d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
      return { formatted: f, unmasked: d };
    }
    case "nfe-key": {
      const d = digits.slice(0, 44);
      const groups = d.match(/.{1,4}/g) ?? [];
      return { formatted: groups.join(" "), unmasked: d };
    }
  }
}

function countAlnum(str: string): number {
  return (str.match(/[a-zA-Z0-9]/g) ?? []).length;
}

function caretPosFromAlnumCount(formatted: string, targetCount: number): number {
  if (targetCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/[a-zA-Z0-9]/.test(formatted[i])) {
      seen++;
      if (seen === targetCount) return i + 1;
    }
  }
  return formatted.length;
}

export type TextFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;

  type?: "text" | "email" | "url" | "password" | "search" | "tel";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Convenient callback receiving `(formattedValue, unmaskedRawValue)` */
  onValueChange?: (formatted: string, unmasked: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  minLength?: number;
  maxLength?: number;
  /** Progressive input mask (e.g. `"cpf-cnpj"`, `"phone"`, `"cep"`, `"date"`, `"plate"`) */
  mask?: TextFieldMask | ((val: string) => string);
  /** Built-in password visibility toggle when type="password" (default: true) */
  showPasswordToggle?: boolean;
  /** Renders a clear (×) button when the field has text */
  clearable?: boolean;
  /** Callback invoked when the clear button is clicked */
  onClear?: () => void;
  /** Shows a live character counter (e.g. "12/50") */
  showCount?: boolean;

  size?: "sm" | "md" | "lg";
  /**
   * - `"default"`: Outlined border with external label
   * - `"filled"`: Soft surface background with external label
   * - `"contained"`: Mantine UI signature contained label inside the bordered box
   * - `"floating"`: Animated floating label that lifts on focus or value
   */
  variant?: TextFieldVariant;
  /** Icon rendered inside the input on the left */
  leftIcon?: React.ReactElement<{ className?: string; size?: number }>;
  /** Icon rendered inside the input on the right */
  rightIcon?: React.ReactElement<{ className?: string; size?: number }>;
  /** Interactive custom node rendered inside the left section (e.g. select or badge) */
  leftSection?: React.ReactNode;
  /** Interactive custom node rendered inside the right section (e.g. lookup button or currency select) */
  rightSection?: React.ReactNode;
  /** Text attached as a left addon (e.g. "https://") */
  prefix?: string;
  /** Text attached as a right addon (e.g. ".com" | "kg") */
  suffix?: string;
  /** Ant Design outer left addon node (rendered in a shaded attached box before the input) */
  addonBefore?: React.ReactNode;
  /** Ant Design outer right addon node (rendered in a shaded attached box after the input) */
  addonAfter?: React.ReactNode;
  inputClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const SIZE = {
  sm: {
    h: "h-8",
    text: "text-xs",
    pl: "pl-2.5",
    pr: "pr-2.5",
    padL: "pl-8",
    padR: "pr-8",
    iconSz: 14,
    iL: "left-2.5",
    iR: "right-2.5",
    aff: "px-2.5 text-xs",
  },
  md: {
    h: "h-10",
    text: "text-sm",
    pl: "pl-3",
    pr: "pr-3",
    padL: "pl-9",
    padR: "pr-9",
    iconSz: 15,
    iL: "left-3",
    iR: "right-3",
    aff: "px-3 text-sm",
  },
  lg: {
    h: "h-12",
    text: "text-base",
    pl: "pl-4",
    pr: "pr-4",
    padL: "pl-11",
    padR: "pr-11",
    iconSz: 17,
    iL: "left-4",
    iR: "right-4",
    aff: "px-4 text-base",
  },
} as const;

export default function TextField({
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
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  onValueChange,
  onBlur,
  onFocus,
  onKeyDown,
  disabled,
  readOnly,
  autoComplete,
  inputMode,
  autoFocus,
  minLength,
  maxLength,
  mask,
  showPasswordToggle = true,
  clearable = false,
  onClear,
  showCount = false,
  size = "sm",
  variant = "default",
  leftIcon,
  rightIcon,
  leftSection,
  rightSection,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  inputClassName,
  componentId,
  hideIfDenied = false,
}: TextFieldProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const effectiveDisabled = disabled || !hasPermission;
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const s = SIZE[size];

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [uncontrolledText, setUncontrolledText] = useState(() => {
    const initial = defaultValue ?? "";
    return mask && initial ? applyInputMask(initial, mask).formatted : initial;
  });

  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorRef = React.useRef<number | null>(null);

  const rawControlled = value !== undefined ? (value ?? "") : undefined;
  const currentText =
    rawControlled !== undefined
      ? mask && rawControlled
        ? applyInputMask(rawControlled, mask).formatted
        : rawControlled
      : uncontrolledText;

  const isPasswordField = type === "password";
  const canTogglePassword = isPasswordField && showPasswordToggle && !effectiveDisabled;
  const canClear = clearable && Boolean(currentText) && !effectiveDisabled && !readOnly;
  const resolvedType = isPasswordField && passwordVisible ? "text" : type;

  const isContained = variant === "contained" && Boolean(label);
  const isFloating = variant === "floating" && Boolean(label);
  const isInternalLabel = isContained || isFloating;

  const resolvedInputMode =
    inputMode ??
    (mask && mask !== "plate" && typeof mask === "string" ? "numeric" : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      const rawVal = e.target.value;
      const sel = e.target.selectionStart ?? rawVal.length;
      const alnumBefore = countAlnum(rawVal.slice(0, sel));
      const { formatted, unmasked } = applyInputMask(rawVal, mask);
      const nextCaret = caretPosFromAlnumCount(formatted, alnumBefore);
      cursorRef.current = nextCaret;

      if (e.target.value !== formatted) {
        e.target.value = formatted;
      }
      if (value === undefined) {
        setUncontrolledText(formatted);
      }
      onChange?.(e);
      onValueChange?.(formatted, unmasked);
      requestAnimationFrame(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
          try {
            inputRef.current.setSelectionRange(nextCaret, nextCaret);
          } catch {
            // ignore
          }
        }
      });
      return;
    }

    cursorRef.current = e.target.selectionStart;
    if (value === undefined) {
      setUncontrolledText(e.target.value);
    }
    onChange?.(e);
    onValueChange?.(e.target.value, e.target.value);
  };

  const handleClear = () => {
    if (value === undefined) {
      setUncontrolledText("");
    }
    if (inputRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(inputRef.current, "");
      const event = new Event("input", { bubbles: true });
      inputRef.current.dispatchEvent(event);
      inputRef.current.focus();
    }
    onValueChange?.("", "");
    onClear?.();
  };

  React.useLayoutEffect(() => {
    if (
      inputRef.current &&
      cursorRef.current !== null &&
      document.activeElement === inputRef.current
    ) {
      try {
        inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      } catch {
        // ignore
      }
    }
  }, [currentText]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const countNode = showCount ? (
    <span className="tabular-nums text-[11px] text-muted-foreground">
      {maxLength !== undefined ? `${currentText.length}/${maxLength}` : currentText.length}
    </span>
  ) : null;

  const resolvedLabelAction = labelAction ?? countNode;

  // ── Contained / Floating Mantine-inspired variants ──────────────────────────
  if (isInternalLabel) {
    const floated = isContained || focused || currentText.length > 0 || Boolean(placeholder && isContained);

    return (
      <FieldWrapper
        id={id}
        label={undefined}
        tooltip={tooltip}
        error={error}
        helpText={helpText}
        hint={hint}
        width={width}
        className={className}
      >
        <div
          onClick={() => inputRef.current?.focus()}
          className={twMerge(
            "relative flex items-center rounded-xl border bg-surface transition-all duration-150",
            error
              ? "border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20"
              : "border-input-border hover:border-border-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
            effectiveDisabled && "opacity-60 cursor-not-allowed bg-surface-muted"
          )}
        >
          {leftSection && (
            <div className="flex shrink-0 items-center pl-2.5 text-muted-foreground">
              {leftSection}
            </div>
          )}
          {leftIcon && !leftSection && (
            <span className="pointer-events-none pl-3 text-muted-foreground">
              {React.cloneElement(leftIcon, { size: s.iconSz })}
            </span>
          )}

          <div className="relative flex-1 min-w-0 px-3 pt-4 pb-1.5">
            <label
              htmlFor={id}
              className={twMerge(
                "pointer-events-none absolute left-3 origin-top-left select-none font-medium transition-all duration-150",
                error ? "text-danger" : focused ? "text-primary" : "text-muted-foreground",
                isContained
                  ? "top-1.5 text-[11px] font-semibold tracking-tight"
                  : floated
                    ? "top-1.5 text-[10.5px] font-semibold"
                    : "top-1/2 -translate-y-1/2 text-sm"
              )}
            >
              {label}
              {required && <span className="ml-0.5 text-danger">*</span>}
            </label>

            <input
              ref={inputRef}
              id={id}
              data-component-id={componentId}
              name={name ?? `input_off_${id}`}
              type={resolvedType}
              placeholder={isFloating && !focused ? "" : placeholder}
              value={value !== undefined ? currentText : undefined}
              defaultValue={value === undefined ? uncontrolledText : undefined}
              onChange={handleChange}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              onKeyDown={onKeyDown}
              disabled={effectiveDisabled}
              readOnly={readOnly}
              autoComplete={autoComplete ?? (type === "password" ? "current-password" : "off")}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode={resolvedInputMode}
              autoFocus={autoFocus}
              minLength={minLength}
              maxLength={maxLength}
              required={required}
              aria-invalid={error ? true : undefined}
              className={twMerge(
                "w-full bg-transparent pt-1 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed",
                inputClassName
              )}
            />
          </div>

          {(canClear || canTogglePassword || rightIcon || rightSection || showCount) && (
            <div className="flex shrink-0 items-center gap-1 pr-2.5 text-muted-foreground">
              {countNode}
              {canClear && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Limpar campo"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
              {canTogglePassword && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPasswordVisible((prev) => !prev);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                >
                  {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
              {rightIcon && (
                <span className="pointer-events-none inline-flex items-center">
                  {React.cloneElement(rightIcon, { size: s.iconSz })}
                </span>
              )}
              {rightSection}
            </div>
          )}
        </div>
      </FieldWrapper>
    );
  }

  // ── Standard ("default" | "filled" | "underlined" | "borderless") Variants ──
  const resolvedAddonBefore = addonBefore ?? prefix;
  const resolvedAddonAfter = addonAfter ?? suffix;
  const hasInteractiveRight = canTogglePassword || canClear;
  const hasAffix = Boolean(
    leftIcon ||
      rightIcon ||
      leftSection ||
      rightSection ||
      resolvedAddonBefore ||
      resolvedAddonAfter ||
      hasInteractiveRight
  );

  const baseInput = twMerge(
    "w-full font-sans transition-colors duration-150 outline-hidden",
    "text-zinc-900 placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800/60 dark:disabled:text-zinc-500",
    "read-only:cursor-default read-only:bg-zinc-50 dark:read-only:bg-zinc-800/40",
    s.h,
    s.text
  );

  const standaloneCls = twMerge(
    baseInput,
    s.pl,
    s.pr,
    variant === "underlined" ? "rounded-none px-1" : "rounded-md",
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
    variant === "underlined" && [
      "border-0 border-b-2 bg-transparent",
      error
        ? "border-b-rose-500 focus:border-b-rose-500"
        : "border-b-zinc-300 dark:border-b-zinc-700 focus:border-b-primary",
    ],
    variant === "borderless" && [
      "border border-transparent bg-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50",
      error && "text-rose-600 dark:text-rose-400",
    ],
    inputClassName
  );

  const wrapCls = twMerge(
    "relative flex items-center transition-colors duration-150 overflow-hidden",
    variant === "underlined" ? "rounded-none" : "rounded-md",
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
    variant === "underlined" && [
      "border-0 border-b-2 bg-transparent",
      error
        ? "border-b-rose-500 focus-within:border-b-rose-500"
        : "border-b-zinc-300 dark:border-b-zinc-700 focus-within:border-b-primary",
    ],
    variant === "borderless" && [
      "border border-transparent bg-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50",
    ]
  );

  const rightPadClass = rightSection
    ? "pr-2"
    : (canTogglePassword && canClear) || ((canTogglePassword || canClear) && rightIcon)
      ? "pr-14"
      : rightIcon || canTogglePassword || canClear
        ? s.padR
        : s.pr;

  const inputCls = twMerge(
    baseInput,
    "bg-transparent border-0 focus:ring-0 focus:outline-hidden",
    leftIcon && !leftSection ? s.padL : s.pl,
    rightPadClass,
    inputClassName
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
          value={value !== undefined ? currentText : undefined}
          defaultValue={value === undefined ? uncontrolledText : undefined}
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
          inputMode={resolvedInputMode}
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
          {leftSection && (
            <div className="flex shrink-0 items-center self-stretch border-r border-zinc-200 dark:border-zinc-700 px-2">
              {leftSection}
            </div>
          )}
          {leftIcon && !leftSection && (
            <span
              className={twMerge(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-400",
                s.iL
              )}
            >
              {React.cloneElement(leftIcon, { size: s.iconSz })}
            </span>
          )}
          {resolvedAddonBefore && (
            <span
              className={twMerge(
                "shrink-0 select-none self-stretch flex items-center border-r border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                s.aff
              )}
            >
              {resolvedAddonBefore}
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            data-component-id={componentId}
            name={name ?? `input_off_${id}`}
            type={resolvedType}
            placeholder={placeholder}
            value={value !== undefined ? currentText : undefined}
            defaultValue={value === undefined ? uncontrolledText : undefined}
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
            inputMode={resolvedInputMode}
            autoFocus={autoFocus}
            minLength={minLength}
            maxLength={maxLength}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            className={inputCls}
          />
          {resolvedAddonAfter && (
            <span
              className={twMerge(
                "shrink-0 select-none self-stretch flex items-center border-l border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                s.aff
              )}
            >
              {resolvedAddonAfter}
            </span>
          )}
          {(rightIcon || hasInteractiveRight) && !rightSection && (
            <span
              className={twMerge(
                "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 text-zinc-400",
                s.iR
              )}
            >
              {canClear && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Limpar campo"
                  onClick={handleClear}
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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
          {rightSection && (
            <div className="flex shrink-0 items-center self-stretch border-l border-zinc-200 dark:border-zinc-700 px-1.5">
              {rightSection}
            </div>
          )}
        </div>
      )}
    </FieldWrapper>
  );
}
