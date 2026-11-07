'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, ArrowLeft, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
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

const subscribeNoop = () => () => {};

/** Normalize accents/diacritics so "orcamento" matches "Orçamento" and "armario" matches "Armário" */
export function normalizeCommandText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function scoreSingleToken(
  normLabel: string,
  normKeywords: string,
  normDesc: string,
  normGroup: string,
  token: string,
): number {
  if (normLabel === token) return 100;
  if (normLabel.startsWith(token)) return 85;
  if (normLabel.includes(token)) return 70;
  if (normKeywords.includes(token)) return 55;
  if (normDesc.includes(token)) return 40;
  if (normGroup.includes(token)) return 25;
  return 0;
}

/**
 * Multi-token AND + relevance scoring:
 * Every whitespace-separated token in `normalizedQuery` must match at least one field,
 * while exact/prefix label matches get boosted to the top.
 */
function scoreCommandMatch(item: CommandItem, normalizedQuery: string): number {
  if (!normalizedQuery) return 1;
  const normLabel = normalizeCommandText(item.label);
  const normKeywords = (item.keywords ?? []).map(normalizeCommandText).join(' ');
  const normDesc = normalizeCommandText(item.description ?? '');
  const normGroup = normalizeCommandText(item.group ?? '');

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 1;

  let total = 0;
  for (const token of tokens) {
    const tokenScore = scoreSingleToken(normLabel, normKeywords, normDesc, normGroup, token);
    if (tokenScore === 0) return 0;
    total += tokenScore;
  }

  let avg = total / tokens.length;
  if (normLabel === normalizedQuery) avg += 40;
  else if (normLabel.startsWith(normalizedQuery)) avg += 25;
  else if (normLabel.includes(normalizedQuery)) avg += 15;

  return avg;
}

function filterCommandItemsByAccess(
  items: CommandItem[],
  canAccess: (id: string) => boolean,
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
    if (
      item.children &&
      item.children.length > 0 &&
      (!filteredChildren || filteredChildren.length === 0)
    ) {
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
    [items, canAccess],
  );

  const currentItems =
    pageStack.length > 0 ? pageStack[pageStack.length - 1].items : permittedRootItems;

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
    if (e.nativeEvent.isComposing) return;
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
        'flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-foreground',
        !hasRootPermission && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        {pageStack.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setPageStack((prev) => prev.slice(0, -1));
              setActiveIndex(0);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="Voltar"
          >
            <ArrowLeft size={14} />
          </button>
        ) : (
          <Search size={15} className="shrink-0 text-muted-foreground" />
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
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div ref={listRef} className="max-h-64 overflow-y-auto overscroll-contain py-1.5">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          groups.map(([groupName, groupItems]) => (
            <div key={groupName || '__ungrouped__'}>
              {groupName && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-surface-hover',
                    )}
                  >
                    {Icon && <Icon size={15} className="shrink-0 opacity-70" />}
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    {item.children && item.children.length > 0 ? (
                      <ChevronRight size={14} className="shrink-0 opacity-50" />
                    ) : item.shortcut ? (
                      <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
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

  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const mac = useSyncExternalStore(
    subscribeNoop,
    detectMac,
    () => false,
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageStack, setPageStack] = useState<{ title: string; items: CommandItem[] }[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    if (!recentStorageKey || typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(recentStorageKey);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);

  const openMenu = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setPageStack([]);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    setPageStack([]);
  }, []);

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
    [recentStorageKey, maxRecentItems],
  );

  // ─── Global shortcut ⌘K / Ctrl+K ──────────────────────────────────────────
  useEffect(() => {
    if (!hasRootPermission) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          if (next) {
            setQuery('');
            setActiveIndex(0);
            setPageStack([]);
          }
          return next;
        });
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [hasRootPermission]);

  // ─── Focus input & capture Escape when dialog opens ───────────────────────
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    const onEscapeCapture = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setPageStack((prev) => {
        if (prev.length > 0) {
          setActiveIndex(0);
          return prev.slice(0, -1);
        }
        close();
        return prev;
      });
    };
    document.addEventListener('keydown', onEscapeCapture, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onEscapeCapture, true);
    };
  }, [open, close]);

  const permittedRootItems = useMemo(
    () => filterCommandItemsByAccess(items, canAccess),
    [items, canAccess],
  );

  const currentItems =
    pageStack.length > 0 ? pageStack[pageStack.length - 1].items : permittedRootItems;

  // ─── Filtering (NFD accent-insensitive + multi-token AND + relevance score) ─
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
    return Array.from(map.entries());
  }, [filtered, query, pageStack.length, recentIds, currentItems]);

  // ─── Scroll active item into view ─────────────────────────────────────────
  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']") as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

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
    [close, router, rememberRecent],
  );

  if (!hasRootPermission && hideIfDenied) return null;

  const safeActiveIndex = filtered.length > 0 ? Math.min(activeIndex, filtered.length - 1) : 0;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
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
        if (filtered[safeActiveIndex]) select(filtered[safeActiveIndex]);
        break;
      case 'Backspace':
        if (!query && pageStack.length > 0) {
          e.preventDefault();
          setPageStack((prev) => prev.slice(0, -1));
          setActiveIndex(0);
        }
        break;
    }
  };

  const modKey = mac ? '⌘' : 'Ctrl';

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <button
        data-component-id={componentId ?? 'erp.header.busca'}
        type="button"
        disabled={!hasRootPermission}
        onClick={() => hasRootPermission && openMenu()}
        className={twMerge(
          'flex items-center gap-2.5 rounded-lg border border-header-command-border bg-header-command px-3 py-1.5 text-xs text-header-command-placeholder shadow-2xs',
          'hover:bg-header-command-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
          className,
        )}
        aria-label="Abrir menu de comandos"
      >
        <Search size={15} className="shrink-0 text-header-command-placeholder" />
        <span className="hidden sm:inline w-36 text-left font-normal text-header-command-placeholder">
          {triggerLabel}
        </span>
        {mounted && (
          <kbd className="hidden sm:inline-flex items-center rounded-md bg-header-command-kbd px-1.5 py-0.5 text-[10px] font-medium text-header-command-kbd-foreground leading-none">
            {modKey}K
          </kbd>
        )}
      </button>

      {/* ── Dialog portal ──────────────────────────────────────────────────── */}
      {mounted &&
        open &&
        createPortal(
          <div
            data-floating-open="true"
            className="fixed inset-0 z-[7500] flex items-start justify-center px-3 sm:px-4 pt-[6vh] sm:pt-[14vh]"
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
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={placeholder}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent py-4 text-sm text-header-command-panel-foreground placeholder-header-command-panel-muted outline-none"
                />
                <button
                  type="button"
                  aria-label="Fechar menu de comandos"
                  onClick={close}
                  className="inline-flex h-6 cursor-pointer items-center rounded border border-header-command-panel-border bg-header-command-panel-hover px-1.5 py-0.5 text-[10px] font-medium text-header-command-panel-muted hover:bg-header-command-panel-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none"
                >
                  Esc
                </button>
              </div>

              {/* ── Results list ───────────────────────────────────────────── */}
              <div
                ref={listRef}
                className="max-h-[55dvh] sm:max-h-80 overflow-y-auto py-2 overscroll-contain"
              >
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
                        const active = idx === safeActiveIndex;
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
                                : 'text-header-command-panel-foreground hover:bg-header-command-panel-hover',
                            )}
                          >
                            {Icon && (
                              <span
                                className={twMerge(
                                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                                  active
                                    ? 'border-header-command-panel-active-foreground bg-header-command-panel-active text-header-command-panel-active-foreground'
                                    : 'border-header-command-panel-border bg-header-command-panel-hover text-header-command-panel-muted',
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
                                    : 'border-header-command-panel-border bg-header-command-panel text-header-command-panel-muted',
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
          document.body,
        )}
    </>
  );
}
