"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Clock, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useEscKey } from "../Modal";
import { useAccessControl } from "../useAccessControl";

export type TimePickerFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  componentId?: string;
  stepMinutes?: number;
  /** Quick preset times displayed at the top of the popover (pass `[]` to hide) */
  quickTimes?: readonly string[];
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

const DEFAULT_QUICK_TIMES = ["08:00", "09:00", "12:00", "14:00", "18:00"] as const;

function normalizeTimeString(raw?: string): string {
  if (!raw) return "";
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return raw;
}

export default function TimePickerField({
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
  disabled,
  readOnly,
  size = "md",
  placeholder = "--:--",
  componentId,
  stepMinutes = 5,
  quickTimes = DEFAULT_QUICK_TIMES,
  hideIfDenied = false,
}: TimePickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const [internalValue, setInternalValue] = useState(() => normalizeTimeString(defaultValue));
  const [editingText, setEditingText] = useState<string | null>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    zIndex: 9200,
  });

  const committedTime = useMemo(
    () => normalizeTimeString(value !== undefined ? value : internalValue),
    [value, internalValue],
  );
  const typedValue = editingText !== null ? editingText : committedTime;

  const commitTime = (next: string) => {
    setEditingText(null);
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
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

  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!typedValue) return [null, null];
    const match = typedValue.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return [null, null];
    return [match[1].padStart(2, "0"), match[2]];
  }, [typedValue]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      commitTime("");
      return;
    }

    let clean = raw.replace(/\D/g, "");
    if (clean.length > 4) clean = clean.slice(0, 4);

    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }

    setEditingText(formatted);

    if (clean.length === 4) {
      const hour = Number(clean.slice(0, 2));
      const min = Number(clean.slice(2, 4));
      if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59) {
        const val = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        commitTime(val);
      }
    }
  }

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const panelWidth = Math.min(272, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - panelWidth - 12);
    const estHeight = quickTimes.length > 0 ? 316 : 264;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < estHeight && spaceAbove > spaceBelow;
    const top = openAbove ? Math.max(12, rect.top - estHeight - 6) : rect.bottom + 6;

    setPanelStyle({
      position: "fixed",
      left,
      top,
      width: panelWidth,
      zIndex: 9200,
      pointerEvents: "auto",
      visibility: "visible",
    });
  }, [quickTimes.length]);

  const handleOpen = () => {
    if (effectiveDisabled || readOnly) return;
    updatePosition();
    setOpen(true);
  };

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

  function handleSelectHour(h: string) {
    const min = selectedMinute || "00";
    commitTime(`${h}:${min}`);
  }

  function handleSelectMinute(m: string) {
    const h = selectedHour || "08";
    commitTime(`${h}:${m}`);
    closePanel();
  }

  function handleQuickSelect(t: string) {
    commitTime(t);
    closePanel();
  }

  function handleNow() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    commitTime(`${h}:${m}`);
    closePanel();
  }

  function handleClear() {
    commitTime("");
    closePanel();
  }

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), []);
  const minutes = useMemo(() => {
    const step = Math.max(1, stepMinutes);
    const list: string[] = [];
    for (let i = 0; i < 60; i += step) {
      list.push(String(i).padStart(2, "0"));
    }
    return list;
  }, [stepMinutes]);

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
      <div ref={containerRef} className="relative">
        <div className="relative flex items-center">
          <input
            data-component-id={componentId ? `${componentId}.input` : "erp.timepicker.input"}
            id={id}
            name={name ?? `timepicker_off_${id}`}
            type="text"
            inputMode="numeric"
            value={typedValue}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            readOnly={readOnly}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={handleInputChange}
            onFocus={handleOpen}
            onBlur={() => setEditingText(null)}
            className={twMerge(
              "flex w-full items-center gap-2 rounded-[var(--radius-control)] border bg-input pr-9 text-left font-mono tabular-nums text-input-foreground placeholder:text-input-placeholder outline-none transition-[background-color,border-color,box-shadow] duration-150",
              size === "sm" ? "h-8 text-xs px-2.5" : size === "lg" ? "h-12 text-base px-4" : "h-10 text-sm px-3",
              error
                ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/15"
                : "border-input-border hover:border-border-strong focus:border-ring focus:ring-3 focus:ring-ring/12",
              (effectiveDisabled || readOnly) && "cursor-not-allowed opacity-60 bg-surface-muted",
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
          <button
            data-component-id={componentId ? `${componentId}.toggle` : "erp.timepicker.toggle"}
            type="button"
            disabled={effectiveDisabled || readOnly}
            onClick={handleToggle}
            className="absolute right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
            aria-label="Abrir seletor de horário"
          >
            <Clock size={14} />
          </button>
        </div>

        {open &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={panelRef}
              data-floating-open="true"
              style={panelStyle}
              className="pointer-events-auto z-[9200] flex flex-col rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground p-3 shadow-[var(--shadow-floating)] select-none animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Clock size={14} className="text-primary" />
                  <span>Selecionar horário</span>
                </div>
                <button
                  type="button"
                  aria-label="Fechar seletor de horário"
                  onClick={closePanel}
                  data-component-id={componentId ? `${componentId}.close` : "erp.timepicker.close"}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              {quickTimes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mb-2.5 pb-2.5 border-b border-border">
                  <button
                    type="button"
                    onClick={handleNow}
                    data-component-id={componentId ? `${componentId}.now` : "erp.timepicker.now"}
                    className="h-6 px-2 rounded-md text-[11px] font-semibold bg-primary-soft text-primary-soft-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition cursor-pointer"
                  >
                    Agora
                  </button>
                  {quickTimes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleQuickSelect(t)}
                      data-component-id={
                        componentId
                          ? `${componentId}.quick-${t.replace(":", "")}`
                          : `erp.timepicker.quick-${t.replace(":", "")}`
                      }
                      className={twMerge(
                        "h-6 px-2 rounded-md text-[11px] font-mono tabular-nums transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        typedValue === t
                          ? "bg-primary text-primary-foreground font-bold"
                          : "bg-surface-muted text-surface-foreground hover:bg-surface-hover",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 h-44 max-h-44 min-h-0">
                <div className="flex flex-col h-full min-h-0 border border-border rounded-[var(--radius-control)] p-1 bg-surface-muted/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center py-0.5 border-b border-border shrink-0">
                    Hora
                  </span>
                  <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 p-0.5 space-y-0.5">
                    {hours.map((h) => {
                      const isSelected = selectedHour === h;
                      return (
                        <button
                          data-component-id={
                            componentId ? `${componentId}.hour-${h}` : `erp.timepicker.hour-${h}`
                          }
                          key={h}
                          type="button"
                          onClick={() => handleSelectHour(h)}
                          className={twMerge(
                            "w-full min-h-6 py-1 px-2 rounded-md text-xs font-mono tabular-nums font-medium flex items-center justify-between transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "hover:bg-surface-hover text-surface-foreground",
                          )}
                        >
                          <span>{h}h</span>
                          {isSelected && <Check size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col h-full min-h-0 border border-border rounded-[var(--radius-control)] p-1 bg-surface-muted/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center py-0.5 border-b border-border shrink-0">
                    Min
                  </span>
                  <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 p-0.5 space-y-0.5">
                    {minutes.map((m) => {
                      const isSelected = selectedMinute === m;
                      return (
                        <button
                          data-component-id={
                            componentId ? `${componentId}.min-${m}` : `erp.timepicker.min-${m}`
                          }
                          key={m}
                          type="button"
                          onClick={() => handleSelectMinute(m)}
                          className={twMerge(
                            "w-full min-h-6 py-1 px-2 rounded-md text-xs font-mono tabular-nums font-medium flex items-center justify-between transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "hover:bg-surface-hover text-surface-foreground",
                          )}
                        >
                          <span>:{m}</span>
                          {isSelected && <Check size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between">
                <button
                  data-component-id={componentId ? `${componentId}.clear` : "erp.timepicker.clear"}
                  type="button"
                  onClick={handleClear}
                  className="min-h-6 px-1.5 rounded text-xs text-muted-foreground hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition cursor-pointer font-medium"
                >
                  Limpar
                </button>
                <div className="flex items-center gap-1.5">
                  {quickTimes.length === 0 && (
                    <button
                      data-component-id={componentId ? `${componentId}.now` : "erp.timepicker.now"}
                      type="button"
                      onClick={handleNow}
                      className="min-h-6 px-2.5 py-1 rounded-[var(--radius-control)] bg-surface-muted hover:bg-surface-hover text-surface-foreground text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition cursor-pointer"
                    >
                      Agora
                    </button>
                  )}
                  <button
                    data-component-id={
                      componentId ? `${componentId}.confirm` : "erp.timepicker.confirm"
                    }
                    type="button"
                    onClick={closePanel}
                    className="min-h-6 px-3 py-1 rounded-[var(--radius-control)] bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition cursor-pointer shadow-xs"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </FieldWrapper>
  );
}
