"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

// ─── 1. HoverGallery (daisyUI v5 hover-gallery for product cards) ────────────

export type HoverGalleryImage = {
  src: string;
  alt?: string;
  label?: string;
};

export type HoverGalleryProps = {
  /** Array of image URLs or { src, alt, label } objects */
  images: (string | HoverGalleryImage)[];
  /** Default image index when cursor is not hovering (default: 0) */
  defaultIndex?: number;
  /** Reset back to defaultIndex on mouse leave (default: true) */
  resetOnLeave?: boolean;
  /** Show top indicator bars like daisyUI hover-gallery (default: true) */
  showIndicators?: boolean;
  /** Aspect ratio or height class (default: "aspect-square") */
  aspectClassName?: string;
  /** Rounded corners class (default: "rounded-xl") */
  roundedClassName?: string;
  onClick?: (activeIndex: number) => void;
  /** Access-control identifier */
  componentId?: string;
  hideIfDenied?: boolean;
  className?: string;
};

export default function HoverGallery({
  images,
  defaultIndex = 0,
  resetOnLeave = true,
  showIndicators = true,
  aspectClassName = "aspect-square",
  roundedClassName = "rounded-xl",
  onClick,
  componentId,
  hideIfDenied = true,
  className,
}: HoverGalleryProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const normalized: HoverGalleryImage[] = images.map((img, i) =>
    typeof img === "string" ? { src: img, alt: `Imagem ${i + 1}` } : img
  );

  if (normalized.length === 0) return null;

  const currentIndex = Math.max(0, Math.min(normalized.length - 1, activeIndex));
  const currentImg = normalized[currentIndex];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (normalized.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const relX = Math.max(0, Math.min(0.9999, (e.clientX - rect.left) / rect.width));
    const idx = Math.floor(relX * normalized.length);
    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        if (resetOnLeave) setActiveIndex(defaultIndex);
      }}
      onClick={() => onClick?.(currentIndex)}
      className={cn(
        "group relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 select-none",
        aspectClassName,
        roundedClassName,
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Top Indicator Bars */}
      {showIndicators && normalized.length > 1 && (
        <div className="pointer-events-none absolute top-2.5 inset-x-2.5 z-20 flex gap-1.5 opacity-80 transition-opacity duration-200 group-hover:opacity-100">
          {normalized.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-200 ease-out",
                idx === currentIndex
                  ? "bg-white shadow-xs scale-y-125"
                  : "bg-white/35 backdrop-blur-xs"
              )}
            />
          ))}
        </div>
      )}

      {/* Images Stack */}
      {normalized.map((item, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.src + idx}
            src={item.src}
            alt={item.alt ?? `Imagem ${idx + 1}`}
            draggable={false}
            className={cn(
              "absolute inset-0 h-full w-full object-cover will-change-[opacity,transform] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isCurrent
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-[1.03] z-0 pointer-events-none"
            )}
          />
        );
      })}

      {/* Optional caption for current image */}
      {currentImg?.label && (
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 z-20 flex justify-center opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0">
          <span className="rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs shadow-sm">
            {currentImg.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── 2. Hover3DCard (daisyUI v5 hover-3d interactive tilt card) ──────────────

export type Hover3DCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Maximum tilt angle in degrees (default: 10) */
  maxTilt?: number;
  /** Subtle scale on hover (default: 1.02) */
  scale?: number;
  /** Render a dynamic light glare following the cursor (default: true) */
  glare?: boolean;
  disabled?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
};

export function Hover3DCard({
  maxTilt = 10,
  scale = 1.02,
  glare = true,
  disabled = false,
  componentId,
  hideIfDenied = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  style,
  ...props
}: Hover3DCardProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (effectiveDisabled || !cardRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const pctX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const pctY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      const rotateY = (pctX - 0.5) * 2 * maxTilt;
      const rotateX = (0.5 - pctY) * 2 * maxTilt;

      el.style.transition = "transform 70ms linear";
      el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`;

      const glareEl = glareRef.current;
      if (glareEl) {
        glareEl.style.opacity = "1";
        glareEl.style.background = `radial-gradient(circle at ${(pctX * 100).toFixed(1)}% ${(pctY * 100).toFixed(1)}%, rgba(255,255,255,0.22), transparent 60%)`;
      }
    });
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const el = cardRef.current;
    if (el) {
      el.style.transition = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    const glareEl = glareRef.current;
    if (glareEl) {
      glareEl.style.opacity = "0";
    }
  };

  return (
    <div
      ref={cardRef}
      {...(componentId ? { "data-component-id": componentId } : {})}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl will-change-transform",
        className
      )}
      {...props}
    >
      {children}
      {glare && !effectiveDisabled && (
        <div
          ref={glareRef}
          aria-hidden="true"
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 ease-out"
        />
      )}
    </div>
  );
}
