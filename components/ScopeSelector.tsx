'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Check,
  ChevronDown,
  Globe,
  Search,
  Store,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAccessControl } from './useAccessControl';

export interface ScopeLevelOption {
  /** Unique identifier of the scope unit (e.g. branch code, region ID, user ID) */
  id: string | number;
  /** Primary display name */
  label: string;
  /** Secondary metadata (e.g. city/state, code, or parent scope) */
  description?: string;
  /** Optional group header (e.g. "Regional Norte", "Unidades") */
  group?: string;
  /** Optional short tag badge (e.g. "Matriz", "Padrão") */
  badge?: string;
  /** Optional custom icon for this option */
  icon?: LucideIcon;
  /** Extra keywords for search matching */
  keywords?: string[];
  disabled?: boolean;
}

export interface ScopeSelectorProps {
  /** Selected scope ID, or `null` when the root/global scope is active */
  value: string | number | null;
  /** Callback fired when scope selection changes (`null` = global scope) */
  onChange: (id: string | number | null) => void;
  /** Available scope options */
  options: ScopeLevelOption[];
  /** Show the root/global option at the top (defaults to `true`) */
  allowGlobal?: boolean;
  /** Label for the global option */
  globalLabel?: string;
  /** Subtitle for the global option */
  globalDescription?: string;
  /** Icon for the global option */
  globalIcon?: LucideIcon;
  /** Section title above individual options */
  sectionLabel?: string;
  /** Placeholder for the quick-filter input */
  searchPlaceholder?: string;
  /** Visual trigger variant */
  variant?: 'default' | 'inline';
  /** Open upward instead of downward */
  dropUp?: boolean;
  /** Horizontal alignment of the popover */
  align?: 'left' | 'right';
  /** Show an inheritance indicator badge when a non-global scope inherits or overrides values */
  inheritanceBadge?: React.ReactNode;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
}

function normalizeScopeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function ScopeSelector({
  value,
  onChange,
  options,
  allowGlobal = true,
  globalLabel = 'Escopo Global (todas as unidades)',
  globalDescription = 'Parâmetros compartilhados entre todas as unidades',
  globalIcon: GlobalIcon = Globe,
  sectionLabel = 'Unidades específicas',
  searchPlaceholder = 'Buscar por nome, código ou localidade...',
  variant = 'default',
  dropUp = false,
  align = 'left',
  inheritanceBadge,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  className,
  componentId,
  hideIfDenied = true,
}: ScopeSelectorProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(next);
      }
      if (!next) {
        setQuery('');
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown, true);
    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 40);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, setOpen]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id === value) ?? null,
    [options, value],
  );
  const isGlobal = value === null;

  const filteredOptions = useMemo(() => {
    const normalized = normalizeScopeSearch(query);
    if (!normalized) return options;
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return options.filter((opt) => {
      const haystack = normalizeScopeSearch(
        [
          String(opt.id),
          opt.label,
          opt.description ?? '',
          opt.group ?? '',
          opt.badge ?? '',
          ...(opt.keywords ?? []),
        ].join(' '),
      );
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [options, query]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, ScopeLevelOption[]>();
    for (const opt of filteredOptions) {
      const key = opt.group ?? '';
      const bucket = groups.get(key);
      if (bucket) bucket.push(opt);
      else groups.set(key, [opt]);
    }
    return Array.from(groups.entries());
  }, [filteredOptions]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = disabled || !hasPermission;
  const SelectedIcon = isGlobal
    ? GlobalIcon
    : selectedOption?.icon ?? Store;

  return (
    <div
      ref={containerRef}
      data-component-id={componentId || undefined}
      className={cn('relative inline-flex items-center gap-2', className)}
    >
      {variant === 'inline' ? (
        <button
          type="button"
          disabled={effectiveDisabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setOpen(!isOpen)}
          className={cn(
            'inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-semibold text-foreground transition-colors cursor-pointer',
            'hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isOpen && 'bg-primary/10 text-primary',
            effectiveDisabled && 'opacity-50 pointer-events-none',
          )}
        >
          <span className="truncate max-w-[220px] sm:max-w-[320px]">
            {isGlobal ? globalLabel : selectedOption?.label ?? 'Selecionar escopo'}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn(
              'text-muted-foreground transition-transform duration-200 shrink-0',
              isOpen && (dropUp ? '-rotate-180 text-primary' : 'rotate-180 text-primary'),
            )}
          />
        </button>
      ) : (
        <button
          type="button"
          disabled={effectiveDisabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setOpen(!isOpen)}
          className={cn(
            'flex h-10 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 cursor-pointer',
            'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isOpen && 'border-primary ring-2 ring-primary/15',
            effectiveDisabled && 'opacity-50 pointer-events-none',
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SelectedIcon size={13} />
          </span>
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="truncate max-w-[160px] sm:max-w-[230px]">
              {isGlobal ? globalLabel : selectedOption?.label ?? 'Selecionar escopo'}
            </span>
            {selectedOption?.badge && (
              <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {selectedOption.badge}
              </span>
            )}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-muted-foreground transition-transform duration-200 ml-0.5 shrink-0',
              isOpen && (dropUp ? '-rotate-180' : 'rotate-180'),
            )}
          />
        </button>
      )}

      {inheritanceBadge && <span className="shrink-0">{inheritanceBadge}</span>}

      {isOpen && (
        <div
          role="listbox"
          aria-label="Seleção de escopo"
          data-floating-open="true"
          className={cn(
            'absolute z-[7800] w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover text-popover-foreground p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none',
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2',
            align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto',
          )}
        >
          {options.length > 4 && (
            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full h-8 pl-8 pr-8 text-xs bg-muted/40 border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background transition-colors"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto overscroll-contain space-y-0.5 pr-0.5">
            {allowGlobal && (
              <>
                <button
                  type="button"
                  role="option"
                  aria-selected={isGlobal}
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isGlobal
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted/70 text-foreground',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Building2 size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{globalLabel}</p>
                      {globalDescription && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {globalDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  {isGlobal && <Check size={14} className="text-primary shrink-0" />}
                </button>

                <div className="my-1.5 h-px bg-border" />
              </>
            )}

            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground tabular-nums">
              {sectionLabel} ({options.length})
            </p>

            {filteredOptions.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                Nenhum escopo encontrado.
              </p>
            ) : (
              groupedOptions.map(([groupName, items]) => (
                <div key={groupName || '__ungrouped'} className="space-y-0.5">
                  {groupName && (
                    <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      {groupName}
                    </p>
                  )}
                  {items.map((opt) => {
                    const isSelected = value === opt.id;
                    const OptIcon = opt.icon ?? Store;
                    return (
                      <button
                        key={String(opt.id)}
                        type="button"
                        role="option"
                        disabled={opt.disabled}
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(opt.id);
                          setOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          opt.disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer',
                          isSelected
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted/70 text-foreground',
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <OptIcon size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold truncate">{opt.label}</p>
                              {opt.badge && (
                                <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            {opt.description && (
                              <p className="text-[10px] text-muted-foreground font-mono truncate tabular-nums">
                                {opt.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScopeSelector;
