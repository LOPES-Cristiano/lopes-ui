'use client';

import { useEffect } from 'react';
import { Eye, EyeOff, SlidersHorizontal, X } from 'lucide-react';
import type { DataTableColumn } from './DataTable.types';

export function DataTableColumnPanel<T = Record<string, unknown>>({
  columns,
  hidden,
  onToggle,
  onClose,
}: {
  columns: DataTableColumn<T>[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="col-panel-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-sm flex-col rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-primary" />
            <h4 id="col-panel-title" className="text-sm font-bold text-foreground">
              Visibilidade das Colunas
            </h4>
          </div>
          <button
            data-component-id="erp.data-table.close-columns"
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Fechar painel de colunas"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Colunas */}
        <div className="p-4 space-y-1.5 max-h-[60vh] overflow-y-auto">
          {columns.map((col) => {
            const isVisible = !hidden.has(col.key);
            const headerText = col.header ?? col.label ?? col.key;

            return (
              <button
                data-component-id={`erp.data-table.column-${col.key}`}
                key={col.key}
                type="button"
                role="checkbox"
                aria-checked={isVisible}
                onClick={() => onToggle(col.key)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isVisible
                    ? 'border-border bg-surface text-foreground hover:bg-muted/30'
                    : 'border-border/40 bg-muted/20 text-muted-foreground line-through'
                }`}
              >
                <span>{typeof headerText === 'string' ? headerText : col.key}</span>
                {isVisible ? (
                  <Eye size={15} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <EyeOff size={15} className="text-muted-foreground/60" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border bg-muted/10 px-5 py-3">
          <button
            data-component-id="erp.data-table.done-columns"
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
