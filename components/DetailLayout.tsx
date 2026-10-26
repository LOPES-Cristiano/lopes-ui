'use client';

import { useAccessControl } from './useAccessControl';
import { useEffect, type CSSProperties, type ReactNode } from 'react';
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
  let colorClass = 'text-zinc-900 dark:text-zinc-100';
  if (muted || variant === 'muted') {
    colorClass = 'text-zinc-400 dark:text-zinc-500';
  } else if (highlight || variant === 'primary') {
    colorClass = 'text-indigo-600 dark:text-indigo-400';
  } else if (variant === 'success') {
    colorClass = 'text-emerald-600 dark:text-emerald-400';
  } else if (variant === 'warning') {
    colorClass = 'text-amber-600 dark:text-amber-400';
  } else if (variant === 'danger') {
    colorClass = 'text-rose-600 dark:text-rose-400';
  } else if (variant === 'info') {
    colorClass = 'text-sky-600 dark:text-sky-400';
  }

  return (
    <div className={twMerge('flex flex-col gap-0.5 text-left', className)}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 leading-none">
        {label}
      </span>
      <span className={twMerge('text-sm font-semibold leading-snug break-words', colorClass)}>
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{value}</p>
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
}

export function DetailHeader({ titleLabel, titleValue, avatar, chips, badge }: DetailHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-5 text-left">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        {avatar}
        <div className="min-w-0 flex-1 pr-6 sm:pr-0">
          {titleLabel ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-0.5">
              {titleLabel}
            </p>
          ) : null}
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight dark:text-zinc-100 break-words leading-tight">
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
interface DetailPanelProps {
  title?: string;
  icon?: any;
  action?: ReactNode;
  children: ReactNode;
}

export function DetailPanel({ title, icon: Icon, action, children }: DetailPanelProps) {
  return (
    <section className="border-b border-zinc-200 pb-6 last:border-b-0 dark:border-zinc-800">
      {title || action || Icon ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon ? <Icon size={16} className="text-zinc-600 dark:text-zinc-400" /> : null}
            {title ? (
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-zinc-700 dark:text-zinc-300">
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
   *  Se não informado, a aba é sempre visível (usa erp.detail-layout.tab-{id}). */
  componentId?: string;
}

interface DetailTabsProps {
  tabs: readonly TabItem[] | TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function DetailTabs({ tabs, activeTab, onChange }: DetailTabsProps) {
  const { canAccess } = useAccessControl();

  // Redireciona automaticamente para a primeira aba permitida caso a aba ativa esteja bloqueada
  useEffect(() => {
    const accessibleTabs = tabs.filter((tab) => {
      const cid = tab.componentId ?? `erp.detail-layout.tab-${tab.id}`;
      return canAccess(cid);
    });
    if (accessibleTabs.length > 0 && !accessibleTabs.some((t) => t.id === activeTab)) {
      onChange(accessibleTabs[0].id);
    }
  }, [tabs, activeTab, onChange, canAccess]);

  return (
    <div className="border-b border-border w-full flex items-end gap-1 sm:gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-none py-0.5">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        // Se componentId específico não for informado → fallback para o prefixo
        // 'erp.detail-layout.tab-*' que está na allowlist (sempre visível).
        const cid = tab.componentId ?? `erp.detail-layout.tab-${tab.id}`;
        return (
          <button
            data-component-id={cid}
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={twMerge(
              'group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 rounded-t-md',
              active
                ? '-mb-[1px] bg-primary text-white border-t-2 border-t-primary border-x border-primary font-bold shadow-xs z-10'
                : 'bg-zinc-50/90 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-border/80 border-b-transparent'
            )}
          >
            {tab.icon && (
              <span
                className={
                  active
                    ? 'text-white'
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
                  'inline-flex min-w-3.5 items-center justify-center rounded px-1 py-0.2 sm:px-1.5 sm:py-0.5 text-[9px] sm:text-[11px] font-bold leading-none transition-colors whitespace-nowrap shrink-0',
                  active
                    ? 'bg-[#d9383a] text-white shadow-2xs'
                    : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
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
  return (
    <div className={twMerge('rounded-md bg-zinc-200 dark:bg-zinc-800', className)} style={style} />
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5 text-left">
      {/* ── Header: avatar + título + chips + badges ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {/* Avatar */}
          <Bone className="h-14 w-14 shrink-0 rounded-full" />
          <div className="space-y-2">
            {/* Título */}
            <Bone className="h-6 w-72 max-w-xs" />
            <Bone className="h-4 w-48" />
          </div>
        </div>
        {/* Chips + badges */}
        <div className="flex items-center gap-2 pr-12 pt-1">
          <Bone className="h-6 w-20 rounded-full" />
          <Bone className="h-6 w-16 rounded-full" />
          <Bone className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* ── Metadados secundários em linha ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {[56, 80, 68, 72].map((w, i) => (
          <Bone key={i} className={`h-3.5`} style={{ width: w }} />
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <section className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <Bone className="mb-3 h-2.5 w-28" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-zinc-100 p-3.5 space-y-3 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-2.5 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 pb-px dark:border-zinc-800">
        {[64, 52, 48, 60, 52, 80, 84, 60].map((w, i) => (
          <div
            key={i}
            className={twMerge(
              'h-7 rounded bg-zinc-200 dark:bg-zinc-800',
              i === 0 && 'bg-zinc-300 dark:bg-zinc-700'
            )}
            style={{ width: w }}
          />
        ))}
      </div>

      {/* ── Panel content ── */}
      <div className="space-y-5 pt-1">
        {/* Section title */}
        <Bone className="h-3 w-36" />
        {/* Grid de fields */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          {[48, 72, 56, 64, 40, 80, 52, 68].map((w, i) => (
            <div key={i} className="space-y-1.5">
              <Bone className="h-2 w-14" />
              <div className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" style={{ width: w + 32 }} />
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
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 leading-none">
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

// ─── METRIC FIELD (BORDERLESS CARD) ──────────────────────────────────────────
interface MetricFieldProps {
  label: string;
  value: ReactNode;
  icon?: any;
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
      iconBg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
      valueText: 'text-zinc-900 dark:text-zinc-100',
    },
    success: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      valueText: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
      valueText: 'text-amber-600 dark:text-amber-400',
    },
    danger: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
      valueText: 'text-rose-600 dark:text-rose-400',
    },
    info: {
      iconBg: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
      valueText: 'text-sky-600 dark:text-sky-400',
    },
    primary: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
      valueText: 'text-indigo-600 dark:text-indigo-400',
    },
  }[variant];

  return (
    <div className="flex flex-col  dark:bg-zinc-900/30 text-left border-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon ? (
            <div className={twMerge('p-0.5 rounded-md shrink-0', colors.iconBg)}>
              <Icon size={14} className="sm:w-4 sm:h-4" />
            </div>
          ) : null}
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 leading-none truncate">
            {label}
          </span>
        </div>
        {trend}
      </div>

      <div className="space-y-0.5 mt-0.5">
        <p className={twMerge('text-base sm:text-lg lg:text-xl font-bold tracking-tight leading-tight', colors.valueText)}>
          {value ?? '-'}
        </p>
        {subtext ? (
          <p className="text-[9px] sm:text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-tight truncate">
            {subtext}
          </p>
        ) : null}
      </div>
    </div>
  );
}
