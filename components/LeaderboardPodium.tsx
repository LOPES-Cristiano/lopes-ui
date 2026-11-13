"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight, Crown } from "lucide-react";
import { cn } from "../utils/cn";
import Avatar from "./Avatar";
import AnimatedNumber, { type AnimatedNumberFormat } from "./AnimatedNumber";
import { useAccessControl } from "./useAccessControl";

export type LeaderboardPodiumRank = 1 | 2 | 3;

export type LeaderboardPodiumItem = {
  id: string | number;
  rank: LeaderboardPodiumRank;
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
  value: number;
  valueFormat?: AnimatedNumberFormat;
  valueDecimals?: number;
  valueLabel?: string;
  /** Percentual de meta atingida (ex.: 104.5 para 104,5%) */
  progressPct?: number;
  /** Rótulo secundário opcional (ex.: "Op. 34,2%") */
  badgeText?: string;
  badgeTone?: "emerald" | "amber" | "blue" | "zinc";
};

export type LeaderboardPodiumVariant = "auto" | "pedestal" | "cards";

export type LeaderboardPodiumProps = {
  items: LeaderboardPodiumItem[];
  onItemClick?: (item: LeaderboardPodiumItem) => void;
  /**
   * "auto" exibe pedestais 2º | 1º | 3º em telas < lg e cards horizontais em lg+.
   * "pedestal" força pedestais em todas as larguras; "cards" força cards horizontais.
   */
  variant?: LeaderboardPodiumVariant;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

const RANK_THEME: Record<
  LeaderboardPodiumRank,
  {
    label: string;
    cardBorder: string;
    cardBg: string;
    badgeBg: string;
    barBg: string;
    ringCls: string;
    pedestalMinH: string;
  }
> = {
  1: {
    label: "1º",
    cardBorder: "border-amber-400/50 dark:border-amber-500/40",
    cardBg: "bg-gradient-to-b from-amber-500/10 via-card to-card",
    badgeBg: "bg-amber-500 text-white shadow-xs",
    barBg: "bg-amber-500 dark:bg-amber-400",
    ringCls: "rounded-full ring-2 ring-amber-400/80 ring-offset-2 ring-offset-card",
    pedestalMinH: "min-h-[168px] pt-4",
  },
  2: {
    label: "2º",
    cardBorder: "border-border",
    cardBg: "bg-card",
    badgeBg: "bg-slate-600 text-white dark:bg-slate-500",
    barBg: "bg-slate-500 dark:bg-slate-400",
    ringCls: "rounded-full ring-2 ring-slate-300 dark:ring-slate-600 ring-offset-2 ring-offset-card",
    pedestalMinH: "min-h-[150px] pt-3",
  },
  3: {
    label: "3º",
    cardBorder: "border-border",
    cardBg: "bg-card",
    badgeBg: "bg-orange-600 text-white dark:bg-orange-600",
    barBg: "bg-orange-500 dark:bg-orange-400",
    ringCls: "rounded-full ring-2 ring-orange-300/90 dark:ring-orange-600/70 ring-offset-2 ring-offset-card",
    pedestalMinH: "min-h-[144px] pt-3",
  },
};

const TONE_CLS: Record<NonNullable<LeaderboardPodiumItem["badgeTone"]>, string> = {
  emerald:
    "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
  amber:
    "bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25",
  blue: "bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-500/25",
  zinc: "bg-muted text-muted-foreground border-border",
};

function shortDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return fullName;
  const first = parts[0];
  const second = parts[1];
  if (
    second &&
    ["de", "da", "do", "dos", "das", "e"].includes(second.toLowerCase()) &&
    parts[2]
  ) {
    return `${first} ${parts[2][0]}.`;
  }
  return `${first} ${second[0]}.`;
}

export function LeaderboardPodium({
  items,
  onItemClick,
  variant = "auto",
  title,
  subtitle,
  rightSlot,
  className,
  componentId,
  hideIfDenied = false,
}: LeaderboardPodiumProps) {
  const prefersReducedMotion = useReducedMotion();
  const { canAccess } = useAccessControl();

  const sortedByRank = useMemo(
    () =>
      [...items]
        .filter((it) => it.rank === 1 || it.rank === 2 || it.rank === 3)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 3),
    [items],
  );

  const pedestalOrdered = useMemo(() => {
    if (sortedByRank.length === 3) {
      const first = sortedByRank.find((i) => i.rank === 1)!;
      const second = sortedByRank.find((i) => i.rank === 2)!;
      const third = sortedByRank.find((i) => i.rank === 3)!;
      return [second, first, third];
    }
    return sortedByRank;
  }, [sortedByRank]);

  if (componentId && !canAccess(componentId) && hideIfDenied) {
    return null;
  }

  if (sortedByRank.length === 0) {
    return null;
  }

  const interactive = Boolean(onItemClick);

  const renderPedestalGrid = (visibilityCls?: string) => (
    <div
      className={cn(
        "grid items-end gap-2 sm:gap-3",
        pedestalOrdered.length === 3
          ? "grid-cols-3"
          : pedestalOrdered.length === 2
            ? "grid-cols-2"
            : "grid-cols-1",
        visibilityCls,
      )}
    >
      {pedestalOrdered.map((item, idx) => {
        const theme = RANK_THEME[item.rank];
        const pct = Math.max(0, Number.isFinite(item.progressPct) ? item.progressPct! : 0);
        const clampedScale = Math.min(1, pct / 100);
        const isFirst = item.rank === 1;
        const delay = prefersReducedMotion ? 0 : item.rank === 1 ? 0.08 : idx * 0.05;

        const content = (
          <>
            {/* Posição + Avatar Circular */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {isFirst && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-amber-500 dark:text-amber-400"
                  >
                    <Crown className="w-3.5 h-3.5 fill-amber-400/40" />
                  </span>
                )}
                <Avatar
                  src={item.avatarUrl ?? undefined}
                  name={item.name}
                  size={isFirst ? "md" : "sm"}
                  className={theme.ringCls}
                />
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none border border-card",
                    theme.badgeBg,
                  )}
                >
                  {theme.label}
                </span>
              </div>

              <div className="mt-2.5 text-center min-w-0 w-full">
                <p
                  title={item.name}
                  className={cn(
                    "font-bold text-foreground truncate leading-tight",
                    isFirst ? "text-xs" : "text-[11px]",
                  )}
                >
                  {shortDisplayName(item.name)}
                </p>
                {item.subtitle && (
                  <p
                    title={item.subtitle}
                    className="text-[10px] text-muted-foreground truncate mt-0.5"
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Valor & Barra */}
            <div className="w-full space-y-1.5 pt-2 mt-auto">
              <div className="text-center">
                <AnimatedNumber
                  value={item.value}
                  format={item.valueFormat ?? "currency"}
                  decimals={item.valueDecimals}
                  className={cn(
                    "block font-mono font-extrabold tracking-tight text-foreground truncate",
                    isFirst ? "text-xs sm:text-sm" : "text-[11px]",
                  )}
                />
              </div>

              {typeof item.progressPct === "number" && (
                <div className="space-y-1">
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: clampedScale }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 180, damping: 24, delay: delay + 0.06 }
                      }
                      style={{ transformOrigin: "left" }}
                      className={cn(
                        "h-full w-full rounded-full",
                        pct >= 100 ? "bg-emerald-500" : theme.barBg,
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold tabular-nums",
                        pct >= 100
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {pct.toLocaleString("pt-BR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        );

        const sharedCls = cn(
          "relative flex flex-col justify-between rounded-2xl border px-2 pb-2.5 sm:px-3 sm:pb-3 shadow-xs transition-colors min-w-0",
          theme.cardBorder,
          theme.cardBg,
          theme.pedestalMinH,
          interactive &&
            "cursor-pointer hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        );

        return interactive ? (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onItemClick?.(item)}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 25, delay }
            }
            className={cn(sharedCls, "text-left")}
          >
            {content}
          </motion.button>
        ) : (
          <motion.div
            key={item.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 25, delay }
            }
            className={sharedCls}
          >
            {content}
          </motion.div>
        );
      })}
    </div>
  );

  const renderCardsGrid = (visibilityCls?: string) => (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3", visibilityCls)}>
      {sortedByRank.map((item, idx) => {
        const theme = RANK_THEME[item.rank];
        const pct = Math.max(0, Number.isFinite(item.progressPct) ? item.progressPct! : 0);
        const clampedScale = Math.min(1, pct / 100);
        const delay = prefersReducedMotion ? 0 : idx * 0.05;

        const inner = (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <Avatar
                    src={item.avatarUrl ?? undefined}
                    name={item.name}
                    size="md"
                    className={theme.ringCls}
                  />
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none border border-card",
                      theme.badgeBg,
                    )}
                  >
                    {theme.label}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {item.name}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {item.valueLabel && (
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {item.valueLabel}
                  </span>
                )}
                <AnimatedNumber
                  value={item.value}
                  format={item.valueFormat ?? "currency"}
                  decimals={item.valueDecimals}
                  className="text-sm font-mono font-extrabold text-foreground"
                />
              </div>
            </div>

            {typeof item.progressPct === "number" && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">
                    Atingimento da meta
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.badgeText && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded border text-[10px] font-semibold",
                          TONE_CLS[item.badgeTone ?? "zinc"],
                        )}
                      >
                        {item.badgeText}
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-mono font-bold tabular-nums",
                        pct >= 100
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      {pct.toLocaleString("pt-BR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      %
                    </span>
                    {interactive && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={prefersReducedMotion ? false : { scaleX: 0 }}
                    animate={{ scaleX: clampedScale }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 180, damping: 24, delay: delay + 0.05 }
                    }
                    style={{ transformOrigin: "left" }}
                    className={cn(
                      "h-full w-full rounded-full",
                      pct >= 100 ? "bg-emerald-500" : theme.barBg,
                    )}
                  />
                </div>
              </div>
            )}
          </>
        );

        const cardCls = cn(
          "relative rounded-2xl border p-3.5 shadow-xs transition-colors",
          theme.cardBorder,
          theme.cardBg,
          interactive &&
            "cursor-pointer hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        );

        return interactive ? (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onItemClick?.(item)}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 26, delay }
            }
            className={cn(cardCls, "text-left w-full")}
          >
            {inner}
          </motion.button>
        ) : (
          <motion.div
            key={item.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 26, delay }
            }
            className={cardCls}
          >
            {inner}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section className={cn("space-y-2.5", className)}>
      {(title || subtitle || rightSlot) && (
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{title}</span>
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
          {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        </div>
      )}

      {variant === "pedestal" && renderPedestalGrid()}
      {variant === "cards" && renderCardsGrid()}
      {variant === "auto" && (
        <>
          {renderPedestalGrid("lg:hidden")}
          {renderCardsGrid("hidden lg:grid")}
        </>
      )}
    </section>
  );
}

export default LeaderboardPodium;
