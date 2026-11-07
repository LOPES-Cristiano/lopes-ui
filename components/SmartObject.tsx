"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import {
  ShoppingCart,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Loader,
  BarChart2,
  Package,
  Scale,
  ShieldCheck,
  Layers,
  DollarSign,
  ListOrdered,
  Truck,
  FileSpreadsheet,
  Hash,
} from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Entity type registry ──────────────────────────────────────────────────────

export type EntityKind =
  | "VENDA"
  | "CLIENTE"
  | "DOCUMENTO"
  | "PEDIDO"
  | "CHAMADO"
  | "PRODUTO"
  | "PESSOA"
  | "FORNECEDOR"
  | "COMPRA"
  | "TITULO"
  | "NFE"
  | "DFE"
  | "REGRA"
  | "NCM"
  | "SPED"
  | "DIVERGENCIA"
  | "FILA";

export type EntityStatus =
  | "pending" // Aguardando
  | "analyzing" // Em análise / Executando
  | "approved" // Aprovado / Ativo / Autorizada
  | "rejected" // Recusado / Crítico / Rejeitada
  | "warning" // Atenção / Divergência
  | "done"; // Concluído

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
  componentId?: string;
};

export type SmartObjectProps = {
  /** Entity type, drives icons and color palette */
  kind: EntityKind;
  /** e.g. "VENDA123", "REGRA14", "SPED202610" */
  ref_id: string;
  /** Short human title */
  title: string;
  status: EntityStatus;
  /** Optional custom status text overriding the default status label */
  statusLabel?: string;
  /** Summary fields shown in the compact inline chip or subtitle */
  summary?: string;
  /** Full detail fields shown in expanded panel */
  fields?: SmartObjectField[];
  /** Primary CTA buttons */
  actions?: SmartObjectAction[];
  /** Which user/module currently holds it */
  holder?: string;
  /** ISO timestamp or formatted string of last state change */
  updatedAt?: string;
  /** Whether this card is inside a chat bubble (inline chip) vs. the detail drawer */
  mode?: "chip" | "card";
  onOpen?: () => void;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Config maps ────────────────────────────────────────────────────────────────

const kindConfig: Record<EntityKind, { icon: React.ReactNode; label: string; color: string }> = {
  VENDA: { icon: <ShoppingCart className="w-3.5 h-3.5" />, label: "Venda", color: "indigo" },
  CLIENTE: { icon: <User className="w-3.5 h-3.5" />, label: "Cliente", color: "blue" },
  PESSOA: { icon: <User className="w-3.5 h-3.5" />, label: "Parceiro", color: "blue" },
  FORNECEDOR: { icon: <Truck className="w-3.5 h-3.5" />, label: "Fornecedor", color: "cyan" },
  DOCUMENTO: { icon: <FileText className="w-3.5 h-3.5" />, label: "Documento", color: "zinc" },
  PEDIDO: { icon: <Package className="w-3.5 h-3.5" />, label: "Pedido", color: "amber" },
  COMPRA: { icon: <Truck className="w-3.5 h-3.5" />, label: "Compra", color: "amber" },
  PRODUTO: { icon: <Package className="w-3.5 h-3.5" />, label: "Produto", color: "emerald" },
  TITULO: { icon: <DollarSign className="w-3.5 h-3.5" />, label: "Título Fin.", color: "violet" },
  NFE: { icon: <FileText className="w-3.5 h-3.5" />, label: "NF-e", color: "indigo" },
  DFE: { icon: <FileSpreadsheet className="w-3.5 h-3.5" />, label: "DF-e Entrada", color: "sky" },
  REGRA: { icon: <Scale className="w-3.5 h-3.5" />, label: "Regra Fiscal", color: "emerald" },
  NCM: { icon: <Hash className="w-3.5 h-3.5" />, label: "Matriz NCM", color: "purple" },
  SPED: { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "SPED Fiscal", color: "indigo" },
  DIVERGENCIA: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "Divergência SPED",
    color: "red",
  },
  FILA: { icon: <ListOrdered className="w-3.5 h-3.5" />, label: "Tarefa na Fila", color: "blue" },
  CHAMADO: { icon: <Layers className="w-3.5 h-3.5" />, label: "Chamado", color: "red" },
};

const statusConfig: Record<
  EntityStatus,
  { label: string; icon: React.ReactNode; chip: string; bar: string }
> = {
  pending: {
    label: "Aguardando",
    icon: <Clock className="w-3 h-3" />,
    chip: "bg-warning/15 text-warning border-warning/30",
    bar: "bg-warning",
  },
  analyzing: {
    label: "Em análise",
    icon: <BarChart2 className="w-3 h-3 animate-pulse" />,
    chip: "bg-info/15 text-info border-info/30",
    bar: "bg-info",
  },
  approved: {
    label: "Aprovado",
    icon: <CheckCircle2 className="w-3 h-3" />,
    chip: "bg-success/15 text-success border-success/30",
    bar: "bg-success",
  },
  rejected: {
    label: "Recusado",
    icon: <XCircle className="w-3 h-3" />,
    chip: "bg-danger/15 text-danger border-danger/30",
    bar: "bg-danger",
  },
  warning: {
    label: "Atenção",
    icon: <AlertTriangle className="w-3 h-3" />,
    chip: "bg-warning/15 text-warning border-warning/30",
    bar: "bg-warning",
  },
  done: {
    label: "Concluído",
    icon: <CheckCircle2 className="w-3 h-3" />,
    chip: "bg-surface-muted text-muted-foreground border-border",
    bar: "bg-muted-foreground/50",
  },
};

const variantBtn: Record<SmartObjectAction["variant"], string> = {
  primary: "bg-primary hover:bg-primary-hover text-primary-foreground",
  success: "bg-success hover:brightness-110 text-success-foreground",
  danger: "bg-danger hover:brightness-110 text-danger-foreground",
  warning: "bg-warning hover:brightness-110 text-warning-foreground",
  secondary: "bg-surface-muted hover:bg-surface-hover text-foreground border border-border",
};

// ── Inline chip (inside chat bubble) ─────────────────────────────────────────

export function SmartObjectChip({
  kind,
  ref_id,
  title,
  status,
  statusLabel,
  onOpen,
  componentId,
  hideIfDenied = false,
}: Pick<
  SmartObjectProps,
  "kind" | "ref_id" | "title" | "status" | "statusLabel" | "onOpen" | "componentId" | "hideIfDenied"
>) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  if (!hasPermission && hideIfDenied) return null;

  const kc = kindConfig[kind] ?? kindConfig.DOCUMENTO;
  const sc = statusConfig[status] ?? statusConfig.pending;

  return (
    <button
      data-component-id={componentId ? `${componentId}.chip` : `smart-object.${ref_id}.chip`}
      type="button"
      disabled={!hasPermission}
      onClick={onOpen}
      className={twMerge(
        clsx(
          "inline-flex min-h-6 items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-semibold align-baseline mx-0.5",
          "border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "hover:brightness-95 active:scale-95 cursor-pointer select-none",
          "disabled:opacity-50 disabled:pointer-events-none",
          sc.chip,
        ),
      )}
      aria-label={title ? `Abrir ${kc.label} ${ref_id}: ${title}` : `Abrir ${kc.label} ${ref_id}`}
    >
      {kc.icon}
      <span className="font-bold">@{ref_id}</span>
      <span className="opacity-70 font-normal">·</span>
      <span className="flex items-center gap-1">
        {sc.icon}
        {statusLabel || sc.label}
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
  statusLabel,
  summary,
  fields = [],
  actions = [],
  holder,
  updatedAt,
  mode = "card",
  onOpen,
  className,
  componentId,
  hideIfDenied = false,
}: SmartObjectProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!hasPermission && hideIfDenied) return null;

  const kc = kindConfig[kind] ?? kindConfig.DOCUMENTO;
  const sc = statusConfig[status] ?? statusConfig.pending;

  if (mode === "chip") {
    return (
      <SmartObjectChip
        kind={kind}
        ref_id={ref_id}
        title={title}
        status={status}
        statusLabel={statusLabel}
        onOpen={onOpen}
        componentId={componentId}
        hideIfDenied={hideIfDenied}
      />
    );
  }

  const handleAction = async (action: SmartObjectAction) => {
    if (busyId || !hasPermission) return;
    if (action.componentId && !canAccess(action.componentId)) return;
    setBusyId(action.id);
    try {
      await action.onClick();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      data-component-id={componentId}
      className={twMerge(
        clsx(
          "rounded-2xl border border-border bg-surface text-foreground overflow-hidden",
          "shadow-lg shadow-zinc-900/5 dark:shadow-black/30",
          !hasPermission && "opacity-60 pointer-events-none",
          className,
        ),
      )}
    >
      {/* Header stripe */}
      <div className={clsx("h-1.5 w-full", sc.bar)} />

      {/* Header body */}
      <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 px-4 sm:px-5 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Kind icon */}
          <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="[&>svg]:w-5 [&>svg]:h-5">{kc.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {kc.label}
              </span>
              <code className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-1.5 rounded">
                @{ref_id}
              </code>
            </div>
            <h3 className="text-base font-semibold text-foreground truncate mt-0.5">{title}</h3>
            {summary && <p className="text-xs text-muted-foreground mt-0.5">{summary}</p>}
          </div>
        </div>

        {/* Status badge */}
        <span
          className={clsx(
            "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
            sc.chip,
          )}
        >
          {sc.icon}
          {statusLabel || sc.label}
        </span>
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <div className="mx-4 sm:mx-5 mb-3 rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {fields.map((f, i) => (
                <tr key={i} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-3.5 py-2 text-xs text-muted-foreground whitespace-nowrap w-1/3">
                    {f.label}
                  </td>
                  <td
                    className={clsx(
                      "px-3.5 py-2 text-xs font-medium tabular-nums",
                      f.highlight
                        ? "text-primary font-semibold"
                        : f.warning
                          ? "text-warning font-semibold"
                          : "text-foreground",
                    )}
                  >
                    {f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer: holder + updated + actions */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pb-4 flex-wrap">
        <div className="flex flex-col gap-0.5">
          {holder && (
            <span className="text-[11px] text-muted-foreground">
              Responsável: <span className="font-semibold text-foreground">{holder}</span>
            </span>
          )}
          {updatedAt && (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              Atualizado: {updatedAt}
            </span>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions.map((action) => {
              const actionAllowed = !action.componentId || canAccess(action.componentId);
              return (
                <button
                  data-component-id={
                    action.componentId ??
                    (componentId
                      ? `${componentId}.action.${action.id}`
                      : `smart-object.${ref_id}.action.${action.id}`)
                  }
                  key={action.id}
                  type="button"
                  disabled={action.disabled || !actionAllowed || busyId === action.id}
                  onClick={() => handleAction(action)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer",
                    "shadow-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    variantBtn[action.variant],
                  )}
                >
                  {busyId === action.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : null}
                  {action.label}
                </button>
              );
            })}
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
 * Pattern: @[A-Z]+[0-9A-Za-z_-]+ e.g. @VENDA123, @REGRA14, @NCM94036000, @SPED202610
 */
export type MessageSegment =
  | { kind: "text"; text: string }
  | { kind: "entity"; ref_id: string; entityKind: EntityKind };

const ENTITY_PATTERN =
  /@(PRODUTO|PESSOA|CLIENTE|FORNECEDOR|VENDA|COMPRA|TITULO|NFE|DFE|REGRA|NCM|SPED|DIVERGENCIA|FILA|DOCUMENTO|PEDIDO|CHAMADO)([0-9A-Za-z_-]+)/gi;
const KNOWN_KINDS = new Set<EntityKind>([
  "VENDA",
  "CLIENTE",
  "DOCUMENTO",
  "PEDIDO",
  "CHAMADO",
  "PRODUTO",
  "PESSOA",
  "FORNECEDOR",
  "COMPRA",
  "TITULO",
  "NFE",
  "DFE",
  "REGRA",
  "NCM",
  "SPED",
  "DIVERGENCIA",
  "FILA",
]);

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
    const upperKind = kindStr.toUpperCase() as EntityKind;
    if (KNOWN_KINDS.has(upperKind)) {
      segments.push({ kind: "entity", ref_id: `${upperKind}${num}`, entityKind: upperKind });
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
