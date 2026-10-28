"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export type StackDirection = "bottom" | "top" | "left" | "right";

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Direction in which background cards peek out (default: "bottom") */
  direction?: StackDirection;
  /** Maximum number of visible stacked layers (default: 3) */
  maxVisible?: number;
  /** Offset in pixels between each stacked layer (default: 10) */
  offsetPx?: number;
  /** Scale reduction per background layer (default: 0.04) */
  scaleStep?: number;
  /** Expand layers into a smooth vertical/horizontal fan when hovering (default: false) */
  fanOnHover?: boolean;
  /** Cycle the front element to the back when clicking the stack (default: false) */
  cycleOnClick?: boolean;
};

export default function Stack({
  direction = "bottom",
  maxVisible = 3,
  offsetPx = 10,
  scaleStep = 0.04,
  fanOnHover = false,
  cycleOnClick = false,
  className,
  children,
  onClick,
  style,
  ...props
}: StackProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  const [frontIndex, setFrontIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const frontCardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState<number>(76);

  const total = items.length;
  const activeFront = total > 0 ? frontIndex % total : 0;

  useEffect(() => {
    const el = frontCardRef.current;
    if (!el) return;
    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) setCardHeight(h);
    };
    updateHeight();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateHeight);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [activeFront, total]);

  if (total === 0) return null;

  const handleStackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !cycleOnClick || total <= 1) return;
    setFrontIndex((prev) => (prev + 1) % total);
  };

  const visibleLayers = Math.min(total, maxVisible);
  const expandFan = fanOnHover && hovered && visibleLayers > 1;
  const fanGap = 8;
  const fanStepPx = cardHeight + fanGap;

  const bottomPad =
    expandFan
      ? (visibleLayers - 1) * fanStepPx
      : direction === "bottom"
        ? (visibleLayers - 1) * offsetPx + 2
        : 0;

  const topPad =
    !expandFan && direction === "top"
      ? (visibleLayers - 1) * offsetPx + 2
      : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleStackClick}
      className={cn(
        "relative grid place-items-center w-full transition-[padding] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
        cycleOnClick && total > 1 && "cursor-pointer select-none",
        className
      )}
      style={{
        paddingBottom: bottomPad > 0 ? bottomPad : undefined,
        paddingTop: topPad > 0 ? topPad : undefined,
        ...style,
      }}
      {...props}
    >
      {items.map((child, originalIdx) => {
        // Compute layer depth (0 = front card, 1 = second card, etc.)
        const layerIdx = (originalIdx - activeFront + total) % total;
        const isVisible = layerIdx < maxVisible;
        const isFront = layerIdx === 0;

        const clampedIdx = Math.min(layerIdx, maxVisible);
        const stackedFactor = clampedIdx * offsetPx;
        const scale = expandFan
          ? 1
          : Math.max(0.82, 1 - clampedIdx * scaleStep);

        let tx = 0;
        let ty = 0;

        if (expandFan) {
          ty = clampedIdx * fanStepPx;
        } else if (direction === "bottom") {
          ty = stackedFactor;
        } else if (direction === "top") {
          ty = -stackedFactor;
        } else if (direction === "left") {
          tx = -stackedFactor;
        } else if (direction === "right") {
          tx = stackedFactor;
        }

        return (
          <div
            key={originalIdx}
            ref={isFront ? frontCardRef : undefined}
            aria-hidden={!isFront && !expandFan}
            style={{
              zIndex: total - layerIdx,
              transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
              opacity: isVisible ? (expandFan || isFront ? 1 : Math.max(0.55, 1 - layerIdx * 0.14)) : 0,
            }}
            className={cn(
              "col-start-1 row-start-1 w-full origin-top will-change-transform transition-[transform,opacity,filter] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
              !isFront && !expandFan && "pointer-events-none brightness-[0.97] dark:brightness-[0.88]",
              !isVisible && "pointer-events-none"
            )}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
