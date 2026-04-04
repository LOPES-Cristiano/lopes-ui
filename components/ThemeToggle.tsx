"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
        "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
      ].join(" ")}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
