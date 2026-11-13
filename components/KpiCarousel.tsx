"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";
import StatCard, { type StatCardProps } from "./StatCard";
import AnimatedNumber, { type AnimatedNumberFormat } from "./AnimatedNumber";

export type KpiCarouselItem = Omit<StatCardProps, "value"> & {
  id: string;
  /** Static or custom React node value (used when `numericValue` is omitted) */
  value?: React.ReactNode;
  /** Optional numeric value interpolated smoothly via `AnimatedNumber` */
  numericValue?: number;
  /** Format for `numericValue` (default: "decimal") */
  numberFormat?: AnimatedNumberFormat;
  /** Custom decimal places when `numericValue` is provided */
  decimals?: number;
  /** Scale when `numberFormat="percent"` ("100" treats 82.4 as 82,4%; "1" treats 0.824 as 82,4%) */
  percentScale?: "100" | "1";
  /** Prefix prepended to formatted `numericValue` */
  prefix?: string;
  /** Suffix appended to formatted `numericValue` */
  suffix?: string;
  /** Animate from 0 on initial mount (default: false) */
  animateOnMount?: boolean;
};

export type KpiCarouselProps = {
  /** Declarative list of KPI cards */
  items?: KpiCarouselItem[];
  /** Custom KPI card slides (alternative to `items`) */
  children?: React.ReactNode;
  /** Number of columns on desktop (`>= md`) */
  desktopColumns?: 2 | 3 | 4 | 5 | 6;
  /** Mobile card width preset ("peek" shows ~82% so next KPI peeks in; "compact" shows ~68%; "half" shows 2 per view) */
  mobileCardWidth?: "peek" | "compact" | "half";
  /** Show interactive pagination indicator dots below on mobile (default: true) */
  showDots?: boolean;
  ariaLabel?: string;
  className?: string;
  gridClassName?: string;
  slideClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const DESKTOP_GRID_CLS: Record<NonNullable<KpiCarouselProps["desktopColumns"]>, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 xl:grid-cols-5",
  6: "md:grid-cols-3 xl:grid-cols-6",
};

const MOBILE_WIDTH_CLS: Record<NonNullable<KpiCarouselProps["mobileCardWidth"]>, string> = {
  peek: "w-[82%] max-w-[310px] sm:w-[47%] sm:max-w-none",
  compact: "w-[70%] max-w-[265px] sm:w-[45%] sm:max-w-none",
  half: "w-[47.5%] min-w-[154px] sm:w-[47%]",
};

export function KpiCarousel({
  items,
  children,
  desktopColumns,
  mobileCardWidth = "peek",
  showDots = true,
  ariaLabel = "Indicadores principais",
  className,
  gridClassName,
  slideClassName,
  componentId,
  hideIfDenied = false,
}: KpiCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const carouselId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleItems = items
    ? items.filter((item) => {
        const allowed = !item.componentId || canAccess(item.componentId);
        if (!allowed && item.hideIfDenied) return false;
        return true;
      })
    : undefined;

  const customSlides = !visibleItems
    ? React.Children.toArray(children).filter(Boolean)
    : undefined;

  const slideCount = visibleItems ? visibleItems.length : (customSlides?.length ?? 0);

  const resolvedDesktopCols: NonNullable<KpiCarouselProps["desktopColumns"]> =
    desktopColumns ??
    (slideCount <= 2
      ? 2
      : slideCount === 3
        ? 3
        : slideCount === 5
          ? 5
          : slideCount >= 6
            ? 6
            : 4);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slideCount <= 1) return;
    let rafId = 0;

    const updateActiveSlideOnScroll = () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

      let closestIdx = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < slideCount; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const slideCenter = rect.left + rect.width / 2;
        const dist = Math.abs(slideCenter - scrollerCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }

      setActiveIndex((prev) => (prev === closestIdx ? prev : closestIdx));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSlideOnScroll);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [slideCount]);

  const scrollToSlide = (idx: number) => {
    const target = slideRefs.current[idx];
    if (!target) return;
    setActiveIndex(idx);
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  if (!hasPermission && hideIfDenied) return null;
  if (slideCount === 0) return null;

  const isSingle = slideCount === 1;
  const clampedActive = Math.min(activeIndex, Math.max(0, slideCount - 1));

  return (
    <section
      aria-label={ariaLabel}
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn(
        "w-full min-w-0",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-full overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2.5 -mx-1 px-1 py-0.5 scroll-px-1",
          "md:mx-0 md:grid md:gap-3.5 md:overflow-visible md:px-0 md:py-0",
          DESKTOP_GRID_CLS[resolvedDesktopCols],
          gridClassName,
        )}
      >
        {visibleItems
          ? visibleItems.map((item, idx) => {
              const {
                id,
                value,
                numericValue,
                numberFormat = "decimal",
                decimals,
                percentScale,
                prefix,
                suffix,
                animateOnMount = false,
                className: cardCls,
                ...statProps
              } = item;

              const renderedValue =
                typeof numericValue === "number" ? (
                  <AnimatedNumber
                    value={numericValue}
                    format={numberFormat}
                    decimals={decimals}
                    percentScale={percentScale}
                    prefix={prefix}
                    suffix={suffix}
                    animateOnMount={animateOnMount}
                  />
                ) : (
                  (value ?? "—")
                );

              return (
                <div
                  key={id}
                  ref={(el) => {
                    slideRefs.current[idx] = el;
                  }}
                  className={cn(
                    "shrink-0 snap-center md:w-auto md:max-w-none md:min-w-0 md:shrink",
                    isSingle ? "w-full" : MOBILE_WIDTH_CLS[mobileCardWidth],
                    slideClassName,
                  )}
                >
                  <StatCard
                    {...statProps}
                    value={renderedValue}
                    className={cn("h-full", cardCls)}
                  />
                </div>
              );
            })
          : customSlides?.map((slide, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className={cn(
                  "shrink-0 snap-center md:w-auto md:max-w-none md:min-w-0 md:shrink",
                  isSingle ? "w-full" : MOBILE_WIDTH_CLS[mobileCardWidth],
                  slideClassName,
                )}
              >
                {slide}
              </div>
            ))}
      </div>

      {showDots && slideCount > 1 && (
        <div
          role="tablist"
          aria-label="Navegação dos indicadores"
          className="mt-2 flex items-center justify-center gap-1.5 md:hidden"
        >
          {Array.from({ length: slideCount }).map((_, idx) => {
            const isSelected = idx === clampedActive;
            return (
              <button
                key={`${carouselId}-dot-${idx}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`Ir para indicador ${idx + 1} de ${slideCount}`}
                onClick={() => scrollToSlide(idx)}
                className="group relative inline-flex h-5 items-center justify-center px-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-full"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-border-strong/70 transition-colors group-hover:bg-muted-foreground" />
                {isSelected && (
                  <motion.span
                    layoutId={`${carouselId}-active-dot`}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 440, damping: 32 }
                    }
                    className="absolute inset-x-0.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default KpiCarousel;
