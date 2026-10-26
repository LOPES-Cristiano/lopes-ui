import type React from 'react';

export type SpreadsheetColumnType = 'text' | 'number' | 'currency' | 'integer' | 'date' | 'percent';
export type SpreadsheetAggregate = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'none';

export type SpreadsheetContextMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Linha divisória acima do item. */
  separator?: boolean;
};

export type SpreadsheetColumn<T = any> = {
  /** Chave única da coluna. Também é o campo lido da linha quando não há `accessor`. */
  key: string;
  header: string;
  type?: SpreadsheetColumnType;
  accessor?: (row: T) => any;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  /** Coluna fixada à esquerda ao rolar horizontalmente. */
  pinned?: boolean;
  hidden?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  /**
   * Tipo do filtro: 'text' (padrão; operadores >, <, 5..20 em colunas numéricas) ou
   * 'multiselect' (lista de valores com checkbox).
   */
  filterType?: 'text' | 'multiselect';
  /**
   * Opções do multiselect (ex.: cadastro oficial). Se omitido, usa os valores distintos da própria coluna.
   */
  filterOptions?: string[];
  /** Valor inicial do filtro da coluna (ex.: '>0'). */
  defaultFilterValue?: string | string[];
  editable?: boolean;
  /** Agregação exibida no rodapé (sobre as linhas filtradas). */
  aggregate?: SpreadsheetAggregate;
  /** Grupo de cabeçalho (ex.: "Saldo por filial"). */
  group?: string;
  /** Formatação customizada do valor exibido. */
  format?: (value: any, row: T) => React.ReactNode;
  /** Formatação condicional: retorna classes Tailwind para a célula. */
  cellClassName?: (value: any, row: T) => string | undefined;
  /** Valor usado na edição -> valor gravado. */
  parseEdit?: (input: string, row: T) => any;
  /**
   * Hover card exibido ao passar o mouse na célula (ex.: origem do dado). Retorne o conteúdo — pode ser um
   * componente que busca dados ao montar (carregamento sob demanda). Retornar null/undefined não abre nada.
   */
  hoverCard?: (row: T, value: any) => React.ReactNode;
  /** Largura do hover card em px (padrão 380). */
  hoverCardWidth?: number;
};

export type SpreadsheetProps<T = any> = {
  columns: SpreadsheetColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  loading?: boolean;
  /** Altura da área rolável. Default: 100% do container pai. */
  height?: number | string;
  rowHeight?: number;
  showFooter?: boolean;
  showRowNumbers?: boolean;
  searchPlaceholder?: string;
  exportFileName?: string;
  /** Estado de visibilidade inicial por chave. */
  onCellEdit?: (row: T, columnKey: string, value: any) => void;
  rowClassName?: (row: T) => string | undefined;
  /** Itens do menu de contexto (botão direito) da linha. Sem a prop, o menu nativo do navegador é mantido. */
  contextMenu?: (row: T) => SpreadsheetContextMenuItem[];
  /** Callback executado ao dar duplo clique em uma linha. */
  onRowDoubleClick?: (row: T) => void;
  toolbarSlot?: React.ReactNode;
  className?: string;
  componentId?: string;
};
