"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Folder,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import FieldWrapper, { type FieldWrapperProps } from "./FieldWrapper";
import { useEscKey } from "../Modal";
import { useAccessControl } from "../useAccessControl";

export type SelectOption = {
  value: string;
  label: string;
  /**
   * Category or hierarchical path separated by " / "
   * (e.g. "Comercial" or "Financeiro / Contas a Receber").
   */
  group?: string;
  /** Optional subtitle displayed below the option label in the open menu. */
  description?: string;
  /** Optional compact badge displayed on the right side of the option (e.g. "R$", "%"). */
  badge?: string;
  /** Optional icon for the individual option. */
  icon?: React.ReactNode;
  /** Disables selecting this specific option. */
  disabled?: boolean;
};

export type SelectGroupMeta = {
  icon?: React.ReactNode;
  badge?: string;
};

export type SelectDisplayMode = "flat" | "grouped" | "tree";

export type SelectFieldProps = Omit<FieldWrapperProps, "children" | "id"> & {
  id?: string;
  name?: string;
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "filled";
  size?: "sm" | "md" | "lg";
  clearable?: boolean;
  /** Shorthand to enable collapsible tree mode (`displayMode="tree"`). */
  tree?: boolean;
  /** Organization mode of options in the dropdown: flat list, group headers, or expandable tree. */
  displayMode?: SelectDisplayMode;
  /** In `tree` mode, defines whether all groups start expanded (default: `false`, expands selected branch). */
  defaultExpandAll?: boolean;
  /** Displays the leaf group/category badge in the closed trigger button (default: `true` in `tree` mode). */
  showSelectedGroup?: boolean;
  /** Optional visual metadata (icon/badge) keyed by group/category name or full path key. */
  groupMeta?: Readonly<Record<string, SelectGroupMeta>>;
  /** Renders a live search input inside the dropdown (in `tree` mode, auto-enabled when >= 6 options unless set). */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  componentId?: string;
  icon?: React.ReactNode;
  hideIfDenied?: boolean;
};

const SIZE = {
  sm: { h: "h-8", text: "text-xs", px: "px-2.5" },
  md: { h: "h-10", text: "text-sm", px: "px-3" },
  lg: { h: "h-12", text: "text-base", px: "px-4" },
} as const;

type TreeBranchNode = {
  key: string;
  name: string;
  depth: number;
  parentKey: string | null;
  children: TreeBranchNode[];
  options: SelectOption[];
  totalLeafCount: number;
  containsSelected: boolean;
};

type NavigableItem =
  | {
      kind: "group";
      id: string;
      groupKey: string;
      parentKey: string | null;
      depth: number;
      hasChildren: boolean;
    }
  | {
      kind: "option";
      id: string;
      option: SelectOption;
      parentKey: string | null;
      depth: number;
    };

function stripAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function splitGroupPath(group?: string): string[] {
  if (!group) return [];
  return group
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildOptionTree(
  opts: readonly SelectOption[],
  selectedValue: string,
): {
  rootBranches: TreeBranchNode[];
  rootOptions: SelectOption[];
  allBranchKeys: string[];
  selectedBranchTrail: string[];
} {
  const rootBranches: TreeBranchNode[] = [];
  const rootOptions: SelectOption[] = [];
  const branchMap = new Map<string, TreeBranchNode>();
  const allBranchKeys: string[] = [];
  let selectedBranchTrail: string[] = [];

  for (const opt of opts) {
    const segments = splitGroupPath(opt.group);
    if (segments.length === 0) {
      rootOptions.push(opt);
      continue;
    }

    let parentKey: string | null = null;
    let currentList = rootBranches;
    const trail: string[] = [];

    segments.forEach((seg, idx) => {
      const key = parentKey ? `${parentKey}::${seg}` : seg;
      trail.push(key);
      let node = branchMap.get(key);
      if (!node) {
        node = {
          key,
          name: seg,
          depth: idx,
          parentKey,
          children: [],
          options: [],
          totalLeafCount: 0,
          containsSelected: false,
        };
        branchMap.set(key, node);
        allBranchKeys.push(key);
        currentList.push(node);
      }
      node.totalLeafCount += 1;
      if (opt.value === selectedValue) {
        node.containsSelected = true;
      }
      parentKey = key;
      currentList = node.children;
    });

    if (opt.value === selectedValue) {
      selectedBranchTrail = trail;
    }

    if (parentKey) {
      const leafParent = branchMap.get(parentKey);
      leafParent?.options.push(opt);
    }
  }

  return { rootBranches, rootOptions, allBranchKeys, selectedBranchTrail };
}

export default function SelectField({
  label,
  labelInline,
  orientation,
  labelWidth,
  labelAction,
  required,
  tooltip,
  error,
  helpText,
  hint,
  width,
  className,
  id: idProp,
  name,
  options,
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "Selecionar...",
  disabled,
  variant = "default",
  size = "md",
  clearable = false,
  tree = false,
  displayMode,
  defaultExpandAll = false,
  showSelectedGroup,
  groupMeta,
  searchable,
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhuma opção encontrada",
  componentId,
  icon,
  hideIfDenied = false,
}: SelectFieldProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const effectiveDisabled = Boolean(disabled || !hasPermission);
  const autoId = useId();
  const id = idProp ?? autoId;
  const listboxId = `${id}-popup`;
  const s = SIZE[size];

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
    zIndex: 9200,
  });

  const value = controlledValue ?? internalValue;
  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const hasGroups = useMemo(() => options.some((opt) => Boolean(opt.group?.trim())), [options]);
  const effectiveMode: SelectDisplayMode = useMemo(() => {
    if (tree || displayMode === "tree") return "tree";
    if (displayMode === "grouped") return "grouped";
    if (displayMode === "flat") return "flat";
    return hasGroups ? "grouped" : "flat";
  }, [tree, displayMode, hasGroups]);

  const isTreeMode = effectiveMode === "tree" && hasGroups;
  const isSearchable = searchable ?? (isTreeMode && options.length >= 6);
  const shouldShowSelectedGroup = showSelectedGroup ?? isTreeMode;

  const setValue = useCallback(
    (next: string) => {
      if (controlledValue === undefined) setInternalValue(next);
      onChange?.(next);
    },
    [controlledValue, onChange],
  );

  const closeDropdown = useCallback((restoreFocus = false) => {
    setOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
    setDropdownStyle({
      position: "fixed",
      visibility: "hidden",
      zIndex: 9200,
    });
    if (restoreFocus) {
      buttonRef.current?.focus();
    }
  }, []);

  useEscKey(() => closeDropdown(true), open);

  const normalizedQuery = useMemo(() => stripAccents(search.trim()), [search]);
  const isSearching = isSearchable && normalizedQuery.length > 0;

  const filteredOptions = useMemo(() => {
    if (!isSearching) return options;
    return options.filter((opt) => {
      const haystack = `${opt.label} ${opt.group ?? ""} ${opt.description ?? ""} ${opt.badge ?? ""}`;
      return stripAccents(haystack).includes(normalizedQuery);
    });
  }, [options, isSearching, normalizedQuery]);

  const treeData = useMemo(
    () => buildOptionTree(filteredOptions, value),
    [filteredOptions, value],
  );

  const initializeExpandedOnOpen = useCallback(() => {
    if (!isTreeMode) return;
    const fullTree = buildOptionTree(options, value);
    if (defaultExpandAll) {
      setExpandedKeys(new Set(fullTree.allBranchKeys));
      return;
    }
    if (fullTree.selectedBranchTrail.length > 0) {
      setExpandedKeys(new Set(fullTree.selectedBranchTrail));
      return;
    }
    if (fullTree.rootBranches.length > 0) {
      setExpandedKeys(new Set([fullTree.rootBranches[0].key]));
      return;
    }
    setExpandedKeys(new Set());
  }, [isTreeMode, options, value, defaultExpandAll]);

  const isBranchExpanded = useCallback(
    (key: string) => {
      if (isSearching) return true;
      return expandedKeys.has(key);
    },
    [isSearching, expandedKeys],
  );

  const toggleBranch = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const allBranchesExpanded =
    treeData.allBranchKeys.length > 0 &&
    treeData.allBranchKeys.every((k) => isBranchExpanded(k));

  const toggleAllBranches = useCallback(() => {
    if (allBranchesExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(treeData.allBranchKeys));
    }
  }, [allBranchesExpanded, treeData.allBranchKeys]);

  const navigableItems: NavigableItem[] = useMemo(() => {
    if (!isTreeMode) {
      return filteredOptions.map((opt, idx) => ({
        kind: "option",
        id: `${id}-opt-${idx}`,
        option: opt,
        parentKey: null,
        depth: 0,
      }));
    }

    const items: NavigableItem[] = [];
    let counter = 0;

    const visitBranches = (branches: TreeBranchNode[]) => {
      for (const branch of branches) {
        const expanded = isBranchExpanded(branch.key);
        items.push({
          kind: "group",
          id: `${id}-grp-${counter++}`,
          groupKey: branch.key,
          parentKey: branch.parentKey,
          depth: branch.depth,
          hasChildren: branch.children.length > 0 || branch.options.length > 0,
        });

        if (expanded) {
          if (branch.children.length > 0) {
            visitBranches(branch.children);
          }
          for (const opt of branch.options) {
            items.push({
              kind: "option",
              id: `${id}-opt-${counter++}`,
              option: opt,
              parentKey: branch.key,
              depth: branch.depth + 1,
            });
          }
        }
      }
    };

    visitBranches(treeData.rootBranches);

    for (const opt of treeData.rootOptions) {
      items.push({
        kind: "option",
        id: `${id}-opt-${counter++}`,
        option: opt,
        parentKey: null,
        depth: 0,
      });
    }

    return items;
  }, [isTreeMode, filteredOptions, treeData, isBranchExpanded, id]);

  const navIndexByOptionValue = useMemo(() => {
    const map = new Map<string, number>();
    navigableItems.forEach((item, idx) => {
      if (item.kind === "option") {
        map.set(item.option.value, idx);
      }
    });
    return map;
  }, [navigableItems]);

  const navIndexByGroupKey = useMemo(() => {
    const map = new Map<string, number>();
    navigableItems.forEach((item, idx) => {
      if (item.kind === "group") {
        map.set(item.groupKey, idx);
      }
    });
    return map;
  }, [navigableItems]);

  const effectiveHighlightedIndex = useMemo(() => {
    if (!open || navigableItems.length === 0) return -1;
    if (highlightedIndex >= 0 && highlightedIndex < navigableItems.length) {
      return highlightedIndex;
    }
    const selectedIdx = navIndexByOptionValue.get(value);
    return selectedIdx !== undefined ? selectedIdx : 0;
  }, [open, navigableItems.length, highlightedIndex, navIndexByOptionValue, value]);

  const updateDropdownPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const minDesiredHeight = isTreeMode ? 260 : 220;
    const maxCapHeight = isTreeMode ? 400 : 300;
    const availableBelow = window.innerHeight - rect.bottom - margin;
    const availableAbove = rect.top - margin;
    const openAbove = availableBelow < minDesiredHeight && availableAbove > availableBelow;
    const maxHeight = Math.min(
      maxCapHeight,
      Math.max(150, (openAbove ? availableAbove : availableBelow) - gap),
    );
    const desiredWidth = Math.max(rect.width, isTreeMode ? 320 : 220);
    const clampedWidth = Math.min(desiredWidth, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(margin, rect.left),
      window.innerWidth - margin - clampedWidth,
    );

    setDropdownStyle({
      position: "fixed",
      left,
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width: clampedWidth,
      minWidth: Math.min(rect.width, clampedWidth),
      maxHeight,
      visibility: "visible",
      zIndex: 9200,
    });
  }, [isTreeMode]);

  useEffect(() => {
    if (!open) return;

    const rafId = window.requestAnimationFrame(updateDropdownPosition);

    const handleWindowScroll = (e: Event) => {
      if (
        dropdownRef.current &&
        (e.target === dropdownRef.current || dropdownRef.current.contains(e.target as Node))
      ) {
        return;
      }
      updateDropdownPosition();
    };

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", handleWindowScroll, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", handleWindowScroll, true);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (open && isSearchable) {
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 25);
      return () => window.clearTimeout(timer);
    }
  }, [open, isSearchable]);

  useEffect(() => {
    if (!open) return;
    const el = scrollAreaRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        closeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeDropdown]);

  useEffect(() => {
    if (!open || effectiveHighlightedIndex < 0 || !scrollAreaRef.current) return;
    const activeEl = scrollAreaRef.current.querySelector<HTMLElement>(
      `[data-nav-idx="${effectiveHighlightedIndex}"]`,
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [open, effectiveHighlightedIndex]);

  const openDropdown = useCallback(() => {
    if (effectiveDisabled) return;
    initializeExpandedOnOpen();
    updateDropdownPosition();
    setHighlightedIndex(-1);
    setOpen(true);
    setSearch("");
  }, [effectiveDisabled, initializeExpandedOnOpen, updateDropdownPosition]);

  const selectOption = useCallback(
    (opt: SelectOption) => {
      if (opt.disabled) return;
      setValue(opt.value);
      closeDropdown(true);
    },
    [closeDropdown, setValue],
  );

  const findNextNavigable = (start: number, step: 1 | -1): number => {
    const len = navigableItems.length;
    if (len === 0) return -1;
    let idx = start;
    for (let i = 0; i < len; i++) {
      idx = (idx + step + len) % len;
      const item = navigableItems[idx];
      if (item?.kind === "group" || (item?.kind === "option" && !item.option.disabled)) {
        return idx;
      }
    }
    return start;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!open) {
      if (event.key === "Enter" || event.key === "ArrowDown" || event.key === " ") {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (navigableItems.length === 0) return;
        setHighlightedIndex(findNextNavigable(effectiveHighlightedIndex, 1));
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (navigableItems.length === 0) return;
        setHighlightedIndex(
          findNextNavigable(effectiveHighlightedIndex < 0 ? 0 : effectiveHighlightedIndex, -1),
        );
        break;
      }
      case "Home": {
        if (event.target === searchInputRef.current && search.length > 0) return;
        event.preventDefault();
        if (navigableItems.length > 0) setHighlightedIndex(findNextNavigable(-1, 1));
        break;
      }
      case "End": {
        if (event.target === searchInputRef.current && search.length > 0) return;
        event.preventDefault();
        if (navigableItems.length > 0) setHighlightedIndex(findNextNavigable(0, -1));
        break;
      }
      case "ArrowRight": {
        if (!isTreeMode) return;
        if (event.target === searchInputRef.current && search.length > 0) return;
        const currentItem = navigableItems[effectiveHighlightedIndex];
        if (!currentItem || currentItem.kind !== "group") return;
        event.preventDefault();
        if (!isBranchExpanded(currentItem.groupKey)) {
          toggleBranch(currentItem.groupKey);
        } else if (effectiveHighlightedIndex + 1 < navigableItems.length) {
          setHighlightedIndex(effectiveHighlightedIndex + 1);
        }
        break;
      }
      case "ArrowLeft": {
        if (!isTreeMode) return;
        if (event.target === searchInputRef.current && search.length > 0) return;
        const currentItem = navigableItems[effectiveHighlightedIndex];
        if (!currentItem) return;
        if (currentItem.kind === "group" && isBranchExpanded(currentItem.groupKey)) {
          event.preventDefault();
          toggleBranch(currentItem.groupKey);
        } else if (currentItem.parentKey) {
          event.preventDefault();
          const parentIdx = navIndexByGroupKey.get(currentItem.parentKey);
          if (parentIdx !== undefined) setHighlightedIndex(parentIdx);
        }
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
        const currentItem = navigableItems[effectiveHighlightedIndex];
        if (!currentItem) return;
        if (currentItem.kind === "group") {
          toggleBranch(currentItem.groupKey);
        } else {
          selectOption(currentItem.option);
        }
        break;
      }
      case " ": {
        if (event.target === searchInputRef.current) return;
        event.preventDefault();
        const currentItem = navigableItems[effectiveHighlightedIndex];
        if (!currentItem) return;
        if (currentItem.kind === "group") {
          toggleBranch(currentItem.groupKey);
        } else {
          selectOption(currentItem.option);
        }
        break;
      }
      case "Escape": {
        event.preventDefault();
        event.stopPropagation();
        closeDropdown(true);
        break;
      }
      case "Tab": {
        closeDropdown(false);
        break;
      }
    }
  };

  const hasValue = Boolean(selected);
  const selectedLeafGroup = useMemo(() => {
    if (!selected?.group) return null;
    const parts = splitGroupPath(selected.group);
    return parts.length > 0 ? parts[parts.length - 1] : null;
  }, [selected]);

  if (!hasPermission && hideIfDenied) {
    return null;
  }

  const canClear = clearable && hasValue && !effectiveDisabled;
  const describedBy = error ? `${id}-error` : (helpText || hint) ? `${id}-help` : undefined;
  const activeDescendantId =
    open && effectiveHighlightedIndex >= 0
      ? navigableItems[effectiveHighlightedIndex]?.id
      : undefined;

  const renderLeafOption = (
    option: SelectOption,
    navIdx: number,
    inTreeBranch: boolean,
  ) => {
    const isSelected = option.value === value;
    const isHighlighted = navIdx === effectiveHighlightedIndex;
    const navItem = navigableItems[navIdx];

    return (
      <div
        key={option.value}
        id={navItem?.id}
        data-nav-idx={navIdx}
        role={isTreeMode ? "treeitem" : "option"}
        aria-selected={isSelected}
        aria-disabled={option.disabled || undefined}
        onMouseDown={(event) => {
          event.preventDefault();
          selectOption(option);
        }}
        onMouseEnter={() => {
          if (!option.disabled) setHighlightedIndex(navIdx);
        }}
        className={twMerge(
          "group/opt relative flex items-center justify-between gap-2.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-xs sm:text-sm transition-colors select-none",
          inTreeBranch &&
            "before:pointer-events-none before:absolute before:-left-2.5 before:top-1/2 before:h-px before:w-2 before:bg-border",
          option.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
          isSelected
            ? "bg-primary-soft text-primary-soft-foreground font-semibold"
            : isHighlighted && !option.disabled
              ? "bg-surface-hover text-foreground"
              : "text-surface-foreground hover:bg-surface-hover",
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {option.icon && (
            <span
              aria-hidden="true"
              className={twMerge(
                "mt-0.5 shrink-0",
                isSelected ? "text-primary" : "text-muted-foreground",
              )}
            >
              {option.icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate leading-snug">{option.label}</div>
            {option.description && (
              <div
                className={twMerge(
                  "mt-0.5 line-clamp-1 text-[11px] font-normal leading-relaxed",
                  isSelected ? "text-primary-soft-foreground/80" : "text-muted-foreground",
                )}
              >
                {option.description}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {option.badge && (
            <span
              className={twMerge(
                "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none",
                isSelected
                  ? "border-primary/30 bg-primary/15 text-primary"
                  : "border-border bg-surface-muted text-muted-foreground",
              )}
            >
              {option.badge}
            </span>
          )}
          {isSelected && <Check size={14} aria-hidden="true" className="shrink-0 text-primary" />}
        </div>
      </div>
    );
  };

  const renderTreeBranch = (branch: TreeBranchNode): React.ReactNode => {
    const expanded = isBranchExpanded(branch.key);
    const navIdx = navIndexByGroupKey.get(branch.key) ?? -1;
    const isHighlighted = navIdx === effectiveHighlightedIndex;
    const navItem = navIdx >= 0 ? navigableItems[navIdx] : undefined;
    const meta = groupMeta?.[branch.name] ?? groupMeta?.[branch.key];

    return (
      <div key={branch.key} className="select-none">
        <div
          id={navItem?.id}
          data-nav-idx={navIdx}
          role="treeitem"
          aria-expanded={expanded}
          aria-selected={false}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!isSearching) {
              toggleBranch(branch.key);
            }
          }}
          onMouseEnter={() => {
            if (navIdx >= 0) setHighlightedIndex(navIdx);
          }}
          className={twMerge(
            "flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-control)] px-2 py-1.5 text-xs font-semibold transition-colors",
            branch.containsSelected && !expanded
              ? "bg-primary-soft/60 text-primary"
              : isHighlighted
                ? "bg-surface-hover text-foreground"
                : "text-surface-foreground hover:bg-surface-hover",
          )}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <ChevronRight
              size={14}
              aria-hidden="true"
              className={twMerge(
                "shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
                expanded && "rotate-90 text-primary",
              )}
            />
            <span
              aria-hidden="true"
              className={twMerge(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                expanded || branch.containsSelected
                  ? "bg-primary-soft text-primary"
                  : "bg-surface-muted text-muted-foreground",
              )}
            >
              {meta?.icon ? (
                meta.icon
              ) : expanded ? (
                <FolderOpen size={12} />
              ) : (
                <Folder size={12} />
              )}
            </span>
            <span className="truncate">{branch.name}</span>
            {branch.containsSelected && !expanded && (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
            )}
          </div>

          <span className="inline-flex shrink-0 items-center rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            {meta?.badge ?? branch.totalLeafCount}
          </span>
        </div>

        {expanded && (
          <div
            role="group"
            aria-label={branch.name}
            className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2.5"
          >
            {branch.children.map((child) => renderTreeBranch(child))}
            {branch.options.map((opt) => {
              const optNavIdx = navIndexByOptionValue.get(opt.value) ?? -1;
              return renderLeafOption(opt, optNavIdx, true);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <FieldWrapper
      id={id}
      label={label}
      labelInline={labelInline}
      orientation={orientation}
      labelWidth={labelWidth}
      labelAction={labelAction}
      required={required}
      tooltip={tooltip}
      error={error}
      helpText={helpText}
      hint={hint}
      width={width}
      className={className}
    >
      <div ref={containerRef} className="relative">
        {name && <input type="hidden" name={name} value={value} />}
        <button
          ref={buttonRef}
          id={id}
          data-component-id={componentId ?? (idProp ? `erp.select.${idProp}` : "erp.select.field")}
          type="button"
          disabled={effectiveDisabled}
          aria-haspopup={isTreeMode ? "tree" : "listbox"}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={!isSearchable ? activeDescendantId : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onClick={() => {
            if (effectiveDisabled) return;
            if (open) {
              closeDropdown(false);
            } else {
              openDropdown();
            }
          }}
          onKeyDown={handleKeyDown}
          className={twMerge(
            "flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border text-left outline-none transition-[background-color,border-color,box-shadow] duration-150 cursor-pointer",
            s.h,
            s.text,
            s.px,
            canClear && "pr-14",
            variant === "filled"
              ? open
                ? "border-ring ring-3 ring-ring/12 bg-input"
                : "border-transparent bg-surface-muted hover:bg-surface-hover focus-visible:border-ring focus-visible:bg-input focus-visible:ring-3 focus-visible:ring-ring/12"
              : open
                ? "border-ring ring-3 ring-ring/12 bg-input"
                : "border-input-border bg-input hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/12",
            effectiveDisabled && "cursor-not-allowed opacity-60 bg-surface-muted",
            error &&
              "border-danger hover:border-danger ring-0 focus-visible:border-danger focus-visible:ring-3 focus-visible:ring-danger/15",
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {(selected?.icon || icon) && (
              <span aria-hidden="true" className="flex shrink-0 items-center text-muted-foreground">
                {selected?.icon ?? icon}
              </span>
            )}
            {hasValue && shouldShowSelectedGroup && selectedLeafGroup && (
              <span className="hidden sm:inline-flex shrink-0 items-center rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {selectedLeafGroup}
              </span>
            )}
            <span
              className={twMerge(
                "truncate",
                hasValue ? "font-medium text-input-foreground" : "text-input-placeholder",
              )}
            >
              {selected?.label ?? placeholder}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1.5">
            {hasValue && selected?.badge && isTreeMode && (
              <span className="hidden md:inline-flex items-center rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                {selected.badge}
              </span>
            )}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={twMerge(
                "shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
                open && "rotate-180 text-foreground",
              )}
            />
          </span>
        </button>

        {canClear && (
          <button
            type="button"
            aria-label="Limpar seleção"
            onClick={(event) => {
              event.stopPropagation();
              setValue("");
              closeDropdown(true);
            }}
            className="absolute right-7 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-pointer"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}

        {open &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              data-floating-open="true"
              style={dropdownStyle}
              className="pointer-events-auto z-[9200] flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground shadow-[var(--shadow-floating)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
            >
              {(isSearchable || (isTreeMode && treeData.allBranchKeys.length > 1)) && (
                <div className="flex shrink-0 items-center gap-1.5 border-b border-border bg-surface-muted/40 p-1.5">
                  {isSearchable && (
                    <div className="relative flex flex-1 items-center">
                      <Search
                        size={13}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-2.5 text-muted-foreground"
                      />
                      <input
                        ref={searchInputRef}
                        type="text"
                        aria-label={searchPlaceholder}
                        aria-controls={listboxId}
                        aria-activedescendant={activeDescendantId}
                        value={search}
                        placeholder={searchPlaceholder}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setHighlightedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        className="h-8 w-full rounded-[var(--radius-control)] border border-input-border bg-input pl-8 pr-7 text-xs text-foreground placeholder:text-input-placeholder outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                      />
                      {search && (
                        <button
                          type="button"
                          aria-label="Limpar pesquisa"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearch("");
                            searchInputRef.current?.focus();
                          }}
                          className="absolute right-1.5 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          <X size={12} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}

                  {isTreeMode && treeData.allBranchKeys.length > 1 && !isSearching && (
                    <button
                      type="button"
                      aria-label={
                        allBranchesExpanded
                          ? "Recolher todas as categorias"
                          : "Expandir todas as categorias"
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleAllBranches();
                      }}
                      className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-[var(--radius-control)] border border-border bg-surface px-2.5 text-[11px] font-semibold text-surface-foreground transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      {allBranchesExpanded ? (
                        <>
                          <ChevronsDownUp size={13} aria-hidden="true" />
                          <span className="hidden sm:inline">Recolher</span>
                        </>
                      ) : (
                        <>
                          <ChevronsUpDown size={13} aria-hidden="true" />
                          <span className="hidden sm:inline">Expandir</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              <div
                ref={scrollAreaRef}
                id={listboxId}
                role={isTreeMode ? "tree" : "listbox"}
                aria-label={typeof label === "string" ? label : placeholder}
                style={{ touchAction: "pan-y" }}
                className="flex-1 overflow-y-auto overscroll-contain p-1.5 space-y-0.5"
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                    {emptyMessage}
                  </div>
                ) : isTreeMode ? (
                  <div className="space-y-1">
                    {treeData.rootBranches.map((branch) => renderTreeBranch(branch))}
                    {treeData.rootOptions.map((opt) => {
                      const optNavIdx = navIndexByOptionValue.get(opt.value) ?? -1;
                      return renderLeafOption(opt, optNavIdx, false);
                    })}
                  </div>
                ) : effectiveMode === "grouped" ? (
                  filteredOptions.map((option, index) => {
                    const prevGroup = index > 0 ? filteredOptions[index - 1]?.group : undefined;
                    const showHeader = Boolean(option.group && option.group !== prevGroup);
                    return (
                      <React.Fragment key={option.value}>
                        {showHeader && (
                          <div
                            role="presentation"
                            className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none"
                          >
                            {option.group}
                          </div>
                        )}
                        {renderLeafOption(option, index, false)}
                      </React.Fragment>
                    );
                  })
                ) : (
                  filteredOptions.map((option, index) => renderLeafOption(option, index, false))
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </FieldWrapper>
  );
}
