"use client";

import React, { useState } from "react";
import { Check, Copy, Layers, Sparkles, Tag, Truck } from "lucide-react";
import { DemoCard, HR, SectionHeader } from "../_shared";

interface ColorToken {
  cssVar: string;
  twClass: string;
  label: string;
  usage: string;
  swatchStyle?: React.CSSProperties;
}

const SURFACE_TOKENS: ColorToken[] = [
  { cssVar: "--background", twClass: "bg-background", label: "Background", usage: "Canvas principal da aplicação" },
  { cssVar: "--foreground", twClass: "text-foreground", label: "Foreground", usage: "Texto principal de alto contraste" },
  { cssVar: "--surface", twClass: "bg-surface", label: "Surface / Card", usage: "Cards, painéis, modais e popovers" },
  { cssVar: "--surface-hover", twClass: "bg-surface-hover", label: "Surface Hover", usage: "Hover sutil em linhas e menus" },
  { cssVar: "--surface-muted", twClass: "bg-surface-muted", label: "Surface Muted", usage: "Cabeçalhos de tabela e fundos sutis" },
  { cssVar: "--surface-muted-foreground", twClass: "text-muted-foreground", label: "Muted Foreground", usage: "Labels auxiliares e metadados" },
  { cssVar: "--border", twClass: "border-border", label: "Border", usage: "Divisores e contornos padrão" },
  { cssVar: "--border-strong", twClass: "border-border-strong", label: "Border Strong", usage: "Contornos em foco/hover de inputs" },
  { cssVar: "--ring", twClass: "ring-ring", label: "Ring", usage: "Anel de foco acessível (focus-visible)" },
];

const BRAND_PRIMARY_TOKENS: ColorToken[] = [
  { cssVar: "--primary", twClass: "bg-primary", label: "Primary", usage: "Ação primária corporativa" },
  { cssVar: "--primary-foreground", twClass: "text-primary-foreground", label: "Primary FG", usage: "Texto sobre Primary" },
  { cssVar: "--primary-hover", twClass: "bg-primary-hover", label: "Primary Hover", usage: "Estado hover da ação primária" },
  { cssVar: "--primary-soft", twClass: "bg-primary-soft", label: "Primary Soft", usage: "Superfície neutra destacada" },
  { cssVar: "--brand", twClass: "bg-brand", label: "Brand", usage: "Destaque de marca, abas ativas e links" },
  { cssVar: "--brand-foreground", twClass: "text-brand-foreground", label: "Brand FG", usage: "Texto sobre Brand" },
  { cssVar: "--brand-hover", twClass: "bg-brand-hover", label: "Brand Hover", usage: "Hover em CTAs de marca" },
  { cssVar: "--brand-soft", twClass: "bg-brand-soft", label: "Brand Soft", usage: "Badges e seleções suaves de marca" },
  { cssVar: "--brand-soft-foreground", twClass: "text-brand-soft-foreground", label: "Brand Soft FG", usage: "Texto sobre Brand Soft" },
  { cssVar: "--brand-border", twClass: "border-brand-border", label: "Brand Border", usage: "Contorno de elementos Brand Soft" },
];

const STATUS_GROUPS: { title: string; tokens: ColorToken[] }[] = [
  {
    title: "Danger",
    tokens: [
      { cssVar: "--danger", twClass: "bg-danger", label: "Base", usage: "Erros críticos e alertas" },
      { cssVar: "--danger-foreground", twClass: "text-danger-foreground", label: "Foreground", usage: "Texto sobre Danger" },
      { cssVar: "--danger-hover", twClass: "bg-danger-hover", label: "Hover", usage: "Estado hover" },
      { cssVar: "--danger-soft", twClass: "bg-danger-soft", label: "Soft", usage: "Fundo de alerta/badge" },
      { cssVar: "--danger-soft-foreground", twClass: "text-danger-soft-foreground", label: "Soft FG", usage: "Texto sobre Soft" },
      { cssVar: "--danger-border", twClass: "border-danger-border", label: "Border", usage: "Borda de alerta" },
    ],
  },
  {
    title: "Destructive",
    tokens: [
      { cssVar: "--destructive", twClass: "bg-destructive", label: "Base", usage: "Botões destrutivos (alto contraste no dark)" },
      { cssVar: "--destructive-foreground", twClass: "text-destructive-foreground", label: "Foreground", usage: "Texto branco garantido" },
      { cssVar: "--destructive-hover", twClass: "bg-destructive-hover", label: "Hover", usage: "Estado hover destrutivo" },
    ],
  },
  {
    title: "Success",
    tokens: [
      { cssVar: "--success", twClass: "bg-success", label: "Base", usage: "Confirmações e status ativo" },
      { cssVar: "--success-foreground", twClass: "text-success-foreground", label: "Foreground", usage: "Texto sobre Success" },
      { cssVar: "--success-hover", twClass: "bg-success-hover", label: "Hover", usage: "Estado hover" },
      { cssVar: "--success-soft", twClass: "bg-success-soft", label: "Soft", usage: "Fundo de badge/alerta" },
      { cssVar: "--success-soft-foreground", twClass: "text-success-soft-foreground", label: "Soft FG", usage: "Texto sobre Soft" },
      { cssVar: "--success-border", twClass: "border-success-border", label: "Border", usage: "Borda de sucesso" },
    ],
  },
  {
    title: "Warning",
    tokens: [
      { cssVar: "--warning", twClass: "bg-warning", label: "Base", usage: "Pendências e atenção operacional" },
      { cssVar: "--warning-foreground", twClass: "text-warning-foreground", label: "Foreground", usage: "Texto sobre Warning" },
      { cssVar: "--warning-hover", twClass: "bg-warning-hover", label: "Hover", usage: "Estado hover" },
      { cssVar: "--warning-soft", twClass: "bg-warning-soft", label: "Soft", usage: "Fundo de aviso" },
      { cssVar: "--warning-soft-foreground", twClass: "text-warning-soft-foreground", label: "Soft FG", usage: "Texto sobre Soft" },
      { cssVar: "--warning-border", twClass: "border-warning-border", label: "Border", usage: "Borda de aviso" },
    ],
  },
  {
    title: "Info",
    tokens: [
      { cssVar: "--info", twClass: "bg-info", label: "Base", usage: "Informações neutras e dicas" },
      { cssVar: "--info-foreground", twClass: "text-info-foreground", label: "Foreground", usage: "Texto sobre Info" },
      { cssVar: "--info-hover", twClass: "bg-info-hover", label: "Hover", usage: "Estado hover" },
      { cssVar: "--info-soft", twClass: "bg-info-soft", label: "Soft", usage: "Fundo informativo" },
      { cssVar: "--info-soft-foreground", twClass: "text-info-soft-foreground", label: "Soft FG", usage: "Texto sobre Soft" },
      { cssVar: "--info-border", twClass: "border-info-border", label: "Border", usage: "Borda informativa" },
    ],
  },
];

const CHART_TOKENS: ColorToken[] = [
  { cssVar: "--chart-1", twClass: "var(--chart-1)", label: "Chart 1", usage: "Série principal (Índigo)" },
  { cssVar: "--chart-2", twClass: "var(--chart-2)", label: "Chart 2", usage: "Série secundária (Sky)" },
  { cssVar: "--chart-3", twClass: "var(--chart-3)", label: "Chart 3", usage: "Meta / Crescimento (Emerald)" },
  { cssVar: "--chart-4", twClass: "var(--chart-4)", label: "Chart 4", usage: "Atenção / Sazonal (Amber)" },
  { cssVar: "--chart-5", twClass: "var(--chart-5)", label: "Chart 5", usage: "Campanhas (Pink)" },
  { cssVar: "--chart-6", twClass: "var(--chart-6)", label: "Chart 6", usage: "Comparativo (Violet)" },
];

const RADIUS_TOKENS = [
  { cssVar: "--radius-control", value: "0.5rem (8px)", twClass: "rounded-[var(--radius-control)]", usage: "Botões, inputs, selects, chips e controles compactos" },
  { cssVar: "--radius-card", value: "0.875rem (14px)", twClass: "rounded-[var(--radius-card)]", usage: "Cards, painéis, tabelas e containers de seção" },
  { cssVar: "--radius-overlay", value: "1rem (16px)", twClass: "rounded-[var(--radius-overlay)]", usage: "Modais, drawers, dialogs e popovers amplos" },
];

const SHADOW_TOKENS = [
  { cssVar: "--shadow-control", twClass: "shadow-[var(--shadow-control)]", level: "Nível 1 · Control", usage: "Inputs, botões sutis e controles interativos" },
  { cssVar: "--shadow-card", twClass: "shadow-[var(--shadow-card)]", level: "Nível 2 · Card", usage: "Cards destacados e painéis informativos" },
  { cssVar: "--shadow-floating", twClass: "shadow-[var(--shadow-floating)]", level: "Nível 3 · Floating", usage: "Dropdowns, popovers, tooltips e menus contextuais" },
  { cssVar: "--shadow-overlay", twClass: "shadow-[var(--shadow-overlay)]", level: "Nível 4 · Overlay", usage: "Modais, dialogs de confirmação e command palette" },
];

const INVENTORY_ROWS = [
  { sku: "BL-EST-104", produto: "Sofá Retrátil 3 Lugares Linho Bege", categoria: "Estofados", filial: "Porto Velho — Centro (RO)", telefone: "(69) 3221-4010", estoque: 14, preco: "R$ 3.490,00", entrega: "48h · Frota Própria", status: "Disponível" },
  { sku: "BL-ELT-219", produto: "Geladeira Frost Free Duplex 410L Inox", categoria: "Eletrodomésticos", filial: "Manaus — Vieiralves (AM)", telefone: "(92) 3304-8820", estoque: 9, preco: "R$ 4.199,00", entrega: "24h · CD Manaus", status: "Disponível" },
  { sku: "BL-COL-087", produto: "Conjunto Box Queen Molas Ensacadas", categoria: "Colchões", filial: "Ji-Paraná — Av. Brasil (RO)", telefone: "(69) 3422-1190", estoque: 4, preco: "R$ 2.890,00", entrega: "72h · Rota BR-364", status: "Estoque Baixo" },
  { sku: "BL-MOV-332", produto: "Guarda-Roupa 6 Portas Carvalho / Off-White", categoria: "Dormitórios", filial: "Ariquemes — Setor 01 (RO)", telefone: "(69) 3535-2700", estoque: 7, preco: "R$ 2.150,00", entrega: "Montagem inclusa", status: "Disponível" },
  { sku: "BL-ELT-512", produto: "Lavadora de Roupas 12kg Inverter Branca", categoria: "Lavanderia", filial: "Vilhena — Av. Major Amarante (RO)", telefone: "(69) 3321-6540", estoque: 11, preco: "R$ 2.649,00", entrega: "48h · Frota Própria", status: "Disponível" },
  { sku: "BL-TV-601", produto: "Smart TV 55\" 4K UHD HDR10+", categoria: "Eletrônicos", filial: "Itacoatiara — Centro (AM)", telefone: "(92) 3521-3180", estoque: 2, preco: "R$ 2.999,00", entrega: "72h · Fluvial/Rodov.", status: "Reposição" },
];

function useCopyToken() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (value: string, key = value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1600);
    } catch {
      // Clipboard API indisponível em contexto não-seguro
    }
  };

  return { copiedKey, copy };
}

function TokenSwatch({
  token,
  copied,
  onCopy,
}: {
  token: ColorToken;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copiar token ${token.cssVar}`}
      className="group flex items-start gap-3 rounded-[var(--radius-control)] border border-border bg-surface p-2.5 text-left transition-colors hover:border-border-strong hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
    >
      <div
        className="h-10 w-10 shrink-0 rounded-[var(--radius-control)] border border-border shadow-[var(--shadow-control)]"
        style={{ backgroundColor: `var(${token.cssVar})`, ...token.swatchStyle }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-foreground truncate">{token.label}</span>
          {copied ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-success shrink-0">
              <Check className="h-3 w-3" aria-hidden="true" />
              Copiado
            </span>
          ) : (
            <Copy
              className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shrink-0"
              aria-hidden="true"
            />
          )}
        </div>
        <code className="block font-mono text-[11px] text-brand truncate mt-0.5">{token.cssVar}</code>
        <code className="block font-mono text-[10px] text-muted-foreground truncate">{token.twClass}</code>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{token.usage}</p>
      </div>
    </button>
  );
}

export default function TokensPage() {
  const { copiedKey, copy } = useCopyToken();
  const [showGuides, setShowGuides] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Foundations"
        title="Design Tokens & Fundações"
        description="Paleta semântica adaptativa (Light & Dark), raios geométricos, elevação em camadas, tipografia corporativa e utilitários de CSS declarados em styles/lopes-ui.css. Clique em qualquer swatch para copiar o token."
      />

      {/* 1. Superfícies & Controles */}
      <DemoCard id="paleta-superficies" title="Paleta Semântica — Superfícies & Controles">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SURFACE_TOKENS.map((t) => (
            <TokenSwatch
              key={t.cssVar}
              token={t}
              copied={copiedKey === t.cssVar}
              onCopy={() => copy(`var(${t.cssVar})`, t.cssVar)}
            />
          ))}
        </div>
      </DemoCard>

      {/* 2. Primary & Brand */}
      <DemoCard id="paleta-brand" title="Paleta Semântica — Primary & Brand">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BRAND_PRIMARY_TOKENS.map((t) => (
            <TokenSwatch
              key={t.cssVar}
              token={t}
              copied={copiedKey === t.cssVar}
              onCopy={() => copy(`var(${t.cssVar})`, t.cssVar)}
            />
          ))}
        </div>
      </DemoCard>

      {/* 3. Status Semânticos */}
      <DemoCard id="paleta-status" title="Paleta Semântica — Status (Danger, Destructive, Success, Warning, Info)">
        <div className="space-y-6">
          {STATUS_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {group.tokens.map((t) => (
                  <TokenSwatch
                    key={t.cssVar}
                    token={t}
                    copied={copiedKey === t.cssVar}
                    onCopy={() => copy(`var(${t.cssVar})`, t.cssVar)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DemoCard>

      {/* 4. Chart 1-6 */}
      <DemoCard id="paleta-charts" title="Paleta de Gráficos — Chart 1 a 6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHART_TOKENS.map((t) => (
            <TokenSwatch
              key={t.cssVar}
              token={t}
              copied={copiedKey === t.cssVar}
              onCopy={() => copy(`var(${t.cssVar})`, t.cssVar)}
            />
          ))}
        </div>
      </DemoCard>

      <HR />

      {/* 5. Geometria */}
      <DemoCard id="geometria" title="Geometria — Raios Semânticos (--radius-*)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RADIUS_TOKENS.map((r) => {
            const isCopied = copiedKey === r.cssVar;
            return (
              <button
                key={r.cssVar}
                type="button"
                onClick={() => copy(`var(${r.cssVar})`, r.cssVar)}
                aria-label={`Copiar token ${r.cssVar}`}
                className="group flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-border bg-surface-muted/30 p-4 text-left transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
              >
                <div
                  className="h-16 w-full border-2 border-brand/60 bg-brand-soft/60 flex items-center justify-center"
                  style={{ borderRadius: `var(${r.cssVar})` }}
                >
                  <span className="font-mono text-xs font-semibold text-brand-soft-foreground">{r.value}</span>
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-xs font-semibold text-brand">{r.cssVar}</code>
                    {isCopied ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-success">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Copiado
                      </span>
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    )}
                  </div>
                  <code className="block font-mono text-[11px] text-muted-foreground mt-0.5">{r.twClass}</code>
                  <p className="text-xs text-muted-foreground mt-1.5">{r.usage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DemoCard>

      {/* 6. Elevação */}
      <DemoCard id="elevacao" title="Elevação em Camadas — Sombras (--shadow-*)">
        <div className="rounded-[var(--radius-card)] bg-surface-muted/50 border border-border/60 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SHADOW_TOKENS.map((s) => {
              const isCopied = copiedKey === s.cssVar;
              return (
                <button
                  key={s.cssVar}
                  type="button"
                  onClick={() => copy(`var(${s.cssVar})`, s.cssVar)}
                  aria-label={`Copiar token ${s.cssVar}`}
                  style={{ boxShadow: `var(${s.cssVar})` }}
                  className="group flex flex-col justify-between gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Layers className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                      {s.level}
                    </span>
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <code className="block font-mono text-[11px] text-brand">{s.cssVar}</code>
                    <p className="text-xs text-muted-foreground mt-1">{s.usage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DemoCard>

      <HR />

      {/* 7. Tipografia & Alinhamento Óptico */}
      <DemoCard id="tipografia" title="Tipografia, Chrome Estrutural & Alinhamento Óptico (.lopes-trim-cap)">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-card)] border border-border bg-surface-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sans-serif</span>
                <code className="font-mono text-xs text-brand">font-sans</code>
              </div>
              <p className="font-sans text-2xl font-bold text-foreground tracking-tight">
                Conforto e qualidade para o seu lar
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                Lopes ERP — gestão integrada de lojas em Rondônia (RO) e Amazonas (AM).
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-border bg-surface-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monospace</span>
                <code className="font-mono text-xs text-brand">font-mono</code>
              </div>
              <p className="font-mono text-lg font-semibold text-foreground">
                BL-EST-104 · R$ 3.490,00
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                Filial RO-PVH-01 · SAC (69) 3221-4010 · CD Manaus (92) 3304-8820
              </p>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-surface-muted/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Tipografia Estrutural do Shell (--app-chrome-*)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[var(--radius-control)] border border-border bg-surface p-3">
                <code className="font-mono text-[11px] text-brand">.app-chrome-text</code>
                <p className="app-chrome-text text-foreground mt-1.5">
                  Catálogo de Móveis · Pedidos de Entrega · Filiais RO/AM
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  --app-chrome-font-size: 0.875rem · weight: 450
                </p>
              </div>
              <div className="rounded-[var(--radius-control)] border border-border bg-surface p-3">
                <code className="font-mono text-[11px] text-brand">.app-chrome-muted-text</code>
                <p className="app-chrome-muted-text text-muted-foreground mt-1.5">
                  OPERAÇÃO NORTE · ATUALIZADO HÁ 2 MIN
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  --app-chrome-muted-font-size: 0.75rem · weight: 400
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-surface-muted/30 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Alinhamento Óptico (<code className="font-mono text-xs text-brand">.lopes-trim-cap</code>)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Aplica <code className="font-mono text-[11px]">text-box: trim-both cap alphabetic</code> para remover o espaço extra acima da altura de maiúscula e centralizar textos ao lado de ícones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuides((v) => !v)}
                className="rounded-[var(--radius-control)] border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
              >
                {showGuides ? "Ocultar guias" : "Mostrar guias"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[var(--radius-control)] border border-border bg-surface p-4 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Padrão (sem trim)
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-soft-foreground">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className={showGuides ? "border-y border-brand/50" : undefined}>PRONTA ENTREGA</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-foreground">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className={showGuides ? "border-y border-danger/50" : undefined}>Rota Porto Velho</span>
                  </span>
                </div>
              </div>

              <div className="rounded-[var(--radius-control)] border border-brand-border/60 bg-surface p-4 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                  Com .lopes-trim-cap
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-soft-foreground">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className={`lopes-trim-cap ${showGuides ? "border-y border-brand/50" : ""}`}>PRONTA ENTREGA</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-foreground">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className={`lopes-trim-cap ${showGuides ? "border-y border-success/60" : ""}`}>Rota Porto Velho</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DemoCard>

      {/* 8. Scroll Shadow X */}
      <DemoCard id="scroll-shadow-x" title="Demo ao Vivo — .lopes-scroll-shadow-x (CSS scroll-state)">
        <p className="text-xs text-muted-foreground mb-3">
          Role a tabela horizontalmente para observar as sombras laterais progressivas (<code className="font-mono text-brand">.lopes-scroll-hint-left</code> / <code className="font-mono text-brand">.lopes-scroll-hint-right</code>) controladas via <code className="font-mono">@container scroll-state(scrollable: left | right)</code> sem JavaScript.
        </p>
        <div className="lopes-scroll-shadow-x flex rounded-[var(--radius-card)] border border-border bg-surface">
          <div className="lopes-scroll-hint-left" aria-hidden="true" />
          <table className="min-w-[960px] w-full text-xs">
            <thead className="bg-surface-muted border-b border-border text-muted-foreground">
              <tr>
                <th className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide">SKU</th>
                <th className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide">Produto</th>
                <th className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide">Categoria</th>
                <th className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide">Filial</th>
                <th className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide">Telefone</th>
                <th className="px-3.5 py-2.5 text-right font-semibold uppercase tracking-wide">Estoque</th>
                <th className="px-3.5 py-2.5 text-right font-semibold uppercase tracking-wide">Preço</th>
                <th className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide">Logística</th>
                <th className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {INVENTORY_ROWS.map((row) => (
                <tr key={row.sku} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono text-brand whitespace-nowrap">{row.sku}</td>
                  <td className="px-3.5 py-2.5 font-medium text-foreground whitespace-nowrap">{row.produto}</td>
                  <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">{row.categoria}</td>
                  <td className="px-3.5 py-2.5 text-foreground whitespace-nowrap">{row.filial}</td>
                  <td className="px-3.5 py-2.5 font-mono text-muted-foreground whitespace-nowrap">{row.telefone}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-foreground whitespace-nowrap">{row.estoque} un</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-foreground whitespace-nowrap">{row.preco}</td>
                  <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">{row.entrega}</td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span
                      className={
                        row.status === "Disponível"
                          ? "inline-flex rounded-full border border-success-border bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-soft-foreground"
                          : row.status === "Estoque Baixo"
                            ? "inline-flex rounded-full border border-warning-border bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning-soft-foreground"
                            : "inline-flex rounded-full border border-danger-border bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger-soft-foreground"
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="lopes-scroll-hint-right" aria-hidden="true" />
        </div>
      </DemoCard>
    </div>
  );
}
