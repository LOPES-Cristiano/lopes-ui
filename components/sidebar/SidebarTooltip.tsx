'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';

export interface SidebarTooltipProps {
  label: string;
  description?: string;
  badge?: string | number;
  delayMs?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SidebarTooltip({
  label,
  description,
  badge,
  delayMs = 300,
  disabled = false,
  children,
}: SidebarTooltipProps) {
  const pathname = usePathname();
  const { effectiveCollapsed } = useSidebar();
  const scopeKey = `${pathname ?? ''}:${effectiveCollapsed ? '1' : '0'}:${disabled ? '1' : '0'}`;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scopeKeyRef = useRef(scopeKey);

  useEffect(() => {
    scopeKeyRef.current = scopeKey;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [scopeKey]);

  const show = !disabled && activeKey === scopeKey;

  const isTouchOrMobile = useCallback(() => {
    if (typeof window === 'undefined') return true;
    if (window.innerWidth < 1024) return true;
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }, []);

  const updatePosition = useCallback((): boolean => {
    if (!ref.current || isTouchOrMobile()) {
      setActiveKey(null);
      setPos(null);
      return false;
    }
    const r = ref.current.getBoundingClientRect();
    if (
      r.width === 0 ||
      r.height === 0 ||
      r.right <= 0 ||
      r.top < 0 ||
      r.bottom > window.innerHeight + 50
    ) {
      setActiveKey(null);
      setPos(null);
      return false;
    }
    const nextTop = r.top + r.height / 2;
    const nextLeft = r.right + 10;
    if (nextTop <= 0 || nextLeft <= 0) {
      setActiveKey(null);
      setPos(null);
      return false;
    }
    setPos({ top: nextTop, left: nextLeft });
    return true;
  }, [isTouchOrMobile]);

  const onClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveKey(null);
    setPos(null);
  }, []);

  const onOpen = useCallback(() => {
    if (disabled || !label || isTouchOrMobile()) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const openedScopeKey = scopeKeyRef.current;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (
        disabled ||
        scopeKeyRef.current !== openedScopeKey ||
        isTouchOrMobile() ||
        (typeof document !== 'undefined' && document.visibilityState === 'hidden')
      ) {
        setActiveKey(null);
        setPos(null);
        return;
      }
      if (updatePosition()) {
        setActiveKey(openedScopeKey);
      }
    }, delayMs);
  }, [disabled, label, isTouchOrMobile, delayMs, updatePosition]);

  useEffect(() => {
    const handleGlobalResizeOrTouch = () => {
      if (isTouchOrMobile()) {
        onClose();
      } else if (show) {
        updatePosition();
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        onClose();
      }
    };

    window.addEventListener('resize', handleGlobalResizeOrTouch);
    window.addEventListener('orientationchange', handleGlobalResizeOrTouch);
    window.addEventListener('touchstart', onClose, { passive: true });
    window.addEventListener('blur', onClose);
    window.addEventListener('pointerdown', onClose, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleGlobalResizeOrTouch);
      window.removeEventListener('orientationchange', handleGlobalResizeOrTouch);
      window.removeEventListener('touchstart', onClose);
      window.removeEventListener('blur', onClose);
      window.removeEventListener('pointerdown', onClose);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTouchOrMobile, onClose, show, updatePosition]);

  useEffect(() => {
    if (!show) return;
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [show, updatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="w-full"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onClick={onClose}
      onFocus={(e) => {
        if (isTouchOrMobile()) return;
        const target = e.target as HTMLElement | null;
        if (target && typeof target.matches === 'function') {
          try {
            // Ignora restauração de foco automática ao voltar de outra aba/janela
            if (!target.matches(':focus-visible')) return;
          } catch {}
        }
        onOpen();
      }}
      onBlur={onClose}
    >
      {children}
      {show &&
        pos !== null &&
        pos.top > 0 &&
        pos.left > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            aria-hidden="true"
            className="pointer-events-none fixed flex flex-col gap-0.5 whitespace-nowrap select-none rounded-lg bg-white text-zinc-900 border border-zinc-200/90 px-3 py-1.5 text-xs font-semibold shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translateY(-50%)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-900 font-semibold tracking-tight">{label}</span>
              {badge !== undefined && (
                <span className="rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 px-1.5 py-px text-[9px] font-bold leading-none">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <span className="text-[10px] text-zinc-500 font-normal">{description}</span>
            )}
            {/* Charmoso balãozinho com ponta branca para a esquerda */}
            <span className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-white drop-shadow-[-1px_0_1px_rgba(0,0,0,0.06)]" />
          </div>,
          document.body,
        )}
    </div>
  );
}
