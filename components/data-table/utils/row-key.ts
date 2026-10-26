export function getDataTableRowKey<T = Record<string, unknown>>(
  row: T,
  index: number,
  rowKeyFn?: (row: T, index?: number) => string | number | undefined,
  pageOffset: number = 0,
): string | number {
  if (rowKeyFn) {
    const key = rowKeyFn(row, index);
    if (key !== undefined && key !== null) return key;
  }

  if (row && typeof row === 'object') {
    const r = row as Record<string, unknown>;
    if (r.id !== undefined && r.id !== null) return String(r.id);
    if (r.codigo !== undefined && r.codigo !== null) return String(r.codigo);
    if (r.uuid !== undefined && r.uuid !== null) return String(r.uuid);
    if (r.key !== undefined && r.key !== null) return String(r.key);
  }

  return `row-p${pageOffset}-idx${index}`;
}
