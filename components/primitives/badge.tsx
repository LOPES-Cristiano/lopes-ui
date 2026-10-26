import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
        primary:
          'border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
        danger:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
        success:
          'border-transparent bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        warning:
          'border-transparent bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        info:
          'border-transparent bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
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
