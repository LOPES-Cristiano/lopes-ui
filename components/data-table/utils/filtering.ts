import type { FilterField } from '../DataTable.types';

export function matchesGlobal<T>(row: T, query: string): boolean {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  if (row && typeof row === 'object') {
    return Object.values(row as Record<string, unknown>).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        return String(val).toLowerCase().includes(q);
      }
      return false;
    });
  }
  return false;
}

export function matchesFilters<T>(
  row: T,
  filters: Record<string, string>,
  filterFields?: FilterField<T>[],
): boolean {
  const activeEntries = Object.entries(filters).filter(([, val]) => val !== undefined && val !== '');
  if (activeEntries.length === 0) return true;

  return activeEntries.every(([key, val]) => {
    const field = filterFields?.find((f) => f.key === key);

    // Se o campo tem predicado customizado, utiliza-o diretamente
    if (field?.predicate) {
      return field.predicate(row, val);
    }

    // Se o campo tem busca multi-chaves (searchKeys)
    if (field?.searchKeys && field.searchKeys.length > 0) {
      const valLower = val.toLowerCase().trim();
      return field.searchKeys.some((k) => {
        const rowVal = row && typeof row === 'object' ? (row as Record<string, unknown>)[k as string] : undefined;
        if (rowVal === undefined || rowVal === null) return false;
        return String(rowVal).toLowerCase().includes(valLower);
      });
    }

    const rowVal = row && typeof row === 'object' ? (row as Record<string, unknown>)[key] : undefined;
    if (rowVal === undefined || rowVal === null) return false;

    const op = field?.operator ?? (field?.type === 'select' || field?.type === 'boolean' || field?.type === 'segmented' || field?.type === 'badge' ? 'equals' : 'contains');
    const valLower = val.toLowerCase().trim();
    const rowStr = String(rowVal).toLowerCase().trim();

    switch (op) {
      case 'equals':
        return rowStr === valLower;
      case 'startsWith':
        return rowStr.startsWith(valLower);
      case 'gte': {
        const nRow = Number(rowVal);
        const nVal = Number(val);
        if (!isNaN(nRow) && !isNaN(nVal)) return nRow >= nVal;
        return rowStr >= valLower;
      }
      case 'lte': {
        const nRow = Number(rowVal);
        const nVal = Number(val);
        if (!isNaN(nRow) && !isNaN(nVal)) return nRow <= nVal;
        return rowStr <= valLower;
      }
      case 'contains':
      default:
        return rowStr.includes(valLower);
    }
  });
}
