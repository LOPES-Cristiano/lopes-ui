"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  AlertCircle,
  CheckCircle2,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderUp,
  Loader2,
  RotateCcw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useAccessControl } from "./useAccessControl";

export type UploadItemStatus = "pending" | "uploading" | "success" | "error";

export type FileDropzoneItem = {
  id: string;
  file: File;
  relativePath?: string;
  progress: number;
  status: UploadItemStatus;
  error?: string;
  previewUrl?: string | null;
};

export type FileDropzoneProps = {
  /** Accepted MIME types or extensions (e.g. `"image/*,.pdf,.xlsx"`) */
  accept?: string;
  /** Maximum size per file in bytes */
  maxSize?: number;
  /** Maximum total number of files allowed in queue */
  maxFiles?: number;
  /** Allow multiple files. Default: true */
  multiple?: boolean;
  /** Allow dropping folders recursively. Default: false */
  allowDirectories?: boolean;
  /** Allow pasting files from clipboard when focused. Default: true */
  allowPaste?: boolean;
  /** Automatically call `onUpload` as soon as valid files are dropped. Default: true */
  autoUpload?: boolean;
  /** Async upload handler receiving `(file, onProgress)` */
  onUpload?: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  /** Triggered whenever the staged file items array changes */
  onChange?: (files: File[], items: FileDropzoneItem[]) => void;
  /** Triggered when files are rejected by validation */
  onReject?: (rejections: { file: File; reason: string }[]) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const rules = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;

  const fileName = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();

  return rules.some((rule) => {
    if (rule.startsWith(".")) return fileName.endsWith(rule);
    if (rule.endsWith("/*")) {
      const base = rule.slice(0, -2);
      return mime.startsWith(`${base}/`);
    }
    return mime === rule;
  });
}

function pickFileIcon(mime: string, name: string) {
  const lower = name.toLowerCase();
  if (mime.startsWith("image/")) return FileImage;
  if (
    mime.includes("sheet") ||
    mime.includes("excel") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".xlsx")
  ) {
    return FileSpreadsheet;
  }
  if (mime.includes("pdf") || mime.startsWith("text/")) return FileText;
  return FileIcon;
}

interface WebKitDirReaderLike {
  readEntries(
    successCallback: (entries: WebKitEntryLike[]) => void,
    errorCallback?: () => void
  ): void;
}

interface WebKitEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (
    successCallback: (file: File) => void,
    errorCallback?: () => void
  ) => void;
  createReader?: () => WebKitDirReaderLike;
}

async function readDataTransferFiles(
  dt: DataTransfer,
  allowDirectories: boolean
): Promise<{ file: File; relativePath?: string }[]> {
  if (!allowDirectories || !dt.items) {
    return Array.from(dt.files).map((file) => ({ file }));
  }

  const collected: { file: File; relativePath?: string }[] = [];

  const traverseEntry = async (entry: WebKitEntryLike | null, prefix = ""): Promise<void> => {
    if (!entry) return;
    if (entry.isFile && typeof entry.file === "function") {
      const fileFn = entry.file.bind(entry);
      const file = await new Promise<File | null>((resolve) =>
        fileFn((f: File) => resolve(f), () => resolve(null))
      );
      if (file) {
        collected.push({
          file,
          relativePath: prefix ? `${prefix}/${file.name}` : file.name,
        });
      }
    } else if (entry.isDirectory && typeof entry.createReader === "function") {
      const reader = entry.createReader();
      const entries = await new Promise<WebKitEntryLike[]>((resolve) =>
        reader.readEntries((res: WebKitEntryLike[]) => resolve(res || []), () => resolve([]))
      );
      const nextPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
      for (const child of entries) {
        await traverseEntry(child, nextPrefix);
      }
    }
  };

  const entries = Array.from(dt.items)
    .map((it) =>
      typeof it.webkitGetAsEntry === "function"
        ? (it.webkitGetAsEntry() as unknown as WebKitEntryLike | null)
        : null
    )
    .filter((entry): entry is WebKitEntryLike => entry !== null);

  if (entries.length === 0) {
    return Array.from(dt.files).map((file) => ({ file }));
  }

  for (const entry of entries) {
    await traverseEntry(entry);
  }
  return collected;
}

export default function FileDropzone({
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  allowDirectories = false,
  allowPaste = true,
  autoUpload = true,
  onUpload,
  onChange,
  onReject,
  title = "Arraste arquivos aqui ou clique para selecionar",
  description,
  compact = false,
  disabled = false,
  className,
  componentId,
  hideIfDenied = false,
}: FileDropzoneProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const seqRef = useRef(0);

  const [items, setItems] = useState<FileDropzoneItem[]>([]);
  const [dragState, setDragState] = useState<"idle" | "accept" | "reject">("idle");
  const [rejectionBanner, setRejectionBanner] = useState<string | null>(null);

  const itemsRef = useRef<FileDropzoneItem[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      });
    };
  }, []);

  const syncItems = useCallback(
    (updater: (prev: FileDropzoneItem[]) => FileDropzoneItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        onChange?.(
          next.map((i) => i.file),
          next
        );
        return next;
      });
    },
    [onChange]
  );

  const runSingleUpload = useCallback(
    async (item: FileDropzoneItem) => {
      if (!onUpload) return;
      syncItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "uploading", progress: 5, error: undefined } : it
        )
      );
      try {
        await onUpload(item.file, (pct) => {
          const clamped = Math.max(0, Math.min(100, Math.round(pct)));
          syncItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, progress: clamped } : it))
          );
        });
        syncItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "success", progress: 100 } : it
          )
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Falha no envio do arquivo.";
        syncItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "error", error: message } : it
          )
        );
      }
    },
    [onUpload, syncItems]
  );

  const ingestFiles = useCallback(
    (incoming: { file: File; relativePath?: string }[]) => {
      if (effectiveDisabled || incoming.length === 0) return;
      const rejections: { file: File; reason: string }[] = [];
      const accepted: FileDropzoneItem[] = [];

      const currentCount = multiple ? itemsRef.current.length : 0;

      for (const entry of incoming) {
        const { file, relativePath } = entry;
        if (!multiple && accepted.length >= 1) break;
        if (maxFiles && currentCount + accepted.length >= maxFiles) {
          rejections.push({
            file,
            reason: `Limite máximo de ${maxFiles} arquivos atingido.`,
          });
          continue;
        }
        if (!matchesAccept(file, accept)) {
          rejections.push({
            file,
            reason: `Formato não permitido (${file.name}).`,
          });
          continue;
        }
        if (maxSize && file.size > maxSize) {
          rejections.push({
            file,
            reason: `"${file.name}" excede ${formatBytes(maxSize)}.`,
          });
          continue;
        }

        seqRef.current += 1;
        const previewUrl =
          typeof URL !== "undefined" && file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null;

        accepted.push({
          id: `dz-${seqRef.current}-${file.name}`,
          file,
          relativePath,
          progress: onUpload ? 0 : 100,
          status: onUpload ? "pending" : "success",
          previewUrl,
        });
      }

      if (rejections.length > 0) {
        setRejectionBanner(rejections[0].reason);
        onReject?.(rejections);
      } else {
        setRejectionBanner(null);
      }

      if (accepted.length > 0) {
        syncItems((prev) => {
          if (!multiple) {
            prev.forEach((old) => {
              if (old.previewUrl) URL.revokeObjectURL(old.previewUrl);
            });
            return accepted;
          }
          return [...prev, ...accepted];
        });

        if (onUpload && autoUpload) {
          accepted.forEach((it) => {
            void runSingleUpload(it);
          });
        }
      }
    },
    [
      effectiveDisabled,
      multiple,
      maxFiles,
      accept,
      maxSize,
      onUpload,
      onReject,
      syncItems,
      autoUpload,
      runSingleUpload,
    ]
  );

  const removeItem = (id: string) => {
    syncItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    syncItems((prev) => {
      prev.forEach((i) => {
        if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
      });
      return [];
    });
    setRejectionBanner(null);
  };

  if (!hasPermission && hideIfDenied) return null;

  const helperMeta =
    description ??
    [
      accept ? `Formatos: ${accept}` : "Todos os formatos aceitos",
      maxSize ? `Máx. ${formatBytes(maxSize)} por arquivo` : null,
      maxFiles ? `Até ${maxFiles} arquivos` : null,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <div
      data-component-id={componentId}
      className={twMerge("flex w-full flex-col gap-3", className)}
    >
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={effectiveDisabled}
        onChange={(e) => {
          const list = Array.from(e.target.files ?? []).map((file) => ({ file }));
          ingestFiles(list);
          e.target.value = "";
        }}
        className="sr-only"
      />

      {/* Dropzone Target Surface */}
      <div
        role="button"
        tabIndex={effectiveDisabled ? -1 : 0}
        onClick={() => !effectiveDisabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (!effectiveDisabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onPaste={(e) => {
          if (!allowPaste || effectiveDisabled) return;
          const files = Array.from(e.clipboardData?.files ?? []).map((file) => ({ file }));
          if (files.length > 0) {
            e.preventDefault();
            ingestFiles(files);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (effectiveDisabled) return;
          const dtItems = Array.from(e.dataTransfer?.items ?? []);
          if (accept && dtItems.length > 0 && dtItems[0].kind === "file" && dtItems[0].type) {
            const fakeFile = { name: "", type: dtItems[0].type } as File;
            setDragState(matchesAccept(fakeFile, accept) ? "accept" : "reject");
          } else {
            setDragState("accept");
          }
        }}
        onDragLeave={() => setDragState("idle")}
        onDrop={async (e) => {
          e.preventDefault();
          setDragState("idle");
          if (effectiveDisabled) return;
          const extracted = await readDataTransferFiles(e.dataTransfer, allowDirectories);
          ingestFiles(extracted);
        }}
        className={twMerge(
          "group relative flex w-full select-none flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "px-4 py-5 gap-2" : "px-6 py-9 gap-3",
          effectiveDisabled ? "opacity-55 cursor-not-allowed" : "cursor-pointer",
          dragState === "accept" && "border-primary bg-primary/8 scale-[0.995]",
          dragState === "reject" && "border-danger bg-danger/8",
          dragState === "idle" &&
            "border-border-strong bg-surface-muted/35 hover:border-primary/60 hover:bg-surface-hover/60"
        )}
      >
        <div
          className={twMerge(
            "flex items-center justify-center rounded-2xl border border-border bg-surface shadow-2xs transition-transform duration-150 group-hover:-translate-y-0.5",
            compact ? "h-10 w-10" : "h-12 w-12",
            dragState === "accept" && "border-primary text-primary",
            dragState === "reject" && "border-danger text-danger",
            dragState === "idle" && "text-muted-foreground group-hover:text-foreground"
          )}
        >
          {allowDirectories ? (
            <FolderUp size={compact ? 18 : 22} />
          ) : (
            <UploadCloud size={compact ? 18 : 22} />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {dragState === "accept"
              ? "Solte os arquivos para enviar"
              : dragState === "reject"
                ? "Formato de arquivo não aceito"
                : title}
          </p>
          {helperMeta && <p className="text-xs text-muted-foreground">{helperMeta}</p>}
        </div>
      </div>

      {/* Rejection Alert */}
      {rejectionBanner && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2 text-xs font-medium text-danger"
        >
          <span className="flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            {rejectionBanner}
          </span>
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setRejectionBanner(null)}
            className="rounded p-0.5 hover:bg-danger/15 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Staged Queue List */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5 text-xs">
            <span className="font-semibold text-foreground">
              Arquivos ({items.length}
              {maxFiles ? ` / ${maxFiles}` : ""})
            </span>
            <div className="flex items-center gap-3">
              {onUpload && !autoUpload && items.some((i) => i.status === "pending") && (
                <button
                  type="button"
                  onClick={() =>
                    items
                      .filter((i) => i.status === "pending")
                      .forEach((i) => void runSingleUpload(i))
                  }
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Enviar pendentes
                </button>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-danger transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Limpar lista</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {items.map((item) => {
              const FIcon = pickFileIcon(item.file.type, item.file.name);
              return (
                <div key={item.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-muted-foreground">
                      <FIcon size={18} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {item.relativePath ?? item.file.name}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {formatBytes(item.file.size)}
                      </span>
                    </div>

                    {item.status === "uploading" && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-150"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.progress}%
                        </span>
                      </div>
                    )}

                    {item.status === "error" && (
                      <p className="text-[11px] font-medium text-danger">
                        {item.error ?? "Erro ao enviar"}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {item.status === "uploading" && (
                      <Loader2 size={15} className="animate-spin text-primary" />
                    )}
                    {item.status === "success" && (
                      <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                    )}
                    {item.status === "error" && onUpload && (
                      <button
                        type="button"
                        title="Tentar novamente"
                        aria-label="Tentar novamente"
                        onClick={() => void runSingleUpload(item)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Remover ${item.file.name}`}
                      onClick={() => removeItem(item.id)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
