'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDataTableRowKey } from '../utils/row-key';

const EMPTY_ROWS: never[] = [];

function setsEqual(a: Set<string | number> | null, b: Set<string | number>): boolean {
  if (!a || a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

function buildSelectedRows<T>(
  keys: Set<string | number>,
  currentRowsByKey: Map<string | number, T>,
  cachedRowsByKey: Map<string | number, T>,
  selectable?: boolean,
): T[] {
  if (!selectable || keys.size === 0) {
    return EMPTY_ROWS as T[];
  }

  const result: T[] = [];
  const included = new Set<string | number>();

  // Preserva linhas selecionadas em outras páginas (paginação server-side/client-side)
  keys.forEach((key) => {
    if (!currentRowsByKey.has(key)) {
      const cached = cachedRowsByKey.get(key);
      if (cached !== undefined) {
        result.push(cached);
        included.add(key);
      }
    }
  });

  // Mantém a ordem original das linhas carregadas atualmente
  currentRowsByKey.forEach((row, key) => {
    if (keys.has(key) && !included.has(key)) {
      result.push(row);
      included.add(key);
    }
  });

  return result;
}

export function useDataTableSelection<T = Record<string, unknown>>({
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
  isServerData = false,
  pagination = false,
}: {
  safeRows: T[];
  pageRows: T[];
  rowKey?: (row: T, index?: number) => string | number | undefined;
  page: number;
  pageSize: number;
  selectable?: boolean;
  isRowSelectable?: (row: T) => boolean;
  onSelectionChange?: (rows: T[]) => void;
  selectedKeys?: (string | number)[] | Set<string | number>;
  onRowSelect?: (row: T, selected: boolean) => void;
  isServerData?: boolean;
  pagination?: boolean;
}) {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string | number>>(
    () => new Set(),
  );
  const [cachedRowsByKey, setCachedRowsByKey] = useState<Map<string | number, T>>(() => new Map());

  const pageOffset = Math.max(0, (page - 1) * pageSize);

  const currentRowsByKey = useMemo(() => {
    const map = new Map<string | number, T>();
    pageRows.forEach((row, index) => {
      const key = getDataTableRowKey(row, index, rowKey, pageOffset);
      map.set(key, row);
    });
    if (!isServerData) {
      safeRows.forEach((row, index) => {
        const key = getDataTableRowKey(row, index, rowKey, 0);
        if (!map.has(key)) {
          map.set(key, row);
        }
      });
    }
    return map;
  }, [pageRows, safeRows, rowKey, pageOffset, isServerData]);

  const selectedKeys = useMemo(() => {
    if (controlledSelectedKeys !== undefined) {
      return controlledSelectedKeys instanceof Set
        ? controlledSelectedKeys
        : new Set(controlledSelectedKeys);
    }
    if (!selectable) {
      return new Set<string | number>();
    }
    // Em modo cliente sem paginação ativa, descarta chaves de registros que não existem mais
    if (!isServerData && !pagination && page <= 1 && internalSelectedKeys.size > 0) {
      const filtered = new Set<string | number>();
      internalSelectedKeys.forEach((k) => {
        if (currentRowsByKey.has(k)) {
          filtered.add(k);
        }
      });
      return filtered.size === internalSelectedKeys.size ? internalSelectedKeys : filtered;
    }
    return internalSelectedKeys;
  }, [
    controlledSelectedKeys,
    selectable,
    isServerData,
    pagination,
    page,
    internalSelectedKeys,
    currentRowsByKey,
  ]);

  const lastEmittedKeysRef = useRef<Set<string | number>>(new Set(selectedKeys));

  const selectedRows = useMemo(
    () => buildSelectedRows(selectedKeys, currentRowsByKey, cachedRowsByKey, selectable),
    [selectedKeys, currentRowsByKey, cachedRowsByKey, selectable],
  );

  const pageSelectableEntries = useMemo(() => {
    return pageRows
      .map((row, index) => ({
        row,
        key: getDataTableRowKey(row, index, rowKey, pageOffset),
      }))
      .filter(({ row }) => isRowSelectable?.(row) ?? true);
  }, [isRowSelectable, pageRows, rowKey, pageOffset]);

  const pageSelectableKeys = useMemo(
    () => pageSelectableEntries.map((entry) => entry.key),
    [pageSelectableEntries],
  );

  const selectedPageCount = pageSelectableKeys.filter((key) => selectedKeys.has(key)).length;
  const allPageSelected =
    pageSelectableKeys.length > 0 && selectedPageCount === pageSelectableKeys.length;
  const somePageSelected = selectedPageCount > 0 && !allPageSelected;

  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    if (setsEqual(lastEmittedKeysRef.current, selectedKeys)) {
      return;
    }
    lastEmittedKeysRef.current = new Set(selectedKeys);
    onSelectionChangeRef.current?.(selectedRows);
  }, [selectedKeys, selectedRows]);

  const toggleRow = useCallback(
    (key: string | number, row: T) => {
      const isCurrentlySelected = selectedKeys.has(key);
      if (!isCurrentlySelected && isRowSelectable && !isRowSelectable(row)) {
        return;
      }
      onRowSelect?.(row, !isCurrentlySelected);

      const nextKeys = new Set(selectedKeys);
      const nextCache = new Map(cachedRowsByKey);
      if (isCurrentlySelected) {
        nextKeys.delete(key);
        nextCache.delete(key);
      } else {
        nextKeys.add(key);
        nextCache.set(key, row);
      }

      setCachedRowsByKey(nextCache);
      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(nextKeys);
      }
      lastEmittedKeysRef.current = new Set(nextKeys);
      onSelectionChangeRef.current?.(
        buildSelectedRows(nextKeys, currentRowsByKey, nextCache, selectable),
      );
    },
    [
      cachedRowsByKey,
      controlledSelectedKeys,
      currentRowsByKey,
      isRowSelectable,
      onRowSelect,
      selectable,
      selectedKeys,
    ],
  );

  const togglePage = useCallback(() => {
    const nextKeys = new Set(selectedKeys);
    const nextCache = new Map(cachedRowsByKey);

    if (allPageSelected) {
      pageSelectableEntries.forEach(({ row, key }) => {
        if (nextKeys.has(key)) {
          nextKeys.delete(key);
          nextCache.delete(key);
          onRowSelect?.(row, false);
        }
      });
    } else {
      pageSelectableEntries.forEach(({ row, key }) => {
        nextCache.set(key, row);
        if (!nextKeys.has(key)) {
          nextKeys.add(key);
          onRowSelect?.(row, true);
        }
      });
    }

    setCachedRowsByKey(nextCache);
    if (controlledSelectedKeys === undefined) {
      setInternalSelectedKeys(nextKeys);
    }
    lastEmittedKeysRef.current = new Set(nextKeys);
    onSelectionChangeRef.current?.(
      buildSelectedRows(nextKeys, currentRowsByKey, nextCache, selectable),
    );
  }, [
    allPageSelected,
    cachedRowsByKey,
    controlledSelectedKeys,
    currentRowsByKey,
    onRowSelect,
    pageSelectableEntries,
    selectable,
    selectedKeys,
  ]);

  const clearSelection = useCallback(() => {
    if (onRowSelect) {
      selectedKeys.forEach((key) => {
        const row = currentRowsByKey.get(key) ?? cachedRowsByKey.get(key);
        if (row !== undefined) {
          onRowSelect(row, false);
        }
      });
    }
    const nextKeys = new Set<string | number>();
    setCachedRowsByKey((prev) => (prev.size === 0 ? prev : new Map()));
    if (controlledSelectedKeys === undefined) {
      setInternalSelectedKeys(nextKeys);
    }
    lastEmittedKeysRef.current = new Set(nextKeys);
    onSelectionChangeRef.current?.(EMPTY_ROWS as T[]);
  }, [cachedRowsByKey, controlledSelectedKeys, currentRowsByKey, onRowSelect, selectedKeys]);

  return {
    selectedKeys,
    selectedRows,
    allPageSelected,
    somePageSelected,
    toggleRow,
    togglePage,
    clearSelection,
  };
}
