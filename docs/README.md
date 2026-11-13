# Lopes UI — Wiki Técnica (`v1.2.0`)

Documentação arquitetural e guias internos do Design System **Lopes UI**. Para instalação via CLI (`npx lopes-ui init`), subpath exports e catálogo completo de componentes, consulte o [README principal](../README.md).

---

## 1. Índice de Guias Técnicos

| Documento | Escopo Técnico |
| :--- | :--- |
| **[architecture.md](./architecture.md)** | Arquitetura do App Shell (`ShellProvider`, `useShell`), coordenação responsiva entre `<Header>` / `<HeaderWrapper>` e `<Sidebar>`, e anatomia de layouts corporativos |
| **[theme-system.md](./theme-system.md)** | Tokens semânticos Tailwind CSS v4 (`styles/lopes-ui.css`), `ThemeProvider`, script anti-FOUC (`ThemeScript`) e alternância instantânea com `flushSync` + `no-transition` |
| **[sidebar.md](./sidebar.md)** | API completa do `<Sidebar>`, colapso, busca filtrada (`filterNavItems`), itens favoritados (pins), tooltips via Portal e rodapé com `UserPopover` |
| **[ACCESS_CONTROL.md](./ACCESS_CONTROL.md)** | Governança RBAC no frontend (`AccessControlProvider`, `<Can>`, `<AccessGuard>`, `<Controllable>`), `componentId` e integração com permissões corporativas |
| **[contributing.md](./contributing.md)** | Convenções para criar componentes, usar primitivas Radix/CVA, expor subpaths no `tsup.config.ts` e validar o catálogo com `npm run check:registry` |

---

## 2. Mapa de Entrypoints do Pacote (`package.json`)

| Import Path | Entrypoint Fonte | Quando Utilizar |
| :--- | :--- | :--- |
| `lopes-ui` | `components/index.ts` | Componentes corporativos, formulários (`form/*`), `FormModal`, mapas, códigos de barras/QR e RBAC |
| `lopes-ui/primitives` | `components/primitives/index.ts` | Primitivas base Radix UI + CVA (`Dialog`, `Popover`, `Select`, `DropdownMenu`, `Tooltip`, `Tabs`, `Sheet`…) |
| `lopes-ui/rich-text` | `components/rich-text/index.ts` | `RichTextEditor`, `RichTextField`, `RichTextViewer` e `EmailComposer` (requer `--tiptap`) |
| `lopes-ui/spreadsheet` | `components/spreadsheet/index.ts` | Planilha interativa virtualizada `Spreadsheet` (requer `--spreadsheet`) |
| `lopes-ui/code-block` | `components/CodeBlock.tsx` | Bloco de código com syntax highlight Shiki v4 (requer `--code`) |
| `lopes-ui/hooks` | `hooks/index.ts` | `useAsyncButton`, `useAsyncAutocomplete`, `useMediaQuery`, `useIsMobile`, `useIsCompactViewport`, `useIsBigLarMobileApp`, `useModal`, `useToast`, `useGlobalKeyShortcuts`, `useBodyScrollLock`, `useSmartPosition`, `useSoundNotification` |
| `lopes-ui/utils` | `utils/index.ts` | `cn`, `currency`, `date`, `document` (CPF/CNPJ alfanumérico), `extenso`, `exporters`, `crossTabSync`, `filterNavItems`, `file`, `overlay`, `sanitize`, `string` |
| `lopes-ui/styles.css` | `styles/lopes-ui.css` | Folha de estilos e tokens CSS para importação no `globals.css` |

---

## 3. Rotas do Showcase Interativo (`http://localhost:3002`)

Ao executar `npm run dev` (porta `3002`), a aplicação disponibiliza:

- **`/`** — Visão geral da biblioteca e atalhos rápidos.
- **`/components` e `/components/[slug]`** — Catálogo pesquisável das **155 entradas** registradas em `app/components/registry.ts` com demonstrações ao vivo.
- **`/showcase/forms`** — Campos de texto, moeda BRL, datas, seletores assíncronos, upload e `<ZodForm />`.
- **`/showcase/data`** — `<DataTable />`, `<ExpandableDataCard />`, `<KpiCarousel />`, `<TouchChartCard />`, `<Spreadsheet />`, `<KanbanBoard />`, `<FilterBar />`, `<TreeView />` e `<ActivityFeed />`.
- **`/showcase/display`** — `<StatCard />`, `<Chart />`, `<Calendar />`, `<Agenda />`, `<Barcode />`, `<QRCode />`, `<Map />` e `<SmartObject />`.
- **`/showcase/actions`** — `<Button />`, `<Modal />`, `<FormModal />`, `<Confirm />`, `<Drawer />` e `<CommandMenu />`.
- **`/showcase/communication`** — `<ChatWindow />`, `<EmailComposer />`, `<InboxList />` e `<NotificationBell />`.
- **`/showcase/navigation`** — `<Sidebar />`, `<Breadcrumb />`, `<Tabs />`, `<Stepper />` e `<TenantSwitcherModal />`.
- **`/showcase/enterprise`** — Fluxos corporativos compostos, consulta CNPJ, captura de câmera e RBAC.
- **`/showcase/animation`** — `<AnimatedNumber />`, `<LeaderboardPodium />`, `<MotionCollapse />`, `<StaggerList />`, `<CodeBlock />`, `<TextRotate />`, `<Marquee />` e `<Timeline />`.
- **`/templates` e `/ui-builder`** — Layouts prontos de páginas corporativas e construtor visual interativo.
