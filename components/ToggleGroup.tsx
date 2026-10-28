"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export type ToggleVariant = "default" | "outline" | "pills";
export type ToggleSize = "sm" | "md" | "lg";

export type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
  componentId?: string;
  hideIfDenied?: boolean;
};

const SIZE_CLS: Record<ToggleSize, string> = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3 text-sm gap-2",
  lg: "h-11 px-4 text-base gap-2",
};

const VARIANT_CLS: Record<ToggleVariant, { base: string; active: string }> = {
  default: {
    base: "rounded-lg bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
    active: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs",
  },
  outline: {
    base: "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100",
    active: "border-indigo-500/60 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500/60 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold shadow-2xs",
  },
  pills: {
    base: "rounded-full bg-transparent text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
    active: "bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100 font-semibold",
  },
};

export function Toggle({
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  variant = "default",
  size = "md",
  disabled,
  componentId,
  hideIfDenied = false,
  className,
  onClick,
  children,
  ...props
}: ToggleProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultPressed);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);
  const isPressed = controlledPressed ?? uncontrolled;

  if (!hasPermission && hideIfDenied) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (effectiveDisabled) return;
    const next = !isPressed;
    if (controlledPressed === undefined) setUncontrolled(next);
    onPressedChange?.(next);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      aria-pressed={isPressed}
      data-state={isPressed ? "on" : "off"}
      data-component-id={componentId}
      disabled={effectiveDisabled}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        SIZE_CLS[size],
        VARIANT_CLS[variant].base,
        isPressed && VARIANT_CLS[variant].active,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export type ToggleGroupOption = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

type ToggleGroupContextValue = {
  variant: ToggleVariant;
  size: ToggleSize;
  disabled?: boolean;
  isSelected: (val: string) => boolean;
  toggleValue: (val: string) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export type ToggleGroupProps = {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
  options?: ToggleGroupOption[];
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function ToggleGroupItem({
  value,
  disabled: itemDisabled,
  componentId,
  hideIfDenied = false,
  className,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string;
  componentId?: string;
  hideIfDenied?: boolean;
}) {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error("ToggleGroupItem must be used inside ToggleGroup");
  }
  const active = ctx.isSelected(value);
  const isDisabled = ctx.disabled || itemDisabled;

  return (
    <Toggle
      pressed={active}
      disabled={isDisabled}
      componentId={componentId}
      hideIfDenied={hideIfDenied}
      variant={ctx.variant}
      size={ctx.size}
      onPressedChange={() => ctx.toggleValue(value)}
      className={className}
      {...props}
    >
      {children}
    </Toggle>
  );
}

export default function ToggleGroup({
  type = "single",
  value: controlledValue,
  defaultValue,
  onValueChange,
  options,
  variant = "default",
  size = "md",
  disabled,
  componentId,
  hideIfDenied = false,
  className,
  children,
}: ToggleGroupProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (type === "multiple" ? [] : ""),
  );
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  if (!hasPermission && hideIfDenied) return null;

  const current = controlledValue ?? internalValue;

  const isSelected = (val: string): boolean => {
    if (Array.isArray(current)) return current.includes(val);
    return current === val;
  };

  const toggleValue = (val: string) => {
    if (effectiveDisabled) return;
    if (type === "multiple") {
      const arr = Array.isArray(current) ? current : [];
      const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    } else {
      const next = current === val ? "" : val;
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    }
  };

  return (
    <ToggleGroupContext.Provider value={{ variant, size, disabled: effectiveDisabled, isSelected, toggleValue }}>
      <div
        role="group"
        data-slot="toggle-group"
        data-component-id={componentId}
        className={cn(
          "inline-flex flex-wrap items-center gap-1 max-w-full",
          variant === "pills" && "rounded-2xl sm:rounded-full bg-zinc-100 dark:bg-zinc-800/80 p-1",
          className,
        )}
      >
        {options
          ? options.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                componentId={opt.componentId ?? (componentId ? `${componentId}.${opt.value}` : undefined)}
                hideIfDenied={opt.hideIfDenied}
                aria-label={opt.ariaLabel}
              >
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                {opt.label}
              </ToggleGroupItem>
            ))
          : children}
      </div>
    </ToggleGroupContext.Provider>
  );
}
