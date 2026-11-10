"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { COMPONENT_REGISTRY, type ComponentCategory } from "./registry";

const ALL = "Todos" as const;
type Filter = typeof ALL | ComponentCategory;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function ComponentsIndexPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>(ALL);
  const [view, setView] = useState<"names" | "details">("names");
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);

  // Atalho "/" foca a busca
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (ev.key === "/" && !typing) {
        ev.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(COMPONENT_REGISTRY.map((c) => c.category)))] as Filter[],
    [],
  );

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    return COMPONENT_REGISTRY.filter((c) => {
      if (category !== ALL && c.category !== category) return false;
      if (!q) return true;
      return normalize(`${c.name} ${c.description} ${c.category}`).includes(q);
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [deferredQuery, category]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const c of filtered) {
      const letter = c.name[0].toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), c]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const letters = useMemo(() => new Set(groups.map(([l]) => l)), [groups]);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="mb-8">
        <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Índice
        </span>
        <h1 className="mb-3 text-3xl font-black text-zinc-900 dark:text-zinc-50">Todos os componentes</h1>
        <p className="max-w-2xl text-zinc-500 dark:text-zinc-400">
          {COMPONENT_REGISTRY.length} componentes em ordem alfabética. Clique para ir direto à demonstração.
          Pressione <kbd className="rounded border border-zinc-300 px-1.5 text-xs dark:border-zinc-700">/</kbd> para buscar.
        </p>
      </header>

      <div className="sticky top-16 z-10 -mx-4 mb-6 space-y-3 border-b border-zinc-200 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 dark:border-zinc-800">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar componente (ex.: modal, tabela, data)…"
            aria-label="Buscar componente"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === c
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
          <div className="ml-auto flex overflow-hidden rounded-lg border border-zinc-200 text-xs dark:border-zinc-800" role="group" aria-label="Modo de exibição">
            {(["names", "details"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={[
                  "px-3 py-1 font-medium",
                  view === v ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-300",
                ].join(" ")}
              >
                {v === "names" ? "Só nomes" : "Detalhado"}
              </button>
            ))}
          </div>
        </div>

        <nav aria-label="Ir para letra" className="flex flex-wrap gap-1">
          {alphabet.map((l) =>
            letters.has(l) ? (
              <a
                key={l}
                href={`#letter-${l}`}
                className="grid size-6 place-items-center rounded text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
              >
                {l}
              </a>
            ) : (
              <span key={l} className="grid size-6 place-items-center text-xs text-zinc-300 dark:text-zinc-700" aria-hidden>
                {l}
              </span>
            ),
          )}
        </nav>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length} componentes encontrados
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Nenhum componente encontrado para “{query}”.
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([letter, items]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-52">
              <h2 className="mb-3 border-b border-zinc-200 pb-1 text-lg font-black text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
                {letter}
              </h2>
              <ul
                className={
                  view === "names"
                    ? "grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {items.map((c) => (
                  <li key={c.name}>
                    <Link
                      href={c.href}
                      className={
                        view === "names"
                          ? "block truncate rounded-md px-2 py-1.5 font-mono text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                          : "block h-full rounded-xl border border-zinc-200 p-4 transition-colors hover:border-indigo-400 dark:border-zinc-800 dark:hover:border-indigo-500"
                      }
                    >
                      <span className={view === "names" ? "" : "font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400"}>
                        {c.name}
                      </span>
                      {view === "details" && (
                        <>
                          <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{c.description}</span>
                          <span className="mt-2 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {c.category}
                          </span>
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
