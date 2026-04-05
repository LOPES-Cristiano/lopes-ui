# Contribuindo com novos componentes

Guia para adicionar componentes ao Lopes UI mantendo conformidade com as convenções do projeto.

---

## Stack e restrições

- **React 19 + Next.js App Router** — use `"use client"` apenas quando necessário (interatividade, hooks de estado/efeito). Componentes puramente de apresentação podem ser server components.
- **Tailwind CSS v4** — sem CSS modules ou styled-components. Use `clsx` / `tailwind-merge` para conditionals.
- **TypeScript estrito** — sem `any` implícito. Exporte os tipos das props.
- **lucide-react** — biblioteca de ícones padrão. Não adicione outras bibliotecas de ícones.
- **motion** (Framer Motion v12) — para animações quando necessário.

---

## Checklist de um novo componente

```
[ ] Arquivo em components/<NomeDoComponente>.tsx
[ ] Props tipadas e exportadas
[ ] "use client" apenas se necessário
[ ] Suporte a dark mode (dark: classes do Tailwind)
[ ] Suporte a componentId para controle de acesso (se for elemento interativo)
[ ] className prop para extensibilidade
[ ] Sem dependências externas não aprovadas
```

---

## Estrutura de arquivo

```tsx
"use client"; // apenas se necessário

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// Importe lucide-react icons conforme necessário

// ── Tipos ────────────────────────────────────────────────────────────────────

export type MeuComponenteProps = {
  /** Prop principal */
  label: string;
  /** Variante visual */
  variant?: "default" | "primary" | "danger";
  /** Classes adicionais */
  className?: string;
  /** Identificador para controle de acesso */
  componentId?: string;
  children?: React.ReactNode;
};

// ── Helpers internos (se necessário) ────────────────────────────────────────

const variantClasses: Record<NonNullable<MeuComponenteProps["variant"]>, string> = {
  default: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
  primary: "bg-blue-600 text-white dark:bg-blue-500",
  danger:  "bg-red-600 text-white dark:bg-red-500",
};

// ── Componente ───────────────────────────────────────────────────────────────

export default function MeuComponente({
  label,
  variant = "default",
  className,
  componentId,
  children,
}: MeuComponenteProps) {
  return (
    <div
      className={twMerge(clsx("rounded-md px-3 py-2", variantClasses[variant], className))}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {label}
      {children}
    </div>
  );
}
```

---

## Convenções obrigatórias

### Dark mode

Todo componente deve funcionar em dark mode usando as classes `dark:` do Tailwind. O tema é aplicado via a classe `.dark` no `<html>` — veja [theme-system.md](./theme-system.md).

Use as seguintes paletas de cores como referência:

| Intenção | Light | Dark |
|---|---|---|
| Fundo padrão | `bg-white` / `bg-zinc-50` | `dark:bg-zinc-900` / `dark:bg-zinc-950` |
| Superfície elevada | `bg-zinc-100` | `dark:bg-zinc-800` |
| Borda | `border-zinc-200` | `dark:border-zinc-700` |
| Texto primário | `text-zinc-900` | `dark:text-zinc-100` |
| Texto secundário | `text-zinc-500` | `dark:text-zinc-400` |

### `className` extensível

Sempre aceite e aplique `className` via `twMerge` para permitir sobrescritas:

```tsx
className={twMerge("base-classes", className)}
```

### `componentId`

Se o componente for um elemento interativo visível ao usuário (botão, link, formulário, etc.), aceite `componentId?: string` e emita como `data-component-id`. Veja [ACCESS_CONTROL.md](./ACCESS_CONTROL.md).

### Transições

Use `duration-150` como duração padrão para manter coerência com o sistema de tema:

```tsx
"transition-colors duration-150"
```

Evite `duration-300` ou mais — causa stagger perceptível durante a troca de tema.

---

## Segurança contra hidratação

Quando um componente `"use client"` gera valores que dependem do momento de execução (`new Date()`, `Date.now()`, `Math.random()`), pode ocorrer **hidration mismatch** — o HTML gerado no servidor diverge do que o React produz no cliente.

### Regras obrigatórias

1. **Nunca use `Date.now()` ou `new Date()` no nível de módulo** (fora de funções) em arquivos `"use client"`.
2. **Nunca use `Date.now()` ou `new Date()` como valor inicial de `useState()`** — esse valor é calculado no servidor E no cliente em momentos diferentes.
3. Para dados de demo com datas relativas, use uma **âncora ISO fixa**:

```tsx
// ✅ correto — âncora estável
const REF = new Date("2026-04-05T14:00:00.000Z").getTime();
const INITIAL_ITEMS = [
  { id: 1, time: new Date(REF - 5 * 60_000) }, // 5 min atrás
];

// ❌ errado — diverge entre SSR e CSR
const INITIAL_ITEMS = [
  { id: 1, time: new Date(Date.now() - 5 * 60_000) },
];
```

4. Quando um `<span>` ou `<p>` exibe um timestamp formatado que pode divergir levemente entre SSR e CSR (ex.: `"há 5 min"`), adicione `suppressHydrationWarning` na tag:

```tsx
<span suppressHydrationWarning>{formatarTempo(item.time)}</span>
```

---

## Registrando na AppSidebar

Se o novo componente tiver uma seção na página de apresentação, adicione um item em `components/AppSidebar.tsx`.

As páginas de showcase ficam em `app/showcase/{categoria}/page.tsx`. As categorias existentes são:

| Categoria | Rota |
|---|---|
| Exibição | `/showcase/display` |
| Ações | `/showcase/actions` |
| Navegação | `/showcase/navigation` |
| Dados | `/showcase/data` |
| Formulários | `/showcase/forms` |
| Comunicação | `/showcase/communication` |
| Animação | `/showcase/animation` |

Use o padrão `"/showcase/{categoria}#{ancora}"` para o `href`:

```tsx
// Em components/AppSidebar.tsx, dentro do grupo correto
{
  label: "MeuComponente",
  href: "/showcase/display#meu-componente",
  icon: IconeEscolhido,
  children: [
    { label: "Padrão",    href: "/showcase/display#meu-componente-default" },
    { label: "Variantes", href: "/showcase/display#meu-componente-variants" },
    { label: "Props",     href: "/showcase/display#meu-componente-props" },
  ],
},
```

---

## Hooks utilitários disponíveis

| Hook | Arquivo | Uso |
|---|---|---|
| `useAsyncButton` | `hooks/useAsyncButton.ts` | Estado de loading para botões async |
| `useBodyScrollLock` | `hooks/useBodyScrollLock.ts` | Bloqueia scroll do body (para modais/drawers) |
| `useTheme` | `components/ThemeContext.tsx` | Tema atual e toggle |
| `useShell` | `components/ShellContext.tsx` | Estado da sidebar e layout do shell |

---

## Animações com Motion

Para animações, use a biblioteca `motion` (Framer Motion v12):

```tsx
import { motion, AnimatePresence } from "motion/react";

// Preferir variantes declarativas
const variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

<AnimatePresence>
  {open && (
    <motion.div
      key="content"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.15 }}
    >
      ...
    </motion.div>
  )}
</AnimatePresence>
```

---

## Syntax highlight

Para blocos de código, use o componente `CodeBlock` existente que utiliza **Shiki** para highlight server-side:

```tsx
import CodeBlock from "@/components/CodeBlock";

<CodeBlock lang="tsx" code={`const x = 1;`} />
```
