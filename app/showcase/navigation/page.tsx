"use client";

import React from "react";
import { Plus, Star, Save, Trash2, LayoutDashboard, ShoppingCart, Mail, BarChart2, Users, BookOpen, Settings, Cpu, Code2, Rocket, MousePointer2, FileText, Bell, HelpCircle, LogOut, Home as HomeIcon, Tag as TagIcon, ShoppingBag, Copy, Lock as LockIcon } from "lucide-react";
import Badge from "@/components/Badge";
import Accordion from "@/components/Accordion";
import Breadcrumb from "@/components/Breadcrumb";
import CommandMenu from "@/components/CommandMenu";
import AppLauncher, { type AppItem } from "@/components/AppLauncher";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import SplitPane from "@/components/SplitPane";
import CodeBlock from "@/components/CodeBlock";
import Button from "@/components/Button";
import toast from "@/components/Toast";
import ShortcutHint from "@/components/ShortcutHint";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";
import Footer from "@/components/Footer";

const DEMO_APPS: AppItem[] = [
  { id: "hub",     label: "Project Hub",    icon: LayoutDashboard, color: "indigo",  category: "Core",        href: "#" },
  { id: "pdv",     label: "PDV",            icon: ShoppingCart,    color: "emerald", category: "Comercial",   href: "#" },
  { id: "erp",     label: "ERP",            icon: Cpu,             color: "blue",    category: "Core",        href: "#" },
  { id: "email",   label: "E-mail Corp.",   icon: Mail,            color: "amber",   category: "Comunicação", href: "#", badge: "Novo" },
  { id: "reports", label: "Relatórios",     icon: BarChart2,       color: "violet",  category: "Analytics",   href: "#" },
  { id: "users",   label: "Usuários",       icon: Users,           color: "pink",    category: "Core",        href: "#" },
  { id: "docs",    label: "Documentação",   icon: BookOpen,        color: "teal",    category: "Suporte",     href: "#", external: true },
  { id: "settings",label: "Configurações",  icon: Settings,        color: "zinc",    category: "Core",        href: "#" },
];

function QuickActionsPreview() {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const actions = [
    { id: "new",    label: "Novo",     icon: <Plus className="w-4 h-4" />,      onClick: () => toast("Novo") },
    { id: "save",   label: "Salvar",   icon: <Save className="w-4 h-4" />,      onClick: () => toast("Salvo") },
    { id: "star",   label: "Favorito", icon: <Star className="w-4 h-4" />,      onClick: () => toast("Favoritado") },
    { id: "delete", label: "Excluir",  icon: <Trash2 className="w-4 h-4" />,    onClick: () => toast.error("Excluído") },
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={["flex flex-col-reverse gap-2 transition-all duration-200", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"].join(" ")}>
        {actions.map((a) => (
          <div key={a.id} className="relative flex items-center justify-end gap-2">
            {hovered === a.id && (
              <span className="absolute right-10 whitespace-nowrap rounded-md bg-zinc-900 text-white text-xs px-2 py-1">
                {a.label}
              </span>
            )}
            <button
              type="button"
              aria-label={a.label}
              onClick={() => { a.onClick(); setOpen(false); }}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              className="w-9 h-9 rounded-full shadow-md flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-95"
            >
              {a.icon}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label={open ? "Fechar" : "Abrir"}
        onClick={() => setOpen((v) => !v)}
        className={["w-11 h-11 rounded-full shadow-lg flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all duration-200", open ? "rotate-45" : ""].join(" ")}
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          <section id="accordion" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Accordion</h2>
              <p className="mt-1 text-zinc-500">Lista colapsável com animação suave, variantes e suporte a múltiplos abertos.</p>
            </div>

            {/* Default */}
            <div id="accordion-default" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Default</h3>
              <Accordion
                items={[
                  { title: "O que é o Lopes UI?", content: "É uma biblioteca de componentes React construída com Next.js e Tailwind CSS." },
                  { title: "Posso usar em produção?", content: "Sim! Todos os componentes são acessíveis e foram projetados pensando em produção.", defaultOpen: true },
                  { title: "Como instalar?", content: "Clone o repositório e instale as dependências com npm install." },
                  { title: "Suporte a dark mode?", content: "Em breve.", disabled: true },
                ]}
              />
            </div>

            {/* Variants */}
            <div id="accordion-variants" className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Variantes</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">bordered</p>
                  <Accordion
                    variant="bordered"
                    items={[
                      { title: "Item 1", content: "Conteúdo do item 1." },
                      { title: "Item 2", content: "Conteúdo do item 2." },
                      { title: "Item 3", content: "Conteúdo do item 3." },
                    ]}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">separated</p>
                  <Accordion
                    variant="separated"
                    items={[
                      { title: "Item 1", content: "Conteúdo do item 1." },
                      { title: "Item 2", content: "Conteúdo do item 2.", defaultOpen: true },
                      { title: "Item 3", content: "Conteúdo do item 3." },
                    ]}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">default + multiple</p>
                  <Accordion
                    multiple
                    items={[
                      { title: "Abre junto", content: "Pode abrir vários ao mesmo tempo." },
                      { title: "Outro item", content: "Aberto independente.", defaultOpen: true },
                      { title: "Mais um", content: "Todos podem ficar abertos." },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div id="accordion-props" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-700">Accordion</h4>
                <PropsTable rows={[
                  ["items",       "AccordionItem[]",                         "—",         "Lista de painéis"],
                  ["multiple",    "boolean",                                 "false",     "Permite múltiplos painéis abertos ao mesmo tempo"],
                  ["variant",     "'default'|'bordered'|'separated'",        "'default'", "Estilo visual"],
                  ["size",        "'sm'|'md'|'lg'",                          "'md'",      "Densidade dos painéis"],
                  ["className",   "string",                                   "—",         "Classes adicionais"],
                  ["componentId", "string",                                   "—",         "Identificador de controle de acesso"],
                ]} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-700">AccordionItem</h4>
                <PropsTable rows={[
                  ["title",       "string",           "—",      "Título do painél (obrigatório)"],
                  ["content",     "ReactNode",        "—",      "Conteúdo do painél (obrigatório)"],
                  ["id",          "string",           "—",      "Identificador único"],
                  ["subtitle",    "string",           "—",      "Texto secundário exibido à direita do título"],
                  ["icon",        "LucideIcon",       "—",      "Ícone exibido antes do título"],
                  ["badge",       "string | number",  "—",      "Badge exibida após o título"],
                  ["disabled",    "boolean",          "false",  "Desabilita o painél"],
                  ["defaultOpen", "boolean",          "false",  "Aberto por padrão"],
                ]} />
              </div>
              <CodeBlock code={`import Accordion from "@/components/Accordion";

<Accordion
  variant="bordered"
  multiple
  items={[
    { title: "Pergunta 1", content: "Resposta 1", defaultOpen: true },
    { title: "Pergunta 2", content: "Resposta 2", disabled: true },
  ]}
/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="app-launcher" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Lançador"
              title="App Launcher"
              description="Grade de acesso rápido a aplicações e módulos do portal. Suporta busca, agrupamento por categoria, atalhos externos e marcadores de novidade."
            />

            <DemoCard id="app-launcher-basic" title="Grade básica (4 colunas)">
              <div className="p-6">
                <AppLauncher
                  columns={4}
                  apps={DEMO_APPS}
                />
              </div>
            </DemoCard>

            <DemoCard id="app-launcher-search" title="Com busca e tamanho sm">
              <div className="p-6">
                <AppLauncher
                  apps={DEMO_APPS}
                  searchable
                  columns={5}
                  size="sm"
                />
              </div>
            </DemoCard>

            <DemoCard id="app-launcher-grouped" title="Agrupado por categoria">
              <div className="p-6">
                <AppLauncher
                  apps={DEMO_APPS}
                  grouped
                  columns={4}
                />
              </div>
            </DemoCard>

            <div id="app-launcher-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["apps",            "AppItem[]",                        "[]",        "Lista de aplicações a exibir"],
                ["columns",         "2|3|4|5|6|'auto'",                 "4",         "Número de colunas na grade"],
                ["size",            "'sm'|'md'|'lg'",                  "'md'",      "Tamanho dos cards"],
                ["searchable",      "boolean",                          "auto (>6)", "Exibe campo de busca"],
                ["grouped",         "boolean",                          "false",     "Agrupa apps por category"],
                ["showDescription", "boolean",                          "false",     "Exibe descrição abaixo do label"],
                ["title",           "string",                           "—",         "Título opcional acima da grade"],
                ["className",       "string",                           "—",         "Classe extra no container"],
              ]} />
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-6">AppItem</h3>
              <PropsTable rows={[
                ["id",          "string",         "—",      "Identificador único"],
                ["label",       "string",         "—",      "Nome da aplicação"],
                ["description", "string",         "—",      "Descrição curta (exibe com showDescription)"],
                ["icon",        "LucideIcon",     "—",      "Ícone Lucide"],
                ["logoUrl",     "string",         "—",      "URL de logo (substitui icon/initials)"],
                ["initials",    "string",         "—",      "Sigla fallback (até 2 chars)"],
                ["href",        "string",         "—",      "Link de navegação"],
                ["onClick",     "() => void",     "—",      "Handler de clique (alternativa a href)"],
                ["badge",       "string",         "—",      "Marcador exibido no canto do card"],
                ["category",    "string",         "—",      "Categoria para agrupamento"],
                ["color",       "string",         "'zinc'", "Cor do avatar (10 opções)"],
                ["disabled",    "boolean",        "false",  "Desativa o card"],
                ["external",    "boolean",        "false",  "Abre link em nova aba com ícone externo"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="breadcrumb" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Navegação"
              title="Breadcrumb"
              description="Trilha de navegação hierárquica. Suporta separadores configuráveis, ícones, home-icon, e colapso automático de caminhos longos."
            />

            {/* Separadores */}
            <DemoCard id="breadcrumb-separators" title="Separadores">
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 mb-2">chevron (padrão)</p>
                  <Breadcrumb
                    items={[
                      { label: "Início",    href: "#" },
                      { label: "Produtos",  href: "#" },
                      { label: "Categoria", href: "#" },
                      { label: "Item atual" },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 mb-2">slash</p>
                  <Breadcrumb
                    separator="slash"
                    items={[
                      { label: "Início",    href: "#" },
                      { label: "Produtos",  href: "#" },
                      { label: "Categoria", href: "#" },
                      { label: "Item atual" },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 mb-2">dot</p>
                  <Breadcrumb
                    separator="dot"
                    items={[
                      { label: "Início",    href: "#" },
                      { label: "Produtos",  href: "#" },
                      { label: "Categoria", href: "#" },
                      { label: "Item atual" },
                    ]}
                  />
                </div>
              </div>
            </DemoCard>

            {/* Home icon */}
            <DemoCard id="breadcrumb-home" title="Com homeIcon">
              <div className="space-y-4">
                <Breadcrumb
                  homeIcon
                  items={[
                    { label: "Início",    href: "#" },
                    { label: "Dashboard", href: "#" },
                    { label: "Relatórios", href: "#" },
                    { label: "Vendas Q4" },
                  ]}
                />
                <Breadcrumb
                  homeIcon
                  separator="slash"
                  items={[
                    { label: "Início",    href: "#" },
                    { label: "Configurações", href: "#" },
                    { label: "Conta" },
                  ]}
                />
              </div>
            </DemoCard>

            {/* Ícones em itens */}
            <DemoCard id="breadcrumb-icons" title="Com ícones nos itens">
              <Breadcrumb
                items={[
                  { label: "Início",     href: "#", icon: HomeIcon },
                  { label: "Loja",       href: "#", icon: ShoppingBag },
                  { label: "Roupas",     href: "#", icon: TagIcon },
                  { label: "Camisetas" },
                ]}
              />
            </DemoCard>

            {/* Colapso */}
            <DemoCard id="breadcrumb-collapse" title="Colapso automático (maxItems)">
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">maxItems=3 — clique em … para expandir</p>
                <Breadcrumb
                  maxItems={3}
                  items={[
                    { label: "Início",        href: "#" },
                    { label: "Documentos",    href: "#" },
                    { label: "Projetos",      href: "#" },
                    { label: "2025",          href: "#" },
                    { label: "Q4",            href: "#" },
                    { label: "Relatório Final" },
                  ]}
                />
              </div>
            </DemoCard>

            {/* Sem links */}
            <DemoCard id="breadcrumb-no-links" title="Sem links (só texto)">
              <Breadcrumb
                items={[
                  { label: "Empresa" },
                  { label: "Departamento" },
                  { label: "Equipe" },
                  { label: "Você" },
                ]}
              />
            </DemoCard>

            {/* Props */}
            <div id="breadcrumb-props" className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-700">Props — Breadcrumb</h3>
              <PropsTable rows={[
                ["items",     "BreadcrumbItem[]",            "—",          "Lista de itens do breadcrumb"],
                ["separator", "'chevron'|'slash'|'dot'",     "'chevron'",  "Separador entre os itens"],
                ["homeIcon",  "boolean",                     "false",      "Substitui o primeiro item por ícone Home"],
                ["maxItems",  "number",                      "—",          "Colapsa itens do meio quando excede esse total"],
                ["className", "string",                      "—",          "Classes CSS extras no <nav>"],
              ]} />
              <h3 className="text-sm font-semibold text-zinc-700 mt-4">Props — BreadcrumbItem</h3>
              <PropsTable rows={[
                ["label",     "string",                      "—",          "Texto do item"],
                ["href",      "string",                      "—",          "URL do link (omitir = sem link)"],
                ["icon",      "LucideIcon",                  "—",          "Ícone à esquerda do label"],
                ["separator", "BreadcrumbSeparator",         "—",          "Sobrescreve separador antes deste item"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="command-menu" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Command Menu</h2>
              <p className="mt-1 text-zinc-500">Paleta de comandos com pesquisa, grupos e atalhos de teclado. Substitui o campo de busca no Header.</p>
            </div>

            {/* Trigger */}
            <div id="command-basic" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Demo interativo</h3>
              <p className="text-sm text-zinc-500">Clique no botão ou pressione <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs font-medium">Ctrl+K</kbd> para abrir.</p>
              <div className="flex items-center gap-4 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <CommandMenu
                  triggerLabel="Buscar..."
                  items={[
                    // Navegação
                    { id: "nav-home",     label: "Home",            icon: LayoutDashboard, href: "/#overview",   group: "Navegação" },
                    { id: "nav-dash",     label: "Dashboard",       icon: LayoutDashboard,href: "/#header",     group: "Navegação", description: "Painel principal" },
                    { id: "nav-docs",     label: "Documentação",    icon: BookOpen,      href: "/#install",    group: "Navegação", keywords: ["docs", "install"] },
                    { id: "nav-api",      label: "API Reference",   icon: Code2,         href: "/#forms",      group: "Navegação", description: "Todos os campos de formulário" },
                    { id: "nav-rocket",   label: "Getting Started", icon: Rocket,        href: "/#install",    group: "Navegação", shortcut: "⌘G" },
                    // Componentes
                    { id: "cmp-button",   label: "Button",          icon: MousePointer2, href: "/#button",     group: "Componentes" },
                    { id: "cmp-forms",    label: "Forms",           icon: FileText,      href: "/#forms",      group: "Componentes", description: "TextField, DateField, Switch…" },
                    { id: "cmp-avatar",   label: "Avatar",          icon: Users,         href: "/#avatars",    group: "Componentes" },
                    { id: "cmp-badge",    label: "Badge",           icon: Star,          href: "/#badges",     group: "Componentes" },
                    { id: "cmp-alert",    label: "Alert",           icon: Bell,          href: "/#alerts",     group: "Componentes" },
                    { id: "cmp-accordion",label: "Accordion",       icon: BarChart2,     href: "/#accordion",  group: "Componentes" },
                    // Ações
                    { id: "act-settings", label: "Configurações",   icon: Settings,      onSelect: () => toast("Configurações abertas"),  group: "Ações", shortcut: "⌘S" },
                    { id: "act-help",     label: "Suporte",         icon: HelpCircle,    onSelect: () => toast("Abrindo suporte…"),       group: "Ações" },
                    { id: "act-logout",   label: "Sair",            icon: LogOut,        onSelect: () => toast.error("Desconectado."),    group: "Ações", keywords: ["logout", "exit"] },
                  ]}
                />
              </div>
            </div>

            {/* Groups */}
            <div id="command-groups" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Estrutura dos itens</h3>
              <PropsTable rows={[
                ["id",          "string",      "—",     "Identificador único do item"],
                ["label",       "string",      "—",     "Texto principal exibido"],
                ["description", "string",      "—",     "Texto secundário abaixo do label"],
                ["icon",        "LucideIcon",  "—",     "Ícone exibido na badge quadrada"],
                ["shortcut",    "string",      "—",     "Atalho exibido à direita (ex: ⌘P)"],
                ["onSelect",    "() => void",  "—",     "Callback ao selecionar o item"],
                ["href",        "string",      "—",     "URL para navegar (interno ou externo)"],
                ["group",       "string",      "—",     "Cabeçalho do grupo. Itens sem grupo ficam no topo"],
                ["keywords",    "string[]",    "[]",    "Palavras extras para a busca"],
                ["disabled",    "boolean",     "false", "Desabilita o item (oculto na busca)"],
                ["componentId", "string",      "—",     "data-component-id para controle de acesso"],
              ]} />
            </div>

            <div id="command-code">
              <CodeBlock filename="CommandMenu.tsx" language="tsx" code={`import CommandMenu, { type CommandItem } from "@/components/CommandMenu";
import { Settings, LogOut, LayoutDashboard } from "lucide-react";

const COMMANDS: CommandItem[] = [
  // Pressione Ctrl+K / ⌘K para abrir
  { id: "dash",     label: "Dashboard",    icon: LayoutDashboard, href: "/dashboard",        group: "Navegação" },
  { id: "settings",label: "Configurações", icon: Settings,        onSelect: openSettings,   group: "Ações",     shortcut: "⌘S" },
  { id: "logout",  label: "Sair",         icon: LogOut,          onSelect: handleLogout,   group: "Ações" },
];

// Usar no Header como prop search={}:
<Header search={<CommandMenu items={COMMANDS} triggerLabel="Buscar..." />} />

// Ou standalone:
<CommandMenu items={COMMANDS} className="w-64" />`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="header">
            <SectionHeader
              label="Header & Nav"
              title="Header"
              description="Header modular com slots para Brand, Nav, Search e Profile. A navegação suporta até 3 níveis de dropdown por hover."
            />

            <DemoCard id="header-slots" title="Estrutura de slots">
              <div className="space-y-2 text-sm text-zinc-600">
                <p>O <code className="bg-zinc-100 px-1 rounded">Header</code> expõe 4 slots independentes:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li><code className="bg-zinc-100 px-1 rounded">brand</code> — Logo + nome da aplicação</li>
                  <li><code className="bg-zinc-100 px-1 rounded">nav</code> — Array de NavItem com suporte a filhos (dropdown)</li>
                  <li><code className="bg-zinc-100 px-1 rounded">search</code> — Barra de busca</li>
                  <li><code className="bg-zinc-100 px-1 rounded">profile</code> — Trigger de perfil + menu</li>
                </ul>
              </div>
            </DemoCard>

            <div id="header-props" className="mt-6">
              <PropsTable rows={[
                ["brand",      "ReactNode","—",    "Slot para o componente Brand"],
                ["nav",        "NavItem[]","—",    "Itens de navegação (suporta children)"],
                ["search",     "ReactNode","—",    "Slot para campo de busca"],
                ["profile",    "ReactNode","—",    "Slot para menu de perfil"],
                ["navDropdown","boolean",  "false","Ativa dropdowns por hover na nav"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="layout.tsx" language="tsx" code={`const NAV = [\n  { label: "Home", href: "/" },\n  { label: "Docs", href: "/docs", children: [\n      { label: "Guides", href: "/docs/guides" },\n      { label: "API",    href: "/docs/api", children: [\n          { label: "REST",    href: "/docs/api/rest" },\n          { label: "GraphQL", href: "/docs/api/graphql" },\n      ]},\n  ]},\n];\n\n<HeaderWrapper\n  nav={NAV}\n  navDropdown\n  brand={<Brand logo={<img src="/logo.svg" />} title="MinhaApp" />}\n  search={<SearchInput />}\n  profile={<ProfileTrigger><ProfileActions /></ProfileTrigger>}\n/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="page-header" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Utilitários"
              title="Page Header"
              description="Cabeçalho padrão de página com título, descrição, breadcrumb, badge e slot de ações. Usado em todas as telas do ERP e sub-sistemas."
            />

            <DemoCard id="page-header-basic" title="Básico">
              <div className="p-6 space-y-6">
                <PageHeader
                  title="Pedidos"
                  description="Gerencie e acompanhe todos os pedidos do sistema."
                />
                <PageHeader
                  title="Usuários"
                  icon={Users}
                  description="Cadastro e permissões de usuários."
                />
              </div>
            </DemoCard>

            <DemoCard id="page-header-actions" title="Com breadcrumb e ações">
              <div className="p-6">
                <PageHeader
                  title="Detalhes do pedido"
                  description="Pedido #PD-2024-00841"
                  icon={ShoppingCart}
                  breadcrumbs={[
                    { label: "Início", href: "#" },
                    { label: "PDV",    href: "#" },
                    { label: "Pedidos", href: "#" },
                    { label: "#PD-2024-00841" },
                  ]}
                  badge={<Badge variant="success" size="sm" label="Aprovado" />}
                  actions={
                    <>
                      <Button variant="outline" size="sm" leftIcon={<Copy size={14} />}>Duplicar</Button>
                      <Button variant="solid"   size="sm" leftIcon={<Save size={14} />}>Salvar</Button>
                    </>
                  }
                />
              </div>
            </DemoCard>

            <DemoCard id="page-header-variants" title="Variantes">
              <div className="p-6 space-y-6 divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="pb-4">
                  <p className="text-xs text-zinc-400 mb-3 font-medium">default</p>
                  <PageHeader title="Dashboard" description="Visão geral do sistema." variant="default" />
                </div>
                <div className="py-4">
                  <p className="text-xs text-zinc-400 mb-3 font-medium">muted</p>
                  <PageHeader title="Relatórios" description="Exportar e visualizar dados." variant="muted" icon={BarChart2} />
                </div>
                <div className="pt-4">
                  <p className="text-xs text-zinc-400 mb-3 font-medium">bordered</p>
                  <PageHeader title="Configurações" description="Preferências do sistema." variant="bordered" icon={Settings} />
                </div>
              </div>
            </DemoCard>

            <div id="page-header-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["title",        "string",                       "—",         "Título principal da página"],
                ["description",  "string",                       "—",         "Subtítulo abaixo do título"],
                ["icon",         "LucideIcon",                   "—",         "Ícone à esquerda do título"],
                ["breadcrumbs",  "PageHeaderCrumb[]",            "—",         "Migalhas de navegação acima do título"],
                ["actions",      "ReactNode",                    "—",         "Slot de ações (topo direito)"],
                ["badge",        "ReactNode",                    "—",         "Badge/chip ao lado do título"],
                ["variant",      "'default'|'muted'|'bordered'", "'default'", "Estilo visual de fundo/borda"],
                ["noPadding",    "boolean",                      "false",     "Remove padding vertical padrão"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="quick-actions" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Quick Actions"
              description="FAB flutuante que expande um menu de ações rápidas com tooltip. Suporte a 5 posições de ancoragem."
            />

            <DemoCard id="quick-actions-demo" title="FAB no canto inferior direito (clique no botão +)">
              <div className="relative h-48 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
                <p className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
                  Área de conteúdo — o FAB fica ancorado ao canto
                </p>
                {/* Demo using position bottom-right relative to this container */}
                <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2">
                  <QuickActionsPreview />
                </div>
              </div>
            </DemoCard>

            <div id="quick-actions-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["actions",  "QuickAction[]",                                                     "—",                "Lista de ações"],
                ["position", "\"bottom-right\"|\"bottom-left\"|\"bottom-center\"|\"top-right\"|\"top-left\"", "\"bottom-right\"", "Posição do FAB na tela"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="shortcut-hint" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Shortcut Hint"
              description="Badges de tecla de atalho com kbd estilizado e separador + configurável."
            />

            <DemoCard id="shortcut-hint-examples" title="Exemplos">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Buscar
                  <ShortcutHint keys={[{ key: "⌘" }, { key: "K" }]} />
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Copiar
                  <ShortcutHint keys={[{ key: "Ctrl" }, { key: "C" }]} />
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Salvar
                  <ShortcutHint keys={[{ key: "Ctrl" }, { key: "S" }]} />
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Novo
                  <ShortcutHint keys={[{ key: "Ctrl" }, { key: "Shift" }, { key: "N" }]} />
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Fechar
                  <ShortcutHint keys={[{ key: "Esc" }]} />
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Confirmar
                  <ShortcutHint keys={[{ key: "Enter" }]} size="md" />
                </div>
              </div>
            </DemoCard>

            <div id="shortcut-hint-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["keys",      "ShortcutKey[]",   "—",     "Array de teclas {key: string}"],
                ["separator", "boolean",         "true",  "Exibe + entre as teclas"],
                ["size",      "\"sm\"|\"md\"",   "\"sm\"","Tamanho dos badges"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="sidebar">
            <SectionHeader
              label="Sidebar"
              title="Sidebar"
              description="Sidebar com header, avisos, menus rich com subgrupos, footer de usuário e modo collapsed com tooltips."
            />

            <DemoCard id="sidebar-demo" title="Demo interativo — expanda, recolha, veja os tooltips">
              <div className="overflow-hidden rounded-xl border border-zinc-200 h-[520px] flex">
                <Sidebar
                  isolated
                  title="Lopes"
                  subtitle="v2.0"
                  logo={<span className="text-xl">🅻</span>}
                  collapsible
                  announcements={[
                    { id: "a1", variant: "info",    title: "Nova versão",   body: "v2.1 disponível com melhorias de performance.", dismissible: true, timestamp: "há 2min", action: { label: "Ver changelog", onClick: () => {} } },
                    { id: "a2", variant: "warning", title: "Manutenção",     body: "Sistema entrará em manutenção às 23h hoje.",   dismissible: true },
                  ]}
                  groups={[
                    {
                      id: "main", label: "Principal",
                      items: [
                        { label: "Dashboard",  href: "/",         icon: LayoutDashboard, active: true },
                        { label: "Relatórios", href: "/reports",  icon: BarChart2,        badge: 3, badgeVariant: "info" },
                        { label: "Usuários",   href: "/users",    icon: Users },
                        { label: "Documentos", href: "/docs",     icon: FileText,
                          children: [
                            { label: "Contratos",  href: "/docs/contratos" },
                            { label: "Propostas",  href: "/docs/propostas", badge: "Novo", badgeVariant: "success" },
                          ]
                        },
                      ],
                    },
                    {
                      id: "settings", label: "Configurações", collapsible: true,
                      items: [
                        { label: "Perfil",        href: "/profile",  icon: Star },
                        { label: "Preferências",  href: "/settings", icon: Settings },
                        { label: "Notificações",  href: "/notif",    icon: Bell, badge: 12, badgeVariant: "danger", divider: true },
                        { label: "Desativado",    href: "/nope",     icon: LockIcon, disabled: true },
                      ],
                    },
                  ]}
                  footerItems={[
                    { icon: HelpCircle, label: "Suporte",     onClick: () => {} },
                    { icon: LogOut,     label: "Sair",        onClick: () => {}, danger: true },
                  ]}
                  user={{ name: "Cristiano Lopes", role: "Admin", initials: "CL", status: "online" }}
                />
                <div className="flex-1 bg-zinc-50 p-6">
                  <p className="text-sm text-zinc-400">← Use o botão de recolher para ver o modo collapsed com tooltips.</p>
                </div>
              </div>
            </DemoCard>

            <div className="mt-6 space-y-4">
              <CodeBlock filename="Sidebar usage" language="tsx" code={`import Sidebar from "@/components/Sidebar";

<Sidebar
  title="Lopes"
  logo={<Logo />}
  collapsible
  announcements={[
    { id: "1", variant: "info", title: "Nova versão",
      body: "v2.1 disponível!", dismissible: true },
  ]}
  groups={[
    {
      label: "Principal",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard, active: true },
        { label: "Docs",      href: "/docs", icon: BookOpen,
          children: [
            { label: "Guias",    href: "/docs/guias" },
            { label: "API",      href: "/docs/api", badge: "Novo" },
          ],
        },
      ],
    },
    {
      label: "Config", collapsible: true,
      items: [
        { label: "Settings", href: "/settings", icon: Settings },
        { label: "Sair",     onClick: signOut,  icon: LogOut, divider: true },
      ],
    },
  ]}
  user={{ name: "Cristiano", role: "Admin", initials: "CL", status: "online" }}
  footerItems={[
    { icon: HelpCircle, label: "Suporte", onClick: () => {} },
    { icon: LogOut,     label: "Sair",    onClick: signOut, danger: true },
  ]}
/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="split-pane" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Split Pane"
              description="Divisor arrastável entre dois painéis, horizontal ou vertical. Suporte a teclado (← → ↑ ↓) e limite min/max."
            />

            <DemoCard id="split-pane-horizontal" title="Horizontal (padrão)">
              <SplitPane
                direction="horizontal"
                defaultSplit={40}
                className="h-48 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700"
                first={
                  <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-500">
                    Painel esquerdo
                  </div>
                }
                second={
                  <div className="h-full flex items-center justify-center bg-white dark:bg-zinc-950 text-sm text-zinc-500">
                    Painel direito
                  </div>
                }
              />
            </DemoCard>

            <DemoCard id="split-pane-vertical" title="Vertical">
              <SplitPane
                direction="vertical"
                defaultSplit={35}
                className="h-64 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700"
                first={
                  <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-500">
                    Painel superior
                  </div>
                }
                second={
                  <div className="h-full flex items-center justify-center bg-white dark:bg-zinc-950 text-sm text-zinc-500">
                    Painel inferior
                  </div>
                }
              />
            </DemoCard>

            <div id="split-pane-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["direction",    "\"horizontal\"|\"vertical\"", "\"horizontal\"", "Direção da divisão"],
                ["defaultSplit", "number",  "50",  "Tamanho inicial do primeiro painel (0–100)"],
                ["minFirst",     "number",  "10",  "Tamanho mínimo do primeiro painel (%)"],
                ["maxFirst",     "number",  "90",  "Tamanho máximo do primeiro painel (%)"],
                ["first",        "ReactNode","—",  "Conteúdo do primeiro painel"],
                ["second",       "ReactNode","—",  "Conteúdo do segundo painel"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="footer" className="scroll-mt-20 space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Navegação & Layout"
              title="Footer"
              description="Rodapé de site com colunas de links, tagline e variantes de estilo."
            />

            <DemoCard id="footer-default" title="Padrão">
              <Footer
                brand="Lopes UI"
                tagline="Componentes React modernos para sua aplicação."
                columns={[
                  { title: "Produto", links: [{ label: "Componentes", href: "#" }, { label: "UI Builder", href: "#" }, { label: "Changelog", href: "#" }] },
                  { title: "Recursos", links: [{ label: "Documentação", href: "#" }, { label: "GitHub", href: "#" }, { label: "Suporte", href: "#" }] },
                ]}
              />
            </DemoCard>

            <DemoCard id="footer-minimal" title="Minimal">
              <Footer variant="minimal" brand="Lopes UI" />
            </DemoCard>

            <DemoCard id="footer-bordered" title="Bordered">
              <Footer
                variant="bordered"
                brand="Lopes UI"
                tagline="Design system open source."
                columns={[
                  { title: "Links", links: [{ label: "Home", href: "#" }, { label: "Docs", href: "#" }] },
                ]}
              />
            </DemoCard>

            <div id="footer-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["brand",     "string",                             "\"Lopes UI\"", "Nome exibido no rodapé"],
                ["tagline",   "string",                             "—",            "Subtítulo abaixo da marca"],
                ["columns",   "FooterColumn[]",                     "—",            "Colunas de links"],
                ["copyright", "string",                             "—",            "Texto de copyright (gerado automaticamente se omitido)"],
                ["variant",   "\"default\" | \"minimal\" | \"bordered\"", "\"default\"",  "Estilo visual do footer"],
                ["className", "string",                             "—",            "Classes extras"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
