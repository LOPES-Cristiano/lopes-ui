"use client";

import React from "react";
import ConfirmDialog, { type ConfirmDialogProps } from "./ConfirmDialog";
import PasswordConfirmDialog, { type PasswordConfirmDialogProps } from "./PasswordConfirmDialog";
import Popconfirm, { type PopconfirmProps } from "./Popconfirm";

/**
 * Tom semântico único para qualquer tipo de confirmação.
 * Cada modo converte para o vocabulário do seu motor interno.
 */
export type ConfirmTone = "primary" | "info" | "warning" | "danger";

/** Janela modal centralizada (padrão). */
export type ConfirmDialogModeProps = Omit<ConfirmDialogProps, "variant"> & {
  mode?: "dialog";
  tone?: ConfirmTone;
};

/** Popover ancorado ao elemento (filho) que dispara a confirmação. */
export type ConfirmPopoverModeProps = Omit<PopconfirmProps, "variant"> & {
  mode: "popover";
  tone?: ConfirmTone;
};

/** Modal que exige senha (e opcionalmente usuário e justificativa). */
export type ConfirmPasswordModeProps = Omit<PasswordConfirmDialogProps, "tone"> & {
  mode: "password";
  tone?: Exclude<ConfirmTone, "info">;
};

export type ConfirmProps = ConfirmDialogModeProps | ConfirmPopoverModeProps | ConfirmPasswordModeProps;

const DIALOG_TONE = { primary: "info", info: "info", warning: "warning", danger: "danger" } as const;

/**
 * Confirmação unificada.
 *
 * - `mode="dialog"` (padrão): modal de confirmação.
 * - `mode="popover"`: confirmação leve ancorada no gatilho (`children`).
 * - `mode="password"`: confirmação com senha, usuário supervisor e justificativa.
 */
export default function Confirm(props: ConfirmProps) {
  if (props.mode === "popover") {
    const { mode: _mode, tone = "warning", ...rest } = props;
    void _mode;
    return <Popconfirm {...rest} variant={tone} />;
  }
  if (props.mode === "password") {
    const { mode: _mode, tone = "primary", ...rest } = props;
    void _mode;
    return <PasswordConfirmDialog {...rest} tone={tone} />;
  }
  const { mode: _mode, tone = "danger", ...rest } = props;
  void _mode;
  return <ConfirmDialog {...rest} variant={DIALOG_TONE[tone]} />;
}

export { Confirm };
