"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { type LucideIcon } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

export type SegmentedControlItem = {
  value: string;
  label: React.ReactNode;
  icon?: LucideIcon | React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  componentId?: string;
};

export type SegmentedControlSize = "xs" | "sm" | "md" | "lg";
export type SegmentedControlVariant = "default" | "primary" | "outline";

export type SegmentedControlProps = {
  /** Array of string values or rich item objects */
  data: (string | SegmentedControlItem)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  size?: SegmentedControlSize;
  variant?: SegmentedControlVariant;
  radius?: "md" | "lg" | "full";
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const SIZE_CLS: Record<
  SegmentedControlSize,
  { pad: string; text: string; icon: number; wrapPad: string }
> = {
  xs: { pad: "px-2.5 py-1", text: "text-[11px]", icon: 12, wrapPad: "p-0.5" },
  sm: { pad: "px-3 py-1.5", text: "text-xs", icon: 13, wrapPad: "p-1" },
  md: { pad: "px-3.5 py-2", text: "text-sm", icon: 15, wrapPad: "p-1" },
  lg: { pad: "px-4 py-2.5", text: "text-base", icon: 17, wrapPad: "p-1.5" },
};

const RADIUS_WRAP: Record<NonNullable<SegmentedControlProps["radius"]>, string> = {
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

const RADIUS_THUMB: Record<NonNullable<SegmentedControlProps["radius"]>, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

function renderItemIcon(
  icon: SegmentedControlItem["icon"],
  sizePx: number
): React.ReactNode {
  if (!icon) return null;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
    const IconComp = icon as LucideIcon;
    return <IconComp size={sizePx} strokeWidth={2} className="shrink-0" />;
  }
  return icon;
}

export default function SegmentedControl({
  data,
  value: controlledValue,
  defaultValue,
  onChange,
  name,
  size = "sm",
  variant = "default",
  radius = "lg",
  orientation = "horizontal",
  fullWidth = false,
  disabled = false,
  readOnly = false,
  className,
  componentId,
  hideIfDenied = false,
}: SegmentedControlProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);
  const groupId = useId();

  const items = useMemo<SegmentedControlItem[]>(
    () =>
      data.map((entry) =>
        typeof entry === "string" ? { value: entry, label: entry } : entry
      ),
    [data]
  );

  const firstEnabled = items.find((i) => !i.disabled)?.value ?? items[0]?.value ?? "";
  const [uncontrolled, setUncontrolled] = useState<string>(defaultValue ?? firstEnabled);

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolled;

  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    ready: boolean;
  }>({ x: 0, y: 0, width: 0, height: 0, ready: false });

  const measureIndicator = useCallback(() => {
    const container = containerRef.current;
    const activeBtn = btnRefs.current[activeValue];
    if (!container || !activeBtn) {
      setIndicator((prev) => ({ ...prev, ready: false }));
      return;
    }
    setIndicator({
      x: activeBtn.offsetLeft,
      y: activeBtn.offsetTop,
      width: activeBtn.offsetWidth,
      height: activeBtn.offsetHeight,
      ready: true,
    });
  }, [activeValue]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator, items, size, fullWidth, orientation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureIndicator());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measureIndicator]);

  const selectValue = (nextVal: string) => {
    if (effectiveDisabled || readOnly || nextVal === activeValue) return;
    if (!isControlled) setUncontrolled(nextVal);
    onChange?.(nextVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (effectiveDisabled || readOnly) return;
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";

    if (e.key === prevKey || e.key === nextKey) {
      e.preventDefault();
      const dir = e.key === nextKey ? 1 : -1;
      for (let step = 1; step <= items.length; step++) {
        const candidateIdx = (idx + dir * step + items.length) % items.length;
        const candidate = items[candidateIdx];
        if (candidate && !candidate.disabled) {
          selectValue(candidate.value);
          btnRefs.current[candidate.value]?.focus();
          break;
        }
      }
    }
  };

  if (!hasPermission && hideIfDenied) return null;

  const s = SIZE_CLS[size];

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-orientation={orientation}
      data-component-id={componentId}
      className={twMerge(
        "relative inline-flex select-none",
        orientation === "vertical" ? "flex-col" : "flex-row items-center",
        fullWidth && "flex w-full",
        RADIUS_WRAP[radius],
        s.wrapPad,
        variant === "outline"
          ? "border border-border bg-transparent"
          : "border border-border/70 bg-surface-muted",
        effectiveDisabled && "opacity-55 cursor-not-allowed",
        className
      )}
    >
      {name ? <input type="hidden" name={name} value={activeValue} /> : null}

      {/* Sliding Floating Indicator Pill */}
      {indicator.ready && (
        <span
          aria-hidden="true"
          style={{
            transform: `translate3d(${indicator.x}px, ${indicator.y}px, 0)`,
            width: `${indicator.width}px`,
            height: `${indicator.height}px`,
          }}
          className={twMerge(
            "pointer-events-none absolute left-0 top-0 z-0 transition-[transform,width,height] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            RADIUS_THUMB[radius],
            variant === "primary"
              ? "bg-primary shadow-xs"
              : "bg-surface shadow-xs ring-1 ring-border/80"
          )}
        />
      )}

      {items.map((item, idx) => {
        const isActive = item.value === activeValue;
        const isItemDisabled = Boolean(effectiveDisabled || item.disabled);

        return (
          <button
            key={`${groupId}-${item.value}`}
            ref={(el) => {
              btnRefs.current[item.value] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={isItemDisabled}
            data-component-id={
              item.componentId ?? (componentId ? `${componentId}.${item.value}` : undefined)
            }
            tabIndex={isActive ? 0 : -1}
            onClick={() => selectValue(item.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={twMerge(
              "relative z-10 inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              RADIUS_THUMB[radius],
              s.pad,
              s.text,
              fullWidth && "flex-1",
              isItemDisabled ? "opacity-45 cursor-not-allowed" : "cursor-pointer",
              isActive
                ? variant === "primary"
                  ? "text-primary-foreground font-semibold"
                  : "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {renderItemIcon(item.icon, s.icon)}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge !== null && (
              <span
                className={twMerge(
                  "ml-0.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold leading-tight",
                  isActive && variant === "primary"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-surface-hover text-muted-foreground"
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
