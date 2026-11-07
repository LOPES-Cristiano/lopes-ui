"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Plus,
  MoreVertical,
  GripVertical,
  Calendar,
  CheckSquare,
  Paperclip,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  Columns,
  Play,
  Pause,
  Square,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { formatDateBR } from "../utils/date";
import { sanitizeCssColor } from "../utils/sanitize";
import { useAccessControl } from "./useAccessControl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./primitives/dropdown-menu";

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0 || Number.isNaN(seconds)) return "0m";
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
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
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
  /** Alias em inglês para `codigo` */
  code?: number | string;
  title: string;
  description?: string;
  tags?: Array<KanbanTag | string>;
  color?: KanbanCardColor;
  priority?: KanbanCardPriority | string;
  assignees?: KanbanAssignee[];
  assignee?: KanbanAssignee;
  dueDate?: string;
  isOverdue?: boolean;
  blocked?: boolean;
  bloqueada?: boolean;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  componentId?: string;
  hideIfDenied?: boolean;
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

const colorBorder: Record<KanbanCardColor, string> = {
  zinc: "border-l-zinc-400 dark:border-l-zinc-500",
  indigo: "border-l-indigo-500 dark:border-l-indigo-400",
  blue: "border-l-blue-500 dark:border-l-blue-400",
  emerald: "border-l-emerald-500 dark:border-l-emerald-400",
  amber: "border-l-amber-500 dark:border-l-amber-400",
  red: "border-l-red-500 dark:border-l-red-400",
  violet: "border-l-violet-500 dark:border-l-violet-400",
  pink: "border-l-pink-500 dark:border-l-pink-400",
  teal: "border-l-teal-500 dark:border-l-teal-400",
};

// ── Priority Badge Helper ─────────────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const p = priority.toUpperCase();

  if (p === "URGENTE" || p === "CRITICA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-danger text-white shadow-2xs">
        <Flame className="w-2.5 h-2.5 text-white" />
        Urgente
      </span>
    );
  }
  if (p === "ALTA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-warning text-white shadow-2xs">
        <ArrowUp className="w-2.5 h-2.5 text-white" />
        Alta
      </span>
    );
  }
  if (p === "MEDIA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-info text-white shadow-2xs">
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
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground">
      {priority}
    </span>
  );
}

// ── Tag Badge Helper ──────────────────────────────────────────────────────────

export function TagBadge({ tag, index = 0 }: { tag: KanbanTag | string; index?: number }) {
  const isObj = typeof tag === "object" && tag !== null;
  const name = isObj ? tag.name : tag;
  const safeBg = isObj ? sanitizeCssColor(tag.corFundo || tag.color) : undefined;
  const safeText = isObj ? sanitizeCssColor(tag.corTexto) : undefined;

  if (safeBg) {
    return (
      <span
        className="text-[9px] rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider shadow-2xs"
        style={{
          backgroundColor: safeBg,
          color: safeText || "#FFFFFF",
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
          aria-label={a.name}
          className="w-5 h-5 rounded-full ring-2 ring-surface bg-muted flex items-center justify-center text-[9px] font-bold text-foreground overflow-hidden shrink-0 shadow-2xs"
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
        <div className="w-5 h-5 rounded-full ring-2 ring-surface bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0 tabular-nums">
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
  columnTipo,
  column,
  onDragStart,
  onDragEnd,
  onDropAtCard,
  isDragging,
  onCardClick,
  renderCard,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  activeTimerCardId,
  activeTimerSeconds,
  activeTimerStatus,
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
  onStartTimer?: (card: KanbanCard) => void;
  onPauseTimer?: (card: KanbanCard) => void;
  onResumeTimer?: (card: KanbanCard) => void;
  onStopTimer?: (card: KanbanCard) => void;
  activeTimerCardId?: string | null;
  activeTimerSeconds?: number;
  activeTimerStatus?: "RODANDO" | "PAUSADO" | null;
}) {
  const isCardDraggable = card.draggable !== false;

  if (renderCard) {
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
          "transition-all duration-150 cursor-pointer",
          isDragging && "opacity-40 scale-95 ring-2 ring-primary shadow-xl rounded-lg",
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

  const displayCode = card.codigo ?? card.code;
  const isBlocked = Boolean(card.blocked ?? card.bloqueada);
  const isConcluido = columnTipo === "CONCLUIDO" || columnTipo === "DONE";

  const isTimerActive = activeTimerCardId === card.id;
  const resolvedTimerStatus = isTimerActive
    ? (activeTimerStatus ?? card.timerStatus ?? "RODANDO")
    : (card.timerStatus ?? null);
  const hasTimerControls = Boolean(onStartTimer || onPauseTimer || onResumeTimer || onStopTimer);

  const baseSpentSeconds = card.spentSeconds ?? (card.spentHours ? card.spentHours * 3600 : 0);
  const totalSpentSeconds =
    baseSpentSeconds + (isTimerActive ? Math.max(0, activeTimerSeconds ?? 0) : 0);
  const estSec = card.estimatedHours ? card.estimatedHours * 3600 : 0;
  const isTimeExceeded = estSec > 0 && totalSpentSeconds > estSec;
  const showTimeChip =
    totalSpentSeconds > 0 ||
    estSec > 0 ||
    card.spentSeconds !== undefined ||
    card.spentHours !== undefined;

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
      onClick={() => onCardClick?.(card, columnId)}
      aria-grabbed={isDragging}
      className={twMerge(
        "group relative rounded-xl bg-surface",
        "border border-border/80",
        "p-3.5 shadow-2xs hover:shadow-md hover:border-border transition-all duration-150 ease-out",
        isCardDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        "text-left",
        card.color && `border-l-4 ${colorBorder[card.color]}`,
        isDragging && "opacity-40 scale-98 rotate-1 ring-2 ring-primary shadow-xl",
        isTimerActive &&
          resolvedTimerStatus === "RODANDO" &&
          "ring-2 ring-success border-success/70 bg-success/5",
        isBlocked && "border-l-4 border-l-danger bg-danger/5",
      )}
    >
      {/* Top row: Code + Priority + Sprint + Status Flags */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {displayCode !== undefined && displayCode !== "" && (
            <span className="text-[11px] font-mono font-bold text-muted-foreground tabular-nums">
              #{displayCode}
            </span>
          )}
          <PriorityBadge priority={card.priority} />
          {card.semanaAno && (
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/25 shadow-2xs tabular-nums">
              <Calendar className="w-2.5 h-2.5" />
              <span>
                SEMANA {card.semanaAno}
                {card.ano ? `/${card.ano}` : ""}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {card.isOverdue && !isConcluido && (
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-danger text-white shadow-2xs animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
              Atrasada
            </span>
          )}

          {isBlocked && (
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-danger text-white shadow-2xs">
              <Lock className="w-2.5 h-2.5 text-white" />
              Bloqueada
            </span>
          )}

          {isConcluido && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}

          {isCardDraggable && (
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
      </div>

      {/* Card Title */}
      <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{card.title}</p>

      {/* Card Description */}
      {card.description && (
        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
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
      <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground flex-wrap tabular-nums">
          {showTimeChip && (
            <div
              className={twMerge(
                "inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md text-[10px]",
                isTimeExceeded
                  ? "bg-warning/15 text-warning border border-warning/30"
                  : "text-foreground/80",
              )}
            >
              <Clock
                className={twMerge(
                  "w-3 h-3 shrink-0",
                  isTimeExceeded ? "text-warning" : "text-muted-foreground",
                )}
              />
              <span>
                {isTimerActive && resolvedTimerStatus === "RODANDO"
                  ? formatClock(totalSpentSeconds)
                  : formatDuration(totalSpentSeconds)}
              </span>
              {estSec > 0 && <span> / {formatDuration(estSec)}</span>}
              {isTimeExceeded && (
                <span className="text-[9px] font-black text-warning bg-warning/20 px-1 rounded">
                  +{formatDuration(totalSpentSeconds - estSec)}
                </span>
              )}
            </div>
          )}

          {isTimerActive && resolvedTimerStatus === "RODANDO" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-success text-white animate-pulse shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Ativo
            </span>
          )}

          {/* Inline Stopwatch Controls */}
          {hasTimerControls && !isConcluido && (
            <div
              className="inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {resolvedTimerStatus === "RODANDO" ? (
                <>
                  {onPauseTimer && (
                    <button
                      type="button"
                      aria-label="Pausar cronômetro"
                      onClick={() => onPauseTimer(card)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer transition-colors"
                    >
                      <Pause className="w-3 h-3" />
                    </button>
                  )}
                  {onStopTimer && (
                    <button
                      type="button"
                      aria-label="Finalizar cronômetro"
                      onClick={() => onStopTimer(card)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer transition-colors"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                    </button>
                  )}
                </>
              ) : resolvedTimerStatus === "PAUSADO" ? (
                <>
                  {(onResumeTimer || onStartTimer) && (
                    <button
                      type="button"
                      aria-label="Retomar cronômetro"
                      onClick={() => (onResumeTimer ? onResumeTimer(card) : onStartTimer?.(card))}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-success/30 bg-success/10 text-success hover:bg-success/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  )}
                  {onStopTimer && (
                    <button
                      type="button"
                      aria-label="Finalizar cronômetro"
                      onClick={() => onStopTimer(card)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer transition-colors"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                    </button>
                  )}
                </>
              ) : (
                onStartTimer && (
                  <button
                    type="button"
                    aria-label="Iniciar cronômetro"
                    onClick={() => onStartTimer(card)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground hover:border-success/40 hover:bg-success/10 hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )
              )}
            </div>
          )}

          {card.dueDate && (
            <div
              className={twMerge(
                "inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md text-[10px]",
                card.isOverdue && !isConcluido
                  ? "bg-danger/10 text-danger font-bold border border-danger/30"
                  : "text-muted-foreground",
              )}
            >
              {card.isOverdue && !isConcluido ? (
                <AlertTriangle className="w-2.5 h-2.5 text-danger shrink-0" />
              ) : (
                <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
              <span>{formatDateBR(card.dueDate)}</span>
            </div>
          )}

          {card.checklistTotal !== undefined && card.checklistTotal > 0 && (
            <div className="inline-flex items-center gap-1 font-semibold bg-muted px-1.5 py-0.5 rounded-md border border-border/60">
              <CheckSquare className="w-2.5 h-2.5 text-muted-foreground" />
              <span>
                {card.checklistDone ?? 0}/{card.checklistTotal}
              </span>
            </div>
          )}

          {card.attachmentsCount !== undefined && card.attachmentsCount > 0 && (
            <div className="inline-flex items-center gap-0.5 font-medium text-muted-foreground">
              <Paperclip className="w-2.5 h-2.5" />
              <span>{card.attachmentsCount}</span>
            </div>
          )}

          {card.commentsCount !== undefined && card.commentsCount > 0 && (
            <div className="inline-flex items-center gap-0.5 font-medium text-muted-foreground">
              <MessageSquare className="w-2.5 h-2.5" />
              <span>{card.commentsCount}</span>
            </div>
          )}
        </div>

        <AssigneesStack assignees={assigneesList} />
      </div>
    </div>
  );
}

// ── Main Board Component ──────────────────────────────────────────────────────

export default function KanbanBoard({
  componentId,
  hideIfDenied = true,
  columns: initialColumns,
  onChange,
  onAddCard,
  onCardClick,
  onMoveCard,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onReorderColumns,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  activeTimerCardId,
  activeTimerSeconds,
  activeTimerStatus,
  showColumnActions = true,
  renderCard,
  renderColumnHeader,
  emptyColumnLabel = "Nenhum item nesta etapa",
  addCardLabel = "Adicionar item",
  className,
}: KanbanBoardProps) {
  const { canAccess } = useAccessControl();
  const hasAccess = componentId ? canAccess(componentId) : true;

  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [prevInitialColumns, setPrevInitialColumns] = useState<KanbanColumn[]>(initialColumns);
  const dragRef = useRef<{ sourceColId: string; cardId: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  if (prevInitialColumns !== initialColumns) {
    setPrevInitialColumns(initialColumns);
    setColumns(initialColumns);
  }

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
          col.id === sourceColId ? { ...col, cards: nextCards } : col,
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

  const moveColumnPosition = useCallback(
    (colIndex: number, direction: "left" | "right") => {
      const newIdx = direction === "left" ? colIndex - 1 : colIndex + 1;
      if (newIdx < 0 || newIdx >= columns.length) return;
      const copy = [...columns];
      const [item] = copy.splice(colIndex, 1);
      copy.splice(newIdx, 0, item);
      setColumns(copy);
      onChange?.(copy);
      onReorderColumns?.(copy);
    },
    [columns, onChange, onReorderColumns],
  );

  if (!hasAccess && hideIfDenied) {
    return null;
  }

  return (
    <div
      data-component-id={componentId}
      className={twMerge(
        "flex flex-col h-full min-h-0 w-full gap-2",
        !hasAccess && "opacity-50 pointer-events-none",
      )}
    >
      {/* Mobile/Tablet Quick Column Switcher */}
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
              className="inline-flex min-h-7 items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-surface text-foreground border border-border shadow-2xs hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <span>{col.title}</span>
              <span className="text-[10px] font-bold font-mono tabular-nums px-1 rounded bg-muted text-muted-foreground">
                {col.cards.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Board */}
      <div
        className={twMerge(
          "flex gap-2.5 sm:gap-3.5 xl:gap-4 overflow-x-auto pb-2 pt-0.5 items-stretch h-full min-h-0 w-full snap-x snap-mandatory md:snap-none scroll-smooth",
          className,
        )}
      >
        {columns.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
              <Columns className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Este quadro ainda não possui colunas
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Crie as etapas do seu fluxo de trabalho (ex: Backlog, Em Andamento, Revisão, Concluído).
            </p>
            {onAddColumn && (
              <button
                data-component-id="erp.kanban.create-first-col"
                type="button"
                onClick={onAddColumn}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeira Coluna</span>
              </button>
            )}
          </div>
        )}

        {columns.map((column, colIndex) => {
          const isTarget = dragOverColId === column.id;
          const wipExceeded = column.limit !== undefined && column.cards.length > column.limit;
          const wipAtLimit = column.limit !== undefined && column.cards.length === column.limit;
          const canReorder = Boolean(onReorderColumns && columns.length > 1);
          const hasColMenu =
            showColumnActions && Boolean(onEditColumn || onDeleteColumn || canReorder);

          const totalEstimatedSeconds = column.cards.reduce(
            (sum, c) => sum + (c.estimatedHours ? c.estimatedHours * 3600 : 0),
            0,
          );
          const totalSpentSeconds = column.cards.reduce(
            (sum, c) => sum + (c.spentSeconds ?? (c.spentHours ? c.spentHours * 3600 : 0)),
            0,
          );
          const hasTimeRollup = totalEstimatedSeconds > 0 || totalSpentSeconds > 0;

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
                "flex flex-col w-[86vw] sm:w-[300px] lg:w-[320px] 2xl:flex-1 2xl:w-auto 2xl:min-w-[280px] shrink-0 snap-center snap-always md:snap-none rounded-xl bg-muted/35 border border-border/80 p-3 transition-all duration-150 h-full max-h-full min-h-0",
                isTarget && "bg-primary/5 border-primary ring-2 ring-primary/30",
                wipExceeded && "border-danger/50 bg-danger/5",
              )}
            >
              {/* Column Header */}
              <div className="shrink-0">
                {renderColumnHeader ? (
                  renderColumnHeader(column, column.cards)
                ) : (
                  <div className="mb-2 px-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">
                          {column.title}
                        </span>
                        <span
                          className={twMerge(
                            "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold border shadow-2xs font-mono tabular-nums",
                            wipExceeded
                              ? "bg-danger/15 text-danger border-danger/40"
                              : wipAtLimit
                                ? "bg-warning/15 text-warning border-warning/40"
                                : "bg-muted text-foreground border-border",
                          )}
                        >
                          {column.limit !== undefined
                            ? `${column.cards.length}/${column.limit}`
                            : column.cards.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                        {onAddCard && (
                          <button
                            data-component-id={`erp.kanban.add-card-${column.id}`}
                            type="button"
                            onClick={() => onAddCard(column.id)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
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
                                className="inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
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
                              {canReorder && colIndex > 0 && (
                                <DropdownMenuItem
                                  onClick={() => moveColumnPosition(colIndex, "left")}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5 mr-2" />
                                  Mover para esquerda
                                </DropdownMenuItem>
                              )}
                              {canReorder && colIndex < columns.length - 1 && (
                                <DropdownMenuItem
                                  onClick={() => moveColumnPosition(colIndex, "right")}
                                >
                                  <ChevronRight className="w-3.5 h-3.5 mr-2" />
                                  Mover para direita
                                </DropdownMenuItem>
                              )}
                              {onDeleteColumn && (
                                <>
                                  {(onEditColumn || canReorder) && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    onClick={() => onDeleteColumn(column.id)}
                                    className="text-danger focus:text-danger"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    Excluir coluna
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {column.subtitle ? (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{column.subtitle}</p>
                    ) : hasTimeRollup ? (
                      <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                        {totalEstimatedSeconds > 0
                          ? `${formatDuration(totalEstimatedSeconds)} estimadas`
                          : "Sem estimativa"}
                        {totalSpentSeconds > 0
                          ? ` · ${formatDuration(totalSpentSeconds)} registradas`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Cards List */}
              <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
                {column.cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-xs text-muted-foreground">
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
                      onStartTimer={onStartTimer}
                      onPauseTimer={onPauseTimer}
                      onResumeTimer={onResumeTimer}
                      onStopTimer={onStopTimer}
                      activeTimerCardId={activeTimerCardId}
                      activeTimerSeconds={activeTimerSeconds}
                      activeTimerStatus={activeTimerStatus}
                    />
                  ))
                )}
              </div>

              {/* Add Card Footer Button */}
              {onAddCard && (
                <button
                  data-component-id={`erp.kanban.add-card-footer-${column.id}`}
                  type="button"
                  onClick={() => onAddCard(column.id)}
                  className="shrink-0 mt-2.5 flex min-h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{addCardLabel}</span>
                </button>
              )}
            </div>
          );
        })}

        {columns.length > 0 && onAddColumn && (
          <button
            data-component-id="erp.kanban.add-col-trailing"
            type="button"
            onClick={onAddColumn}
            className="flex h-12 w-60 shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/50 px-4 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Coluna</span>
          </button>
        )}
      </div>
    </div>
  );
}
