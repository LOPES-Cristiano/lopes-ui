/**
 * Registro central de componentes para a página de índice (/components).
 * Ao criar/renomear um componente, atualize aqui (o script `npm run check:registry`
 * falha se algum arquivo em components/ não estiver listado).
 */

export type ComponentCategory =
  | "Ações"
  | "Animação & Código"
  | "Comunicação"
  | "Dados"
  | "Exibição"
  | "Corporativo"
  | "Formulários"
  | "Navegação"
  | "Layout & Utilitários";

export type ComponentEntry = {
  /** Nome exportado do componente */
  name: string;
  category: ComponentCategory;
  /** Rota da showcase (com âncora quando existir) */
  href: string;
  /** Descrição curta, genérica */
  description: string;
};

const P = {
  actions: "/showcase/actions",
  animation: "/showcase/animation",
  communication: "/showcase/communication",
  data: "/showcase/data",
  display: "/showcase/display",
  enterprise: "/showcase/enterprise",
  forms: "/showcase/forms",
  navigation: "/showcase/navigation",
} as const;

const e = (
  name: string,
  category: ComponentCategory,
  page: keyof typeof P,
  anchor: string | null,
  description: string,
): ComponentEntry => ({
  name,
  category,
  href: anchor ? `${P[page]}#${anchor}` : P[page],
  description,
});

export const COMPONENT_REGISTRY: ComponentEntry[] = [
  // Ações
  e("Button", "Ações", "actions", "button", "Botão com variantes, tamanhos e estado de carregamento."),
  e("ButtonGroup", "Ações", "actions", "button-group", "Agrupa botões em uma única barra."),
  e("ToggleGroup", "Ações", "actions", "toggle-group", "Grupo de alternadores (seleção única ou múltipla)."),
  e("Alert", "Ações", "actions", "alerts", "Mensagem inline por tom (info, sucesso, aviso, perigo)."),
  e("Confirm", "Ações", "actions", "confirm-dialog", "Confirmação unificada: modal (dialog), popover ou com senha (password)."),
  e("Drawer", "Ações", "actions", "drawer", "Painel lateral deslizante (prop `form` para formulários)."),
  e("Modal", "Ações", "actions", "modals", "Janela modal centralizada."),
  e("FormModal", "Ações", "actions", "modals", "Modal para formulários, com abas e seções."),
  e("State", "Ações", "actions", "empty-state", "Estado unificado: vazio (empty), resultado de ação (result) ou página de status (page)."),
  e("Toast", "Ações", "actions", "toasts", "Notificações temporárias (toast / Toaster)."),
  e("SpeedDial", "Ações", "actions", "speed-dial", "Botão flutuante com ações expansíveis."),
  e("FloatButton", "Ações", "actions", "float-button", "Botão flutuante fixo."),
  e("Loading", "Ações", "actions", "loading", "Indicadores de carregamento."),
  e("SortableList", "Ações", "actions", "sortable-list", "Lista reordenável por arrastar."),
  e("PullToRefresh", "Ações", "actions", "pull-to-refresh", "Puxar para atualizar."),
  e("Swap", "Ações", "actions", "swap", "Alterna entre dois estados visuais."),

  // Animação & Código
  e("CodeBlock", "Animação & Código", "animation", "codeblock", "Bloco de código com realce e cópia."),
  e("Snippet", "Animação & Código", "animation", "snippet", "Trecho de comando com botão copiar."),
  e("CodeEditor", "Animação & Código", "animation", "code-editor", "Editor de código."),
  e("Stepper", "Animação & Código", "animation", "stepper", "Passos de um fluxo."),
  e("Timeline", "Animação & Código", "animation", "timeline", "Linha do tempo de eventos."),
  e("Tour", "Animação & Código", "animation", "tour", "Tour guiado da interface."),
  e("TextRotate", "Animação & Código", "animation", "text-rotate", "Texto que alterna palavras."),
  e("Marquee", "Animação & Código", "animation", "marquee", "Conteúdo em rolagem contínua."),

  // Comunicação
  e("ChatWindow", "Comunicação", "communication", "chat", "Janela de conversa completa."),
  e("ChatMessage", "Comunicação", "communication", "chat", "Mensagem individual do chat."),
  e("ChatComposer", "Comunicação", "communication", "chat", "Campo de envio de mensagem."),
  e("ChatConversationItem", "Comunicação", "communication", "chat", "Item da lista de conversas."),
  e("EmailComposer", "Comunicação", "communication", "email-composer", "Editor de e-mail."),
  e("NotificationBell", "Comunicação", "communication", "notification-bell", "Sino de notificações."),

  // Dados
  e("ActivityFeed", "Dados", "data", "activity-feed", "Feed de atividades."),
  e("FilterBar", "Dados", "data", "filter-bar", "Barra de filtros."),
  e("DataTable", "Dados", "data", "datatable", "Tabela de dados com ordenação, filtro e paginação."),
  e("InboxList", "Dados", "data", "inbox-list", "Lista tipo caixa de entrada."),
  e("KanbanBoard", "Dados", "data", "kanban-board", "Quadro kanban."),
  e("Table", "Dados", "data", "tables", "Tabela simples."),
  e("TreeView", "Dados", "data", "treeview", "Árvore hierárquica."),
  e("Chart", "Dados", "data", "charts", "Gráficos (área, barra, rosca, etc.)."),
  e("Spreadsheet", "Dados", "data", null, "Planilha editável."),
  e("TransferList", "Dados", "data", null, "Lista de transferência entre dois painéis."),
  e("JsonViewer", "Dados", "data", null, "Visualizador de JSON."),

  // Exibição
  e("Avatar", "Exibição", "display", "avatars", "Avatar com iniciais, imagem e grupo."),
  e("Badge", "Exibição", "display", "badges", "Selo de status ou contagem."),
  e("Card", "Exibição", "display", "cards", "Contêiner de conteúdo."),
  e("Carousel", "Exibição", "display", "carousel", "Carrossel de itens."),
  e("PingIndicator", "Exibição", "display", "ping-indicator", "Indicador pulsante."),
  e("ServiceStatusCard", "Exibição", "display", "service-status", "Card de status de serviço."),
  e("StatCard", "Exibição", "display", "stat-card", "Card de métrica."),
  e("Calendar", "Exibição", "display", "calendar", "Calendário."),
  e("StatusBadge", "Exibição", "display", "status-badge", "Selo de status semântico."),
  e("DetailLayout", "Exibição", "display", "detail-layout", "Layout de página de detalhe."),
  e("EmojiPicker", "Exibição", "display", "emoji-picker", "Seletor de emoji."),
  e("Progress", "Exibição", "display", "progress", "Barra de progresso."),
  e("HoverCard", "Exibição", "display", "hover-card", "Cartão ao passar o mouse."),
  e("Item", "Exibição", "display", "item-list", "Item de lista genérico."),
  e("DescriptionList", "Exibição", "display", "item-list", "Lista de descrição (chave e valor)."),
  e("Countdown", "Exibição", "display", "countdown", "Contagem regressiva."),
  e("Diff", "Exibição", "display", "diff", "Comparação de textos."),
  e("HoverGallery", "Exibição", "display", "hover-gallery", "Galeria que troca ao passar o mouse."),
  e("Indicator", "Exibição", "display", "indicator-stack-mask", "Marcador posicionado sobre outro elemento."),
  e("Mockup", "Exibição", "display", "mockups", "Molduras de dispositivos."),
  e("BentoGrid", "Exibição", "display", "bento-grid", "Grade tipo bento."),
  e("ActionGridCard", "Exibição", "display", "action-grid-switches", "Card em grade de ações e switches."),
  e("Callout", "Exibição", "display", "callout-spoiler-highlight", "Destaque de informação."),
  e("Spoiler", "Exibição", "display", "callout-spoiler-highlight", "Conteúdo recolhível por altura."),
  e("HighlightText", "Exibição", "display", "callout-spoiler-highlight", "Realce de termos em texto."),
  e("ImageLightbox", "Exibição", "display", "image-lightbox", "Visualizador de imagem ampliada."),
  e("QRCode", "Exibição", "display", "qrcode", "Gerador de QR Code."),
  e("Barcode", "Exibição", "display", "qrcode", "Gerador de código de barras."),
  e("Watermark", "Exibição", "display", "watermark", "Marca d'água."),
  e("Skeleton", "Exibição", "display", "skeleton-suite", "Placeholders de carregamento."),
  e("Masonry", "Exibição", "display", "masonry", "Grade em alvenaria."),
  e("SplitCounterBadge", "Exibição", "display", null, "Selo com contador dividido."),
  e("Mask", "Exibição", "display", "indicator-stack-mask", "Máscara de visualização."),

  // Corporativo
  e("ScopeSelector", "Corporativo", "enterprise", "tenant-scope", "Seletor de escopo."),
  e("TenantSwitcherModal", "Corporativo", "enterprise", "tenant-scope", "Troca de empresa/filial."),
  e("CnpjLookupModal", "Corporativo", "enterprise", "cnpj-smart-object", "Consulta de CNPJ."),
  e("SmartObject", "Corporativo", "enterprise", "cnpj-smart-object", "Objeto inteligente de entidade."),
  e("ActiveTimerWidget", "Corporativo", "enterprise", "viewer-timer", "Widget de cronômetro ativo."),
  e("AccessGuard", "Corporativo", "enterprise", "resilience-rbac-privacy", "Protege conteúdo por permissão."),
  e("Can", "Corporativo", "enterprise", "resilience-rbac-privacy", "Renderiza por permissão (RBAC)."),
  e("ErrorBoundary", "Corporativo", "enterprise", "resilience-rbac-privacy", "Captura de erros de renderização."),
  e("CameraCaptureModal", "Corporativo", "enterprise", null, "Captura de foto pela câmera."),

  // Formulários
  e("Form", "Formulários", "forms", "forms", "Formulário base."),
  e("ZodForm", "Formulários", "forms", "forms", "Formulário com validação Zod."),
  e("TextField", "Formulários", "forms", "forms", "Campo de texto."),
  e("NumberField", "Formulários", "forms", "forms", "Campo numérico."),
  e("SelectField", "Formulários", "forms", "forms", "Campo de seleção."),
  e("NativeSelect", "Formulários", "forms", "forms", "Seleção nativa."),
  e("MultiSelectField", "Formulários", "forms", "forms", "Seleção múltipla."),
  e("AutocompleteField", "Formulários", "forms", "forms", "Campo com autocompletar."),
  e("Checkbox", "Formulários", "forms", "forms", "Caixa de seleção."),
  e("CheckboxGroup", "Formulários", "forms", "forms", "Grupo de caixas de seleção."),
  e("Switch", "Formulários", "forms", "forms", "Interruptor."),
  e("DateField", "Formulários", "forms", "forms", "Campo de data nativo."),
  e("DatePickerField", "Formulários", "forms", "forms", "Seletor de data."),
  e("TimeField", "Formulários", "forms", "forms", "Campo de hora nativo."),
  e("TimePickerField", "Formulários", "forms", "forms", "Seletor de hora."),
  e("MonthPickerField", "Formulários", "forms", "forms", "Seletor de mês."),
  e("FieldWrapper", "Formulários", "forms", "field-set", "Rótulo, ajuda e erro de um campo."),
  e("LoginForm", "Formulários", "forms", "login-form", "Formulário de login."),
  e("OTPInput", "Formulários", "forms", "otp-input", "Código de verificação."),
  e("PasswordStrength", "Formulários", "forms", "password-strength", "Força da senha."),
  e("PriceInput", "Formulários", "forms", "price-input", "Campo de valor monetário."),
  e("RichTextEditor", "Formulários", "forms", "rich-text-editor", "Editor de texto rico."),
  e("RichTextField", "Formulários", "forms", "rich-text-editor", "Campo de texto rico para formulários."),
  e("RichTextViewer", "Formulários", "forms", "rich-text-editor", "Exibição de texto rico."),
  e("TextareaField", "Formulários", "forms", "textarea-field", "Área de texto."),
  e("RadioGroupField", "Formulários", "forms", "radio-group-field", "Grupo de opções (radio)."),
  e("SegmentedControl", "Formulários", "forms", "segmented-control", "Controle segmentado."),
  e("SliderField", "Formulários", "forms", "slider-field", "Controle deslizante."),
  e("InputGroup", "Formulários", "forms", "input-group", "Campo com prefixo e sufixo."),
  e("DateRangePickerField", "Formulários", "forms", "date-range-picker", "Intervalo de datas."),
  e("RatingField", "Formulários", "forms", "rating-field", "Avaliação por estrelas."),
  e("FilterChips", "Formulários", "forms", "filter-chips", "Filtros em chips."),
  e("TagsInput", "Formulários", "forms", "tags-input", "Entrada de tags."),
  e("TagInputField", "Formulários", "forms", "tags-input", "Campo de tags para formulários."),
  e("MentionsField", "Formulários", "forms", "mentions-field", "Campo com menções."),
  e("ColorPickerField", "Formulários", "forms", "color-picker-field", "Seletor de cor."),
  e("CascaderField", "Formulários", "forms", "cascader-field", "Seleção em cascata."),
  e("TreeSelectField", "Formulários", "forms", "tree-select-field", "Seleção em árvore."),
  e("FileDropzone", "Formulários", "forms", "file-dropzone", "Área de soltar arquivos."),
  e("FileField", "Formulários", "forms", "file-dropzone", "Campo de arquivo."),
  e("SignaturePad", "Formulários", "forms", "signature-pad", "Captura de assinatura."),
  e("InlineEdit", "Formulários", "forms", "inline-edit", "Edição no próprio local."),

  // Navegação
  e("Accordion", "Navegação", "navigation", "accordion", "Seções expansíveis."),
  e("AppLauncher", "Navegação", "navigation", "app-launcher", "Menu de aplicativos."),
  e("Breadcrumb", "Navegação", "navigation", "breadcrumb", "Trilha de navegação."),
  e("CommandMenu", "Navegação", "navigation", "command-menu", "Paleta de comandos."),
  e("Header", "Navegação", "navigation", "header", "Cabeçalho da aplicação."),
  e("PageHeader", "Navegação", "navigation", "page-header", "Cabeçalho de página."),
  e("QuickActions", "Navegação", "navigation", "quick-actions", "Ações rápidas."),
  e("ShortcutHint", "Navegação", "navigation", "shortcut-hint", "Dica de atalho de teclado."),
  e("Sidebar", "Navegação", "navigation", "sidebar", "Barra lateral."),
  e("SplitPane", "Navegação", "navigation", "split-pane", "Painéis redimensionáveis."),
  e("Footer", "Navegação", "navigation", "footer", "Rodapé."),
  e("Tabs", "Navegação", "navigation", "tabs", "Abas."),
  e("Pagination", "Navegação", "navigation", "pagination", "Paginação."),
  e("Dock", "Navegação", "navigation", "dock", "Dock de atalhos."),
  e("Collapsible", "Navegação", "navigation", "collapsible-separator-scroll-kbd", "Conteúdo recolhível."),
  e("Separator", "Navegação", "navigation", "collapsible-separator-scroll-kbd", "Divisor."),
  e("ScrollArea", "Navegação", "navigation", "collapsible-separator-scroll-kbd", "Área com rolagem estilizada."),
  e("Kbd", "Navegação", "navigation", "collapsible-separator-scroll-kbd", "Tecla de atalho."),
  e("TableOfContents", "Navegação", "navigation", "table-of-contents", "Índice da página."),

  // Layout & Utilitários
  e("Stack", "Layout & Utilitários", "display", null, "Empilha elementos com espaçamento."),
  e("AspectRatio", "Layout & Utilitários", "display", null, "Mantém proporção de aspecto."),
  e("CookieBanner", "Layout & Utilitários", "display", null, "Aviso de cookies."),
  e("Agenda", "Exibição", "display", "calendar", "Agenda de compromissos."),
  e("Map", "Exibição", "display", null, "Mapa interativo."),
  e("ContextMenu", "Navegação", "navigation", null, "Menu de contexto (botão direito)."),
  e("ThemeToggle", "Layout & Utilitários", "navigation", "header", "Alternador de tema claro/escuro."),
];
