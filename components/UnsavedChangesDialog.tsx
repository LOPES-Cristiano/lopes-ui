"use client";

import React from "react";
import { AlertTriangle, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./primitives/alert-dialog";
import Button from "./Button";
import { useEscKey } from "./Modal";
import { hasOpenFloatingOverlay } from "../utils/overlay";
import { cn } from "../utils/cn";

export interface UnsavedChangesDialogProps {
  open: boolean;
  /** Called when user chooses to continue editing (or presses ESC) */
  onContinue: () => void;
  /** Called when user confirms discarding unsaved changes */
  onDiscard: () => void;
  /** Optional save handler. When provided, renders the "Salvar e fechar" button */
  onSave?: () => void | Promise<void>;
  /** Loading state for the save action */
  saving?: boolean;
  title?: string;
  description?: string;
  saveLabel?: string;
  continueLabel?: string;
  discardLabel?: string;
  className?: string;
  componentId?: string;
}

/**
 * Diálogo de proteção contra fechamento acidental de formulários com alterações não salvas,
 * seguindo exatamente a linguagem visual do `ConfirmDialog` do `lopes-ui` / `lopes-web`.
 */
export default function UnsavedChangesDialog({
  open,
  onContinue,
  onDiscard,
  onSave,
  saving = false,
  title = "Descartar alterações não salvas?",
  description = "Existem campos modificados neste formulário. Se fechar agora, as alterações feitas serão perdidas.",
  saveLabel = "Salvar e fechar",
  continueLabel = "Continuar editando",
  discardLabel,
  className,
  componentId,
}: UnsavedChangesDialogProps) {
  const hasSaveOption = Boolean(onSave);
  const resolvedDiscardLabel = discardLabel ?? (hasSaveOption ? "Descartar" : "Descartar e fechar");

  useEscKey(() => {
    if (!saving && !hasOpenFloatingOverlay()) {
      onContinue();
    }
  }, open);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) {
          onContinue();
        }
      }}
    >
      <AlertDialogContent
        overlayClassName="fixed inset-0 z-[7800] bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
        onEscapeKeyDown={(e) => {
          if (saving || hasOpenFloatingOverlay()) {
            e.preventDefault();
          }
        }}
        data-component-id={componentId ? `${componentId}.unsaved-dialog` : "erp.unsaved-changes-dialog"}
        className={cn(
          "w-[calc(100vw-2rem)] sm:w-full bg-card border border-border text-card-foreground shadow-[var(--shadow-overlay)] rounded-2xl p-6 flex flex-col gap-0 overflow-hidden",
          hasSaveOption ? "sm:max-w-[540px]" : "sm:max-w-[480px]",
          className
        )}
      >
        {/* Header — mesmo padrão visual do ConfirmDialog */}
        <div className="flex items-start gap-3.5 pb-4">
          <div className="shrink-0 flex items-center justify-center h-11 w-11 rounded-full bg-warning-soft text-warning-soft-foreground border border-warning-border/50">
            <AlertTriangle size={20} className="text-warning" strokeWidth={1.75} />
          </div>

          <AlertDialogHeader className="min-w-0 text-left space-y-1.5">
            <AlertDialogTitle className="text-base font-bold text-foreground leading-snug text-balance">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed text-pretty">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Footer — mesmo separador e ritmo do ConfirmDialog */}
        <AlertDialogFooter
          className={cn(
            "flex flex-col-reverse sm:flex-row sm:items-center gap-2.5 sm:space-x-0 pt-3.5 border-t border-border/40",
            hasSaveOption ? "sm:justify-between" : "sm:justify-end"
          )}
        >
          {hasSaveOption ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={saving}
                onClick={onDiscard}
                className="text-muted-foreground hover:text-danger hover:bg-danger-soft w-full sm:w-auto justify-center"
                data-component-id={componentId ? `${componentId}.unsaved.discard` : "erp.unsaved.discard"}
              >
                {resolvedDiscardLabel}
              </Button>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled={saving}
                  onClick={onContinue}
                  className="w-full sm:w-auto justify-center"
                  data-component-id={componentId ? `${componentId}.unsaved.continue` : "erp.unsaved.continue"}
                >
                  {continueLabel}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  loading={saving}
                  onClick={() => {
                    void onSave?.();
                  }}
                  leftIcon={<Check className="h-4 w-4" />}
                  className="w-full sm:w-auto justify-center"
                  data-component-id={componentId ? `${componentId}.unsaved.save` : "erp.unsaved.save"}
                >
                  {saveLabel}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={saving}
                onClick={onContinue}
                className="w-full sm:w-auto justify-center"
                data-component-id={componentId ? `${componentId}.unsaved.continue` : "erp.unsaved.continue"}
              >
                {continueLabel}
              </Button>

              <Button
                type="button"
                variant="warning"
                size="md"
                disabled={saving}
                onClick={onDiscard}
                className="w-full sm:w-auto justify-center"
                data-component-id={componentId ? `${componentId}.unsaved.discard` : "erp.unsaved.discard"}
              >
                {resolvedDiscardLabel}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { UnsavedChangesDialog };
