import { useCallback, useEffect, useRef, useState } from 'react';
import type { SidebarNavGroup } from '../Sidebar.types';
import { flattenNavItems, getItemPinId } from '../utils/navigation';
import { safeParseStringArray } from '../utils/storage';

export function useSidebarPins(
  pinnable: boolean,
  pinsStorageKey: string,
  groups: SidebarNavGroup[],
) {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const isHydratedRef = useRef(false);

  // Hydrate safely from localStorage once on mount or key change
  useEffect(() => {
    if (!pinnable) return;
    try {
      const stored = localStorage.getItem(pinsStorageKey);
      const validIds = safeParseStringArray(stored);
      if (validIds.length > 0) {
        // Intersect with currently available items
        const allItems = flattenNavItems(groups);
        const availablePinIds = new Set(allItems.map(getItemPinId));
        const filtered = validIds.filter((id) => availablePinIds.has(id));
        if (filtered.length > 0) {
          setPinnedIds(new Set(filtered));
        }
      }
    } catch {
      // ignore
    } finally {
      isHydratedRef.current = true;
    }
    // Only run on mount / when key changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnable, pinsStorageKey]);

  // Persist changes to localStorage once hydrated
  useEffect(() => {
    if (!pinnable || !isHydratedRef.current) return;
    try {
      if (pinnedIds.size > 0) {
        localStorage.setItem(pinsStorageKey, JSON.stringify([...pinnedIds]));
      } else {
        localStorage.removeItem(pinsStorageKey);
      }
    } catch {}
  }, [pinnedIds, pinsStorageKey, pinnable]);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { pinnedIds, togglePin };
}
