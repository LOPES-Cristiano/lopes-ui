import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import ActionDialog from "@/components/ActionDialog";

type ActionButtonProps = {
  icon: React.ReactElement<{ className?: string }>;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost" | "destructive";
  confirm?: boolean | {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    // optionally override action
    onConfirm?: () => void | Promise<void>;
    // optional classNames to customize dialog
    dialogClassName?: string;
    overlayClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    confirmButtonClassName?: string;
    cancelButtonClassName?: string;
  };
  tooltip?: string; // texto do tooltip ao passar o mouse
  label?: string; // label visível ao lado, opcional
  className?: string;
  ariaLabel?: string; // para acessibilidade
  disabled?: boolean;
  componentId?: string;
};

const sizeMap = {
  sm: {
    hit: "p-1 min-w-[36px] min-h-[36px]",
    icon: "w-4 h-4",
  },
  md: {
    hit: "p-2 min-w-[44px] min-h-[44px]",
    icon: "w-5 h-5",
  },
  lg: {
    hit: "p-3 min-w-[56px] min-h-[56px]",
    icon: "w-6 h-6",
  },
};

export default function ActionButton({
  icon,
  onClick,
  size = "md",
  variant = "ghost",
  confirm,
  tooltip,
  label,
  className = "",
  ariaLabel,
  disabled = false,
  componentId,
}: ActionButtonProps) {
  const hit = sizeMap[size].hit;
  const iconSize = sizeMap[size].icon;

  const variantClasses: Record<string, string> = {
    solid: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
    outline: "bg-transparent border border-zinc-200 text-zinc-800 hover:bg-zinc-50",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-800",
    destructive: "bg-red-600 text-white hover:bg-red-500",
  };

  const clonedIcon = React.cloneElement(icon, {
    className: twMerge(icon.props.className ?? "", iconSize),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handlePress = () => {
    if (confirm) {
      setConfirmOpen(true);
      return;
    }
    if (onClick) onClick();
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      if (typeof confirm === "object" && confirm.onConfirm) {
        await confirm.onConfirm();
      } else if (onClick) {
        await onClick();
      }
    } catch (_) {
      // swallow
    }
  };

  return (
    <div className={"inline-flex items-center gap-2"}>
      <>
      <button
        type="button"
        onClick={handlePress}
        aria-label={ariaLabel ?? tooltip ?? label}
        disabled={disabled}
        className={twMerge(
          "group relative inline-flex items-center justify-center rounded-md active:translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
          variantClasses[variant],
          hit,
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        {...(componentId ? { ['data-component-id']: componentId } as any : {})}
      >
        {clonedIcon}

        {tooltip && (
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {tooltip}
          </span>
        )}
      </button>

      {confirm && (
        <ActionDialog
          open={confirmOpen}
          title={typeof confirm === "object" ? confirm.title : undefined}
          description={typeof confirm === "object" ? confirm.description : undefined}
          confirmLabel={typeof confirm === "object" ? confirm.confirmLabel : undefined}
          cancelLabel={typeof confirm === "object" ? confirm.cancelLabel : undefined}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(false)}
          dialogClassName={typeof confirm === "object" ? confirm.dialogClassName : undefined}
          overlayClassName={typeof confirm === "object" ? confirm.overlayClassName : undefined}
          titleClassName={typeof confirm === "object" ? confirm.titleClassName : undefined}
          descriptionClassName={typeof confirm === "object" ? confirm.descriptionClassName : undefined}
          confirmButtonClassName={typeof confirm === "object" ? confirm.confirmButtonClassName : undefined}
          cancelButtonClassName={typeof confirm === "object" ? confirm.cancelButtonClassName : undefined}
        />
      )}

      </>

      {label && <span className="text-sm select-none">{label}</span>}
    </div>
  );
}
