'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';
import { useAccessControl } from '../useAccessControl';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  success?: boolean;
  componentId?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, componentId, disabled, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);
    const prevErrorRef = React.useRef(Boolean(error));
    const [shaking, setShaking] = React.useState(false);

    React.useEffect(() => {
      const hasError = Boolean(error);
      if (hasError && !prevErrorRef.current) {
        setShaking(true);
        const timer = setTimeout(() => setShaking(false), 350);
        prevErrorRef.current = hasError;
        return () => clearTimeout(timer);
      }
      prevErrorRef.current = hasError;
    }, [error]);

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[var(--radius-control)] border border-input-border bg-input px-3 py-1.5 text-sm shadow-[var(--shadow-control)] transition-[border-color,box-shadow,background-color] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-border-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/12 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
          success && !error && 'border-success/70 hover:border-success focus-visible:ring-success/15 focus-visible:border-success',
          error && 'border-danger bg-danger/[0.02] hover:border-danger focus-visible:ring-danger/15 focus-visible:border-danger',
          shaking && 'animate-lopes-shake',
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
