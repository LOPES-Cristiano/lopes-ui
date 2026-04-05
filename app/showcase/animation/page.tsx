"use client";

import React, { useRef } from "react";
import CodeBlock from "@/components/CodeBlock";
import TextRotate, { type TextRotateItem, type TextRotateHandle } from "@/components/TextRotate";
import Stepper from "@/components/Stepper";
import Timeline from "@/components/Timeline";
import { PropsTable } from "@/app/showcase/_shared";

export default function Page() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          <section id="codeblock" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">CodeBlock</h2>
              <p className="mt-1 text-zinc-500">Bloco de código com syntax highlighting (Shiki / Dracula), nome de arquivo, números de linha, recolher e abas.</p>
            </div>

            {/* Single file */}
            <div id="codeblock-basic" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Básico</h3>
              <CodeBlock
                filename="Button.tsx"
                language="tsx"
                code={`import Button from "@/components/Button";\n\nexport default function Demo() {\n  return (\n    <Button variant="primary" size="lg">\n      Salvar alterações\n    </Button>\n  );\n}`}
              />
            </div>

            {/* Terminal */}
            <div id="codeblock-terminal" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Terminal</h3>
              <CodeBlock
                filename="terminal"
                language="bash"
                code={`npm install shiki lucide-react tailwind-merge clsx`}
              />
            </div>

            {/* Line numbers */}
            <div id="codeblock-linenumbers" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Números de linha</h3>
              <CodeBlock
                filename="useAsyncButton.ts"
                language="ts"
                lineNumbers
                code={`import { useState, useCallback } from "react";\n\ntype AsyncButtonState = {\n  loading: boolean;\n  error: string | null;\n};\n\nexport function useAsyncButton(fn: () => Promise<void>) {\n  const [state, setState] = useState<AsyncButtonState>({\n    loading: false,\n    error: null,\n  });\n\n  const trigger = useCallback(async () => {\n    setState({ loading: true, error: null });\n    try {\n      await fn();\n    } catch (err) {\n      setState({ loading: false, error: String(err) });\n      return;\n    }\n    setState({ loading: false, error: null });\n  }, [fn]);\n\n  return { ...state, trigger };\n}`}
              />
            </div>

            {/* Show more */}
            <div id="codeblock-showmore" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Recolher (maxLines)</h3>
              <CodeBlock
                filename="globals.css"
                language="css"
                maxLines={6}
                code={`@import "tailwindcss";\n\n:root {\n  --background: #ffffff;\n  --foreground: #171717;\n}\n\n@theme inline {\n  --color-background: var(--background);\n  --color-foreground: var(--foreground);\n  --font-sans: var(--font-geist-sans);\n  --font-mono: var(--font-geist-mono);\n}\n\nbody {\n  background: var(--background);\n  color: var(--foreground);\n  overflow-x: hidden;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --background: #0a0a0a;\n    --foreground: #ededed;\n  }\n}`}
              />
            </div>

            {/* Tabs */}
            <div id="codeblock-tabs" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Abas (múltiplos arquivos)</h3>
              <CodeBlock
                tabs={[
                  {
                    label: "page.tsx",
                    language: "tsx",
                    code: `import CodeBlock from "@/components/CodeBlock";\n\nexport default function Page() {\n  return (\n    <CodeBlock\n      filename="example.ts"\n      language="ts"\n      lineNumbers\n      code={myCode}\n    />\n  );\n}`,
                  },
                  {
                    label: "terminal",
                    language: "bash",
                    code: `npm install shiki`,
                  },
                  {
                    label: "tsconfig.json",
                    language: "json",
                    code: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "lib": ["dom", "ES2022"],\n    "strict": true,\n    "moduleResolution": "bundler",\n    "paths": { "@/*": ["./*"] }\n  }\n}`,
                  },
                ]}
              />
            </div>

            {/* Props */}
            <div id="codeblock-props" className="space-y-4">
              <PropsTable rows={[
                ["code",        "string",                         "''",      "Código a exibir (modo single-file)"],
                ["language",    "string",                         "'tsx'",   "Linguagem para highlight (tsx, ts, bash, css, json…)"],
                ["filename",    "string",                         "—",       "Nome do arquivo exibido no cabeçalho"],
                ["showCopy",    "boolean",                        "true",    "Mostra botão de copiar"],
                ["lineNumbers", "boolean",                        "false",   "Exibe números de linha"],
                ["maxLines",    "number",                         "—",       "Recolhe o bloco após N linhas com botão 'Ver mais'"],
                ["tabs",        "CodeBlockTab[]",                 "—",       "Modo multi-arquivo com abas"],
                ["className",   "string",                         "—",       "Classes CSS adicionais"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="stepper" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Stepper</h2>
              <p className="text-zinc-500 text-sm">Indicador de progresso em etapas, com suporte a orientação, variantes e estados por passo.</p>
            </div>

            {/* Horizontal */}
            <div id="stepper-horizontal">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Horizontal</h3>
              <div className="space-y-8">
                {([0, 1, 2, 3] as const).map((active) => (
                  <div key={active}>
                    <p className="text-xs font-mono text-zinc-400 mb-3">activeStep={active}</p>
                    <Stepper
                      activeStep={active}
                      steps={[
                        { title: "Conta",     description: "Dados de login" },
                        { title: "Endereço",  description: "Onde te encontrar" },
                        { title: "Pagamento", description: "Forma de cobrança" },
                        { title: "Revisão",   description: "Confirmar pedido" },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical */}
            <div id="stepper-vertical">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Vertical</h3>
              <div className="max-w-xs">
                <Stepper
                  orientation="vertical"
                  activeStep={1}
                  steps={[
                    { title: "Pedido confirmado", description: "Recebemos seu pedido", status: "completed" },
                    { title: "Em separação", description: "Preparando o envio", status: "current" },
                    { title: "Enviado", description: "A caminho de você" },
                    { title: "Entregue", description: "Pedido entregue" },
                  ]}
                />
              </div>
            </div>

            {/* Variants */}
            <div id="stepper-variants">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Variantes</h3>
              <div className="space-y-8">
                {(["default", "outlined", "minimal"] as const).map((variant) => (
                  <div key={variant}>
                    <p className="text-xs font-mono text-zinc-400 mb-3">variant=&quot;{variant}&quot;</p>
                    <Stepper
                      variant={variant}
                      activeStep={1}
                      steps={[
                        { title: "Passo 1" },
                        { title: "Passo 2" },
                        { title: "Passo 3" },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="text-rotate" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">TextRotate</h2>
              <p className="text-zinc-500 text-sm">Anima uma lista de textos com stagger por caractere, palavra ou linha. Suporta presets de animação, stagger configurável e controle imperativo via ref.</p>
            </div>

            {/* Inline in a sentence — per-character stagger */}
            <div id="text-rotate-inline">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Inline numa frase</h3>
              <p className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
                Criamos soluções para{" "}
                <TextRotate
                  inline
                  staggerDuration={0.04}
                  items={[
                    { content: "Designers",    className: "bg-teal-100 text-teal-700 px-2 rounded" },
                    { content: "Devs",         className: "bg-indigo-100 text-indigo-700 px-2 rounded" },
                    { content: "Gestores",     className: "bg-amber-100 text-amber-700 px-2 rounded" },
                    { content: "Startups",     className: "bg-rose-100 text-rose-700 px-2 rounded" },
                  ] satisfies TextRotateItem[]}
                />
              </p>
            </div>

            {/* Large standalone — center-out stagger */}
            <div id="text-rotate-standalone">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Standalone — stagger do centro</h3>
              <TextRotate
                className="text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight"
                align="center"
                duration={2200}
                staggerFrom="center"
                staggerDuration={0.06}
                items={["DESIGN", "DEVELOP", "DEPLOY", "SCALE", "REPEAT"]}
              />
            </div>

            {/* Rise preset — blur */}
            <div id="text-rotate-rise">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Preset <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded font-mono">rise</code> — com blur</h3>
              <TextRotate
                className="text-4xl font-extrabold text-indigo-600 tracking-tight"
                align="center"
                animation="rise"
                duration={2000}
                staggerFrom="last"
                staggerDuration={0.045}
                items={["Velocidade", "Confiança", "Qualidade", "Inovação"]}
              />
            </div>

            {/* Discrete (instant jump) */}
            <div id="text-rotate-discrete">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Preset <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded font-mono">discrete</code> — pop rápido</h3>
              <p className="text-zinc-500 text-sm">
                Nosso stack:{" "}
                <TextRotate
                  inline
                  animation="discrete"
                  duration={1500}
                  splitBy="words"
                  staggerDuration={0}
                  className="font-mono font-bold text-indigo-600"
                  items={["Next.js", "Tailwind CSS", "TypeScript", "React 19"]}
                />
              </p>
            </div>

            {/* Word stagger with emojis */}
            <div id="text-rotate-emojis">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Stagger por palavra com emojis</h3>
              <TextRotate
                className="text-4xl font-black"
                align="center"
                animation="fade"
                splitBy="words"
                staggerDuration={0.08}
                duration={1800}
                items={[
                  "📀 DESIGN",
                  "⌨️ DEVELOP",
                  "🌎 DEPLOY",
                  "🌱 SCALE",
                  "🔧 MAINTAIN",
                  "♻️ REPEAT",
                ]}
              />
            </div>

            {/* Manual control via ref */}
            <div id="text-rotate-manual">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Controle manual via ref</h3>
              {(() => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const rotateRef = useRef<TextRotateHandle>(null);
                return (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <TextRotate
                        ref={rotateRef}
                        auto={false}
                        className="text-3xl font-bold text-zinc-800 dark:text-zinc-200"
                        align="center"
                        staggerFrom="center"
                        staggerDuration={0.05}
                        items={["Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto"]}
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => rotateRef.current?.previous()}
                        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                      >
                        ← Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateRef.current?.reset()}
                        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateRef.current?.next()}
                        className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      >
                        Próximo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="timeline" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Timeline</h2>
              <p className="text-zinc-500 text-sm">Lista cronológica de eventos com suporte a ícones, cores, badges e alinhamentos.</p>
            </div>

            {/* Left */}
            <div id="timeline-left">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Layout esquerdo (padrão)</h3>
              <Timeline
                items={[
                  { title: "Empresa fundada",      description: "Início da jornada com apenas 3 pessoas.",               date: "Jan 2020", color: "primary",  badge: "Marco" },
                  { title: "Primeiro produto",     description: "Lançamos a versão Alpha para clientes selecionados.",    date: "Jun 2020", color: "success" },
                  { title: "Expansão da equipa",   description: "Time cresceu para 25 colaboradores.",                   date: "Mar 2021", color: "info" },
                  { title: "Rodada de investimento", description: "Série A: R$ 8 milhões captados.",                     date: "Out 2021", color: "warning", badge: "Destaque" },
                  { title: "Produto em produção",  description: "Deploy global concluído com sucesso.",                  date: "Fev 2022", color: "success", badge: "Release" },
                ]}
              />
            </div>

            {/* Alternate */}
            <div id="timeline-alternate">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Layout alternado</h3>
              <Timeline
                layout="alternate"
                items={[
                  { title: "Sprint 1",  description: "Setup do projeto e design system.",   date: "Semana 1", color: "primary" },
                  { title: "Sprint 2",  description: "Módulo de autenticação.",              date: "Semana 2", color: "info" },
                  { title: "Sprint 3",  description: "Dashboard e relatórios.",               date: "Semana 3", color: "success" },
                  { title: "Sprint 4",  description: "Testes e estabilização.",              date: "Semana 4", color: "warning" },
                  { title: "Release",   description: "Deploy para produção.",                date: "Semana 5", color: "success", badge: "v1.0" },
                ]}
              />
            </div>

            {/* Colors */}
            <div id="timeline-colors">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Cores</h3>
              <Timeline
                items={[
                  { title: "Default",  description: "Evento padrão.",  date: "Hoje",     color: "default"  },
                  { title: "Primary",  description: "Evento primário.", date: "Ontem",    color: "primary"  },
                  { title: "Success",  description: "Concluído.",       date: "Seg",      color: "success"  },
                  { title: "Warning",  description: "Atenção.",         date: "Ter",      color: "warning"  },
                  { title: "Danger",   description: "Erro crítico.",    date: "Qua",      color: "danger"   },
                  { title: "Info",     description: "Informativo.",     date: "Qui",      color: "info"     },
                ]}
              />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
