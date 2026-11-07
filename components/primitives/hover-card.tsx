'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

type HoverCardContextValue = {
  open: boolean;
  getTriggerElement: () => HTMLElement | null;
  setTriggerElement: (node: HTMLElement | null) => void;
  handleEnter: () => void;
  handleLeave: () => void;
};

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

export interface HoverCardRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  children?: React.ReactNode;
}

function HoverCard({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 200,
  closeDelay = 150,
  children,
}: HoverCardRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  const clearTimers = React.useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handleEnter = React.useCallback(() => {
    clearTimers();
    openTimerRef.current = setTimeout(() => setOpen(true), openDelay);
  }, [clearTimers, openDelay, setOpen]);

  const handleLeave = React.useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
  }, [clearTimers, closeDelay, setOpen]);

  const getTriggerElement = React.useCallback(() => triggerRef.current, []);
  const setTriggerElement = React.useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  const ctxValue = React.useMemo<HoverCardContextValue>(
    () => ({
      open,
      getTriggerElement,
      setTriggerElement,
      handleEnter,
      handleLeave,
    }),
    [open, getTriggerElement, setTriggerElement, handleEnter, handleLeave]
  );

  return (
    <HoverCardContext.Provider value={ctxValue}>
      {children}
    </HoverCardContext.Provider>
  );
}

export interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const HoverCardTrigger = React.forwardRef<HTMLElement, HoverCardTriggerProps>(
  ({ asChild = false, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
    const ctx = React.useContext(HoverCardContext);
    const setTriggerElement = ctx?.setTriggerElement;
    const Comp = (asChild ? Slot : 'span') as React.ElementType;

    const mergedRef = React.useCallback(
      (node: HTMLElement | null) => {
        setTriggerElement?.(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [setTriggerElement, ref]
    );

    return (
      <Comp
        ref={mergedRef}
        data-slot="hover-card-trigger"
        data-state={ctx?.open ? 'open' : 'closed'}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
          ctx?.handleEnter();
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
          ctx?.handleLeave();
          onMouseLeave?.(e);
        }}
        onFocus={(e: React.FocusEvent<HTMLElement>) => {
          ctx?.handleEnter();
          onFocus?.(e);
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          ctx?.handleLeave();
          onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);
HoverCardTrigger.displayName = 'HoverCardTrigger';

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = 'center', side = 'bottom', sideOffset = 6, style, ...props }, ref) => {
    const ctx = React.useContext(HoverCardContext);
    const getTriggerElement = ctx?.getTriggerElement;
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const updatePosition = React.useCallback(() => {
      const trigger = getTriggerElement?.();
      const panel = contentRef.current;
      if (!trigger || !panel) return;

      const tRect = trigger.getBoundingClientRect();
      const pRect = panel.getBoundingClientRect();
      const margin = 8;

      let top = tRect.bottom + sideOffset;
      let left = tRect.left + tRect.width / 2 - pRect.width / 2;

      if (side === 'top') {
        top = tRect.top - pRect.height - sideOffset;
      } else if (side === 'left') {
        left = tRect.left - pRect.width - sideOffset;
        top = tRect.top + tRect.height / 2 - pRect.height / 2;
      } else if (side === 'right') {
        left = tRect.right + sideOffset;
        top = tRect.top + tRect.height / 2 - pRect.height / 2;
      }

      if (side === 'top' || side === 'bottom') {
        if (align === 'start') left = tRect.left;
        if (align === 'end') left = tRect.right - pRect.width;
      }

      left = Math.max(margin, Math.min(left, window.innerWidth - pRect.width - margin));
      top = Math.max(margin, Math.min(top, window.innerHeight - pRect.height - margin));

      setPos({ top, left });
    }, [align, getTriggerElement, side, sideOffset]);

    React.useLayoutEffect(() => {
      if (!ctx?.open) return;
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }, [ctx?.open, updatePosition]);

    const mergedContentRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    if (!ctx?.open || typeof document === 'undefined') return null;

    return createPortal(
      <div
        ref={mergedContentRef}
        data-slot="hover-card-content"
        data-floating-open="true"
        data-state="open"
        data-side={side}
        onMouseEnter={ctx.handleEnter}
        onMouseLeave={ctx.handleLeave}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          ...style,
        }}
        className={cn(
          'z-[9200] pointer-events-auto w-72 max-w-[calc(100vw-1.5rem)] rounded-[var(--radius-card)] border border-border bg-popover p-4 text-popover-foreground shadow-[var(--shadow-floating)] outline-none animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none',
          className
        )}
        {...props}
      />,
      document.body
    );
  }
);
HoverCardContent.displayName = 'HoverCardContent';

export { HoverCard, HoverCardTrigger, HoverCardContent };
