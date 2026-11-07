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
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  const visibleCount = columns.filter((c) => !hidden.has(c.key)).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="col-panel-title"
      data-floating-open="true"
      className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 overscroll-contain"
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
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
            aria-label="Fechar painel de colunas"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Colunas */}
        <div className="p-4 space-y-1.5 max-h-[60vh] overflow-y-auto overscroll-contain">
          {columns.map((col) => {
            const isVisible = !hidden.has(col.key);
            const isLastVisible = isVisible && visibleCount <= 1;
            const isDisabled = Boolean(col.required) || isLastVisible;
            const headerText = col.header ?? col.label ?? col.key;
            const labelText = typeof headerText === 'string' ? headerText : col.key;

            return (
              <button
                data-component-id={`erp.data-table.column-${col.key}`}
                key={col.key}
                type="button"
                role="checkbox"
                aria-checked={isVisible}
                aria-disabled={isDisabled || undefined}
                disabled={isDisabled}
                aria-label={
                  col.required
                    ? `${labelText} (coluna obrigatória)`
                    : isLastVisible
                      ? `${labelText} (pelo menos uma coluna deve permanecer visível)`
                      : undefined
                }
                onClick={() => {
                  if (!isDisabled) onToggle(col.key);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                  isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isVisible
                    ? 'border-border bg-surface text-foreground hover:bg-muted/30'
                    : 'border-border/40 bg-muted/20 text-muted-foreground line-through'
                }`}
              >
                <span>{labelText}</span>
                {isVisible ? (
                  <Eye size={15} className="text-success" />
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
            className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
