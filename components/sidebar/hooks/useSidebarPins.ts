import { useCallback, useEffect, useRef, useState } from 'react';
import { readPersistedStringArray, writePersistedStringArray } from '../utils/storage';

export function useSidebarPins(
  pinnable: boolean,
  pinsStorageKey: string,
) {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());
  const pinnedIdsRef = useRef<Set<string>>(new Set());

  // Hydrate safely from localStorage / cookie without destructively stripping async items
  useEffect(() => {
    if (!pinnable) return;
    const timer = setTimeout(() => {
      const fallbackKeys = pinsStorageKey !== 'sidebar-pins' ? ['sidebar-pins'] : [];
      const stored = readPersistedStringArray(pinsStorageKey, fallbackKeys);
      if (stored !== null) {
        const next = new Set(stored);
        pinnedIdsRef.current = next;
        setPinnedIds(next);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pinnable, pinsStorageKey]);

  const togglePin = useCallback(
    (id: string) => {
      const next = new Set(pinnedIdsRef.current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      pinnedIdsRef.current = next;
      setPinnedIds(next);
      if (pinnable) {
        writePersistedStringArray(pinsStorageKey, next);
      }
    },
    [pinnable, pinsStorageKey],
  );

  return { pinnedIds, togglePin };
}
