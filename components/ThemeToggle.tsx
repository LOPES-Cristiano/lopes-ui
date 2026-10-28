'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { cn } from '@/utils/cn';

export type ThemeToggleProps = {
  className?: string;
  size?: number;
  componentId?: string;
};

export default function ThemeToggle({ className, size = 19, componentId }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();

  return (
    <button
      {...(componentId ? { 'data-component-id': componentId } : {})}
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className={cn(
        'group relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-150 cursor-pointer',
        'bg-header-theme text-header-theme-foreground hover:bg-header-theme-hover hover:text-header-theme-hover-foreground',
        className
      )}
    >
      {theme === 'dark' ? (
        <>
          <Sun
            size={size}
            className="stroke-[1.75] transition-all duration-200 group-hover:scale-0 group-hover:opacity-0 group-hover:rotate-90 text-amber-400"
          />
          <Moon
            size={size}
            className="stroke-[1.75] absolute transition-all duration-200 scale-0 opacity-0 -rotate-90 group-hover:scale-100 group-hover:opacity-100 group-hover:rotate-0 text-current"
          />
        </>
      ) : (
        <>
          <Moon
            size={size}
            className="stroke-[1.75] transition-all duration-200 group-hover:scale-0 group-hover:opacity-0 group-hover:-rotate-90 text-current"
          />
          <Sun
            size={size}
            className="stroke-[1.75] absolute transition-all duration-200 scale-0 opacity-0 rotate-90 group-hover:scale-100 group-hover:opacity-100 group-hover:rotate-0 text-amber-500"
          />
        </>
      )}
    </button>
  );
}
