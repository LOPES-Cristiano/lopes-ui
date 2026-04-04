"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { twMerge } from "tailwind-merge";

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
  /** If true the item is disabled */
  disabled?: boolean;
  /** data-component-id for access control */
  componentId?: string;
};

type Props = {
  items: CommandItem[];
  /** Input placeholder inside the dialog */
  placeholder?: string;
  /** Text shown on the trigger button */
  triggerLabel?: string;
  /** data-component-id for the trigger button */
  componentId?: string;
  className?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectMac() {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommandMenu({
  items,
  placeholder = "Digite um comando ou pesquise...",
  triggerLabel = "Buscar...",
  componentId,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mac, setMac] = useState(false);
  // Avoid SSR/hydration mismatch for portal and modifier key label
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
    setMac(detectMac());
  }, []);

  // ─── Global shortcut ⌘K / Ctrl+K ──────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // ─── Focus input when dialog opens ────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // ─── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items.filter((i) => !i.disabled);
    return items.filter((item) => {
      if (item.disabled) return false;
      const haystack = [
        item.label,
        item.description,
        item.group,
        ...(item.keywords ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  // ─── Grouping ─────────────────────────────────────────────────────────────
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const g = item.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries()); // [groupLabel, items[]]
  }, [filtered]);

  // ─── Reset active index on query change ───────────────────────────────────
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // ─── Scroll active item into view ─────────────────────────────────────────
  useEffect(() => {
    const el = listRef.current?.querySelector(
      "[data-active='true']"
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const select = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      item.onSelect?.();
      if (!item.onSelect && item.href) {
        if (item.href.startsWith("http")) {
          window.open(item.href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = item.href;
        }
      }
      close();
    },
    [close]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const len = Math.max(1, filtered.length);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % len);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + len) % len);
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[activeIndex]) select(filtered[activeIndex]);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  };

  const modKey = mac ? "⌘" : "Ctrl";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={twMerge(
          "flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-400",
          "hover:border-zinc-300 hover:bg-white transition-colors",
          className
        )}
        aria-label="Abrir menu de comandos"
      >
        <Search size={14} className="shrink-0" />
        <span className="hidden sm:inline w-28 text-left">{triggerLabel}</span>
        {mounted && (
          <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 leading-none">
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
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
              {/* ── Input row ──────────────────────────────────────────────── */}
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4">
                <Search size={16} className="shrink-0 text-zinc-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent py-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
                />
                <kbd
                  role="button"
                  tabIndex={0}
                  onClick={close}
                  onKeyDown={(e) => e.key === "Enter" && close()}
                  className="flex cursor-pointer items-center rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 hover:bg-zinc-50 select-none"
                >
                  Esc
                </kbd>
              </div>

              {/* ── Results list ───────────────────────────────────────────── */}
              <div
                ref={listRef}
                className="max-h-80 overflow-y-auto py-2 overscroll-contain"
              >
                {filtered.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-zinc-400">
                    Nenhum resultado encontrado.
                  </p>
                ) : (
                  groups.map(([groupName, groupItems]) => (
                    <div key={groupName || "__ungrouped__"}>
                      {groupName && (
                        <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
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
                            {...(item.componentId
                              ? {
                                  "data-component-id": item.componentId,
                                }
                              : {})}
                            onClick={() => select(item)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={twMerge(
                              "mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                              active
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-zinc-700 hover:bg-zinc-50"
                            )}
                          >
                            {Icon && (
                              <span
                                className={twMerge(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                                  active
                                    ? "border-indigo-200 bg-indigo-100 text-indigo-600"
                                    : "border-zinc-200 bg-zinc-50 text-zinc-500"
                                )}
                              >
                                <Icon size={14} />
                              </span>
                            )}

                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate font-medium">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="truncate text-xs text-zinc-400">
                                  {item.description}
                                </span>
                              )}
                            </span>

                            {item.shortcut && (
                              <kbd
                                className={twMerge(
                                  "ml-auto flex-shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none",
                                  active
                                    ? "border-indigo-200 bg-white text-indigo-500"
                                    : "border-zinc-200 bg-white text-zinc-400"
                                )}
                              >
                                {item.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* ── Footer hints ───────────────────────────────────────────── */}
              <div className="flex items-center gap-4 border-t border-zinc-100 px-4 py-2 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 leading-none">
                    ↑↓
                  </kbd>{" "}
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 leading-none">
                    ↵
                  </kbd>{" "}
                  selecionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 leading-none">
                    Esc
                  </kbd>{" "}
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
