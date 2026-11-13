"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";

export type MotionCollapseProps = {
  /** Controls whether the collapsible region is expanded */
  open: boolean;
  children: React.ReactNode;
  /** Transition duration in seconds (default: 0.22) */
  duration?: number;
  /** Keep DOM mounted when closed (uses hidden state instead of unmounting) */
  keepMounted?: boolean;
  id?: string;
  /** Outer animated overflow wrapper classes */
  className?: string;
  /** Inner content wrapper classes (safe place for padding so height animation never snaps) */
  innerClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const COLLAPSE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MotionCollapse({
  open,
  children,
  duration = 0.22,
  keepMounted = false,
  id,
  className,
  innerClassName,
  componentId,
  hideIfDenied = false,
}: MotionCollapseProps) {
  const prefersReducedMotion = useReducedMotion();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  if (keepMounted) {
    return (
      <div
        id={id}
        aria-hidden={!open}
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={cn(
          "grid transition-[grid-template-rows,opacity] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none",
          !hasPermission && "opacity-60 pointer-events-none",
          className,
        )}
        style={{ transitionDuration: prefersReducedMotion ? "0ms" : `${Math.round(duration * 1000)}ms` }}
      >
        <div className={cn("min-h-0 overflow-hidden", innerClassName)}>{children}</div>
      </div>
    );
  }

  if (prefersReducedMotion) {
    if (!open) return null;
    return (
      <div
        id={id}
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={cn(!hasPermission && "opacity-60 pointer-events-none", className)}
      >
        <div className={innerClassName}>{children}</div>
      </div>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="motion-collapse"
          id={id}
          {...(componentId ? { "data-component-id": componentId } : {})}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: { duration, ease: COLLAPSE_EASE },
              opacity: { duration: Math.min(duration, 0.18), ease: "easeOut" },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: Math.max(0.15, duration * 0.85), ease: COLLAPSE_EASE },
              opacity: { duration: 0.12, ease: "easeIn" },
            },
          }}
          className={cn(
            "overflow-hidden",
            !hasPermission && "opacity-60 pointer-events-none",
            className,
          )}
        >
          <div className={innerClassName}>{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default MotionCollapse;
