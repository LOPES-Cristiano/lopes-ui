"use client";

import React from "react";
import { Globe, Lock } from "lucide-react";
import { cn } from "@/utils/cn";

// ─── 1. BrowserMockup (daisyUI mockup-browser) ───────────────────────────────

export type BrowserMockupProps = React.HTMLAttributes<HTMLDivElement> & {
  url?: string;
  secure?: boolean;
  toolbarExtra?: React.ReactNode;
  bodyClassName?: string;
};

export function BrowserMockup({
  url = "https://lopes-ui.dev",
  secure = true,
  toolbarExtra,
  bodyClassName,
  className,
  children,
  ...props
}: BrowserMockupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm",
        className
      )}
      {...props}
    >
      {/* Browser Top Toolbar */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1 text-xs text-zinc-500 dark:text-zinc-400">
            {secure ? (
              <Lock size={12} className="text-emerald-500 shrink-0" />
            ) : (
              <Globe size={12} className="text-zinc-400 shrink-0" />
            )}
            <span className="truncate font-mono text-[11px]">{url}</span>
          </div>
        </div>

        {toolbarExtra && <div className="shrink-0">{toolbarExtra}</div>}
      </div>

      {/* Browser Viewport Body */}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}

// ─── 2. WindowMockup (daisyUI mockup-window) ─────────────────────────────────

export type WindowMockupProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  headerExtra?: React.ReactNode;
  bodyClassName?: string;
};

export function WindowMockup({
  title,
  headerExtra,
  bodyClassName,
  className,
  children,
  ...props
}: WindowMockupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        {title && (
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate px-2">
            {title}
          </div>
        )}
        <div className="min-w-[36px] flex justify-end">{headerExtra}</div>
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}

// ─── 3. PhoneMockup (daisyUI mockup-phone) ───────────────────────────────────

export type PhoneMockupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Screen background class */
  screenClassName?: string;
  /** Status bar time text (default: "09:41") */
  statusTime?: string;
};

export function PhoneMockup({
  screenClassName,
  statusTime = "09:41",
  className,
  children,
  ...props
}: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center rounded-[42px] border-[8px] border-zinc-900 dark:border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative flex h-[560px] w-[280px] flex-col overflow-hidden rounded-[32px] bg-white dark:bg-zinc-950",
          screenClassName
        )}
      >
        {/* Top Notch / Dynamic Island */}
        <div className="relative flex items-center justify-between px-5 pt-2.5 pb-2 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
          <span>{statusTime}</span>
          <div className="h-4 w-20 rounded-full bg-zinc-900 dark:bg-black" />
          <div className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-xs bg-current opacity-80" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Bottom Home Indicator */}
        <div className="flex justify-center py-2">
          <span className="h-1 w-24 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

// ─── 4. CodeMockup (daisyUI mockup-code) ─────────────────────────────────────

export type CodeMockupLine = {
  text: React.ReactNode;
  prefix?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  highlight?: boolean;
};

export type CodeMockupProps = React.HTMLAttributes<HTMLDivElement> & {
  lines?: (string | CodeMockupLine)[];
  title?: string;
};

const LINE_TONE_CLS: Record<NonNullable<CodeMockupLine["tone"]>, string> = {
  default: "text-zinc-100",
  success: "text-emerald-400",
  warning: "text-amber-300",
  danger: "text-rose-400",
  info: "text-sky-400",
};

export function CodeMockup({
  lines,
  title,
  className,
  children,
  ...props
}: CodeMockupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-zinc-900 text-zinc-100 shadow-lg border border-zinc-800 font-mono text-xs",
        className
      )}
      {...props}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        {title && <span className="text-[11px] text-zinc-400">{title}</span>}
        <span className="w-8" />
      </div>

      {/* Lines Body */}
      <div className="py-3 overflow-x-auto">
        {lines
          ? lines.map((line, i) => {
              const obj: CodeMockupLine =
                typeof line === "string"
                  ? { text: line, prefix: "$" }
                  : line;
              const tone = obj.tone ?? "default";
              return (
                <pre
                  key={i}
                  className={cn(
                    "flex items-center px-4 py-0.5 leading-relaxed",
                    LINE_TONE_CLS[tone],
                    obj.highlight && "bg-white/10"
                  )}
                >
                  <span className="mr-3 select-none text-zinc-500">
                    {obj.prefix ?? String(i + 1)}
                  </span>
                  <code>{obj.text}</code>
                </pre>
              );
            })
          : children}
      </div>
    </div>
  );
}

export default BrowserMockup;
