import { useCallback, useEffect, useRef, useState } from 'react';
import { readPersistedStringArray, writePersistedStringArray } from '../utils/storage';

export function useSidebarSubmenus(submenusStorageKey: string, disabled = false) {
  const [openSubmenuIds, setOpenSubmenuIds] = useState<Set<string>>(() => new Set());
  const openIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (disabled || !submenusStorageKey) return;
    const timer = setTimeout(() => {
      const stored = readPersistedStringArray(submenusStorageKey);
      if (stored !== null) {
        const next = new Set(stored);
        openIdsRef.current = next;
        setOpenSubmenuIds(next);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [submenusStorageKey, disabled]);

  const setSubmenuOpen = useCallback(
    (id: string, open: boolean) => {
      if (!id) return;
      const current = openIdsRef.current;
      if (current.has(id) === open) return;
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      openIdsRef.current = next;
      setOpenSubmenuIds(next);
      if (!disabled && submenusStorageKey) {
        writePersistedStringArray(submenusStorageKey, next);
      }
    },
    [submenusStorageKey, disabled],
  );

  const toggleSubmenu = useCallback(
    (id: string) => {
      if (!id) return;
      setSubmenuOpen(id, !openIdsRef.current.has(id));
    },
    [setSubmenuOpen],
  );

  return { openSubmenuIds, setSubmenuOpen, toggleSubmenu };
}
