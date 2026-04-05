"use client";

import React from "react";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableAction, FilterField, DataTableTab } from "@/components/DataTable";
import Table from "@/components/Table";
import KanbanBoard, { type KanbanColumn } from "@/components/KanbanBoard";
import InboxList, { type InboxItem } from "@/components/InboxList";
import ActivityFeed, { type ActivityEvent } from "@/components/ActivityFeed";
import FilterBar, { type FilterChip } from "@/components/FilterBar";
import TreeView from "@/components/TreeView";
import Badge from "@/components/Badge";

import Button from "@/components/Button";
import toast from "@/components/Toast";
import { Eye, Pencil, Trash2, Copy, ExternalLink, CheckCircle, UserPlus, FileCheck, AlertOctagon, MessageSquare, GitCommit, FileSearch } from "lucide-react";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

type Employee = {
  id: number;
  name: string;
  role: string;
  dept: string;
  salary: number;
  score: number;
  status: "Ativo" | "Inativo" | "Férias";
  joined: string;
};

const EMPLOYEES: Employee[] = [
  { id: 1,  name: "Ana Souza",       role: "Eng. Frontend",  dept: "Produto",    salary: 12500, score: 92, status: "Ativo",   joined: "2021-03-10" },
  { id: 2,  name: "Bruno Lima",      role: "Eng. Backend",   dept: "Plataforma", salary: 13200, score: 88, status: "Ativo",   joined: "2020-07-22" },
  { id: 3,  name: "Carla Matos",     role: "UX Designer",    dept: "Produto",    salary: 10800, score: 79, status: "Inativo", joined: "2022-01-05" },
  { id: 4,  name: "Diego Ferreira",  role: "DevOps",         dept: "Infra",      salary: 14000, score: 95, status: "Ativo",   joined: "2019-11-30" },
  { id: 5,  name: "Elisa Rocha",     role: "Data Analyst",   dept: "Analytics",  salary: 11200, score: 84, status: "Férias",  joined: "2021-08-14" },
  { id: 6,  name: "Fábio Castro",    role: "PM",             dept: "Produto",    salary: 15000, score: 91, status: "Ativo",   joined: "2018-05-19" },
  { id: 7,  name: "Gabriela Neves",  role: "QA Engineer",    dept: "Plataforma", salary: 10500, score: 76, status: "Ativo",   joined: "2023-02-01" },
  { id: 8,  name: "Henrique Dias",   role: "Eng. Full Stack",dept: "Plataforma", salary: 13800, score: 89, status: "Ativo",   joined: "2020-09-08" },
  { id: 9,  name: "Isabela Torres",  role: "UX Writer",      dept: "Produto",    salary: 9800,  score: 83, status: "Inativo", joined: "2022-06-21" },
  { id: 10, name: "João Mendes",     role: "Sec. Engineer",  dept: "Infra",      salary: 16000, score: 97, status: "Ativo",   joined: "2017-12-03" },
  { id: 11, name: "Karen Alves",     role: "Eng. Frontend",  dept: "Produto",    salary: 12000, score: 85, status: "Férias",  joined: "2021-10-17" },
  { id: 12, name: "Lucas Pinto",     role: "Data Engineer",  dept: "Analytics",  salary: 14500, score: 90, status: "Ativo",   joined: "2020-04-29" },
];

const STATUS_COLOR: Record<string, "success" | "default" | "warning"> = {
  "Ativo":   "success",
  "Inativo": "default",
  "Férias":  "warning",
};

const EMPLOYEE_COLS: DataTableColumn<Employee>[] = [
  { key: "id",      label: "#",          width: "56px",  align: "center", sortable: true, required: true },
  { key: "name",    label: "Nome",        sortable: true, required: true,
    render: (v) => <span className="font-medium text-zinc-800 dark:text-zinc-200">{v as string}</span> },
  { key: "role",    label: "Cargo",       sortable: true },
  { key: "dept",    label: "Depto",       sortable: true },
  { key: "salary",  label: "Salário",     sortable: true, align: "right",
    getValue: (r) => r.salary,
    render: (v) => `R$ ${(v as number).toLocaleString("pt-BR")}`,
    summary: "sum" },
  { key: "score",   label: "Score",       sortable: true, align: "right",
    getValue: (r) => r.score,
    render: (v) => {
      const n = v as number;
      const color = n >= 90 ? "text-emerald-600" : n >= 80 ? "text-amber-600" : "text-zinc-500";
      return <span className={`font-semibold ${color}`}>{n}</span>;
    },
    summary: "avg" },
  { key: "status",  label: "Status",      sortable: true, align: "center",
    render: (v) => <Badge variant={STATUS_COLOR[v as string] ?? "default"} size="xs" label={v as string} /> },
  { key: "joined",  label: "Admissão",    sortable: true, hidden: true },
];

const EMPLOYEE_ACTIONS: DataTableAction<Employee>[] = [
  { label: "Ver perfil",  icon: Eye,      onClick: (r) => toast(`Perfil: ${r.name}`),                                           inline: true  },
  { label: "Editar",      icon: Pencil,   onClick: (r) => toast(`Editando: ${r.name}`),                                         inline: true  },
  { label: "Copiar ID",   icon: Copy,     onClick: (r) => { navigator.clipboard.writeText(String(r.id)); toast("ID copiado!"); }               },
  { label: "Excluir",     icon: Trash2,   onClick: (r) => toast.error(`Excluído: ${r.name}`), danger: true, divider: true                      },
];

// Sem flags inline — usada nos demos de "tudo no menu" e "tudo inline"
const EMPLOYEE_ACTIONS_SIMPLE: DataTableAction<Employee>[] = [
  { label: "Ver perfil",  icon: Eye,    onClick: (r) => toast(`Perfil: ${r.name}`)                                             },
  { label: "Editar",      icon: Pencil, onClick: (r) => toast(`Editando: ${r.name}`)                                           },
  { label: "Excluir",     icon: Trash2, onClick: (r) => toast.error(`Excluído: ${r.name}`), danger: true, divider: true          },
];

const EMPLOYEE_FILTERS: FilterField[] = [
  { key: "name",   label: "Nome",   type: "text",   placeholder: "Buscar por nome..." },
  { key: "dept",   label: "Depto",  type: "select", options: [
    { label: "Produto",    value: "Produto" },
    { label: "Plataforma", value: "Plataforma" },
    { label: "Infra",      value: "Infra" },
    { label: "Analytics",  value: "Analytics" },
  ]},
  { key: "status", label: "Status", type: "select", options: [
    { label: "Ativo",   value: "Ativo" },
    { label: "Inativo", value: "Inativo" },
    { label: "Férias",  value: "Férias" },
  ]},
  { key: "joined", label: "Admissão a partir de", type: "date" },
];

// ── Demo data for new components ──────────────────────────────────────────

const INITIAL_FILTERS: FilterChip[] = [
  { id: "status",   label: "Status",   value: "Ativo" },
  { id: "dept",     label: "Depto",    value: "Produto" },
  { id: "joined",   label: "Admissão", value: "2021" },
  { id: "score",    label: "Score",    value: "≥ 80" },
];

function FilterBarDemo() {
  const [filters, setFilters] = React.useState<FilterChip[]>(INITIAL_FILTERS);
  return (
    <div className="space-y-3">
      <FilterBar
        filters={filters}
        onRemove={(id) => setFilters((f) => f.filter((c) => c.id !== id))}
        onClearAll={() => setFilters([])}
      />
      {filters.length === 0 && (
        <Button variant="outline" size="sm" onClick={() => setFilters(INITIAL_FILTERS)}>
          Restaurar filtros
        </Button>
      )}
    </div>
  );
}

// ── InboxList demo ─────────────────────────────────────────────────────────────

// Stable reference — never use Date.now() at module level in SSR'd components.
// Dates are always fixed relative to this anchor to avoid SSR/CSR hydration mismatches.
const INBOX_REF = new Date("2026-04-05T14:00:00.000Z").getTime();

const DEMO_INBOX: InboxItem[] = [
  { id: "1", from: "Ana Souza",       subject: "Re: Deploy de produção",       preview: "Já aprovei o PR, pode fazer o merge.", date: new Date(INBOX_REF - 900_000),   unread: true,  starred: false, hasAttachment: false },
  { id: "2", from: "Suporte TI",      subject: "[Incidente] Latência no SSO",  preview: "Estamos investigando o problema.", date: new Date(INBOX_REF - 3_600_000),  unread: true,  starred: true,  hasAttachment: false },
  { id: "3", from: "Bruno Lima",      subject: "Spec do módulo de relatórios", preview: "Segue o documento atualizado.", date: new Date(INBOX_REF - 86_400_000), unread: false, starred: false, hasAttachment: true  },
  { id: "4", from: "Carla Matos",     subject: "Figma — componentes v3",       preview: "Publiquei a nova versão do design system.", date: new Date(INBOX_REF - 172_800_000),unread: false, starred: true,  hasAttachment: false },
  { id: "5", from: "Diego Ferreira",  subject: "Alerta de backup",             preview: "Backup concluído com sucesso.", date: new Date(INBOX_REF - 345_600_000),unread: false, starred: false, hasAttachment: false },
  { id: "6", from: "Equipe Produto",  subject: "Sprint review sexta-feira",    preview: "Confirma presença para às 14h?", date: new Date(INBOX_REF - 604_800_000),unread: false, starred: false, hasAttachment: false },
];

function InboxListDemo() {
  const [items, setItems] = React.useState<InboxItem[]>(DEMO_INBOX);
  const [selected, setSelected] = React.useState<string>("1");
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-w-xl">
      <InboxList
        items={items}
        selectedId={selected}
        onSelect={setSelected}
        onToggleStar={(id) =>
          setItems((prev) =>
            prev.map((it) => it.id === id ? { ...it, starred: !it.starred } : it)
          )
        }
      />
    </div>
  );
}

// ── KanbanBoard demo ───────────────────────────────────────────────────────────

const DEMO_KANBAN: KanbanColumn[] = [
  {
    id: "backlog", title: "Backlog", color: "zinc", limit: 10,
    cards: [
      { id: "k1", title: "Refatorar módulo de autenticação", tags: ["backend", "segurança"], color: "indigo", assignee: { name: "Bruno Lima", initials: "BL" } },
      { id: "k2", title: "Criar endpoint de exportação CSV", description: "Exportar dados da tabela de funcionários.", tags: ["api"], color: "blue" },
      { id: "k3", title: "Atualizar dependências npm", tags: ["infra"], color: "zinc", assignee: { name: "Diego Ferreira", initials: "DF" } },
    ],
  },
  {
    id: "doing", title: "Em andamento", color: "blue", limit: 3,
    cards: [
      { id: "k4", title: "Implementar Drawer component", description: "Painel lateral com backdrop e animação.", tags: ["frontend", "ui"], color: "indigo", assignee: { name: "Ana Souza", initials: "AS" } },
      { id: "k5", title: "Testes E2E do fluxo de login", tags: ["qa"], color: "amber", assignee: { name: "Gabriela Neves", initials: "GN" } },
    ],
  },
  {
    id: "review", title: "Em revisão", color: "amber", limit: 5,
    cards: [
      { id: "k6", title: "Dashboard de métricas", description: "Gráficos de usuários ativos e receita.", tags: ["analytics", "frontend"], color: "emerald" },
    ],
  },
  {
    id: "done", title: "Concluído", color: "emerald",
    cards: [
      { id: "k7", title: "KanbanBoard component", tags: ["ui", "frontend"], color: "emerald", assignee: { name: "Ana Souza", initials: "AS" } },
      { id: "k8", title: "InboxList component", tags: ["ui"], color: "teal" },
    ],
  },
];

// ── PriceInput demo ────────────────────────────────────────────────────────────

const now = Date.now();
const DEMO_ACTIVITY: ActivityEvent[] = [
  {
    id: "a1",
    title: "Pedido #PD-2024-00841 aprovado",
    description: "Valor total: R$ 4.290,00 · 3 itens",
    icon: CheckCircle,
    color: "emerald",
    actor: { name: "Ana Souza", initials: "AS" },
    timestamp: new Date(now - 1000 * 60 * 5),
  },
  {
    id: "a2",
    title: "Novo usuário cadastrado",
    icon: UserPlus,
    color: "indigo",
    actor: { name: "Bruno Lima", initials: "BL" },
    timestamp: new Date(now - 1000 * 60 * 38),
  },
  {
    id: "a3",
    title: "Relatório mensal gerado",
    description: "Exportado em PDF — 24 páginas",
    icon: FileCheck,
    color: "blue",
    actor: { name: "Carla Matos", initials: "CM" },
    timestamp: new Date(now - 1000 * 60 * 60 * 2),
  },
  {
    id: "a4",
    title: "Alerta: falha no serviço de auth",
    description: "Timeout no OAuth2 por ~3 min. Resolvido automaticamente.",
    icon: AlertOctagon,
    color: "red",
    timestamp: new Date(now - 1000 * 60 * 60 * 5),
  },
  {
    id: "a5",
    title: "Comentário adicionado ao contrato #CT-0042",
    icon: MessageSquare,
    color: "zinc",
    actor: { name: "Diego Ferreira", initials: "DF" },
    timestamp: new Date(now - 1000 * 60 * 60 * 23),
  },
  {
    id: "a6",
    title: "Versão 2.4.1 publicada em produção",
    description: "Deploy concluído sem erros · 47ms de downtime",
    icon: GitCommit,
    color: "violet",
    timestamp: new Date(now - 1000 * 60 * 60 * 48),
  },
];

// ── LoginForm demo wrapper ────────────────────────────────────────────────────

function DataTableFullDemo() {
  return (
    <div className="space-y-14">

      {/* Full-featured */}
      <div id="datatable-full">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Completo</h3>
        <p className="text-xs text-zinc-500 mb-4">Ordenação + busca global + filtros + toggle de colunas + sumário + paginação + ações.</p>
        <DataTable<Employee>
          columns={EMPLOYEE_COLS}
          rows={EMPLOYEES}
          rowKey={(r) => r.id}
          actions={EMPLOYEE_ACTIONS}
          globalSearch
          filterFields={EMPLOYEE_FILTERS}
          columnToggle
          showSummary
          pagination
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          title="Funcionários"
          description="Lista completa com todas as funcionalidades ativas"
          toolbarSlot={
            <button
              onClick={() => toast("Exportado!")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink size={13} />
              Exportar
            </button>
          }
        />
      </div>

      {/* Simple — no toolbar */}
      <div id="datatable-simple">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Simples (sem toolbar)</h3>
        <p className="text-xs text-zinc-500 mb-4">Apenas ordenação ativa, sem busca ou filtros.</p>
        <DataTable<Employee>
          columns={EMPLOYEE_COLS.slice(0, 5)}
          rows={EMPLOYEES.slice(0, 6)}
          rowKey={(r) => r.id}
          size="sm"
          showSummary
        />
      </div>

      {/* Striped + actions + no pagination */}
      <div id="datatable-striped">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Striped com ações</h3>
        <DataTable<Employee>
          columns={EMPLOYEE_COLS.slice(0, 6)}
          rows={EMPLOYEES.slice(0, 8)}
          rowKey={(r) => r.id}
          variant="striped"
          size="sm"
          actions={EMPLOYEE_ACTIONS}
          globalSearch
        />
      </div>

      {/* Tabs by status */}
      <div id="datatable-tabs">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Abas por situação</h3>
        <p className="text-xs text-zinc-500 mb-4">Tab bar que pré-filtra os dados por categoria — usando <code className="font-mono bg-zinc-100 px-1 rounded">field + value</code> ou uma função <code className="font-mono bg-zinc-100 px-1 rounded">filter</code> personalizada.</p>
        <DataTable<Employee>
          columns={EMPLOYEE_COLS.slice(0, 6)}
          rows={EMPLOYEES}
          rowKey={(r) => r.id}
          actions={EMPLOYEE_ACTIONS}
          globalSearch
          pagination
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          tabs={[
            { label: "Todos",    showCount: true },
            { label: "Ativos",   field: "status", value: "Ativo",   showCount: true },
            { label: "Inativos", field: "status", value: "Inativo", showCount: true },
            { label: "Férias",   field: "status", value: "Férias",  showCount: true },
          ] satisfies DataTableTab<Employee>[]}
        />
      </div>

      {/* Inline actions */}
      <div id="datatable-inline-actions">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Modos de ações</h3>
        <div className="space-y-10">

          {/* 1. Tudo no menu */}
          <div id="datatable-actions-menu">
            <p className="text-sm font-medium text-zinc-700 mb-1">Menu dropdown (padrão)</p>
            <p className="text-xs text-zinc-400 mb-3">Todas as ações ficam ocultadas no botão ⋯ — aparece ao passar o mouse sobre a linha.</p>
            <DataTable<Employee>
              columns={EMPLOYEE_COLS.slice(0, 5)}
              rows={EMPLOYEES.slice(0, 5)}
              rowKey={(r) => r.id}
              size="sm"
              hoverable
              actions={EMPLOYEE_ACTIONS_SIMPLE}
            />
          </div>

          {/* 2. Tudo inline */}
          <div id="datatable-actions-inline">
            <p className="text-sm font-medium text-zinc-700 mb-1">Todos inline</p>
            <p className="text-xs text-zinc-400 mb-3"><code className="font-mono bg-zinc-100 px-1 rounded">actionsDisplay=&quot;inline&quot;</code> força todos os botões sempre visíveis na linha, sem menu.</p>
            <DataTable<Employee>
              columns={EMPLOYEE_COLS.slice(0, 5)}
              rows={EMPLOYEES.slice(0, 5)}
              rowKey={(r) => r.id}
              size="sm"
              actionsDisplay="inline"
              actions={EMPLOYEE_ACTIONS_SIMPLE}
            />
          </div>

          {/* 3. Misto por ação */}
          <div id="datatable-actions-mixed">
            <p className="text-sm font-medium text-zinc-700 mb-1">Misto (inline + menu na mesma linha)</p>
            <p className="text-xs text-zinc-400 mb-3">Marque <code className="font-mono bg-zinc-100 px-1 rounded">inline: true</code> por ação para exibi-la como botão direto na linha. As demais continuam no ⋯. Aqui: <em>Ver</em> e <em>Editar</em> são inline; <em>Copiar ID</em> e <em>Excluir</em> ficam no menu.</p>
            <DataTable<Employee>
              columns={EMPLOYEE_COLS.slice(0, 5)}
              rows={EMPLOYEES.slice(0, 5)}
              rowKey={(r) => r.id}
              variant="striped"
              size="sm"
              actions={EMPLOYEE_ACTIONS}
            />
          </div>

        </div>
      </div>

      {/* Props table */}
      <div id="datatable-props">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Props — DataTable</h3>
        <PropsTable rows={[
          ["columns",         "DataTableColumn<T>[]",                    "—",             "Definição das colunas (key, label, render, sortable, hidden, summary…)"],
          ["rows",            "T[]",                                     "—",             "Array de dados"],
          ["actions",         "DataTableAction<T>[]",                    "—",             "Ações por linha. Cada ação suporta inline:true (botão visível na linha) ou sem flag (menu ⋯)"],
          ["actionsDisplay",  "'menu' | 'inline'",                       "'menu'",        "Atalho para colocar TODAS as ações como inline de uma vez"],
          ["tabs",            "DataTableTab<T>[]",                       "—",             "Tab bar para pré-filtrar linhas por categoria (field+value ou filter fn)"],
          ["globalSearch",    "boolean",                                 "false",         "Barra de busca global na toolbar"],
          ["filterFields",    "FilterField[]",                           "—",             "Campos do dialog de filtros (text, number, select, date, boolean)"],
          ["columnToggle",    "boolean",                                 "false",         "Painel de visibilidade de colunas"],
          ["showSummary",     "boolean",                                 "false",         "Linha de sumário (sum, avg, min, max, count) no rodapé da tabela"],
          ["pagination",      "boolean",                                 "false",         "Paginação com seletor de itens por página"],
          ["defaultPageSize", "number",                                  "10",            "Tamanho inicial de página"],
          ["pageSizeOptions", "number[]",                                "[10,25,50,100]","Opções do seletor de página"],
          ["variant",         "'default'|'striped'|'bordered'|'minimal'","'default'",     "Estilo visual"],
          ["size",            "'xs'|'sm'|'md'|'lg'",                    "'md'",          "Densidade das células"],
          ["stickyHeader",    "boolean",                                 "false",         "Cabeçalho fixo no scroll"],
          ["title",           "ReactNode",                               "—",             "Título exibido na toolbar"],
          ["toolbarSlot",     "ReactNode",                               "—",             "Slot extra na toolbar (ex: botão Exportar)"],
        ]} />
      </div>

    </div>
  );
}

// ── Chat demo data ─────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          <section id="activity-feed" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Portal"
              title="Activity Feed"
              description="Feed de eventos em tempo real para dashboards, páginas home e painéis de monitoramento. Suporta ícones por tipo, actor avatar, timestamps relativos e skeleton."
            />

            <DemoCard id="activity-feed-basic" title="Feed básico com ícones e atores">
              <div className="p-6">
                <ActivityFeed events={DEMO_ACTIVITY} />
              </div>
            </DemoCard>

            <DemoCard id="activity-feed-max-height" title="Com altura máxima (scroll)">
              <div className="p-6">
                <ActivityFeed events={DEMO_ACTIVITY} maxHeight="260px" />
              </div>
            </DemoCard>

            <DemoCard id="activity-feed-load-more" title="Com botão Carregar mais">
              <div className="p-6">
                <ActivityFeed
                  events={DEMO_ACTIVITY.slice(0, 3)}
                  onLoadMore={() => toast("Carregar mais eventos…")}
                />
              </div>
            </DemoCard>

            <DemoCard id="activity-feed-skeleton" title="Estado de carregamento">
              <div className="p-6">
                <ActivityFeed events={[]} loading />
              </div>
            </DemoCard>

            <div id="activity-feed-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["events",        "ActivityEvent[]",   "—",          "Lista de eventos"],
                ["loading",       "boolean",           "false",      "Exibe skeleton de carregamento"],
                ["maxHeight",     "string",            "—",          "Altura máx. com overflow-y-auto (ex: '300px')"],
                ["loadMoreLabel", "string",            "'Carregar mais'", "Label do botão de paginação"],
                ["onLoadMore",    "() => void",        "—",          "Callback ao clicar em carregar mais"],
              ]} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <strong>ActivityEvent:</strong>{" "}
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                  {"{ id, title, description?, icon?, color?, actor?: { name, initials?, avatarUrl? }, timestamp }"}
                </code>
              </p>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="filter-bar" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Filter Bar"
              description="Chips de filtros ativos com botão de remoção individual e limpeza em massa."
            />

            <DemoCard id="filter-bar-demo" title="Demo interativo">
              <FilterBarDemo />
            </DemoCard>

            <DemoCard id="filter-bar-readonly" title="Somente leitura (sem remoção)">
              <FilterBar filters={INITIAL_FILTERS} />
            </DemoCard>

            <div id="filter-bar-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["filters",       "FilterChip[]",  "—",              "Lista de filtros ativos"],
                ["onRemove",      "(id) => void",  "—",              "Remove um chip pelo id"],
                ["onClearAll",    "() => void",    "—",              "Limpa todos os chips"],
                ["clearAllLabel", "string",        "\"Limpar tudo\"","Texto do botão limpar"],
                ["hideClearAll",  "boolean",       "false",          "Oculta o botão limpar tudo"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="datatable" className="space-y-10 pb-10 sm:pb-14">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">DataTable</h2>
              <p className="text-zinc-500 text-sm">Tabela completa com ordenação, busca global, filtros em dialog, visibilidade de colunas, sumário, paginação e menu de ações por linha.</p>
            </div>

            <DataTableFullDemo />

          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="inbox-list" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Inbox List"
              description="Lista de e-mails com seleção, estrela, anexos, remetente, snippet e timestamps relativos em pt-BR."
            />

            <DemoCard id="inbox-list-demo" title="Demo interativo">
              <InboxListDemo />
            </DemoCard>

            <DemoCard id="inbox-list-skeleton" title="Skeleton">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-w-xl">
                <InboxList items={[]} loading skeletonCount={5} />
              </div>
            </DemoCard>

            <DemoCard id="inbox-list-empty" title="Estado vazio">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-w-xl">
                <InboxList items={[]} />
              </div>
            </DemoCard>

            <div id="inbox-list-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["items",         "InboxItem[]",      "—",    "Lista de mensagens"],
                ["selectedId",    "string",           "—",    "ID da mensagem selecionada"],
                ["onSelect",      "(id) => void",     "—",    "Callback ao selecionar"],
                ["onToggleStar",  "(id) => void",     "—",    "Callback ao favoritar"],
                ["loading",       "boolean",          "false","Exibe skeleton"],
                ["skeletonCount", "number",           "6",    "Quantidade de linhas skeleton"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="kanban-board" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Kanban Board"
              description="Quadro kanban com colunas, cartões arrastáveis (Drag & Drop nativo), tags, responsáveis e limite de WIP."
            />

            <DemoCard id="kanban-board-demo" title="Demo completo (arraste os cartões)">
              <KanbanBoard
                columns={DEMO_KANBAN}
                onAddCard={(colId) => toast(`Adicionar à coluna: ${colId}`)}
                onCardClick={(card) => toast(`Cartão: ${card.title}`)}
              />
            </DemoCard>

            <div id="kanban-board-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["columns",     "KanbanColumn[]",                    "—",   "Dados iniciais das colunas e cartões"],
                ["onChange",    "(columns: KanbanColumn[]) => void", "—",   "Callback após drag & drop"],
                ["onAddCard",   "(columnId: string) => void",        "—",   "Clique em 'Adicionar cartão'"],
                ["onCardClick", "(card, columnId) => void",          "—",   "Clique em um cartão"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="tables" className="space-y-10 pb-10 sm:pb-14">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Table</h2>
              <p className="text-zinc-500 text-sm">Tabela simples e altamente configurável, sem estado interno — ideal para listas estáticas ou controladas externamente.</p>
            </div>

            {/* Variants */}
            <div id="table-variants">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Variantes</h3>
              <div className="space-y-6">
                {([
                  { variant: "default",  label: "Default" },
                  { variant: "striped",  label: "Striped" },
                  { variant: "bordered", label: "Bordered" },
                  { variant: "minimal",  label: "Minimal" },
                ] as const).map(({ variant }) => (
                  <div key={variant}>
                    <p className="text-xs font-mono font-medium text-zinc-500 mb-2">{`variant="${variant}"`}</p>
                    <Table
                      variant={variant}
                      size="sm"
                      columns={[
                        { key: "name",   label: "Nome",   render: (v) => <span className="font-medium text-zinc-800 dark:text-zinc-200">{v as string}</span> },
                        { key: "role",   label: "Cargo" },
                        { key: "dept",   label: "Depto" },
                        { key: "salary", label: "Salário", align: "right" },
                        { key: "status", label: "Status",  align: "center", render: (v) => (
                          <Badge variant={v === "Ativo" ? "success" : "default"} size="xs" label={v as string} />
                        )},
                      ]}
                      rows={[
                        { name: "Ana Souza",      role: "Eng. Frontend",  dept: "Produto",    salary: "R$ 12.500", status: "Ativo" },
                        { name: "Bruno Lima",     role: "Eng. Backend",   dept: "Plataforma", salary: "R$ 13.200", status: "Ativo" },
                        { name: "Carla Matos",   role: "UX Designer",    dept: "Produto",    salary: "R$ 10.800", status: "Inativo" },
                        { name: "Diego Ferreira",role: "DevOps",          dept: "Infra",      salary: "R$ 14.000", status: "Ativo" },
                      ]}
                      rowKey={(r) => (r as {name: string}).name}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div id="table-sizes">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Tamanhos</h3>
              <div className="space-y-6">
                {(["xs", "sm", "md", "lg"] as const).map((size) => (
                  <div key={size}>
                    <p className="text-xs font-mono font-medium text-zinc-500 mb-2">{`size="${size}"`}</p>
                    <Table
                      size={size}
                      columns={[
                        { key: "product", label: "Produto" },
                        { key: "qty",     label: "Qtd",    align: "right" },
                        { key: "price",   label: "Preço",  align: "right" },
                        { key: "total",   label: "Total",  align: "right" },
                      ]}
                      rows={[
                        { product: "Notebook Pro",  qty: 2, price: "R$ 4.500", total: "R$ 9.000" },
                        { product: "Monitor 27\"",   qty: 1, price: "R$ 1.800", total: "R$ 1.800" },
                        { product: "Teclado Mecânico", qty: 3, price: "R$ 350",  total: "R$ 1.050" },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state */}
            <div id="table-empty">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Estado vazio</h3>
              <Table
                columns={[
                  { key: "name",  label: "Nome" },
                  { key: "email", label: "E-mail" },
                  { key: "plan",  label: "Plano" },
                ]}
                rows={[]}
                emptySlot={
                  <div className="flex flex-col items-center gap-2 py-4">
                    <FileSearch size={28} className="text-zinc-300" />
                    <p className="text-zinc-400 text-sm">Nenhum usuário encontrado</p>
                  </div>
                }
              />
            </div>

          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="treeview" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tree View</h2>
              <p className="mt-1 text-zinc-500">Visualização hierárquica de dados com suporte a expand/collapse, seleção, linhas conectoras e drag-and-drop.</p>
            </div>

            {/* Simple sm */}
            <div id="treeview-simple-sm" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Simple — sm</h3>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 max-w-xs">
                <TreeView
                  size="sm"
                  items={[
                    { id: "src", label: "src", defaultExpanded: true, children: [
                      { id: "components", label: "components", defaultExpanded: true, children: [
                        { id: "button", label: "Button.tsx" },
                        { id: "input",  label: "Input.tsx" },
                        { id: "modal",  label: "Modal.tsx", badge: 4 },
                      ]},
                      { id: "hooks", label: "hooks", children: [
                        { id: "useForm", label: "useForm.ts" },
                        { id: "useAuth", label: "useAuth.ts" },
                      ]},
                      { id: "types", label: "types", children: [
                        { id: "api-ts", label: "api.ts" },
                      ]},
                    ]},
                    { id: "public",      label: "public",       children: [{ id: "logo", label: "logo.svg" }] },
                    { id: "pkg",         label: "package.json" },
                    { id: "tsconfig",    label: "tsconfig.json" },
                    { id: "readme",      label: "README.md" },
                  ]}
                />
              </div>
            </div>

            {/* Simple md */}
            <div id="treeview-simple-md" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Simple — md</h3>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 max-w-xs">
                <TreeView
                  size="md"
                  showLines
                  items={[
                    { id: "md-src", label: "src", defaultExpanded: true, children: [
                      { id: "md-app",  label: "app",  defaultExpanded: true, children: [
                        { id: "md-page",   label: "page.tsx" },
                        { id: "md-layout", label: "layout.tsx" },
                      ]},
                      { id: "md-comp", label: "components", children: [
                        { id: "md-btn",   label: "Button.tsx" },
                        { id: "md-card",  label: "Card.tsx" },
                      ]},
                    ]},
                    { id: "md-env",  label: ".env.local" },
                    { id: "md-pkg",  label: "package.json" },
                  ]}
                />
              </div>
            </div>

            {/* Multi-select */}
            <div id="treeview-multiselect" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Seleção múltipla</h3>
              <p className="text-sm text-zinc-500">Clique em itens para selecionar. Suporta seleção múltipla independente.</p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 max-w-xs">
                <TreeView
                  size="sm"
                  selectionMode="multiple"
                  showLines
                  defaultSelectedKeys={new Set(["ms-btn", "ms-auth"])}
                  items={[
                    { id: "ms-src", label: "src", defaultExpanded: true, children: [
                      { id: "ms-comp", label: "components", defaultExpanded: true, children: [
                        { id: "ms-btn",      label: "Button.tsx" },
                        { id: "ms-input",    label: "Input.tsx" },
                        { id: "ms-sidebar",  label: "Sidebar.tsx" },
                      ]},
                      { id: "ms-hooks", label: "hooks", defaultExpanded: true, children: [
                        { id: "ms-form", label: "useForm.ts" },
                        { id: "ms-auth", label: "useAuth.ts" },
                      ]},
                    ]},
                    { id: "ms-pkg", label: "package.json" },
                  ]}
                />
              </div>
            </div>

            {/* DnD */}
            <div id="treeview-dnd" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Drag & Drop</h3>
              <p className="text-sm text-zinc-500">Arraste itens para reordenar. Não é possível arrastar um item para dentro de seu próprio descendente.</p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 max-w-xs">
                <TreeView
                  size="sm"
                  draggable
                  defaultSelectedKeys={new Set()}
                  items={[
                    { id: "dnd-pages",   label: "pages",   defaultExpanded: true, children: [
                      { id: "dnd-home",    label: "index.tsx" },
                      { id: "dnd-about",   label: "about.tsx" },
                      { id: "dnd-contact", label: "contact.tsx" },
                      { id: "dnd-blog",    label: "blog.tsx", badge: "new" },
                    ]},
                    { id: "dnd-api",     label: "api",    children: [
                      { id: "dnd-users",  label: "users.ts" },
                      { id: "dnd-posts",  label: "posts.ts" },
                    ]},
                    { id: "dnd-config",  label: "next.config.ts" },
                  ]}
                />
              </div>
            </div>

            {/* Props */}
            <div id="treeview-props" className="space-y-4">
              <PropsTable rows={[
                ["items",              "TreeNode[]",                              "—",       "Nodes raiz da árvore"],
                ["size",               "'sm' | 'md'",                             "'sm'",    "Densidade visual"],
                ["selectionMode",      "'none' | 'single' | 'multiple'",          "'none'",  "Modo de seleção (none esconde checkboxes)"],
                ["selectedKeys",       "Set<string>",                             "—",       "Seleção controlada"],
                ["defaultSelectedKeys","Set<string>",                             "—",       "Seleção inicial (não controlada)"],
                ["onSelectionChange",  "(keys: Set<string>) => void",             "—",       "Callback de seleção"],
                ["showLines",          "boolean",                                 "false",   "Exibe linhas conectoras entre pai e filhos"],
                ["draggable",          "boolean",                                 "false",   "Habilita drag-and-drop para reordenar"],
                ["onMove",             "(dragId, targetId, pos) => void",         "—",       "Callback após mover um item"],
                ["className",          "string",                                  "—",       "Classes CSS adicionais"],
              ]} />
              <p className="text-xs text-zinc-400 mt-2">TreeNode: <code className="font-mono text-indigo-600">{"{ id, label, icon?, children?, defaultExpanded?, badge? }"}</code></p>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
