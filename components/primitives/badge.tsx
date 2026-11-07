import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-muted text-foreground',
        primary:
          'border-brand-border/60 bg-brand-soft text-brand-soft-foreground',
        brand:
          'border-brand-border/60 bg-brand-soft text-brand-soft-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-danger-border/60 bg-danger-soft text-danger-soft-foreground',
        danger:
          'border-danger-border/60 bg-danger-soft text-danger-soft-foreground',
        success:
          'border-success-border/60 bg-success-soft text-success-soft-foreground',
        warning:
          'border-warning-border/60 bg-warning-soft text-warning-soft-foreground',
        info:
          'border-info-border/60 bg-info-soft text-info-soft-foreground',
        violet:
          'border-transparent bg-violet-50 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
        pink:
          'border-transparent bg-pink-50 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300',
        orange:
          'border-transparent bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
        teal:
          'border-transparent bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
