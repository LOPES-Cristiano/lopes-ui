import { useEffect } from "react";

/**
 * Locks document.body scrolling while `active` is true.
 * Restores the original overflow on cleanup or when `active` becomes false.
 * Supports SSR — skips when `document` is unavailable.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (typeof document === "undefined" || !active) return;

    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;

    // Measure scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - body.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, [active]);
}
