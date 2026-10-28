"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { Kbd, KbdGroup, resolveShortcutKeyLabel, type KbdSize, type KbdVariant } from "./Kbd";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShortcutKey = {
  /** E.g. "mod", "⌘", "Ctrl", "Shift", "Alt", "K", "Enter", "Esc" */
  key: string;
};

export type ShortcutHintProps = {
  /** Array of keys that form the shortcut. E.g. [{ key: "mod" }, { key: "K" }] or ["mod", "K"] */
  keys: Array<ShortcutKey | string>;
  /** Show + separator between key badges. Default: true */
  separator?: boolean;
  /** Size variant */
  size?: KbdSize;
  /** Visual variant */
  variant?: KbdVariant;
  className?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShortcutHint({
  keys,
  separator = true,
  size = "sm",
  variant = "default",
  className,
}: ShortcutHintProps) {
  const normalizedKeys = keys.map((k) =>
    typeof k === "string" ? resolveShortcutKeyLabel(k) : resolveShortcutKeyLabel(k.key)
  );

  return (
    <KbdGroup
      separator={separator ? "+" : undefined}
      className={twMerge(clsx("gap-0.5", className))}
      aria-label={normalizedKeys.join(" + ")}
    >
      {normalizedKeys.map((label, i) => (
        <Kbd key={i} size={size} variant={variant} resolveMod={false}>
          {label}
        </Kbd>
      ))}
    </KbdGroup>
  );
}
