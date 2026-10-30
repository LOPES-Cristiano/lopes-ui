"use client";

import React, { useMemo, useState } from "react";
import {
  Blocks,
  Eye,
  EyeOff,
  GripVertical,
  Keyboard,
  Layers,
  Lock,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Checkbox from "@/components/form/Checkbox";
import Modal from "@/components/Modal";
import { cn } from "@/utils/cn";
import {
  CATALOG_BY_TYPE,
  COMPONENT_CATALOG,
  COMPONENT_CATEGORIES,
  COMPOSITE_BLOCKS,
  resolveIcon,
} from "./catalog-and-defaults";
import type {
  UICanvasElement,
  UIComponentCategory,
  UIComponentType,
  UICompositeBlockDefinition,
} from "./types";

export const DND_COMPONENT_MIME = "application/x-lopes-ui-component";

const ACCENT_ICON_CLS: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-900/50",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/50",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/50",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200/60 dark:border-sky-900/50",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 border-violet-200/60 dark:border-violet-900/50",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200/60 dark:border-teal-900/50",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/50",
};

export interface UICatalogSidebarProps {
  onAddComponent: (type: UIComponentType) => void;
  onAddCompositeBlock: (block: UICompositeBlockDefinition) => void;
  onClose?: () => void;
}

export function UICatalogSidebar({
  onAddComponent,
  onAddCompositeBlock,
  onClose,
}: UICatalogSidebarProps) {
  const [tab, setTab] = useState<"components" | "composite">("components");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | UIComponentCategory>("ALL");

  const normalizedQuery = search
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const filteredComponents = useMemo(() => {
    return COMPONENT_CATALOG.filter((item) => {
      if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
      if (!normalizedQuery) return true;
      const hay = `${item.label} ${item.lopesComponent} ${item.category} ${item.description}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return hay.includes(normalizedQuery);
    });
  }, [activeCategory, normalizedQuery]);

  const groupedComponents = useMemo(() => {
    const groups: { category: UIComponentCategory; items: typeof COMPONENT_CATALOG }[] = [];
    for (const cat of COMPONENT_CATEGORIES) {
      const items = filteredComponents.filter((i) => i.category === cat);
      if (items.length > 0) groups.push({ category: cat, items });
    }
    return groups;
  }, [filteredComponents]);

  const filteredBlocks = useMemo(() => {
    if (!normalizedQuery) return COMPOSITE_BLOCKS;
    return COMPOSITE_BLOCKS.filter((blk) => {
      const hay = `${blk.name} ${blk.category} ${blk.description}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return hay.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full select-none">
      {/* Header + Switcher */}
      <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Blocks size={14} className="text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Biblioteca Lopes UI
            </span>
            <Badge label={String(COMPONENT_CATALOG.length)} variant="neutral" size="xs" />
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Recolher catálogo"
              className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setTab("components")}
            className={cn(
              "rounded-md py-1.5 transition-colors duration-150 cursor-pointer",
              tab === "components"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
            )}
          >
            Componentes ({COMPONENT_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("composite")}
            className={cn(
              "rounded-md py-1.5 transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1",
              tab === "composite"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
            )}
          >
            <Sparkles size={11} />
            Seções ({COMPOSITE_BLOCKS.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "components"
                ? "Buscar componente (Table, Chart, Input...)"
                : "Buscar seção composta..."
            }
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/60 pl-8 pr-7 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        {tab === "components" && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory("ALL")}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors duration-150 cursor-pointer",
                activeCategory === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700",
              )}
            >
              Todos
            </button>
            {COMPONENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors duration-150 cursor-pointer",
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                )}
              >
                {cat.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Catalog List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-4">
        {tab === "components" ? (
          groupedComponents.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-400">
              Nenhum componente encontrado para &ldquo;{search}&rdquo;.
            </div>
          ) : (
            groupedComponents.map((grp) => (
              <div key={grp.category} className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {grp.category}
                  </span>
                  <span className="text-[10px] text-zinc-400">{grp.items.length}</span>
                </div>
                <div className="space-y-1">
                  {grp.items.map((entry) => {
                    const IconComp = resolveIcon(entry.iconName);
                    return (
                      <div
                        key={entry.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(DND_COMPONENT_MIME, entry.type);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => onAddComponent(entry.type)}
                        title={`Arraste para a prancheta 2D ou clique para inserir (${entry.defaultWidth}×${entry.defaultHeight}px)`}
                        className="group flex items-center gap-2.5 rounded-xl border border-zinc-200/75 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 p-2 cursor-grab active:cursor-grabbing transition-colors duration-150"
                      >
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg border flex items-center justify-center shrink-0",
                            ACCENT_ICON_CLS[entry.accent] || ACCENT_ICON_CLS.indigo,
                          )}
                        >
                          <IconComp size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                              {entry.label}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                              {entry.defaultWidth}×{entry.defaultHeight}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                            {entry.description}
                          </p>
                        </div>
                        <span className="h-6 w-6 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-150">
                          <Plus size={12} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="space-y-2">
            <div className="rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 p-2.5 text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <strong>Blocos Compostos (Pré-Agrupados):</strong> inserem múltiplos componentes já posicionados em 2D e agrupados (`Ctrl+Shift+G` para desagrupar).
            </div>
            {filteredBlocks.map((blk) => {
              const IconComp = resolveIcon(blk.iconName);
              return (
                <button
                  key={blk.id}
                  type="button"
                  onClick={() => onAddCompositeBlock(blk)}
                  className="w-full text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-500 p-3 space-y-1 transition-colors duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <IconComp size={14} className="text-indigo-500 shrink-0" />
                      <span>{blk.name}</span>
                    </span>
                    <Badge label={blk.category.split(" ")[0]} variant="info" size="xs" />
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {blk.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tip Footer */}
      <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
        <span>Arraste para coordenadas (X, Y)</span>
        <span className="font-mono text-zinc-400">Snap 2D</span>
      </div>
    </aside>
  );
}

// ── Floating Layers / Outline Panel (Jasper / Figma Style) ────────────────────
export interface UILayersPanelProps {
  elements: UICanvasElement[];
  selectedIds: string[];
  onSelect: (id: string, additive: boolean) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onRename: (id: string, nextName: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onClose: () => void;
}

export function UILayersPanel({
  elements,
  selectedIds,
  onSelect,
  onToggleHidden,
  onToggleLocked,
  onRename,
  onDelete,
  onReorder,
  onClose,
}: UILayersPanelProps) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragVisualIdx, setDragVisualIdx] = useState<number | null>(null);

  // Visual top-to-bottom order = highest z-index first (reverse of elements array)
  const reversed = useMemo(
    () =>
      elements
        .map((el, realIndex) => ({ el, realIndex }))
        .reverse()
        .filter(({ el }) =>
          !query.trim()
            ? true
            : `${el.name} ${el.type} ${el.groupId || ""}`
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
        ),
    [elements, query],
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute left-8 top-8 z-40 w-80 max-h-[calc(100%-4rem)] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden select-none"
    >
      <div className="px-3.5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-indigo-500" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Camadas (Z-Order)
          </span>
          <Badge label={String(elements.length)} variant="neutral" size="xs" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
        >
          <X size={13} />
        </button>
      </div>

      <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="relative">
          <Search
            size={12}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar camadas..."
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-7 pr-2 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-0.5">
        {reversed.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            Nenhuma camada na prancheta.
          </div>
        ) : (
          reversed.map(({ el, realIndex }) => {
            const meta = CATALOG_BY_TYPE[el.type];
            const IconComp = resolveIcon(meta?.iconName);
            const isSelected = selectedSet.has(el.id);

            return (
              <div
                key={el.id}
                draggable={!query.trim()}
                onDragStart={() => setDragVisualIdx(realIndex)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragVisualIdx !== null && dragVisualIdx !== realIndex) {
                    onReorder(dragVisualIdx, realIndex);
                  }
                  setDragVisualIdx(null);
                }}
                onClick={(e) => onSelect(el.id, e.shiftKey || e.ctrlKey || e.metaKey)}
                className={cn(
                  "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors duration-150 cursor-pointer",
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300/70 dark:ring-indigo-800"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300",
                  el.hidden && "opacity-45",
                )}
              >
                <GripVertical size={12} className="text-zinc-300 dark:text-zinc-600 shrink-0 cursor-grab" />
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                  <Checkbox
                    size="sm"
                    checked={isSelected}
                    onCheckedChange={() => onSelect(el.id, true)}
                    ariaLabel={`Selecionar camada ${el.name}`}
                  />
                </div>
                <IconComp size={13} className="shrink-0 text-indigo-500" />

                <div
                  className="min-w-0 flex-1"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(el.id);
                  }}
                >
                  {editingId === el.id ? (
                    <input
                      type="text"
                      autoFocus
                      defaultValue={el.name}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onRename(el.id, e.currentTarget.value.trim() || el.name);
                          setEditingId(null);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      onBlur={(e) => {
                        onRename(el.id, e.currentTarget.value.trim() || el.name);
                        setEditingId(null);
                      }}
                      className="w-full rounded border border-indigo-400 bg-white dark:bg-zinc-950 px-1.5 py-0.5 text-xs focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="truncate font-medium">{el.name}</span>
                      {el.groupId && (
                        <span className="shrink-0 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1 text-[9px] font-mono">
                          GRP
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-zinc-400 shrink-0">
                  #{realIndex + 1}
                </span>

                <button
                  type="button"
                  title={el.hidden ? "Mostrar camada" : "Ocultar camada"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHidden(el.id);
                  }}
                  className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100"
                >
                  {el.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>

                <button
                  type="button"
                  title={el.locked ? "Desbloquear camada" : "Bloquear camada"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLocked(el.id);
                  }}
                  className={cn(
                    "h-5 w-5 rounded flex items-center justify-center",
                    el.locked
                      ? "text-amber-500"
                      : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100",
                  )}
                >
                  {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>

                <button
                  type="button"
                  title="Excluir camada"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(el.id);
                  }}
                  className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 text-[10px] text-zinc-400 flex justify-between">
        <span>Duplo-clique para renomear</span>
        <span>Arraste para Z-Index</span>
      </div>
    </div>
  );
}

// ── Keyboard Shortcuts Modal ──────────────────────────────────────────────────
export const UI_STUDIO_SHORTCUTS: { group: string; items: { keys: string; desc: string }[] }[] = [
  {
    group: "Ferramentas & Navegação 2D",
    items: [
      { keys: "V", desc: "Ferramenta Seleção / Mover / Laço" },
      { keys: "H ou Espaço (segurar)", desc: "Ferramenta Mão (Panorâmica livre da prancheta)" },
      { keys: "Ctrl + Scroll", desc: "Zoom de precisão na prancheta (25% a 500%)" },
      { keys: "Ctrl + 0 / Ctrl + 1", desc: "Ajustar à janela / Zoom 100% real" },
      { keys: "Duplo-Clique no Elemento", desc: "Edição rápida inline do texto/título principal" },
    ],
  },
  {
    group: "Edição, Seleção & Grupos",
    items: [
      { keys: "Shift + Clique", desc: "Adicionar ou remover elemento da multisseleção" },
      { keys: "Arrastar no Fundo", desc: "Caixa de seleção em laço (Marquee)" },
      { keys: "Ctrl + A / Ctrl + Shift + I", desc: "Selecionar todos / Inverter seleção" },
      { keys: "Ctrl + C / Ctrl + X / Ctrl + V", desc: "Copiar, recortar e colar elementos/grupos" },
      { keys: "Ctrl + D", desc: "Duplicar seleção com deslocamento inteligente" },
      { keys: "Ctrl + G / Ctrl + Shift + G", desc: "Agrupar seleção / Desagrupar" },
      { keys: "Ctrl + L", desc: "Bloquear / Desbloquear elementos selecionados" },
      { keys: "Delete ou Backspace", desc: "Remover elementos selecionados (não bloqueados)" },
    ],
  },
  {
    group: "Posicionamento & Camadas",
    items: [
      { keys: "Setas (↑ ↓ ← →)", desc: "Mover pela grade magnética (Snap Grid)" },
      { keys: "Alt + Setas", desc: "Ajuste fino cirúrgico de 1px" },
      { keys: "Shift + Setas", desc: "Salto rápido (2× Snap Grid)" },
      { keys: "Ctrl + ] / Ctrl + [", desc: "Avançar 1 camada / Recuar 1 camada" },
      { keys: "Ctrl + Alt + ] / [", desc: "Trazer para a frente / Enviar para trás" },
      { keys: "Ctrl + Z / Ctrl + Y", desc: "Desfazer / Refazer (até 40 estados)" },
      { keys: "Arrastar das Réguas X / Y", desc: "Criar linhas-guia fixas ciano (duplo-clique remove)" },
    ],
  },
];

export function UIShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <span className="inline-flex items-center gap-2">
          <Keyboard size={18} className="text-indigo-500" />
          <span>Atalhos do Estúdio UI Builder 2D</span>
        </span>
      }
      description="Produtividade nível CAD / Figma / Jasper Studio para desenho de interfaces."
      footer={
        <div className="flex justify-end">
          <Button size="sm" variant="primary" onClick={onClose}>
            Entendi
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {UI_STUDIO_SHORTCUTS.map((section) => (
          <div key={section.group} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {section.group}
            </h4>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {section.items.map((item) => (
                <div
                  key={item.keys}
                  className="flex items-center justify-between gap-3 px-3.5 py-2 text-xs bg-white dark:bg-zinc-900"
                >
                  <span className="text-zinc-600 dark:text-zinc-300">{item.desc}</span>
                  <kbd className="shrink-0 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
