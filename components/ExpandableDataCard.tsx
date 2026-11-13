"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";
import AnimatedNumber, { type AnimatedNumberFormat } from "./AnimatedNumber";
import MotionCollapse from "./MotionCollapse";

export type ExpandableDataMetric = {
  id?: string;
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "brand" | "muted";
  mono?: boolean;
  /** Span both columns in the 2-column expanded detail grid */
  fullSpan?: boolean;
};

export type ExpandableDataAnimatedValue = {
  value: number;
  format?: AnimatedNumberFormat;
  decimals?: number;
  percentScale?: "100" | "1";
  prefix?: string;
  suffix?: string;
};

export type ExpandableDataCardTone =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type ExpandableDataCardProps = {
  /** Optional rank or code pill shown in the top-left (e.g. "#1", "ABC-A", "FIL-01") */
  code?: React.ReactNode;
  /** Tone applied to the code pill and accent border */
  tone?: ExpandableDataCardTone;
  /** Optional leading icon or avatar */
  icon?: React.ReactNode;
  /** Full readable card title (wraps up to 2 lines without harsh truncation) */
  title: React.ReactNode;
  /** Secondary subtitle below the title (e.g. branch city RO/AM, category, timestamp) */
  subtitle?: React.ReactNode;
  /** Primary headline metric on the right (accepts ReactNode or animated number config) */
  primaryValue?: React.ReactNode | ExpandableDataAnimatedValue;
  /** Small caption under/above `primaryValue` (e.g. "Faturamento", "Margem") */
  primaryLabel?: React.ReactNode;
  /** Status badge or indicator rendered in the header/meta row */
  status?: React.ReactNode;
  /** Share or completion percentage (0–100) rendered as a GPU-animated bar */
  progress?: number;
  /** Optional label right next to the progress bar (e.g. "34,2% part.") */
  progressLabel?: React.ReactNode;
  /** Custom CSS color for the progress fill */
  progressColor?: string;
  /** Compact inline metrics always visible on the card face */
  highlights?: ExpandableDataMetric[];
  /** Secondary key-value pairs revealed smoothly inside `MotionCollapse` */
  details?: ExpandableDataMetric[];
  /** Custom expanded body rendered after `details` inside `MotionCollapse` */
  expandedContent?: React.ReactNode;
  /** Touch-friendly action buttons (`min-h-10` recommended) */
  actions?: React.ReactNode;
  /** Controlled expansion state */
  expanded?: boolean;
  /** Initial expansion state when uncontrolled (default: false) */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Label for the expand button (default: "Detalhes") */
  expandLabel?: string;
  /** Optional click handler on the main card header */
  onClick?: () => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const TONE_CODE_CLS: Record<ExpandableDataCardTone, string> = {
  default: "bg-muted text-foreground border-border",
  brand: "bg-brand-soft text-brand-soft-foreground border-brand-border/70",
  success: "bg-success-soft text-success-soft-foreground border-success-border/70",
  warning: "bg-warning-soft text-warning-soft-foreground border-warning-border/70",
  danger: "bg-danger-soft text-danger-soft-foreground border-danger-border/70",
  info: "bg-info-soft text-info-soft-foreground border-info-border/70",
};

const TONE_BAR_CLS: Record<ExpandableDataCardTone, string> = {
  default: "bg-primary",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

const METRIC_TONE_CLS: Record<NonNullable<ExpandableDataMetric["tone"]>, string> = {
  default: "text-foreground",
  brand: "text-brand font-semibold",
  success: "text-success font-semibold",
  warning: "text-warning font-semibold",
  danger: "text-danger font-semibold",
  info: "text-info font-semibold",
  muted: "text-muted-foreground",
};

function isAnimatedValueConfig(
  val: ExpandableDataCardProps["primaryValue"],
): val is ExpandableDataAnimatedValue {
  return (
    typeof val === "object" &&
    val !== null &&
    !React.isValidElement(val) &&
    "value" in val &&
    typeof (val as ExpandableDataAnimatedValue).value === "number"
  );
}

export function ExpandableDataCard({
  code,
  tone = "default",
  icon,
  title,
  subtitle,
  primaryValue,
  primaryLabel,
  status,
  progress,
  progressLabel,
  progressColor,
  highlights,
  details,
  expandedContent,
  actions,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  expandLabel = "Detalhes",
  onClick,
  className,
  componentId,
  hideIfDenied = false,
}: ExpandableDataCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : uncontrolledExpanded;

  if (!hasPermission && hideIfDenied) return null;

  const visibleDetails = details?.filter(
    (d) => d.value !== undefined && d.value !== null && d.value !== "",
  );
  const visibleHighlights = highlights?.filter(
    (h) => h.value !== undefined && h.value !== null && h.value !== "",
  );
  const hasExpandableRegion =
    Boolean(visibleDetails && visibleDetails.length > 0) || Boolean(expandedContent);

  const clampedProgress =
    typeof progress === "number" && Number.isFinite(progress)
      ? Math.max(0, Math.min(100, progress))
      : undefined;

  const toggleExpanded = () => {
    const next = !isExpanded;
    if (!isControlled) setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  };

  const renderedPrimaryValue = isAnimatedValueConfig(primaryValue) ? (
    <AnimatedNumber
      value={primaryValue.value}
      format={primaryValue.format ?? "decimal"}
      decimals={primaryValue.decimals}
      percentScale={primaryValue.percentScale}
      prefix={primaryValue.prefix}
      suffix={primaryValue.suffix}
    />
  ) : (
    primaryValue
  );

  return (
    <article
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-card text-card-foreground shadow-[var(--shadow-card)] transition-colors",
        isExpanded && "border-border-strong",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      <div
        onClick={
          onClick
            ? onClick
            : hasExpandableRegion && !actions
              ? toggleExpanded
              : undefined
        }
        className={cn(
          "flex flex-col gap-2.5 p-3.5",
          (onClick || (hasExpandableRegion && !actions)) &&
            "cursor-pointer active:bg-muted/40 transition-colors rounded-t-[var(--radius-card)]",
        )}
      >
        {/* Top Row: Code/Icon + Title/Subtitle on left | Primary Metric + Status on right */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                {code !== undefined && code !== null && code !== "" && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none tabular-nums shrink-0",
                      TONE_CODE_CLS[tone],
                    )}
                  >
                    {code}
                  </span>
                )}
                {status && primaryValue === undefined && (
                  <div className="shrink-0">{status}</div>
                )}
              </div>

              <div className="text-[13px] font-bold leading-snug text-foreground line-clamp-2 break-words">
                {title}
              </div>

              {subtitle && (
                <div className="mt-0.5 text-[11px] text-muted-foreground leading-snug line-clamp-1">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {(renderedPrimaryValue !== undefined || status) && (
            <div className="flex flex-col items-end gap-1 shrink-0 text-right">
              {primaryLabel && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground leading-none">
                  {primaryLabel}
                </span>
              )}
              {renderedPrimaryValue !== undefined && (
                <div className="text-sm font-black tracking-tight tabular-nums text-foreground leading-tight">
                  {renderedPrimaryValue}
                </div>
              )}
              {status && primaryValue !== undefined && (
                <div className="shrink-0">{status}</div>
              )}
            </div>
          )}
        </div>

        {/* Share / Progress Bar */}
        {clampedProgress !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: clampedProgress / 100 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 30 }
                }
                style={{
                  transformOrigin: "left center",
                  ...(progressColor ? { backgroundColor: progressColor } : {}),
                }}
                className={cn(
                  "h-full w-full rounded-full",
                  !progressColor && TONE_BAR_CLS[tone],
                )}
              />
            </div>
            {progressLabel !== undefined && (
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
                {progressLabel}
              </span>
            )}
          </div>
        )}

        {/* Compact Highlights Row */}
        {visibleHighlights && visibleHighlights.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[11px]">
            {visibleHighlights.map((item, idx) => (
              <div key={item.id ?? idx} className="inline-flex items-center gap-1 min-w-0">
                <span className="text-muted-foreground">{item.label}:</span>
                <span
                  className={cn(
                    "font-semibold truncate",
                    item.mono && "font-mono tabular-nums",
                    METRIC_TONE_CLS[item.tone ?? "default"],
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Secondary Details + Footer Bar */}
      {hasExpandableRegion && (
        <MotionCollapse open={isExpanded}>
          <div className="border-t border-border/70 bg-muted/25 px-3.5 py-3 space-y-2.5">
            {visibleDetails && visibleDetails.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                {visibleDetails.map((detail, idx) => (
                  <div
                    key={detail.id ?? idx}
                    className={cn(
                      "min-w-0 flex flex-col gap-0.5",
                      detail.fullSpan && "col-span-2",
                    )}
                  >
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                      {detail.label}
                    </dt>
                    <dd
                      className={cn(
                        "text-xs font-medium break-words",
                        detail.mono && "font-mono tabular-nums",
                        METRIC_TONE_CLS[detail.tone ?? "default"],
                      )}
                    >
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {expandedContent}
          </div>
        </MotionCollapse>
      )}

      {(hasExpandableRegion || actions) && (
        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-1.5 bg-card/80 rounded-b-[var(--radius-card)]">
          {hasExpandableRegion ? (
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <span>{isExpanded ? "Ocultar" : expandLabel}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200 motion-reduce:transition-none",
                  isExpanded && "rotate-180",
                )}
              />
            </button>
          ) : (
            <span />
          )}

          {actions && (
            <div
              className="flex items-center justify-end gap-1.5 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default ExpandableDataCard;
