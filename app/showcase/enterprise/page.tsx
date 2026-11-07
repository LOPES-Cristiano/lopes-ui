"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Cookie,
  ShieldAlert,
  Store,
  Truck,
} from "lucide-react";
import { SectionHeader, DemoCard, PropsTable, HR } from "@/app/showcase/_shared";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AccessGuard } from "@/components/AccessGuard";
import { AccessControlProvider } from "@/components/useAccessControl";
import CookieBanner from "@/components/CookieBanner";
import ScopeSelector, { type ScopeLevelOption } from "@/components/ScopeSelector";
import TenantSwitcherModal, {
  TenantSwitcherTrigger,
  type TenantItem,
} from "@/components/TenantSwitcherModal";
import ActiveTimerWidget from "@/components/ActiveTimerWidget";
import RichTextViewer from "@/components/RichTextViewer";
import CnpjLookupModal, { type CnpjLookupFormData } from "@/components/CnpjLookupModal";
import SplitCounterBadge from "@/components/SplitCounterBadge";
import SelectField from "@/components/form/SelectField";
import SmartObject from "@/components/SmartObject";
import CodeBlock from "@/components/CodeBlock";
import toast from "@/components/Toast";

const DEMO_TENANTS: TenantItem[] = [
  {
    id: 1,
    code: "FIL-01",
    name: "Matriz Porto Velho — Av. Sete de Setembro",
    subtitle: "Porto Velho / RO · (69) 3224-1000",
    isPrimary: true,
    badge: "Matriz",
  },
  {
    id: 2,
    code: "FIL-02",
    name: "Unidade Ariquemes — Centro",
    subtitle: "Ariquemes / RO · (69) 3535-2100",
  },
  {
    id: 3,
    code: "FIL-03",
    name: "Unidade Ji-Paraná — Casa & Eletro",
    subtitle: "Ji-Paraná / RO · (69) 3421-3300",
  },
  {
    id: 4,
    code: "FIL-04",
    name: "Unidade Cacoal — Estofados & Colchões",
    subtitle: "Cacoal / RO · (69) 3441-4800",
  },
  {
    id: 5,
    code: "FIL-05",
    name: "Unidade Manaus — Av. Djalma Batista",
    subtitle: "Manaus / AM · (92) 3633-9000",
  },
  {
    id: 6,
    code: "CD-01",
    name: "Centro de Distribuição Norte",
    subtitle: "Porto Velho / RO · Logística & Montagem",
    badge: "CD",
  },
];

const DEMO_SCOPES: ScopeLevelOption[] = [
  {
    id: "fil-01",
    label: "Matriz Porto Velho",
    description: "Filial #01 · Porto Velho/RO · (69)",
    group: "Regional Rondônia (69)",
    badge: "Matriz",
    icon: Building2,
  },
  {
    id: "fil-02",
    label: "Unidade Ariquemes",
    description: "Filial #02 · Ariquemes/RO · (69)",
    group: "Regional Rondônia (69)",
    icon: Store,
  },
  {
    id: "fil-03",
    label: "Unidade Ji-Paraná",
    description: "Filial #03 · Ji-Paraná/RO · (69)",
    group: "Regional Rondônia (69)",
    icon: Store,
  },
  {
    id: "fil-04",
    label: "Unidade Cacoal",
    description: "Filial #04 · Cacoal/RO · (69)",
    group: "Regional Rondônia (69)",
    icon: Store,
  },
  {
    id: "fil-05",
    label: "Unidade Manaus — Djalma Batista",
    description: "Filial #05 · Manaus/AM · (92)",
    group: "Regional Amazonas (92)",
    icon: Store,
  },
  {
    id: "cd-01",
    label: "CD Logística & Montagem",
    description: "Unidade #06 · Porto Velho/RO",
    group: "Logística",
    badge: "CD",
    icon: Truck,
  },
];

const DEMO_RICH_HTML = `
  <h3>Política de Entrega e Montagem — Móveis &amp; Eletro</h3>
  <p>Todos os pedidos de <strong>salas, quartos, cozinhas e eletrodomésticos</strong> contam com agendamento assistido nas praças de <strong>Rondônia (69)</strong> e <strong>Amazonas (92)</strong>.</p>
  <div class="rte-callout" data-callout="info">
    <p><strong>Conforto e qualidade para o seu lar:</strong> A conferência da embalagem dos eletrodomésticos (Geladeira Frost Free, Fogão e Smart TV) é realizada no ato da entrega junto ao cliente.</p>
  </div>
  <ul>
    <li><strong>Sofás retráteis e colchões:</strong> entrega expressa em até 48h úteis para itens em estoque local.</li>
    <li><strong>Guarda-roupas e cozinhas moduladas:</strong> montagem técnica agendada em até 72h após o recebimento.</li>
  </ul>
  <table>
    <thead>
      <tr>
        <th>Praça</th>
        <th>DDD</th>
        <th>SLA Entrega</th>
        <th>SLA Montagem</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Porto Velho, Ariquemes, Ji-Paraná e Cacoal (RO)</td>
        <td>(69)</td>
        <td>Até 48h</td>
        <td>Até 72h</td>
      </tr>
      <tr>
        <td>Manaus e Região Metropolitana (AM)</td>
        <td>(92)</td>
        <td>Até 48h</td>
        <td>Até 72h</td>
      </tr>
    </tbody>
  </table>
`;

function BuggyPanel({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error(
      "Falha simulada ao carregar indicadores de expedição de estofados e colchões.",
    );
  }
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
      <CheckCircle2 size={16} className="shrink-0" />
      <span>
        Painel operacional ativo — 28 entregas de móveis e eletrodomésticos roteirizadas hoje.
      </span>
    </div>
  );
}

export default function EnterprisePatternsShowcasePage() {
  // Tenant Switcher & Scope Selector
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState<string | number>(1);
  const [changingTenantId, setChangingTenantId] = useState<string | number | null>(null);
  const [scopeId, setScopeId] = useState<string | number | null>(null);
  const [catalogCategory, setCatalogCategory] = useState("sofa-retratil");

  // CnpjLookupModal
  const [cnpjOpen, setCnpjOpen] = useState(false);
  const [lastRegisteredCompany, setLastRegisteredCompany] =
    useState<CnpjLookupFormData | null>(null);

  // ActiveTimerWidget
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerElapsed, setTimerElapsed] = useState(1945);
  const [timerStart, setTimerStart] = useState<number | null>(() => Date.now());

  // ErrorBoundary
  const [crashPanel, setCrashPanel] = useState(false);

  // RBAC AccessGuard
  const [grantCommercialMargin, setGrantCommercialMargin] = useState(false);

  // CookieBanner preview
  const [cookiePreviewOpen, setCookiePreviewOpen] = useState(false);

  const currentTenant =
    DEMO_TENANTS.find((t) => t.id === currentTenantId) ?? DEMO_TENANTS[0];

  const handleSelectTenant = async (tenant: TenantItem) => {
    setChangingTenantId(tenant.id);
    await new Promise((r) => setTimeout(r, 350));
    setCurrentTenantId(tenant.id);
    setChangingTenantId(null);
    setTenantModalOpen(false);
    toast.success(`Sessão alterada para ${tenant.name}`);
  };

  return (
    <main className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* 1. Contexto Multi-Unidade & Escopo */}
        <section id="tenant-scope">
          <SectionHeader
            label="Multi-Unidade & Escopo"
            title="TenantSwitcherModal, ScopeSelector & Select Árvore"
            description="Seletores de contexto de sessão, escopo hierárquico de parâmetros (Global vs. Unidade) e SelectField com modo árvore expansível."
          />

          <DemoCard
            id="tenant-switcher-demo"
            title="Troca de Unidade na Sessão + Escopo de Parâmetros"
          >
            <div className="flex flex-wrap items-center gap-4">
              <TenantSwitcherTrigger
                currentTenant={currentTenant}
                onClick={() => setTenantModalOpen(true)}
              />

              <ScopeSelector
                value={scopeId}
                onChange={setScopeId}
                options={DEMO_SCOPES}
                globalLabel="Empresa (todas as filiais RO/AM)"
                sectionLabel="Filiais & Centros de Distribuição"
                inheritanceBadge={
                  scopeId !== null ? (
                    <StatusBadge tone="info" size="xs">
                      Sobrescreve global
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral" size="xs">
                      Padrão global
                    </StatusBadge>
                  )
                }
              />
            </div>

            <div className="mt-5 max-w-sm">
              <SelectField
                label="Linha de Produto (SelectField displayMode='tree')"
                displayMode="tree"
                searchable
                clearable
                value={catalogCategory}
                onChange={setCatalogCategory}
                groupMeta={{
                  "Sala de Estar & Estofados": { badge: "3" },
                  "Quarto & Colchões": { badge: "3" },
                  "Cozinha & Eletrodomésticos": { badge: "3" },
                }}
                options={[
                  {
                    value: "sofa-retratil",
                    label: "Sofá Retrátil & Reclinável",
                    group: "Sala de Estar & Estofados",
                    description: "Veludo / Linho",
                  },
                  {
                    value: "painel-tv",
                    label: "Painel & Rack para Smart TV",
                    group: "Sala de Estar & Estofados",
                  },
                  {
                    value: "poltrona-decorativa",
                    label: "Poltrona Decorativa",
                    group: "Sala de Estar & Estofados",
                  },
                  {
                    value: "guarda-roupa-casal",
                    label: "Guarda-Roupa Casal 6 Portas",
                    group: "Quarto & Colchões",
                  },
                  {
                    value: "colchao-molas",
                    label: "Colchão Molas Ensacadas Queen",
                    group: "Quarto & Colchões",
                  },
                  {
                    value: "cama-box",
                    label: "Base Box Baú Casal",
                    group: "Quarto & Colchões",
                  },
                  {
                    value: "geladeira-frost-free",
                    label: "Geladeira Frost Free 450L Inox",
                    group: "Cozinha & Eletrodomésticos",
                  },
                  {
                    value: "lavadora-14kg",
                    label: "Lavadora Automática 14kg",
                    group: "Cozinha & Eletrodomésticos",
                  },
                  {
                    value: "fogao-5-bocas",
                    label: "Fogão 5 Bocas Mesa de Vidro",
                    group: "Cozinha & Eletrodomésticos",
                  },
                ]}
              />
            </div>

            <TenantSwitcherModal
              open={tenantModalOpen}
              onClose={() => setTenantModalOpen(false)}
              tenants={DEMO_TENANTS}
              currentTenantId={currentTenantId}
              changingTenantId={changingTenantId}
              onSelect={handleSelectTenant}
            />
          </DemoCard>
        </section>

        <HR />

        {/* 2. CNPJ Alfanumérico 2026 & SmartObject */}
        <section id="cnpj-smart-object">
          <SectionHeader
            label="Cadastros & Entidades"
            title="CnpjLookupModal (CNPJ Alfanumérico 2026) & SplitCounterBadge"
            description="Modal de consulta rápida compatível com o novo padrão alfanumérico de CNPJ (RFB 2026), pílula multi-segmento de alçadas/bloqueios e referências ricas de entidades."
          />

          <DemoCard
            id="cnpj-lookup-demo"
            title="Consulta Rápida por CNPJ + Indicadores de Alçada"
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={() => setCnpjOpen(true)}>
                  Abrir Cadastro Rápido por CNPJ
                </Button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Alçadas do Pedido:</span>
                  <SplitCounterBadge approvedCount={2} blockedCount={1} />
                  <SplitCounterBadge approvedCount={3} blockedCount={0} />
                  <SplitCounterBadge
                    segments={[
                      { id: "ok", count: 14, label: "entregues", tone: "success", icon: CheckCircle2 },
                      { id: "transit", count: 5, label: "em rota", tone: "info", icon: Truck },
                      { id: "late", count: 1, label: "reagendada", tone: "warning", icon: Clock },
                    ]}
                  />
                </div>
              </div>

              {lastRegisteredCompany && (
                <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs">
                  <p className="font-semibold text-foreground">
                    Fornecedor homologado: {lastRegisteredCompany.legalName}
                  </p>
                  <p className="text-muted-foreground mt-0.5 font-mono tabular-nums">
                    CNPJ {lastRegisteredCompany.cnpj} · {lastRegisteredCompany.city}/
                    {lastRegisteredCompany.state}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                <SmartObject
                  kind="PEDIDO"
                  ref_id="PED-69042"
                  title="Sofá Retrátil 3L + Painel TV"
                  status="approved"
                  summary="R$ 4.890,00 · Porto Velho/RO"
                />
                <SmartObject
                  kind="PRODUTO"
                  ref_id="SKU-8841"
                  title="Geladeira Frost Free 450L Inox"
                  status="approved"
                />
                <SmartObject
                  kind="NFE"
                  ref_id="NFE-109482"
                  title="Danfe Remessa Manaus/AM"
                  status="done"
                />
                <SmartObject
                  kind="FILA"
                  ref_id="ROM-310"
                  title="Rota Ariquemes / Ji-Paraná"
                  status="analyzing"
                />
              </div>
            </div>

            <CnpjLookupModal
              open={cnpjOpen}
              onClose={() => setCnpjOpen(false)}
              validateCheckDigits={false}
              cityOptions={[
                { id: 1100205, name: "Porto Velho", state: "RO" },
                { id: 1100023, name: "Ariquemes", state: "RO" },
                { id: 1100122, name: "Ji-Paraná", state: "RO" },
                { id: 1100049, name: "Cacoal", state: "RO" },
                { id: 1302603, name: "Manaus", state: "AM" },
              ]}
              onLookupCnpj={async (clean) => {
                await new Promise((r) => setTimeout(r, 450));
                return {
                  cnpj: clean,
                  legalName: "INDÚSTRIA NORTE DE ESTOFADOS E COLCHÕES LTDA",
                  tradeName: "Estofados Norte Confort",
                  postalCode: "76801059",
                  street: "Avenida Sete de Setembro",
                  number: "2450",
                  neighborhood: "Centro",
                  city: "Porto Velho",
                  state: "RO",
                };
              }}
              onConfirm={(data) => {
                setLastRegisteredCompany(data);
                toast.success(`Empresa "${data.legalName}" selecionada!`);
              }}
            />
          </DemoCard>
        </section>

        <HR />

        {/* 3. RichTextViewer & ActiveTimerWidget */}
        <section id="viewer-timer">
          <SectionHeader
            label="Conteúdo Sanitizado & Produtividade"
            title="RichTextViewer & ActiveTimerWidget"
            description="Renderizador seguro de HTML rico via Sanitizer API nativa (sem dangerouslySetInnerHTML) e cronômetro multitarefa colapsável."
          />

          <DemoCard
            id="rich-text-viewer-demo"
            title="RichTextViewer (.rte-viewer com suporte a tabelas e callouts)"
          >
            <RichTextViewer html={DEMO_RICH_HTML} maxHeight={210} />
          </DemoCard>

          <DemoCard
            id="active-timer-demo"
            title="ActiveTimerWidget (Modo Inline para Demonstração)"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <ActiveTimerWidget
                inline
                code="DEM-408"
                title="Roteirização de Montagem — Guarda-Roupa Casal 6P"
                subtitle="Unidade Manaus · (92)"
                running={timerRunning}
                elapsedSeconds={timerElapsed}
                startedAt={timerStart}
                onPause={() => {
                  if (timerStart != null) {
                    setTimerElapsed(
                      (prev) => prev + Math.floor((Date.now() - timerStart) / 1000),
                    );
                  }
                  setTimerStart(null);
                  setTimerRunning(false);
                }}
                onResume={() => {
                  setTimerStart(Date.now());
                  setTimerRunning(true);
                }}
                onStop={(total) => {
                  setTimerRunning(false);
                  setTimerStart(null);
                  toast.success(`Tempo registrado: ${Math.floor(total / 60)} min`);
                }}
                onOpenTask={() => toast("Abrindo atividade DEM-408")}
              />
            </div>
          </DemoCard>
        </section>

        <HR />

        {/* 4. Resiliência, RBAC & Privacidade */}
        <section id="resilience-rbac-privacy">
          <SectionHeader
            label="Resiliência, RBAC & LGPD"
            title="ErrorBoundary, AccessGuard & CookieBanner"
            description="Isolamento de falhas de renderização por painel, guarda declarativa de rotas/telas por tarefa RBAC e banner responsivo de consentimento de cookies."
          />

          <DemoCard id="error-boundary-demo" title="ErrorBoundary com Recuperação Local">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={crashPanel ? "secondary" : "destructive"}
                  leftIcon={<AlertTriangle size={14} />}
                  onClick={() => setCrashPanel((v) => !v)}
                >
                  {crashPanel ? "Restaurar estado normal" : "Simular erro no painel"}
                </Button>
              </div>

              <ErrorBoundary
                resetKeys={[crashPanel]}
                onReset={() => setCrashPanel(false)}
                showDetails
              >
                <BuggyPanel shouldCrash={crashPanel} />
              </ErrorBoundary>
            </div>
          </DemoCard>

          <DemoCard id="access-guard-demo" title="AccessGuard & AccessDeniedState (403)">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant={grantCommercialMargin ? "primary" : "outline"}
                  leftIcon={<ShieldAlert size={14} />}
                  onClick={() => setGrantCommercialMargin((v) => !v)}
                >
                  {grantCommercialMargin
                    ? "Permissão COMERCIAL.MARGEM concedida (Clique para revogar)"
                    : "Conceder permissão COMERCIAL.MARGEM"}
                </Button>
              </div>

              <AccessControlProvider
                initialTasks={grantCommercialMargin ? ["COMERCIAL.MARGEM.VIEW"] : []}
              >
                <AccessGuard
                  task="COMERCIAL.MARGEM.VIEW"
                  deniedProps={{
                    resourceName: "Painel de Margem & Comissões de Móveis",
                    onGoHome: () => setGrantCommercialMargin(true),
                    homeLabel: "Liberar acesso na demonstração",
                  }}
                >
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground">
                    <strong>Acesso autorizado:</strong> Margem consolidada da linha de Estofados
                    &amp; Colchões (RO/AM): <span className="font-mono font-bold">34,8%</span>.
                  </div>
                </AccessGuard>
              </AccessControlProvider>
            </div>
          </DemoCard>

          <DemoCard id="cookie-banner-demo" title="CookieBanner (Consentimento Granular LGPD)">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Cookie size={14} />}
                onClick={() => setCookiePreviewOpen((v) => !v)}
              >
                {cookiePreviewOpen ? "Ocultar CookieBanner" : "Exibir CookieBanner"}
              </Button>
              <span className="text-xs text-muted-foreground">
                Suporta aceite rápido, apenas essenciais ou personalização por categoria.
              </span>
            </div>

            <CookieBanner
              open={cookiePreviewOpen}
              storageKey="lopes_ui_demo_cookie_consent"
              policyHref="#cookie-banner-demo"
              onConsentChange={(prefs) => {
                setCookiePreviewOpen(false);
                toast.success(`Preferência salva: ${prefs.decision}`);
              }}
            />
          </DemoCard>

          <div className="mt-6">
            <PropsTable
              rows={[
                ["TenantSwitcherModal", "tenants, currentTenantId, onSelect", "Modal pesquisável para troca de unidade/filial ativa na sessão"],
                ["ScopeSelector", "value, options, allowGlobal, inheritanceBadge", "Seletor de escopo (Global vs. Unidade) com busca sem acentos"],
                ["CnpjLookupModal", "onLookupCnpj, onLookupCep, onConfirm", "Cadastro rápido compatível com CNPJ numérico e alfanumérico 2026"],
                ["SplitCounterBadge", "segments | approvedCount, blockedCount", "Pílula multi-segmento de alçadas/status com Tooltip acessível"],
                ["RichTextViewer", "html, maxHeight, emptyFallback", "Visualizador HTML sanitizado via Sanitizer API (.rte-viewer)"],
                ["ActiveTimerWidget", "running, elapsedSeconds, startedAt", "Cronômetro flutuante ou inline com pausa, retomada e conclusão"],
                ["ErrorBoundary", "fallback, resetKeys, onReset, showDetails", "Captura erros de renderização isolando falhas por painel"],
                ["AccessGuard", "task, anyOf, allOf, deniedProps", "Guarda declarativa RBAC integrada ao useAccessControl e StatusPage 403"],
                ["CookieBanner", "storageKey, allowCustomize, onConsentChange", "Banner responsivo LGPD com sincronização via useSyncExternalStore"],
              ]}
            />
          </div>

          <div className="mt-6">
            <CodeBlock
              filename="EnterprisePatterns.tsx"
              language="tsx"
              code={`import {
  AccessGuard,
  ActiveTimerWidget,
  CnpjLookupModal,
  CookieBanner,
  ErrorBoundary,
  RichTextViewer,
  ScopeSelector,
  SplitCounterBadge,
  TenantSwitcherModal,
} from "lopes-ui";`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
