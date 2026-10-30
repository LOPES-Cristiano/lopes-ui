'use client';

import React, { useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader } from 'lucide-react';
import { cn } from '@/utils/cn';
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
  secondary: 'bg-surface-muted text-surface-foreground hover:bg-surface-hover',
  outline: 'bg-transparent border border-border text-surface-foreground hover:bg-surface-hover',
  dashed:
    'bg-transparent border border-dashed border-border text-surface-foreground hover:border-primary hover:text-primary',
  tonal:
    'bg-primary/12 text-primary hover:bg-primary/20 border border-transparent',
  filled:
    'bg-primary/12 text-primary hover:bg-primary/20 border border-transparent',
  ghost: 'bg-transparent hover:bg-surface-hover text-surface-foreground',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
  'danger-outline':
    'bg-transparent border border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/40',
  'danger-dashed':
    'bg-transparent border border-dashed border-red-400 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/40',
  'danger-ghost':
    'bg-transparent text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500',
  'success-outline':
    'bg-transparent border border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-950/40',
  warning: 'bg-amber-500 text-white hover:bg-amber-400',
  'warning-outline':
    'bg-transparent border border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950/40',
  info: 'bg-sky-500 text-white hover:bg-sky-400',
  'info-outline':
    'bg-transparent border border-sky-400 text-sky-700 hover:bg-sky-50 dark:border-sky-600 dark:text-sky-400 dark:hover:bg-sky-950/40',
  link: 'bg-transparent text-primary hover:underline',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm min-w-[72px] gap-1.5',
  md: 'px-4 py-2 text-base min-w-[96px] gap-2',
  lg: 'px-6 py-3 text-lg min-w-[128px] gap-2.5',
};

const squareSizeClasses = {
  sm: 'p-1.5 w-8 h-8',
  md: 'p-2 w-10 h-10',
  lg: 'p-2.5 w-12 h-12',
};

const linkSizeClasses = {
  sm: 'px-1 py-0.5 text-sm min-w-0 gap-1.5',
  md: 'px-1 py-0.5 text-base min-w-0 gap-2',
  lg: 'px-1 py-0.5 text-lg min-w-0 gap-2.5',
};

const iconSizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const loaderSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
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
  if (!hasPermission && hideIfDenied) {
    return null;
  }

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
        'transition-colors duration-150 whitespace-nowrap',
        'inline-flex items-center justify-center',
        !isFlat && 'shadow-sm shadow-zinc-900/10',
        isCircleOrPill ? 'rounded-full' : 'rounded-md',
        wide && !isIconBox && 'min-w-[180px] px-8',
        'active:not-disabled:translate-y-[2px]',
        isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
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
          {loadingText && <span className="leading-none">{loadingText}</span>}
        </span>
      ) : (
        <>
          {iconLeft && (
            <span className={cn('flex shrink-0 items-center justify-center', iconSizeClasses[size])}>
              {iconLeft}
            </span>
          )}
          {children && <span className="leading-none">{children}</span>}
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
