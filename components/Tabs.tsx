"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";
import {
  Tabs as PrimitiveTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsPrimitiveRootProps,
} from "./primitives/tabs";

export type TabsItem = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  content?: React.ReactNode;
  /** Access-control identifier for this tab */
  componentId?: string;
  /** If false, disables the tab instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type TabsVariant = "pills" | "underline" | "enclosed" | "lifted" | "bordered";
export type TabsSize = "sm" | "md" | "lg";

export type TabsProps = TabsPrimitiveRootProps & {
  /** Declarative list of tabs (optional — you can also compose TabsList/TabsTrigger/TabsContent) */
  items?: TabsItem[];
  variant?: TabsVariant;
  size?: TabsSize;
  /** Render the tab bar above or below the tab panels (daisyUI tabs-bottom support) */
  position?: "top" | "bottom";
  fullWidth?: boolean;
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

const LIST_VARIANT_CLS: Record<TabsVariant, string> = {
  pills:
    "w-fit self-start rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 gap-1 text-zinc-500 dark:text-zinc-400",
  underline:
    "w-full justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent p-0 gap-6 text-zinc-500 dark:text-zinc-400",
  bordered:
    "w-full justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent p-0 gap-2 text-zinc-500 dark:text-zinc-400",
  enclosed:
    "w-full justify-start h-auto rounded-t-xl border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-1.5 gap-1.5 text-zinc-500 dark:text-zinc-400",
  lifted:
    "w-full justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-1 pt-1 pb-0 gap-1.5 text-zinc-500 dark:text-zinc-400",
};

const TRIGGER_VARIANT_CLS: Record<TabsVariant, string> = {
  pills:
    "rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100",
  underline:
    "-mb-px rounded-none border-b-2 border-transparent px-1 pb-2.5 pt-1.5 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-none",
  bordered:
    "-mb-px rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-1.5 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-zinc-100",
  enclosed:
    "rounded-lg border border-transparent data-[state=active]:border-zinc-200/80 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-2xs dark:data-[state=active]:border-zinc-700 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100",
  lifted:
    "-mb-px rounded-t-xl rounded-b-none border border-transparent px-4 py-2 data-[state=active]:border-zinc-200 data-[state=active]:border-b-white data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-none dark:data-[state=active]:border-zinc-800 dark:data-[state=active]:border-b-zinc-900 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-zinc-100",
};

const SIZE_CLS: Record<TabsSize, string> = {
  sm: "text-xs px-2.5 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

export default function Tabs({
  items,
  variant = "pills",
  size = "md",
  position = "top",
  fullWidth = false,
  orientation = "horizontal",
  defaultValue,
  value: controlledValue,
  onValueChange,
  componentId,
  hideIfDenied = true,
  listClassName,
  triggerClassName,
  contentClassName,
  className,
  children,
  ...props
}: TabsProps) {
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const visibleItems = useMemo(() => {
    if (!items) return undefined;
    return items.filter((item) => {
      const allowed = !item.componentId || canAccess(item.componentId);
      if (!allowed && item.hideIfDenied !== false) return false;
      return true;
    });
  }, [items, canAccess]);

  const accessibleItems = useMemo(() => {
    if (!visibleItems) return undefined;
    return visibleItems.filter(
      (item) => !item.disabled && (!item.componentId || canAccess(item.componentId)),
    );
  }, [visibleItems, canAccess]);

  const resolvedDefault =
    defaultValue ?? (controlledValue === undefined ? accessibleItems?.[0]?.value ?? visibleItems?.[0]?.value : undefined);

  const [internalValue, setInternalValue] = useState<string>(resolvedDefault ?? "");
  const currentValue = controlledValue ?? internalValue;

  // Auto-redirect active tab if current tab is inaccessible
  useEffect(() => {
    if (!accessibleItems || accessibleItems.length === 0) return;
    const isCurrentAccessible = accessibleItems.some((item) => item.value === currentValue);
    if (!isCurrentAccessible) {
      const fallback = accessibleItems[0].value;
      if (controlledValue === undefined) setInternalValue(fallback);
      onValueChange?.(fallback);
    }
  }, [accessibleItems, currentValue, controlledValue, onValueChange]);

  if (!hasRootPermission && hideIfDenied) return null;

  const isVertical = orientation === "vertical";

  const handleTabChange = (next: string) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  if (!visibleItems || visibleItems.length === 0) {
    if (items && items.length > 0) return null;
    return (
      <PrimitiveTabs
        orientation={orientation}
        defaultValue={resolvedDefault}
        value={controlledValue}
        onValueChange={onValueChange}
        componentId={componentId}
        hideIfDenied={hideIfDenied}
        className={cn(isVertical && "flex gap-4", className)}
        {...props}
      >
        {children}
      </PrimitiveTabs>
    );
  }

  return (
    <PrimitiveTabs
      orientation={orientation}
      value={currentValue}
      onValueChange={handleTabChange}
      componentId={componentId}
      hideIfDenied={hideIfDenied}
      className={cn(
        isVertical
          ? "flex items-start gap-4"
          : position === "bottom"
            ? "flex flex-col-reverse"
            : "flex flex-col",
        className
      )}
      {...props}
    >
      <TabsList
        className={cn(
          LIST_VARIANT_CLS[variant],
          isVertical
            ? "flex h-auto flex-col items-stretch justify-start shrink-0"
            : fullWidth
              ? "flex w-full"
              : "inline-flex",
          listClassName,
        )}
      >
        {visibleItems.map((item) => {
          const itemAllowed = !item.componentId || canAccess(item.componentId);
          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              componentId={item.componentId}
              hideIfDenied={item.hideIfDenied}
              disabled={Boolean(item.disabled || !itemAllowed)}
              className={cn(
                TRIGGER_VARIANT_CLS[variant],
                SIZE_CLS[size],
                fullWidth && !isVertical && "flex-1",
                isVertical && "justify-start",
                triggerClassName,
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== null && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-zinc-200/80 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                  {item.badge}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {visibleItems.map((item) => {
        const itemAllowed = !item.componentId || canAccess(item.componentId);
        if (!itemAllowed) return null;
        return item.content !== undefined ? (
          <TabsContent
            key={item.value}
            value={item.value}
            className={cn(isVertical && "mt-0 flex-1 min-w-0", contentClassName)}
          >
            {item.content}
          </TabsContent>
        ) : null;
      })}
      {children}
    </PrimitiveTabs>
  );
}

export { TabsList, TabsTrigger, TabsContent };
