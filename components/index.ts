// ─── Top-level components ────────────────────────────────────────────────────
// Note: Heavy optional widgets live in dedicated subpath exports so core
// consumers don't need Tiptap, TanStack, or Shiki installed:
//   - RichTextEditor, RichTextField, EmailComposer -> "lopes-ui/rich-text"
//   - Spreadsheet                                  -> "lopes-ui/spreadsheet"
//   - CodeBlock                                    -> "lopes-ui/code-block"
//   - Radix/CVA                                    -> "lopes-ui/primitives"

export { default as Accordion } from "./Accordion";
export * from "./Accordion";

export { default as ActionGridCard, SwitchesCard } from "./ActionGridCard";
export * from "./ActionGridCard";

export { default as ActivityFeed } from "./ActivityFeed";
export * from "./ActivityFeed";

export { default as Agenda } from "./Agenda";
export * from "./Agenda";

export { default as Alert } from "./Alert";
export * from "./Alert";

export { default as AppLauncher } from "./AppLauncher";
export * from "./AppLauncher";

export { default as AspectRatio } from "./AspectRatio";
export * from "./AspectRatio";

export { default as Avatar } from "./Avatar";
export * from "./Avatar";

export { default as Badge } from "./Badge";
export * from "./Badge";

export { default as Barcode } from "./Barcode";
export * from "./Barcode";

export { default as BentoGrid, BentoCard } from "./BentoGrid";
export * from "./BentoGrid";

export { default as Breadcrumb } from "./Breadcrumb";
export * from "./Breadcrumb";

export { default as Button } from "./Button";
export * from "./Button";

export { default as ButtonGroup } from "./ButtonGroup";
export * from "./ButtonGroup";

export { default as Calendar } from "./Calendar";
export * from "./Calendar";

export { default as Callout } from "./Callout";
export * from "./Callout";

export { default as CameraCaptureModal } from "./CameraCaptureModal";
export * from "./CameraCaptureModal";

export { default as Card } from "./Card";
export * from "./Card";

export { default as Carousel } from "./Carousel";
export * from "./Carousel";

export { default as Chart } from "./Chart";
export * from "./Chart";

export { default as ChatComposer } from "./ChatComposer";
export * from "./ChatComposer";

export { default as ChatConversationItem } from "./ChatConversationItem";
export * from "./ChatConversationItem";

export { default as ChatMessage } from "./ChatMessage";
export * from "./ChatMessage";

export { default as ChatWindow } from "./ChatWindow";
export * from "./ChatWindow";

export { default as CodeEditor } from "./CodeEditor";
export * from "./CodeEditor";

export { default as Collapsible } from "./Collapsible";
export * from "./Collapsible";

export { default as CommandMenu } from "./CommandMenu";
export * from "./CommandMenu";

export { default as ConfirmDialog } from "./ConfirmDialog";
export * from "./ConfirmDialog";

export { default as ContextMenu } from "./ContextMenu";
export * from "./ContextMenu";

export { default as Countdown } from "./Countdown";
export * from "./Countdown";

export { default as DataTable } from "./DataTable";
export * from "./DataTable";

export { default as DescriptionList } from "./DescriptionList";
export * from "./DescriptionList";

export * from "./DetailLayout";

export { default as Diff } from "./Diff";
export * from "./Diff";

export { default as Dock } from "./Dock";
export * from "./Dock";

export { default as Drawer } from "./Drawer";
export * from "./Drawer";

export { default as EmojiPicker } from "./EmojiPicker";
export * from "./EmojiPicker";

export { default as EmptyState } from "./EmptyState";
export * from "./EmptyState";

export { default as FileDropzone } from "./FileDropzone";
export * from "./FileDropzone";

export { default as FilterBar } from "./FilterBar";
export * from "./FilterBar";

export { default as FloatButton, FloatButtonGroup, BackTop } from "./FloatButton";
export * from "./FloatButton";

export { default as Footer } from "./Footer";
export * from "./Footer";

export { default as FormDrawer } from "./FormDrawer";
export * from "./FormDrawer";

export {
  default as FormModal,
  FormSectionHeader,
  FormEmptyLine,
  FormModalSkeleton,
  type FormModalProps,
  type FormTabItem,
  type FormSectionHeaderProps,
} from "./FormModal";

export { default as Header } from "./Header";
export * from "./Header";

export { default as HeaderWrapper } from "./HeaderWrapper";
export * from "./HeaderWrapper";

export { default as HighlightText } from "./HighlightText";
export * from "./HighlightText";

export { default as HoverCard } from "./HoverCard";
export * from "./HoverCard";

export { default as HoverGallery } from "./HoverGallery";
export * from "./HoverGallery";

export { default as ImageLightbox } from "./ImageLightbox";
export * from "./ImageLightbox";

export { default as InboxList } from "./InboxList";
export * from "./InboxList";

export { default as Indicator } from "./Indicator";
export * from "./Indicator";

export { default as InlineEdit } from "./InlineEdit";
export * from "./InlineEdit";

export { default as Item } from "./Item";
export * from "./Item";

export { default as JsonViewer } from "./JsonViewer";
export * from "./JsonViewer";

export { default as KanbanBoard } from "./KanbanBoard";
export * from "./KanbanBoard";

export { default as Kbd } from "./Kbd";
export * from "./Kbd";

export { default as Loading } from "./Loading";
export * from "./Loading";

export { default as LoginForm } from "./LoginForm";
export * from "./LoginForm";

export { default as Marquee } from "./Marquee";
export * from "./Marquee";

export { default as Masonry } from "./Masonry";
export * from "./Masonry";

export { default as Mask } from "./Mask";
export * from "./Mask";

export { default as Mockup } from "./Mockup";
export * from "./Mockup";

export { default as Modal } from "./Modal";
export * from "./Modal";

export { default as NotificationBell } from "./NotificationBell";
export * from "./NotificationBell";

export { default as OTPInput } from "./OTPInput";
export * from "./OTPInput";

export { default as PageHeader } from "./PageHeader";
export * from "./PageHeader";

export { default as Pagination } from "./Pagination";
export * from "./Pagination";

export { default as PasswordConfirmDialog } from "./PasswordConfirmDialog";
export * from "./PasswordConfirmDialog";

export { default as PasswordStrength } from "./PasswordStrength";
export * from "./PasswordStrength";

export { default as PingIndicator } from "./PingIndicator";
export * from "./PingIndicator";

export { default as Popconfirm } from "./Popconfirm";
export * from "./Popconfirm";

export { default as PriceInput, CurrencyField } from "./PriceInput";
export * from "./PriceInput";

export { default as Progress } from "./Progress";
export * from "./Progress";

export { default as PullToRefresh } from "./PullToRefresh";
export * from "./PullToRefresh";

export { default as QRCode } from "./QRCode";
export * from "./QRCode";

export { default as QuickActions } from "./QuickActions";
export * from "./QuickActions";

export { default as Result } from "./Result";
export * from "./Result";

export { default as ScrollArea } from "./ScrollArea";
export * from "./ScrollArea";

export { default as SegmentedControl } from "./SegmentedControl";
export * from "./SegmentedControl";

export { default as Separator } from "./Separator";
export * from "./Separator";

export { default as ServiceStatusCard } from "./ServiceStatusCard";
export * from "./ServiceStatusCard";

// ShellContext has no default export
export * from "./ShellContext";

export { default as ShortcutHint } from "./ShortcutHint";
export * from "./ShortcutHint";

export { default as Sidebar } from "./Sidebar";
export * from "./Sidebar";

export { default as SignaturePad, SignatureField } from "./SignaturePad";
export * from "./SignaturePad";

export {
  default as Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
  SkeletonImage,
  SkeletonCard,
  SkeletonTable,
} from "./Skeleton";
export * from "./Skeleton";

export { default as SmartObject } from "./SmartObject";
export * from "./SmartObject";

export { default as Snippet, CopyButton } from "./Snippet";
export * from "./Snippet";

export { default as SortableList } from "./SortableList";
export * from "./SortableList";

export { default as SpeedDial } from "./SpeedDial";
export * from "./SpeedDial";

export { default as SplitPane } from "./SplitPane";
export * from "./SplitPane";

export { default as Spoiler } from "./Spoiler";
export * from "./Spoiler";

export { default as Stack } from "./Stack";
export * from "./Stack";

export { default as StatCard, StatsSegmentsCard, StatsRingCard } from "./StatCard";
export * from "./StatCard";

export { default as StatusBadge } from "./StatusBadge";
export * from "./StatusBadge";

export { default as StatusPage } from "./StatusPage";
export * from "./StatusPage";

export { default as Stepper } from "./Stepper";
export * from "./Stepper";

export { default as Swap } from "./Swap";
export * from "./Swap";

export { default as Table } from "./Table";
export * from "./Table";

export { default as TableOfContents } from "./TableOfContents";
export * from "./TableOfContents";

export { default as Tabs } from "./Tabs";
export * from "./Tabs";

export { default as TextRotate } from "./TextRotate";
export * from "./TextRotate";

// ThemeContext has no default export
export * from "./ThemeContext";

export { default as ThemeToggle } from "./ThemeToggle";

export { default as Timeline } from "./Timeline";
export * from "./Timeline";

// Toast: default export is the `toast` imperative API
export { default as toast } from "./Toast";
export * from "./Toast";

export { default as ToggleGroup } from "./ToggleGroup";
export * from "./ToggleGroup";

export { default as Tour } from "./Tour";
export * from "./Tour";

export { default as TransferList } from "./TransferList";
export * from "./TransferList";

export { default as TreeView } from "./TreeView";
export * from "./TreeView";

export { default as Watermark } from "./Watermark";
export * from "./Watermark";

// ─── Access Control / RBAC ───────────────────────────────────────────────────

export { default as Can } from "./Can";
export * from "./Can";

export { default as Controllable } from "./Controllable";
export * from "./Controllable";

export * from "./useAccessControl";

// ─── Compound Patterns ───────────────────────────────────────────────────────

export {
  FormModal as CompoundFormModal,
  FormModal as FormDialog,
  FormModalHeader,
  FormModalBody,
  FormModalActions,
  useFormModal,
  type FormModalProps as CompoundFormModalProps,
  type FormModalHeaderProps,
  type FormModalBodyProps,
  type FormModalActionsProps,
  type FormModalSize,
} from "./patterns/form-modal";

// ─── Sub-components: header/ ──────────────────────────────────────────────────

export { default as Brand } from "./header/Brand";
export * from "./header/Brand";

export { default as Nav } from "./header/Nav";
export * from "./header/Nav";

export { default as ProfileActions } from "./header/ProfileActions";
export * from "./header/ProfileActions";

export { default as ProfileMenu } from "./header/ProfileMenu";
export * from "./header/ProfileMenu";

export { default as ProfileTrigger } from "./header/ProfileTrigger";
export * from "./header/ProfileTrigger";

export { default as SearchInput } from "./header/SearchInput";
export * from "./header/SearchInput";

// ─── Form fields ─────────────────────────────────────────────────────────────

export { default as AutocompleteField } from "./form/AutocompleteField";
export * from "./form/AutocompleteField";

export { default as CascaderField, Cascader } from "./form/CascaderField";
export * from "./form/CascaderField";

export { default as Checkbox } from "./form/Checkbox";
export * from "./form/Checkbox";

export { default as CheckboxGroup } from "./form/CheckboxGroup";
export * from "./form/CheckboxGroup";

export { default as ColorPickerField } from "./form/ColorPickerField";
export * from "./form/ColorPickerField";

export { default as DateField } from "./form/DateField";
export * from "./form/DateField";

export { default as DatePickerField } from "./form/DatePickerField";
export * from "./form/DatePickerField";

export { default as DateRangePickerField } from "./form/DateRangePickerField";
export * from "./form/DateRangePickerField";

export { default as FieldWrapper, default as FormField } from "./form/FieldWrapper";
export * from "./form/FieldWrapper";

export { default as FileField } from "./form/FileField";
export * from "./form/FileField";

export { default as FilterChips } from "./form/FilterChips";
export * from "./form/FilterChips";

export { default as Form } from "./form/Form";
export * from "./form/Form";

export { default as InputGroup } from "./form/InputGroup";
export * from "./form/InputGroup";

export { default as MentionsField, Mentions } from "./form/MentionsField";
export * from "./form/MentionsField";

export { default as MonthPickerField } from "./form/MonthPickerField";
export * from "./form/MonthPickerField";

export { default as MultiSelectField } from "./form/MultiSelectField";
export * from "./form/MultiSelectField";

export { default as NativeSelect, default as Select } from "./form/NativeSelect";
export * from "./form/NativeSelect";

export { default as NumberField } from "./form/NumberField";
export * from "./form/NumberField";

export { default as RadioGroupField } from "./form/RadioGroupField";
export * from "./form/RadioGroupField";

export { default as RatingField } from "./form/RatingField";
export * from "./form/RatingField";

export { default as SelectField } from "./form/SelectField";
export * from "./form/SelectField";

export { default as SliderField } from "./form/SliderField";
export * from "./form/SliderField";

export { default as Switch } from "./form/Switch";
export * from "./form/Switch";

export { default as TagInputField } from "./form/TagInputField";
export * from "./form/TagInputField";

export { default as TagsInput, CheckableTag, CheckableTagGroup } from "./form/TagsInput";
export * from "./form/TagsInput";

export { default as TextareaField } from "./form/TextareaField";
export * from "./form/TextareaField";

export { default as TextField } from "./form/TextField";
export * from "./form/TextField";

export { default as TimeField } from "./form/TimeField";
export * from "./form/TimeField";

export { default as TimePickerField } from "./form/TimePickerField";
export * from "./form/TimePickerField";

export { default as TreeSelectField, TreeSelect } from "./form/TreeSelectField";
export * from "./form/TreeSelectField";

export { default as ZodForm, useFormContext } from "./form/ZodForm";
export * from "./form/ZodForm";
