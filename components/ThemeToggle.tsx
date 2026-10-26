'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { twMerge } from 'tailwind-merge';

export type ThemeToggleProps = {
  className?: string;
  size?: number;
};

export default function ThemeToggle({ className, size = 19 }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();

  return (
    <button
      data-component-id="erp.theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className={twMerge(
        'group relative flex h-9 w-9 items-center justify-center rounded-xl bg-transparent transition-all duration-200 cursor-pointer',
        // Mobile (header azul): texto/ícone branco com hover translúcido
        'text-white hover:text-white hover:bg-white/15',
        // Desktop (header claro): texto/ícone escuro no modo claro
        'md:text-slate-700 md:hover:text-slate-900 md:hover:bg-slate-100',
        // Modo escuro (mobile e desktop): ícone claro
        'dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800/60',
        'md:dark:text-slate-200 md:dark:hover:text-white md:dark:hover:bg-slate-800/60',
        className
      )}
    >
      {theme === 'dark' ? (
        <>
          <Sun
            size={size}
            className="stroke-[1.75] transition-all duration-300 group-hover:scale-0 group-hover:opacity-0 group-hover:rotate-90 text-amber-400"
          />
          <Moon
            size={size}
            className="stroke-[1.75] absolute transition-all duration-300 scale-0 opacity-0 -rotate-90 group-hover:scale-100 group-hover:opacity-100 group-hover:rotate-0 text-slate-200"
          />
        </>
      ) : (
        <>
          <Moon
            size={size}
            className="stroke-[1.75] transition-all duration-300 group-hover:scale-0 group-hover:opacity-0 group-hover:-rotate-90 text-white md:text-slate-700 dark:text-slate-200"
          />
          <Sun
            size={size}
            className="stroke-[1.75] absolute transition-all duration-300 scale-0 opacity-0 rotate-90 group-hover:scale-100 group-hover:opacity-100 group-hover:rotate-0 text-amber-300 md:text-amber-500"
          />
        </>
      )}
    </button>
  );
}
