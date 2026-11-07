'use client';

import React, { useState } from 'react';
import { Minus, MoreVertical, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { DataTableAction, DataTableColumn } from './DataTable.types';
import ConfirmDialog from '../ConfirmDialog';
import { useEscKey } from '../Modal';

export type DataTableMobileCardProps<T = Record<string, unknown>> = {
  row: T;
  rowIndex: number;
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  onRowClick?: (row: T, index: number) => void;
  onActionError?: (error: unknown, actionName?: string) => void;
  hasExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (row: T) => void;
  expandedContent?: React.ReactNode;
};

const CODE_KEYS = new Set([
  'code',
  'id',
  'codigo',
  'numero',
  'chave',
  'protocolo',
  'sku',
  'referencia',
  'documento',
]);

const TITLE_KEYS = new Set([
  'title',
  'name',
  'nome',
  'label',
  'titulo',
  'descricao',
  'description',
  'nomeRazao',
  'razaoSocial',
  'fantasia',
  'nomeFantasia',
  'cliente',
  'fornecedor',
  'produto',
  'assunto',
]);

const STATUS_KEYS = new Set([
  'status',
  'situacao',
  'situacaoDescricao',
  'state',
  'etapa',
  'fase',
]);

export function DataTableMobileCard<T = Record<string, unknown>>({
  row,
  rowIndex,
  columns,
  actions,
  onRowClick,
  onActionError,
  hasExpandable = false,
  isExpanded = false,
  onToggleExpand,
  expandedContent,
}: DataTableMobileCardProps<T>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [runningActionIndex, setRunningActionIndex] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    action: DataTableAction<T>;
    index: number;
  } | null>(null);

  useEscKey(() => setMenuOpen(false), menuOpen);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = row as any;

  const resolveCellValue = (col: DataTableColumn<T>) =>
    col.getValue ? col.getValue(row) : col.accessor ? col.accessor(row) : r?.[col.key];

  const visibleColumns = columns.filter((c) => !c.hidden);

  // Prioriza mobileRole explícito, seguido pelas heurísticas genéricas e fallback para a primeira coluna visível
  const codeCol =
    visibleColumns.find((c) => c.mobileRole === 'code') ??
    visibleColumns.find((c) => !c.mobileRole && CODE_KEYS.has(c.key));
  const statusCol =
    visibleColumns.find((c) => c.mobileRole === 'status') ??
    visibleColumns.find((c) => !c.mobileRole && STATUS_KEYS.has(c.key));
  const titleCol =
    visibleColumns.find((c) => c.mobileRole === 'title') ??
    visibleColumns.find((c) => !c.mobileRole && TITLE_KEYS.has(c.key)) ??
    visibleColumns.find((c) => c !== codeCol && c !== statusCol) ??
    visibleColumns[0] ??
    columns[0];

  const rawTitle = titleCol ? resolveCellValue(titleCol) : 'Registro';
  const renderedTitle = titleCol?.render ? titleCol.render(rawTitle, row, rowIndex) : rawTitle;
  const titleStr =
    typeof rawTitle === 'string' || typeof rawTitle === 'number'
      ? String(rawTitle)
      : typeof renderedTitle === 'string' || typeof renderedTitle === 'number'
        ? String(renderedTitle)
        : String(r?.id ?? 'Registro');

  const visibleActions = actions?.filter((a) => !a.hidden?.(row)) ?? [];
  const isCustomRenderedTitle = Boolean(titleCol?.render && React.isValidElement(renderedTitle));
  const isStriped = rowIndex % 2 === 1;

  // Código a exibir no topo (se não for a coluna do título principal)
  const codeVal = codeCol && codeCol !== titleCol ? resolveCellValue(codeCol) : null;
  const codeRendered =
    codeCol && codeCol !== titleCol && codeCol.render
      ? codeCol.render(codeVal, row, rowIndex)
      : codeVal;

  // Status a exibir no canto (se não for a coluna do título principal)
  const statusVal = statusCol && statusCol !== titleCol ? resolveCellValue(statusCol) : null;
  const statusRendered =
    statusCol && statusCol !== titleCol && statusCol.render
      ? statusCol.render(statusVal, row, rowIndex)
      : statusVal;

  // Colunas secundárias para exibir metadados no card mobile
  const secondaryCols = visibleColumns.filter(
    (c) => c !== titleCol && c !== codeCol && c !== statusCol,
  );

  const executeAction = async (action: DataTableAction<T>, index: number) => {
    setRunningActionIndex(index);
    try {
      await action.onClick?.(row);
    } catch (err) {
      const actionLabel = typeof action.label === 'function' ? action.label(row) : action.label;
      onActionError?.(err, typeof actionLabel === 'string' ? actionLabel : undefined);
    } finally {
      setRunningActionIndex(null);
    }
  };

  const handleActionClick = (action: DataTableAction<T>, index: number) => {
    if (action.disabled?.(row)) return;
    const confirmConfig =
      typeof action.confirm === 'function' ? action.confirm(row) : action.confirm;
    if (confirmConfig) {
      setConfirmAction({ action, index });
      return;
    }
    void executeAction(action, index);
  };

  return (
    <div className="flex flex-col border-b border-border/70">
      <div
        onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
        className={twMerge(
          'relative flex flex-col gap-1.5 py-3 px-3.5 sm:px-4 transition-colors',
          onRowClick && 'cursor-pointer',
          isStriped ? 'bg-muted/25' : 'bg-surface',
          onRowClick && 'hover:bg-primary/5 active:bg-muted/50',
        )}
      >
        {/* Topo do Card: Código + Título Principal à esquerda | Menu de Ações à direita */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {hasExpandable && (
              <div className="shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                <button
                  data-component-id={`erp.data-table.mobile-card.expand-${rowIndex}`}
                  type="button"
                  onClick={() => onToggleExpand?.(row)}
                  className={twMerge(
                    'inline-flex items-center justify-center h-6 w-6 rounded-md border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    isExpanded
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                  )}
                  aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <Minus size={13} strokeWidth={2.5} />
                  ) : (
                    <Plus size={13} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            )}

            {codeRendered != null && codeRendered !== '' && (
              <div className="shrink-0 mt-0.5">
                {typeof codeRendered === 'string' || typeof codeRendered === 'number' ? (
                  <span className="font-mono text-[11px] font-bold tabular-nums text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded leading-none">
                    {codeRendered}
                  </span>
                ) : (
                  codeRendered
                )}
              </div>
            )}

            <div className="min-w-0 flex-1">
              {isCustomRenderedTitle ? (
                renderedTitle
              ) : (
                <div className="text-xs sm:text-[13px] font-bold text-foreground leading-snug truncate">
                  {titleStr}
                </div>
              )}
            </div>
          </div>

          {visibleActions.length > 0 && (
            <div className="relative shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                data-component-id="erp.data-table.mobile-card.menu"
                type="button"
                aria-label="Ações do registro"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[9190]"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    data-floating-open="true"
                    className="absolute right-0 top-full mt-1.5 z-[9200] min-w-44 rounded-2xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5"
                  >
                    {visibleActions.map((action, aIdx) => {
                      const Icon = action.getIcon ? action.getIcon(row) : action.icon;
                      const label =
                        typeof action.label === 'function' ? action.label(row) : action.label;

                      const customBtnClass =
                        typeof action.buttonClassName === 'function'
                          ? action.buttonClassName(row)
                          : action.buttonClassName;

                      const customIconClass =
                        typeof action.iconClassName === 'function'
                          ? action.iconClassName(row)
                          : action.iconClassName;

                      const isDisabled =
                        Boolean(action.disabled?.(row)) || runningActionIndex === aIdx;

                      return (
                        <button
                          data-component-id={
                            (typeof action.componentId === 'function'
                              ? action.componentId(row)
                              : action.componentId) ||
                            `erp.data-table.mobile-card.action-${aIdx}`
                          }
                          key={aIdx}
                          type="button"
                          role="menuitem"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            setMenuOpen(false);
                            handleActionClick(action, aIdx);
                          }}
                          className={twMerge(
                            'flex min-h-8 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                            isDisabled
                              ? 'opacity-40 cursor-not-allowed pointer-events-none'
                              : 'cursor-pointer',
                            !isDisabled &&
                              (action.danger
                                ? 'text-danger hover:bg-danger/10'
                                : 'text-foreground hover:bg-muted/60'),
                            customBtnClass,
                          )}
                        >
                          {Icon && (
                            <Icon
                              size={15}
                              className={twMerge(
                                'shrink-0',
                                action.danger ? 'text-danger' : 'text-muted-foreground',
                                customIconClass,
                              )}
                            />
                          )}
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Linha de Detalhes Secundários & Status */}
        {(secondaryCols.length > 0 || (statusRendered != null && statusRendered !== '')) && (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground min-w-0 flex-1">
              {secondaryCols.map((col, idx) => {
                const rawVal = resolveCellValue(col);
                const rendered = col.render ? col.render(rawVal, row, rowIndex) : rawVal;
                if (rendered == null || rendered === '' || typeof rendered === 'boolean')
                  return null;
                if (
                  typeof rendered === 'string' &&
                  (rendered.trim() === '-' || rendered.trim() === '—')
                )
                  return null;

                const colLabel = col.label || col.header;
                const isPrimitive = typeof rendered === 'string' || typeof rendered === 'number';

                return (
                  <div key={col.key || idx} className="flex items-center gap-1 min-w-0">
                    {isPrimitive && colLabel && typeof colLabel === 'string' && (
                      <span className="text-muted-foreground/75 font-normal">{colLabel}:</span>
                    )}
                    {isPrimitive ? (
                      <span className="font-medium text-foreground/90 truncate">{rendered}</span>
                    ) : (
                      rendered
                    )}
                  </div>
                );
              })}
            </div>

            {statusRendered != null && statusRendered !== '' && (
              <div className="shrink-0">
                {typeof statusRendered === 'string' || typeof statusRendered === 'number' ? (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50 leading-none">
                    {statusRendered}
                  </span>
                ) : (
                  statusRendered
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {hasExpandable && isExpanded && expandedContent && (
        <div className="border-t border-border/70 p-3 bg-muted/20 border-l-4 border-l-primary/70 animate-in fade-in-50 duration-200">
          {expandedContent}
        </div>
      )}

      {confirmAction &&
        (() => {
          const confirmProp = confirmAction.action.confirm;
          const confirmConfig =
            typeof confirmProp === 'function' ? confirmProp(row) : confirmProp;
          if (!confirmConfig) return null;
          return (
            <ConfirmDialog
              open={!!confirmAction}
              title={typeof confirmConfig.title === 'string' ? confirmConfig.title : undefined}
              description={
                typeof confirmConfig.description === 'string'
                  ? confirmConfig.description
                  : typeof confirmConfig.message === 'string'
                    ? confirmConfig.message
                    : undefined
              }
              confirmLabel={confirmConfig.confirmLabel ?? confirmConfig.confirmText ?? 'Confirmar'}
              cancelLabel={confirmConfig.cancelLabel ?? confirmConfig.cancelText ?? 'Cancelar'}
              variant={confirmAction.action.danger ? 'danger' : 'warning'}
              loading={runningActionIndex === confirmAction.index}
              onCancel={() => setConfirmAction(null)}
              onConfirm={async () => {
                const idx = confirmAction.index;
                const act = confirmAction.action;
                setConfirmAction(null);
                await executeAction(act, idx);
              }}
            />
          );
        })()}
    </div>
  );
}
