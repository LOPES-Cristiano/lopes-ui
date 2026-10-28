'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

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
  const [jumpValue, setJumpValue] = useState(String(page));
  const containerRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLDivElement>(null);
  const jumpInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRecord = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRows);

  useEffect(() => {
    setJumpValue(String(page));
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPageSizeOpen(false);
      }
      if (jumpRef.current && !jumpRef.current.contains(e.target as Node)) {
        setJumpOpen(false);
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
    if (!isNaN(num)) {
      handleNavigate(num);
    }
    setJumpOpen(false);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2.5 sm:px-4 py-2 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60 text-xs">
      {/* Lado Esquerdo: Info de limites de linha e registros */}
      <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-none">
        {loading ? (
          <span>Carregando...</span>
        ) : totalRows > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              Mostrando{' '}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                {startRecord.toLocaleString('pt-BR')}
              </strong>
              {' '}a{' '}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                {endRecord.toLocaleString('pt-BR')}
              </strong>
              {' '}de{' '}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                {totalRows.toLocaleString('pt-BR')}
              </strong>
              {' '}registros
            </span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">
              Página <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{page}</strong> de{' '}
              <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{totalPages}</strong>
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
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            title="Primeira página"
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
            className="flex h-7 items-center gap-1 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            title="Página anterior"
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
              onClick={() => {
                setJumpOpen((v) => !v);
                setTimeout(() => jumpInputRef.current?.select(), 50);
              }}
              className="px-2 text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded py-0.5 transition cursor-pointer"
              title="Clique para digitar o número da página"
            >
              {page} / {loading ? '...' : totalPages}
            </button>

            {jumpOpen && (
              <form
                onSubmit={handleJumpSubmit}
                className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 min-w-[140px]"
              >
                <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">Ir p/:</span>
                <input
                  data-component-id="erp.data-table.jump-input"
                  ref={jumpInputRef}
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  className="w-12 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-1 py-0.5 text-xs text-center font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  data-component-id="erp.data-table.jump-submit"
                  type="submit"
                  className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
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
            className="flex h-7 items-center gap-1 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            title="Próxima página"
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
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
            title="Última página"
            aria-label="Última página"
          >
            <ChevronsRight size={13} />
          </button>
        </div>

        {/* Seletor de Linhas */}
        {onPageSizeChange && (
          <div ref={containerRef} className="relative flex items-center gap-1 shrink-0 ml-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
            <button
              data-component-id="erp.data-table.page-size-toggle"
              type="button"
              onClick={() => setPageSizeOpen((v) => !v)}
              aria-expanded={pageSizeOpen}
              aria-haspopup="listbox"
              className="flex h-7 items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 text-[11.5px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs transition cursor-pointer select-none"
              title="Linhas por página"
            >
              <span>{pageSize} lin.</span>
              <ChevronDown size={11} className={twMerge('transition-transform duration-150', pageSizeOpen && 'rotate-180')} />
            </button>

            {pageSizeOpen && (
              <div
                role="listbox"
                className="absolute bottom-full mb-1 right-0 z-50 min-w-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                {pageSizeOptions.map((opt) => {
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
                        'flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs font-semibold transition-colors cursor-pointer select-none',
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check size={11} className="text-blue-600 dark:text-blue-400 shrink-0" />}
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
