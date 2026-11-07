'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/cn';

export interface ErrorBoundaryFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI or render prop */
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  /** Heading displayed in the default error state */
  title?: string;
  /** Alias preserved for ERP compatibility */
  fallbackTitle?: string;
  /** Description displayed when error has no message or `hideErrorMessage` is true */
  description?: string;
  /** Hide the raw `error.message` from end users in production */
  hideErrorMessage?: boolean;
  /** Label for the retry action button */
  retryLabel?: string;
  /** Show expandable stack trace (defaults to `process.env.NODE_ENV === 'development'`) */
  showDetails?: boolean;
  /** Keys that automatically reset the error boundary when any item changes */
  resetKeys?: ReadonlyArray<unknown>;
  /** Callback fired when the user clicks retry or `resetKeys` change */
  onReset?: () => void;
  /** Callback fired when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
  componentId?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  detailsOpen: boolean;
}

function areResetKeysEqual(
  prev?: ReadonlyArray<unknown>,
  next?: ReadonlyArray<unknown>,
): boolean {
  if (prev === next) return true;
  if (!prev || !next || prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i++) {
    if (!Object.is(prev[i], next[i])) return false;
  }
  return true;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, detailsOpen: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      !areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null, detailsOpen: false });
    this.props.onReset?.();
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ detailsOpen: !prev.detailsOpen }));
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const {
      fallback,
      title,
      fallbackTitle,
      description,
      hideErrorMessage = false,
      retryLabel = 'Tentar novamente',
      showDetails = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',
      className,
      componentId,
    } = this.props;

    if (typeof fallback === 'function') {
      return fallback({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    if (fallback !== undefined) {
      return fallback;
    }

    const resolvedTitle =
      title ?? fallbackTitle ?? 'Houve uma falha ao exibir este painel';
    const resolvedDescription =
      (!hideErrorMessage && this.state.error?.message) ||
      description ||
      'Ocorreu um erro inesperado durante a renderização deste componente.';
    const stack = this.state.error?.stack;

    return (
      <div
        role="alert"
        data-component-id={componentId || undefined}
        className={cn(
          'flex flex-col items-center justify-center min-h-[260px] p-6 text-center bg-card text-card-foreground rounded-2xl border border-border shadow-xs',
          className,
        )}
      >
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3 shrink-0">
          <AlertTriangle size={22} />
        </div>

        <h3 className="text-base font-bold text-foreground mb-1">
          {resolvedTitle}
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-4 leading-relaxed">
          {resolvedDescription}
        </p>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Button
            componentId={componentId ? `${componentId}.retry` : undefined}
            size="sm"
            variant="outline"
            onClick={this.resetErrorBoundary}
            leftIcon={<RefreshCw size={14} />}
          >
            {retryLabel}
          </Button>

          {showDetails && stack && (
            <Button
              size="sm"
              variant="ghost"
              onClick={this.toggleDetails}
              rightIcon={
                this.state.detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />
              }
            >
              {this.state.detailsOpen ? 'Ocultar detalhes' : 'Detalhes técnicos'}
            </Button>
          )}
        </div>

        {showDetails && stack && this.state.detailsOpen && (
          <pre className="mt-4 w-full max-w-2xl max-h-56 overflow-auto rounded-xl border border-border bg-muted/60 p-3 text-left text-[11px] font-mono text-muted-foreground leading-relaxed">
            {stack}
          </pre>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
