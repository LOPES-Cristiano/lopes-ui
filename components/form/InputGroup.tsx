"use client";

import React from "react";
import { cn } from "../../utils/cn";
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
        "relative flex w-full items-stretch overflow-hidden border bg-input transition-[color,background-color,border-color,box-shadow,opacity] duration-150",
        SIZE_CLS[size],
        error
          ? "border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20"
          : "border-input-border focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        effectiveDisabled && "opacity-60 pointer-events-none bg-surface-muted",
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
        "flex shrink-0 items-center gap-1.5 px-3 text-muted-foreground select-none",
        align === "inline-start" && "border-r border-border bg-surface-muted/70 self-stretch",
        align === "inline-end" && "border-l border-border bg-surface-muted/70 self-stretch",
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
        "flex-1 min-w-0 bg-transparent px-3 py-1.5 text-input-foreground placeholder:text-input-placeholder outline-none border-0 ring-0",
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
        "inline-flex shrink-0 self-stretch items-center justify-center gap-1.5 border-l border-border bg-surface-muted/80 px-3 text-xs font-semibold text-surface-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
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
      className={cn("text-xs text-muted-foreground select-none", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default InputGroup;
