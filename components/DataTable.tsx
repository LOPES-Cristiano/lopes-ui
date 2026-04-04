"use client";

import React, {
  useState, useMemo, useRef, useEffect, useCallback, createContext,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Filter, X, Search, MoreHorizontal,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  EyeOff, Eye, SlidersHorizontal, type LucideIcon,
} from "lucide-react";
import type { TableSize, TableVariant } from "./Table";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import TextField from "./form/TextField";
import NumberField from "./form/NumberField";
import DateField from "./form/DateField";
import AutocompleteField, { type AutocompleteOption } from "./form/AutocompleteField";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc" | null;

export type DataTableColumn<T = Record<string, unknown>> = {
  key: string;
  label: React.ReactNode;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Value used for sorting / summary when render is provided */
  getValue?: (row: T) => number | string;
  align?: "left" | "center" | "right";
  width?: string;
  /** Allow this column to be sorted */
  sortable?: boolean;
  /** Hide column by default */
  hidden?: boolean;
  /** Column cannot be toggled off */
  required?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  /** Summary aggregation for this column */
  summary?: "sum" | "avg" | "min" | "max" | "count" | ((rows: T[]) => React.ReactNode);
};

export type DataTableAction<T = Record<string, unknown>> = {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  danger?: boolean;
  divider?: boolean;
  /** Show this action as an always-visible icon button directly in the row instead of inside the ⋯ menu */
  inline?: boolean;
};

export type FilterField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "boolean";
  options?: { label: string; value: string }[];
  placeholder?: string;
};

export type DataTableTab<T = Record<string, unknown>> = {
  /** Label shown on the tab button */
  label: string;
  /** Arbitrary filter function — omit to show all rows */
  filter?: (row: T) => boolean;
  /** Shorthand: filter rows where row[field] === value */
  field?: string;
  value?: unknown;
  /** Show the count of matching rows as a badge */
  showCount?: boolean;
};

export type DataTableProps<T = Record<string, unknown>> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;

  // Appearance
  variant?: TableVariant;
  size?: TableSize;
  stickyHeader?: boolean;
  dividers?: boolean;
  hoverable?: boolean;

  // Features
  /** Row-level actions. When the actions column is too narrow to show all, overflow → context menu */
  actions?: DataTableAction<T>[];
  /** "menu" = hidden ⋯ button per row (default). "inline" = always-visible icon buttons in each row */
  actionsDisplay?: "menu" | "inline";
  /** Column visibility toggle via settings panel */
  columnToggle?: boolean;
  /** Global search across all string/number values */
  globalSearch?: boolean;
  /** Filter dialog fields */
  filterFields?: FilterField[];
  /** Tab bar to filter rows by predefined categories */
  tabs?: DataTableTab<T>[];
  /** Summary row at the bottom */
  showSummary?: boolean;
  /** Pagination */
  pagination?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;

  // Toolbar
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbarSlot?: React.ReactNode;

  emptySlot?: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
  componentId?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_TH: Record<TableSize, string> = {
  xs: "px-3 py-1.5 text-[11px]",
  sm: "px-3 py-2   text-xs",
  md: "px-4 py-3   text-xs",
  lg: "px-5 py-4   text-sm",
};
const SIZE_TD: Record<TableSize, string> = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-3 py-2   text-sm",
  md: "px-4 py-3   text-sm",
  lg: "px-5 py-4   text-base",
};
const ALIGN: Record<string, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

function getRaw<T>(row: T, col: DataTableColumn<T>): unknown {
  if (col.getValue) return col.getValue(row);
  return (row as Record<string, unknown>)[col.key];
}

function sortRows<T>(rows: T[], key: string, dir: SortDir, cols: DataTableColumn<T>[]): T[] {
  if (!dir) return rows;
  const col = cols.find((c) => c.key === key);
  return [...rows].sort((a, b) => {
    const av = col ? getRaw(a, col) : (a as Record<string, unknown>)[key];
    const bv = col ? getRaw(b, col) : (b as Record<string, unknown>)[key];
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
    return dir === "asc" ? cmp : -cmp;
  });
}

function matchesGlobal<T>(row: T, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return Object.values(row as Record<string, unknown>).some(
    (v) => v != null && String(v).toLowerCase().includes(lower),
  );
}

function matchesFilters<T>(row: T, filters: Record<string, string>): boolean {
  for (const [key, val] of Object.entries(filters)) {
    if (!val) continue;
    const rowVal = String((row as Record<string, unknown>)[key] ?? "").toLowerCase();
    if (!rowVal.includes(val.toLowerCase())) return false;
  }
  return true;
}

function getTabFilter<T>(tab: DataTableTab<T>): ((row: T) => boolean) | undefined {
  if (tab.filter) return tab.filter;
  if (tab.field !== undefined) {
    return (row: T) => (row as Record<string, unknown>)[tab.field!] === tab.value;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Row Action Menu (portal)
// ─────────────────────────────────────────────────────────────────────────────

type ActionMenuCtx = { close: () => void };
const ActionMenuContext = createContext<ActionMenuCtx>({ close: () => {} });

function ActionMenu<T>({
  row,
  actions,
  anchorRef,
  onClose,
}: {
  row: T;
  actions: DataTableAction<T>[];
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuH = actions.length * 36 + 16;
      const menuW = 192;
      const top = rect.bottom + window.scrollY + 4;
      const left = Math.min(
        rect.left + window.scrollX,
        window.innerWidth - menuW - 8,
      );
      const clampedTop =
        rect.bottom + menuH > window.innerHeight
          ? rect.top + window.scrollY - menuH - 4
          : top;
      setPos({ top: clampedTop, left });
    }
  }, [anchorRef, actions.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onClickOut(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClickOut);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOut);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <ActionMenuContext.Provider value={{ close: onClose }}>
      <div
        ref={menuRef}
        style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
        className="min-w-48 rounded-xl border border-zinc-200 bg-white shadow-lg py-1.5 outline-none"
      >
        {actions.map((action, i) => {
          const Icon = action.icon;
          const isDisabled = action.disabled?.(row) ?? false;
          return (
            <React.Fragment key={i}>
              {action.divider && i > 0 && <div className="my-1 border-t border-zinc-100" />}
              <button
                disabled={isDisabled}
                onClick={() => { action.onClick(row); onClose(); }}
                className={twMerge(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  action.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-zinc-700 hover:bg-zinc-50",
                )}
              >
                {Icon && <Icon size={14} className="shrink-0" />}
                {action.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </ActionMenuContext.Provider>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Dialog (portal)
// ─────────────────────────────────────────────────────────────────────────────

function FilterDialog({
  fields,
  values,
  onChange,
  onClose,
  onReset,
}: {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useBodyScrollLock(true);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  const activeCount = Object.values(values).filter(Boolean).length;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Filtros</p>
            {activeCount > 0 && (
              <p className="text-xs text-zinc-400 mt-0.5">{activeCount} filtro{activeCount > 1 ? "s" : ""} ativo{activeCount > 1 ? "s" : ""}</p>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-lg hover:bg-zinc-100">
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => {
            const rawVal = values[field.key] ?? "";

            if (field.type === "select" || field.type === "boolean") {
              const opts: AutocompleteOption[] =
                field.type === "boolean"
                  ? [{ value: "true", label: "Sim" }, { value: "false", label: "Não" }]
                  : (field.options ?? []);
              // Derive display label from stored value
              const displayVal = opts.find((o) => o.value === rawVal)?.label ?? "";
              return (
                <AutocompleteField
                  key={field.key}
                  label={field.label}
                  size="sm"
                  options={opts}
                  value={displayVal}
                  clearable
                  placeholder={`Selecionar ${field.label.toLowerCase()}...`}
                  onChange={(text) => { if (!text) onChange(field.key, ""); }}
                  onSelect={(opt) => onChange(field.key, opt.value)}
                />
              );
            }

            if (field.type === "number") {
              return (
                <div key={field.key}>
                  <NumberField
                    label={field.label}
                    size="sm"
                    value={rawVal}
                    placeholder={field.placeholder ?? `Filtrar por ${field.label.toLowerCase()}...`}
                    onChange={(e) => onChange(field.key, e.target.value)}
                  />
                  {rawVal && (
                    <button onClick={() => onChange(field.key, "")} className="mt-0.5 text-xs text-indigo-600 hover:underline">
                      Limpar
                    </button>
                  )}
                </div>
              );
            }

            if (field.type === "date") {
              return (
                <div key={field.key}>
                  <DateField
                    label={field.label}
                    size="sm"
                    value={rawVal}
                    onChange={(e) => onChange(field.key, e.target.value)}
                  />
                  {rawVal && (
                    <button onClick={() => onChange(field.key, "")} className="mt-0.5 text-xs text-indigo-600 hover:underline">
                      Limpar
                    </button>
                  )}
                </div>
              );
            }

            // text (default)
            return (
              <div key={field.key}>
                <TextField
                  label={field.label}
                  size="sm"
                  value={rawVal}
                  placeholder={field.placeholder ?? `Filtrar por ${field.label.toLowerCase()}...`}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
                {rawVal && (
                  <button onClick={() => onChange(field.key, "")} className="mt-0.5 text-xs text-indigo-600 hover:underline">
                    Limpar
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-zinc-100 bg-zinc-50">
          <button
            onClick={onReset}
            className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            Limpar todos
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Column Visibility Panel
// ─────────────────────────────────────────────────────────────────────────────

function ColumnPanel<T>({
  columns,
  hidden,
  onToggle,
  onClose,
  anchorRef,
}: {
  columns: DataTableColumn<T>[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 4, left: Math.max(8, rect.right + window.scrollX - 220) });
    }
  }, [anchorRef]);

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", onClickOut);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOut);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-56 rounded-xl border border-zinc-200 bg-white shadow-xl py-2 outline-none"
    >
      <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase text-zinc-400 tracking-wider">Colunas</p>
      {columns.filter((c) => !c.required).map((col) => {
        const isHidden = hidden.has(col.key);
        return (
          <button
            key={col.key}
            onClick={() => onToggle(col.key)}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            {isHidden
              ? <EyeOff size={13} className="text-zinc-400" />
              : <Eye size={13} className="text-indigo-500" />}
            {col.label}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeSummary<T>(col: DataTableColumn<T>, rows: T[]): React.ReactNode {
  if (!col.summary) return null;
  if (typeof col.summary === "function") return col.summary(rows);

  const nums = rows
    .map((r) => {
      const v = col.getValue ? col.getValue(r) : (r as Record<string, unknown>)[col.key];
      return typeof v === "number" ? v : parseFloat(String(v));
    })
    .filter((n) => !isNaN(n));

  if (nums.length === 0) return "—";

  switch (col.summary) {
    case "sum":   return nums.reduce((a, b) => a + b, 0).toLocaleString("pt-BR");
    case "avg":   return (nums.reduce((a, b) => a + b, 0) / nums.length).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
    case "min":   return Math.min(...nums).toLocaleString("pt-BR");
    case "max":   return Math.max(...nums).toLocaleString("pt-BR");
    case "count": return rows.length.toLocaleString("pt-BR");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Row with context menu for actions
// ─────────────────────────────────────────────────────────────────────────────

function DataRow<T>({
  row,
  idx,
  visibleCols,
  actions,
  actionsDisplay,
  size,
  variant,
  dividers,
  hoverable,
  onRowClick,
  bordered,
}: {
  row: T;
  idx: number;
  visibleCols: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  actionsDisplay?: "menu" | "inline";
  size: TableSize;
  variant: TableVariant;
  dividers: boolean;
  hoverable: boolean;
  onRowClick?: (row: T, index: number) => void;
  bordered: boolean;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const rowCls = twMerge(
    variant === "striped" && idx % 2 === 1 ? "bg-zinc-50/70" : "bg-white",
    dividers && "border-b border-zinc-100 last:border-0",
    hoverable && "transition-colors hover:bg-zinc-50 group",
    onRowClick && "cursor-pointer",
  );

  return (
    <tr className={rowCls} onClick={onRowClick ? () => onRowClick(row, idx) : undefined}>
      {visibleCols.map((col) => {
        const raw = (row as Record<string, unknown>)[col.key];
        const cell = col.render ? col.render(raw, row, idx) : (raw as React.ReactNode);
        return (
          <td
            key={col.key}
            className={twMerge(
              SIZE_TD[size],
              "text-zinc-700",
              bordered && "border-x border-zinc-100 first:border-l-0 last:border-r-0",
              ALIGN[col.align ?? "left"],
              col.cellClassName,
            )}
          >
            {cell}
          </td>
        );
      })}

      {actions && actions.length > 0 && (
        <td
          className={twMerge(
            SIZE_TD[size],
            "text-right",
            bordered && "border-l border-zinc-100",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-0.5">
            {/* Inline actions — always visible */}
            {actions
              .filter((a) => a.inline || actionsDisplay === "inline")
              .map((action, i) => {
                const Icon = action.icon;
                const isDisabled = action.disabled?.(row) ?? false;
                return (
                  <button
                    key={i}
                    disabled={isDisabled}
                    title={action.label}
                    onClick={() => action.onClick(row)}
                    className={twMerge(
                      "inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors",
                      "disabled:opacity-30 disabled:cursor-not-allowed",
                      action.danger
                        ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700",
                    )}
                  >
                    {Icon ? <Icon size={14} /> : <span className="text-[11px] font-medium">{action.label.slice(0, 3)}</span>}
                  </button>
                );
              })}

            {/* Menu actions — collapsed into ⋯ */}
            {actions.some((a) => !a.inline && actionsDisplay !== "inline") && (
              <>
                <button
                  ref={btnRef}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Mais ações"
                >
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen && (
                  <ActionMenu
                    row={row}
                    actions={actions.filter((a) => !a.inline)}
                    anchorRef={btnRef}
                    onClose={() => setMenuOpen(false)}
                  />
                )}
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DataTable
// ─────────────────────────────────────────────────────────────────────────────

export default function DataTable<T = Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  onRowClick,
  variant = "default",
  size = "md",
  stickyHeader = false,
  dividers = true,
  hoverable = true,
  actions,
  actionsDisplay = "menu",
  columnToggle = false,
  globalSearch = false,
  filterFields,
  tabs,
  showSummary = false,
  pagination = false,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  title,
  description,
  toolbarSlot,
  emptySlot,
  caption,
  className,
  componentId,
}: DataTableProps<T>) {
  // ── State ──
  const [sortKey, setSortKey]           = useState<string | null>(null);
  const [sortDir, setSortDir]           = useState<SortDir>(null);
  const [searchQ, setSearchQ]           = useState("");
  const [filters, setFilters]           = useState<Record<string, string>>({});
  const [hiddenCols, setHiddenCols]     = useState<Set<string>>(
    new Set(columns.filter((c) => c.hidden).map((c) => c.key)),
  );
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(defaultPageSize);
  const [filterOpen, setFilterOpen]     = useState(false);
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const [activeTab, setActiveTab]       = useState(0);

  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const colBtnRef    = useRef<HTMLButtonElement>(null);

  // ── Derived data ──
  const filtered = useMemo(() => {
    let result = rows;
    if (tabs && tabs[activeTab]) {
      const fn = getTabFilter(tabs[activeTab]);
      if (fn) result = result.filter(fn);
    }
    if (searchQ)  result = result.filter((r) => matchesGlobal(r, searchQ));
    if (Object.values(filters).some(Boolean)) result = result.filter((r) => matchesFilters(r, filters));
    if (sortKey && sortDir) result = sortRows(result, sortKey, sortDir, columns);
    return result;
  }, [rows, tabs, activeTab, searchQ, filters, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = pagination
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;

  // Reset to page 1 when filters/search/tab changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [searchQ, filters, sortKey, activeTab]);

  const visibleCols = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols],
  );

  // ── Handlers ──
  const handleSort = useCallback((key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir(null); }
  }, [sortKey, sortDir]);

  const handleToggleCol = useCallback((key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const handleFilter = useCallback((key: string, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  }, []);

  const resetFilters = useCallback(() => setFilters({}), []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const bordered = variant === "bordered";
  const headerBg = variant === "minimal" ? "bg-transparent" : "bg-zinc-50";

  return (
    <div
      className={twMerge("w-full flex flex-col gap-0", className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* ── Toolbar ── */}
      {(title || description || globalSearch || filterFields || columnToggle || toolbarSlot) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            {title && <p className="text-sm font-semibold text-zinc-900">{title}</p>}
            {description && <p className="text-xs text-zinc-500">{description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {globalSearch && (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-44"
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {filterFields && filterFields.length > 0 && (
              <button
                ref={filterBtnRef}
                onClick={() => setFilterOpen((v) => !v)}
                className={twMerge(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                  activeFilterCount > 0
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                )}
              >
                <Filter size={13} />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {columnToggle && (
              <button
                ref={colBtnRef}
                onClick={() => setColPanelOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <SlidersHorizontal size={13} />
                Colunas
                {hiddenCols.size > 0 && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-500 text-[10px] text-white font-bold">
                    {hiddenCols.size}
                  </span>
                )}
              </button>
            )}

            {toolbarSlot}
          </div>
        </div>
      )}

      {/* Filter dialog */}
      {filterOpen && filterFields && (
        <FilterDialog
          fields={filterFields}
          values={filters}
          onChange={handleFilter}
          onClose={() => setFilterOpen(false)}
          onReset={resetFilters}
        />
      )}

      {/* Column panel */}
      {colPanelOpen && (
        <ColumnPanel
          columns={columns}
          hidden={hiddenCols}
          onToggle={handleToggleCol}
          onClose={() => setColPanelOpen(false)}
          anchorRef={colBtnRef}
        />
      )}

      {/* ── Table ── */}
      <div className="w-full rounded-xl overflow-hidden border border-zinc-200">

        {/* Tab bar */}
        {tabs && tabs.length > 0 && (
          <div className="flex overflow-x-auto border-b border-zinc-200 bg-zinc-50/50">
            {tabs.map((tab, i) => {
              const fn = getTabFilter(tab);
              const count = tab.showCount ? (fn ? rows.filter(fn).length : rows.length) : null;
              return (
                <button
                  key={i}
                  onClick={() => { setActiveTab(i); setPage(1); }}
                  className={twMerge(
                    "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                    activeTab === i
                      ? "border-indigo-500 text-indigo-600 bg-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-white/60",
                  )}
                >
                  {tab.label}
                  {count !== null && (
                    <span className={twMerge(
                      "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      activeTab === i ? "bg-indigo-100 text-indigo-700" : "bg-zinc-200 text-zinc-500",
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Head */}
          <thead>
            <tr className={twMerge(headerBg, "border-b border-zinc-200")}>
              {visibleCols.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={twMerge(
                      SIZE_TH[size],
                      "font-semibold text-zinc-600 tracking-wide uppercase whitespace-nowrap select-none",
                      stickyHeader && "sticky top-0 z-10 bg-zinc-50 shadow-[0_1px_0_0_#e4e4e7]",
                      bordered && "border-x border-zinc-200 first:border-l-0 last:border-r-0",
                      ALIGN[col.align ?? "left"],
                      col.sortable && "cursor-pointer hover:bg-zinc-100 transition-colors",
                      col.headerClassName,
                    )}
                    style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        isSorted
                          ? sortDir === "asc"
                            ? <ChevronUp size={12} className="text-indigo-500" />
                            : <ChevronDown size={12} className="text-indigo-500" />
                          : <ChevronsUpDown size={12} className="text-zinc-300" />
                      )}
                    </span>
                  </th>
                );
              })}

              {/* Actions column header */}
              {actions && actions.length > 0 && (() => {
                const inlineCount = actionsDisplay === "inline"
                  ? actions.length
                  : actions.filter((a) => a.inline).length;
                const hasMenu = actionsDisplay !== "inline" && actions.some((a) => !a.inline);
                const hasInline = inlineCount > 0;
                const hasLabel = hasInline;
                const colW = inlineCount * 32 + (hasMenu ? 36 : 0) + 16;
                return (
                  <th
                    className={twMerge(
                      SIZE_TH[size],
                      "text-right",
                      hasLabel && "font-semibold text-zinc-500 tracking-wide uppercase",
                      bordered && "border-l border-zinc-200",
                    )}
                    style={{ width: Math.max(colW, 48), minWidth: Math.max(colW, 48) }}
                  >
                    {hasLabel ? "Ações" : null}
                  </th>
                );
              })()}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length + (actions ? 1 : 0)}
                  className="text-center py-12 text-zinc-400 text-sm"
                >
                  {emptySlot ?? "Nenhum dado encontrado."}
                </td>
              </tr>
            ) : (
              pageRows.map((row, idx) => (
                <DataRow
                  key={rowKey ? rowKey(row, idx) : idx}
                  row={row}
                  idx={idx}
                  visibleCols={visibleCols}
                  actions={actions}
                  actionsDisplay={actionsDisplay}
                  size={size}
                  variant={variant}
                  dividers={dividers}
                  hoverable={hoverable}
                  onRowClick={onRowClick}
                  bordered={bordered}
                />
              ))
            )}
          </tbody>

          {/* Summary row */}
          {showSummary && pageRows.length > 0 && visibleCols.some((c) => c.summary) && (
            <tfoot>
              <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                {visibleCols.map((col) => {
                  const val = computeSummary(col, filtered);
                  const label =
                    typeof col.summary === "string"
                      ? { sum: "Σ", avg: "x̄", min: "min", max: "max", count: "#" }[col.summary]
                      : "";
                  return (
                    <td
                      key={col.key}
                      className={twMerge(
                        SIZE_TD[size],
                        "font-semibold text-zinc-700",
                        ALIGN[col.align ?? "left"],
                        bordered && "border-x border-zinc-200 first:border-l-0 last:border-r-0",
                      )}
                    >
                      {val != null ? (
                        <span className="inline-flex items-center gap-1">
                          {label && <span className="text-[10px] text-zinc-400 font-mono">{label}</span>}
                          {val}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
                {actions && <td />}
              </tr>
            </tfoot>
          )}
        </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>
              {filtered.length === 0
                ? "0 registros"
                : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} de ${filtered.length}`}
            </span>
            <span className="text-zinc-300">|</span>
            <span>por página</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <PageBtn onClick={() => setPage(1)}           disabled={page === 1}><ChevronsLeft  size={14} /></PageBtn>
            <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}><ChevronLeft   size={14} /></PageBtn>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={twMerge(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                    p === page
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-600 hover:bg-zinc-100",
                  )}
                >
                  {p}
                </button>
              );
            })}

            <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}><ChevronRight  size={14} /></PageBtn>
            <PageBtn onClick={() => setPage(totalPages)}   disabled={page === totalPages}><ChevronsRight size={14} /></PageBtn>
          </div>
        </div>
      )}

      {caption && <p className="mt-2 text-xs text-zinc-400 text-center">{caption}</p>}
    </div>
  );
}

// Small helper
function PageBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  );
}
