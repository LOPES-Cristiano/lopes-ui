"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { useAccessControl, type AccessControlProps } from "./useAccessControl";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement>, AccessControlProps {
  /** Inverte a direção da animação */
  reverse?: boolean;
  /** Pausa a rolagem ao passar o mouse */
  pauseOnHover?: boolean;
  /** Orientação horizontal ou vertical */
  orientation?: "horizontal" | "vertical";
  /** Duração de um ciclo completo em segundos (default: 28) */
  duration?: number;
  /** Quantidade de cópias internas para preenchimento contínuo (default: 3) */
  repeat?: number;
  /** Aplica máscara de fade suave nas extremidades */
  fadeEdges?: boolean;
}

export default function Marquee({
  reverse = false,
  pauseOnHover = true,
  orientation = "horizontal",
  duration = 28,
  repeat = 3,
  fadeEdges = true,
  className,
  children,
  permission,
  role,
  permissions,
  roles,
  requireAll,
  onUnauthorized,
  fallback = null,
  ...props
}: MarqueeProps) {
  const access = useAccessControl({
    permission,
    role,
    permissions,
    roles,
    requireAll,
    onUnauthorized,
  });

  if (!access.allowed) return <>{fallback}</>;

  const isVertical = orientation === "vertical";

  return (
    <div
      style={
        {
          "--marquee-duration": `${duration}s`,
          "--marquee-gap": "1rem",
        } as React.CSSProperties
      }
      className={cn(
        "group relative flex overflow-hidden p-2 gap-4",
        isVertical ? "flex-col" : "flex-row",
        fadeEdges &&
          !isVertical &&
          "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        fadeEdges &&
          isVertical &&
          "[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]",
        className
      )}
      {...props}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          style={{
            animationDirection: reverse ? "reverse" : "normal",
          }}
          className={cn(
            "flex shrink-0 justify-around gap-4",
            isVertical
              ? "flex-col animate-lopes-marquee-y"
              : "flex-row items-center animate-lopes-marquee-x",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
