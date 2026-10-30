"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────

export type WatermarkProps = {
  /** Single line or array of text lines stamped diagonally */
  content?: string | readonly string[];
  /** Optional logo/image URL stamped instead of text */
  image?: string;
  /** Width of a single watermark stamp in px (default: 140) */
  width?: number;
  /** Height of a single watermark stamp in px (default: 64) */
  height?: number;
  /** Rotation angle in degrees (default: -22, Ant Design standard) */
  rotate?: number;
  /** Horizontal and vertical spacing `[gapX, gapY]` between stamps in px (default: `[96, 96]`) */
  gap?: readonly [number, number];
  /** Initial `[offsetX, offsetY]` in px */
  offset?: readonly [number, number];
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  fontFamily?: string;
  /** Custom ink color. When omitted, automatically adapts to Light/Dark mode */
  fontColor?: string;
  /** Overall stamp opacity (default: 0.13) */
  opacity?: number;
  zIndex?: number;
  /** Restores the watermark node via MutationObserver if deleted or hidden in DevTools (default: true) */
  tamperProof?: boolean;
  children?: React.ReactNode;
  className?: string;
  componentId?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Watermark({
  content = "CONFIDENCIAL",
  image,
  width = 150,
  height = 68,
  rotate = -22,
  gap = [96, 96],
  offset,
  fontSize = 13,
  fontWeight = "semibold",
  fontFamily = "system-ui, -apple-system, sans-serif",
  fontColor,
  opacity = 0.14,
  zIndex = 9,
  tamperProof = true,
  children,
  className,
  componentId,
}: WatermarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const watermarkElRef = useRef<HTMLDivElement | null>(null);

  const gapX = gap[0];
  const gapY = gap[1];
  const offsetX = offset?.[0] ?? Math.round(gapX / 2);
  const offsetY = offset?.[1] ?? Math.round(gapY / 2);

  const buildTileDataUrl = useCallback(
    (isDark: boolean): Promise<{ url: string; tileW: number }> => {
      return new Promise((resolve) => {
        if (typeof document === "undefined") {
          resolve({ url: "", tileW: width + gapX });
          return;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const ratio = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;

        // Staggered 2x2 brick grid just like Ant Design Watermark
        const cellW = width + gapX;
        const cellH = height + gapY;
        const canvasW = cellW * 2;
        const canvasH = cellH * 2;

        canvas.width = canvasW * ratio;
        canvas.height = canvasH * ratio;

        if (!ctx) {
          resolve({ url: "", tileW: canvasW });
          return;
        }

        const rad = (Math.PI / 180) * rotate;
        const resolvedColor =
          fontColor ?? (isDark ? "rgba(255, 255, 255, 1)" : "rgba(24, 24, 27, 1)");
        const weightNum =
          fontWeight === "bold"
            ? 700
            : fontWeight === "semibold"
              ? 600
              : fontWeight === "medium"
                ? 500
                : 400;

        const drawStampAt = (cx: number, cy: number, imgEl?: HTMLImageElement) => {
          ctx.save();
          ctx.translate(cx * ratio, cy * ratio);
          ctx.rotate(rad);
          ctx.globalAlpha = opacity;

          if (imgEl) {
            ctx.drawImage(
              imgEl,
              (-width / 2) * ratio,
              (-height / 2) * ratio,
              width * ratio,
              height * ratio
            );
          } else {
            const lines = Array.isArray(content) ? content : [String(content)];
            ctx.font = `${weightNum} ${fontSize * ratio}px ${fontFamily}`;
            ctx.fillStyle = resolvedColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const lineH = (fontSize + 5) * ratio;
            const startY = -((lines.length - 1) * lineH) / 2;
            lines.forEach((line, idx) => {
              ctx.fillText(line, 0, startY + idx * lineH);
            });
          }
          ctx.restore();
        };

        if (image) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            drawStampAt(width / 2, height / 2, img);
            drawStampAt(cellW + width / 2, cellH + height / 2, img);
            resolve({ url: canvas.toDataURL(), tileW: canvasW });
          };
          img.onerror = () => {
            drawStampAt(width / 2, height / 2);
            drawStampAt(cellW + width / 2, cellH + height / 2);
            resolve({ url: canvas.toDataURL(), tileW: canvasW });
          };
          img.src = image;
        } else {
          drawStampAt(width / 2, height / 2);
          drawStampAt(cellW + width / 2, cellH + height / 2);
          resolve({ url: canvas.toDataURL(), tileW: canvasW });
        }
      });
    },
    [content, image, width, height, rotate, gapX, gapY, fontSize, fontWeight, fontFamily, fontColor, opacity]
  );

  const applyOverlayStyle = useCallback(
    (el: HTMLDivElement, dataUrl: string, tileW: number) => {
      const styleMap: Record<string, string> = {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        "pointer-events": "none",
        "background-repeat": "repeat",
        "background-position": `${offsetX}px ${offsetY}px`,
        "background-size": `${tileW}px auto`,
        "background-image": `url('${dataUrl}')`,
        "z-index": String(zIndex),
        visibility: "visible",
        opacity: "1",
        display: "block",
      };
      el.setAttribute(
        "style",
        Object.entries(styleMap)
          .map(([k, v]) => `${k}:${v} !important`)
          .join(";")
      );
    },
    [offsetX, offsetY, zIndex]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof document === "undefined") return;

    let cancelled = false;
    let latestUrl = "";
    let latestTileW = (width + gapX) * 2;
    let internalMutating = false;

    const mountOrRefreshOverlay = () => {
      if (cancelled || !containerRef.current || !latestUrl) return;
      internalMutating = true;
      let wm = watermarkElRef.current;
      if (!wm || wm.parentElement !== containerRef.current) {
        if (wm && wm.parentElement) wm.parentElement.removeChild(wm);
        wm = document.createElement("div");
        wm.setAttribute("aria-hidden", "true");
        watermarkElRef.current = wm;
        containerRef.current.appendChild(wm);
      }
      applyOverlayStyle(wm, latestUrl, latestTileW);
      requestAnimationFrame(() => {
        internalMutating = false;
      });
    };

    const renderForTheme = async () => {
      const isDark = document.documentElement.classList.contains("dark");
      const { url, tileW } = await buildTileDataUrl(isDark);
      if (cancelled) return;
      latestUrl = url;
      latestTileW = tileW;
      mountOrRefreshOverlay();
    };

    void renderForTheme();

    // Watch Dark/Light mode changes on <html>
    const themeObserver = new MutationObserver(() => {
      void renderForTheme();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Ant Design tamper-proof observer
    let tamperObserver: MutationObserver | null = null;
    if (tamperProof) {
      tamperObserver = new MutationObserver((mutations) => {
        if (internalMutating || cancelled) return;
        for (const m of mutations) {
          const removedTarget = Array.from(m.removedNodes).some(
            (n) => n === watermarkElRef.current
          );
          const alteredTarget = m.type === "attributes" && m.target === watermarkElRef.current;
          if (removedTarget || alteredTarget) {
            mountOrRefreshOverlay();
            break;
          }
        }
      });
      tamperObserver.observe(container, {
        childList: true,
        attributes: true,
        subtree: true,
      });
    }

    return () => {
      cancelled = true;
      themeObserver.disconnect();
      tamperObserver?.disconnect();
      if (watermarkElRef.current && watermarkElRef.current.parentElement) {
        watermarkElRef.current.parentElement.removeChild(watermarkElRef.current);
      }
      watermarkElRef.current = null;
    };
  }, [buildTileDataUrl, applyOverlayStyle, tamperProof, width, gapX]);

  return (
    <div
      ref={containerRef}
      data-component-id={componentId}
      className={twMerge("relative overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
