"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Terminal, FileCode2 } from "lucide-react";
import { codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CodeBlockTab = {
  label: string;
  filename?: string;
  language?: string;
  code: string;
};

export type CodeBlockProps = {
  /** RBAC component ID */
  componentId?: string;
  code?: string;
  language?: string;
  filename?: string;
  showCopy?: boolean;
  /** Show line numbers */
  lineNumbers?: boolean;
  /** Collapse after N lines; show "Ver mais" toggle */
  maxLines?: number;
  /** Multiple files in tabs */
  tabs?: CodeBlockTab[];
  className?: string;
};

// ── Language label map ────────────────────────────────────────────────────────

const LANG_LABEL: Record<string, string> = {
  tsx: "TSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  jsx: "JSX",
  js: "JavaScript",
  javascript: "JavaScript",
  bash: " Terminal",
  sh: "Shell",
  css: "CSS",
  json: "JSON",
  html: "HTML",
  python: "Python",
  sql: "SQL",
};

// ── Header Title / Filename Tag ───────────────────────────────────────────────

function HeaderMeta({ filename, language }: { filename?: string; language?: string }) {
  const lang = (language || "tsx").toLowerCase();
  const isTerminal = filename === "terminal" || lang === "bash" || lang === "sh";
  const langLabel = LANG_LABEL[lang]?.trim() ?? lang.toUpperCase();

  return (
    <div className="flex items-center gap-2 text-xs min-w-0">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-zinc-400">
        {isTerminal ? <Terminal size={12} /> : <FileCode2 size={12} />}
      </span>
      {filename ? (
        <span className="font-mono font-medium text-zinc-200 truncate">
          {isTerminal && filename === "terminal" ? "terminal" : filename}
        </span>
      ) : null}
      <span className="shrink-0 rounded border border-zinc-700/70 bg-zinc-800/70 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400">
        {langLabel}
      </span>
    </div>
  );
}

// ── Highlighted code (async, Shiki) ──────────────────────────────────────────

function resolveShikiLang(language = "tsx") {
  const lower = language.toLowerCase();
  if (lower === "tsx" || lower === "jsx") return "tsx";
  if (lower === "ts") return "typescript";
  if (lower === "js") return "javascript";
  if (lower === "sh") return "bash";
  return lower || "plaintext";
}

function escapeHtml(raw: string) {
  return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function HighlightedCode({
  code,
  language = "tsx",
  lineNumbers = false,
  maxLines,
}: {
  code: string;
  language?: string;
  lineNumbers?: boolean;
  maxLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = code.trimEnd();
  const totalLines = trimmed.split("\n").length;
  const isCollapsible = !!maxLines && totalLines > maxLines;

  const visibleCode =
    isCollapsible && !expanded
      ? trimmed.split("\n").slice(0, maxLines).join("\n")
      : trimmed;

  const [displayHtml, setDisplayHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const lang = resolveShikiLang(language);

    codeToHtml(visibleCode, {
      lang,
      theme: "github-dark",
      transformers: lineNumbers
        ? [
            {
              line(node, line) {
                node.properties["data-line"] = line;
              },
            },
          ]
        : [],
    })
      .then((result) => {
        if (!cancelled) setDisplayHtml(result);
      })
      .catch(() => {
        if (!cancelled) {
          setDisplayHtml(
            `<pre style="color:#e4e4e7;margin:0"><code>${escapeHtml(visibleCode)}</code></pre>`,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visibleCode, language, lineNumbers]);

  return (
    <div className="relative bg-zinc-950">
      <div
        className={twMerge(
          "shiki-wrap overflow-x-auto p-4 text-[13px] leading-relaxed",
          lineNumbers && "line-numbers",
        )}
        dangerouslySetInnerHTML={{
          __html:
            displayHtml ||
            `<pre style="color:#e4e4e7;background:transparent;margin:0;padding:0"><code>${escapeHtml(visibleCode)}</code></pre>`,
        }}
      />
      {isCollapsible && (
        <button
          data-component-id="erp.codeblock.collapse-toggle"
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-zinc-800/90 bg-zinc-900/90 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp size={13} /> Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown size={13} /> Expandir código ({totalLines - maxLines!} linhas ocultas)
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      data-component-id="erp.codeblock.copy"
      type="button"
      onClick={handleCopy}
      aria-label="Copiar código"
      className={twMerge(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
        copied
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
          : "border-zinc-700/80 bg-zinc-800/70 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white",
      )}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CodeBlock({
  componentId,
  code = "",
  language = "tsx",
  filename,
  showCopy = true,
  lineNumbers = false,
  maxLines,
  tabs,
  className = "",
}: CodeBlockProps) {
  const { canAccess } = useAccessControl();
  const isVisible = !componentId || canAccess(componentId);
  const [activeTab, setActiveTab] = useState(0);

  if (!isVisible) return null;

  // Tabs mode
  if (tabs && tabs.length > 0) {
    const tab = tabs[activeTab] ?? tabs[0];
    return (
      <div
        data-component-id={componentId}
        className={twMerge(
          "overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950 text-sm text-zinc-100 shadow-xs",
          className,
        )}
      >
        {/* Clean Enterprise Tab Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/90 bg-zinc-900/95 px-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((t, i) => {
              const isActive = i === activeTab;
              return (
                <button
                  data-component-id={`erp.codeblock.tab-${i}`}
                  key={i}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={twMerge(
                    "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                    isActive
                      ? "text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  <FileCode2 size={12} className={isActive ? "text-zinc-200" : "text-zinc-500"} />
                  <span>{t.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-100" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="py-1.5 pl-2">
            {showCopy && <CopyButton code={tab.code} />}
          </div>
        </div>

        {/* Code area */}
        <HighlightedCode
          code={tab.code}
          language={tab.language ?? language}
          lineNumbers={lineNumbers}
          maxLines={maxLines}
        />
      </div>
    );
  }

  // Single file mode
  const lang = language || "tsx";

  return (
    <div
      data-component-id={componentId}
      className={twMerge(
        "overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950 text-sm text-zinc-100 shadow-xs",
        className,
      )}
    >
      {/* Clean Enterprise Header (No Mac dots) */}
      <div className="flex items-center justify-between border-b border-zinc-800/90 bg-zinc-900/95 px-3.5 py-2">
        <HeaderMeta filename={filename} language={lang} />
        {showCopy && <CopyButton code={code} />}
      </div>

      {/* Code */}
      <HighlightedCode
        code={code}
        language={lang}
        lineNumbers={lineNumbers}
        maxLines={maxLines}
      />
    </div>
  );
}
export { CodeBlock };
