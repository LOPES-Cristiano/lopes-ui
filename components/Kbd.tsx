"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type KbdSize = "xs" | "sm" | "md";
export type KbdVariant = "default" | "outline" | "ghost";

export type KbdProps = React.HTMLAttributes<HTMLElement> & {
  size?: KbdSize;
  variant?: KbdVariant;
  /** Resolve "mod" or "Mod" automatically to ⌘ on Mac and Ctrl on Windows/Linux */
  resolveMod?: boolean;
};

export type KbdGroupProps = React.HTMLAttributes<HTMLSpanElement> & {
  separator?: React.ReactNode;
};

const SIZE_CLASSES: Record<KbdSize, string> = {
  xs: "px-1 py-0.5 text-[10px] min-w-[16px] h-4",
  sm: "px-1.5 py-0.5 text-[10px] min-w-[18px] h-5",
  md: "px-2 py-1 text-xs min-w-[24px] h-6",
};

const VARIANT_CLASSES: Record<KbdVariant, string> = {
  default:
    "rounded border border-b-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-2xs",
  outline:
    "rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-600 dark:text-zinc-300",
  ghost:
    "rounded bg-zinc-100/70 dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400",
};

export function resolveShortcutKeyLabel(key: string): string {
  const lower = key.trim().toLowerCase();
  if (lower === "mod" || lower === "cmdorctrl") {
    if (typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)) {
      return "⌘";
    }
    return "Ctrl";
  }
  if (lower === "cmd" || lower === "command" || lower === "meta") return "⌘";
  if (lower === "opt" || lower === "option") return "⌥";
  return key;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size = "sm", variant = "default", resolveMod = true, className, children, ...props },
  ref
) {
  const content =
    resolveMod && typeof children === "string"
      ? resolveShortcutKeyLabel(children)
      : children;

  return (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-mono font-medium leading-none select-none shrink-0",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {content}
    </kbd>
  );
});

export const KbdGroup = React.forwardRef<HTMLSpanElement, KbdGroupProps>(function KbdGroup(
  { separator, className, children, ...props },
  ref
) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <span
      ref={ref}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {items.map((child, idx) => (
        <React.Fragment key={idx}>
          {separator !== undefined && separator !== false && idx > 0 && (
            <span
              aria-hidden="true"
              className="text-zinc-400 dark:text-zinc-500 text-[10px] select-none"
            >
              {separator}
            </span>
          )}
          {child}
        </React.Fragment>
      ))}
    </span>
  );
});

export default Kbd;
