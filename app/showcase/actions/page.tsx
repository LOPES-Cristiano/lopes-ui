"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import ConfirmDialog from "@/components/ConfirmDialog";
import Drawer from "@/components/Drawer";
import EmptyState from "@/components/EmptyState";
import StatusPage from "@/components/StatusPage";
import CodeBlock from "@/components/CodeBlock";
import toast, { ToastPreview } from "@/components/Toast";
import { useAsyncButton } from "@/hooks/useAsyncButton";
import { FileSearch, Lock, AlertTriangle, Download, ArrowRight, ArrowUp, MousePointer2, Plus, Check, RefreshCw, Save, Pencil, Trash2, ExternalLink, Bell, Settings, Search } from "lucide-react";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  const [side, setSide] = React.useState<"right"|"left"|"top"|"bottom">("right");
  const [size, setSize] = React.useState<"sm"|"md"|"lg"|"xl">("md");
  return (
    <div className="flex flex-wrap gap-3">
      {(["right","left","top","bottom"] as const).map((s) => (
        <Button key={s} variant="outline" size="sm" onClick={() => { setSide(s); setSize("md"); setOpen(true); }}>
          {s}
        </Button>
      ))}
      {(["sm","md","lg","xl"] as const).map((sz) => (
        <Button key={sz} variant="secondary" size="sm" onClick={() => { setSide("right"); setSize(sz); setOpen(true); }}>
          right · {sz}
        </Button>
      ))}
      <Button variant="primary" size="sm" onClick={() => { setSide("right"); setSize("md"); setOpen(true); }}>
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
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>Confirmar</Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Conteúdo do drawer. Pode conter formulários, listas, detalhes ou qualquer elemento React.
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
      return new Promise<void>((resolve) => setTimeout(() => { setOpen(false); toast("Ação confirmada!"); resolve(); }, 1800));
    }
    setOpen(false);
    toast("Ação confirmada!");
  };
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{triggerLabel}</Button>
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
    async () => { await new Promise((resolve) => setTimeout(resolve, 5000)); },
    { timeout: 3000, timeoutMessage: "Ação demorou demais!", timeoutType: "error",
      onErrorMessage: "Erro inesperado!", onErrorType: "error" }
  );

  const notifySuccess  = () => toast.success('Salvo com sucesso!');
  const notifyError    = () => toast.error('Algo deu errado.');
  const notifyBasic    = () => toast('Muito bom!', { icon: '👏' });
  const notifyWarning  = () => toast.warning('Atenção: essa ação não pode ser desfeita.');
  const notifyInfo     = () => toast.info('Nova atualização disponível.', { action: { label: 'Atualizar', onClick: () => {} } });
  const notifyAction   = () => toast.success('Arquivo excluído.', { action: { label: 'Desfazer', onClick: () => toast.success('Ação desfeita!') } });
  const notifyLoading  = () => { const id = toast.loading('Carregando...'); setTimeout(() => toast.success('Pronto!', { id }), 2000); };
  const notifyPromise  = () => {
    const p = new Promise<string>((resolve, reject) => {
      setTimeout(() => (Math.random() > 0.3 ? resolve('ok') : reject(new Error('fail'))), 1500);
    });
    toast.promise(p, { loading: 'Salvando...', success: <b>Configurações salvas!</b>, error: <b>Falha ao salvar.</b> });
  };
  const notifyBig    = () => toast('Esta notificação tem um texto bem longo para demonstrar a quebra de linha e o comportamento do layout com mensagens extensas.', { duration: 6000 });
  const notifyStyled = () => toast('Olá! 👋', { icon: '🌙', duration: 5000 });

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
                <Button onClick={() => toast('clicou')}>Default</Button>
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
                <Button leftIcon={<MousePointer2 size={16}/>} variant="primary">Ação</Button>
                <Button rightIcon={<Download size={16}/>} variant="outline">Baixar</Button>
                <Button loading={loading} onClick={handleClick} variant="primary">Async (3s timeout)</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-semantic" title="Cores semânticas">
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="success" leftIcon={<Check size={15}/>}>Confirmar</Button>
                <Button variant="success-outline" leftIcon={<Check size={15}/>}>Confirmar</Button>
                <Button variant="warning" leftIcon={<AlertTriangle size={15}/>}>Atenção</Button>
                <Button variant="warning-outline" leftIcon={<AlertTriangle size={15}/>}>Atenção</Button>
                <Button variant="info" leftIcon={<Bell size={15}/>}>Informação</Button>
                <Button variant="info-outline" leftIcon={<Bell size={15}/>}>Informação</Button>
                <Button variant="destructive" leftIcon={<Trash2 size={15}/>}>Excluir</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-pill" title="Pill (arredondado)">
              <div className="flex flex-wrap gap-3 items-center">
                <Button pill variant="primary">Primary</Button>
                <Button pill variant="success">Sucesso</Button>
                <Button pill variant="warning">Aviso</Button>
                <Button pill variant="outline">Outline</Button>
                <Button pill variant="ghost">Ghost</Button>
                <Button pill variant="destructive">Excluir</Button>
                <Button pill variant="primary" leftIcon={<Plus size={15}/>}>Novo item</Button>
                <Button pill variant="success-outline" leftIcon={<Check size={15}/>} size="sm">Aprovado</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-square" title="Só ícone (square)">
              <div className="flex flex-wrap gap-3 items-center">
                <Button square variant="primary" aria-label="Adicionar"><Plus size={16}/></Button>
                <Button square variant="default" aria-label="Configurações"><Settings size={16}/></Button>
                <Button square variant="outline" aria-label="Buscar"><Search size={16}/></Button>
                <Button square variant="secondary" aria-label="Salvar"><Save size={16}/></Button>
                <Button square variant="ghost" aria-label="Atualizar"><RefreshCw size={16}/></Button>
                <Button square variant="success" aria-label="Confirmar"><Check size={16}/></Button>
                <Button square variant="warning" aria-label="Atenção"><AlertTriangle size={16}/></Button>
                <Button square variant="destructive" aria-label="Excluir"><Trash2 size={16}/></Button>
                <Button square pill variant="primary" aria-label="Adicionar"><Plus size={16}/></Button>
                <Button square pill variant="ghost" aria-label="Editar"><Pencil size={16}/></Button>
              </div>
            </DemoCard>

            <DemoCard id="button-link" title="Link">
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="link">Ver mais</Button>
                <Button variant="link" rightIcon={<ArrowRight size={14}/>}>Saiba mais</Button>
                <Button variant="link" rightIcon={<ExternalLink size={14}/>}>Abrir em nova aba</Button>
                <Button variant="link" onClick={() => toast("Cancelado")}>Cancelar</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-disabled" title="Estado desabilitado">
              <div className="flex flex-wrap gap-3 items-center">
                <Button disabled>Default</Button>
                <Button disabled variant="primary">Primary</Button>
                <Button disabled variant="success">Sucesso</Button>
                <Button disabled variant="warning">Aviso</Button>
                <Button disabled variant="outline">Outline</Button>
                <Button disabled variant="ghost">Ghost</Button>
                <Button disabled variant="destructive">Excluir</Button>
                <Button disabled variant="link">Link</Button>
              </div>
            </DemoCard>

            <DemoCard id="button-fullwidth" title="Largura total">
              <div className="space-y-2 max-w-sm">
                <Button variant="primary" className="w-full" leftIcon={<Save size={15}/>}>Salvar alterações</Button>
                <Button variant="outline" className="w-full">Cancelar</Button>
                <Button variant="success" className="w-full" leftIcon={<Check size={15}/>}>Confirmar pedido</Button>
              </div>
            </DemoCard>

            <div id="button-props" className="mt-6">
              <PropsTable rows={[
                ["variant",    "string",   "default", "solid | outline | ghost | primary | secondary | destructive | success | success-outline | warning | warning-outline | info | info-outline | link"],
                ["size",       "string",   "md",      "sm | md | lg"],
                ["pill",       "boolean",  "false",   "Forma pill — rounded-full"],
                ["square",     "boolean",  "false",   "Modo só-ícone — padding igual, sem min-w"],
                ["leftIcon",   "ReactNode","—",       "Ícone à esquerda do label"],
                ["rightIcon",  "ReactNode","—",       "Ícone à direita do label"],
                ["loading",    "boolean",  "false",   "Exibe spinner e desabilita o botão"],
                ["disabled",   "boolean",  "false",   "Desabilita o botão"],
                ["componentId","string",   "—",       "ID para inventário de componentes"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Button.tsx" language="tsx" code={`<Button\n  variant="primary"\n  size="lg"\n  leftIcon={<Download size={16} />}\n  loading={isSaving}\n  onClick={handleSave}\n>\n  Salvar alterações\n</Button>`} />
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
                  <Button square leftIcon={<Download />} tooltip="Download" aria-label="Download file"
                    confirm={{ title: 'Iniciar download?', description: 'Deseja iniciar o download do arquivo?' }}
                    onClick={() => toast.success('Download iniciado')} componentId="demo.action.download"
                  />
                  <span className="text-xs text-zinc-400">Com confirm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button square leftIcon={<ArrowUp />} tooltip="Topo" aria-label="Back to top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="ghost"
                  />
                  <span className="text-xs text-zinc-400">Ghost</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button square leftIcon={<AlertTriangle />} tooltip="Atenção" aria-label="Warning"
                    onClick={() => toast.error('Ação perigosa!')} variant="destructive"
                  />
                  <span className="text-xs text-zinc-400">Destructive</span>
                </div>
              </div>
            </DemoCard>

            <div id="action-props" className="mt-6">
              <PropsTable rows={[
                ["tooltip",     "string",          "—",     "Texto do tooltip ao hover"],
                ["confirm",     "boolean | object", "—",     "Exibe diálogo de confirmação antes do onClick"],
                ["square",      "boolean",          "false", "Padding igual em todos os lados (ideal para ícones)"],
                ["aria-label",  "string",          "—",     "Label acessível para screen readers"],
                ["componentId", "string",          "—",     "ID para inventário de componentes"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Button.tsx" language="tsx" code={`<Button\n  square\n  leftIcon={<Trash2 />}\n  tooltip="Excluir registro"\n  aria-label="Excluir"\n  variant="destructive"\n  confirm={{\n    title: "Excluir registro?",\n    description: "Esta ação não pode ser desfeita.",\n    confirmLabel: "Excluir",\n  }}\n  onClick={handleDelete}\n/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="alerts" className="space-y-10 pb-10 sm:pb-14">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Alert</h2>
              <p className="mt-1 text-zinc-500">Notificações inline ou modais com variantes semânticas, ações e dismiss.</p>
            </div>

            {/* Variants */}
            <div id="alert-variants" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Variantes inline</h3>
              <div className="space-y-3">
                <Alert variant="info" title="Informação" description="Esta é uma mensagem informativa para o usuário." dismissible />
                <Alert variant="success" title="Sucesso!" description="Operação concluída com êxito." dismissible />
                <Alert variant="warning" title="Atenção" description="Verifique os dados antes de continuar." dismissible />
                <Alert variant="danger" title="Erro" description="Não foi possível processar a solicitação." dismissible />
                <Alert variant="neutral" title="Nota" description="Nenhuma ação é necessária no momento." dismissible />
              </div>
            </div>

            {/* With actions */}
            <div id="alert-actions" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Com ações</h3>
              <div className="space-y-3">
                <Alert
                  variant="warning"
                  title="Sessão expirando"
                  description="Você será desconectado em 5 minutos por inatividade."
                  actions={[
                    { label: "Renovar sessão", onClick: () => toast.success("Sessão renovada!") },
                    { label: "Sair agora", onClick: () => toast("Saindo…"), variant: "ghost" },
                  ]}
                />
                <Alert
                  variant="danger"
                  title="Ação irreversível"
                  description="Esta operação não pode ser desfeita após confirmação."
                  actions={[
                    { label: "Confirmar", onClick: () => toast.error("Excluído!") },
                    { label: "Cancelar", onClick: () => {}, variant: "ghost" },
                  ]}
                />
              </div>
            </div>

            {/* Dialog mode */}
            <div id="alert-dialog" className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Modo Dialog</h3>
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
                  { label: "Salvar mesmo assim", onClick: () => { toast.success("Salvo!"); setAlertDialogOpen(false); } },
                  { label: "Cancelar", onClick: () => setAlertDialogOpen(false), variant: "ghost" },
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
                  { label: "Sim, excluir", onClick: () => { toast.error("Conta excluída!"); setAlertDialogOpen2(false); } },
                  { label: "Não, manter", onClick: () => setAlertDialogOpen2(false), variant: "ghost" },
                ]}
              />
            </div>

            <div id="alert-props" className="space-y-4">
              <PropsTable rows={[
                ["title",       "string",                                          "—",      "Título do alerta"],
                ["description", "string | ReactNode",                              "—",      "Texto descritivo"],
                ["variant",     "'info'|'success'|'warning'|'danger'|'neutral'",   "'info'", "Estilo semântico"],
                ["icon",        "LucideIcon | null",                               "—",      "Override do ícone padrão (null remove o ícone)"],
                ["dismissible", "boolean",                                          "false",  "Exibe botão × para fechar"],
                ["onDismiss",   "() => void",                                       "—",      "Callback ao fechar"],
                ["actions",     "AlertAction[]",                                    "—",      "Botões de ação inline"],
                ["dialog",      "boolean",                                          "false",  "Renderiza como modal em vez de banner"],
                ["open",        "boolean",                                          "—",      "Controla visibilidade (necessário com dialog)"],
                ["onClose",     "() => void",                                       "—",      "Callback para fechar o dialog"],
                ["className",   "string",                                           "—",      "Classes adicionais"],
                ["componentId", "string",                                           "—",      "Identificador de controle de acesso"],
              ]} />
              <CodeBlock code={`import Alert from "@/components/Alert";

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
/>`} />
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

            <DemoCard id="confirm-dialog-body" title="Com conteúdo extra e loading simulado">
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["open",          "boolean",                           "—",        "Controla visibilidade"],
                ["title",         "string",                            "—",        "Título do dialog"],
                ["description",   "string",                            "—",        "Texto descritivo"],
                ["children",      "ReactNode",                         "—",        "Conteúdo extra abaixo da descrição"],
                ["variant",       "'danger'|'warning'|'info'",         "'danger'", "Tom visual e cor do botão confirmar"],
                ["icon",          "LucideIcon",                        "—",        "Ícone custom (sobrescreve preset)"],
                ["confirmLabel",  "string",                            "'Confirmar'","Label do botão confirmar"],
                ["cancelLabel",   "string",                            "'Cancelar'","Label do botão cancelar"],
                ["loading",       "boolean",                           "false",    "Estado de loading externo no confirmar"],
                ["onConfirm",     "() => void | Promise<void>",        "—",        "Callback de confirmação (suporta async)"],
                ["onCancel",      "() => void",                        "—",        "Callback de cancelamento"],
              ]} />
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
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["open",             "boolean",                          "—",       "Controla visibilidade"],
                ["onClose",          "() => void",                       "—",       "Chamado ao fechar (Escape ou backdrop)"],
                ["side",             "\"right\"|\"left\"|\"top\"|\"bottom\"", "\"right\"", "Borda de onde o drawer desliza"],
                ["size",             "\"sm\"|\"md\"|\"lg\"|\"xl\"|\"full\"",  "\"md\"",   "Largura (left/right) ou altura (top/bottom)"],
                ["title",            "ReactNode",                        "—",       "Título no cabeçalho"],
                ["description",      "ReactNode",                        "—",       "Subtexto no cabeçalho"],
                ["footer",           "ReactNode",                        "—",       "Slot sticky no rodapé"],
                ["closeOnBackdrop",  "boolean",                          "true",    "Fecha ao clicar no backdrop"],
              ]} />
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
                {(["empty","search","error","no-access","offline","not-found"] as const).map((p) => (
                  <div key={p} className="bg-white dark:bg-zinc-900 flex items-center justify-center">
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
                    { label: "Criar pedido", variant: "primary", onClick: () => toast("Criar pedido") },
                    { label: "Importar CSV", variant: "secondary", onClick: () => toast("Importar") },
                  ]}
                />
              </div>
            </DemoCard>

            <DemoCard id="empty-state-sizes" title="Tamanhos">
              <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
                {(["sm","md","lg"] as const).map((s) => (
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
                    { label: "Limpar filtros", variant: "primary", onClick: () => toast("Filtros limpos") },
                  ]}
                />
              </div>
            </DemoCard>

            <div id="empty-state-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["preset",        "EmptyStatePreset",             "'empty'",  "Preset com ícone e copy padrão"],
                ["title",         "string",                       "—",        "Substitui o título do preset"],
                ["description",   "string",                       "—",        "Substitui a descrição do preset"],
                ["icon",          "LucideIcon",                   "—",        "Ícone customizado (sobrescreve preset)"],
                ["illustration",  "ReactNode",                    "—",        "Nó custom (SVG, imagem) no lugar do ícone"],
                ["actions",       "EmptyStateAction[]",           "—",        "Botões de ação abaixo do texto"],
                ["size",          "'sm'|'md'|'lg'",               "'md'",     "Tamanho geral do componente"],
                ["fill",          "boolean",                      "false",    "Ocupa 100% da altura e centraliza"],
              ]} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <strong>EmptyStatePreset:</strong>{" "}
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                  {"'empty' | 'search' | 'error' | 'no-access' | 'offline' | 'not-found' | 'custom'"}
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
                  <div key={v} className="overflow-hidden rounded-xl border border-zinc-200">
                    <StatusPage
                      inline
                      variant={v}
                      code={Number(v)}
                      title={v === "404" ? "Não encontrado" : v === "403" ? "Sem acesso" : "Erro interno"}
                      description={v === "404" ? "Página não encontrada." : v === "403" ? "Você não tem permissão." : "Algo deu errado."}
                    />
                  </div>
                ))}
              </div>
            </DemoCard>

            <DemoCard id="status-fullscreen" title="Páginas full-screen">
              <div className="flex flex-wrap gap-3">
                <Button square leftIcon={<FileSearch />} tooltip="404" aria-label="Go to 404" onClick={() => router.push('/not-found')} variant="outline" />
                <Button square leftIcon={<Lock />} tooltip="403" aria-label="Go to 403" onClick={() => router.push('/access-denied')} variant="ghost" />
                <Button square leftIcon={<AlertTriangle />} tooltip="500" aria-label="Cause 500" onClick={() => router.push('/cause-error')} variant="destructive" />
              </div>
            </DemoCard>

            <div id="status-props" className="mt-6">
              <PropsTable rows={[
                ["variant",       "string",   "—",     "404 | 403 | 500"],
                ["code",          "number",   "—",     "Código exibido como decoração de fundo"],
                ["title",         "string",   "—",     "Título da mensagem"],
                ["description",   "string",   "—",     "Descrição da mensagem"],
                ["inline",        "boolean",  "false", "Remove min-h-screen para uso embutido"],
                ["primaryAction", "object",   "—",     "Botão CTA principal { label, onClick }"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="not-found.tsx" language="tsx" code={`<StatusPage\n  variant="404"\n  code={404}\n  title="Página não encontrada"\n  description="O endereço que você acessou não existe."\n  primaryAction={{ label: "Voltar ao início", onClick: () => router.push("/") }}\n/>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="toasts">
            <SectionHeader
              label="Toasts"
              title="Toast Notifications"
              description="Sistema de notificações customizado, sem dependências externas. 6 tipos, ações inline, promise com auto-transition e animações com spring physics."
            />

            <DemoCard id="toasts-preview" title="Todos os tipos">
              <div className="flex flex-col gap-3">
                <ToastPreview type="success" message="Configurações salvas com sucesso." />
                <ToastPreview type="error"   message="Não foi possível conectar ao servidor." />
                <ToastPreview type="warning" message="Atenção: essa ação não pode ser desfeita." />
                <ToastPreview type="info"    message="Nova versão disponível." action={{ label: "Atualizar" }} />
                <ToastPreview type="loading" message="Carregando dados…" showBar={false} />
                <ToastPreview type="default" message="Arquivo copiado para a área de transferência." icon="📋" />
              </div>
            </DemoCard>

            <DemoCard id="toasts-examples" title="Exemplos interativos — clique para disparar">
              <div className="flex flex-wrap gap-3">
                <Button onClick={notifySuccess} variant="primary"     size="sm">success</Button>
                <Button onClick={notifyError}   variant="destructive" size="sm">error</Button>
                <Button onClick={notifyWarning} variant="outline"     size="sm">warning</Button>
                <Button onClick={notifyInfo}    variant="secondary"   size="sm">info + ação</Button>
                <Button onClick={notifyBasic}   variant="ghost"       size="sm">basic + emoji</Button>
                <Button onClick={notifyLoading} variant="ghost"       size="sm">loading → success</Button>
                <Button onClick={notifyPromise} variant="outline"     size="sm">promise</Button>
                <Button onClick={notifyAction}  variant="secondary"   size="sm">com ação</Button>
                <Button onClick={notifyBig}                           size="sm">texto longo</Button>
                <Button onClick={notifyStyled}  variant="ghost"       size="sm">emoji icon</Button>
              </div>
            </DemoCard>

            <div className="mt-6 space-y-4">
              <CodeBlock filename="toasts.tsx" language="tsx" code={`import toast, { Toaster } from "@/components/Toast";\n\n// No layout (uma vez):\n<Toaster position="top-right" />\n\n// Tipos básicos\ntoast.success('Salvo com sucesso!');\ntoast.error('Algo deu errado.');\ntoast.warning('Atenção: a ação não pode ser desfeita.');\ntoast.info('Nova atualização.', {\n  action: { label: 'Atualizar', onClick: () => router.push('/update') },\n});\n\n// Loading manual (id reutilizado)\nconst id = toast.loading('Carregando...');\ntoast.success('Pronto!', { id });\n\n// Promise auto-transition\ntoast.promise(salvarDados(), {\n  loading: 'Salvando...',\n  success: 'Dados salvos!',\n  error: (err) => \`Falha: \${err.message}\`,\n});\n\n// Dismiss\ntoast.dismiss();   // todos\ntoast.dismiss(id); // um específico`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
