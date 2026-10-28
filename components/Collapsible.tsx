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
  keepMounted?: boolean;
};

export function CollapsibleContent({
  keepMounted = false,
  className,
  children,
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
      hidden={!ctx.open}
      className={cn(
        "grid transition-all duration-200 ease-in-out",
        ctx.open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
      {...props}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

export default Collapsible;
