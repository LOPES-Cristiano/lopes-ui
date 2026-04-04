
'use client';

import React from "react";
import Button from "@/components/Button";
import ActionButton from "@/components/ActionButton";
import { MousePointer2, Download, ArrowUp, FileSearch, Lock, AlertTriangle, Package, Zap, Palette, Shield,
  LayoutDashboard, BookOpen, Settings, Bell, HelpCircle, LogOut, Users, BarChart2, FileText, Star,
  Search, Mail, User, Phone, Code2, Rocket,
  ArrowRight, Heart, MoreHorizontal, Layers, TrendingUp, Globe, ShoppingCart, Cpu,
  Pencil, Trash2, Eye, Copy, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import CommandMenu, { type CommandItem } from "@/components/CommandMenu";
import Form, { FormSection, FormRow } from "@/components/form/Form";
import TextField from "@/components/form/TextField";
import NumberField from "@/components/form/NumberField";
import DateField from "@/components/form/DateField";
import TimeField from "@/components/form/TimeField";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import AutocompleteField from "@/components/form/AutocompleteField";
import MultiSelectField from "@/components/form/MultiSelectField";
import FileField from "@/components/form/FileField";
import Switch from "@/components/form/Switch";
import ContextMenu from "@/components/ContextMenu";
import Avatar, { AvatarGroup } from "@/components/Avatar";
import Accordion from "@/components/Accordion";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Card, { CardHeader, CardBody, CardFooter } from "@/components/Card";
import Table from "@/components/Table";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableAction, FilterField } from "@/components/DataTable";
import { useAsyncButton } from "../hooks/useAsyncButton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import StatusPage from "@/components/StatusPage";
import CodeBlock from "@/components/CodeBlock";
import Sidebar from "@/components/Sidebar";

// ── DataTable full demo (extracted to keep Home lean) ──────────────────────

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
    render: (v) => <span className="font-medium text-zinc-800">{v as string}</span> },
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
  { label: "Ver perfil",  icon: Eye,      onClick: (r) => toast(`Perfil: ${r.name}`) },
  { label: "Editar",      icon: Pencil,   onClick: (r) => toast(`Editando: ${r.name}`) },
  { label: "Copiar ID",   icon: Copy,     onClick: (r) => { navigator.clipboard.writeText(String(r.id)); toast("ID copiado!"); } },
  { label: "Excluir",     icon: Trash2,   onClick: (r) => toast.error(`Excluído: ${r.name}`), danger: true, divider: true },
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

function DataTableFullDemo() {
  return (
    <div className="space-y-14">

      {/* Full-featured */}
      <div id="datatable-full">
        <h3 className="text-base font-semibold text-zinc-800 mb-1">Completo</h3>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <ExternalLink size={13} />
              Exportar
            </button>
          }
        />
      </div>

      {/* Simple — no toolbar */}
      <div id="datatable-simple">
        <h3 className="text-base font-semibold text-zinc-800 mb-1">Simples (sem toolbar)</h3>
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
        <h3 className="text-base font-semibold text-zinc-800 mb-1">Striped com ações</h3>
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

      {/* Props table */}
      <div id="datatable-props">
        <h3 className="text-base font-semibold text-zinc-800 mb-4">Props — DataTable</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs border border-zinc-200 rounded-xl overflow-hidden">
            <thead className="bg-zinc-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Prop</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Tipo</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Padrão</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                ["columns",          "DataTableColumn<T>[]",                    "—",      "Definição das colunas (key, label, render, sortable, hidden, summary…)"],
                ["rows",             "T[]",                                     "—",      "Array de dados"],
                ["actions",          "DataTableAction<T>[]",                    "—",      "Ações por linha — exibidas via menu (⋯) com hover"],
                ["globalSearch",     "boolean",                                 "false",  "Barra de busca global na toolbar"],
                ["filterFields",     "FilterField[]",                           "—",      "Campos do dialog de filtros (text, number, select, date, boolean)"],
                ["columnToggle",     "boolean",                                 "false",  "Painel de visibilidade de colunas"],
                ["showSummary",      "boolean",                                 "false",  "Linha de sumário (sum, avg, min, max, count) no rodapé da tabela"],
                ["pagination",       "boolean",                                 "false",  "Paginação com seletor de itens por página"],
                ["defaultPageSize",  "number",                                  "10",     "Tamanho inicial de página"],
                ["pageSizeOptions",  "number[]",                                "[10,25,50,100]", "Opções do seletor de página"],
                ["variant",          "'default'|'striped'|'bordered'|'minimal'","'default'", "Estilo visual"],
                ["size",             "'xs'|'sm'|'md'|'lg'",                    "'md'",   "Densidade das células"],
                ["stickyHeader",     "boolean",                                 "false",  "Cabeçalho fixo no scroll"],
                ["title",            "ReactNode",                               "—",      "Título exibido na toolbar"],
                ["toolbarSlot",      "ReactNode",                               "—",      "Slot extra na toolbar (ex: botão Exportar)"],
              ].map(([prop, type, def, desc]) => (
                <tr key={prop} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-mono text-indigo-700">{prop}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-600">{type}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-400">{def}</td>
                  <td className="px-4 py-2.5 text-zinc-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);
  const [alertDialogOpen2, setAlertDialogOpen2] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { loading, handleClick } = useAsyncButton(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
    {
      timeout: 3000,
      timeoutMessage: "Ação demorou demais!",
      timeoutType: "error",
      onErrorMessage: "Erro inesperado!",
      onErrorType: "error",
    }
  );

  // Toast examples handlers
  const notifySuccess = () => toast.success('Successfully toasted!');
  const notifyError = () => toast.error("This didn't work.");
  const notifyBasic = () => toast('Good Job!', { icon: '👏' });

  const notifyPromise = () => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => (Math.random() > 0.3 ? resolve('ok') : reject(new Error('fail'))), 1500);
    });

    toast.promise(p, {
      loading: 'Saving...',
      success: <b>Settings saved!</b>,
      error: <b>Could not save.</b>,
    });
  };

  const notifyStyledSuccess = () => toast.success('Look at my styles.', {
    style: {
      border: '1px solid #713200',
      padding: '16px',
      color: '#713200',
    },
    iconTheme: {
      primary: '#713200',
      secondary: '#FFFAEE',
    },
  });

  const notifyBig = () => toast(
    "This toast is super big. I don't think anyone could eat it in one bite.\n\nIt's larger than you expected. You eat it but it does not seem to get smaller.",
    { duration: 6000 },
  );

  const notifyStyled = () => toast('Hello Darkness!', {
    icon: '👏',
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  });

  return (
    <main className="flex-1 min-w-0 bg-zinc-50">

        {/* Hero */}
        <section id="overview" className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
          {/* Glow orbs */}
          <div className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-[400px] w-[400px] rounded-full bg-pink-600/15 blur-[120px]" />
          {/* Subtle grid */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative flex flex-col justify-between min-h-[calc(100vh-64px)] px-4 sm:px-10 py-10 sm:py-16">

            {/* Top content */}
            <div className="flex-1 flex flex-col justify-center max-w-2xl">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-medium text-zinc-300 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                v0.1.0 — em desenvolvimento
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-4 sm:mb-6">
                LopesWare{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  UI
                </span>
              </h1>

              <p className="text-base sm:text-xl text-zinc-400 leading-relaxed mb-6 sm:mb-10 max-w-lg">
                Biblioteca de componentes React + Next.js com Tailwind CSS.
                Pronta para produção, acessível e altamente customizável.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#install"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-zinc-900 px-5 py-2.5 text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-lg shadow-white/10"
                >
                  Começar agora →
                </a>
                <a
                  href="#button"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                  Ver componentes
                </a>
              </div>
            </div>

            {/* Bottom: feature pills + stats */}
            <div className="mt-8 sm:mt-16 flex flex-col gap-6">
              <div className="h-px bg-white/10" />
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: <Package size={13}/>, label: "Next.js App Router" },
                    { icon: <Zap size={13}/>, label: "Tailwind CSS" },
                    { icon: <Palette size={13}/>, label: "Lucide Icons" },
                    { icon: <Shield size={13}/>, label: "TypeScript" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1.5 text-xs text-zinc-400">
                      {icon} {label}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 sm:gap-8 text-right">
                  {[
                    { value: "5+", label: "componentes" },
                    { value: "100%", label: "TypeScript" }
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-2xl font-black text-white">{value}</p>
                      <p className="text-xs text-zinc-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14">

          {/* Install */}
          <section id="install">
            <SectionHeader label="Instalação" title="Comece em segundos" description="Adicione os pacotes necessários e importe os componentes diretamente." />
            <div className="mt-8 space-y-4">
              <CodeBlock filename="terminal" language="bash" code={`npm install lucide-react react-hot-toast tailwind-merge clsx`} />
              <CodeBlock filename="Button.tsx" language="tsx" code={`import Button from "@/components/Button";\n\nexport default function MyPage() {\n  return <Button variant="primary">Salvar</Button>;\n}`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* Button */}
          <section id="button">
            <SectionHeader
              label="Button"
              title="Button"
              description="Botão base da biblioteca. Suporta variantes, tamanhos, ícones esquerdo/direito e estado de carregamento assíncrono."
            />

            <DemoCard id="button-variants" title="Variantes">
              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={() => toast('clicou')}>Default</Button>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-sizes" title="Tamanhos">
              <div className="flex flex-wrap gap-3 items-end">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-icons" title="Com ícones e loading">
              <div className="flex flex-wrap gap-3 items-center">
                <Button leftIcon={<MousePointer2 size={16}/>} variant="primary">Ação</Button>
                <Button rightIcon={<Download size={16}/>} variant="outline">Baixar</Button>
                <Button loading={loading} onClick={handleClick} variant="primary">Async (3s timeout)</Button>
              </div>
            </DemoCard>

            <div id="button-props" className="mt-6">
              <PropsTable rows={[
                ["variant",    "string",  "default",   "solid | outline | ghost | primary | secondary | destructive"],
                ["size",       "string",  "md",         "sm | md | lg"],
                ["leftIcon",   "ReactNode","—",         "Ícone à esquerda do label"],
                ["rightIcon",  "ReactNode","—",         "Ícone à direita do label"],
                ["loading",    "boolean", "false",      "Exibe spinner e desabilita o botão"],
                ["componentId","string",  "—",          "ID para inventário de componentes"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Button.tsx" language="tsx" code={`<Button\n  variant="primary"\n  size="lg"\n  leftIcon={<Download size={16} />}\n  loading={isSaving}\n  onClick={handleSave}\n>\n  Salvar alterações\n</Button>`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ActionButton */}
          <section id="action-button">
            <SectionHeader
              label="ActionButton"
              title="ActionButton"
              description="Botão de ação compacto com ícone, tooltip e suporte a diálogo de confirmação antes de executar."
            />

            <DemoCard id="action-examples" title="Exemplos">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex flex-col items-center gap-1">
                  <ActionButton icon={<Download />} tooltip="Download" ariaLabel="Download file"
                    confirm={{ title: 'Iniciar download?', description: 'Deseja iniciar o download do arquivo?' }}
                    onClick={() => toast.success('Download iniciado')} componentId="demo.action.download"
                  />
                  <span className="text-xs text-zinc-400">Com confirm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ActionButton icon={<ArrowUp />} tooltip="Topo" ariaLabel="Back to top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="ghost"
                  />
                  <span className="text-xs text-zinc-400">Ghost</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ActionButton icon={<AlertTriangle />} tooltip="Atenção" ariaLabel="Warning"
                    onClick={() => toast.error('Ação perigosa!')} variant="destructive"
                  />
                  <span className="text-xs text-zinc-400">Destructive</span>
                </div>
              </div>
            </DemoCard>

            <div id="action-props" className="mt-6">
              <PropsTable rows={[
                ["icon",        "ReactNode","—",    "Ícone exibido no botão (obrigatório)"],
                ["tooltip",     "string",   "—",    "Texto do tooltip ao hover"],
                ["ariaLabel",   "string",   "—",    "Label acessível para screen readers"],
                ["confirm",     "object",   "—",    "Se definido, exibe diálogo de confirmação"],
                ["variant",     "string",   "solid","Mesmas variantes do Button"],
                ["componentId", "string",   "—",    "ID para inventário"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="ActionButton.tsx" language="tsx" code={`<ActionButton\n  icon={<Trash2 />}\n  tooltip="Excluir registro"\n  ariaLabel="Excluir"\n  variant="destructive"\n  confirm={{\n    title: "Excluir registro?",\n    description: "Esta ação não pode ser desfeita.",\n    confirmLabel: "Excluir",\n  }}\n  onClick={handleDelete}\n/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* Header */}
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

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* StatusPage */}
          <section id="status-pages">
            <SectionHeader
              label="StatusPage"
              title="StatusPage"
              description="Páginas de erro prontas para 404, 403 e 500. Podem ser usadas em tela cheia ou embutidas (inline) em qualquer container."
            />

            <DemoCard id="status-inline" title="Previews inline">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["404", "403", "500"] as const).map((v) => (
                  <div key={v} className="overflow-hidden rounded-xl border border-zinc-200">
                    <StatusPage
                      inline
                      variant={v}
                      code={Number(v)}
                      title={v === "404" ? "Não encontrado" : v === "403" ? "Sem acesso" : "Erro interno"}
                      description={v === "404" ? "Página não encontrada." : v === "403" ? "Você não tem permissão." : "Algo deu errado."}
                    />
                  </div>
                ))}
              </div>
            </DemoCard>

            <DemoCard id="status-fullscreen" title="Páginas full-screen">
              <div className="flex flex-wrap gap-3">
                <ActionButton icon={<FileSearch />} tooltip="404" ariaLabel="Go to 404" onClick={() => router.push('/not-found')} variant="outline" />
                <ActionButton icon={<Lock />} tooltip="403" ariaLabel="Go to 403" onClick={() => router.push('/access-denied')} variant="ghost" />
                <ActionButton icon={<AlertTriangle />} tooltip="500" ariaLabel="Cause 500" onClick={() => router.push('/cause-error')} variant="destructive" />
              </div>
            </DemoCard>

            <div id="status-props" className="mt-6">
              <PropsTable rows={[
                ["variant",       "string",   "—",     "404 | 403 | 500"],
                ["code",          "number",   "—",     "Código exibido como decoração de fundo"],
                ["title",         "string",   "—",     "Título da mensagem"],
                ["description",   "string",   "—",     "Descrição da mensagem"],
                ["inline",        "boolean",  "false", "Remove min-h-screen para uso embutido"],
                ["primaryAction", "object",   "—",     "Botão CTA principal { label, onClick }"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="not-found.tsx" language="tsx" code={`<StatusPage\n  variant="404"\n  code={404}\n  title="Página não encontrada"\n  description="O endereço que você acessou não existe."\n  primaryAction={{ label: "Voltar ao início", onClick: () => router.push("/") }}\n/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* Toasts */}
          <section id="toasts">
            <SectionHeader
              label="Toasts"
              title="react-hot-toast"
              description="Notificações contextuais usando react-hot-toast. Suporta sucesso, erro, promise, styled e custom com animação."
            />

            <DemoCard id="toasts-examples" title="Exemplos interativos — clique para disparar">
              <div className="flex flex-wrap gap-3">
                <Button onClick={notifySuccess} variant="primary" size="sm">success</Button>
                <Button onClick={notifyError} variant="destructive" size="sm">error</Button>
                <Button onClick={notifyBasic} variant="ghost" size="sm">basic + icon</Button>
                <Button onClick={notifyPromise} variant="outline" size="sm">promise</Button>
                <Button onClick={notifyBig} size="sm">longo</Button>
                <Button onClick={notifyStyled} variant="secondary" size="sm">dark styled</Button>
                <Button onClick={notifyStyledSuccess} variant="secondary" size="sm">success styled</Button>
              </div>
            </DemoCard>

            <div className="mt-6 space-y-4">
              <CodeBlock filename="toasts.tsx" language="tsx" code={`// Sucesso e erro\ntoast.success('Salvo com sucesso!');\ntoast.error('Algo deu errado.');\n\n// Promise\ntoast.promise(salvarDados(), {\n  loading: 'Salvando...',\n  success: 'Dados salvos!',\n  error: 'Falha ao salvar.',\n});`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* Sidebar */}
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
                  title="LopesWare"
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
                        { label: "Desativado",    href: "/nope",     icon: Lock, disabled: true },
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
  title="LopesWare"
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

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* Forms */}
          <section id="forms">
            <SectionHeader
              label="Forms"
              title="Formulários"
              description="Campos altamente configuráveis com suporte a labels, tooltips, ícones, afixos, validação e layout em colunas."
            />

            <DemoCard id="fields-text" title="TextField — tamanhos e variantes">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField size="sm" label="Small" placeholder="Tamanho sm" />
                  <TextField size="md" label="Medium" placeholder="Tamanho md" />
                  <TextField size="lg" label="Large" placeholder="Tamanho lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField variant="default" label="Default (outline)" placeholder="Estilo padrão" />
                  <TextField variant="filled" label="Filled" placeholder="Estilo preenchido" />
                </div>
              </div>
            </DemoCard>

            <DemoCard id="fields-addons" title="Ícones, prefixos e sufixos">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Ícone esquerdo" leftIcon={<Search />} placeholder="Buscar..." />
                <TextField label="Ícone direito" type="email" rightIcon={<Mail />} placeholder="email@exemplo.com" />
                <TextField label="Prefixo" prefix="https://" placeholder="meusite.com" />
                <TextField label="Sufixo" suffix=".com.br" placeholder="dominio" />
              </div>
            </DemoCard>

            <DemoCard id="fields-states" title="Estados e validação">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Desabilitado" placeholder="Campo desabilitado" disabled defaultValue="Valor anterior" />
                <TextField label="Somente leitura" readOnly defaultValue="Não editável" />
                <TextField label="Com erro" required error="Este campo é obrigatório" placeholder="Campo vazio" />
                <TextField
                  label="Com tooltip e ajuda"
                  tooltip="Informe o CPF no formato 000.000.000-00"
                  helpText="Apenas números e pontuação"
                  placeholder="000.000.000-00"
                />
              </div>
            </DemoCard>

            <DemoCard id="fields-inline" title="Label inline">
              <div className="max-w-lg space-y-3">
                <TextField labelInline labelWidth="w-32" label="Nome" required placeholder="Cristiano" leftIcon={<User />} />
                <TextField labelInline labelWidth="w-32" label="Email" type="email" leftIcon={<Mail />} placeholder="email@exemplo.com" />
                <TextField labelInline labelWidth="w-32" label="Telefone" type="tel" leftIcon={<Phone />} placeholder="(00) 00000-0000" />
                <NumberField labelInline labelWidth="w-32" label="Idade" min={0} max={120} suffix="anos" helpText="Entre 0 e 120" />
              </div>
            </DemoCard>

            <DemoCard id="fields-number" title="NumberField — exemplos">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField label="Quantidade" placeholder="0" min={0} />
                <NumberField label="Preço" prefix="R$" placeholder="0,00" min={0} step={0.01} helpText="Duas casas decimais" />
                <NumberField label="Peso" suffix="kg" placeholder="0.0" min={0} max={999} step={0.1} />
                <NumberField label="Porcentagem" suffix="%" placeholder="0" min={0} max={100} error="Valor não pode exceder 100" />
              </div>
            </DemoCard>

            <DemoCard id="form-complete" title="Form com agrupamentos e colunas">
              <Form
                title="Cadastro de usuário"
                description="Preencha os dados abaixo para criar uma nova conta."
                card
                footer={
                  <>
                    <Button variant="primary">Criar conta</Button>
                    <Button variant="ghost">Cancelar</Button>
                  </>
                }
              >
                <FormSection title="Dados pessoais" description="Informações básicas de identificação.">
                  <FormRow columns={2}>
                    <TextField label="Nome" required placeholder="Cristiano" leftIcon={<User />} />
                    <TextField label="Sobrenome" required placeholder="Lopes" />
                  </FormRow>
                  <FormRow columns={2}>
                    <TextField label="Email" type="email" required placeholder="usuario@email.com" leftIcon={<Mail />} />
                    <TextField label="Telefone" type="tel" placeholder="(00) 00000-0000" leftIcon={<Phone />} />
                  </FormRow>
                </FormSection>
                <FormSection title="Informações adicionais">
                  <FormRow columns={3}>
                    <NumberField label="Idade" min={0} max={120} suffix="anos" />
                    <NumberField label="Altura" min={100} max={250} suffix="cm" />
                    <NumberField label="Peso" min={1} max={500} suffix="kg" step={0.1} />
                  </FormRow>
                  <FormRow>
                    <TextField
                      label="Site pessoal"
                      prefix="https://"
                      placeholder="meusite"
                      suffix=".com"
                      tooltip="URL completa sem o protocolo"
                      helpText="Opcional — será exibido no seu perfil"
                    />
                  </FormRow>
                </FormSection>
              </Form>
            </DemoCard>

            <div id="field-props" className="mt-6">
              <PropsTable rows={[
                ["label",       "string",    "—",       "Texto da etiqueta do campo"],
                ["labelInline", "boolean",   "false",   "Exibe a label horizontalmente à esquerda do input"],
                ["labelWidth",  "string",    "w-28",    "Largura da label inline (classe Tailwind)"],
                ["required",    "boolean",   "false",   "Marca como obrigatório (asterisco)"],
                ["tooltip",     "string",    "—",       "Mensagem exibida no hover do ícone ?"],
                ["error",       "string",    "—",       "Mensagem de erro (substitui helpText)"],
                ["helpText",    "string",    "—",       "Texto auxiliar abaixo do campo"],
                ["width",       "string",    "—",       "Classe Tailwind de largura do wrapper"],
                ["size",        "string",    "md",      "sm | md | lg"],
                ["variant",     "string",    "default", "default (outline) | filled"],
                ["leftIcon",    "ReactElement","—",     "Ícone dentro do input à esquerda"],
                ["rightIcon",   "ReactElement","—",     "Ícone dentro do input à direita"],
                ["prefix",      "string",    "—",       "Texto afixado à esquerda (ex: https://, R$)"],
                ["suffix",      "string",    "—",       "Texto afixado à direita (ex: kg, %, .com)"],
                ["disabled",    "boolean",   "false",   "Desabilita o campo"],
                ["readOnly",    "boolean",   "false",   "Campo somente leitura"],
                ["minLength",   "number",    "—",       "Comprimento mínimo (TextField)"],
                ["maxLength",   "number",    "—",       "Comprimento máximo (TextField)"],
                ["min",         "number",    "—",       "Valor mínimo (NumberField)"],
                ["max",         "number",    "—",       "Valor máximo (NumberField)"],
                ["step",        "number",    "1",       "Incremento/decremento (NumberField)"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Form.tsx" language="tsx" code={`import Form, { FormSection, FormRow } from "@/components/form/Form";
import TextField from "@/components/form/TextField";
import NumberField from "@/components/form/NumberField";

<Form
  title="Cadastro"
  description="Preencha os dados."
  card
  footer={<Button variant="primary">Salvar</Button>}
>
  <FormSection title="Dados pessoais">
    <FormRow columns={2}>
      <TextField label="Nome" required leftIcon={<User />} />
      <TextField label="Email" type="email" required rightIcon={<Mail />} />
    </FormRow>
  </FormSection>
  <FormSection title="Métricas">
    <FormRow columns={3}>
      <NumberField label="Idade"   min={0}   max={120} suffix="anos" />
      <NumberField label="Altura"  min={100} max={250} suffix="cm"   />
      <NumberField label="Peso"    min={1}   max={500} suffix="kg"   step={0.1} />
    </FormRow>
  </FormSection>
</Form>`} />
            </div>

            <DemoCard id="datetime-fields" title="DateField e TimeField">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField label="Data" mode="date" />
                <TimeField label="Hora" />
                <DateField label="Data e hora" mode="datetime" />
                <TimeField label="Com segundos" precision="seconds" tooltip="Inclui campo de segundos" />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField label="Range de datas" min="2026-01-01" max="2026-12-31" helpText="Apenas datas de 2026" />
                <DateField variant="filled" label="Filled" required error="Data é obrigatória" />
              </div>
            </DemoCard>

            <DemoCard id="checkbox-shapes" title="CheckboxGroup — quadrado e círculo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <CheckboxGroup
                  label="Quadrado (multiple)"
                  shape="square"
                  multiple
                  defaultValue={["ts"]}
                  options={[
                    { value: "ts",   label: "TypeScript",  description: "Tipagem estática" },
                    { value: "react",label: "React",       description: "UI declarativa" },
                    { value: "next", label: "Next.js",     description: "Full-stack" },
                    { value: "old",  label: "jQuery",      description: "Legado", disabled: true },
                  ]}
                />
                <CheckboxGroup
                  label="Círculo (single)"
                  shape="circle"
                  multiple={false}
                  defaultValue={["md"]}
                  options={[
                    { value: "sm", label: "Pequeno" },
                    { value: "md", label: "Médio" },
                    { value: "lg", label: "Grande" },
                    { value: "xl", label: "Extra grande" },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="checkbox-horizontal" title="CheckboxGroup — horizontal e tamanhos">
              <div className="space-y-6">
                <CheckboxGroup
                  label="Linguagens (horizontal)"
                  shape="square"
                  direction="horizontal"
                  defaultValue={["ts", "py"]}
                  options={[
                    { value: "ts",   label: "TypeScript" },
                    { value: "js",   label: "JavaScript" },
                    { value: "py",   label: "Python" },
                    { value: "rust", label: "Rust" },
                    { value: "go",   label: "Go" },
                  ]}
                />
                <CheckboxGroup
                  label="Tamanho lg"
                  size="lg"
                  shape="square"
                  direction="horizontal"
                  options={[
                    { value: "a", label: "Opção A" },
                    { value: "b", label: "Opção B" },
                    { value: "c", label: "Opção C" },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="autocomplete-examples" title="AutocompleteField">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutocompleteField
                  label="País"
                  placeholder="Buscar país..."
                  options={["Brasil", "Argentina", "Chile", "Colômbia", "Peru", "Uruguai", "Paraguai", "Bolívia", "Equador", "Venezuela"]}
                />
                <AutocompleteField
                  label="Framework"
                  helpText="Escolha seu principal stack"
                  placeholder="Buscar..."
                  options={[
                    { value: "react",   label: "React" },
                    { value: "vue",     label: "Vue" },
                    { value: "angular", label: "Angular" },
                    { value: "svelte",  label: "Svelte" },
                    { value: "nextjs",  label: "Next.js" },
                    { value: "nuxt",    label: "Nuxt" },
                    { value: "remix",   label: "Remix" },
                  ]}
                />
                <AutocompleteField
                  label="Filled"
                  variant="filled"
                  placeholder="Buscar..."
                  options={["Opção A", "Opção B", "Opção C", "Opção D"]}
                />
                <AutocompleteField
                  label="Com erro"
                  placeholder="Buscar..."
                  error="Selecione uma opção válida"
                  options={["React", "Vue", "Angular"]}
                />
              </div>
            </DemoCard>

            <DemoCard id="multiselect-examples" title="MultiSelectField">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MultiSelectField
                  label="Habilidades"
                  placeholder="Adicionar habilidade..."
                  defaultValue={["ts", "react"]}
                  options={[
                    { value: "ts",       label: "TypeScript" },
                    { value: "react",    label: "React" },
                    { value: "next",     label: "Next.js" },
                    { value: "tailwind", label: "Tailwind CSS" },
                    { value: "node",     label: "Node.js" },
                    { value: "prisma",   label: "Prisma" },
                    { value: "postgres", label: "PostgreSQL" },
                  ]}
                />
                <MultiSelectField
                  label="Categorias (máx. 3)"
                  placeholder="Selecionar categoria..."
                  maxSelections={3}
                  helpText="Selecione até 3 categorias"
                  options={[
                    { value: "design",  label: "Design" },
                    { value: "dev",     label: "Desenvolvimento" },
                    { value: "product", label: "Produto" },
                    { value: "data",    label: "Dados" },
                    { value: "infra",   label: "Infraestrutura" },
                    { value: "mobile",  label: "Mobile" },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="file-examples" title="FileField — compact e drop zone">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileField
                    label="Documento"
                    accept=".pdf,.docx"
                    maxSize={5 * 1024 * 1024}
                  />
                  <FileField
                    label="Imagem de perfil"
                    accept="image/*"
                    buttonLabel="Escolher imagem"
                  />
                  <FileField
                    label="Múltiplos arquivos"
                    multiple
                    accept=".jpg,.png,.webp"
                    helpText="JPG, PNG ou WebP"
                  />
                  <FileField
                    label="Com erro"
                    accept=".pdf"
                    error="Arquivo inválido ou muito grande"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileField
                    label="Drop zone"
                    variant="drop"
                    accept=".pdf,.docx,.xlsx"
                    maxSize={10 * 1024 * 1024}
                  />
                  <FileField
                    label="Drop zone — múltiplos"
                    variant="drop"
                    multiple
                    accept="image/*"
                    helpText="Arraste suas imagens aqui"
                  />
                </div>
              </div>
            </DemoCard>

            <div id="advanced-field-props" className="mt-6">
              <PropsTable rows={[
                ["mode",           "string",    "date",      "DateField: date | datetime"],
                ["precision",      "string",    "minutes",   "TimeField: minutes | seconds"],
                ["min / max",      "string",    "—",         "DateField/TimeField: limites ISO (YYYY-MM-DD)"],
                ["shape",          "string",    "square",    "CheckboxGroup: square | circle"],
                ["multiple",       "boolean",   "true",      "CheckboxGroup: permite múltipla seleção"],
                ["direction",      "string",    "vertical",  "CheckboxGroup: vertical | horizontal"],
                ["options",        "array",     "—",         "AutocompleteField / MultiSelectField / CheckboxGroup"],
                ["onSelect",       "function",  "—",         "AutocompleteField: callback ao selecionar opção"],
                ["maxSuggestions", "number",    "10",        "AutocompleteField: máx. itens no dropdown"],
                ["emptyMessage",   "string",    "Nenhum resultado","AutocompleteField: texto quando sem resultados"],
                ["maxSelections",  "number",    "—",         "MultiSelectField: limite de seleção"],
                ["searchable",     "boolean",   "true",      "MultiSelectField: habilita busca no dropdown"],
                ["accept",         "string",    "—",         "FileField: tipos aceitos (.pdf, image/*, etc.)"],
                ["maxSize",        "number",    "—",         "FileField: tamanho máximo em bytes"],
                ["variant",        "string",    "compact",   "FileField: compact | drop"],
                ["buttonLabel",    "string",    "Escolher arquivo","FileField: texto do botão (compact)"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="advanced-fields.tsx" language="tsx" code={`import DateField   from "@/components/form/DateField";
import TimeField   from "@/components/form/TimeField";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import AutocompleteField from "@/components/form/AutocompleteField";
import MultiSelectField  from "@/components/form/MultiSelectField";
import FileField   from "@/components/form/FileField";

// Date / Time
<DateField label="Nascimento" mode="date" min="1900-01-01" max="2026-12-31" required />
<TimeField label="Horário" precision="minutes" />

// Checkboxes animados
<CheckboxGroup
  label="Planos"
  shape="circle"
  multiple={false}
  options={[
    { value: "free",  label: "Free",  description: "Gratuito" },
    { value: "pro",   label: "Pro",   description: "R$ 29/mês" },
    { value: "team",  label: "Team",  description: "R$ 99/mês" },
  ]}
  defaultValue={["free"]}
/>

// Autocomplete com objetos
<AutocompleteField
  label="Cidade"
  options={cidades}         // string[] ou { value, label }[]
  onSelect={(opt) => console.log(opt.value)}
/>

// Multi-select com chips
<MultiSelectField
  label="Tags"
  options={tags}
  maxSelections={5}
  defaultValue={["react"]}
/>

// Upload compact e drop zone
<FileField label="Contrato"   accept=".pdf"   maxSize={5_000_000} />
<FileField label="Imagens"    variant="drop"  multiple accept="image/*" />`} />
            </div>
          </section>

          {/* Switch & ContextMenu */}
          <section id="interactions">
            <SectionHeader
              label="Interação"
              title="Switch e Context Menu"
              description="Toggle para ativar/desativar configurações e menu de contexto acionado por clique-direito, clique simples ou teclas de atalho."
            />

            <DemoCard id="switch-sizes" title="Switch — tamanhos e cores">
              <div className="flex flex-wrap gap-6 items-start">
                <Switch size="sm" inlineLabel="Pequeno" defaultChecked />
                <Switch size="md" inlineLabel="Médio" defaultChecked color="indigo" />
                <Switch size="lg" inlineLabel="Grande" defaultChecked color="emerald" />
              </div>
              <div className="mt-4 flex flex-wrap gap-6 items-start">
                <Switch size="md" inlineLabel="Indigo"  defaultChecked color="indigo" />
                <Switch size="md" inlineLabel="Emerald" defaultChecked color="emerald" />
                <Switch size="md" inlineLabel="Sky"     defaultChecked color="sky" />
                <Switch size="md" inlineLabel="Rose"    defaultChecked color="rose" />
                <Switch size="md" inlineLabel="Amber"   defaultChecked color="amber" />
                <Switch size="md" inlineLabel="Zinc"    defaultChecked color="zinc" />
              </div>
            </DemoCard>

            <DemoCard id="switch-label" title="Switch — label, descrição e estados">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Switch
                  label="Notificações"
                  inlineLabel="Ativar notificações"
                  description="Receba alertas por e-mail e push"
                  defaultChecked
                />
                <Switch
                  label="Modo manutenção"
                  inlineLabel="Sistema em manutenção"
                  description="Bloqueia acesso de usuários finais"
                  color="rose"
                />
                <Switch
                  inlineLabel="Desabilitado (on)"
                  defaultChecked
                  disabled
                />
                <Switch
                  inlineLabel="Desabilitado (off)"
                  disabled
                />
                <Switch
                  label="Com erro"
                  inlineLabel="Aceitar termos"
                  required
                  error="Este campo é obrigatório"
                />
                <Switch
                  label="Com tooltip"
                  inlineLabel="Auto-save"
                  tooltip="Salva rascunhos automaticamente a cada 30 segundos"
                  helpText="Pode ser desativado nas configurações"
                  defaultChecked
                />
              </div>
            </DemoCard>

            <DemoCard id="switch-label-left" title="Switch — label à esquerda (inverso)">
              <div className="flex flex-col gap-4 max-w-xs">
                <Switch inlineLabel="Tema escuro"       labelLeft defaultChecked />
                <Switch inlineLabel="Sons do sistema"   labelLeft color="emerald" />
                <Switch inlineLabel="Sincronização"     labelLeft defaultChecked color="sky" />
              </div>
            </DemoCard>

            <DemoCard id="context-menu-basic" title="Context Menu — clique direito">
              <div className="flex flex-wrap gap-4">
                <ContextMenu
                  items={[
                    { label: "Ver detalhes",  icon: undefined, shortcut: "Enter" },
                    { label: "Editar",        shortcut: "⌘E",  onClick: () => {} },
                    { label: "Duplicar",      shortcut: "⌘D",  onClick: () => {} },
                    { divider: true, label: "Mover para", children: [
                      { label: "Rascunhos" },
                      { label: "Arquivo" },
                      { label: "Lixeira", danger: true },
                    ]},
                    { divider: true, label: "Excluir", danger: true, shortcut: "⌫", onClick: () => {} },
                  ]}
                >
                  <div className="flex h-24 w-48 cursor-context-menu items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors select-none">
                    Clique direito aqui
                  </div>
                </ContextMenu>

                <ContextMenu
                  trigger="click"
                  items={[
                    { label: "Copiar link",    shortcut: "⌘C" },
                    { label: "Abrir em nova aba", shortcut: "⌘↵" },
                    { divider: true, label: "Reportar", danger: true },
                  ]}
                >
                  <div className="flex h-24 w-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 text-sm text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors select-none">
                    Clique simples aqui
                  </div>
                </ContextMenu>
              </div>
            </DemoCard>

            <DemoCard id="context-menu-rich" title="Context Menu — com ícones e submenus">
              <ContextMenu
                items={[
                  { label: "Novo arquivo",   icon: undefined, shortcut: "⌘N",  description: "Cria um arquivo em branco" },
                  { label: "Novo a partir de template", children: [
                    { label: "Documento" },
                    { label: "Planilha" },
                    { label: "Apresentação" },
                  ]},
                  { divider: true, label: "Compartilhar",  shortcut: "⌘⇧S" },
                  { label: "Duplicar",       shortcut: "⌘D" },
                  { label: "Renomear",       shortcut: "F2"  },
                  { divider: true, label: "Mover para lixeira", danger: true, shortcut: "⌫" },
                ]}
              >
                <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500 mb-3">Lista de arquivos — clique direito em um item</p>
                  <div className="space-y-1">
                    {["Relatório Q1.pdf", "Apresentação.pptx", "Dados.xlsx"].map((name) => (
                      <div key={name} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 bg-white border border-zinc-100 cursor-context-menu hover:bg-zinc-50 transition-colors">
                        <span className="h-2 w-2 rounded-full bg-zinc-300 shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </ContextMenu>
            </DemoCard>

            <div id="interaction-props" className="mt-6">
              <PropsTable rows={[
                ["inlineLabel",  "string",   "—",          "Switch: label renderizado à direita do toggle"],
                ["description",  "string",   "—",          "Switch: texto secundário abaixo do inlineLabel"],
                ["color",        "string",   "indigo",     "Switch: indigo | emerald | sky | rose | amber | zinc"],
                ["labelLeft",    "boolean",  "false",      "Switch: exibe o inlineLabel à esquerda"],
                ["size",         "string",   "md",         "Switch: sm | md | lg"],
                ["trigger",      "string",   "contextmenu","ContextMenu: contextmenu | click | both"],
                ["items",        "array",    "—",          "ContextMenu: lista de ContextMenuItem"],
                ["onSelect",     "function", "—",          "ContextMenu: callback ao clicar em item"],
                ["divider",      "boolean",  "false",      "ContextMenuItem: linha separadora antes do item"],
                ["danger",       "boolean",  "false",      "ContextMenuItem: estilo vermelho"],
                ["shortcut",     "string",   "—",          "ContextMenuItem: atalho exibido à direita"],
                ["children",     "array",    "—",          "ContextMenuItem: sub-menu aninhado"],
                ["componentId",  "string",   "—",          "Switch + ContextMenuItem: data-component-id para controle de acesso"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Switch-ContextMenu.tsx" language="tsx" code={`import Switch from "@/components/form/Switch";
import ContextMenu from "@/components/ContextMenu";

// Toggle simples
<Switch
  label="Notificações"
  inlineLabel="Ativar notificações push"
  description="Você receberá alertas em tempo real"
  defaultChecked
  color="emerald"
  componentId="settings.notifications.enable"
  onChange={(checked) => console.log(checked)}
/>

// Menu de contexto (clique direito)
<ContextMenu
  items={[
    { label: "Editar",   shortcut: "⌘E",  onClick: handleEdit },
    { label: "Duplicar", shortcut: "⌘D",  onClick: handleDuplicate },
    { divider: true, label: "Excluir", danger: true, shortcut: "⌫",
      onClick: handleDelete, componentId: "erp.produto.excluir" },
  ]}
  onSelect={(item) => console.log(item.label)}
>
  <div>Clique direito aqui</div>
</ContextMenu>

// Menu de contexto em clique simples
<ContextMenu trigger="click" items={menuItems}>
  <button>Ações</button>
</ContextMenu>`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== AVATAR ===================== */}
          <section id="avatars" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Avatar</h2>
              <p className="mt-1 text-zinc-500">Exibe imagem, iniciais ou ícone de fallback, com indicador de status e grupo empilhado.</p>
            </div>

            {/* Sizes + Status */}
            <div id="avatar-sizes" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Tamanhos &amp; Status</h3>
              <div className="flex flex-wrap items-end gap-6 p-6 bg-white rounded-xl border border-zinc-100">
                {(["xs","sm","md","lg","xl","2xl"] as const).map((s) => (
                  <Avatar key={s} name="Cristiano Lopes" size={s} status="online" />
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-6 p-6 bg-white rounded-xl border border-zinc-100">
                <Avatar name="Online" size="lg" status="online" />
                <Avatar name="Away" size="lg" status="away" />
                <Avatar name="Busy" size="lg" status="busy" />
                <Avatar name="Offline" size="lg" status="offline" />
              </div>
            </div>

            {/* Shape */}
            <div id="avatar-shapes" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Formas</h3>
              <div className="flex flex-wrap items-center gap-6 p-6 bg-white rounded-xl border border-zinc-100">
                <Avatar name="Circle" size="xl" shape="circle" />
                <Avatar name="Square" size="xl" shape="square" />
                <Avatar src="https://i.pravatar.cc/150?img=3" alt="Foto" size="xl" shape="circle" status="online" />
                <Avatar src="https://i.pravatar.cc/150?img=5" alt="Foto" size="xl" shape="square" />
              </div>
            </div>

            {/* AvatarGroup */}
            <div id="avatar-group" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">AvatarGroup</h3>
              <div className="flex flex-wrap items-center gap-8 p-6 bg-white rounded-xl border border-zinc-100">
                <AvatarGroup
                  avatars={[
                    { name: "Ana Silva" },
                    { name: "Bruno Costa" },
                    { name: "Carla Dias" },
                    { name: "Diego Melo" },
                    { name: "Eva Nunes" },
                    { name: "Fábio Reis" },
                  ]}
                  max={4}
                  size="md"
                />
                <AvatarGroup
                  avatars={[
                    { name: "Alice" },
                    { name: "Bob" },
                    { name: "Carol" },
                  ]}
                  max={10}
                  size="lg"
                />
              </div>
            </div>

            {/* Fallback */}
            <div id="avatar-fallback" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Fallback: iniciais &amp; ícone</h3>
              <div className="flex flex-wrap items-center gap-6 p-6 bg-white rounded-xl border border-zinc-100">
                <Avatar initials="CL" size="lg" />
                <Avatar name="Rodrigo Almeida" size="lg" />
                <Avatar name="Beatriz" size="lg" />
                <Avatar size="lg" />
              </div>
            </div>

            <div id="avatar-props">
              <CodeBlock code={`import Avatar, { AvatarGroup } from "@/components/Avatar";

<Avatar name="Ana Silva" size="lg" status="online" />
<Avatar src="/foto.png" alt="Foto" size="md" shape="square" />
<Avatar initials="CL" size="xl" />

<AvatarGroup
  avatars={[{ name: "Ana" }, { name: "Bruno" }, { name: "Carla" }]}
  max={2}
  size="md"
/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== ACCORDION ===================== */}
          <section id="accordion" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Accordion</h2>
              <p className="mt-1 text-zinc-500">Lista colapsável com animação suave, variantes e suporte a múltiplos abertos.</p>
            </div>

            {/* Default */}
            <div id="accordion-default" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Default</h3>
              <Accordion
                items={[
                  { title: "O que é o LopesWare UI?", content: "É uma biblioteca de componentes React construída com Next.js e Tailwind CSS." },
                  { title: "Posso usar em produção?", content: "Sim! Todos os componentes são acessíveis e foram projetados pensando em produção.", defaultOpen: true },
                  { title: "Como instalar?", content: "Clone o repositório e instale as dependências com npm install." },
                  { title: "Suporte a dark mode?", content: "Em breve.", disabled: true },
                ]}
              />
            </div>

            {/* Variants */}
            <div id="accordion-variants" className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-800">Variantes</h3>
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

            <div id="accordion-props">
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

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== ALERT ===================== */}
          <section id="alerts" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Alert</h2>
              <p className="mt-1 text-zinc-500">Notificações inline ou modais com variantes semânticas, ações e dismiss.</p>
            </div>

            {/* Variants */}
            <div id="alert-variants" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Variantes inline</h3>
              <div className="space-y-3">
                <Alert variant="info" title="Informação" description="Esta é uma mensagem informativa para o usuário." dismissible />
                <Alert variant="success" title="Sucesso!" description="Operação concluída com êxito." dismissible />
                <Alert variant="warning" title="Atenção" description="Verifique os dados antes de continuar." dismissible />
                <Alert variant="danger" title="Erro" description="Não foi possível processar a solicitação." dismissible />
                <Alert variant="neutral" title="Nota" description="Nenhuma ação é necessária no momento." dismissible />
              </div>
            </div>

            {/* With actions */}
            <div id="alert-actions" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Com ações</h3>
              <div className="space-y-3">
                <Alert
                  variant="warning"
                  title="Sessão expirando"
                  description="Você será desconectado em 5 minutos por inatividade."
                  actions={[
                    { label: "Renovar sessão", onClick: () => toast.success("Sessão renovada!") },
                    { label: "Sair agora", onClick: () => toast("Saindo…"), variant: "ghost" },
                  ]}
                />
                <Alert
                  variant="danger"
                  title="Ação irreversível"
                  description="Esta operação não pode ser desfeita após confirmação."
                  actions={[
                    { label: "Confirmar", onClick: () => toast.error("Excluído!") },
                    { label: "Cancelar", onClick: () => {}, variant: "ghost" },
                  ]}
                />
              </div>
            </div>

            {/* Dialog mode */}
            <div id="alert-dialog" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Modo Dialog</h3>
              <div className="flex flex-wrap gap-3 p-6 bg-white rounded-xl border border-zinc-100">
                <button
                  onClick={() => setAlertDialogOpen(true)}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Abrir alerta de aviso
                </button>
                <button
                  onClick={() => setAlertDialogOpen2(true)}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Abrir alerta de perigo
                </button>
              </div>

              <Alert
                dialog
                open={alertDialogOpen}
                onClose={() => setAlertDialogOpen(false)}
                variant="warning"
                title="Confirmar alterações?"
                description="As alterações feitas serão salvas permanentemente. Esta ação não pode ser desfeita facilmente."
                actions={[
                  { label: "Salvar mesmo assim", onClick: () => { toast.success("Salvo!"); setAlertDialogOpen(false); } },
                  { label: "Cancelar", onClick: () => setAlertDialogOpen(false), variant: "ghost" },
                ]}
              />
              <Alert
                dialog
                open={alertDialogOpen2}
                onClose={() => setAlertDialogOpen2(false)}
                variant="danger"
                title="Excluir conta?"
                description="Todos os seus dados serão permanentemente apagados. Esta ação não pode ser desfeita."
                actions={[
                  { label: "Sim, excluir", onClick: () => { toast.error("Conta excluída!"); setAlertDialogOpen2(false); } },
                  { label: "Não, manter", onClick: () => setAlertDialogOpen2(false), variant: "ghost" },
                ]}
              />
            </div>

            <div id="alert-props">
              <CodeBlock code={`import Alert from "@/components/Alert";

// Inline
<Alert variant="success" title="Tudo certo!" description="Operação concluída." dismissible />

// Com ações
<Alert
  variant="warning"
  title="Sessão expirando"
  description="Você será desconectado em breve."
  actions={[
    { label: "Renovar", onClick: handleRenew },
    { label: "Sair", onClick: handleLogout, variant: "ghost" },
  ]}
/>

// Dialog (modal)
const [open, setOpen] = useState(false);
<Alert
  dialog
  open={open}
  onClose={() => setOpen(false)}
  variant="danger"
  title="Excluir?"
  description="Esta ação não pode ser desfeita."
  actions={[
    { label: "Confirmar", onClick: handleConfirm },
    { label: "Cancelar", onClick: () => setOpen(false), variant: "ghost" },
  ]}
/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== BADGE ===================== */}
          <section id="badges" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Badge</h2>
              <p className="mt-1 text-zinc-500">Etiquetas compactas para status, categorias e contadores.</p>
            </div>

            {/* Variants soft */}
            <div id="badge-variants" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Variantes (soft)</h3>
              <div className="flex flex-wrap gap-2 p-6 bg-white rounded-xl border border-zinc-100">
                {(["default","primary","success","warning","danger","info","violet","pink","orange","teal"] as const).map((v) => (
                  <Badge key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} variant={v} />
                ))}
              </div>
            </div>

            {/* Solid */}
            <div id="badge-solid" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Solid</h3>
              <div className="flex flex-wrap gap-2 p-6 bg-white rounded-xl border border-zinc-100">
                {(["default","primary","success","warning","danger","info","violet","pink","orange","teal"] as const).map((v) => (
                  <Badge key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} variant={v} solid />
                ))}
              </div>
            </div>

            {/* Features: dot, icon, remove, sizes, square */}
            <div id="badge-features" className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-800">Funcionalidades</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">Tamanhos</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label="xs" size="xs" variant="primary" />
                    <Badge label="sm" size="sm" variant="primary" />
                    <Badge label="md" size="md" variant="primary" />
                    <Badge label="lg" size="lg" variant="primary" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">Com dot</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label="Online" variant="success" dot />
                    <Badge label="Ausente" variant="warning" dot />
                    <Badge label="Ocupado" variant="danger" dot />
                    <Badge label="Offline" variant="default" dot />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">Com ícone</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label="Destaque" variant="violet" icon={Star} />
                    <Badge label="Novo" variant="info" icon={Package} />
                    <Badge label="Usuários" variant="teal" icon={Users} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">Removível</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label="React" variant="info" onRemove={() => toast("Removido: React")} />
                    <Badge label="TypeScript" variant="primary" onRemove={() => toast("Removido: TypeScript")} />
                    <Badge label="Next.js" variant="default" onRemove={() => toast("Removido: Next.js")} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase mb-2">Quadrado</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label="v2.1.0" variant="success" square />
                    <Badge label="Beta" variant="warning" square solid />
                    <Badge label="Deprecated" variant="danger" square />
                  </div>
                </div>
              </div>
            </div>

            <div id="badge-props">
              <CodeBlock code={`import Badge from "@/components/Badge";
import { Star } from "lucide-react";

<Badge label="Sucesso" variant="success" />
<Badge label="Sólido" variant="primary" solid />
<Badge label="Online" variant="success" dot />
<Badge label="Destaque" variant="violet" icon={Star} />
<Badge label="Remover" variant="info" onRemove={() => remove()} />
<Badge label="v1.0" variant="default" square />`} />
            </div>
          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== COMMAND MENU ===================== */}
          <section id="command-menu" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Command Menu</h2>
              <p className="mt-1 text-zinc-500">Paleta de comandos com pesquisa, grupos e atalhos de teclado. Substitui o campo de busca no Header.</p>
            </div>

            {/* Trigger */}
            <div id="command-basic" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800">Demo interativo</h3>
              <p className="text-sm text-zinc-500">Clique no botão ou pressione <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs font-medium">Ctrl+K</kbd> para abrir.</p>
              <div className="flex items-center gap-4 p-6 bg-white rounded-xl border border-zinc-100">
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
              <h3 className="text-lg font-semibold text-zinc-800">Estrutura dos itens</h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-100">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Prop</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Padrão</th>
                      <th className="px-4 py-3">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
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
                    ].map(([prop, type, def, desc]) => (
                      <tr key={prop} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-600">{prop}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">{type}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">{def}</td>
                        <td className="px-4 py-3 text-zinc-600">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== CARD ===================== */}
          <section id="cards" className="space-y-10 pb-10 sm:pb-14">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1">Card</h2>
              <p className="text-zinc-500 text-sm">Contêiner versátil com suporte a variantes, sombras, backgrounds, destaque colorido e slots compostos.</p>
            </div>

            {/* Variants */}
            <div id="card-variants">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Variantes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <Card variant="default" radius="xl">
                  <CardHeader title="Default" description="Fundo branco com borda sutil." />
                  <CardBody><p className="text-sm text-zinc-500">Ideal para a maioria dos casos de uso. Combina bem com qualquer contexto.</p></CardBody>
                  <CardFooter divider><Button size="sm" variant="ghost">Ação</Button></CardFooter>
                </Card>

                <Card variant="outlined" radius="xl">
                  <CardHeader title="Outlined" description="Fundo transparente, borda visível." />
                  <CardBody><p className="text-sm text-zinc-500">Boa escolha em áreas com background colorido.</p></CardBody>
                  <CardFooter divider><Button size="sm" variant="ghost">Ação</Button></CardFooter>
                </Card>

                <Card variant="elevated" shadow="md" radius="xl">
                  <CardHeader title="Elevated" description="Sombra mediana, sem borda." />
                  <CardBody><p className="text-sm text-zinc-500">Destaca o card sobre a página com elevação visual.</p></CardBody>
                  <CardFooter divider><Button size="sm" variant="ghost">Ação</Button></CardFooter>
                </Card>

                <Card variant="filled" color="primary" radius="xl">
                  <CardHeader title="Filled · Primary" description="Background tintado com a cor primária." />
                  <CardBody><p className="text-sm text-indigo-700">Excelente para painéis de destaque ou resumos.</p></CardBody>
                  <CardFooter divider><Button size="sm" variant="ghost">Ação</Button></CardFooter>
                </Card>

                <Card variant="filled" color="success" radius="xl">
                  <CardHeader title="Filled · Success" description="Background tintado verde-esmeralda." />
                  <CardBody><p className="text-sm text-emerald-700">Status positivos, confirmações e resultados bem-sucedidos.</p></CardBody>
                  <CardFooter divider><Button size="sm" variant="ghost">Ação</Button></CardFooter>
                </Card>

                <Card variant="ghost" radius="xl">
                  <CardHeader title="Ghost" description="Sem fundo, sem borda." />
                  <CardBody><p className="text-sm text-zinc-500">Container puro para composição entre outros elementos.</p></CardBody>
                  <CardFooter divider><Button size="sm" variant="ghost">Ação</Button></CardFooter>
                </Card>

              </div>
            </div>

            {/* Shadows */}
            <div id="card-shadows">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Sombras</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {(["none", "sm", "md", "lg", "xl"] as const).map((s) => (
                  <Card key={s} variant="default" shadow={s} radius="xl">
                    <CardBody>
                      <p className="text-xs font-mono font-medium text-zinc-700 text-center">{`shadow="${s}"`}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div id="card-backgrounds">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Cores de Fundo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {(["default", "primary", "success", "warning", "danger", "info", "violet", "pink", "teal"] as const).map((c) => (
                  <Card key={c} variant="filled" color={c} radius="xl">
                    <CardBody>
                      <p className="text-xs font-mono font-medium text-zinc-700 text-center">{`color="${c}"`}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            {/* Accent */}
            <div id="card-accent">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Barra de Destaque (accent)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(["primary", "success", "warning", "danger"] as const).map((c) => (
                  <Card key={c} variant="default" color={c} accent radius="xl" shadow="sm">
                    <CardHeader title={`Accent · ${c}`} description="Barra colorida no topo." />
                    <CardBody><p className="text-sm text-zinc-500">Chama atenção para categorias ou prioridades.</p></CardBody>
                  </Card>
                ))}
              </div>
            </div>

            {/* With icon headers */}
            <div id="card-header">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Cards com Ícone e Ação</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <Card variant="default" shadow="sm" radius="xl">
                  <CardHeader
                    icon={TrendingUp}
                    iconColor="success"
                    title="Receita Mensal"
                    description="Comparado ao mês anterior"
                    action={<Badge variant="success" size="sm" label="+12%" />}
                  />
                  <CardBody>
                    <p className="text-3xl font-bold text-zinc-900">R$ 48.230</p>
                    <p className="mt-1 text-sm text-zinc-500">Meta: R$ 50.000</p>
                  </CardBody>
                  <CardFooter divider align="between">
                    <span className="text-xs text-zinc-400">Atualizado agora</span>
                    <button className="text-xs text-indigo-600 hover:underline flex items-center gap-1">Ver detalhes <ArrowRight size={12} /></button>
                  </CardFooter>
                </Card>

                <Card variant="default" shadow="sm" radius="xl">
                  <CardHeader
                    icon={Users}
                    iconColor="primary"
                    title="Usuários Ativos"
                    description="Últimas 24 horas"
                    action={
                      <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    }
                  />
                  <CardBody>
                    <p className="text-3xl font-bold text-zinc-900">2.847</p>
                    <p className="mt-1 text-sm text-zinc-500">Pico: 3.100 às 14h</p>
                  </CardBody>
                  <CardFooter divider>
                    <Button size="sm" variant="ghost">Relatório</Button>
                    <Button size="sm">Detalhes</Button>
                  </CardFooter>
                </Card>

                <Card variant="default" shadow="sm" radius="xl">
                  <CardHeader
                    icon={ShoppingCart}
                    iconColor="warning"
                    title="Pedidos Pendentes"
                    description="Aguardando aprovação"
                    action={<Badge variant="warning" size="sm" label="14" />}
                  />
                  <CardBody>
                    <p className="text-3xl font-bold text-zinc-900">R$ 7.410</p>
                    <p className="mt-1 text-sm text-zinc-500">9 pedidos em atraso</p>
                  </CardBody>
                  <CardFooter divider align="between">
                    <span className="text-xs text-zinc-400">Última hora</span>
                    <button className="text-xs text-amber-600 hover:underline flex items-center gap-1">Aprovar <ArrowRight size={12} /></button>
                  </CardFooter>
                </Card>

              </div>
            </div>

            {/* Hoverable / clickable */}
            <div id="card-interactive">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Interativos (hoverable)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <Card variant="default" shadow="sm" radius="xl" hoverable>
                  <CardHeader icon={Globe} iconColor="info" title="Acessos por Região" description="1 jan – 31 jan" />
                  <CardBody><p className="text-sm text-zinc-500">Passe o mouse para sentir o efeito de elevação.</p></CardBody>
                </Card>

                <Card variant="filled" color="primary" radius="xl" hoverable>
                  <CardHeader icon={Cpu} iconColor="primary" title="Uso de CPU" description="Média: 34%" />
                  <CardBody><p className="text-sm text-indigo-700">Card filled + hoverable em conjunto.</p></CardBody>
                </Card>

                <Card variant="elevated" shadow="md" radius="xl" onClick={() => alert("card clicado!") }>
                  <CardHeader icon={Layers} iconColor="violet" title="Card Clicável" description="Clique em mim" />
                  <CardBody><p className="text-sm text-zinc-500">Renderizado como `&lt;button&gt;` quando `onClick` é fornecido.</p></CardBody>
                </Card>

              </div>
            </div>

            {/* Radius showcase */}
            <div id="card-radius">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Border Radius</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {(["none", "sm", "md", "lg", "xl", "2xl"] as const).map((r) => (
                  <Card key={r} variant="default" shadow="sm" radius={r}>
                    <CardBody>
                      <p className="text-xs font-mono font-medium text-zinc-700 text-center">{`radius="${r}"`}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            {/* Props table */}
            <div id="card-props">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Props</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-xs border border-zinc-200 rounded-xl overflow-hidden">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Prop</th>
                      <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Tipo</th>
                      <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Padrão</th>
                      <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      ["variant", "'default' | 'outlined' | 'elevated' | 'filled' | 'ghost'", "'default'", "Estilo visual do card"],
                      ["color", "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'pink' | 'teal'", "'default'", "Esquema de cor (afeta filled, accent e ícones)"],
                      ["shadow", "'none' | 'sm' | 'md' | 'lg' | 'xl'", "'none'", "Sombra projetada"],
                      ["radius", "'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'", "'xl'", "Arredondamento das bordas"],
                      ["accent", "boolean", "false", "Exibe barra colorida no topo"],
                      ["hoverable", "boolean", "false", "Efeito de elevação ao passar o mouse"],
                      ["onClick", "() => void", "—", "Torna o card clicável (renderiza como button)"],
                      ["className", "string", "—", "Classes adicionais via twMerge"],
                      ["componentId", "string", "—", "Identificador para controle de acesso"],
                    ].map(([prop, type, def, desc]) => (
                      <tr key={prop} className="hover:bg-zinc-50">
                        <td className="px-4 py-2.5 font-mono text-indigo-700">{prop}</td>
                        <td className="px-4 py-2.5 font-mono text-zinc-600">{type}</td>
                        <td className="px-4 py-2.5 font-mono text-zinc-400">{def}</td>
                        <td className="px-4 py-2.5 text-zinc-500">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-zinc-700 mb-2">Sub-componentes</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-xs border border-zinc-200 rounded-xl overflow-hidden">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Componente</th>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Principais props</th>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Descrição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {[
                        ["CardHeader", "title, description, icon, iconColor, action", "Cabeçalho com ícone opcional e slot de ação"],
                        ["CardBody", "className", "Área de conteúdo principal com padding padrão"],
                        ["CardFooter", "align, divider", "Rodapé com suporte a alinhamento e separador"],
                        ["CardImage", "src, alt, height", "Imagem de capa com height configurável"],
                      ].map(([comp, props, desc]) => (
                        <tr key={comp} className="hover:bg-zinc-50">
                          <td className="px-4 py-2.5 font-mono text-indigo-700">{comp}</td>
                          <td className="px-4 py-2.5 font-mono text-zinc-600">{props}</td>
                          <td className="px-4 py-2.5 text-zinc-500">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-zinc-700 mb-2">Exemplo de uso</h4>
                <CodeBlock language="tsx" code={`import Card, { CardHeader, CardBody, CardFooter } from "@/components/Card";

<Card variant="elevated" shadow="md" radius="xl" accent color="primary">
  <CardHeader
    icon={TrendingUp}
    iconColor="primary"
    title="Receita Mensal"
    description="vs. mês anterior"
    action={<Badge color="success">+12%</Badge>}
  />
  <CardBody>
    <p className="text-3xl font-bold">R$ 48.230</p>
  </CardBody>
  <CardFooter divider align="between">
    <span>Atualizado agora</span>
    <Button size="sm">Ver mais</Button>
  </CardFooter>
</Card>`} />
              </div>
            </div>

          </section>

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== TABLE ===================== */}
          <section id="tables" className="space-y-10 pb-10 sm:pb-14">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1">Table</h2>
              <p className="text-zinc-500 text-sm">Tabela simples e altamente configurável, sem estado interno — ideal para listas estáticas ou controladas externamente.</p>
            </div>

            {/* Variants */}
            <div id="table-variants">
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Variantes</h3>
              <div className="space-y-6">
                {([
                  { variant: "default",  label: "Default" },
                  { variant: "striped",  label: "Striped" },
                  { variant: "bordered", label: "Bordered" },
                  { variant: "minimal",  label: "Minimal" },
                ] as const).map(({ variant, label }) => (
                  <div key={variant}>
                    <p className="text-xs font-mono font-medium text-zinc-500 mb-2">{`variant="${variant}"`}</p>
                    <Table
                      variant={variant}
                      size="sm"
                      columns={[
                        { key: "name",   label: "Nome",   render: (v) => <span className="font-medium text-zinc-800">{v as string}</span> },
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
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Tamanhos</h3>
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
              <h3 className="text-base font-semibold text-zinc-800 mb-4">Estado vazio</h3>
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

          <hr className="border-zinc-200 my-8 sm:my-12" />

          {/* ===================== DATA TABLE ===================== */}
          <section id="datatable" className="space-y-10 pb-10 sm:pb-14">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1">DataTable</h2>
              <p className="text-zinc-500 text-sm">Tabela completa com ordenação, busca global, filtros em dialog, visibilidade de colunas, sumário, paginação e menu de ações por linha.</p>
            </div>

            <DataTableFullDemo />

          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-zinc-200 text-center text-sm text-zinc-400">
            <p>LopesWare UI — construído com Next.js, Tailwind CSS e lucide-react.</p>
          </footer>

        </div>

      {/* Floating back-to-top */}
      <div className={["fixed bottom-6 right-6 z-50 transition-all duration-300", showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"].join(" ")}>
        <ActionButton
          icon={<ArrowUp />}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          tooltip="Voltar ao topo"
          ariaLabel="Voltar ao topo"
          size="lg"
          variant="solid"
          className="shadow-lg"
        />
      </div>

    </main>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

function SectionHeader({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="mb-8">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">{label}</span>
      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3">{title}</h2>
      <p className="text-zinc-500 leading-relaxed max-w-2xl">{description}</p>
    </div>
  );
}

function DemoCard({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="rounded-xl border border-zinc-200 bg-white overflow-hidden mb-4">
      <div className="border-b border-zinc-100 px-4 py-2.5">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function PropsTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div className="rounded-xl border border-zinc-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            {["Prop", "Tipo", "Default", "Descrição"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {rows.map(([prop, type, def, desc]) => (
            <tr key={prop} className="hover:bg-zinc-50 transition-colors">
              <td className="px-4 py-3"><code className="font-mono text-indigo-600 text-xs">{prop}</code></td>
              <td className="px-4 py-3"><code className="font-mono text-zinc-500 text-xs">{type}</code></td>
              <td className="px-4 py-3"><code className="font-mono text-zinc-400 text-xs">{def}</code></td>
              <td className="px-4 py-3 text-zinc-600 text-xs">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
     