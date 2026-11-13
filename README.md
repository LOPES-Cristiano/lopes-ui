# Lopes UI — Design System & Biblioteca de Componentes (`v1.2.0`)

> Biblioteca corporativa de componentes React construída com **Next.js 16.4**, **React 19.2**, **Tailwind CSS v4**, **Radix UI Primitives** e **TypeScript** — empacotada via `tsup` (ESM + CJS + `.d.ts`) com CLI de configuração automática, suporte mobile-first / WebView Super App e playground interativo integrado.

Atualizado em `2026-11-13`.

---

## Sumário

1. [Visão Geral e Arquitetura Dual](#1-visão-geral-e-arquitetura-dual)
2. [Stack Tecnológica Real](#2-stack-tecnológica-real)
3. [Instalação e CLI (`npx lopes-ui init`)](#3-instalação-e-cli-npx-lopes-ui-init)
4. [Subpath Exports e Tree-Shaking](#4-subpath-exports-e-tree-shaking)
5. [Executando o Playground Local (`:3002`)](#5-executando-o-playground-local-3002)
6. [Estrutura Real de Diretórios](#6-estrutura-real-de-diretórios)
7. [Catálogo Completo de Componentes](#7-catálogo-completo-de-componentes)
8. [Exemplos Práticos de Uso](#8-exemplos-práticos-de-uso)
9. [Controle de Acesso Declarativo (RBAC)](#9-controle-de-acesso-declarativo-rbac)
10. [Hooks (`lopes-ui/hooks`)](#10-hooks-lopes-uihooks)
11. [Utilitários (`lopes-ui/utils`)](#11-utilitários-lopes-uiutils)
12. [Governança do Registry e Documentação Técnica](#12-governança-do-registry-e-documentação-técnica)

---

## 1. Visão Geral e Arquitetura Dual

O repositório **`lopes-ui`** opera simultaneamente em duas frentes complementares dentro do ecossistema **BigLar Móveis & Eletro**:

1. **Biblioteca Empacotada (`dist/`)**: compilada com `tsup` em `ESM` e `CJS` com declarações TypeScript (`.d.ts` / `.d.mts`), diretiva `"use client"` injetada automaticamente para compatibilidade nativa com React Server Components (RSC), folha de tokens `lopes-ui/styles.css` e **8 subpaths modulares** que isolam dependências opcionais pesadas (Tiptap, TanStack Table/Virtual, Shiki e MapLibre GL).
2. **Showcase Interativo & UI Builder (`app/`)**: aplicação Next.js 16 executada na porta **`3002`** com catálogo vivo de **155 entradas auditadas** em `app/components/registry.ts`, vitrines temáticas (`/showcase/*`), templates corporativos (`/templates`) e construtor visual (`/ui-builder`).

---

## 2. Stack Tecnológica Real

| Camada / Pacote | Versão (`package.json`) | Papel Arquitetural |
| :--- | :--- | :--- |
| **Next.js (App Router)** | `^16.4.3` | Showcase interativo, páginas de demonstração e compatibilidade RSC |
| **React / React DOM** | `19.2.4` | Renderização concorrente, `useSyncExternalStore`, `flushSync` para temas e Compound Components |
| **Tailwind CSS** | `^4.2.2` | Tokens semânticos CSS-first (`@theme`), dark mode e diretiva `@source` |
| **TypeScript** | `^5` | Tipagem estrita ponta a ponta e geração de `.d.ts` (`tsconfig.build.json`) |
| **Radix UI Primitives** | `^1.x` / `^2.x` | Acessibilidade WAI-ARIA (`Dialog`, `AlertDialog`, `Popover`, `Select`, `DropdownMenu`, `Switch`, `Tooltip`, `Slot`) |
| **Class Variance Authority** | `^0.7.1` + `tailwind-merge ^3.6.0` | Variantes tipadas de componentes e resolução determinística de classes |
| **Lucide React** | `^1.29.0` | Biblioteca oficial de ícones vetoriais |
| **Motion** | `^12.40.0` | Micro-interações, física de mola (`AnimatedNumber`, `KpiCarousel`, `LeaderboardPodium`), colapsos e listas escalonadas |
| **Zod** | `^4.4.3` | Validação de schemas em `<ZodForm />` e contratos de formulários |
| **Tiptap v3** *(opcional)* | `^3.31.3` | Editor rich-text completo em `lopes-ui/rich-text` |
| **TanStack Table & Virtual** *(opcional)* | `^8.21.3` / `^3.14.15` | Planilha virtualizada de alta densidade em `lopes-ui/spreadsheet` |
| **Shiki** *(opcional)* | `^4.4.2` | Syntax highlighting em `lopes-ui/code-block` |
| **MapLibre GL** *(opcional)* | `>=4.0.0` (`^6.18.0` dev) | Mapas vetoriais WebGL interativos em `<Map />` / `<MapView />` |
| **tsup** | `8.5.1` | Empacotador da biblioteca (`dist/`) e do binário CLI (`dist/cli.js`) |

---

## 3. Instalação e CLI (`npx lopes-ui init`)

Em um projeto consumidor Next.js / React com Tailwind CSS v4, instale o pacote e execute o assistente CLI:

```bash
# Instalação básica (core: lucide-react, motion, zod + configuração automática do globals.css)
npx lopes-ui init

# Incluindo grupos opcionais conforme a necessidade da aplicação
npx lopes-ui init --tiptap        # Instala extensões @tiptap/* para RichTextEditor e EmailComposer
npx lopes-ui init --spreadsheet   # Instala @tanstack/react-table e @tanstack/react-virtual
npx lopes-ui init --code          # Instala shiki para CodeBlock
npx lopes-ui init --all           # Instala todos os grupos opcionais acima
```

> Caso a aplicação utilize o componente `<Map />` / `<MapView />`, adicione também a peer dependency opcional `maplibre-gl` (`npm install maplibre-gl`).

### O que o comando `init` realiza automaticamente:
1. Detecta o gerenciador de pacotes ativo (`npm`, `pnpm`, `yarn` ou `bun`) a partir do lockfile.
2. Instala apenas as `peerDependencies` ausentes no `package.json` do projeto consumidor.
3. Localiza o `globals.css` (`app/globals.css`, `src/app/globals.css`, etc.) e injeta logo após `@import "tailwindcss";`:

```css
@import "tailwindcss";
@import "lopes-ui/styles.css";
@source "../node_modules/lopes-ui/dist";
```

---

## 4. Subpath Exports e Tree-Shaking

Para evitar que projetos consumidores precisem instalar editores ou motores gráficos que não utilizam, o `package.json` expõe **8 entrypoints independentes**:

| Subpath Import | Conteúdo Principal | Peer Dependencies Extras |
| :--- | :--- | :--- |
| `lopes-ui` | Todos os componentes core, mobile/analytics (`KpiCarousel`, `ExpandableDataCard`, `TouchChartCard`, `AnimatedNumber`, `LeaderboardPodium`), formulários (`form/*`), header (`header/*`), `FormModal`, RBAC (`Can`, `AccessGuard`, `useAccessControl`), `ThemeContext`, `ShellContext` | `lucide-react`, `motion`, `zod` *(opcional)*, `maplibre-gl` *(apenas se usar `<Map>`)* |
| `lopes-ui/primitives` | 18 primitivas headless/estilizadas Radix + CVA (`Button`, `Badge`, `Input`, `Textarea`, `Skeleton`, `Dialog`, `AlertDialog`, `Sheet`, `Table`, `Popover`, `Tooltip`, `Switch`, `DropdownMenu`, `Select`, `Tabs`, `HoverCard`, `Separator`, `ScrollArea`) | Nenhuma extra |
| `lopes-ui/rich-text` | `RichTextEditor`, `RichTextField`, `RichTextViewer`, `EmailComposer` | `@tiptap/*` (`--tiptap`) |
| `lopes-ui/spreadsheet` | `Spreadsheet` e tipos associados | `@tanstack/react-table`, `@tanstack/react-virtual` (`--spreadsheet`) |
| `lopes-ui/code-block` | `CodeBlock` com realce sintático multi-tema | `shiki` (`--code`) |
| `lopes-ui/hooks` | 9 módulos de hooks utilitários (interface, responsividade/Super App mobile, atalhos, posicionamento e áudio) | Nenhuma extra |
| `lopes-ui/utils` | 12 módulos utilitários (moeda BRL, datas, CPF/CNPJ alfanumérico, extenso, exportação CSV/JSON, sync entre abas) | Nenhuma extra |
| `lopes-ui/styles.css` | Tokens CSS, variáveis semânticas light/dark, animações, safe-areas mobile e scrollbars | Tailwind CSS v4 |

---

## 5. Executando o Playground Local (`:3002`)

```bash
cd c:\Biglar\lopes-ui
npm install
npm run dev
```

Acesse **`http://localhost:3002`** para explorar o catálogo interativo de componentes.

### Scripts Disponíveis (`package.json`)

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Next.js de desenvolvimento em `0.0.0.0:3002` |
| `npm run build` | Compila a aplicação Next.js do showcase para produção (Turbopack + TypeScript check) |
| `npm run build:lib` | Empacota a biblioteca e a CLI em `dist/` via `tsup` (ESM, CJS e `.d.ts`; executado também em `prepare`) |
| `npm run start` | Inicia o servidor Next.js compilado |
| `npm run lint` | Executa análise estática com ESLint 9 |
| `npm run typecheck` | Validação completa de tipos TypeScript (`tsc --noEmit`) |
| `npm run check:registry` | Audita integridade entre os componentes exportados e as **155 entradas** de `app/components/registry.ts` |

---

## 6. Estrutura Real de Diretórios

```text
lopes-ui/
├── app/                          # Aplicação Next.js 16 (Showcase & Playground na porta 3002)
│   ├── _components/              # Componentes exclusivos da casca do showcase (AppSidebar, SiteHeader, UIBuilder)
│   ├── components/               # Catálogo pesquisável (/components), demos isoladas e registry.ts (155 itens)
│   ├── showcase/                 # Vitrines por domínio: actions, animation, communication, data,
│   │                             #   display, enterprise, forms e navigation
│   ├── templates/                # Layouts corporativos prontos (/templates)
│   ├── ui-builder/               # Construtor visual interativo (/ui-builder)
│   ├── access-denied/            # Demonstração de bloqueio RBAC 403 (/access-denied)
│   └── cause-error/              # Teste interativo de ErrorBoundary (/cause-error)
│
├── cli/
│   └── index.ts                  # Fonte do binário `npx lopes-ui init`
│
├── components/                   # Código-fonte da biblioteca exportada
│   ├── primitives/               # 18 primitivas base Radix UI + CVA (`lopes-ui/primitives`)
│   ├── form/                     # 31 componentes de formulário, seletores e `<ZodForm />`
│   ├── header/                   # Subcomponentes de cabeçalho (`Brand`, `Nav`, `SearchInput`, `ProfileMenu`, `ProfileActions`, `ProfileTrigger`)
│   ├── patterns/form-modal/      # Padrão composto `CompoundFormModal` / `FormDialog`
│   ├── data-table/               # Submódulos internos do `<DataTable />` e `DataTableMobileCard`
│   ├── sidebar/                  # Submódulos internos do `<Sidebar />` (pins, grupos, submenus, storage e UserPopover)
│   ├── rich-text/                # Entrypoint `lopes-ui/rich-text` (Tiptap v3)
│   ├── spreadsheet/              # Entrypoint `lopes-ui/spreadsheet` (TanStack Virtual)
│   ├── schemas/                  # Schemas compartilhados de validação
│   └── *.tsx                     # Componentes corporativos, mobile/KPIs, feedbacks, gráficos, mapas e RBAC
│
├── hooks/                        # 9 módulos de hooks reutilizáveis (`lopes-ui/hooks`)
├── utils/                        # 12 módulos utilitários puros (`lopes-ui/utils`)
├── styles/
│   └── lopes-ui.css              # Design tokens copiados para `dist/styles.css` no build
├── scripts/
│   └── check-registry.mjs        # Validador automatizado do catálogo de componentes
├── docs/                         # Wiki técnica interna (arquitetura, temas, sidebar, RBAC, contribuição)
└── tsup.config.ts                # Pipeline dual-bundle (biblioteca ESM/CJS + CLI Node 18+)
```

> [!NOTE]
> `AppSidebar`, `SiteHeader` e `UIBuilder` residem em `app/_components/` por serem exclusivos da aplicação de demonstração. Aplicações consumidoras utilizam `<Sidebar />`, `<Header />` e `<HeaderWrapper />` exportados pela raiz `lopes-ui`.

---

## 7. Catálogo Completo de Componentes

### 7.1. Formulários e Entrada de Dados (`components/form/*` & Raiz)
- **Texto, Números e Moeda**: `TextField`, `TextareaField`, `NumberField`, `PriceInput` / `CurrencyField`, `InputGroup`, `OTPInput`, `PasswordStrength`, `InlineEdit`, `MentionsField` (`Mentions`).
- **Seleção e Listas**: `SelectField`, `NativeSelect` (`Select`), `AutocompleteField`, `MultiSelectField`, `CascaderField` (`Cascader`), `TreeSelectField` (`TreeSelect`), `RadioGroupField`, `Checkbox`, `CheckboxGroup`, `Switch`, `SegmentedControl`, `ToggleGroup`, `TransferList`, `ScopeSelector`.
- **Datas e Horários**: `DateField`, `DatePickerField`, `DateRangePickerField`, `MonthPickerField`, `TimeField`, `TimePickerField`.
- **Tags, Cores, Avaliação e Upload**: `TagInputField`, `TagsInput` (`CheckableTag`, `CheckableTagGroup`), `FilterChips`, `ColorPickerField`, `SliderField`, `RatingField`, `FileField`, `FileDropzone`, `SignaturePad` (`SignatureField`).
- **Estrutura e Validação**: `FieldWrapper` (`FormField`), `Form`, `ZodForm` (`useFormContext`).

### 7.2. Tabelas, Dados, Mobile Analytics e Códigos Fiscais/Logísticos
- **Tabelas e Grade de Dados**: `DataTable` (ordenação, seleção, paginação, ações em lote, expansão, exportação e `DataTableMobileCard`), `ExpandableDataCard` (card analítico/operacional expansível para mobile), `Table`, `Spreadsheet` (`lopes-ui/spreadsheet`), `FilterBar`, `Pagination`.
- **Métricas, KPIs e Gráficos**: `StatCard` (`StatsSegmentsCard`, `StatsRingCard`), `KpiCarousel` (carrossel mobile com snap horizontal e grid automático no desktop), `AnimatedNumber` (interpolação numérica por mola em moeda BRL, percentual, decimal e inteiro), `LeaderboardPodium` (pódio gamificado Top-3 para rankings comerciais), `Chart`, `TouchChartCard` (moldura mobile para gráficos com inspeção por toque).
- **Listas, Estruturas e Código**: `DescriptionList`, `DetailLayout`, `TreeView`, `KanbanBoard`, `SortableList`, `Timeline`, `ActivityFeed`, `Agenda`, `Calendar`, `SmartObject`, `JsonViewer`, `Diff`, `CodeBlock` (`lopes-ui/code-block`), `CodeEditor`.
- **Identificação Comercial, Mapas e Destaque**: `Barcode` (EAN-13/Code128 para etiquetas de móveis e eletrodomésticos), `QRCode` (PIX / autenticação / etiquetas), `Map` (`MapView`, `MapMarker`, `MapControls`, `useMap` via MapLibre GL), `HighlightText`.

### 7.3. Navegação, Shell Corporativo e Layout
- **Casca da Aplicação**: `ShellProvider` / `useShell` (`ShellContext`), `Sidebar` (com pins, submenus e persistência isolada por aplicação/usuário), `Header`, `HeaderWrapper`, `Footer`, `PageHeader`, `Breadcrumb`, `AppLauncher`, `TenantSwitcherModal` (`TenantSwitcherTrigger` — seletor multi-filial RO/AM).
- **Menus e Comandos**: `CommandMenu` (`Ctrl+K` / `⌘K`), `ContextMenu`, `Tabs`, `Stepper`, `TableOfContents`, `Dock`, `SpeedDial`, `FloatButton` (`FloatButtonGroup`, `BackTop`), `QuickActions`, `ActionGridCard` (`SwitchesCard`).
- **Containers, Transições e Divisores**: `Card`, `BentoGrid` (`BentoCard`), `SplitPane`, `Accordion`, `Collapsible`, `MotionCollapse` (expansão fluida de altura/opacidade), `StaggerList` (`StaggerItem` — entrada escalonada), `ScrollArea`, `Separator`, `Stack`, `AspectRatio`, `Masonry`, `Carousel`, `Watermark`.

### 7.4. Modais, Confirmações, Estados e Feedback
- **Modais e Painéis**: `Modal`, `FormModal` (`FormSection`, `FormSectionHeader`, `FormEmptyLine`, `FormModalSkeleton`), `CompoundFormModal` / `FormDialog` (`FormModalHeader`, `FormModalBody`, `FormModalActions`, `useFormModal`), `Drawer`, `CnpjLookupModal` (consulta cadastral CNPJ), `CameraCaptureModal` (captura de câmera para ponto/cadastro).
- **Confirmação Unificada**: `Confirm` (`mode="dialog" | "popover" | "password"` — consolida diálogos de confirmação, popconfirm e autorização por senha).
- **Estados e Alertas**: `State` (`kind="empty" | "result" | "page"` para estados vazios, retorno de operação e páginas HTTP 401/403/404/500), `Alert`, `Toast` (`toast` + `ToastProvider`), `ErrorBoundary`, `CookieBanner`.
- **Indicadores e Carregamento**: `Badge` (com suporte a `dot` e `pulse`), `Indicator`, `SplitCounterBadge`, `Progress`, `Loading`, `Skeleton` (`SkeletonAvatar`, `SkeletonButton`, `SkeletonInput`, `SkeletonImage`, `SkeletonCard`, `SkeletonTable`), `ServiceStatusCard`, `Countdown`, `ActiveTimerWidget`, `PullToRefresh`, `Tour`.

### 7.5. Comunicação, Mídia, Temas e Utilitários Visuais
- **Chat, E-mail e Notificações**: `ChatWindow`, `ChatMessage`, `ChatComposer`, `ChatConversationItem`, `InboxList`, `EmailComposer` (`lopes-ui/rich-text`), `RichTextEditor` / `RichTextField` / `RichTextViewer`, `NotificationBell`, `EmojiPicker`.
- **Mídia, Tipografia e Tema**: `Avatar`, `HoverCard`, `HoverGallery`, `ImageLightbox`, `Snippet` (`CopyButton`), `Kbd`, `ShortcutHint`, `Spoiler`, `Swap`, `TextRotate`, `Marquee`, `Mask`, `Mockup`, `ThemeProvider` / `ThemeScript` / `useTheme` (`light`, `dark`, `system` + sincronização por cookie cross-subdomain e `BroadcastChannel`), `ThemeToggle`, `LoginForm`.

---

## 8. Exemplos Práticos de Uso

### Campos Numéricos e Monetários (Varejo de Móveis & Eletrodomésticos)

```tsx
import { useState } from "react";
import { NumberField, PriceInput } from "lopes-ui";

export function PrecificacaoProdutoFilial() {
  const [precoVista, setPrecoVista] = useState<number | null>(2899.9);
  const [garantiaMeses, setGarantiaMeses] = useState<number | undefined>(12);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <PriceInput
        label="Preço à Vista — Roupeiro Casal 6 Portas (Filial Porto Velho - RO)"
        value={precoVista}
        onChange={setPrecoVista}
        currency="BRL"
        locale="pt-BR"
      />
      <NumberField
        label="Garantia de Fábrica"
        value={garantiaMeses ?? ""}
        onValueChange={setGarantiaMeses}
        suffix="meses"
        min={3}
        max={60}
        step={3}
      />
    </div>
  );
}
```

### KPIs Mobile-First com Interpolação por Mola (`<KpiCarousel />` & `<ExpandableDataCard />`)

```tsx
import { KpiCarousel, ExpandableDataCard } from "lopes-ui";

export function PainelComercialRegionais() {
  return (
    <div className="space-y-4">
      <KpiCarousel
        desktopColumns={3}
        items={[
          {
            id: "faturamento-ro",
            title: "Faturamento Rondônia (RO)",
            numericValue: 1485200.5,
            numberFormat: "currency",
            trend: { value: 12.4, label: "vs. mês anterior" },
          },
          {
            id: "faturamento-am",
            title: "Faturamento Amazonas (AM)",
            numericValue: 1920450.0,
            numberFormat: "currency",
            trend: { value: 15.8, label: "vs. mês anterior" },
          },
          {
            id: "conversao-crediario",
            title: "Aprovação Crediário Próprio",
            numericValue: 84.6,
            numberFormat: "percent",
          },
        ]}
      />

      <ExpandableDataCard
        code="FIL-01"
        tone="brand"
        title="Loja 01 — Porto Velho Centro (RO)"
        subtitle="Móveis, Estofados, Colchões e Eletrodomésticos · (69) 3221-0000"
        primaryLabel="Meta Mensal Atingida"
        primaryValue={{ value: 96.4, format: "percent" }}
        metrics={[
          { label: "Linha Sala & Estofados", value: "R$ 540.200,00" },
          { label: "Eletro & Lavanderia", value: "R$ 612.800,00" },
        ]}
      />
    </div>
  );
}
```

### Confirmação Unificada (`<Confirm />`) e Estado Unificado (`<State />`)

```tsx
import { Confirm, State, Button } from "lopes-ui";

// Modo Popover (ancorado no gatilho), Dialog ou Revalidação de Senha (`mode="password"`)
<Confirm
  mode="popover"
  tone="warning"
  title="Liberar romaneio de entrega?"
  description="O caminhão da filial Manaus (AM) será confirmado para expedição."
  confirmLabel="Confirmar Expedição"
  onConfirm={confirmarExpedicao}
>
  <Button variant="primary">Liberar Expedição</Button>
</Confirm>

// Estado Vazio (`kind="empty"`), Resultado (`kind="result"`) ou Página (`kind="page"`)
<State
  kind="empty"
  title="Nenhuma entrega programada para Manaus (AM)"
  description="Selecione outra praça ou crie um novo romaneio de expedição."
/>
```

### Modal de Formulário (`<FormModal />`)

```tsx
import { FormModal, FormSection, TextField, SelectField } from "lopes-ui";

<FormModal
  open={open}
  onClose={() => setOpen(false)}
  title="Cadastrar Depósito / Loja"
  subtitle="Unidades operacionais de Rondônia (69) e Amazonas (92)"
  onSave={salvarFilial}
  saveLabel="Salvar Filial"
>
  <FormSection title="Identificação da Unidade">
    <TextField label="Nome da Filial" placeholder="Ex.: Loja 04 — Ji-Paraná (RO)" required />
    <TextField label="Telefone Comercial" placeholder="(69) 3421-0000" />
    <SelectField
      label="UF de Atuação"
      options={[
        { label: "Rondônia (RO)", value: "RO" },
        { label: "Amazonas (AM)", value: "AM" },
      ]}
    />
  </FormSection>
</FormModal>
```

---

## 9. Controle de Acesso Declarativo (RBAC)

A biblioteca fornece primitivas nativas de governança de permissões alinhadas ao catálogo de tarefas do `biglar-api`:

- **`<AccessControlProvider>` & `useAccessControl()`**: injeta tarefas autorizadas (`tasks`), flag `isAdmin` e helpers `hasTask(task)`, `hasAnyTask(tasks)`, `hasAllTasks(tasks)` e `canAccess(componentIdOrTask)`.
- **`<Can task="ERP.VENDA.APROVAR">`**: renderiza condicionalmente botões, abas ou ações conforme a tarefa ou `componentId` autorizado.
- **`<AccessGuard>` & `<AccessDeniedState>`**: protege páginas inteiras exibindo bloqueio padronizado (`403`) quando o usuário não detém a permissão exigida.
- **`<Controllable>`**: acopla `componentId` para inspeção e governança granular de componentes.

Consulte [docs/ACCESS_CONTROL.md](./docs/ACCESS_CONTROL.md) para detalhes completos.

---

## 10. Hooks (`lopes-ui/hooks`)

| Hook / Função | Descrição |
| :--- | :--- |
| `useAsyncButton` | Gerencia estados de `loading`, bloqueio contra duplo clique e tratamento de erro em ações assíncronas |
| `useAsyncAutocomplete` | Busca assíncrona com debounce, cache de opções, cancelamento (`AbortController`) e estado de carregamento |
| `useMediaQuery` / `useIsMobile` / `useIsCompactViewport` | Media queries reativas SSR-safe via `useSyncExternalStore` (`< 768px` para mobile e `< 640px` para viewport compacta) |
| `useIsBigLarMobileApp` / `getBigLarMobileBridge` | Detecta execução embarcada na WebView do Super App **BigLar Mobile** (`ios` / `android`) e expõe a ponte nativa (`scanBarcode`, `openFilialPicker`, `openApp`) |
| `useModal` | Controle tipado de abertura, fechamento e payload (`ModalState<T>`) para modais e drawers |
| `useToast` | Hook reativo para disparo de notificações empilhadas |
| `useGlobalKeyShortcuts` | Registro declarativo de atalhos globais de teclado (ignorando inputs focados quando configurado) |
| `useBodyScrollLock` | Bloqueia o scroll do `document.body` preservando compensação de largura da scrollbar |
| `useSmartPosition` | Cálculo geométrico anti-colisão na viewport (`calcCursorPos`, `calcSmartPos`, `calcSubMenuPos`) |
| `useSoundNotification` | Alerta sonoro sintetizado via Web Audio API (`playNotificationChime`) para chat e fila de atendimento |

---

## 11. Utilitários (`lopes-ui/utils`)

| Módulo | Principais Funções / Responsabilidade |
| :--- | :--- |
| `cn` | Combinação inteligente de classes condicionais (`clsx` + `tailwind-merge`) |
| `currency` | Formatação e parsing monetário em Real (`BRL`) e moedas ISO 4217 |
| `date` | Formatação, parsing ISO e datas relativas em `pt-BR` |
| `document` | Validação e máscara de **CPF** e **CNPJ numérico e alfanumérico** (compatível com o padrão RFB) |
| `extenso` | Escrita de valores monetários e numéricos por extenso em português (contratos, promissórias e recibos) |
| `exporters` | Exportação client-side estruturada de coleções para CSV/TSV/JSON com BOM UTF-8 |
| `crossTabSync` | Canal tipado (`BroadcastChannel` + fallback `storage`) para sincronização instantânea entre abas |
| `filterNavItems` | Filtragem recursiva de árvores de navegação do `<Sidebar>` por busca textual e permissões RBAC |
| `file` | Formatação de bytes, extração de extensão, leitura Base64 e validação de MIME types |
| `overlay` | Pilha global de overlays abertos para coordenação da tecla `Escape` e foco |
| `sanitize` | Sanitização defensiva de HTML e strings contra injeção XSS em visualizadores ricos |
| `string` | Normalização sem acentos (`slugify`), iniciais de nomes, truncamento e capitalização |

---

## 12. Governança do Registry e Documentação Técnica

Sempre que um novo componente público for adicionado em `components/index.ts`, registre sua entrada correspondente em `app/components/registry.ts` e execute:

```bash
npm run check:registry && npm run typecheck && npm run build:lib
```

### Documentação Aprofundada (`docs/`)
- **[Índice da Wiki (`docs/README.md`)](./docs/README.md)**
- **[Arquitetura do Shell (`docs/architecture.md`)](./docs/architecture.md)** — `ShellContext`, coordenação `Header` ↔ `Sidebar` e estrutura de páginas
- **[Sistema de Temas (`docs/theme-system.md`)](./docs/theme-system.md)** — Dark/Light/System sem flash (`ThemeScript`), sincronização cross-subdomain, `flushSync` e `no-transition`
- **[API do Sidebar (`docs/sidebar.md`)](./docs/sidebar.md)** — Navegação multinível, submenus, itens fixados (pins), tooltips em portal e `UserPopover`
- **[Controle de Acesso (`docs/ACCESS_CONTROL.md`)](./docs/ACCESS_CONTROL.md)** — RBAC declarativo, `componentId` e manifesto de componentes
- **[Guia de Contribuição (`docs/contributing.md`)](./docs/contributing.md)** — Padrões de criação, consolidação de componentes, acessibilidade, tipagem e registro no showcase
