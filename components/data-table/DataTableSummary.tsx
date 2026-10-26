'use client';

import React from 'react';
import type { DataTableColumn, SummaryScope } from './DataTable.types';
import { computeSummary } from './utils/summary';

export function DataTableSummary<T = Record<string, unknown>>({
  columns,
  safeRows,
  filteredRows,
  pageRows,
  selectionEnabled,
  hasExpandable = false,
  summaryScope = 'filtered',
  summaryValues,
  hasActions = false,
}: {
  columns: DataTableColumn<T>[];
  safeRows: T[];
  filteredRows: T[];
  pageRows: T[];
  selectionEnabled?: boolean;
  hasExpandable?: boolean;
  summaryScope?: SummaryScope;
  summaryValues?: Record<string, React.ReactNode>;
  hasActions?: boolean;
}) {
  const rowsToSummarize =
    summaryScope === 'page' ? pageRows : summaryScope === 'server' ? safeRows : filteredRows;

  // Se não houver nenhuma linha de dados, não renderiza a linha de Total Geral
  if (!rowsToSummarize || rowsToSummarize.length === 0) {
    return null;
  }

  const columnSummaries = columns.map((col) => {
    if (summaryValues && col.key in summaryValues) {
      return summaryValues[col.key];
    }
    return computeSummary(col, rowsToSummarize);
  });

  const hasAnySummary = columnSummaries.some((val) => val !== null && val !== undefined);
  if (!hasAnySummary) return null;

  // Identifica a primeira coluna com sumário agregado/numérico (sum, avg, min, max, count)
  const isAggregateCol = (col: DataTableColumn<T>) =>
    typeof col.summary === 'string' && ['sum', 'avg', 'min', 'max', 'count'].includes(col.summary);

  const firstNumericIdx = columns.findIndex(
    (col, idx) =>
      columnSummaries[idx] !== null &&
      columnSummaries[idx] !== undefined &&
      (isAggregateCol(col) || (summaryValues && col.key in summaryValues))
  );

  // Se firstNumericIdx não for encontrado, usa o primeiro sumário não nulo
  const pivotIdx =
    firstNumericIdx >= 0
      ? firstNumericIdx
      : columnSummaries.findIndex((val) => val !== null && val !== undefined);

  // Verifica se alguma coluna anterior ao primeiro número já possui sumário explícito (ex: rótulo customizado)
  const hasExistingPrecedingLabel =
    pivotIdx > 0 &&
    columnSummaries.slice(0, pivotIdx).some((val) => val !== null && val !== undefined);

  // Determina onde colocar o label "Total Geral" automático (apenas se nenhuma coluna anterior já possuir sumário)
  let labelTargetIdx = -1;
  if (!hasExistingPrecedingLabel && pivotIdx > 0) {
    // 1. Tenta encontrar a última coluna de texto descritivo antes dos números
    let descIdx = -1;
    for (let i = pivotIdx - 1; i >= 0; i--) {
      if (/desc|nome|name|produto|item|cliente|vendedor|colaborador|fornecedor|title/i.test(columns[i].key)) {
        descIdx = i;
        break;
      }
    }

    if (descIdx >= 0) {
      labelTargetIdx = descIdx;
    } else {
      // 2. Tenta encontrar a última coluna não centralizada e que não seja muito estreita (evita badges de UN, status, etc.)
      let nonCenterIdx = -1;
      for (let i = pivotIdx - 1; i >= 0; i--) {
        const col = columns[i];
        if (col.align !== 'center' && (!col.width || Number(col.width) > 70)) {
          nonCenterIdx = i;
          break;
        }
      }
      labelTargetIdx = nonCenterIdx >= 0 ? nonCenterIdx : pivotIdx - 1;
    }
  }

  return (
    <tfoot className="border-t-2 border-border bg-muted/30 font-bold text-xs text-foreground">
      <tr>
        {hasExpandable && <td className="p-3 text-center"></td>}
        {selectionEnabled && <td className="p-3 text-center"></td>}
        {columns.map((col, idx) => {
          let summaryVal = columnSummaries[idx];

          // Se esta coluna não tem sumário, mas for a coluna imediatamente anterior ao primeiro número:
          if ((summaryVal === null || summaryVal === undefined) && idx === labelTargetIdx) {
            summaryVal = (
              <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                Total Geral
              </span>
            );
          }

          const alignCls =
            idx === labelTargetIdx
              ? col.align === 'center' ? 'text-center' : 'text-right sm:text-left'
              : col.align === 'center'
                ? 'text-center'
                : col.align === 'right'
                  ? 'text-right font-mono'
                  : 'text-left';

          return (
            <td key={col.key} className={`p-3 ${alignCls}`}>
              {summaryVal ?? ''}
            </td>
          );
        })}
        {hasActions && <td className="p-3 text-right"></td>}
      </tr>
    </tfoot>
  );
}
