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
        description: "TextField, SelectField, DateRangePicker, ColorPicker, TagInput, ZodForm…",
      },
      {
        label: "Display & Vitrine",
        href: "/showcase/display",
        icon: Layers,
        description: "Avatar, Badge, Card, BentoGrid, Progress, HoverCard, Countdown…",
      },
      {
        label: "Ações & Feedback",
        href: "/showcase/actions",
        icon: Zap,
        description: "Button, ButtonGroup, ToggleGroup, SpeedDial, Modal, FormDrawer, Toast…",
      },
      {
        label: "Dados, Tabelas & Gráficos",
        href: "/showcase/data",
        icon: BarChart2,
        description: "Chart, DataTable, Spreadsheet, DescriptionList, KanbanBoard, TreeView…",
      },
      {
        label: "Comunicação",
        href: "/showcase/communication",
        icon: MessageCircle,
        description: "ChatWindow, EmailComposer, NotificationBell, SmartObject…",
      },
      {
        label: "Navegação & Layout",
        href: "/showcase/navigation",
        icon: Navigation,
        description: "Tabs, Pagination, Dock, Sidebar, Header, Breadcrumb, CommandMenu…",
      },
      {
        label: "Animação, Código & Tour",
        href: "/showcase/animation",
        icon: Play,
        description: "CodeBlock, Snippet, Marquee, Tour, CodeEditor, TextRotate, Stepper…",
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
  { id: "nav-builder", label: "UI Builder Visual", icon: Wrench, href: "/ui-builder", group: "Páginas & Templates", keywords: ["builder", "editor", "gerador"] },
  // Categorias de Componentes
  { id: "sc-forms", label: "Formulários & Inputs", icon: FormInput, href: "/showcase/forms", group: "Categorias", keywords: ["form", "input", "login", "otp", "select", "datepicker", "zod", "colorpicker", "taginput", "slider", "radiogroup"] },
  { id: "sc-display", label: "Display & Vitrine", icon: Layers, href: "/showcase/display", group: "Categorias", keywords: ["avatar", "badge", "statusbadge", "bento", "card", "carousel", "countdown", "diff", "hovercard", "mockup"] },
  { id: "sc-actions", label: "Ações & Feedback", icon: Zap, href: "/showcase/actions", group: "Categorias", keywords: ["button", "buttongroup", "togglegroup", "speeddial", "swap", "loading", "alert", "toast", "drawer", "modal"] },
  { id: "sc-data", label: "Dados, Tabelas & Gráficos", icon: BarChart2, href: "/showcase/data", group: "Categorias", keywords: ["chart", "grafico", "datatable", "spreadsheet", "descriptionlist", "transferlist", "kanban", "treeview", "table"] },
  { id: "sc-comm", label: "Comunicação", icon: MessageCircle, href: "/showcase/communication", group: "Categorias", keywords: ["chat", "email", "notification", "smartobject"] },
  { id: "sc-nav", label: "Navegação & Layout", icon: Navigation, href: "/showcase/navigation", group: "Categorias", keywords: ["tabs", "pagination", "dock", "sidebar", "breadcrumb", "accordion", "command", "kbd"] },
  { id: "sc-anim", label: "Animação, Código & Tour", icon: Play, href: "/showcase/animation", group: "Categorias", keywords: ["text-rotate", "stepper", "timeline", "codeblock", "codeeditor", "marquee", "snippet", "copybutton", "tour"] },
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
