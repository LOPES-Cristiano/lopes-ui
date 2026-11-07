'use client';

import { useAccessControl } from '../useAccessControl';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
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
  stickyHeader = false,
  dividers = true,
  hoverable = true,
  striped = true,
  rowClassName,
  renderMobileCard,
  renderExpandedRow,
  expandedRowKeys: controlledExpandedRowKeys,
  defaultExpandedRowKeys,
  onExpandedRowsChange,
  expandColumnWidth,
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
  initialSearch,
  searchDebounceMs = 300,
  onSearchChange,
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
  pagination,
  paginationMode = 'client',
  page: controlledPage,
  pageSize: controlledPageSize,
  totalRows,
  pageSizeOptions,
  defaultPageSize,
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
  caption,
  className,
  componentId,
  onClose,
}: DataTableProps<T>) {
  const { canAccess } = useAccessControl();
  const isForbidden = Boolean(componentId && !canAccess(componentId));

  const resolvedDefaultPageSize = defaultPageSize ?? 10;
  const resolvedPageSizeOptions = useMemo(
    () => pageSizeOptions ?? [10, 25, 50, 100],
    [pageSizeOptions],
  );
  const isPaginationEnabled =
    pagination !== undefined
      ? pagination
      : Boolean(
          controlledPage !== undefined ||
            controlledPageSize !== undefined ||
            defaultPageSize !== undefined ||
            pageSizeOptions !== undefined ||
            onPageChange !== undefined ||
            onPageSizeChange !== undefined,
        );

  const isServerData = dataMode === 'server' || paginationMode === 'server';
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const resolvedTableActions = useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      icon?: React.ReactNode;
      onClick: () => void | Promise<void>;
      disabled?: boolean;
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
      componentId?: string;
      buttonClassName?: string;
      tooltip?: string;
    }> = [];

    if (tableActions && tableActions.length > 0) {
      list.push(...tableActions.filter((a) => !a.componentId || canAccess(a.componentId)));
    } else if (screenDefinition && screenActionHandlers) {
      const toolbarActions = screenDefinition.actions.filter((a) => a.placement === 'toolbar');
      toolbarActions.forEach((action) => {
        if (action.componentId && !canAccess(action.componentId)) return;
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
          let rawLabel: unknown;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }, [tableActions, screenDefinition, screenActionHandlers, actions, canAccess]);

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
    defaultPageSize: resolvedDefaultPageSize,
    defaultActiveTab,
    activeTab: controlledActiveTab,
    controlledPage,
    controlledPageSize,
    defaultSortKey,
    defaultSortDir,
    controlledSortKey,
    controlledSortDir,
    initialSearch,
    searchDebounceMs,
    onSearchChange,
    controlledFilters,
    initialFilters,
    onFilterChange,
    onSortChange,
    onPageChange,
    onPageSizeChange,
    onQueryChange,
  });

  const effectivePageSizeOptions = useMemo(() => {
    const set = new Set<number>(resolvedPageSizeOptions);
    if (resolvedDefaultPageSize > 0) set.add(resolvedDefaultPageSize);
    if (controlledPageSize && controlledPageSize > 0) set.add(controlledPageSize);
    if (pageSize > 0) set.add(pageSize);
    return Array.from(set).sort((a, b) => a - b);
  }, [resolvedPageSizeOptions, resolvedDefaultPageSize, controlledPageSize, pageSize]);

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
    [expandedKeys, controlledExpandedRowKeys, onExpandedRowsChange],
  );

  const hasExpandable = Boolean(renderExpandedRow);

  const [colHiddenOverrides, setColHiddenOverrides] = useState<Record<string, boolean>>(() => {
    if (!defaultHiddenColumns) return {};
    const initial: Record<string, boolean> = {};
    defaultHiddenColumns.forEach((key) => {
      initial[key] = true;
    });
    return initial;
  });

  const hiddenCols = useMemo(() => {
    if (controlledHiddenColumns) return new Set(controlledHiddenColumns);
    const next = new Set<string>();
    columns.forEach((c) => {
      if (c.required) return;
      const isHidden = Object.prototype.hasOwnProperty.call(colHiddenOverrides, c.key)
        ? colHiddenOverrides[c.key]
        : Boolean(c.hidden);
      if (isHidden) {
        next.add(c.key);
      }
    });
    Object.entries(colHiddenOverrides).forEach(([key, isHidden]) => {
      if (isHidden && !columns.some((c) => c.key === key && c.required)) {
        next.add(key);
      }
    });
    return next;
  }, [controlledHiddenColumns, columns, colHiddenOverrides]);

  const handleToggleCol = useCallback(
    (key: string) => {
      const targetCol = columns.find((c) => c.key === key);
      const isCurrentlyHidden = hiddenCols.has(key);
      if (!isCurrentlyHidden) {
        if (targetCol?.required) return;
        const visibleCount = columns.filter((c) => !hiddenCols.has(c.key)).length;
        if (visibleCount <= 1) return;
      }

      const next = new Set(hiddenCols);
      const willBeHidden = !isCurrentlyHidden;
      if (willBeHidden) next.add(key);
      else next.delete(key);

      if (controlledHiddenColumns && onHiddenColumnsChange) {
        onHiddenColumnsChange([...next]);
      } else {
        setColHiddenOverrides((prev) => ({
          ...prev,
          [key]: willBeHidden,
        }));
      }
    },
    [columns, hiddenCols, controlledHiddenColumns, onHiddenColumnsChange],
  );

  // Cache de contagens por aba no modo servidor, invalidado automaticamente quando busca/filtros mudam
  const serverTabScopeKey = isServerData ? JSON.stringify({ debouncedSearch, filters }) : '';
  const [serverTabCache, setServerTabCache] = useState<{
    scopeKey: string;
    counts: Record<number, number>;
  }>({ scopeKey: serverTabScopeKey, counts: {} });

  const shouldCacheActiveServerTabCount = Boolean(
    isServerData &&
      !loading &&
      totalRows !== undefined &&
      tabs &&
      tabs[activeTab]?.showCount &&
      tabs[activeTab]?.count === undefined,
  );

  if (isServerData) {
    if (serverTabCache.scopeKey !== serverTabScopeKey) {
      setServerTabCache({
        scopeKey: serverTabScopeKey,
        counts:
          shouldCacheActiveServerTabCount && totalRows !== undefined
            ? { [activeTab]: totalRows }
            : {},
      });
    } else if (
      shouldCacheActiveServerTabCount &&
      totalRows !== undefined &&
      serverTabCache.counts[activeTab] !== totalRows
    ) {
      setServerTabCache({
        scopeKey: serverTabScopeKey,
        counts: { ...serverTabCache.counts, [activeTab]: totalRows },
      });
    }
  }

  const tabCountsCache = serverTabCache.counts;

  const visibleCols = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols],
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

  const isPrePaginated = totalRows !== undefined && totalRows > safeRows.length;
  const isServerPaginated = isServerData || isPrePaginated;
  const resolvedTotalRows = isServerPaginated
    ? (totalRows ?? safeRows.length)
    : filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(resolvedTotalRows / pageSize));
  const effectivePage = isServerPaginated ? page : Math.max(1, Math.min(page, totalPages));

  const pageRows = useMemo(() => {
    if (!isPaginationEnabled) return filteredRows;
    if (isServerPaginated) {
      if (filteredRows.length <= pageSize) return filteredRows;
      const start = (effectivePage - 1) * pageSize;
      if (start < filteredRows.length) {
        return filteredRows.slice(start, start + pageSize);
      }
      return filteredRows.slice(0, pageSize);
    }
    const start = (effectivePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, isPaginationEnabled, isServerPaginated, effectivePage, pageSize]);

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
    page: effectivePage,
    pageSize,
    selectable,
    isRowSelectable,
    onSelectionChange,
    selectedKeys: controlledSelectedKeys,
    onRowSelect,
    isServerData: isServerPaginated,
    pagination: isPaginationEnabled,
  });

  const hasActions = Boolean(actions && actions.length > 0);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const pageOffset = Math.max(0, (effectivePage - 1) * pageSize);

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

  // Reúne ações para o menu flutuante QuickActions no mobile
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

  const hasHeaderContent = Boolean(
    resolvedTitle ||
      resolvedDescription ||
      toolbarSlot ||
      (resolvedTableActions && resolvedTableActions.length > 0) ||
      Boolean(onClose),
  );
  const hasSelection = selectedKeys.size > 0 || selectedRows.length > 0;
  const hasSortableColumns = useMemo(
    () => visibleCols.some((c) => c.sortable !== false),
    [visibleCols],
  );
  const hasDesktopToolbar = Boolean(
    hasHeaderContent ||
      globalSearch ||
      (filterFields && filterFields.length > 0) ||
      columnToggle ||
      toolbarLeftSlot ||
      toolbarSlot ||
      hasSelection,
  );
  const showToolbar = hasDesktopToolbar || hasSortableColumns;

  if (isForbidden) {
    return null;
  }

  return (
    <div
      data-component-id={componentId ?? 'data-table'}
      aria-busy={loading || undefined}
      className={twMerge('w-full flex flex-col gap-3', className)}
    >
      {loading && showLoadingLabel && loadingLabel && (
        <span role="status" aria-live="polite" className="sr-only">
          {loadingLabel}
        </span>
      )}

      {showToolbar && (
        <div className={twMerge('px-2 sm:px-0', !hasDesktopToolbar && 'md:hidden')}>
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
            hasSortableColumns={hasSortableColumns}
            onOpenMobileSort={() => setMobileSortOpen(true)}
            sortKey={sortKey}
            sortDir={sortDir}
            activeSortLabel={activeSortLabel}
          />
        </div>
      )}

      <div
        className={twMerge(
          'w-full min-w-0 transition-colors',
          variant === 'minimal'
            ? 'border-0 bg-transparent shadow-none'
            : 'rounded-none sm:rounded-[var(--radius-card)] bg-surface border-0 sm:border border-border shadow-none sm:shadow-[var(--shadow-card)]',
        )}
      >
        {tabs && tabs.length > 0 && (
          <div className="border-b border-border bg-muted/10 px-2 pt-2 shrink-0 overflow-hidden flex items-end justify-between gap-2">
            <div
              role="tablist"
              aria-label="Filtros por aba"
              data-no-swipe="true"
              className="flex items-end gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-none w-full scroll-smooth pr-8 pb-0.5"
            >
              {tabs.map((tab, i) => {
                if (tab.componentId && !canAccess(tab.componentId)) {
                  return null;
                }

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
                  } else if (tab.filter) {
                    count = safeRows.filter(tab.filter).length;
                  } else if (tab.field && tab.value !== undefined) {
                    count = safeRows.filter(
                      (r) =>
                        String((r as Record<string, unknown>)[tab.field!] ?? '') ===
                        String(tab.value),
                    ).length;
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
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveTab(i);
                      onTabChange?.(tab, i);
                    }}
                    className={twMerge(
                      'group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                      isActive
                        ? '-mb-[1px] bg-primary text-primary-foreground border-t-2 border-t-primary border-x border-primary font-bold shadow-xs z-10'
                        : 'bg-surface hover:bg-muted/40 text-foreground/80 hover:text-foreground border border-border/80 border-b-transparent dark:bg-card dark:hover:bg-muted/20',
                    )}
                  >
                    <span>{tab.label}</span>
                    {count !== null && (
                      <span
                        className={twMerge(
                          'inline-flex min-w-4 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold leading-none tabular-nums transition-colors',
                          isActive
                            ? 'bg-brand text-brand-foreground shadow-2xs'
                            : 'bg-muted text-muted-foreground group-hover:bg-muted/80',
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

        {subHeaderSlot && (
          <div className="w-full px-3 py-2 bg-muted/15 border-b border-border/70 flex items-center justify-between gap-3 flex-wrap">
            {subHeaderSlot}
          </div>
        )}

        {/* Visualização Desktop: Tabela Tradicional */}
        <div
          role="region"
          aria-label={
            typeof resolvedTitle === 'string' && resolvedTitle
              ? resolvedTitle
              : typeof caption === 'string' && caption
                ? caption
                : 'Tabela de dados'
          }
          tabIndex={0}
          className="hidden md:flex w-full overflow-x-auto lopes-scroll-shadow-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
        >
          <span aria-hidden="true" className="lopes-scroll-hint-left" />
          <table className="w-full min-w-full border-collapse text-left">
            {caption && <caption className="sr-only">{caption}</caption>}
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
              stickyHeader={stickyHeader}
              expandColumnWidth={expandColumnWidth}
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
                    colSpan={
                      visibleCols.length +
                      (selectable ? 1 : 0) +
                      (hasActions ? 1 : 0) +
                      (hasExpandable ? 1 : 0)
                    }
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
                      expandedContent={
                        isExpanded && renderExpandedRow ? renderExpandedRow(row, idx) : null
                      }
                      actions={actions}
                      actionsDisplay={actionsDisplay}
                      maxInlineActions={maxInlineActions}
                      size={size}
                      dividers={dividers}
                      hoverable={hoverable}
                      striped={striped}
                      rowClassName={rowClassName}
                      expandColumnWidth={expandColumnWidth}
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
          <span aria-hidden="true" className="lopes-scroll-hint-right" />
        </div>

        {/* Visualização Mobile */}
        <div className="block md:hidden w-full">
          {loading ? (
            <DataTableMobileCardsSkeleton cardCount={Math.min(pageSize ?? 6, 8)} />
          ) : pageRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground bg-surface border-y border-border/80">
              {emptySlot ?? 'Nenhum registro encontrado.'}
            </div>
          ) : (
            <div className="w-full border-t border-border bg-surface">
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
                    expandedContent={
                      isExpanded && renderExpandedRow ? renderExpandedRow(row, idx) : null
                    }
                    actions={actions}
                    onRowClick={onRowClick}
                    onActionError={onActionError}
                  />
                );
              })}
            </div>
          )}
        </div>

        {isPaginationEnabled && resolvedTotalRows > 0 && (
          <div className="w-full">
            <DataTablePagination
              page={effectivePage}
              pageSize={pageSize}
              totalRows={resolvedTotalRows}
              pageSizeOptions={effectivePageSizeOptions}
              onPageChange={setResolvedPage}
              onPageSizeChange={setResolvedPageSize}
              isServerPagination={isServerPaginated}
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
          mainButtonClassName="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl h-14 w-14"
          actions={mobileQuickActions}
        />
      )}
    </div>
  );
}
