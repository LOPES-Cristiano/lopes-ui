"use client";

import React, { useId, useState } from "react";
import { Heart, Smile, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import FieldWrapper from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type RatingSize = "xs" | "sm" | "md" | "lg" | "xl";
export type RatingTone = "amber" | "primary" | "rose" | "emerald";
export type RatingShape = "star" | "heart" | "smile";

export type RatingProps = {
  /** Controlled rating value (0 to max, supports 0.5 increments when allowHalf=true) */
  value?: number;
  /** Uncontrolled initial rating value */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Maximum number of stars/icons (default: 5) */
  max?: number;
  /** Allow half-star selections (daisyUI rating-half pattern) */
  allowHalf?: boolean;
  /** Allow clicking the current rating or clear button to reset to 0 */
  clearable?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  size?: RatingSize;
  tone?: RatingTone;
  shape?: RatingShape;
  /** Optional custom LucideIcon to override shape */
  icon?: LucideIcon;
  /** Show numeric value label next to stars (e.g. "4.5 / 5") */
  showValue?: boolean;
  /** Optional labels for each integer step (e.g. ["Ruim", "Regular", "Bom", "Ótimo", "Excelente"]) */
  tooltips?: string[];
  /** Access-control identifier */
  componentId?: string;
  /** If true, hides the component when access is denied (default: false — disables it) */
  hideIfDenied?: boolean;
  className?: string;
};

export type RatingFieldProps = RatingProps & {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  labelAction?: React.ReactNode;
};

const SIZE_PX: Record<RatingSize, number> = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 34,
};

const TONE_ACTIVE_CLS: Record<RatingTone, string> = {
  amber: "text-amber-400 fill-amber-400",
  primary: "text-primary fill-primary",
  rose: "text-rose-500 fill-rose-500",
  emerald: "text-emerald-500 fill-emerald-500",
};

export function Rating({
  value: controlledValue,
  defaultValue = 0,
  onChange,
  max = 5,
  allowHalf = false,
  clearable = true,
  readOnly = false,
  disabled = false,
  size = "md",
  tone = "amber",
  shape = "star",
  icon: CustomIcon,
  showValue = false,
  tooltips,
  componentId,
  hideIfDenied = false,
  className,
}: RatingProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled || !hasPermission);
  const isInteractive = !readOnly && !effectiveDisabled;

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const displayValue = hoverValue !== null ? hoverValue : currentValue;
  const iconPx = SIZE_PX[size];

  const IconComponent: LucideIcon =
    CustomIcon ?? (shape === "heart" ? Heart : shape === "smile" ? Smile : Star);

  const commitValue = (nextVal: number) => {
    if (!isInteractive) return;
    const finalVal = clearable && nextVal === currentValue ? 0 : nextVal;
    if (controlledValue === undefined) {
      setInternalValue(finalVal);
    }
    onChange?.(finalVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    const step = allowHalf ? 0.5 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      commitValue(Math.min(max, currentValue + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      commitValue(Math.max(0, currentValue - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      commitValue(0);
    } else if (e.key === "End") {
      e.preventDefault();
      commitValue(max);
    }
  };

  const activeTip =
    tooltips && displayValue > 0
      ? tooltips[Math.ceil(displayValue) - 1]
      : undefined;

  return (
    <div
      role={readOnly ? "img" : "slider"}
      aria-label={`Avaliação: ${currentValue} de ${max}`}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={currentValue}
      aria-readonly={readOnly}
      aria-disabled={effectiveDisabled}
      tabIndex={isInteractive ? 0 : -1}
      {...(componentId ? { "data-component-id": componentId } : {})}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => isInteractive && setHoverValue(null)}
      className={cn(
        "inline-flex items-center gap-1 select-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        effectiveDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: max }, (_, idx) => {
          const starNumber = idx + 1;
          const halfNumber = idx + 0.5;
          const isFull = displayValue >= starNumber;
          const isHalf = !isFull && allowHalf && displayValue >= halfNumber;

          return (
            <div
              key={starNumber}
              title={tooltips?.[idx]}
              className={cn(
                "relative inline-flex items-center justify-center transition-transform duration-150",
                isInteractive && "cursor-pointer hover:scale-110 active:scale-95"
              )}
              style={{ width: iconPx, height: iconPx }}
              onMouseMove={(e) => {
                if (!isInteractive) return;
                if (allowHalf) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                  setHoverValue(isLeftHalf ? halfNumber : starNumber);
                } else {
                  setHoverValue(starNumber);
                }
              }}
              onClick={() => {
                if (!isInteractive) return;
                commitValue(hoverValue ?? starNumber);
              }}
            >
              {/* Base Empty Icon */}
              <IconComponent
                size={iconPx}
                strokeWidth={1.75}
                className="text-zinc-300 dark:text-zinc-700 transition-colors"
              />

              {/* Full or Half Active Overlay */}
              {(isFull || isHalf) && (
                <span
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{ width: isHalf ? "50%" : "100%" }}
                >
                  <IconComponent
                    size={iconPx}
                    strokeWidth={1.75}
                    className={cn(" transition-colors", TONE_ACTIVE_CLS[tone])}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1.5 text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
          {displayValue.toFixed(allowHalf ? 1 : 0)} / {max}
        </span>
      )}

      {activeTip && (
        <span className="ml-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {activeTip}
        </span>
      )}
    </div>
  );
}

export default function RatingField({
  label,
  helpText,
  error,
  required,
  tooltip,
  labelAction,
  componentId,
  hideIfDenied = false,
  ...ratingProps
}: RatingFieldProps) {
  const autoId = useId();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  return (
    <FieldWrapper
      id={autoId}
      label={label}
      helpText={helpText}
      error={error}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
    >
      <Rating
        componentId={componentId}
        hideIfDenied={hideIfDenied}
        {...ratingProps}
      />
    </FieldWrapper>
  );
}
