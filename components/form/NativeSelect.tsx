"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "../useAccessControl";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  wrapperClassName?: string;
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ icon, wrapperClassName, className, children, disabled, componentId, hideIfDenied = false, ...rest }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);
    const effectiveDisabled = Boolean(disabled || !hasPermission);

    if (!hasPermission && hideIfDenied) return null;

    if (icon) {
      return (
        <div className={cn("relative w-full flex items-center", wrapperClassName)}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center shrink-0 z-10">
            {icon}
          </div>
          <select
            ref={ref}
            disabled={effectiveDisabled}
            data-component-id={componentId}
            className={cn(
              "w-full h-9 rounded-lg border border-border bg-surface pl-9 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs cursor-pointer transition-all appearance-none disabled:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-80",
              className
            )}
            {...rest}
          >
            {children}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center shrink-0">
            <ChevronDown size={14} />
          </div>
        </div>
      );
    }

    return (
      <div className={cn("relative w-full flex items-center", wrapperClassName)}>
        <select
          ref={ref}
          disabled={effectiveDisabled}
          data-component-id={componentId}
          className={cn(
            "w-full h-9 rounded-lg border border-border bg-surface pl-3 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs cursor-pointer transition-all appearance-none disabled:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-80",
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center shrink-0">
          <ChevronDown size={14} />
        </div>
      </div>
    );
  }
);

NativeSelect.displayName = "NativeSelect";
export default NativeSelect;
