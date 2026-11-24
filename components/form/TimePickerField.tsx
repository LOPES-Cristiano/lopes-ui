"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Clock, Moon, RotateCcw, Sun, X, Zap } from "lucide-react";
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
  /** Optional subtitle displayed in the popover header */
  subtitle?: string;
  /** Optional duration or contextual info displayed in the right preview panel (e.g. "1h", "45min") */
  durationLabel?: React.ReactNode;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

const DEFAULT_QUICK_TIMES = ["08:00", "09:00", "12:00"] as const;

function normalizeTimeString(raw?: string): string {
  if (!raw) return "";
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return raw;
}

function parseHourMinute(val: string): [string | null, string | null] {
  if (!val) return [null, null];
  const match = val.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return [null, null];
  return [match[1].padStart(2, "0"), match[2]];
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
  subtitle = "Escolha o horário de forma rápida ou selecione manualmente.",
  durationLabel,
  hideIfDenied = false,
}: TimePickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoursListRef = useRef<HTMLDivElement>(null);
  const minutesListRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const [internalValue, setInternalValue] = useState(() => normalizeTimeString(defaultValue));
  const [editingText, setEditingText] = useState<string | null>(null);
  const [draftTime, setDraftTime] = useState<string>("");
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

  const commitTime = useCallback(
    (next: string) => {
      setEditingText(null);
      if (value === undefined) setInternalValue(next);
      onChange?.(next);
    },
    [onChange, value],
  );

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

  const activeTime = open ? draftTime : typedValue;
  const [selectedHour, selectedMinute] = useMemo(() => parseHourMinute(activeTime), [activeTime]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setDraftTime("");
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
        setDraftTime(val);
        commitTime(val);
      }
    }
  }

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const panelWidth = Math.min(520, window.innerWidth - 24);
    const estHeight = quickTimes.length > 0 ? 410 : 340;
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - panelWidth - 12);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < estHeight && spaceAbove > spaceBelow;
    const top = openAbove
      ? Math.max(12, rect.top - estHeight - 8)
      : Math.min(rect.bottom + 8, Math.max(12, window.innerHeight - estHeight - 12));

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
    setDraftTime(committedTime);
    updatePosition();
    setOpen(true);
  };

  const handleToggle = () => {
    if (effectiveDisabled || readOnly) return;
    if (!open) {
      setDraftTime(committedTime);
      updatePosition();
      setOpen(true);
    } else {
      closePanel();
    }
  };

  useEffect(() => {
    if (!open) return;

    const rafId = window.requestAnimationFrame(() => {
      updatePosition();
      const selH = hoursListRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
      selH?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      const selM = minutesListRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
      selM?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    });

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
    const min = selectedMinute ?? "00";
    setDraftTime(`${h}:${min}`);
  }

  function handleSelectMinute(m: string) {
    const h = selectedHour ?? "08";
    setDraftTime(`${h}:${m}`);
  }

  function handleQuickSelect(t: string) {
    setDraftTime(t);
  }

  function handleNow() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    setDraftTime(`${h}:${m}`);
  }

  function handleConfirm() {
    commitTime(draftTime);
    closePanel();
  }

  function handleClear() {
    setDraftTime("");
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

  const describedBy = error ? `${id}-error` : helpText || hint ? `${id}-help` : undefined;
  const visibleQuickTimes = quickTimes.slice(0, 3);

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
              size === "sm"
                ? "h-8 text-xs px-2.5"
                : size === "lg"
                  ? "h-12 text-base px-4"
                  : "h-10 text-sm px-3",
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
              className="pointer-events-auto z-[9200] flex flex-col rounded-[var(--radius-overlay)] border border-border bg-card text-card-foreground shadow-[var(--shadow-overlay)] overflow-hidden select-none animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
            >
              {/* Cabeçalho */}
              <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-border bg-card">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                    <Clock size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground leading-snug">
                      Selecionar Horário
                    </div>
                    {subtitle && (
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Fechar seletor de horário"
                  onClick={closePanel}
                  data-component-id={componentId ? `${componentId}.close` : "erp.timepicker.close"}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Corpo: Coluna de Seleção + Painel de Pré-visualização */}
              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_168px]">
                {/* Esquerda: Horários rápidos + Colunas Horas / Minutos */}
                <div className="p-4 space-y-3.5 min-w-0">
                  {quickTimes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-medium text-muted-foreground">
                        Horários rápidos
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={handleNow}
                          data-component-id={componentId ? `${componentId}.now` : "erp.timepicker.now"}
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-[var(--radius-control)] border border-primary/35 bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
                        >
                          <Zap size={12} className="shrink-0" />
                          <span>Agora</span>
                        </button>
                        {visibleQuickTimes.map((t) => {
                          const hourNum = Number(t.slice(0, 2));
                          const isNight = hourNum >= 18 || hourNum < 6;
                          const isActive = draftTime === t;
                          return (
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
                                "inline-flex h-8 items-center justify-center gap-1 rounded-[var(--radius-control)] border px-2 text-xs font-mono tabular-nums font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                isActive
                                  ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "border-border bg-muted/35 text-foreground hover:bg-muted",
                              )}
                            >
                              {isNight ? (
                                <Moon size={12} className="shrink-0 opacity-75" />
                              ) : (
                                <Sun size={12} className="shrink-0 opacity-75" />
                              )}
                              <span>{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Colunas Horas & Minutos */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Horas */}
                    <div className="flex flex-col h-52 rounded-xl border border-border bg-muted/20 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-card/60 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Clock size={12} className="text-muted-foreground" />
                          <span>Horas</span>
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                          0 – 23
                        </span>
                      </div>
                      <div
                        ref={hoursListRef}
                        className="flex-1 overflow-y-auto overscroll-contain p-1.5 space-y-0.5"
                      >
                        {hours.map((h) => {
                          const isSelected = selectedHour === h;
                          return (
                            <button
                              data-component-id={
                                componentId ? `${componentId}.hour-${h}` : `erp.timepicker.hour-${h}`
                              }
                              data-selected={isSelected ? "true" : undefined}
                              key={h}
                              type="button"
                              onClick={() => handleSelectHour(h)}
                              className={twMerge(
                                "w-full h-8 px-3 rounded-lg text-sm font-mono tabular-nums flex items-center justify-between transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                isSelected
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "text-foreground/85 hover:bg-muted",
                              )}
                            >
                              <span>{h}</span>
                              {isSelected && <Check size={14} strokeWidth={2.5} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Minutos */}
                    <div className="flex flex-col h-52 rounded-xl border border-border bg-muted/20 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-card/60 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Clock size={12} className="text-muted-foreground" />
                          <span>Minutos</span>
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                          0 – 59
                        </span>
                      </div>
                      <div
                        ref={minutesListRef}
                        className="flex-1 overflow-y-auto overscroll-contain p-1.5 space-y-0.5"
                      >
                        {minutes.map((m) => {
                          const isSelected = selectedMinute === m;
                          return (
                            <button
                              data-component-id={
                                componentId ? `${componentId}.min-${m}` : `erp.timepicker.min-${m}`
                              }
                              data-selected={isSelected ? "true" : undefined}
                              key={m}
                              type="button"
                              onClick={() => handleSelectMinute(m)}
                              onDoubleClick={() => {
                                const h = selectedHour ?? "08";
                                commitTime(`${h}:${m}`);
                                closePanel();
                              }}
                              className={twMerge(
                                "w-full h-8 px-3 rounded-lg text-sm font-mono tabular-nums flex items-center justify-between transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                isSelected
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "text-foreground/85 hover:bg-muted",
                              )}
                            >
                              <span>{m}</span>
                              {isSelected && <Check size={14} strokeWidth={2.5} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direita: Painel de Resumo / Pré-visualização */}
                <div className="hidden sm:flex flex-col items-center justify-center gap-3 p-5 border-l border-border bg-muted/15 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/25 bg-primary/10 text-primary shadow-2xs">
                    <Clock size={26} strokeWidth={1.8} />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-xs text-muted-foreground">
                      Horário selecionado
                    </span>
                    <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-foreground">
                      {draftTime || "--:--"}
                    </div>
                  </div>
                  {durationLabel && (
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
                      <Clock size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Duração</span>
                      <span className="font-semibold text-primary">{durationLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé */}
              <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
                <button
                  data-component-id={componentId ? `${componentId}.clear` : "erp.timepicker.clear"}
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-control)] px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Limpar</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    data-component-id={componentId ? `${componentId}.cancel` : "erp.timepicker.cancel"}
                    type="button"
                    onClick={closePanel}
                    className="inline-flex h-8 items-center justify-center rounded-[var(--radius-control)] border border-border bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    data-component-id={
                      componentId ? `${componentId}.confirm` : "erp.timepicker.confirm"
                    }
                    type="button"
                    onClick={handleConfirm}
                    className="inline-flex h-8 items-center justify-center rounded-[var(--radius-control)] bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer shadow-xs"
                  >
                    Confirmar
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
