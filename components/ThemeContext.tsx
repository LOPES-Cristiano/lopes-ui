"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

type ThemeCtx = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => {
    listeners.delete(callback);
    mq.removeEventListener("change", callback);
  };
}

function getSnapshot(): Theme {
  const saved = localStorage.getItem("theme") as Theme | null;
  const sys: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return saved ?? sys;
}

function getServerSnapshot(): Theme {
  return "light";
}

function applyTheme(next: Theme): void {
  const el = document.documentElement;
  el.classList.add("no-transition");
  el.classList.toggle("dark", next === "dark");
  // Force reflow so the browser applies no-transition before any paint.
  void el.offsetHeight;
  try {
    localStorage.setItem("theme", next);
  } catch {}
  // flushSync forces React to commit all pending re-renders synchronously
  // before continuing — so React's DOM changes are included in the same
  // paint frame as the CSS class change, with no transitions.
  flushSync(() => {
    listeners.forEach((fn) => fn());
  });
  el.classList.remove("no-transition");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    applyTheme(getSnapshot() === "light" ? "dark" : "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
