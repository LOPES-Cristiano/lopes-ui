import React from "react";

export function SectionHeader({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="mb-8">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">{label}</span>
      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-3">{title}</h2>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">{description}</p>
    </div>
  );
}

export function DemoCard({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden mb-4">
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{title}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function PropsTable({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  const hdrs = headers ?? (rows[0]?.length === 3 ? ["Componente", "Principais props", "Descrição"] : ["Prop", "Tipo", "Default", "Descrição"]);
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            {hdrs.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <td className="px-4 py-3"><code className="font-mono text-indigo-600 dark:text-indigo-400 text-xs break-all">{row[0]}</code></td>
              <td className="px-4 py-3"><code className="font-mono text-zinc-500 dark:text-zinc-400 text-xs break-all">{row[1]}</code></td>
              {row.length > 3 && <td className="px-4 py-3"><code className="font-mono text-zinc-400 dark:text-zinc-500 text-xs break-all">{row[2]}</code></td>}
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 text-xs">{row[row.length - 1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const HR = () => <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />;
