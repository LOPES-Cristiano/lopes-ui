"use client";

import Link from "next/link";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Search, X } from "lucide-react";
import { slugify, type ComponentEntry } from "./registry";
import { useActionsSections } from "./demos/actions";
import { useAnimationSections } from "./demos/animation";
import { useCommunicationSections } from "./demos/communication";
import { useDataSections } from "./demos/data";
import { useDisplaySections } from "./demos/display";
import { useEnterpriseSections } from "./demos/enterprise";
import { useFormsSections } from "./demos/forms";
import { useNavigationSections } from "./demos/navigation";

const DEFAULT_HEIGHT = 520;
/** Demos ficam montadas quando estão a até 1 viewport (acima) e 2 viewports (abaixo) da tela. */
const BEFORE_VIEWPORTS = 1;
const AFTER_VIEWPORTS = 2;
/** Altura da barra fixa do feed: usada como scroll-padding e nos cálculos de posição. */
const STICKY_OFFSET = 56;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// ── Demos: as seções de cada categoria da showcase, renderizadas direto (sem iframe) ──────────

type SectionMap = Record<string, ReactNode>;
type DemosByPage = Record<string, SectionMap>;

const DemosContext = createContext<DemosByPage>({});

/**
 * Chama o hook de seções de cada categoria uma única vez e as distribui por contexto.
 * Fica acima da interface do feed: rolar/navegar (estado da interface) não recria as demos.
 */
function DemosProvider({ children }: { children: ReactNode }) {
  const value: DemosByPage = {
    actions: useActionsSections(),
    animation: useAnimationSections(),
    communication: useCommunicationSections(),
    data: useDataSections(),
    display: useDisplaySections(),
    enterprise: useEnterpriseSections(),
    forms: useFormsSections(),
    navigation: useNavigationSections(),
  };
  return <DemosContext.Provider value={value}>{children}</DemosContext.Provider>;
}

/** Renderiza uma seção da showcase. `memo`: só re-renderiza quando as próprias demos mudam. */
const DemoSlot = memo(function DemoSlot({ page, anchor }: { page: string; anchor: string }) {
  const all = useContext(DemosContext);
  return <>{all[page]?.[anchor] ?? null}</>;
});

// ── Itens do feed ──────────────────────────────────────────────────────────────────────────────

type Item = {
  entry: ComponentEntry;
  slug: string;
  /** categoria da showcase (ex.: "actions") ou null */
  page: string | null;
  /** rota da página antiga (para o link "abrir em página inteira") */
  path: string;
  anchor: string | null;
  /** slug do componente que mostra a demonstração (o primeiro, em ordem A–Z, a usar a mesma seção) */
  ownerSlug: string | null;
};

function buildItems(entries: ComponentEntry[]): Item[] {
  const ownerByHref = new Map<string, string>();
  return entries.map((entry) => {
    const [path, anchor] = entry.href.split("#");
    const slug = slugify(entry.name);
    const page = path.split("/").filter(Boolean).pop() ?? null;
    if (!anchor) return { entry, slug, page, path, anchor: null, ownerSlug: null };
    if (!ownerByHref.has(entry.href)) ownerByHref.set(entry.href, slug);
    return { entry, slug, page, path, anchor, ownerSlug: ownerByHref.get(entry.href) ?? slug };
  });
}

export default function ComponentsFeed({ entries }: { entries: ComponentEntry[] }) {
  return (
    <DemosProvider>
      <Feed entries={entries} />
    </DemosProvider>
  );
}

function Feed({ entries }: { entries: ComponentEntry[] }) {
  const items = useMemo(() => buildItems(entries), [entries]);
  const nameBySlug = useMemo(() => new Map(items.map((i) => [i.slug, i.entry.name])), [items]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(0);
  const jumpRef = useRef<{ index: number; until: number } | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState<string[]>([]);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  /** Só sincroniza a URL depois do salto inicial para o #hash (evita sobrescrevê-lo). */
  const [ready, setReady] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return items;
    return items.filter((i) => normalize(`${i.entry.name} ${i.entry.description} ${i.entry.category}`).includes(q));
  }, [items, query]);

  const alignTo = useCallback((index: number, smooth: boolean) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const el = scroller.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!el) return;
    scroller.scrollTo({ top: el.offsetTop - STICKY_OFFSET, behavior: smooth ? "smooth" : "instant" });
  }, []);

  /**
   * Vai até um componente. As demos acima do destino ainda não foram medidas (têm altura estimada),
   * então o destino "anda" quando elas montam; por isso realinha por ~1,5s, a menos que o usuário role.
   */
  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      jumpRef.current = { index: clamped, until: performance.now() + 1500 };
      alignTo(clamped, smooth);
    },
    [items.length, alignTo],
  );

  const scrollToSlug = useCallback(
    (slug: string, smooth = true) => {
      const index = items.findIndex((i) => i.slug === slug);
      if (index >= 0) scrollToIndex(index, smooth);
    },
    [items, scrollToIndex],
  );

  // Recalcula o item ativo e quais demos devem estar montadas.
  const update = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const articles = scroller.querySelectorAll<HTMLElement>("[data-index]");
    const viewport = scroller.clientHeight;
    const top = scroller.scrollTop;
    const from = top - viewport * BEFORE_VIEWPORTS;
    const to = top + viewport * (1 + AFTER_VIEWPORTS);

    let active = 0;
    const near: string[] = [];
    articles.forEach((el, i) => {
      if (el.offsetTop - STICKY_OFFSET <= top + 4) active = i;
      const bottom = el.offsetTop + el.offsetHeight;
      if (bottom >= from && el.offsetTop <= to) {
        const slug = el.dataset.slug;
        if (slug) near.push(slug);
      }
    });

    setMounted((prev) => (prev.join("|") === near.join("|") ? prev : near));
    if (active !== activeRef.current) {
      activeRef.current = active;
      setActiveIndex(active);
    }
  }, []);

  // Scroll → atualiza (throttle por frame). Gestos do usuário cancelam o realinhamento do salto.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    const cancelJump = () => {
      jumpRef.current = null;
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", cancelJump, { passive: true });
    scroller.addEventListener("touchstart", cancelJump, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", cancelJump);
      scroller.removeEventListener("touchstart", cancelJump);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [update]);

  // Alturas medidas mudam o layout: recalcula e, se houver salto em andamento, realinha.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const jump = jumpRef.current;
      if (jump && performance.now() < jump.until) alignTo(jump.index, false);
      update();
    });
    return () => cancelAnimationFrame(frame);
  }, [heights, mounted, update, alignTo]);

  // Mede a altura real de cada demo montada.
  const observerRef = useRef<ResizeObserver | null>(null);
  useEffect(() => {
    const observer = new ResizeObserver((records) => {
      setHeights((prev) => {
        let next = prev;
        for (const r of records) {
          const slug = (r.target as HTMLElement).dataset.demoSlug;
          if (!slug) continue;
          const h = Math.ceil(r.contentRect.height);
          if (h > 0 && Math.abs((prev[slug] ?? 0) - h) >= 3) {
            if (next === prev) next = { ...prev };
            next[slug] = h;
          }
        }
        return next;
      });
    });
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);
  const measureRef = useCallback((el: HTMLDivElement | null) => {
    if (el) observerRef.current?.observe(el);
  }, []);

  // Link direto (/components#alert) e mudanças de hash.
  useEffect(() => {
    const go = (smooth: boolean) => {
      const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (slug) scrollToSlug(slug, smooth);
    };
    const frame = requestAnimationFrame(() => {
      go(false);
      update();
      setReady(true);
    });
    const onHash = () => go(true);
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHash);
    };
  }, [scrollToSlug, update]);

  // Mantém a URL e o título em sincronia com o componente visível.
  const activeItem = items[activeIndex];
  useEffect(() => {
    if (!activeItem || !ready) return;
    const hash = `#${activeItem.slug}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
    document.title = `${activeItem.entry.name} · Componentes · Lopes UI`;
  }, [activeItem, ready]);

  // Mantém o item ativo visível dentro do índice lateral.
  useEffect(() => {
    const list = indexRef.current;
    if (!list || !activeItem) return;
    const el = list.querySelector<HTMLElement>(`[data-index-slug="${activeItem.slug}"]`);
    if (!el) return;
    if (el.offsetTop < list.scrollTop + 8) list.scrollTop = el.offsetTop - 8;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight - 8)
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight + 8;
  }, [activeItem, filtered]);

  // Atalhos: ← anterior, → próximo, / busca.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (typing || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        scrollToIndex(activeRef.current - 1);
      } else if (ev.key === "ArrowRight") {
        ev.preventDefault();
        scrollToIndex(activeRef.current + 1);
      } else if (ev.key === "/") {
        ev.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollToIndex]);

  const mountedSet = useMemo(() => new Set(mounted), [mounted]);
  const prev = items[activeIndex - 1];
  const next = items[activeIndex + 1];

  return (
    <div className="flex h-[calc(100vh-4rem)] min-w-0">
      {/* ── Feed corrido ─────────────────────────────────────────────── */}
      <div ref={scrollerRef} className="relative min-w-0 flex-1 snap-y snap-proximity overflow-y-auto overscroll-contain scroll-pt-14">
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-zinc-200 bg-background/90 px-3 py-2 backdrop-blur sm:px-6 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={!prev}
            aria-label={prev ? `Anterior: ${prev.entry.name}` : "Anterior"}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="min-w-0 flex-1 text-center" aria-live="polite">
            <span className="block truncate font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {activeItem?.entry.name}
            </span>
            <span className="block text-[11px] text-zinc-500">
              {activeIndex + 1} / {items.length} · {activeItem?.entry.category}
            </span>
          </div>

          <select
            aria-label="Ir para componente"
            value={activeItem?.slug ?? ""}
            onChange={(e) => scrollToSlug(e.target.value)}
            className="max-w-32 rounded-lg border border-zinc-200 bg-background px-2 py-1.5 text-xs lg:hidden dark:border-zinc-800"
          >
            {items.map((i) => (
              <option key={i.slug} value={i.slug}>
                {i.entry.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={!next}
            aria-label={next ? `Próximo: ${next.entry.name}` : "Próximo"}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="hidden sm:inline">Próximo</span> <ArrowRight className="size-3.5" aria-hidden />
          </button>
        </div>

        {/* Largura total: sem coluna central estreita */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {items.map((item, index) => {
            const { entry, slug, page, path, anchor, ownerSlug } = item;
            const isOwner = ownerSlug === slug;
            const showDemo = !!anchor && !!page && isOwner && mountedSet.has(slug);
            const height = heights[slug] ?? DEFAULT_HEIGHT;
            return (
              <article
                key={slug}
                id={`c-${slug}`}
                data-index={index}
                data-slug={slug}
                className="min-h-[70vh] snap-start border-b border-zinc-200 py-10 dark:border-zinc-800"
                aria-labelledby={`title-${slug}`}
              >
                <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  <div className="min-w-0">
                    <span className="mb-2 inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {entry.category}
                    </span>
                    <h2 id={`title-${slug}`} className="mb-2 font-mono text-2xl font-black text-zinc-900 sm:text-3xl dark:text-zinc-50">
                      {entry.name}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">{entry.description}</p>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <code>{`import { ${entry.name} } from "lopes-ui";`}</code>
                  </pre>
                </header>

                {!anchor ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
                    <p className="mb-3">
                      <span className="font-mono font-semibold">{entry.name}</span> ainda não tem uma seção de demonstração própria.
                    </p>
                    <Link href={path} className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                      Abrir a página da categoria <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                ) : !isOwner && ownerSlug ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-zinc-600 dark:text-zinc-300">
                      A demonstração de <span className="font-mono font-semibold">{entry.name}</span> é compartilhada com{" "}
                      <span className="font-mono font-semibold">{nameBySlug.get(ownerSlug)}</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToSlug(ownerSlug)}
                      className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
                    >
                      Ver demonstração
                    </button>
                  </div>
                ) : (
                  <div>
                    {showDemo && page && anchor ? (
                      <div ref={measureRef} data-demo-slug={slug} className="min-w-0">
                        <DemoSlot page={page} anchor={anchor} />
                      </div>
                    ) : (
                      <div
                        style={{ height }}
                        className="flex w-full items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-400 dark:border-zinc-800"
                        role="status"
                      >
                        {heights[slug] ? "Role até aqui para carregar a demonstração" : "Carregando demonstração…"}
                      </div>
                    )}
                    <div className="mt-2 text-right">
                      <Link
                        href={entry.href}
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                      >
                        Abrir na página da categoria <ExternalLink className="size-3" aria-hidden />
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          <p className="py-10 text-center text-xs text-zinc-400">
            Fim da lista · use <kbd className="rounded border border-zinc-300 px-1 dark:border-zinc-700">←</kbd>{" "}
            <kbd className="rounded border border-zinc-300 px-1 dark:border-zinc-700">→</kbd> para navegar e{" "}
            <kbd className="rounded border border-zinc-300 px-1 dark:border-zinc-700">/</kbd> para buscar
          </p>
        </div>
      </div>

      {/* ── Índice lateral ───────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-l border-zinc-200 lg:flex dark:border-zinc-800" aria-label="Índice de componentes">
        <div className="relative border-b border-zinc-200 p-3 dark:border-zinc-800">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) {
                scrollToSlug(filtered[0].slug);
                (e.target as HTMLInputElement).blur();
              } else if (e.key === "Escape") {
                setQuery("");
              }
            }}
            placeholder="Buscar… ( / )"
            aria-label="Buscar componente"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-background pl-8 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
              <X className="size-4" />
            </button>
          )}
        </div>
        <ul ref={indexRef} className="relative flex-1 overflow-y-auto p-2">
          {filtered.length === 0 && <li className="p-3 text-sm text-zinc-500">Nenhum componente encontrado.</li>}
          {filtered.map((i) => {
            const isActive = i.slug === activeItem?.slug;
            return (
              <li key={i.slug} data-index-slug={i.slug}>
                <button
                  type="button"
                  onClick={() => scrollToSlug(i.slug)}
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "block w-full truncate rounded-md px-2.5 py-1.5 text-left font-mono text-[13px] transition-colors",
                    isActive
                      ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {i.entry.name}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
