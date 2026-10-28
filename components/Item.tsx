"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils/cn";

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "sm" | "md" | "lg";

export type ItemProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ItemVariant;
  size?: ItemSize;
  asChild?: boolean;
  interactive?: boolean;
};

const VARIANT_CLS: Record<ItemVariant, string> = {
  default: "bg-transparent",
  outline: "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl",
  muted: "bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl",
};

const SIZE_CLS: Record<ItemSize, string> = {
  sm: "px-3 sm:px-3.5 py-2.5 gap-2.5 sm:gap-3",
  md: "px-3.5 sm:px-4 py-3 sm:py-3.5 gap-3 sm:gap-3.5",
  lg: "px-4 sm:px-5 py-3.5 sm:py-4 gap-3.5 sm:gap-4",
};

export function Item({
  variant = "default",
  size = "md",
  asChild = false,
  interactive = false,
  className,
  children,
  ...props
}: ItemProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="item"
      className={cn(
        "flex flex-wrap sm:flex-nowrap items-center gap-3.5 text-sm transition-colors first:rounded-t-[inherit] last:rounded-b-[inherit]",
        VARIANT_CLS[variant],
        SIZE_CLS[size],
        (interactive || props.onClick) &&
          "cursor-pointer hover:bg-zinc-50/90 dark:hover:bg-zinc-800/60",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function ItemGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("flex flex-col overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ItemMedia({
  variant = "default",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "icon" | "image" }) {
  return (
    <div
      data-slot="item-media"
      className={cn(
        "flex shrink-0 items-center justify-center",
        variant === "icon" &&
          "h-10 w-10 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 shadow-2xs",
        variant === "image" && "h-10 w-10 overflow-hidden rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ItemContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex min-w-[140px] flex-1 flex-col gap-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ItemTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "flex flex-wrap items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 leading-snug",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ItemDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="item-description"
      className={cn("line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function ItemActions({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-actions"
      className={cn("ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3 pl-1 sm:pl-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ItemSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      data-slot="item-separator"
      className={cn("my-1 h-px w-full bg-zinc-200/80 dark:bg-zinc-800", className)}
      {...props}
    />
  );
}

export default Item;
