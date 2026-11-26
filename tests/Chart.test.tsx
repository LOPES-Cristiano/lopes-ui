import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Chart, { computeNiceScale, formatCompactPtBr, type ChartType } from "../components/Chart";

const SAMPLE_MULTI = [
  { label: "Jan", receita: 420, meta: 380 },
  { label: "Fev", receita: 485, meta: 420 },
  { label: "Mar", receita: 530, meta: 460 },
  { label: "Abr", receita: 610, meta: 510 },
];

const SAMPLE_SINGLE = [
  { label: "Estofados", value: 420, color: "indigo" as const },
  { label: "Eletrodomésticos", value: 315, color: "emerald" as const },
  { label: "Colchões", value: 225, color: "amber" as const },
];

const ALL_TYPES: ChartType[] = [
  "bar",
  "horizontal-bar",
  "area",
  "line",
  "composed",
  "donut",
  "pie",
  "radial",
  "radar",
  "funnel",
];

describe("Chart math utilities", () => {
  it("computes human-friendly rounded Y-axis ticks", () => {
    const scale = computeNiceScale(720, 4);
    expect(scale.ticks[0]).toBe(0);
    expect(scale.max).toBeGreaterThanOrEqual(720);
    expect(scale.step % 50 === 0 || scale.step % 100 === 0).toBe(true);
  });

  it("formats compact PT-BR numbers cleanly", () => {
    expect(formatCompactPtBr(850)).toBe("850");
    expect(formatCompactPtBr(25_000)).toContain("mil");
    expect(formatCompactPtBr(1_500_000)).toContain("mi");
  });
});

describe("Chart component (2D & 3D Isometric)", () => {
  it.each(ALL_TYPES)("renders %s in 2D mode without crashing and exposes accessible table", (type) => {
    const isSingle = ["donut", "pie", "radial", "funnel"].includes(type);
    const { container } = render(
      <Chart
        type={type}
        variant="2d"
        title={`Gráfico ${type}`}
        data={isSingle ? SAMPLE_SINGLE : SAMPLE_MULTI}
        series={
          isSingle
            ? undefined
            : [
                { key: "receita", label: "Receita", color: "indigo" },
                { key: "meta", label: "Meta", color: "emerald" },
              ]
        }
      />,
    );
    expect(container.querySelector(`[data-chart-type="${type}"]`)).toBeTruthy();
    expect(container.querySelector(`[data-chart-variant="2d"]`)).toBeTruthy();
    expect(container.querySelector("table.sr-only")).toBeTruthy();
  });

  it.each(ALL_TYPES)("renders %s in 3D isometric mode without crashing", (type) => {
    const isSingle = ["donut", "pie", "radial", "funnel"].includes(type);
    const { container } = render(
      <Chart
        type={type}
        variant="3d"
        barShape={type === "bar" ? "cylinder" : "prism"}
        title={`Gráfico 3D ${type}`}
        data={isSingle ? SAMPLE_SINGLE : SAMPLE_MULTI}
        series={
          isSingle
            ? undefined
            : [
                { key: "receita", label: "Receita", color: "indigo" },
                { key: "meta", label: "Meta", color: "emerald" },
              ]
        }
      />,
    );
    expect(container.querySelector(`[data-chart-variant="3d"]`)).toBeTruthy();
    expect(container.querySelector(".lopes-chart-3d")).toBeTruthy();
  });

  it("switches between 2D and 3D when allowVariantToggle is enabled", () => {
    const { container } = render(
      <Chart
        type="bar"
        variant="2d"
        allowVariantToggle
        title="Faturamento RO/AM"
        data={SAMPLE_MULTI}
      />,
    );
    expect(container.querySelector(`[data-chart-variant="2d"]`)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "3D" }));
    expect(container.querySelector(`[data-chart-variant="3d"]`)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "2D" }));
    expect(container.querySelector(`[data-chart-variant="2d"]`)).toBeTruthy();
  });

  it("toggles series visibility via interactive legend while keeping at least one active", () => {
    render(
      <Chart
        type="bar"
        data={SAMPLE_MULTI}
        series={[
          { key: "receita", label: "Receita", color: "indigo" },
          { key: "meta", label: "Meta", color: "emerald" },
        ]}
      />,
    );

    const receitaBtn = screen.getByRole("button", { name: "Receita" });
    const metaBtn = screen.getByRole("button", { name: "Meta" });

    expect(receitaBtn).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(receitaBtn);
    expect(receitaBtn).toHaveAttribute("aria-pressed", "false");

    // Trying to hide the last remaining series should keep it active
    fireEvent.click(metaBtn);
    expect(metaBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("renders empty state when data is empty", () => {
    render(<Chart type="bar" data={[]} emptyMessage="Sem vendas no período." />);
    expect(screen.getByText("Sem vendas no período.")).toBeInTheDocument();
  });

  it("fires onDataPointClick when clicking a 2D bar column", () => {
    const onClick = vi.fn();
    render(
      <Chart
        type="bar"
        data={SAMPLE_MULTI}
        series={[{ key: "receita", label: "Receita", color: "indigo" }]}
        onDataPointClick={onClick}
      />,
    );
    const janCol = screen.getByRole("button", { name: /Jan:/i });
    fireEvent.click(janCol);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(SAMPLE_MULTI[0], 0);
  });
});
