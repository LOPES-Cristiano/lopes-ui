"use client";

import React from "react";
import Link from "next/link";
import {
  FormInput,
  Layers,
  Zap,
  BarChart2,
  MessageCircle,
  Navigation,
  Play,
  LayoutDashboard,
  Briefcase,
  Headphones,
  Settings,
  ShoppingBag,
  Wrench,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Terminal,
} from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import Badge from "@/components/Badge";
import Snippet from "@/components/Snippet";
import BentoGrid, { BentoCard } from "@/components/BentoGrid";
import Chart from "@/components/Chart";
import Marquee from "@/components/Marquee";

const INSTALL_CODE = `npm install github:LOPES-Cristiano/lopes-ui`;
const INIT_CODE = `npx lopes-ui init

# Para usar o RichTextEditor (Tiptap):
npx lopes-ui init --tiptap`;
const USAGE_CODE = `import { Button, Chart, DataTable, toast, Toaster } from "lopes-ui";
import { useAsyncButton } from "lopes-ui/hooks";

export default function MyPage() {
  return (
    <>
      <Toaster position="top-right" />
      <Button variant="primary" onClick={() => toast.success("Salvo com sucesso!")}>
        Salvar alterações
      </Button>
    </>
  );
}`;

const EXAMPLE_TEMPLATES = [
  {
    href: "/templates#dashboard",
    icon: LayoutDashboard,
    badge: "Analytics",
    title: "Dashboard Executivo",
    description: "KPIs com sparkline, gráficos de área/rosca, DataTable e feed em tempo real.",
  },
  {
    href: "/templates#crm",
    icon: Briefcase,
    badge: "Comercial",
    title: "CRM & Pipeline",
    description: "Quadro Kanban drag-and-drop, FilterChips por etapa e FormDrawer de negociação.",
  },
  {
    href: "/templates#helpdesk",
    icon: Headphones,
    badge: "Omnichannel",
    title: "Central Helpdesk",
    description: "InboxList de chamados, ChatWindow ao vivo, EmailComposer e ficha 360° do cliente.",
  },
  {
    href: "/templates#settings",
    icon: Settings,
    badge: "RBAC Live",
    title: "Configurações & RBAC",
    description: "Simulador de controle de acesso ao vivo, TransferList, API Keys e 2FA.",
  },
  {
    href: "/templates#catalog",
    icon: ShoppingBag,
    badge: "E-commerce",
    title: "Vitrine & Checkout",
    description: "HoverGallery, Countdown de oferta relâmpago, Marquee e Checkout com Stepper.",
  },
  {
    href: "/ui-builder",
    icon: Wrench,
    badge: "Visual Studio",
    title: "UI Builder Interativo",
    description: "Monte páginas visualmente combinando blocos e exporte o código TSX limpo.",
  },
] as const;

const CATEGORIES = [
  {
    href: "/showcase/forms",
    icon: FormInput,
    title: "Formulários & Editores",
    description: "RichTextEditor (/ e A4), CascaderField, TreeSelectField, MentionsField, TagsInput, SegmentedControl, FileDropzone, SignaturePad, InlineEdit e ZodForm.",
    count: 35,
  },
  {
    href: "/showcase/display",
    icon: Layers,
    title: "Display & Vitrine",
    description: "StatCard (StatsSegmentsCard & StatsRingCard), Badge & BadgeRibbon, QRCode, Watermark, Skeleton Suite, Masonry, Callout, ImageLightbox e BentoGrid.",
    count: 32,
  },
  {
    href: "/showcase/actions",
    icon: Zap,
    title: "Ações & Feedback",
    description: "Button (Dashed/Tonal/Round), Popconfirm, Result, FloatButton & BackTop, Spin Overlay, PasswordConfirmDialog, SortableList, Modal e Toast.",
    count: 20,
  },
  {
    href: "/showcase/data",
    icon: BarChart2,
    title: "Dados, Tabelas & Gráficos",
    description: "DescriptionList (Cards, Horizontal & Table), Chart, DataTable, Spreadsheet, JsonViewer, Barcode (Code-128), TransferList, TreeView e KanbanBoard.",
    count: 13,
  },
  {
    href: "/showcase/communication",
    icon: MessageCircle,
    title: "Comunicação",
    description: "ChatWindow, ChatComposer (/ quick replies & emoji), EmailComposer (templates & fullscreen), NotificationBell e SmartObject.",
    count: 6,
  },
  {
    href: "/showcase/navigation",
    icon: Navigation,
    title: "Navegação & Layout",
    description: "Tabs (Card & Editable-Card), Splitter (Colapso 1-clique), TableOfContents, Pagination, Dock, Sidebar, Header, Breadcrumb e CommandMenu.",
    count: 15,
  },
  {
    href: "/showcase/animation",
    icon: Play,
    title: "Animação, Código & Tour",
    description: "CodeEditor (Syntax Highlight & Run), Stepper (Navigation & Dot), CodeBlock, Snippet, Marquee, Tour, TextRotate e Timeline.",
    count: 9,
  },
] as const;

export default function Home() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <section
        id="overview"
        className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 sm:px-10 py-14 sm:py-20"
      >
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge label="Lopes UI v1.5" variant="primary" size="sm" />
            <Badge label="125+ Componentes & Primitivos" variant="success" size="sm" dot />
            <Badge label="Tailwind CSS v4 + Radix UI + Tiptap v3" variant="default" size="sm" />
            <Badge label="RBAC Nativo" variant="info" size="sm" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.12] mb-4">
            Design System Corporativo{" "}
            <span className="text-indigo-600 dark:text-indigo-400">pronto para produção</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-2xl">
            Biblioteca React 19 + Next.js com Tailwind CSS v4. Acessível, tipada, com controle de acesso RBAC integrado em todos os componentes, gráficos interativos, planilhas analíticas e páginas exemplo completas.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Sparkles size={16} />
              Ver Páginas Exemplo
            </Link>
            <Link
              href="/ui-builder"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-white transition-colors"
            >
              <Wrench size={15} />
              Abrir UI Builder
            </Link>
            <Link
              href="/showcase/display"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Explorar Componentes
            </Link>
            <Snippet code="npx lopes-ui init" size="sm" className="hidden sm:inline-flex" />
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20 space-y-14">
        {/* Live Bento Highlights */}
        <section>
          <div className="mb-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1.5">
              Destaques da Versão
            </span>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              Tudo o que aplicações modernas precisam
            </h2>
          </div>

          <BentoGrid columns={3}>
            <BentoCard
              colSpan={2}
              featured
              icon={BarChart2}
              badge={<Badge label="Zero Dependências Pesadas" variant="primary" size="xs" />}
              title="Gráficos Interativos & Analytics"
              description="Componentes Chart (Bar, Area, Line e Donut), StatCard com sparklines e Spreadsheet virtualizada prontos para dashboards executivos."
              header={
                <div className="pt-1">
                  <Chart
                    type="area"
                    height={145}
                    bordered={false}
                    showLegend={false}
                    data={[
                      { label: "Jan", valor: 320 },
                      { label: "Fev", valor: 410 },
                      { label: "Mar", valor: 390 },
                      { label: "Abr", valor: 520 },
                      { label: "Mai", valor: 610 },
                      { label: "Jun", valor: 740 },
                    ]}
                    series={[{ key: "valor", label: "Receita", color: "indigo" }]}
                    valueFormatter={(v) => `R$ ${v}k`}
                  />
                </div>
              }
              cta="Ver gráficos em Dados & Tabelas"
              href="/showcase/data#charts"
            />

            <BentoCard
              icon={ShieldCheck}
              badge={<Badge label="useAccessControl" variant="success" size="xs" />}
              title="RBAC Nativo em Todos os Componentes"
              description="Passe componentId diretamente nos componentes para ocultar ou desabilitar automaticamente via AccessControlProvider."
              cta="Testar Simulador RBAC"
              href="/templates#settings"
            >
              <div className="pt-2">
                <Snippet
                  code={`<Button componentId="erp.vendas.exportar">Exportar</Button>`}
                  symbol={false}
                  size="sm"
                  className="w-full"
                />
              </div>
            </BentoCard>

            <BentoCard
              colSpan={3}
              icon={Terminal}
              badge={<Badge label="Ecossistema Completo" variant="info" size="xs" />}
              title="Componentes inspirados no melhor do Ant Design, Mantine UI, shadcn/ui e Radix UI"
              description="De seletores corporativos (CascaderField, TreeSelectField, MentionsField, QRCode ISO 18004, Watermark, Popconfirm, Result) e editores avançados (RichTextEditor com Slash Commands & Documento A4, CodeEditor) até SegmentedControl, FileDropzone e Kanban."
            >
              <Marquee duration={34} className="mt-2">
                {[
                  "CascaderField",
                  "TreeSelectField",
                  "MentionsField",
                  "TagsInput & CheckableTag",
                  "QRCode (ISO 18004)",
                  "Watermark",
                  "Popconfirm",
                  "Result",
                  "Skeleton Suite",
                  "FloatButton & BackTop",
                  "Masonry & BadgeRibbon",
                  "RichTextEditor (/ & A4)",
                  "CodeEditor",
                  "SegmentedControl",
                  "FileDropzone",
                  "SignaturePad",
                  "InlineEdit",
                  "StatsSegmentsCard",
                  "Barcode (Code-128)",
                  "DataTable",
                  "Spreadsheet",
                ].map((name) => (
                  <span
                    key={name}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {`<${name} />`}
                  </span>
                ))}
              </Marquee>
            </BentoCard>
          </BentoGrid>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Example Templates Section */}
        <section id="templates">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1.5">
                Páginas Exemplo
              </span>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                Templates Completos & UI Builder
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Aplicações reais interativas com código TSX pronto para copiar.
              </p>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Abrir central de templates</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAMPLE_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <Link
                  key={tpl.href}
                  href={tpl.href}
                  className="group flex flex-col justify-between gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <Badge label={tpl.badge} variant="default" size="xs" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tpl.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                    <span>Explorar página</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Category grid */}
        <section>
          <div className="mb-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1.5">
              Documentação Interativa
            </span>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-1">
              Categorias de Componentes
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Navegue pelos componentes por categoria com exemplos ao vivo e tabelas de propriedades.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      {cat.count} componentes
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Install */}
        <section id="install">
          <div className="mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">
              Instalação
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-3">
              Comece em 3 passos
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Instale direto do GitHub, rode o{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                init
              </code>{" "}
              para configurar dependências e o Tailwind automaticamente, e comece a importar.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-none w-7 h-7 mt-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Instale a biblioteca
                </p>
                <CodeBlock filename="terminal" language="bash" code={INSTALL_CODE} />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-7 h-7 mt-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Configure o projeto com a CLI
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Instala as dependências peer que estiverem faltando e adiciona o{" "}
                  <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">@source</code>{" "}
                  no seu{" "}
                  <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">
                    globals.css
                  </code>{" "}
                  automaticamente.
                </p>
                <CodeBlock filename="terminal" language="bash" code={INIT_CODE} />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-7 h-7 mt-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Importe e use
                </p>
                <CodeBlock filename="MyPage.tsx" language="tsx" code={USAGE_CODE} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
