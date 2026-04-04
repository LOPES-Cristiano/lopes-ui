"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from "react";

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
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("theme", next);
  } catch {}
  listeners.forEach((fn) => fn());
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
