'use client';

import React, { useCallback, useId, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Loader2, Plus, X } from 'lucide-react';
import FieldWrapper, { type FieldWrapperProps } from './FieldWrapper';
import { useAccessControl } from '../useAccessControl';

export type AutocompleteOption = { value: string; label: string };

function normalise(o: AutocompleteOption | string): AutocompleteOption {
  return typeof o === 'string' ? { value: o, label: o } : o;
}

export type AutocompleteFieldProps = Omit<FieldWrapperProps, 'children' | 'id'> & {
  id?: string;
  name?: string;
  /** Options list — can be plain strings or { value, label } objects */
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
  });

  const options = rawOptions.map(normalise);

  useEffect(() => {
    if (controlledValue !== undefined && !hasTyped) {
      setInputValue(controlledValue);
    }
  }, [controlledValue, hasTyped]);

  const displayValue = hasTyped ? inputValue : (controlledValue !== undefined ? controlledValue : inputValue);
  const searchValue = hasTyped ? inputValue : '';

  const normalizeForSearch = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normSearch = normalizeForSearch(searchValue.trim());
  const searchDigits = searchValue.replace(/\D/g, '');

  const filtered = options
    .filter((o) => {
      if (!normSearch) return true;
      const normLabel = normalizeForSearch(o.label);
      if (normLabel.includes(normSearch)) return true;
      if (searchDigits.length >= 2) {
        const labelDigits = o.label.replace(/\D/g, '');
        if (labelDigits.includes(searchDigits)) return true;
      }
      return false;
    })
    .slice(0, maxSuggestions);

  const trimmedQuery = searchValue.trim();
  const hasExactMatch = options.some(
    (o) => normalizeForSearch(o.label) === normSearch,
  );
  const showCreateItem = Boolean((creatable || onCreateOption) && trimmedQuery.length > 0 && !hasExactMatch);
  const totalNavigable = filtered.length + (showCreateItem ? 1 : 0);

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
      260,
      Math.max(120, openAbove ? availableAbove - gap : availableBelow - gap)
    );
    const width = Math.min(rect.width, window.innerWidth - viewportMargin * 2);
    const left = Math.min(
      Math.max(viewportMargin, rect.left),
      window.innerWidth - viewportMargin - width
    );

    setDropdownStyle({
      position: 'fixed',
      left,
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width,
      maxHeight,
      zIndex: 999999,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setDropdownStyle({
        position: 'fixed',
        visibility: 'hidden',
        zIndex: 999999,
      });
      return;
    }
    updateDropdownPosition();

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
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop += e.deltaY;
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
      const touchY = e.touches[0]?.clientY ?? 0;
      const diff = touchStartY - touchY;
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop += diff;
      }
      touchStartY = touchY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        (!listRef.current || !listRef.current.contains(e.target as Node))
      ) {
        setOpen(false);
        setHasTyped(false);
        if (controlledValue !== undefined) {
          setInputValue(controlledValue);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [controlledValue]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      (listRef.current.children[highlighted] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    setHasTyped(true);
    setOpen(true);
    setHighlighted(-1);
    onChange?.(v);
  };

  const handleSelect = (opt: AutocompleteOption) => {
    setInputValue(opt.label);
    setHasTyped(false);
    setOpen(false);
    setHighlighted(-1);
    onChange?.(opt.label);
    onSelect?.(opt);
    inputRef.current?.focus();
  };

  const handleCreate = (rawQuery: string) => {
    const created: AutocompleteOption = { value: rawQuery, label: rawQuery };
    setInputValue(rawQuery);
    setHasTyped(false);
    setOpen(false);
    setHighlighted(-1);
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
      setOpen(true);
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
        e.preventDefault();
        if (highlighted >= 0 && highlighted < filtered.length && filtered[highlighted]) {
          handleSelect(filtered[highlighted]);
        } else if (showCreateItem && highlighted === filtered.length) {
          handleCreate(trimmedQuery);
        }
        break;
      case 'Escape':
        setOpen(false);
        setHighlighted(-1);
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
    effectiveDisabled && 'opacity-60 pointer-events-none bg-surface-muted'
  );

  const hasClear = clearable && !!displayValue;
  const describedBy = error ? `${id}-error` : (helpText || hint) ? `${id}-help` : undefined;

  const inputCls = twMerge(
    'flex-1 min-w-0 bg-transparent outline-none border-0 ring-0 text-input-foreground placeholder:text-input-placeholder',
    s.h,
    s.text,
    s.px,
    hasClear && loading ? 'pr-20' : hasClear || loading ? 'pr-14' : 'pr-9'
  );

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
            data-component-id={componentId ? `${componentId}.input` : "erp.autocomplete.input"}
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
              setOpen(true);
            }}
            onClick={() => {
              if (!open) {
                setHasTyped(false);
                setOpen(true);
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
                data-component-id={componentId ? `${componentId}.clear` : "erp.autocomplete.clear"}
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
              data-component-id={componentId ? `${componentId}.toggle` : "erp.autocomplete.toggle"}
              type="button"
              tabIndex={-1}
              aria-label={open ? 'Fechar' : 'Abrir'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen((o) => !o);
                inputRef.current?.focus();
              }}
              className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
            >
              <ChevronDown
                size={14}
                className={twMerge('transition-transform duration-150 motion-reduce:transition-none', open && 'rotate-180 text-foreground')}
              />
            </button>
          </span>
        </div>

        {/* Dropdown */}
        {open &&
          createPortal(
            <ul
              ref={listRef}
              id={`${id}-listbox`}
              role="listbox"
              style={{
                ...dropdownStyle,
                touchAction: 'pan-y',
              }}
              onWheel={(e) => e.stopPropagation()}
              className={twMerge(
                'z-[999999] overflow-y-auto overscroll-contain rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground p-1.5 shadow-[var(--shadow-floating)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none space-y-0.5 pointer-events-auto',
                s.text
              )}
            >
              {loading ? (
                <li className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Carregando...</span>
                </li>
              ) : filtered.length === 0 && !showCreateItem ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">
                  {emptyMessage}
                </li>
              ) : (
                <>
                  {filtered.map((opt, i) => (
                    <li
                      key={opt.value}
                      id={`${id}-opt-${i}`}
                      role="option"
                      aria-selected={displayValue === opt.label}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(opt);
                      }}
                      onMouseEnter={() => setHighlighted(i)}
                      className={twMerge(
                        'flex cursor-pointer items-center px-2.5 py-2 rounded-[var(--radius-control)] text-xs sm:text-sm transition-colors select-none',
                        displayValue === opt.label
                          ? 'bg-primary-soft text-primary-soft-foreground font-semibold'
                          : i === highlighted
                            ? 'bg-surface-hover text-foreground'
                            : 'text-surface-foreground hover:bg-surface-hover'
                      )}
                    >
                      {opt.label}
                    </li>
                  ))}
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
                          : 'hover:bg-brand-soft/60'
                      )}
                    >
                      <Plus size={14} className="shrink-0" />
                      <span className="truncate">{createLabel(trimmedQuery)}</span>
                    </li>
                  )}
                </>
              )}
            </ul>,
            document.body
          )}
      </div>
    </FieldWrapper>
  );
}
