"use client";

import React, { useId, useState } from "react";
import { Check, Pipette } from "lucide-react";
import { cn } from "../../utils/cn";
import FieldWrapper from "./FieldWrapper";
import { CopyButton } from "../Snippet";
import { useAccessControl } from "../useAccessControl";

export interface ColorPickerFieldProps {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Rótulo do campo */
  label?: string;
  /** Dica contextual exibida no ícone (?) ao lado do rótulo */
  tooltip?: string;
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
  /** Alias para helpText */
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
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#18181b",
  "#71717a",
];

export default function ColorPickerField({
  label,
  tooltip,
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
      tooltip={tooltip}
      hint={hint}
      helpText={helpText}
      error={error}
      required={required}
      className={className}
    >
      <div
        data-component-id={componentId}
        className={cn("space-y-2.5", disabled && "opacity-60 pointer-events-none")}
      >
        <div className="flex items-center gap-2">
          <label
            htmlFor={`${id}-native`}
            aria-label="Abrir seletor de cor do sistema"
            className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-border shadow-xs focus-within:ring-2 focus-within:ring-ring/40"
            style={{ backgroundColor: currentColor }}
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
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="#4F46E5"
            className={cn(
              "h-8 w-32 rounded-[var(--radius-control)] border bg-input px-2.5 font-mono text-xs uppercase text-input-foreground placeholder:text-input-placeholder transition-[border-color,box-shadow] focus:outline-none focus:ring-3",
              error
                ? "border-danger focus:border-danger focus:ring-danger/15"
                : "border-input-border hover:border-border-strong focus:border-ring focus:ring-ring/12"
            )}
          />

          {showCopy && <CopyButton value={currentColor} size="sm" variant="outline" />}
        </div>

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
                  aria-label={`Selecionar cor ${swatch}`}
                  aria-pressed={isSelected}
                  style={{ backgroundColor: swatch }}
                  className={cn(
                    "relative flex size-6 items-center justify-center rounded-md border border-black/10 dark:border-white/15 transition-transform hover:scale-110 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background cursor-pointer",
                    isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background scale-105"
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
