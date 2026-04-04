"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { codeToHtml } from "shiki";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CodeBlockTab = {
  label: string;
  filename?: string;
  language?: string;
  code: string;
};

export type CodeBlockProps = {
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
  tsx: "TSX", ts: "TS", jsx: "JSX", js: "JS",
  bash: "bash", sh: "bash", css: "CSS", json: "JSON",
  html: "HTML", python: "Python", sql: "SQL",
};

// ── Icon for terminal-like filenames ──────────────────────────────────────────

function FilenameTag({ filename, language }: { filename?: string; language?: string }) {
  if (!filename) return null;
  const isTerminal = filename === "terminal" || language === "bash" || language === "sh";
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "#a6adc8" }}>
      {isTerminal
        ? <Terminal size={12} style={{ color: "#50fa7b" }} />
        : <span style={{ color: "#bd93f9" }}>·</span>}
      <span>{isTerminal ? "terminal" : filename}</span>
    </div>
  );
}

// ── Highlighted code (async, Shiki) ──────────────────────────────────────────

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
  const [html, setHtml] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const trimmed = code.trimEnd();
  const totalLines = trimmed.split("\n").length;
  const isCollapsible = !!maxLines && totalLines > maxLines;

  useEffect(() => {
    let cancelled = false;
    const lang = language === "tsx" || language === "jsx" ? "tsx"
      : language === "ts" ? "typescript"
      : language === "js" ? "javascript"
      : language || "plaintext";

    codeToHtml(trimmed, {
      lang,
      theme: "dracula",
      transformers: lineNumbers
        ? [{
            line(node, line) {
              node.properties["data-line"] = line;
            },
          }]
        : [],
    })
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(`<pre style="color:#f8f8f2">${trimmed}</pre>`);
      });

    return () => { cancelled = true; };
  }, [trimmed, language, lineNumbers]);

  const visibleCode = isCollapsible && !expanded
    ? trimmed.split("\n").slice(0, maxLines).join("\n")
    : trimmed;

  // Re-highlight when visible subset changes (collapsed vs full)
  const [visibleHtml, setVisibleHtml] = useState<string>("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isCollapsible) { setVisibleHtml(html); return; }
    let cancelled = false;
    const lang = language === "tsx" || language === "jsx" ? "tsx"
      : language === "ts" ? "typescript"
      : language === "js" ? "javascript"
      : language || "plaintext";

    codeToHtml(visibleCode, {
      lang,
      theme: "dracula",
      transformers: lineNumbers ? [{ line(node, line) { node.properties["data-line"] = line; } }] : [],
    })
      .then((r) => { if (!cancelled) setVisibleHtml(r); })
      .catch(() => { if (!cancelled) setVisibleHtml(`<pre style="color:#f8f8f2">${visibleCode}</pre>`); });
    return () => { cancelled = true; };
  }, [visibleCode, language, lineNumbers, html, isCollapsible]);

  const displayHtml = isCollapsible ? visibleHtml : html;

  return (
    <div className="relative">
      <div
        className={[
          "shiki-wrap overflow-auto p-4 text-sm",
          lineNumbers ? "line-numbers" : "",
        ].join(" ")}
        style={{ background: "#282a36" }}
        dangerouslySetInnerHTML={{ __html: displayHtml || `<pre style="color:#f8f8f2;background:#282a36;padding:0">${visibleCode}</pre>` }}
      />
      {isCollapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors"
          style={{ background: "#1e1f29", color: "#bd93f9", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {expanded
            ? <><ChevronUp size={13} /> Ver menos</>
            : <><ChevronDown size={13} /> Ver mais ({totalLines - maxLines!} linhas ocultas)</>}
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
      onClick={handleCopy}
      aria-label="Copiar código"
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors"
      style={{
        background: copied ? "rgba(80,250,123,0.12)" : "rgba(255,255,255,0.05)",
        color: copied ? "#50fa7b" : "#a6adc8",
        border: `1px solid ${copied ? "rgba(80,250,123,0.3)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

// ── Window dots ───────────────────────────────────────────────────────────────

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#27c93f" }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CodeBlock({
  code = "",
  language = "tsx",
  filename,
  showCopy = true,
  lineNumbers = false,
  maxLines,
  tabs,
  className = "",
}: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Tabs mode
  if (tabs && tabs.length > 0) {
    const tab = tabs[activeTab];
    return (
      <div className={"rounded-xl overflow-hidden text-sm " + className} style={{ background: "#282a36" }}>
        {/* Tab bar */}
        <div
          className="flex items-center justify-between px-3 py-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#21222c" }}
        >
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 pr-4" style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}>
              <WindowDots />
            </div>
            <div className="flex items-center">
              {tabs.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className="relative px-4 py-2.5 text-xs font-medium transition-colors"
                  style={{
                    color: i === activeTab ? "#f8f8f2" : "#6272a4",
                    borderBottom: i === activeTab ? "2px solid #bd93f9" : "2px solid transparent",
                    background: "transparent",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {showCopy && <CopyButton code={tab.code} />}
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
  const langLabel = LANG_LABEL[lang] ?? lang.toUpperCase();

  return (
    <div className={"rounded-xl overflow-hidden text-sm " + className} style={{ background: "#282a36" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#21222c" }}
      >
        <div className="flex items-center gap-3">
          <WindowDots />
          {filename
            ? <FilenameTag filename={filename} language={lang} />
            : <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(189,147,249,0.15)", color: "#bd93f9" }}>{langLabel}</span>}
        </div>
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

