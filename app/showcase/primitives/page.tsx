"use client";

import React, { useState } from "react";
import { ArrowRight, Bell, Info, MapPin, Package, Plus, SlidersHorizontal } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/primitives";
import { DemoCard, HR, PropsTable, SectionHeader } from "../_shared";

const OVERLAP_COMPARISON_ROWS: string[][] = [
  [
    "Button",
    "Inclui loading (aria-busy), tooltip integrado, confirm dialog nativo, ícones left/right e AccessControl.",
    "Botão CVA + Radix Slot (asChild) ultraleve, sem wrappers de loading ou confirmação.",
    "Compor triggers de Popover/Dialog/Dropdown ou estilizar <Link> via asChild.",
  ],
  [
    "Badge",
    "Suporta dot pulsante, botão de remover, ícones automáticos e presets de status de negócio.",
    "Div estilizado com badgeVariants (CVA) e tokens semânticos, zero estado interno.",
    "Tags estáticas em cards, cabeçalhos e composições de alta densidade.",
  ],
  [
    "HoverCard",
    "Pré-configurado com delays, animações e layout pronto para cartões de perfil/entidade.",
    "Re-export fino de @radix-ui/react-hover-card com estilos de superfície e sombra.",
    "Construir previews customizados com controle direto das props do Radix.",
  ],
  [
    "ScrollArea",
    "Wrapper pronto com presets de orientação e fade de bordas para listas de produto.",
    "Radix ScrollArea + ScrollBar customizável com tokens --scrollbar-*.",
    "Painéis internos de drawers, sidebars e menus que exigem scrollbar customizada.",
  ],
  [
    "Separator",
    "Suporta rótulo centralizado (ex: 'ou'), espaçamentos prontos e estilos decorativos.",
    "Div leve com role='separator' / 'none' e orientation horizontal/vertical.",
    "Divisões simples entre blocos de menus, toolbars e formulários.",
  ],
  [
    "Skeleton",
    "Presets compostos (SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable).",
    "Bloco único animate-pulse (respeitando motion-reduce) com bg-muted.",
    "Montar placeholders sob medida sem importar presets adicionais.",
  ],
  [
    "Table",
    "DataTable completo com ordenação, filtros, paginação, seleção em massa e exportação.",
    "Tags semânticas (Table, TableHeader, TableBody, TableRow, TableHead, TableCell).",
    "Tabelas simples/estáticas ou grades leves sem estado de paginação.",
  ],
  [
    "Tabs",
    "Abas com indicador animado (motion/react), badges de contagem, variantes underline/pill e ícones.",
    "Tabs acessível com navegação por teclado (setas, Home/End) e zero dependência de motion.",
    "Abas internas em modais, popovers ou componentes que precisam de bundle mínimo.",
  ],
];

export default function PrimitivesPage() {
  const [skuError, setSkuError] = useState(false);
  const [entregaAgendada, setEntregaAgendada] = useState(true);
  const [montagemInclusa, setMontagemInclusa] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferDestino, setTransferDestino] = useState("Manaus — Vieiralves (AM)");

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Primitives"
        title="Primitives (lopes-ui/primitives)"
        description="Camada base leve construída sobre Radix UI e Class Variance Authority (CVA). Ideal para compor novos componentes internos ou quando você precisa de controle direto do DOM sem overhead de wrappers."
      />

      {/* Tabela comparativa dos 8 pares sobrepostos */}
      <DemoCard id="comparativo-exports" title="Quando usar lopes-ui vs lopes-ui/primitives (8 pares sobrepostos)">
        <p className="text-xs text-muted-foreground mb-4">
          Em telas de produto, prefira os exports principais de <code className="font-mono text-brand">lopes-ui</code>. Utilize{" "}
          <code className="font-mono text-brand">lopes-ui/primitives</code> ao construir componentes compostos ou quando precisar da API pura Radix/CVA.
        </p>
        <PropsTable
          headers={[
            "Componente",
            "lopes-ui (Rico / Produto)",
            "lopes-ui/primitives (Radix / CVA)",
            "Quando preferir Primitive",
          ]}
          rows={OVERLAP_COMPARISON_ROWS}
        />
      </DemoCard>

      <HR />

      {/* 1. Button */}
      <DemoCard id="primitive-button" title="Button — Variantes, Tamanhos & asChild">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default">Default</Button>
            <Button variant="brand">Brand</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="link">Link</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline">Pequeno (sm)</Button>
            <Button size="default" variant="outline">Padrão (default)</Button>
            <Button size="lg" variant="outline">Grande (lg)</Button>
            <Button size="icon" variant="outline" aria-label="Adicionar item">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button asChild variant="brand" size="sm">
              <a href="#comparativo-exports">
                Com asChild
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </DemoCard>

      {/* 2. Badge */}
      <DemoCard id="primitive-badge" title="Badge — Variantes Semânticas">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Entregue</Badge>
          <Badge variant="warning">Aguardando Montagem</Badge>
          <Badge variant="info">Em Rota (RO/AM)</Badge>
          <Badge variant="destructive">Pendência Fiscal</Badge>
          <Badge variant="violet">Linha Premium</Badge>
          <Badge variant="teal">Showroom</Badge>
        </div>
      </DemoCard>

      {/* 3. Input & Textarea */}
      <DemoCard id="primitive-inputs" title="Input & Textarea — Estados de Validação">
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prim-produto" className="text-xs font-medium text-foreground">
                Produto (padrão)
              </label>
              <Input id="prim-produto" placeholder="Ex: Sofá Retrátil 3 Lugares Linho" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prim-filial" className="text-xs font-medium text-foreground">
                Filial validada (success)
              </label>
              <Input
                id="prim-filial"
                success
                defaultValue="Porto Velho — Centro (69) 3221-4010"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="prim-sku" className="text-xs font-medium text-foreground">
                Código SKU (teste o estado de erro)
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSkuError((prev) => !prev)}
              >
                {skuError ? "Limpar erro" : "Simular erro"}
              </Button>
            </div>
            <Input
              id="prim-sku"
              error={skuError}
              defaultValue={skuError ? "SKU-INVALIDO" : "BL-EST-104"}
              aria-describedby={skuError ? "prim-sku-err" : undefined}
            />
            {skuError && (
              <p id="prim-sku-err" className="text-xs text-danger">
                SKU não encontrado no catálogo de Móveis &amp; Eletrodomésticos.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prim-obs" className="text-xs font-medium text-foreground">
              Observações de entrega (Textarea)
            </label>
            <Textarea
              id="prim-obs"
              placeholder="Ex: Confirmar acesso de elevador para entrega de geladeira duplex e sofá 3 lugares..."
            />
          </div>
        </div>
      </DemoCard>

      {/* 4. Switch */}
      <DemoCard id="primitive-switch" title="Switch — Controles Booleanos (Radix)">
        <div className="space-y-3 max-w-md">
          <div className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] border border-border p-3">
            <div>
              <label htmlFor="sw-entrega" className="text-sm font-medium text-foreground cursor-pointer">
                Entrega agendada (RO / AM)
              </label>
              <p className="text-xs text-muted-foreground">Notificar cliente por WhatsApp antes da saída do caminhão.</p>
            </div>
            <Switch
              id="sw-entrega"
              checked={entregaAgendada}
              onCheckedChange={setEntregaAgendada}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] border border-border p-3">
            <div>
              <label htmlFor="sw-montagem" className="text-sm font-medium text-foreground cursor-pointer">
                Montagem inclusa
              </label>
              <p className="text-xs text-muted-foreground">Agendar equipe técnica para móveis planejados e quartos.</p>
            </div>
            <Switch
              id="sw-montagem"
              checked={montagemInclusa}
              onCheckedChange={setMontagemInclusa}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] border border-border p-3 opacity-70">
            <div>
              <label htmlFor="sw-disabled" className="text-sm font-medium text-foreground">
                Retirada expressa (indisponível)
              </label>
              <p className="text-xs text-muted-foreground">Item de grande porte exclusivo para entrega dedicada.</p>
            </div>
            <Switch id="sw-disabled" disabled />
          </div>
        </div>
      </DemoCard>

      {/* 5. Tabs */}
      <DemoCard id="primitive-tabs" title="Tabs — Navegação por Teclado (Setas, Home, End)">
        <Tabs defaultValue="especificacoes" className="max-w-xl">
          <TabsList>
            <TabsTrigger value="especificacoes">Especificações</TabsTrigger>
            <TabsTrigger value="estoque">Estoque RO/AM</TabsTrigger>
            <TabsTrigger value="garantia">Garantia</TabsTrigger>
          </TabsList>

          <TabsContent value="especificacoes" className="rounded-[var(--radius-control)] border border-border bg-surface-muted/30 p-4 text-sm text-foreground">
            <p className="font-semibold mb-1">Sofá Retrátil 3 Lugares Linho Bege</p>
            <p className="text-xs text-muted-foreground">
              Largura 2,30m · Assento retrátil com molas ensacadas · Estrutura em madeira de eucalipto tratado · Revestimento em linho macio.
            </p>
          </TabsContent>

          <TabsContent value="estoque" className="rounded-[var(--radius-control)] border border-border bg-surface-muted/30 p-4 text-xs text-foreground space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Porto Velho — Centro (RO)</span>
              <span className="font-mono font-semibold">14 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ji-Paraná — Av. Brasil (RO)</span>
              <span className="font-mono font-semibold">6 unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manaus — Vieiralves (AM)</span>
              <span className="font-mono font-semibold">9 unidades</span>
            </div>
          </TabsContent>

          <TabsContent value="garantia" className="rounded-[var(--radius-control)] border border-border bg-surface-muted/30 p-4 text-xs text-muted-foreground">
            Garantia de 12 meses contra defeitos de fabricação, com assistência técnica autorizada em Rondônia e Amazonas.
          </TabsContent>
        </Tabs>
      </DemoCard>

      {/* 6. Popover & Tooltip */}
      <DemoCard id="primitive-floating" title="Popover & Tooltip — Flutuantes (Radix)">
        <TooltipProvider delayDuration={150}>
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Filtros rápidos
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Praças de Entrega</h4>
                  <p className="text-xs text-muted-foreground">
                    Configure a região padrão para cálculo de prazo e frete.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                      Rondônia (RO)
                    </span>
                    <Badge variant="success">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                      Amazonas (AM)
                    </span>
                    <Badge variant="success">Ativo</Badge>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  Tooltip acima
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Prazo estimado de 48h para Porto Velho e Manaus.
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notificações de expedição">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                3 pedidos aguardando conferência no CD
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </DemoCard>

      {/* 7. Dialog */}
      <DemoCard id="primitive-dialog" title="Dialog — Modal Acessível (Radix)">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="brand">
                <Package className="h-4 w-4" aria-hidden="true" />
                Solicitar transferência entre filiais
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transferência de Estoque</DialogTitle>
                <DialogDescription>
                  Solicite o remanejamento de móveis ou eletrodomésticos entre os centros de distribuição RO/AM.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1">
                  <label htmlFor="dlg-origem" className="text-xs font-medium text-foreground">
                    Filial de origem
                  </label>
                  <Input id="dlg-origem" defaultValue="CD Porto Velho (RO)" readOnly />
                </div>
                <div className="space-y-1">
                  <label htmlFor="dlg-destino" className="text-xs font-medium text-foreground">
                    Filial de destino
                  </label>
                  <Input
                    id="dlg-destino"
                    value={transferDestino}
                    onChange={(e) => setTransferDestino(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="default" onClick={() => setDialogOpen(false)}>
                  Confirmar solicitação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <span className="text-xs text-muted-foreground">
            Destino selecionado: <strong className="text-foreground">{transferDestino}</strong>
          </span>
        </div>
      </DemoCard>

      {/* 8. Separator & Skeleton */}
      <DemoCard id="primitive-separator-skeleton" title="Separator & Skeleton — Estrutura e Carregamento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Separator</p>
            <div className="rounded-[var(--radius-control)] border border-border p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Lopes ERP</p>
                <p className="text-xs text-muted-foreground">Linha de Salas, Quartos, Cozinhas e Eletrodomésticos</p>
              </div>
              <Separator />
              <div className="flex h-5 items-center gap-3 text-xs text-muted-foreground">
                <span>Rondônia (69)</span>
                <Separator orientation="vertical" />
                <span>Amazonas (92)</span>
                <Separator orientation="vertical" />
                <span>Frota Própria</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skeleton</p>
            <div className="rounded-[var(--radius-control)] border border-border p-4 flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-[var(--radius-control)] shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DemoCard>
    </div>
  );
}
