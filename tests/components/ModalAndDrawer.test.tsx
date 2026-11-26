import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Modal from "../../components/Modal";
import Drawer from "../../components/Drawer";

describe("Modal", () => {
  it("does not render when closed and renders title and body when open", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open={false} onClose={onClose} title="Detalhes do Pedido">
        <p>Conteúdo do modal</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Modal
        open={true}
        onClose={onClose}
        title="Detalhes do Pedido"
        description="Resumo da venda de móveis"
      >
        <p>Conteúdo do modal</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Detalhes do Pedido")).toBeInTheDocument();
    expect(screen.getByText("Resumo da venda de móveis")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do modal")).toBeInTheDocument();
  });

  it("calls onClose when clicking the close button or pressing Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirmar Entrega">
        <p>Corpo do modal</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("Drawer", () => {
  it("does not render when closed and renders title and content when open", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Drawer open={false} onClose={onClose} title="Cadastro de Produto">
        <p>Formulário do produto</p>
      </Drawer>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Drawer
        open={true}
        onClose={onClose}
        title="Cadastro de Produto"
        description="Linha de estofados e colchões"
      >
        <p>Formulário do produto</p>
      </Drawer>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Cadastro de Produto")).toBeInTheDocument();
    expect(screen.getByText("Linha de estofados e colchões")).toBeInTheDocument();
    expect(screen.getByText("Formulário do produto")).toBeInTheDocument();
  });

  it("calls onClose when clicking the close button or pressing Escape", () => {
    const onClose = vi.fn();
    render(
      <Drawer open={true} onClose={onClose} title="Filtros de Estoque">
        <p>Opções de filtro</p>
      </Drawer>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
