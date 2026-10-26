'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Pin, PinOff } from 'lucide-react';
import type { SidebarNavItem as SidebarNavItemType } from './Sidebar.types';
import { useSidebar } from './SidebarContext';
import { SidebarTooltip } from './SidebarTooltip';
import { getItemPinId, hasActiveDescendant } from './utils/navigation';

function SidebarBadge({
  value,
  variant = 'default',
  active = false,
}: {
  value: string | number;
  variant?: SidebarNavItemType['badgeVariant'];
  active?: boolean;
}) {
  const getClasses = () => {
    if (active) {
      switch (variant) {
        case 'success':
          return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25';
        case 'warning':
          return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25';
        case 'danger':
          return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25';
        case 'info':
          return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/25';
        default:
          return 'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
      }
    }
    switch (variant) {
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'danger':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'info':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      default:
        return 'bg-white/10 text-white/90 border border-white/15';
    }
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none tracking-tight ${getClasses()}`}
    >
      {value}
    </span>
  );
}

/**
 * Componente que exibe texto com efeito letreiro (marquee) suave quando o texto
 * for maior que a largura disponível e o usuário estiver com o mouse sobre o item.
 * Textos curtos não realizam animação.
 */
function SidebarMarqueeLabel({ label, isHovered }: { label: string; isHovered: boolean }) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isHovered || !containerRef.current || !textRef.current) {
      setOffset(0);
      return;
    }

    const containerWidth = containerRef.current.clientWidth;
    const textWidth = textRef.current.scrollWidth;

    if (textWidth > containerWidth + 2) {
      const overflow = textWidth - containerWidth;
      const dur = Math.max(2, overflow / 28);
      setDuration(dur);
      setOffset(overflow + 8);
    } else {
      setOffset(0);
    }
  }, [isHovered]);

  return (
    <span
      ref={containerRef}
      className="relative block overflow-hidden whitespace-nowrap min-w-0 max-w-full"
    >
      <span
        ref={textRef}
        className="app-chrome-text inline-block leading-snug whitespace-nowrap will-change-transform"
        style={{
          transform: offset > 0 ? `translateX(-${offset}px)` : 'translateX(0px)',
          transition:
            offset > 0 ? `transform ${duration}s linear 0.35s` : 'transform 0.25s ease-out',
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function SidebarNavItem({
  item,
  depth = 0,
  variant = 'default',
  isTopLevelWithoutGroup = false,
  onNavigate,
}: {
  item: SidebarNavItemType;
  depth?: number;
  variant?: 'default' | 'pinned';
  isTopLevelWithoutGroup?: boolean;
  onNavigate?: (href: string) => void;
}) {
  const { effectiveCollapsed, pinnable, pinnedIds, togglePin, handleNavigate, searchQuery, showItemIcons } =
    useSidebar();
  const hasChildren = Boolean(item.children?.length);
  const hasActiveChild = hasChildren && item.children!.some(hasActiveDescendant);
  const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);
  const [subOpen, setSubOpen] = useState(() =>
    Boolean(item.active || hasActiveChild || (isSearching && hasChildren))
  );
  const [isHovered, setIsHovered] = useState(false);

  // Sync subOpen when active or descendant active state changes externally or during search
  useEffect(() => {
    if (item.active || hasActiveChild || (isSearching && hasChildren)) {
      setSubOpen(true);
    }
  }, [item.active, hasActiveChild, isSearching, hasChildren]);

  const Icon = item.icon;
  const isPinnedMode = variant === 'pinned';
  const itemPinId = getItemPinId(item);
  const isPinned = pinnedIds.has(itemPinId);
  const isTopItem = isTopLevelWithoutGroup;

  const handleClick = () => {
    if (item.disabled) return;
    if (hasChildren) {
      setSubOpen((s) => !s);
      return;
    }
    item.onClick?.();
    if (item.href) {
      if (onNavigate) onNavigate(item.href);
      else handleNavigate(item.href);
    }
  };

  const rowBase = [
    'relative flex items-center rounded-lg transition-all duration-150 select-none text-left',
    effectiveCollapsed
      ? 'w-9 h-9 mx-auto justify-center p-0 overflow-hidden shrink-0'
      : isTopItem
        ? 'w-full px-2.5 py-1.5 gap-2 text-[13.5px] font-bold tracking-tight'
        : depth > 0
          ? 'w-full pl-8 pr-2.5 py-1 gap-2 text-[12.5px] opacity-85 hover:opacity-100'
          : isPinnedMode
            ? 'w-full px-2.5 py-1.5 gap-2 text-[13px]'
            : !showItemIcons
              ? 'w-full pl-6 pr-2.5 py-1.5 gap-2 text-[13px] text-[var(--sidebar-item-foreground)]'
              : 'w-full px-2.5 py-1.5 gap-2 text-[13px] text-[var(--sidebar-item-foreground)]',
    item.disabled ? 'cursor-not-allowed opacity-40 pointer-events-none' : 'cursor-pointer',
    item.active
      ? isPinnedMode
        ? 'bg-white/15 text-white shadow-sm font-normal border border-white/20'
        : 'bg-[var(--sidebar-item-active-background)] text-[var(--sidebar-item-active-foreground)] shadow-xs font-semibold'
      : isPinnedMode
        ? 'text-[var(--sidebar-item-foreground)] hover:bg-white/10 hover:text-white'
        : 'hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)]',
  ]
    .filter(Boolean)
    .join(' ');

  const cid = item.componentId ? { 'data-component-id': item.componentId } : {};

  // Se for item direto de topo (ex: Início ou Report Studio), exibe o ícone de grupo
  // Caso contrário, obedece à configuração showItemIcons
  const showIcon = isTopItem ? Boolean(Icon) : (showItemIcons && Boolean(Icon));
  const iconEl = showIcon && Icon ? (
    <span
      className={`shrink-0 transition-all duration-150 flex items-center justify-center ${
        item.active
          ? isPinnedMode
            ? 'text-white'
            : 'text-[var(--sidebar-item-active-foreground)]'
          : 'text-[var(--sidebar-icon-foreground)] group-hover/nav:text-[var(--sidebar-icon-hover-foreground)]'
      }`}
    >
      <Icon size={effectiveCollapsed ? 18 : isTopItem ? 16 : 15} strokeWidth={1.8} />
    </span>
  ) : effectiveCollapsed && !showItemIcons ? (
    // Fallback no modo colapsado para itens fixados/isolados
    <span
      className={`shrink-0 text-[11px] font-bold flex items-center justify-center w-5 h-5 rounded ${
        item.active
          ? 'text-[var(--sidebar-item-active-foreground)]'
          : 'text-[var(--sidebar-icon-foreground)] group-hover/nav:text-[var(--sidebar-icon-hover-foreground)]'
      }`}
    >
      {item.label?.charAt(0).toUpperCase()}
    </span>
  ) : depth > 0 ? (
    <span
      className={`shrink-0 h-1.5 w-1.5 rounded-full transition-all ${
        item.active
          ? isPinnedMode
            ? 'bg-white'
            : 'bg-[var(--sidebar-item-active-foreground)]'
          : 'bg-[var(--sidebar-dot-background)] group-hover/nav:bg-[var(--sidebar-dot-hover-background)]'
      }`}
    />
  ) : isPinnedMode ? (
    <span className="shrink-0 flex items-center justify-center text-amber-400">
      <Pin size={14} className="fill-amber-400/20" />
    </span>
  ) : null;

  const labelEl = !effectiveCollapsed ? (
    <span
      className={[
        'flex flex-1 items-center justify-between gap-1.5 overflow-hidden transition-opacity duration-200 ease-out opacity-100 max-w-full',
        pinnable ? (hasChildren ? 'pr-7' : 'pr-5') : '',
      ].join(' ')}
    >
      <span className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <SidebarMarqueeLabel label={item.label} isHovered={isHovered} />
        {item.description && (
          <span
            className={`app-chrome-muted-text truncate leading-snug mt-0.5 ${
              item.active
                ? isPinnedMode
                  ? 'text-white/85'
                  : 'text-white/85'
                : 'text-[var(--sidebar-muted-foreground)]'
            }`}
          >
            {item.description}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        {item.badge !== undefined && (
          <SidebarBadge value={item.badge} variant={item.badgeVariant} active={item.active} />
        )}
        {hasChildren && (
          <ChevronDown
            size={13}
            className={`text-[var(--sidebar-icon-foreground)] transition-transform duration-200 ${
              subOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </span>
    </span>
  ) : null;

  const rowContent = (
    <>
      {iconEl}
      {labelEl}
    </>
  );

  const submenuContentId = `nav-submenu-${item.id ?? item.label.replace(/\s+/g, '-').toLowerCase()}`;

  const row =
    item.href && !hasChildren ? (
      <a
        href={item.disabled ? undefined : item.href}
        className={rowBase}
        aria-label={item.label}
        onClick={(e) => {
          if (!item.disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
        {...cid}
      >
        {rowContent}
      </a>
    ) : (
      <button
        data-component-id={item.componentId ?? `erp.sidebar.item-${item.label}`}
        type="button"
        className={rowBase}
        onClick={handleClick}
        disabled={item.disabled}
        aria-label={item.label}
        {...(hasChildren ? { 'aria-expanded': subOpen, 'aria-controls': submenuContentId } : {})}
        {...cid}
      >
        {rowContent}
      </button>
    );

  // Pin action button (cleanly positioned on the right edge on hover with proper breathing room)
  const pinBtn =
    pinnable && !effectiveCollapsed ? (
      isPinnedMode ? (
        <button
          data-component-id={`erp.sidebar.unpin-${item.label}`}
          type="button"
          title="Desafixar"
          aria-label={`Desafixar ${item.label}`}
          onClick={(e) => {
            e.stopPropagation();
            togglePin(itemPinId);
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover/pin:opacity-100 text-[var(--sidebar-icon-foreground)] hover:text-amber-400 hover:bg-white/15 transition-all z-10 cursor-pointer"
        >
          <PinOff size={12} />
        </button>
      ) : (
        <button
          data-component-id={`erp.sidebar.pin-${item.label}`}
          type="button"
          title={isPinned ? 'Desafixar' : 'Fixar no topo'}
          aria-label={isPinned ? `Desafixar ${item.label}` : `Fixar ${item.label}`}
          onClick={(e) => {
            e.stopPropagation();
            togglePin(itemPinId);
          }}
          className={[
            'absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-md transition-all z-10 cursor-pointer',
            isPinned
              ? 'opacity-0 group-hover/nav:opacity-100 text-amber-400 hover:text-amber-300 hover:bg-white/10'
              : 'opacity-0 group-hover/nav:opacity-100 text-[var(--sidebar-icon-foreground)] hover:text-amber-400 hover:bg-white/10',
          ].join(' ')}
        >
          {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
        </button>
      )
    ) : null;

  const wrappedRow = (
    <div
      className={`relative ${isPinnedMode ? 'group/pin' : 'group/nav'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {row}
      {pinBtn}
    </div>
  );

  return (
    <>
      {item.divider && <div className="my-1.5 border-t border-[var(--sidebar-border)]" />}
      <SidebarTooltip
        label={item.label}
        description={item.description}
        badge={item.badge}
        delayMs={effectiveCollapsed ? 120 : 400}
        disabled={item.disabled || (!effectiveCollapsed && !item.description)}
      >
        {wrappedRow}
      </SidebarTooltip>
      {/* Sub-items accordion */}
      {hasChildren && (
        <div
          id={submenuContentId}
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: subOpen && !effectiveCollapsed ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="pt-0.5 pb-1 space-y-0.5">
              {item.children!.map((child, ci) => (
                <SidebarNavItem
                  key={child.id ?? `${child.label}-${ci}`}
                  item={child}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
