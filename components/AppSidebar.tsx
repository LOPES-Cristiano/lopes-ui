"use client";

import Sidebar from "@/components/Sidebar";
import {
  Home, Zap, MousePointer2,
  LayoutDashboard, PanelLeft, Shield, Bell, HelpCircle,
  FormInput, ToggleLeft,
  UserCircle2, ChevronDown, BellRing, Tag, SquareStack, TableProperties, Database,
  GalleryHorizontal, ListChecks, GitCommitVertical, RefreshCw, MessageCircle, Navigation, FileCode, Network, CheckSquare,
} from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar
      title="LopesWare UI"
      subtitle="Lopes UI"
      logo={<span className="text-lg font-black text-zinc-800">🅻</span>}
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
              href: "/#accordion",
              icon: ChevronDown,
              children: [
                { label: "Default",   href: "/#accordion-default" },
                { label: "Variantes", href: "/#accordion-variants" },
                { label: "Props",     href: "/#accordion-props" },
              ],
            },
            {
              label: "Alert",
              href: "/#alerts",
              icon: BellRing,
              children: [
                { label: "Inline",    href: "/#alert-variants" },
                { label: "Com ações", href: "/#alert-actions" },
                { label: "Dialog",    href: "/#alert-dialog" },
                { label: "Props",     href: "/#alert-props" },
              ],
            },
            {
              label: "Avatar",
              href: "/#avatars",
              icon: UserCircle2,
              children: [
                { label: "Tamanhos & status", href: "/#avatar-sizes" },
                { label: "Formas",            href: "/#avatar-shapes" },
                { label: "AvatarGroup",       href: "/#avatar-group" },
                { label: "Fallback",          href: "/#avatar-fallback" },
                { label: "Props",             href: "/#avatar-props" },
              ],
            },
            {
              label: "Badge",
              href: "/#badges",
              icon: Tag,
              children: [
                { label: "Variantes",  href: "/#badge-variants" },
                { label: "Solid",      href: "/#badge-solid" },
                { label: "Funções",    href: "/#badge-features" },
                { label: "Props",      href: "/#badge-props" },
              ],
            },
            {
              label: "Breadcrumb",
              href: "/#breadcrumb",
              icon: Navigation,
              children: [
                { label: "Separadores",  href: "/#breadcrumb-separators" },
                { label: "Home icon",    href: "/#breadcrumb-home" },
                { label: "Com ícones",   href: "/#breadcrumb-icons" },
                { label: "Colapso",      href: "/#breadcrumb-collapse" },
                { label: "Props",        href: "/#breadcrumb-props" },
              ],
            },
            {
              label: "Button",
              href: "/#button",
              icon: MousePointer2,
              children: [
                { label: "Variantes",          href: "/#button-variants" },
                { label: "Tamanhos",           href: "/#button-sizes" },
                { label: "Ícones & Loading",   href: "/#button-icons" },
                { label: "Tooltip & Confirm",  href: "/#action-button" },
                { label: "Props",              href: "/#button-props" },
              ],
            },
            {
              label: "Card",
              href: "/#cards",
              icon: SquareStack,
              children: [
                { label: "Variantes",   href: "/#card-variants" },
                { label: "Sombras",     href: "/#card-shadows" },
                { label: "Backgrounds", href: "/#card-backgrounds" },
                { label: "Accent",      href: "/#card-accent" },
                { label: "Com header",  href: "/#card-header" },
                { label: "Interativos", href: "/#card-interactive" },
                { label: "Radius",      href: "/#card-radius" },
                { label: "Props",       href: "/#card-props" },
              ],
            },
            {
              label: "Checkbox & Radio",
              href: "/#checkboxgroup",
              icon: CheckSquare,
              children: [
                { label: "Quadrado & círculo",    href: "/#checkbox-shapes" },
                { label: "Horizontal & tamanhos", href: "/#checkbox-horizontal" },
                { label: "Variant card",          href: "/#checkbox-card" },
                { label: "Variant button",        href: "/#checkbox-button" },
                { label: "Props",                 href: "/#advanced-field-props" },
              ],
            },
            {
              label: "Carousel",
              href: "/#carousel",
              icon: GalleryHorizontal,
              children: [
                { label: "Básico",       href: "/#carousel-basic" },
                { label: "Multi-slide",  href: "/#carousel-multi" },
                { label: "AutoPlay",     href: "/#carousel-autoplay" },
              ],
            },
            {
              label: "Chat / Mensagens",
              href: "/#chat",
              icon: MessageCircle,
              children: [
                { label: "Bolhas de texto",    href: "/#chat-bubbles" },
                { label: "Status de entrega",  href: "/#chat-status" },
                { label: "Tipos de mensagem",  href: "/#chat-types" },
                { label: "Reply & reações",    href: "/#chat-reply-reactions" },
                { label: "Typing indicator",   href: "/#chat-typing" },
                { label: "Composer",           href: "/#chat-composer" },
                { label: "Lista de conversas", href: "/#chat-conversation-list" },
                { label: "Chat Window",        href: "/#chat-window" },
                { label: "Props",              href: "/#chat-props" },
              ],
            },
            {
              label: "CodeBlock",
              href: "/#codeblock",
              icon: FileCode,
              children: [
                { label: "Básico",         href: "/#codeblock-basic" },
                { label: "Terminal",       href: "/#codeblock-terminal" },
                { label: "Números de linha", href: "/#codeblock-linenumbers" },
                { label: "Recolher",       href: "/#codeblock-showmore" },
                { label: "Abas",           href: "/#codeblock-tabs" },
                { label: "Props",          href: "/#codeblock-props" },
              ],
            },
            {
              label: "DataTable",
              href: "/#datatable",
              icon: Database,
              children: [
                { label: "Completo",         href: "/#datatable-full" },
                { label: "Abas por situação",href: "/#datatable-tabs" },
                { label: "Ações inline",     href: "/#datatable-inline-actions" },
                { label: "→ Menu dropdown",  href: "/#datatable-actions-menu" },
                { label: "→ Todos inline",   href: "/#datatable-actions-inline" },
                { label: "→ Misto",          href: "/#datatable-actions-mixed" },
                { label: "Simples",          href: "/#datatable-simple" },
                { label: "Striped",          href: "/#datatable-striped" },
                { label: "Props",            href: "/#datatable-props" },
              ],
            },
            {
              label: "Forms",
              href: "/#forms",
              icon: FormInput,
              children: [
                { label: "TextField",            href: "/#fields-text" },
                { label: "Ícones & afixos",      href: "/#fields-addons" },
                { label: "Estados",              href: "/#fields-states" },
                { label: "Label inline",         href: "/#fields-inline" },
                { label: "NumberField",          href: "/#fields-number" },
                { label: "Form completo",        href: "/#form-complete" },
                { label: "Props",                href: "/#field-props" },
                { label: "DateField & TimeField", href: "/#datetime-fields" },
                { label: "CheckboxGroup",         href: "/#checkboxgroup", children: [
                  { label: "Quadrado & círculo",    href: "/#checkbox-shapes" },
                  { label: "Horizontal & tamanhos", href: "/#checkbox-horizontal" },
                  { label: "Variant card",          href: "/#checkbox-card" },
                  { label: "Variant button",        href: "/#checkbox-button" },
                ]},
                { label: "AutocompleteField",    href: "/#autocomplete-examples" },
                { label: "MultiSelectField",     href: "/#multiselect-examples" },
                { label: "FileField",            href: "/#file-examples" },
              ],
            },
            {
              label: "Header & Nav",
              href: "/#header",
              icon: LayoutDashboard,
              children: [
                { label: "Slots", href: "/#header-slots" },
                { label: "Props", href: "/#header-props" },
              ],
            },
            {
              label: "Interação",
              icon: ToggleLeft,
              children: [
                { label: "Switch — tamanhos",    href: "/#switch-sizes" },
                { label: "Switch — label",       href: "/#switch-label" },
                { label: "Context Menu",         href: "/#context-menu-basic" },
                { label: "Command Menu",         href: "/#command-menu" },
                { label: "Props",                href: "/#interaction-props" },
              ],
            },
            {
              label: "Sidebar",
              href: "/#sidebar",
              icon: PanelLeft,
              children: [
                { label: "Demo interativo", href: "/#sidebar-demo" },
              ],
            },
            {
              label: "StatusPage",
              href: "/#status-pages",
              icon: Shield,
              children: [
                { label: "Inline",      href: "/#status-inline" },
                { label: "Full-screen", href: "/#status-fullscreen" },
                { label: "Props",       href: "/#status-props" },
              ],
            },
            {
              label: "Stepper",
              href: "/#stepper",
              icon: ListChecks,
              children: [
                { label: "Horizontal",   href: "/#stepper-horizontal" },
                { label: "Vertical",     href: "/#stepper-vertical" },
                { label: "Variantes",    href: "/#stepper-variants" },
              ],
            },
            {
              label: "Table",
              href: "/#tables",
              icon: TableProperties,
              children: [
                { label: "Variantes",   href: "/#table-variants" },
                { label: "Tamanhos",    href: "/#table-sizes" },
                { label: "Vazio",       href: "/#table-empty" },
              ],
            },
            {
              label: "TextRotate",
              href: "/#text-rotate",
              icon: RefreshCw,
              children: [
                { label: "Inline (frase)",    href: "/#text-rotate-inline" },
                { label: "Stagger do centro", href: "/#text-rotate-standalone" },
                { label: "Preset rise",       href: "/#text-rotate-rise" },
                { label: "Preset discrete",   href: "/#text-rotate-discrete" },
                { label: "Stagger por palavra", href: "/#text-rotate-emojis" },
                { label: "Controle manual",   href: "/#text-rotate-manual" },
              ],
            },
            {
              label: "Timeline",
              href: "/#timeline",
              icon: GitCommitVertical,
              children: [
                { label: "Esquerda",    href: "/#timeline-left" },
                { label: "Alternada",   href: "/#timeline-alternate" },
                { label: "Cores",       href: "/#timeline-colors" },
              ],
            },
            {
              label: "Toast Notifications",
              href: "/#toasts",
              icon: Bell,
              children: [
                { label: "Todos os tipos",       href: "/#toasts-preview" },
                { label: "Exemplos interativos", href: "/#toasts-examples" },
              ],
            },
            {
              label: "Tree View",
              href: "/#treeview",
              icon: Network,
              children: [
                { label: "Simple sm",       href: "/#treeview-simple-sm" },
                { label: "Simple md",       href: "/#treeview-simple-md" },
                { label: "Seleção múltipla", href: "/#treeview-multiselect" },
                { label: "Drag & Drop",     href: "/#treeview-dnd" },
                { label: "Props",           href: "/#treeview-props" },
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
