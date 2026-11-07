'use client';

import React, { useState, useCallback, useSyncExternalStore } from 'react';
import { cn } from '../utils/cn';
import { hasOpenFloatingOverlay } from '../utils/overlay';
import { AlertTriangle, Trash2, X, type LucideIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from './primitives/alert-dialog';
import Button from './Button';
import { useEscKey } from './Modal';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

export type ConfirmDialogSize =
  | 'xs'
  | 'compact'
  | 'sm'
  | 'md'
  | 'mdVertical'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'full'
  | 'fullscreen'
  | 'xlVertical';

const confirmSizeConfig: Record<
  ConfirmDialogSize,
  { maxWidth: string; height: string; maxHeight: string }
> = {
  xs: { maxWidth: '400px', height: 'auto', maxHeight: '80dvh' },
  compact: { maxWidth: '480px', height: 'auto', maxHeight: '85dvh' },
  sm: { maxWidth: '520px', height: 'auto', maxHeight: '88dvh' },
  md: { maxWidth: '640px', height: 'auto', maxHeight: '90dvh' },
  mdVertical: { maxWidth: '720px', height: '80dvh', maxHeight: '98dvh' },
  lg: { maxWidth: '800px', height: 'auto', maxHeight: '92dvh' },
  xl: { maxWidth: '1100px', height: 'auto', maxHeight: '94dvh' },
  '2xl': { maxWidth: '1280px', height: 'auto', maxHeight: '95dvh' },
  full: { maxWidth: '96vw', height: '92dvh', maxHeight: '96dvh' },
  fullscreen: { maxWidth: '100vw', height: '100dvh', maxHeight: '100dvh' },
  xlVertical: { maxWidth: '1380px', height: '97dvh', maxHeight: '98dvh' },
};

function subscribeMobileViewport(cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(max-width: 639px)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function getMobileViewportSnapshot() {
  return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
}

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: ConfirmDialogVariant;
  size?: ConfirmDialogSize;
  maxWidth?: number | string;
  maxHeight?: number | string;
  height?: number | string;
  icon?: LucideIcon;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
  componentId?: string;
  fullMobile?: boolean;
  showCloseButton?: boolean;
};

type VConfig = {
  icon: LucideIcon;
  iconBg: string;
  iconCls: string;
  buttonVariant: 'destructive' | 'warning' | 'primary';
};

const VARIANTS: Record<ConfirmDialogVariant, VConfig> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-danger-soft text-danger-soft-foreground border border-danger-border/60',
    iconCls: 'text-danger',
    buttonVariant: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-warning-soft text-warning-soft-foreground border border-warning-border/60',
    iconCls: 'text-warning',
    buttonVariant: 'warning',
  },
  info: {
    icon: AlertTriangle,
    iconBg: 'bg-info-soft text-info-soft-foreground border border-info-border/60',
    iconCls: 'text-info',
    buttonVariant: 'primary',
  },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  variant = 'danger',
  size = 'md',
  maxWidth,
  maxHeight,
  height,
  icon: CustomIcon,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
  onClose,
  className,
  componentId,
  fullMobile = false,
  showCloseButton,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const isMobile = useSyncExternalStore(
    subscribeMobileViewport,
    getMobileViewportSnapshot,
    () => false
  );
  const cfg = VARIANTS[variant];
  const Icon = CustomIcon ?? cfg.icon;
  const isLoading = loading || busy;

  const isFullMobile = fullMobile || size === 'fullscreen' || size === 'full';
  const cfgSize = size ? (confirmSizeConfig[size] ?? confirmSizeConfig.md) : confirmSizeConfig.md;

  const finalMaxWidth =
    isFullMobile && isMobile
      ? '100vw'
      : maxWidth !== undefined
        ? typeof maxWidth === 'number'
          ? `${maxWidth}px`
          : maxWidth
        : cfgSize.maxWidth;

  const finalHeight =
    isFullMobile && isMobile
      ? '100dvh'
      : height !== undefined
        ? typeof height === 'number'
          ? `${height}px`
          : height
        : cfgSize.height;

  const finalMaxHeight =
    isFullMobile && isMobile
      ? '100dvh'
      : maxHeight !== undefined
        ? typeof maxHeight === 'number'
          ? `${maxHeight}px`
          : maxHeight
        : cfgSize.maxHeight;

  const handleClose = useCallback(() => {
    if (isLoading) return;
    if (onCancel) onCancel();
    else if (onClose) onClose();
  }, [isLoading, onCancel, onClose]);

  useEscKey(handleClose, open);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const result = onConfirm();
    if (result instanceof Promise) {
      setBusy(true);
      try {
        await result;
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isLoading) {
          handleClose();
        }
      }}
    >
      <AlertDialogContent
        overlayClassName="fixed inset-0 z-[7800] bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
        onEscapeKeyDown={(e) => {
          if (isLoading || hasOpenFloatingOverlay()) {
            e.preventDefault();
          }
        }}
        data-component-id={componentId}
        style={{
          width: isFullMobile && isMobile ? '100%' : undefined,
          maxWidth: isFullMobile && isMobile ? '100vw' : `min(${finalMaxWidth}, calc(100vw - 2rem))`,
          height: finalHeight,
          maxHeight: finalMaxHeight,
        }}
        className={cn(
          'fixed left-1/2 top-1/2 z-[7800] -translate-x-1/2 -translate-y-1/2',
          'w-[calc(100vw-2rem)] sm:w-full max-w-[calc(100vw-2rem)] sm:max-w-none bg-card border border-border text-card-foreground shadow-[var(--shadow-overlay)] rounded-[var(--radius-overlay)] p-4 sm:p-6 overflow-hidden box-border overscroll-contain',
          'flex flex-col duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] motion-reduce:animate-none',
          isFullMobile && [
            'max-sm:!fixed max-sm:!inset-0 max-sm:!top-0 max-sm:!left-0 max-sm:!right-0 max-sm:!bottom-0',
            'max-sm:!translate-x-0 max-sm:!translate-y-0',
            'max-sm:!w-full max-sm:!h-[100dvh] max-sm:!max-w-none max-sm:!max-h-[100dvh]',
            'max-sm:!rounded-none max-sm:!border-none max-sm:p-4 max-sm:pt-[max(1rem,env(safe-area-inset-top))]',
            'max-sm:data-[state=closed]:!slide-out-to-left-0 max-sm:data-[state=closed]:!slide-out-to-top-0',
            'max-sm:data-[state=open]:!slide-in-from-left-0 max-sm:data-[state=open]:!slide-in-from-top-0',
          ],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 shrink-0 pb-2 border-b border-border/20">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'shrink-0 flex items-center justify-center h-10 w-10 rounded-xl',
                cfg.iconBg
              )}
            >
              <Icon size={20} className={cfg.iconCls} strokeWidth={1.75} />
            </div>

            <AlertDialogHeader className="min-w-0 text-left space-y-1">
              <AlertDialogTitle className="text-base font-semibold text-foreground leading-tight text-balance">
                {title ?? 'Confirmar ação'}
              </AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground text-pretty">
                  {description}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
          </div>

          {(showCloseButton ?? isFullMobile) && (
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="inline-flex h-7 w-7 items-center justify-center -mr-1 -mt-1 rounded-[var(--radius-control)] text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer shrink-0 disabled:opacity-50"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body com Scroll Interno */}
        {children && (
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 text-sm text-muted-foreground w-full py-2 px-1 -mx-1 flex flex-col">
            {children}
          </div>
        )}

        {/* Footer */}
        <AlertDialogFooter
          className={cn(
            'flex items-center justify-end gap-2.5 pt-3 shrink-0 border-t border-border/40',
            isFullMobile && 'max-sm:flex-col-reverse max-sm:items-stretch max-sm:gap-2 max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]'
          )}
        >
          <AlertDialogCancel asChild>
            <Button
              componentId={componentId ? `${componentId}.cancel` : undefined}
              hideIfDenied={false}
              data-component-id={componentId ? `${componentId}.cancel` : 'erp.components.confirm-dialog.btn.cancellabel'}
              type="button"
              variant="outline"
              size="md"
              disabled={isLoading}
              className={isFullMobile ? 'w-full sm:w-auto' : undefined}
            >
              {cancelLabel}
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              componentId={componentId ? `${componentId}.confirm` : undefined}
              hideIfDenied={false}
              data-component-id={componentId ? `${componentId}.confirm` : 'erp.components.confirm-dialog.btn.confirmlabel'}
              type="button"
              variant={cfg.buttonVariant}
              size="md"
              loading={isLoading}
              disabled={isLoading}
              onClick={handleConfirm}
              className={isFullMobile ? 'w-full sm:w-auto' : undefined}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
