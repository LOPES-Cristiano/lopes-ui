'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

export type ResolvedTheme = 'light' | 'dark';
export type ThemeMode = ResolvedTheme | 'system';

export type ThemeCtx = {
  /** Resolved active visual theme ('light' | 'dark') */
  theme: ResolvedTheme;
  /** Stored user preference ('light' | 'dark' | 'system') */
  mode: ThemeMode;
  /** Toggles between 'light' and 'dark' */
  toggle: () => void;
  /** Sets 'light', 'dark', or 'system' */
  setTheme: (next: ThemeMode) => void;
};

const STORAGE_KEY = 'theme';

let currentMode: ThemeMode = 'system';
let currentResolved: ResolvedTheme = 'light';
let storeInitialized = false;
const listeners = new Set<() => void>();

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
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      currentMode = saved;
    } else {
      currentMode = 'system';
    }
  } catch {
    currentMode = 'system';
  }
  currentResolved = document.documentElement.classList.contains('dark')
    ? 'dark'
    : resolveMode(currentMode);
  document.documentElement.classList.toggle('dark', currentResolved === 'dark');
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

function applyThemeTransitionFree(nextMode: ThemeMode, persist = true) {
  currentMode = nextMode;
  const nextResolved = resolveMode(nextMode);
  currentResolved = nextResolved;

  if (typeof document === 'undefined') return;
  const el = document.documentElement;

  el.classList.add('no-transition');
  el.classList.toggle('dark', nextResolved === 'dark');
  // Force synchronous reflow so .no-transition takes effect before paint
  void el.offsetHeight;

  if (persist) {
    try {
      if (nextMode === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, nextMode);
      }
    } catch {
      /* ignore storage errors */
    }
  }

  notifyListenersSync();
  el.classList.remove('no-transition');
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

export function setTheme(next: ThemeMode): void {
  applyThemeTransitionFree(next, true);
}

export function toggleTheme(): void {
  initStoreOnClient();
  applyThemeTransitionFree(currentResolved === 'light' ? 'dark' : 'light', true);
}

const ThemeContext = createContext<ThemeCtx | null>(null);

/**
 * Inline blocking `<script>` for Next.js `<head>` to prevent dark-mode FOUC on SSR reload.
 */
export function ThemeScript({ storageKey = STORAGE_KEY }: { storageKey?: string }) {
  const code = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
    storageKey
  )});var d=s==='dark'||((!s||s==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    initStoreOnClient();
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (currentMode === 'system') {
        applyThemeTransitionFree('system', false);
      }
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const value = React.useMemo<ThemeCtx>(
    () => ({
      theme: snap.theme,
      mode: snap.mode,
      toggle: toggleTheme,
      setTheme,
    }),
    [snap.theme, snap.mode]
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
