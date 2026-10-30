"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SortableItemRenderMeta = {
  index: number;
  isDragging: boolean;
  isOver: boolean;
  moveUp: () => void;
  moveDown: () => void;
};

export type SortableListVariant = "cards" | "divided" | "compact";

export type SortableListProps<T> = {
  items: T[];
  onChange: (nextItems: T[]) => void;
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, meta: SortableItemRenderMeta) => React.ReactNode;
  /** Show left drag grip handle. Default: true */
  handle?: boolean;
  /** Show optional accessible Up/Down arrow buttons on the right. Default: false */
  showMoveButtons?: boolean;
  /** Show 1-based position number badge. Default: false */
  showIndex?: boolean;
  variant?: SortableListVariant;
  disabled?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
};

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

// ── Component (Mantine UI Drag'n'drop list) ───────────────────────────────────

export default function SortableList<T>({
  items,
  onChange,
  keyExtractor,
  renderItem,
  handle = true,
  showMoveButtons = false,
  showIndex = false,
  variant = "cards",
  disabled = false,
  emptyState,
  className,
  itemClassName,
  componentId,
  hideIfDenied = false,
}: SortableListProps<T>) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  if (!hasPermission && hideIfDenied) return null;

  const isDisabled = disabled || !hasPermission;

  const moveItem = (from: number, to: number) => {
    if (isDisabled || from === to || to < 0 || to >= items.length) return;
    onChange(arrayMove(items, from, to));
  };

  if (items.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  return (
    <ul
      role="list"
      aria-label="Lista reordenável"
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col",
        variant === "cards" && "gap-2.5",
        variant === "compact" && "gap-1.5",
        variant === "divided" &&
          "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface",
        isDisabled && "opacity-60",
        className,
      )}
    >
      {items.map((item, idx) => {
        const key = keyExtractor(item, idx);
        const isDragging = dragIdx === idx;
        const isOver = overIdx === idx && dragIdx !== null && dragIdx !== idx;

        const moveUp = () => moveItem(idx, idx - 1);
        const moveDown = () => moveItem(idx, idx + 1);

        return (
          <li
            key={key}
            draggable={!isDisabled}
            tabIndex={isDisabled ? -1 : 0}
            onDragStart={(e) => {
              if (isDisabled) {
                e.preventDefault();
                return;
              }
              setDragIdx(idx);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(idx));
            }}
            onDragOver={(e) => {
              if (isDisabled || dragIdx === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overIdx !== idx) setOverIdx(idx);
            }}
            onDrop={(e) => {
              if (isDisabled) return;
              e.preventDefault();
              const from = dragIdx ?? Number(e.dataTransfer.getData("text/plain"));
              if (!Number.isNaN(from) && from !== idx) {
                moveItem(from, idx);
              }
              setDragIdx(null);
              setOverIdx(null);
            }}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            onKeyDown={(e) => {
              if (isDisabled) return;
              if ((e.altKey || e.ctrlKey) && e.key === "ArrowUp") {
                e.preventDefault();
                moveUp();
              } else if ((e.altKey || e.ctrlKey) && e.key === "ArrowDown") {
                e.preventDefault();
                moveDown();
              }
            }}
            title={
              isDisabled
                ? undefined
                : "Arraste para reordenar ou use Alt+Seta Acima/Abaixo"
            }
            className={twMerge(
              "group/sortable relative flex items-center gap-3 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              variant === "cards" &&
                "rounded-xl border border-border bg-surface px-3.5 py-3 shadow-2xs hover:border-border-strong",
              variant === "compact" &&
                "rounded-lg border border-border bg-surface px-3 py-2 hover:border-border-strong",
              variant === "divided" && "bg-surface px-4 py-3 hover:bg-surface-hover/50",
              !isDisabled && "cursor-grab active:cursor-grabbing",
              isDragging && "opacity-45 scale-[0.99] ring-2 ring-primary/40",
              isOver &&
                "border-primary bg-primary/5 ring-2 ring-primary/30 -translate-y-0.5 shadow-md",
              itemClassName,
            )}
          >
            {handle && (
              <span
                aria-hidden="true"
                className={twMerge(
                  "flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors",
                  !isDisabled && "group-hover/sortable:text-foreground",
                )}
              >
                <GripVertical size={16} />
              </span>
            )}

            {showIndex && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] font-bold text-muted-foreground">
                {idx + 1}
              </span>
            )}

            <div className="min-w-0 flex-1">
              {renderItem(item, {
                index: idx,
                isDragging,
                isOver,
                moveUp,
                moveDown,
              })}
            </div>

            {showMoveButtons && !isDisabled && (
              <div className="flex shrink-0 items-center gap-0.5 opacity-70 group-hover/sortable:opacity-100">
                <button
                  type="button"
                  aria-label="Mover para cima"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp();
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Mover para baixo"
                  disabled={idx === items.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown();
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { SortableList };
