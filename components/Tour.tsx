"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export interface TourStep {
  id?: string;
  /** Título do passo */
  title: string;
  /** Explicação detalhada do recurso */
  description: React.ReactNode;
  /** Badge opcional (ex: "Novo", "Dica") */
  badge?: string;
  /** Ilustração ou preview opcional */
  media?: React.ReactNode;
}

export interface TourProps {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Lista de passos do tour */
  steps: TourStep[];
  /** Passo inicial (default: 0) */
  defaultStep?: number;
  /** Passo controlado */
  currentStep?: number;
  /** Callback ao mudar de passo */
  onStepChange?: (step: number) => void;
  /** Callback ao concluir o tour */
  onFinish?: () => void;
  /** Callback ao pular/fechar o tour */
  onSkip?: () => void;
  /** Controla visibilidade */
  open?: boolean;
  /** Texto do botão final */
  finishLabel?: string;
  /** Classes adicionais */
  className?: string;
}

export default function Tour({
  steps,
  defaultStep = 0,
  currentStep: controlledStep,
  onStepChange,
  onFinish,
  onSkip,
  open = true,
  finishLabel = "Concluir tour",
  className,
  componentId,
  hideIfDenied = true,
}: TourProps) {
  const [internalStep, setInternalStep] = useState(defaultStep);
  const [dismissed, setDismissed] = useState(false);

  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  if (!hasAccess && hideIfDenied) return null;
  if (!open || dismissed || steps.length === 0) return null;

  const activeIdx = Math.min(steps.length - 1, Math.max(0, controlledStep ?? internalStep));
  const step = steps[activeIdx];
  const isFirst = activeIdx === 0;
  const isLast = activeIdx === steps.length - 1;

  const goTo = (nextIdx: number) => {
    const clamped = Math.min(steps.length - 1, Math.max(0, nextIdx));
    if (controlledStep === undefined) setInternalStep(clamped);
    onStepChange?.(clamped);
  };

  const handleClose = () => {
    if (controlledStep === undefined) setDismissed(true);
    onSkip?.();
  };

  const handleFinish = () => {
    if (controlledStep === undefined) setDismissed(true);
    onFinish?.();
  };

  return (
    <div
      role="dialog"
      aria-label={step.title}
      className={cn(
        "relative w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-lg transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={13} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Passo {activeIdx + 1} de {steps.length}
          </span>
          {step.badge && (
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
              {step.badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar guia"
          className="inline-flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Media preview slot */}
      {step.media && (
        <div className="mb-3.5 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3">
          {step.media}
        </div>
      )}

      {/* Title & Description */}
      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{step.title}</h4>
      <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
        {step.description}
      </div>

      {/* Footer: Progress dots + Navigation */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para passo ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIdx
                  ? "w-5 bg-indigo-600 dark:bg-indigo-400"
                  : "w-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={() => goTo(activeIdx - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
          )}
          {isLast ? (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              {finishLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo(activeIdx + 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors"
            >
              Próximo
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
