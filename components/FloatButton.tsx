"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ArrowUp, Plus, X, type LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./primitives/tooltip";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FloatButtonShape = "circle" | "square";
export type FloatButtonType = "default" | "primary";

export type FloatButtonBadge = {
  count?: number;
  dot?: boolean;
  color?: "danger" | "primary" | "success" | "warning";
};

export type FloatButtonProps = {
  icon?: LucideIcon | React.ReactNode;
  /** Short subtitle displayed inside square buttons (Ant Design description) */
  description?: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipSide?: "left" | "right" | "top" | "bottom";
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  badge?: FloatButtonBadge;
  href?: string;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  /** When true (default when standalone), positions fixed at bottom-right; set false when inside FloatButtonGroup or inline demos */
  floating?: boolean;
  right?: number;
  bottom?: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

export type FloatButtonGroupProps = {
  children: React.ReactNode;
  /** When set, collapses children behind a trigger button opened by click or hover */
  trigger?: "click" | "hover";
  icon?: LucideIcon | React.ReactNode;
  closeIcon?: LucideIcon | React.ReactNode;
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  tooltip?: React.ReactNode;
  /** Fixed viewport positioning (default: true). Set false for container-relative demos */
  floating?: boolean;
  right?: number;
  bottom?: number;
  direction?: "up" | "left";
  className?: string;
  componentId?: string;
};

export type BackTopProps = Omit<FloatButtonProps, "onClick"> & {
  /** Scroll offset in px before the button becomes visible (default: 200) */
  visibilityHeight?: number;
  /** Custom scroll container resolver (defaults to `window`) */
  scrollTarget?: () => HTMLElement | Window | null;
  /** Show an SVG radial scroll-progress ring around the button (default: true) */
  showProgress?: boolean;
  onClick?: () => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const BADGE_COLOR_CLS = {
  danger: "bg-red-600 text-white",
  primary: "bg-primary text-primary-foreground",
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-white",
} as const;

function renderFloatIcon(
  icon: LucideIcon | React.ReactNode | undefined,
  size = 18
): React.ReactNode {
  if (!icon) return null;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
    const IconComp = icon as LucideIcon;
    return <IconComp size={size} strokeWidth={2} />;
  }
  return icon;
}

// ── FloatButton ───────────────────────────────────────────────────────────────

function FloatButtonBase({
  icon,
  description,
  tooltip,
  tooltipSide = "left",
  type = "default",
  shape = "circle",
  badge,
  href,
  target,
  onClick,
  floating = false,
  right = 24,
  bottom = 24,
  disabled = false,
  ariaLabel = "Ação rápida",
  className,
  componentId,
  hideIfDenied = true,
}: FloatButtonProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) return null;

  const effectiveDisabled = disabled || !hasPermission;

  const baseCls = twMerge(
    "relative inline-flex flex-col items-center justify-center select-none transition-all duration-150 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",
    shape === "circle" ? "h-11 w-11 rounded-full" : "min-h-11 min-w-11 rounded-2xl px-2.5 py-1.5",
    type === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95"
      : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-primary active:scale-95",
    floating && "fixed z-40",
    effectiveDisabled && "opacity-50 pointer-events-none cursor-not-allowed",
    className
  );

  const posStyle = floating ? { right, bottom } : undefined;

  const inner = (
    <>
      {icon && <span className="flex items-center justify-center">{renderFloatIcon(icon, description ? 16 : 19)}</span>}
      {description && (
        <span className="mt-0.5 max-w-[64px] truncate text-[10px] font-semibold leading-tight">
          {description}
        </span>
      )}
      {badge && (badge.dot || (badge.count !== undefined && badge.count > 0)) && (
        <span
          className={twMerge(
            "absolute -right-1 -top-1 flex items-center justify-center rounded-full font-bold ring-2 ring-white dark:ring-zinc-950",
            BADGE_COLOR_CLS[badge.color ?? "danger"],
            badge.dot ? "h-2.5 w-2.5" : "min-w-4.5 h-4.5 px-1 text-[10px]"
          )}
        >
          {!badge.dot && (badge.count && badge.count > 99 ? "99+" : badge.count)}
        </span>
      )}
    </>
  );

  const buttonNode = href ? (
    <a
      href={href}
      target={target}
      aria-label={ariaLabel}
      data-component-id={componentId}
      style={posStyle}
      onClick={onClick}
      className={baseCls}
    >
      {inner}
    </a>
  ) : (
    <button
      type="button"
      disabled={effectiveDisabled}
      aria-label={ariaLabel}
      data-component-id={componentId}
      style={posStyle}
      onClick={onClick}
      className={baseCls}
    >
      {inner}
    </button>
  );

  if (!tooltip) return buttonNode;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{buttonNode}</TooltipTrigger>
        <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── FloatButton.Group ─────────────────────────────────────────────────────────

export function FloatButtonGroup({
  children,
  trigger,
  icon = Plus,
  closeIcon = X,
  type = "primary",
  shape = "circle",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  tooltip,
  floating = true,
  right = 24,
  bottom = 24,
  direction = "up",
  className,
  componentId,
}: FloatButtonGroupProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = trigger ? (controlledOpen !== undefined ? controlledOpen : internalOpen) : true;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      data-component-id={componentId}
      style={floating ? { right, bottom } : undefined}
      onMouseEnter={trigger === "hover" ? () => setOpen(true) : undefined}
      onMouseLeave={trigger === "hover" ? () => setOpen(false) : undefined}
      className={twMerge(
        "inline-flex items-center gap-2.5",
        direction === "up" ? "flex-col" : "flex-row",
        floating && "fixed z-40",
        className
      )}
    >
      <div
        className={twMerge(
          "flex items-center gap-2.5 transition-all duration-200",
          direction === "up" ? "flex-col" : "flex-row",
          trigger
            ? isOpen
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 translate-y-2 scale-95 pointer-events-none h-0 overflow-hidden"
            : ""
        )}
      >
        {children}
      </div>

      {trigger && (
        <FloatButtonBase
          icon={isOpen ? closeIcon : icon}
          type={type}
          shape={shape}
          tooltip={tooltip}
          ariaLabel={isOpen ? "Fechar menu flutuante" : "Abrir menu flutuante"}
          onClick={trigger === "click" ? () => setOpen(!isOpen) : undefined}
        />
      )}
    </div>
  );
}

// ── FloatButton.BackTop ───────────────────────────────────────────────────────

export function BackTop({
  visibilityHeight = 200,
  scrollTarget,
  showProgress = true,
  icon = ArrowUp,
  tooltip = "Voltar ao topo",
  type = "default",
  shape = "circle",
  floating = true,
  right = 24,
  bottom = 24,
  onClick,
  className,
  ...rest
}: BackTopProps) {
  const [visible, setVisible] = useState(visibilityHeight <= 0);
  const [progress, setProgress] = useState(0);

  const resolveContainer = useCallback((): HTMLElement | Window | null => {
    if (typeof window === "undefined") return null;
    return scrollTarget ? scrollTarget() : window;
  }, [scrollTarget]);

  useEffect(() => {
    const target = resolveContainer();
    if (!target) return;

    const handleScroll = () => {
      let scrollTop = 0;
      let maxScroll = 1;

      if (target === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
        maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
      } else {
        const el = target as HTMLElement;
        scrollTop = el.scrollTop;
        maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
      }

      setVisible(scrollTop >= visibilityHeight);
      setProgress(Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)));
    };

    const raf = requestAnimationFrame(handleScroll);
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", handleScroll);
    };
  }, [resolveContainer, visibilityHeight]);

  const scrollToTop = () => {
    const target = resolveContainer();
    if (!target) return;
    if (target === window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      (target as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    }
    onClick?.();
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      style={floating ? { right, bottom } : undefined}
      className={twMerge(
        "inline-flex items-center justify-center transition-all duration-200",
        floating && "fixed z-40",
        visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-3 scale-90 pointer-events-none"
      )}
    >
      <div className="relative inline-flex items-center justify-center">
        <FloatButtonBase
          {...rest}
          icon={icon}
          tooltip={tooltip}
          type={type}
          shape={shape}
          floating={false}
          ariaLabel="Voltar ao topo"
          onClick={scrollToTop}
          className={className}
        />
        {showProgress && shape === "circle" && (
          <svg
            aria-hidden="true"
            width={46}
            height={46}
            viewBox="0 0 46 46"
            className="pointer-events-none absolute -rotate-90"
          >
            <circle
              cx="23"
              cy="23"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-150"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export type FloatButtonCompound = typeof FloatButtonBase & {
  Group: typeof FloatButtonGroup;
  BackTop: typeof BackTop;
};

const FloatButton = Object.assign(FloatButtonBase, {
  Group: FloatButtonGroup,
  BackTop,
}) as FloatButtonCompound;

export default FloatButton;
