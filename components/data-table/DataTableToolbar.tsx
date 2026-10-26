'use client';

import Controllable from '../Controllable';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronsDown,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../primitives/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../primitives/select';
import type { DataTableBulkAction, FilterField } from './DataTable.types';

export function DataTableToolbar<T = Record<string, unknown>>({
  title,
  description,
  toolbarLeftSlot,
  toolbarSlot,
  tableActions,
  maxInlineTableActions,
  globalSearch,
  searchQ,
  onSearchChange,
  filterFields,
  filterVariant,
  filters,
  safeRows,
  totalRows,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
  onToggleFilterOpen,
  filterOpen,
  filterBtnRef,
  columnToggle,
  hiddenColsCount,
  onToggleColPanelOpen,
  colPanelOpen,
  colBtnRef,
  selectedRows,
  selectedKeysCount,
  bulkActions,
  selectionBannerLabel,
  selectionBannerClassName,
  selectionBannerSlot,
  onClearSelection,
  onActionError,
  onClose,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbarLeftSlot?: React.ReactNode;
  toolbarSlot?: React.ReactNode;
  tableActions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    variant?: any;
    componentId?: string;
    buttonClassName?: string;
    tooltip?: string;
  }>;
  maxInlineTableActions?: number;
  globalSearch?: boolean;
  searchQ: string;
  onSearchChange: (q: string) => void;
  filterFields?: FilterField<T>[];
  filterVariant?: 'modal' | 'inline';
  filters?: Record<string, string>;
  safeRows?: T[];
  totalRows?: number;
  onFilterChange?: (key: string, val: string) => void;
  onResetFilters?: () => void;
  activeFilterCount: number;
  onToggleFilterOpen: () => void;
  filterOpen: boolean;
  filterBtnRef: React.RefObject<HTMLButtonElement | null>;
  columnToggle?: boolean;
  hiddenColsCount: number;
  onToggleColPanelOpen: () => void;
  colPanelOpen: boolean;
  colBtnRef: React.RefObject<HTMLButtonElement | null>;
  selectedRows: T[];
  selectedKeysCount?: number;
  bulkActions?: DataTableBulkAction<T>[];
  selectionBannerLabel?:
    string | React.ReactNode | ((count: number, selectedRows: T[]) => React.ReactNode);
  selectionBannerClassName?: string;
  selectionBannerSlot?:
    | React.ReactNode
    | ((context: {
        selectedCount: number;
        selectedRows: T[];
        clearSelection: () => void;
      }) => React.ReactNode);
  onClearSelection: () => void;
  onActionError?: (error: unknown, actionName?: string) => void;
  onClose?: () => void;
}) {
  const [runningBulkIdx, setRunningBulkIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleBulkClick = async (action: DataTableBulkAction<T>, index: number) => {
    if (action.disabled?.(selectedRows)) return;
    setRunningBulkIdx(index);
    try {
      await action.onClick(selectedRows);
      onClearSelection();
    } catch (err) {
      onActionError?.(err, typeof action.label === 'string' ? action.label : undefined);
    } finally {
      setRunningBulkIdx(null);
    }
  };

  const { inlineActions, overflowActions } = useMemo(() => {
    if (!tableActions || tableActions.length === 0) {
      return { inlineActions: [], overflowActions: [] };
    }

    let maxInline: number;
    if (maxInlineTableActions !== undefined) {
      maxInline = maxInlineTableActions;
    } else if (containerWidth !== null) {
      if (containerWidth < 740) {
        maxInline = 0; // tela estreita / zoom alto: todas em "Mais Ações"
      } else if (containerWidth < 980) {
        maxInline = 1; // zoom moderado: mantém 1 ação primária inline
      } else if (containerWidth < 1280) {
        maxInline = tableActions.length > 2 ? 1 : 2;
      } else {
        maxInline = tableActions.length > 3 ? 2 : tableActions.length;
      }
    } else {
      maxInline = tableActions.length > 2 ? 1 : 2;
    }

    if (tableActions.length <= maxInline) {
      return { inlineActions: tableActions, overflowActions: [] };
    }

    // Prioriza ações de criação / primary para manter inline visível
    const primaryActions = tableActions.filter(
      (a) => a.variant === 'primary' || a.id === 'criar' || a.id === 'novo'
    );
    const secondaryActions = tableActions.filter(
      (a) => a.variant !== 'primary' && a.id !== 'criar' && a.id !== 'novo'
    );

    const selectedInline: typeof tableActions = [];
    const selectedOverflow: typeof tableActions = [];

    // Preenche slots inline preferindo primárias
    for (const action of primaryActions) {
      if (selectedInline.length < maxInline) {
        selectedInline.push(action);
      } else {
        selectedOverflow.push(action);
      }
    }

    // Preenche slots inline restantes com secundárias
    for (const action of secondaryActions) {
      if (selectedInline.length < maxInline) {
        selectedInline.push(action);
      } else {
        selectedOverflow.push(action);
      }
    }

    return { inlineActions: selectedInline, overflowActions: selectedOverflow };
  }, [tableActions, maxInlineTableActions, containerWidth]);

  const hasHeaderContent =
    title || description || toolbarLeftSlot || toolbarSlot || (tableActions && tableActions.length > 0) || Boolean(onClose);
  const isInline = filterVariant === 'inline';

  return (
    <div className="w-full space-y-2">
      {/* Title & Custom Toolbar Slot (Sempre visível quando houver título, descrição ou ações) */}
      {hasHeaderContent && (
        <div
          ref={containerRef}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 pb-1"
        >
          <div className="flex items-start justify-between gap-3 min-w-0 w-full md:w-auto max-w-full md:max-w-md lg:max-w-xl">
            <div className="min-w-0">
            {title && (
              <div className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {title}
              </div>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 whitespace-normal">
                {description}
              </p>
            )}
            </div>
            {onClose && (
              <button
                data-component-id="erp.data-table.mobile-close"
                type="button"
                onClick={onClose}
                aria-label="Fechar e sair da tela"
                title="Fechar e sair da tela"
                className="md:hidden shrink-0 cursor-pointer rounded-xl p-1.5 text-muted-foreground opacity-70 transition-all hover:opacity-100 hover:bg-muted focus:outline-none active:scale-95 border-none"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end ml-auto">
            {globalSearch && (
              <div className="relative min-w-0 flex-1 sm:w-56 md:w-60 sm:flex-initial">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  data-component-id="erp.data-table.search"
                  type="text"
                  value={searchQ}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full h-8 pl-8 pr-7 rounded-xl border border-border/80 bg-surface text-xs text-foreground placeholder-muted-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
                {searchQ && (
                  <button
                    data-component-id="erp.data-table.clear-search"
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Limpar busca"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
            {toolbarLeftSlot}

            {/* Botão de Filtros no Header */}
            {filterFields && filterFields.length > 0 && !isInline && (
              <button
                data-component-id="erp.data-table.header-toggle-filters"
                ref={filterBtnRef}
                type="button"
                onClick={onToggleFilterOpen}
                aria-expanded={filterOpen}
                aria-haspopup="dialog"
                className={twMerge(
                  'shrink-0 flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs',
                  activeFilterCount > 0
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/80 bg-surface text-foreground hover:bg-muted/30'
                )}
              >
                <Filter size={13} className="text-muted-foreground" />
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {/* Botão de Colunas no Header */}
            {columnToggle && (
              <button
                data-component-id="erp.data-table.header-toggle-columns"
                ref={colBtnRef}
                type="button"
                onClick={onToggleColPanelOpen}
                aria-expanded={colPanelOpen}
                aria-haspopup="dialog"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/80 bg-surface text-xs font-semibold text-foreground hover:bg-muted/30 transition-all cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal size={13} />
                <span>Colunas</span>
                {hiddenColsCount > 0 && (
                  <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-muted text-[10px] text-foreground font-bold">
                    {hiddenColsCount}
                  </span>
                )}
              </button>
            )}

            {toolbarSlot}

            {/* Dropdown de Ações Agrupadas (Quick Actions Desktop) quando há muitas ações */}
            {overflowActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    data-component-id="erp.data-table.more-actions"
                    type="button"
                    className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/80 bg-surface text-xs font-semibold text-foreground hover:bg-muted/40 transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <ChevronsDown size={13} className="text-primary" />
                    <span>Mais Ações</span>
                    <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-muted text-[10px] text-foreground font-bold">
                      {overflowActions.length}
                    </span>
                    <ChevronDown size={13} className="text-muted-foreground opacity-70 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-1.5">
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                    Ações Rápidas
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  {overflowActions.map((action) => {
                    const item = (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={() => void action.onClick()}
                        disabled={action.disabled}
                        className={twMerge(
                          'flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors',
                          action.variant === 'danger'
                            ? 'text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30'
                            : 'text-foreground focus:bg-muted/60',
                          action.buttonClassName
                        )}
                      >
                        {action.icon && (
                          <span className="shrink-0 text-muted-foreground">{action.icon}</span>
                        )}
                        <span className="flex-1 truncate">{action.label}</span>
                      </DropdownMenuItem>
                    );

                    if (action.componentId) {
                      return (
                        <Controllable key={action.id} componentId={action.componentId}>
                          {item}
                        </Controllable>
                      );
                    }

                    return item;
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Ações exibidas diretamente (inline no desktop) */}
            {inlineActions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant ?? 'outline'}
                leftIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                componentId={action.componentId}
                className={twMerge(
                  'hidden md:inline-flex w-full sm:w-auto h-8',
                  action.buttonClassName
                )}
                tooltip={action.tooltip}
                tooltipPosition="bottom"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Toolbar (Search, Filter, Column Toggles - apenas quando não houver cabeçalho superior com busca) */}
      {!hasHeaderContent &&
        (globalSearch ||
          (filterFields && filterFields.length > 0) ||
          columnToggle ||
          toolbarLeftSlot ||
          toolbarSlot) && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 py-0.5">
            {/* Área Direita: Busca Global + Filtros Inline + ToolbarSlot + Colunas */}
            <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 justify-start md:justify-end flex-1 w-full">
              {/* Input de Busca Global Padrão */}
              {globalSearch && (
                <div className="relative min-w-0 flex-1 sm:w-60 md:w-64 sm:flex-initial">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    data-component-id="erp.data-table.search"
                    type="text"
                    value={searchQ}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full h-8 pl-8 pr-7 rounded-xl border border-border/80 bg-surface text-xs text-foreground placeholder-muted-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                  {searchQ && (
                    <button
                      data-component-id="erp.data-table.clear-search"
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Limpar busca"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}
              {toolbarLeftSlot}

              {/* Filtros em linha (filterVariant="inline") */}
              {filterFields && filterFields.length > 0 && isInline && (
                <div className="flex items-center gap-2 flex-wrap">
                  {filterFields.map((field) => {
                    const currentVal = filters?.[field.key] ?? '';

                    // 1. Tipo: Segmented Control / Badge Selector
                    if ((field.type === 'segmented' || field.type === 'badge') && field.options) {
                      return (
                        <div
                          key={field.key}
                          className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40 text-xs font-medium shrink-0"
                        >
                          {field.options.map((opt) => {
                            const isSelected =
                              currentVal === opt.value || (!currentVal && opt.value === '');

                            // Cálculo do contador se showCount for true
                            let count: number | null = null;
                            if (field.showCount && safeRows) {
                              if (!opt.value) {
                                count = safeRows.length;
                              } else if (field.predicate) {
                                count = safeRows.filter((r) =>
                                  field.predicate!(r, opt.value)
                                ).length;
                              } else {
                                count = safeRows.filter((r) => {
                                  const rowVal = (r as any)?.[field.key];
                                  return (
                                    String(rowVal ?? '').toLowerCase() === opt.value.toLowerCase()
                                  );
                                }).length;
                              }
                            }

                            // Cor do texto quando ativo
                            const colorCls =
                              opt.color === 'emerald'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : opt.color === 'rose'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : opt.color === 'sky'
                                    ? 'text-sky-600 dark:text-sky-400'
                                    : opt.color === 'amber'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : opt.color === 'purple'
                                        ? 'text-purple-600 dark:text-purple-400'
                                        : 'text-foreground';

                            return (
                              <button
                                data-component-id={`erp.data-table.filter-tab-${field.key}-${opt.value}`}
                                key={opt.value}
                                type="button"
                                onClick={() => onFilterChange?.(field.key, opt.value)}
                                className={twMerge(
                                  'px-2.5 py-0.5 rounded-md transition-all cursor-pointer text-xs shrink-0',
                                  isSelected
                                    ? `bg-surface shadow-2xs font-bold ${colorCls}`
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                <span>{opt.label}</span>
                                {count !== null && (
                                  <span className="opacity-70 text-[10px] ml-1">({count})</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    }

                    // 2. Tipo: Select Dropdown (Radix Select estilizado e premium)
                    if (field.type === 'select' && field.options) {
                      const selectedOpt = field.options.find((o) => o.value === currentVal);
                      const defaultOpt = field.options.find((o) => o.value === '');
                      const displayLabel =
                        selectedOpt?.label ??
                        defaultOpt?.label ??
                        (field.label ? `${field.label}: Todos` : 'Todos');

                      return (
                        <Select
                          key={field.key}
                          value={currentVal || '__ALL__'}
                          onValueChange={(val) =>
                            onFilterChange?.(field.key, val === '__ALL__' ? '' : val)
                          }
                        >
                          <SelectTrigger className="h-8 w-auto min-w-[130px] shrink-0 gap-2 rounded-xl border border-border/80 bg-surface px-3 text-xs text-foreground shadow-2xs focus:ring-1 focus:ring-primary focus:border-primary">
                            <SelectValue placeholder={displayLabel}>{displayLabel}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-border bg-popover shadow-lg text-xs">
                            {field.options.map((opt) => (
                              <SelectItem
                                key={opt.value || '__ALL__'}
                                value={opt.value || '__ALL__'}
                                className="text-xs py-1.5 px-2.5 rounded-lg cursor-pointer"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }

                    // 3. Tipo: Boolean Dropdown (Radix Select estilizado)
                    if (field.type === 'boolean') {
                      const labelText = field.label ?? 'Status';
                      const booleanDisplay =
                        currentVal === 'true'
                          ? 'Sim / Ativo'
                          : currentVal === 'false'
                            ? 'Não / Inativo'
                            : `${labelText}: Todos`;

                      return (
                        <Select
                          key={field.key}
                          value={currentVal || '__ALL__'}
                          onValueChange={(val) =>
                            onFilterChange?.(field.key, val === '__ALL__' ? '' : val)
                          }
                        >
                          <SelectTrigger className="h-8 w-auto min-w-[120px] shrink-0 gap-2 rounded-xl border border-border/80 bg-surface px-3 text-xs text-foreground shadow-2xs focus:ring-1 focus:ring-primary focus:border-primary">
                            <SelectValue placeholder={booleanDisplay}>{booleanDisplay}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-border bg-popover shadow-lg text-xs">
                            <SelectItem
                              value="__ALL__"
                              className="text-xs py-1.5 px-2.5 rounded-lg cursor-pointer"
                            >
                              {labelText}: Todos
                            </SelectItem>
                            <SelectItem
                              value="true"
                              className="text-xs py-1.5 px-2.5 rounded-lg cursor-pointer"
                            >
                              Sim / Ativo
                            </SelectItem>
                            <SelectItem
                              value="false"
                              className="text-xs py-1.5 px-2.5 rounded-lg cursor-pointer"
                            >
                              Não / Inativo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      );
                    }

                    // 4. Tipo: Text / Busca com Ícone
                    return (
                      <div
                        key={field.key}
                        className="relative min-w-[120px] sm:min-w-[150px] flex-1 sm:flex-initial"
                      >
                        <Search
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <input
                          data-component-id={`erp.data-table.filter-input-${field.key}`}
                          type={
                            field.type === 'number'
                              ? 'number'
                              : field.type === 'date'
                                ? 'date'
                                : 'text'
                          }
                          value={currentVal}
                          onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                          placeholder={
                            field.placeholder ??
                            (field.label ? `Buscar ${field.label.toLowerCase()}...` : 'Buscar...')
                          }
                          className="w-full h-7 pl-7 pr-2.5 text-xs bg-surface border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                        />
                        {currentVal && (
                          <button
                            data-component-id={`erp.data-table.clear-filter-${field.key}`}
                            type="button"
                            onClick={() => onFilterChange?.(field.key, '')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            aria-label="Limpar campo"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {activeFilterCount > 0 && onResetFilters && (
                    <button
                      data-component-id="erp.data-table.reset-filters"
                      type="button"
                      onClick={onResetFilters}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-border/70 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer shadow-2xs"
                      title="Limpar todos os filtros"
                    >
                      <X size={12} />
                      <span>Limpar</span>
                    </button>
                  )}
                </div>
              )}

              {/* Botão Modal quando filterVariant="modal" */}
              {filterFields && filterFields.length > 0 && !isInline && (
                <button
                  data-component-id="erp.data-table.toggle-filters"
                  ref={filterBtnRef}
                  type="button"
                  onClick={onToggleFilterOpen}
                  aria-expanded={filterOpen}
                  aria-haspopup="dialog"
                  className={twMerge(
                    'shrink-0 flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs',
                    activeFilterCount > 0
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border/80 bg-surface text-foreground hover:bg-muted/30'
                  )}
                >
                  <Filter size={14} className="text-muted-foreground" />
                  <span>Filtros</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-blue-50 text-[11px] text-blue-600 font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}

              {columnToggle && (
                <button
                  data-component-id="erp.data-table.toggle-columns"
                  ref={colBtnRef}
                  type="button"
                  onClick={onToggleColPanelOpen}
                  aria-expanded={colPanelOpen}
                  aria-haspopup="dialog"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-surface text-xs font-semibold text-foreground hover:bg-muted/30 transition-all cursor-pointer shadow-2xs"
                >
                  <SlidersHorizontal size={14} />
                  <span>Colunas</span>
                  {hiddenColsCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] text-foreground font-bold">
                      {hiddenColsCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      {/* Barra de Ações em Lote */}
      {(() => {
        const effectiveCount = selectedRows.length;
        if (effectiveCount <= 0) return null;

        if (selectionBannerSlot) {
          return typeof selectionBannerSlot === 'function'
            ? selectionBannerSlot({
                selectedCount: effectiveCount,
                selectedRows,
                clearSelection: onClearSelection,
              })
            : selectionBannerSlot;
        }

        return (
          <div
            className={twMerge(
              'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary animate-in fade-in duration-150',
              selectionBannerClassName
            )}
          >
            <div className="font-bold">
              {selectionBannerLabel
                ? typeof selectionBannerLabel === 'function'
                  ? selectionBannerLabel(effectiveCount, selectedRows)
                  : selectionBannerLabel
                : `${effectiveCount} item(ns) selecionado(s)`}
            </div>
            <div className="flex items-center gap-2">
              {bulkActions?.map((action, idx) => {
                const Icon = action.icon;
                const isDisabled = action.disabled?.(selectedRows);
                const isRunning = runningBulkIdx === idx;

                return (
                  <button
                    data-component-id={action.componentId || `erp.data-table.bulk-action-${idx}`}
                    key={idx}
                    type="button"
                    disabled={isDisabled || isRunning}
                    onClick={() => handleBulkClick(action, idx)}
                    className={twMerge(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-bold transition-all cursor-pointer disabled:opacity-50',
                      action.danger
                        ? 'border-red-300 bg-red-500/10 text-red-600 hover:bg-red-500/20'
                        : 'border-primary/40 bg-surface text-primary hover:bg-primary/20',
                      action.buttonClassName
                    )}
                  >
                    {isRunning ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      Icon && <Icon size={14} />
                    )}
                    <span>{action.label}</span>
                  </button>
                );
              })}
              <button
                data-component-id="erp.data-table.clear-selection"
                type="button"
                onClick={onClearSelection}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={13} />
                Limpar
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
