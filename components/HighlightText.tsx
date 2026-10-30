"use client";

import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

export type HighlightTone = "amber" | "primary" | "emerald" | "sky" | "rose";

export type HighlightTextProps = {
  /** Source text to render and highlight */
  text: string;
  /** Single query string or array of query strings to highlight */
  highlight: string | string[];
  /** Ignore accents/diacritics (e.g. "sofa" matches "Sofá", "rondonia" matches "Rondônia"). Default: true */
  ignoreAccents?: boolean;
  /** Case-sensitive matching. Default: false */
  caseSensitive?: boolean;
  /** Match whole words only. Default: false */
  wholeWord?: boolean;
  /** Highlight visual palette. Default: "amber" */
  tone?: HighlightTone;
  /** Wrapper element tag. Default: "span" */
  as?: "span" | "p" | "div";
  className?: string;
  highlightClassName?: string;
  componentId?: string;
};

const TONE_CLASSES: Record<HighlightTone, string> = {
  amber:
    "bg-amber-200/85 text-amber-950 dark:bg-amber-500/30 dark:text-amber-100 rounded-[4px] px-0.5 font-medium",
  primary:
    "bg-primary/15 text-primary dark:bg-primary/25 rounded-[4px] px-0.5 font-medium",
  emerald:
    "bg-emerald-200/80 text-emerald-950 dark:bg-emerald-500/30 dark:text-emerald-100 rounded-[4px] px-0.5 font-medium",
  sky:
    "bg-sky-200/80 text-sky-950 dark:bg-sky-500/30 dark:text-sky-100 rounded-[4px] px-0.5 font-medium",
  rose:
    "bg-rose-200/80 text-rose-950 dark:bg-rose-500/30 dark:text-rose-100 rounded-[4px] px-0.5 font-medium",
};

function stripDiacriticsChar(ch: string): string {
  return ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Segment = { text: string; matched: boolean };

export function splitHighlightedSegments(
  text: string,
  highlight: string | string[],
  options?: {
    ignoreAccents?: boolean;
    caseSensitive?: boolean;
    wholeWord?: boolean;
  },
): Segment[] {
  if (!text) return [];
  const ignoreAccents = options?.ignoreAccents ?? true;
  const caseSensitive = options?.caseSensitive ?? false;
  const wholeWord = options?.wholeWord ?? false;

  const rawTerms = (Array.isArray(highlight) ? highlight : [highlight])
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (rawTerms.length === 0) {
    return [{ text, matched: false }];
  }

  // Build normalized string with exact 1:1 back-mapping to original UTF-16 indices
  let normText = "";
  const mapStart: number[] = [];
  const mapEnd: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const stripped = ignoreAccents ? stripDiacriticsChar(ch) : ch;
    const target = caseSensitive ? stripped : stripped.toLowerCase();
    for (let k = 0; k < target.length; k++) {
      normText += target[k];
      mapStart.push(i);
      mapEnd.push(i + 1);
    }
  }

  if (normText.length === 0) {
    return [{ text, matched: false }];
  }

  const normalizedTerms = Array.from(
    new Set(
      rawTerms
        .map((t) => {
          const s = ignoreAccents
            ? t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            : t;
          return caseSensitive ? s : s.toLowerCase();
        })
        .filter((t) => t.length > 0),
    ),
  ).sort((a, b) => b.length - a.length);

  if (normalizedTerms.length === 0) {
    return [{ text, matched: false }];
  }

  const patternBody = normalizedTerms.map(escapeRegExp).join("|");
  const pattern = wholeWord ? `\\b(?:${patternBody})\\b` : `(?:${patternBody})`;
  const regex = new RegExp(pattern, caseSensitive ? "g" : "gi");

  const intervals: Array<[number, number]> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(normText)) !== null) {
    if (match[0].length === 0) {
      regex.lastIndex++;
      continue;
    }
    const nStart = match.index;
    const nEnd = match.index + match[0].length - 1;
    const origStart = mapStart[nStart];
    const origEnd = mapEnd[nEnd];
    if (origStart !== undefined && origEnd !== undefined && origEnd > origStart) {
      intervals.push([origStart, origEnd]);
    }
  }

  if (intervals.length === 0) {
    return [{ text, matched: false }];
  }

  // Sort & merge overlapping intervals
  intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }

  const segments: Segment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), matched: false });
    }
    segments.push({ text: text.slice(start, end), matched: true });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), matched: false });
  }

  return segments;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HighlightText({
  text,
  highlight,
  ignoreAccents = true,
  caseSensitive = false,
  wholeWord = false,
  tone = "amber",
  as: Tag = "span",
  className,
  highlightClassName,
  componentId,
}: HighlightTextProps) {
  const segments = useMemo(
    () =>
      splitHighlightedSegments(text, highlight, {
        ignoreAccents,
        caseSensitive,
        wholeWord,
      }),
    [text, highlight, ignoreAccents, caseSensitive, wholeWord],
  );

  return (
    <Tag
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={className}
    >
      {segments.map((seg, idx) =>
        seg.matched ? (
          <mark
            key={idx}
            className={twMerge(TONE_CLASSES[tone], highlightClassName)}
          >
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{seg.text}</React.Fragment>
        ),
      )}
    </Tag>
  );
}

export { HighlightText };
