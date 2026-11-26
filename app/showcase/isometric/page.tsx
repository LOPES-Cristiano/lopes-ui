"use client";

import React, { useMemo, useState } from "react";
import { DemoCard, HR, PropsTable, SectionHeader } from "@/app/showcase/_shared";
import CodeBlock from "@/components/CodeBlock";
import {
  BOUNCY,
  BZ,
  IsometricBench,
  IsometricShowcase,
  LIVE_FIT,
  SOFT,
  StaticSolid,
  coil,
  combinePresets,
  createCardReaderPreset,
  createCertificatePreset,
  createCoinStackPreset,
  createDatabasePreset,
  createPalletBoxesPreset,
  createServerRackPreset,
  createTerminalPreset,
  createTruckPreset,
  cylinder,
  dotGrid,
  iso,
  knurl,
  makeScene,
  ring,
  sinkTo,
  slabOf,
  type Group,
  type IsometricShowcaseStep,
  type PartDef,
  type PartTone,
  type Projection,
} from "@/components/isometric";

/* ═══════════════════════════════════════════════════════════════════════════
   1. Cena do Demo 1 — IsometricShowcase (4 etapas clicáveis)
   ═══════════════════════════════════════════════════════════════════════════ */

const DEMO_PARTS: PartDef[] = [
  { id: "terminal", kind: "slab", tone: "ink", r: 8, bevel: 1.2, ariaLabel: "Terminal PDV", enter: () => ({ h: 0 }) },
  { id: "screen", kind: "slab", tone: "screen", r: 3, steps: 4, label: "PDV", labelSize: 12, enter: sinkTo(BZ) },
  { id: "pedido", kind: "slab", tone: "brand", r: 2, steps: 3, bevel: 0.6, hatch: true, ariaLabel: "Pedido #4821", enter: (p) => ({ z: p.z + 44 }) },
  { id: "palete", kind: "slab", tone: "base", r: 4, bevel: 0.8, ariaLabel: "Palete Estoque", enter: () => ({ h: 0 }) },
  { id: "cx0", kind: "slab", tone: "mid", r: 2, steps: 3, bevel: 0.6, enter: (p) => ({ z: p.z + 32 }) },
  { id: "cx1", kind: "slab", tone: "brand", r: 2, steps: 3, bevel: 0.6, hatch: true, label: "CD", labelSize: 8, enter: (p) => ({ z: p.z + 32 }) },
  { id: "cx2", kind: "slab", tone: "warn", r: 2, steps: 3, bevel: 0.6, ariaLabel: "Reserva CD Manaus", enter: (p) => ({ z: p.z + 32 }) },
  { id: "sefaz", kind: "slab", tone: "mid", r: 6, bevel: 1.1, label: "SEFAZ", labelSize: 9, dots: { cols: 3, rows: 1, gap: 12, glow: true }, ariaLabel: "Módulo Fiscal SEFAZ", enter: () => ({ h: 0 }) },
  { id: "lamp0", kind: "cyl", tone: "ok", steps: 28, bevel: 0.5, glow: true, knurl: 16, enter: sinkTo(BZ) },
  { id: "lamp1", kind: "cyl", tone: "ok", steps: 28, bevel: 0.5, glow: true, knurl: 16, enter: sinkTo(BZ) },
  { id: "coin0", kind: "cyl", tone: "brand", steps: 40, bevel: 0.8, knurl: 24, spring: BOUNCY, enter: (p) => ({ z: p.z + 80 }) },
  { id: "coin1", kind: "cyl", tone: "brand", steps: 40, bevel: 0.8, knurl: 24, hatch: true, spring: BOUNCY, enter: (p) => ({ z: p.z + 80 }) },
  { id: "coin2", kind: "cyl", tone: "ok", steps: 40, bevel: 0.8, knurl: 24, label: "R$", labelSize: 11, spring: BOUNCY, ariaLabel: "Caixa conciliado", enter: (p) => ({ z: p.z + 80 }) },
];

const STEPS: readonly IsometricShowcaseStep[] = [
  {
    id: "pdv",
    tag: "Vendas",
    title: "Pedido registrado no PDV",
    caption: "Clique nas peças 3D ou nas etapas abaixo — as molas reajustam sem perder a velocidade atual.",
  },
  {
    id: "cd",
    tag: "Estoque",
    title: "Separação e expedição no CD",
    caption: "Caixas com tons semânticos (mid, brand, warn) demonstrando reserva e despacho em tempo real.",
  },
  {
    id: "fiscal",
    tag: "Fiscal",
    title: "Validação e autorização via cabo animado",
    caption: "Pacotes fluem pelo cabo isométrico enquanto os indicadores acendem com glow em var(--success).",
  },
  {
    id: "caixa",
    tag: "Financeiro",
    title: "Conciliação com física BOUNCY",
    caption: "Fichas caem com rigidez/amortecimento configuráveis e respeitam prefers-reduced-motion.",
  },
];

function createDemoScene() {
  const terminal: Group = {
    terminal: { x: 154, y: 40, w: 118, d: 96, z: BZ, h: 24 },
    screen: { x: 164, y: 50, w: 72, d: 76, z: BZ + 24, h: 1.2, delay: 70 },
    pedido: { x: 246, y: 58, w: 14, d: 28, z: BZ + 26, h: 16, delay: 220 },
  };
  const estoque: Group = {
    palete: { x: 24, y: 32, w: 78, d: 78, z: BZ, h: 7 },
    cx0: { x: 32, y: 40, w: 28, d: 28, z: BZ + 7, h: 20, delay: 80 },
    cx1: { x: 66, y: 40, w: 28, d: 28, z: BZ + 7, h: 20, delay: 140 },
    cx2: { x: 48, y: 68, w: 28, d: 28, z: BZ + 27, h: 18, delay: 260 },
  };
  const fiscal: Group = {
    sefaz: { x: 30, y: 34, w: 76, d: 76, z: BZ, h: 52 },
    lamp0: { x: 46, y: 56, w: 18, d: 18, z: BZ + 52, h: 5, g: 1, delays: { g: 480 } },
    lamp1: { x: 74, y: 56, w: 18, d: 18, z: BZ + 52, h: 5, g: 1, delays: { g: 720 } },
  };
  const financeiro: Group = {
    coin0: { x: 52, y: 52, w: 46, d: 46, z: BZ, h: 7, delay: 80 },
    coin1: { x: 52, y: 52, w: 46, d: 46, z: BZ + 8, h: 7, delay: 200 },
    coin2: { x: 52, y: 52, w: 46, d: 46, z: BZ + 16, h: 7, delay: 320 },
  };

  return makeScene({
    parts: DEMO_PARTS,
    poses: [
      { ...terminal },
      { ...terminal, ...estoque },
      { ...terminal, ...fiscal },
      { ...financeiro },
    ],
    wires: [
      {
        id: "w-cd",
        points: [
          [154, 110, BZ + 0.6],
          [126, 110, BZ + 0.6],
          [126, 78, BZ + 0.6],
          [106, 78, BZ + 0.6],
        ],
        steps: [1],
        tone: "brand",
      },
      {
        id: "w-fiscal",
        points: [
          [154, 110, BZ + 0.6],
          [126, 110, BZ + 0.6],
          [126, 78, BZ + 0.6],
          [106, 78, BZ + 0.6],
        ],
        steps: [2],
        tone: "ok",
      },
    ],
    callouts: [
      { id: "c0", part: "pedido", text: "Pedido #4821", tone: "brand", steps: [0] },
      { id: "c1", part: "cx2", text: "Reserva CD Manaus", tone: "warn", steps: [1] },
      { id: "c2", part: "lamp1", text: "NF-e autorizada", tone: "ok", steps: [2], stem: 28 },
      { id: "c3", part: "coin2", text: "Caixa conciliado", tone: "ok", steps: [3] },
    ],
  });
}

const PART_TO_STEP: Record<string, number> = {
  terminal: 0,
  screen: 0,
  pedido: 0,
  palete: 1,
  cx0: 1,
  cx1: 1,
  cx2: 1,
  sefaz: 2,
  lamp0: 2,
  lamp1: 2,
  coin0: 3,
  coin1: 3,
  coin2: 3,
};

/* ═══════════════════════════════════════════════════════════════════════════
   2. Cena do Demo 2 — Simulador Vivo (IsometricBench reativo a estado)
   ═══════════════════════════════════════════════════════════════════════════ */

function createLiveSimScene(opts: {
  stackCount: number;
  wireActive: boolean;
  lampsOn: boolean;
  bouncy: boolean;
}) {
  const spring = opts.bouncy ? BOUNCY : SOFT;
  const parts: PartDef[] = [
    { id: "origem", kind: "slab", tone: "ink", r: 6, bevel: 1.1, enter: () => ({ h: 0 }) },
    { id: "destino", kind: "slab", tone: "mid", r: 6, bevel: 1.1, enter: () => ({ h: 0 }) },
    ...[0, 1, 2, 3].map(
      (i): PartDef => ({
        id: `blk${i}`,
        kind: "slab",
        tone: i === 3 ? "ok" : i % 2 === 0 ? "brand" : "warn",
        r: 2,
        steps: 3,
        bevel: 0.6,
        hatch: i % 2 === 1,
        spring,
        enter: (p) => ({ z: p.z + 65 }),
      }),
    ),
    ...[0, 1].map(
      (i): PartDef => ({
        id: `led${i}`,
        kind: "cyl",
        tone: "base",
        steps: 24,
        bevel: 0.5,
        glow: true,
        enter: sinkTo(BZ),
      }),
    ),
  ];

  const pose: Group = {
    origem: { x: 26, y: 54, w: 86, d: 96, z: BZ, h: 18 },
    destino: { x: 182, y: 46, w: 92, d: 108, z: BZ, h: 40 },
    led0: { x: 198, y: 66, w: 18, d: 18, z: BZ + 40, h: 5, g: opts.lampsOn ? 1 : 0 },
    led1: { x: 234, y: 66, w: 18, d: 18, z: BZ + 40, h: 5, g: opts.lampsOn ? 1 : 0 },
  };

  for (let i = 0; i < opts.stackCount; i++) {
    pose[`blk${i}`] = {
      x: 42,
      y: 74,
      w: 54,
      d: 54,
      z: BZ + 18 + i * 15,
      h: 13,
      delay: i * 45,
    };
  }

  return makeScene({
    parts,
    poses: [pose],
    fit: LIVE_FIT,
    wire: [
      [112, 102, BZ + 0.6],
      [148, 102, BZ + 0.6],
      [148, 102, BZ + 0.6],
      [182, 102, BZ + 0.6],
    ],
    wireSteps: opts.wireActive ? [0] : [],
    callouts: [
      {
        id: "sim-stack",
        part: opts.stackCount > 0 ? `blk${opts.stackCount - 1}` : "origem",
        text: `${opts.stackCount} volume${opts.stackCount === 1 ? "" : "s"} na pilha`,
        tone: "brand",
        steps: [0],
        stem: 22,
      },
      {
        id: "sim-dest",
        part: "led0",
        text: opts.lampsOn ? "Online · 200 OK" : "Em espera",
        tone: opts.lampsOn ? "ok" : "ink",
        steps: [0],
        stem: 24,
      },
    ],
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. Cena do Demo 3 — Galeria dos 8 Materiais (data-c)
   ═══════════════════════════════════════════════════════════════════════════ */

const ALL_TONES: ReadonlyArray<{ tone: PartTone; label: string }> = [
  { tone: "base", label: "base" },
  { tone: "mid", label: "mid" },
  { tone: "ink", label: "ink" },
  { tone: "screen", label: "screen" },
  { tone: "brand", label: "brand" },
  { tone: "ok", label: "ok" },
  { tone: "warn", label: "warn" },
  { tone: "danger", label: "danger" },
];

function createMaterialsScene(useHatch: boolean, useBevel: boolean) {
  const parts: PartDef[] = ALL_TONES.map((item, idx) => ({
    id: `mat-${item.tone}`,
    kind: idx % 2 === 0 ? "slab" : "cyl",
    tone: item.tone,
    r: 3,
    steps: idx % 2 === 0 ? 6 : 32,
    bevel: useBevel ? 0.9 : 0,
    hatch: useHatch && idx >= 4,
    enter: () => ({ h: 0 }),
  }));

  const pose: Group = {};
  ALL_TONES.forEach((item, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    pose[`mat-${item.tone}`] = {
      x: 24 + col * 66,
      y: 34 + row * 82,
      w: 44,
      d: 44,
      z: BZ,
      h: 26 + (col % 2) * 10,
      delay: idx * 40,
    };
  });

  return makeScene({
    parts,
    poses: [pose],
    callouts: [
      { id: "m-brand", part: "mat-brand", text: "brand", tone: "brand", steps: [0], stem: 18 },
      { id: "m-ok", part: "mat-ok", text: "ok", tone: "ok", steps: [0], stem: 18 },
      { id: "m-warn", part: "mat-warn", text: "warn", tone: "warn", steps: [0], stem: 18 },
      { id: "m-danger", part: "mat-danger", text: "danger", tone: "danger", steps: [0], stem: 18 },
    ],
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. Demo 4 — Primitivas Puras do iso-kit + Câmera 3D ao Vivo
   ═══════════════════════════════════════════════════════════════════════════ */

function IsoKitCameraPlayground() {
  const [azimuth, setAzimuth] = useState(45);
  const [elevation, setElevation] = useState(30);

  const svgData = useMemo(() => {
    const proj: Projection = { origin: [230, 145], scale: 1.45, azimuth, elevation };
    const base = slabOf({ x: -70, y: -55, w: 140, d: 110, r: 8 }, 0, 12, proj, 8, 1.2);
    const dial = cylinder(-28, -10, 22, 12, 26, proj, 32, 0.8);
    const dialKnurl = knurl(-28, -10, 22, 13, 37, 24, proj, 1);
    const dialRing = ring(-28, -10, 14, 38, proj, 28);
    const block = slabOf({ x: 12, y: -34, w: 44, d: 44, r: 4 }, 12, 34, proj, 6, 0.9);
    const dots = dotGrid(20, -26, 4, 4, 9, 46, proj);
    const springCoil = coil(-40, 28, [22, 28], 8, 5, "x", proj, 16);
    const originDot = iso([0, 0, 12], proj);
    return { base, dial, dialKnurl, dialRing, block, dots, springCoil, originDot };
  }, [azimuth, elevation]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center justify-between font-medium text-foreground">
            <span>Azimute (rotação horizontal)</span>
            <code className="font-mono text-brand">{azimuth}°</code>
          </span>
          <input
            type="range"
            min={15}
            max={75}
            value={azimuth}
            onChange={(e) => setAzimuth(Number(e.target.value))}
            className="accent-[var(--brand)] cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center justify-between font-medium text-foreground">
            <span>Elevação (inclinação da câmera)</span>
            <code className="font-mono text-brand">{elevation}°</code>
          </span>
          <input
            type="range"
            min={15}
            max={55}
            value={elevation}
            onChange={(e) => setElevation(Number(e.target.value))}
            className="accent-[var(--brand)] cursor-pointer"
          />
        </label>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-border bg-surface-muted/40 p-4">
        <div className="isx max-w-[460px]" style={{ aspectRatio: "460 / 270" }}>
          <svg
            className="isx-svg"
            viewBox="0 0 460 270"
            role="img"
            aria-label={`Primitivas geométricas iso-kit em azimute ${azimuth} graus e elevação ${elevation} graus`}
          >
            <StaticSolid paths={svgData.base} tone="base" />
            <StaticSolid paths={svgData.dial} tone="brand" />
            <path className="isx-ln isx-faint" d={svgData.dialKnurl} />
            <path className="isx-ln isx-mid" d={svgData.dialRing} />
            <StaticSolid paths={svgData.block} tone="ink" />
            {svgData.dots.map(([cx, cy], idx) => (
              <circle key={idx} cx={cx} cy={cy} r={1.6} className="isx-glow" />
            ))}
            <path className="isx-ln isx-faint" d={svgData.springCoil.back} />
            <path className="isx-ln isx-edge" d={svgData.springCoil.front} />
            <circle cx={svgData.originDot[0]} cy={svgData.originDot[1]} r={2} className="isx-screw" />
          </svg>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Primitivas exibidas acima: <code className="font-mono text-foreground">slabOf</code> (base + bloco ink),{" "}
        <code className="font-mono text-foreground">cylinder</code> + <code className="font-mono text-foreground">knurl</code> +{" "}
        <code className="font-mono text-foreground">ring</code> (dial brand),{" "}
        <code className="font-mono text-foreground">dotGrid</code> (matriz de LEDs) e{" "}
        <code className="font-mono text-foreground">coil</code> (mola espiral).
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. Galeria de Objetos Prontos (8 Presets de lopes-ui/isometric)
   ═══════════════════════════════════════════════════════════════════════════ */

type PresetId =
  | "terminal"
  | "server"
  | "pallet"
  | "database"
  | "coins"
  | "certificate"
  | "card-reader"
  | "truck";

const PRESET_CATALOG: ReadonlyArray<{ id: PresetId; name: string; fn: string; snippet: string }> = [
  {
    id: "terminal",
    name: "Terminal PDV",
    fn: "createTerminalPreset",
    snippet: `const pdv = createTerminalPreset({ id: "pdv", x: 90, y: 56, label: "PDV" });`,
  },
  {
    id: "server",
    name: "Servidor / SEFAZ",
    fn: "createServerRackPreset",
    snippet: `const srv = createServerRackPreset({ id: "srv", x: 112, y: 66, label: "SEFAZ" });`,
  },
  {
    id: "pallet",
    name: "Palete de Estoque",
    fn: "createPalletBoxesPreset",
    snippet: `const cd = createPalletBoxesPreset({ id: "cd", x: 112, y: 66, label: "CD" });`,
  },
  {
    id: "database",
    name: "Banco de Dados",
    fn: "createDatabasePreset",
    snippet: `const db = createDatabasePreset({ id: "db", x: 120, y: 74, label: "SQL" });`,
  },
  {
    id: "coins",
    name: "Pilha Financeira",
    fn: "createCoinStackPreset",
    snippet: `const cx = createCoinStackPreset({ id: "cx", x: 126, y: 80, count: 5, label: "R$" });`,
  },
  {
    id: "certificate",
    name: "Certificado / DRE",
    fn: "createCertificatePreset",
    snippet: `const dre = createCertificatePreset({ id: "dre", x: 100, y: 86 });`,
  },
  {
    id: "card-reader",
    name: "Maquininha PIX",
    fn: "createCardReaderPreset",
    snippet: `const pix = createCardReaderPreset({ id: "pix", x: 120, y: 58, label: "PIX" });`,
  },
  {
    id: "truck",
    name: "Caminhão Logística",
    fn: "createTruckPreset",
    snippet: `const rota = createTruckPreset({ id: "rota", x: 80, y: 78, label: "BIGLAR" });`,
  },
];

function createPresetsGalleryScene() {
  const terminal = createTerminalPreset({ id: "p-term", x: 90, y: 56, label: "PDV" });
  const server = createServerRackPreset({ id: "p-srv", x: 112, y: 66, label: "SEFAZ" });
  const pallet = createPalletBoxesPreset({ id: "p-cd", x: 112, y: 66, label: "CD" });
  const db = createDatabasePreset({ id: "p-db", x: 120, y: 74, label: "SQL" });
  const coins = createCoinStackPreset({ id: "p-cx", x: 126, y: 80, count: 5, label: "R$" });
  const cert = createCertificatePreset({ id: "p-dre", x: 100, y: 86 });
  const reader = createCardReaderPreset({ id: "p-pix", x: 120, y: 58, label: "PIX" });
  const truck = createTruckPreset({ id: "p-trk", x: 80, y: 78, label: "BIGLAR" });

  return makeScene({
    parts: combinePresets(terminal, server, pallet, db, coins, cert, reader, truck),
    poses: [
      terminal.pose({ typed: false }),
      server.pose({ active: true }),
      pallet.pose({ dispatched: true }),
      db.pose({ active: true }),
      coins.pose({ count: 5 }),
      cert.pose({ sealed: true }),
      reader.pose({ approved: true }),
      truck.pose({ moving: false }),
    ],
    callouts: [
      { id: "pc0", part: "p-term-card", text: "createTerminalPreset()", tone: "brand", steps: [0] },
      { id: "pc1", part: "p-srv-lamp0", text: "createServerRackPreset()", tone: "ok", steps: [1] },
      { id: "pc2", part: "p-cd-box5", text: "createPalletBoxesPreset()", tone: "brand", steps: [2] },
      { id: "pc3", part: "p-db-disk2", text: "createDatabasePreset()", tone: "brand", steps: [3] },
      { id: "pc4", part: "p-cx-coin4", text: "createCoinStackPreset()", tone: "ok", steps: [4] },
      { id: "pc5", part: "p-dre-plate", text: "createCertificatePreset()", tone: "brand", steps: [5] },
      { id: "pc6", part: "p-pix-screen", text: "createCardReaderPreset()", tone: "ok", steps: [6] },
      { id: "pc7", part: "p-trk-cargo", text: "createTruckPreset()", tone: "brand", steps: [7] },
    ],
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   Página Principal
   ═══════════════════════════════════════════════════════════════════════════ */

const USAGE_SNIPPET = `import { useMemo } from "react";
import {
  IsometricShowcase,
  makeScene,
  BZ,
  BOUNCY,
  type PartDef,
  type IsometricShowcaseStep,
} from "lopes-ui/isometric";

const PARTS: PartDef[] = [
  { id: "terminal", kind: "slab", tone: "ink", r: 8, bevel: 1.2 },
  { id: "pedido", kind: "slab", tone: "brand", r: 2, hatch: true, spring: BOUNCY },
];

const STEPS: IsometricShowcaseStep[] = [
  { id: "pdv", tag: "Vendas", title: "Pedido registrado", caption: "Integração em tempo real." },
];

export function MinhaBancada() {
  const scene = useMemo(
    () =>
      makeScene({
        parts: PARTS,
        poses: [
          {
            terminal: { x: 120, y: 50, w: 100, d: 80, z: BZ, h: 24 },
            pedido: { x: 160, y: 70, w: 20, d: 30, z: BZ + 24, h: 14 },
          },
        ],
        callouts: [{ id: "c1", part: "pedido", text: "Pedido #4821", tone: "brand", steps: [0] }],
      }),
    [],
  );

  return <IsometricShowcase scene={scene} steps={STEPS} />;
}`;

export default function IsometricShowcasePage() {
  const demoScene = useMemo(() => createDemoScene(), []);
  const presetsScene = useMemo(() => createPresetsGalleryScene(), []);
  const [presetIdx, setPresetIdx] = useState(0);
  const [showBench, setShowBench] = useState(true);
  const [tilt, setTilt] = useState(true);
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Estado do Simulador Vivo (Demo 2)
  const [stackCount, setStackCount] = useState(2);
  const [wireActive, setWireActive] = useState(true);
  const [lampsOn, setLampsOn] = useState(true);
  const [bouncy, setBouncy] = useState(false);

  const liveSimScene = useMemo(
    () => createLiveSimScene({ stackCount, wireActive, lampsOn, bouncy }),
    [stackCount, wireActive, lampsOn, bouncy],
  );

  // Estado da Galeria de Materiais (Demo 3)
  const [matHatch, setMatHatch] = useState(true);
  const [matBevel, setMatBevel] = useState(true);

  const materialsScene = useMemo(
    () => createMaterialsScene(matHatch, matBevel),
    [matHatch, matBevel],
  );

  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-background">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20 max-w-5xl">
        <SectionHeader
          label="Subpath Export · lopes-ui/isometric"
          title="Isometric Workbench & Showcase"
          description="Motor vetorial isométrico zero-dependência com física de molas a 240Hz, zero re-renders durante animação, 8 tons de material integrados ao Light/Dark e interação direta nas peças 3D."
        />

        {/* Demo 1: IsometricShowcase */}
        <DemoCard id="isometric-showcase" title="1. IsometricShowcase — Palco Completo (hover-lift 240Hz, tilt 3D, clique e ← / →)">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showBench}
                  onChange={(e) => setShowBench(e.target.checked)}
                  className="accent-[var(--brand)]"
                />
                Bancada (<code className="font-mono">showBench</code>)
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={tilt}
                  onChange={(e) => setTilt(e.target.checked)}
                  className="accent-[var(--brand)]"
                />
                Tilt 3D (<code className="font-mono">tilt</code>)
              </label>
            </div>
            <span className="font-mono text-[11px] text-brand">
              {hoveredPart
                ? `Hover: ${hoveredPart}`
                : lastClicked
                  ? `Última peça clicada: ${lastClicked}`
                  : "Passe o mouse ou clique nas peças 3D"}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/40 p-4 sm:p-6">
            <IsometricShowcase
              scene={demoScene}
              steps={STEPS}
              showBench={showBench}
              tilt={tilt}
              figureClassName="max-w-[460px]"
              ariaLabelPrefix="Demonstração Lopes UI Isometric"
              onPartHover={setHoveredPart}
              onPartClick={(partId, go) => {
                setLastClicked(partId);
                const next = PART_TO_STEP[partId];
                if (next !== undefined) go(next);
              }}
            />
          </div>
        </DemoCard>

        <HR />

        {/* Demo 1.5: Catálogo dos 8 Objetos Prontos (Presets) */}
        <DemoCard id="isometric-presets" title="2. Objetos Prontos (8 Presets composáveis via combinePresets)">
          <div className="mb-4 flex flex-wrap gap-2">
            {PRESET_CATALOG.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPresetIdx(idx)}
                aria-pressed={presetIdx === idx}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  presetIdx === idx
                    ? "border-brand-border bg-brand-soft text-brand-soft-foreground"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center rounded-xl border border-border bg-surface-muted/40 p-4 sm:p-6">
            <IsometricBench
              scene={presetsScene}
              step={presetIdx}
              tilt
              className="max-w-[460px]"
              label={`Objeto pronto: ${PRESET_CATALOG[presetIdx]!.name}`}
            />
          </div>

          <div className="mt-3 rounded-lg border border-border bg-surface-muted/60 px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
            {PRESET_CATALOG[presetIdx]!.snippet}
          </div>
        </DemoCard>

        <HR />

        {/* Demo 2: IsometricBench controlado ao vivo */}
        <DemoCard id="isometric-bench" title="2. IsometricBench — Simulador Reativo (estado vivo + física interruptível)">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStackCount((n) => Math.min(4, n + 1))}
              disabled={stackCount >= 4}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              + Empilhar volume ({stackCount}/4)
            </button>
            <button
              type="button"
              onClick={() => setStackCount((n) => Math.max(0, n - 1))}
              disabled={stackCount <= 0}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              − Retirar volume
            </button>
            <button
              type="button"
              onClick={() => setWireActive((w) => !w)}
              aria-pressed={wireActive}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                wireActive
                  ? "border-brand-border bg-brand-soft text-brand-soft-foreground"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
              }`}
            >
              Cabo: {wireActive ? "Transmitindo" : "Desligado"}
            </button>
            <button
              type="button"
              onClick={() => setLampsOn((l) => !l)}
              aria-pressed={lampsOn}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                lampsOn
                  ? "border-success-border bg-success-soft text-success-soft-foreground"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
              }`}
            >
              LEDs: {lampsOn ? "Acesos" : "Apagados"}
            </button>
            <button
              type="button"
              onClick={() => setBouncy((b) => !b)}
              aria-pressed={bouncy}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Mola: {bouncy ? "BOUNCY" : "SOFT"}
            </button>
          </div>

          <div className="flex items-center justify-center rounded-xl border border-border bg-surface-muted/40 p-4 sm:p-6">
            <IsometricBench
              scene={liveSimScene}
              step={0}
              className="max-w-[460px]"
              label={`Simulador ao vivo com ${stackCount} volumes empilhados`}
            />
          </div>
        </DemoCard>

        <HR />

        {/* Demo 3: Paleta dos 8 Materiais */}
        <DemoCard id="isometric-materials" title="3. Materiais Semânticos (8 tons data-c: Light & Dark automáticos)">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={matHatch}
                onChange={(e) => setMatHatch(e.target.checked)}
                className="accent-[var(--brand)]"
              />
              Hachura diagonal (<code className="font-mono">hatch</code>)
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={matBevel}
                onChange={(e) => setMatBevel(e.target.checked)}
                className="accent-[var(--brand)]"
              />
              Chanfro superior (<code className="font-mono">bevel</code>)
            </label>
          </div>

          <div className="flex items-center justify-center rounded-xl border border-border bg-surface-muted/40 p-4 sm:p-6">
            <IsometricBench
              key={`${matHatch}-${matBevel}`}
              scene={materialsScene}
              step={0}
              className="max-w-[460px]"
              label="Galeria dos 8 materiais isométricos: base, mid, ink, screen, brand, ok, warn e danger"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ALL_TONES.map((t) => (
              <span
                key={t.tone}
                className="rounded-md border border-border bg-surface-muted px-2 py-0.5 font-mono text-[11px] text-foreground"
              >
                tone=&quot;{t.label}&quot;
              </span>
            ))}
          </div>
        </DemoCard>

        <HR />

        {/* Demo 4: Primitivas iso-kit + Câmera 3D */}
        <DemoCard id="isometric-primitives" title="4. Primitivas Puras do iso-kit + Câmera 3D ao Vivo">
          <IsoKitCameraPlayground />
        </DemoCard>

        <HR />

        {/* Demo 5: Código de Uso + Props */}
        <DemoCard id="isometric-usage" title="5. Exemplo de Uso">
          <CodeBlock code={USAGE_SNIPPET} language="tsx" filename="MinhaBancada.tsx" />
        </DemoCard>

        <HR />

        <PropsTable
          rows={[
            ["IsometricShowcase", "scene, steps, stepMs, autoPlay, showBench, onPartClick, headingAs", "Palco completo com barra de progresso lopes-grow-x, play/pause, setas do teclado e prefers-reduced-motion."],
            ["IsometricBench / BenchFigure", "scene, step, label, showBench, onPartClick, interactiveParts", "Renderizador SVG imperativo com física de molas em 8 canais (x, y, z, w, d, h, o, g) e depth sorting."],
            ["makeScene", "parts, poses, callouts, wire, wireSteps, fit, bench, bz, height", "Construtor declarativo com auto-enquadramento (fitProjection) e cálculo de estados de entrada/saída."],
            ["iso-kit", "iso, slabOf, cylinder, extrude, knurl, coil, dotGrid, topTicks, faceTextSvg", "Primitivas geométricas 3D puras (77 exports) para ilustrações técnicas e câmeras customizadas."],
          ]}
        />
      </div>
    </main>
  );
}
