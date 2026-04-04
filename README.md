# Lopes UI Playground

> Biblioteca de componentes React construída com **Next.js 16**, **Tailwind CSS v4** e **TypeScript** — sem dependências de UI externas.

---

## Stack

| Tecnologia | Versão |
|---|---|
| Next.js | 16.2 |
| React | 19 |
| Tailwind CSS | 4.2 |
| TypeScript | 5 |
| lucide-react | 1.7 |
| tailwind-merge | 3.5 |
| react-hot-toast | 2.6 |

---

## Estrutura

```
playground/
├── app/
│   ├── page.tsx              # Playground interativo com todos os demos
│   ├── layout.tsx            # Shell com Sidebar + SiteHeader
│   ├── access-denied/        # Página de acesso negado
│   └── cause-error/          # Página de erro de teste
│
├── components/
│   ├── form/                 # Componentes de formulário
│   │   ├── FieldWrapper      # Wrapper base: label, erro, tooltip, helpText
│   │   ├── TextField         # Input texto / email / url / password / search
│   │   ├── NumberField       # Input numérico com spin buttons
│   │   ├── DateField         # Input data e datetime com calendário
│   │   ├── TimeField         # Input de horário
│   │   ├── CheckboxGroup     # Grupo de checkboxes com layout grid
│   │   ├── Switch            # Toggle on/off
│   │   ├── AutocompleteField # Dropdown pesquisável (combobox)
│   │   ├── MultiSelectField  # Seleção múltipla com chips
│   │   └── FileField         # Upload de arquivos com drag-and-drop
│   │
│   ├── Accordion.tsx         # Painéis colapsáveis com animação
│   ├── ActionButton.tsx      # Botão de ação com ícone e tooltip
│   ├── ActionDialog.tsx      # Dialog de confirmação de ações
│   ├── Alert.tsx             # Alertas inline e modais
│   ├── Avatar.tsx            # Avatar com imagem, iniciais e status
│   ├── Badge.tsx             # Badges com variantes e cores
│   ├── Button.tsx            # Botão base com variantes e loading
│   ├── Card.tsx              # Cards com header/body/footer compostos
│   ├── CodeBlock.tsx         # Bloco de código com syntax highlight
│   ├── CommandMenu.tsx       # Paleta de comandos (⌘K / Ctrl+K)
│   ├── ContextMenu.tsx       # Menu de contexto com sub-menus
│   ├── DataTable.tsx         # Tabela avançada com todas as features
│   ├── Sidebar.tsx           # Sidebar colapsável com navegação aninhada
│   ├── SiteHeader.tsx        # Header do site com CommandMenu
│   ├── StatusPage.tsx        # Páginas de status (404, 403, 500…)
│   └── Table.tsx             # Tabela simples e configurável
│
└── hooks/
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
    { id: "1", title: "O que é Lopes UI?", content: <p>...</p> },
    { id: "2", title: "Como instalar?",          content: <p>...</p> },
  ]}
  multiple
  defaultOpen={["1"]}
/>
```

#### `StatusPage`
```tsx
<StatusPage variant="404" />  // 404 | 403 | 500 | maintenance | empty | success
```

---

## Controle de Acesso

Todos os componentes aceitam a prop `componentId` que é emitida como `data-component-id` no DOM, permitindo integração com qualquer sistema de controle de acesso baseado em atributos.

```tsx
<Button componentId="btn-excluir-pedido">Excluir</Button>
// → <button data-component-id="btn-excluir-pedido">Excluir</button>
```

---

## Rodando o projeto

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o playground interativo com todos os componentes e suas variantes documentadas.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |

---

<p align="center">
  Feito por <strong>Cristiano Lopes</strong> · construído com Next.js, Tailwind CSS e lucide-react
</p>
