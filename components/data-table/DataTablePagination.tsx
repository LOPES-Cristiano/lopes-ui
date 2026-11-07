'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useEscKey } from '../Modal';

export function DataTablePagination({
  page,
  pageSize,
  totalRows,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  loading = false,
}: {
  page: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isServerPagination?: boolean;
  loading?: boolean;
}) {
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpDraft, setJumpDraft] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLDivElement>(null);
  const jumpInputRef = useRef<HTMLInputElement>(null);

  const resolvedOptions = useMemo(() => {
    const set = new Set<number>(pageSizeOptions);
    if (pageSize > 0) set.add(pageSize);
    return Array.from(set).sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRecord = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRows);
  const jumpValue = jumpDraft ?? String(page);

  useEscKey(
    () => {
      setPageSizeOpen(false);
      setJumpOpen(false);
      setJumpDraft(null);
    },
    pageSizeOpen || jumpOpen,
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPageSizeOpen(false);
      }
      if (jumpRef.current && !jumpRef.current.contains(e.target as Node)) {
        setJumpOpen(false);
        setJumpDraft(null);
      }
    };
    if (pageSizeOpen || jumpOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pageSizeOpen, jumpOpen]);

  function handleNavigate(targetPage: number) {
    const safeTarget = Math.max(1, Math.min(targetPage, totalPages));
    if (safeTarget !== page) {
      onPageChange(safeTarget);
      if (typeof window !== 'undefined') {
        const tableContainer =
          document.querySelector('[data-component-id="data-table"]') ||
          document.querySelector('main') ||
          document.querySelector('.space-y-2\\.5');
        if (tableContainer) {
          tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }

  function handleJumpSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (!Number.isNaN(num)) {
      handleNavigate(num);
    }
    setJumpOpen(false);
    setJumpDraft(null);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2.5 sm:px-4 py-2 border-t border-border/80 bg-muted/20 text-xs tabular-nums">
      {/* Lado Esquerdo: Info de limites de linha e registros */}
      <div className="text-[11.5px] text-muted-foreground leading-none">
        {loading ? (
          <span>Carregando...</span>
        ) : totalRows > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              Mostrando{' '}
              <strong className="font-semibold text-foreground">
                {startRecord.toLocaleString('pt-BR')}
              </strong>{' '}
              a{' '}
              <strong className="font-semibold text-foreground">
                {endRecord.toLocaleString('pt-BR')}
              </strong>{' '}
              de{' '}
              <strong className="font-semibold text-foreground">
                {totalRows.toLocaleString('pt-BR')}
              </strong>{' '}
              registros
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="hidden sm:inline text-muted-foreground">
              Página <strong className="font-semibold text-foreground">{page}</strong> de{' '}
              <strong className="font-semibold text-foreground">{totalPages}</strong>
            </span>
          </div>
        ) : (
          <span>0 registros</span>
        )}
      </div>

      {/* Lado Direito: Controles de Paginação */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          {/* Primeira Página */}
          <button
            data-component-id="erp.data-table.page-first"
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => handleNavigate(1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-foreground/80 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            aria-label="Primeira página"
          >
            <ChevronsLeft size={13} />
          </button>

          {/* Página Anterior */}
          <button
            data-component-id="erp.data-table.page-prev"
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => handleNavigate(page - 1)}
            className="flex h-7 items-center gap-1 px-2 rounded-md border border-border bg-surface text-[11.5px] font-semibold text-foreground/80 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            aria-label="Página anterior"
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Indicador e Salto de Página */}
          <div ref={jumpRef} className="relative">
            <button
              data-component-id="erp.data-table.jump-open"
              type="button"
              aria-label={`Ir para página. Página atual ${page} de ${totalPages}`}
              aria-expanded={jumpOpen}
              onClick={() => {
                setJumpOpen((v) => {
                  const next = !v;
                  setJumpDraft(next ? String(page) : null);
                  if (next) {
                    setTimeout(() => jumpInputRef.current?.select(), 50);
                  }
                  return next;
                });
              }}
              className="min-h-6 px-2 text-[11.5px] font-bold text-foreground hover:bg-muted/60 rounded py-0.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {page} / {loading ? '...' : totalPages}
            </button>

            {jumpOpen && (
              <form
                onSubmit={handleJumpSubmit}
                data-floating-open="true"
                className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-[9200] flex items-center gap-1.5 rounded-xl border border-border bg-popover p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 min-w-[144px]"
              >
                <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                  Ir p/:
                </span>
                <input
                  data-component-id="erp.data-table.jump-input"
                  ref={jumpInputRef}
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpValue}
                  onChange={(e) => setJumpDraft(e.target.value)}
                  aria-label="Número da página"
                  className="w-12 rounded-md border border-border bg-muted/30 px-1 py-0.5 text-xs text-center font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                <button
                  data-component-id="erp.data-table.jump-submit"
                  type="submit"
                  className="min-h-6 px-2 py-0.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  Ir
                </button>
              </form>
            )}
          </div>

          {/* Próxima Página */}
          <button
            data-component-id="erp.data-table.page-next"
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => handleNavigate(page + 1)}
            className="flex h-7 items-center gap-1 px-2 rounded-md border border-border bg-surface text-[11.5px] font-semibold text-foreground/80 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            aria-label="Próxima página"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight size={13} />
          </button>

          {/* Última Página */}
          <button
            data-component-id="erp.data-table.page-last"
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => handleNavigate(totalPages)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-foreground/80 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            aria-label="Última página"
          >
            <ChevronsRight size={13} />
          </button>
        </div>

        {/* Seletor de Linhas */}
        {onPageSizeChange && (
          <div
            ref={containerRef}
            className="relative flex items-center gap-1 shrink-0 ml-1 border-l border-border pl-2"
          >
            <button
              data-component-id="erp.data-table.page-size-toggle"
              type="button"
              onClick={() => setPageSizeOpen((v) => !v)}
              aria-expanded={pageSizeOpen}
              aria-haspopup="listbox"
              aria-label={`Linhas por página: ${pageSize}`}
              className="flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11.5px] font-semibold text-foreground/85 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shadow-2xs transition cursor-pointer select-none"
            >
              <span>{pageSize} lin.</span>
              <ChevronDown
                size={11}
                className={twMerge(
                  'transition-transform duration-150',
                  pageSizeOpen && 'rotate-180',
                )}
              />
            </button>

            {pageSizeOpen && (
              <div
                role="listbox"
                aria-label="Linhas por página"
                data-floating-open="true"
                className="absolute bottom-full mb-1 right-0 z-[9200] min-w-16 rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                {resolvedOptions.map((opt) => {
                  const isSelected = opt === pageSize;
                  return (
                    <button
                      data-component-id={`erp.data-table.page-size-${opt}`}
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onPageSizeChange(opt);
                        setPageSizeOpen(false);
                      }}
                      className={twMerge(
                        'flex min-h-7 w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs font-semibold transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground/85 hover:bg-muted/60 hover:text-foreground',
                      )}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check size={11} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
