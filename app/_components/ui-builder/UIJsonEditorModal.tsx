"use client";

import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileCode2, RotateCcw } from "lucide-react";
import Button from "@/components/Button";
import CodeEditor, { validateCode } from "@/components/CodeEditor";
import Modal from "@/components/Modal";
import toast from "@/components/Toast";
import { normalizeCanvasConfig } from "./canvas-actions";
import type { UICanvasConfig } from "./types";

export interface UIJsonEditorModalProps {
  open: boolean;
  onClose: () => void;
  config: UICanvasConfig;
  onApply: (nextConfig: UICanvasConfig) => void;
}

function JsonEditorBody({
  config,
  onClose,
  onApply,
}: Omit<UIJsonEditorModalProps, "open">) {
  const initialJson = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const [draft, setDraft] = useState<string>(initialJson);

  const diagnostic = useMemo(() => validateCode(draft, "json"), [draft]);

  const handleApply = () => {
    if (!diagnostic.isValid) {
      toast.error(diagnostic.message || "Corrija os erros de sintaxe JSON antes de aplicar.");
      return;
    }
    try {
      const parsed = JSON.parse(draft) as unknown;
      const normalized = normalizeCanvasConfig(parsed, config);
      onApply(normalized);
      toast.success(`AST JSON aplicado (${normalized.elements.length} elementos no Canvas 2D).`);
      onClose();
    } catch {
      toast.error("Não foi possível interpretar a estrutura JSON informada.");
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
          {diagnostic.isValid ? (
            <>
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>
                Estrutura AST JSON válida · Prancheta{" "}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  {config.width}×{config.height}px
                </strong>
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={15} className="text-rose-500 shrink-0" />
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Linha {diagnostic.line ?? 1}: {diagnostic.message}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RotateCcw size={13} />}
            onClick={() => setDraft(initialJson)}
          >
            Restaurar Atual
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={!diagnostic.isValid}
            onClick={handleApply}
          >
            Aplicar na Prancheta
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <CodeEditor
          value={draft}
          onChange={setDraft}
          language="json"
          allowLanguageChange={false}
          title={`${config.exportName || "layout"}.canvas.json`}
          filename={`${config.exportName || "layout"}.canvas.json`}
          height="100%"
          showToolbar
          showStatusBar
          showLineNumbers
          showFormat
          showSearch
          showCopy
          showImportExport
        />
      </div>
    </div>
  );
}

export default function UIJsonEditorModal({
  open,
  onClose,
  config,
  onApply,
}: UIJsonEditorModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <span className="inline-flex items-center gap-2">
          <FileCode2 size={18} className="text-indigo-500" />
          <span>Editor AST JSON — Layout 2D da Prancheta</span>
        </span>
      }
      description="Inspecione ou edite diretamente as coordenadas (x, y, width, height), camadas, grupos e propriedades serializadas."
    >
      {open && <JsonEditorBody config={config} onClose={onClose} onApply={onApply} />}
    </Modal>
  );
}
