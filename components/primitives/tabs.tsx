'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { useAccessControl } from '../useAccessControl';

type TabsContextValue = {
  value: string;
  orientation: 'horizontal' | 'vertical';
  onValueChange: (val: string) => void;
  baseId: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsPrimitiveRootProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  componentId?: string;
  hideIfDenied?: boolean;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsPrimitiveRootProps>(
  (
    {
      value: controlledValue,
      defaultValue = '',
      onValueChange,
      orientation = 'horizontal',
      componentId,
      hideIfDenied = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const baseId = React.useId();
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);
    const value = controlledValue ?? uncontrolled;

    const handleValueChange = React.useCallback(
      (next: string) => {
        if (controlledValue === undefined) setUncontrolled(next);
        onValueChange?.(next);
      },
      [controlledValue, onValueChange]
    );

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    return (
      <TabsContext.Provider value={{ value, orientation, onValueChange: handleValueChange, baseId }}>
        <div
          ref={ref}
          data-slot="tabs"
          data-component-id={componentId}
          data-orientation={orientation}
          className={cn(!hasPermission && 'opacity-50 pointer-events-none', className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    const listRef = React.useRef<HTMLDivElement | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || !listRef.current) return;

      const triggers = Array.from(
        listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')
      );
      if (triggers.length === 0) return;

      const currentIndex = triggers.indexOf(document.activeElement as HTMLButtonElement);
      if (currentIndex === -1) return;

      const isHorizontal = (ctx?.orientation ?? 'horizontal') === 'horizontal';
      let nextIndex = -1;

      if ((isHorizontal && e.key === 'ArrowRight') || (!isHorizontal && e.key === 'ArrowDown')) {
        nextIndex = (currentIndex + 1) % triggers.length;
      } else if ((isHorizontal && e.key === 'ArrowLeft') || (!isHorizontal && e.key === 'ArrowUp')) {
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = triggers.length - 1;
      }

      if (nextIndex !== -1) {
        e.preventDefault();
        const target = triggers[nextIndex];
        target?.focus();
        const tabValue = target?.getAttribute('data-value');
        if (tabValue && ctx) ctx.onValueChange(tabValue);
      }
    };

    return (
      <div
        ref={(node) => {
          listRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role="tablist"
        aria-orientation={ctx?.orientation ?? 'horizontal'}
        data-slot="tabs-list"
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 text-zinc-500 dark:text-zinc-400',
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  componentId?: string;
  hideIfDenied?: boolean;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, componentId, hideIfDenied = true, onClick, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    const effectiveDisabled = Boolean(disabled || !hasPermission);
    const isActive = ctx?.value === value;
    const triggerId = ctx ? `${ctx.baseId}-trigger-${value}` : undefined;
    const contentId = ctx ? `${ctx.baseId}-content-${value}` : undefined;

    return (
      <button
        ref={ref}
        id={triggerId}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={contentId}
        tabIndex={isActive ? 0 : -1}
        disabled={effectiveDisabled}
        data-slot="tabs-trigger"
        data-component-id={componentId}
        data-value={value}
        data-state={isActive ? 'active' : 'inactive'}
        onClick={(e) => {
          if (!effectiveDisabled) ctx?.onValueChange(value);
          onClick?.(e);
        }}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100 cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount = false, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    const isActive = ctx?.value === value;
    const triggerId = ctx ? `${ctx.baseId}-trigger-${value}` : undefined;
    const contentId = ctx ? `${ctx.baseId}-content-${value}` : undefined;

    if (!forceMount && !isActive) return null;

    return (
      <div
        ref={ref}
        id={contentId}
        role="tabpanel"
        aria-labelledby={triggerId}
        tabIndex={0}
        hidden={!isActive}
        data-slot="tabs-content"
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
