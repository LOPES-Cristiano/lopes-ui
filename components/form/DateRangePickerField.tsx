"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import Calendar, { type CalendarPreset } from "../Calendar";
import { useAccessControl } from "../useAccessControl";

export type DateRangeValue = {
  start?: string;
  end?: string;
};

export type DateRangePickerFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  numberOfMonths?: 1 | 2;
  /** Quick date range presets shown in a sidebar (defaults to Hoje, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado) */
  presets?: CalendarPreset[];
  showDefaultPresets?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

function parseIsoDate(value?: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date | null): string {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function buildDefaultPresets(): CalendarPreset[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };

  const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  return [
    { label: "Hoje", getValue: () => [today, today] },
    { label: "Últimos 7 dias", getValue: () => [subDays(6), today] },
    { label: "Últimos 30 dias", getValue: () => [subDays(29), today] },
    { label: "Este mês", getValue: () => [firstOfThisMonth, today] },
    { label: "Mês passado", getValue: () => [firstOfLastMonth, lastOfLastMonth] },
  ];
}

export default function DateRangePickerField({
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
  value: controlledValue,
  defaultValue,
  onChange,
  min,
  max,
  disabled = false,
  readOnly = false,
  clearable = true,
  numberOfMonths = 2,
  presets,
  showDefaultPresets = true,
  placeholder = "dd/mm/aaaa até dd/mm/aaaa",
  size = "sm",
  componentId,
  hideIfDenied = false,
}: DateRangePickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRangeValue>(defaultValue ?? {});
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    zIndex: 99999,
  });

  const currentRange = controlledValue ?? internalRange;
  const startDate = useMemo(() => parseIsoDate(currentRange.start), [currentRange.start]);
  const endDate = useMemo(() => parseIsoDate(currentRange.end), [currentRange.end]);
  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const maxDate = useMemo(() => parseIsoDate(max), [max]);

  const effectivePresets = useMemo(
    () => presets ?? (showDefaultPresets ? buildDefaultPresets() : undefined),
    [presets, showDefaultPresets],
  );

  const setRange = (next: DateRangeValue) => {
    if (controlledValue === undefined) setInternalRange(next);
    onChange?.(next);
  };

  const displayString = useMemo(() => {
    if (!startDate && !endDate) return "";
    if (startDate && !endDate) return `${formatDisplayDate(startDate)} até ...`;
    return `${formatDisplayDate(startDate)} até ${formatDisplayDate(endDate)}`;
  }, [startDate, endDate]);

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const desiredWidth = Math.min(numberOfMonths === 2 ? 720 : 440, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - desiredWidth - 12);
    const panelHeight = 380;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenAbove = spaceBelow < panelHeight && rect.top >= panelHeight;

    const top = shouldOpenAbove
      ? Math.max(12, rect.top - panelHeight - 6)
      : Math.min(rect.bottom + 6, Math.max(12, window.innerHeight - panelHeight - 12));

    setPanelStyle({
      position: "fixed",
      left,
      top,
      zIndex: 99999,
      pointerEvents: "auto",
      visibility: "visible",
    });
  }, [numberOfMonths]);

  useEffect(() => {
    if (!open) {
      setPanelStyle({ position: "fixed", visibility: "hidden", zIndex: 99999 });
      return;
    }
    updatePosition();

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const handleRangeChange = (range: [Date | null, Date | null]) => {
    if (effectiveDisabled || readOnly) return;
    const [start, end] = range;
    const next: DateRangeValue = {
      start: start ? toIsoDate(start) : undefined,
      end: end ? toIsoDate(end) : undefined,
    };
    setRange(next);
    if (start && end) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveDisabled || readOnly) return;
    setRange({});
    setOpen(false);
  };

  if (!hasPermission && hideIfDenied) return null;

  const hasValue = Boolean(currentRange.start || currentRange.end);

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
          id={id}
          type="button"
          data-component-id={componentId ?? "erp.daterangepicker.trigger"}
          disabled={effectiveDisabled || readOnly}
          onClick={() => !effectiveDisabled && !readOnly && setOpen((o) => !o)}
          className={twMerge(
            "flex w-full items-center justify-between gap-2 border bg-white dark:bg-zinc-900 text-left outline-none transition-all duration-150 cursor-pointer",
            size === "sm"
              ? "h-8 text-xs px-2.5 rounded-md"
              : size === "lg"
                ? "h-12 text-base px-4 rounded-lg"
                : "h-10 text-sm px-3 rounded-lg",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              : "border-zinc-300 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-700",
            (effectiveDisabled || readOnly) && "cursor-not-allowed opacity-60",
          )}
        >
          <span className={twMerge("truncate", hasValue ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-400 dark:text-zinc-500")}>
            {displayString || placeholder}
          </span>
          <span className="flex items-center gap-1 shrink-0 text-zinc-400">
            {clearable && hasValue && !effectiveDisabled && !readOnly && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar período"
                onClick={handleClear}
                className="flex h-5 w-5 items-center justify-center rounded hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={13} />
              </span>
            )}
            <CalendarDays size={15} />
          </span>
        </button>

        {open && typeof document !== "undefined" && createPortal(
          <div
            ref={panelRef}
            data-floating-open="true"
            style={panelStyle}
            className="pointer-events-auto inline-flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-2xl"
          >
            <Calendar
              size="sm"
              compact
              rangeMode
              numberOfMonths={numberOfMonths}
              presets={effectivePresets}
              rangeValue={[startDate, endDate]}
              minDate={minDate ?? undefined}
              maxDate={maxDate ?? undefined}
              onRangeChange={handleRangeChange}
            />
          </div>,
          document.body,
        )}
      </div>
    </FieldWrapper>
  );
}
