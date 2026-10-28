"use client";

import React from "react";
import {
  ToastBar,
  Toaster as HotToaster,
  toast as hotToast,
} from "react-hot-toast";
import type {
  Renderable,
  ToastOptions as HotToastOptions,
  ToastPosition,
} from "react-hot-toast";
import { motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

export type ToastType = "default" | "success" | "error" | "loading" | "warning" | "info";

export type ToastOptions = Omit<HotToastOptions, "duration" | "icon"> & {
  id?: string;
  /** Optional subtitle/description below the main message (Sonner / shadcn pattern) */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  duration?: number;
  /** Show an explicit × close button on the right */
  closeButton?: boolean;
  action?: { label: string; onClick: () => void; componentId?: string };
};

export type { ToastPosition };

type PromiseMsgs<T> = {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((err: unknown) => React.ReactNode);
};

export type ToastFn = {
  (message: React.ReactNode, opts?: ToastOptions): string;
  success: (m: React.ReactNode, o?: ToastOptions) => string;
  error: (m: React.ReactNode, o?: ToastOptions) => string;
  loading: (m: React.ReactNode, o?: ToastOptions) => string;
  warning: (m: React.ReactNode, o?: ToastOptions) => string;
  info: (m: React.ReactNode, o?: ToastOptions) => string;
  dismiss: (id?: string) => void;
  remove: (id?: string) => void;
  promise: <T>(p: Promise<T>, msgs: PromiseMsgs<T>, opts?: ToastOptions) => Promise<T>;
};

const DEFAULT_DURATION = 4_000;
let toastLimit = 5;
let activeToastIds: string[] = [];
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearToastTimer(id?: string) {
  if (id) {
    const existing = toastTimers.get(id);
    if (existing !== undefined) {
      clearTimeout(existing);
      toastTimers.delete(id);
    }
  } else {
    toastTimers.forEach((timer) => clearTimeout(timer));
    toastTimers.clear();
  }
}

const successIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-emerald-500">
    <CheckCircle2 size={18} strokeWidth={2.25} />
  </span>
);
const errorIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-red-500">
    <XCircle size={18} strokeWidth={2.25} />
  </span>
);
const loadingIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-indigo-500">
    <Loader2 size={18} strokeWidth={2.25} className="animate-spin" />
  </span>
);
const warningIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-amber-500">
    <AlertTriangle size={18} strokeWidth={2.25} />
  </span>
);
const infoIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sky-500">
    <Info size={18} strokeWidth={2.25} />
  </span>
);

function normalizeDuration(duration?: number, fallback = DEFAULT_DURATION) {
  if (duration === 0) return Infinity;
  return duration ?? fallback;
}

function asRenderable(value: React.ReactNode): Renderable {
  if (value == null || typeof value === "string" || React.isValidElement(value)) {
    return value as Renderable;
  }

  return String(value);
}

function asHotIcon(icon: React.ReactNode): Renderable | undefined {
  if (icon == null) return undefined;
  return asRenderable(icon);
}

function buildToastContent(
  message: React.ReactNode,
  opts: ToastOptions,
  id?: string,
): Renderable {
  const { description, action, closeButton } = opts;

  if (!description && !action && !closeButton) {
    return asRenderable(message);
  }

  return (
    <span className="flex min-w-0 flex-1 items-start gap-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={twMerge("min-w-0 break-words text-sm leading-snug", description ? "font-semibold" : "")}>
          {message}
        </span>
        {description && (
          <span className="min-w-0 break-words text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </span>
        )}
      </span>
      {action && (
        <button
          data-component-id={action.componentId ?? "erp.toast.action"}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
            if (id) dismissToast(id);
          }}
          className="mt-0.5 shrink-0 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
        >
          {action.label}
        </button>
      )}
      {closeButton && id && (
        <button
          data-component-id="erp.toast.close"
          type="button"
          aria-label="Fechar notificação"
          onClick={(e) => {
            e.stopPropagation();
            dismissToast(id);
          }}
          className="mt-0.5 shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
}

function toHotOptions(opts: ToastOptions = {}, fallbackDuration?: number): HotToastOptions {
  const hotOptions = { ...opts } as Partial<ToastOptions>;
  const duration = hotOptions.duration;
  const icon = hotOptions.icon;

  delete hotOptions.action;
  delete hotOptions.description;
  delete hotOptions.closeButton;
  delete hotOptions.duration;
  delete hotOptions.icon;

  return {
    ...(hotOptions as HotToastOptions),
    duration: normalizeDuration(duration, fallbackDuration),
    icon: asHotIcon(icon),
  };
}

function rememberToast(id: string) {
  activeToastIds = [...activeToastIds.filter((toastId) => toastId !== id), id];

  while (activeToastIds.length > toastLimit) {
    const staleId = activeToastIds.shift();
    if (staleId) {
      clearToastTimer(staleId);
      hotToast.dismiss(staleId);
    }
  }
}

function dismissToast(id?: string) {
  clearToastTimer(id);
  activeToastIds = id ? activeToastIds.filter((toastId) => toastId !== id) : [];
  hotToast.dismiss(id);
}

function removeToast(id?: string) {
  clearToastTimer(id);
  activeToastIds = id ? activeToastIds.filter((toastId) => toastId !== id) : [];
  hotToast.remove(id);
}

function show(
  type: ToastType,
  message: React.ReactNode,
  opts: ToastOptions = {},
  fallbackDuration = DEFAULT_DURATION,
): string {
  const needsGeneratedId = (opts.action || opts.closeButton || opts.description) && !opts.id;
  const toastOptions = needsGeneratedId ? { ...opts, id: Math.random().toString(36).slice(2, 10) } : opts;
  const hotOptions = toHotOptions(toastOptions, fallbackDuration);
  const content = buildToastContent(message, toastOptions, toastOptions.id);

  let toastId: string;
  switch (type) {
    case "success":
      toastId = hotToast(content, { ...hotOptions, icon: hotOptions.icon ?? successIcon });
      break;
    case "error":
      toastId = hotToast(content, { ...hotOptions, icon: hotOptions.icon ?? errorIcon });
      break;
    case "loading":
      toastId = hotToast(content, {
        ...toHotOptions(toastOptions, Infinity),
        icon: hotOptions.icon ?? loadingIcon,
      });
      break;
    case "warning":
      toastId = hotToast(content, { ...hotOptions, icon: hotOptions.icon ?? warningIcon });
      break;
    case "info":
      toastId = hotToast(content, { ...hotOptions, icon: hotOptions.icon ?? infoIcon });
      break;
    default:
      toastId = hotToast(content, hotOptions);
      break;
  }

  clearToastTimer(toastId);

  if (type !== "loading" && hotOptions.duration && hotOptions.duration !== Infinity) {
    const timer = setTimeout(() => {
      toastTimers.delete(toastId);
      activeToastIds = activeToastIds.filter((id) => id !== toastId);
      hotToast.dismiss(toastId);
    }, hotOptions.duration);
    toastTimers.set(toastId, timer);
  }

  return rememberAndReturn(toastId);
}

function rememberAndReturn(id: string) {
  rememberToast(id);
  return id;
}

const toast: ToastFn = Object.assign(
  (message: React.ReactNode, opts?: ToastOptions) => show("default", message, opts),
  {
    success: (message: React.ReactNode, opts?: ToastOptions) => show("success", message, opts),
    error: (message: React.ReactNode, opts?: ToastOptions) => show("error", message, opts),
    loading: (message: React.ReactNode, opts?: ToastOptions) => show("loading", message, opts),
    warning: (message: React.ReactNode, opts?: ToastOptions) => show("warning", message, opts),
    info: (message: React.ReactNode, opts?: ToastOptions) => show("info", message, opts),
    dismiss: dismissToast,
    remove: removeToast,
    promise: <T,>(promise: Promise<T>, msgs: PromiseMsgs<T>, opts?: ToastOptions): Promise<T> => {
      const id = show("loading", msgs.loading, { ...opts, duration: 0 });

      promise
        .then((data) => {
          const message =
            typeof msgs.success === "function"
              ? (msgs.success as (value: T) => React.ReactNode)(data)
              : msgs.success;
          show("success", message, { ...opts, id });
        })
        .catch((err: unknown) => {
          const message =
            typeof msgs.error === "function"
              ? (msgs.error as (error: unknown) => React.ReactNode)(err)
              : msgs.error;
          show("error", message, { ...opts, id });
        });

      return promise;
    },
  },
);

export default toast;
export { toast };

export type ToasterProps = {
  position?: ToastPosition;
  mobilePosition?: ToastPosition;
  maxToasts?: number;
};

export function Toaster({
  position = "top-right",
  mobilePosition = "bottom-center",
  maxToasts = 5,
}: ToasterProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    toastLimit = maxToasts;
  }, [maxToasts]);

  React.useEffect(() => {
    const updateMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 1024);
    };
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const activePosition: ToastPosition = isMobile ? mobilePosition : position;
  const isTop = activePosition.startsWith("top");

  return (
    <HotToaster
      position={activePosition}
      reverseOrder={isTop}
      gutter={8}
      containerClassName="lopes-ui-toaster"
      containerStyle={{
        top: isTop ? (isMobile ? 16 : 56) : "auto",
        bottom: !isTop ? (isMobile ? 24 : 32) : "auto",
        zIndex: 99999,
        pointerEvents: "none",
      }}
      toastOptions={{
        duration: DEFAULT_DURATION,
        className: "lopes-ui-toast",
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 18px 45px rgb(15 23 42 / 0.14)",
          fontSize: 13,
          lineHeight: "18px",
          maxWidth: "min(450px, 92vw)",
          padding: "10px 14px",
        },
      }}
    >
      {(t) => (
        <motion.div
          onClick={() => dismissToast(t.id)}
          initial={{
            opacity: 0,
            y: isTop ? -26 : 26,
            scale: 0.92,
          }}
          animate={{
            opacity: t.visible ? 1 : 0,
            y: t.visible ? 0 : isTop ? -18 : 18,
            scale: t.visible ? 1 : 0.94,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 24,
            mass: 0.5,
          }}
          whileTap={{ scale: 0.98 }}
          role="button"
          tabIndex={0}
          aria-label="Clique para fechar notificação"
          className="cursor-pointer select-none"
          style={{
            pointerEvents: "auto",
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        >
          <ToastBar
            toast={t}
            style={{
              ...t.style,
              animation: "none",
              cursor: "pointer",
            }}
          >
            {({ icon, message }) => (
              <div className="flex w-full items-start gap-2.5">
                {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
                <div className="min-w-0 flex-1 [&>div]:!m-0 [&>div]:!p-0">
                  {message}
                </div>
              </div>
            )}
          </ToastBar>
        </motion.div>
      )}
    </HotToaster>
  );
}

export type ToastPreviewProps = {
  type?: ToastType;
  message: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: { label: string; onClick?: () => void; componentId?: string };
  closeButton?: boolean;
  onClose?: () => void;
  showBar?: boolean;
  className?: string;
};

const previewConfig: Record<ToastType, { icon: React.ReactNode; bar: string }> = {
  default: { icon: null, bar: "bg-zinc-400 dark:bg-zinc-600" },
  success: { icon: successIcon, bar: "bg-emerald-500" },
  error: { icon: errorIcon, bar: "bg-red-500" },
  loading: { icon: loadingIcon, bar: "bg-indigo-500" },
  warning: { icon: warningIcon, bar: "bg-amber-500" },
  info: { icon: infoIcon, bar: "bg-sky-500" },
};

export function ToastPreview({
  type = "default",
  message,
  description,
  icon,
  action,
  closeButton = false,
  onClose,
  showBar = true,
  className,
}: ToastPreviewProps) {
  const cfg = previewConfig[type];
  const iconNode = icon !== undefined ? icon : cfg.icon;

  return (
    <div className={twMerge("w-full max-w-sm", className)}>
      <div
        className={twMerge(
          "relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3.5 shadow-lg shadow-zinc-950/[0.06]",
          "border-zinc-200/90 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
        )}
      >
        {showBar && (
          <div className={twMerge("absolute inset-y-0 left-0 w-1", cfg.bar)} />
        )}
        {iconNode ? <span className="mt-0.5 shrink-0">{iconNode}</span> : null}
        <div className="min-w-0 flex-1">
          <div
            className={twMerge(
              "break-words text-sm leading-snug",
              description ? "font-semibold" : "font-medium",
            )}
          >
            {message}
          </div>
          {description && (
            <div className="mt-0.5 break-words text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </div>
          )}
        </div>
        {action ? (
          <button
            data-component-id={action.componentId ?? "erp.toast.preview-action"}
            type="button"
            onClick={action.onClick}
            className="mt-0.5 shrink-0 whitespace-nowrap rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            {action.label}
          </button>
        ) : null}
        {closeButton ? (
          <button
            data-component-id="erp.toast.preview-close"
            type="button"
            onClick={onClose}
            aria-label="Fechar notificação"
            className="mt-0.5 shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
