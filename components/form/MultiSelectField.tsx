"use client";

import React, { useId, useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown, X, Check } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

export type MultiSelectOption = { value: string; label: string };

export type MultiSelectFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
  /** Limit how many options can be selected */
  maxSelections?: number;
  /** Show a search input inside the dropdown */
  searchable?: boolean;
  clearable?: boolean;
  componentId?: string;
};

const CHIP = {
  sm: "text-[11px] gap-0.5 px-1.5 py-0.5",
  md: "text-xs gap-1 px-2 py-0.5",
  lg: "text-sm gap-1.5 px-2.5 py-1",
} as const;

const INPUT = {
  sm: { text: "text-xs",   py: "py-1.5",  iconSz: 14 },
  md: { text: "text-sm",   py: "py-2",    iconSz: 15 },
  lg: { text: "text-base", py: "py-2.5",  iconSz: 17 },
} as const;

export default function MultiSelectField({
  label, labelInline, labelWidth, required, tooltip, error, helpText, width, className,
  id: idProp,
  options,
  value: controlledValue,
  defaultValue = [],
  onChange,
  placeholder = "Selecionar...",
  disabled, size = "md", variant = "default",
  maxSelections,
  searchable = true,
  clearable = true,
  componentId,
}: MultiSelectFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = INPUT[size];
  const cs = CHIP[size];

  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = controlledValue ?? internalValue;

  const set = (vals: string[]) => {
    if (!controlledValue) setInternalValue(vals);
    onChange?.(vals);
  };

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      set(selected.filter((v) => v !== val));
    } else if (!maxSelections || selected.length < maxSelections) {
      set([...selected, val]);
      setSearch("");
    }
  };

  const removeChip = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    set(selected.filter((v) => v !== val));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    set([]);
    setSearch("");
  };

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const atMax = !!maxSelections && selected.length >= maxSelections;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) {
          toggle(filtered[highlighted].value);
        } else if (!open) {
          setOpen(true);
        }
        break;
      case "Escape":
        setOpen(false);
        setHighlighted(-1);
        break;
      case "Backspace":
        if (!search && selected.length > 0) {
          set(selected.slice(0, -1));
        }
        break;
    }
  };

  const wrapCls = twMerge(
    "flex w-full flex-wrap items-center gap-1.5 rounded-lg border px-2 cursor-text transition-all duration-150",
    s.py,
    variant === "filled"
      ? "bg-zinc-100 border-transparent hover:bg-zinc-200/70"
      : "bg-white border-zinc-300 hover:border-zinc-400",
    open && variant === "filled" && "bg-white border-zinc-300 ring-2 ring-zinc-500/10",
    open && variant !== "filled" && "border-zinc-500 ring-2 ring-zinc-500/10",
    error && "border-red-400 hover:border-red-400",
    open && error && "border-red-500 ring-red-500/10",
    disabled && "opacity-60 pointer-events-none bg-zinc-50",
  );

  return (
    <FieldWrapper
      id={id} label={label} labelInline={labelInline} labelWidth={labelWidth}
      required={required} tooltip={tooltip} error={error} helpText={helpText}
      width={width} className={className}
    >
      <div ref={containerRef} className="relative">
        {/* Input box with chips */}
        <div
          className={wrapCls}
          onClick={() => { setOpen(true); inputRef.current?.focus(); }}
          {...(componentId ? { "data-component-id": componentId } : {})}
        >
          {/* Chips */}
          {selected.map((val) => {
            const opt = options.find((o) => o.value === val);
            if (!opt) return null;
            return (
              <span
                key={val}
                className={twMerge(
                  "inline-flex items-center rounded-md border bg-indigo-50 text-indigo-700 font-medium border-indigo-200",
                  cs,
                )}
              >
                {opt.label}
                <button
                  type="button"
                  aria-label={`Remover ${opt.label}`}
                  onMouseDown={(e) => removeChip(val, e)}
                  className="ml-0.5 rounded text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}

          {/* Search input */}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={search}
            placeholder={selected.length === 0 ? placeholder : ""}
            disabled={disabled}
            readOnly={!searchable}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); setHighlighted(-1); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            aria-label={label ?? placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            className={twMerge(
              "flex-1 min-w-[80px] bg-transparent outline-none border-0 ring-0 placeholder:text-zinc-400",
              s.text,
              selected.length > 0 && "min-w-[40px]",
            )}
          />

          {/* Controls */}
          <span className="ml-auto flex shrink-0 items-center gap-0.5 pl-1">
            {clearable && selected.length > 0 && (
              <button
                type="button"
                aria-label="Limpar seleção"
                onMouseDown={clearAll}
                className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={12} />
              </button>
            )}
            <span className="flex h-5 w-5 items-center justify-center text-zinc-400">
              <ChevronDown
                size={14}
                className={twMerge("transition-transform duration-150", open && "rotate-180")}
              />
            </span>
          </span>
        </div>

        {/* Dropdown */}
        {open && (
          <ul
            role="listbox"
            aria-multiselectable="true"
            className={twMerge(
              "absolute left-0 right-0 top-full z-[80] mt-1",
              "max-h-52 overflow-y-auto overscroll-contain",
              "rounded-xl border border-zinc-200 bg-white shadow-xl shadow-black/5",
              s.text,
            )}
          >
            {atMax && (
              <li className="border-b border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Máximo de {maxSelections} selecionados
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-zinc-400">Nenhum resultado</li>
            ) : (
              filtered.map((opt, i) => {
                const isSel = selected.includes(opt.value);
                const isLocked = !isSel && atMax;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSel}
                    onMouseDown={(e) => { e.preventDefault(); if (!isLocked) toggle(opt.value); }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={twMerge(
                      "flex cursor-pointer items-center justify-between px-3 py-2.5 transition-colors",
                      i === highlighted ? "bg-indigo-50 text-indigo-900" : "text-zinc-700 hover:bg-zinc-50",
                      isSel && "font-medium",
                      isLocked && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSel && <Check size={13} className="shrink-0 text-indigo-600" />}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </FieldWrapper>
  );
}
