'use client';

import React, { useCallback, useId, useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { Check, ChevronDown, Loader2, Plus, X } from 'lucide-react';
import FieldWrapper, { type FieldWrapperProps } from './FieldWrapper';
import { useEscKey } from '../Modal';
import { useAccessControl } from '../useAccessControl';

export type AutocompleteOption = {
  value: string;
  label: string;
  /** Optional subtitle displayed below the option label */
  description?: string;
};

function normalise(o: AutocompleteOption | string): AutocompleteOption {
  return typeof o === 'string' ? { value: o, label: o } : o;
}

function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export type AutocompleteFieldProps = Omit<FieldWrapperProps, 'children' | 'id'> & {
  id?: string;
  name?: string;
  /** Options list — can be plain strings or { value, label, description } objects */
  options: readonly (AutocompleteOption | string)[];
  /** Controlled text value */
  value?: string;
  defaultValue?: string;
  /** Called on every keystroke with the raw input text */
  onChange?: (value: string) => void;
  /** Called when user picks an option */
  onSelect?: (option: AutocompleteOption) => void;
  /** Allow creating a new option when typed query does not match exactly */
  creatable?: boolean;
  /** Called when the user selects the "Create '...'" action */
  onCreateOption?: (inputValue: string) => void;
  /** Custom label builder for the creatable item */
  createLabel?: (query: string) => string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  /** Max options to show in the dropdown */
  maxSuggestions?: number;
  emptyMessage?: string;
  clearable?: boolean;
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

const SIZE = {
  sm: { h: 'h-8', text: 'text-xs', px: 'px-2.5', iconSz: 14 },
  md: { h: 'h-10', text: 'text-sm', px: 'px-3', iconSz: 15 },
  lg: { h: 'h-12', text: 'text-base', px: 'px-4', iconSz: 17 },
} as const;

export default function AutocompleteField({
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  error,
  helpText,
  hint,
  width,
  className,
  id: idProp,
  name,
  options: rawOptions,
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSelect,
  creatable = false,
  onCreateOption,
  createLabel = (q) => `Criar "${q}"`,
  placeholder = 'Buscar...',
  disabled,
  loading = false,
  size = 'md',
  variant = 'default',
  maxSuggestions = 200,
  emptyMessage = 'Nenhum resultado encontrado',
  clearable = true,
  componentId,
  hideIfDenied = false,
}: AutocompleteFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const [inputValue, setInputValue] = useState(defaultValue || controlledValue || '');
  const [open, setOpen] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
    zIndex: 9200,
  });

  const options = useMemo(() => rawOptions.map(normalise), [rawOptions]);

  const displayValue = hasTyped
    ? inputValue
    : controlledValue !== undefined
      ? controlledValue
      : inputValue;
  const searchValue = hasTyped ? inputValue : '';

  const normSearch = normalizeForSearch(searchValue.trim());
  const searchDigits = searchValue.replace(/\D/g, '');

  const filtered = useMemo(() => {
    return options
      .filter((o) => {
        if (!normSearch) return true;
        const normLabel = normalizeForSearch(o.label);
        if (normLabel.includes(normSearch)) return true;
        if (o.description && normalizeForSearch(o.description).includes(normSearch)) return true;
        if (searchDigits.length >= 2) {
          const labelDigits = `${o.label} ${o.description ?? ''}`.replace(/\D/g, '');
          if (labelDigits.includes(searchDigits)) return true;
        }
        return false;
      })
      .slice(0, maxSuggestions);
  }, [options, normSearch, searchDigits, maxSuggestions]);

  const trimmedQuery = searchValue.trim();
  const hasExactMatch = options.some((o) => normalizeForSearch(o.label) === normSearch);
  const showCreateItem = Boolean(
    (creatable || onCreateOption) && trimmedQuery.length > 0 && !hasExactMatch,
  );
  const totalNavigable = filtered.length + (showCreateItem ? 1 : 0);

  const closeDropdown = useCallback(
    (resetTyped = false) => {
      setOpen(false);
      setHighlighted(-1);
      if (resetTyped) {
        setHasTyped(false);
        if (controlledValue !== undefined) {
          setInputValue(controlledValue);
        }
      }
      setDropdownStyle({
        position: 'fixed',
        visibility: 'hidden',
        zIndex: 9200,
      });
    },
    [controlledValue],
  );

  useEscKey(() => {
    closeDropdown(true);
    inputRef.current?.focus();
  }, open);

  const updateDropdownPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const gap = 6;
    const viewportMargin = 12;
    const availableBelow = window.innerHeight - rect.bottom - viewportMargin;
    const availableAbove = rect.top - viewportMargin;
    const openAbove = availableBelow < 180 && availableAbove > availableBelow;
    const maxHeight = Math.min(
      280,
      Math.max(120, openAbove ? availableAbove - gap : availableBelow - gap),
    );
    const width = Math.min(rect.width, window.innerWidth - viewportMargin * 2);
    const left = Math.min(
      Math.max(viewportMargin, rect.left),
      window.innerWidth - viewportMargin - width,
    );

    setDropdownStyle({
      position: 'fixed',
      left,
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width,
      maxHeight,
      visibility: 'visible',
      zIndex: 9200,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const rafId = window.requestAnimationFrame(updateDropdownPosition);

    const handleWindowScroll = (e: Event) => {
      if (
        listRef.current &&
        (e.target === listRef.current || listRef.current.contains(e.target as Node))
      ) {
        return;
      }
      updateDropdownPosition();
    };

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', handleWindowScroll, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', handleWindowScroll, true);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        (!listRef.current || !listRef.current.contains(e.target as Node))
      ) {
        closeDropdown(true);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const targetEl = listRef.current.querySelector<HTMLElement>(`#${CSS.escape(`${id}-opt-${highlighted}`)}`);
      targetEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, id]);

  const openDropdown = () => {
    if (effectiveDisabled) return;
    updateDropdownPosition();
    setOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    setHasTyped(true);
    if (!open) openDropdown();
    setHighlighted(-1);
    onChange?.(v);
  };

  const handleSelect = (opt: AutocompleteOption) => {
    setInputValue(opt.label);
    setHasTyped(false);
    closeDropdown(false);
    onChange?.(opt.label);
    onSelect?.(opt);
    inputRef.current?.focus();
  };

  const handleCreate = (rawQuery: string) => {
    const created: AutocompleteOption = { value: rawQuery, label: rawQuery };
    setInputValue(rawQuery);
    setHasTyped(false);
    closeDropdown(false);
    onChange?.(rawQuery);
    onCreateOption?.(rawQuery);
    onSelect?.(created);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setInputValue('');
    setHasTyped(false);
    onChange?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) return;
      openDropdown();
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, totalNavigable - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        if (highlighted >= 0 && highlighted < filtered.length && filtered[highlighted]) {
          handleSelect(filtered[highlighted]);
        } else if (showCreateItem && highlighted === filtered.length) {
          handleCreate(trimmedQuery);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          closeDropdown(true);
        }
        break;
      case 'Tab':
        if (open) {
          closeDropdown(true);
        }
        break;
    }
  };

  if (!hasPermission && hideIfDenied) return null;

  const wrapCls = twMerge(
    'relative flex w-full items-center overflow-hidden rounded-[var(--radius-control)] border transition-[background-color,border-color,box-shadow] duration-150',
    variant === 'filled'
      ? 'bg-surface-muted border-transparent hover:bg-surface-hover focus-within:bg-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/12'
      : 'bg-input border-input-border hover:border-border-strong focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/12',
    error &&
      'border-danger hover:border-danger focus-within:border-danger focus-within:ring-3 focus-within:ring-danger/15',
    effectiveDisabled && 'opacity-60 pointer-events-none bg-surface-muted',
  );

  const hasClear = clearable && !!displayValue;
  const describedBy = error ? `${id}-error` : (helpText || hint) ? `${id}-help` : undefined;

  const inputCls = twMerge(
    'flex-1 min-w-0 bg-transparent outline-none border-0 ring-0 text-input-foreground placeholder:text-input-placeholder',
    s.h,
    s.text,
    s.px,
    hasClear && loading ? 'pr-20' : hasClear || loading ? 'pr-14' : 'pr-9',
  );

  const showInitialLoading = loading && filtered.length === 0 && !showCreateItem;
  const showRefreshingBanner = loading && !showInitialLoading;

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div ref={containerRef} className="relative">
        <div className={wrapCls}>
          <input
            data-component-id={componentId ? `${componentId}.input` : 'erp.autocomplete.input'}
            ref={inputRef}
            id={id}
            name={name ?? `autocomplete_off_${id}`}
            type="text"
            role="combobox"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={`${id}-listbox`}
            aria-activedescendant={highlighted >= 0 ? `${id}-opt-${highlighted}` : undefined}
            value={displayValue}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            required={required}
            onChange={handleInputChange}
            onFocus={() => {
              setHasTyped(false);
              openDropdown();
            }}
            onClick={() => {
              if (!open) {
                setHasTyped(false);
                openDropdown();
              }
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={inputCls}
          />
          <span className="absolute right-0 top-0 flex h-full items-center gap-0.5 pr-1.5 pointer-events-none">
            {loading && (
              <Loader2 size={14} className="animate-spin text-muted-foreground mr-0.5" />
            )}
            {hasClear && (
              <button
                data-component-id={componentId ? `${componentId}.clear` : 'erp.autocomplete.clear'}
                type="button"
                aria-label="Limpar"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }}
                className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
            <button
              data-component-id={componentId ? `${componentId}.toggle` : 'erp.autocomplete.toggle'}
              type="button"
              tabIndex={-1}
              aria-label={open ? 'Fechar' : 'Abrir'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (open) {
                  closeDropdown(true);
                } else {
                  openDropdown();
                }
                inputRef.current?.focus();
              }}
              className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
            >
              <ChevronDown
                size={14}
                className={twMerge(
                  'transition-transform duration-150 motion-reduce:transition-none',
                  open && 'rotate-180 text-foreground',
                )}
              />
            </button>
          </span>
        </div>

        {/* Dropdown */}
        {open &&
          typeof document !== 'undefined' &&
          createPortal(
            <ul
              ref={listRef}
              id={`${id}-listbox`}
              role="listbox"
              data-floating-open="true"
              style={{
                ...dropdownStyle,
                touchAction: 'pan-y',
              }}
              onWheel={(e) => e.stopPropagation()}
              className={twMerge(
                'z-[9200] overflow-y-auto overscroll-contain rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground p-1.5 shadow-[var(--shadow-floating)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none space-y-0.5 pointer-events-auto',
                s.text,
              )}
            >
              {showInitialLoading ? (
                <li className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin shrink-0" />
                  <span>Carregando...</span>
                </li>
              ) : filtered.length === 0 && !showCreateItem ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">{emptyMessage}</li>
              ) : (
                <>
                  {showRefreshingBanner && (
                    <li
                      role="presentation"
                      className="flex items-center gap-1.5 border-b border-border px-2.5 py-1.5 mb-1 text-[11px] text-muted-foreground select-none"
                    >
                      <Loader2 size={12} className="animate-spin shrink-0 text-primary" />
                      <span>Atualizando sugestões...</span>
                    </li>
                  )}
                  {filtered.map((opt, i) => {
                    const isSelected = displayValue === opt.label;
                    return (
                      <li
                        key={opt.value}
                        id={`${id}-opt-${i}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(opt);
                        }}
                        onMouseEnter={() => setHighlighted(i)}
                        className={twMerge(
                          'flex cursor-pointer items-center justify-between gap-2 px-2.5 py-2 rounded-[var(--radius-control)] text-xs sm:text-sm transition-colors select-none',
                          isSelected
                            ? 'bg-primary-soft text-primary-soft-foreground font-semibold'
                            : i === highlighted
                              ? 'bg-surface-hover text-foreground'
                              : 'text-surface-foreground hover:bg-surface-hover',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{opt.label}</div>
                          {opt.description && (
                            <div className="truncate text-[11px] font-normal text-muted-foreground">
                              {opt.description}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check size={14} className="shrink-0 text-primary" />}
                      </li>
                    );
                  })}
                  {showCreateItem && (
                    <li
                      id={`${id}-opt-${filtered.length}`}
                      role="option"
                      aria-selected={false}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCreate(trimmedQuery);
                      }}
                      onMouseEnter={() => setHighlighted(filtered.length)}
                      className={twMerge(
                        'flex cursor-pointer items-center gap-1.5 px-2.5 py-2 rounded-[var(--radius-control)] text-xs sm:text-sm font-medium text-brand transition-colors select-none',
                        highlighted === filtered.length
                          ? 'bg-brand-soft text-brand-soft-foreground'
                          : 'hover:bg-brand-soft/60',
                      )}
                    >
                      <Plus size={14} className="shrink-0" />
                      <span className="truncate">{createLabel(trimmedQuery)}</span>
                    </li>
                  )}
                </>
              )}
            </ul>,
            document.body,
          )}
      </div>
    </FieldWrapper>
  );
}
