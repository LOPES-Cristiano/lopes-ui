"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export type SelectOption = {
  value: string;
  label: string;
  group?: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

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
  /** Renders a live search input inside the dropdown */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  componentId?: string;
  icon?: React.ReactNode;
  hideIfDenied?: boolean;
};

const SIZE = {
  sm: { h: "h-8", text: "text-xs", px: "px-2.5" },
  md: { h: "h-10", text: "text-sm", px: "px-3" },
  lg: { h: "h-12", text: "text-base", px: "px-4" },
} as const;

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SelectField({
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  error,
  helpText,
  hint,
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
  searchable = false,
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhuma opção encontrada",
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  });

  const value = controlledValue ?? internalValue;
  const selected = options.find((option) => option.value === value) ?? null;

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = normalizeSearch(search.trim());
    return options.filter(
      (opt) =>
        normalizeSearch(opt.label).includes(q) ||
        (opt.description && normalizeSearch(opt.description).includes(q)) ||
        (opt.group && normalizeSearch(opt.group).includes(q)),
    );
  }, [options, search, searchable]);

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
    const maxHeight = Math.min(300, Math.max(140, (openAbove ? availableAbove : availableBelow) - gap));
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
      setSearch("");
      setDropdownStyle({
        position: "fixed",
        visibility: "hidden",
        zIndex: 999999,
      });
      return;
    }
    updateDropdownPosition();
    if (searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 20);
    }

    const handleWindowScroll = (e: Event) => {
      if (
        dropdownRef.current &&
        (e.target === dropdownRef.current || dropdownRef.current.contains(e.target as Node))
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
  }, [open, searchable, updateDropdownPosition]);

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
        !dropdownRef.current?.contains(target)
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
    if (highlighted >= 0 && listRef.current) {
      const itemEl = listRef.current.querySelector<HTMLElement>(`[data-opt-idx="${highlighted}"]`);
      itemEl?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const hasValue = !!selected;

  const findNextEnabled = (start: number, step: 1 | -1): number => {
    const len = filteredOptions.length;
    if (len === 0) return -1;
    let idx = start;
    for (let i = 0; i < len; i++) {
      idx = Math.max(0, Math.min(len - 1, idx + step));
      if (!filteredOptions[idx]?.disabled) return idx;
    }
    return start;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!open && (event.key === "Enter" || event.key === "ArrowDown" || event.key === " ")) {
      event.preventDefault();
      setOpen(true);
      setHighlighted(Math.max(0, filteredOptions.findIndex((option) => option.value === value)));
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlighted((current) => findNextEnabled(current, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((current) => findNextEnabled(current, -1));
        break;
      case "Home":
        event.preventDefault();
        setHighlighted(findNextEnabled(-1, 1));
        break;
      case "End":
        event.preventDefault();
        setHighlighted(findNextEnabled(filteredOptions.length, -1));
        break;
      case "Enter":
        event.preventDefault();
        if (highlighted >= 0 && filteredOptions[highlighted] && !filteredOptions[highlighted].disabled) {
          selectOption(filteredOptions[highlighted].value);
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

  const canClear = clearable && hasValue && !effectiveDisabled;
  const describedBy = error ? `${id}-error` : (helpText || hint) ? `${id}-help` : undefined;

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          id={id}
          data-component-id={componentId ?? (idProp ? `erp.select.${idProp}` : "erp.select.field")}
          type="button"
          name={name}
          disabled={effectiveDisabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleKeyDown}
          className={twMerge(
            "flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border text-left outline-none transition-[background-color,border-color,box-shadow] duration-150 cursor-pointer",
            s.h,
            s.text,
            s.px,
            canClear && "pr-14",
            variant === "filled"
              ? open
                ? "border-ring ring-3 ring-ring/12 bg-input"
                : "border-transparent bg-surface-muted hover:bg-surface-hover focus-visible:border-ring focus-visible:bg-input focus-visible:ring-3 focus-visible:ring-ring/12"
              : open
                ? "border-ring ring-3 ring-ring/12 bg-input"
                : "border-input-border bg-input hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/12",
            effectiveDisabled && "cursor-not-allowed opacity-60 bg-surface-muted",
            error && "border-danger hover:border-danger ring-0 focus-visible:border-danger focus-visible:ring-3 focus-visible:ring-danger/15",
          )}
        >
          <span className="flex items-center gap-2 truncate min-w-0">
            {(icon || selected?.icon) && (
              <span className="shrink-0 text-muted-foreground flex items-center">
                {selected?.icon ?? icon}
              </span>
            )}
            <span className={twMerge("truncate", hasValue ? "text-input-foreground font-medium" : "text-input-placeholder")}>
              {selected?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown
            size={14}
            className={twMerge(
              "shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
              open && "rotate-180 text-foreground",
            )}
          />
        </button>

        {canClear && (
          <button
            type="button"
            aria-label="Limpar seleção"
            onClick={(event) => {
              event.stopPropagation();
              setValue("");
              setOpen(false);
              buttonRef.current?.focus();
            }}
            className="absolute right-7 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        )}

        {open && typeof document !== "undefined" && createPortal(
          <div
            ref={dropdownRef}
            data-floating-open="true"
            style={dropdownStyle}
            className="pointer-events-auto z-[999999] flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground shadow-[var(--shadow-floating)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
          >
            {searchable && (
              <div className="relative flex items-center border-b border-border p-1.5">
                <Search size={13} className="pointer-events-none absolute left-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  placeholder={searchPlaceholder}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlighted(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-[var(--radius-control)] border border-input-border bg-surface-muted/60 pl-7 pr-7 py-1.5 text-xs text-foreground placeholder:text-input-placeholder focus:outline-none focus:border-ring focus:bg-input"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Limpar pesquisa"
                    onClick={() => {
                      setSearch("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            <ul
              ref={listRef}
              role="listbox"
              className="flex-1 overflow-y-auto overscroll-contain p-1 space-y-0.5"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                  {emptyMessage}
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  const prevGroup = index > 0 ? filteredOptions[index - 1]?.group : undefined;
                  const showGroupHeader = Boolean(option.group && option.group !== prevGroup);

                  return (
                    <React.Fragment key={option.value}>
                      {showGroupHeader && (
                        <li
                          role="presentation"
                          className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none"
                        >
                          {option.group}
                        </li>
                      )}
                      <li
                        data-opt-idx={index}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          if (!option.disabled) selectOption(option.value);
                        }}
                        onMouseEnter={() => {
                          if (!option.disabled) setHighlighted(index);
                        }}
                        className={twMerge(
                          "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[var(--radius-control)] text-xs sm:text-sm transition-colors select-none",
                          option.disabled
                            ? "opacity-45 cursor-not-allowed"
                            : "cursor-pointer",
                          isSelected
                            ? "bg-primary-soft text-primary-soft-foreground font-semibold"
                            : index === highlighted && !option.disabled
                              ? "bg-surface-hover text-foreground"
                              : "text-surface-foreground hover:bg-surface-hover",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {option.icon && <span className="shrink-0">{option.icon}</span>}
                          <div className="min-w-0">
                            <div className="truncate">{option.label}</div>
                            {option.description && (
                              <div className="truncate text-[11px] font-normal text-muted-foreground">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="shrink-0 text-primary" />}
                      </li>
                    </React.Fragment>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )}
      </div>
    </FieldWrapper>
  );
}
