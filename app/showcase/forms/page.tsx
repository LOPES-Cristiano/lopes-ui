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
import SelectField from "@/components/form/SelectField";
import NativeSelect from "@/components/form/NativeSelect";
import Checkbox from "@/components/form/Checkbox";
import DatePickerField from "@/components/form/DatePickerField";
import MonthPickerField from "@/components/form/MonthPickerField";
import TimePickerField from "@/components/form/TimePickerField";
import TextareaField from "@/components/form/TextareaField";
import RadioGroupField from "@/components/form/RadioGroupField";
import SliderField from "@/components/form/SliderField";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/form/InputGroup";
import DateRangePickerField, {
  type DateRangeValue,
} from "@/components/form/DateRangePickerField";
import RatingField, { Rating } from "@/components/form/RatingField";
import FilterChips from "@/components/form/FilterChips";
import ColorPickerField from "@/components/form/ColorPickerField";
import TagInputField from "@/components/form/TagInputField";
import CascaderField, { type CascaderOption } from "@/components/form/CascaderField";
import TreeSelectField, { type TreeSelectNode } from "@/components/form/TreeSelectField";
import MentionsField from "@/components/form/MentionsField";
import TagsInput, { CheckableTagGroup } from "@/components/form/TagsInput";
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
} from "@/components/form/FieldWrapper";
import ZodForm from "@/components/form/ZodForm";
import { z } from "zod";

import LoginForm from "@/components/LoginForm";
import OTPInput from "@/components/OTPInput";
import PasswordStrength from "@/components/PasswordStrength";
import PriceInput, { CurrencyField } from "@/components/PriceInput";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextField from "@/components/RichTextField";
import SegmentedControl from "@/components/SegmentedControl";
import FileDropzone, { type FileDropzoneItem } from "@/components/FileDropzone";
import { SignatureField } from "@/components/SignaturePad";
import InlineEdit from "@/components/InlineEdit";
import CodeBlock from "@/components/CodeBlock";
import Button from "@/components/Button";
import toast from "@/components/Toast";
import {
  Globe,
  Monitor,
  Search,
  Mail,
  User,
  Phone,
  Zap,
  BarChart2,
  Shield,
  Users,
  Package,
  Rocket,
  Layers,
  Code2,
  Cpu,
  FileText,
  RefreshCw,
  Save,
} from "lucide-react";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

function LoginFormDemo({ withOAuth }: { withOAuth?: boolean }) {
  const [error, setError] = React.useState<string | undefined>();
  const handleSubmit = ({
    email,
    password,
  }: {
    email: string;
    password: string;
    remember: boolean;
  }) =>
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
      oauthProviders={
        withOAuth
          ? [
              {
                id: "google",
                label: "Continuar com Google",
                icon: Globe,
                onClick: () => toast("OAuth Google"),
              },
              {
                id: "ms",
                label: "Continuar com Microsoft",
                icon: Monitor,
                onClick: () => toast("OAuth Microsoft"),
              },
            ]
          : undefined
      }
    />
  );
}

// ── OTPInput demo wrapper ─────────────────────────────────────────────────────

function OTPDemo({
  mask,
  error,
  length = 6,
}: {
  mask?: boolean;
  error?: boolean;
  length?: number;
}) {
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
  const [v1, setV1] = React.useState<number | null>(null);
  const [v2, setV2] = React.useState<number | null>(1234.56);
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
        <PriceInput
          value={49.99}
          onChange={() => {}}
          currency="USD"
          locale="en-US"
        />
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

          <DemoCard id="fields-text" title="TextField — tamanhos e 6 variantes visuais">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField size="sm" label="Small" placeholder="Tamanho sm" />
                <TextField size="md" label="Medium" placeholder="Tamanho md" />
                <TextField size="lg" label="Large" placeholder="Tamanho lg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <TextField
                  variant="default"
                  label="Default (outline)"
                  placeholder="Estilo padrão"
                />
                <TextField
                  variant="filled"
                  label="Filled"
                  placeholder="Estilo preenchido"
                />
                <TextField
                  variant="underlined"
                  label="Underlined"
                  defaultValue="Av. Sete de Setembro — RO"
                />
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1 border border-dashed border-zinc-200 dark:border-zinc-700">
                  <TextField
                    variant="borderless"
                    label="Borderless"
                    defaultValue="Conforto e qualidade para o seu lar"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <TextField
                  variant="contained"
                  label="Contained (Label interno ao card)"
                  defaultValue="Showroom Cidade Nova — Manaus (AM)"
                />
                <TextField
                  variant="floating"
                  label="Floating Label (Rótulo flutuante)"
                  defaultValue="Rafael Nascimento — Consultor Sênior"
                />
              </div>
            </div>
          </DemoCard>

          <DemoCard id="fields-addons" title="Ícones, prefixos, sufixos e addons acoplados">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Ícone esquerdo"
                  leftIcon={<Search />}
                  placeholder="Buscar estofados, colchões ou eletro..."
                />
                <TextField
                  label="Ícone direito"
                  type="email"
                  rightIcon={<Mail />}
                  placeholder="atendimento@empresa.com.br"
                />
                <TextField
                  label="Prefixo interno"
                  prefix="https://"
                  placeholder="meusite.com"
                />
                <TextField
                  label="Sufixo interno"
                  suffix=".com.br"
                  placeholder="dominio"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <TextField
                  label="Addons externos acoplados (addonBefore & addonAfter)"
                  addonBefore="https://"
                  addonAfter=".empresa.com.br"
                  defaultValue="catalogo-norte"
                />
                <TextField
                  label="Código de Rastreio c/ Addon"
                  addonBefore="ROTA-NORTE"
                  addonAfter="RO/AM"
                  defaultValue="69042"
                />
              </div>
            </div>
          </DemoCard>

          <DemoCard id="fields-masks" title="TextField — Máscaras Progressivas Brasileiras (CPF/CNPJ, Telefone, CEP e Placa)">
            <TextFieldMasksDemo />
          </DemoCard>

          <DemoCard id="fields-states" title="Estados e validação">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Desabilitado"
                placeholder="Campo desabilitado"
                disabled
                defaultValue="Valor anterior"
              />
              <TextField
                label="Somente leitura"
                readOnly
                defaultValue="Não editável"
              />
              <TextField
                label="Com erro"
                required
                error="Este campo é obrigatório"
                placeholder="Campo vazio"
              />
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
              <TextField
                labelInline
                labelWidth="w-32"
                label="Nome"
                required
                placeholder="Cristiano"
                leftIcon={<User />}
              />
              <TextField
                labelInline
                labelWidth="w-32"
                label="Email"
                type="email"
                leftIcon={<Mail />}
                placeholder="email@exemplo.com"
              />
              <TextField
                labelInline
                labelWidth="w-32"
                label="Telefone"
                type="tel"
                leftIcon={<Phone />}
                placeholder="(00) 00000-0000"
              />
              <NumberField
                labelInline
                labelWidth="w-32"
                label="Idade"
                min={0}
                max={120}
                suffix="anos"
                helpText="Entre 0 e 120"
              />
            </div>
          </DemoCard>

          <DemoCard id="fields-number" title="NumberField — exemplos">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField label="Quantidade" placeholder="0" min={0} />
              <NumberField
                label="Preço"
                prefix="R$"
                placeholder="0,00"
                min={0}
                step={0.01}
                helpText="Duas casas decimais"
              />
              <NumberField
                label="Peso"
                suffix="kg"
                placeholder="0.0"
                min={0}
                max={999}
                step={0.1}
              />
              <NumberField
                label="Porcentagem"
                suffix="%"
                placeholder="0"
                min={0}
                max={100}
                error="Valor não pode exceder 100"
              />
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
              <FormSection
                title="Dados pessoais"
                description="Informações básicas de identificação."
              >
                <FormRow columns={2}>
                  <TextField
                    label="Nome"
                    required
                    placeholder="Cristiano"
                    leftIcon={<User />}
                  />
                  <TextField label="Sobrenome" required placeholder="Lopes" />
                </FormRow>
                <FormRow columns={2}>
                  <TextField
                    label="Email"
                    type="email"
                    required
                    placeholder="usuario@email.com"
                    leftIcon={<Mail />}
                  />
                  <TextField
                    label="Telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    leftIcon={<Phone />}
                  />
                </FormRow>
              </FormSection>
              <FormSection title="Informações adicionais">
                <FormRow columns={3}>
                  <NumberField label="Idade" min={0} max={120} suffix="anos" />
                  <NumberField label="Altura" min={100} max={250} suffix="cm" />
                  <NumberField
                    label="Peso"
                    min={1}
                    max={500}
                    suffix="kg"
                    step={0.1}
                  />
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
            <PropsTable
              rows={[
                ["label", "string", "—", "Texto da etiqueta do campo"],
                [
                  "labelInline",
                  "boolean",
                  "false",
                  "Exibe a label horizontalmente à esquerda do input",
                ],
                [
                  "labelWidth",
                  "string",
                  "w-28",
                  "Largura da label inline (classe Tailwind)",
                ],
                [
                  "required",
                  "boolean",
                  "false",
                  "Marca como obrigatório (asterisco)",
                ],
                [
                  "tooltip",
                  "string",
                  "—",
                  "Mensagem exibida no hover do ícone ?",
                ],
                [
                  "error",
                  "string",
                  "—",
                  "Mensagem de erro (substitui helpText)",
                ],
                ["helpText", "string", "—", "Texto auxiliar abaixo do campo"],
                [
                  "width",
                  "string",
                  "—",
                  "Classe Tailwind de largura do wrapper",
                ],
                ["size", "string", "md", "sm | md | lg"],
                [
                  "variant",
                  "string",
                  "default",
                  "default | filled | contained | floating | underlined | borderless",
                ],
                [
                  "mask",
                  "string | function",
                  "—",
                  "cpf | cnpj | cpf-cnpj | phone | cep | plate | ((raw) => string)",
                ],
                [
                  "addonBefore / addonAfter",
                  "ReactNode",
                  "—",
                  "Blocos externos acoplados à borda esquerda/direita do TextField",
                ],
                [
                  "leftIcon",
                  "ReactElement",
                  "—",
                  "Ícone dentro do input à esquerda",
                ],
                [
                  "rightIcon",
                  "ReactElement",
                  "—",
                  "Ícone dentro do input à direita",
                ],
                [
                  "prefix",
                  "string",
                  "—",
                  "Texto afixado à esquerda (ex: https://, R$)",
                ],
                [
                  "suffix",
                  "string",
                  "—",
                  "Texto afixado à direita (ex: kg, %, .com)",
                ],
                ["disabled", "boolean", "false", "Desabilita o campo"],
                ["readOnly", "boolean", "false", "Campo somente leitura"],
                ["minLength", "number", "—", "Comprimento mínimo (TextField)"],
                ["maxLength", "number", "—", "Comprimento máximo (TextField)"],
                ["min", "number", "—", "Valor mínimo (NumberField)"],
                ["max", "number", "—", "Valor máximo (NumberField)"],
                ["step", "number", "1", "Incremento/decremento (NumberField)"],
              ]}
            />
          </div>

          <div className="mt-6">
            <CodeBlock
              filename="Form.tsx"
              language="tsx"
              code={`import Form, { FormSection, FormRow } from "@/components/form/Form";
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
</Form>`}
            />
          </div>

          <DemoCard id="select-fields" title="SelectField & NativeSelect">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Região de Implantação"
                placeholder="Selecionar região..."
                clearable
                defaultValue="pvh"
                options={[
                  { value: "pvh", label: "São Paulo — sa-east-1" },
                  { value: "jpr", label: "N. Virginia — us-east-1" },
                  { value: "ari", label: "Oregon — us-west-2" },
                  { value: "mao", label: "Dublin — eu-west-1" },
                  { value: "hta", label: "Frankfurt — eu-central-1" },
                ]}
              />
              <SelectField
                label="Categoria de Módulo"
                variant="filled"
                placeholder="Selecionar setor..."
                options={[
                  { value: "auth", label: "Autenticação & Identidade" },
                  { value: "ui", label: "Design System & UI" },
                  { value: "logs", label: "Observabilidade & Logs" },
                  { value: "webhooks", label: "Integrações & Webhooks" },
                ]}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  NativeSelect (compacto com ícone)
                </label>
                <NativeSelect
                  icon={<Package size={14} />}
                  defaultValue="entrega"
                >
                  <option value="entrega">Deploy Contínuo (CI/CD)</option>
                  <option value="retirada">Execução Manual sob Demanda</option>
                  <option value="transferencia">Replicação Multi-Região</option>
                </NativeSelect>
              </div>
              <SelectField
                label="Com erro"
                required
                error="Selecione uma tabela de preço válida"
                options={[
                  { value: "varejo", label: "Tabela Varejo Padrão" },
                  { value: "promocional", label: "Plano Enterprise Anual" },
                ]}
              />
            </div>
          </DemoCard>

          <DemoCard
            id="picker-fields"
            title="DatePickerField, MonthPickerField e TimePickerField"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DatePickerField
                label="Data de Entrega"
                defaultValue="2026-10-26"
                helpText="Calendário interativo em portal"
              />
              <MonthPickerField
                label="Competência / Meta Mensal"
                defaultValue="2026-10"
                helpText="Seletor de mês e ano (YYYY-MM)"
              />
              <TimePickerField
                label="Janela de Deploy"
                defaultValue="14:30"
                stepMinutes={15}
                helpText="Intervalos de 15 minutos"
              />
            </div>
          </DemoCard>

          <DemoCard id="checkbox-single" title="Checkbox (unitário)">
            <div className="flex flex-wrap gap-6 items-start">
              <Checkbox
                defaultChecked
                label="Habilitar autenticação em dois fatores (2FA)"
                description="Exige token TOTP ou chave de segurança WebAuthn no login"
              />
              <Checkbox
                indeterminate
                label="Seleção parcial (indeterminate)"
                description="Estado intermediário para cabeçalhos de tabelas"
              />
              <Checkbox
                disabled
                defaultChecked
                label="Garantia estendida (bloqueado)"
                description="Opção indisponível para mostruário"
              />
            </div>
          </DemoCard>

          <DemoCard
            id="zod-form-demo"
            title="ZodForm — validação declarativa com schema Zod"
          >
            <ZodForm
              schema={z.object({
                produto: z
                  .string()
                  .min(3, "Informe o nome do produto (mín. 3 caracteres)"),
                filial: z.string().min(1, "Selecione a filial de origem"),
                preco: z.number().min(10, "O valor mínimo é R$ 10,00"),
              })}
              defaultValues={{
                produto: "Plano Enterprise Cloud",
                filial: "pvh",
                preco: 2499.9,
              }}
              onSubmit={(vals) => {
                toast.success(
                  `Produto "${vals.produto}" validado para a filial ${vals.filial.toUpperCase()}!`,
                );
              }}
            >
              {({ values, errors, setValue, isDirty }) => (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <TextField
                      label="Plano / Assinatura"
                      required
                      value={(values.produto as string) ?? ""}
                      onChange={(e) => setValue("produto", e.target.value)}
                      error={errors.produto}
                    />
                    <SelectField
                      label="Região Principal"
                      required
                      value={(values.filial as string) ?? ""}
                      onChange={(v) => setValue("filial", v)}
                      error={errors.filial}
                      options={[
                        { value: "pvh", label: "São Paulo (sa-east-1)" },
                        { value: "mao", label: "N. Virginia (us-east-1)" },
                      ]}
                    />
                    <NumberField
                      label="Preço de Venda"
                      required
                      prefix="R$"
                      value={(values.preco as number) ?? 0}
                      onValueChange={(v) => setValue("preco", v ?? 0)}
                      error={errors.preco}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-zinc-500">
                      Status:{" "}
                      <strong>
                        {isDirty ? "Alterado (dirty)" : "Sem alterações"}
                      </strong>
                    </span>
                    <Button type="submit" variant="primary" size="sm">
                      Validar com Zod
                    </Button>
                  </div>
                </div>
              )}
            </ZodForm>
          </DemoCard>

          <DemoCard id="datetime-fields" title="DateField e TimeField">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateField label="Data" mode="date" />
              <TimeField label="Hora" />
              <DateField label="Data e hora" mode="datetime" />
              <TimeField
                label="Com segundos"
                precision="seconds"
                tooltip="Inclui campo de segundos"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateField
                label="Range de datas"
                min="2026-01-01"
                max="2026-12-31"
                helpText="Apenas datas de 2026"
              />
              <DateField
                variant="filled"
                label="Filled"
                required
                error="Data é obrigatória"
              />
            </div>
          </DemoCard>

          <div
            id="checkboxgroup"
            className="mt-8 border-t border-zinc-100 pt-8"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
              Forms
            </span>
            <h3 className="mt-1 text-xl font-black text-zinc-900 dark:text-zinc-50">
              Checkbox &amp; Radio
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Grupos de seleção com variantes padrão, card e button. Suporta
              múltipla seleção, ícones por opção e grid de colunas configurável.
            </p>
          </div>

          <DemoCard
            id="checkbox-shapes"
            title="CheckboxGroup — quadrado e círculo"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CheckboxGroup
                label="Quadrado (multiple)"
                shape="square"
                multiple
                defaultValue={["ts"]}
                options={[
                  {
                    value: "ts",
                    label: "TypeScript",
                    description: "Tipagem estática",
                  },
                  {
                    value: "react",
                    label: "React",
                    description: "UI declarativa",
                  },
                  {
                    value: "next",
                    label: "Next.js",
                    description: "Full-stack",
                  },
                  {
                    value: "old",
                    label: "jQuery",
                    description: "Legado",
                    disabled: true,
                  },
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

          <DemoCard
            id="checkbox-horizontal"
            title="CheckboxGroup — horizontal e tamanhos"
          >
            <div className="space-y-6">
              <CheckboxGroup
                label="Linguagens (horizontal)"
                shape="square"
                direction="horizontal"
                defaultValue={["ts", "py"]}
                options={[
                  { value: "ts", label: "TypeScript" },
                  { value: "js", label: "JavaScript" },
                  { value: "py", label: "Python" },
                  { value: "rust", label: "Rust" },
                  { value: "go", label: "Go" },
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
                  {
                    value: "ai",
                    label: "IA generativa",
                    description: "Modelos de linguagem e automação inteligente",
                    icon: <Zap size={20} />,
                  },
                  {
                    value: "analytics",
                    label: "Analytics",
                    description: "Relatórios e dashboards em tempo real",
                    icon: <BarChart2 size={20} />,
                  },
                  {
                    value: "security",
                    label: "Segurança avançada",
                    description: "SSO, MFA e auditoria completa",
                    icon: <Shield size={20} />,
                  },
                  {
                    value: "collab",
                    label: "Colaboração",
                    description: "Workspaces compartilhados e permissões",
                    icon: <Users size={20} />,
                  },
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
                  {
                    value: "starter",
                    label: "Starter",
                    description: "Até 3 projetos · 1 membro",
                    icon: <Package size={20} />,
                  },
                  {
                    value: "pro",
                    label: "Pro",
                    description: "Ilimitado · 5 membros",
                    icon: <Rocket size={20} />,
                  },
                  {
                    value: "team",
                    label: "Team",
                    description: "Ilimitado · 20 membros",
                    icon: <Layers size={20} />,
                  },
                ]}
              />
            </div>
          </DemoCard>

          <DemoCard
            id="checkbox-button"
            title="CheckboxGroup — variant button (pills)"
          >
            <div className="space-y-6">
              <CheckboxGroup
                label="Tecnologias"
                variant="button"
                defaultValue={["ts", "react"]}
                options={[
                  {
                    value: "ts",
                    label: "TypeScript",
                    icon: <Code2 size={14} />,
                  },
                  { value: "react", label: "React", icon: <Cpu size={14} /> },
                  {
                    value: "next",
                    label: "Next.js",
                    icon: <Globe size={14} />,
                  },
                  {
                    value: "python",
                    label: "Python",
                    icon: <FileText size={14} />,
                  },
                  { value: "rust", label: "Rust", icon: <Zap size={14} /> },
                  { value: "go", label: "Go", icon: <Package size={14} /> },
                ]}
              />
              <CheckboxGroup
                label="Disponibilidade"
                variant="button"
                multiple={false}
                defaultValue={["morning"]}
                options={[
                  { value: "morning", label: "Manhã" },
                  { value: "afternoon", label: "Tarde" },
                  { value: "evening", label: "Noite" },
                  { value: "weekend", label: "Fim de semana" },
                ]}
              />
              <CheckboxGroup
                label="Cobrança"
                variant="button"
                size="lg"
                multiple={false}
                defaultValue={["year"]}
                options={[
                  {
                    value: "month",
                    label: "Mensal",
                    icon: <RefreshCw size={16} />,
                  },
                  { value: "year", label: "Anual", icon: <Save size={16} /> },
                ]}
              />
            </div>
          </DemoCard>

          <DemoCard id="autocomplete-examples" title="AutocompleteField">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AutocompleteField
                label="País"
                placeholder="Buscar país..."
                options={[
                  "Brasil",
                  "Argentina",
                  "Chile",
                  "Colômbia",
                  "Peru",
                  "Uruguai",
                  "Paraguai",
                  "Bolívia",
                  "Equador",
                  "Venezuela",
                ]}
              />
              <AutocompleteField
                label="Framework"
                helpText="Escolha seu principal stack"
                placeholder="Buscar..."
                options={[
                  { value: "react", label: "React" },
                  { value: "vue", label: "Vue" },
                  { value: "angular", label: "Angular" },
                  { value: "svelte", label: "Svelte" },
                  { value: "nextjs", label: "Next.js" },
                  { value: "nuxt", label: "Nuxt" },
                  { value: "remix", label: "Remix" },
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
                  { value: "ts", label: "TypeScript" },
                  { value: "react", label: "React" },
                  { value: "next", label: "Next.js" },
                  { value: "tailwind", label: "Tailwind CSS" },
                  { value: "node", label: "Node.js" },
                  { value: "prisma", label: "Prisma" },
                  { value: "postgres", label: "PostgreSQL" },
                ]}
              />
              <MultiSelectField
                label="Categorias (máx. 3)"
                placeholder="Selecionar categoria..."
                maxSelections={3}
                helpText="Selecione até 3 categorias"
                options={[
                  { value: "design", label: "Design" },
                  { value: "dev", label: "Desenvolvimento" },
                  { value: "product", label: "Produto" },
                  { value: "data", label: "Dados" },
                  { value: "infra", label: "Infraestrutura" },
                  { value: "mobile", label: "Mobile" },
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
            <PropsTable
              rows={[
                ["mode", "string", "date", "DateField: date | datetime"],
                [
                  "precision",
                  "string",
                  "minutes",
                  "TimeField: minutes | seconds",
                ],
                [
                  "min / max",
                  "string",
                  "—",
                  "DateField/TimeField: limites ISO (YYYY-MM-DD)",
                ],
                ["shape", "string", "square", "CheckboxGroup: square | circle"],
                [
                  "multiple",
                  "boolean",
                  "true",
                  "CheckboxGroup: permite múltipla seleção",
                ],
                [
                  "direction",
                  "string",
                  "vertical",
                  "CheckboxGroup: vertical | horizontal",
                ],
                [
                  "variant",
                  "string",
                  "default",
                  "CheckboxGroup: default | card | button",
                ],
                [
                  "columns",
                  "number",
                  "2",
                  "CheckboxGroup (card): 1 | 2 | 3 | 4 colunas",
                ],
                [
                  "options",
                  "array",
                  "—",
                  "AutocompleteField / MultiSelectField / CheckboxGroup",
                ],
                [
                  "options[].icon",
                  "ReactNode",
                  "—",
                  "CheckboxGroup (card/button): ícone por opção",
                ],
                [
                  "onSelect",
                  "function",
                  "—",
                  "AutocompleteField: callback ao selecionar opção",
                ],
                [
                  "maxSuggestions",
                  "number",
                  "10",
                  "AutocompleteField: máx. itens no dropdown",
                ],
                [
                  "emptyMessage",
                  "string",
                  "Nenhum resultado",
                  "AutocompleteField: texto quando sem resultados",
                ],
                [
                  "maxSelections",
                  "number",
                  "—",
                  "MultiSelectField: limite de seleção",
                ],
                [
                  "searchable",
                  "boolean",
                  "true",
                  "MultiSelectField: habilita busca no dropdown",
                ],
                [
                  "accept",
                  "string",
                  "—",
                  "FileField: tipos aceitos (.pdf, image/*, etc.)",
                ],
                [
                  "maxSize",
                  "number",
                  "—",
                  "FileField: tamanho máximo em bytes",
                ],
                ["variant", "string", "compact", "FileField: compact | drop"],
                [
                  "buttonLabel",
                  "string",
                  "Escolher arquivo",
                  "FileField: texto do botão (compact)",
                ],
              ]}
            />
          </div>

          <div className="mt-6">
            <CodeBlock
              filename="advanced-fields.tsx"
              language="tsx"
              code={`import DateField   from "@/components/form/DateField";
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
<FileField label="Imagens"    variant="drop"  multiple accept="image/*" />`}
            />
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

          <DemoCard
            id="login-form-basic"
            title="Formulário básico (e-mail + senha)"
          >
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
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                ["logo", "ReactNode", "—", "Branding slot acima do título"],
                ["title", "string", "'Entrar na conta'", "Título do card"],
                ["subtitle", "string", "—", "Subtítulo"],
                [
                  "oauthProviders",
                  "LoginFormOAuthProvider[]",
                  "—",
                  "Botões OAuth (Google, MS…)",
                ],
                [
                  "dividerLabel",
                  "string",
                  "'ou continue com e-mail'",
                  "Texto do divisor",
                ],
                ["emailLabel", "string", "'E-mail'", "Label do campo e-mail"],
                ["passwordLabel", "string", "'Senha'", "Label do campo senha"],
                [
                  "rememberLabel",
                  "string",
                  "'Manter conectado'",
                  "Label do checkbox remember",
                ],
                ["submitLabel", "string", "'Entrar'", "Label do botão submit"],
                [
                  "forgotPasswordLabel",
                  "string",
                  "'Esqueci a senha'",
                  "Link de recuperação",
                ],
                ["error", "string", "—", "Mensagem de erro do servidor"],
                ["loading", "boolean", "false", "Estado externo de loading"],
                [
                  "onSubmit",
                  "(values: LoginFormValues) => void | Promise<void>",
                  "—",
                  "Callback ao submeter",
                ],
                [
                  "onForgotPassword",
                  "() => void",
                  "—",
                  "Callback do link esqueci a senha",
                ],
              ]}
            />
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
              <p className="text-sm text-red-600 dark:text-red-400">
                Código inválido. Tente novamente.
              </p>
            </div>
          </DemoCard>

          <div id="otp-input-props" className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                ["length", "number", "6", "Quantidade de boxes"],
                ["value", "string", "—", "Valor controlado"],
                [
                  "onChange",
                  "(value: string) => void",
                  "—",
                  "Callback a cada mudança",
                ],
                [
                  "onComplete",
                  "(value: string) => void",
                  "—",
                  "Chamado quando todos os boxes são preenchidos",
                ],
                ["disabled", "boolean", "false", "Desabilita todos os inputs"],
                [
                  "error",
                  "boolean",
                  "false",
                  "Estado de erro (borda vermelha)",
                ],
                [
                  "mask",
                  "boolean",
                  "false",
                  "Oculta os caracteres (tipo password)",
                ],
                [
                  "inputMode",
                  "'numeric'|'text'",
                  "'numeric'",
                  "Modo de teclado no mobile",
                ],
              ]}
            />
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
                { label: "Muito fraca — 'abc'", pw: "abc" },
                { label: "Fraca — 'abcd1234'", pw: "abcd1234" },
                { label: "Média — 'Abcd1234'", pw: "Abcd1234" },
                { label: "Forte — 'Abcd1234!@'", pw: "Abcd1234!@" },
                { label: "Muito forte — 'Abcd1234!@#$%'", pw: "Abcd1234!@#$%" },
              ].map(({ label, pw }) => (
                <div key={pw} className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {label}
                  </p>
                  <PasswordStrength password={pw} />
                </div>
              ))}
            </div>
          </DemoCard>

          <div id="password-strength-props" className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                ["password", "string", "—", "Senha a avaliar"],
                [
                  "showHint",
                  "boolean",
                  "true",
                  "Exibe dica contextual abaixo da barra",
                ],
              ]}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="price-input" className="space-y-8 scroll-mt-20">
          <SectionHeader
            label="Campos Monetários"
            title="PriceInput & CurrencyField"
            description="Campos monetários com máscara automática de centavos, símbolo de moeda, formatação localizada e seletor multi-moedas integrado (CurrencyField com variantes default e contained)."
          />

          <DemoCard id="price-input-demo" title="PriceInput — Máscara Monetária por Centavos">
            <PriceInputDemo />
          </DemoCard>

          <DemoCard id="currency-field-demo" title="CurrencyField — Multi-Moedas (BRL, USD, EUR) & Variante Contained">
            <CurrencyFieldShowcaseDemo />
          </DemoCard>

          <div id="price-input-props" className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                [
                  "value",
                  "number | null",
                  "—",
                  "Valor controlado em unidades (ex.: 1234.56)",
                ],
                [
                  "onChange",
                  "(val: number|null) => void",
                  "—",
                  "Callback com novo valor",
                ],
                ["currency", "string", '"BRL"', "Código ISO 4217 da moeda"],
                ["currencies", "CurrencyOption[]", "—", "Lista de moedas selecionáveis no CurrencyField"],
                ["onCurrencyChange", "(code: string) => void", "—", "Callback ao trocar a moeda no CurrencyField"],
                ["variant", "'default' | 'contained'", '"default"', "Estilo visual do CurrencyField"],
                ["locale", "string", '"pt-BR"', "Locale para formatação"],
                ["error", "boolean | string", "false", "Anel de erro vermelho / mensagem no CurrencyField"],
                ["disabled", "boolean", "false", "Campo desabilitado"],
              ]}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="rich-text-editor" className="space-y-10 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Editor Next-Gen"
            title="Rich Text Editor & RichTextField"
            description="Editor corporativo baseado em Tiptap v3 + padrões @mantine/tiptap: Slash Commands (/), Bubble Menu flutuante ao selecionar texto, blocos de Callout, variáveis dinâmicas ({{...}}), modo Documento A4 imprimível, busca e substituição (Ctrl+F), código-fonte HTML e wrapper RichTextField para formulários."
          />

          <DemoCard
            id="rte-demo"
            title="Editor Completo — Digite '/' para comandos ou '{{' para variáveis dinâmicas"
          >
            <RichTextNextGenDemo />
          </DemoCard>

          <DemoCard
            id="rte-document"
            title="Modo Documento A4 (variant='document') — Zoom, Quebra de Página e Impressão"
          >
            <RichTextEditor
              variant="document"
              toolbarPreset="document"
              showCount
              allowSourceView
              defaultValue="<h2>Termo de Entrega e Montagem — Móveis &amp; Eletro</h2><p>Confirmamos o agendamento da entrega e montagem especializada para <span data-merge-tag='cliente_nome'>{{cliente_nome}}</span> na unidade <strong>Porto Velho — RO</strong>.</p><div data-callout='' data-type='info'><p><strong>Conforto e qualidade para o seu lar:</strong> Nossa equipe técnica realizará a montagem completa dos móveis e o teste funcional dos eletrodomésticos no ato da entrega.</p></div><table><tbody><tr><th>Item do Pedido</th><th>Ambiente</th><th>Prazo</th></tr><tr><td>Sofá Retrátil &amp; Reclinável 3 Lugares</td><td>Sala de Estar</td><td>Imediato</td></tr><tr><td>Guarda-Roupa Casal 6 Portas c/ Espelho</td><td>Quarto</td><td>Montagem inclusa</td></tr></tbody></table>"
            />
          </DemoCard>

          <DemoCard id="rte-field" title="RichTextField (Integrado a FieldWrapper / ZodForm)">
            <RichTextField
              label="Instruções Técnicas para a Equipe de Montagem"
              required
              toolbarPreset="standard"
              minHeight="7rem"
              showCount
              maxLength={800}
              defaultValue="<p>Verificar nivelamento do piso antes de instalar o <strong>Guarda-Roupa Casal</strong> e confirmar tensão 127V da lavanderia em <em>Manaus - AM</em>.</p>"
              helpText="Normaliza HTML vazio (<p></p>) automaticamente para validação obrigatória no ZodForm."
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
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                ["value", "string", "—", "Valor HTML controlado"],
                [
                  "defaultValue",
                  "string",
                  "—",
                  "Valor HTML inicial (não controlado)",
                ],
                [
                  "onChange",
                  "(html: string) => void",
                  "—",
                  "Chamado a cada mudança no conteúdo",
                ],
                [
                  "placeholder",
                  "string",
                  "'Escreva aqui...'",
                  "Texto placeholder",
                ],
                [
                  "minHeight",
                  "string",
                  "'10rem'",
                  "Altura mínima da área editável",
                ],
                [
                  "maxHeight",
                  "string",
                  "'32rem'",
                  "Altura máxima antes de rolar",
                ],
                ["disabled", "boolean", "false", "Desativa o editor"],
                [
                  "readOnly",
                  "boolean",
                  "false",
                  "Somente leitura (sem toolbar)",
                ],
                [
                  "showCount",
                  "boolean",
                  "false",
                  "Exibe rodapé com contagem de palavras/caracteres",
                ],
                ["maxLength", "number", "—", "Limite de caracteres"],
                [
                  "toolbar",
                  "ToolbarGroup[]",
                  "todos os grupos",
                  "Grupos de ferramentas a exibir",
                ],
                [
                  "variant",
                  "'default' | 'borderless' | 'filled' | 'minimal' | 'notion' | 'document'",
                  "'default'",
                  "Estilo visual do editor (inclui folha A4 em 'document')",
                ],
                [
                  "toolbarPreset",
                  "'full' | 'standard' | 'compact' | 'minimal' | 'document'",
                  "'full'",
                  "Preset rápido de ferramentas",
                ],
                ["bubbleMenu", "boolean", "true", "Exibe barra flutuante ao selecionar texto"],
                ["slashCommands", "boolean", "true", "Ativa paleta de comandos ao digitar '/'"],
                ["variables", "RichTextVariable[]", "[]", "Variáveis dinâmicas inseríveis via '{{' ou toolbar"],
                ["snippets", "RichTextSnippet[]", "[]", "Blocos/cláusulas prontas na toolbar e menu '/'"],
                ["allowSourceView", "boolean", "false", "Permite alternar e editar o código HTML bruto"],
                ["stickyToolbar", "boolean", "false", "Mantém a toolbar fixa no topo durante a rolagem"],
                ["className", "string", "—", "Classe extra no container"],
              ]}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <strong>ToolbarGroup:</strong>{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                {
                  "'history' | 'block' | 'inline' | 'align' | 'list' | 'link' | 'table' | 'media'"
                }
              </code>
            </p>
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TextareaField ────────────────────────────────────────────── */}
        <section id="textarea-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Campo de Texto"
            title="TextareaField"
            description="Área de texto multilinha com auto-expansão vertical (autoResize), contador de caracteres em tempo real (showCount) e suporte a dicas/erros."
          />

          <DemoCard
            id="textarea-demo"
            title="Auto-resize e Contador de Caracteres"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextareaField
                label="Descrição do Projeto"
                placeholder="Descreva o escopo técnico e os requisitos do módulo..."
                autoResize
                showCount
                maxLength={240}
                defaultValue="Implementação do novo fluxo de autenticação multifator e controle de acesso baseado em papéis (RBAC)."
                hint="Expande automaticamente conforme você digita."
              />
              <TextareaField
                label="Notas da Release"
                placeholder="Liste as principais alterações desta versão..."
                rows={4}
                showCount
                maxLength={500}
                error="Informe o resumo das alterações antes de publicar a release."
              />
            </div>
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── RadioGroupField ──────────────────────────────────────────── */}
        <section id="radio-group-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Seleção Exclusiva"
            title="RadioGroupField"
            description="Grupo de botões de rádio com 4 variantes visuais: lista padrão (default), cartões clicáveis com descrição (cards), botões acoplados estilo Radio.Button (buttons e buttons-solid) e orientação horizontal."
          />

          <DemoCard
            id="radio-group-demo"
            title="Variantes: Cards em Grade, Radio.Button (Outline & Solid) e Lista Horizontal"
          >
            <RadioGroupShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SegmentedControl ─────────────────────────────────────────── */}
        <section id="segmented-control" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Seletor Deslizante"
            title="SegmentedControl"
            description="Controle segmentado com indicador deslizante animado (ResizeObserver), suporte a ícones, contadores/badges, larguras proporcionais (fullWidth) e navegação completa por setas do teclado."
          />

          <DemoCard id="segmented-control-demo" title="Departamentos & Visualizações com Indicador Animado">
            <SegmentedControlShowcaseDemo />
          </DemoCard>

          <PropsTable
            rows={[
              ["data", "(string | SegmentedControlItem)[]", "—", "Lista de opções com value, label, icon e badge"],
              ["value / defaultValue", "string", "primeira opção", "Valor selecionado controlado ou inicial"],
              ["variant", "'default' | 'primary' | 'outline'", "'default'", "Estilo visual do indicador ativo"],
              ["size", "'xs' | 'sm' | 'md' | 'lg'", "'md'", "Dimensão e tipografia do controle"],
              ["fullWidth", "boolean", "false", "Distribui os segmentos igualmente em 100% da largura"],
              ["orientation", "'horizontal' | 'vertical'", "'horizontal'", "Orientação dos segmentos e animação"],
            ]}
          />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SliderField ──────────────────────────────────────────────── */}
        <section id="slider-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Intervalo Numérico"
            title="SliderField"
            description="Controle deslizante para valor único ou faixa dupla [min, max], com formatação customizada, marcas de referência (marks) e navegação via teclado."
          />

          <DemoCard
            id="slider-demo"
            title="Valor Único e Faixa de Valores (Range [min, max])"
          >
            <SliderShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── InputGroup ───────────────────────────────────────────────── */}
        <section id="input-group" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Composição"
            title="InputGroup"
            description="Agrupamento flexível de inputs com prefixos, sufixos, moeda, protocolo e botões de ação acoplados sem quebra de borda."
          />

          <DemoCard
            id="input-group-demo"
            title="Prefixos, Sufixos e Botões Acoplados"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <InputGroup
                label="Domínio da Aplicação"
                hint="Subdomínio público configurado no DNS."
              >
                <InputGroupAddon align="inline-start">
                  https://
                </InputGroupAddon>
                <InputGroupInput
                  defaultValue="app.lopes-ui"
                  placeholder="subdominio"
                />
                <InputGroupAddon align="inline-end">.dev</InputGroupAddon>
              </InputGroup>

              <InputGroup
                label="Chave do Projeto / Token"
                hint="Valide a chave antes de salvar a integração."
              >
                <InputGroupAddon align="inline-start">KEY</InputGroupAddon>
                <InputGroupInput
                  defaultValue="LP-9842-PROD"
                  placeholder="Digite o identificador..."
                />
                <InputGroupButton
                  onClick={() =>
                    toast.success("Token validado com sucesso!")
                  }
                >
                  Validar
                </InputGroupButton>
              </InputGroup>

              <InputGroup
                label="Limite Mensal de Budget"
                hint="Alerta automático ao atingir 80% do limite."
              >
                <InputGroupAddon align="inline-start">R$</InputGroupAddon>
                <InputGroupInput type="number" defaultValue="1490.00" />
                <InputGroupAddon align="inline-end">
                  por mês
                </InputGroupAddon>
              </InputGroup>

              <NumberField
                label="Instâncias com Stepper (+/-)"
                showControls
                min={1}
                max={50}
                defaultValue={4}
                hint="NumberField com prop showControls ativa."
              />
            </div>
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── DateRangePickerField ─────────────────────────────────────── */}
        <section id="date-range-picker" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Período"
            title="DateRangePickerField"
            description="Seletor de intervalo de datas (Início — Fim) com calendário duplo de 2 meses lado a lado e atalhos rápidos (Hoje, Últimos 7 dias, Últimos 30 dias, Este mês)."
          />

          <DemoCard
            id="date-range-picker-demo"
            title="Período de Análise e Relatórios"
          >
            <DateRangeShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── RatingField ──────────────────────────────────────────────── */}
        <section id="rating-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Avaliação"
            title="Rating & RatingField"
            description="Componente de avaliação por estrelas ou corações com suporte a meia-estrela (allowHalf), ícones customizados, leitura (readOnly) e rótulos de feedback."
          />

          <DemoCard
            id="rating-field-demo"
            title="Estrelas, Meia-Estrela (allowHalf) e Corações"
          >
            <RatingShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── FilterChips ──────────────────────────────────────────────── */}
        <section id="filter-chips" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Filtros Rápidos"
            title="FilterChips"
            description="Pílulas de filtro interativas com modo de seleção única (com colapso elegante das opções não selecionadas e botão ×) ou seleção múltipla com contadores."
          />

          <DemoCard
            id="filter-chips-demo"
            title="Filtro por Categoria e Região"
          >
            <FilterChipsShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TagsInput, TagInputField & CheckableTagGroup ─────────────── */}
        <section id="tags-input" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Tags & Etiquetas"
            title="TagsInput, TagInputField & CheckableTagGroup"
            description="Família unificada de tags: entrada por digitação com sugestões (TagInputField / mode='input'), adição in-loco com botão '+ Nova Etiqueta' e renomeação por duplo-clique (mode='inline-add'), e pílulas de marcação rápida (CheckableTagGroup)."
          />

          <DemoCard id="tags-input-demo" title="Modos Input com Sugestões, '+ Nova Etiqueta' Editável & CheckableTags">
            <TagsInputShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── MentionsField ────────────────────────────────────────────── */}
        <section id="mentions-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Menções Contextuais"
            title="MentionsField"
            description="Campo de texto com múltiplos gatilhos configuráveis (ex.: '@' para consultores e '#' para pedidos), busca sem acentos em tempo real, navegação por teclado e contador de caracteres."
          />

          <DemoCard id="mentions-field-demo" title="Digite '@' para mencionar consultores ou '#' para vincular pedidos">
            <MentionsShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── ColorPickerField ─────────────────────────────────────────── */}
        <section id="color-picker-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Seletor de Cor"
            title="ColorPickerField"
            description="Seletor de cores com paleta de swatches rápidos, input HEX validado, seletor nativo e botão de cópia rápida."
          />

          <DemoCard id="color-picker-demo" title="Personalização de Cor de Destaque & Paleta">
            <ColorPickerShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── CascaderField ────────────────────────────────────────────── */}
        <section id="cascader-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Seleção Hierárquica"
            title="CascaderField (Colunas Encadeadas)"
            description="Seletor multi-nível em colunas encadeadas com suporte a seleção única ou múltipla (checkboxes), busca instantânea sem acentos em toda a árvore e abertura por clique ou hover."
          />

          <DemoCard id="cascader-demo" title="Praça → Cidade → Filial (RO/AM) & Seleção Múltipla de Ambientes">
            <CascaderShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── TreeSelectField ──────────────────────────────────────────── */}
        <section id="tree-select-field" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Seleção Hierárquica"
            title="TreeSelectField (Árvore em Dropdown)"
            description="Dropdown em árvore expansível com busca que revela ancestrais automaticamente, ícones de pasta, seleção única ou múltipla com checkboxes em cascata (treeCheckable) e estado indeterminado."
          />

          <DemoCard id="tree-select-demo" title="Centro de Custo / Departamentos & Seleção Múltipla em Cascata">
            <TreeSelectShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── FileDropzone ─────────────────────────────────────────────── */}
        <section id="file-dropzone" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Upload Avançado"
            title="FileDropzone"
            description="Zona de arrastar e soltar arquivos/pastas com colagem da área de transferência (Ctrl+V), validação de formato e tamanho máximo, miniaturas de imagem e fila de upload com barra de progresso individual e retentativa."
          />

          <DemoCard id="file-dropzone-demo" title="Fila de Upload com Progresso Simulado & Miniaturas">
            <FileDropzoneShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SignaturePad & SignatureField ────────────────────────────── */}
        <section id="signature-pad" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Captura Digital"
            title="SignaturePad & SignatureField"
            description="Quadro de assinatura manuscrita em HTML5 Canvas de alta densidade (Retina/DPR) com suavização por curvas quadráticas de Bézier, seleção de cor/espessura da caneta, desfazer traço e exportação em PNG ou SVG."
          />

          <DemoCard id="signature-pad-demo" title="Canhoto Digital de Entrega e Montagem">
            <SignaturePadShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── InlineEdit ───────────────────────────────────────────────── */}
        <section id="inline-edit" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Edição Rápida"
            title="InlineEdit"
            description="Edição in-loco com um clique (ou duplo clique) para títulos, preços, observações e seletores de status, com suporte a salvamento assíncrono, spinner e confirmação por Enter / cancelamento por Esc."
          />

          <DemoCard id="inline-edit-demo" title="Clique em qualquer valor abaixo para editar in-loco">
            <InlineEditShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── FieldSet & FieldGroup ────────────────────────────────────── */}
        <section id="field-set" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Semântica"
            title="FieldSet, FieldLegend & ZodFormField"
            description="Primitivos semânticos para agrupamento de campos (<FieldSet>, <FieldLegend>, <FieldGroup>) e auto-binding declarativo (<ZodFormField>) integrado ao ZodForm."
          />

          <DemoCard
            id="field-set-demo"
            title="Agrupamento Semântico de Configuração de Ambiente"
          >
            <FieldSet>
              <FieldLegend>
                Configuração do Ambiente de Deploy
              </FieldLegend>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Defina a região primária, contato de alerta e janela de manutenção programada.
              </p>
              <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <TextField
                  label="Região Cloud"
                  defaultValue="sa-east-1 (São Paulo)"
                />
                <TextField
                  label="Webhook / Contato On-Call"
                  defaultValue="ops@lopes-ui.dev"
                />
                <SelectField
                  label="Janela de Manutenção"
                  defaultValue="madrugada"
                  options={[
                    { value: "madrugada", label: "Madrugada (02h às 05h)" },
                    { value: "domingo", label: "Domingo (00h às 04h)" },
                  ]}
                />
              </FieldGroup>
            </FieldSet>
          </DemoCard>
        </section>
      </div>
    </main>
  );
}

function RadioGroupShowcaseDemo() {
  const [plano, setPlano] = React.useState("pro");
  const [modalidade, setModalidade] = React.useState("entrega-montagem");
  const [voltagem, setVoltagem] = React.useState("127v");
  const [ciclo, setCiclo] = React.useState("anual");

  return (
    <div className="space-y-6">
      <RadioGroupField
        label="Plano de Infraestrutura (variant='cards')"
        variant="cards"
        columns={3}
        value={plano}
        onChange={setPlano}
        options={[
          {
            value: "starter",
            label: "Starter — Projetos Iniciais",
            description:
              "Até 3 ambientes, builds automáticos e métricas essenciais.",
          },
          {
            value: "pro",
            label: "Pro — Equipes em Escala",
            description:
              "Ambientes ilimitados, RBAC granular e auditoria de logs por 90 dias.",
          },
          {
            value: "enterprise",
            label: "Enterprise — Missão Crítica",
            description:
              "Cluster dedicado, SLA de 99,99% e suporte prioritário 24/7.",
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        <RadioGroupField
          variant="buttons"
          label="Modalidade Logística (variant='buttons' · Outline)"
          value={modalidade}
          onChange={setModalidade}
          options={[
            { value: "retirada", label: "Retirar na Loja" },
            { value: "entrega", label: "Apenas Entrega" },
            { value: "entrega-montagem", label: "Entrega + Montagem" },
          ]}
        />

        <RadioGroupField
          variant="buttons-solid"
          label="Tensão do Eletrodoméstico (variant='buttons-solid' · Solid)"
          value={voltagem}
          onChange={setVoltagem}
          options={[
            { value: "127v", label: "127V (RO / AM)" },
            { value: "220v", label: "220V" },
            { value: "bivolt", label: "Bivolt Automático" },
          ]}
        />
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        <RadioGroupField
          label="Ciclo de Faturamento (direction='horizontal')"
          direction="horizontal"
          value={ciclo}
          onChange={setCiclo}
          options={[
            { value: "mensal", label: "Mensal (Sem fidelidade)" },
            { value: "trimestral", label: "Trimestral (-10% OFF)" },
            { value: "anual", label: "Anual (-20% OFF)" },
          ]}
        />
      </div>
    </div>
  );
}

function SliderShowcaseDemo() {
  const [cpuLimit, setCpuLimit] = React.useState(65);
  const [faixaMemoria, setFaixaMemoria] = React.useState<[number, number]>([
    1024, 4096,
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
        <SliderField
          label="Gatilho de Auto-Scaling de CPU (%)"
          min={20}
          max={95}
          step={5}
          value={cpuLimit}
          onChange={setCpuLimit}
          formatValue={(v) => `${v}%`}
          marks={[
            { value: 20, label: "20%" },
            { value: 50, label: "50%" },
            { value: 75, label: "75% (Ideal)" },
            { value: 95, label: "95%" },
          ]}
        />
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
        <SliderField
          label="Alocação de Memória RAM (MB)"
          min={512}
          max={8192}
          step={256}
          value={faixaMemoria}
          onChange={setFaixaMemoria}
          formatValue={(v) => `${v} MB`}
          marks={[
            { value: 512, label: "512 MB" },
            { value: 4096, label: "4 GB" },
            { value: 8192, label: "8 GB" },
          ]}
        />
      </div>
    </div>
  );
}

function DateRangeShowcaseDemo() {
  const [range, setRange] = React.useState<DateRangeValue>({
    start: "2026-10-01",
    end: "2026-10-28",
  });
  return (
    <div className="max-w-md">
      <DateRangePickerField
        label="Período de Apuração de Métricas"
        value={range}
        onChange={setRange}
        hint="Selecione a data inicial e final ou utilize os atalhos laterais."
      />
    </div>
  );
}

function RatingShowcaseDemo() {
  const [nota, setNota] = React.useState(4.5);
  const [satisfacao, setSatisfacao] = React.useState(5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 flex flex-col justify-between">
        <RatingField
          label="Experiência DX (Meia-estrela)"
          allowHalf
          value={nota}
          onChange={setNota}
          showValue
          tooltips={["Ruim", "Regular", "Bom", "Muito Bom", "Excelente"]}
          helpText="Clique na metade esquerda ou direita da estrela."
        />
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 flex flex-col justify-between">
        <RatingField
          label="Satisfação com a Documentação"
          shape="heart"
          tone="rose"
          value={satisfacao}
          onChange={setSatisfacao}
          showValue
          helpText="Ícone de coração com preenchimento suave."
        />
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 flex flex-col justify-between space-y-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Somente Leitura (Resumo)
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Lopes UI Design System
          </p>
          <Rating value={4.8} allowHalf readOnly showValue size="sm" />
          <p className="text-xs text-zinc-500">
            Baseado em 142 avaliações da comunidade
          </p>
        </div>
      </div>
    </div>
  );
}

function FilterChipsShowcaseDemo() {
  const [categoria, setCategoria] = React.useState<string>("ui");
  const [regioes, setRegioes] = React.useState<string[]>(["sa-east", "us-east"]);

  return (
    <div className="space-y-6">
      <FilterChips
        label="Categoria de Componentes (Single com colapso automático)"
        collapseUnselected
        value={categoria}
        onChange={(v) => setCategoria(v || "")}
        options={[
          { value: "ui", label: "Interface & Layout", count: 32 },
          { value: "forms", label: "Formulários & Inputs", count: 24 },
          { value: "data", label: "Tabelas & Dados", count: 14 },
          { value: "nav", label: "Navegação", count: 12 },
        ]}
      />

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        <FilterChips
          label="Regiões de Deploy Ativas (Multi-select)"
          multiple
          value={regioes}
          onChange={setRegioes}
          options={[
            { value: "sa-east", label: "SA-East (São Paulo)", count: 4 },
            { value: "us-east", label: "US-East (N. Virginia)", count: 3 },
            { value: "eu-west", label: "EU-West (Dublin)", count: 2 },
            { value: "ap-south", label: "AP-South (Tokyo)", count: 1 },
          ]}
        />
      </div>
    </div>
  );
}


function TextFieldMasksDemo() {
  const [doc, setDoc] = React.useState("04821953210");
  const [foneRo, setFoneRo] = React.useState("69992451820");
  const [foneAm, setFoneAm] = React.useState("92981143300");
  const [cep, setCep] = React.useState("76801084");
  const [placa, setPlaca] = React.useState("NDE4B92");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <TextField
        variant="contained"
        label="CPF ou CNPJ (Auto)"
        mask="cpf-cnpj"
        value={doc}
        onValueChange={(formatted) => setDoc(formatted)}
        placeholder="000.000.000-00"
      />
      <TextField
        variant="contained"
        label="WhatsApp Rondônia"
        mask="phone"
        value={foneRo}
        onValueChange={(formatted) => setFoneRo(formatted)}
        placeholder="(69) 99999-9999"
      />
      <TextField
        variant="contained"
        label="WhatsApp Amazonas"
        mask="phone"
        value={foneAm}
        onValueChange={(formatted) => setFoneAm(formatted)}
        placeholder="(92) 99999-9999"
      />
      <TextField
        variant="contained"
        label="CEP de Entrega (RO)"
        mask="cep"
        value={cep}
        onValueChange={(formatted) => setCep(formatted)}
        placeholder="76800-000"
      />
      <TextField
        variant="contained"
        label="Placa Caminhão Baú"
        mask="plate"
        value={placa}
        onValueChange={(formatted) => setPlaca(formatted)}
        placeholder="ABC1D23"
      />
    </div>
  );
}

function CurrencyFieldShowcaseDemo() {
  const [valorEstofado, setValorEstofado] = React.useState<number | null>(3490.0);
  const [valorEletro, setValorEletro] = React.useState<number | null>(4299.9);
  const [moeda, setMoeda] = React.useState("BRL");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <CurrencyField
        label="Valor do Conjunto de Estofados (Multi-Moedas)"
        value={valorEstofado}
        onChange={setValorEstofado}
        currency={moeda}
        onCurrencyChange={setMoeda}
        currencies={[
          { code: "BRL", label: "R$ BRL" },
          { code: "USD", label: "$ USD" },
          { code: "EUR", label: "€ EUR" },
        ]}
        helpText="Troque a moeda no seletor integrado à esquerda."
      />

      <CurrencyField
        variant="contained"
        label="Geladeira Frost Free Inverter 450L (variant='contained')"
        value={valorEletro}
        onChange={setValorEletro}
        currency="BRL"
        helpText="Variante Contained com rótulo interno."
      />
    </div>
  );
}

function ColorPickerShowcaseDemo() {
  const [accentColor, setAccentColor] = React.useState("#4f46e5");
  const [badgeColor, setBadgeColor] = React.useState("#059669");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ColorPickerField
        label="Cor Primária do Catálogo Digital"
        value={accentColor}
        onChange={setAccentColor}
        helpText="Clique nos swatches rápidos ou no conta-gotas para escolher uma cor customizada."
      />
      <ColorPickerField
        label="Cor do Selo de Pronta Entrega (RO / AM)"
        value={badgeColor}
        onChange={setBadgeColor}
        helpText="Validação HEX automática e botão de cópia rápida."
      />
    </div>
  );
}

function TagsInputShowcaseDemo() {
  const [projectTags, setProjectTags] = React.useState<string[]>([
    "Sala de Estar",
    "Molas Ensacadas",
    "Inverter 127V",
  ]);
  const [tags, setTags] = React.useState<string[]>([
    "Montagem Inclusa",
    "Entrega Agendada",
    "127V Conferido",
  ]);
  const [ambientes, setAmbientes] = React.useState<string[]>(["sala", "cozinha"]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TagInputField
          label="Modo Input c/ Sugestões (TagInputField / mode='input')"
          value={projectTags}
          onChange={setProjectTags}
          maxTags={6}
          suggestions={["Porto Velho (RO)", "Manaus (AM)", "Pronta Entrega", "Garantia 12m", "Frete Próprio"]}
          helpText="Digite e pressione Enter ou vírgula, ou clique nas sugestões abaixo."
        />

        <TagsInput
          mode="inline-add"
          color="primary"
          label="Modo Inline-Add ('+ Nova Etiqueta' + Duplo-clique para editar)"
          addButtonLabel="Nova Etiqueta"
          value={tags}
          onChange={setTags}
          helpText="Clique em '+ Nova Etiqueta' ou dê duplo-clique em qualquer tag para renomeá-la."
        />
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Filtro Rápido por Ambiente (CheckableTagGroup)
        </span>
        <CheckableTagGroup
          color="primary"
          value={ambientes}
          onChange={setAmbientes}
          options={[
            { value: "sala", label: "Sala de Estar" },
            { value: "quarto", label: "Quarto & Colchões" },
            { value: "cozinha", label: "Cozinha" },
            { value: "lavanderia", label: "Lavanderia" },
            { value: "eletro", label: "Eletroportáteis" },
          ]}
        />
        <p className="text-xs text-zinc-500">
          Ambientes ativos: {ambientes.length > 0 ? ambientes.join(", ") : "Nenhum"}
        </p>
      </div>
    </div>
  );
}

function MentionsShowcaseDemo() {
  const [note, setNote] = React.useState(
    "Favor priorizar agendamento de montagem com @rafael.manaus referente ao pedido #PED-69042 (Sofá Retrátil + Geladeira 127V)."
  );

  return (
    <MentionsField
      label="Observação Interna do Pedido — Digite '@' para consultores ou '#' para pedidos"
      prefix={["@", "#"]}
      value={note}
      onChange={setNote}
      showCount
      maxLength={280}
      options={{
        "@": [
          { value: "rafael.manaus", label: "Rafael Nascimento", description: "Consultor Sênior · Manaus (AM)", badge: "DDD 92" },
          { value: "mariana.pvh", label: "Mariana Costa", description: "Supervisora Showroom · Porto Velho (RO)", badge: "DDD 69" },
          { value: "equipe.montagem", label: "Equipe de Montagem", description: "Rota Norte RO/AM", badge: "Logística" },
        ],
        "#": [
          { value: "PED-69042", label: "PED-69042 — Sofá Retrátil 3L + Geladeira 450L", description: "Porto Velho (RO) · R$ 7.789,90" },
          { value: "PED-92115", label: "PED-92115 — Colchão King Pocket + Guarda-Roupa", description: "Manaus (AM) · R$ 6.190,00" },
          { value: "PED-69055", label: "PED-69055 — Cozinha Modulada + Fogão 5 Bocas", description: "Ji-Paraná (RO) · R$ 4.580,00" },
        ],
      }}
    />
  );
}

function RichTextNextGenDemo() {
  return (
    <RichTextEditor
      showCount
      allowSourceView
      stickyToolbar
      variables={[
        { key: "cliente_nome", label: "Nome do Cliente", category: "Cliente", example: "Mariana Oliveira" },
        { key: "filial_praça", label: "Filial / Praça", category: "Unidade", example: "Porto Velho - RO" },
        { key: "pedido_codigo", label: "Código do Pedido", category: "Pedido", example: "PED-69042" },
        { key: "data_entrega", label: "Data da Entrega", category: "Logística", example: "05/11/2026" },
      ]}
      snippets={[
        {
          id: "garantia-estofado",
          title: "Cláusula de Garantia — Estofados & Colchões",
          category: "Pós-Venda",
          description: "Cobertura estrutural e orientações de conservação",
          html: "<div data-callout='' data-type='success'><p><strong>Garantia Oficial Móveis &amp; Eletro:</strong> Cobertura integral de estrutura e espuma conforme certificado do fabricante, com assistência técnica dedicada em Rondônia e Amazonas.</p></div>",
        },
        {
          id: "checklist-eletro",
          title: "Checklist de Entrega — Eletrodomésticos",
          category: "Logística",
          description: "Conferência de voltagem e desembalagem assistida",
          html: "<ul data-type='taskList'><li data-type='taskItem' data-checked='true'><p>Conferir integridade da embalagem no ato do recebimento</p></li><li data-type='taskItem' data-checked='false'><p>Validar tensão elétrica local (127V / 220V) antes de ligar</p></li></ul>",
        },
      ]}
      defaultValue="<h2>Proposta Comercial — Ambientes Planejados &amp; Eletro</h2><p>Olá <span data-merge-tag='cliente_nome'>{{cliente_nome}}</span>, preparamos o orçamento completo para renovar sua sala e cozinha na unidade <span data-merge-tag='filial_praça'>{{filial_praça}}</span>.</p><div data-callout='' data-type='info'><p><strong>Dica interativa:</strong> Selecione qualquer palavra para abrir o <em>Bubble Menu</em> flutuante, digite <code>/</code> em uma nova linha para abrir os <em>Slash Commands</em> ou digite <code>{{</code> para inserir variáveis dinâmicas.</p></div><ul><li><strong>Sala de Estar:</strong> Sofá Retrátil 3 Lugares em Veludo + Painel Ripado para TV 75&quot;</li><li><strong>Cozinha &amp; Lavanderia:</strong> Geladeira Frost Free Inverter 450L + Lava e Seca 11kg</li></ul>"
      placeholder="Digite '/' para inserir blocos ou '{{' para variáveis..."
    />
  );
}

function SegmentedControlShowcaseDemo() {
  const [depto, setDepto] = React.useState("estofados");
  const [periodo, setPeriodo] = React.useState("30d");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-500">
          Departamentos da Loja (fullWidth + badges)
        </span>
        <SegmentedControl
          fullWidth
          value={depto}
          onChange={setDepto}
          data={[
            { value: "estofados", label: "Salas & Estofados", badge: "48" },
            { value: "quartos", label: "Colchões & Quartos", badge: "36" },
            { value: "eletro", label: "Eletrodomésticos", badge: "64" },
            { value: "cozinhas", label: "Cozinhas & Lavanderia", badge: "29" },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-zinc-500">
            Variante Primary (Pill arredondado)
          </span>
          <SegmentedControl
            variant="primary"
            radius="full"
            size="sm"
            value={periodo}
            onChange={setPeriodo}
            data={[
              { value: "7d", label: "7 dias" },
              { value: "30d", label: "30 dias" },
              { value: "90d", label: "Trimestre" },
              { value: "12m", label: "Anual" },
            ]}
          />
        </div>

        <p className="text-xs text-zinc-500">
          Filtro ativo: <strong className="text-zinc-800 dark:text-zinc-200">{depto}</strong> ·{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">{periodo}</strong>
        </p>
      </div>
    </div>
  );
}

function FileDropzoneShowcaseDemo() {
  const [count, setCount] = React.useState(0);

  const simulateUpload = async (_file: File, onProgress: (pct: number) => void) => {
    for (const step of [20, 45, 75, 100]) {
      await new Promise((r) => setTimeout(r, 220));
      onProgress(step);
    }
  };

  return (
    <div className="space-y-3">
      <FileDropzone
        accept="image/*,.pdf,.xml"
        maxSize={10 * 1024 * 1024}
        maxFiles={6}
        onUpload={simulateUpload}
        onChange={(_files: File[], items: FileDropzoneItem[]) => setCount(items.length)}
        title="Arraste fotos da entrega/montagem, DANFE (.pdf) ou XML da NF-e"
        description="Suporta imagens PNG/JPG, PDF e XML até 10 MB cada (ou cole com Ctrl+V)"
      />
      {count > 0 && (
        <p className="text-xs text-zinc-500">
          {count} arquivo(s) na fila de conferência logística.
        </p>
      )}
    </div>
  );
}

function SignaturePadShowcaseDemo() {
  const [assinatura, setAssinatura] = React.useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <SignatureField
        label="Assinatura do Recebedor no Ato da Montagem"
        required
        value={assinatura}
        onChange={setAssinatura}
        signerName="Mariana Oliveira"
        signerDocument="Pedido #PED-69042 · Porto Velho - RO"
        helpText="Assine utilizando o mouse, caneta stylus ou tela sensível ao toque."
      />

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Comprovante Capturado (Tempo Real)
        </p>
        {assinatura ? (
          <div className="space-y-2">
            <div className="rounded-xl bg-white p-3 border border-zinc-200 flex items-center justify-center min-h-[120px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assinatura}
                alt="Prévia da assinatura capturada"
                className="max-h-28 object-contain"
              />
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Assinatura digital validada e pronta para anexar ao canhoto de entrega.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[140px] text-center text-xs text-zinc-400">
            Desenhe uma rubrica no quadro ao lado para visualizar o PNG exportado em alta definição.
          </div>
        )}
      </div>
    </div>
  );
}

function InlineEditShowcaseDemo() {
  const [produto, setProduto] = React.useState("Sofá Retrátil & Reclinável Imperial 3 Lugares — Linho Bege");
  const [preco, setPreco] = React.useState("3490");
  const [filial, setFilial] = React.useState("pvh");
  const [obs, setObs] = React.useState("Entrega agendada para sábado pela manhã com montagem inclusa.");

  const filialLabels: Record<string, string> = {
    pvh: "Porto Velho — Centro (RO)",
    jpr: "Ji-Paraná — Dom Bosco (RO)",
    mao: "Manaus — Cidade Nova (AM)",
    itc: "Itacoatiara — Centro (AM)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Título do Produto (Texto c/ salvamento assíncrono)
        </span>
        <InlineEdit
          size="lg"
          value={produto}
          onSave={async (next) => {
            await new Promise((r) => setTimeout(r, 350));
            setProduto(next);
            toast.success("Título atualizado!");
          }}
        />
      </div>

      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Preço à Vista (Numérico c/ formatDisplay)
        </span>
        <InlineEdit
          type="number"
          size="lg"
          value={preco}
          formatDisplay={(v) =>
            Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          }
          onSave={(next) => {
            setPreco(next);
            toast.success("Preço atualizado!");
          }}
        />
      </div>

      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          CD / Filial de Expedição (Select)
        </span>
        <InlineEdit
          type="select"
          value={filial}
          options={[
            { value: "pvh", label: "Porto Velho — Centro (RO)" },
            { value: "jpr", label: "Ji-Paraná — Dom Bosco (RO)" },
            { value: "mao", label: "Manaus — Cidade Nova (AM)" },
            { value: "itc", label: "Itacoatiara — Centro (AM)" },
          ]}
          formatDisplay={(v) => filialLabels[v] ?? v}
          onSave={setFilial}
        />
      </div>

      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Instrução Logística (Textarea)
        </span>
        <InlineEdit type="textarea" value={obs} onSave={setObs} />
      </div>
    </div>
  );
}

const REGIONAL_BRANCH_OPTIONS: CascaderOption[] = [
  {
    value: "ro",
    label: "Rondônia (RO · DDD 69)",
    children: [
      {
        value: "pvh",
        label: "Porto Velho",
        children: [
          { value: "pvh-centro", label: "Showroom Centro — Sete de Setembro", description: "Móveis & Eletro Completo" },
          { value: "pvh-jatuarana", label: "Unidade Sul — Jatuarana", description: "Estofados & Colchões" },
          { value: "cd-pvh", label: "CD Logístico Porto Velho", description: "Expedição & Montagem" },
        ],
      },
      {
        value: "jpr",
        label: "Ji-Paraná",
        children: [
          { value: "jpr-centro", label: "Filial Centro — 1º Distrito" },
          { value: "jpr-dombosco", label: "Filial Dom Bosco — 2º Distrito" },
        ],
      },
      {
        value: "ari",
        label: "Ariquemes",
        children: [
          { value: "ari-jamari", label: "Filial Av. Jamari" },
        ],
      },
    ],
  },
  {
    value: "am",
    label: "Amazonas (AM · DDD 92)",
    children: [
      {
        value: "mao",
        label: "Manaus",
        children: [
          { value: "mao-cidadenova", label: "Megaloja Cidade Nova", description: "Showroom 2 Andares" },
          { value: "mao-centro", label: "Filial Eduardo Ribeiro" },
          { value: "cd-mao", label: "CD Distrital Manaus", description: "Linha Branca & Dormitórios" },
        ],
      },
      {
        value: "itc",
        label: "Itacoatiara",
        children: [
          { value: "itc-centro", label: "Filial Centro — Av. Parque" },
        ],
      },
    ],
  },
];

const CATALOG_CASCADER_OPTIONS: CascaderOption[] = [
  {
    value: "moveis",
    label: "Móveis & Ambientes",
    children: [
      {
        value: "salas",
        label: "Sala de Estar",
        children: [
          { value: "sofa-retratil", label: "Sofá Retrátil & Reclinável" },
          { value: "painel-tv", label: "Painel Ripado & Rack TV" },
        ],
      },
      {
        value: "quartos",
        label: "Quarto & Colchões",
        children: [
          { value: "colchao-molas", label: "Colchão Molas Ensacadas" },
          { value: "guarda-roupa", label: "Guarda-Roupa 6 Portas" },
        ],
      },
    ],
  },
  {
    value: "eletro",
    label: "Eletrodomésticos",
    children: [
      {
        value: "cozinha",
        label: "Cozinha",
        children: [
          { value: "geladeira-inverter", label: "Geladeira Frost Free Inverter" },
          { value: "fogao-5bocas", label: "Fogão 5 Bocas Mesa de Vidro" },
        ],
      },
      {
        value: "lavanderia",
        label: "Lavanderia",
        children: [
          { value: "lava-seca", label: "Lava e Seca 11kg Inverter" },
        ],
      },
    ],
  },
];

function CascaderShowcaseDemo() {
  const [filialPath, setFilialPath] = React.useState<string[]>(["ro", "pvh", "pvh-centro"]);
  const [linhas, setLinhas] = React.useState<string[][]>([
    ["moveis", "salas", "sofa-retratil"],
    ["eletro", "cozinha", "geladeira-inverter"],
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <CascaderField
        label="Unidade de Faturamento & Expedição (Single)"
        options={REGIONAL_BRANCH_OPTIONS}
        value={filialPath}
        onChange={(next) => setFilialPath(next)}
        helpText="Navegue pelas colunas ou pesquise sem acentos (ex: 'manaus', 'jatuarana')."
      />

      <CascaderField
        multiple
        expandTrigger="hover"
        maxTagCount={2}
        label="Linhas em Campanha Promocional (Multiple + Hover)"
        options={CATALOG_CASCADER_OPTIONS}
        value={linhas}
        onChange={(next) => setLinhas(next)}
        helpText="Passe o mouse sobre as categorias e marque múltiplos itens."
      />
    </div>
  );
}

const COST_CENTER_TREE_DATA: TreeSelectNode[] = [
  {
    value: "comercial",
    label: "Diretoria Comercial — Varejo Casa",
    selectable: false,
    children: [
      {
        value: "dept-estofados",
        label: "Salas & Estofados",
        children: [
          { value: "cc-sofas", label: "CC-101 · Sofás Retráteis & Poltronas" },
          { value: "cc-paineis", label: "CC-102 · Painéis Ripados & Mesas de Jantar" },
        ],
      },
      {
        value: "dept-dormitorios",
        label: "Colchões & Dormitórios",
        children: [
          { value: "cc-colchoes", label: "CC-201 · Colchões Pocket & Box Conjugado" },
          { value: "cc-roupeiros", label: "CC-202 · Guarda-Roupas & Cômodas" },
        ],
      },
      {
        value: "dept-eletro",
        label: "Eletrodomésticos & Linha Branca",
        children: [
          { value: "cc-refrigeracao", label: "CC-301 · Refrigeradores & Freezers" },
          { value: "cc-lavanderia", label: "CC-302 · Lavadoras & Lava e Seca" },
        ],
      },
    ],
  },
  {
    value: "logistica",
    label: "Operações & Montagem (RO / AM)",
    selectable: false,
    children: [
      { value: "frota-ro", label: "CC-401 · Frota & Montadores Rondônia (69)" },
      { value: "frota-am", label: "CC-402 · Frota & Montadores Amazonas (92)" },
    ],
  },
];

function TreeSelectShowcaseDemo() {
  const [singleNode, setSingleNode] = React.useState("cc-sofas");
  const [checkedNodes, setCheckedNodes] = React.useState<string[]>([
    "cc-sofas",
    "cc-paineis",
    "frota-ro",
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <TreeSelectField
        label="Centro de Custo Principal (Single + Pastas)"
        treeData={COST_CENTER_TREE_DATA}
        value={singleNode}
        onChange={(val) => setSingleNode(val)}
        treeDefaultExpandedKeys={["comercial", "dept-estofados"]}
        helpText="Pastas intermediárias com selectable=false expandem ao clicar."
      />

      <TreeSelectField
        treeCheckable
        maxTagCount={2}
        label="Escopo do Relatório Gerencial (treeCheckable em Cascata)"
        treeData={COST_CENTER_TREE_DATA}
        value={checkedNodes}
        onChange={(vals) => setCheckedNodes(vals)}
        treeDefaultExpandedKeys={["comercial", "logistica"]}
        helpText="Marcar um departamento seleciona todos os seus centros de custo automaticamente."
      />
    </div>
  );
}
