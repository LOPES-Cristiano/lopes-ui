import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useAccessControl } from '../useAccessControl';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        primary:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        brand:
          'bg-brand text-brand-foreground shadow-xs hover:bg-brand-hover',
        solid:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        destructive:
          'bg-danger text-danger-foreground shadow-xs hover:bg-danger-hover',
        danger:
          'bg-danger text-danger-foreground shadow-xs hover:bg-danger-hover',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/80',
        secondary:
          'bg-muted text-foreground hover:bg-muted/80 active:bg-muted/90',
        ghost:
          'bg-transparent hover:bg-muted text-foreground',
        link:
          'text-primary underline-offset-4 hover:underline bg-transparent',
        success:
          'bg-success text-success-foreground shadow-xs hover:bg-success-hover',
        'success-outline':
          'border border-success-border bg-success-soft text-success-soft-foreground hover:bg-success-soft/80',
        warning:
          'bg-warning text-warning-foreground shadow-xs hover:bg-warning-hover',
        'warning-outline':
          'border border-warning-border bg-warning-soft text-warning-soft-foreground hover:bg-warning-soft/80',
        info:
          'bg-info text-info-foreground shadow-xs hover:bg-info-hover',
        'info-outline':
          'border border-info-border bg-info-soft text-info-soft-foreground hover:bg-info-soft/80',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

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

    if (!hasPermission && hideIfDenied && !asChild) {
      return null;
    }

    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          !hasPermission && hideIfDenied && asChild && 'hidden'
        )}
        ref={ref}
        disabled={disabled || !hasPermission}
        {...props}
        {...(componentId ? { 'data-component-id': componentId } : {})}
      />
    );
  }
);
Button.displayName = 'PrimitiveButton';
