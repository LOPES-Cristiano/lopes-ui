"use client";

import React, { useId, useState } from "react";
import { Check, Pipette } from "lucide-react";
import { cn } from "@/utils/cn";
import FieldWrapper from "./FieldWrapper";
import { CopyButton } from "../Snippet";
import { useAccessControl } from "../useAccessControl";

export interface ColorPickerFieldProps {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Rótulo do campo */
  label?: string;
  /** Cor selecionada em formato HEX (controlado) */
  value?: string;
  /** Cor inicial (não-controlado) */
  defaultValue?: string;
  /** Callback ao alterar a cor */
  onChange?: (color: string) => void;
  /** Paleta de cores rápidas */
  swatches?: string[];
  /** Texto de ajuda no rodapé */
  helpText?: string;
  /** Dica no cabeçalho */
  hint?: string;
  /** Mensagem de erro */
  error?: string;
  /** Campo obrigatório */
  required?: boolean;
  /** Desabilita interação */
  disabled?: boolean;
  /** Mostra botão para copiar o código HEX */
  showCopy?: boolean;
  /** Classes adicionais */
  className?: string;
}

const DEFAULT_SWATCHES = [
  "#4f46e5", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#18181b", // zinc-900
  "#71717a", // zinc-500
];

export default function ColorPickerField({
  label,
  value: controlledValue,
  defaultValue = "#4f46e5",
  onChange,
  swatches = DEFAULT_SWATCHES,
  helpText,
  hint,
  error,
  required,
  disabled: propDisabled,
  showCopy = true,
  className,
  componentId,
  hideIfDenied = false,
}: ColorPickerFieldProps) {
  const id = useId();
  const [internalColor, setInternalColor] = useState(defaultValue);

  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  if (!hasAccess && hideIfDenied) return null;

  const disabled = propDisabled || !hasAccess;
  const currentColor = controlledValue ?? internalColor;

  const handleSelect = (next: string) => {
    if (disabled) return;
    if (controlledValue === undefined) setInternalColor(next);
    onChange?.(next);
  };

  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      helpText={helpText}
      error={error}
      required={required}
      className={className}
    >
      <div className={cn("space-y-2.5", disabled && "opacity-60 pointer-events-none")}>
        {/* Input bar */}
        <div className="flex items-center gap-2">
          <label
            htmlFor={`${id}-native`}
            className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xs"
            style={{ backgroundColor: currentColor }}
            title="Abrir seletor de cor do sistema"
          >
            <input
              id={`${id}-native`}
              type="color"
              value={currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : "#4f46e5"}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={disabled}
              className="sr-only"
            />
            <Pipette size={13} className="text-white drop-shadow" />
          </label>

          <input
            id={id}
            type="text"
            value={currentColor}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={disabled}
            maxLength={9}
            placeholder="#4F46E5"
            className={cn(
              "h-8 w-32 rounded-lg border bg-input px-2.5 font-mono text-xs uppercase text-foreground transition-all focus:outline-none focus:ring-2",
              error
                ? "border-red-400 focus:ring-red-500/20"
                : "border-input-border focus:border-ring focus:ring-ring/20"
            )}
          />

          {showCopy && <CopyButton value={currentColor} size="sm" variant="outline" />}
        </div>

        {/* Swatches */}
        {swatches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {swatches.map((swatch) => {
              const isSelected = swatch.toLowerCase() === currentColor.toLowerCase();
              return (
                <button
                  key={swatch}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(swatch)}
                  title={swatch}
                  aria-label={`Selecionar cor ${swatch}`}
                  style={{ backgroundColor: swatch }}
                  className={cn(
                    "relative flex size-6 items-center justify-center rounded-md border border-black/10 dark:border-white/15 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                    isSelected && "ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-zinc-900 scale-105"
                  )}
                >
                  {isSelected && <Check size={12} className="text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
