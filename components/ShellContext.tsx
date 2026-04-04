"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const COOKIE_KEY = "shell_sidebar_collapsed";

export type ShellContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  hasSidebar: boolean;
  /** True only when at least one <Sidebar> is currently mounted in the tree */
  sidebarMounted: boolean;
  /** Internal: Sidebar calls this on mount and returns an unregister fn */
  _registerSidebar: () => () => void;
};

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue | null {
  return useContext(ShellContext);
}

export function ShellProvider({
  children,
  defaultCollapsed = false,
  defaultHasSidebar = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  defaultHasSidebar?: boolean;
}) {
  // defaultCollapsed comes from the server (cookie) — no localStorage needed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // sidebarCount tracks how many <Sidebar> instances are currently mounted.
  // We derive hasSidebar from it via a useEffect so we never run side-effects
  // inside a state-updater function (which React 19 Strict Mode calls twice).
  const [sidebarCount, setSidebarCount] = useState(0);
  const [hasSidebar, setHasSidebar] = useState(defaultHasSidebar);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Once a sidebar has registered we know this shell layout has one.
  const everHadSidebarRef = useRef(false);

  const toggleSidebar = useCallback(() =>
    setSidebarCollapsed((s) => {
      const next = !s;
      try {
        // Persist in cookie (readable by server for SSR) and localStorage (fast client read)
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `${COOKIE_KEY}=${next};path=/;max-age=${maxAge};samesite=lax`;
        localStorage.setItem(COOKIE_KEY, String(next));
      } catch {}
      return next;
    }), []);

  // Derive hasSidebar from sidebarCount.
  // When count drops to 0 we delay the state update so a fast client-side
  // navigation (old sidebar unmounts → new one mounts) never causes a layout
  // flash in the Header.
  useEffect(() => {
    if (sidebarCount > 0) {
      // A sidebar is present — cancel any pending hide immediately.
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      everHadSidebarRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSidebar(true);
    } else if (everHadSidebarRef.current) {
      // All sidebars unmounted — wait briefly before hiding so fast
      // navigations (e.g. 404 → home) don't cause a transient flash.
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null;
        setHasSidebar(false);
      }, 300);
    }
    // Cancel the pending timer whenever sidebarCount changes so a
    // re-mount within 300 ms suppresses the hide entirely.
    return () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [sidebarCount]);

  // _registerSidebar: pure counter updates only — no side-effects inside updaters.
  const _registerSidebar = useCallback((): (() => void) => {
    setSidebarCount((n) => n + 1);
    return () => setSidebarCount((n) => Math.max(0, n - 1));
  }, []);

  return (
    <ShellContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        hasSidebar,
        sidebarMounted: sidebarCount > 0,
        _registerSidebar,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}
