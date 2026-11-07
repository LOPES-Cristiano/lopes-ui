"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useEscKey } from "../Modal";
import { useAccessControl } from "../useAccessControl";

const MESES = [
  { short: "Jan", full: "Janeiro", num: "01" },
  { short: "Fev", full: "Fevereiro", num: "02" },
  { short: "Mar", full: "Março", num: "03" },
  { short: "Abr", full: "Abril", num: "04" },
  { short: "Mai", full: "Maio", num: "05" },
  { short: "Jun", full: "Junho", num: "06" },
  { short: "Jul", full: "Julho", num: "07" },
  { short: "Ago", full: "Agosto", num: "08" },
  { short: "Set", full: "Setembro", num: "09" },
  { short: "Out", full: "Outubro", num: "10" },
  { short: "Nov", full: "Novembro", num: "11" },
  { short: "Dez", full: "Dezembro", num: "12" },
];

export type MonthPickerFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  /** Value in YYYY-MM format (e.g. "2026-09") */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Minimum selectable month in YYYY-MM format */
  min?: string;
  /** Maximum selectable month in YYYY-MM format */
  max?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

function parseYearMonth(value?: string | null) {
  if (!value || typeof value !== "string") return null;
  const parts = value.trim().split("-");
  if (parts.length < 2) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!year || isNaN(year) || !month || isNaN(month) || month < 1 || month > 12) return null;
  return { year, month };
}

export default function MonthPickerField({
  label,
  labelInline,
  orientation,
  labelWidth,
  labelAction,
  required,
  tooltip,
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
  readOnly,
  size = "md",
  placeholder = "Selecione o mês",
  componentId,
  hideIfDenied = false,
}: MonthPickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const currentValue = value !== undefined ? value : internalValue;
  const parsed = useMemo(() => parseYearMonth(currentValue), [currentValue]);
  const minParsed = useMemo(() => parseYearMonth(min), [min]);
  const maxParsed = useMemo(() => parseYearMonth(max), [max]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const [viewYear, setViewYear] = useState<number>(parsed?.year ?? currentYear);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    zIndex: 9200,
  });

  const commitMonth = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const closePanel = useCallback(() => {
    setOpen(false);
    setPanelStyle({
      position: "fixed",
      visibility: "hidden",
      zIndex: 9200,
    });
  }, []);

  useEscKey(closePanel, open);

  const displayString = useMemo(() => {
    if (!parsed) return "";
    const mesObj = MESES[parsed.month - 1];
    return mesObj ? `${mesObj.full} de ${parsed.year}` : currentValue || "";
  }, [parsed, currentValue]);

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const panelWidth = Math.min(280, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - panelWidth - 12);
    const panelHeight = 264;
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
      }
    }

    setPanelStyle({
      position: "fixed",
      left,
      top,
      width: panelWidth,
      zIndex: 9200,
      pointerEvents: "auto",
      visibility: "visible",
    });
  }, []);

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

  const isMonthDisabled = useCallback(
    (year: number, monthIdx: number) => {
      const totalMonths = year * 12 + (monthIdx + 1);
      if (minParsed && totalMonths < minParsed.year * 12 + minParsed.month) return true;
      if (maxParsed && totalMonths > maxParsed.year * 12 + maxParsed.month) return true;
      return false;
    },
    [minParsed, maxParsed],
  );

  const canGoPrevYear = !minParsed || viewYear > minParsed.year;
  const canGoNextYear = !maxParsed || viewYear < maxParsed.year;
  const isCurrentMonthDisabled = isMonthDisabled(currentYear, currentMonthIdx);

  const handleToggle = () => {
    if (effectiveDisabled || readOnly) return;
    if (!open) {
      const targetYear = parsed?.year ?? currentYear;
      const clampedYear = minParsed
        ? Math.max(minParsed.year, maxParsed ? Math.min(maxParsed.year, targetYear) : targetYear)
        : maxParsed
          ? Math.min(maxParsed.year, targetYear)
          : targetYear;
      setViewYear(clampedYear);
      updatePosition();
      setOpen(true);
    } else {
      closePanel();
    }
  };

  const handleSelectMonth = (monthIdx: number) => {
    if (readOnly || effectiveDisabled || isMonthDisabled(viewYear, monthIdx)) return;
    const mm = String(monthIdx + 1).padStart(2, "0");
    commitMonth(`${viewYear}-${mm}`);
    closePanel();
  };

  const handleThisMonth = () => {
    if (readOnly || effectiveDisabled || isCurrentMonthDisabled) return;
    const mm = String(currentMonthIdx + 1).padStart(2, "0");
    setViewYear(currentYear);
    commitMonth(`${currentYear}-${mm}`);
    closePanel();
  };

  const handleClear = () => {
    if (readOnly || effectiveDisabled) return;
    commitMonth("");
    closePanel();
  };

  if (!hasPermission && hideIfDenied) return null;

  const describedBy = error ? `${id}-error` : (helpText || hint) ? `${id}-help` : undefined;

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      labelAction={labelAction}
      required={required}
      tooltip={tooltip}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div ref={containerRef} className="relative w-full">
        {name && <input type="hidden" name={name} value={currentValue ?? ""} />}
        <button
          data-component-id={componentId ? `${componentId}.toggle` : "erp.monthpicker.toggle"}
          id={id}
          type="button"
          onClick={handleToggle}
          disabled={effectiveDisabled || readOnly}
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={twMerge(
            "flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border bg-input text-input-foreground transition-[background-color,border-color,box-shadow] duration-150 text-left outline-none cursor-pointer",
            size === "sm" ? "h-8 text-xs px-2.5" : size === "lg" ? "h-12 text-base px-4" : "h-10 text-sm px-3",
            error
              ? "border-danger focus-visible:border-danger focus-visible:ring-3 focus-visible:ring-danger/15"
              : open
                ? "border-ring ring-3 ring-ring/12"
                : "border-input-border hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/12",
            (effectiveDisabled || readOnly) && "cursor-not-allowed opacity-60 bg-surface-muted",
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span
              className={twMerge(
                "truncate font-medium",
                !displayString && "text-input-placeholder font-normal",
              )}
            >
              {displayString || placeholder}
            </span>
          </div>
          <span className="text-[10px] font-mono tabular-nums font-semibold text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-surface-muted shrink-0">
            {parsed ? `${String(parsed.month).padStart(2, "0")}/${parsed.year}` : "--/--"}
          </span>
        </button>

        {open &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={panelRef}
              data-floating-open="true"
              style={panelStyle}
              className="pointer-events-auto z-[9200] flex flex-col rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground p-3 shadow-[var(--shadow-floating)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none select-none"
            >
              {/* Header with Year & Navigation */}
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                <div className="flex items-center gap-1">
                  <button
                    data-component-id={
                      componentId ? `${componentId}.prev-year` : "erp.monthpicker.prev-year"
                    }
                    type="button"
                    disabled={!canGoPrevYear}
                    onClick={() => canGoPrevYear && setViewYear((y) => y - 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                    aria-label="Ano anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm text-foreground px-1.5 font-mono tabular-nums">
                    {viewYear}
                  </span>
                  <button
                    data-component-id={
                      componentId ? `${componentId}.next-year` : "erp.monthpicker.next-year"
                    }
                    type="button"
                    disabled={!canGoNextYear}
                    onClick={() => canGoNextYear && setViewYear((y) => y + 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                    aria-label="Próximo ano"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  data-component-id={componentId ? `${componentId}.close` : "erp.monthpicker.close"}
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3x4 Month Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {MESES.map((mes, idx) => {
                  const isSelected = parsed?.year === viewYear && parsed?.month === idx + 1;
                  const isToday = currentYear === viewYear && currentMonthIdx === idx;
                  const disabledMonth = isMonthDisabled(viewYear, idx);

                  return (
                    <button
                      data-component-id={
                        componentId
                          ? `${componentId}.month-${mes.num}`
                          : `erp.monthpicker.month-${mes.num}`
                      }
                      key={mes.num}
                      type="button"
                      disabled={disabledMonth}
                      onClick={() => handleSelectMonth(idx)}
                      className={twMerge(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-[var(--radius-control)] text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs font-bold ring-1 ring-primary"
                          : isToday
                            ? "border border-primary/40 text-primary hover:bg-primary-soft font-bold"
                            : "text-surface-foreground hover:bg-surface-hover",
                        disabledMonth && "opacity-35 cursor-not-allowed hover:bg-transparent",
                      )}
                    >
                      <span>{mes.short}</span>
                      <span
                        className={twMerge(
                          "text-[10px] font-normal tabular-nums opacity-70",
                          isSelected && "opacity-90",
                        )}
                      >
                        {mes.num}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between gap-2">
                <button
                  data-component-id={componentId ? `${componentId}.clear` : "erp.monthpicker.clear"}
                  type="button"
                  onClick={handleClear}
                  className="min-h-6 text-xs text-muted-foreground hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded px-1.5 transition-colors cursor-pointer font-medium"
                >
                  Limpar
                </button>
                <button
                  data-component-id={
                    componentId ? `${componentId}.current-month` : "erp.monthpicker.current-month"
                  }
                  type="button"
                  disabled={isCurrentMonthDisabled}
                  onClick={handleThisMonth}
                  className="min-h-6 text-xs text-primary hover:bg-primary-soft font-semibold px-2 py-1 rounded-[var(--radius-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Mês Atual
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </FieldWrapper>
  );
}
