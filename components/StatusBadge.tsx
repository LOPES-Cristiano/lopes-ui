'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'brand';

export type StatusBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  children?: React.ReactNode;
  label?: React.ReactNode;
  tone?: StatusTone;
  size?: StatusBadgeSize;
  dot?: boolean;
  pulse?: boolean;
  solid?: boolean;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  className?: string;
  componentId?: string;
}

// ── Style Maps ────────────────────────────────────────────────────────────────

const TONE_STYLES: Record<StatusTone, { soft: string; solid: string; dot: string; dotPulse: string }> = {
  success: {
    soft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
    solid: 'bg-emerald-600 text-white border-transparent',
    dot: 'bg-emerald-500',
    dotPulse: 'bg-emerald-400',
  },
  warning: {
    soft: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
    solid: 'bg-amber-500 text-white border-transparent',
    dot: 'bg-amber-500',
    dotPulse: 'bg-amber-400',
  },
  danger: {
    soft: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/60 dark:border-red-800/40',
    solid: 'bg-red-600 text-white border-transparent',
    dot: 'bg-red-500',
    dotPulse: 'bg-red-400',
  },
  info: {
    soft: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40',
    solid: 'bg-sky-600 text-white border-transparent',
    dot: 'bg-sky-500',
    dotPulse: 'bg-sky-400',
  },
  neutral: {
    soft: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/50',
    solid: 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900 border-transparent',
    dot: 'bg-zinc-400',
    dotPulse: 'bg-zinc-300',
  },
  primary: {
    soft: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40',
    solid: 'bg-indigo-600 text-white border-transparent',
    dot: 'bg-indigo-500',
    dotPulse: 'bg-indigo-400',
  },
  brand: {
    soft: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/20',
    solid: 'bg-primary text-white border-transparent',
    dot: 'bg-primary',
    dotPulse: 'bg-primary/80',
  },
};

const SIZES: Record<StatusBadgeSize, { base: string; text: string; dot: string; iconSize: number; px: string }> = {
  xs: { base: 'h-4',   text: 'text-[10px]', dot: 'h-1.5 w-1.5', iconSize: 10, px: 'px-1.5 gap-1' },
  sm: { base: 'h-5',   text: 'text-[11px]', dot: 'h-2 w-2',     iconSize: 11, px: 'px-2 gap-1.5' },
  md: { base: 'h-6',   text: 'text-xs',     dot: 'h-2 w-2',     iconSize: 12, px: 'px-2.5 gap-1.5' },
  lg: { base: 'h-7',   text: 'text-sm',     dot: 'h-2.5 w-2.5', iconSize: 13, px: 'px-3 gap-2' },
};

// ── Pure Component ────────────────────────────────────────────────────────────

export function StatusBadge({
  children,
  label,
  tone = 'neutral',
  size = 'sm',
  dot = true,
  pulse = false,
  solid = false,
  icon: IconProp,
  className,
  componentId,
}: StatusBadgeProps) {
  const content = children ?? label;
  const t = TONE_STYLES[tone] ?? TONE_STYLES.neutral;
  const s = SIZES[size] ?? SIZES.sm;

  const renderIcon = () => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) return IconProp;
    if (typeof IconProp === 'function' || typeof IconProp === 'object') {
      const Comp = IconProp as React.ComponentType<{ size?: number; className?: string }>;
      return <Comp size={s.iconSize} className="shrink-0" />;
    }
    return null;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium leading-none select-none rounded-full whitespace-nowrap transition-colors',
        s.base,
        s.px,
        s.text,
        solid ? t.solid : t.soft,
        className
      )}
      >
      {dot && !IconProp && (
        <span className="relative flex shrink-0 items-center justify-center">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                t.dotPulse
              )}
            />
          )}
          <span className={cn('rounded-full', s.dot, t.dot)} />
        </span>
      )}

      {renderIcon()}

      {content && <span>{content}</span>}
    </span>
  );
}

export default StatusBadge;
