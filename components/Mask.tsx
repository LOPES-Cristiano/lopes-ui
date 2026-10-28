"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type MaskShape =
  | "squircle"
  | "circle"
  | "square"
  | "hexagon"
  | "hexagon-2"
  | "decagon"
  | "pentagon"
  | "diamond"
  | "heart"
  | "star"
  | "triangle";

export type MaskProps = React.HTMLAttributes<HTMLDivElement> & {
  shape?: MaskShape;
};

export const MASK_CLIP_PATHS: Record<MaskShape, string | undefined> = {
  circle: "circle(50% at 50% 50%)",
  square: undefined,
  squircle: " path('M 50,0 C 90,0 100,10 100,50 C 100,90 90,100 50,100 C 10,100 0,90 0,50 C 0,10 10,0 50,0 Z')",
  hexagon: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
  "hexagon-2": "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
  decagon:
    "polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)",
  pentagon: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  triangle: "polygon(50% 5%, 0% 95%, 100% 95%)",
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  heart:
    "polygon(50% 92%, 15% 58%, 4% 36%, 10% 15%, 28% 8%, 50% 24%, 72% 8%, 90% 15%, 96% 36%, 85% 58%)",
};

export function getMaskStyle(shape?: MaskShape): React.CSSProperties | undefined {
  if (!shape || shape === "square") return undefined;
  if (shape === "squircle") {
    return { borderRadius: "28%" };
  }
  if (shape === "circle") {
    return { borderRadius: "9999px" };
  }
  const clip = MASK_CLIP_PATHS[shape];
  return clip ? { clipPath: clip } : undefined;
}

export default function Mask({
  shape = "squircle",
  className,
  style,
  children,
  ...props
}: MaskProps) {
  const maskStyle = getMaskStyle(shape);

  return (
    <div
      style={{ ...maskStyle, ...style }}
      className={cn(
        "inline-flex items-center justify-center overflow-hidden",
        shape === "square" && "rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
