"use client";

import React, { useState } from "react";
import Avatar, { AvatarGroup } from "@/components/Avatar";
import Badge from "@/components/Badge";
import Calendar, { type CalendarEvent } from "@/components/Calendar";
import Agenda, { type AgendaEvent } from "@/components/Agenda";
import Card, { CardHeader, CardBody, CardFooter } from "@/components/Card";
import Carousel from "@/components/Carousel";
import StatCard, { type SparkPoint } from "@/components/StatCard";
import ServiceStatusCard, { UptimeBar, type UptimeDay, type ServiceIncident } from "@/components/ServiceStatusCard";
import PingIndicator from "@/components/PingIndicator";
import CodeBlock from "@/components/CodeBlock";
import toast from "@/components/Toast";
import { TrendingUp, Star, ShoppingCart, Users, Package, ArrowRight, MoreHorizontal, Globe, Cpu, Layers } from "lucide-react";
import Button from "@/components/Button";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

const DEMO_SPARK_UP:   SparkPoint[] = [4,6,5,8,7,9,8,10,11,13,12,15].map((v) => ({ value: v }));
const DEMO_SPARK_DOWN: SparkPoint[] = [15,14,12,13,11,10,9,8,7,6,7,5].map((v) => ({ value: v }));
const DEMO_SPARK_ERR:  SparkPoint[] = [2,3,2,4,3,5,8,12,9,14,11,15].map((v) => ({ value: v }));

// ── Calendar / Agenda demo data ───────────────────────────────────────────────
function relDate(offsetDays: number, hhmm?: string): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  if (hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d.toISOString();
}

const DEMO_CAL_EVENTS: CalendarEvent[] = [
  { id: "e1", date: relDate(0),  title: "Stand-up",          color: "primary",  allDay: false, startTime: "09:00", endTime: "09:15" },
  { id: "e2", date: relDate(0),  title: "Code review",       color: "info",     allDay: false, startTime: "14:00", endTime: "15:00" },
  { id: "e3", date: relDate(1),  title: "Sprint planning",   color: "success",  allDay: false, startTime: "10:00", endTime: "12:00" },
  { id: "e4", date: relDate(2),  title: "Feriado",           color: "warning",  allDay: true },
  { id: "e5", date: relDate(3),  title: "Entrevista técnica",color: "danger",   allDay: false, startTime: "15:30" },
  { id: "e6", date: relDate(5),  title: "Deploy",            color: "primary",  allDay: false, startTime: "18:00" },
  { id: "e7", date: relDate(7),  title: "Reunião de board",  color: "default",  allDay: false, startTime: "11:00", endTime: "12:30" },
  { id: "e8", date: relDate(-2), title: "Retrospectiva",     color: "success",  allDay: false, startTime: "16:00", endTime: "17:00" },
];

const DEMO_AGENDA_EVENTS: AgendaEvent[] = [
  { id: "a1", date: relDate(0),  title: "Stand-up diário",    color: "primary",  startTime: "09:00", endTime: "09:15", location: "Google Meet",  attendees: [{ name: "Ana Lima" }, { name: "Bruno Costa" }, { name: "Carol D." }] },
  { id: "a2", date: relDate(0),  title: "Code review",        color: "info",     startTime: "14:00", endTime: "15:00", description: "Revisão do PR #347 – novo módulo de pagamentos.", location: "GitHub" },
  { id: "a3", date: relDate(0),  title: "1:1 com o gestor",   color: "default",  startTime: "17:00", endTime: "17:30", location: "Sala 3B" },
  { id: "a4", date: relDate(1),  title: "Sprint planning",    color: "success",  startTime: "10:00", endTime: "12:00", attendees: [{ name: "Ana Lima" }, { name: "Diego S." }, { name: "Evelyn R." }, { name: "Felipe T." }, { name: "Giovana M." }] },
  { id: "a5", date: relDate(1),  title: "Almoço de equipe",   color: "warning",  allDay: false, startTime: "12:30", endTime: "14:00", location: "Restaurante Olivia", description: "Celebração pelo lançamento do v2.0." },
  { id: "a6", date: relDate(2),  title: "Feriado nacional",   color: "warning",  allDay: true },
  { id: "a7", date: relDate(3),  title: "Entrevista técnica", color: "danger",   startTime: "15:30", endTime: "16:30", location: "Zoom", attendees: [{ name: "RH - Pedro S." }] },
  { id: "a8", date: relDate(5),  title: "Deploy v2.1",        color: "primary",  startTime: "18:00", description: "Janela de manutenção – comunicar stakeholders." },
  { id: "a9", date: relDate(7),  title: "Reunião de board",   color: "info",     startTime: "11:00", endTime: "12:30", location: "Sala de Diretoria", attendees: [{ name: "CEO" }, { name: "CTO" }, { name: "VP Eng." }] },
  { id: "a10",date: relDate(7),  title: "Treinamento DX",     color: "success",  startTime: "14:00", endTime: "17:00", description: "Workshop: Design System avançado." },
  { id: "a11",date: relDate(10), title: "OKR check-in",       color: "default",  startTime: "10:00", endTime: "11:00" },
  { id: "a12",date: relDate(12), title: "Demo day",           color: "primary",  allDay: false, startTime: "15:00", endTime: "17:00", location: "Auditório", attendees: [{ name: "Toda a empresa" }], description: "Apresentação dos resultados do trimestre." },
];

function CalendarSingleDemo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar value={date} onChange={setDate} />
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        {date ? `Selecionado: ${date.toLocaleDateString("pt-BR")}` : "Clique num dia para selecionar"}
      </p>
    </div>
  );
}

function CalendarRangeDemo() {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar rangeMode rangeValue={range} onRangeChange={setRange} firstDayOfWeek={1} />
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        {range[0] && range[1]
          ? `${range[0].toLocaleDateString("pt-BR")} → ${range[1].toLocaleDateString("pt-BR")}`
          : range[0]
          ? `Início: ${range[0].toLocaleDateString("pt-BR")} — clique no fim`
          : "Clique para marcar início do intervalo"}
      </p>
    </div>
  );
}

function mkDays(pattern: ("ok"|"deg"|"out")[], length = 90): UptimeDay[] {
  return Array.from({ length }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (length - 1 - i));
    const s = pattern[i % pattern.length];
    return {
      date: d.toISOString().slice(0, 10),
      status: s === "ok" ? "operational" : s === "deg" ? "degraded" : "outage",
    } as UptimeDay;
  });
}
const DEMO_HISTORY_OK:  UptimeDay[] = mkDays(["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"]);
const DEMO_HISTORY_DEG: UptimeDay[] = mkDays(["ok","ok","ok","deg","ok","ok","ok","ok","deg","ok"]);
const DEMO_HISTORY_ERR: UptimeDay[] = mkDays(["ok","ok","deg","ok","ok","out","ok","ok","ok","deg"]);

// Stable reference — never compute timestamps with Date.now() at module level;
// server and client evaluate module code at different wall-clock times.
const DISPLAY_REF = new Date("2026-04-05T14:00:00.000Z").getTime();
const DEMO_INCIDENTS: ServiceIncident[] = [
  { id: "i1", title: "Latência elevada no login SSO", status: "resolved",      timestamp: new Date(DISPLAY_REF - 3600000 * 2).toISOString() },
  { id: "i2", title: "Timeout intermitente no token", status: "investigating",  timestamp: new Date(DISPLAY_REF - 1800000).toISOString() },
];

export default function Page() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
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

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="ping-indicator" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Ping Indicator"
              description="Indicador animado de status de conexão com anel pulsante e rótulo opcional."
            />

            <DemoCard id="ping-indicator-statuses" title="Status">
              <div className="flex flex-wrap gap-6">
                {(["online","offline","degraded","maintenance"] as const).map((s) => (
                  <PingIndicator key={s} status={s} label size="md" />
                ))}
              </div>
            </DemoCard>

            <DemoCard id="ping-indicator-sizes" title="Tamanhos">
              <div className="flex flex-wrap items-center gap-6">
                {(["xs","sm","md","lg"] as const).map((sz) => (
                  <PingIndicator key={sz} status="online" label labelText={sz} size={sz} />
                ))}
              </div>
            </DemoCard>

            <DemoCard id="ping-indicator-no-anim" title="Sem animação">
              <div className="flex flex-wrap gap-6">
                {(["online","degraded","maintenance"] as const).map((s) => (
                  <PingIndicator key={s} status={s} label animate={false} />
                ))}
              </div>
            </DemoCard>

            <div id="ping-indicator-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["status",    "\"online\"|\"offline\"|\"degraded\"|\"maintenance\"", "\"online\"", "Estado a exibir"],
                ["label",     "boolean",   "false",     "Exibe rótulo textual"],
                ["labelText", "string",    "—",         "Override do texto do rótulo"],
                ["size",      "\"xs\"|\"sm\"|\"md\"|\"lg\"", "\"md\"", "Tamanho do indicador"],
                ["animate",   "boolean",   "true",      "Ativa/desativa o anel pulsante"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="service-status" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Monitoramento"
              title="Service Status Card"
              description="Cards de health check para a página de status do portal. Exporta também o componente standalone UptimeBar estilo Statuspage."
            />

            <DemoCard id="service-status-cards" title="Cards de status">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ServiceStatusCard
                  name="API Gateway"
                  description="REST + gRPC"
                  status="operational"
                  latencyMs={42}
                  uptimePct={99.98}
                  history={DEMO_HISTORY_OK}
                  incidents={[]}
                />
                <ServiceStatusCard
                  name="Serviço de Auth"
                  description="OAuth2 / JWT"
                  status="degraded"
                  latencyMs={320}
                  uptimePct={98.5}
                  history={DEMO_HISTORY_DEG}
                  incidents={DEMO_INCIDENTS}
                />
                <ServiceStatusCard
                  name="Banco de Dados"
                  description="PostgreSQL cluster"
                  status="operational"
                  latencyMs={8}
                  uptimePct={100}
                  history={DEMO_HISTORY_OK}
                />
                <ServiceStatusCard
                  name="CDN / Arquivos"
                  description="Cloudflare R2"
                  status="outage"
                  latencyMs={undefined}
                  uptimePct={95.1}
                  history={DEMO_HISTORY_ERR}
                  incidents={[{ id: "i3", title: "Falha na CDN leste", status: "investigating", timestamp: new Date().toISOString() }]}
                />
              </div>
            </DemoCard>

            <DemoCard id="service-status-uptime" title="UptimeBar standalone">
              <div className="p-6 space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-medium">90 dias — passe o mouse sobre os slots para ver detalhes</p>
                <UptimeBar history={DEMO_HISTORY_OK} />
                <UptimeBar history={DEMO_HISTORY_DEG} />
                <UptimeBar history={DEMO_HISTORY_ERR} />
              </div>
            </DemoCard>

            <div id="service-status-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props — ServiceStatusCard</h3>
              <PropsTable rows={[
                ["name",             "string",                  "—",     "Nome do serviço"],
                ["description",      "string",                  "—",     "Subtítulo opcional"],
                ["status",           "ServiceStatus",           "—",     "Estado atual"],
                ["latencyMs",        "number",                  "—",     "Latência em ms"],
                ["uptimePct",        "number",                  "—",     "% de uptime"],
                ["history",          "UptimeDay[]",             "—",     "Dados dos 90 dias para UptimeBar"],
                ["incidents",        "ServiceIncident[]",       "—",     "Lista de incidentes"],
                ["href",             "string",                  "—",     "Link para página de status detalhada"],
                ["refreshInterval",  "number",                  "—",     "Recarrega a cada N ms (chama onRefresh)"],
                ["onRefresh",        "() => Promise<void>",     "—",     "Callback de atualização"],
                ["loading",          "boolean",                 "false", "Exibe skeleton"],
              ]} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <strong>ServiceStatus:</strong>{" "}
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">{'"operational" | "degraded" | "outage" | "maintenance" | "unknown"'}</code>
              </p>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="stat-card" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Métricas"
              title="Stat Card"
              description="Cards de KPI para dashboards e páginas home de sub-sistemas. Suportam sparkline SVG, badge de tendência e skeleton de carregamento."
            />

            <DemoCard id="stat-card-basic" title="Básico">
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Usuários" value="12.4k" trend={{ value: 8.3 }} />
                <StatCard title="Receita"  value="R$ 47k" trend={{ value: -2.1 }} />
                <StatCard title="Pedidos"  value="1.892" trend={{ value: 14 }} />
                <StatCard title="Churn"    value="3.2%" trend={{ value: -0.5, inverted: true }} color="red" />
              </div>
            </DemoCard>

            <DemoCard id="stat-card-spark" title="Com sparkline">
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  title="Sessões"
                  value="84.2k"
                  trend={{ value: 5.7 }}
                  spark={DEMO_SPARK_UP}
                  color="indigo"
                />
                <StatCard
                  title="Tempo médio"
                  value="2m 38s"
                  trend={{ value: 12 }}
                  spark={DEMO_SPARK_UP}
                  color="emerald"
                />
                <StatCard
                  title="Erros 5xx"
                  value="142"
                  trend={{ value: 33, inverted: true }}
                  spark={DEMO_SPARK_ERR}
                  color="red"
                />
                <StatCard
                  title="Latência P95"
                  value="218ms"
                  trend={{ value: -7, inverted: true }}
                  spark={DEMO_SPARK_DOWN}
                  color="amber"
                />
              </div>
            </DemoCard>

            <DemoCard id="stat-card-colors" title="Cores & skeleton">
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(["default","indigo","blue","emerald","amber","red","violet","teal"] as const).map((c) => (
                  <StatCard key={c} title={c} value="9.876" color={c} trend={{ value: 5 }} spark={DEMO_SPARK_UP} />
                ))}
                <StatCard title="Carregando..." value="—" loading />
              </div>
            </DemoCard>

            <div id="stat-card-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["title",         "string",                               "—",        "Rótulo da métrica"],
                ["value",         "string | number",                      "—",        "Valor principal"],
                ["unit",          "string",                               "—",        "Unidade exibida após o valor"],
                ["previousValue", "string | number",                      "—",        "Valor anterior (para diff automático)"],
                ["trend",         "StatCardTrend",                        "—",        "Badge de tendência"],
                ["spark",         "SparkPoint[]",                         "—",        "Dados do sparkline { value: number }[]"],
                ["icon",          "LucideIcon",                           "—",        "Ícone decorativo"],
                ["color",         "StatCardColor",                        "'default'","Paleta de cor"],
                ["loading",       "boolean",                              "false",    "Exibe skeleton de carregamento"],
                ["onClick",       "() => void",                           "—",        "Torna o card clicável"],
              ]} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <strong>StatCardTrend:</strong>{" "}
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">{"{ pct: number; direction: 'up'|'down'; inverted?: boolean }"}</code>
              </p>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Calendar ──────────────────────────────────────────────── */}
          <section id="calendar" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Calendar</h2>
              <p className="mt-1 text-zinc-500">Componente de calendário mensal com seleção simples, intervalo de datas e visualização de eventos.</p>
            </div>

            {/* Single selection */}
            <div id="calendar-basic" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Seleção simples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <CalendarSingleDemo />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <Calendar defaultValue={new Date()} size="sm" showWeekNumbers firstDayOfWeek={1} />
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                    <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">size=&quot;sm&quot;</code> com números de semana e semana começando na segunda
                  </p>
                </div>
              </div>
            </div>

            {/* Range selection */}
            <div id="calendar-range" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Seleção de intervalo</h3>
              <div className="flex justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <CalendarRangeDemo />
              </div>
            </div>

            {/* Events – dot mode */}
            <div id="calendar-events" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Com eventos — dots</h3>
              <div className="flex justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Calendar events={DEMO_CAL_EVENTS} size="lg" eventDisplay="dot" />
              </div>
            </div>

            {/* Events – chip mode */}
            <div id="calendar-chip" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Com eventos — chips</h3>
              <div className="flex justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Calendar events={DEMO_CAL_EVENTS} eventDisplay="chip" />
              </div>
            </div>

            {/* Props */}
            <div id="calendar-props" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["value",          "Date | null",                                 "—",        "Data selecionada (controlado)"],
                ["defaultValue",   "Date | null",                                 "—",        "Data inicial (não-controlado)"],
                ["onChange",       "(date: Date) => void",                        "—",        "Callback ao selecionar dia"],
                ["rangeMode",      "boolean",                                     "false",    "Ativa seleção de intervalo"],
                ["rangeValue",     "[Date|null, Date|null]",                      "—",        "Intervalo controlado"],
                ["onRangeChange",  "(range) => void",                             "—",        "Callback de intervalo"],
                ["events",         "CalendarEvent[]",                             "[]",       "Eventos a exibir"],
                ["eventDisplay",   "'dot' | 'chip'",                              "'dot'",    "Forma de exibição dos eventos"],
                ["size",           "'sm' | 'md' | 'lg'",                          "'md'",     "Tamanho do calendário"],
                ["firstDayOfWeek", "0 | 1",                                       "0",        "0=domingo, 1=segunda"],
                ["showWeekNumbers","boolean",                                     "false",    "Exibe coluna de número de semana"],
                ["minDate",        "Date",                                         "—",        "Data mínima selecionável"],
                ["maxDate",        "Date",                                         "—",        "Data máxima selecionável"],
                ["disabledDate",   "(date: Date) => boolean",                     "—",        "Função que desabilita datas individuais"],
                ["className",      "string",                                       "—",        "Classe CSS extra na raiz"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Agenda ────────────────────────────────────────────────── */}
          <section id="agenda" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Agenda</h2>
              <p className="mt-1 text-zinc-500">Lista de eventos organizada por dia, com marcador de hoje, localização, participantes e suporte a cores.</p>
            </div>

            {/* Full demo */}
            <div id="agenda-demo" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Demo completo</h3>
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Agenda events={DEMO_AGENDA_EVENTS} daysAhead={14} dateFormat="both" />
              </div>
            </div>

            {/* Compact */}
            <div id="agenda-compact" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Tamanhos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">sm</p>
                  <Agenda events={DEMO_AGENDA_EVENTS.slice(0, 4)} size="sm" showAttendees={false} showLocation={false} />
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">md (padrão)</p>
                  <Agenda events={DEMO_AGENDA_EVENTS.slice(0, 4)} size="md" showAttendees={false} />
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">lg</p>
                  <Agenda events={DEMO_AGENDA_EVENTS.slice(0, 3)} size="lg" />
                </div>
              </div>
            </div>

            {/* Empty state */}
            <div id="agenda-empty" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Estado vazio</h3>
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Agenda events={[]} emptyMessage="Nenhum compromisso para os próximos dias." />
              </div>
            </div>

            {/* Props */}
            <div id="agenda-props" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["events",         "AgendaEvent[]",                               "required", "Lista de eventos"],
                ["startDate",      "Date",                                         "hoje",     "Primeira data a exibir"],
                ["daysAhead",      "number",                                       "0",        "Janela de dias (0 = todos)"],
                ["dateFormat",     "'relative' | 'date' | 'both'",                "'both'",   "Formato do rótulo de dia"],
                ["showTime",       "boolean",                                     "true",     "Exibe horário ao lado do evento"],
                ["showLocation",   "boolean",                                     "true",     "Exibe localização do evento"],
                ["showAttendees",  "boolean",                                     "true",     "Exibe avatares dos participantes"],
                ["size",           "'sm' | 'md' | 'lg'",                          "'md'",     "Tamanho do componente"],
                ["emptyMessage",   "string",                                       "—",        "Texto quando não há eventos"],
                ["className",      "string",                                       "—",        "Classe CSS extra na raiz"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
