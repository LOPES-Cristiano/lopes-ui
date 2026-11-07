'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DataTableQueryState, SortDir } from '../DataTable.types';

export function useDataTableQuery({
  defaultPageSize = 10,
  defaultActiveTab = 0,
  activeTab: controlledActiveTab,
  controlledPage,
  controlledPageSize,
  defaultSortKey = null,
  defaultSortDir = null,
  controlledSortKey,
  controlledSortDir,
  initialSearch,
  searchDebounceMs = 300,
  onSearchChange,
  controlledFilters,
  initialFilters,
  onFilterChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
}: {
  defaultPageSize?: number;
  defaultActiveTab?: number;
  activeTab?: number;
  controlledPage?: number;
  controlledPageSize?: number;
  defaultSortKey?: string | null;
  defaultSortDir?: SortDir;
  controlledSortKey?: string | null;
  controlledSortDir?: SortDir;
  initialSearch?: string;
  searchDebounceMs?: number;
  onSearchChange?: (search: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlledFilters?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFilters?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange?: (filters: Record<string, any>) => void;
  onSortChange?: (sortKey: string | null, sortDir: SortDir) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onQueryChange?: (state: DataTableQueryState) => void;
}) {
  const [internalPage, setInternalPage] = useState(controlledPage ?? 1);
  const [internalPageSize, setInternalPageSize] = useState(controlledPageSize ?? defaultPageSize);
  const [searchQ, setSearchQ] = useState(initialSearch ?? '');
  const [debouncedSearchState, setDebouncedSearchState] = useState(initialSearch ?? '');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters ?? {});
  const [internalSortKey, setInternalSortKey] = useState<string | null>(
    controlledSortKey !== undefined ? controlledSortKey : (defaultSortKey ?? null),
  );
  const [internalSortDir, setInternalSortDir] = useState<SortDir>(
    controlledSortDir !== undefined ? controlledSortDir : (defaultSortDir ?? null),
  );
  const [internalActiveTab, setInternalActiveTab] = useState(controlledActiveTab ?? defaultActiveTab);
  const [prevDefaultTab, setPrevDefaultTab] = useState(defaultActiveTab);

  if (prevDefaultTab !== defaultActiveTab) {
    setPrevDefaultTab(defaultActiveTab);
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(defaultActiveTab);
    }
  }

  const controlledFiltersKey = controlledFilters ? JSON.stringify(controlledFilters) : null;
  const stableControlledFilters = useMemo(
    () =>
      controlledFiltersKey !== null
        ? (JSON.parse(controlledFiltersKey) as Record<string, string>)
        : undefined,
    [controlledFiltersKey],
  );
  const activeFilters = stableControlledFilters ?? filters;

  const page = controlledPage !== undefined ? controlledPage : internalPage;
  const pageSize = controlledPageSize !== undefined ? controlledPageSize : internalPageSize;
  const sortKey = controlledSortKey !== undefined ? controlledSortKey : internalSortKey;
  const sortDir = controlledSortDir !== undefined ? controlledSortDir : internalSortDir;
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const debouncedSearch = searchDebounceMs <= 0 ? searchQ : debouncedSearchState;

  // Debounce da busca global para evitar excesso de requisições no backend
  useEffect(() => {
    if (searchDebounceMs <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchState(searchQ);
    }, searchDebounceMs);
    return () => clearTimeout(timer);
  }, [searchQ, searchDebounceMs]);

  const setResolvedPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.max(1, nextPage);
      setInternalPage(safePage);
      onPageChange?.(safePage);
    },
    [onPageChange],
  );

  const setResolvedPageSize = useCallback(
    (nextPageSize: number) => {
      setInternalPageSize(nextPageSize);
      setInternalPage(1);
      if (onPageSizeChange) {
        onPageSizeChange(nextPageSize);
      } else {
        onPageChange?.(1);
      }
    },
    [onPageSizeChange, onPageChange],
  );

  const onQueryChangeRef = useRef(onQueryChange);
  useEffect(() => {
    onQueryChangeRef.current = onQueryChange;
  }, [onQueryChange]);

  const isFirstRender = useRef(true);
  const prevPageSizeRef = useRef(pageSize);
  const lastEmittedQueryKeyRef = useRef<string | null>(null);

  // Emite onQueryChange de forma unificada e deduplicada
  useEffect(() => {
    const pageSizeChanged = prevPageSizeRef.current !== pageSize;
    prevPageSizeRef.current = pageSize;
    const nextPage = pageSizeChanged ? 1 : page;
    const nextState: DataTableQueryState = {
      page: nextPage,
      pageSize,
      search: debouncedSearch,
      filters: activeFilters,
      sortKey,
      sortDir,
      activeTab,
    };
    const serialized = JSON.stringify(nextState);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastEmittedQueryKeyRef.current = serialized;
      return;
    }

    if (lastEmittedQueryKeyRef.current === serialized) {
      return;
    }
    lastEmittedQueryKeyRef.current = serialized;
    onQueryChangeRef.current?.(nextState);
  }, [page, pageSize, debouncedSearch, activeFilters, sortKey, sortDir, activeTab]);

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearchQ(newSearch);
      onSearchChange?.(newSearch);
      setResolvedPage(1);
    },
    [onSearchChange, setResolvedPage],
  );

  const handleFilterChange = useCallback(
    (key: string, val: string) => {
      const next = { ...activeFilters, [key]: val };
      setFilters(next);
      onFilterChange?.(next);
      setResolvedPage(1);
    },
    [activeFilters, onFilterChange, setResolvedPage],
  );

  const resetFilters = useCallback(() => {
    setFilters({});
    onFilterChange?.({});
    setResolvedPage(1);
  }, [onFilterChange, setResolvedPage]);

  const setSort = useCallback(
    (key: string | null, dir: SortDir) => {
      setInternalSortKey(key);
      setInternalSortDir(dir);
      onSortChange?.(key, dir);
      setResolvedPage(1);
    },
    [onSortChange, setResolvedPage],
  );

  const handleSortChange = useCallback(
    (key: string) => {
      let nextKey: string | null = key;
      let nextDir: SortDir = 'asc';

      if (sortKey === key) {
        if (sortDir === 'asc') nextDir = 'desc';
        else if (sortDir === 'desc') nextDir = null;
        else nextDir = 'asc';
      }

      if (nextDir === null) {
        nextKey = null;
      }

      setSort(nextKey, nextDir);
    },
    [sortKey, sortDir, setSort],
  );

  const setActiveTab = useCallback(
    (newTab: number) => {
      setInternalActiveTab(newTab);
      setResolvedPage(1);
      if (onQueryChange) {
        const nextState: DataTableQueryState = {
          page: 1,
          pageSize,
          search: debouncedSearch,
          filters: activeFilters,
          sortKey,
          sortDir,
          activeTab: newTab,
        };
        const serialized = JSON.stringify(nextState);
        if (lastEmittedQueryKeyRef.current !== serialized) {
          lastEmittedQueryKeyRef.current = serialized;
          onQueryChange(nextState);
        }
      }
    },
    [pageSize, debouncedSearch, activeFilters, sortKey, sortDir, setResolvedPage, onQueryChange],
  );

  return {
    page,
    pageSize,
    searchQ,
    debouncedSearch,
    filters: activeFilters,
    sortKey,
    sortDir,
    activeTab,
    setSearchQ: handleSearchChange,
    setResolvedPage,
    setResolvedPageSize,
    handleFilterChange,
    resetFilters,
    handleSortChange,
    setSort,
    setActiveTab,
  };
}
