"use client";

import React from "react";
import {
  HoverCard as PrimitiveHoverCard,
  HoverCardTrigger,
  HoverCardContent,
  type HoverCardRootProps,
} from "./primitives/hover-card";

export type HoverCardProps = HoverCardRootProps & {
  /** Optional declarative trigger element */
  trigger?: React.ReactNode;
  /** Optional declarative card content when using `trigger` */
  content?: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  contentClassName?: string;
};

export default function HoverCard({
  trigger,
  content,
  align = "center",
  side = "bottom",
  sideOffset = 8,
  openDelay = 180,
  closeDelay = 150,
  contentClassName,
  children,
  ...props
}: HoverCardProps) {
  const resolvedContent = content ?? children;

  if (trigger !== undefined) {
    return (
      <PrimitiveHoverCard openDelay={openDelay} closeDelay={closeDelay} {...props}>
        <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
        <HoverCardContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={contentClassName}
        >
          {resolvedContent}
        </HoverCardContent>
      </PrimitiveHoverCard>
    );
  }

  return (
    <PrimitiveHoverCard openDelay={openDelay} closeDelay={closeDelay} {...props}>
      {children}
    </PrimitiveHoverCard>
  );
}

export { HoverCardTrigger, HoverCardContent };
