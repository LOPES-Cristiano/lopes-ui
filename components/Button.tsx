"use client";

import React, { useState } from "react";
import { Loader } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import ActionDialog from "@/components/ActionDialog";

// ── Confirm type (same API as the old ActionButton) ───────────────────────────

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  dialogClassName?: string;
  overlayClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
};

type ButtonProps = {
  componentId?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  variant?:
    | "solid" | "outline" | "ghost" | "destructive" | "primary" | "secondary" | "default"
    | "success" | "success-outline"
    | "warning" | "warning-outline"
    | "info"    | "info-outline"
    | "link";
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
  /** Pill shape — rounded-full */
  pill?: boolean;
  /** Icon-only mode — equal square padding, no min-w */
  square?: boolean;
  /** Hover tooltip */
  tooltip?: string;
  /** Show a confirmation dialog before executing onClick */
  confirm?: boolean | ConfirmOptions;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<string, string> = {
  solid:            "bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
  default:          "bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
  primary:          "bg-blue-600 text-white hover:bg-blue-500",
  secondary:        "bg-zinc-200 text-zinc-800 hover:bg-zinc-300",
  outline:          "bg-transparent border border-zinc-200 text-zinc-800 hover:bg-zinc-50",
  ghost:            "bg-transparent hover:bg-zinc-100 text-zinc-800",
  destructive:      "bg-red-600 text-white hover:bg-red-500",
  success:          "bg-emerald-600 text-white hover:bg-emerald-500",
  "success-outline":"bg-transparent border border-emerald-500 text-emerald-700 hover:bg-emerald-50",
  warning:          "bg-amber-500 text-white hover:bg-amber-400",
  "warning-outline":"bg-transparent border border-amber-400 text-amber-700 hover:bg-amber-50",
  info:             "bg-sky-500 text-white hover:bg-sky-400",
  "info-outline":   "bg-transparent border border-sky-400 text-sky-700 hover:bg-sky-50",
  link:             "bg-transparent text-blue-600 hover:underline",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm min-w-[72px] gap-1.5",
  md: "px-4 py-2 text-base min-w-[96px] gap-2",
  lg: "px-6 py-3 text-lg min-w-[128px] gap-2.5",
};

const squareSizeClasses = {
  sm: "p-1.5 w-8 h-8",
  md: "p-2 w-10 h-10",
  lg: "p-2.5 w-12 h-12",
};

const linkSizeClasses = {
  sm: "px-1 py-0.5 text-sm min-w-0 gap-1.5",
  md: "px-1 py-0.5 text-base min-w-0 gap-2",
  lg: "px-1 py-0.5 text-lg min-w-0 gap-2.5",
};

const iconSizeClasses = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const loaderSizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function Button({
  componentId,
  leftIcon,
  rightIcon,
  children,
  className,
  variant = "default",
  size = "md",
  loading = false,
  disabled,
  pill = false,
  square = false,
  tooltip,
  confirm,
  onClick,
  ...props
}: ButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDisabled = loading || disabled;
  const isLink = variant === "link";

  const resolvedSizeClass = square
    ? squareSizeClasses[size]
    : isLink
      ? linkSizeClasses[size]
      : sizeClasses[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (confirm) {
      setConfirmOpen(true);
      return;
    }
    onClick?.(e);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      if (typeof confirm === "object" && confirm.onConfirm) {
        await confirm.onConfirm();
      } else {
        onClick?.({} as React.MouseEvent<HTMLButtonElement>);
      }
    } catch {}
  };

  const btn = (
    <button
      {...props}
      onClick={handleClick}
      {...(componentId ? { ['data-component-id']: componentId } : {})}
      disabled={isDisabled}
      className={twMerge(clsx(
        "transition-all duration-150 whitespace-nowrap",
        "inline-flex items-center justify-center",
        !isLink && "shadow-sm shadow-zinc-900/40",
        pill ? "rounded-full" : "rounded-md",
        "active:not-disabled:translate-y-[2px]",
        isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
        tooltip && "group relative",
        variantClasses[variant],
        resolvedSizeClass,
        className,
      ))}
    >
      {loading ? (
        <span className="flex items-center justify-center flex-1">
          <Loader className={twMerge("animate-spin", loaderSizeClasses[size])} />
        </span>
      ) : (
        <>
          {leftIcon && (
            <span className={twMerge("flex shrink-0 items-center", iconSizeClasses[size])}>
              {leftIcon}
            </span>
          )}
          {children && <span className="leading-none">{children}</span>}
          {rightIcon && (
            <span className={twMerge("flex shrink-0 items-center", iconSizeClasses[size])}>
              {rightIcon}
            </span>
          )}
        </>
      )}
      {tooltip && (
        <span className="hidden sm:block pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {tooltip}
        </span>
      )}
    </button>
  );

  if (!confirm) return btn;

  return (
    <>
      {btn}
      <ActionDialog
        open={confirmOpen}
        title={typeof confirm === "object" ? confirm.title : undefined}
        description={typeof confirm === "object" ? confirm.description : undefined}
        confirmLabel={typeof confirm === "object" ? confirm.confirmLabel : undefined}
        cancelLabel={typeof confirm === "object" ? confirm.cancelLabel : undefined}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        dialogClassName={typeof confirm === "object" ? confirm.dialogClassName : undefined}
        overlayClassName={typeof confirm === "object" ? confirm.overlayClassName : undefined}
        titleClassName={typeof confirm === "object" ? confirm.titleClassName : undefined}
        descriptionClassName={typeof confirm === "object" ? confirm.descriptionClassName : undefined}
        confirmButtonClassName={typeof confirm === "object" ? confirm.confirmButtonClassName : undefined}
        cancelButtonClassName={typeof confirm === "object" ? confirm.cancelButtonClassName : undefined}
      />
    </>
  );
}
