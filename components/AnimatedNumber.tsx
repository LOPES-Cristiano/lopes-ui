"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type SpringOptions,
} from "motion/react";
import { cn } from "../utils/cn";

export type AnimatedNumberFormat = "currency" | "percent" | "decimal" | "integer";

export type AnimatedNumberProps = {
  /** Valor numérico alvo */
  value: number;
  /** Formato de exibição (padrão: "decimal") */
  format?: AnimatedNumberFormat;
  /** Locale de formatação Intl (padrão: "pt-BR") */
  locale?: string;
  /** Código ISO da moeda quando format="currency" (padrão: "BRL") */
  currency?: string;
  /** Casas decimais customizadas (padrão: 2 p/ currency/decimal, 1 p/ percent, 0 p/ integer) */
  decimals?: number;
  /** Escala quando format="percent": "100" trata 85.4 como 85,4%; "1" trata 0.854 como 85,4% */
  percentScale?: "100" | "1";
  /** Prefixo opcional concatenado antes do número formatado */
  prefix?: string;
  /** Sufixo opcional concatenado após o número formatado */
  suffix?: string;
  /** Configuração da mola do motion/react */
  springOptions?: SpringOptions;
  /** Se verdadeiro, anima a partir de 0 na montagem inicial (padrão: false para evitar salto em SSR) */
  animateOnMount?: boolean;
  /** Elemento semântico renderizado */
  as?: "span" | "div" | "strong";
  className?: string;
};

const DEFAULT_SPRING: SpringOptions = {
  stiffness: 120,
  damping: 22,
  mass: 0.75,
};

export function AnimatedNumber({
  value,
  format = "decimal",
  locale = "pt-BR",
  currency = "BRL",
  decimals,
  percentScale = "100",
  prefix = "",
  suffix = "",
  springOptions = DEFAULT_SPRING,
  animateOnMount = false,
  as = "span",
  className,
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeValue = Number.isFinite(value) ? value : 0;

  const resolvedDecimals = useMemo(() => {
    if (typeof decimals === "number") return decimals;
    if (format === "integer") return 0;
    if (format === "percent") return 1;
    return 2;
  }, [decimals, format]);

  const formatter = useMemo(() => {
    if (format === "currency") {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: resolvedDecimals,
        maximumFractionDigits: resolvedDecimals,
      });
    }
    return new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: resolvedDecimals,
      maximumFractionDigits: resolvedDecimals,
    });
  }, [currency, format, locale, resolvedDecimals]);

  const formatNumber = useCallback(
    (raw: number) => {
      const normalized = Number.isFinite(raw) ? raw : 0;
      const cleanZero = Object.is(normalized, -0) || Math.abs(normalized) < 1e-9 ? 0 : normalized;

      if (format === "percent") {
        const pctVal = percentScale === "1" ? cleanZero * 100 : cleanZero;
        return `${prefix}${formatter.format(pctVal)}%${suffix}`;
      }

      return `${prefix}${formatter.format(cleanZero)}${suffix}`;
    },
    [format, formatter, percentScale, prefix, suffix],
  );

  const motionValue = useMotionValue(
    animateOnMount && !prefersReducedMotion ? 0 : safeValue,
  );
  const springValue = useSpring(motionValue, springOptions);
  const displayValue = useTransform(springValue, (latest) => formatNumber(latest));

  useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.jump(safeValue);
      springValue.jump(safeValue);
      return;
    }
    motionValue.set(safeValue);
  }, [motionValue, prefersReducedMotion, safeValue, springValue]);

  const finalFormatted = formatNumber(safeValue);

  if (prefersReducedMotion) {
    const StaticTag = as;
    return (
      <StaticTag className={cn("tabular-nums", className)}>
        {finalFormatted}
      </StaticTag>
    );
  }

  const MotionTag =
    as === "div" ? motion.div : as === "strong" ? motion.strong : motion.span;

  return (
    <MotionTag
      aria-label={finalFormatted}
      className={cn("tabular-nums", className)}
    >
      {displayValue}
    </MotionTag>
  );
}

export default AnimatedNumber;
