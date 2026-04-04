"use client";

import React, { useId, useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown, X } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

export type AutocompleteOption = { value: string; label: string };

function normalise(o: AutocompleteOption | string): AutocompleteOption {
  return typeof o === "string" ? { value: o, label: o } : o;
}

export type AutocompleteFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  /** Options list — can be plain strings or { value, label } objects */
  options: (AutocompleteOption | string)[];
  /** Controlled text value */
  value?: string;
  defaultValue?: string;
  /** Called on every keystroke with the raw input text */
  onChange?: (value: string) => void;
  /** Called when user picks an option */
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
  /** Max options to show in the dropdown */
  maxSuggestions?: number;
  emptyMessage?: string;
  clearable?: boolean;
  componentId?: string;
};

const SIZE = {
  sm: { h: "h-8",  text: "text-xs",   px: "px-2.5", iconSz: 14 },
  md: { h: "h-10", text: "text-sm",   px: "px-3",   iconSz: 15 },
  lg: { h: "h-12", text: "text-base", px: "px-4",   iconSz: 17 },
} as const;

export default function AutocompleteField({
  label, labelInline, labelWidth, required, tooltip, error, helpText, width, className,
  id: idProp, name,
  options: rawOptions,
  value: controlledValue,
  defaultValue = "",
  onChange, onSelect,
  placeholder = "Buscar...",
  disabled, size = "md", variant = "default",
  maxSuggestions = 10,
  emptyMessage = "Nenhum resultado encontrado",
  clearable = true,
  componentId,
}: AutocompleteFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];

  const [inputValue, setInputValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const options = rawOptions.map(normalise);
  const displayValue = controlledValue ?? inputValue;

  const filtered = options
    .filter((o) => o.label.toLowerCase().includes(displayValue.toLowerCase()))
    .slice(0, maxSuggestions);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      (listRef.current.children[highlighted] as HTMLElement)?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!controlledValue) setInputValue(v);
    onChange?.(v);
    setOpen(true);
    setHighlighted(-1);
  };

  const handleSelect = (opt: AutocompleteOption) => {
    if (!controlledValue) setInputValue(opt.label);
    onChange?.(opt.label);
    onSelect?.(opt);
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    if (!controlledValue) setInputValue("");
    onChange?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) handleSelect(filtered[highlighted]);
        break;
      case "Escape":
        setOpen(false);
        setHighlighted(-1);
        break;
    }
  };

  const wrapCls = twMerge(
    "relative flex w-full items-center overflow-hidden rounded-lg border transition-all duration-150",
    variant === "filled"
      ? "bg-zinc-100 border-transparent hover:bg-zinc-200/70 focus-within:bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-500/10 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 dark:focus-within:bg-zinc-900 dark:focus-within:border-zinc-600"
      : "bg-white border-zinc-300 hover:border-zinc-400 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500/10 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-600 dark:focus-within:border-zinc-500",
    error && "border-red-400 hover:border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10",
    disabled && "opacity-60 pointer-events-none bg-zinc-50 dark:bg-zinc-800/50",
  );

  const hasClear = clearable && !!displayValue;

  const inputCls = twMerge(
    "flex-1 min-w-0 bg-transparent outline-none border-0 ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
    s.h, s.text, s.px,
    hasClear ? "pr-14" : "pr-9",
  );

  return (
    <FieldWrapper
      id={id} label={label} labelInline={labelInline} labelWidth={labelWidth}
      required={required} tooltip={tooltip} error={error} helpText={helpText}
      width={width} className={className}
    >
      <div ref={containerRef} className="relative">
        <div className={wrapCls}>
          <input
            ref={inputRef}
            id={id} name={name}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={`${id}-listbox`}
            aria-activedescendant={highlighted >= 0 ? `${id}-opt-${highlighted}` : undefined}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            className={inputCls}
            {...(componentId ? { "data-component-id": componentId } : {})}
          />
          <span className="absolute right-0 top-0 flex h-full items-center gap-0.5 pr-2 pointer-events-none">
            {hasClear && (
              <button
                type="button"
                aria-label="Limpar"
                onClick={handleClear}
                className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                <X size={12} />
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              aria-label={open ? "Fechar" : "Abrir"}
              onClick={() => { setOpen((o) => !o); inputRef.current?.focus(); }}
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
            >
              <ChevronDown
                size={14}
                className={twMerge("transition-transform duration-150", open && "rotate-180")}
              />
            </button>
          </span>
        </div>

        {/* Dropdown */}
        {open && (
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            className={twMerge(
              "absolute left-0 right-0 top-full z-[80] mt-1",
              "max-h-52 overflow-y-auto overscroll-contain",
              "rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 shadow-xl shadow-black/5",
              s.text,
            )}
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-zinc-400 dark:text-zinc-500">{emptyMessage}</li>
            ) : (
              filtered.map((opt, i) => (
                <li
                  key={opt.value}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={displayValue === opt.label}
                  onMouseDown={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={twMerge(
                    "flex cursor-pointer items-center px-3 py-2.5 transition-colors",
                    i === highlighted
                      ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
                      : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
                    displayValue === opt.label && "font-medium",
                  )}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </FieldWrapper>
  );
}
