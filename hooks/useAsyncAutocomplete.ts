import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAsyncAutocompleteOptions<TItem> {
  /** Número mínimo de caracteres antes de acionar `fetcher`. Padrão: `2`. */
  minChars?: number;
  /** Atraso de debounce em milissegundos. Padrão: `250`. */
  debounceMs?: number;
  /** Opções iniciais opcionais (ex.: ao editar um registro já preenchido). */
  initialOptions?: TItem[];
}

export interface UseAsyncAutocompleteReturn<TItem> {
  query: string;
  setQuery: (nextQuery: string) => void;
  options: TItem[];
  loading: boolean;
  error: string | null;
  clear: () => void;
}

/**
 * Hook de busca assíncrona com debounce e proteção contra condições de corrida (stale responses),
 * ideal para uso conjunto com `AutocompleteField` ou `SelectField`.
 */
export function useAsyncAutocomplete<TItem>(
  fetcher: (query: string) => Promise<TItem[]>,
  options: UseAsyncAutocompleteOptions<TItem> = {},
): UseAsyncAutocompleteReturn<TItem> {
  const { minChars = 2, debounceMs = 250, initialOptions = [] } = options;

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TItem[]>(initialOptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < minChars) {
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current(trimmed);
        if (active) {
          setItems(result);
        }
      } catch (err) {
        if (active) {
          setItems([]);
          setError(err instanceof Error ? err.message : "Erro ao buscar sugestões");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, minChars, debounceMs]);

  const clear = useCallback(() => {
    setQuery("");
    setItems([]);
    setError(null);
    setLoading(false);
  }, []);

  const effectiveOptions = query.trim().length < minChars && query.trim().length > 0 ? [] : items;

  return {
    query,
    setQuery,
    options: effectiveOptions,
    loading,
    error,
    clear,
  };
}
