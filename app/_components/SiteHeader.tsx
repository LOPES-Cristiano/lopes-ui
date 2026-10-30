"use client";

import React, { useState } from "react";
import HeaderWrapper from "@/components/HeaderWrapper";
import Brand from "@/components/header/Brand";
import CommandMenu, { type CommandItem } from "@/components/CommandMenu";
import ProfileActions from "@/components/header/ProfileActions";
import ProfileTrigger from "@/components/header/ProfileTrigger";
import ThemeToggle from "@/components/ThemeToggle";
import { type NavItem } from "@/components/header/Nav";
import NotificationBell, { type NotificationItem } from "@/components/NotificationBell";
import {
  Home,
  FormInput,
  Layers,
  Zap,
  BarChart2,
  MessageCircle,
  Navigation,
  Play,
  LogOut,
  Sparkles,
  Wrench,
  LayoutDashboard,
  Briefcase,
  Headphones,
  Settings,
  ShoppingBag,
  FileEdit,
  FileCode,
  QrCode,
  ShieldCheck,
  Network,
  Tag,
  PenTool,
  UploadCloud,
  CheckCircle2,
  HelpCircle,
  Columns,
  ListChecks,
  Barcode,
} from "lucide-react";

const SITE_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  {
    label: "Templates",
    icon: Sparkles,
    children: [
      {
        label: "Dashboard Executivo",
        href: "/templates#dashboard",
        icon: LayoutDashboard,
        description: "KPIs, gráficos de área/rosca, DataTable e feed ao vivo.",
      },
      {
        label: "CRM & Pipeline",
        href: "/templates#crm",
        icon: Briefcase,
        description: "Funil Kanban drag-and-drop e Drawer de nova oportunidade.",
      },
      {
        label: "Central Helpdesk",
        href: "/templates#helpdesk",
        icon: Headphones,
        description: "InboxList, ChatWindow, EmailComposer e ficha 360°.",
      },
      {
        label: "Configurações & RBAC",
        href: "/templates#settings",
        icon: Settings,
        description: "Simulador RBAC ao vivo, API Keys, 2FA e preferências.",
      },
      {
        label: "Vitrine & Checkout",
        href: "/templates#catalog",
        icon: ShoppingBag,
        description: "Catálogo com HoverGallery, Countdown e Checkout Stepper.",
      },
    ],
  },
  {
    label: "Componentes",
    icon: Layers,
    children: [
      {
        label: "Formulários & Inputs",
        href: "/showcase/forms",
        icon: FormInput,
        description: "RichTextEditor (/), Cascader, TreeSelect, Mentions, TagsInput, SignaturePad, FileDropzone…",
      },
      {
        label: "Display & Vitrine",
        href: "/showcase/display",
        icon: Layers,
        description: "StatCard (Segments/Ring), Badge & Ribbon, QRCode, Watermark, Skeleton, Masonry, BentoGrid…",
      },
      {
        label: "Ações & Feedback",
        href: "/showcase/actions",
        icon: Zap,
        description: "Button, Popconfirm, Result, FloatButton & BackTop, PasswordConfirm, SortableList, Alert…",
      },
      {
        label: "Dados, Tabelas & Gráficos",
        href: "/showcase/data",
        icon: BarChart2,
        description: "Chart, DataTable, Spreadsheet, DescriptionList, JsonViewer, Barcode, Kanban, TreeView…",
      },
      {
        label: "Comunicação",
        href: "/showcase/communication",
        icon: MessageCircle,
        description: "ChatWindow, ChatComposer, EmailComposer, NotificationBell, SmartObject…",
      },
      {
        label: "Navegação & Layout",
        href: "/showcase/navigation",
        icon: Navigation,
        description: "Tabs (Editable Card), SplitPane (Splitter), TableOfContents, Pagination, Dock, Sidebar…",
      },
      {
        label: "Animação, Código & Tour",
        href: "/showcase/animation",
        icon: Play,
        description: "CodeEditor (Live Syntax & Run), Stepper (Navigation/Dot), CodeBlock, Marquee, Tour…",
      },
    ],
  },
  { label: "UI Builder", href: "/ui-builder", icon: Wrench },
];

const SITE_COMMANDS: CommandItem[] = [
  // Páginas & Templates
  { id: "nav-home", label: "Home", icon: Home, href: "/", group: "Páginas & Templates" },
  { id: "tpl-dash", label: "Template: Dashboard Executivo", icon: LayoutDashboard, href: "/templates#dashboard", group: "Páginas & Templates", keywords: ["template", "dashboard", "analytics", "kpi", "chart"] },
  { id: "tpl-crm", label: "Template: CRM & Pipeline Comercial", icon: Briefcase, href: "/templates#crm", group: "Páginas & Templates", keywords: ["template", "crm", "kanban", "pipeline", "vendas"] },
  { id: "tpl-help", label: "Template: Central Helpdesk Omnichannel", icon: Headphones, href: "/templates#helpdesk", group: "Páginas & Templates", keywords: ["template", "helpdesk", "chat", "inbox", "suporte"] },
  { id: "tpl-set", label: "Template: Configurações & Simulador RBAC", icon: Settings, href: "/templates#settings", group: "Páginas & Templates", keywords: ["template", "settings", "rbac", "permissões", "api"] },
  { id: "tpl-cat", label: "Template: Vitrine & Checkout B2B", icon: ShoppingBag, href: "/templates#catalog", group: "Páginas & Templates", keywords: ["template", "catalogo", "ecommerce", "checkout"] },
  { id: "nav-builder", label: "UI Builder Visual 2D", icon: Wrench, href: "/ui-builder", group: "Páginas & Templates", keywords: ["builder", "studio", "canvas", "gerador", "tsx"] },
  // Categorias de Componentes
  { id: "sc-forms", label: "Formulários & Inputs", icon: FormInput, href: "/showcase/forms", group: "Categorias", keywords: ["form", "input", "login", "otp", "select", "datepicker", "zod", "colorpicker", "taginput", "slider", "radiogroup", "cascader", "treeselect", "mentions"] },
  { id: "sc-display", label: "Display & Vitrine", icon: Layers, href: "/showcase/display", group: "Categorias", keywords: ["avatar", "badge", "statusbadge", "bento", "card", "carousel", "countdown", "diff", "hovercard", "mockup", "qrcode", "watermark", "skeleton", "masonry"] },
  { id: "sc-actions", label: "Ações & Feedback", icon: Zap, href: "/showcase/actions", group: "Categorias", keywords: ["button", "buttongroup", "togglegroup", "speeddial", "swap", "loading", "spin", "alert", "toast", "drawer", "modal", "popconfirm", "result", "floatbutton"] },
  { id: "sc-data", label: "Dados, Tabelas & Gráficos", icon: BarChart2, href: "/showcase/data", group: "Categorias", keywords: ["chart", "grafico", "datatable", "spreadsheet", "descriptionlist", "transferlist", "kanban", "treeview", "table", "jsonviewer", "barcode", "stats"] },
  { id: "sc-comm", label: "Comunicação", icon: MessageCircle, href: "/showcase/communication", group: "Categorias", keywords: ["chat", "email", "notification", "smartobject", "composer"] },
  { id: "sc-nav", label: "Navegação & Layout", icon: Navigation, href: "/showcase/navigation", group: "Categorias", keywords: ["tabs", "pagination", "dock", "sidebar", "breadcrumb", "accordion", "command", "kbd", "splitter", "splitpane", "toc"] },
  { id: "sc-anim", label: "Animação, Código & Tour", icon: Play, href: "/showcase/animation", group: "Categorias", keywords: ["text-rotate", "stepper", "timeline", "codeblock", "codeeditor", "marquee", "snippet", "copybutton", "tour"] },
  // Editores & Formulários Avançados (Acesso Direto)
  { id: "cmp-rte", label: "RichTextEditor & RichTextField (Slash / & A4)", icon: FileEdit, href: "/showcase/forms#rich-text-editor", group: "Editores & Formulários", keywords: ["editor", "richtext", "tiptap", "wysiwyg", "slash", "markdown", "documento", "a4", "callout"] },
  { id: "cmp-code", label: "CodeEditor (Live Syntax Highlight & Run)", icon: FileCode, href: "/showcase/animation#code-editor", group: "Editores & Formulários", keywords: ["code", "editor", "ide", "json", "sql", "typescript", "syntax", "highlight"] },
  { id: "cmp-cascader", label: "CascaderField (Seleção Hierárquica em Colunas)", icon: Network, href: "/showcase/forms#cascader-field", group: "Editores & Formulários", keywords: ["cascader", "hierarquia", "colunas", "categoria", "regiao"] },
  { id: "cmp-treeselect", label: "TreeSelectField (Árvore Dropdown & Checkable)", icon: Network, href: "/showcase/forms#tree-select-field", group: "Editores & Formulários", keywords: ["treeselect", "tree", "arvore", "select", "checkbox"] },
  { id: "cmp-tags", label: "TagsInput, TagInputField & CheckableTagGroup", icon: Tag, href: "/showcase/forms#tags-input", group: "Editores & Formulários", keywords: ["tags", "tagsinput", "taginputfield", "checkabletag", "etiquetas"] },
  { id: "cmp-mentions", label: "MentionsField (Menções @ e #)", icon: Tag, href: "/showcase/forms#mentions-field", group: "Editores & Formulários", keywords: ["mentions", "arroba", "mencao", "hashtag"] },
  { id: "cmp-seg", label: "SegmentedControl", icon: FormInput, href: "/showcase/forms#segmented-control", group: "Editores & Formulários", keywords: ["segmented", "segmentedcontrol", "toggle", "abas"] },
  { id: "cmp-dropzone", label: "FileDropzone (Drag & Drop de Arquivos)", icon: UploadCloud, href: "/showcase/forms#file-dropzone", group: "Editores & Formulários", keywords: ["dropzone", "upload", "arquivo", "pdf", "xml"] },
  { id: "cmp-sign", label: "SignaturePad & SignatureField", icon: PenTool, href: "/showcase/forms#signature-pad", group: "Editores & Formulários", keywords: ["signature", "assinatura", "caneta", "canvas", "contrato", "canhoto"] },
  { id: "cmp-inline", label: "InlineEdit (Edição Direta Clique-para-Editar)", icon: FileEdit, href: "/showcase/forms#inline-edit", group: "Editores & Formulários", keywords: ["inline", "edit", "editable", "titulo", "preco"] },
  // Componentes de Display, Feedback, Dados & Navegação
  { id: "cmp-qr", label: "QRCode (ISO/IEC 18004, PIX, Logo & Status)", icon: QrCode, href: "/showcase/display#qrcode", group: "Componentes em Destaque", keywords: ["qrcode", "qr", "pix", "nfe", "iso", "codigo"] },
  { id: "cmp-watermark", label: "Watermark (Marca d'Água Anti-Tamper)", icon: ShieldCheck, href: "/showcase/display#watermark", group: "Componentes em Destaque", keywords: ["watermark", "marca", "confidencial", "seguranca"] },
  { id: "cmp-skeleton", label: "Skeleton Suite (Avatar, Card, Table & Wave)", icon: Layers, href: "/showcase/display#skeleton-suite", group: "Componentes em Destaque", keywords: ["skeleton", "shimmer", "wave", "loading", "placeholder"] },
  { id: "cmp-badges", label: "Badge, Badge Status & BadgeRibbon", icon: Tag, href: "/showcase/display#badges", group: "Componentes em Destaque", keywords: ["badge", "ribbon", "faixa", "status", "etiqueta"] },
  { id: "cmp-masonry", label: "Masonry (Layout Waterfall em Cascata)", icon: Layers, href: "/showcase/display#masonry", group: "Componentes em Destaque", keywords: ["masonry", "waterfall", "grade", "cascata"] },
  { id: "cmp-stats", label: "StatCard, StatsSegmentsCard & StatsRingCard", icon: BarChart2, href: "/showcase/display#stat-card", group: "Componentes em Destaque", keywords: ["statcard", "stats", "ring", "segments", "kpi"] },
  { id: "cmp-lightbox", label: "ImageLightbox, Callout, Spoiler & HighlightText", icon: Sparkles, href: "/showcase/display#callout-spoiler-highlight", group: "Componentes em Destaque", keywords: ["lightbox", "zoom", "callout", "spoiler", "highlight"] },
  { id: "cmp-popconfirm", label: "Popconfirm (Confirmação Leve Ancorada)", icon: HelpCircle, href: "/showcase/actions#popconfirm", group: "Componentes em Destaque", keywords: ["popconfirm", "confirm", "popover", "excluir"] },
  { id: "cmp-result", label: "Result (Sucesso, Erro, 403, 404, 500)", icon: CheckCircle2, href: "/showcase/actions#result", group: "Componentes em Destaque", keywords: ["result", "sucesso", "403", "404", "500", "comprovante"] },
  { id: "cmp-float", label: "FloatButton, FloatButtonGroup & BackTop", icon: Zap, href: "/showcase/actions#float-button", group: "Componentes em Destaque", keywords: ["floatbutton", "fab", "backtop", "topo", "scroll"] },
  { id: "cmp-pwdconfirm", label: "PasswordConfirmDialog (Autorização & Senha)", icon: ShieldCheck, href: "/showcase/actions#password-confirm", group: "Componentes em Destaque", keywords: ["password", "senha", "confirm", "auditoria"] },
  { id: "cmp-sortable", label: "SortableList (Drag & Drop Acessível)", icon: ListChecks, href: "/showcase/actions#sortable-list", group: "Componentes em Destaque", keywords: ["sortable", "drag", "dnd", "lista", "reordenar"] },
  { id: "cmp-json", label: "JsonViewer (Árvore JSON & Copy Path)", icon: FileCode, href: "/showcase/data#json-viewer", group: "Componentes em Destaque", keywords: ["json", "jsonviewer", "payload", "tree"] },
  { id: "cmp-barcode", label: "Barcode (Code-128 Puro SVG — EAN / Chave NF-e)", icon: Barcode, href: "/showcase/data#barcode", group: "Componentes em Destaque", keywords: ["barcode", "code128", "ean", "nfe", "etiqueta"] },
  { id: "cmp-splitter", label: "SplitPane / Splitter & Editable-Card Tabs", icon: Columns, href: "/showcase/navigation#split-pane", group: "Componentes em Destaque", keywords: ["splitter", "splitpane", "painel", "tabs", "editable-card", "toc", "tableofcontents"] },
  { id: "cmp-stepper", label: "Stepper (Default, Outlined, Minimal, Navigation & Dot)", icon: ListChecks, href: "/showcase/animation#stepper", group: "Componentes em Destaque", keywords: ["stepper", "steps", "navigation", "dot", "wizard"] },
  // Ações
  { id: "act-logout", label: "Sair", icon: LogOut, onSelect: () => {}, group: "Ações", keywords: ["logout", "sair", "exit"] },
];

// Stable ISO anchor to avoid SSR/CSR hydration mismatches (per docs/contributing.md)
const REF_TIME = new Date("2026-04-05T14:00:00.000Z").getTime();

export default function SiteHeader() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([
    {
      id: "n1",
      type: "success",
      title: "Deploy concluído",
      description: "Versão 1.3.0 publicada em produção sem erros.",
      timestamp: new Date(REF_TIME - 5 * 60_000),
      reference: { label: "ver-1.3.0", href: "#" },
    },
    {
      id: "n2",
      type: "warning",
      title: "Limite de uso próximo",
      description: "Você está a 85% do limite mensal do plano atual.",
      timestamp: new Date(REF_TIME - 35 * 60_000),
      href: "#",
    },
    {
      id: "n3",
      type: "info",
      title: "Novo membro adicionado",
      description: "Ana Lima entrou na equipe como desenvolvedora.",
      timestamp: new Date(REF_TIME - 2 * 3600_000),
      avatarFallback: "AL",
      read: true,
    },
    {
      id: "n4",
      type: "danger",
      title: "Falha no webhook",
      description: "3 tentativas sem resposta do endpoint /api/events.",
      timestamp: new Date(REF_TIME - 26 * 3600_000),
      reference: { label: "Ver logs", href: "#" },
      read: true,
    },
    {
      id: "n5",
      title: "Relatório mensal disponível",
      description: "O relatório mensal já pode ser baixado.",
      timestamp: new Date(REF_TIME - 8 * 24 * 3600_000),
      href: "#",
      read: true,
    },
  ]);

  const handleMarkRead = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const handleMarkAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleDismiss = (id: string) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));

  return (
    <HeaderWrapper
      nav={SITE_NAV}
      navDropdown
      brand={
        <Brand
          logo={
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.svg" alt="Lopes UI" width={64} height={64} className="dark:invert" />
          }
          title="Lopes UI"
        />
      }
      search={<CommandMenu items={SITE_COMMANDS} triggerLabel="Buscar..." />}
      extra={
        <>
          <NotificationBell
            notifications={notifs}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={handleDismiss}
          />
          <ThemeToggle />
        </>
      }
      profile={
        <ProfileTrigger initials="CL" name="Cristiano" showChevron menuWidth="w-60">
          <ProfileActions name="Cristiano Lopes" email="cristiano@lopes-ui.dev" />
        </ProfileTrigger>
      }
    />
  );
}
