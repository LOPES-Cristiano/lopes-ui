"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";

export type StaggerListProps = {
  children: React.ReactNode;
  /** Delay in seconds between each item entrance (default: 0.032) */
  staggerDelay?: number;
  /** Maximum number of items that receive incremental delay so long lists never lag (default: 12) */
  maxStaggerItems?: number;
  /** Vertical entrance offset in pixels (default: 8) */
  offsetY?: number;
  /** Disable initial mount animation (useful when re-mounting cached or polling views) */
  initialAnimation?: boolean;
  as?: "div" | "ul" | "ol";
  role?: React.AriaRole;
  ariaLabel?: string;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

export type StaggerItemProps = {
  children: React.ReactNode;
  /** Optional explicit item index used to cap stagger delay */
  index?: number;
  /** Stagger step in seconds when used standalone (default: 0.03) */
  staggerDelay?: number;
  /** Cap index for incremental delay (default: 12) */
  maxStaggerItems?: number;
  /** Vertical offset in pixels (default: 8) */
  offsetY?: number;
  /** Smoothly animate position changes when filtering/reordering */
  animateLayout?: boolean;
  /** Disable initial mount animation */
  initialAnimation?: boolean;
  as?: "div" | "li";
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const STAGGER_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StaggerList({
  children,
  staggerDelay = 0.032,
  maxStaggerItems = 12,
  offsetY = 8,
  initialAnimation = true,
  as = "div",
  role,
  ariaLabel,
  className,
  componentId,
  hideIfDenied = false,
}: StaggerListProps) {
  const prefersReducedMotion = useReducedMotion();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  const Tag = as;

  if (prefersReducedMotion || !initialAnimation) {
    return (
      <Tag
        role={role}
        aria-label={ariaLabel}
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={cn(!hasPermission && "opacity-60 pointer-events-none", className)}
      >
        {children}
      </Tag>
    );
  }

  const mappedChildren = React.Children.map(children, (child, idx) => {
    if (!React.isValidElement(child)) return child;
    if (child.type === StaggerItem) {
      const itemProps = child.props as StaggerItemProps;
      return React.cloneElement(child as React.ReactElement<StaggerItemProps>, {
        index: itemProps.index ?? idx,
        staggerDelay: itemProps.staggerDelay ?? staggerDelay,
        maxStaggerItems: itemProps.maxStaggerItems ?? maxStaggerItems,
        offsetY: itemProps.offsetY ?? offsetY,
        initialAnimation: itemProps.initialAnimation ?? initialAnimation,
      });
    }
    return child;
  });

  return (
    <Tag
      role={role}
      aria-label={ariaLabel}
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={cn(!hasPermission && "opacity-60 pointer-events-none", className)}
    >
      {mappedChildren}
    </Tag>
  );
}

export function StaggerItem({
  children,
  index = 0,
  staggerDelay = 0.032,
  maxStaggerItems = 12,
  offsetY = 8,
  animateLayout = false,
  initialAnimation = true,
  as = "div",
  className,
  componentId,
  hideIfDenied = false,
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  if (prefersReducedMotion) {
    const StaticTag = as;
    return (
      <StaticTag
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={cn(!hasPermission && "opacity-60 pointer-events-none", className)}
      >
        {children}
      </StaticTag>
    );
  }

  const cappedIdx = Math.max(0, Math.min(index, maxStaggerItems));
  const delay = initialAnimation ? cappedIdx * staggerDelay : 0;
  const MotionTag = as === "li" ? motion.li : motion.div;

  return (
    <MotionTag
      {...(componentId ? { "data-component-id": componentId } : {})}
      layout={animateLayout ? "position" : undefined}
      initial={initialAnimation ? { opacity: 0, y: offsetY } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay,
        ease: STAGGER_EASE,
        layout: animateLayout ? { type: "spring", stiffness: 380, damping: 32 } : undefined,
      }}
      className={cn(!hasPermission && "opacity-60 pointer-events-none", className)}
    >
      {children}
    </MotionTag>
  );
}

export default StaggerList;
