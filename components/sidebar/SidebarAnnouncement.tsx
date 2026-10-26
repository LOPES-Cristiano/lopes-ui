'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { SidebarAnnouncement } from './Sidebar.types';

const annStyles: Record<
  NonNullable<SidebarAnnouncement['variant']>,
  NonNullable<SidebarAnnouncement['palette']>
> = {
  neutral: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    accent: 'rgba(255, 255, 255, 0.85)',
    title: '#ffffff',
    body: 'rgba(255, 255, 255, 0.78)',
    time: 'rgba(255, 255, 255, 0.42)',
    action: '#ffffff',
    close: 'rgba(255, 255, 255, 0.38)',
    iconBackground: 'rgba(255, 255, 255, 0.1)',
    iconForeground: 'rgba(255, 255, 255, 0.9)',
    iconBorder: 'rgba(255, 255, 255, 0.1)',
  },
  info: {
    background: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(125, 211, 252, 0.2)',
    accent: '#67e8f9',
    title: '#ffffff',
    body: '#e0f2fe',
    time: 'rgba(224, 242, 254, 0.55)',
    action: '#e0f2fe',
    close: 'rgba(224, 242, 254, 0.38)',
    iconBackground: 'rgba(125, 211, 252, 0.1)',
    iconForeground: '#bae6fd',
    iconBorder: 'rgba(255, 255, 255, 0.1)',
  },
  warning: {
    background: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(252, 211, 77, 0.22)',
    accent: '#fb923c',
    title: '#ffffff',
    body: '#fffbeb',
    time: 'rgba(255, 251, 235, 0.55)',
    action: '#fffbeb',
    close: 'rgba(255, 251, 235, 0.38)',
    iconBackground: 'rgba(252, 211, 77, 0.12)',
    iconForeground: '#fef3c7',
    iconBorder: 'rgba(255, 255, 255, 0.1)',
  },
  success: {
    background: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(110, 231, 183, 0.22)',
    accent: '#2dd4bf',
    title: '#ffffff',
    body: '#ecfdf5',
    time: 'rgba(236, 253, 245, 0.55)',
    action: '#ecfdf5',
    close: 'rgba(236, 253, 245, 0.38)',
    iconBackground: 'rgba(110, 231, 183, 0.12)',
    iconForeground: '#d1fae5',
    iconBorder: 'rgba(255, 255, 255, 0.1)',
  },
  danger: {
    background: 'rgba(251, 113, 133, 0.12)',
    border: 'rgba(253, 164, 175, 0.22)',
    accent: '#f87171',
    title: '#ffffff',
    body: '#fff1f2',
    time: 'rgba(255, 241, 242, 0.55)',
    action: '#fff1f2',
    close: 'rgba(255, 241, 242, 0.38)',
    iconBackground: 'rgba(253, 164, 175, 0.12)',
    iconForeground: '#ffe4e6',
    iconBorder: 'rgba(255, 255, 255, 0.1)',
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
  const s = { ...annStyles[item.variant ?? 'neutral'], ...item.palette };
  const Icon = item.icon;
  const closeHover = s.iconBackground ?? 'rgba(255, 255, 255, 0.08)';

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.(item.id);
  };

  return (
    <div
      className="group relative overflow-hidden border bg-[var(--surface)] shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
      style={{
        background: s.background,
        borderColor: s.border,
        borderRadius: 'var(--sidebar-announcement-radius)',
      }}
    >
      {/* barra colorida à esquerda */}
      <div
        className="absolute inset-y-0 left-0 w-[var(--sidebar-announcement-bar-width)]"
        style={{ background: s.accent }}
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
                className="mt-0.5 flex shrink-0 items-center justify-center rounded-full"
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  background: s.iconBackground,
                  color: s.iconForeground,
                  border: '1px solid transparent',
                  borderColor: s.iconBorder,
                }}
              >
                <Icon size={12} strokeWidth={2.15} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              {item.title && (
                <p
                  className="truncate uppercase"
                  style={{
                    color: s.title,
                    fontSize: '9.5px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                  }}
                >
                  {item.title}
                </p>
              )}
              <p
                className="mt-0.5 line-clamp-2"
                style={{
                  color: s.body,
                  fontSize: '11.5px',
                  lineHeight: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {item.body}
              </p>
              {item.timestamp && (
                <p
                  className="mt-2"
                  style={{
                    color: s.time,
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
                  className="mt-2 inline-flex items-center gap-1 transition-colors hover:opacity-80 cursor-pointer"
                  style={{
                    color: s.action,
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
              className="mt-0.5 shrink-0 rounded-full p-0.5 transition-colors cursor-pointer hover:bg-[var(--close-hover)]"
              style={
                {
                  color: s.close,
                  background: 'transparent',
                  '--close-hover': closeHover,
                } as React.CSSProperties
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
