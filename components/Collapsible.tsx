"use client";

import React, { createContext, useContext, useId, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils/cn";

type CollapsibleContextValue = {
  open: boolean;
  disabled?: boolean;
  contentId: string;
  toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export type CollapsibleProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled,
  className,
  children,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const contentId = useId();
  const open = controlledOpen ?? uncontrolledOpen;

  const toggle = () => {
    if (disabled) return;
    const next = !open;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <CollapsibleContext.Provider value={{ open, disabled, contentId, toggle }}>
      <div
        data-slot="collapsible"
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export type CollapsibleTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export function CollapsibleTrigger({
  asChild = false,
  className,
  onClick,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("CollapsibleTrigger must be used within Collapsible");

  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-expanded={ctx.open}
      aria-controls={ctx.contentId}
      data-state={ctx.open ? "open" : "closed"}
      disabled={ctx.disabled}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        ctx.toggle();
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

export type CollapsibleContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Keep content in DOM so open/close height transitions run smoothly (default: true) */
  keepMounted?: boolean;
};

export function CollapsibleContent({
  keepMounted = true,
  className,
  children,
  style,
  ...props
}: CollapsibleContentProps) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("CollapsibleContent must be used within Collapsible");

  if (!keepMounted && !ctx.open) {
    return null;
  }

  return (
    <div
      id={ctx.contentId}
      data-slot="collapsible-content"
      data-state={ctx.open ? "open" : "closed"}
      aria-hidden={!ctx.open}
      inert={!ctx.open || undefined}
      style={{
        gridTemplateRows: ctx.open ? "1fr" : "0fr",
        ...style,
      }}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        ctx.open
          ? "opacity-100"
          : "opacity-0 pointer-events-none select-none",
        className,
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export default Collapsible;
