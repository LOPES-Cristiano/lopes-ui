"use client";

import Sidebar from "@/components/Sidebar";
import {
  Home,
  Zap,
  MousePointer2,
  PanelLeft,
  Bell,
  HelpCircle,
  FormInput,
  ToggleLeft,
  UserCircle2,
  BellRing,
  Tag,
  SquareStack,
  TableProperties,
  Database,
  GalleryHorizontal,
  ListChecks,
  RefreshCw,
  MessageCircle,
  Navigation,
  FileCode,
  Network,
  FileEdit,
  CalendarDays,
  LayoutGrid,
  TrendingUp,
  Mail,
  PackageOpen,
  PanelRightOpen,
  Banknote,
  Command,
  Sparkles,
  Wrench,
  BarChart2,
  QrCode,
  UploadCloud,
  PenTool,
  Barcode,
} from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar
      title="Lopes UI"
      subtitle="Design System"
      logo={<span className="text-lg font-black text-zinc-900 dark:text-zinc-100">🅻</span>}
      collapsible
      pinnable
      groups={[
        {
          id: "start",
          label: "Início & Templates",
          items: [
            { label: "Visão geral", href: "/#overview", icon: Home },
            { label: "Instalação", href: "/#install", icon: Zap },
            {
              label: "Páginas Exemplo",
              href: "/templates",
              icon: Sparkles,
              badge: "5",
              badgeVariant: "info",
              children: [
                { label: "Dashboard Executivo", href: "/templates#dashboard" },
                { label: "CRM & Pipeline", href: "/templates#crm" },
                { label: "Central Helpdesk", href: "/templates#helpdesk" },
                { label: "Configurações & RBAC", href: "/templates#settings" },
                { label: "Vitrine & Checkout", href: "/templates#catalog" },
              ],
            },
            { label: "UI Builder", href: "/ui-builder", icon: Wrench, badge: "Studio", badgeVariant: "info" },
          ],
        },
        {
          id: "forms",
          label: "Formulários & Editores",
          items: [
            {
              label: "TextField & NumberField",
              href: "/showcase/forms#forms",
              icon: FormInput,
              children: [
                { label: "6 Variantes Visuais", href: "/showcase/forms#fields-text" },
                { label: "Ícones, Afixos & Addons", href: "/showcase/forms#fields-addons" },
                { label: "Máscaras Brasileiras", href: "/showcase/forms#fields-masks" },
                { label: "Estados & Validação", href: "/showcase/forms#fields-states" },
                { label: "NumberField", href: "/showcase/forms#fields-number" },
                { label: "InputGroup", href: "/showcase/forms#input-group" },
                { label: "Props", href: "/showcase/forms#field-props" },
              ],
            },
            {
              label: "PriceInput & CurrencyField",
              href: "/showcase/forms#price-input",
              icon: Banknote,
              children: [
                { label: "PriceInput (Centavos)", href: "/showcase/forms#price-input-demo" },
                { label: "CurrencyField (Multi-Moeda)", href: "/showcase/forms#currency-field-demo" },
                { label: "Props", href: "/showcase/forms#price-input-props" },
              ],
            },
            {
              label: "RichTextEditor",
              href: "/showcase/forms#rich-text-editor",
              icon: FileEdit,
              children: [
                { label: "Slash (/) & Variáveis", href: "/showcase/forms#rte-demo" },
                { label: "Modo Documento A4", href: "/showcase/forms#rte-document" },
                { label: "RichTextField", href: "/showcase/forms#rte-field" },
                { label: "Modo Email & ReadOnly", href: "/showcase/forms#rte-email" },
                { label: "Props", href: "/showcase/forms#rte-props" },
              ],
            },
            {
              label: "Select, Cascader & Tree",
              href: "/showcase/forms#select-fields",
              icon: Network,
              children: [
                { label: "SelectField & NativeSelect", href: "/showcase/forms#select-fields" },
                { label: "AutocompleteField", href: "/showcase/forms#autocomplete-examples" },
                { label: "MultiSelectField", href: "/showcase/forms#multiselect-examples" },
                { label: "CascaderField", href: "/showcase/forms#cascader-field" },
                { label: "TreeSelectField", href: "/showcase/forms#tree-select-field" },
              ],
            },
            {
              label: "Radio, Checkbox & Segmented",
              href: "/showcase/forms#radio-group-field",
              icon: ToggleLeft,
              children: [
                { label: "RadioGroup & Radio.Button", href: "/showcase/forms#radio-group-field" },
                { label: "SegmentedControl", href: "/showcase/forms#segmented-control" },
                { label: "CheckboxGroup", href: "/showcase/forms#checkboxgroup" },
                { label: "FilterChips", href: "/showcase/forms#filter-chips" },
              ],
            },
            {
              label: "TagsInput & Mentions",
              href: "/showcase/forms#tags-input",
              icon: Tag,
              children: [
                { label: "TagsInput & CheckableTag", href: "/showcase/forms#tags-input" },
                { label: "MentionsField (@ e #)", href: "/showcase/forms#mentions-field" },
              ],
            },
            {
              label: "Datas, Upload & Assinatura",
              href: "/showcase/forms#datetime-fields",
              icon: UploadCloud,
              children: [
                { label: "DateField & TimeField", href: "/showcase/forms#datetime-fields" },
                { label: "DateRangePickerField", href: "/showcase/forms#date-range-picker" },
                { label: "FileField", href: "/showcase/forms#file-examples" },
                { label: "FileDropzone", href: "/showcase/forms#file-dropzone" },
                { label: "SignaturePad", href: "/showcase/forms#signature-pad" },
                { label: "InlineEdit", href: "/showcase/forms#inline-edit" },
              ],
            },
            {
              label: "Textarea, Slider, Cor & Auth",
              href: "/showcase/forms#textarea-field",
              icon: PenTool,
              children: [
                { label: "TextareaField", href: "/showcase/forms#textarea-field" },
                { label: "SliderField", href: "/showcase/forms#slider-field" },
                { label: "RatingField", href: "/showcase/forms#rating-field" },
                { label: "ColorPickerField", href: "/showcase/forms#color-picker-field" },
                { label: "LoginForm", href: "/showcase/forms#login-form" },
                { label: "OTP Input", href: "/showcase/forms#otp-input" },
                { label: "PasswordStrength", href: "/showcase/forms#password-strength" },
                { label: "FieldSet & ZodFormField", href: "/showcase/forms#field-set" },
              ],
            },
          ],
        },
        {
          id: "actions",
          label: "Ações & Feedback",
          items: [
            {
              label: "Button & Grupos",
              href: "/showcase/actions#button",
              icon: MousePointer2,
              children: [
                { label: "Variantes & Tamanhos", href: "/showcase/actions#button-variants" },
                { label: "Dashed, Tonal & Danger", href: "/showcase/actions#button-dashed-tonal" },
                { label: "Tooltip & Confirm Inline", href: "/showcase/actions#action-button" },
                { label: "ButtonGroup", href: "/showcase/actions#button-group" },
                { label: "Toggle & ToggleGroup", href: "/showcase/actions#toggle-group" },
                { label: "SpeedDial (FAB)", href: "/showcase/actions#speed-dial" },
                { label: "FloatButton & BackTop", href: "/showcase/actions#float-button" },
              ],
            },
            {
              label: "Alert & Toast",
              href: "/showcase/actions#alerts",
              icon: Bell,
              children: [
                { label: "Alert — Inline & Ações", href: "/showcase/actions#alert-variants" },
                { label: "Alert — Modo Dialog", href: "/showcase/actions#alert-dialog" },
                { label: "Alert — Banner & closeText", href: "/showcase/actions#alert-banner" },
                { label: "Toast Notifications", href: "/showcase/actions#toasts" },
              ],
            },
            {
              label: "Modais, Drawer & Confirmação",
              href: "/showcase/actions#modals",
              icon: PanelRightOpen,
              children: [
                { label: "Modal, FormModal & Câmera", href: "/showcase/actions#modals" },
                { label: "Drawer", href: "/showcase/actions#drawer" },
                { label: "ConfirmDialog", href: "/showcase/actions#confirm-dialog" },
                { label: "Popconfirm", href: "/showcase/actions#popconfirm" },
                { label: "PasswordConfirmDialog", href: "/showcase/actions#password-confirm" },
              ],
            },
            {
              label: "Estados, Result & Loading",
              href: "/showcase/actions#empty-state",
              icon: PackageOpen,
              children: [
                { label: "EmptyState", href: "/showcase/actions#empty-state" },
                { label: "Result (Sucesso & HTTP)", href: "/showcase/actions#result" },
                { label: "StatusPage (403/404/500)", href: "/showcase/actions#status-pages" },
                { label: "Loading & Spin Overlay", href: "/showcase/actions#loading" },
                { label: "SortableList (Drag & Drop)", href: "/showcase/actions#sortable-list" },
                { label: "PullToRefresh", href: "/showcase/actions#pull-to-refresh" },
                { label: "Swap", href: "/showcase/actions#swap" },
              ],
            },
          ],
        },
        {
          id: "display",
          label: "Display & Vitrine",
          items: [
            {
              label: "Avatar, Badge & Status",
              href: "/showcase/display#avatars",
              icon: UserCircle2,
              children: [
                { label: "Avatar & AvatarGroup", href: "/showcase/display#avatars" },
                { label: "Badge — Soft, Solid & Dot", href: "/showcase/display#badges" },
                { label: "Badge Status & BadgeRibbon", href: "/showcase/display#badge-status-ribbon" },
                { label: "StatusBadge", href: "/showcase/display#status-badge" },
                { label: "PingIndicator", href: "/showcase/display#ping-indicator" },
              ],
            },
            {
              label: "Card, Bento & ActionGrid",
              href: "/showcase/display#cards",
              icon: SquareStack,
              children: [
                { label: "Card (Variantes & Slots)", href: "/showcase/display#cards" },
                { label: "BentoGrid & BentoCard", href: "/showcase/display#bento-grid" },
                { label: "ActionGrid & SwitchesCard", href: "/showcase/display#action-grid-switches" },
                { label: "DetailLayout (Ficha 360°)", href: "/showcase/display#detail-layout" },
              ],
            },
            {
              label: "StatCard (KPIs, Segments & Ring)",
              href: "/showcase/display#stat-card",
              icon: TrendingUp,
              children: [
                { label: "Básico & Sparkline", href: "/showcase/display#stat-card-basic" },
                { label: "StatsSegments & StatsRing", href: "/showcase/display#stat-card-segments-ring" },
                { label: "Paletas & Skeleton", href: "/showcase/display#stat-card-colors" },
                { label: "ServiceStatus & UptimeBar", href: "/showcase/display#service-status" },
              ],
            },
            {
              label: "Galerias, Mídia & Vitrine",
              href: "/showcase/display#carousel",
              icon: GalleryHorizontal,
              children: [
                { label: "Carousel", href: "/showcase/display#carousel" },
                { label: "ImageLightbox", href: "/showcase/display#image-lightbox" },
                { label: "HoverGallery & 3D Card", href: "/showcase/display#hover-gallery" },
                { label: "Diff (Antes / Depois)", href: "/showcase/display#diff" },
                { label: "Masonry Waterfall", href: "/showcase/display#masonry" },
              ],
            },
            {
              label: "Calendar, Callout & Skeleton",
              href: "/showcase/display#calendar",
              icon: CalendarDays,
              children: [
                { label: "Calendar (Eventos & Range)", href: "/showcase/display#calendar" },
                { label: "Callout, Spoiler & Highlight", href: "/showcase/display#callout-spoiler-highlight" },
                { label: "HoverCard & ItemList", href: "/showcase/display#hover-card" },
                { label: "Skeleton Suite", href: "/showcase/display#skeleton-suite" },
                { label: "Progress & RadialProgress", href: "/showcase/display#progress" },
                { label: "Countdown", href: "/showcase/display#countdown" },
              ],
            },
            {
              label: "QRCode, Watermark & Mockups",
              href: "/showcase/display#qrcode",
              icon: QrCode,
              children: [
                { label: "QRCode (ISO 18004 & PIX)", href: "/showcase/display#qrcode" },
                { label: "Watermark (Anti-Tamper)", href: "/showcase/display#watermark" },
                { label: "Browser & Code Mockup", href: "/showcase/display#mockups" },
                { label: "Indicator, Stack & Mask", href: "/showcase/display#indicator-stack-mask" },
              ],
            },
          ],
        },
        {
          id: "data",
          label: "Dados, Tabelas & Gráficos",
          items: [
            {
              label: "DataTable, Table & Planilha",
              href: "/showcase/data#datatable",
              icon: Database,
              children: [
                { label: "DataTable Completo", href: "/showcase/data#datatable" },
                { label: "Abas & Ações Inline", href: "/showcase/data#datatable-tabs" },
                { label: "Table Simples", href: "/showcase/data#tables" },
                { label: "Spreadsheet Virtualizada", href: "/showcase/data#spreadsheet" },
              ],
            },
            {
              label: "Chart (Gráficos SVG)",
              href: "/showcase/data#charts",
              icon: BarChart2,
            },
            {
              label: "DescriptionList",
              href: "/showcase/data#description-list",
              icon: TableProperties,
              children: [
                { label: "Horizontal & Cards", href: "/showcase/data#description-list" },
                { label: "Grade Tabelada (Table)", href: "/showcase/data#description-list-table" },
              ],
            },
            {
              label: "Kanban, TreeView & Listas",
              href: "/showcase/data#kanban-board",
              icon: LayoutGrid,
              children: [
                { label: "KanbanBoard", href: "/showcase/data#kanban-board" },
                { label: "TreeView (Multi & DnD)", href: "/showcase/data#treeview" },
                { label: "TransferList", href: "/showcase/data#transfer-list" },
                { label: "ActivityFeed", href: "/showcase/data#activity-feed" },
                { label: "InboxList", href: "/showcase/data#inbox-list" },
                { label: "FilterBar", href: "/showcase/data#filter-bar" },
              ],
            },
            {
              label: "JsonViewer & Barcode",
              href: "/showcase/data#json-viewer",
              icon: Barcode,
              children: [
                { label: "JsonViewer (Copy Path)", href: "/showcase/data#json-viewer" },
                { label: "Barcode (Code-128 SVG)", href: "/showcase/data#barcode" },
              ],
            },
          ],
        },
        {
          id: "communication",
          label: "Comunicação",
          items: [
            {
              label: "Chat & SmartObject",
              href: "/showcase/communication#chat",
              icon: MessageCircle,
              children: [
                { label: "Bolhas, Status & Reações", href: "/showcase/communication#chat-bubbles" },
                { label: "ChatComposer", href: "/showcase/communication#chat-composer" },
                { label: "ChatWindow", href: "/showcase/communication#chat-window" },
                { label: "SmartObject Inline & Card", href: "/showcase/communication#smart-chat" },
              ],
            },
            {
              label: "EmailComposer",
              href: "/showcase/communication#email-composer",
              icon: Mail,
              children: [
                { label: "Janela Padrão", href: "/showcase/communication#email-composer-window" },
                { label: "Inline", href: "/showcase/communication#email-composer-inline" },
              ],
            },
            {
              label: "NotificationBell & ContextMenu",
              href: "/showcase/communication#notification-bell",
              icon: BellRing,
              children: [
                { label: "NotificationBell", href: "/showcase/communication#notification-bell" },
                { label: "Switch & ContextMenu", href: "/showcase/communication#interactions" },
              ],
            },
          ],
        },
        {
          id: "navigation",
          label: "Navegação & Layout",
          items: [
            {
              label: "Tabs, Breadcrumb & Paginação",
              href: "/showcase/navigation#tabs",
              icon: Navigation,
              children: [
                { label: "Tabs (Pills & Underline)", href: "/showcase/navigation#tabs" },
                { label: "Tabs Editable-Card", href: "/showcase/navigation#tabs-editable-card" },
                { label: "Breadcrumb", href: "/showcase/navigation#breadcrumb" },
                { label: "Pagination", href: "/showcase/navigation#pagination" },
                { label: "TableOfContents", href: "/showcase/navigation#table-of-contents" },
              ],
            },
            {
              label: "Sidebar, Header & SplitPane",
              href: "/showcase/navigation#sidebar",
              icon: PanelLeft,
              children: [
                { label: "Sidebar", href: "/showcase/navigation#sidebar" },
                { label: "Header & Nav", href: "/showcase/navigation#header" },
                { label: "PageHeader", href: "/showcase/navigation#page-header" },
                { label: "Footer", href: "/showcase/navigation#footer" },
                { label: "SplitPane & Splitter", href: "/showcase/navigation#split-pane" },
              ],
            },
            {
              label: "Accordion, Command & Dock",
              href: "/showcase/navigation#accordion",
              icon: Command,
              children: [
                { label: "Accordion", href: "/showcase/navigation#accordion" },
                { label: "CommandMenu (⌘K)", href: "/showcase/navigation#command-menu" },
                { label: "AppLauncher", href: "/showcase/navigation#app-launcher" },
                { label: "Dock & QuickActions", href: "/showcase/navigation#dock" },
                { label: "ShortcutHint & Kbd", href: "/showcase/navigation#shortcut-hint" },
                { label: "Collapsible & ScrollArea", href: "/showcase/navigation#collapsible-separator-scroll-kbd" },
              ],
            },
          ],
        },
        {
          id: "animation",
          label: "Animação, Código & Tour",
          items: [
            {
              label: "CodeBlock, Snippet & Editor",
              href: "/showcase/animation#codeblock",
              icon: FileCode,
              children: [
                { label: "CodeBlock", href: "/showcase/animation#codeblock" },
                { label: "Snippet & CopyButton", href: "/showcase/animation#snippet" },
                { label: "CodeEditor (Live IDE)", href: "/showcase/animation#code-editor" },
              ],
            },
            {
              label: "Stepper & Timeline",
              href: "/showcase/animation#stepper",
              icon: ListChecks,
              children: [
                { label: "Stepper (5 Variantes)", href: "/showcase/animation#stepper" },
                { label: "Timeline", href: "/showcase/animation#timeline" },
              ],
            },
            {
              label: "Tour, TextRotate & Marquee",
              href: "/showcase/animation#tour",
              icon: RefreshCw,
              children: [
                { label: "Tour (Onboarding)", href: "/showcase/animation#tour" },
                { label: "TextRotate", href: "/showcase/animation#text-rotate" },
                { label: "Marquee", href: "/showcase/animation#marquee" },
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
