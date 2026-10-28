"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Upload, X, File as FileIcon } from "lucide-react";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useAccessControl } from "../useAccessControl";

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
  /** Renders image thumbnails for selected image/* files (default: true) */
  showPreview?: boolean;
  /** Allows pasting files from clipboard when focused (default: true) */
  allowPaste?: boolean;
  componentId?: string;
  /** If true, hides the component when access is denied instead of disabling it */
  hideIfDenied?: boolean;
};

const BTN_H = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;

export default function FileField({
  label, labelInline, orientation, labelWidth, required, tooltip, labelAction, error: errorProp, helpText, hint, width, className,
  id: idProp, name,
  accept, multiple = false, maxSize,
  onChange, disabled, size = "md",
  placeholder = "Nenhum arquivo selecionado",
  buttonLabel = "Escolher arquivo",
  variant = "compact",
  showPreview = true,
  allowPaste = true,
  componentId,
  hideIfDenied = false,
}: FileFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = Boolean(disabled || !hasPermission);

  const error = errorProp ?? sizeError ?? undefined;

  const previews = useMemo(() => {
    if (!showPreview || typeof URL === "undefined") return [];
    return files.map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
  }, [files, showPreview]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [previews]);

  const processFiles = (list: FileList | null) => {
    if (effectiveDisabled) return;
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
    if (effectiveDisabled) return;
    processFiles(e.dataTransfer.files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!allowPaste || effectiveDisabled) return;
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(e.clipboardData.files);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveDisabled) return;
    setFiles([]);
    setSizeError(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null);
  };

  if (!hasPermission && hideIfDenied) return null;

  const hasFiles = files.length > 0;
  const displayName = !hasFiles
    ? placeholder
    : files.length === 1
      ? `${files[0].name} (${fmtSize(files[0].size)})`
      : `${files.length} arquivos selecionados`;

  const autoHelp = helpText ?? (accept ? `Aceita: ${accept}${maxSize ? ` · máx. ${fmtSize(maxSize)}` : ""}` : undefined);
  const firstImagePreview = previews.find((p) => p.url)?.url;

  return (
    <FieldWrapper
      id={id} label={label} labelInline={labelInline} orientation={orientation} labelWidth={labelWidth}
      required={required} tooltip={tooltip} labelAction={labelAction} error={error} helpText={autoHelp} hint={hint}
      width={width} className={className}
    >
      {/* Hidden native input */}
      <input
        data-component-id={componentId ? `${componentId}.input` : "erp.filefield.input"}
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={effectiveDisabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : autoHelp ? `${id}-help` : undefined}
      />

      {variant === "compact" ? (
        <div
          onPaste={handlePaste}
          className={twMerge(
            "flex w-full items-center overflow-hidden rounded-lg border transition-all duration-150",
            error ? "border-red-400 hover:border-red-500" : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600",
            effectiveDisabled && "opacity-60 pointer-events-none",
          )}
        >
          <button
            data-component-id={componentId ? `${componentId}.browse` : "erp.filefield.browse"}
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={effectiveDisabled}
            className={twMerge(
              "flex shrink-0 items-center gap-1.5 border-r border-zinc-200 bg-zinc-50 px-3 font-medium text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 transition-colors",
              BTN_H[size],
            )}
          >
            <Upload size={size === "lg" ? 15 : 13} />
            {buttonLabel}
          </button>

          {firstImagePreview && (
            <img
              src={firstImagePreview}
              alt={files[0]?.name ?? "Preview"}
              className="ml-2.5 h-6 w-6 shrink-0 rounded object-cover border border-zinc-200 dark:border-zinc-700"
            />
          )}

          <span
            className={twMerge(
              "flex-1 min-w-0 truncate px-3",
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
              hasFiles ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500",
            )}
          >
            {displayName}
          </span>

          {hasFiles && !effectiveDisabled && (
            <button
              type="button"
              data-component-id={componentId ? `${componentId}.clear` : "erp.file.clear"}
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
          tabIndex={effectiveDisabled ? -1 : 0}
          onClick={() => !effectiveDisabled && inputRef.current?.click()}
          onKeyDown={(e) => !effectiveDisabled && (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={twMerge(
            "flex w-full cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-150",
            dragOver
              ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
              : error
                ? "border-red-300 bg-red-50/30 hover:border-red-400 dark:border-red-800 dark:bg-red-950/30 dark:hover:border-red-700"
                : "border-zinc-300 bg-zinc-50 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30",
            effectiveDisabled && "opacity-60 pointer-events-none",
          )}
        >
          {hasFiles ? (
            <>
              {previews.some((p) => p.url) ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {previews.map((p, idx) =>
                    p.url ? (
                      <img
                        key={`${p.file.name}-${idx}`}
                        src={p.url}
                        alt={p.file.name}
                        className="h-16 w-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs"
                      />
                    ) : (
                      <div
                        key={`${p.file.name}-${idx}`}
                        className="flex h-16 w-16 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      >
                        <FileIcon size={24} className="text-indigo-500" />
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <FileIcon size={30} className="text-indigo-500" />
              )}
              <div className="space-y-0.5">
                {files.map((f) => (
                  <p key={f.name} className="max-w-xs truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {f.name}
                    <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">({fmtSize(f.size)})</span>
                  </p>
                ))}
              </div>
              <button
                data-component-id={componentId ? `${componentId}.remove` : "erp.filefield.remove"}
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
                  {dragOver ? "Solte aqui" : "Arraste, cole ou clique para enviar"}
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
