"use client";

import React, { useState, useRef, useCallback } from "react";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// ── Types ─────────────────────────────────────────────────────────────────────

export type KanbanCardColor =
  | "zinc" | "indigo" | "blue" | "emerald" | "amber" | "red" | "violet" | "pink" | "teal";

export type KanbanCard = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  /** Accent left-border color */
  color?: KanbanCardColor;
  /** Assigned member initials/avatar */
  assignee?: { name: string; initials?: string; avatarUrl?: string };
};

export type KanbanColumn = {
  id: string;
  title: string;
  cards: KanbanCard[];
  /** Limit shown in header badge. Undefined = no limit */
  limit?: number;
  /** Column header accent */
  color?: KanbanCardColor;
};

export type KanbanBoardProps = {
  columns: KanbanColumn[];
  onChange?: (columns: KanbanColumn[]) => void;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  className?: string;
};

// ── Color map ─────────────────────────────────────────────────────────────────

const colorBorder: Record<KanbanCardColor, string> = {
  zinc:    "border-l-zinc-400",
  indigo:  "border-l-indigo-400",
  blue:    "border-l-blue-400",
  emerald: "border-l-emerald-400",
  amber:   "border-l-amber-400",
  red:     "border-l-red-400",
  violet:  "border-l-violet-400",
  pink:    "border-l-pink-400",
  teal:    "border-l-teal-400",
};

const colorHeader: Record<KanbanCardColor, string> = {
  zinc:    "text-zinc-500",
  indigo:  "text-indigo-500",
  blue:    "text-blue-500",
  emerald: "text-emerald-500",
  amber:   "text-amber-500",
  red:     "text-red-500",
  violet:  "text-violet-500",
  pink:    "text-pink-500",
  teal:    "text-teal-500",
};

const tagColors = [
  "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
];

// ── Drag state types ──────────────────────────────────────────────────────────

type DragRef = {
  sourceColId: string;
  cardId: string;
};

// ── Card component ────────────────────────────────────────────────────────────

function KanbanCardItem({
  card,
  columnId,
  onDragStart,
  isDragging,
  onCardClick,
}: {
  card: KanbanCard;
  columnId: string;
  onDragStart: (colId: string, cardId: string) => void;
  isDragging: boolean;
  onCardClick?: (card: KanbanCard, columnId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(columnId, card.id)}
      onClick={() => onCardClick?.(card, columnId)}
      aria-grabbed={isDragging}
      className={clsx(
        "group rounded-md border-l-4 bg-white dark:bg-zinc-800",
        "border border-zinc-200 dark:border-zinc-700",
        "px-3 py-2.5 shadow-sm",
        "cursor-grab active:cursor-grabbing select-none",
        "transition-opacity",
        card.color ? colorBorder[card.color] : "border-l-zinc-300",
        isDragging && "opacity-40 ring-2 ring-blue-400",
        onCardClick && "hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-snug">
          {card.title}
        </p>
        <GripVertical className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {card.description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {card.description}
        </p>
      )}
      {(card.tags?.length || card.assignee) && (
        <div className="mt-2 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex flex-wrap gap-1">
            {card.tags?.map((tag, i) => (
              <span
                key={tag}
                className={clsx(
                  "text-xs rounded-sm px-1.5 py-0.5 font-medium",
                  tagColors[i % tagColors.length],
                )}
              >
                {tag}
              </span>
            ))}
          </div>
          {card.assignee && (
            <div className="shrink-0 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-700 dark:text-zinc-200 overflow-hidden">
              {card.assignee.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={card.assignee.avatarUrl} alt={card.assignee.name} className="w-full h-full object-cover" />
                : (card.assignee.initials ?? card.assignee.name[0]?.toUpperCase())
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Board component ───────────────────────────────────────────────────────────

export default function KanbanBoard({
  columns: initialColumns,
  onChange,
  onAddCard,
  onCardClick,
  className,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const dragRef = useRef<DragRef | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = useCallback((colId: string, cardId: string) => {
    dragRef.current = { sourceColId: colId, cardId };
    setDraggingId(cardId);
  }, []);

  const handleDrop = useCallback((targetColId: string, beforeCardId?: string) => {
    if (!dragRef.current) return;
    const { sourceColId, cardId } = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);

    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));

      const srcCol = next.find((c) => c.id === sourceColId);
      const tgtCol = next.find((c) => c.id === targetColId);
      if (!srcCol || !tgtCol) return prev;

      const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId);
      if (cardIdx === -1) return prev;
      const [card] = srcCol.cards.splice(cardIdx, 1);

      if (beforeCardId) {
        const beforeIdx = tgtCol.cards.findIndex((c) => c.id === beforeCardId);
        tgtCol.cards.splice(beforeIdx, 0, card);
      } else {
        tgtCol.cards.push(card);
      }

      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
    setDraggingId(null);
  }, []);

  return (
    <div
      className={twMerge(clsx(
        "flex gap-4 overflow-x-auto pb-4 select-none",
        className,
      ))}
      onDragEnd={handleDragEnd}
    >
      {columns.map((col) => {
        const overLimit = col.limit !== undefined && col.cards.length > col.limit;
        return (
          <div
            key={col.id}
            className="flex flex-col shrink-0 w-72 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={clsx(
                    "text-sm font-semibold truncate",
                    col.color ? colorHeader[col.color] : "text-zinc-700 dark:text-zinc-300",
                  )}
                >
                  {col.title}
                </span>
                <span
                  className={clsx(
                    "text-xs font-medium rounded-full px-1.5 py-0.5",
                    overLimit
                      ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                  )}
                >
                  {col.cards.length}
                  {col.limit !== undefined && `/${col.limit}`}
                </span>
              </div>
              <button
                type="button"
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Opções da coluna"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Card list */}
            <div className="flex flex-col gap-2 flex-1 px-3 pb-2 min-h-[80px]">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.stopPropagation(); handleDrop(col.id, card.id); }}
                >
                  <KanbanCardItem
                    card={card}
                    columnId={col.id}
                    onDragStart={handleDragStart}
                    isDragging={draggingId === card.id}
                    onCardClick={onCardClick}
                  />
                </div>
              ))}
              {/* Drop zone at end */}
              <div
                onDrop={(e) => { e.stopPropagation(); handleDrop(col.id); }}
                onDragOver={(e) => e.preventDefault()}
                className="flex-1 min-h-[32px]"
              />
            </div>

            {/* Add card button */}
            {onAddCard && (
              <button
                type="button"
                onClick={() => onAddCard(col.id)}
                className="flex items-center gap-1.5 mx-3 mb-3 px-2 py-1.5 rounded text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar cartão
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
