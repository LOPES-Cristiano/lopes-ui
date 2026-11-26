/**
 * Motor declarativo de cenas isométricas (Lopes UI Isometric).
 * Uma `Scene` descreve peças (`PartDef`), poses por passo (`poses`),
 * balões (`callouts`), cabos animados (`wires`) e projeção automática.
 */
import { boxCorners, fitProjection, iso, type Point3, type Projection } from "./iso-kit";

export type PartTone = "base" | "mid" | "ink" | "screen" | "brand" | "ok" | "warn" | "danger";
export type CalloutTone = "brand" | "ok" | "warn" | "danger" | "ink";
export type Key = "x" | "y" | "z" | "w" | "d" | "h" | "o" | "g";
export const KEYS: Key[] = ["x", "y", "z", "w", "d", "h", "o", "g"];

export interface Pose {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  o: number; // opacidade (0..1)
  g: number; // brilho / glow (0..1)
}

export interface PoseIn extends Partial<Pose> {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  delay?: number; // ms
  delays?: Partial<Record<Key, number>>;
}

export interface SpringCfg {
  k: number; // rigidez
  c: number; // amortecimento
}

export interface DotMatrixCfg {
  cols: number;
  rows: number;
  gap?: number;
  glow?: boolean;
}

export interface PartDef {
  id: string;
  kind: "slab" | "cyl";
  tone: PartTone;
  r?: number;
  steps?: number;
  bevel?: number;
  hatch?: boolean;
  glow?: boolean;
  blink?: boolean;
  /** Serrilhado mecânico lateral para cilindros (ex.: 20 ou 28) */
  knurl?: number;
  /** Grade de pontos/LEDs projetada no topo de blocos */
  dots?: DotMatrixCfg;
  /** Rótulo técnico impresso em perspectiva isométrica no topo da peça */
  label?: string;
  /** Tamanho do rótulo em unidades de cena (default: 8.5) */
  labelSize?: number;
  /** Rótulo acessível para peças clicáveis (fallback: label ou id) */
  ariaLabel?: string;
  /** Como a peça entra (e sai, pelo mesmo caminho) a partir da pose final. */
  enter?: (p: Pose) => Partial<Pose>;
  spring?: SpringCfg;
  bias?: number;
}

export interface CalloutDef {
  id: string;
  part: string;
  text: string;
  tone: CalloutTone;
  steps: number[];
  stem?: number;
}

export interface WireDef {
  id: string;
  points: Point3[];
  steps: number[];
  tone?: CalloutTone;
  /** Inverte o sentido visual do fluxo de pacotes no cabo */
  reverse?: boolean;
}

export type Group = Record<string, PoseIn>;

export interface Scene {
  W: number;
  H: number;
  BZ: number;
  BENCH: { x: number; y: number; w: number; d: number; r: number };
  PROJ: Projection;
  PARTS: PartDef[];
  PART_BY_ID: Map<string, PartDef>;
  poses: Group[];
  callouts: CalloutDef[];
  wire: Point3[];
  wireSteps: number[];
  wires: WireDef[];
  rest: Map<string, Pose>;
}

export const W = 520;
export const H = 400;
export const BZ = 10; // altura padrão do tampo da bancada
export const BENCH = { x: 0, y: 0, w: 300, d: 210, r: 9 };

export const SOFT: SpringCfg = { k: 120, c: 20 }; // ζ ≈ 0.91: chega sem quicar
export const BOUNCY: SpringCfg = { k: 240, c: 17 }; // ζ ≈ 0.55: fichas/selos caindo
export const sinkTo = (z: number) => () => ({ z, h: 0 });

const full = (p: PoseIn): Pose => ({ o: 1, g: 0, ...p });

export function makeScene(o: {
  parts: PartDef[];
  poses: Group[];
  callouts: CalloutDef[];
  wire?: Point3[];
  wireSteps?: number[];
  wires?: WireDef[];
  fit?: Point3[];
  headroom?: number;
  bench?: { x: number; y: number; w: number; d: number; r: number };
  bz?: number;
  height?: number;
}): Scene {
  const bench = o.bench ?? BENCH;
  const bz = o.bz ?? BZ;
  const height = o.height ?? H;

  const rest = new Map<string, Pose>();
  for (const def of o.parts) {
    const first = o.poses.find((s) => s[def.id]);
    if (first) rest.set(def.id, full(first[def.id]!));
  }

  const pts: Point3[] = [...boxCorners(bench, -8, bz)];
  if (o.fit) {
    pts.push(...o.fit);
  } else {
    for (const s of o.poses) {
      for (const p of Object.values(s)) {
        pts.push(...boxCorners({ x: p.x, y: p.y, w: p.w, d: p.d, r: 0 }, p.z, p.z + p.h));
      }
    }
  }

  const unit: Projection = { origin: [0, 0], scale: 1 };
  const flat = pts.map((p) => iso(p, unit));
  const bw = Math.max(...flat.map((q) => q[0])) - Math.min(...flat.map((q) => q[0]));
  const bh = Math.max(...flat.map((q) => q[1])) - Math.min(...flat.map((q) => q[1]));
  const headroom = o.headroom ?? 46;
  const padY = 10;
  const k = (height - padY * 2 - headroom) / bh;
  const width = Math.round(bw * k + 56);

  const wire = o.wire ?? [];
  const wireSteps = o.wireSteps ?? [];
  const wires: WireDef[] = [...(o.wires ?? [])];
  if (wire.length > 0) {
    wires.unshift({ id: "__primary_wire__", points: wire, steps: wireSteps, tone: "brand" });
  }

  return {
    W: width,
    H: height,
    BZ: bz,
    BENCH: bench,
    PROJ: fitProjection(pts, width, height, { pad: padY, headroom }),
    PARTS: o.parts,
    PART_BY_ID: new Map(o.parts.map((p) => [p.id, p])),
    poses: o.poses,
    callouts: o.callouts,
    wire,
    wireSteps,
    wires,
    rest,
  };
}

export const springOf = (scene: Scene, id: string) => scene.PART_BY_ID.get(id)?.spring ?? SOFT;

export function hiddenFrom(def: PartDef, pose: Pose): Pose {
  return { ...pose, ...(def.enter ? def.enter(pose) : {}), o: 0, g: 0 };
}

/** Alvo de uma peça no passo `s`; `last` é o alvo anterior (para saídas). */
export function targetOf(
  scene: Scene,
  def: PartDef,
  s: number,
  last: Pose | undefined,
): { pose: Pose; delay: (k: Key) => number } {
  const p = scene.poses[s]?.[def.id];
  if (p) return { pose: full(p), delay: (k) => p.delays?.[k] ?? p.delay ?? 0 };
  const base =
    last && last.o > 0.5
      ? last
      : (scene.rest.get(def.id) ??
        last ?? { x: 0, y: 0, z: scene.BZ, w: 1, d: 1, h: 0, o: 0, g: 0 });
  return { pose: hiddenFrom(def, base), delay: () => 0 };
}

export function initialPose(scene: Scene, def: PartDef, step = 0): Pose {
  return targetOf(scene, def, step, undefined).pose;
}

/** Caixa fixa recomendada para enquadrar cenas cujas poses mudam ao vivo. */
export const LIVE_FIT: Point3[] = boxCorners({ x: 0, y: 0, w: 300, d: 210, r: 0 }, BZ, BZ + 96);
