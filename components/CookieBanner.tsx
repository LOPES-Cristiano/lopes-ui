'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Cookie, Settings2, ShieldCheck, ShieldOff, X } from 'lucide-react';
import Switch from './form/Switch';
import { cn } from '../utils/cn';
import { sanitizeSafeHref } from '../utils/sanitize';

export type CookieConsentDecision = 'accepted' | 'rejected' | 'custom';

export interface CookieConsentPreferences {
  decision: CookieConsentDecision;
  essential: true;
  analytics: boolean;
  preferences: boolean;
  updatedAt: string;
}

const DEFAULT_STORAGE_KEY = 'lopes_ui_cookie_consent';
const CONSENT_CHANGE_EVENT = 'lopes-ui:cookie-consent-change';

export function getCookieConsent(
  storageKey: string = DEFAULT_STORAGE_KEY,
): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    if (raw === 'accepted') {
      return {
        decision: 'accepted',
        essential: true,
        analytics: true,
        preferences: true,
        updatedAt: '',
      };
    }
    if (raw === 'rejected') {
      return {
        decision: 'rejected',
        essential: true,
        analytics: false,
        preferences: false,
        updatedAt: '',
      };
    }
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    if (
      parsed &&
      (parsed.decision === 'accepted' ||
        parsed.decision === 'rejected' ||
        parsed.decision === 'custom')
    ) {
      return {
        decision: parsed.decision,
        essential: true,
        analytics: Boolean(parsed.analytics),
        preferences: Boolean(parsed.preferences),
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

function subscribeConsent(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener(CONSENT_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
  };
}

export interface CookieBannerProps {
  /** Storage key in `localStorage` (defaults to `"lopes_ui_cookie_consent"`) */
  storageKey?: string;
  /** Banner heading */
  title?: string;
  /** Banner description */
  description?: string;
  /** Optional privacy policy link */
  policyHref?: string;
  /** Label for the privacy policy link */
  policyLabel?: string;
  /** Delay in ms before displaying the banner when no consent is stored */
  delayMs?: number;
  /** Allow granular category customization (essential, analytics, preferences) */
  allowCustomize?: boolean;
  /** Force banner open regardless of stored state (useful for "Manage cookies" triggers or demos) */
  open?: boolean;
  /** Callback fired when consent is saved */
  onConsentChange?: (consent: CookieConsentPreferences) => void;
  className?: string;
  componentId?: string;
}

export function CookieBanner({
  storageKey = DEFAULT_STORAGE_KEY,
  title = 'Cookies e privacidade',
  description = 'Utilizamos cookies essenciais para segurança e funcionamento da plataforma e, com sua permissão, cookies de preferências e diagnóstico.',
  policyHref,
  policyLabel = 'Política de Privacidade',
  delayMs = 500,
  allowCustomize = true,
  open: controlledOpen,
  onConsentChange,
  className,
  componentId,
}: CookieBannerProps) {
  const hasStoredConsent = useSyncExternalStore(
    subscribeConsent,
    () => getCookieConsent(storageKey) !== null,
    () => true,
  );

  const [delayElapsed, setDelayElapsed] = useState(delayMs <= 0);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    if (controlledOpen !== undefined || hasStoredConsent || delayMs <= 0) return;
    const timer = window.setTimeout(() => {
      setDelayElapsed(true);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [controlledOpen, hasStoredConsent, delayMs]);

  const isVisible =
    controlledOpen !== undefined
      ? controlledOpen
      : !hasStoredConsent && (delayMs <= 0 || delayElapsed);

  if (!isVisible) return null;

  const safePolicyHref = policyHref ? sanitizeSafeHref(policyHref) : null;

  const saveConsent = (next: CookieConsentPreferences) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
      } catch {
        // ignore storage quota errors
      }
    }
    setCustomizing(false);
    onConsentChange?.(next);
  };

  const handleAcceptAll = () => {
    saveConsent({
      decision: 'accepted',
      essential: true,
      analytics: true,
      preferences: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRejectOptional = () => {
    saveConsent({
      decision: 'rejected',
      essential: true,
      analytics: false,
      preferences: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      decision: 'custom',
      essential: true,
      analytics,
      preferences,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      role="region"
      aria-label={title}
      data-component-id={componentId || undefined}
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-6 md:right-6 lg:left-auto lg:right-6 lg:max-w-2xl z-[6000]',
        'rounded-2xl border border-border bg-popover/95 text-popover-foreground backdrop-blur-xl shadow-2xl p-5',
        'animate-in fade-in slide-in-from-bottom-3 duration-200 motion-reduce:animate-none',
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Cookie size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {title}
            </p>
            <button
              type="button"
              onClick={handleRejectOptional}
              aria-label="Apenas cookies essenciais e fechar"
              className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}{' '}
            {safePolicyHref && (
              <a
                href={safePolicyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {policyLabel}
              </a>
            )}
          </p>

          {allowCustomize && customizing && (
            <div className="mt-4 space-y-2.5 rounded-xl border border-border bg-muted/40 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Essenciais</p>
                  <p className="text-[11px] text-muted-foreground">
                    Autenticação, sessão e segurança obrigatória.
                  </p>
                </div>
                <Switch checked disabled aria-label="Cookies essenciais sempre ativos" />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Preferências</p>
                  <p className="text-[11px] text-muted-foreground">
                    Tema visual, densidade de tabelas e idioma.
                  </p>
                </div>
                <Switch
                  checked={preferences}
                  onChange={setPreferences}
                  aria-label="Permitir cookies de preferências"
                />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Diagnóstico e desempenho</p>
                  <p className="text-[11px] text-muted-foreground">
                    Métricas anônimas de estabilidade e tempo de resposta.
                  </p>
                </div>
                <Switch
                  checked={analytics}
                  onChange={setAnalytics}
                  aria-label="Permitir cookies de diagnóstico"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {allowCustomize && (
              <button
                type="button"
                onClick={() => setCustomizing((prev) => !prev)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
              >
                <Settings2 size={14} />
                {customizing ? 'Ocultar opções' : 'Personalizar'}
              </button>
            )}

            <button
              type="button"
              onClick={handleRejectOptional}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
            >
              <ShieldOff size={14} />
              Apenas essenciais
            </button>

            {customizing ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity cursor-pointer"
              >
                <ShieldCheck size={14} />
                Salvar preferências
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity cursor-pointer"
              >
                <ShieldCheck size={14} />
                Aceitar tudo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
