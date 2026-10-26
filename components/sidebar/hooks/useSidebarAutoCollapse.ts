import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSidebarAutoCollapseOptions {
  /**
   * Delay in milliseconds before auto-collapsing.
   * Default: 4000 (4 seconds).
   */
  delay?: number;
  /**
   * Whether the sidebar is currently collapsed in parent / context state.
   */
  isCollapsed?: boolean;
  /**
   * Callback fired when auto-collapse occurs.
   */
  onAutoCollapse?: () => void;
  /**
   * Whether auto-collapse is disabled.
   */
  disabled?: boolean;
}

export function useSidebarAutoCollapse({
  delay = 4000,
  isCollapsed,
  onAutoCollapse,
  disabled = false,
}: UseSidebarAutoCollapseOptions = {}) {
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store dynamic callbacks/values in refs so timer isn't cancelled by unrelated re-renders
  const onAutoCollapseRef = useRef(onAutoCollapse);
  const delayRef = useRef(delay);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onAutoCollapseRef.current = onAutoCollapse;
  }, [onAutoCollapse]);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const clearTimer = useCallback(() => {
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const isMobileScreen = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 768 || window.matchMedia('(max-width: 767px)').matches;
  }, []);

  const startCollapseTimer = useCallback(
    (customDelay?: number) => {
      if (disabledRef.current || isMobileScreen()) return;
      clearTimer();

      const timeoutDuration = customDelay ?? delayRef.current ?? 4000;
      if (timeoutDuration <= 0) return;

      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        if (!isHoveredRef.current && !disabledRef.current) {
          setIsHovered(false);
          onAutoCollapseRef.current?.();
        }
      }, timeoutDuration);
    },
    [clearTimer, isMobileScreen]
  );

  // Inicia o timer quando a sidebar está expandida (isCollapsed === false)
  // e o mouse não está sobre ela (ex: ao carregar página diretamente via URL).
  useEffect(() => {
    if (disabled) {
      clearTimer();
      return;
    }

    if (isCollapsed === false && !isHoveredRef.current) {
      startCollapseTimer();
    } else if (isCollapsed === true && !isHoveredRef.current) {
      clearTimer();
      setIsHovered(false);
    }
  }, [isCollapsed, disabled, startCollapseTimer, clearTimer]);

  // Limpeza apenas ao desmontar
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const handleMouseEnter = useCallback(() => {
    if (disabledRef.current || isMobileScreen()) return;
    isHoveredRef.current = true;
    clearTimer();
    setIsHovered(true);
  }, [clearTimer, isMobileScreen]);

  const handleMouseLeave = useCallback(() => {
    if (disabledRef.current || isMobileScreen()) return;
    isHoveredRef.current = false;
    startCollapseTimer();
  }, [startCollapseTimer, isMobileScreen]);

  const resetHover = useCallback(() => {
    isHoveredRef.current = false;
    clearTimer();
    setIsHovered(false);
  }, [clearTimer]);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    resetHover,
  };
}


