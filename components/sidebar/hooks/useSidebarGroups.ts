import { useCallback, useEffect, useRef, useState } from 'react';
import type { SidebarNavGroup } from '../Sidebar.types';
import { resolveGroupId } from '../utils/navigation';
import { safeParseStringArray } from '../utils/storage';

export function useSidebarGroups(
  groupsCollapsible: boolean,
  groupsStorageKey: string,
  groups: SidebarNavGroup[],
) {
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(
    () =>
      new Set(
        groups
          .filter((g) => Boolean(g.label) && g.defaultCollapsed)
          .map((g, index) => resolveGroupId(g, index)),
      ),
  );

  const isHydratedRef = useRef(false);

  // Hydrate once on mount or when storage key changes
  useEffect(() => {
    if (!groupsCollapsible) return;
    try {
      const stored = localStorage.getItem(groupsStorageKey);
      const validIds = safeParseStringArray(stored);
      if (validIds.length > 0) {
        const availableGroupIds = new Set(
          groups
            .filter((g) => Boolean(g.label) && g.collapsible !== false)
            .map((g, index) => resolveGroupId(g, index)),
        );
        const filtered = validIds.filter((id) => availableGroupIds.has(id));
        setCollapsedGroupIds(new Set(filtered));
      }
    } catch {
      // ignore
    } finally {
      isHydratedRef.current = true;
    }
    // Only run on mount / when key changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsCollapsible, groupsStorageKey]);

  // Persist changes to localStorage once hydrated
  useEffect(() => {
    if (!groupsCollapsible || !isHydratedRef.current) return;
    try {
      if (collapsedGroupIds.size > 0) {
        localStorage.setItem(groupsStorageKey, JSON.stringify([...collapsedGroupIds]));
      } else {
        localStorage.removeItem(groupsStorageKey);
      }
    } catch {}
  }, [collapsedGroupIds, groupsCollapsible, groupsStorageKey]);

  const toggleGroup = useCallback((id: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allGroupIds = groups
    .filter((g) => Boolean(g.label) && (g.collapsible ?? groupsCollapsible) && g.items.length > 0)
    .map((g, index) => resolveGroupId(g, index));

  const allCollapsed = allGroupIds.length > 0 && allGroupIds.every((id) => collapsedGroupIds.has(id));

  const collapseAll = useCallback(() => {
    const ids = groups
      .filter((g) => Boolean(g.label) && (g.collapsible ?? groupsCollapsible))
      .map((g, index) => resolveGroupId(g, index));
    setCollapsedGroupIds(new Set(ids));
  }, [groups, groupsCollapsible]);

  const expandAll = useCallback(() => {
    setCollapsedGroupIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (allCollapsed) {
      expandAll();
    } else {
      collapseAll();
    }
  }, [allCollapsed, expandAll, collapseAll]);

  return { collapsedGroupIds, toggleGroup, collapseAll, expandAll, toggleAll, allCollapsed };
}
