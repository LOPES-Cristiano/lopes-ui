"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  Info,
  ServerCrash,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ResultStatus =
  | "success"
  | "info"
  | "warning"
  | "error"
  | "403"
  | "404"
  | "500";

export type ResultProps = {
  /** Visual status preset (Ant Design Result status) */
  status?: ResultStatus;
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  /** Override the status icon or illustration */
  icon?: LucideIcon | React.ReactNode;
  /** Primary & secondary action buttons rendered below subTitle */
  extra?: React.ReactNode;
  /** Optional detailed summary / receipt / error checklist rendered inside a soft grey card below actions */
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  bordered?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Status visual config ──────────────────────────────────────────────────────

const STATUS_META: Record<
  ResultStatus,
  {
    Icon: LucideIcon;
    badgeCode?: string;
    outerRing: string;
    innerBg: string;
    iconCls: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    outerRing: "bg-emerald-500/10 ring-8 ring-emerald-500/5",
    innerBg: "bg-emerald-500 text-white shadow-emerald-500/25",
    iconCls: "text-white",
  },
  info: {
    Icon: Info,
    outerRing: "bg-sky-500/10 ring-8 ring-sky-500/5",
    innerBg: "bg-sky-500 text-white shadow-sky-500/25",
    iconCls: "text-white",
  },
  warning: {
    Icon: AlertTriangle,
    outerRing: "bg-amber-500/10 ring-8 ring-amber-500/5",
    innerBg: "bg-amber-500 text-white shadow-amber-500/25",
    iconCls: "text-white",
  },
  error: {
    Icon: XCircle,
    outerRing: "bg-red-500/10 ring-8 ring-red-500/5",
    innerBg: "bg-red-600 text-white shadow-red-600/25",
    iconCls: "text-white",
  },
  "403": {
    Icon: ShieldAlert,
    badgeCode: "403",
    outerRing: "bg-amber-500/10 ring-8 ring-amber-500/5",
    innerBg: "bg-amber-600 text-white shadow-amber-600/25",
    iconCls: "text-white",
  },
  "404": {
    Icon: FileQuestion,
    badgeCode: "404",
    outerRing: "bg-indigo-500/10 ring-8 ring-indigo-500/5",
    innerBg: "bg-indigo-600 text-white shadow-indigo-600/25",
    iconCls: "text-white",
  },
  "500": {
    Icon: ServerCrash,
    badgeCode: "500",
    outerRing: "bg-rose-500/10 ring-8 ring-rose-500/5",
    innerBg: "bg-rose-600 text-white shadow-rose-600/25",
    iconCls: "text-white",
  },
};

const SIZE_TOKENS = {
  sm: {
    pad: "px-5 py-6",
    halo: "h-14 w-14",
    core: "h-10 w-10",
    iconPx: 20,
    title: "text-base sm:text-lg",
    sub: "text-xs sm:text-sm",
  },
  md: {
    pad: "px-6 py-9",
    halo: "h-20 w-20",
    core: "h-14 w-14",
    iconPx: 28,
    title: "text-lg sm:text-xl",
    sub: "text-sm",
  },
  lg: {
    pad: "px-8 py-12",
    halo: "h-24 w-24",
    core: "h-16 w-16",
    iconPx: 34,
    title: "text-xl sm:text-2xl",
    sub: "text-sm sm:text-base",
  },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Result({
  status = "info",
  title,
  subTitle,
  icon,
  extra,
  children,
  size = "md",
  bordered = false,
  className,
  componentId,
  hideIfDenied = true,
}: ResultProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  const meta = STATUS_META[status];
  const sz = SIZE_TOKENS[size];
  const DefaultIcon = meta.Icon;

  const renderGraphic = () => {
    if (icon !== undefined) {
      if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
        const CustomIcon = icon as LucideIcon;
        return (
          <div className={twMerge("relative flex items-center justify-center rounded-full", sz.halo, meta.outerRing)}>
            <div className={twMerge("flex items-center justify-center rounded-full shadow-lg", sz.core, meta.innerBg)}>
              <CustomIcon size={sz.iconPx} className={meta.iconCls} />
            </div>
          </div>
        );
      }
      return <div className="flex items-center justify-center">{icon}</div>;
    }

    return (
      <div className={twMerge("relative flex items-center justify-center rounded-full", sz.halo, meta.outerRing)}>
        <div className={twMerge("flex items-center justify-center rounded-full shadow-lg", sz.core, meta.innerBg)}>
          <DefaultIcon size={sz.iconPx} strokeWidth={2.2} className={meta.iconCls} />
        </div>
        {meta.badgeCode && (
          <span className="absolute -bottom-1.5 rounded-full border border-white dark:border-zinc-900 bg-zinc-900 dark:bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:text-zinc-900 shadow-xs">
            {meta.badgeCode}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      data-component-id={componentId}
      className={twMerge(
        "flex w-full flex-col items-center text-center",
        sz.pad,
        bordered && "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs",
        className
      )}
    >
      {renderGraphic()}

      <h3 className={twMerge("mt-4 font-bold tracking-tight text-zinc-900 dark:text-zinc-100", sz.title)}>
        {title}
      </h3>

      {subTitle && (
        <p className={twMerge("mt-1.5 max-w-lg leading-relaxed text-zinc-500 dark:text-zinc-400", sz.sub)}>
          {subTitle}
        </p>
      )}

      {extra && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">{extra}</div>
      )}

      {children && (
        <div className="mt-6 w-full max-w-2xl rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-4 sm:p-5 text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
      )}
    </div>
  );
}
