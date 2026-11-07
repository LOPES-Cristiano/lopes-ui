'use client';

import { useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import type { FilterField } from './DataTable.types';

export function DataTableFilterDialog<T = Record<string, unknown>>({
  fields,
  values,
  onChange,
  onClose,
  onReset,
}: {
  fields: FilterField<T>[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onClose: () => void;
  onReset: () => void;
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-dialog-title"
      data-floating-open="true"
      className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <h4 id="filter-dialog-title" className="text-sm font-bold text-foreground">
              Filtrar Registros
            </h4>
          </div>
          <button
            data-component-id="erp.data-table.close-filter-dialog"
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
            aria-label="Fechar filtros"
          >
            <X size={18} />
          </button>
        </div>

        {/* Campos de Filtro */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto overscroll-contain">
          {fields.map((field) => {
            const currentVal = values[field.key] ?? '';
            const fieldLabel = field.label ?? field.key;
            const fieldId = `dt-filter-${field.key}`;

            return (
              <div key={field.key} className="space-y-1.5">
                <label htmlFor={fieldId} className="text-xs font-semibold text-foreground">
                  {fieldLabel}
                </label>
                {(field.type === 'select' ||
                  field.type === 'segmented' ||
                  field.type === 'badge') &&
                field.options ? (
                  <select
                    id={fieldId}
                    data-component-id={`erp.data-table.filter-select-${field.key}`}
                    value={currentVal}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                  >
                    <option value="">Todos</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'boolean' ? (
                  <select
                    id={fieldId}
                    data-component-id={`erp.data-table.filter-select-${field.key}`}
                    value={currentVal}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                  >
                    <option value="">Todos</option>
                    <option value="true">Sim / Ativo</option>
                    <option value="false">Não / Inativo</option>
                  </select>
                ) : (
                  <input
                    id={fieldId}
                    data-component-id={`erp.data-table.filter-input-${field.key}`}
                    type={
                      field.type === 'number'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : 'text'
                    }
                    value={currentVal}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={
                      field.placeholder ?? `Filtrar por ${fieldLabel.toLowerCase()}...`
                    }
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3">
          <button
            data-component-id="erp.data-table.reset-filter-dialog"
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded px-1.5 py-1 cursor-pointer transition-colors"
          >
            Limpar Filtros
          </button>
          <button
            data-component-id="erp.data-table.apply-filter-dialog"
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer shadow-xs"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
