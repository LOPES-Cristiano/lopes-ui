'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
    switch (variant) {
      case 'success':
        return 'bg-success-soft text-success-soft-foreground border border-success-border';
      case 'warning':
        return 'bg-warning-soft text-warning-soft-foreground border border-warning-border';
      case 'danger':
        return 'bg-danger-soft text-danger-soft-foreground border border-danger-border';
      case 'info':
        return 'bg-info-soft text-info-soft-foreground border border-info-border';
      default:
        return active
          ? 'bg-zinc-900/10 text-[var(--sidebar-item-active-foreground)] border border-zinc-500/20 dark:bg-white/15 dark:border-white/20'
          : 'bg-zinc-500/10 text-[var(--sidebar-item-foreground)] dark:bg-white/10 border border-[var(--sidebar-border)]';
    }
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none tracking-tight tabular-nums ${getClasses()}`}
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
function SidebarMarqueeLabel({
  label,
  isHovered,
  active,
}: {
  label: string;
  isHovered: boolean;
  active?: boolean;
}) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (
      !isHovered ||
      !containerRef.current ||
      !textRef.current ||
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
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
        className={[
          'inline-block leading-snug whitespace-nowrap will-change-transform',
          active ? 'font-semibold' : 'app-chrome-text',
        ].join(' ')}
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
  const {
    effectiveCollapsed,
    pinnable,
    pinnedIds,
    togglePin,
    handleNavigate,
    searchQuery,
    showItemIcons,
    setCollapsed,
  } = useSidebar();
  const hasChildren = Boolean(item.children?.length);
  const hasActiveChild = hasChildren && item.children!.some(hasActiveDescendant);
  const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);
  const shouldForceOpen = Boolean(item.active || hasActiveChild || (isSearching && hasChildren));
  const [subOpen, setSubOpen] = useState(shouldForceOpen);
  const [prevShouldForceOpen, setPrevShouldForceOpen] = useState(shouldForceOpen);
  const [isHovered, setIsHovered] = useState(false);

  // Sync subOpen when active or descendant active state changes externally or during search
  if (shouldForceOpen !== prevShouldForceOpen) {
    setPrevShouldForceOpen(shouldForceOpen);
    if (shouldForceOpen) {
      setSubOpen(true);
    }
  }

  const Icon = item.icon;
  const isPinnedMode = variant === 'pinned';
  const itemPinId = getItemPinId(item);
  const isPinned = pinnedIds.has(itemPinId);
  const isTopItem = isTopLevelWithoutGroup;

  const handleClick = () => {
    if (item.disabled) return;
    if (hasChildren) {
      if (effectiveCollapsed) {
        setCollapsed(false);
        setSubOpen(true);
      } else {
        setSubOpen((s) => !s);
      }
      if (!item.href) return;
    }
    item.onClick?.();
    if (item.href) {
      if (onNavigate) onNavigate(item.href);
      else handleNavigate(item.href);
    }
  };

  const rowBase = [
    'relative flex items-center rounded-[var(--radius-control)] transition-colors duration-150 select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    effectiveCollapsed
      ? 'w-9 h-9 mx-auto justify-center p-0 overflow-hidden shrink-0'
      : isTopItem
        ? 'w-full px-2.5 py-1.5 gap-2 text-[13.5px] font-bold tracking-tight'
        : depth > 0
          ? 'w-full px-2.5 py-1.5 gap-2 text-[12.5px] opacity-90 hover:opacity-100'
          : isPinnedMode
            ? 'w-full px-2.5 py-1.5 gap-2 text-[13px]'
            : !showItemIcons
              ? 'w-full pl-6 pr-2.5 py-1.5 gap-2 text-[13px]'
              : 'w-full px-2.5 py-1.5 gap-2 text-[13px]',
    item.disabled ? 'cursor-not-allowed opacity-40 pointer-events-none' : 'cursor-pointer',
    item.active
      ? 'bg-[var(--sidebar-item-active-background)] text-[var(--sidebar-item-active-foreground)] shadow-xs font-semibold'
      : hasActiveChild
        ? 'text-[var(--sidebar-foreground)] font-medium hover:bg-[var(--sidebar-item-hover-background)]'
        : isTopItem
          ? 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)]'
          : 'text-[var(--sidebar-item-foreground)] hover:bg-[var(--sidebar-item-hover-background)] hover:text-[var(--sidebar-item-hover-foreground)]',
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
          ? 'text-[var(--sidebar-item-active-foreground)]'
          : hasActiveChild
            ? 'text-[var(--sidebar-foreground)]'
            : 'text-[var(--sidebar-icon-foreground)] group-hover/nav:text-[var(--sidebar-icon-hover-foreground)]'
      }`}
    >
      <Icon size={effectiveCollapsed ? 18 : isTopItem ? 16 : 15} strokeWidth={item.active || hasActiveChild ? 2.1 : 1.8} />
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
          ? 'bg-[var(--sidebar-item-active-foreground)]'
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
        <SidebarMarqueeLabel label={item.label} isHovered={isHovered} active={item.active} />
        {item.description && (
          <span
            className={`app-chrome-muted-text truncate leading-snug mt-0.5 ${
              item.active
                ? 'text-[var(--sidebar-item-active-muted)]'
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
          <span
            role={item.href ? 'button' : undefined}
            tabIndex={item.href ? 0 : undefined}
            aria-label={subOpen ? `Recolher submenu de ${item.label}` : `Expandir submenu de ${item.label}`}
            onClick={
              item.href
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSubOpen((s) => !s);
                  }
                : undefined
            }
            onKeyDown={
              item.href
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setSubOpen((s) => !s);
                    }
                  }
                : undefined
            }
            className="inline-flex items-center justify-center rounded p-0.5 hover:bg-[var(--sidebar-item-hover-background)]"
          >
            <ChevronDown
              size={13}
              className={`text-[var(--sidebar-icon-foreground)] transition-transform duration-200 ${
                subOpen ? 'rotate-180' : ''
              }`}
            />
          </span>
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
    item.href && !item.disabled ? (
      <Link
        href={item.href}
        prefetch={false}
        className={rowBase}
        aria-label={item.label}
        {...(hasChildren ? { 'aria-expanded': subOpen, 'aria-controls': submenuContentId } : {})}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
            return;
          }
          e.preventDefault();
          handleClick();
        }}
        {...cid}
      >
        {rowContent}
      </Link>
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
          className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover/pin:opacity-100 group-focus-within/pin:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 text-[var(--sidebar-icon-foreground)] hover:text-amber-400 hover:bg-[var(--sidebar-item-hover-background)] transition-opacity z-10 cursor-pointer"
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
            'absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-md transition-opacity z-10 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            isPinned
              ? 'opacity-0 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100 text-amber-400 hover:text-amber-300 hover:bg-[var(--sidebar-item-hover-background)]'
              : 'opacity-0 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100 text-[var(--sidebar-icon-foreground)] hover:text-amber-400 hover:bg-[var(--sidebar-item-hover-background)]',
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
          className="grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none"
          style={{ gridTemplateRows: subOpen && !effectiveCollapsed ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="relative ml-4 pl-2.5 my-0.5 border-l border-[var(--sidebar-border)] space-y-0.5">
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
