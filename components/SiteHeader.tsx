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
  LayoutDashboard,
  BookOpen,
  Map,
  Code2,
  Rocket,
  FlaskConical,
  Settings,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";

const SITE_NAV: NavItem[] = [
  { label: "Home",      href: "/",         icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: "Novo" },
  {
    label: "Docs", href: "/docs", icon: BookOpen,
    children: [
      {
        label: "Guides", href: "/docs/guides", icon: Map,
        description: "Tutoriais passo a passo",
        children: [
          { label: "Getting Started",  href: "/docs/guides/getting-started", icon: Rocket,       description: "Comece em minutos" },
          { label: "Advanced Topics",  href: "/docs/guides/advanced-topics",  icon: FlaskConical, description: "Aprofunde-se", divider: true },
        ],
      },
      {
        label: "API", href: "/docs/api", icon: Code2,
        description: "Referência completa",
        divider: true,
        children: [
          { label: "Reference", href: "/docs/api/reference", description: "Todos os métodos" },
          { label: "Examples",  href: "/docs/api/examples",  description: "Código de exemplo" },
        ],
      },
    ],
  },
];

const SITE_COMMANDS: CommandItem[] = [
  // Navegação
  { id: "nav-home",    label: "Home",           icon: Home,          href: "/",                               group: "Navegação" },
  { id: "nav-dash",    label: "Dashboard",      icon: LayoutDashboard, href: "/dashboard",                   group: "Navegação", description: "Painel principal" },
  { id: "nav-docs",    label: "Documentação",   icon: BookOpen,      href: "/docs",                          group: "Navegação", keywords: ["docs", "guides", "api"] },
  { id: "nav-guides",  label: "Getting Started",icon: Rocket,        href: "/docs/guides/getting-started",   group: "Navegação", description: "Comece em minutos" },
  { id: "nav-api",     label: "API Reference",  icon: Code2,         href: "/docs/api/reference",            group: "Navegação", description: "Todos os endpoints" },
  // Ações
  { id: "act-settings",label: "Configurações",  icon: Settings,      href: "/settings",                      group: "Ações",     shortcut: "⌘S" },
  { id: "act-profile", label: "Meu Perfil",     icon: User,          href: "/profile",                       group: "Ações",     shortcut: "⌘P" },
  { id: "act-help",    label: "Suporte",        icon: HelpCircle,    href: "/support",                       group: "Ações" },
  { id: "act-logout",  label: "Sair",           icon: LogOut,        onSelect: () => console.log("logout"),  group: "Ações",     keywords: ["logout", "sair", "exit"] },
];

export default function SiteHeader() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([
    {
      id: "n1",
      type: "success",
      title: "Deploy concluído",
      description: "Versão 2.4.1 publicada em produção sem erros.",
      timestamp: new Date(Date.now() - 5 * 60_000),
      reference: { label: "ver-2.4.1", href: "#" },
    },
    {
      id: "n2",
      type: "warning",
      title: "Limite de uso próximo",
      description: "Você está a 85% do limite mensal do plano atual.",
      timestamp: new Date(Date.now() - 35 * 60_000),
      href: "#",
    },
    {
      id: "n3",
      type: "info",
      title: "Novo membro adicionado",
      description: "Ana Lima entrou na equipe como desenvolvedora.",
      timestamp: new Date(Date.now() - 2 * 3600_000),
      avatarFallback: "AL",
      read: true,
    },
    {
      id: "n4",
      type: "danger",
      title: "Falha no webhook",
      description: "3 tentativas sem resposta do endpoint /api/events.",
      timestamp: new Date(Date.now() - 26 * 3600_000),
      reference: { label: "Ver logs", href: "#" },
      read: true,
    },
    {
      id: "n5",
      title: "Relatório mensal disponível",
      description: "O relatório de março já pode ser baixado.",
      timestamp: new Date(Date.now() - 8 * 24 * 3600_000),
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
            <img src="/logo.svg" alt="Lopes" width={80} height={64} />
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
