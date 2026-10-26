"use client";

import React from "react";
import Drawer, { type DrawerProps } from "./Drawer";
import { twMerge } from "tailwind-merge";

type FormDrawerProps = Omit<DrawerProps, "children"> & {
  children: React.ReactNode;
  summary?: React.ReactNode;
  contentClassName?: string;
  summaryClassName?: string;
  bodyClassName?: string;
};

export default function FormDrawer({
  children,
  summary,
  contentClassName,
  summaryClassName,
  bodyClassName,
  ...props
}: FormDrawerProps) {
  return (
    <Drawer {...props}>
      <div className={twMerge("space-y-5 p-5 md:p-6", contentClassName)}>
        {summary && (
          <div
            className={twMerge(
              "rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-4 shadow-sm shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-black/10",
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
