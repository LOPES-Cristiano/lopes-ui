'use client';

import { useAccessControl } from './useAccessControl';
import React, { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// ─── INFO FIELD ──────────────────────────────────────────────────────────────
interface InfoFieldProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  muted?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'muted';
  className?: string;
}

export function InfoField({ label, value, highlight, muted, variant, className }: InfoFieldProps) {
  let colorClass = 'text-foreground';
  if (muted || variant === 'muted') {
    colorClass = 'text-muted-foreground';
  } else if (highlight || variant === 'primary') {
    colorClass = 'text-brand';
  } else if (variant === 'success') {
    colorClass = 'text-success';
  } else if (variant === 'warning') {
    colorClass = 'text-warning';
  } else if (variant === 'danger') {
    colorClass = 'text-danger';
  } else if (variant === 'info') {
    colorClass = 'text-info';
  }

  return (
    <div className={twMerge('flex flex-col gap-0.5 text-left', className)}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">
        {label}
      </span>
      <span className={twMerge('text-sm font-semibold leading-snug break-words tabular-nums', colorClass)}>
        {value ?? '-'}
      </span>
    </div>
  );
}

export const DetailItem = InfoField;

// ─── INFO CHIP ───────────────────────────────────────────────────────────────
interface InfoChipProps {
  label: string;
  value: string;
}

export function InfoChip({ label, value }: InfoChipProps) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

// ─── DETAIL HEADER ───────────────────────────────────────────────────────────
interface DetailHeaderProps {
  titleLabel?: string;
  titleValue: ReactNode;
  avatar?: ReactNode;
  chips?: ReactNode;
  badge?: ReactNode;
  onBack?: () => void;
  backAriaLabel?: string;
}

export function DetailHeader({
  titleLabel,
  titleValue,
  avatar,
  chips,
  badge,
  onBack,
  backAriaLabel,
}: DetailHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-5 text-left">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        {onBack ? (
          <button
            data-component-id="erp.detail-layout.back"
            type="button"
            onClick={onBack}
            aria-label={backAriaLabel || 'Voltar'}
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
        ) : null}
        {avatar}
        <div className="min-w-0 flex-1 pr-6 sm:pr-0">
          {titleLabel ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
              {titleLabel}
            </p>
          ) : null}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight break-words leading-tight">
            {titleValue}
          </h2>
        </div>
      </div>
      {(chips || badge) && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:pr-12 shrink-0">
          {chips}
          {badge}
        </div>
      )}
    </div>
  );
}

// ─── DETAIL GRID ─────────────────────────────────────────────────────────────
interface DetailGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function DetailGrid({ children, columns = 4, className }: DetailGridProps) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }[columns];

  return <div className={twMerge('grid gap-x-4 gap-y-4', colClass, className)}>{children}</div>;
}

// ─── DETAIL PANEL ────────────────────────────────────────────────────────────
type DetailIconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface DetailPanelProps {
  title?: string;
  icon?: DetailIconComponent;
  action?: ReactNode;
  children: ReactNode;
}

export function DetailPanel({ title, icon: Icon, action, children }: DetailPanelProps) {
  return (
    <section className="border-b border-border pb-6 last:border-b-0">
      {title || action || Icon ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon ? <Icon size={16} className="text-muted-foreground" /> : null}
            {title ? (
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">
                {title}
              </h3>
            ) : null}
          </div>
          {action ? <span className="text-xs text-muted-foreground">{action}</span> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

// ─── DETAIL TABS ─────────────────────────────────────────────────────────────
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
  /** componentId específico para controle de acesso (ex: 'erp.cadastro.pessoa.tab-compras').
   *  Se não informado, a aba usa `erp.detail-layout.tab-{id}`. */
  componentId?: string;
}

interface DetailTabsProps {
  tabs: readonly TabItem[] | TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function DetailTabs({ tabs, activeTab, onChange }: DetailTabsProps) {
  const { canAccess } = useAccessControl();

  const visibleTabs = useMemo(
    () => tabs.filter((t) => !t.componentId || canAccess(t.componentId)),
    [tabs, canAccess],
  );

  // Redireciona automaticamente para a primeira aba permitida caso a aba ativa esteja bloqueada
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === activeTab)) {
      onChange(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab, onChange]);

  return (
    <div
      role="tablist"
      className="border-b border-border w-full flex items-end gap-1 sm:gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-none py-0.5"
    >
      {visibleTabs.map((tab) => {
        const active = activeTab === tab.id;
        const cid = tab.componentId ?? `erp.detail-layout.tab-${tab.id}`;
        return (
          <button
            data-component-id={cid}
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={twMerge(
              'group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? '-mb-[1px] bg-primary text-primary-foreground border-t-2 border-t-primary border-x border-primary font-bold shadow-xs z-10'
                : 'bg-surface-muted/80 hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/80 border-b-transparent',
            )}
          >
            {tab.icon && (
              <span
                className={
                  active
                    ? 'text-primary-foreground shrink-0'
                    : 'text-muted-foreground group-hover:text-foreground shrink-0'
                }
              >
                {tab.icon}
              </span>
            )}
            <span className="truncate">{tab.label}</span>
            {tab.badge != null && tab.badge > 0 ? (
              <span
                className={twMerge(
                  'inline-flex min-w-3.5 items-center justify-center rounded px-1 py-0.5 sm:px-1.5 text-[9px] sm:text-[11px] font-bold leading-none tabular-nums transition-colors whitespace-nowrap shrink-0',
                  active
                    ? 'bg-danger text-danger-foreground shadow-2xs'
                    : 'bg-muted text-muted-foreground group-hover:bg-muted/80',
                )}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── DETAIL SKELETON ──────────────────────────────────────────────────────────
function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={twMerge('rounded-md bg-surface-muted', className)} style={style} />;
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5 text-left">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Bone className="h-14 w-14 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Bone className="h-6 w-72 max-w-xs" />
            <Bone className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2 pr-12 pt-1">
          <Bone className="h-6 w-20 rounded-full" />
          <Bone className="h-6 w-16 rounded-full" />
          <Bone className="h-6 w-16 rounded-full" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {[56, 80, 68, 72].map((w, i) => (
          <Bone key={i} className="h-3.5" style={{ width: w }} />
        ))}
      </div>

      <section className="border-b border-border pb-5">
        <Bone className="mb-3 h-2.5 w-28" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-muted/60 p-3.5 space-y-3 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-lg bg-surface-muted" />
                <div className="h-2.5 w-20 rounded bg-surface-muted" />
              </div>
              <div className="h-6 w-16 rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        {[64, 52, 48, 60, 52, 80, 84, 60].map((w, i) => (
          <div
            key={i}
            className={twMerge('h-7 rounded bg-surface-muted', i === 0 && 'bg-border-strong')}
            style={{ width: w }}
          />
        ))}
      </div>

      <div className="space-y-5 pt-1">
        <Bone className="h-3 w-36" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          {[48, 72, 56, 64, 40, 80, 52, 68].map((w, i) => (
            <div key={i} className="space-y-1.5">
              <Bone className="h-2 w-14" />
              <div className="h-4 rounded bg-surface-muted" style={{ width: w + 32 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL SEPARATOR ────────────────────────────────────────────────────────
interface DetailSeparatorProps {
  label: string;
}

export function DetailSeparator({ label }: DetailSeparatorProps) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ─── METRIC FIELD (BORDERLESS CARD) ──────────────────────────────────────────
interface MetricFieldProps {
  label: string;
  value: ReactNode;
  icon?: DetailIconComponent;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  subtext?: ReactNode;
  trend?: ReactNode;
}

export function MetricField({
  label,
  value,
  icon: Icon,
  variant = 'default',
  subtext,
  trend,
}: MetricFieldProps) {
  const colors = {
    default: {
      iconBg: 'bg-surface-muted text-muted-foreground',
      valueText: 'text-foreground',
    },
    success: {
      iconBg: 'bg-success-soft text-success',
      valueText: 'text-success',
    },
    warning: {
      iconBg: 'bg-warning-soft text-warning',
      valueText: 'text-warning',
    },
    danger: {
      iconBg: 'bg-danger-soft text-danger',
      valueText: 'text-danger',
    },
    info: {
      iconBg: 'bg-info-soft text-info',
      valueText: 'text-info',
    },
    primary: {
      iconBg: 'bg-brand-soft text-brand',
      valueText: 'text-brand',
    },
  }[variant];

  return (
    <div className="flex flex-col text-left border-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon ? (
            <div className={twMerge('p-0.5 rounded-md shrink-0', colors.iconBg)}>
              <Icon size={14} className="sm:w-4 sm:h-4" />
            </div>
          ) : null}
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none truncate">
            {label}
          </span>
        </div>
        {trend}
      </div>

      <div className="space-y-0.5 mt-0.5">
        <p
          className={twMerge(
            'text-base sm:text-lg lg:text-xl font-bold tracking-tight leading-tight tabular-nums',
            colors.valueText,
          )}
        >
          {value ?? '-'}
        </p>
        {subtext ? (
          <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium leading-tight truncate">
            {subtext}
          </p>
        ) : null}
      </div>
    </div>
  );
}
