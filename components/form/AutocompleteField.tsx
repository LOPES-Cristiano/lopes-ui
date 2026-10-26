'use client';

import React, { useCallback, useId, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Loader2, X } from 'lucide-react';
import FieldWrapper, { type FieldWrapperProps } from './FieldWrapper';

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
};

const SIZE = {
  sm: { h: 'h-8', text: 'text-xs', px: 'px-2.5', iconSz: 14 },
  md: { h: 'h-10', text: 'text-sm', px: 'px-3', iconSz: 15 },
  lg: { h: 'h-12', text: 'text-base', px: 'px-4', iconSz: 17 },
} as const;

export default function AutocompleteField({
  label,
  labelInline,
  labelWidth,
  required,
  tooltip,
  error,
  helpText,
  width,
  className,
  id: idProp,
  name,
  options: rawOptions,
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSelect,
  placeholder = 'Buscar...',
  disabled,
  loading = false,
  size = 'sm',
  variant = 'default',
  maxSuggestions = 200,
  emptyMessage = 'Nenhum resultado encontrado',
  clearable = true,
  componentId,
}: AutocompleteFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = SIZE[size];

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
      // Se o scroll estiver acontecendo dentro da própria lista do dropdown, não recalcula
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

  // Habilitar rolagem via mouse wheel e gestos mesmo dentro de modais (evitando cancelamento por Radix/react-remove-scroll)
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Impede propagação para o document onde bibliotecas de modal cancelam o scroll
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
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) handleSelect(filtered[highlighted]);
        break;
      case 'Escape':
        setOpen(false);
        setHighlighted(-1);
        break;
    }
  };

  const wrapCls = twMerge(
    'relative flex w-full items-center overflow-hidden border transition-all duration-150',
    size === 'sm' ? 'rounded-md' : 'rounded-lg',
    variant === 'filled'
      ? 'bg-[var(--surface-muted)] border-transparent hover:bg-[var(--surface-hover)] focus-within:bg-[var(--surface)] focus-within:border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--ring)]/10'
      : 'bg-[var(--input-background)] border-[var(--input-border)] hover:border-[var(--border-strong)] focus-within:border-[var(--ring)] focus-within:ring-2 focus-within:ring-[var(--ring)]/10',
    error &&
      'border-red-400 hover:border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10',
    disabled && 'opacity-60 pointer-events-none bg-[var(--surface-muted)]'
  );

  const hasClear = clearable && !!displayValue;

  const inputCls = twMerge(
    'flex-1 min-w-0 bg-transparent outline-none border-0 ring-0 text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]',
    s.h,
    s.text,
    s.px,
    hasClear && loading ? 'pr-16' : hasClear || loading ? 'pr-12' : 'pr-9'
  );

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      error={error}
      helpText={helpText}
      width={width}
      className={className}
    >
      <div ref={containerRef} className="relative">
        <div className={wrapCls}>
          <input data-component-id={componentId ? `${componentId}.input` : "erp.autocomplete.input"} ref={inputRef} id={id} name={name ?? `autocomplete_off_${id}`} type="text" role="combobox"
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
            disabled={disabled}
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
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            className={inputCls}
            />
          <span className="absolute right-0 top-0 flex h-full items-center gap-1 pr-2 pointer-events-none">
            {loading && (
              <Loader2 size={14} className="animate-spin text-[var(--surface-muted-foreground)]" />
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
                className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded text-[var(--surface-muted-foreground)] transition-colors hover:text-[var(--surface-foreground)]"
              >
                <X size={12} />
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
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded text-[var(--surface-muted-foreground)] transition-colors hover:text-[var(--surface-foreground)]"
            >
              <ChevronDown
                size={14}
                className={twMerge('transition-transform duration-150', open && 'rotate-180')}
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
                'z-[999999] overflow-y-auto overscroll-contain rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-2xl space-y-0.5 pointer-events-auto',
                s.text
              )}
            >
              {loading ? (
                <li className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Carregando...</span>
                </li>
              ) : filtered.length === 0 ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">
                  {emptyMessage}
                </li>
              ) : (
                filtered.map((opt, i) => (
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
                      'flex cursor-pointer items-center px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors select-none',
                      displayValue === opt.label
                        ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20'
                        : i === highlighted
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground'
                          : 'text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>,
            document.body
          )}
      </div>
    </FieldWrapper>
  );
}