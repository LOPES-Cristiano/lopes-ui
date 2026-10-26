'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';

const TOP_BAR_TOUCH_ZONE_PX = 180;
const PULL_TRIGGER_THRESHOLD = 75;
const MAX_PULL_DISTANCE = 90;

export default function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    function hasScrolledAncestor(target: EventTarget | null): boolean {
      let el = target as HTMLElement | null;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollTop > 0) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      if (scrollTop === 0 && touch.clientY <= TOP_BAR_TOUCH_ZONE_PX && !hasScrolledAncestor(e.target)) {
        startYRef.current = touch.clientY;
        startXRef.current = touch.clientX;
        isPullingRef.current = true;
      } else {
        isPullingRef.current = false;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isPullingRef.current || isRefreshingRef.current) return;

      const touch = e.touches[0];
      const diffY = touch.clientY - startYRef.current;
      const diffX = touch.clientX - startXRef.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      if (Math.abs(diffX) > Math.abs(diffY) || diffY <= 15 || scrollTop > 0 || hasScrolledAncestor(e.target)) {
        if (pullDistanceRef.current > 0) {
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
        return;
      }

      const distance = Math.min(MAX_PULL_DISTANCE, Math.pow(diffY - 15, 0.85));
      pullDistanceRef.current = distance;
      setPullDistance(distance);
    }

    function handleTouchCancel() {
      isPullingRef.current = false;
      if (!isRefreshingRef.current) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    }

    function handleTouchEnd() {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      const currentDistance = pullDistanceRef.current;
      if (currentDistance >= PULL_TRIGGER_THRESHOLD && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(60);

        setTimeout(() => {
          window.location.reload();
        }, 350);

        // Fallback de segurança: se a página não recarregar em 4 segundos, reseta o indicador
        setTimeout(() => {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }, 4000);
      } else if (!isRefreshingRef.current) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, []);

  if (pullDistance <= 0 && !isRefreshing) return null;

  const isReadyToRelease = pullDistance >= PULL_TRIGGER_THRESHOLD;
  const progress = Math.min(1, pullDistance / PULL_TRIGGER_THRESHOLD);
  const rotation = Math.min(360, pullDistance * 5.2);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] lg:hidden flex justify-center pointer-events-none transition-transform duration-75"
      style={{
        transform: `translateY(${Math.min(60, pullDistance + 8)}px)`,
        opacity: Math.max(0.3, progress),
      }}
    >
      <div
        style={{
          transform: `scale(${0.5 + progress * 0.5})`,
        }}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border shadow-xl transition-colors duration-150 ${
          isReadyToRelease || isRefreshing
            ? 'border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
            : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <RotateCw
          size={18}
          style={{ transform: isRefreshing ? undefined : `rotate(${rotation}deg)` }}
          className={isRefreshing ? 'animate-spin' : ''}
        />
      </div>
    </div>
  );
}
