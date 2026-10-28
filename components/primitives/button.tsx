import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        primary:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        solid:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        destructive:
          'bg-red-600 text-white shadow-xs hover:bg-red-500 active:bg-red-700',
        danger:
          'bg-red-600 text-white shadow-xs hover:bg-red-500 active:bg-red-700',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/80',
        secondary:
          'bg-muted text-foreground hover:bg-muted/80 active:bg-muted/90',
        ghost:
          'bg-transparent hover:bg-muted text-foreground',
        link:
          'text-primary underline-offset-4 hover:underline bg-transparent',
        success:
          'bg-emerald-600 text-white shadow-xs hover:bg-emerald-500 active:bg-emerald-700',
        'success-outline':
          'border border-emerald-500/40 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 hover:bg-emerald-100/60',
        warning:
          'bg-amber-500 text-white shadow-xs hover:bg-amber-400 active:bg-amber-600',
        'warning-outline':
          'border border-amber-500/40 bg-amber-50/50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 hover:bg-amber-100/60',
        info:
          'bg-sky-500 text-white shadow-xs hover:bg-sky-400 active:bg-sky-600',
        'info-outline':
          'border border-sky-500/40 bg-sky-50/50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 hover:bg-sky-100/60',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-8 rounded-lg px-3 text-xs',
        md: 'h-9 px-4 py-2 text-sm',
        lg: 'h-10 rounded-xl px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

import { useAccessControl } from '../useAccessControl';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, componentId, hideIfDenied = true, disabled, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || !hasPermission}
        {...props}
        {...(componentId ? { 'data-component-id': componentId } : {})}
      />
    );
  }
);
Button.displayName = 'PrimitiveButton';
