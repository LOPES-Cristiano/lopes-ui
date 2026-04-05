"use client";

import React from "react";
import Link from "next/link";
import { FormInput, Layers, Zap, BarChart2, MessageCircle, Navigation, Play, Code } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";

const INSTALL_CODE = `npm install github:LOPES-Cristiano/lopes-ui`;
const INIT_CODE = `npx lopes-ui init

# Para usar o RichTextEditor (Tiptap):
npx lopes-ui init --tiptap`;
const USAGE_CODE = `import { Button, DataTable, toast, Toaster } from "lopes-ui";
import { useAsyncButton } from "lopes-ui/hooks";

export default function MyPage() {
  return (
    <>
      <Toaster position="top-right" />
      <Button variant="primary" onClick={() => toast.success("Salvo!")}>
        Salvar
      </Button>
    </>
  );
}`;

const CATEGORIES = [
  {
    href: "/showcase/forms",
    icon: FormInput,
    title: "Formulários",
    description: "TextField, DateField, OTPInput, RichTextEditor, LoginForm e mais.",
    count: 6,
  },
  {
    href: "/showcase/display",
    icon: Layers,
    title: "Display",
    description: "Avatar, Badge, Card, Carousel, StatCard, ServiceStatus e mais.",
    count: 7,
  },
  {
    href: "/showcase/actions",
    icon: Zap,
    title: "Ações & Feedback",
    description: "Button, Alert, Toast, ConfirmDialog, Drawer, EmptyState e mais.",
    count: 8,
  },
  {
    href: "/showcase/data",
    icon: BarChart2,
    title: "Dados & Tabelas",
    description: "DataTable, KanbanBoard, InboxList, ActivityFeed, TreeView e mais.",
    count: 7,
  },
  {
    href: "/showcase/communication",
    icon: MessageCircle,
    title: "Comunicação",
    description: "Chat, EmailComposer, NotificationBell, SmartObject e mais.",
    count: 4,
  },
  {
    href: "/showcase/navigation",
    icon: Navigation,
    title: "Navegação & Layout",
    description: "Accordion, Breadcrumb, CommandMenu, Sidebar, SplitPane e mais.",
    count: 10,
  },
  {
    href: "/showcase/animation",
    icon: Play,
    title: "Animação & Conteúdo",
    description: "TextRotate, CodeBlock, Stepper, Timeline.",
    count: 4,
  },
  {
    href: "/ui-builder",
    icon: Code,
    title: "UI Builder",
    description: "Editor visual drag-and-drop para compor layouts com os componentes.",
    count: null,
  },
] as const;

export default function Home() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">

      {/* Hero */}
      <section id="overview" className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-10 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-4">
            Lopes UI
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight mb-4">
            Componentes prontos para produção
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-lg">
            Biblioteca React + Next.js com Tailwind CSS. Acessível, tipada e customizável. Mais de 50 componentes em 7 categorias.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#install"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
            >
              Começar agora
            </a>
            <Link
              href="/showcase/display"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Ver componentes
            </Link>
            <a
              href="https://github.com/LOPES-Cristiano/lopes-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">

        {/* Install */}
        <section id="install">
          <div className="mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">Instalação</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-3">Comece em 3 passos</h2>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Instale direto do GitHub, rode o <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">init</code> para configurar dependências e o Tailwind automaticamente, e comece a importar.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-none w-7 h-7 mt-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">1</div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Instale a biblioteca</p>
                <CodeBlock filename="terminal" language="bash" code={INSTALL_CODE} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-none w-7 h-7 mt-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">2</div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Configure o projeto com a CLI
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Instala as dependências peer que estiverem faltando e adiciona o <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">@source</code> no seu <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">globals.css</code> automaticamente.
                </p>
                <CodeBlock filename="terminal" language="bash" code={INIT_CODE} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-none w-7 h-7 mt-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">3</div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Importe e use</p>
                <CodeBlock filename="MyPage.tsx" language="tsx" code={USAGE_CODE} />
              </div>
            </div>
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* Category grid */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Categorias</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Navegue pelos componentes por categoria.</p>

          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                      <Icon size={18} />
                    </div>
                    {cat.count !== null && (
                      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{cat.count} componentes</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
