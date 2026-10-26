"use client";

import React, { useId, useRef } from "react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { Calendar } from "lucide-react";

export type DateFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  /** "date" = only date, "datetime" = date + time, "month" = month (YYYY-MM) */
  mode?: "date" | "datetime" | "month";
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  /** Min date in ISO format (YYYY-MM-DD) */
  min?: string;
  /** Max date in ISO format (YYYY-MM-DD) */
  max?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
  inputClassName?: string;
  componentId?: string;
};

const SIZE = {
  sm: { h: "h-8",  text: "text-xs",   pl: "pl-8",  iconSz: 14, iL: "left-2.5" },
  md: { h: "h-10", text: "text-sm",   pl: "pl-9",  iconSz: 15, iL: "left-3"   },
  lg: { h: "h-12", text: "text-base", pl: "pl-11", iconSz: 17, iL: "left-4"   },
} as const;

export default function DateField({
  label, labelInline, labelWidth, required, tooltip, error, helpText, width, className,
  id: idProp, name, mode = "date",
  value, defaultValue, onChange, onBlur,
  disabled, readOnly, min, max,
  size = "md", variant = "default",
  inputClassName, componentId,
}: DateFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];
  const inputRef = useRef<HTMLInputElement>(null);

  function handleWrapperClick() {
    if (disabled || readOnly) return;
    try { inputRef.current?.showPicker(); } catch { inputRef.current?.focus(); }
  }

  const wrapCls = twMerge(
    "relative flex w-full items-center overflow-hidden rounded-lg border transition-all duration-150",
    variant === "filled"
      ? "bg-[var(--surface-muted)] border-transparent hover:bg-[var(--surface-hover)] focus-within:bg-[var(--surface)] focus-within:border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--ring)]/10"
      : "bg-[var(--input-background)] border-[var(--input-border)] hover:border-[var(--border-strong)] focus-within:border-[var(--ring)] focus-within:ring-2 focus-within:ring-[var(--ring)]/10",
    error && "border-red-400 hover:border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10",
    (disabled || readOnly) && "opacity-60 pointer-events-none bg-[var(--surface-muted)]",
  );

  const inputCls = twMerge(
    "flex-1 min-w-0 w-full bg-transparent outline-none border-0 ring-0 text-[var(--input-foreground)] [color-scheme:light] dark:[color-scheme:dark]",
    s.h, s.text, s.pl, "pr-3",
    (disabled || readOnly) && "cursor-not-allowed",
    inputClassName,
  );

  return (
    <FieldWrapper
      id={id} label={label} labelInline={labelInline} labelWidth={labelWidth}
      required={required} tooltip={tooltip} error={error} helpText={helpText}
      width={width} className={className}
    >
      <div className={twMerge(wrapCls, !disabled && !readOnly && "cursor-pointer")} onClick={handleWrapperClick}>
        <span className={twMerge("pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--surface-muted-foreground)]", s.iL)}>
          <Calendar size={s.iconSz} />
        </span>
        <input
          id={id} name={name}
          type={mode === "datetime" ? "datetime-local" : mode === "month" ? "month" : "date"}
          value={value === null ? '' : value} defaultValue={defaultValue}
          onChange={onChange} onBlur={onBlur}
          disabled={disabled} readOnly={readOnly}
          ref={inputRef}
          autoComplete="off"
          min={min} max={max}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={twMerge(inputCls, !disabled && !readOnly && "cursor-pointer")}
          data-component-id={componentId || (idProp ? `erp.form.date.${idProp}` : undefined)}
        />
      </div>
    </FieldWrapper>
  );
}
