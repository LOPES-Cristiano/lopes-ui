/**
 * Recursively filters navigation item trees based on an access check function.
 *
 * Rules:
 * - Items without `componentId` always pass (opt-in model).
 * - Items with `componentId` are shown only if `canAccess(componentId)` returns true.
 * - If a parent's `componentId` fails, the entire subtree is hidden.
 * - If a parent passes (or has no `componentId`) but all its children are filtered
 *   out AND it has no direct `href`, the parent is also hidden (empty container).
 * - Orphaned leading/trailing/consecutive dividers are cleaned up automatically.
 */

type FilterableItem<T> = T & {
  componentId?: string;
  href?: string;
  divider?: boolean;
  children?: T[];
};

export function filterNavItems<T extends object>(
  items: FilterableItem<T>[],
  canAccess: (componentId: string) => boolean,
): FilterableItem<T>[] {
  const result: FilterableItem<T>[] = [];

  for (const item of items) {
    // Always keep dividers for now; cleaned up below.
    if (item.divider) {
      result.push(item);
      continue;
    }

    // If item has a componentId and access is denied, skip it (and its subtree).
    if (item.componentId && !canAccess(item.componentId)) continue;

    if (item.children?.length) {
      const filteredChildren = filterNavItems(item.children as FilterableItem<T>[], canAccess);
      // Empty container with no direct navigation target → hide.
      if (filteredChildren.length === 0 && !item.href) continue;
      result.push({ ...item, children: filteredChildren } as FilterableItem<T>);
    } else {
      result.push(item);
    }
  }

  // Remove orphaned dividers (leading, trailing, consecutive).
  return result.filter((item, i, arr) => {
    if (!item.divider) return true;
    const prev = arr[i - 1];
    const next = arr[i + 1];
    if (!prev || !next) return false;       // leading or trailing
    if (prev.divider) return false;         // consecutive
    return true;
  });
}

export function filterNavGroups<
  T extends object,
  G extends { items: FilterableItem<T>[] },
>(
  groups: G[],
  canAccess: (componentId: string) => boolean,
): G[] {
  return groups
    .map((g) => ({ ...g, items: filterNavItems(g.items, canAccess) }))
    .filter((g) => g.items.length > 0);
}
