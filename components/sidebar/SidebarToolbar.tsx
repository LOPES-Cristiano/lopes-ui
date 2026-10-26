'use client';

import React, { useState, useRef } from 'react';
import {
  ChevronsDownUp,
  ChevronsUpDown,
  FilePlus,
  FolderPlus,
  Home,
  Search,
  X,
} from 'lucide-react';
import type { SidebarToolbarAction } from './Sidebar.types';
import { useSidebar } from './SidebarContext';

export interface SidebarToolbarProps {
  onRefresh?: () => void | Promise<void>;
  onHome?: () => void;
  onAddItem?: () => void;
  onAddGroup?: () => void;
  toolbarActions?: SidebarToolbarAction[];
  searchPlaceholder?: string;
  className?: string;
}

export function SidebarToolbar({
  onRefresh,
  onHome,
  onAddItem,
  onAddGroup,
  toolbarActions = [],
  searchPlaceholder = 'Filtrar itens...',
  className = '',
}: SidebarToolbarProps) {
  const {
    effectiveCollapsed,
    groupsCollapsible,
    allGroupsCollapsed,
    toggleAllGroups,
    searchQuery,
    setSearchQuery,
    handleNavigate,
  } = useSidebar();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleToggleSearch = () => {
    if (isSearchOpen && searchQuery) {
      setSearchQuery('');
    }
    const nextState = !isSearchOpen;
    setIsSearchOpen(nextState);
    if (nextState) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  if (effectiveCollapsed) {
    return null;
  }

  return (
    <div
      className={`px-2 pt-1 pb-1.5 flex flex-col gap-1.5 transition-all duration-200 ${className}`}
    >
      {/* Toolbar Top Bar: Explorer Title / Item Count & Action Buttons */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--sidebar-group-foreground)]">
        <span className="font-semibold uppercase tracking-wider text-[10px] opacity-75 select-none">
          Navegação
        </span>

        <div className="flex items-center gap-0.5">
          {/* Custom Action: New Item */}
          {onAddItem && (
            <button
              data-component-id="erp.sidebar.toolbar.add-item"
              type="button"
              onClick={onAddItem}
              title="Novo Item"
              aria-label="Novo Item"
              className="p-1 rounded text-[var(--sidebar-icon-foreground)] hover:text-[var(--sidebar-item-hover-foreground)] hover:bg-[var(--sidebar-item-hover-background)] transition-colors cursor-pointer"
            >
              <FilePlus size={14} />
            </button>
          )}

          {/* Custom Action: New Folder/Group */}
          {onAddGroup && (
            <button
              data-component-id="erp.sidebar.toolbar.add-group"
              type="button"
              onClick={onAddGroup}
              title="Novo Grupo"
              aria-label="Novo Grupo"
              className="p-1 rounded text-[var(--sidebar-icon-foreground)] hover:text-[var(--sidebar-item-hover-foreground)] hover:bg-[var(--sidebar-item-hover-background)] transition-colors cursor-pointer"
            >
              <FolderPlus size={14} />
            </button>
          )}

          {/* Extra Custom Toolbar Actions */}
          {toolbarActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                data-component-id={action.componentId ?? `erp.sidebar.toolbar.action-${action.id}`}
                key={action.id}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                title={action.label}
                aria-label={action.label}
                className="p-1 rounded text-[var(--sidebar-icon-foreground)] hover:text-[var(--sidebar-item-hover-foreground)] hover:bg-[var(--sidebar-item-hover-background)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Icon size={14} />
              </button>
            );
          })}

          {/* Início / Home Shortcut */}
          <button
            data-component-id="erp.sidebar.toolbar.home"
            type="button"
            onClick={() => {
              if (onHome) {
                onHome();
              } else {
                handleNavigate('/');
              }
            }}
            title="Início"
            aria-label="Início"
            className="p-1 rounded text-[var(--sidebar-icon-foreground)] hover:text-[var(--sidebar-item-hover-foreground)] hover:bg-[var(--sidebar-item-hover-background)] transition-colors cursor-pointer"
          >
            <Home size={14} />
          </button>

          {/* Quick Search Toggle */}
          <button
            data-component-id="erp.sidebar.toolbar.toggle-search"
            type="button"
            onClick={handleToggleSearch}
            title={isSearchOpen ? 'Fechar busca' : 'Filtrar itens (Busca)'}
            aria-label={isSearchOpen ? 'Fechar busca' : 'Filtrar itens (Busca)'}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isSearchOpen || searchQuery
                ? 'bg-[var(--sidebar-item-active-background)] text-[var(--sidebar-item-active-foreground)]'
                : 'text-[var(--sidebar-icon-foreground)] hover:text-[var(--sidebar-item-hover-foreground)] hover:bg-[var(--sidebar-item-hover-background)]'
            }`}
          >
            <Search size={14} />
          </button>

          {/* Collapse / Expand All Groups */}
          {groupsCollapsible && (
            <button
              data-component-id="erp.sidebar.toolbar.toggle-all-groups"
              type="button"
              onClick={toggleAllGroups}
              title={allGroupsCollapsed ? 'Expandir todos os grupos' : 'Recolher todos os grupos'}
              aria-label={
                allGroupsCollapsed ? 'Expandir todos os grupos' : 'Recolher todos os grupos'
              }
              className="p-1 rounded text-[var(--sidebar-icon-foreground)] hover:text-[var(--sidebar-item-hover-foreground)] hover:bg-[var(--sidebar-item-hover-background)] transition-colors cursor-pointer"
            >
              {allGroupsCollapsed ? <ChevronsUpDown size={14} /> : <ChevronsDownUp size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Quick Search Input */}
      {(isSearchOpen || searchQuery) && (
        <div className="relative flex items-center w-full px-0.5">
          <input
            data-component-id="erp.sidebar.toolbar.search-input"
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-7 pl-7 pr-7 text-xs rounded-md bg-[var(--sidebar-item-hover-background)] text-[var(--sidebar-foreground)] placeholder:text-[var(--sidebar-group-foreground)] border border-[var(--sidebar-border)] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          <Search
            size={12}
            className="absolute left-2.5 text-[var(--sidebar-icon-foreground)] pointer-events-none"
          />
          {searchQuery && (
            <button
              data-component-id="erp.sidebar.toolbar.clear-search"
              type="button"
              onClick={handleClearSearch}
              title="Limpar busca"
              aria-label="Limpar busca"
              className="absolute right-2 p-0.5 rounded text-[var(--sidebar-icon-foreground)] hover:text-[var(--sidebar-foreground)] cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
