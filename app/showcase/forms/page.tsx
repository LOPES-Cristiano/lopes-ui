"use client";

import React from "react";
import Form, { FormSection, FormRow } from "@/components/form/Form";
import TextField from "@/components/form/TextField";
import NumberField from "@/components/form/NumberField";
import DateField from "@/components/form/DateField";
import TimeField from "@/components/form/TimeField";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import AutocompleteField from "@/components/form/AutocompleteField";
import MultiSelectField from "@/components/form/MultiSelectField";
import FileField from "@/components/form/FileField";

import LoginForm from "@/components/LoginForm";
import OTPInput from "@/components/OTPInput";
import PasswordStrength from "@/components/PasswordStrength";
import PriceInput from "@/components/PriceInput";
import RichTextEditor from "@/components/RichTextEditor";
import CodeBlock from "@/components/CodeBlock";
import Button from "@/components/Button";
import toast from "@/components/Toast";
import { Globe, Monitor, Search, Mail, User, Phone, Zap, BarChart2, Shield, Users, Package, Rocket, Layers, Code2, Cpu, FileText, RefreshCw, Save } from "lucide-react";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

function LoginFormDemo({ withOAuth }: { withOAuth?: boolean }) {
  const [error, setError] = React.useState<string | undefined>();
  const handleSubmit = ({ email, password }: { email: string; password: string; remember: boolean }) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        if (password.length < 6) {
          setError("Senha inválida. Tente novamente.");
        } else {
          setError(undefined);
          toast(`Bem-vindo, ${email}!`);
        }
        resolve();
      }, 1200);
    });

  return (
    <LoginForm
      logo={<span className="text-3xl font-black text-indigo-600">🅻</span>}
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais para acessar o sistema."
      error={error}
      onSubmit={handleSubmit}
      onForgotPassword={() => toast("Link de recuperação enviado!")}
      oauthProviders={withOAuth ? [
        { id: "google",  label: "Continuar com Google",    icon: Globe,   onClick: () => toast("OAuth Google") },
        { id: "ms",      label: "Continuar com Microsoft", icon: Monitor, onClick: () => toast("OAuth Microsoft") },
      ] : undefined}
    />
  );
}

// ── OTPInput demo wrapper ─────────────────────────────────────────────────────

function OTPDemo({ mask, error, length = 6 }: { mask?: boolean; error?: boolean; length?: number }) {
  const [val, setVal] = React.useState("");
  return (
    <div className="space-y-2">
      <OTPInput
        length={length}
        value={val}
        onChange={setVal}
        onComplete={(v) => toast(`Código completo: ${v}`)}
        mask={mask}
        error={error}
      />
      {val && (
        <p className="text-xs text-zinc-400">
          Valor: <code className="font-mono">{val}</code>
        </p>
      )}
    </div>
  );
}

// ── PasswordStrength demo wrapper ─────────────────────────────────────────────

function PasswordStrengthDemo() {
  const [pw, setPw] = React.useState("");
  return (
    <div className="space-y-3 max-w-sm">
      <div className="relative">
        <input
          type="text"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Digite uma senha para testar…"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
      </div>
      <PasswordStrength password={pw} />
    </div>
  );
}

// ── Drawer demo ────────────────────────────────────────────────────────────────

function PriceInputDemo() {
  const [v1, setV1] = React.useState<number|null>(null);
  const [v2, setV2] = React.useState<number|null>(1234.56);
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Valor livre</label>
        <PriceInput value={v1} onChange={setV1} />
        <p className="text-xs text-zinc-400">valor: {v1 ?? "null"}</p>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Pré-preenchido</label>
        <PriceInput value={v2} onChange={setV2} />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Erro</label>
        <PriceInput value={null} onChange={() => {}} error />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Desabilitado</label>
        <PriceInput value={99.9} onChange={() => {}} disabled />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">USD</label>
        <PriceInput value={49.99} onChange={() => {}} currency="USD" locale="en-US" />
      </div>
    </div>
  );
}

// ── QuickActions inline preview (non-fixed, for demo card) ────────────────────

export default function Page() {
  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          <section id="forms">
            <SectionHeader
              label="Forms"
              title="Formulários"
              description="Campos altamente configuráveis com suporte a labels, tooltips, ícones, afixos, validação e layout em colunas."
            />

            <DemoCard id="fields-text" title="TextField — tamanhos e variantes">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField size="sm" label="Small" placeholder="Tamanho sm" />
                  <TextField size="md" label="Medium" placeholder="Tamanho md" />
                  <TextField size="lg" label="Large" placeholder="Tamanho lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField variant="default" label="Default (outline)" placeholder="Estilo padrão" />
                  <TextField variant="filled" label="Filled" placeholder="Estilo preenchido" />
                </div>
              </div>
            </DemoCard>

            <DemoCard id="fields-addons" title="Ícones, prefixos e sufixos">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Ícone esquerdo" leftIcon={<Search />} placeholder="Buscar..." />
                <TextField label="Ícone direito" type="email" rightIcon={<Mail />} placeholder="email@exemplo.com" />
                <TextField label="Prefixo" prefix="https://" placeholder="meusite.com" />
                <TextField label="Sufixo" suffix=".com.br" placeholder="dominio" />
              </div>
            </DemoCard>

            <DemoCard id="fields-states" title="Estados e validação">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Desabilitado" placeholder="Campo desabilitado" disabled defaultValue="Valor anterior" />
                <TextField label="Somente leitura" readOnly defaultValue="Não editável" />
                <TextField label="Com erro" required error="Este campo é obrigatório" placeholder="Campo vazio" />
                <TextField
                  label="Com tooltip e ajuda"
                  tooltip="Informe o CPF no formato 000.000.000-00"
                  helpText="Apenas números e pontuação"
                  placeholder="000.000.000-00"
                />
              </div>
            </DemoCard>

            <DemoCard id="fields-inline" title="Label inline">
              <div className="max-w-lg space-y-3">
                <TextField labelInline labelWidth="w-32" label="Nome" required placeholder="Cristiano" leftIcon={<User />} />
                <TextField labelInline labelWidth="w-32" label="Email" type="email" leftIcon={<Mail />} placeholder="email@exemplo.com" />
                <TextField labelInline labelWidth="w-32" label="Telefone" type="tel" leftIcon={<Phone />} placeholder="(00) 00000-0000" />
                <NumberField labelInline labelWidth="w-32" label="Idade" min={0} max={120} suffix="anos" helpText="Entre 0 e 120" />
              </div>
            </DemoCard>

            <DemoCard id="fields-number" title="NumberField — exemplos">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField label="Quantidade" placeholder="0" min={0} />
                <NumberField label="Preço" prefix="R$" placeholder="0,00" min={0} step={0.01} helpText="Duas casas decimais" />
                <NumberField label="Peso" suffix="kg" placeholder="0.0" min={0} max={999} step={0.1} />
                <NumberField label="Porcentagem" suffix="%" placeholder="0" min={0} max={100} error="Valor não pode exceder 100" />
              </div>
            </DemoCard>

            <DemoCard id="form-complete" title="Form com agrupamentos e colunas">
              <Form
                title="Cadastro de usuário"
                description="Preencha os dados abaixo para criar uma nova conta."
                card
                footer={
                  <>
                    <Button variant="primary">Criar conta</Button>
                    <Button variant="ghost">Cancelar</Button>
                  </>
                }
              >
                <FormSection title="Dados pessoais" description="Informações básicas de identificação.">
                  <FormRow columns={2}>
                    <TextField label="Nome" required placeholder="Cristiano" leftIcon={<User />} />
                    <TextField label="Sobrenome" required placeholder="Lopes" />
                  </FormRow>
                  <FormRow columns={2}>
                    <TextField label="Email" type="email" required placeholder="usuario@email.com" leftIcon={<Mail />} />
                    <TextField label="Telefone" type="tel" placeholder="(00) 00000-0000" leftIcon={<Phone />} />
                  </FormRow>
                </FormSection>
                <FormSection title="Informações adicionais">
                  <FormRow columns={3}>
                    <NumberField label="Idade" min={0} max={120} suffix="anos" />
                    <NumberField label="Altura" min={100} max={250} suffix="cm" />
                    <NumberField label="Peso" min={1} max={500} suffix="kg" step={0.1} />
                  </FormRow>
                  <FormRow>
                    <TextField
                      label="Site pessoal"
                      prefix="https://"
                      placeholder="meusite"
                      suffix=".com"
                      tooltip="URL completa sem o protocolo"
                      helpText="Opcional — será exibido no seu perfil"
                    />
                  </FormRow>
                </FormSection>
              </Form>
            </DemoCard>

            <div id="field-props" className="mt-6">
              <PropsTable rows={[
                ["label",       "string",    "—",       "Texto da etiqueta do campo"],
                ["labelInline", "boolean",   "false",   "Exibe a label horizontalmente à esquerda do input"],
                ["labelWidth",  "string",    "w-28",    "Largura da label inline (classe Tailwind)"],
                ["required",    "boolean",   "false",   "Marca como obrigatório (asterisco)"],
                ["tooltip",     "string",    "—",       "Mensagem exibida no hover do ícone ?"],
                ["error",       "string",    "—",       "Mensagem de erro (substitui helpText)"],
                ["helpText",    "string",    "—",       "Texto auxiliar abaixo do campo"],
                ["width",       "string",    "—",       "Classe Tailwind de largura do wrapper"],
                ["size",        "string",    "md",      "sm | md | lg"],
                ["variant",     "string",    "default", "default (outline) | filled"],
                ["leftIcon",    "ReactElement","—",     "Ícone dentro do input à esquerda"],
                ["rightIcon",   "ReactElement","—",     "Ícone dentro do input à direita"],
                ["prefix",      "string",    "—",       "Texto afixado à esquerda (ex: https://, R$)"],
                ["suffix",      "string",    "—",       "Texto afixado à direita (ex: kg, %, .com)"],
                ["disabled",    "boolean",   "false",   "Desabilita o campo"],
                ["readOnly",    "boolean",   "false",   "Campo somente leitura"],
                ["minLength",   "number",    "—",       "Comprimento mínimo (TextField)"],
                ["maxLength",   "number",    "—",       "Comprimento máximo (TextField)"],
                ["min",         "number",    "—",       "Valor mínimo (NumberField)"],
                ["max",         "number",    "—",       "Valor máximo (NumberField)"],
                ["step",        "number",    "1",       "Incremento/decremento (NumberField)"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Form.tsx" language="tsx" code={`import Form, { FormSection, FormRow } from "@/components/form/Form";
import TextField from "@/components/form/TextField";
import NumberField from "@/components/form/NumberField";

<Form
  title="Cadastro"
  description="Preencha os dados."
  card
  footer={<Button variant="primary">Salvar</Button>}
>
  <FormSection title="Dados pessoais">
    <FormRow columns={2}>
      <TextField label="Nome" required leftIcon={<User />} />
      <TextField label="Email" type="email" required rightIcon={<Mail />} />
    </FormRow>
  </FormSection>
  <FormSection title="Métricas">
    <FormRow columns={3}>
      <NumberField label="Idade"   min={0}   max={120} suffix="anos" />
      <NumberField label="Altura"  min={100} max={250} suffix="cm"   />
      <NumberField label="Peso"    min={1}   max={500} suffix="kg"   step={0.1} />
    </FormRow>
  </FormSection>
</Form>`} />
            </div>

            <DemoCard id="datetime-fields" title="DateField e TimeField">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField label="Data" mode="date" />
                <TimeField label="Hora" />
                <DateField label="Data e hora" mode="datetime" />
                <TimeField label="Com segundos" precision="seconds" tooltip="Inclui campo de segundos" />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField label="Range de datas" min="2026-01-01" max="2026-12-31" helpText="Apenas datas de 2026" />
                <DateField variant="filled" label="Filled" required error="Data é obrigatória" />
              </div>
            </DemoCard>

            <div id="checkboxgroup" className="mt-8 border-t border-zinc-100 pt-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Forms</span>
              <h3 className="mt-1 text-xl font-black text-zinc-900 dark:text-zinc-50">Checkbox &amp; Radio</h3>
              <p className="mt-1 text-sm text-zinc-500">Grupos de seleção com variantes padrão, card e button. Suporta múltipla seleção, ícones por opção e grid de colunas configurável.</p>
            </div>

            <DemoCard id="checkbox-shapes" title="CheckboxGroup — quadrado e círculo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <CheckboxGroup
                  label="Quadrado (multiple)"
                  shape="square"
                  multiple
                  defaultValue={["ts"]}
                  options={[
                    { value: "ts",   label: "TypeScript",  description: "Tipagem estática" },
                    { value: "react",label: "React",       description: "UI declarativa" },
                    { value: "next", label: "Next.js",     description: "Full-stack" },
                    { value: "old",  label: "jQuery",      description: "Legado", disabled: true },
                  ]}
                />
                <CheckboxGroup
                  label="Círculo (single)"
                  shape="circle"
                  multiple={false}
                  defaultValue={["md"]}
                  options={[
                    { value: "sm", label: "Pequeno" },
                    { value: "md", label: "Médio" },
                    { value: "lg", label: "Grande" },
                    { value: "xl", label: "Extra grande" },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="checkbox-horizontal" title="CheckboxGroup — horizontal e tamanhos">
              <div className="space-y-6">
                <CheckboxGroup
                  label="Linguagens (horizontal)"
                  shape="square"
                  direction="horizontal"
                  defaultValue={["ts", "py"]}
                  options={[
                    { value: "ts",   label: "TypeScript" },
                    { value: "js",   label: "JavaScript" },
                    { value: "py",   label: "Python" },
                    { value: "rust", label: "Rust" },
                    { value: "go",   label: "Go" },
                  ]}
                />
                <CheckboxGroup
                  label="Tamanho lg"
                  size="lg"
                  shape="square"
                  direction="horizontal"
                  options={[
                    { value: "a", label: "Opção A" },
                    { value: "b", label: "Opção B" },
                    { value: "c", label: "Opção C" },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="checkbox-card" title="CheckboxGroup — variant card">
              <div className="space-y-8">
                <CheckboxGroup
                  label="Recursos do plano"
                  helpText="Selecione os recursos que deseja habilitar"
                  variant="card"
                  columns={2}
                  defaultValue={["ai", "analytics"]}
                  options={[
                    { value: "ai",       label: "IA generativa",      description: "Modelos de linguagem e automação inteligente", icon: <Zap size={20} /> },
                    { value: "analytics",label: "Analytics",           description: "Relatórios e dashboards em tempo real",        icon: <BarChart2 size={20} /> },
                    { value: "security", label: "Segurança avançada",  description: "SSO, MFA e auditoria completa",               icon: <Shield size={20} /> },
                    { value: "collab",   label: "Colaboração",         description: "Workspaces compartilhados e permissões",       icon: <Users size={20} /> },
                  ]}
                />
                <CheckboxGroup
                  label="Plano"
                  helpText="Escolha um plano"
                  variant="card"
                  columns={3}
                  multiple={false}
                  defaultValue={["pro"]}
                  options={[
                    { value: "starter", label: "Starter", description: "Até 3 projetos · 1 membro", icon: <Package size={20} /> },
                    { value: "pro",     label: "Pro",      description: "Ilimitado · 5 membros",    icon: <Rocket size={20} /> },
                    { value: "team",    label: "Team",     description: "Ilimitado · 20 membros",   icon: <Layers size={20} /> },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="checkbox-button" title="CheckboxGroup — variant button (pills)">
              <div className="space-y-6">
                <CheckboxGroup
                  label="Tecnologias"
                  variant="button"
                  defaultValue={["ts", "react"]}
                  options={[
                    { value: "ts",     label: "TypeScript",  icon: <Code2 size={14} /> },
                    { value: "react",  label: "React",       icon: <Cpu size={14} /> },
                    { value: "next",   label: "Next.js",     icon: <Globe size={14} /> },
                    { value: "python", label: "Python",      icon: <FileText size={14} /> },
                    { value: "rust",   label: "Rust",        icon: <Zap size={14} /> },
                    { value: "go",     label: "Go",          icon: <Package size={14} /> },
                  ]}
                />
                <CheckboxGroup
                  label="Disponibilidade"
                  variant="button"
                  multiple={false}
                  defaultValue={["morning"]}
                  options={[
                    { value: "morning",   label: "Manhã" },
                    { value: "afternoon", label: "Tarde" },
                    { value: "evening",   label: "Noite" },
                    { value: "weekend",   label: "Fim de semana" },
                  ]}
                />
                <CheckboxGroup
                  label="Cobrança"
                  variant="button"
                  size="lg"
                  multiple={false}
                  defaultValue={["year"]}
                  options={[
                    { value: "month", label: "Mensal",  icon: <RefreshCw size={16} /> },
                    { value: "year",  label: "Anual",   icon: <Save size={16} /> },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="autocomplete-examples" title="AutocompleteField">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AutocompleteField
                  label="País"
                  placeholder="Buscar país..."
                  options={["Brasil", "Argentina", "Chile", "Colômbia", "Peru", "Uruguai", "Paraguai", "Bolívia", "Equador", "Venezuela"]}
                />
                <AutocompleteField
                  label="Framework"
                  helpText="Escolha seu principal stack"
                  placeholder="Buscar..."
                  options={[
                    { value: "react",   label: "React" },
                    { value: "vue",     label: "Vue" },
                    { value: "angular", label: "Angular" },
                    { value: "svelte",  label: "Svelte" },
                    { value: "nextjs",  label: "Next.js" },
                    { value: "nuxt",    label: "Nuxt" },
                    { value: "remix",   label: "Remix" },
                  ]}
                />
                <AutocompleteField
                  label="Filled"
                  variant="filled"
                  placeholder="Buscar..."
                  options={["Opção A", "Opção B", "Opção C", "Opção D"]}
                />
                <AutocompleteField
                  label="Com erro"
                  placeholder="Buscar..."
                  error="Selecione uma opção válida"
                  options={["React", "Vue", "Angular"]}
                />
              </div>
            </DemoCard>

            <DemoCard id="multiselect-examples" title="MultiSelectField">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MultiSelectField
                  label="Habilidades"
                  placeholder="Adicionar habilidade..."
                  defaultValue={["ts", "react"]}
                  options={[
                    { value: "ts",       label: "TypeScript" },
                    { value: "react",    label: "React" },
                    { value: "next",     label: "Next.js" },
                    { value: "tailwind", label: "Tailwind CSS" },
                    { value: "node",     label: "Node.js" },
                    { value: "prisma",   label: "Prisma" },
                    { value: "postgres", label: "PostgreSQL" },
                  ]}
                />
                <MultiSelectField
                  label="Categorias (máx. 3)"
                  placeholder="Selecionar categoria..."
                  maxSelections={3}
                  helpText="Selecione até 3 categorias"
                  options={[
                    { value: "design",  label: "Design" },
                    { value: "dev",     label: "Desenvolvimento" },
                    { value: "product", label: "Produto" },
                    { value: "data",    label: "Dados" },
                    { value: "infra",   label: "Infraestrutura" },
                    { value: "mobile",  label: "Mobile" },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="file-examples" title="FileField — compact e drop zone">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileField
                    label="Documento"
                    accept=".pdf,.docx"
                    maxSize={5 * 1024 * 1024}
                  />
                  <FileField
                    label="Imagem de perfil"
                    accept="image/*"
                    buttonLabel="Escolher imagem"
                  />
                  <FileField
                    label="Múltiplos arquivos"
                    multiple
                    accept=".jpg,.png,.webp"
                    helpText="JPG, PNG ou WebP"
                  />
                  <FileField
                    label="Com erro"
                    accept=".pdf"
                    error="Arquivo inválido ou muito grande"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileField
                    label="Drop zone"
                    variant="drop"
                    accept=".pdf,.docx,.xlsx"
                    maxSize={10 * 1024 * 1024}
                  />
                  <FileField
                    label="Drop zone — múltiplos"
                    variant="drop"
                    multiple
                    accept="image/*"
                    helpText="Arraste suas imagens aqui"
                  />
                </div>
              </div>
            </DemoCard>

            <div id="advanced-field-props" className="mt-6">
              <PropsTable rows={[
                ["mode",           "string",    "date",      "DateField: date | datetime"],
                ["precision",      "string",    "minutes",   "TimeField: minutes | seconds"],
                ["min / max",      "string",    "—",         "DateField/TimeField: limites ISO (YYYY-MM-DD)"],
                ["shape",          "string",    "square",    "CheckboxGroup: square | circle"],
                ["multiple",       "boolean",   "true",      "CheckboxGroup: permite múltipla seleção"],
                ["direction",      "string",    "vertical",  "CheckboxGroup: vertical | horizontal"],
                ["variant",        "string",    "default",   "CheckboxGroup: default | card | button"],
                ["columns",        "number",    "2",         "CheckboxGroup (card): 1 | 2 | 3 | 4 colunas"],
                ["options",        "array",     "—",         "AutocompleteField / MultiSelectField / CheckboxGroup"],
                ["options[].icon", "ReactNode", "—",         "CheckboxGroup (card/button): ícone por opção"],
                ["onSelect",       "function",  "—",         "AutocompleteField: callback ao selecionar opção"],
                ["maxSuggestions", "number",    "10",        "AutocompleteField: máx. itens no dropdown"],
                ["emptyMessage",   "string",    "Nenhum resultado","AutocompleteField: texto quando sem resultados"],
                ["maxSelections",  "number",    "—",         "MultiSelectField: limite de seleção"],
                ["searchable",     "boolean",   "true",      "MultiSelectField: habilita busca no dropdown"],
                ["accept",         "string",    "—",         "FileField: tipos aceitos (.pdf, image/*, etc.)"],
                ["maxSize",        "number",    "—",         "FileField: tamanho máximo em bytes"],
                ["variant",        "string",    "compact",   "FileField: compact | drop"],
                ["buttonLabel",    "string",    "Escolher arquivo","FileField: texto do botão (compact)"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="advanced-fields.tsx" language="tsx" code={`import DateField   from "@/components/form/DateField";
import TimeField   from "@/components/form/TimeField";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import AutocompleteField from "@/components/form/AutocompleteField";
import MultiSelectField  from "@/components/form/MultiSelectField";
import FileField   from "@/components/form/FileField";

// Date / Time
<DateField label="Nascimento" mode="date" min="1900-01-01" max="2026-12-31" required />
<TimeField label="Horário" precision="minutes" />

// Checkboxes animados
<CheckboxGroup
  label="Planos"
  shape="circle"
  multiple={false}
  options={[
    { value: "free",  label: "Free",  description: "Gratuito" },
    { value: "pro",   label: "Pro",   description: "R$ 29/mês" },
    { value: "team",  label: "Team",  description: "R$ 99/mês" },
  ]}
  defaultValue={["free"]}
/>

// Autocomplete com objetos
<AutocompleteField
  label="Cidade"
  options={cidades}         // string[] ou { value, label }[]
  onSelect={(opt) => console.log(opt.value)}
/>

// Multi-select com chips
<MultiSelectField
  label="Tags"
  options={tags}
  maxSelections={5}
  defaultValue={["react"]}
/>

// Upload compact e drop zone
<FileField label="Contrato"   accept=".pdf"   maxSize={5_000_000} />
<FileField label="Imagens"    variant="drop"  multiple accept="image/*" />`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="login-form" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Auth"
              title="Login Form"
              description="Formulário de autenticação com e-mail/senha, mostrar/ocultar senha, OAuth providers, 'Esqueci a senha', erro de servidor e estado de loading."
            />

            <DemoCard id="login-form-basic" title="Formulário básico (e-mail + senha)">
              <div className="p-6 flex justify-center">
                <LoginFormDemo />
              </div>
            </DemoCard>

            <DemoCard id="login-form-oauth" title="Com OAuth providers">
              <div className="p-6 flex justify-center">
                <LoginFormDemo withOAuth />
              </div>
            </DemoCard>

            <div id="login-form-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["logo",                  "ReactNode",                "—",              "Branding slot acima do título"],
                ["title",                 "string",                   "'Entrar na conta'","Título do card"],
                ["subtitle",              "string",                   "—",              "Subtítulo"],
                ["oauthProviders",        "LoginFormOAuthProvider[]", "—",              "Botões OAuth (Google, MS…)"],
                ["dividerLabel",          "string",                   "'ou continue com e-mail'", "Texto do divisor"],
                ["emailLabel",            "string",                   "'E-mail'",        "Label do campo e-mail"],
                ["passwordLabel",         "string",                   "'Senha'",         "Label do campo senha"],
                ["rememberLabel",         "string",                   "'Manter conectado'","Label do checkbox remember"],
                ["submitLabel",           "string",                   "'Entrar'",        "Label do botão submit"],
                ["forgotPasswordLabel",   "string",                   "'Esqueci a senha'","Link de recuperação"],
                ["error",                 "string",                   "—",              "Mensagem de erro do servidor"],
                ["loading",               "boolean",                  "false",          "Estado externo de loading"],
                ["onSubmit",              "(values: LoginFormValues) => void | Promise<void>", "—", "Callback ao submeter"],
                ["onForgotPassword",      "() => void",               "—",              "Callback do link esqueci a senha"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="otp-input" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Auth"
              title="OTP Input"
              description="Campo de código de verificação com N boxes, navegação por teclado, paste automático, backspace inteligente e modo máscara."
            />

            <DemoCard id="otp-input-basic" title="6 dígitos (padrão)">
              <div className="p-6">
                <OTPDemo />
              </div>
            </DemoCard>

            <DemoCard id="otp-input-mask" title="Modo máscara">
              <div className="p-6">
                <OTPDemo mask />
              </div>
            </DemoCard>

            <DemoCard id="otp-input-4" title="4 dígitos">
              <div className="p-6">
                <OTPDemo length={4} />
              </div>
            </DemoCard>

            <DemoCard id="otp-input-error" title="Estado de erro">
              <div className="p-6 space-y-2">
                <OTPDemo error />
                <p className="text-sm text-red-600 dark:text-red-400">Código inválido. Tente novamente.</p>
              </div>
            </DemoCard>

            <div id="otp-input-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["length",      "number",             "6",         "Quantidade de boxes"],
                ["value",       "string",             "—",         "Valor controlado"],
                ["onChange",    "(value: string) => void", "—",    "Callback a cada mudança"],
                ["onComplete",  "(value: string) => void", "—",    "Chamado quando todos os boxes são preenchidos"],
                ["disabled",    "boolean",            "false",     "Desabilita todos os inputs"],
                ["error",       "boolean",            "false",     "Estado de erro (borda vermelha)"],
                ["mask",        "boolean",            "false",     "Oculta os caracteres (tipo password)"],
                ["inputMode",   "'numeric'|'text'",   "'numeric'", "Modo de teclado no mobile"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="password-strength" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Auth"
              title="Password Strength"
              description="Indicador visual de força de senha com 5 segmentos, rótulo e dica contextual. Pontuação baseada em comprimento, maiúsculas, números e símbolos."
            />

            <DemoCard id="password-strength-demo" title="Demo interativo">
              <div className="p-6">
                <PasswordStrengthDemo />
              </div>
            </DemoCard>

            <DemoCard id="password-strength-levels" title="Todos os níveis">
              <div className="p-6 space-y-5">
                {[
                  { label: "Muito fraca — 'abc'",       pw: "abc" },
                  { label: "Fraca — 'abcd1234'",       pw: "abcd1234" },
                  { label: "Média — 'Abcd1234'",       pw: "Abcd1234" },
                  { label: "Forte — 'Abcd1234!@'",     pw: "Abcd1234!@" },
                  { label: "Muito forte — 'Abcd1234!@#$%'", pw: "Abcd1234!@#$%" },
                ].map(({ label, pw }) => (
                  <div key={pw} className="space-y-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{label}</p>
                    <PasswordStrength password={pw} />
                  </div>
                ))}
              </div>
            </DemoCard>

            <div id="password-strength-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["password",  "string",   "—",     "Senha a avaliar"],
                ["showHint",  "boolean",  "true",  "Exibe dica contextual abaixo da barra"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="price-input" className="scroll-mt-20">
            <SectionHeader
              label="Componente"
              title="Price Input"
              description="Campo monetário com máscara de centavos, símbolo de moeda e suporte a múltiplas localidades."
            />

            <DemoCard id="price-input-demo" title="Demo interativo">
              <PriceInputDemo />
            </DemoCard>

            <div id="price-input-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["value",    "number | null",     "—",        "Valor controlado em unidades (ex.: 1234.56)"],
                ["onChange", "(val: number|null) => void", "—", "Callback com novo valor"],
                ["currency", "string",            "\"BRL\"",  "Código ISO 4217 da moeda"],
                ["locale",   "string",            "\"pt-BR\"","Locale para formatação"],
                ["error",    "boolean",           "false",    "Anel de erro vermelho"],
                ["disabled", "boolean",           "false",    "Campo desabilitado"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="rich-text-editor" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Editor"
              title="Rich Text Editor"
              description="Editor de texto rico baseado em Tiptap. Suporta formatação completa, links, tabelas, imagens e contagem de caracteres."
            />

            <DemoCard id="rte-demo" title="Editor completo">
              <RichTextEditor
                showCount
                defaultValue="<h2>Bem-vindo ao editor</h2><p>Experimente a barra de ferramentas acima. Você pode <strong>negrito</strong>, <em>itálico</em>, <u>sublinhado</u> e muito mais.</p><ul><li>Listas com marcadores</li><li>Listas numeradas</li><li>Citações</li></ul>"
                onChange={(html) => console.log(html)}
                placeholder="Comece a escrever..."
              />
            </DemoCard>

            <DemoCard id="rte-email" title="Modo email — toolbar reduzida">
              <RichTextEditor
                toolbar={["history", "inline", "align", "list", "link"]}
                minHeight="8rem"
                placeholder="Escreva a mensagem..."
              />
            </DemoCard>

            <DemoCard id="rte-readonly" title="Somente leitura">
              <RichTextEditor
                readOnly
                defaultValue="<p>Este conteúdo é <strong>somente leitura</strong>. A toolbar não é exibida e o texto não pode ser editado.</p>"
              />
            </DemoCard>

            <DemoCard id="rte-borderless" title="Variante sem borda (borderless)">
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-2">
                <RichTextEditor
                  variant="borderless"
                  minHeight="6rem"
                  placeholder="Escreva um comentário..."
                  toolbar={["inline", "link"]}
                />
              </div>
            </DemoCard>

            <CodeBlock
              language="tsx"
              code={`import RichTextEditor from "@/components/RichTextEditor";

// Completo
<RichTextEditor
  showCount
  maxLength={5000}
  placeholder="Escreva aqui..."
  onChange={(html) => setValue(html)}
/>

// Email — toolbar reduzida
<RichTextEditor
  toolbar={["history", "inline", "align", "list", "link"]}
  placeholder="Mensagem..."
/>

// Somente leitura
<RichTextEditor readOnly value={html} />`}
            />

            <div id="rte-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["value",          "string",                          "—",           "Valor HTML controlado"],
                ["defaultValue",   "string",                          "—",           "Valor HTML inicial (não controlado)"],
                ["onChange",       "(html: string) => void",          "—",           "Chamado a cada mudança no conteúdo"],
                ["placeholder",    "string",                          "'Escreva aqui...'", "Texto placeholder"],
                ["minHeight",      "string",                          "'10rem'",     "Altura mínima da área editável"],
                ["maxHeight",      "string",                          "'32rem'",     "Altura máxima antes de rolar"],
                ["disabled",       "boolean",                         "false",       "Desativa o editor"],
                ["readOnly",       "boolean",                         "false",       "Somente leitura (sem toolbar)"],
                ["showCount",      "boolean",                         "false",       "Exibe rodapé com contagem de palavras/caracteres"],
                ["maxLength",      "number",                          "—",           "Limite de caracteres"],
                ["toolbar",        "ToolbarGroup[]",                  "todos os grupos", "Grupos de ferramentas a exibir"],
                ["variant",        "'default' | 'borderless'",        "'default'",   "Estilo visual da borda"],
                ["className",      "string",                          "—",           "Classe extra no container"],
              ]} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <strong>ToolbarGroup:</strong>{" "}
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">{"'history' | 'block' | 'inline' | 'align' | 'list' | 'link' | 'table' | 'media'"}</code>
              </p>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
