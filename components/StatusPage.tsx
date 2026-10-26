'use client';

import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type PageVariant = '404' | '403' | '500' | 'info' | 'custom';

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
  '404': {
    codeGradient: 'from-indigo-400 to-blue-500 dark:from-indigo-300 dark:to-blue-400',
    iconGradient: 'from-indigo-500 to-blue-600',
    pillBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    pillText: 'text-indigo-600 dark:text-indigo-400',
    pillBorder: 'border-indigo-200 dark:border-indigo-800',
    hr: 'bg-zinc-200 dark:bg-zinc-800',
    accentText: 'text-indigo-500 dark:text-indigo-400',
  },
  '403': {
    codeGradient: 'from-amber-400 to-orange-500 dark:from-amber-300 dark:to-orange-400',
    iconGradient: 'from-amber-500 to-orange-500',
    pillBg: 'bg-amber-50 dark:bg-amber-950/60',
    pillText: 'text-amber-600 dark:text-amber-400',
    pillBorder: 'border-amber-200 dark:border-amber-800',
    hr: 'bg-zinc-200 dark:bg-zinc-800',
    accentText: 'text-zinc-500 dark:text-zinc-400',
  },
  '500': {
    codeGradient: 'bg-red-600 dark:from-rose-300 dark:to-red-400',
    iconGradient: 'from-rose-500 to-red-600',
    pillBg: 'bg-rose-50 dark:bg-rose-950/60',
    pillText: 'text-rose-600 dark:text-rose-400',
    pillBorder: 'border-rose-200 dark:border-rose-800',
    hr: 'bg-zinc-200 dark:bg-zinc-800',
    accentText: 'text-rose-500 dark:text-rose-400',
  },
  info: {
    codeGradient: 'from-sky-400 to-cyan-500 dark:from-sky-300 dark:to-cyan-400',
    iconGradient: 'from-sky-500 to-cyan-500',
    pillBg: 'bg-sky-50 dark:bg-sky-950/60',
    pillText: 'text-sky-600 dark:text-sky-400',
    pillBorder: 'border-sky-200 dark:border-sky-800',
    hr: 'bg-zinc-200 dark:bg-zinc-800',
    accentText: 'text-sky-500 dark:text-sky-400',
  },
  custom: {
    codeGradient: 'from-zinc-400 to-slate-600 dark:from-zinc-300 dark:to-slate-400',
    iconGradient: 'from-zinc-500 to-slate-600',
    pillBg: 'bg-zinc-50 dark:bg-zinc-800/60',
    pillText: 'text-zinc-600 dark:text-zinc-400',
    pillBorder: 'border-zinc-200 dark:border-zinc-700',
    hr: 'bg-zinc-200 dark:bg-zinc-800',
    accentText: 'text-zinc-500 dark:text-zinc-400',
  },
};

/* ── Rotating words ──────────────────────────────────────────────────────── */
function RotatingWords({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (words.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
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
type StatusPageProps = {
  componentId?: string;
  variant?: PageVariant;
  code?: string | number;
  pill?: string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactElement<{ className?: string }>;
  image?: string;
  /** Palavras que rotacionam abaixo do título (apenas no layout com imagem) */
  rotatingWords?: string[];
  actions?: React.ReactNode;
  homeHref?: string;
  className?: string;
  inline?: boolean;
};

export default function StatusPage({
  variant = 'custom',
  code,
  pill,
  title,
  description,
  icon,
  image,
  rotatingWords,
  actions,
  homeHref = '/',
  className,
  componentId,
  inline = false,
}: StatusPageProps) {
  const s = variantStyles[variant] || variantStyles.custom;

  // Resolve automaticamente a imagem com base na variante de status se nao informada
  const defaultImages: Record<string, string> = {
    '401': '/images/status/401.png',
    '403': '/images/status/403.png',
    '404': '/images/status/404.png',
    '500': '/images/status/500.png',
  };
  const resolvedImage =
    image || defaultImages[variant] || (code ? defaultImages[String(code)] : undefined);
  const resolvedDarkImage = resolvedImage
    ? resolvedImage.replace(/(\.[a-z]+)$/i, '_dark$1')
    : undefined;

  /* ── Layout split — quando tem imagem ──────────────────────────────────── */
  if (resolvedImage) {
    return (
      <div
        className={twMerge(
          'relative isolate overflow-hidden bg-[var(--status-page-background)] dark:bg-black',
          inline ? 'flex items-center py-16 px-6' : 'flex min-h-screen',
          className
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedImage}
            alt={title}
            className="w-full max-w-[680px] select-none object-contain dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedDarkImage}
            alt={title}
            onError={(e) => {
              e.currentTarget.src = resolvedImage;
            }}
            className="w-full max-w-[680px] select-none object-contain hidden dark:block"
          />
        </div>

        {/* Coluna conteudo — 45% */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-8 py-16 text-center lg:w-[45%] lg:items-start lg:text-left">
          {/* Imagem no mobile */}
          <div className="mb-8 flex w-full justify-center lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedImage}
              alt={title}
              className="w-full max-w-xs select-none object-contain dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedDarkImage}
              alt={title}
              onError={(e) => {
                e.currentTarget.src = resolvedImage;
              }}
              className="w-full max-w-xs select-none object-contain hidden dark:block"
            />
          </div>

          {/* Codigo pequeno e clean */}
          {code && (
            <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Erro {code}
            </span>
          )}

          <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50">
            {title}
          </h1>

          {/* Rotating words */}
          {rotatingWords && rotatingWords.length > 0 && (
            <div className="mt-4 text-lg font-medium text-zinc-400 dark:text-zinc-500 h-7 overflow-hidden">
              <RotatingWords words={rotatingWords} />
            </div>
          )}

          <div className={twMerge('mt-6 h-px w-12 rounded-full', s.hr)} />

          {description && (
            <p className="mt-5 max-w-sm text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {actions ?? (
              <a
                href={homeHref}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {'<-'} Voltar para Inicio
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Layout original centralizado — sem imagem ──────────────────────────── */
  return (
    <div
      className={twMerge(
        'relative isolate flex items-center justify-center overflow-hidden bg-white px-6 dark:bg-zinc-950',
        inline ? 'py-16' : 'min-h-screen',
        className
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
        {code ? (
          <span
            className={twMerge(
              'block select-none bg-gradient-to-br bg-clip-text text-[clamp(96px,20vw,200px)] font-black leading-none tracking-tighter text-transparent',
              s.codeGradient
            )}
          >
            {code}
          </span>
        ) : icon ? (
          <div
            className={twMerge(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
              s.iconGradient
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
              s.pillBorder
            )}
          >
            {pill}
          </span>
        )}

        <h1
          className={twMerge(
            'font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50',
            code ? 'mt-5 text-4xl sm:text-5xl' : 'mt-4 text-4xl'
          )}
        >
          {title}
        </h1>

        <div className={twMerge('mt-5 h-px w-12 rounded-full', s.hr)} />

        {description && (
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {actions ?? (
            <a
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {'<-'} Voltar para Inicio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
