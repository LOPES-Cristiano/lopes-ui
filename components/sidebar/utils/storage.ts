const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const MAX_COOKIE_ENCODED_LENGTH = 3000;

export function safeParseStringArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}

export function parseStoredStringArray(raw: string | null | undefined): string[] | null {
  if (raw === null || raw === undefined) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return null;
  }
}

export function toSidebarCookieName(storageKey: string): string {
  return `sb_${storageKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

function readRawCookie(cookieName: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const prefix = `${cookieName}=`;
    const parts = document.cookie.split(';');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length));
      }
    }
  } catch {
    // ignore cookie read errors
  }
  return null;
}

function writeSidebarCookie(storageKey: string, values: string[]): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    const cookieName = toSidebarCookieName(storageKey);
    const secureFlag = window.location.protocol === 'https:' ? ';secure' : '';
    let slice = values;
    let encoded = encodeURIComponent(JSON.stringify(slice));
    while (encoded.length > MAX_COOKIE_ENCODED_LENGTH && slice.length > 0) {
      slice = slice.slice(0, slice.length - 1);
      encoded = encodeURIComponent(JSON.stringify(slice));
    }
    document.cookie = `${cookieName}=${encoded};path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax${secureFlag}`;
  } catch {
    // ignore cookie write errors
  }
}

function readSingleKeyFromStorageOrCookie(key: string): { values: string[]; fromCookie: boolean } | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawLocal = window.localStorage.getItem(key);
    const fromLocal = parseStoredStringArray(rawLocal);
    if (fromLocal !== null) {
      return { values: fromLocal, fromCookie: false };
    }
  } catch {
    // ignore localStorage read errors
  }

  const rawCookie = readRawCookie(toSidebarCookieName(key));
  const fromCookie = parseStoredStringArray(rawCookie);
  if (fromCookie !== null) {
    return { values: fromCookie, fromCookie: true };
  }

  return null;
}

/**
 * Lê um array de IDs persistidos em `localStorage` com fallback em cookie HTTP
 * (sobrevive ao header `Clear-Site-Data: "storage"` enviado no logout).
 * Retorna `null` apenas quando nenhuma preferência jamais foi salva.
 */
export function readPersistedStringArray(
  storageKey: string,
  fallbackKeys: string[] = [],
): string[] | null {
  if (typeof window === 'undefined') return null;

  const primary = readSingleKeyFromStorageOrCookie(storageKey);
  if (primary !== null) {
    if (primary.fromCookie) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(primary.values));
      } catch {
        // ignore
      }
    } else if (readRawCookie(toSidebarCookieName(storageKey)) === null) {
      writeSidebarCookie(storageKey, primary.values);
    }
    return primary.values;
  }

  for (const fallbackKey of fallbackKeys) {
    if (!fallbackKey || fallbackKey === storageKey) continue;
    const fallback = readSingleKeyFromStorageOrCookie(fallbackKey);
    if (fallback !== null) {
      writePersistedStringArray(storageKey, fallback.values);
      return fallback.values;
    }
  }

  return null;
}

/**
 * Persiste um conjunto/array de IDs simultaneamente em `localStorage` e em cookie de layout.
 * Preserva arrays vazios (`[]`) para distinguir "tudo expandido/desafixado" de "nunca configurado".
 */
export function writePersistedStringArray(storageKey: string, values: Iterable<string>): void {
  if (typeof window === 'undefined') return;
  const unique = Array.from(
    new Set(
      Array.from(values).filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      ),
    ),
  );
  const serialized = JSON.stringify(unique);
  try {
    window.localStorage.setItem(storageKey, serialized);
  } catch {
    // ignore localStorage write errors
  }
  writeSidebarCookie(storageKey, unique);
}
