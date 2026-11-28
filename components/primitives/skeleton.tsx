import * as React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('lopes-shimmer-bone rounded-[var(--radius-control)]', className)}
      {...props}
    />
  );
}
