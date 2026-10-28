"use client";

import React, { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/utils/cn";
import FieldWrapper from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

export interface TagInputFieldProps {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Rótulo do campo */
  label?: string;
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
      hint={hint ?? (maxTags ? `${tags.length}/${maxTags}` : undefined)}
      helpText={helpText}
      error={error}
      required={required}
      className={className}
    >
      <div className="space-y-2">
        <div
          className={cn(
            "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-input px-2.5 py-1.5 transition-all focus-within:ring-2",
            error
              ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-500/20"
              : "border-input-border focus-within:border-ring focus-within:ring-ring/20",
            disabled && "opacity-60 pointer-events-none bg-zinc-50 dark:bg-zinc-900"
          )}
        >
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                disabled={disabled}
                aria-label={`Remover ${tag}`}
                className="rounded-sm text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors"
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
            className="flex-1 min-w-[120px] bg-transparent text-xs text-foreground placeholder:text-input-placeholder focus:outline-none"
          />
        </div>

        {/* Quick suggestions */}
        {availableSuggestions.length > 0 && !isAtMax && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mr-0.5">Sugestões:</span>
            {availableSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => addTag(s)}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
