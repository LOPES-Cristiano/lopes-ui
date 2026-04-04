"use client";

import React, { useId, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

/** "discrete" = instant jump (DaisyUI-style) | "slide" = smooth slide-up */
export type TextRotateAnimation = "discrete" | "slide";
export type TextRotateAlign     = "left" | "center" | "right";

export type TextRotateItem = {
  /** Content to display */
  content: React.ReactNode;
  /** Extra classes applied to this item's wrapper (e.g. for colors/bg) */
  className?: string;
};

export type TextRotateProps = {
  /** Items to rotate through. Pass strings, ReactNodes, or {content, className} objects. */
  items: (React.ReactNode | TextRotateItem)[];
  /** Duration shown per item in ms (default 2500) */
  duration?: number;
  /** Animation style (default "slide") */
  animation?: TextRotateAnimation;
  /** Pause while hovering (default true) */
  pauseOnHover?: boolean;
  /** Horizontal alignment of items — useful when used standalone/centered */
  align?: TextRotateAlign;
  /** Render inline so it flows inside a sentence */
  inline?: boolean;
  className?: string;
  itemClassName?: string;
  componentId?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isItem(v: unknown): v is TextRotateItem {
  return typeof v === "object" && v !== null && "content" in (v as Record<string, unknown>);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TextRotate({
  items,
  duration     = 2500,
  animation    = "slide",
  pauseOnHover = true,
  align,
  inline       = false,
  className,
  itemClassName,
  componentId,
}: TextRotateProps) {
  const raw = useId();
  // CSS-safe unique identifier (no colons or special chars)
  const uid = "tr" + raw.replace(/[^a-zA-Z0-9]/g, "");

  const n        = Math.max(1, items.length);
  const totalMs  = duration * n;
  const holdFrac = 0.72; // fraction of each slot where the item holds before sliding

  // ── Build keyframes ────────────────────────────────────────────────────────
  const css = useMemo(() => {
    let kf: string;

    if (animation === "discrete" || n === 1) {
      // Instant jump via steps()
      kf = `@keyframes ${uid}kf {
  from { transform: translateY(0); }
  to   { transform: translateY(calc(${n} * -1lh)); }
}`;
    } else {
      // Smooth slide: hold → ease-in-out → next position
      const frames = Array.from({ length: n }, (_, i) => {
        const startPct   = ((i            / n) * 100).toFixed(3);
        const holdEndPct = (((i + holdFrac) / n) * 100).toFixed(3);
        const endPct     = (((i + 1)       / n) * 100).toFixed(3);
        return [
          `  ${startPct}%   { transform: translateY(calc(${i} * -1lh)); }`,
          `  ${holdEndPct}% { transform: translateY(calc(${i} * -1lh)); animation-timing-function: ease-in-out; }`,
          `  ${endPct}%     { transform: translateY(calc(${i + 1} * -1lh)); }`,
        ].join("\n");
      }).join("\n");

      kf = `@keyframes ${uid}kf {\n${frames}\n}`;
    }

    const iterCount = n === 1 ? "1" : "infinite";
    const timing    =
      animation === "discrete" || n === 1
        ? `steps(${n}, end)`
        : `linear`;

    return `${kf}\n.${uid} { animation: ${uid}kf ${totalMs}ms ${timing} ${iterCount}; }`;
  }, [uid, n, totalMs, animation, holdFrac]);

  // ── Pause on hover ─────────────────────────────────────────────────────────
  const [paused, setPaused] = useState(false);

  const Tag       = inline ? "span" : "div";
  const alignCls  =
    align === "center" ? "justify-items-center" :
    align === "right"  ? "justify-items-end"    : "";

  return (
    <Tag
      className={twMerge(
        inline ? "inline-block align-bottom" : "block",
        "overflow-hidden",
        className,
      )}
      style={{ height: "1lh" }}
      onMouseEnter={pauseOnHover ? () => setPaused(true)  : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      <style>{css}</style>

      {/* Animated track — contains all items stacked vertically */}
      <Tag
        className={`${uid} grid ${alignCls}`}
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {items.map((item, i) => {
          const obj     = isItem(item);
          const content = obj ? item.content  : (item as React.ReactNode);
          const cls     = obj ? item.className : undefined;
          return (
            <Tag
              key={i}
              className={twMerge(itemClassName, cls)}
              style={{ height: "1lh" }}
            >
              {content}
            </Tag>
          );
        })}
      </Tag>
    </Tag>
  );
}
