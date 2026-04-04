"use client";

import React, { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";

export default function ProfileMenu({
  componentId,
}: {
  compact?: boolean;
  componentId?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref} {...(componentId ? { ['data-component-id']: componentId } : {})}>
      <button
        aria-label="Perfil"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      >
        <User size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-lg bg-white shadow-lg border border-zinc-100 py-2">
          <a href="#" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Profile</a>
          <a href="#" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Settings</a>
          <a href="#" className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Sign out</a>
        </div>
      )}
    </div>
  );
}
