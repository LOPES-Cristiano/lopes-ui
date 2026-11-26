"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "../../utils/cn";
import { IsometricBench } from "./IsometricBench";
import { useStillness } from "./live";
import type { Scene } from "./scene";

export interface IsometricShowcaseStep {
  id: string;
  tag: string;
  title: string;
  caption: string;
}

export interface IsometricShowcaseProps {
  scene: Scene;
  steps: readonly IsometricShowcaseStep[];
  /** Duração de cada etapa no modo automático em ms (default: 4800) */
  stepMs?: number;
  /** Inicia em reprodução automática (respeita prefers-reduced-motion; default: true) */
  autoPlay?: boolean;
  /** Exibe a bancada base sob as peças (default: true) */
  showBench?: boolean;
  /** Inclinação 3D sutil (parallax) seguindo o ponteiro (default: true) */
  tilt?: boolean;
  /** Elevação física ao passar o mouse em peças interativas (default: 3.5) */
  hoverLift?: number;
  /** Classe extra no container externo */
  className?: string;
  /** Classe extra no palco isométrico (ex: "max-w-[500px]") */
  figureClassName?: string;
  /** Prefixo para o aria-label acessível da figura */
  ariaLabelPrefix?: string;
  /** Mapeia clique em uma peça 3D (partId) para o índice da etapa ou ação customizada */
  onPartClick?: (partId: string, goToStep: (index: number) => void) => void;
  /** Callback ao passar o mouse/focar uma peça */
  onPartHover?: (partId: string | null) => void;
  /** Lista opcional de IDs de peças clicáveis */
  interactiveParts?: readonly string[];
  /** Tag do título da etapa (default: "h2") */
  headingAs?: "h1" | "h2" | "h3";
}

export function IsometricShowcase({
  scene,
  steps,
  stepMs = 4800,
  autoPlay = true,
  showBench = true,
  tilt = true,
  hoverLift = 3.5,
  className,
  figureClassName = "max-w-[500px]",
  ariaLabelPrefix = "Bancada isométrica",
  onPartClick,
  onPartHover,
  interactiveParts,
  headingAs = "h2",
}: IsometricShowcaseProps) {
  const prefersReduced = useStillness();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [cycle, setCycle] = useState(0);

  const isAutoPlaying = playing && !prefersReduced && steps.length > 1;

  const go = useCallback(
    (next: number) => {
      if (steps.length === 0) return;
      setStep(((next % steps.length) + steps.length) % steps.length);
      setCycle((c) => c + 1);
    },
    [steps.length],
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = window.setTimeout(() => go(step + 1), stepMs);
    return () => window.clearTimeout(timer);
  }, [isAutoPlaying, step, cycle, go, stepMs]);

  const current = steps[step] ?? steps[0];
  if (!current) return null;

  const Heading = headingAs;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOListElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(step + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(step - 1);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <div className="relative flex w-full items-center justify-center py-2">
        <IsometricBench
          scene={scene}
          step={step}
          showBench={showBench}
          tilt={tilt}
          hoverLift={hoverLift}
          className={figureClassName}
          label={`${ariaLabelPrefix}, etapa ${step + 1}: ${current.title}`}
          interactiveParts={interactiveParts}
          onPartClick={onPartClick ? (partId) => onPartClick(partId, go) : undefined}
          onPartHover={onPartHover}
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Heading className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {current.title}
          </Heading>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{current.caption}</p>
        </div>

        {steps.length > 1 ? (
          <button
            type="button"
            onClick={() => {
              setPlaying((p) => !p);
              setCycle((c) => c + 1);
            }}
            aria-pressed={!isAutoPlaying}
            aria-label={isAutoPlaying ? "Pausar demonstração" : "Reproduzir demonstração"}
            title={isAutoPlaying ? "Pausar" : "Reproduzir"}
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isAutoPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          </button>
        ) : null}
      </div>

      {steps.length > 1 ? (
        <ol
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
          aria-label="Etapas da demonstração"
          onKeyDown={handleKeyDown}
        >
          {steps.map((item, idx) => {
            const active = idx === step;
            const passed = idx < step;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(idx)}
                  aria-current={active ? "step" : undefined}
                  className="group w-full cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="h-[2px] w-full overflow-hidden rounded-full bg-border">
                    <div
                      key={active ? `${cycle}-${isAutoPlaying}` : "idle"}
                      className={cn(
                        "h-full origin-left bg-brand",
                        active && isAutoPlaying && "animate-[lopes-grow-x_var(--step-ms)_linear_forwards]",
                      )}
                      style={
                        {
                          transform:
                            passed || (active && !isAutoPlaying)
                              ? "scaleX(1)"
                              : !active
                                ? "scaleX(0)"
                                : undefined,
                          "--step-ms": `${stepMs}ms`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-2 block truncate font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
                      active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80",
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")} {item.tag}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

export default IsometricShowcase;
