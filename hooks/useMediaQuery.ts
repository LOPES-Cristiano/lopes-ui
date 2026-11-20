"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface LopesMobileBridge {
  isApp?: boolean;
  version?: string;
  platform?: "ios" | "android" | string;
  chatRole?: "host" | "guest" | string;
  scanBarcode?: () => void;
  openFilialPicker?: () => void;
  openMenu?: () => void;
  openApp?: (targetApp: string, path?: string) => void;
}

export function getLopesMobileBridge(): LopesMobileBridge | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as { LopesMobile?: LopesMobileBridge };
  return win.LopesMobile ?? null;
}

/**
 * SSR-safe reactive CSS media query hook powered by `useSyncExternalStore`.
 * Avoids hydration mismatches and synchronous `setState` inside `useEffect`.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => {};
      }
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return serverFallback;
    }
    return window.matchMedia(query).matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True when viewport is below Tailwind `md` breakpoint (`< 768px`). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)", false);
}

/** True when viewport is below Tailwind `sm` breakpoint (`< 640px`). */
export function useIsCompactViewport(): boolean {
  return useMediaQuery("(max-width: 639px)", false);
}

function subscribeMobileBridge(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("focus", onStoreChange);
  window.addEventListener("lopes:mobile-ready", onStoreChange);
  return () => {
    window.removeEventListener("focus", onStoreChange);
    window.removeEventListener("lopes:mobile-ready", onStoreChange);
  };
}

function getMobileAppSnapshot(): string {
  const bridge = getLopesMobileBridge();
  if (!bridge?.isApp) return "web";
  let detectedPlatform = bridge.platform;
  if (!detectedPlatform && typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) detectedPlatform = "android";
    else if (/iphone|ipad|ipod/i.test(ua)) detectedPlatform = "ios";
  }
  return `app:${detectedPlatform ?? "unknown"}`;
}

function getServerMobileAppSnapshot(): string {
  return "web";
}

/**
 * Detects whether the current web session runs inside the native Lopes Mobile App WebView.
 */
export function useIsLopesMobileApp(): {
  isApp: boolean;
  platform: string | null;
  bridge: LopesMobileBridge | null;
} {
  const raw = useSyncExternalStore(
    subscribeMobileBridge,
    getMobileAppSnapshot,
    getServerMobileAppSnapshot,
  );
  const isApp = raw.startsWith("app:");
  const platform = isApp ? raw.slice(4) : null;
  return {
    isApp,
    platform,
    bridge: isApp ? getLopesMobileBridge() : null,
  };
}
