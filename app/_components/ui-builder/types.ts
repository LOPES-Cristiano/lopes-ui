export type UIComponentCategory =
  | "Estrutura & Superfícies"
  | "Navegação"
  | "KPIs & Gráficos"
  | "Tabelas & Listas"
  | "Formulários & Inputs"
  | "Ações & Identidade"
  | "Feedback & Overlays";

export type UIComponentType =
  // Estrutura & Superfícies
  | "container_panel"
  | "card"
  | "typography"
  | "separator"
  // Navegação
  | "page_header"
  | "breadcrumb"
  | "tabs"
  | "segmented_control"
  | "stepper"
  // KPIs & Gráficos
  | "stat_card"
  | "chart"
  | "progress"
  | "service_status_card"
  // Tabelas & Listas
  | "table"
  | "filter_bar"
  | "description_list"
  | "kanban_board"
  | "timeline"
  | "activity_feed"
  | "accordion"
  | "tree_view"
  | "transfer_list"
  | "calendar"
  // Formulários & Inputs
  | "text_field"
  | "textarea_field"
  | "number_field"
  | "price_input"
  | "select_field"
  | "cascader_field"
  | "tree_select_field"
  | "tags_input"
  | "date_picker_field"
  | "switch_field"
  | "checkbox_field"
  | "slider_field"
  | "rating_field"
  | "file_dropzone"
  | "signature_pad"
  | "code_editor"
  // Ações & Identidade
  | "button"
  | "badge"
  | "status_badge"
  | "avatar"
  | "barcode"
  | "qrcode"
  // Feedback & Overlays
  | "alert"
  | "callout"
  | "empty_state"
  | "result"
  | "skeleton"
  | "modal_trigger"
  | "drawer_trigger"
  | "confirm_dialog_trigger";

export interface UIElementStyle {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderRadius?: number;
  padding?: number;
  shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  opacity?: number;
  overflow?: "visible" | "hidden" | "auto";
  customClassName?: string;
}

export interface UICanvasElement {
  id: string;
  type: UIComponentType;
  name: string;
  componentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
  hidden?: boolean;
  groupId?: string;
  props: Record<string, unknown>;
  style?: UIElementStyle;
}

export type UIArtboardPresetId =
  | "desktop_hd"
  | "desktop_erp"
  | "laptop"
  | "tablet"
  | "mobile"
  | "modal_dialog"
  | "custom";

export interface UIArtboardPresetMeta {
  id: UIArtboardPresetId;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  description: string;
}

export interface UILayoutGridConfig {
  enabled: boolean;
  columns: number;
  gutter: number;
}

export interface UICanvasGuides {
  x: number[];
  y: number[];
}

export interface UICanvasConfig {
  version: string;
  title: string;
  route: string;
  exportName: string;
  componentIdPrefix: string;
  preset: UIArtboardPresetId;
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  showMargins: boolean;
  snapGrid: number;
  layoutGrid: UILayoutGridConfig;
  guides: UICanvasGuides;
  background: "slate" | "white" | "zinc" | "transparent";
  showShellChrome: boolean;
  elements: UICanvasElement[];
}

export interface UICatalogEntry {
  type: UIComponentType;
  label: string;
  category: UIComponentCategory;
  iconName: string;
  accent: "indigo" | "emerald" | "amber" | "sky" | "violet" | "rose" | "teal";
  description: string;
  lopesComponent: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  defaultProps: Record<string, unknown>;
  defaultStyle?: UIElementStyle;
}

export interface UICompositeBlockDefinition {
  id: string;
  name: string;
  category: "Cabeçalhos" | "KPIs & Dashboards" | "Tabelas & Filtros" | "Formulários ERP" | "Fiscal & Logística";
  description: string;
  iconName: string;
  build: (startX: number, startY: number, usableWidth: number) => UICanvasElement[];
}

export interface UIStudioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  iconName: string;
  config: UICanvasConfig;
}

export type UIStudioMode = "canvas" | "preview" | "code";
export type UICodeExportMode = "responsive" | "canvas2d";
export type ResizeDirection = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";
