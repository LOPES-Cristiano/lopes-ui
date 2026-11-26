import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  BZ,
  IsometricBench,
  IsometricShowcase,
  combinePresets,
  createCardReaderPreset,
  createCertificatePreset,
  createCoinStackPreset,
  createDatabasePreset,
  createPalletBoxesPreset,
  createServerRackPreset,
  createTerminalPreset,
  createTruckPreset,
  makeScene,
  type IsometricShowcaseStep,
} from "../../components/isometric";

function buildTestScene() {
  return makeScene({
    parts: [
      {
        id: "boxA",
        kind: "slab",
        tone: "brand",
        r: 2,
        label: "PDV",
        ariaLabel: "Bloco PDV",
        dots: { cols: 2, rows: 2, gap: 8 },
      },
      { id: "cylB", kind: "cyl", tone: "ok", steps: 16, knurl: 16 },
    ],
    poses: [
      { boxA: { x: 40, y: 40, w: 30, d: 30, z: BZ, h: 20 } },
      {
        boxA: { x: 40, y: 40, w: 30, d: 30, z: BZ, h: 20 },
        cylB: { x: 120, y: 40, w: 24, d: 24, z: BZ, h: 30 },
      },
    ],
    wires: [
      {
        id: "w1",
        points: [
          [70, 55, BZ + 0.6],
          [120, 55, BZ + 0.6],
        ],
        steps: [1],
        tone: "ok",
        reverse: true,
      },
    ],
    callouts: [
      { id: "c1", part: "boxA", text: "Etapa 1", tone: "brand", steps: [0] },
      { id: "c2", part: "cylB", text: "Etapa 2", tone: "ok", steps: [1] },
    ],
  });
}

describe("lopes-ui/isometric", () => {
  it("renders IsometricBench with 3D labels, dots, knurl, keyboard activation and hover callback", () => {
    const scene = buildTestScene();
    const onPartClick = vi.fn();
    const onPartHover = vi.fn();
    const { container } = render(
      <IsometricBench
        scene={scene}
        step={0}
        label="Bancada de teste"
        tilt
        onPartClick={onPartClick}
        onPartHover={onPartHover}
      />,
    );

    expect(screen.getByRole("img", { name: "Bancada de teste" })).toBeInTheDocument();
    const partGroup = screen.getByRole("button", { name: "Bloco PDV" });
    expect(container.querySelector('text[data-face-label]')?.textContent).toBe("PDV");
    expect(container.querySelectorAll('circle[data-dot]').length).toBe(4);
    expect(container.querySelector('path[data-r="knurl"]')).toBeTruthy();

    fireEvent.mouseEnter(partGroup);
    expect(onPartHover).toHaveBeenCalledWith("boxA");

    fireEvent.keyDown(partGroup, { key: "Enter" });
    expect(onPartClick).toHaveBeenCalledWith("boxA");

    fireEvent.click(partGroup);
    expect(onPartClick).toHaveBeenCalledTimes(2);
  });

  it("renders IsometricShowcase and navigates steps by click and keyboard", () => {
    const scene = buildTestScene();
    const steps: IsometricShowcaseStep[] = [
      { id: "s1", tag: "Vendas", title: "Primeira etapa", caption: "Descrição 1" },
      { id: "s2", tag: "Estoque", title: "Segunda etapa", caption: "Descrição 2" },
    ];

    render(<IsometricShowcase scene={scene} steps={steps} autoPlay={false} />);

    expect(screen.getByText("Primeira etapa")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /02 Estoque/i }));
    expect(screen.getByText("Segunda etapa")).toBeInTheDocument();

    const list = screen.getByRole("list", { name: "Etapas da demonstração" });
    fireEvent.keyDown(list, { key: "ArrowLeft" });
    expect(screen.getByText("Primeira etapa")).toBeInTheDocument();
  });

  it("composes all 8 ready-made presets via combinePresets without errors", () => {
    const all = [
      createTerminalPreset({ id: "t1" }),
      createServerRackPreset({ id: "s1" }),
      createPalletBoxesPreset({ id: "p1" }),
      createDatabasePreset({ id: "d1" }),
      createCoinStackPreset({ id: "c1" }),
      createCertificatePreset({ id: "cert1" }),
      createCardReaderPreset({ id: "pix1" }),
      createTruckPreset({ id: "trk1" }),
    ];

    const scene = makeScene({
      parts: combinePresets(...all),
      poses: all.map((p) => p.pose()),
      callouts: [],
    });

    expect(scene.PARTS.length).toBeGreaterThanOrEqual(30);
    render(<IsometricBench scene={scene} step={7} label="Caminhão pronto" />);
    expect(screen.getByRole("img", { name: "Caminhão pronto" })).toBeInTheDocument();
  });
});
