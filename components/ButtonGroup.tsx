"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  /** Fuses inner borders and border-radii of adjacent children (default: true) */
  attached?: boolean;
};

export function ButtonGroup({
  orientation = "horizontal",
  attached = true,
  className,
  children,
  ...props
}: ButtonGroupProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(
        "inline-flex",
        isVertical ? "flex-col items-stretch" : "flex-row items-stretch",
        !attached && "gap-1.5",
        attached &&
          !isVertical && [
            "[&>*]:h-auto",
            "[&>*:not(:first-child)]:!rounded-l-none",
            "[&>*:not(:last-child)]:!rounded-r-none",
            "[&>*:not(:first-child)]:-ml-px",
            "[&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-l-zinc-300/60 dark:[&>*:not(:first-child)]:border-l-zinc-700/60",
            "[&>*:focus-visible]:z-10",
          ],
        attached &&
          isVertical && [
            "[&>*:not(:first-child)]:!rounded-t-none",
            "[&>*:not(:last-child)]:!rounded-b-none",
            "[&>*:not(:first-child)]:-mt-px",
            "[&>*:focus-visible]:z-10",
          ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ButtonGroupSeparator({
  orientation = "vertical",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="none"
      data-slot="button-group-separator"
      className={cn(
        "shrink-0 bg-zinc-200 dark:bg-zinc-700",
        orientation === "vertical" ? "w-px self-stretch" : "h-px w-full",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonGroupText({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="button-group-text"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 select-none",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default ButtonGroup;
