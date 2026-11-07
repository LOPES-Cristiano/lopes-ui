"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

export interface AccessControlData {
  tasks: string[];
  isAdmin: boolean;
  loading: boolean;
  hasTask: (taskCode: string) => boolean;
  hasAnyTask: (taskCodes: string[]) => boolean;
  hasAllTasks: (taskCodes: string[]) => boolean;
  canAccess: (componentIdOrTask: string) => boolean;
  refresh: () => Promise<void>;
}

const AccessControlContext = createContext<AccessControlData | null>(null);

export interface AccessControlProviderProps {
  children: React.ReactNode;
  /** Lista inicial de tarefas/permissões concedidas ao usuário */
  initialTasks?: string[];
  /** Se o usuário possui acesso administrativo irrestrito */
  initialIsAdmin?: boolean;
  /** Identificador opcional do usuário autenticado (invalida o cache quando o usuário muda) */
  userId?: string | number | null;
  /** Chave opcional no localStorage para cache instantâneo de permissões por `userId` */
  cacheKey?: string;
  /** Mapeamento opcional de componentId -> código(s) de tarefa */
  permissionsMap?: Record<string, string | string[]>;
  /** Função customizada opcional para resolver acesso por componentId ou tarefa */
  canAccessFn?: (componentIdOrTask: string) => boolean;
  /** Predicado opcional para IDs estruturais sempre permitidos (ex: fechar modal, abas públicas) */
  alwaysAllowedPredicate?: (componentIdOrTask: string) => boolean;
  /** Resolvedor opcional de hierarquia de tarefas além da regra padrão `MODULO` -> `MODULO.VIEW` */
  taskHierarchyResolver?: (grantedTasks: ReadonlySet<string>, requestedTask: string) => boolean;
  /** Assinatura opcional de sincronização externa/entre abas que dispara `refresh()` */
  subscribeExternalSync?: (onInvalidate: () => void) => () => void;
  /** Callback opcional para recarregar permissões */
  onRefresh?: () => Promise<{ tasks?: string[]; isAdmin?: boolean } | void>;
  /**
   * Comportamento padrão para componentIds não mapeados quando o usuário não é admin.
   * Default: `false` (fail-closed quando AccessControlProvider está montado).
   */
  defaultAllow?: boolean;
}

const PERMISSIVE_FALLBACK: AccessControlData = {
  tasks: [],
  isAdmin: false,
  loading: false,
  hasTask: () => true,
  hasAnyTask: () => true,
  hasAllTasks: () => true,
  canAccess: () => true,
  refresh: async () => {},
};

const EMPTY_TASKS: string[] = [];

type CachedAccessSnapshot = {
  userId?: string | number | null;
  tasks: string[];
  isAdmin: boolean;
};

function readCachedAccess(
  cacheKey?: string,
  userId?: string | number | null,
): CachedAccessSnapshot | null {
  if (!cacheKey || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedAccessSnapshot>;
    if (userId !== undefined && parsed.userId !== userId) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }
    if (!Array.isArray(parsed.tasks)) return null;
    return {
      userId: parsed.userId,
      tasks: parsed.tasks.filter((t): t is string => typeof t === "string"),
      isAdmin: Boolean(parsed.isAdmin),
    };
  } catch {
    return null;
  }
}

function writeCachedAccess(
  cacheKey: string | undefined,
  snapshot: CachedAccessSnapshot,
): void {
  if (!cacheKey || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(snapshot));
  } catch {
    // ignore quota / storage errors
  }
}

export function AccessControlProvider({
  children,
  initialTasks = EMPTY_TASKS,
  initialIsAdmin = false,
  userId,
  cacheKey,
  permissionsMap,
  canAccessFn,
  alwaysAllowedPredicate,
  taskHierarchyResolver,
  subscribeExternalSync,
  onRefresh,
  defaultAllow = false,
}: AccessControlProviderProps) {
  const [tasks, setTasks] = useState<string[]>(() => {
    if (initialTasks.length > 0) return initialTasks;
    const cached = readCachedAccess(cacheKey, userId);
    return cached ? cached.tasks : initialTasks;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (initialIsAdmin) return true;
    const cached = readCachedAccess(cacheKey, userId);
    return cached ? cached.isAdmin : initialIsAdmin;
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Pure React 19 render-phase prop synchronization (zero set-state-in-effect)
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  const [prevInitialIsAdmin, setPrevInitialIsAdmin] = useState(initialIsAdmin);
  const [prevUserId, setPrevUserId] = useState(userId);

  if (
    prevInitialTasks !== initialTasks ||
    prevInitialIsAdmin !== initialIsAdmin ||
    prevUserId !== userId
  ) {
    setPrevInitialTasks(initialTasks);
    setPrevInitialIsAdmin(initialIsAdmin);
    setPrevUserId(userId);
    setTasks(initialTasks);
    setIsAdmin(initialIsAdmin);
  }

  useEffect(() => {
    if (!cacheKey) return;
    writeCachedAccess(cacheKey, { userId, tasks, isAdmin });
  }, [cacheKey, userId, tasks, isAdmin]);

  const grantedTaskSet = useMemo(() => new Set(tasks), [tasks]);

  const hasTask = useCallback(
    (taskCode: string): boolean => {
      if (isAdmin) return true;
      if (!taskCode) return true;
      if (grantedTaskSet.has(taskCode)) return true;
      // Full module permission (e.g. "FINANCEIRO") implies read permission ("FINANCEIRO.VIEW"),
      // NEVER the reverse ("FINANCEIRO.VIEW" must NOT grant "FINANCEIRO").
      if (taskCode.endsWith(".VIEW") && grantedTaskSet.has(taskCode.replace(/\.VIEW$/, ""))) {
        return true;
      }
      if (taskHierarchyResolver && taskHierarchyResolver(grantedTaskSet, taskCode)) {
        return true;
      }
      return false;
    },
    [isAdmin, grantedTaskSet, taskHierarchyResolver],
  );

  const hasAnyTask = useCallback(
    (taskCodes: string[]): boolean => {
      if (isAdmin) return true;
      if (!taskCodes || taskCodes.length === 0) return true;
      return taskCodes.some((code) => hasTask(code));
    },
    [isAdmin, hasTask],
  );

  const hasAllTasks = useCallback(
    (taskCodes: string[]): boolean => {
      if (isAdmin) return true;
      if (!taskCodes || taskCodes.length === 0) return true;
      return taskCodes.every((code) => hasTask(code));
    },
    [isAdmin, hasTask],
  );

  const canAccess = useCallback(
    (componentIdOrTask: string): boolean => {
      if (isAdmin) return true;
      if (!componentIdOrTask) return true;
      if (alwaysAllowedPredicate?.(componentIdOrTask)) return true;
      if (canAccessFn) return canAccessFn(componentIdOrTask);

      if (permissionsMap && componentIdOrTask in permissionsMap) {
        const mapped = permissionsMap[componentIdOrTask];
        return Array.isArray(mapped) ? hasAnyTask(mapped) : hasTask(mapped);
      }

      if (hasTask(componentIdOrTask)) {
        return true;
      }

      return defaultAllow;
    },
    [isAdmin, alwaysAllowedPredicate, canAccessFn, permissionsMap, hasAnyTask, hasTask, defaultAllow],
  );

  const refresh = useCallback(async () => {
    if (!onRefresh) return;
    setLoading(true);
    try {
      const res = await onRefresh();
      if (res) {
        if (res.tasks) setTasks(res.tasks);
        if (typeof res.isAdmin === "boolean") setIsAdmin(res.isAdmin);
      }
    } finally {
      setLoading(false);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!subscribeExternalSync) return;
    return subscribeExternalSync(() => {
      void refresh();
    });
  }, [subscribeExternalSync, refresh]);

  const value = useMemo<AccessControlData>(
    () => ({
      tasks,
      isAdmin,
      loading,
      hasTask,
      hasAnyTask,
      hasAllTasks,
      canAccess,
      refresh,
    }),
    [tasks, isAdmin, loading, hasTask, hasAnyTask, hasAllTasks, canAccess, refresh],
  );

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl(): AccessControlData {
  const context = useContext(AccessControlContext);
  return context ?? PERMISSIVE_FALLBACK;
}

export const usePermission = useAccessControl;
