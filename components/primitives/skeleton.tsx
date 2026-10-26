import * as React from 'react';
import { cn } from '@/utils/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-muted/70 dark:bg-zinc-800', className)}
      {...props}
    />
  );
}
