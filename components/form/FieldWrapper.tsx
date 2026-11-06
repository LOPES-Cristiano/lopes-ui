"use client";

import React from "react";
import { HelpCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../primitives/tooltip";

export type FieldWrapperProps = {
  id?: string;
  label?: string;
  /** Render label on the left, horizontally aligned with the input */
  labelInline?: boolean;
  /** Layout orientation (shadcn/ui Field pattern). Overrides labelInline when provided. */
  orientation?: "vertical" | "horizontal" | "responsive";
  /** Tailwind width class for the inline label column (default: "w-28") */
  labelWidth?: string;
  required?: boolean;
  /** Message shown on hover of the ? icon next to the label */
  tooltip?: string;
  /** Optional node rendered on the right side of the label row (e.g. character counter or action link) */
  labelAction?: React.ReactNode;
  /** Validation error — shown in red, replaces helpText */
  error?: string;
  /** Subtle helper text below the field */
  helpText?: string;
  /** Alias for helpText */
  hint?: string;
  /** Tailwind width class applied to the outer wrapper (e.g. "w-full", "w-64") */
  width?: string;
  children: React.ReactNode;
  className?: string;
};

function FieldTooltip({ message }: { message: string }) {
  return (
    <TooltipProvider delayDuration={180}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-component-id="erp.field-wrapper.help-tooltip"
            type="button"
            aria-label="Mostrar ajuda"
            className="ml-1 inline-flex h-4 w-4 items-center justify-center align-middle text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-full cursor-pointer"
          >
            <HelpCircle size={13} className="text-muted-foreground/85 hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs leading-relaxed">
          {message}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { FieldTooltip };

export type FieldSetProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement>;

export function FieldSet({ className, children, ...props }: FieldSetProps) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "block m-0 min-w-0 space-y-4 rounded-[var(--radius-card)] border border-border bg-surface-muted/40 p-5",
        className
      )}
      {...props}
    >
      {children}
    </fieldset>
  );
}

export type FieldLegendProps = React.HTMLAttributes<HTMLLegendElement> & {
  variant?: "legend" | "label";
};

export function FieldLegend({ className, variant = "legend", children, ...props }: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(
        "float-left w-full p-0 mb-1 font-semibold text-foreground after:block after:clear-both",
        variant === "legend" ? "text-base" : "text-xs uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </legend>
  );
}

export type FieldGroupProps = React.HTMLAttributes<HTMLDivElement>;

export function FieldGroup({ className, children, ...props }: FieldGroupProps) {
  return (
    <div
      data-slot="field-group"
      className={cn("clear-both flex flex-col gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default function FieldWrapper({
  id,
  label,
  labelInline = false,
  orientation,
  labelWidth = "w-28",
  required,
  tooltip,
  labelAction,
  error,
  helpText,
  hint,
  width,
  children,
  className,
}: FieldWrapperProps) {
  const effectiveOrientation = orientation ?? (labelInline ? "horizontal" : "vertical");
  const isHorizontal = effectiveOrientation === "horizontal";
  const isResponsive = effectiveOrientation === "responsive";

  const resolvedHelpText = helpText ?? hint;
  const cleanLabel =
    typeof label === "string"
      ? label.replace(/\s*\*+\s*$/, "")
      : label;
  const isRequired = required || (typeof label === "string" && /\*\s*$/.test(label));

  const labelNode = label ? (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex select-none items-center text-sm font-medium leading-none",
        error ? "text-danger" : "text-foreground/85",
        isHorizontal && cn("shrink-0 pt-[11px]", labelWidth),
        isResponsive && cn("sm:shrink-0 sm:pt-[11px]", `sm:${labelWidth}`),
      )}
    >
      <span>{cleanLabel}</span>
      {isRequired && (
        <span aria-hidden="true" className="ml-1 text-danger">
          *
        </span>
      )}
      {tooltip && (
        <span className="ml-1 inline-flex">
          <FieldTooltip message={tooltip} />
        </span>
      )}
    </label>
  ) : null;

  const subline = error ? (
    <p
      id={id ? `${id}-error` : undefined}
      className="flex items-center gap-1 text-xs text-danger"
    >
      <AlertCircle size={11} className="shrink-0" />
      {error}
    </p>
  ) : resolvedHelpText ? (
    <p
      id={id ? `${id}-help` : undefined}
      className="text-xs leading-relaxed text-pretty text-muted-foreground"
    >
      {resolvedHelpText}
    </p>
  ) : null;

  if (isHorizontal || isResponsive) {
    return (
      <div className={cn("flex flex-col gap-1", width, className)}>
        <div
          className={cn(
            "flex gap-3",
            isResponsive ? "flex-col sm:flex-row sm:items-start" : "items-start",
          )}
        >
          {labelNode}
          <div className="min-w-0 flex-1">
            {children}
            {labelAction && (
              <div className="mt-1 flex justify-end text-xs text-muted-foreground">
                {labelAction}
              </div>
            )}
          </div>
        </div>
        {subline && (
          <div className="flex">
            <div
              className={cn(
                "shrink-0",
                isHorizontal ? labelWidth : cn("hidden sm:block", labelWidth),
              )}
            />
            <div className="min-w-0 flex-1">{subline}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", width, className)}>
      {(labelNode || labelAction) && (
        <div className="flex items-center justify-between gap-2">
          {labelNode ?? <span />}
          {labelAction && (
            <div className="text-xs text-muted-foreground">{labelAction}</div>
          )}
        </div>
      )}
      {children}
      {subline}
    </div>
  );
}
