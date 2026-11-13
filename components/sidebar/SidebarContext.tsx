'use client';

import { createContext, useContext } from 'react';
import type { SidebarCollapsedGroupMode, SidebarMode } from './Sidebar.types';

export type SidebarContextValue = {
  collapsed: boolean;
  isHovered: boolean;
  visuallyCollapsed: boolean;
  effectiveCollapsed: boolean;
  mode: SidebarMode;
  pinnable: boolean;
  pinnedIds: Set<string>;
  groupsCollapsible: boolean;
  collapsedGroupIds: Set<string>;
  collapsedGroupMode: SidebarCollapsedGroupMode;
  allGroupsCollapsed: boolean;
  openSubmenuIds: Set<string>;
  setSubmenuOpen: (id: string, open: boolean) => void;
  toggleSubmenu: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCollapsed: (value: boolean) => void;
  togglePin: (id: string) => void;
  toggleGroup: (id: string) => void;
  collapseAllGroups: () => void;
  expandAllGroups: () => void;
  toggleAllGroups: () => void;
  handleNavigate: (href: string) => void;
  closeMobile: () => void;
  /** Quando false, ícones dos itens de navegação são ocultos */
  showItemIcons: boolean;
};

export const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  isHovered: false,
  visuallyCollapsed: false,
  effectiveCollapsed: false,
  mode: 'expanded',
  pinnable: false,
  pinnedIds: new Set(),
  groupsCollapsible: false,
  collapsedGroupIds: new Set(),
  collapsedGroupMode: 'flatten-items',
  allGroupsCollapsed: false,
  openSubmenuIds: new Set(),
  setSubmenuOpen: () => {},
  toggleSubmenu: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  setCollapsed: () => {},
  togglePin: () => {},
  toggleGroup: () => {},
  collapseAllGroups: () => {},
  expandAllGroups: () => {},
  toggleAllGroups: () => {},
  handleNavigate: () => {},
  closeMobile: () => {},
  showItemIcons: true,
});

export const useSidebar = () => useContext(SidebarContext);
