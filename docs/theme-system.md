# Sistema de Tema (Dark Mode)

## Visão geral

O tema é gerenciado por um store externo simples (sem Redux/Zustand), integrado ao React via `useSyncExternalStore`. O resultado é zero re-renderizações desnecessárias e transição **instantânea** entre temas — sem animação de stagger entre componentes.

**Arquivo principal:** `components/ThemeContext.tsx`  
**CSS global:** `app/globals.css`

---

## Como o dark mode funciona no Tailwind v4

Este projeto usa Tailwind CSS v4 com uma variante personalizada:

```css
/* app/globals.css */
@custom-variant dark (&:where(.dark, .dark *));
```

Isso significa que `dark:` classes são ativadas quando qualquer ancestral tem a classe `.dark` — e não via `prefers-color-scheme` de mídia. A classe `.dark` é aplicada no `<html>` pelo `ThemeProvider`.

---

## API

### `ThemeProvider`

Envolva o app no provider (idealmente em `app/layout.tsx`):

```tsx
import { ThemeProvider } from "@/components/ThemeContext";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

> **`suppressHydrationWarning`** é necessário porque o `ThemeProvider` adiciona `.dark` ao `<html>` no lado do cliente antes do primeiro paint — o atributo pode diferir do HTML gerado pelo servidor.

### `useTheme`

```tsx
import { useTheme } from "@/components/ThemeContext";

function MyComponent() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle}>
      Tema atual: {theme}
    </button>
  );
}
```

| Retorno | Tipo | Descrição |
|---|---|---|
| `theme` | `"light" \| "dark"` | Tema atual |
| `toggle` | `() => void` | Alterna entre light e dark |

### `ThemeToggle`

Componente pronto com ícone Sun/Moon:

```tsx
import ThemeToggle from "@/components/ThemeToggle";
<ThemeToggle />
```

---

## Persistência

A preferência é salva em `localStorage` com a chave `"theme"`. Se não houver preferência salva, o tema do sistema (`prefers-color-scheme`) é usado como padrão.

---

## O problema do stagger e a solução

### O problema

Durante a troca de tema, dois sistemas precisam sincronizar:

1. **CSS (Tailwind `dark:`)** — reage imediatamente quando `.dark` é adicionado/removido do `<html>`.
2. **React (`useSyncExternalStore`)** — agenda um re-render, que só acontece no próximo ciclo de microtasks.

Isso cria uma janela de ~1 frame onde o CSS já mudou mas o React ainda não commitou — gerando um "stagger" visível onde alguns elementos mudam de cor antes dos outros.

### A solução: `flushSync` + `.no-transition`

```tsx
// components/ThemeContext.tsx
import { flushSync } from "react-dom";

function applyTheme(next: Theme): void {
  const el = document.documentElement;

  // 1. Suspende todas as transições CSS
  el.classList.add("no-transition");

  // 2. Aplica a classe .dark (Tailwind reage imediatamente)
  el.classList.toggle("dark", next === "dark");

  // 3. Força reflow — garante que o browser processa o no-transition
  //    antes de qualquer paint
  void el.offsetHeight;

  // 4. Persiste
  try { localStorage.setItem("theme", next); } catch {}

  // 5. flushSync: força o React a commitar TODOS os re-renders
  //    de forma síncrona, dentro desta chamada de função.
  //    Isso garante que a mudança JS acontece no mesmo frame
  //    que a mudança CSS — sem stagger.
  flushSync(() => {
    listeners.forEach((fn) => fn());
  });

  // 6. Remove a suspensão de transições — agora tudo já commitou
  el.classList.remove("no-transition");
}
```

```css
/* app/globals.css */
.no-transition * {
  transition-duration: 0ms !important;
  animation-duration: 0ms !important;
}
```

### Por que `void el.offsetHeight`?

Forçar a leitura de uma propriedade de layout (`offsetHeight`) obriga o browser a fazer um **reflow síncrono** — isso garante que o browser processa o `.no-transition` antes de qualquer pintura, impedindo que transições já em andamento escapem da supressão.

### Por que não `setTimeout(remove, 0)`?

Um `setTimeout` de 0 ms ou mesmo `requestAnimationFrame` não garantem que o React já commitou quando a função executa. O `flushSync` é a única primitiva que oferece essa garantia.

### Consequências do `flushSync`

- **Positivo:** zero stagger entre CSS e React no switch de tema.
- **Atenção:** `flushSync` deve ser chamado fora de renders React e de outras chamadas `flushSync` — o contexto atual (event handler disparado pelo usuário via `toggle`) é seguro.

---

## Diagrama de sequência

```
usuário clica ThemeToggle
        │
        ▼
   toggle() → applyTheme("dark")
        │
        ├─ classList.add("no-transition")   ← para todas as transições
        ├─ classList.toggle("dark", true)   ← Tailwind dark: ativa
        ├─ void el.offsetHeight             ← reflow síncrono
        ├─ localStorage.setItem(...)
        │
        └─ flushSync(() => notifyListeners())
               │
               ▼
           React commita re-renders de todos os consumidores
           de useSyncExternalStore (ThemeContext)
               │
               ▼
        classList.remove("no-transition")   ← libera transições
               │
               ▼
           browser pinta um único frame com tudo atualizado
```
