'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

export default function ProfileMenu({ componentId }: { compact?: boolean; componentId?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div
      className="relative"
      ref={ref}
      >
      <button
        data-component-id="erp.header.profile-menu"
        type="button"
        aria-label="Perfil"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-header-profile-trigger text-header-profile-trigger-foreground hover:bg-header-profile-trigger-hover"
      >
        <User size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-[var(--header-profile-menu-radius)] bg-header-profile-menu shadow-[var(--header-profile-menu-shadow)] border border-header-profile-menu-border py-2"></div>
      )}
    </div>
  );
}
