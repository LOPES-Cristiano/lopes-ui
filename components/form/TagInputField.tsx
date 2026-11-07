"use client";

import React, { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "../../utils/cn";
import FieldWrapper from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export interface TagInputFieldProps {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Rótulo do campo */
  label?: string;
  /** Dica contextual exibida no ícone (?) ao lado do rótulo */
  tooltip?: string;
  /** Lista de tags (controlado) */
  value?: string[];
  /** Lista inicial de tags (não-controlado) */
  defaultValue?: string[];
  /** Callback ao alterar as tags */
  onChange?: (tags: string[]) => void;
  /** Placeholder do input */
  placeholder?: string;
  /** Sugestões rápidas clicáveis abaixo do campo */
  suggestions?: string[];
  /** Limite máximo de tags */
  maxTags?: number;
  /** Permite tags duplicadas */
  allowDuplicates?: boolean;
  /** Texto de ajuda no rodapé */
  helpText?: string;
  /** Dica no cabeçalho */
  hint?: string;
  /** Mensagem de erro */
  error?: string;
  /** Campo obrigatório */
  required?: boolean;
  /** Desabilita o campo */
  disabled?: boolean;
  /** Classes adicionais */
  className?: string;
}

export default function TagInputField({
  label,
  tooltip,
  value: controlledValue,
  defaultValue = [],
  onChange,
  placeholder = "Digite e pressione Enter...",
  suggestions = [],
  maxTags,
  allowDuplicates = false,
  helpText,
  hint,
  error,
  required,
  disabled: propDisabled,
  className,
  componentId,
  hideIfDenied = false,
}: TagInputFieldProps) {
  const id = useId();
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const [inputVal, setInputVal] = useState("");

  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  if (!hasAccess && hideIfDenied) return null;

  const disabled = propDisabled || !hasAccess;
  const tags = controlledValue ?? internalTags;
  const isAtMax = maxTags !== undefined && tags.length >= maxTags;

  const updateTags = (next: string[]) => {
    if (controlledValue === undefined) setInternalTags(next);
    onChange?.(next);
  };

  const addTag = (raw: string) => {
    const cleaned = raw.trim();
    if (!cleaned || disabled || isAtMax) return;
    if (!allowDuplicates && tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setInputVal("");
      return;
    }
    updateTags([...tags, cleaned]);
    setInputVal("");
  };

  const removeTag = (index: number) => {
    if (disabled) return;
    updateTags(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === "Backspace" && !inputVal && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const availableSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <FieldWrapper
      id={id}
      label={label}
      tooltip={tooltip}
      hint={hint ?? (maxTags ? `${tags.length}/${maxTags}` : undefined)}
      helpText={helpText}
      error={error}
      required={required}
      className={className}
    >
      <div data-component-id={componentId} className="space-y-2">
        <div
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-[var(--radius-control)] border bg-input px-2.5 py-1.5 transition-[border-color,box-shadow] focus-within:ring-3",
            error
              ? "border-danger focus-within:border-danger focus-within:ring-danger/15"
              : "border-input-border hover:border-border-strong focus-within:border-ring focus-within:ring-ring/12",
            disabled && "opacity-60 pointer-events-none bg-surface-muted"
          )}
        >
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 rounded-md bg-primary-soft border border-primary/20 pl-2 pr-0.5 py-0.5 text-xs font-medium text-primary-soft-foreground"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                disabled={disabled}
                aria-label={`Remover ${tag}`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-primary-soft-foreground/75 hover:bg-primary/15 hover:text-primary-soft-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <input
            id={id}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputVal.trim()) addTag(inputVal);
            }}
            disabled={disabled || isAtMax}
            placeholder={isAtMax ? "Limite atingido" : placeholder}
            className="flex-1 min-w-[120px] bg-transparent text-xs sm:text-sm text-input-foreground placeholder:text-input-placeholder focus:outline-none"
          />
        </div>

        {availableSuggestions.length > 0 && !isAtMax && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground mr-0.5">Sugestões:</span>
            {availableSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => addTag(s)}
                className="inline-flex min-h-6 items-center gap-1 rounded-md border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
              >
                <Plus size={10} />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
