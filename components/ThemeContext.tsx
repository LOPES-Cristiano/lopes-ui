'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeCtx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // Carrega do localStorage ou preferência do SO na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
        document.documentElement.classList.toggle('dark', saved === 'dark');
      } else {
        const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = sysDark ? 'dark' : 'light';
        setThemeState(initial);
        document.documentElement.classList.toggle('dark', sysDark);
      }
    } catch {
      /* fallback silencioso */
    }
  }, []);

  const updateTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* silencioso */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
  }, []);

  const toggle = useCallback(() => {
    updateTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, updateTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
