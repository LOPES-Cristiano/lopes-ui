"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { X, AlertTriangle, Info, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "default" | "success" | "error" | "loading" | "warning" | "info";

export type ToastOptions = {
  /**
   * When provided, re-uses the same slot instead of creating a new toast.
   * Useful for `toast.promise` transitions (loading → success/error).
   */
  id?: string;
  /** Custom icon. Accepts any ReactNode, or an emoji string. */
  icon?: React.ReactNode;
  /**
   * Auto-dismiss delay in ms.
   * 0 = persistent until dismissed manually.
   * Default: 4 000 ms (loading toasts default to 0).
   */
  duration?: number;
  /** Inline action button rendered right of the message. */
  action?: { label: string; onClick: () => void };
};

type ToastItem = {
  id: string;
  type: ToastType;
  message: React.ReactNode;
  icon?: React.ReactNode;
  duration: number;
  action?: { label: string; onClick: () => void };
  createdAt: number;
  /** Set to true to trigger the exit animation before removal. */
  removing: boolean;
};

export type ToastPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

// ─── Store (module-level singleton) ───────────────────────────────────────────

const DEFAULT_DURATION = 4_000;
/** Must match the exit animation duration in CSS below. */
const EXIT_MS = 300;

let _store: ToastItem[] = [];
const _subs = new Set<(t: ToastItem[]) => void>();

function _emit() { _subs.forEach((fn) => fn([..._store])); }
function _uid()  { return Math.random().toString(36).slice(2, 9); }

function _upsert(type: ToastType, message: React.ReactNode, opts: ToastOptions = {}): string {
  const id       = opts.id ?? _uid();
  const duration = opts.duration ?? (type === "loading" ? 0 : DEFAULT_DURATION);
  const existing = _store.findIndex((t) => t.id === id);

  if (existing !== -1) {
    _store = _store.map((t) =>
      t.id === id
        ? {
            ...t,
            type,
            message,
            icon: opts.icon !== undefined ? opts.icon : t.icon,
            duration,
            action: opts.action !== undefined ? opts.action : t.action,
            removing: false,
            createdAt: Date.now(),
          }
        : t
    );
  } else {
    _store = [
      ..._store,
      { id, type, message, duration, icon: opts.icon, action: opts.action, createdAt: Date.now(), removing: false },
    ];
  }
  _emit();
  return id;
}

function _dismiss(id?: string) {
  if (id === undefined) {
    _store = _store.map((t) => ({ ...t, removing: true }));
    _emit();
    setTimeout(() => { _store = []; _emit(); }, EXIT_MS);
  } else {
    _store = _store.map((t) => (t.id === id ? { ...t, removing: true } : t));
    _emit();
    setTimeout(() => { _store = _store.filter((t) => t.id !== id); _emit(); }, EXIT_MS);
  }
}

function _remove(id?: string) {
  _store = id === undefined ? [] : _store.filter((t) => t.id !== id);
  _emit();
}

// ─── toast() API ──────────────────────────────────────────────────────────────

type PromiseMsgs<T> = {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error:   React.ReactNode | ((err: unknown) => React.ReactNode);
};

export type ToastFn = {
  (message: React.ReactNode, opts?: ToastOptions): string;
  /** Green checkmark. */
  success: (m: React.ReactNode, o?: ToastOptions) => string;
  /** Red X. */
  error:   (m: React.ReactNode, o?: ToastOptions) => string;
  /** Indigo spinner — persistent by default (duration: 0). */
  loading: (m: React.ReactNode, o?: ToastOptions) => string;
  /** Amber warning triangle. */
  warning: (m: React.ReactNode, o?: ToastOptions) => string;
  /** Sky info icon. */
  info:    (m: React.ReactNode, o?: ToastOptions) => string;
  /** Animate out one or all toasts. */
  dismiss: (id?: string) => void;
  /** Remove one or all toasts instantly (no animation). */
  remove:  (id?: string) => void;
  /**
   * Shows a loading toast while `promise` is pending,
   * then transitions to success or error automatically.
   */
  promise: <T>(p: Promise<T>, msgs: PromiseMsgs<T>, opts?: ToastOptions) => Promise<T>;
};

const toast: ToastFn = Object.assign(
  (message: React.ReactNode, opts?: ToastOptions) => _upsert("default", message, opts),
  {
    success: (m: React.ReactNode, o?: ToastOptions) => _upsert("success", m, o),
    error:   (m: React.ReactNode, o?: ToastOptions) => _upsert("error",   m, o),
    loading: (m: React.ReactNode, o?: ToastOptions) => _upsert("loading", m, { duration: 0, ...o }),
    warning: (m: React.ReactNode, o?: ToastOptions) => _upsert("warning", m, o),
    info:    (m: React.ReactNode, o?: ToastOptions) => _upsert("info",    m, o),
    dismiss: _dismiss,
    remove:  _remove,
    promise: <T,>(p: Promise<T>, msgs: PromiseMsgs<T>, opts?: ToastOptions): Promise<T> => {
      const id = _upsert("loading", msgs.loading, { duration: 0, ...opts });
      p.then((data) => {
        const msg = typeof msgs.success === "function"
          ? (msgs.success as (d: T) => React.ReactNode)(data)
          : msgs.success;
        _upsert("success", msg, { id });
      }).catch((err: unknown) => {
        const msg = typeof msgs.error === "function"
          ? (msgs.error as (e: unknown) => React.ReactNode)(err)
          : msgs.error;
        _upsert("error", msg, { id });
      });
      return p;
    },
  }
);

export default toast;

// ─── useToasts hook ───────────────────────────────────────────────────────────

function useToasts(): ToastItem[] {
  // Lazy initial state — reads current store without setState-in-effect
  const [state, setState] = useState<ToastItem[]>(() => [..._store]);
  useEffect(() => {
    const handler = (t: ToastItem[]) => setState(t);
    _subs.add(handler);
    return () => { _subs.delete(handler); };
  }, []);
  return state;
}

// ─── Visual config per type ───────────────────────────────────────────────────

// ─── Animated SVG icons ──────────────────────────────────────────────────────
// These replicate the smooth stroke-draw effect from react-hot-toast.

function AnimatedCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {/* Circle */}
      <circle
        cx="9" cy="9" r="8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="50.3"
        strokeDashoffset="50.3"
        style={{ animation: "_t-circle 0.4s cubic-bezier(0.65,0,0.35,1) 0.05s forwards" }}
      />
      {/* Checkmark */}
      <path
        d="M5 9.5l2.8 2.8 5-5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="14"
        strokeDashoffset="14"
        style={{ animation: "_t-check 0.25s cubic-bezier(0.65,0,0.35,1) 0.35s forwards" }}
      />
    </svg>
  );
}

function AnimatedError() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {/* Circle */}
      <circle
        cx="9" cy="9" r="8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="50.3"
        strokeDashoffset="50.3"
        style={{ animation: "_t-circle 0.4s cubic-bezier(0.65,0,0.35,1) 0.05s forwards" }}
      />
      {/* X — first line */}
      <path
        d="M6 6l6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="9"
        strokeDashoffset="9"
        style={{ animation: "_t-check 0.2s cubic-bezier(0.65,0,0.35,1) 0.35s forwards" }}
      />
      {/* X — second line */}
      <path
        d="M12 6l-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="9"
        strokeDashoffset="9"
        style={{ animation: "_t-check 0.2s cubic-bezier(0.65,0,0.35,1) 0.45s forwards" }}
      />
    </svg>
  );
}

const CFG: Record<ToastType, { icon: React.ReactNode; bar: string; iconCls: string }> = {
  default: { icon: null,                                             bar: "bg-zinc-300",    iconCls: "text-zinc-400"    },
  success: { icon: <AnimatedCheck />,                                bar: "bg-emerald-500", iconCls: "text-emerald-500" },
  error:   { icon: <AnimatedError />,                                bar: "bg-red-500",     iconCls: "text-red-500"     },
  loading: { icon: <Loader2 size={18} className="animate-spin" />,  bar: "bg-indigo-500",  iconCls: "text-indigo-500"  },
  warning: { icon: <AlertTriangle size={18} />,                     bar: "bg-amber-500",   iconCls: "text-amber-500"   },
  info:    { icon: <Info size={18} />,                              bar: "bg-sky-500",     iconCls: "text-sky-500"     },
};

// ─── CSS keyframes ────────────────────────────────────────────────────────────
// Injected as a <style> tag inside the portal. Names prefixed with _t- to avoid
// collisions with any global stylesheet.

const CSS = `
@keyframes _t-in-r  { from { transform: translateX(110%) scale(.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
@keyframes _t-in-l  { from { transform: translateX(-110%) scale(.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
@keyframes _t-in-up { from { transform: translateY(-10px) scale(.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes _t-in-dn { from { transform: translateY(10px) scale(.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes _t-out-r { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(115%); opacity: 0; } }
@keyframes _t-out-l { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-115%); opacity: 0; } }
@keyframes _t-out-up { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-8px) scale(.96); opacity: 0; } }
@keyframes _t-out-dn { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(8px) scale(.96); opacity: 0; } }
@keyframes _t-bar { from { width: 100%; } to { width: 0%; } }
/* SVG stroke-draw animations (animated check / X / circle) */
@keyframes _t-circle { to { stroke-dashoffset: 0; } }
@keyframes _t-check  { to { stroke-dashoffset: 0; } }
/* Icon swap — scale pop when icon changes between types */
@keyframes _t-icon-pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
/* Bar colour crossfade via opacity */
@keyframes _t-bar-fade-in { from { opacity: 0; } to { opacity: 1; } }
`.trim();

// ─── ToastCard component ──────────────────────────────────────────────────────

const SPRING = "cubic-bezier(0.34, 1.4, 0.64, 1)";
const EASE   = "cubic-bezier(0.4, 0, 0.2, 1)";

function ToastCard({ item, position }: { item: ToastItem; position: ToastPosition }) {
  const cfg = CFG[item.type];

  // Track type changes so we can animate the icon swap
  const prevTypeRef = useRef<ToastType>(item.type);
  const [iconKey, setIconKey] = useState(0);
  useEffect(() => {
    if (prevTypeRef.current !== item.type) {
      prevTypeRef.current = item.type;
      setIconKey((k) => k + 1);
    }
  }, [item.type]);

  // Custom icon supports both ReactNode and emoji strings
  const iconNode = item.icon != null
    ? (typeof item.icon === "string"
        ? <span className="text-base leading-none">{item.icon}</span>
        : item.icon)
    : cfg.icon;

  const isLeft   = position.includes("left");
  const isBottom = position.includes("bottom");
  const isCenter = position.includes("center");

  let enterAnim: string;
  let exitAnim: string;
  if (isLeft)        { enterAnim = "_t-in-l";  exitAnim = "_t-out-l";  }
  else if (isCenter) { enterAnim = isBottom ? "_t-in-dn"  : "_t-in-up";
                       exitAnim  = isBottom ? "_t-out-dn" : "_t-out-up"; }
  else               { enterAnim = "_t-in-r";  exitAnim = "_t-out-r";  }

  // Auto-dismiss timer — resets whenever duration or id changes
  useEffect(() => {
    if (item.duration === 0 || item.removing) return;
    const t = setTimeout(() => _dismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, item.removing, item.createdAt]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative"
      style={{
        animation: item.removing
          ? `${exitAnim} ${EXIT_MS}ms ${EASE} forwards`
          : `${enterAnim} 420ms ${SPRING} forwards`,
      }}
    >
      {/* Card */}
      <div className={twMerge(
        "relative flex items-start gap-3 overflow-hidden",
        "rounded-2xl bg-white border border-zinc-100 px-4 py-3.5",
        "shadow-2xl shadow-zinc-900/[0.12]",
      )}>
        {/* Left accent bar — crossfades colour on type change */}
        <div
          key={`bar-${iconKey}`}
          className={twMerge("absolute inset-y-0 left-0 w-[3px] rounded-l-2xl transition-colors duration-300", cfg.bar)}
          style={iconKey > 0 ? { animation: "_t-bar-fade-in 0.3s ease forwards" } : undefined}
        />

        {/* Icon — remounts with pop animation on type change */}
        {iconNode != null && (
          <span
            key={`icon-${iconKey}`}
            className={twMerge("mt-px shrink-0", cfg.iconCls)}
            style={iconKey > 0
              ? { animation: "_t-icon-pop 0.35s cubic-bezier(0.34,1.4,0.64,1) forwards" }
              : undefined
            }
          >
            {iconNode}
          </span>
        )}

        {/* Message — fades/slides when content changes */}
        <span
          key={`msg-${item.message}`}
          className="flex-1 min-w-0 text-sm text-zinc-800 leading-snug break-words"
          style={{ animation: "_t-in-up 0.25s cubic-bezier(0.4,0,0.2,1) forwards" }}
        >
          {item.message}
        </span>

        {/* Action button */}
        {item.action && (
          <button
            type="button"
            onClick={() => { item.action!.onClick(); _dismiss(item.id); }}
            className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-px ml-1 whitespace-nowrap"
          >
            {item.action.label}
          </button>
        )}

        {/* Dismiss */}
        <button
          type="button"
          aria-label="Fechar notificação"
          onClick={() => _dismiss(item.id)}
          className="shrink-0 mt-px text-zinc-300 hover:text-zinc-500 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        {/* Progress bar — inside the card so overflow-hidden clips the rounded corners */}
        {item.duration > 0 && !item.removing && (
          <div
            key={`prog-${item.createdAt}`}
            className={twMerge("absolute inset-x-0 bottom-0 h-[3px] opacity-40", cfg.bar)}
            style={{ animation: `_t-bar ${item.duration}ms linear forwards` }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Position classes ─────────────────────────────────────────────────────────

const POS: Record<ToastPosition, string> = {
  "top-left":      "top-4 left-4 items-start",
  "top-center":    "top-4 inset-x-0 items-center",
  "top-right":     "top-4 right-4 items-end",
  "bottom-left":   "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 inset-x-0 items-center",
  "bottom-right":  "bottom-4 right-4 items-end",
};

// ─── ToastPreview — static card for demos / docs ──────────────────────────────

export type ToastPreviewProps = {
  type?: ToastType;
  message: React.ReactNode;
  icon?: React.ReactNode;
  action?: { label: string; onClick?: () => void };
  /** Show the animated progress bar (frozen at a sample percentage) */
  showBar?: boolean;
};

export function ToastPreview({ type = "default", message, icon, action, showBar = true }: ToastPreviewProps) {
  const cfg = CFG[type];
  const iconNode = icon != null
    ? (typeof icon === "string" ? <span className="text-base leading-none">{icon}</span> : icon)
    : cfg.icon;

  return (
    <div className="w-80 sm:w-96">
      <div className={twMerge(
        "relative flex items-start gap-3 overflow-hidden",
        "rounded-2xl bg-white border border-zinc-100 px-4 py-3.5",
        "shadow-2xl shadow-zinc-900/[0.12]",
      )}>
        <div className={twMerge("absolute inset-y-0 left-0 w-[3px] rounded-l-2xl", cfg.bar)} />
        {iconNode != null && (
          <span className={twMerge("mt-px shrink-0", cfg.iconCls)}>{iconNode}</span>
        )}
        <span className="flex-1 min-w-0 text-sm text-zinc-800 leading-snug break-words">{message}</span>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-px ml-1 whitespace-nowrap"
          >
            {action.label}
          </button>
        )}
        <span className="shrink-0 mt-px text-zinc-300">
          <X size={14} strokeWidth={2.5} />
        </span>

        {/* Progress bar — inside overflow-hidden so corners are clipped by the card */}
        {showBar && (
          <div className={twMerge("absolute inset-x-0 bottom-0 h-[3px] opacity-40 w-3/5", cfg.bar)} />
        )}
      </div>
    </div>
  );
}



// ─── Toaster component ────────────────────────────────────────────────────────

export type ToasterProps = {
  /** Default: "top-right" */
  position?: ToastPosition;
  /** Max toasts visible at once. Oldest are hidden first. Default: 5 */
  maxToasts?: number;
};

export function Toaster({ position = "top-right", maxToasts = 5 }: ToasterProps) {
  const items = useToasts();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const isBottom = position.includes("bottom");
  // For bottom positions render newest at bottom (visually close to edge)
  const visible = isBottom
    ? items.slice(-maxToasts)
    : items.slice(-maxToasts).reverse();

  return createPortal(
    <>
      <style>{CSS}</style>
      <div
        aria-label="Notificações"
        className={twMerge(
          "fixed z-[9999] flex pointer-events-none",
          "w-80 sm:w-96",
          isBottom ? "flex-col-reverse" : "flex-col",
          "gap-0",
          POS[position],
        )}
      >
        {visible.map((item) => (
          // Height-collapse wrapper uses the grid-rows trick (same as Sidebar accordion)
          <div
            key={item.id}
            className="pointer-events-auto grid transition-[grid-template-rows] ease-in-out overflow-hidden"
            style={{
              gridTemplateRows: item.removing ? "0fr" : "1fr",
              transitionDuration: item.removing ? `${EXIT_MS}ms` : "0ms",
            }}
          >
            <div className="overflow-hidden">
              <div className="pb-2">
                <ToastCard item={item} position={position} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
}
