"use client";

import React, {
  useState, useEffect, useCallback, useRef, Children,
} from "react";
import { twMerge } from "tailwind-merge";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselAlign      = "start" | "center" | "end";

export type CarouselProps = {
  children: React.ReactNode;
  /** Orientation of the carousel ("horizontal" | "vertical") */
  orientation?: CarouselOrientation;
  /** Height of the viewport when orientation="vertical" (default: 320px) */
  verticalHeight?: number | string;
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
  /** Show linear progress bar */
  showProgress?: boolean;
  /** Optional thumbnail nodes rendered below the carousel */
  thumbnails?: React.ReactNode[];
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
      data-component-id="erp.carousel.dot"
      type="button"
      onClick={onClick}
      aria-label={active ? "Slide atual" : "Ir para slide"}
      className={twMerge(
        "rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer",
        active
          ? "w-5 h-2 bg-indigo-500"
          : "w-2 h-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400",
      )}
    />
  );
}

// ── Arrow button ──────────────────────────────────────────────────────────────

function Arrow({
  dir,
  orientation = "horizontal",
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  orientation?: CarouselOrientation;
  onClick: () => void;
  disabled: boolean;
}) {
  const isVert = orientation === "vertical";
  return (
    <button
      data-component-id="erp.carousel.nav"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Slide anterior" : "Próximo slide"}
      className={twMerge(
        "absolute z-10 flex h-9 w-9 items-center justify-center rounded-full cursor-pointer",
        "bg-white/90 dark:bg-zinc-800/90 shadow-md border border-zinc-200 dark:border-zinc-700",
        "text-zinc-600 dark:text-zinc-300 transition-all duration-150",
        "hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-lg",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        isVert
          ? dir === "prev"
            ? "top-2 left-1/2 -translate-x-1/2"
            : "bottom-2 left-1/2 -translate-x-1/2"
          : dir === "prev"
            ? "top-1/2 -translate-y-1/2 left-2"
            : "top-1/2 -translate-y-1/2 right-2",
      )}
    >
      {isVert ? (
        dir === "prev" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      ) : (
        dir === "prev" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
      )}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Carousel({
  children,
  orientation = "horizontal",
  verticalHeight = 320,
  slidesPerView = 1,
  gap = 16,
  autoPlay = 0,
  loop = false,
  arrows = true,
  dots = true,
  counter = false,
  showProgress = false,
  thumbnails,
  pauseOnHover = true,
  ariaLabel = "Carrossel",
  className,
  slideClassName,
  componentId,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const total  = slides.length;
  const maxIdx = Math.max(0, total - slidesPerView);
  const isVert = orientation === "vertical";

  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number>(0);
  const trackRef  = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (idx: number) => {
      if (total <= 0) return;
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
    if (!autoPlay || paused || total <= 1) return;
    const id = setInterval(next, autoPlay);
    return () => clearInterval(id);
  }, [autoPlay, paused, next, total]);

  // Scoped keyboard navigation on the carousel root (shadcn/ui Carousel pattern — avoids hijacking global inputs)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isVert) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          prev();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          next();
        }
      } else {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          next();
        }
      }
    },
    [isVert, prev, next],
  );

  // Touch / mouse drag
  function onDragStart(coord: number) {
    dragStart.current = coord;
    setDragging(true);
  }
  function onDragEnd(coord: number) {
    if (!dragging) return;
    const delta = dragStart.current - coord;
    if (Math.abs(delta) > 40) {
      if (delta > 0) next();
      else prev();
    }
    setDragging(false);
  }

  const slideSize = `calc((100% - ${gap * (slidesPerView - 1)}px) / ${slidesPerView})`;
  const offset    = `calc(-${current} * (${slideSize} + ${gap}px))`;
  const canPrev   = loop || current > 0;
  const canNext   = loop || current < maxIdx;

  // Dots: show one dot per logical "page" when slidesPerView > 1
  const pages = Math.max(1, Math.ceil(total / slidesPerView));
  const activePage = Math.floor(current / slidesPerView);
  const progressPct = total > 1 ? ((current + 1) / total) * 100 : 100;

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      role="region"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={twMerge(
        "relative w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-xl",
        className,
      )}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      {/* Track container */}
      <div
        className="overflow-hidden"
        style={
          isVert
            ? { height: typeof verticalHeight === "number" ? `${verticalHeight}px` : verticalHeight }
            : undefined
        }
        onMouseDown={(e) => onDragStart(isVert ? e.clientY : e.clientX)}
        onMouseUp={(e)   => onDragEnd(isVert ? e.clientY : e.clientX)}
        onTouchStart={(e) => onDragStart(isVert ? e.touches[0].clientY : e.touches[0].clientX)}
        onTouchEnd={(e)   => onDragEnd(isVert ? e.changedTouches[0].clientY : e.changedTouches[0].clientX)}
      >
        <div
          ref={trackRef}
          className={twMerge(
            "flex transition-transform duration-500 ease-in-out",
            isVert ? "flex-col h-full" : "flex-row",
          )}
          style={{
            gap: `${gap}px`,
            transform: isVert ? `translateY(${offset})` : `translateX(${offset})`,
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
              style={
                isVert
                  ? { minHeight: slideSize, maxHeight: slideSize }
                  : { minWidth: slideSize, maxWidth: slideSize }
              }
              className={twMerge("shrink-0", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {arrows && total > slidesPerView && (
        <>
          <Arrow dir="prev" orientation={orientation} onClick={prev} disabled={!canPrev} />
          <Arrow dir="next" orientation={orientation} onClick={next} disabled={!canNext} />
        </>
      )}

      {/* Progress bar */}
      {showProgress && total > 1 && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Thumbnails strip */}
      {thumbnails && thumbnails.length > 0 && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {thumbnails.map((thumb, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              className={twMerge(
                "shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                i === current
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90",
              )}
            >
              {thumb}
            </button>
          ))}
        </div>
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
