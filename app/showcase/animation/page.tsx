"use client";

import React, { useRef, useState } from "react";
import CodeBlock from "@/components/CodeBlock";
import TextRotate, { type TextRotateItem, type TextRotateHandle } from "@/components/TextRotate";
import Stepper from "@/components/Stepper";
import Timeline from "@/components/Timeline";
import CodeEditor, { type CodeEditorLanguage } from "@/components/CodeEditor";
import Marquee from "@/components/Marquee";
import Snippet, { CopyButton } from "@/components/Snippet";
import Tour from "@/components/Tour";
import Button from "@/components/Button";
import toast from "@/components/Toast";
import { Terminal, CheckCircle2 } from "lucide-react";
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
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Snippet & CopyButton ─────────────────────────────────── */}
        <section id="snippet" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="CLI & Cópia Rápida"
            title="Snippet & CopyButton"
            description="Componente de linha de comando copiável em um clique e botão autônomo de cópia com feedback visual animado."
          />

          <DemoCard id="snippet-demo" title="Variantes de Snippet e CopyButton">
            <div className="flex flex-wrap items-center gap-3">
              <Snippet code="npx lopes-ui init --all" />
              <Snippet code="npm run build:lib" variant="dark" />
              <CopyButton value="https://lopes-ui.com.br" label="Copiar URL" />
            </div>
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── CodeEditor ──────────────────────────────────────────── */}
        <section id="code-editor" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="IDE Interativa Next-Gen"
            title="CodeEditor"
            description="Editor de código com realce de sintaxe em tempo real sem latência (JSON, SQL, TypeScript, HTML, CSS, YAML, Bash), auto-fechamento de chaves/aspas, seletor de linguagem, botão Executar (Ctrl+Enter), validação ao vivo, busca case-sensitive e modo tela cheia."
          />

          <DemoCard id="code-editor-demo" title="Realce de Sintaxe ao Vivo, Troca de Linguagem & Execução (Ctrl+Enter)">
            <CodeEditorDemo />
          </DemoCard>

          <PropsTable
            rows={[
              ["language", "CodeEditorLanguage", "'plaintext'", "Linguagem ativa (json, sql, typescript, html, css, yaml, bash...)"],
              ["syntaxHighlight", "boolean", "true", "Ativa camada de realce de sintaxe sincronizada em tempo real"],
              ["allowLanguageChange", "boolean", "false", "Exibe seletor de linguagem no cabeçalho do editor"],
              ["autoCloseBrackets", "boolean", "true", "Auto-completa pares (), [], {}, aspas e indentação inteligente"],
              ["variant", "'default' | 'dark' | 'minimal'", "'default'", "Tema visual do editor (inclui modo IDE escuro permanente)"],
              ["onExecute", "(code: string) => void | Promise<void>", "—", "Habilita botão Executar e atalho Ctrl+Enter / Cmd+Enter"],
            ]}
          />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Stepper ──────────────────────────────────────────────── */}
        <section id="stepper" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Fluxo Multi-etapas"
            title="Stepper"
            description="Indicador de progresso por etapas nas orientações horizontal e vertical com 5 variantes visuais: default, outlined, minimal (barra segmentada), navigation (barra clicável com chevron) e dot (pontos de progresso)."
          />

          <DemoCard id="stepper-horizontal" title="5 Variantes Visuais Interativas (Default, Outlined, Minimal, Navigation & Dot)">
            <StepperShowcaseDemo />
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

          <DemoCard id="timeline-left" title="Rastreamento de Entrega & Montagem">
            <Timeline
              items={[
                { title: "Pedido aprovado", description: "Sofá Retrátil 3L + Geladeira Inverter reservados no CD Porto Velho (RO).", date: "08:30", color: "primary", badge: "Faturado" },
                { title: "NF-e emitida", description: "Nota fiscal autorizada e etiqueta de volume gerada.", date: "09:15", color: "info" },
                { title: "Em rota de entrega", description: "Caminhão baú saiu para entrega no bairro Embratel.", date: "11:00", color: "warning", badge: "Em trânsito" },
                { title: "Entregue & Montado", description: "Montagem concluída e canhoto digital assinado pelo cliente.", date: "14:40", color: "success", badge: "Concluído" },
              ]}
            />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Tour ─────────────────────────────────────────────────── */}
        <section id="tour" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Onboarding Guiado"
            title="Tour"
            description="Cartão interativo de onboarding passo a passo com indicadores de progresso, badges contextuais e navegação por etapas."
          />

          <DemoCard id="tour-demo" title="Demonstração Interativa de Onboarding">
            <TourShowcaseDemo />
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
                Conforto e qualidade para{" "}
                <TextRotate
                  inline
                  staggerDuration={0.04}
                  items={[
                    { content: "sua Sala", className: "bg-teal-100 text-teal-700 px-2 rounded" },
                    { content: "seu Quarto", className: "bg-indigo-100 text-indigo-700 px-2 rounded" },
                    { content: "sua Cozinha", className: "bg-amber-100 text-amber-700 px-2 rounded" },
                    { content: "seu Lar", className: "bg-rose-100 text-rose-700 px-2 rounded" },
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
                  items={["MÓVEIS", "ESTOFADOS", "COLCHÕES", "ELETRO", "CONFORTO"]}
                />
              </div>
            </div>
          </DemoCard>

          <DemoCard id="text-rotate-manual" title="Controle Manual via Ref">
            <TextRotateManualDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Marquee ──────────────────────────────────────────────── */}
        <section id="marquee" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Movimento Contínuo"
            title="Marquee"
            description="Faixa de rolagem infinita suave (horizontal ou vertical) com pausa automática ao passar o mouse e máscaras de gradiente nas bordas."
          />

          <DemoCard id="marquee-demo" title="Faixa Infinita de Departamentos & Praças">
            <Marquee duration={26} pauseOnHover>
              {[
                "Sofás Retráteis & Salas",
                "Colchões Molas Ensacadas",
                "Refrigeradores Inverter",
                "Guarda-Roupas & Dormitórios",
                "Porto Velho — RO (69)",
                "Manaus — AM (92)",
                "Ji-Paraná — RO (69)",
                "Lavadoras & Lava e Seca",
              ].map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs"
                >
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>{tag}</span>
                </div>
              ))}
            </Marquee>
          </DemoCard>
        </section>
      </div>
    </main>
  );
}

function StepperShowcaseDemo() {
  const [active, setActive] = useState(1);
  const steps = [
    { title: "Pedido & Itens", description: "Móveis e Eletro selecionados" },
    { title: "Frete & Montagem", description: "Agendamento RO / AM" },
    { title: "Pagamento", description: "Aprovação financeira" },
    { title: "Concluído", description: "Pronto para expedição" },
  ];

  return (
    <div className="space-y-8">
      <Stepper activeStep={active} onStepClick={setActive} steps={steps} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div>
          <p className="text-xs font-mono text-zinc-400 mb-3">variant=&quot;outlined&quot;</p>
          <Stepper
            variant="outlined"
            activeStep={active}
            onStepClick={setActive}
            steps={[{ title: "Separação" }, { title: "Rota" }, { title: "Montagem" }]}
          />
        </div>
        <div>
          <p className="text-xs font-mono text-zinc-400 mb-3">variant=&quot;minimal&quot; (Barra Segmentada)</p>
          <Stepper
            variant="minimal"
            activeStep={active}
            onStepClick={setActive}
            steps={steps}
          />
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div>
          <p className="text-xs font-mono text-zinc-400 mb-3">
            variant=&quot;navigation&quot; (Ant Design Steps Navigation Bar)
          </p>
          <Stepper
            variant="navigation"
            activeStep={active}
            onStepClick={setActive}
            steps={steps}
          />
        </div>

        <div>
          <p className="text-xs font-mono text-zinc-400 mb-3">
            variant=&quot;dot&quot; (Ant Design Progress Dot)
          </p>
          <Stepper
            variant="dot"
            activeStep={active}
            onStepClick={setActive}
            steps={steps}
          />
        </div>
      </div>
    </div>
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
                "Pressione Ctrl+K ou Cmd+K a qualquer momento para navegar entre mais de 110 componentes, páginas exemplo e ações rápidas.",
            },
            {
              title: "Controle de Acesso RBAC Nativo",
              badge: "Enterprise",
              description:
                "Passe componentId diretamente em qualquer botão, campo, editor ou cartão para gerenciar visibilidade e bloqueio via AccessControlProvider.",
            },
            {
              title: "Editores Next-Gen & Padrões Mantine UI",
              badge: "Novo",
              description:
                "Experimente o novo RichTextEditor com Slash Commands (/), CodeEditor com syntax highlight ao vivo, SegmentedControl e FileDropzone.",
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
          items={["Porto Velho (RO)", "Manaus (AM)", "Ji-Paraná (RO)", "Ariquemes (RO)", "Itacoatiara (AM)"]}
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

const CODE_SAMPLES: Record<string, string> = {
  sql: `-- Consulta de Vendas por Praça (Rondônia & Amazonas)\nSELECT\n  f.uf,\n  f.cidade,\n  p.departamento,\n  COUNT(v.id) AS total_pedidos,\n  SUM(v.valor_liquido) AS receita_brl\nFROM vendas v\nJOIN filiais f ON f.id = v.filial_id\nJOIN produtos p ON p.id = v.produto_id\nWHERE f.uf IN ('RO', 'AM')\n  AND v.status = 'FATURADO'\nGROUP BY f.uf, f.cidade, p.departamento\nORDER BY receita_brl DESC;`,
  json: JSON.stringify(
    {
      library: "lopes-ui",
      version: "1.4.0",
      empresa: "Lopes Distribuidora Ltda.",
      pracas: ["Rondônia (69)", "Amazonas (92)"],
      editors: ["RichTextEditor", "RichTextField", "CodeEditor", "EmailComposer", "ChatComposer"],
      treeShakeable: true,
    },
    null,
    2,
  ),
  typescript: `import { RichTextEditor } from "lopes-ui/rich-text";\nimport { SegmentedControl, StatsSegmentsCard } from "lopes-ui";\n\nexport function PainelFilial() {\n  const pracas = ["Porto Velho - RO", "Manaus - AM"] as const;\n  return pracas.map((p) => p.toUpperCase());\n}`,
};

function CodeEditorDemo() {
  const [lang, setLang] = useState<CodeEditorLanguage>("sql");
  const [code, setCode] = useState<string>(CODE_SAMPLES.sql);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Terminal size={14} />
          <span>Experimente trocar a linguagem ou pressionar Ctrl+Enter para executar</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? "Tema: Dark IDE" : "Tema: Adaptativo"}
        </Button>
      </div>

      <CodeEditor
        title={lang === "sql" ? "relatorio_vendas_ro_am.sql" : lang === "json" ? "config.json" : "PainelFilial.tsx"}
        language={lang}
        allowLanguageChange
        onLanguageChange={(next) => {
          setLang(next);
          if (CODE_SAMPLES[next]) setCode(CODE_SAMPLES[next]);
        }}
        variant={darkMode ? "dark" : "default"}
        value={code}
        onChange={setCode}
        onExecute={async (src) => {
          await new Promise((r) => setTimeout(r, 400));
          toast.success(`Executado com sucesso (${src.split("\n").length} linhas processadas)!`);
        }}
        height={290}
      />
    </div>
  );
}
