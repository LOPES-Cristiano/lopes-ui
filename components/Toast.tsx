"use client";

import React from "react";
import {
  CheckmarkIcon,
  ErrorIcon,
  LoaderIcon,
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
import { AlertTriangle, Info } from "lucide-react";
import { twMerge } from "tailwind-merge";

export type ToastType = "default" | "success" | "error" | "loading" | "warning" | "info";

export type ToastOptions = Omit<HotToastOptions, "duration" | "icon"> & {
  id?: string;
  icon?: React.ReactNode;
  duration?: number;
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

const warningIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-amber-500">
    <AlertTriangle size={18} strokeWidth={2.35} />
  </span>
);
const infoIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sky-500">
    <Info size={18} strokeWidth={2.35} />
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

function withAction(message: React.ReactNode, action?: ToastOptions["action"], id?: string): Renderable {
  const content = asRenderable(message);

  if (!action) return content;

  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="min-w-0 flex-1 break-words">{content}</span>
      <button
        data-component-id={action.componentId ?? 'erp.toast.action'}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          action.onClick();
          if (id) hotToast.dismiss(id);
        }}
        className="shrink-0 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
      >
        {action.label}
      </button>
    </span>
  );
}

function toHotOptions(opts: ToastOptions = {}, fallbackDuration?: number): HotToastOptions {
  const hotOptions = { ...opts } as Partial<ToastOptions>;
  const duration = hotOptions.duration;
  const icon = hotOptions.icon;

  delete hotOptions.action;
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
    if (staleId) hotToast.dismiss(staleId);
  }
}

function dismissToast(id?: string) {
  activeToastIds = id ? activeToastIds.filter((toastId) => toastId !== id) : [];
  hotToast.dismiss(id);
}

function removeToast(id?: string) {
  activeToastIds = id ? activeToastIds.filter((toastId) => toastId !== id) : [];
  hotToast.remove(id);
}

function show(
  type: ToastType,
  message: React.ReactNode,
  opts: ToastOptions = {},
  fallbackDuration = DEFAULT_DURATION,
): string {
  const toastOptions = opts.action && !opts.id ? { ...opts, id: Math.random().toString(36).slice(2, 10) } : opts;
  const hotOptions = toHotOptions(toastOptions, fallbackDuration);
  const content = withAction(message, toastOptions.action, toastOptions.id);

  let toastId: string;
  switch (type) {
    case "success":
      toastId = hotToast.success(content, hotOptions);
      break;
    case "error":
      toastId = hotToast.error(content, hotOptions);
      break;
    case "loading":
      toastId = hotToast.loading(content, toHotOptions(toastOptions, Infinity));
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

  // Garantia absoluta de auto-dismiss: caso eventos de hover ou touch em mobile segurem o timer do react-hot-toast,
  // força a remoção após a duração configurada (padrão 4000ms ou opts.duration)
  if (type !== "loading" && hotOptions.duration && hotOptions.duration !== Infinity) {
    setTimeout(() => {
      hotToast.dismiss(toastId);
    }, hotOptions.duration);
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
      containerClassName="biglar-hot-toaster"
      containerStyle={{
        top: isTop ? (isMobile ? 16 : 56) : "auto",
        bottom: !isTop ? (isMobile ? 24 : 32) : "auto",
        zIndex: 99999,
        pointerEvents: "none",
      }}
      toastOptions={{
        duration: DEFAULT_DURATION,
        className: "biglar-hot-toast",
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 18px 45px rgb(15 23 42 / 0.16)",
          fontSize: 13,
          lineHeight: "18px",
          maxWidth: "min(450px, 92vw)",
          padding: "10px 14px",
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "#ffffff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
        },
        loading: {
          duration: Infinity,
          iconTheme: { primary: "#6366f1", secondary: "#ffffff" },
        },
      }}
    >
      {(t) => (
        <motion.div
          onClick={() => hotToast.dismiss(t.id)}
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
              <>
                {icon}
                {message}
              </>
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
  icon?: React.ReactNode;
  action?: { label: string; onClick?: () => void; componentId?: string };
  showBar?: boolean;
};

const previewConfig: Record<ToastType, { icon: React.ReactNode; bar: string }> = {
  default: { icon: null, bar: "bg-zinc-300" },
  success: { icon: <CheckmarkIcon primary="#10b981" secondary="#ffffff" />, bar: "bg-emerald-500" },
  error: { icon: <ErrorIcon primary="#ef4444" secondary="#ffffff" />, bar: "bg-red-500" },
  loading: { icon: <LoaderIcon primary="#6366f1" secondary="#ffffff" />, bar: "bg-indigo-500" },
  warning: { icon: warningIcon, bar: "bg-amber-500" },
  info: { icon: infoIcon, bar: "bg-sky-500" },
};

export function ToastPreview({
  type = "default",
  message,
  icon,
  action,
  showBar = true,
}: ToastPreviewProps) {
  const cfg = previewConfig[type];
  const iconNode = icon ?? cfg.icon;

  return (
    <div className="w-80 sm:w-96">
      <div
        className={twMerge(
          "relative flex items-start gap-3 overflow-hidden border px-4 py-3.5 shadow-2xl shadow-zinc-900/[0.12]",
          "border-zinc-100 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
        )}
      >
        <div className={twMerge("absolute inset-y-0 left-0 w-[3px]", cfg.bar)} />
        {iconNode ? <span className="mt-px shrink-0">{iconNode}</span> : null}
        <span className="min-w-0 flex-1 break-words text-sm leading-snug">{message}</span>
        {action ? (
          <button
            data-component-id={action.componentId ?? 'erp.toast.preview-action'}
            type="button"
            onClick={action.onClick}
            className="mt-px shrink-0 whitespace-nowrap text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
          >
            {action.label}
          </button>
        ) : null}
        {showBar ? <div className={twMerge("absolute inset-x-0 bottom-0 h-[3px] w-3/5 opacity-40", cfg.bar)} /> : null}
      </div>
    </div>
  );
}
