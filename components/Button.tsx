'use client';

import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/utils/cn';
import ConfirmDialog, { type ConfirmDialogVariant } from './ConfirmDialog';
import { useAccessControl } from './useAccessControl';

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
    | 'ghost'
    | 'destructive'
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
  /** Pill shape — rounded-full */
  pill?: boolean;
  /** Icon-only mode — equal square padding, no min-w */
  square?: boolean;
  /** Hover tooltip */
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
  ghost: 'bg-transparent hover:bg-surface-hover text-surface-foreground',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
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

const tooltipPositionClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  'top-left': 'bottom-full left-0 mb-2',
  'top-right': 'bottom-full right-0 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  'bottom-left': 'top-full left-0 mt-2',
  'bottom-right': 'top-full right-0 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

// ── Main Component ────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    componentId,
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
    pill = false,
    square = false,
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
  const iconLeft = leftIcon ?? leading;
  const iconRight = rightIcon ?? trailing;
  const isFull = fullWidth || full;

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

  const btn = (
    <button
      ref={ref}
      {...props}
      {...(componentId ? { 'data-component-id': componentId } : {})}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'transition-colors duration-150 whitespace-nowrap',
        'inline-flex items-center justify-center',
        !isLink && 'shadow-sm shadow-zinc-900/10',
        pill ? 'rounded-full' : 'rounded-md',
        'active:not-disabled:translate-y-[2px]',
        isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
        isFull && 'w-full',
        tooltip && !isRedundantTooltip && 'group relative',
        variantClasses[variant],
        resolvedSizeClass,
        className
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center flex-1">
          <Loader className={cn('animate-spin', loaderSizeClasses[size])} />
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
      {tooltip && !isRedundantTooltip && (
        <span
          className={cn(
            'hidden sm:block pointer-events-none absolute w-max max-w-[280px] text-left leading-normal rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-xs px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-[100] shadow-xl border border-zinc-700/50',
            tooltipPositionClasses[tooltipPosition] ?? tooltipPositionClasses.top
          )}
        >
          {tooltip}
        </span>
      )}
    </button>
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
          variant: variant === 'destructive' ? 'danger' : 'info',
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
        variant={confirmOpts.variant ?? (variant === 'destructive' ? 'danger' : 'info')}
      />
    </>
  );
});

Button.displayName = 'Button';

export default Button;
