# Lopes UI

> Biblioteca de componentes React construída com **Next.js 16**, **Tailwind CSS v4** e **TypeScript** — sem dependências de UI externas.

## Stack

| Tecnologia | Versão |
|---|---|
| Next.js | 16.2.2 |
| React | 19.2.4 |
| Tailwind CSS | 4.2 |
| TypeScript | 5 |
| lucide-react | 1.7 |
| tailwind-merge | 3.5 |
| motion | 12.38 |
| shiki | 4.0 |
| clsx | 2.1 |
| @tiptap/starter-kit | 3.22 |

## Rodando o projeto

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para o playground interativo com todos os componentes.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |

---

## Estrutura

```
lopes-ui/
├── app/
│   ├── page.tsx              # Landing page com links para showcase
│   ├── layout.tsx            # Shell com Sidebar + SiteHeader
│   ├── globals.css           # Estilos base, dark mode, scrollbar
│   ├── access-denied/        # Página de acesso negado (403)
│   ├── cause-error/          # Página de teste de error boundary
│   └── showcase/             # Demos por categoria
│       ├── actions/          # Botões, modais, drawers, alertas
│       ├── animation/        # CodeBlock, Stepper, TextRotate, Timeline
│       ├── communication/    # Chat, e-mail, notificações, inbox
│       ├── data/             # DataTable, KanbanBoard, FilterBar, InboxList, ActivityFeed
│       ├── display/          # Avatar, Badge, Card, Carousel, Calendar, Agenda, StatCard
│       ├── forms/            # Todos os campos de formulário
│       └── navigation/       # Sidebar, Breadcrumb, CommandMenu, TabBar, AppLauncher
│
├── components/
│   ├── form/                 # Campos de formulário
│   │   ├── FieldWrapper      # Wrapper base: label, erro, tooltip, helpText
│   │   ├── TextField         # Input texto / email / url / password / search
│   │   ├── NumberField       # Input numérico com spin buttons
│   │   ├── DateField         # Input data e datetime
│   │   ├── TimeField         # Input de horário
│   │   ├── CheckboxGroup     # Grupo de checkboxes com layout grid
│   │   ├── Switch            # Toggle on/off
│   │   ├── AutocompleteField # Dropdown pesquisável (combobox)
│   │   ├── MultiSelectField  # Seleção múltipla com chips
│   │   └── FileField         # Upload com drag-and-drop
│   │
│   ├── header/               # Partes do SiteHeader
│   │   ├── Brand             # Logo + nome da aplicação
│   │   ├── Nav               # Navegação com dropdowns aninhados
│   │   ├── SearchInput       # Campo de busca do header
│   │   ├── ProfileMenu       # Dropdown de perfil do usuário
│   │   └── ProfileActions    # Ações do header (notificações, tema…)
│   │
│   ├── Accordion.tsx         # Painéis colapsáveis com animação
│   ├── ActionDialog.tsx      # Dialog de confirmação de ações críticas
│   ├── ActivityFeed.tsx      # Feed de eventos com ícones, actor e timestamps
│   ├── Agenda.tsx            # Lista de eventos por dia com localização e participantes
│   ├── Alert.tsx             # Alertas inline e modais
│   ├── AppLauncher.tsx       # Grade de apps/módulos acessíveis
│   ├── AppSidebar.tsx        # Instância de Sidebar configurada para o projeto
│   ├── Avatar.tsx            # Avatar com imagem, iniciais e status
│   ├── Badge.tsx             # Badges com variantes e cores
│   ├── Breadcrumb.tsx        # Trilha de navegação
│   ├── Button.tsx            # Botão base com variantes e loading
│   ├── Calendar.tsx          # Calendário mensal com seleção e eventos
│   ├── Card.tsx              # Cards com header/body/footer compostos
│   ├── Carousel.tsx          # Carrossel com navegação e autoplay
│   ├── ChatComposer.tsx      # Área de composição de mensagens
│   ├── ChatConversationItem.tsx # Item de lista de conversas
│   ├── ChatMessage.tsx       # Bolha de mensagem (texto, imagem, áudio…)
│   ├── ChatWindow.tsx        # Janela de chat completa
│   ├── CodeBlock.tsx         # Bloco de código com syntax highlight (Shiki)
│   ├── CommandMenu.tsx       # Paleta de comandos (⌘K / Ctrl+K)
│   ├── ConfirmDialog.tsx     # Dialog de confirmação genérico
│   ├── ContextMenu.tsx       # Menu de contexto com sub-menus
│   ├── DataTable.tsx         # Tabela avançada com todas as features
│   ├── Drawer.tsx            # Painel lateral deslizante (right/left/top/bottom)
│   ├── EmailComposer.tsx     # Compositor de e-mail com destinatários e anexos
│   ├── EmptyState.tsx        # Estado vazio configurável para listas
│   ├── FilterBar.tsx         # Barra de filtros por chip com dialog avançado
│   ├── Footer.tsx            # Rodapé genérico
│   ├── Header.tsx            # Header genérico reutilizável
│   ├── HeaderWrapper.tsx     # Wrapper do Header que lê ShellContext
│   ├── InboxList.tsx         # Lista de e-mails com estrela, anexos e timestamps
│   ├── KanbanBoard.tsx       # Quadro Kanban com drag-and-drop entre colunas
│   ├── LoginForm.tsx         # Formulário de login com OAuth e OTP
│   ├── NotificationBell.tsx  # Sino de notificações com painel dropdown
│   ├── OTPInput.tsx          # Input de código OTP/2FA
│   ├── PageHeader.tsx        # Cabeçalho de página com título, breadcrumb e ações
│   ├── PasswordStrength.tsx  # Indicador visual de força de senha
│   ├── PingIndicator.tsx     # Indicador de status com pulse animado
│   ├── PriceInput.tsx        # Input de valor monetário com formatação automática
│   ├── QuickActions.tsx      # Grade de ações rápidas configuráveis
│   ├── RichTextEditor.tsx    # Editor rich-text (Tiptap v3) com toolbar completa
│   ├── ServiceStatusCard.tsx # Card de status de serviço com histórico de uptime
│   ├── ShellContext.tsx      # Provider global de layout (sidebar + header)
│   ├── ShortcutHint.tsx      # Badge de atalho de teclado (ex.: ⌘K)
│   ├── Sidebar.tsx           # Sidebar colapsável com navegação aninhada
│   ├── SiteHeader.tsx        # Header do site com CommandMenu integrado
│   ├── SmartObject.tsx       # Cartão de entidade estruturada (person, product…)
│   ├── SplitPane.tsx         # Divisor de painel redimensionável
│   ├── StatCard.tsx          # Card de métrica com sparkline e tendência
│   ├── StatusPage.tsx        # Páginas de status (404, 403, 500…)
│   ├── Stepper.tsx           # Wizard multi-steps
│   ├── Table.tsx             # Tabela simples e configurável
│   ├── TextRotate.tsx        # Texto animado com rotação de itens
│   ├── ThemeContext.tsx      # Provider de tema dark/light
│   ├── ThemeToggle.tsx       # Botão de alternância de tema
│   ├── Timeline.tsx          # Linha do tempo vertical
│   ├── Toast.tsx             # Sistema de notificações (toast)
│   ├── TreeView.tsx          # Árvore navegável com expand/collapse
│   └── UIBuilder.tsx         # Construtor visual de UI interativo
│
├── hooks/
│   ├── useAsyncButton.ts     # Gerencia estado de loading de botões async
│   └── useBodyScrollLock.ts  # Bloqueia scroll do body (modais)
│
└── utils/
```

---

## Componentes

### Formulários

#### `TextField`
```tsx
<TextField
  label="E-mail"
  type="email"
  placeholder="voce@empresa.com"
  leftIcon={<Mail />}
  helpText="Usado para notificações"
  size="md"           // xs | sm | md | lg
  variant="default"   // default | filled
/>
```

#### `NumberField`
```tsx
<NumberField label="Preço" prefix="R$" suffix="por kg" min={0} step={0.01} />
```

#### `DateField`
```tsx
<DateField label="Data de nascimento" mode="date" />  // date | datetime
```

#### `CheckboxGroup`
```tsx
<CheckboxGroup
  label="Permissões"
  options={["Ler", "Editar", "Excluir"]}
  value={selecionados}
  onChange={setSelecionados}
  columns={3}
/>
```

#### `Switch`
```tsx
<Switch label="Ativar notificações" checked={on} onChange={setOn} size="md" />
```

#### `AutocompleteField`
```tsx
<AutocompleteField
  label="Departamento"
  options={["Produto", "Engenharia", "Design"]}
  onSelect={(opt) => console.log(opt.value)}
  clearable
/>
```

#### `MultiSelectField`
```tsx
<MultiSelectField
  label="Tags"
  options={tags}
  value={selected}
  onChange={setSelected}
  maxItems={5}
/>
```

#### `FileField`
```tsx
<FileField label="Contrato" accept=".pdf,.docx" maxSizeMB={5} multiple />
```

#### `PriceInput`
```tsx
<PriceInput
  value={price}
  onChange={setPrice}
  currency="BRL"      // ISO 4217
  locale="pt-BR"      // BCP 47
/>
```

#### `RichTextEditor`
```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  placeholder="Escreva aqui..."
  showCount
  maxLength={2000}
  toolbar={["history", "block", "inline", "align", "list", "link", "table", "media"]}
/>
```

#### `OTPInput`
```tsx
<OTPInput length={6} onComplete={(code) => verificar(code)} />
```

#### `PasswordStrength`
```tsx
<PasswordStrength password={senha} />
```

---

### Layout

#### `Sidebar`
```tsx
<Sidebar
  title="Minha App"
  groups={[
    {
      label: "Principal",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        {
          label: "Relatórios", icon: BarChart2,
          children: [
            { label: "Mensal", href: "/reports/monthly" },
            { label: "Anual",  href: "/reports/yearly"  },
          ],
        },
      ],
    },
  ]}
  user={{ name: "Cristiano", role: "Admin", initials: "CL", status: "online" }}
/>
```

#### `Drawer`
```tsx
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  side="right"        // right | left | top | bottom
  size="md"           // sm | md | lg | xl
  title="Filtros"
>
  {/* conteúdo */}
</Drawer>
```

#### `SplitPane`
```tsx
<SplitPane direction="horizontal" defaultSplit={30}>
  <div>Painel esquerdo</div>
  <div>Painel direito</div>
</SplitPane>
```

#### `PageHeader`
```tsx
<PageHeader
  title="Clientes"
  description="Gerencie sua base de clientes."
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Clientes" }]}
  actions={<Button>Novo cliente</Button>}
/>
```

---

### Card

```tsx
<Card variant="elevated" shadow="md" color="primary" accent radius="xl" hoverable>
  <CardHeader
    icon={TrendingUp}
    iconColor="primary"
    title="Receita"
    description="vs. mês anterior"
    action={<Badge variant="success" label="+12%" />}
  />
  <CardBody>
    <p className="text-3xl font-bold">R$ 48.230</p>
  </CardBody>
  <CardFooter divider align="between">
    <span>Atualizado agora</span>
    <Button size="sm">Ver mais</Button>
  </CardFooter>
</Card>
```

**Variantes:** `default` · `outlined` · `elevated` · `filled` · `ghost`  
**Cores:** `default` · `primary` · `success` · `warning` · `danger` · `info` · `violet` · `pink` · `teal`

---

### Calendário e Agenda

#### `Calendar`

Calendário mensal com seleção simples, intervalo e visualização de eventos.

```tsx
// Seleção simples
<Calendar value={date} onChange={setDate} size="md" />

// Seleção de intervalo
<Calendar
  rangeMode
  rangeValue={range}
  onRangeChange={setRange}
  firstDayOfWeek={1}        // 0=domingo, 1=segunda
/>

// Com eventos
<Calendar
  events={[
    { id: "1", date: "2026-04-05", title: "Stand-up", color: "primary" },
    { id: "2", date: "2026-04-07", title: "Sprint review", color: "success", allDay: true },
  ]}
  eventDisplay="chip"        // dot | chip
  showWeekNumbers
/>
```

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `Date\|null` | — | Data selecionada (controlado) |
| `defaultValue` | `Date\|null` | — | Data inicial (não-controlado) |
| `onChange` | `(date: Date) => void` | — | Callback ao selecionar dia |
| `rangeMode` | `boolean` | `false` | Ativa seleção de intervalo |
| `rangeValue` | `[Date\|null, Date\|null]` | — | Intervalo controlado |
| `onRangeChange` | `(range) => void` | — | Callback de intervalo |
| `events` | `CalendarEvent[]` | `[]` | Eventos a exibir |
| `eventDisplay` | `'dot'\|'chip'` | `'dot'` | Forma de exibição dos eventos |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | Tamanho do calendário |
| `firstDayOfWeek` | `0\|1` | `0` | 0=domingo, 1=segunda |
| `showWeekNumbers` | `boolean` | `false` | Exibe coluna de número de semana |
| `minDate` / `maxDate` | `Date` | — | Limites de seleção |
| `disabledDate` | `(date: Date) => boolean` | — | Desabilita datas individuais |

#### `Agenda`

Lista de eventos organizada por dia com localização e participantes.

```tsx
<Agenda
  events={[
    {
      id: "1",
      date: "2026-04-05",
      title: "Stand-up diário",
      color: "primary",
      startTime: "09:00",
      endTime: "09:15",
      location: "Google Meet",
      attendees: [{ name: "Ana Lima" }, { name: "Bruno Costa" }],
    },
  ]}
  daysAhead={14}             // 0 = todos os eventos futuros
  dateFormat="both"          // relative | date | both
  size="md"                  // sm | md | lg
/>
```

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `events` | `AgendaEvent[]` | required | Lista de eventos |
| `startDate` | `Date` | hoje | Primeira data a exibir |
| `daysAhead` | `number` | `0` | Janela de dias (0 = todos) |
| `dateFormat` | `'relative'\|'date'\|'both'` | `'both'` | Formato do rótulo de dia |
| `showTime` | `boolean` | `true` | Exibe horário |
| `showLocation` | `boolean` | `true` | Exibe localização |
| `showAttendees` | `boolean` | `true` | Exibe avatares dos participantes |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | Tamanho |
| `emptyMessage` | `string` | — | Texto quando não há eventos |

---

### Tabelas

#### `Table` — tabela estática configurável
```tsx
<Table
  variant="striped"   // default | striped | bordered | minimal
  size="md"           // xs | sm | md | lg
  hoverable
  stickyHeader
  columns={[
    { key: "name",   label: "Nome" },
    { key: "status", label: "Status", align: "center",
      render: (v) => <Badge variant="success" label={v as string} /> },
  ]}
  rows={dados}
  rowKey={(r) => r.id}
  onRowClick={(row) => console.log(row)}
/>
```

#### `DataTable` — tabela completa com estado interno
```tsx
<DataTable
  columns={colunas}         // sortable, hidden, required, summary, getValue
  rows={dados}
  rowKey={(r) => r.id}
  actions={acoes}           // menu ⋯ por linha, com danger / divider / disabled
  globalSearch              // barra de busca na toolbar
  filterFields={filtros}    // dialog com TextField / NumberField / DateField / Autocomplete
  columnToggle              // painel de visibilidade de colunas
  showSummary               // rodapé com sum | avg | min | max | count
  pagination
  defaultPageSize={10}
  pageSizeOptions={[10, 25, 50]}
  title="Funcionários"
  toolbarSlot={<Button size="sm">Exportar</Button>}
/>
```

#### `KanbanBoard`
```tsx
<KanbanBoard
  columns={colunas}   // { id, title, color, limit, items[] }
  onCardMove={(cardId, targetColumnId) => mover(cardId, targetColumnId)}
/>
```

#### `FilterBar`
```tsx
<FilterBar
  fields={[
    { key: "status", label: "Status",   type: "autocomplete", options: statusOptions },
    { key: "date",   label: "Data",     type: "date" },
    { key: "amount", label: "Valor",    type: "number" },
  ]}
  value={filtros}
  onChange={setFiltros}
/>
```

---

### Dados e Feed

#### `StatCard`
```tsx
<StatCard
  title="Receita mensal"
  value="R$ 48.230"
  trend={{ pct: 12.4, direction: "up" }}
  spark={[4,6,5,8,7,9,8,10,11,13,12,15].map((v) => ({ value: v }))}
  icon={DollarSign}
  color="success"
/>
```

#### `ActivityFeed`
```tsx
<ActivityFeed
  events={[
    {
      id: "1",
      title: "Pedido aprovado",
      description: "#PD-2024-00841",
      icon: CheckCircle,
      color: "emerald",
      actor: { name: "Ana Souza", initials: "AS" },
      timestamp: new Date(),
    },
  ]}
  maxHeight="320px"
/>
```

#### `InboxList`
```tsx
<InboxList
  items={mensagens}
  selectedId={selecionado}
  onSelect={setSelecionado}
  onToggleStar={(id) => alternarEstrela(id)}
/>
```

#### `ServiceStatusCard`
```tsx
<ServiceStatusCard
  service={{ name: "API Gateway", status: "operational" }}
  history={historico}      // UptimeDay[]
  incidents={incidentes}   // ServiceIncident[]
/>
```

---

### Interação

#### `CommandMenu`
Paleta de comandos abrível via **⌘K** / **Ctrl+K** ou clique.
```tsx
<CommandMenu
  items={[
    { group: "Navegação", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { group: "Ações",     label: "Novo pedido", icon: Plus, onSelect: criarPedido, shortcut: "⌘N" },
  ]}
  triggerLabel="Buscar..."
/>
```

#### `ContextMenu`
```tsx
<ContextMenu trigger="contextmenu" items={menuItems} onSelect={handleSelect}>
  <div>Clique com botão direito aqui</div>
</ContextMenu>
```

#### `ActionDialog`
```tsx
<ActionDialog
  title="Excluir registro"
  description="Esta ação não pode ser desfeita."
  variant="danger"
  onConfirm={excluir}
  trigger={<Button variant="destructive">Excluir</Button>}
/>
```

#### `Alert`
```tsx
// Inline
<Alert variant="warning" title="Atenção" description="Campos obrigatórios não preenchidos." />

// Modal
<Alert
  mode="dialog"
  variant="danger"
  title="Erro crítico"
  description="Verifique os logs."
  open={open}
  onClose={() => setOpen(false)}
/>
```

#### `NotificationBell`
```tsx
<NotificationBell
  notifications={notificacoes}
  onMarkRead={(id) => marcarLida(id)}
  onMarkAllRead={() => marcarTodas()}
  onDismiss={(id) => remover(id)}
/>
```

#### `QuickActions`
```tsx
<QuickActions
  actions={[
    { id: "new-order",  label: "Novo pedido",  icon: Plus,   color: "indigo" },
    { id: "export",     label: "Exportar",     icon: Download, color: "emerald" },
  ]}
  onAction={(id) => executar(id)}
/>
```

---

### Outros

#### `Avatar` / `AvatarGroup`
```tsx
<Avatar name="Cristiano Lopes" src="/foto.jpg" status="online" size="md" />

<AvatarGroup
  users={[{ name: "Ana" }, { name: "Bruno" }, { name: "Carla" }]}
  max={3}
/>
```

#### `Badge`
```tsx
<Badge variant="success" label="Ativo"   size="sm" />
<Badge variant="danger"  label="Erro"    dot />
<Badge variant="primary" label="Beta"    solid />
<Badge variant="warning" label="Remover" onRemove={() => {}} />
```

#### `Accordion`
```tsx
<Accordion
  items={[
    { title: "O que é Lopes UI?", content: <p>...</p> },
    { title: "Como instalar?",    content: <p>...</p> },
  ]}
  multiple
  variant="bordered"   // default | bordered | separated
/>
```

#### `EmptyState`
```tsx
<EmptyState
  title="Nenhum resultado"
  description="Tente ajustar seus filtros."
  icon={SearchX}
  action={<Button>Limpar filtros</Button>}
/>
```

#### `PingIndicator`
```tsx
<PingIndicator status="operational" label="Todos os sistemas normais" />
// status: operational | degraded | outage | unknown
```

#### `ShortcutHint`
```tsx
<ShortcutHint keys={["⌘", "K"]} />   // renders ⌘ K badges
```

#### `Breadcrumb`
```tsx
<Breadcrumb
  items={[
    { label: "Home",      href: "/" },
    { label: "Clientes",  href: "/clients" },
    { label: "Editar" },
  ]}
/>
```

#### `AppLauncher`
```tsx
<AppLauncher
  apps={[
    { id: "hub",     label: "Project Hub",  icon: LayoutDashboard, color: "indigo" },
    { id: "billing", label: "Faturamento",  icon: DollarSign,       color: "emerald" },
  ]}
  onSelect={(id) => navegarPara(id)}
/>
```

#### `StatusPage`
```tsx
<StatusPage variant="404" />  // 404 | 403 | 500 | maintenance | empty | success
```

#### `Toast`

Sistema de notificações próprio, sem dependências externas.

```tsx
import { toast, Toaster } from "@/components/Toast";

// No layout
<Toaster position="top-right" />

// Em qualquer componente
toast.success("Salvo com sucesso!");
toast.error("Algo deu errado.");
toast.warning("Atenção: ação irreversível.");
toast.info("Nova atualização disponível.", {
  action: { label: "Atualizar", onClick: () => {} },
});
toast.loading("Carregando...");
toast.promise(minhaPromise, {
  loading: "Salvando...",
  success: "Pronto!",
  error:   "Falha ao salvar.",
});
```

#### `TextRotate`

Texto animado que alterna entre itens com animações de entrada/saída.

```tsx
<TextRotate
  items={["velocidade", "qualidade", "beleza"]}
  duration={2500}
  animation="slide"   // slide | discrete | fade | rise
  className="text-indigo-600 font-bold"
/>
```

#### `Timeline`

```tsx
<Timeline
  items={[
    { title: "Criação", description: "Projeto iniciado.", date: "Jan 2024", status: "done" },
    { title: "Beta",    description: "Primeira versão.",  date: "Mar 2024", status: "current" },
    { title: "v1.0",   description: "Lançamento.",        date: "Jun 2024", status: "upcoming" },
  ]}
/>
```

#### `Stepper`

```tsx
<Stepper
  steps={["Dados pessoais", "Endereço", "Confirmação"]}
  currentStep={1}
  variant="default"   // default | compact | dots
/>
```

#### `TreeView`

```tsx
<TreeView
  nodes={[
    {
      id: "docs",
      label: "Documentos",
      icon: Folder,
      children: [
        { id: "readme", label: "README.md", icon: FileText },
        { id: "license", label: "LICENSE",  icon: FileText },
      ],
    },
  ]}
  onSelect={(node) => console.log(node.id)}
/>
```

#### `SmartObject`

Cartão de entidade estruturada com campos, ações e metadata.

```tsx
<SmartObject
  type="person"
  name="Ana Lima"
  subtitle="Engenheira de Software"
  fields={[
    { label: "E-mail", value: "ana@empresa.com", type: "email" },
    { label: "Time",   value: "Plataforma" },
  ]}
  actions={[{ label: "Ver perfil", href: "/team/ana" }]}
/>
```

#### `ChatWindow`

```tsx
<ChatWindow
  conversations={conversas}
  onSend={(msg) => enviar(msg)}
  currentUserId="user-1"
/>
```

---

## Dark Mode

Tema dark/light baseado em classe (`class="dark"` no `<html>`), sem flash no reload: o tema é aplicado via `<script>` inline no `<head>` antes de qualquer renderização React.

```tsx
import { useTheme } from "@/components/ThemeContext";

const { theme, toggle } = useTheme();
```

---

## Controle de Acesso

Todos os componentes aceitam a prop `componentId` que é emitida como `data-component-id` no DOM, permitindo integração com qualquer sistema de controle de acesso baseado em atributos (ABAC).

```tsx
<Button componentId="btn-excluir-pedido">Excluir</Button>
// → <button data-component-id="btn-excluir-pedido">Excluir</button>
```

Consulte [docs/ACCESS_CONTROL.md](docs/ACCESS_CONTROL.md) para detalhes sobre a implementação.

---

<p align="center">
  Feito por <strong>Cristiano Lopes</strong> · construído com Next.js, Tailwind CSS e lucide-react
</p>

## Rodando o projeto

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para o playground interativo com todos os componentes.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |

---

## Estrutura

```
lopes-ui/
├── app/
│   ├── page.tsx              # Playground interativo com todos os demos
│   ├── layout.tsx            # Shell com Sidebar + SiteHeader
│   ├── globals.css           # Estilos base, dark mode, scrollbar
│   ├── access-denied/        # Página de acesso negado (403)
│   └── cause-error/          # Página de teste de error boundary
│
├── components/
│   ├── form/                 # Campos de formulário
│   │   ├── FieldWrapper      # Wrapper base: label, erro, tooltip, helpText
│   │   ├── TextField         # Input texto / email / url / password / search
│   │   ├── NumberField       # Input numérico com spin buttons
│   │   ├── DateField         # Input data e datetime
│   │   ├── TimeField         # Input de horário
│   │   ├── CheckboxGroup     # Grupo de checkboxes com layout grid
│   │   ├── Switch            # Toggle on/off
│   │   ├── AutocompleteField # Dropdown pesquisável (combobox)
│   │   ├── MultiSelectField  # Seleção múltipla com chips
│   │   └── FileField         # Upload com drag-and-drop
│   │
│   ├── header/               # Partes do SiteHeader
│   │   ├── Brand             # Logo + nome da aplicação
│   │   ├── Nav               # Navegação com dropdowns aninhados
│   │   ├── SearchInput       # Campo de busca do header
│   │   ├── ProfileMenu       # Dropdown de perfil do usuário
│   │   └── ProfileActions    # Ações do header (notificações, tema…)
│   │
│   ├── Accordion.tsx         # Painéis colapsáveis com animação
│   ├── ActionDialog.tsx      # Dialog de confirmação de ações críticas
│   ├── Alert.tsx             # Alertas inline e modais
│   ├── Avatar.tsx            # Avatar com imagem, iniciais e status
│   ├── Badge.tsx             # Badges com variantes e cores
│   ├── Button.tsx            # Botão base com variantes e loading
│   ├── Card.tsx              # Cards com header/body/footer compostos
│   ├── Carousel.tsx          # Carrossel com navegação e autoplay
│   ├── ChatComposer.tsx      # Área de composição de mensagens
│   ├── ChatConversationItem.tsx # Item de lista de conversas
│   ├── ChatMessage.tsx       # Bolha de mensagem (texto, imagem, áudio…)
│   ├── ChatWindow.tsx        # Janela de chat completa
│   ├── CodeBlock.tsx         # Bloco de código com syntax highlight (Shiki)
│   ├── CommandMenu.tsx       # Paleta de comandos (⌘K / Ctrl+K)
│   ├── ContextMenu.tsx       # Menu de contexto com sub-menus
│   ├── DataTable.tsx         # Tabela avançada com todas as features
│   ├── Header.tsx            # Header genérico reutilizável
│   ├── Sidebar.tsx           # Sidebar colapsável com navegação aninhada
│   ├── SiteHeader.tsx        # Header do site com CommandMenu integrado
│   ├── StatusPage.tsx        # Páginas de status (404, 403, 500…)
│   ├── Stepper.tsx           # Wizard multi-steps
│   ├── Table.tsx             # Tabela simples e configurável
│   ├── TextRotate.tsx        # Texto animado com rotação de itens
│   ├── ThemeContext.tsx      # Provider de tema dark/light
│   ├── ThemeToggle.tsx       # Botão de alternância de tema
│   ├── Timeline.tsx          # Linha do tempo vertical
│   ├── Toast.tsx             # Sistema de notificações (toast)
│   └── TreeView.tsx          # Árvore navegável com expand/collapse
│
└── hooks/
    ├── useAsyncButton.ts     # Gerencia estado de loading de botões async
    └── useBodyScrollLock.ts  # Bloqueia scroll do body (modais)
```

---

## Componentes

### Formulários

#### `TextField`
```tsx
<TextField
  label="E-mail"
  type="email"
  placeholder="voce@empresa.com"
  leftIcon={<Mail />}
  helpText="Usado para notificações"
  size="md"           // xs | sm | md | lg
  variant="default"   // default | filled
/>
```

#### `NumberField`
```tsx
<NumberField label="Preço" prefix="R$" suffix="por kg" min={0} step={0.01} />
```

#### `DateField`
```tsx
<DateField label="Data de nascimento" mode="date" />  // date | datetime
```

#### `CheckboxGroup`
```tsx
<CheckboxGroup
  label="Permissões"
  options={["Ler", "Editar", "Excluir"]}
  value={selecionados}
  onChange={setSelecionados}
  columns={3}
/>
```

#### `Switch`
```tsx
<Switch label="Ativar notificações" checked={on} onChange={setOn} size="md" />
```

#### `AutocompleteField`
```tsx
<AutocompleteField
  label="Departamento"
  options={["Produto", "Engenharia", "Design"]}
  onSelect={(opt) => console.log(opt.value)}
  clearable
/>
```

#### `MultiSelectField`
```tsx
<MultiSelectField
  label="Tags"
  options={tags}
  value={selected}
  onChange={setSelected}
  maxItems={5}
/>
```

#### `FileField`
```tsx
<FileField label="Contrato" accept=".pdf,.docx" maxSizeMB={5} multiple />
```

---

### Layout

#### `Sidebar`
```tsx
<Sidebar
  title="Minha App"
  groups={[
    {
      label: "Principal",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        {
          label: "Relatórios", icon: BarChart2,
          children: [
            { label: "Mensal", href: "/reports/monthly" },
            { label: "Anual",  href: "/reports/yearly"  },
          ],
        },
      ],
    },
  ]}
  user={{ name: "Cristiano", role: "Admin", initials: "CL", status: "online" }}
/>
```

#### `Card`
```tsx
<Card variant="elevated" shadow="md" color="primary" accent radius="xl" hoverable>
  <CardHeader
    icon={TrendingUp}
    iconColor="primary"
    title="Receita"
    description="vs. mês anterior"
    action={<Badge variant="success" label="+12%" />}
  />
  <CardBody>
    <p className="text-3xl font-bold">R$ 48.230</p>
  </CardBody>
  <CardFooter divider align="between">
    <span>Atualizado agora</span>
    <Button size="sm">Ver mais</Button>
  </CardFooter>
</Card>
```

**Variantes:** `default` · `outlined` · `elevated` · `filled` · `ghost`  
**Cores:** `default` · `primary` · `success` · `warning` · `danger` · `info` · `violet` · `pink` · `teal`

---

### Tabelas

#### `Table` — tabela estática configurável
```tsx
<Table
  variant="striped"   // default | striped | bordered | minimal
  size="md"           // xs | sm | md | lg
  hoverable
  stickyHeader
  columns={[
    { key: "name",   label: "Nome" },
    { key: "status", label: "Status", align: "center",
      render: (v) => <Badge variant="success" label={v as string} /> },
  ]}
  rows={dados}
  rowKey={(r) => r.id}
  onRowClick={(row) => console.log(row)}
/>
```

#### `DataTable` — tabela completa com estado interno
```tsx
<DataTable
  columns={colunas}         // sortable, hidden, required, summary, getValue
  rows={dados}
  rowKey={(r) => r.id}
  actions={acoes}           // menu ⋯ por linha, com danger / divider / disabled
  globalSearch              // barra de busca na toolbar
  filterFields={filtros}    // dialog com TextField / NumberField / DateField / Autocomplete
  columnToggle              // painel de visibilidade de colunas
  showSummary               // rodapé com sum | avg | min | max | count
  pagination
  defaultPageSize={10}
  pageSizeOptions={[10, 25, 50]}
  title="Funcionários"
  toolbarSlot={<Button size="sm">Exportar</Button>}
/>
```

**`summary` por coluna:**
```tsx
{ key: "salary", summary: "sum"  }   // Σ 48.000
{ key: "score",  summary: "avg"  }   // x̄ 87,5
{ key: "id",     summary: "count"}   // # 12
{ key: "total",  summary: (rows) => `R$ ${somarTudo(rows)}` }  // função customizada
```

---

### Interação

#### `CommandMenu`
Paleta de comandos abrível via **⌘K** / **Ctrl+K** ou clique.
```tsx
<CommandMenu
  items={[
    { group: "Navegação", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { group: "Ações",     label: "Novo pedido", icon: Plus, onSelect: criarPedido, shortcut: "⌘N" },
  ]}
  triggerLabel="Buscar..."
/>
```

#### `ContextMenu`
```tsx
<ContextMenu trigger="contextmenu" items={menuItems} onSelect={handleSelect}>
  <div>Clique com botão direito aqui</div>
</ContextMenu>
```

#### `ActionDialog`
```tsx
<ActionDialog
  title="Excluir registro"
  description="Esta ação não pode ser desfeita."
  variant="danger"
  onConfirm={excluir}
  trigger={<Button variant="destructive">Excluir</Button>}
/>
```

#### `Alert`
```tsx
// Inline
<Alert variant="warning" title="Atenção" description="Campos obrigatórios não preenchidos." />

// Modal
<Alert
  mode="dialog"
  variant="danger"
  title="Erro crítico"
  description="Verifique os logs."
  open={open}
  onClose={() => setOpen(false)}
/>
```

---

### Outros

#### `Avatar` / `AvatarGroup`
```tsx
<Avatar name="Cristiano Lopes" src="/foto.jpg" status="online" size="md" />

<AvatarGroup
  users={[{ name: "Ana" }, { name: "Bruno" }, { name: "Carla" }]}
  max={3}
/>
```

#### `Badge`
```tsx
<Badge variant="success" label="Ativo"   size="sm" />
<Badge variant="danger"  label="Erro"    dot />
<Badge variant="primary" label="Beta"    solid />
<Badge variant="warning" label="Remover" onRemove={() => {}} />
```

#### `Accordion`
```tsx
<Accordion
  items={[
    { title: "O que é Lopes UI?", content: <p>...</p> },
    { title: "Como instalar?",    content: <p>...</p> },
  ]}
  multiple
  variant="bordered"   // default | bordered | separated
/>
```

#### `StatusPage`
```tsx
<StatusPage variant="404" />  // 404 | 403 | 500 | maintenance | empty | success
```

#### `Toast`

Sistema de notificações próprio, sem dependências externas.

```tsx
import { toast, Toaster } from "@/components/Toast";

// No layout
<Toaster position="top-right" />

// Em qualquer componente
toast.success("Salvo com sucesso!");
toast.error("Algo deu errado.");
toast.warning("Atenção: ação irreversível.");
toast.info("Nova atualização disponível.", {
  action: { label: "Atualizar", onClick: () => {} },
});
toast.loading("Carregando...");
toast.promise(minhaPromise, {
  loading: "Salvando...",
  success: "Pronto!",
  error:   "Falha ao salvar.",
});
```

#### `TextRotate`

Texto animado que alterna entre itens com animações de entrada/saída.

```tsx
<TextRotate
  items={["velocidade", "qualidade", "beleza"]}
  duration={2500}
  animation="slide"   // slide | discrete | fade | rise
  className="text-indigo-600 font-bold"
/>
```

#### `Timeline`

```tsx
<Timeline
  items={[
    { title: "Criação", description: "Projeto iniciado.", date: "Jan 2024", status: "done" },
    { title: "Beta",    description: "Primeira versão.",  date: "Mar 2024", status: "current" },
    { title: "v1.0",   description: "Lançamento.",        date: "Jun 2024", status: "upcoming" },
  ]}
/>
```

#### `Stepper`

```tsx
<Stepper
  steps={["Dados pessoais", "Endereço", "Confirmação"]}
  currentStep={1}
  variant="default"   // default | compact | dots
/>
```

#### `TreeView`

```tsx
<TreeView
  nodes={[
    {
      id: "docs",
      label: "Documentos",
      icon: Folder,
      children: [
        { id: "readme", label: "README.md", icon: FileText },
        { id: "license", label: "LICENSE",  icon: FileText },
      ],
    },
  ]}
  onSelect={(node) => console.log(node.id)}
/>
```

#### `ChatWindow`

```tsx
<ChatWindow
  conversations={conversas}
  onSend={(msg) => enviar(msg)}
  currentUserId="user-1"
/>
```

---

## Dark Mode

Tema dark/light baseado em classe (`class="dark"` no `<html>`), sem flash no reload: o tema é aplicado via `<script>` inline no `<head>` antes de qualquer renderização React.

```tsx
import { useTheme } from "@/components/ThemeContext";

const { theme, toggle } = useTheme();
```

---

## Controle de Acesso

Todos os componentes aceitam a prop `componentId` que é emitida como `data-component-id` no DOM, permitindo integração com qualquer sistema de controle de acesso baseado em atributos (ABAC).

```tsx
<Button componentId="btn-excluir-pedido">Excluir</Button>
// → <button data-component-id="btn-excluir-pedido">Excluir</button>
```

Consulte [docs/ACCESS_CONTROL.md](docs/ACCESS_CONTROL.md) para detalhes sobre a implementação.

---

<p align="center">
  Feito por <strong>Cristiano Lopes</strong> · construído com Next.js, Tailwind CSS e lucide-react
</p>
