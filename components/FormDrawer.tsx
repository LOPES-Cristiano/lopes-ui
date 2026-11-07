"use client";

import React from "react";
import Drawer, { type DrawerProps } from "./Drawer";
import { twMerge } from "tailwind-merge";

export type FormDrawerProps = Omit<DrawerProps, "children"> & {
  children: React.ReactNode;
  summary?: React.ReactNode;
  contentClassName?: string;
  summaryClassName?: string;
  bodyClassName?: string;
};

export default function FormDrawer({
  children,
  summary,
  noPadding = false,
  contentClassName,
  summaryClassName,
  bodyClassName,
  ...props
}: FormDrawerProps) {
  return (
    <Drawer noPadding {...props}>
      <div className={twMerge("space-y-5", !noPadding && "p-5 md:p-6", contentClassName)}>
        {summary && (
          <div
            className={twMerge(
              "rounded-[var(--radius-card)] border border-border bg-muted/40 p-4 shadow-[var(--shadow-card)]",
              summaryClassName,
            )}
          >
            {summary}
          </div>
        )}
        <div className={twMerge("space-y-5", bodyClassName)}>
          {children}
        </div>
      </div>
    </Drawer>
  );
}
