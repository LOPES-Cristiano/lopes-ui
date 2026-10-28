'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/utils/cn';

type HoverCardContextValue = {
  open: boolean;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
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

  const clearTimers = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleEnter = () => {
    clearTimers();
    openTimerRef.current = setTimeout(() => setOpen(true), openDelay);
  };

  const handleLeave = () => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
  };

  React.useEffect(() => clearTimers, []);

  return (
    <HoverCardContext.Provider value={{ open, triggerRef, handleEnter, handleLeave }}>
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
    const Comp = (asChild ? Slot : 'span') as React.ElementType;

    return (
      <Comp
        ref={(node: HTMLElement | null) => {
          if (ctx) ctx.triggerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
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
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const updatePosition = React.useCallback(() => {
      const trigger = ctx?.triggerRef.current;
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
    }, [align, ctx?.triggerRef, side, sideOffset]);

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

    if (!ctx?.open || typeof document === 'undefined') return null;

    return createPortal(
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="hover-card-content"
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
          'z-[99999] w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-zinc-100 shadow-xl outline-none animate-in fade-in-0 zoom-in-95 duration-150',
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
