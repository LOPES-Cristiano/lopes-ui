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
  /** Mapeamento opcional de componentId -> código(s) de tarefa */
  permissionsMap?: Record<string, string | string[]>;
  /** Função customizada opcional para resolver acesso por componentId ou tarefa */
  canAccessFn?: (componentIdOrTask: string) => boolean;
  /** Callback opcional para recarregar permissões */
  onRefresh?: () => Promise<{ tasks?: string[]; isAdmin?: boolean } | void>;
  /**
   * Comportamento padrão para componentIds não mapeados quando o usuário não é admin.
   * Default: `true` (permissivo por padrão na biblioteca de UI).
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

export function AccessControlProvider({
  children,
  initialTasks = EMPTY_TASKS,
  initialIsAdmin = false,
  permissionsMap,
  canAccessFn,
  onRefresh,
  defaultAllow = true,
}: AccessControlProviderProps) {
  const [tasks, setTasks] = useState<string[]>(initialTasks);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialIsAdmin);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync state when async session permissions arrive via props
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setIsAdmin(initialIsAdmin);
  }, [initialIsAdmin]);

  const hasTask = useCallback(
    (taskCode: string): boolean => {
      if (!taskCode) return true;
      if (tasks.includes(taskCode)) return true;
      // Full module permission (e.g. "FINANCEIRO") implies read permission ("FINANCEIRO.VIEW"),
      // NEVER the reverse ("FINANCEIRO.VIEW" must NOT grant "FINANCEIRO").
      if (taskCode.endsWith(".VIEW") && tasks.includes(taskCode.replace(/\.VIEW$/, ""))) {
        return true;
      }
      return false;
    },
    [tasks],
  );

  const hasAnyTask = useCallback(
    (taskCodes: string[]): boolean => {
      if (!taskCodes || taskCodes.length === 0) return true;
      return taskCodes.some((code) => hasTask(code));
    },
    [hasTask],
  );

  const hasAllTasks = useCallback(
    (taskCodes: string[]): boolean => {
      if (!taskCodes || taskCodes.length === 0) return true;
      return taskCodes.every((code) => hasTask(code));
    },
    [hasTask],
  );

  const canAccess = useCallback(
    (componentIdOrTask: string): boolean => {
      if (!componentIdOrTask) return true;
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
    [canAccessFn, permissionsMap, hasAnyTask, hasTask, defaultAllow],
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
