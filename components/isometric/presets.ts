/**
 * Biblioteca de objetos isométricos prontos (Prefabs / Presets) para `lopes-ui/isometric`.
 * Cada preset retorna `{ parts, pose, partIds }` para compor cenas em segundos.
 */
import { BOUNCY, BZ, sinkTo, type Group, type PartDef, type PartTone } from "./scene";

export interface PresetBaseOptions {
  /** Prefixo único dos IDs das peças na cena */
  id: string;
  /** Posição X base na bancada */
  x?: number;
  /** Posição Y base na bancada */
  y?: number;
  /** Altura Z base (default: BZ) */
  z?: number;
  /** Cor/material principal de destaque (default: "brand") */
  tone?: PartTone;
  /** Rótulo 3D impresso no topo do objeto */
  label?: string;
  /** Rótulo acessível para interação via teclado/leitor de tela */
  ariaLabel?: string;
}

export interface IsometricPreset<TState = Record<string, never>> {
  id: string;
  parts: PartDef[];
  partIds: string[];
  pose: (state?: TState) => Group;
}

/** Junta `parts` de múltiplos presets em uma única lista pronta para `makeScene`. */
export function combinePresets(...presets: Array<{ parts: PartDef[] }>): PartDef[] {
  return presets.flatMap((p) => p.parts);
}

/* ── 1. Terminal PDV / Console ────────────────────────────────────────────── */

export function createTerminalPreset(
  opts: PresetBaseOptions,
): IsometricPreset<{ typed?: boolean; delay?: number }> {
  const { id, x = 150, y = 36, z = BZ, tone = "brand", label, ariaLabel = "Terminal PDV" } = opts;
  const lineWidths = [46, 32, 54, 24, 38];

  const parts: PartDef[] = [
    { id: `${id}-body`, kind: "slab", tone: "ink", r: 8, bevel: 1.2, ariaLabel, enter: () => ({ h: 0 }) },
    { id: `${id}-screen`, kind: "slab", tone: "screen", r: 3, steps: 4, label, labelSize: 10, enter: sinkTo(z) },
    { id: `${id}-slot`, kind: "slab", tone: "mid", r: 2, steps: 3, bevel: 0.5, enter: sinkTo(z) },
    {
      id: `${id}-card`,
      kind: "slab",
      tone,
      r: 2,
      steps: 3,
      bevel: 0.6,
      hatch: true,
      ariaLabel,
      enter: (p) => ({ z: p.z + 44 }),
    },
    ...lineWidths.map(
      (_, k): PartDef => ({
        id: `${id}-ln${k}`,
        kind: "slab",
        tone: k === 4 ? "ok" : k % 2 ? "mid" : tone,
        r: 0.8,
        steps: 2,
        enter: () => ({ w: 0 }),
        bias: 2,
      }),
    ),
    { id: `${id}-cursor`, kind: "slab", tone: "ok", r: 0.5, steps: 2, blink: true, enter: () => ({ w: 0 }), bias: 2 },
  ];

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ typed = true, delay = 0 } = {}) => {
      const g: Group = {
        [`${id}-body`]: { x, y, w: 120, d: 98, z, h: 24, delay },
        [`${id}-screen`]: { x: x + 10, y: y + 10, w: 74, d: 78, z: z + 24, h: 1.2, delay: delay + 70 },
        [`${id}-slot`]: { x: x + 94, y: y + 14, w: 20, d: 44, z: z + 24, h: 3, delay: delay + 70 },
        [`${id}-card`]: { x: x + 98, y: y + 22, w: 12, d: 28, z: z + 27, h: 16, delay: delay + (typed ? 0 : 220) },
      };
      lineWidths.forEach((w, k) => {
        g[`${id}-ln${k}`] = {
          x: x + 17,
          y: y + 19 + k * 14,
          w,
          d: 5,
          z: z + 25.2,
          h: 0.9,
          delay: delay + (typed ? 0 : 420 + k * 95),
        };
      });
      g[`${id}-cursor`] = {
        x: x + 17 + lineWidths[4]! + 4,
        y: y + 19 + 4 * 14,
        w: 3,
        d: 5,
        z: z + 25.2,
        h: 0.9,
        delay: delay + (typed ? 0 : 900),
      };
      return g;
    },
  };
}

/* ── 2. Servidor / Rack (Cloud / SEFAZ) ───────────────────────────────────── */

export function createServerRackPreset(
  opts: PresetBaseOptions,
): IsometricPreset<{ active?: boolean; delay?: number }> {
  const { id, x = 30, y = 32, z = BZ, tone = "mid", label = "SRV", ariaLabel = "Servidor" } = opts;

  const parts: PartDef[] = [
    {
      id: `${id}-chassis`,
      kind: "slab",
      tone,
      r: 6,
      bevel: 1.2,
      label,
      labelSize: 9,
      dots: { cols: 4, rows: 1, gap: 11, glow: true },
      ariaLabel,
      enter: () => ({ h: 0 }),
    },
    ...[0, 1, 2, 3].map(
      (k): PartDef => ({
        id: `${id}-lamp${k}`,
        kind: "cyl",
        tone: "base",
        steps: 24,
        bevel: 0.5,
        knurl: 14,
        glow: true,
        ariaLabel,
        enter: sinkTo(z),
      }),
    ),
  ];

  const lampOffsets: Array<[number, number]> = [
    [20, 20],
    [56, 20],
    [20, 56],
    [56, 56],
  ];

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ active = true, delay = 0 } = {}) => {
      const g: Group = {
        [`${id}-chassis`]: { x, y, w: 76, d: 76, z, h: 54, delay },
      };
      lampOffsets.forEach(([ox, oy], k) => {
        g[`${id}-lamp${k}`] = {
          x: x + ox - 8,
          y: y + oy - 8,
          w: 16,
          d: 16,
          z: z + 54,
          h: 5,
          g: active ? 1 : 0,
          delays: { g: delay + 360 + k * 140 },
        };
      });
      return g;
    },
  };
}

/* ── 3. Palete de Estoque / Expedição (Kardex / CD) ───────────────────────── */

export function createPalletBoxesPreset(
  opts: PresetBaseOptions,
): IsometricPreset<{ dispatched?: boolean; delay?: number }> {
  const { id, x = 24, y = 26, z = BZ, tone = "brand", label = "CD", ariaLabel = "Palete de Estoque" } = opts;

  const boxes = [
    { k: 0, ox: 8, oy: 8, oz: 7, h: 20, t: "mid" as PartTone },
    { k: 1, ox: 40, oy: 8, oz: 7, h: 20, t: "mid" as PartTone },
    { k: 2, ox: 8, oy: 40, oz: 7, h: 20, t: "mid" as PartTone },
    { k: 3, ox: 40, oy: 40, oz: 7, h: 20, t: "mid" as PartTone },
    { k: 4, ox: 8, oy: 8, oz: 28, h: 18, t: "warn" as PartTone },
    { k: 5, ox: 40, oy: 40, oz: 28, h: 18, t: tone },
  ];

  const parts: PartDef[] = [
    { id: `${id}-pallet`, kind: "slab", tone: "base", r: 4, bevel: 0.8, ariaLabel, enter: () => ({ h: 0 }) },
    ...boxes.map(
      (b): PartDef => ({
        id: `${id}-box${b.k}`,
        kind: "slab",
        tone: b.t,
        r: 2,
        steps: 3,
        bevel: 0.6,
        hatch: b.k === 5,
        label: b.k === 5 ? label : undefined,
        labelSize: 7.5,
        ariaLabel,
        enter: (p) => ({ z: p.z + 32 }),
      }),
    ),
  ];

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ dispatched = true, delay = 0 } = {}) => {
      const g: Group = {
        [`${id}-pallet`]: { x, y, w: 74, d: 74, z, h: 7, delay },
      };
      boxes.forEach((b, idx) => {
        g[`${id}-box${b.k}`] = {
          x: x + b.ox,
          y: y + b.oy,
          w: 26,
          d: 26,
          z: z + b.oz + (b.k === 5 && dispatched ? 22 : 0),
          h: b.h,
          delay: delay + (b.k === 5 && dispatched ? 360 : 60 + idx * 45),
        };
      });
      return g;
    },
  };
}

/* ── 4. Banco de Dados 3D (3 discos empilhados) ───────────────────────────── */

export function createDatabasePreset(
  opts: PresetBaseOptions,
): IsometricPreset<{ active?: boolean; delay?: number }> {
  const { id, x = 44, y = 44, z = BZ, tone = "brand", label = "DB", ariaLabel = "Banco de Dados" } = opts;

  const parts: PartDef[] = [
    ...[0, 1, 2].map(
      (k): PartDef => ({
        id: `${id}-disk${k}`,
        kind: "cyl",
        tone: k === 2 ? tone : "mid",
        steps: 36,
        bevel: 0.8,
        knurl: 24,
        hatch: k === 1,
        label: k === 2 ? label : undefined,
        labelSize: 10,
        ariaLabel,
        enter: (p) => ({ z: p.z + 40 }),
      }),
    ),
    { id: `${id}-led`, kind: "cyl", tone: "ok", steps: 20, bevel: 0.3, glow: true, enter: sinkTo(z) },
  ];

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ active = true, delay = 0 } = {}) => ({
      [`${id}-disk0`]: { x, y, w: 58, d: 58, z, h: 14, delay },
      [`${id}-disk1`]: { x, y, w: 58, d: 58, z: z + 16, h: 14, delay: delay + 90 },
      [`${id}-disk2`]: { x, y, w: 58, d: 58, z: z + 32, h: 14, delay: delay + 180 },
      [`${id}-led`]: { x: x + 44, y: y + 44, w: 10, d: 10, z: z + 46, h: 3, g: active ? 1 : 0, delay: delay + 280 },
    }),
  };
}

/* ── 5. Pilha de Moedas / Financeiro ──────────────────────────────────────── */

export function createCoinStackPreset(
  opts: PresetBaseOptions & { count?: number },
): IsometricPreset<{ count?: number; delay?: number }> {
  const {
    id,
    x = 46,
    y = 46,
    z = BZ,
    tone = "brand",
    label = "R$",
    ariaLabel = "Pilha Financeira",
    count: maxCount = 5,
  } = opts;

  const parts: PartDef[] = Array.from({ length: maxCount }, (_, k) => ({
    id: `${id}-coin${k}`,
    kind: "cyl",
    tone: k === maxCount - 1 ? "ok" : tone,
    steps: 40,
    bevel: 0.8,
    knurl: 28,
    hatch: k % 2 === 1,
    label: k === maxCount - 1 ? label : undefined,
    labelSize: 11,
    ariaLabel,
    spring: BOUNCY,
    enter: (p) => ({ z: p.z + 80 }),
  }));

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ count = maxCount, delay = 0 } = {}) => {
      const g: Group = {};
      const n = Math.max(0, Math.min(maxCount, count));
      for (let k = 0; k < n; k++) {
        g[`${id}-coin${k}`] = {
          x,
          y,
          w: 46,
          d: 46,
          z: z + k * 7,
          h: 6.2,
          delay: delay + 80 + k * 105,
        };
      }
      return g;
    },
  };
}

/* ── 6. Placa / Certificado / DRE ─────────────────────────────────────────── */

export function createCertificatePreset(
  opts: PresetBaseOptions,
): IsometricPreset<{ sealed?: boolean; delay?: number }> {
  const { id, x = 160, y = 66, z = BZ, tone = "brand", ariaLabel = "Certificado / DRE" } = opts;

  const parts: PartDef[] = [
    { id: `${id}-stand`, kind: "slab", tone: "base", r: 4, bevel: 0.8, ariaLabel, enter: () => ({ h: 0 }) },
    {
      id: `${id}-plate`,
      kind: "slab",
      tone,
      r: 1.2,
      steps: 3,
      bevel: 0.6,
      hatch: true,
      ariaLabel,
      enter: (p) => ({ h: 0, z: p.z }),
    },
    {
      id: `${id}-seal`,
      kind: "cyl",
      tone: "ok",
      steps: 28,
      bevel: 0.5,
      knurl: 16,
      spring: BOUNCY,
      ariaLabel,
      enter: (p) => ({ z: p.z + 40 }),
    },
  ];

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ sealed = true, delay = 0 } = {}) => {
      const g: Group = {
        [`${id}-stand`]: { x, y, w: 98, d: 36, z, h: 8, delay },
        [`${id}-plate`]: { x: x + 10, y: y + 14, w: 78, d: 5, z: z + 8, h: 68, delay: delay + 140 },
      };
      if (sealed) {
        g[`${id}-seal`] = { x: x + 76, y: y + 20, w: 14, d: 14, z: z + 8, h: 4.5, delay: delay + 520 };
      }
      return g;
    },
  };
}

/* ── 7. Maquininha PIX / Cartão ───────────────────────────────────────────── */

export function createCardReaderPreset(
  opts: PresetBaseOptions,
): IsometricPreset<{ approved?: boolean; delay?: number }> {
  const { id, x = 90, y = 46, z = BZ, tone = "brand", label = "PIX", ariaLabel = "Terminal de Pagamento" } = opts;

  const parts: PartDef[] = [
    { id: `${id}-body`, kind: "slab", tone: "ink", r: 6, bevel: 1, ariaLabel, enter: () => ({ h: 0 }) },
    { id: `${id}-screen`, kind: "slab", tone: "screen", r: 2.5, steps: 4, label, labelSize: 8.5, enter: sinkTo(z) },
    {
      id: `${id}-keypad`,
      kind: "slab",
      tone: "mid",
      r: 2,
      steps: 3,
      dots: { cols: 3, rows: 3, gap: 9 },
      enter: sinkTo(z),
    },
    {
      id: `${id}-chip`,
      kind: "slab",
      tone,
      r: 2,
      steps: 3,
      bevel: 0.5,
      hatch: true,
      enter: (p) => ({ y: p.y - 26 }),
    },
    { id: `${id}-led`, kind: "cyl", tone: "ok", steps: 20, glow: true, enter: sinkTo(z) },
  ];

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ approved = true, delay = 0 } = {}) => ({
      [`${id}-body`]: { x, y, w: 58, d: 92, z, h: 16, delay },
      [`${id}-screen`]: { x: x + 8, y: y + 10, w: 42, d: 30, z: z + 16, h: 1.2, delay: delay + 80 },
      [`${id}-keypad`]: { x: x + 8, y: y + 46, w: 42, d: 36, z: z + 16, h: 1.8, delay: delay + 140 },
      [`${id}-chip`]: { x: x + 13, y: y - 16, w: 32, d: 24, z: z + 6, h: 2.2, delay: delay + 260 },
      [`${id}-led`]: { x: x + 44, y: y + 4, w: 7, d: 7, z: z + 16, h: 2, g: approved ? 1 : 0, delay: delay + 380 },
    }),
  };
}

/* ── 8. Caminhão de Entrega / Logística ───────────────────────────────────── */

export function createTruckPreset(
  opts: PresetBaseOptions,
): IsometricPreset<{ moving?: boolean; delay?: number }> {
  const { id, x = 66, y = 64, z = BZ, tone = "brand", label = "ROTA", ariaLabel = "Caminhão de Entrega" } = opts;

  const parts: PartDef[] = [
    { id: `${id}-chassis`, kind: "slab", tone: "ink", r: 3, bevel: 0.6, ariaLabel, enter: () => ({ h: 0 }) },
    {
      id: `${id}-cargo`,
      kind: "slab",
      tone,
      r: 3,
      steps: 4,
      bevel: 0.9,
      hatch: true,
      label,
      labelSize: 11,
      ariaLabel,
      enter: (p) => ({ z: p.z + 26 }),
    },
    { id: `${id}-cab`, kind: "slab", tone: "base", r: 4, steps: 4, bevel: 0.8, ariaLabel, enter: () => ({ h: 0 }) },
    { id: `${id}-windshield`, kind: "slab", tone: "screen", r: 1.5, steps: 3, enter: sinkTo(z) },
    { id: `${id}-beacon`, kind: "cyl", tone: "ok", steps: 20, glow: true, enter: sinkTo(z) },
  ];

  return {
    id,
    parts,
    partIds: parts.map((p) => p.id),
    pose: ({ moving = false, delay = 0 } = {}) => {
      const dx = moving ? 26 : 0;
      return {
        [`${id}-chassis`]: { x: x + dx, y, w: 138, d: 54, z, h: 7, delay },
        [`${id}-cargo`]: { x: x + dx, y: y + 2, w: 92, d: 50, z: z + 7, h: 42, delay: delay + 90 },
        [`${id}-cab`]: { x: x + dx + 96, y: y + 4, w: 40, d: 46, z: z + 7, h: 30, delay: delay + 140 },
        [`${id}-windshield`]: { x: x + dx + 124, y: y + 9, w: 13, d: 36, z: z + 23, h: 11, delay: delay + 200 },
        [`${id}-beacon`]: { x: x + dx + 106, y: y + 22, w: 10, d: 10, z: z + 37, h: 4, g: 1, delay: delay + 320 },
      };
    },
  };
}
