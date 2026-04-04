import React from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type ActionDialogProps = {
  componentId?: string;
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  // optional classNames to customize styles
  dialogClassName?: string;
  overlayClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
};

export default function ActionDialog({
  componentId,
  open,
  title = "Confirm",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  dialogClassName = "relative z-10 w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg",
  overlayClassName = "absolute inset-0 bg-black/40",
  titleClassName = "text-lg font-semibold",
  descriptionClassName = "mt-2 text-sm text-zinc-600",
  confirmButtonClassName = "rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500",
  cancelButtonClassName = "rounded-md px-3 py-1 text-sm hover:bg-zinc-100",
}: ActionDialogProps) {
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" {...(componentId ? { ['data-component-id']: componentId } as any : {})}>
      <div className={overlayClassName} onClick={onCancel} />
      <div className={dialogClassName}>
        <h3 className={titleClassName}>{title}</h3>
        {description && <p className={descriptionClassName}>{description}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            className={cancelButtonClassName}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={confirmButtonClassName}
            onClick={() => {
              void onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
