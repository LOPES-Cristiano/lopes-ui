"use client";

import React, { useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import FieldWrapper from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type FilterChipOption = {
  value: string;
  label: React.ReactNode;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Access-control identifier for this specific option */
  componentId?: string;
  /** If false, renders the chip disabled instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type FilterChipsProps = {
  options: FilterChipOption[];
  /** Selected value (single mode) or array of values (multiple mode) */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: any) => void;
  /** Allow selecting multiple chips simultaneously (default: false) */
  multiple?: boolean;
  /**
   * daisyUI `filter` pattern: when true in single-select mode, selecting an option
   * hides unselected options and reveals a dedicated `×` reset chip (default: false)
   */
  collapseUnselected?: boolean;
  /** Show an "All" / reset chip or clear button when a filter is active (default: true) */
  clearable?: boolean;
  /** Label for the optional "All" chip when nothing is selected */
  allLabel?: React.ReactNode;
  size?: "xs" | "sm" | "md";
  disabled?: boolean;
  /** FieldWrapper props */
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  /** Access-control identifier */
  componentId?: string;
  /** If true, hides the entire filter group when access is denied (default: false) */
  hideIfDenied?: boolean;
  className?: string;
};

const SIZE_CLS = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-1.5",
};

export default function FilterChips({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  multiple = false,
  collapseUnselected = false,
  clearable = true,
  allLabel,
  size = "sm",
  disabled = false,
  label,
  helpText,
  error,
  required,
  tooltip,
  componentId,
  hideIfDenied = false,
  className,
}: FilterChipsProps) {
  const autoId = useId();
  const { canAccess } = useAccessControl();
  const hasGroupPermission = !componentId || canAccess(componentId);

  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (multiple ? [] : "")
  );

  if (!hasGroupPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled || !hasGroupPermission);
  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const selectedArray: string[] = Array.isArray(currentValue)
    ? currentValue
    : currentValue
      ? [currentValue]
      : [];

  const hasSelection = selectedArray.length > 0;

  const commit = (next: string | string[]) => {
    if (effectiveDisabled) return;
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const toggleOption = (optVal: string) => {
    if (effectiveDisabled) return;
    if (multiple) {
      const exists = selectedArray.includes(optVal);
      const next = exists
        ? selectedArray.filter((v) => v !== optVal)
        : [...selectedArray, optVal];
      commit(next);
    } else {
      const isSame = currentValue === optVal;
      commit(isSame && clearable ? "" : optVal);
    }
  };

  const handleReset = () => {
    commit(multiple ? [] : "");
  };

  const visibleOptions = options.filter((opt) => {
    const allowed = !opt.componentId || canAccess(opt.componentId);
    if (!allowed && opt.hideIfDenied !== false) return false;
    if (collapseUnselected && !multiple && hasSelection) {
      return selectedArray.includes(opt.value);
    }
    return true;
  });

  const chipsContent = (
    <div
      role="group"
      aria-label={label ?? "Filtros"}
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {/* Optional "Todos" chip */}
      {allLabel && (!collapseUnselected || !hasSelection) && (
        <button
          type="button"
          disabled={effectiveDisabled}
          onClick={handleReset}
          className={cn(
            "inline-flex items-center justify-center rounded-full border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            SIZE_CLS[size],
            !hasSelection
              ? "border-primary bg-primary text-primary-foreground shadow-xs"
              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800",
            effectiveDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {allLabel}
        </button>
      )}

      {/* DaisyUI filter reset button when collapsed */}
      {collapseUnselected && !multiple && hasSelection && clearable && (
        <button
          type="button"
          aria-label="Limpar filtro"
          disabled={effectiveDisabled}
          onClick={handleReset}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
            size === "xs" ? "h-7 w-7" : size === "sm" ? "h-8 w-8" : "h-9 w-9",
            effectiveDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <X size={14} />
        </button>
      )}

      {visibleOptions.map((opt) => {
        const isAllowed = !opt.componentId || canAccess(opt.componentId);
        const optDisabled = Boolean(effectiveDisabled || opt.disabled || !isAllowed);
        const isSelected = selectedArray.includes(opt.value);

        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isSelected}
            disabled={optDisabled}
            {...(opt.componentId ? { "data-component-id": opt.componentId } : {})}
            onClick={() => !optDisabled && toggleOption(opt.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-full border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              SIZE_CLS[size],
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80",
              optDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}

      {/* Reset button for multi-select or non-collapsed mode */}
      {!collapseUnselected && clearable && hasSelection && !allLabel && (
        <button
          type="button"
          disabled={effectiveDisabled}
          onClick={handleReset}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors",
            size === "xs" ? "h-7" : size === "sm" ? "h-8" : "h-9"
          )}
        >
          <X size={13} className="mr-1" />
          Limpar
        </button>
      )}
    </div>
  );

  if (label || helpText || error) {
    return (
      <FieldWrapper
        id={autoId}
        label={label}
        helpText={helpText}
        error={error}
        required={required}
        tooltip={tooltip}
      >
        {chipsContent}
      </FieldWrapper>
    );
  }

  return chipsContent;
}
