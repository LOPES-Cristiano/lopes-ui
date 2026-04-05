# Arquitetura do Shell

## Visão geral

O Lopes UI usa um sistema de **Shell** — um conjunto de providers e convenções que coordenam o `Header`, a `Sidebar` e o conteúdo da página em um layout coeso, sem acoplamento direto entre os componentes.

```
app/layout.tsx
└── ShellProvider
    ├── ThemeProvider
    ├── Header          ← lê ShellContext para adaptar layout
    ├── Sidebar         ← registra-se no ShellContext ao montar
    └── {children}      ← conteúdo da página
```

---

## ShellContext

**Arquivo:** `components/ShellContext.tsx`

O `ShellProvider` é o único estado global de layout. Ele expõe:

| Campo | Tipo | Descrição |
|---|---|---|
| `sidebarCollapsed` | `boolean` | Sidebar recolhida ou não |
| `toggleSidebar` | `() => void` | Alterna collapsed; persiste em cookie + localStorage |
| `mobileSidebarOpen` | `boolean` | Gaveta móvel aberta |
| `setMobileSidebarOpen` | `(v: boolean) => void` | Controla a gaveta |
| `hasSidebar` | `boolean` | Hint SSR: há sidebar nesta rota |
| `sidebarMounted` | `boolean` | Sidebar efetivamente montada no DOM |
| `_registerSidebar` | `() => () => void` | Chamado internamente pelo `<Sidebar>` |

### Persistência do estado collapsed

`toggleSidebar` salva o estado em dois lugares simultaneamente:

- **Cookie `shell_sidebar_collapsed`** — lido pelo servidor em `app/layout.tsx` via `cookies()` para SSR sem flash.
- **`localStorage`** — fallback rápido para leitura no cliente.

```tsx
// app/layout.tsx (exemplo)
import { cookies } from "next/headers";
import { ShellProvider } from "@/components/ShellContext";

export default async function RootLayout({ children }) {
  const jar = await cookies();
  const collapsed = jar.get("shell_sidebar_collapsed")?.value === "true";

  return (
    <html>
      <body>
        <ShellProvider defaultCollapsed={collapsed} defaultHasSidebar>
          {children}
        </ShellProvider>
      </body>
    </html>
  );
}
```

### Registro dinâmico da Sidebar

Quando um `<Sidebar>` monta, ele chama `_registerSidebar()` que incrementa um contador interno. Quando desmonta, o retorno (cleanup) decrementa. O `hasSidebar` é derivado desse contador com um debounce de 300 ms — isso evita flashes de layout durante navegações client-side rápidas onde a sidebar antiga desmonta antes da nova montar.

---

## Header

**Arquivo:** `components/Header.tsx`

O `Header` tem dois modos de layout, selecionados automaticamente com base em `ShellContext`:

### Modo fused (com Sidebar)

Ativado quando `hasSidebar === true`. O Header ocupa toda a largura sem reservar espaço para a sidebar — a sidebar flutua ao lado como um elemento independente.

```
┌─────────────────────────────────────────────┐
│ Header (full-width)                         │
│  [nav]                    [search][extra][↔]│
└─────────────────────────────────────────────┘
┌─────────┬───────────────────────────────────┐
│ Sidebar │        Conteúdo da página         │
└─────────┴───────────────────────────────────┘
```

No mobile (< md), apenas brand + hambúrguer aparecem no header — toda a navegação fica na sidebar/gaveta.

### Modo standalone (sem Sidebar)

Ativado quando `hasSidebar === false`. Layout tradicional de header com brand à esquerda e ações à direita. O nav desktop fica visível, e há um hambúrguer local no mobile.

### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `brand` | `ReactNode` | — | Logo/nome (visível no mobile e no modo standalone) |
| `nav` | `NavItem[]` | — | Itens de navegação do header |
| `search` | `ReactNode` | — | Ex.: `<SearchInput />` ou `<CommandMenu />` |
| `extra` | `ReactNode` | — | Ações extras (notificações, etc.) |
| `profile` | `ReactNode` | — | Menu de perfil |
| `navDropdown` | `boolean` | `false` | Nav compacta colapsada em dropdown |
| `sticky` | `boolean` | `true` | `position: sticky; top: 0` |
| `componentId` | `string` | — | Para controle de acesso |

---

## Sidebar

**Arquivo:** `components/Sidebar.tsx`

Componente de navegação lateral totalmente autônomo. Ao montar, registra-se no `ShellContext` e usa `useLayoutEffect` para sincronizar o estado collapsed. Veja a [documentação detalhada](./sidebar.md).

---

## Fluxo de layout de uma página típica

```
app/
├── layout.tsx            ← ShellProvider + ThemeProvider + SiteHeader + AppSidebar
├── page.tsx              ← Landing page
└── showcase/
    ├── actions/page.tsx
    ├── animation/page.tsx
    ├── communication/page.tsx
    ├── data/page.tsx
    ├── display/page.tsx
    ├── forms/page.tsx
    └── navigation/page.tsx
```

```tsx
// app/layout.tsx
import { ShellProvider } from "@/components/ShellContext";
import { ThemeProvider } from "@/components/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import SiteHeader from "@/components/SiteHeader";

export default async function RootLayout({ children }) {
  const jar = await cookies();
  const collapsed = jar.get("shell_sidebar_collapsed")?.value === "true";

  return (
    <html>
      <body>
        <ThemeProvider>
          <ShellProvider defaultCollapsed={collapsed} defaultHasSidebar>
            <SiteHeader />
            <div className="flex flex-1">
              <AppSidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </ShellProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

O `SiteHeader` e o `AppSidebar` são as implementações concretas do `Header` e `Sidebar` usadas no projeto. Ambas leem o `ShellContext` para adaptar o layout.

O `Header` lê `hasSidebar` do `ShellContext`. Enquanto o `<Sidebar>` ainda não montou (SSR ou rota sem sidebar), `defaultHasSidebar` sinaliza ao Header para já reservar o layout correto — evitando o Cumulative Layout Shift (CLS).

### `AppSidebar`

**Arquivo:** `components/AppSidebar.tsx`

Instância de `<Sidebar>` pré-configurada com todos os grupos de navegação do projeto. Cada grupo de itens corresponde a uma página de showcase em `app/showcase/{categoria}/page.tsx`. Os `href` usam o padrão `/showcase/{categoria}#{ancora}`.
