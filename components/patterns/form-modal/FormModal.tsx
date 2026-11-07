'use client';

import * as React from 'react';
import { createContext, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../../primitives/dialog';
import { X, Check, type LucideIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { hasOpenFloatingOverlay, isFloatingOverlayTarget } from '../../../utils/overlay';
import Button from '../../Button';

// ── Context ───────────────────────────────────────────────────────────────────

type FormModalContextValue = {
  open: boolean;
  onClose: () => void;
  size: FormModalSize;
  loading?: boolean;
  hasHeaderTitle: boolean;
  setHasHeaderTitle: (hasTitle: boolean) => void;
  componentId?: string;
};

const FormModalContext = createContext<FormModalContextValue | null>(null);

export function useFormModal() {
  const ctx = useContext(FormModalContext);
  if (!ctx) {
    throw new Error('FormModal subcomponents must be used within a <FormModal>');
  }
  return ctx;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type FormModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  'aria-label'?: string;
  size?: FormModalSize;
  maxWidth?: string | number;
  preventCloseOnBackdrop?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  componentId?: string;
}

export interface FormModalHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  iconColor?: 'default' | 'primary' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export interface FormModalBodyProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export interface FormModalActionsProps {
  onCancel?: () => void;
  onSubmit?: (e?: React.FormEvent) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  submitIcon?: React.ReactNode;
  submitType?: 'button' | 'submit';
  leftActions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  componentId?: string;
}

// ── Size maps ─────────────────────────────────────────────────────────────────

const SIZE_CLASSES: Record<FormModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-[96vw] h-[92dvh]',
};

// ── Root FormModal ────────────────────────────────────────────────────────────

export function FormModal({
  open,
  onClose,
  title,
  ariaLabel,
  'aria-label': ariaLabelAttr,
  size = 'md',
  maxWidth,
  preventCloseOnBackdrop = false,
  loading = false,
  className,
  children,
  componentId,
}: FormModalProps) {
  const [hasHeaderTitle, setHasHeaderTitle] = React.useState(false);
  const accessibleTitle = title ?? ariaLabel ?? ariaLabelAttr ?? 'Formulário';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !loading) {
          onClose();
        }
      }}
    >
      <DialogContent
        hideCloseButton
        overlayClassName="fixed inset-0 z-[7000] bg-black/55 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
        aria-modal="true"
        style={maxWidth ? { maxWidth } : undefined}
        onPointerDownOutside={(e) => {
          const rawTarget = e.detail?.originalEvent?.target ?? e.target;
          if (preventCloseOnBackdrop || loading || isFloatingOverlayTarget(rawTarget)) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const rawTarget = e.detail?.originalEvent?.target ?? e.target;
          if (preventCloseOnBackdrop || loading || isFloatingOverlayTarget(rawTarget)) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          const rawTarget = e.detail?.originalEvent?.target ?? e.target;
          if (isFloatingOverlayTarget(rawTarget)) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (loading || hasOpenFloatingOverlay()) {
            e.preventDefault();
          }
        }}
        className={cn(
          'fixed left-[50%] top-[50%] z-[7000] translate-x-[-50%] translate-y-[-50%]',
          'w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2.5rem)] max-h-[calc(100dvh-2rem)] flex flex-col',
          'bg-card border border-border text-card-foreground shadow-[var(--shadow-overlay)] overflow-hidden rounded-[var(--radius-overlay)] p-0 overscroll-contain',
          'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] motion-reduce:animate-none',
          SIZE_CLASSES[size],
          className
        )}
        {...(componentId ? { 'data-component-id': componentId } : {})}
      >
        {/* Fallback accessible title when no FormModalHeader is present */}
        {!hasHeaderTitle && <DialogTitle className="sr-only">{accessibleTitle}</DialogTitle>}

        <FormModalContext.Provider
          value={{ open, onClose, size, loading, hasHeaderTitle, setHasHeaderTitle, componentId }}
        >
          {children}
        </FormModalContext.Provider>
      </DialogContent>
    </Dialog>
  );
}

// ── FormModal.Header ──────────────────────────────────────────────────────────

export function FormModalHeader({
  title,
  subtitle,
  description,
  icon: IconProp,
  iconColor = 'primary',
  onClose: customOnClose,
  actions,
  className,
}: FormModalHeaderProps) {
  const { setHasHeaderTitle, loading, componentId } = useFormModal();
  const desc = subtitle ?? description;

  React.useEffect(() => {
    setHasHeaderTitle(true);
    return () => setHasHeaderTitle(false);
  }, [setHasHeaderTitle]);

  const iconColorStyles: Record<string, string> = {
    default: 'bg-muted text-muted-foreground border border-border/60',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    brand: 'bg-brand-soft text-brand border border-brand-border/60',
    success: 'bg-success-soft text-success border border-success-border/60',
    warning: 'bg-warning-soft text-warning border border-warning-border/60',
    danger: 'bg-danger-soft text-danger border border-danger-border/60',
    info: 'bg-info-soft text-info border border-info-border/60',
  };

  const renderIcon = () => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) {
      return (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs',
            iconColorStyles[iconColor]
          )}
        >
          {IconProp}
        </span>
      );
    }
    if (typeof IconProp === 'function' || typeof IconProp === 'object') {
      const Comp = IconProp as React.ComponentType<{ size?: number; className?: string }>;
      return (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs',
            iconColorStyles[iconColor]
          )}
        >
          <Comp size={18} />
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-5 sm:px-6 py-3.5 border-b border-border/70 bg-card shrink-0',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {renderIcon()}
        <div className="min-w-0">
          <DialogTitle className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-snug truncate">
            {title}
          </DialogTitle>
          {desc && (
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {desc}
            </DialogDescription>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <DialogClose asChild>
          <button
            data-component-id={componentId ? `${componentId}.close` : 'erp.form-modal.close'}
            type="button"
            disabled={loading}
            onClick={
              customOnClose
                ? (e) => {
                    e.preventDefault();
                    customOnClose();
                  }
                : undefined
            }
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X size={16} />
          </button>
        </DialogClose>
      </div>
    </div>
  );
}

// ── FormModal.Body ────────────────────────────────────────────────────────────

export function FormModalBody({ children, className, noPadding = false }: FormModalBodyProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto overscroll-contain min-h-0', !noPadding && 'px-5 sm:px-6 py-5', className)}>
      {children}
    </div>
  );
}

// ── FormModal.Actions ─────────────────────────────────────────────────────────

export function FormModalActions({
  onCancel,
  onSubmit,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading: localLoading,
  disabled = false,
  submitIcon = <Check size={15} />,
  submitType = 'submit',
  leftActions,
  children,
  className,
  componentId: customComponentId,
}: FormModalActionsProps) {
  const { onClose: ctxOnClose, loading: ctxLoading, componentId: ctxComponentId } = useFormModal();
  const componentId = customComponentId || ctxComponentId;
  const handleCancel = onCancel ?? ctxOnClose;
  const isLoading = localLoading ?? ctxLoading;

  if (children) {
    return (
      <div
        className={cn(
          'flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-border/70 bg-muted/20 shrink-0',
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-t border-border/70 bg-muted/20 shrink-0',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">{leftActions}</div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isLoading || disabled}
          onClick={handleCancel}
          componentId={componentId ? `${componentId}.btn.cancelar` : undefined}
          data-component-id={componentId ? `${componentId}.btn.cancelar` : 'erp.form-modal.btn.cancelar'}
        >
          {cancelLabel}
        </Button>
        <Button
          type={submitType}
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={disabled}
          onClick={
            onSubmit
              ? (e) => {
                  void onSubmit(e);
                }
              : undefined
          }
          leftIcon={submitIcon}
          componentId={componentId ? `${componentId}.btn.salvar` : undefined}
          data-component-id={componentId ? `${componentId}.btn.salvar` : 'erp.form-modal.btn.salvar'}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default FormModal;
