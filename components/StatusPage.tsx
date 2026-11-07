'use client';

import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAccessControl } from './useAccessControl';

export type PageVariant = '401' | '404' | '403' | '500' | 'info' | 'custom';

const variantStyles: Record<
  PageVariant,
  {
    codeGradient: string;
    iconGradient: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    hr: string;
    accentText: string;
  }
> = {
  '401': {
    codeGradient: 'from-amber-500 to-orange-600 dark:from-amber-300 dark:to-orange-400',
    iconGradient: 'from-amber-500 to-orange-600',
    pillBg: 'bg-warning-soft',
    pillText: 'text-warning-soft-foreground',
    pillBorder: 'border-warning-border',
    hr: 'bg-border',
    accentText: 'text-warning',
  },
  '404': {
    codeGradient: 'from-indigo-400 to-blue-500 dark:from-indigo-300 dark:to-blue-400',
    iconGradient: 'from-indigo-500 to-blue-600',
    pillBg: 'bg-brand-soft',
    pillText: 'text-brand-soft-foreground',
    pillBorder: 'border-brand-border',
    hr: 'bg-border',
    accentText: 'text-brand',
  },
  '403': {
    codeGradient: 'from-amber-400 to-orange-500 dark:from-amber-300 dark:to-orange-400',
    iconGradient: 'from-amber-500 to-orange-500',
    pillBg: 'bg-warning-soft',
    pillText: 'text-warning-soft-foreground',
    pillBorder: 'border-warning-border',
    hr: 'bg-border',
    accentText: 'text-muted-foreground',
  },
  '500': {
    codeGradient: 'from-red-600 to-rose-500 dark:from-rose-300 dark:to-red-400',
    iconGradient: 'from-rose-500 to-red-600',
    pillBg: 'bg-danger-soft',
    pillText: 'text-danger-soft-foreground',
    pillBorder: 'border-danger-border',
    hr: 'bg-border',
    accentText: 'text-danger',
  },
  info: {
    codeGradient: 'from-sky-400 to-cyan-500 dark:from-sky-300 dark:to-cyan-400',
    iconGradient: 'from-sky-500 to-cyan-500',
    pillBg: 'bg-info-soft',
    pillText: 'text-info-soft-foreground',
    pillBorder: 'border-info-border',
    hr: 'bg-border',
    accentText: 'text-info',
  },
  custom: {
    codeGradient: 'from-zinc-400 to-slate-600 dark:from-zinc-300 dark:to-slate-400',
    iconGradient: 'from-zinc-500 to-slate-600',
    pillBg: 'bg-surface-muted',
    pillText: 'text-muted-foreground',
    pillBorder: 'border-border',
    hr: 'bg-border',
    accentText: 'text-muted-foreground',
  },
};

/** Deriva automaticamente sufixo `_dark` (ex: `/404.svg` -> `/404_dark.svg`) quando `darkImageSrc` não é fornecido */
function deriveDarkImageSrc(src?: string): string | undefined {
  if (!src) return undefined;
  if (/_dark\.[a-z0-9]+(\?.*)?$/i.test(src)) return src;
  const match = src.match(/^(.*?)(\.[a-z0-9]+)(\?.*)?$/i);
  if (!match) return undefined;
  return `${match[1]}_dark${match[2]}${match[3] ?? ''}`;
}

/* ── Rotating words ──────────────────────────────────────────────────────── */
function RotatingWords({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (words.length <= 1) return;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setVisible(false);
      timeoutId = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => {
      clearInterval(interval);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [words]);

  return (
    <span
      className="inline-block transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      {words[index]}
    </span>
  );
}

/* ── Props ───────────────────────────────────────────────────────────────── */
export type StatusPageProps = {
  componentId?: string;
  hideIfDenied?: boolean;
  variant?: PageVariant;
  code?: string | number;
  pill?: string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactElement<{ className?: string }>;
  /** URL da ilustração/imagem customizada (modo claro ou base para derivação automática `_dark`) */
  imageSrc?: string;
  /** URL opcional da ilustração/imagem para modo escuro (se omitida, tenta `<nome>_dark.<ext>` com fallback) */
  darkImageSrc?: string;
  /** Desativa derivação automática de `<nome>_dark.<ext>` quando `darkImageSrc` não for informada */
  autoDeriveDarkImage?: boolean;
  /** Alias legado para `imageSrc` */
  image?: string;
  /** Palavras que rotacionam abaixo do título */
  rotatingWords?: string[];
  actions?: React.ReactNode;
  homeHref?: string;
  className?: string;
  inline?: boolean;
};

export function StatusPage({
  variant = 'custom',
  code,
  pill,
  title,
  description,
  icon,
  imageSrc,
  darkImageSrc,
  autoDeriveDarkImage = true,
  image,
  rotatingWords,
  actions,
  homeHref = '/',
  className,
  componentId,
  hideIfDenied = false,
  inline = false,
}: StatusPageProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});

  if (!hasPermission && hideIfDenied) return null;

  const s = variantStyles[variant] || variantStyles.custom;

  const rawLightImage = imageSrc ?? image;
  const candidateDarkImage =
    darkImageSrc ?? (autoDeriveDarkImage ? deriveDarkImageSrc(rawLightImage) : undefined);

  const resolvedLightImage =
    rawLightImage && !failedSrcs[rawLightImage] ? rawLightImage : undefined;
  const resolvedDarkImage =
    candidateDarkImage && !failedSrcs[candidateDarkImage]
      ? candidateDarkImage
      : resolvedLightImage;

  const primaryImage = resolvedLightImage ?? resolvedDarkImage;
  const hasCustomImage = Boolean(primaryImage);

  const markFailed = (srcUrl?: string) => {
    if (!srcUrl) return;
    setFailedSrcs((prev) => (prev[srcUrl] ? prev : { ...prev, [srcUrl]: true }));
  };

  const displayCode =
    code ??
    (!icon && (variant === '401' || variant === '403' || variant === '404' || variant === '500')
      ? variant
      : undefined);

  /* ── Layout split — apenas quando imagem customizada é fornecida e válida ─ */
  if (hasCustomImage && primaryImage) {
    const hasSeparateDark = Boolean(
      resolvedLightImage && resolvedDarkImage && resolvedLightImage !== resolvedDarkImage,
    );

    return (
      <div
        data-component-id={componentId || undefined}
        className={twMerge(
          'relative isolate overflow-hidden bg-[var(--status-page-background)] text-foreground',
          inline ? 'flex items-center py-16 px-6' : 'flex min-h-screen',
          !hasPermission && 'opacity-60 pointer-events-none',
          className,
        )}
      >
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(0 0 0 / 0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Coluna imagem — 55% */}
        <div className="relative hidden lg:flex lg:w-[55%] items-center justify-center p-12">
          {hasSeparateDark ? (
            <>
              <img
                src={resolvedLightImage}
                alt={title}
                onError={() => markFailed(resolvedLightImage)}
                className="w-full max-w-[680px] select-none object-contain dark:hidden"
              />
              <img
                src={resolvedDarkImage}
                alt={title}
                onError={() => markFailed(resolvedDarkImage)}
                className="w-full max-w-[680px] select-none object-contain hidden dark:block"
              />
            </>
          ) : (
            <img
              src={primaryImage}
              alt={title}
              onError={() => markFailed(primaryImage)}
              className="w-full max-w-[680px] select-none object-contain"
            />
          )}
        </div>

        {/* Coluna conteúdo — 45% */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-8 py-16 text-center lg:w-[45%] lg:items-start lg:text-left">
          {/* Imagem no mobile */}
          <div className="mb-8 flex w-full justify-center lg:hidden">
            {hasSeparateDark ? (
              <>
                <img
                  src={resolvedLightImage}
                  alt={title}
                  onError={() => markFailed(resolvedLightImage)}
                  className="w-full max-w-xs select-none object-contain dark:hidden"
                />
                <img
                  src={resolvedDarkImage}
                  alt={title}
                  onError={() => markFailed(resolvedDarkImage)}
                  className="w-full max-w-xs select-none object-contain hidden dark:block"
                />
              </>
            ) : (
              <img
                src={primaryImage}
                alt={title}
                onError={() => markFailed(primaryImage)}
                className="w-full max-w-xs select-none object-contain"
              />
            )}
          </div>

          {displayCode && (
            <span className="mb-2 text-xs font-semibold uppercase tracking-widest tabular-nums text-muted-foreground">
              Erro {displayCode}
            </span>
          )}

          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          {rotatingWords && rotatingWords.length > 0 && (
            <div className="mt-4 text-lg font-medium text-muted-foreground h-7 overflow-hidden">
              <RotatingWords words={rotatingWords} />
            </div>
          )}

          <div className={twMerge('mt-6 h-px w-12 rounded-full', s.hr)} />

          {description && (
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {actions ?? (
              <a
                href={homeHref}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ← Voltar para Início
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Layout centralizado — tipografia gradiente integrada ──────────────── */
  return (
    <div
      data-component-id={componentId || undefined}
      className={twMerge(
        'relative isolate flex items-center justify-center overflow-hidden bg-background text-foreground px-6',
        inline ? 'py-16' : 'min-h-screen',
        !hasPermission && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(0 0 0 / 0.045) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center py-20 text-center">
        {displayCode ? (
          <span
            className={twMerge(
              'block select-none bg-gradient-to-br bg-clip-text text-[clamp(96px,20vw,200px)] font-black leading-none tracking-tighter tabular-nums text-transparent',
              s.codeGradient,
            )}
          >
            {displayCode}
          </span>
        ) : icon ? (
          <div
            className={twMerge(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
              s.iconGradient,
            )}
          >
            {React.cloneElement(icon, { className: 'h-8 w-8 text-white' })}
          </div>
        ) : null}

        {pill && (
          <span
            className={twMerge(
              'mt-5 inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium tracking-wide',
              s.pillBg,
              s.pillText,
              s.pillBorder,
            )}
          >
            {pill}
          </span>
        )}

        <h1
          className={twMerge(
            'font-extrabold tracking-tight text-foreground',
            displayCode ? 'mt-5 text-4xl sm:text-5xl' : 'mt-4 text-4xl',
          )}
        >
          {title}
        </h1>

        {rotatingWords && rotatingWords.length > 0 && (
          <div className="mt-3 text-base font-medium text-muted-foreground h-6 overflow-hidden">
            <RotatingWords words={rotatingWords} />
          </div>
        )}

        <div className={twMerge('mt-5 h-px w-12 rounded-full', s.hr)} />

        {description && (
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {actions ?? (
            <a
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ← Voltar para Início
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
