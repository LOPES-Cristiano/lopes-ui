"use client";

import { useCallback, useState } from "react";

export interface UseUnsavedChangesGuardOptions {
  /** Whether the guarded modal/drawer is currently open */
  open: boolean;
  /** Whether the form has unsaved modifications */
  isDirty?: boolean;
  /** Whether a save operation is already in progress */
  saving?: boolean;
  /** Enable/disable the confirmation dialog when closing while dirty. Default: true */
  confirmOnDirtyClose?: boolean;
  /** Underlying close callback executed when clean or after user confirms discard/save */
  onClose: () => void;
  /** Optional save callback. When provided, the dialog offers a "Salvar e fechar" option */
  onSave?: () => void | Promise<void>;
}

export interface UseUnsavedChangesGuardReturn {
  /** Guarded close handler to wire into backdrop, ESC, close button, and Cancel */
  requestClose: () => void;
  /** Whether the unsaved-changes confirmation dialog is currently open */
  isConfirmOpen: boolean;
  /** True while saving was triggered from the confirmation dialog */
  isSavingFromGuard: boolean;
  /** Closes the confirmation dialog and keeps editing */
  handleContinueEditing: () => void;
  /** Discards changes and invokes onClose */
  handleDiscard: () => void;
  /** Invokes onSave (if provided) and closes the dialog on success */
  handleSaveAndClose: () => Promise<void>;
}

/**
 * Intercepts close attempts on forms (Drawer, FormDrawer, FormModal) when `isDirty` is true,
 * opening a confirmation dialog with "Salvar e fechar" (when `onSave` is provided),
 * "Continuar editando", and "Descartar alterações".
 */
export function useUnsavedChangesGuard({
  open,
  isDirty = false,
  saving = false,
  confirmOnDirtyClose = true,
  onClose,
  onSave,
}: UseUnsavedChangesGuardOptions): UseUnsavedChangesGuardReturn {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSavingFromGuard, setIsSavingFromGuard] = useState(false);

  const isBusy = saving || isSavingFromGuard;

  // Reset confirmation dialog whenever the parent overlay closes
  // (adjusting state during render avoids a cascading effect render)
  if (!open && isConfirmOpen) {
    setIsConfirmOpen(false);
  }

  const requestClose = useCallback(() => {
    if (isBusy) return;
    if (confirmOnDirtyClose && isDirty) {
      setIsConfirmOpen(true);
      return;
    }
    onClose();
  }, [confirmOnDirtyClose, isBusy, isDirty, onClose]);

  const handleContinueEditing = useCallback(() => {
    if (isBusy) return;
    setIsConfirmOpen(false);
  }, [isBusy]);

  const handleDiscard = useCallback(() => {
    if (isBusy) return;
    setIsConfirmOpen(false);
    onClose();
  }, [isBusy, onClose]);

  const handleSaveAndClose = useCallback(async () => {
    if (!onSave || isBusy) return;
    setIsSavingFromGuard(true);
    try {
      await onSave();
      setIsConfirmOpen(false);
    } catch {
      // Keep the form open so the user can see/fix validation or server errors
      setIsConfirmOpen(false);
    } finally {
      setIsSavingFromGuard(false);
    }
  }, [isBusy, onSave]);

  return {
    requestClose,
    isConfirmOpen,
    isSavingFromGuard,
    handleContinueEditing,
    handleDiscard,
    handleSaveAndClose,
  };
}

function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return "";
  }
}

/**
 * Captures an initial snapshot of a controlled form state when `open` becomes true
 * (or `resetKey` changes) and returns `true` whenever the current value diverges from it.
 */
export function useDirtySnapshot(
  open: boolean,
  value: unknown,
  resetKey?: string | number | null
): boolean {
  const serialized = safeSerialize(value);
  const trackingKey = open ? `open:${resetKey ?? ""}` : "closed";
  const [prevKey, setPrevKey] = useState(trackingKey);
  const [baseline, setBaseline] = useState<string | null>(() => (open ? serialized : null));

  if (prevKey !== trackingKey) {
    setPrevKey(trackingKey);
    setBaseline(open ? serialized : null);
  }

  return open && baseline !== null && serialized !== baseline;
}

export default useUnsavedChangesGuard;
