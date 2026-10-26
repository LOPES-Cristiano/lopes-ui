'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDataTableRowKey } from '../utils/row-key';

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
}) {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string | number>>(new Set());

  const selectedKeys = useMemo(() => {
    if (controlledSelectedKeys !== undefined) {
      return controlledSelectedKeys instanceof Set
        ? controlledSelectedKeys
        : new Set(controlledSelectedKeys);
    }
    return internalSelectedKeys;
  }, [controlledSelectedKeys, internalSelectedKeys]);

  const pageOffset = Math.max(0, (page - 1) * pageSize);

  const selectedRows = useMemo(() => {
    if (!selectable) return [];
    return safeRows.filter((row, index) => {
      const key = getDataTableRowKey(row, index, rowKey, pageOffset);
      return selectedKeys.has(key);
    });
  }, [safeRows, selectedKeys, rowKey, pageOffset, selectable]);

  const pageSelectableRows = useMemo(() => {
    return pageRows.filter((row) => isRowSelectable?.(row) ?? true);
  }, [isRowSelectable, pageRows]);

  const pageSelectableKeys = useMemo(() => {
    return pageSelectableRows.map((row, index) => getDataTableRowKey(row, index, rowKey, pageOffset));
  }, [pageSelectableRows, rowKey, pageOffset]);

  const selectedPageCount = pageSelectableKeys.filter((key) => selectedKeys.has(key)).length;
  const allPageSelected =
    pageSelectableKeys.length > 0 && selectedPageCount === pageSelectableKeys.length;
  const somePageSelected = selectedPageCount > 0 && !allPageSelected;

  // Sincroniza e descarta chaves selecionadas que foram removidas das linhas
  useEffect(() => {
    if (controlledSelectedKeys !== undefined || !selectable) return;
    setInternalSelectedKeys((current) => {
      if (current.size === 0) return current;
      const validKeys = new Set(
        safeRows.map((row, index) => getDataTableRowKey(row, index, rowKey, pageOffset))
      );
      let changed = false;
      const next = new Set<string | number>();
      current.forEach((k) => {
        if (validKeys.has(k)) {
          next.add(k);
        } else {
          changed = true;
        }
      });
      return changed ? next : current;
    });
  }, [safeRows, rowKey, pageOffset, selectable, controlledSelectedKeys]);

  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    onSelectionChangeRef.current?.(selectedRows);
  }, [selectedRows]);

  const toggleRow = useCallback(
    (key: string | number, row: T) => {
      const isCurrentlySelected = selectedKeys.has(key);
      if (!isCurrentlySelected && isRowSelectable && !isRowSelectable(row)) {
        return;
      }
      onRowSelect?.(row, !isCurrentlySelected);

      setInternalSelectedKeys((current) => {
        const next = new Set(current);
        if (isCurrentlySelected) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [isRowSelectable, onRowSelect, selectedKeys],
  );

  const togglePage = useCallback(() => {
    setInternalSelectedKeys((current) => {
      const next = new Set(current);
      if (allPageSelected) {
        pageSelectableKeys.forEach((key) => next.delete(key));
      } else {
        pageSelectableKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  }, [allPageSelected, pageSelectableKeys]);

  const clearSelection = useCallback(() => {
    setInternalSelectedKeys(new Set());
  }, []);

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
