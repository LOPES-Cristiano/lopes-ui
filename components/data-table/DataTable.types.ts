import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export type SortDir = 'asc' | 'desc' | null;

export type DataTableVariant = 'minimal' | 'bordered' | 'striped' | 'default';
export type DataTableSize = 'sm' | 'md' | 'lg';
export type ActionsDisplay = 'menu' | 'inline' | 'auto' | 'icons';
export type DataTableMobileRole = 'code' | 'title' | 'status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<T = any> = {
  key: string;
  header?: React.ReactNode;
  label?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessor?: (row: T) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getValue?: (row: T) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortValue?: (row: T) => any;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number | Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T, index: number) => React.ReactNode;
  summary?: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((rows: T[]) => React.ReactNode);
  summaryLabel?: string;
  summaryFormat?: (value: number) => React.ReactNode;
  width?: string | number;
  className?: string;
  headerClassName?: string;
  hidden?: boolean;
  required?: boolean;
  /** Papel semântico explícito da coluna na visualização em cards mobile */
  mobileRole?: DataTableMobileRole;
};

export type ActionTone = 'default' | 'info' | 'danger' | 'warning' | 'primary' | 'success';
export type ActionVariant = 'detail' | 'edit' | 'delete' | 'custom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableAction<T = any> = {
  label: React.ReactNode | ((row: T) => React.ReactNode);
  icon?: LucideIcon;
  getIcon?: (row: T) => LucideIcon;
  variant?: ActionVariant;
  tone?: ActionTone;
  danger?: boolean;
  divider?: boolean;
  inline?: boolean;
  showLabel?: boolean;
  /** Texto do tooltip exibido ao passar o mouse na ação. Aceita string estática ou função por linha. */
  tooltip?: string | ((row: T) => string | undefined);
  buttonClassName?: string | ((row: T) => string);
  iconClassName?: string | ((row: T) => string);
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (row: T) => any;
  confirm?:
    | {
        title: React.ReactNode;
        message?: React.ReactNode;
        description?: React.ReactNode;
        confirmText?: string;
        confirmLabel?: string;
        cancelText?: string;
        cancelLabel?: string;
      }
    | ((row: T) =>
        | {
            title: React.ReactNode;
            message?: React.ReactNode;
            description?: React.ReactNode;
            confirmText?: string;
            confirmLabel?: string;
            cancelText?: string;
            cancelLabel?: string;
          }
        | undefined);
  componentId?: string | ((row: T) => string);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableBulkAction<T = any> = {
  label: React.ReactNode;
  icon?: LucideIcon;
  danger?: boolean;
  divider?: boolean;
  disabled?: (rows: T[]) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (rows: T[]) => any;
  buttonClassName?: string;
  componentId?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableTab<T = any> = {
  label: React.ReactNode;
  componentId?: string;
  filter?: (row: T) => boolean;
  field?: string;
  value?: string | number;
  queryFilter?: Record<string, string>;
  showCount?: boolean;
  count?: number;
};

export type FilterType = 'text' | 'number' | 'select' | 'segmented' | 'badge' | 'date' | 'boolean';
export type FilterOperator = 'contains' | 'equals' | 'startsWith' | 'gte' | 'lte';

export type FilterOption = {
  label: string;
  value: string;
  color?: 'default' | 'emerald' | 'rose' | 'amber' | 'sky' | 'purple' | 'primary';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterField<T = any> = {
  key: string;
  label?: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  operator?: FilterOperator;
  searchKeys?: (keyof T | string)[];
  showCount?: boolean;
  className?: string;
  predicate?: (row: T, value: string) => boolean;
};

export type DataTableQueryState = {
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, string>;
  sortKey: string | null;
  sortDir: SortDir;
  activeTab: number;
};

export type SummaryScope = 'page' | 'filtered' | 'server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableProps<T = any> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey?: (row: T, index?: number) => string | number | undefined;
  onRowClick?: (row: T, index: number) => void;
  variant?: DataTableVariant;
  size?: DataTableSize;
  stickyHeader?: boolean;
  dividers?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
  renderMobileCard?: (row: T, index: number, actions?: DataTableAction<T>[]) => React.ReactNode;
  renderExpandedRow?: (row: T, index: number) => React.ReactNode;
  expandedRowKeys?: (string | number)[] | Set<string | number>;
  defaultExpandedRowKeys?: (string | number)[];
  onExpandedRowsChange?: (keys: (string | number)[]) => void;
  expandColumnWidth?: string | number;
  actions?: DataTableAction<T>[];
  actionsDisplay?: ActionsDisplay;
  maxInlineActions?: number;
  selectable?: boolean;
  selectedKeys?: (string | number)[] | Set<string | number>;
  onRowSelect?: (row: T, selected: boolean) => void;
  checkboxClassName?: string;
  bulkActions?: DataTableBulkAction<T>[];
  selectionBannerLabel?: string | React.ReactNode | ((count: number, selectedRows: T[]) => React.ReactNode);
  selectionBannerClassName?: string;
  selectionBannerSlot?: React.ReactNode | ((context: { selectedCount: number; selectedRows: T[]; clearSelection: () => void }) => React.ReactNode);
  onClearSelection?: () => void;
  isRowSelectable?: (row: T) => boolean;
  onSelectionChange?: (rows: T[]) => void;
  columnToggle?: boolean;
  defaultHiddenColumns?: string[];
  hiddenColumns?: string[];
  onHiddenColumnsChange?: (keys: string[]) => void;
  globalSearch?: boolean;
  initialSearch?: string;
  searchDebounceMs?: number;
  onSearchChange?: (search: string) => void;
  filterFields?: FilterField<T>[];
  filterVariant?: 'modal' | 'inline';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFilters?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange?: (filters: Record<string, any>) => void;
  tabs?: DataTableTab<T>[];
  activeTab?: number;
  defaultActiveTab?: number;
  onTabChange?: (tab: DataTableTab<T>, index: number) => void;
  dataMode?: 'client' | 'server';
  pagination?: boolean;
  paginationMode?: 'client' | 'server';
  page?: number;
  pageSize?: number;
  totalRows?: number;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  defaultSortKey?: string;
  defaultSortDir?: SortDir;
  sortKey?: string | null;
  sortDir?: SortDir;
  onSortChange?: (sortKey: string | null, sortDir: SortDir) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onQueryChange?: (state: DataTableQueryState) => void;
  onActionError?: (error: unknown, actionName?: string) => void;
  showSummary?: boolean;
  summaryScope?: SummaryScope;
  summaryValues?: Record<string, React.ReactNode>;
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbarLeftSlot?: React.ReactNode;
  toolbarSlot?: React.ReactNode;
  subHeaderSlot?: React.ReactNode;
  tableActions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    componentId?: string;
    buttonClassName?: string;
    tooltip?: string;
  }>;
  /** Número máximo de botões de ação exibidos diretamente no toolbar antes de agrupar em dropdown "Mais Ações". Default: 2 */
  maxInlineTableActions?: number;
  screenDefinition?: {
    id: string;
    title?: string;
    description?: string;
    actions: Array<{
      id: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      label: string | ((row?: any) => string);
      componentId?: string;
      placement: 'toolbar' | 'row';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iconClassName?: string | ((row?: any) => string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buttonClassName?: string | ((row?: any) => string);
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      disabled?: boolean | ((row?: any) => boolean);
      tooltip?: string;
      permission?: string;
      tabs?: unknown[];
      states?: unknown;
    }>;
  };
  screenActionHandlers?: Record<string, () => void | Promise<void>>;
  loading?: boolean;
  loadingLabel?: React.ReactNode;
  showLoadingLabel?: boolean;
  emptySlot?: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
  componentId?: string;
  /** Callback para fechar / sair da tela */
  onClose?: () => void;
};
