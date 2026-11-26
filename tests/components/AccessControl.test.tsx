import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessControlProvider } from "../../components/useAccessControl";
import Can from "../../components/Can";
import AccessGuard from "../../components/AccessGuard";

describe("AccessControl (Can & AccessGuard)", () => {
  it("renders allowed content and hides or falls back when denied in Can", () => {
    render(
      <AccessControlProvider
        initialTasks={["ESTOQUE.VIEW", "PEDIDOS.CRIAR"]}
        permissionsMap={{
          "erp.pedidos.btn.novo": "PEDIDOS.CRIAR",
          "erp.financeiro.btn.estornar": "FINANCEIRO.ESTORNAR",
        }}
      >
        <Can componentId="erp.pedidos.btn.novo">
          <button type="button">Novo Pedido</button>
        </Can>
        <Can
          componentId="erp.financeiro.btn.estornar"
          fallback={<span>Sem permissão para estornar</span>}
        >
          <button type="button">Estornar</button>
        </Can>
        <Can task="ESTOQUE.VIEW">
          <span>Estoque visível</span>
        </Can>
        <Can task="ESTOQUE.EDITAR">
          <span>Editar estoque</span>
        </Can>
      </AccessControlProvider>,
    );

    expect(screen.getByRole("button", { name: "Novo Pedido" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Estornar" })).not.toBeInTheDocument();
    expect(screen.getByText("Sem permissão para estornar")).toBeInTheDocument();
    expect(screen.getByText("Estoque visível")).toBeInTheDocument();
    expect(screen.queryByText("Editar estoque")).not.toBeInTheDocument();
  });

  it("allows AccessGuard content when permitted and blocks with fallback or default denied state when denied", () => {
    render(
      <AccessControlProvider initialTasks={["VENDAS.VIEW"]}>
        <AccessGuard task="VENDAS.VIEW">
          <div>Painel de Vendas</div>
        </AccessGuard>

        <AccessGuard
          task="AUDITORIA.VIEW"
          fallback={<div role="alert">Bloqueado por permissão</div>}
        >
          <div>Relatório de Auditoria</div>
        </AccessGuard>

        <AccessGuard allOf={["VENDAS.VIEW", "VENDAS.APROVAR"]} deniedProps={{ resourceName: "Aprovação de Descontos" }}>
          <div>Aprovação de Descontos</div>
        </AccessGuard>
      </AccessControlProvider>,
    );

    expect(screen.getByText("Painel de Vendas")).toBeInTheDocument();
    expect(screen.queryByText("Relatório de Auditoria")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Bloqueado por permissão");
    expect(screen.queryByText("Aprovação de Descontos")).not.toBeInTheDocument();
    expect(screen.getByText("Acesso restrito")).toBeInTheDocument();
  });

  it("grants full access when initialIsAdmin is true", () => {
    render(
      <AccessControlProvider initialTasks={[]} initialIsAdmin={true}>
        <AccessGuard task="SISTEMA.CONFIG">
          <div>Configurações do Sistema</div>
        </AccessGuard>
      </AccessControlProvider>,
    );

    expect(screen.getByText("Configurações do Sistema")).toBeInTheDocument();
  });
});
