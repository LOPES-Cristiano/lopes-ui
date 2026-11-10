"use client";

import React from "react";
import EmptyState, { type EmptyStateProps } from "./EmptyState";
import Result, { type ResultProps } from "./Result";
import { StatusPage, type StatusPageProps } from "./StatusPage";

/** Lista/área vazia, sem resultados, sem acesso, offline… (antigo EmptyState). */
export type StateEmptyProps = EmptyStateProps & { kind?: "empty" };

/** Resultado de uma operação: sucesso, aviso, erro, 403/404/500 (antigo Result). */
export type StateResultProps = ResultProps & { kind: "result" };

/** Página inteira de status: 401/403/404/500 (antigo StatusPage). */
export type StatePageProps = StatusPageProps & { kind: "page" };

export type StateProps = StateEmptyProps | StateResultProps | StatePageProps;

/**
 * Estado unificado de interface.
 *
 * - `kind="empty"` (padrão): área vazia/sem dados, com `preset` e `actions`.
 * - `kind="result"`: resultado de uma ação, com `status`, `title` e `extra`.
 * - `kind="page"`: página de status em tela cheia, com `variant`.
 */
export default function State(props: StateProps) {
  if (props.kind === "page") {
    const { kind: _kind, ...rest } = props;
    void _kind;
    return <StatusPage {...rest} />;
  }
  if (props.kind === "result") {
    const { kind: _kind, ...rest } = props;
    void _kind;
    return <Result {...rest} />;
  }
  const { kind: _kind, ...rest } = props;
  void _kind;
  return <EmptyState {...rest} />;
}

export { State };
