'use client';

import React from 'react';
import { useAccessControl } from './useAccessControl';

// ── Generic Controllable Wrapper ─────────────────────────────────────────────

export interface ControllableProps {
  componentId: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Controllable({ componentId, fallback = null, children }: ControllableProps) {
  const { canAccess } = useAccessControl();

  if (!canAccess(componentId)) {
    return <>{fallback}</>;
  }

  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ 'data-component-id'?: string }>, {
      'data-component-id': componentId,
    });
  }

  return (
    <span data-component-id={componentId}>
      {children}
    </span>
  );
}

// ── Controllable Drop-In HTML Elements ────────────────────────────────────────

export interface ControllableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  componentId?: string;
  hideIfDenied?: boolean;
}

export const ControllableButton = React.forwardRef<HTMLButtonElement, ControllableButtonProps>(
  ({ componentId, hideIfDenied = true, disabled, children, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    return (
      <button
        ref={ref}
        {...(componentId ? { 'data-component-id': componentId } : {})}
        disabled={disabled || !hasPermission}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ControllableButton.displayName = 'ControllableButton';

export interface ControllableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  componentId?: string;
  hideIfDenied?: boolean;
}

export const ControllableInput = React.forwardRef<HTMLInputElement, ControllableInputProps>(
  ({ componentId, hideIfDenied = false, disabled, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    return (
      <input
        ref={ref}
        {...(componentId ? { 'data-component-id': componentId } : {})}
        disabled={disabled || !hasPermission}
        {...props}
      />
    );
  }
);
ControllableInput.displayName = 'ControllableInput';

export interface ControllableSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  componentId?: string;
  hideIfDenied?: boolean;
}

export const ControllableSelect = React.forwardRef<HTMLSelectElement, ControllableSelectProps>(
  ({ componentId, hideIfDenied = false, disabled, children, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    return (
      <select
        ref={ref}
        {...(componentId ? { 'data-component-id': componentId } : {})}
        disabled={disabled || !hasPermission}
        {...props}
      >
        {children}
      </select>
    );
  }
);
ControllableSelect.displayName = 'ControllableSelect';

export interface ControllableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  componentId?: string;
  hideIfDenied?: boolean;
}

export const ControllableTextarea = React.forwardRef<HTMLTextAreaElement, ControllableTextareaProps>(
  ({ componentId, hideIfDenied = false, disabled, children, ...props }, ref) => {
    const { canAccess } = useAccessControl();
    const hasPermission = !componentId || canAccess(componentId);

    if (!hasPermission && hideIfDenied) {
      return null;
    }

    return (
      <textarea
        ref={ref}
        {...(componentId ? { 'data-component-id': componentId } : {})}
        disabled={disabled || !hasPermission}
        {...props}
      >
        {children}
      </textarea>
    );
  }
);
ControllableTextarea.displayName = 'ControllableTextarea';

export default Controllable;
