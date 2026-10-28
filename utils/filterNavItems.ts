/**
 * Recursively filters navigation item trees based on an access check function.
 *
 * Rules:
 * - Items without `componentId` always pass (opt-in model).
 * - Items with `componentId` are shown only if `canAccess(componentId)` returns true.
 * - Supports BOTH pure standalone separator items (`{ divider: true }`) AND
 *   actionable navigation items decorated with `divider: true` (top/bottom visual border).
 * - If a parent's `componentId` fails, the entire subtree is hidden.
 * - If a parent passes (or has no `componentId`) but all its children are filtered
 *   out AND it has no direct `href`/`onClick`, the parent is also hidden (empty container).
 * - Orphaned leading/trailing/consecutive *pure* dividers are cleaned up automatically.
 */

type FilterableItem<T> = T & {
  componentId?: string;
  label?: string;
  href?: string;
  onClick?: unknown;
  divider?: boolean;
  children?: T[];
};

function isPureDivider<T extends object>(item: FilterableItem<T>): boolean {
  if (!item.divider) return false;
  const hasLabel = typeof item.label === "string" && item.label.trim().length > 0;
  const hasTarget = Boolean(item.href || item.onClick || (item.children && item.children.length > 0));
  return !hasLabel && !hasTarget;
}

export function filterNavItems<T extends object>(
  items: FilterableItem<T>[],
  canAccess: (componentId: string) => boolean,
): FilterableItem<T>[] {
  const result: FilterableItem<T>[] = [];

  for (const item of items) {
    // Always enforce RBAC first — even on items decorated with `divider: true`.
    if (item.componentId && !canAccess(item.componentId)) continue;

    if (isPureDivider(item)) {
      result.push(item);
      continue;
    }

    if (item.children?.length) {
      const filteredChildren = filterNavItems(item.children as FilterableItem<T>[], canAccess);
      // Empty container with no direct navigation target → hide.
      if (filteredChildren.length === 0 && !item.href && !item.onClick) continue;
      result.push({ ...item, children: filteredChildren } as FilterableItem<T>);
    } else {
      result.push(item);
    }
  }

  // Remove orphaned *pure* dividers (leading, trailing, consecutive) without ever deleting real nav items.
  return result.filter((item, i, arr) => {
    if (!isPureDivider(item)) return true;
    const prev = arr[i - 1];
    const next = arr[i + 1];
    if (!prev || !next) return false;
    if (isPureDivider(prev)) return false;
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
