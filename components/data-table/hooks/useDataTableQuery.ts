'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  controlledFilters?: Record<string, any>;
  initialFilters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSortChange?: (sortKey: string | null, sortDir: SortDir) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onQueryChange?: (state: DataTableQueryState) => void;
}) {
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [searchQ, setSearchQ] = useState(initialSearch ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? '');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters ?? {});
  const [internalSortKey, setInternalSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [internalSortDir, setInternalSortDir] = useState<SortDir>(defaultSortDir ?? null);
  const [activeTab, setActiveTabState] = useState(controlledActiveTab ?? defaultActiveTab);

  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setActiveTabState(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  const activeFilters = controlledFilters ? (controlledFilters as Record<string, string>) : filters;

  const isFirstRender = useRef(true);

  const page = controlledPage ?? internalPage;
  const pageSize = controlledPageSize ?? internalPageSize;
  const sortKey = controlledSortKey !== undefined ? controlledSortKey : internalSortKey;
  const sortDir = controlledSortDir !== undefined ? controlledSortDir : internalSortDir;

  useEffect(() => {
    if (controlledSortKey !== undefined) {
      setInternalSortKey(controlledSortKey);
    }
  }, [controlledSortKey]);

  useEffect(() => {
    if (controlledSortDir !== undefined) {
      setInternalSortDir(controlledSortDir);
    }
  }, [controlledSortDir]);

  useEffect(() => {
    if (defaultActiveTab !== undefined) {
      setActiveTabState(defaultActiveTab);
    }
  }, [defaultActiveTab]);

  useEffect(() => {
    if (controlledPage !== undefined) {
      setInternalPage(controlledPage);
    }
  }, [controlledPage]);

  useEffect(() => {
    if (controlledPageSize !== undefined) {
      setInternalPageSize(controlledPageSize);
    }
  }, [controlledPageSize]);

  // Debounce da busca global para evitar spam no backend (Issue #7)
  useEffect(() => {
    if (searchDebounceMs <= 0) {
      setDebouncedSearch(searchQ);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQ);
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

  // Emite onQueryChange de forma consistente e unificada (Issue #6)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onQueryChangeRef.current?.({
      page,
      pageSize,
      search: debouncedSearch,
      filters: activeFilters,
      sortKey,
      sortDir,
      activeTab,
    });
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
      setActiveTabState(newTab);
      setResolvedPage(1);
    },
    [setResolvedPage],
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
