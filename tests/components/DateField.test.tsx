import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DateField from "../../components/form/DateField";
import TimeField from "../../components/form/TimeField";

describe("DateField & TimeField", () => {
  it("links DateField error via aria-invalid and aria-describedby", () => {
    render(
      <DateField
        id="data-entrega"
        label="Data de entrega"
        error="Data obrigatória"
      />,
    );

    const input = screen.getByLabelText("Data de entrega");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "data-entrega-error");
  });

  it("renders TimeField with semantic attributes and hidden decorative icon", () => {
    const { container } = render(
      <TimeField id="hora-saida" label="Horário de saída" helpText="Formato 24h" />,
    );

    const input = screen.getByLabelText("Horário de saída");
    expect(input).toHaveAttribute("type", "time");
    expect(input).toHaveAttribute("aria-describedby", "hora-saida-help");

    const decorativeSpan = container.querySelector('[aria-hidden="true"]');
    expect(decorativeSpan).toBeInTheDocument();
  });
});
