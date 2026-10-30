"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
} from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LightboxMediaItem = {
  id?: string;
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  thumbnail?: string;
  /** Media type. Auto-detected as "pdf" if `src` ends with `.pdf` */
  type?: "image" | "pdf";
};

export type ImageLightboxProps = {
  /** Controls modal visibility (ignored when `inline` is true) */
  open?: boolean;
  /** Called when closing modal mode */
  onClose?: () => void;
  /** Array of media items for gallery navigation */
  items?: LightboxMediaItem[];
  /** Convenience single-image src when `items` is omitted */
  src?: string;
  alt?: string;
  title?: string;
  caption?: string;
  /** Starting slide index. Default: 0 */
  initialIndex?: number;
  /**Controlled index */
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Render embedded inline inside a card/panel instead of a fullscreen portal. Default: false */
  inline?: boolean;
  /** Show bottom thumbnail filmstrip when multiple items exist. Default: true */
  showThumbnails?: boolean;
  /** Allow download action. Default: true */
  allowDownload?: boolean;
  /** Allow print action. Default: true */
  allowPrint?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

function isPdfItem(item: LightboxMediaItem): boolean {
  if (item.type) return item.type === "pdf";
  const cleanUrl = item.src.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".pdf");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImageLightbox({
  open = false,
  onClose,
  items: itemsProp,
  src,
  alt,
  title,
  caption,
  initialIndex = 0,
  activeIndex: controlledIndex,
  onIndexChange,
  inline = false,
  showThumbnails = true,
  allowDownload = true,
  allowPrint = true,
  className,
  componentId,
  hideIfDenied = false,
}: ImageLightboxProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const items: LightboxMediaItem[] = React.useMemo(() => {
    if (itemsProp && itemsProp.length > 0) return itemsProp;
    if (src) return [{ src, alt, title, caption }];
    return [];
  }, [itemsProp, src, alt, title, caption]);

  const [internalIndex, setInternalIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flippedX, setFlippedX] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const currentIndex = Math.max(
    0,
    Math.min(items.length - 1, controlledIndex ?? internalIndex),
  );
  const currentItem = items[currentIndex];
  const isPdf = currentItem ? isPdfItem(currentItem) : false;

  const isVisible = inline || open;
  useBodyScrollLock(!inline && open);

  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setFlippedX(false);
    setPan({ x: 0, y: 0 });
  }, []);

  const sessionKey = `${open}:${initialIndex}:${items.length}:${controlledIndex ?? ""}`;
  const [prevSessionKey, setPrevSessionKey] = useState(sessionKey);
  if (prevSessionKey !== sessionKey) {
    setPrevSessionKey(sessionKey);
    if (open && controlledIndex === undefined) {
      setInternalIndex(Math.max(0, Math.min(items.length - 1, initialIndex)));
    }
    setZoom(1);
    setRotation(0);
    setFlippedX(false);
    setPan({ x: 0, y: 0 });
  }

  const goTo = useCallback(
    (nextIdx: number) => {
      if (items.length === 0) return;
      const wrapped = ((nextIdx % items.length) + items.length) % items.length;
      if (controlledIndex === undefined) {
        setInternalIndex(wrapped);
      }
      onIndexChange?.(wrapped);
      resetTransform();
    },
    [items.length, controlledIndex, onIndexChange, resetTransform],
  );

  const zoomBy = useCallback((delta: number) => {
    setZoom((z) => {
      const next = Math.round(Math.max(0.25, Math.min(4, z + delta)) * 100) / 100;
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Keyboard shortcuts in modal mode
  useEffect(() => {
    if (inline || !open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      } else if (e.key === "ArrowRight" && items.length > 1) {
        e.preventDefault();
        goTo(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && items.length > 1) {
        e.preventDefault();
        goTo(currentIndex - 1);
      } else if ((e.key === "+" || e.key === "=") && !isPdf) {
        e.preventDefault();
        zoomBy(0.25);
      } else if (e.key === "-" && !isPdf) {
        e.preventDefault();
        zoomBy(-0.25);
      } else if (e.key === "0" && !isPdf) {
        e.preventDefault();
        resetTransform();
      } else if ((e.key === "r" || e.key === "R") && !isPdf) {
        e.preventDefault();
        setRotation((r) => (r + 90) % 360);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inline, open, items.length, currentIndex, isPdf, onClose, goTo, zoomBy, resetTransform]);

  if (!hasPermission && hideIfDenied) return null;
  if (!mounted || !isVisible || !currentItem) return null;

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    if (isPdf) {
      win.location.href = currentItem.src;
      return;
    }
    const safeSrc = currentItem.src.replace(/"/g, "&quot;");
    const safeTitle = (currentItem.title || currentItem.alt || "Imagem").replace(/</g, "&lt;");
    win.document.write(`<!doctype html><html><head><title>${safeTitle}</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}img{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body><img src="${safeSrc}" onload="window.print();window.close();" /></body></html>`);
    win.document.close();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPdf || zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragOrigin.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return;
    const dx = e.clientX - dragOrigin.current.x;
    const dy = e.clientY - dragOrigin.current.y;
    setPan({
      x: dragOrigin.current.panX + dx,
      y: dragOrigin.current.panY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragOrigin.current = null;
  };

  const viewerContent = (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      role={inline ? "region" : "dialog"}
      aria-modal={inline ? undefined : true}
      aria-label={currentItem.title || currentItem.alt || "Visualizador de mídia"}
      className={twMerge(
        "flex flex-col select-none text-zinc-100",
        inline
          ? "relative h-[480px] w-full overflow-hidden rounded-2xl border border-border bg-zinc-950"
          : "fixed inset-0 z-[9990] bg-zinc-950/92 backdrop-blur-md",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {items.length > 1 && (
            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-200">
              {currentIndex + 1} / {items.length}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs sm:text-sm font-semibold text-white">
              {currentItem.title || currentItem.alt || "Visualização"}
            </p>
            {currentItem.caption && (
              <p className="hidden sm:block truncate text-[11px] text-zinc-400">
                {currentItem.caption}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {!isPdf && (
            <>
              <button
                type="button"
                title="Diminuir zoom (-)"
                aria-label="Diminuir zoom"
                onClick={() => zoomBy(-0.25)}
                disabled={zoom <= 0.25}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                title="Redefinir visualização (0)"
                onClick={resetTransform}
                className="min-w-13 rounded-lg px-2 py-1 font-mono text-xs font-semibold text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                title="Aumentar zoom (+)"
                aria-label="Aumentar zoom"
                onClick={() => zoomBy(0.25)}
                disabled={zoom >= 4}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ZoomIn size={16} />
              </button>

              <span className="mx-1 h-4 w-px bg-white/15" />

              <button
                type="button"
                title="Girar à esquerda"
                aria-label="Girar à esquerda"
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                title="Girar à direita (R)"
                aria-label="Girar à direita"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCw size={16} />
              </button>
              <button
                type="button"
                title="Espelhar horizontalmente"
                aria-label="Espelhar horizontalmente"
                onClick={() => setFlippedX((f) => !f)}
                className={twMerge(
                  "hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer",
                  flippedX && "bg-white/15 text-white",
                )}
              >
                <FlipHorizontal size={16} />
              </button>
              <button
                type="button"
                title="Ajustar à tela"
                aria-label="Ajustar à tela"
                onClick={resetTransform}
                className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <Maximize2 size={15} />
              </button>
            </>
          )}

          {(allowDownload || allowPrint) && <span className="mx-1 h-4 w-px bg-white/15" />}

          {allowDownload && (
            <a
              href={currentItem.src}
              download={currentItem.title || true}
              target="_blank"
              rel="noopener noreferrer"
              title="Baixar arquivo"
              aria-label="Baixar arquivo"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Download size={16} />
            </a>
          )}

          {allowPrint && (
            <button
              type="button"
              title="Imprimir"
              aria-label="Imprimir"
              onClick={handlePrint}
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <Printer size={16} />
            </button>
          )}

          {!inline && onClose && (
            <>
              <span className="mx-1 h-4 w-px bg-white/15" />
              <button
                type="button"
                title="Fechar (Esc)"
                aria-label="Fechar"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stage */}
      <div
        onClick={(e) => {
          if (!inline && e.target === e.currentTarget) onClose?.();
        }}
        onWheel={(e) => {
          if (isPdf) return;
          e.preventDefault();
          zoomBy(e.deltaY < 0 ? 0.15 : -0.15);
        }}
        onDoubleClick={() => {
          if (isPdf) return;
          if (zoom > 1) {
            resetTransform();
          } else {
            setZoom(2);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={twMerge(
          "relative flex flex-1 items-center justify-center overflow-hidden p-4",
          !isPdf && zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
        )}
      >
        {/* Prev / Next arrows */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Item anterior"
              onClick={(e) => {
                e.stopPropagation();
                goTo(currentIndex - 1);
              }}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white border border-white/15 hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Próximo item"
              onClick={(e) => {
                e.stopPropagation();
                goTo(currentIndex + 1);
              }}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white border border-white/15 hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {isPdf ? (
          <iframe
            src={currentItem.src}
            title={currentItem.title || "Visualizador PDF"}
            className="h-full w-full max-w-5xl rounded-xl border border-white/15 bg-white"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentItem.src}
            alt={currentItem.alt || currentItem.title || ""}
            draggable={false}
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotation}deg) scaleX(${flippedX ? -1 : 1})`,
              transition: isDragging ? "none" : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
      </div>

      {/* Filmstrip Thumbnails */}
      {showThumbnails && items.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto border-t border-white/10 bg-black/50 px-4 py-2.5">
          {items.map((item, idx) => {
            const active = idx === currentIndex;
            const itemIsPdf = isPdfItem(item);
            return (
              <button
                key={item.id ?? `${item.src}-${idx}`}
                type="button"
                onClick={() => goTo(idx)}
                className={twMerge(
                  "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                  active
                    ? "border-primary ring-2 ring-primary/40 opacity-100 scale-105"
                    : "border-white/15 opacity-55 hover:opacity-90",
                )}
              >
                {itemIsPdf && !item.thumbnail ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-800 text-[10px] font-bold text-zinc-200">
                    <FileText size={15} />
                    <span>PDF</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail || item.src}
                    alt={item.alt || item.title || `Item ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (inline) {
    return viewerContent;
  }

  return createPortal(viewerContent, document.body);
}

export { ImageLightbox };
