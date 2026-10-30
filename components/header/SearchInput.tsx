"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

export type SearchInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  shortcutHint?: string;
  className?: string;
  inputClassName?: string;
  componentId?: string;
};

export default function SearchInput({
  value,
  defaultValue = "",
  onChange,
  onSearch,
  placeholder = "Buscar...",
  clearable = true,
  shortcutHint,
  className = "",
  inputClassName,
  componentId,
}: SearchInputProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  const update = (next: string) => {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  };

  return (
    <div className={twMerge("hidden md:flex items-center gap-2", className)}>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-header-command-placeholder"
          size={15}
        />
        <input
          data-component-id={componentId || "erp.header.search-input"}
          aria-label={placeholder}
          type="search"
          value={current}
          placeholder={placeholder}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch?.(current);
            } else if (e.key === "Escape" && current) {
              update("");
            }
          }}
          className={twMerge(
            "rounded-lg border border-header-command-border bg-header-command pl-8 pr-8 py-1.5 text-sm text-header-command-foreground placeholder-header-command-placeholder focus:outline-none focus:ring-1 focus:ring-header-ring transition-colors",
            shortcutHint && !current && "pr-14",
            inputClassName
          )}
        />
        {clearable && current ? (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => update("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-header-command-placeholder hover:text-header-command-foreground cursor-pointer"
          >
            <X size={13} />
          </button>
        ) : shortcutHint ? (
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-header-command-border px-1.5 py-0.5 font-mono text-[10px] text-header-command-placeholder">
            {shortcutHint}
          </kbd>
        ) : null}
      </div>
    </div>
  );
}
