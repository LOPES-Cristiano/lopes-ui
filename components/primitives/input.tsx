import * as React from 'react';
import { cn } from '@/utils/cn';

import { useAccessControl } from '../useAccessControl';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  componentId?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, componentId, disabled, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500',
          className
        )}
        ref={ref}
        disabled={disabled || !hasPermission}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
