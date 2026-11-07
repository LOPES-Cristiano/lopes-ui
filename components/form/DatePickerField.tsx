"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import Calendar from "../Calendar";
import { useEscKey } from "../Modal";
import { useAccessControl } from "../useAccessControl";

export type DatePickerFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  readOnly?: boolean;
  placeholder?: string;
  /** Renders an inline clear button when a date is selected */
  clearable?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

function parseIsoDate(value?: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export default function DatePickerField({
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
  value,
  defaultValue = "",
  onChange,
  min,
  max,
  disabled,
  disabledDate,
  readOnly,
  clearable = true,
  size = "sm",
  placeholder = "dd/mm/aaaa",
  componentId,
  hideIfDenied = false,
}: DatePickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalIso, setInternalIso] = useState(defaultValue);
  const [editingText, setEditingText] = useState<string | null>(null);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    zIndex: 9200,
  });

  const currentIso = value !== undefined ? value : internalIso;
  const selectedDate = useMemo(() => parseIsoDate(currentIso), [currentIso]);
  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const maxDate = useMemo(() => parseIsoDate(max), [max]);

  const typedValue = editingText !== null ? editingText : selectedDate ? formatDisplayDate(selectedDate) : "";

  const commitDate = (nextIso: string) => {
    setEditingText(null);
    if (value === undefined) setInternalIso(nextIso);
    onChange?.(nextIso);
  };

  const closePanel = useCallback(() => {
    setOpen(false);
    setEditingText(null);
    setPanelStyle({
      position: "fixed",
      visibility: "hidden",
      zIndex: 9200,
    });
  }, []);

  useEscKey(closePanel, open);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      commitDate("");
      return;
    }

    let clean = raw.replace(/\D/g, "");
    if (clean.length > 8) clean = clean.slice(0, 8);

    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    if (clean.length > 4) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
    }

    setEditingText(formatted);

    if (clean.length === 8) {
      const day = Number(clean.slice(0, 2));
      const month = Number(clean.slice(2, 4));
      const year = Number(clean.slice(4, 8));

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1700 && year <= 2100) {
        const date = new Date(year, month - 1, day);
        if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
          commitDate(toIsoDate(date));
        }
      }
    }
  }

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const widthPx = Math.min(320, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - widthPx - 12);

    const panelHeight = 350;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenAbove = spaceBelow < panelHeight && spaceAbove >= panelHeight;

    let top: number;
    if (shouldOpenAbove) {
      top = Math.max(12, rect.top - panelHeight - 6);
    } else {
      top = rect.bottom + 6;
      if (top + panelHeight > window.innerHeight) {
        top = Math.max(12, window.innerHeight - panelHeight - 12);
        if (top <= rect.bottom && top + panelHeight >= rect.top) {
          top = spaceAbove > spaceBelow
            ? Math.max(12, rect.top - panelHeight - 6)
            : rect.bottom + 4;
        }
      }
    }

    setPanelStyle({
      position: "fixed",
      left,
      top,
      width: widthPx,
      zIndex: 9200,
      pointerEvents: "auto",
      visibility: "visible",
    });
  }, []);

  const handleToggle = () => {
    if (effectiveDisabled || readOnly) return;
    if (!open) {
      updatePosition();
      setOpen(true);
    } else {
      closePanel();
    }
  };

  useEffect(() => {
    if (!open) return;

    const rafId = window.requestAnimationFrame(updatePosition);

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closePanel();
    }

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition, closePanel]);

  function handleSelect(date: Date) {
    if (readOnly || effectiveDisabled) return;
    commitDate(toIsoDate(date));
    closePanel();
  }

  function handleClear() {
    if (readOnly || effectiveDisabled) return;
    commitDate("");
    closePanel();
  }

  function handleToday() {
    if (readOnly || effectiveDisabled) return;
    commitDate(toIsoDate(new Date()));
    closePanel();
  }

  if (!hasPermission && hideIfDenied) return null;

  const canShowClear = clearable && Boolean(typedValue) && !effectiveDisabled && !readOnly;
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
        <div className="relative flex items-center">
          <input
            data-component-id={componentId ? `${componentId}.input` : "erp.datepicker.input"}
            id={id}
            name={name ?? `datepicker_off_${id}`}
            type="text"
            inputMode="numeric"
            value={typedValue}
            placeholder={placeholder || "dd/mm/aaaa"}
            disabled={effectiveDisabled}
            readOnly={readOnly}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            onChange={handleInputChange}
            onBlur={() => setEditingText(null)}
            className={twMerge(
              "flex w-full items-center gap-2 rounded-[var(--radius-control)] border bg-input text-input-foreground placeholder:text-input-placeholder text-left tabular-nums outline-none transition-[background-color,border-color,box-shadow] duration-150",
              canShowClear ? "pr-14" : "pr-9",
              size === "sm"
                ? "h-8 text-xs pl-2.5"
                : size === "lg"
                  ? "h-12 text-base pl-4"
                  : "h-10 text-sm pl-3",
              error
                ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/15"
                : "border-input-border hover:border-border-strong focus:border-ring focus:ring-3 focus:ring-ring/12",
              (effectiveDisabled || readOnly) && "cursor-not-allowed opacity-60 bg-surface-muted",
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
          <span className="absolute right-1.5 flex items-center gap-0.5">
            {canShowClear && (
              <button
                type="button"
                tabIndex={-1}
                onClick={handleClear}
                aria-label="Limpar data"
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
            <button
              data-component-id={componentId ? `${componentId}.toggle` : "erp.datepicker.toggle"}
              type="button"
              disabled={effectiveDisabled || readOnly}
              onClick={handleToggle}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
              aria-label="Alternar calendário"
            >
              <CalendarDays size={15} />
            </button>
          </span>
        </div>

        {open &&
          panelStyle.left !== undefined &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={panelRef}
              data-floating-open="true"
              style={panelStyle}
              className="pointer-events-auto z-[9200] inline-flex w-fit flex-col rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground p-2.5 shadow-[var(--shadow-floating)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
            >
              <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-border pb-2">
                <p className="text-sm font-semibold text-foreground">Selecionar data</p>
                <button
                  data-component-id={componentId ? `${componentId}.close` : "erp.datepicker.close"}
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                  aria-label="Fechar calendário"
                >
                  <X size={14} />
                </button>
              </div>
              <Calendar
                size="sm"
                compact
                value={selectedDate}
                minDate={minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                disabledDate={disabledDate}
                onChange={handleSelect}
              />
              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <button
                  type="button"
                  data-component-id={componentId ? `${componentId}.clear` : "erp.datepicker.clear"}
                  onClick={handleClear}
                  className="min-h-6 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  data-component-id={componentId ? `${componentId}.today` : "erp.datepicker.today"}
                  onClick={handleToday}
                  className="min-h-6 rounded-[var(--radius-control)] border border-border px-2.5 py-1 text-xs font-medium text-surface-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                >
                  Hoje
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </FieldWrapper>
  );
}
