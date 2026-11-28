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
import { motion, useReducedMotion } from "motion/react";
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
export type ToastVariant = "default" | "animated";

export type ToastOptions = Omit<HotToastOptions, "duration" | "icon"> & {
  id?: string;
  /** Optional subtitle/description below the main message (Sonner / shadcn pattern) */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  duration?: number;
  /** Show an explicit × close button on the right */
  closeButton?: boolean;
  /** Visual and motion preset ("animated" adds spring physics, swipe-to-dismiss, icon halo and glow) */
  variant?: ToastVariant;
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
const interactiveToastIds = new Set<string>();
const toastMeta = new Map<
  string,
  { type: ToastType; duration: number; variant?: ToastVariant; hasCustomIcon?: boolean }
>();

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
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-success">
    <CheckCircle2 size={18} strokeWidth={2.25} />
  </span>
);
const errorIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-danger">
    <XCircle size={18} strokeWidth={2.25} />
  </span>
);
const loadingIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-brand">
    <Loader2 size={18} strokeWidth={2.25} className="animate-spin" />
  </span>
);
const warningIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-warning">
    <AlertTriangle size={18} strokeWidth={2.25} />
  </span>
);
const infoIcon = (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-info">
    <Info size={18} strokeWidth={2.25} />
  </span>
);

const toastProgressColors: Record<ToastType, string> = {
  default: "bg-muted-foreground/45",
  success: "bg-success",
  error: "bg-danger",
  loading: "bg-brand",
  warning: "bg-warning",
  info: "bg-info",
};

const toastAnimatedProgressColors: Record<ToastType, string> = {
  default: "bg-zinc-600 dark:bg-zinc-400",
  success: "bg-emerald-500",
  error: "bg-red-500",
  loading: "bg-zinc-800 dark:bg-zinc-200",
  warning: "bg-amber-500",
  info: "bg-sky-500",
};

function AnimatedToastIcon({
  type,
  reducedMotion,
}: {
  type: ToastType;
  reducedMotion: boolean;
}) {
  if (type === "default") return null;

  if (type === "loading") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-zinc-800 dark:text-zinc-200">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeOpacity="0.18"
          />
          <motion.circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="20 42"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            style={{ transformOrigin: "12px 12px" }}
          />
        </svg>
      </span>
    );
  }

  const circleFill: Record<Exclude<ToastType, "default" | "loading">, string> = {
    success: "fill-emerald-500",
    error: "fill-red-500",
    warning: "fill-amber-500",
    info: "fill-sky-500",
  };

  return (
    <motion.span
      initial={reducedMotion ? false : { scale: 0.45, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 22 }}
      className="flex h-5 w-5 shrink-0 items-center justify-center"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="11" className={circleFill[type]} />

        {type === "success" && (
          <motion.path
            d="M7.5 12.4L10.6 15.5L16.8 9"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.28, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {type === "error" && (
          <>
            <motion.path
              d="M8.5 8.5L15.5 15.5"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d="M15.5 8.5L8.5 15.5"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        )}

        {type === "warning" && (
          <>
            <motion.path
              d="M12 7.2V13.2"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.22, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.circle
              cx="12"
              cy="16.6"
              r="1.35"
              fill="#ffffff"
              initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 20, delay: 0.18 }}
              style={{ transformOrigin: "12px 16.6px" }}
            />
          </>
        )}

        {type === "info" && (
          <>
            <motion.circle
              cx="12"
              cy="7.6"
              r="1.35"
              fill="#ffffff"
              initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 20, delay: 0.08 }}
              style={{ transformOrigin: "12px 7.6px" }}
            />
            <motion.path
              d="M12 11V16.8"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.22, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        )}
      </svg>
    </motion.span>
  );
}

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
        <span className={twMerge("min-w-0 break-words text-sm leading-snug text-pretty", description ? "font-semibold" : "")}>
          {message}
        </span>
        {description && (
          <span className="min-w-0 break-words text-xs text-muted-foreground leading-relaxed text-pretty">
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
          className="mt-0.5 shrink-0 rounded-[var(--radius-control)] border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
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
          className="mt-0.5 shrink-0 rounded-[var(--radius-control)] p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
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
  delete hotOptions.variant;
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
      interactiveToastIds.delete(staleId);
      toastMeta.delete(staleId);
      hotToast.dismiss(staleId);
    }
  }
}

function dismissToast(id?: string) {
  clearToastTimer(id);
  if (id) {
    interactiveToastIds.delete(id);
    toastMeta.delete(id);
    activeToastIds = activeToastIds.filter((toastId) => toastId !== id);
  } else {
    interactiveToastIds.clear();
    toastMeta.clear();
    activeToastIds = [];
  }
  hotToast.dismiss(id);
}

function removeToast(id?: string) {
  clearToastTimer(id);
  if (id) {
    interactiveToastIds.delete(id);
    toastMeta.delete(id);
    activeToastIds = activeToastIds.filter((toastId) => toastId !== id);
  } else {
    interactiveToastIds.clear();
    toastMeta.clear();
    activeToastIds = [];
  }
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

  if (toastOptions.action || toastOptions.closeButton) {
    interactiveToastIds.add(toastId);
  } else {
    interactiveToastIds.delete(toastId);
  }

  const resolvedDuration =
    type === "loading" ? Infinity : (hotOptions.duration ?? DEFAULT_DURATION);
  toastMeta.set(toastId, {
    type,
    duration: resolvedDuration,
    variant: toastOptions.variant,
    hasCustomIcon: opts.icon !== undefined,
  });

  clearToastTimer(toastId);

  if (type !== "loading" && hotOptions.duration && hotOptions.duration !== Infinity) {
    const timer = setTimeout(() => {
      toastTimers.delete(toastId);
      interactiveToastIds.delete(toastId);
      toastMeta.delete(toastId);
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
  /** Default visual/motion preset for toasts rendered by this Toaster */
  variant?: ToastVariant;
};

export function Toaster({
  position = "top-right",
  mobilePosition = "bottom-center",
  maxToasts = 5,
  variant = "animated",
}: ToasterProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

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
        top: isMobile ? 16 : 56,
        bottom: isMobile ? 24 : 32,
        zIndex: 99999,
        pointerEvents: "none",
      }}
      toastOptions={{
        duration: DEFAULT_DURATION,
        className: "lopes-ui-toast",
        style: {
          background: "var(--surface, #ffffff)",
          color: "var(--surface-foreground, #0f172a)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-control)",
          boxShadow: "var(--shadow-floating)",
          fontSize: 14,
          lineHeight: "20px",
          maxWidth: "min(450px, 92vw)",
          padding: "11px 14px",
          position: "relative",
          overflow: "hidden",
          WebkitFontSmoothing: "antialiased",
        },
      }}
    >
      {(t) => {
        const isInteractive = interactiveToastIds.has(t.id);
        const meta = toastMeta.get(t.id);
        const type: ToastType =
          meta?.type ?? (t.type === "success" || t.type === "error" || t.type === "loading" ? t.type : "default");
        const resolvedVariant: ToastVariant = meta?.variant ?? variant;
        const isAnimated = resolvedVariant === "animated";
        const toastPos: ToastPosition = t.position ?? activePosition;
        const toastIsTop = toastPos.startsWith("top");
        const duration = meta?.duration ?? t.duration ?? DEFAULT_DURATION;
        const progressColor = isAnimated
          ? toastAnimatedProgressColors[type]
          : toastProgressColors[type];
        const showProgress =
          t.visible &&
          type !== "loading" &&
          Number.isFinite(duration) &&
          duration > 0;

        return (
          <motion.div
            onClick={isInteractive ? undefined : () => dismissToast(t.id)}
            onKeyDown={
              isInteractive
                ? undefined
                : (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      dismissToast(t.id);
                    }
                  }
            }
            drag={isAnimated && !shouldReduceMotion ? "x" : false}
            dragConstraints={isAnimated ? { left: 0, right: 0 } : undefined}
            dragElastic={isAnimated ? 0.45 : undefined}
            onDragEnd={
              isAnimated
                ? (_e, info) => {
                    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 350) {
                      dismissToast(t.id);
                    }
                  }
                : undefined
            }
            whileHover={
              isAnimated && t.visible && !shouldReduceMotion
                ? { y: -2 }
                : undefined
            }
            whileTap={
              isAnimated && !isInteractive && !shouldReduceMotion
                ? { scale: 0.985 }
                : undefined
            }
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : isAnimated
                  ? {
                      opacity: 0,
                      y: toastIsTop ? -20 : 20,
                      scale: 0.94,
                    }
                  : {
                      opacity: 0,
                      y: toastIsTop ? -16 : 16,
                    }
            }
            animate={
              shouldReduceMotion
                ? { opacity: t.visible ? 1 : 0 }
                : isAnimated
                  ? {
                      opacity: t.visible ? 1 : 0,
                      y: t.visible ? 0 : toastIsTop ? -12 : 12,
                      scale: t.visible ? 1 : 0.95,
                    }
                  : {
                      opacity: t.visible ? 1 : 0,
                      y: t.visible ? 0 : toastIsTop ? -12 : 12,
                    }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : isAnimated
                  ? {
                      type: "spring",
                      stiffness: 460,
                      damping: 28,
                      mass: 0.75,
                    }
                  : {
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }
            }
            transformTemplate={({ x, y, scale }) => {
              const nx = typeof x === "string" ? parseFloat(x) : Number(x ?? 0);
              const ny = typeof y === "string" ? parseFloat(y) : Number(y ?? 0);
              const ns = typeof scale === "string" ? parseFloat(scale) : Number(scale ?? 1);
              const xDone = !nx || Math.abs(nx) < 0.05;
              const yDone = !ny || Math.abs(ny) < 0.05;
              const sDone = Math.abs(ns - 1) < 0.002;
              if (xDone && yDone && sDone) return "none";
              const parts: string[] = [];
              if (!xDone || !yDone) {
                parts.push(`translate3d(${Math.round(nx)}px, ${Math.round(ny)}px, 0)`);
              }
              if (!sDone) {
                parts.push(`scale(${ns})`);
              }
              return parts.join(" ");
            }}
            role={isInteractive ? undefined : "button"}
            tabIndex={isInteractive ? undefined : 0}
            aria-label={isInteractive ? undefined : "Fechar notificação"}
            className={twMerge(
              "rounded-[var(--radius-control)]",
              isAnimated && "touch-pan-y select-none",
              !isInteractive &&
                "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
            style={{
              pointerEvents: "auto",
            }}
          >
            <ToastBar
              toast={t}
              style={{
                ...t.style,
                animation: "none",
                cursor: isInteractive ? "default" : "pointer",
                ...(isAnimated
                  ? {
                      border: "1px solid var(--border-strong, var(--border))",
                      borderRadius: "var(--radius-card)",
                      padding: "12px 15px",
                      boxShadow: "var(--shadow-floating)",
                    }
                  : {}),
              }}
            >
              {({ icon, message }) => {
                const useUnifiedAnimatedIcon =
                  isAnimated && !meta?.hasCustomIcon && type !== "default";
                return (
                  <>
                    <div className="flex w-full items-start gap-3">
                      {useUnifiedAnimatedIcon ? (
                        <span className="mt-0.5 shrink-0">
                          <AnimatedToastIcon
                            key={`${t.id}-${type}`}
                            type={type}
                            reducedMotion={Boolean(shouldReduceMotion)}
                          />
                        </span>
                      ) : icon ? (
                        <span className="mt-0.5 shrink-0">{icon}</span>
                      ) : null}
                      <div className="min-w-0 flex-1 [&>div]:!m-0 [&>div]:!p-0">
                        {message}
                      </div>
                    </div>
                    {showProgress && !shouldReduceMotion ? (
                      <div
                        className={twMerge(
                          "pointer-events-none absolute inset-x-0 bottom-0",
                          isAnimated
                            ? "h-[3px] bg-zinc-200/70 dark:bg-zinc-800/80"
                            : "h-[2.5px]",
                        )}
                      >
                        <motion.div
                          key={`${t.id}-${type}`}
                          initial={{ scaleX: 1 }}
                          animate={{ scaleX: 0 }}
                          transition={{ duration: duration / 1000, ease: "linear" }}
                          style={{ transformOrigin: "left" }}
                          className={twMerge("h-full w-full", progressColor)}
                        />
                      </div>
                    ) : null}
                  </>
                );
              }}
            </ToastBar>
          </motion.div>
        );
      }}
    </HotToaster>
  );
}

export type ToastPreviewProps = {
  type?: ToastType;
  variant?: ToastVariant;
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
  default: { icon: null, bar: "bg-muted-foreground/40" },
  success: { icon: successIcon, bar: "bg-success" },
  error: { icon: errorIcon, bar: "bg-danger" },
  loading: { icon: loadingIcon, bar: "bg-brand" },
  warning: { icon: warningIcon, bar: "bg-warning" },
  info: { icon: infoIcon, bar: "bg-info" },
};

export function ToastPreview({
  type = "default",
  variant = "animated",
  message,
  description,
  icon,
  action,
  closeButton = false,
  onClose,
  showBar = true,
  className,
}: ToastPreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const cfg = previewConfig[type];
  const iconNode = icon !== undefined ? icon : cfg.icon;
  const isAnimated = variant === "animated";

  const cardContent = (
    <div
      className={twMerge(
        "relative flex items-start gap-3 overflow-hidden border border-border bg-surface px-4 py-3.5 text-surface-foreground",
        isAnimated
          ? "rounded-[var(--radius-card)] shadow-[var(--shadow-overlay)]"
          : "rounded-[var(--radius-control)] shadow-[var(--shadow-floating)]",
      )}
    >
      {showBar && (
        <div
          className={twMerge(
            "absolute inset-x-0 bottom-0",
            isAnimated ? "h-[3px]" : "h-[2.5px]",
            isAnimated ? toastAnimatedProgressColors[type] : toastProgressColors[type],
          )}
        />
      )}
      {isAnimated && icon === undefined && type !== "default" ? (
        <span className="mt-0.5 shrink-0">
          <AnimatedToastIcon type={type} reducedMotion={Boolean(shouldReduceMotion)} />
        </span>
      ) : iconNode ? (
        <span className="mt-0.5 shrink-0">{iconNode}</span>
      ) : null}
      <div className="relative z-10 min-w-0 flex-1">
        <div
          className={twMerge(
            "break-words text-sm leading-snug text-pretty",
            description ? "font-semibold" : "font-medium",
          )}
        >
          {message}
        </div>
        {description && (
          <div className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground text-pretty">
            {description}
          </div>
        )}
      </div>
      {action ? (
        <button
          data-component-id={action.componentId ?? "erp.toast.preview-action"}
          type="button"
          onClick={action.onClick}
          className="relative z-10 mt-0.5 shrink-0 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
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
          className="relative z-10 mt-0.5 shrink-0 rounded-[var(--radius-control)] p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );

  if (isAnimated && !shouldReduceMotion) {
    return (
      <motion.div
        initial={false}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 440, damping: 28 }}
        className={twMerge("w-full max-w-sm", className)}
      >
        {cardContent}
      </motion.div>
    );
  }

  return <div className={twMerge("w-full max-w-sm", className)}>{cardContent}</div>;
}
