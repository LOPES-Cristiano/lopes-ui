import { useEffect, useRef } from "react";

export interface GlobalKeyShortcut {
  /** Código físico da tecla (ex.: `"KeyC"`, `"KeyN"`, `"Digit1"`) ou letra simples (`"C"`). */
  key: string;
  /** Rótulo amigável da ação para feedback/acessibilidade. */
  label?: string;
  /** Identificador opcional de RBAC avaliado via `canAccess`. */
  componentId?: string;
  /** Ação executada quando o atalho é disparado. */
  onTrigger: (event: KeyboardEvent) => void;
}

export interface UseGlobalKeyShortcutsOptions {
  /** Ativa/desativa todos os atalhos. Padrão: `true`. */
  enabled?: boolean;
  /** Modificador exigido. Padrão: `"alt"` (`Alt+<Tecla>`). */
  modifier?: "alt" | "ctrlOrMeta";
  /** Validador opcional de acesso (ex.: `canAccess` do `useAccessControl`). */
  canAccess?: (componentId: string) => boolean;
  /** Callback acionado quando `canAccess(shortcut.componentId)` retorna `false`. */
  onAccessDenied?: (shortcut: GlobalKeyShortcut) => void;
}

/**
 * Registra atalhos globais baseados em `KeyboardEvent.code` (independente de layout ABNT2/US),
 * suprimindo disparos automaticamente quando o foco está em campos editáveis ou modais abertos.
 */
export function useGlobalKeyShortcuts(
  shortcuts: readonly GlobalKeyShortcut[],
  options: UseGlobalKeyShortcutsOptions = {},
): void {
  const { enabled = true, modifier = "alt", canAccess, onAccessDenied } = options;

  const shortcutsRef = useRef(shortcuts);
  const canAccessRef = useRef(canAccess);
  const onDeniedRef = useRef(onAccessDenied);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
    canAccessRef.current = canAccess;
    onDeniedRef.current = onAccessDenied;
  }, [shortcuts, canAccess, onAccessDenied]);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (modifier === "alt") {
        if (!e.altKey || e.ctrlKey || e.metaKey) return;
      } else {
        if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      }

      if (document.activeElement?.closest('[role="dialog"], [role="alertdialog"], [data-floating-open="true"]')) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }

      const codeUpper = e.code;
      const fallbackKeyCode = e.key ? `Key${e.key.toUpperCase()}` : "";

      const match = shortcutsRef.current.find((item) => {
        const normalized = item.key.length === 1 ? `Key${item.key.toUpperCase()}` : item.key;
        return normalized === codeUpper || normalized === fallbackKeyCode;
      });

      if (!match) return;

      if (match.componentId && canAccessRef.current && !canAccessRef.current(match.componentId)) {
        e.preventDefault();
        onDeniedRef.current?.(match);
        return;
      }

      e.preventDefault();
      match.onTrigger(e);
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [enabled, modifier]);
}
