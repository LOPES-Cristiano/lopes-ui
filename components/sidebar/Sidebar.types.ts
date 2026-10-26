import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export type SidebarMode = 'expanded' | 'collapsed' | 'peek';

export type SidebarNavItem = {
  id?: string;
  /** Identifier for access control (emitted as data-component-id) */
  componentId?: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  disabled?: boolean;
  active?: boolean;
  divider?: boolean;
  children?: SidebarNavItem[];
  onClick?: () => void;
};

export type SidebarNavGroup = {
  id?: string;
  /** Título do grupo (hidden quando collapsed) */
  label?: string;
  /** Ícone exibido ao lado do label do grupo */
  icon?: LucideIcon;
  /** Permite recolher o grupo clicando no label */
  collapsible?: boolean;
  /** Marca se por padrão a sidebar vai iniciar colapsada */
  defaultCollapsed?: boolean;
  /** Linha divisória antes do grupo */
  divider?: boolean;
  /** Lista de itens da sidebar */
  items: SidebarNavItem[];
};

export type SidebarAnnouncement = {
  id: string;
  title?: string;
  body: string;
  variant?: 'info' | 'warning' | 'success' | 'danger' | 'neutral';
  palette?: {
    background?: string;
    border?: string;
    accent?: string;
    title?: string;
    body?: string;
    time?: string;
    action?: string;
    close?: string;
    iconBackground?: string;
    iconForeground?: string;
    iconBorder?: string;
  };
  icon?: LucideIcon;
  timestamp?: string;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
};

export type SidebarUser = {
  name: string;
  email?: string;
  avatar?: string;
  /** Ex: "CL" — exibido quando não há avatar */
  initials?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  role?: string;
};

export type SidebarFooterItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  /** Identifier for access control (emitted as data-component-id) */
  componentId?: string;
};

export type SidebarToolbarAction = {
  id: string;
  componentId?: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
};

export type SidebarProps = {
  // ── Toolbar
  /** Show toolbar with collapse/expand all, refresh, search, etc. (default: true) */
  showToolbar?: boolean;
  /** Custom action buttons to display on the toolbar */
  toolbarActions?: SidebarToolbarAction[];
  /** Callback to trigger refresh/reload of sidebar data or state */
  onRefresh?: () => void | Promise<void>;
  /** Callback when the Home / Início button is clicked */
  onHome?: () => void;
  /** Quick action callback for creating a new item */
  onAddItem?: () => void;
  /** Quick action callback for creating a new group */
  onAddGroup?: () => void;
  /** Placeholder for search input (default: "Buscar...") */
  searchPlaceholder?: string;
  // ── Pins
  /** Allow users to pin nav items to the top Fixados section */
  pinnable?: boolean;
  /** localStorage key for persisted pins (default: "sidebar-pins") */
  pinsStorageKey?: string;
  // ── Header
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerExtra?: React.ReactNode;
  // ── Announcements / avisos
  announcements?: SidebarAnnouncement[];
  onAnnouncementDismiss?: (id: string) => void;
  dismissedAnnouncementIds?: string[];
  // ── Navigation
  groups?: SidebarNavGroup[];
  groupsCollapsible?: boolean;
  groupsStorageKey?: string;
  onNavigate?: (href: string) => void;
  autoCollapseAfterNavigation?: boolean;
  autoCollapseDelay?: number;
  /**
   * Quando false, os ícones dos itens de navegação são ocultados.
   * Os ícones ainda existem nos dados — apenas não são renderizados.
   * Default: true.
   */
  showItemIcons?: boolean;
  // ── Footer
  user?: SidebarUser;
  footerItems?: SidebarFooterItem[];
  userMenuItems?: SidebarFooterItem[];
  footerExtra?: React.ReactNode;
  // ── Collapse
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
  collapsible?: boolean;
  // ── Mobile
  mobileOpen?: boolean;
  onMobileOpenChange?: (v: boolean) => void;
  // ── Style
  className?: string;
  /**
   * Optional access check. When provided, nav items and footer items whose
   * `componentId` returns false are hidden. Items without `componentId` are
   * always shown. Parents with all children filtered out are also hidden.
   */
  canAccess?: (componentId: string) => boolean;
  /**
   * When true, this Sidebar does not register with ShellContext.
   * Use for demo/preview instances that should not affect the app layout.
   */
  isolated?: boolean;
  /**
   * Variant of the sidebar: 'default' (main shell layout) or 'workspace' (embedded in workspace panels).
   * Default: 'default'.
   */
  variant?: 'default' | 'workspace';
};
