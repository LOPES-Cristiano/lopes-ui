import React from "react";
import { Loader } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

type ButtonProps = {
  componentId?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost" | "destructive" | "primary" | "secondary" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<string, string> = {
  solid: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
  default: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  secondary: "bg-zinc-200 text-zinc-800 hover:bg-zinc-300",
  outline: "bg-transparent border border-zinc-200 text-zinc-800 hover:bg-zinc-50",
  ghost: "bg-transparent hover:bg-zinc-100 text-zinc-800",
  destructive: "bg-red-600 text-white hover:bg-red-500",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm min-w-[72px] gap-1.5",
  md: "px-4 py-2 text-base min-w-[96px] gap-2",
  lg: "px-6 py-3 text-lg min-w-[128px] gap-2.5",
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
  ...props
}: ButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <button
      {...props}
      {...(componentId ? { ['data-component-id']: componentId } as any : {})}
      disabled={isDisabled}
      className={twMerge(clsx(
        "rounded-md transition-all duration-150 whitespace-nowrap",
        "inline-flex items-center justify-center shadow-sm shadow-zinc-900/40",
        "active:not-disabled:translate-y-[2px]",
        isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
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
          <span className="leading-none">{children}</span>
          {rightIcon && (
            <span className={twMerge("flex shrink-0 items-center", iconSizeClasses[size])}>
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
