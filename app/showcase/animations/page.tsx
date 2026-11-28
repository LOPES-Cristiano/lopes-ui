"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DemoCard, HR, PropsTable, SectionHeader } from "@/app/showcase/_shared";
import Accordion from "@/components/Accordion";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardBody, CardHeader } from "@/components/Card";
import CommandMenu from "@/components/CommandMenu";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Drawer, { type DrawerSide } from "@/components/Drawer";
import FormModal, { FormSection, FormSectionHeader, type FormTabItem } from "@/components/FormModal";
import Loading, { Spin } from "@/components/Loading";
import OTPInput from "@/components/OTPInput";
import Pagination from "@/components/Pagination";
import PasswordStrength from "@/components/PasswordStrength";
import Progress, { RadialProgress } from "@/components/Progress";
import SegmentedControl from "@/components/SegmentedControl";
import StatCard, { StatsRingCard, StatsSegmentsCard } from "@/components/StatCard";
import Stepper from "@/components/Stepper";
import Tabs from "@/components/Tabs";
import Timeline from "@/components/Timeline";
import toast, { ToastPreview, type ToastPosition } from "@/components/Toast";
import Checkbox from "@/components/form/Checkbox";
import { Rating } from "@/components/form/RatingField";
import Switch from "@/components/form/Switch";
import TextField from "@/components/form/TextField";
import {
  Bell,
  Building2,
  CheckCircle2,
  Loader2,
  Minus,
  Package,
  PanelRightOpen,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Wand2,
} from "lucide-react";

type EstoqueRow = {
  id: number;
  sku: string;
  produto: string;
  categoria: string;
  filial: string;
  estoque: number;
  preco: string;
  status: "Disponível" | "Estoque Baixo" | "Em Trânsito";
};

const ESTOQUE_ROWS: EstoqueRow[] = [
  {
    id: 1,
    sku: "BL-SF-301",
    produto: "Sofá Retrátil e Reclinável 3 Lugares Suede",
    categoria: "Estofados",
    filial: "Porto Velho (RO)",
    estoque: 18,
    preco: "R$ 3.490,00",
    status: "Disponível",
  },
  {
    id: 2,
    sku: "BL-EL-410",
    produto: "Geladeira Frost Free Duplex 410L Inox",
    categoria: "Eletrodomésticos",
    filial: "Manaus Centro (AM)",
    estoque: 5,
    preco: "R$ 3.899,00",
    status: "Estoque Baixo",
  },
  {
    id: 3,
    sku: "BL-CL-158",
    produto: "Colchão Queen Molas Ensacadas + Box",
    categoria: "Colchões",
    filial: "Ji-Paraná (RO)",
    estoque: 12,
    preco: "R$ 2.650,00",
    status: "Disponível",
  },
  {
    id: 4,
    sku: "BL-MV-602",
    produto: "Guarda-Roupa Casal 6 Portas com Espelho",
    categoria: "Móveis",
    filial: "Manaus Zona Leste (AM)",
    estoque: 0,
    preco: "R$ 2.190,00",
    status: "Em Trânsito",
  },
  {
    id: 5,
    sku: "BL-EL-515",
    produto: "Fogão 5 Bocas Mesa de Vidro Temperado",
    categoria: "Eletrodomésticos",
    filial: "Ariquemes (RO)",
    estoque: 9,
    preco: "R$ 1.749,00",
    status: "Disponível",
  },
  {
    id: 6,
    sku: "BL-EL-130",
    produto: "Lavadora Automática 13kg Ciclo Rápido",
    categoria: "Lavanderia",
    filial: "Porto Velho (RO)",
    estoque: 3,
    preco: "R$ 2.340,00",
    status: "Estoque Baixo",
  },
];

const ESTOQUE_COLUMNS: DataTableColumn<EstoqueRow>[] = [
  {
    key: "sku",
    label: "SKU",
    width: 115,
    render: (val) => (
      <span className="font-mono text-xs font-semibold text-muted-foreground">{val}</span>
    ),
  },
  {
    key: "produto",
    label: "Produto",
    render: (val, row) => (
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{val}</div>
        <div className="text-[11px] text-muted-foreground">{row.categoria}</div>
      </div>
    ),
  },
  { key: "filial", label: "Filial" },
  {
    key: "estoque",
    label: "Qtd.",
    align: "center",
    width: 80,
    render: (val) => <span className="font-mono text-xs font-semibold tabular-nums">{val}</span>,
  },
  { key: "preco", label: "Preço", align: "right", width: 120 },
  {
    key: "status",
    label: "Status",
    width: 130,
    render: (val: EstoqueRow["status"]) => (
      <Badge
        appearance="soft"
        variant={
          val === "Disponível"
            ? "success"
            : val === "Estoque Baixo"
              ? "warning"
              : "info"
        }
      >
        {val}
      </Badge>
    ),
  },
];

const FORM_MODAL_TABS: FormTabItem[] = [
  { id: "produto", label: "Dados do Produto", icon: <Package size={15} /> },
  { id: "filiais", label: "Estoque RO / AM", icon: <Building2 size={15} />, badge: 4 },
  { id: "entrega", label: "Logística & Montagem", icon: <Truck size={15} /> },
];

const TOAST_POSITIONS: ReadonlyArray<{ value: ToastPosition; label: string }> = [
  { value: "top-left", label: "Superior Esq." },
  { value: "top-center", label: "Superior Centro" },
  { value: "top-right", label: "Superior Dir." },
  { value: "bottom-left", label: "Inferior Esq." },
  { value: "bottom-center", label: "Inferior Centro" },
  { value: "bottom-right", label: "Inferior Dir." },
];

export default function AnimationsShowcasePage() {
  // Toast position state
  const [toastPos, setToastPos] = useState<ToastPosition>("top-right");

  // DataTable & Loading states
  const [tableVariant, setTableVariant] = useState<"animated" | "default">("animated");
  const [tableLoading, setTableLoading] = useState(true);
  const [spinActive, setSpinActive] = useState(true);

  // FormDrawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState<"default" | "animated">("animated");
  const [drawerSide, setDrawerSide] = useState<DrawerSide>("right");
  const [drawerNome, setDrawerNome] = useState("Sofá Retrátil 3 Lugares Suede");
  const [drawerFilial, setDrawerFilial] = useState("Porto Velho (RO) — (69) 3211-4400");

  // FormModal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"default" | "animated">("animated");
  const [modalTab, setModalTab] = useState("produto");
  const [modalLoading, setModalLoading] = useState(false);

  // Leva 2 states (Button, Switch, Checkbox, Tabs, Segmented, Progress)
  const [btnLoading, setBtnLoading] = useState(false);
  const [swNotif, setSwNotif] = useState(true);
  const [swSync, setSwSync] = useState(false);
  const [swAuto, setSwAuto] = useState(true);
  const [chkA, setChkA] = useState(true);
  const [chkB, setChkB] = useState(false);
  const [chkC, setChkC] = useState(false);
  const [segFilial, setSegFilial] = useState("pvh");
  const [progressVal, setProgressVal] = useState(68);
  const [progressIndeterminate, setProgressIndeterminate] = useState(false);

  // Leva 3 states (ConfirmDialog)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<"danger" | "warning" | "info">("danger");

  const simulateTableReload = () => {
    setTableLoading(true);
    window.setTimeout(() => {
      setTableLoading(false);
      toast.success("Estoque sincronizado com sucesso!", {
        variant: "animated",
        description: "6 itens atualizados nas filiais de RO e AM.",
      });
    }, 2200);
  };

  const openDrawerWith = (variant: "default" | "animated", side: DrawerSide = drawerSide) => {
    setDrawerVariant(variant);
    setDrawerSide(side);
    setDrawerOpen(true);
  };

  const openModalWith = (variant: "default" | "animated", withLoading = false) => {
    setModalVariant(variant);
    setModalTab("produto");
    setModalLoading(withLoading);
    setModalOpen(true);
    if (withLoading) {
      window.setTimeout(() => setModalLoading(false), 1800);
    }
  };

  const currentTabIdx = FORM_MODAL_TABS.findIndex((t) => t.id === modalTab);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <SectionHeader
        label="Laboratório · Animações"
        title="Animações Padrão (v1.5.0)"
        description="A variante animated é o padrão da Lopes UI em Toast, Loading/Spin, DataTable, Drawer, Modal/FormModal, Button, Switch/Checkbox, Tabs, Progress, Accordion, ConfirmDialog, CommandMenu, Alert, Badge, Stepper e StatCard — com física de mola (motion/react), ícones vetoriais desenhados ao vivo, shimmers em onda diagonal e suporte completo a prefers-reduced-motion."
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          1. TOASTS · ANIMATED
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="toast-animated" title="1. Toast — variant='animated' vs default">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() =>
                toast.success("Pedido #4821 faturado!", {
                  variant: "animated",
                  position: toastPos,
                  description: "Sofá Retrátil 3 Lugares · Filial Porto Velho (RO)",
                  closeButton: true,
                })
              }
            >
              Success (animated)
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.info("Transferência em rota", {
                  variant: "animated",
                  position: toastPos,
                  description: "Carga expedida do CD Manaus (AM) para Ariquemes (RO).",
                  action: {
                    label: "Rastrear",
                    onClick: () =>
                      toast.success("Rastreio aberto", {
                        variant: "animated",
                        position: toastPos,
                        duration: 2500,
                      }),
                  },
                })
              }
            >
              Info + Ação (animated)
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.warning("Estoque baixo na filial", {
                  variant: "animated",
                  position: toastPos,
                  description: "Geladeira Frost Free 410L com apenas 5 unidades em Manaus.",
                  closeButton: true,
                })
              }
            >
              Warning (animated)
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                toast.error("Falha ao emitir NF-e", {
                  variant: "animated",
                  position: toastPos,
                  description: "Tempo limite excedido na comunicação com a SEFAZ.",
                  closeButton: true,
                })
              }
            >
              Error (animated)
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Loader2 size={14} />}
              onClick={() => {
                const p = new Promise<void>((resolve) => setTimeout(resolve, 1800));
                void toast.promise(
                  p,
                  {
                    loading: "Sincronizando tabela de preços...",
                    success: "Tabela atualizada em todas as lojas RO/AM!",
                    error: "Erro ao sincronizar.",
                  },
                  { variant: "animated", position: toastPos },
                );
              }}
            >
              Promise (animated)
            </Button>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Bell size={14} />}
              onClick={() =>
                toast.success("Toast padrão (default)", {
                  variant: "default",
                  position: toastPos,
                  description: "Compare a entrada linear com a variante animated.",
                })
              }
            >
              Comparar com Default
            </Button>
          </div>

          {/* Seletor das 6 posições da tela */}
          <div className="rounded-[var(--radius-card)] border border-border bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">
                Posição na tela:{" "}
                <code className="font-mono text-brand">{toastPos}</code>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  TOAST_POSITIONS.forEach((p, idx) => {
                    window.setTimeout(() => {
                      toast.success(`Posição: ${p.value}`, {
                        variant: "animated",
                        position: p.value,
                        description: p.label,
                        duration: 3800,
                      });
                    }, idx * 140);
                  });
                }}
              >
                Disparar nas 6 posições
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TOAST_POSITIONS.map((p) => {
                const active = toastPos === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setToastPos(p.value);
                      toast.info(`Toast em ${p.value}`, {
                        variant: "animated",
                        position: p.value,
                        description: p.label,
                        duration: 3000,
                      });
                    }}
                    className={`rounded-[var(--radius-control)] border px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                      active
                        ? "border-brand bg-brand-soft text-brand-soft-foreground font-semibold"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    <div className="truncate">{p.label}</div>
                    <div className="font-mono text-[10px] opacity-75">{p.value}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Dica: nos toasts com <code className="font-mono text-brand">variant=&quot;animated&quot;</code>, você também pode{" "}
            <strong className="text-foreground">arrastar lateralmente</strong> para dispensar e passar o mouse para sentir a elevação tátil.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Preview · default
              </span>
              <ToastPreview
                type="success"
                variant="default"
                message="Pedido #4821 faturado!"
                description="Sofá Retrátil 3 Lugares · Filial Porto Velho (RO)"
                closeButton
              />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                Preview · animated
              </span>
              <ToastPreview
                type="success"
                variant="animated"
                message="Pedido #4821 faturado!"
                description="Sofá Retrátil 3 Lugares · Filial Porto Velho (RO)"
                closeButton
              />
            </div>
          </div>
        </div>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          2. LOADING & DATATABLE · ANIMATED
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard
        id="datatable-loading-animated"
        title="2. Loading & DataTable — estado de loading bonitão (variant='animated')"
      >
        <div className="space-y-6">
          {/* Strip de Loadings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-card)] border border-border bg-muted/20 p-4 space-y-3">
              <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Wand2 size={14} className="text-brand" />
                <span>Loading · variant=&quot;animated&quot; (tamanhos & tons)</span>
              </div>
              <div className="flex flex-wrap items-center gap-5 pt-1">
                <Loading variant="animated" size="xs" tone="primary" />
                <Loading variant="animated" size="sm" tone="info" />
                <Loading variant="animated" size="md" tone="primary" />
                <Loading variant="animated" size="lg" tone="success" />
                <Loading variant="animated" size="xl" tone="warning" />
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Spin Overlay · variant=&quot;animated&quot;
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSpinActive((v) => !v)}
                >
                  {spinActive ? "Pausar Spin" : "Ativar Spin"}
                </Button>
              </div>
              <Spin
                spinning={spinActive}
                variant="animated"
                size="md"
                tip="Calculando estoque consolidado..."
              >
                <div className="rounded-lg border border-border bg-surface p-3.5 text-xs space-y-1">
                  <div className="font-semibold text-foreground">CD Manaus (AM) · Setor Eletro</div>
                  <div className="text-muted-foreground">
                    142 itens conferidos · Última sincronização há 2 min
                  </div>
                </div>
              </Spin>
            </div>
          </div>

          {/* Controles da DataTable */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border bg-muted/25 px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Variante:</span>
              <Button
                size="sm"
                variant={tableVariant === "animated" ? "primary" : "outline"}
                onClick={() => setTableVariant("animated")}
              >
                animated
              </Button>
              <Button
                size="sm"
                variant={tableVariant === "default" ? "primary" : "outline"}
                onClick={() => setTableVariant("default")}
              >
                default
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<RefreshCw size={13} />}
                onClick={simulateTableReload}
              >
                Simular carregamento (2.2s)
              </Button>
              <Button
                size="sm"
                variant={tableLoading ? "primary" : "outline"}
                onClick={() => setTableLoading((v) => !v)}
              >
                {tableLoading ? "Mostrar Dados" : "Manter em Loading"}
              </Button>
            </div>
          </div>

          {/* DataTable com estado de loading animado */}
          <DataTable<EstoqueRow>
            variant={tableVariant}
            animatedLoading={tableVariant === "animated"}
            title="Estoque Corporativo — Filiais"
            description="Alterne entre loading e dados para comparar a onda shimmer diagonal e a barra indeterminada no topo."
            columns={ESTOQUE_COLUMNS}
            rows={ESTOQUE_ROWS}
            rowKey={(r) => r.id}
            loading={tableLoading}
            loadingLabel="Consultando estoque nas filiais RO/AM..."
            selectable
            globalSearch
            searchPlaceholder="Buscar produto, SKU ou filial..."
            pageSize={6}
            pagination
          />
        </div>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          3. FORMDRAWER (DRAWER) · ANIMATED
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="form-drawer-animated" title="3. FormDrawer (Drawer form) — variant='animated' vs default">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            O <code className="font-mono text-brand">Drawer</code> com <code className="font-mono text-brand">form</code> (antigo FormDrawer) agora aceita{" "}
            <code className="font-mono text-brand">variant=&quot;animated&quot;</code>: entrada com física de mola, backdrop suave e entrada escalonada do ícone do cabeçalho, bloco de resumo, campos e rodapé.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() => openDrawerWith("animated", "right")}
            >
              FormDrawer · animated (Direita)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PanelRightOpen size={14} />}
              onClick={() => openDrawerWith("animated", "left")}
            >
              FormDrawer · animated (Esquerda)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openDrawerWith("animated", "bottom")}
            >
              FormDrawer · animated (Inferior)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDrawerWith("default", "right")}
            >
              Comparar com Default
            </Button>
          </div>
        </div>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          variant={drawerVariant}
          side={drawerSide}
          size="md"
          form
          headerIcon={<Package size={18} />}
          title="Cadastro Rápido de Item"
          description={`Modo: variant="${drawerVariant}" · Lado: ${drawerSide}`}
          summary={
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-foreground">Lopes ERP</div>
                <div className="text-[11px] text-muted-foreground">
                  Conforto e qualidade para o seu lar · Praças RO e AM
                </div>
              </div>
              <Badge appearance="soft" variant={drawerVariant === "animated" ? "primary" : "neutral"}>
                {drawerVariant}
              </Badge>
            </div>
          }
          footer={({ requestClose }) => (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={requestClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDrawerOpen(false);
                  toast.success("Item salvo com sucesso!", {
                    variant: drawerVariant,
                    description: `${drawerNome} · ${drawerFilial}`,
                  });
                }}
              >
                Salvar Produto
              </Button>
            </div>
          )}
        >
          <TextField
            label="Descrição do Produto"
            value={drawerNome}
            onChange={(e) => setDrawerNome(e.target.value)}
            placeholder="Ex.: Sofá Retrátil 3 Lugares"
          />
          <TextField
            label="Filial / Telefone"
            value={drawerFilial}
            onChange={(e) => setDrawerFilial(e.target.value)}
            placeholder="Ex.: Porto Velho (RO) — (69) 3211-4400"
          />
          <div className="rounded-[var(--radius-control)] border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Repare como o painel chega com amortecimento elástico (spring) e os blocos internos entram em sequência suave sem parecer pesado.
          </div>
        </Drawer>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          4. FORMMODAL · ANIMATED
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="form-modal-animated" title="4. FormModal — variant='animated' vs default">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            No <code className="font-mono text-brand">FormModal</code> com{" "}
            <code className="font-mono text-brand">variant=&quot;animated&quot;</code>, o modal abre com spring scale + elevação, a troca entre abas faz transição fluida (<code className="font-mono text-brand">AnimatePresence</code>) e o estado <code className="font-mono text-brand">loading</code> usa o skeleton com onda shimmer.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() => openModalWith("animated", false)}
            >
              Abrir FormModal · animated
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Loader2 size={14} />}
              onClick={() => openModalWith("animated", true)}
            >
              FormModal · animated (com Loading)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModalWith("default", false)}
            >
              Comparar com Default
            </Button>
          </div>
        </div>

        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          variant={modalVariant}
          size="lg"
          title="Cadastro de Produto — Lopes ERP"
          subtitle={`Testando variant="${modalVariant}" com abas animadas e skeleton`}
          code="BL-SF-301"
          avatar={{ initials: "BL" }}
          badge={
            <Badge appearance="soft" variant={modalVariant === "animated" ? "primary" : "neutral"}>
              {modalVariant}
            </Badge>
          }
          loading={modalLoading}
          tabs={FORM_MODAL_TABS}
          activeTab={modalTab}
          onTabChange={setModalTab}
          onBack={
            currentTabIdx > 0
              ? () => setModalTab(FORM_MODAL_TABS[currentTabIdx - 1].id)
              : undefined
          }
          onNext={
            currentTabIdx < FORM_MODAL_TABS.length - 1
              ? () => setModalTab(FORM_MODAL_TABS[currentTabIdx + 1].id)
              : undefined
          }
          headerActions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setModalLoading((v) => !v)}
            >
              {modalLoading ? "Parar Loading" : "Testar Skeleton"}
            </Button>
          }
          onSave={() => {
            setModalOpen(false);
            toast.success("Cadastro atualizado!", {
              variant: modalVariant,
              description: "Produto salvo com sucesso na base corporativa.",
            });
          }}
        >
          {modalTab === "produto" && (
            <FormSection>
              <FormSectionHeader
                title="Identificação do Produto"
                description="Navegue entre as abas na lateral para ver a transição fluida do conteúdo."
                icon={<Package size={14} className="text-brand" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Nome do Produto" defaultValue="Sofá Retrátil 3 Lugares Suede" />
                <TextField label="Linha / Categoria" defaultValue="Salas & Estofados" />
                <TextField label="SKU" defaultValue="BL-SF-301" />
                <TextField label="Preço Sugerido" defaultValue="R$ 3.490,00" />
              </div>
            </FormSection>
          )}

          {modalTab === "filiais" && (
            <FormSection>
              <FormSectionHeader
                title="Distribuição nas Praças (RO e AM)"
                description="Saldo disponível para venda imediata e reserva de entrega."
                icon={<Building2 size={14} className="text-brand" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Porto Velho (RO)" defaultValue="18 unidades · (69) 3211-4400" />
                <TextField label="Ji-Paraná (RO)" defaultValue="12 unidades · (69) 3422-1800" />
                <TextField label="Manaus Centro (AM)" defaultValue="9 unidades · (92) 3622-5100" />
                <TextField label="Ariquemes (RO)" defaultValue="6 unidades · (69) 3535-2900" />
              </div>
            </FormSection>
          )}

          {modalTab === "entrega" && (
            <FormSection>
              <FormSectionHeader
                title="Logística & Montagem"
                description="Regras de entrega própria e agendamento de montagem residencial."
                icon={<Truck size={14} className="text-brand" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Prazo Médio de Entrega" defaultValue="2 a 4 dias úteis" />
                <TextField label="Montagem Inclusa" defaultValue="Sim — equipe própria" />
              </div>
            </FormSection>
          )}
        </FormModal>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          5. BUTTON · TRANSIÇÃO LOADING
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="button-animated" title="5. Button — transição suave para loading + loader orbital">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ao alternar <code className="font-mono text-brand">loading</code>, o conteúdo do botão faz transição suave com{" "}
            <code className="font-mono text-brand">AnimatePresence</code> e exibe o novo indicador orbital vetorial herdando a cor do botão.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              loading={btnLoading}
              loadingText="Salvando..."
              onClick={() => {
                setBtnLoading(true);
                window.setTimeout(() => setBtnLoading(false), 1800);
              }}
            >
              Salvar Pedido
            </Button>
            <Button
              variant="outline"
              loading={btnLoading}
              loadingText="Consultando..."
              onClick={() => setBtnLoading((v) => !v)}
            >
              Consultar Estoque
            </Button>
            <Button
              variant="success"
              loading={btnLoading}
              loadingText="Faturando..."
              onClick={() => setBtnLoading((v) => !v)}
            >
              Emitir NF-e
            </Button>
            <Button
              variant="destructive"
              loading={btnLoading}
              loadingText="Cancelando..."
              onClick={() => setBtnLoading((v) => !v)}
            >
              Cancelar Nota
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBtnLoading((v) => !v)}
            >
              {btnLoading ? "Parar loading" : "Alternar loading"}
            </Button>
          </div>
        </div>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          6. SWITCH & CHECKBOX · SPRING & PATH DRAW
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="switch-checkbox-animated" title="6. Switch & Checkbox — mola tátil + desenho SVG do check">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Switch (spring + squash &amp; stretch)
            </span>
            <div className="space-y-3">
              <Switch
                size="sm"
                color="primary"
                checked={swNotif}
                onChange={setSwNotif}
                inlineLabel="Alertas de estoque baixo"
                description="Notificar gerente quando saldo ficar abaixo do mínimo."
              />
              <Switch
                size="md"
                color="emerald"
                checked={swSync}
                onChange={setSwSync}
                inlineLabel="Sincronização automática CD Manaus (AM)"
                description="Atualiza vitrine e saldo a cada 5 minutos."
              />
              <Switch
                size="lg"
                color="sky"
                checked={swAuto}
                onChange={setSwAuto}
                inlineLabel="Montagem agendada automática"
                description="Reserva equipe de montagem após faturamento."
              />
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Checkbox (desenho animado SVG pathLength)
            </span>
            <div className="space-y-3">
              <Checkbox
                size="sm"
                checked={chkA}
                onCheckedChange={setChkA}
                label="Conferência de estofados concluída"
                description="Verificação visual antes do carregamento na doca."
              />
              <Checkbox
                size="md"
                checked={chkB}
                onCheckedChange={setChkB}
                label="Incluir garantia estendida para eletrodomésticos"
                description="Cobertura adicional de 12 meses nas praças RO e AM."
              />
              <Checkbox
                size="md"
                checked={chkC}
                indeterminate={!chkC}
                onCheckedChange={setChkC}
                label="Seleção parcial de filiais (indeterminate → checked)"
                description="Clique para alternar entre traço parcial e check completo."
              />
            </div>
          </div>
        </div>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          7. TABS & SEGMENTED CONTROL
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="tabs-segmented-animated" title="7. Tabs & SegmentedControl — indicador spring + painel suave">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              SegmentedControl · Filiais
            </span>
            <div>
              <SegmentedControl
                value={segFilial}
                onChange={setSegFilial}
                data={[
                  { value: "pvh", label: "Porto Velho (RO)" },
                  { value: "jpr", label: "Ji-Paraná (RO)" },
                  { value: "mao", label: "Manaus (AM)" },
                  { value: "arq", label: "Ariquemes (RO)" },
                ]}
              />
            </div>
          </div>

          <Tabs
            variant="pills"
            defaultValue="salas"
            items={[
              {
                value: "salas",
                label: "Salas & Estofados",
                badge: 24,
                content: (
                  <div className="mt-3 rounded-[var(--radius-control)] border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                    Sofás retráteis, poltronas reclináveis, racks e painéis para sala de estar com pronta entrega em Rondônia e Amazonas.
                  </div>
                ),
              },
              {
                value: "quartos",
                label: "Quartos & Colchões",
                badge: 18,
                content: (
                  <div className="mt-3 rounded-[var(--radius-control)] border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                    Colchões de molas ensacadas, camas box conjugadas e guarda-roupas 6 e 8 portas com montagem própria.
                  </div>
                ),
              },
              {
                value: "eletro",
                label: "Eletrodomésticos",
                badge: 31,
                content: (
                  <div className="mt-3 rounded-[var(--radius-control)] border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                    Geladeiras Frost Free, fogões mesa de vidro, lavadoras automáticas e climatizadores com garantia nacional.
                  </div>
                ),
              },
            ]}
          />
        </div>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          8. PROGRESS & CARD SPOTLIGHT
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="progress-card-animated" title="8. Progress (spring + shimmer) & Card Spotlight">
        <div className="space-y-6">
          {/* Progress */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6 rounded-[var(--radius-card)] border border-border bg-muted/20 p-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setProgressVal((v) => Math.max(0, v - 20))}>
                  -20%
                </Button>
                <Button size="sm" variant="primary" onClick={() => setProgressVal((v) => Math.min(100, v + 20))}>
                  +20%
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setProgressVal(Math.floor(Math.random() * 91) + 10)}
                >
                  Valor Aleatório
                </Button>
                <Button
                  size="sm"
                  variant={progressIndeterminate ? "primary" : "outline"}
                  onClick={() => setProgressIndeterminate((v) => !v)}
                >
                  {progressIndeterminate ? "Modo Determinado" : "Indeterminado"}
                </Button>
              </div>

              <Progress
                value={progressVal}
                indeterminate={progressIndeterminate}
                tone="default"
                size="md"
                showValue
                label="Meta mensal de entregas — Filial Porto Velho (RO)"
              />
              <Progress
                value={Math.min(100, progressVal + 12)}
                tone="success"
                size="sm"
                showValue
                label="Trilha de Formação · Módulo React & TypeScript"
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <RadialProgress value={progressVal} tone="default" size="lg" />
              <RadialProgress value={Math.min(100, progressVal + 12)} tone="success" size="md" />
            </div>
          </div>

          {/* Card Spotlight */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Card com prop spotlight (passe o mouse sobre os cards)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card spotlight hoverable>
                <CardHeader
                  title="Portal Corporativo"
                  description="Gestão de filiais RO/AM"
                  icon={Building2}
                  iconColor="primary"
                />
                <CardBody>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Brilho radial suave acompanhando o ponteiro sem causar re-renders em React.
                  </p>
                </CardBody>
              </Card>

              <Card
                spotlight
                hoverable
                spotlightColor="color-mix(in srgb, var(--success, #10b981) 14%, transparent)"
              >
                <CardHeader
                  title="Expedição & Frota"
                  description="Entregas programadas"
                  icon={Truck}
                  iconColor="success"
                />
                <CardBody>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cor do spotlight customizável via <code className="font-mono text-foreground">spotlightColor</code>.
                  </p>
                </CardBody>
              </Card>

              <Card
                spotlight
                hoverable
                spotlightColor="color-mix(in srgb, var(--info, #0ea5e9) 14%, transparent)"
              >
                <CardHeader
                  title="Formação Plataforma"
                  description="Trilhas interativas"
                  icon={Sparkles}
                  iconColor="info"
                />
                <CardBody>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ideal para cards de módulos, dashboards executivos e vitrines de produtos.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          9. ACCORDION · SPRING CHEVRON & GLIDE
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="accordion-animated" title="9. Accordion — seta com mola + abertura fluida">
        <Accordion
          variant="separated"
          items={[
            {
              id: "acc-1",
              title: "Física de mola nos indicadores",
              badge: "Motion",
              defaultOpen: true,
              content:
                "A rotação do chevron usa mola (stiffness 420, damping 28) combinada com abertura CSS grid 0fr → 1fr e deslizamento vertical suave do conteúdo.",
            },
            {
              id: "acc-2",
              title: "Zero layout shift e SSR-safe",
              badge: "SSR",
              content:
                "Os painéis mantêm o HTML consistente entre servidor e cliente, respeitando prefers-reduced-motion automaticamente.",
            },
            {
              id: "acc-3",
              title: "Pronto para Portal, Lopes Web e Plataforma",
              content:
                "Funciona em todas as variantes (default, separated, splitted, flush e minimal) sem mudar nenhuma prop nas telas existentes.",
            },
          ]}
        />
      </DemoCard>

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          10. CONFIRMDIALOG & COMMANDMENU (⌘K)
          ═══════════════════════════════════════════════════════════════════════ */}
      <DemoCard id="confirm-command-animated" title="10. ConfirmDialog & CommandMenu (⌘K) — spring + destaque deslizante">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              ConfirmDialog (ícone com mola + botão loading sem salto)
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setConfirmVariant("danger");
                  setConfirmOpen(true);
                }}
              >
                Confirm · danger
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setConfirmVariant("warning");
                  setConfirmOpen(true);
                }}
              >
                Confirm · warning
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setConfirmVariant("info");
                  setConfirmOpen(true);
                }}
              >
                Confirm · info
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              CommandMenu (abertura spring + highlight layoutId)
            </span>
            <div>
              <CommandMenu
                triggerLabel="Abrir CommandMenu..."
                items={[
                  {
                    id: "cmd-pedidos",
                    label: "Consultar Pedidos",
                    description: "Listagem e faturamento de vendas",
                    group: "Operacional",
                    shortcut: "G P",
                    onSelect: () => toast.info("Comando: Consultar Pedidos"),
                  },
                  {
                    id: "cmd-estoque",
                    label: "Posição de Estoque",
                    description: "Saldos por filial e centro de distribuição",
                    group: "Operacional",
                    shortcut: "G E",
                    onSelect: () => toast.info("Comando: Posição de Estoque"),
                  },
                  {
                    id: "cmd-novo-item",
                    label: "Cadastrar Novo Produto",
                    description: "Abrir formulário rápido de produto",
                    group: "Ações Rápidas",
                    shortcut: "N",
                    onSelect: () => openModalWith("animated", false),
                  },
                  {
                    id: "cmd-toast",
                    label: "Disparar Toast de Teste",
                    description: "Exibe notificação animada no topo",
                    group: "Ações Rápidas",
                    onSelect: () => toast.success("Comando executado via CommandMenu!"),
                  },
                ]}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Abra e navegue com as setas <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">↑</kbd>{" "}
              <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">↓</kbd> ou com o mouse para ver o destaque deslizando suavemente.
            </p>
          </div>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          variant={confirmVariant}
          title={
            confirmVariant === "danger"
              ? "Excluir registro selecionado?"
              : confirmVariant === "warning"
                ? "Reprocessar lote pendente?"
                : "Confirmar sincronização?"
          }
          description="Ao confirmar, o botão faz transição suave para o estado de carregamento sem alterar a largura."
          confirmLabel="Confirmar agora"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 1200));
            setConfirmOpen(false);
            toast.success("Ação confirmada com sucesso!");
          }}
        />
      </DemoCard>

      <HR />

      {/* 11. ALERT & BADGE (isolado para resposta instantânea) */}
      <AlertBadgeDemo />

      <HR />

      {/* 12. STEPPER (isolado) */}
      <StepperDemo />

      <HR />

      {/* 13. STATCARD (isolado) */}
      <StatCardDemo />

      <HR />

      {/* 14. PAGINATION & TIMELINE (isolado) */}
      <PaginationTimelineDemo />

      <HR />

      {/* 15. RATING, OTPINPUT & PASSWORDSTRENGTH (isolado) */}
      <RatingOtpPasswordDemo />

      <HR />

      {/* ═══════════════════════════════════════════════════════════════════════
          RESUMO DE PROPS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div id="animated-props" className="scroll-mt-20 space-y-3">
        <h3 className="text-base font-bold text-foreground">Resumo dos padrões (v1.5.0)</h3>
        <PropsTable
          rows={[
            [
              "toast / Toaster / ToastPreview",
              'variant?: "animated" | "default"',
              '"animated"',
              "Entrada com mola (spring), arraste lateral para dispensar, ícones vetoriais desenhados ao vivo e barra de progresso.",
            ],
            [
              "Loading / Spin",
              'variant?: "animated" | "spinner" | ...',
              '"animated"',
              "Indicador orbital cinético em grafite + overlay Spin com AnimatePresence e card flutuante.",
            ],
            [
              "DataTable",
              'animatedLoading?: boolean',
              'true',
              "Barra indeterminada no topo em grafite e skeleton com entrada escalonada e onda shimmer diagonal em todas as variantes.",
            ],
            [
              "Drawer (FormDrawer)",
              'variant?: "animated" | "default"',
              '"animated"',
              "Deslizamento com física de mola por qualquer lado e entrada escalonada do conteúdo interno.",
            ],
            [
              "Modal / FormModal",
              'variant?: "animated" | "rounded" | "square" | "default"',
              '"animated"',
              "Entrada spring com scale+y, troca de abas animada com AnimatePresence e FormModalSkeleton com onda shimmer.",
            ],
            [
              "Alert / Badge",
              "collapsible, dialog, count",
              "padrão",
              "Alert com colapso fluido via CSS grid, chevron spring e dialog animado; Badge com pop elástico em count numérico.",
            ],
            [
              "Stepper",
              "activeStep, variant",
              "padrão",
              "Conector progressivo (scaleX/scaleY), checkmark desenhado via SVG, pulso no passo ativo e indicador deslizante (layoutId).",
            ],
            [
              "StatCard / Segments / Ring",
              "spotlight?, progress, segments",
              "spotlight: false",
              "Spotlight radial sem re-render, skeleton shimmer diagonal e física spring na barra de meta, segmentos e anel radial.",
            ],
            [
              "Pagination & Timeline",
              "page, collapsible",
              "padrão",
              "Pagination com pílula ativa deslizante (layoutId); Timeline com colapso fluido via CSS grid e chevron spring.",
            ],
            [
              "Rating / OTPInput / PasswordStrength",
              "value, error, password",
              "padrão",
              "Rating com hover/pop spring; OTPInput com pop por dígito e shake horizontal no erro; PasswordStrength com segmentos escalonados.",
            ],
          ]}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ISOLATED DEMO SECTIONS (evitam re-render da página inteira em cada clique)
// ═════════════════════════════════════════════════════════════════════════════

const INITIAL_BADGE_TAGS = ["Prioridade Alta", "Entrega Expressa", "Montagem Inclusa"];

function AlertBadgeDemo() {
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(12);
  const [badgeTags, setBadgeTags] = useState(INITIAL_BADGE_TAGS);

  return (
    <DemoCard id="alert-badge-animated" title="11. Alert & Badge — colapso suave, dialog spring e contador elástico">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Alert (colapso CSS grid + chevron spring + dialog)
          </span>
          <Alert
            variant="info"
            accent="left"
            collapsible
            defaultOpen
            title="Sincronização automática ativada"
            description="Clique no cabeçalho para recolher ou expandir os detalhes com transição fluida sem cortes nem salto de layout."
            actions={[
              {
                label: "Abrir Alert Dialog",
                onClick: () => setAlertDialogOpen(true),
              },
            ]}
          />
          <Alert
            dialog
            open={alertDialogOpen}
            onClose={() => setAlertDialogOpen(false)}
            variant="warning"
            dismissible
            title="Atualização de tabela de preços"
            description="O Alert em modo dialog agora entra e sai com AnimatePresence + física de mola, preservando nitidez total no texto."
            actions={[
              { label: "Cancelar", variant: "ghost", onClick: () => setAlertDialogOpen(false) },
              {
                label: "Entendi",
                onClick: () => {
                  setAlertDialogOpen(false);
                  toast.success("Alerta confirmado!");
                },
              },
            ]}
          />
        </div>

        <div className="space-y-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Badge (pop elástico no count + tags removíveis)
          </span>
          <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-control)] border border-border bg-muted/20 p-3.5">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                aria-label="Diminuir contagem"
                onClick={() => setBadgeCount((c) => Math.max(0, c - 1))}
                className="px-2.5"
              >
                <Minus size={14} />
              </Button>
              <Badge count={badgeCount} variant="primary" appearance="solid" size="md" />
              <Badge count={badgeCount * 8} maxCount={99} variant="danger" appearance="soft" size="md" />
              <Button
                size="sm"
                variant="outline"
                aria-label="Aumentar contagem"
                onClick={() => setBadgeCount((c) => c + 1)}
                className="px-2.5"
              >
                <Plus size={14} />
              </Button>
            </div>
            <Badge status="processing" text="Sincronizando fila" />
          </div>

          <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {badgeTags.map((tag) => (
                <motion.div
                  key={tag}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  <Badge
                    variant="neutral"
                    appearance="soft"
                    size="md"
                    onRemove={() => setBadgeTags((prev) => prev.filter((t) => t !== tag))}
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            {badgeTags.length < INITIAL_BADGE_TAGS.length && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setBadgeTags(INITIAL_BADGE_TAGS)}
              >
                Restaurar tags
              </Button>
            )}
          </div>
        </div>
      </div>
    </DemoCard>
  );
}

function StepperDemo() {
  const [activeStep, setActiveStep] = useState(1);
  const [stepperNav, setStepperNav] = useState(1);

  return (
    <DemoCard id="stepper-animated" title="12. Stepper — conector progressivo, checkmark desenhado e indicador deslizante">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Clique nos passos ou avance para ver o preenchimento do conector e o desenho do check
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            >
              Voltar
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={activeStep >= 4}
              onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
            >
              {activeStep === 3 ? "Concluir tudo" : "Avançar etapa"}
            </Button>
          </div>
        </div>

        <Stepper
          activeStep={activeStep}
          onStepClick={setActiveStep}
          clickable
          steps={[
            { title: "Pedido", description: "Itens e condições" },
            { title: "Faturamento", description: "Emissão NF-e" },
            { title: "Separação", description: "Conferência no CD" },
            { title: "Entrega", description: "Rota e montagem" },
          ]}
        />

        <div className="pt-2 border-t border-border/60 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Variante navigation (indicador inferior com layoutId deslizante)
          </span>
          <Stepper
            variant="navigation"
            activeStep={stepperNav}
            onStepClick={setStepperNav}
            clickable
            steps={[
              { title: "Dados Gerais", description: "Cadastro base" },
              { title: "Comercial", description: "Tabela e margem", badge: "3" },
              { title: "Logística", description: "Prazo e frete" },
            ]}
          />
        </div>
      </div>
    </DemoCard>
  );
}

function StatCardDemo() {
  const [statProgress, setStatProgress] = useState(74);
  const [statLoading, setStatLoading] = useState(false);
  const [segmentPreset, setSegmentPreset] = useState<0 | 1>(0);

  return (
    <DemoCard id="statcard-animated" title="13. StatCard — spotlight, barra/segmentos spring e anel radial animado">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Passe o mouse nos cards (spotlight) e altere os valores para ver a física de mola
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatProgress((p) => (p >= 95 ? 28 : Math.min(100, p + 18)))}
            >
              Alterar meta ({statProgress}%)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSegmentPreset((p) => (p === 0 ? 1 : 0))}
            >
              Alternar distribuição
            </Button>
            <Button
              size="sm"
              variant={statLoading ? "primary" : "secondary"}
              onClick={() => setStatLoading((v) => !v)}
            >
              {statLoading ? "Mostrar KPIs" : "Testar Shimmer"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            spotlight
            loading={statLoading}
            title="Faturamento Mensal"
            value="R$ 482.900"
            previousValue="R$ 418.200"
            icon={TrendingUp}
            color="emerald"
            trend={{ value: 15.4, label: "vs. mês anterior" }}
            progress={statProgress}
            progressLabel="Meta do período"
            spark={[
              { value: 310, label: "Seg" },
              { value: 345, label: "Ter" },
              { value: 332, label: "Qua" },
              { value: 398, label: "Qui" },
              { value: 440, label: "Sex" },
              { value: 482, label: "Sáb" },
            ]}
          />

          <StatsRingCard
            spotlight
            loading={statLoading}
            title="Entregas no Prazo"
            value="1.284"
            subtitle="pedidos concluídos"
            progress={statProgress}
            color="indigo"
            stats={[
              { label: "Em rota", value: 94 },
              { label: "Agendadas", value: 162 },
            ]}
          />
        </div>

        <StatsSegmentsCard
          spotlight
          loading={statLoading}
          title="Distribuição por Categoria"
          subtitle="últimos 30 dias"
          totalValue="2.410 pedidos"
          icon={ShoppingBag}
          trend={{ value: 8.2 }}
          segments={
            segmentPreset === 0
              ? [
                  { label: "Estofados", value: "1.012", share: 42, color: "indigo" },
                  { label: "Eletro", value: "675", share: 28, color: "emerald" },
                  { label: "Colchões", value: "434", share: 18, color: "amber" },
                  { label: "Móveis", value: "289", share: 12, color: "teal" },
                ]
              : [
                  { label: "Estofados", value: "626", share: 26, color: "indigo" },
                  { label: "Eletro", value: "988", share: 41, color: "emerald" },
                  { label: "Colchões", value: "506", share: 21, color: "amber" },
                  { label: "Móveis", value: "290", share: 12, color: "teal" },
                ]
          }
        />
      </div>
    </DemoCard>
  );
}

function PaginationTimelineDemo() {
  const [demoPage, setDemoPage] = useState(2);

  return (
    <DemoCard id="pagination-timeline-animated" title="14. Pagination & Timeline — pill deslizante e colapso suave">
      <div className="space-y-6">
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pagination (pílula ativa deslizante via layoutId + toque tátil)
          </span>
          <div className="rounded-[var(--radius-control)] border border-border bg-muted/20 p-3.5">
            <Pagination
              page={demoPage}
              totalItems={120}
              pageSize={10}
              onPageChange={setDemoPage}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border/60 space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline (itens colapsáveis com CSS grid + chevron spring)
          </span>
          <Timeline
            size="sm"
            items={[
              {
                id: "tl-1",
                title: "Pedido #5102 aprovado",
                badge: "Concluído",
                color: "success",
                icon: CheckCircle2,
                collapsible: true,
                defaultExpanded: true,
                description: "Pagamento confirmado e nota fiscal eletrônica emitida automaticamente.",
                date: "Hoje, 09:15",
              },
              {
                id: "tl-2",
                title: "Separação e conferência no CD",
                badge: "Em andamento",
                color: "primary",
                status: "current",
                collapsible: true,
                defaultExpanded: true,
                description: "Clique no título de qualquer item para recolher ou expandir a descrição suavemente.",
                date: "Hoje, 11:40",
              },
              {
                id: "tl-3",
                title: "Saída para entrega e montagem",
                badge: "Agendado",
                color: "info",
                icon: Truck,
                collapsible: true,
                defaultExpanded: false,
                description: "Rota programada com equipe própria para amanhã no período da manhã.",
                date: "Amanhã, 08:30",
              },
            ]}
          />
        </div>
      </div>
    </DemoCard>
  );
}

function RatingOtpPasswordDemo() {
  const [ratingVal, setRatingVal] = useState(4);
  const [heartVal, setHeartVal] = useState(3.5);
  const [otpVal, setOtpVal] = useState("482");
  const [otpError, setOtpError] = useState(false);
  const [demoPassword, setDemoPassword] = useState("Lopes@2026");

  return (
    <DemoCard id="rating-otp-password-animated" title="15. Rating, OTPInput & PasswordStrength — micro-interações táteis">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rating (zero salto de largura + preenchimento suave)
          </span>
          <div className="space-y-3 rounded-[var(--radius-control)] border border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground">Avaliação de Entrega</span>
              <Rating
                value={ratingVal}
                onChange={setRatingVal}
                size="lg"
                showValue
                tooltips={["Ruim", "Regular", "Bom", "Ótimo", "Excelente"]}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <span className="text-xs font-medium text-foreground">Meia-estrela (coração)</span>
              <Rating
                value={heartVal}
                onChange={setHeartVal}
                shape="heart"
                tone="rose"
                allowHalf
                size="lg"
                showValue
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              OTPInput (pop ao digitar + shake no erro)
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <OTPInput
                length={6}
                groupSize={3}
                value={otpVal}
                error={otpError}
                onChange={(val) => {
                  setOtpVal(val);
                  if (otpError) setOtpError(false);
                }}
                onComplete={(code) => toast.success(`Código ${code} validado!`)}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setOtpError(false);
                  requestAnimationFrame(() => setOtpError(true));
                }}
              >
                Simular erro
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            PasswordStrength (segmentos suaves e instantâneos)
          </span>
          <div className="rounded-[var(--radius-control)] border border-border bg-muted/20 p-4 space-y-3">
            <TextField
              label="Digite uma senha para testar"
              value={demoPassword}
              onChange={(e) => setDemoPassword(e.target.value)}
              placeholder="Ex.: Lopes@2026!#"
            />
            <PasswordStrength password={demoPassword} />
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Button size="sm" variant="outline" onClick={() => setDemoPassword("1234")}>
                Fraca
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDemoPassword("Lopes2026")}>
                Média
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDemoPassword("Lopes@2026!#")}>
                Muito forte
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDemoPassword("")}>
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DemoCard>
  );
}
