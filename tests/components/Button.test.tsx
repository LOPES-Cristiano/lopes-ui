import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Button from "../../components/Button";

describe("Button", () => {
  it("renders children and triggers onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);

    const btn = screen.getByRole("button", { name: "Salvar" });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("exposes aria-busy and disables interaction when loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingText="Salvando..." onClick={onClick}>
        Salvar
      </Button>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Salvando...")).toBeInTheDocument();

    const spinner = btn.querySelector("svg");
    expect(spinner).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks decorative icons as aria-hidden", () => {
    render(
      <Button leftIcon={<span data-testid="icon-left">*</span>}>
        Exportar
      </Button>,
    );

    const iconWrapper = screen.getByTestId("icon-left").parentElement;
    expect(iconWrapper).toHaveAttribute("aria-hidden", "true");
  });
});
