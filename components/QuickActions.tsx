'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { useHasOpenModal } from './Modal';

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuickAction = {
  id: string;
  componentId?: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip override (defaults to label) */
  tooltip?: string;
};

export type QuickActionsProps = {
  actions: QuickAction[];
  /** Floating position. Default: "bottom-right" */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left';
  className?: string;
  mainButtonClassName?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuickActions({
  actions,
  className,
  mainButtonClassName,
}: QuickActionsProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Offset de arraste a partir da posição inicial (canto inferior direito)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
    hasMoved: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handlers para Arrastar com Suavidade (Pointer + Touch)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialOffsetX: offset.x,
        initialOffsetY: offset.y,
        hasMoved: false,
      };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [offset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 5) {
        dragStartRef.current.hasMoved = true;
      }

      // Limites de tela para manter o botão sempre visível
      const winW = typeof window !== 'undefined' ? window.innerWidth : 400;
      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const btnSize = 56;
      const padRight = 16;
      const padBottom = 24;

      const minX = -(winW - btnSize - padRight - 8);
      const maxX = padRight;
      const minY = -(winH - btnSize - padBottom - 8);
      const maxY = padBottom;

      const nextOffsetX = Math.min(Math.max(minX, dragStartRef.current.initialOffsetX + deltaX), maxX);
      const nextOffsetY = Math.min(Math.max(minY, dragStartRef.current.initialOffsetY + deltaY), maxY);

      setOffset({ x: nextOffsetX, y: nextOffsetY });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}

      // Se foi apenas um toque/clique rápido sem arrastar, abre/fecha o menu
      if (!dragStartRef.current.hasMoved) {
        setOpen((prev) => !prev);
      }
    },
    [isDragging]
  );

  const hasOpenModal = useHasOpenModal();

  if (!mounted || typeof document === 'undefined' || !actions || actions.length === 0 || hasOpenModal) return null;

  // Determina se o menu deve abrir para cima ou para baixo com base na posição do offset
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const isNearTop = offset.y < -(winH / 2);
  const winW = typeof window !== 'undefined' ? window.innerWidth : 400;
  const isNearLeft = offset.x < -(winW / 2);

  const content = (
    <>
      {/* Backdrop sem blur para evitar bugs gráficos de GPU/renderização */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/55 dark:bg-black/70 transition-opacity duration-200 animate-in fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Container Principal Posicionado no canto inferior direito com Movimento Suave */}
      <div
        ref={containerRef}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.18, 0.89, 0.32, 1.12)',
          willChange: 'transform',
          touchAction: 'none',
        }}
        className={twMerge(
          'fixed bottom-6 right-4 z-40 flex flex-col items-end select-none',
          className
        )}
      >
        {/* Action items — lista flutuante de ações com animação suave */}
        <div
          className={clsx(
            'absolute transition-all duration-250 ease-out',
            isNearTop ? 'top-full mt-3' : 'bottom-full mb-3',
            isNearLeft ? 'left-0 items-start' : 'right-0 items-end',
            'flex flex-col gap-2.5',
            open
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : isNearTop
                ? 'opacity-0 scale-90 -translate-y-2 pointer-events-none'
                : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
          )}
          aria-hidden={!open}
        >
          {actions.map((action, idx) => (
            <div
              key={action.id}
              onClick={() => {
                if (!action.disabled) {
                  action.onClick();
                  setOpen(false);
                }
              }}
              style={{
                transitionDelay: open ? `${idx * 40}ms` : '0ms',
              }}
              className={clsx(
                'group flex items-center gap-2.5 cursor-pointer select-none transition-all duration-200',
                open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
                isNearLeft ? 'flex-row-reverse' : 'flex-row justify-end'
              )}
            >
              {/* Label / Badge sempre legível e limpo */}
              <span
                className={clsx(
                  'whitespace-nowrap rounded-xl bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs font-semibold px-3 py-1.5 shadow-xl border border-slate-200 dark:border-zinc-700 transition-transform active:scale-95',
                  action.disabled && 'opacity-50'
                )}
              >
                {action.tooltip ?? action.label}
              </span>

              {/* Action Button */}
              <button
                data-component-id={action.componentId ?? `erp.quick-actions.${action.id}`}
                type="button"
                aria-label={action.label}
                disabled={action.disabled}
                className={clsx(
                  'w-11 h-11 rounded-full shadow-xl shrink-0',
                  'flex items-center justify-center',
                  'bg-white dark:bg-zinc-900',
                  'border border-slate-200 dark:border-zinc-700',
                  'text-slate-700 dark:text-zinc-200',
                  'hover:bg-slate-50 dark:hover:bg-zinc-800',
                  'transition-all active:scale-95 cursor-pointer',
                  action.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                )}
              >
                <span className="flex items-center justify-center">{action.icon}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Toggle FAB (+) com Rotação e Movimento Ultra Suave */}
        <button
          data-component-id="erp.quick-actions.fab-toggle"
          type="button"
          aria-label={open ? 'Fechar ações rápidas' : 'Abrir ações rápidas'}
          aria-expanded={open}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={twMerge(
            'w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none ring-4 ring-white/40 dark:ring-zinc-900/50',
            'transition-all duration-300 ease-out',
            mainButtonClassName ?? 'bg-blue-600 hover:bg-blue-700 text-white',
            open ? 'rotate-45 shadow-blue-500/30' : 'active:scale-95'
          )}
        >
          {/* + icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 pointer-events-none transition-transform duration-300"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
