'use client';

import React, { useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader } from 'lucide-react';
import { cn } from '../utils/cn';
import ConfirmDialog, { type ConfirmDialogVariant } from './ConfirmDialog';
import { useAccessControl } from './useAccessControl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './primitives/tooltip';

// ── Confirm type (same API as the old ActionButton) ───────────────────────────

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm?: () => void | Promise<void>;
};

export type ButtonProps = {
  componentId?: string;
  /** Se false, o botão é renderizado desabilitado ao invés de oculto quando o usuário não tiver permissão. Default: true */
  hideIfDenied?: boolean;
  /** Render the button as its child element via Radix Slot */
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  leading?: React.ReactNode;
  rightIcon?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
  full?: boolean;
  variant?:
    | 'solid'
    | 'brand'
    | 'outline'
    | 'dashed'
    | 'tonal'
    | 'filled'
    | 'ghost'
    | 'destructive'
    | 'danger-outline'
    | 'danger-dashed'
    | 'danger-ghost'
    | 'primary'
    | 'secondary'
    | 'default'
    | 'success'
    | 'success-outline'
    | 'warning'
    | 'warning-outline'
    | 'info'
    | 'info-outline'
    | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  /** Optional text displayed next to the spinner while loading */
  loadingText?: string;
  /** Pill shape — rounded-full */
  pill?: boolean;
  /** Icon-only mode — equal square padding, no min-w */
  square?: boolean;
  /** Button geometry preset (daisyUI btn-circle / btn-square + Ant Design round support) */
  shape?: 'default' | 'circle' | 'square' | 'round';
  /** Extra horizontal width preset (daisyUI btn-wide support) */
  wide?: boolean;
  /** Hover/focus tooltip rendered via Portal (never clipped by overflow-hidden) */
  tooltip?: string;
  /** Hover tooltip position (default: 'top') */
  tooltipPosition?:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'right';
  /** Show a confirmation dialog before executing onClick */
  confirm?: boolean | ConfirmOptions;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<string, string> = {
  solid: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  default: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  brand: 'bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  outline:
    'bg-surface border border-border text-surface-foreground hover:bg-surface-hover hover:border-border-strong',
  dashed:
    'bg-transparent border border-dashed border-border-strong text-surface-foreground hover:border-primary hover:text-primary hover:bg-surface-hover/50',
  tonal:
    'bg-primary-soft text-primary-soft-foreground hover:bg-secondary-hover border border-transparent',
  filled:
    'bg-primary-soft text-primary-soft-foreground hover:bg-secondary-hover border border-transparent',
  ghost: 'bg-transparent hover:bg-surface-hover text-surface-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
  'danger-outline':
    'bg-transparent border border-danger-border text-danger-soft-foreground hover:bg-danger-soft',
  'danger-dashed':
    'bg-transparent border border-dashed border-danger-border text-danger-soft-foreground hover:bg-danger-soft',
  'danger-ghost':
    'bg-transparent text-danger-soft-foreground hover:bg-danger-soft',
  success: 'bg-success text-success-foreground hover:bg-success-hover',
  'success-outline':
    'bg-transparent border border-success-border text-success-soft-foreground hover:bg-success-soft',
  warning: 'bg-warning text-warning-foreground hover:bg-warning-hover',
  'warning-outline':
    'bg-transparent border border-warning-border text-warning-soft-foreground hover:bg-warning-soft',
  info: 'bg-info text-info-foreground hover:bg-info-hover',
  'info-outline':
    'bg-transparent border border-info-border text-info-soft-foreground hover:bg-info-soft',
  link: 'bg-transparent text-primary hover:underline underline-offset-4',
};

const sizeClasses = {
  sm: 'h-8 px-3 text-xs font-medium min-w-[68px] gap-1.5',
  md: 'h-10 px-4 text-sm font-medium min-w-[88px] gap-2',
  lg: 'h-12 px-6 text-base font-medium min-w-[112px] gap-2.5',
};

const squareSizeClasses = {
  sm: 'p-1.5 w-8 h-8',
  md: 'p-2 w-10 h-10',
  lg: 'p-2.5 w-12 h-12',
};

const linkSizeClasses = {
  sm: 'px-1 py-0.5 text-xs font-medium min-w-0 gap-1.5',
  md: 'px-1 py-0.5 text-sm font-medium min-w-0 gap-2',
  lg: 'px-1 py-0.5 text-base font-medium min-w-0 gap-2.5',
};

const iconSizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const loaderSizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

function mapTooltipPlacement(pos: NonNullable<ButtonProps['tooltipPosition']>): {
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
} {
  switch (pos) {
    case 'top-left':
      return { side: 'top', align: 'start' };
    case 'top-right':
      return { side: 'top', align: 'end' };
    case 'bottom':
      return { side: 'bottom', align: 'center' };
    case 'bottom-left':
      return { side: 'bottom', align: 'start' };
    case 'bottom-right':
      return { side: 'bottom', align: 'end' };
    case 'left':
      return { side: 'left', align: 'center' };
    case 'right':
      return { side: 'right', align: 'center' };
    case 'top':
    default:
      return { side: 'top', align: 'center' };
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    componentId,
    asChild = false,
    leftIcon,
    leading,
    rightIcon,
    trailing,
    children,
    fullWidth = false,
    full = false,
    variant = 'default',
    size = 'md',
    className,
    loading = false,
    loadingText,
    pill = false,
    square = false,
    shape = 'default',
    wide = false,
    tooltip,
    tooltipPosition = 'top',
    confirm,
    disabled,
    hideIfDenied = true,
    onClick,
    ...props
  },
  ref
) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { canAccess } = useAccessControl();

  const hasPermission = !componentId || canAccess(componentId);
  if (!hasPermission && hideIfDenied && !asChild) {
    return null;
  }

  const hiddenViaSlot = !hasPermission && hideIfDenied && asChild;
  const isDisabled = loading || disabled || !hasPermission;
  const isLink = variant === 'link';
  const isFlat =
    isLink ||
    variant === 'ghost' ||
    variant === 'danger-ghost' ||
    variant === 'tonal' ||
    variant === 'filled';
  const isDangerVariant =
    variant === 'destructive' ||
    variant === 'danger-outline' ||
    variant === 'danger-dashed' ||
    variant === 'danger-ghost';
  const iconLeft = leftIcon ?? leading;
  const iconRight = rightIcon ?? trailing;
  const isFull = fullWidth || full;

  const isIconBox = square || shape === 'square' || shape === 'circle';
  const isCircleOrPill = pill || shape === 'circle' || shape === 'round';

  const resolvedSizeClass = isIconBox
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
      if (typeof confirm === 'object' && confirm.onConfirm) {
        await confirm.onConfirm();
      } else {
        onClick?.({} as React.MouseEvent<HTMLButtonElement>);
      }
    } catch {}
  };

  const isRedundantTooltip = Boolean(
    tooltip &&
      typeof children === 'string' &&
      children.trim().toLowerCase() === tooltip.trim().toLowerCase()
  );

  const Comp = asChild ? Slot : 'button';

  const coreBtn = (
    <Comp
      ref={ref}
      {...props}
      {...(componentId ? { 'data-component-id': componentId } : {})}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out whitespace-nowrap select-none',
        'inline-flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        !isFlat && 'shadow-[var(--shadow-control)]',
        isCircleOrPill ? 'rounded-full' : 'rounded-[var(--radius-control)]',
        wide && !isIconBox && 'min-w-[180px] px-8',
        'active:not-disabled:scale-[0.985] active:not-disabled:translate-y-[0.5px] motion-reduce:transform-none',
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        hiddenViaSlot && 'hidden pointer-events-none',
        isFull && 'w-full',
        variantClasses[variant],
        resolvedSizeClass,
        className
      )}
    >
      {asChild ? (
        children
      ) : loading ? (
        <span className="inline-flex items-center justify-center gap-2 flex-1">
          <Loader className={cn('animate-spin shrink-0', loaderSizeClasses[size])} />
          {loadingText && <span className="leading-none lopes-trim-cap">{loadingText}</span>}
        </span>
      ) : (
        <>
          {iconLeft && (
            <span className={cn('flex shrink-0 items-center justify-center', iconSizeClasses[size])}>
              {iconLeft}
            </span>
          )}
          {children && <span className="leading-none lopes-trim-cap">{children}</span>}
          {iconRight && (
            <span className={cn('flex shrink-0 items-center justify-center', iconSizeClasses[size])}>
              {iconRight}
            </span>
          )}
        </>
      )}
    </Comp>
  );

  const placement = mapTooltipPlacement(tooltipPosition);

  const btn =
    tooltip && !isRedundantTooltip ? (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{coreBtn}</TooltipTrigger>
          <TooltipContent side={placement.side} align={placement.align} className="max-w-[280px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      coreBtn
    );

  if (!confirm) return btn;

  const confirmOpts: ConfirmOptions =
    typeof confirm === 'object'
      ? confirm
      : {
          title: 'Confirmar ação',
          description: 'Tem certeza de que deseja prosseguir?',
          confirmLabel: 'Confirmar',
          cancelLabel: 'Cancelar',
          variant: isDangerVariant ? 'danger' : 'info',
        };

  return (
    <>
      {btn}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={confirmOpts.title ?? 'Confirmar ação'}
        description={confirmOpts.description ?? 'Tem certeza de que deseja prosseguir?'}
        confirmLabel={confirmOpts.confirmLabel ?? 'Confirmar'}
        cancelLabel={confirmOpts.cancelLabel ?? 'Cancelar'}
        variant={confirmOpts.variant ?? (isDangerVariant ? 'danger' : 'info')}
      />
    </>
  );
});

Button.displayName = 'Button';

export default Button;
