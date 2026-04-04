
'use client';

import React, { useRef } from "react";
import Button from "@/components/Button";

import { MousePointer2, Download, ArrowUp, FileSearch, Lock, AlertTriangle, Package, Zap, Shield,
  LayoutDashboard, BookOpen, Settings, Bell, HelpCircle, LogOut, Users, BarChart2, FileText, Star,
  Search, Mail, User, Phone, Code2, Rocket,
  ArrowRight, MoreHorizontal, Layers, TrendingUp, Globe, ShoppingCart, Cpu,
  Pencil, Trash2, Eye, Copy, ExternalLink,
  Plus, Check, RefreshCw, Save,
  Home as HomeIcon, Tag as TagIcon, ShoppingBag } from "lucide-react";
import CommandMenu from "@/components/CommandMenu";
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
import Carousel from "@/components/Carousel";
import Stepper from "@/components/Stepper";
import Timeline from "@/components/Timeline";
import TextRotate, { type TextRotateItem, type TextRotateHandle } from "@/components/TextRotate";
import ChatMessage, { type ChatMessageProps } from "@/components/ChatMessage";
import ChatComposer from "@/components/ChatComposer";
import ChatConversationItem from "@/components/ChatConversationItem";
import ChatWindow, { type ChatConversation } from "@/components/ChatWindow";
import Breadcrumb from "@/components/Breadcrumb";
import type { DataTableColumn, DataTableAction, FilterField, DataTableTab } from "@/components/DataTable";
import { useAsyncButton } from "../hooks/useAsyncButton";
import toast, { ToastPreview } from "@/components/Toast";
import { useRouter } from "next/navigation";
import StatusPage from "@/components/StatusPage";
import CodeBlock from "@/components/CodeBlock";
import Sidebar from "@/components/Sidebar";
import TreeView from "@/components/TreeView";

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

const CHAT_MESSAGES_ANA: ChatMessageProps[] = [
  { senderName: "Ana Souza", content: "Oi! A reunião de amanhã ainda está de pé?", timestamp: "09:40", showAvatar: true },
  { content: "Sim! Às 10h na sala 2.", mine: true, timestamp: "09:41", status: "read", showAvatar: false },
  { senderName: "Ana Souza", content: "Perfeito. Você pode enviar a pauta antes?", timestamp: "09:42", showAvatar: false },
  { content: "Claro, mando em breve 👍", mine: true, timestamp: "09:43", status: "delivered", showAvatar: false },
  { senderName: "Ana Souza", type: "typing", showAvatar: true },
];

const CHAT_MESSAGES_BRUNO: ChatMessageProps[] = [
  { senderName: "Bruno Lima", content: "Deploy feito com sucesso ✅", timestamp: "18:28", showAvatar: true },
  { content: "Ótimo trabalho! Ambiente de produção?", mine: true, timestamp: "18:29", status: "read", showAvatar: false },
  {
    type: "attachment",
    senderName: "Bruno Lima",
    attachment: { name: "deploy-log.txt", size: "4.2 KB" },
    timestamp: "18:30",
    showAvatar: false,
  },
  { content: "Log do deploy, tudo certo.", mine: false, senderName: "Bruno Lima", timestamp: "18:30", showAvatar: false },
];

const CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: "ana",
    name: "Ana Souza",
    online: true,
    unread: 2,
    lastMessage: "Você pode enviar a pauta antes?",
    lastMessageTime: "09:42",
    messages: CHAT_MESSAGES_ANA.filter((m) => m.type !== "typing"),
  },
  {
    id: "bruno",
    name: "Bruno Lima",
    online: false,
    unread: 0,
    lastMessage: "Log do deploy, tudo certo.",
    lastMessageTime: "ontem",
    messages: CHAT_MESSAGES_BRUNO,
  },
  {
    id: "equipe",
    name: "Equipe Produto",
    online: false,
    unread: 5,
    lastMessage: "Carlos: alguém viu o Figma novo?",
    lastMessageTime: "08:15",
    messages: [
      { senderName: "Carlos Mendes", content: "Alguém viu o link do novo Figma?", timestamp: "08:15", showAvatar: true },
      { senderName: "Carlos Mendes", content: "Mando aqui depois.", timestamp: "08:16", showAvatar: false },
    ],
  },
  {
    id: "dani",
    name: "Daniela Costa",
    online: true,
    unread: 0,
    lastMessage: "Pode revisar meu PR?",
    lastMessageTime: "seg",
    messages: [
      { senderName: "Daniela Costa", content: "Oi! Pode revisar meu PR quando tiver um tempinho?", timestamp: "10:00", showAvatar: true },
      { content: "Claro! Deixa eu terminar esse ticket.", mine: true, timestamp: "10:05", status: "read", showAvatar: false },
    ],
  },
];

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

  // Toast demo handlers
  const notifySuccess  = () => toast.success('Salvo com sucesso!');
  const notifyError    = () => toast.error('Algo deu errado.');
  const notifyBasic    = () => toast('Muito bom!', { icon: '👏' });
  const notifyWarning  = () => toast.warning('Atenção: essa ação não pode ser desfeita.');
  const notifyInfo     = () => toast.info('Nova atualização disponível.', { action: { label: 'Atualizar', onClick: () => {} } });
  const notifyAction   = () => toast.success('Arquivo excluído.', { action: { label: 'Desfazer', onClick: () => toast.success('Ação desfeita!') } });
  const notifyLoading  = () => { const id = toast.loading('Carregando...'); setTimeout(() => toast.success('Pronto!', { id }), 2000); };

  const notifyPromise = () => {
    const p = new Promise<string>((resolve, reject) => {
      setTimeout(() => (Math.random() > 0.3 ? resolve('ok') : reject(new Error('fail'))), 1500);
    });
    toast.promise(p, {
      loading: 'Salvando...',
      success: <b>Configurações salvas!</b>,
      error:   <b>Falha ao salvar.</b>,
    });
  };

  const notifyBig    = () => toast(
    'Esta notificação tem um texto bem longo para demonstrar a quebra de linha e o comportamento do layout com mensagens extensas.',
    { duration: 6000 },
  );
  const notifyStyled = () => toast('Olá! 👋', { icon: '🌙', duration: 5000 });

  return (
    <main className="flex-1 min-w-0 bg-zinc-50 dark:bg-zinc-950">

        {/* Hero */}
        <section id="overview" className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-10 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-4">
              Lopes UI
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight mb-4">
              Componentes prontos para produção
            </h1>
            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-lg">
              Biblioteca React + Next.js com Tailwind CSS. Acessível, tipada e customizável.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#install"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
              >
                Começar agora
              </a>
              <a
                href="#button"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Ver componentes
              </a>
            </div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14">

          {/* Install */}
          <section id="install">
            <SectionHeader label="Instalação" title="Comece em segundos" description="Adicione os pacotes necessários e importe os componentes diretamente." />
            <div className="mt-8 space-y-4">
              <CodeBlock filename="terminal" language="bash" code={`npm install lucide-react tailwind-merge clsx`} />
              <CodeBlock filename="Button.tsx" language="tsx" code={`import Button from "@/components/Button";\n\nexport default function MyPage() {\n  return <Button variant="primary">Salvar</Button>;\n}`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

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

          <section id="alerts" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Alert</h2>
              <p className="mt-1 text-zinc-500">Notificações inline ou modais com variantes semânticas, ações e dismiss.</p>
            </div>

            {/* Variants */}
            <div id="alert-variants" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Variantes inline</h3>
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
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Com ações</h3>
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
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Modo Dialog</h3>
              <div className="flex flex-wrap gap-3 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
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

            <div id="alert-props" className="space-y-4">
              <PropsTable rows={[
                ["title",       "string",                                          "—",      "Título do alerta"],
                ["description", "string | ReactNode",                              "—",      "Texto descritivo"],
                ["variant",     "'info'|'success'|'warning'|'danger'|'neutral'",   "'info'", "Estilo semântico"],
                ["icon",        "LucideIcon | null",                               "—",      "Override do ícone padrão (null remove o ícone)"],
                ["dismissible", "boolean",                                          "false",  "Exibe botão × para fechar"],
                ["onDismiss",   "() => void",                                       "—",      "Callback ao fechar"],
                ["actions",     "AlertAction[]",                                    "—",      "Botões de ação inline"],
                ["dialog",      "boolean",                                          "false",  "Renderiza como modal em vez de banner"],
                ["open",        "boolean",                                          "—",      "Controla visibilidade (necessário com dialog)"],
                ["onClose",     "() => void",                                       "—",      "Callback para fechar o dialog"],
                ["className",   "string",                                           "—",      "Classes adicionais"],
                ["componentId", "string",                                           "—",      "Identificador de controle de acesso"],
              ]} />
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

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="avatars" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Avatar</h2>
              <p className="mt-1 text-zinc-500">Exibe imagem, iniciais ou ícone de fallback, com indicador de status e grupo empilhado.</p>
            </div>

            {/* Sizes + Status */}
            <div id="avatar-sizes" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Tamanhos &amp; Status</h3>
              <div className="flex flex-wrap items-end gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                {(["xs","sm","md","lg","xl","2xl"] as const).map((s) => (
                  <Avatar key={s} name="Cristiano Lopes" size={s} status="online" />
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Avatar name="Online" size="lg" status="online" />
                <Avatar name="Away" size="lg" status="away" />
                <Avatar name="Busy" size="lg" status="busy" />
                <Avatar name="Offline" size="lg" status="offline" />
              </div>
            </div>

            {/* Shape */}
            <div id="avatar-shapes" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Formas</h3>
              <div className="flex flex-wrap items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Avatar name="Circle" size="xl" shape="circle" />
                <Avatar name="Square" size="xl" shape="square" />
                <Avatar src="https://i.pravatar.cc/150?img=3" alt="Foto" size="xl" shape="circle" status="online" />
                <Avatar src="https://i.pravatar.cc/150?img=5" alt="Foto" size="xl" shape="square" />
              </div>
            </div>

            {/* AvatarGroup */}
            <div id="avatar-group" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">AvatarGroup</h3>
              <div className="flex flex-wrap items-center gap-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
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
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Fallback: iniciais &amp; ícone</h3>
              <div className="flex flex-wrap items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Avatar initials="CL" size="lg" />
                <Avatar name="Rodrigo Almeida" size="lg" />
                <Avatar name="Beatriz" size="lg" />
                <Avatar size="lg" />
              </div>
            </div>

            <div id="avatar-props" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-700">Avatar</h4>
                <PropsTable rows={[
                  ["src",         "string",                              "—",        "URL da imagem"],
                  ["alt",         "string",                              "—",        "Texto alternativo da imagem"],
                  ["initials",    "string",                              "—",        "1-2 chars exibidos quando sem imagem"],
                  ["name",        "string",                              "—",        "Gera iniciais e cor automaticamente"],
                  ["size",        "'xs'|'sm'|'md'|'lg'|'xl'|'2xl'",     "'md'",     "Dimensão do avatar"],
                  ["shape",       "'circle'|'square'",                   "'circle'", "Formato do avatar"],
                  ["status",      "'online'|'away'|'busy'|'offline'",    "—",        "Indicador de status com bolinha colorida"],
                  ["colorClass",  "string",                              "—",        "Override da cor de fundo gerada"],
                  ["className",   "string",                              "—",        "Classes adicionais"],
                  ["componentId", "string",                              "—",        "Identificador de controle de acesso"],
                  ["onClick",     "() => void",                          "—",        "Callback de clique"],
                ]} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-700">AvatarGroup</h4>
                <PropsTable rows={[
                  ["avatars",    "AvatarProps[]",  "—",     "Lista de avatares"],
                  ["size",       "AvatarSize",      "'md'",  "Tamanho de todos os avatares"],
                  ["max",        "number",          "4",     "Máximo de avatares visíveis (os restantes exibem um contador)"],
                  ["className",  "string",          "—",     "Classes adicionais"],
                ]} />
              </div>
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

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="badges" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Badge</h2>
              <p className="mt-1 text-zinc-500">Etiquetas compactas para status, categorias e contadores.</p>
            </div>

            {/* Variants soft */}
            <div id="badge-variants" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Variantes (soft)</h3>
              <div className="flex flex-wrap gap-2 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                {(["default","primary","success","warning","danger","info","violet","pink","orange","teal"] as const).map((v) => (
                  <Badge key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} variant={v} />
                ))}
              </div>
            </div>

            {/* Solid */}
            <div id="badge-solid" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Solid</h3>
              <div className="flex flex-wrap gap-2 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                {(["default","primary","success","warning","danger","info","violet","pink","orange","teal"] as const).map((v) => (
                  <Badge key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} variant={v} solid />
                ))}
              </div>
            </div>

            {/* Features: dot, icon, remove, sizes, square */}
            <div id="badge-features" className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Funcionalidades</h3>
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

            <div id="badge-props" className="space-y-4">
              <PropsTable rows={[
                ["label",       "string",        "—",         "Texto exibido"],
                ["variant",     "BadgeVariant",  "'default'", "Esquema de cor"],
                ["size",        "'xs'|'sm'|'md'|'lg'", "'md'", "Tamanho"],
                ["solid",       "boolean",       "false",     "Fundo sólido em vez de suave"],
                ["square",      "boolean",       "false",     "Forma retangular em vez de pílula"],
                ["dot",         "boolean",       "false",     "Ponto colorido antes do texto"],
                ["icon",        "LucideIcon",    "—",         "Ícone antes do texto"],
                ["onRemove",    "() => void",    "—",         "Exibe × e chama ao clicar (badge removível)"],
                ["className",   "string",        "—",         "Classes adicionais"],
                ["componentId", "string",        "—",         "Identificador de controle de acesso"],
              ]} />
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

            <DemoCard id="button-semantic" title="Cores semânticas">
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="success" leftIcon={<Check size={15}/>}>Confirmar</Button>
                <Button variant="success-outline" leftIcon={<Check size={15}/>}>Confirmar</Button>
                <Button variant="warning" leftIcon={<AlertTriangle size={15}/>}>Atenção</Button>
                <Button variant="warning-outline" leftIcon={<AlertTriangle size={15}/>}>Atenção</Button>
                <Button variant="info" leftIcon={<Bell size={15}/>}>Informação</Button>
                <Button variant="info-outline" leftIcon={<Bell size={15}/>}>Informação</Button>
                <Button variant="destructive" leftIcon={<Trash2 size={15}/>}>Excluir</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-pill" title="Pill (arredondado)">
              <div className="flex flex-wrap gap-3 items-center">
                <Button pill variant="primary">Primary</Button>
                <Button pill variant="success">Sucesso</Button>
                <Button pill variant="warning">Aviso</Button>
                <Button pill variant="outline">Outline</Button>
                <Button pill variant="ghost">Ghost</Button>
                <Button pill variant="destructive">Excluir</Button>
                <Button pill variant="primary" leftIcon={<Plus size={15}/>}>Novo item</Button>
                <Button pill variant="success-outline" leftIcon={<Check size={15}/>} size="sm">Aprovado</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-square" title="Só ícone (square)">
              <div className="flex flex-wrap gap-3 items-center">
                <Button square variant="primary" aria-label="Adicionar"><Plus size={16}/></Button>
                <Button square variant="default" aria-label="Configurações"><Settings size={16}/></Button>
                <Button square variant="outline" aria-label="Buscar"><Search size={16}/></Button>
                <Button square variant="secondary" aria-label="Salvar"><Save size={16}/></Button>
                <Button square variant="ghost" aria-label="Atualizar"><RefreshCw size={16}/></Button>
                <Button square variant="success" aria-label="Confirmar"><Check size={16}/></Button>
                <Button square variant="warning" aria-label="Atenção"><AlertTriangle size={16}/></Button>
                <Button square variant="destructive" aria-label="Excluir"><Trash2 size={16}/></Button>
                <Button square pill variant="primary" aria-label="Adicionar"><Plus size={16}/></Button>
                <Button square pill variant="ghost" aria-label="Editar"><Pencil size={16}/></Button>
              </div>
            </DemoCard>

            <DemoCard id="button-link" title="Link">
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="link">Ver mais</Button>
                <Button variant="link" rightIcon={<ArrowRight size={14}/>}>Saiba mais</Button>
                <Button variant="link" rightIcon={<ExternalLink size={14}/>}>Abrir em nova aba</Button>
                <Button variant="link" onClick={() => toast("Cancelado")}>Cancelar</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-disabled" title="Estado desabilitado">
              <div className="flex flex-wrap gap-3 items-center">
                <Button disabled>Default</Button>
                <Button disabled variant="primary">Primary</Button>
                <Button disabled variant="success">Sucesso</Button>
                <Button disabled variant="warning">Aviso</Button>
                <Button disabled variant="outline">Outline</Button>
                <Button disabled variant="ghost">Ghost</Button>
                <Button disabled variant="destructive">Excluir</Button>
                <Button disabled variant="link">Link</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-fullwidth" title="Largura total">
              <div className="space-y-2 max-w-sm">
                <Button variant="primary" className="w-full" leftIcon={<Save size={15}/>}>Salvar alterações</Button>
                <Button variant="outline" className="w-full">Cancelar</Button>
                <Button variant="success" className="w-full" leftIcon={<Check size={15}/>}>Confirmar pedido</Button>
              </div>
            </DemoCard>

            <div id="button-props" className="mt-6">
              <PropsTable rows={[
                ["variant",    "string",   "default", "solid | outline | ghost | primary | secondary | destructive | success | success-outline | warning | warning-outline | info | info-outline | link"],
                ["size",       "string",   "md",      "sm | md | lg"],
                ["pill",       "boolean",  "false",   "Forma pill — rounded-full"],
                ["square",     "boolean",  "false",   "Modo só-ícone — padding igual, sem min-w"],
                ["leftIcon",   "ReactNode","—",       "Ícone à esquerda do label"],
                ["rightIcon",  "ReactNode","—",       "Ícone à direita do label"],
                ["loading",    "boolean",  "false",   "Exibe spinner e desabilita o botão"],
                ["disabled",   "boolean",  "false",   "Desabilita o botão"],
                ["componentId","string",   "—",       "ID para inventário de componentes"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Button.tsx" language="tsx" code={`<Button\n  variant="primary"\n  size="lg"\n  leftIcon={<Download size={16} />}\n  loading={isSaving}\n  onClick={handleSave}\n>\n  Salvar alterações\n</Button>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="action-button">
            <SectionHeader
              label="Button"
              title="Tooltip & Confirmação"
              description="Button suporta tooltip de hover e diálogo de confirmação nativamente via props tooltip e confirm. Combine com square para ícones compactos."
            />

            <DemoCard id="action-examples" title="Exemplos">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex flex-col items-center gap-1">
                  <Button square leftIcon={<Download />} tooltip="Download" aria-label="Download file"
                    confirm={{ title: 'Iniciar download?', description: 'Deseja iniciar o download do arquivo?' }}
                    onClick={() => toast.success('Download iniciado')} componentId="demo.action.download"
                  />
                  <span className="text-xs text-zinc-400">Com confirm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button square leftIcon={<ArrowUp />} tooltip="Topo" aria-label="Back to top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="ghost"
                  />
                  <span className="text-xs text-zinc-400">Ghost</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button square leftIcon={<AlertTriangle />} tooltip="Atenção" aria-label="Warning"
                    onClick={() => toast.error('Ação perigosa!')} variant="destructive"
                  />
                  <span className="text-xs text-zinc-400">Destructive</span>
                </div>
              </div>
            </DemoCard>

            <div id="action-props" className="mt-6">
              <PropsTable rows={[
                ["tooltip",     "string",          "—",     "Texto do tooltip ao hover"],
                ["confirm",     "boolean | object", "—",     "Exibe diálogo de confirmação antes do onClick"],
                ["square",      "boolean",          "false", "Padding igual em todos os lados (ideal para ícones)"],
                ["aria-label",  "string",          "—",     "Label acessível para screen readers"],
                ["componentId", "string",          "—",     "ID para inventário de componentes"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Button.tsx" language="tsx" code={`<Button\n  square\n  leftIcon={<Trash2 />}\n  tooltip="Excluir registro"\n  aria-label="Excluir"\n  variant="destructive"\n  confirm={{\n    title: "Excluir registro?",\n    description: "Esta ação não pode ser desfeita.",\n    confirmLabel: "Excluir",\n  }}\n  onClick={handleDelete}\n/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="cards" className="space-y-10 pb-10 sm:pb-14">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Card</h2>
              <p className="text-zinc-500 text-sm">Contêiner versátil com suporte a variantes, sombras, backgrounds, destaque colorido e slots compostos.</p>
            </div>

            {/* Variants */}
            <div id="card-variants">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Variantes</h3>
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Sombras</h3>
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Cores de Fundo</h3>
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Barra de Destaque (accent)</h3>
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Cards com Ícone e Ação</h3>
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
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">R$ 48.230</p>
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
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">2.847</p>
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
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">R$ 7.410</p>
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Interativos (hoverable)</h3>
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Border Radius</h3>
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Props</h3>
              <PropsTable rows={[
                ["variant",     "'default'|'outlined'|'elevated'|'filled'|'ghost'",                                      "'default'", "Estilo visual do card"],
                ["color",       "'default'|'primary'|'success'|'warning'|'danger'|'info'|'violet'|'pink'|'teal'",        "'default'", "Esquema de cor (afeta filled, accent e ícones)"],
                ["shadow",      "'none'|'sm'|'md'|'lg'|'xl'",                                                            "'none'",    "Sombra projetada"],
                ["radius",      "'none'|'sm'|'md'|'lg'|'xl'|'2xl'",                                                     "'xl'",      "Arredondamento das bordas"],
                ["accent",      "boolean",                                                                                "false",     "Exibe barra colorida no topo"],
                ["hoverable",   "boolean",                                                                                "false",     "Efeito de elevação ao passar o mouse"],
                ["onClick",     "() => void",                                                                             "—",         "Torna o card clicável (renderiza como button)"],
                ["className",   "string",                                                                                  "—",         "Classes adicionais via twMerge"],
                ["componentId", "string",                                                                                  "—",         "Identificador para controle de acesso"],
              ]} />

              <div className="mt-6">
                <h4 className="text-sm font-medium text-zinc-700 mb-2">Sub-componentes</h4>
                <PropsTable rows={[
                  ["CardHeader", "title, description, icon, iconColor, action", "Cabeçalho com ícone opcional e slot de ação"],
                  ["CardBody",   "className",                                   "Área de conteúdo principal com padding padrão"],
                  ["CardFooter", "align, divider",                              "Rodapé com suporte a alinhamento e separador"],
                  ["CardImage",  "src, alt, height",                            "Imagem de capa com height configurável"],
                ]} />
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

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="carousel" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Carousel</h2>
              <p className="text-zinc-500 text-sm">Passador de slides com suporte a múltiplos itens visíveis, arrastar, teclado, auto-play e indicadores.</p>
            </div>

            {/* Basic */}
            <div id="carousel-basic">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Básico</h3>
              <Carousel ariaLabel="Carousel básico">
                {[
                  { bg: "bg-indigo-100", label: "Slide 1", sub: "Primeiro slide" },
                  { bg: "bg-emerald-100", label: "Slide 2", sub: "Segundo slide" },
                  { bg: "bg-amber-100", label: "Slide 3", sub: "Terceiro slide" },
                  { bg: "bg-sky-100", label: "Slide 4", sub: "Quarto slide" },
                  { bg: "bg-rose-100", label: "Slide 5", sub: "Quinto slide" },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-xl h-48 flex flex-col items-center justify-center gap-1`}>
                    <span className="text-2xl font-bold text-zinc-700">{s.label}</span>
                    <span className="text-sm text-zinc-500">{s.sub}</span>
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Multi-slide */}
            <div id="carousel-multi">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Multi-slide</h3>
              <Carousel slidesPerView={3} gap={12} ariaLabel="Carousel multi-slide">
                {["Vermelho", "Azul", "Verde", "Roxo", "Laranja", "Rosa"].map((label, i) => (
                  <div key={i} className="bg-zinc-100 rounded-xl h-36 flex items-center justify-center text-zinc-600 font-semibold text-sm">
                    {label}
                  </div>
                ))}
              </Carousel>
            </div>

            {/* AutoPlay */}
            <div id="carousel-autoplay">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">AutoPlay + Loop</h3>
              <Carousel autoPlay={2500} loop counter ariaLabel="Carousel auto-play">
                {[
                  "from-indigo-400 to-indigo-600",
                  "from-emerald-400 to-emerald-600",
                  "from-amber-400 to-amber-600",
                  "from-rose-400 to-rose-600",
                ].map((grad, i) => (
                  <div key={i} className={`bg-gradient-to-br ${grad} rounded-xl h-44 flex items-center justify-center text-white font-bold text-lg`}>
                    Slide {i + 1}
                  </div>
                ))}
              </Carousel>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="chat" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Chat"
              title="Mensagens"
              description="Componentes de chat corporativo: bolhas de mensagem, composer, lista de conversas e janela flutuante minimizável. Construídos com Avatar e Button existentes."
            />

            {/* Bubbles — text */}
            <DemoCard id="chat-bubbles" title="Bolhas de texto">
              <div className="space-y-2 max-w-sm">
                {CHAT_MESSAGES_ANA.map((msg, i) => (
                  <ChatMessage key={i} {...msg} />
                ))}
              </div>
            </DemoCard>

            {/* Status de entrega */}
            <DemoCard id="chat-status" title="Status de entrega (mine)">
              <div className="space-y-2 max-w-sm">
                <ChatMessage content="Enviando…" mine timestamp="10:00" status="sending" showAvatar={false} />
                <ChatMessage content="Enviado" mine timestamp="10:00" status="sent" showAvatar={false} />
                <ChatMessage content="Entregue" mine timestamp="10:01" status="delivered" showAvatar={false} />
                <ChatMessage content="Lido ✓✓ azul" mine timestamp="10:01" status="read" showAvatar={false} />
                <ChatMessage content="Falha no envio" mine timestamp="10:02" status="failed" showAvatar={false} />
              </div>
            </DemoCard>

            {/* Tipos de mensagem */}
            <DemoCard id="chat-types" title="Tipos de mensagem">
              <div className="space-y-3 max-w-sm">
                <p className="text-xs font-medium text-zinc-400 uppercase">Arquivo anexado</p>
                <ChatMessage
                  type="attachment"
                  senderName="Bruno Lima"
                  attachment={{ name: "relatorio-q4-2025.pdf", size: "3.8 MB" }}
                  content="Segue o relatório para revisão."
                  timestamp="14:10"
                  showAvatar={true}
                />
                <ChatMessage
                  type="attachment"
                  mine
                  attachment={{ name: "proposta-comercial.docx", size: "1.2 MB" }}
                  timestamp="14:12"
                  status="read"
                  showAvatar={false}
                />
                <p className="text-xs font-medium text-zinc-400 uppercase mt-4">Áudio</p>
                <ChatMessage
                  type="audio"
                  senderName="Ana Souza"
                  audioDuration="0:42"
                  timestamp="15:23"
                  showAvatar={true}
                />
                <ChatMessage
                  type="audio"
                  mine
                  audioDuration="1:08"
                  timestamp="15:25"
                  status="delivered"
                  showAvatar={false}
                />
                <p className="text-xs font-medium text-zinc-400 uppercase mt-4">Imagem</p>
                <ChatMessage
                  type="image"
                  senderName="Ana Souza"
                  imageUrl="https://placehold.co/220x160/e0e7ff/4f46e5?text=Imagem"
                  imageAlt="Imagem compartilhada"
                  content="Veja esse screenshot!"
                  timestamp="09:55"
                  showAvatar={true}
                />
                <ChatMessage
                  type="image"
                  mine
                  imageUrl="https://placehold.co/220x160/f0fdf4/166534?text=Captura"
                  imageAlt="Minha captura"
                  timestamp="09:56"
                  status="read"
                  showAvatar={false}
                />
              </div>
            </DemoCard>

            {/* Reply + Reactions */}
            <DemoCard id="chat-reply-reactions" title="Reply e reações">
              <div className="space-y-2 max-w-sm">
                <ChatMessage
                  senderName="Ana Souza"
                  content="Reunião confirmada para segunda às 10h."
                  timestamp="08:30"
                  showAvatar={true}
                />
                <ChatMessage
                  mine
                  replyTo={{ senderName: "Ana Souza", content: "Reunião confirmada para segunda às 10h." }}
                  content="Perfeito, já bloqueei na agenda!"
                  timestamp="08:32"
                  status="read"
                  showAvatar={false}
                  reactions={[
                    { emoji: "👍", count: 2, reacted: true },
                    { emoji: "🎉", count: 1, reacted: false },
                  ]}
                />
                <ChatMessage
                  senderName="Ana Souza"
                  replyTo={{ senderName: "Você", content: "Perfeito, já bloqueei na agenda!" }}
                  content="Ótimo! Vejo vocês lá."
                  timestamp="08:33"
                  showAvatar={false}
                  reactions={[{ emoji: "❤️", count: 3, reacted: false }]}
                />
              </div>
            </DemoCard>

            {/* Typing indicator */}
            <DemoCard id="chat-typing" title="Indicador de digitação">
              <div className="space-y-2 max-w-sm">
                <ChatMessage content="Tudo bem?" mine timestamp="11:00" status="read" showAvatar={false} />
                <ChatMessage senderName="Bruno Lima" type="typing" showAvatar={true} />
              </div>
            </DemoCard>

            {/* Composer */}
            <DemoCard id="chat-composer" title="Composer — toolbar (padrão)">
              <div className="max-w-sm rounded-xl border border-zinc-200 overflow-hidden">
                <ChatComposer
                  onSend={() => {}}
                  onAttach={() => toast("Anexar arquivo")}
                  onEmoji={() => toast("Emoji picker")}
                  onVoice={() => toast("Gravar áudio")}
                />
              </div>
            </DemoCard>

            <DemoCard id="chat-composer-minimal" title="Composer — minimal">
              <div className="max-w-sm rounded-xl border border-zinc-200 overflow-hidden">
                <ChatComposer
                  variant="minimal"
                  placeholder="Mensagem rápida…"
                  onSend={() => {}}
                  onVoice={() => toast("Gravar áudio")}
                />
              </div>
            </DemoCard>

            <DemoCard id="chat-composer-reply" title="Composer com reply">
              <div className="max-w-sm rounded-xl border border-zinc-200 overflow-hidden">
                <ChatComposer
                  onSend={() => {}}
                  onAttach={() => {}}
                  onEmoji={() => {}}
                  onVoice={() => {}}
                  replyTo={{
                    senderName: "Ana Souza",
                    content: "Reunião confirmada para segunda às 10h.",
                    onCancel: () => {},
                  }}
                />
              </div>
            </DemoCard>

            {/* Conversation list */}
            <DemoCard id="chat-conversation-list" title="Lista de conversas">
              <div className="max-w-xs space-y-1">
                <ChatConversationItem
                  name="Ana Souza"
                  lastMessage="Você pode enviar a pauta antes?"
                  timestamp="09:42"
                  unread={2}
                  online
                  active
                />
                <ChatConversationItem
                  name="Bruno Lima"
                  lastMessage="Log do deploy, tudo certo."
                  timestamp="ontem"
                  pinned
                />
                <ChatConversationItem
                  name="Equipe Produto"
                  lastMessage="Carlos: alguém viu o Figma novo?"
                  timestamp="08:15"
                  unread={5}
                />
                <ChatConversationItem
                  name="Daniela Costa"
                  lastMessage="Pode revisar meu PR?"
                  timestamp="seg"
                  online
                  muted
                />
              </div>
            </DemoCard>

            {/* ChatWindow */}
            <DemoCard id="chat-window" title="Chat Window — flutuante e minimizável">
              <p className="text-xs text-zinc-400 mb-4">
                Clique no botão azul para abrir. Navegue entre conversas, envie mensagens e minimize a janela.
              </p>
              <div className="relative bg-zinc-100 rounded-xl p-6 flex items-end justify-end min-h-[520px] overflow-hidden">
                {/* Faux content behind the window */}
                <div className="absolute inset-0 p-6 space-y-3 pointer-events-none opacity-30">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-3 bg-zinc-300 rounded-full" style={{ width: `${60 + (i % 3) * 20}%` }} />
                  ))}
                </div>
                <ChatWindow
                  title="Mensagens"
                  conversations={CHAT_CONVERSATIONS}
                  defaultOpen
                />
              </div>
            </DemoCard>

            {/* Props */}
            <div id="chat-props" className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatMessage</h3>
                <PropsTable rows={[
                  ["content",       "string",                                              "—",           "Texto da mensagem"],
                  ["senderName",    "string",                                              "—",           "Nome do remetente"],
                  ["avatarSrc",     "string",                                              "—",           "URL do avatar"],
                  ["mine",          "boolean",                                             "false",        "true = mensagem do usuário atual (direita, indigo)"],
                  ["type",          "'text'|'image'|'audio'|'attachment'|'typing'",        "'text'",       "Tipo de conteúdo"],
                  ["status",        "'sending'|'sent'|'delivered'|'read'|'failed'",        "—",           "Status de entrega (visível apenas em mine)"],
                  ["timestamp",     "string",                                              "—",           "Horário exibido na bolha"],
                  ["replyTo",       "{ senderName, content }",                             "—",           "Mensagem citada (reply)"],
                  ["reactions",     "{ emoji, count, reacted }[]",                         "—",           "Reações com emoji"],
                  ["attachment",    "{ name, size }",                                       "—",           "Metadados do arquivo (type='attachment')"],
                  ["imageUrl",      "string",                                              "—",           "URL da imagem (type='image')"],
                  ["audioDuration", "string",                                              "—",           "Duração do áudio (type='audio')"],
                  ["showAvatar",    "boolean",                                             "true",         "Exibe avatar e nome (false = mensagens agrupadas)"],
                  ["onReact",       "(emoji: string) => void",                             "—",           "Callback ao clicar em reação"],
                ]} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatComposer</h3>
                <PropsTable rows={[
                  ["onSend",      "(value: string) => void", "—",          "Callback ao enviar mensagem"],
                  ["onAttach",    "() => void",               "—",          "Callback ao clicar em anexar"],
                  ["onEmoji",     "() => void",               "—",          "Callback ao clicar em emoji"],
                  ["onVoice",     "() => void",               "—",          "Callback ao gravar áudio (exibido quando sem texto)"],
                  ["replyTo",     "{ senderName, content, onCancel }","—",  "Preview de reply com botão de cancelar"],
                  ["variant",     "'toolbar'|'minimal'",      "'toolbar'",  "toolbar = botões attach+emoji visíveis"],
                  ["placeholder", "string",                   "—",          "Texto placeholder do textarea"],
                  ["disabled",    "boolean",                  "false",      "Desabilita o composer"],
                ]} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatConversationItem</h3>
                <PropsTable rows={[
                  ["name",        "string",      "—",     "Nome do contato ou grupo"],
                  ["lastMessage", "string",      "—",     "Prévia da última mensagem"],
                  ["timestamp",   "string",      "—",     "Horário / data da última mensagem"],
                  ["unread",      "number",      "0",     "Contagem de mensagens não lidas"],
                  ["online",      "boolean",     "—",     "Exibe dot de status online"],
                  ["active",      "boolean",     "false", "Estado de seleção ativo"],
                  ["muted",       "boolean",     "false", "Ícone de conversa silenciada"],
                  ["pinned",      "boolean",     "false", "Ícone de conversa fixada"],
                  ["onClick",     "() => void",  "—",     "Callback ao clicar"],
                ]} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatWindow</h3>
                <PropsTable rows={[
                  ["conversations", "ChatConversation[]", "—",     "Lista de conversas com mensagens"],
                  ["title",         "string",              "'Mensagens'", "Título no header da janela"],
                  ["defaultOpen",   "boolean",             "false",  "Inicia na lista de conversas em vez do botão flutuante"],
                  ["onSend",        "(convId, msg) => void","—",    "Callback ao enviar mensagem"],
                ]} />
              </div>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── CodeBlock ──────────────────────────────────────────────────── */}
          <section id="codeblock" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">CodeBlock</h2>
              <p className="mt-1 text-zinc-500">Bloco de código com syntax highlighting (Shiki / Dracula), nome de arquivo, números de linha, recolher e abas.</p>
            </div>

            {/* Single file */}
            <div id="codeblock-basic" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Básico</h3>
              <CodeBlock
                filename="Button.tsx"
                language="tsx"
                code={`import Button from "@/components/Button";\n\nexport default function Demo() {\n  return (\n    <Button variant="primary" size="lg">\n      Salvar alterações\n    </Button>\n  );\n}`}
              />
            </div>

            {/* Terminal */}
            <div id="codeblock-terminal" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Terminal</h3>
              <CodeBlock
                filename="terminal"
                language="bash"
                code={`npm install shiki lucide-react tailwind-merge clsx`}
              />
            </div>

            {/* Line numbers */}
            <div id="codeblock-linenumbers" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Números de linha</h3>
              <CodeBlock
                filename="useAsyncButton.ts"
                language="ts"
                lineNumbers
                code={`import { useState, useCallback } from "react";\n\ntype AsyncButtonState = {\n  loading: boolean;\n  error: string | null;\n};\n\nexport function useAsyncButton(fn: () => Promise<void>) {\n  const [state, setState] = useState<AsyncButtonState>({\n    loading: false,\n    error: null,\n  });\n\n  const trigger = useCallback(async () => {\n    setState({ loading: true, error: null });\n    try {\n      await fn();\n    } catch (err) {\n      setState({ loading: false, error: String(err) });\n      return;\n    }\n    setState({ loading: false, error: null });\n  }, [fn]);\n\n  return { ...state, trigger };\n}`}
              />
            </div>

            {/* Show more */}
            <div id="codeblock-showmore" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Recolher (maxLines)</h3>
              <CodeBlock
                filename="globals.css"
                language="css"
                maxLines={6}
                code={`@import "tailwindcss";\n\n:root {\n  --background: #ffffff;\n  --foreground: #171717;\n}\n\n@theme inline {\n  --color-background: var(--background);\n  --color-foreground: var(--foreground);\n  --font-sans: var(--font-geist-sans);\n  --font-mono: var(--font-geist-mono);\n}\n\nbody {\n  background: var(--background);\n  color: var(--foreground);\n  overflow-x: hidden;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --background: #0a0a0a;\n    --foreground: #ededed;\n  }\n}`}
              />
            </div>

            {/* Tabs */}
            <div id="codeblock-tabs" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Abas (múltiplos arquivos)</h3>
              <CodeBlock
                tabs={[
                  {
                    label: "page.tsx",
                    language: "tsx",
                    code: `import CodeBlock from "@/components/CodeBlock";\n\nexport default function Page() {\n  return (\n    <CodeBlock\n      filename="example.ts"\n      language="ts"\n      lineNumbers\n      code={myCode}\n    />\n  );\n}`,
                  },
                  {
                    label: "terminal",
                    language: "bash",
                    code: `npm install shiki`,
                  },
                  {
                    label: "tsconfig.json",
                    language: "json",
                    code: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "lib": ["dom", "ES2022"],\n    "strict": true,\n    "moduleResolution": "bundler",\n    "paths": { "@/*": ["./*"] }\n  }\n}`,
                  },
                ]}
              />
            </div>

            {/* Props */}
            <div id="codeblock-props" className="space-y-4">
              <PropsTable rows={[
                ["code",        "string",                         "''",      "Código a exibir (modo single-file)"],
                ["language",    "string",                         "'tsx'",   "Linguagem para highlight (tsx, ts, bash, css, json…)"],
                ["filename",    "string",                         "—",       "Nome do arquivo exibido no cabeçalho"],
                ["showCopy",    "boolean",                        "true",    "Mostra botão de copiar"],
                ["lineNumbers", "boolean",                        "false",   "Exibe números de linha"],
                ["maxLines",    "number",                         "—",       "Recolhe o bloco após N linhas com botão 'Ver mais'"],
                ["tabs",        "CodeBlockTab[]",                 "—",       "Modo multi-arquivo com abas"],
                ["className",   "string",                         "—",       "Classes CSS adicionais"],
              ]} />
            </div>
          </section>

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

          <section id="datatable" className="space-y-10 pb-10 sm:pb-14">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">DataTable</h2>
              <p className="text-zinc-500 text-sm">Tabela completa com ordenação, busca global, filtros em dialog, visibilidade de colunas, sumário, paginação e menu de ações por linha.</p>
            </div>

            <DataTableFullDemo />

          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

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

            <div id="checkboxgroup" className="mt-8 border-t border-zinc-100 pt-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Forms</span>
              <h3 className="mt-1 text-xl font-black text-zinc-900 dark:text-zinc-50">Checkbox &amp; Radio</h3>
              <p className="mt-1 text-sm text-zinc-500">Grupos de seleção com variantes padrão, card e button. Suporta múltipla seleção, ícones por opção e grid de colunas configurável.</p>
            </div>

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

            <DemoCard id="checkbox-card" title="CheckboxGroup — variant card">
              <div className="space-y-8">
                <CheckboxGroup
                  label="Recursos do plano"
                  helpText="Selecione os recursos que deseja habilitar"
                  variant="card"
                  columns={2}
                  defaultValue={["ai", "analytics"]}
                  options={[
                    { value: "ai",       label: "IA generativa",      description: "Modelos de linguagem e automação inteligente", icon: <Zap size={20} /> },
                    { value: "analytics",label: "Analytics",           description: "Relatórios e dashboards em tempo real",        icon: <BarChart2 size={20} /> },
                    { value: "security", label: "Segurança avançada",  description: "SSO, MFA e auditoria completa",               icon: <Shield size={20} /> },
                    { value: "collab",   label: "Colaboração",         description: "Workspaces compartilhados e permissões",       icon: <Users size={20} /> },
                  ]}
                />
                <CheckboxGroup
                  label="Plano"
                  helpText="Escolha um plano"
                  variant="card"
                  columns={3}
                  multiple={false}
                  defaultValue={["pro"]}
                  options={[
                    { value: "starter", label: "Starter", description: "Até 3 projetos · 1 membro", icon: <Package size={20} /> },
                    { value: "pro",     label: "Pro",      description: "Ilimitado · 5 membros",    icon: <Rocket size={20} /> },
                    { value: "team",    label: "Team",     description: "Ilimitado · 20 membros",   icon: <Layers size={20} /> },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="checkbox-button" title="CheckboxGroup — variant button (pills)">
              <div className="space-y-6">
                <CheckboxGroup
                  label="Tecnologias"
                  variant="button"
                  defaultValue={["ts", "react"]}
                  options={[
                    { value: "ts",     label: "TypeScript",  icon: <Code2 size={14} /> },
                    { value: "react",  label: "React",       icon: <Cpu size={14} /> },
                    { value: "next",   label: "Next.js",     icon: <Globe size={14} /> },
                    { value: "python", label: "Python",      icon: <FileText size={14} /> },
                    { value: "rust",   label: "Rust",        icon: <Zap size={14} /> },
                    { value: "go",     label: "Go",          icon: <Package size={14} /> },
                  ]}
                />
                <CheckboxGroup
                  label="Disponibilidade"
                  variant="button"
                  multiple={false}
                  defaultValue={["morning"]}
                  options={[
                    { value: "morning",   label: "Manhã" },
                    { value: "afternoon", label: "Tarde" },
                    { value: "evening",   label: "Noite" },
                    { value: "weekend",   label: "Fim de semana" },
                  ]}
                />
                <CheckboxGroup
                  label="Cobrança"
                  variant="button"
                  size="lg"
                  multiple={false}
                  defaultValue={["year"]}
                  options={[
                    { value: "month", label: "Mensal",  icon: <RefreshCw size={16} /> },
                    { value: "year",  label: "Anual",   icon: <Save size={16} /> },
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
                ["variant",        "string",    "default",   "CheckboxGroup: default | card | button"],
                ["columns",        "number",    "2",         "CheckboxGroup (card): 1 | 2 | 3 | 4 colunas"],
                ["options",        "array",     "—",         "AutocompleteField / MultiSelectField / CheckboxGroup"],
                ["options[].icon", "ReactNode", "—",         "CheckboxGroup (card/button): ícone por opção"],
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
                      <div key={name} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 cursor-context-menu hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
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
                <Button square leftIcon={<FileSearch />} tooltip="404" aria-label="Go to 404" onClick={() => router.push('/not-found')} variant="outline" />
                <Button square leftIcon={<Lock />} tooltip="403" aria-label="Go to 403" onClick={() => router.push('/access-denied')} variant="ghost" />
                <Button square leftIcon={<AlertTriangle />} tooltip="500" aria-label="Cause 500" onClick={() => router.push('/cause-error')} variant="destructive" />
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

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="stepper" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Stepper</h2>
              <p className="text-zinc-500 text-sm">Indicador de progresso em etapas, com suporte a orientação, variantes e estados por passo.</p>
            </div>

            {/* Horizontal */}
            <div id="stepper-horizontal">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Horizontal</h3>
              <div className="space-y-8">
                {([0, 1, 2, 3] as const).map((active) => (
                  <div key={active}>
                    <p className="text-xs font-mono text-zinc-400 mb-3">activeStep={active}</p>
                    <Stepper
                      activeStep={active}
                      steps={[
                        { title: "Conta",     description: "Dados de login" },
                        { title: "Endereço",  description: "Onde te encontrar" },
                        { title: "Pagamento", description: "Forma de cobrança" },
                        { title: "Revisão",   description: "Confirmar pedido" },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical */}
            <div id="stepper-vertical">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Vertical</h3>
              <div className="max-w-xs">
                <Stepper
                  orientation="vertical"
                  activeStep={1}
                  steps={[
                    { title: "Pedido confirmado", description: "Recebemos seu pedido", status: "completed" },
                    { title: "Em separação", description: "Preparando o envio", status: "current" },
                    { title: "Enviado", description: "A caminho de você" },
                    { title: "Entregue", description: "Pedido entregue" },
                  ]}
                />
              </div>
            </div>

            {/* Variants */}
            <div id="stepper-variants">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Variantes</h3>
              <div className="space-y-8">
                {(["default", "outlined", "minimal"] as const).map((variant) => (
                  <div key={variant}>
                    <p className="text-xs font-mono text-zinc-400 mb-3">variant=&quot;{variant}&quot;</p>
                    <Stepper
                      variant={variant}
                      activeStep={1}
                      steps={[
                        { title: "Passo 1" },
                        { title: "Passo 2" },
                        { title: "Passo 3" },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

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

          <section id="text-rotate" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">TextRotate</h2>
              <p className="text-zinc-500 text-sm">Anima uma lista de textos com stagger por caractere, palavra ou linha. Suporta presets de animação, stagger configurável e controle imperativo via ref.</p>
            </div>

            {/* Inline in a sentence — per-character stagger */}
            <div id="text-rotate-inline">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Inline numa frase</h3>
              <p className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
                Criamos soluções para{" "}
                <TextRotate
                  inline
                  staggerDuration={0.04}
                  items={[
                    { content: "Designers",    className: "bg-teal-100 text-teal-700 px-2 rounded" },
                    { content: "Devs",         className: "bg-indigo-100 text-indigo-700 px-2 rounded" },
                    { content: "Gestores",     className: "bg-amber-100 text-amber-700 px-2 rounded" },
                    { content: "Startups",     className: "bg-rose-100 text-rose-700 px-2 rounded" },
                  ] satisfies TextRotateItem[]}
                />
              </p>
            </div>

            {/* Large standalone — center-out stagger */}
            <div id="text-rotate-standalone">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Standalone — stagger do centro</h3>
              <TextRotate
                className="text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight"
                align="center"
                duration={2200}
                staggerFrom="center"
                staggerDuration={0.06}
                items={["DESIGN", "DEVELOP", "DEPLOY", "SCALE", "REPEAT"]}
              />
            </div>

            {/* Rise preset — blur */}
            <div id="text-rotate-rise">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Preset <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded font-mono">rise</code> — com blur</h3>
              <TextRotate
                className="text-4xl font-extrabold text-indigo-600 tracking-tight"
                align="center"
                animation="rise"
                duration={2000}
                staggerFrom="last"
                staggerDuration={0.045}
                items={["Velocidade", "Confiança", "Qualidade", "Inovação"]}
              />
            </div>

            {/* Discrete (instant jump) */}
            <div id="text-rotate-discrete">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Preset <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded font-mono">discrete</code> — pop rápido</h3>
              <p className="text-zinc-500 text-sm">
                Nosso stack:{" "}
                <TextRotate
                  inline
                  animation="discrete"
                  duration={1500}
                  splitBy="words"
                  staggerDuration={0}
                  className="font-mono font-bold text-indigo-600"
                  items={["Next.js", "Tailwind CSS", "TypeScript", "React 19"]}
                />
              </p>
            </div>

            {/* Word stagger with emojis */}
            <div id="text-rotate-emojis">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Stagger por palavra com emojis</h3>
              <TextRotate
                className="text-4xl font-black"
                align="center"
                animation="fade"
                splitBy="words"
                staggerDuration={0.08}
                duration={1800}
                items={[
                  "📀 DESIGN",
                  "⌨️ DEVELOP",
                  "🌎 DEPLOY",
                  "🌱 SCALE",
                  "🔧 MAINTAIN",
                  "♻️ REPEAT",
                ]}
              />
            </div>

            {/* Manual control via ref */}
            <div id="text-rotate-manual">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Controle manual via ref</h3>
              {(() => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const rotateRef = useRef<TextRotateHandle>(null);
                return (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <TextRotate
                        ref={rotateRef}
                        auto={false}
                        className="text-3xl font-bold text-zinc-800 dark:text-zinc-200"
                        align="center"
                        staggerFrom="center"
                        staggerDuration={0.05}
                        items={["Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto"]}
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => rotateRef.current?.previous()}
                        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                      >
                        ← Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateRef.current?.reset()}
                        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateRef.current?.next()}
                        className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      >
                        Próximo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="timeline" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Timeline</h2>
              <p className="text-zinc-500 text-sm">Lista cronológica de eventos com suporte a ícones, cores, badges e alinhamentos.</p>
            </div>

            {/* Left */}
            <div id="timeline-left">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Layout esquerdo (padrão)</h3>
              <Timeline
                items={[
                  { title: "Empresa fundada",      description: "Início da jornada com apenas 3 pessoas.",               date: "Jan 2020", color: "primary",  badge: "Marco" },
                  { title: "Primeiro produto",     description: "Lançamos a versão Alpha para clientes selecionados.",    date: "Jun 2020", color: "success" },
                  { title: "Expansão da equipa",   description: "Time cresceu para 25 colaboradores.",                   date: "Mar 2021", color: "info" },
                  { title: "Rodada de investimento", description: "Série A: R$ 8 milhões captados.",                     date: "Out 2021", color: "warning", badge: "Destaque" },
                  { title: "Produto em produção",  description: "Deploy global concluído com sucesso.",                  date: "Fev 2022", color: "success", badge: "Release" },
                ]}
              />
            </div>

            {/* Alternate */}
            <div id="timeline-alternate">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Layout alternado</h3>
              <Timeline
                layout="alternate"
                items={[
                  { title: "Sprint 1",  description: "Setup do projeto e design system.",   date: "Semana 1", color: "primary" },
                  { title: "Sprint 2",  description: "Módulo de autenticação.",              date: "Semana 2", color: "info" },
                  { title: "Sprint 3",  description: "Dashboard e relatórios.",               date: "Semana 3", color: "success" },
                  { title: "Sprint 4",  description: "Testes e estabilização.",              date: "Semana 4", color: "warning" },
                  { title: "Release",   description: "Deploy para produção.",                date: "Semana 5", color: "success", badge: "v1.0" },
                ]}
              />
            </div>

            {/* Colors */}
            <div id="timeline-colors">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Cores</h3>
              <Timeline
                items={[
                  { title: "Default",  description: "Evento padrão.",  date: "Hoje",     color: "default"  },
                  { title: "Primary",  description: "Evento primário.", date: "Ontem",    color: "primary"  },
                  { title: "Success",  description: "Concluído.",       date: "Seg",      color: "success"  },
                  { title: "Warning",  description: "Atenção.",         date: "Ter",      color: "warning"  },
                  { title: "Danger",   description: "Erro crítico.",    date: "Qua",      color: "danger"   },
                  { title: "Info",     description: "Informativo.",     date: "Qui",      color: "info"     },
                ]}
              />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="toasts">
            <SectionHeader
              label="Toasts"
              title="Toast Notifications"
              description="Sistema de notificações customizado, sem dependências externas. 6 tipos, ações inline, promise com auto-transition e animações com spring physics."
            />

            <DemoCard id="toasts-preview" title="Todos os tipos">
              <div className="flex flex-col gap-3">
                <ToastPreview type="success" message="Configurações salvas com sucesso." />
                <ToastPreview type="error"   message="Não foi possível conectar ao servidor." />
                <ToastPreview type="warning" message="Atenção: essa ação não pode ser desfeita." />
                <ToastPreview type="info"    message="Nova versão disponível." action={{ label: "Atualizar" }} />
                <ToastPreview type="loading" message="Carregando dados…" showBar={false} />
                <ToastPreview type="default" message="Arquivo copiado para a área de transferência." icon="📋" />
              </div>
            </DemoCard>

            <DemoCard id="toasts-examples" title="Exemplos interativos — clique para disparar">
              <div className="flex flex-wrap gap-3">
                <Button onClick={notifySuccess} variant="primary"     size="sm">success</Button>
                <Button onClick={notifyError}   variant="destructive" size="sm">error</Button>
                <Button onClick={notifyWarning} variant="outline"     size="sm">warning</Button>
                <Button onClick={notifyInfo}    variant="secondary"   size="sm">info + ação</Button>
                <Button onClick={notifyBasic}   variant="ghost"       size="sm">basic + emoji</Button>
                <Button onClick={notifyLoading} variant="ghost"       size="sm">loading → success</Button>
                <Button onClick={notifyPromise} variant="outline"     size="sm">promise</Button>
                <Button onClick={notifyAction}  variant="secondary"   size="sm">com ação</Button>
                <Button onClick={notifyBig}                           size="sm">texto longo</Button>
                <Button onClick={notifyStyled}  variant="ghost"       size="sm">emoji icon</Button>
              </div>
            </DemoCard>

            <div className="mt-6 space-y-4">
              <CodeBlock filename="toasts.tsx" language="tsx" code={`import toast, { Toaster } from "@/components/Toast";\n\n// No layout (uma vez):\n<Toaster position="top-right" />\n\n// Tipos básicos\ntoast.success('Salvo com sucesso!');\ntoast.error('Algo deu errado.');\ntoast.warning('Atenção: a ação não pode ser desfeita.');\ntoast.info('Nova atualização.', {\n  action: { label: 'Atualizar', onClick: () => router.push('/update') },\n});\n\n// Loading manual (id reutilizado)\nconst id = toast.loading('Carregando...');\ntoast.success('Pronto!', { id });\n\n// Promise auto-transition\ntoast.promise(salvarDados(), {\n  loading: 'Salvando...',\n  success: 'Dados salvos!',\n  error: (err) => \`Falha: \${err.message}\`,\n});\n\n// Dismiss\ntoast.dismiss();   // todos\ntoast.dismiss(id); // um específico`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── TreeView ──────────────────────────────────────────────────── */}
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

          {/* Footer */}
          <footer className="pt-8 border-t border-zinc-200 text-center text-sm text-zinc-400">
            <p>Lopes UI — construído com Next.js, Tailwind CSS e lucide-react.</p>
          </footer>
        </div>

      {/* Floating back-to-top */}
      <div className={["fixed bottom-6 right-4 sm:right-6 z-50 transition-[opacity,transform] duration-300", showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"].join(" ")}>
        <Button
          square
          leftIcon={<ArrowUp />}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          tooltip="Voltar ao topo"
          aria-label="Voltar ao topo"
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
      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 dark:text-zinc-50 mb-3">{title}</h2>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">{description}</p>
    </div>
  );
}

function DemoCard({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden mb-4">
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{title}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function PropsTable({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  const hdrs = headers ?? (rows[0]?.length === 3 ? ["Componente", "Principais props", "Descrição"] : ["Prop", "Tipo", "Default", "Descrição"]);
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            {hdrs.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <td className="px-4 py-3"><code className="font-mono text-indigo-600 dark:text-indigo-400 text-xs break-all">{row[0]}</code></td>
              <td className="px-4 py-3"><code className="font-mono text-zinc-500 dark:text-zinc-400 text-xs break-all">{row[1]}</code></td>
              {row.length > 3 && <td className="px-4 py-3"><code className="font-mono text-zinc-400 dark:text-zinc-500 text-xs break-all">{row[2]}</code></td>}
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 text-xs">{row[row.length - 1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
     