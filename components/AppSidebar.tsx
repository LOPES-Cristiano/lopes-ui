"use client";

import Sidebar from "@/components/Sidebar";
import {
  Home, Zap, MousePointer2, ArrowUp,
  LayoutDashboard, PanelLeft, Shield, Bell, HelpCircle,
  FormInput, ToggleLeft, MousePointerClick, Command,
  UserCircle2, ChevronDown, BellRing, Tag, SquareStack, TableProperties, Database,
} from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar
      title="LopesWare UI"
      subtitle="Playground"
      logo={<span className="text-lg font-black text-zinc-800">🅻</span>}
      collapsible
      groups={[
        {
          id: "start",
          label: "Início",
          items: [
            { label: "Visão geral", href: "/#overview", icon: Home },
            { label: "Instalação",  href: "/#install",  icon: Zap },
          ],
        },
        {
          id: "components",
          label: "Componentes",
          items: [
            {
              label: "Button",
              href: "/#button",
              icon: MousePointer2,
              children: [
                { label: "Variantes",        href: "/#button-variants" },
                { label: "Tamanhos",         href: "/#button-sizes" },
                { label: "Ícones & Loading", href: "/#button-icons" },
                { label: "Props",            href: "/#button-props" },
              ],
            },
            {
              label: "ActionButton",
              href: "/#action-button",
              icon: ArrowUp,
              children: [
                { label: "Exemplos", href: "/#action-examples" },
                { label: "Props",    href: "/#action-props" },
              ],
            },
            {
              label: "Header & Nav",
              href: "/#header",
              icon: LayoutDashboard,
              children: [
                { label: "Slots", href: "/#header-slots" },
                { label: "Props", href: "/#header-props" },
              ],
            },
            {
              label: "Sidebar",
              href: "/#sidebar",
              icon: PanelLeft,
              children: [
                { label: "Demo interativo", href: "/#sidebar-demo" },
              ],
            },
            {
              label: "StatusPage",
              href: "/#status-pages",
              icon: Shield,
              children: [
                { label: "Inline",      href: "/#status-inline" },
                { label: "Full-screen", href: "/#status-fullscreen" },
                { label: "Props",       href: "/#status-props" },
              ],
            },
            {
              label: "Toasts",
              href: "/#toasts",
              icon: Bell,
              children: [
                { label: "Exemplos", href: "/#toasts-examples" },
              ],
            },
            {
              label: "Forms",
              href: "/#forms",
              icon: FormInput,
              children: [
                { label: "TextField",       href: "/#fields-text" },
                { label: "Ícones & afixos", href: "/#fields-addons" },
                { label: "Estados",         href: "/#fields-states" },
                { label: "Label inline",    href: "/#fields-inline" },
                { label: "NumberField",     href: "/#fields-number" },
                { label: "Form completo",      href: "/#form-complete" },
                { label: "Props",              href: "/#field-props" },
                { label: "DateField & TimeField", href: "/#datetime-fields" },
                { label: "CheckboxGroup",      href: "/#checkbox-shapes" },
                { label: "AutocompleteField",  href: "/#autocomplete-examples" },
                { label: "MultiSelectField",   href: "/#multiselect-examples" },
                { label: "FileField",          href: "/#file-examples" },
              ],
            },
            {
              label: "Interação",
              icon: ToggleLeft,
              children: [
                { label: "Switch — tamanhos",    href: "/#switch-sizes" },
                { label: "Switch — label",       href: "/#switch-label" },
                { label: "Context Menu",         href: "/#context-menu-basic" },
                { label: "Command Menu",         href: "/#command-menu" },
                { label: "Props",                href: "/#interaction-props" },
              ],
            },
            {
              label: "Avatar",
              href: "/#avatars",
              icon: UserCircle2,
              children: [
                { label: "Tamanhos & status", href: "/#avatar-sizes" },
                { label: "Formas",            href: "/#avatar-shapes" },
                { label: "AvatarGroup",       href: "/#avatar-group" },
                { label: "Fallback",          href: "/#avatar-fallback" },
                { label: "Props",             href: "/#avatar-props" },
              ],
            },
            {
              label: "Accordion",
              href: "/#accordion",
              icon: ChevronDown,
              children: [
                { label: "Default",   href: "/#accordion-default" },
                { label: "Variantes", href: "/#accordion-variants" },
                { label: "Props",     href: "/#accordion-props" },
              ],
            },
            {
              label: "Alert",
              href: "/#alerts",
              icon: BellRing,
              children: [
                { label: "Inline",    href: "/#alert-variants" },
                { label: "Com ações", href: "/#alert-actions" },
                { label: "Dialog",    href: "/#alert-dialog" },
                { label: "Props",     href: "/#alert-props" },
              ],
            },
            {
              label: "Badge",
              href: "/#badges",
              icon: Tag,
              children: [
                { label: "Variantes",  href: "/#badge-variants" },
                { label: "Solid",      href: "/#badge-solid" },
                { label: "Funções",    href: "/#badge-features" },
                { label: "Props",      href: "/#badge-props" },
              ],
            },
            {
              label: "Card",
              href: "/#cards",
              icon: SquareStack,
              children: [
                { label: "Variantes",   href: "/#card-variants" },
                { label: "Sombras",     href: "/#card-shadows" },
                { label: "Backgrounds", href: "/#card-backgrounds" },
                { label: "Accent",      href: "/#card-accent" },
                { label: "Com header",  href: "/#card-header" },
                { label: "Interativos", href: "/#card-interactive" },
                { label: "Radius",      href: "/#card-radius" },
                { label: "Props",       href: "/#card-props" },
              ],
            },
            {
              label: "Table",
              href: "/#tables",
              icon: TableProperties,
              children: [
                { label: "Variantes",   href: "/#table-variants" },
                { label: "Tamanhos",    href: "/#table-sizes" },
                { label: "Vazio",       href: "/#table-empty" },
              ],
            },
            {
              label: "DataTable",
              href: "/#datatable",
              icon: Database,
              children: [
                { label: "Completo",    href: "/#datatable-full" },
                { label: "Simples",     href: "/#datatable-simple" },
                { label: "Striped",     href: "/#datatable-striped" },
                { label: "Props",       href: "/#datatable-props" },
              ],
            },
          ],
        },
      ]}
      footerItems={[
        { icon: HelpCircle, label: "Suporte", onClick: () => {} },
      ]}
      user={{ name: "Cristiano Lopes", role: "Admin", initials: "CL", status: "online" }}
    />
  );
}
