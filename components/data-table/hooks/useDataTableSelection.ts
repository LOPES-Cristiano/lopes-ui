'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDataTableRowKey } from '../utils/row-key';

function setsEqual(a: Set<string | number> | null, b: Set<string | number>): boolean {
  if (!a || a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
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
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string | number>>(new Set());
  const rowCacheRef = useRef<Map<string | number, T>>(new Map());
  const lastEmittedKeysRef = useRef<Set<string | number> | null>(null);

  const selectedKeys = useMemo(() => {
    if (controlledSelectedKeys !== undefined) {
      return controlledSelectedKeys instanceof Set
        ? controlledSelectedKeys
        : new Set(controlledSelectedKeys);
    }
    return internalSelectedKeys;
  }, [controlledSelectedKeys, internalSelectedKeys]);

  const pageOffset = Math.max(0, (page - 1) * pageSize);

  const currentRowsByKey = useMemo(() => {
    const map = new Map<string | number, T>();
    pageRows.forEach((row, index) => {
      const key = getDataTableRowKey(row, index, rowKey, pageOffset);
      map.set(key, row);
      rowCacheRef.current.set(key, row);
    });
    if (!isServerData) {
      safeRows.forEach((row, index) => {
        const key = getDataTableRowKey(row, index, rowKey, 0);
        if (!map.has(key)) {
          map.set(key, row);
        }
        if (!rowCacheRef.current.has(key)) {
          rowCacheRef.current.set(key, row);
        }
      });
    }
    return map;
  }, [pageRows, safeRows, rowKey, pageOffset, isServerData]);

  const resolveRowsForKeys = useCallback(
    (keys: Set<string | number>): T[] => {
      if (!selectable || keys.size === 0) return [];
      const result: T[] = [];
      const included = new Set<string | number>();

      // Preserva linhas selecionadas de outras páginas (ex: paginação server-side)
      keys.forEach((key) => {
        if (!currentRowsByKey.has(key)) {
          const cached = rowCacheRef.current.get(key);
          if (cached !== undefined) {
            result.push(cached);
            included.add(key);
          }
        }
      });

      // Inclui linhas do conjunto atual na ordem original
      currentRowsByKey.forEach((row, key) => {
        if (keys.has(key) && !included.has(key)) {
          result.push(row);
          included.add(key);
        }
      });

      return result;
    },
    [selectable, currentRowsByKey],
  );

  const selectedRows = useMemo(
    () => resolveRowsForKeys(selectedKeys),
    [resolveRowsForKeys, selectedKeys],
  );

  const pageSelectableEntries = useMemo(() => {
    return pageRows
      .map((row, index) => ({
        row,
        key: getDataTableRowKey(row, index, rowKey, pageOffset),
      }))
      .filter(({ row }) => !isRowSelectable || isRowSelectable(row));
  }, [pageRows, rowKey, pageOffset, isRowSelectable]);

  const pageSelectableKeys = useMemo(
    () => pageSelectableEntries.map((entry) => entry.key),
    [pageSelectableEntries],
  );

  const selectedPageCount = pageSelectableKeys.filter((key) => selectedKeys.has(key)).length;
  const allPageSelected =
    pageSelectableKeys.length > 0 && selectedPageCount === pageSelectableKeys.length;
  const somePageSelected = selectedPageCount > 0 && !allPageSelected;

  // Sincroniza e descarta chaves selecionadas apenas quando todas as linhas estão carregadas localmente sem paginação
  useEffect(() => {
    if (controlledSelectedKeys !== undefined || !selectable) return;
    if (isServerData || pagination || page > 1) return;

    setInternalSelectedKeys((current) => {
      if (current.size === 0) return current;
      const validKeys = new Set(
        safeRows.map((row, index) => getDataTableRowKey(row, index, rowKey, 0))
      );
      let changed = false;
      const next = new Set<string | number>();
      current.forEach((k) => {
        if (validKeys.has(k)) {
          next.add(k);
        } else {
          changed = true;
          rowCacheRef.current.delete(k);
        }
      });
      return changed ? next : current;
    });
  }, [safeRows, rowKey, page, isServerData, pagination, selectable, controlledSelectedKeys]);

  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  const emitSelectionChange = useCallback(
    (nextKeys: Set<string | number>) => {
      lastEmittedKeysRef.current = new Set(nextKeys);
      onSelectionChangeRef.current?.(resolveRowsForKeys(nextKeys));
    },
    [resolveRowsForKeys],
  );

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
      rowCacheRef.current.set(key, row);
      onRowSelect?.(row, !isCurrentlySelected);

      const next = new Set(selectedKeys);
      if (isCurrentlySelected) {
        next.delete(key);
      } else {
        next.add(key);
      }

      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(next);
      }
      emitSelectionChange(next);
    },
    [controlledSelectedKeys, emitSelectionChange, isRowSelectable, onRowSelect, selectedKeys],
  );

  const togglePage = useCallback(() => {
    const next = new Set(selectedKeys);
    if (allPageSelected) {
      pageSelectableEntries.forEach(({ row, key }) => {
        if (next.has(key)) {
          next.delete(key);
          onRowSelect?.(row, false);
        }
      });
    } else {
      pageSelectableEntries.forEach(({ row, key }) => {
        rowCacheRef.current.set(key, row);
        if (!next.has(key)) {
          next.add(key);
          onRowSelect?.(row, true);
        }
      });
    }

    if (controlledSelectedKeys === undefined) {
      setInternalSelectedKeys(next);
    }
    emitSelectionChange(next);
  }, [
    allPageSelected,
    controlledSelectedKeys,
    emitSelectionChange,
    onRowSelect,
    pageSelectableEntries,
    selectedKeys,
  ]);

  const clearSelection = useCallback(() => {
    if (onRowSelect) {
      selectedKeys.forEach((key) => {
        const row = currentRowsByKey.get(key) ?? rowCacheRef.current.get(key);
        if (row !== undefined) {
          onRowSelect(row, false);
        }
      });
    }
    const next = new Set<string | number>();
    if (controlledSelectedKeys === undefined) {
      setInternalSelectedKeys(next);
    }
    emitSelectionChange(next);
  }, [controlledSelectedKeys, currentRowsByKey, emitSelectionChange, onRowSelect, selectedKeys]);

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
