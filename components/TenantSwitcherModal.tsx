'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, Building2, Check, Loader2, Search, X } from 'lucide-react';
import Modal from './Modal';
import { cn } from '../utils/cn';
import { useAccessControl } from './useAccessControl';

export interface TenantItem {
  id: string | number;
  name: string;
  /** Optional subtitle such as `"Porto Velho / RO"` or `"CNPJ 12.345.678/0001-90"` */
  subtitle?: string;
  /** Optional short code or number */
  code?: string;
  /** Marks the primary/headquarters unit */
  isPrimary?: boolean;
  /** Optional custom badge label */
  badge?: string;
  disabled?: boolean;
}

export interface TenantSwitcherTriggerProps {
  currentTenant?: TenantItem | null;
  placeholder?: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
}

export function TenantSwitcherTrigger({
  currentTenant,
  placeholder = 'Selecionar unidade',
  onClick,
  loading = false,
  disabled = false,
  compact = false,
  className,
  componentId,
  hideIfDenied = true,
}: TenantSwitcherTriggerProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const effectiveDisabled = disabled || loading || !hasPermission;

  return (
    <button
      type="button"
      disabled={effectiveDisabled}
      onClick={onClick}
      data-component-id={componentId || undefined}
      aria-label={
        currentTenant ? `Unidade ativa: ${currentTenant.name}. Clique para trocar` : placeholder
      }
      className={cn(
        'inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-colors cursor-pointer',
        'hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        effectiveDisabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin text-primary shrink-0" />
      ) : (
        <Building2 size={14} className="text-primary shrink-0" />
      )}
      <span className={cn('truncate', compact ? 'max-w-[120px]' : 'max-w-[180px] sm:max-w-[240px]')}>
        {currentTenant ? currentTenant.name : placeholder}
      </span>
      {!compact && currentTenant?.code && (
        <span className="hidden sm:inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground tabular-nums">
          {currentTenant.code}
        </span>
      )}
      <ArrowRightLeft size={12} className="text-muted-foreground shrink-0 ml-0.5" />
    </button>
  );
}

export interface TenantSwitcherModalProps {
  open: boolean;
  onClose: () => void;
  tenants: TenantItem[];
  currentTenantId?: string | number | null;
  changingTenantId?: string | number | null;
  onSelect: (tenant: TenantItem) => void | Promise<void>;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  currentSectionLabel?: string;
  primarySectionLabel?: string;
  othersSectionLabel?: string;
  activeBadgeLabel?: string;
  emptyMessage?: string;
  footerLabel?: (count: number) => string;
  componentId?: string;
}

function normalizeTenantText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function TenantSwitcherModal({
  open,
  onClose,
  tenants,
  currentTenantId = null,
  changingTenantId = null,
  onSelect,
  title = 'Trocar Unidade',
  description = 'Selecione o contexto ativo da sua sessão',
  searchPlaceholder = 'Buscar unidade, código ou cidade...',
  currentSectionLabel = 'Unidade Atual',
  primarySectionLabel = 'Unidade Principal',
  othersSectionLabel = 'Outras Unidades',
  activeBadgeLabel = 'Ativa',
  emptyMessage = 'Nenhuma unidade encontrada',
  footerLabel = (count) =>
    `${count} ${count === 1 ? 'unidade disponível' : 'unidades disponíveis'}`,
  componentId,
}: TenantSwitcherModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const filtered = useMemo(() => {
    const normalized = normalizeTenantText(query);
    if (!normalized) return tenants;
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return tenants.filter((t) => {
      const hay = normalizeTenantText(
        [String(t.id), t.name, t.subtitle ?? '', t.code ?? '', t.badge ?? ''].join(' '),
      );
      return tokens.every((tok) => hay.includes(tok));
    });
  }, [tenants, query]);

  const primaryTenant = useMemo(
    () => tenants.find((t) => t.isPrimary) ?? null,
    [tenants],
  );
  const currentTenant = useMemo(
    () => (currentTenantId != null ? tenants.find((t) => t.id === currentTenantId) ?? null : null),
    [tenants, currentTenantId],
  );
  const otherTenants = useMemo(
    () =>
      tenants.filter(
        (t) =>
          t.id !== currentTenantId &&
          (!primaryTenant || t.id !== primaryTenant.id),
      ),
    [tenants, currentTenantId, primaryTenant],
  );

  const isBusy = changingTenantId != null;

  const renderRow = (tenant: TenantItem) => {
    const isCurrent = tenant.id === currentTenantId;
    const isChanging = changingTenantId === tenant.id;
    const rowDisabled = Boolean(tenant.disabled || (isBusy && !isChanging));

    return (
      <button
        key={String(tenant.id)}
        type="button"
        disabled={rowDisabled}
        onClick={() => void onSelect(tenant)}
        data-component-id={
          componentId ? `${componentId}.item-${tenant.id}` : undefined
        }
        className={cn(
          'group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !isCurrent && 'hover:bg-muted/70',
          rowDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <div
          className={cn(
            'shrink-0 w-1 self-stretch rounded-full transition-colors',
            isCurrent ? 'bg-primary' : 'bg-transparent group-hover:bg-border',
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                'truncate text-sm font-medium leading-snug',
                isCurrent ? 'text-primary font-semibold' : 'text-foreground',
              )}
            >
              {tenant.name}
            </p>
            {tenant.code && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground tabular-nums">
                {tenant.code}
              </span>
            )}
            {tenant.badge && (
              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {tenant.badge}
              </span>
            )}
          </div>
          {tenant.subtitle && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {tenant.subtitle}
            </p>
          )}
        </div>

        {isChanging ? (
          <Loader2 size={15} className="shrink-0 animate-spin text-primary" />
        ) : isCurrent ? (
          <span className="shrink-0 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Check size={10} strokeWidth={3} />
            {activeBadgeLabel}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} maxWidth={480} hideCloseButton>
      <div
        data-component-id={componentId || undefined}
        className="-mx-6 -my-5 flex flex-col max-h-[75vh]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Building2 size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar janela"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3.5 py-2.5 border-b border-border shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full rounded-xl bg-muted/40 border border-border py-2 pl-9 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15 transition-colors"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto overscroll-contain flex-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {emptyMessage}
              {query.trim() ? ` para "${query.trim()}"` : ''}
            </div>
          ) : query.trim() ? (
            <div className="p-2 space-y-0.5">{filtered.map(renderRow)}</div>
          ) : (
            <div className="pb-2">
              {currentTenant && (
                <div className="px-3 pt-3 pb-1">
                  <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {currentSectionLabel}
                  </p>
                  <div className="rounded-xl bg-primary/5 ring-1 ring-primary/20">
                    {renderRow(currentTenant)}
                  </div>
                </div>
              )}

              {primaryTenant && primaryTenant.id !== currentTenantId && (
                <div className="px-3 pt-2.5 pb-1">
                  <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {primarySectionLabel}
                  </p>
                  {renderRow(primaryTenant)}
                </div>
              )}

              {otherTenants.length > 0 && (
                <div className="px-3 pt-2.5 pb-1">
                  <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {othersSectionLabel}
                  </p>
                  <div className="space-y-0.5">{otherTenants.map(renderRow)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-2.5 border-t border-border bg-muted/30">
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {footerLabel(tenants.length)}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default TenantSwitcherModal;
