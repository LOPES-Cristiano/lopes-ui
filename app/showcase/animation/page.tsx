"use client";

import React, { useRef, useState } from "react";
import CodeBlock from "@/components/CodeBlock";
import TextRotate, { type TextRotateItem, type TextRotateHandle } from "@/components/TextRotate";
import Stepper from "@/components/Stepper";
import Timeline from "@/components/Timeline";
import CodeEditor from "@/components/CodeEditor";
import Marquee from "@/components/Marquee";
import Snippet, { CopyButton } from "@/components/Snippet";
import Tour from "@/components/Tour";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import toast from "@/components/Toast";
import { Sparkles, Terminal, Shield, Zap, CheckCircle2 } from "lucide-react";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

export default function Page() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
        {/* ── CodeBlock ────────────────────────────────────────────── */}
        <section id="codeblock" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Código & Sintaxe"
            title="CodeBlock"
            description="Bloco de código com syntax highlighting (Shiki / GitHub Dark), cabeçalho minimalista estilo Vercel/shadcn, números de linha, recolher automático e abas multi-arquivo."
          />

          <DemoCard id="codeblock-basic" title="Básico">
            <CodeBlock
              filename="Button.tsx"
              language="tsx"
              code={`import { Button } from "lopes-ui";\n\nexport default function Demo() {\n  return (\n    <Button variant="primary" size="lg">\n      Salvar alterações\n    </Button>\n  );\n}`}
            />
          </DemoCard>

          <DemoCard id="codeblock-terminal" title="Terminal">
            <CodeBlock
              filename="terminal"
              language="bash"
              code={`npm install shiki lucide-react tailwind-merge clsx`}
            />
          </DemoCard>

          <DemoCard id="codeblock-linenumbers" title="Números de linha">
            <CodeBlock
              filename="useAsyncButton.ts"
              language="ts"
              lineNumbers
              code={`import { useState, useCallback } from "react";\n\ntype AsyncButtonState = {\n  loading: boolean;\n  error: string | null;\n};\n\nexport function useAsyncButton(fn: () => Promise<void>) {\n  const [state, setState] = useState<AsyncButtonState>({\n    loading: false,\n    error: null,\n  });\n\n  const trigger = useCallback(async () => {\n    setState({ loading: true, error: null });\n    try {\n      await fn();\n    } catch (err) {\n      setState({ loading: false, error: String(err) });\n      return;\n    }\n    setState({ loading: false, error: null });\n  }, [fn]);\n\n  return { ...state, trigger };\n}`}
            />
          </DemoCard>

          <DemoCard id="codeblock-showmore" title="Recolher (maxLines)">
            <CodeBlock
              filename="globals.css"
              language="css"
              maxLines={6}
              code={`@import "tailwindcss";\n\n:root {\n  --background: #ffffff;\n  --foreground: #171717;\n}\n\n@theme inline {\n  --color-background: var(--background);\n  --color-foreground: var(--foreground);\n  --font-sans: var(--font-geist-sans);\n  --font-mono: var(--font-geist-mono);\n}\n\nbody {\n  background: var(--background);\n  color: var(--foreground);\n  overflow-x: hidden;\n}`}
            />
          </DemoCard>

          <DemoCard id="codeblock-tabs" title="Abas (múltiplos arquivos)">
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
          </DemoCard>

          <div id="codeblock-props" className="space-y-4">
            <PropsTable
              rows={[
                ["code", "string", "''", "Código a exibir (modo single-file)"],
                ["language", "string", "'tsx'", "Linguagem para highlight (tsx, ts, bash, css, json…)"],
                ["filename", "string", "—", "Nome do arquivo exibido no cabeçalho"],
                ["showCopy", "boolean", "true", "Mostra botão de copiar"],
                ["lineNumbers", "boolean", "false", "Exibe números de linha"],
                ["maxLines", "number", "—", "Recolhe o bloco após N linhas com botão 'Expandir'"],
                ["tabs", "CodeBlockTab[]", "—", "Modo multi-arquivo com abas"],
              ]}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Snippet & CopyButton ──────────────────────────────────── */}
        <section id="snippet" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Comandos & Chaves"
            title="Snippet & CopyButton"
            description="Componente inline para comandos de terminal, chaves de API e tokens com botão de cópia animado e modo secreto (maskSecret)."
          />

          <DemoCard id="snippet-demo" title="Variantes, Multilinha e Chave Secreta">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Snippet code="npx lopes-ui init" variant="default" />
                <Snippet code="npm run build:lib" variant="dark" />
                <Snippet code="pnpm dlx lopes-ui doctor" variant="indigo" symbol=">" />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <p className="text-xs font-medium text-zinc-500">
                  Modo Chave de API (maskSecret) + CopyButton standalone:
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Snippet
                    code="sk_test_EXEMPLO_NAO_REAL"
                    symbol="KEY"
                    maskSecret
                    onCopyCode={() => toast.success("Chave copiada para a área de transferência!")}
                  />
                  <CopyButton
                    value="https://api.lopes-ui.dev/v1/webhooks"
                    label="Copiar Webhook URL"
                    variant="outline"
                    size="md"
                  />
                </div>
              </div>
            </div>
          </DemoCard>

          <PropsTable
            rows={[
              ["code", "string | string[]", "—", "Texto ou linhas do comando/token"],
              ["symbol", "string | false", "'$'", "Prefixo exibido antes da linha"],
              ["variant", "'default' | 'dark' | 'bordered' | 'indigo'", "'default'", "Estilo visual do container"],
              ["maskSecret", "boolean", "false", "Oculta o texto com caracteres • e botão de olho"],
            ]}
          />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Marquee ──────────────────────────────────────────────── */}
        <section id="marquee" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Movimento Contínuo"
            title="Marquee"
            description="Faixa de rolagem contínua infinita (horizontal ou vertical) com pausa automática no hover, inversão de direção e máscara de fade nas bordas."
          />

          <DemoCard id="marquee-demo" title="Ticker Horizontal Duplo (Pause on Hover)">
            <div className="space-y-3">
              <Marquee duration={25}>
                {[
                  { icon: Zap, title: "Next.js 16 Ready", badge: "SSR" },
                  { icon: Shield, title: "RBAC Controle de Acesso", badge: "Segurança" },
                  { icon: Sparkles, title: "80+ Componentes", badge: "Design System" },
                  { icon: Terminal, title: "CLI Automatizada", badge: "DX" },
                  { icon: CheckCircle2, title: "WCAG 2.1 AA Acessível", badge: "Radix UI" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 px-4 py-2.5"
                    >
                      <Icon size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                        {item.title}
                      </span>
                      <Badge label={item.badge} variant="default" size="xs" />
                    </div>
                  );
                })}
              </Marquee>

              <Marquee duration={30} reverse>
                {[
                  "Tailwind CSS v4",
                  "TypeScript Strict",
                  "Tree-Shakeable ESM/CJS",
                  "Dark Mode Nativo",
                  "Zero Runtime Overhead",
                  "ZodForm Validation",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 px-3.5 py-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </Marquee>
            </div>
          </DemoCard>

          <PropsTable
            rows={[
              ["reverse", "boolean", "false", "Inverte o sentido da rolagem"],
              ["pauseOnHover", "boolean", "true", "Pausa a animação quando o cursor está sobre a faixa"],
              ["orientation", "'horizontal' | 'vertical'", "'horizontal'", "Eixo da animação"],
              ["duration", "number", "28", "Duração de um ciclo em segundos"],
              ["fadeEdges", "boolean", "true", "Aplica máscara de transparência nas extremidades"],
            ]}
          />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Tour (Onboarding Spotlight) ──────────────────────────── */}
        <section id="tour" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Onboarding Guiado"
            title="Tour"
            description="Guia interativo passo a passo para apresentação de novos recursos (Product Tour / Onboarding), com indicador de progresso, mídia e callbacks."
          />

          <DemoCard id="tour-demo" title="Tour Interativo de Onboarding">
            <TourShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Stepper ──────────────────────────────────────────────── */}
        <section id="stepper" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Fluxo em Etapas"
            title="Stepper"
            description="Indicador de progresso em etapas, com suporte a orientação horizontal/vertical, variantes e estados por passo."
          />

          <DemoCard id="stepper-horizontal" title="Horizontal">
            <div className="space-y-8">
              {([0, 1, 2, 3] as const).map((active) => (
                <div key={active}>
                  <p className="text-xs font-mono text-zinc-400 mb-3">activeStep={active}</p>
                  <Stepper
                    activeStep={active}
                    steps={[
                      { title: "Conta", description: "Dados de login" },
                      { title: "Endereço", description: "Onde te encontrar" },
                      { title: "Pagamento", description: "Forma de cobrança" },
                      { title: "Revisão", description: "Confirmar pedido" },
                    ]}
                  />
                </div>
              ))}
            </div>
          </DemoCard>

          <DemoCard id="stepper-vertical" title="Vertical & Variantes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <div className="space-y-6">
                {(["default", "outlined", "minimal"] as const).map((variant) => (
                  <div key={variant}>
                    <p className="text-xs font-mono text-zinc-400 mb-2">variant=&quot;{variant}&quot;</p>
                    <Stepper
                      variant={variant}
                      activeStep={1}
                      steps={[{ title: "Passo 1" }, { title: "Passo 2" }, { title: "Passo 3" }]}
                    />
                  </div>
                ))}
              </div>
            </div>
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TextRotate ───────────────────────────────────────────── */}
        <section id="text-rotate" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Tipografia Animada"
            title="TextRotate"
            description="Anima uma lista de textos com stagger por caractere, palavra ou linha. Suporta presets de animação e controle imperativo via ref."
          />

          <DemoCard id="text-rotate-inline" title="Inline numa frase & Stagger do centro">
            <div className="space-y-8">
              <p className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
                Criamos soluções para{" "}
                <TextRotate
                  inline
                  staggerDuration={0.04}
                  items={[
                    { content: "Designers", className: "bg-teal-100 text-teal-700 px-2 rounded" },
                    { content: "Devs", className: "bg-indigo-100 text-indigo-700 px-2 rounded" },
                    { content: "Gestores", className: "bg-amber-100 text-amber-700 px-2 rounded" },
                    { content: "Startups", className: "bg-rose-100 text-rose-700 px-2 rounded" },
                  ] satisfies TextRotateItem[]}
                />
              </p>

              <div id="text-rotate-standalone" className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <TextRotate
                  className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight"
                  align="center"
                  duration={2200}
                  staggerFrom="center"
                  staggerDuration={0.06}
                  items={["DESIGN", "DEVELOP", "DEPLOY", "SCALE", "REPEAT"]}
                />
              </div>
            </div>
          </DemoCard>

          <DemoCard id="text-rotate-manual" title="Presets (rise, discrete, emojis) & Controle Manual">
            <TextRotateManualDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Timeline ─────────────────────────────────────────────── */}
        <section id="timeline" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Cronologia"
            title="Timeline"
            description="Lista cronológica de eventos com suporte a ícones, cores semânticas, badges e layout alternado."
          />

          <DemoCard id="timeline-left" title="Layout esquerdo (padrão)">
            <Timeline
              items={[
                { title: "Empresa fundada", description: "Início da jornada com apenas 3 pessoas.", date: "Jan 2020", color: "primary", badge: "Marco" },
                { title: "Primeiro produto", description: "Lançamos a versão Alpha para clientes selecionados.", date: "Jun 2020", color: "success" },
                { title: "Expansão da equipe", description: "Time cresceu para 25 colaboradores.", date: "Mar 2021", color: "info" },
                { title: "Rodada de investimento", description: "Série A: R$ 8 milhões captados.", date: "Out 2021", color: "warning", badge: "Destaque" },
                { title: "Produto em produção", description: "Deploy global concluído com sucesso.", date: "Fev 2022", color: "success", badge: "Release" },
              ]}
            />
          </DemoCard>

          <DemoCard id="timeline-alternate" title="Layout alternado & Cores">
            <Timeline
              layout="alternate"
              items={[
                { title: "Sprint 1", description: "Setup do projeto e design system.", date: "Semana 1", color: "primary" },
                { title: "Sprint 2", description: "Módulo de autenticação.", date: "Semana 2", color: "info" },
                { title: "Sprint 3", description: "Dashboard e relatórios.", date: "Semana 3", color: "success" },
                { title: "Sprint 4", description: "Testes e estabilização.", date: "Semana 4", color: "warning" },
                { title: "Release", description: "Deploy para produção.", date: "Semana 5", color: "success", badge: "v1.0" },
              ]}
            />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── CodeEditor ──────────────────────────────────────────── */}
        <section id="code-editor" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="IDE Interativa"
            title="CodeEditor"
            description="Editor de código interativo com realce de sintaxe, validação JSON/SQL em tempo real, busca e substituição, formatação automática e modo tela cheia."
          />

          <DemoCard id="code-editor-demo" title="Editor JSON com validação ao vivo">
            <CodeEditorDemo />
          </DemoCard>
        </section>
      </div>
    </main>
  );
}

function TourShowcaseDemo() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      {open ? (
        <Tour
          currentStep={step}
          onStepChange={setStep}
          onSkip={() => setOpen(false)}
          onFinish={() => {
            setOpen(false);
            toast.success("Tour concluído com sucesso!");
          }}
          steps={[
            {
              title: "Busca Global Instantânea (⌘K)",
              badge: "Atalho",
              description:
                "Pressione Ctrl+K ou Cmd+K a qualquer momento para navegar entre mais de 80 componentes, páginas exemplo e ações rápidas.",
            },
            {
              title: "Controle de Acesso RBAC Nativo",
              badge: "Enterprise",
              description:
                "Passe as props permission ou role diretamente em qualquer botão, campo de formulário, aba ou tabela para ocultar ou desabilitar sem código boilerplate.",
            },
            {
              title: "5 Páginas Exemplo Prontas",
              badge: "Novo",
              description:
                "Explore dashboards executivos, pipeline CRM, central Helpdesk, configurações RBAC e vitrine e-commerce na seção Templates.",
            },
          ]}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStep(0);
            setOpen(true);
          }}
        >
          Reiniciar Tour de Demonstração
        </Button>
      )}
    </div>
  );
}

function TextRotateManualDemo() {
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
        <Button variant="outline" size="sm" onClick={() => rotateRef.current?.previous()}>
          ← Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => rotateRef.current?.reset()}>
          Reset
        </Button>
        <Button variant="primary" size="sm" onClick={() => rotateRef.current?.next()}>
          Próximo →
        </Button>
      </div>
    </div>
  );
}

function CodeEditorDemo() {
  const [code, setCode] = React.useState(
    JSON.stringify(
      {
        name: "lopes-ui",
        version: "1.3.0",
        theme: "system",
        subpaths: ["primitives", "rich-text", "spreadsheet", "code-block", "hooks", "utils"],
        accessibility: "WCAG 2.1 AA",
        treeShakeable: true,
      },
      null,
      2
    )
  );

  return (
    <CodeEditor
      title="lopes-ui.config.json"
      language="json"
      value={code}
      onChange={setCode}
      height={280}
    />
  );
}
