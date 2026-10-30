"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SkeletonAnimation = "pulse" | "wave" | "none";

export type SkeletonAvatarProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  shape?: "circle" | "square";
  active?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
};

export type SkeletonButtonProps = {
  size?: "sm" | "md" | "lg";
  shape?: "default" | "round" | "circle" | "square";
  block?: boolean;
  active?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
};

export type SkeletonInputProps = {
  size?: "sm" | "md" | "lg";
  block?: boolean;
  active?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
};

export type SkeletonImageProps = {
  width?: number | string;
  height?: number | string;
  active?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
};

export type SkeletonCardProps = {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  hasFooter?: boolean;
  active?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
};

export type SkeletonTableProps = {
  rows?: number;
  columns?: number;
  active?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
};

export type SkeletonParagraphConfig = {
  rows?: number;
  /** Optional custom width per row (e.g. `["100%", "92%", "60%"]` or single width for the last row) */
  width?: string | number | readonly (string | number)[];
};

export type SkeletonProps = {
  /** When false, renders `children` directly instead of the skeleton wireframe (Ant Design pattern) */
  loading?: boolean;
  /** Enables animation (default: true) */
  active?: boolean;
  animation?: SkeletonAnimation;
  /** Show an avatar placeholder on the left */
  avatar?: boolean | Omit<SkeletonAvatarProps, "active" | "animation">;
  /** Show a heading line above the paragraph (default: true) */
  title?: boolean | { width?: string | number };
  /** Show paragraph lines (default: 3 rows) */
  paragraph?: boolean | SkeletonParagraphConfig;
  /** Use pill-rounded bars */
  round?: boolean;
  children?: React.ReactNode;
  className?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function animCls(active = true, animation: SkeletonAnimation = "pulse"): string {
  if (!active || animation === "none") return "";
  if (animation === "wave") {
    return "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 dark:before:via-white/10 before:to-transparent animate-pulse";
  }
  return "animate-pulse";
}

const BASE_SURFACE = "bg-zinc-200/85 dark:bg-zinc-800";

// ── Primitives ────────────────────────────────────────────────────────────────

export function SkeletonAvatar({
  size = "md",
  shape = "circle",
  active = true,
  animation = "pulse",
  className,
}: SkeletonAvatarProps) {
  const sizePx =
    typeof size === "number"
      ? size
      : { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }[size];

  return (
    <span
      aria-hidden="true"
      style={{ width: sizePx, height: sizePx }}
      className={twMerge(
        "inline-block shrink-0",
        BASE_SURFACE,
        shape === "circle" ? "rounded-full" : "rounded-xl",
        animCls(active, animation),
        className
      )}
    />
  );
}

export function SkeletonButton({
  size = "md",
  shape = "default",
  block = false,
  active = true,
  animation = "pulse",
  className,
}: SkeletonButtonProps) {
  const dimCls =
    shape === "circle" || shape === "square"
      ? size === "sm"
        ? "h-8 w-8"
        : size === "lg"
          ? "h-12 w-12"
          : "h-10 w-10"
      : size === "sm"
        ? "h-8 w-20"
        : size === "lg"
          ? "h-12 w-32"
          : "h-10 w-24";

  const radiusCls =
    shape === "circle" || shape === "round" ? "rounded-full" : "rounded-xl";

  return (
    <span
      aria-hidden="true"
      className={twMerge(
        "inline-block",
        BASE_SURFACE,
        dimCls,
        radiusCls,
        block && "w-full block",
        animCls(active, animation),
        className
      )}
    />
  );
}

export function SkeletonInput({
  size = "md",
  block = true,
  active = true,
  animation = "pulse",
  className,
}: SkeletonInputProps) {
  const hCls = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10";
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        "inline-block rounded-xl",
        BASE_SURFACE,
        hCls,
        block ? "w-full block" : "w-48",
        animCls(active, animation),
        className
      )}
    />
  );
}

export function SkeletonImage({
  width = "100%",
  height = 160,
  active = true,
  animation = "pulse",
  className,
}: SkeletonImageProps) {
  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={twMerge(
        "flex items-center justify-center rounded-xl text-zinc-400 dark:text-zinc-600",
        BASE_SURFACE,
        animCls(active, animation),
        className
      )}
    >
      <ImageIcon size={28} strokeWidth={1.5} />
    </div>
  );
}

export function SkeletonCard({
  hasImage = false,
  hasAvatar = true,
  lines = 3,
  hasFooter = false,
  active = true,
  animation = "pulse",
  className,
}: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={twMerge(
        "rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4",
        className
      )}
    >
      {hasImage && <SkeletonImage height={148} active={active} animation={animation} />}
      <SkeletonBase
        active={active}
        animation={animation}
        avatar={hasAvatar}
        paragraph={{ rows: lines }}
      />
      {hasFooter && (
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <SkeletonButton size="sm" active={active} animation={animation} />
          <SkeletonButton size="sm" active={active} animation={animation} />
        </div>
      )}
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  active = true,
  animation = "pulse",
  className,
}: SkeletonTableProps) {
  return (
    <div
      aria-hidden="true"
      className={twMerge(
        "w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
        className
      )}
    >
      <div
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        className="grid gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 px-4 py-3"
      >
        {Array.from({ length: columns }).map((_, idx) => (
          <span
            key={`th-${idx}`}
            className={twMerge("h-3.5 w-2/3 rounded-md", BASE_SURFACE, animCls(active, animation))}
          />
        ))}
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={`tr-${rIdx}`}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            className="grid gap-4 px-4 py-3.5"
          >
            {Array.from({ length: columns }).map((__, cIdx) => (
              <span
                key={`td-${rIdx}-${cIdx}`}
                style={{ width: cIdx === 0 ? "75%" : cIdx === columns - 1 ? "55%" : "88%" }}
                className={twMerge("h-3.5 rounded-md", BASE_SURFACE, animCls(active, animation))}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Compound Skeleton ────────────────────────────────────────────────────

function SkeletonBase({
  loading = true,
  active = true,
  animation = "pulse",
  avatar = false,
  title = true,
  paragraph = true,
  round = false,
  children,
  className,
}: SkeletonProps) {
  if (!loading) {
    return <>{children}</>;
  }

  const avatarConfig =
    avatar === true ? {} : avatar === false ? null : avatar;

  const titleWidth =
    typeof title === "object" && title.width !== undefined
      ? title.width
      : avatarConfig
        ? "45%"
        : "38%";

  const paragraphConfig: SkeletonParagraphConfig | null =
    paragraph === false
      ? null
      : paragraph === true
        ? { rows: 3 }
        : paragraph;

  const rowsCount = paragraphConfig?.rows ?? 3;
  const barRadius = round ? "rounded-full" : "rounded-md";

  const resolveRowWidth = (idx: number): string | number => {
    const w = paragraphConfig?.width;
    if (typeof w === "string" || typeof w === "number") {
      return idx === rowsCount - 1 ? w : "100%";
    }
    if (w !== undefined) {
      return w[idx] ?? "100%";
    }
    return idx === rowsCount - 1 && rowsCount > 1 ? "62%" : "100%";
  };

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando conteúdo..."
      className={twMerge("flex w-full items-start gap-3.5", className)}
    >
      {avatarConfig && (
        <SkeletonAvatar
          {...avatarConfig}
          active={active}
          animation={animation}
        />
      )}

      <div className="min-w-0 flex-1 space-y-2.5 py-0.5">
        {title !== false && (
          <div
            style={{ width: titleWidth }}
            className={twMerge("h-4", barRadius, BASE_SURFACE, animCls(active, animation))}
          />
        )}

        {paragraphConfig && rowsCount > 0 && (
          <div className="space-y-2 pt-0.5">
            {Array.from({ length: rowsCount }).map((_, idx) => (
              <div
                key={idx}
                style={{ width: resolveRowWidth(idx) }}
                className={twMerge("h-3", barRadius, BASE_SURFACE, animCls(active, animation))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type SkeletonCompound = typeof SkeletonBase & {
  Avatar: typeof SkeletonAvatar;
  Button: typeof SkeletonButton;
  Input: typeof SkeletonInput;
  Image: typeof SkeletonImage;
  Card: typeof SkeletonCard;
  Table: typeof SkeletonTable;
};

const Skeleton = Object.assign(SkeletonBase, {
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
  Input: SkeletonInput,
  Image: SkeletonImage,
  Card: SkeletonCard,
  Table: SkeletonTable,
}) as SkeletonCompound;

export default Skeleton;
