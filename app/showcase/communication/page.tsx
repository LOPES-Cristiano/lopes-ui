"use client";

import React from "react";
import ChatMessage, { type ChatMessageProps } from "@/components/ChatMessage";
import ChatComposer from "@/components/ChatComposer";
import ChatConversationItem from "@/components/ChatConversationItem";
import ChatWindow, { type ChatConversation } from "@/components/ChatWindow";
import EmailComposer, { type EmailAttachment } from "@/components/EmailComposer";
import NotificationBell, { type NotificationItem } from "@/components/NotificationBell";
import SmartObject, { type SmartObjectProps } from "@/components/SmartObject";
import Switch from "@/components/form/Switch";
import ContextMenu from "@/components/ContextMenu";
import CodeBlock from "@/components/CodeBlock";
import toast from "@/components/Toast";
import type { EntitySuggestion } from "@/components/ChatComposer";
import type { EntityResolver } from "@/components/ChatMessage";
import { SectionHeader, DemoCard, PropsTable } from "@/app/showcase/_shared";

const DEMO_CONTACTS = [
  { name: "Ana Souza",      email: "ana.souza@empresa.com" },
  { name: "Bruno Lima",     email: "bruno.lima@empresa.com" },
  { name: "Carla Matos",    email: "carla.matos@empresa.com" },
  { name: "Diego Ferreira", email: "diego@infra.empresa.com" },
  { name: "Suporte TI",     email: "suporte@empresa.com" },
];

function EmailComposerDemo() {
  const [attachments, setAttachments] = React.useState<EmailAttachment[]>([]);
  return (
    <EmailComposer
      defaultTo={[{ name: "Ana Souza", email: "ana.souza@empresa.com" }]}
      defaultSubject="Reunião de alinhamento — Q3"
      contactSuggestions={DEMO_CONTACTS}
      attachments={attachments}
      signature="<strong>Cristiano Lopes</strong><br/>Engenharia de Produto · <a href='#'>empresa.com</a>"
      onAttach={(files) => {
        const newAtts: EmailAttachment[] = files.map((f, i) => ({
          id: `${Date.now()}-${i}`,
          name: f.name,
          size: f.size,
          type: f.type,
        }));
        setAttachments((prev) => [...prev, ...newAtts]);
      }}
      onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
      onSend={(p) => { toast(`Enviado para ${p.to.map((r) => r.email).join(", ")}`); }}
      onDiscard={() => { toast("Mensagem descartada"); }}
    />
  );
}

// ── ActivityFeed demo data ────────────────────────────────────────────────────

const CHAT_MESSAGES_ANA: ChatMessageProps[] = [
  { senderName: "Ana Souza", content: "Oi! A reunião de amanhã ainda está de pé?", timestamp: "09:40", showAvatar: true },
  { content: "Sim! Às 10h na sala 2.", mine: true, timestamp: "09:41", status: "read", showAvatar: false },
  { senderName: "Ana Souza", content: "Perfeito. Você pode enviar a pauta antes?", timestamp: "09:42", showAvatar: false },
  { content: "Claro, mando em breve 👍", mine: true, timestamp: "09:43", status: "delivered", showAvatar: false },
  { senderName: "Ana Souza", type: "typing", showAvatar: true },
];

const CHAT_MESSAGES_BRUNO: ChatMessageProps[] = [
  { senderName: "Bruno Lima", content: "Deploy feito com sucesso ✅", timestamp: "18:28", showAvatar: true },
  { content: "Ótimo trabalho! Ambiente de produção?", mine: true, timestamp: "18:29", status: "read", showAvatar: false },
  {
    type: "attachment",
    senderName: "Bruno Lima",
    attachment: { name: "deploy-log.txt", size: "4.2 KB" },
    timestamp: "18:30",
    showAvatar: false,
  },
  { content: "Log do deploy, tudo certo.", mine: false, senderName: "Bruno Lima", timestamp: "18:30", showAvatar: false },
];

const CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: "ana",
    name: "Ana Souza",
    online: true,
    unread: 2,
    lastMessage: "Você pode enviar a pauta antes?",
    lastMessageTime: "09:42",
    messages: CHAT_MESSAGES_ANA.filter((m) => m.type !== "typing"),
  },
  {
    id: "bruno",
    name: "Bruno Lima",
    online: false,
    unread: 0,
    lastMessage: "Log do deploy, tudo certo.",
    lastMessageTime: "ontem",
    messages: CHAT_MESSAGES_BRUNO,
  },
  {
    id: "equipe",
    name: "Equipe Produto",
    online: false,
    unread: 5,
    lastMessage: "Carlos: alguém viu o Figma novo?",
    lastMessageTime: "08:15",
    messages: [
      { senderName: "Carlos Mendes", content: "Alguém viu o link do novo Figma?", timestamp: "08:15", showAvatar: true },
      { senderName: "Carlos Mendes", content: "Mando aqui depois.", timestamp: "08:16", showAvatar: false },
    ],
  },
  {
    id: "dani",
    name: "Daniela Costa",
    online: true,
    unread: 0,
    lastMessage: "Pode revisar meu PR?",
    lastMessageTime: "seg",
    messages: [
      { senderName: "Daniela Costa", content: "Oi! Pode revisar meu PR quando tiver um tempinho?", timestamp: "10:00", showAvatar: true },
      { content: "Claro! Deixa eu terminar esse ticket.", mine: true, timestamp: "10:05", status: "read", showAvatar: false },
    ],
  },
];

// ── Smart Object demo data ─────────────────────────────────────────────────

const SMART_ENTITY_REGISTRY: Record<string, SmartObjectProps> = {
  VENDA123: {
    kind: "VENDA",
    ref_id: "VENDA123",
    title: "Proposta de Venda",
    status: "analyzing",
    mode: "card",
    fields: [
      { label: "Cliente",       value: "Eletrônica Rápida Ltda." },
      { label: "Valor",         value: "R$ 48.500,00",            highlight: true },
      { label: "Parcelas",      value: "12×" },
      { label: "Vendedor",      value: "João Pedro Silva" },
      { label: "Data entrada",  value: "12/01/2025" },
      { label: "Prazo análise", value: "15/01/2025",              warning: true },
    ],
    actions: [
      {
        id: "aprovar",
        label: "Aprovar",
        variant: "success" as const,
        onClick: () => new Promise((r) => setTimeout(r, 1500)),
      },
      {
        id: "recusar",
        label: "Recusar",
        variant: "danger" as const,
        onClick: () => new Promise((r) => setTimeout(r, 1200)),
      },
      {
        id: "pedir-info",
        label: "Pedir informações",
        variant: "secondary" as const,
        onClick: () => new Promise((r) => setTimeout(r, 800)),
      },
    ],
  },
  CLIENTE42: {
    kind: "CLIENTE",
    ref_id: "CLIENTE42",
    title: "Eletrônica Rápida Ltda.",
    status: "approved",
    mode: "card",
    fields: [
      { label: "CNPJ",            value: "12.345.678/0001-99" },
      { label: "Limite aprovado", value: "R$ 150.000,00",       highlight: true },
      { label: "Score",           value: "A2 — Baixo Risco" },
      { label: "Fundação",        value: "2008" },
      { label: "Setor",           value: "Varejo Eletrônico" },
    ],
    actions: [
      {
        id: "ver-historico",
        label: "Ver histórico",
        variant: "secondary" as const,
        onClick: () => new Promise((r) => setTimeout(r, 600)),
      },
    ],
  },
  PEDIDO77: {
    kind: "PEDIDO",
    ref_id: "PEDIDO77",
    title: "Pedido de Compra",
    status: "pending",
    mode: "card",
    fields: [
      { label: "Itens",       value: "14 SKUs" },
      { label: "Total",       value: "R$ 22.300,00",  highlight: true },
      { label: "Entrega",     value: "20/01/2025",    warning: true },
      { label: "Transportadora", value: "Rápido Log" },
    ],
    actions: [
      {
        id: "confirmar",
        label: "Confirmar pedido",
        variant: "success" as const,
        onClick: () => new Promise((r) => setTimeout(r, 1000)),
      },
    ],
  },
};

const SMART_ENTITY_SUGGESTIONS: EntitySuggestion[] = [
  { ref_id: "VENDA123",  label: "Proposta de Venda",         meta: "Analisando"      },
  { ref_id: "CLIENTE42", label: "Eletrônica Rápida Ltda.",   meta: "Aprovado"        },
  { ref_id: "PEDIDO77",  label: "Pedido de Compra",          meta: "Aguardando"      },
];

const smartEntityResolver: EntityResolver = (ref_id) => {
  const e = SMART_ENTITY_REGISTRY[ref_id];
  if (!e) return undefined;
  return { kind: e.kind, title: e.title, status: e.status };
};

const SMART_CHAT_CONV: ChatConversation[] = [
  {
    id: "credito",
    name: "Análise de Crédito",
    online: true,
    unread: 1,
    lastMessage: "Vou dar uma olhada já.",
    lastMessageTime: "agora",
    messages: [
      {
        senderName: "João Pedro (Vendas)",
        content: "Oi! Precisa liberar a @VENDA123 hoje — o cliente está aguardando. Pode checar o @CLIENTE42 também?",
        timestamp: "10:15",
        showAvatar: true,
      },
      {
        content: "Ok, estava esperando a documentação do cliente. Vou dar uma olhada já.",
        mine: true,
        timestamp: "10:17",
        status: "read" as const,
        showAvatar: false,
      },
      {
        senderName: "João Pedro (Vendas)",
        content: "Ótimo! E se precisar do pedido de compra, é o @PEDIDO77.",
        timestamp: "10:18",
        showAvatar: false,
      },
    ],
  },
];

// Stable reference — Date.now() must not be called inside useState (impure during render).
const COMM_REF = new Date("2026-04-05T14:00:00.000Z").getTime();
const INITIAL_NOTIFS: NotificationItem[] = [
  { id: "dn1", type: "success", title: "Deploy concluído", description: "Versão 2.4.1 publicada em produção sem erros.", timestamp: new Date(COMM_REF - 5 * 60_000), reference: { label: "ver-2.4.1", href: "#" } },
  { id: "dn2", type: "warning", title: "Limite de uso próximo", description: "Você está a 85% do limite mensal do plano atual.", timestamp: new Date(COMM_REF - 35 * 60_000), href: "#" },
  { id: "dn3", type: "info", title: "Novo membro adicionado", description: "Ana Lima entrou na equipe como desenvolvedora.", timestamp: new Date(COMM_REF - 2 * 3600_000), avatarFallback: "AL", read: true },
  { id: "dn4", type: "danger", title: "Falha no webhook", description: "3 tentativas sem resposta do endpoint /api/events.", timestamp: new Date(COMM_REF - 26 * 3600_000), reference: { label: "Ver logs", href: "#" }, read: true },
  { id: "dn5", title: "Relatório mensal disponível", description: "O relatório de março já pode ser baixado.", timestamp: new Date(COMM_REF - 8 * 24 * 3600_000), href: "#", read: true },
];

export default function Page() {
  const [demoNotifs, setDemoNotifs] = React.useState<NotificationItem[]>(INITIAL_NOTIFS);

  return (
    <main className="flex-1 min-w-0 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-20">
          <section id="chat" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Chat"
              title="Mensagens"
              description="Componentes de chat corporativo: bolhas de mensagem, composer, lista de conversas e janela flutuante minimizável. Construídos com Avatar e Button existentes."
            />

            {/* Row 1: Bubbles + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DemoCard id="chat-bubbles" title="Bolhas de texto">
                <div className="space-y-2">
                  {CHAT_MESSAGES_ANA.map((msg, i) => (
                    <ChatMessage key={i} {...msg} />
                  ))}
                </div>
              </DemoCard>

              <DemoCard id="chat-status" title="Status de entrega (mine)">
                <div className="space-y-2">
                  <ChatMessage content="Enviando…" mine timestamp="10:00" status="sending" showAvatar={false} />
                  <ChatMessage content="Enviado" mine timestamp="10:00" status="sent" showAvatar={false} />
                  <ChatMessage content="Entregue" mine timestamp="10:01" status="delivered" showAvatar={false} />
                  <ChatMessage content="Lido ✓✓ azul" mine timestamp="10:01" status="read" showAvatar={false} />
                  <ChatMessage content="Falha no envio" mine timestamp="10:02" status="failed" showAvatar={false} />
                </div>
              </DemoCard>
            </div>

            {/* Row 2: Types + Reply */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DemoCard id="chat-types" title="Tipos de mensagem">
              <div className="space-y-3">
                <p className="text-xs font-medium text-zinc-400 uppercase">Arquivo anexado</p>
                <ChatMessage
                  type="attachment"
                  senderName="Bruno Lima"
                  attachment={{ name: "relatorio-q4-2025.pdf", size: "3.8 MB" }}
                  content="Segue o relatório para revisão."
                  timestamp="14:10"
                  showAvatar={true}
                />
                <ChatMessage
                  type="attachment"
                  mine
                  attachment={{ name: "proposta-comercial.docx", size: "1.2 MB" }}
                  timestamp="14:12"
                  status="read"
                  showAvatar={false}
                />
                <p className="text-xs font-medium text-zinc-400 uppercase mt-4">Áudio</p>
                <ChatMessage
                  type="audio"
                  senderName="Ana Souza"
                  audioDuration="0:42"
                  timestamp="15:23"
                  showAvatar={true}
                />
                <ChatMessage
                  type="audio"
                  mine
                  audioDuration="1:08"
                  timestamp="15:25"
                  status="delivered"
                  showAvatar={false}
                />
                <p className="text-xs font-medium text-zinc-400 uppercase mt-4">Imagem</p>
                <ChatMessage
                  type="image"
                  senderName="Ana Souza"
                  imageUrl="https://placehold.co/220x160/e0e7ff/4f46e5?text=Imagem"
                  imageAlt="Imagem compartilhada"
                  content="Veja esse screenshot!"
                  timestamp="09:55"
                  showAvatar={true}
                />
                <ChatMessage
                  type="image"
                  mine
                  imageUrl="https://placehold.co/220x160/f0fdf4/166534?text=Captura"
                  imageAlt="Minha captura"
                  timestamp="09:56"
                  status="read"
                  showAvatar={false}
                />
              </div>
            </DemoCard>

            <DemoCard id="chat-reply-reactions" title="Reply e reações">
              <div className="space-y-2">
                <ChatMessage
                  senderName="Ana Souza"
                  content="Reunião confirmada para segunda às 10h."
                  timestamp="08:30"
                  showAvatar={true}
                />
                <ChatMessage
                  mine
                  replyTo={{ senderName: "Ana Souza", content: "Reunião confirmada para segunda às 10h." }}
                  content="Perfeito, já bloqueei na agenda!"
                  timestamp="08:32"
                  status="read"
                  showAvatar={false}
                  reactions={[
                    { emoji: "👍", count: 2, reacted: true },
                    { emoji: "🎉", count: 1, reacted: false },
                  ]}
                />
                <ChatMessage
                  senderName="Ana Souza"
                  replyTo={{ senderName: "Você", content: "Perfeito, já bloqueei na agenda!" }}
                  content="Ótimo! Vejo vocês lá."
                  timestamp="08:33"
                  showAvatar={false}
                  reactions={[{ emoji: "❤️", count: 3, reacted: false }]}
                />
              </div>
            </DemoCard>
            </div>{/* /Row 2 */}

            {/* Row 3: Typing + Composers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DemoCard id="chat-typing" title="Indicador de digitação">
                <div className="space-y-2">
                  <ChatMessage content="Tudo bem?" mine timestamp="11:00" status="read" showAvatar={false} />
                  <ChatMessage senderName="Bruno Lima" type="typing" showAvatar={true} />
                </div>
              </DemoCard>

              <DemoCard id="chat-composer" title="Composer — toolbar">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <ChatComposer
                    onSend={() => {}}
                    onAttach={() => toast("Anexar arquivo")}
                    onEmoji={() => toast("Emoji picker")}
                    onVoice={() => toast("Gravar áudio")}
                  />
                </div>
              </DemoCard>

              <DemoCard id="chat-composer-minimal" title="Composer — minimal">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <ChatComposer
                    variant="minimal"
                    placeholder="Mensagem rápida…"
                    onSend={() => {}}
                    onVoice={() => toast("Gravar áudio")}
                  />
                </div>
              </DemoCard>
            </div>{/* /Row 3 */}

            {/* Row 4: Reply composer + Conversation list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DemoCard id="chat-composer-reply" title="Composer com reply">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <ChatComposer
                    onSend={() => {}}
                    onAttach={() => {}}
                    onEmoji={() => {}}
                    onVoice={() => {}}
                    replyTo={{
                      senderName: "Ana Souza",
                      content: "Reunião confirmada para segunda às 10h.",
                      onCancel: () => {},
                    }}
                  />
                </div>
              </DemoCard>

              <DemoCard id="chat-conversation-list" title="Lista de conversas">
                <div className="space-y-1">
                <ChatConversationItem
                  name="Ana Souza"
                  lastMessage="Você pode enviar a pauta antes?"
                  timestamp="09:42"
                  unread={2}
                  online
                  active
                />
                <ChatConversationItem
                  name="Bruno Lima"
                  lastMessage="Log do deploy, tudo certo."
                  timestamp="ontem"
                  pinned
                />
                <ChatConversationItem
                  name="Equipe Produto"
                  lastMessage="Carlos: alguém viu o Figma novo?"
                  timestamp="08:15"
                  unread={5}
                />
                <ChatConversationItem
                  name="Daniela Costa"
                  lastMessage="Pode revisar meu PR?"
                  timestamp="seg"
                  online
                  muted
                />
                </div>
              </DemoCard>
            </div>{/* /Row 4 */}

            {/* ChatWindow */}
            <DemoCard id="chat-window" title="Chat Window — flutuante e minimizável">
              <p className="text-xs text-zinc-400 mb-4">
                Clique no botão azul para abrir. Navegue entre conversas, envie mensagens e minimize a janela.
              </p>
              <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-end justify-end min-h-[480px]">
                {/* Faux app content — below the window via z-0 */}
                <div className="absolute inset-0 p-6 space-y-4 pointer-events-none z-0" aria-hidden>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
                  </div>
                </div>
                {/* ChatWindow — explicit z-10 to always render above faux content */}
                <div className="relative z-10 p-4">
                  <ChatWindow
                    title="Mensagens"
                    conversations={CHAT_CONVERSATIONS}
                    defaultOpen
                  />
                </div>
              </div>
            </DemoCard>

            {/* Smart Object chat */}
            <DemoCard id="smart-chat" title="Smart Object — objetos vivos no chat">
              <p className="text-xs text-zinc-400 mb-4">
                Digite <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">@</kbd> no composer para ver sugestões de entidades. Clique num chip <span className="font-semibold text-indigo-500">@VENDA123</span> para abrir o painel de detalhes com ações assíncronas.
              </p>
              <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-end justify-end min-h-[480px]">
                <div className="absolute inset-0 p-6 space-y-4 pointer-events-none z-0" aria-hidden>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/5" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/5" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-4/5" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="relative z-10 p-4">
                  <ChatWindow
                    title="Crédito"
                    conversations={SMART_CHAT_CONV}
                    defaultOpen
                    entitySuggestions={SMART_ENTITY_SUGGESTIONS}
                    entityResolver={smartEntityResolver}
                    entityRegistry={SMART_ENTITY_REGISTRY}
                  />
                </div>
              </div>
            </DemoCard>

            {/* SmartObject card standalone */}
            <DemoCard id="smart-object-card" title="SmartObject — cartão autônomo">
              <p className="text-xs text-zinc-400 mb-4">
                Variante <code className="text-indigo-500">mode=&quot;card&quot;</code> com campos, status e ações assíncronas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <SmartObject
                  {...SMART_ENTITY_REGISTRY["VENDA123"]}
                  ref_id="VENDA123"
                  mode="card"
                  onOpen={() => {}}
                />
                <SmartObject
                  {...SMART_ENTITY_REGISTRY["CLIENTE42"]}
                  ref_id="CLIENTE42"
                  mode="card"
                  onOpen={() => {}}
                />
              </div>
            </DemoCard>

            {/* Props */}
            <div id="chat-props" className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatMessage</h3>
                <PropsTable rows={[
                  ["content",       "string",                                              "—",           "Texto da mensagem"],
                  ["senderName",    "string",                                              "—",           "Nome do remetente"],
                  ["avatarSrc",     "string",                                              "—",           "URL do avatar"],
                  ["mine",          "boolean",                                             "false",        "true = mensagem do usuário atual (direita, indigo)"],
                  ["type",          "'text'|'image'|'audio'|'attachment'|'typing'",        "'text'",       "Tipo de conteúdo"],
                  ["status",        "'sending'|'sent'|'delivered'|'read'|'failed'",        "—",           "Status de entrega (visível apenas em mine)"],
                  ["timestamp",     "string",                                              "—",           "Horário exibido na bolha"],
                  ["replyTo",       "{ senderName, content }",                             "—",           "Mensagem citada (reply)"],
                  ["reactions",     "{ emoji, count, reacted }[]",                         "—",           "Reações com emoji"],
                  ["attachment",    "{ name, size }",                                       "—",           "Metadados do arquivo (type='attachment')"],
                  ["imageUrl",      "string",                                              "—",           "URL da imagem (type='image')"],
                  ["audioDuration", "string",                                              "—",           "Duração do áudio (type='audio')"],
                  ["showAvatar",    "boolean",                                             "true",         "Exibe avatar e nome (false = mensagens agrupadas)"],
                  ["onReact",       "(emoji: string) => void",                             "—",           "Callback ao clicar em reação"],
                  ["onEntityClick", "(ref_id: string) => void",                            "—",           "Callback ao clicar num chip @ENTIDADE"],
                  ["entityResolver","EntityResolver",                                      "—",           "Resolve live kind/title/status de entidades no texto"],
                ]} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatComposer</h3>
                <PropsTable rows={[
                  ["onSend",            "(value: string) => void",   "—",          "Callback ao enviar mensagem"],
                  ["onAttach",          "() => void",                 "—",          "Callback ao clicar em anexar"],
                  ["onEmoji",           "() => void",                 "—",          "Callback ao clicar em emoji"],
                  ["onVoice",           "() => void",                 "—",          "Callback ao gravar áudio (exibido quando sem texto)"],
                  ["replyTo",           "{ senderName, content, onCancel }","—",  "Preview de reply com botão de cancelar"],
                  ["variant",           "'toolbar'|'minimal'",        "'toolbar'",  "toolbar = botões attach+emoji visíveis"],
                  ["placeholder",       "string",                     "—",          "Texto placeholder do textarea"],
                  ["disabled",          "boolean",                    "false",      "Desabilita o composer"],
                  ["entitySuggestions", "EntitySuggestion[]",         "—",          "Sugestões para o autocomplete @-mention"],
                ]} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatConversationItem</h3>
                <PropsTable rows={[
                  ["name",        "string",      "—",     "Nome do contato ou grupo"],
                  ["lastMessage", "string",      "—",     "Prévia da última mensagem"],
                  ["timestamp",   "string",      "—",     "Horário / data da última mensagem"],
                  ["unread",      "number",      "0",     "Contagem de mensagens não lidas"],
                  ["online",      "boolean",     "—",     "Exibe dot de status online"],
                  ["active",      "boolean",     "false", "Estado de seleção ativo"],
                  ["muted",       "boolean",     "false", "Ícone de conversa silenciada"],
                  ["pinned",      "boolean",     "false", "Ícone de conversa fixada"],
                  ["onClick",     "() => void",  "—",     "Callback ao clicar"],
                ]} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">ChatWindow</h3>
                <PropsTable rows={[
                  ["conversations",   "ChatConversation[]",            "—",           "Lista de conversas com mensagens"],
                  ["title",           "string",                         "'Mensagens'", "Título no header da janela"],
                  ["defaultOpen",     "boolean",                        "false",       "Inicia na lista de conversas em vez do botão flutuante"],
                  ["onSend",          "(convId, msg) => void",          "—",           "Callback ao enviar mensagem"],
                  ["entitySuggestions","EntitySuggestion[]",            "—",           "Encaminhado ao composer para autocomplete @"],
                  ["entityResolver",  "EntityResolver",                 "—",           "Resolves chips inline nas mensagens"],
                  ["entityRegistry",  "Record<string, SmartObjectProps>","—",          "Dados completos para o drawer de detalhes"],
                ]} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">SmartObject</h3>
                <PropsTable rows={[
                  ["kind",    "EntityKind",          "—",      "VENDA | CLIENTE | DOCUMENTO | PEDIDO | CHAMADO"],
                  ["ref_id",  "string",              "—",      "Código de referência exibido na badge @"],
                  ["title",   "string",              "—",      "Título do cartão"],
                  ["status",  "EntityStatus",        "—",      "pending | analyzing | approved | rejected | warning | done"],
                  ["fields",  "SmartObjectField[]",  "—",      "Linhas da tabela de detalhes"],
                  ["actions", "SmartObjectAction[]", "—",      "Botões de ação com callback async"],
                  ["mode",    "'chip'|'card'",        "'card'", "chip = inline na bolha, card = painel expandido"],
                  ["onOpen",  "() => void",          "—",      "Callback ao clicar no chip (mode='chip')"],
                ]} />
              </div>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="email-composer" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Comunicação"
              title="Email Composer"
              description="Componente de composição de email com campos para destinatários (tag input + autocomplete), assunto, editor Rico e anexos. Pode ser usado em modo janela flutuante ou inline."
            />

            <DemoCard id="email-composer-window" title="Modo janela">
              <div className="p-6 flex justify-center">
                <EmailComposerDemo />
              </div>
            </DemoCard>

            <DemoCard id="email-composer-inline" title="Modo inline (em formulário)">
              <div className="p-6">
                <EmailComposer
                  mode="inline"
                  defaultTo={[{ name: "Suporte", email: "suporte@empresa.com" }]}
                  defaultSubject="Solicitação de suporte"
                  contactSuggestions={DEMO_CONTACTS}
                  onSend={(p) => { toast(`Enviado para ${p.to.map((r) => r.email).join(", ")}`); }}
                  onDiscard={() => { toast("Descartado"); }}
                />
              </div>
            </DemoCard>

            <div id="email-composer-props" className="space-y-4">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Props</h3>
              <PropsTable rows={[
                ["defaultTo",          "EmailRecipient[]",        "[]",           "Destinatários iniciais"],
                ["defaultCc",          "EmailRecipient[]",        "[]",           "CC inicial"],
                ["defaultBcc",         "EmailRecipient[]",        "[]",           "BCC inicial"],
                ["defaultSubject",     "string",                  "''",           "Assunto inicial"],
                ["defaultBody",        "string",                  "''",           "Corpo HTML inicial"],
                ["signature",          "string",                  "—",            "HTML da assinatura (zona separada)"],
                ["contactSuggestions", "EmailRecipient[]",        "[]",           "Contatos para autocomplete"],
                ["bodyToolbar",        "ToolbarGroup[]",          "padrão email", "Grupos de toolbar do editor"],
                ["title",              "string",                  "'Nova mensagem'",  "Título na barra do composer"],
                ["mode",               "'window'|'inline'",       "'window'",     "Exibição como janela ou inline"],
                ["attachments",        "EmailAttachment[]",       "[]",           "Anexos controlados externamente"],
                ["onSend",             "(p: EmailPayload) => void","—",           "Callback de envio"],
                ["onDiscard",          "() => void",              "—",            "Callback de descarte"],
                ["onAttach",           "(files: File[]) => void", "—",            "Callback ao adicionar anexos"],
                ["sending",            "boolean",                 "false",        "Estado de envio (loading no botão)"],
              ]} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="notification-bell" className="space-y-10 pb-10 sm:pb-14">
            <SectionHeader
              label="Header"
              title="Notification Bell"
              description="Sino de notificações com contagem, painel agrupado por data, avatar, referência clicável e ações por item."
            />

            <DemoCard id="notification-bell-demo" title="Demo interativo — clique no sino">
              <div className="flex items-center gap-4">
                <NotificationBell
                  notifications={demoNotifs}
                  onMarkRead={(id) => setDemoNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))}
                  onMarkAllRead={() => setDemoNotifs((p) => p.map((n) => ({ ...n, read: true })))}
                  onDismiss={(id) => setDemoNotifs((p) => p.filter((n) => n.id !== id))}
                />
                <span className="text-sm text-zinc-400">← clique para abrir o painel</span>
              </div>
            </DemoCard>

            <DemoCard id="notification-bell-empty" title="Estado vazio">
              <NotificationBell notifications={[]} />
            </DemoCard>

            <div className="mt-6 space-y-4">
              <CodeBlock filename="NotificationBell.tsx" language="tsx" code={`import NotificationBell, { type NotificationItem } from "@/components/NotificationBell";

const [notifs, setNotifs] = useState<NotificationItem[]>([
  {
    id: "1",
    type: "success",            // default | info | success | warning | danger
    title: "Deploy concluído",
    description: "v2.4.1 publicada sem erros.",
    timestamp: new Date(),      // Date ou ISO string
    reference: { label: "ver-2.4.1", href: "/releases/2.4.1" },
  },
  {
    id: "2",
    type: "info",
    title: "Novo membro",
    description: "Ana Lima entrou na equipe.",
    timestamp: new Date(Date.now() - 2 * 3600_000),
    avatarFallback: "AL",       // ou avatar: "/foto.jpg"
    read: true,
  },
]);

<NotificationBell
  notifications={notifs}
  onMarkRead={(id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))}
  onMarkAllRead={() => setNotifs((p) => p.map((n) => ({ ...n, read: true })))}
  onDismiss={(id) => setNotifs((p) => p.filter((n) => n.id !== id))}
  onNotificationClick={(n) => console.log("clicked", n.id)}
/>`} />
            </div>

            <div id="notification-bell-props" className="space-y-4">
              <PropsTable rows={[
                ["notifications",        "NotificationItem[]",              "[]",  "Lista de notificações"],
                ["onMarkRead",           "(id: string) => void",            "—",   "Chamado ao marcar uma notificação como lida"],
                ["onMarkAllRead",        "() => void",                      "—",   "Chamado ao marcar todas como lidas"],
                ["onDismiss",            "(id: string) => void",            "—",   "Remove uma notificação da lista"],
                ["onNotificationClick",  "(n: NotificationItem) => void",   "—",   "Chamado ao clicar em qualquer notificação"],
                ["componentId",          "string",                          "—",   "Identificador para controle de acesso"],
              ]} />
              <p className="text-xs text-zinc-400 mt-2">
                NotificationItem:{" "}
                <code className="font-mono text-indigo-600">
                  {"{ id, title, timestamp, type?, description?, href?, reference?, avatar?, avatarFallback?, read?, onClick? }"}
                </code>
              </p>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />

          <section id="interactions">
            <SectionHeader
              label="Interação"
              title="Switch e Context Menu"
              description="Toggle para ativar/desativar configurações e menu de contexto acionado por clique-direito, clique simples ou teclas de atalho."
            />

            <DemoCard id="switch-sizes" title="Switch — tamanhos e cores">
              <div className="flex flex-wrap gap-6 items-start">
                <Switch size="sm" inlineLabel="Pequeno" defaultChecked />
                <Switch size="md" inlineLabel="Médio" defaultChecked color="indigo" />
                <Switch size="lg" inlineLabel="Grande" defaultChecked color="emerald" />
              </div>
              <div className="mt-4 flex flex-wrap gap-6 items-start">
                <Switch size="md" inlineLabel="Indigo"  defaultChecked color="indigo" />
                <Switch size="md" inlineLabel="Emerald" defaultChecked color="emerald" />
                <Switch size="md" inlineLabel="Sky"     defaultChecked color="sky" />
                <Switch size="md" inlineLabel="Rose"    defaultChecked color="rose" />
                <Switch size="md" inlineLabel="Amber"   defaultChecked color="amber" />
                <Switch size="md" inlineLabel="Zinc"    defaultChecked color="zinc" />
              </div>
            </DemoCard>

            <DemoCard id="switch-label" title="Switch — label, descrição e estados">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Switch
                  label="Notificações"
                  inlineLabel="Ativar notificações"
                  description="Receba alertas por e-mail e push"
                  defaultChecked
                />
                <Switch
                  label="Modo manutenção"
                  inlineLabel="Sistema em manutenção"
                  description="Bloqueia acesso de usuários finais"
                  color="rose"
                />
                <Switch
                  inlineLabel="Desabilitado (on)"
                  defaultChecked
                  disabled
                />
                <Switch
                  inlineLabel="Desabilitado (off)"
                  disabled
                />
                <Switch
                  label="Com erro"
                  inlineLabel="Aceitar termos"
                  required
                  error="Este campo é obrigatório"
                />
                <Switch
                  label="Com tooltip"
                  inlineLabel="Auto-save"
                  tooltip="Salva rascunhos automaticamente a cada 30 segundos"
                  helpText="Pode ser desativado nas configurações"
                  defaultChecked
                />
              </div>
            </DemoCard>

            <DemoCard id="switch-label-left" title="Switch — label à esquerda (inverso)">
              <div className="flex flex-col gap-4 max-w-xs">
                <Switch inlineLabel="Tema escuro"       labelLeft defaultChecked />
                <Switch inlineLabel="Sons do sistema"   labelLeft color="emerald" />
                <Switch inlineLabel="Sincronização"     labelLeft defaultChecked color="sky" />
              </div>
            </DemoCard>

            <DemoCard id="context-menu-basic" title="Context Menu — clique direito">
              <div className="flex flex-wrap gap-4">
                <ContextMenu
                  items={[
                    { label: "Ver detalhes",  icon: undefined, shortcut: "Enter" },
                    { label: "Editar",        shortcut: "⌘E",  onClick: () => {} },
                    { label: "Duplicar",      shortcut: "⌘D",  onClick: () => {} },
                    { divider: true, label: "Mover para", children: [
                      { label: "Rascunhos" },
                      { label: "Arquivo" },
                      { label: "Lixeira", danger: true },
                    ]},
                    { divider: true, label: "Excluir", danger: true, shortcut: "⌫", onClick: () => {} },
                  ]}
                >
                  <div className="flex h-24 w-48 cursor-context-menu items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors select-none">
                    Clique direito aqui
                  </div>
                </ContextMenu>

                <ContextMenu
                  trigger="click"
                  items={[
                    { label: "Copiar link",    shortcut: "⌘C" },
                    { label: "Abrir em nova aba", shortcut: "⌘↵" },
                    { divider: true, label: "Reportar", danger: true },
                  ]}
                >
                  <div className="flex h-24 w-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 text-sm text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors select-none">
                    Clique simples aqui
                  </div>
                </ContextMenu>
              </div>
            </DemoCard>

            <DemoCard id="context-menu-rich" title="Context Menu — com ícones e submenus">
              <ContextMenu
                items={[
                  { label: "Novo arquivo",   icon: undefined, shortcut: "⌘N",  description: "Cria um arquivo em branco" },
                  { label: "Novo a partir de template", children: [
                    { label: "Documento" },
                    { label: "Planilha" },
                    { label: "Apresentação" },
                  ]},
                  { divider: true, label: "Compartilhar",  shortcut: "⌘⇧S" },
                  { label: "Duplicar",       shortcut: "⌘D" },
                  { label: "Renomear",       shortcut: "F2"  },
                  { divider: true, label: "Mover para lixeira", danger: true, shortcut: "⌫" },
                ]}
              >
                <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500 mb-3">Lista de arquivos — clique direito em um item</p>
                  <div className="space-y-1">
                    {["Relatório Q1.pdf", "Apresentação.pptx", "Dados.xlsx"].map((name) => (
                      <div key={name} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 cursor-context-menu hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <span className="h-2 w-2 rounded-full bg-zinc-300 shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </ContextMenu>
            </DemoCard>

            <div id="interaction-props" className="mt-6">
              <PropsTable rows={[
                ["inlineLabel",  "string",   "—",          "Switch: label renderizado à direita do toggle"],
                ["description",  "string",   "—",          "Switch: texto secundário abaixo do inlineLabel"],
                ["color",        "string",   "indigo",     "Switch: indigo | emerald | sky | rose | amber | zinc"],
                ["labelLeft",    "boolean",  "false",      "Switch: exibe o inlineLabel à esquerda"],
                ["size",         "string",   "md",         "Switch: sm | md | lg"],
                ["trigger",      "string",   "contextmenu","ContextMenu: contextmenu | click | both"],
                ["items",        "array",    "—",          "ContextMenu: lista de ContextMenuItem"],
                ["onSelect",     "function", "—",          "ContextMenu: callback ao clicar em item"],
                ["divider",      "boolean",  "false",      "ContextMenuItem: linha separadora antes do item"],
                ["danger",       "boolean",  "false",      "ContextMenuItem: estilo vermelho"],
                ["shortcut",     "string",   "—",          "ContextMenuItem: atalho exibido à direita"],
                ["children",     "array",    "—",          "ContextMenuItem: sub-menu aninhado"],
                ["componentId",  "string",   "—",          "Switch + ContextMenuItem: data-component-id para controle de acesso"],
              ]} />
            </div>

            <div className="mt-6">
              <CodeBlock filename="Switch-ContextMenu.tsx" language="tsx" code={`import Switch from "@/components/form/Switch";
import ContextMenu from "@/components/ContextMenu";

// Toggle simples
<Switch
  label="Notificações"
  inlineLabel="Ativar notificações push"
  description="Você receberá alertas em tempo real"
  defaultChecked
  color="emerald"
  componentId="settings.notifications.enable"
  onChange={(checked) => console.log(checked)}
/>

// Menu de contexto (clique direito)
<ContextMenu
  items={[
    { label: "Editar",   shortcut: "⌘E",  onClick: handleEdit },
    { label: "Duplicar", shortcut: "⌘D",  onClick: handleDuplicate },
    { divider: true, label: "Excluir", danger: true, shortcut: "⌫",
      onClick: handleDelete, componentId: "erp.produto.excluir" },
  ]}
  onSelect={(item) => console.log(item.label)}
>
  <div>Clique direito aqui</div>
</ContextMenu>

// Menu de contexto em clique simples
<ContextMenu trigger="click" items={menuItems}>
  <button>Ações</button>
</ContextMenu>`} />
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8 sm:my-12" />
      </div>
    </main>
  );
}
