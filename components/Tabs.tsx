"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "../utils/cn";
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
  /** Allow closing this tab when variant="editable-card" or onRemove is provided */
  closable?: boolean;
  content?: React.ReactNode;
  /** Access-control identifier for this tab */
  componentId?: string;
  /** If false, disables the tab instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type TabsVariant =
  | "pills"
  | "underline"
  | "enclosed"
  | "lifted"
  | "bordered"
  | "card"
  | "editable-card";

export type TabsSize = "sm" | "md" | "lg";

export type TabsProps = TabsPrimitiveRootProps & {
  /** Declarative list of tabs (optional — you can also compose TabsList/TabsTrigger/TabsContent) */
  items?: TabsItem[];
  variant?: TabsVariant;
  size?: TabsSize;
  /** Render the tab bar above or below the tab panels (daisyUI tabs-bottom support) */
  position?: "top" | "bottom";
  fullWidth?: boolean;
  /** Ant Design editable-card: callback triggered when clicking the "+" add tab button */
  onAdd?: () => void;
  /** Ant Design editable-card: callback triggered when clicking a tab's "×" close button */
  onRemove?: (value: string) => void;
  /** Accessible label for the "+" add tab button */
  addLabel?: string;
  /** Ant Design tabBarExtraContent: extra actions/elements rendered on the right end of the tab bar */
  tabBarExtraContent?: React.ReactNode;
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

const LIST_VARIANT_CLS: Record<TabsVariant, string> = {
  pills:
    "w-fit max-w-full overflow-x-auto no-scrollbar self-start rounded-[var(--radius-card)] bg-surface-muted p-1 gap-1 text-muted-foreground",
  underline:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-border bg-transparent p-0 gap-4 sm:gap-6 text-muted-foreground",
  bordered:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-border bg-transparent p-0 gap-1.5 sm:gap-2 text-muted-foreground",
  enclosed:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-t-[var(--radius-card)] border-b border-border bg-surface-muted/60 p-1.5 gap-1.5 text-muted-foreground",
  lifted:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-border bg-transparent px-1 pt-1 pb-0 gap-1.5 text-muted-foreground",
  card:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-border bg-transparent p-0 gap-1 text-muted-foreground",
  "editable-card":
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-border bg-transparent p-0 gap-1 text-muted-foreground",
};

const TRIGGER_VARIANT_CLS: Record<TabsVariant, string> = {
  pills:
    "rounded-[var(--radius-control)] data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[var(--shadow-control)]",
  underline:
    "-mb-px rounded-none border-b-2 border-transparent px-1 pb-2.5 pt-1.5 hover:text-foreground data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:text-brand data-[state=active]:shadow-none",
  bordered:
    "-mb-px rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-1.5 hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
  enclosed:
    "rounded-[var(--radius-control)] border border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[var(--shadow-control)]",
  lifted:
    "-mb-px rounded-t-[var(--radius-card)] rounded-b-none border border-transparent px-4 py-2 data-[state=active]:border-border data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none",
  card:
    "-mb-px rounded-t-[var(--radius-control)] rounded-b-none border border-border bg-surface-muted/80 px-3.5 py-2 hover:text-brand data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:text-brand data-[state=active]:shadow-none",
  "editable-card":
    "-mb-px rounded-t-[var(--radius-control)] rounded-b-none border border-border bg-surface-muted/80 px-3.5 py-2 hover:text-brand data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:text-brand data-[state=active]:shadow-none",
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
  onAdd,
  onRemove,
  addLabel = "Nova aba",
  tabBarExtraContent,
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
    defaultValue ??
    (controlledValue === undefined
      ? (accessibleItems?.[0]?.value ?? visibleItems?.[0]?.value)
      : undefined);

  const [internalValue, setInternalValue] = useState<string>(resolvedDefault ?? "");
  const rawValue = controlledValue ?? internalValue;

  // Derive accessible active tab without synchronous setState inside useEffect
  const isCurrentAccessible =
    !accessibleItems ||
    accessibleItems.length === 0 ||
    accessibleItems.some((item) => item.value === rawValue);

  const effectiveValue = isCurrentAccessible
    ? rawValue
    : (accessibleItems?.[0]?.value ?? rawValue);

  // Notify controlled parent when active tab becomes restricted by RBAC
  useEffect(() => {
    if (
      controlledValue !== undefined &&
      !isCurrentAccessible &&
      effectiveValue &&
      effectiveValue !== controlledValue
    ) {
      onValueChange?.(effectiveValue);
    }
  }, [controlledValue, isCurrentAccessible, effectiveValue, onValueChange]);

  if (!hasRootPermission && hideIfDenied) return null;

  const isVertical = orientation === "vertical";
  const isEditableCard = variant === "editable-card";
  const showAddButton = Boolean(onAdd) && (isEditableCard || Boolean(onAdd));
  const hasBottomBorderBar =
    variant === "underline" ||
    variant === "bordered" ||
    variant === "lifted" ||
    variant === "card" ||
    variant === "editable-card";

  const handleTabChange = (next: string) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  if (!visibleItems || visibleItems.length === 0) {
    if (items && items.length > 0 && !showAddButton) return null;
    if (!items) {
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
  }

  const tabsListNode = (
    <TabsList
      className={cn(
        LIST_VARIANT_CLS[variant],
        tabBarExtraContent && !isVertical && hasBottomBorderBar && "border-b-0 w-auto flex-1",
        isVertical
          ? "flex h-auto w-full sm:w-auto flex-row sm:flex-col items-center sm:items-stretch justify-start shrink-0 overflow-x-auto no-scrollbar"
          : fullWidth
            ? "flex w-full"
            : "inline-flex",
        listClassName,
      )}
    >
      {(visibleItems ?? []).map((item) => {
        const itemAllowed = !item.componentId || canAccess(item.componentId);
        const isDisabled = Boolean(item.disabled || !itemAllowed);
        const canClose =
          !isDisabled &&
          Boolean(onRemove) &&
          (item.closable !== undefined ? item.closable : isEditableCard);

        const triggerNode = (
          <TabsTrigger
            key={canClose ? undefined : item.value}
            value={item.value}
            componentId={item.componentId}
            hideIfDenied={item.hideIfDenied}
            disabled={isDisabled}
            className={cn(
              TRIGGER_VARIANT_CLS[variant],
              SIZE_CLS[size],
              canClose && "pr-8",
              fullWidth && !isVertical && (canClose ? "w-full" : "flex-1"),
              isVertical && "justify-start",
              triggerClassName,
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className="lopes-trim-cap">{item.label}</span>
            {item.badge !== undefined && item.badge !== null && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums text-secondary-foreground">
                {item.badge}
              </span>
            )}
          </TabsTrigger>
        );

        if (!canClose) {
          return triggerNode;
        }

        return (
          <div
            key={item.value}
            role="presentation"
            className={cn(
              "group/tab relative inline-flex items-center",
              fullWidth && !isVertical && "flex-1",
            )}
          >
            {triggerNode}
            <button
              type="button"
              aria-label={`Fechar aba ${typeof item.label === "string" ? item.label : item.value}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(item.value);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      {showAddButton && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={addLabel}
          className={cn(
            "inline-flex min-h-7 min-w-7 items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            variant === "card" || variant === "editable-card"
              ? "-mb-px rounded-t-[var(--radius-control)] border border-border bg-surface-muted/60 px-2.5 py-2 text-muted-foreground hover:text-brand hover:bg-card"
              : "rounded-[var(--radius-control)] px-2 py-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </TabsList>
  );

  return (
    <PrimitiveTabs
      orientation={orientation}
      value={effectiveValue}
      onValueChange={handleTabChange}
      componentId={componentId}
      hideIfDenied={hideIfDenied}
      className={cn(
        isVertical
          ? "flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4"
          : position === "bottom"
            ? "flex flex-col-reverse"
            : "flex flex-col",
        className,
      )}
      {...props}
    >
      {tabBarExtraContent && !isVertical ? (
        <div
          className={cn(
            "flex items-center justify-between gap-3 w-full",
            hasBottomBorderBar && "border-b border-border",
          )}
        >
          {tabsListNode}
          <div className="shrink-0 flex items-center gap-2 pb-1">{tabBarExtraContent}</div>
        </div>
      ) : (
        tabsListNode
      )}

      {(visibleItems ?? []).map((item) => {
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
