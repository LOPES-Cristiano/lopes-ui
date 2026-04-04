"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { User } from "lucide-react";

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
  status?: AvatarStatus;
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
  max?: number;
  className?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE_CLS: Record<AvatarSize, { root: string; text: string; icon: number; ring: string; statusDot: string; statusPos: string }> = {
  "xs":  { root: "h-6 w-6",   text: "text-[9px]",   icon: 12, ring: "ring-1",   statusDot: "h-1.5 w-1.5", statusPos: "-bottom-0 -right-0"   },
  "sm":  { root: "h-8 w-8",   text: "text-[10px]",  icon: 14, ring: "ring-1",   statusDot: "h-2 w-2",     statusPos: "-bottom-0 -right-0"   },
  "md":  { root: "h-10 w-10", text: "text-xs",      icon: 16, ring: "ring-2",   statusDot: "h-2.5 w-2.5", statusPos: "bottom-0 right-0"     },
  "lg":  { root: "h-12 w-12", text: "text-sm",      icon: 18, ring: "ring-2",   statusDot: "h-3 w-3",     statusPos: "bottom-0 right-0"     },
  "xl":  { root: "h-16 w-16", text: "text-base",    icon: 22, ring: "ring-2",   statusDot: "h-3.5 w-3.5", statusPos: "bottom-0.5 right-0.5" },
  "2xl": { root: "h-20 w-20", text: "text-lg",      icon: 28, ring: "ring-[3px]", statusDot: "h-4 w-4",   statusPos: "bottom-1 right-1"     },
};

const SHAPE_CLS: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-xl",
};

const STATUS_DOT: Record<AvatarStatus, string> = {
  online:  "bg-emerald-500",
  away:    "bg-amber-400",
  busy:    "bg-red-500",
  offline: "bg-zinc-400",
};

// Consistent color from name/initials string
const PALETTE = [
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
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
  status,
  colorClass,
  className,
  componentId,
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const s = SIZE_CLS[size];
  const shapeCls = SHAPE_CLS[shape];

  const displayInitials = initials ?? (name ? toInitials(name) : null);
  const seed = initials ?? name ?? "?";
  const auto = colorClass ?? colorFromString(seed);

  const showImg = src && !imgError;

  return (
    <div
      className={twMerge("relative inline-flex shrink-0", className)}
      onClick={onClick}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      <div
        className={twMerge(
          "flex items-center justify-center overflow-hidden font-semibold select-none",
          s.root, shapeCls,
          showImg ? "bg-zinc-100" : auto,
          onClick && "cursor-pointer",
        )}
      >
        {showImg ? (
          <img
            src={src}
            alt={alt ?? name ?? "avatar"}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : displayInitials ? (
          <span className={s.text}>{displayInitials}</span>
        ) : (
          <User size={s.icon} strokeWidth={1.75} className="opacity-60" />
        )}
      </div>

      {status && (
        <span
          className={twMerge(
            "absolute rounded-full",
            s.statusDot, s.statusPos,
            STATUS_DOT[status],
            "ring-2 ring-white",
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}

// ── AvatarGroup ───────────────────────────────────────────────────────────────

export function AvatarGroup({ avatars, size = "md", max = 4, className }: AvatarGroupProps) {
  const s = SIZE_CLS[size];
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={twMerge("flex items-center", className)}>
      {visible.map((av, i) => (
        <div
          key={i}
          className={twMerge("-ml-2 first:ml-0", s.ring, "ring-white rounded-full")}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar {...av} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={twMerge(
            "-ml-2 flex items-center justify-center rounded-full font-semibold bg-zinc-100 text-zinc-600",
            s.root, s.ring, "ring-white", s.text,
          )}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
