'use client';

import React, { useCallback, useId, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, X, Search } from 'lucide-react';
import FieldWrapper, { type FieldWrapperProps } from './FieldWrapper';

export type MultiSelectOption = { value: string; label: string };

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
  /** Ícone opcional no gatilho do botão (ex: <Building className="w-3.5 h-3.5" />) */
  icon?: React.ReactNode;
  /** Rótulo da opção de selecionar todas (padrão: "Selecionar tudo") */
  selectAllLabel?: string;
  /** Rótulo quando todas estão selecionadas (padrão: "Todas as Opções" ou "Todas as Filiais") */
  allSelectedText?: string;
  /** Título do cabeçalho do dropdown (ex: "Filtrar por Filial") */
  headerTitle?: string;
  /** Se true, uma seleção vazia [] significa "todas selecionadas" (comportamento consolidado/filtro gerencial) */
  emptyMeansAll?: boolean;
};

const CHIP = {
  sm: 'text-[11px] px-2 py-0.5 max-w-[140px]',
  md: 'text-xs px-2.5 py-1 max-w-[180px]',
  lg: 'text-xs px-3 py-1.5 max-w-[220px]',
} as const;

const INPUT = {
  sm: { text: 'text-xs', py: 'py-1', minH: 'min-h-[34px]' },
  md: { text: 'text-sm', py: 'py-1.5', minH: 'min-h-[40px]' },
  lg: { text: 'text-base', py: 'py-2', minH: 'min-h-[46px]' },
} as const;

export default function MultiSelectField({
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

  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
  });

  // Deduplica valores selecionados
  const selected = [...new Set(controlledValue ?? internalValue)];

  const set = (vals: string[]) => {
    if (controlledValue === undefined) setInternalValue(vals);
    onChange?.(vals);
  };

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

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

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
      Math.max(180, (openAbove ? availableAbove : availableBelow) - gap)
    );
    const minDropdownWidth = Math.max(rect.width, 288);
    const width = Math.min(minDropdownWidth, window.innerWidth - margin * 2);

    setDropdownStyle({
      position: 'fixed',
      left: Math.min(Math.max(margin, rect.left), window.innerWidth - margin - width),
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width,
      maxHeight,
      zIndex: 999999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();

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
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', handleWindowScroll, true);
    };
  }, [open, updateDropdownPosition]);

  // Habilitar rolagem via mouse wheel e gestos mesmo dentro de modais
  useEffect(() => {
    if (!open) return;
    const el = dropdownRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const listEl = el.querySelector('.overflow-y-auto') as HTMLElement | null;
      if (listEl && listEl.scrollHeight > listEl.clientHeight) {
        listEl.scrollTop += e.deltaY;
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
      const listEl = el.querySelector('.overflow-y-auto') as HTMLElement | null;
      if (listEl && listEl.scrollHeight > listEl.clientHeight) {
        const touchY = e.touches[0]?.clientY ?? 0;
        listEl.scrollTop += touchStartY - touchY;
        touchStartY = touchY;
      }
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

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Foco no campo de busca ao abrir
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  // Rótulo do botão no modo button/compact
  const getButtonLabel = () => {
    if (isAllSelected || (options.length > 0 && selected.length === options.length)) {
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

  // ── Renderização do Gatilho ──────────────────────────────────────────────
  const isButtonMode = variant === 'button' || variant === 'compact';

  const renderTrigger = () => {
    if (isButtonMode) {
      return (
        <button
          id={id}
          data-component-id={componentId ? `${componentId}.toggle` : "erp.multiselect.toggle"}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={twMerge(
            'flex items-center gap-2 h-8 px-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-2xs select-none',
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
            className
          )}
          >
          {icon}
          <span className="max-w-[200px] truncate">{getButtonLabel()}</span>
          <ChevronDown
            className={twMerge(
              'w-3 h-3 text-zinc-400 transition-transform duration-150',
              open && 'rotate-180'
            )}
          />
        </button>
      );
    }

    const visibleChips = selected.slice(0, maxDisplayedChips);
    const hiddenChipsCount = selected.length - maxDisplayedChips;

    const wrapCls = twMerge(
      'flex w-full flex-wrap items-center gap-1.5 rounded-lg border px-3 transition-all duration-150 cursor-pointer select-none',
      s.minH,
      s.py,
      variant === 'filled'
        ? 'bg-zinc-100 border-transparent hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:hover:bg-zinc-800'
        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-2xs',
      open && 'border-zinc-900 ring-2 ring-zinc-900/10 dark:border-zinc-100 dark:ring-zinc-100/10',
      error && 'border-rose-500 ring-rose-500/10',
      disabled && 'opacity-50 pointer-events-none bg-zinc-100 dark:bg-zinc-800'
    );

    return (
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        className={wrapCls}
        onClick={() => setOpen((o) => !o)}
        >
        {selected.length === 0 ? (
          <span className={twMerge('text-zinc-400 dark:text-zinc-500 font-normal', s.text)}>
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
                    'inline-flex items-center gap-1.5 rounded-md border font-medium bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200',
                    cs
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  <button
                    type="button"
                    data-component-id={componentId ? `${componentId}.remove.${val}` : `erp.multiselect.remove.${val}`}
                    aria-label={`Remover ${opt.label}`}
                    onMouseDown={(e) => removeChip(val, e)}
                    className="rounded-full p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })}

            {hiddenChipsCount > 0 && (
              <span className="inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs px-2 py-0.5">
                +{hiddenChipsCount} {hiddenChipsCount === 1 ? 'selecionado' : 'selecionados'}
              </span>
            )}
          </div>
        )}

        <span className="ml-auto flex shrink-0 items-center gap-1 pl-1 text-zinc-400">
          {clearable && selected.length > 0 && (
            <button
              data-component-id={componentId ? `${componentId}.clear` : "erp.multiselect.clear"}
              type="button"
              aria-label="Limpar seleção"
              onMouseDown={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={15}
            className={twMerge('transition-transform duration-200', open && 'rotate-180')}
          />
        </span>
      </div>
    );
  };

  // ── Renderização do Dropdown (Portal) ────────────────────────────────────
  const renderDropdown = () => {
    if (!open) return null;

    return createPortal(
      <div
        ref={dropdownRef}
        style={dropdownStyle}
        className="rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 text-xs flex flex-col animate-in fade-in zoom-in-95 select-none"
      >
        {/* Cabeçalho do Dropdown */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100 dark:border-zinc-800 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {headerTitle || 'Filtrar'}
          </span>
          {hasSelectionsToClear && (
            <button
            data-component-id={componentId ? `${componentId}.clear-filter` : "erp.multiselect.clear-filter"}
            type="button"
            onClick={clearSelection}
            className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
          >
            Limpar filtro
          </button>
          )}
        </div>

        {/* Campo de Busca Opcional */}
        {searchable && (
          <div className="relative flex items-center px-1 py-1">
            <Search size={13} className="absolute left-3 text-zinc-400 pointer-events-none" />
            <input
              data-component-id={componentId ? `${componentId}.search` : "erp.multiselect.search"}
              ref={searchInputRef}
              type="text"
              value={search}
              placeholder="Pesquisar..."
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 pl-7 pr-7 py-1 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
            {search && (
              <button
                data-component-id={componentId ? `${componentId}.clear-search` : "erp.multiselect.clear-search"}
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Opção Selecionar Tudo */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleAll();
          }}
          className={twMerge(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors mt-0.5 select-none',
            isAllSelected
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
          )}
        >
          <input
            type="checkbox"
            data-component-id={componentId ? `${componentId}.select-all` : "erp.multiselect.select-all"}
            checked={isAllSelected}
            readOnly
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100 dark:checked:text-zinc-900 pointer-events-none cursor-pointer h-4 w-4"
          />
          <span>{selectAllLabel}</span>
        </div>

        {/* Lista de Opções */}
        <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-zinc-400">
              Nenhuma opção encontrada.
            </div>
          ) : (
            filtered.map((opt) => {
              const isChecked = selected.includes(opt.value);

              return (
                <div
                  key={opt.value}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleOption(opt.value);
                  }}
                  className={twMerge(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors select-none',
                    isChecked
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                  )}
                >
                  <input
                    type="checkbox"
                    data-component-id={componentId ? `${componentId}.option.${opt.value}` : `erp.multiselect.option.${opt.value}`}
                    checked={isChecked}
                    readOnly
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100 dark:checked:text-zinc-900 pointer-events-none cursor-pointer h-4 w-4"
                  />
                  <span className="truncate">{opt.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>,
      document.body
    );
  };

  // Se for modo botão e não tiver label, renderiza direto sem FieldWrapper
  if (isButtonMode && !label) {
    return (
      <div ref={containerRef} className="relative inline-block">
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
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      error={error}
      helpText={helpText}
      width={width}
      className={className}
    >
      <div ref={containerRef} className="relative">
        {renderTrigger()}
        {renderDropdown()}
      </div>
    </FieldWrapper>
  );
}