'use client';

import React, { useCallback, useId, useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import FieldWrapper, { type FieldWrapperProps } from './FieldWrapper';
import { useEscKey } from '../Modal';
import { useAccessControl } from '../useAccessControl';

export type MultiSelectOption = {
  value: string;
  label: string;
  description?: string;
  componentId?: string;
};

export type MultiSelectFieldProps = Omit<FieldWrapperProps, 'children' | 'id'> & {
  id?: string;
  name?: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'button' | 'compact';
  /** Limit how many options can be selected */
  maxSelections?: number;
  /** Maximum number of chips to display inside the input before showing (+N selected) badge */
  maxDisplayedChips?: number;
  /** Show a search input inside the dropdown */
  searchable?: boolean;
  clearable?: boolean;
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
  /** Optional icon in trigger button */
  icon?: React.ReactNode;
  /** Label for select all option (default: "Selecionar tudo") */
  selectAllLabel?: string;
  /** Label when all options are selected (default: "Todas as Opções") */
  allSelectedText?: string;
  /** Dropdown header title */
  headerTitle?: string;
  /** If true, an empty selection [] means "all selected" (consolidated filter behavior) */
  emptyMeansAll?: boolean;
};

const CHIP = {
  sm: 'text-[11px] pl-2 pr-1 py-0.5 max-w-[140px]',
  md: 'text-xs pl-2.5 pr-1 py-0.5 max-w-[180px]',
  lg: 'text-xs pl-3 pr-1.5 py-1 max-w-[220px]',
} as const;

const INPUT = {
  sm: { text: 'text-xs', py: 'py-1', minH: 'min-h-8' },
  md: { text: 'text-sm', py: 'py-1.5', minH: 'min-h-10' },
  lg: { text: 'text-base', py: 'py-2', minH: 'min-h-12' },
} as const;

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function MultiSelectField({
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
  options,
  value: controlledValue,
  defaultValue = [],
  onChange,
  placeholder = 'Selecionar...',
  disabled,
  size = 'md',
  variant = 'default',
  maxSelections,
  maxDisplayedChips = 2,
  searchable = true,
  clearable = true,
  componentId,
  hideIfDenied = false,
  icon,
  selectAllLabel = 'Selecionar tudo',
  allSelectedText,
  headerTitle,
  emptyMeansAll = false,
}: MultiSelectFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = INPUT[size];
  const cs = CHIP[size];
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
    zIndex: 9200,
  });

  const selected = useMemo(
    () => [...new Set(controlledValue ?? internalValue)],
    [controlledValue, internalValue],
  );

  const set = (vals: string[]) => {
    if (controlledValue === undefined) setInternalValue(vals);
    onChange?.(vals);
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch('');
    setHighlighted(-1);
    setDropdownStyle({
      position: 'fixed',
      visibility: 'hidden',
      zIndex: 9200,
    });
  }, []);

  useEscKey(closeDropdown, open);

  const isAllSelected =
    options.length > 0 && options.every((opt) => selected.includes(opt.value));

  const toggleOption = (val: string) => {
    if (selected.includes(val)) {
      set(selected.filter((v) => v !== val));
    } else if (!maxSelections || selected.length < maxSelections) {
      set([...selected, val]);
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      set([]);
    } else {
      const allVals = options
        .slice(0, maxSelections ? maxSelections : options.length)
        .map((o) => o.value);
      set(allVals);
    }
  };

  const clearSelection = () => {
    set([]);
    setSearch('');
  };

  const removeChip = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    set(selected.filter((v) => v !== val));
  };

  const normSearch = normalizeText(search.trim());
  const filtered = useMemo(
    () =>
      options.filter(
        (o) =>
          !normSearch ||
          normalizeText(o.label).includes(normSearch) ||
          (o.description && normalizeText(o.description).includes(normSearch)),
      ),
    [options, normSearch],
  );

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const el = listRef.current.children[highlighted] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted]);

  const updateDropdownPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const availableBelow = window.innerHeight - rect.bottom - margin;
    const availableAbove = rect.top - margin;
    const openAbove = availableBelow < 260 && availableAbove > availableBelow;
    const maxHeight = Math.min(
      380,
      Math.max(180, (openAbove ? availableAbove : availableBelow) - gap),
    );
    const minDropdownWidth = Math.max(rect.width, 288);
    const widthPx = Math.min(minDropdownWidth, window.innerWidth - margin * 2);

    setDropdownStyle({
      position: 'fixed',
      left: Math.min(Math.max(margin, rect.left), window.innerWidth - margin - widthPx),
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width: widthPx,
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
        dropdownRef.current &&
        (e.target === dropdownRef.current || dropdownRef.current.contains(e.target as Node))
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
  }, [open, selected.length, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    const el = dropdownRef.current;
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
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  // Focus search input when opened
  useEffect(() => {
    if (open && searchable) {
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }
  }, [open, searchable]);

  const openDropdown = () => {
    if (effectiveDisabled) return;
    updateDropdownPosition();
    setOpen(true);
    setHighlighted(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!open && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) {
      e.preventDefault();
      openDropdown();
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) {
          toggleOption(filtered[highlighted].value);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          closeDropdown();
        }
        break;
      case 'Tab':
        if (open) {
          closeDropdown();
        }
        break;
    }
  };

  const getButtonLabel = () => {
    if (
      isAllSelected ||
      (options.length > 0 && selected.length === options.length) ||
      (emptyMeansAll && selected.length === 0)
    ) {
      return allSelectedText || 'Todas as Opções';
    }
    if (selected.length === 0) {
      return allSelectedText || placeholder || 'Todas as Opções';
    }
    if (selected.length === 1) {
      const opt = options.find((o) => o.value === selected[0]);
      return opt ? opt.label : selected[0];
    }
    return `${selected.length} selecionados`;
  };

  const hasSelectionsToClear = selected.length > 0;
  const isButtonMode = variant === 'button' || variant === 'compact';

  if (!hasPermission && hideIfDenied) return null;

  const renderTrigger = () => {
    if (isButtonMode) {
      return (
        <button
          id={id}
          data-component-id={componentId ? `${componentId}.toggle` : 'erp.multiselect.toggle'}
          type="button"
          disabled={effectiveDisabled}
          aria-expanded={open}
          onClick={() => {
            if (effectiveDisabled) return;
            if (open) closeDropdown();
            else openDropdown();
          }}
          onKeyDown={handleKeyDown}
          className={twMerge(
            'flex items-center gap-2 h-8 px-2.5 text-xs font-medium text-surface-foreground bg-surface hover:bg-surface-hover rounded-[var(--radius-control)] transition-colors border border-border cursor-pointer shadow-[var(--shadow-control)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            effectiveDisabled && 'opacity-50 pointer-events-none cursor-not-allowed',
            className,
          )}
        >
          {icon}
          <span className="max-w-[200px] truncate">{getButtonLabel()}</span>
          <ChevronDown
            className={twMerge(
              'w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none',
              open && 'rotate-180 text-foreground',
            )}
          />
        </button>
      );
    }

    const visibleChips = selected.slice(0, maxDisplayedChips);
    const hiddenChipsCount = selected.length - maxDisplayedChips;

    const wrapCls = twMerge(
      'flex w-full flex-wrap items-center gap-1.5 rounded-[var(--radius-control)] border px-3 transition-[background-color,border-color,box-shadow] duration-150 cursor-pointer select-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/12',
      s.minH,
      s.py,
      variant === 'filled'
        ? 'bg-surface-muted border-transparent hover:bg-surface-hover'
        : 'bg-input border-input-border hover:border-border-strong',
      open && 'border-ring ring-3 ring-ring/12 bg-input',
      error && 'border-danger hover:border-danger focus-visible:border-danger focus-visible:ring-danger/15',
      effectiveDisabled && 'opacity-60 pointer-events-none bg-surface-muted',
    );

    return (
      <div
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        tabIndex={effectiveDisabled ? -1 : 0}
        className={wrapCls}
        onClick={() => {
          if (effectiveDisabled) return;
          if (open) closeDropdown();
          else openDropdown();
        }}
        onKeyDown={handleKeyDown}
      >
        {selected.length === 0 ? (
          <span className={twMerge('text-input-placeholder font-normal', s.text)}>
            {placeholder}
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {visibleChips.map((val) => {
              const opt = options.find((o) => o.value === val);
              if (!opt) return null;
              return (
                <span
                  key={val}
                  className={twMerge(
                    'inline-flex items-center gap-1 rounded-md border font-medium bg-surface-muted border-border text-surface-foreground',
                    cs,
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  <button
                    type="button"
                    data-component-id={
                      componentId ? `${componentId}.remove.${val}` : `erp.multiselect.remove.${val}`
                    }
                    aria-label={`Remover ${opt.label}`}
                    onMouseDown={(e) => removeChip(val, e)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors shrink-0 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}

            {hiddenChipsCount > 0 && (
              <span className="inline-flex items-center rounded-md border border-border bg-primary-soft text-primary-soft-foreground font-semibold text-xs px-2 py-0.5 tabular-nums">
                +{hiddenChipsCount} {hiddenChipsCount === 1 ? 'selecionado' : 'selecionados'}
              </span>
            )}
          </div>
        )}

        <span className="ml-auto flex shrink-0 items-center gap-1 pl-1 text-muted-foreground">
          {clearable && selected.length > 0 && (
            <button
              data-component-id={componentId ? `${componentId}.clear` : 'erp.multiselect.clear'}
              type="button"
              aria-label="Limpar seleção"
              onMouseDown={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={15}
            className={twMerge(
              'transition-transform duration-150 motion-reduce:transition-none',
              open && 'rotate-180 text-foreground',
            )}
          />
        </span>
      </div>
    );
  };

  const renderDropdown = () => {
    if (!open || typeof document === 'undefined') return null;

    return createPortal(
      <div
        ref={dropdownRef}
        data-floating-open="true"
        style={dropdownStyle}
        className="pointer-events-auto z-[9200] rounded-[var(--radius-card)] bg-popover text-popover-foreground shadow-[var(--shadow-floating)] border border-border p-2 text-xs flex flex-col animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-border mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {headerTitle || 'Filtrar'}
          </span>
          <div className="flex items-center gap-2">
            {!isAllSelected && options.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="text-[11px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded px-1 cursor-pointer"
              >
                Selecionar todos
              </button>
            )}
            {hasSelectionsToClear && (
              <button
                data-component-id={
                  componentId ? `${componentId}.clear-filter` : 'erp.multiselect.clear-filter'
                }
                type="button"
                onClick={clearSelection}
                className="text-[11px] font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded px-1 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Optional search input */}
        {searchable && (
          <div className="relative flex items-center px-1 py-1">
            <Search size={13} className="absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              data-component-id={componentId ? `${componentId}.search` : 'erp.multiselect.search'}
              ref={searchInputRef}
              type="text"
              value={search}
              placeholder="Pesquisar..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlighted(0);
              }}
              onKeyDown={handleKeyDown}
              className="w-full h-8 rounded-[var(--radius-control)] border border-input-border bg-input pl-7 pr-8 text-xs text-foreground placeholder:text-input-placeholder focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            {search && (
              <button
                data-component-id={
                  componentId ? `${componentId}.clear-search` : 'erp.multiselect.clear-search'
                }
                type="button"
                aria-label="Limpar pesquisa"
                onClick={() => {
                  setSearch('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Select All Option */}
        <button
          type="button"
          data-component-id={componentId ? `${componentId}.select-all` : 'erp.multiselect.select-all'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleAll();
          }}
          className={twMerge(
            'flex w-full items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-control)] cursor-pointer transition-colors mt-0.5 text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            isAllSelected
              ? 'bg-primary-soft text-primary-soft-foreground font-semibold'
              : 'hover:bg-surface-hover text-surface-foreground',
          )}
        >
          <span
            aria-hidden="true"
            className={twMerge(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
              isAllSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input-border bg-input',
            )}
          >
            {isAllSelected && <Check size={11} strokeWidth={3} />}
          </span>
          <span>{selectAllLabel}</span>
        </button>

        {/* Options list */}
        <div
          id={`${id}-listbox`}
          role="listbox"
          aria-multiselectable="true"
          ref={listRef}
          className="max-h-56 overflow-y-auto overscroll-contain space-y-0.5 pt-1"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma opção encontrada.
            </div>
          ) : (
            filtered.map((opt, idx) => {
              const isChecked = selected.includes(opt.value);
              const isHighlighted = idx === highlighted;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isChecked}
                  data-component-id={
                    componentId
                      ? `${componentId}.option.${opt.value}`
                      : `erp.multiselect.option.${opt.value}`
                  }
                  onMouseEnter={() => setHighlighted(idx)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleOption(opt.value);
                  }}
                  className={twMerge(
                    'flex w-full items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-control)] cursor-pointer transition-colors text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    isChecked
                      ? 'bg-primary-soft text-primary-soft-foreground font-medium'
                      : isHighlighted
                        ? 'bg-surface-hover text-foreground'
                        : 'hover:bg-surface-hover text-surface-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={twMerge(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                      isChecked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input-border bg-input',
                    )}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="block truncate text-[11px] font-normal text-muted-foreground">
                        {opt.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>,
      document.body,
    );
  };

  if (isButtonMode && !label) {
    return (
      <div ref={containerRef} className="relative inline-block">
        {name && <input type="hidden" name={name} value={JSON.stringify(selected)} />}
        {renderTrigger()}
        {renderDropdown()}
      </div>
    );
  }

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
        {name && <input type="hidden" name={name} value={JSON.stringify(selected)} />}
        {renderTrigger()}
        {renderDropdown()}
      </div>
    </FieldWrapper>
  );
}
