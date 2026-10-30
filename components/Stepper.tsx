"use client";

import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { Check, ChevronRight, Loader2, X, type LucideIcon } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StepStatus = "upcoming" | "current" | "completed" | "error" | "loading";
export type StepperOrientation = "horizontal" | "vertical";
export type StepperVariant = "default" | "outlined" | "minimal" | "subtle" | "navigation" | "dot";
export type StepperSize = "sm" | "md" | "lg";

export type StepItem = {
  /** Step title */
  title: string;
  /** Optional sub-label */
  description?: string;
  /** Optional badge or count displayed inline (useful for subtle variant) */
  badge?: React.ReactNode;
  /** Override the auto-computed status */
  status?: StepStatus;
  /** Replace the step number/icon with a custom Lucide icon */
  icon?: LucideIcon;
  /** Optional slot rendered below the description (only visible for active / completed steps in vertical mode) */
  content?: React.ReactNode;
  /** Disable interaction */
  disabled?: boolean;
  /** Access-control identifier for this step */
  componentId?: string;
  /** If true, hides the step when access is denied instead of disabling it (default: false) */
  hideIfDenied?: boolean;
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
  hideIfDenied?: boolean;
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
  loading: {
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
    variant === "outlined" && (status === "current" || status === "loading") ? "border-indigo-500 text-indigo-500" : "",
    variant === "outlined" && status === "error"     ? "border-red-500 text-red-500" : "",
    variant === "outlined" && status === "upcoming"  ? "border-zinc-300 text-zinc-400" : "",
  );

  return (
    <div className={circleCls} aria-hidden="true">
      {status === "loading" ? (
        <Loader2 size={s.icon} className="animate-spin" />
      ) : Icon ? (
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
  status: StepStatus;
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
  steps: rawSteps,
  activeStep = 0,
  onStepClick,
  orientation = "horizontal",
  variant = "default",
  size = "md",
  clickable = false,
  connector = true,
  className,
  componentId,
  hideIfDenied = true,
}: StepperProps) {
  const s = SIZE_MAP[size];
  const isHorizontal = orientation === "horizontal";
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const steps = useMemo(() => {
    return rawSteps
      .filter((step) => {
        const allowed = !step.componentId || canAccess(step.componentId);
        if (!allowed && step.hideIfDenied) return false;
        return true;
      })
      .map((step) => {
        const allowed = !step.componentId || canAccess(step.componentId);
        return {
          ...step,
          disabled: Boolean(step.disabled || !allowed),
        };
      });
  }, [rawSteps, canAccess]);

  if (!hasRootPermission && hideIfDenied) return null;

  const handleStepKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (!onStepClick) return;
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    if (e.key === prevKey) {
      e.preventDefault();
      for (let i = index - 1; i >= 0; i--) {
        if (!steps[i]?.disabled) {
          onStepClick(i);
          break;
        }
      }
    } else if (e.key === nextKey) {
      e.preventDefault();
      for (let i = index + 1; i < steps.length; i++) {
        if (!steps[i]?.disabled) {
          onStepClick(i);
          break;
        }
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!steps[index]?.disabled) onStepClick(index);
    }
  };

  // ── MINIMAL PROGRESS BAR VARIANT (Mantine / Linear compact progress stepper) ──
  if (variant === "minimal") {
    const active = steps[Math.min(Math.max(activeStep, 0), Math.max(steps.length - 1, 0))];
    return (
      <div
        role="group"
        aria-label="Progresso das etapas"
        data-component-id={componentId}
        className={twMerge(
          "flex w-full flex-col gap-2 select-none",
          !hasRootPermission && "opacity-50 pointer-events-none",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="font-semibold text-foreground truncate">
              {active?.title ?? "Etapa"}
            </span>
            {active?.description && (
              <span className="hidden sm:inline truncate text-muted-foreground">
                · {active.description}
              </span>
            )}
          </div>
          <span className="shrink-0 font-mono text-[11px] font-medium text-muted-foreground">
            {Math.min(activeStep + 1, steps.length)} / {steps.length}
          </span>
        </div>
        <div className="flex w-full items-center gap-1.5" role="tablist">
          {steps.map((step, i) => {
            const status = resolveStatus(step, i, activeStep);
            const isCompleted = status === "completed";
            const isCurrent = i === activeStep || status === "loading";
            const isError = status === "error";
            const canClick = !step.disabled && (clickable || Boolean(onStepClick));
            return (
              <button
                key={i}
                type="button"
                role="tab"
                title={step.title}
                aria-label={`${i + 1}. ${step.title}`}
                aria-selected={isCurrent}
                disabled={!canClick}
                onClick={canClick ? () => onStepClick?.(i) : undefined}
                onKeyDown={canClick ? (e) => handleStepKeyDown(e, i) : undefined}
                className={twMerge(
                  "h-2 flex-1 rounded-full transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  canClick ? "cursor-pointer" : "cursor-default",
                  isError
                    ? "bg-danger"
                    : isCurrent
                      ? "bg-primary"
                      : isCompleted
                        ? "bg-primary/65 hover:bg-primary"
                        : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                )}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── SUBTLE / COMPACT INLINE VARIANT (Ideal for headers & drawers) ──
  if (variant === "subtle") {
    return (
      <div
        role="tablist"
        aria-label="Etapas"
        data-component-id={componentId}
        className={twMerge(
          "flex items-center w-full overflow-x-auto no-scrollbar select-none",
          !hasRootPermission && "opacity-50 pointer-events-none",
          className
        )}
      >
        {steps.map((step, i) => {
          const status = resolveStatus(step, i, activeStep);
          const isCurrent = i === activeStep || status === "loading";
          const isCompleted = status === "completed";
          const isError = status === "error";
          const isLast = i === steps.length - 1;
          const Icon = step.icon;
          const canClick = !step.disabled && (clickable || Boolean(onStepClick));

          return (
            <React.Fragment key={i}>
              <button
                type="button"
                role="tab"
                data-component-id={step.componentId ?? (componentId ? `${componentId}.step-${i}` : undefined)}
                aria-selected={isCurrent}
                disabled={!canClick}
                onClick={canClick ? () => onStepClick?.(i) : undefined}
                onKeyDown={canClick ? (e) => handleStepKeyDown(e, i) : undefined}
                className={twMerge(
                  "group relative flex-1 min-w-fit inline-flex items-center justify-between gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap border-b-2 -mb-px outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                  canClick ? "cursor-pointer" : "cursor-default",
                  step.disabled && "opacity-40 cursor-not-allowed",
                  isCurrent
                    ? "border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 font-bold"
                    : isError
                    ? "border-transparent hover:border-rose-300 text-rose-600 dark:text-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-950/20"
                    : isCompleted
                    ? "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                    : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={twMerge(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-colors shrink-0",
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : isError
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                    )}
                  >
                    {status === "loading" ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : Icon ? (
                      <Icon size={12} />
                    ) : isCompleted ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </span>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{step.title}</span>
                    {step.description && (
                      <span className="hidden 2xl:inline text-[11px] font-normal text-zinc-400 dark:text-zinc-500 truncate">
                        · {step.description}
                      </span>
                    )}
                  </div>
                </div>

                {step.badge !== undefined && step.badge !== null && (
                  <span
                    className={twMerge(
                      "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none shrink-0",
                      isCurrent
                        ? "bg-indigo-600/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200"
                        : isError
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        : isCompleted
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {step.badge}
                  </span>
                )}
              </button>

              {!isLast && connector && (
                <ChevronRight
                  size={14}
                  className="text-zinc-300 dark:text-zinc-700 shrink-0 mx-0.5"
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // ── NAVIGATION BAR VARIANT (Ant Design Steps type="navigation") ──
  if (variant === "navigation") {
    return (
      <div
        role="tablist"
        aria-label="Navegação por etapas"
        data-component-id={componentId}
        className={twMerge(
          "flex items-stretch w-full overflow-x-auto no-scrollbar border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 select-none",
          !hasRootPermission && "opacity-50 pointer-events-none",
          className
        )}
      >
        {steps.map((step, i) => {
          const status = resolveStatus(step, i, activeStep);
          const isCurrent = i === activeStep || status === "loading";
          const isCompleted = status === "completed";
          const isError = status === "error";
          const isLast = i === steps.length - 1;
          const Icon = step.icon;
          const canClick = !step.disabled && (clickable || Boolean(onStepClick));

          return (
            <React.Fragment key={i}>
              <button
                type="button"
                role="tab"
                data-component-id={step.componentId ?? (componentId ? `${componentId}.step-${i}` : undefined)}
                aria-selected={isCurrent}
                disabled={!canClick}
                onClick={canClick ? () => onStepClick?.(i) : undefined}
                onKeyDown={canClick ? (e) => handleStepKeyDown(e, i) : undefined}
                className={twMerge(
                  "group relative flex-1 min-w-fit inline-flex items-center justify-center gap-3 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                  canClick ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40" : "cursor-default",
                  step.disabled && "opacity-40 cursor-not-allowed",
                  isCurrent &&
                    "after:content-[''] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-indigo-600 dark:after:bg-indigo-400"
                )}
              >
                <span
                  className={twMerge(
                    "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 border transition-colors",
                    isCurrent
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                      : isError
                        ? "bg-red-500 border-red-500 text-white"
                        : isCompleted
                          ? "bg-white dark:bg-zinc-900 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                          : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  {status === "loading" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : Icon ? (
                    <Icon size={13} />
                  ) : isCompleted ? (
                    <Check size={13} strokeWidth={2.5} />
                  ) : isError ? (
                    <X size={13} strokeWidth={2.5} />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={twMerge(
                        "text-xs sm:text-sm font-semibold truncate",
                        isCurrent
                          ? "text-indigo-600 dark:text-indigo-400"
                          : isError
                            ? "text-red-600 dark:text-red-400"
                            : isCompleted
                              ? "text-zinc-800 dark:text-zinc-200"
                              : "text-zinc-500 dark:text-zinc-400"
                      )}
                    >
                      {step.title}
                    </span>
                    {step.badge !== undefined && step.badge !== null && (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {!isLast && (
                <div className="flex items-center shrink-0 text-zinc-300 dark:text-zinc-700 px-0.5" aria-hidden="true">
                  <ChevronRight size={16} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // ── PROGRESS DOT VARIANT (Ant Design Steps progressDot) ──
  if (variant === "dot") {
    return (
      <div
        role="list"
        aria-label="Progresso em pontos"
        data-component-id={componentId}
        className={twMerge(
          isHorizontal ? "flex items-start w-full py-1" : "flex flex-col py-1",
          !hasRootPermission && "opacity-50 pointer-events-none",
          className
        )}
      >
        {steps.map((step, i) => {
          const status = resolveStatus(step, i, activeStep);
          const colors = STATUS_COLORS[status];
          const isCurrent = status === "current" || status === "loading";
          const isCompleted = status === "completed";
          const isError = status === "error";
          const isLast = i === steps.length - 1;
          const canClick = !step.disabled && (clickable || Boolean(onStepClick));

          const dotCls = twMerge(
            "rounded-full shrink-0 transition-all duration-200",
            isCurrent
              ? "w-3 h-3 bg-indigo-600 dark:bg-indigo-400 ring-4 ring-indigo-500/20"
              : isError
                ? "w-2.5 h-2.5 bg-red-500 ring-3 ring-red-500/20"
                : isCompleted
                  ? "w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400"
                  : "w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-700",
            status === "loading" && "animate-pulse"
          );

          if (isHorizontal) {
            return (
              <div
                key={i}
                role="listitem"
                tabIndex={canClick ? 0 : undefined}
                aria-current={isCurrent ? "step" : undefined}
                onClick={canClick ? () => onStepClick?.(i) : undefined}
                onKeyDown={canClick ? (e) => handleStepKeyDown(e, i) : undefined}
                className={twMerge(
                  "flex-1 min-w-0 flex flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-lg",
                  canClick && "cursor-pointer",
                  step.disabled && "opacity-45 cursor-not-allowed"
                )}
              >
                <div className="flex items-center w-full">
                  <div
                    className={twMerge(
                      "h-0.5 flex-1 transition-colors",
                      i === 0
                        ? "bg-transparent"
                        : i <= activeStep
                          ? "bg-indigo-500 dark:bg-indigo-500"
                          : "bg-zinc-200 dark:bg-zinc-800"
                    )}
                  />
                  <span className={twMerge("mx-2", dotCls)} aria-hidden="true" />
                  <div
                    className={twMerge(
                      "h-0.5 flex-1 transition-colors",
                      isLast
                        ? "bg-transparent"
                        : isCompleted
                          ? "bg-indigo-500 dark:bg-indigo-500"
                          : "bg-zinc-200 dark:bg-zinc-800"
                    )}
                  />
                </div>
                <div className="mt-2 px-1.5 min-w-0 w-full">
                  <p className={twMerge("text-xs font-semibold truncate", colors.title)}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className={twMerge("text-[11px] mt-0.5 line-clamp-2", colors.description)}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={i} role="listitem" className="flex gap-3">
              <div className="flex flex-col items-center pt-1.5">
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={canClick ? () => onStepClick?.(i) : undefined}
                  onKeyDown={canClick ? (e) => handleStepKeyDown(e, i) : undefined}
                  aria-label={`${i + 1}. ${step.title}`}
                  className={twMerge(
                    dotCls,
                    canClick ? "cursor-pointer" : "cursor-default",
                    "outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  )}
                />
                {!isLast && connector && (
                  <div
                    className={twMerge(
                      "w-0.5 flex-1 my-1.5 min-h-[20px] transition-colors",
                      isCompleted ? "bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-800"
                    )}
                  />
                )}
              </div>
              <div className={twMerge("pb-5 min-w-0", isLast && "pb-0")}>
                <p className={twMerge("text-xs sm:text-sm font-semibold leading-snug", colors.title)}>
                  {step.title}
                </p>
                {step.description && (
                  <p className={twMerge("text-xs mt-0.5", colors.description)}>
                    {step.description}
                  </p>
                )}
                {step.content && (isCurrent || isCompleted) && (
                  <div className="mt-2.5">{step.content}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const wrapCls = twMerge(
    isHorizontal ? "flex items-start w-full py-1" : "flex flex-col py-1",
    !hasRootPermission && "opacity-50 pointer-events-none",
    className,
  );

  return (
    <div
      role="list"
      aria-label="Passos"
      data-component-id={componentId}
      className={wrapCls}
    >
      {steps.map((step, i) => {
        const status   = resolveStatus(step, i, activeStep);
        const colors   = STATUS_COLORS[status];
        const isLast   = i === steps.length - 1;
        const isClick  = Boolean(clickable && !step.disabled && (status === "completed" || onStepClick));

        // ── Horizontal layout ────────────────────────────────────────────────
        if (isHorizontal) {
          return (
            <React.Fragment key={i}>
              <div
                role="listitem"
                data-component-id={step.componentId ?? (componentId ? `${componentId}.step-${i}` : undefined)}
                tabIndex={isClick ? 0 : undefined}
                aria-current={status === "current" || status === "loading" ? "step" : undefined}
                data-disabled={step.disabled ? "true" : undefined}
                className={twMerge(
                  "flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0 text-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                  isClick && "cursor-pointer",
                  step.disabled && "opacity-45 cursor-not-allowed",
                )}
                onClick={isClick ? () => onStepClick?.(i) : undefined}
                onKeyDown={isClick ? (e) => handleStepKeyDown(e, i) : undefined}
              >
                <StepCircle step={step} index={i} status={status} size={size} variant={variant} />
                <div className="text-center w-full min-w-0 px-0.5">
                  <p className={twMerge(s.text, "leading-tight sm:leading-snug transition-colors duration-200 whitespace-normal break-words line-clamp-2 text-[10.5px] sm:text-xs md:text-sm font-semibold", colors.title)}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className={twMerge(s.subText, "mt-0.5 transition-colors duration-200 hidden sm:block whitespace-normal break-words line-clamp-2 text-[10px] md:text-[11px]", colors.description)}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {!isLast && connector && (
                <div className="flex-1 min-w-[6px] max-w-[28px] sm:max-w-none flex items-center mt-3.5 sm:mt-4 mx-0.5 sm:mx-1.5">
                  <Connector orientation="horizontal" status={status} size={size} />
                </div>
              )}
            </React.Fragment>
          );
        }

        // ── Vertical layout ──────────────────────────────────────────────────
        return (
          <div
            key={i}
            role="listitem"
            data-component-id={step.componentId ?? (componentId ? `${componentId}.step-${i}` : undefined)}
            className="flex gap-3"
          >
            {/* Left: circle + connector */}
            <div className="flex flex-col items-center">
              <div
                tabIndex={isClick ? 0 : undefined}
                aria-current={status === "current" || status === "loading" ? "step" : undefined}
                className={twMerge(
                  "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                  isClick && "cursor-pointer",
                  step.disabled && "opacity-45 cursor-not-allowed",
                )}
                onClick={isClick ? () => onStepClick?.(i) : undefined}
                onKeyDown={isClick ? (e) => handleStepKeyDown(e, i) : undefined}
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
              {step.content && (status === "current" || status === "loading" || status === "completed") && (
                <div className="mt-3">{step.content}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
