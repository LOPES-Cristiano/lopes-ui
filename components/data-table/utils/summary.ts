import type React from 'react';
import type { DataTableColumn } from '../DataTable.types';
import { getRawColumnValue } from './sorting';

export function computeSummary<T>(col: DataTableColumn<T>, rows: T[]): React.ReactNode {
  if (!col.summary) return null;

  if (typeof col.summary === 'function') {
    return col.summary(rows);
  }

  if (col.summary === 'count') {
    const label = col.summaryLabel ?? '#';
    return `${label} ${rows.length}`;
  }

  const numericVals = rows
    .map((r) => Number(getRawColumnValue(r, col)))
    .filter((v) => !isNaN(v) && isFinite(v));

  if (numericVals.length === 0) return '-';

  let raw = 0;
  let symbol = '';

  switch (col.summary) {
    case 'sum':
      raw = numericVals.reduce((acc, v) => acc + v, 0);
      symbol = col.summaryLabel?.trim() || '';
      // Se o label for "Total", não prependemos no número para não quebrar a formatação monetária
      if (/^total(:)?$/i.test(symbol)) {
        symbol = '';
      }
      break;
    case 'avg':
      raw = numericVals.reduce((acc, v) => acc + v, 0) / numericVals.length;
      symbol = col.summaryLabel ?? 'x̄';
      break;
    case 'min':
      raw = Math.min(...numericVals);
      symbol = col.summaryLabel ?? 'min';
      break;
    case 'max':
      raw = Math.max(...numericVals);
      symbol = col.summaryLabel ?? 'max';
      break;
  }

  const formatted = col.summaryFormat ? col.summaryFormat(raw) : raw.toLocaleString('pt-BR');
  return symbol ? `${symbol} ${formatted}` : formatted;
}
