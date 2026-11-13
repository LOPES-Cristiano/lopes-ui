'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

export type ResolvedTheme = 'light' | 'dark';
export type Theme = ResolvedTheme;
export type ThemeMode = ResolvedTheme | 'system';

export type ThemeCtx = {
  /** Resolved active visual theme ('light' | 'dark') */
  theme: ResolvedTheme;
  /** Stored user preference ('light' | 'dark' | 'system') */
  mode: ThemeMode;
  /** Toggles between 'light' and 'dark' */
  toggle: () => void;
  /** Sets 'light', 'dark', or 'system' */
  setTheme: (next: ThemeMode, options?: { syncBackend?: boolean }) => void;
};

export const THEME_USER_CHANGE_EVENT = 'biglar:theme-user-change';

const STORAGE_KEY = 'theme';
const THEME_COOKIE = 'biglar_theme';
const THEME_UID_COOKIE = 'biglar_theme_uid';
const THEME_PENDING_COOKIE = 'biglar_theme_pending_sync';
const BROADCAST_CHANNEL_NAME = 'biglar_theme_sync_channel';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

let currentMode: ThemeMode = 'system';
let currentResolved: ResolvedTheme = 'light';
let storeInitialized = false;
let lastUserThemeWriteAt = 0;
const listeners = new Set<() => void>();

let themeChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    themeChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {
    themeChannel = null;
  }
}

function isValidThemeMode(val: unknown): val is ThemeMode {
  return val === 'light' || val === 'dark' || val === 'system';
}

function resolveSharedCookieDomain(hostname: string): string | null {
  const host = hostname.trim().toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.run.app') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.netlify.app') ||
    host.endsWith('.pages.dev') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.includes(':')
  ) {
    return null;
  }

  const parts = host.split('.').filter(Boolean);
  if (parts.length < 2) return null;

  const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  const isMultiPartCountryTld = /^(com|net|org|gov|edu|ind|emp|srv|agr)\.br$/.test(lastTwo);
  if (isMultiPartCountryTld) {
    if (parts.length < 3) return null;
    return `.${parts.slice(-3).join('.')}`;
  }

  return `.${parts.slice(-2).join('.')}`;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const prefix = `${name}=`;
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

function writeSharedCookie(name: string, value: string | null): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    const sharedDomain = resolveSharedCookieDomain(window.location.hostname);
    const secureFlag = window.location.protocol === 'https:' ? ';secure' : '';

    if (value === null) {
      document.cookie = `${name}=;path=/;max-age=0;samesite=lax${secureFlag}`;
      if (sharedDomain) {
        document.cookie = `${name}=;path=/;domain=${sharedDomain};max-age=0;samesite=lax${secureFlag}`;
      }
      return;
    }

    const encoded = encodeURIComponent(value);
    if (sharedDomain) {
      document.cookie = `${name}=${encoded};path=/;domain=${sharedDomain};max-age=${ONE_YEAR_SECONDS};samesite=lax${secureFlag}`;
      if (readCookie(name) === value) {
        return;
      }
    }
    document.cookie = `${name}=${encoded};path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax${secureFlag}`;
  } catch {
    // ignore cookie write errors
  }
}

function readThemeCookie(): ThemeMode | null {
  const val = readCookie(THEME_COOKIE);
  return isValidThemeMode(val) ? val : null;
}

function readLocalStorageMode(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    return isValidThemeMode(val) ? val : null;
  } catch {
    return null;
  }
}

function writeLocalStorageMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

function initStoreOnClient() {
  if (storeInitialized || typeof window === 'undefined') return;
  storeInitialized = true;

  const cookieMode = readThemeCookie();
  const storageMode = readLocalStorageMode();

  if (cookieMode) {
    currentMode = cookieMode;
    if (storageMode !== cookieMode) {
      writeLocalStorageMode(cookieMode);
    }
  } else if (storageMode) {
    currentMode = storageMode;
    writeSharedCookie(THEME_COOKIE, storageMode);
  } else {
    currentMode = 'system';
  }

  currentResolved = resolveMode(currentMode);
  const el = document.documentElement;
  el.classList.toggle('dark', currentResolved === 'dark');
  el.style.colorScheme = currentResolved;
}

function notifyListenersSync() {
  try {
    flushSync(() => {
      listeners.forEach((fn) => fn());
    });
  } catch {
    // Fallback if called during an active React render/commit
    listeners.forEach((fn) => fn());
  }
}

function applyThemeTransitionFree(
  nextMode: ThemeMode,
  options: { persist?: boolean; notifyUserChange?: boolean } = {},
) {
  const { persist = true, notifyUserChange = false } = options;
  currentMode = nextMode;
  const nextResolved = resolveMode(nextMode);
  currentResolved = nextResolved;

  if (typeof document === 'undefined') return;
  const el = document.documentElement;

  el.classList.add('no-transition');
  el.classList.toggle('dark', nextResolved === 'dark');
  el.style.colorScheme = nextResolved;
  // Force synchronous reflow so .no-transition takes effect before paint
  void el.offsetHeight;

  if (persist) {
    writeLocalStorageMode(nextMode);
    writeSharedCookie(THEME_COOKIE, nextMode);
    try {
      themeChannel?.postMessage({ mode: nextMode });
    } catch {
      // ignore broadcast errors
    }
  }

  if (notifyUserChange && typeof window !== 'undefined') {
    lastUserThemeWriteAt = Date.now();
    writeSharedCookie(THEME_PENDING_COOKIE, '1');
    window.dispatchEvent(
      new CustomEvent<{ mode: ThemeMode }>(THEME_USER_CHANGE_EVENT, {
        detail: { mode: nextMode },
      }),
    );
  }

  notifyListenersSync();
  void el.offsetHeight;
  el.classList.remove('no-transition');
}

/**
 * Marca que o tema atual já foi persistido no backend para o usuário informado.
 */
export function markThemeSyncedForUser(userId: string): void {
  if (!userId) return;
  writeSharedCookie(THEME_UID_COOKIE, userId);
  writeSharedCookie(THEME_PENDING_COOKIE, null);
}

/**
 * Hidrata/sincroniza o tema do usuário autenticado de forma segura entre apps/terminais.
 * Retorna o `ThemeMode` local quando ele deve ser enviado ao backend (`PUT /api/usuario/perfil`),
 * ou `null` quando nenhuma escrita no backend é necessária.
 */
export function syncThemeFromUser(
  userId: string | number | null | undefined,
  backendTema?: string | null,
): ThemeMode | null {
  if (typeof window === 'undefined' || userId == null) return null;
  const uid = String(userId).trim();
  if (!uid) return null;

  initStoreOnClient();

  const backendMode: ThemeMode | null = isValidThemeMode(backendTema) ? backendTema : null;
  const cookieUid = readCookie(THEME_UID_COOKIE);
  const cookieMode = readThemeCookie();
  const pendingSync = readCookie(THEME_PENDING_COOKIE) === '1';

  if (cookieUid && cookieUid !== uid) {
    const target = backendMode ?? 'system';
    writeSharedCookie(THEME_UID_COOKIE, uid);
    writeSharedCookie(THEME_PENDING_COOKIE, null);
    if (target !== currentMode || resolveMode(target) !== currentResolved) {
      applyThemeTransitionFree(target, { persist: true, notifyUserChange: false });
    }
    return null;
  }

  if (pendingSync) {
    writeSharedCookie(THEME_UID_COOKIE, uid);
    writeSharedCookie(THEME_PENDING_COOKIE, null);
    if (backendMode !== currentMode) {
      return currentMode;
    }
    return null;
  }

  if (!cookieUid) {
    writeSharedCookie(THEME_UID_COOKIE, uid);
    if (cookieMode && cookieMode !== 'system' && (!backendMode || backendMode === 'system')) {
      return cookieMode;
    }
    if (backendMode && backendMode !== currentMode) {
      applyThemeTransitionFree(backendMode, { persist: true, notifyUserChange: false });
    }
    return null;
  }

  if (Date.now() - lastUserThemeWriteAt < 10_000) {
    return null;
  }

  if (backendMode && backendMode !== currentMode) {
    applyThemeTransitionFree(backendMode, { persist: true, notifyUserChange: false });
  }

  return null;
}

function subscribe(listener: () => void) {
  initStoreOnClient();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let cachedSnapshot: { theme: ResolvedTheme; mode: ThemeMode } = {
  theme: 'light',
  mode: 'system',
};

function getClientSnapshot() {
  initStoreOnClient();
  if (cachedSnapshot.theme !== currentResolved || cachedSnapshot.mode !== currentMode) {
    cachedSnapshot = { theme: currentResolved, mode: currentMode };
  }
  return cachedSnapshot;
}

const SERVER_SNAPSHOT: { theme: ResolvedTheme; mode: ThemeMode } = {
  theme: 'light',
  mode: 'system',
};

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function setTheme(next: ThemeMode, options?: { syncBackend?: boolean }): void {
  initStoreOnClient();
  applyThemeTransitionFree(next, {
    persist: true,
    notifyUserChange: options?.syncBackend ?? true,
  });
}

export function toggleTheme(): void {
  initStoreOnClient();
  applyThemeTransitionFree(currentResolved === 'light' ? 'dark' : 'light', {
    persist: true,
    notifyUserChange: true,
  });
}

const ThemeContext = createContext<ThemeCtx | null>(null);

/**
 * Inline blocking `<script>` for Next.js `<head>` to prevent dark-mode FOUC on SSR reload.
 */
export function ThemeScript({ storageKey = STORAGE_KEY }: { storageKey?: string }) {
  const keyJson = JSON.stringify(storageKey);
  const code = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)biglar_theme=(light|dark|system)(?:;|$)/);var c=m?m[1]:null;var s=c||localStorage.getItem(${keyJson});if(c)try{localStorage.setItem(${keyJson},c);}catch(e){}var d=s==='dark'||((!s||s==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var el=document.documentElement;el.classList.toggle('dark',d);el.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    initStoreOnClient();
    if (typeof window === 'undefined') return;

    const mql =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    const onMediaChange = () => {
      if (currentMode === 'system') {
        applyThemeTransitionFree('system', { persist: false, notifyUserChange: false });
      }
    };

    const syncFromExternal = () => {
      const external = readThemeCookie() ?? readLocalStorageMode();
      if (external && external !== currentMode) {
        writeLocalStorageMode(external);
        applyThemeTransitionFree(external, { persist: false, notifyUserChange: false });
      } else if (currentMode === 'system') {
        const resolved = resolveMode('system');
        if (resolved !== currentResolved) {
          applyThemeTransitionFree('system', { persist: false, notifyUserChange: false });
        }
      }
    };

    const onStorageChange = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      const next: ThemeMode = isValidThemeMode(e.newValue)
        ? e.newValue
        : (readThemeCookie() ?? 'system');
      if (next !== currentMode) {
        applyThemeTransitionFree(next, { persist: false, notifyUserChange: false });
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFromExternal();
      }
    };

    const onBroadcastMessage = (event: MessageEvent) => {
      const mode = (event.data as { mode?: unknown } | null)?.mode;
      if (isValidThemeMode(mode) && mode !== currentMode) {
        writeLocalStorageMode(mode);
        applyThemeTransitionFree(mode, { persist: false, notifyUserChange: false });
      }
    };

    mql?.addEventListener('change', onMediaChange);
    window.addEventListener('storage', onStorageChange);
    window.addEventListener('focus', syncFromExternal);
    window.addEventListener('pageshow', syncFromExternal);
    document.addEventListener('visibilitychange', onVisibilityChange);
    themeChannel?.addEventListener('message', onBroadcastMessage);

    return () => {
      mql?.removeEventListener('change', onMediaChange);
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('focus', syncFromExternal);
      window.removeEventListener('pageshow', syncFromExternal);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      themeChannel?.removeEventListener('message', onBroadcastMessage);
    };
  }, []);

  const value = React.useMemo<ThemeCtx>(
    () => ({
      theme: snap.theme,
      mode: snap.mode,
      toggle: toggleTheme,
      setTheme,
    }),
    [snap.theme, snap.mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  const snap = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  if (ctx) return ctx;
  return {
    theme: snap.theme,
    mode: snap.mode,
    toggle: toggleTheme,
    setTheme,
  };
}
