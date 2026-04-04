"use client";

import React, { useRef, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { MessageCircle, Minus, X, ChevronLeft, Search, Phone, Video, MoreHorizontal } from "lucide-react";
import ChatMessage, { type ChatMessageProps } from "@/components/ChatMessage";
import ChatComposer from "@/components/ChatComposer";
import ChatConversationItem from "@/components/ChatConversationItem";
import Avatar from "@/components/Avatar";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChatConversation = {
  id: string;
  name: string;
  avatarSrc?: string;
  online?: boolean;
  unread?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  messages: ChatMessageProps[];
};

export type ChatWindowProps = {
  title?: string;
  conversations: ChatConversation[];
  onSend?: (conversationId: string, message: string) => void;
  /** Start open on conversation list (default: false — shows bubble) */
  defaultOpen?: boolean;
  className?: string;
  componentId?: string;
};

type WindowState = "bubble" | "list" | "chat";

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatWindow({
  title = "Mensagens",
  conversations,
  onSend,
  defaultOpen = false,
  className,
  componentId,
}: ChatWindowProps) {
  const [windowState, setWindowState] = useState<WindowState>(defaultOpen ? "list" : "bubble");
  const [minimized, setMinimized] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyTo, setReplyTo] = useState<{ senderName: string; content: string } | null>(null);
  const [localConvs, setLocalConvs] = useState<ChatConversation[]>(conversations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = localConvs.find((c) => c.id === activeId) ?? null;
  const totalUnread = localConvs.reduce((n, c) => n + (c.unread ?? 0), 0);

  const filtered = searchQuery
    ? localConvs.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : localConvs;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  const openConversation = (id: string) => {
    setActiveId(id);
    setWindowState("chat");
    // Clear unread
    setLocalConvs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = (message: string) => {
    if (!activeId) return;
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setLocalConvs((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastMessage: message,
              lastMessageTime: "agora",
              messages: [
                ...c.messages,
                {
                  content: message,
                  mine: true,
                  timestamp: now,
                  status: "sent" as const,
                  showAvatar: false,
                  ...(replyTo ? { replyTo } : {}),
                },
              ],
            }
          : c
      )
    );
    setReplyTo(null);
    onSend?.(activeId, message);
  };

  // ── Bubble (collapsed FAB) ────────────────────────────────────────────────
  if (windowState === "bubble") {
    return (
      <button
        onClick={() => setWindowState("list")}
        {...(componentId ? { "data-component-id": componentId } : {})}
        className={twMerge(
          "relative flex items-center justify-center w-14 h-14 rounded-full",
          "bg-indigo-600 hover:bg-indigo-500 text-white",
          "shadow-xl shadow-indigo-200 transition-all active:scale-95",
          className
        )}
        aria-label="Abrir chat"
      >
        <MessageCircle size={24} />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    );
  }

  // ── Expanded window ───────────────────────────────────────────────────────
  return (
    <div
      {...(componentId ? { "data-component-id": componentId } : {})}
      className={twMerge(
        "flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden",
        "shadow-2xl shadow-zinc-900/10",
        "w-80 transition-all duration-200",
        minimized
          ? "h-auto"
          : windowState === "chat"
            ? "h-[480px]"
            : "h-[400px]",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3.5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        {/* Back button (chat mode) */}
        {windowState === "chat" && !minimized && (
          <button
            onClick={() => { setActiveId(null); setWindowState("list"); setReplyTo(null); }}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Identity */}
        {windowState === "chat" && activeConv && !minimized ? (
          <>
            <Avatar
              name={activeConv.name}
              src={activeConv.avatarSrc}
              size="sm"
              status={activeConv.online ? "online" : undefined}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{activeConv.name}</p>
              <p className={twMerge("text-[11px]", activeConv.online ? "text-emerald-500" : "text-zinc-400")}>
                {activeConv.online ? "Online" : "Offline"}
              </p>
            </div>
            {/* Chat actions */}
            <div className="flex items-center gap-0.5 ml-0">
              <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors" aria-label="Ligar">
                <Phone size={15} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors" aria-label="Videochamada">
                <Video size={15} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors" aria-label="Mais opções">
                <MoreHorizontal size={15} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
              <MessageCircle size={15} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="flex-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</span>
            {totalUnread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </>
        )}

        {/* Window controls */}
        <div className="flex items-center gap-0.5 ml-auto pl-1 shrink-0">
          <button
            onClick={() => setMinimized((v) => !v)}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            aria-label="Minimizar"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => { setWindowState("bubble"); setMinimized(false); }}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Body (hidden when minimized) ── */}
      {!minimized && (
        <>
          {/* Conversation list */}
          {windowState === "list" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-3 py-2 shrink-0">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Search size={13} className="text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar conversa…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
                {filtered.length === 0 && (
                  <p className="text-xs text-zinc-400 text-center py-6">Nenhuma conversa encontrada</p>
                )}
                {filtered.map((c) => (
                  <ChatConversationItem
                    key={c.id}
                    name={c.name}
                    avatarSrc={c.avatarSrc}
                    lastMessage={c.lastMessage}
                    timestamp={c.lastMessageTime}
                    unread={c.unread}
                    online={c.online}
                    active={c.id === activeId}
                    onClick={() => openConversation(c.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Message thread */}
          {windowState === "chat" && activeConv && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-zinc-50 dark:bg-zinc-950">
                {activeConv.messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    {...msg}
                    onReact={(emoji) => {
                      // Toggle reaction on last message for demo
                      setLocalConvs((prev) =>
                        prev.map((c) => {
                          if (c.id !== activeId) return c;
                          const msgs = c.messages.map((m, mi) => {
                            if (mi !== i) return m;
                            const existing = m.reactions ?? [];
                            const idx = existing.findIndex((r) => r.emoji === emoji);
                            let updated;
                            if (idx >= 0) {
                              updated = existing.map((r, ri) =>
                                ri === idx
                                  ? { ...r, reacted: !r.reacted, count: r.reacted ? r.count - 1 : r.count + 1 }
                                  : r
                              ).filter((r) => r.count > 0);
                            } else {
                              updated = [...existing, { emoji, count: 1, reacted: true }];
                            }
                            return { ...m, reactions: updated };
                          });
                          return { ...c, messages: msgs };
                        })
                      );
                    }}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <ChatComposer
                onSend={handleSend}
                onAttach={() => {}}
                onEmoji={() => {}}
                onVoice={() => {}}
                replyTo={replyTo ? { ...replyTo, onCancel: () => setReplyTo(null) } : undefined}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
