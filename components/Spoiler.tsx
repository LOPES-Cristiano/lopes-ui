"use client";

import React, { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SpoilerProps = {
  /** Maximum collapsed height in pixels. Default: 120 */
  maxHeight?: number;
  /** Label shown when content is collapsed. Default: "Mostrar mais" */
  showLabel?: React.ReactNode;
  /** Label shown when content is expanded. Default: "Mostrar menos" */
  hideLabel?: React.ReactNode;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Initial expanded state for uncontrolled usage. Default: false */
  defaultExpanded?: boolean;
  /** Callback fired when expanded state toggles */
  onExpandedChange?: (expanded: boolean) => void;
  /** Transition duration in ms. Default: 220 */
  transitionDuration?: number;
  /** Show soft bottom fade gradient while collapsed. Default: true */
  fadeGradient?: boolean;
  children: React.ReactNode;
  className?: string;
  controlClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Component (Mantine UI Spoiler) ────────────────────────────────────────────

export default function Spoiler({
  maxHeight = 120,
  showLabel = "Mostrar mais",
  hideLabel = "Mostrar menos",
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  transitionDuration = 220,
  fadeGradient = true,
  children,
  className,
  controlClassName,
  componentId,
  hideIfDenied = false,
}: SpoilerProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isExpanded = controlledExpanded ?? internalExpanded;

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const fullH = el.scrollHeight;
      setContentHeight(fullH);
      setHasOverflow(fullH > maxHeight + 4);
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [maxHeight, children]);

  if (!hasPermission && hideIfDenied) return null;

  const toggle = () => {
    if (!hasPermission) return;
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge("relative flex flex-col", !hasPermission && "opacity-60", className)}
    >
      <div
        style={{
          maxHeight: !hasOverflow
            ? undefined
            : isExpanded
              ? `${Math.max(contentHeight, maxHeight)}px`
              : `${maxHeight}px`,
          transitionDuration: `${transitionDuration}ms`,
        }}
        className="relative overflow-hidden transition-[max-height] ease-out"
      >
        <div ref={contentRef}>{children}</div>

        {hasOverflow && !isExpanded && fadeGradient && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface via-surface/80 to-transparent"
          />
        )}
      </div>

      {hasOverflow && (
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={toggle}
          disabled={!hasPermission}
          className={twMerge(
            "mt-2 inline-flex w-fit items-center gap-1 rounded-md text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:pointer-events-none",
            controlClassName,
          )}
        >
          <span>{isExpanded ? hideLabel : showLabel}</span>
          <ChevronDown
            size={14}
            className={twMerge(
              "transition-transform duration-150",
              isExpanded && "rotate-180",
            )}
          />
        </button>
      )}
    </div>
  );
}

export { Spoiler };
