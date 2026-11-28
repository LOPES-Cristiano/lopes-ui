'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { DataTableColumn, DataTableSize, SortDir } from './DataTable.types';

export function DataTableHeader<T = Record<string, unknown>>({
  columns,
  selectionEnabled,
  allPageSelected,
  somePageSelected,
  onTogglePageSelected,
  sortKey,
  sortDir,
  onSort,
  size = 'md',
  stickyHeader = false,
  hasActions = false,
  hasExpandable = false,
  expandColumnWidth,
  checkboxClassName,
  showLoadingBar = false,
}: {
  columns: DataTableColumn<T>[];
  selectionEnabled: boolean;
  allPageSelected: boolean;
  somePageSelected: boolean;
  onTogglePageSelected: () => void;
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
  size?: DataTableSize;
  stickyHeader?: boolean;
  hasActions?: boolean;
  hasExpandable?: boolean;
  expandColumnWidth?: string | number;
  checkboxClassName?: string;
  showLoadingBar?: boolean;
}) {
  const totalCols =
    columns.length + (selectionEnabled ? 1 : 0) + (hasExpandable ? 1 : 0) + (hasActions ? 1 : 0);
  const headerPaddingCls =
    size === 'sm' ? 'py-2 px-3 text-xs uppercase tracking-wider' : size === 'lg' ? 'py-3.5 px-4 text-sm uppercase tracking-wider' : 'py-3 px-3 text-xs uppercase tracking-wider';

  return (
    <thead
      className={twMerge(
        'border-b border-border text-muted-foreground font-semibold',
        stickyHeader ? 'sticky top-0 z-10 bg-surface shadow-[0_1px_0_0_var(--border)]' : 'bg-muted/40'
      )}
    >
      <tr>
        {hasExpandable && (
          <th
            scope="col"
            style={
              expandColumnWidth !== undefined
                ? { width: expandColumnWidth, minWidth: expandColumnWidth }
                : undefined
            }
            className={twMerge(
              expandColumnWidth === undefined && 'w-10',
              'text-center',
              headerPaddingCls
            )}
            aria-label="Expandir / Recolher"
          />
        )}

        {selectionEnabled && (
          <th scope="col" className={twMerge('w-10 text-center', headerPaddingCls)}>
            <input
              data-component-id="erp.data-table.select-all"
              type="checkbox"
              checked={allPageSelected}
              ref={(input) => {
                if (input) input.indeterminate = somePageSelected;
              }}
              onChange={onTogglePageSelected}
              className={twMerge(
                "h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shrink-0 cursor-pointer",
                checkboxClassName
              )}
              title="Selecionar todos os registros desta página"
            />
          </th>
        )}

        {columns.map((col) => {
          const isSorted = sortKey === col.key;
          const isSortable = col.sortable !== false;
          const alignCls = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right tabular-nums' : 'text-left';
          const headerContent = col.header ?? col.label;

          return (
            <th
              key={col.key}
              scope="col"
              style={col.width ? { width: col.width, maxWidth: col.width } : undefined}
              aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
              className={twMerge('font-bold select-none min-w-0', alignCls, headerPaddingCls, col.headerClassName)}
            >
              {isSortable ? (
                <button data-component-id={`erp.data-table.sort-${col.key}`} type="button" onClick={() => onSort(col.key)} className="inline-flex items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer">
                  <span className="uppercase">{headerContent}</span>
                  {isSorted ? (
                    sortDir === 'asc' ? (
                      <ArrowUp size={13} className="text-brand" />
                    ) : (
                      <ArrowDown size={13} className="text-brand" />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40 hover:opacity-100" />
                  )}
                </button>
              ) : (
                <span className="uppercase">{headerContent}</span>
              )}
            </th>
          );
        })}

        {hasActions && (
          <th scope="col" className={twMerge('text-right font-bold', headerPaddingCls)}>
            <span>Ações</span>
          </th>
        )}
      </tr>
      {showLoadingBar && (
        <tr aria-hidden="true" className="border-0">
          <th colSpan={totalCols} className="relative h-0 border-0 p-0">
            <div className="pointer-events-none absolute inset-x-0 -top-[2px] z-20 h-[2.5px] overflow-hidden bg-zinc-900/10 dark:bg-zinc-100/10">
              <div className="lopes-indeterminate-bar h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent dark:via-zinc-300" />
            </div>
          </th>
        </tr>
      )}
    </thead>
  );
}
