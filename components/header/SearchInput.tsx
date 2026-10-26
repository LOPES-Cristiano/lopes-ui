"use client";

import { Search } from "lucide-react";

export default function SearchInput({ className = "", componentId }: { className?: string; componentId?: string }) {
  return (
    <div className={"hidden md:flex items-center gap-2 " + className} >
      <div className="relative">
        <input
          data-component-id="erp.header.search-input"
          aria-label="Buscar"
          placeholder="Buscar..."
          className="rounded-md border border-header-command-border bg-header-command px-3 py-1.5 text-sm text-header-command-foreground placeholder-header-command-placeholder focus:outline-none focus:ring-1 focus:ring-header-ring"
        />
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-header-command-placeholder" size={16} />
      </div>
    </div>
  );
}
