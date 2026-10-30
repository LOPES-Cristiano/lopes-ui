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

function toFileList(files: File[]): FileList | null {
  if (files.length === 0) return null;
  if (typeof DataTransfer !== "undefined") {
    try {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      return dt.files;
    } catch {
      // Fallback below
    }
  }
  return files as unknown as FileList;
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
  onFilesChange?: (files: File[]) => void;
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
  hideIfDenied?: boolean;
};

const BTN_H = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;

export default function FileField({
  label,
  labelInline,
  orientation,
  labelWidth,
  required,
  tooltip,
  labelAction,
  error: errorProp,
  helpText,
  hint,
  width,
  className,
  id: idProp,
  name,
  accept,
  multiple = false,
  maxSize,
  onChange,
  onFilesChange,
  disabled,
  size = "md",
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

  const emitFiles = (nextFiles: File[]) => {
    setFiles(nextFiles);
    onFilesChange?.(nextFiles);
    onChange?.(toFileList(nextFiles));
  };

  const processFiles = (list: FileList | null) => {
    if (effectiveDisabled) return;
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    if (maxSize) {
      const big = incoming.find((f) => f.size > maxSize);
      if (big) {
        setSizeError(`"${big.name}" excede ${fmtSize(maxSize)}`);
        return;
      }
    }
    setSizeError(null);
    if (multiple) {
      const existingKeys = new Set(
        files.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      );
      const merged = [
        ...files,
        ...incoming.filter((f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`)),
      ];
      emitFiles(merged);
    } else {
      emitFiles(incoming.slice(0, 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

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

  const removeSingleFile = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveDisabled) return;
    const next = files.filter((_, i) => i !== idx);
    emitFiles(next);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveDisabled) return;
    setSizeError(null);
    if (inputRef.current) inputRef.current.value = "";
    emitFiles([]);
  };

  if (!hasPermission && hideIfDenied) return null;

  const hasFiles = files.length > 0;
  const displayName = !hasFiles
    ? placeholder
    : files.length === 1
      ? `${files[0].name} (${fmtSize(files[0].size)})`
      : `${files.length} arquivos selecionados`;

  const autoHelp =
    helpText ??
    (accept
      ? `Aceita: ${accept}${maxSize ? ` · máx. ${fmtSize(maxSize)}` : ""}`
      : undefined);
  const firstImagePreview = previews.find((p) => p.url)?.url;

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={autoHelp}
      hint={hint}
      width={width}
      className={className}
    >
      <input
        data-component-id={componentId ? `${componentId}.input` : "erp.filefield.input"}
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required && !hasFiles}
        disabled={effectiveDisabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : autoHelp ? `${id}-help` : undefined}
      />

      {variant === "compact" ? (
        <div className="space-y-1.5">
          <div
            onPaste={handlePaste}
            className={twMerge(
              "flex w-full items-center overflow-hidden rounded-lg border bg-surface transition-all duration-150",
              error ? "border-danger" : "border-input-border hover:border-border-strong",
              effectiveDisabled && "opacity-60 pointer-events-none"
            )}
          >
            <button
              data-component-id={componentId ? `${componentId}.browse` : "erp.filefield.browse"}
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={effectiveDisabled}
              className={twMerge(
                "flex shrink-0 items-center gap-1.5 border-r border-border bg-surface-muted px-3 font-medium text-foreground hover:bg-surface-hover transition-colors cursor-pointer",
                BTN_H[size]
              )}
            >
              <Upload size={size === "lg" ? 15 : 13} />
              {buttonLabel}
            </button>

            {firstImagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstImagePreview}
                alt={files[0]?.name ?? "Preview"}
                className="ml-2.5 h-6 w-6 shrink-0 rounded object-cover border border-border"
              />
            )}

            <span
              className={twMerge(
                "flex-1 min-w-0 truncate px-3",
                size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
                hasFiles ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {displayName}
            </span>

            {hasFiles && !effectiveDisabled && (
              <button
                type="button"
                data-component-id={componentId ? `${componentId}.clear` : "erp.file.clear"}
                aria-label="Remover todos os arquivos"
                onClick={clear}
                className="flex shrink-0 items-center justify-center px-2 text-muted-foreground hover:text-danger transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {multiple && files.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {files.map((f, idx) => (
                <span
                  key={`${f.name}-${idx}`}
                  className="inline-flex max-w-[220px] items-center gap-1.5 rounded-md border border-border bg-surface-muted/60 px-2 py-0.5 text-xs"
                >
                  <span className="truncate text-foreground">{f.name}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {fmtSize(f.size)}
                  </span>
                  {!effectiveDisabled && (
                    <button
                      type="button"
                      aria-label={`Remover ${f.name}`}
                      onClick={(e) => removeSingleFile(idx, e)}
                      className="rounded p-0.5 text-muted-foreground hover:text-danger cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={effectiveDisabled ? -1 : 0}
          onClick={() => !effectiveDisabled && inputRef.current?.click()}
          onKeyDown={(e) =>
            !effectiveDisabled &&
            (e.key === "Enter" || e.key === " ") &&
            inputRef.current?.click()
          }
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={twMerge(
            "flex w-full cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-7 text-center transition-all duration-150",
            dragOver
              ? "border-primary bg-primary/8"
              : error
                ? "border-danger/60 bg-danger/5 hover:border-danger"
                : "border-border-strong bg-surface-muted/40 hover:border-primary/60 hover:bg-surface-hover/60",
            effectiveDisabled && "opacity-60 pointer-events-none"
          )}
        >
          {hasFiles ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {previews.map((p, idx) => (
                  <div
                    key={`${p.file.name}-${idx}`}
                    className="group/file relative flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 shadow-2xs"
                  >
                    {p.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.url}
                        alt={p.file.name}
                        className="h-9 w-9 rounded object-cover border border-border"
                      />
                    ) : (
                      <FileIcon size={18} className="text-primary shrink-0" />
                    )}
                    <div className="max-w-[160px] text-left">
                      <p className="truncate text-xs font-medium text-foreground">
                        {p.file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {fmtSize(p.file.size)}
                      </p>
                    </div>
                    {!effectiveDisabled && (
                      <button
                        type="button"
                        aria-label={`Remover ${p.file.name}`}
                        onClick={(e) => removeSingleFile(idx, e)}
                        className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-danger/10 hover:text-danger cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                {multiple && (
                  <span className="text-xs font-medium text-primary hover:underline">
                    + Adicionar mais arquivos
                  </span>
                )}
                <button
                  data-component-id={componentId ? `${componentId}.remove` : "erp.filefield.remove"}
                  type="button"
                  onClick={clear}
                  className="text-xs text-muted-foreground hover:text-danger transition-colors cursor-pointer"
                >
                  Limpar todos
                </button>
              </div>
            </>
          ) : (
            <>
              <Upload
                size={28}
                className={dragOver ? "text-primary" : "text-muted-foreground"}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {dragOver ? "Solte os arquivos aqui" : "Arraste, cole ou clique para enviar"}
                </p>
                {(accept || maxSize) && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
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
