'use client';

import React from 'react';
import { Lock, Unlock, type LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAccessControl } from './useAccessControl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './primitives/tooltip';

export type SplitCounterTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'primary';

export interface SplitCounterSegment {
  /** Segment identifier */
  id?: string;
  /** Numeric counter value */
  count: number;
  /** Human-readable label shown in the accessible tooltip breakdown */
  label: string;
  /** Visual color tone */
  tone?: SplitCounterTone;
  /** Optional icon displayed next to the counter */
  icon?: LucideIcon;
  /** Place icon on the left or right of the number (defaults to `'right'`) */
  iconPosition?: 'left' | 'right';
}

export interface SplitCounterBadgeProps {
  /** Explicit segments to render in order */
  segments?: SplitCounterSegment[];
  /** Shorthand approved/unlocked count (used when `segments` is omitted) */
  approvedCount?: number;
  /** Shorthand blocked/pending count (used when `segments` is omitted) */
  blockedCount?: number;
  /** Optional rejected count included in the tooltip summary */
  rejectedCount?: number;
  /** Approved segment label in tooltip (defaults to `"liberado(s)"`) */
  approvedLabel?: string;
  /** Blocked segment label in tooltip (defaults to `"pendente(s)"`) */
  blockedLabel?: string;
  /** Rejected segment label in tooltip (defaults to `"negado(s)"`) */
  rejectedLabel?: string;
  /** Custom tooltip content overriding the generated breakdown */
  tooltip?: React.ReactNode;
  /** Fallback node rendered when total count across all segments is `0` */
  emptyFallback?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md';
  onClick?: () => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
}

const SEGMENT_TONE_CLASSES: Record<SplitCounterTone, string> = {
  success: 'bg-emerald-600 text-white',
  danger: 'bg-rose-600 text-white',
  warning: 'bg-amber-500 text-zinc-950',
  info: 'bg-sky-600 text-white',
  primary: 'bg-primary text-primary-foreground',
  neutral: 'bg-muted text-foreground',
};

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md', { cell: string; text: string; icon: number }> = {
  xs: { cell: 'px-1.5 py-0.5 gap-1', text: 'text-[10px]', icon: 10 },
  sm: { cell: 'px-1.5 py-0.5 gap-1', text: 'text-xs', icon: 12 },
  md: { cell: 'px-2.5 py-1 gap-1.5', text: 'text-xs', icon: 13 },
};

export function SplitCounterBadge({
  segments: segmentsProp,
  approvedCount = 0,
  blockedCount = 0,
  rejectedCount = 0,
  approvedLabel = 'liberado(s)',
  blockedLabel = 'pendente(s)',
  rejectedLabel = 'negado(s)',
  tooltip,
  emptyFallback = <span className="text-xs text-muted-foreground">—</span>,
  size = 'sm',
  onClick,
  className,
  componentId,
  hideIfDenied = true,
}: SplitCounterBadgeProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveSegments: SplitCounterSegment[] =
    segmentsProp ?? [
      {
        id: 'approved',
        count: approvedCount,
        label: approvedLabel,
        tone: approvedCount > 0 ? 'success' : 'neutral',
        icon: Unlock,
        iconPosition: 'right',
      },
      {
        id: 'blocked',
        count: blockedCount + rejectedCount,
        label: blockedLabel,
        tone: blockedCount + rejectedCount > 0 ? 'danger' : 'success',
        icon: Lock,
        iconPosition: 'right',
      },
    ];

  const totalCount = effectiveSegments.reduce((acc, seg) => acc + Math.max(0, seg.count), 0);

  if (totalCount === 0) {
    return <>{emptyFallback}</>;
  }

  const sz = SIZE_CLASSES[size] ?? SIZE_CLASSES.sm;

  const summaryText = segmentsProp
    ? effectiveSegments.map((s) => `${s.count} ${s.label}`).join(' · ')
    : rejectedCount > 0
    ? `${approvedCount} ${approvedLabel}, ${blockedCount} ${blockedLabel} e ${rejectedCount} ${rejectedLabel}`
    : `${approvedCount} ${approvedLabel} e ${blockedCount} ${blockedLabel}`;

  const innerContent = (
    <>
      {effectiveSegments.map((seg, index) => {
        const SegIcon = seg.icon;
        const toneCls = SEGMENT_TONE_CLASSES[seg.tone ?? 'neutral'];
        const iconFirst = seg.iconPosition === 'left';
        return (
          <span
            key={seg.id ?? `${seg.label}-${index}`}
            className={cn(
              'inline-flex items-center font-bold tabular-nums transition-colors',
              sz.cell,
              sz.text,
              toneCls,
              index > 0 && 'border-l border-black/15 dark:border-white/15',
            )}
          >
            {SegIcon && iconFirst && <SegIcon size={sz.icon} className="stroke-[2.5] shrink-0" />}
            <span>{seg.count}</span>
            {SegIcon && !iconFirst && <SegIcon size={sz.icon} className="stroke-[2.5] shrink-0" />}
          </span>
        );
      })}
    </>
  );

  const wrapperCls = cn(
    'inline-flex items-stretch rounded-md shadow-2xs overflow-hidden border border-border',
    onClick
      ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      : 'cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    className,
  );

  const triggerElement = onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={summaryText}
      data-component-id={componentId || undefined}
      className={wrapperCls}
    >
      {innerContent}
    </button>
  ) : (
    <span
      tabIndex={0}
      role="group"
      aria-label={summaryText}
      data-component-id={componentId || undefined}
      className={wrapperCls}
    >
      {innerContent}
    </span>
  );

  return (
    <TooltipProvider delayDuration={180}>
      <Tooltip>
        <TooltipTrigger asChild>{triggerElement}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs tabular-nums">
          {tooltip ?? summaryText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SplitCounterBadge;
