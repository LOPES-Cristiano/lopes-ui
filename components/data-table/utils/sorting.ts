import type { DataTableColumn, SortDir } from '../DataTable.types';

export function getRawColumnValue<T>(row: T, col: DataTableColumn<T>): unknown {
  if (col.getValue) return col.getValue(row);
  if (col.accessor) return col.accessor(row);
  if (row && typeof row === 'object' && col.key in row) {
    return (row as Record<string, unknown>)[col.key];
  }
  return undefined;
}

export function resolveSortValue<T>(row: T, col: DataTableColumn<T> | undefined, key: string): unknown {
  if (col?.sortAccessor) return col.sortAccessor(row);
  if (col?.sortValue) return col.sortValue(row);
  if (col?.getValue) return col.getValue(row);
  if (col?.accessor) return col.accessor(row);
  if (row && typeof row === 'object' && key in row) {
    return (row as Record<string, unknown>)[key];
  }
  return undefined;
}

export function sortRows<T>(
  rows: T[],
  key: string,
  dir: SortDir,
  cols: DataTableColumn<T>[],
): T[] {
  if (!dir || !key) return rows;
  const col = cols.find((c) => c.key === key);

  return [...rows].sort((a, b) => {
    const valA = resolveSortValue(a, col, key);
    const valB = resolveSortValue(b, col, key);

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    let comp = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comp = valA - valB;
    } else if (valA instanceof Date && valB instanceof Date) {
      comp = valA.getTime() - valB.getTime();
    } else {
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      comp = strA.localeCompare(strB, 'pt-BR', { numeric: true, sensitivity: 'base' });
    }

    return dir === 'asc' ? comp : -comp;
  });
}
