"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, Copy, Download, Loader2, Printer, RefreshCw } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type QRCodeErrorLevel = "L" | "M" | "Q" | "H";
export type QRCodeStatus = "active" | "expired" | "loading" | "scanned";
export type QRCodeModuleStyle = "squares" | "rounded" | "dots";

export type QRCodeProps = {
  /** String payload encoded into the QR matrix (URL, PIX Copia-e-Cola, NF-e link, Wi-Fi, SKU, etc.) */
  value: string;
  /** Rendered width/height in px (default: 180) */
  size?: number;
  /** Quiet-zone margin in modules (default: 2) */
  quietZone?: number;
  /** Error correction level (auto-elevated to "H" when `icon` is provided) */
  errorLevel?: QRCodeErrorLevel;
  /** Ant Design QRCode lifecycle status overlay */
  status?: QRCodeStatus;
  /** Invoked when the user clicks "Atualizar" on an expired QR code */
  onRefresh?: () => void;
  expiredText?: string;
  refreshLabel?: string;
  scannedText?: string;
  /** Center logo URL or custom React icon node */
  icon?: string | React.ReactNode;
  /** Diameter/width of the center logo box in px (default: ~22% of `size`) */
  iconSize?: number;
  moduleStyle?: QRCodeModuleStyle;
  /** Dark module color (default: `#18181b`) */
  color?: string;
  /** Light background color (default: `#ffffff`) */
  bgColor?: string;
  bordered?: boolean;
  title?: React.ReactNode;
  caption?: React.ReactNode;
  copyable?: boolean;
  downloadable?: boolean;
  downloadFileName?: string;
  printable?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

// ── Pure TypeScript ISO/IEC 18004 QR Encoder (Versions 1–12, Byte Mode) ──────

type EcBlockSpec = readonly [
  ecPerBlock: number,
  g1Blocks: number,
  g1DataCw: number,
  g2Blocks: number,
  g2DataCw: number,
];

const EC_TABLE: Record<QRCodeErrorLevel, readonly EcBlockSpec[]> = {
  L: [
    [7, 1, 19, 0, 0],
    [10, 1, 34, 0, 0],
    [15, 1, 55, 0, 0],
    [20, 1, 80, 0, 0],
    [26, 1, 108, 0, 0],
    [18, 2, 68, 0, 0],
    [20, 2, 78, 0, 0],
    [24, 2, 97, 0, 0],
    [30, 2, 116, 0, 0],
    [18, 2, 68, 2, 69],
    [20, 4, 81, 0, 0],
    [24, 2, 92, 2, 93],
  ],
  M: [
    [10, 1, 16, 0, 0],
    [16, 1, 28, 0, 0],
    [26, 1, 44, 0, 0],
    [18, 2, 32, 0, 0],
    [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0],
    [18, 4, 31, 0, 0],
    [22, 2, 38, 2, 39],
    [22, 3, 36, 2, 37],
    [26, 4, 43, 1, 44],
    [30, 1, 50, 4, 51],
    [22, 6, 36, 2, 37],
  ],
  Q: [
    [13, 1, 13, 0, 0],
    [22, 1, 22, 0, 0],
    [18, 2, 17, 0, 0],
    [26, 2, 24, 0, 0],
    [18, 2, 15, 2, 16],
    [24, 4, 19, 0, 0],
    [18, 2, 14, 4, 15],
    [22, 4, 18, 2, 19],
    [20, 4, 16, 4, 17],
    [24, 6, 19, 2, 20],
    [28, 4, 22, 4, 23],
    [26, 4, 20, 6, 21],
  ],
  H: [
    [17, 1, 9, 0, 0],
    [28, 1, 16, 0, 0],
    [22, 2, 13, 0, 0],
    [16, 4, 9, 0, 0],
    [22, 2, 11, 2, 12],
    [28, 4, 15, 0, 0],
    [26, 4, 13, 1, 14],
    [26, 4, 14, 2, 15],
    [24, 4, 12, 4, 13],
    [28, 6, 15, 2, 16],
    [24, 3, 12, 8, 13],
    [28, 7, 14, 4, 15],
  ],
};

const ALIGNMENT_CENTERS: readonly (readonly number[])[] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
];

const EC_FORMAT_BITS: Record<QRCodeErrorLevel, number> = {
  L: 0b01,
  M: 0b00,
  Q: 0b11,
  H: 0b10,
};

// GF(256) log/exp tables with primitive polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecLen - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < ecLen; j++) {
        rem[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return rem;
}

function computeFormatBits(level: QRCodeErrorLevel, mask: number): number {
  const data = (EC_FORMAT_BITS[level] << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) rem ^= 0x537 << (i - 10);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function computeVersionBits(version: number): number {
  let rem = version << 12;
  for (let i = 17; i >= 12; i--) {
    if ((rem >> i) & 1) rem ^= 0x1f25 << (i - 12);
  }
  return (version << 12) | rem;
}

function maskPredicate(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7:
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
  }
}

function scorePenalty(modules: boolean[][], size: number): number {
  let penalty = 0;

  // Rule N1: runs of >= 5 identical modules in row/col
  for (let r = 0; r < size; r++) {
    let runH = 1;
    let runV = 1;
    for (let c = 1; c < size; c++) {
      if (modules[r][c] === modules[r][c - 1]) {
        runH++;
        if (runH === 5) penalty += 3;
        else if (runH > 5) penalty += 1;
      } else {
        runH = 1;
      }
      if (modules[c][r] === modules[c - 1][r]) {
        runV++;
        if (runV === 5) penalty += 3;
        else if (runV > 5) penalty += 1;
      } else {
        runV = 1;
      }
    }
  }

  // Rule N2: 2x2 solid blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const m = modules[r][c];
      if (m === modules[r][c + 1] && m === modules[r + 1][c] && m === modules[r + 1][c + 1]) {
        penalty += 3;
      }
    }
  }

  // Rule N3: finder-like 1:1:3:1:1 patterns
  const matchFinderSeq = (get: (i: number) => boolean) => {
    for (let i = 0; i <= size - 11; i++) {
      const p1 =
        get(i) &&
        !get(i + 1) &&
        get(i + 2) &&
        get(i + 3) &&
        get(i + 4) &&
        !get(i + 5) &&
        get(i + 6) &&
        !get(i + 7) &&
        !get(i + 8) &&
        !get(i + 9) &&
        !get(i + 10);
      const p2 =
        !get(i) &&
        !get(i + 1) &&
        !get(i + 2) &&
        !get(i + 3) &&
        get(i + 4) &&
        !get(i + 5) &&
        get(i + 6) &&
        get(i + 7) &&
        get(i + 8) &&
        !get(i + 9) &&
        get(i + 10);
      if (p1 || p2) penalty += 40;
    }
  };
  for (let i = 0; i < size; i++) {
    matchFinderSeq((c) => modules[i][c]);
    matchFinderSeq((r) => modules[r][i]);
  }

  // Rule N4: dark/light balance
  let dark = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) dark++;
    }
  }
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  if (k > 0) penalty += k * 10;

  return penalty;
}

export function encodeQRMatrix(text: string, requestedLevel: QRCodeErrorLevel): {
  modules: boolean[][];
  size: number;
  version: number;
} | null {
  const bytes = new TextEncoder().encode(text || " ");
  let chosenLevel: QRCodeErrorLevel = requestedLevel;
  let chosenVersion = -1;

  const trySelectVersion = (lvl: QRCodeErrorLevel): number => {
    const specs = EC_TABLE[lvl];
    for (let v = 1; v <= specs.length; v++) {
      const [, g1B, g1D, g2B, g2D] = specs[v - 1];
      const totalDataBytes = g1B * g1D + g2B * g2D;
      const countBits = v >= 10 ? 16 : 8;
      const neededBits = 4 + countBits + bytes.length * 8;
      if (neededBits <= totalDataBytes * 8) return v;
    }
    return -1;
  };

  // Pick smallest version at requested ECC; gracefully step down ECC only if payload is very long
  const fallbackOrder: QRCodeErrorLevel[] =
    requestedLevel === "H"
      ? ["H", "Q", "M", "L"]
      : requestedLevel === "Q"
        ? ["Q", "M", "L"]
        : requestedLevel === "M"
          ? ["M", "L"]
          : ["L"];

  for (const lvl of fallbackOrder) {
    const v = trySelectVersion(lvl);
    if (v !== -1) {
      chosenLevel = lvl;
      chosenVersion = v;
      break;
    }
  }

  if (chosenVersion === -1) return null;

  const spec = EC_TABLE[chosenLevel][chosenVersion - 1];
  const [ecPerBlock, g1Blocks, g1DataCw, g2Blocks, g2DataCw] = spec;
  const totalDataCw = g1Blocks * g1DataCw + g2Blocks * g2DataCw;

  // Build data bitstream (Byte mode = 0100)
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4);
  pushBits(bytes.length, chosenVersion >= 10 ? 16 : 8);
  for (let i = 0; i < bytes.length; i++) {
    pushBits(bytes[i], 8);
  }

  const capacityBits = totalDataCw * 8;
  const terminator = Math.min(4, capacityBits - bits.length);
  pushBits(0, terminator);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataCw = new Uint8Array(totalDataCw);
  for (let i = 0; i < bits.length / 8; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
    dataCw[i] = b;
  }
  const padBytes = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < totalDataCw; i++, p++) {
    dataCw[i] = padBytes[p & 1];
  }

  // Split into RS blocks & interleave
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  const totalBlocks = g1Blocks + g2Blocks;
  for (let b = 0; b < totalBlocks; b++) {
    const len = b < g1Blocks ? g1DataCw : g2DataCw;
    const slice = dataCw.slice(offset, offset + len);
    offset += len;
    dataBlocks.push(slice);
    ecBlocks.push(rsRemainder(slice, ecPerBlock));
  }

  const finalCw: number[] = [];
  const maxDataLen = Math.max(g1DataCw, g2DataCw);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (i < dataBlocks[b].length) finalCw.push(dataBlocks[b][i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      finalCw.push(ecBlocks[b][i]);
    }
  }

  // Build matrix & function reservations
  const dim = chosenVersion * 4 + 17;
  const modules: boolean[][] = Array.from({ length: dim }, () => new Array<boolean>(dim).fill(false));
  const isFunc: boolean[][] = Array.from({ length: dim }, () => new Array<boolean>(dim).fill(false));

  const setFunctionModule = (r: number, c: number, dark: boolean) => {
    if (r < 0 || r >= dim || c < 0 || c >= dim) return;
    modules[r][c] = dark;
    isFunc[r][c] = true;
  };

  // Finder patterns + 1-module white separator
  const drawFinder = (topR: number, leftC: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const dist = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        const dark = dist !== 2 && dist !== 4;
        setFunctionModule(topR + dr, leftC + dc, dark);
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, dim - 7);
  drawFinder(dim - 7, 0);

  // Timing patterns
  for (let i = 8; i < dim - 8; i++) {
    if (!isFunc[6][i]) setFunctionModule(6, i, i % 2 === 0);
    if (!isFunc[i][6]) setFunctionModule(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const centers = ALIGNMENT_CENTERS[chosenVersion - 1];
  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < centers.length; j++) {
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === centers.length - 1) ||
        (i === centers.length - 1 && j === 0)
      ) {
        continue;
      }
      const cr = centers[i];
      const cc = centers[j];
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          setFunctionModule(cr + dr, cc + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
        }
      }
    }
  }

  // Always-dark module & reserve format info strips
  setFunctionModule(4 * chosenVersion + 9, 8, true);
  for (let i = 0; i <= 8; i++) {
    if (!isFunc[8][i]) setFunctionModule(8, i, false);
    if (!isFunc[i][8]) setFunctionModule(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunc[8][dim - 1 - i]) setFunctionModule(8, dim - 1 - i, false);
    if (!isFunc[dim - 1 - i][8]) setFunctionModule(dim - 1 - i, 8, false);
  }

  // Version info blocks (V >= 7)
  if (chosenVersion >= 7) {
    const vBits = computeVersionBits(chosenVersion);
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >> i) & 1) === 1;
      const a = dim - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunctionModule(b, a, bit);
      setFunctionModule(a, b, bit);
    }
  }

  // Zigzag placement of codewords
  let bitIdx = 0;
  const totalBits = finalCw.length * 8;
  for (let right = dim - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < dim; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? dim - 1 - vert : vert;
        if (!isFunc[row][col] && bitIdx < totalBits) {
          const byte = finalCw[bitIdx >> 3];
          const dark = ((byte >> (7 - (bitIdx & 7))) & 1) === 1;
          modules[row][col] = dark;
          bitIdx++;
        }
      }
    }
  }

  const writeFormatInfo = (target: boolean[][], mask: number) => {
    const fBits = computeFormatBits(chosenLevel, mask);
    // First copy (around top-left finder: (0,8)..(8,8)..(8,0))
    for (let i = 0; i <= 5; i++) target[i][8] = ((fBits >> i) & 1) === 1;
    target[7][8] = ((fBits >> 6) & 1) === 1;
    target[8][8] = ((fBits >> 7) & 1) === 1;
    target[8][7] = ((fBits >> 8) & 1) === 1;
    for (let i = 9; i < 15; i++) target[8][14 - i] = ((fBits >> i) & 1) === 1;

    // Second copy (top-right horizontal + bottom-left vertical)
    for (let i = 0; i < 8; i++) target[8][dim - 1 - i] = ((fBits >> i) & 1) === 1;
    for (let i = 8; i < 15; i++) target[dim - 15 + i][8] = ((fBits >> i) & 1) === 1;
    target[dim - 8][8] = true;
  };

  // Evaluate all 8 masks and choose lowest ISO penalty
  let bestMask = 0;
  let bestScore = Infinity;
  let bestMatrix = modules;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = modules.map((row, r) =>
      row.map((val, c) => (!isFunc[r][c] && maskPredicate(mask, r, c) ? !val : val))
    );
    writeFormatInfo(candidate, mask);
    const score = scorePenalty(candidate, dim);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
      bestMatrix = candidate;
    }
  }

  writeFormatInfo(bestMatrix, bestMask);
  return { modules: bestMatrix, size: dim, version: chosenVersion };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QRCode({
  value,
  size = 180,
  quietZone = 2,
  errorLevel = "M",
  status = "active",
  onRefresh,
  expiredText = "QR Code expirado",
  refreshLabel = "Atualizar",
  scannedText = "Escaneado",
  icon,
  iconSize,
  moduleStyle = "squares",
  color = "#18181b",
  bgColor = "#ffffff",
  bordered = true,
  title,
  caption,
  copyable = false,
  downloadable = false,
  downloadFileName = "qrcode",
  printable = false,
  className,
  componentId,
  hideIfDenied = true,
}: QRCodeProps) {
  const uid = useId();
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);

  // Automatically elevate ECC to H (30% recovery) when a center logo/icon is overlaid
  const effectiveLevel: QRCodeErrorLevel = icon ? "H" : errorLevel;

  const qr = useMemo(
    () => encodeQRMatrix(value || " ", effectiveLevel),
    [value, effectiveLevel]
  );

  if (!hasPermission && hideIfDenied) return null;

  const resolvedIconPx = iconSize ?? Math.round(size * 0.22);

  const handleCopy = async () => {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleDownloadPng = () => {
    if (!svgRef.current || typeof document === "undefined") return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const scale = 3;
      const canvas = document.createElement("canvas");
      canvas.width = size * scale;
      canvas.height = size * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${downloadFileName}.png`;
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handlePrint = () => {
    if (!svgRef.current || typeof window === "undefined") return;
    const svgMarkup = new XMLSerializer().serializeToString(svgRef.current);
    const win = window.open("", "_blank", "width=420,height=520");
    if (!win) return;
    win.document.write(`<!doctype html>
<html>
  <head>
    <title>${typeof title === "string" ? title : "QR Code"}</title>
    <style>
      body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; margin: 0; text-align: center; }
      h1 { font-size: 15px; margin: 0 0 12px; }
      p { font-size: 11px; color: #52525b; margin: 10px 0 0; word-break: break-all; max-width: 280px; }
    </style>
  </head>
  <body>
    ${typeof title === "string" ? `<h1>${title}</h1>` : ""}
    ${svgMarkup}
    ${typeof caption === "string" ? `<p>${caption}</p>` : ""}
    <script>window.onload = () => { window.print(); window.close(); };</script>
  </body>
</html>`);
    win.document.close();
  };

  const renderSvg = () => {
    if (!qr) {
      return (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center text-xs text-zinc-400"
        >
          Conteúdo excede a capacidade máxima do QR Code.
        </div>
      );
    }

    const totalUnits = qr.size + quietZone * 2;
    const iconUnits = icon ? (resolvedIconPx / size) * totalUnits : 0;
    const centerCoord = totalUnits / 2;
    const excavateHalf = icon ? iconUnits / 2 + 0.65 : 0;

    return (
      <div style={{ width: size, height: size }} className="relative select-none">
        <svg
          ref={svgRef}
          id={`qr-${uid}`}
          width={size}
          height={size}
          viewBox={`0 0 ${totalUnits} ${totalUnits}`}
          shapeRendering={moduleStyle === "squares" ? "crispEdges" : "geometricPrecision"}
          role="img"
          aria-label={typeof title === "string" ? title : "QR Code"}
          className="block rounded-lg"
        >
          <rect width={totalUnits} height={totalUnits} fill={bgColor} />
          {qr.modules.map((row, r) =>
            row.map((dark, c) => {
              if (!dark) return null;
              const x = c + quietZone;
              const y = r + quietZone;

              // Excavate clean quiet-zone square behind center logo
              if (
                icon &&
                Math.abs(x + 0.5 - centerCoord) < excavateHalf &&
                Math.abs(y + 0.5 - centerCoord) < excavateHalf
              ) {
                return null;
              }

              if (moduleStyle === "dots") {
                const isFinder =
                  (r < 7 && c < 7) ||
                  (r < 7 && c >= qr.size - 7) ||
                  (r >= qr.size - 7 && c < 7);
                if (!isFinder) {
                  return (
                    <circle
                      key={`${r}-${c}`}
                      cx={x + 0.5}
                      cy={y + 0.5}
                      r={0.43}
                      fill={color}
                    />
                  );
                }
              }

              if (moduleStyle === "rounded") {
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={x + 0.04}
                    y={y + 0.04}
                    width={0.92}
                    height={0.92}
                    rx={0.28}
                    fill={color}
                  />
                );
              }

              return <rect key={`${r}-${c}`} x={x} y={y} width={1} height={1} fill={color} />;
            })
          )}
        </svg>

        {/* Center Logo / Icon Overlay */}
        {icon && (
          <div
            style={{ width: resolvedIconPx, height: resolvedIconPx }}
            className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-xs ring-1 ring-black/5"
          >
            {typeof icon === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              icon
            )}
          </div>
        )}

        {/* Ant Design Status Overlays */}
        {status !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/92 dark:bg-zinc-950/90 p-3 text-center backdrop-blur-[2px]">
            {status === "loading" && (
              <Loader2 size={26} className="animate-spin text-primary" />
            )}

            {status === "expired" && (
              <>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  {expiredText}
                </span>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>{refreshLabel}</span>
                  </button>
                )}
              </>
            )}

            {status === "scanned" && (
              <div className="flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={26} />
                <span className="text-xs font-semibold">{scannedText}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const hasToolbar = copyable || downloadable || printable;

  return (
    <div
      data-component-id={componentId}
      className={twMerge(
        "inline-flex flex-col items-center gap-2.5",
        bordered &&
          "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-2xs",
        className
      )}
    >
      {title && (
        <div className="text-center text-xs font-bold text-zinc-800 dark:text-zinc-100">
          {title}
        </div>
      )}

      {renderSvg()}

      {caption && (
        <div className="max-w-[200px] truncate text-center text-[11px] text-zinc-500 dark:text-zinc-400">
          {caption}
        </div>
      )}

      {hasToolbar && (
        <div className="flex items-center gap-1.5 pt-0.5">
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copiar código"
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>
          )}
          {downloadable && (
            <button
              type="button"
              onClick={handleDownloadPng}
              title="Baixar PNG"
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <Download size={12} />
              <span>PNG</span>
            </button>
          )}
          {printable && (
            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir etiqueta QR"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1 text-zinc-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <Printer size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
