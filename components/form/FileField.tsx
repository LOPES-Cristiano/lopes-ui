"use client";

import React, { useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Upload, X, File as FileIcon } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type FileFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  /** Accepted MIME types or extensions, e.g. ".pdf,.docx" or "image/*" */
  accept?: string;
  multiple?: boolean;
  /** Max file size in bytes */
  maxSize?: number;
  onChange?: (files: FileList | null) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  /** Label on the trigger button (compact variant) */
  buttonLabel?: string;
  /** compact = styled button + filename row, drop = drag & drop area */
  variant?: "compact" | "drop";
  componentId?: string;
};

const BTN_H = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;

export default function FileField({
  label, labelInline, labelWidth, required, tooltip, error: errorProp, helpText, width, className,
  id: idProp, name,
  accept, multiple = false, maxSize,
  onChange, disabled, size = "md",
  placeholder = "Nenhum arquivo selecionado",
  buttonLabel = "Escolher arquivo",
  variant = "compact",
  componentId,
}: FileFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const error = errorProp ?? sizeError ?? undefined;

  const processFiles = (list: FileList | null) => {
    if (!list || list.length === 0) {
      setFiles([]);
      setSizeError(null);
      onChange?.(null);
      return;
    }
    const arr = Array.from(list);
    if (maxSize) {
      const big = arr.find((f) => f.size > maxSize);
      if (big) {
        setSizeError(`"${big.name}" excede ${fmtSize(maxSize)}`);
        return;
      }
    }
    setSizeError(null);
    setFiles(arr);
    onChange?.(list);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => processFiles(e.target.files);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
    setSizeError(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null);
  };

  const hasFiles = files.length > 0;
  const displayName = !hasFiles
    ? placeholder
    : files.length === 1
      ? `${files[0].name} (${fmtSize(files[0].size)})`
      : `${files.length} arquivos selecionados`;

  const autoHelp = helpText ?? (accept ? `Aceita: ${accept}${maxSize ? ` · máx. ${fmtSize(maxSize)}` : ""}` : undefined);

  return (
    <FieldWrapper
      id={id} label={label} labelInline={labelInline} labelWidth={labelWidth}
      required={required} tooltip={tooltip} error={error} helpText={autoHelp}
      width={width} className={className}
    >
      {/* Hidden native input */}
      <input
        ref={inputRef}
        id={id} name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : autoHelp ? `${id}-help` : undefined}
        {...(componentId ? { "data-component-id": componentId } : {})}
      />

      {variant === "compact" ? (
        <div
          className={twMerge(
            "flex w-full items-center overflow-hidden rounded-lg border transition-all duration-150",
            error ? "border-red-400 hover:border-red-500" : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600",
            disabled && "opacity-60 pointer-events-none",
          )}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className={twMerge(
              "flex shrink-0 items-center gap-1.5 border-r border-zinc-200 bg-zinc-50 px-3 font-medium text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 transition-colors",
              BTN_H[size],
            )}
          >
            <Upload size={size === "lg" ? 15 : 13} />
            {buttonLabel}
          </button>

          <span
            className={twMerge(
              "flex-1 min-w-0 truncate px-3",
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
              hasFiles ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500",
            )}
          >
            {displayName}
          </span>

          {hasFiles && !disabled && (
            <button
              type="button"
              aria-label="Remover arquivo"
              onClick={clear}
              className="flex shrink-0 items-center justify-center px-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => !disabled && (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={twMerge(
            "flex w-full cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-150",
            dragOver
              ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
              : error
                ? "border-red-300 bg-red-50/30 hover:border-red-400 dark:border-red-800 dark:bg-red-950/30 dark:hover:border-red-700"
                : "border-zinc-300 bg-zinc-50 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30",
            disabled && "opacity-60 pointer-events-none",
          )}
        >
          {hasFiles ? (
            <>
              <FileIcon size={30} className="text-indigo-500" />
              <div className="space-y-0.5">
                {files.map((f) => (
                  <p key={f.name} className="max-w-xs truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {f.name}
                    <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">({fmtSize(f.size)})</span>
                  </p>
                ))}
              </div>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-zinc-400 hover:text-red-500 dark:text-zinc-500 transition-colors"
              >
                Remover
              </button>
            </>
          ) : (
            <>
              <Upload size={30} className={dragOver ? "text-indigo-500" : "text-zinc-400 dark:text-zinc-500"} />
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {dragOver ? "Solte aqui" : "Arraste ou clique para enviar"}
                </p>
                {(accept || maxSize) && (
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                    {accept && `Aceita ${accept}`}
                    {accept && maxSize && " · "}
                    {maxSize && `máx. ${fmtSize(maxSize)}`}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </FieldWrapper>
  );
}
