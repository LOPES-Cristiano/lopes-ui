"use client";

import Sidebar from "@/components/Sidebar";
import {
  Home, Zap, MousePointer2,
  LayoutDashboard, PanelLeft, Shield, Bell, HelpCircle,
  FormInput, ToggleLeft,
  UserCircle2, ChevronDown, BellRing, Tag, SquareStack, TableProperties, Database,
  GalleryHorizontal, ListChecks, GitCommitVertical, RefreshCw, MessageCircle, Navigation, FileCode, Network, FileEdit,
  CalendarDays, CalendarRange,
  LayoutGrid, TrendingUp, Activity, Mail,
  LayoutTemplate, PackageOpen, ShieldAlert,
  Rss, LogIn, KeyRound, LockKeyhole,
  PanelRightOpen, Radio, Filter, Inbox, Columns, Banknote, Command, Sparkles, PanelBottom,
} from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar
      title="Lopes UI"
      subtitle="Lopes UI"
      logo={<span className="text-lg font-black text-zinc-800 dark:text-zinc-100 ">🅻</span>}
      collapsible
      pinnable
      groups={[
        {
          id: "start",
          label: "Início",
          items: [
            { label: "Visão geral", href: "/#overview", icon: Home },
            { label: "Instalação",  href: "/#install",  icon: Zap },
          ],
        },
        {
          id: "components",
          label: "Componentes",
          items: [
            {
              label: "Accordion",
              href: "/showcase/navigation#accordion",
              icon: ChevronDown,
              children: [
                { label: "Default",   href: "/showcase/navigation#accordion-default" },
                { label: "Variantes", href: "/showcase/navigation#accordion-variants" },
                { label: "Props",     href: "/showcase/navigation#accordion-props" },
              ],
            },
            {
              label: "Activity Feed",
              href: "/showcase/data#activity-feed",
              icon: Rss,
              children: [
                { label: "Básico",           href: "/showcase/data#activity-feed-basic" },
                { label: "Altura máxima",    href: "/showcase/data#activity-feed-max-height" },
                { label: "Carregar mais",    href: "/showcase/data#activity-feed-load-more" },
                { label: "Skeleton",         href: "/showcase/data#activity-feed-skeleton" },
                { label: "Props",            href: "/showcase/data#activity-feed-props" },
              ],
            },
            {
              label: "Alert",
              href: "/showcase/actions#alerts",
              icon: BellRing,
              children: [
                { label: "Inline",    href: "/showcase/actions#alert-variants" },
                { label: "Com ações", href: "/showcase/actions#alert-actions" },
                { label: "Dialog",    href: "/showcase/actions#alert-dialog" },
                { label: "Props",     href: "/showcase/actions#alert-props" },
              ],
            },
             {
              label: "Agenda",
              href: "/showcase/display#agenda",
              icon: CalendarRange,
              children: [
                { label: "Demo",       href: "/showcase/display#agenda-demo" },
                { label: "Tamanhos",   href: "/showcase/display#agenda-compact" },
                { label: "Vazio",      href: "/showcase/display#agenda-empty" },
                { label: "Props",      href: "/showcase/display#agenda-props" },
              ],
            },
            {
              label: "App Launcher",
              href: "/showcase/navigation#app-launcher",
              icon: LayoutGrid,
              children: [
                { label: "Grade básica",     href: "/showcase/navigation#app-launcher-basic" },
                { label: "Com busca",        href: "/showcase/navigation#app-launcher-search" },
                { label: "Agrupado",         href: "/showcase/navigation#app-launcher-grouped" },
                { label: "Props",            href: "/showcase/navigation#app-launcher-props" },
              ],
            },
            {
              label: "Avatar",
              href: "/showcase/display#avatars",
              icon: UserCircle2,
              children: [
                { label: "Tamanhos & status", href: "/showcase/display#avatar-sizes" },
                { label: "Formas",            href: "/showcase/display#avatar-shapes" },
                { label: "AvatarGroup",       href: "/showcase/display#avatar-group" },
                { label: "Fallback",          href: "/showcase/display#avatar-fallback" },
                { label: "Props",             href: "/showcase/display#avatar-props" },
              ],
            },
            {
              label: "Badge",
              href: "/showcase/display#badges",
              icon: Tag,
              children: [
                { label: "Variantes",  href: "/showcase/display#badge-variants" },
                { label: "Solid",      href: "/showcase/display#badge-solid" },
                { label: "Funções",    href: "/showcase/display#badge-features" },
                { label: "Props",      href: "/showcase/display#badge-props" },
              ],
            },
            {
              label: "Breadcrumb",
              href: "/showcase/navigation#breadcrumb",
              icon: Navigation,
              children: [
                { label: "Separadores",  href: "/showcase/navigation#breadcrumb-separators" },
                { label: "Home icon",    href: "/showcase/navigation#breadcrumb-home" },
                { label: "Com ícones",   href: "/showcase/navigation#breadcrumb-icons" },
                { label: "Colapso",      href: "/showcase/navigation#breadcrumb-collapse" },
                { label: "Props",        href: "/showcase/navigation#breadcrumb-props" },
              ],
            },
            {
              label: "Button",
              href: "/showcase/actions#button",
              icon: MousePointer2,
              children: [
                { label: "Variantes",          href: "/showcase/actions#button-variants" },
                { label: "Tamanhos",           href: "/showcase/actions#button-sizes" },
                { label: "Ícones & Loading",   href: "/showcase/actions#button-icons" },
                { label: "Tooltip & Confirm",  href: "/showcase/actions#action-button" },
                { label: "Props",              href: "/showcase/actions#button-props" },
              ],
            },
            {
              label: "Card",
              href: "/showcase/display#cards",
              icon: SquareStack,
              children: [
                { label: "Variantes",   href: "/showcase/display#card-variants" },
                { label: "Sombras",     href: "/showcase/display#card-shadows" },
                { label: "Backgrounds", href: "/showcase/display#card-backgrounds" },
                { label: "Accent",      href: "/showcase/display#card-accent" },
                { label: "Com header",  href: "/showcase/display#card-header" },
                { label: "Interativos", href: "/showcase/display#card-interactive" },
                { label: "Radius",      href: "/showcase/display#card-radius" },
                { label: "Props",       href: "/showcase/display#card-props" },
              ],
            },
            {
              label: "Calendar",
              href: "/showcase/display#calendar",
              icon: CalendarDays,
              children: [
                { label: "Seleção simples", href: "/showcase/display#calendar-basic" },
                { label: "Intervalo",       href: "/showcase/display#calendar-range" },
                { label: "Eventos — dots",  href: "/showcase/display#calendar-events" },
                { label: "Eventos — chips", href: "/showcase/display#calendar-chip" },
                { label: "Props",           href: "/showcase/display#calendar-props" },
              ],
            },
            {
              label: "Carousel",
              href: "/showcase/display#carousel",
              icon: GalleryHorizontal,
              children: [
                { label: "Básico",       href: "/showcase/display#carousel-basic" },
                { label: "Multi-slide",  href: "/showcase/display#carousel-multi" },
                { label: "AutoPlay",     href: "/showcase/display#carousel-autoplay" },
              ],
            },
            {
              label: "Chat / Mensagens",
              href: "/showcase/communication#chat",
              icon: MessageCircle,
              children: [
                { label: "Bolhas de texto",    href: "/showcase/communication#chat-bubbles" },
                { label: "Status de entrega",  href: "/showcase/communication#chat-status" },
                { label: "Tipos de mensagem",  href: "/showcase/communication#chat-types" },
                { label: "Reply & reações",    href: "/showcase/communication#chat-reply-reactions" },
                { label: "Typing indicator",   href: "/showcase/communication#chat-typing" },
                { label: "Composer",           href: "/showcase/communication#chat-composer" },
                { label: "Lista de conversas", href: "/showcase/communication#chat-conversation-list" },
                { label: "Chat Window",        href: "/showcase/communication#chat-window" },
                { label: "Smart Object",       href: "/showcase/communication#smart-chat" },
                { label: "SmartObject Card",   href: "/showcase/communication#smart-object-card" },
                { label: "Props",              href: "/showcase/communication#chat-props" },
              ],
            },
            {
              label: "CodeBlock",
              href: "/showcase/animation#codeblock",
              icon: FileCode,
              children: [
                { label: "Básico",             href: "/showcase/animation#codeblock-basic" },
                { label: "Terminal",           href: "/showcase/animation#codeblock-terminal" },
                { label: "Números de linha",   href: "/showcase/animation#codeblock-linenumbers" },
                { label: "Recolher",           href: "/showcase/animation#codeblock-showmore" },
                { label: "Abas",               href: "/showcase/animation#codeblock-tabs" },
                { label: "Props",              href: "/showcase/animation#codeblock-props" },
              ],
            },
            {
              label: "Confirm Dialog",
              href: "/showcase/actions#confirm-dialog",
              icon: ShieldAlert,
              children: [
                { label: "Danger",   href: "/showcase/actions#confirm-dialog-danger" },
                { label: "Warning",  href: "/showcase/actions#confirm-dialog-warning" },
                { label: "Info",     href: "/showcase/actions#confirm-dialog-info" },
                { label: "Com body", href: "/showcase/actions#confirm-dialog-body" },
                { label: "Props",    href: "/showcase/actions#confirm-dialog-props" },
              ],
            },
            {
              label: "DataTable",
              href: "/showcase/data#datatable",
              icon: Database,
              children: [
                { label: "Completo",          href: "/showcase/data#datatable-full" },
                { label: "Abas por situação", href: "/showcase/data#datatable-tabs" },
                { label: "Ações inline",      href: "/showcase/data#datatable-inline-actions" },
                { label: "→ Menu dropdown",   href: "/showcase/data#datatable-actions-menu" },
                { label: "→ Todos inline",    href: "/showcase/data#datatable-actions-inline" },
                { label: "→ Misto",           href: "/showcase/data#datatable-actions-mixed" },
                { label: "Simples",           href: "/showcase/data#datatable-simple" },
                { label: "Striped",           href: "/showcase/data#datatable-striped" },
                { label: "Props",             href: "/showcase/data#datatable-props" },
              ],
            },
            {
              label: "Drawer",
              href: "/showcase/actions#drawer",
              icon: PanelRightOpen,
              children: [
                { label: "Demo interativo", href: "/showcase/actions#drawer-demo" },
                { label: "Props",           href: "/showcase/actions#drawer-props" },
              ],
            },
            {
              label: "Email Composer",
              href: "/showcase/communication#email-composer",
              icon: Mail,
              children: [
                { label: "Janela padrão",    href: "/showcase/communication#email-composer-window" },
                { label: "Inline",           href: "/showcase/communication#email-composer-inline" },
                { label: "Props",            href: "/showcase/communication#email-composer-props" },
              ],
            },
            {
              label: "Empty State",
              href: "/showcase/actions#empty-state",
              icon: PackageOpen,
              children: [
                { label: "Presets",          href: "/showcase/actions#empty-state-presets" },
                { label: "Com ações",        href: "/showcase/actions#empty-state-actions" },
                { label: "Tamanhos",         href: "/showcase/actions#empty-state-sizes" },
                { label: "fill",             href: "/showcase/actions#empty-state-fill" },
                { label: "Props",            href: "/showcase/actions#empty-state-props" },
              ],
            },
            {
              label: "Filter Bar",
              href: "/showcase/data#filter-bar",
              icon: Filter,
              children: [
                { label: "Demo interativo", href: "/showcase/data#filter-bar-demo" },
                { label: "Somente leitura", href: "/showcase/data#filter-bar-readonly" },
                { label: "Props",           href: "/showcase/data#filter-bar-props" },
              ],
            },
            {
              label: "Footer",
              href: "/showcase/navigation#footer",
              icon: PanelBottom,
              children: [
                { label: "Padrão",   href: "/showcase/navigation#footer-default" },
                { label: "Minimal",  href: "/showcase/navigation#footer-minimal" },
                { label: "Bordered", href: "/showcase/navigation#footer-bordered" },
                { label: "Props",    href: "/showcase/navigation#footer-props" },
              ],
            },
            {
              label: "Forms",
              href: "/showcase/forms#forms",
              icon: FormInput,
              children: [
                { label: "TextField",             href: "/showcase/forms#fields-text" },
                { label: "Ícones & afixos",       href: "/showcase/forms#fields-addons" },
                { label: "Estados",               href: "/showcase/forms#fields-states" },
                { label: "Label inline",          href: "/showcase/forms#fields-inline" },
                { label: "NumberField",           href: "/showcase/forms#fields-number" },
                { label: "Form completo",         href: "/showcase/forms#form-complete" },
                { label: "Props",                 href: "/showcase/forms#field-props" },
                { label: "DateField & TimeField", href: "/showcase/forms#datetime-fields" },
                { label: "CheckboxGroup",         href: "/showcase/forms#checkboxgroup" },
                { label: "AutocompleteField",     href: "/showcase/forms#autocomplete-examples" },
                { label: "MultiSelectField",      href: "/showcase/forms#multiselect-examples" },
                { label: "FileField",             href: "/showcase/forms#file-examples" },
              ],
            },
            {
              label: "Header & Nav",
              href: "/showcase/navigation#header",
              icon: LayoutDashboard,
              children: [
                { label: "Slots", href: "/showcase/navigation#header-slots" },
                { label: "Props", href: "/showcase/navigation#header-props" },
              ],
            },
            {
              label: "Inbox List",
              href: "/showcase/data#inbox-list",
              icon: Inbox,
              children: [
                { label: "Demo",      href: "/showcase/data#inbox-list-demo" },
                { label: "Skeleton",  href: "/showcase/data#inbox-list-skeleton" },
                { label: "Vazio",     href: "/showcase/data#inbox-list-empty" },
                { label: "Props",     href: "/showcase/data#inbox-list-props" },
              ],
            },
            {
              label: "Interação",
              href: "/showcase/communication#interactions",
              icon: ToggleLeft,
              children: [
                { label: "Switch — tamanhos",    href: "/showcase/communication#switch-sizes" },
                { label: "Switch — label",       href: "/showcase/communication#switch-label" },
                { label: "Context Menu",         href: "/showcase/communication#context-menu-basic" },
                { label: "Command Menu",         href: "/showcase/navigation#command-menu" },
                { label: "Props",                href: "/showcase/communication#interaction-props" },
              ],
            },
            {
              label: "Kanban Board",
              href: "/showcase/data#kanban-board",
              icon: LayoutGrid,
              children: [
                { label: "Demo completo", href: "/showcase/data#kanban-board-demo" },
                { label: "Props",         href: "/showcase/data#kanban-board-props" },
              ],
            },
            {
              label: "Login Form",
              href: "/showcase/forms#login-form",
              icon: LogIn,
              children: [
                { label: "Básico",      href: "/showcase/forms#login-form-basic" },
                { label: "Com OAuth",   href: "/showcase/forms#login-form-oauth" },
                { label: "Props",       href: "/showcase/forms#login-form-props" },
              ],
            },
            {
              label: "Notification Bell",
              href: "/showcase/communication#notification-bell",
              icon: BellRing,
              children: [
                { label: "Demo interativo", href: "/showcase/communication#notification-bell-demo" },
                { label: "Estado vazio",    href: "/showcase/communication#notification-bell-empty" },
                { label: "Props",           href: "/showcase/communication#notification-bell-props" },
              ],
            },
            {
              label: "OTP Input",
              href: "/showcase/forms#otp-input",
              icon: KeyRound,
              children: [
                { label: "6 dígitos",   href: "/showcase/forms#otp-input-basic" },
                { label: "Máscara",     href: "/showcase/forms#otp-input-mask" },
                { label: "4 dígitos",   href: "/showcase/forms#otp-input-4" },
                { label: "Erro",        href: "/showcase/forms#otp-input-error" },
                { label: "Props",       href: "/showcase/forms#otp-input-props" },
              ],
            },
            {
              label: "Page Header",
              href: "/showcase/navigation#page-header",
              icon: LayoutTemplate,
              children: [
                { label: "Básico",        href: "/showcase/navigation#page-header-basic" },
                { label: "Com actions",   href: "/showcase/navigation#page-header-actions" },
                { label: "Variantes",     href: "/showcase/navigation#page-header-variants" },
                { label: "Props",         href: "/showcase/navigation#page-header-props" },
              ],
            },
            {
              label: "Password Strength",
              href: "/showcase/forms#password-strength",
              icon: LockKeyhole,
              children: [
                { label: "Interativo",  href: "/showcase/forms#password-strength-demo" },
                { label: "Níveis",      href: "/showcase/forms#password-strength-levels" },
                { label: "Props",       href: "/showcase/forms#password-strength-props" },
              ],
            },
            {
              label: "Ping Indicator",
              href: "/showcase/display#ping-indicator",
              icon: Radio,
              children: [
                { label: "Status",        href: "/showcase/display#ping-indicator-statuses" },
                { label: "Tamanhos",      href: "/showcase/display#ping-indicator-sizes" },
                { label: "Props",         href: "/showcase/display#ping-indicator-props" },
              ],
            },
            {
              label: "Price Input",
              href: "/showcase/forms#price-input",
              icon: Banknote,
              children: [
                { label: "Demo interativo", href: "/showcase/forms#price-input-demo" },
                { label: "Props",           href: "/showcase/forms#price-input-props" },
              ],
            },
            {
              label: "Quick Actions",
              href: "/showcase/navigation#quick-actions",
              icon: Sparkles,
              children: [
                { label: "Demo", href: "/showcase/navigation#quick-actions-demo" },
                { label: "Props", href: "/showcase/navigation#quick-actions-props" },
              ],
            },
            {
              label: "Rich Text Editor",
              href: "/showcase/forms#rich-text-editor",
              icon: FileEdit,
              children: [
                { label: "Editor completo",  href: "/showcase/forms#rte-demo" },
                { label: "Modo email",       href: "/showcase/forms#rte-email" },
                { label: "Somente leitura",  href: "/showcase/forms#rte-readonly" },
                { label: "Borderless",       href: "/showcase/forms#rte-borderless" },
                { label: "Props",            href: "/showcase/forms#rte-props" },
              ],
            },
            {
              label: "Service Status",
              href: "/showcase/display#service-status",
              icon: Activity,
              children: [
                { label: "Cards de status",  href: "/showcase/display#service-status-cards" },
                { label: "Uptime Bar",       href: "/showcase/display#service-status-uptime" },
                { label: "Props",            href: "/showcase/display#service-status-props" },
              ],
            },
            {
              label: "Shortcut Hint",
              href: "/showcase/navigation#shortcut-hint",
              icon: Command,
              children: [
                { label: "Exemplos", href: "/showcase/navigation#shortcut-hint-examples" },
                { label: "Props",    href: "/showcase/navigation#shortcut-hint-props" },
              ],
            },
            {
              label: "Sidebar",
              href: "/showcase/navigation#sidebar",
              icon: PanelLeft,
              children: [
                { label: "Demo interativo", href: "/showcase/navigation#sidebar-demo" },
              ],
            },
            {
              label: "Split Pane",
              href: "/showcase/navigation#split-pane",
              icon: Columns,
              children: [
                { label: "Horizontal", href: "/showcase/navigation#split-pane-horizontal" },
                { label: "Vertical",   href: "/showcase/navigation#split-pane-vertical" },
                { label: "Props",      href: "/showcase/navigation#split-pane-props" },
              ],
            },
            {
              label: "Stat Card",
              href: "/showcase/display#stat-card",
              icon: TrendingUp,
              children: [
                { label: "Básico",            href: "/showcase/display#stat-card-basic" },
                { label: "Com sparkline",     href: "/showcase/display#stat-card-spark" },
                { label: "Cores & variantes", href: "/showcase/display#stat-card-colors" },
                { label: "Props",             href: "/showcase/display#stat-card-props" },
              ],
            },
            {
              label: "Status Page",
              href: "/showcase/actions#status-pages",
              icon: Shield,
              children: [
                { label: "Inline",      href: "/showcase/actions#status-inline" },
                { label: "Full-screen", href: "/showcase/actions#status-fullscreen" },
                { label: "Props",       href: "/showcase/actions#status-props" },
              ],
            },
            {
              label: "Stepper",
              href: "/showcase/animation#stepper",
              icon: ListChecks,
              children: [
                { label: "Horizontal",   href: "/showcase/animation#stepper-horizontal" },
                { label: "Vertical",     href: "/showcase/animation#stepper-vertical" },
                { label: "Variantes",    href: "/showcase/animation#stepper-variants" },
              ],
            },
            {
              label: "Table",
              href: "/showcase/data#tables",
              icon: TableProperties,
              children: [
                { label: "Variantes",   href: "/showcase/data#table-variants" },
                { label: "Tamanhos",    href: "/showcase/data#table-sizes" },
                { label: "Vazio",       href: "/showcase/data#table-empty" },
              ],
            },
            {
              label: "TextRotate",
              href: "/showcase/animation#text-rotate",
              icon: RefreshCw,
              children: [
                { label: "Inline (frase)",      href: "/showcase/animation#text-rotate-inline" },
                { label: "Stagger do centro",   href: "/showcase/animation#text-rotate-standalone" },
                { label: "Preset rise",         href: "/showcase/animation#text-rotate-rise" },
                { label: "Preset discrete",     href: "/showcase/animation#text-rotate-discrete" },
                { label: "Stagger por palavra", href: "/showcase/animation#text-rotate-emojis" },
                { label: "Controle manual",     href: "/showcase/animation#text-rotate-manual" },
              ],
            },
            {
              label: "Timeline",
              href: "/showcase/animation#timeline",
              icon: GitCommitVertical,
              children: [
                { label: "Esquerda",    href: "/showcase/animation#timeline-left" },
                { label: "Alternada",   href: "/showcase/animation#timeline-alternate" },
                { label: "Cores",       href: "/showcase/animation#timeline-colors" },
              ],
            },
            {
              label: "Toast Notifications",
              href: "/showcase/actions#toasts",
              icon: Bell,
              children: [
                { label: "Todos os tipos",       href: "/showcase/actions#toasts-preview" },
                { label: "Exemplos interativos", href: "/showcase/actions#toasts-examples" },
              ],
            },
            {
              label: "Tree View",
              href: "/showcase/data#treeview",
              icon: Network,
              children: [
                { label: "Simple sm",        href: "/showcase/data#treeview-simple-sm" },
                { label: "Simple md",        href: "/showcase/data#treeview-simple-md" },
                { label: "Seleção múltipla", href: "/showcase/data#treeview-multiselect" },
                { label: "Drag & Drop",      href: "/showcase/data#treeview-dnd" },
                { label: "Props",            href: "/showcase/data#treeview-props" },
              ],
            },
          ],
        },
      ]}
      footerItems={[
        { icon: HelpCircle, label: "Suporte", onClick: () => {} },
      ]}
      user={{ name: "Cristiano Lopes", role: "Admin", initials: "CL", status: "online" }}
    />
  );
}

