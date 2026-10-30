"use client";

import React, { useState } from "react";
import Avatar, { AvatarGroup } from "@/components/Avatar";
import Badge, { BadgeRibbon } from "@/components/Badge";
import Calendar, { type CalendarEvent } from "@/components/Calendar";
import Card, { CardHeader, CardBody, CardFooter } from "@/components/Card";
import Carousel from "@/components/Carousel";
import StatCard, { StatsSegmentsCard, StatsRingCard, type SparkPoint } from "@/components/StatCard";
import ServiceStatusCard, { UptimeBar, type UptimeDay, type ServiceIncident } from "@/components/ServiceStatusCard";
import PingIndicator from "@/components/PingIndicator";
import StatusBadge from "@/components/StatusBadge";
import { DetailHeader, DetailGrid, DetailPanel, InfoField, MetricField } from "@/components/DetailLayout";
import EmojiPicker from "@/components/EmojiPicker";
import Progress, { RadialProgress } from "@/components/Progress";
import HoverCard from "@/components/HoverCard";
import { Item, ItemGroup, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/Item";
import Countdown from "@/components/Countdown";
import Diff from "@/components/Diff";
import HoverGallery, { Hover3DCard } from "@/components/HoverGallery";
import Indicator from "@/components/Indicator";
import Stack from "@/components/Stack";
import Mask from "@/components/Mask";
import { BrowserMockup, CodeMockup } from "@/components/Mockup";
import BentoGrid, { BentoCard } from "@/components/BentoGrid";
import ActionGridCard, { SwitchesCard } from "@/components/ActionGridCard";
import Callout from "@/components/Callout";
import Spoiler from "@/components/Spoiler";
import HighlightText from "@/components/HighlightText";
import ImageLightbox, { type LightboxMediaItem } from "@/components/ImageLightbox";
import QRCode, { type QRCodeModuleStyle, type QRCodeStatus } from "@/components/QRCode";
import Watermark from "@/components/Watermark";
import Skeleton from "@/components/Skeleton";
import Masonry from "@/components/Masonry";
import CodeBlock from "@/components/CodeBlock";
import toast from "@/components/Toast";
import { TrendingUp, Star, ShoppingCart, Users, Package, ArrowRight, MoreHorizontal, Globe, Cpu, Layers, MapPin, Phone, Truck, Bell } from "lucide-react";
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
  const [countdownPaused, setCountdownPaused] = useState(false);
  const [countdownBaseSec, setCountdownBaseSec] = useState(2 * 86400 + 14 * 3600 + 28 * 60 + 45);
  const [manualDigit, setManualDigit] = useState(42);

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

          <section id="badges" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Badge &amp; BadgeRibbon</h2>
              <p className="mt-1 text-zinc-500">Etiquetas compactas para status, categorias, indicadores pulsantes inline (<code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">status</code>) e fitas promocionais 3D de canto (<code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">BadgeRibbon</code>).</p>
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

            {/* Badge status + BadgeRibbon unified inside #badges */}
            <div id="badge-status-ribbon" className="space-y-5 scroll-mt-20">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Modo Status Inline (<code className="text-sm font-mono">status=&quot;processing&quot;</code>) &amp; Fitas <code className="text-sm font-mono">BadgeRibbon</code>
              </h3>
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-6">
                <div className="flex flex-wrap items-center gap-6">
                  <Badge status="processing" text="Em rota de entrega (RO)" />
                  <Badge status="success" text="Montagem concluída" />
                  <Badge status="warning" text="Aguardando confirmação 127V" />
                  <Badge status="error" text="Endereço pendente" />
                  <Badge status="default" text="Rascunho de orçamento" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <BadgeRibbon text="Mais Vendido RO" variant="primary">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-4 pt-5 space-y-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pr-16">Sofá Retrátil 3 Lugares</p>
                      <p className="text-xs text-zinc-500">Molas ensacadas + espuma D-33 Soft · Porto Velho (69)</p>
                    </div>
                  </BadgeRibbon>

                  <BadgeRibbon text="Inverter 127V" variant="success">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-4 pt-5 space-y-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pr-16">Geladeira Duplex 450L</p>
                      <p className="text-xs text-zinc-500">Pronta entrega no CD Manaus (92)</p>
                    </div>
                  </BadgeRibbon>

                  <BadgeRibbon text="10x Sem Juros" variant="warning" placement="start">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-4 pt-7 space-y-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Colchão King Pocket</p>
                      <p className="text-xs text-zinc-500">Fita alinhada à esquerda (<code className="font-mono">placement=&quot;start&quot;</code>)</p>
                    </div>
                  </BadgeRibbon>
                </div>
              </div>
            </div>

            <div id="badge-props" className="space-y-4">
              <PropsTable rows={[
                ["label",       "string",        "—",         "Texto exibido na pílula"],
                ["variant",     "BadgeVariant",  "'default'", "Esquema de cor"],
                ["status",      "'success'|'processing'|'error'|'warning'|'default'", "—", "Modo indicador inline (com anel pulsante em processing)"],
                ["text",        "ReactNode",     "—",         "Texto acompanhando o indicador no modo status"],
                ["size",        "'xs'|'sm'|'md'|'lg'", "'md'", "Tamanho"],
                ["solid",       "boolean",       "false",     "Fundo sólido em vez de suave"],
                ["square",      "boolean",       "false",     "Forma retangular em vez de pílula"],
                ["dot",         "boolean",       "false",     "Ponto colorido antes do texto"],
                ["icon",        "LucideIcon",    "—",         "Ícone antes do texto"],
                ["onRemove",    "() => void",    "—",         "Exibe × e chama ao clicar (badge removível)"],
                ["BadgeRibbon", "text, variant, placement ('end'|'start')", "'end'", "Fita 3D dobrada no canto superior do card"],
                ["className",   "string",        "—",         "Classes adicionais"],
                ["componentId", "string",        "—",         "Identificador de controle de acesso"],
              ]} />
              <CodeBlock code={`import Badge, { BadgeRibbon } from "@/components/Badge";
import { Star } from "lucide-react";

<Badge label="Sucesso" variant="success" />
<Badge label="Sólido" variant="primary" solid />
<Badge status="processing" text="Em rota de entrega" />
<BadgeRibbon text="Mais Vendido" variant="primary">
  <Card>...</Card>
</BadgeRibbon>`} />
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

          <section id="stat-card" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Métricas & KPIs"
              title="StatCard, StatsSegmentsCard & StatsRingCard"
              description="Família completa de cartões de KPI para dashboards: StatCard (com sparkline SVG e tendência), StatsSegmentsCard (distribuição percentual multicategoria) e StatsRingCard (progresso radial de metas)."
            />

            <DemoCard id="stat-card-basic" title="StatCard — Básico">
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Usuários" value="12.4k" trend={{ value: 8.3 }} />
                <StatCard title="Receita"  value="R$ 47k" trend={{ value: -2.1 }} />
                <StatCard title="Pedidos"  value="1.892" trend={{ value: 14 }} />
                <StatCard title="Churn"    value="3.2%" trend={{ value: -0.5, inverted: true }} color="red" />
              </div>
            </DemoCard>

            <DemoCard id="stat-card-spark" title="StatCard — Com sparkline">
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

            <DemoCard id="stat-card-segments-ring" title="Variantes Analíticas — StatsSegmentsCard & StatsRingCard">
              <div className="p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                <StatsSegmentsCard
                  title="Mix de Vendas por Departamento"
                  subtitle="Unidades RO & AM"
                  totalValue="R$ 1.842.500"
                  trend={{ value: 14.8, label: "vs. mês anterior" }}
                  segments={[
                    { label: "Estofados & Salas", value: "R$ 773.850", share: 42, color: "indigo" },
                    { label: "Eletrodomésticos", value: "R$ 571.175", share: 31, color: "emerald" },
                    { label: "Colchões & Quartos", value: "R$ 331.650", share: 18, color: "amber" },
                    { label: "Cozinhas", value: "R$ 165.825", share: 9, color: "teal" },
                  ]}
                />

                <div className="grid grid-cols-1 gap-4">
                  <StatsRingCard
                    title="Entregas & Montagens no Prazo (SLA)"
                    value="1.428"
                    subtitle="pedidos entregues no mês"
                    progress={89}
                    color="emerald"
                    stats={[
                      { label: "Rondônia (RO)", value: "812 entregas" },
                      { label: "Amazonas (AM)", value: "616 entregas" },
                      { label: "Em rota hoje", value: "64 caminhões" },
                    ]}
                  />
                </div>
              </div>
            </DemoCard>

            <DemoCard id="stat-card-colors" title="Paletas de Cor & Skeleton">
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

          {/* ── StatusBadge ───────────────────────────────────────────── */}
          <section id="status-badge" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Indicadores"
              title="StatusBadge"
              description="Badge semântico padronizado para status de registros, pedidos de entrega e situações operacionais com ponto indicador (dot), efeito pulse e variante sólida."
            />

            <DemoCard id="status-badge-tones" title="Tons semânticos & tamanhos">
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge tone="success" label="Operacional" />
                  <StatusBadge tone="info" label="Sincronizando" pulse />
                  <StatusBadge tone="warning" label="Aguardando Revisão" />
                  <StatusBadge tone="danger" label="Falha Crítica" />
                  <StatusBadge tone="primary" label="Em Processamento" />
                  <StatusBadge tone="brand" label="Plano Enterprise" />
                  <StatusBadge tone="neutral" label="Rascunho" />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <StatusBadge tone="success" solid size="xs" label="XS Solid" />
                  <StatusBadge tone="info" solid size="sm" label="SM Solid" />
                  <StatusBadge tone="primary" solid size="md" label="MD Solid" />
                  <StatusBadge tone="brand" solid size="lg" label="LG Solid" />
                </div>
              </div>
            </DemoCard>

            <div id="status-badge-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["tone",    "'success'|'warning'|'danger'|'info'|'neutral'|'primary'|'brand'", "'neutral'", "Tom semântico da badge"],
                ["size",    "'xs'|'sm'|'md'|'lg'",                                             "'sm'",      "Tamanho do componente"],
                ["dot",     "boolean",                                                         "true",      "Exibe o círculo colorido à esquerda"],
                ["pulse",   "boolean",                                                         "false",     "Anima o ponto indicador com ping"],
                ["solid",   "boolean",                                                         "false",     "Fundo com cor sólida de alto contraste"],
                ["label",   "ReactNode",                                                       "—",         "Texto da badge"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── DetailLayout ──────────────────────────────────────────── */}
          <section id="detail-layout" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Ficha Cadastral"
              title="DetailLayout"
              description="Conjunto de primitivos padronizados (DetailHeader, DetailGrid, DetailPanel, InfoField, MetricField e DetailTabs) para telas e modais de visualização de registros."
            />

            <DemoCard id="detail-layout-demo" title="Ficha do Serviço — Lopes UI Cloud">
              <div className="p-6 space-y-6 bg-white dark:bg-zinc-900 rounded-xl">
                <DetailHeader
                  titleLabel="Catálogo de Serviços · SRV #API-6901"
                  titleValue="Gateway de Autenticação & RBAC Multi-Tenant v2"
                  avatar={<Avatar initials="SI" size="lg" />}
                  badge={<StatusBadge tone="success" label="Em Linha" />}
                />

                <DetailPanel title="Indicadores de Estoque & Vendas" icon={TrendingUp}>
                  <DetailGrid columns={4}>
                    <MetricField label="Disponibilidade (SLA)" value="99,98%" variant="success" subtext="Últimos 90 dias" />
                    <MetricField label="Latência Média (p95)" value="18 ms" variant="info" subtext="Região sa-east-1" />
                    <MetricField label="Custo Mensal Estimado" value="R$ 1.490,00" variant="primary" subtext="Faturamento consolidado" />
                    <MetricField label="Retenção de Backups" value="30 dias" variant="default" subtext="Snapshots diários" />
                  </DetailGrid>
                </DetailPanel>

                <DetailPanel title="Especificações Técnicas" icon={Package}>
                  <DetailGrid columns={4}>
                    <InfoField label="Mantenedor" value="Equipe Plataforma Lopes UI" />
                    <InfoField label="Runtime" value="Node.js 22 LTS · Edge Ready" />
                    <InfoField label="Criptografia" value="TLS 1.3 + AES-256-GCM" highlight />
                    <InfoField label="Auto-Scaling?" value="Ativo (2 a 16 réplicas)" variant="info" />
                  </DetailGrid>
                </DetailPanel>
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── EmojiPicker ───────────────────────────────────────────── */}
          <section id="emoji-picker" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Interação"
              title="EmojiPicker"
              description="Seletor de emojis categorizado com busca em português, reações rápidas e histórico de uso recente."
            />

            <DemoCard id=" emoji-picker-demo" title="Seletor interativo">
              <div className="p-6 flex justify-center">
                <EmojiPicker
                  autoFocus={false}
                  onSelectEmoji={(emoji) => toast(`Emoji selecionado: ${emoji}`)}
                />
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Progress & RadialProgress ─────────────────────────────── */}
          <section id="progress" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Progresso"
              title="Progress & RadialProgress"
              description="Barras de progresso lineares (determinadas, indeterminadas e listradas) e indicadores circulares (RadialProgress) com espessura e diâmetro customizáveis."
            />

            <DemoCard id="progress-demo" title="Barras Lineares e Progresso Circular (RadialProgress)">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <Progress label="Cobertura de Testes Unitários" value={84} showValue tone="success" />
                  <Progress label="Migração de Componentes v2" value={68} showValue tone="primary" striped />
                  <Progress label="Uso de Cota de Armazenamento" value={91} showValue tone="warning" />
                  <Progress label="Sincronizando Índices..." indeterminate tone="info" size="sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-6">
                  <div className="flex flex-col items-center justify-center gap-2.5 text-center">
                    <RadialProgress value={84} tone="success" size="lg" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Uptime (84%)</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2.5 text-center">
                    <RadialProgress value={72} tone="primary" size="lg" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Cache Hit (72%)</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2.5 text-center">
                    <RadialProgress value={95} tone="warning" size="lg" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">SLA Global</span>
                  </div>
                </div>
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── HoverCard ─────────────────────────────────────────────── */}
          <section id="hover-card" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Preview Contextual"
              title="HoverCard"
              description="Cartão flutuante ativado ao passar o mouse (hover) com delay inteligente para pré-visualizar fichas de usuários, repositórios ou serviços sem sair da tela."
            />

            <DemoCard id="hover-card-demo" title="Passe o mouse sobre os gatilhos abaixo para inspecionar">
              <div className="flex flex-wrap items-center gap-4">
                <HoverCard
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                    >
                      <Globe size={16} />
                      <span>@lopes-ui/core — Design System</span>
                    </button>
                  }
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Lopes UI — Core Package</span>
                      <StatusBadge tone="success" size="xs" label="Estável" />
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Biblioteca de componentes React com acessibilidade WAI-ARIA, suporte a temas e RBAC nativo.
                    </p>
                    <div className="flex items-center gap-4 pt-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1"><Layers size={12} /> 75+ Componentes</span>
                      <span className="inline-flex items-center gap-1"><Cpu size={12} /> TypeScript Strict</span>
                    </div>
                  </div>
                </HoverCard>

                <HoverCard
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                    >
                      <Globe size={16} />
                      <span>Cluster sa-east-1 — Produção</span>
                    </button>
                  }
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Gateway de Produção Sul</span>
                      <StatusBadge tone="info" size="xs" label="Multi-AZ" />
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Balanceamento automático com replicação síncrona e monitoramento de latência em tempo real.
                    </p>
                    <div className="flex items-center gap-4 pt-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1"><TrendingUp size={12} /> SLA 99,99%</span>
                    </div>
                  </div>
                </HoverCard>
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Item & ItemGroup ──────────────────────────────────────── */}
          <section id="item-list" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Listas Estruturadas"
              title="Item & ItemGroup"
              description="Primitivos de linha de lista (ItemGroup, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions) para listagens de recursos, integrações e configurações."
            />

            <DemoCard id="item-list-demo" title="Módulos e Integrações Ativas">
              <ItemGroup className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                <Item interactive>
                  <ItemMedia variant="icon"><Package size={18} /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <span>Autenticação OAuth 2.0 & SSO Corporativo</span>
                      <Badge variant="success" size="sm" label="Ativo" />
                    </ItemTitle>
                    <ItemDescription>
                      Tokens JWT com rotação automática · MFA habilitado para todos os administradores
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">v2.4.0</span>
                    <Button size="sm" variant="outline" onClick={() => toast("Configurações abertas")}>Configurar</Button>
                  </ItemActions>
                </Item>

                <Item interactive>
                  <ItemMedia variant="icon"><Layers size={18} /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <span>Motor de Webhooks & Eventos Assíncronos</span>
                      <Badge variant="info" size="sm" label="Novo" />
                    </ItemTitle>
                    <ItemDescription>
                      Fila com retentativa exponencial · Assinatura HMAC-SHA256 · Logs de entrega em tempo real
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">v1.8.2</span>
                    <Button size="sm" variant="outline" onClick={() => toast("Logs de webhook abertos")}>Inspecionar</Button>
                  </ItemActions>
                </Item>
              </ItemGroup>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Countdown ─────────────────────────────────────────────── */}
          <section id="countdown" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Temporizador"
              title="Countdown"
              description="Contador regressivo animado com rolagem vertical por dígito (odômetro GPU translate3d), ideal para lançamentos de releases, janelas de manutenção e SLAs."
            />

            <DemoCard id="countdown-demo" title="Contagem Regressiva Interativa (Odômetro em Tempo Real)">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <span className={`inline-block size-2 rounded-full ${countdownPaused ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                    <span>{countdownPaused ? "Temporizador pausado" : "Rolagem de odômetro ativa (1 tick/seg)"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={countdownPaused ? "primary" : "outline"}
                      onClick={() => setCountdownPaused((p) => !p)}
                    >
                      {countdownPaused ? "Retomar" : "Pausar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCountdownBaseSec((s) => Math.max(10, s - 15))}
                    >
                      -15s
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCountdownBaseSec((s) => s + 15)}
                    >
                      +15s
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCountdownPaused(false);
                        setCountdownBaseSec(2 * 86400 + 14 * 3600 + 28 * 60 + 45);
                      }}
                    >
                      Resetar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-6">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Variante Boxed (Odômetro · Tone Primary)</span>
                    <Countdown
                      seconds={countdownBaseSec}
                      paused={countdownPaused}
                      size="lg"
                      variant="boxed"
                      tone="primary"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-6">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Variante Cards (Alto Contraste · Horas/Min/Seg)</span>
                    <Countdown
                      seconds={countdownBaseSec % 86400}
                      paused={countdownPaused}
                      showDays={false}
                      size="lg"
                      variant="cards"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4">
                    <span className="text-[11px] font-medium text-zinc-400">Variante Inline (SLA)</span>
                    <Countdown
                      seconds={countdownBaseSec % 3600}
                      paused={countdownPaused}
                      showDays={false}
                      showHours={false}
                      size="md"
                      variant="inline"
                      tone="success"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4">
                    <span className="text-[11px] font-medium text-zinc-400">Variante Compact (Relógio Digital)</span>
                    <Countdown
                      seconds={countdownBaseSec % 86400}
                      paused={countdownPaused}
                      showDays={false}
                      size="md"
                      variant="compact"
                      tone="warning"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4">
                    <span className="text-[11px] font-medium text-zinc-400">Dígito Controlado (`value={manualDigit}`)</span>
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="outline" onClick={() => setManualDigit((d) => (d <= 0 ? 99 : d - 1))}>-1</Button>
                      <Countdown value={manualDigit} size="lg" tone="primary" />
                      <Button size="sm" variant="outline" onClick={() => setManualDigit((d) => (d >= 99 ? 0 : d + 1))}>+1</Button>
                    </div>
                  </div>
                </div>
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Diff (Before / After) ─────────────────────────────────── */}
          <section id="diff" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Comparador Visual"
              title="Diff (Antes & Depois)"
              description="Comparador interativo com barra deslizante (drag/touch/teclado) para contrastar temas claro/escuro, antes/depois de layouts ou revisões visuais."
            />

            <DemoCard id="diff-demo" title="Arraste o divisor central para comparar os temas">
              <Diff
                aspectClassName="h-64 sm:h-72"
                beforeLabel="Tema Claro (Light Mode)"
                afterLabel="Tema Escuro (Dark Mode)"
                before={
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 text-amber-950 p-6 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Lopes UI · Light Theme</span>
                    <h4 className="mt-2 text-2xl font-black">Superfície Clara de Alto Contraste</h4>
                    <p className="mt-1 text-sm text-amber-800">Tokens otimizados para legibilidade em ambientes iluminados</p>
                  </div>
                }
                after={
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-950 text-white p-6 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Lopes UI · Dark Theme</span>
                    <h4 className="mt-2 text-2xl font-black">Superfície Escura Zinc-950</h4>
                    <p className="mt-1 text-sm text-zinc-300">Conforto visual prolongado para operação contínua</p>
                  </div>
                }
              />
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── HoverGallery & Hover3DCard ────────────────────────────── */}
          <section id="hover-gallery" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Vitrine Interativa"
              title="HoverGallery & Hover3DCard"
              description="Galeria interativa que alterna slides conforme o movimento horizontal do cursor (HoverGallery) e cartão com perspectiva 3D e reflexo de luz (Hover3DCard)."
            />

            <DemoCard id="hover-gallery-demo" title="Mova o mouse horizontalmente sobre a galeria e teste a inclinação 3D">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">HoverGallery (4 painéis ao mover o cursor)</p>
                  <HoverGallery
                    aspectClassName="aspect-video"
                    images={[
                      {
                        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='%23064e3b'/><text x='50%' y='45%' fill='%236ee7b7' font-family='sans-serif' font-size='14' text-anchor='middle'>SLIDE 1 / 4 · VISÃO GERAL</text><text x='50%' y='58%' fill='white' font-family='sans-serif' font-weight='bold' font-size='20' text-anchor='middle'>Dashboard Analítico em Tempo Real</text></svg>",
                        label: "Visão Geral",
                      },
                      {
                        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='%231e1b4b'/><text x='50%' y='45%' fill='%23a5b4fc' font-family='sans-serif' font-size='14' text-anchor='middle'>SLIDE 2 / 4 · COMPONENTES</text><text x='50%' y='58%' fill='white' font-family='sans-serif' font-weight='bold' font-size='20' text-anchor='middle'>DataTables, Forms & Command Palette</text></svg>",
                        label: "Componentes",
                      },
                      {
                        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='%23451a03'/><text x='50%' y='45%' fill='%23fcd34d' font-family='sans-serif' font-size='14' text-anchor='middle'>SLIDE 3 / 4 · SEGURANÇA</text><text x='50%' y='58%' fill='white' font-family='sans-serif' font-weight='bold' font-size='20' text-anchor='middle'>Controle de Acesso RBAC Integrado</text></svg>",
                        label: "Segurança RBAC",
                      },
                      {
                        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='45%' fill='%23d4d4d8' font-family='sans-serif' font-size='14' text-anchor='middle'>SLIDE 4 / 4 · PERFORMANCE</text><text x='50%' y='58%' fill='white' font-family='sans-serif' font-weight='bold' font-size='20' text-anchor='middle'>Tree-Shakeable ESM & CJS Bundles</text></svg>",
                        label: "Performance",
                      },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Hover3DCard (Inclinação 3D com reflexo glare)</p>
                  <Hover3DCard className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" solid label="Lopes UI Enterprise" />
                      <span className="font-mono text-xs text-zinc-400">v2.0 LTS</span>
                    </div>
                    <div className="my-4 space-y-2">
                      <p className="text-xl font-bold tracking-tight">Design System Corporativo</p>
                      <p className="text-xs leading-relaxed text-zinc-300">
                        Componentes acessíveis, tipagem estrita em TypeScript, suporte completo a Dark Mode e controle de permissões RBAC.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-indigo-300">
                      <span>LICENÇA ENTERPRISE</span>
                      <span>•••• 2026</span>
                    </div>
                  </Hover3DCard>
                </div>
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Indicator, Stack, Mask & AspectRatio ──────────────────── */}
          <section id="indicator-stack-mask" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Utilitários Visuais"
              title="Indicator, Stack, Mask & AspectRatio"
              description="Posicionamento de badges nos 9 cantos (Indicator), empilhamento 3D de notificações/cartões (Stack), máscaras geométricas (Mask) e proporção fixa (AspectRatio)."
            />

            <DemoCard id="indicator-stack-mask-demo" title="Exemplos Combinados">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Indicator (Badge de Canto + Ping)</p>
                  <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                    <Indicator badge="12" tone="danger" ping>
                      <Button variant="outline" size="sm" leftIcon={<Bell size={15} />}>Alertas Ativos</Button>
                    </Indicator>
                    <Indicator badge="NOVO" tone="primary" position="top-end">
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs">
                        Módulo Analytics
                      </div>
                    </Indicator>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Stack (Pilha 3D — passe o mouse)</p>
                  <div className="py-1">
                    <Stack fanOnHover>
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3.5 shadow-sm">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">1. Deploy #409 Concluído</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Ambiente de produção atualizado sem downtime</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3.5 shadow-sm">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">2. Backup Automático</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Snapshot diário salvo no cluster primário</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3.5 shadow-sm">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">3. Auditoria de Segurança</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Verificação de certificados TLS concluída</p>
                      </div>
                    </Stack>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Mask (Formas Geométricas)</p>
                  <div className="flex flex-wrap items-center justify-center gap-3 py-4">
                    {(["squircle", "hexagon", "diamond", "star", "heart"] as const).map((shape) => (
                      <Mask key={shape} shape={shape} className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-xs">
                        {shape.slice(0, 3)}
                      </Mask>
                    ))}
                  </div>
                </div>
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Mockups (Browser, Phone, Code) ────────────────────────── */}
          <section id="mockups" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Molduras de Apresentação"
              title="BrowserMockup, PhoneMockup & CodeMockup"
              description="Molduras de navegador web, smartphone e terminal CLI para pré-visualização de portais, aplicações e diagnósticos."
            />

            <DemoCard id="mockups-demo" title="BrowserMockup & CodeMockup">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <BrowserMockup url="https://app.lopes-ui.dev/dashboard">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Lopes UI Platform</span>
                      <Badge variant="primary" size="sm" label="v2.0" />
                    </div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Painel de Controle Unificado
                    </h4>
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Monitore métricas de serviços, gerencie permissões RBAC e configure fluxos de trabalho em uma única interface.
                    </p>
                  </div>
                </BrowserMockup>

                <CodeMockup
                  title="lopes-ui-cli"
                  lines={[
                    { prefix: "$", text: "npx lopes-ui doctor --check" },
                    { prefix: ">", text: "Verificando tokens de tema e dependências...", tone: "info" },
                    { prefix: "✓", text: "Tailwind CSS v4 + Design Tokens: OK", tone: "success" },
                    { prefix: "✓", text: "Pacote ESM/CJS e declarações TypeScript: OK", tone: "success" },
                  ]}
                />
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── BentoGrid & BentoCard ─────────────────────────────────── */}
          <section id="bento-grid" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Layout Assimétrico"
              title="BentoGrid & BentoCard"
              description="Grade estilo Bento Box responsiva com suporte a múltiplos tamanhos de coluna/linha (colSpan, rowSpan), ícones, badges, cabeçalhos gráficos e links de chamada para ação (CTA)."
            />

            <DemoCard id="bento-grid-demo" title="Bento Grid de Recursos da Plataforma">
              <BentoGrid columns={3}>
                <BentoCard
                  colSpan={2}
                  featured
                  icon={Layers}
                  badge={<Badge label="Arquitetura Modular" variant="primary" size="xs" />}
                  title="Mais de 80 Componentes Prontos para Produção"
                  description="Construídos sobre Radix UI e Tailwind CSS v4 com suporte nativo a temas Light/Dark, validação Zod e árvore de pacotes otimizada (tree-shakeable)."
                  cta="Explorar Templates"
                  href="/templates"
                />
                <BentoCard
                  icon={Cpu}
                  badge={<Badge label="Zero Config" variant="success" size="xs" />}
                  title="CLI Inteligente"
                  description="Configure dependências peer e variáveis de tema em segundos com npx lopes-ui init."
                  cta="Ver documentação"
                  href="/#install"
                />
                <BentoCard
                  icon={Globe}
                  title="Acessibilidade WCAG AA"
                  description="Navegação completa por teclado, foco gerenciado e atributos ARIA em todos os componentes interativos."
                />
                <BentoCard
                  colSpan={2}
                  icon={TrendingUp}
                  badge={<Badge label="RBAC" variant="info" size="xs" />}
                  title="Controle de Acesso Integrado (useAccessControl)"
                  description="Condicione a visibilidade ou habilitação de qualquer botão, campo ou painel diretamente via componentId e AccessControlProvider."
                  cta="Testar Simulador RBAC"
                  href="/templates#settings"
                />
              </BentoGrid>
            </DemoCard>

            <PropsTable
              rows={[
                ["columns", "2 | 3 | 4", "3", "Número de colunas do BentoGrid em telas desktop"],
                ["colSpan", "1 | 2 | 3", "1", "Quantidade de colunas ocupadas pelo BentoCard"],
                ["rowSpan", "1 | 2", "1", "Quantidade de linhas ocupadas pelo BentoCard"],
                ["featured", "boolean", "false", "Aplica gradiente e borda em destaque indigo"],
                ["cta", "string", "—", "Texto do link ou botão de ação no rodapé do card"],
              ]}
            />
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── ActionGridCard & SwitchesCard (Mantine UI) ───────────── */}
          <section id="action-grid-switches" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Mantine UI Cards"
              title="ActionGridCard & SwitchesCard"
              description="Cartão de ações rápidas em grade colorida (ActionsGrid) e painel estruturado de preferências com interruptores acessíveis (SwitchesCard)."
            />

            <DemoCard id="action-grid-demo" title="Atalhos Operacionais da Loja & Preferências de Logística">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <ActionGridCard
                  title="Central Operacional — Móveis & Eletro"
                  subtitle="Acesso rápido às rotinas das unidades RO e AM"
                  columns={3}
                  items={[
                    { id: "cat", label: "Showroom & Salas", icon: Layers, color: "indigo", onClick: () => toast("Abrindo catálogo de estofados") },
                    { id: "frete", label: "Rota de Entregas", icon: Truck, color: "emerald", badge: "12", onClick: () => toast("12 entregas em rota hoje") },
                    { id: "mont", label: "Agendar Montagem", icon: Package, color: "amber", onClick: () => toast("Agenda de montadores aberta") },
                    { id: "cli", label: "Clientes & Pós-Venda", icon: Users, color: "blue", onClick: () => toast("Central de atendimento") },
                    { id: "filiais", label: "Lojas RO & AM", icon: MapPin, color: "teal", onClick: () => toast("Porto Velho, Ji-Paraná e Manaus") },
                    { id: "sac", label: "WhatsApp (69)/(92)", icon: Phone, color: "violet", onClick: () => toast("Canal WhatsApp conectado") },
                  ]}
                />

                <SwitchesCard
                  title="Preferências da Filial"
                  description="Configure notificações automáticas de estoque, entregas e montagem."
                  icon={Bell}
                  items={[
                    {
                      id: "alerta-estoque",
                      title: "Alerta de Estoque Mínimo (Colchões & Eletro)",
                      description: "Notifica compras quando itens curva A atingirem o ponto de reposição.",
                      badge: "Recomendado",
                      defaultChecked: true,
                    },
                    {
                      id: "rota-auto",
                      title: "Confirmação de Entrega via WhatsApp",
                      description: "Dispara lembrete automático para clientes DDD (69) e (92) no dia da rota.",
                      defaultChecked: true,
                    },
                    {
                      id: "montagem-expressa",
                      title: "Agendamento Automático de Montador",
                      description: "Reserva equipe de montagem assim que a NF-e de móveis for faturada.",
                      defaultChecked: false,
                    },
                  ]}
                />
              </div>
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Callout, Spoiler & HighlightText ─────────────────────── */}
          <section id="callout-spoiler-highlight" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Conteúdo & Leitura"
              title="Callout, Spoiler & HighlightText"
              description="Blocos editoriais semânticos recolhíveis (Callout), truncamento suave de altura com gradiente (Mantine Spoiler) e realce de texto insensível a acentos para português brasileiro (HighlightText)."
            />

            <DemoCard id="callout-spoiler-demo" title="Callouts Semânticos, Spoiler de Ficha Técnica & Busca sem Acentos">
              <CalloutSpoilerHighlightDemo />
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── ImageLightbox ────────────────────────────────────────── */}
          <section id="image-lightbox" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Mídia & Documentos"
              title="ImageLightbox"
              description="Visualizador modal e inline de imagens e PDFs com zoom de 25% a 400% (roda do mouse ou duplo clique), arraste panorâmico (pan 2D), rotação 90°, espelhamento, filmstrip de miniaturas e atalhos de teclado."
            />

            <DemoCard id="image-lightbox-demo" title="Galeria de Ambientes — Clique em uma foto para abrir o Lightbox">
              <ImageLightboxShowcaseDemo />
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── QRCode (ISO/IEC 18004 Pure TS Encoder) ───────────────── */}
          <section id="qrcode" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Ant Design & Pagamentos"
              title="QRCode (ISO/IEC 18004 Vetorial + PNG)"
              description="Codificador QR Code puro em TypeScript (zero dependências externas) com correção Reed-Solomon (L, M, Q, H), 3 estilos de módulo (squares, rounded, dots), logo central com zona de silêncio automática, estados de ciclo de vida (active, expired, loading, scanned) e exportação PNG."
            />

            <DemoCard id="qrcode-demo" title="PIX Copia-e-Cola & Etiqueta Digital de Showroom (Interativo)">
              <QRCodeShowcaseDemo />
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Watermark ────────────────────────────────────────────── */}
          <section id="watermark" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Segurança Documental"
              title="Watermark (Marca d'Água Anti-Adulteração)"
              description="Container com estampa diagonal em malha alternada (2×2 brick grid), adaptação automática de contraste Light/Dark e proteção MutationObserver que restaura a marca d'água caso removida via DevTools."
            />

            <DemoCard id="watermark-demo" title="Termo de Entrega & Garantia Protegido por Marca d'Água">
              <WatermarkShowcaseDemo />
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Skeleton Compound Suite ──────────────────────────────── */}
          <section id="skeleton-suite" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Ant Design Placeholders"
              title="Skeleton (Suite Composta: Avatar, Input, Button, Image, Card & Table)"
              description="Wrapper declarativo <Skeleton loading={...}> que alterna suavemente entre o wireframe animado (pulse ou wave shimmer) e o conteúdo real, além de subcomponentes dedicados."
            />

            <DemoCard id="skeleton-suite-demo" title="Alternância ao Vivo (loading) & Subcomponentes Wave Shimmer">
              <SkeletonShowcaseDemo />
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          {/* ── Masonry Waterfall Layout ─────────────────────────────── */}
          <section id="masonry" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
            <SectionHeader
              label="Layout em Cascata"
              title="Masonry"
              description="Grade multi-colunas balanceada dinamicamente por altura (shortest-column waterfall), ideal para vitrines de ambientes, cartões de tamanhos variados e galerias editoriais."
            />

            <DemoCard id="masonry-demo" title="Vitrine de Ambientes em Cascata Multi-Colunas">
              <MasonryAndRibbonShowcaseDemo />
            </DemoCard>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}


function CalloutSpoilerHighlightDemo() {
  const [query, setQuery] = useState("sofa rondonia colchao");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Callout variant="info" title="Conforto e qualidade para o seu lar">
          Entregas agendadas com montagem própria para toda a rede em{" "}
          <strong>Porto Velho, Ji-Paraná (RO)</strong> e <strong>Manaus (AM)</strong>.
        </Callout>

        <Callout
          variant="warning"
          title="Verificação de Voltagem (Recolhível)"
          collapsible
          defaultOpen
        >
          Confirme a tensão elétrica do imóvel (127V em Manaus e Porto Velho) antes de finalizar o pedido de refrigeradores, lava e seca ou micro-ondas.
        </Callout>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        {/* Spoiler */}
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-surface p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Spoiler — Especificação Técnica Expansível
          </p>
          <Spoiler maxHeight={78} showLabel="Ler ficha técnica completa" hideLabel="Recolher ficha">
            <div className="space-y-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>
                <strong>Conjunto Sala &amp; Quarto Premium:</strong> Estrutura em madeira de reflorestamento tratada e seca em estufa, percintas elásticas italianas de alta resistência e espuma D-33 Soft certificada.
              </p>
              <p>
                <strong>Dimensões &amp; Montagem:</strong> Largura 2,30m × Profundidade aberto 1,75m × Altura 1,05m. Módulos bipartidos que facilitam o acesso em elevadores residenciais e escadas.
              </p>
              <p>
                <strong>Garantia &amp; Assistência:</strong> 12 meses de cobertura estrutural nas praças de Rondônia e Amazonas com atendimento direto pelo SAC (69) e (92).
              </p>
            </div>
          </Spoiler>
        </div>

        {/* HighlightText */}
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              HighlightText — Busca sem Acentos (pt-BR)
            </p>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite termos (ex: sofa rondonia eletro)..."
            className="w-full rounded-lg border border-input-border bg-input px-3 py-1.5 text-xs text-input-foreground focus:outline-none focus:border-ring"
          />
          <HighlightText
            as="p"
            tone="amber"
            className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
            highlight={query.split(/\s+/).filter(Boolean)}
            text="Nosso showroom de Móveis & Eletro oferece Sofá Retrátil, Colchão de Molas Ensacadas, Guarda-Roupa e Eletrodomésticos com entrega rápida em Rondônia (Porto Velho e Ji-Paraná) e no Amazonas (Manaus)."
          />
        </div>
      </div>
    </div>
  );
}

const SHOWROOM_GALLERY: LightboxMediaItem[] = [
  {
    id: "sala",
    title: "Showroom Sala de Estar — Sofá Retrátil & Painel Ripado",
    caption: "Unidade Flagship Porto Velho (RO) · Linha Conforto",
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#4338ca"/></linearGradient></defs><rect width="960" height="600" fill="url(#g1)"/><rect x="110" y="130" width="740" height="240" rx="28" fill="#e0e7ff" opacity="0.16"/><rect x="180" y="310" width="600" height="145" rx="24" fill="#f8fafc"/><rect x="155" y="340" width="60" height="115" rx="18" fill="#cbd5e1"/><rect x="745" y="340" width="60" height="115" rx="18" fill="#cbd5e1"/><text x="480" y="210" fill="#ffffff" font-family="system-ui,sans-serif" font-size="34" font-weight="800" text-anchor="middle">Sala de Estar &amp; Estofados</text><text x="480" y="255" fill="#c7d2fe" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">Sofá Retrátil Imperial 3 Lugares · Porto Velho - RO</text></svg>`,
      ),
  },
  {
    id: "quarto",
    title: "Ambiente Quarto Casal — Colchão Pocket & Guarda-Roupa",
    caption: "Showroom Manaus (AM) · Conforto e qualidade para o seu lar",
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs><rect width="960" height="600" fill="url(#g2)"/><rect x="200" y="280" width="560" height="180" rx="22" fill="#f0fdfa"/><rect x="235" y="245" width="215" height="55" rx="14" fill="#ccfbf1"/><rect x="510" y="245" width="215" height="55" rx="14" fill="#ccfbf1"/><text x="480" y="165" fill="#ffffff" font-family="system-ui,sans-serif" font-size="34" font-weight="800" text-anchor="middle">Colchões &amp; Dormitórios</text><text x="480" y="208" fill="#99f6e4" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">Molas Ensacadas &amp; Guarda-Roupa 6 Portas · Manaus - AM</text></svg>`,
      ),
  },
  {
    id: "cozinha",
    title: "Linha Branca & Eletrodomésticos Inverter",
    caption: "Refrigeradores Frost Free, Fogões e Lavanderia · RO & AM",
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><rect width="960" height="600" fill="url(#g3)"/><rect x="270" y="190" width="180" height="310" rx="18" fill="#e2e8f0"/><line x1="270" y1="315" x2="450" y2="315" stroke="#94a3b8" stroke-width="4"/><rect x="500" y="290" width="190" height="210" rx="18" fill="#f1f5f9"/><circle cx="595" cy="400" r="56" fill="#334155"/><text x="480" y="115" fill="#ffffff" font-family="system-ui,sans-serif" font-size="34" font-weight="800" text-anchor="middle">Cozinha &amp; Eletrodomésticos</text><text x="480" y="155" fill="#cbd5e1" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">Geladeira Inverter 450L + Lava &amp; Seca 11kg</text></svg>`,
      ),
  },
];

function ImageLightboxShowcaseDemo() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SHOWROOM_GALLERY.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveIndex(idx);
              setOpen(true);
            }}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.title}
              className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="bg-white dark:bg-zinc-900 p-3">
              <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-zinc-500">{item.caption}</p>
            </div>
          </button>
        ))}
      </div>

      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        items={SHOWROOM_GALLERY}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
      />
    </div>
  );
}

function QRCodeShowcaseDemo() {
  const [status, setStatus] = useState<QRCodeStatus>("active");
  const [moduleStyle, setModuleStyle] = useState<QRCodeModuleStyle>("rounded");
  const [payload, setPayload] = useState("https://lopes-ui.com.br/showroom/PED-69042-RO");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 mr-1">Status:</span>
          {(["active", "expired", "loading", "scanned"] as const).map((st) => (
            <Button
              key={st}
              size="sm"
              variant={status === st ? "primary" : "outline"}
              onClick={() => setStatus(st)}
            >
              {st}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 mr-1">Módulos:</span>
          {(["squares", "rounded", "dots"] as const).map((ms) => (
            <Button
              key={ms}
              size="sm"
              variant={moduleStyle === ms ? "tonal" : "outline"}
              onClick={() => setModuleStyle(ms)}
            >
              {ms}
            </Button>
          ))}
        </div>
      </div>

      <div className="max-w-md">
        <input
          type="text"
          value={payload}
          onChange={(e) => setPayload(e.target.value || "https://lopes-ui.com.br")}
          placeholder="Digite URL, código PIX ou SKU..."
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <QRCode
          value={payload}
          size={176}
          status={status}
          onRefresh={() => {
            setStatus("loading");
            setTimeout(() => setStatus("active"), 550);
          }}
          moduleStyle={moduleStyle}
          title="PIX / Pedido #PED-69042"
          caption="Porto Velho (RO) · R$ 3.490,00"
          icon={
            <span className="flex h-full w-full items-center justify-center rounded-md bg-indigo-600 text-[11px] font-black text-white">
              LP
            </span>
          }
          copyable
          downloadable
          downloadFileName="qrcode-pedido-69042"
          printable
        />

        <QRCode
          value="SHOWROOM-AM-COLCHAO-POCKET-KING-92115"
          size={176}
          moduleStyle="dots"
          color="#0f766e"
          title="Etiqueta Showroom Manaus"
          caption="Colchão Pocket King · (92)"
          copyable
          downloadable
        />
      </div>
    </div>
  );
}

function WatermarkShowcaseDemo() {
  const [stamp, setStamp] = useState("LOPES MÓVEIS & ELETRO");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-zinc-500">Texto da marca d&apos;água:</span>
        <input
          type="text"
          value={stamp}
          onChange={(e) => setStamp(e.target.value)}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs text-zinc-800 dark:text-zinc-200"
        />
      </div>

      <Watermark
        content={[stamp || "CONFIDENCIAL", "RO (69) · AM (92)"]}
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8"
      >
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="primary" size="xs" label="Documento Oficial" />
            <span className="font-mono text-xs text-zinc-400">PROTOCOLO #RO-69042</span>
          </div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Certificado de Entrega Técnica & Montagem — Lopes Distribuidora Ltda.
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Declaramos que os móveis (Sofá Retrátil Imperial 3 Lugares e Guarda-Roupa Casal 6 Portas) foram montados e nivelados conforme padrão técnico de qualidade — <em>&ldquo;Conforto e qualidade para o seu lar&rdquo;</em> — com garantia integral assistida nas unidades de Rondônia e Amazonas.
          </p>
        </div>
      </Watermark>
    </div>
  );
}

function SkeletonShowcaseDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500">
          Wrapper &lt;Skeleton loading=&#123;loading&#125; avatar active animation=&quot;wave&quot;&gt;
        </span>
        <Button
          size="sm"
          variant={loading ? "primary" : "outline"}
          onClick={() => setLoading((l) => !l)}
        >
          {loading ? "Exibir Conteúdo Real" : "Voltar para Skeleton"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <Skeleton loading={loading} avatar={{ size: "lg" }} animation="wave" paragraph={{ rows: 3 }}>
            <div className="flex items-start gap-3.5">
              <Avatar name="Mariana Costa" size="lg" status="online" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Mariana Costa — Consultora Showroom Porto Velho (RO)
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Especialista em projetos de Salas de Estar, Colchões de Molas Ensacadas e Eletrodomésticos Inverter. Atendimento WhatsApp (69) 99245-1820.
                </p>
              </div>
            </div>
          </Skeleton>
        </div>

        <Skeleton.Table rows={3} columns={4} animation="wave" />
      </div>
    </div>
  );
}

function MasonryAndRibbonShowcaseDemo() {
  const cards = [
    {
      key: "c1",
      ribbon: "Mais Vendido RO",
      ribbonVariant: "primary" as const,
      status: "processing" as const,
      statusText: "Montagem inclusa em Porto Velho e Ji-Paraná",
      title: "Sofá Retrátil & Reclinável Imperial 3 Lugares",
      desc: "Molas ensacadas no assento, espuma D-33 Soft, abertura de 1,80m e revestimento em linho macio.",
      price: "R$ 3.490,00",
    },
    {
      key: "c2",
      ribbon: "Inverter 127V",
      ribbonVariant: "success" as const,
      status: "success" as const,
      statusText: "Pronta entrega CD Manaus (AM)",
      title: "Geladeira Frost Free Duplex 450L",
      desc: "Painel eletrônico externo, turbo freezer e economia de até 35% de energia para sua cozinha.",
      price: "R$ 4.299,90",
    },
    {
      key: "c3",
      ribbon: "10x Sem Juros",
      ribbonVariant: "warning" as const,
      status: "default" as const,
      statusText: "Linha Conforto & Dormitórios",
      title: "Conjunto Box King Molas Ensacadas Pocket",
      desc: "Tampo em malha belga respirável com pillow top de alta densidade e tratamento antiácaro. Conforto e qualidade para o seu lar.",
      price: "R$ 2.990,00",
    },
    {
      key: "c4",
      ribbon: "Novidade",
      ribbonVariant: "teal" as const,
      status: "processing" as const,
      statusText: "Disponível em RO (69) e AM (92)",
      title: "Guarda-Roupa Casal 6 Portas c/ Espelho",
      desc: "Corrediças telescópicas, cabideiros em alumínio e divisão interna ele & ela.",
      price: "R$ 2.190,00",
    },
    {
      key: "c5",
      ribbon: "Lavanderia",
      ribbonVariant: "info" as const,
      status: "success" as const,
      statusText: "Garantia oficial 10 anos no motor",
      title: "Lava e Seca 11kg Smart Inverter",
      desc: "Lavagem a vapor higienizadora e ciclo rápido de 15 minutos.",
      price: "R$ 3.890,00",
    },
    {
      key: "c6",
      ribbon: "Sala de Jantar",
      ribbonVariant: "violet" as const,
      status: "warning" as const,
      statusText: "Últimas 4 peças no showroom",
      title: "Mesa de Jantar 6 Cadeiras Tampo Vidro Off-White",
      desc: "Cadeiras estofadas ergonômicas em veludo e base estrutural em MDF chanfrado.",
      price: "R$ 2.650,00",
    },
  ];

  return (
    <Masonry
      columns={{ base: 1, sm: 2, lg: 3 }}
      gap={18}
      items={cards.map((c) => ({
        key: c.key,
        children: (
          <BadgeRibbon text={c.ribbon} variant={c.ribbonVariant}>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 pt-5 space-y-2.5 shadow-2xs">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pr-20">
                {c.title}
              </p>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {c.desc}
              </p>
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <Badge status={c.status} text={c.statusText} />
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {c.price}
                </span>
              </div>
            </div>
          </BadgeRibbon>
        ),
      }))}
    />
  );
}
