'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/utils/cn';
import { useAccessControl } from '../useAccessControl';

export type SwitchPrimitiveProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  /** Identificador de controle de acesso */
  componentId?: string;
  /** Se true, oculta o switch quando o acesso for negado ao invés de desabilitá-lo */
  hideIfDenied?: boolean;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchPrimitiveProps
>(({ className, componentId, hideIfDenied = false, disabled, ...props }, ref) => {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  return (
    <SwitchPrimitives.Root
      disabled={disabled || !hasPermission}
      data-component-id={componentId}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-zinc-200 dark:data-[state=unchecked]:bg-zinc-700',
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-background data-[state=checked]:bg-primary-foreground shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
