"use client";

import React, { useState } from "react";
import {
  Boxes,
  Check,
  CreditCard,
  Eye,
  FileCheck2,
  Home,
  LayoutDashboard,
  LayoutGrid,
  List,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sofa,
  Store,
  Table2,
  Trash2,
  Truck,
  Wrench,
} from "lucide-react";
import ActionGridCard from "@/components/ActionGridCard";
import Agenda from "@/components/Agenda";
import AppLauncher from "@/components/AppLauncher";
import AspectRatio from "@/components/AspectRatio";
import Badge from "@/components/Badge";
import BentoGrid, { BentoCard } from "@/components/BentoGrid";
import Button from "@/components/Button";
import ButtonGroup from "@/components/ButtonGroup";
import Carousel from "@/components/Carousel";
import Collapsible, { CollapsibleContent, CollapsibleTrigger } from "@/components/Collapsible";
import CommandMenu from "@/components/CommandMenu";
import Confirm from "@/components/Confirm";
import ContextMenu from "@/components/ContextMenu";
import CookieBanner from "@/components/CookieBanner";
import Countdown from "@/components/Countdown";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import {
  DetailGrid,
  DetailHeader,
  DetailPanel,
  InfoField,
} from "@/components/DetailLayout";
import Diff from "@/components/Diff";
import Dock from "@/components/Dock";
import EmojiPicker from "@/components/EmojiPicker";
import ExpandableDataCard from "@/components/ExpandableDataCard";
import FloatButton from "@/components/FloatButton";
import Footer from "@/components/Footer";
import FormModal, { FormSectionHeader } from "@/components/FormModal";
import Header from "@/components/Header";
import HighlightText from "@/components/HighlightText";
import HoverCard from "@/components/HoverCard";
import HoverGallery from "@/components/HoverGallery";
import ImageLightbox from "@/components/ImageLightbox";
import InboxList, { type InboxItem } from "@/components/InboxList";
import Indicator from "@/components/Indicator";
import Item, { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/Item";
import JsonViewer from "@/components/JsonViewer";
import Kbd from "@/components/Kbd";
import KpiCarousel from "@/components/KpiCarousel";
import Loading from "@/components/Loading";
import MapView, { MapMarker } from "@/components/Map";
import Mask, { type MaskShape } from "@/components/Mask";
import { BrowserMockup, CodeMockup, PhoneMockup, WindowMockup } from "@/components/Mockup";
import Pagination from "@/components/Pagination";
import PullToRefresh from "@/components/PullToRefresh";
import QuickActions from "@/components/QuickActions";
import ScrollArea from "@/components/ScrollArea";
import ShortcutHint from "@/components/ShortcutHint";
import Sidebar from "@/components/Sidebar";
import SortableList from "@/components/SortableList";
import SpeedDial from "@/components/SpeedDial";
import SplitCounterBadge from "@/components/SplitCounterBadge";
import SplitPane from "@/components/SplitPane";
import Spoiler from "@/components/Spoiler";
import Spreadsheet, { type SpreadsheetColumn } from "@/components/spreadsheet";
import Stack from "@/components/Stack";
import State from "@/components/State";
import Swap from "@/components/Swap";
import TableOfContents from "@/components/TableOfContents";
import ThemeToggle from "@/components/ThemeToggle";
import toast, { ToastPreview } from "@/components/Toast";
import ToggleGroup from "@/components/ToggleGroup";
import TouchChartCard from "@/components/TouchChartCard";
import UnsavedChangesDialog from "@/components/UnsavedChangesDialog";
import Watermark from "@/components/Watermark";
import Masonry from "@/components/Masonry";
import TextField from "@/components/form/TextField";
import { resolveIcon } from "./catalog-and-defaults";
import type { UICanvasElement } from "./types";

function asStr(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  return fallback;
}
function asNum(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}
function asBool(val: unknown, fallback = false): boolean {
  return typeof val === "boolean" ? val : fallback;
}

const DEMO_SVG_IMG_1 =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><rect width="480" height="300" fill="#eef2ff"/><rect x="40" y="130" width="400" height="110" rx="18" fill="#4f46e5" opacity="0.18"/><text x="240" y="145" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#312e81">Sofá Retrátil Bari 2,90m</text><text x="240" y="175" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#4338ca">Lopes ERP · RO &amp; AM</text></svg>`,
  );

const DEMO_SVG_IMG_2 =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><rect width="480" height="300" fill="#ecfdf5"/><rect x="40" y="130" width="400" height="110" rx="18" fill="#059669" opacity="0.18"/><text x="240" y="145" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#065f46">Ambiente Completo Lopes</text><text x="240" y="175" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#047857">Conforto e qualidade para o seu lar</text></svg>`,
  );

type DemoProductRow = {
  id: string;
  sku: string;
  produto: string;
  categoria: string;
  filial: string;
  estoque: number;
  preco: number;
};

const DEMO_PRODUCT_ROWS: DemoProductRow[] = [
  { id: "1", sku: "EST-290", produto: "Sofá Retrátil Bari 2,90m", categoria: "Estofados", filial: "Porto Velho (RO)", estoque: 18, preco: 3890 },
  { id: "2", sku: "ELE-474", produto: "Geladeira Frost Free Inverter 474L", categoria: "Linha Branca", filial: "Manaus Centro (AM)", estoque: 24, preco: 4590 },
  { id: "3", sku: "COL-158", produto: "Conjunto Box Queen Molas Ensacadas", categoria: "Colchões", filial: "Ji-Paraná (RO)", estoque: 14, preco: 2690 },
  { id: "4", sku: "DOR-600", produto: "Guarda-Roupa Casal 6 Portas c/ Espelho", categoria: "Dormitórios", filial: "Manaus C. Nova (AM)", estoque: 9, preco: 2390 },
  { id: "5", sku: "COZ-700", produto: "Cozinha Modulada 7 Peças Freijó", categoria: "Cozinhas", filial: "Ariquemes (RO)", estoque: 11, preco: 3150 },
];

const DEMO_DATATABLE_COLS: DataTableColumn<DemoProductRow>[] = [
  { key: "sku", label: "SKU", width: "92px", sortable: true },
  { key: "produto", label: "Produto", sortable: true },
  { key: "categoria", label: "Linha", sortable: true },
  { key: "filial", label: "Filial (RO/AM)", sortable: true },
  { key: "estoque", label: "Saldo", align: "right", sortable: true, summary: "sum" },
  {
    key: "preco",
    label: "Preço",
    align: "right",
    sortable: true,
    render: (v) => `R$ ${Number(v).toLocaleString("pt-BR")}`,
  },
];

const DEMO_SPREADSHEET_COLS: SpreadsheetColumn<DemoProductRow>[] = [
  { key: "sku", header: "SKU", width: 100, pinned: true },
  { key: "produto", header: "Produto (Móveis & Eletro)", width: 240, editable: true },
  { key: "filial", header: "Filial RO/AM", width: 160 },
  { key: "estoque", header: "Estoque", type: "integer", align: "right", editable: true, aggregate: "sum", width: 100 },
  { key: "preco", header: "Preço Unit.", type: "currency", align: "right", editable: true, aggregate: "avg", width: 130 },
];

const DEMO_INBOX_REF = new Date("2026-11-26T14:00:00.000Z").getTime();
const DEMO_INBOX_ITEMS: InboxItem[] = [
  {
    id: "in1",
    from: "CD Porto Velho (RO)",
    subject: "Romaneio #ROM-412 liberado para expedição",
    preview: "12 pedidos de móveis e colchões carregados na rota BR-364.",
    date: new Date(DEMO_INBOX_REF - 900_000),
    unread: true,
    starred: true,
  },
  {
    id: "in2",
    from: "Filial Manaus Centro (AM)",
    subject: "Solicitação de transferência — Geladeira Inverter 474L",
    preview: "Necessário reforço de 6 unidades para campanha do fim de semana.",
    date: new Date(DEMO_INBOX_REF - 3_600_000),
    unread: true,
    starred: false,
  },
  {
    id: "in3",
    from: "Equipe Montagem Ji-Paraná",
    subject: "OS #6912 concluída com foto e assinatura",
    preview: "Cozinha Modulada 7P montada sem pendências técnicas.",
    date: new Date(DEMO_INBOX_REF - 86_400_000),
    unread: false,
    starred: false,
    hasAttachment: true,
  },
];

export interface ExtendedRendererProps {
  element: UICanvasElement;
  interactive: boolean;
}

export default function ExtendedRendererCore({ element, interactive }: ExtendedRendererProps) {
  const p = element.props;
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [page, setPage] = useState(asNum(p.page, 2));
  const [inboxSelected, setInboxSelected] = useState(asStr(p.selectedId, "in1"));
  const [sortItems, setSortItems] = useState([
    { id: "s1", title: "1. Entrega Sofá Retrátil Bari — Porto Velho (RO)" },
    { id: "s2", title: "2. Montagem Guarda-Roupa 6P — Ji-Paraná (RO)" },
    { id: "s3", title: "3. Entrega Geladeira Inverter — Manaus (AM)" },
  ]);
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const [formTab, setFormTab] = useState("geral");

  switch (element.type) {
    // ── Estrutura & Superfícies / Exibição ──────────────────────────────────
    case "stack": {
      const rawCards = Array.isArray(p.cards)
        ? p.cards
        : [
            { title: "Sofá Retrátil Bari 2,90m", subtitle: "CD Porto Velho (RO)" },
            { title: "Geladeira Frost Free 474L", subtitle: "CD Manaus (AM)" },
            { title: "Colchão Queen Molas Ensacadas", subtitle: "Lopes ERP" },
          ];
      return (
        <div className="h-full w-full flex items-center justify-center p-3">
          <Stack
            direction={asStr(p.direction, "bottom") as "top" | "bottom" | "left" | "right"}
            maxVisible={asNum(p.maxVisible, 3)}
            fanOnHover={asBool(p.fanOnHover, true)}
            cycleOnClick={interactive && asBool(p.cycleOnClick, true)}
            className="w-full max-w-xs"
          >
            {rawCards.map((c, idx) => {
              const obj = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                >
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {asStr(obj.title, `Item ${idx + 1}`)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {asStr(obj.subtitle, "Filiais RO & AM")}
                  </p>
                </div>
              );
            })}
          </Stack>
        </div>
      );
    }

    case "aspect_ratio":
      return (
        <div className="h-full w-full overflow-hidden rounded-xl">
          <AspectRatio ratio={asNum(p.ratio, 16 / 9)} className="h-full w-full">
            <div className="h-full w-full rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-zinc-900 flex flex-col items-center justify-center p-4 text-center">
              <Badge label={asStr(p.badgeText, "16:9")} variant="primary" size="xs" />
              <p className="mt-2 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {asStr(p.caption, "Ambiente Lopes ERP")}
              </p>
            </div>
          </AspectRatio>
        </div>
      );

    case "bento_grid": {
      const rawCards = Array.isArray(p.cards) ? p.cards : [];
      const cols = Math.min(4, Math.max(2, asNum(p.columns, 3))) as 2 | 3 | 4;
      return (
        <div className="h-full w-full overflow-auto">
          <BentoGrid componentId={element.componentId} columns={cols}>
            {rawCards.map((c, idx) => {
              const obj = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
              const Icon = resolveIcon(obj.iconName, Sofa);
              return (
                <BentoCard
                  key={idx}
                  title={asStr(obj.title, `Bloco ${idx + 1}`)}
                  description={asStr(obj.description)}
                  badge={asStr(obj.badge) || undefined}
                  icon={Icon}
                  colSpan={Math.min(3, Math.max(1, asNum(obj.colSpan, 1))) as 1 | 2 | 3}
                  featured={asBool(obj.featured, false)}
                  cta={asStr(obj.cta) || undefined}
                  onCtaClick={interactive ? () => toast.info(`Abrindo ${asStr(obj.title)}`) : undefined}
                />
              );
            })}
          </BentoGrid>
        </div>
      );
    }

    case "masonry": {
      const rawItems = Array.isArray(p.items) ? p.items : [];
      return (
        <div className="h-full w-full overflow-auto">
          <Masonry
            componentId={element.componentId}
            columns={Math.min(5, Math.max(1, asNum(p.columns, 3)))}
            gap={asNum(p.gap, 12)}
          >
            {rawItems.map((it, idx) => {
              const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
              return (
                <div
                  key={asStr(obj.id, `ms_${idx}`)}
                  style={{ minHeight: asNum(obj.height, 100) }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex flex-col justify-between shadow-2xs"
                >
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {asStr(obj.title, `Ambiente ${idx + 1}`)}
                  </p>
                  <p className="text-[11px] text-zinc-500">{asStr(obj.subtitle, "RO & AM")}</p>
                </div>
              );
            })}
          </Masonry>
        </div>
      );
    }

    case "detail_layout": {
      const rawFields = Array.isArray(p.fields) ? p.fields : [];
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          <DetailHeader
            titleLabel={asStr(p.subtitle, "Detalhe")}
            titleValue={asStr(p.title, "Detalhe do Pedido")}
            badge={asStr(p.badgeText) ? <Badge label={asStr(p.badgeText)} tone="success" size="xs" dot /> : undefined}
          />
          <DetailPanel title={asStr(p.panelTitle, "Resumo")}>
            <DetailGrid columns={2}>
              {rawFields.map((f, idx) => {
                const obj = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
                return (
                  <InfoField
                    key={idx}
                    label={asStr(obj.label, `Campo ${idx + 1}`)}
                    value={asStr(obj.value, "—")}
                    highlight={asBool(obj.highlight, false)}
                  />
                );
              })}
            </DetailGrid>
          </DetailPanel>
        </div>
      );
    }

    case "mockup": {
      const kind = asStr(p.kind, "browser");
      const body = (
        <div className="p-4 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{asStr(p.title, "Lopes ERP")}</p>
          <p>{asStr(p.body)}</p>
        </div>
      );
      if (kind === "window") {
        return <WindowMockup title={asStr(p.title)} className="h-full w-full">{body}</WindowMockup>;
      }
      if (kind === "phone") {
        return <PhoneMockup className="h-full w-full mx-auto">{body}</PhoneMockup>;
      }
      if (kind === "code") {
        return (
          <CodeMockup className="h-full w-full">
            <pre data-prefix="$"><code>npm run sync:cds -- --region=RO,AM</code></pre>
            <pre data-prefix=">" className="text-emerald-400"><code>CD Porto Velho &amp; CD Manaus sincronizados!</code></pre>
          </CodeMockup>
        );
      }
      return (
        <BrowserMockup url={asStr(p.url, "https://erp.lopes.app")} className="h-full w-full">
          {body}
        </BrowserMockup>
      );
    }

    case "watermark":
      return (
        <Watermark
          content={asStr(p.content, "USO INTERNO")}
          rotate={asNum(p.rotate, -22)}
          opacity={asNum(p.opacity, 0.14)}
          fontSize={asNum(p.fontSize, 14)}
          className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
        >
          <div className="p-4 space-y-1">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {asStr(p.bodyTitle, "Documento Protegido")}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{asStr(p.bodyText)}</p>
          </div>
        </Watermark>
      );

    case "mask":
      return (
        <div className="h-full w-full flex items-center justify-center p-2">
          <Mask
            shape={asStr(p.shape, "squircle") as MaskShape}
            className="h-full w-full max-w-[180px] max-h-[180px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold text-center p-3"
          >
            {asStr(p.label, "Filiais RO/AM")}
          </Mask>
        </div>
      );

    case "carousel": {
      const rawSlides = Array.isArray(p.slides) ? p.slides : [];
      return (
        <div className="h-full w-full overflow-hidden">
          <Carousel
            componentId={element.componentId}
            arrows={asBool(p.arrows, true)}
            dots={asBool(p.dots, true)}
            loop={asBool(p.loop, true)}
            slidesPerView={asNum(p.slidesPerView, 1)}
            className="h-full w-full"
          >
            {rawSlides.map((s, idx) => {
              const obj = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
              return (
                <div
                  key={idx}
                  className="h-44 rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-zinc-900 p-6 flex flex-col justify-center"
                >
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {asStr(obj.title, `Slide ${idx + 1}`)}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    {asStr(obj.subtitle)}
                  </p>
                </div>
              );
            })}
          </Carousel>
        </div>
      );
    }

    case "hover_gallery":
      return (
        <div className="h-full w-full flex flex-col gap-1.5 overflow-hidden">
          <HoverGallery
            componentId={element.componentId}
            images={[
              { src: DEMO_SVG_IMG_1, alt: "Ângulo frontal" },
              { src: DEMO_SVG_IMG_2, alt: "Ambiente decorado" },
            ]}
            showIndicators={asBool(p.showIndicators, true)}
            resetOnLeave={asBool(p.resetOnLeave, true)}
            className="flex-1 min-h-0"
          />
          {asStr(p.productTitle) && (
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {asStr(p.productTitle)}
            </p>
          )}
        </div>
      );

    case "diff":
      return (
        <div className="h-full w-full overflow-hidden rounded-xl">
          <Diff
            componentId={element.componentId}
            before={DEMO_SVG_IMG_1}
            after={DEMO_SVG_IMG_2}
            beforeLabel={asStr(p.beforeLabel, "Antes")}
            afterLabel={asStr(p.afterLabel, "Depois")}
            defaultPosition={asNum(p.defaultPosition, 50)}
            orientation={asStr(p.orientation, "horizontal") as "horizontal" | "vertical"}
            className="h-full w-full"
          />
        </div>
      );

    case "spoiler":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 overflow-auto">
          <Spoiler
            componentId={element.componentId}
            maxHeight={asNum(p.maxHeight, 68)}
            showLabel={asStr(p.showLabel, "Ver mais")}
            hideLabel={asStr(p.hideLabel, "Recolher")}
            fadeGradient={asBool(p.fadeGradient, true)}
          >
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {asStr(p.content)}
            </p>
          </Spoiler>
        </div>
      );

    case "highlight_text": {
      const terms = asStr(p.highlight)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 flex items-center">
          <HighlightText
            componentId={element.componentId}
            text={asStr(p.text, "Lopes ERP — RO e AM")}
            highlight={terms.length > 0 ? terms : "Lopes"}
            tone={asStr(p.tone, "amber") as "amber" | "primary" | "emerald" | "rose" | "sky"}
            ignoreAccents={asBool(p.ignoreAccents, true)}
            className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200"
          />
        </div>
      );
    }

    case "item": {
      return (
        <div className="h-full w-full flex items-center">
          <Item
            variant={asStr(p.variant, "outline") as "default" | "outline" | "muted"}
            size={asStr(p.size, "md") as "sm" | "md"}
            className="w-full"
          >
            <ItemMedia variant="icon">
              {React.createElement(resolveIcon(p.iconName, Package), { size: 16 })}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{asStr(p.title, "Item de Lista")}</ItemTitle>
              {asStr(p.description) && <ItemDescription>{asStr(p.description)}</ItemDescription>}
            </ItemContent>
            {asStr(p.actionLabel) && (
              <ItemActions>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => interactive && toast.info(asStr(p.actionLabel))}
                >
                  {asStr(p.actionLabel)}
                </Button>
              </ItemActions>
            )}
          </Item>
        </div>
      );
    }

    case "indicator":
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Indicator
            badge={asStr(p.badge, "3")}
            position={asStr(p.position, "top-end") as "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end"}
            tone={asStr(p.tone, "primary") as "default" | "primary" | "success" | "warning" | "danger"}
            ping={asBool(p.ping, true)}
          >
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
              {asStr(p.label, "Entregas Hoje")}
            </div>
          </Indicator>
        </div>
      );

    case "hover_card":
      return (
        <div className="h-full w-full flex items-center">
          <HoverCard
            side={asStr(p.side, "bottom") as "top" | "right" | "bottom" | "left"}
            trigger={
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 underline decoration-dotted cursor-pointer">
                {asStr(p.triggerLabel, "@filial-porto-velho-ro")}
              </span>
            }
            content={
              <div className="space-y-1 text-xs">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{asStr(p.title)}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{asStr(p.description)}</p>
              </div>
            }
          />
        </div>
      );

    case "action_grid_card": {
      const rawItems = Array.isArray(p.items) ? p.items : [];
      return (
        <ActionGridCard
          componentId={element.componentId}
          title={asStr(p.title, "Ações Rápidas")}
          subtitle={asStr(p.subtitle) || undefined}
          columns={Math.min(4, Math.max(2, asNum(p.columns, 3))) as 2 | 3 | 4}
          items={rawItems.map((it, idx) => {
            const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
            return {
              id: asStr(obj.id, `act_${idx}`),
              label: asStr(obj.label, `Ação ${idx + 1}`),
              icon: resolveIcon(obj.iconName, ShoppingBag),
              onClick: () => interactive && toast.info(`Ação: ${asStr(obj.label)}`),
            };
          })}
          className="h-full w-full"
        />
      );
    }

    case "countdown":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center justify-center">
          <Countdown
            hours={asNum(p.hours, 4)}
            minutes={asNum(p.minutes, 32)}
            seconds={asNum(p.seconds, 18)}
            variant={asStr(p.variant, "boxed") as "inline" | "boxed" | "cards" | "compact"}
            size={asStr(p.size, "md") as "sm" | "md" | "lg" | "xl"}
            tone={asStr(p.tone, "primary") as "default" | "primary" | "success" | "warning" | "danger"}
            showDays={asBool(p.showDays, false)}
            paused={asBool(p.paused, false)}
          />
        </div>
      );

    case "emoji_picker":
      return (
        <div className="h-full w-full overflow-hidden flex items-center justify-center">
          <EmojiPicker
            componentId={element.componentId}
            storageKey={asStr(p.storageKey, "lopes_builder_emoji_demo")}
            onSelectEmoji={(emoji) => interactive && toast.success(`Emoji selecionado: ${emoji}`)}
          />
        </div>
      );

    case "image_lightbox":
      return (
        <div className="h-full w-full">
          <button
            type="button"
            onClick={() => interactive && setOverlayOpen(true)}
            className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col text-left cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEMO_SVG_IMG_1}
              alt={asStr(p.title, "Imagem")}
              className="flex-1 min-h-0 w-full object-cover"
            />
            <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {asStr(p.title, "Abrir Lightbox")}
              </span>
              <Eye size={13} className="text-indigo-500 shrink-0" />
            </div>
          </button>
          {interactive && (
            <ImageLightbox
              open={overlayOpen}
              onClose={() => setOverlayOpen(false)}
              src={DEMO_SVG_IMG_1}
              title={asStr(p.title)}
              caption={asStr(p.caption)}
              allowDownload={asBool(p.allowDownload, true)}
              allowPrint={asBool(p.allowPrint, true)}
            />
          )}
        </div>
      );

    case "split_counter_badge":
      return (
        <div className="h-full w-full flex items-center">
          <SplitCounterBadge
            componentId={element.componentId}
            approvedCount={asNum(p.approvedCount, 42)}
            blockedCount={asNum(p.blockedCount, 7)}
            rejectedCount={asNum(p.rejectedCount, 2)}
            approvedLabel={asStr(p.approvedLabel, "Liberados")}
            blockedLabel={asStr(p.blockedLabel, "Em Análise")}
            rejectedLabel={asStr(p.rejectedLabel, "Negados")}
            size={asStr(p.size, "md") as "xs" | "sm" | "md"}
          />
        </div>
      );

    case "agenda": {
      const rawEvents = Array.isArray(p.events) ? p.events : [];
      const baseDate = new Date("2026-11-26T09:00:00");
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
          <Agenda
            componentId={element.componentId}
            startDate={baseDate}
            size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
            showTime={asBool(p.showTime, true)}
            showLocation={asBool(p.showLocation, true)}
            dateFormat={asStr(p.dateFormat, "both") as "relative" | "date" | "both"}
            events={rawEvents.map((ev, idx) => {
              const obj = (ev && typeof ev === "object" ? ev : {}) as Record<string, unknown>;
              return {
                id: asStr(obj.id, `ag_${idx}`),
                title: asStr(obj.title, `Compromisso ${idx + 1}`),
                date: baseDate,
                time: asStr(obj.time, "10:00"),
                location: asStr(obj.location) || undefined,
              };
            })}
          />
        </div>
      );
    }

    case "map":
      return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <MapView
            componentId={element.componentId}
            center={[asNum(p.longitude, -63.9039), asNum(p.latitude, -8.7619)]}
            zoom={asNum(p.zoom, 11)}
            theme={asStr(p.theme, "liberty") as "liberty" | "bright" | "positron" | "dark"}
            lazy={false}
            fallback={
              <div className="h-full w-full bg-slate-100 dark:bg-zinc-900 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                <MapPin size={22} className="text-indigo-500" />
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {asStr(p.markerLabel, "CD Porto Velho (RO)")}
                </p>
                <p className="text-[11px] font-mono text-zinc-500">
                  {asNum(p.latitude, -8.7619).toFixed(4)}, {asNum(p.longitude, -63.9039).toFixed(4)}
                </p>
              </div>
            }
            className="h-full w-full"
          >
            <MapMarker
              longitude={asNum(p.longitude, -63.9039)}
              latitude={asNum(p.latitude, -8.7619)}
            >
              <div className="rounded-full bg-indigo-600 text-white px-2.5 py-1 text-[10px] font-bold shadow-md">
                {asStr(p.markerLabel, "Filial RO")}
              </div>
            </MapMarker>
          </MapView>
        </div>
      );

    case "cookie_banner":
      return (
        <div className="h-full w-full flex items-center">
          <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {asStr(p.title, "Privacidade e Cookies")}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {asStr(p.description)}
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => interactive && setOverlayOpen(true)}>
              {interactive ? "Abrir Banner" : "Aceitar"}
            </Button>
          </div>
          {interactive && overlayOpen && (
            <CookieBanner
              open={overlayOpen}
              title={asStr(p.title)}
              description={asStr(p.description)}
              allowCustomize={asBool(p.allowCustomize, true)}
              onConsentChange={() => {
                setOverlayOpen(false);
                toast.success("Preferências de cookies salvas!");
              }}
            />
          )}
        </div>
      );

    case "theme_toggle":
      return (
        <div className="h-full w-full flex items-center justify-center">
          <ThemeToggle componentId={element.componentId} size={asNum(p.size, 18)} />
        </div>
      );

    // ── Navegação ───────────────────────────────────────────────────────────
    case "header": {
      const rawNav = Array.isArray(p.navItems) ? p.navItems : [];
      return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Header
            componentId={element.componentId}
            sticky={false}
            brand={
              <span className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Store size={16} className="text-indigo-500" />
                {asStr(p.brandName, "Lopes ERP")}
              </span>
            }
            nav={rawNav.map((n, i) => {
              const obj = (n && typeof n === "object" ? n : {}) as Record<string, unknown>;
              return { label: asStr(obj.label, `Link ${i + 1}`), href: "#" };
            })}
          />
        </div>
      );
    }

    case "sidebar":
      return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Sidebar
            groups={[
              {
                label: asStr(p.brandTitle, "Comercial RO & AM"),
                items: [
                  { label: "Dashboard", icon: LayoutDashboard, active: true },
                  { label: "Pedidos de Venda", icon: ShoppingBag, badge: "12" },
                  { label: "Estoque CDs", icon: Boxes },
                  { label: "Entregas & Montagem", icon: Truck },
                ],
              },
            ]}
            user={{
              name: asStr(p.userName, "Camila Souza"),
              role: asStr(p.userRole, "Porto Velho (RO)"),
              initials: "CS",
              status: "online",
            }}
          />
        </div>
      );

    case "footer":
      return (
        <div className="h-full w-full overflow-hidden rounded-xl">
          <Footer
            brand={asStr(p.brand, "Lopes ERP")}
            tagline={asStr(p.tagline)}
            copyright={asStr(p.copyright)}
            variant={asStr(p.variant, "bordered") as "default" | "minimal" | "bordered"}
            columns={[
              {
                title: "Departamentos",
                links: [
                  { label: "Estofados & Salas", href: "#" },
                  { label: "Colchões & Dormitórios", href: "#" },
                  { label: "Eletrodomésticos", href: "#" },
                ],
              },
              {
                title: "Praças",
                links: [
                  { label: "Rondônia — DDD (69)", href: "#" },
                  { label: "Amazonas — DDD (92)", href: "#" },
                ],
              },
            ]}
          />
        </div>
      );

    case "pagination":
      return (
        <div className="h-full w-full flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3">
          <Pagination
            page={interactive ? page : asNum(p.page, 2)}
            totalItems={asNum(p.totalItems, 148)}
            pageSize={asNum(p.pageSize, 10)}
            showSummary={asBool(p.showSummary, true)}
            showEdges={asBool(p.showEdges, true)}
            size={asStr(p.size, "sm") as "sm" | "md"}
            onPageChange={(next) => setPage(next)}
          />
        </div>
      );

    case "app_launcher":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
          <AppLauncher
            componentId={element.componentId}
            title={asStr(p.title, "Módulos Lopes")}
            searchable={asBool(p.searchable, true)}
            columns={Math.min(5, Math.max(2, asNum(p.columns, 3))) as 2 | 3 | 4 | 5}
            size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
            apps={[
              { id: "vendas", label: "Vendas Salão", description: "PDV e Orçamentos", icon: ShoppingBag },
              { id: "estoque", label: "Estoque CDs", description: "Porto Velho & Manaus", icon: Boxes },
              { id: "logistica", label: "Logística", description: "Rotas & Montagem", icon: Truck },
              { id: "crediario", label: "Crediário", description: "Análise de Crédito", icon: CreditCard },
              { id: "fiscal", label: "Fiscal NF-e", description: "SEFAZ RO / AM", icon: FileCheck2 },
              { id: "config", label: "Administração", description: "Filiais & RBAC", icon: Settings },
            ]}
          />
        </div>
      );

    case "command_menu":
      return (
        <div className="h-full w-full flex items-center">
          <CommandMenu
            componentId={element.componentId}
            triggerLabel={asStr(p.triggerLabel, "Buscar (⌘K)...")}
            placeholder={asStr(p.placeholder, "Digite um comando...")}
            items={[
              { id: "c1", label: "Novo Pedido de Móveis", group: "Vendas", icon: ShoppingBag, onSelect: () => interactive && toast.info("Novo Pedido") },
              { id: "c2", label: "Consultar Estoque CD Porto Velho (RO)", group: "Estoque", icon: Boxes, onSelect: () => interactive && toast.info("CD Porto Velho") },
              { id: "c3", label: "Consultar Estoque CD Manaus (AM)", group: "Estoque", icon: Store, onSelect: () => interactive && toast.info("CD Manaus") },
            ]}
            className="w-full"
          />
        </div>
      );

    case "quick_actions":
      return (
        <div className="relative h-full w-full rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-center p-2">
          <QuickActions
            componentId={element.componentId}
            className="static"
            actions={[
              { id: "qa1", label: "Novo Pedido", icon: <Plus size={16} />, onClick: () => { if (interactive) toast.success("Novo Pedido"); } },
              { id: "qa2", label: "Agendar Montagem", icon: <Wrench size={16} />, onClick: () => { if (interactive) toast.info("Agendar Montagem"); } },
            ]}
          />
        </div>
      );

    case "shortcut_hint": {
      const keys = asStr(p.keysText, "Ctrl,K")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      return (
        <div className="h-full w-full flex items-center justify-center">
          <ShortcutHint
            keys={keys.length > 0 ? keys : ["Ctrl", "K"]}
            separator={asBool(p.separator, true)}
            size={asStr(p.size, "sm") as "xs" | "sm" | "md"}
          />
        </div>
      );
    }

    case "split_pane":
      return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <SplitPane
            direction={asStr(p.direction, "horizontal") as "horizontal" | "vertical"}
            defaultSplit={asNum(p.defaultSplit, 45)}
            withHandle={asBool(p.withHandle, true)}
            className="h-full w-full"
            first={
              <div className="h-full w-full bg-white dark:bg-zinc-900 p-3.5 text-xs">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{asStr(p.firstTitle, "Painel 1")}</p>
                <p className="text-zinc-500 mt-1">Pedidos ativos nas filiais de Rondônia e Amazonas.</p>
              </div>
            }
            second={
              <div className="h-full w-full bg-zinc-50 dark:bg-zinc-950 p-3.5 text-xs">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{asStr(p.secondTitle, "Painel 2")}</p>
                <p className="text-zinc-500 mt-1">Detalhes de expedição, rota e equipe de montagem.</p>
              </div>
            }
          />
        </div>
      );

    case "dock":
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Dock
            componentId={element.componentId}
            position="inline"
            showLabels={asBool(p.showLabels, true)}
            magnify={asBool(p.magnify, true)}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            variant={asStr(p.variant, "floating") as "floating" | "full"}
            items={[
              { id: "home", label: "Início", icon: Home },
              { id: "vendas", label: "Vendas", icon: ShoppingBag, badge: 4 },
              { id: "estoque", label: "Estoque", icon: Boxes },
              { id: "rotas", label: "Entregas", icon: Truck },
            ]}
            onSelect={(it) => interactive && toast.info(`Dock: ${it.label}`)}
          />
        </div>
      );

    case "collapsible":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 overflow-auto">
          <Collapsible defaultOpen={asBool(p.defaultOpen, true)}>
            <CollapsibleTrigger className="w-full text-left text-xs font-semibold text-zinc-900 dark:text-zinc-100 py-1">
              {asStr(p.triggerLabel, "Detalhes")}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-xs text-zinc-600 dark:text-zinc-400">
              {asStr(p.content)}
            </CollapsibleContent>
          </Collapsible>
        </div>
      );

    case "scroll_area":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex flex-col">
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {asStr(p.title, "Filiais RO & AM")}
          </p>
          <ScrollArea
            maxHeight={asNum(p.maxHeight, 140)}
            showScrollShadows={asBool(p.showScrollShadows, true)}
            className="flex-1"
          >
            <div className="space-y-1.5 pr-2 text-xs text-zinc-600 dark:text-zinc-300">
              {[
                "Porto Velho — Centro (69)",
                "Porto Velho — Zona Leste (69)",
                "Manaus — Centro (92)",
                "Manaus — Cidade Nova (92)",
                "Ji-Paraná — Av. Brasil (69)",
                "Ariquemes — Centro (69)",
                "Cacoal — Av. Porto Velho (69)",
              ].map((branch) => (
                <div
                  key={branch}
                  className="rounded-lg border border-zinc-100 dark:border-zinc-800 px-2.5 py-1.5"
                >
                  {branch}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      );

    case "kbd":
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Kbd size={asStr(p.size, "md") as "xs" | "sm" | "md"}>{asStr(p.label, "F2")}</Kbd>
        </div>
      );

    case "table_of_contents": {
      const rawItems = Array.isArray(p.items) ? p.items : [];
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 overflow-auto">
          <TableOfContents
            componentId={element.componentId}
            title={asStr(p.title, "Nesta Ficha")}
            variant={asStr(p.variant, "rail") as "rail" | "filled" | "minimal"}
            activeId={asStr(p.activeId, "especificacoes")}
            items={rawItems.map((it, idx) => {
              const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
              const lvl = Math.min(4, Math.max(1, asNum(obj.level, 2))) as 1 | 2 | 3 | 4;
              return {
                id: asStr(obj.id, `sec_${idx}`),
                label: asStr(obj.label, `Seção ${idx + 1}`),
                level: lvl,
              };
            })}
          />
        </div>
      );
    }

    case "context_menu":
      return (
        <ContextMenu
          componentId={element.componentId}
          items={[
            { label: "Ver Detalhes", icon: Eye, onClick: () => interactive && toast.info("Detalhes") },
            { label: "Editar Pedido", icon: Pencil, onClick: () => interactive && toast.info("Editar") },
            { label: "Cancelar Pedido", icon: Trash2, danger: true, onClick: () => interactive && toast.error("Cancelado") },
          ]}
          className="h-full w-full"
        >
          <div className="h-full w-full rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-center p-3 text-center text-xs text-zinc-700 dark:text-zinc-300">
            {asStr(p.label, "Clique com o botão direito")}
          </div>
        </ContextMenu>
      );

    // ── KPIs & Dados ────────────────────────────────────────────────────────
    case "touch_chart_card":
      return (
        <TouchChartCard
          title={asStr(p.title, "Vendas por Praça")}
          subtitle={asStr(p.subtitle)}
          series={[
            { key: "ro", label: "Rondônia (69)", color: "#4f46e5" },
            { key: "am", label: "Amazonas (92)", color: "#10b981" },
          ]}
          hiddenSeriesKeys={hiddenSeries}
          onToggleSeries={(k) =>
            setHiddenSeries((prev) =>
              prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
            )
          }
          className="h-full w-full"
        >
          <div className="h-full w-full flex items-end justify-around gap-3 px-4 py-3">
            {[
              { lbl: "Salas", ro: 78, am: 86 },
              { lbl: "Quartos", ro: 64, am: 72 },
              { lbl: "Eletro", ro: 92, am: 88 },
              { lbl: "Colchões", ro: 58, am: 69 },
            ].map((b) => (
              <div key={b.lbl} className="flex flex-col items-center gap-1 flex-1">
                <div className="flex items-end gap-1 h-24">
                  {!hiddenSeries.includes("ro") && (
                    <div className="w-4 rounded-t bg-indigo-500" style={{ height: `${b.ro}%` }} />
                  )}
                  {!hiddenSeries.includes("am") && (
                    <div className="w-4 rounded-t bg-emerald-500" style={{ height: `${b.am}%` }} />
                  )}
                </div>
                <span className="text-[10px] text-zinc-500">{b.lbl}</span>
              </div>
            ))}
          </div>
        </TouchChartCard>
      );

    case "expandable_data_card":
      return (
        <div className="h-full w-full overflow-auto">
          <ExpandableDataCard
            componentId={element.componentId}
            code={asStr(p.code, "FIL-01")}
            title={asStr(p.title, "Porto Velho — Centro (RO)")}
            subtitle={asStr(p.subtitle)}
            primaryValue={asStr(p.primaryValue, "R$ 482.900")}
            primaryLabel={asStr(p.primaryLabel, "Faturamento")}
            progress={asNum(p.progress, 92)}
            progressLabel={asStr(p.progressLabel, "92% da meta")}
            tone={asStr(p.tone, "brand") as "default" | "brand" | "success" | "warning" | "danger" | "info"}
            details={[
              { label: "Ticket Médio", value: "R$ 2.840,00" },
              { label: "Entregas Concluídas", value: "168" },
            ]}
          />
        </div>
      );

    case "kpi_carousel":
      return (
        <div className="h-full w-full overflow-hidden">
          <KpiCarousel
            componentId={element.componentId}
            desktopColumns={Math.min(6, Math.max(2, asNum(p.desktopColumns, 4))) as 2 | 3 | 4 | 5 | 6}
            showDots={asBool(p.showDots, true)}
            items={[
              { id: "k1", title: "Faturamento RO", value: "R$ 842K", trend: { value: 12, label: "vs. anterior" } },
              { id: "k2", title: "Faturamento AM", value: "R$ 918K", trend: { value: 16, label: "vs. anterior" } },
              { id: "k3", title: "Montagens Hoje", value: "64 OS", trend: { value: 9.8, label: "SLA" } },
              { id: "k4", title: "Ticket Médio", value: "R$ 2.940", trend: { value: 4.2, label: "vs. anterior" } },
            ]}
          />
        </div>
      );

    case "data_table":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
          <DataTable<DemoProductRow>
            title={asStr(p.title, "Catálogo de Produtos")}
            description={asStr(p.description)}
            columns={DEMO_DATATABLE_COLS}
            rows={DEMO_PRODUCT_ROWS}
            rowKey={(r) => r.id}
            globalSearch={asBool(p.globalSearch, true)}
            pagination={asBool(p.pagination, true)}
            showSummary={asBool(p.showSummary, true)}
            defaultPageSize={asNum(p.defaultPageSize, 5)}
            size="sm"
          />
        </div>
      );

    case "spreadsheet":
      return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Spreadsheet<DemoProductRow>
            title={asStr(p.title, "Planilha de Reposição")}
            description={asStr(p.description)}
            columns={DEMO_SPREADSHEET_COLS}
            rows={DEMO_PRODUCT_ROWS}
            rowKey={(r) => r.id}
            height={Math.max(180, element.height - 84)}
            showFooter={asBool(p.showFooter, true)}
            showRowNumbers={asBool(p.showRowNumbers, true)}
          />
        </div>
      );

    case "inbox_list":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <InboxList
            componentId={element.componentId}
            items={DEMO_INBOX_ITEMS}
            selectedId={inboxSelected}
            onSelect={(id) => interactive && setInboxSelected(id)}
          />
        </div>
      );

    case "json_viewer":
      return (
        <div className="h-full w-full overflow-hidden">
          <JsonViewer
            componentId={element.componentId}
            title={asStr(p.title, "Payload NF-e")}
            rootName={asStr(p.rootName, "pedido")}
            defaultExpandDepth={asNum(p.defaultExpandDepth, 2)}
            searchable={asBool(p.searchable, true)}
            showToolbar={asBool(p.showToolbar, true)}
            maxHeight={Math.max(120, element.height - 56)}
            data={{
              numero: "PED-9041",
              empresa: "Lopes Sistemas Corporativos Ltda.",
              praca: "Porto Velho - RO (69)",
              itens: ["Sofá Retrátil Bari 2,90m", "Painel Ripado 2,20m"],
              totalBrl: 4890.0,
              montagemInclusa: true,
            }}
          />
        </div>
      );

    // ── Ações & Feedback ────────────────────────────────────────────────────
    case "button_group": {
      const labels = asStr(p.labels, "Hoje,Semana,Mês")
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
      return (
        <div className="h-full w-full flex items-center">
          <ButtonGroup
            orientation={asStr(p.orientation, "horizontal") as "horizontal" | "vertical"}
            attached={asBool(p.attached, true)}
          >
            {labels.map((lbl, i) => (
              <Button
                key={i}
                size="sm"
                variant={i === 0 ? "primary" : "outline"}
                onClick={() => interactive && toast.info(`Período: ${lbl}`)}
              >
                {lbl}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      );
    }

    case "toggle_group":
      return (
        <div className="h-full w-full flex items-center">
          <ToggleGroup
            componentId={element.componentId}
            type={asStr(p.type, "single") as "single" | "multiple"}
            variant={asStr(p.variant, "outline") as "default" | "outline"}
            size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
            options={[
              { value: "grid", label: "Grade", icon: <LayoutGrid size={14} /> },
              { value: "list", label: "Lista", icon: <List size={14} /> },
              { value: "table", label: "Tabela", icon: <Table2 size={14} /> },
            ]}
          />
        </div>
      );

    case "speed_dial":
      return (
        <div className="relative h-full w-full rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-2">
          <SpeedDial
            position="inline"
            direction={asStr(p.direction, "right") as "up" | "down" | "left" | "right"}
            variant={asStr(p.variant, "primary") as "primary" | "dark" | "light"}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            showLabels={asBool(p.showLabels, true)}
            actions={[
              { id: "new", label: "Novo Pedido", icon: ShoppingBag, onClick: () => interactive && toast.success("Novo Pedido") },
              { id: "search", label: "Buscar SKU", icon: Search, onClick: () => interactive && toast.info("Buscar SKU") },
            ]}
          />
        </div>
      );

    case "float_button": {
      const Icon = resolveIcon(p.iconName, Plus);
      return (
        <div className="h-full w-full flex items-center justify-center">
          <FloatButton
            floating={false}
            icon={Icon}
            tooltip={asStr(p.tooltip, "Novo Atendimento")}
            type={asStr(p.type, "primary") as "primary" | "default"}
            shape={asStr(p.shape, "circle") as "circle" | "square"}
            onClick={() => interactive && toast.success(asStr(p.tooltip, "Ação executada!"))}
          />
        </div>
      );
    }

    case "sortable_list":
      return (
        <div className="h-full w-full overflow-auto">
          <SortableList
            componentId={element.componentId}
            items={sortItems}
            onChange={(next) => interactive && setSortItems(next)}
            keyExtractor={(item) => item.id}
            showIndex={asBool(p.showIndex, true)}
            showMoveButtons={asBool(p.showMoveButtons, true)}
            renderItem={(item) => (
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {item.title}
              </span>
            )}
          />
        </div>
      );

    case "pull_to_refresh":
      return (
        <div className="relative h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden p-3">
          <PullToRefresh
            onRefresh={async () => {
              if (interactive) toast.success("Estoque RO/AM sincronizado!");
            }}
          />
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {asStr(p.title, "Puxe para atualizar")}
            </p>
            <p className="text-[11px] text-zinc-500">{asStr(p.subtitle)}</p>
          </div>
        </div>
      );

    case "swap":
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Swap
            componentId={element.componentId}
            defaultActive={asBool(p.defaultActive, true)}
            effect={asStr(p.effect, "rotate") as "rotate" | "flip" | "fade"}
            onElement={
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Check size={14} /> {asStr(p.onLabel, "Ativo")}
              </span>
            }
            offElement={
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {asStr(p.offLabel, "Inativo")}
              </span>
            }
          />
        </div>
      );

    case "state": {
      const kind = asStr(p.kind, "empty");
      if (kind === "result") {
        return (
          <div className="h-full w-full overflow-auto">
            <State
              kind="result"
              status={asStr(p.status, "success") as "success" | "info" | "warning" | "error"}
              title={asStr(p.title, "Operação concluída")}
              subTitle={asStr(p.description)}
              size="sm"
            />
          </div>
        );
      }
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center">
          <State
            kind="empty"
            title={asStr(p.title, "Nenhum registro encontrado")}
            description={asStr(p.description)}
            size="sm"
          />
        </div>
      );
    }

    case "toast":
      return (
        <div
          className="h-full w-full flex items-center"
          onClick={() => interactive && toast.success(asStr(p.message, "Notificação disparada!"))}
        >
          <ToastPreview
            type={asStr(p.type, "success") as "success" | "info" | "warning" | "error" | "default"}
            message={asStr(p.message, "NF-e autorizada com sucesso!")}
            description={asStr(p.description)}
            closeButton={asBool(p.closeButton, true)}
            className="w-full"
          />
        </div>
      );

    case "loading":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center p-3">
          <Loading
            variant={asStr(p.variant, "spinner") as "spinner" | "dots" | "ring" | "bars"}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            tone={asStr(p.tone, "primary") as "default" | "primary" | "success" | "warning" | "danger" | "info"}
            label={asStr(p.label, "Carregando...")}
          />
        </div>
      );

    case "form_modal":
      return (
        <div className="h-full w-full flex items-center">
          <Button
            componentId={element.componentId}
            variant="primary"
            fullWidth
            onClick={() => interactive && setOverlayOpen(true)}
          >
            {asStr(p.triggerLabel, "Abrir FormModal")}
          </Button>
          {interactive && (
            <FormModal
              open={overlayOpen}
              onClose={() => setOverlayOpen(false)}
              title={asStr(p.title, "Cadastro de Produto")}
              subtitle={asStr(p.subtitle)}
              code={asStr(p.code, "SKU-4821")}
              tabs={[
                { id: "geral", label: "Dados Gerais" },
                { id: "estoque", label: "Estoque RO/AM" },
              ]}
              activeTab={formTab}
              onTabChange={setFormTab}
              onSave={() => {
                setOverlayOpen(false);
                toast.success("Cadastro salvo!");
              }}
            >
              <FormSectionHeader title="Identificação" description="Cadastro Corporativo Lopes" />
              <TextField label="Descrição do Produto" defaultValue="Sofá Retrátil Bari 2,90m" />
            </FormModal>
          )}
        </div>
      );

    case "confirm": {
      const mode = asStr(p.mode, "dialog");
      if (mode === "popover") {
        return (
          <div className="h-full w-full flex items-center">
            <Confirm
              mode="popover"
              tone={asStr(p.tone, "danger") as "danger" | "warning" | "info"}
              title={asStr(p.title, "Confirmar ação?")}
              description={asStr(p.description)}
              onConfirm={() => interactive && toast.success("Confirmado!")}
            >
              <Button variant="destructive" fullWidth>
                {asStr(p.triggerLabel, "Confirmar (Popover)")}
              </Button>
            </Confirm>
          </div>
        );
      }
      return (
        <div className="h-full w-full flex items-center">
          <Button
            variant="destructive"
            fullWidth
            onClick={() => interactive && setOverlayOpen(true)}
          >
            {asStr(p.triggerLabel, "Confirmar Ação")}
          </Button>
          {interactive && (
            <Confirm
              open={overlayOpen}
              tone={asStr(p.tone, "danger") as "danger" | "warning" | "info"}
              title={asStr(p.title, "Confirmar ação?")}
              description={asStr(p.description)}
              confirmLabel={asStr(p.confirmLabel, "Confirmar")}
              onConfirm={() => {
                setOverlayOpen(false);
                toast.success("Confirmado!");
              }}
              onCancel={() => setOverlayOpen(false)}
            />
          )}
        </div>
      );
    }

    case "unsaved_changes_dialog":
      return (
        <div className="h-full w-full flex items-center">
          <Button
            componentId={element.componentId}
            variant="warning-outline"
            fullWidth
            onClick={() => interactive && setOverlayOpen(true)}
          >
            {asStr(p.triggerLabel, "Alterações Não Salvas")}
          </Button>
          {interactive && (
            <UnsavedChangesDialog
              open={overlayOpen}
              title={asStr(p.title)}
              description={asStr(p.description)}
              onContinue={() => setOverlayOpen(false)}
              onDiscard={() => {
                setOverlayOpen(false);
                toast.info("Alterações descartadas");
              }}
              onSave={() => {
                setOverlayOpen(false);
                toast.success("Alterações salvas!");
              }}
            />
          )}
        </div>
      );

    default:
      return null;
  }
}
