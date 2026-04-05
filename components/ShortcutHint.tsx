"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShortcutKey = {
  /** E.g. "⌘", "Ctrl", "Shift", "Alt", "K", "Enter", "Esc" */
  key: string;
};

export type ShortcutHintProps = {
  /** Array of keys that form the shortcut. E.g. [{ key: "⌘" }, { key: "K" }] */
  keys: ShortcutKey[];
  /** Show + separator between key badges. Default: true */
  separator?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  className?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShortcutHint({
  keys,
  separator = true,
  size = "sm",
  className,
}: ShortcutHintProps) {
  const kbdClass = clsx(
    "inline-flex items-center justify-center",
    "rounded border border-b-2",
    "border-zinc-300 dark:border-zinc-600",
    "bg-zinc-100 dark:bg-zinc-800",
    "text-zinc-600 dark:text-zinc-300",
    "font-mono font-medium leading-none",
    size === "sm" ? "px-1.5 py-0.5 text-[10px] min-w-[18px]" : "px-2 py-1 text-xs min-w-[24px]",
  );

  return (
    <span
      className={twMerge(clsx("inline-flex items-center gap-0.5", className))}
      aria-label={keys.map((k) => k.key).join(" + ")}
    >
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {separator && i > 0 && (
            <span
              aria-hidden="true"
              className="text-zinc-400 dark:text-zinc-500 text-[10px] select-none"
            >
              +
            </span>
          )}
          <kbd className={kbdClass}>{k.key}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
}
