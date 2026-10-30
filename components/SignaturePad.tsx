"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Download, Eraser, PenTool, Undo2 } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./form/FieldWrapper";
import { useAccessControl } from "./useAccessControl";

export type SignaturePoint = { x: number; y: number };

export type SignatureStroke = {
  color: string;
  width: number;
  points: SignaturePoint[];
};

export type SignaturePadRef = {
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string) => string | null;
  toSVG: () => string | null;
};

export type SignaturePadProps = {
  /** Initial or controlled PNG/SVG data URL */
  value?: string | null;
  /** Emits PNG data URL whenever a stroke completes, or `null` when cleared */
  onChange?: (dataUrl: string | null) => void;
  height?: number;
  penColor?: string;
  penWidth?: number;
  /** Show pen color & thickness toolbar. Default: true */
  showToolbar?: boolean;
  /** Show baseline rule and optional signer name / document caption. Default: true */
  showBaseline?: boolean;
  signerName?: string;
  signerDocument?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
  ref?: React.Ref<SignaturePadRef>;
};

const PEN_COLORS = [
  { color: "#09090b", label: "Preto" },
  { color: "#1d4ed8", label: "Azul Caneta" },
  { color: "#3f3f46", label: "Grafite" },
];

export default function SignaturePad({
  value,
  onChange,
  height = 180,
  penColor: initialColor = "#09090b",
  penWidth: initialWidth = 2.2,
  showToolbar = true,
  showBaseline = true,
  signerName,
  signerDocument,
  placeholder = "Assine aqui com o mouse, dedo ou caneta digital",
  disabled = false,
  readOnly = false,
  error = false,
  className,
  componentId,
  hideIfDenied = false,
  ref,
}: SignaturePadProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);
  const canDraw = !effectiveDisabled && !readOnly;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<SignatureStroke[]>([]);
  const activeStrokeRef = useRef<SignatureStroke | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const [strokeCount, setStrokeCount] = useState(0);
  const [penColor, setPenColor] = useState(initialColor);
  const [penWidth, setPenWidth] = useState(initialWidth);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, rect.width, rect.height);
    }

    const drawStroke = (stroke: SignatureStroke) => {
      const pts = stroke.points;
      if (pts.length === 0) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.restore();
    };

    for (const s of strokesRef.current) {
      drawStroke(s);
    }
    if (activeStrokeRef.current) {
      drawStroke(activeStrokeRef.current);
    }
  }, []);

  // Load external value image if provided and no local strokes exist
  useEffect(() => {
    if (!value) {
      if (strokesRef.current.length === 0) {
        bgImageRef.current = null;
        redrawAll();
      }
      return;
    }
    if (strokesRef.current.length > 0) return;
    const img = new window.Image();
    img.onload = () => {
      bgImageRef.current = img;
      redrawAll();
    };
    img.src = value;
  }, [value, redrawAll]);

  useEffect(() => {
    redrawAll();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => redrawAll());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redrawAll]);

  const emitSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (strokesRef.current.length === 0 && !bgImageRef.current) {
      onChange?.(null);
      return;
    }
    onChange?.(canvas.toDataURL("image/png"));
  }, [onChange]);

  const handleClear = useCallback(() => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    bgImageRef.current = null;
    setStrokeCount(0);
    redrawAll();
    onChange?.(null);
  }, [redrawAll, onChange]);

  const handleUndo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redrawAll();
    emitSnapshot();
  }, [redrawAll, emitSnapshot]);

  const buildSvgString = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || strokesRef.current.length === 0) return null;
    const rect = canvas.getBoundingClientRect();
    const paths = strokesRef.current
      .map((s) => {
        if (s.points.length === 0) return "";
        const d = s.points
          .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ");
        return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round" />`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(rect.width)}" height="${Math.round(rect.height)}" viewBox="0 0 ${Math.round(rect.width)} ${Math.round(rect.height)}">${paths}</svg>`;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      clear: handleClear,
      undo: handleUndo,
      isEmpty: () => strokesRef.current.length === 0 && !bgImageRef.current,
      toDataURL: (type = "image/png") => {
        if (strokesRef.current.length === 0 && !bgImageRef.current) return null;
        return canvasRef.current?.toDataURL(type) ?? null;
      },
      toSVG: buildSvgString,
    }),
    [handleClear, handleUndo, buildSvgString]
  );

  const getRelativePoint = (e: React.PointerEvent<HTMLCanvasElement>): SignaturePoint => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getRelativePoint(e);
    activeStrokeRef.current = {
      color: penColor,
      width: penWidth,
      points: [pt],
    };
    redrawAll();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw || !activeStrokeRef.current) return;
    e.preventDefault();
    const pt = getRelativePoint(e);
    activeStrokeRef.current.points.push(pt);
    redrawAll();
  };

  const finishStroke = () => {
    if (!activeStrokeRef.current) return;
    strokesRef.current = [...strokesRef.current, activeStrokeRef.current];
    activeStrokeRef.current = null;
    setStrokeCount(strokesRef.current.length);
    redrawAll();
    emitSnapshot();
  };

  const handleDownload = () => {
    const url = canvasRef.current?.toDataURL("image/png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "assinatura.png";
    a.click();
  };

  if (!hasPermission && hideIfDenied) return null;

  const isEmpty = strokeCount === 0 && !value;

  return (
    <div
      data-component-id={componentId}
      className={twMerge(
        "flex flex-col overflow-hidden rounded-xl border bg-surface text-foreground transition-colors",
        error ? "border-danger" : "border-border",
        effectiveDisabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {showToolbar && !readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-muted/50 px-3 py-1.5 select-none">
          <div className="flex items-center gap-2">
            <PenTool size={13} className="text-muted-foreground" />
            <div className="flex items-center gap-1">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  title={c.label}
                  aria-label={`Cor ${c.label}`}
                  onClick={() => setPenColor(c.color)}
                  className={twMerge(
                    "h-4.5 w-4.5 rounded-full border transition-transform cursor-pointer",
                    penColor === c.color
                      ? "scale-115 ring-2 ring-primary ring-offset-1 ring-offset-surface"
                      : "border-border opacity-75 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>
            <div className="mx-1 h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1">
              {[
                { w: 1.6, label: "Fina" },
                { w: 2.4, label: "Média" },
                { w: 3.6, label: "Forte" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setPenWidth(opt.w)}
                  className={twMerge(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer",
                    penWidth === opt.w
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokeCount === 0}
              title="Desfazer último traço"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:opacity-35 cursor-pointer"
            >
              <Undo2 size={13} />
              <span className="hidden sm:inline">Desfazer</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isEmpty}
              title="Limpar assinatura"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-35 cursor-pointer"
            >
              <Eraser size={13} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isEmpty}
              title="Baixar PNG"
              aria-label="Baixar assinatura em PNG"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:opacity-35 cursor-pointer"
            >
              <Download size={13} />
            </button>
          </div>
        </div>
      )}

      {/* White / crisp paper canvas area */}
      <div
        className="relative w-full bg-white dark:bg-zinc-100 select-none"
        style={{ height: `${height}px` }}
      >
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="text-xs font-medium text-zinc-400">{placeholder}</span>
          </div>
        )}

        {showBaseline && (
          <div className="pointer-events-none absolute inset-x-8 bottom-6 flex flex-col items-center">
            <div className="w-full border-b border-dashed border-zinc-300" />
            {(signerName || signerDocument) && (
              <p className="mt-1 text-[10px] font-medium text-zinc-500">
                {signerName}
                {signerName && signerDocument ? " · " : ""}
                {signerDocument}
              </p>
            )}
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          className={twMerge(
            "block h-full w-full touch-none",
            canDraw ? "cursor-crosshair" : "cursor-default"
          )}
        />
      </div>
    </div>
  );
}

// ── Companion Form Field Wrapper ─────────────────────────────────────────────

export type SignatureFieldProps = Omit<SignaturePadProps, "error"> &
  Pick<
    FieldWrapperProps,
    | "label"
    | "labelInline"
    | "orientation"
    | "labelWidth"
    | "required"
    | "tooltip"
    | "labelAction"
    | "helpText"
    | "hint"
    | "width"
  > & {
    id?: string;
    name?: string;
    error?: string;
    wrapperClassName?: string;
  };

export function SignatureField({
  id,
  name,
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  error,
  helpText,
  hint,
  width,
  wrapperClassName,
  value,
  ...padProps
}: SignatureFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={wrapperClassName}
    >
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <SignaturePad value={value} error={Boolean(error)} {...padProps} />
    </FieldWrapper>
  );
}
