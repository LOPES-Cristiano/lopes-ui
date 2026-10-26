'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isTouchOrMobile = useCallback(() => {
    if (typeof window === 'undefined') return true;
    if (window.innerWidth < 1024) return true;
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }, []);

  const updatePosition = useCallback(() => {
    if (!ref.current || isTouchOrMobile()) {
      setShow(false);
      return;
    }
    const r = ref.current.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.right <= 0 || r.top < -50 || r.bottom > window.innerHeight + 50) {
      setShow(false);
      return;
    }
    setPos({ top: r.top + r.height / 2, left: r.right + 10 });
  }, [isTouchOrMobile]);

  const onOpen = () => {
    if (disabled || !label || isTouchOrMobile()) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isTouchOrMobile()) {
        setShow(false);
        return;
      }
      updatePosition();
      setShow(true);
    }, delayMs);
  };

  const onClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }, []);

  useEffect(() => {
    if (disabled) {
      onClose();
    }
  }, [disabled, onClose]);

  useEffect(() => {
    const handleGlobalResizeOrTouch = () => {
      if (isTouchOrMobile()) {
        onClose();
      } else {
        updatePosition();
      }
    };

    window.addEventListener('resize', handleGlobalResizeOrTouch);
    window.addEventListener('orientationchange', handleGlobalResizeOrTouch);
    window.addEventListener('touchstart', onClose, { passive: true });

    return () => {
      window.removeEventListener('resize', handleGlobalResizeOrTouch);
      window.removeEventListener('orientationchange', handleGlobalResizeOrTouch);
      window.removeEventListener('touchstart', onClose);
    };
  }, [isTouchOrMobile, onClose, updatePosition]);

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
      onFocus={(e) => {
        // Não abre tooltip por foco em touch
        if (isTouchOrMobile()) return;
        onOpen();
      }}
      onBlur={onClose}
    >
      {children}
      {show &&
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
