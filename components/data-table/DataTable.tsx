'use client';

import { useAccessControl } from '../useAccessControl';
import React, { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { twMerge } from 'tailwind-merge';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../primitives/select';
import type { DataTableProps } from './DataTable.types';
import { DataTableColumnPanel } from './DataTableColumnPanel';
import { DataTableFilterDialog } from './DataTableFilterDialog';
import { DataTableHeader } from './DataTableHeader';
import { DataTableMobileCard } from './DataTableMobileCard';
import { DataTableMobileSortDialog } from './DataTableMobileSortDialog';
import { DataTablePagination } from './DataTablePagination';
import { DataTableRow } from './DataTableRow';
import { DataTableSummary } from './DataTableSummary';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTableRowsSkeleton, DataTableMobileCardsSkeleton } from './DataTableSkeleton';
import QuickActions from '../QuickActions';
import { useDataTableQuery } from './hooks/useDataTableQuery';
import { useDataTableSelection } from './hooks/useDataTableSelection';
import { matchesFilters, matchesGlobal } from './utils/filtering';
import { getDataTableRowKey } from './utils/row-key';
import { sortRows } from './utils/sorting';

export default function DataTable<T = Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  onRowClick,
  variant = 'minimal',
  size = 'md',
  dividers = true,
  hoverable = true,
  striped = true,
  rowClassName,
  renderMobileCard,
  renderExpandedRow,
  expandedRowKeys: controlledExpandedRowKeys,
  defaultExpandedRowKeys,
  onExpandedRowsChange,
  actions,
  actionsDisplay = 'menu',
  maxInlineActions = 4,
  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onRowSelect,
  checkboxClassName,
  bulkActions,
  selectionBannerLabel,
  selectionBannerClassName,
  selectionBannerSlot,
  onClearSelection: customOnClearSelection,
  isRowSelectable,
  onSelectionChange,
  columnToggle = false,
  defaultHiddenColumns,
  hiddenColumns: controlledHiddenColumns,
  onHiddenColumnsChange,
  globalSearch = false,
  searchDebounceMs = 300,
  filterFields,
  filterVariant = 'modal',
  filters: controlledFilters,
  initialFilters,
  onFilterChange,
  tabs,
  activeTab: controlledActiveTab,
  defaultActiveTab = 0,
  onTabChange,
  dataMode = 'client',
  pagination = false,
  paginationMode = 'client',
  page: controlledPage,
  pageSize: controlledPageSize,
  totalRows,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  defaultSortKey,
  defaultSortDir,
  sortKey: controlledSortKey,
  sortDir: controlledSortDir,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onActionError,
  showSummary = false,
  summaryScope = 'filtered',
  summaryValues,
  title,
  description,
  toolbarLeftSlot,
  toolbarSlot,
  subHeaderSlot,
  tableActions,
  maxInlineTableActions = 2,
  screenDefinition,
  screenActionHandlers,
  loading = false,
  loadingLabel = 'Carregando registros...',
  showLoadingLabel = true,
  emptySlot,
  className,
  componentId,
  onClose,
}: DataTableProps<T>) {
  const { canAccess } = useAccessControl();
  const isForbidden = Boolean(componentId && !canAccess(componentId));

  const isServerData = dataMode === 'server' || paginationMode === 'server';
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const resolvedTableActions = useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      icon?: React.ReactNode;
      onClick: () => void | Promise<void>;
      disabled?: boolean;
      variant?: any;
      componentId?: string;
      buttonClassName?: string;
      tooltip?: string;
    }> = [];

    if (tableActions && tableActions.length > 0) {
      list.push(...tableActions.filter((a) => !a.componentId || canAccess(a.componentId)));
    } else if (screenDefinition && screenActionHandlers) {
      const toolbarActions = screenDefinition.actions.filter((a) => a.placement === 'toolbar');
      toolbarActions.forEach((action) => {
        const actionKey = action.id;
        const capitalized = actionKey.charAt(0).toUpperCase() + actionKey.slice(1);
        const handler =
          screenActionHandlers[actionKey] ??
          screenActionHandlers[`gerenciar${capitalized}`] ??
          screenActionHandlers[`abrir${capitalized}`] ??
          screenActionHandlers[`novo${capitalized}`] ??
          screenActionHandlers[actionKey.replace(/^gerenciar/, '').toLowerCase()] ??
          screenActionHandlers[actionKey.replace(/^abrir/, '').toLowerCase()];
        const Icon = action.icon;
        const label = typeof action.label === 'function' ? action.label() : action.label;
        const iconClass =
          typeof action.iconClassName === 'function'
            ? action.iconClassName()
            : action.iconClassName;
        const buttonClass =
          typeof action.buttonClassName === 'function'
            ? action.buttonClassName()
            : action.buttonClassName;
        const actionDisabled =
          typeof action.disabled === 'function' ? action.disabled() : action.disabled;

        list.push({
          id: action.id,
          label,
          icon: Icon ? <Icon size={16} className={iconClass} /> : undefined,
          onClick: () => {
            if (handler) {
              void handler();
            }
          },
          disabled: actionDisabled,
          variant:
            action.variant ??
            (action.id === 'criar' || action.id === 'novo' ? 'primary' : 'outline'),
          componentId: action.componentId,
          buttonClassName: buttonClass,
          tooltip: action.tooltip,
        });
      });
    }

    if (actions && actions.length > 0) {
      actions
        .filter((a) => a.inline === false)
        .forEach((a, idx) => {
          const actionId = `action-${idx}`;
          let rawLabel: any;
          try {
            rawLabel = typeof a.label === 'function' ? a.label(null as any) : a.label;
          } catch {
            rawLabel = undefined;
          }
          const label = typeof rawLabel === 'string' ? rawLabel : `Ação ${idx + 1}`;
          if (!list.some((existing) => existing.id === actionId || existing.label === label)) {
            const Icon = a.icon;
            list.push({
              id: actionId,
              label,
              icon: Icon ? <Icon size={16} /> : undefined,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick: () => a.onClick?.(null as any),
              variant: idx === 0 ? 'primary' : 'outline',
            });
          }
        });
    }

    return list;
  }, [tableActions, screenDefinition, screenActionHandlers, actions]);

  const resolvedTitle = title ?? screenDefinition?.title;
  const resolvedDescription = description ?? screenDefinition?.description;

  const {
    page,
    pageSize,
    searchQ,
    debouncedSearch,
    filters,
    sortKey,
    sortDir,
    activeTab,
    setSearchQ,
    setResolvedPage,
    setResolvedPageSize,
    handleFilterChange,
    resetFilters,
    handleSortChange,
    setSort,
    setActiveTab,
  } = useDataTableQuery({
    defaultPageSize,
    defaultActiveTab,
    activeTab: controlledActiveTab,
    controlledPage,
    controlledPageSize,
    defaultSortKey,
    defaultSortDir,
    controlledSortKey,
    controlledSortDir,
    searchDebounceMs,
    controlledFilters,
    initialFilters,
    onFilterChange,
    onSortChange,
    onPageChange,
    onPageSizeChange,
    onQueryChange,
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const colBtnRef = useRef<HTMLButtonElement>(null);

  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string | number>>(() => {
    if (defaultExpandedRowKeys && defaultExpandedRowKeys.length > 0) {
      return new Set(defaultExpandedRowKeys);
    }
    return new Set();
  });

  const expandedKeys = useMemo(() => {
    if (controlledExpandedRowKeys !== undefined) {
      return controlledExpandedRowKeys instanceof Set
        ? controlledExpandedRowKeys
        : new Set(controlledExpandedRowKeys);
    }
    return internalExpandedKeys;
  }, [controlledExpandedRowKeys, internalExpandedKeys]);

  const toggleRowExpand = useCallback(
    (key: string | number) => {
      const next = new Set(expandedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (controlledExpandedRowKeys === undefined) {
        setInternalExpandedKeys(next);
      }
      onExpandedRowsChange?.(Array.from(next));
    },
    [expandedKeys, controlledExpandedRowKeys, onExpandedRowsChange]
  );

  const hasExpandable = Boolean(renderExpandedRow);

  const [internalHiddenCols, setInternalHiddenCols] = useState<Set<string>>(() => {
    if (defaultHiddenColumns) return new Set(defaultHiddenColumns);
    return new Set(columns.filter((c) => c.hidden).map((c) => c.key));
  });

  useEffect(() => {
    if (controlledHiddenColumns) return;
    setInternalHiddenCols((prev) => {
      const initialHidden = columns.filter((c) => c.hidden).map((c) => c.key);
      let changed = false;
      initialHidden.forEach((k) => {
        if (!prev.has(k)) changed = true;
      });
      if (!changed) return prev;
      const merged = new Set(prev);
      initialHidden.forEach((k) => merged.add(k));
      return merged;
    });
  }, [columns, controlledHiddenColumns]);

  const hiddenCols = useMemo(() => {
    if (controlledHiddenColumns) return new Set(controlledHiddenColumns);
    return internalHiddenCols;
  }, [controlledHiddenColumns, internalHiddenCols]);

  const handleToggleCol = useCallback(
    (key: string) => {
      const next = new Set(hiddenCols);
      if (next.has(key)) next.delete(key);
      else next.add(key);

      if (controlledHiddenColumns && onHiddenColumnsChange) {
        onHiddenColumnsChange([...next]);
      } else {
        setInternalHiddenCols(next);
      }
    },
    [hiddenCols, controlledHiddenColumns, onHiddenColumnsChange]
  );

  const [tabCountsCache, setTabCountsCache] = useState<Record<number, number>>({});

  // Limpa o cache de contagens de abas do servidor quando filtros ou busca mudam
  const prevFilterSearchRef = useRef<string>('');
  useEffect(() => {
    if (!isServerData) return;
    const currentKey = JSON.stringify({ debouncedSearch, filters });
    if (prevFilterSearchRef.current && prevFilterSearchRef.current !== currentKey) {
      setTabCountsCache({});
    }
    prevFilterSearchRef.current = currentKey;
  }, [isServerData, debouncedSearch, filters]);

  useEffect(() => {
    if (!tabs || tabs.length === 0) return;

    setTabCountsCache((prev) => {
      const next = { ...prev };
      let changed = false;

      tabs.forEach((tab, i) => {
        if (!tab.showCount) return;

        let count: number | null = null;
        if (tab.count !== undefined) {
          count = tab.count;
        } else if (isServerData) {
          if (!loading && activeTab === i && totalRows !== undefined) {
            count = totalRows;
          }
        } else if (tab.filter) {
          count = safeRows.filter(tab.filter).length;
        } else if (tab.field && tab.value !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          count = safeRows.filter((r: any) => String(r[tab.field!] ?? '') === String(tab.value)).length;
        } else {
          count = safeRows.length;
        }

        if (count !== null) {
          if (next[i] !== count) {
            next[i] = count;
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [tabs, safeRows, isServerData, activeTab, totalRows, loading]);

  const visibleCols = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols]
  );

  const filteredRows = useMemo(() => {
    if (isServerData) {
      return safeRows;
    }

    let result = safeRows;
    if (tabs && tabs[activeTab]) {
      const tab = tabs[activeTab];
      if (tab.filter) {
        result = result.filter(tab.filter);
      } else if (tab.field && tab.value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = result.filter((r: any) => String(r[tab.field!] ?? '') === String(tab.value));
      }
    }
    if (debouncedSearch) {
      result = result.filter((r) => matchesGlobal(r, debouncedSearch));
    }
    if (Object.values(filters).some(Boolean)) {
      result = result.filter((r) => matchesFilters(r, filters, filterFields));
    }
    if (sortKey && sortDir) {
      result = sortRows(result, sortKey, sortDir, columns);
    }
    return result;
  }, [
    safeRows,
    isServerData,
    tabs,
    activeTab,
    debouncedSearch,
    filters,
    filterFields,
    sortKey,
    sortDir,
    columns,
  ]);

  const resolvedTotalRows = isServerData ? (totalRows ?? safeRows.length) : filteredRows.length;
  const pageRows = useMemo(() => {
    if (!pagination || isServerData) return filteredRows;
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pagination, isServerData, page, pageSize]);

  const {
    selectedKeys,
    selectedRows,
    allPageSelected,
    somePageSelected,
    toggleRow,
    togglePage,
    clearSelection,
  } = useDataTableSelection({
    safeRows,
    pageRows,
    rowKey,
    page,
    pageSize,
    selectable,
    isRowSelectable,
    onSelectionChange,
    selectedKeys: controlledSelectedKeys,
    onRowSelect,
  });

  const hasActions = Boolean(actions && actions.length > 0);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const pageOffset = Math.max(0, (page - 1) * pageSize);

  const activeSortCol = useMemo(() => {
    if (!sortKey) return null;
    return columns.find((c) => c.key === sortKey) || null;
  }, [columns, sortKey]);

  const activeSortLabel = useMemo(() => {
    if (!activeSortCol) return null;
    if (typeof activeSortCol.label === 'string' && activeSortCol.label.trim())
      return activeSortCol.label;
    if (typeof activeSortCol.header === 'string' && activeSortCol.header.trim())
      return activeSortCol.header;
    return activeSortCol.key;
  }, [activeSortCol]);

  // Reúne ações para o menu flutuante QuickActions no mobile (tableActions + ações globais não-inline)
  const mobileQuickActions = useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
      disabled?: boolean;
      tooltip?: string;
    }> = [];

    if (resolvedTableActions && resolvedTableActions.length > 0) {
      resolvedTableActions.forEach((ta) => {
        list.push({
          id: ta.id,
          label: ta.label,
          icon: ta.icon ?? <span className="font-bold text-xs">+</span>,
          onClick: ta.onClick,
          disabled: ta.disabled,
          tooltip: ta.tooltip,
        });
      });
    }

    return list;
  }, [resolvedTableActions]);

  const hasTabs = Boolean(tabs && tabs.length > 0);
  const isInline = filterVariant === 'inline';
  const hasHeaderContent = Boolean(
    resolvedTitle ||
      resolvedDescription ||
      toolbarSlot ||
      (resolvedTableActions && resolvedTableActions.length > 0) ||
      Boolean(onClose)
  );
  const hasSelection = selectedKeys.size > 0 || selectedRows.length > 0;
  const showToolbar = hasHeaderContent || globalSearch || (filterFields && filterFields.length > 0) || hasSelection;

  if (isForbidden) {
    return null;
  }

  return (
    <div
      className={twMerge('w-full flex flex-col gap-3', className)}
      >
      {showToolbar && (
        <div className="px-2 sm:px-0">
          <DataTableToolbar
            title={resolvedTitle}
            description={resolvedDescription}
            toolbarLeftSlot={toolbarLeftSlot}
            toolbarSlot={toolbarSlot}
            tableActions={resolvedTableActions}
            maxInlineTableActions={maxInlineTableActions}
            globalSearch={globalSearch}
            searchQ={searchQ}
            onSearchChange={setSearchQ}
            filterFields={filterFields}
            filterVariant={filterVariant}
            filters={filters}
            safeRows={safeRows}
            totalRows={resolvedTotalRows}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
            onToggleFilterOpen={() => setFilterOpen((v) => !v)}
            filterOpen={filterOpen}
            filterBtnRef={filterBtnRef}
            columnToggle={columnToggle}
            hiddenColsCount={hiddenCols.size}
            onToggleColPanelOpen={() => setColPanelOpen((v) => !v)}
            colPanelOpen={colPanelOpen}
            colBtnRef={colBtnRef}
            selectedRows={selectedRows}
            selectedKeysCount={selectedKeys.size}
            bulkActions={bulkActions}
            selectionBannerLabel={selectionBannerLabel}
            selectionBannerClassName={selectionBannerClassName}
            selectionBannerSlot={selectionBannerSlot}
            onClearSelection={customOnClearSelection ?? clearSelection}
            onActionError={onActionError}
            onClose={onClose}
          />
        </div>
      )}

      {/* Container da Tabela (minimal = sem bordas externas, clean) */}
      <div
        className={twMerge(
          'w-full min-w-0 transition-all',
          variant === 'minimal'
            ? 'border-0 bg-transparent shadow-none'
            : 'rounded-none sm:rounded-2xl bg-surface border-0 sm:border border-border/80 shadow-none sm:shadow-xs'
        )}
      >
        {tabs && tabs.length > 0 && (
          <div className="border-b border-border bg-muted/10 px-2 pt-2 shrink-0 overflow-hidden flex items-end justify-between gap-2">
            {/* Lado Esquerdo: Abas Originais */}
            <div
              data-no-swipe="true"
              className="flex items-end gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-none w-full scroll-smooth pr-8 pb-0.5"
            >
              {tabs.map((tab, i) => {
                let count: number | null = null;
                if (tab.showCount) {
                  if (tab.count !== undefined) {
                    count = tab.count;
                  } else if (isServerData) {
                    if (activeTab === i) {
                      if (!loading && totalRows !== undefined) {
                        count = totalRows;
                      } else if (!loading && tabCountsCache[i] !== undefined) {
                        count = tabCountsCache[i];
                      } else {
                        count = null;
                      }
                    } else if (tabCountsCache[i] !== undefined) {
                      count = tabCountsCache[i];
                    }
                  } else if (tabCountsCache[i] !== undefined) {
                    count = tabCountsCache[i];
                  } else if (tab.filter) {
                    count = safeRows.filter(tab.filter).length;
                  } else if (tab.field && tab.value !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    count = safeRows.filter((r: any) => String(r[tab.field!] ?? '') === String(tab.value)).length;
                  } else {
                    count = safeRows.length;
                  }
                }

                const isActive = activeTab === i;

                return (
                  <button
                    data-component-id={tab.componentId || `erp.data-table.tab-${i}`}
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveTab(i);
                      onTabChange?.(tab, i);
                    }}
                    className={twMerge(
                      'group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 rounded-t-md',
                      isActive
                        ? '-mb-[1px] bg-primary text-white border-t-2 border-t-primary border-x border-primary font-bold shadow-xs z-10'
                        : 'bg-surface hover:bg-muted/40 text-foreground/80 hover:text-foreground border border-border/80 border-b-transparent dark:bg-card dark:hover:bg-muted/20'
                    )}
                  >
                    <span>{tab.label}</span>
                    {count !== null && (
                      <span
                        className={twMerge(
                          'inline-flex min-w-4 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold leading-none transition-colors',
                          isActive
                            ? 'bg-[#d9383a] text-white shadow-2xs'
                            : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Slot de Sub-cabeçalho customizado (dentro da aba / acima da tabela) */}
        {subHeaderSlot && (
          <div className="w-full px-3 py-2 bg-muted/15 border-b border-border/70 flex items-center justify-between gap-3 flex-wrap">
            {subHeaderSlot}
          </div>
        )}

        {/* Visualização Desktop: Tabela Tradicional */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full min-w-full border-collapse text-left">
            <DataTableHeader
              columns={visibleCols}
              selectionEnabled={selectable}
              hasExpandable={hasExpandable}
              allPageSelected={allPageSelected}
              somePageSelected={somePageSelected}
              onTogglePageSelected={togglePage}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSortChange}
              size={size}
              hasActions={hasActions}
              checkboxClassName={checkboxClassName}
            />

            <tbody className="divide-y divide-border/60 bg-surface">
              {loading ? (
                <DataTableRowsSkeleton
                  columns={visibleCols}
                  rowCount={Math.max(14, Math.min(pageSize ?? 14, 20))}
                  size={size}
                  selectable={selectable}
                  hasExpandable={hasExpandable}
                  hasActions={hasActions}
                  striped={striped}
                />
              ) : pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleCols.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}
                    className="py-12 text-center text-xs text-muted-foreground"
                  >
                    {emptySlot ?? 'Nenhum registro encontrado.'}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => {
                  const key = getDataTableRowKey(row, idx, rowKey, pageOffset);
                  const isSelected = selectedKeys.has(key);
                  const isSelectable = isRowSelectable?.(row) ?? true;
                  const isExpanded = expandedKeys.has(key);

                  return (
                    <DataTableRow
                      key={key}
                      row={row}
                      rowIndex={idx}
                      totalRowsOnPage={pageRows.length}
                      columns={visibleCols}
                      rowSelectionKey={key}
                      isSelected={isSelected}
                      selectionEnabled={selectable}
                      isSelectable={isSelectable}
                      onToggleSelect={toggleRow}
                      onRowClick={onRowClick}
                      hasExpandable={hasExpandable}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleRowExpand(key)}
                      expandedContent={isExpanded && renderExpandedRow ? renderExpandedRow(row, idx) : null}
                      actions={actions}
                      actionsDisplay={actionsDisplay}
                      maxInlineActions={maxInlineActions}
                      size={size}
                      dividers={dividers}
                      hoverable={hoverable}
                      striped={striped}
                      rowClassName={rowClassName}
                      checkboxClassName={checkboxClassName}
                      onActionError={onActionError}
                    />
                  );
                })
              )}
            </tbody>

            {showSummary && !loading && pageRows.length > 0 && (
              <DataTableSummary
                columns={visibleCols}
                safeRows={safeRows}
                filteredRows={filteredRows}
                pageRows={pageRows}
                selectionEnabled={selectable}
                hasExpandable={hasExpandable}
                summaryScope={summaryScope}
                summaryValues={summaryValues}
                hasActions={hasActions}
              />
            )}
          </table>
        </div>

        {/* Visualização Mobile: Linhas Zebradas Identicas ao PC pegando toda a tela */}
        <div className="block md:hidden w-full">
          {loading ? (
            <DataTableMobileCardsSkeleton cardCount={Math.min(pageSize ?? 6, 8)} />
          ) : pageRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground bg-surface border-y border-zinc-200/80 dark:border-zinc-800">
              {emptySlot ?? 'Nenhum registro encontrado.'}
            </div>
          ) : (
            <div className="w-full border-t border-zinc-400/80 dark:border-zinc-600 bg-white dark:bg-zinc-900/30">
              {pageRows.map((row, idx) => {
                const key = getDataTableRowKey(row, idx, rowKey, pageOffset);
                const isExpanded = expandedKeys.has(key);

                if (renderMobileCard) {
                  return (
                    <React.Fragment key={key}>
                      {renderMobileCard(row, idx, actions)}
                    </React.Fragment>
                  );
                }

                return (
                  <DataTableMobileCard
                    key={key}
                    row={row}
                    rowIndex={idx}
                    columns={visibleCols}
                    hasExpandable={hasExpandable}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleRowExpand(key)}
                    expandedContent={isExpanded && renderExpandedRow ? renderExpandedRow(row, idx) : null}
                    actions={actions}
                    onRowClick={onRowClick}
                    onActionError={onActionError}
                  />
                );
              })}
            </div>
          )}
        </div>

        {pagination && resolvedTotalRows > 0 && (
          <div className="w-full">
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              totalRows={resolvedTotalRows}
              pageSizeOptions={pageSizeOptions}
              onPageChange={setResolvedPage}
              onPageSizeChange={setResolvedPageSize}
              isServerPagination={isServerData}
              loading={loading}
            />
          </div>
        )}
      </div>

      {filterOpen && filterFields && (
        <DataTableFilterDialog
          fields={filterFields}
          values={filters}
          onChange={handleFilterChange}
          onClose={() => setFilterOpen(false)}
          onReset={resetFilters}
        />
      )}

      {colPanelOpen && (
        <DataTableColumnPanel
          columns={columns}
          hidden={hiddenCols}
          onToggle={handleToggleCol}
          onClose={() => setColPanelOpen(false)}
        />
      )}

      {mobileSortOpen && (
        <DataTableMobileSortDialog
          columns={columns}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSort(key, dir);
          }}
          onClose={() => setMobileSortOpen(false)}
        />
      )}

      {/* QuickActions Flutuante Automático para Ações da Tabela no Mobile */}
      {mobileQuickActions.length > 0 && (
        <QuickActions
          className="md:hidden"
          mainButtonClassName="bg-blue-600 hover:bg-blue-700 text-white shadow-xl h-14 w-14"
          actions={mobileQuickActions}
        />
      )}
    </div>
  );
}
