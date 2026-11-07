import * as React from 'react';
import { cn } from '../../utils/cn';
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
          'flex h-10 w-full rounded-[var(--radius-control)] border border-input-border bg-input px-3 py-1.5 text-sm shadow-[var(--shadow-control)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/12 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus-visible:ring-danger/15 focus-visible:border-danger',
          className
        )}
        ref={ref}
        disabled={disabled || !hasPermission}
        aria-invalid={error ? 'true' : undefined}
        {...props}
        {...(componentId ? { 'data-component-id': componentId } : {})}
      />
    );
  }
);
Input.displayName = 'Input';
