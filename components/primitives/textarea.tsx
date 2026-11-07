'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';
import { useAccessControl } from '../useAccessControl';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Identificador de controle de acesso */
  componentId?: string;
  /** Se true, oculta o campo quando o acesso for negado ao invés de desabilitá-lo */
  hideIfDenied?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, componentId, hideIfDenied = false, disabled, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    return (
      <textarea
        ref={ref}
        disabled={disabled || !hasPermission}
        data-slot="textarea"
        data-component-id={componentId}
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--radius-control)] border border-input-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-[var(--shadow-control)] transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/12 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
