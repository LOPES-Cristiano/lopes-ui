'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Pause,
  Play,
  Square,
  Timer,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAccessControl } from './useAccessControl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './primitives/tooltip';

export interface ActiveTimerWidgetProps {
  /** Whether there is an active timer session to display */
  open?: boolean;
  /** Short task/activity code (e.g. `"DEM-142"`, `"OS-809"`) */
  code?: string;
  /** Primary task or activity title */
  title: string;
  /** Optional subtitle or context (e.g. project, queue, unit) */
  subtitle?: string;
  /** Whether the timer is currently ticking */
  running: boolean;
  /** Base elapsed seconds accumulated before `startedAt` (defaults to `0`) */
  elapsedSeconds?: number;
  /** Timestamp (ISO string, Date, or epoch ms) when the current running segment started */
  startedAt?: Date | string | number | null;
  /** Anchor position when rendered floating (`inline = false`) */
  position?: 'bottom-right' | 'bottom-left';
  /** Render inline inside a layout/card instead of `fixed` on the viewport */
  inline?: boolean;
  /** Start minimized as a compact pill */
  defaultMinimized?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: (totalElapsedSeconds: number) => void;
  onOpenTask?: () => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
}

function formatDurationClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, '0'))
    .join(':');
}

function parseStartEpochMs(startedAt?: Date | string | number | null): number | null {
  if (startedAt == null) return null;
  if (typeof startedAt === 'number') return Number.isFinite(startedAt) ? startedAt : null;
  if (startedAt instanceof Date) {
    const t = startedAt.getTime();
    return Number.isFinite(t) ? t : null;
  }
  const parsed = Date.parse(startedAt);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ActiveTimerWidget({
  open = true,
  code,
  title,
  subtitle,
  running,
  elapsedSeconds = 0,
  startedAt = null,
  position = 'bottom-right',
  inline = false,
  defaultMinimized = false,
  onPause,
  onResume,
  onStop,
  onOpenTask,
  className,
  componentId,
  hideIfDenied = true,
}: ActiveTimerWidgetProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  const [minimized, setMinimized] = useState(defaultMinimized);
  const [tickNow, setTickNow] = useState<number>(() => Date.now());

  const startMs = parseStartEpochMs(startedAt);

  useEffect(() => {
    if (!open || !running) return;
    const id = window.setInterval(() => {
      setTickNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, running]);

  if (!open || (!hasPermission && hideIfDenied)) {
    return null;
  }

  const liveDeltaSeconds =
    running && startMs != null ? Math.max(0, Math.floor((tickNow - startMs) / 1000)) : 0;
  const totalSeconds = Math.max(0, Math.floor(elapsedSeconds) + liveDeltaSeconds);
  const formattedClock = formatDurationClock(totalSeconds);

  const placementCls = inline
    ? 'relative'
    : cn(
        'fixed bottom-5 z-[6000]',
        position === 'bottom-left' ? 'left-5' : 'right-5',
      );

  if (minimized) {
    return (
      <div
        role="region"
        aria-label={`Cronômetro ativo: ${title}`}
        data-component-id={componentId || undefined}
        className={cn(
          placementCls,
          'inline-flex items-center gap-2.5 rounded-full border border-border bg-popover/95 text-popover-foreground backdrop-blur-md px-3.5 py-2 shadow-xl',
          className,
        )}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {running && (
            <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn(
              'relative inline-flex h-2.5 w-2.5 rounded-full',
              running ? 'bg-emerald-500' : 'bg-amber-500',
            )}
          />
        </span>

        {code && (
          <span className="text-[11px] font-bold font-mono text-primary tabular-nums">
            {code}
          </span>
        )}

        <span className="text-xs font-mono font-bold text-foreground tabular-nums">
          {formattedClock}
        </span>

        <button
          type="button"
          onClick={() => setMinimized(false)}
          aria-label="Expandir cronômetro"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        role="region"
        aria-label={`Cronômetro ativo: ${title}`}
        data-component-id={componentId || undefined}
        className={cn(
          placementCls,
          'w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border bg-popover/95 text-popover-foreground backdrop-blur-xl shadow-2xl overflow-hidden',
          className,
        )}
      >
        <div
          className={cn(
            'h-1 w-full',
            running
              ? 'bg-gradient-to-r from-emerald-500 via-primary to-emerald-500'
              : 'bg-amber-500',
          )}
        />

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                  running
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                )}
              >
                <Timer size={16} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {code && (
                    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary tabular-nums">
                      {code}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {running ? 'Em andamento' : 'Pausado'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
                  {title}
                </p>
                {subtitle && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMinimized(true)}
              aria-label="Minimizar cronômetro"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
            >
              <ChevronDown size={15} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2">
            <span className="text-lg font-mono font-bold tracking-tight text-foreground tabular-nums">
              {formattedClock}
            </span>

            <div className="flex items-center gap-1">
              {running ? (
                onPause && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onPause}
                        aria-label="Pausar cronômetro"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                      >
                        <Pause size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Pausar</TooltipContent>
                  </Tooltip>
                )
              ) : (
                onResume && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onResume}
                        aria-label="Retomar cronômetro"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                      >
                        <Play size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Retomar</TooltipContent>
                  </Tooltip>
                )
              )}

              {onStop && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onStop(totalSeconds)}
                      aria-label="Concluir e registrar tempo"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                    >
                      <Square size={13} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Encerrar registro</TooltipContent>
                </Tooltip>
              )}

              {onOpenTask && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onOpenTask}
                      aria-label="Abrir detalhes da atividade"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Abrir atividade</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default ActiveTimerWidget;
