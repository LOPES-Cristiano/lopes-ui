# Sidebar

**Arquivo:** `components/Sidebar.tsx`

Sidebar de navegação colapsável com suporte a items aninhados, pins, badges, anúncios, perfil de usuário e modo mobile.

---

## Props

### Layout e identidade

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | — | Nome da aplicação (exibido no header da sidebar) |
| `subtitle` | `string` | — | Subtítulo / slogan (visível apenas quando expandida) |
| `logo` | `ReactNode` | — | Ícone/logo exibido no header |
| `headerExtra` | `ReactNode` | — | Conteúdo extra no header da sidebar |
| `className` | `string` | — | Classes adicionais no `<aside>` |
| `isolated` | `boolean` | `false` | Não registra no `ShellContext` — use para instâncias de demo/preview |

### Collapse

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `collapsible` | `boolean` | `false` | Mostra o botão de colapso |
| `defaultCollapsed` | `boolean` | `false` | Estado inicial (não controlado) |
| `collapsed` | `boolean` | — | Controla externamente (controlado) |
| `onCollapsedChange` | `(v: boolean) => void` | — | Callback de mudança |

Quando `isolated` é falso (padrão), o estado collapsed é sincronizado com o `ShellContext`.

### Mobile

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `mobileOpen` | `boolean` | — | Controla a gaveta mobile externamente |
| `onMobileOpenChange` | `(v: boolean) => void` | — | Callback de mudança da gaveta |

Normalmente não é necessário controlar isso diretamente — o `ShellContext` e o `Header` gerenciam a sincronização automaticamente.

### Navegação

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `groups` | `SidebarNavGroup[]` | `[]` | Grupos de itens de navegação |
| `onNavigate` | `(href: string) => void` | — | Callback ao navegar (complementar ao `href`) |

### Pins

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pinnable` | `boolean` | `false` | Permite fixar itens em uma seção "Fixados" no topo |
| `pinsStorageKey` | `string` | `"sidebar-pins"` | Chave do `localStorage` para persistir os pins |

### Perfil / Footer

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `user` | `SidebarUser` | — | Dados do usuário logado |
| `footerItems` | `SidebarFooterItem[]` | — | Ações do footer (ficam dentro do popover do usuário se `user` estiver definido) |
| `footerExtra` | `ReactNode` | — | Conteúdo extra abaixo do footer |

### Anúncios

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `announcements` | `SidebarAnnouncement[]` | — | Avisos/banners exibidos acima da navegação |

---

## Tipos

### `SidebarNavItem`

```ts
type SidebarNavItem = {
  id?: string;
  componentId?: string;       // Para controle de acesso (ACCESS_CONTROL.md)
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeVariant?: "default" | "success" | "warning" | "danger" | "info";
  description?: string;
  disabled?: boolean;
  active?: boolean;
  divider?: boolean;          // Linha separadora (não renderiza texto/ícone)
  children?: SidebarNavItem[];
  onClick?: () => void;
};
```

### `SidebarNavGroup`

```ts
type SidebarNavGroup = {
  id?: string;
  label?: string;             // Título do grupo (oculto quando collapsed)
  collapsible?: boolean;      // Permite recolher o grupo
  defaultCollapsed?: boolean;
  items: SidebarNavItem[];
};
```

### `SidebarUser`

```ts
type SidebarUser = {
  name: string;
  email?: string;
  avatar?: string;
  initials?: string;          // Exibido quando não há avatar (ex: "CL")
  status?: "online" | "away" | "busy" | "offline";
  role?: string;
};
```

### `SidebarFooterItem`

```ts
type SidebarFooterItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  componentId?: string;
};
```

### `SidebarAnnouncement`

```ts
type SidebarAnnouncement = {
  id: string;
  title?: string;
  body: string;
  variant?: "info" | "warning" | "success" | "danger" | "neutral";
  icon?: LucideIcon;
  timestamp?: string;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
};
```

---

## Comportamento collapsed

Quando `collapsed`:

1. **Header:** o botão de toggle fica acima e o logo abaixo (layout `flex-col`).
2. **Labels e grupo títulos:** ocultos.
3. **Itens de navegação:** mostram apenas o ícone.
4. **Tooltips:** exibidos via portal ao lado do item para manter acessibilidade.
5. **UserPopover:** mostra apenas o avatar; tooltip com o nome aparece ao passar o mouse.

---

## Sistema de Pins

Com `pinnable={true}`, itens de navegação exibem um ícone de pin ao passar o mouse. Pins são persistidos no `localStorage` com a chave definida por `pinsStorageKey`.

Os itens fixados aparecem em uma seção "Fixados" no topo da sidebar, antes dos grupos regulares. O pin usa como identificador (nessa ordem de prioridade): `item.id` → `item.href` → `item.label`.

---

## UserPopover

Quando `user` é fornecido, o footer exibe um botão com o avatar do usuário. Clicar abre um popover **para cima** com:

- Nome, e-mail, cargo e status do usuário
- Todos os `footerItems` como ações

Quando a sidebar está recolhida, o botão mostra apenas o avatar e um tooltip com o nome.

Se `user` não for fornecido, os `footerItems` são exibidos diretamente no footer como botões individuais.

---

## Tooltips por portal

Quando a sidebar está recolhida, tooltips precisam aparecer **fora** do `<aside>` para não serem cortados pelo `overflow-x-hidden`. A implementação usa `createPortal` do React para renderizar o tooltip diretamente no `document.body`, com posição calculada via `getBoundingClientRect()`:

```tsx
// Internamente no Sidebar.tsx
function Tooltip({ label, badge, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    const r = ref.current!.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 12 });
    setShow(true);
  };

  return (
    <div ref={ref} className="w-full" onMouseEnter={onEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && createPortal(
        <div
          className="pointer-events-none fixed z-[9999] ..."
          style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
        >
          {label}
          {badge && <span>{badge}</span>}
        </div>,
        document.body
      )}
    </div>
  );
}
```

Tooltips são exibidos automaticamente quando a sidebar está recolhida e o componente recebe um `label` e um ícone.

---

## Exemplo completo

```tsx
<Sidebar
  title="Minha App"
  subtitle="v2.0"
  logo={<AppIcon />}
  collapsible
  pinnable
  groups={[
    {
      id: "main",
      label: "Principal",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        {
          label: "Relatórios",
          icon: BarChart2,
          children: [
            { label: "Mensal",  href: "/reports/monthly" },
            { label: "Anual",   href: "/reports/yearly"  },
          ],
        },
        { divider: true },
        { label: "Configurações", href: "/settings", icon: Settings },
      ],
    },
  ]}
  announcements={[
    {
      id: "manut",
      title: "Manutenção",
      body: "Sistema offline domingo às 2h.",
      variant: "warning",
      dismissible: true,
    },
  ]}
  user={{ name: "Cristiano Lopes", email: "cl@empresa.com", initials: "CL", role: "Admin", status: "online" }}
  footerItems={[
    { icon: Settings, label: "Configurações", href: "/settings" },
    { icon: LogOut,   label: "Sair",          onClick: logout, danger: true },
  ]}
/>
```

---

## Modo isolado

Use `isolated={true}` para instâncias de preview/demo que não devem influenciar o layout da aplicação. A sidebar isolada não registra no `ShellContext` e não responde ao estado global de collapse.

```tsx
// Em páginas de documentação/preview
<Sidebar isolated title="Preview" groups={previewGroups} />
```
