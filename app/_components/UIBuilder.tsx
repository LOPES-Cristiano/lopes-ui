"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  LayoutTemplate,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Eye,
  Code2,
  Settings2,
  ChevronUp,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  Laptop,
  Layers,
  Save,
  RotateCcw,
  Search,
  Filter,
  BarChart3,
  Table as TableIcon,
  CheckSquare,
  AlertCircle,
  HelpCircle,
  Kanban,
  FileText,
  Clock,
  Building2,
  Package,
  Calendar,
  CalendarDays,
  X,
  ExternalLink,
  GitCommit,
  ListOrdered,
  FolderTree,
  Activity,
  ShieldAlert,
  PanelRight,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Terminal,
  Zap,
  Tag,
  Share2,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  User,
  MoreVertical,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Type,
  Hash,
  Mail,
  ToggleRight,
  GripVertical,
  Edit3,
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import Alert from "@/components/Alert";
import EmptyState from "@/components/EmptyState";
import Breadcrumb from "@/components/Breadcrumb";
import Timeline from "@/components/Timeline";
import ActivityFeed from "@/components/ActivityFeed";
import Stepper from "@/components/Stepper";
import Accordion from "@/components/Accordion";
import TreeView from "@/components/TreeView";
import ServiceStatusCard from "@/components/ServiceStatusCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import Drawer from "@/components/Drawer";
import CodeBlock from "@/components/CodeBlock";
import QuickActions from "@/components/QuickActions";
import TransferList from "@/components/TransferList";
import { FormModal, FormModalHeader, FormModalBody, FormModalActions } from "@/components/patterns/form-modal/FormModal";

// ── Types ──────────────────────────────────────────────────────────────────────

export type BlockType =
  | "page_header"
  | "breadcrumb"
  | "card_container"
  | "kpi_grid"
  | "filter_bar"
  | "data_table"
  | "form_section"
  | "transfer_list"
  | "kanban"
  | "timeline"
  | "activity_feed"
  | "stepper"
  | "accordion"
  | "tree_view"
  | "service_status"
  | "modal_cta"
  | "confirm_dialog_cta"
  | "drawer_cta"
  | "alert_box"
  | "empty_state"
  | "code_block"
  | "badges_showcase";

export type FormFieldType =
  | "text"
  | "number"
  | "email"
  | "select"
  | "textarea"
  | "date"
  | "switch"
  | "checkbox";

export interface FormFieldConfig {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  span?: 1 | 2 | 3 | 4; // grid column span
  options?: string[]; // For select dropdowns
  defaultValue?: string | boolean;
}

export interface BuilderBlock {
  id: string;
  type: BlockType;
  title: string;
  props: Record<string, any>;
}

export type CategoryKey = "all" | "layout" | "data" | "forms" | "overlays" | "feedback";
export type ViewportMode = "desktop" | "laptop" | "tablet" | "mobile";

// ── Presets ────────────────────────────────────────────────────────────────────

export const PRESETS: { id: string; name: string; desc: string; icon: any; blocks: BuilderBlock[] }[] = [
  {
    id: "dashboard_vendas",
    name: "Dashboard de Vendas & Lojas (RO/AM)",
    desc: "Visão executiva de faturamento de móveis, estofados, dormitórios e pedidos das lojas de Rondônia e Amazonas.",
    icon: BarChart3,
    blocks: [
      {
        id: "b_bread",
        type: "breadcrumb",
        title: "Trilha de Navegação (Breadcrumb)",
        props: {
          item1: "Início",
          item2: "Comercial",
          item3: "Vendas & Pedidos de Móveis",
        },
      },
      {
        id: "b1",
        type: "page_header",
        title: "Cabeçalho de Página",
        props: {
          title: "Painel de Vendas - Lopes Corp",
          subtitle: "Acompanhamento consolidado de vendas, dormitórios, estofados e pedidos das lojas de RO e AM.",
          badge: "Varejo de Móveis",
          badgeTone: "success",
          primaryAction: "Exportar Relatório",
          secondaryAction: "Atualizar Dados",
        },
      },
      {
        id: "b2",
        type: "kpi_grid",
        title: "Grid de Indicadores (KPIs)",
        props: {
          kpi1_title: "Faturamento Móveis & Eletro",
          kpi1_value: "R$ 3.845.200",
          kpi1_trend: "14.2",
          kpi1_subtitle: "vs. mês anterior",
          kpi2_title: "Pedidos de Dormitórios/Salas",
          kpi2_value: "1.420",
          kpi2_trend: "8.5",
          kpi2_subtitle: "Meta de 1.500",
          kpi3_title: "Ticket Médio (Móveis)",
          kpi3_value: "R$ 2.450",
          kpi3_trend: "-2.1",
          kpi3_subtitle: "Estável",
          kpi4_title: "Lojas Rondônia & Amazonas",
          kpi4_value: "28 lojas",
          kpi4_trend: "3.5",
          kpi4_subtitle: "Neste mês",
        },
      },
      {
        id: "b3",
        type: "filter_bar",
        title: "Barra de Filtros e Busca",
        props: {
          searchPlaceholder: "Buscar por cliente, pedido, sofá, dormitório ou CPF...",
          filter1Label: "Status da Montagem",
          filter2Label: "Filial (Porto Velho / Manaus / Ji-Paraná)",
        },
      },
      {
        id: "b4",
        type: "data_table",
        title: "Tabela de Pedidos de Móveis",
        props: {
          title: "Últimos Pedidos Emitidos (Lojas RO/AM)",
          totalCount: "1.420 registros encontrados",
        },
      },
    ],
  },
  {
    id: "cadastro_completo",
    name: "Formulário Rico de Cadastro (Móveis/Clientes)",
    desc: "Cadastro completo com seções, campos de texto, números, selects de filiais, datas e switches.",
    icon: FileText,
    blocks: [
      {
        id: "b1",
        type: "page_header",
        title: "Cabeçalho de Formulário",
        props: {
          title: "Novo Pedido & Cadastro de Venda",
          subtitle: "Preencha as informações do cliente, produtos selecionados e agendamento de entrega/montagem.",
          badge: "Nova Venda",
          badgeTone: "primary",
          primaryAction: "Salvar Pedido",
          secondaryAction: "Voltar para Lista",
        },
      },
      {
        id: "b_form",
        type: "form_section",
        title: "Formulário Estruturado",
        props: {
          sectionTitle: "Dados da Venda & Cliente",
          sectionSubtitle: "Identificação do comprador e detalhes de faturamento.",
          columns: 4,
          submitLabel: "Confirmar Pedido & Faturar",
          cancelLabel: "Cancelar Operação",
          fields: [
            { id: "f1", type: "text", label: "Nome Completo do Cliente", placeholder: "Ex: João Silva da Rocha", span: 2, required: true },
            { id: "f2", type: "text", label: "CPF / CNPJ", placeholder: "000.000.000-00", span: 1, required: true },
            { id: "f3", type: "select", label: "Filial de Atendimento", options: ["Porto Velho Centro", "Ji-Paraná", "Ariquemes", "Cacoal", "Manaus Flores"], span: 1, required: true },
            { id: "f4", type: "email", label: "E-mail de Contato", placeholder: "cliente@exemplo.com.br", span: 2, required: false },
            { id: "f5", type: "text", label: "Telefone / WhatsApp", placeholder: "(69) 99999-0000", span: 1, required: true },
            { id: "f6", type: "date", label: "Data de Agendamento da Entrega", span: 1, required: true },
            { id: "f7", type: "textarea", label: "Observações da Montagem & Referência", placeholder: "Ex: Entregar após as 14h, condomínio com elevador de carga...", span: 4, required: false },
            { id: "f8", type: "switch", label: "Incluir Serviço de Montagem Especializada Gratuita", helperText: "Equipe técnica Lopes Corp credenciada", span: 2, defaultValue: true },
            { id: "f9", type: "switch", label: "Emitir Notificação via WhatsApp para o Cliente", helperText: "Rastreio em tempo real pela BR-364 / BR-319", span: 2, defaultValue: true },
          ],
        },
      },
    ],
  },
  {
    id: "operacao_estoque",
    name: "Expedição, Logística & Montagem",
    desc: "Mesa de controle de expedição CD Porto Velho, rotas BR-364 / BR-319 e montagem de móveis.",
    icon: Package,
    blocks: [
      {
        id: "b1",
        type: "page_header",
        title: "Cabeçalho de Página",
        props: {
          title: "Mesa de Expedição, Rotas & Montagem (RO/AM)",
          subtitle: "Controle de volumes, saídas de móveis e agendamento de montagem residencial.",
          badge: "CD Porto Velho Matriz",
          badgeTone: "info",
          primaryAction: "Nova Remessa",
          secondaryAction: "Conferência de Carga",
        },
      },
      {
        id: "b_stepper",
        type: "stepper",
        title: "Passo a Passo (Stepper)",
        props: {
          step1: "Separação no CD Porto Velho",
          step2: "Conferência de Volumes",
          step3: "Expedição & Rota BR-364",
          step4: "Montagem Residencial",
          activeStep: "2",
        },
      },
      {
        id: "b2",
        type: "alert_box",
        title: "Alerta de Rota Logística",
        props: {
          tone: "warning",
          title: "Atenção na rota Ji-Paraná / Cacoal pela BR-364",
          description: "O caminhão de entrega de estofados reportou lentidão próximo a Ouro Preto do Oeste.",
        },
      },
      {
        id: "b3",
        type: "kanban",
        title: "Fluxo de Montagem & Entregas",
        props: {
          col1: "Aguardando Separação (12)",
          col2: "Em Rota / BR-364 (18)",
          col3: "Agendado p/ Montagem (14)",
          col4: "Montagem Concluída (52)",
        },
      },
    ],
  },
  {
    id: "auditoria_historico",
    name: "Auditoria Fiscal SEFAZ RO/AM & Logs",
    desc: "Trilha de emissão de NF-e, autorização SEFAZ Rondônia / Amazonas e status do ERP Lopes Corp.",
    icon: Clock,
    blocks: [
      {
        id: "b1",
        type: "page_header",
        title: "Cabeçalho de Página",
        props: {
          title: "Auditoria de Segurança & Trilha Fiscal",
          subtitle: "Logs detalhados de compliance, emissão de NF-e e integridade dos microsserviços do ERP Lopes Corp.",
          badge: "SEFAZ RO / AM Online",
          badgeTone: "success",
          primaryAction: "Exportar Log CSV",
        },
      },
      {
        id: "b_service",
        type: "service_status",
        title: "Status de Serviço & API",
        props: {
          serviceName: "API de Emissão NF-e (SEFAZ Rondônia / Amazonas)",
          status: "operational",
          latencyMs: "52",
          uptimePct: "99.98",
        },
      },
      {
        id: "b_timeline",
        type: "timeline",
        title: "Linha do Tempo (Timeline)",
        props: {
          item1_title: "Emissão de Nota Fiscal #8942",
          item1_desc: "Chave autorizada com sucesso pelo SEFAZ RO (Porto Velho).",
          item1_date: "Hoje às 14:32",
          item2_title: "Agendamento de Montagem de Móveis",
          item2_desc: "Equipe de montagem designada para cliente em Ji-Paraná.",
          item2_date: "Hoje às 11:15",
          item3_title: "Transferência entre Filiais",
          item3_desc: "Remessa enviada do CD Porto Velho para Loja Manaus Flores.",
          item3_date: "Ontem às 18:40",
        },
      },
    ],
  },
];

// ── Component Catalog Definition ───────────────────────────────────────────────

interface CatalogItem {
  type: BlockType;
  label: string;
  category: "layout" | "data" | "forms" | "overlays" | "feedback";
  icon: any;
  color: string;
  desc: string;
}

const CATALOG_ITEMS: CatalogItem[] = [
  // Layout & Estrutura
  { type: "page_header", label: "PageHeader", category: "layout", icon: FileText, color: "text-blue-500", desc: "Cabeçalho com título, badge, subtítulo e botões" },
  { type: "breadcrumb", label: "Breadcrumb", category: "layout", icon: ChevronRight, color: "text-sky-500", desc: "Trilha de navegação hierárquica em migalhas" },
  { type: "card_container", label: "Card Container", category: "layout", icon: Layers, color: "text-indigo-500", desc: "Painel estruturado com cabeçalho, corpo e rodapé" },
  
  // Dados & Métricas
  { type: "kpi_grid", label: "Grid de StatCards (KPIs)", category: "data", icon: BarChart3, color: "text-emerald-500", desc: "4 indicadores chave com tendências e valores" },
  { type: "data_table", label: "DataTable", category: "data", icon: TableIcon, color: "text-indigo-500", desc: "Tabela com cabeçalho, linhas e StatusBadges" },
  { type: "kanban", label: "Kanban Board", category: "data", icon: Kanban, color: "text-rose-500", desc: "Quadro de fluxo em 4 colunas com cartões arrastáveis" },
  { type: "timeline", label: "Timeline", category: "data", icon: Clock, color: "text-amber-500", desc: "Linha do tempo cronológica com eventos e ícones" },
  { type: "activity_feed", label: "ActivityFeed", category: "data", icon: Activity, color: "text-teal-500", desc: "Feed de atividades de usuários com avatares e timestamps" },
  { type: "stepper", label: "Stepper (Etapas)", category: "data", icon: ListOrdered, color: "text-purple-500", desc: "Passo a passo sequencial com etapas concluídas" },
  { type: "accordion", label: "Accordion", category: "data", icon: ChevronDown, color: "text-cyan-500", desc: "Seções sanfonadas expansíveis com badges" },
  { type: "tree_view", label: "TreeView", category: "data", icon: FolderTree, color: "text-lime-500", desc: "Árvore hierárquica de pastas, arquivos e departamentos" },
  { type: "service_status", label: "ServiceStatusCard", category: "data", icon: CheckCircle2, color: "text-green-500", desc: "Monitor de saúde e latência de APIs e serviços" },

  // Formulários & Seleção
  { type: "form_section", label: "FormSection (Customizável)", category: "forms", icon: CheckSquare, color: "text-violet-500", desc: "Formulário rico com campos, colunas e validações dinâmicas" },
  { type: "transfer_list", label: "TransferList (Dual List)", category: "forms", icon: ArrowRight, color: "text-amber-500", desc: "Seleção e transferência em 2 colunas para usuários, filiais e permissões" },
  { type: "filter_bar", label: "FilterBar & Search", category: "forms", icon: Search, color: "text-sky-500", desc: "Barra de filtros combinados com campo de busca" },

  // Modais & Overlays
  { type: "modal_cta", label: "FormModal (Canônico)", category: "overlays", icon: ExternalLink, color: "text-blue-600", desc: "Modal canônico Radix com acessibilidade e z-index unificado" },
  { type: "confirm_dialog_cta", label: "ConfirmDialog", category: "overlays", icon: ShieldAlert, color: "text-red-500", desc: "Diálogo de alerta / confirmação de ação crítica" },
  { type: "drawer_cta", label: "Drawer (Gaveta Lateral)", category: "overlays", icon: PanelRight, color: "text-orange-500", desc: "Painel lateral deslizante com backdrop e foco seguro" },

  // Feedback & Status
  { type: "alert_box", label: "Alert Banner", category: "feedback", icon: AlertTriangle, color: "text-amber-500", desc: "Avisos contextuais (info, success, warning, danger)" },
  { type: "empty_state", label: "EmptyState", category: "feedback", icon: HelpCircle, color: "text-zinc-500", desc: "Estado vazio amigável com botão de ação rápida" },
  { type: "code_block", label: "CodeBlock", category: "feedback", icon: Terminal, color: "text-slate-600", desc: "Bloco de código ou JSON com syntax highlight e cópia" },
];

function generateBlockId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `b_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function UIBuilder() {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(PRESETS[0].blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(PRESETS[0].blocks[1]?.id ?? null);
  const [activeTab, setActiveTab] = useState<"visual" | "code">("visual");
  const [catalogCategory, setCatalogCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);

  const [copied, setCopied] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewConfirmOpen, setPreviewConfirmOpen] = useState(false);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);

  // Keyboard shortcut: Escape to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  const filteredCatalog = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      const matchesCat = catalogCategory === "all" || item.category === catalogCategory;
      const matchesSearch =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [catalogCategory, searchQuery]);

  // ── Block Management ──────────────────────────────────────────────────────────

  const addBlock = (type: BlockType) => {
    const newId = generateBlockId();
    let newBlock: BuilderBlock;

    switch (type) {
      case "page_header":
        newBlock = {
          id: newId,
          type,
          title: "Cabeçalho de Página",
          props: {
            title: "Nova Página Customizada",
            subtitle: "Descrição e contexto operacional da funcionalidade.",
            badge: "Lopes Corp",
            badgeTone: "primary",
            primaryAction: "Salvar Alterações",
            secondaryAction: "Cancelar",
          },
        };
        break;

      case "breadcrumb":
        newBlock = {
          id: newId,
          type,
          title: "Trilha de Navegação (Breadcrumb)",
          props: {
            item1: "Início",
            item2: "Comercial",
            item3: "Nova Tela",
          },
        };
        break;

      case "card_container":
        newBlock = {
          id: newId,
          type,
          title: "Painel Estruturado (Card)",
          props: {
            cardTitle: "Informações Gerais da Loja",
            cardSubtitle: "Filial Porto Velho Centro",
            cardContent: "Este painel agrupa informações críticas com bordas suaves e elevação padronizada.",
            footerAction: "Gerenciar Filial",
          },
        };
        break;

      case "kpi_grid":
        newBlock = {
          id: newId,
          type,
          title: "Grid de Indicadores (KPIs)",
          props: {
            kpi1_title: "Faturamento Móveis",
            kpi1_value: "R$ 3.845.200",
            kpi1_trend: "14.2",
            kpi1_subtitle: "vs. mês anterior",
            kpi2_title: "Pedidos Emitidos",
            kpi2_value: "1.420",
            kpi2_trend: "8.5",
            kpi2_subtitle: "Meta atingida",
            kpi3_title: "Ticket Médio",
            kpi3_value: "R$ 2.450",
            kpi3_trend: "-2.1",
            kpi3_subtitle: "Estável",
            kpi4_title: "Lojas Ativas",
            kpi4_value: "28 lojas",
            kpi4_trend: "3.5",
            kpi4_subtitle: "Rondônia & Amazonas",
          },
        };
        break;

      case "filter_bar":
        newBlock = {
          id: newId,
          type,
          title: "Barra de Filtros e Busca",
          props: {
            searchPlaceholder: "Buscar por cliente, produto, pedido ou CPF...",
            filter1Label: "Status do Pedido",
            filter2Label: "Filial (RO / AM)",
          },
        };
        break;

      case "data_table":
        newBlock = {
          id: newId,
          type,
          title: "Tabela de Dados (DataTable)",
          props: {
            title: "Listagem de Pedidos Recentes",
            totalCount: "1.420 registros encontrados",
          },
        };
        break;

      case "form_section":
        newBlock = {
          id: newId,
          type,
          title: "Formulário Estruturado (FormSection)",
          props: {
            sectionTitle: "Formulário de Cadastro",
            sectionSubtitle: "Preencha as informações com validações instantâneas.",
            columns: 3,
            submitLabel: "Salvar Dados",
            cancelLabel: "Cancelar",
            fields: [
              { id: "f1", type: "text", label: "Nome / Descrição", placeholder: "Ex: Sofá Retrátil 4 Lugares", span: 2, required: true },
              { id: "f2", type: "number", label: "Código de Referência", placeholder: "Ex: 89412", span: 1, required: true },
              { id: "f3", type: "select", label: "Categoria do Móvel", options: ["Salas de Estar", "Dormitórios", "Salas de Jantar", "Colchões", "Eletros"], span: 1, required: true },
              { id: "f4", type: "select", label: "Filial Responsável", options: ["Porto Velho", "Ji-Paraná", "Manaus", "Ariquemes"], span: 1, required: true },
              { id: "f5", type: "date", label: "Previsão de Entrega", span: 1, required: true },
              { id: "f6", type: "textarea", label: "Observações do Produto", placeholder: "Detalhes de montagem ou tecido...", span: 3, required: false },
              { id: "f7", type: "switch", label: "Disponível para Pronta Entrega", helperText: "Estoque no CD Porto Velho", span: 3, defaultValue: true },
            ],
          },
        };
        break;
      case "transfer_list":
        newBlock = {
          id: newId,
          type,
          title: "TransferList (Seleção em Duas Colunas)",
          props: {
            sourceTitle: "Usuários com Acesso à Filial",
            targetTitle: "Colaboradores Disponíveis",
            sourceItems: [
              { id: "1", title: "Marcos Vinícius Silva", subtitle: "Gerente Comercial - Porto Velho", tag: "GERENTE", tagTone: "primary" },
              { id: "2", title: "Ana Paula Souza", subtitle: "Supervisora de Vendas - Ji-Paraná", tag: "SUPERVISOR", tagTone: "success" },
            ],
            targetItems: [
              { id: "3", title: "Lucas Lima Rocha", subtitle: "Consultor de Dormitórios - Ariquemes", tag: "VENDEDOR", tagTone: "info" },
              { id: "4", title: "Patrícia Menezes", subtitle: "Atendimento & Montagem - Manaus", tag: "SUPORTE", tagTone: "warning" },
              { id: "5", title: "Carlos Eduardo Costa", subtitle: "Expedição CD Porto Velho", tag: "ESTOQUE", tagTone: "neutral" },
            ],
            height: 380,
          },
        };
        break;

      case "kanban":
        newBlock = {
          id: newId,
          type,
          title: "Quadro de Fluxo (Kanban)",
          props: {
            col1: "Aguardando Separação (12)",
            col2: "Em Rota / BR-364 (18)",
            col3: "Agendado p/ Montagem (14)",
            col4: "Montagem Concluída (52)",
          },
        };
        break;

      case "timeline":
        newBlock = {
          id: newId,
          type,
          title: "Linha do Tempo (Timeline)",
          props: {
            item1_title: "Emissão de Nota Fiscal #8942",
            item1_desc: "Chave autorizada pelo SEFAZ RO (Porto Velho).",
            item1_date: "Hoje às 14:32",
            item2_title: "Agendamento de Montagem",
            item2_desc: "Equipe técnica designada para Ji-Paraná.",
            item2_date: "Hoje às 11:15",
            item3_title: "Transferência CD Porto Velho -> Manaus",
            item3_desc: "Carga de dormitórios despachada.",
            item3_date: "Ontem às 18:40",
          },
        };
        break;

      case "activity_feed":
        newBlock = {
          id: newId,
          type,
          title: "Feed de Atividades (ActivityFeed)",
          props: {
            event1_title: "Marcos Souza despachou o pedido #9041 (Sofá Retrátil)",
            event1_desc: "Carga liberada para filial Ji-Paraná pela BR-364.",
            event1_time: "Há 5 min",
            event2_title: "Equipe de Montagem 03 finalizou entrega em Porto Velho",
            event2_desc: "Montagem de dormitório concluída com assinatura do cliente.",
            event2_time: "Há 2 horas",
          },
        };
        break;

      case "stepper":
        newBlock = {
          id: newId,
          type,
          title: "Passo a Passo (Stepper)",
          props: {
            step1: "Separação no CD",
            step2: "Conferência de Volumes",
            step3: "Expedição & Rota",
            step4: "Montagem Residencial",
            activeStep: "2",
          },
        };
        break;

      case "accordion":
        newBlock = {
          id: newId,
          type,
          title: "Accordion (Sanfona)",
          props: {
            item1_title: "Políticas de Entrega e Montagem (Rondônia & Amazonas)",
            item1_content: "Prazos de entrega por rotas rodoviárias (BR-364) e fluviais (Manaus). Montagem gratuita inclusa em compras de móveis.",
            item2_title: "Garantia e Assistência Técnica de Estofados e Móveis",
            item2_content: "Procedimentos para solicitação de assistência e reposição de peças de fábrica.",
          },
        };
        break;

      case "tree_view":
        newBlock = {
          id: newId,
          type,
          title: "Estrutura Hierárquica (TreeView)",
          props: {
            rootLabel: "Matriz Lopes Corp (Matriz)",
            child1: "Lojas Rondônia (Porto Velho, Ji-Paraná, Ariquemes, Cacoal)",
            child2: "Lojas Amazonas (Manaus Centro, Flores, Manauara)",
            child3: "Centro de Distribuição Principal (CD Porto Velho)",
          },
        };
        break;

      case "service_status":
        newBlock = {
          id: newId,
          type,
          title: "Monitor de Serviço (ServiceStatusCard)",
          props: {
            serviceName: "API de Emissão NF-e (SEFAZ Rondônia / Amazonas)",
            status: "operational",
            latencyMs: "52",
            uptimePct: "99.98",
          },
        };
        break;

      case "modal_cta":
        newBlock = {
          id: newId,
          type,
          title: "Modal Canônico (Preview)",
          props: {
            modalTitle: "Diálogo de Confirmação",
            modalSubtitle: "Revise os dados antes de prosseguir.",
            triggerLabel: "Abrir FormModal Canônico",
          },
        };
        break;

      case "confirm_dialog_cta":
        newBlock = {
          id: newId,
          type,
          title: "ConfirmDialog (Alerta)",
          props: {
            dialogTitle: "Deseja realmente excluir este registro?",
            dialogDescription: "Esta operação é irreversível e removerá todos os vínculos no banco de dados.",
            variant: "danger",
            triggerLabel: "Testar ConfirmDialog",
          },
        };
        break;

      case "drawer_cta":
        newBlock = {
          id: newId,
          type,
          title: "Drawer (Painel Lateral)",
          props: {
            drawerTitle: "Detalhes do Registro",
            drawerDescription: "Visualização rápida de propriedades complementares.",
            triggerLabel: "Abrir Drawer Lateral",
          },
        };
        break;

      case "alert_box":
        newBlock = {
          id: newId,
          type,
          title: "Alerta Informativo",
          props: {
            tone: "info",
            title: "Aviso importante do sistema",
            description: "Esta alteração refletirá em todos os relatórios consolidados das lojas.",
          },
        };
        break;

      case "empty_state":
        newBlock = {
          id: newId,
          type,
          title: "Estado Vazio (Empty State)",
          props: {
            title: "Nenhum dado encontrado",
            description: "Comece cadastrando o primeiro item para visualizar o painel.",
            actionLabel: "Cadastrar Primeiro Item",
          },
        };
        break;

      case "code_block":
        newBlock = {
          id: newId,
          type,
          title: "CodeBlock (Exibição de Código)",
          props: {
            language: "json",
            filename: "payload.json",
            code: '{\n  "empresa": "Lopes Corp",\n  "estado": "RO",\n  "status": "success",\n  "transacaoId": "TRX-89412",\n  "valor": 14850.00\n}',
          },
        };
        break;

      case "badges_showcase":
        newBlock = {
          id: newId,
          type,
          title: "Mostruário de Badges & Status",
          props: {
            label1: "Aprovado",
            tone1: "success",
            label2: "Pendente",
            tone2: "warning",
            label3: "Em Análise",
            tone3: "info",
            label4: "Cancelado",
            tone4: "danger",
          },
        };
        break;

      default:
        newBlock = {
          id: newId,
          type,
          title: "Bloco Genérico",
          props: {},
        };
    }

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newId);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(blocks[0]?.id ?? null);
    }
  };

  const duplicateBlock = (id: string) => {
    const blockToDup = blocks.find((b) => b.id === id);
    if (!blockToDup) return;
    const newId = generateBlockId();
    const newBlock: BuilderBlock = {
      ...JSON.parse(JSON.stringify(blockToDup)),
      id: newId,
    };
    const index = blocks.findIndex((b) => b.id === id);
    const copy = [...blocks];
    copy.splice(index + 1, 0, newBlock);
    setBlocks(copy);
    setSelectedBlockId(newId);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const copy = [...blocks];
    const item = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = item;
    setBlocks(copy);
  };

  const updateProp = (key: string, value: any) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === selectedBlockId) {
          return {
            ...b,
            props: {
              ...b.props,
              [key]: value,
            },
          };
        }
        return b;
      })
    );
  };

  // ── Form Builder Field Manipulators ──────────────────────────────────────────

  const addFormField = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          const fields: FormFieldConfig[] = b.props.fields || [];
          const newField: FormFieldConfig = {
            id: `f_${Date.now()}`,
            type: "text",
            label: `Novo Campo ${fields.length + 1}`,
            placeholder: "Digite o valor...",
            span: 1,
            required: false,
          };
          return {
            ...b,
            props: {
              ...b.props,
              fields: [...fields, newField],
            },
          };
        }
        return b;
      })
    );
  };

  const updateFormField = (blockId: string, fieldId: string, updates: Partial<FormFieldConfig>) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          const fields: FormFieldConfig[] = b.props.fields || [];
          return {
            ...b,
            props: {
              ...b.props,
              fields: fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
            },
          };
        }
        return b;
      })
    );
  };

  const removeFormField = (blockId: string, fieldId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          const fields: FormFieldConfig[] = b.props.fields || [];
          return {
            ...b,
            props: {
              ...b.props,
              fields: fields.filter((f) => f.id !== fieldId),
            },
          };
        }
        return b;
      })
    );
  };

  const moveFormField = (blockId: string, index: number, direction: "up" | "down") => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          const fields: FormFieldConfig[] = [...(b.props.fields || [])];
          const targetIdx = direction === "up" ? index - 1 : index + 1;
          if (targetIdx < 0 || targetIdx >= fields.length) return b;
          const item = fields[index];
          fields[index] = fields[targetIdx];
          fields[targetIdx] = item;
          return {
            ...b,
            props: {
              ...b.props,
              fields,
            },
          };
        }
        return b;
      })
    );
  };

  // ── TSX Code Generator ────────────────────────────────────────────────────────

  const generatedCode = useMemo(() => {
    const imports = new Set<string>();
    imports.add("Button");

    blocks.forEach((b) => {
      switch (b.type) {
        case "page_header":
          imports.add("PageHeader");
          break;
        case "breadcrumb":
          imports.add("Breadcrumb");
          break;
        case "card_container":
          imports.add("Card");
          break;
        case "kpi_grid":
          imports.add("StatCard");
          break;
        case "data_table":
          imports.add("StatusBadge");
          break;
        case "form_section":
          imports.add("Card");
          break;
        case "transfer_list":
          imports.add("TransferList");
          break;
        case "timeline":
          imports.add("Timeline");
          break;
        case "activity_feed":
          imports.add("ActivityFeed");
          break;
        case "stepper":
          imports.add("Stepper");
          break;
        case "accordion":
          imports.add("Accordion");
          break;
        case "tree_view":
          imports.add("TreeView");
          break;
        case "service_status":
          imports.add("ServiceStatusCard");
          break;
        case "confirm_dialog_cta":
          imports.add("ConfirmDialog");
          break;
        case "drawer_cta":
          imports.add("Drawer");
          break;
        case "alert_box":
          imports.add("Alert");
          break;
        case "empty_state":
          imports.add("EmptyState");
          break;
        case "code_block":
          imports.add("CodeBlock");
          break;
        case "badges_showcase":
          imports.add("StatusBadge");
          imports.add("Badge");
          break;
      }
    });

    const hasFormModal = blocks.some((b) => b.type === "modal_cta");
    const importStatements = [
      `"use client";\n`,
      `import React, { useState } from "react";`,
      `import { ${Array.from(imports).join(", ")} } from "@/components/";`,
    ];

    if (hasFormModal) {
      importStatements.push(
        `import { FormModal, FormModalHeader, FormModalBody, FormModalActions } from "@/components/patterns/form-modal";`
      );
    }

    importStatements.push(`import { Search, Plus, Filter, Download, Sparkles } from "lucide-react";\n`);

    const blocksCode = blocks
      .map((block) => {
        const p = block.props;
        switch (block.type) {
          case "page_header":
            return `      {/* ── PageHeader ── */}
      <PageHeader
        title="${p.title || "Título"}"
        description="${p.subtitle || ""}"
        badge={<StatusBadge tone="${p.badgeTone || "primary"}">${p.badge || "Status"}</StatusBadge>}
        actions={
          <div className="flex items-center gap-2">
            ${p.secondaryAction ? `<Button componentId="erp.components.uibuilder.btn.psecondaryaction" variant="outline" size="md">${p.secondaryAction}</Button>` : ""}
            ${p.primaryAction ? `<Button componentId="erp.components.uibuilder.btn.pprimaryaction" variant="primary" size="md">${p.primaryAction}</Button>` : ""}
          </div>
        }
      />`;

          case "breadcrumb":
            return `      {/* ── Breadcrumb ── */}
      <Breadcrumb
        items={[
          { label: "${p.item1 || "Início"}", href: "#" },
          { label: "${p.item2 || "Comercial"}", href: "#" },
          { label: "${p.item3 || "Tela Atual"}" },
        ]}
      />`;

          case "card_container":
            return `      {/* ── Card Container ── */}
      <Card shadow="sm" radius="xl" className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="font-bold text-foreground text-base">${p.cardTitle || "Título do Card"}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">${p.cardSubtitle || "Subtítulo"}</p>
          </div>
          ${p.footerAction ? `<Button componentId="erp.components.uibuilder.btn.pfooteraction" variant="outline" size="sm">${p.footerAction}</Button>` : ""}
        </div>
        <div className="py-4 text-sm text-foreground">
          ${p.cardContent || "Conteúdo do Card..."}
        </div>
      </Card>`;

          case "kpi_grid":
            return `      {/* ── Grid de StatCards (KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="${p.kpi1_title || "Métrica 1"}"
          value="${p.kpi1_value || "0"}"
          trend={{ value: ${parseFloat(p.kpi1_trend) || 0}, label: "${p.kpi1_subtitle || "vs. anterior"}" }}
        />
        <StatCard
          title="${p.kpi2_title || "Métrica 2"}"
          value="${p.kpi2_value || "0"}"
          trend={{ value: ${parseFloat(p.kpi2_trend) || 0}, label: "${p.kpi2_subtitle || "vs. anterior"}" }}
        />
        <StatCard
          title="${p.kpi3_title || "Métrica 3"}"
          value="${p.kpi3_value || "0"}"
          trend={{ value: ${parseFloat(p.kpi3_trend) || 0}, label: "${p.kpi3_subtitle || "vs. anterior"}" }}
        />
        <StatCard
          title="${p.kpi4_title || "Métrica 4"}"
          value="${p.kpi4_value || "0"}"
          trend={{ value: ${parseFloat(p.kpi4_trend) || 0}, label: "${p.kpi4_subtitle || "vs. anterior"}" }}
        />
      </div>`;

          case "filter_bar":
            return `      {/* ── Barra de Busca & Filtros ── */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            data-component-id="erp.preview.search"
            placeholder="${p.searchPlaceholder || "Buscar..."}"
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button componentId="erp.preview.search.btn.filtro-1" variant="outline" size="md" leftIcon={<Filter size={15} />}>
            ${p.filter1Label || "Filtro 1"}
          </Button>
          <Button componentId="erp.preview.search.btn.filtro-2" variant="outline" size="md">
            ${p.filter2Label || "Filtro 2"}
          </Button>
        </div>
      </div>`;

          case "data_table":
            return `      {/* ── DataTable ── */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-sm">${p.title || "Tabela de Dados"}</h3>
            <p className="text-xs text-muted-foreground">${p.totalCount || "0 registros"}</p>
          </div>
          <Button componentId="erp.preview.table.btn.exportar" variant="outline" size="sm" leftIcon={<Download size={14} />}>Exportar</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Código / Ref</th>
                <th className="px-6 py-3">Descrição / Loja</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Valor Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-mono font-medium">#PED-8942</td>
                <td className="px-6 py-4 font-medium text-foreground">Lopes Corp - Loja Porto Velho Centro</td>
                <td className="px-6 py-4 text-muted-foreground">24/08/2026</td>
                <td className="px-6 py-4 font-semibold text-foreground">R$ 14.850,00</td>
                <td className="px-6 py-4">
                  <StatusBadge tone="success">FATURADO</StatusBadge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button componentId="erp.preview.table.btn.visualizar-1" variant="ghost" size="sm">Visualizar</Button>
                </td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-mono font-medium">#PED-8941</td>
                <td className="px-6 py-4 font-medium text-foreground">Lopes Corp - Filial Ji-Paraná</td>
                <td className="px-6 py-4 text-muted-foreground">24/08/2026</td>
                <td className="px-6 py-4 font-semibold text-foreground">R$ 8.240,00</td>
                <td className="px-6 py-4">
                  <StatusBadge tone="warning">EM SEPARAÇÃO</StatusBadge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button componentId="erp.preview.table.btn.visualizar-2" variant="ghost" size="sm">Visualizar</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;

          case "form_section": {
            const fields: FormFieldConfig[] = p.fields || [];
            const cols = p.columns || 3;
            return `      {/* ── FormSection (Formulário Customizado) ── */}
      <Card shadow="sm" radius="xl" className="p-6">
        <div className="pb-4 border-b border-border mb-6">
          <h3 className="font-bold text-foreground text-base">${p.sectionTitle || "Dados do Formulário"}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">${p.sectionSubtitle || "Preencha as informações obrigatórias."}</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-${cols} gap-4">
${fields
  .map((f) => {
    const spanClass = f.span && f.span > 1 ? ` md:col-span-${Math.min(f.span, cols)}` : "";
    if (f.type === "textarea") {
      return `          <div className="space-y-1.5${spanClass}">
            <label className="text-xs font-semibold text-foreground">${f.label}${f.required ? " *" : ""}</label>
            <textarea
              rows={3}
              data-component-id="erp.preview.form.${f.id}.textarea"
              placeholder="${f.placeholder || ""}"
              className="w-full px-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            ${f.helperText ? `<p className="text-[11px] text-muted-foreground">${f.helperText}</p>` : ""}
          </div>`;
    }
    if (f.type === "select") {
      return `          <div className="space-y-1.5${spanClass}">
            <label className="text-xs font-semibold text-foreground">${f.label}${f.required ? " *" : ""}</label>
            <select data-component-id="erp.preview.form.${f.id}.select" className="w-full px-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              ${(f.options || ["Opção 1", "Opção 2"]).map((opt) => `<option value="${opt}">${opt}</option>`).join("\n              ")}
            </select>
          </div>`;
    }
    if (f.type === "switch" || f.type === "checkbox") {
      return `          <div className="flex items-center justify-between p-3.5 bg-muted/20 border border-border rounded-xl${spanClass}">
            <div>
              <p className="text-xs font-semibold text-foreground">${f.label}</p>
              ${f.helperText ? `<p className="text-[11px] text-muted-foreground mt-0.5">${f.helperText}</p>` : ""}
            </div>
            <input type="checkbox" data-component-id="erp.preview.form.${f.id}.checkbox" defaultChecked={${f.defaultValue === true}} className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer" />
          </div>`;
    }
    return `          <div className="space-y-1.5${spanClass}">
            <label className="text-xs font-semibold text-foreground">${f.label}${f.required ? " *" : ""}</label>
            <input
              type="${f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "date" ? "date" : "text"}"
              data-component-id="erp.preview.form.${f.id}.input"
              placeholder="${f.placeholder || ""}"
              className="w-full px-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            ${f.helperText ? `<p className="text-[11px] text-muted-foreground">${f.helperText}</p>` : ""}
          </div>`;
  })
  .join("\n")}
          <div className="md:col-span-${cols} pt-4 border-t border-border flex items-center justify-end gap-3">
            ${p.cancelLabel ? `<Button componentId="erp.components.uibuilder.btn.pcancellabel" variant="outline" size="md">${p.cancelLabel}</Button>` : ""}
            <Button componentId="erp.preview.form.btn.salvar" variant="primary" size="md">${p.submitLabel || "Salvar"}</Button>
          </div>
        </form>
      </Card>`;
          }

          case "transfer_list":
            return `      {/* ── TransferList ── */}
      <TransferList
        sourceTitle="${p.sourceTitle || "Itens Vinculados"}"
        targetTitle="${p.targetTitle || "Itens Disponíveis"}"
        sourceItems={${JSON.stringify(p.sourceItems || [], null, 2)}}
        targetItems={${JSON.stringify(p.targetItems || [], null, 2)}}
        height={${p.height || 380}}
      />`;

          case "stepper":
            return `      {/* ── Stepper ── */}
      <Stepper
        steps={[
          { title: "${p.step1 || "Etapa 1"}", status: "completed" },
          { title: "${p.step2 || "Etapa 2"}", status: "current" },
          { title: "${p.step3 || "Etapa 3"}", status: "upcoming" },
          { title: "${p.step4 || "Etapa 4"}", status: "upcoming" },
        ]}
        activeStep={${parseInt(p.activeStep, 10) || 1}}
      />`;

          case "kanban":
            return `      {/* ── Kanban Board ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["${p.col1}", "${p.col2}", "${p.col3}", "${p.col4}"].map((colTitle, idx) => (
          <div key={idx} className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col gap-3">
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide">{colTitle}</h4>
            <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs space-y-2">
              <span className="text-xs font-mono font-bold text-primary">#ORD-10{idx}</span>
              <p className="text-xs font-medium text-foreground">Remessa para filial Ji-Paraná (Estofados & Dormitórios)</p>
            </div>
          </div>
        ))}
      </div>`;

          case "timeline":
            return `      {/* ── Timeline ── */}
      <Timeline
        items={[
          { title: "${p.item1_title || "Evento 1"}", description: "${p.item1_desc || ""}", date: "${p.item1_date || ""}", color: "primary" },
          { title: "${p.item2_title || "Evento 2"}", description: "${p.item2_desc || ""}", date: "${p.item2_date || ""}", color: "success" },
          { title: "${p.item3_title || "Evento 3"}", description: "${p.item3_desc || ""}", date: "${p.item3_date || ""}", color: "warning" },
        ]}
      />`;

          case "activity_feed":
            return `      {/* ── ActivityFeed ── */}
      <ActivityFeed
        events={[
          { id: "1", title: "${p.event1_title || "Atividade 1"}", description: "${p.event1_desc || ""}", timestamp: "${p.event1_time || ""}" },
          { id: "2", title: "${p.event2_title || "Atividade 2"}", description: "${p.event2_desc || ""}", timestamp: "${p.event2_time || ""}" },
        ]}
      />`;

          case "accordion":
            return `      {/* ── Accordion ── */}
      <Accordion
        items={[
          { title: "${p.item1_title || "Seção 1"}", content: <p className="text-xs text-muted-foreground">${p.item1_content || ""}</p>, defaultOpen: true },
          { title: "${p.item2_title || "Seção 2"}", content: <p className="text-xs text-muted-foreground">${p.item2_content || ""}</p> },
        ]}
      />`;

          case "tree_view":
            return `      {/* ── TreeView ── */}
      <TreeView
        items={[
          {
            id: "root",
            label: "${p.rootLabel || "Estrutura Principal"}",
            children: [
              { id: "c1", label: "${p.child1 || "Item 1"}" },
              { id: "c2", label: "${p.child2 || "Item 2"}" },
              { id: "c3", label: "${p.child3 || "Item 3"}" },
            ],
          },
        ]}
      />`;

          case "service_status":
            return `      {/* ── ServiceStatusCard ── */}
      <ServiceStatusCard
        name="${p.serviceName || "API de Microsserviço"}"
        status="${p.status || "operational"}"
        latencyMs={${parseInt(p.latencyMs, 10) || 45}}
        uptimePct={${parseFloat(p.uptimePct) || 99.9}}
      />`;

          case "alert_box":
            return `      {/* ── Alert ── */}
      <Alert
        variant="${p.tone || "info"}"
        title="${p.title || "Aviso"}"
        description="${p.description || ""}"
      />`;

          case "empty_state":
            return `      {/* ── EmptyState ── */}
      <EmptyState
        title="${p.title || "Nenhum registro"}"
        description="${p.description || ""}"
        actions={[
          { label: "${p.actionLabel || "Adicionar Registro"}", onClick: () => {} }
        ]}
      />`;

          case "code_block":
            return `      {/* ── CodeBlock ── */}
      <CodeBlock
        language="${p.language || "json"}"
        filename="${p.filename || "payload.json"}"
        code={\`${p.code || ""}\`}
        showCopy
      />`;

          case "badges_showcase":
            return `      {/* ── Badges & Status ── */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="${p.tone1 || "success"}">${p.label1 || "Sucesso"}</StatusBadge>
        <StatusBadge tone="${p.tone2 || "warning"}">${p.label2 || "Atenção"}</StatusBadge>
        <StatusBadge tone="${p.tone3 || "info"}">${p.label3 || "Informativo"}</StatusBadge>
        <StatusBadge tone="${p.tone4 || "danger"}">${p.label4 || "Crítico"}</StatusBadge>
      </div>`;

          default:
            return `      {/* ── Bloco ${block.type} ── */}`;
        }
      })
      .join("\n\n");

    return `${importStatements.join("\n")}\n
export default function DynamicPageGenerated() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
${blocksCode}
    </div>
  );
}`;
  }, [blocks]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DynamicPageGenerated.tsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Viewport max-width resolver
  const viewportWidthClass = useMemo(() => {
    switch (viewport) {
      case "mobile":
        return "max-w-[375px] shadow-2xl border-x border-border";
      case "tablet":
        return "max-w-[768px] shadow-2xl border-x border-border";
      case "laptop":
        return "max-w-[1024px] shadow-xl";
      case "desktop":
      default:
        return "max-w-7xl";
    }
  }, [viewport]);

  return (
    <div
      className={cn(
        "flex flex-col bg-background text-foreground transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-[6000] w-screen h-screen overflow-hidden"
          : "min-h-[calc(100vh-4rem)] relative"
      )}
    >
      {/* ── Top App Bar / Tooling Header ── */}
      <header className="h-14 border-b border-border bg-card/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Toggle Left Sidebar Button */}
          <button
            type="button"
            data-component-id="erp.uibuilder.header.toggle-left-sidebar"
            onClick={() => setLeftSidebarOpen((prev) => !prev)}
            title={leftSidebarOpen ? "Recolher Catálogo Lateral" : "Expandir Catálogo Lateral"}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-border/60"
          >
            {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight flex items-center gap-2">
                UI Builder & Prototyper
                <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
                  Lopes UI
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {blocks.length} blocos ativos no canvas • Lopes UI
              </p>
            </div>
          </div>
        </div>

        {/* Center: Viewport & Zoom Controls */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Viewport Selectors */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              data-component-id="erp.uibuilder.viewport.desktop"
              onClick={() => setViewport("desktop")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                viewport === "desktop" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Desktop (100% / 1280px+)"
            >
              <Monitor size={14} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              data-component-id="erp.uibuilder.viewport.laptop"
              onClick={() => setViewport("laptop")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                viewport === "laptop" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Laptop (1024px)"
            >
              <Laptop size={14} />
              <span>Laptop</span>
            </button>
            <button
              type="button"
              data-component-id="erp.uibuilder.viewport.tablet"
              onClick={() => setViewport("tablet")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                viewport === "tablet" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Tablet (768px)"
            >
              <Tablet size={14} />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              data-component-id="erp.uibuilder.viewport.mobile"
              onClick={() => setViewport("mobile")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                viewport === "mobile" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Mobile (375px)"
            >
              <Smartphone size={14} />
              <span>Mobile</span>
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              data-component-id="erp.uibuilder.zoom.out"
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              title="Reduzir Zoom"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 text-[11px] font-mono font-medium text-foreground">{zoomLevel}%</span>
            <button
              type="button"
              data-component-id="erp.uibuilder.zoom.in"
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 135))}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

        {/* Right: Fullscreen, Tabs & Actions */}
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <div className="hidden xl:flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Modelo:</span>
            <select
              data-component-id="erp.uibuilder.header.preset"
              onChange={(e) => {
                const preset = PRESETS.find((p) => p.id === e.target.value);
                if (preset) {
                  setBlocks(preset.blocks);
                  setSelectedBlockId(preset.blocks[0]?.id ?? null);
                }
              }}
              className="text-xs bg-background border border-input rounded-xl px-2.5 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
            <button
              type="button"
              data-component-id="erp.uibuilder.tab.visual"
              onClick={() => setActiveTab("visual")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                activeTab === "visual"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye size={13} />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              data-component-id="erp.uibuilder.tab.code"
              onClick={() => setActiveTab("code")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                activeTab === "code"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 size={13} />
              <span>Código TSX</span>
            </button>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            data-component-id="erp.uibuilder.header.fullscreen"
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? "Sair da Tela Cheia (Esc)" : "Modo Tela Cheia"}
            className={cn(
              "p-2 rounded-xl border border-border/60 transition-colors cursor-pointer",
              isFullscreen
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Toggle Right Inspector Button */}
          <button
            type="button"
            data-component-id="erp.uibuilder.header.toggle-right-sidebar"
            onClick={() => setRightSidebarOpen((prev) => !prev)}
            title={rightSidebarOpen ? "Recolher Painel de Propriedades" : "Expandir Painel de Propriedades"}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-border/60"
          >
            {rightSidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Sidebar: Component Catalog (Collapsible) ── */}
        <aside
          className={cn(
            "border-r border-border bg-card flex flex-col shrink-0 transition-all duration-300 overflow-hidden",
            leftSidebarOpen ? "w-80" : "w-0 p-0 border-r-0"
          )}
        >
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <LayoutTemplate size={14} className="text-primary" />
                Catálogo de Blocos
              </span>
              <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                {CATALOG_ITEMS.length} itens
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                data-component-id="erp.uibuilder.catalog.search"
                placeholder="Buscar componente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {(
                [
                  { key: "all", label: "Todos" },
                  { key: "layout", label: "Layout" },
                  { key: "data", label: "Dados" },
                  { key: "forms", label: "Forms" },
                  { key: "overlays", label: "Modais" },
                  { key: "feedback", label: "Feedback" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  data-component-id={`erp.uibuilder.catalog.category.${cat.key}`}
                  onClick={() => setCatalogCategory(cat.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer",
                    catalogCategory === cat.key
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Item Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCatalog.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  className="group flex items-start gap-3 p-3 bg-muted/20 hover:bg-muted/50 border border-border/60 hover:border-primary/40 rounded-2xl transition-all cursor-pointer"
                  onClick={() => addBlock(item.type)}
                >
                  <div className={cn("p-2 rounded-xl bg-background border border-border/80 shrink-0", item.color)}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <Plus size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Center: Interactive Canvas / Code Tab ── */}
        <main className="flex-1 bg-muted/20 overflow-y-auto flex flex-col items-center p-4 md:p-6 transition-all">
          {activeTab === "visual" ? (
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className={cn(
                "w-full transition-all duration-200 space-y-6 min-h-[600px] bg-background/50 backdrop-blur-xs p-4 md:p-6 rounded-3xl border border-border/60",
                viewportWidthClass
              )}
            >
              {/* Resolution Helper Badge when not desktop */}
              {viewport !== "desktop" && (
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted/80 px-3 py-1 rounded-full border border-border">
                    {viewport === "mobile" && "📱 Mobile (375px)"}
                    {viewport === "tablet" && "📱 Tablet (768px)"}
                    {viewport === "laptop" && "💻 Laptop (1024px)"}
                  </span>
                </div>
              )}

              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="p-4 bg-muted/40 text-muted-foreground rounded-3xl">
                    <LayoutTemplate size={36} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">Nenhum componente na tela</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Clique em qualquer bloco do catálogo à esquerda para começar a montar o layout.
                  </p>
                </div>
              ) : (
                blocks.map((block, index) => {
                  const isSelected = block.id === selectedBlockId;
                  const p = block.props;

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={cn(
                        "group relative transition-all rounded-2xl cursor-pointer",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "hover:ring-1 hover:ring-primary/40"
                      )}
                    >
                      {/* Floating Block Actions Bar */}
                      <div className="absolute -top-3.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-card/95 backdrop-blur-md border border-border shadow-md rounded-xl p-1 flex items-center gap-1 z-30">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 text-muted-foreground">
                          {block.title}
                        </span>
                        <button
                          type="button"
                          data-component-id={`erp.uibuilder.block.${block.id}.move-up`}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(index, "up");
                          }}
                          disabled={index === 0}
                          title="Mover para Cima"
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          data-component-id={`erp.uibuilder.block.${block.id}.move-down`}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(index, "down");
                          }}
                          disabled={index === blocks.length - 1}
                          title="Mover para Baixo"
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          data-component-id={`erp.uibuilder.block.${block.id}.duplicate`}
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateBlock(block.id);
                          }}
                          title="Duplicar Bloco"
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          data-component-id={`erp.uibuilder.block.${block.id}.delete`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBlock(block.id);
                          }}
                          title="Excluir Bloco"
                          className="p-1 hover:bg-destructive/10 rounded text-destructive cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* ── 1. PageHeader ── */}
                      {block.type === "page_header" && (
                        <PageHeader
                          title={p.title || "Título da Página"}
                          description={p.subtitle || "Subtítulo explicativo do contexto"}
                          badge={<StatusBadge tone={p.badgeTone || "primary"}>{p.badge || "Status"}</StatusBadge>}
                          actions={
                            <div className="flex items-center gap-2">
                              {p.secondaryAction && (
                                <Button componentId="erp.components.uibuilder.btn.psecondaryaction-2" variant="outline" size="md">
                                  {p.secondaryAction}
                                </Button>
                              )}
                              {p.primaryAction && (
                                <Button componentId="erp.components.uibuilder.btn.pprimaryaction-2" variant="primary" size="md">
                                  {p.primaryAction}
                                </Button>
                              )}
                            </div>
                          }
                        />
                      )}

                      {/* ── 2. Breadcrumb ── */}
                      {block.type === "breadcrumb" && (
                        <Breadcrumb
                          items={[
                            { label: p.item1 || "Início", href: "#" },
                            { label: p.item2 || "Comercial", href: "#" },
                            { label: p.item3 || "Tela Atual" },
                          ]}
                        />
                      )}

                      {/* ── 3. Card Container ── */}
                      {block.type === "card_container" && (
                        <Card shadow="sm" radius="xl" className="p-6">
                          <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div>
                              <h3 className="font-bold text-foreground text-base">{p.cardTitle || "Título do Card"}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{p.cardSubtitle || "Subtítulo"}</p>
                            </div>
                            {p.footerAction && <Button componentId="erp.components.uibuilder.btn.pfooteraction-2" variant="outline" size="sm">{p.footerAction}</Button>}
                          </div>
                          <div className="py-4 text-sm text-foreground leading-relaxed">
                            {p.cardContent || "Conteúdo formatado do Card..."}
                          </div>
                        </Card>
                      )}

                      {/* ── 4. Grid de KPIs ── */}
                      {block.type === "kpi_grid" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <StatCard
                            title={p.kpi1_title || "Faturamento"}
                            value={p.kpi1_value || "R$ 0"}
                            trend={{ value: parseFloat(p.kpi1_trend) || 0, label: p.kpi1_subtitle || "vs. anterior" }}
                          />
                          <StatCard
                            title={p.kpi2_title || "Pedidos"}
                            value={p.kpi2_value || "0"}
                            trend={{ value: parseFloat(p.kpi2_trend) || 0, label: p.kpi2_subtitle || "Meta" }}
                          />
                          <StatCard
                            title={p.kpi3_title || "Ticket Médio"}
                            value={p.kpi3_value || "R$ 0"}
                            trend={{ value: parseFloat(p.kpi3_trend) || 0, label: p.kpi3_subtitle || "Estável" }}
                          />
                          <StatCard
                            title={p.kpi4_title || "Lojas Ativas"}
                            value={p.kpi4_value || "0"}
                            trend={{ value: parseFloat(p.kpi4_trend) || 0, label: p.kpi4_subtitle || "Rondônia/Amazonas" }}
                          />
                        </div>
                      )}

                      {/* ── 5. FilterBar ── */}
                      {block.type === "filter_bar" && (
                        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-3">
                          <div className="relative flex-1 w-full">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              data-component-id="erp.uibuilder.canvas.filter.search"
                              placeholder={p.searchPlaceholder || "Buscar..."}
                              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button componentId="erp.components.uibuilder.btn.filtrar" variant="outline" size="md" leftIcon={<Filter size={15} />}>
                              {p.filter1Label || "Filtro 1"}
                            </Button>
                            <Button componentId="erp.components.uibuilder.btn.filtrar-2" variant="outline" size="md">
                              {p.filter2Label || "Filtro 2"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* ── 6. DataTable ── */}
                      {block.type === "data_table" && (
                        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-foreground text-sm">{p.title || "Tabela de Pedidos de Móveis"}</h3>
                              <p className="text-xs text-muted-foreground">{p.totalCount || "1.420 registros"}</p>
                            </div>
                            <Button componentId="erp.components.uibuilder.btn.exportar" variant="outline" size="sm" leftIcon={<Download size={14} />}>Exportar</Button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                                <tr>
                                  <th className="px-6 py-3">Código / Ref</th>
                                  <th className="px-6 py-3">Descrição / Loja</th>
                                  <th className="px-6 py-3">Data</th>
                                  <th className="px-6 py-3">Valor Total</th>
                                  <th className="px-6 py-3">Status</th>
                                  <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                <tr className="hover:bg-muted/20 transition-colors">
                                  <td className="px-6 py-4 font-mono font-medium">#PED-8942</td>
                                  <td className="px-6 py-4 font-medium text-foreground">Lopes Corp - Loja Porto Velho Centro</td>
                                  <td className="px-6 py-4 text-muted-foreground">24/08/2026</td>
                                  <td className="px-6 py-4 font-semibold text-foreground">R$ 14.850,00</td>
                                  <td className="px-6 py-4">
                                    <StatusBadge tone="success">FATURADO</StatusBadge>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <Button componentId="erp.components.uibuilder.btn.visualizar" variant="ghost" size="sm">Visualizar</Button>
                                  </td>
                                </tr>
                                <tr className="hover:bg-muted/20 transition-colors">
                                  <td className="px-6 py-4 font-mono font-medium">#PED-8941</td>
                                  <td className="px-6 py-4 font-medium text-foreground">Lopes Corp - Filial Ji-Paraná</td>
                                  <td className="px-6 py-4 text-muted-foreground">24/08/2026</td>
                                  <td className="px-6 py-4 font-semibold text-foreground">R$ 8.240,00</td>
                                  <td className="px-6 py-4">
                                    <StatusBadge tone="warning">EM SEPARAÇÃO</StatusBadge>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <Button componentId="erp.components.uibuilder.btn.visualizar-2" variant="ghost" size="sm">Visualizar</Button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* ── 7. FormSection (Formulário Customizado Dinâmico) ── */}
                      {block.type === "form_section" && (
                        <Card shadow="sm" radius="xl" className="p-6">
                          <div className="pb-4 border-b border-border mb-6 flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-foreground text-base">{p.sectionTitle || "Dados do Formulário"}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{p.sectionSubtitle || "Preencha as informações obrigatórias."}</p>
                            </div>
                            <Button componentId="erp.components.uibuilder.btn.adicionar"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addFormField(block.id);
                              }}
                              leftIcon={<Plus size={13} />}
                            >
                              Adicionar Campo
                            </Button>
                          </div>
                          <form onSubmit={(e) => e.preventDefault()} className={cn("grid gap-4", `grid-cols-1 md:grid-cols-${p.columns || 3}`)}>
                            {(p.fields || []).map((f: FormFieldConfig) => {
                              const spanClass = f.span && f.span > 1 ? `md:col-span-${Math.min(f.span, p.columns || 3)}` : "";
                              
                              if (f.type === "textarea") {
                                return (
                                  <div key={f.id} className={cn("space-y-1.5", spanClass)}>
                                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                      <span>{f.label} {f.required && <span className="text-destructive">*</span>}</span>
                                    </label>
                                    <textarea
                                      rows={3}
                                      data-component-id={`erp.uibuilder.canvas.form.${f.id}.textarea`}
                                      placeholder={f.placeholder || "Digite o texto..."}
                                      className="w-full px-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    {f.helperText && <p className="text-[11px] text-muted-foreground">{f.helperText}</p>}
                                  </div>
                                );
                              }

                              if (f.type === "select") {
                                return (
                                  <div key={f.id} className={cn("space-y-1.5", spanClass)}>
                                    <label className="text-xs font-semibold text-foreground">
                                      {f.label} {f.required && <span className="text-destructive">*</span>}
                                    </label>
                                    <select
                                      data-component-id={`erp.uibuilder.canvas.form.${f.id}.select`}
                                      className="w-full px-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    >
                                      {(f.options || ["Opção 1", "Opção 2"]).map((opt, oi) => (
                                        <option key={oi} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                    {f.helperText && <p className="text-[11px] text-muted-foreground">{f.helperText}</p>}
                                  </div>
                                );
                              }

                              if (f.type === "switch" || f.type === "checkbox") {
                                return (
                                  <div key={f.id} className={cn("flex items-center justify-between p-3.5 bg-muted/20 border border-border rounded-xl", spanClass)}>
                                    <div>
                                      <p className="text-xs font-semibold text-foreground">{f.label}</p>
                                      {f.helperText && <p className="text-[11px] text-muted-foreground mt-0.5">{f.helperText}</p>}
                                    </div>
                                    <input
                                      type="checkbox"
                                      data-component-id={`erp.uibuilder.canvas.form.${f.id}.checkbox`}
                                      defaultChecked={f.defaultValue === true}
                                      className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                                    />
                                  </div>
                                );
                              }

                              return (
                                <div key={f.id} className={cn("space-y-1.5", spanClass)}>
                                  <label className="text-xs font-semibold text-foreground">
                                    {f.label} {f.required && <span className="text-destructive">*</span>}
                                  </label>
                                  <input
                                    type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "date" ? "date" : "text"}
                                    data-component-id={`erp.uibuilder.canvas.form.${f.id}.input`}
                                    placeholder={f.placeholder || ""}
                                    className="w-full px-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                  {f.helperText && <p className="text-[11px] text-muted-foreground">{f.helperText}</p>}
                                </div>
                              );
                            })}

                            <div className={cn("pt-4 border-t border-border flex items-center justify-end gap-3", `md:col-span-${p.columns || 3}`)}>
                              {p.cancelLabel && <Button componentId="erp.components.uibuilder.btn.pcancellabel-2" variant="outline" size="md">{p.cancelLabel}</Button>}
                              <Button componentId="erp.components.uibuilder.btn.salvar" variant="primary" size="md">{p.submitLabel || "Salvar Dados"}</Button>
                            </div>
                          </form>
                        </Card>
                      )}

                      {/* ── TransferList (Dual List) ── */}
                      {block.type === "transfer_list" && (
                        <TransferList
                          sourceTitle={p.sourceTitle || "Usuários com Acesso à Filial"}
                          targetTitle={p.targetTitle || "Colaboradores Disponíveis"}
                          sourceItems={p.sourceItems || []}
                          targetItems={p.targetItems || []}
                          onChange={(nextSource, nextTarget) => {
                            updateProp("sourceItems", nextSource);
                            updateProp("targetItems", nextTarget);
                          }}
                          height={p.height || 380}
                        />
                      )}

                      {/* ── 8. Stepper ── */}
                      {block.type === "stepper" && (
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
                          <Stepper
                            steps={[
                              { title: p.step1 || "Etapa 1", status: "completed" },
                              { title: p.step2 || "Etapa 2", status: "current" },
                              { title: p.step3 || "Etapa 3", status: "upcoming" },
                              { title: p.step4 || "Etapa 4", status: "upcoming" },
                            ]}
                            activeStep={parseInt(p.activeStep, 10) || 1}
                          />
                        </div>
                      )}

                      {/* ── 9. Kanban ── */}
                      {block.type === "kanban" && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[p.col1, p.col2, p.col3, p.col4].map((colTitle, ci) => (
                            <div key={ci} className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col gap-3">
                              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wide">{colTitle}</h4>
                              <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-mono font-bold text-primary">#ORD-10{ci}</span>
                                  <StatusBadge tone="info">Normal</StatusBadge>
                                </div>
                                <p className="text-xs font-medium text-foreground">Remessa para filial Ji-Paraná (Estofados & Dormitórios)</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── 10. Timeline ── */}
                      {block.type === "timeline" && (
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
                          <Timeline
                            items={[
                              { title: p.item1_title || "Evento 1", description: p.item1_desc, date: p.item1_date, color: "primary" },
                              { title: p.item2_title || "Evento 2", description: p.item2_desc, date: p.item2_date, color: "success" },
                              { title: p.item3_title || "Evento 3", description: p.item3_desc, date: p.item3_date, color: "warning" },
                            ]}
                          />
                        </div>
                      )}

                      {/* ── 11. ActivityFeed ── */}
                      {block.type === "activity_feed" && (
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
                          <ActivityFeed
                            events={[
                              { id: "1", title: p.event1_title || "Atividade 1", description: p.event1_desc, timestamp: p.event1_time || "Há 5 min" },
                              { id: "2", title: p.event2_title || "Atividade 2", description: p.event2_desc, timestamp: p.event2_time || "Há 2 horas" },
                            ]}
                          />
                        </div>
                      )}

                      {/* ── 12. Accordion ── */}
                      {block.type === "accordion" && (
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
                          <Accordion
                            items={[
                              { title: p.item1_title || "Seção 1", content: <p className="text-xs text-muted-foreground leading-relaxed">{p.item1_content}</p>, defaultOpen: true },
                              { title: p.item2_title || "Seção 2", content: <p className="text-xs text-muted-foreground leading-relaxed">{p.item2_content}</p> },
                            ]}
                          />
                        </div>
                      )}

                      {/* ── 13. TreeView ── */}
                      {block.type === "tree_view" && (
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Estrutura de Filiais & Lojas</h4>
                          <TreeView
                            items={[
                              {
                                id: "root",
                                label: p.rootLabel || "Matriz Lopes Corp",
                                children: [
                                  { id: "c1", label: p.child1 || "Lojas Rondônia" },
                                  { id: "c2", label: p.child2 || "Lojas Amazonas" },
                                  { id: "c3", label: p.child3 || "CD Porto Velho" },
                                ],
                              },
                            ]}
                          />
                        </div>
                      )}

                      {/* ── 14. ServiceStatusCard ── */}
                      {block.type === "service_status" && (
                        <ServiceStatusCard
                          name={p.serviceName || "API de Integração"}
                          status={p.status || "operational"}
                          latencyMs={parseInt(p.latencyMs, 10) || 52}
                          uptimePct={parseFloat(p.uptimePct) || 99.98}
                        />
                      )}

                      {/* ── 15. FormModal CTA ── */}
                      {block.type === "modal_cta" && (
                        <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground text-sm">{p.modalTitle || "FormModal Canônico"}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.modalSubtitle || "Clique para abrir e testar o overlay."}</p>
                          </div>
                          <Button componentId="erp.components.uibuilder.btn.acao-16" variant="primary" size="md" onClick={() => setPreviewModalOpen(true)}>
                            {p.triggerLabel || "Abrir FormModal Canônico"}
                          </Button>
                        </div>
                      )}

                      {/* ── 16. ConfirmDialog CTA ── */}
                      {block.type === "confirm_dialog_cta" && (
                        <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground text-sm">{p.dialogTitle}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.dialogDescription}</p>
                          </div>
                          <Button componentId="erp.components.uibuilder.btn.acao-17" variant="destructive" size="md" onClick={() => setPreviewConfirmOpen(true)}>
                            {p.triggerLabel || "Testar ConfirmDialog"}
                          </Button>
                        </div>
                      )}

                      {/* ── 17. Drawer CTA ── */}
                      {block.type === "drawer_cta" && (
                        <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground text-sm">{p.drawerTitle}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.drawerDescription}</p>
                          </div>
                          <Button componentId="erp.components.uibuilder.btn.acao-18" variant="outline" size="md" onClick={() => setPreviewDrawerOpen(true)}>
                            {p.triggerLabel || "Abrir Drawer"}
                          </Button>
                        </div>
                      )}

                      {/* ── 18. Alert Box ── */}
                      {block.type === "alert_box" && (
                        <Alert
                          variant={p.tone || "info"}
                          title={p.title}
                          description={p.description}
                        />
                      )}

                      {/* ── 19. Empty State ── */}
                      {block.type === "empty_state" && (
                        <EmptyState
                          title={p.title}
                          description={p.description}
                          actions={p.actionLabel ? [{ label: p.actionLabel, onClick: () => {} }] : undefined}
                        />
                      )}

                      {/* ── 20. CodeBlock ── */}
                      {block.type === "code_block" && (
                        <CodeBlock
                          language={p.language || "json"}
                          filename={p.filename || "payload.json"}
                          code={p.code || ""}
                          showCopy
                        />
                      )}

                      {/* ── 21. Badges Showcase ── */}
                      {block.type === "badges_showcase" && (
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mostruário de Status do Design System</h4>
                          <div className="flex flex-wrap items-center gap-3">
                            <StatusBadge tone={p.tone1 || "success"}>{p.label1 || "Sucesso"}</StatusBadge>
                            <StatusBadge tone={p.tone2 || "warning"}>{p.label2 || "Atenção"}</StatusBadge>
                            <StatusBadge tone={p.tone3 || "info"}>{p.label3 || "Informativo"}</StatusBadge>
                            <StatusBadge tone={p.tone4 || "danger"}>{p.label4 || "Crítico"}</StatusBadge>
                            <Badge variant="primary">Badge Primária</Badge>
                            <Badge variant="secondary">Badge Secundária</Badge>
                            <Badge variant="violet">Badge Violet</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ── Code / Export Tab ── */
            <div className="w-full max-w-5xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 size={18} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">Código TSX Pronto para Uso</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button componentId="erp.components.uibuilder.btn.exportar-2" variant="outline" size="sm" onClick={handleDownloadCode} leftIcon={<Download size={14} />}>
                    Baixar .tsx
                  </Button>
                  <Button componentId="erp.components.uibuilder.btn.copiar" variant="primary" size="sm" onClick={handleCopyCode} leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
                    {copied ? "Copiado!" : "Copiar Código"}
                  </Button>
                </div>
              </div>
              <pre className="p-6 text-xs font-mono bg-zinc-950 text-zinc-100 overflow-x-auto leading-relaxed max-h-[70vh]">
                <code>{generatedCode}</code>
              </pre>
            </div>
          )}
        </main>

        {/* ── Right Sidebar: Property Inspector (Collapsible) ── */}
        <aside
          className={cn(
            "border-l border-border bg-card flex flex-col shrink-0 transition-all duration-300 overflow-hidden",
            rightSidebarOpen ? "w-88" : "w-0 p-0 border-l-0"
          )}
        >
          <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Propriedades
              </span>
            </div>
            {selectedBlock && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                {selectedBlock.type}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedBlock ? (
              <div className="space-y-4">
                {/* Header card of selected block */}
                <div className="p-3 bg-muted/30 rounded-2xl border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground">{selectedBlock.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-component-id="erp.uibuilder.inspector.duplicate-block"
                        onClick={() => duplicateBlock(selectedBlock.id)}
                        title="Duplicar este bloco"
                        className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        data-component-id="erp.uibuilder.inspector.delete-block"
                        onClick={() => removeBlock(selectedBlock.id)}
                        title="Excluir este bloco"
                        className="p-1 hover:bg-destructive/10 rounded-lg text-destructive cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Component-specific Custom Field Editors ── */}

                {/* 1. PageHeader Props */}
                {selectedBlock.type === "page_header" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título Principal</label>
                      <input data-component-id="erp.uibuilder.inspector.title"
                        type="text"
                        value={selectedBlock.props.title || ""}
                        onChange={(e) => updateProp("title", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Subtítulo / Descrição</label>
                      <textarea data-component-id="erp.uibuilder.inspector.subtitle"
                        rows={2}
                        value={selectedBlock.props.subtitle || ""}
                        onChange={(e) => updateProp("subtitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Texto do Badge</label>
                        <input data-component-id="erp.uibuilder.inspector.badge"
                          type="text"
                          value={selectedBlock.props.badge || ""}
                          onChange={(e) => updateProp("badge", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Tom do Badge</label>
                        <select data-component-id="erp.uibuilder.inspector.badgeTone"
                          value={selectedBlock.props.badgeTone || "success"}
                          onChange={(e) => updateProp("badgeTone", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          <option value="success">Success (Verde)</option>
                          <option value="warning">Warning (Amarelo)</option>
                          <option value="info">Info (Azul)</option>
                          <option value="danger">Danger (Vermelho)</option>
                          <option value="primary">Primary (Azul Lopes UI)</option>
                          <option value="violet">Violet (Roxo)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Botão Primário</label>
                      <input data-component-id="erp.uibuilder.inspector.primaryAction"
                        type="text"
                        value={selectedBlock.props.primaryAction || ""}
                        onChange={(e) => updateProp("primaryAction", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Botão Secundário</label>
                      <input data-component-id="erp.uibuilder.inspector.secondaryAction"
                        type="text"
                        value={selectedBlock.props.secondaryAction || ""}
                        onChange={(e) => updateProp("secondaryAction", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Breadcrumb Props */}
                {selectedBlock.type === "breadcrumb" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Nível 1</label>
                      <input data-component-id="erp.uibuilder.inspector.item1"
                        type="text"
                        value={selectedBlock.props.item1 || ""}
                        onChange={(e) => updateProp("item1", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Nível 2</label>
                      <input data-component-id="erp.uibuilder.inspector.item2"
                        type="text"
                        value={selectedBlock.props.item2 || ""}
                        onChange={(e) => updateProp("item2", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Nível 3 (Página Atual)</label>
                      <input data-component-id="erp.uibuilder.inspector.item3"
                        type="text"
                        value={selectedBlock.props.item3 || ""}
                        onChange={(e) => updateProp("item3", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Card Container Props */}
                {selectedBlock.type === "card_container" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título do Card</label>
                      <input data-component-id="erp.uibuilder.inspector.cardTitle"
                        type="text"
                        value={selectedBlock.props.cardTitle || ""}
                        onChange={(e) => updateProp("cardTitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Subtítulo</label>
                      <input data-component-id="erp.uibuilder.inspector.cardSubtitle"
                        type="text"
                        value={selectedBlock.props.cardSubtitle || ""}
                        onChange={(e) => updateProp("cardSubtitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Conteúdo / Texto</label>
                      <textarea data-component-id="erp.uibuilder.inspector.cardContent"
                        rows={3}
                        value={selectedBlock.props.cardContent || ""}
                        onChange={(e) => updateProp("cardContent", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Texto do Botão</label>
                      <input data-component-id="erp.uibuilder.inspector.footerAction"
                        type="text"
                        value={selectedBlock.props.footerAction || ""}
                        onChange={(e) => updateProp("footerAction", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 4. KPI Grid Props */}
                {selectedBlock.type === "kpi_grid" && (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="p-3 bg-muted/20 rounded-xl border border-border space-y-2">
                        <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                          <BarChart3 size={13} className="text-primary" />
                          Indicador {num}
                        </span>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Título</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`kpi${num}_title`] || ""}
                            onChange={(e) => updateProp(`kpi${num}_title`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase">Valor</label>
                            <input data-component-id="erp.uibuilder.inspector.field"
                              type="text"
                              value={selectedBlock.props[`kpi${num}_value`] || ""}
                              onChange={(e) => updateProp(`kpi${num}_value`, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase">Trend (%)</label>
                            <input data-component-id="erp.uibuilder.inspector.field"
                              type="text"
                              value={selectedBlock.props[`kpi${num}_trend`] || ""}
                              onChange={(e) => updateProp(`kpi${num}_trend`, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Subtexto / Meta</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`kpi${num}_subtitle`] || ""}
                            onChange={(e) => updateProp(`kpi${num}_subtitle`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. FormSection (Form Builder Rico & Customizável) */}
                {selectedBlock.type === "form_section" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <CheckSquare size={14} />
                          Form Builder Interativo
                        </span>
                        <Button componentId="erp.components.uibuilder.btn.adicionar-2"
                          variant="primary"
                          size="sm"
                          onClick={() => addFormField(selectedBlock.id)}
                          leftIcon={<Plus size={12} />}
                        >
                          Novo Campo
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Título do Formulário</label>
                        <input data-component-id="erp.uibuilder.inspector.sectionTitle"
                          type="text"
                          value={selectedBlock.props.sectionTitle || ""}
                          onChange={(e) => updateProp("sectionTitle", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Subtítulo / Instrução</label>
                        <input data-component-id="erp.uibuilder.inspector.sectionSubtitle"
                          type="text"
                          value={selectedBlock.props.sectionSubtitle || ""}
                          onChange={(e) => updateProp("sectionSubtitle", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Colunas no Grid</label>
                          <select data-component-id="erp.uibuilder.inspector.columns"
                            value={selectedBlock.props.columns || 3}
                            onChange={(e) => updateProp("columns", parseInt(e.target.value, 10))}
                            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-bold"
                          >
                            <option value="1">1 Coluna (Vertical)</option>
                            <option value="2">2 Colunas</option>
                            <option value="3">3 Colunas</option>
                            <option value="4">4 Colunas</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Botão Principal</label>
                          <input data-component-id="erp.uibuilder.inspector.submitLabel"
                            type="text"
                            value={selectedBlock.props.submitLabel || ""}
                            onChange={(e) => updateProp("submitLabel", e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Fields List in Inspector */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Campos do Formulário ({(selectedBlock.props.fields || []).length})
                        </span>
                      </div>

                      {(selectedBlock.props.fields || []).map((f: FormFieldConfig, fi: number) => (
                        <div
                          key={f.id}
                          className="p-3 bg-muted/30 border border-border rounded-xl space-y-2.5 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                                {fi + 1}
                              </span>
                              {f.label || "Campo sem rótulo"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                data-component-id={`erp.uibuilder.inspector.form.field.${f.id}.move-up`}
                                onClick={() => moveFormField(selectedBlock.id, fi, "up")}
                                disabled={fi === 0}
                                className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-20 cursor-pointer"
                                title="Mover para cima"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                type="button"
                                data-component-id={`erp.uibuilder.inspector.form.field.${f.id}.move-down`}
                                onClick={() => moveFormField(selectedBlock.id, fi, "down")}
                                disabled={fi === (selectedBlock.props.fields || []).length - 1}
                                className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-20 cursor-pointer"
                                title="Mover para baixo"
                              >
                                <ChevronDown size={12} />
                              </button>
                              <button
                                type="button"
                                data-component-id={`erp.uibuilder.inspector.form.field.${f.id}.delete`}
                                onClick={() => removeFormField(selectedBlock.id, f.id)}
                                className="p-1 hover:bg-destructive/10 rounded text-destructive cursor-pointer"
                                title="Remover campo"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-muted-foreground">Rótulo (Label)</label>
                              <input data-component-id="erp.uibuilder.inspector.field"
                                type="text"
                                value={f.label}
                                onChange={(e) => updateFormField(selectedBlock.id, f.id, { label: e.target.value })}
                                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-muted-foreground">Tipo de Entrada</label>
                              <select data-component-id="erp.uibuilder.inspector.field"
                                value={f.type}
                                onChange={(e) => updateFormField(selectedBlock.id, f.id, { type: e.target.value as FormFieldType })}
                                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                              >
                                <option value="text">Texto Curto</option>
                                <option value="number">Número / Moeda</option>
                                <option value="email">E-mail</option>
                                <option value="select">Select / Dropdown</option>
                                <option value="textarea">Área de Texto (Textarea)</option>
                                <option value="date">Data</option>
                                <option value="switch">Switch (Alternador)</option>
                              </select>
                            </div>
                          </div>

                          {f.type !== "switch" && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-muted-foreground">Placeholder / Dica</label>
                              <input data-component-id="erp.uibuilder.inspector.field"
                                type="text"
                                value={f.placeholder || ""}
                                onChange={(e) => updateFormField(selectedBlock.id, f.id, { placeholder: e.target.value })}
                                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          )}

                          {f.type === "select" && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-muted-foreground">Opções do Dropdown (separadas por vírgula)</label>
                              <input data-component-id="erp.uibuilder.inspector.field"
                                type="text"
                                value={(f.options || []).join(", ")}
                                onChange={(e) =>
                                  updateFormField(selectedBlock.id, f.id, {
                                    options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                  })
                                }
                                placeholder="Opção 1, Opção 2, Opção 3"
                                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-muted-foreground">Largura (Grid Span)</label>
                              <select data-component-id="erp.uibuilder.inspector.field"
                                value={f.span || 1}
                                onChange={(e) => updateFormField(selectedBlock.id, f.id, { span: parseInt(e.target.value, 10) as any })}
                                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                              >
                                <option value="1">1 Coluna</option>
                                <option value="2">2 Colunas</option>
                                <option value="3">3 Colunas</option>
                                <option value="4">Largura Total (4 cols)</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                              <input data-component-id="erp.uibuilder.inspector.field"
                                type="checkbox"
                                id={`req_${f.id}`}
                                checked={f.required === true}
                                onChange={(e) => updateFormField(selectedBlock.id, f.id, { required: e.target.checked })}
                                className="h-3.5 w-3.5 rounded text-primary focus:ring-primary/20 cursor-pointer"
                              />
                              <label htmlFor={`req_${f.id}`} className="text-xs font-medium text-foreground cursor-pointer">
                                Obrigatório
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TransferList Props */}
                {selectedBlock.type === "transfer_list" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título Lista Vinculados (Esquerda)</label>
                      <input data-component-id="erp.uibuilder.inspector.sourceTitle"
                        type="text"
                        value={selectedBlock.props.sourceTitle || ""}
                        onChange={(e) => updateProp("sourceTitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título Lista Disponíveis (Direita)</label>
                      <input data-component-id="erp.uibuilder.inspector.targetTitle"
                        type="text"
                        value={selectedBlock.props.targetTitle || ""}
                        onChange={(e) => updateProp("targetTitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Altura do Container (px)</label>
                      <input data-component-id="erp.uibuilder.inspector.height"
                        type="number"
                        value={selectedBlock.props.height || 380}
                        onChange={(e) => updateProp("height", parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 6. FilterBar Props */}
                {selectedBlock.type === "filter_bar" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Placeholder da Busca</label>
                      <input data-component-id="erp.uibuilder.inspector.searchPlaceholder"
                        type="text"
                        value={selectedBlock.props.searchPlaceholder || ""}
                        onChange={(e) => updateProp("searchPlaceholder", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Rótulo do Filtro 1</label>
                      <input data-component-id="erp.uibuilder.inspector.filter1Label"
                        type="text"
                        value={selectedBlock.props.filter1Label || ""}
                        onChange={(e) => updateProp("filter1Label", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Rótulo do Filtro 2</label>
                      <input data-component-id="erp.uibuilder.inspector.filter2Label"
                        type="text"
                        value={selectedBlock.props.filter2Label || ""}
                        onChange={(e) => updateProp("filter2Label", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 7. DataTable Props */}
                {selectedBlock.type === "data_table" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título da Tabela</label>
                      <input data-component-id="erp.uibuilder.inspector.title"
                        type="text"
                        value={selectedBlock.props.title || ""}
                        onChange={(e) => updateProp("title", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Subtexto / Totalizador</label>
                      <input data-component-id="erp.uibuilder.inspector.totalCount"
                        type="text"
                        value={selectedBlock.props.totalCount || ""}
                        onChange={(e) => updateProp("totalCount", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 8. Stepper Props */}
                {selectedBlock.type === "stepper" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Etapa Ativa (1 a 4)</label>
                      <select data-component-id="erp.uibuilder.inspector.activeStep"
                        value={selectedBlock.props.activeStep || "2"}
                        onChange={(e) => updateProp("activeStep", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-bold"
                      >
                        <option value="1">Etapa 1</option>
                        <option value="2">Etapa 2</option>
                        <option value="3">Etapa 3</option>
                        <option value="4">Etapa 4</option>
                      </select>
                    </div>
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Nome da Etapa {s}</label>
                        <input data-component-id="erp.uibuilder.inspector.field"
                          type="text"
                          value={selectedBlock.props[`step${s}`] || ""}
                          onChange={(e) => updateProp(`step${s}`, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 9. Kanban Props */}
                {selectedBlock.type === "kanban" && (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((c) => (
                      <div key={c} className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Nome da Coluna {c}</label>
                        <input data-component-id="erp.uibuilder.inspector.field"
                          type="text"
                          value={selectedBlock.props[`col${c}`] || ""}
                          onChange={(e) => updateProp(`col${c}`, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 10. Timeline Props */}
                {selectedBlock.type === "timeline" && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((ev) => (
                      <div key={ev} className="p-3 bg-muted/20 rounded-xl border border-border space-y-2">
                        <span className="text-[11px] font-bold text-foreground">Evento {ev}</span>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Título</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`item${ev}_title`] || ""}
                            onChange={(e) => updateProp(`item${ev}_title`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Detalhes</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`item${ev}_desc`] || ""}
                            onChange={(e) => updateProp(`item${ev}_desc`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Data / Hora</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`item${ev}_date`] || ""}
                            onChange={(e) => updateProp(`item${ev}_date`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 11. ActivityFeed Props */}
                {selectedBlock.type === "activity_feed" && (
                  <div className="space-y-4">
                    {[1, 2].map((ev) => (
                      <div key={ev} className="p-3 bg-muted/20 rounded-xl border border-border space-y-2">
                        <span className="text-[11px] font-bold text-foreground">Atividade {ev}</span>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Título</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`event${ev}_title`] || ""}
                            onChange={(e) => updateProp(`event${ev}_title`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Descrição</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`event${ev}_desc`] || ""}
                            onChange={(e) => updateProp(`event${ev}_desc`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Horário</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`event${ev}_time`] || ""}
                            onChange={(e) => updateProp(`event${ev}_time`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 12. Accordion Props */}
                {selectedBlock.type === "accordion" && (
                  <div className="space-y-4">
                    {[1, 2].map((sec) => (
                      <div key={sec} className="p-3 bg-muted/20 rounded-xl border border-border space-y-2">
                        <span className="text-[11px] font-bold text-foreground">Seção {sec}</span>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Título</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`item${sec}_title`] || ""}
                            onChange={(e) => updateProp(`item${sec}_title`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Conteúdo</label>
                          <textarea data-component-id="erp.uibuilder.inspector.field"
                            rows={2}
                            value={selectedBlock.props[`item${sec}_content`] || ""}
                            onChange={(e) => updateProp(`item${sec}_content`, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 13. TreeView Props */}
                {selectedBlock.type === "tree_view" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Nó Raiz (Matriz)</label>
                      <input data-component-id="erp.uibuilder.inspector.rootLabel"
                        type="text"
                        value={selectedBlock.props.rootLabel || ""}
                        onChange={(e) => updateProp("rootLabel", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {[1, 2, 3].map((c) => (
                      <div key={c} className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Filho {c}</label>
                        <input data-component-id="erp.uibuilder.inspector.field"
                          type="text"
                          value={selectedBlock.props[`child${c}`] || ""}
                          onChange={(e) => updateProp(`child${c}`, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 14. ServiceStatusCard Props */}
                {selectedBlock.type === "service_status" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Nome do Serviço</label>
                      <input data-component-id="erp.uibuilder.inspector.serviceName"
                        type="text"
                        value={selectedBlock.props.serviceName || ""}
                        onChange={(e) => updateProp("serviceName", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Status Operacional</label>
                      <select data-component-id="erp.uibuilder.inspector.status"
                        value={selectedBlock.props.status || "operational"}
                        onChange={(e) => updateProp("status", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-semibold"
                      >
                        <option value="operational">Operational (Operacional / Normal)</option>
                        <option value="degraded">Degraded (Lentidão / Instabilidade)</option>
                        <option value="outage">Outage (Fora do Ar)</option>
                        <option value="maintenance">Maintenance (Em Manutenção)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Latência (ms)</label>
                        <input data-component-id="erp.uibuilder.inspector.latencyMs"
                          type="text"
                          value={selectedBlock.props.latencyMs || "45"}
                          onChange={(e) => updateProp("latencyMs", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Uptime (%)</label>
                        <input data-component-id="erp.uibuilder.inspector.uptimePct"
                          type="text"
                          value={selectedBlock.props.uptimePct || "99.9"}
                          onChange={(e) => updateProp("uptimePct", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 15. FormModal Props */}
                {selectedBlock.type === "modal_cta" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título do Modal</label>
                      <input data-component-id="erp.uibuilder.inspector.modalTitle"
                        type="text"
                        value={selectedBlock.props.modalTitle || ""}
                        onChange={(e) => updateProp("modalTitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Subtítulo do Modal</label>
                      <input data-component-id="erp.uibuilder.inspector.modalSubtitle"
                        type="text"
                        value={selectedBlock.props.modalSubtitle || ""}
                        onChange={(e) => updateProp("modalSubtitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Texto do Botão Disparador</label>
                      <input data-component-id="erp.uibuilder.inspector.triggerLabel"
                        type="text"
                        value={selectedBlock.props.triggerLabel || ""}
                        onChange={(e) => updateProp("triggerLabel", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 16. ConfirmDialog Props */}
                {selectedBlock.type === "confirm_dialog_cta" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título do Diálogo</label>
                      <input data-component-id="erp.uibuilder.inspector.dialogTitle"
                        type="text"
                        value={selectedBlock.props.dialogTitle || ""}
                        onChange={(e) => updateProp("dialogTitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Mensagem de Alerta</label>
                      <textarea data-component-id="erp.uibuilder.inspector.dialogDescription"
                        rows={2}
                        value={selectedBlock.props.dialogDescription || ""}
                        onChange={(e) => updateProp("dialogDescription", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Variante / Gravidade</label>
                      <select data-component-id="erp.uibuilder.inspector.variant"
                        value={selectedBlock.props.variant || "danger"}
                        onChange={(e) => updateProp("variant", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      >
                        <option value="danger">Danger (Crítico / Vermelho)</option>
                        <option value="warning">Warning (Aviso / Amarelo)</option>
                        <option value="info">Info (Informativo / Azul)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Texto do Botão Disparador</label>
                      <input data-component-id="erp.uibuilder.inspector.triggerLabel"
                        type="text"
                        value={selectedBlock.props.triggerLabel || ""}
                        onChange={(e) => updateProp("triggerLabel", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 17. Drawer Props */}
                {selectedBlock.type === "drawer_cta" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título do Painel</label>
                      <input data-component-id="erp.uibuilder.inspector.drawerTitle"
                        type="text"
                        value={selectedBlock.props.drawerTitle || ""}
                        onChange={(e) => updateProp("drawerTitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Descrição</label>
                      <input data-component-id="erp.uibuilder.inspector.drawerDescription"
                        type="text"
                        value={selectedBlock.props.drawerDescription || ""}
                        onChange={(e) => updateProp("drawerDescription", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Texto do Botão Disparador</label>
                      <input data-component-id="erp.uibuilder.inspector.triggerLabel"
                        type="text"
                        value={selectedBlock.props.triggerLabel || ""}
                        onChange={(e) => updateProp("triggerLabel", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 18. Alert Box Props */}
                {selectedBlock.type === "alert_box" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Tom do Alerta</label>
                      <select data-component-id="erp.uibuilder.inspector.tone"
                        value={selectedBlock.props.tone || "info"}
                        onChange={(e) => updateProp("tone", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
                      >
                        <option value="info">Info (Informativo / Azul)</option>
                        <option value="warning">Warning (Alerta / Amarelo)</option>
                        <option value="success">Success (Sucesso / Verde)</option>
                        <option value="danger">Danger (Erro / Vermelho)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título</label>
                      <input data-component-id="erp.uibuilder.inspector.title"
                        type="text"
                        value={selectedBlock.props.title || ""}
                        onChange={(e) => updateProp("title", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Mensagem / Descrição</label>
                      <textarea data-component-id="erp.uibuilder.inspector.description"
                        rows={2}
                        value={selectedBlock.props.description || ""}
                        onChange={(e) => updateProp("description", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 19. Empty State Props */}
                {selectedBlock.type === "empty_state" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Título Principal</label>
                      <input data-component-id="erp.uibuilder.inspector.title"
                        type="text"
                        value={selectedBlock.props.title || ""}
                        onChange={(e) => updateProp("title", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Descrição</label>
                      <textarea data-component-id="erp.uibuilder.inspector.description"
                        rows={2}
                        value={selectedBlock.props.description || ""}
                        onChange={(e) => updateProp("description", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Texto do Botão (CTA)</label>
                      <input data-component-id="erp.uibuilder.inspector.actionLabel"
                        type="text"
                        value={selectedBlock.props.actionLabel || ""}
                        onChange={(e) => updateProp("actionLabel", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 20. CodeBlock Props */}
                {selectedBlock.type === "code_block" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Linguagem</label>
                        <input data-component-id="erp.uibuilder.inspector.language"
                          type="text"
                          value={selectedBlock.props.language || "json"}
                          onChange={(e) => updateProp("language", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Nome do Arquivo</label>
                        <input data-component-id="erp.uibuilder.inspector.filename"
                          type="text"
                          value={selectedBlock.props.filename || "payload.json"}
                          onChange={(e) => updateProp("filename", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Código / JSON</label>
                      <textarea data-component-id="erp.uibuilder.inspector.code"
                        rows={5}
                        value={selectedBlock.props.code || ""}
                        onChange={(e) => updateProp("code", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-zinc-950 text-zinc-100 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* 21. Badges Showcase Props */}
                {selectedBlock.type === "badges_showcase" && (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="grid grid-cols-2 gap-2 p-2 bg-muted/20 rounded-xl border border-border">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Rótulo {num}</label>
                          <input data-component-id="erp.uibuilder.inspector.field"
                            type="text"
                            value={selectedBlock.props[`label${num}`] || ""}
                            onChange={(e) => updateProp(`label${num}`, e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase">Tom</label>
                          <select data-component-id="erp.uibuilder.inspector.field"
                            value={selectedBlock.props[`tone${num}`] || "success"}
                            onChange={(e) => updateProp(`tone${num}`, e.target.value)}
                            className="w-full px-1.5 py-1 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="info">Info</option>
                            <option value="danger">Danger</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons: Duplicate & Delete */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <Button componentId="erp.components.uibuilder.btn.copiar-2"
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateBlock(selectedBlock.id)}
                    leftIcon={<Copy size={13} />}
                  >
                    Duplicar
                  </Button>
                  <Button componentId="erp.components.uibuilder.btn.remover"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBlock(selectedBlock.id)}
                    leftIcon={<Trash2 size={13} />}
                  >
                    Excluir Bloco
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                <Settings2 size={24} className="text-muted-foreground/50 mb-2" />
                <p className="font-semibold text-foreground">Nenhum bloco selecionado</p>
                <p className="mt-1 leading-relaxed">Clique em qualquer componente na tela central para editar suas propriedades em tempo real.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Interactive Overlays Preview ── */}
      <FormModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        size="md"
      >
        <FormModalHeader
          title="Modal Canônico Lopes Corp"
          subtitle="Exemplo de diálogo com acessibilidade e Radix UI integrado"
        />
        <FormModalBody>
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              Este modal utiliza a infraestrutura unificada do Design System:
            </p>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5">
              <li>Camada única de z-index (`z-[7000]`).</li>
              <li>Orquestração com o Radix Dialog Primitive.</li>
              <li>Acessibilidade WAI-ARIA com foco automático e fechamento seguro por `Escape`.</li>
            </ul>
          </div>
        </FormModalBody>
        <FormModalActions
          submitLabel="Salvar e Continuar"
          cancelLabel="Fechar"
          onSubmit={() => setPreviewModalOpen(false)}
          onCancel={() => setPreviewModalOpen(false)}
        />
      </FormModal>

      <ConfirmDialog
        open={previewConfirmOpen}
        title="Confirmar Exclusão de Registro"
        description="Esta ação removerá permanentemente o item selecionado. Tem certeza que deseja continuar?"
        variant="danger"
        onConfirm={() => setPreviewConfirmOpen(false)}
        onCancel={() => setPreviewConfirmOpen(false)}
      />

      <Drawer
        open={previewDrawerOpen}
        onClose={() => setPreviewDrawerOpen(false)}
        title="Painel Lateral de Detalhes"
        description="Visualização rápida de propriedades avançadas"
        size="md"
      >
        <div className="p-4 space-y-4 text-sm text-foreground">
          <p>Conteúdo renderizado com deslizamento suave da direita.</p>
          <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground">
            Compatível com scroll lock automático e Radix layer concurrency.
          </div>
        </div>
      </Drawer>
    </div>
  );
}
