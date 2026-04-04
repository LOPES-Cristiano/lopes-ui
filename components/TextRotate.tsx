"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TextRotateAnimation = "slide" | "discrete" | "fade" | "rise";
export type TextRotateAlign     = "left" | "center" | "right";
export type TextRotateSplitBy   = "characters" | "words" | "lines" | (string & {});
export type TextRotateStaggerFrom = "first" | "last" | "center" | "random" | number;

export type TextRotateItem = {
  content: React.ReactNode;
  className?: string;
};

export type TextRotateHandle = {
  next:     () => void;
  previous: () => void;
  jumpTo:   (index: number) => void;
  reset:    () => void;
};

type MotionVariant = Record<string, string | number>;

export type TextRotateProps = {
  /** Items to rotate. Accepts strings, ReactNodes, or {content, className} objects. */
  items: (React.ReactNode | TextRotateItem)[];
  /** Duration shown per item in ms. Default: 2500 */
  duration?: number;
  /** Built-in animation preset. Default: "slide" */
  animation?: TextRotateAnimation;
  /** Pause auto-rotation while hovering. Default: true */
  pauseOnHover?: boolean;
  /** Horizontal alignment. Useful for standalone/centered usage. */
  align?: TextRotateAlign;
  /** Render as inline element so it flows inside a sentence. */
  inline?: boolean;
  className?: string;
  itemClassName?: string;
  // ── Advanced (ReactBits-style) ─────────────────────────────────────────────
  /** How to split text for per-unit stagger. Default: "characters" */
  splitBy?: TextRotateSplitBy;
  /** Delay between each stagger unit in seconds. Default: 0.035 */
  staggerDuration?: number;
  /** Which end the stagger starts from. Default: "first" */
  staggerFrom?: TextRotateStaggerFrom;
  /** Wrap back to start on last item. Default: true */
  loop?: boolean;
  /** Auto-advance on interval. Default: true */
  auto?: boolean;
  /** Called whenever the visible index changes. */
  onNext?: (index: number) => void;
  /** Override enter/animate/exit motion values directly. */
  initial?: MotionVariant;
  animate?: MotionVariant;
  exit?: MotionVariant;
  /** Override transition (spring/tween config). */
  transition?: object;
};

// ── Animation presets ─────────────────────────────────────────────────────────

const PRESETS: Record<
  TextRotateAnimation,
  { initial: MotionVariant; animate: MotionVariant; exit: MotionVariant; transition: object }
> = {
  slide: {
    initial:    { y: "110%", opacity: 0 },
    animate:    { y: 0,      opacity: 1 },
    exit:       { y: "-110%", opacity: 0 },
    transition: { type: "spring", damping: 28, stiffness: 350 },
  },
  discrete: {
    initial:    { opacity: 0, scale: 0.8 },
    animate:    { opacity: 1, scale: 1   },
    exit:       { opacity: 0, scale: 0.8 },
    transition: { duration: 0.14, ease: "easeInOut" },
  },
  fade: {
    initial:    { opacity: 0, y: 6  },
    animate:    { opacity: 1, y: 0  },
    exit:       { opacity: 0, y: -6 },
    transition: { duration: 0.28, ease: "easeInOut" },
  },
  rise: {
    initial:    { y: "30%", opacity: 0, filter: "blur(4px)" },
    animate:    { y: 0,     opacity: 1, filter: "blur(0px)" },
    exit:       { y: "-30%", opacity: 0, filter: "blur(4px)" },
    transition: { type: "spring", damping: 22, stiffness: 260 },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isItem(v: unknown): v is TextRotateItem {
  return typeof v === "object" && v !== null && "content" in (v as Record<string, unknown>);
}

function splitChars(text: string): string[] {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

type WordObj = { chars: React.ReactNode[]; space: boolean };

function buildElements(content: React.ReactNode, splitBy: TextRotateSplitBy): WordObj[] {
  if (typeof content !== "string") {
    return [{ chars: [content], space: false }];
  }
  const text = content;
  if (splitBy === "characters") {
    return text.split(" ").map((word, i, arr) => ({
      chars: splitChars(word),
      space: i < arr.length - 1,
    }));
  }
  if (splitBy === "words") {
    return text.split(" ").map((word, i, arr) => ({
      chars: [word],
      space: i < arr.length - 1,
    }));
  }
  if (splitBy === "lines") {
    return text.split("\n").map((line, i, arr) => ({
      chars: [line],
      space: i < arr.length - 1,
    }));
  }
  return text.split(splitBy).map((part, i, arr) => ({
    chars: [part],
    space: i < arr.length - 1,
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

const TextRotate = forwardRef<TextRotateHandle, TextRotateProps>(function TextRotate(
  {
    items,
    duration        = 2500,
    animation       = "slide",
    pauseOnHover    = true,
    align,
    inline          = false,
    className,
    itemClassName,
    splitBy         = "characters",
    staggerDuration = 0.035,
    staggerFrom     = "first",
    loop            = true,
    auto            = true,
    onNext,
    initial:    initialProp,
    animate:    animateProp,
    exit:       exitProp,
    transition: transitionProp,
  },
  ref,
) {
  const [index,  setIndex]  = useState(0);
  const [paused, setPaused] = useState(false);

  const preset = PRESETS[animation] ?? PRESETS.slide;
  const motionInitial    = initialProp    ?? preset.initial;
  const motionAnimate    = animateProp    ?? preset.animate;
  const motionExit       = exitProp       ?? preset.exit;
  const motionTransition = transitionProp ?? preset.transition;

  // ── Current item ────────────────────────────────────────────────────────────
  const current        = items[index];
  const currentContent = isItem(current) ? current.content : (current as React.ReactNode);
  const currentClass   = isItem(current) ? current.className : undefined;

  const elements = useMemo(
    () => buildElements(currentContent, splitBy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, splitBy],
  );

  const totalUnits = useMemo(
    () => elements.reduce((s, w) => s + w.chars.length, 0),
    [elements],
  );

  // ── Stagger ──────────────────────────────────────────────────────────────────
  const getDelay = useCallback(
    (i: number) => {
      if (staggerDuration === 0) return 0;
      if (staggerFrom === "first")  return i * staggerDuration;
      if (staggerFrom === "last")   return (totalUnits - 1 - i) * staggerDuration;
      if (staggerFrom === "center") return Math.abs(Math.floor(totalUnits / 2) - i) * staggerDuration;
      if (staggerFrom === "random") return Math.floor(Math.random() * totalUnits) * staggerDuration;
      return Math.abs((staggerFrom as number) - i) * staggerDuration;
    },
    [staggerFrom, staggerDuration, totalUnits],
  );

  // ── Navigation ───────────────────────────────────────────────────────────────
  const change = useCallback(
    (i: number) => { setIndex(i); onNext?.(i); },
    [onNext],
  );

  const next = useCallback(() => {
    const ni = index === items.length - 1 ? (loop ? 0 : index) : index + 1;
    if (ni !== index) change(ni);
  }, [index, items.length, loop, change]);

  const previous = useCallback(() => {
    const pi = index === 0 ? (loop ? items.length - 1 : index) : index - 1;
    if (pi !== index) change(pi);
  }, [index, items.length, loop, change]);

  const jumpTo = useCallback(
    (i: number) => {
      const vi = Math.max(0, Math.min(i, items.length - 1));
      if (vi !== index) change(vi);
    },
    [items.length, index, change],
  );

  const reset = useCallback(() => {
    if (index !== 0) change(0);
  }, [index, change]);

  useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

  useEffect(() => {
    if (!auto || paused) return;
    const id = setInterval(next, duration);
    return () => clearInterval(id);
  }, [next, duration, auto, paused]);

  // ── Render ───────────────────────────────────────────────────────────────────
  const Tag      = inline ? "span" : "div";
  const alignCls =
    align === "center" ? "justify-center" :
    align === "right"  ? "justify-end"    : "justify-start";

  return (
    <Tag
      className={twMerge(
        inline ? "inline-flex align-bottom" : "flex",
        "overflow-hidden",
        alignCls,
        className,
      )}
      style={{ height: "1lh" }}
      onMouseEnter={pauseOnHover ? () => setPaused(true)  : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    >
      {/* Screen-reader text */}
      <span className="sr-only">
        {typeof currentContent === "string" ? currentContent : ""}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          aria-hidden
          className={twMerge(
            "flex flex-wrap items-baseline",
            inline ? "inline-flex" : "flex",
            currentClass,
            itemClassName,
          )}
        >
          {elements.map((wordObj, wi, arr) => {
            const prevCount = arr.slice(0, wi).reduce((s, w) => s + w.chars.length, 0);
            return (
              <span key={wi} className="inline-flex">
                {wordObj.chars.map((char, ci) => (
                  <motion.span
                    key={ci}
                    className="inline-block"
                    initial={motionInitial}
                    animate={motionAnimate}
                    exit={motionExit}
                    transition={{
                      ...motionTransition,
                      delay: getDelay(prevCount + ci),
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.space && (
                  <span className="inline-block">&nbsp;</span>
                )}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </Tag>
  );
});

TextRotate.displayName = "TextRotate";
export default TextRotate;

