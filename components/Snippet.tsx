"use client";

import React, { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAccessControl } from "./useAccessControl";

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Valor textual a ser copiado para a área de transferência */
  value: string;
  /** Rótulo opcional ao lado do ícone */
  label?: string;
  /** Rótulo exibido após copiar */
  copiedLabel?: string;
  /** Tamanho do botão */
  size?: "xs" | "sm" | "md";
  /** Variante visual */
  variant?: "ghost" | "outline" | "subtle";
  /** Callback disparado após copiar */
  onCopied?: (value: string) => void;
}

export function CopyButton({
  value,
  label,
  copiedLabel = "Copiado",
  size = "sm",
  variant = "ghost",
  onCopied,
  className,
  disabled,
  componentId,
  hideIfDenied = true,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  if (!hasAccess && hideIfDenied) return null;

  const isDisabled = disabled || !hasAccess;

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isDisabled) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.(value);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const sizeClasses = {
    xs: label ? "h-6 px-2 text-[11px] gap-1" : "size-6",
    sm: label ? "h-7 px-2.5 text-xs gap-1.5" : "size-7",
    md: label ? "h-8 px-3 text-xs gap-1.5" : "size-8",
  }[size];

  const variantClasses = {
    ghost: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800",
    outline: "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
    subtle: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700",
  }[variant];

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isDisabled}
      title={copied ? copiedLabel : label ?? "Copiar"}
      aria-label={copied ? copiedLabel : label ?? "Copiar"}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none shrink-0",
        sizeClasses,
        variantClasses,
        copied && "text-emerald-600 dark:text-emerald-400",
        className
      )}
      {...props}
    >
      {copied ? <Check size={size === "xs" ? 12 : 14} /> : <Copy size={size === "xs" ? 12 : 14} />}
      {label && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
}

export interface SnippetProps extends React.HTMLAttributes<HTMLDivElement> {
  componentId?: string;
  hideIfDenied?: boolean;
  /** Comando, chave de API ou código a ser exibido e copiado */
  code: string | string[];
  /** Símbolo de prefixo (ex: "$", ">", "#"). Passe false para ocultar */
  symbol?: string | false;
  /** Variante visual */
  variant?: "default" | "dark" | "bordered" | "indigo";
  /** Tamanho do snippet */
  size?: "sm" | "md" | "lg";
  /** Oculta o conteúdo como segredo/token com botão de visualizar */
  maskSecret?: boolean;
  /** Oculta o botão de copiar */
  hideCopyButton?: boolean;
  /** Callback disparado ao copiar */
  onCopyCode?: (value: string) => void;
}

export default function Snippet({
  code,
  symbol = "$",
  variant = "default",
  size = "md",
  maskSecret = false,
  hideCopyButton = false,
  onCopyCode,
  className,
  componentId,
  hideIfDenied = true,
  ...props
}: SnippetProps) {
  const [revealed, setRevealed] = useState(!maskSecret);

  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  if (!hasAccess && hideIfDenied) return null;

  const lines = Array.isArray(code) ? code : [code];
  const fullText = lines.join("\n");

  const maskLine = (line: string) => {
    if (revealed) return line;
    if (line.length <= 8) return "••••••••••••";
    return `${line.slice(0, 6)}${"•".repeat(Math.min(18, line.length - 6))}${line.slice(-4)}`;
  };

  const variantClasses = {
    default: "bg-zinc-100/90 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200",
    dark: "bg-zinc-950 border border-zinc-800 text-zinc-100",
    bordered: "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200",
    indigo: "bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/70 text-indigo-950 dark:text-indigo-200",
  }[variant];

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs rounded-lg gap-2",
    md: "px-3.5 py-2 text-xs sm:text-sm rounded-xl gap-3",
    lg: "px-4 py-2.5 text-sm rounded-xl gap-3.5",
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-between font-mono max-w-full",
        variantClasses,
        sizeClasses,
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5 overflow-x-auto no-scrollbar min-w-0">
        {lines.map((line, idx) => (
          <div key={idx} className="flex items-center gap-2 whitespace-pre">
            {symbol !== false && (
              <span
                className={cn(
                  "select-none font-semibold",
                  variant === "dark"
                    ? "text-indigo-400"
                    : variant === "indigo"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                {symbol}
              </span>
            )}
            <span className="truncate">{maskLine(line)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {maskSecret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            title={revealed ? "Ocultar segredo" : "Mostrar segredo"}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md transition-colors",
              variant === "dark"
                ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
        {!hideCopyButton && (
          <CopyButton
            value={fullText}
            size={size === "sm" ? "xs" : "sm"}
            onCopied={onCopyCode}
            className={
              variant === "dark"
                ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
