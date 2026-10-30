"use client";

import React, { useState } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  ArrowDown,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpToLine,
  Columns3,
  Copy,
  Eye,
  EyeOff,
  Group,
  Layers,
  Lock,
  Maximize2,
  Palette,
  Plus,
  RotateCcw,
  Rows3,
  Settings2,
  ShieldCheck,
  Sliders,
  Trash2,
  Ungroup,
  Unlock,
  X,
} from "lucide-react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import NumberField from "@/components/form/NumberField";
import SelectField from "@/components/form/SelectField";
import Switch from "@/components/form/Switch";
import TextareaField from "@/components/form/TextareaField";
import TextField from "@/components/form/TextField";
import toast from "@/components/Toast";
import { cn } from "@/utils/cn";
import {
  getSelectionBounds,
  type AlignMode,
} from "./canvas-actions";
import {
  ARTBOARD_PRESETS,
  CATALOG_BY_TYPE,
  ICON_SELECT_OPTIONS,
  resolveIcon,
} from "./catalog-and-defaults";
import type {
  UIArtboardPresetId,
  UICanvasConfig,
  UICanvasElement,
  UIElementStyle,
} from "./types";

function asStr(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return fallback;
}

function asNum(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export interface UIBuilderInspectorProps {
  config: UICanvasConfig;
  selectedIds: string[];
  onUpdateConfig: (updater: (prev: UICanvasConfig) => UICanvasConfig, commitHistory?: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onAlign: (mode: AlignMode, forceArtboard?: boolean) => void;
  onDistribute: (axis: "H" | "V") => void;
  onMatchSize: (dim: "W" | "H" | "BOTH") => void;
  onAutoArrange: (direction: "row" | "column", gap: number, equalizeSize?: boolean) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onMoveLayer: (dir: "UP" | "DOWN", extreme?: boolean) => void;
  onClearCanvas: () => void;
  onClose?: () => void;
}

export default function UIBuilderInspector({
  config,
  selectedIds,
  onUpdateConfig,
  onSelectIds,
  onAlign,
  onDistribute,
  onMatchSize,
  onAutoArrange,
  onGroup,
  onUngroup,
  onDuplicateSelected,
  onDeleteSelected,
  onMoveLayer,
  onClearCanvas,
  onClose,
}: UIBuilderInspectorProps) {
  const [artboardTab, setArtboardTab] = useState<"artboard" | "layers" | "project">("artboard");
  const [singleTab, setSingleTab] = useState<"props" | "geometry" | "style">("props");
  const [arrangeGap, setArrangeGap] = useState<number>(16);
  const [alignToArtboardInGroup, setAlignToArtboardInGroup] = useState(false);
  const [rawPropsOpen, setRawPropsOpen] = useState(false);
  const [rawPropsDraft, setRawPropsDraft] = useState("");

  const selectedElements = config.elements.filter((el) => selectedIds.includes(el.id));
  const singleElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const usableWidth = Math.max(240, config.width - config.marginLeft - config.marginRight);

  const updateSingleElement = (
    patch: Partial<UICanvasElement>,
    commitHistory = true,
  ) => {
    if (!singleElement) return;
    onUpdateConfig(
      (prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === singleElement.id ? { ...el, ...patch } : el,
        ),
      }),
      commitHistory,
    );
  };

  const updateSingleProp = (key: string, value: unknown) => {
    if (!singleElement) return;
    updateSingleElement({
      props: {
        ...singleElement.props,
        [key]: value,
      },
    });
  };

  const updateSingleStyle = (patch: Partial<UIElementStyle>) => {
    if (!singleElement) return;
    updateSingleElement({
      style: {
        ...(singleElement.style || {}),
        ...patch,
      },
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 1: NO ELEMENT SELECTED -> ARTBOARD / LAYERS / PROJECT INSPECTOR
  // ═══════════════════════════════════════════════════════════════════════════
  if (selectedElements.length === 0) {
    const lockedCount = config.elements.filter((e) => e.locked).length;
    const hiddenCount = config.elements.filter((e) => e.hidden).length;
    const groupCount = new Set(config.elements.map((e) => e.groupId).filter(Boolean)).size;

    return (
      <aside className="w-80 shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full select-none">
        {/* Header */}
        <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Settings2 size={14} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Inspetor da Prancheta
              </span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 p-0.5 text-[11px] font-semibold">
            {(
              [
                { id: "artboard", label: "Prancheta" },
                { id: "layers", label: `Camadas (${config.elements.length})` },
                { id: "project", label: "Projeto" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setArtboardTab(t.id)}
                className={cn(
                  "rounded-md py-1.5 transition-colors duration-150 cursor-pointer",
                  artboardTab === t.id
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 text-xs">
          {artboardTab === "artboard" && (
            <>
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Formato & Viewport 2D
                </span>
                <SelectField
                  size="sm"
                  label="Preset de Dispositivo"
                  value={config.preset}
                  options={ARTBOARD_PRESETS.map((pr) => ({
                    value: pr.id,
                    label: pr.label,
                    description: pr.description,
                  }))}
                  onChange={(val) => {
                    const found = ARTBOARD_PRESETS.find((pr) => pr.id === val);
                    if (!found) return;
                    onUpdateConfig((prev) => ({
                      ...prev,
                      preset: found.id as UIArtboardPresetId,
                      width: found.id === "custom" ? prev.width : found.width,
                      height: found.id === "custom" ? prev.height : found.height,
                    }));
                  }}
                />

                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    size="sm"
                    label="Largura (W)"
                    suffix="px"
                    min={320}
                    max={3840}
                    value={config.width}
                    onValueChange={(v) => {
                      if (v && v >= 320) {
                        onUpdateConfig((prev) => ({
                          ...prev,
                          preset: "custom",
                          width: Math.round(v),
                        }));
                      }
                    }}
                  />
                  <NumberField
                    size="sm"
                    label="Altura Mín. (H)"
                    suffix="px"
                    min={240}
                    max={5000}
                    value={config.height}
                    onValueChange={(v) => {
                      if (v && v >= 240) {
                        onUpdateConfig((prev) => ({
                          ...prev,
                          preset: "custom",
                          height: Math.round(v),
                        }));
                      }
                    }}
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  leftIcon={<ArrowLeftRight size={13} />}
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      preset: "custom",
                      width: prev.height,
                      height: prev.width,
                    }))
                  }
                >
                  Inverter Largura ↔ Altura ({config.height}×{config.width})
                </Button>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Margens Internas (Guias)
                  </span>
                  <div className="flex items-center gap-1">
                    {[0, 16, 24, 32].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            marginTop: m,
                            marginBottom: m,
                            marginLeft: m,
                            marginRight: m,
                          }))
                        }
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors cursor-pointer",
                          config.marginLeft === m && config.marginTop === m
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200",
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    size="sm"
                    label="Topo"
                    suffix="px"
                    min={0}
                    max={200}
                    value={config.marginTop}
                    onValueChange={(v) =>
                      onUpdateConfig((prev) => ({ ...prev, marginTop: Math.max(0, Math.round(v ?? 0)) }))
                    }
                  />
                  <NumberField
                    size="sm"
                    label="Base"
                    suffix="px"
                    min={0}
                    max={200}
                    value={config.marginBottom}
                    onValueChange={(v) =>
                      onUpdateConfig((prev) => ({ ...prev, marginBottom: Math.max(0, Math.round(v ?? 0)) }))
                    }
                  />
                  <NumberField
                    size="sm"
                    label="Esquerda"
                    suffix="px"
                    min={0}
                    max={200}
                    value={config.marginLeft}
                    onValueChange={(v) =>
                      onUpdateConfig((prev) => ({ ...prev, marginLeft: Math.max(0, Math.round(v ?? 0)) }))
                    }
                  />
                  <NumberField
                    size="sm"
                    label="Direita"
                    suffix="px"
                    min={0}
                    max={200}
                    value={config.marginRight}
                    onValueChange={(v) =>
                      onUpdateConfig((prev) => ({ ...prev, marginRight: Math.max(0, Math.round(v ?? 0)) }))
                    }
                  />
                </div>

                <Switch
                  size="sm"
                  label="Exibir linha tracejada de margens"
                  checked={config.showMargins}
                  onChange={(checked) =>
                    onUpdateConfig((prev) => ({ ...prev, showMargins: checked }), false)
                  }
                />
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3.5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Grade Magnética & 12 Colunas
                </span>

                <SelectField
                  size="sm"
                  label="Passo Magnético (Snap Grid)"
                  value={String(config.snapGrid)}
                  options={[
                    { value: "1", label: "1 px (Livre / Cirúrgico)" },
                    { value: "4", label: "4 px (Micro Grid)" },
                    { value: "8", label: "8 px (Design System Padrão)" },
                    { value: "12", label: "12 px" },
                    { value: "16", label: "16 px (Macro Grid)" },
                    { value: "24", label: "24 px" },
                  ]}
                  onChange={(v) =>
                    onUpdateConfig((prev) => ({ ...prev, snapGrid: Number(v) || 8 }), false)
                  }
                />

                <Switch
                  size="sm"
                  label="Sobrepor Grade de Colunas UI"
                  description="Colunas rosadas translúcidas para alinhamento responsivo"
                  checked={config.layoutGrid.enabled}
                  onChange={(checked) =>
                    onUpdateConfig(
                      (prev) => ({
                        ...prev,
                        layoutGrid: { ...prev.layoutGrid, enabled: checked },
                      }),
                      false,
                    )
                  }
                />

                {config.layoutGrid.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <SelectField
                      size="sm"
                      label="Colunas"
                      value={String(config.layoutGrid.columns)}
                      options={[
                        { value: "4", label: "4 Colunas" },
                        { value: "6", label: "6 Colunas" },
                        { value: "8", label: "8 Colunas" },
                        { value: "12", label: "12 Colunas" },
                      ]}
                      onChange={(v) =>
                        onUpdateConfig(
                          (prev) => ({
                            ...prev,
                            layoutGrid: { ...prev.layoutGrid, columns: Number(v) || 12 },
                          }),
                          false,
                        )
                      }
                    />
                    <SelectField
                      size="sm"
                      label="Gutter"
                      value={String(config.layoutGrid.gutter)}
                      options={[
                        { value: "8", label: "8 px" },
                        { value: "12", label: "12 px" },
                        { value: "16", label: "16 px" },
                        { value: "24", label: "24 px" },
                      ]}
                      onChange={(v) =>
                        onUpdateConfig(
                          (prev) => ({
                            ...prev,
                            layoutGrid: { ...prev.layoutGrid, gutter: Number(v) || 16 },
                          }),
                          false,
                        )
                      }
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3.5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Aparência & Moldura ERP
                </span>
                <SelectField
                  size="sm"
                  label="Fundo da Prancheta"
                  value={config.background}
                  options={[
                    { value: "slate", label: "Slate Corporativo (#f8fafc)" },
                    { value: "white", label: "Branco Puro (#ffffff)" },
                    { value: "zinc", label: "Zinco Suave (#f4f4f5)" },
                    { value: "transparent", label: "Transparente (Xadrez)" },
                  ]}
                  onChange={(v) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      background: v as UICanvasConfig["background"],
                    }))
                  }
                />

                <Switch
                  size="sm"
                  label="Simular Moldura App Shell (Header + Sidebar)"
                  description="Exibe barra superior do ERP ao redor da prancheta"
                  checked={config.showShellChrome}
                  onChange={(checked) =>
                    onUpdateConfig((prev) => ({ ...prev, showShellChrome: checked }), false)
                  }
                />
              </div>

              {(config.guides.x.length > 0 || config.guides.y.length > 0) && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      Guias de Régua ({config.guides.x.length + config.guides.y.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, guides: { x: [], y: [] } }))
                      }
                      className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Limpar todas
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {config.guides.x.map((gx, i) => (
                      <span
                        key={`gx_${i}`}
                        className="inline-flex items-center gap-1 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 text-[10px] font-mono text-cyan-700 dark:text-cyan-300"
                      >
                        X: {gx}px
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({
                              ...prev,
                              guides: {
                                ...prev.guides,
                                x: prev.guides.x.filter((_, idx) => idx !== i),
                              },
                            }))
                          }
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {config.guides.y.map((gy, i) => (
                      <span
                        key={`gy_${i}`}
                        className="inline-flex items-center gap-1 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 text-[10px] font-mono text-cyan-700 dark:text-cyan-300"
                      >
                        Y: {gy}px
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({
                              ...prev,
                              guides: {
                                ...prev.guides,
                                y: prev.guides.y.filter((_, idx) => idx !== i),
                              },
                            }))
                          }
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {artboardTab === "layers" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onSelectIds(config.elements.filter((e) => !e.hidden).map((e) => e.id))
                  }
                >
                  Selecionar Tudo
                </Button>
                {lockedCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        elements: prev.elements.map((e) => ({ ...e, locked: false })),
                      }))
                    }
                  >
                    Desbloquear ({lockedCount})
                  </Button>
                )}
                {hiddenCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        elements: prev.elements.map((e) => ({ ...e, hidden: false })),
                      }))
                    }
                  >
                    Mostrar ({hiddenCount})
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                {[...config.elements].reverse().map((el) => {
                  const meta = CATALOG_BY_TYPE[el.type];
                  const IconComp = resolveIcon(meta?.iconName);
                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectIds([el.id])}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border border-zinc-200/70 dark:border-zinc-800 px-2.5 py-1.5 hover:border-indigo-400 cursor-pointer",
                        el.hidden && "opacity-45",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconComp size={13} className="text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {el.name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400">
                            {el.x},{el.y} · {el.width}×{el.height}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateConfig((prev) => ({
                              ...prev,
                              elements: prev.elements.map((item) =>
                                item.id === el.id ? { ...item, hidden: !item.hidden } : item,
                              ),
                            }));
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          {el.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateConfig((prev) => ({
                              ...prev,
                              elements: prev.elements.map((item) =>
                                item.id === el.id ? { ...item, locked: !item.locked } : item,
                              ),
                            }));
                          }}
                          className={cn(
                            "p-1",
                            el.locked ? "text-amber-500" : "text-zinc-400 hover:text-zinc-700",
                          )}
                        >
                          {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {artboardTab === "project" && (
            <div className="space-y-3.5">
              <TextField
                size="sm"
                label="Título da Tela"
                value={config.title}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, title: e.target.value }), false)
                }
              />
              <TextField
                size="sm"
                label="Rota Sugerida (App Router)"
                value={config.route}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, route: e.target.value }), false)
                }
              />
              <TextField
                size="sm"
                label="Nome do Componente TSX Exportado"
                value={config.exportName}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, exportName: e.target.value }), false)
                }
              />
              <div className="space-y-1.5">
                <TextField
                  size="sm"
                  label="Prefixo RBAC (componentId)"
                  value={config.componentIdPrefix}
                  onChange={(e) =>
                    onUpdateConfig(
                      (prev) => ({ ...prev, componentIdPrefix: e.target.value }),
                      false,
                    )
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  leftIcon={<ShieldCheck size={13} />}
                  onClick={() => {
                    const prefix = config.componentIdPrefix.trim().replace(/\.$/, "") || "app.ui";
                    onUpdateConfig((prev) => ({
                      ...prev,
                      elements: prev.elements.map((el, i) => ({
                        ...el,
                        componentId: `${prefix}.${el.type}.${i + 1}`,
                      })),
                    }));
                    toast.success("IDs de acesso RBAC padronizados em todos os elementos!");
                  }}
                >
                  Padronizar componentId em Todos
                </Button>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 p-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Diagnóstico da Tela
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500">Elementos:</span>{" "}
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {config.elements.length}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Grupos:</span>{" "}
                    <strong className="text-zinc-900 dark:text-zinc-100">{groupCount}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Largura Útil:</span>{" "}
                    <strong className="text-zinc-900 dark:text-zinc-100">{usableWidth}px</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Bloqueados:</span>{" "}
                    <strong className="text-zinc-900 dark:text-zinc-100">{lockedCount}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  size="sm"
                  variant="destructive"
                  fullWidth
                  leftIcon={<Trash2 size={13} />}
                  disabled={config.elements.length === 0}
                  onClick={onClearCanvas}
                >
                  Limpar Todos os Elementos
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 2: MULTI-SELECTION (2+ ELEMENTS) -> GROUP & BATCH INSPECTOR
  // ═══════════════════════════════════════════════════════════════════════════
  if (selectedElements.length >= 2) {
    const bounds = getSelectionBounds(config.elements, selectedIds);
    const sharedGroupIds = new Set(selectedElements.map((e) => e.groupId).filter(Boolean));
    const isSingleGroup =
      sharedGroupIds.size === 1 && selectedElements.every((e) => Boolean(e.groupId));
    const allLocked = selectedElements.every((e) => e.locked);

    const nudgeGroup = (dx: number, dy: number) => {
      const idSet = new Set(selectedIds);
      onUpdateConfig((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          idSet.has(el.id) && !el.locked
            ? { ...el, x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) }
            : el,
        ),
      }));
    };

    const applyBatchStyle = (patch: Partial<UIElementStyle>) => {
      const idSet = new Set(selectedIds);
      onUpdateConfig((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          idSet.has(el.id) ? { ...el, style: { ...(el.style || {}), ...patch } } : el,
        ),
      }));
    };

    return (
      <aside className="w-80 shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full select-none">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-sky-50/60 dark:bg-sky-950/25">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Multisseleção ({selectedElements.length} itens)
              </span>
            </div>
            {isSingleGroup && <Badge label="Agrupado" variant="info" size="xs" />}
          </div>
          {bounds && (
            <p className="mt-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              Caixa: X {bounds.minX}, Y {bounds.minY} · {bounds.width}×{bounds.height} px
            </p>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 text-xs">
          {/* Group / Lock Actions */}
          <div className="grid grid-cols-2 gap-2">
            {isSingleGroup ? (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Ungroup size={13} />}
                onClick={onUngroup}
              >
                Desagrupar
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Group size={13} />}
                onClick={onGroup}
              >
                Agrupar (Ctrl+G)
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              leftIcon={allLocked ? <Unlock size={13} /> : <Lock size={13} />}
              onClick={() => {
                const idSet = new Set(selectedIds);
                onUpdateConfig((prev) => ({
                  ...prev,
                  elements: prev.elements.map((el) =>
                    idSet.has(el.id) ? { ...el, locked: !allLocked } : el,
                  ),
                }));
              }}
            >
              {allLocked ? "Desbloquear" : "Bloquear Lote"}
            </Button>
          </div>

          {/* 6-Way Alignment */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Alinhamento 2D
              </span>
              <button
                type="button"
                onClick={() => setAlignToArtboardInGroup((v) => !v)}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer",
                  alignToArtboardInGroup
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
                )}
              >
                {alignToArtboardInGroup ? "Ref: Prancheta" : "Ref: Seleção"}
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {(
                [
                  { mode: "left", icon: AlignStartVertical, title: "Alinhar à Esquerda" },
                  { mode: "center", icon: AlignCenterVertical, title: "Centralizar Horizontal" },
                  { mode: "right", icon: AlignEndVertical, title: "Alinhar à Direita" },
                  { mode: "top", icon: AlignStartHorizontal, title: "Alinhar ao Topo" },
                  { mode: "middle", icon: AlignCenterHorizontal, title: "Centralizar Vertical" },
                  { mode: "bottom", icon: AlignEndHorizontal, title: "Alinhar à Base" },
                ] as const
              ).map(({ mode, icon: Icon, title }) => (
                <button
                  key={mode}
                  type="button"
                  title={title}
                  onClick={() => onAlign(mode, alignToArtboardInGroup)}
                  className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center cursor-pointer transition-colors duration-150"
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <Button
                size="sm"
                variant="outline"
                disabled={selectedElements.length < 3}
                leftIcon={<AlignHorizontalDistributeCenter size={13} />}
                onClick={() => onDistribute("H")}
              >
                Distribuir H
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedElements.length < 3}
                leftIcon={<AlignVerticalDistributeCenter size={13} />}
                onClick={() => onDistribute("V")}
              >
                Distribuir V
              </Button>
            </div>
          </div>

          {/* Match Dimensions */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Igualar Dimensões (pelo 1º selecionado)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <Button size="sm" variant="outline" onClick={() => onMatchSize("W")}>
                Largura
              </Button>
              <Button size="sm" variant="outline" onClick={() => onMatchSize("H")}>
                Altura
              </Button>
              <Button size="sm" variant="outline" onClick={() => onMatchSize("BOTH")}>
                W × H
              </Button>
            </div>
          </div>

          {/* Smart Auto-Arrange Row / Stack */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                Auto-Layout Inteligente
              </span>
              <div className="flex items-center gap-1">
                {[8, 16, 24].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setArrangeGap(g)}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-mono cursor-pointer",
                      arrangeGap === g
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
                    )}
                  >
                    {g}px
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Columns3 size={13} />}
                onClick={() => onAutoArrange("row", arrangeGap, false)}
              >
                Em Linha (Row)
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Rows3 size={13} />}
                onClick={() => onAutoArrange("column", arrangeGap, false)}
              >
                Em Pilha (Stack)
              </Button>
            </div>
            <Button
              size="sm"
              variant="secondary"
              fullWidth
              leftIcon={<Maximize2 size={13} />}
              onClick={() => onAutoArrange("row", arrangeGap, true)}
            >
              Dividir Largura Útil em {selectedElements.length} Colunas Iguais
            </Button>
          </div>

          {/* Group Nudge */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Ajuste Fino do Grupo (px)
            </span>
            <div className="grid grid-cols-4 gap-1">
              <Button size="sm" variant="outline" onClick={() => nudgeGroup(-8, 0)}>
                X -8
              </Button>
              <Button size="sm" variant="outline" onClick={() => nudgeGroup(8, 0)}>
                X +8
              </Button>
              <Button size="sm" variant="outline" onClick={() => nudgeGroup(0, -8)}>
                Y -8
              </Button>
              <Button size="sm" variant="outline" onClick={() => nudgeGroup(0, 8)}>
                Y +8
              </Button>
            </div>
          </div>

          {/* Batch Style */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Estilo de Container em Lote
            </span>
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                size="sm"
                label="Sombra"
                placeholder="Aplicar..."
                options={[
                  { value: "none", label: "Sem sombra" },
                  { value: "sm", label: "Suave (sm)" },
                  { value: "md", label: "Média (md)" },
                  { value: "lg", label: "Elevada (lg)" },
                ]}
                onChange={(v) => applyBatchStyle({ shadow: v as UIElementStyle["shadow"] })}
              />
              <NumberField
                size="sm"
                label="Raio Borda"
                suffix="px"
                min={0}
                max={32}
                placeholder="12"
                onValueChange={(v) => {
                  if (v !== undefined) applyBatchStyle({ borderRadius: v });
                }}
              />
            </div>
          </div>

          {/* Batch Duplicate / Delete */}
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Copy size={13} />}
              onClick={onDuplicateSelected}
            >
              Duplicar Lote
            </Button>
            <Button
              size="sm"
              variant="destructive"
              leftIcon={<Trash2 size={13} />}
              onClick={onDeleteSelected}
            >
              Excluir Lote
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 3: SINGLE ELEMENT SELECTED -> PROPS & DADOS | GEOMETRIA | ESTILO
  // ═══════════════════════════════════════════════════════════════════════════
  const el = singleElement!;
  const p = el.props;
  const st = el.style || {};
  const meta = CATALOG_BY_TYPE[el.type];
  const MetaIcon = resolveIcon(meta?.iconName);

  const renderArrayRowControls = <T,>(
    arr: T[],
    index: number,
    propKey: string,
  ) => (
    <div className="flex items-center gap-0.5 shrink-0">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => {
          const copy = [...arr];
          [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
          updateSingleProp(propKey, copy);
        }}
        className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
      >
        <ArrowUp size={11} />
      </button>
      <button
        type="button"
        disabled={index === arr.length - 1}
        onClick={() => {
          const copy = [...arr];
          [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
          updateSingleProp(propKey, copy);
        }}
        className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
      >
        <ArrowDown size={11} />
      </button>
      <button
        type="button"
        onClick={() => {
          updateSingleProp(
            propKey,
            arr.filter((_, i) => i !== index),
          );
        }}
        className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-rose-500"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );

  return (
    <aside className="w-80 shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full select-none">
      {/* Element Header */}
      <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <MetaIcon size={14} />
            </span>
            <input
              type="text"
              value={el.name}
              onChange={(e) => updateSingleElement({ name: e.target.value }, false)}
              aria-label="Nome da camada"
              className="min-w-0 flex-1 rounded-md border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-indigo-500 bg-transparent px-1.5 py-0.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              title="Duplicar (Ctrl+D)"
              onClick={onDuplicateSelected}
              className="h-6 w-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              title={el.locked ? "Desbloquear" : "Bloquear"}
              onClick={() => updateSingleElement({ locked: !el.locked })}
              className={cn(
                "h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800",
                el.locked ? "text-amber-500" : "text-zinc-400 hover:text-zinc-700",
              )}
            >
              {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
            <button
              type="button"
              title="Excluir (Del)"
              onClick={onDeleteSelected}
              className="h-6 w-6 rounded flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* 3 Tabs */}
        <div className="grid grid-cols-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 p-0.5 text-[11px] font-semibold">
          {(
            [
              { id: "props", label: "Props & Dados", icon: Sliders },
              { id: "geometry", label: "Geometria", icon: Maximize2 },
              { id: "style", label: "Estilo", icon: Palette },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSingleTab(id)}
              className={cn(
                "rounded-md py-1.5 flex items-center justify-center gap-1 transition-colors duration-150 cursor-pointer",
                singleTab === id
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
              )}
            >
              <Icon size={11} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Inspector Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* ─── TAB 1: PROPS & DADOS ───────────────────────────────────────── */}
        {singleTab === "props" && (
          <>
            {/* RBAC Identifier */}
            <TextField
              size="sm"
              label="Identificador RBAC (componentId)"
              placeholder="app.modulo.acao"
              value={el.componentId || ""}
              onChange={(e) => updateSingleElement({ componentId: e.target.value }, false)}
            />

            {/* Type-specific Rich Editors */}
            {el.type === "container_panel" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <Switch
                  size="sm"
                  label="Exibir Cabeçalho da Seção"
                  checked={asBool(p.showHeader, true)}
                  onChange={(v) => updateSingleProp("showHeader", v)}
                />
                {asBool(p.showHeader, true) && (
                  <>
                    <TextField
                      size="sm"
                      label="Título da Seção"
                      value={asStr(p.title)}
                      onChange={(e) => updateSingleProp("title", e.target.value)}
                    />
                    <TextField
                      size="sm"
                      label="Subtítulo"
                      value={asStr(p.subtitle)}
                      onChange={(e) => updateSingleProp("subtitle", e.target.value)}
                    />
                  </>
                )}
                <SelectField
                  size="sm"
                  label="Tom da Superfície"
                  value={asStr(p.tone, "surface")}
                  options={[
                    { value: "surface", label: "Branco / Surface Card" },
                    { value: "muted", label: "Cinza Suave (Muted)" },
                    { value: "brand", label: "Destaque Indigo" },
                    { value: "transparent", label: "Transparente (Wireframe)" },
                  ]}
                  onChange={(v) => updateSingleProp("tone", v)}
                />
                <Switch
                  size="sm"
                  label="Borda Tracejada"
                  checked={asBool(p.dashed, false)}
                  onChange={(v) => updateSingleProp("dashed", v)}
                />
              </div>
            )}

            {el.type === "card" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título do Card"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Subtítulo"
                  value={asStr(p.description)}
                  onChange={(e) => updateSingleProp("description", e.target.value)}
                />
                <TextareaField
                  size="sm"
                  label="Conteúdo do Corpo"
                  rows={3}
                  value={asStr(p.body)}
                  onChange={(e) => updateSingleProp("body", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Variante"
                    value={asStr(p.variant, "default")}
                    options={[
                      { value: "default", label: "Default" },
                      { value: "outlined", label: "Outlined" },
                      { value: "elevated", label: "Elevated" },
                      { value: "filled", label: "Filled" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Cor Temática"
                    value={asStr(p.color, "primary")}
                    options={[
                      { value: "default", label: "Neutro" },
                      { value: "primary", label: "Indigo" },
                      { value: "success", label: "Emerald" },
                      { value: "warning", label: "Amber" },
                      { value: "danger", label: "Danger" },
                      { value: "info", label: "Sky" },
                      { value: "teal", label: "Teal" },
                    ]}
                    onChange={(v) => updateSingleProp("color", v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Ícone"
                    searchable
                    value={asStr(p.iconName, "Sofa")}
                    options={ICON_SELECT_OPTIONS}
                    onChange={(v) => updateSingleProp("iconName", v)}
                  />
                  <TextField
                    size="sm"
                    label="Badge Topo"
                    value={asStr(p.badgeText)}
                    onChange={(e) => updateSingleProp("badgeText", e.target.value)}
                  />
                </div>
                <Switch
                  size="sm"
                  label="Barra Superior de Destaque (Accent)"
                  checked={asBool(p.accent, true)}
                  onChange={(v) => updateSingleProp("accent", v)}
                />
                <Switch
                  size="sm"
                  label="Exibir Rodapé com Ações"
                  checked={asBool(p.showFooter, true)}
                  onChange={(v) => updateSingleProp("showFooter", v)}
                />
                {asBool(p.showFooter, true) && (
                  <div className="grid grid-cols-2 gap-2">
                    <TextField
                      size="sm"
                      label="CTA Primário"
                      value={asStr(p.footerPrimary)}
                      onChange={(e) => updateSingleProp("footerPrimary", e.target.value)}
                    />
                    <TextField
                      size="sm"
                      label="CTA Secundário"
                      value={asStr(p.footerSecondary)}
                      onChange={(e) => updateSingleProp("footerSecondary", e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {el.type === "typography" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Texto Principal"
                  value={asStr(p.text)}
                  onChange={(e) => updateSingleProp("text", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Subtexto Opcional"
                  value={asStr(p.subtext)}
                  onChange={(e) => updateSingleProp("subtext", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Hierarquia"
                    value={asStr(p.level, "h2")}
                    options={[
                      { value: "h1", label: "H1 (24px)" },
                      { value: "h2", label: "H2 (18px)" },
                      { value: "h3", label: "H3 (16px)" },
                      { value: "body", label: "Parágrafo (14px)" },
                      { value: "eyebrow", label: "Eyebrow / Rótulo" },
                    ]}
                    onChange={(v) => updateSingleProp("level", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Peso"
                    value={asStr(p.weight, "bold")}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "medium", label: "Medium" },
                      { value: "semibold", label: "Semibold" },
                      { value: "bold", label: "Bold" },
                      { value: "extrabold", label: "Extrabold" },
                    ]}
                    onChange={(v) => updateSingleProp("weight", v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Alinhamento"
                    value={asStr(p.align, "left")}
                    options={[
                      { value: "left", label: "Esquerda" },
                      { value: "center", label: "Centro" },
                      { value: "right", label: "Direita" },
                    ]}
                    onChange={(v) => updateSingleProp("align", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Cor"
                    value={asStr(p.tone, "default")}
                    options={[
                      { value: "default", label: "Padrão" },
                      { value: "muted", label: "Secundário" },
                      { value: "primary", label: "Indigo" },
                      { value: "emerald", label: "Emerald" },
                    ]}
                    onChange={(v) => updateSingleProp("tone", v)}
                  />
                </div>
              </div>
            )}

            {el.type === "separator" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <SelectField
                  size="sm"
                  label="Orientação"
                  value={asStr(p.orientation, "horizontal")}
                  options={[
                    { value: "horizontal", label: "Horizontal" },
                    { value: "vertical", label: "Vertical" },
                  ]}
                  onChange={(v) => updateSingleProp("orientation", v)}
                />
                <TextField
                  size="sm"
                  label="Rótulo do Divisor"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                <SelectField
                  size="sm"
                  label="Posição do Rótulo"
                  value={asStr(p.labelAlign, "center")}
                  options={[
                    { value: "start", label: "Início (Esquerda)" },
                    { value: "center", label: "Centro" },
                    { value: "end", label: "Fim (Direita)" },
                  ]}
                  onChange={(v) => updateSingleProp("labelAlign", v)}
                />
              </div>
            )}

            {el.type === "page_header" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título Principal"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <TextareaField
                  size="sm"
                  label="Descrição / Subtítulo"
                  rows={2}
                  value={asStr(p.description)}
                  onChange={(e) => updateSingleProp("description", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Ícone"
                    searchable
                    value={asStr(p.iconName, "Store")}
                    options={ICON_SELECT_OPTIONS}
                    onChange={(v) => updateSingleProp("iconName", v)}
                  />
                  <TextField
                    size="sm"
                    label="Status Badge"
                    value={asStr(p.badgeText)}
                    onChange={(e) => updateSingleProp("badgeText", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    size="sm"
                    label="Botão Primário"
                    value={asStr(p.primaryAction)}
                    onChange={(e) => updateSingleProp("primaryAction", e.target.value)}
                  />
                  <TextField
                    size="sm"
                    label="Botão Secundário"
                    value={asStr(p.secondaryAction)}
                    onChange={(e) => updateSingleProp("secondaryAction", e.target.value)}
                  />
                </div>
              </div>
            )}

            {el.type === "breadcrumb" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Separador"
                    value={asStr(p.separator, "chevron")}
                    options={[
                      { value: "chevron", label: "Seta (>)" },
                      { value: "slash", label: "Barra (/)" },
                      { value: "dot", label: "Ponto (·)" },
                    ]}
                    onChange={(v) => updateSingleProp("separator", v)}
                  />
                  <div className="pt-5">
                    <Switch
                      size="sm"
                      label="Ícone Home"
                      checked={asBool(p.homeIcon, true)}
                      onChange={(v) => updateSingleProp("homeIcon", v)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Níveis</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.items) ? [...p.items] : [];
                        cur.push({ label: "Nova Seção" });
                        updateSingleProp("items", cur);
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                  {(Array.isArray(p.items) ? p.items : []).map((it, idx, arr) => {
                    const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={asStr(obj.label)}
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, label: e.target.value };
                            updateSingleProp("items", next);
                          }}
                          className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs"
                        />
                        {renderArrayRowControls(arr, idx, "items")}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "tabs" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Estilo"
                    value={asStr(p.variant, "pills")}
                    options={[
                      { value: "pills", label: "Pills" },
                      { value: "underline", label: "Underline" },
                      { value: "enclosed", label: "Enclosed" },
                      { value: "lifted", label: "Lifted" },
                      { value: "bordered", label: "Bordered" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Tamanho"
                    value={asStr(p.size, "md")}
                    options={[
                      { value: "sm", label: "Pequeno" },
                      { value: "md", label: "Médio" },
                      { value: "lg", label: "Grande" },
                    ]}
                    onChange={(v) => updateSingleProp("size", v)}
                  />
                </div>
                <Switch
                  size="sm"
                  label="Exibir Conteúdo da Aba Ativa"
                  checked={asBool(p.showPanelContent, true)}
                  onChange={(v) => updateSingleProp("showPanelContent", v)}
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Abas</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.items) ? [...p.items] : [];
                        cur.push({
                          value: `aba_${cur.length + 1}`,
                          label: `Nova Aba ${cur.length + 1}`,
                          badge: "12",
                          content: "Conteúdo descritivo da aba selecionada.",
                        });
                        updateSingleProp("items", cur);
                      }}
                    >
                      Aba
                    </Button>
                  </div>
                  {(Array.isArray(p.items) ? p.items : []).map((it, idx, arr) => {
                    const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 space-y-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={asStr(obj.label)}
                            placeholder="Rótulo"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, label: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="flex-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs"
                          />
                          <input
                            type="text"
                            value={asStr(obj.badge)}
                            placeholder="Badge"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, badge: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="w-14 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-1 text-xs text-center"
                          />
                          {renderArrayRowControls(arr, idx, "items")}
                        </div>
                        <input
                          type="text"
                          value={asStr(obj.content)}
                          placeholder="Texto interno da aba..."
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, content: e.target.value };
                            updateSingleProp("items", next);
                          }}
                          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-2 py-1 text-[11px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "segmented_control" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Tamanho"
                    value={asStr(p.size, "sm")}
                    options={[
                      { value: "xs", label: "XS" },
                      { value: "sm", label: "SM" },
                      { value: "md", label: "MD" },
                    ]}
                    onChange={(v) => updateSingleProp("size", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Variante"
                    value={asStr(p.variant, "default")}
                    options={[
                      { value: "default", label: "Default" },
                      { value: "primary", label: "Primary" },
                      { value: "outline", label: "Outline" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                </div>
                <Switch
                  size="sm"
                  label="Ocupar 100% da Largura"
                  checked={asBool(p.fullWidth, true)}
                  onChange={(v) => updateSingleProp("fullWidth", v)}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Opções</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.items) ? [...p.items] : [];
                        cur.push({ value: `opt_${cur.length + 1}`, label: `Opção ${cur.length + 1}` });
                        updateSingleProp("items", cur);
                      }}
                    >
                      Opção
                    </Button>
                  </div>
                  {(Array.isArray(p.items) ? p.items : []).map((it, idx, arr) => {
                    const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={asStr(obj.label)}
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, label: e.target.value };
                            updateSingleProp("items", next);
                          }}
                          className="flex-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs"
                        />
                        {renderArrayRowControls(arr, idx, "items")}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "stepper" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    size="sm"
                    label="Etapa Ativa (0..N)"
                    min={0}
                    max={10}
                    showControls
                    value={asNum(p.activeStep, 1)}
                    onValueChange={(v) => updateSingleProp("activeStep", v ?? 0)}
                  />
                  <SelectField
                    size="sm"
                    label="Orientação"
                    value={asStr(p.orientation, "horizontal")}
                    options={[
                      { value: "horizontal", label: "Horizontal" },
                      { value: "vertical", label: "Vertical" },
                    ]}
                    onChange={(v) => updateSingleProp("orientation", v)}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Etapas</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.steps) ? [...p.steps] : [];
                        cur.push({ title: `Etapa ${cur.length + 1}`, description: "Descrição" });
                        updateSingleProp("steps", cur);
                      }}
                    >
                      Etapa
                    </Button>
                  </div>
                  {(Array.isArray(p.steps) ? p.steps : []).map((stItem, idx, arr) => {
                    const obj = (stItem && typeof stItem === "object" ? stItem : {}) as Record<string, unknown>;
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 space-y-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={asStr(obj.title)}
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, title: e.target.value };
                              updateSingleProp("steps", next);
                            }}
                            className="flex-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs font-medium"
                          />
                          {renderArrayRowControls(arr, idx, "steps")}
                        </div>
                        <input
                          type="text"
                          value={asStr(obj.description)}
                          placeholder="Subtítulo..."
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, description: e.target.value };
                            updateSingleProp("steps", next);
                          }}
                          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-2 py-1 text-[11px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "stat_card" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título do KPI"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    size="sm"
                    label="Valor Principal"
                    value={asStr(p.value)}
                    onChange={(e) => updateSingleProp("value", e.target.value)}
                  />
                  <TextField
                    size="sm"
                    label="Unidade / Contexto"
                    value={asStr(p.unit)}
                    onChange={(e) => updateSingleProp("unit", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Cor"
                    value={asStr(p.color, "indigo")}
                    options={[
                      { value: "indigo", label: "Indigo" },
                      { value: "emerald", label: "Emerald" },
                      { value: "amber", label: "Amber" },
                      { value: "blue", label: "Blue" },
                      { value: "teal", label: "Teal" },
                      { value: "violet", label: "Violet" },
                      { value: "red", label: "Red" },
                    ]}
                    onChange={(v) => updateSingleProp("color", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Ícone"
                    searchable
                    value={asStr(p.iconName, "ShoppingBag")}
                    options={ICON_SELECT_OPTIONS}
                    onChange={(v) => updateSingleProp("iconName", v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    size="sm"
                    label="Tendência (%)"
                    suffix="%"
                    value={asNum(p.trendValue, 0)}
                    onValueChange={(v) => updateSingleProp("trendValue", v ?? 0)}
                  />
                  <NumberField
                    size="sm"
                    label="Meta (0–100%)"
                    suffix="%"
                    min={0}
                    max={100}
                    value={asNum(p.progress, 80)}
                    onValueChange={(v) => updateSingleProp("progress", v)}
                  />
                </div>
                <TextField
                  size="sm"
                  label="Rótulo da Meta"
                  value={asStr(p.progressLabel)}
                  onChange={(e) => updateSingleProp("progressLabel", e.target.value)}
                />
                <Switch
                  size="sm"
                  label="Exibir Mini-Gráfico (Sparkline)"
                  checked={asBool(p.showSparkline, true)}
                  onChange={(v) => updateSingleProp("showSparkline", v)}
                />
              </div>
            )}

            {el.type === "chart" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <SelectField
                  size="sm"
                  label="Tipo de Gráfico"
                  value={asStr(p.type, "bar")}
                  options={[
                    { value: "bar", label: "Barras (Bar)" },
                    { value: "area", label: "Área Suave (Area)" },
                    { value: "line", label: "Linhas (Line)" },
                    { value: "donut", label: "Rosca (Donut)" },
                  ]}
                  onChange={(v) => updateSingleProp("type", v)}
                />
                <TextField
                  size="sm"
                  label="Título do Gráfico"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Subtítulo"
                  value={asStr(p.subtitle)}
                  onChange={(e) => updateSingleProp("subtitle", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Switch
                    size="sm"
                    label="Legenda"
                    checked={asBool(p.showLegend, true)}
                    onChange={(v) => updateSingleProp("showLegend", v)}
                  />
                  <Switch
                    size="sm"
                    label="Empilhado"
                    checked={asBool(p.stacked, false)}
                    onChange={(v) => updateSingleProp("stacked", v)}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Séries</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.series) ? [...p.series] : [];
                        cur.push({ key: `serie_${cur.length + 1}`, label: "Nova Série", color: "sky" });
                        updateSingleProp("series", cur);
                      }}
                    >
                      Série
                    </Button>
                  </div>
                  {(Array.isArray(p.series) ? p.series : []).map((s, idx, arr) => {
                    const obj = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={asStr(obj.label)}
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, label: e.target.value };
                            updateSingleProp("series", next);
                          }}
                          className="flex-1 min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs"
                        />
                        <select
                          value={asStr(obj.color, "indigo")}
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, color: e.target.value };
                            updateSingleProp("series", next);
                          }}
                          className="w-20 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1 py-1 text-[11px]"
                        >
                          <option value="indigo">Indigo</option>
                          <option value="emerald">Emerald</option>
                          <option value="sky">Sky</option>
                          <option value="amber">Amber</option>
                          <option value="rose">Rose</option>
                          <option value="violet">Violet</option>
                        </select>
                        {renderArrayRowControls(arr, idx, "series")}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Pontos de Dados</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const curData = Array.isArray(p.data) ? [...p.data] : [];
                        const curSeries = Array.isArray(p.series) ? p.series : [];
                        const newPoint: Record<string, unknown> = {
                          label: `Período ${curData.length + 1}`,
                        };
                        curSeries.forEach((s, sIdx) => {
                          const sObj = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
                          const sKey = asStr(sObj.key, `s${sIdx + 1}`);
                          newPoint[sKey] = 100;
                        });
                        curData.push(newPoint);
                        updateSingleProp("data", curData);
                      }}
                    >
                      Ponto
                    </Button>
                  </div>
                  {(Array.isArray(p.data) ? p.data : []).map((d, idx, arr) => {
                    const obj = (d && typeof d === "object" ? d : {}) as Record<string, unknown>;
                    const seriesList = Array.isArray(p.series) ? p.series : [];
                    return (
                      <div
                        key={idx}
                        className="rounded border border-zinc-200 dark:border-zinc-800 p-1.5 space-y-1"
                      >
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={asStr(obj.label)}
                            placeholder="Eixo X"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, label: e.target.value };
                              updateSingleProp("data", next);
                            }}
                            className="flex-1 min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[11px] font-semibold"
                          />
                          {renderArrayRowControls(arr, idx, "data")}
                        </div>
                        {seriesList.length > 0 && (
                          <div className="grid grid-cols-2 gap-1">
                            {seriesList.map((s, sIdx) => {
                              const sObj = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
                              const sKey = asStr(sObj.key, `s${sIdx + 1}`);
                              const sLabel = asStr(sObj.label, sKey);
                              return (
                                <label key={sKey} className="flex items-center gap-1 text-[10px] text-zinc-500">
                                  <span className="truncate max-w-[54px]" title={sLabel}>
                                    {sLabel}:
                                  </span>
                                  <input
                                    type="number"
                                    value={asNum(obj[sKey], 0)}
                                    onChange={(e) => {
                                      const next = [...arr];
                                      next[idx] = { ...obj, [sKey]: Number(e.target.value) || 0 };
                                      updateSingleProp("data", next);
                                    }}
                                    className="w-full min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1 py-0.5 text-[11px] font-mono text-zinc-800 dark:text-zinc-200"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "progress" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Rótulo"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    size="sm"
                    label="Valor Atual"
                    min={0}
                    max={asNum(p.max, 100)}
                    value={asNum(p.value, 75)}
                    onValueChange={(v) => updateSingleProp("value", v ?? 0)}
                  />
                  <SelectField
                    size="sm"
                    label="Tom"
                    value={asStr(p.tone, "primary")}
                    options={[
                      { value: "primary", label: "Indigo" },
                      { value: "success", label: "Success" },
                      { value: "warning", label: "Warning" },
                      { value: "danger", label: "Danger" },
                      { value: "info", label: "Info" },
                    ]}
                    onChange={(v) => updateSingleProp("tone", v)}
                  />
                </div>
                <SelectField
                  size="sm"
                  label="Formato"
                  value={asStr(p.variant, "linear")}
                  options={[
                    { value: "linear", label: "Barra Linear" },
                    { value: "circular", label: "Medidor Circular" },
                  ]}
                  onChange={(v) => updateSingleProp("variant", v)}
                />
              </div>
            )}

            {el.type === "service_status_card" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Nome do Serviço"
                  value={asStr(p.name)}
                  onChange={(e) => updateSingleProp("name", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Descrição"
                  value={asStr(p.description)}
                  onChange={(e) => updateSingleProp("description", e.target.value)}
                />
                <SelectField
                  size="sm"
                  label="Estado Operacional"
                  value={asStr(p.status, "operational")}
                  options={[
                    { value: "operational", label: "Operacional (Verde)" },
                    { value: "degraded", label: "Degradado (Âmbar)" },
                    { value: "maintenance", label: "Em Manutenção (Azul)" },
                    { value: "outage", label: "Indisponível (Vermelho)" },
                  ]}
                  onChange={(v) => updateSingleProp("status", v)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    size="sm"
                    label="Latência"
                    suffix="ms"
                    value={asNum(p.latencyMs, 64)}
                    onValueChange={(v) => updateSingleProp("latencyMs", v ?? 0)}
                  />
                  <NumberField
                    size="sm"
                    label="Uptime"
                    suffix="%"
                    value={asNum(p.uptimePct, 99.96)}
                    onValueChange={(v) => updateSingleProp("uptimePct", v ?? 99.9)}
                  />
                </div>
              </div>
            )}

            {el.type === "table" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Variante"
                    value={asStr(p.variant, "default")}
                    options={[
                      { value: "default", label: "Default" },
                      { value: "striped", label: "Striped" },
                      { value: "bordered", label: "Bordered" },
                      { value: "minimal", label: "Minimal" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Densidade"
                    value={asStr(p.size, "sm")}
                    options={[
                      { value: "xs", label: "Compacta (XS)" },
                      { value: "sm", label: "Padrão ERP (SM)" },
                      { value: "md", label: "Confortável (MD)" },
                    ]}
                    onChange={(v) => updateSingleProp("size", v)}
                  />
                </div>
                <Switch
                  size="sm"
                  label="Linhas Zebradas"
                  checked={asBool(p.zebra, true)}
                  onChange={(v) => updateSingleProp("zebra", v)}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Colunas da Grade</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cols = Array.isArray(p.columns) ? [...p.columns] : [];
                        cols.push({
                          key: `col_${cols.length + 1}`,
                          label: "Nova Coluna",
                          align: "left",
                          sortable: true,
                        });
                        updateSingleProp("columns", cols);
                      }}
                    >
                      Coluna
                    </Button>
                  </div>
                  {(Array.isArray(p.columns) ? p.columns : []).map((col, idx, arr) => {
                    const obj = (col && typeof col === "object" ? col : {}) as Record<string, unknown>;
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={asStr(obj.label)}
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, label: e.target.value };
                            updateSingleProp("columns", next);
                          }}
                          className="flex-1 min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs"
                        />
                        <select
                          value={asStr(obj.align, "left")}
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, align: e.target.value };
                            updateSingleProp("columns", next);
                          }}
                          className="w-16 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1 py-1 text-[11px]"
                        >
                          <option value="left">Esq.</option>
                          <option value="center">Centro</option>
                          <option value="right">Dir.</option>
                        </select>
                        {renderArrayRowControls(arr, idx, "columns")}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Linhas da Grade</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const curRows = Array.isArray(p.rows) ? [...p.rows] : [];
                        const cols = Array.isArray(p.columns) ? p.columns : [];
                        const newRow: Record<string, unknown> = {};
                        cols.forEach((c, cIdx) => {
                          const cObj = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
                          const cKey = asStr(cObj.key, `col_${cIdx + 1}`);
                          newRow[cKey] = cKey.toLowerCase().includes("status") ? "Ativo" : "-";
                        });
                        curRows.push(newRow);
                        updateSingleProp("rows", curRows);
                      }}
                    >
                      Linha
                    </Button>
                  </div>
                  {(Array.isArray(p.rows) ? p.rows : []).map((r, rIdx, arr) => {
                    const rowObj = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
                    const cols = Array.isArray(p.columns) ? p.columns : [];
                    return (
                      <div
                        key={rIdx}
                        className="rounded border border-zinc-200 dark:border-zinc-800 p-1.5 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Linha #{rIdx + 1}
                          </span>
                          {renderArrayRowControls(arr, rIdx, "rows")}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {cols.map((c, cIdx) => {
                            const cObj = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
                            const cKey = asStr(cObj.key, `col_${cIdx + 1}`);
                            const cLabel = asStr(cObj.label, cKey);
                            return (
                              <input
                                key={cKey}
                                type="text"
                                title={cLabel}
                                placeholder={cLabel}
                                value={asStr(rowObj[cKey])}
                                onChange={(e) => {
                                  const next = [...arr];
                                  next[rIdx] = { ...rowObj, [cKey]: e.target.value };
                                  updateSingleProp("rows", next);
                                }}
                                className="min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "filter_bar" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Texto Botão Limpar"
                  value={asStr(p.clearAllLabel, "Limpar filtros")}
                  onChange={(e) => updateSingleProp("clearAllLabel", e.target.value)}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Chips de Filtro</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.filters) ? [...p.filters] : [];
                        cur.push({ id: `f_${cur.length + 1}`, label: "Filial", value: "Porto Velho (RO)" });
                        updateSingleProp("filters", cur);
                      }}
                    >
                      Chip
                    </Button>
                  </div>
                  {(Array.isArray(p.filters) ? p.filters : []).map((flt, idx, arr) => {
                    const obj = (flt && typeof flt === "object" ? flt : {}) as Record<string, unknown>;
                    return (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={asStr(obj.label)}
                          placeholder="Campo"
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, label: e.target.value };
                            updateSingleProp("filters", next);
                          }}
                          className="w-20 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={asStr(obj.value)}
                          placeholder="Valor"
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, value: e.target.value };
                            updateSingleProp("filters", next);
                          }}
                          className="flex-1 min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-1 text-xs"
                        />
                        {renderArrayRowControls(arr, idx, "filters")}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "description_list" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Layout"
                    value={asStr(p.layout, "grid")}
                    options={[
                      { value: "grid", label: "Grade (Grid)" },
                      { value: "horizontal", label: "Horizontal" },
                      { value: "stacked", label: "Empilhado" },
                    ]}
                    onChange={(v) => updateSingleProp("layout", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Colunas"
                    value={String(asNum(p.columns, 2))}
                    options={[
                      { value: "2", label: "2 Colunas" },
                      { value: "3", label: "3 Colunas" },
                      { value: "4", label: "4 Colunas" },
                    ]}
                    onChange={(v) => updateSingleProp("columns", Number(v))}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Atributos</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.items) ? [...p.items] : [];
                        cur.push({ label: "Atributo", value: "Valor" });
                        updateSingleProp("items", cur);
                      }}
                    >
                      Item
                    </Button>
                  </div>
                  {(Array.isArray(p.items) ? p.items : []).map((it, idx, arr) => {
                    const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
                    return (
                      <div key={idx} className="space-y-1 rounded border border-zinc-200 dark:border-zinc-800 p-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={asStr(obj.label)}
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, label: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="flex-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[11px] font-semibold"
                          />
                          {renderArrayRowControls(arr, idx, "items")}
                        </div>
                        <input
                          type="text"
                          value={asStr(obj.value)}
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, value: e.target.value };
                            updateSingleProp("items", next);
                          }}
                          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "timeline" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Tamanho"
                    value={asStr(p.size, "sm")}
                    options={[
                      { value: "sm", label: "Compacto (SM)" },
                      { value: "md", label: "Médio (MD)" },
                      { value: "lg", label: "Amplo (LG)" },
                    ]}
                    onChange={(v) => updateSingleProp("size", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Conector"
                    value={asStr(p.connectorStyle, "solid")}
                    options={[
                      { value: "solid", label: "Sólido" },
                      { value: "dashed", label: "Tracejado" },
                      { value: "dotted", label: "Pontilhado" },
                    ]}
                    onChange={(v) => updateSingleProp("connectorStyle", v)}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Eventos da Linha do Tempo</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.items) ? [...p.items] : [];
                        cur.push({
                          title: "Entrega Agendada — Filial RO",
                          date: "Hoje, 16:00",
                          badge: "Logística",
                          color: "primary",
                          description: "Equipe de montagem confirmada.",
                        });
                        updateSingleProp("items", cur);
                      }}
                    >
                      Evento
                    </Button>
                  </div>
                  {(Array.isArray(p.items) ? p.items : []).map((it, idx, arr) => {
                    const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
                    return (
                      <div
                        key={idx}
                        className="space-y-1 rounded border border-zinc-200 dark:border-zinc-800 p-1.5"
                      >
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={asStr(obj.title)}
                            placeholder="Título"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, title: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="flex-1 min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[11px] font-semibold"
                          />
                          {renderArrayRowControls(arr, idx, "items")}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="text"
                            value={asStr(obj.date)}
                            placeholder="Data / Hora"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, date: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                          />
                          <input
                            type="text"
                            value={asStr(obj.badge)}
                            placeholder="Badge"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, badge: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                          />
                        </div>
                        <input
                          type="text"
                          value={asStr(obj.description)}
                          placeholder="Descrição"
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, description: e.target.value };
                            updateSingleProp("items", next);
                          }}
                          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "activity_feed" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título do Feed"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Atividades</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.events) ? [...p.events] : [];
                        cur.push({
                          id: `ev_${cur.length + 1}`,
                          title: "NF-e autorizada — Filial Manaus (92)",
                          description: "Sofá Retrátil + Geladeira Frost Free",
                          actorName: "Camila Souza",
                          timestamp: "Há 5 min",
                          color: "emerald",
                        });
                        updateSingleProp("events", cur);
                      }}
                    >
                      Atividade
                    </Button>
                  </div>
                  {(Array.isArray(p.events) ? p.events : []).map((ev, idx, arr) => {
                    const obj = (ev && typeof ev === "object" ? ev : {}) as Record<string, unknown>;
                    return (
                      <div
                        key={idx}
                        className="space-y-1 rounded border border-zinc-200 dark:border-zinc-800 p-1.5"
                      >
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={asStr(obj.title)}
                            placeholder="Título da atividade"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, title: e.target.value };
                              updateSingleProp("events", next);
                            }}
                            className="flex-1 min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[11px] font-semibold"
                          />
                          {renderArrayRowControls(arr, idx, "events")}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="text"
                            value={asStr(obj.actorName)}
                            placeholder="Responsável"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, actorName: e.target.value };
                              updateSingleProp("events", next);
                            }}
                            className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                          />
                          <input
                            type="text"
                            value={asStr(obj.timestamp)}
                            placeholder="Horário"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, timestamp: e.target.value };
                              updateSingleProp("events", next);
                            }}
                            className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                          />
                        </div>
                        <input
                          type="text"
                          value={asStr(obj.description)}
                          placeholder="Detalhe"
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, description: e.target.value };
                            updateSingleProp("events", next);
                          }}
                          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 text-[11px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "accordion" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Variante"
                    value={asStr(p.variant, "bordered")}
                    options={[
                      { value: "bordered", label: "Bordered" },
                      { value: "separated", label: "Separated" },
                      { value: "ghost", label: "Ghost" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Tamanho"
                    value={asStr(p.size, "sm")}
                    options={[
                      { value: "sm", label: "SM" },
                      { value: "md", label: "MD" },
                      { value: "lg", label: "LG" },
                    ]}
                    onChange={(v) => updateSingleProp("size", v)}
                  />
                </div>
                <Switch
                  size="sm"
                  label="Permitir múltiplas seções abertas"
                  checked={asBool(p.multiple, false)}
                  onChange={(v) => updateSingleProp("multiple", v)}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Seções Sanfona</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Plus size={12} />}
                      onClick={() => {
                        const cur = Array.isArray(p.items) ? [...p.items] : [];
                        cur.push({
                          id: `ac_${cur.length + 1}`,
                          title: `Nova Seção ${cur.length + 1}`,
                          badge: "RO / AM",
                          content: "Detalhes de garantia e montagem de móveis e eletrodomésticos.",
                        });
                        updateSingleProp("items", cur);
                      }}
                    >
                      Seção
                    </Button>
                  </div>
                  {(Array.isArray(p.items) ? p.items : []).map((it, idx, arr) => {
                    const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
                    return (
                      <div
                        key={idx}
                        className="space-y-1 rounded border border-zinc-200 dark:border-zinc-800 p-1.5"
                      >
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={asStr(obj.title)}
                            placeholder="Título da seção"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, title: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="flex-1 min-w-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[11px] font-semibold"
                          />
                          <input
                            type="text"
                            value={asStr(obj.badge)}
                            placeholder="Badge"
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, badge: e.target.value };
                              updateSingleProp("items", next);
                            }}
                            className="w-16 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1 py-0.5 text-[11px]"
                          />
                          {renderArrayRowControls(arr, idx, "items")}
                        </div>
                        <textarea
                          rows={2}
                          value={asStr(obj.content)}
                          placeholder="Conteúdo da seção"
                          onChange={(e) => {
                            const next = [...arr];
                            next[idx] = { ...obj, content: e.target.value };
                            updateSingleProp("items", next);
                          }}
                          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-1 text-[11px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {el.type === "tree_view" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Tamanho"
                    value={asStr(p.size, "sm")}
                    options={[
                      { value: "sm", label: "Compacto (SM)" },
                      { value: "md", label: "Médio (MD)" },
                    ]}
                    onChange={(v) => updateSingleProp("size", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Seleção"
                    value={asStr(p.selectionMode, "single")}
                    options={[
                      { value: "single", label: "Única" },
                      { value: "multiple", label: "Múltipla" },
                      { value: "none", label: "Somente Leitura" },
                    ]}
                    onChange={(v) => updateSingleProp("selectionMode", v)}
                  />
                </div>
                <Switch
                  size="sm"
                  label="Exibir linhas guias hierárquicas"
                  checked={asBool(p.showLines, true)}
                  onChange={(v) => updateSingleProp("showLines", v)}
                />
              </div>
            )}

            {el.type === "transfer_list" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título Lista Origem"
                  value={asStr(p.sourceTitle, "Vinculados")}
                  onChange={(e) => updateSingleProp("sourceTitle", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Título Lista Destino"
                  value={asStr(p.targetTitle, "Disponíveis")}
                  onChange={(e) => updateSingleProp("targetTitle", e.target.value)}
                />
              </div>
            )}

            {el.type === "calendar" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <SelectField
                  size="sm"
                  label="Densidade"
                  value={asStr(p.size, "sm")}
                  options={[
                    { value: "sm", label: "Compacto (SM)" },
                    { value: "md", label: "Padrão (MD)" },
                    { value: "lg", label: "Amplo (LG)" },
                  ]}
                  onChange={(v) => updateSingleProp("size", v)}
                />
                <Switch
                  size="sm"
                  label="Expandir largura total"
                  checked={asBool(p.fillWidth, true)}
                  onChange={(v) => updateSingleProp("fillWidth", v)}
                />
                <Switch
                  size="sm"
                  label="Exibir números das semanas"
                  checked={asBool(p.showWeekNumbers, false)}
                  onChange={(v) => updateSingleProp("showWeekNumbers", v)}
                />
              </div>
            )}

            {(el.type === "text_field" ||
              el.type === "textarea_field" ||
              el.type === "number_field" ||
              el.type === "price_input" ||
              el.type === "select_field" ||
              el.type === "date_picker_field" ||
              el.type === "slider_field" ||
              el.type === "rating_field") && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Label do Campo"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                {(el.type === "text_field" ||
                  el.type === "textarea_field" ||
                  el.type === "select_field" ||
                  el.type === "date_picker_field") && (
                  <TextField
                    size="sm"
                    label="Placeholder"
                    value={asStr(p.placeholder)}
                    onChange={(e) => updateSingleProp("placeholder", e.target.value)}
                  />
                )}
                {el.type === "text_field" && (
                  <>
                    <TextField
                      size="sm"
                      label="Valor Inicial"
                      value={asStr(p.defaultValue)}
                      onChange={(e) => updateSingleProp("defaultValue", e.target.value)}
                    />
                    <SelectField
                      size="sm"
                      label="Máscara Brasileira"
                      value={asStr(p.mask, "none")}
                      options={[
                        { value: "none", label: "Sem máscara (Texto livre)" },
                        { value: "cpf", label: "CPF (000.000.000-00)" },
                        { value: "cnpj", label: "CNPJ" },
                        { value: "cpf-cnpj", label: "CPF ou CNPJ Dinâmico" },
                        { value: "phone", label: "Telefone / WhatsApp (69)/(92)" },
                        { value: "cep", label: "CEP (00000-000)" },
                        { value: "plate", label: "Placa Veículo Frota" },
                        { value: "nfe-key", label: "Chave NF-e (44 dígitos)" },
                      ]}
                      onChange={(v) => updateSingleProp("mask", v)}
                    />
                  </>
                )}
                {el.type === "price_input" && (
                  <NumberField
                    size="sm"
                    label="Valor Monetário Inicial (R$)"
                    prefix="R$"
                    value={asNum(p.defaultValue, 0)}
                    onValueChange={(v) => updateSingleProp("defaultValue", v ?? 0)}
                  />
                )}
                {el.type === "number_field" && (
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField
                      size="sm"
                      label="Valor Inicial"
                      value={asNum(p.defaultValue, 1)}
                      onValueChange={(v) => updateSingleProp("defaultValue", v ?? 0)}
                    />
                    <TextField
                      size="sm"
                      label="Sufixo (un, m, %)"
                      value={asStr(p.suffix)}
                      onChange={(e) => updateSingleProp("suffix", e.target.value)}
                    />
                  </div>
                )}
                {el.type === "select_field" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Opções do Dropdown</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Plus size={12} />}
                        onClick={() => {
                          const cur = Array.isArray(p.options) ? [...p.options] : [];
                          cur.push({ value: `opt_${cur.length + 1}`, label: "Nova Filial" });
                          updateSingleProp("options", cur);
                        }}
                      >
                        Opção
                      </Button>
                    </div>
                    {(Array.isArray(p.options) ? p.options : []).map((opt, idx, arr) => {
                      const obj = (opt && typeof opt === "object" ? opt : {}) as Record<string, unknown>;
                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={asStr(obj.label)}
                            onChange={(e) => {
                              const next = [...arr];
                              next[idx] = { ...obj, label: e.target.value };
                              updateSingleProp("options", next);
                            }}
                            className="flex-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs"
                          />
                          {renderArrayRowControls(arr, idx, "options")}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Tamanho"
                    value={asStr(p.size, "md")}
                    options={[
                      { value: "sm", label: "Compacto (SM)" },
                      { value: "md", label: "Padrão (MD)" },
                      { value: "lg", label: "Amplo (LG)" },
                    ]}
                    onChange={(v) => updateSingleProp("size", v)}
                  />
                  <div className="pt-5">
                    <Switch
                      size="sm"
                      label="Obrigatório"
                      checked={asBool(p.required, false)}
                      onChange={(v) => updateSingleProp("required", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {(el.type === "switch_field" || el.type === "checkbox_field") && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Rótulo Principal"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Descrição Auxiliar"
                  value={asStr(p.description)}
                  onChange={(e) => updateSingleProp("description", e.target.value)}
                />
                <Switch
                  size="sm"
                  label="Marcado por Padrão"
                  checked={asBool(p.defaultChecked, true)}
                  onChange={(v) => updateSingleProp("defaultChecked", v)}
                />
              </div>
            )}

            {el.type === "file_dropzone" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <TextareaField
                  size="sm"
                  label="Instruções de Formato"
                  rows={2}
                  value={asStr(p.description)}
                  onChange={(e) => updateSingleProp("description", e.target.value)}
                />
                <Switch
                  size="sm"
                  label="Modo Compacto"
                  checked={asBool(p.compact, true)}
                  onChange={(v) => updateSingleProp("compact", v)}
                />
              </div>
            )}

            {el.type === "button" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Rótulo do Botão"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Variante"
                    value={asStr(p.variant, "primary")}
                    options={[
                      { value: "primary", label: "Primary" },
                      { value: "secondary", label: "Secondary" },
                      { value: "outline", label: "Outline" },
                      { value: "dashed", label: "Dashed (AntD)" },
                      { value: "tonal", label: "Tonal (AntD)" },
                      { value: "filled", label: "Filled (AntD)" },
                      { value: "ghost", label: "Ghost" },
                      { value: "success", label: "Success" },
                      { value: "warning", label: "Warning" },
                      { value: "destructive", label: "Destructive" },
                      { value: "danger-outline", label: "Danger Outline" },
                      { value: "danger-dashed", label: "Danger Dashed" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Ícone"
                    searchable
                    value={asStr(p.iconName, "CheckCircle2")}
                    options={[{ value: "none", label: "Sem ícone" }, ...ICON_SELECT_OPTIONS]}
                    onChange={(v) => updateSingleProp("iconName", v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Switch
                    size="sm"
                    label="Largura 100%"
                    checked={asBool(p.fullWidth, true)}
                    onChange={(v) => updateSingleProp("fullWidth", v)}
                  />
                  <Switch
                    size="sm"
                    label="Formato Pill"
                    checked={asBool(p.pill, false)}
                    onChange={(v) => updateSingleProp("pill", v)}
                  />
                </div>
              </div>
            )}

            {(el.type === "badge" || el.type === "status_badge") && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Texto da Etiqueta"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                {el.type === "badge" ? (
                  <SelectField
                    size="sm"
                    label="Cor"
                    value={asStr(p.variant, "primary")}
                    options={[
                      { value: "primary", label: "Primary" },
                      { value: "success", label: "Success" },
                      { value: "warning", label: "Warning" },
                      { value: "danger", label: "Danger" },
                      { value: "info", label: "Info" },
                      { value: "violet", label: "Violet" },
                      { value: "teal", label: "Teal" },
                      { value: "neutral", label: "Neutral" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                ) : (
                  <SelectField
                    size="sm"
                    label="Tom de Status"
                    value={asStr(p.tone, "success")}
                    options={[
                      { value: "success", label: "Sucesso (Verde)" },
                      { value: "info", label: "Info (Azul)" },
                      { value: "warning", label: "Alerta (Âmbar)" },
                      { value: "danger", label: "Crítico (Vermelho)" },
                      { value: "primary", label: "Primário (Indigo)" },
                      { value: "neutral", label: "Neutro" },
                    ]}
                    onChange={(v) => updateSingleProp("tone", v)}
                  />
                )}
                <Switch
                  size="sm"
                  label="Indicador Ponto (Dot)"
                  checked={asBool(p.dot, true)}
                  onChange={(v) => updateSingleProp("dot", v)}
                />
              </div>
            )}

            {el.type === "avatar" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Nome Completo"
                  value={asStr(p.name)}
                  onChange={(e) => updateSingleProp("name", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Cargo / Filial"
                  value={asStr(p.role)}
                  onChange={(e) => updateSingleProp("role", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Presença"
                    value={asStr(p.status, "online")}
                    options={[
                      { value: "online", label: "Online" },
                      { value: "away", label: "Ausente" },
                      { value: "busy", label: "Ocupado" },
                      { value: "offline", label: "Offline" },
                    ]}
                    onChange={(v) => updateSingleProp("status", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Formato"
                    value={asStr(p.shape, "circle")}
                    options={[
                      { value: "circle", label: "Circular" },
                      { value: "square", label: "Quadrado Suave" },
                    ]}
                    onChange={(v) => updateSingleProp("shape", v)}
                  />
                </div>
              </div>
            )}

            {el.type === "barcode" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Código (EAN / SKU / Chave NF-e 44 dígitos)"
                  value={asStr(p.value)}
                  onChange={(e) => updateSingleProp("value", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Cabeçalho da Etiqueta"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Subtítulo (Filial / Série)"
                  value={asStr(p.sublabel)}
                  onChange={(e) => updateSingleProp("sublabel", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    size="sm"
                    label="Altura Barras"
                    suffix="px"
                    min={24}
                    max={120}
                    value={asNum(p.height, 46)}
                    onValueChange={(v) => updateSingleProp("height", v ?? 46)}
                  />
                  <NumberField
                    size="sm"
                    label="Agrupar Dígitos"
                    min={0}
                    max={8}
                    value={asNum(p.groupDigits, 4)}
                    onValueChange={(v) => updateSingleProp("groupDigits", v ?? 0)}
                  />
                </div>
              </div>
            )}

            {(el.type === "alert" || el.type === "callout" || el.type === "empty_state") && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <TextareaField
                  size="sm"
                  label="Mensagem"
                  rows={3}
                  value={asStr(el.type === "callout" ? p.body : p.description)}
                  onChange={(e) =>
                    updateSingleProp(el.type === "callout" ? "body" : "description", e.target.value)
                  }
                />
                {el.type !== "empty_state" && (
                  <SelectField
                    size="sm"
                    label="Severidade / Tom"
                    value={asStr(p.variant, "info")}
                    options={[
                      { value: "info", label: "Informação (Azul)" },
                      ...(el.type === "callout" ? [{ value: "tip", label: "Dica (Violeta)" }] : []),
                      { value: "success", label: "Sucesso (Verde)" },
                      { value: "warning", label: "Atenção (Âmbar)" },
                      { value: "danger", label: "Crítico (Vermelho)" },
                      { value: "neutral", label: "Neutro" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                )}
              </div>
            )}

            {(el.type === "modal_trigger" ||
              el.type === "drawer_trigger" ||
              el.type === "confirm_dialog_trigger") && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Rótulo do Botão Gatilho"
                  value={asStr(p.triggerLabel)}
                  onChange={(e) => updateSingleProp("triggerLabel", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Título do Overlay"
                  value={asStr(
                    el.type === "modal_trigger"
                      ? p.modalTitle
                      : el.type === "drawer_trigger"
                        ? p.drawerTitle
                        : p.dialogTitle,
                  )}
                  onChange={(e) =>
                    updateSingleProp(
                      el.type === "modal_trigger"
                        ? "modalTitle"
                        : el.type === "drawer_trigger"
                          ? "drawerTitle"
                          : "dialogTitle",
                      e.target.value,
                    )
                  }
                />
                <TextareaField
                  size="sm"
                  label="Conteúdo ao Abrir no Preview"
                  rows={3}
                  value={asStr(
                    el.type === "modal_trigger"
                      ? p.modalBody
                      : el.type === "drawer_trigger"
                        ? p.drawerBody
                        : p.dialogDescription,
                  )}
                  onChange={(e) =>
                    updateSingleProp(
                      el.type === "modal_trigger"
                        ? "modalBody"
                        : el.type === "drawer_trigger"
                          ? "drawerBody"
                          : "dialogDescription",
                      e.target.value,
                    )
                  }
                />
              </div>
            )}

            {(el.type === "cascader_field" || el.type === "tree_select_field") && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Rótulo do Campo"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Placeholder"
                  value={asStr(p.placeholder)}
                  onChange={(e) => updateSingleProp("placeholder", e.target.value)}
                />
                {el.type === "cascader_field" && (
                  <SelectField
                    size="sm"
                    label="Gatilho de Expansão"
                    value={asStr(p.expandTrigger, "hover")}
                    options={[
                      { value: "hover", label: "Passar o Mouse (Hover)" },
                      { value: "click", label: "Clique (Click)" },
                    ]}
                    onChange={(v) => updateSingleProp("expandTrigger", v)}
                  />
                )}
                <Switch
                  size="sm"
                  label="Habilitar Busca Interna"
                  checked={asBool(p.searchable, true)}
                  onChange={(v) => updateSingleProp("searchable", v)}
                />
                <Switch
                  size="sm"
                  label="Botão Limpar Seleção"
                  checked={asBool(p.clearable, true)}
                  onChange={(v) => updateSingleProp("clearable", v)}
                />
              </div>
            )}

            {el.type === "tags_input" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Rótulo do Grupo de Tags"
                  value={asStr(p.label)}
                  onChange={(e) => updateSingleProp("label", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Modo de Entrada"
                    value={asStr(p.mode, "inline-add")}
                    options={[
                      { value: "inline-add", label: "+ Nova Tag (AntD)" },
                      { value: "input", label: "Caixa Contínua" },
                    ]}
                    onChange={(v) => updateSingleProp("mode", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Cor das Tags"
                    value={asStr(p.color, "primary")}
                    options={[
                      { value: "primary", label: "Primary (Indigo)" },
                      { value: "success", label: "Success (Verde)" },
                      { value: "warning", label: "Warning (Âmbar)" },
                      { value: "info", label: "Info (Azul)" },
                      { value: "teal", label: "Teal" },
                      { value: "default", label: "Neutro" },
                    ]}
                    onChange={(v) => updateSingleProp("color", v)}
                  />
                </div>
                <TextField
                  size="sm"
                  label="Texto do Botão (+)"
                  value={asStr(p.addButtonLabel, "Nova Tag")}
                  onChange={(e) => updateSingleProp("addButtonLabel", e.target.value)}
                />
              </div>
            )}

            {el.type === "signature_pad" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Identificação do Signatário"
                  value={asStr(p.signerName)}
                  onChange={(e) => updateSingleProp("signerName", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Documento / Termo"
                  value={asStr(p.signerDocument)}
                  onChange={(e) => updateSingleProp("signerDocument", e.target.value)}
                />
                <Switch
                  size="sm"
                  label="Exibir Barra de Canetas / Desfazer"
                  checked={asBool(p.showToolbar, true)}
                  onChange={(v) => updateSingleProp("showToolbar", v)}
                />
                <Switch
                  size="sm"
                  label="Exibir Linha-Guia de Assinatura"
                  checked={asBool(p.showBaseline, true)}
                  onChange={(v) => updateSingleProp("showBaseline", v)}
                />
              </div>
            )}

            {el.type === "code_editor" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Título / Nome do Arquivo"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Linguagem"
                    value={asStr(p.language, "json")}
                    options={[
                      { value: "json", label: "JSON" },
                      { value: "sql", label: "SQL" },
                      { value: "typescript", label: "TypeScript" },
                      { value: "javascript", label: "JavaScript" },
                      { value: "yaml", label: "YAML" },
                      { value: "html", label: "HTML" },
                    ]}
                    onChange={(v) => updateSingleProp("language", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Tema Visual"
                    value={asStr(p.variant, "dark")}
                    options={[
                      { value: "dark", label: "IDE Dark" },
                      { value: "default", label: "Adaptativo" },
                      { value: "minimal", label: "Minimal" },
                    ]}
                    onChange={(v) => updateSingleProp("variant", v)}
                  />
                </div>
                <TextareaField
                  size="sm"
                  label="Código Inicial"
                  rows={4}
                  value={asStr(p.defaultValue)}
                  onChange={(e) => updateSingleProp("defaultValue", e.target.value)}
                />
              </div>
            )}

            {el.type === "qrcode" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <TextField
                  size="sm"
                  label="Payload / URL / PIX Copia-e-Cola"
                  value={asStr(p.value)}
                  onChange={(e) => updateSingleProp("value", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Título Superior"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <TextField
                  size="sm"
                  label="Legenda Inferior"
                  value={asStr(p.caption)}
                  onChange={(e) => updateSingleProp("caption", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Estilo dos Módulos"
                    value={asStr(p.moduleStyle, "rounded")}
                    options={[
                      { value: "squares", label: "Quadrados" },
                      { value: "rounded", label: "Arredondados" },
                      { value: "dots", label: "Pontos (Dots)" },
                    ]}
                    onChange={(v) => updateSingleProp("moduleStyle", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Status Ciclo de Vida"
                    value={asStr(p.status, "active")}
                    options={[
                      { value: "active", label: "Ativo" },
                      { value: "expired", label: "Expirado" },
                      { value: "loading", label: "Gerando..." },
                      { value: "scanned", label: "Escaneado" },
                    ]}
                    onChange={(v) => updateSingleProp("status", v)}
                  />
                </div>
                <NumberField
                  size="sm"
                  label="Tamanho da Matriz"
                  suffix="px"
                  min={104}
                  max={260}
                  value={asNum(p.size, 152)}
                  onValueChange={(v) => updateSingleProp("size", v ?? 152)}
                />
              </div>
            )}

            {el.type === "result" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <SelectField
                  size="sm"
                  label="Status do Fluxo (AntD Result)"
                  value={asStr(p.status, "success")}
                  options={[
                    { value: "success", label: "Sucesso (Verde)" },
                    { value: "info", label: "Informação (Azul)" },
                    { value: "warning", label: "Atenção (Âmbar)" },
                    { value: "error", label: "Erro Operacional" },
                    { value: "403", label: "403 — Acesso Negado" },
                    { value: "404", label: "404 — Não Encontrado" },
                    { value: "500", label: "500 — Falha Interna" },
                  ]}
                  onChange={(v) => updateSingleProp("status", v)}
                />
                <TextField
                  size="sm"
                  label="Título Principal"
                  value={asStr(p.title)}
                  onChange={(e) => updateSingleProp("title", e.target.value)}
                />
                <TextareaField
                  size="sm"
                  label="Subtítulo Explicativo"
                  rows={2}
                  value={asStr(p.subTitle)}
                  onChange={(e) => updateSingleProp("subTitle", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    size="sm"
                    label="Botão Primário"
                    value={asStr(p.primaryAction)}
                    onChange={(e) => updateSingleProp("primaryAction", e.target.value)}
                  />
                  <TextField
                    size="sm"
                    label="Botão Secundário"
                    value={asStr(p.secondaryAction)}
                    onChange={(e) => updateSingleProp("secondaryAction", e.target.value)}
                  />
                </div>
              </div>
            )}

            {el.type === "skeleton" && (
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    size="sm"
                    label="Formato Wireframe"
                    value={asStr(p.preset, "card")}
                    options={[
                      { value: "card", label: "Card" },
                      { value: "table", label: "Tabela" },
                      { value: "paragraph", label: "Parágrafo" },
                    ]}
                    onChange={(v) => updateSingleProp("preset", v)}
                  />
                  <SelectField
                    size="sm"
                    label="Animação"
                    value={asStr(p.animation, "wave")}
                    options={[
                      { value: "wave", label: "Wave (Shimmer)" },
                      { value: "pulse", label: "Pulse" },
                      { value: "none", label: "Estático" },
                    ]}
                    onChange={(v) => updateSingleProp("animation", v)}
                  />
                </div>
                <NumberField
                  size="sm"
                  label="Quantidade de Linhas"
                  min={1}
                  max={8}
                  value={asNum(p.rows, 3)}
                  onValueChange={(v) => updateSingleProp("rows", v ?? 3)}
                />
                {asStr(p.preset, "card") !== "table" && (
                  <Switch
                    size="sm"
                    label="Incluir Avatar Circular"
                    checked={asBool(p.hasAvatar, true)}
                    onChange={(v) => updateSingleProp("hasAvatar", v)}
                  />
                )}
              </div>
            )}

            {/* Collapsible Power-User Raw Props JSON Editor (great for Kanban, TreeView, Table rows, etc.) */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  const nextOpen = !rawPropsOpen;
                  setRawPropsOpen(nextOpen);
                  if (nextOpen) {
                    setRawPropsDraft(JSON.stringify(el.props, null, 2));
                  }
                }}
                className="w-full flex items-center justify-between text-[11px] font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
              >
                <span>Dados Estruturados JSON (props)</span>
                <span>{rawPropsOpen ? "Ocultar" : "Editar JSON"}</span>
              </button>
              {rawPropsOpen && (
                <div className="mt-2 space-y-2">
                  <textarea
                    rows={8}
                    value={rawPropsDraft}
                    onChange={(e) => setRawPropsDraft(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-950 text-emerald-300 font-mono text-[11px] p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(rawPropsDraft) as unknown;
                        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                          updateSingleElement({ props: parsed as Record<string, unknown> });
                          toast.success("Propriedades JSON aplicadas ao componente!");
                        }
                      } catch {
                        toast.error("JSON inválido. Verifique chaves e vírgulas.");
                      }
                    }}
                  >
                    Aplicar JSON no Elemento
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── TAB 2: GEOMETRIA 2D ────────────────────────────────────────── */}
        {singleTab === "geometry" && (
          <>
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Coordenadas & Dimensões (px)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  size="sm"
                  label="Posição X"
                  suffix="px"
                  disabled={el.locked}
                  value={el.x}
                  onValueChange={(v) =>
                    updateSingleElement({ x: Math.max(0, Math.round(v ?? 0)) })
                  }
                />
                <NumberField
                  size="sm"
                  label="Posição Y"
                  suffix="px"
                  disabled={el.locked}
                  value={el.y}
                  onValueChange={(v) =>
                    updateSingleElement({ y: Math.max(0, Math.round(v ?? 0)) })
                  }
                />
                <NumberField
                  size="sm"
                  label="Largura (W)"
                  suffix="px"
                  min={meta?.minWidth || 32}
                  disabled={el.locked}
                  value={el.width}
                  onValueChange={(v) =>
                    updateSingleElement({
                      width: Math.max(meta?.minWidth || 32, Math.round(v ?? el.width)),
                    })
                  }
                />
                <NumberField
                  size="sm"
                  label="Altura (H)"
                  suffix="px"
                  min={meta?.minHeight || 24}
                  disabled={el.locked}
                  value={el.height}
                  onValueChange={(v) =>
                    updateSingleElement({
                      height: Math.max(meta?.minHeight || 24, Math.round(v ?? el.height)),
                    })
                  }
                />
              </div>
            </div>

            {/* 12-Column Responsive Width Presets */}
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Largura em Grade de 12 Colunas ({usableWidth}px úteis)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { cols: 3, label: "3 col (25%)" },
                  { cols: 4, label: "4 col (33%)" },
                  { cols: 6, label: "6 col (50%)" },
                  { cols: 8, label: "8 col (66%)" },
                  { cols: 9, label: "9 col (75%)" },
                  { cols: 12, label: "12 col (100%)" },
                ].map(({ cols, label }) => {
                  const g = config.layoutGrid.gutter || 16;
                  const colUnit = (usableWidth - g * 11) / 12;
                  const targetW = Math.round(colUnit * cols + g * (cols - 1));
                  return (
                    <button
                      key={cols}
                      type="button"
                      disabled={el.locked}
                      onClick={() =>
                        updateSingleElement({
                          width: targetW,
                          ...(cols === 12 ? { x: config.marginLeft } : {}),
                        })
                      }
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:border-indigo-400 hover:text-indigo-600 py-1.5 text-[11px] font-medium cursor-pointer transition-colors duration-150 disabled:opacity-40"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Align to Artboard */}
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Alinhar às Margens da Prancheta
              </span>
              <div className="grid grid-cols-6 gap-1">
                {(
                  [
                    { mode: "left", icon: AlignStartVertical, title: "Margem Esquerda" },
                    { mode: "center", icon: AlignCenterVertical, title: "Centro Horizontal" },
                    { mode: "right", icon: AlignEndVertical, title: "Margem Direita" },
                    { mode: "top", icon: AlignStartHorizontal, title: "Margem Topo" },
                    { mode: "middle", icon: AlignCenterHorizontal, title: "Centro Vertical" },
                    { mode: "bottom", icon: AlignEndHorizontal, title: "Margem Inferior" },
                  ] as const
                ).map(({ mode, icon: Icon, title }) => (
                  <button
                    key={mode}
                    type="button"
                    title={title}
                    disabled={el.locked}
                    onClick={() => onAlign(mode, true)}
                    className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Z-Index Ordering */}
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Ordem de Camada (Z-Index)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ArrowUpToLine size={13} />}
                  onClick={() => onMoveLayer("UP", true)}
                >
                  Para Frente
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ArrowDownToLine size={13} />}
                  onClick={() => onMoveLayer("DOWN", true)}
                >
                  Para Trás
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ArrowUp size={13} />}
                  onClick={() => onMoveLayer("UP", false)}
                >
                  Avançar +1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ArrowDown size={13} />}
                  onClick={() => onMoveLayer("DOWN", false)}
                >
                  Recuar -1
                </Button>
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <Switch
                size="sm"
                label="Travar Posição e Tamanho (Lock)"
                checked={Boolean(el.locked)}
                onChange={(v) => updateSingleElement({ locked: v })}
              />
              <Switch
                size="sm"
                label="Ocultar Elemento na Prancheta"
                checked={Boolean(el.hidden)}
                onChange={(v) => updateSingleElement({ hidden: v })}
              />
            </div>
          </>
        )}

        {/* ─── TAB 3: ESTILO DO CONTAINER ─────────────────────────────────── */}
        {singleTab === "style" && (
          <>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Preenchimento do Container
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Transp.", val: "transparent" },
                  { label: "Branco", val: "#ffffff" },
                  { label: "Slate", val: "#f8fafc" },
                  { label: "Indigo", val: "#eef2ff" },
                  { label: "Emerald", val: "#ecfdf5" },
                  { label: "Amber", val: "#fffbeb" },
                  { label: "Rose", val: "#fff1f2" },
                ].map((sw) => (
                  <button
                    key={sw.val}
                    type="button"
                    onClick={() => updateSingleStyle({ background: sw.val })}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[10px] font-medium cursor-pointer",
                      (st.background || "transparent") === sw.val
                        ? "border-indigo-500 ring-1 ring-indigo-500 font-bold"
                        : "border-zinc-200 dark:border-zinc-700",
                    )}
                    style={sw.val !== "transparent" ? { backgroundColor: sw.val, color: "#18181b" } : undefined}
                  >
                    {sw.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <NumberField
                size="sm"
                label="Padding Interno"
                suffix="px"
                min={0}
                max={48}
                value={st.padding ?? 0}
                onValueChange={(v) => updateSingleStyle({ padding: v ?? 0 })}
              />
              <NumberField
                size="sm"
                label="Raio da Borda"
                suffix="px"
                min={0}
                max={36}
                value={st.borderRadius ?? 0}
                onValueChange={(v) => updateSingleStyle({ borderRadius: v ?? 0 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <SelectField
                size="sm"
                label="Estilo de Borda"
                value={st.borderStyle || "none"}
                options={[
                  { value: "none", label: "Nenhuma" },
                  { value: "solid", label: "Sólida" },
                  { value: "dashed", label: "Tracejada" },
                  { value: "dotted", label: "Pontilhada" },
                ]}
                onChange={(v) =>
                  updateSingleStyle({
                    borderStyle: v as UIElementStyle["borderStyle"],
                    borderWidth: v === "none" ? 0 : st.borderWidth || 1,
                  })
                }
              />
              <NumberField
                size="sm"
                label="Espessura"
                suffix="px"
                min={0}
                max={8}
                value={st.borderWidth ?? 0}
                onValueChange={(v) => updateSingleStyle({ borderWidth: v ?? 0 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <SelectField
                size="sm"
                label="Sombra (Shadow)"
                value={st.shadow || "none"}
                options={[
                  { value: "none", label: "Sem sombra" },
                  { value: "xs", label: "Extra Suave" },
                  { value: "sm", label: "Pequena (sm)" },
                  { value: "md", label: "Média (md)" },
                  { value: "lg", label: "Grande (lg)" },
                  { value: "xl", label: "Profunda (xl)" },
                ]}
                onChange={(v) => updateSingleStyle({ shadow: v as UIElementStyle["shadow"] })}
              />
              <NumberField
                size="sm"
                label="Opacidade"
                suffix="%"
                min={10}
                max={100}
                value={st.opacity ?? 100}
                onValueChange={(v) => updateSingleStyle({ opacity: v ?? 100 })}
              />
            </div>

            <SelectField
              size="sm"
              label="Overflow do Quadro"
              value={st.overflow || "visible"}
              options={[
                { value: "visible", label: "Visível (Padrão)" },
                { value: "hidden", label: "Recortar (Hidden)" },
                { value: "auto", label: "Rolagem Automática (Auto)" },
              ]}
              onChange={(v) => updateSingleStyle({ overflow: v as UIElementStyle["overflow"] })}
            />

            <TextField
              size="sm"
              label="Classes Tailwind Customizadas"
              placeholder="Ex.: ring-2 ring-indigo-500/30"
              value={st.customClassName || ""}
              onChange={(e) => updateSingleStyle({ customClassName: e.target.value })}
            />

            <Button
              size="sm"
              variant="ghost"
              fullWidth
              leftIcon={<RotateCcw size={13} />}
              onClick={() => updateSingleElement({ style: undefined })}
            >
              Limpar Estilos Customizados
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
