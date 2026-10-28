'use client';

import { useEffect } from 'react';
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  ArrowUpAZ,
  ArrowUpDown,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { DataTableColumn, SortDir } from './DataTable.types';

export type DataTableMobileSortDialogProps<T = Record<string, unknown>> = {
  columns: DataTableColumn<T>[];
  sortKey: string | null;
  sortDir: SortDir;
  onSortChange: (key: string | null, dir: SortDir) => void;
  onClose: () => void;
};

function getColumnTitle<T>(col: DataTableColumn<T>): string {
  if (typeof col.label === 'string' && col.label.trim()) return col.label;
  if (typeof col.header === 'string' && col.header.trim()) return col.header;
  return col.key;
}

export function DataTableMobileSortDialog<T = Record<string, unknown>>({
  columns,
  sortKey,
  sortDir,
  onSortChange,
  onClose,
}: DataTableMobileSortDialogProps<T>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Apenas colunas que permitem ordenação
  const sortableColumns = columns.filter((c) => c.sortable !== false);

  const handleSelectColumn = (key: string) => {
    if (sortKey === key) {
      // Alterna direção ou limpa
      if (sortDir === 'asc') {
        onSortChange(key, 'desc');
      } else if (sortDir === 'desc') {
        onSortChange(null, null);
      } else {
        onSortChange(key, 'asc');
      }
    } else {
      // Nova coluna selecionada, default asc
      onSortChange(key, 'asc');
    }
  };

  const handleSetDirection = (dir: 'asc' | 'desc') => {
    if (!sortKey) {
      // Se nenhuma coluna selecionada, seleciona a primeira ordenável
      const firstKey = sortableColumns[0]?.key;
      if (firstKey) {
        onSortChange(firstKey, dir);
      }
    } else {
      onSortChange(sortKey, dir);
    }
  };

  const handleClear = () => {
    onSortChange(null, null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-sort-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-md max-h-[85vh] flex-col rounded-t-3xl sm:rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Barra superior de arraste no mobile */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowUpDown size={16} />
            </div>
            <div>
              <h4 id="mobile-sort-title" className="text-sm font-bold text-foreground leading-none">
                Ordenar Registros
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Escolha a coluna e a ordem desejada
              </p>
            </div>
          </div>
          <button
            data-component-id="erp.data-table.mobile-sort.close"
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            aria-label="Fechar ordenação"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com Direção e Lista de Colunas */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Seletor de Direção da Ordenação */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Direção da Ordenação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                data-component-id="erp.data-table.mobile-sort.asc"
                type="button"
                onClick={() => handleSetDirection('asc')}
                className={twMerge(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                  sortDir === 'asc'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border/80 bg-surface text-foreground hover:bg-muted/40'
                )}
              >
                <ArrowUpAZ size={16} className={sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground'} />
                <span>Crescente (A-Z, 1-9)</span>
              </button>

              <button
                data-component-id="erp.data-table.mobile-sort.desc"
                type="button"
                onClick={() => handleSetDirection('desc')}
                className={twMerge(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                  sortDir === 'desc'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border/80 bg-surface text-foreground hover:bg-muted/40'
                )}
              >
                <ArrowDownAZ size={16} className={sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground'} />
                <span>Decrescente (Z-A, 9-1)</span>
              </button>
            </div>
          </div>

          {/* Lista de Colunas Ordenáveis */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Selecione a Coluna ({sortableColumns.length})
            </label>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              {sortableColumns.map((col) => {
                const isSelected = sortKey === col.key;
                const title = getColumnTitle(col);

                return (
                  <button
                    data-component-id={`erp.data-table.mobile-sort.col-${col.key}`}
                    key={col.key}
                    type="button"
                    onClick={() => handleSelectColumn(col.key)}
                    className={twMerge(
                      'w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary/60 bg-primary/10 text-primary font-bold shadow-2xs'
                        : 'border-border/80 bg-surface text-foreground hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={twMerge(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10px]',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/80 bg-muted/30 text-muted-foreground'
                        )}
                      >
                        {isSelected ? <Check size={12} strokeWidth={3} /> : <span className="text-[9px]">•</span>}
                      </div>
                      <span className="truncate">{title}</span>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-primary shrink-0">
                        {sortDir === 'asc' ? (
                          <>
                            <span>A → Z</span>
                            <ArrowUp size={13} />
                          </>
                        ) : sortDir === 'desc' ? (
                          <>
                            <span>Z → A</span>
                            <ArrowDown size={13} />
                          </>
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3.5">
          <button
            data-component-id="erp.data-table.mobile-sort.clear"
            type="button"
            onClick={handleClear}
            disabled={!sortKey}
            className={twMerge(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer',
              sortKey
                ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                : 'text-muted-foreground/40 cursor-not-allowed'
            )}
          >
            <RotateCcw size={13} />
            <span>Limpar</span>
          </button>

          <button
            data-component-id="erp.data-table.mobile-sort.done"
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
