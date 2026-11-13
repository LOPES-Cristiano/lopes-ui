'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';
import { useAccessControl } from '../useAccessControl';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
  success?: boolean;
  /** Identificador de controle de acesso */
  componentId?: string;
  /** Se true, oculta o campo quando o acesso for negado ao invés de desabilitá-lo */
  hideIfDenied?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, componentId, hideIfDenied = false, disabled, ...props }, ref) => {
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

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    return (
      <textarea
        ref={ref}
        disabled={disabled || !hasPermission}
        aria-invalid={error ? 'true' : undefined}
        data-slot="textarea"
        data-component-id={componentId}
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--radius-control)] border border-input-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-[var(--shadow-control)] transition-[border-color,box-shadow,background-color] duration-150 hover:border-border-strong focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/12 disabled:cursor-not-allowed disabled:opacity-50',
          success && !error && 'border-success/70 hover:border-success focus-visible:ring-success/15 focus-visible:border-success',
          error && 'border-danger bg-danger/[0.02] hover:border-danger focus-visible:ring-danger/15 focus-visible:border-danger',
          shaking && 'animate-lopes-shake',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
