"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { Separator as PrimitiveSeparator } from "./primitives/separator";

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  /** Optional text/node rendered in the center of a horizontal separator */
  label?: React.ReactNode;
  labelAlign?: "start" | "center" | "end";
};

export default function Separator({
  orientation = "horizontal",
  decorative = true,
  label,
  labelAlign = "center",
  className,
  ...props
}: SeparatorProps) {
  if (label && orientation === "horizontal") {
    return (
      <div
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : "horizontal"}
        className={cn("relative flex w-full items-center py-1", className)}
        {...props}
      >
        {labelAlign !== "start" && (
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        )}
        <span
          className={cn(
            "shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400 select-none",
            labelAlign === "start" ? "pr-3" : labelAlign === "end" ? "pl-3" : "px-3",
          )}
        >
          {label}
        </span>
        {labelAlign !== "end" && (
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        )}
      </div>
    );
  }

  return (
    <PrimitiveSeparator
      orientation={orientation}
      decorative={decorative}
      className={className}
      {...props}
    />
  );
}
