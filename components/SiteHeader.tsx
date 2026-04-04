"use client";

import React from "react";
import HeaderWrapper from "@/components/HeaderWrapper";
import Brand from "@/components/header/Brand";
import CommandMenu, { type CommandItem } from "@/components/CommandMenu";
import ProfileActions from "@/components/header/ProfileActions";
import ProfileTrigger from "@/components/header/ProfileTrigger";
import { type NavItem } from "@/components/header/Nav";
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
  return (
    <HeaderWrapper
      nav={SITE_NAV}
      navDropdown
      brand={
        <Brand
          logo={<img src="/logo.svg" alt="LopesWare" width={80} height={64} />}
          title="LopesWare"
        />
      }
      search={<CommandMenu items={SITE_COMMANDS} triggerLabel="Buscar..." />}
      profile={
        <ProfileTrigger initials="CL" name="Cristiano" showChevron menuWidth="w-60">
          <ProfileActions />
        </ProfileTrigger>
      }
    />
  );
}
