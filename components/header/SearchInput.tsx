"use client";

import { Search } from "lucide-react";

export default function SearchInput({ className = "", componentId }: { className?: string; componentId?: string }) {
  return (
    <div className={"hidden md:flex items-center gap-2 " + className} {...(componentId ? { ['data-component-id']: componentId } : {})}>
      <div className="relative">
        <input
          aria-label="Buscar"
          placeholder="Buscar..."
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
      </div>
    </div>
  );
}
