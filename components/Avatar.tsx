"use client";

import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { User } from "lucide-react";
import { getMaskStyle, type MaskShape } from "./Mask";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "square";
export type AvatarStatus = "online" | "away" | "busy" | "offline";

export type AvatarProps = {
  /** Image URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** 1-2 chars shown when no src */
  initials?: string;
  /** Used to auto-generate initials if neither src nor initials are supplied */
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Optional geometric clip mask (daisyUI mask: squircle, hexagon, diamond, etc.) */
  mask?: MaskShape;
  /** Render an outer highlight ring (daisyUI avatar ring) */
  ring?: boolean;
  /** Custom ring Tailwind classes (default: "ring-primary") */
  ringColor?: string;
  status?: AvatarStatus;
  /** Custom badge or icon rendered in the bottom-right corner */
  badge?: React.ReactNode;
  /** Delay in ms before rendering fallback initials when loading an image (shadcn/Radix pattern) */
  fallbackDelayMs?: number;
  /** Override the generated background color class */
  colorClass?: string;
  className?: string;
  /** Access-control identifier */
  componentId?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export type AvatarGroupProps = {
  avatars: AvatarProps[];
  size?: AvatarSize;
  shape?: AvatarShape;
  max?: number;
  className?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE_CLS: Record<
  AvatarSize,
  { root: string; squareRadius: string; text: string; icon: number; ring: string; statusDot: string; statusPos: string }
> = {
  "xs":  { root: "h-6 w-6",   squareRadius: "rounded-md",  text: "text-[9px]",  icon: 12, ring: "ring-1",     statusDot: "h-1.5 w-1.5", statusPos: "-bottom-0 -right-0"   },
  "sm":  { root: "h-8 w-8",   squareRadius: "rounded-lg",  text: "text-[10px]", icon: 14, ring: "ring-1",     statusDot: "h-2 w-2",     statusPos: "-bottom-0 -right-0"   },
  "md":  { root: "h-10 w-10", squareRadius: "rounded-xl",  text: "text-xs",     icon: 16, ring: "ring-2",     statusDot: "h-2.5 w-2.5", statusPos: "bottom-0 right-0"     },
  "lg":  { root: "h-12 w-12", squareRadius: "rounded-xl",  text: "text-sm",     icon: 18, ring: "ring-2",     statusDot: "h-3 w-3",     statusPos: "bottom-0 right-0"     },
  "xl":  { root: "h-16 w-16", squareRadius: "rounded-2xl", text: "text-base",   icon: 22, ring: "ring-2",     statusDot: "h-3.5 w-3.5", statusPos: "bottom-0.5 right-0.5" },
  "2xl": { root: "h-20 w-20", squareRadius: "rounded-2xl", text: "text-lg",     icon: 28, ring: "ring-[3px]", statusDot: "h-4 w-4",     statusPos: "bottom-1 right-1"     },
};

const STATUS_DOT: Record<AvatarStatus, string> = {
  online:  "bg-emerald-500",
  away:    "bg-amber-400",
  busy:    "bg-red-500",
  offline: "bg-zinc-400",
};

// Consistent color from name/initials string
const PALETTE = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300",
];

function colorFromString(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Avatar ────────────────────────────────────────────────────────────────────

export default function Avatar({
  src,
  alt,
  initials,
  name,
  size = "md",
  shape = "circle",
  mask,
  ring = false,
  ringColor = "ring-primary",
  status,
  badge,
  fallbackDelayMs = 0,
  colorClass,
  className,
  componentId,
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [canShowFallback, setCanShowFallback] = useState(fallbackDelayMs <= 0);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  useEffect(() => {
    if (fallbackDelayMs <= 0) {
      setCanShowFallback(true);
      return;
    }
    setCanShowFallback(false);
    const timer = setTimeout(() => setCanShowFallback(true), fallbackDelayMs);
    return () => clearTimeout(timer);
  }, [fallbackDelayMs, src]);

  const s = SIZE_CLS[size];
  const shapeCls = mask ? "" : shape === "square" ? s.squareRadius : "rounded-full";
  const maskStyle = mask ? getMaskStyle(mask) : undefined;

  const displayInitials = initials ?? (name ? toInitials(name) : null);
  const seed = initials ?? name ?? "?";
  const auto = colorClass ?? colorFromString(seed);

  const showImg = Boolean(src && !imgError);

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge("relative inline-flex shrink-0", className)}
      onClick={onClick}
    >
      <div
        style={maskStyle}
        className={twMerge(
          "flex items-center justify-center overflow-hidden font-semibold select-none",
          s.root,
          shapeCls,
          ring && twMerge(s.ring, ringColor, "ring-offset-2 ring-offset-white dark:ring-offset-zinc-950"),
          showImg ? "bg-zinc-100 dark:bg-zinc-800" : auto,
          onClick && "cursor-pointer",
        )}
      >
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? name ?? "avatar"}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : !canShowFallback ? null : displayInitials ? (
          <span className={s.text}>{displayInitials}</span>
        ) : (
          <User size={s.icon} strokeWidth={1.75} className="opacity-60" />
        )}
      </div>

      {badge ? (
        <span
          className={twMerge(
            "absolute flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-950",
            s.statusPos,
          )}
        >
          {badge}
        </span>
      ) : status ? (
        <span
          className={twMerge(
            "absolute rounded-full",
            s.statusDot,
            s.statusPos,
            STATUS_DOT[status],
            "ring-2 ring-white dark:ring-zinc-950",
          )}
          aria-label={status}
        />
      ) : null}
    </div>
  );
}

// ── AvatarGroup ───────────────────────────────────────────────────────────────

export function AvatarGroup({ avatars, size = "md", shape = "circle", max = 4, className }: AvatarGroupProps) {
  const s = SIZE_CLS[size];
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const shapeCls = shape === "square" ? s.squareRadius : "rounded-full";

  return (
    <div className={twMerge("flex items-center", className)}>
      {visible.map((av, i) => (
        <div
          key={i}
          className={twMerge("-ml-2 first:ml-0", s.ring, "ring-white dark:ring-zinc-950", shapeCls)}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar {...av} size={size} shape={av.shape ?? shape} />
        </div>
      ))}
      {overflow > 0 && (
        <AvatarGroupCount count={overflow} size={size} shape={shape} />
      )}
    </div>
  );
}

export function AvatarGroupCount({
  count,
  size = "md",
  shape = "circle",
  className,
}: {
  count: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}) {
  const s = SIZE_CLS[size];
  const shapeCls = shape === "square" ? s.squareRadius : "rounded-full";
  return (
    <div
      className={twMerge(
        "-ml-2 flex items-center justify-center font-bold bg-zinc-800 text-zinc-100 ring-2 ring-white dark:ring-zinc-950 select-none shadow-xs",
        s.root,
        s.text,
        shapeCls,
        className
      )}
      style={{ zIndex: 0 }}
    >
      +{count}
    </div>
  );
}
