import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button as PrimitiveButton, Badge as PrimitiveBadge } from "../../components/primitives";

describe("Primitives", () => {
  it("renders PrimitiveButton with focus-visible classes", () => {
    render(<PrimitiveButton variant="brand">Confirmar</PrimitiveButton>);
    const btn = screen.getByRole("button", { name: "Confirmar" });
    expect(btn.className).toContain("focus-visible:ring-2");
  });

  it("renders PrimitiveBadge with text", () => {
    render(<PrimitiveBadge>Ativo</PrimitiveBadge>);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });
});
