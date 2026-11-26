export type UIComponentCategory =
  | "Estrutura & Superfícies"
  | "Navegação"
  | "KPIs & Gráficos"
  | "Tabelas & Listas"
  | "Formulários & Inputs"
  | "Ações & Identidade"
  | "Feedback & Overlays"
  | "Comunicação"
  | "Corporativo & RBAC"
  | "Animação & Código";

export type UIInspectorFieldKind =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "icon";

export interface UIInspectorFieldDef {
  key: string;
  label: string;
  kind: UIInspectorFieldKind;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
  rows?: number;
  description?: string;
}

export type UIComponentType =
  // ── 1. Estrutura & Superfícies ──
  | "container_panel"
  | "card"
  | "typography"
  | "separator"
  | "stack"
  | "aspect_ratio"
  | "bento_grid"
  | "masonry"
  | "detail_layout"
  | "mockup"
  | "watermark"
  | "mask"
  | "carousel"
  | "hover_gallery"
  | "diff"
  | "spoiler"
  | "highlight_text"
  | "item"
  | "indicator"
  | "hover_card"
  | "action_grid_card"
  | "countdown"
  | "emoji_picker"
  | "image_lightbox"
  | "split_counter_badge"
  | "agenda"
  | "map"
  | "cookie_banner"
  | "theme_toggle"
  // ── 2. Navegação ──
  | "page_header"
  | "breadcrumb"
  | "tabs"
  | "segmented_control"
  | "stepper"
  | "header"
  | "sidebar"
  | "footer"
  | "pagination"
  | "app_launcher"
  | "command_menu"
  | "quick_actions"
  | "shortcut_hint"
  | "split_pane"
  | "dock"
  | "collapsible"
  | "scroll_area"
  | "kbd"
  | "table_of_contents"
  | "context_menu"
  // ── 3. KPIs & Gráficos ──
  | "stat_card"
  | "chart"
  | "progress"
  | "service_status_card"
  | "touch_chart_card"
  | "expandable_data_card"
  | "kpi_carousel"
  // ── 4. Tabelas & Listas ──
  | "table"
  | "data_table"
  | "spreadsheet"
  | "filter_bar"
  | "description_list"
  | "kanban_board"
  | "timeline"
  | "activity_feed"
  | "inbox_list"
  | "json_viewer"
  | "accordion"
  | "tree_view"
  | "transfer_list"
  | "calendar"
  // ── 5. Formulários & Inputs ──
  | "form"
  | "zod_form"
  | "field_wrapper"
  | "text_field"
  | "textarea_field"
  | "number_field"
  | "price_input"
  | "select_field"
  | "native_select"
  | "multi_select_field"
  | "autocomplete_field"
  | "cascader_field"
  | "tree_select_field"
  | "tags_input"
  | "tag_input_field"
  | "date_field"
  | "date_picker_field"
  | "date_range_picker_field"
  | "time_field"
  | "time_picker_field"
  | "month_picker_field"
  | "switch_field"
  | "checkbox_field"
  | "checkbox_group"
  | "radio_group_field"
  | "slider_field"
  | "rating_field"
  | "input_group"
  | "filter_chips"
  | "mentions_field"
  | "color_picker_field"
  | "file_dropzone"
  | "file_field"
  | "signature_pad"
  | "code_editor"
  | "rich_text_editor"
  | "rich_text_field"
  | "rich_text_viewer"
  | "login_form"
  | "otp_input"
  | "password_strength"
  | "inline_edit"
  // ── 6. Ações & Identidade ──
  | "button"
  | "button_group"
  | "toggle_group"
  | "speed_dial"
  | "float_button"
  | "sortable_list"
  | "pull_to_refresh"
  | "swap"
  | "badge"
  | "status_badge"
  | "avatar"
  | "barcode"
  | "qrcode"
  // ── 7. Feedback & Overlays ──
  | "alert"
  | "callout"
  | "state"
  | "empty_state"
  | "result"
  | "toast"
  | "loading"
  | "skeleton"
  | "modal_trigger"
  | "form_modal"
  | "drawer_trigger"
  | "confirm"
  | "confirm_dialog_trigger"
  | "unsaved_changes_dialog"
  // ── 8. Comunicação ──
  | "chat_window"
  | "chat_message"
  | "chat_composer"
  | "chat_conversation_item"
  | "email_composer"
  | "notification_bell"
  // ── 9. Corporativo & RBAC ──
  | "scope_selector"
  | "tenant_switcher_modal"
  | "cnpj_lookup_modal"
  | "smart_object"
  | "active_timer_widget"
  | "access_guard"
  | "can"
  | "error_boundary"
  | "camera_capture_modal"
  // ── 10. Animação & Código ──
  | "code_block"
  | "snippet"
  | "tour"
  | "text_rotate"
  | "marquee"
  | "animated_number"
  | "leaderboard_podium"
  | "motion_collapse"
  | "stagger_list"
  | "isometric_showcase"
  | "isometric_bench";

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
  /** Optional primary text prop for double-click inline editing on the 2D canvas */
  primaryTextProp?: string;
  /** Declarative Inspector field definitions for schema-driven prop editing */
  inspectorFields?: UIInspectorFieldDef[];
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
