import { useEffect } from "react";

let activeLockCount = 0;
let savedBodyOverflow = "";
let savedHtmlOverflow = "";
let savedPaddingRight = "";

/**
 * Reference-counted scroll lock on both `document.documentElement` and `document.body`.
 * Safely handles nested overlays without prematurely unlocking scroll when an inner
 * modal/drawer closes while an outer one remains open, and prevents root scroll leaks on iOS/Safari.
 * Supports SSR — skips when `document` is unavailable.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (typeof document === "undefined" || !active) return;

    const body = document.body;
    const docEl = document.documentElement;

    if (activeLockCount === 0) {
      savedBodyOverflow = body.style.overflow;
      savedHtmlOverflow = docEl.style.overflow;
      savedPaddingRight = body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - docEl.clientWidth;
      docEl.style.overflow = "hidden";
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
        docEl.style.overflow = savedHtmlOverflow;
        body.style.overflow = savedBodyOverflow;
        body.style.paddingRight = savedPaddingRight;
      }
    };
  }, [active]);
}
