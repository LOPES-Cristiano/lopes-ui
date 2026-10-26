"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const COOKIE_KEY = "shell_sidebar_collapsed";

let lastBackTimestamp = 0;

if (typeof window !== "undefined") {
  window.addEventListener(
    "popstate",
    () => {
      lastBackTimestamp = Date.now();
    },
    { passive: true },
  );
}

/**
 * Aciona o recuo de um passo no sistema:
 * 1. Protegido com debounce para evitar duplo recuo se o navegador já disparou popstate.
 * 2. Se houver modal aberto, fecha o modal do topo com segurança via ESC.
 * 3. Dispara evento cancelável 'lopes:back' / 'biglar:back' para wizards/etapas internas interceptarem.
 */
export function triggerShellBack(): void {
  if (typeof window === "undefined") return;

  const now = Date.now();
  if (now - lastBackTimestamp < 650) {
    return;
  }
  lastBackTimestamp = now;

  const isModalOpen = document.body.getAttribute("data-modal-open") === "true";
  if (isModalOpen) {
    const escEvent = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    window.dispatchEvent(escEvent);
    return;
  }

  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(10);
    } catch {}
  }

  const event = new CustomEvent("biglar:back", { cancelable: true });
  window.dispatchEvent(event);
}

/**
 * Hook utilitário para que páginas/modais com sub-passos/etapas possam interceptar o gesto de voltar.
 * Se o handler retornar true, impede a navegação padrão e realiza a ação customizada.
 */
export function useOnShellBack(handler: () => boolean | void, active: boolean = true) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const onBack = (e: Event) => {
      try {
        const handled = handler();
        if (handled) {
          e.preventDefault();
        }
      } catch (err) {
        console.error("Erro no handler useOnShellBack:", err);
      }
    };

    window.addEventListener("biglar:back", onBack);
    return () => window.removeEventListener("biglar:back", onBack);
  }, [handler, active]);
}

export type ShellContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  hasSidebar: boolean;
  /** True only when at least one <Sidebar> is currently mounted in the tree */
  sidebarMounted: boolean;
  /** Internal: Sidebar calls this on mount and returns an unregister fn */
  _registerSidebar: () => () => void;
  customSidebar: React.ReactNode | null;
  setCustomSidebar: (node: React.ReactNode | null) => void;
  /** Navegação por gestos / voltar */
  triggerBack: () => void;
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
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(defaultCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [customSidebar, setCustomSidebarState] = useState<React.ReactNode | null>(null);
  const [sidebarCount, setSidebarCount] = useState(0);
  const [hasSidebar, setHasSidebar] = useState(defaultHasSidebar);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const everHadSidebarRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY);
      if (stored !== null) {
        setSidebarCollapsedState(stored === "true");
      }
    } catch {}
  }, []);

  const setSidebarCollapsed = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsedState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      try {
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `${COOKIE_KEY}=${next};path=/;max-age=${maxAge};samesite=lax`;
        localStorage.setItem(COOKIE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((s) => !s);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let trackingMode: "none" | "open_sidebar" | "close_sidebar" | "back_step" = "none";

    const handleTouchStart = (e: TouchEvent) => {
      if (window.innerWidth >= 768) return;
      if (e.touches.length !== 1) return;

      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [contenteditable="true"], .overflow-x-auto, [data-no-swipe], table, button, a',
        )
      ) {
        return;
      }

      if (mobileSidebarOpen && target?.closest("aside")) {
        return;
      }

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();

      const leftThreshold = Math.max(24, Math.min(36, window.innerWidth * 0.08));

      if (mobileSidebarOpen) {
        trackingMode = "close_sidebar";
      } else {
        const isModalOpen = document.body.getAttribute("data-modal-open") === "true";

        if (touchStartX <= leftThreshold && !isModalOpen) {
          trackingMode = "open_sidebar";
        } else if (isModalOpen && touchStartX >= window.innerWidth * 0.35) {
          trackingMode = "back_step";
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const mode = trackingMode;
      trackingMode = "none";

      if (mode === "none") return;
      if (e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      if (deltaTime > 650) return;

      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && Math.abs(deltaY) < 85;
      if (!isHorizontal) return;

      if (mode === "open_sidebar") {
        if (deltaX >= 48) {
          setMobileSidebarOpen(true);
        }
      } else if (mode === "close_sidebar") {
        if (deltaX <= -48) {
          setMobileSidebarOpen(false);
        }
      } else if (mode === "back_step") {
        if (deltaX <= -50) {
          triggerShellBack();
        }
      }
    };

    const handleTouchCancel = () => {
      trackingMode = "none";
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [mobileSidebarOpen]);

  const setCustomSidebar = useCallback((node: React.ReactNode | null) => {
    setCustomSidebarState(node);
  }, []);

  const hasAnySidebar = sidebarCount > 0 || customSidebar !== null;
  useEffect(() => {
    if (hasAnySidebar) {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      everHadSidebarRef.current = true;
      setHasSidebar(true);
    } else if (everHadSidebarRef.current && !defaultHasSidebar) {
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null;
        setHasSidebar(false);
      }, 300);
    }
    return () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [hasAnySidebar, defaultHasSidebar]);

  const _registerSidebar = useCallback((): (() => void) => {
    setSidebarCount((n) => n + 1);
    return () => setSidebarCount((n) => Math.max(0, n - 1));
  }, []);

  const contextValue = React.useMemo<ShellContextValue>(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      hasSidebar,
      sidebarMounted: hasSidebar || sidebarCount > 0 || customSidebar !== null,
      _registerSidebar,
      customSidebar,
      setCustomSidebar,
      triggerBack: triggerShellBack,
    }),
    [
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      hasSidebar,
      sidebarCount,
      customSidebar,
      _registerSidebar,
      setCustomSidebar,
    ],
  );

  return <ShellContext.Provider value={contextValue}>{children}</ShellContext.Provider>;
}
