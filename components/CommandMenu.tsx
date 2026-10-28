'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, ArrowLeft, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { twMerge } from 'tailwind-merge';
import { useAccessControl } from './useAccessControl';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CommandItem = {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional secondary text below the label */
  description?: string;
  /** Lucide icon shown in the square badge */
  icon?: LucideIcon;
  /** Keyboard shortcut shown on the right (e.g. "⌘P") */
  shortcut?: string;
  /** Called when the item is selected */
  onSelect?: () => void;
  /** Navigate to this URL when selected (internal: router push, external: new tab) */
  href?: string;
  /** Group heading. Items without a group are rendered first without a heading. */
  group?: string;
  /** Extra words used for filtering even if not visible */
  keywords?: string[];
  /** Nested sub-items (drill-down page inside the command menu) */
  children?: CommandItem[];
  /** If true the item is disabled */
  disabled?: boolean;
  /** data-component-id for access control */
  componentId?: string;
  /** If false, disables the command instead of hiding it when access is denied (default: true) */
  hideIfDenied?: boolean;
};

export type CommandMenuProps = {
  items: CommandItem[];
  /** Input placeholder inside the dialog */
  placeholder?: string;
  /** Text shown on the trigger button */
  triggerLabel?: string;
  /** Optional localStorage key to remember and show recently selected items */
  recentStorageKey?: string;
  /** Max recent items shown when query is empty (default: 3) */
  maxRecentItems?: number;
  /** data-component-id for the trigger button */
  componentId?: string;
  /** If true, hides the command menu trigger when access is denied (default: true) */
  hideIfDenied?: boolean;
  className?: string;
};

export type CommandInlineProps = {
  items: CommandItem[];
  placeholder?: string;
  emptyText?: string;
  onSelectItem?: (item: CommandItem) => void;
  componentId?: string;
  hideIfDenied?: boolean;
  className?: string;
  autoFocus?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectMac() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/** Normalize accents/diacritics so "orcamento" matches "Orçamento" and "armario" matches "Armário" */
export function normalizeCommandText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function scoreCommandMatch(item: CommandItem, normalizedQuery: string): number {
  const normLabel = normalizeCommandText(item.label);
  if (normLabel === normalizedQuery) return 100;
  if (normLabel.startsWith(normalizedQuery)) return 85;
  if (normLabel.includes(normalizedQuery)) return 70;

  const normKeywords = (item.keywords ?? []).map(normalizeCommandText).join(' ');
  if (normKeywords.includes(normalizedQuery)) return 55;

  const normDesc = normalizeCommandText(item.description ?? '');
  if (normDesc.includes(normalizedQuery)) return 40;

  const normGroup = normalizeCommandText(item.group ?? '');
  if (normGroup.includes(normalizedQuery)) return 25;

  return 0;
}

function filterCommandItemsByAccess(
  items: CommandItem[],
  canAccess: (id: string) => boolean
): CommandItem[] {
  const result: CommandItem[] = [];
  for (const item of items) {
    const allowed = !item.componentId || canAccess(item.componentId);
    if (!allowed && item.hideIfDenied !== false) {
      continue;
    }
    const filteredChildren = item.children
      ? filterCommandItemsByAccess(item.children, canAccess)
      : undefined;
    if (item.children && item.children.length > 0 && (!filteredChildren || filteredChildren.length === 0)) {
      continue;
    }
    result.push({
      ...item,
      disabled: Boolean(item.disabled || !allowed),
      children: filteredChildren,
    });
  }
  return result;
}

// ─── Inline Command Primitive (shadcn/ui <Command> style for Popovers/Panels) ─

export function Command({
  items,
  placeholder = 'Pesquisar...',
  emptyText = 'Nenhum resultado encontrado.',
  onSelectItem,
  componentId,
  hideIfDenied = true,
  className,
  autoFocus = false,
}: CommandInlineProps) {
  const router = useRouter();
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageStack, setPageStack] = useState<{ title: string; items: CommandItem[] }[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const permittedRootItems = useMemo(
    () => filterCommandItemsByAccess(items, canAccess),
    [items, canAccess]
  );

  const currentItems = pageStack.length > 0 ? pageStack[pageStack.length - 1].items : permittedRootItems;

  const filtered = useMemo(() => {
    const q = normalizeCommandText(query);
    const active = currentItems.filter((i) => !i.disabled);
    if (!q) return active;
    return active
      .map((item) => ({ item, score: scoreCommandMatch(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [currentItems, query]);

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const g = item.group ?? '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']") as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!hasRootPermission && hideIfDenied) return null;

  const handleSelect = (item: CommandItem) => {
    if (item.disabled || !hasRootPermission) return;
    if (item.children && item.children.length > 0) {
      setPageStack((prev) => [...prev, { title: item.label, items: item.children! }]);
      setQuery('');
      setActiveIndex(0);
      return;
    }
    item.onSelect?.();
    onSelectItem?.(item);
    if (!item.onSelect && item.href) {
      if (item.href.startsWith('http')) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(item.href);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const len = Math.max(1, filtered.length);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % len);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + len) % len);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex]);
    } else if (e.key === 'Backspace' && !query && pageStack.length > 0) {
      e.preventDefault();
      setPageStack((prev) => prev.slice(0, -1));
      setActiveIndex(0);
    }
  };

  return (
    <div
      data-component-id={componentId}
      className={twMerge(
        'flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100',
        !hasRootPermission && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-3">
        {pageStack.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setPageStack((prev) => prev.slice(0, -1));
              setActiveIndex(0);
            }}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            aria-label="Voltar"
          >
            <ArrowLeft size={14} />
          </button>
        ) : (
          <Search size={15} className="shrink-0 text-zinc-400" />
        )}
        <input
          autoFocus={autoFocus}
          value={query}
          disabled={!hasRootPermission}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-zinc-400"
        />
      </div>
      <div ref={listRef} className="max-h-64 overflow-y-auto py-1.5">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-zinc-400">{emptyText}</p>
        ) : (
          groups.map(([groupName, groupItems]) => (
            <div key={groupName || '__ungrouped__'}>
              {groupName && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {groupName}
                </p>
              )}
              {groupItems.map((item) => {
                const idx = filtered.indexOf(item);
                const active = idx === activeIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-active={active}
                    data-component-id={item.componentId ?? `erp.command.item-${item.id}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={twMerge(
                      'mx-1.5 flex w-[calc(100%-0.75rem)] items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors cursor-pointer',
                      active
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    {Icon && <Icon size={15} className="shrink-0 opacity-70" />}
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    {item.children && item.children.length > 0 ? (
                      <ChevronRight size={14} className="shrink-0 opacity-50" />
                    ) : item.shortcut ? (
                      <kbd className="rounded border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                        {item.shortcut}
                      </kbd>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Modal CommandMenu Component ─────────────────────────────────────────────

export default function CommandMenu({
  items,
  placeholder = 'Digite um comando ou pesquise...',
  triggerLabel = 'Buscar...',
  recentStorageKey,
  maxRecentItems = 3,
  componentId,
  hideIfDenied = true,
  className = '',
}: CommandMenuProps) {
  const router = useRouter();
  const { canAccess } = useAccessControl();
  const hasRootPermission = !componentId || canAccess(componentId);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageStack, setPageStack] = useState<{ title: string; items: CommandItem[] }[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [mac, setMac] = useState(false);
  // Avoid SSR/hydration mismatch for portal and modifier key label
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setMac(detectMac());
    if (recentStorageKey && typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(recentStorageKey);
        if (stored) setRecentIds(JSON.parse(stored));
      } catch {}
    }
  }, [recentStorageKey]);

  const rememberRecent = useCallback(
    (itemId: string) => {
      if (!recentStorageKey || typeof window === 'undefined') return;
      setRecentIds((prev) => {
        const next = [itemId, ...prev.filter((id) => id !== itemId)].slice(0, maxRecentItems);
        try {
          window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [recentStorageKey, maxRecentItems]
  );

  // ─── Global shortcut ⌘K / Ctrl+K ──────────────────────────────────────────
  useEffect(() => {
    if (!hasRootPermission) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [hasRootPermission]);

  // ─── Focus input when dialog opens ────────────────────────────────────────
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setActiveIndex(0);
      setPageStack([]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const permittedRootItems = useMemo(
    () => filterCommandItemsByAccess(items, canAccess),
    [items, canAccess]
  );

  const currentItems = pageStack.length > 0 ? pageStack[pageStack.length - 1].items : permittedRootItems;

  // ─── Filtering (NFD accent-insensitive + relevance score) ─────────────────
  const filtered = useMemo(() => {
    const q = normalizeCommandText(query);
    const available = currentItems.filter((i) => !i.disabled);
    if (!q) return available;
    return available
      .map((item) => ({ item, score: scoreCommandMatch(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [currentItems, query]);

  // ─── Grouping ─────────────────────────────────────────────────────────────
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    if (!query.trim() && pageStack.length === 0 && recentIds.length > 0) {
      const recents = recentIds
        .map((id) => currentItems.find((it) => it.id === id && !it.disabled))
        .filter((it): it is CommandItem => Boolean(it));
      if (recents.length > 0) {
        map.set('Recentes', recents);
      }
    }
    for (const item of filtered) {
      const g = item.group ?? '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries()); // [groupLabel, items[]]
  }, [filtered, query, pageStack.length, recentIds, currentItems]);

  // ─── Reset active index on query change ───────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [query]);

  // ─── Scroll active item into view ─────────────────────────────────────────
  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']") as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    setPageStack([]);
  }, []);

  const select = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      if (item.children && item.children.length > 0) {
        setPageStack((prev) => [...prev, { title: item.label, items: item.children! }]);
        setQuery('');
        setActiveIndex(0);
        return;
      }
      rememberRecent(item.id);
      item.onSelect?.();
      if (!item.onSelect && item.href) {
        if (item.href.startsWith('http')) {
          window.open(item.href, '_blank', 'noopener,noreferrer');
        } else {
          router.push(item.href);
        }
      }
      close();
    },
    [close, router, rememberRecent]
  );

  if (!hasRootPermission && hideIfDenied) return null;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const len = Math.max(1, filtered.length);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % len);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + len) % len);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[activeIndex]) select(filtered[activeIndex]);
        break;
      case 'Backspace':
        if (!query && pageStack.length > 0) {
          e.preventDefault();
          setPageStack((prev) => prev.slice(0, -1));
          setActiveIndex(0);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (pageStack.length > 0) {
          setPageStack((prev) => prev.slice(0, -1));
          setActiveIndex(0);
        } else {
          close();
        }
        break;
    }
  };

  const modKey = mac ? '⌘' : 'Ctrl';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <button
        data-component-id={componentId ?? 'erp.header.busca'}
        type="button"
        disabled={!hasRootPermission}
        onClick={() => hasRootPermission && setOpen(true)}
        className={twMerge(
          'flex items-center gap-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 shadow-2xs',
          'hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        aria-label="Abrir menu de comandos"
      >
        <Search size={15} className="shrink-0 text-slate-400 dark:text-slate-500" />
        <span className="hidden sm:inline w-36 text-left font-normal text-slate-500 dark:text-slate-400">{triggerLabel}</span>
        {mounted && (
          <kbd className="hidden sm:inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
            {modKey}K
          </kbd>
        )}
      </button>

      {/* ── Dialog portal ──────────────────────────────────────────────────── */}
      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de comandos"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
              onClick={close}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-header-command-panel-border bg-header-command-panel text-header-command-panel-foreground shadow-2xl">
              {/* ── Breadcrumb for nested sub-pages ────────────────────────── */}
              {pageStack.length > 0 && (
                <div className="flex items-center gap-1.5 border-b border-header-command-panel-border px-4 py-2 text-xs text-header-command-panel-muted">
                  <button
                    type="button"
                    onClick={() => {
                      setPageStack([]);
                      setActiveIndex(0);
                    }}
                    className="hover:underline cursor-pointer"
                  >
                    Início
                  </button>
                  {pageStack.map((page, idx) => (
                    <React.Fragment key={idx}>
                      <ChevronRight size={12} />
                      <button
                        type="button"
                        onClick={() => {
                          setPageStack((prev) => prev.slice(0, idx + 1));
                          setActiveIndex(0);
                        }}
                        className="font-medium text-header-command-panel-foreground hover:underline cursor-pointer"
                      >
                        {page.title}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* ── Input row ──────────────────────────────────────────────── */}
              <div className="flex items-center gap-3 border-b border-header-command-panel-border px-4">
                <Search size={16} className="shrink-0 text-header-command-panel-muted" />
                <input
                  data-component-id="erp.command-menu.input"
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent py-4 text-sm text-header-command-panel-foreground placeholder-header-command-panel-muted outline-none"
                />
                <kbd
                  role="button"
                  tabIndex={0}
                  onClick={close}
                  onKeyDown={(e) => e.key === 'Enter' && close()}
                  className="flex cursor-pointer items-center rounded border border-header-command-panel-border bg-header-command-panel-hover px-1.5 py-0.5 text-[10px] font-medium text-header-command-panel-muted hover:bg-header-command-panel-active select-none"
                >
                  Esc
                </kbd>
              </div>

              {/* ── Results list ───────────────────────────────────────────── */}
              <div ref={listRef} className="max-h-80 overflow-y-auto py-2 overscroll-contain">
                {filtered.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-header-command-panel-muted">
                    Nenhum resultado encontrado.
                  </p>
                ) : (
                  groups.map(([groupName, groupItems]) => (
                    <div key={groupName || '__ungrouped__'}>
                      {groupName && (
                        <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-header-command-panel-muted">
                          {groupName}
                        </p>
                      )}
                      {groupItems.map((item) => {
                        const idx = filtered.indexOf(item);
                        const active = idx === activeIndex;
                        const Icon = item.icon ?? (groupName === 'Recentes' ? Clock : undefined);
                        const hasSub = Boolean(item.children && item.children.length > 0);

                        return (
                          <button
                            key={`${groupName}-${item.id}`}
                            type="button"
                            data-active={active}
                            data-component-id={item.componentId ?? `erp.command-menu.item-${item.id}`}
                            onClick={() => select(item)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={twMerge(
                              'mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors cursor-pointer',
                              active
                                ? 'bg-header-command-panel-active text-header-command-panel-active-foreground'
                                : 'text-header-command-panel-foreground hover:bg-header-command-panel-hover'
                            )}
                          >
                            {Icon && (
                              <span
                                className={twMerge(
                                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                                  active
                                    ? 'border-header-command-panel-active-foreground bg-header-command-panel-active text-header-command-panel-active-foreground'
                                    : 'border-header-command-panel-border bg-header-command-panel-hover text-header-command-panel-muted'
                                )}
                              >
                                <Icon size={14} />
                              </span>
                            )}

                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate font-medium">{item.label}</span>
                              {item.description && (
                                <span className="truncate text-xs text-header-command-panel-muted">
                                  {item.description}
                                </span>
                              )}
                            </span>

                            {hasSub ? (
                              <ChevronRight size={15} className="ml-auto shrink-0 opacity-60" />
                            ) : item.shortcut ? (
                              <kbd
                                className={twMerge(
                                  'ml-auto flex-shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none',
                                  active
                                    ? 'border-header-command-panel-active-foreground bg-header-command-panel text-header-command-panel-active-foreground'
                                    : 'border-header-command-panel-border bg-header-command-panel text-header-command-panel-muted'
                                )}
                              >
                                {item.shortcut}
                              </kbd>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* ── Footer hints ───────────────────────────────────────────── */}
              <div className="flex items-center gap-4 border-t border-header-command-panel-border px-4 py-2 text-[11px] text-header-command-panel-muted">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-header-command-panel-border bg-header-command-panel-hover px-1 py-0.5 leading-none">
                    ↑↓
                  </kbd>{' '}
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-header-command-panel-border bg-header-command-panel-hover px-1 py-0.5 leading-none">
                    ↵
                  </kbd>{' '}
                  selecionar
                </span>
                {pageStack.length > 0 && (
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-header-command-panel-border bg-header-command-panel-hover px-1 py-0.5 leading-none">
                      ⌫
                    </kbd>{' '}
                    voltar
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-header-command-panel-border bg-header-command-panel-hover px-1 py-0.5 leading-none">
                    Esc
                  </kbd>{' '}
                  fechar
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
