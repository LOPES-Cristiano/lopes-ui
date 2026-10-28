"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Plus,
  MoreVertical,
  GripVertical,
  Calendar,
  Clock,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./primitives/dropdown-menu";

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return "0m";
  const total = Math.round(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (days > 0) {
    const parts = [`${days}d`];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 && days < 3) parts.push(`${minutes}m`);
    return parts.join(" ");
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${s}s`;
}

export function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type KanbanCardColor =
  | "zinc"
  | "indigo"
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "violet"
  | "pink"
  | "teal";

export type KanbanAssignee = {
  id?: string;
  name: string;
  initials?: string;
  avatarUrl?: string | null;
};

export type KanbanTag = {
  id?: string;
  name: string;
  color?: string;
  corFundo?: string;
  corTexto?: string;
};

export type KanbanCardPriority = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export type KanbanCard = {
  id: string;
  codigo?: number | string;
  title: string;
  description?: string;
  tags?: Array<KanbanTag | string>;
  color?: KanbanCardColor;
  priority?: KanbanCardPriority | string;
  assignees?: KanbanAssignee[];
  assignee?: KanbanAssignee;
  dueDate?: string;
  isOverdue?: boolean;
  checklistTotal?: number;
  checklistDone?: number;
  attachmentsCount?: number;
  commentsCount?: number;
  estimatedHours?: number;
  spentHours?: number;
  spentSeconds?: number;
  timerStatus?: "RODANDO" | "PAUSADO" | null;
  order?: number;
  ano?: number;
  semanaAno?: number;
  semanaFormatada?: string;
  // Commercial / Financial fields
  monetaryValue?: number;
  entryValue?: number;
  paymentCondition?: string;
  customerName?: string;
  customerDocument?: string;
  sellerName?: string;
  branchName?: string;
  pendingBlocksCount?: number;
  timeInQueue?: string;
  draggable?: boolean;
  rawData?: any;
};

export type KanbanColumn = {
  id: string;
  title: string;
  subtitle?: string;
  cards: KanbanCard[];
  limit?: number; // WIP Limit
  color?: KanbanCardColor;
  tipo?: "BACKLOG" | "A_FAZER" | "EM_ANDAMENTO" | "REVISAO" | "CONCLUIDO" | "CANCELADO" | string;
  collapsed?: boolean;
  totalMonetary?: number;
};

export type KanbanBoardProps = {
  columns: KanbanColumn[];
  onChange?: (columns: KanbanColumn[]) => void;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  onMoveCard?: (cardId: string, sourceColId: string, targetColId: string, newIndex: number) => void;
  onAddColumn?: () => void;
  onEditColumn?: (column: KanbanColumn) => void;
  onDeleteColumn?: (columnId: string) => void;
  onReorderColumns?: (columns: KanbanColumn[]) => void;
  onStartTimer?: (card: KanbanCard) => void;
  onPauseTimer?: (card: KanbanCard) => void;
  onResumeTimer?: (card: KanbanCard) => void;
  onStopTimer?: (card: KanbanCard) => void;
  renderCard?: (card: KanbanCard, column: KanbanColumn) => React.ReactNode;
  renderColumnHeader?: (column: KanbanColumn, cards: KanbanCard[]) => React.ReactNode;
  activeTimerCardId?: string | null;
  activeTimerSeconds?: number;
  activeTimerStatus?: "RODANDO" | "PAUSADO" | null;
  currentUserId?: string;
  showColumnActions?: boolean;
  emptyColumnLabel?: string;
  addCardLabel?: string;
  className?: string;
};

// ── Priority Badge Helper ─────────────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const p = priority.toUpperCase();

  if (p === "URGENTE" || p === "CRITICA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-rose-600 text-white shadow-2xs">
        <Flame className="w-2.5 h-2.5 text-white" />
        Urgente
      </span>
    );
  }
  if (p === "ALTA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-white shadow-2xs">
        <ArrowUp className="w-2.5 h-2.5 text-white" />
        Alta
      </span>
    );
  }
  if (p === "MEDIA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white shadow-2xs">
        <Minus className="w-2.5 h-2.5 text-white" />
        Média
      </span>
    );
  }
  if (p === "BAIXA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-zinc-600 text-white shadow-2xs">
        <ArrowDown className="w-2.5 h-2.5 text-white" />
        Baixa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
      {priority}
    </span>
  );
}

// ── Tag Badge Helper ──────────────────────────────────────────────────────────

export function TagBadge({ tag, index = 0 }: { tag: KanbanTag | string; index?: number }) {
  const isObj = typeof tag === "object" && tag !== null;
  const name = isObj ? tag.name : tag;
  const customBg = isObj ? tag.corFundo : undefined;
  const customText = isObj ? tag.corTexto : undefined;

  if (customBg) {
    return (
      <span
        className="text-[9px] rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider shadow-2xs"
        style={{
          backgroundColor: customBg,
          color: customText || "#FFFFFF",
        }}
      >
        {name}
      </span>
    );
  }

  const defaultTagColors = [
    "bg-amber-500",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-indigo-600",
    "bg-rose-600",
    "bg-purple-600",
    "bg-teal-600",
    "bg-zinc-700",
  ];

  return (
    <span
      className={clsx(
        "text-[9px] rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider shadow-2xs text-white",
        defaultTagColors[index % defaultTagColors.length],
      )}
    >
      {name}
    </span>
  );
}

// ── Multi-Assignee Avatars Stack ──────────────────────────────────────────────

export function AssigneesStack({ assignees }: { assignees: KanbanAssignee[] }) {
  if (!assignees || assignees.length === 0) return null;
  const visible = assignees.slice(0, 3);
  const remaining = assignees.length - 3;

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
      {visible.map((a, i) => (
        <div
          key={a.id ?? i}
          title={a.name}
          className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-700 dark:text-zinc-200 overflow-hidden shrink-0 shadow-2xs"
        >
          {a.avatarUrl ? (
            <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
          ) : (
            <span>
              {a.initials ||
                a.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
            </span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ── Card Item ─────────────────────────────────────────────────────────────────

function KanbanCardItem({
  card,
  cardIndex,
  columnId,
  column,
  onDragStart,
  onDragEnd,
  onDropAtCard,
  isDragging,
  onCardClick,
  renderCard,
}: {
  card: KanbanCard;
  cardIndex: number;
  columnId: string;
  columnTipo?: string;
  column: KanbanColumn;
  onDragStart: (colId: string, cardId: string) => void;
  onDragEnd: () => void;
  onDropAtCard: (targetColId: string, targetIndex: number) => void;
  isDragging: boolean;
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  renderCard?: (card: KanbanCard, column: KanbanColumn) => React.ReactNode;
}) {
  if (renderCard) {
    const isCardDraggable = card.draggable !== false;
    return (
      <div
        draggable={isCardDraggable}
        onDragStart={(e) => {
          if (!isCardDraggable) {
            e.preventDefault();
            return;
          }
          onDragStart(columnId, card.id);
        }}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.stopPropagation();
          onDropAtCard(columnId, cardIndex);
        }}
        className={twMerge(
          "transition-all duration-150 cursor-pointer select-none",
          isDragging && "opacity-40 scale-95 ring-2 ring-blue-500 shadow-xl rounded-lg"
        )}
      >
        {renderCard(card, column)}
      </div>
    );
  }

  const assigneesList: KanbanAssignee[] =
    card.assignees && card.assignees.length > 0
      ? card.assignees
      : card.assignee
        ? [card.assignee]
        : [];

  return (
    <div
      draggable
      onDragStart={() => onDragStart(columnId, card.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.stopPropagation();
        onDropAtCard(columnId, cardIndex);
      }}
      onClick={() => onCardClick?.(card, columnId)}
      className={twMerge(
        "group relative rounded-lg bg-white dark:bg-zinc-900",
        "border border-zinc-200/80 dark:border-zinc-800",
        "p-3.5 shadow-2xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 ease-out",
        "cursor-grab active:cursor-grabbing select-none text-left",
        isDragging && "opacity-40 scale-98 rotate-1 ring-2 ring-blue-500 shadow-xl"
      )}
    >
      {/* Top row: Code + Priority + Special Badges */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {card.codigo && (
            <span className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500">
              #{card.codigo}
            </span>
          )}
          <PriorityBadge priority={card.priority} />
          {card.semanaAno && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs"
            >
              <Calendar className="w-2.5 h-2.5 text-indigo-500" />
              <span>SEMANA {card.semanaAno}{card.ano ? `/${card.ano}` : ""}</span>
            </span>
          )}
        </div>

        <GripVertical className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      {/* Card Title */}
      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
        {card.title}
      </p>

      {/* Card Description */}
      {card.description && (
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* Tags Row */}
      {card.tags && card.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {card.tags.map((tag, i) => (
            <TagBadge key={typeof tag === "string" ? tag : (tag.id ?? i)} tag={tag} index={i} />
          ))}
        </div>
      )}

      {/* Card Footer */}
      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 flex-wrap">
          {card.spentSeconds !== undefined || card.spentHours !== undefined ? (
            <div className="inline-flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{card.spentSeconds ? formatDuration(card.spentSeconds) : `${card.spentHours || 0}h`}</span>
            </div>
          ) : null}
        </div>

        <AssigneesStack assignees={assigneesList} />
      </div>
    </div>
  );
}

// ── Main Board Component ──────────────────────────────────────────────────────

export default function KanbanBoard({
  columns: initialColumns,
  onChange,
  onAddCard,
  onCardClick,
  onMoveCard,
  onEditColumn,
  onDeleteColumn,
  showColumnActions = true,
  renderCard,
  renderColumnHeader,
  emptyColumnLabel = "Nenhum item nesta etapa",
  addCardLabel = "Adicionar item",
  className,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const dragRef = useRef<{ sourceColId: string; cardId: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  React.useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDragStart = useCallback((colId: string, cardId: string) => {
    dragRef.current = { sourceColId: colId, cardId };
    setDraggingId(cardId);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
    setDraggingId(null);
    setDragOverColId(null);
  }, []);

  const handleDropAt = useCallback(
    (targetColId: string, targetIndex?: number) => {
      if (!dragRef.current) return;
      const { sourceColId, cardId } = dragRef.current;
      dragRef.current = null;
      setDraggingId(null);
      setDragOverColId(null);

      const sourceCol = columns.find((col) => col.id === sourceColId);
      const targetCol = columns.find((col) => col.id === targetColId);
      if (!sourceCol || !targetCol) return;

      const sourceIdx = sourceCol.cards.findIndex((c) => c.id === cardId);
      if (sourceIdx === -1) return;
      const draggedCard = sourceCol.cards[sourceIdx];

      // Intra-column vertical reorder
      if (sourceColId === targetColId) {
        const destIdx = targetIndex ?? sourceCol.cards.length - 1;
        if (destIdx === sourceIdx) return;
        const nextCards = [...sourceCol.cards];
        nextCards.splice(sourceIdx, 1);
        nextCards.splice(destIdx, 0, draggedCard);
        const finalCols = columns.map((col) =>
          col.id === sourceColId ? { ...col, cards: nextCards } : col
        );
        setColumns(finalCols);
        onChange?.(finalCols);
        onMoveCard?.(cardId, sourceColId, targetColId, destIdx);
        return;
      }

      // Cross-column move
      const insertionIndex = targetIndex ?? targetCol.cards.length;
      const finalCols = columns.map((col) => {
        if (col.id === sourceColId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === targetColId) {
          const nextCards = [...col.cards];
          nextCards.splice(insertionIndex, 0, draggedCard);
          return { ...col, cards: nextCards };
        }
        return col;
      });

      setColumns(finalCols);
      onChange?.(finalCols);
      onMoveCard?.(cardId, sourceColId, targetColId, insertionIndex);
    },
    [columns, onChange, onMoveCard],
  );

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-2">
      {/* ── Mobile/Tablet Quick Column Switcher (Acesso Rápido às Colunas) ── */}
      {columns.length > 0 && (
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5 no-scrollbar shrink-0">
          {columns.map((col) => (
            <button
              data-component-id={`erp.kanban.col-scroll-${col.id}`}
              key={col.id}
              type="button"
              onClick={() => {
                const el = document.getElementById(`kanban-col-${col.id}`);
                el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-white dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-700/70 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <span>{col.title}</span>
              <span className="text-[10px] font-bold font-mono px-1 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                {col.cards.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Main Board: Colunas com Snap no Mobile e Distribuição Flex no 2XL ── */}
      <div
        className={twMerge(
          "flex gap-2.5 sm:gap-3.5 xl:gap-4 overflow-x-auto pb-2 pt-0.5 items-stretch h-full min-h-0 w-full snap-x snap-mandatory md:snap-none scroll-smooth",
          className,
        )}
      >
        {columns.map((column) => {
          const isTarget = dragOverColId === column.id;
          const wipExceeded = column.limit !== undefined && column.cards.length > column.limit;
          const wipAtLimit = column.limit !== undefined && column.cards.length === column.limit;
          const hasColMenu = showColumnActions && Boolean(onEditColumn || onDeleteColumn);

          return (
            <div
              key={column.id}
              id={`kanban-col-${column.id}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColId(column.id);
              }}
              onDragLeave={() => setDragOverColId(null)}
              onDrop={() => handleDropAt(column.id)}
              className={twMerge(
                "flex flex-col w-[86vw] sm:w-[300px] lg:w-[320px] 2xl:flex-1 2xl:w-auto 2xl:min-w-[280px] shrink-0 snap-center snap-always md:snap-none rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-3 select-none transition-all duration-150 h-full max-h-full min-h-0",
                isTarget && "bg-blue-50/30 dark:bg-blue-950/20 border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/40"
              )}
            >
              {/* ── Column Header ────────────────────────────────────────── */}
              <div className="shrink-0">
                {renderColumnHeader ? (
                  renderColumnHeader(column, column.cards)
                ) : (
                  <div className="mb-2 px-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {column.title}
                        </span>
                        <span
                          className={twMerge(
                            "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold border shadow-2xs font-mono",
                            wipExceeded
                              ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
                              : wipAtLimit
                                ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-300/60 dark:border-zinc-700"
                          )}
                          title={
                            column.limit !== undefined
                              ? `Limite WIP: ${column.cards.length} / ${column.limit}`
                              : undefined
                          }
                        >
                          {column.limit !== undefined
                            ? `${column.cards.length}/${column.limit}`
                            : column.cards.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-zinc-400">
                        {onAddCard && (
                          <button
                            data-component-id={`erp.kanban.add-card-${column.id}`}
                            type="button"
                            onClick={() => onAddCard(column.id)}
                            className="p-1 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title={addCardLabel}
                            aria-label={addCardLabel}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasColMenu && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                data-component-id={`erp.kanban.col-menu-${column.id}`}
                                type="button"
                                aria-label="Opções da coluna"
                                className="p-1 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEditColumn && (
                                <DropdownMenuItem onClick={() => onEditColumn(column)}>
                                  <Pencil className="w-3.5 h-3.5 mr-2" />
                                  Editar coluna
                                </DropdownMenuItem>
                              )}
                              {onDeleteColumn && (
                                <DropdownMenuItem
                                  onClick={() => onDeleteColumn(column.id)}
                                  className="text-red-600 focus:text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Excluir coluna
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {column.subtitle && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {column.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Cards List ───────────────────────────────────────────── */}
              <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
                {column.cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
                    <span>{emptyColumnLabel}</span>
                  </div>
                ) : (
                  column.cards.map((card, cardIdx) => (
                    <KanbanCardItem
                      key={`${column.id}-${card.id}`}
                      card={card}
                      cardIndex={cardIdx}
                      columnId={column.id}
                      columnTipo={column.tipo}
                      column={column}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDropAtCard={handleDropAt}
                      isDragging={draggingId === card.id}
                      onCardClick={onCardClick}
                      renderCard={renderCard}
                    />
                  ))
                )}
              </div>

              {/* ── Add Card Footer Button ───────────────────────────────── */}
              {onAddCard && (
                <button
                  data-component-id={`erp.kanban.add-card-footer-${column.id}`}
                  type="button"
                  onClick={() => onAddCard(column.id)}
                  className="shrink-0 mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-2 text-xs font-medium text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{addCardLabel}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
