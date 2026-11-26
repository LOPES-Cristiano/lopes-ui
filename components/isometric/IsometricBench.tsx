"use client";

import React, { useEffect, useId, useMemo, useRef } from "react";
import {
  corners,
  cylinder,
  depthOf,
  dotGrid,
  insetPlan,
  iso,
  knurl,
  pathOf,
  planOutline,
  pointsAt,
  slabOf,
  topMatrix,
  topTicks,
  type Projection,
  type SolidPaths,
} from "./iso-kit";
import { useInView, useLoop, type Spring } from "./live";
import { KEYS, initialPose, springOf, targetOf, type Key, type PartDef, type Pose, type Scene } from "./scene";

/* ------------------------------------------------------------------ */
/* Geometria                                                           */
/* ------------------------------------------------------------------ */

function solidOf(def: PartDef, p: Pose, P: Projection): SolidPaths | null {
  if (p.o < 0.01 || p.w < 0.25 || p.d < 0.25 || p.h < 0.02) return null;
  if (def.kind === "cyl") {
    const r = Math.min(p.w, p.d) / 2;
    return cylinder(p.x + p.w / 2, p.y + p.d / 2, r, p.z, p.h, P, def.steps ?? 32, def.bevel ?? 0);
  }
  const r = Math.max(0, Math.min(def.r ?? 0, p.w / 2 - 0.05, p.d / 2 - 0.05));
  return slabOf({ x: p.x, y: p.y, w: p.w, d: p.d, r }, p.z, p.h, P, def.steps ?? 8, def.bevel ?? 0);
}

function knurlOf(def: PartDef, p: Pose, P: Projection): string {
  if (def.kind !== "cyl" || !def.knurl || p.h < 1.2) return "";
  const r = Math.min(p.w, p.d) / 2;
  return knurl(p.x + p.w / 2, p.y + p.d / 2, r, p.z, p.z + p.h, def.knurl, P, Math.min(0.8, p.h * 0.15));
}

function dotsOf(def: PartDef, p: Pose, P: Projection): Array<[number, number]> {
  if (!def.dots) return [];
  const { cols, rows } = def.dots;
  const gap = def.dots.gap ?? Math.min(p.w / (cols + 1), p.d / (rows + 1));
  const totalW = (cols - 1) * gap;
  const totalD = (rows - 1) * gap;
  const startX = p.x + (p.w - totalW) / 2;
  const startY = p.y + (p.d - totalD) / 2;
  return dotGrid(startX, startY, cols, rows, gap, p.z + p.h, P);
}

function labelMatrixOf(p: Pose, P: Projection): string {
  return topMatrix([p.x + p.w / 2, p.y + p.d / 2], p.z + p.h + 0.1, P, "x");
}

const keyOf = (def: PartDef, p: Pose, P: Projection) =>
  depthOf([p.x + p.w / 2, p.y + p.d / 2, p.z + p.h / 2], P) + (def.bias ?? 0);

const topCenter = (p: Pose, P: Projection) => iso([p.x + p.w / 2, p.y + p.d / 2, p.z + p.h], P);

/* Bancada estática: tampo, pés, sulco, parafusos, régua e plaqueta. */
function benchArt(scene: Scene) {
  const { BENCH, BZ, PROJ: P } = scene;
  const top = slabOf(BENCH, 0, BZ, P, 10, 1.2);
  const feet = corners(BENCH, 16).map(([x, y]) => cylinder(x, y, 6, -8, 8, P, 24));
  const groove = planOutline(insetPlan(BENCH, 5), BZ, P, 10);
  const screws = pointsAt(
    corners(BENCH, 9).map(([x, y]) => [x, y, BZ]),
    P,
  );
  const ticks = topTicks(20, BENCH.w - 20, 5, 5, BENCH.d - 9, BZ, [2.6, 5], P, "x");
  const label = slabOf({ x: BENCH.w - 86, y: BENCH.d - 42, w: 60, d: 22, r: 2 }, BZ, 0.8, P, 3, 0.4);
  const rules = [0, 1, 2].map((k) =>
    pathOf([
      iso([BENCH.w - 80, BENCH.d - 37 + k * 5, BZ + 0.8], P),
      iso([k === 2 ? BENCH.w - 52 : BENCH.w - 34, BENCH.d - 37 + k * 5, BZ + 0.8], P),
    ]),
  );
  const halo = slabOf(BENCH, -8, 8, P).fill;
  return { top, feet, groove, screws, ticks, label, rules, halo };
}

/* ------------------------------------------------------------------ */
/* Desenho estático                                                    */
/* ------------------------------------------------------------------ */

function SolidMarkup({ paths, hatchId }: { paths: SolidPaths | null; hatchId?: string }) {
  const s = paths;
  return (
    <>
      <path data-r="fill" className="isx-fill" d={s?.fill ?? ""} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} data-r={`s${i}`} className={`isx-s${i}`} d={s?.shades[i] ?? ""} />
      ))}
      {hatchId ? <path data-r="hatch" fill={`url(#${hatchId})`} d={s ? s.shades.join("") : ""} /> : null}
      <path data-r="top" className="isx-top" d={s?.top ?? ""} />
      <path data-r="crease" className="isx-ln isx-crease" d={s?.crease ?? ""} />
      <path data-r="bevel" className="isx-ln isx-bevel" d={s?.bevel ?? ""} />
      <path data-r="edge" className="isx-ln isx-edge" d={s?.outline ?? ""} />
    </>
  );
}

export function StaticSolid({
  paths,
  tone,
  className,
}: {
  paths: SolidPaths;
  tone: string;
  className?: string;
}) {
  return (
    <g className={className} data-c={tone}>
      <SolidMarkup paths={paths} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Figura viva com física de molas                                     */
/* ------------------------------------------------------------------ */

interface PartRefs {
  g: SVGGElement;
  paths: Record<string, SVGPathElement>;
  dots: SVGCircleElement[];
  labelEl: SVGTextElement | null;
}

interface PartState {
  springs: Record<Key, Spring>;
  target: Pose;
  goal: Pose;
  pending: Partial<Record<Key, { value: number; at: number }>>;
  shown: boolean;
}

const spr = (): Spring => ({ at: 0, rate: 0 });

export interface IsometricBenchProps {
  scene: Scene;
  step: number;
  className?: string;
  label: string;
  /** Exibe a bancada base sob as peças (default: true) */
  showBench?: boolean;
  /** Callback disparado ao clicar/ativar (Enter/Space) uma peça isométrica */
  onPartClick?: (partId: string) => void;
  /** Callback disparado ao passar o mouse ou focar uma peça */
  onPartHover?: (partId: string | null) => void;
  /** Lista opcional de IDs clicáveis (se omitido e onPartClick estiver definido, todas são clicáveis) */
  interactiveParts?: readonly string[];
  /** ID da peça destacada visualmente */
  activePart?: string | null;
  /** Elevação física em z (unidades de cena) ao passar o mouse/focar uma peça clicável (default: 3.5) */
  hoverLift?: number;
  /** Inclinação 3D sutil (parallax) seguindo o ponteiro (respeita prefers-reduced-motion; default: false) */
  tilt?: boolean;
}

export function IsometricBench({
  scene,
  step,
  className,
  label,
  showBench = true,
  onPartClick,
  onPartHover,
  interactiveParts,
  activePart = null,
  hoverLift = 3.5,
  tilt = false,
}: IsometricBenchProps) {
  const { W, H, PROJ: P, PARTS, PART_BY_ID, wires } = scene;
  const uid = useId().replace(/:/g, "");
  const hatchId = `isx-hatch-${uid}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const wireRefs = useRef(new Map<string, SVGGElement>());
  const pillRefs = useRef(new Map<string, HTMLDivElement>());
  const parts = useRef(new Map<string, PartRefs>());
  const order = useRef<string[]>([]);
  const clock = useRef(0);
  const live = useRef(scene);
  const hoveredId = useRef<string | null>(null);
  const hoverLiftRef = useRef(hoverLift);
  const tiltEnabled = useRef(tilt);
  const tiltTarget = useRef({ rx: 0, ry: 0 });
  const tiltSpring = useRef({ rx: spr(), ry: spr() });
  const onPartClickRef = useRef(onPartClick);
  const onPartHoverRef = useRef(onPartHover);

  useEffect(() => {
    live.current = scene;
  }, [scene]);

  useEffect(() => {
    onPartClickRef.current = onPartClick;
  }, [onPartClick]);

  useEffect(() => {
    onPartHoverRef.current = onPartHover;
  }, [onPartHover]);

  useEffect(() => {
    hoverLiftRef.current = hoverLift;
  }, [hoverLift]);

  useEffect(() => {
    tiltEnabled.current = tilt;
    if (!tilt) {
      tiltTarget.current = { rx: 0, ry: 0 };
      if (stageRef.current) stageRef.current.style.transform = "";
    }
  }, [tilt]);

  const initialStates = useMemo(
    () =>
      new Map<string, PartState>(
        PARTS.map((def) => {
          const p = initialPose(scene, def, step);
          const springs = Object.fromEntries(
            KEYS.map((k) => [k, { at: p[k], rate: 0 }]),
          ) as Record<Key, Spring>;
          return [def.id, { springs, target: p, goal: { ...p }, pending: {}, shown: p.o > 0.01 }];
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const state = useRef<Map<string, PartState>>(initialStates);
  const extra = useRef({
    wires: new Map<string, Spring>(
      wires.map((w) => [w.id, { at: w.steps.includes(step) ? 1 : 0, rate: 0 }]),
    ),
    pills: new Map<string, Spring>(),
    step,
    scene,
  });

  const visible = useInView(rootRef);

  useEffect(() => {
    rootRef.current?.querySelector(".isx-svg")?.setAttribute("aria-label", label);
  }, [label]);

  useEffect(() => {
    for (const [id, refs] of parts.current) {
      if (activePart === id) refs.g.setAttribute("data-active", "");
      else refs.g.removeAttribute("data-active");
    }
  }, [activePart]);

  const current = (id: string): Pose => {
    const s = state.current.get(id)!.springs;
    return { x: s.x.at, y: s.y.at, z: s.z.at, w: s.w.at, d: s.d.at, h: s.h.at, o: s.o.at, g: s.g.at };
  };

  function drawPart(def: PartDef, p: Pose, st: PartState) {
    const refs = parts.current.get(def.id);
    if (!refs) return;
    const solid = solidOf(def, p, P);
    if (!solid) {
      if (st.shown) {
        refs.g.style.display = "none";
        st.shown = false;
      }
      return;
    }
    if (!st.shown) {
      refs.g.style.display = "";
      st.shown = true;
    }
    refs.g.setAttribute("opacity", Math.min(1, p.o).toFixed(3));
    const r = refs.paths;
    r.fill?.setAttribute("d", solid.fill);
    for (let i = 0; i < 4; i++) r[`s${i}`]?.setAttribute("d", solid.shades[i] ?? "");
    r.hatch?.setAttribute("d", solid.shades.join(""));
    r.top?.setAttribute("d", solid.top);
    r.crease?.setAttribute("d", solid.crease);
    r.bevel?.setAttribute("d", solid.bevel ?? "");
    r.edge?.setAttribute("d", solid.outline);
    if (r.knurl) {
      r.knurl.setAttribute("d", knurlOf(def, p, P));
    }
    if (r.glow) {
      r.glow.setAttribute("d", solid.top);
      r.glow.setAttribute("opacity", p.g.toFixed(3));
    }
    if (refs.dots.length > 0) {
      const coords = dotsOf(def, p, P);
      refs.dots.forEach((el, idx) => {
        const pt = coords[idx];
        if (!pt) return;
        el.setAttribute("cx", pt[0].toFixed(1));
        el.setAttribute("cy", pt[1].toFixed(1));
      });
    }
    if (refs.labelEl) {
      refs.labelEl.setAttribute("transform", labelMatrixOf(p, P));
    }
  }

  function sortParts() {
    const layer = layerRef.current;
    if (!layer) return;
    const ids = PARTS.filter((d) => state.current.get(d.id)!.shown)
      .map((d) => ({ id: d.id, k: keyOf(d, current(d.id), P) }))
      .sort((a, b) => a.k - b.k)
      .map((e) => e.id);
    const prev = order.current;
    if (ids.length === prev.length && ids.every((id, i) => id === prev[i])) return;
    order.current = ids;
    const frag = document.createDocumentFragment();
    for (const id of ids) {
      const g = parts.current.get(id)?.g;
      if (g) frag.appendChild(g);
    }
    layer.appendChild(frag);
  }

  const kick = useLoop((dt, calm) => {
    clock.current += dt * 1000;
    const now = clock.current;
    const sc = live.current;
    let moving = false;

    for (const def of PARTS) {
      const st = state.current.get(def.id)!;
      const cfg = springOf(sc, def.id);
      let dirty = false;
      const isHovered = hoveredId.current === def.id && st.target.o > 0.5;
      for (const k of KEYS) {
        const pend = st.pending[k];
        if (pend) {
          if (now >= pend.at) {
            st.goal[k] = pend.value;
            delete st.pending[k];
          } else moving = true;
        }
        const lift = k === "z" && isHovered && !calm ? hoverLiftRef.current : 0;
        const target = st.goal[k] + lift;
        const sp = st.springs[k];
        if (sp.at === target && sp.rate === 0) continue;
        if (calm) {
          sp.at = target;
          sp.rate = 0;
        } else {
          const isFade = k === "o" || k === "g";
          const kk = isFade ? 170 : isHovered && k === "z" ? 260 : cfg.k;
          const cc = isFade ? 26 : isHovered && k === "z" ? 24 : cfg.c;
          const steps = Math.max(Math.ceil(dt * 240), 1);
          const slice = dt / steps;
          for (let i = 0; i < steps; i++) {
            sp.rate += (target - sp.at) * kk * slice - sp.rate * cc * slice;
            sp.at += sp.rate * slice;
          }
          if (Math.abs(target - sp.at) < 5e-3 && Math.abs(sp.rate) < 5e-3) {
            sp.at = target;
            sp.rate = 0;
          } else moving = true;
        }
        dirty = true;
      }
      if (dirty) drawPart(def, current(def.id), st);
    }

    // Múltiplos cabos animados
    const ex = extra.current;
    for (const w of sc.wires) {
      let sp = ex.wires.get(w.id);
      if (!sp) {
        sp = spr();
        ex.wires.set(w.id, sp);
      }
      const want = w.steps.includes(ex.step) ? 1 : 0;
      moving = fade(sp, want, dt, calm) || moving;
      wireRefs.current.get(w.id)?.setAttribute("opacity", sp.at.toFixed(3));
    }

    // Balões (callouts)
    const ids = new Set<string>();
    for (const c of sc.callouts) {
      ids.add(c.id);
      let sp = ex.pills.get(c.id);
      if (!sp) {
        sp = spr();
        ex.pills.set(c.id, sp);
      }
      const host = current(c.part);
      const want = c.steps.includes(ex.step) && host.o > 0.6 ? 1 : 0;
      moving = fade(sp, want, dt, calm) || moving;
      const el = pillRefs.current.get(c.id);
      if (el) {
        const [sx, sy] = topCenter(host, P);
        el.style.left = `${(sx / W) * 100}%`;
        el.style.top = `${(sy / H) * 100}%`;
        el.style.opacity = sp.at.toFixed(3);
        el.style.setProperty("--rise", `${((1 - sp.at) * 8).toFixed(2)}px`);
        el.style.visibility = sp.at < 0.01 ? "hidden" : "visible";
      }
    }
    for (const [id, el] of pillRefs.current) {
      if (ids.has(id)) continue;
      const sp = ex.pills.get(id);
      if (sp) moving = fade(sp, 0, dt, calm) || moving;
      el.style.opacity = (sp?.at ?? 0).toFixed(3);
      el.style.visibility = !sp || sp.at < 0.01 ? "hidden" : "visible";
    }

    // Tilt 3D suave seguindo ponteiro
    if (tiltEnabled.current && stageRef.current) {
      const tx = calm ? 0 : tiltTarget.current.rx;
      const ty = calm ? 0 : tiltTarget.current.ry;
      const m1 = fade(tiltSpring.current.rx, tx, dt, calm, 110, 20);
      const m2 = fade(tiltSpring.current.ry, ty, dt, calm, 110, 20);
      moving = m1 || m2 || moving;
      const rx = tiltSpring.current.rx.at;
      const ry = tiltSpring.current.ry.at;
      stageRef.current.style.transform =
        Math.abs(rx) < 0.01 && Math.abs(ry) < 0.01
          ? ""
          : `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    }

    sortParts();
    return moving;
  }, visible);

  useEffect(() => {
    const ex = extra.current;
    if (ex.step === step && ex.scene === scene) return;
    ex.step = step;
    ex.scene = scene;
    const now = clock.current;
    for (const def of PARTS) {
      const st = state.current.get(def.id)!;
      const { pose, delay } = targetOf(scene, def, step, st.target);
      for (const k of KEYS) {
        if (pose[k] === st.target[k] && !st.pending[k]) continue;
        const wait = delay(k);
        if (wait > 0) st.pending[k] = { value: pose[k], at: now + wait };
        else {
          st.goal[k] = pose[k];
          delete st.pending[k];
        }
      }
      st.target = pose;
    }
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, scene, kick]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    for (const g of Array.from(layer.querySelectorAll<SVGGElement>(":scope > g[data-part]"))) {
      const paths: Record<string, SVGPathElement> = {};
      g.querySelectorAll<SVGPathElement>("path[data-r]").forEach((p) => (paths[p.dataset.r!] = p));
      const dots = Array.from(g.querySelectorAll<SVGCircleElement>("circle[data-dot]"));
      const labelEl = g.querySelector<SVGTextElement>("text[data-face-label]");
      parts.current.set(g.dataset.part!, { g, paths, dots, labelEl });
    }
    sortParts();
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const art = useMemo(() => benchArt(scene), [scene]);
  const renderedWires = useMemo(
    () =>
      wires.map((w) => ({
        ...w,
        d: pathOf(w.points.map((pt) => iso(pt, P))),
        ends: w.points.length ? [iso(w.points[0]!, P), iso(w.points[w.points.length - 1]!, P)] : [],
      })),
    [wires, P],
  );

  const interactiveSet = useMemo(
    () => (interactiveParts ? new Set(interactiveParts) : null),
    [interactiveParts],
  );

  const handleHover = (id: string | null) => {
    if (hoveredId.current === id) return;
    hoveredId.current = id;
    onPartHoverRef.current?.(id);
    kick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled.current || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    tiltTarget.current = { rx: -ny * 3.2, ry: nx * 4.2 };
    kick();
  };

  const handlePointerLeave = () => {
    handleHover(null);
    if (tiltEnabled.current) {
      tiltTarget.current = { rx: 0, ry: 0 };
      kick();
    }
  };

  const markup = useMemo(
    () => (
      <svg className="isx-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} focusable="false">
        <defs>
          <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" className="isx-hatch" />
          </pattern>
        </defs>

        {showBench ? (
          <>
            <path className="isx-halo" d={art.halo} />
            {art.feet.map((f, i) => (
              <StaticSolid key={i} paths={f} tone="base" />
            ))}
            <StaticSolid paths={art.top} tone="base" />
            <path className="isx-ln isx-faint" d={art.groove} />
            <path className="isx-ln isx-faint" d={art.ticks.minor} />
            <path className="isx-ln isx-mid" d={art.ticks.major} />
            <StaticSolid paths={art.label} tone="mid" />
            {art.rules.map((d, i) => (
              <path key={i} className="isx-ln isx-faint" d={d} />
            ))}
            {art.screws.map(([x, y], i) => (
              <g key={i}>
                <circle className="isx-screw-ring" cx={x} cy={y} r={2.6} />
                <circle className="isx-screw" cx={x} cy={y} r={0.9} />
              </g>
            ))}
          </>
        ) : null}

        {renderedWires.map((w) => (
          <g
            key={w.id}
            ref={(el) => {
              if (el) wireRefs.current.set(w.id, el);
              else wireRefs.current.delete(w.id);
            }}
            opacity={w.steps.includes(step) ? 1 : 0}
          >
            <path className="isx-ln isx-wire-base" d={w.d} />
            <path
              className="isx-ln isx-wire-flow"
              data-tone={w.tone ?? "brand"}
              data-reverse={w.reverse ? "" : undefined}
              d={w.d}
            />
            {w.ends.map(([x, y], i) => (
              <circle key={i} className="isx-wire-end" cx={x} cy={y} r={2.2} />
            ))}
          </g>
        ))}

        <g ref={layerRef}>
          {PARTS.map((def) => {
            const p = initialPose(scene, def, step);
            const solid = solidOf(def, p, P);
            const clickable = Boolean(onPartClick) && (!interactiveSet || interactiveSet.has(def.id));
            const dotCoords = dotsOf(def, p, P);
            return (
              <g
                key={def.id}
                data-part={def.id}
                data-c={def.tone}
                data-blink={def.blink ? "" : undefined}
                data-interactive={clickable ? "" : undefined}
                data-active={activePart === def.id ? "" : undefined}
                className={clickable ? "isx-part-interactive" : undefined}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable ? (def.ariaLabel ?? def.label ?? def.id) : undefined}
                opacity={p.o}
                style={{ display: solid ? undefined : "none" }}
                onClick={clickable ? () => onPartClickRef.current?.(def.id) : undefined}
                onMouseEnter={clickable ? () => handleHover(def.id) : undefined}
                onMouseLeave={clickable ? () => handleHover(null) : undefined}
                onFocus={clickable ? () => handleHover(def.id) : undefined}
                onBlur={clickable ? () => handleHover(null) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onPartClickRef.current?.(def.id);
                        }
                      }
                    : undefined
                }
              >
                <SolidMarkup paths={solid} hatchId={def.hatch ? hatchId : undefined} />
                {def.knurl ? (
                  <path data-r="knurl" className="isx-ln isx-faint" d={knurlOf(def, p, P)} />
                ) : null}
                {def.glow ? <path data-r="glow" className="isx-glow" d={solid?.top ?? ""} opacity={p.g} /> : null}
                {dotCoords.map(([cx, cy], idx) => (
                  <circle
                    key={idx}
                    data-dot={idx}
                    cx={cx}
                    cy={cy}
                    r={1.35}
                    className={def.dots?.glow ? "isx-glow" : "isx-dot"}
                  />
                ))}
                {def.label ? (
                  <text
                    data-face-label=""
                    className="isx-face-label"
                    transform={labelMatrixOf(p, P)}
                    fontSize={def.labelSize ?? 8.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {def.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const pills = scene.callouts.map((c) => {
    const host = PART_BY_ID.get(c.part);
    if (!host) return null;
    const [sx, sy] = topCenter(initialPose(scene, host, step), P);
    const on = c.steps.includes(step);
    return (
      <div
        key={c.id}
        ref={(el) => {
          if (el) pillRefs.current.set(c.id, el);
          else pillRefs.current.delete(c.id);
        }}
        className="isx-pill"
        data-tone={c.tone}
        style={
          {
            left: `${(sx / W) * 100}%`,
            top: `${(sy / H) * 100}%`,
            opacity: on ? 1 : 0,
            visibility: on ? "visible" : "hidden",
            "--stem": `${c.stem ?? 26}px`,
          } as React.CSSProperties
        }
      >
        <span>{c.text}</span>
      </div>
    );
  });

  return (
    <div
      ref={rootRef}
      className={`isx ${className ?? ""}`}
      style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, calc(72dvh * ${W / H}))` }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={stageRef} className="isx-stage">
        {markup}
        <div className="isx-pills" aria-hidden="true">
          {pills}
        </div>
      </div>
    </div>
  );
}

/** Alias retrocompatível com o nome original do kit */
export const BenchFigure = IsometricBench;

function fade(sp: Spring, target: number, dt: number, calm: boolean, k = 170, c = 26) {
  if (sp.at === target && sp.rate === 0) return false;
  if (calm) {
    sp.at = target;
    sp.rate = 0;
    return false;
  }
  const steps = Math.max(Math.ceil(dt * 240), 1);
  const slice = dt / steps;
  for (let i = 0; i < steps; i++) {
    sp.rate += (target - sp.at) * k * slice - sp.rate * c * slice;
    sp.at += sp.rate * slice;
  }
  if (Math.abs(target - sp.at) < 2e-3 && Math.abs(sp.rate) < 2e-3) {
    sp.at = target;
    sp.rate = 0;
    return false;
  }
  return true;
}
