import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SidebarNavGroup } from '../Sidebar.types';
import { resolveGroupId } from '../utils/navigation';
import { readPersistedStringArray, writePersistedStringArray } from '../utils/storage';

export function useSidebarGroups(
  groupsCollapsible: boolean,
  groupsStorageKey: string,
  groups: SidebarNavGroup[],
) {
  const defaultCollapsedIds = useMemo(
    () =>
      new Set(
        groups
          .filter((g) => Boolean(g.label) && g.defaultCollapsed)
          .map((g, index) => resolveGroupId(g, index)),
      ),
    [groups],
  );

  // `null` = user has not customized group collapse state yet (use defaultCollapsedIds)
  const [customCollapsedIds, setCustomCollapsedIds] = useState<Set<string> | null>(null);
  const customIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!groupsCollapsible) return;
    const timer = setTimeout(() => {
      const stored = readPersistedStringArray(groupsStorageKey);
      if (stored !== null) {
        const next = new Set(stored);
        customIdsRef.current = next;
        setCustomCollapsedIds(next);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [groupsCollapsible, groupsStorageKey]);

  const collapsedGroupIds = customCollapsedIds ?? defaultCollapsedIds;

  const commitCollapsedIds = useCallback(
    (next: Set<string>) => {
      customIdsRef.current = next;
      setCustomCollapsedIds(next);
      if (groupsCollapsible) {
        writePersistedStringArray(groupsStorageKey, next);
      }
    },
    [groupsCollapsible, groupsStorageKey],
  );

  const toggleGroup = useCallback(
    (id: string) => {
      const base = customIdsRef.current ?? defaultCollapsedIds;
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commitCollapsedIds(next);
    },
    [commitCollapsedIds, defaultCollapsedIds],
  );

  const allGroupIds = groups
    .filter((g) => Boolean(g.label) && (g.collapsible ?? groupsCollapsible) && g.items.length > 0)
    .map((g, index) => resolveGroupId(g, index));

  const allCollapsed =
    allGroupIds.length > 0 && allGroupIds.every((id) => collapsedGroupIds.has(id));

  const collapseAll = useCallback(() => {
    const ids = groups
      .filter((g) => Boolean(g.label) && (g.collapsible ?? groupsCollapsible))
      .map((g, index) => resolveGroupId(g, index));
    commitCollapsedIds(new Set(ids));
  }, [groups, groupsCollapsible, commitCollapsedIds]);

  const expandAll = useCallback(() => {
    commitCollapsedIds(new Set());
  }, [commitCollapsedIds]);

  const toggleAll = useCallback(() => {
    if (allCollapsed) {
      expandAll();
    } else {
      collapseAll();
    }
  }, [allCollapsed, expandAll, collapseAll]);

  return { collapsedGroupIds, toggleGroup, collapseAll, expandAll, toggleAll, allCollapsed };
}
