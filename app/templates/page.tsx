"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Code2,
  Download,
  Eye,
  Headphones,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import Chart from "@/components/Chart";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import ActivityFeed from "@/components/ActivityFeed";
import KanbanBoard, { type KanbanColumn } from "@/components/KanbanBoard";
import InboxList, { type InboxItem } from "@/components/InboxList";
import ChatWindow, { type ChatConversation } from "@/components/ChatWindow";
import EmailComposer from "@/components/EmailComposer";
import DescriptionList from "@/components/DescriptionList";
import Timeline from "@/components/Timeline";
import Tabs, { TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import Button from "@/components/Button";
import ToggleGroup, { ToggleGroupItem } from "@/components/ToggleGroup";
import Badge from "@/components/Badge";
import StatusBadge from "@/components/StatusBadge";
import Card, { CardHeader, CardBody } from "@/components/Card";
import Alert from "@/components/Alert";
import Snippet from "@/components/Snippet";
import Countdown from "@/components/Countdown";
import Marquee from "@/components/Marquee";
import HoverGallery from "@/components/HoverGallery";
import Stepper from "@/components/Stepper";
import TransferList, { type TransferListItem } from "@/components/TransferList";
import FormDrawer from "@/components/FormDrawer";
import TextField from "@/components/form/TextField";
import SelectField from "@/components/form/SelectField";
import RadioGroupField from "@/components/form/RadioGroupField";
import SliderField from "@/components/form/SliderField";
import RatingField from "@/components/form/RatingField";
import FilterChips from "@/components/form/FilterChips";
import ColorPickerField from "@/components/form/ColorPickerField";
import TagInputField from "@/components/form/TagInputField";
import PriceInput from "@/components/PriceInput";
import OTPInput from "@/components/OTPInput";
import PasswordStrength from "@/components/PasswordStrength";
import { FieldSet, FieldLegend, FieldGroup } from "@/components/form/FieldWrapper";
import { AccessControlProvider } from "@/components/useAccessControl";
import CodeBlock from "@/components/CodeBlock";
import toast from "@/components/Toast";

type TemplateId = "dashboard" | "crm" | "helpdesk" | "settings" | "catalog";

const TEMPLATES: {
  id: TemplateId;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard Executivo",
    subtitle: "KPIs, gráficos de receita, canais e transações em tempo real",
    icon: LayoutDashboard,
    badge: "Analytics",
  },
  {
    id: "crm",
    label: "CRM & Pipeline",
    subtitle: "Funil comercial com Kanban, Tabela e Drawer de nova oportunidade",
    icon: Briefcase,
    badge: "Comercial",
  },
  {
    id: "helpdesk",
    label: "Helpdesk Omnichannel",
    subtitle: "Caixa de entrada, Chat ao vivo, E-mail e ficha 360° do cliente",
    icon: Headphones,
    badge: "Atendimento",
  },
  {
    id: "settings",
    label: "Configurações & RBAC",
    subtitle: "Preferências da conta, chaves de API, 2FA e simulador de permissões",
    icon: Settings,
    badge: "Segurança",
  },
  {
    id: "catalog",
    label: "Vitrine & Checkout",
    subtitle: "Catálogo interativo com galeria hover, oferta relâmpago e checkout em etapas",
    icon: ShoppingBag,
    badge: "E-commerce",
  },
];

const TEMPLATE_CODES: Record<TemplateId, string> = {
  dashboard: `import { PageHeader, StatCard, Chart, DataTable, ActivityFeed } from "lopes-ui";

export default function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão Geral Executiva"
        description="Acompanhamento consolidado de receita, conversão e operações"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Receita Mensal" value="R$ 1.482.900" trend={{ value: 14.2, label: "vs. mês anterior" }} />
        <StatCard title="Novos Clientes" value="1.284" trend={{ value: 8.5 }} color="emerald" />
        <StatCard title="Ticket Médio" value="R$ 1.154" trend={{ value: 3.1 }} color="indigo" />
        <StatCard title="NPS Global" value="78 pts" trend={{ value: 2.4 }} color="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Chart
          className="lg:col-span-2"
          type="area"
          title="Receita Realizada vs Meta (R$ mil)"
          data={REVENUE_DATA}
          series={[
            { key: "realizado", label: "Realizado", color: "indigo" },
            { key: "meta", label: "Meta", color: "emerald" },
          ]}
        />
        <Chart
          type="donut"
          title="Vendas por Canal"
          data={CHANNEL_DATA}
          centerLabel="R$ 1,48M"
        />
      </div>
    </div>
  );
}`,
  crm: `import { PageHeader, FilterChips, KanbanBoard, FormDrawer, TextField, PriceInput } from "lopes-ui";

export default function CrmPipelinePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Comercial"
        description="Gerencie oportunidades e acompanhe negociações em andamento"
        actions={<Button variant="primary" onClick={() => setDrawerOpen(true)}>Nova Oportunidade</Button>}
      />
      <KanbanBoard columns={PIPELINE_COLUMNS} />
      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nova Oportunidade">
        <TextField label="Empresa / Cliente" required />
        <PriceInput label="Valor Estimado" />
      </FormDrawer>
    </div>
  );
}`,
  helpdesk: `import { InboxList, ChatWindow, DescriptionList, Timeline, Tabs } from "lopes-ui";

export default function HelpdeskWorkspace() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4"><InboxList items={TICKETS} /></div>
      <div className="lg:col-span-5"><ChatWindow conversations={CONVERSATIONS} /></div>
      <div className="lg:col-span-3">
        <DescriptionList title="Dados do Cliente" items={CUSTOMER_INFO} />
      </div>
    </div>
  );
}`,
  settings: `import { Tabs, FieldSet, ColorPickerField, TagInputField, Snippet, AccessControlProvider } from "lopes-ui";

export default function SettingsAndRbacPage() {
  return (
    <AccessControlProvider initialTasks={grantedTasks} initialIsAdmin={isAdmin} defaultAllow={false}>
      <Tabs defaultValue="brand">
        <ColorPickerField label="Cor Primária da Marca" defaultValue="#4f46e5" />
        <TagInputField label="Domínios Autorizados (CORS)" defaultValue={["app.empresa.com.br"]} />
        <Snippet code="sk_test_EXEMPLO_NAO_REAL" maskSecret symbol="KEY" />
      </Tabs>
    </AccessControlProvider>
  );
}`,
  catalog: `import { Countdown, Marquee, HoverGallery, RatingField, Stepper, RadioGroupField } from "lopes-ui";

export default function CatalogAndCheckoutPage() {
  return (
    <div className="space-y-6">
      <Countdown seconds={18000} variant="boxed" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRODUCTS.map((p) => (
          <Card key={p.id}>
            <HoverGallery images={p.images} />
            <RatingField value={p.rating} readOnly size="sm" />
          </Card>
        ))}
      </div>
    </div>
  );
}`,
};

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<TemplateId>("dashboard");
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "") as TemplateId;
      if (TEMPLATES.some((t) => t.id === hash)) {
        setActiveTab(hash);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const handleSelectTemplate = (id: TemplateId) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const currentMeta = TEMPLATES.find((t) => t.id === activeTab) ?? TEMPLATES[0];

  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Top Banner & Template Selector */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1.5">
              <Sparkles size={13} />
              <span>Páginas Exemplo Prontas para Produção</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Templates & Cenários Reais
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Explore 5 aplicações corporativas completas construídas 100% com componentes da{" "}
              <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Lopes UI</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showCode ? "primary" : "outline"}
              size="sm"
              leftIcon={showCode ? <Eye size={14} /> : <Code2 size={14} />}
              onClick={() => setShowCode((v) => !v)}
            >
              {showCode ? "Ver Aplicação" : "Ver Código TSX"}
            </Button>
          </div>
        </div>

        {/* Template selector cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isActive = tpl.id === activeTab;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all ${
                  isActive
                    ? "border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40 shadow-xs"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-300"
                        : "bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {tpl.badge}
                  </span>
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      isActive
                        ? "text-indigo-950 dark:text-indigo-100"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {tpl.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                    {tpl.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        {showCode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Código-fonte: {currentMeta.label}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Estrutura pronta para copiar e colar em qualquer rota do Next.js App Router.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowCode(false)}>
                Voltar para pré-visualização
              </Button>
            </div>
            <CodeBlock
              filename={`app/${activeTab}/page.tsx`}
              language="tsx"
              lineNumbers
              code={TEMPLATE_CODES[activeTab]}
            />
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && <DashboardTemplate />}
            {activeTab === "crm" && <CrmTemplate />}
            {activeTab === "helpdesk" && <HelpdeskTemplate />}
            {activeTab === "settings" && <SettingsTemplate />}
            {activeTab === "catalog" && <CatalogTemplate />}
          </>
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. DASHBOARD EXECUTIVO & ANALYTICS
   ═══════════════════════════════════════════════════════════════════════════ */

const REVENUE_SERIES_DATA = [
  { label: "Jan", realizado: 920, meta: 850 },
  { label: "Fev", realizado: 1040, meta: 950 },
  { label: "Mar", realizado: 1120, meta: 1050 },
  { label: "Abr", realizado: 1080, meta: 1100 },
  { label: "Mai", realizado: 1310, meta: 1200 },
  { label: "Jun", realizado: 1482, meta: 1300 },
];

const CHANNEL_DONUT_DATA = [
  { label: "Enterprise B2B", value: 680, color: "indigo" },
  { label: "Self-Service SaaS", value: 490, color: "emerald" },
  { label: "Parceiros & Canais", value: 210, color: "amber" },
  { label: "Marketplace", value: 102, color: "sky" },
];

const REGIONAL_BAR_DATA = [
  { label: "Norte", recorrente: 310, expansao: 120 },
  { label: "Sudeste", recorrente: 540, expansao: 210 },
  { label: "Sul", recorrente: 290, expansao: 95 },
  { label: "Centro-Oeste", recorrente: 220, expansao: 85 },
  { label: "Nordeste", recorrente: 260, expansao: 110 },
];

type InvoiceRow = {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  status: "Pago" | "Pendente" | "Processando";
  date: string;
};

const RECENT_INVOICES: InvoiceRow[] = [
  { id: "FAT-9041", customer: "TechNova Cloud S.A.", plan: "Enterprise Anual", amount: 48900, status: "Pago", date: "Hoje, 11:20" },
  { id: "FAT-9040", customer: "Grupo Horizonte Logística", plan: "Business Pro", amount: 14200, status: "Pago", date: "Hoje, 09:45" },
  { id: "FAT-9039", customer: "Vértice Engenharia", plan: "Enterprise Mensal", amount: 8500, status: "Processando", date: "Ontem, 18:10" },
  { id: "FAT-9038", customer: "Atlas Finanças Digitais", plan: "Scale Up", amount: 22400, status: "Pago", date: "Ontem, 15:30" },
  { id: "FAT-9037", customer: "Norte Energia & Redes", plan: "Business Pro", amount: 12900, status: "Pendente", date: "12 Out" },
];

const INVOICE_COLS: DataTableColumn<InvoiceRow>[] = [
  { key: "id", label: "Fatura", width: "110px", sortable: true },
  { key: "customer", label: "Cliente", sortable: true },
  { key: "plan", label: "Plano", sortable: true },
  {
    key: "amount",
    label: "Valor",
    align: "right",
    sortable: true,
    render: (v) => <span className="font-mono font-semibold">R$ {(v as number).toLocaleString("pt-BR")}</span>,
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    render: (v) => {
      const s = v as InvoiceRow["status"];
      const tone = s === "Pago" ? "success" : s === "Processando" ? "info" : "warning";
      return <StatusBadge label={s} tone={tone} size="sm" dot />;
    },
  },
  { key: "date", label: "Data", width: "130px" },
];

const DASHBOARD_REF_TIME = new Date("2026-04-05T14:00:00.000Z").getTime();

function DashboardTemplate() {
  const [period, setPeriod] = useState("6m");

  return (
    <div id="dashboard" className="space-y-6">
      <Breadcrumb
        homeIcon
        items={[
          { label: "Templates", href: "/templates" },
          { label: "Dashboard Executivo" },
        ]}
      />

      <PageHeader
        title="Dashboard Executivo & Receita"
        description="Indicadores consolidados de ARR, retenção líquida (NRR) e faturamento em tempo real."
        badge={<Badge label="Ao vivo" variant="success" dot size="sm" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={period}
              onValueChange={(v) => v && setPeriod(v)}
            >
              <ToggleGroupItem value="30d">30 dias</ToggleGroupItem>
              <ToggleGroupItem value="3m">Trimestre</ToggleGroupItem>
              <ToggleGroupItem value="6m">Semestre</ToggleGroupItem>
              <ToggleGroupItem value="12m">12 meses</ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => {
                toast.success("Relatório executivo exportado em PDF!");
              }}
            >
              Exportar PDF
            </Button>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Receita Recorrente (MRR)"
          value="R$ 1.482.900"
          trend={{ value: 14.2, label: "vs. mês anterior" }}
          icon={TrendingUp}
          color="indigo"
          spark={[880, 940, 1020, 1150, 1290, 1482].map((v) => ({ value: v }))}
        />
        <StatCard
          title="Clientes Ativos Enterprise"
          value="1.284"
          trend={{ value: 8.4, label: "+98 novas contas" }}
          icon={Users}
          color="emerald"
          spark={[980, 1040, 1100, 1160, 1210, 1284].map((v) => ({ value: v }))}
        />
        <StatCard
          title="Retenção Líquida (NRR)"
          value="118,4%"
          trend={{ value: 3.1, label: "Acima da meta (110%)" }}
          icon={Zap}
          color="amber"
          spark={[108, 111, 112, 115, 116, 118].map((v) => ({ value: v }))}
        />
        <StatCard
          title="Inadimplência (Churn)"
          value="1,12%"
          trend={{ value: -0.4, label: "Menor nível histórico", inverted: true }}
          icon={ShieldCheck}
          color="blue"
          spark={[2.1, 1.9, 1.7, 1.5, 1.3, 1.1].map((v) => ({ value: v }))}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Chart
          className="lg:col-span-2"
          type="area"
          title="Evolução de Receita Realizada vs. Meta"
          subtitle="Valores consolidados em R$ mil no semestre atual"
          height={250}
          data={REVENUE_SERIES_DATA}
          series={[
            { key: "realizado", label: "Receita Realizada", color: "indigo" },
            { key: "meta", label: "Meta Planejada", color: "emerald" },
          ]}
          valueFormatter={(v) => `R$ ${v}k`}
        />

        <Chart
          type="donut"
          title="Distribuição por Canal"
          subtitle="Participação no faturamento mensal"
          height={210}
          data={CHANNEL_DONUT_DATA}
          centerLabel="R$ 1,48M"
          centerSublabel="100% Realizado"
          valueFormatter={(v) => `R$ ${v}k`}
        />
      </div>

      {/* Bottom Row: Regional Chart + Table + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DataTable<InvoiceRow>
            title="Últimas Faturas Emitidas"
            rows={RECENT_INVOICES}
            columns={INVOICE_COLS}
            rowKey={(r) => r.id}
          />
        </div>

        <div className="space-y-6">
          <Chart
            type="bar"
            stacked
            title="Receita por Região (R$ mil)"
            subtitle="Base recorrente + expansão"
            height={210}
            data={REGIONAL_BAR_DATA}
            series={[
              { key: "recorrente", label: "Recorrente", color: "indigo" },
              { key: "expansao", label: "Expansão", color: "sky" },
            ]}
            valueFormatter={(v) => `${v}k`}
          />

          <Card>
            <CardHeader title="Eventos em Tempo Real" description="Últimas atualizações financeiras" />
            <CardBody>
              <ActivityFeed
                events={[
                  {
                    id: "ev1",
                    title: "Fatura FAT-9041 liquidada via PIX Corporativo",
                    description: "TechNova Cloud S.A. · R$ 48.900,00",
                    color: "emerald",
                    timestamp: new Date(DASHBOARD_REF_TIME - 8 * 60_000),
                  },
                  {
                    id: "ev2",
                    title: "Upgrade de plano concluído",
                    description: "Atlas Finanças migrou para Scale Up Anual",
                    color: "indigo",
                    timestamp: new Date(DASHBOARD_REF_TIME - 42 * 60_000),
                  },
                  {
                    id: "ev3",
                    title: "Conciliação bancária finalizada",
                    description: "142 boletos compensados sem divergências",
                    color: "blue",
                    timestamp: new Date(DASHBOARD_REF_TIME - 120 * 60_000),
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. CRM & PIPELINE COMERCIAL
   ═══════════════════════════════════════════════════════════════════════════ */

const INITIAL_CRM_COLUMNS: KanbanColumn[] = [
  {
    id: "qualificacao",
    title: "Qualificação",
    color: "zinc",
    limit: 8,
    cards: [
      {
        id: "deal-1",
        title: "Expansão ERP — Grupo Soluções Norte",
        description: "R$ 84.000/ano · 120 licenças · Decisor: Diretoria TI",
        tags: ["Enterprise", "Q4"],
        color: "indigo",
        assignee: { name: "Ana Souza", initials: "AS" },
      },
      {
        id: "deal-2",
        title: "Implantação Cloud — Rede Amazônica Log",
        description: "R$ 42.500/ano · Migração dedicada",
        tags: ["Inbound", "Prioridade"],
        color: "blue",
        assignee: { name: "Bruno Lima", initials: "BL" },
      },
    ],
  },
  {
    id: "proposta",
    title: "Proposta Enviada",
    color: "blue",
    limit: 6,
    cards: [
      {
        id: "deal-3",
        title: "Plataforma B2B — Vértice Industrial",
        description: "R$ 138.000/ano · POC técnica aprovada com 98% de score",
        tags: ["POC Concluída", "Anual"],
        color: "indigo",
        assignee: { name: "Carla Matos", initials: "CM" },
      },
      {
        id: "deal-4",
        title: "Automação Fiscal — Grupo Alfa",
        description: "R$ 29.900/ano · Aguardando parecer jurídico",
        tags: ["Mid-Market"],
        color: "amber",
        assignee: { name: "Ana Souza", initials: "AS" },
      },
    ],
  },
  {
    id: "negociacao",
    title: "Em Negociação Final",
    color: "amber",
    limit: 5,
    cards: [
      {
        id: "deal-5",
        title: "Contrato Global — Horizonte S.A.",
        description: "R$ 290.000/ano · Desconto de 8% aprovado pela diretoria",
        tags: ["Fechamento Hoje", "VIP"],
        color: "emerald",
        assignee: { name: "Diego Ferreira", initials: "DF" },
      },
    ],
  },
  {
    id: "ganho",
    title: "Fechado & Ganho",
    color: "emerald",
    cards: [
      {
        id: "deal-6",
        title: "Licenciamento Anual — TechNova",
        description: "R$ 164.000/ano · Contrato assinado digitalmente",
        tags: ["Assinado", "Pago"],
        color: "emerald",
        assignee: { name: "Bruno Lima", initials: "BL" },
      },
    ],
  },
];

function CrmTemplate() {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_CRM_COLUMNS);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealStage, setDealStage] = useState("qualificacao");
  const [dealValue, setDealValue] = useState<number | null>(65000);
  const [dealProb, setDealProb] = useState(75);
  const [dealTags, setDealTags] = useState<string[]>(["Enterprise", "Q4"]);

  const filteredColumns =
    stageFilter === "all" ? columns : columns.filter((c) => c.id === stageFilter);

  const handleCreateDeal = () => {
    if (!dealTitle.trim()) {
      toast.error("Informe o nome da oportunidade");
      return;
    }
    setColumns((prev) =>
      prev.map((col) =>
        col.id === dealStage
          ? {
              ...col,
              cards: [
                {
                  id: `deal-${Date.now()}`,
                  title: dealTitle,
                  description: `R$ ${(dealValue ?? 0).toLocaleString("pt-BR")} · Probabilidade: ${dealProb}%`,
                  tags: dealTags,
                  color: "indigo",
                  assignee: { name: "Cristiano Lopes", initials: "CL" },
                },
                ...col.cards,
              ],
            }
          : col
      )
    );
    setDealTitle("");
    setDrawerOpen(false);
    toast.success("Oportunidade adicionada ao pipeline!");
  };

  return (
    <div id="crm" className="space-y-6">
      <PageHeader
        title="CRM & Pipeline de Vendas"
        description="Acompanhe negociações ativas, previsão de fechamento (Forecast) e metas da equipe."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setDrawerOpen(true)}
          >
            Nova Oportunidade
          </Button>
        }
      />

      {/* Funnel KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Valor Total em Pipeline" value="R$ 748.400" trend={{ value: 18.5 }} color="indigo" />
        <StatCard title="Forecast Ponderado (Mês)" value="R$ 454.000" trend={{ value: 11.2 }} color="emerald" />
        <StatCard title="Taxa de Conversão (Win Rate)" value="34,8%" trend={{ value: 4.1 }} color="amber" />
      </div>

      {/* Filter chips bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5">
        <FilterChips
          options={[
            { value: "all", label: "Todas as etapas", count: 6 },
            { value: "qualificacao", label: "Qualificação", count: 2 },
            { value: "proposta", label: "Proposta", count: 2 },
            { value: "negociacao", label: "Negociação", count: 1 },
            { value: "ganho", label: "Fechado Ganho", count: 1 },
          ]}
          value={stageFilter}
          onChange={(v) => setStageFilter((v as string) || "all")}
        />
      </div>

      {/* Kanban */}
      <KanbanBoard columns={filteredColumns} />

      {/* Drawer for New Deal */}
      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Cadastrar Nova Oportunidade"
        description="Preencha os dados comerciais para incluir no funil"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateDeal}>
              Criar Oportunidade
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Título da Oportunidade / Empresa"
            placeholder="Ex: Licenciamento Enterprise — Grupo Atlas"
            value={dealTitle}
            onChange={(e) => setDealTitle(e.target.value)}
            required
          />
          <SelectField
            label="Etapa Inicial do Funil"
            value={dealStage}
            onChange={(v) => setDealStage(v)}
            options={[
              { value: "qualificacao", label: "1. Qualificação" },
              { value: "proposta", label: "2. Proposta Enviada" },
              { value: "negociacao", label: "3. Em Negociação Final" },
            ]}
          />
          <PriceInput
            label="Valor Anual Estimado (ARR)"
            value={dealValue}
            onChange={setDealValue}
          />
          <SliderField
            label="Probabilidade de Fechamento"
            value={dealProb}
            onChange={(v) => setDealProb(v as number)}
            min={10}
            max={100}
            step={5}
            formatValue={(v) => `${v}%`}
          />
          <TagInputField
            label="Tags da Negociação"
            value={dealTags}
            onChange={setDealTags}
            suggestions={["Inbound", "Outbound", "Anual", "POC", "VIP"]}
          />
          <RatingField label="Temperatura do Lead (Fit)" defaultValue={4} showValue />
        </div>
      </FormDrawer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. CENTRAL DE ATENDIMENTO / HELPDESK OMNICHANNEL
   ═══════════════════════════════════════════════════════════════════════════ */

const HELPDESK_REF = new Date("2026-04-05T14:00:00.000Z").getTime();

const HELPDESK_TICKETS: InboxItem[] = [
  {
    id: "t1",
    from: "Mariana Costa (TechNova)",
    subject: "#TK-8821 · Dúvida na integração de Webhook",
    preview: "Olá! O endpoint de confirmação está retornando status 202...",
    date: new Date(HELPDESK_REF - 4 * 60_000),
    unread: true,
    starred: true,
  },
  {
    id: "t2",
    from: "Roberto Almeida (Vértice)",
    subject: "#TK-8819 · Liberação de SSO SAML 2.0",
    preview: "Conseguem validar o certificado IdP enviado ontem?",
    date: new Date(HELPDESK_REF - 35 * 60_000),
    unread: true,
  },
  {
    id: "t3",
    from: "Fernanda Rocha (Horizonte)",
    subject: "#TK-8812 · Solicitação de 2ª via de NF-e",
    preview: "Perfeito, muito obrigada pelo envio rápido!",
    date: new Date(HELPDESK_REF - 3 * 3600_000),
    unread: false,
  },
];

const HELPDESK_CONVERSATIONS: ChatConversation[] = [
  {
    id: "t1",
    name: "Mariana Costa · TechNova",
    online: true,
    unread: 1,
    lastMessage: "O endpoint de confirmação está retornando 202.",
    lastMessageTime: "10:42",
    messages: [
      {
        senderName: "Mariana Costa",
        content: "Bom dia! Estamos configurando o webhook de eventos em produção.",
        timestamp: "10:40",
        showAvatar: true,
      },
      {
        content: "Bom dia, Mariana! Posso verificar os logs da sua conta agora mesmo.",
        mine: true,
        timestamp: "10:41",
        status: "read",
      },
      {
        senderName: "Mariana Costa",
        content: "Perfeito! O endpoint já respondeu 200 OK no ambiente sandbox, falta apenas ativar a chave principal.",
        timestamp: "10:42",
        showAvatar: true,
      },
    ],
  },
];

function HelpdeskTemplate() {
  const [selectedTicket, setSelectedTicket] = useState("t1");

  return (
    <div id="helpdesk" className="space-y-6">
      <PageHeader
        title="Central Helpdesk Omnichannel"
        description="Atendimento unificado via Chat ao vivo, E-mail e histórico completo do cliente."
        badge={<StatusBadge label="SLA 99,4% no prazo" tone="success" dot size="sm" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1: Ticket Inbox */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Fila de Chamados (3)
            </span>
            <Badge label="2 novos" variant="primary" size="xs" />
          </div>
          <InboxList
            items={HELPDESK_TICKETS}
            selectedId={selectedTicket}
            onSelect={setSelectedTicket}
          />
        </div>

        {/* Column 2: Chat / Email Responder */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <Tabs defaultValue="chat" variant="pills">
            <TabsList className="mb-4">
              <TabsTrigger value="chat">Chat em Tempo Real</TabsTrigger>
              <TabsTrigger value="email">Responder por E-mail</TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatWindow conversations={HELPDESK_CONVERSATIONS} />
            </TabsContent>

            <TabsContent value="email">
              <EmailComposer
                mode="inline"
                defaultTo={[{ name: "Mariana Costa", email: "mariana@technova.com.br" }]}
                defaultSubject="Re: #TK-8821 · Dúvida na integração de Webhook"
                onSend={() => {
                  toast.success("Resposta enviada por e-mail!");
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Column 3: Customer 360 Profile */}
        <div className="lg:col-span-3 space-y-4">
          <DescriptionList
            title="Ficha 360° do Cliente"
            subtitle="TechNova Cloud S.A."
            layout="stacked"
            items={[
              { label: "Plano Contratado", value: <Badge label="Enterprise Anual" variant="primary" size="xs" /> },
              { label: "ID da Organização", value: "org_99481a7b", copyValue: "org_99481a7b" },
              { label: "Gerente de Conta (CSM)", value: "Ana Souza" },
              { label: "Saúde da Conta (Health)", value: <StatusBadge label="Saudável (96/100)" tone="success" size="xs" dot /> },
            ]}
          />

          <Card>
            <CardHeader title="Histórico do Chamado" />
            <CardBody>
              <Timeline
                items={[
                  { title: "Chamado aberto via Portal", date: "10:39", color: "primary" },
                  { title: "Atribuído automaticamente", description: "Fila Engenharia N2", date: "10:40", color: "info" },
                  { title: "Primeira resposta em 48s", description: "Dentro da meta de SLA VIP", date: "10:41", color: "success" },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. CONFIGURAÇÕES, SEGURANÇA & RBAC
   ═══════════════════════════════════════════════════════════════════════════ */

function SettingsTemplate() {
  const [brandColor, setBrandColor] = useState("#4f46e5");
  const [corsDomains, setCorsDomains] = useState(["app.empresa.com.br", "admin.empresa.com.br"]);
  const [activeRole, setActiveRole] = useState<"admin" | "viewer">("admin");
  const [sourcePerms, setSourcePerms] = useState<TransferListItem[]>([
    { id: "users.write", title: "users.write — Gerenciar Usuários", subtitle: "Criar, editar e desativar contas", tag: "CORE", tagTone: "success" },
    { id: "api.keys", title: "api.keys — Chaves de API", subtitle: "Gerar e revogar segredos de produção", tag: "SEC", tagTone: "info" },
    { id: "reports.export", title: "reports.export — Exportar Relatórios", subtitle: "Exportação CSV e PDF completos", tag: "DATA", tagTone: "success" },
  ]);
  const [targetPerms, setTargetPerms] = useState<TransferListItem[]>([
    { id: "billing.manage", title: "billing.manage — Faturamento", subtitle: "Alterar planos e baixar notas fiscais", tag: "FIN", tagTone: "warning" },
    { id: "audit.read", title: "audit.read — Logs de Auditoria", subtitle: "Visualizar trilha de segurança", tag: "SEC", tagTone: "info" },
  ]);
  const [newPass, setNewPass] = useState("LopesUI@2026#Prod");
  const [otpCode, setOtpCode] = useState("482910");

  const grantedTaskIds = sourcePerms.map((p) => String(p.id));

  return (
    <div id="settings" className="space-y-6">
      <PageHeader
        title="Configurações & Segurança Corporativa"
        description="Personalize identidade visual, políticas de segurança, chaves de API e controle de acesso RBAC."
      />

      <Tabs defaultValue="general" variant="underline">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Identidade & Domínios</TabsTrigger>
          <TabsTrigger value="rbac">Controle de Acesso (RBAC)</TabsTrigger>
          <TabsTrigger value="security">API Keys & 2FA</TabsTrigger>
        </TabsList>

        {/* Tab 1: General & Branding */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FieldSet>
              <FieldLegend>Identidade Visual & Workspace</FieldLegend>
              <FieldGroup>
                <TextField label="Nome da Organização" defaultValue="Lopes Enterprise Cloud" required />
                <ColorPickerField
                  label="Cor Primária da Marca"
                  value={brandColor}
                  onChange={setBrandColor}
                  helpText="Aplicada em botões de destaque, links ativos e gráficos."
                />
                <TagInputField
                  label="Domínios Autorizados (CORS & SSO)"
                  value={corsDomains}
                  onChange={setCorsDomains}
                  suggestions={["api.empresa.com.br", "portal.empresa.com.br", "staging.empresa.com.br"]}
                  maxTags={6}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Preferências de Região & Densidade</FieldLegend>
              <FieldGroup>
                <RadioGroupField
                  label="Densidade Padrão das Tabelas"
                  variant="cards"
                  defaultValue="comfortable"
                  options={[
                    { value: "compact", label: "Compacta (Alta densidade)", description: "Exibe até 25 registros por tela sem rolagem." },
                    { value: "comfortable", label: "Confortável (Recomendado)", description: "Equilíbrio ideal entre leitura e espaço." },
                  ]}
                />
              </FieldGroup>
            </FieldSet>
          </div>
        </TabsContent>

        {/* Tab 2: Live RBAC Simulator */}
        <TabsContent value="rbac">
          <div className="space-y-6">
            <Alert
              variant="info"
              title="Simulador RBAC em Tempo Real"
              description="Altere o perfil ou mova permissões na TransferList abaixo para ver os componentes da Lopes UI reagirem automaticamente via useAccessControl."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <TransferList
                  sourceTitle="Permissões Atribuídas ao Usuário"
                  targetTitle="Permissões Disponíveis no Sistema"
                  sourceItems={sourcePerms}
                  targetItems={targetPerms}
                  height={300}
                  onChange={(nextSource, nextTarget) => {
                    setSourcePerms(nextSource);
                    setTargetPerms(nextTarget);
                  }}
                />
              </div>

              <div className="lg:col-span-5">
                <Card>
                  <CardHeader
                    title="Painel Protegido por RBAC"
                    description="Teste de componentes condicionados às permissões ao lado"
                  />
                  <CardBody>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500">Modo de Acesso:</span>
                        <ToggleGroup
                          type="single"
                          size="sm"
                          variant="outline"
                          value={activeRole}
                          onValueChange={(v) => v && setActiveRole(v as "admin" | "viewer")}
                        >
                          <ToggleGroupItem value="admin">Usar Lista Ao Lado</ToggleGroupItem>
                          <ToggleGroupItem value="viewer">Restrito (Leitura)</ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <AccessControlProvider
                        initialIsAdmin={false}
                        initialTasks={activeRole === "admin" ? grantedTaskIds : ["reports.export"]}
                        defaultAllow={false}
                      >
                        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                              Requer <code className="font-mono text-indigo-600">users.write</code>:
                            </span>
                            <Button
                              componentId="users.write"
                              hideIfDenied={false}
                              variant="primary"
                              size="sm"
                              onClick={() => toast.success("Ação users.write executada!")}
                            >
                              Convidar Usuário
                            </Button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                              Requer <code className="font-mono text-indigo-600">api.keys</code>:
                            </span>
                            <Button
                              componentId="api.keys"
                              hideIfDenied={false}
                              variant="destructive"
                              size="sm"
                              onClick={() => toast.error("Chave de API revogada!")}
                            >
                              Revogar Chave API
                            </Button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                              Requer <code className="font-mono text-indigo-600">reports.export</code>:
                            </span>
                            <Button
                              componentId="reports.export"
                              hideIfDenied={false}
                              variant="outline"
                              size="sm"
                              onClick={() => toast.success("Relatório exportado!")}
                            >
                              Baixar Relatório
                            </Button>
                          </div>
                        </div>
                      </AccessControlProvider>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Security & API Keys */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader
                title="Chaves de API de Produção"
                description="Use o componente Snippet com proteção de segredo"
              />
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Chave Secreta Principal (Live)
                    </p>
                    <Snippet
                      code="sk_test_EXEMPLO_NAO_REAL"
                      symbol="KEY"
                      maskSecret
                      className="w-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Webhook CLI Listener
                    </p>
                    <Snippet
                      code="npx lopes-cli listen --forward-to localhost:3000/api/webhooks"
                      variant="dark"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Autenticação em Duas Etapas (2FA)"
                description="Validação de senha forte e token TOTP"
              />
              <CardBody>
                <div className="space-y-4">
                  <TextField
                    label="Nova Senha Mestre"
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <PasswordStrength password={newPass} />
                  <div className="pt-2">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Código do Autenticador (6 dígitos)
                    </p>
                    <OTPInput length={6} value={otpCode} onChange={setOtpCode} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. VITRINE E-COMMERCE & CHECKOUT
   ═══════════════════════════════════════════════════════════════════════════ */

const CATALOG_PRODUCTS = [
  {
    id: "p1",
    name: "Workstation Pro Studio 16”",
    category: "Hardware Corporativo",
    price: 14890,
    rating: 5,
    reviews: 128,
    badge: "Mais Vendido",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "p2",
    name: "Monitor UltraWide 34” 4K USB-C",
    category: "Monitores & Displays",
    price: 5490,
    rating: 4.5,
    reviews: 84,
    badge: "-15% Hoje",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "p3",
    name: "Teclado Mecânico Wireless Low-Profile",
    category: "Periféricos",
    price: 980,
    rating: 5,
    reviews: 215,
    badge: "Lançamento",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80",
    ],
  },
];

function CatalogTemplate() {
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("pix");

  return (
    <div id="catalog" className="space-y-6">
      {/* Flash Sale Banner with Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-900 p-5">
        <div className="space-y-1">
          <Badge label="Oferta Corporativa Relâmpago" variant="primary" size="xs" />
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
            Equipamentos para Equipes de Alta Performance
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Faturamento faturado em até 12x sem juros ou 10% OFF no PIX Corporativo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Encerra em:
          </span>
          <Countdown seconds={20539} size="sm" variant="boxed" showDays={false} />
        </div>
      </div>

      {/* Marquee benefits */}
      <Marquee duration={24} className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5">
        {[
          "Frete Expresso Segurado para todo o Brasil",
          "Garantia Corporativa On-Site de 36 meses",
          "Faturamento Direto para CNPJ",
          "Suporte Técnico 24/7 Dedicado",
          "Nota Fiscal Eletrônica Instantânea",
        ].map((item) => (
          <div key={item} className="inline-flex items-center gap-2 px-3 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Sparkles size={13} className="text-indigo-500" />
            <span>{item}</span>
          </div>
        ))}
      </Marquee>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATALOG_PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:shadow-md"
          >
            <div>
              <div className="relative mb-3">
                <HoverGallery images={prod.images} aspectClassName="aspect-[16/10]" />
                <div className="absolute top-2.5 left-2.5 z-10">
                  <Badge label={prod.badge} variant="primary" solid size="xs" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-zinc-400">{prod.category}</span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {prod.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <RatingField value={prod.rating} allowHalf readOnly size="sm" />
                <span className="text-xs text-zinc-400">({prod.reviews} avaliações)</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block">Valor unitário</span>
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  R$ {prod.price.toLocaleString("pt-BR")}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success(`${prod.name} adicionado ao pedido!`);
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Checkout Box */}
      <Card>
        <CardHeader
          title="Finalização Rápida de Pedido (Checkout B2B)"
          description="Exemplo combinando Stepper, RadioGroupField em modo Cards e resumo financeiro"
        />
        <CardBody>
          <div className="space-y-6">
            <Stepper
              activeStep={checkoutStep}
              steps={[
                { title: "Identificação CNPJ", description: "Dados de faturamento" },
                { title: "Forma de Pagamento", description: "PIX, Boleto ou Cartão" },
                { title: "Confirmação", description: "Emissão de NF-e" },
              ]}
            />

            <RadioGroupField
              label="Selecione a Modalidade de Pagamento"
              variant="cards"
              columns={3}
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                {
                  value: "pix",
                  label: "PIX Corporativo (-10%)",
                  description: "Aprovação instantânea com desconto aplicado na hora.",
                },
                {
                  value: "boleto",
                  label: "Boleto Faturado 28 dias",
                  description: "Exclusivo para empresas com cadastro aprovado.",
                },
                {
                  value: "card",
                  label: "Cartão Corporativo (até 12x)",
                  description: "Parcelamento sem juros com confirmação imediata.",
                },
              ]}
            />

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                disabled={checkoutStep === 0}
                onClick={() => setCheckoutStep((s) => Math.max(0, s - 1))}
              >
                Etapa Anterior
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (checkoutStep < 2) {
                    setCheckoutStep((s) => s + 1);
                  } else {
                    toast.success("Pedido corporativo #98412 confirmado com sucesso!");
                  }
                }}
              >
                {checkoutStep < 2 ? "Avançar Etapa" : "Finalizar Pedido Corporativo"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
