"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";

export type StackDirection = "bottom" | "top" | "left" | "right";

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Direction in which background cards peek out (default: "bottom") */
  direction?: StackDirection;
  /** Maximum number of visible stacked layers (default: 3) */
  maxVisible?: number;
  /** Offset in pixels between each stacked layer (default: 8) */
  offsetPx?: number;
  /** Scale reduction per background layer (default: 0.05) */
  scaleStep?: number;
  /** Expand layers into a vertical/horizontal fan when hovering (default: false) */
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
  ...props
}: StackProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  const [frontIndex, setFrontIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  if (items.length === 0) return null;

  const orderedItems = [
    ...items.slice(frontIndex % items.length),
    ...items.slice(0, frontIndex % items.length),
  ];

  const handleStackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !cycleOnClick || items.length <= 1) return;
    setFrontIndex((prev) => (prev + 1) % items.length);
  };

  const visibleLayers = Math.min(items.length, maxVisible);
  const expandFan = fanOnHover && hovered && visibleLayers > 1;

  if (expandFan) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleStackClick}
        className={cn(
          "flex flex-col gap-2 w-full transition-all duration-300 ease-out",
          cycleOnClick && items.length > 1 && "cursor-pointer select-none",
          className
        )}
        {...props}
      >
        {orderedItems.slice(0, maxVisible).map((child, idx) => (
          <div
            key={idx}
            className="w-full transition-all duration-300 ease-out animate-in fade-in-0 slide-in-from-top-1"
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleStackClick}
      className={cn(
        "relative grid place-items-center w-full",
        cycleOnClick && items.length > 1 && "cursor-pointer select-none",
        className
      )}
      style={{
        paddingBottom:
          direction === "bottom"
            ? (visibleLayers - 1) * offsetPx + 2
            : undefined,
        paddingTop:
          direction === "top"
            ? (visibleLayers - 1) * offsetPx + 2
            : undefined,
      }}
      {...props}
    >
      {orderedItems.map((child, idx) => {
        if (idx >= maxVisible) return null;

        const isFront = idx === 0;
        const factor = idx * offsetPx;
        const scale = Math.max(0.82, 1 - idx * scaleStep);

        let translate = `translateY(${factor}px)`;
        if (direction === "top") translate = `translateY(-${factor}px)`;
        if (direction === "left") translate = `translateX(-${factor}px)`;
        if (direction === "right") translate = `translateX(${factor}px)`;

        return (
          <div
            key={idx}
            style={{
              zIndex: maxVisible - idx,
              transform: `${translate} scale(${scale})`,
            }}
            className={cn(
              "col-start-1 row-start-1 w-full transition-all duration-300 ease-out origin-top",
              !isFront && "pointer-events-none brightness-[0.97] dark:brightness-[0.88]"
            )}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
