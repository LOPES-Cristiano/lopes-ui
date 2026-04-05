"use client";

import React, { useState } from "react";
import HeaderWrapper from "@/components/HeaderWrapper";
import Brand from "@/components/header/Brand";
import CommandMenu, { type CommandItem } from "@/components/CommandMenu";
import ProfileActions from "@/components/header/ProfileActions";
import ProfileTrigger from "@/components/header/ProfileTrigger";
import ThemeToggle from "@/components/ThemeToggle";
import { type NavItem } from "@/components/header/Nav";
import NotificationBell, { type NotificationItem } from "@/components/NotificationBell";
import {
  Home,
  FormInput,
  Layers,
  Zap,
  BarChart2,
  MessageCircle,
  Navigation,
  Play,
  Settings,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";

const SITE_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  {
    label: "Componentes",
    icon: Layers,
    children: [
      {
        label: "Formulários",
        href: "/showcase/forms",
        icon: FormInput,
        description: "TextField, OTPInput, LoginForm…",
      },
      {
        label: "Display",
        href: "/showcase/display",
        icon: Layers,
        description: "Avatar, Badge, Card, Carousel…",
      },
      {
        label: "Ações & Feedback",
        href: "/showcase/actions",
        icon: Zap,
        description: "Button, Alert, Toast, Drawer…",
        divider: true,
      },
      {
        label: "Dados & Tabelas",
        href: "/showcase/data",
        icon: BarChart2,
        description: "DataTable, Kanban, TreeView…",
      },
      {
        label: "Comunicação",
        href: "/showcase/communication",
        icon: MessageCircle,
        description: "Chat, Email, Notifications…",
      },
      {
        label: "Navegação & Layout",
        href: "/showcase/navigation",
        icon: Navigation,
        description: "Sidebar, Breadcrumb, CommandMenu…",
        divider: true,
      },
      {
        label: "Animação & Conteúdo",
        href: "/showcase/animation",
        icon: Play,
        description: "TextRotate, Stepper, Timeline…",
      },
    ],
  },
];

const SITE_COMMANDS: CommandItem[] = [
  // Páginas
  { id: "nav-home",   label: "Home",               icon: Home,          href: "/",                        group: "Páginas" },
  // Componentes
  { id: "sc-forms",   label: "Formulários",         icon: FormInput,     href: "/showcase/forms",          group: "Componentes", keywords: ["form", "input", "login", "otp"] },
  { id: "sc-display", label: "Display",             icon: Layers,        href: "/showcase/display",        group: "Componentes", keywords: ["avatar", "badge", "card", "carousel"] },
  { id: "sc-actions", label: "Ações & Feedback",    icon: Zap,           href: "/showcase/actions",        group: "Componentes", keywords: ["button", "alert", "toast", "drawer"] },
  { id: "sc-data",    label: "Dados & Tabelas",     icon: BarChart2,     href: "/showcase/data",           group: "Componentes", keywords: ["datatable", "kanban", "treeview", "table"] },
  { id: "sc-comm",    label: "Comunicação",         icon: MessageCircle, href: "/showcase/communication", group: "Componentes", keywords: ["chat", "email", "notification"] },
  { id: "sc-nav",     label: "Navegação & Layout",  icon: Navigation,    href: "/showcase/navigation",    group: "Componentes", keywords: ["sidebar", "breadcrumb", "accordion", "command"] },
  { id: "sc-anim",    label: "Animação & Conteúdo", icon: Play,          href: "/showcase/animation",     group: "Componentes", keywords: ["text-rotate", "stepper", "timeline", "codeblock"] },
  // Ações
  { id: "act-settings", label: "Configurações", icon: Settings, href: "/settings",                    group: "Ações", shortcut: "⌘S" },
  { id: "act-profile",  label: "Meu Perfil",    icon: User,     href: "/profile",                    group: "Ações", shortcut: "⌘P" },
  { id: "act-help",     label: "Suporte",       icon: HelpCircle, href: "/support",                  group: "Ações" },
  { id: "act-logout",   label: "Sair",          icon: LogOut,   onSelect: () => console.log("logout"), group: "Ações", keywords: ["logout", "sair", "exit"] },
];

const NOW = Date.now();

export default function SiteHeader() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([
    {
      id: "n1",
      type: "success",
      title: "Deploy concluído",
      description: "Versão 2.4.1 publicada em produção sem erros.",
      timestamp: new Date(NOW - 5 * 60_000),
      reference: { label: "ver-2.4.1", href: "#" },
    },
    {
      id: "n2",
      type: "warning",
      title: "Limite de uso próximo",
      description: "Você está a 85% do limite mensal do plano atual.",
      timestamp: new Date(NOW - 35 * 60_000),
      href: "#",
    },
    {
      id: "n3",
      type: "info",
      title: "Novo membro adicionado",
      description: "Ana Lima entrou na equipe como desenvolvedora.",
      timestamp: new Date(NOW - 2 * 3600_000),
      avatarFallback: "AL",
      read: true,
    },
    {
      id: "n4",
      type: "danger",
      title: "Falha no webhook",
      description: "3 tentativas sem resposta do endpoint /api/events.",
      timestamp: new Date(NOW - 26 * 3600_000),
      reference: { label: "Ver logs", href: "#" },
      read: true,
    },
    {
      id: "n5",
      title: "Relatório mensal disponível",
      description: "O relatório de março já pode ser baixado.",
      timestamp: new Date(NOW - 8 * 24 * 3600_000),
      href: "#",
      read: true,
    },
  ]);

  const handleMarkRead = (id: string) =>
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const handleMarkAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleDismiss = (id: string) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));

  return (
    <HeaderWrapper
      nav={SITE_NAV}
      navDropdown
      brand={
        <Brand
          logo={
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.svg" alt="Lopes" width={64} height={64} className="dark:invert" />
          }
          title="Lopes"
        />
      }
      search={<CommandMenu items={SITE_COMMANDS} triggerLabel="Buscar..." />}
      extra={
        <>
          <NotificationBell
            notifications={notifs}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={handleDismiss}
          />
          <ThemeToggle />
        </>
      }
      profile={
        <ProfileTrigger initials="CL" name="Cristiano" showChevron menuWidth="w-60">
          <ProfileActions />
        </ProfileTrigger>
      }
    />
  );
}
