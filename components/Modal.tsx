'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Pilha global de callbacks de fechamento dos modais abertos.
 * O handler de ESC sempre fecha apenas o topo da pilha (um modal de cada vez).
 */
interface ModalStackEntry {
  id: string;
  onClose: () => void;
}

const modalStack: ModalStackEntry[] = [];
const modalListeners = new Set<() => void>();

function notifyModalListeners() {
  if (typeof document !== 'undefined') {
    if (modalStack.length > 0) {
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-modal-open');
    }
  }
  modalListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export function useHasOpenModal(): boolean {
  const [hasOpen, setHasOpen] = useState(false);
  useEffect(() => {
    const update = () => setHasOpen(modalStack.length > 0);
    modalListeners.add(update);
    update();
    return () => {
      modalListeners.delete(update);
    };
  }, []);
  return hasOpen;
}

export function useModalStackCount(): number {
  const [count, setCount] = useState(() => modalStack.length);
  useEffect(() => {
    const update = () => setCount(modalStack.length);
    modalListeners.add(update);
    update();
    return () => {
      modalListeners.delete(update);
    };
  }, []);
  return count;
}

export function registerModal(onClose: () => void) {
  const modalId = `modal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  if (typeof window !== 'undefined' && modalStack.length === 0) {
    window.addEventListener('keydown', handleGlobalEsc, true);
  }

  modalStack.push({ id: modalId, onClose });
  notifyModalListeners();
}

export function unregisterModal(onClose: () => void) {
  let idx = -1;
  for (let i = modalStack.length - 1; i >= 0; i--) {
    if (modalStack[i].onClose === onClose) {
      idx = i;
      break;
    }
  }
  if (idx !== -1) {
    modalStack.splice(idx, 1);
  }
  notifyModalListeners();
  if (modalStack.length === 0 && typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalEsc, true);
  }
}

export function useEscKey(onEsc: () => void, active: boolean = true) {
  const onEscRef = React.useRef(onEsc);
  useEffect(() => {
    onEscRef.current = onEsc;
  });

  useEffect(() => {
    if (!active) return;
    const handleClose = () => onEscRef.current?.();
    registerModal(handleClose);
    return () => unregisterModal(handleClose);
  }, [active]);
}

function handleGlobalEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && modalStack.length > 0) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const top = modalStack[modalStack.length - 1];
    top.onClose();
  }
}

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number | string;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  compact?: boolean;
  size?:
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'full'
  | 'fullscreen'
  | 'compact'
  | 'xlVertical'
  | 'mdVertical';
  variant?: 'square' | 'rounded';
  footer?: React.ReactNode;
  footerClassName?: string;
  headerClassName?: string;
  closeButtonClassName?: string;
  padding?: number | string;
  noPadding?: boolean;
  hideCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
  fullMobile?: boolean;
  offsetHeader?: boolean;
  withinShell?: boolean;
  animation?: 'slide-right' | 'slide-left' | 'slide-from-right' | 'drawer' | 'zoom' | 'fade';
  componentId?: string;
  zIndex?: number;
}

const sizeConfig: Record<
  NonNullable<ModalProps['size']>,
  { maxWidth: string; height: string; maxHeight: string }
> = {
  compact: { maxWidth: '480px', height: 'auto', maxHeight: '85vh' },
  sm: { maxWidth: '520px', height: '380px', maxHeight: '88vh' },
  md: { maxWidth: '720px', height: '540px', maxHeight: '90vh' },
  mdVertical: { maxWidth: '720px', height: '97vh', maxHeight: '90vh' },
  lg: { maxWidth: '1100px', height: '82vh', maxHeight: '92vh' },
  xl: { maxWidth: '1280px', height: '85vh', maxHeight: '94vh' },
  '2xl': { maxWidth: '1440px', height: '88vh', maxHeight: '95vh' },
  full: { maxWidth: '96vw', height: '98vh', maxHeight: '98vh' },
  fullscreen: { maxWidth: '100vw', height: '100vh', maxHeight: '100vh' },
  xlVertical: { maxWidth: '1380px', height: '97vh', maxHeight: '98vh' },
};

export default function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth,
  height,
  minHeight,
  maxHeight,
  compact = false,
  size,
  variant = 'square',
  footer,
  footerClassName,
  headerClassName,
  closeButtonClassName,
  padding,
  noPadding = false,
  hideCloseButton = false,
  className = '',
  bodyClassName = '',
  fullMobile = true,
  offsetHeader = false,
  withinShell = false,
  animation,
  componentId,
  zIndex,
}: ModalProps) {
  const isActuallyOpen = isOpen !== undefined ? isOpen : (open ?? true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const onCloseRef = React.useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  /* Registra/desregistra na pilha global — só o topo recebe ESC e o evento Voltar */
  useEffect(() => {
    if (!isActuallyOpen) return;
    const handleClose = () => {
      onCloseRef.current?.();
    };
    registerModal(handleClose);
    return () => unregisterModal(handleClose);
  }, [isActuallyOpen]);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isActuallyOpen || !mounted) return null;

  const isFullscreen = size === 'fullscreen';
  const isFullscreenMobile =
    isFullscreen ||
    (isMobile &&
      (fullMobile ||
        size === 'xl' ||
        size === '2xl' ||
        size === 'full' ||
        size === 'xlVertical' ||
        size === 'lg'));

  const resolvedSize = size ?? (compact ? 'compact' : undefined);
  const cfg = resolvedSize ? sizeConfig[resolvedSize] : undefined;

  const shouldUseShellPortal = (withinShell || offsetHeader);
  const shellContainer =
    typeof document !== 'undefined' && shouldUseShellPortal
      ? document.getElementById('erp-workspace-container')
      : null;

  const animationClass =
    animation === 'drawer' || animation === 'slide-from-right' || (!animation && (isFullscreen || offsetHeader || withinShell))
      ? 'animate-drawer-slide-in'
      : animation === 'slide-left'
        ? 'animate-slide-in-left'
        : animation === 'slide-right'
          ? 'animate-slide-in-right'
          : animation === 'fade'
            ? 'animate-in fade-in-0 duration-200'
            : 'animate-in fade-in-0 zoom-in-95 duration-200';

  const finalMaxWidth = isFullscreen
    ? shellContainer
      ? '100%'
      : '100vw'
    : isFullscreenMobile
      ? '100vw'
      : isMobile
        ? '95vw'
        : maxWidth !== undefined
          ? typeof maxWidth === 'number'
            ? `${maxWidth}px`
            : maxWidth
          : shellContainer && cfg?.maxWidth
            ? `min(${cfg.maxWidth}, calc(100% - 2.5rem))`
            : (cfg?.maxWidth ?? '640px');

  const finalHeight = isFullscreen
    ? shellContainer
      ? '100%'
      : offsetHeader
        ? 'calc(100dvh - 56px)'
        : '100dvh'
    : isFullscreenMobile
      ? shellContainer
        ? '100%'
        : offsetHeader
          ? 'calc(100dvh - 56px)'
          : '100dvh'
      : isMobile
        ? 'auto'
        : height !== undefined
          ? typeof height === 'number'
            ? `${height}px`
            : height
          : shellContainer && cfg?.height
            ? `min(${cfg.height}, calc(100% - 2.5rem))`
            : (cfg?.height ?? 'auto');

  const finalMinHeight =
    minHeight !== undefined
      ? typeof minHeight === 'number'
        ? `${minHeight}px`
        : minHeight
      : undefined;

  const finalMaxHeight = isFullscreen
    ? shellContainer
      ? '100%'
      : offsetHeader
        ? 'calc(100dvh - 56px)'
        : '100dvh'
    : isFullscreenMobile
      ? shellContainer
        ? '100%'
        : offsetHeader
          ? 'calc(100dvh - 56px)'
          : '100dvh'
      : isMobile
        ? '92vh'
        : maxHeight !== undefined
          ? typeof maxHeight === 'number'
            ? `${maxHeight}px`
            : maxHeight
          : shellContainer
            ? 'calc(100% - 1.5rem)'
            : (cfg?.maxHeight ?? '90vh');

  const paddingStyle = noPadding
    ? 'p-0'
    : padding !== undefined
      ? typeof padding === 'number'
        ? `p-[${padding}px]`
        : `p-[${padding}]`
      : 'p-4 sm:p-6';

  const modalRoot = shellContainer || (typeof document !== 'undefined' ? document.body : null);
  if (!modalRoot) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={zIndex ? { zIndex } : undefined}
      className={cn(
        shellContainer
          ? isFullscreen || isFullscreenMobile
            ? 'absolute inset-0 z-30 flex items-stretch justify-center p-0 overflow-hidden'
            : 'absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-3 md:p-3 overflow-hidden'
          : offsetHeader
            ? 'fixed inset-x-0 bottom-0 top-14 sm:top-14 z-[45] flex items-stretch justify-center p-0 overflow-hidden'
            : cn('fixed inset-0 flex items-center justify-center overflow-hidden', !zIndex && 'z-[7000]'),
        !shellContainer && (isFullscreen ? 'p-0' : isFullscreenMobile ? 'p-0 sm:p-4' : 'p-3 sm:p-4')
      )}
    >
      {/* Overlay Backdrop com Blur */}
      <div
        className={cn(
          shellContainer
            ? 'absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-500'
            : 'fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-500',
          !shellContainer && offsetHeader && 'top-14'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        style={{
          width: '100%',
          maxWidth: finalMaxWidth,
          height: finalHeight,
          minHeight: finalMinHeight,
          maxHeight: finalMaxHeight,
        }}
        className={cn(
          'relative z-10 flex flex-col bg-card border border-border text-card-foreground shadow-2xl overflow-hidden antialiased',
          animationClass,
          isFullscreen
            ? 'rounded-none border-0 h-full w-full'
            : isFullscreenMobile
              ? variant === 'square'
                ? 'rounded-none sm:rounded-lg border-0 sm:border h-full sm:h-auto'
                : 'rounded-none sm:rounded-2xl border-0 sm:border h-full sm:h-auto'
              : variant === 'rounded'
                ? 'rounded-2xl'
                : variant === 'square'
                  ? 'rounded-lg'
                  : shellContainer
                    ? 'rounded-xl'
                    : 'rounded-lg',
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div
            className={cn(
              'flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-3.5 shrink-0',
              headerClassName
            )}
          >
            <div className="min-w-0 pr-4">
              {title && (
                <div
                  className={cn(
                    'text-base sm:text-lg font-semibold text-foreground leading-tight break-words',
                    headerClassName && 'text-inherit'
                  )}
                >
                  {title}
                </div>
              )}
              {description && (
                <p
                  className={cn(
                    'text-xs text-muted-foreground mt-0.5',
                    headerClassName && 'text-inherit opacity-80'
                  )}
                >
                  {description}
                </p>
              )}
            </div>
            <button
              data-component-id={componentId ? `${componentId}.close` : 'erp.modal.close'}
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-xl p-1.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer',
                headerClassName && 'text-inherit opacity-85 hover:opacity-100 hover:bg-white/20 dark:hover:bg-white/20 focus:ring-white/40',
                closeButtonClassName
              )}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Sem header explícito mas ainda precisa de botão fechar se não houver footer ou cabeçalho */}
        {!title && !description && !hideCloseButton && (
          <button
            data-component-id={componentId ? `${componentId}.close-icon` : 'erp.modal.close-icon'}
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 rounded-xl p-1.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Body */}
        <div className={cn('flex-1 overflow-y-auto min-h-0', paddingStyle, bodyClassName)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'border-t border-border bg-card shrink-0',
              noPadding ? 'p-0' : 'px-4 py-3 sm:px-6 sm:py-3.5',
              isFullscreen
                ? 'rounded-none'
                : isFullscreenMobile
                  ? 'rounded-none sm:rounded-b-2xl'
                  : variant === 'square'
                    ? 'rounded-none'
                    : 'rounded-b-2xl',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    modalRoot
  );
}
