"use client";

import React from "react";
import { cn } from "@/utils/cn";
import FieldWrapper from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type InputGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
  label?: string;
  hint?: string;
  helpText?: string;
  error?: boolean | string;
  required?: boolean;
  tooltip?: string;
  disabled?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
};

const SIZE_CLS = {
  sm: "h-8 text-xs rounded-md",
  md: "h-10 text-sm rounded-lg",
  lg: "h-12 text-base rounded-lg",
} as const;

export function InputGroup({
  size = "sm",
  label,
  hint,
  helpText,
  error = false,
  required,
  tooltip,
  disabled = false,
  componentId,
  hideIfDenied = false,
  className,
  children,
  ...props
}: InputGroupProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  if (!hasPermission && hideIfDenied) return null;

  const groupNode = (
    <div
      role="group"
      data-slot="input-group"
      data-component-id={componentId}
      className={cn(
        "relative flex w-full items-stretch overflow-hidden border bg-white dark:bg-zinc-900 transition-all duration-150",
        SIZE_CLS[size],
        error
          ? "border-rose-500 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
          : "border-zinc-300 dark:border-zinc-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        effectiveDisabled && "opacity-60 pointer-events-none bg-zinc-100 dark:bg-zinc-800/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (label || hint || helpText || typeof error === "string") {
    return (
      <FieldWrapper
        label={label}
        hint={hint}
        helpText={helpText}
        error={typeof error === "string" ? error : undefined}
        required={required}
        tooltip={tooltip}
      >
        {groupNode}
      </FieldWrapper>
    );
  }

  return groupNode;
}

export type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end";
};

export function InputGroupAddon({
  align = "inline-start",
  className,
  children,
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex shrink-0 items-center gap-1.5 px-3 text-zinc-500 dark:text-zinc-400 select-none",
        align === "inline-start" && "border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 self-stretch",
        align === "inline-end" && "border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 self-stretch",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { componentId?: string; hideIfDenied?: boolean }
>(({ className, componentId, hideIfDenied = false, disabled, ...props }, ref) => {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  if (!hasPermission && hideIfDenied) return null;

  return (
    <input
      ref={ref}
      disabled={disabled || !hasPermission}
      data-slot="input-group-input"
      data-component-id={componentId}
      className={cn(
        "flex-1 min-w-0 bg-transparent px-3 py-1.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none border-0 ring-0",
        className,
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

export function InputGroupButton({
  className,
  type = "button",
  componentId,
  hideIfDenied = true,
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { componentId?: string; hideIfDenied?: boolean }) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  if (!hasPermission && hideIfDenied) return null;

  return (
    <button
      type={type}
      disabled={disabled || !hasPermission}
      data-slot="input-group-button"
      data-component-id={componentId}
      className={cn(
        "inline-flex shrink-0 self-stretch items-center justify-center gap-1.5 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/60 px-3 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function InputGroupText({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("text-xs text-zinc-500 dark:text-zinc-400 select-none", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default InputGroup;
