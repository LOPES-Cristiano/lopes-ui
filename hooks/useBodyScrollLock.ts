import { useEffect } from "react";

let activeLockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

/**
 * Reference-counted body scroll lock for modals and drawers.
 * Safely handles nested overlays without prematurely unlocking body scroll
 * when an inner modal/drawer closes while an outer one remains open.
 * Supports SSR — skips when `document` is unavailable.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (typeof document === "undefined" || !active) return;

    const body = document.body;
    const docEl = document.documentElement;

    if (activeLockCount === 0) {
      savedOverflow = body.style.overflow;
      savedPaddingRight = body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - docEl.clientWidth;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        const computedPadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
      }
    }

    activeLockCount += 1;

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0) {
        body.style.overflow = savedOverflow;
        body.style.paddingRight = savedPaddingRight;
      }
    };
  }, [active]);
}
