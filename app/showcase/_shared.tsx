"use client";

import React, { useState } from "react";
import { Check, Link2 } from "lucide-react";

function CopyAnchorButton({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#${id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.hash = id;
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copiar link para ${title}`}
      title={`Copiar link (#${id})`}
      className="inline-flex items-center gap-1 rounded-[var(--radius-control)] px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer shrink-0"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          <span className="text-success">Copiado</span>
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">#{id}</span>
        </>
      )}
    </button>
  );
}

export function SectionHeader({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="mb-8">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-2">{label}</span>
      <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">{title}</h2>
      <p className="text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
    </div>
  );
}

export function DemoCard({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 rounded-[var(--radius-card)] border border-border bg-surface mb-4">
      <div className="flex items-center justify-between gap-2 rounded-t-[var(--radius-card)] border-b border-border px-4 py-2.5 bg-surface-muted/50">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {id && <CopyAnchorButton id={id} title={title} />}
      </div>
      <div className="p-3.5 sm:p-6 overflow-x-auto">{children}</div>
    </div>
  );
}

export function PropsTable({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  const hdrs = headers ?? (rows[0]?.length === 3 ? ["Componente", "Principais props", "Descrição"] : ["Prop", "Tipo", "Default", "Descrição"]);
  return (
    <div className="rounded-[var(--radius-card)] border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted border-b border-border">
          <tr>
            {hdrs.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-surface-muted/60 transition-colors">
              <td className="px-4 py-3"><code className="font-mono text-brand text-xs break-all">{row[0]}</code></td>
              <td className="px-4 py-3"><code className="font-mono text-muted-foreground text-xs break-all">{row[1]}</code></td>
              {row.length > 3 && <td className="px-4 py-3"><code className="font-mono text-muted-foreground/80 text-xs break-all">{row[2]}</code></td>}
              <td className="px-4 py-3 text-foreground/85 text-xs">{row[row.length - 1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const HR = () => <hr className="border-border my-8 sm:my-12" />;
