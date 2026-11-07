/**
 * Canal genérico de sincronização entre abas, janelas e foco da aplicação
 * combinando `CustomEvent` local, `BroadcastChannel`, `localStorage` (`storage`),
 * retorno de visibilidade (`visibilitychange` / `focus`) e reconexão (`online`).
 */

export interface ClearSessionStorageOptions {
  /** Chaves de `localStorage` que devem ser preservadas (ex.: tema, consentimento de cookies). */
  preservedKeys?: Iterable<string>;
  /** Prefixos de `localStorage` que devem ser preservados (ex.: preferências visuais de sidebar). */
  preservedPrefixes?: readonly string[];
}

const DEFAULT_PRESERVED_KEYS = [
  'theme',
  'lopes-ui-theme',
  'lopes-ui-cookie-consent',
] as const;

/**
 * Limpa `sessionStorage` e chaves transitórias de `localStorage` em terminais compartilhados,
 * preservando apenas preferências visuais não sensíveis.
 */
export function clearClientSessionStorage(options: ClearSessionStorageOptions = {}): void {
  if (typeof window === 'undefined') return;

  const preservedSet = new Set<string>([
    ...DEFAULT_PRESERVED_KEYS,
    ...(options.preservedKeys ?? []),
  ]);
  const preservedPrefixes = options.preservedPrefixes ?? ['lopes-sidebar-'];

  try {
    window.sessionStorage.clear();
  } catch {
    // ignore storage restriction
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (preservedSet.has(key)) continue;
      if (preservedPrefixes.some((prefix) => key.startsWith(prefix))) continue;
      keysToRemove.push(key);
    }
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore storage restriction
  }
}

export interface CrossTabSyncEventBase {
  type: string;
  timestamp: number;
}

export interface CrossTabSyncChannelOptions<TEvent extends CrossTabSyncEventBase> {
  /** Nome único do canal `BroadcastChannel`. Padrão: `"lopes_ui_sync_channel"`. */
  channelName?: string;
  /** Chave em `localStorage` usada como fallback entre janelas. */
  storageKey?: string;
  /** Nome do `CustomEvent` disparado na mesma aba. */
  customEventName?: string;
  /** Tempo mínimo (ms) em segundo plano antes de disparar sincronização ao focar a aba. Padrão: `5000`. */
  staleFocusThresholdMs?: number;
  /** Fábrica de evento disparado automaticamente quando a aba volta do segundo plano ou reconecta. */
  createStaleRefreshEvent?: (timestamp: number) => TEvent | null;
  /** Tipo de evento que aciona automaticamente limpeza de sessão (ex.: `"LOGOUT"`). */
  logoutEventType?: TEvent['type'];
  /** Opções repassadas a `clearClientSessionStorage` ao receber evento de logout. */
  clearStorageOptions?: ClearSessionStorageOptions;
  /** Janela de deduplicação (ms) para evitar disparos duplicados entre BroadcastChannel e Storage. Padrão: `350`. */
  dedupeWindowMs?: number;
}

export interface CrossTabSyncChannel<TEvent extends CrossTabSyncEventBase> {
  publish: (event: Omit<TEvent, 'timestamp'> & { timestamp?: number }) => void;
  subscribe: (listener: (event: TEvent) => void) => () => void;
}

/**
 * Cria um barramento tipado de sincronização multi-aba (sessão, unidade/filial, permissões, perfil).
 */
export function createCrossTabSyncChannel<
  TEvent extends CrossTabSyncEventBase = {
    type: 'PROFILE_UPDATED' | 'CONTEXT_CHANGED' | 'TENANT_CHANGED' | 'LOGOUT';
    timestamp: number;
    payload?: Record<string, unknown>;
  },
>(options: CrossTabSyncChannelOptions<TEvent> = {}): CrossTabSyncChannel<TEvent> {
  const channelName = options.channelName ?? 'lopes_ui_sync_channel';
  const storageKey = options.storageKey ?? `${channelName}_event`;
  const customEventName = options.customEventName ?? `${channelName}:event`;
  const staleFocusThresholdMs = options.staleFocusThresholdMs ?? 5000;
  const dedupeWindowMs = options.dedupeWindowMs ?? 350;

  let broadcastChannel: BroadcastChannel | null = null;

  function getBroadcastChannel(): BroadcastChannel | null {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
    if (!broadcastChannel) {
      try {
        broadcastChannel = new BroadcastChannel(channelName);
      } catch {
        broadcastChannel = null;
      }
    }
    return broadcastChannel;
  }

  function publish(partial: Omit<TEvent, 'timestamp'> & { timestamp?: number }): void {
    if (typeof window === 'undefined') return;
    const fullEvent = {
      ...partial,
      timestamp: partial.timestamp ?? Date.now(),
    } as TEvent;

    window.dispatchEvent(new CustomEvent<TEvent>(customEventName, { detail: fullEvent }));

    try {
      getBroadcastChannel()?.postMessage(fullEvent);
    } catch {
      // ignore closed/unsupported channel
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(fullEvent));
    } catch {
      // ignore quota/privacy mode
    }
  }

  function subscribe(listener: (event: TEvent) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    let lastSignature = '';
    let lastDeliveredAt = 0;

    const deliver = (event: TEvent) => {
      if (!event || typeof event.type !== 'string') return;
      const now = Date.now();
      const sig = `${event.type}:${event.timestamp}`;
      if (sig === lastSignature && now - lastDeliveredAt < dedupeWindowMs) {
        return;
      }
      lastSignature = sig;
      lastDeliveredAt = now;

      if (options.logoutEventType && event.type === options.logoutEventType) {
        clearClientSessionStorage({
          ...options.clearStorageOptions,
          preservedKeys: [storageKey, ...(options.clearStorageOptions?.preservedKeys ?? [])],
        });
      }
      listener(event);
    };

    const ch = getBroadcastChannel();

    const handleBroadcast = (e: MessageEvent<TEvent>) => {
      if (e.data) deliver(e.data);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          deliver(JSON.parse(e.newValue) as TEvent);
        } catch {
          // ignore malformed payload
        }
      }
    };

    const handleCustom = (e: Event) => {
      const custom = e as CustomEvent<TEvent>;
      if (custom.detail) deliver(custom.detail);
    };

    let lastFocusCheck = Date.now();
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastFocusCheck > staleFocusThresholdMs) {
        lastFocusCheck = now;
        const refreshEvt = options.createStaleRefreshEvent?.(now);
        if (refreshEvt) deliver(refreshEvt);
      }
    };

    const handleOnline = () => {
      const now = Date.now();
      lastFocusCheck = now;
      const refreshEvt = options.createStaleRefreshEvent?.(now);
      if (refreshEvt) deliver(refreshEvt);
    };

    ch?.addEventListener('message', handleBroadcast);
    window.addEventListener('storage', handleStorage);
    window.addEventListener(customEventName, handleCustom);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      ch?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(customEventName, handleCustom);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
    };
  }

  return { publish, subscribe };
}
