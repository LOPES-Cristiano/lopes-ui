'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';
import { safeSetHTML } from '../utils/sanitize';
import { useAccessControl } from './useAccessControl';

export interface RichTextViewerProps {
  /** HTML content produced by `RichTextEditor` or external sources (sanitized automatically) */
  html?: string | null;
  /** Fallback rendered when `html` is empty or whitespace-only */
  emptyFallback?: React.ReactNode;
  /** Optional max height in pixels before showing an expand/collapse toggle */
  maxHeight?: number;
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
}

function isEffectivelyEmptyHtml(html?: string | null): boolean {
  if (!html) return true;
  const stripped = html
    .replace(/<img\b[^>]*>/gi, '[img]')
    .replace(/<hr\b[^>]*>/gi, '[hr]')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return stripped.length === 0;
}

export function RichTextViewer({
  html,
  emptyFallback = null,
  maxHeight,
  expandLabel = 'Ler conteúdo completo',
  collapseLabel = 'Recolher conteúdo',
  className,
  componentId,
  hideIfDenied = true,
}: RichTextViewerProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = componentId ? canAccess(componentId) : true;

  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const isEmpty = isEffectivelyEmptyHtml(html);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (isEmpty) {
      el.replaceChildren();
      return;
    }
    safeSetHTML(el, html ?? '', { allowRich: true });
    if (maxHeight && maxHeight > 0) {
      setOverflowing(el.scrollHeight > maxHeight + 16);
    }
  }, [html, isEmpty, maxHeight]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  if (isEmpty) {
    return emptyFallback ? <>{emptyFallback}</> : null;
  }

  const shouldClamp = Boolean(maxHeight && maxHeight > 0 && overflowing && !expanded);

  return (
    <div data-component-id={componentId || undefined} className="w-full">
      <div
        className={cn('relative', shouldClamp && 'overflow-hidden')}
        style={shouldClamp ? { maxHeight: `${maxHeight}px` } : undefined}
      >
        <div
          ref={contentRef}
          className={cn(
            'rte-viewer text-sm text-foreground leading-relaxed break-words',
            className,
          )}
        />
        {shouldClamp && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent"
          />
        )}
      </div>

      {maxHeight && maxHeight > 0 && overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 inline-flex min-h-7 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
        >
          {expanded ? (
            <>
              {collapseLabel}
              <ChevronUp size={13} />
            </>
          ) : (
            <>
              {expandLabel}
              <ChevronDown size={13} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default RichTextViewer;
