import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CheckboxGroup from "../../components/form/CheckboxGroup";
import RadioGroupField from "../../components/form/RadioGroupField";
import InputGroup, {
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../components/form/InputGroup";

describe("CheckboxGroup", () => {
  const options = [
    { value: "ro", label: "Rondônia (RO)" },
    { value: "am", label: "Amazonas (AM)" },
    { value: "ac", label: "Acre (AC)", disabled: true },
  ];

  it("renders options, toggles multiple selections, and displays error message", () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        label="Praças de Entrega"
        options={options}
        onChange={onChange}
        error="Selecione ao menos uma praça"
      />,
    );

    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("Selecione ao menos uma praça")).toBeInTheDocument();

    const roCheckbox = screen.getByLabelText("Rondônia (RO)");
    const amCheckbox = screen.getByLabelText("Amazonas (AM)");
    const acCheckbox = screen.getByLabelText("Acre (AC)");

    expect(acCheckbox).toBeDisabled();

    fireEvent.click(roCheckbox);
    expect(roCheckbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(["ro"]);

    fireEvent.click(amCheckbox);
    expect(amCheckbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(["ro", "am"]);
  });
});

describe("RadioGroupField", () => {
  const options = [
    { value: "retirada", label: "Retirada em loja" },
    { value: "entrega", label: "Entrega agendada" },
  ];

  it("renders radio options, updates selection, and exposes error state", () => {
    const onChange = vi.fn();
    render(
      <RadioGroupField
        label="Modalidade de Entrega"
        options={options}
        onChange={onChange}
        error="Escolha uma modalidade"
      />,
    );

    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Escolha uma modalidade")).toBeInTheDocument();

    const retirada = screen.getByLabelText("Retirada em loja");
    const entrega = screen.getByLabelText("Entrega agendada");

    fireEvent.click(entrega);
    expect(entrega).toBeChecked();
    expect(retirada).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith("entrega");
  });
});

describe("InputGroup", () => {
  it("renders addons, input, action button, and error message", () => {
    const onSearch = vi.fn();
    const onChange = vi.fn();

    render(
      <InputGroup label="Código do Produto" error="Código inválido">
        <InputGroupAddon align="inline-start">SKU</InputGroupAddon>
        <InputGroupInput
          placeholder="Ex: SOF-302"
          onChange={(e) => onChange(e.target.value)}
        />
        <InputGroupButton onClick={onSearch}>Buscar</InputGroupButton>
      </InputGroup>,
    );

    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("SKU")).toBeInTheDocument();
    expect(screen.getByText("Código inválido")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Ex: SOF-302");
    fireEvent.change(input, { target: { value: "COL-105" } });
    expect(onChange).toHaveBeenCalledWith("COL-105");

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
