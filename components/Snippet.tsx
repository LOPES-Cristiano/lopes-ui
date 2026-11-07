"use client";

import React, { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./primitives/tooltip";

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
    ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-hover",
    outline: "border border-border bg-surface text-foreground hover:bg-surface-hover",
    subtle: "bg-surface-muted text-foreground hover:bg-surface-hover",
  }[variant];

  const tooltipText = copied ? copiedLabel : label ?? "Copiar";

  const btn = (
    <button
      data-component-id={componentId}
      type="button"
      onClick={handleCopy}
      disabled={isDisabled}
      aria-label={tooltipText}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none shrink-0 cursor-pointer",
        sizeClasses,
        variantClasses,
        copied && "text-success",
        className
      )}
      {...props}
    >
      {copied ? <Check size={size === "xs" ? 12 : 14} /> : <Copy size={size === "xs" ? 12 : 14} />}
      {label && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );

  if (label) return btn;

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
    default: "bg-surface-muted border border-border text-foreground",
    dark: "bg-zinc-950 border border-zinc-800 text-zinc-100",
    bordered: "bg-surface border border-border text-foreground",
    indigo: "bg-primary/10 border border-primary/25 text-foreground",
  }[variant];

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs rounded-lg gap-2",
    md: "px-3.5 py-2 text-xs sm:text-sm rounded-xl gap-3",
    lg: "px-4 py-2.5 text-sm rounded-xl gap-3.5",
  }[size];

  const secretLabel = revealed ? "Ocultar segredo" : "Mostrar segredo";

  return (
    <TooltipProvider delayDuration={250}>
      <div
        data-component-id={componentId}
        className={cn(
          "inline-flex items-center justify-between font-mono max-w-full",
          variantClasses,
          sizeClasses,
          !hasAccess && "opacity-60 pointer-events-none",
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
                        ? "text-primary"
                        : "text-muted-foreground"
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
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  data-component-id={componentId ? `${componentId}.toggle-secret` : undefined}
                  type="button"
                  aria-label={secretLabel}
                  aria-pressed={revealed}
                  onClick={() => setRevealed((r) => !r)}
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    variant === "dark"
                      ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{secretLabel}</TooltipContent>
            </Tooltip>
          )}
          {!hideCopyButton && (
            <CopyButton
              componentId={componentId ? `${componentId}.copy` : undefined}
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
    </TooltipProvider>
  );
}
