"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import {
  ShoppingCart, User, FileText, AlertTriangle, CheckCircle2,
  Clock, XCircle, ChevronRight, Loader,
  BarChart2, Package,
} from "lucide-react";

// ── Entity type registry ──────────────────────────────────────────────────────

export type EntityKind = "VENDA" | "CLIENTE" | "DOCUMENTO" | "PEDIDO" | "CHAMADO";

export type EntityStatus =
  | "pending"    // Aguardando
  | "analyzing"  // Em análise
  | "approved"   // Aprovado
  | "rejected"   // Recusado
  | "warning"    // Atenção
  | "done";      // Concluído

/** A single field row inside the detail panel */
export type SmartObjectField = {
  label: string;
  value: React.ReactNode;
  /** Makes the value stand out */
  highlight?: boolean;
  /** Adds a warning colour to the value */
  warning?: boolean;
};

/** Primary action button on the detail card */
export type SmartObjectAction = {
  id: string;
  label: string;
  variant: "primary" | "danger" | "warning" | "success" | "secondary";
  /** async: shows spinner until resolved */
  onClick: () => void | Promise<void>;
  disabled?: boolean;
};

export type SmartObjectProps = {
  /** Entity type, drives icons and color palette */
  kind: EntityKind;
  /** e.g. "VENDA123" */
  ref_id: string;
  /** Short human title */
  title: string;
  status: EntityStatus;
  /** Summary fields shown in the compact inline chip */
  summary?: string;
  /** Full detail fields shown in expanded panel */
  fields?: SmartObjectField[];
  /** Primary CTA buttons */
  actions?: SmartObjectAction[];
  /** Which user currently holds it (like a "physical object in someone's hands") */
  holder?: string;
  /** ISO timestamp of last state change */
  updatedAt?: string;
  /** Whether this card is inside a chat bubble (inline chip) vs. the detail drawer */
  mode?: "chip" | "card";
  onOpen?: () => void;
  className?: string;
};

// ── Config maps ────────────────────────────────────────────────────────────────

const kindConfig: Record<EntityKind, { icon: React.ReactNode; label: string; color: string }> = {
  VENDA:     { icon: <ShoppingCart className="w-3.5 h-3.5" />,  label: "Venda",     color: "indigo" },
  CLIENTE:   { icon: <User         className="w-3.5 h-3.5" />,  label: "Cliente",   color: "blue"   },
  DOCUMENTO: { icon: <FileText     className="w-3.5 h-3.5" />,  label: "Documento", color: "zinc"   },
  PEDIDO:    { icon: <Package      className="w-3.5 h-3.5" />,  label: "Pedido",    color: "amber"  },
  CHAMADO:   { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Chamado",   color: "red"    },
};

const statusConfig: Record<EntityStatus, { label: string; icon: React.ReactNode; chip: string; bar: string }> = {
  pending:   { label: "Aguardando",   icon: <Clock          className="w-3 h-3" />,       chip: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",   bar: "bg-amber-400" },
  analyzing: { label: "Em análise",   icon: <BarChart2      className="w-3 h-3 animate-pulse" />, chip: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",     bar: "bg-blue-400" },
  approved:  { label: "Aprovado",     icon: <CheckCircle2   className="w-3 h-3" />,       chip: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", bar: "bg-emerald-400" },
  rejected:  { label: "Recusado",     icon: <XCircle        className="w-3 h-3" />,       chip: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",             bar: "bg-red-400" },
  warning:   { label: "Atenção",      icon: <AlertTriangle  className="w-3 h-3" />,       chip: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800", bar: "bg-orange-400" },
  done:      { label: "Concluído",    icon: <CheckCircle2   className="w-3 h-3" />,       chip: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",           bar: "bg-zinc-400" },
};

const variantBtn: Record<SmartObjectAction["variant"], string> = {
  primary:   "bg-indigo-600 hover:bg-indigo-500 text-white",
  success:   "bg-emerald-600 hover:bg-emerald-500 text-white",
  danger:    "bg-red-600 hover:bg-red-500 text-white",
  warning:   "bg-amber-500 hover:bg-amber-400 text-white",
  secondary: "bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-100",
};

// ── Inline chip (inside chat bubble) ─────────────────────────────────────────

export function SmartObjectChip({
  kind,
  ref_id,
  status,
  onOpen,
}: Pick<SmartObjectProps, "kind" | "ref_id" | "title" | "status" | "onOpen">) {
  const kc = kindConfig[kind];
  const sc = statusConfig[status];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={twMerge(clsx(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
        "border transition-all",
        "hover:brightness-95 active:scale-95 cursor-pointer select-none",
        sc.chip,
      ))}
      aria-label={`Abrir ${kc.label} ${ref_id}`}
      title={`Clique para ver detalhes de @${ref_id}`}
    >
      {kc.icon}
      <span className="font-bold">@{ref_id}</span>
      <span className="opacity-70 font-normal">·</span>
      <span className="flex items-center gap-1">
        {sc.icon}
        {sc.label}
      </span>
      <ChevronRight className="w-3 h-3 opacity-50 ml-0.5" />
    </button>
  );
}

// ── Full detail card ──────────────────────────────────────────────────────────

export default function SmartObject({
  kind,
  ref_id,
  title,
  status,
  summary,
  fields = [],
  actions = [],
  holder,
  updatedAt,
  mode = "card",
  onOpen,
  className,
}: SmartObjectProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const kc = kindConfig[kind];
  const sc = statusConfig[status];

  if (mode === "chip") {
    return (
      <SmartObjectChip kind={kind} ref_id={ref_id} title={title} status={status} onOpen={onOpen} />
    );
  }

  const handleAction = async (action: SmartObjectAction) => {
    if (busyId) return;
    setBusyId(action.id);
    try {
      await action.onClick();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className={twMerge(clsx(
        "rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden",
        "border-zinc-200 dark:border-zinc-700",
        "shadow-lg shadow-zinc-900/10",
        className,
      ))}
    >
      {/* Header stripe */}
      <div className={clsx("h-1.5 w-full", sc.bar)} />

      {/* Header body */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Kind icon */}
          <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <span className="[&>svg]:w-5 [&>svg]:h-5">{kc.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {kc.label}
              </span>
              <code className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 rounded">
                @{ref_id}
              </code>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
              {title}
            </h3>
            {summary && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{summary}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span className={clsx(
          "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
          sc.chip,
        )}>
          {sc.icon}
          {sc.label}
        </span>
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <div className="mx-5 mb-3 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {fields.map((f, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-3.5 py-2 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap w-1/3">
                    {f.label}
                  </td>
                  <td className={clsx(
                    "px-3.5 py-2 text-xs font-medium",
                    f.highlight
                      ? "text-indigo-700 dark:text-indigo-300 font-semibold"
                      : f.warning
                        ? "text-amber-600 dark:text-amber-400 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300",
                  )}>
                    {f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer: holder + updated + actions */}
      <div className="flex items-center justify-between gap-3 px-5 pb-4 flex-wrap">
        <div className="flex flex-col gap-0.5">
          {holder && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Com: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{holder}</span>
            </span>
          )}
          {updatedAt && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Atualizado: {updatedAt}
            </span>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={action.disabled || busyId === action.id}
                onClick={() => handleAction(action)}
                className={clsx(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium",
                  "shadow-sm transition-all active:scale-95",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  variantBtn[action.variant],
                )}
              >
                {busyId === action.id
                  ? <Loader className="w-3.5 h-3.5 animate-spin" />
                  : null
                }
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Entity registry helpers ────────────────────────────────────────────────────

/**
 * Parse raw message text and return segments:
 * plain strings and SmartObject references.
 *
 * Pattern: @[A-Z]+[0-9]+ e.g. @VENDA123, @CLIENTE42
 */
export type MessageSegment =
  | { kind: "text"; text: string }
  | { kind: "entity"; ref_id: string; entityKind: EntityKind };

const ENTITY_PATTERN = /@([A-Z]+)(\d+)/g;
const KNOWN_KINDS = new Set<EntityKind>(["VENDA", "CLIENTE", "DOCUMENTO", "PEDIDO", "CHAMADO"]);

export function parseMessageEntities(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  ENTITY_PATTERN.lastIndex = 0;

  while ((match = ENTITY_PATTERN.exec(text)) !== null) {
    const [full, kindStr, num] = match;
    const start = match.index;
    if (start > lastIndex) {
      segments.push({ kind: "text", text: text.slice(lastIndex, start) });
    }
    const entityKind = kindStr as EntityKind;
    if (KNOWN_KINDS.has(entityKind)) {
      segments.push({ kind: "entity", ref_id: `${kindStr}${num}`, entityKind });
    } else {
      segments.push({ kind: "text", text: full });
    }
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", text: text.slice(lastIndex) });
  }

  return segments;
}
