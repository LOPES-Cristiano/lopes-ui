"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import Calendar, { type CalendarPreset } from "../Calendar";
import { useEscKey } from "../Modal";
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
  name,
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
    zIndex: 9200,
  });

  const currentRange = controlledValue ?? internalRange;
  const startDate = useMemo(() => parseIsoDate(currentRange.start), [currentRange.start]);
  const endDate = useMemo(() => parseIsoDate(currentRange.end), [currentRange.end]);
  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const maxDate = useMemo(() => parseIsoDate(max), [max]);

  const closePanel = useCallback(() => {
    setOpen(false);
    setPanelStyle({ position: "fixed", visibility: "hidden", zIndex: 9200 });
  }, []);

  useEscKey(closePanel, open);

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
    const fallbackWidth = isMobile
      ? Math.min(360, window.innerWidth - 24)
      : numberOfMonths === 2
        ? 730
        : 440;
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
      zIndex: 9200,
      pointerEvents: "auto",
      visibility: "visible",
    });
  }, [numberOfMonths]);

  useEffect(() => {
    if (!open) return;
    const rafId = window.requestAnimationFrame(updatePosition);

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closePanel();
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition, closePanel]);

  const handleRangeChange = (range: [Date | null, Date | null]) => {
    if (effectiveDisabled || readOnly) return;
    const [start, end] = range;
    const next: DateRangeValue = {
      start: start ? toIsoDate(start) : undefined,
      end: end ? toIsoDate(end) : undefined,
    };
    setRange(next);
    if (start && end) {
      closePanel();
    }
  };

  const handleQuickMonthClick = (mStart: Date, mEnd: Date) => {
    if (effectiveDisabled || readOnly) return;
    setRange({ start: toIsoDate(mStart), end: toIsoDate(mEnd) });
    closePanel();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveDisabled || readOnly) return;
    setRange({});
    closePanel();
  };

  if (!hasPermission && hideIfDenied) return null;

  const hasValue = Boolean(currentRange.start || currentRange.end);
  const canClear = clearable && hasValue && !effectiveDisabled && !readOnly;
  const describedBy = error ? `${id}-error` : (helpText || hint) ? `${id}-help` : undefined;

  const triggerElement = (
    <div ref={containerRef} className="relative">
      {name && (
        <input
          type="hidden"
          name={name}
          value={
            currentRange.start || currentRange.end
              ? `${currentRange.start ?? ""}/${currentRange.end ?? ""}`
              : ""
          }
        />
      )}
      <button
        id={id}
        type="button"
        data-component-id={componentId ?? "erp.daterangepicker.trigger"}
        disabled={effectiveDisabled || readOnly}
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onClick={() => {
          if (effectiveDisabled || readOnly) return;
          if (open) closePanel();
          else {
            updatePosition();
            setOpen(true);
          }
        }}
        className={twMerge(
          "flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border bg-input text-left outline-none transition-[background-color,border-color,box-shadow] duration-150 cursor-pointer",
          size === "sm"
            ? "h-8 text-xs px-2.5"
            : size === "lg"
              ? "h-12 text-base px-4"
              : "h-10 text-sm px-3",
          canClear && "pr-14",
          error
            ? "border-danger focus-visible:border-danger focus-visible:ring-3 focus-visible:ring-danger/15"
            : open
              ? "border-ring ring-3 ring-ring/12"
              : "border-input-border hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/12",
          (effectiveDisabled || readOnly) && "cursor-not-allowed opacity-60 bg-surface-muted",
        )}
      >
        <span
          className={twMerge(
            "truncate tabular-nums",
            hasValue ? "text-input-foreground font-medium" : "text-input-placeholder",
          )}
        >
          {displayString || placeholder}
        </span>
        <CalendarDays
          size={15}
          className={twMerge("shrink-0 text-muted-foreground", open && "text-primary")}
        />
      </button>

      {canClear && (
        <button
          type="button"
          aria-label="Limpar período"
          onClick={handleClear}
          className="absolute right-7 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      )}

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            data-floating-open="true"
            style={panelStyle}
            className="pointer-events-auto z-[9200] inline-flex flex-col max-w-[calc(100vw-24px)] max-h-[calc(100dvh-24px)] overflow-y-auto overscroll-contain rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground p-3 shadow-[var(--shadow-floating)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
          >
            {quickMonths.length > 0 && (
              <div className="mb-2.5 pb-2.5 border-b border-border flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pr-1 shrink-0">
                  Meses:
                </span>
                {quickMonths.map((qm) => {
                  const isActiveMonth = Boolean(
                    startDate &&
                      endDate &&
                      isSameDay(startDate, qm.start) &&
                      isSameDay(endDate, qm.end),
                  );
                  return (
                    <button
                      key={qm.label}
                      type="button"
                      onClick={() => handleQuickMonthClick(qm.start, qm.end)}
                      className={twMerge(
                        "shrink-0 min-h-6 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        isActiveMonth
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-surface-muted text-surface-foreground hover:bg-surface-hover",
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
    return <div className={twMerge("min-w-0", width, className)}>{triggerElement}</div>;
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
