import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TagsInput from "../../components/form/TagsInput";

describe("TagsInput", () => {
  it("adds tags on Enter and prevents duplicates by default", () => {
    const onChange = vi.fn();
    render(
      <TagsInput
        label="Categorias"
        placeholder="Digite uma categoria"
        onChange={onChange}
      />,
    );

    const input = screen.getByPlaceholderText("Digite uma categoria");

    fireEvent.change(input, { target: { value: "Sofás" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("Sofás")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(["Sofás"]);

    fireEvent.change(input, { target: { value: "Colchões" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("Colchões")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(["Sofás", "Colchões"]);

    fireEvent.change(input, { target: { value: "sofás" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenLastCalledWith(["Sofás", "Colchões"]);
  });

  it("removes a single tag via its remove button and clears all tags", () => {
    const onChange = vi.fn();
    render(
      <TagsInput
        label="Linhas"
        defaultValue={["Estofados", "Cozinhas", "Lavanderias"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remover Cozinhas" }));
    expect(screen.queryByText("Cozinhas")).not.toBeInTheDocument();
    expect(screen.getByText("Estofados")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(["Estofados", "Lavanderias"]);

    fireEvent.click(screen.getByRole("button", { name: "Remover todas as tags" }));
    expect(screen.queryByText("Estofados")).not.toBeInTheDocument();
    expect(screen.queryByText("Lavanderias")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
