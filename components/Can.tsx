'use client';

import React from 'react';
import { useAccessControl } from './useAccessControl';

export interface CanProps {
  componentId?: string;
  task?: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente para renderização condicional de UI baseada em tarefas ou componentId no ERP.
 * 
 * Exemplos:
 * <Can componentId="erp.venda.pedido.btn.novo">
 *   <Button>Novo Pedido</Button>
 * </Can>
 * 
 * <Can task="ERP.VENDA.FATURAR">
 *   <Button>Faturar</Button>
 * </Can>
 */
export function Can({ componentId, task, fallback = null, children }: CanProps) {
  const { canAccess, hasTask, hasAnyTask } = useAccessControl();

  if (task) {
    const permitted = Array.isArray(task) ? hasAnyTask(task) : hasTask(task);
    if (!permitted) return <>{fallback}</>;
  }

  if (componentId) {
    const permitted = canAccess(componentId);
    if (!permitted) return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default Can;
