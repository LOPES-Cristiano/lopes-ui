'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
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
          'flex min-h-[80px] w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
