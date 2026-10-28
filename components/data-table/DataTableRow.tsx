'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, EllipsisVertical, Eye, Minus, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type {
  ActionsDisplay,
  DataTableAction,
  DataTableColumn,
  DataTableSize,
} from './DataTable.types';
import { getRawColumnValue } from './utils/sorting';
import ConfirmDialog from '../ConfirmDialog';

function resolveActionIcon<T>(action: DataTableAction<T>, row: T) {
  if (action.getIcon) return action.getIcon(row);
  if (action.icon) return action.icon;
  if (action.variant === 'detail') return Eye;
  if (action.variant === 'edit') return Edit3;
  if (action.variant === 'delete' || action.danger) return Trash2;
  return undefined;
}

function resolveActionToneClass<T>(action: DataTableAction<T>, row: T): string {
  if (action.buttonClassName) {
    return typeof action.buttonClassName === 'function'
      ? action.buttonClassName(row)
      : action.buttonClassName;
  }
  if (action.danger || action.tone === 'danger' || action.variant === 'delete') {
    return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40';
  }
  if (action.tone === 'warning') {
    return 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40';
  }
  if (action.tone === 'success') {
    return 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40';
  }
  if (action.tone === 'primary' || action.variant === 'edit') {
    return 'text-primary hover:bg-primary/10';
  }
  if (action.tone === 'info' || action.variant === 'detail') {
    return 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40';
  }
  return 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800';
}

function resolveActionIconClass<T>(action: DataTableAction<T>, row: T): string {
  if (action.iconClassName) {
    return typeof action.iconClassName === 'function'
      ? action.iconClassName(row)
      : action.iconClassName;
  }
  if (action.danger || action.tone === 'danger' || action.variant === 'delete') {
    return 'text-red-500 dark:text-red-400';
  }
  if (action.tone === 'warning') {
    return 'text-amber-500 dark:text-amber-400';
  }
  if (action.tone === 'success') {
    return 'text-emerald-500 dark:text-emerald-400';
  }
  if (action.tone === 'primary' || action.variant === 'edit') {
    return 'text-primary';
  }
  if (action.tone === 'info' || action.variant === 'detail') {
    return 'text-blue-500 dark:text-blue-400';
  }
  return '';
}

export function DataTableRow<T = Record<string, unknown>>({
  row,
  rowIndex,
  columns,
  rowSelectionKey,
  isSelected,
  selectionEnabled,
  isSelectable,
  onToggleSelect,
  onRowClick,
  actions,
  actionsDisplay = 'menu',
  maxInlineActions,
  size = 'md',
  dividers = true,
  hoverable = true,
  striped = true,
  rowClassName,
  checkboxClassName,
  onActionError,
  hasExpandable = false,
  expandColumnWidth,
  isExpanded = false,
  onToggleExpand,
  expandedContent,
}: {
  row: T;
  rowIndex: number;
  totalRowsOnPage?: number;
  columns: DataTableColumn<T>[];
  rowSelectionKey: string | number;
  isSelected: boolean;
  selectionEnabled: boolean;
  isSelectable: boolean;
  onToggleSelect: (key: string | number, row: T) => void;
  onRowClick?: (row: T, index: number) => void;
  actions?: DataTableAction<T>[];
  actionsDisplay?: ActionsDisplay;
  maxInlineActions?: number;
  size?: DataTableSize;
  dividers?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
  checkboxClassName?: string;
  onActionError?: (error: unknown, actionName?: string) => void;
  hasExpandable?: boolean;
  expandColumnWidth?: string | number;
  isExpanded?: boolean;
  onToggleExpand?: (key: string | number, row: T) => void;
  expandedContent?: React.ReactNode;
}) {
  const [runningActionIndex, setRunningActionIndex] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    action: DataTableAction<T>;
    index: number;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  } | null>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions?.filter((a) => !a.hidden?.(row)) ?? [];

  const toggleMenu = () => {
    if (!menuOpen && triggerBtnRef.current) {
      const rect = triggerBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUpward = spaceBelow < 180;
      const right = Math.max(8, window.innerWidth - rect.right);

      if (opensUpward) {
        setDropdownPos({ bottom: window.innerHeight - rect.top + 4, right });
      } else {
        setDropdownPos({ top: rect.bottom + 4, right });
      }
    }
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(target) &&
        triggerBtnRef.current &&
        !triggerBtnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (menuOpen) setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [menuOpen]);

  const executeAction = async (action: DataTableAction<T>, index: number) => {
    setRunningActionIndex(index);
    try {
      await action.onClick(row);
    } catch (err) {
      const actionLabel = typeof action.label === 'function' ? action.label(row) : action.label;
      onActionError?.(err, typeof actionLabel === 'string' ? actionLabel : undefined);
    } finally {
      setRunningActionIndex(null);
    }
  };

  const handleActionClick = (action: DataTableAction<T>, index: number) => {
    if (action.disabled?.(row)) return;
    const confirmConfig =
      typeof action.confirm === 'function' ? action.confirm(row) : action.confirm;
    if (confirmConfig) {
      setConfirmAction({ action, index });
      return;
    }
    void executeAction(action, index);
  };

  const isInteractive = Boolean(onRowClick);
  const rowPaddingCls =
    size === 'sm'
      ? 'py-2 px-3 text-xs'
      : size === 'lg'
        ? 'py-4 px-4 text-sm'
        : 'py-3 px-3 text-xs sm:text-sm';

  const inlineCount =
    actionsDisplay === 'menu' && maxInlineActions === undefined
      ? 0
      : (maxInlineActions ?? visibleActions.length);

  const inlineActions = visibleActions.slice(0, inlineCount);
  const overflowActions = visibleActions.slice(inlineCount);

  return (
    <>
      <tr
        tabIndex={isInteractive ? 0 : undefined}
        onClick={() => onRowClick?.(row, rowIndex)}
        onKeyDown={(e) => {
          if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onRowClick?.(row, rowIndex);
          }
        }}
        className={twMerge(
          'group transition-colors',
          striped && rowIndex % 2 === 1 ? 'bg-zinc-50/50 dark:bg-zinc-800/30' : 'bg-surface',
          hoverable && 'hover:bg-primary/5 dark:hover:bg-primary/10',
          isSelected && !rowClassName && 'bg-primary/10 dark:bg-primary/20',
          dividers && 'border-b border-border/60',
          isInteractive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40',
          typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName
        )}
      >
        {/* Expansão / Accordion */}
        {hasExpandable && (
          <td
            style={expandColumnWidth !== undefined ? { width: expandColumnWidth, minWidth: expandColumnWidth } : undefined}
            className={twMerge(expandColumnWidth === undefined && 'w-10', 'text-center align-middle', rowPaddingCls)}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              data-component-id={`erp.data-table.row-expand-${rowSelectionKey}`}
              type="button"
              onClick={() => onToggleExpand?.(rowSelectionKey, row)}
              className={twMerge(
                'inline-flex items-center justify-center h-6 w-6 rounded-md border transition-all duration-200 cursor-pointer',
                isExpanded
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted/30 border-border/80 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
              title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
              aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <Minus size={13} strokeWidth={2.5} className="transition-transform duration-200" />
              ) : (
                <Plus size={13} strokeWidth={2.5} className="transition-transform duration-200" />
              )}
            </button>
          </td>
        )}

        {/* Seleção */}
        {selectionEnabled && (
          <td
            className={twMerge('w-10 text-center', rowPaddingCls)}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              data-component-id={`erp.data-table.row-select-${rowSelectionKey}`}
              type="checkbox"
              checked={isSelected}
              disabled={!isSelectable && !isSelected}
              onChange={() => onToggleSelect(rowSelectionKey, row)}
              className={twMerge(
                'h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0 cursor-pointer disabled:opacity-50',
                checkboxClassName
              )}
            />
          </td>
        )}

        {/* Dados */}
        {columns.map((col) => {
          const rawVal = getRawColumnValue(row, col);
          const rendered = col.render
            ? col.render(rawVal, row, rowIndex)
            : (rawVal as React.ReactNode);
          const alignCls =
            col.align === 'center'
              ? 'text-center'
              : col.align === 'right'
                ? 'text-right'
                : 'text-left';

          return (
            <td
              key={col.key}
              style={col.width ? { width: col.width, maxWidth: col.width } : undefined}
              className={twMerge(
                'font-medium text-foreground min-w-0',
                alignCls,
                rowPaddingCls,
                col.className
              )}
            >
              <div
                className="truncate max-w-full"
                title={typeof rawVal === 'string' ? rawVal : undefined}
              >
                {rendered}
              </div>
            </td>
          );
        })}

        {/* Ações */}
        {visibleActions.length > 0 && (
          <td
            className={twMerge('text-right whitespace-nowrap', rowPaddingCls)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end gap-1">
              {/* Ações em linha */}
              {inlineActions.map((action, idx) => {
                const Icon = resolveActionIcon(action, row);
                const iconCls = resolveActionIconClass(action, row);
                const isDisabled = action.disabled?.(row);
                const isRunning = runningActionIndex === idx;
                const toneCls = resolveActionToneClass(action, row);
                const labelNode =
                  typeof action.label === 'function' ? action.label(row) : action.label;
                const compId =
                  typeof action.componentId === 'function'
                    ? action.componentId(row)
                    : action.componentId;
                const labelText = typeof labelNode === 'string' ? labelNode : undefined;
                const tooltipText =
                  typeof action.tooltip === 'function'
                    ? action.tooltip(row)
                    : action.tooltip;
                const hasIcon = Boolean(Icon);
                const showText = action.showLabel === true || !hasIcon;

                return (
                  <button
                    data-component-id={compId || `erp.data-table.row-action-${idx}`}
                    key={idx}
                    type="button"
                    disabled={isDisabled || isRunning}
                    onClick={() => handleActionClick(action, idx)}
                    className={twMerge(
                      'group/btn inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
                      hasIcon && !showText ? 'p-1.5' : 'px-2.5 py-1.5',
                      toneCls
                    )}
                    title={tooltipText ?? labelText}
                    aria-label={tooltipText ?? labelText}
                  >
                    {isRunning ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      Icon && (
                        <Icon
                          size={16}
                          className={twMerge(
                            'transition-transform duration-150 group-hover/btn:scale-110 shrink-0',
                            iconCls
                          )}
                        />
                      )
                    )}
                    {showText && <span>{labelNode}</span>}
                  </button>
                );
              })}

              {/* Menu Dropdown de Ações em Excesso */}
              {overflowActions.length > 0 && (
                <div>
                  <button
                    data-component-id="erp.data-table.row-more-actions"
                    ref={triggerBtnRef}
                    type="button"
                    onClick={toggleMenu}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    className="group/more rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
                    title="Mais ações"
                    aria-label="Mais ações"
                  >
                    <EllipsisVertical
                      size={16}
                      className="transition-transform duration-150 group-hover/more:scale-110"
                    />
                  </button>

                  {menuOpen &&
                    typeof document !== 'undefined' &&
                    dropdownPos &&
                    createPortal(
                      <div
                        ref={menuContainerRef}
                        role="menu"
                        style={{
                          position: 'fixed',
                          right: `${dropdownPos.right}px`,
                          top: dropdownPos.top !== undefined ? `${dropdownPos.top}px` : undefined,
                          bottom:
                            dropdownPos.bottom !== undefined
                              ? `${dropdownPos.bottom}px`
                              : undefined,
                          zIndex: 9999,
                        }}
                        className="min-w-44 rounded-xl border border-border bg-surface p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                      >
                        {overflowActions.map((action, overflowIdx) => {
                          const absoluteIdx = inlineCount + overflowIdx;
                          const Icon = resolveActionIcon(action, row);
                          const iconCls = resolveActionIconClass(action, row);
                          const isDisabled = action.disabled?.(row);
                          const isRunning = runningActionIndex === absoluteIdx;
                          const toneCls = resolveActionToneClass(action, row);
                          const labelNode =
                            typeof action.label === 'function' ? action.label(row) : action.label;
                          const compId =
                            typeof action.componentId === 'function'
                              ? action.componentId(row)
                              : action.componentId;
                          const tooltipText =
                            typeof action.tooltip === 'function'
                              ? action.tooltip(row)
                              : action.tooltip;

                          return (
                            <button
                              data-component-id={compId || `erp.data-table.row-action-${absoluteIdx}`}
                              key={overflowIdx}
                              type="button"
                              role="menuitem"
                              disabled={isDisabled || isRunning}
                              title={tooltipText}
                              onClick={() => {
                                setMenuOpen(false);
                                handleActionClick(action, absoluteIdx);
                              }}
                              className={twMerge(
                                'group/item flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left',
                                toneCls
                              )}
                            >
                              {isRunning ? (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
                              ) : (
                                Icon && (
                                  <Icon
                                    size={14}
                                    className={twMerge(
                                      'shrink-0 transition-transform duration-150 group-hover/item:scale-115',
                                      iconCls
                                    )}
                                  />
                                )
                              )}
                              <span>{labelNode}</span>
                            </button>
                          );
                        })}
                      </div>,
                      document.body
                    )}
                </div>
              )}
            </div>
          </td>
        )}
      </tr>

      {hasExpandable && isExpanded && expandedContent && (
        <tr
          key={`expanded-${rowSelectionKey}`}
          className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-border/60 transition-colors"
        >
          <td
            colSpan={
              columns.length +
              (hasExpandable ? 1 : 0) +
              (selectionEnabled ? 1 : 0) +
              (visibleActions.length > 0 ? 1 : 0)
            }
            className="p-0"
          >
            <div className="py-2 px-3 sm:px-6">{expandedContent}</div>
          </td>
        </tr>
      )}

      {confirmAction &&
        (() => {
          const confirmProp = confirmAction.action.confirm;
          const confirmConfig =
            typeof confirmProp === 'function' ? (confirmProp as (r: T) => any)(row) : confirmProp;
          if (!confirmConfig) return null;
          return (
            <ConfirmDialog
              open={!!confirmAction}
              title={typeof confirmConfig.title === 'string' ? confirmConfig.title : undefined}
              description={
                typeof confirmConfig.description === 'string'
                  ? confirmConfig.description
                  : typeof confirmConfig.message === 'string'
                    ? confirmConfig.message
                    : undefined
              }
              confirmLabel={confirmConfig.confirmLabel ?? confirmConfig.confirmText ?? 'Confirmar'}
              cancelLabel={confirmConfig.cancelLabel ?? confirmConfig.cancelText ?? 'Cancelar'}
              variant={confirmAction.action.danger ? 'danger' : 'warning'}
              loading={runningActionIndex === confirmAction.index}
              onCancel={() => setConfirmAction(null)}
              onConfirm={async () => {
                const idx = confirmAction.index;
                const act = confirmAction.action;
                setConfirmAction(null);
                await executeAction(act, idx);
              }}
            />
          );
        })()}
    </>
  );
}
