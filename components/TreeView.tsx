"use client";

import React, {
  createContext, useContext,
  useState, useCallback, useEffect,
} from "react";
import {
  ChevronRight, File, Folder, FolderOpen, GripVertical,
  type LucideIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TreeNode = {
  id: string;
  label: string;
  /** Custom icon (overrides default folder/file icons) */
  icon?: LucideIcon;
  children?: TreeNode[];
  /** Expand on initial render */
  defaultExpanded?: boolean;
  badge?: string | number;
};

export type TreeViewProps = {
  items: TreeNode[];
  /** Visual density */
  size?: "sm" | "md";
  /** "none" hides checkboxes and click-to-select; "single" | "multiple" enable it */
  selectionMode?: "none" | "single" | "multiple";
  /** Controlled selected keys */
  selectedKeys?: Set<string>;
  defaultSelectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  /** Draw connector lines between parent and children */
  showLines?: boolean;
  /** Enable drag-to-reorder within the same parent */
  draggable?: boolean;
  onMove?: (draggedId: string, targetId: string, position: "before" | "after" | "inside") => void;
  className?: string;
};

// ── Internal context ──────────────────────────────────────────────────────────

type DropPos = "before" | "after" | "inside";

type TreeCtx = {
  size: "sm" | "md";
  selectionMode: NonNullable<TreeViewProps["selectionMode"]>;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  showLines: boolean;
  draggable: boolean;
  dragId: string | null;
  setDragId: (v: string | null) => void;
  dropOver: string | null;
  dropPos: DropPos | null;
  setDrop: (over: string | null, pos: DropPos | null) => void;
  onInternalMove: (dId: string, tId: string, pos: DropPos) => void;
  rootItems: TreeNode[];
};

const TreeContext = createContext<TreeCtx>({} as TreeCtx);

// ── DnD helpers ───────────────────────────────────────────────────────────────

function findSubtree(items: TreeNode[], id: string): TreeNode | null {
  for (const n of items) {
    if (n.id === id) return n;
    const found = findSubtree(n.children ?? [], id);
    if (found) return found;
  }
  return null;
}

function containsId(node: TreeNode, id: string): boolean {
  if (node.id === id) return true;
  return (node.children ?? []).some((c) => containsId(c, id));
}

function removeNode(items: TreeNode[], id: string): [TreeNode[], TreeNode | null] {
  let removed: TreeNode | null = null;
  const result: TreeNode[] = [];
  for (const item of items) {
    if (item.id === id) { removed = item; continue; }
    if (item.children) {
      const [newChildren, r] = removeNode(item.children, id);
      if (r) removed = r;
      result.push({ ...item, children: newChildren });
    } else {
      result.push(item);
    }
  }
  return [result, removed];
}

function insertNode(items: TreeNode[], node: TreeNode, targetId: string, pos: DropPos): TreeNode[] {
  const result: TreeNode[] = [];
  for (const item of items) {
    if (item.id === targetId) {
      if (pos === "before") result.push(node, item);
      else if (pos === "after") result.push(item, node);
      else result.push({ ...item, children: [...(item.children ?? []), node] });
    } else if (item.children) {
      result.push({ ...item, children: insertNode(item.children, node, targetId, pos) });
    } else {
      result.push(item);
    }
  }
  return result;
}

function moveNode(items: TreeNode[], dragId: string, targetId: string, pos: DropPos): TreeNode[] {
  const [without, removed] = removeNode(items, dragId);
  if (!removed) return items;
  return insertNode(without, removed, targetId, pos);
}

// ── Tree Item ─────────────────────────────────────────────────────────────────

function TreeItem({ node }: { node: TreeNode }) {
  const {
    size, selectionMode, selectedIds, toggleSelect,
    expandedIds, toggleExpand, showLines, draggable,
    dragId, setDragId, dropOver, dropPos, setDrop,
    onInternalMove, rootItems,
  } = useContext(TreeContext);

  const hasChildren = !!node.children?.length;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedIds.has(node.id);
  const Icon = node.icon ?? (hasChildren ? (isExpanded ? FolderOpen : Folder) : File);

  const isDragging = dragId === node.id;
  const isDropTarget = dropOver === node.id;

  // Sizing tokens
  const pad        = size === "sm" ? "py-0.5 px-1"   : "py-1 px-1.5";
  const textCls    = size === "sm" ? "text-xs"        : "text-sm";
  const iconSz     = size === "sm" ? 13               : 15;
  const chevSz     = size === "sm" ? 12               : 13;
  const checkCls   = size === "sm" ? "w-3.5 h-3.5"   : "w-4 h-4";
  const childIndent = showLines
    ? (size === "sm" ? "border-l border-zinc-200 dark:border-zinc-700 ml-[1.3125rem] pl-0.5" : "border-l border-zinc-200 dark:border-zinc-700 ml-[1.5625rem] pl-0.5")
    : (size === "sm" ? "ml-[1.3125rem]" : "ml-[1.5625rem]");

  const iconColorCls = node.icon
    ? (isSelected && selectionMode !== "none" ? "text-white" : "text-zinc-500")
    : hasChildren
    ? (isSelected && selectionMode !== "none" ? "text-white" : "text-amber-400")
    : (isSelected && selectionMode !== "none" ? "text-white" : "text-blue-400");

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent) => {
    setDragId(node.id);
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnd = () => {
    setDragId(null);
    setDrop(null, null);
  };

  const resolvePos = (e: React.DragEvent): DropPos => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;
    if (y < h * 0.3) return "before";
    if (y > h * 0.7) return "after";
    return hasChildren ? "inside" : "after";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggable || !dragId || dragId === node.id) return;
    const dragged = findSubtree(rootItems, dragId);
    if (dragged && containsId(dragged, node.id)) return; // prevent drop onto own descendant
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDrop(node.id, resolvePos(e));
  };
  const handleDragLeave = (e: React.DragEvent) => {
    const rel = e.relatedTarget as Node | null;
    if (!rel || !(e.currentTarget as HTMLElement).contains(rel)) setDrop(null, null);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragId && dragId !== node.id) {
      const dragged = findSubtree(rootItems, dragId);
      if (!dragged || !containsId(dragged, node.id)) {
        onInternalMove(dragId, node.id, resolvePos(e));
      }
    }
    setDrop(null, null);
    setDragId(null);
  };

  return (
    <div className={isDragging ? "opacity-40" : ""}>

      {/* ── Drop-before indicator ── */}
      {isDropTarget && dropPos === "before" && (
        <div className="h-0.5 rounded-full bg-blue-400 mx-1 mb-px" />
      )}

      {/* ── Row ── */}
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        className={[
          "group/ti relative flex items-center gap-1.5 rounded-md cursor-pointer select-none transition-colors duration-100",
          pad,
          isSelected && selectionMode !== "none"
            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
          isDropTarget && dropPos === "inside"
            ? "ring-2 ring-inset ring-blue-400 bg-blue-50 dark:bg-blue-950/30 text-zinc-700 dark:text-zinc-300"
            : "",
        ].join(" ")}
        onClick={() => selectionMode !== "none" && toggleSelect(node.id)}
        draggable={draggable}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragEnd={draggable ? handleDragEnd : undefined}
        onDragOver={draggable ? handleDragOver : undefined}
        onDragLeave={draggable ? handleDragLeave : undefined}
        onDrop={draggable ? handleDrop : undefined}
      >
        {/* Drag handle */}
        {draggable && (
          <span className="shrink-0 text-zinc-400 cursor-grab active:cursor-grabbing opacity-0 group-hover/ti:opacity-30 hover:!opacity-70 transition-opacity">
            <GripVertical size={iconSz - 1} />
          </span>
        )}

        {/* Expand chevron */}
        <span
          className={[
            "shrink-0 flex items-center justify-center transition-transform duration-150",
            hasChildren ? "text-zinc-400 cursor-pointer" : "opacity-0 pointer-events-none",
            isExpanded ? "rotate-90" : "",
          ].join(" ")}
          style={{ width: chevSz, height: chevSz }}
          onClick={hasChildren ? (e) => { e.stopPropagation(); toggleExpand(node.id); } : undefined}
        >
          {hasChildren && <ChevronRight size={chevSz} />}
        </span>

        {/* Checkbox for multiple selection */}
        {selectionMode === "multiple" && (
          <span
            className={[
              "shrink-0 flex items-center justify-center rounded border transition-all",
              checkCls,
              isSelected ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900",
            ].join(" ")}
            onClick={(e) => { e.stopPropagation(); toggleSelect(node.id); }}
          >
            {isSelected && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3.3 6L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        )}

        {/* Node icon */}
        <span className={`shrink-0 transition-colors ${iconColorCls}`}>
          <Icon size={iconSz} strokeWidth={1.75} />
        </span>

        {/* Label */}
        <span className={`flex-1 truncate leading-snug font-medium ${textCls}`}>
          {node.label}
        </span>

        {/* Badge */}
        {node.badge !== undefined && (
          <span className={[
            "shrink-0 rounded-full px-1.5 py-px leading-none font-semibold",
            size === "sm" ? "text-[9px]" : "text-[10px]",
            isSelected && selectionMode !== "none"
              ? "bg-white/20 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
          ].join(" ")}>
            {node.badge}
          </span>
        )}
      </div>

      {/* ── Drop-after indicator ── */}
      {isDropTarget && dropPos === "after" && (
        <div className="h-0.5 rounded-full bg-blue-400 mx-1 mt-px" />
      )}

      {/* ── Children ── */}
      {hasChildren && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-in-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className={`pt-px ${childIndent}`}>
              {node.children!.map((child) => (
                <TreeItem key={child.id} node={child} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TreeView (main export) ────────────────────────────────────────────────────

export default function TreeView({
  items: propItems,
  size = "sm",
  selectionMode = "none",
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  showLines = false,
  draggable: isDraggable = false,
  onMove,
  className = "",
}: TreeViewProps) {
  // Expand state — initialised from defaultExpanded flags
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    const init = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (n.defaultExpanded) ids.add(n.id);
        if (n.children) init(n.children);
      }
    };
    init(propItems);
    return ids;
  });

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  // Selection state
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => defaultSelectedKeys ?? new Set()
  );
  const selectedIds = selectedKeys ?? internalSelected;

  const toggleSelect = useCallback((id: string) => {
    const updated = (prev: Set<string>): Set<string> => {
      const next = new Set(prev);
      if (selectionMode === "single") {
        next.clear();
        if (!prev.has(id)) next.add(id);
      } else {
        if (next.has(id)) next.delete(id); else next.add(id);
      }
      return next;
    };
    if (selectedKeys === undefined) setInternalSelected(updated);
    onSelectionChange?.(updated(selectedIds));
  }, [selectionMode, selectedKeys, selectedIds, onSelectionChange]);

  // DnD state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropOver, setDropOver] = useState<string | null>(null);
  const [dropPos, setDropPos] = useState<DropPos | null>(null);

  const setDrop = useCallback((over: string | null, pos: DropPos | null) => {
    setDropOver(over);
    setDropPos(pos);
  }, []);

  // Internal item copy for uncontrolled DnD reordering
  const [internalItems, setInternalItems] = useState(propItems);
  useEffect(() => { setInternalItems(propItems); }, [propItems]);

  const handleInternalMove = useCallback((dId: string, tId: string, pos: DropPos) => {
    setInternalItems((prev) => moveNode(prev, dId, tId, pos));
    onMove?.(dId, tId, pos);
  }, [onMove]);

  const displayItems = isDraggable ? internalItems : propItems;

  const ctxValue: TreeCtx = {
    size, selectionMode, selectedIds, toggleSelect,
    expandedIds, toggleExpand, showLines,
    draggable: isDraggable,
    dragId, setDragId,
    dropOver, dropPos, setDrop,
    onInternalMove: handleInternalMove,
    rootItems: displayItems,
  };

  return (
    <TreeContext.Provider value={ctxValue}>
      <div
        className={`select-none ${className}`}
        role="tree"
        aria-label="Tree view"
      >
        {displayItems.map((node) => (
          <TreeItem key={node.id} node={node} />
        ))}
      </div>
    </TreeContext.Provider>
  );
}
