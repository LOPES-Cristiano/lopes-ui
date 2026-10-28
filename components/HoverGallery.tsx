"use client";

import React, { useRef, useState } from "react";
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (normalized.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.min(
      normalized.length - 1,
      Math.floor(relX * normalized.length)
    );
    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
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
        <div className="pointer-events-none absolute top-2 inset-x-2 z-20 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {normalized.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-150",
                idx === currentIndex
                  ? "bg-white shadow-xs"
                  : "bg-white/40 backdrop-blur-xs"
              )}
            />
          ))}
        </div>
      )}

      {/* Images Stack */}
      {normalized.map((item, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={item.src + idx}
          src={item.src}
          alt={item.alt ?? `Imagem ${idx + 1}`}
          draggable={false}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        />
      ))}

      {/* Optional caption for current image */}
      {currentImg?.label && (
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-20 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-md bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
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
  ...props
}: Hover3DCardProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
  );
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (effectiveDisabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = x / rect.width;
    const pctY = y / rect.height;

    const rotateY = (pctX - 0.5) * 2 * maxTilt;
    const rotateX = (0.5 - pctY) * 2 * maxTilt;

    setTransformStyle(
      `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`
    );
    setGlarePos({ x: pctX * 100, y: pctY * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTransformStyle(
      "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    );
    setGlarePos((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={cardRef}
      {...(componentId ? { "data-component-id": componentId } : {})}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-transform duration-200 ease-out will-change-transform",
        className
      )}
      {...props}
    >
      {children}
      {glare && !effectiveDisabled && (
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.22), transparent 60%)`,
            opacity: glarePos.active ? 1 : 0,
          }}
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-200"
        />
      )}
    </div>
  );
}
