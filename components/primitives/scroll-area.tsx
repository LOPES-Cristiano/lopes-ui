'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ScrollAreaPrimitiveProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  viewportClassName?: string;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaPrimitiveProps>(
  ({ className, viewportClassName, orientation = 'vertical', children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div
        data-slot="scroll-area-viewport"
        className={cn(
          'h-full w-full rounded-[inherit]',
          orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
          orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
          orientation === 'both' && 'overflow-auto',
          '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/80 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600',
          viewportClassName
        )}
      >
        {children}
      </div>
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
