"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
};

export default function TimePickerField({
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
  disabled,
  readOnly,
  size = "sm",
  placeholder = "--:--",
  componentId,
  stepMinutes = 5,
}: TimePickerFieldProps) {
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

  const currentTime = value ?? defaultValue ?? "";

  useEffect(() => {
    if (currentTime) {
      const match = currentTime.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        setTypedValue(`${match[1].padStart(2, "0")}:${match[2]}`);
      } else {
        setTypedValue(currentTime);
      }
    } else {
      setTypedValue("");
    }
  }, [currentTime]);

  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!typedValue) return [null, null];
    const match = typedValue.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return [null, null];
    return [match[1].padStart(2, "0"), match[2]];
  }, [typedValue]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setTypedValue("");
      onChange?.("");
      return;
    }

    let clean = raw.replace(/\D/g, "");
    if (clean.length > 4) clean = clean.slice(0, 4);

    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }

    setTypedValue(formatted);

    if (clean.length === 4) {
      const hour = Number(clean.slice(0, 2));
      const min = Number(clean.slice(2, 4));
      if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59) {
        const val = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        onChange?.(val);
      }
    }
  }

  const updatePosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = 190;
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < 260 && spaceAbove > spaceBelow;
    const top = openAbove ? Math.max(12, rect.top - 260 - 6) : rect.bottom + 4;

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

  const handleOpen = () => {
    if (disabled || readOnly) return;
    updatePosition();
    setOpen(true);
  };

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

  function handleSelectHour(h: string) {
    const min = selectedMinute || "00";
    const val = `${h}:${min}`;
    setTypedValue(val);
    onChange?.(val);
  }

  function handleSelectMinute(m: string) {
    const h = selectedHour || "08";
    const val = `${h}:${m}`;
    setTypedValue(val);
    onChange?.(val);
  }

  function handleNow() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const val = `${h}:${m}`;
    setTypedValue(val);
    onChange?.(val);
  }

  function handleClear() {
    setTypedValue("");
    onChange?.("");
    setOpen(false);
  }

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), []);
  const minutes = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < 60; i += stepMinutes) {
      list.push(String(i).padStart(2, "0"));
    }
    return list;
  }, [stepMinutes]);

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
          <input data-component-id={componentId ? `${componentId}.input` : "erp.timepicker.input"} id={id} name={name ?? `timepicker_off_${id}`} type="text" value={typedValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete="off"
            onChange={handleInputChange}
            onFocus={handleOpen}
            className={twMerge(
              "flex w-full items-center gap-2 rounded-md border bg-white dark:bg-zinc-900 pr-9 text-left font-mono outline-none transition-all duration-150",
              size === "sm" ? "h-8 text-xs px-2.5" : size === "lg" ? "h-12 text-base px-4" : "h-10 text-sm px-3",
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-zinc-300 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:focus:border-primary",
              (disabled || readOnly) && "cursor-not-allowed opacity-60",
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            />
          <button
            data-component-id={componentId ? `${componentId}.toggle` : "erp.timepicker.toggle"}
            type="button"
            disabled={disabled || readOnly}
            onClick={handleToggle}
            className="absolute right-2.5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Abrir seletor de horário"
          >
            <Clock size={14} />
          </button>
        </div>

        {open && panelStyle.left !== undefined && typeof document !== "undefined" && createPortal(
          <div
            ref={panelRef}
            data-floating-open="true"
            style={panelStyle}
            className="pointer-events-auto flex flex-col rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-2 shadow-xl z-[99999] select-none text-zinc-800 dark:text-zinc-200 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Colunas de Hora e Minuto - Fontes maiores e aproveitamento total */}
            <div className="grid grid-cols-2 gap-1.5 h-48 max-h-48 min-h-0">
              {/* Coluna Horas */}
              <div className="flex flex-col h-full min-h-0 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg p-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center py-1 shrink-0 border-b border-zinc-200/40 dark:border-zinc-800/40">
                  Hora
                </span>
                <div className="flex-1 overflow-y-auto min-h-0 space-y-1 p-0.5">
                  {hours.map((h) => {
                    const isSelected = selectedHour === h;
                    return (
                      <button
                        data-component-id={componentId ? `${componentId}.hour-${h}` : `erp.timepicker.hour-${h}`}
                        key={h}
                        type="button"
                        onClick={() => handleSelectHour(h)}
                        className={`w-full py-1.5 rounded text-center text-sm font-mono font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coluna Minutos */}
              <div className="flex flex-col h-full min-h-0 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg p-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center py-1 shrink-0 border-b border-zinc-200/40 dark:border-zinc-800/40">
                  Min
                </span>
                <div className="flex-1 overflow-y-auto min-h-0 space-y-1 p-0.5">
                  {minutes.map((m) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        data-component-id={componentId ? `${componentId}.min-${m}` : `erp.timepicker.min-${m}`}
                        key={m}
                        type="button"
                        onClick={() => handleSelectMinute(m)}
                        className={`w-full py-1.5 rounded text-center text-sm font-mono font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rodapé Limpo: Limpar na esquerda, Agora e OK na direita */}
            <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between px-0.5">
              <button
                data-component-id={componentId ? `${componentId}.clear` : "erp.timepicker.clear"}
                type="button"
                onClick={handleClear}
                className="text-xs text-zinc-400 hover:text-rose-500 transition cursor-pointer font-medium"
              >
                Limpar
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  data-component-id={componentId ? `${componentId}.now` : "erp.timepicker.now"}
                  type="button"
                  onClick={handleNow}
                  className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  Agora
                </button>
                <button
                  data-component-id={componentId ? `${componentId}.confirm` : "erp.timepicker.confirm"}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition cursor-pointer shadow-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </FieldWrapper>
  );
}