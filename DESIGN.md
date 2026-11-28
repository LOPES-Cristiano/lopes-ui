# DESIGN.md — Lopes UI Design System

> **Biblioteca:** `lopes-ui` (v1.3.0)  
> **Stack:** React 19 · Next.js 16 · Tailwind CSS v4 (`@theme inline`) · Radix UI · CVA · `motion/react`  
> **Fonte da Verdade de Tokens:** [styles/lopes-ui.css](styles/lopes-ui.css)

---

## 1. Identidade e Princípios de Design

O **Lopes UI** é um Design System corporativo de alta densidade projetado para ERPs, portais internos, vitrines comerciais e ferramentas administrativas do ecossistema Lopes.

1. **Neutro Corporativo + Destaque Controlado:** A interface baseia-se em superfícies neutras de alto contraste (`#ffffff` / `#09090b` no light mode; `#09090b` / `#fafafa` no dark mode) com `--primary` em preto/zinc corporativo e `--brand` em índigo (`#4f46e5` / `#6366f1`) reservado para destaques de marca, abas ativas e CTAs estratégicos.
2. **Densidade sem Poluição:** Espaçamento compacto e previsível, bordas sutis (`--border`), elevação realista em camadas (`--shadow-*`) e alinhamento óptico de texto com ícones (`.lopes-trim-cap`).
3. **Zero Stagger na Troca de Tema:** O `ThemeProvider` usa `useSyncExternalStore` + `flushSync` + `.no-transition` para alternar entre Light e Dark em um único paint frame.
4. **Acessibilidade por Padrão:** Contraste WCAG AA, anel de foco visível (`focus-visible:ring-2`), suporte global a `prefers-reduced-motion` e `forced-colors: active`.
5. **Performance em Fluxos de Alta Frequência:** Nunca usar `transition-all`. Animar apenas propriedades específicas (`colors`, `opacity`, `transform`, `box-shadow`), e respeitar `useReducedMotion()` em todos os componentes com `motion/react`.

---

## 2. Hierarquia de Tokens (Tailwind CSS v4)

Os tokens são declarados em `:root` (light), sobrescritos em `.dark` e expostos ao Tailwind v4 via `@theme inline` em [styles/lopes-ui.css](styles/lopes-ui.css).

### 2.1 Superfícies & Ações

| Token CSS | Utilitário Tailwind | Light (`:root`) | Dark (`.dark`) | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `--background` | `bg-background` | `#ffffff` | `#09090b` | Canvas principal da aplicação |
| `--foreground` | `text-foreground` | `#09090b` | `#fafafa` | Texto principal |
| `--surface` | `bg-surface` / `bg-card` | `#ffffff` | `#09090b` | Cards, modais, popovers, painéis |
| `--surface-muted` | `bg-surface-muted` / `bg-muted` | `#f4f4f5` | `#18181b` | Fundos sutis, cabeçalhos de tabela, campos `filled` |
| `--surface-muted-foreground` | `text-muted-foreground` | `#71717a` | `#a1a1aa` | Textos secundários, labels auxiliares |
| `--primary` | `bg-primary` | `#18181b` | `#fafafa` | Ação primária corporativa |
| `--brand` | `bg-brand` | `#4f46e5` | `#6366f1` | Destaque de marca, abas ativas, links, `accent-color` |
| `--border` / `--border-strong` | `border-border` / `border-border-strong` | `#e4e4e7` / `#d4d4d8` | `#27272a` / `#3f3f46` | Divisores, contornos de cards e inputs |
| `--ring` | `ring-ring` | `#18181b` | `#fafafa` | Anel de foco acessível (`focus-visible`) |

### 2.2 Status Semânticos

Cada família expõe 6 níveis: base, `-foreground`, `-hover`, `-soft`, `-soft-foreground` e `-border`:

| Família | Light | Dark | Uso |
| :--- | :--- | :--- | :--- |
| **`danger`** | `#dc2626` | `#f87171` | Erros de validação, alertas críticos, badges de falha |
| **`destructive`** | `var(--danger)` | `#dc2626` (texto `#ffffff`) | Botões destrutivos com alto contraste no dark mode |
| **`success`** | `#047857` | `#10b981` | Confirmações, status concluído/ativo |
| **`warning`** | `#b45309` | `#f59e0b` | Avisos, pendências, atenção operacional |
| **`info`** | `#0369a1` | `#38bdf8` | Informações neutras, dicas contextuais |

### 2.3 Geometria, Elevação e Tipografia

* **Raios semânticos:**
  * `--radius-control: 0.5rem` (botões, inputs, selects, chips)
  * `--radius-card: 0.875rem` (cards, painéis, containers)
  * `--radius-overlay: 1rem` (modais, drawers, popovers)
* **Elevação em camadas:** `--shadow-control` → `--shadow-card` → `--shadow-floating` → `--shadow-overlay` (calibradas separadamente para light e dark).
* **Tipografia:**
  * Sans: `var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif`
  * Mono: `var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace`
  * Chrome estrutural (Header/Sidebar): `--app-chrome-font-size: 0.875rem` (`450`), `--app-chrome-muted-font-size: 0.75rem` (`400`).
* **Layout do Shell:** `--header-height: 4rem`, `--sidebar-width: 16rem`, `--sidebar-collapsed-width: 4rem`.

---

## 3. Arquitetura de Exports & Fronteira `lopes-ui` vs `lopes-ui/primitives`

| Subpath Export | Conteúdo | Quando usar |
| :--- | :--- | :--- |
| **`lopes-ui`** | Componentes ricos de produto (`Button`, `Modal`, `Drawer`, `DataTable`, `Sidebar`, `Header`, `form/*`) | Padrão nas telas de produto: já incluem `AccessControl` (`componentId`), `tooltip`, `confirm`, `loading`, `FieldWrapper` e integrações corporativas |
| **`lopes-ui/primitives`** | 20 primitives leves baseados em Radix UI + CVA (`button`, `badge`, `dialog`, `alert-dialog`, `sheet`, `table`, `tabs`, `popover`, `tooltip`, `select`, etc.) | Composição customizada ou componentes compostos internos onde você precisa de controle fino do DOM sem overhead de wrappers |
| **`lopes-ui/rich-text`** | `RichTextEditor`, `RichTextField`, `EmailComposer` (peer opcional: Tiptap) | Edição de texto rico e composição de e-mail |
| **`lopes-ui/spreadsheet`** | `Spreadsheet` (peer opcional: TanStack Table/Virtual) | Planilhas editáveis de alta densidade |
| **`lopes-ui/code-block`** | `CodeBlock` (peer opcional: Shiki) | Blocos de código com syntax highlight |
| **`lopes-ui/hooks`** | Hooks utilitários (`useModal`, `useToast`, `useGlobalKeyShortcuts`, `useUnsavedChangesGuard`, etc.) | Lógica reutilizável de UI |
| **`lopes-ui/utils`** | `cn`, `currency`, `date`, `document`, `sanitize`, `exporters`, etc. | Formatação, sanitização e utilitários puros |
| **`lopes-ui/styles.css`** | Tokens, `@theme inline` e estilos de componentes | Importar em `globals.css` logo após `@import "tailwindcss";` |

> **Regra para os 8 pares sobrepostos** (`Button`, `Badge`, `HoverCard`, `ScrollArea`, `Separator`, `Skeleton`, `Table`, `Tabs`): em telas de aplicação, prefira os exports de `lopes-ui`. Use `lopes-ui/primitives` apenas quando estiver construindo novos componentes compostos ou precisar de API puramente Radix/CVA.

---

## 4. Regras de Acessibilidade e Movimento (Obrigatórias)

1. **Foco Visível:** Nunca remover `outline` (`outline-none`) sem fornecer `focus-visible:ring-2 focus-visible:ring-ring/40` (ou `focus-within:ring-2` no container de formulário).
2. **Nomes Acessíveis:** Todo botão só com ícone deve ter `aria-label`. Ícones decorativos dentro de botões, inputs ou labels devem receber `aria-hidden="true"`.
3. **Estados de Formulário:** Inputs inválidos devem receber `aria-invalid={Boolean(error) || undefined}` e `aria-describedby` apontando para o erro/ajuda.
4. **Estados de Carregamento:** Botões em loading devem expor `aria-busy={loading || undefined}` e spinner com `aria-hidden="true"`.
5. **Transições Explícitas:** Proibido usar `transition-all`. Prefira `transition-colors`, `transition-opacity`, `transition-transform` ou `transition-[color,background-color,border-color,box-shadow]`.
6. **Movimento Reduzido:** Todo componente que usa `motion/react` deve consultar `useReducedMotion()` e desabilitar deslocamentos espaciais quando o usuário preferir movimento reduzido.
