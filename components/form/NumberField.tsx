"use client";

import React, { useId } from "react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

export type NumberFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  // ── Identity ──────────────────────────────────────────────────────────────
  id?: string;
  name?: string;

  // ── Behaviour ─────────────────────────────────────────────────────────────
  placeholder?: string;
  value?: number | string;
  defaultValue?: number | string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Optional callback returning the parsed numeric value (or undefined if blank), handling comma/dot conversion automatically */
  onValueChange?: (value: number | undefined) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Increment / decrement step */
  step?: number | string;
  /** Fallback if field is left empty on blur. Defaults to false (allows empty on blur). Pass a number/string (e.g. 0) to auto-fill on blur. */
  defaultOnBlur?: number | string | false;

  // ── Appearance ────────────────────────────────────────────────────────────
  size?: "sm" | "md" | "lg";
  /** default = outlined border; filled = filled background */
  variant?: "default" | "filled";
  /** Icon rendered inside the input on the left */
  leftIcon?: React.ReactElement<{ className?: string; size?: number }>;
  /** Icon rendered inside the input on the right */
  rightIcon?: React.ReactElement<{ className?: string; size?: number }>;
  /** Text attached as a left addon (e.g. "R$") */
  prefix?: string;
  /** Text attached as a right addon (e.g. "kg", "%", "cm") */
  suffix?: string;
  inputClassName?: string;
  componentId?: string;
};

const SIZE = {
  sm: { h: "h-8",  text: "text-xs",   pl: "pl-2.5", pr: "pr-2.5", padL: "pl-8",  padR: "pr-8",  iconSz: 14, iL: "left-2.5", iR: "right-2.5", aff: "px-2.5 text-xs"  },
  md: { h: "h-10", text: "text-sm",   pl: "pl-3",   pr: "pr-3",   padL: "pl-9",  padR: "pr-9",  iconSz: 15, iL: "left-3",   iR: "right-3",   aff: "px-3 text-sm"    },
  lg: { h: "h-12", text: "text-base", pl: "pl-4",   pr: "pr-4",   padL: "pl-11", padR: "pr-11", iconSz: 17, iL: "left-4",   iR: "right-4",   aff: "px-4 text-base"  },
} as const;

export default function NumberField({
  label, labelInline, labelWidth, required, tooltip, error, helpText, width, className,
  id: idProp, name, placeholder,
  value, defaultValue, onChange, onValueChange, onBlur, onFocus,
  disabled, readOnly, autoFocus, autoComplete,
  min, max, step = "any", defaultOnBlur = false,
  size = "md", variant = "default",
  leftIcon, rightIcon, prefix, suffix,
  inputClassName, componentId,
}: NumberFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];
  const isControlled = value !== undefined;

  const normalizeNumDisplay = React.useCallback((v: number | string | null | undefined): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number' && Number.isNaN(v)) return '';
    if (v === 'NaN') return '';
    return String(v);
  }, []);

  const displayValue = React.useMemo(
    () => normalizeNumDisplay(value),
    [normalizeNumDisplay, value]
  );

  const [localText, setLocalText] = React.useState<string>(() =>
    normalizeNumDisplay(isControlled ? value : defaultValue)
  );
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (isControlled && !isFocused) {
      setLocalText(displayValue);
    }
  }, [displayValue, isControlled, isFocused]);

  const inputCls = twMerge(
    "flex-1 min-w-0 bg-transparent outline-none border-0 ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
    // Hide native spinners (cross-browser)
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    s.h, s.text,
    leftIcon  ? s.padL : s.pl,
    rightIcon ? s.padR : s.pr,
    (disabled || readOnly) && "cursor-not-allowed",
    inputClassName,
  );

  const wrapCls = twMerge(
    "relative flex w-full items-center overflow-hidden rounded-lg border transition-all duration-150",
    variant === "filled"
      ? "bg-zinc-100 border-transparent hover:bg-zinc-200/70 focus-within:bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-500/10 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 dark:focus-within:bg-zinc-900 dark:focus-within:border-zinc-600"
      : "bg-white border-zinc-300 hover:border-zinc-400 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500/10 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-600 dark:focus-within:border-zinc-500",
    error && "border-red-400 hover:border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10",
    (disabled || readOnly) && "opacity-60 pointer-events-none bg-zinc-50 dark:bg-zinc-800/50",
  );

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (isControlled) {
      setLocalText(displayValue);
    }
    try {
      e.target.select();
    } catch {}
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const raw = e.target.value.trim();
    if (raw === '' && defaultOnBlur !== false) {
      const fallback = defaultOnBlur !== undefined
        ? String(defaultOnBlur)
        : (min !== undefined && min > 0 ? String(min) : '0');
      setLocalText(fallback);
      e.target.value = fallback;

      const fallbackNum = Number(fallback.replace(',', '.'));
      const validNum = !Number.isNaN(fallbackNum) ? fallbackNum : undefined;

      try {
        (e as any).valueAsNumber = validNum;
        (e as any).valueOf = () => (validNum ?? 0);
      } catch {}

      onValueChange?.(validNum);
      onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Filter to only valid numeric characters
    raw = raw.replace(/[^0-9.,-]/g, '');

    // Normalize multiple minus signs: only allow at beginning
    if (raw.includes('-')) {
      const isNeg = raw.startsWith('-');
      raw = (isNeg ? '-' : '') + raw.replace(/-/g, '');
    }

    // Convert comma to dot for unified decimal handling
    raw = raw.replace(/,/g, '.');

    // Ensure at most one decimal point
    const dotIndex = raw.indexOf('.');
    if (dotIndex !== -1) {
      raw = raw.slice(0, dotIndex + 1) + raw.slice(dotIndex + 1).replace(/\./g, '');
    }

    // Strip leading zero if followed by another digit (e.g. '01' -> '1', '015' -> '15', but keep '0.' or '0')
    if (/^-?0[0-9]/.test(raw)) {
      const isNeg = raw.startsWith('-');
      const numPart = (isNeg ? raw.slice(1) : raw).replace(/^0+/, '');
      raw = (isNeg ? '-' : '') + (numPart === '' ? '0' : numPart);
    }

    setLocalText(raw);
    e.target.value = raw;

    const parsedNumber = raw === '' || raw === '-' || raw === '.' || raw === '-.' ? undefined : Number(raw);
    const validNumber = parsedNumber !== undefined && !Number.isNaN(parsedNumber) ? parsedNumber : undefined;

    // Attach numeric value helpers directly to the event object
    // This protects against callers doing Number(event) or event.valueAsNumber
    try {
      (e as any).valueAsNumber = validNumber;
      (e as any).valueOf = () => (validNumber ?? 0);
    } catch {}

    onValueChange?.(validNumber);
    onChange?.(e);
  };

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
          <span className={twMerge("shrink-0 select-none self-stretch flex items-center border-r border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400", s.aff)}>
            {prefix}
          </span>
        )}
        <input
          id={id} name={name} type="text" inputMode="decimal" placeholder={placeholder}
          value={isFocused || !isControlled ? localText : displayValue}
          onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
          disabled={disabled} readOnly={readOnly} autoFocus={autoFocus}
          autoComplete={autoComplete ?? "off"}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={inputCls}
          data-component-id={componentId || (idProp ? `erp.form.number.${idProp}` : undefined)}
        />
        {suffix && (
          <span className={twMerge("shrink-0 select-none self-stretch flex items-center border-l border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400", s.aff)}>
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
