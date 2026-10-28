"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import ConfirmDialog from "@/components/ConfirmDialog";
import Drawer from "@/components/Drawer";
import Modal from "@/components/Modal";
import FormModal, { FormSectionHeader } from "@/components/FormModal";
import FormDrawer from "@/components/FormDrawer";
import { CameraCaptureModal } from "@/components/CameraCaptureModal";
import PullToRefresh from "@/components/PullToRefresh";
import ButtonGroup from "@/components/ButtonGroup";
import ToggleGroup, { Toggle } from "@/components/ToggleGroup";
import SpeedDial from "@/components/SpeedDial";
import Swap from "@/components/Swap";
import Loading from "@/components/Loading";
import TextField from "@/components/form/TextField";
import SelectField from "@/components/form/SelectField";
import NumberField from "@/components/form/NumberField";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import StatusPage from "@/components/StatusPage";
import CodeBlock from "@/components/CodeBlock";
import toast, { ToastPreview } from "@/components/Toast";
import { useAsyncButton } from "@/hooks/useAsyncButton";
import {
  FileSearch,
  Lock,
  Unlock,
  AlertTriangle,
  Download,
  ArrowRight,
  ArrowUp,
  MousePointer2,
  Plus,
  Check,
  RefreshCw,
  Save,
  Pencil,
  Trash2,
  ExternalLink,
  Bell,
  Settings,
  Search,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutGrid,
  List,
  Table2,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  FilePlus,
  Printer,
  Share2,
  Send,
  Copy,
  ChevronDown,
} from "lucide-react";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

function ModalAndFormModalDemo() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalSize, setModalSize] = React.useState<
    "compact" | "sm" | "md" | "lg"
  >("compact");
  const [formModalOpen, setFormModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("geral");

  const tabs = [
    {
      id: "geral",
      label: "Dados Gerais",
      description: "Identificação e categoria",
    },
    {
      id: "estoque",
      label: "Planos & Limites",
      description: "Cotas e regiões",
      badge: 2,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {(["compact", "sm", "md", "lg"] as const).map((sz) => (
        <Button
          key={sz}
          variant="outline"
          size="sm"
          onClick={() => {
            setModalSize(sz);
            setModalOpen(true);
          }}
        >
          Modal · {sz}
        </Button>
      ))}
      <Button
        variant="primary"
        size="sm"
        onClick={() => setFormModalOpen(true)}
      >
        FormModal (CRUD em Abas)
      </Button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size={modalSize}
        title="Detalhes da Implantação"
        description={`Visualizando em tamanho "${modalSize}" com pilha global de ESC`}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Fechar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                toast.success("Implantação confirmada!");
              }}
            >
              Confirmar Implantação
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Ambiente:{" "}
            <strong>Lopes Cloud — Cluster us-east-1 (Produção)</strong>
          </p>
          <p>
            Serviços incluídos: API Gateway, Worker de Filas e Painel de
            Telemetria.
          </p>
        </div>
      </Modal>

      <FormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Cadastro de Produto"
        subtitle="Configuração padronizada do catálogo de serviços"
        code="PROD-8042"
        badge={<StatusBadge tone="success" label="Ativo" />}
        avatar={{ initials: "LP" }}
        isEditing
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => setActiveTab("geral")}
        onNext={() => setActiveTab("estoque")}
        onSave={() => {
          setFormModalOpen(false);
          toast.success("Produto salvo com sucesso!");
        }}
      >
        {activeTab === "geral" ? (
          <div className="space-y-4">
            <FormSectionHeader
              title="Identificação do Serviço / Recurso"
              description="Preencha os dados principais para exibição no catálogo da plataforma."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Descrição Comercial"
                defaultValue="Licença Enterprise Multi-Workspace"
                required
              />
              <SelectField
                label="Setor"
                defaultValue="saas"
                options={[
                  { value: "cloud", label: "Infraestrutura & Cloud" },
                  { value: "saas", label: "Plataforma & SaaS" },
                  { value: "sec", label: "Segurança & Auditoria" },
                  { value: "data", label: "Dados & Analytics" },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FormSectionHeader
              title="Precificação por Plano"
              description="Valores mensais e anuais praticados nos planos comerciais."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField label="Plano Mensal" prefix="R$" value={2890} />
              <NumberField label="Plano Anual" prefix="R$" value={2950} />
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

function FormDrawerAndCameraDemo() {
  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);
  const [cameraOpen, setCameraOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="primary"
        size="sm"
        onClick={() => setFormDrawerOpen(true)}
      >
        Abrir FormDrawer
      </Button>
      <Button variant="outline" size="sm" onClick={() => setCameraOpen(true)}>
        Abrir CameraCaptureModal
      </Button>

      <FormDrawer
        open={formDrawerOpen}
        onClose={() => setFormDrawerOpen(false)}
        title="Agendar Manutenção"
        description="Ordem de Serviço #OS-6912 · Ambiente de Produção"
        summary={
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                Cliente: Marcos Oliveira
              </p>
              <p className="text-zinc-500">
                Contato: (11) 99214-8800 · Atualização de Cluster v2.4
              </p>
            </div>
            <StatusBadge tone="info" label="Agendado" />
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormDrawerOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormDrawerOpen(false);
                toast.success("Manutenção agendada!");
              }}
            >
              Salvar Agendamento
            </Button>
          </div>
        }
      >
        <TextField
          label="Engenheiro Responsável"
          defaultValue="Carlos Eduardo (SRE)"
        />
        <TextField
          label="Observações de Acesso"
          placeholder="Ponto de referência da residência..."
        />
      </FormDrawer>

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        title="Capturar Comprovante de Entrega"
        description="Posicione o documento ou crachá de identificação no quadro central"
        onCapture={(file) => {
          toast.success(`Foto capturada: ${file.name}`);
          setCameraOpen(false);
        }}
      />
    </div>
  );
}

function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  const [side, setSide] = React.useState<"right" | "left" | "top" | "bottom">(
    "right",
  );
  const [size, setSize] = React.useState<"sm" | "md" | "lg" | "xl">("md");
  return (
    <div className="flex flex-wrap gap-3">
      {(["right", "left", "top", "bottom"] as const).map((s) => (
        <Button
          key={s}
          variant="outline"
          size="sm"
          onClick={() => {
            setSide(s);
            setSize("md");
            setOpen(true);
          }}
        >
          {s}
        </Button>
      ))}
      {(["sm", "md", "lg", "xl"] as const).map((sz) => (
        <Button
          key={sz}
          variant="secondary"
          size="sm"
          onClick={() => {
            setSide("right");
            setSize(sz);
            setOpen(true);
          }}
        >
          right · {sz}
        </Button>
      ))}
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          setSide("right");
          setSize("md");
          setOpen(true);
        }}
      >
        Com footer
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        size={size}
        title="Drawer demo"
        description={`side="${side}" size="${size}"`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
              Confirmar
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Conteúdo do drawer. Pode conter formulários, listas, detalhes ou
          qualquer elemento React.
        </p>
      </Drawer>
    </div>
  );
}

function ConfirmDialogDemo({
  variant,
  triggerLabel,
  title,
  description,
  confirmLabel,
  loading,
  children,
}: {
  variant: "danger" | "warning" | "info";
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const handleConfirm = () => {
    if (loading) {
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          setOpen(false);
          toast("Ação confirmada!");
          resolve();
        }, 1800),
      );
    }
    setOpen(false);
    toast("Ação confirmada!");
  };
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <ConfirmDialog
        open={open}
        variant={variant}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      >
        {children}
      </ConfirmDialog>
    </>
  );
}

export default function Page() {
  const router = useRouter();
  const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);
  const [alertDialogOpen2, setAlertDialogOpen2] = React.useState(false);

  const { loading, handleClick } = useAsyncButton(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
    {
      timeout: 3000,
      timeoutMessage: "Ação demorou demais!",
      timeoutType: "error",
      onErrorMessage: "Erro inesperado!",
      onErrorType: "error",
    },
  );

  const notifySuccess = () =>
    toast.success("Deploy #LP-8492 concluído com sucesso!", {
      description: "Nova versão publicada no cluster de produção.",
      closeButton: true,
    });
  const notifyError = () =>
    toast.error("Falha ao sincronizar repositório", {
      description:
        "Não foi possível conectar ao servidor remoto. Tente novamente.",
      closeButton: true,
    });
  const notifyBasic = () =>
    toast("Chave de API copiada!", {
      description: "Escopo: read:metrics, write:deployments",
      icon: "🔑",
    });
  const notifyWarning = () =>
    toast.warning("Cota de requisições próxima do limite", {
      description:
        "O workspace atingiu 88% do limite mensal contratado.",
      closeButton: true,
    });
  const notifyInfo = () =>
    toast.info("Nova atualização do Lopes UI disponível", {
      description: "Versão 2.1 inclui novos componentes e melhorias de performance.",
      action: {
        label: "Atualizar",
        onClick: () => toast.success("Atualização iniciada!"),
      },
    });
  const notifyAction = () =>
    toast.success("Registro movido para arquivados.", {
      description: "Projeto: Portal de Analytics v2.",
      action: {
        label: "Desfazer",
        onClick: () => toast.success("Registro restaurado com sucesso!"),
      },
    });
  const notifyLoading = () => {
    const id = toast.loading("Compilando pacotes...", {
      description: "Executando validação de tipos e bundle ESM",
    });
    setTimeout(
      () =>
        toast.success("Build finalizado com sucesso!", {
          id,
          description: "Artefatos prontos para publicação.",
          closeButton: true,
        }),
      2000,
    );
  };
  const notifyPromise = () => {
    const p = new Promise<string>((resolve, reject) => {
      setTimeout(
        () =>
          Math.random() > 0.25 ? resolve("ok") : reject(new Error("fail")),
        1500,
      );
    });
    toast.promise(
      p,
      {
        loading: "Salvando configurações...",
        success: "Configurações salvas e aplicadas!",
        error: "Erro ao salvar preferências no servidor.",
      },
      { closeButton: true },
    );
  };
  const notifyBig = () =>
    toast("Janela de manutenção programada agendada", {
      description:
        "O cluster primário passará por atualização automática de segurança no domingo às 02:00 UTC sem impacto esperado na disponibilidade dos serviços.",
      duration: 6000,
      closeButton: true,
    });
  const notifyStyled = () =>
    toast("Modo noturno ativado no painel", {
      icon: "🌙",
      duration: 4000,
      closeButton: true,
    });

  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
        <section id="button">
          <SectionHeader
            label="Button"
            title="Button"
            description="Botão base da biblioteca. Suporta variantes, tamanhos, ícones esquerdo/direito e estado de carregamento assíncrono."
          />

          <DemoCard id="button-variants" title="Variantes">
            <div className="flex flex-wrap gap-3 items-center">
              <Button onClick={() => toast("clicou")}>Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </DemoCard>

          <DemoCard id="button-sizes" title="Tamanhos">
            <div className="flex flex-wrap gap-3 items-end">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </DemoCard>

          <DemoCard id="button-icons" title="Com ícones e loading">
            <div className="flex flex-wrap gap-3 items-center">
              <Button leftIcon={<MousePointer2 size={16} />} variant="primary">
                Ação
              </Button>
              <Button rightIcon={<Download size={16} />} variant="outline">
                Baixar
              </Button>
              <Button loading={loading} onClick={handleClick} variant="primary">
                Async (3s timeout)
              </Button>
            </div>
          </DemoCard>

          <DemoCard id="button-semantic" title="Cores semânticas">
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="success" leftIcon={<Check size={15} />}>
                Confirmar
              </Button>
              <Button variant="success-outline" leftIcon={<Check size={15} />}>
                Confirmar
              </Button>
              <Button variant="warning" leftIcon={<AlertTriangle size={15} />}>
                Atenção
              </Button>
              <Button
                variant="warning-outline"
                leftIcon={<AlertTriangle size={15} />}
              >
                Atenção
              </Button>
              <Button variant="info" leftIcon={<Bell size={15} />}>
                Informação
              </Button>
              <Button variant="info-outline" leftIcon={<Bell size={15} />}>
                Informação
              </Button>
              <Button variant="destructive" leftIcon={<Trash2 size={15} />}>
                Excluir
              </Button>
            </div>
          </DemoCard>

          <DemoCard id="button-pill" title="Pill (arredondado)">
            <div className="flex flex-wrap gap-3 items-center">
              <Button pill variant="primary">
                Primary
              </Button>
              <Button pill variant="success">
                Sucesso
              </Button>
              <Button pill variant="warning">
                Aviso
              </Button>
              <Button pill variant="outline">
                Outline
              </Button>
              <Button pill variant="ghost">
                Ghost
              </Button>
              <Button pill variant="destructive">
                Excluir
              </Button>
              <Button pill variant="primary" leftIcon={<Plus size={15} />}>
                Novo item
              </Button>
              <Button
                pill
                variant="success-outline"
                leftIcon={<Check size={15} />}
                size="sm"
              >
                Aprovado
              </Button>
            </div>
          </DemoCard>

          <DemoCard
            id="button-square"
            title=" Formatos (square, circle, wide) & Loading Text"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Button shape="square" variant="primary" aria-label="Adicionar">
                  <Plus size={16} />
                </Button>
                <Button
                  shape="square"
                  variant="default"
                  aria-label="Configurações"
                >
                  <Settings size={16} />
                </Button>
                <Button shape="square" variant="outline" aria-label="Buscar">
                  <Search size={16} />
                </Button>
                <Button shape="circle" variant="primary" aria-label="Adicionar">
                  <Plus size={16} />
                </Button>
                <Button shape="circle" variant="secondary" aria-label="Salvar">
                  <Save size={16} />
                </Button>
                <Button shape="circle" variant="outline" aria-label="Atualizar">
                  <RefreshCw size={16} />
                </Button>
                <Button shape="circle" variant="success" aria-label="Confirmar">
                  <Check size={16} />
                </Button>
                <Button shape="circle" variant="warning" aria-label="Atenção">
                  <AlertTriangle size={16} />
                </Button>
                <Button
                  shape="circle"
                  variant="destructive"
                  aria-label="Excluir"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <Button wide variant="primary" leftIcon={<Save size={16} />}>
                  Salvar Pedido (Wide)
                </Button>
                <Button
                  loading
                  loadingText="Emitindo NF-e..."
                  variant="outline"
                >
                  Emitir Nota
                </Button>
              </div>
            </div>
          </DemoCard>

          <DemoCard id="button-link" title="Link">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="link">Ver mais</Button>
              <Button variant="link" rightIcon={<ArrowRight size={14} />}>
                Saiba mais
              </Button>
              <Button variant="link" rightIcon={<ExternalLink size={14} />}>
                Abrir em nova aba
              </Button>
              <Button variant="link" onClick={() => toast("Cancelado")}>
                Cancelar
              </Button>
            </div>
          </DemoCard>

          <DemoCard id="button-disabled" title="Estado desabilitado">
            <div className="flex flex-wrap gap-3 items-center">
              <Button disabled>Default</Button>
              <Button disabled variant="primary">
                Primary
              </Button>
              <Button disabled variant="success">
                Sucesso
              </Button>
              <Button disabled variant="warning">
                Aviso
              </Button>
              <Button disabled variant="outline">
                Outline
              </Button>
              <Button disabled variant="ghost">
                Ghost
              </Button>
              <Button disabled variant="destructive">
                Excluir
              </Button>
              <Button disabled variant="link">
                Link
              </Button>
            </div>
          </DemoCard>

          <DemoCard id="button-fullwidth" title="Largura total">
            <div className="space-y-2 max-w-sm">
              <Button
                variant="primary"
                className="w-full"
                leftIcon={<Save size={15} />}
              >
                Salvar alterações
              </Button>
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
              <Button
                variant="success"
                className="w-full"
                leftIcon={<Check size={15} />}
              >
                Confirmar pedido
              </Button>
            </div>
          </DemoCard>

          <div id="button-props" className="mt-6">
            <PropsTable
              rows={[
                [
                  "variant",
                  "string",
                  "default",
                  "solid | outline | ghost | primary | secondary | destructive | success | success-outline | warning | warning-outline | info | info-outline | link",
                ],
                ["size", "string", "md", "sm | md | lg"],
                ["pill", "boolean", "false", "Forma pill — rounded-full"],
                [
                  "square",
                  "boolean",
                  "false",
                  "Modo só-ícone — padding igual, sem min-w",
                ],
                ["leftIcon", "ReactNode", "—", "Ícone à esquerda do label"],
                ["rightIcon", "ReactNode", "—", "Ícone à direita do label"],
                [
                  "loading",
                  "boolean",
                  "false",
                  "Exibe spinner e desabilita o botão",
                ],
                ["disabled", "boolean", "false", "Desabilita o botão"],
                [
                  "componentId",
                  "string",
                  "—",
                  "ID para inventário de componentes",
                ],
              ]}
            />
          </div>

          <div className="mt-6">
            <CodeBlock
              filename="Button.tsx"
              language="tsx"
              code={`<Button\n  variant="primary"\n  size="lg"\n  leftIcon={<Download size={16} />}\n  loading={isSaving}\n  onClick={handleSave}\n>\n  Salvar alterações\n</Button>`}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="action-button">
          <SectionHeader
            label="Button"
            title="Tooltip & Confirmação"
            description="Button suporta tooltip de hover e diálogo de confirmação nativamente via props tooltip e confirm. Combine com square para ícones compactos."
          />

          <DemoCard id="action-examples" title="Exemplos">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col items-center gap-1">
                <Button
                  square
                  leftIcon={<Download />}
                  tooltip="Download"
                  aria-label="Download file"
                  confirm={{
                    title: "Iniciar download?",
                    description: "Deseja iniciar o download do arquivo?",
                  }}
                  onClick={() => toast.success("Download iniciado")}
                  componentId="demo.action.download"
                />
                <span className="text-xs text-zinc-400">Com confirm</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button
                  square
                  leftIcon={<ArrowUp />}
                  tooltip="Topo"
                  aria-label="Back to top"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  variant="ghost"
                />
                <span className="text-xs text-zinc-400">Ghost</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button
                  square
                  leftIcon={<AlertTriangle />}
                  tooltip="Atenção"
                  aria-label="Warning"
                  onClick={() => toast.error("Ação perigosa!")}
                  variant="destructive"
                />
                <span className="text-xs text-zinc-400">Destructive</span>
              </div>
            </div>
          </DemoCard>

          <div id="action-props" className="mt-6">
            <PropsTable
              rows={[
                ["tooltip", "string", "—", "Texto do tooltip ao hover"],
                [
                  "confirm",
                  "boolean | object",
                  "—",
                  "Exibe diálogo de confirmação antes do onClick",
                ],
                [
                  "square",
                  "boolean",
                  "false",
                  "Padding igual em todos os lados (ideal para ícones)",
                ],
                [
                  "aria-label",
                  "string",
                  "—",
                  "Label acessível para screen readers",
                ],
                [
                  "componentId",
                  "string",
                  "—",
                  "ID para inventário de componentes",
                ],
              ]}
            />
          </div>

          <div className="mt-6">
            <CodeBlock
              filename="Button.tsx"
              language="tsx"
              code={`<Button\n  square\n  leftIcon={<Trash2 />}\n  tooltip="Excluir registro"\n  aria-label="Excluir"\n  variant="destructive"\n  confirm={{\n    title: "Excluir registro?",\n    description: "Esta ação não pode ser desfeita.",\n    confirmLabel: "Excluir",\n  }}\n  onClick={handleDelete}\n/>`}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="alerts" className="space-y-10 pb-10 sm:pb-14">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Alert
            </h2>
            <p className="mt-1 text-zinc-500">
              Notificações inline ou modais com variantes semânticas, ações e
              dismiss.
            </p>
          </div>

          {/* Variants */}
          <div id="alert-variants" className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Variantes inline
            </h3>
            <div className="space-y-3">
              <Alert
                variant="info"
                title="Informação"
                description="Esta é uma mensagem informativa para o usuário."
                dismissible
              />
              <Alert
                variant="success"
                title="Sucesso!"
                description="Operação concluída com êxito."
                dismissible
              />
              <Alert
                variant="warning"
                title="Atenção"
                description="Verifique os dados antes de continuar."
                dismissible
              />
              <Alert
                variant="danger"
                title="Erro"
                description="Não foi possível processar a solicitação."
                dismissible
              />
              <Alert
                variant="neutral"
                title="Nota"
                description="Nenhuma ação é necessária no momento."
                dismissible
              />
            </div>
          </div>

          {/* With actions */}
          <div id="alert-actions" className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Com ações
            </h3>
            <div className="space-y-3">
              <Alert
                variant="warning"
                title="Sessão expirando"
                description="Você será desconectado em 5 minutos por inatividade."
                actions={[
                  {
                    label: "Renovar sessão",
                    onClick: () => toast.success("Sessão renovada!"),
                  },
                  {
                    label: "Sair agora",
                    onClick: () => toast("Saindo…"),
                    variant: "ghost",
                  },
                ]}
              />
              <Alert
                variant="danger"
                title="Ação irreversível"
                description="Esta operação não pode ser desfeita após confirmação."
                actions={[
                  {
                    label: "Confirmar",
                    onClick: () => toast.error("Excluído!"),
                  },
                  { label: "Cancelar", onClick: () => {}, variant: "ghost" },
                ]}
              />
            </div>
          </div>

          {/* Dialog mode */}
          <div id="alert-dialog" className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Modo Dialog
            </h3>
            <div className="flex flex-wrap gap-3 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setAlertDialogOpen(true)}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                Abrir alerta de aviso
              </button>
              <button
                onClick={() => setAlertDialogOpen2(true)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Abrir alerta de perigo
              </button>
            </div>

            <Alert
              dialog
              open={alertDialogOpen}
              onClose={() => setAlertDialogOpen(false)}
              variant="warning"
              title="Confirmar alterações?"
              description="As alterações feitas serão salvas permanentemente. Esta ação não pode ser desfeita facilmente."
              actions={[
                {
                  label: "Salvar mesmo assim",
                  onClick: () => {
                    toast.success("Salvo!");
                    setAlertDialogOpen(false);
                  },
                },
                {
                  label: "Cancelar",
                  onClick: () => setAlertDialogOpen(false),
                  variant: "ghost",
                },
              ]}
            />
            <Alert
              dialog
              open={alertDialogOpen2}
              onClose={() => setAlertDialogOpen2(false)}
              variant="danger"
              title="Excluir conta?"
              description="Todos os seus dados serão permanentemente apagados. Esta ação não pode ser desfeita."
              actions={[
                {
                  label: "Sim, excluir",
                  onClick: () => {
                    toast.error("Conta excluída!");
                    setAlertDialogOpen2(false);
                  },
                },
                {
                  label: "Não, manter",
                  onClick: () => setAlertDialogOpen2(false),
                  variant: "ghost",
                },
              ]}
            />
          </div>

          <div id="alert-props" className="space-y-4">
            <PropsTable
              rows={[
                ["title", "string", "—", "Título do alerta"],
                ["description", "string | ReactNode", "—", "Texto descritivo"],
                [
                  "variant",
                  "'info'|'success'|'warning'|'danger'|'neutral'",
                  "'info'",
                  "Estilo semântico",
                ],
                [
                  "icon",
                  "LucideIcon | null",
                  "—",
                  "Override do ícone padrão (null remove o ícone)",
                ],
                [
                  "dismissible",
                  "boolean",
                  "false",
                  "Exibe botão × para fechar",
                ],
                ["onDismiss", "() => void", "—", "Callback ao fechar"],
                ["actions", "AlertAction[]", "—", "Botões de ação inline"],
                [
                  "dialog",
                  "boolean",
                  "false",
                  "Renderiza como modal em vez de banner",
                ],
                [
                  "open",
                  "boolean",
                  "—",
                  "Controla visibilidade (necessário com dialog)",
                ],
                ["onClose", "() => void", "—", "Callback para fechar o dialog"],
                ["className", "string", "—", "Classes adicionais"],
                [
                  "componentId",
                  "string",
                  "—",
                  "Identificador de controle de acesso",
                ],
              ]}
            />
            <CodeBlock
              code={`import Alert from "@/components/Alert";

// Inline
<Alert variant="success" title="Tudo certo!" description="Operação concluída." dismissible />

// Com ações
<Alert
  variant="warning"
  title="Sessão expirando"
  description="Você será desconectado em breve."
  actions={[
    { label: "Renovar", onClick: handleRenew },
    { label: "Sair", onClick: handleLogout, variant: "ghost" },
  ]}
/>

// Dialog (modal)
const [open, setOpen] = useState(false);
<Alert
  dialog
  open={open}
  onClose={() => setOpen(false)}
  variant="danger"
  title="Excluir?"
  description="Esta ação não pode ser desfeita."
  actions={[
    { label: "Confirmar", onClick: handleConfirm },
    { label: "Cancelar", onClick: () => setOpen(false), variant: "ghost" },
  ]}
/>`}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="confirm-dialog" className="space-y-10 pb-10 sm:pb-14">
          <SectionHeader
            label="Utilitários"
            title="Confirm Dialog"
            description="Dialog de confirmação focado em ações destrutivas. Suporta variantes danger, warning e info, estado de loading, conteúdo extra e foco automático no botão Cancelar."
          />

          <DemoCard id="confirm-dialog-danger" title="Danger (padrão)">
            <div className="p-6 flex flex-wrap gap-3">
              <ConfirmDialogDemo
                variant="danger"
                triggerLabel="Excluir registro"
                title="Excluir registro?"
                description="Esta ação não pode ser desfeita. O registro será removido permanentemente."
                confirmLabel="Excluir"
              />
            </div>
          </DemoCard>

          <DemoCard id="confirm-dialog-warning" title="Warning">
            <div className="p-6 flex flex-wrap gap-3">
              <ConfirmDialogDemo
                variant="warning"
                triggerLabel="Arquivar projeto"
                title="Arquivar projeto?"
                description="O projeto será movido para a área de arquivados e ficará inacessível para a equipe."
                confirmLabel="Arquivar"
              />
            </div>
          </DemoCard>

          <DemoCard id="confirm-dialog-info" title="Info">
            <div className="p-6 flex flex-wrap gap-3">
              <ConfirmDialogDemo
                variant="info"
                triggerLabel="Reatribuir responsável"
                title="Reatribuir responsável?"
                description="O responsável atual será notificado e perderá o acesso de edição ao item."
                confirmLabel="Reatribuir"
              />
              <ConfirmDialogDemo
                variant="info"
                triggerLabel="Enviar para revisão"
                title="Enviar para revisão?"
                description="O documento seguirá para a fila de aprovação e não poderá ser editado durante o processo."
                confirmLabel="Enviar"
              />
            </div>
          </DemoCard>

          <DemoCard
            id="confirm-dialog-body"
            title="Com conteúdo extra e loading simulado"
          >
            <div className="p-6 flex flex-wrap gap-3">
              <ConfirmDialogDemo
                variant="danger"
                loading
                triggerLabel="Cancelar contrato"
                title="Cancelar contrato #CT-0042?"
                description="Ao confirmar, as seguintes consequências serão aplicadas:"
                confirmLabel="Confirmar cancelamento"
              >
                <ul className="mt-2 space-y-1 list-disc pl-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <li>Todos os serviços associados serão suspensos</li>
                  <li>O cliente receberá um e-mail de notificação</li>
                  <li>O faturamento será encerrado no ciclo atual</li>
                </ul>
              </ConfirmDialogDemo>
            </div>
          </DemoCard>

          <div id="confirm-dialog-props" className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                ["open", "boolean", "—", "Controla visibilidade"],
                ["title", "string", "—", "Título do dialog"],
                ["description", "string", "—", "Texto descritivo"],
                [
                  "children",
                  "ReactNode",
                  "—",
                  "Conteúdo extra abaixo da descrição",
                ],
                [
                  "variant",
                  "'danger'|'warning'|'info'",
                  "'danger'",
                  "Tom visual e cor do botão confirmar",
                ],
                [
                  "icon",
                  "LucideIcon",
                  "—",
                  "Ícone custom (sobrescreve preset)",
                ],
                [
                  "confirmLabel",
                  "string",
                  "'Confirmar'",
                  "Label do botão confirmar",
                ],
                [
                  "cancelLabel",
                  "string",
                  "'Cancelar'",
                  "Label do botão cancelar",
                ],
                [
                  "loading",
                  "boolean",
                  "false",
                  "Estado de loading externo no confirmar",
                ],
                [
                  "onConfirm",
                  "() => void | Promise<void>",
                  "—",
                  "Callback de confirmação (suporta async)",
                ],
                ["onCancel", "() => void", "—", "Callback de cancelamento"],
              ]}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="drawer" className="scroll-mt-20">
          <SectionHeader
            label="Componente"
            title="Drawer"
            description="Painel lateral deslizante com backdrop, Escape, slot de footer e 4 lados (right, left, top, bottom)."
          />

          <DemoCard id="drawer-demo" title="Demo interativo">
            <DrawerDemo />
          </DemoCard>

          <div id="drawer-props" className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                ["open", "boolean", "—", "Controla visibilidade"],
                [
                  "onClose",
                  "() => void",
                  "—",
                  "Chamado ao fechar (Escape ou backdrop)",
                ],
                [
                  "side",
                  '"right"|"left"|"top"|"bottom"',
                  '"right"',
                  "Borda de onde o drawer desliza",
                ],
                [
                  "size",
                  '"sm"|"md"|"lg"|"xl"|"full"',
                  '"md"',
                  "Largura (left/right) ou altura (top/bottom)",
                ],
                ["title", "ReactNode", "—", "Título no cabeçalho"],
                ["description", "ReactNode", "—", "Subtexto no cabeçalho"],
                ["footer", "ReactNode", "—", "Slot sticky no rodapé"],
                [
                  "closeOnBackdrop",
                  "boolean",
                  "true",
                  "Fecha ao clicar no backdrop",
                ],
              ]}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="empty-state" className="space-y-10 pb-10 sm:pb-14">
          <SectionHeader
            label="Utilitários"
            title="Empty State"
            description="Tela de estado vazio com preset, ícone, título, descrição e ações. Cobre: lista vazia, sem resulados de busca, erro, sem permissão, offline e 404 inline."
          />

          <DemoCard id="empty-state-presets" title="Presets">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
              {(
                [
                  "empty",
                  "search",
                  "error",
                  "no-access",
                  "offline",
                  "not-found",
                ] as const
              ).map((p) => (
                <div
                  key={p}
                  className="bg-white dark:bg-zinc-900 flex items-center justify-center"
                >
                  <EmptyState preset={p} size="sm" />
                </div>
              ))}
            </div>
          </DemoCard>

          <DemoCard id="empty-state-actions" title="Com ações">
            <div className="p-6">
              <EmptyState
                preset="empty"
                title="Nenhum pedido ainda"
                description="Crie seu primeiro pedido para começar a usar o sistema."
                actions={[
                  {
                    label: "Criar pedido",
                    variant: "primary",
                    onClick: () => toast("Criar pedido"),
                  },
                  {
                    label: "Importar CSV",
                    variant: "secondary",
                    onClick: () => toast("Importar"),
                  },
                ]}
              />
            </div>
          </DemoCard>

          <DemoCard id="empty-state-sizes" title="Tamanhos">
            <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
              {(["sm", "md", "lg"] as const).map((s) => (
                <EmptyState key={s} preset="search" size={s} />
              ))}
            </div>
          </DemoCard>

          <DemoCard id="empty-state-fill" title="fill — ocupa 100% da altura">
            <div className="h-72 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
              <EmptyState
                preset="empty"
                title="Nenhum resultado"
                description="Tente ajustar os filtros para encontrar o que procura."
                size="sm"
                fill
                actions={[
                  {
                    label: "Limpar filtros",
                    variant: "primary",
                    onClick: () => toast("Filtros limpos"),
                  },
                ]}
              />
            </div>
          </DemoCard>

          <div id="empty-state-props" className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Props
            </h3>
            <PropsTable
              rows={[
                [
                  "preset",
                  "EmptyStatePreset",
                  "'empty'",
                  "Preset com ícone e copy padrão",
                ],
                ["title", "string", "—", "Substitui o título do preset"],
                [
                  "description",
                  "string",
                  "—",
                  "Substitui a descrição do preset",
                ],
                [
                  "icon",
                  "LucideIcon",
                  "—",
                  "Ícone customizado (sobrescreve preset)",
                ],
                [
                  "illustration",
                  "ReactNode",
                  "—",
                  "Nó custom (SVG, imagem) no lugar do ícone",
                ],
                [
                  "actions",
                  "EmptyStateAction[]",
                  "—",
                  "Botões de ação abaixo do texto",
                ],
                [
                  "size",
                  "'sm'|'md'|'lg'",
                  "'md'",
                  "Tamanho geral do componente",
                ],
                [
                  "fill",
                  "boolean",
                  "false",
                  "Ocupa 100% da altura e centraliza",
                ],
              ]}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <strong>EmptyStatePreset:</strong>{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                {
                  "'empty' | 'search' | 'error' | 'no-access' | 'offline' | 'not-found' | 'custom'"
                }
              </code>
            </p>
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="status-pages">
          <SectionHeader
            label="StatusPage"
            title="StatusPage"
            description="Páginas de erro prontas para 404, 403 e 500. Podem ser usadas em tela cheia ou embutidas (inline) em qualquer container."
          />

          <DemoCard id="status-inline" title="Previews inline">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["404", "403", "500"] as const).map((v) => (
                <div
                  key={v}
                  className="overflow-hidden rounded-xl border border-zinc-200"
                >
                  <StatusPage
                    inline
                    variant={v}
                    code={Number(v)}
                    title={
                      v === "404"
                        ? "Não encontrado"
                        : v === "403"
                          ? "Sem acesso"
                          : "Erro interno"
                    }
                    description={
                      v === "404"
                        ? "Página não encontrada."
                        : v === "403"
                          ? "Você não tem permissão."
                          : "Algo deu errado."
                    }
                  />
                </div>
              ))}
            </div>
          </DemoCard>

          <DemoCard id="status-fullscreen" title="Páginas full-screen">
            <div className="flex flex-wrap gap-3">
              <Button
                square
                leftIcon={<FileSearch />}
                tooltip="404"
                aria-label="Go to 404"
                onClick={() => router.push("/not-found")}
                variant="outline"
              />
              <Button
                square
                leftIcon={<Lock />}
                tooltip="403"
                aria-label="Go to 403"
                onClick={() => router.push("/access-denied")}
                variant="ghost"
              />
              <Button
                square
                leftIcon={<AlertTriangle />}
                tooltip="500"
                aria-label="Cause 500"
                onClick={() => router.push("/cause-error")}
                variant="destructive"
              />
            </div>
          </DemoCard>

          <div id="status-props" className="mt-6">
            <PropsTable
              rows={[
                ["variant", "string", "—", "404 | 403 | 500"],
                [
                  "code",
                  "number",
                  "—",
                  "Código exibido como decoração de fundo",
                ],
                ["title", "string", "—", "Título da mensagem"],
                ["description", "string", "—", "Descrição da mensagem"],
                [
                  "inline",
                  "boolean",
                  "false",
                  "Remove min-h-screen para uso embutido",
                ],
                [
                  "primaryAction",
                  "object",
                  "—",
                  "Botão CTA principal { label, onClick }",
                ],
              ]}
            />
          </div>

          <div className="mt-6">
            <CodeBlock
              filename="not-found.tsx"
              language="tsx"
              code={`<StatusPage\n  variant="404"\n  code={404}\n  title="Página não encontrada"\n  description="O endereço que você acessou não existe."\n  primaryAction={{ label: "Voltar ao início", onClick: () => router.push("/") }}\n/>`}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        <section id="toasts">
          <SectionHeader
            label="Toasts"
            title="Toast Notifications"
            description="Sistema de notificações corporativas com suporte a título + subtítulo (description), botão de fechar (closeButton), ações inline, promise auto-transition e animações com spring physics."
          />

          <DemoCard
            id="toasts-preview"
            title="Todos os tipos (ToastPreview com título, descrição, ação e fechar)"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToastPreview
                type="success"
                message="Deploy #LP-8492 concluído com sucesso"
                description="Nova versão publicada no cluster de produção sem erros."
                closeButton
              />
              <ToastPreview
                type="error"
                message="Falha na conexão com o banco de dados"
                description="Tempo limite excedido ao consultar réplica de leitura."
                closeButton
              />
              <ToastPreview
                type="warning"
                message="Cota de armazenamento em 88%"
                description="Considere expandir o volume ou arquivar snapshots antigos."
                action={{
                  label: "Gerenciar",
                  onClick: () => toast.info("Painel de armazenamento aberto!"),
                }}
              />
              <ToastPreview
                type="info"
                message="Nova versão v2.1 disponível"
                description="Inclui novos componentes de formulário e melhorias de acessibilidade."
                action={{
                  label: "Ver notas",
                  onClick: () => toast("Abrindo changelog..."),
                }}
              />
              <ToastPreview
                type="loading"
                message="Sincronizando índices de busca..."
                description="Processando lotes em segundo plano."
                showBar={false}
              />
              <ToastPreview
                type="default"
                message="Token de acesso copiado"
                description="Escopo: read:metrics · Expira em 24 horas"
                icon="🔑"
                closeButton
              />
            </div>
          </DemoCard>

          <DemoCard
            id="toasts-examples"
            title="Exemplos interativos — clique para disparar no topo/rodapé"
          >
            <div className="flex flex-wrap gap-3">
              <Button onClick={notifySuccess} variant="success" size="sm">
                Sucesso + Descrição
              </Button>
              <Button onClick={notifyError} variant="destructive" size="sm">
                Erro + Close
              </Button>
              <Button onClick={notifyWarning} variant="warning" size="sm">
                Aviso de Cota
              </Button>
              <Button onClick={notifyInfo} variant="info" size="sm">
                Info + Ação
              </Button>
              <Button onClick={notifyAction} variant="secondary" size="sm">
                Desfazer Ação
              </Button>
              <Button onClick={notifyLoading} variant="outline" size="sm">
                Loading → Sucesso
              </Button>
              <Button onClick={notifyPromise} variant="primary" size="sm">
                Promise (Auto)
              </Button>
              <Button onClick={notifyBasic} variant="ghost" size="sm">
                Básico + Ícone
              </Button>
              <Button onClick={notifyBig} variant="outline" size="sm">
                Texto Longo (Multilinha)
              </Button>
              <Button onClick={notifyStyled} variant="ghost" size="sm">
                Modo Noturno
              </Button>
            </div>
          </DemoCard>

          <div className="mt-6 space-y-4">
            <CodeBlock
              filename="toasts.tsx"
              language="tsx"
              code={`import toast, { Toaster } from "@/components/Toast";

// No layout raiz (uma vez):
<Toaster position="top-right" />

// Com título, descrição e botão fechar (Padrão Sonner / Lopes UI)
toast.success("Deploy concluído!", {
  description: "Nova versão publicada no ambiente de produção.",
  closeButton: true,
});

// Com botão de ação inline
toast.info("Nova versão disponível", {
  description: "Lopes UI v2.1 pronta para instalação.",
  action: { label: "Atualizar", onClick: () => iniciarUpdate() },
});

// Promise auto-transition
toast.promise(salvarConfiguracoes(), {
  loading: "Salvando configurações...",
  success: "Configurações salvas!",
  error: "Erro ao salvar preferências.",
});`}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── ButtonGroup ──────────────────────────────────────────────── */}
        <section id="button-group" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="ButtonGroup"
            title="ButtonGroup"
            description="Agrupamento coeso de botões com fusão automática de bordas (attached) ou espaçamento uniforme, ideal para barras de ações, paginação compacta e split-buttons."
          />

          <DemoCard
            id="button-group-demo"
            title="Horizontal (Attached), Split Button e Vertical"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Ações de Documento (Attached)
                </p>
                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FilePlus size={14} />}
                    onClick={() => toast("Novo documento")}
                  >
                    Novo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer size={14} />}
                    onClick={() => toast("Imprimindo...")}
                  >
                    Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Share2 size={14} />}
                    onClick={() => toast("Link copiado")}
                  >
                    Compartilhar
                  </Button>
                </ButtonGroup>
              </div>

              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Split Button (Ação Principal + Menu)
                </p>
                <ButtonGroup>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send size={14} />}
                    onClick={() =>
                      toast.success("Deploy iniciado com sucesso!")
                    }
                  >
                    Publicar Release
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    shape="square"
                    aria-label="Mais opções"
                    onClick={() => toast("Opções de publicação")}
                  >
                    <ChevronDown size={14} />
                  </Button>
                </ButtonGroup>
              </div>

              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Orientação Vertical
                </p>
                <ButtonGroup orientation="vertical">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Copy size={14} />}
                  >
                    Duplicar Registro
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download size={14} />}
                  >
                    Exportar JSON
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                  >
                    Arquivar Projeto
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </DemoCard>

          <CodeBlock
            filename="ButtonGroup.tsx"
            language="tsx"
            code={`<ButtonGroup>
  <Button variant="outline" size="sm">Novo</Button>
  <Button variant="outline" size="sm">Imprimir</Button>
  <Button variant="outline" size="sm">Compartilhar</Button>
</ButtonGroup>`}
          />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Toggle & ToggleGroup ─────────────────────────────────────── */}
        <section id="toggle-group" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="ToggleGroup"
            title="Toggle & ToggleGroup"
            description="Botões de alternância de estado (pressionado/não pressionado) individuais ou em grupo com seleção única (single) ou múltipla (multiple)."
          />

          <DemoCard
            id="toggle-group-demo"
            title="Seleção Única (Visualização) e Múltipla (Formatação)"
          >
            <ToggleGroupShowcaseDemo />
          </DemoCard>

          <CodeBlock
            filename="ToggleGroup.tsx"
            language="tsx"
            code={`<ToggleGroup
  type="single"
  value={view}
  onValueChange={(val) => val && setView(val)}
  options={[
    { value: "grid", label: "Grade", icon: <LayoutGrid size={14} /> },
    { value: "list", label: "Lista", icon: <List size={14} /> },
    { value: "table", label: "Tabela", icon: <Table2 size={14} /> },
  ]}
/>`}
          />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── SpeedDial (FAB) ──────────────────────────────────────────── */}
        <section id="speed-dial" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="SpeedDial"
            title="SpeedDial (Floating Action Menu)"
            description="Botão de ação flutuante expansível (estilo daisyUI FAB) com animações suaves, suporte a direções (up, down, left, right), tooltips e atalhos rápidos de operação."
          />

          <DemoCard
            id="speed-dial-demo"
            title="Direções e Ações Rápidas (Clique no primeiro ou passe o mouse no segundo)"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-end min-h-[240px] rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-6 gap-3">
                <SpeedDial
                  position="inline"
                  direction="up"
                  variant="primary"
                  actions={[
                    {
                      id: "documento",
                      label: "Novo Documento",
                      icon: <FilePlus size={16} />,
                      onClick: () =>
                        toast.success("Abrindo novo documento..."),
                    },
                    {
                      id: "imprimir",
                      label: "Imprimir Relatório",
                      icon: <Printer size={16} />,
                      onClick: () => toast("Enviando relatório para impressão..."),
                    },
                    {
                      id: "compartilhar",
                      label: "Compartilhar Link",
                      icon: <Share2 size={16} />,
                      onClick: () => toast.info("Link copiado para a área de transferência!"),
                    },
                  ]}
                />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Expansão Vertical (Up · Clique no botão +)
                </span>
              </div>

              <div className="flex flex-col items-start justify-end min-h-[240px] rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-6 gap-3">
                <div className="my-auto pl-4">
                  <SpeedDial
                    position="inline"
                    direction="right"
                    variant="dark"
                    trigger="hover"
                    showLabels={false}
                    actions={[
                      {
                        id: "add",
                        label: "Novo Registro",
                        icon: <Plus size={16} />,
                        onClick: () => toast("Novo registro"),
                      },
                      {
                        id: "edit",
                        label: "Editar Parâmetros",
                        icon: <Pencil size={16} />,
                        onClick: () => toast("Editar parâmetros"),
                      },
                      {
                        id: "save",
                        label: "Salvar Alterações",
                        icon: <Save size={16} />,
                        onClick: () => toast.success("Salvo!"),
                      },
                    ]}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 self-center">
                  Expansão Horizontal (Right · Passe o mouse)
                </span>
              </div>
            </div>
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Swap ─────────────────────────────────────────────────────── */}
        <section id="swap" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Swap"
            title="Swap (Transição de Estado)"
            description="Alternador visual de dois estados (on/off) com transições fluídas de rotação (rotate), giro 3D (flip) ou opacidade (fade)."
          />

          <DemoCard id="swap-demo" title="Efeitos: Rotate, Flip e Fade">
            <SwapShowcaseDemo />
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── Loading ──────────────────────────────────────────────────── */}
        <section id="loading" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="Loading"
            title="Loading Indicators"
            description="6 variantes de indicadores de carregamento (spinner, dots, ring, ball, bars, infinity) em 5 tamanhos e cores semânticas."
          />

          <DemoCard id="loading-variants" title="Variantes e Cores Semânticas">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                <Loading variant="spinner" size="lg" tone="primary" />
                <span className="text-xs font-mono text-zinc-500">spinner</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                <Loading variant="dots" size="lg" tone="info" />
                <span className="text-xs font-mono text-zinc-500">dots</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                <Loading variant="ring" size="lg" tone="success" />
                <span className="text-xs font-mono text-zinc-500">ring</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                <Loading variant="ball" size="lg" tone="warning" />
                <span className="text-xs font-mono text-zinc-500">ball</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                <Loading variant="bars" size="lg" tone="info" />
                <span className="text-xs font-mono text-zinc-500">bars</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-5">
                <Loading variant="infinity" size="lg" tone="danger" />
                <span className="text-xs font-mono text-zinc-500">
                  infinity
                </span>
              </div>
            </div>
          </DemoCard>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

        {/* ── PullToRefresh ────────────────────────────────────────────── */}
        <section id="pull-to-refresh" className="space-y-8 pb-10 sm:pb-14 scroll-mt-20">
          <SectionHeader
            label="PullToRefresh"
            title="PullToRefresh"
            description="Componente de gesto touch de puxar para atualizar (pull-to-refresh) para listagens de eventos, deploys e sincronização em tempo real."
          />

          <DemoCard
            id="pull-to-refresh-demo"
            title="Arraste para baixo em dispositivos touch (ou clique em Atualizar) para recarregar"
          >
            <PullToRefreshShowcaseDemo />
          </DemoCard>
        </section>
      </div>
    </main>
  );
}

function ToggleGroupShowcaseDemo() {
  const [view, setView] = React.useState("grid");
  const [formats, setFormats] = React.useState<string[]>(["bold"]);
  const [align, setAlign] = React.useState("left");
  const [pinned, setPinned] = React.useState(true);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 space-y-2.5">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          Visualização (Single)
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={view}
          onValueChange={(v: string) => v && setView(v)}
          options={[
            {
              value: "grid",
              label: "Grade",
              icon: <LayoutGrid size={14} />,
            },
            { value: "list", label: "Lista", icon: <List size={14} /> },
            { value: "table", label: "Tabela", icon: <Table2 size={14} /> },
          ]}
        />
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 space-y-2.5">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          Formatação (Multiple)
        </p>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={formats}
          onValueChange={setFormats}
          options={[
            { value: "bold", label: <Bold size={14} />, ariaLabel: "Negrito" },
            {
              value: "italic",
              label: <Italic size={14} />,
              ariaLabel: "Itálico",
            },
            {
              value: "underline",
              label: <Underline size={14} />,
              ariaLabel: "Sublinhado",
            },
          ]}
        />
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 space-y-2.5">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Alinhamento (Pills)</p>
        <ToggleGroup
          type="single"
          variant="pills"
          size="sm"
          value={align}
          onValueChange={(v: string) => v && setAlign(v)}
          options={[
            {
              value: "left",
              label: <AlignLeft size={14} />,
              ariaLabel: "Esquerda",
            },
            {
              value: "center",
              label: <AlignCenter size={14} />,
              ariaLabel: "Centro",
            },
            {
              value: "right",
              label: <AlignRight size={14} />,
              ariaLabel: "Direita",
            },
          ]}
        />
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4 space-y-2.5">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Toggle Individual</p>
        <Toggle
          variant="outline"
          size="sm"
          pressed={pinned}
          onPressedChange={setPinned}
        >
          <Bell size={14} />
          {pinned ? "Alertas Ativos" : "Alertas Silenciados"}
        </Toggle>
      </div>
    </div>
  );
}

function SwapShowcaseDemo() {
  const [themeOn, setThemeOn] = React.useState(false);
  const [lockOn, setLockOn] = React.useState(true);
  const [soundOn, setSoundOn] = React.useState(true);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="flex items-center gap-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4">
        <Swap
          active={themeOn}
          onChange={setThemeOn}
          effect="rotate"
          className="h-11 w-11 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs"
          onElement={<Sun size={20} className="text-amber-500" />}
          offElement={<Moon size={20} className="text-indigo-500" />}
        />
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Rotate
          </p>
          <p className="text-xs text-zinc-500">
            {themeOn ? "Modo Claro" : "Modo Escuro"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4">
        <Swap
          active={lockOn}
          onChange={setLockOn}
          effect="flip"
          className="h-11 w-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs"
          onElement={
            <Lock
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
          }
          offElement={
            <Unlock size={20} className="text-amber-600 dark:text-amber-400" />
          }
        />
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Flip 3D
          </p>
          <p className="text-xs text-zinc-500">
            {lockOn ? "Acesso Protegido" : "Acesso Desbloqueado"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 p-4">
        <Swap
          active={soundOn}
          onChange={setSoundOn}
          effect="fade"
          className="h-11 w-11 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs"
          onElement={<Volume2 size={20} className="text-sky-500" />}
          offElement={<VolumeX size={20} className="text-zinc-400" />}
        />
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Fade
          </p>
          <p className="text-xs text-zinc-500">
            {soundOn ? "Notificações Sonoras" : "Silenciado"}
          </p>
        </div>
      </div>
    </div>
  );
}

function PullToRefreshShowcaseDemo() {
  const [orders, setOrders] = React.useState([
    {
      id: "DEP-9041",
      item: "Release v2.1.0 — Core & Primitives",
      filial: "sa-east-1",
      status: "Publicado",
    },
    {
      id: "DEP-9040",
      item: "Worker de Sincronização de Eventos",
      filial: "us-east-1",
      status: "Em Execução",
    },
    {
      id: "DEP-9039",
      item: "Gateway de Autenticação OAuth",
      filial: "eu-west-1",
      status: "Estável",
    },
  ]);

  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 900));
    const randomId = `DEP-${Math.floor(9042 + Math.random() * 50)}`;
    setOrders((prev) => [
      {
        id: randomId,
        item: "Atualização de Segurança TLS 1.3",
        filial: "sa-east-1",
        status: "Novo Deploy",
      },
      ...prev.slice(0, 3),
    ]);
    toast.success(`Lista atualizada! Evento #${randomId} recebido.`);
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
      <PullToRefresh onRefresh={handleRefresh} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500">
          Últimos pedidos sincronizados
        </span>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<RefreshCw size={13} />}
          onClick={handleRefresh}
        >
          Atualizar agora
        </Button>
      </div>
      <div className="space-y-2">
        {orders.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm"
          >
            <div>
              <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 mr-2">
                #{o.id}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {o.item}
              </span>
              <span className="ml-2 text-xs text-zinc-500">· {o.filial}</span>
            </div>
            <StatusBadge label={o.status} tone="success" />
          </div>
        ))}
      </div>
    </div>
  );
}
