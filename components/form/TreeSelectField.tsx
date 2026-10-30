"use client";

import React, { useCallback, useId, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Folder, FolderOpen, Minus, Search, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/popover";
import { useAccessControl } from "../useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TreeSelectNode = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** If false, only expands/collapses on click instead of being selectable (useful for folder headers) */
  selectable?: boolean;
  children?: TreeSelectNode[];
};

type SingleTreeSelectProps = {
  multiple?: false;
  treeCheckable?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, node?: TreeSelectNode) => void;
};

type MultiTreeSelectBaseProps = {
  /** When true, parent and child checked states do not cascade automatically */
  treeCheckStrictly?: boolean;
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[], nodes: TreeSelectNode[]) => void;
  maxTagCount?: number;
};

type MultiTreeSelectProps = MultiTreeSelectBaseProps &
  (
    | {
        multiple: true;
        /** Renders checkboxes on every tree node (Ant Design treeCheckable) */
        treeCheckable?: boolean;
      }
    | {
        multiple?: boolean;
        /** Renders checkboxes on every tree node (Ant Design treeCheckable) */
        treeCheckable: true;
      }
  );

export type TreeSelectFieldProps = Omit<FieldWrapperProps, "children" | "id"> &
  (SingleTreeSelectProps | MultiTreeSelectProps) & {
    id?: string;
    name?: string;
    treeData: readonly TreeSelectNode[];
    placeholder?: string;
    disabled?: boolean;
    variant?: "default" | "filled" | "underlined" | "borderless";
    size?: "sm" | "md" | "lg";
    treeDefaultExpandAll?: boolean;
    treeDefaultExpandedKeys?: string[];
    /** Show default folder icons on branch nodes when node.icon is omitted */
    showFolderIcons?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    componentId?: string;
    hideIfDenied?: boolean;
  };

// ── Helpers ───────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { minH: "min-h-8", text: "text-xs", px: "px-2.5", py: "py-1" },
  md: { minH: "min-h-10", text: "text-sm", px: "px-3", py: "py-1.5" },
  lg: { minH: "min-h-12", text: "text-base", px: "px-4", py: "py-2" },
} as const;

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function collectAllBranchKeys(nodes: readonly TreeSelectNode[]): string[] {
  const keys: string[] = [];
  const walk = (list: readonly TreeSelectNode[]) => {
    for (const n of list) {
      if (n.children && n.children.length > 0) {
        keys.push(n.value);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return keys;
}

function buildNodeIndex(nodes: readonly TreeSelectNode[]): Map<string, TreeSelectNode> {
  const map = new Map<string, TreeSelectNode>();
  const walk = (list: readonly TreeSelectNode[]) => {
    for (const n of list) {
      map.set(n.value, n);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return map;
}

function collectEnabledDescendantValues(node: TreeSelectNode): string[] {
  const vals: string[] = [];
  const walk = (n: TreeSelectNode) => {
    if (!n.disabled && n.selectable !== false) {
      vals.push(n.value);
    }
    if (n.children) {
      for (const c of n.children) walk(c);
    }
  };
  walk(node);
  return vals;
}

function filterTreeByQuery(
  nodes: readonly TreeSelectNode[],
  normQuery: string
): { filtered: TreeSelectNode[]; matchedBranchKeys: Set<string> } {
  const matchedBranchKeys = new Set<string>();
  const walk = (list: readonly TreeSelectNode[]): TreeSelectNode[] => {
    const out: TreeSelectNode[] = [];
    for (const n of list) {
      const selfMatches =
        normalizeText(n.label).includes(normQuery) ||
        (n.description ? normalizeText(n.description).includes(normQuery) : false);
      const childMatches = n.children ? walk(n.children) : [];
      if (selfMatches || childMatches.length > 0) {
        if (childMatches.length > 0) matchedBranchKeys.add(n.value);
        out.push({
          ...n,
          children: childMatches.length > 0 ? childMatches : n.children,
        });
      }
    }
    return out;
  };
  return { filtered: walk(nodes), matchedBranchKeys };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TreeSelectField(props: TreeSelectFieldProps) {
  const {
    label,
    labelInline,
    orientation,
    labelWidth,
    required,
    tooltip,
    labelAction,
    error,
    helpText,
    hint,
    width,
    className,
    id: idProp,
    name,
    treeData,
    placeholder = "Selecionar item...",
    disabled = false,
    variant = "default",
    size = "md",
    treeDefaultExpandAll = false,
    treeDefaultExpandedKeys,
    showFolderIcons = false,
    clearable = true,
    searchable = true,
    searchPlaceholder = "Filtrar árvore...",
    emptyMessage = "Nenhum nó encontrado",
    componentId,
    hideIfDenied = false,
  } = props;

  const autoId = useId();
  const id = idProp ?? autoId;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const isMulti = Boolean(props.multiple || props.treeCheckable);
  const isCheckable = Boolean(props.treeCheckable);
  const checkStrictly = "treeCheckStrictly" in props ? Boolean(props.treeCheckStrictly) : false;
  const maxTagCount = "maxTagCount" in props && props.maxTagCount !== undefined ? props.maxTagCount : 3;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    if (treeDefaultExpandAll) return new Set(collectAllBranchKeys(treeData));
    return new Set(treeDefaultExpandedKeys ?? []);
  });

  const [internalSingle, setInternalSingle] = useState<string>(
    !isMulti && typeof props.defaultValue === "string" ? props.defaultValue : ""
  );
  const [internalMulti, setInternalMulti] = useState<string[]>(
    isMulti && Array.isArray(props.defaultValue) ? props.defaultValue : []
  );

  const nodeIndex = useMemo(() => buildNodeIndex(treeData), [treeData]);

  const selectedSingle: string = useMemo(() => {
    if (isMulti) return "";
    return typeof props.value === "string" ? props.value : internalSingle;
  }, [isMulti, props.value, internalSingle]);

  const selectedMulti: string[] = useMemo(() => {
    if (!isMulti) return [];
    return Array.isArray(props.value) ? props.value : internalMulti;
  }, [isMulti, props.value, internalMulti]);

  const selectedMultiSet = useMemo(() => new Set(selectedMulti), [selectedMulti]);

  const normQuery = normalizeText(query.trim());
  const { visibleTree, autoExpanded } = useMemo(() => {
    if (!normQuery) {
      return { visibleTree: treeData, autoExpanded: null as Set<string> | null };
    }
    const { filtered, matchedBranchKeys } = filterTreeByQuery(treeData, normQuery);
    return { visibleTree: filtered, autoExpanded: matchedBranchKeys };
  }, [treeData, normQuery]);

  const commitSingle = useCallback(
    (val: string) => {
      if (isMulti) return;
      if (props.value === undefined) setInternalSingle(val);
      const singleOnChange = props.onChange as
        | ((v: string, n?: TreeSelectNode) => void)
        | undefined;
      singleOnChange?.(val, val ? nodeIndex.get(val) : undefined);
    },
    [isMulti, props.value, props.onChange, nodeIndex]
  );

  const commitMulti = useCallback(
    (vals: string[]) => {
      if (!isMulti) return;
      if (props.value === undefined) setInternalMulti(vals);
      const nodes = vals
        .map((v) => nodeIndex.get(v))
        .filter((n): n is TreeSelectNode => n !== undefined);
      const multiOnChange = props.onChange as
        | ((v: string[], n: TreeSelectNode[]) => void)
        | undefined;
      multiOnChange?.(vals, nodes);
    },
    [isMulti, props.value, props.onChange, nodeIndex]
  );

  const toggleExpand = (key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleToggleMultiNode = (node: TreeSelectNode) => {
    if (node.disabled) return;
    if (!isCheckable || checkStrictly || !node.children || node.children.length === 0) {
      if (node.selectable === false) {
        toggleExpand(node.value);
        return;
      }
      const exists = selectedMultiSet.has(node.value);
      const next = exists
        ? selectedMulti.filter((v) => v !== node.value)
        : [...selectedMulti, node.value];
      commitMulti(next);
      return;
    }

    // Cascade check/uncheck across all enabled descendants
    const cascadeVals = collectEnabledDescendantValues(node);
    const allChecked = cascadeVals.length > 0 && cascadeVals.every((v) => selectedMultiSet.has(v));
    if (allChecked) {
      const removeSet = new Set(cascadeVals);
      commitMulti(selectedMulti.filter((v) => !removeSet.has(v)));
    } else {
      const merged = new Set([...selectedMulti, ...cascadeVals]);
      commitMulti(Array.from(merged));
    }
  };

  const getCheckState = (node: TreeSelectNode): "checked" | "indeterminate" | "unchecked" => {
    if (!isCheckable || checkStrictly || !node.children || node.children.length === 0) {
      return selectedMultiSet.has(node.value) ? "checked" : "unchecked";
    }
    const cascadeVals = collectEnabledDescendantValues(node);
    if (cascadeVals.length === 0) return "unchecked";
    const checkedCount = cascadeVals.filter((v) => selectedMultiSet.has(v)).length;
    if (checkedCount === 0) return "unchecked";
    if (checkedCount === cascadeVals.length) return "checked";
    return "indeterminate";
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isMulti) commitMulti([]);
    else commitSingle("");
  };

  if (!hasPermission && hideIfDenied) return null;

  const sz = SIZE_MAP[size];
  const singleNode = !isMulti && selectedSingle ? nodeIndex.get(selectedSingle) : undefined;
  const hasSelection = isMulti ? selectedMulti.length > 0 : Boolean(selectedSingle);

  const variantClasses =
    variant === "underlined"
      ? "rounded-none border-0 border-b-2 border-zinc-300 dark:border-zinc-700 bg-transparent px-1 focus-visible:border-primary"
      : variant === "borderless"
        ? "rounded-xl border border-transparent bg-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50"
        : variant === "filled"
          ? "rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 focus-visible:bg-white dark:focus-visible:bg-zinc-900 focus-visible:border-primary"
          : "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-primary";

  const renderTreeNodes = (nodes: readonly TreeSelectNode[], depth = 0): React.ReactNode =>
    nodes.map((node) => {
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isExpanded = autoExpanded ? autoExpanded.has(node.value) || expandedKeys.has(node.value) : expandedKeys.has(node.value);
      const isSelected = isMulti ? selectedMultiSet.has(node.value) : selectedSingle === node.value;
      const checkState = isMulti ? getCheckState(node) : isSelected ? "checked" : "unchecked";

      return (
        <div key={node.value}>
          <div
            style={{ paddingLeft: `${depth * 16 + 6}px` }}
            className={twMerge(
              "group/tn flex items-center gap-1.5 rounded-lg pr-2.5 py-1.5 text-xs transition-colors",
              isSelected && !isCheckable
                ? "bg-primary/10 font-semibold text-primary"
                : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
              node.disabled && "opacity-45 cursor-not-allowed"
            )}
          >
            {hasChildren ? (
              <button
                type="button"
                aria-label={isExpanded ? "Recolher" : "Expandir"}
                onClick={(e) => toggleExpand(node.value, e)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer"
              >
                <ChevronRight
                  size={13}
                  className={twMerge("transition-transform duration-150", isExpanded && "rotate-90")}
                />
              </button>
            ) : (
              <span className="h-5 w-5 shrink-0" />
            )}

            <button
              type="button"
              disabled={node.disabled}
              onClick={() => {
                if (node.disabled) return;
                if (isMulti) {
                  handleToggleMultiNode(node);
                } else {
                  if (node.selectable === false && hasChildren) {
                    toggleExpand(node.value);
                    return;
                  }
                  commitSingle(node.value);
                  setOpen(false);
                }
              }}
              className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left cursor-pointer"
            >
              <span className="flex min-w-0 items-center gap-2">
                {isCheckable && (
                  <span
                    aria-hidden="true"
                    className={twMerge(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      checkState === "checked" || checkState === "indeterminate"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                    )}
                  >
                    {checkState === "checked" ? (
                      <Check size={11} strokeWidth={3} />
                    ) : checkState === "indeterminate" ? (
                      <Minus size={11} strokeWidth={3} />
                    ) : null}
                  </span>
                )}

                {node.icon ? (
                  <span className="shrink-0 text-zinc-500 dark:text-zinc-400">{node.icon}</span>
                ) : showFolderIcons && hasChildren ? (
                  isExpanded ? (
                    <FolderOpen size={14} className="shrink-0 text-amber-500" />
                  ) : (
                    <Folder size={14} className="shrink-0 text-amber-500" />
                  )
                ) : null}

                <span className="min-w-0">
                  <span className="block truncate">{node.label}</span>
                  {node.description && (
                    <span className="block truncate text-[10px] font-normal text-zinc-400">
                      {node.description}
                    </span>
                  )}
                </span>
              </span>

              {!isCheckable && isSelected && <Check size={14} className="shrink-0 text-primary" />}
            </button>
          </div>

          {hasChildren && isExpanded && node.children && (
            <div>{renderTreeNodes(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      required={required}
      tooltip={tooltip}
      labelAction={labelAction}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      {name && (
        <input
          type="hidden"
          name={name}
          value={isMulti ? JSON.stringify(selectedMulti) : selectedSingle}
        />
      )}

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (effectiveDisabled && next) return;
          setOpen(next);
          if (next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={effectiveDisabled}
            data-component-id={componentId}
            aria-expanded={open}
            data-invalid={error ? "true" : undefined}
            className={twMerge(
              "group relative flex w-full items-center justify-between gap-2 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer",
              sz.minH,
              sz.text,
              sz.px,
              sz.py,
              variantClasses,
              open && variant !== "underlined" && "border-primary ring-2 ring-primary/20",
              error && "border-red-500 dark:border-red-500 focus-visible:ring-red-500/20",
              effectiveDisabled && "opacity-55 cursor-not-allowed pointer-events-none"
            )}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {!hasSelection ? (
                <span className="truncate text-zinc-400 dark:text-zinc-500">{placeholder}</span>
              ) : isMulti ? (
                <>
                  {selectedMulti.slice(0, maxTagCount).map((val) => {
                    const node = nodeIndex.get(val);
                    return (
                      <span
                        key={val}
                        className="inline-flex max-w-full items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        <span className="truncate">{node?.label ?? val}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Remover ${node?.label ?? val}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            commitMulti(selectedMulti.filter((v) => v !== val));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              e.preventDefault();
                              commitMulti(selectedMulti.filter((v) => v !== val));
                            }
                          }}
                          className="rounded-sm p-0.5 hover:bg-primary/20 cursor-pointer"
                        >
                          <X size={11} />
                        </span>
                      </span>
                    );
                  })}
                  {selectedMulti.length > maxTagCount && (
                    <span className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      +{selectedMulti.length - maxTagCount}
                    </span>
                  )}
                </>
              ) : (
                <span className="flex min-w-0 items-center gap-2 truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {singleNode?.icon && <span className="shrink-0">{singleNode.icon}</span>}
                  <span className="truncate">{singleNode?.label ?? selectedSingle}</span>
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {clearable && hasSelection && !effectiveDisabled && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Limpar seleção"
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleClear(e as unknown as React.MouseEvent);
                    }
                  }}
                  className="rounded-md p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  <X size={14} />
                </span>
              )}
              <ChevronDown
                size={16}
                className={twMerge(
                  "text-zinc-400 transition-transform duration-150",
                  open && "rotate-180 text-primary"
                )}
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] min-w-[260px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0 shadow-xl"
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2">
              <Search size={14} className="shrink-0 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          <div role="tree" className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
            {visibleTree.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-zinc-400">{emptyMessage}</div>
            ) : (
              renderTreeNodes(visibleTree, 0)
            )}
          </div>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}

export { TreeSelectField as TreeSelect };
