import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Tabs from "../../components/Tabs";

beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
});

describe("Tabs", () => {
  const items = [
    { value: "salas", label: "Salas", content: <p>Catálogo de sofás e racks</p> },
    { value: "quartos", label: "Quartos", content: <p>Catálogo de colchões e camas</p> },
    { value: "eletro", label: "Eletro", content: <p>Geladeiras e lavadoras</p>, disabled: true },
  ];

  it("renders all tabs with the first tab active and aria-selected set properly", () => {
    render(<Tabs items={items} />);

    const salasTab = screen.getByRole("tab", { name: "Salas" });
    const quartosTab = screen.getByRole("tab", { name: "Quartos" });
    const eletroTab = screen.getByRole("tab", { name: "Eletro" });

    expect(salasTab).toHaveAttribute("aria-selected", "true");
    expect(quartosTab).toHaveAttribute("aria-selected", "false");
    expect(eletroTab).toBeDisabled();
    expect(screen.getByText("Catálogo de sofás e racks")).toBeInTheDocument();
  });

  it("switches active tab on click and notifies onValueChange", () => {
    const onValueChange = vi.fn();
    render(<Tabs items={items} onValueChange={onValueChange} />);

    const salasTab = screen.getByRole("tab", { name: "Salas" });
    const quartosTab = screen.getByRole("tab", { name: "Quartos" });

    fireEvent.mouseDown(quartosTab, { button: 0 });
    fireEvent.click(quartosTab);

    expect(onValueChange).toHaveBeenCalledWith("quartos");
    expect(quartosTab).toHaveAttribute("aria-selected", "true");
    expect(salasTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Catálogo de colchões e camas")).toBeInTheDocument();
  });
});
