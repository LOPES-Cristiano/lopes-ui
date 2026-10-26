"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "./Button";
import Badge from "./Badge";
import StatusBadge, { type StatusTone } from "./StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TransferListItem<T = any> {
  id: string | number;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  tag?: string;
  tagTone?: StatusTone;
  disabled?: boolean;
  raw?: T;
}

export interface TransferListProps<T = any> {
  /** Items in the left/source list (Assigned / Selected / Authorized) */
  sourceItems: TransferListItem<T>[];
  /** Items in the right/target list (Available / Unassigned) */
  targetItems: TransferListItem<T>[];
  /** Unified change callback */
  onChange?: (source: TransferListItem<T>[], target: TransferListItem<T>[]) => void;
  /** Callback fired when items are added from target to source */
  onAdd?: (added: TransferListItem<T>[]) => void;
  /** Callback fired when items are removed from source to target */
  onRemove?: (removed: TransferListItem<T>[]) => void;
  /** Title of the left panel (default: "Itens Vinculados") */
  sourceTitle?: string;
  /** Title of the right panel (default: "Itens Disponíveis") */
  targetTitle?: string;
  /** Icon for the left panel header */
  sourceIcon?: React.ReactNode;
  /** Icon for the right panel header */
  targetIcon?: React.ReactNode;
  /** Search placeholders */
  sourceSearchPlaceholder?: string;
  targetSearchPlaceholder?: string;
  /** Show search fields (default: true) */
  showSearch?: boolean;
  /** Fixed height of the container in px or CSS string (default: 420px) */
  height?: number | string;
  /** Loading state */
  loading?: boolean;
  /** Disable interactions */
  disabled?: boolean;
  /** Empty state texts */
  sourceEmptyText?: string;
  targetEmptyText?: string;
  className?: string;
  componentId?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function TransferList<T = any>({
  sourceItems,
  targetItems,
  onChange,
  onAdd,
  onRemove,
  sourceTitle = "Itens Vinculados",
  targetTitle = "Itens Disponíveis",
  sourceIcon,
  targetIcon,
  sourceSearchPlaceholder = "Buscar vinculados...",
  targetSearchPlaceholder = "Buscar disponíveis...",
  showSearch = true,
  height = 420,
  loading = false,
  disabled = false,
  sourceEmptyText = "Nenhum item vinculado",
  targetEmptyText = "Nenhum item disponível",
  className,
  componentId,
}: TransferListProps<T>) {
  // Selected IDs in Left/Source list
  const [selectedSource, setSelectedSource] = useState<Set<string | number>>(new Set());
  // Selected IDs in Right/Target list
  const [selectedTarget, setSelectedTarget] = useState<Set<string | number>>(new Set());
  // Search queries
  const [searchSource, setSearchSource] = useState("");
  const [searchTarget, setSearchTarget] = useState("");

  // Filtered Source
  const filteredSource = useMemo(() => {
    if (!searchSource.trim()) return sourceItems;
    const q = searchSource.toLowerCase();
    return sourceItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.tag && item.tag.toLowerCase().includes(q))
    );
  }, [sourceItems, searchSource]);

  // Filtered Target
  const filteredTarget = useMemo(() => {
    if (!searchTarget.trim()) return targetItems;
    const q = searchTarget.toLowerCase();
    return targetItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.tag && item.tag.toLowerCase().includes(q))
    );
  }, [targetItems, searchTarget]);

  // Select all helpers
  const allSourceSelected =
    filteredSource.length > 0 && filteredSource.every((i) => selectedSource.has(i.id));

  const allTargetSelected =
    filteredTarget.length > 0 && filteredTarget.every((i) => selectedTarget.has(i.id));

  const toggleAllSource = () => {
    if (allSourceSelected) {
      setSelectedSource(new Set());
    } else {
      setSelectedSource(new Set(filteredSource.map((i) => i.id)));
    }
  };

  const toggleAllTarget = () => {
    if (allTargetSelected) {
      setSelectedTarget(new Set());
    } else {
      setSelectedTarget(new Set(filteredTarget.map((i) => i.id)));
    }
  };

  const toggleItemSource = (id: string | number) => {
    setSelectedSource((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItemTarget = (id: string | number) => {
    setSelectedTarget((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Transfer Actions
  const handleAddSelected = () => {
    if (selectedTarget.size === 0) return;
    const itemsToAdd = targetItems.filter((i) => selectedTarget.has(i.id));
    const nextTarget = targetItems.filter((i) => !selectedTarget.has(i.id));
    const nextSource = [...sourceItems, ...itemsToAdd];

    setSelectedTarget(new Set());
    onAdd?.(itemsToAdd);
    onChange?.(nextSource, nextTarget);
  };

  const handleRemoveSelected = () => {
    if (selectedSource.size === 0) return;
    const itemsToRemove = sourceItems.filter((i) => selectedSource.has(i.id));
    const nextSource = sourceItems.filter((i) => !selectedSource.has(i.id));
    const nextTarget = [...targetItems, ...itemsToRemove];

    setSelectedSource(new Set());
    onRemove?.(itemsToRemove);
    onChange?.(nextSource, nextTarget);
  };

  const handleAddSingle = (item: TransferListItem<T>) => {
    const nextTarget = targetItems.filter((i) => i.id !== item.id);
    const nextSource = [...sourceItems, item];
    onAdd?.([item]);
    onChange?.(nextSource, nextTarget);
  };

  const handleRemoveSingle = (item: TransferListItem<T>) => {
    const nextSource = sourceItems.filter((i) => i.id !== item.id);
    const nextTarget = [...targetItems, item];
    onRemove?.([item]);
    onChange?.(nextSource, nextTarget);
  };

  const handleAddAll = () => {
    if (filteredTarget.length === 0) return;
    const nextSource = [...sourceItems, ...filteredTarget];
    const targetIds = new Set(filteredTarget.map((i) => i.id));
    const nextTarget = targetItems.filter((i) => !targetIds.has(i.id));
    setSelectedTarget(new Set());
    onAdd?.(filteredTarget);
    onChange?.(nextSource, nextTarget);
  };

  const handleRemoveAll = () => {
    if (filteredSource.length === 0) return;
    const nextTarget = [...targetItems, ...filteredSource];
    const sourceIds = new Set(filteredSource.map((i) => i.id));
    const nextSource = sourceItems.filter((i) => !sourceIds.has(i.id));
    setSelectedSource(new Set());
    onRemove?.(filteredSource);
    onChange?.(nextSource, nextTarget);
  };

  const containerHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      data-component-id={componentId}
      className={cn(
        "relative flex flex-col md:flex-row items-stretch bg-card border border-border rounded-2xl shadow-xs overflow-hidden",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
      style={{ minHeight: containerHeight }}
    >
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-2">
          <RefreshCw size={24} className="animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Carregando itens...</span>
        </div>
      )}

      {/* ── Left Column: Source (Vinculados) ── */}
      <div className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-emerald-500/5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <input
              data-component-id={componentId ? `${componentId}.source.select-all` : undefined}
              type="checkbox"
              checked={allSourceSelected}
              onChange={toggleAllSource}
              disabled={filteredSource.length === 0}
              className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500/20 shrink-0 cursor-pointer"
            />
            {sourceIcon || <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
            <span className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
              {sourceTitle} ({sourceItems.length})
            </span>
          </div>
          {selectedSource.size > 0 && (
            <Badge variant="danger" size="xs">
              {selectedSource.size} sel.
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-3 py-2 border-b border-border/60 bg-muted/10 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                data-component-id={componentId ? `${componentId}.source.search` : undefined}
                type="text"
                placeholder={sourceSearchPlaceholder}
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ maxHeight: `calc(${containerHeight} - 88px)` }}>
          {filteredSource.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-xs text-muted-foreground">
              <CheckCircle2 size={24} className="text-muted-foreground/40 mb-1.5" />
              <p className="font-medium">{sourceEmptyText}</p>
            </div>
          ) : (
            filteredSource.map((item) => {
              const isChecked = selectedSource.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItemSource(item.id)}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none",
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                      : "bg-background hover:bg-muted/40 border-border/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      data-component-id={componentId ? `${componentId}.source.item-checkbox` : undefined}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItemSource(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 rounded border-input text-emerald-600 focus:ring-emerald-500/20 shrink-0 cursor-pointer"
                    />
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.avatarInitials || getInitials(item.title)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate leading-snug">{item.title}</p>
                      {item.subtitle && <p className="text-[10px] text-muted-foreground truncate leading-tight">{item.subtitle}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.tag && (
                      <StatusBadge tone={item.tagTone || "success"}>
                        {item.tag}
                      </StatusBadge>
                    )}
                    <button
                      data-component-id={componentId ? `${componentId}.source.item-remove` : undefined}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSingle(item);
                      }}
                      title="Remover para lista de disponíveis"
                      className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Center: Action Toolbar ── */}
      <div className="flex md:flex-col items-center justify-center gap-2 p-3 bg-muted/30 border-y md:border-y-0 md:border-x border-border shrink-0">
        <Button
          componentId={componentId ? `${componentId}.add-selected` : undefined}
          variant="primary"
          size="sm"
          onClick={handleAddSelected}
          disabled={selectedTarget.size === 0}
          title="Adicionar selecionados da direita para a esquerda"
          leftIcon={<ArrowLeft size={14} />}
          className="shadow-xs text-xs px-2.5"
        >
          <span className="hidden md:inline">Adicionar</span>
          {selectedTarget.size > 0 && ` (${selectedTarget.size})`}
        </Button>

        <Button
          componentId={componentId ? `${componentId}.remove-selected` : undefined}
          variant="outline"
          size="sm"
          onClick={handleRemoveSelected}
          disabled={selectedSource.size === 0}
          title="Remover selecionados da esquerda para a direita"
          rightIcon={<ArrowRight size={14} />}
          className="shadow-xs text-xs px-2.5 text-destructive hover:bg-destructive/10 border-destructive/20"
        >
          <span className="hidden md:inline">Remover</span>
          {selectedSource.size > 0 && ` (${selectedSource.size})`}
        </Button>

        <div className="hidden md:flex flex-col gap-1 pt-2 border-t border-border w-full">
          <button
            data-component-id={componentId ? `${componentId}.add-all` : undefined}
            type="button"
            onClick={handleAddAll}
            disabled={filteredTarget.length === 0}
            title="Adicionar todos os disponíveis visíveis"
            className="flex items-center justify-center gap-1 p-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronsLeft size={13} />
            <span>Todos</span>
          </button>
          <button
            data-component-id={componentId ? `${componentId}.remove-all` : undefined}
            type="button"
            onClick={handleRemoveAll}
            disabled={filteredSource.length === 0}
            title="Remover todos os vinculados visíveis"
            className="flex items-center justify-center gap-1 p-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
          >
            <span>Todos</span>
            <ChevronsRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Right Column: Target (Disponíveis) ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <input
              data-component-id={componentId ? `${componentId}.target.select-all` : undefined}
              type="checkbox"
              checked={allTargetSelected}
              onChange={toggleAllTarget}
              disabled={filteredTarget.length === 0}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 shrink-0 cursor-pointer"
            />
            {targetIcon || <Users size={16} className="text-muted-foreground shrink-0" />}
            <span className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
              {targetTitle} ({targetItems.length})
            </span>
          </div>
          {selectedTarget.size > 0 && (
            <Badge variant="primary" size="xs">
              {selectedTarget.size} sel.
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-3 py-2 border-b border-border/60 bg-muted/10 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                data-component-id={componentId ? `${componentId}.target.search` : undefined}
                type="text"
                placeholder={targetSearchPlaceholder}
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ maxHeight: `calc(${containerHeight} - 88px)` }}>
          {filteredTarget.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-xs text-muted-foreground">
              <XCircle size={24} className="text-muted-foreground/40 mb-1.5" />
              <p className="font-medium">{targetEmptyText}</p>
            </div>
          ) : (
            filteredTarget.map((item) => {
              const isChecked = selectedTarget.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItemTarget(item.id)}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none",
                    isChecked
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-background hover:bg-muted/40 border-border/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      data-component-id={componentId ? `${componentId}.target.item-checkbox` : undefined}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItemTarget(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/20 shrink-0 cursor-pointer"
                    />
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.avatarInitials || getInitials(item.title)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate leading-snug">{item.title}</p>
                      {item.subtitle && <p className="text-[10px] text-muted-foreground truncate leading-tight">{item.subtitle}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.tag && (
                      <Badge variant="secondary" size="xs">
                        {item.tag}
                      </Badge>
                    )}
                    <button
                      data-component-id={componentId ? `${componentId}.target.item-add` : undefined}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSingle(item);
                      }}
                      title="Adicionar aos itens vinculados"
                      className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ArrowLeft size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
