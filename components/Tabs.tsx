"use client";

import React, { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
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
    "w-fit max-w-full overflow-x-auto no-scrollbar self-start rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 gap-1 text-zinc-500 dark:text-zinc-400",
  underline:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent p-0 gap-4 sm:gap-6 text-zinc-500 dark:text-zinc-400",
  bordered:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent p-0 gap-1.5 sm:gap-2 text-zinc-500 dark:text-zinc-400",
  enclosed:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-t-xl border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-1.5 gap-1.5 text-zinc-500 dark:text-zinc-400",
  lifted:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-1 pt-1 pb-0 gap-1.5 text-zinc-500 dark:text-zinc-400",
  card:
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent p-0 gap-1 text-zinc-600 dark:text-zinc-400",
  "editable-card":
    "w-full max-w-full overflow-x-auto no-scrollbar justify-start h-auto rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent p-0 gap-1 text-zinc-600 dark:text-zinc-400",
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
  card:
    "-mb-px rounded-t-lg rounded-b-none border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/60 px-3.5 py-2 hover:text-indigo-600 dark:hover:text-indigo-400 data-[state=active]:border-b-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none dark:data-[state=active]:border-b-zinc-900 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400",
  "editable-card":
    "-mb-px rounded-t-lg rounded-b-none border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/60 px-3.5 py-2 hover:text-indigo-600 dark:hover:text-indigo-400 data-[state=active]:border-b-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none dark:data-[state=active]:border-b-zinc-900 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400",
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

        return (
          <TabsTrigger
            key={item.value}
            value={item.value}
            componentId={item.componentId}
            hideIfDenied={item.hideIfDenied}
            disabled={isDisabled}
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
            {canClose && (
              <span
                role="button"
                tabIndex={0}
                aria-label={`Fechar aba ${typeof item.label === "string" ? item.label : item.value}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove?.(item.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemove?.(item.value);
                  }
                }}
                className="ml-1.5 -mr-1 inline-flex h-4 w-4 items-center justify-center rounded-sm text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </TabsTrigger>
        );
      })}

      {showAddButton && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={addLabel}
          title={addLabel}
          className={cn(
            "inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer",
            variant === "card" || variant === "editable-card"
              ? "-mb-px rounded-t-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-2.5 py-2 text-zinc-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
              : "rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100",
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
            hasBottomBorderBar && "border-b border-zinc-200 dark:border-zinc-800",
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
