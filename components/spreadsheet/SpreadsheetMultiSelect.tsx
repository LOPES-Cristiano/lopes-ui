'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

export const EMPTY_OPTION = '(Vazio)';

const norm = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

type Props = {
  options: string[];
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
  componentId?: string;
  /** Mostra a opção "(Vazio)" para filtrar linhas sem valor. */
  allowEmpty?: boolean;
};

/**
 * Filtro multiseleção para células do cabeçalho da planilha.
 * O painel é renderizado em portal (position: fixed) para não ser cortado pelo overflow da grade.
 */
export default function SpreadsheetMultiSelect({ options, value, onChange, componentId, allowEmpty = true }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => new Set(value ?? []), [value]);
  const all = useMemo(() => (allowEmpty ? [EMPTY_OPTION, ...options] : options), [options, allowEmpty]);
  const visible = useMemo(() => {
    const q = norm(query);
    return q ? all.filter((o) => norm(o).includes(q)) : all;
  }, [all, query]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const reposition = () => setOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const width = Math.max(220, r.width);
      const left = Math.min(r.left, window.innerWidth - width - 8);
      setPos({ left: Math.max(8, left), top: r.bottom + 2, width });
      setQuery('');
    }
    setOpen((v) => !v);
  };

  const commit = (next: Set<string>) => onChange(next.size ? Array.from(next) : undefined);
  const toggle = (opt: string) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    commit(next);
  };

  const label =
    selected.size === 0 ? 'Todos' : selected.size === 1 ? Array.from(selected)[0] : `${selected.size} selecionados`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-component-id={componentId}
        onClick={toggleOpen}
        title={selected.size ? Array.from(selected).join(', ') : 'Filtrar por lista'}
        className={twMerge(
          'w-full h-5 px-1.5 text-[11px] rounded border flex items-center justify-between gap-1 cursor-pointer bg-transparent outline-none',
          selected.size
            ? 'border-primary/50 text-primary bg-primary/5 font-medium'
            : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-zinc-400'
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={11} className="shrink-0" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[1000] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
            style={{ left: pos.left, top: pos.top, width: pos.width, maxHeight: 340 }}
          >
            <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full h-7 pl-7 pr-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                <button
                  type="button"
                  className="text-primary cursor-pointer"
                  onClick={() => commit(new Set([...selected, ...visible]))}
                >
                  Marcar {query ? 'filtrados' : 'todos'}
                </button>
                <span className="text-zinc-300">·</span>
                <button type="button" className="text-primary cursor-pointer" onClick={() => onChange(undefined)}>
                  Limpar
                </button>
                <span className="ml-auto text-zinc-400">{selected.size} sel.</span>
              </div>
            </div>
            <div className="overflow-auto p-1">
              {visible.length === 0 && <div className="p-3 text-center text-xs text-zinc-400">Nada encontrado.</div>}
              {visible.map((opt) => {
                const checked = selected.has(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-left cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span
                      className={twMerge(
                        'h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center',
                        checked ? 'bg-primary border-primary text-white' : 'border-zinc-300 dark:border-zinc-600'
                      )}
                    >
                      {checked && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span className={twMerge('truncate', opt === EMPTY_OPTION && 'italic text-zinc-500')}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
