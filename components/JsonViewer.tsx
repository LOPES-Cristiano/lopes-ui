"use client";

import React, { useState, useMemo, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import {
  ChevronRight,
  Copy,
  Check,
  Search,
  ChevronsUpDown,
  ChevronsDownUp,
  Braces,
  X,
} from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type JsonViewerVariant = "default" | "dark";

export type JsonViewerProps = {
  /** Any JSON-compatible value or parsed object to inspect */
  data: unknown;
  /** Optional root node label (e.g. "payload", "nfeProc", "response"). Default: "root" */
  rootName?: string;
  /** Initial auto-expanded depth (0 = collapsed root, 2 = two levels deep). Default: 2 */
  defaultExpandDepth?: number;
  /** Show key/value filter search input in the header. Default: true */
  searchable?: boolean;
  /** Show header toolbar (title, search, expand/collapse all, copy). Default: true */
  showToolbar?: boolean;
  /** Optional header title */
  title?: React.ReactNode;
  /** Max scroll height (number in px or CSS string). Default: 420 */
  maxHeight?: number | string;
  /** Color theme variant. Default: "default" */
  variant?: JsonViewerVariant;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isObjectRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function subtreeMatchesQuery(keyName: string | undefined, value: unknown, queryLower: string): boolean {
  if (!queryLower) return true;
  if (keyName && keyName.toLowerCase().includes(queryLower)) return true;
  if (value === null) return "null".includes(queryLower);
  if (value === undefined) return "undefined".includes(queryLower);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).toLowerCase().includes(queryLower);
  }
  if (Array.isArray(value)) {
    return value.some((item, idx) => subtreeMatchesQuery(String(idx), item, queryLower));
  }
  if (isObjectRecord(value)) {
    return Object.entries(value).some(([k, v]) => subtreeMatchesQuery(k, v, queryLower));
  }
  return false;
}

function formatChildPath(parentPath: string, key: string | number): string {
  if (typeof key === "number") return `${parentPath}[${key}]`;
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return `${parentPath}.${key}`;
  return `${parentPath}[${JSON.stringify(key)}]`;
}

// ── Recursive Tree Node ───────────────────────────────────────────────────────

type NodeProps = {
  name?: string | number;
  value: unknown;
  path: string;
  depth: number;
  defaultExpandDepth: number;
  expandSignal: { mode: "default" | "all" | "none"; tick: number };
  queryLower: string;
  isDark: boolean;
  isLast: boolean;
};

function JsonTreeNode({
  name,
  value,
  path,
  depth,
  defaultExpandDepth,
  expandSignal,
  queryLower,
  isDark,
  isLast,
}: NodeProps) {
  const computeInitialOpen = useCallback(() => {
    if (expandSignal.mode === "all") return true;
    if (expandSignal.mode === "none") return depth === 0;
    return depth < defaultExpandDepth;
  }, [expandSignal, depth, defaultExpandDepth]);

  const [open, setOpen] = useState<boolean>(computeInitialOpen);
  const [copiedMode, setCopiedMode] = useState<"val" | "path" | null>(null);

  const signalKey = `${expandSignal.tick}:${expandSignal.mode}:${depth}:${defaultExpandDepth}`;
  const [prevSignalKey, setPrevSignalKey] = useState(signalKey);
  if (prevSignalKey !== signalKey) {
    setPrevSignalKey(signalKey);
    setOpen(computeInitialOpen());
  }

  // Auto-open matching branches while searching
  const effectiveOpen = queryLower ? true : open;

  const isArr = Array.isArray(value);
  const isObj = isObjectRecord(value);
  const isBranch = isArr || isObj;

  if (queryLower && !subtreeMatchesQuery(name !== undefined ? String(name) : undefined, value, queryLower)) {
    return null;
  }

  const copyText = async (txt: string, mode: "val" | "path") => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedMode(mode);
      setTimeout(() => setCopiedMode(null), 1400);
    } catch {
      // ignore
    }
  };

  const keyMatches =
    queryLower && name !== undefined && String(name).toLowerCase().includes(queryLower);

  const keyCls = twMerge(
    "font-semibold",
    isDark ? "text-sky-300" : "text-indigo-700 dark:text-sky-300",
    keyMatches && "rounded bg-amber-300/40 px-0.5 text-amber-950 dark:text-amber-100",
  );

  const renderKeyPrefix = () => {
    if (name === undefined) return null;
    if (typeof name === "number") {
      return (
        <span className={twMerge("mr-1.5 select-none", isDark ? "text-zinc-500" : "text-zinc-400")}>
          {name}:
        </span>
      );
    }
    return (
      <span className="mr-1.5">
        <span className={keyCls}>&quot;{name}&quot;</span>
        <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>:</span>
      </span>
    );
  };

  const renderActions = (serializedValue: string) => (
    <span className="ml-2 inline-flex items-center gap-1 opacity-0 transition-opacity group-hover/jnode:opacity-100">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          copyText(serializedValue, "val");
        }}
        title="Copiar valor"
        className={twMerge(
          "rounded px-1 py-0.5 text-[10px] font-sans font-medium transition-colors cursor-pointer",
          isDark
            ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            : "bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300",
        )}
      >
        {copiedMode === "val" ? "Copiado!" : "valor"}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          copyText(path, "path");
        }}
        title={`Copiar caminho (${path})`}
        className={twMerge(
          "rounded px-1 py-0.5 text-[10px] font-sans font-medium transition-colors cursor-pointer",
          isDark
            ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400",
        )}
      >
        {copiedMode === "path" ? "✓ path" : "path"}
      </button>
    </span>
  );

  if (!isBranch) {
    let valNode: React.ReactNode;
    let rawCopy = "";

    if (value === null) {
      valNode = <span className="italic text-rose-500 dark:text-rose-400">null</span>;
      rawCopy = "null";
    } else if (value === undefined) {
      valNode = <span className="italic text-zinc-400">undefined</span>;
      rawCopy = "undefined";
    } else if (typeof value === "boolean") {
      valNode = (
        <span className="font-bold text-amber-600 dark:text-amber-400">
          {value ? "true" : "false"}
        </span>
      );
      rawCopy = String(value);
    } else if (typeof value === "number") {
      valNode = <span className="text-violet-600 dark:text-violet-400">{value}</span>;
      rawCopy = String(value);
    } else {
      const str = String(value);
      const valMatches = queryLower && str.toLowerCase().includes(queryLower);
      valNode = (
        <span
          className={twMerge(
            "break-all",
            isDark ? "text-emerald-400" : "text-emerald-700 dark:text-emerald-400",
            valMatches && "rounded bg-amber-300/40 px-0.5",
          )}
        >
          &quot;{str}&quot;
        </span>
      );
      rawCopy = str;
    }

    return (
      <div className="group/jnode flex items-baseline py-0.5 pl-4 leading-relaxed">
        {renderKeyPrefix()}
        {valNode}
        {!isLast && <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>,</span>}
        {renderActions(rawCopy)}
      </div>
    );
  }

  const entries: Array<[string | number, unknown]> = isArr
    ? (value as unknown[]).map((v, i) => [i, v])
    : Object.entries(value as Record<string, unknown>);

  const openBracket = isArr ? "[" : "{";
  const closeBracket = isArr ? "]" : "}";
  const countLabel = isArr
    ? `${entries.length} ${entries.length === 1 ? "item" : "itens"}`
    : `${entries.length} ${entries.length === 1 ? "chave" : "chaves"}`;

  if (entries.length === 0) {
    return (
      <div className="group/jnode flex items-baseline py-0.5 pl-4 leading-relaxed">
        {renderKeyPrefix()}
        <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>
          {openBracket}
          {closeBracket}
        </span>
        {!isLast && <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>,</span>}
      </div>
    );
  }

  return (
    <div className="py-0.5">
      <div
        onClick={() => setOpen((o) => !o)}
        className={twMerge(
          "group/jnode flex cursor-pointer items-center rounded px-1 py-0.5 select-none transition-colors",
          isDark ? "hover:bg-white/5" : "hover:bg-zinc-100/90 dark:hover:bg-white/5",
        )}
      >
        <ChevronRight
          size={13}
          className={twMerge(
            "mr-1 shrink-0 transition-transform duration-150",
            isDark ? "text-zinc-400" : "text-zinc-500",
            effectiveOpen && "rotate-90",
          )}
        />
        {renderKeyPrefix()}
        <span className={isDark ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"}>
          {openBracket}
        </span>
        {!effectiveOpen && (
          <>
            <span
              className={twMerge(
                "mx-1.5 rounded px-1.5 py-0.2 text-[10px] font-sans font-medium",
                isDark
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
              )}
            >
              {countLabel}
            </span>
            <span className={isDark ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"}>
              {closeBracket}
            </span>
            {!isLast && <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>,</span>}
          </>
        )}
        {renderActions(JSON.stringify(value, null, 2))}
      </div>

      {effectiveOpen && (
        <div
          className={twMerge(
            "ml-2.5 border-l pl-2.5",
            isDark ? "border-zinc-800" : "border-zinc-200 dark:border-zinc-800",
          )}
        >
          {entries.map(([k, v], idx) => (
            <JsonTreeNode
              key={String(k)}
              name={k}
              value={v}
              path={formatChildPath(path, k)}
              depth={depth + 1}
              defaultExpandDepth={defaultExpandDepth}
              expandSignal={expandSignal}
              queryLower={queryLower}
              isDark={isDark}
              isLast={idx === entries.length - 1}
            />
          ))}
        </div>
      )}

      {effectiveOpen && (
        <div className="pl-4">
          <span className={isDark ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"}>
            {closeBracket}
          </span>
          {!isLast && <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>,</span>}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function JsonViewer({
  data,
  rootName = "$",
  defaultExpandDepth = 2,
  searchable = true,
  showToolbar = true,
  title,
  maxHeight = 420,
  variant = "default",
  className,
  componentId,
  hideIfDenied = false,
}: JsonViewerProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [query, setQuery] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [expandSignal, setExpandSignal] = useState<{
    mode: "default" | "all" | "none";
    tick: number;
  }>({ mode: "default", tick: 0 });

  const isDark = variant === "dark";
  const queryLower = query.trim().toLowerCase();

  const serializedAll = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2) ?? String(data);
    } catch {
      return String(data);
    }
  }, [data]);

  if (!hasPermission && hideIfDenied) return null;

  const handleCopyAll = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(serializedAll);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col overflow-hidden rounded-2xl border shadow-xs",
        isDark
          ? "border-zinc-800 bg-zinc-950 text-zinc-100"
          : "border-border bg-surface text-surface-foreground",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {showToolbar && (
        <div
          className={twMerge(
            "flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5",
            isDark ? "border-zinc-800 bg-zinc-900/70" : "border-border bg-muted/35",
          )}
        >
          <div className="flex items-center gap-2">
            <Braces size={15} className="text-primary" />
            <span className="text-xs font-bold tracking-tight">
              {title ?? "Inspetor JSON"}
            </span>
          </div>

          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-1.5">
            {searchable && (
              <div className="relative max-w-[200px] flex-1 sm:w-48">
                <Search
                  size={13}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar chave/valor..."
                  className={twMerge(
                    "w-full rounded-lg border py-1 pl-7 pr-6 text-xs focus:outline-none focus:ring-1 focus:ring-ring",
                    isDark
                      ? "border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
                      : "border-input-border bg-input text-input-foreground placeholder:text-input-placeholder",
                  )}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={() => setQuery("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              title="Expandir tudo"
              aria-label="Expandir tudo"
              onClick={() =>
                setExpandSignal((s) => ({ mode: "all", tick: s.tick + 1 }))
              }
              className={twMerge(
                "inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors cursor-pointer",
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <ChevronsUpDown size={13} />
            </button>

            <button
              type="button"
              title="Recolher tudo"
              aria-label="Recolher tudo"
              onClick={() =>
                setExpandSignal((s) => ({ mode: "none", tick: s.tick + 1 }))
              }
              className={twMerge(
                "inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors cursor-pointer",
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <ChevronsDownUp size={13} />
            </button>

            <button
              type="button"
              title="Copiar JSON formatado"
              onClick={handleCopyAll}
              className={twMerge(
                "inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[11px] font-semibold transition-colors cursor-pointer",
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              {copiedAll ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tree viewport */}
      <div
        style={{
          maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        }}
        className="overflow-auto p-3 font-mono text-xs"
      >
        <JsonTreeNode
          name={rootName === "$" ? undefined : rootName}
          value={data}
          path={rootName}
          depth={0}
          defaultExpandDepth={defaultExpandDepth}
          expandSignal={expandSignal}
          queryLower={queryLower}
          isDark={isDark}
          isLast={true}
        />
      </div>
    </div>
  );
}

export { JsonViewer };
