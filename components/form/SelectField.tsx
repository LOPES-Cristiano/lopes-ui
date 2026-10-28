"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type SelectOption = { value: string; label: string };

export type SelectFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "filled";
  size?: "sm" | "md" | "lg";
  clearable?: boolean;
  componentId?: string;
  icon?: React.ReactNode;
  hideIfDenied?: boolean;
};

const SIZE = {
  sm: { h: "h-8", text: "text-xs", px: "px-2.5" },
  md: { h: "h-10", text: "text-sm", px: "px-3" },
  lg: { h: "h-12", text: "text-base", px: "px-4" },
} as const;

export default function SelectField({
  label,
  labelInline,
  labelWidth,
  required,
  tooltip,
  error,
  helpText,
  width,
  className,
  id: idProp,
  name,
  options,
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "Selecionar...",
  disabled,
  variant = "default",
  size = "md",
  clearable = false,
  componentId,
  icon,
  hideIfDenied = false,
}: SelectFieldProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const effectiveDisabled = disabled || !hasPermission;
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  });

  const value = controlledValue ?? internalValue;
  const selected = options.find((option) => option.value === value) ?? null;

  const setValue = (next: string) => {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const updateDropdownPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const availableBelow = window.innerHeight - rect.bottom - margin;
    const availableAbove = rect.top - margin;
    const openAbove = availableBelow < 220 && availableAbove > availableBelow;
    const maxHeight = Math.min(280, Math.max(140, (openAbove ? availableAbove : availableBelow) - gap));
    const widthPx = Math.max(rect.width, 220);
    const left = Math.min(
      Math.max(margin, rect.left),
      window.innerWidth - margin - widthPx,
    );

    setDropdownStyle({
      position: "fixed",
      left,
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width: Math.max(rect.width, 220),
      minWidth: rect.width,
      maxHeight,
      zIndex: 999999,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setDropdownStyle({
        position: "fixed",
        visibility: "hidden",
        zIndex: 999999,
      });
      return;
    }
    updateDropdownPosition();

    const handleWindowScroll = (e: Event) => {
      if (
        listRef.current &&
        (e.target === listRef.current || listRef.current.contains(e.target as Node))
      ) {
        return;
      }
      updateDropdownPosition();
    };

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", handleWindowScroll, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", handleWindowScroll, true);
    };
  }, [open, updateDropdownPosition]);

  // Habilitar rolagem via mouse wheel e gestos mesmo dentro de modais
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop += e.deltaY;
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
      const touchY = e.touches[0]?.clientY ?? 0;
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop += touchStartY - touchY;
        touchStartY = touchY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [open]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    if (highlighted >= 0) {
      listRef.current?.children[highlighted]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const hasValue = !!selected;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open && (event.key === "Enter" || event.key === "ArrowDown" || event.key === " ")) {
      event.preventDefault();
      setOpen(true);
      setHighlighted(Math.max(0, options.findIndex((option) => option.value === value)));
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlighted((current) => Math.min(current + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((current) => Math.max(current - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (highlighted >= 0 && options[highlighted]) {
          selectOption(options[highlighted].value);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
        break;
    }
  };

  const selectOption = (next: string) => {
    setValue(next);
    setOpen(false);
    setHighlighted(-1);
    buttonRef.current?.focus();
  };

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      error={error}
      helpText={helpText}
      width={width}
      className={className}
    >
      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          id={id}
          data-component-id={componentId ?? (idProp ? `erp.select.${idProp}` : 'erp.select.field')}
          type="button"
          name={name}
          disabled={effectiveDisabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleKeyDown}
          className={twMerge(
            "flex w-full items-center justify-between gap-2 rounded-md border text-left outline-none transition duration-150",
            s.h,
            s.text,
            s.px,
            variant === "filled"
              ? "border-transparent bg-zinc-100 hover:bg-zinc-200/70 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 dark:focus:bg-zinc-900"
              : open
                ? "border-primary ring-2 ring-primary/20 bg-white dark:bg-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
            effectiveDisabled && "cursor-not-allowed opacity-60 bg-zinc-100 dark:bg-zinc-800/60",
            error && "border-rose-500 dark:border-rose-500 ring-1 ring-rose-500/30 focus:border-rose-500 focus:ring-rose-500/20",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {icon && <span className="shrink-0 text-primary/80 flex items-center">{icon}</span>}
            <span className={twMerge("truncate", hasValue ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-400 dark:text-zinc-500")}>
              {selected?.label ?? placeholder}
            </span>
          </span>
          <span className="flex items-center gap-1">
            {clearable && hasValue && !effectiveDisabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setValue("");
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
              >
                ×
              </span>
            )}
            <ChevronDown size={14} className={twMerge("shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-150", open && "rotate-180 text-primary")} />
          </span>
        </button>

        {open && typeof document !== "undefined" && createPortal(
          <ul
            ref={listRef}
            role="listbox"
            data-floating-open="true"
            style={dropdownStyle}
            className="pointer-events-auto z-[999999] overflow-y-auto overscroll-contain rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl space-y-0.5"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option.value);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={twMerge(
                    "flex cursor-pointer items-center justify-between px-2.5 py-1.5 rounded-md text-xs sm:text-sm transition-colors select-none",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20"
                      : index === highlighted
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} className="shrink-0 text-primary" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
      </div>
    </FieldWrapper>
  );
}
