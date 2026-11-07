'use client';

import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useAccessControl } from './useAccessControl';
import StatusPage from './StatusPage';
import Button from './Button';
import { cn } from '../utils/cn';
import { sanitizeSafeHref } from '../utils/sanitize';

export interface AccessDeniedStateProps {
  /** Optional resource or screen name highlighted in the default message */
  resourceName?: string;
  /** Custom title (defaults to "Acesso restrito") */
  title?: string;
  /** Custom description */
  description?: string;
  /** Optional illustration URL passed to `StatusPage` */
  image?: string;
  /** Optional dark-mode illustration URL passed to `StatusPage` */
  darkImage?: string;
  /** Optional home URL rendered as a primary link/action */
  homeHref?: string;
  /** Label for the home button */
  homeLabel?: string;
  /** Callback for the primary home button */
  onGoHome?: () => void;
  /** Callback for the back button */
  onBack?: () => void;
  /** Label for the back button */
  backLabel?: string;
  /** Custom actions overriding the default buttons */
  actions?: React.ReactNode;
  className?: string;
  componentId?: string;
}

export function AccessDeniedState({
  resourceName,
  title = 'Acesso restrito',
  description,
  image,
  darkImage,
  homeHref,
  homeLabel = 'Voltar ao Início',
  onGoHome,
  onBack,
  backLabel = 'Voltar',
  actions,
  className,
  componentId,
}: AccessDeniedStateProps) {
  const safeHomeHref = homeHref ? sanitizeSafeHref(homeHref) : null;
  const resolvedDescription =
    description ??
    (resourceName
      ? `Seu perfil não possui permissão para acessar "${resourceName}". Solicite a liberação ao administrador.`
      : 'Seu perfil não possui permissão para acessar este recurso. Solicite a liberação ao administrador.');

  const defaultActions =
    onBack || onGoHome || safeHomeHref ? (
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {onBack && (
          <Button
            componentId={componentId ? `${componentId}.back` : undefined}
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft size={14} />}
          >
            {backLabel}
          </Button>
        )}
        {onGoHome ? (
          <Button
            componentId={componentId ? `${componentId}.home` : undefined}
            variant="primary"
            size="sm"
            onClick={onGoHome}
            leftIcon={<Home size={14} />}
          >
            {homeLabel}
          </Button>
        ) : safeHomeHref ? (
          <a
            href={safeHomeHref}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Home size={14} />
            {homeLabel}
          </a>
        ) : null}
      </div>
    ) : undefined;

  return (
    <div
      data-component-id={componentId || undefined}
      className={cn('flex w-full items-center justify-center p-4', className)}
    >
      <StatusPage
        variant="403"
        code={403}
        title={title}
        description={resolvedDescription}
        image={image}
        darkImageSrc={darkImage}
        rotatingWords={[
          'Sem permissão',
          'Acesso restrito',
          'Área controlada',
          'Consulte o administrador',
        ]}
        actions={actions ?? defaultActions}
      />
    </div>
  );
}

export interface AccessGuardProps {
  children: React.ReactNode;
  /** Single task/component identifier checked via `canAccess` */
  task?: string;
  /** Alias for `task` preserved for page/screen guard ergonomics */
  componentId?: string;
  /** Grant access if the user has ANY of these permissions */
  anyOf?: string[];
  /** Require ALL of these permissions */
  allOf?: string[];
  /** Custom loading indicator while permissions are being resolved */
  loadingFallback?: React.ReactNode;
  /** Custom fallback when access is denied (defaults to `AccessDeniedState`) */
  fallback?: React.ReactNode;
  /** Props forwarded to the default `AccessDeniedState` when `fallback` is omitted */
  deniedProps?: AccessDeniedStateProps;
}

export function AccessGuard({
  children,
  task,
  componentId,
  anyOf,
  allOf,
  loadingFallback,
  fallback,
  deniedProps,
}: AccessGuardProps) {
  const { canAccess, loading } = useAccessControl();

  if (loading) {
    if (loadingFallback !== undefined) {
      return <>{loadingFallback}</>;
    }
    return (
      <div
        role="status"
        aria-label="Verificando permissões"
        className="flex min-h-[320px] w-full items-center justify-center"
      >
        <div className="h-8 w-8 animate-spin motion-reduce:animate-none rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const singleKey = task ?? componentId;
  let allowed = true;

  if (singleKey && !canAccess(singleKey)) {
    allowed = false;
  }
  if (allowed && anyOf && anyOf.length > 0) {
    allowed = anyOf.some((item) => canAccess(item));
  }
  if (allowed && allOf && allOf.length > 0) {
    allowed = allOf.every((item) => canAccess(item));
  }

  if (!allowed) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return <AccessDeniedState {...deniedProps} />;
  }

  return <>{children}</>;
}

export default AccessGuard;
