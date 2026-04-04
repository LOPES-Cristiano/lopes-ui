"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { Check, X, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StepStatus = "upcoming" | "current" | "completed" | "error";
export type StepperOrientation = "horizontal" | "vertical";
export type StepperVariant = "default" | "outlined" | "minimal";
export type StepperSize = "sm" | "md" | "lg";

export type StepItem = {
  /** Step title */
  title: string;
  /** Optional sub-label */
  description?: string;
  /** Override the auto-computed status */
  status?: StepStatus;
  /** Replace the step number/icon with a custom Lucide icon */
  icon?: LucideIcon;
  /** Optional slot rendered below the description (only visible for active / completed steps in vertical mode) */
  content?: React.ReactNode;
  /** Disable interaction */
  disabled?: boolean;
};

export type StepperProps = {
  steps: StepItem[];
  /** Zero-based index of the active step */
  activeStep?: number;
  /** Controlled mode — called when user clicks a step */
  onStepClick?: (index: number) => void;
  orientation?: StepperOrientation;
  variant?: StepperVariant;
  size?: StepperSize;
  /** Make steps clickable (navigate to any previous step) */
  clickable?: boolean;
  /** Show connecting lines between steps */
  connector?: boolean;
  className?: string;
  componentId?: string;
};

// ── Style maps ────────────────────────────────────────────────────────────────

type StepColors = {
  circle: string;
  circleText: string;
  connector: string;
  title: string;
  description: string;
};

const STATUS_COLORS: Record<StepStatus, StepColors> = {
  completed: {
    circle:      "bg-indigo-500 border-indigo-500",
    circleText:  "text-white",
    connector:   "bg-indigo-400 dark:bg-indigo-600",
    title:       "text-zinc-700 dark:text-zinc-300",
    description: "text-zinc-400 dark:text-zinc-500",
  },
  current: {
    circle:      "bg-indigo-500 border-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/50",
    circleText:  "text-white",
    connector:   "bg-zinc-200 dark:bg-zinc-700",
    title:       "text-zinc-900 dark:text-zinc-50 font-semibold",
    description: "text-zinc-500 dark:text-zinc-400",
  },
  error: {
    circle:      "bg-red-500 border-red-500",
    circleText:  "text-white",
    connector:   "bg-zinc-200 dark:bg-zinc-700",
    title:       "text-red-600 dark:text-red-400",
    description: "text-red-400 dark:text-red-500",
  },
  upcoming: {
    circle:      "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700",
    circleText:  "text-zinc-400 dark:text-zinc-500",
    connector:   "bg-zinc-200 dark:bg-zinc-700",
    title:       "text-zinc-400 dark:text-zinc-500",
    description: "text-zinc-300 dark:text-zinc-600",
  },
};

const SIZE_MAP: Record<StepperSize, {
  circle: string;
  icon: number;
  text: string;
  subText: string;
  connH: string;
  connW: string;
}> = {
  sm: { circle: "w-7 h-7",  icon: 13, text: "text-xs",   subText: "text-[11px]", connH: "h-0.5", connW: "w-0.5" },
  md: { circle: "w-9 h-9",  icon: 15, text: "text-sm",   subText: "text-xs",     connH: "h-0.5", connW: "w-0.5" },
  lg: { circle: "w-11 h-11", icon: 18, text: "text-base", subText: "text-sm",    connH: "h-1",   connW: "w-1"   },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveStatus(step: StepItem, index: number, activeStep: number): StepStatus {
  if (step.status) return step.status;
  if (index < activeStep)  return "completed";
  if (index === activeStep) return "current";
  return "upcoming";
}

// ── Step circle ───────────────────────────────────────────────────────────────

function StepCircle({
  step,
  index,
  status,
  size,
  variant,
}: {
  step: StepItem;
  index: number;
  status: StepStatus;
  size: StepperSize;
  variant: StepperVariant;
}) {
  const s  = SIZE_MAP[size];
  const c  = STATUS_COLORS[status];
  const Icon = step.icon;

  const circleCls = twMerge(
    "shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-300 font-semibold",
    s.circle, s.text, c.circleText,
    variant === "outlined" ? "bg-transparent" : c.circle,
    variant === "outlined" && status === "completed" ? "border-indigo-500 text-indigo-500" : "",
    variant === "outlined" && status === "current"   ? "border-indigo-500 text-indigo-500" : "",
    variant === "outlined" && status === "error"     ? "border-red-500 text-red-500" : "",
    variant === "outlined" && status === "upcoming"  ? "border-zinc-300 text-zinc-400" : "",
  );

  return (
    <div className={circleCls} aria-hidden="true">
      {Icon ? (
        <Icon size={s.icon} />
      ) : status === "completed" ? (
        <Check size={s.icon} strokeWidth={2.5} />
      ) : status === "error" ? (
        <X size={s.icon} strokeWidth={2.5} />
      ) : (
        <span>{index + 1}</span>
      )}
    </div>
  );
}

// ── Connector ─────────────────────────────────────────────────────────────────

function Connector({
  orientation,
  status,
  size,
}: {
  orientation: StepperOrientation;
  status: StepStatus; // status of the preceding step
  size: StepperSize;
}) {
  const s = SIZE_MAP[size];
  const c = STATUS_COLORS[status];

  if (orientation === "horizontal") {
    return (
      <div className={twMerge("flex-1 mx-1 transition-colors duration-300", s.connH, c.connector)} />
    );
  }

  return (
    <div className={twMerge("ml-4 my-1 flex-1 transition-colors duration-300 min-h-[20px]", s.connW, c.connector)} />
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Stepper({
  steps,
  activeStep = 0,
  onStepClick,
  orientation = "horizontal",
  variant = "default",
  size = "md",
  clickable = false,
  connector = true,
  className,
  componentId,
}: StepperProps) {
  const s = SIZE_MAP[size];
  const isHorizontal = orientation === "horizontal";

  const wrapCls = twMerge(
    isHorizontal ? "flex items-start w-full" : "flex flex-col",
    className,
  );

  return (
    <div
      role="list"
      aria-label="Passos"
      className={wrapCls}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {steps.map((step, i) => {
        const status   = resolveStatus(step, i, activeStep);
        const colors   = STATUS_COLORS[status];
        const isLast   = i === steps.length - 1;
        const isClick  = clickable && !step.disabled && (status === "completed" || onStepClick);

        // ── Horizontal layout ────────────────────────────────────────────────
        if (isHorizontal) {
          return (
            <React.Fragment key={i}>
              <div
                role="listitem"
                aria-current={status === "current" ? "step" : undefined}
                className={twMerge(
                  "flex flex-col items-center gap-2 shrink-0",
                  isClick && "cursor-pointer",
                )}
                onClick={isClick ? () => onStepClick?.(i) : undefined}
              >
                <StepCircle step={step} index={i} status={status} size={size} variant={variant} />
                <div className="text-center">
                  <p className={twMerge(s.text, "leading-snug transition-colors duration-200", colors.title)}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className={twMerge(s.subText, "mt-0.5 transition-colors duration-200", colors.description)}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {!isLast && connector && (
                <div className="flex-1 flex items-start mt-4 mx-1">
                  <Connector orientation="horizontal" status={status} size={size} />
                </div>
              )}
            </React.Fragment>
          );
        }

        // ── Vertical layout ──────────────────────────────────────────────────
        return (
          <div key={i} role="listitem" className="flex gap-3">
            {/* Left: circle + connector */}
            <div className="flex flex-col items-center">
              <div
                aria-current={status === "current" ? "step" : undefined}
                className={twMerge(isClick && "cursor-pointer")}
                onClick={isClick ? () => onStepClick?.(i) : undefined}
              >
                <StepCircle step={step} index={i} status={status} size={size} variant={variant} />
              </div>
              {!isLast && connector && (
                <Connector orientation="vertical" status={status} size={size} />
              )}
            </div>

            {/* Right: text + content */}
            <div className={twMerge("pb-6", isLast && "pb-0")}>
              <div
                className={twMerge(isClick && "cursor-pointer")}
                onClick={isClick ? () => onStepClick?.(i) : undefined}
              >
                <p className={twMerge(s.text, "leading-snug transition-colors duration-200 pt-1", colors.title)}>
                  {step.title}
                </p>
                {step.description && (
                  <p className={twMerge(s.subText, "mt-0.5 transition-colors duration-200", colors.description)}>
                    {step.description}
                  </p>
                )}
              </div>
              {step.content && (status === "current" || status === "completed") && (
                <div className="mt-3">{step.content}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
