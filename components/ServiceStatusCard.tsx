"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw, ExternalLink, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance" | "unknown";

export type UptimeDay = {
  date: string;         // ISO date string, e.g. "2026-03-01"
  status: ServiceStatus;
  note?: string;        // tooltip on hover
};

export type ServiceIncident = {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  timestamp: Date | string;
  message?: string;
};

export type ServiceStatusCardProps = {
  name: string;
  description?: string;
  status: ServiceStatus;
  /** Response time in ms */
  latencyMs?: number;
  /** Uptime percentage (e.g. 99.92) */
  uptimePct?: number;
  /** Up to 90 day history for the uptime bar */
  history?: UptimeDay[];
  /** Current/recent incidents */
  incidents?: ServiceIncident[];
  /** URL to the service or its full status page */
  href?: string;
  icon?: LucideIcon;
  /** Auto-refresh every N seconds. Pass 0 or omit to disable. */
  refreshInterval?: number;
  onRefresh?: () => void | Promise<void>;
  loading?: boolean;
  className?: string;
  componentId?: string;
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; dot: string; text: string; icon: LucideIcon; bar: string }
> = {
  operational:  { label: "Operacional",  dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2,   bar: "bg-emerald-400 dark:bg-emerald-500" },
  degraded:     { label: "Degradado",    dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400",     icon: AlertTriangle,  bar: "bg-amber-400 dark:bg-amber-500" },
  outage:       { label: "Fora do ar",   dot: "bg-red-500",     text: "text-red-600 dark:text-red-400",         icon: XCircle,        bar: "bg-red-400 dark:bg-red-500" },
  maintenance:  { label: "Manutenção",   dot: "bg-blue-400",    text: "text-blue-600 dark:text-blue-400",       icon: Clock,          bar: "bg-blue-300 dark:bg-blue-600" },
  unknown:      { label: "Desconhecido", dot: "bg-zinc-400",    text: "text-zinc-500 dark:text-zinc-400",       icon: AlertTriangle,  bar: "bg-zinc-300 dark:bg-zinc-700" },
};

const INCIDENT_STATUS: Record<ServiceIncident["status"], string> = {
  investigating: "Investigando",
  identified:    "Identificado",
  monitoring:    "Monitorando",
  resolved:      "Resolvido",
};

// ── Animated ping dot ─────────────────────────────────────────────────────────

function PingDot({ status }: { status: ServiceStatus }) {
  const cfg = STATUS_CONFIG[status];
  const ping = status === "outage" || status === "degraded";

  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
      {ping && (
        <span className={twMerge("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", cfg.dot)} />
      )}
      <span className={twMerge("relative inline-flex rounded-full h-2.5 w-2.5", cfg.dot)} />
    </span>
  );
}

// ── UptimeBar ─────────────────────────────────────────────────────────────────

export function UptimeBar({
  history,
  days = 90,
  className,
}: {
  history: UptimeDay[];
  days?: number;
  className?: string;
}) {
  // Pad to `days` slots (most recent last)
  const slots: (UptimeDay | null)[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    slots.push(history.find((h) => h.date === iso) ?? null);
  }

  return (
    <div className={twMerge("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-[2px]" aria-label="Histórico de disponibilidade">
        {slots.map((slot, idx) => {
          const cfg = slot ? STATUS_CONFIG[slot.status] : STATUS_CONFIG.unknown;
          return (
            <div
              key={idx}
              title={slot ? `${slot.date}${slot.note ? ` — ${slot.note}` : ""}` : undefined}
              className={twMerge(
                "flex-1 h-5 rounded-[2px] transition-opacity hover:opacity-70 cursor-default",
                slot ? cfg.bar : "bg-zinc-100 dark:bg-zinc-800",
              )}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
        <span>{days} dias atrás</span>
        <span>Hoje</span>
      </div>
    </div>
  );
}

// ── Latency badge ─────────────────────────────────────────────────────────────

function LatencyBadge({ ms }: { ms: number }) {
  const cls =
    ms < 200  ? "text-emerald-600 dark:text-emerald-400" :
    ms < 500  ? "text-amber-600 dark:text-amber-400" :
                "text-red-600 dark:text-red-400";
  return (
    <span className={twMerge("text-xs font-mono font-semibold", cls)}>
      {ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ServiceStatusCard({
  name,
  description,
  status,
  latencyMs,
  uptimePct,
  history,
  incidents,
  href,
  icon: Icon,
  onRefresh,
  loading = false,
  className,
  componentId,
}: ServiceStatusCardProps) {
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  return (
    <div
      className={twMerge(
        "flex flex-col gap-4 rounded-2xl border border-zinc-100 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900 p-5",
        className,
      )}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500 dark:text-zinc-400">
              <Icon size={18} strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{name}</span>
              {href && (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
            {description && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Status badge + refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={twMerge("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", cfg.text, "bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/60")}>
            {loading
              ? <RefreshCw size={10} className="animate-spin text-zinc-400" />
              : <PingDot status={status} />
            }
            <StatusIcon size={11} strokeWidth={2} className={cfg.text} />
            {cfg.label}
          </div>
          {onRefresh && (
            <button
              type="button"
              aria-label="Atualizar"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics row */}
      {(latencyMs !== undefined || uptimePct !== undefined) && (
        <div className="flex items-center gap-5 border-t border-zinc-50 dark:border-zinc-800 pt-3">
          {latencyMs !== undefined && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Latência</span>
              <LatencyBadge ms={latencyMs} />
            </div>
          )}
          {uptimePct !== undefined && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Uptime</span>
              <span className={twMerge(
                "text-xs font-mono font-semibold",
                uptimePct >= 99.9 ? "text-emerald-600 dark:text-emerald-400" :
                uptimePct >= 99   ? "text-amber-600 dark:text-amber-400" :
                                    "text-red-600 dark:text-red-400",
              )}>
                {uptimePct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Uptime history bar */}
      {history && history.length > 0 && (
        <UptimeBar history={history} />
      )}

      {/* Incidents */}
      {incidents && incidents.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-zinc-50 dark:border-zinc-800 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Incidentes</p>
          <div className="flex flex-col gap-2">
            {incidents.map((inc) => {
              const resolved = inc.status === "resolved";
              return (
                <div key={inc.id} className="flex items-start gap-2">
                  <span className={twMerge(
                    "mt-1 h-1.5 w-1.5 rounded-full shrink-0",
                    resolved ? "bg-emerald-400" : "bg-amber-400 animate-pulse",
                  )} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-snug">{inc.title}</p>
                    {inc.message && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-snug mt-0.5">{inc.message}</p>
                    )}
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {INCIDENT_STATUS[inc.status]} ·{" "}
                      {new Date(inc.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
