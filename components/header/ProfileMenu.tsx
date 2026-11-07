'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';
import { useAccessControl } from '../useAccessControl';

export interface ProfileMenuProps {
  compact?: boolean;
  componentId?: string;
  hideIfDenied?: boolean;
  children?: React.ReactNode;
}

export default function ProfileMenu({
  componentId,
  hideIfDenied = true,
  children,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        data-component-id={componentId ?? 'erp.header.profile-menu'}
        type="button"
        disabled={!hasPermission}
        aria-label="Perfil"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-header-profile-trigger text-header-profile-trigger-foreground hover:bg-header-profile-trigger-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <User size={16} />
      </button>

      {open && (
        <div
          role="menu"
          data-floating-open="true"
          className="absolute right-0 z-[9200] mt-2 min-w-52 rounded-[var(--header-profile-menu-radius)] bg-header-profile-menu shadow-[var(--header-profile-menu-shadow)] border border-header-profile-menu-border py-2"
        >
          {children}
        </div>
      )}
    </div>
  );
}
