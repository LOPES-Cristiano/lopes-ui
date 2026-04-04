"use client";

import React, { useId } from "react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

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
  autoFocus?: boolean;
  /** Minimum character length */
  minLength?: number;
  /** Maximum character length */
  maxLength?: number;

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
};

const SIZE = {
  sm: { h: "h-8",  text: "text-xs",   pl: "pl-2.5", pr: "pr-2.5", padL: "pl-8",  padR: "pr-8",  iconSz: 14, iL: "left-2.5", iR: "right-2.5", aff: "px-2.5 text-xs"  },
  md: { h: "h-10", text: "text-sm",   pl: "pl-3",   pr: "pr-3",   padL: "pl-9",  padR: "pr-9",  iconSz: 15, iL: "left-3",   iR: "right-3",   aff: "px-3 text-sm"    },
  lg: { h: "h-12", text: "text-base", pl: "pl-4",   pr: "pr-4",   padL: "pl-11", padR: "pr-11", iconSz: 17, iL: "left-4",   iR: "right-4",   aff: "px-4 text-base"  },
} as const;

export default function TextField({
  label, labelInline, labelWidth, required, tooltip, error, helpText, width, className,
  id: idProp, name, type = "text", placeholder,
  value, defaultValue, onChange, onBlur, onFocus, onKeyDown,
  disabled, readOnly, autoComplete, autoFocus, minLength, maxLength,
  size = "md", variant = "default",
  leftIcon, rightIcon, prefix, suffix,
  inputClassName, componentId,
}: TextFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];

  const inputCls = twMerge(
    "flex-1 min-w-0 bg-transparent outline-none border-0 ring-0 placeholder:text-zinc-400",
    s.h, s.text,
    leftIcon  ? s.padL : prefix ? "pl-0" : s.pl,
    rightIcon ? s.padR : suffix ? "pr-0" : s.pr,
    (disabled || readOnly) && "cursor-not-allowed",
    inputClassName,
  );

  const wrapCls = twMerge(
    "relative flex w-full items-center overflow-hidden rounded-lg border transition-all duration-150",
    variant === "filled"
      ? "bg-zinc-100 border-transparent hover:bg-zinc-200/70 focus-within:bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-500/10"
      : "bg-white border-zinc-300 hover:border-zinc-400 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500/10",
    error && "border-red-400 hover:border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10",
    (disabled || readOnly) && "opacity-60 pointer-events-none bg-zinc-50",
  );

  return (
    <FieldWrapper
      id={id} label={label} labelInline={labelInline} labelWidth={labelWidth}
      required={required} tooltip={tooltip} error={error} helpText={helpText}
      width={width} className={className}
    >
      <div className={wrapCls}>
        {leftIcon && (
          <span className={twMerge("pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-400", s.iL)}>
            {React.cloneElement(leftIcon, { size: s.iconSz })}
          </span>
        )}
        {prefix && (
          <span className={twMerge("shrink-0 select-none self-stretch flex items-center border-r border-zinc-200 bg-zinc-50 text-zinc-500", s.aff)}>
            {prefix}
          </span>
        )}
        <input
          id={id} name={name} type={type} placeholder={placeholder}
          value={value} defaultValue={defaultValue}
          onChange={onChange} onBlur={onBlur} onFocus={onFocus} onKeyDown={onKeyDown}
          disabled={disabled} readOnly={readOnly}
          autoComplete={autoComplete} autoFocus={autoFocus}
          minLength={minLength} maxLength={maxLength}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={inputCls}
          {...(componentId ? { "data-component-id": componentId } as any : {})}
        />
        {suffix && (
          <span className={twMerge("shrink-0 select-none self-stretch flex items-center border-l border-zinc-200 bg-zinc-50 text-zinc-500", s.aff)}>
            {suffix}
          </span>
        )}
        {rightIcon && (
          <span className={twMerge("pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-400", s.iR)}>
            {React.cloneElement(rightIcon, { size: s.iconSz })}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
}
