"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type LoadingVariant =
  | "spinner"
  | "dots"
  | "ring"
  | "ball"
  | "bars"
  | "infinity";

export type LoadingSize = "xs" | "sm" | "md" | "lg" | "xl";
export type LoadingTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type LoadingProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: LoadingVariant;
  size?: LoadingSize;
  tone?: LoadingTone;
  /** Optional text label rendered beside or below the loader */
  label?: React.ReactNode;
  labelPosition?: "right" | "bottom";
  /** Renders a full-screen translucent backdrop with centered loader */
  fullScreenOverlay?: boolean;
};

const SIZE_PX: Record<LoadingSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 34,
  xl: 46,
};

const TONE_CLS: Record<LoadingTone, string> = {
  default: "text-zinc-600 dark:text-zinc-300",
  primary: "text-indigo-600 dark:text-indigo-400",
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-rose-500",
  info: "text-sky-500",
};

export default function Loading({
  variant = "spinner",
  size = "md",
  tone = "primary",
  label,
  labelPosition = "right",
  fullScreenOverlay = false,
  className,
  ...props
}: LoadingProps) {
  const px = SIZE_PX[size];
  const colorCls = TONE_CLS[tone];

  const renderGraphic = () => {
    switch (variant) {
      case "dots": {
        const dotSize = Math.max(4, Math.round(px * 0.28));
        return (
          <span
            className={cn("inline-flex items-center gap-1", colorCls)}
            style={{ height: px }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: dotSize,
                  height: dotSize,
                  animationDelay: `${i * 150}ms`,
                }}
                className="rounded-full bg-current animate-bounce"
              />
            ))}
          </span>
        );
      }

      case "bars": {
        const barW = Math.max(2, Math.round(px * 0.16));
        return (
          <span
            className={cn("inline-flex items-center gap-0.5", colorCls)}
            style={{ height: px }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  width: barW,
                  height: "100%",
                  animationDelay: `${i * 120}ms`,
                }}
                className="rounded-full bg-current animate-pulse"
              />
            ))}
          </span>
        );
      }

      case "ball": {
        const ballSize = Math.max(8, Math.round(px * 0.55));
        return (
          <span
            className={cn("inline-flex items-center justify-center", colorCls)}
            style={{ width: px, height: px }}
          >
            <span
              style={{ width: ballSize, height: ballSize }}
              className="rounded-full bg-current animate-bounce"
            />
          </span>
        );
      }

      case "ring": {
        return (
          <svg
            width={px}
            height={px}
            viewBox="0 0 44 44"
            className={cn("animate-spin", colorCls)}
          >
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-20"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80 120"
            />
          </svg>
        );
      }

      case "infinity": {
        return (
          <svg
            width={Math.round(px * 1.4)}
            height={px}
            viewBox="0 0 100 60"
            fill="none"
            className={cn(colorCls)}
          >
            <path
              d="M25,15 C12,15 12,45 25,45 C38,45 62,15 75,15 C88,15 88,45 75,45 C62,45 38,15 25,15 Z"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="opacity-20"
            />
            <path
              d="M25,15 C12,15 12,45 25,45 C38,45 62,15 75,15 C88,15 88,45 75,45 C62,45 38,15 25,15 Z"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="60 180"
              className="animate-pulse"
            />
          </svg>
        );
      }

      case "spinner":
      default: {
        return (
          <svg
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill="none"
            className={cn("animate-spin", colorCls)}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-20"
            />
            <path
              d="M22 12a10 10 0 0 0-10-10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      }
    }
  };

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center justify-center",
        labelPosition === "bottom" ? "flex-col gap-2" : "flex-row gap-2.5",
        className
      )}
      {...props}
    >
      {renderGraphic()}
      {label ? (
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {label}
        </span>
      ) : (
        <span className="sr-only">Carregando...</span>
      )}
    </div>
  );

  if (fullScreenOverlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 dark:bg-zinc-950/75 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}

// ── Spin (Ant Design <Spin spinning tip>{children}</Spin> container wrapper) ──

export type SpinProps = {
  /** Whether the loading overlay is active (default: true) */
  spinning?: boolean;
  /** Descriptive text shown beneath the loader indicator */
  tip?: React.ReactNode;
  /** Optional delay in milliseconds before showing the spinner to prevent flicker */
  delay?: number;
  variant?: LoadingVariant;
  size?: LoadingSize;
  tone?: LoadingTone;
  /** Apply subtle backdrop blur over wrapped content while spinning (default: true) */
  blur?: boolean;
  /** Render full-screen overlay instead of scoped container overlay */
  fullscreen?: boolean;
  children?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
};

export function Spin({
  spinning = true,
  tip,
  delay = 0,
  variant = "spinner",
  size = "md",
  tone = "primary",
  blur = true,
  fullscreen = false,
  children,
  className,
  wrapperClassName,
}: SpinProps) {
  const [delayedReady, setDelayedReady] = React.useState(() => spinning && delay <= 0);
  const [prevSpinning, setPrevSpinning] = React.useState(spinning);

  if (spinning !== prevSpinning) {
    setPrevSpinning(spinning);
    if (!spinning) {
      setDelayedReady(false);
    } else if (delay <= 0) {
      setDelayedReady(true);
    }
  }

  React.useEffect(() => {
    if (!spinning || delay <= 0) return;
    const id = window.setTimeout(() => {
      setDelayedReady(true);
    }, delay);
    return () => window.clearTimeout(id);
  }, [spinning, delay]);

  const showSpinner = delay > 0 ? spinning && delayedReady : spinning;

  if (fullscreen) {
    if (!showSpinner) return <>{children}</>;
    return (
      <>
        {children}
        <Loading
          variant={variant}
          size={size}
          tone={tone}
          label={tip}
          labelPosition="bottom"
          fullScreenOverlay
          className={className}
        />
      </>
    );
  }

  if (children === undefined || children === null) {
    if (!showSpinner) return null;
    return (
      <Loading
        variant={variant}
        size={size}
        tone={tone}
        label={tip}
        labelPosition="bottom"
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative", wrapperClassName)} aria-busy={showSpinner || undefined}>
      <div
        className={cn(
          "transition-opacity duration-200",
          showSpinner && "opacity-45 pointer-events-none select-none",
        )}
      >
        {children}
      </div>

      {showSpinner && (
        <div
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-white/55 dark:bg-zinc-950/55",
            blur && "backdrop-blur-[1.5px]",
            className,
          )}
        >
          <Loading
            variant={variant}
            size={size}
            tone={tone}
            label={tip}
            labelPosition="bottom"
          />
        </div>
      )}
    </div>
  );
}
