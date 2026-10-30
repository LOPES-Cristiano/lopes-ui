"use client";

import React, { useCallback, useId, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/popover";
import { useAccessControl } from "../useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CascaderOption = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: CascaderOption[];
};

type SingleCascaderProps = {
  multiple?: false;
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], selectedOptions: CascaderOption[]) => void;
};

type MultipleCascaderProps = {
  multiple: true;
  value?: string[][];
  defaultValue?: string[][];
  onChange?: (paths: string[][], selectedOptionsList: CascaderOption[][]) => void;
  /** Maximum number of selected path chips displayed before "+N" badge */
  maxTagCount?: number;
};

export type CascaderFieldProps = Omit<FieldWrapperProps, "children" | "id"> &
  (SingleCascaderProps | MultipleCascaderProps) & {
    id?: string;
    name?: string;
    options: readonly CascaderOption[];
    placeholder?: string;
    disabled?: boolean;
    variant?: "default" | "filled" | "underlined" | "borderless";
    size?: "sm" | "md" | "lg";
    /** Expand child column on click (default) or hover */
    expandTrigger?: "click" | "hover";
    /** Allow selecting intermediate parent nodes before reaching a leaf */
    changeOnSelect?: boolean;
    /** Path separator in the trigger display (default: " / ") */
    separator?: string;
    /** Custom formatter for the displayed path labels */
    displayRender?: (labels: string[], selectedOptions: CascaderOption[]) => React.ReactNode;
    /** Show ONLY the leaf label in the trigger instead of the full breadcrumb path */
    showLeafOnly?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    icon?: React.ReactNode;
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

type FlattenedPath = {
  values: string[];
  labels: string[];
  nodes: CascaderOption[];
  disabled: boolean;
  normText: string;
};

function flattenCascaderPaths(
  nodes: readonly CascaderOption[],
  changeOnSelect: boolean,
  parentValues: string[] = [],
  parentLabels: string[] = [],
  parentNodes: CascaderOption[] = [],
  parentDisabled = false
): FlattenedPath[] {
  const result: FlattenedPath[] = [];
  for (const node of nodes) {
    const nextValues = [...parentValues, node.value];
    const nextLabels = [...parentLabels, node.label];
    const nextNodes = [...parentNodes, node];
    const isDisabled = parentDisabled || Boolean(node.disabled);
    const hasChildren = Boolean(node.children && node.children.length > 0);

    if (!hasChildren || changeOnSelect) {
      result.push({
        values: nextValues,
        labels: nextLabels,
        nodes: nextNodes,
        disabled: isDisabled,
        normText: normalizeText(nextLabels.join(" ")),
      });
    }
    if (hasChildren && node.children) {
      result.push(
        ...flattenCascaderPaths(
          node.children,
          changeOnSelect,
          nextValues,
          nextLabels,
          nextNodes,
          isDisabled
        )
      );
    }
  }
  return result;
}

function resolveOptionChain(
  options: readonly CascaderOption[],
  path: readonly string[]
): CascaderOption[] {
  const chain: CascaderOption[] = [];
  let currentLevel: readonly CascaderOption[] | undefined = options;
  for (const val of path) {
    if (!currentLevel) break;
    const found: CascaderOption | undefined = currentLevel.find((o) => o.value === val);
    if (!found) break;
    chain.push(found);
    currentLevel = found.children;
  }
  return chain;
}

function pathsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CascaderField(props: CascaderFieldProps) {
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
    options,
    placeholder = "Selecionar hierarquia...",
    disabled = false,
    variant = "default",
    size = "md",
    expandTrigger = "click",
    changeOnSelect = false,
    separator = " / ",
    displayRender,
    showLeafOnly = false,
    clearable = true,
    searchable = true,
    searchPlaceholder = "Pesquisar caminho...",
    emptyMessage = "Nenhuma opção encontrada",
    icon,
    componentId,
    hideIfDenied = false,
  } = props;

  const autoId = useId();
  const id = idProp ?? autoId;
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const isMultiple = props.multiple === true;
  const maxTagCount = isMultiple ? (props.maxTagCount ?? 3) : 3;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internalSingle, setInternalSingle] = useState<string[]>(
    !isMultiple ? (props.defaultValue ?? []) : []
  );
  const [internalMulti, setInternalMulti] = useState<string[][]>(
    isMultiple ? (props.defaultValue ?? []) : []
  );

  const selectedSingle: string[] = useMemo(() => {
    if (isMultiple) return [];
    return props.value !== undefined ? props.value : internalSingle;
  }, [isMultiple, props.value, internalSingle]);

  const selectedMulti: string[][] = useMemo(() => {
    if (!isMultiple) return [];
    return props.value !== undefined ? props.value : internalMulti;
  }, [isMultiple, props.value, internalMulti]);

  const [activePath, setActivePath] = useState<string[]>(() =>
    !isMultiple && selectedSingle.length > 0 ? selectedSingle : []
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (effectiveDisabled && nextOpen) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setQuery("");
      if (!isMultiple && selectedSingle.length > 0) {
        setActivePath(selectedSingle);
      } else if (isMultiple && selectedMulti.length > 0) {
        setActivePath(selectedMulti[selectedMulti.length - 1] ?? []);
      }
    }
  };

  // Build visible columns from activePath
  const columns = useMemo(() => {
    const cols: { depth: number; items: readonly CascaderOption[] }[] = [
      { depth: 0, items: options },
    ];
    let currentItems: readonly CascaderOption[] | undefined = options;
    for (let depth = 0; depth < activePath.length; depth++) {
      const activeVal = activePath[depth];
      const match: CascaderOption | undefined = currentItems?.find((o) => o.value === activeVal);
      if (match && match.children && match.children.length > 0) {
        cols.push({ depth: depth + 1, items: match.children });
        currentItems = match.children;
      } else {
        break;
      }
    }
    return cols;
  }, [options, activePath]);

  const flatPaths = useMemo(
    () => flattenCascaderPaths(options, changeOnSelect),
    [options, changeOnSelect]
  );

  const filteredPaths = useMemo(() => {
    const q = normalizeText(query.trim());
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return flatPaths.filter((fp) => terms.every((t) => fp.normText.includes(t)));
  }, [flatPaths, query]);

  const commitSingle = useCallback(
    (nextPath: string[]) => {
      if (props.multiple === true) return;
      if (props.value === undefined) setInternalSingle(nextPath);
      const chain = resolveOptionChain(options, nextPath);
      props.onChange?.(nextPath, chain);
    },
    [props, options]
  );

  const commitMulti = useCallback(
    (nextPaths: string[][]) => {
      if (props.multiple !== true) return;
      if (props.value === undefined) setInternalMulti(nextPaths);
      const chains = nextPaths.map((p) => resolveOptionChain(options, p));
      props.onChange?.(nextPaths, chains);
    },
    [props, options]
  );

  const toggleMultiPath = useCallback(
    (targetPath: string[]) => {
      const exists = selectedMulti.some((p) => pathsEqual(p, targetPath));
      const next = exists
        ? selectedMulti.filter((p) => !pathsEqual(p, targetPath))
        : [...selectedMulti, targetPath];
      commitMulti(next);
    },
    [selectedMulti, commitMulti]
  );

  const handleNodeInteract = (node: CascaderOption, depth: number, viaHover: boolean) => {
    if (node.disabled) return;
    const nextActive = [...activePath.slice(0, depth), node.value];
    setActivePath(nextActive);

    if (viaHover) return;

    const hasChildren = Boolean(node.children && node.children.length > 0);
    if (isMultiple) {
      if (!hasChildren || changeOnSelect) {
        toggleMultiPath(nextActive);
      }
      return;
    }

    if (!hasChildren) {
      commitSingle(nextActive);
      setOpen(false);
    } else if (changeOnSelect) {
      commitSingle(nextActive);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePath([]);
    if (isMultiple) {
      commitMulti([]);
    } else {
      commitSingle([]);
    }
  };

  const singleChain = useMemo(
    () => (!isMultiple ? resolveOptionChain(options, selectedSingle) : []),
    [isMultiple, options, selectedSingle]
  );

  const multiChains = useMemo(
    () => (isMultiple ? selectedMulti.map((p) => ({ path: p, chain: resolveOptionChain(options, p) })) : []),
    [isMultiple, options, selectedMulti]
  );

  if (!hasPermission && hideIfDenied) return null;

  const sz = SIZE_MAP[size];
  const hasSelection = isMultiple ? selectedMulti.length > 0 : singleChain.length > 0;

  const formatChainLabel = (chain: CascaderOption[]) => {
    const labels = chain.map((c) => c.label);
    if (displayRender) return displayRender(labels, chain);
    if (showLeafOnly) return labels[labels.length - 1] ?? "";
    return labels.join(separator);
  };

  const variantClasses =
    variant === "underlined"
      ? "rounded-none border-0 border-b-2 border-zinc-300 dark:border-zinc-700 bg-transparent px-1 focus-visible:border-primary"
      : variant === "borderless"
        ? "rounded-xl border border-transparent bg-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50"
        : variant === "filled"
          ? "rounded-xl border border-transparent bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 focus-visible:bg-white dark:focus-visible:bg-zinc-900 focus-visible:border-primary"
          : "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-primary";

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
          value={isMultiple ? JSON.stringify(selectedMulti) : selectedSingle.join("/")}
        />
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
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
              {icon && <span className="shrink-0 text-zinc-400">{icon}</span>}

              {!hasSelection ? (
                <span className="truncate text-zinc-400 dark:text-zinc-500">{placeholder}</span>
              ) : isMultiple ? (
                <>
                  {multiChains.slice(0, maxTagCount).map(({ path, chain }) => {
                    const key = path.join("::");
                    return (
                      <span
                        key={key}
                        className="inline-flex max-w-full items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        <span className="truncate">{formatChainLabel(chain)}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Remover seleção"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMultiPath(path);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleMultiPath(path);
                            }
                          }}
                          className="rounded-sm p-0.5 hover:bg-primary/20 cursor-pointer"
                        >
                          <X size={11} />
                        </span>
                      </span>
                    );
                  })}
                  {multiChains.length > maxTagCount && (
                    <span className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      +{multiChains.length - maxTagCount}
                    </span>
                  )}
                </>
              ) : (
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {formatChainLabel(singleChain)}
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
          className="w-auto min-w-[260px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0 shadow-xl"
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

          {query.trim() ? (
            <div className="max-h-64 min-w-[280px] overflow-y-auto p-1.5">
              {filteredPaths.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-zinc-400">{emptyMessage}</div>
              ) : (
                filteredPaths.map((fp) => {
                  const key = fp.values.join("::");
                  const isSelected = isMultiple
                    ? selectedMulti.some((p) => pathsEqual(p, fp.values))
                    : pathsEqual(selectedSingle, fp.values);

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={fp.disabled}
                      onClick={() => {
                        if (fp.disabled) return;
                        setActivePath(fp.values);
                        if (isMultiple) {
                          toggleMultiPath(fp.values);
                        } else {
                          commitSingle(fp.values);
                          setOpen(false);
                        }
                      }}
                      className={twMerge(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                        fp.disabled && "opacity-45 cursor-not-allowed"
                      )}
                    >
                      <span className="truncate">{fp.labels.join(separator)}</span>
                      {isSelected && <Check size={14} className="shrink-0 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex max-w-full overflow-x-auto divide-x divide-zinc-100 dark:divide-zinc-800">
              {columns.map((col) => (
                <ul
                  key={col.depth}
                  role="listbox"
                  className="max-h-64 min-w-[175px] max-w-[230px] overflow-y-auto p-1.5 space-y-0.5"
                >
                  {col.items.length === 0 ? (
                    <li className="px-3 py-4 text-center text-xs text-zinc-400">{emptyMessage}</li>
                  ) : (
                    col.items.map((node) => {
                      const hasChildren = Boolean(node.children && node.children.length > 0);
                      const isExpanded = activePath[col.depth] === node.value;
                      const candidatePath = [...activePath.slice(0, col.depth), node.value];
                      const isExactSelected = isMultiple
                        ? selectedMulti.some((p) => pathsEqual(p, candidatePath))
                        : pathsEqual(selectedSingle, candidatePath);
                      const isInSelectedTrail = isMultiple
                        ? selectedMulti.some((p) => p[col.depth] === node.value && pathsEqual(p.slice(0, col.depth), candidatePath.slice(0, col.depth)))
                        : selectedSingle[col.depth] === node.value &&
                          pathsEqual(selectedSingle.slice(0, col.depth), candidatePath.slice(0, col.depth));

                      return (
                        <li key={node.value}>
                          <button
                            type="button"
                            disabled={node.disabled}
                            onMouseEnter={
                              expandTrigger === "hover" && hasChildren
                                ? () => handleNodeInteract(node, col.depth, true)
                                : undefined
                            }
                            onClick={() => handleNodeInteract(node, col.depth, false)}
                            className={twMerge(
                              "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                              isExpanded || isExactSelected
                                ? "bg-primary/10 font-semibold text-primary"
                                : isInSelectedTrail
                                  ? "bg-zinc-100/80 dark:bg-zinc-800/60 font-medium text-zinc-900 dark:text-zinc-100"
                                  : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                              node.disabled && "opacity-45 cursor-not-allowed"
                            )}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              {isMultiple && (!hasChildren || changeOnSelect) && (
                                <span
                                  aria-hidden="true"
                                  className={twMerge(
                                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors",
                                    isExactSelected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                  )}
                                >
                                  {isExactSelected && <Check size={10} strokeWidth={3} />}
                                </span>
                              )}
                              {node.icon && <span className="shrink-0">{node.icon}</span>}
                              <span className="min-w-0">
                                <span className="block truncate">{node.label}</span>
                                {node.description && (
                                  <span className="block truncate text-[10px] font-normal text-zinc-400">
                                    {node.description}
                                  </span>
                                )}
                              </span>
                            </span>

                            {hasChildren ? (
                              <ChevronRight size={14} className="shrink-0 opacity-60" />
                            ) : isExactSelected && !isMultiple ? (
                              <Check size={14} className="shrink-0 text-primary" />
                            ) : null}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}

export { CascaderField as Cascader };
