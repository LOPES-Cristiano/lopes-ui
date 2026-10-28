"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
  /** Valor no formato YYYY-MM (ex: 2026-09) */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  componentId?: string;
};

export default function MonthPickerField({
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
  readOnly,
  size = "sm",
  placeholder = "Selecione o mês",
  componentId,
}: MonthPickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const currentValue = value !== undefined ? value : defaultValue;
  const parsed = useMemo(() => parseYearMonth(currentValue), [currentValue]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const [viewYear, setViewYear] = useState<number>(parsed?.year ?? currentYear);

  useEffect(() => {
    if (parsed?.year) {
      setViewYear(parsed.year);
    }
  }, [parsed?.year]);

  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    zIndex: 99999,
  });

  const displayString = useMemo(() => {
    if (!parsed) return "";
    const mesObj = MESES[parsed.month - 1];
    return mesObj ? `${mesObj.full} de ${parsed.year}` : currentValue || "";
  }, [parsed, currentValue]);

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = 280;
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    const panelHeight = 260;
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
      width,
      zIndex: 99999,
      pointerEvents: "auto",
      visibility: "visible",
    });
  }, []);

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

  const handleToggle = () => {
    if (disabled || readOnly) return;
    if (!open) {
      if (parsed?.year) setViewYear(parsed.year);
      updatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleSelectMonth = (monthIdx: number) => {
    if (readOnly || disabled) return;
    const mm = String(monthIdx + 1).padStart(2, "0");
    const formatted = `${viewYear}-${mm}`;
    onChange?.(formatted);
    setOpen(false);
  };

  const handleThisMonth = () => {
    if (readOnly || disabled) return;
    const mm = String(currentMonthIdx + 1).padStart(2, "0");
    const formatted = `${currentYear}-${mm}`;
    setViewYear(currentYear);
    onChange?.(formatted);
    setOpen(false);
  };

  const handleClear = () => {
    if (readOnly || disabled) return;
    onChange?.("");
    setOpen(false);
  };

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
      <div ref={containerRef} className="relative w-full">
        <button
          data-component-id={componentId ? `${componentId}.toggle` : "erp.monthpicker.toggle"}
          id={id}
          type="button"
          onClick={handleToggle}
          disabled={disabled || readOnly}
          className={twMerge(
            "flex w-full items-center justify-between gap-2 rounded-lg border bg-card text-foreground transition-all duration-150 text-left outline-none cursor-pointer",
            size === "sm" ? "h-8 text-xs px-2.5" : size === "lg" ? "h-12 text-base px-4" : "h-10 text-sm px-3",
            error
              ? "border-destructive focus:ring-2 focus:ring-destructive/20"
              : "border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
            (disabled || readOnly) && "cursor-not-allowed opacity-60 bg-muted/30"
          )}
          >
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className={twMerge("truncate font-medium", !displayString && "text-muted-foreground font-normal")}>
              {displayString || placeholder}
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase px-1 py-0.5 rounded bg-muted/60 shrink-0">
            {parsed ? `${String(parsed.month).padStart(2, "0")}/${parsed.year}` : "--/--"}
          </span>
        </button>

        {open && typeof document !== "undefined" && createPortal(
          <div
            ref={panelRef}
            data-floating-open="true"
            style={panelStyle}
            className="pointer-events-auto flex flex-col rounded-xl border border-border bg-card p-3 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 select-none"
          >
            {/* Header com Ano e Navegação */}
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
              <div className="flex items-center gap-1">
                <button
                  data-component-id={componentId ? `${componentId}.prev-year` : "erp.monthpicker.prev-year"}
                  type="button"
                  onClick={() => setViewYear((y) => y - 1)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Ano anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-foreground px-1.5 font-mono">
                  {viewYear}
                </span>
                <button
                  data-component-id={componentId ? `${componentId}.next-year` : "erp.monthpicker.next-year"}
                  type="button"
                  onClick={() => setViewYear((y) => y + 1)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Próximo ano"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                data-component-id={componentId ? `${componentId}.close` : "erp.monthpicker.close"}
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid 3x4 de Meses */}
            <div className="grid grid-cols-3 gap-1.5">
              {MESES.map((mes, idx) => {
                const isSelected = parsed?.year === viewYear && parsed?.month === idx + 1;
                const isToday = currentYear === viewYear && currentMonthIdx === idx;

                return (
                  <button
                    data-component-id={componentId ? `${componentId}.month-${mes.num}` : `erp.monthpicker.month-${mes.num}`}
                    key={mes.num}
                    type="button"
                    onClick={() => handleSelectMonth(idx)}
                    className={twMerge(
                      "flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs font-bold ring-1 ring-primary"
                        : isToday
                          ? "border border-primary/40 text-primary hover:bg-primary/10 font-bold"
                          : "text-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>{mes.short}</span>
                    <span className={twMerge("text-[10px] font-normal opacity-70", isSelected && "opacity-90")}>
                      {mes.num}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer de Ações Rápidas */}
            <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between gap-2">
              <button
                data-component-id={componentId ? `${componentId}.clear` : "erp.monthpicker.clear"}
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium px-1"
              >
                Limpar
              </button>
              <button
                data-component-id={componentId ? `${componentId}.current-month` : "erp.monthpicker.current-month"}
                type="button"
                onClick={handleThisMonth}
                className="text-xs text-primary hover:bg-primary/10 font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                Mês Atual
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </FieldWrapper>
  );
}

function parseYearMonth(value?: string | null) {
  if (!value || typeof value !== "string") return null;
  const parts = value.trim().split("-");
  if (parts.length < 2) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!year || isNaN(year) || !month || isNaN(month) || month < 1 || month > 12) return null;
  return { year, month };
}