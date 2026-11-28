"use client";

import React, { useMemo, useState } from "react";
import { z } from "zod";
import { CheckCircle2, ChevronDown, Store } from "lucide-react";
import AccessGuard, { AccessDeniedState } from "@/components/AccessGuard";
import ActiveTimerWidget from "@/components/ActiveTimerWidget";
import AnimatedNumber from "@/components/AnimatedNumber";
import Button from "@/components/Button";
import CameraCaptureModal from "@/components/CameraCaptureModal";
import Can from "@/components/Can";
import ChatComposer from "@/components/ChatComposer";
import ChatConversationItem from "@/components/ChatConversationItem";
import ChatMessage from "@/components/ChatMessage";
import ChatWindow from "@/components/ChatWindow";
import CnpjLookupModal from "@/components/CnpjLookupModal";
import CodeBlock from "@/components/CodeBlock";
import EmailComposer from "@/components/EmailComposer";
import ErrorBoundary from "@/components/ErrorBoundary";
import AutocompleteField from "@/components/form/AutocompleteField";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import ColorPickerField from "@/components/form/ColorPickerField";
import DateField from "@/components/form/DateField";
import DateRangePickerField from "@/components/form/DateRangePickerField";
import FieldWrapper from "@/components/form/FieldWrapper";
import FileField from "@/components/form/FileField";
import FilterChips from "@/components/form/FilterChips";
import Form, { FormRow, FormSection } from "@/components/form/Form";
import InputGroup, { InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/form/InputGroup";
import MentionsField from "@/components/form/MentionsField";
import MonthPickerField from "@/components/form/MonthPickerField";
import MultiSelectField from "@/components/form/MultiSelectField";
import NativeSelect from "@/components/form/NativeSelect";
import RadioGroupField from "@/components/form/RadioGroupField";
import TagInputField from "@/components/form/TagInputField";
import TextField from "@/components/form/TextField";
import TimeField from "@/components/form/TimeField";
import TimePickerField from "@/components/form/TimePickerField";
import ZodForm, { ZodFormField } from "@/components/form/ZodForm";
import InlineEdit from "@/components/InlineEdit";
import {
  IsometricBench,
  IsometricShowcase,
  combinePresets,
  createPalletBoxesPreset,
  createTerminalPreset,
  makeScene,
  type IsometricShowcaseStep,
} from "@/components/isometric";
import LeaderboardPodium from "@/components/LeaderboardPodium";
import LoginForm from "@/components/LoginForm";
import Marquee from "@/components/Marquee";
import MotionCollapse from "@/components/MotionCollapse";
import NotificationBell, { type NotificationItem } from "@/components/NotificationBell";
import OTPInput from "@/components/OTPInput";
import PasswordStrength from "@/components/PasswordStrength";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextField from "@/components/RichTextField";
import RichTextViewer from "@/components/RichTextViewer";
import ScopeSelector from "@/components/ScopeSelector";
import SmartObject from "@/components/SmartObject";
import Snippet from "@/components/Snippet";
import StaggerList, { StaggerItem } from "@/components/StaggerList";
import TenantSwitcherModal, { TenantSwitcherTrigger } from "@/components/TenantSwitcherModal";
import TextRotate from "@/components/TextRotate";
import toast from "@/components/Toast";
import Tour from "@/components/Tour";
import type { UICanvasElement } from "./types";

function asStr(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  return fallback;
}
function asNum(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}
function asBool(val: unknown, fallback = false): boolean {
  return typeof val === "boolean" ? val : fallback;
}

const DEMO_ZOD_SCHEMA = z.object({
  cliente: z.string().min(3, "Informe ao menos 3 caracteres"),
  filial: z.string().min(2, "Informe a filial RO/AM"),
});

const DEMO_NOTIF_REF = new Date("2026-11-26T14:00:00.000Z").getTime();
const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "success",
    title: "NF-e autorizada — Pedido #PED-9041",
    description: "Sofá Retrátil Bari liberado no CD Porto Velho (RO).",
    timestamp: new Date(DEMO_NOTIF_REF - 5 * 60_000),
  },
  {
    id: "n2",
    type: "info",
    title: "Montagem agendada — Manaus (AM)",
    description: "Equipe Cidade Nova confirmada para amanhã às 09:00.",
    timestamp: new Date(DEMO_NOTIF_REF - 40 * 60_000),
  },
];

const DEMO_TENANTS = [
  { id: "ro-pvh", name: "Filial Porto Velho — Centro (RO)", subtitle: "DDD (69) · CD Regional", primary: true },
  { id: "am-mao", name: "Filial Manaus — Cidade Nova (AM)", subtitle: "DDD (92) · Filial Norte" },
  { id: "ro-jpr", name: "Filial Ji-Paraná — Av. Brasil (RO)", subtitle: "DDD (69) · Filial Interior" },
];

function useDemoIsoScene() {
  return useMemo(() => {
    const terminal = createTerminalPreset({ id: "pdv", x: 60, y: 30, label: "PDV" });
    const pallet = createPalletBoxesPreset({ id: "cd", x: 220, y: 40, label: "CD RO" });
    const parts = combinePresets(terminal, pallet);
    const scene = makeScene({
      parts,
      poses: [
        { ...terminal.pose({ typed: false }), ...pallet.pose({ dispatched: false }) },
        { ...terminal.pose({ typed: true }), ...pallet.pose({ dispatched: true }) },
      ],
      callouts: [],
    });
    const steps: readonly IsometricShowcaseStep[] = [
      { id: "pdv", tag: "01", title: "Pedido no Salão", caption: "Seleção de Móveis & Eletro no PDV das lojas RO/AM." },
      { id: "cd", tag: "02", title: "Expedição CD", caption: "Separação automatizada nos CDs de Porto Velho e Manaus." },
    ];
    return { scene, steps };
  }, []);
}

export interface ExtendedRendererProps {
  element: UICanvasElement;
  interactive: boolean;
}

export default function ExtendedRendererFormsEnterprise({
  element,
  interactive,
}: ExtendedRendererProps) {
  const p = element.props;
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [collapseOpen, setCollapseOpen] = useState(asBool(p.defaultOpen, true));
  const [scopeVal, setScopeVal] = useState<string | number | null>("ro-pvh");
  const [currentTenantId, setCurrentTenantId] = useState<string | number>("ro-pvh");
  const [timerRunning, setTimerRunning] = useState(asBool(p.running, true));
  const [notifs, setNotifs] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const { scene: isoScene, steps: isoSteps } = useDemoIsoScene();

  switch (element.type) {
    // ── Formulários & Inputs ────────────────────────────────────────────────
    case "form":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (interactive) toast.success("Formulário enviado!");
            }}
          >
            <FormSection
              title={asStr(p.sectionTitle, "Cadastro de Cliente")}
              description={asStr(p.sectionDescription)}
            >
              <FormRow columns={2}>
                <TextField size="sm" label="Nome Completo" defaultValue="Raimundo Nonato" />
                <TextField size="sm" label="Telefone (RO/AM)" defaultValue="(69) 99214-3380" />
              </FormRow>
              <div className="pt-2 flex justify-end">
                <Button type="submit" size="sm" variant="primary">
                  {asStr(p.submitLabel, "Salvar")}
                </Button>
              </div>
            </FormSection>
          </Form>
        </div>
      );

    case "zod_form":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {asStr(p.title, "Formulário com Validação Zod")}
          </p>
          <ZodForm
            schema={DEMO_ZOD_SCHEMA}
            defaultValues={{ cliente: "Luciana Albuquerque", filial: "Manaus (AM)" }}
            onSubmit={() => {
              if (interactive) toast.success("Dados validados pelo Zod!");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ZodFormField name="cliente">
                {({ value, onChange, onBlur, error }) => (
                  <TextField
                    size="sm"
                    label="Cliente"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    error={error}
                  />
                )}
              </ZodFormField>
              <ZodFormField name="filial">
                {({ value, onChange, onBlur, error }) => (
                  <TextField
                    size="sm"
                    label="Filial (RO/AM)"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    error={error}
                  />
                )}
              </ZodFormField>
            </div>
            <div className="pt-3 flex justify-end">
              <Button type="submit" size="sm" variant="primary">
                {asStr(p.submitLabel, "Validar & Enviar")}
              </Button>
            </div>
          </ZodForm>
        </div>
      );

    case "field_wrapper":
      return (
        <div className="h-full w-full flex items-center">
          <FieldWrapper
            label={asStr(p.label, "Campo")}
            helpText={asStr(p.helpText) || undefined}
            error={asStr(p.error) || undefined}
            required={asBool(p.required, true)}
            className="w-full"
          >
            <input
              type="text"
              placeholder={asStr(p.placeholder, "Digite...")}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
            />
          </FieldWrapper>
        </div>
      );

    case "native_select":
      return (
        <div className="h-full w-full flex items-center">
          <NativeSelect
            componentId={element.componentId}
            defaultValue={asStr(p.defaultValue, "ro-pvh")}
            wrapperClassName="w-full"
          >
            <option value="ro-pvh">Porto Velho — Centro (RO)</option>
            <option value="am-mao">Manaus — Cidade Nova (AM)</option>
            <option value="ro-jpr">Ji-Paraná — Av. Brasil (RO)</option>
            <option value="ro-arq">Ariquemes — Centro (RO)</option>
          </NativeSelect>
        </div>
      );

    case "multi_select_field":
      return (
        <div className="h-full w-full flex items-center">
          <MultiSelectField
            componentId={element.componentId}
            label={asStr(p.label, "Departamentos")}
            placeholder={asStr(p.placeholder, "Selecione...")}
            searchable={asBool(p.searchable, true)}
            defaultValue={Array.isArray(p.defaultValue) ? (p.defaultValue as string[]) : ["moveis", "eletro"]}
            options={[
              { value: "moveis", label: "Móveis & Estofados" },
              { value: "colchoes", label: "Colchões & Box" },
              { value: "eletro", label: "Eletro & Linha Branca" },
              { value: "cozinhas", label: "Cozinhas Moduladas" },
            ]}
            className="w-full"
          />
        </div>
      );

    case "autocomplete_field":
      return (
        <div className="h-full w-full flex items-center">
          <AutocompleteField
            componentId={element.componentId}
            label={asStr(p.label, "Buscar Produto")}
            placeholder={asStr(p.placeholder, "Digite para buscar...")}
            creatable={asBool(p.creatable, true)}
            options={[
              "Sofá Retrátil Bari 2,90m",
              "Geladeira Frost Free Inverter 474L",
              "Conjunto Box Queen Molas Ensacadas",
              "Guarda-Roupa Casal 6 Portas",
              "Smart TV 55\" 4K UHD",
            ]}
            className="w-full"
          />
        </div>
      );

    case "checkbox_group":
      return (
        <div className="h-full w-full flex items-center">
          <CheckboxGroup
            componentId={element.componentId}
            label={asStr(p.label, "Serviços Adicionais")}
            variant={asStr(p.variant, "card") as "default" | "card" | "button"}
            columns={Math.min(3, Math.max(1, asNum(p.columns, 2))) as 1 | 2 | 3}
            defaultValue={Array.isArray(p.defaultValue) ? (p.defaultValue as string[]) : ["montagem"]}
            options={[
              { value: "montagem", label: "Montagem Especializada" },
              { value: "garantia", label: "Garantia Estendida" },
              { value: "impermeabilizacao", label: "Impermeabilização" },
              { value: "retirada", label: "Retirada de Usado" },
            ]}
            className="w-full"
          />
        </div>
      );

    case "radio_group_field":
      return (
        <div className="h-full w-full flex items-center">
          <RadioGroupField
            componentId={element.componentId}
            label={asStr(p.label, "Modalidade de Entrega")}
            variant={asStr(p.variant, "cards") as "default" | "cards" | "buttons" | "buttons-solid"}
            columns={Math.min(3, Math.max(1, asNum(p.columns, 2))) as 1 | 2 | 3}
            defaultValue={asStr(p.defaultValue, "propria")}
            options={[
              { value: "propria", label: "Entrega Própria RO/AM", description: "Frota própria" },
              { value: "retira", label: "Retirar na Filial", description: "Pronta-entrega em loja" },
            ]}
            className="w-full"
          />
        </div>
      );

    case "date_field":
      return (
        <div className="h-full w-full flex items-center">
          <DateField
            componentId={element.componentId}
            label={asStr(p.label, "Data")}
            mode={asStr(p.mode, "date") as "date" | "datetime" | "month"}
            defaultValue={asStr(p.defaultValue, "2026-11-26")}
            className="w-full"
          />
        </div>
      );

    case "date_range_picker_field":
      return (
        <div className="h-full w-full flex items-center">
          <DateRangePickerField
            componentId={element.componentId}
            label={asStr(p.label, "Período")}
            placeholder={asStr(p.placeholder, "Selecione o período...")}
            clearable={asBool(p.clearable, true)}
            showDefaultPresets={asBool(p.showDefaultPresets, true)}
            className="w-full"
          />
        </div>
      );

    case "time_field":
      return (
        <div className="h-full w-full flex items-center">
          <TimeField
            componentId={element.componentId}
            label={asStr(p.label, "Horário")}
            defaultValue={asStr(p.defaultValue, "17:30")}
            precision={asStr(p.precision, "minutes") as "minutes" | "seconds"}
            className="w-full"
          />
        </div>
      );

    case "time_picker_field":
      return (
        <div className="h-full w-full flex items-center">
          <TimePickerField
            componentId={element.componentId}
            label={asStr(p.label, "Janela de Montagem")}
            defaultValue={asStr(p.defaultValue, "09:00")}
            stepMinutes={asNum(p.stepMinutes, 30)}
            className="w-full"
          />
        </div>
      );

    case "month_picker_field":
      return (
        <div className="h-full w-full flex items-center">
          <MonthPickerField
            componentId={element.componentId}
            label={asStr(p.label, "Competência")}
            defaultValue={asStr(p.defaultValue, "2026-11")}
            className="w-full"
          />
        </div>
      );

    case "input_group":
      return (
        <div className="h-full w-full flex items-center">
          <InputGroup
            componentId={element.componentId}
            label={asStr(p.label, "Buscar Pedido")}
            className="w-full"
          >
            {asStr(p.prefix) && <InputGroupAddon align="inline-start">{asStr(p.prefix)}</InputGroupAddon>}
            <InputGroupInput placeholder={asStr(p.placeholder, "9041")} />
            {asStr(p.buttonLabel) && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={() => interactive && toast.info("Consultando pedido...")}>
                  {asStr(p.buttonLabel)}
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      );

    case "filter_chips":
      return (
        <div className="h-full w-full flex items-center">
          <FilterChips
            componentId={element.componentId}
            label={asStr(p.label, "Filtrar por Linha")}
            defaultValue={asStr(p.defaultValue, "estofados")}
            size={asStr(p.size, "sm") as "xs" | "sm" | "md"}
            options={[
              { value: "estofados", label: "Estofados" },
              { value: "colchoes", label: "Colchões" },
              { value: "eletro", label: "Eletrodomésticos" },
              { value: "cozinhas", label: "Cozinhas" },
            ]}
          />
        </div>
      );

    case "tag_input_field":
      return (
        <div className="h-full w-full flex items-center">
          <TagInputField
            componentId={element.componentId}
            label={asStr(p.label, "Tags do Produto")}
            placeholder={asStr(p.placeholder, "Digite e pressione Enter...")}
            defaultValue={
              Array.isArray(p.defaultValue)
                ? (p.defaultValue as string[])
                : ["Sofá Retrátil", "Pronta Entrega RO"]
            }
            className="w-full"
          />
        </div>
      );

    case "mentions_field":
      return (
        <div className="h-full w-full flex items-center">
          <MentionsField
            componentId={element.componentId}
            label={asStr(p.label, "Observações")}
            placeholder={asStr(p.placeholder)}
            defaultValue={asStr(p.defaultValue)}
            rows={asNum(p.rows, 2)}
            options={[
              { value: "equipe_ro", label: "Equipe Montagem RO (69)" },
              { value: "equipe_am", label: "Equipe Montagem AM (92)" },
              { value: "cd_pvh", label: "CD Porto Velho" },
              { value: "cd_mao", label: "CD Manaus" },
            ]}
            className="w-full"
          />
        </div>
      );

    case "color_picker_field":
      return (
        <div className="h-full w-full flex items-center">
          <ColorPickerField
            componentId={element.componentId}
            label={asStr(p.label, "Cor")}
            defaultValue={asStr(p.defaultValue, "#4f46e5")}
            showCopy={asBool(p.showCopy, true)}
            className="w-full"
          />
        </div>
      );

    case "file_field":
      return (
        <div className="h-full w-full flex items-center">
          <FileField
            componentId={element.componentId}
            label={asStr(p.label, "Anexar Arquivo")}
            buttonLabel={asStr(p.buttonLabel, "Selecionar arquivo")}
            variant={asStr(p.variant, "compact") as "compact" | "drop"}
            accept={asStr(p.accept, ".pdf,.xml,image/*")}
            className="w-full"
          />
        </div>
      );

    case "rich_text_editor":
      return (
        <div className="h-full w-full overflow-auto">
          <RichTextEditor
            placeholder={asStr(p.placeholder)}
            defaultValue={asStr(p.defaultValue)}
            showCount={asBool(p.showCount, true)}
            minHeight="140px"
          />
        </div>
      );

    case "rich_text_field":
      return (
        <div className="h-full w-full overflow-auto">
          <RichTextField
            label={asStr(p.label, "Descrição Comercial")}
            helpText={asStr(p.helpText) || undefined}
            required={asBool(p.required, true)}
            defaultValue={asStr(p.defaultValue)}
            minHeight="140px"
          />
        </div>
      );

    case "rich_text_viewer":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5">
          <RichTextViewer
            componentId={element.componentId}
            html={asStr(p.html, "<p>Lopes ERP</p>")}
          />
        </div>
      );

    case "login_form":
      return (
        <div className="h-full w-full overflow-auto">
          <LoginForm
            title={asStr(p.title, "Acesso Lopes ERP")}
            subtitle={asStr(p.subtitle)}
            submitLabel={asStr(p.submitLabel, "Entrar")}
            showRemember={asBool(p.showRemember, true)}
            onSubmit={async () => {
              if (interactive) toast.success("Autenticado no Lopes ERP!");
            }}
          />
        </div>
      );

    case "otp_input":
      return (
        <div className="h-full w-full flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
          <OTPInput
            componentId={element.componentId}
            length={Math.min(8, Math.max(4, asNum(p.length, 6)))}
            groupSize={asNum(p.groupSize, 3)}
            mask={asBool(p.mask, false)}
            onComplete={(code) => interactive && toast.success(`Código confirmado: ${code}`)}
          />
        </div>
      );

    case "password_strength":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center">
          <PasswordStrength
            componentId={element.componentId}
            password={asStr(p.password, "Lopes@2026")}
            showHint={asBool(p.showHint, true)}
            className="w-full"
          />
        </div>
      );

    case "inline_edit":
      return (
        <div className="h-full w-full flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3">
          <InlineEdit
            defaultValue={asStr(p.defaultValue, "Sofá Retrátil Bari 2,90m")}
            type={asStr(p.type, "text") as "text" | "textarea" | "number" | "select"}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            showActions={asBool(p.showActions, true)}
            onSave={(val) => {
              if (interactive) toast.success(`Valor salvo: ${val}`);
            }}
          />
        </div>
      );

    // ── Comunicação ─────────────────────────────────────────────────────────
    case "chat_window":
      return (
        <div className="h-full w-full overflow-hidden flex items-end justify-center">
          <ChatWindow
            componentId={element.componentId}
            title={asStr(p.title, "Central Atendimento RO & AM")}
            defaultOpen={asBool(p.defaultOpen, true)}
            conversations={[
              {
                id: "pvh",
                name: "Loja Porto Velho (69)",
                online: true,
                unread: 2,
                lastMessage: "Sofá Retrátil Bari reservado no CD!",
                lastMessageTime: "10:25",
                messages: [
                  { senderName: "Camila Souza", content: "Cliente confirmou entrega do Sofá Retrátil Bari amanhã.", timestamp: "10:22", showAvatar: true },
                  { content: "Perfeito! Já incluí na rota da manhã.", mine: true, timestamp: "10:25", status: "read", showAvatar: false },
                ],
              },
              {
                id: "mao",
                name: "Loja Manaus (92)",
                online: true,
                unread: 0,
                lastMessage: "Geladeira Inverter 474L faturada.",
                lastMessageTime: "09:40",
                messages: [
                  { senderName: "Rafael Nascimento", content: "Geladeira Inverter 474L faturada para Cidade Nova.", timestamp: "09:40", showAvatar: true },
                ],
              },
            ]}
          />
        </div>
      );

    case "chat_message":
      return (
        <div className="h-full w-full flex items-center rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-2.5">
          <ChatMessage
            senderName={asStr(p.senderName, "Atendimento Lopes")}
            content={asStr(p.content, "Olá! Como podemos ajudar com seu pedido?")}
            timestamp={asStr(p.timestamp, "10:24")}
            mine={asBool(p.mine, false)}
            status={asStr(p.status, "read") as "sending" | "sent" | "delivered" | "read" | "failed"}
            showAvatar={asBool(p.showAvatar, true)}
          />
        </div>
      );

    case "chat_composer":
      return (
        <div className="h-full w-full flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <ChatComposer
            placeholder={asStr(p.placeholder, "Digite sua mensagem...")}
            variant={asStr(p.variant, "toolbar") as "toolbar" | "minimal"}
            onSend={(msg) => interactive && toast.success(`Mensagem enviada: ${msg}`)}
            className="w-full"
          />
        </div>
      );

    case "chat_conversation_item":
      return (
        <div className="h-full w-full flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1.5">
          <ChatConversationItem
            componentId={element.componentId}
            name={asStr(p.name, "Equipe Montagem RO")}
            lastMessage={asStr(p.lastMessage)}
            timestamp={asStr(p.timestamp, "14:18")}
            unread={asNum(p.unread, 0)}
            online={asBool(p.online, true)}
            active={asBool(p.active, true)}
            pinned={asBool(p.pinned, false)}
            onClick={() => interactive && toast.info(`Conversa: ${asStr(p.name)}`)}
            className="w-full"
          />
        </div>
      );

    case "email_composer":
      return (
        <div className="h-full w-full overflow-auto">
          <EmailComposer
            mode={asStr(p.mode, "inline") as "inline" | "window"}
            title={asStr(p.title, "Nova mensagem")}
            defaultTo={[{ name: "Raimundo Nonato", email: "contato@lopes.app" }]}
            defaultSubject={asStr(p.defaultSubject, "Confirmação de Entrega")}
            defaultBody="<p>Confirmamos o agendamento da entrega e montagem dos seus móveis e eletrodomésticos.</p>"
            onSend={() => {
              if (interactive) toast.success("E-mail enviado!");
            }}
            onDiscard={() => {
              if (interactive) toast.info("Rascunho descartado");
            }}
          />
        </div>
      );

    case "notification_bell":
      return (
        <div className="h-full w-full flex items-center justify-center">
          <NotificationBell
            componentId={element.componentId}
            notifications={notifs}
            onMarkRead={(id) => setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))}
            onMarkAllRead={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
            onDismiss={(id) => setNotifs((prev) => prev.filter((n) => n.id !== id))}
          />
        </div>
      );

    // ── Corporativo & RBAC ──────────────────────────────────────────────────
    case "scope_selector":
      return (
        <div className="h-full w-full flex items-center">
          <ScopeSelector
            componentId={element.componentId}
            value={scopeVal}
            onChange={(v) => setScopeVal(v)}
            allowGlobal={asBool(p.allowGlobal, true)}
            globalLabel={asStr(p.globalLabel, "Todas as Lojas (RO & AM)")}
            sectionLabel={asStr(p.sectionLabel, "Praças & Filiais")}
            variant={asStr(p.variant, "default") as "default" | "inline"}
            options={[
              { id: "ro-pvh", label: "Porto Velho — Centro (RO)", description: "DDD (69)", icon: Store },
              { id: "am-mao", label: "Manaus — Cidade Nova (AM)", description: "DDD (92)", icon: Store },
              { id: "ro-jpr", label: "Ji-Paraná — Av. Brasil (RO)", description: "DDD (69)", icon: Store },
            ]}
          />
        </div>
      );

    case "tenant_switcher_modal": {
      const currentTenant = DEMO_TENANTS.find((t) => t.id === currentTenantId) ?? DEMO_TENANTS[0];
      return (
        <div className="h-full w-full flex items-center">
          <TenantSwitcherTrigger
            componentId={element.componentId}
            currentTenant={currentTenant}
            onClick={() => interactive && setOverlayOpen(true)}
            className="w-full"
          />
          {interactive && (
            <TenantSwitcherModal
              open={overlayOpen}
              onClose={() => setOverlayOpen(false)}
              title={asStr(p.title, "Trocar Filial Ativa")}
              description={asStr(p.description)}
              tenants={DEMO_TENANTS}
              currentTenantId={currentTenantId}
              onSelect={(t) => {
                setCurrentTenantId(t.id);
                setOverlayOpen(false);
                toast.success(`Filial alterada: ${t.name}`);
              }}
            />
          )}
        </div>
      );
    }

    case "cnpj_lookup_modal":
      return (
        <div className="h-full w-full flex items-center">
          <Button
            componentId={element.componentId}
            variant="outline"
            fullWidth
            onClick={() => interactive && setOverlayOpen(true)}
          >
            {asStr(p.triggerLabel, "Consultar CNPJ")}
          </Button>
          {interactive && (
            <CnpjLookupModal
              open={overlayOpen}
              onClose={() => setOverlayOpen(false)}
              title={asStr(p.title, "Consulta de CNPJ")}
              subtitle={asStr(p.subtitle)}
              onLookupCnpj={async (cnpj) => ({
                cnpj,
                legalName: "Lopes Sistemas Corporativos Ltda.",
                tradeName: "Lopes ERP",
                city: "Porto Velho",
                state: "RO",
              })}
              onConfirm={(data) => {
                setOverlayOpen(false);
                toast.success(`CNPJ confirmado: ${data.legalName || data.cnpj}`);
              }}
            />
          )}
        </div>
      );

    case "smart_object":
      return (
        <div className="h-full w-full overflow-auto">
          <SmartObject
            componentId={element.componentId}
            kind={asStr(p.kind, "VENDA") as "VENDA" | "CLIENTE" | "DOCUMENTO" | "PEDIDO" | "CHAMADO"}
            ref_id={asStr(p.ref_id, "PED-9041")}
            title={asStr(p.title, "Proposta Sala + Dormitório")}
            status={asStr(p.status, "analyzing") as "pending" | "analyzing" | "approved" | "rejected" | "warning" | "done"}
            mode={asStr(p.mode, "card") as "chip" | "card"}
            fields={[
              { label: "Filial", value: "Porto Velho (RO)" },
              { label: "Total", value: "R$ 4.890,00", highlight: true },
              { label: "Entrega", value: "Montagem Inclusa" },
            ]}
            actions={[
              {
                id: "ok",
                label: "Aprovar",
                variant: "success",
                onClick: () => {
                  if (interactive) toast.success("Proposta aprovada!");
                },
              },
            ]}
          />
        </div>
      );

    case "active_timer_widget":
      return (
        <div className="h-full w-full flex items-center">
          <ActiveTimerWidget
            componentId={element.componentId}
            inline
            code={asStr(p.code, "OS-6912")}
            title={asStr(p.title, "Montagem Cozinha Modulada")}
            subtitle={asStr(p.subtitle)}
            running={timerRunning}
            elapsedSeconds={asNum(p.elapsedSeconds, 1845)}
            onPause={() => interactive && setTimerRunning(false)}
            onResume={() => interactive && setTimerRunning(true)}
            onStop={() => {
              if (interactive) {
                setTimerRunning(false);
                toast.success("Cronômetro finalizado!");
              }
            }}
            className="w-full"
          />
        </div>
      );

    case "access_guard":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
          {asBool(p.simulateDenied, false) ? (
            <AccessDeniedState
              resourceName={asStr(p.resourceName, "Aprovação de Desconto")}
              title="Acesso restrito por RBAC"
              description="Solicite liberação ao gerente regional (RO/AM)."
            />
          ) : (
            <AccessGuard task={asStr(p.task, "vendas.desconto.aprovar")}>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">
                  Acesso Autorizado ({asStr(p.task)})
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Recurso protegido: {asStr(p.resourceName)}
                </p>
              </div>
            </AccessGuard>
          )}
        </div>
      );

    case "can":
      return (
        <div className="h-full w-full flex items-center">
          <Can task={asStr(p.task, "estoque.transferir.ro_am")}>
            <div className="w-full rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
              {asStr(p.label, "Conteúdo liberado via RBAC")}
            </div>
          </Can>
        </div>
      );

    case "error_boundary":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 flex items-center">
          <ErrorBoundary
            title={asStr(p.title)}
            description={asStr(p.description)}
            retryLabel={asStr(p.retryLabel, "Tentar novamente")}
          >
            <div className="space-y-1 text-xs">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                Área protegida por ErrorBoundary
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                Fallback configurado: &ldquo;{asStr(p.title)}&rdquo;
              </p>
            </div>
          </ErrorBoundary>
        </div>
      );

    case "camera_capture_modal":
      return (
        <div className="h-full w-full flex items-center">
          <Button
            componentId={element.componentId}
            variant="outline"
            fullWidth
            onClick={() => interactive && setOverlayOpen(true)}
          >
            {asStr(p.triggerLabel, "Capturar Foto")}
          </Button>
          {interactive && (
            <CameraCaptureModal
              open={overlayOpen}
              onClose={() => setOverlayOpen(false)}
              title={asStr(p.title, "Capturar Foto")}
              description={asStr(p.description)}
              onCapture={(file) => {
                setOverlayOpen(false);
                toast.success(`Foto capturada: ${file.name}`);
              }}
            />
          )}
        </div>
      );

    // ── Animação & Código ───────────────────────────────────────────────────
    case "code_block":
      return (
        <div className="h-full w-full overflow-auto">
          <CodeBlock
            componentId={element.componentId}
            filename={asStr(p.filename, "PainelLopes.tsx")}
            language={asStr(p.language, "tsx")}
            lineNumbers={asBool(p.lineNumbers, true)}
            showCopy={asBool(p.showCopy, true)}
            code={asStr(p.code, `import { Button } from "lopes-ui";`)}
          />
        </div>
      );

    case "snippet":
      return (
        <div className="h-full w-full flex items-center">
          <Snippet
            componentId={element.componentId}
            code={asStr(p.code, "npx lopes-ui init --all")}
            symbol={asStr(p.symbol, "$")}
            variant={asStr(p.variant, "dark") as "default" | "dark" | "bordered" | "indigo"}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            className="w-full"
          />
        </div>
      );

    case "tour":
      return (
        <div className="h-full w-full overflow-auto flex items-center justify-center">
          <Tour
            componentId={element.componentId}
            defaultStep={asNum(p.defaultStep, 0)}
            finishLabel={asStr(p.finishLabel, "Concluir Tour")}
            onFinish={() => interactive && toast.success("Tour concluído!")}
            steps={[
              {
                title: "Catálogo de Móveis & Eletro",
                badge: "Passo 1",
                description: "Consulte estoque em tempo real nos CDs de Porto Velho (RO) e Manaus (AM).",
              },
              {
                title: "Entrega & Montagem Própria",
                badge: "Passo 2",
                description: "Agende a entrega e acompanhe a equipe de montagem direto pelo ERP.",
              },
            ]}
          />
        </div>
      );

    case "text_rotate": {
      const words = asStr(p.words, "sua Sala,seu Quarto,sua Cozinha,seu Lar")
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
          {asStr(p.prefix) && <span>{asStr(p.prefix)}</span>}
          <TextRotate
            inline
            duration={asNum(p.duration, 2400)}
            items={words.length > 0 ? words : ["seu Lar"]}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>
      );
    }

    case "marquee":
      return (
        <div className="h-full w-full flex items-center overflow-hidden">
          <Marquee
            componentId={element.componentId}
            duration={asNum(p.duration, 24)}
            pauseOnHover={asBool(p.pauseOnHover, true)}
            reverse={asBool(p.reverse, false)}
            fadeEdges={asBool(p.fadeEdges, true)}
          >
            {[
              "Sofás Retráteis & Salas",
              "Colchões Molas Ensacadas",
              "Refrigeradores Inverter",
              "Porto Velho — RO (69)",
              "Manaus — AM (92)",
            ].map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
              >
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>{tag}</span>
              </div>
            ))}
          </Marquee>
        </div>
      );

    case "animated_number":
      return (
        <div className="h-full w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 flex flex-col justify-center">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {asStr(p.label, "Indicador")}
          </span>
          <AnimatedNumber
            value={asNum(p.value, 289450.8)}
            format={asStr(p.format, "currency") as "currency" | "percent" | "integer" | "decimal"}
            className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5"
          />
        </div>
      );

    case "leaderboard_podium":
      return (
        <div className="h-full w-full overflow-auto">
          <LeaderboardPodium
            componentId={element.componentId}
            variant={asStr(p.variant, "pedestal") as "pedestal" | "cards"}
            title={asStr(p.title, "Top 3 Consultores — Móveis & Eletro")}
            subtitle={asStr(p.subtitle)}
            items={[
              { id: 1, rank: 1, name: "Camila Souza", subtitle: "Porto Velho (RO)", value: 6420.5, valueLabel: "Comissão", progressPct: 118 },
              { id: 2, rank: 2, name: "Rafael Nascimento", subtitle: "Manaus (AM)", value: 5310, valueLabel: "Comissão", progressPct: 106 },
              { id: 3, rank: 3, name: "Juliana Mendes", subtitle: "Ji-Paraná (RO)", value: 4490.8, valueLabel: "Comissão", progressPct: 98 },
            ]}
          />
        </div>
      );

    case "motion_collapse":
      return (
        <div className="h-full w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => interactive && setCollapseOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer"
          >
            <span>{asStr(p.title, "Detalhes")}</span>
            <ChevronDown size={14} className={collapseOpen ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          <MotionCollapse open={collapseOpen} innerClassName="px-3.5 pb-3 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{asStr(p.content)}</p>
          </MotionCollapse>
        </div>
      );

    case "stagger_list":
      return (
        <div className="h-full w-full overflow-auto">
          <StaggerList
            componentId={element.componentId}
            as="ul"
            staggerDelay={asNum(p.staggerDelay, 0.05)}
            offsetY={asNum(p.offsetY, 10)}
            className="space-y-2"
          >
            {[
              { sku: "EST-3091", name: "Sofá Retrátil Imperial 3 Lugares", branch: "Porto Velho (RO)" },
              { sku: "ELE-8820", name: "Geladeira Frost Free Inverter 450L", branch: "Manaus (AM)" },
              { sku: "COL-7740", name: "Colchão King Molas Ensacadas", branch: "Ji-Paraná (RO)" },
            ].map((item) => (
              <StaggerItem
                key={item.sku}
                as="li"
                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs"
              >
                <span className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{item.name}</span>
                <span className="text-zinc-500 shrink-0 ml-2">{item.branch}</span>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      );

    case "isometric_showcase":
      return (
        <div className="h-full w-full overflow-auto">
          <IsometricShowcase
            scene={isoScene}
            steps={isoSteps}
            autoPlay={asBool(p.autoPlay, false)}
            showBench={asBool(p.showBench, true)}
            tilt={asBool(p.tilt, true)}
          />
        </div>
      );

    case "isometric_bench":
      return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center p-2">
          <IsometricBench
            scene={isoScene}
            step={Math.min(1, Math.max(0, asNum(p.step, 0)))}
            label={asStr(p.label, "Bancada Isométrica Lopes")}
            showBench={asBool(p.showBench, true)}
            tilt={asBool(p.tilt, true)}
            className="h-full w-full"
          />
        </div>
      );

    default:
      return null;
  }
}
