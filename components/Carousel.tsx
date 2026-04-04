"use client";

import React, {
  useState, useEffect, useCallback, useRef, Children,
} from "react";
import { twMerge } from "tailwind-merge";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselAlign      = "start" | "center" | "end";

export type CarouselProps = {
  children: React.ReactNode;
  /** Number of slides visible at once */
  slidesPerView?: number;
  /** Gap between slides (Tailwind spacing value as px number) */
  gap?: number;
  /** Auto-advance interval in ms (0 = disabled) */
  autoPlay?: number;
  /** Loop back to first slide after last */
  loop?: boolean;
  /** Show prev/next arrow buttons */
  arrows?: boolean;
  /** Show dot indicators */
  dots?: boolean;
  /** Show slide counter "2 / 8" */
  counter?: boolean;
  /** Pause auto-play on hover */
  pauseOnHover?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
  slideClassName?: string;
  componentId?: string;
};

// ── Dot ──────────────────────────────────────────────────────────────────────

function Dot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? "Slide atual" : "Ir para slide"}
      className={twMerge(
        "rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        active
          ? "w-5 h-2 bg-indigo-500"
          : "w-2 h-2 bg-zinc-300 hover:bg-zinc-400",
      )}
    />
  );
}

// ── Arrow button ──────────────────────────────────────────────────────────────

function Arrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Slide anterior" : "Próximo slide"}
      className={twMerge(
        "absolute top-1/2 -translate-y-1/2 z-10",
        "flex h-9 w-9 items-center justify-center rounded-full",
        "bg-white/90 shadow-md border border-zinc-200",
        "text-zinc-600 transition-all duration-150",
        "hover:bg-white hover:text-zinc-900 hover:shadow-lg",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        dir === "prev" ? "left-2" : "right-2",
      )}
    >
      {dir === "prev" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Carousel({
  children,
  slidesPerView = 1,
  gap = 16,
  autoPlay = 0,
  loop = false,
  arrows = true,
  dots = true,
  counter = false,
  pauseOnHover = true,
  ariaLabel = "Carrossel",
  className,
  slideClassName,
  componentId,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const total  = slides.length;
  const maxIdx = Math.max(0, total - slidesPerView);

  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number>(0);
  const trackRef  = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (idx: number) => {
      if (loop) {
        setCurrent(((idx % total) + total) % total);
      } else {
        setCurrent(Math.max(0, Math.min(idx, maxIdx)));
      }
    },
    [loop, total, maxIdx],
  );

  const prev = useCallback(() => go(current - 1), [go, current]);
  const next = useCallback(() => go(current + 1), [go, current]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || paused) return;
    const id = setInterval(next, autoPlay);
    return () => clearInterval(id);
  }, [autoPlay, paused, next]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // Touch / mouse drag
  function onDragStart(clientX: number) {
    dragStart.current = clientX;
    setDragging(true);
  }
  function onDragEnd(clientX: number) {
    if (!dragging) return;
    const delta = dragStart.current - clientX;
    if (Math.abs(delta) > 40) { if (delta > 0) next(); else prev(); }
    setDragging(false);
  }

  const slideW  = `calc((100% - ${gap * (slidesPerView - 1)}px) / ${slidesPerView})`;
  const offset  = `calc(-${current} * (${slideW} + ${gap}px))`;
  const canPrev = loop || current > 0;
  const canNext = loop || current < maxIdx;

  // Dots: show one dot per logical "page" when slidesPerView > 1
  const pages = Math.ceil(total / slidesPerView);
  const activePage = Math.floor(current / slidesPerView);

  return (
    <div
      className={twMerge("relative w-full select-none", className)}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Track container */}
      <div
        className="overflow-hidden"
        onMouseDown={(e) => onDragStart(e.clientX)}
        onMouseUp={(e)   => onDragEnd(e.clientX)}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
        onTouchEnd={(e)   => onDragEnd(e.changedTouches[0].clientX)}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            gap: `${gap}px`,
            transform: `translateX(${offset})`,
            cursor: dragging ? "grabbing" : "grab",
          }}
          aria-live="polite"
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} de ${total}`}
              style={{ minWidth: slideW, maxWidth: slideW }}
              className={twMerge("shrink-0", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {arrows && (
        <>
          <Arrow dir="prev" onClick={prev} disabled={!canPrev} />
          <Arrow dir="next" onClick={next} disabled={!canNext} />
        </>
      )}

      {/* Dots + counter */}
      {(dots || counter) && total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {dots && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pages }, (_, i) => (
                <Dot
                  key={i}
                  active={i === activePage}
                  onClick={() => go(i * slidesPerView)}
                />
              ))}
            </div>
          )}
          {counter && (
            <span className="text-xs font-medium text-zinc-400 tabular-nums">
              {current + 1} / {total}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
