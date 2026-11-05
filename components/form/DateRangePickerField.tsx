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
  /** Shows a quick top chip bar with the last 6 months for 1-click full-month selection */
  showQuickMonths?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

const SHORT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
  const firstOfYear = new Date(today.getFullYear(), 0, 1);

  return [
    { label: "Hoje", getValue: () => [today, today] },
    { label: "Últimos 7 dias", getValue: () => [subDays(6), today] },
    { label: "Últimos 30 dias", getValue: () => [subDays(29), today] },
    { label: "Este mês (MTD)", getValue: () => [firstOfThisMonth, today] },
    { label: "Mês passado", getValue: () => [firstOfLastMonth, lastOfLastMonth] },
    { label: "Este ano (YTD)", getValue: () => [firstOfYear, today] },
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
  showQuickMonths = false,
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

  const quickMonths = useMemo(() => {
    if (!showQuickMonths) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const items: Array<{ label: string; start: Date; end: Date }> = [];
    for (let i = 0; i < 6; i++) {
      const mStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const naturalEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0);
      const cappedEnd = maxDate && naturalEnd > maxDate ? maxDate : naturalEnd;
      if (minDate && cappedEnd < minDate) continue;
      const effectiveStart = minDate && mStart < minDate ? minDate : mStart;
      if (effectiveStart > cappedEnd) continue;
      items.push({
        label: `${SHORT_MONTHS[mStart.getMonth()]}/${String(mStart.getFullYear()).slice(-2)}`,
        start: effectiveStart,
        end: cappedEnd,
      });
    }
    return items;
  }, [showQuickMonths, minDate, maxDate]);

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

    const measuredRect = panelRef.current?.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const fallbackWidth = isMobile ? Math.min(360, window.innerWidth - 24) : numberOfMonths === 2 ? 730 : 440;
    const panelWidth = Math.min(
      measuredRect && measuredRect.width > 40 ? measuredRect.width : fallbackWidth,
      window.innerWidth - 24,
    );
    const panelHeight = measuredRect && measuredRect.height > 40 ? measuredRect.height : 390;

    const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - panelWidth - 12));
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenAbove = spaceBelow < panelHeight + 12 && rect.top >= panelHeight + 12;

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
    const rafId = window.requestAnimationFrame(updatePosition);

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
      window.cancelAnimationFrame(rafId);
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

  const handleQuickMonthClick = (mStart: Date, mEnd: Date) => {
    if (effectiveDisabled || readOnly) return;
    setRange({ start: toIsoDate(mStart), end: toIsoDate(mEnd) });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveDisabled || readOnly) return;
    setRange({});
    setOpen(false);
  };

  if (!hasPermission && hideIfDenied) return null;

  const hasValue = Boolean(currentRange.start || currentRange.end);

  const triggerElement = (
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
            ? "h-8 text-xs px-2.5 rounded-lg"
            : size === "lg"
              ? "h-12 text-base px-4 rounded-xl"
              : "h-10 text-sm px-3 rounded-lg",
          error
            ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            : open
              ? "border-blue-500 ring-2 ring-blue-500/15 dark:border-blue-500"
              : "border-zinc-300 hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:hover:border-zinc-600",
          (effectiveDisabled || readOnly) && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={twMerge(
            "truncate tabular-nums",
            hasValue ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-400 dark:text-zinc-500",
          )}
        >
          {displayString || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0 text-zinc-400">
          {clearable && hasValue && !effectiveDisabled && !readOnly && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Limpar período"
              onClick={handleClear}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X size={13} />
            </span>
          )}
          <CalendarDays size={15} className={open ? "text-blue-600 dark:text-blue-400" : undefined} />
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            data-floating-open="true"
            style={panelStyle}
            className="pointer-events-auto inline-flex flex-col max-w-[calc(100vw-24px)] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-2xl"
          >
            {quickMonths.length > 0 && (
              <div className="mb-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pr-1 shrink-0">
                  Meses:
                </span>
                {quickMonths.map((qm) => {
                  const isActiveMonth = Boolean(
                    startDate && endDate && isSameDay(startDate, qm.start) && isSameDay(endDate, qm.end),
                  );
                  return (
                    <button
                      key={qm.label}
                      type="button"
                      onClick={() => handleQuickMonthClick(qm.start, qm.end)}
                      className={twMerge(
                        "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer tabular-nums",
                        isActiveMonth
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-zinc-100/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-zinc-700",
                      )}
                    >
                      {qm.label}
                    </button>
                  );
                })}
              </div>
            )}

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
  );

  if (!label && !error && !helpText && !hint && !tooltip && !labelAction) {
    return (
      <div className={twMerge("min-w-0", width, className)}>
        {triggerElement}
      </div>
    );
  }

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
      {triggerElement}
    </FieldWrapper>
  );
}
