import * as React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse motion-reduce:animate-none rounded-[var(--radius-control)] bg-muted', className)}
      {...props}
    />
  );
}
