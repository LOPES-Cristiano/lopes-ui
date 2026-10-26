'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  type VisibilityState,
  type ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Download, Pin, PinOff, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import type { SpreadsheetColumn, SpreadsheetProps } from './Spreadsheet.types';
import SpreadsheetMultiSelect, { EMPTY_OPTION } from './SpreadsheetMultiSelect';

const ROW_NUM_WIDTH = 52;
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

const norm = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const isNumericType = (t?: string) => t === 'number' || t === 'currency' || t === 'integer' || t === 'percent';

function toDate(v: any): Date | null {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatValue(col: SpreadsheetColumn, value: any): string {
  if (value == null || value === '') return '';
  switch (col.type) {
    case 'currency':
      return typeof value === 'number' ? BRL.format(value) : String(value);
    case 'integer':
      return typeof value === 'number' ? INT.format(value) : String(value);
    case 'number':
      return typeof value === 'number' ? NUM.format(value) : String(value);
    case 'percent':
      return typeof value === 'number' ? `${NUM.format(value)}%` : String(value);
    case 'date': {
      const d = toDate(value);
      return d ? d.toLocaleDateString('pt-BR') : String(value);
    }
    default:
      return String(value);
  }
}

/** Filtro estilo planilha: ">10", "<=5", "=3", "10..20" para números; "contém" para texto. */
function matchFilter(col: SpreadsheetColumn, value: any, raw: string): boolean {
  const q = raw.trim();
  if (!q) return true;
  if (isNumericType(col.type)) {
    const n = typeof value === 'number' ? value : value == null || value === '' ? null : Number(value);
    const parse = (s: string) => Number(s.replace(',', '.'));
    const range = q.match(/^(-?[\d.,]+)\s*\.\.\s*(-?[\d.,]+)$/);
    if (range) return n != null && n >= parse(range[1]) && n <= parse(range[2]);
    const op = q.match(/^(>=|<=|>|<|=)\s*(-?[\d.,]+)$/);
    if (op) {
      if (n == null) return false;
      const t = parse(op[2]);
      return op[1] === '>' ? n > t : op[1] === '<' ? n < t : op[1] === '>=' ? n >= t : op[1] === '<=' ? n <= t : n === t;
    }
    if (q === '-' || q === 'vazio') return n == null;
    return norm(formatValue(col, value)).includes(norm(q)) || norm(value).includes(norm(q));
  }
  if (col.type === 'date') {
    return norm(formatValue(col, value)).includes(norm(q));
  }
  return norm(value).includes(norm(q));
}

function aggregate(col: SpreadsheetColumn, values: any[]): number | null {
  const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v)) as number[];
  switch (col.aggregate) {
    case 'count':
      return values.filter((v) => v != null && v !== '').length;
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
    case 'avg':
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    case 'min':
      return nums.length ? Math.min(...nums) : null;
    case 'max':
      return nums.length ? Math.max(...nums) : null;
    default:
      return null;
  }
}

function downloadCsv(name: string, header: string[], lines: string[][]) {
  const esc = (s: string) => (/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const csv = [header, ...lines].map((r) => r.map(esc).join(';')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Spreadsheet<T = any>({
  columns,
  rows,
  rowKey,
  title,
  description,
  loading,
  height = '100%',
  rowHeight = 24,
  showFooter = true,
  showRowNumbers = true,
  searchPlaceholder = 'Buscar em toda a planilha...',
  exportFileName = 'planilha',
  onCellEdit,
  rowClassName,
  contextMenu,
  onRowDoubleClick,
  toolbarSlot,
  className,
  componentId = 'erp.spreadsheet',
}: SpreadsheetProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    columns
      .filter((c) => c.defaultFilterValue !== undefined && c.defaultFilterValue !== '')
      .map((c) => ({ id: c.key, value: c.defaultFilterValue }))
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [edits, setEdits] = useState<Record<string, any>>({});
  const [editing, setEditing] = useState<{ rowId: string; colKey: string } | null>(null);
  const [draft, setDraft] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number; rowId: string; row: T } | null>(null);
  const [hover, setHover] = useState<{ rect: DOMRect; node: React.ReactNode; width: number } | null>(null);
  const hoverOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimers = () => {
    if (hoverOpenTimer.current) clearTimeout(hoverOpenTimer.current);
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
  };
  const scheduleHover = (el: HTMLElement, def: SpreadsheetColumn<T>, value: any, row: T) => {
    clearHoverTimers();
    hoverOpenTimer.current = setTimeout(() => {
      const node = def.hoverCard?.(row, value);
      if (!node) return;
      setHover({ rect: el.getBoundingClientRect(), node, width: def.hoverCardWidth ?? 380 });
    }, 350);
  };
  const scheduleHoverClose = () => {
    clearHoverTimers();
    hoverCloseTimer.current = setTimeout(() => setHover(null), 180);
  };
  useEffect(() => clearHoverTimers, []);

  // Toque longo na linha abre o menu de contexto (iOS não dispara contextmenu no long-press)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };
  const startPress = (e: React.TouchEvent, rowId: string, row: T) => {
    if (!contextMenu) return;
    cancelPress();
    const t = e.touches[0];
    const x = t.clientX;
    const y = t.clientY;
    pressTimer.current = setTimeout(() => {
      clearHoverTimers();
      setHover(null);
      setCtx({
        x: Math.max(8, Math.min(x, window.innerWidth - 232)),
        y: Math.max(8, Math.min(y, window.innerHeight - 40 * (contextMenu(row).length + 1))),
        rowId,
        row,
      });
    }, 550);
  };

  useEffect(() => {
    if (!ctx) return;
    const close = () => setCtx(null);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setCtx(null);
    window.addEventListener('click', close);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', esc);
    };
  }, [ctx]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    Object.fromEntries(columns.filter((c) => c.hidden).map((c) => [c.key, false]))
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(() => ({
    left: columns.filter((c) => c.pinned).map((c) => c.key),
  }));

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const colMap = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);

  const hasEdits = Object.keys(edits).length > 0;

  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.key,
        header: c.header,
        size: c.width ?? (isNumericType(c.type) ? 110 : c.type === 'date' ? 110 : 160),
        minSize: c.minWidth ?? 60,
        enableSorting: c.sortable !== false,
        sortUndefined: 'last',
        accessorFn: (row: T) => {
          if (hasEdits) {
            const id = rowKey(row, 0);
            const k = `${id}::${c.key}`;
            if (k in edits) {
              const ev = edits[k];
              return ev === '' || ev === null ? undefined : ev;
            }
          }
          const v = c.accessor ? c.accessor(row) : (row as any)[c.key];
          return v === '' || v === null ? undefined : v;
        },
        filterFn: ((row, id, value) => {
          if (Array.isArray(value)) {
            const v = row.getValue(id);
            if (v == null || v === '') return value.includes(EMPTY_OPTION);
            const key = norm(v);
            return value.some((o: string) => o !== EMPTY_OPTION && norm(o) === key);
          }
          return matchFilter(c, row.getValue(id), String(value ?? ''));
        }) as FilterFn<T>,
      })),
    [columns, edits, hasEdits, rowKey]
  );

  // Opções dos filtros multiselect: as informadas na coluna ou os valores distintos dos dados
  const multiOptions = useMemo(() => {
    const out = new Map<string, string[]>();
    for (const c of columns) {
      if (c.filterType !== 'multiselect') continue;
      if (c.filterOptions) {
        out.set(c.key, c.filterOptions);
        continue;
      }
      const set = new Set<string>();
      for (const r of rows) {
        const v = c.accessor ? c.accessor(r) : (r as any)[c.key];
        if (v != null && v !== '') set.add(String(v));
      }
      out.set(c.key, Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR')));
    }
    return out;
  }, [columns, rows]);

  const globalFilterFn = useCallback<FilterFn<T>>(
    (row, _id, value) => {
      const q = norm(value);
      if (!q) return true;
      return columns.some((c) => !isNumericType(c.type) && c.type !== 'date' && norm(row.getValue(c.key)).includes(q));
    },
    [columns]
  );

  const table = useReactTable({
    data: rows,
    columns: defs,
    getRowId: (row, i) => rowKey(row, i),
    state: { sorting, columnFilters, globalFilter, columnVisibility, columnPinning },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnPinning: true,
  });

  const tableRows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const leftCols = table.getLeftVisibleLeafColumns();
  const centerCols = table.getCenterVisibleLeafColumns();
  const visibleCols = [...leftCols, ...centerCols];
  const rowNumOffset = showRowNumbers ? ROW_NUM_WIDTH : 0;
  const totalWidth = rowNumOffset + visibleCols.reduce((s, c) => s + c.getSize(), 0);

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 14,
  });

  const stickyLeft = (colId: string, isPinned: boolean): React.CSSProperties | undefined => {
    if (!isPinned) return undefined;
    return { position: 'sticky', left: rowNumOffset + table.getColumn(colId)!.getStart('left'), zIndex: 2 };
  };

  const lastPinnedId = leftCols.length ? leftCols[leftCols.length - 1].id : null;

  const commitEdit = () => {
    if (!editing) return;
    const col = colMap.get(editing.colKey)!;
    const row = tableRows.find((r) => r.id === editing.rowId)?.original;
    if (row !== undefined) {
      let value: any = draft;
      if (col.parseEdit) value = col.parseEdit(draft, row);
      else if (isNumericType(col.type)) {
        const n = Number(draft.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
        value = draft.trim() === '' ? undefined : Number.isNaN(n) ? draft : n;
      }
      setEdits((e) => ({ ...e, [`${editing.rowId}::${editing.colKey}`]: value }));
      onCellEdit?.(row, editing.colKey, value);
    }
    setEditing(null);
  };

  const exportCsv = () => {
    const cols = visibleCols.map((c) => colMap.get(c.id)!);
    const lines = tableRows.map((r) => cols.map((c) => formatValue(c, r.getValue(c.key))));
    downloadCsv(exportFileName, cols.map((c) => c.header), lines);
  };

  const activeFilters = columnFilters.length + (globalFilter ? 1 : 0);
  const clearAll = () => {
    setColumnFilters([]);
    setGlobalFilter('');
  };

  const hasAggregates = columns.some((c) => c.aggregate && c.aggregate !== 'none');
  const filteredRows = table.getFilteredRowModel().rows;

  const footerAggregates = useMemo(() => {
    const out = new Map<string, string>();
    if (!showFooter || !hasAggregates) return out;
    for (const c of visibleCols) {
      const def = colMap.get(c.id)!;
      if (!def.aggregate || def.aggregate === 'none') continue;
      const agg = aggregate(
        def,
        filteredRows.map((r) => r.getValue(c.id))
      );
      if (agg != null) {
        const formatted =
          def.type === 'currency' || def.type === 'integer' || def.type === 'number' || def.type === 'percent'
            ? formatValue({ ...def, type: def.aggregate === 'count' ? 'integer' : def.type }, agg)
            : String(agg);
        out.set(c.id, formatted);
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFooter, hasAggregates, visibleCols.map((c) => c.id).join('|'), colMap, filteredRows, edits]);

  // Grupos de cabeçalho (ex.: "Saldo por filial") — só consecutivos e sem fixadas
  const groups = useMemo(() => {
    const out: { label: string; width: number; start: number }[] = [];
    let acc = rowNumOffset;
    for (const c of visibleCols) {
      const g = colMap.get(c.id)?.group ?? '';
      const w = c.getSize();
      const last = out[out.length - 1];
      if (last && last.label === g) last.width += w;
      else out.push({ label: g, width: w, start: acc });
      acc += w;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCols.map((c) => c.id + c.getSize()).join('|'), colMap, rowNumOffset]);
  const hasGroups = groups.some((g) => g.label);

  const cellBase = 'flex items-center shrink-0 px-2 text-xs border-r border-zinc-200/70 dark:border-zinc-800 overflow-hidden whitespace-nowrap';

  return (
    <div
      data-component-id={componentId}
      className={twMerge('flex flex-col min-h-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden', className)}
      style={{ height }}
    >
      {ctx &&
        contextMenu &&
        createPortal(
          <div
            role="menu"
            className="fixed z-[1000] w-56 max-w-[calc(100vw-16px)] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl p-1"
            style={{ left: ctx.x, top: ctx.y }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {contextMenu(ctx.row).map((item, i) => (
              <div key={i}>
                {item.separator && <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-700" />}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setCtx(null);
                    item.onClick();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {item.icon && <span className="shrink-0 text-zinc-500">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900">
        {(title || description) && (
          <div className="mr-2 min-w-0">
            {title && <div className="text-sm font-semibold text-foreground truncate">{title}</div>}
            {description && <div className="text-xs text-zinc-500 truncate">{description}</div>}
          </div>
        )}
        <div className="relative order-last sm:order-none basis-full sm:basis-auto flex-1 sm:min-w-[200px] sm:max-w-md">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            data-component-id={`${componentId}.search`}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-8 pr-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="button"
          data-component-id={`${componentId}.toggle-filters`}
          onClick={() => setShowFilters((v) => !v)}
          className={twMerge(
            'h-8 px-2.5 text-xs rounded-lg border inline-flex items-center gap-1.5 cursor-pointer transition-colors',
            showFilters ? 'border-primary/50 text-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
          )}
        >
          Filtros
        </button>
        {activeFilters > 0 && (
          <button type="button" onClick={clearAll} className="h-8 px-2 text-xs rounded-lg inline-flex items-center gap-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer">
            <X size={13} /> Limpar ({activeFilters})
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            data-component-id={`${componentId}.columns`}
            onClick={() => setMenuOpen((v) => !v)}
            className="h-8 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Columns3 size={14} /> <span className="hidden sm:inline">Colunas</span>
          </button>
          {menuOpen && (
            <div className="max-sm:fixed max-sm:inset-x-3 max-sm:top-32 sm:absolute sm:right-0 sm:top-9 z-30 sm:w-72 max-h-96 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-1.5">
              <div className="flex gap-1 px-1.5 pb-1.5 mb-1 border-b border-zinc-200 dark:border-zinc-800">
                <button type="button" className="text-[11px] text-primary cursor-pointer" onClick={() => table.toggleAllColumnsVisible(true)}>
                  Mostrar todas
                </button>
                <span className="text-zinc-300">·</span>
                <button type="button" className="text-[11px] text-primary cursor-pointer" onClick={() => table.toggleAllColumnsVisible(false)}>
                  Ocultar todas
                </button>
              </div>
              {table.getAllLeafColumns().map((c) => {
                const pinned = c.getIsPinned() === 'left';
                return (
                  <div key={c.id} className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <label className="flex items-center gap-2 flex-1 min-w-0 text-xs cursor-pointer">
                      <input type="checkbox" checked={c.getIsVisible()} onChange={c.getToggleVisibilityHandler()} className="h-3.5 w-3.5 rounded" />
                      <span className="truncate">{colMap.get(c.id)?.header}</span>
                    </label>
                    <button
                      type="button"
                      title={pinned ? 'Desafixar' : 'Fixar à esquerda'}
                      onClick={() => c.pin(pinned ? false : 'left')}
                      className={twMerge('cursor-pointer', pinned ? 'text-primary' : 'text-zinc-400 hover:text-zinc-700')}
                    >
                      {pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button
          type="button"
          data-component-id={`${componentId}.export`}
          onClick={exportCsv}
          className="h-8 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Download size={14} /> <span className="hidden sm:inline">CSV</span>
        </button>
        {toolbarSlot}
      </div>

      {/* Grade */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto relative">
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          {/* Cabeçalho */}
          <div className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700">
            {hasGroups && (
              <div className="relative h-6 border-b border-zinc-200 dark:border-zinc-700" style={{ width: totalWidth }}>
                {groups.map((g, i) =>
                  g.label ? (
                    <div
                      key={i}
                      className="absolute top-0 h-6 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-x border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                      style={{ left: g.start, width: g.width }}
                    >
                      {g.label}
                    </div>
                  ) : null
                )}
              </div>
            )}
            <div className="flex" style={{ width: totalWidth }}>
              {showRowNumbers && (
                <div className={twMerge(cellBase, 'justify-center h-8 text-zinc-400 bg-zinc-100 dark:bg-zinc-800')} style={{ width: ROW_NUM_WIDTH, position: 'sticky', left: 0, zIndex: 3 }}>
                  #
                </div>
              )}
              {visibleCols.map((c) => {
                const def = colMap.get(c.id)!;
                const sorted = c.getIsSorted();
                const pinned = c.getIsPinned() === 'left';
                const right = def.align ? def.align === 'right' : isNumericType(def.type);
                return (
                  <div
                    key={c.id}
                    className={twMerge(
                      cellBase,
                      'h-8 font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 select-none',
                      right ? 'justify-end' : def.align === 'center' ? 'justify-center' : 'justify-start',
                      pinned && c.id === lastPinnedId && 'shadow-[2px_0_0_0_rgba(0,0,0,0.08)]'
                    )}
                    style={{ width: c.getSize(), ...stickyLeft(c.id, pinned), zIndex: pinned ? 3 : undefined }}
                  >
                    <button
                      type="button"
                      disabled={!c.getCanSort()}
                      onClick={c.getToggleSortingHandler()}
                      title={def.header}
                      className="inline-flex items-center gap-1 min-w-0 cursor-pointer disabled:cursor-default hover:text-foreground"
                    >
                      <span className="truncate">{def.header}</span>
                      {c.getCanSort() &&
                        (sorted === 'asc' ? (
                          <ArrowUp size={12} className="text-primary shrink-0" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown size={12} className="text-primary shrink-0" />
                        ) : (
                          <ArrowUpDown size={11} className="opacity-30 shrink-0" />
                        ))}
                    </button>
                  </div>
                );
              })}
            </div>
            {showFilters && (
              <div className="flex bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700" style={{ width: totalWidth }}>
                {showRowNumbers && (
                  <div className={twMerge(cellBase, 'h-7 bg-white dark:bg-zinc-900')} style={{ width: ROW_NUM_WIDTH, position: 'sticky', left: 0, zIndex: 3 }} />
                )}
                {visibleCols.map((c) => {
                  const def = colMap.get(c.id)!;
                  const pinned = c.getIsPinned() === 'left';
                  return (
                    <div
                      key={c.id}
                      className={twMerge(cellBase, 'h-7 px-1 bg-white dark:bg-zinc-900')}
                      style={{ width: c.getSize(), ...stickyLeft(c.id, pinned), zIndex: pinned ? 3 : undefined }}
                    >
                      {def.filterable !== false && def.filterType === 'multiselect' && (
                        <SpreadsheetMultiSelect
                          componentId={`${componentId}.filter.${def.key}`}
                          options={multiOptions.get(def.key) ?? []}
                          value={c.getFilterValue() as string[] | undefined}
                          onChange={(v) => c.setFilterValue(v)}
                        />
                      )}
                      {def.filterable !== false && def.filterType !== 'multiselect' && (
                        <input
                          value={(c.getFilterValue() as string) ?? ''}
                          onChange={(e) => c.setFilterValue(e.target.value || undefined)}
                          placeholder={isNumericType(def.type) ? '>10, 5..20' : 'filtrar'}
                          className="w-full h-5 px-1.5 text-[11px] rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-primary/60 bg-transparent outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Corpo virtualizado */}
          {loading ? (
            <div className="p-10 text-center text-sm text-zinc-500">Carregando...</div>
          ) : tableRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500 sticky left-0">Nenhuma linha encontrada.</div>
          ) : (
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: totalWidth }}>
              {virtualizer.getVirtualItems().map((vi) => {
                const row = tableRows[vi.index];
                const extra = rowClassName?.(row.original);
                return (
                  <div
                    key={row.id}
                    onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row.original) : undefined}
                    onTouchStart={contextMenu ? (e) => startPress(e, row.id, row.original) : undefined}
                    onTouchMove={contextMenu ? cancelPress : undefined}
                    onTouchEnd={contextMenu ? cancelPress : undefined}
                    onTouchCancel={contextMenu ? cancelPress : undefined}
                    onContextMenu={
                      contextMenu
                        ? (e) => {
                            e.preventDefault();
                            clearHoverTimers();
                            setHover(null);
                            setCtx({
                              x: Math.min(e.clientX, window.innerWidth - 240),
                              y: Math.min(e.clientY, window.innerHeight - 40 * (contextMenu(row.original).length + 1)),
                              rowId: row.id,
                              row: row.original,
                            });
                          }
                        : undefined
                    }
                    className={twMerge(
                      'group absolute left-0 flex border-b border-zinc-100 dark:border-zinc-800/70 hover:bg-primary/[0.04]',
                      ctx?.rowId === row.id && 'bg-primary/10',
                      vi.index % 2 === 1 && 'bg-zinc-50/50 dark:bg-zinc-800/20',
                      extra
                    )}
                    style={{ top: 0, transform: `translateY(${vi.start}px)`, height: rowHeight, width: totalWidth }}
                  >
                    {showRowNumbers && (
                      <div
                        className={twMerge(cellBase, 'justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900 tabular-nums')}
                        style={{ width: ROW_NUM_WIDTH, position: 'sticky', left: 0, zIndex: 2 }}
                      >
                        {vi.index + 1}
                      </div>
                    )}
                    {visibleCols.map((c) => {
                      const def = colMap.get(c.id)!;
                      const value = row.getValue(c.id);
                      const pinned = c.getIsPinned() === 'left';
                      const right = def.align ? def.align === 'right' : isNumericType(def.type);
                      const isEditing = editing?.rowId === row.id && editing.colKey === c.id;
                      const cond = def.cellClassName?.(value, row.original);
                      return (
                        <div
                          key={c.id}
                          onMouseEnter={
                            def.hoverCard && !isEditing
                              ? (e) => scheduleHover(e.currentTarget, def, value, row.original)
                              : undefined
                          }
                          onMouseLeave={def.hoverCard ? scheduleHoverClose : undefined}
                          onDoubleClick={() => {
                            if (!def.editable) return;
                            setEditing({ rowId: row.id, colKey: c.id });
                            setDraft(value == null ? '' : String(value).replace('.', ','));
                          }}
                          title={typeof value === 'string' && value.length > 24 ? value : undefined}
                          className={twMerge(
                            cellBase,
                            'tabular-nums',
                            right ? 'justify-end' : def.align === 'center' ? 'justify-center' : 'justify-start',
                            pinned && 'bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800',
                            pinned && c.id === lastPinnedId && 'shadow-[2px_0_0_0_rgba(0,0,0,0.06)]',
                            def.editable && 'cursor-cell',
                            isEditing && 'p-0 ring-2 ring-primary ring-inset',
                            cond
                          )}
                          style={{ width: c.getSize(), ...stickyLeft(c.id, pinned) }}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit();
                                if (e.key === 'Escape') setEditing(null);
                              }}
                              className="w-full h-full px-2 text-xs bg-white dark:bg-zinc-900 outline-none"
                            />
                          ) : def.format ? (
                            def.format(value, row.original)
                          ) : (
                            <span className="truncate">{formatValue(def, value)}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rodapé de totais */}
          {showFooter && hasAggregates && (
            <div
              className="sticky bottom-0 z-10 flex bg-zinc-100 dark:bg-zinc-800 border-t-2 border-zinc-300 dark:border-zinc-600"
              style={{ width: totalWidth }}
            >
              {showRowNumbers && (
                <div className={twMerge(cellBase, 'h-8 bg-zinc-100 dark:bg-zinc-800')} style={{ width: ROW_NUM_WIDTH, position: 'sticky', left: 0, zIndex: 3 }} />
              )}
              {visibleCols.map((c) => {
                const def = colMap.get(c.id)!;
                const pinned = c.getIsPinned() === 'left';
                const right = def.align ? def.align === 'right' : isNumericType(def.type);
                const aggText = footerAggregates.get(c.id) ?? '';
                return (
                  <div
                    key={c.id}
                    className={twMerge(cellBase, 'h-8 font-bold bg-zinc-100 dark:bg-zinc-800 tabular-nums', right ? 'justify-end' : 'justify-start')}
                    style={{ width: c.getSize(), ...stickyLeft(c.id, pinned), zIndex: pinned ? 3 : undefined }}
                    title={def.aggregate && def.aggregate !== 'none' ? `${def.aggregate} (linhas filtradas)` : undefined}
                  >
                    {aggText}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {hover &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onMouseEnter={clearHoverTimers}
            onMouseLeave={scheduleHoverClose}
            className="fixed z-[99999] rounded-xl border border-border/80 bg-background/95 p-4 text-foreground shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
            style={{
              width: Math.min(hover.width, window.innerWidth - 32),
              maxWidth: 'calc(100vw - 32px)',
              left: Math.max(16, Math.min(hover.rect.left, window.innerWidth - Math.min(hover.width, window.innerWidth - 32) - 16)),
              ...(window.innerHeight - hover.rect.bottom < 360 && hover.rect.top > 360
                ? { bottom: window.innerHeight - hover.rect.top + 6 }
                : { top: hover.rect.bottom + 6 }),
            }}
          >
            {hover.node}
          </div>,
          document.body
        )}

      {/* Barra de status */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-3 py-1.5 text-[11px] text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900">
        <span>
          {INT.format(filteredCount)} de {INT.format(rows.length)} linhas
        </span>
        <span>
          {visibleCols.length} de {columns.length} colunas
          {onCellEdit && columns.some((c) => c.editable) ? ' · duplo clique edita células editáveis' : ''}
        </span>
      </div>
    </div>
  );
}

export { Spreadsheet };
