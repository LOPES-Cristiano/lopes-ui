"use client";

import React, { useState } from "react";
import { Copy } from "lucide-react";

type CodeBlockProps = {
  code: string;
  language?: string;
  showCopy?: boolean;
  className?: string;
  filename?: string;
};

export default function CodeBlock({ code, language = "", showCopy = true, className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // ignore
    }
  };

  return (
    <div className={"relative text-sm " + className}>
      {/* Header - IDE style (Dracula) */}
      <div
        className="flex items-center justify-between rounded-t-md px-3 py-2"
        style={{ background: "#282a36" }}
      >
        <div className="flex items-center gap-3">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#27c93f" }} />
          <span className="ml-3 text-xs" style={{ color: "#f8f8f2" }}>{/* filename if provided */}</span>
        </div>

        {showCopy && (
          <button
            onClick={handleCopy}
            aria-label="Copiar código"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs"
            style={{ background: "rgba(255,255,255,0.04)", color: "#f8f8f2", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <Copy size={14} />
            <span>{copied ? "Copiado" : "Copiar"}</span>
          </button>
        )}
      </div>

      <pre
        className="overflow-auto rounded-b-md p-4"
        style={{ background: "#282a36", color: "#f8f8f2" }}
      >
        <code className={language ? `language-${language}` : undefined} style={{ color: "#f8f8f2", fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace' }}>{code}</code>
      </pre>
    </div>
  );
}
