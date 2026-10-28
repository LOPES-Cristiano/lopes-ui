'use client';

import { useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import type { SidebarAnnouncement } from './Sidebar.types';

type AnnouncementVariantClasses = {
  container: string;
  accent: string;
  title: string;
  body: string;
  time: string;
  action: string;
  close: string;
  icon: string;
};

const variantClasses: Record<string, AnnouncementVariantClasses> = {
  neutral: {
    container: 'bg-zinc-900/[0.04] dark:bg-white/[0.07] border-zinc-200 dark:border-white/[0.12]',
    accent: 'bg-zinc-500 dark:bg-zinc-300',
    title: 'text-zinc-900 dark:text-zinc-50',
    body: 'text-zinc-700 dark:text-zinc-200',
    time: 'text-zinc-500 dark:text-zinc-400',
    action: 'text-zinc-900 dark:text-white',
    close: 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-900/10 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/10',
    icon: 'bg-zinc-900/[0.07] text-zinc-700 border-zinc-300/70 dark:bg-white/10 dark:text-zinc-100 dark:border-white/10',
  },
  info: {
    container: 'bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/25 dark:border-sky-400/25',
    accent: 'bg-sky-500 dark:bg-sky-400',
    title: 'text-sky-950 dark:text-sky-100',
    body: 'text-sky-900/90 dark:text-sky-100/90',
    time: 'text-sky-700/80 dark:text-sky-200/65',
    action: 'text-sky-800 dark:text-sky-200',
    close: 'text-sky-700/70 hover:text-sky-950 hover:bg-sky-500/15 dark:text-sky-200/60 dark:hover:text-sky-100 dark:hover:bg-sky-400/15',
    icon: 'bg-sky-500/15 text-sky-700 border-sky-500/20 dark:bg-sky-400/15 dark:text-sky-200 dark:border-sky-300/15',
  },
  tip: {
    container: 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/25 dark:border-indigo-400/25',
    accent: 'bg-indigo-500 dark:bg-indigo-400',
    title: 'text-indigo-950 dark:text-indigo-100',
    body: 'text-indigo-900/90 dark:text-indigo-100/90',
    time: 'text-indigo-700/80 dark:text-indigo-200/65',
    action: 'text-indigo-800 dark:text-indigo-200',
    close: 'text-indigo-700/70 hover:text-indigo-950 hover:bg-indigo-500/15 dark:text-indigo-200/60 dark:hover:text-indigo-100 dark:hover:bg-indigo-400/15',
    icon: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20 dark:bg-indigo-400/15 dark:text-indigo-200 dark:border-indigo-300/15',
  },
  warning: {
    container: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 dark:border-amber-400/25',
    accent: 'bg-amber-500 dark:bg-amber-400',
    title: 'text-amber-950 dark:text-amber-100',
    body: 'text-amber-900/90 dark:text-amber-100/90',
    time: 'text-amber-800/75 dark:text-amber-200/65',
    action: 'text-amber-900 dark:text-amber-200',
    close: 'text-amber-800/70 hover:text-amber-950 hover:bg-amber-500/15 dark:text-amber-200/60 dark:hover:text-amber-100 dark:hover:bg-amber-400/15',
    icon: 'bg-amber-500/15 text-amber-800 border-amber-500/25 dark:bg-amber-400/15 dark:text-amber-200 dark:border-amber-300/15',
  },
  success: {
    container: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 dark:border-emerald-400/25',
    accent: 'bg-emerald-500 dark:bg-emerald-400',
    title: 'text-emerald-950 dark:text-emerald-100',
    body: 'text-emerald-900/90 dark:text-emerald-100/90',
    time: 'text-emerald-800/75 dark:text-emerald-200/65',
    action: 'text-emerald-800 dark:text-emerald-200',
    close: 'text-emerald-800/70 hover:text-emerald-950 hover:bg-emerald-500/15 dark:text-emerald-200/60 dark:hover:text-emerald-100 dark:hover:bg-emerald-400/15',
    icon: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-200 dark:border-emerald-300/15',
  },
  danger: {
    container: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 dark:border-rose-400/25',
    accent: 'bg-rose-500 dark:bg-rose-400',
    title: 'text-rose-950 dark:text-rose-100',
    body: 'text-rose-900/90 dark:text-rose-100/90',
    time: 'text-rose-800/75 dark:text-rose-200/65',
    action: 'text-rose-800 dark:text-rose-200',
    close: 'text-rose-800/70 hover:text-rose-950 hover:bg-rose-500/15 dark:text-rose-200/60 dark:hover:text-rose-100 dark:hover:bg-rose-400/15',
    icon: 'bg-rose-500/15 text-rose-700 border-rose-500/20 dark:bg-rose-400/15 dark:text-rose-200 dark:border-rose-300/15',
  },
  promo: {
    container: 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/25 dark:border-purple-400/25',
    accent: 'bg-purple-500 dark:bg-purple-400',
    title: 'text-purple-950 dark:text-purple-100',
    body: 'text-purple-900/90 dark:text-purple-100/90',
    time: 'text-purple-800/75 dark:text-purple-200/65',
    action: 'text-purple-800 dark:text-purple-200',
    close: 'text-purple-800/70 hover:text-purple-950 hover:bg-purple-500/15 dark:text-purple-200/60 dark:hover:text-purple-100 dark:hover:bg-purple-400/15',
    icon: 'bg-purple-500/15 text-purple-700 border-purple-500/20 dark:bg-purple-400/15 dark:text-purple-200 dark:border-purple-300/15',
  },
};

export function SidebarAnnouncementCard({
  item,
  onDismiss,
}: {
  item: SidebarAnnouncement;
  onDismiss?: (id: string) => void;
}) {
  const [visible, setVisible] = useState(true);
  const v = variantClasses[item.variant ?? 'neutral'] ?? variantClasses.neutral;
  const p = item.palette;
  const Icon = item.icon;

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.(item.id);
  };

  return (
    <div
      className={`group relative overflow-hidden border shadow-xs dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)] ${v.container}`}
      style={{
        ...(p?.background ? { background: p.background } : {}),
        ...(p?.border ? { borderColor: p.border } : {}),
        borderRadius: 'var(--sidebar-announcement-radius)',
      }}
    >
      {/* barra colorida à esquerda */}
      <div
        className={`absolute inset-y-0 left-0 w-[var(--sidebar-announcement-bar-width)] ${v.accent}`}
        style={p?.accent ? { background: p.accent } : undefined}
      />
      <div
        style={{
          paddingInline: '0.875rem',
          paddingBlock: '0.8rem',
        }}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            {Icon && (
              <span
                className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full border ${v.icon}`}
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  ...(p?.iconBackground ? { background: p.iconBackground } : {}),
                  ...(p?.iconForeground ? { color: p.iconForeground } : {}),
                  ...(p?.iconBorder ? { borderColor: p.iconBorder } : {}),
                }}
              >
                <Icon size={12} strokeWidth={2.15} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              {item.title && (
                <p
                  className={`truncate uppercase ${v.title}`}
                  style={{
                    ...(p?.title ? { color: p.title } : {}),
                    fontSize: '9.5px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                  }}
                >
                  {item.title}
                </p>
              )}
              <p
                className={`mt-0.5 line-clamp-2 ${v.body}`}
                style={{
                  ...(p?.body ? { color: p.body } : {}),
                  fontSize: '11.5px',
                  lineHeight: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {item.body}
              </p>
              {item.timestamp && (
                <p
                  className={`mt-2 ${v.time}`}
                  style={{
                    ...(p?.time ? { color: p.time } : {}),
                    fontSize: '10.5px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {item.timestamp}
                </p>
              )}
              {item.action && (
                <button
                  data-component-id="erp.sidebar.announcement.action"
                  type="button"
                  onClick={item.action.onClick}
                  className={`mt-2 inline-flex items-center gap-1 transition-colors hover:opacity-80 cursor-pointer ${v.action}`}
                  style={{
                    ...(p?.action ? { color: p.action } : {}),
                    fontSize: '10.5px',
                    fontWeight: 700,
                  }}
                >
                  {item.action.label}
                </button>
              )}
            </div>
          </div>
          {item.dismissible && (
            <button
              data-component-id="erp.sidebar.announcement.dismiss"
              type="button"
              aria-label="Dispensar"
              onClick={handleDismiss}
              className={`mt-0.5 shrink-0 rounded-full p-0.5 transition-colors cursor-pointer ${v.close} ${p?.iconBackground ? 'hover:bg-[var(--close-hover)]' : ''}`}
              style={
                p?.close || p?.iconBackground
                  ? ({
                      ...(p.close ? { color: p.close } : {}),
                      ...(p.iconBackground ? { '--close-hover': p.iconBackground } : {}),
                    } as CSSProperties)
                  : undefined
              }
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
