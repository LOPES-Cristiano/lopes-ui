"use client";

import React, { useReducer, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import {
  Type, Hash, Calendar, ToggleLeft, ListChecks,
  SquareStack, Columns, LayoutGrid, FormInput,
  Tag, ShieldAlert, AlignLeft, Minus,
  MousePointer2,
  PanelTop, PanelLeft, PanelBottom, LayoutTemplate, Navigation, ChevronRight,
  GripVertical, Trash2, X, Plus, Copy, RefreshCw, ChevronDown, Sparkles, FileCode,
  // new
  ChevronUp, ChevronsUpDown, UserCircle, GalleryHorizontal, MessageCircle,
  Bell, BellRing, Inbox, Shield, Activity, Loader2, TrendingUp,
  Lock, KeyRound, Radio, Banknote, Zap, GitBranch,
  GitCommitVertical, Table2, RotateCcw, Network, Mail, PackageOpen, Database,
  Filter, Kanban, LogIn, Paintbrush, Timer, Upload,
  type LucideIcon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type NodeType =
  // Estrutura
  | "AppHeader" | "AppSidebar" | "Footer" | "PageHeader" | "Breadcrumb"
  // Layout
  | "Card" | "Row" | "Column" | "FormSection"
  // Formulário
  | "TextField" | "NumberField" | "DateField" | "TimeField" | "Switch" | "CheckboxGroup"
  | "AutocompleteField" | "MultiSelectField" | "FileField" | "PriceInput" | "OTPInput"
  | "PasswordField" | "RichTextEditor"
  // Display
  | "Badge" | "Alert" | "TextBlock" | "Divider" | "Avatar" | "PingIndicator"
  | "StatCard" | "Stepper" | "Timeline" | "Table" | "TextRotate" | "CodeBlock"
  | "ShortcutHint" | "TreeView"
  // Feedback & Overlay
  | "Toast" | "EmptyState" | "StatusPage" | "ConfirmDialog" | "Drawer"
  // Dados
  | "DataTable" | "KanbanBoard" | "InboxList" | "FilterBar"
  // Navegação
  | "Accordion" | "CommandMenu" | "ContextMenu" | "QuickActions"
  // Comunicação
  | "ChatMessage" | "ChatWindow" | "NotificationBell" | "ActivityFeed"
  | "EmailComposer" | "SmartObject"
  // Auth
  | "LoginForm" | "ServiceStatusCard" | "Carousel" | "SplitPane" | "AppLauncher"
  // Botões
  | "Button";

type BuilderNode = {
  id: string;
  type: NodeType;
  props: Record<string, string | boolean | number>;
  children: string[];
};

type CanvasSlot = {
  nodeId: string;
  span: 3 | 4 | 6 | 12; // out of 12 cols
};

type CanvasRow = {
  id: string;
  slots: CanvasSlot[];
};

type BuilderState = {
  nodes: Record<string, BuilderNode>;
  rows: CanvasRow[];
  /** kept for backwards-compat with container children (containers still use children[]) */
  rootIds: string[];
  selectedId: string | null;
};

type BuilderAction =
  | { type: "ADD_TO_ROOT"; nodeType: NodeType }
  | { type: "ADD_TO_CONTAINER"; parentId: string; nodeType: NodeType }
  | { type: "SELECT"; id: string | null }
  | { type: "UPDATE_PROPS"; id: string; props: BuilderNode["props"] }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR" }
  // row-based
  | { type: "ADD_TO_NEW_ROW"; nodeType: NodeType }
  | { type: "ADD_TO_ROW"; rowId: string; nodeType: NodeType }
  | { type: "INSERT_ROW_AT"; beforeRowId: string | null; nodeType: NodeType }
  | { type: "SET_SLOT_SPAN"; nodeId: string; span: 3 | 4 | 6 | 12 }
  | { type: "MOVE_SLOT"; fromRowId: string; nodeId: string; toRowId: string | null; beforeRowId?: string | null }
  | { type: "MOVE_ROW"; fromIdx: number; toIdx: number }
  | { type: "MOVE_ROOT"; fromIdx: number; toIdx: number }
  | { type: "INSERT_AT"; pos: number; nodeType: NodeType }
  | { type: "MOVE_TO_CONTAINER"; nodeId: string; parentId: string };

// ── Registry ───────────────────────────────────────────────────────────────────
type EditableProp = {
  key: string;
  label: string;
  type: "text" | "select" | "boolean" | "number" | "textarea";
  options?: string[];
};

type ComponentDef = {
  label: string;
  icon: LucideIcon;
  category: "Estrutura" | "Layout" | "Formulário" | "Display" | "Dados" | "Comunicação" | "Navegação" | "Feedback" | "Botões";
  isContainer: boolean;
  defaultProps: BuilderNode["props"];
  editableProps: EditableProp[];
};

const REGISTRY: Record<NodeType, ComponentDef> = {
  // ── Estrutura ────────────────────────────────────────────────────────────────
  AppHeader: {
    label: "App Header",
    icon: PanelTop,
    category: "Estrutura",
    isContainer: false,
    defaultProps: { title: "Lopes UI", showSearch: true, showAvatar: true },
    editableProps: [
      { key: "title", label: "Brand / Título", type: "text" },
      { key: "showSearch", label: "Barra de busca", type: "boolean" },
      { key: "showAvatar", label: "Avatar do usuário", type: "boolean" },
    ],
  },
  AppSidebar: {
    label: "Sidebar",
    icon: PanelLeft,
    category: "Estrutura",
    isContainer: false,
    defaultProps: { title: "App", activeItem: "Dashboard" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "activeItem", label: "Item ativo", type: "text" },
    ],
  },
  Footer: {
    label: "Footer",
    icon: PanelBottom,
    category: "Estrutura",
    isContainer: false,
    defaultProps: { brand: "Lopes UI", tagline: "Componentes prontos para produção.", copyright: "", variant: "default" },
    editableProps: [
      { key: "brand", label: "Brand", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "copyright", label: "Copyright (deixe vazio p/ gerar)", type: "text" },
      { key: "variant", label: "Variante", type: "select", options: ["default", "minimal", "bordered"] },
    ],
  },
  PageHeader: {
    label: "Page Header",
    icon: LayoutTemplate,
    category: "Estrutura",
    isContainer: false,
    defaultProps: { title: "Título da Página", description: "Descrição da página", showAction: false, actionLabel: "Nova ação" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
      { key: "showAction", label: "Mostrar botão de ação", type: "boolean" },
      { key: "actionLabel", label: "Label do botão", type: "text" },
    ],
  },
  Breadcrumb: {
    label: "Breadcrumb",
    icon: Navigation,
    category: "Estrutura",
    isContainer: false,
    defaultProps: { items: "Dashboard / Usuários / Editar" },
    editableProps: [
      { key: "items", label: "Itens (separar por /)", type: "text" },
    ],
  },
  // ── Layout (containers) ─────────────────────────────────────────────────────
  Card: {
    label: "Card",
    icon: SquareStack,
    category: "Layout",
    isContainer: true,
    defaultProps: { title: "Card", subtitle: "" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "text" },
    ],
  },
  Row: {
    label: "Row",
    icon: Columns,
    category: "Layout",
    isContainer: true,
    defaultProps: { gap: "4" },
    editableProps: [
      { key: "gap", label: "Gap", type: "select", options: ["1", "2", "3", "4", "6", "8"] },
    ],
  },
  Column: {
    label: "Column",
    icon: LayoutGrid,
    category: "Layout",
    isContainer: true,
    defaultProps: { gap: "3" },
    editableProps: [
      { key: "gap", label: "Gap", type: "select", options: ["1", "2", "3", "4", "6", "8"] },
    ],
  },
  FormSection: {
    label: "FormSection",
    icon: FormInput,
    category: "Layout",
    isContainer: true,
    defaultProps: { title: "Seção", description: "" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
    ],
  },
  // ── Formulário (leafs) ──────────────────────────────────────────────────────
  TextField: {
    label: "TextField",
    icon: Type,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Campo de texto", placeholder: "Digite aqui...", type: "text", size: "md", variant: "default", required: false, disabled: false, prefix: "", suffix: "", helpText: "", tooltip: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "type", label: "Tipo", type: "select", options: ["text", "email", "url", "password", "search", "tel"] },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "variant", label: "Variante", type: "select", options: ["default", "filled"] },
      { key: "required", label: "Obrigatório", type: "boolean" },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "prefix", label: "Prefixo (addon)", type: "text" },
      { key: "suffix", label: "Sufixo (addon)", type: "text" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
      { key: "tooltip", label: "Tooltip", type: "text" },
    ],
  },
  NumberField: {
    label: "NumberField",
    icon: Hash,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Número", placeholder: "0", size: "md", variant: "default", disabled: false, min: "", max: "", step: "", prefix: "", suffix: "", helpText: "", tooltip: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "variant", label: "Variante", type: "select", options: ["default", "filled"] },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "min", label: "Mínimo", type: "text" },
      { key: "max", label: "Máximo", type: "text" },
      { key: "step", label: "Passo", type: "text" },
      { key: "prefix", label: "Prefixo (ex: R$)", type: "text" },
      { key: "suffix", label: "Sufixo (ex: kg)", type: "text" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
      { key: "tooltip", label: "Tooltip", type: "text" },
    ],
  },
  DateField: {
    label: "DateField",
    icon: Calendar,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Data", mode: "date", size: "md", variant: "default", disabled: false, helpText: "", tooltip: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "mode", label: "Modo", type: "select", options: ["date", "datetime"] },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "variant", label: "Variante", type: "select", options: ["default", "filled"] },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
      { key: "tooltip", label: "Tooltip", type: "text" },
    ],
  },
  Switch: {
    label: "Switch",
    icon: ToggleLeft,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Ativar opção", description: "", size: "md", color: "indigo", disabled: false, helpText: "", tooltip: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "color", label: "Cor", type: "select", options: ["indigo", "emerald", "sky", "rose", "amber", "zinc"] },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
      { key: "tooltip", label: "Tooltip", type: "text" },
    ],
  },
  CheckboxGroup: {
    label: "CheckboxGroup",
    icon: ListChecks,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Opções", multiple: true, direction: "vertical", shape: "square", size: "md" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "multiple", label: "Múltipla escolha", type: "boolean" },
      { key: "direction", label: "Direção", type: "select", options: ["vertical", "horizontal"] },
      { key: "shape", label: "Formato do checkbox", type: "select", options: ["square", "circle"] },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
    ],
  },
  // ── Display (leafs) ─────────────────────────────────────────────────────────
  Badge: {
    label: "Badge",
    icon: Tag,
    category: "Display",
    isContainer: false,
    defaultProps: { label: "Badge", variant: "default", size: "md", solid: false, dot: false },
    editableProps: [
      { key: "label", label: "Texto", type: "text" },
      {
        key: "variant",
        label: "Variante",
        type: "select",
        options: ["default", "primary", "success", "warning", "danger", "info", "violet", "pink", "orange", "teal"],
      },
      { key: "size", label: "Tamanho", type: "select", options: ["xs", "sm", "md", "lg"] },
      { key: "solid", label: "Sólido", type: "boolean" },
      { key: "dot", label: "Com ponto", type: "boolean" },
    ],
  },
  Alert: {
    label: "Alert",
    icon: ShieldAlert,
    category: "Display",
    isContainer: false,
    defaultProps: { title: "Atenção", description: "Mensagem de alerta", variant: "warning", dismissible: false },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
      {
        key: "variant",
        label: "Variante",
        type: "select",
        options: ["info", "success", "warning", "danger", "neutral"],
      },
      { key: "dismissible", label: "Dispensável (×)", type: "boolean" },
    ],
  },
  TextBlock: {
    label: "Texto",
    icon: AlignLeft,
    category: "Display",
    isContainer: false,
    defaultProps: { content: "Texto de exemplo", size: "sm", weight: "normal", align: "left" },
    editableProps: [
      { key: "content", label: "Conteúdo", type: "textarea" },
      {
        key: "size",
        label: "Tamanho",
        type: "select",
        options: ["xs", "sm", "base", "lg", "xl", "2xl"],
      },
      { key: "weight", label: "Peso", type: "select", options: ["normal", "medium", "semibold", "bold"] },
      { key: "align", label: "Alinhamento", type: "select", options: ["left", "center", "right", "justify"] },
    ],
  },
  Divider: {
    label: "Divider",
    icon: Minus,
    category: "Display",
    isContainer: false,
    defaultProps: { label: "" },
    editableProps: [{ key: "label", label: "Label (opcional)", type: "text" }],
  },
  // ── Formulário extra ─────────────────────────────────────────────────────────
  TimeField: {
    label: "TimeField",
    icon: Timer,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Horário", size: "md", disabled: false, helpText: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
    ],
  },
  AutocompleteField: {
    label: "AutocompleteField",
    icon: ChevronsUpDown,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Cidade", placeholder: "Digite para buscar...", size: "md", disabled: false, helpText: "", tooltip: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
      { key: "tooltip", label: "Tooltip", type: "text" },
    ],
  },
  MultiSelectField: {
    label: "MultiSelectField",
    icon: ListChecks,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Categorias", placeholder: "Selecione...", size: "md", disabled: false, helpText: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
    ],
  },
  FileField: {
    label: "FileField",
    icon: Upload,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Anexo", accept: ".pdf,.jpg,.png", multiple: false, disabled: false, helpText: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "accept", label: "Tipos aceitos", type: "text" },
      { key: "multiple", label: "Múltiplos arquivos", type: "boolean" },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
    ],
  },
  PriceInput: {
    label: "PriceInput",
    icon: Banknote,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Valor", currency: "R$", placeholder: "0,00" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "currency", label: "Moeda", type: "text" },
    ],
  },
  OTPInput: {
    label: "OTP Input",
    icon: KeyRound,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Código de verificação", digits: 6, masked: false },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "digits", label: "Dígitos", type: "select", options: ["4", "6"] },
      { key: "masked", label: "Mascarado", type: "boolean" },
    ],
  },
  PasswordField: {
    label: "Password Strength",
    icon: Lock,
    category: "Formulário",
    isContainer: false,
    defaultProps: { label: "Senha", placeholder: "", size: "md", showStrength: true, disabled: false, helpText: "" },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "showStrength", label: "Indicador de força", type: "boolean" },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "helpText", label: "Texto de ajuda", type: "text" },
    ],
  },
  RichTextEditor: {
    label: "Rich Text Editor",
    icon: Paintbrush,
    category: "Formulário",
    isContainer: false,
    defaultProps: { placeholder: "Escreva algo...", minHeight: "120" },
    editableProps: [
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "minHeight", label: "Altura mínima (px)", type: "text" },
    ],
  },
  // ── Display extra ─────────────────────────────────────────────────────────────
  Avatar: {
    label: "Avatar",
    icon: UserCircle,
    category: "Display",
    isContainer: false,
    defaultProps: { name: "Cristiano Lopes", initials: "CL", size: "md", status: "online" },
    editableProps: [
      { key: "name", label: "Nome", type: "text" },
      { key: "initials", label: "Iniciais", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg", "xl"] },
      { key: "status", label: "Status", type: "select", options: ["online", "offline", "busy", "away", "none"] },
    ],
  },
  PingIndicator: {
    label: "Ping Indicator",
    icon: Radio,
    category: "Display",
    isContainer: false,
    defaultProps: { status: "online", size: "md", label: "Online" },
    editableProps: [
      { key: "status", label: "Status", type: "select", options: ["online", "offline", "busy", "warning", "info"] },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "label", label: "Label", type: "text" },
    ],
  },
  StatCard: {
    label: "Stat Card",
    icon: TrendingUp,
    category: "Display",
    isContainer: false,
    defaultProps: { label: "Usuários ativos", value: "3.294", delta: "+12,4%", deltaPositive: true },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Valor", type: "text" },
      { key: "delta", label: "Delta (%)", type: "text" },
      { key: "deltaPositive", label: "Positivo", type: "boolean" },
    ],
  },
  Stepper: {
    label: "Stepper",
    icon: GitBranch,
    category: "Display",
    isContainer: false,
    defaultProps: { steps: "Dados / Endereço / Confirmação", currentStep: "1", orientation: "horizontal" },
    editableProps: [
      { key: "steps", label: "Passos (separar por /)", type: "text" },
      { key: "currentStep", label: "Passo atual (1-based)", type: "text" },
      { key: "orientation", label: "Orientação", type: "select", options: ["horizontal", "vertical"] },
    ],
  },
  Timeline: {
    label: "Timeline",
    icon: GitCommitVertical,
    category: "Display",
    isContainer: false,
    defaultProps: { events: "Pedido criado / Pagamento confirmado / Em trânsito / Entregue", side: "left" },
    editableProps: [
      { key: "events", label: "Eventos (separar por /)", type: "text" },
      { key: "side", label: "Lado", type: "select", options: ["left", "alternate"] },
    ],
  },
  Table: {
    label: "Table",
    icon: Table2,
    category: "Display",
    isContainer: false,
    defaultProps: { columns: "Nome / Email / Status", rows: "3", variant: "default" },
    editableProps: [
      { key: "columns", label: "Colunas (separar por /)", type: "text" },
      { key: "rows", label: "Linhas de exemplo", type: "select", options: ["2", "3", "4", "5"] },
      { key: "variant", label: "Variante", type: "select", options: ["default", "striped", "bordered"] },
    ],
  },
  TextRotate: {
    label: "TextRotate",
    icon: RotateCcw,
    category: "Display",
    isContainer: false,
    defaultProps: { prefix: "Bem-vindo ao", words: "futuro / design / Lopes UI", interval: "2000" },
    editableProps: [
      { key: "prefix", label: "Prefixo", type: "text" },
      { key: "words", label: "Palavras (separar por /)", type: "text" },
      { key: "interval", label: "Intervalo (ms)", type: "select", options: ["1000", "1500", "2000", "3000", "4000"] },
    ],
  },
  CodeBlock: {
    label: "CodeBlock",
    icon: FileCode,
    category: "Display",
    isContainer: false,
    defaultProps: { language: "tsx", filename: "Example.tsx", code: "export default function Hello() {\n  return <h1>Olá!</h1>;\n}" },
    editableProps: [
      { key: "language", label: "Linguagem", type: "select", options: ["tsx", "ts", "js", "jsx", "html", "css", "json", "bash"] },
      { key: "filename", label: "Nome do arquivo", type: "text" },
      { key: "code", label: "Código", type: "textarea" },
    ],
  },
  ShortcutHint: {
    label: "Shortcut Hint",
    icon: Zap,
    category: "Display",
    isContainer: false,
    defaultProps: { keys: "⌘ K", description: "Abrir menu de comandos" },
    editableProps: [
      { key: "keys", label: "Teclas", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
    ],
  },
  TreeView: {
    label: "TreeView",
    icon: Network,
    category: "Display",
    isContainer: false,
    defaultProps: { label: "Estrutura", size: "md", multiselect: false },
    editableProps: [
      { key: "label", label: "Label", type: "text" },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md"] },
      { key: "multiselect", label: "Multi-seleção", type: "boolean" },
    ],
  },
  // ── Dados ─────────────────────────────────────────────────────────────────────
  DataTable: {
    label: "DataTable",
    icon: Database,
    category: "Dados",
    isContainer: false,
    defaultProps: { title: "Usuários", columns: "Nome / Email / Papel / Status", rows: "4", selectable: true, searchable: true },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "columns", label: "Colunas (separar por /)", type: "text" },
      { key: "rows", label: "Linhas de exemplo", type: "select", options: ["3", "4", "5", "6"] },
      { key: "selectable", label: "Selecionável", type: "boolean" },
      { key: "searchable", label: "Com busca", type: "boolean" },
    ],
  },
  KanbanBoard: {
    label: "Kanban Board",
    icon: Kanban,
    category: "Dados",
    isContainer: false,
    defaultProps: { columns: "A fazer / Em progresso / Concluído", cardsPerCol: "2" },
    editableProps: [
      { key: "columns", label: "Colunas (separar por /)", type: "text" },
      { key: "cardsPerCol", label: "Cards por coluna", type: "select", options: ["1", "2", "3"] },
    ],
  },
  InboxList: {
    label: "Inbox List",
    icon: Inbox,
    category: "Dados",
    isContainer: false,
    defaultProps: { items: "3", showSkeleton: false },
    editableProps: [
      { key: "items", label: "Itens", type: "select", options: ["2", "3", "4", "5"] },
      { key: "showSkeleton", label: "Skeleton", type: "boolean" },
    ],
  },
  FilterBar: {
    label: "FilterBar",
    icon: Filter,
    category: "Dados",
    isContainer: false,
    defaultProps: { filters: "Status / Categoria / Data", readonly: false },
    editableProps: [
      { key: "filters", label: "Filtros (separar por /)", type: "text" },
      { key: "readonly", label: "Somente leitura", type: "boolean" },
    ],
  },
  // ── Comunicação ───────────────────────────────────────────────────────────────
  ChatMessage: {
    label: "Chat Message",
    icon: MessageCircle,
    category: "Comunicação",
    isContainer: false,
    defaultProps: { content: "Olá! Como posso ajudar?", side: "left", senderName: "Cristiano" },
    editableProps: [
      { key: "content", label: "Mensagem", type: "text" },
      { key: "side", label: "Lado", type: "select", options: ["left", "right"] },
      { key: "senderName", label: "Remetente", type: "text" },
    ],
  },
  ChatWindow: {
    label: "Chat Window",
    icon: MessageCircle,
    category: "Comunicação",
    isContainer: false,
    defaultProps: { title: "Suporte", subtitle: "Online agora" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "text" },
    ],
  },
  NotificationBell: {
    label: "Notification Bell",
    icon: BellRing,
    category: "Comunicação",
    isContainer: false,
    defaultProps: { count: "3", label: "Notificações" },
    editableProps: [
      { key: "count", label: "Quantidade", type: "text" },
      { key: "label", label: "Label", type: "text" },
    ],
  },
  ActivityFeed: {
    label: "Activity Feed",
    icon: Activity,
    category: "Comunicação",
    isContainer: false,
    defaultProps: { items: "4", showRelativeTime: true },
    editableProps: [
      { key: "items", label: "Itens", type: "select", options: ["2", "3", "4", "5", "6"] },
      { key: "showRelativeTime", label: "Tempo relativo", type: "boolean" },
    ],
  },
  EmailComposer: {
    label: "Email Composer",
    icon: Mail,
    category: "Comunicação",
    isContainer: false,
    defaultProps: { to: "destinatario@exemplo.com", subject: "Assunto do e-mail", variant: "window" },
    editableProps: [
      { key: "to", label: "Para", type: "text" },
      { key: "subject", label: "Assunto", type: "text" },
      { key: "variant", label: "Variante", type: "select", options: ["window", "inline"] },
    ],
  },
  SmartObject: {
    label: "Smart Object",
    icon: Zap,
    category: "Comunicação",
    isContainer: false,
    defaultProps: { title: "Pedido #1234", type: "order", status: "Em trânsito" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "type", label: "Tipo", type: "select", options: ["order", "ticket", "invoice", "task"] },
    ],
  },
  // ── Navegação ─────────────────────────────────────────────────────────────────
  Accordion: {
    label: "Accordion",
    icon: ChevronUp,
    category: "Navegação",
    isContainer: false,
    defaultProps: { items: "O que é Lopes UI? / Como instalar? / Há suporte?", variant: "default" },
    editableProps: [
      { key: "items", label: "Perguntas (separar por /)", type: "text" },
      { key: "variant", label: "Variante", type: "select", options: ["default", "bordered", "flush"] },
    ],
  },
  CommandMenu: {
    label: "Command Menu",
    icon: Zap,
    category: "Navegação",
    isContainer: false,
    defaultProps: { placeholder: "Digite um comando...", shortcut: "⌘K" },
    editableProps: [
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "shortcut", label: "Atalho", type: "text" },
    ],
  },
  ContextMenu: {
    label: "Context Menu",
    icon: ChevronsUpDown,
    category: "Navegação",
    isContainer: false,
    defaultProps: { items: "Editar / Duplicar / Arquivar / Excluir" },
    editableProps: [
      { key: "items", label: "Opções (separar por /)", type: "text" },
    ],
  },
  QuickActions: {
    label: "Quick Actions",
    icon: Zap,
    category: "Navegação",
    isContainer: false,
    defaultProps: { actions: "Novo pedido / Importar / Exportar / Relatório" },
    editableProps: [
      { key: "actions", label: "Ações (separar por /)", type: "text" },
    ],
  },
  // ── Feedback ─────────────────────────────────────────────────────────────────
  Toast: {
    label: "Toast",
    icon: Bell,
    category: "Feedback",
    isContainer: false,
    defaultProps: { title: "Salvo com sucesso!", description: "Suas alterações foram salvas.", type: "success" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
      { key: "type", label: "Tipo", type: "select", options: ["success", "error", "warning", "info", "loading"] },
    ],
  },
  EmptyState: {
    label: "Empty State",
    icon: PackageOpen,
    category: "Feedback",
    isContainer: false,
    defaultProps: { title: "Nenhum resultado", description: "Tente ajustar os filtros ou criar um novo item.", preset: "no-results", showAction: true, actionLabel: "Criar item" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
      { key: "preset", label: "Preset", type: "select", options: ["no-results", "no-data", "error", "coming-soon", "no-access"] },
      { key: "showAction", label: "Mostrar ação", type: "boolean" },
      { key: "actionLabel", label: "Label do botão", type: "text" },
    ],
  },
  StatusPage: {
    label: "Status Page",
    icon: Shield,
    category: "Feedback",
    isContainer: false,
    defaultProps: { status: "operational", title: "Todos os sistemas operando", variant: "inline" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["operational", "degraded", "outage", "maintenance"] },
      { key: "variant", label: "Variante", type: "select", options: ["inline", "fullscreen"] },
    ],
  },
  ConfirmDialog: {
    label: "Confirm Dialog",
    icon: ShieldAlert,
    category: "Feedback",
    isContainer: false,
    defaultProps: { title: "Confirmar exclusão", description: "Esta ação não pode ser desfeita.", variant: "danger", confirmLabel: "Excluir", cancelLabel: "Cancelar" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "description", label: "Descrição", type: "text" },
      { key: "variant", label: "Variante", type: "select", options: ["danger", "warning", "info"] },
      { key: "confirmLabel", label: "Label confirmar", type: "text" },
      { key: "cancelLabel", label: "Label cancelar", type: "text" },
    ],
  },
  Drawer: {
    label: "Drawer",
    icon: PanelLeft,
    category: "Feedback",
    isContainer: false,
    defaultProps: { title: "Detalhes", side: "right", size: "md" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "side", label: "Lado", type: "select", options: ["right", "left", "top", "bottom"] },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg", "xl"] },
    ],
  },
  // ── Outros ────────────────────────────────────────────────────────────────────
  LoginForm: {
    label: "Login Form",
    icon: LogIn,
    category: "Feedback",
    isContainer: false,
    defaultProps: { title: "Entrar", showOAuth: false, oauthLabel: "Continuar com Google" },
    editableProps: [
      { key: "title", label: "Título", type: "text" },
      { key: "showOAuth", label: "OAuth", type: "boolean" },
      { key: "oauthLabel", label: "Label OAuth", type: "text" },
    ],
  },
  ServiceStatusCard: {
    label: "Service Status",
    icon: Activity,
    category: "Dados",
    isContainer: false,
    defaultProps: { serviceName: "API Gateway", status: "operational", uptime: "99,98%" },
    editableProps: [
      { key: "serviceName", label: "Serviço", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["operational", "degraded", "outage", "maintenance"] },
      { key: "uptime", label: "Uptime", type: "text" },
    ],
  },
  Carousel: {
    label: "Carousel",
    icon: GalleryHorizontal,
    category: "Display",
    isContainer: false,
    defaultProps: { slides: "Slide 1 / Slide 2 / Slide 3", autoplay: false, showArrows: true },
    editableProps: [
      { key: "slides", label: "Slides (separar por /)", type: "text" },
      { key: "autoplay", label: "Autoplay", type: "boolean" },
      { key: "showArrows", label: "Setas", type: "boolean" },
    ],
  },
  SplitPane: {
    label: "Split Pane",
    icon: Columns,
    category: "Layout",
    isContainer: false,
    defaultProps: { orientation: "horizontal", split: "50%" },
    editableProps: [
      { key: "orientation", label: "Orientação", type: "select", options: ["horizontal", "vertical"] },
      { key: "split", label: "Divisão inicial", type: "select", options: ["25%", "33%", "50%", "66%", "75%"] },
    ],
  },
  AppLauncher: {
    label: "App Launcher",
    icon: LayoutGrid,
    category: "Navegação",
    isContainer: false,
    defaultProps: { apps: "Painel / Relatórios / Usuários / Config / Ajuda / API", columns: "3" },
    editableProps: [
      { key: "apps", label: "Apps (separar por /)", type: "text" },
      { key: "columns", label: "Colunas", type: "select", options: ["2", "3", "4"] },
    ],
  },
  // ── Botões (leafs) ──────────────────────────────────────────────────────────
  Button: {
    label: "Button",
    icon: MousePointer2,
    category: "Botões",
    isContainer: false,
    defaultProps: { label: "Botão", variant: "default", size: "md", disabled: false, loading: false },
    editableProps: [
      { key: "label", label: "Texto", type: "text" },
      {
        key: "variant",
        label: "Variante",
        type: "select",
        options: ["default", "primary", "solid", "outline", "ghost", "destructive", "success", "warning", "info", "link"],
      },
      { key: "size", label: "Tamanho", type: "select", options: ["sm", "md", "lg"] },
      { key: "disabled", label: "Desabilitado", type: "boolean" },
      { key: "loading", label: "Carregando", type: "boolean" },
    ],
  },
};

const CATEGORIES: ComponentDef["category"][] = ["Estrutura", "Layout", "Formulário", "Display", "Dados", "Comunicação", "Navegação", "Feedback", "Botões"];

// ── Utility helpers ────────────────────────────────────────────────────────────
function uid(): string {
  return `n${Math.random().toString(36).slice(2, 9)}`;
}

function makeNode(nodeType: NodeType): BuilderNode {
  return {
    id: uid(),
    type: nodeType,
    props: { ...REGISTRY[nodeType].defaultProps },
    children: [],
  };
}

function removeDescendants(
  nodes: Record<string, BuilderNode>,
  id: string,
): Record<string, BuilderNode> {
  const node = nodes[id];
  if (!node) return nodes;
  let next = { ...nodes };
  for (const cid of node.children) {
    next = removeDescendants(next, cid);
  }
  delete next[id];
  return next;
}

// Static maps to avoid dynamic Tailwind class names
const GAP: Record<string, string> = {
  "1": "gap-1", "2": "gap-2", "3": "gap-3", "4": "gap-4", "6": "gap-6", "8": "gap-8",
};

const TEXT_SIZE: Record<string, string> = {
  xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl", "2xl": "text-2xl",
};

// ── Reducer ────────────────────────────────────────────────────────────────────
const INITIAL: BuilderState = { nodes: {}, rows: [], rootIds: [], selectedId: null };

function slotsFit(slots: CanvasSlot[]): boolean {
  return slots.reduce((s, sl) => s + sl.span, 0) <= 12;
}

function removeNodeFromRows(rows: CanvasRow[], nodeId: string): CanvasRow[] {
  return rows
    .map((r) => ({ ...r, slots: r.slots.filter((s) => s.nodeId !== nodeId) }))
    .filter((r) => r.slots.length > 0);
}

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    // ── legacy root actions (still needed for containers' children) ──
    case "ADD_TO_ROOT": {
      const node = makeNode(action.nodeType);
      const newRow: CanvasRow = { id: uid(), slots: [{ nodeId: node.id, span: 12 }] };
      return {
        ...state,
        nodes: { ...state.nodes, [node.id]: node },
        rows: [...state.rows, newRow],
        rootIds: [...state.rootIds, node.id],
        selectedId: node.id,
      };
    }
    case "ADD_TO_CONTAINER": {
      const node = makeNode(action.nodeType);
      const parent = state.nodes[action.parentId];
      if (!parent) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [node.id]: node,
          [parent.id]: { ...parent, children: [...parent.children, node.id] },
        },
        selectedId: node.id,
      };
    }

    // ── row-based canvas actions ──
    case "ADD_TO_NEW_ROW": {
      const node = makeNode(action.nodeType);
      const newRow: CanvasRow = { id: uid(), slots: [{ nodeId: node.id, span: 12 }] };
      return {
        ...state,
        nodes: { ...state.nodes, [node.id]: node },
        rows: [...state.rows, newRow],
        rootIds: [...state.rootIds, node.id],
        selectedId: node.id,
      };
    }
    case "ADD_TO_ROW": {
      const node = makeNode(action.nodeType);
      const rows = state.rows.map((r) => {
        if (r.id !== action.rowId) return r;
        const used = r.slots.reduce((s, sl) => s + sl.span, 0);
        const remaining = 12 - used;
        // pick the largest fitting span
        const span = ([12, 6, 4, 3] as const).find((s) => s <= remaining) ?? null;
        if (!span) return r; // row full
        return { ...r, slots: [...r.slots, { nodeId: node.id, span }] };
      });
      // check if we actually added it
      const wasAdded = rows.some((r) =>
        r.id === action.rowId && r.slots.some((s) => s.nodeId === node.id),
      );
      if (!wasAdded) {
        // row was full — create a new row instead
        const newRow: CanvasRow = { id: uid(), slots: [{ nodeId: node.id, span: 12 }] };
        return {
          ...state,
          nodes: { ...state.nodes, [node.id]: node },
          rows: [...state.rows, newRow],
          rootIds: [...state.rootIds, node.id],
          selectedId: node.id,
        };
      }
      return {
        ...state,
        nodes: { ...state.nodes, [node.id]: node },
        rows,
        rootIds: [...state.rootIds, node.id],
        selectedId: node.id,
      };
    }
    case "INSERT_ROW_AT": {
      const node = makeNode(action.nodeType);
      const newRow: CanvasRow = { id: uid(), slots: [{ nodeId: node.id, span: 12 }] };
      let rows: CanvasRow[];
      if (action.beforeRowId === null) {
        rows = [...state.rows, newRow];
      } else {
        const idx = state.rows.findIndex((r) => r.id === action.beforeRowId);
        rows = idx === -1
          ? [...state.rows, newRow]
          : [...state.rows.slice(0, idx), newRow, ...state.rows.slice(idx)];
      }
      return {
        ...state,
        nodes: { ...state.nodes, [node.id]: node },
        rows,
        rootIds: [...state.rootIds, node.id],
        selectedId: node.id,
      };
    }
    case "SET_SLOT_SPAN": {
      const rows = state.rows.map((r) => ({
        ...r,
        slots: r.slots.map((s) => s.nodeId === action.nodeId ? { ...s, span: action.span } : s),
      }));
      // check if row is now over 12 — if so don't allow
      const valid = rows.every((r) => slotsFit(r.slots));
      return valid ? { ...state, rows } : state;
    }
    case "MOVE_SLOT": {
      if (action.toRowId !== null && action.fromRowId === action.toRowId) return state;
      const fromRow = state.rows.find((r) => r.id === action.fromRowId);
      if (!fromRow) return state;
      const slot = fromRow.slots.find((s) => s.nodeId === action.nodeId);
      if (!slot) return state;

      // Remove slot from source row
      const withoutSlot = state.rows
        .map((r) =>
          r.id === action.fromRowId
            ? { ...r, slots: r.slots.filter((s) => s.nodeId !== action.nodeId) }
            : r
        )
        .filter((r) => r.slots.length > 0);

      let rows: CanvasRow[];

      if (action.toRowId === null) {
        // Insert as new row
        const newRow: CanvasRow = { id: uid(), slots: [{ nodeId: action.nodeId, span: 12 }] };
        const insertBefore = action.beforeRowId;
        if (!insertBefore) {
          rows = [...withoutSlot, newRow];
        } else {
          const idx = withoutSlot.findIndex((r) => r.id === insertBefore);
          if (idx < 0) {
            rows = [...withoutSlot, newRow];
          } else {
            rows = [...withoutSlot.slice(0, idx), newRow, ...withoutSlot.slice(idx)];
          }
        }
      } else {
        const toRow = withoutSlot.find((r) => r.id === action.toRowId);
        if (!toRow) return state;
        const toUsed = toRow.slots.reduce((s, sl) => s + sl.span, 0);
        const remaining = 12 - toUsed;
        const newSpan = ([12, 6, 4, 3] as const).find((s) => s <= remaining) ?? null;
        if (!newSpan) return state; // destination row full
        rows = withoutSlot.map((r) =>
          r.id === action.toRowId
            ? { ...r, slots: [...r.slots, { nodeId: action.nodeId, span: newSpan }] }
            : r
        );
      }
      return { ...state, rows };
    }
    case "MOVE_ROW": {
      const rows = [...state.rows];
      const [row] = rows.splice(action.fromIdx, 1);
      rows.splice(action.toIdx, 0, row);
      return { ...state, rows };
    }

    case "MOVE_TO_CONTAINER": {
      const { nodeId, parentId } = action;
      if (nodeId === parentId) return state;
      const parent = state.nodes[parentId];
      if (!parent || parent.children.includes(nodeId)) return state;
      // Remove from rows and rootIds
      const rows = removeNodeFromRows(state.rows, nodeId);
      const rootIds = state.rootIds.filter((id) => id !== nodeId);
      // Remove from any existing container children, then add to new parent
      const nodes = Object.fromEntries(
        Object.entries(state.nodes).map(([k, v]) => [
          k,
          k === parentId
            ? { ...v, children: [...v.children, nodeId] }
            : { ...v, children: v.children.filter((c) => c !== nodeId) },
        ]),
      );
      return { ...state, nodes, rows, rootIds, selectedId: nodeId };
    }

    case "SELECT":
      return { ...state, selectedId: action.id };
    case "UPDATE_PROPS": {
      const node = state.nodes[action.id];
      if (!node) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.id]: { ...node, props: { ...node.props, ...action.props } },
        },
      };
    }
    case "DELETE": {
      const { id } = action;
      const cleaned = removeDescendants(state.nodes, id);
      const nodes = Object.fromEntries(
        Object.entries(cleaned).map(([k, v]) => [
          k,
          { ...v, children: v.children.filter((c) => c !== id) },
        ]),
      );
      const rows = removeNodeFromRows(state.rows, id);
      return {
        ...state,
        nodes,
        rows,
        rootIds: state.rootIds.filter((r) => r !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
    }
    case "CLEAR":
      return INITIAL;

    // legacy compatibility
    case "MOVE_ROOT": {
      const ids = [...state.rootIds];
      const [item] = ids.splice(action.fromIdx, 1);
      ids.splice(action.toIdx, 0, item);
      return { ...state, rootIds: ids };
    }
    case "INSERT_AT": {
      const node = makeNode(action.nodeType);
      const newRow: CanvasRow = { id: uid(), slots: [{ nodeId: node.id, span: 12 }] };
      const rows = [...state.rows];
      rows.splice(action.pos, 0, newRow);
      return {
        ...state,
        nodes: { ...state.nodes, [node.id]: node },
        rows,
        rootIds: [...state.rootIds, node.id],
        selectedId: node.id,
      };
    }
  }
}

// ── JSX export ─────────────────────────────────────────────────────────────────
function propsToStr(props: BuilderNode["props"]): string {
  return Object.entries(props)
    .filter(([k, v]) => !k.startsWith("__") && v !== "" && v !== false)
    .map(([k, v]) => {
      if (v === true) return k;
      if (typeof v === "number") return `${k}={${v}}`;
      return `${k}="${String(v).replace(/"/g, '\\"')}"`;
    })
    .join(" ");
}

function renderJSX(nodes: Record<string, BuilderNode>, ids: string[], depth: number): string {
  const pad = "  ".repeat(depth);
  return ids
    .map((id) => {
      const n = nodes[id];
      if (!n) return "";
      const attrs = propsToStr(n.props);
      const tag = n.type === "TextBlock" ? "Text" : n.type;
      const attrsStr = attrs ? ` ${attrs}` : "";
      if (REGISTRY[n.type].isContainer && n.children.length > 0) {
        return `${pad}<${tag}${attrsStr}>\n${renderJSX(nodes, n.children, depth + 1)}\n${pad}</${tag}>`;
      }
      return `${pad}<${tag}${attrsStr} />`;
    })
    .join("\n");
}

function buildJSX(state: BuilderState): string {
  if (state.rows.length === 0) return "// Canvas vazio — arraste componentes para começar";
  const lines: string[] = ["// Gerado pelo Lopes UI Builder", ""];
  for (const row of state.rows) {
    if (row.slots.length === 1 && row.slots[0]!.span === 12) {
      // single full-width item — no wrapper
      const nodeId = row.slots[0]!.nodeId;
      const n = state.nodes[nodeId];
      if (n) {
        const attrs = propsToStr(n.props);
        const tag = n.type === "TextBlock" ? "Text" : n.type;
        const attrsStr = attrs ? ` ${attrs}` : "";
        if (REGISTRY[n.type].isContainer && n.children.length > 0) {
          lines.push(`<${tag}${attrsStr}>\n${renderJSX(state.nodes, n.children, 1)}\n</${tag}>`);
        } else {
          lines.push(`<${tag}${attrsStr} />`);
        }
      }
    } else {
      // multi-column row — wrap in a div grid
      const colMap: Record<number, string> = { 3: "col-span-3", 4: "col-span-4", 6: "col-span-6", 12: "col-span-12" };
      lines.push(`<div className="grid grid-cols-12 gap-4">`);
      for (const slot of row.slots) {
        const n = state.nodes[slot.nodeId];
        if (!n) continue;
        const attrs = propsToStr(n.props);
        const tag = n.type === "TextBlock" ? "Text" : n.type;
        const attrsStr = attrs ? ` ${attrs}` : "";
        const colCls = colMap[slot.span] ?? "col-span-12";
        if (REGISTRY[n.type].isContainer && n.children.length > 0) {
          lines.push(`  <div className="${colCls}">`);
          lines.push(`    <${tag}${attrsStr}>\n${renderJSX(state.nodes, n.children, 3)}\n    </${tag}>`);
          lines.push(`  </div>`);
        } else {
          lines.push(`  <${tag} className="${colCls}"${attrsStr} />`);
        }
      }
      lines.push(`</div>`);
    }
  }
  return lines.join("\n");
}

// ── Variant style helpers ──────────────────────────────────────────────────────
function badgeCls(variant: string): string {
  const map: Record<string, string> = {
    primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
    info: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
    default: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  };
  return map[variant] ?? map.default;
}

function badgeSolidCls(variant: string): string {
  const map: Record<string, string> = {
    primary: "bg-indigo-600 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-red-600 text-white",
    info: "bg-sky-500 text-white",
    violet: "bg-violet-600 text-white",
    pink: "bg-pink-500 text-white",
    orange: "bg-orange-500 text-white",
    teal: "bg-teal-600 text-white",
    default: "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900",
  };
  return map[variant] ?? map.default;
}

function badgeDotCls(variant: string): string {
  const map: Record<string, string> = {
    primary: "bg-indigo-500", success: "bg-emerald-500", warning: "bg-amber-500",
    danger: "bg-red-500", info: "bg-sky-500", violet: "bg-violet-500",
    pink: "bg-pink-500", orange: "bg-orange-500", teal: "bg-teal-500",
    default: "bg-zinc-400",
  };
  return map[variant] ?? map.default;
}

function alertCls(variant: string): string {
  const map: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
    danger: "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
    info: "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800",
  };
  return map[variant] ?? map.warning;
}

function btnCls(variant: string): string {
  const map: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    solid: "bg-indigo-600 text-white hover:bg-indigo-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
    outline: "border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    info: "bg-sky-500 text-white hover:bg-sky-600",
    link: "text-indigo-600 dark:text-indigo-400 underline underline-offset-2",
    default: "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900",
  };
  return map[variant] ?? map.default;
}

function btnSizeCls(size: string): string {
  if (size === "sm") return "px-2.5 py-1 text-xs";
  if (size === "lg") return "px-5 py-2.5 text-sm";
  return "px-4 py-2 text-sm";
}

// ── LeafPreview ────────────────────────────────────────────────────────────────
function LeafPreview({ node }: { node: BuilderNode }) {
  const p = node.props;

  switch (node.type) {
    case "TextField": {
      const tfH = p.size === "sm" ? "h-7" : p.size === "lg" ? "h-10" : "h-8";
      const tfText = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      const tfFilled = p.variant === "filled";
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className="flex items-center gap-1 mb-1">
            <span className={twMerge("font-medium text-zinc-700 dark:text-zinc-300", tfText)}>{p.label as string}</span>
            {p.required && <span className="text-red-500 text-xs">*</span>}
            {(p.tooltip as string) && <span className="text-[9px] text-zinc-400 ml-0.5" title={p.tooltip as string}>(?)</span>}
          </div>
          <div className={twMerge(
            "flex rounded-md overflow-hidden",
            tfFilled ? "bg-zinc-100 dark:bg-zinc-800" : "border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900",
            tfH,
          )}>
            {(p.prefix as string) && (
              <div className="flex-shrink-0 flex items-center px-2 bg-zinc-50 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700">
                <span className={twMerge("text-zinc-500", tfText)}>{p.prefix as string}</span>
              </div>
            )}
            <div className="flex items-center px-2.5 flex-1">
              <span className={twMerge("text-zinc-400", tfText)}>{p.placeholder as string}</span>
            </div>
            {(p.suffix as string) && (
              <div className="flex-shrink-0 flex items-center px-2 bg-zinc-50 dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700">
                <span className={twMerge("text-zinc-500", tfText)}>{p.suffix as string}</span>
              </div>
            )}
          </div>
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "NumberField": {
      const nfH = p.size === "sm" ? "h-7" : p.size === "lg" ? "h-10" : "h-8";
      const nfText = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      const nfFilled = p.variant === "filled";
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className={twMerge("font-medium text-zinc-700 dark:text-zinc-300 mb-1", nfText)}>{p.label as string}</div>
          <div className={twMerge(
            "flex rounded-md overflow-hidden",
            nfFilled ? "bg-zinc-100 dark:bg-zinc-800" : "border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900",
            nfH,
          )}>
            {(p.prefix as string) && (
              <div className="flex-shrink-0 flex items-center px-2 bg-zinc-50 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700">
                <span className={twMerge("text-zinc-500", nfText)}>{p.prefix as string}</span>
              </div>
            )}
            <div className="flex items-center px-2.5 flex-1 justify-between">
              <span className={twMerge("text-zinc-400", nfText)}>{(p.placeholder as string) || "0"}</span>
              <div className="flex flex-col gap-px mr-0.5">
                <span className="text-zinc-400 text-[9px] leading-none">▲</span>
                <span className="text-zinc-400 text-[9px] leading-none">▼</span>
              </div>
            </div>
            {(p.suffix as string) && (
              <div className="flex-shrink-0 flex items-center px-2 bg-zinc-50 dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700">
                <span className={twMerge("text-zinc-500", nfText)}>{p.suffix as string}</span>
              </div>
            )}
          </div>
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "DateField": {
      const dfH = p.size === "sm" ? "h-7" : p.size === "lg" ? "h-10" : "h-8";
      const dfText = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      const dfFilled = p.variant === "filled";
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className={twMerge("font-medium text-zinc-700 dark:text-zinc-300 mb-1", dfText)}>
            {p.label as string}
            {(p.tooltip as string) && <span className="text-[9px] text-zinc-400 ml-1">(?)</span>}
          </div>
          <div className={twMerge(
            "rounded-md px-2.5 flex items-center justify-between",
            dfFilled ? "bg-zinc-100 dark:bg-zinc-800" : "border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900",
            dfH,
          )}>
            <span className={twMerge("text-zinc-400", dfText)}>{p.mode === "datetime" ? "dd/mm/aaaa hh:mm" : "dd/mm/aaaa"}</span>
            <Calendar className="size-3.5 text-zinc-400" />
          </div>
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "Switch": {
      const swTrackSz = p.size === "sm" ? "w-7 h-3.5" : p.size === "lg" ? "w-10 h-5" : "w-8 h-4";
      const swThumbSz = p.size === "sm" ? "w-2.5 h-2.5" : p.size === "lg" ? "w-3.5 h-3.5" : "w-3 h-3";
      const swColors: Record<string, string> = {
        indigo: "bg-indigo-500", emerald: "bg-emerald-500", sky: "bg-sky-500",
        rose: "bg-rose-500", amber: "bg-amber-500", zinc: "bg-zinc-500",
      };
      const swTrackCls = swColors[p.color as string] ?? swColors.indigo;
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className="flex items-center justify-between py-0.5">
            <div>
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{p.label as string}</div>
              {(p.description as string) && (
                <div className="text-xs text-zinc-500 mt-0.5">{p.description as string}</div>
              )}
              {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-0.5">{p.helpText as string}</p>}
            </div>
            <div className={twMerge("rounded-full relative flex-shrink-0", swTrackSz, swTrackCls)}>
              <div className={twMerge("absolute right-0.5 top-0.5 rounded-full bg-white shadow-sm", swThumbSz)} />
            </div>
          </div>
        </div>
      );
    }

    case "CheckboxGroup": {
      const isH = p.direction === "horizontal";
      const isCircle = p.shape === "circle";
      const cbSz = p.size === "sm" ? "w-3 h-3" : p.size === "lg" ? "w-4.5 h-4.5" : "w-3.5 h-3.5";
      const cbText = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      return (
        <div>
          <div className={twMerge("font-medium text-zinc-700 dark:text-zinc-300 mb-2", cbText)}>{p.label as string}</div>
          <div className={twMerge(isH ? "flex flex-wrap gap-3" : "space-y-1.5")}>
            {["Opção A", "Opção B", "Opção C"].map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <div className={twMerge("border border-zinc-400 dark:border-zinc-500 flex-shrink-0 bg-white dark:bg-zinc-900", cbSz, isCircle ? "rounded-full" : "rounded")} />
                <span className={twMerge("text-zinc-600 dark:text-zinc-400", cbText)}>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "Badge": {
      const bdgSzCls = p.size === "xs" ? "px-1.5 py-px text-[10px]" : p.size === "sm" ? "px-2 py-0.5 text-[10px]" : p.size === "lg" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
      const bdgSolid = p.solid as boolean;
      const bdgDot = p.dot as boolean;
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={twMerge("inline-flex items-center gap-1.5 rounded-full font-medium", bdgSzCls, bdgSolid ? badgeSolidCls(p.variant as string) : badgeCls(p.variant as string))}>
            {bdgDot && <span className={twMerge("w-1.5 h-1.5 rounded-full flex-shrink-0", badgeDotCls(p.variant as string))} />}
            {p.label as string}
          </span>
        </div>
      );
    }

    case "Alert": {
      const alertVariant = p.variant as string;
      const alertCls2 = alertVariant === "neutral"
        ? "bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-700"
        : alertCls(alertVariant);
      return (
        <div className={twMerge("flex items-start gap-2 p-2.5 rounded-lg text-xs", alertCls2)}>
          <ShieldAlert className="size-3.5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">{p.title as string}</div>
            {(p.description as string) && (
              <div className="mt-0.5 text-xs opacity-80">{p.description as string}</div>
            )}
          </div>
          {p.dismissible && <X className="size-3.5 flex-shrink-0 opacity-60 cursor-pointer" />}
        </div>
      );
    }

    case "TextBlock": {
      const weightCls: Record<string, string> = { normal: "font-normal", medium: "font-medium", semibold: "font-semibold", bold: "font-bold" };
      const alignCls: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right", justify: "text-justify" };
      return (
        <p className={twMerge(
          "text-zinc-700 dark:text-zinc-300",
          TEXT_SIZE[p.size as string] ?? "text-sm",
          weightCls[p.weight as string] ?? "font-normal",
          alignCls[p.align as string] ?? "text-left",
        )}>
          {p.content as string}
        </p>
      );
    }

    case "Divider":
      return (
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          {(p.label as string) && (
            <>
              <span className="text-xs text-zinc-400">{p.label as string}</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            </>
          )}
        </div>
      );

    case "Button": {
      const btnDisabled = p.disabled as boolean;
      const btnLoading = p.loading as boolean;
      return (
        <button
          type="button"
          disabled={btnDisabled}
          className={twMerge(
            "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
            btnSizeCls(p.size as string),
            btnCls(p.variant as string),
            (btnDisabled || btnLoading) && "opacity-50 cursor-not-allowed",
          )}
        >
          {btnLoading && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          {p.label as string}
        </button>
      );
    }

    case "AppHeader":
      return (
        <div className="flex items-center px-3 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg gap-3 overflow-hidden">
          <div className="w-5 h-5 rounded font-black text-[10px] flex items-center justify-center bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 flex-shrink-0">
            {String(p.title || "L")[0].toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{p.title as string}</span>
          <div className="flex-1" />
          {p.showSearch && (
            <div className="h-6 w-24 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-zinc-400 flex-shrink-0" />
              <span className="text-[9px] text-zinc-400">Buscar...</span>
            </div>
          )}
          {p.showAvatar && (
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-white">U</span>
            </div>
          )}
        </div>
      );

    case "AppSidebar":
      return (
        <div className="flex h-24 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <div className="w-36 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 p-2.5">
            <div className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300 mb-2">{p.title as string}</div>
            <div className="space-y-1">
              {["Dashboard", "Usuários", "Configurações"].map((item) => (
                <div
                  key={item}
                  className={twMerge(
                    "flex items-center gap-1.5 px-1.5 py-1 rounded text-[9px]",
                    item === (p.activeItem as string)
                      ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-zinc-500 dark:text-zinc-500",
                  )}
                >
                  <div className="w-2 h-2 rounded-sm bg-current opacity-50 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-zinc-100/60 dark:bg-zinc-800/40 flex items-center justify-center">
            <span className="text-[9px] text-zinc-400">Conteúdo da página</span>
          </div>
        </div>
      );

    case "Footer": {
      const ftVariant = p.variant as string;
      const ftBrand = p.brand as string;
      if (ftVariant === "minimal") {
        return (
          <div className="flex items-center justify-between px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{ftBrand}</span>
            <span className="text-[10px] text-zinc-400">© 2026 {ftBrand}</span>
          </div>
        );
      }
      return (
        <div className={twMerge(
          "bg-white dark:bg-zinc-900 rounded-lg overflow-hidden",
          ftVariant === "bordered" ? "border border-zinc-200 dark:border-zinc-700" : "border-t border-zinc-200 dark:border-zinc-700",
        )}>
          <div className="px-4 pt-3.5 pb-3 flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{ftBrand}</div>
              {(p.tagline as string) && (
                <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{p.tagline as string}</div>
              )}
            </div>
            <div className="flex gap-4">
              {([["Produto", "Componentes", "Templates"], ["Recursos", "Docs", "GitHub"]] as string[][]).map(([title, ...links]) => (
                <div key={title}>
                  <div className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-1.5">{title}</div>
                  {links.map((l) => (
                    <div key={l} className="text-[9px] text-zinc-400 py-0.5">{l}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400">© 2026 {ftBrand}. Todos os direitos reservados.</span>
          </div>
        </div>
      );
    }

    case "PageHeader":
      return (
        <div className="py-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{p.title as string}</h1>
              {(p.description as string) && (
                <p className="text-xs text-zinc-500 mt-1">{p.description as string}</p>
              )}
            </div>
            {p.showAction && (
              <button
                type="button"
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md"
              >
                {p.actionLabel as string}
              </button>
            )}
          </div>
        </div>
      );

    case "Breadcrumb": {
      const crumbs = String(p.items).split("/").map((s) => s.trim()).filter(Boolean);
      return (
        <div className="flex items-center flex-wrap gap-0.5 text-xs">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="size-3 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />}
              <span
                className={
                  i === crumbs.length - 1
                    ? "text-zinc-700 dark:text-zinc-200 font-medium"
                    : "text-zinc-400 dark:text-zinc-500"
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      );
    }

    // ── Formulário extra ───────────────────────────────────────────────────────
    case "TimeField": {
      const tfH2 = p.size === "sm" ? "h-7" : p.size === "lg" ? "h-10" : "h-8";
      const tfText2 = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className={twMerge("font-medium text-zinc-700 dark:text-zinc-300 mb-1", tfText2)}>{p.label as string}</div>
          <div className={twMerge("rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 flex items-center justify-between", tfH2)}>
            <span className={twMerge("text-zinc-400", tfText2)}>hh:mm</span>
            <Timer className="size-3.5 text-zinc-400" />
          </div>
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "AutocompleteField": {
      const acH = p.size === "sm" ? "h-7" : p.size === "lg" ? "h-10" : "h-8";
      const acText = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className={twMerge("font-medium text-zinc-700 dark:text-zinc-300 mb-1", acText)}>{p.label as string}</div>
          <div className={twMerge("rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 flex items-center justify-between", acH)}>
            <span className={twMerge("text-zinc-400", acText)}>{p.placeholder as string}</span>
            <ChevronsUpDown className="size-3.5 text-zinc-400" />
          </div>
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "MultiSelectField": {
      const msH = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className={twMerge("font-medium text-zinc-700 dark:text-zinc-300 mb-1", msH)}>{p.label as string}</div>
          <div className="min-h-8 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 flex flex-wrap items-center gap-1">
            {["Design", "Dev"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 text-[10px] font-medium">
                {t}<X className="size-2" />
              </span>
            ))}
            <span className={twMerge("text-zinc-400", msH)}>{p.placeholder as string}</span>
          </div>
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "FileField": {
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">{p.label as string}</div>
          <div className="h-16 rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center gap-1">
            <Upload className="size-4 text-zinc-400" />
            <span className="text-[10px] text-zinc-400">
              {p.multiple ? "Arraste arquivos aqui" : "Arraste um arquivo aqui"}
            </span>
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600">{p.accept as string}</span>
          </div>
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "PriceInput":
      return (
        <div>
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">{p.label as string}</div>
          <div className="h-8 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 flex items-center overflow-hidden">
            <div className="px-2.5 h-full flex items-center border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500 font-medium flex-shrink-0">
              {p.currency as string}
            </div>
            <span className="text-xs text-zinc-400 px-2.5">0,00</span>
          </div>
        </div>
      );

    case "OTPInput": {
      const digits = Number(p.digits) || 6;
      return (
        <div>
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">{p.label as string}</div>
          <div className="flex gap-1.5">
            {Array.from({ length: digits }).map((_, i) => (
              <div key={i} className={twMerge(
                "flex-1 h-9 rounded-md border-2 flex items-center justify-center text-sm font-bold",
                i === 0 ? "border-indigo-500 bg-indigo-50/30" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900",
              )}>
                {i === 0 ? <div className="w-0.5 h-4 bg-indigo-500 animate-pulse" /> : null}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "PasswordField": {
      const pwH = p.size === "sm" ? "h-7" : p.size === "lg" ? "h-10" : "h-8";
      const pwText = p.size === "sm" ? "text-[10px]" : p.size === "lg" ? "text-sm" : "text-xs";
      return (
        <div className={twMerge(p.disabled && "opacity-50")}>
          <div className={twMerge("font-medium text-zinc-700 dark:text-zinc-300 mb-1", pwText)}>{p.label as string}</div>
          <div className={twMerge("rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 flex items-center justify-between", pwH)}>
            <span className="text-zinc-400 tracking-widest text-xs">••••••••</span>
            <Lock className="size-3.5 text-zinc-400" />
          </div>
          {p.showStrength && (
            <div className="mt-1.5 flex gap-1">
              {["bg-red-400", "bg-red-400", "bg-zinc-200 dark:bg-zinc-700", "bg-zinc-200 dark:bg-zinc-700"].map((cls, i) => (
                <div key={i} className={twMerge("flex-1 h-1 rounded-full", cls)} />
              ))}
            </div>
          )}
          {(p.helpText as string) && <p className="text-[10px] text-zinc-400 mt-1">{p.helpText as string}</p>}
        </div>
      );
    }

    case "RichTextEditor":
      return (
        <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
          <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            {["B", "I", "U", "≡", "🔗"].map((btn) => (
              <div key={btn} className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                {btn}
              </div>
            ))}
          </div>
          <div className="px-2.5 py-2 min-h-[60px] bg-white dark:bg-zinc-900">
            <span className="text-xs text-zinc-400">{p.placeholder as string}</span>
          </div>
        </div>
      );

    // ── Display extra ──────────────────────────────────────────────────────────
    case "Avatar": {
      const szMap: Record<string, string> = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm", xl: "w-16 h-16 text-base" };
      const statusMap: Record<string, string> = { online: "bg-emerald-500", offline: "bg-zinc-400", busy: "bg-red-500", away: "bg-amber-400" };
      const sz = p.size as string;
      const st = p.status as string;
      return (
        <div className="flex items-center gap-2.5">
          <div className="relative inline-flex flex-shrink-0">
            <div className={twMerge("rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white", szMap[sz] ?? szMap.md)}>
              {p.initials as string}
            </div>
            {st && st !== "none" && (
              <span className={twMerge("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900", statusMap[st] ?? "bg-zinc-400")} />
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{p.name as string}</div>
            <div className="text-[10px] text-zinc-400 capitalize">{st !== "none" ? st : ""}</div>
          </div>
        </div>
      );
    }

    case "PingIndicator": {
      const pingStatusMap: Record<string, string> = {
        online: "bg-emerald-500", offline: "bg-zinc-400",
        busy: "bg-red-500", warning: "bg-amber-400", info: "bg-sky-500",
      };
      const pingSzMap: Record<string, string> = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3.5 h-3.5" };
      const pingCls = pingStatusMap[p.status as string] ?? "bg-zinc-400";
      return (
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <div className={twMerge("rounded-full", pingSzMap[p.size as string] ?? pingSzMap.md, pingCls)} />
            <div className={twMerge("absolute inset-0 rounded-full animate-ping opacity-50", pingCls)} />
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">{p.label as string}</span>
        </div>
      );
    }

    case "StatCard":
      return (
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="text-xs text-zinc-500 mb-1">{p.label as string}</div>
          <div className="flex items-end justify-between gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{p.value as string}</span>
            <span className={twMerge("text-xs font-semibold px-1.5 py-0.5 rounded", p.deltaPositive ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40")}>
              {p.delta as string}
            </span>
          </div>
        </div>
      );

    case "Stepper": {
      const stepList = String(p.steps).split("/").map((s) => s.trim()).filter(Boolean);
      const current = Math.max(1, Math.min(Number(p.currentStep) || 1, stepList.length));
      const isH = p.orientation === "horizontal";
      return (
        <div className={isH ? "flex items-center gap-0" : "flex flex-col gap-2"}>
          {stepList.map((step, i) => {
            const done = i + 1 < current;
            const active = i + 1 === current;
            return (
              <React.Fragment key={i}>
                <div className={isH ? "flex flex-col items-center" : "flex items-center gap-2"}>
                  <div className={twMerge(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                    done ? "bg-indigo-600 text-white" : active ? "ring-2 ring-indigo-500 bg-white dark:bg-zinc-900 text-indigo-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400",
                  )}>
                    {done ? "✓" : i + 1}
                  </div>
                  {!isH && <span className="text-[10px] text-zinc-600 dark:text-zinc-400">{step}</span>}
                </div>
                {i < stepList.length - 1 && (
                  isH
                    ? <div className={twMerge("flex-1 h-px mx-1 min-w-4", done ? "bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700")} />
                    : <div className={twMerge("ml-3 w-px h-4", done ? "bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700")} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    case "Timeline": {
      const events = String(p.events).split("/").map((s) => s.trim()).filter(Boolean);
      return (
        <div className="space-y-2">
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={twMerge("w-2.5 h-2.5 rounded-full mt-0.5", i === 0 ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600")} />
                {i < events.length - 1 && <div className="w-px flex-1 min-h-[14px] bg-zinc-200 dark:bg-zinc-700 mt-1" />}
              </div>
              <span className={twMerge("text-xs leading-loose", i === 0 ? "text-zinc-800 dark:text-zinc-200 font-medium" : "text-zinc-500")}>{ev}</span>
            </div>
          ))}
        </div>
      );
    }

    case "Table": {
      const cols = String(p.columns).split("/").map((s) => s.trim()).filter(Boolean);
      const rowCount = Number(p.rows) || 3;
      const sampleData = [
        ["Ana Lima", "ana@exemplo.com", "Admin", "Ativo"],
        ["Bruno Silva", "bruno@exemplo.com", "Membro", "Inativo"],
        ["Carla Souza", "carla@exemplo.com", "Viewer", "Ativo"],
        ["Diego Mendes", "diego@exemplo.com", "Membro", "Ativo"],
        ["Eva Castro", "eva@exemplo.com", "Admin", "Inativo"],
      ];
      const isStriped = p.variant === "striped";
      const isBordered = p.variant === "bordered";
      return (
        <div className={twMerge("overflow-hidden rounded-lg border", isBordered ? "border-zinc-300 dark:border-zinc-600" : "border-zinc-200 dark:border-zinc-700")}>
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                {cols.map((col) => (
                  <th key={col} className="px-2.5 py-2 text-left font-semibold text-zinc-600 dark:text-zinc-300">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, ri) => (
                <tr key={ri} className={isStriped && ri % 2 === 1 ? "bg-zinc-50/70 dark:bg-zinc-800/50" : ""}>
                  {cols.map((col, ci) => (
                    <td key={col} className={twMerge("px-2.5 py-1.5 text-zinc-600 dark:text-zinc-400", isBordered ? "border-t border-zinc-200 dark:border-zinc-700" : "")}>
                      {sampleData[ri]?.[ci] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "TextRotate": {
      const words = String(p.words).split("/").map((s) => s.trim()).filter(Boolean);
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {(p.prefix as string) && <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{p.prefix as string}</span>}
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-400">{words[0] ?? "..."}</span>
          {words.length > 1 && (
            <span className="text-[10px] text-zinc-400 ml-1">({words.length} palavras)</span>
          )}
        </div>
      );
    }

    case "CodeBlock": {
      const codePreview = (p.code as string).split("\n").slice(0, 3).join("\n");
      return (
        <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 dark:bg-zinc-950 border-b border-zinc-700">
            <div className="flex gap-1">
              {["bg-red-500", "bg-yellow-400", "bg-green-500"].map((c) => (
                <div key={c} className={twMerge("w-2 h-2 rounded-full", c)} />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono ml-1">{p.filename as string}</span>
          </div>
          <pre className="bg-zinc-900 text-emerald-400 text-[10px] font-mono px-3 py-2 leading-relaxed whitespace-pre overflow-hidden">
            {codePreview}
          </pre>
        </div>
      );
    }

    case "ShortcutHint":
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {String(p.keys).split(" ").map((k, i) => (
              <kbd key={i} className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded shadow-sm text-zinc-700 dark:text-zinc-300">
                {k}
              </kbd>
            ))}
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{p.description as string}</span>
        </div>
      );

    case "TreeView": {
      const nodes2 = ["📁 Raiz", "  📁 Dados", "    📄 arquivo.ts", "  📄 index.ts"];
      return (
        <div className="font-mono text-[11px] space-y-0.5">
          {nodes2.map((n2, i) => (
            <div key={i} className={twMerge("text-zinc-700 dark:text-zinc-300 rounded px-1", i === 2 && "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300")}>
              {n2}
            </div>
          ))}
        </div>
      );
    }

    // ── Dados ──────────────────────────────────────────────────────────────────
    case "DataTable": {
      const dtCols = String(p.columns).split("/").map((s) => s.trim()).filter(Boolean);
      const dtRows = Number(p.rows) || 4;
      const sampleRows = [
        ["Ana Lima", "ana@ex.com", "Admin", "Ativo"],
        ["Bruno S.", "bruno@ex.com", "Membro", "Inativo"],
        ["Carla M.", "carla@ex.com", "Viewer", "Ativo"],
        ["Diego R.", "diego@ex.com", "Membro", "Ativo"],
        ["Eva C.", "eva@ex.com", "Admin", "Inativo"],
        ["Felipe B.", "felipe@ex.com", "Viewer", "Ativo"],
      ];
      return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{p.title as string}</span>
            {p.searchable && (
              <div className="h-6 w-28 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center gap-1.5 px-2">
                <div className="w-2 h-2 rounded-full border border-zinc-400" />
                <span className="text-[9px] text-zinc-400">Buscar...</span>
              </div>
            )}
          </div>
          <table className="w-full text-[10px]">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                {p.selectable && <th className="w-6 px-2 py-1.5"><div className="w-3 h-3 rounded border border-zinc-400" /></th>}
                {dtCols.map((col) => <th key={col} className="px-2 py-1.5 text-left font-semibold text-zinc-500 dark:text-zinc-400">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: dtRows }).map((_, ri) => (
                <tr key={ri} className="border-t border-zinc-100 dark:border-zinc-800">
                  {p.selectable && <td className="px-2 py-1.5"><div className="w-3 h-3 rounded border border-zinc-300 dark:border-zinc-600" /></td>}
                  {dtCols.map((col, ci) => (
                    <td key={col} className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400">{sampleRows[ri]?.[ci] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "KanbanBoard": {
      const kCols = String(p.columns).split("/").map((s) => s.trim()).filter(Boolean);
      const cardsN = Number(p.cardsPerCol) || 2;
      const colColors = ["bg-zinc-100 dark:bg-zinc-800", "bg-amber-50 dark:bg-amber-950/20", "bg-emerald-50 dark:bg-emerald-950/20"];
      const cardSamples = [
        ["Criar componentes", "Revisar PR", "Deploy v2"],
        ["Escrever testes", "Code review", "Documentação"],
        ["Validar design", "Merge branch", "Tag release"],
      ];
      return (
        <div className="flex gap-2 overflow-hidden">
          {kCols.map((col, ci) => (
            <div key={col} className={twMerge("flex-1 rounded-lg p-2", colColors[ci % colColors.length])}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">{col}</span>
                <span className="text-[9px] text-zinc-400 bg-zinc-200/70 dark:bg-zinc-700 rounded-full px-1.5">{cardsN}</span>
              </div>
              <div className="space-y-1">
                {Array.from({ length: cardsN }).map((_, ri) => (
                  <div key={ri} className="bg-white dark:bg-zinc-900 rounded-md px-2 py-1.5 shadow-sm border border-zinc-200/60 dark:border-zinc-700">
                    <div className="text-[10px] text-zinc-700 dark:text-zinc-300 leading-tight">{cardSamples[ci]?.[ri] ?? `Tarefa ${ri + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "InboxList": {
      const inboxN = Number(p.items) || 3;
      const emails = [
        { from: "Ana Lima", subject: "Revisão do relatório", time: "2 min" },
        { from: "Bruno S.", subject: "Reunião amanhã", time: "15 min" },
        { from: "Carla M.", subject: "Novo projeto aprovado", time: "1h" },
        { from: "Diego R.", subject: "Feedback do cliente", time: "3h" },
        { from: "Eva C.", subject: "Deploy concluído", time: "ontem" },
      ];
      if (p.showSkeleton) {
        return (
          <div className="space-y-2">
            {Array.from({ length: inboxN }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded w-24" />
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {Array.from({ length: inboxN }).map((_, i) => {
            const e = emails[i]!;
            return (
              <div key={i} className="flex items-start gap-2 py-2 px-1">
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                  {e.from[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">{e.from}</span>
                    <span className="text-[9px] text-zinc-400 flex-shrink-0">{e.time}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">{e.subject}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "FilterBar": {
      const fFilters = String(p.filters).split("/").map((s) => s.trim()).filter(Boolean);
      return (
        <div className="flex flex-wrap gap-1.5 items-center">
          {fFilters.map((f) => (
            <div key={f} className={twMerge(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border",
              p.readonly
                ? "border-zinc-200 dark:border-zinc-700 text-zinc-500 bg-zinc-50 dark:bg-zinc-800"
                : "border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30",
            )}>
              {f}
              {!p.readonly && <X className="size-2.5 ml-0.5" />}
            </div>
          ))}
          {!p.readonly && (
            <button type="button" className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500">
              <Plus className="size-2.5" />Adicionar
            </button>
          )}
        </div>
      );
    }

    // ── Comunicação ────────────────────────────────────────────────────────────
    case "ChatMessage": {
      const isRight = p.side === "right";
      return (
        <div className={twMerge("flex items-end gap-2", isRight && "flex-row-reverse")}>
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white">
            {String(p.senderName || "?")[0].toUpperCase()}
          </div>
          <div className={twMerge(
            "max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed",
            isRight
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm",
          )}>
            {p.content as string}
          </div>
        </div>
      );
    }

    case "ChatWindow":
      return (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">S</div>
            <div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{p.title as string}</div>
              <div className="text-[9px] text-emerald-500">{p.subtitle as string}</div>
            </div>
          </div>
          <div className="px-3 py-3 space-y-2 bg-zinc-50 dark:bg-zinc-950 min-h-[60px]">
            <div className="flex items-end gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm px-3 py-1.5 text-[10px] text-zinc-700 dark:text-zinc-300">Olá! Como posso ajudar?</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-2 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div className="flex-1 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 flex items-center">
              <span className="text-[10px] text-zinc-400">Mensagem...</span>
            </div>
          </div>
        </div>
      );

    case "NotificationBell":
      return (
        <div className="flex items-center gap-2">
          <div className="relative inline-flex">
            <BellRing className="size-5 text-zinc-600 dark:text-zinc-400" />
            {Number(p.count) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                {p.count as string}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">{p.label as string}</span>
        </div>
      );

    case "ActivityFeed": {
      const afN = Number(p.items) || 4;
      const afItems = [
        { icon: "📝", actor: "Ana Lima", action: "criou um documento", time: "2 min atrás" },
        { icon: "✅", actor: "Bruno S.", action: "concluiu uma tarefa", time: "15 min atrás" },
        { icon: "💬", actor: "Carla M.", action: "comentou em uma issue", time: "1h atrás" },
        { icon: "🚀", actor: "Diego R.", action: "fez deploy da v2.1", time: "3h atrás" },
        { icon: "📊", actor: "Eva C.", action: "gerou um relatório", time: "ontem" },
        { icon: "🔧", actor: "Felipe B.", action: "corrigiu um bug", time: "2 dias atrás" },
      ];
      return (
        <div className="space-y-2">
          {Array.from({ length: afN }).map((_, i) => {
            const af = afItems[i % afItems.length]!;
            return (
              <div key={i} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs flex-shrink-0">{af.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold">{af.actor}</span> {af.action}
                  </div>
                  {p.showRelativeTime && <div className="text-[9px] text-zinc-400 mt-0.5">{af.time}</div>}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "EmailComposer": {
      const isWindow = p.variant === "window";
      return (
        <div className={twMerge("border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900", isWindow && "shadow-lg")}>
          {isWindow && (
            <div className="flex items-center px-3 py-2 bg-zinc-800 dark:bg-zinc-950 gap-1.5">
              {["bg-red-500", "bg-yellow-400", "bg-green-500"].map((c) => <div key={c} className={twMerge("w-2 h-2 rounded-full", c)} />)}
              <span className="text-[10px] text-zinc-400 ml-1">Novo e-mail</span>
            </div>
          )}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[["Para", p.to as string], ["Assunto", p.subject as string]].map(([lbl, val]) => (
              <div key={lbl} className="flex items-center gap-2 px-3 py-1.5">
                <span className="text-[10px] font-medium text-zinc-400 w-12 flex-shrink-0">{lbl}</span>
                <span className="text-[10px] text-zinc-700 dark:text-zinc-300">{val}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 min-h-[40px]">
            <span className="text-[10px] text-zinc-400">Corpo do e-mail...</span>
          </div>
        </div>
      );
    }

    case "SmartObject": {
      const soTypeMap: Record<string, string> = { order: "📦", ticket: "🎫", invoice: "🧾", task: "✅" };
      return (
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-base flex-shrink-0">
            {soTypeMap[p.type as string] ?? "📦"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate">{p.title as string}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{p.status as string}</div>
          </div>
          <ChevronRight className="size-3.5 text-zinc-400 flex-shrink-0" />
        </div>
      );
    }

    // ── Navegação ──────────────────────────────────────────────────────────────
    case "Accordion": {
      const accItems = String(p.items).split("/").map((s) => s.trim()).filter(Boolean);
      const isBordered = p.variant === "bordered";
      return (
        <div className={twMerge("space-y-1", isBordered && "border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden space-y-0 divide-y divide-zinc-200 dark:divide-zinc-700")}>
          {accItems.map((item, i) => (
            <div key={i} className={twMerge("bg-white dark:bg-zinc-900", !isBordered && "rounded-lg border border-zinc-200 dark:border-zinc-700")}>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{item}</span>
                <ChevronDown className={twMerge("size-3.5 text-zinc-400 transition-transform", i === 0 && "rotate-180")} />
              </div>
              {i === 0 && (
                <div className="px-3 pb-2.5 text-[10px] text-zinc-500 leading-relaxed">
                  {`Conteúdo da resposta para "${item}".`}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case "CommandMenu":
      return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-700">
            <div className="w-3.5 h-3.5 rounded-full border border-zinc-400 flex-shrink-0" />
            <span className="text-xs text-zinc-400 flex-1">{p.placeholder as string}</span>
            <kbd className="text-[9px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1 rounded border border-zinc-200 dark:border-zinc-700">{p.shortcut as string}</kbd>
          </div>
          <div className="p-1 divide-y divide-zinc-50 dark:divide-zinc-800">
            {["Novo documento", "Abrir projeto", "Configurações"].map((cmd) => (
              <div key={cmd} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <Zap className="size-3 text-zinc-400" />
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "ContextMenu": {
      const ctxItems = String(p.items).split("/").map((s) => s.trim()).filter(Boolean);
      return (
        <div className="inline-block border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
          {ctxItems.map((item, i) => (
            <div key={i} className={twMerge(
              "flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer",
              item === "Excluir" ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300",
              i > 0 && i === ctxItems.length - 1 && "border-t border-zinc-100 dark:border-zinc-800 mt-px",
            )}>
              {item}
            </div>
          ))}
        </div>
      );
    }

    case "QuickActions": {
      const qActions = String(p.actions).split("/").map((s) => s.trim()).filter(Boolean);
      return (
        <div className="flex flex-wrap gap-2">
          {qActions.map((action) => (
            <button key={action} type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Zap className="size-3 text-indigo-500" />
              {action}
            </button>
          ))}
        </div>
      );
    }

    case "AppLauncher": {
      const launcherApps = String(p.apps).split("/").map((s) => s.trim()).filter(Boolean);
      const cols = Number(p.columns) || 3;
      const gridCls: Record<number, string> = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
      const appEmojis = ["📊", "📈", "👥", "⚙️", "🆘", "🔌", "📋", "🗂️"];
      return (
        <div className={twMerge("grid gap-2", gridCls[cols] ?? "grid-cols-3")}>
          {launcherApps.map((app, i) => (
            <div key={app} className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              <div className="text-lg">{appEmojis[i % appEmojis.length]}</div>
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 text-center truncate w-full">{app}</span>
            </div>
          ))}
        </div>
      );
    }

    // ── Feedback ───────────────────────────────────────────────────────────────
    case "Toast": {
      const toastMap: Record<string, string> = {
        success: "border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
        error: "border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30",
        warning: "border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30",
        info: "border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-950/30",
        loading: "border-l-4 border-zinc-400 bg-zinc-50 dark:bg-zinc-900",
      };
      return (
        <div className={twMerge("flex items-start gap-2.5 px-3 py-2.5 rounded-xl shadow-md border border-zinc-200/50 dark:border-zinc-700", toastMap[p.type as string] ?? toastMap.info)}>
          {p.type === "loading" && <Loader2 className="size-3.5 mt-0.5 animate-spin text-zinc-500 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{p.title as string}</div>
            {(p.description as string) && <div className="text-[10px] text-zinc-500 mt-0.5">{p.description as string}</div>}
          </div>
          <X className="size-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
        </div>
      );
    }

    case "EmptyState": {
      const esPresetEmoji: Record<string, string> = { "no-results": "🔍", "no-data": "📭", "error": "⚠️", "coming-soon": "🚧", "no-access": "🔒" };
      return (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <div className="text-3xl mb-2">{esPresetEmoji[p.preset as string] ?? "📭"}</div>
          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{p.title as string}</div>
          {(p.description as string) && <div className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-xs">{p.description as string}</div>}
          {p.showAction && (
            <button type="button" className="mt-3 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg">
              {p.actionLabel as string}
            </button>
          )}
        </div>
      );
    }

    case "StatusPage": {
      const spMap: Record<string, { color: string; label: string }> = {
        operational: { color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", label: "Operacional" },
        degraded: { color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", label: "Desempenho reduzido" },
        outage: { color: "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800", label: "Interrupção" },
        maintenance: { color: "text-sky-600 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800", label: "Manutenção" },
      };
      const spStatus = spMap[p.status as string] ?? spMap.operational;
      return (
        <div className={twMerge("flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium", spStatus.color)}>
          <Shield className="size-4 flex-shrink-0" />
          <div>
            <div className="font-semibold">{p.title as string}</div>
            <div className="text-[10px] opacity-70">{spStatus.label}</div>
          </div>
        </div>
      );
    }

    case "ConfirmDialog": {
      const cdMap: Record<string, string> = {
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-amber-500 hover:bg-amber-600 text-white",
        info: "bg-sky-600 hover:bg-sky-700 text-white",
      };
      return (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-lg max-w-xs">
          <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">{p.title as string}</div>
          <div className="text-xs text-zinc-500 mb-4">{p.description as string}</div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
              {p.cancelLabel as string}
            </button>
            <button type="button" className={twMerge("px-3 py-1.5 text-xs rounded-lg", cdMap[p.variant as string] ?? cdMap.danger)}>
              {p.confirmLabel as string}
            </button>
          </div>
        </div>
      );
    }

    case "Drawer": {
      const drawerSideLabel: Record<string, string> = { right: "→ abre pela direita", left: "← abre pela esquerda", top: "↑ abre pelo topo", bottom: "↓ abre pelo fundo" };
      const drawerSzLabel: Record<string, string> = { sm: "25%", md: "33%", lg: "50%", xl: "66%" };
      return (
        <div className="flex gap-1.5 items-stretch overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700" style={{ height: 80 }}>
          <div className="flex-1 bg-zinc-100/60 dark:bg-zinc-800/40 flex items-center justify-center">
            <span className="text-[9px] text-zinc-400">Página</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 flex flex-col justify-between px-2 py-2" style={{ width: "35%" }}>
            <div className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-200">{p.title as string}</div>
            <div className="text-[9px] text-zinc-400">{drawerSideLabel[p.side as string]} · {drawerSzLabel[p.size as string]}</div>
          </div>
        </div>
      );
    }

    case "LoginForm":
      return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 w-full max-w-xs">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 text-center">{p.title as string}</div>
          <div className="space-y-2">
            <div className="h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 flex items-center">
              <span className="text-[10px] text-zinc-400">E-mail</span>
            </div>
            <div className="h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 flex items-center">
              <span className="text-[10px] text-zinc-400">Senha</span>
            </div>
            <button type="button" className="w-full h-7 rounded-md bg-indigo-600 text-white text-[10px] font-semibold">Entrar</button>
          </div>
          {p.showOAuth && (
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" className="w-full h-7 rounded-md border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400">
                {p.oauthLabel as string}
              </button>
            </div>
          )}
        </div>
      );

    case "ServiceStatusCard": {
      const svcMap: Record<string, string> = {
        operational: "bg-emerald-500", degraded: "bg-amber-500",
        outage: "bg-red-500", maintenance: "bg-sky-500",
      };
      return (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="relative flex-shrink-0">
            <div className={twMerge("w-2.5 h-2.5 rounded-full", svcMap[p.status as string] ?? "bg-zinc-400")} />
            <div className={twMerge("absolute inset-0 rounded-full animate-ping opacity-40", svcMap[p.status as string] ?? "bg-zinc-400")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{p.serviceName as string}</div>
            <div className="text-[10px] text-zinc-500 capitalize">{p.status as string}</div>
          </div>
          <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{p.uptime as string}</div>
        </div>
      );
    }

    case "Carousel": {
      const slides = String(p.slides).split("/").map((s) => s.trim()).filter(Boolean);
      return (
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div className="h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/40 dark:to-purple-950/40 flex items-center justify-center">
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{slides[0] ?? "Slide 1"}</span>
          </div>
          {p.showArrows && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
              <div className="w-5 h-5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center">
                <ChevronRight className="size-3 text-zinc-600 rotate-180" />
              </div>
              <div className="w-5 h-5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center">
                <ChevronRight className="size-3 text-zinc-600" />
              </div>
            </div>
          )}
          <div className="flex justify-center gap-1 py-1.5">
            {slides.map((_, i) => (
              <div key={i} className={twMerge("w-1.5 h-1.5 rounded-full", i === 0 ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600")} />
            ))}
          </div>
        </div>
      );
    }

    case "SplitPane": {
      const isV = p.orientation === "vertical";
      const splitPct = parseInt(String(p.split), 10) || 50;
      return (
        <div className={twMerge("flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700", isV ? "flex-col" : "flex-row")} style={{ height: isV ? 80 : 64 }}>
          <div
            className="bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-[9px] text-zinc-400"
            style={isV ? { height: `${splitPct}%` } : { width: `${splitPct}%` }}
          >
            Painel A
          </div>
          <div className={twMerge("flex-shrink-0", isV ? "h-px bg-zinc-200 dark:bg-zinc-700" : "w-px bg-zinc-200 dark:bg-zinc-700")} />
          <div className="flex-1 bg-zinc-100/60 dark:bg-zinc-800/40 flex items-center justify-center text-[9px] text-zinc-400">
            Painel B
          </div>
        </div>
      );
    }

    default:
      return <div className="text-xs text-zinc-400">{node.type}</div>;
  }
}

// ── Drag data ──────────────────────────────────────────────────────────────────
type DragData =
  | { from: "toolbox"; nodeType: NodeType }
  | { from: "canvas-slot"; nodeId: string; rowId: string };

// ── CanvasSlotItem ─────────────────────────────────────────────────────────────
function CanvasSlotItem({
  slot,
  node,
  nodes,
  rowId,
  dispatch,
  selectedId,
}: {
  slot: CanvasSlot;
  node: BuilderNode;
  nodes: Record<string, BuilderNode>;
  rowId: string;
  dispatch: React.Dispatch<BuilderAction>;
  selectedId: string | null;
}) {
  const [containerOver, setContainerOver] = useState(false);
  const def = REGISTRY[node.type];
  const isSelected = selectedId === node.id;

  function handleDragStart(e: React.DragEvent) {
    const payload: DragData = { from: "canvas-slot", nodeId: node.id, rowId };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  }

  function handleContainerDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setContainerOver(false);
    }
  }

  function handleContainerDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setContainerOver(false);
    try {
      const raw = e.dataTransfer.getData("application/json");
      const data: DragData = JSON.parse(raw);
      if (data.from === "toolbox") {
        dispatch({ type: "ADD_TO_CONTAINER", parentId: node.id, nodeType: data.nodeType });
      } else if (data.from === "canvas-slot" && data.nodeId !== node.id) {
        dispatch({ type: "MOVE_TO_CONTAINER", nodeId: data.nodeId, parentId: node.id });
      }
    } catch { /* ignore */ }
  }

  function renderChild(childId: string) {
    const child = nodes[childId];
    if (!child) return null;
    return (
      <div
        key={childId}
        onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT", id: childId }); }}
        className={twMerge(
          "rounded-md p-1.5 cursor-pointer transition-all",
          selectedId === childId
            ? "ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20"
            : "hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-600",
        )}
      >
        <div className="flex items-center gap-1 mb-1.5">
          {React.createElement(REGISTRY[child.type].icon, { className: "size-2.5 text-zinc-400" })}
          <span className="text-[9px] text-zinc-400 uppercase tracking-wide font-medium">{REGISTRY[child.type].label}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE", id: childId }); }}
            className="ml-auto p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover/child:opacity-100 transition-opacity"
          >
            <X className="size-2.5 text-zinc-400 hover:text-red-500" />
          </button>
        </div>
        <LeafPreview node={child} />
      </div>
    );
  }

  function renderContainerContent() {
    const gapCls = GAP[node.props.gap as string] ?? "gap-4";
    const childCount = node.children.length;

    const emptyZone = (
      <div
        className={twMerge(
          "h-14 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors",
          containerOver
            ? "border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20"
            : "border-zinc-200 dark:border-zinc-700",
        )}
      >
        <span className="text-xs text-zinc-400">
          {containerOver ? "Soltar aqui" : "Arraste componentes aqui"}
        </span>
      </div>
    );

    if (node.type === "Card") {
      return (
        <div
          className={twMerge(
            "rounded-xl border overflow-hidden transition-colors",
            containerOver
              ? "border-indigo-400"
              : "border-zinc-200 dark:border-zinc-700",
          )}
        >
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/60">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{node.props.title as string}</div>
            {(node.props.subtitle as string) && (
              <div className="text-xs text-zinc-500 mt-0.5">{node.props.subtitle as string}</div>
            )}
          </div>
          <div className="p-4 space-y-2 group/child">
            {childCount > 0 ? (
              <>
                {node.children.map(renderChild)}
                {containerOver && emptyZone}
              </>
            ) : emptyZone}
          </div>
        </div>
      );
    }

    if (node.type === "FormSection") {
      return (
        <div
          className={twMerge(
            "border-l-2 pl-4 py-1 transition-colors",
            containerOver ? "border-indigo-500" : "border-indigo-300 dark:border-indigo-700",
          )}
        >
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{node.props.title as string}</div>
          {(node.props.description as string) && (
            <div className="text-xs text-zinc-500 mt-0.5">{node.props.description as string}</div>
          )}
          <div className="mt-3 space-y-2 group/child">
            {childCount > 0 ? (
              <>
                {node.children.map(renderChild)}
                {containerOver && emptyZone}
              </>
            ) : emptyZone}
          </div>
        </div>
      );
    }

    const flexCls = node.type === "Row" ? "flex flex-wrap" : "flex flex-col";
    const label = node.type === "Row" ? "Row — horizontal" : "Column — vertical";
    return (
      <div
        className={twMerge(
          "border border-dashed rounded-xl p-3 transition-colors",
          containerOver ? "border-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/10" : "border-zinc-300 dark:border-zinc-600",
        )}
      >
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-2 flex items-center gap-1">
          {React.createElement(def.icon, { className: "size-2.5" })}
          {label}
        </div>
        {childCount > 0 ? (
          <>
            <div className={twMerge(flexCls, gapCls, "group/child")}>
              {node.children.map((cid) => {
              const child = nodes[cid];
              if (!child) return null;
              return (
                <div
                  key={cid}
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT", id: cid }); }}
                  className={twMerge(
                    "flex-1 min-w-[140px] rounded-md p-1.5 cursor-pointer transition-all",
                    selectedId === cid
                      ? "ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20"
                      : "hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-600",
                  )}
                >
                  <LeafPreview node={child} />
                </div>
              );
            })}
            </div>
            {containerOver && emptyZone}
          </>
        ) : emptyZone}
      </div>
    );
  }

  return (
    <div
      style={{ flex: `${slot.span} 0 0%`, minWidth: 0 }}
      className={twMerge(
        "group relative rounded-xl p-3 cursor-pointer select-none transition-all",
        "bg-white dark:bg-zinc-900",
        isSelected
          ? "ring-2 ring-indigo-500 shadow-sm"
          : containerOver
          ? "ring-2 ring-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10"
          : "hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-600",
      )}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT", id: node.id }); }}
      // All drops are routed by CanvasRowComponent using data-container-id; these handlers
      // only set visual state so the container lights up when something hovers over it.
      {...(def.isContainer && {
        "data-container-id": node.id,
        onDragOver: (e: React.DragEvent) => { setContainerOver(true); e.stopPropagation(); e.preventDefault(); },
        onDragLeave: handleContainerDragLeave,
        onDrop: handleContainerDrop,
      })}
    >
      {/* Drag handle */}
      <div
        draggable
        onDragStart={handleDragStart}
        className="absolute -left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="size-3 text-zinc-400" />
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE", id: node.id }); }}
          className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 transition-colors"
        >
          <Trash2 className="size-3 text-zinc-400 hover:text-red-500" />
        </button>
      </div>

      {/* Type label */}
      <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
        {React.createElement(def.icon, { className: "size-3" })}
        {def.label}
      </div>

      {def.isContainer ? renderContainerContent() : <LeafPreview node={node} />}
    </div>
  );
}

// ── BetweenRowZone ─────────────────────────────────────────────────────────────
function BetweenRowZone({
  beforeRowId,
  active,
  onDrop,
}: {
  beforeRowId: string | null;
  active: boolean;
  onDrop: (data: DragData, beforeRowId: string | null) => void;
}) {
  const [over, setOver] = useState(false);

  if (!active) return <div className="h-1" />;

  return (
    <div
      className={twMerge(
        "flex items-center px-1 transition-all duration-100",
        over ? "h-8" : "h-3",
      )}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOver(true); e.dataTransfer.dropEffect = "move"; }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        try {
          const data: DragData = JSON.parse(e.dataTransfer.getData("application/json"));
          onDrop(data, beforeRowId);
        } catch { /* ignore */ }
      }}
    >
      <div className={twMerge(
        "w-full rounded-full transition-all duration-100 relative",
        over
          ? "h-1 bg-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.45)]"
          : "h-px bg-indigo-300/40 dark:bg-indigo-500/20",
      )}>
        {over && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500" />}
      </div>
    </div>
  );
}

// ── CanvasRowComponent ─────────────────────────────────────────────────────────
function CanvasRowComponent({
  row,
  rowIdx,
  totalRows,
  nodes,
  dispatch,
  selectedId,
}: {
  row: CanvasRow;
  rowIdx: number;
  totalRows: number;
  nodes: Record<string, BuilderNode>;
  dispatch: React.Dispatch<BuilderAction>;
  selectedId: string | null;
}) {
  const [rowOver, setRowOver] = useState(false);

  function handleRowDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRowOver(true);
    e.dataTransfer.dropEffect = "move";
  }

  function handleRowDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setRowOver(false);
  }

  function handleRowDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRowOver(false);
    try {
      const data: DragData = JSON.parse(e.dataTransfer.getData("application/json"));

      // Check if dropped onto/inside a container slot using data attribute
      const containerEl = (e.target as Element).closest("[data-container-id]");
      if (containerEl) {
        const parentId = containerEl.getAttribute("data-container-id")!;
        if (data.from === "toolbox") {
          dispatch({ type: "ADD_TO_CONTAINER", parentId, nodeType: data.nodeType });
        } else if (data.from === "canvas-slot" && data.nodeId !== parentId) {
          dispatch({ type: "MOVE_TO_CONTAINER", nodeId: data.nodeId, parentId });
        }
        return;
      }

      // Non-container drop — add to row (or create new row if full)
      if (data.from === "toolbox") {
        dispatch({ type: "ADD_TO_ROW", rowId: row.id, nodeType: data.nodeType });
      } else if (data.from === "canvas-slot" && data.rowId !== row.id) {
        dispatch({ type: "MOVE_SLOT", nodeId: data.nodeId, fromRowId: data.rowId, toRowId: row.id });
      }
    } catch { /* ignore */ }
  }

  const totalSpan = row.slots.reduce((s, sl) => s + sl.span, 0);
  const rowFull = totalSpan >= 12;
  // Suppress full-row amber warning when any slot is a container (user can still drop inside it)
  const hasContainerSlot = row.slots.some((s) => nodes[s.nodeId] && REGISTRY[nodes[s.nodeId].type]?.isContainer);
  const showRowFull = rowFull && !hasContainerSlot;

  return (
    <div
      className={twMerge(
        "flex items-stretch gap-2 rounded-xl transition-all duration-150 p-1",
        rowOver && !showRowFull
          ? "ring-2 ring-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/10"
          : rowOver && showRowFull
          ? "ring-2 ring-amber-400 bg-amber-50/30 dark:bg-amber-950/10"
          : "ring-1 ring-transparent",
      )}
      onDragOver={handleRowDragOver}
      onDragLeave={handleRowDragLeave}
      onDrop={handleRowDrop}
    >
      {/* Row drag handle */}
      <div
        className="flex-shrink-0 flex items-center opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing self-center px-0.5"
        title="Linha"
      >
        <GripVertical className="size-4 text-zinc-300 dark:text-zinc-600" />
      </div>

      {/* Slot items */}
      <div className="flex flex-1 gap-3 min-w-0 items-stretch">
        {row.slots.map((slot) => {
          const node = nodes[slot.nodeId];
          if (!node) return null;
          return (
            <CanvasSlotItem
              key={slot.nodeId}
              slot={slot}
              node={node}
              nodes={nodes}
              rowId={row.id}
              dispatch={dispatch}
              selectedId={selectedId}
            />
          );
        })}

        {/* "Add here" hint — static, always visible when row not full */}
        {!rowFull && (
          <div className={twMerge(
            "flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed self-stretch transition-all duration-150",
            rowOver
              ? "w-24 border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-500"
              : "w-10 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-700",
          )}>
            <Plus className={twMerge("size-4", rowOver ? "text-indigo-500" : "text-zinc-300 dark:text-zinc-600")} />
            {rowOver && <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 text-center leading-tight px-1">Soltar aqui</span>}
          </div>
        )}
        {showRowFull && rowOver && (
          <div className="flex-shrink-0 flex items-center justify-center w-24 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50/40 dark:bg-amber-950/10 self-stretch text-center px-1">
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 leading-tight">Linha cheia → nova linha</span>
          </div>
        )}
      </div>

      {/* Row order controls */}
      <div className="flex-shrink-0 flex flex-col gap-0.5 justify-center opacity-0 hover:opacity-100 transition-opacity">
        {rowIdx > 0 && (
          <button
            type="button"
            title="Mover linha para cima"
            onClick={() => dispatch({ type: "MOVE_ROW", fromIdx: rowIdx, toIdx: rowIdx - 1 })}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronDown className="size-3 text-zinc-400 rotate-180" />
          </button>
        )}
        {rowIdx < totalRows - 1 && (
          <button
            type="button"
            title="Mover linha para baixo"
            onClick={() => dispatch({ type: "MOVE_ROW", fromIdx: rowIdx, toIdx: rowIdx + 1 })}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronDown className="size-3 text-zinc-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── ToolboxPanel ───────────────────────────────────────────────────────────────
function ToolboxPanel({
  dispatch,
  rows,
  selectedId,
}: {
  dispatch: React.Dispatch<BuilderAction>;
  rows: CanvasRow[];
  selectedId: string | null;
}) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(CATEGORIES));

  function toggleCat(cat: string) {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  // Find the row that contains the currently selected component
  const selectedRowId = selectedId
    ? (rows.find((r) => r.slots.some((s) => s.nodeId === selectedId))?.id ?? null)
    : null;

  function handleDoubleClick(nodeType: NodeType) {
    if (selectedRowId) {
      // Add next to the selected item's row
      dispatch({ type: "ADD_TO_ROW", rowId: selectedRowId, nodeType });
    } else {
      dispatch({ type: "ADD_TO_NEW_ROW", nodeType });
    }
  }

  return (
    <div className="w-52 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto bg-zinc-50/60 dark:bg-zinc-900/60">
      <div className="px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Componentes
        </p>
        <p className="text-[9px] text-zinc-400 dark:text-zinc-600 mt-0.5">
          {selectedRowId
            ? "2× clique adiciona na linha selecionada"
            : "Arraste ou 2× clique para adicionar"}
        </p>
      </div>
      <div className="p-2 space-y-0.5">
        {CATEGORIES.map((cat) => {
          const items = (Object.entries(REGISTRY) as [NodeType, ComponentDef][]).filter(
            ([, def]) => def.category === cat,
          );
          const isOpen = openCats.has(cat);
          return (
            <div key={cat}>
              <button
                type="button"
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span>{cat}</span>
                <ChevronDown
                  className={twMerge("size-3 text-zinc-400 transition-transform duration-200", isOpen ? "" : "-rotate-90")}
                />
              </button>
              {isOpen && (
                <div className="ml-1 mt-0.5 space-y-0.5 mb-1">
                  {items.map(([type, def]) => {
                    const payload: DragData = { from: "toolbox", nodeType: type };
                    return (
                      <div
                        key={type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/json", JSON.stringify(payload));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDoubleClick={() => handleDoubleClick(type)}
                        title={selectedRowId ? "2× para adicionar na linha selecionada" : "2× para nova linha · Arraste para posicionar"}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 cursor-grab active:cursor-grabbing transition-all select-none"
                      >
                        {React.createElement(def.icon, { className: "size-3.5 text-zinc-500 flex-shrink-0" })}
                        <span className="truncate">{def.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── InspectorPanel ─────────────────────────────────────────────────────────────
function InspectorPanel({
  selectedId,
  nodes,
  rows,
  dispatch,
}: {
  selectedId: string | null;
  nodes: Record<string, BuilderNode>;
  rows: CanvasRow[];
  dispatch: React.Dispatch<BuilderAction>;
}) {
  const node = selectedId ? nodes[selectedId] : null;
  const def = node ? REGISTRY[node.type] : null;

  if (!node || !def) {
    return (
      <div className="w-80 flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 bg-zinc-50/60 dark:bg-zinc-900/60">
        <Sparkles className="size-8 text-zinc-300 dark:text-zinc-700 mb-2" />
        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center leading-relaxed">
          Selecione um componente<br />para editar suas propriedades
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto bg-zinc-50/60 dark:bg-zinc-900/60">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {React.createElement(def.icon, { className: "size-4 text-zinc-500" })}
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{def.label}</span>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "SELECT", id: null })}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="size-3.5 text-zinc-400" />
        </button>
      </div>

      {/* Live preview */}
      {!def.isContainer && (
        <div className="mx-4 my-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
          <LeafPreview node={node} />
        </div>
      )}

      {/* ID badge */}
      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5">
          {node.id}
        </span>
      </div>

      {/* Layout — colSpan control */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2.5 uppercase tracking-wide">
          Largura no canvas
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {([
            { span: 12, label: "Inteiro", short: "1/1" },
            { span: 6,  label: "Metade",  short: "1/2" },
            { span: 4,  label: "Terço",   short: "1/3" },
            { span: 3,  label: "Quarto",  short: "1/4" },
          ] as const).map(({ span, label, short }) => {
            const currentSlot = rows.flatMap(r => r.slots).find(s => s.nodeId === node.id);
            const currentSpan = currentSlot?.span ?? 12;
            const isActive = currentSpan === span;
            const boxCount = 12 / span;
            return (
              <button
                key={span}
                type="button"
                title={label}
                onClick={() => dispatch({ type: "SET_SLOT_SPAN", nodeId: node.id, span })}
                className={twMerge(
                  "flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all",
                  isActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900",
                )}
              >
                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: boxCount }).map((_, i) => (
                    <div
                      key={i}
                      style={{ width: `${Math.min(28 / boxCount, 8)}px` }}
                      className={twMerge(
                        "h-2 rounded-[2px]",
                        i === 0
                          ? isActive ? "bg-indigo-500" : "bg-zinc-400 dark:bg-zinc-500"
                          : "bg-zinc-200 dark:bg-zinc-700",
                      )}
                    />
                  ))}
                </div>
                {short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Props */}
      <div className="p-4 space-y-4">
        {(() => {
          // Merge explicit editableProps with auto-derived ones for any prop not yet listed
          const explicitKeys = new Set(def.editableProps.map((ep) => ep.key));
          const autoProps: EditableProp[] = Object.entries(node.props)
            .filter(([k]) => !explicitKeys.has(k))
            .map(([k, v]) => ({
              key: k,
              label: k,
              type: typeof v === "boolean" ? "boolean" : typeof v === "number" ? "number" : "text",
            }));
          const allProps: EditableProp[] = [...def.editableProps, ...autoProps];

          return allProps.map((ep) => (
            <div key={ep.key}>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 capitalize">
                {ep.label}
              </label>

              {(ep.type === "text") && (
                <input
                  type="text"
                  value={String(node.props[ep.key] ?? "")}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_PROPS", id: node.id, props: { [ep.key]: e.target.value } })
                  }
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              )}

              {ep.type === "number" && (
                <input
                  type="number"
                  value={Number(node.props[ep.key] ?? 0)}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_PROPS", id: node.id, props: { [ep.key]: Number(e.target.value) } })
                  }
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              )}

              {ep.type === "textarea" && (
                <textarea
                  value={String(node.props[ep.key] ?? "")}
                  rows={4}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_PROPS", id: node.id, props: { [ep.key]: e.target.value } })
                  }
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-y font-mono"
                />
              )}

              {ep.type === "select" && ep.options && (
                <select
                  value={String(node.props[ep.key] ?? ep.options[0])}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_PROPS", id: node.id, props: { [ep.key]: e.target.value } })
                  }
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                >
                  {ep.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {ep.type === "boolean" && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "UPDATE_PROPS", id: node.id, props: { [ep.key]: !node.props[ep.key] } })
                  }
                  className="flex items-center gap-2"
                >
                  <div
                    className={twMerge(
                      "w-8 h-4 rounded-full relative transition-colors",
                      node.props[ep.key] ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600",
                    )}
                  >
                    <div
                      className={twMerge(
                        "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all",
                        node.props[ep.key] ? "right-0.5" : "left-0.5",
                      )}
                    />
                  </div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {node.props[ep.key] ? "Sim" : "Não"}
                  </span>
                </button>
              )}
            </div>
          ));
        })()}

        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => dispatch({ type: "DELETE", id: node.id })}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-800 transition-colors"
          >
            <Trash2 className="size-3.5" />
            Remover componente
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ExportPanel ────────────────────────────────────────────────────────────────
function ExportPanel({ jsx, onClose }: { jsx: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  useBodyScrollLock(true);

  async function handleCopy() {
    await navigator.clipboard.writeText(jsx);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileCode className="size-5 text-indigo-500" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">Exportar JSX</span>
            <span className="text-xs text-zinc-400 ml-1">— Lopes UI Builder</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4 text-zinc-500" />
          </button>
        </div>

        <div className="p-5">
          <pre className="bg-zinc-950 text-emerald-400 text-xs rounded-xl p-4 overflow-auto max-h-96 font-mono leading-relaxed whitespace-pre-wrap break-words">
            {jsx}
          </pre>
        </div>

        <div className="px-5 pb-5 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Copy className="size-3.5" />
            {copied ? "Copiado!" : "Copiar JSX"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── UIBuilder (main export) ────────────────────────────────────────────────────
export default function UIBuilder() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [showExport, setShowExport] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const jsx = buildJSX(state);
  const count = state.rows.length;

  function handleBetweenRowDrop(data: DragData, beforeRowId: string | null) {
    if (data.from === "toolbox") {
      dispatch({ type: "INSERT_ROW_AT", nodeType: data.nodeType, beforeRowId });
    } else if (data.from === "canvas-slot") {
      // Move the whole slot into a new row at given position
      dispatch({ type: "MOVE_SLOT", nodeId: data.nodeId, fromRowId: data.rowId, toRowId: null, beforeRowId });
    }
  }

  function handleCanvasDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
    e.dataTransfer.dropEffect = "move";
  }

  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    // Fallback: if dropped on empty canvas area (not on a zone), add to new row
    try {
      const raw = e.dataTransfer.getData("application/json");
      const data: DragData = JSON.parse(raw);
      if (data.from === "toolbox") {
        dispatch({ type: "ADD_TO_NEW_ROW", nodeType: data.nodeType });
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <Sparkles className="size-5 text-indigo-500" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Lopes UI Builder
          </span>
          <span className="text-[10px] font-medium text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
            {count} {count === 1 ? "linha" : "linhas"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "CLEAR" })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Novo
          </button>
          <button
            type="button"
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <FileCode className="size-3.5" />
            Exportar JSX
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Toolbox */}
        <ToolboxPanel dispatch={dispatch} rows={state.rows} selectedId={state.selectedId} />

        {/* Center: Canvas */}
        <div
          className="flex-1 overflow-y-auto p-5"
          style={{
            backgroundImage: "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          onDragOver={handleCanvasDragOver}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleCanvasDrop}
          onClick={() => dispatch({ type: "SELECT", id: null })}
        >
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div
                className={twMerge(
                  "w-28 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center mb-4 transition-all duration-200",
                  isDragging
                    ? "border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/20 scale-105"
                    : "border-zinc-300 dark:border-zinc-700",
                )}
              >
                <Plus
                  className={twMerge(
                    "size-10 transition-colors",
                    isDragging ? "text-indigo-400" : "text-zinc-300 dark:text-zinc-700",
                  )}
                />
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Arraste componentes aqui
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
                Use o painel esquerdo para começar
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              <BetweenRowZone
                beforeRowId={state.rows[0]?.id ?? null}
                active={isDragging}
                onDrop={handleBetweenRowDrop}
              />
              {state.rows.map((row, rowIdx) => (
                <React.Fragment key={row.id}>
                  <CanvasRowComponent
                    row={row}
                    rowIdx={rowIdx}
                    totalRows={state.rows.length}
                    nodes={state.nodes}
                    dispatch={dispatch}
                    selectedId={state.selectedId}
                  />
                  <BetweenRowZone
                    beforeRowId={state.rows[rowIdx + 1]?.id ?? null}
                    active={isDragging}
                    onDrop={handleBetweenRowDrop}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right: Inspector */}
        <InspectorPanel
          selectedId={state.selectedId}
          nodes={state.nodes}
          rows={state.rows}
          dispatch={dispatch}
        />
      </div>

      {showExport && <ExportPanel jsx={jsx} onClose={() => setShowExport(false)} />}
    </div>
  );
}
