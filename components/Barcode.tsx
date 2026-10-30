"use client";

import React, { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Copy, Check, Printer } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── ISO/IEC 15417 Code-128 Pattern Table (0..106) ────────────────────────────

const CODE128_PATTERNS: readonly string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
  "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
  "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
  "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
  "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
  "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
  "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
  "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
  "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
  "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
  "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
  "211214", "211232", "2331112",
];

const CODE_C = 99;
const CODE_B = 100;
const START_B = 104;
const START_C = 105;
const STOP = 106;

export type BarcodeFormat = "auto" | "CODE128B" | "CODE128C";

export type BarcodeProps = {
  /** Raw string to encode (ASCII 32–126, SKUs, EANs, or 44-digit NF-e access keys) */
  value: string;
  /** Code-128 encoding mode. "auto" uses high-density Code-128C for digit runs (ideal for NF-e). Default: "auto" */
  format?: BarcodeFormat;
  /** Bar height in pixels. Default: 56 */
  height?: number;
  /** Single module width in pixels. Default: 1.8 */
  barWidth?: number;
  /** Quiet zone margin in modules on left & right. Default: 10 */
  quietZone?: number;
  /** Show human-readable text below the bars. Default: true */
  showValue?: boolean;
  /** Group numeric digits in blocks of N (e.g. `4` for 44-digit NF-e keys) in the human-readable caption */
  groupDigits?: number;
  /** Optional custom formatter for the human-readable text */
  formatDisplayValue?: (value: string) => string;
  /** Optional header title (e.g. "CHAVE DE ACESSO NF-e" or product title) */
  label?: string;
  /** Optional secondary metadata (e.g. "Filial Porto Velho · Série 001") */
  sublabel?: string;
  /** Show copy value button. Default: false */
  copyable?: boolean;
  /** Show print label button. Default: false */
  printable?: boolean;
  /** Scale SVG responsively to fit container width. Default: true */
  responsive?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

/** Encodes an ASCII string into Code-128 symbol codes (including Start, Checksum, and Stop) */
export function encodeCode128Symbols(rawValue: string, format: BarcodeFormat = "auto"): number[] {
  // Sanitize to printable ASCII 32..126
  const value = rawValue.replace(/[^\x20-\x7E]/g, "");
  if (!value) return [];

  const codes: number[] = [];

  if (format === "CODE128B") {
    codes.push(START_B);
    for (let i = 0; i < value.length; i++) {
      codes.push(value.charCodeAt(i) - 32);
    }
  } else if (format === "CODE128C") {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) return [];
    const normalized = digitsOnly.length % 2 === 1 ? `0${digitsOnly}` : digitsOnly;
    codes.push(START_C);
    for (let i = 0; i < normalized.length; i += 2) {
      codes.push(parseInt(normalized.slice(i, i + 2), 10));
    }
  } else {
    // "auto": dynamic switching between Code C (for >=4 consecutive digits) and Code B
    const countLeadingDigits = (idx: number): number => {
      let c = 0;
      while (idx + c < value.length && value[idx + c] >= "0" && value[idx + c] <= "9") {
        c++;
      }
      return c;
    };

    let i = 0;
    const initialDigits = countLeadingDigits(0);
    let currentSet: "B" | "C" =
      initialDigits >= 4 || (initialDigits === 2 && value.length === 2) ? "C" : "B";

    codes.push(currentSet === "C" ? START_C : START_B);

    while (i < value.length) {
      if (currentSet === "C") {
        const remDigits = countLeadingDigits(i);
        if (remDigits >= 2) {
          codes.push(parseInt(value.slice(i, i + 2), 10));
          i += 2;
        } else {
          codes.push(CODE_B);
          currentSet = "B";
        }
      } else {
        const remDigits = countLeadingDigits(i);
        if (remDigits >= 4) {
          // If odd run of digits, consume 1 digit in B first so C consumes all pairs cleanly
          if (remDigits % 2 === 1) {
            codes.push(value.charCodeAt(i) - 32);
            i += 1;
          }
          codes.push(CODE_C);
          currentSet = "C";
        } else {
          codes.push(value.charCodeAt(i) - 32);
          i += 1;
        }
      }
    }
  }

  // Modulo 103 checksum
  let weightedSum = codes[0];
  for (let pos = 1; pos < codes.length; pos++) {
    weightedSum += codes[pos] * pos;
  }
  codes.push(weightedSum % 103);
  codes.push(STOP);

  return codes;
}

type BarRect = { x: number; w: number };

function buildBars(symbols: number[], quietZone: number): { bars: BarRect[]; totalModules: number } {
  const bars: BarRect[] = [];
  let cursor = quietZone;

  for (const sym of symbols) {
    const pattern = CODE128_PATTERNS[sym];
    if (!pattern) continue;
    for (let idx = 0; idx < pattern.length; idx++) {
      const modules = pattern.charCodeAt(idx) - 48;
      if (idx % 2 === 0) {
        bars.push({ x: cursor, w: modules });
      }
      cursor += modules;
    }
  }

  return { bars, totalModules: cursor + quietZone };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Barcode({
  value,
  format = "auto",
  height = 56,
  barWidth = 1.8,
  quietZone = 10,
  showValue = true,
  groupDigits,
  formatDisplayValue,
  label,
  sublabel,
  copyable = false,
  printable = false,
  responsive = true,
  className,
  componentId,
  hideIfDenied = false,
}: BarcodeProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const [copied, setCopied] = useState(false);

  const cleanValue = (value || "").trim();

  const { bars, totalModules } = useMemo(() => {
    const symbols = encodeCode128Symbols(cleanValue, format);
    if (symbols.length === 0) return { bars: [], totalModules: 0 };
    return buildBars(symbols, quietZone);
  }, [cleanValue, format, quietZone]);

  const displayText = useMemo(() => {
    if (formatDisplayValue) return formatDisplayValue(cleanValue);
    if (groupDigits && groupDigits > 0 && /^\d+$/.test(cleanValue)) {
      const chunks: string[] = [];
      for (let i = 0; i < cleanValue.length; i += groupDigits) {
        chunks.push(cleanValue.slice(i, i + groupDigits));
      }
      return chunks.join(" ");
    }
    return cleanValue;
  }, [cleanValue, groupDigits, formatDisplayValue]);

  if (!hasPermission && hideIfDenied) return null;

  const svgWidth = Math.max(1, totalModules * barWidth);

  const handleCopy = async () => {
    if (!cleanValue || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(cleanValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handlePrint = () => {
    if (typeof window === "undefined" || bars.length === 0) return;
    const win = window.open("", "_blank", "width=720,height=420");
    if (!win) return;
    const rectsHtml = bars
      .map(
        (b) =>
          `<rect x="${(b.x * barWidth).toFixed(2)}" y="0" width="${(b.w * barWidth).toFixed(2)}" height="${height}" fill="#000" />`,
      )
      .join("");
    const safeLabel = (label || "").replace(/</g, "&lt;");
    const safeSub = (sublabel || "").replace(/</g, "&lt;");
    const safeDisp = displayText.replace(/</g, "&lt;");
    win.document.write(
      `<!doctype html><html><head><title>${safeLabel || safeDisp}</title><style>body{font-family:system-ui,sans-serif;padding:24px;text-align:center;color:#111}.box{display:inline-block;border:1px solid #ddd;border-radius:10px;padding:16px 24px}.lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555;margin-bottom:4px}.sub{font-size:11px;color:#777;margin-bottom:10px}.val{font-family:monospace;font-size:12px;font-weight:600;letter-spacing:.08em;margin-top:8px}</style></head><body onload="window.print();window.close();"><div class="box">${safeLabel ? `<div class="lbl">${safeLabel}</div>` : ""}${safeSub ? `<div class="sub">${safeSub}</div>` : ""}<svg width="${svgWidth}" height="${height}" viewBox="0 0 ${svgWidth} ${height}" xmlns="http://www.w3.org/2000/svg">${rectsHtml}</svg>${showValue ? `<div class="val">${safeDisp}</div>` : ""}</div></body></html>`,
    );
    win.document.close();
  };

  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "inline-flex max-w-full flex-col rounded-2xl border border-border bg-surface p-4 text-surface-foreground shadow-xs",
        !hasPermission && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {(label || sublabel || copyable || printable) && (
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {label && (
              <p className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            )}
            {sublabel && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{sublabel}</p>
            )}
          </div>

          {(copyable || printable) && (
            <div className="flex shrink-0 items-center gap-1">
              {copyable && (
                <button
                  type="button"
                  title={copied ? "Copiado!" : "Copiar código"}
                  aria-label="Copiar código"
                  onClick={handleCopy}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              )}
              {printable && (
                <button
                  type="button"
                  title="Imprimir etiqueta"
                  aria-label="Imprimir etiqueta"
                  onClick={handlePrint}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* White high-contrast scanner pad (essential for optical barcode readers even in dark mode) */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-3 text-zinc-950 ring-1 ring-zinc-200/70">
        {bars.length === 0 ? (
          <p className="py-3 text-xs text-zinc-400">Informe um código válido</p>
        ) : (
          <svg
            width={responsive ? "100%" : svgWidth}
            height={height}
            viewBox={`0 0 ${svgWidth} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Código de barras ${cleanValue}`}
            style={responsive ? { maxWidth: `${svgWidth}px` } : undefined}
          >
            {bars.map((b, idx) => (
              <rect
                key={idx}
                x={b.x * barWidth}
                y={0}
                width={b.w * barWidth}
                height={height}
                fill="#09090b"
                shapeRendering="crispEdges"
              />
            ))}
          </svg>
        )}

        {showValue && cleanValue && (
          <p className="mt-1.5 text-center font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-800 break-all">
            {displayText}
          </p>
        )}
      </div>
    </div>
  );
}

export { Barcode };
