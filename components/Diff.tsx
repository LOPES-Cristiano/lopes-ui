"use client";

import React, { useCallback, useRef, useState } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export type DiffProps = {
  /** Left / Top content ("Before") — image URL or custom ReactNode */
  before: string | React.ReactNode;
  /** Right / Bottom content ("After") — image URL or custom ReactNode */
  after: string | React.ReactNode;
  beforeAlt?: string;
  afterAlt?: string;
  /** Optional badge label for the "Before" side (e.g. "Antes") */
  beforeLabel?: React.ReactNode;
  /** Optional badge label for the "After" side (e.g. "Depois") */
  afterLabel?: React.ReactNode;
  /** Initial split percentage (0 to 100, default: 50) */
  defaultPosition?: number;
  /** Controlled split percentage (0 to 100) */
  position?: number;
  onPositionChange?: (position: number) => void;
  /** Split direction (default: "horizontal") */
  orientation?: "horizontal" | "vertical";
  /** Aspect ratio class or height (default: "aspect-video") */
  aspectClassName?: string;
  disabled?: boolean;
  /** Access-control identifier */
  componentId?: string;
  hideIfDenied?: boolean;
  className?: string;
};

function renderDiffLayer(content: string | React.ReactNode, alt: string) {
  if (typeof content === "string") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content}
        alt={alt}
        draggable={false}
        className="h-full w-full object-cover select-none pointer-events-none"
      />
    );
  }
  return <div className="h-full w-full select-none">{content}</div>;
}

export default function Diff({
  before,
  after,
  beforeAlt = "Antes",
  afterAlt = "Depois",
  beforeLabel,
  afterLabel,
  defaultPosition = 50,
  position: controlledPosition,
  onPositionChange,
  orientation = "horizontal",
  aspectClassName = "aspect-video",
  disabled = false,
  componentId,
  hideIfDenied = true,
  className,
}: DiffProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [internalPos, setInternalPos] = useState(() =>
    Math.max(0, Math.min(100, defaultPosition))
  );
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pos = controlledPosition !== undefined ? controlledPosition : internalPos;

  const setPos = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(100, next));
      if (controlledPosition === undefined) {
        setInternalPos(clamped);
      }
      onPositionChange?.(clamped);
    },
    [controlledPosition, onPositionChange]
  );

  const updateFromClientCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || disabled) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (orientation === "horizontal") {
        const pct = ((clientX - rect.left) / rect.width) * 100;
        setPos(pct);
      } else {
        const pct = ((clientY - rect.top) / rect.height) * 100;
        setPos(pct);
      }
    },
    [disabled, orientation, setPos]
  );

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled || !hasPermission);
  const isHorizontal = orientation === "horizontal";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (effectiveDisabled) return;
    const step = e.shiftKey ? 10 : 2;
    if (
      (isHorizontal && e.key === "ArrowLeft") ||
      (!isHorizontal && e.key === "ArrowUp")
    ) {
      e.preventDefault();
      setPos(pos - step);
    } else if (
      (isHorizontal && e.key === "ArrowRight") ||
      (!isHorizontal && e.key === "ArrowDown")
    ) {
      e.preventDefault();
      setPos(pos + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(100);
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Comparador Antes e Depois"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      aria-disabled={effectiveDisabled}
      tabIndex={effectiveDisabled ? -1 : 0}
      {...(componentId ? { "data-component-id": componentId } : {})}
      onKeyDown={handleKeyDown}
      onPointerDown={(e) => {
        if (effectiveDisabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        updateFromClientCoords(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!dragging || effectiveDisabled) return;
        updateFromClientCoords(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (!dragging) return;
        setDragging(false);
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        aspectClassName,
        !effectiveDisabled &&
          (isHorizontal ? "cursor-ew-resize" : "cursor-ns-resize"),
        className
      )}
    >
      {/* Base Layer: AFTER (100% size) */}
      <div className="absolute inset-0 h-full w-full">
        {renderDiffLayer(after, afterAlt)}
      </div>

      {/* Clipped Layer: BEFORE */}
      <div
        style={{
          clipPath: isHorizontal
            ? `inset(0 ${100 - pos}% 0 0)`
            : `inset(0 0 ${100 - pos}% 0)`,
        }}
        className="absolute inset-0 h-full w-full"
      >
        {renderDiffLayer(before, beforeAlt)}
      </div>

      {/* Labels */}
      {beforeLabel && (
        <span className="pointer-events-none absolute top-3 left-3 z-10 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
          {beforeLabel}
        </span>
      )}
      {afterLabel && (
        <span
          className={cn(
            "pointer-events-none absolute z-10 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs",
            isHorizontal ? "top-3 right-3" : "bottom-3 left-3"
          )}
        >
          {afterLabel}
        </span>
      )}

      {/* Divider Line & Handle */}
      <div
        style={
          isHorizontal
            ? { left: `${pos}%` }
            : { top: `${pos}%` }
        }
        className={cn(
          "pointer-events-none absolute z-20 flex items-center justify-center bg-white shadow-[0_0_8px_rgba(0,0,0,0.45)]",
          isHorizontal
            ? "inset-y-0 w-0.5 -translate-x-1/2"
            : "inset-x-0 h-0.5 -translate-y-1/2"
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-lg transition-transform duration-150 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
            dragging ? "scale-110" : "group-hover:scale-105"
          )}
        >
          {isHorizontal ? (
            <GripVertical size={16} />
          ) : (
            <GripHorizontal size={16} />
          )}
        </div>
      </div>
    </div>
  );
}
