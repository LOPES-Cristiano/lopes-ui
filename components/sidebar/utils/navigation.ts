import type { SidebarNavGroup, SidebarNavItem } from '../Sidebar.types';

export function getItemPinId(item: SidebarNavItem): string {
  return (item.id ?? item.href ?? item.label) as string;
}

export function flattenNavItems(groups: SidebarNavGroup[]): SidebarNavItem[] {
  const result: SidebarNavItem[] = [];
  const walk = (items: SidebarNavItem[]) => {
    for (const item of items) {
      if (!item.divider) result.push(item);
      if (item.children) walk(item.children);
    }
  };
  for (const g of groups) walk(g.items);
  return result;
}

export function hasActiveDescendant(item: SidebarNavItem): boolean {
  return Boolean(item.active || item.children?.some(hasActiveDescendant));
}

export function resolveGroupId(group: SidebarNavGroup, index: number): string {
  return group.id ?? (group.label ? `grp-${group.label}` : undefined) ?? `group-${index}`;
}
