"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import Calendar from "../Calendar";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
  className?: string;
  size?: "sm" | "md" | "lg";
  componentId?: string;
};

export default function DatePickerField({
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
  value,
  defaultValue,
  onChange,
  min,
  max,
  disabled,
  disabledDate,
  readOnly,
  size = "sm",
  placeholder = "dd/mm/aaaa",
  componentId,
}: DatePickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    zIndex: 99999,
  });
  const [typedValue, setTypedValue] = useState("");

  const selectedDate = useMemo(() => parseIsoDate(value ?? defaultValue), [defaultValue, value]);
  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const maxDate = useMemo(() => parseIsoDate(max), [max]);

  useEffect(() => {
    if (selectedDate) {
      setTypedValue(formatDisplayDate(selectedDate));
    } else {
      setTypedValue("");
    }
  }, [selectedDate]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setTypedValue("");
      onChange?.("");
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

    setTypedValue(formatted);

    if (clean.length === 8) {
      const day = Number(clean.slice(0, 2));
      const month = Number(clean.slice(2, 4));
      const year = Number(clean.slice(4, 8));

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1700 && year <= 2100) {
        const date = new Date(year, month - 1, day);
        if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
          onChange?.(toIsoDate(date));
        }
      }
    }
  }

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    
    const panelHeight = 350;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Só abre acima se não houver espaço embaixo e houver espaço suficiente acima
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
      width,
      zIndex: 99999,
      pointerEvents: "auto",
      visibility: "visible",
    });
  }, []);

  const handleToggle = () => {
    if (disabled || readOnly) return;
    if (!open) {
      updatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      setPanelStyle({
        position: "fixed",
        visibility: "hidden",
        zIndex: 99999,
      });
      return;
    }

    updatePosition();

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  function handleSelect(date: Date) {
    if (readOnly || disabled) return;
    onChange?.(toIsoDate(date));
    setOpen(false);
  }

  function handleClear() {
    if (readOnly || disabled) return;
    onChange?.("");
    setOpen(false);
  }

  function handleToday() {
    if (readOnly || disabled) return;
    onChange?.(toIsoDate(new Date()));
    setOpen(false);
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
        <div className="relative flex items-center">
          <input data-component-id={componentId ? `${componentId}.input` : "erp.datepicker.input"} id={id} name={name ?? `datepicker_off_${id}`} type="text" value={typedValue}
            placeholder={placeholder || "dd/mm/aaaa"}
            disabled={disabled}
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
            className={twMerge(
              "flex w-full items-center gap-2 border bg-white dark:bg-zinc-900 pr-9 text-left outline-none transition-all duration-150",
              size === "sm"
                ? "h-8 text-xs px-2.5 rounded-md"
                : size === "lg"
                  ? "h-12 text-base px-4 rounded-lg"
                  : "h-10 text-sm px-3 rounded-lg",
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 dark:border-zinc-700 dark:focus:border-zinc-500",
              (disabled || readOnly) && "cursor-not-allowed opacity-60",
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            />
          <button
            data-component-id={componentId ? `${componentId}.toggle` : "erp.datepicker.toggle"}
            type="button"
            disabled={disabled || readOnly}
            onClick={handleToggle}
            className="absolute right-3 flex items-center justify-center text-[var(--surface-muted-foreground)] hover:text-[var(--surface-foreground)] transition-colors"
            aria-label="Alternar calendário"
          >
            <CalendarDays size={15} />
          </button>
        </div>

        {open && panelStyle.left !== undefined && typeof document !== "undefined" && createPortal(
          <div
            ref={panelRef}
            data-floating-open="true"
            style={panelStyle}
            className="pointer-events-auto inline-flex w-fit flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[0_22px_50px_rgba(15,23,42,0.18)]"
          >
            <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <p className="text-sm font-semibold text-[var(--surface-foreground)]">Selecionar data</p>
              <button
                data-component-id={componentId ? `${componentId}.close` : "erp.datepicker.close"}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-[var(--surface-muted-foreground)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--surface-foreground)]"
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
            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
              <button
                type="button"
                data-component-id={componentId ? `${componentId}.clear` : "erp.datepicker.clear"}
                onClick={handleClear}
                className="rounded-md px-2 py-1 text-sm text-[var(--surface-muted-foreground)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--surface-foreground)]"
              >
                Limpar
              </button>
              <button
                type="button"
                data-component-id={componentId ? `${componentId}.today` : "erp.datepicker.today"}
                onClick={handleToday}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-sm text-[var(--surface-foreground)] transition-colors hover:bg-[var(--surface-hover)]"
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