'use client';

import { useAccessControl } from './useAccessControl';
import { type ReactNode, type CSSProperties, isValidElement, useEffect, useId, useRef } from 'react';
import Button from './Button';
import Modal from './Modal';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { twMerge } from 'tailwind-merge';

// ─── TYPES & INTERFACES ───────────────────────────────────────────────────────

export interface FormTabItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  hasError?: boolean;
  badge?: number | string;
  componentId?: string;
}

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  avatar?:
    | ReactNode
    | {
        initials?: string;
        image?: string | null;
        icon?: ReactNode;
        className?: string;
      };
  code?: string | number | null;
  badge?: ReactNode;
  isEditing?: boolean;
  saving?: boolean;
  loading?: boolean;
  tabs?: readonly FormTabItem[] | FormTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onBack?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  currentTabIndex?: number;
  hideNavigationButtons?: boolean;
  headerActions?: ReactNode;
  footerExtra?: ReactNode;
  componentIdPrefix?: string;
  maxWidth?: string;
  size?: 'xlVertical' | 'xl' | 'lg' | 'md' | 'full';
  children: ReactNode;
}

// ─── FORM MODAL PRINCIPAL ─────────────────────────────────────────────────────

export function FormModal({
  open,
  onClose,
  title,
  subtitle,
  avatar,
  code,
  badge,
  isEditing = false,
  saving = false,
  loading = false,
  tabs,
  activeTab,
  onTabChange,
  onBack,
  onNext,
  onSave,
  saveLabel,
  backLabel = 'Passo Anterior',
  nextLabel = 'Próximo Passo',
  currentTabIndex: propTabIndex,
  hideNavigationButtons = false,
  headerActions,
  footerExtra,
  componentIdPrefix,
  maxWidth,
  size = 'xlVertical',
  children,
}: FormModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const formModalTabsId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { canAccess } = useAccessControl();
  const domIdPrefix = componentIdPrefix || 'erp.form-modal';

  const accessibleTabs = (tabs ?? []).filter((t) => {
    const checkId = t.componentId || (componentIdPrefix ? `${componentIdPrefix}.tab.${t.id}` : undefined);
    return !checkId || canAccess(checkId);
  });
  const hasTabs = accessibleTabs.length > 0;
  const currentIndex =
    propTabIndex !== undefined
      ? propTabIndex
      : hasTabs && activeTab
      ? accessibleTabs.findIndex((t) => t.id === activeTab)
      : 0;
  const isFirstTab = currentIndex <= 0;
  const isLastTab = hasTabs ? currentIndex >= accessibleTabs.length - 1 : true;

  // Se a aba ativa atual não for acessível pelo usuário, direciona para a primeira permitida
  useEffect(() => {
    if (open && hasTabs && activeTab && !accessibleTabs.some((t) => t.id === activeTab)) {
      onTabChange?.(accessibleTabs[0].id);
    }
  }, [open, hasTabs, activeTab, accessibleTabs, onTabChange]);

  // Mantém a aba ativa visível na barra horizontal mobile ao navegar entre passos
  useEffect(() => {
    if (!open || !hasTabs || !activeTab) return;
    tabRefs.current[activeTab]?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [open, hasTabs, activeTab, prefersReducedMotion]);

  // Renderizador de avatar inteligente (iniciais, imagem ou ícone)
  const renderAvatar = () => {
    if (!avatar) return null;
    if (isValidElement(avatar)) return avatar;

    const av = avatar as {
      initials?: string;
      image?: string | null;
      icon?: ReactNode;
      className?: string;
    };

    if (av.image) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={av.image}
          alt="Avatar"
          className={twMerge(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-border shadow-xs shrink-0',
            av.className
          )}
        />
      );
    }

    return (
      <div
        className={twMerge(
          'flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shrink-0 shadow-xs',
          av.className
        )}
      >
        {av.initials || av.icon || 'PR'}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size={size}
      maxWidth={maxWidth}
      variant="rounded"
      noPadding
      hideCloseButton
      componentId={componentIdPrefix}
      className="!rounded-[var(--radius-overlay)] border border-border shadow-[var(--shadow-overlay)] overflow-hidden"
      bodyClassName="!overflow-hidden flex flex-col h-full max-h-full"
      footerClassName="p-0 border-t border-border bg-card"
      footer={
        !hideNavigationButtons && (
          <div className="flex flex-wrap sm:flex-nowrap w-full items-center justify-between gap-2 px-3 sm:px-6 pt-2.5 lopes-safe-bottom bg-card shrink-0 select-none">
            <div className="flex items-center gap-2">
              {hasTabs && onBack && (
                <Button
                  componentId={componentIdPrefix ? `${componentIdPrefix}.btn.passo-anterior` : undefined}
                  data-component-id={`${domIdPrefix}.btn.passo-anterior`}
                  type="button"
                  variant="secondary"
                  disabled={isFirstTab || loading || saving}
                  onClick={onBack}
                  leftIcon={<ChevronLeft size={15} />}
                  className={`rounded-lg text-xs font-semibold w-full sm:w-auto ${
                    isFirstTab ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {backLabel}
                </Button>
              )}
              {footerExtra}
            </div>

            <div className="flex items-center gap-2">
              {hasTabs && !isLastTab && onNext && (
                <Button
                  componentId={componentIdPrefix ? `${componentIdPrefix}.btn.avancar` : undefined}
                  data-component-id={`${domIdPrefix}.btn.avancar`}
                  type="button"
                  variant="primary"
                  disabled={loading || saving}
                  onClick={onNext}
                  rightIcon={<ChevronRight size={15} />}
                  className="!bg-primary hover:!bg-primary/90 !text-primary-foreground font-bold rounded-lg shadow-xs px-4 text-xs flex-1 sm:flex-none"
                >
                  {nextLabel}
                </Button>
              )}

              {onSave && (
                <Button
                  componentId={componentIdPrefix ? `${componentIdPrefix}.btn.salvar` : undefined}
                  data-component-id={`${domIdPrefix}.btn.salvar`}
                  type="button"
                  loading={saving}
                  disabled={loading}
                  onClick={onSave}
                  leftIcon={<Check size={15} className="!text-primary-foreground stroke-[3]" />}
                  className="!bg-primary hover:!bg-primary/90 !text-primary-foreground font-bold px-6 rounded-lg shadow-xs text-xs flex-1 sm:flex-none"
                >
                  {saveLabel || (isEditing ? 'Salvar Alterações' : 'Salvar e Concluir')}
                </Button>
              )}
            </div>
          </div>
        )
      }
    >
      {/* ── HEADER SUPERIOR ── */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-border bg-card shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {renderAvatar()}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate max-w-[150px] sm:max-w-none">
                {title}
              </h2>
              {code !== undefined && code !== null && code !== '' && (
                <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tabular-nums bg-muted text-muted-foreground border border-border shrink-0">
                  {code}
                </span>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerActions}
          <button
            type="button"
            aria-label="Fechar"
            data-component-id={`${domIdPrefix}.btn.fechar`}
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <form
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
          const target = e.target as HTMLElement | null;
          if (!target) return;
          const tag = target.tagName;
          if (
            tag === 'BUTTON' ||
            tag === 'A' ||
            tag === 'TEXTAREA' ||
            target.isContentEditable ||
            target.closest('button, a, textarea, [contenteditable="true"]')
          ) {
            return;
          }
          e.preventDefault();
        }}
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        {/* Anti-autofill dummy inputs */}
        <input
          data-component-id={`${domIdPrefix}.fake-username`}
          type="text"
          name="fake_username_ignore"
          tabIndex={-1}
          className="hidden"
          aria-hidden="true"
          autoComplete="off"
        />
        <input
          data-component-id={`${domIdPrefix}.fake-password`}
          type="password"
          name="fake_password_ignore"
          tabIndex={-1}
          className="hidden"
          aria-hidden="true"
          autoComplete="off"
        />

        <div
          className={twMerge(
            'min-h-0 flex-1 bg-background',
            hasTabs ? 'grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]' : 'flex flex-col'
          )}
        >
          {/* ── SIDEBAR / BARRA MOBILE DE NAVEGAÇÃO DAS ABAS (SE HOUVER TABS) ── */}
          {hasTabs && (
            <nav
              className="flex items-center gap-1 overflow-x-auto no-scrollbar snap-x snap-proximity border-b border-border bg-card px-2.5 py-2 lg:flex-col lg:items-stretch lg:gap-1.5 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3 lg:py-3 select-none shrink-0"
              aria-label="Módulos do formulário"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-1 hidden lg:block">
                Módulos do Cadastro
              </span>

              {accessibleTabs.map((tab) => {
                const selected = activeTab === tab.id;
                const hasTabError = Boolean(tab.hasError);

                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[tab.id] = el;
                    }}
                    type="button"
                    data-component-id={tab.componentId || `${domIdPrefix}.tab.${tab.id}`}
                    onClick={() => onTabChange?.(tab.id)}
                    aria-current={selected ? 'page' : undefined}
                    className={twMerge(
                      'relative flex min-h-9 items-center justify-center lg:justify-start gap-2 px-3 py-2 rounded-[var(--radius-control)] text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shrink-0 snap-start lg:w-full',
                      selected
                        ? prefersReducedMotion
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {selected && !prefersReducedMotion && (
                      <motion.span
                        layoutId={`${formModalTabsId}-active-pill`}
                        transition={{ type: 'spring', stiffness: 430, damping: 34 }}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-0 rounded-[var(--radius-control)] bg-primary shadow-xs"
                      />
                    )}
                    {tab.icon && (
                      <span
                        className={twMerge(
                          'relative z-10 shrink-0',
                          selected ? 'text-primary-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {tab.icon}
                      </span>
                    )}
                    <span className="relative z-10 whitespace-nowrap lg:whitespace-normal lg:truncate lg:flex-1 lg:text-left leading-snug">
                      {tab.label}
                    </span>
                    {tab.badge !== undefined && tab.badge !== null && (
                      <span
                        className={twMerge(
                          'relative z-10 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums shrink-0',
                          selected
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {tab.badge}
                      </span>
                    )}
                    {hasTabError && (
                      <span className="relative z-10 w-2 h-2 rounded-full bg-danger ring-2 ring-card animate-pulse motion-reduce:animate-none shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* ── ÁREA CENTRAL DE CONTEÚDO ── */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-background">
            {loading ? <FormModalSkeleton /> : children}
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── FORM SECTION HEADER ─────────────────────────────────────────────────────

export interface FormSectionHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FormSectionHeader({
  title,
  description,
  icon,
  actions,
  className,
}: FormSectionHeaderProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/70',
        className
      )}
    >
      <div className="space-y-0.5 min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h3>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ─── FORM SECTION ────────────────────────────────────────────────────────────

export function FormSection({
  children,
  dividerTop = false,
  className,
}: {
  children: ReactNode;
  dividerTop?: boolean;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'space-y-4',
        dividerTop && 'pt-5 border-t border-border/70',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── FORM EMPTY LINE ─────────────────────────────────────────────────────────

export function FormEmptyLine({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

// ─── FORM SKELETON (BONE) ────────────────────────────────────────────────────

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={twMerge('rounded-md bg-muted animate-pulse motion-reduce:animate-none', className)}
      style={style}
    />
  );
}

export function FormModalSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-left">
      {/* Seção 1 Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/70">
          <div className="space-y-1">
            <Bone className="h-4 w-52" />
            <Bone className="h-3 w-80" />
          </div>
          <Bone className="h-7 w-24 rounded-lg" />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Bone className="h-3.5 w-28" />
              <Bone className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-9 w-full rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Bone className="h-3.5 w-32" />
              <Bone className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Bone className="h-3.5 w-20" />
              <Bone className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2 Skeleton */}
      <div className="pt-5 border-t border-border/70 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/70">
          <div className="space-y-1">
            <Bone className="h-4 w-48" />
            <Bone className="h-3 w-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Bone className="h-3.5 w-20" />
              <Bone className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormModal;
