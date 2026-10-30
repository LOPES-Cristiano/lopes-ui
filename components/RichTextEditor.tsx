"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EditorContent,
  Node,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
  useEditor,
  type Editor,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { twMerge } from "tailwind-merge";
import {
  AArrowDown,
  AArrowUp,
  AlertOctagon,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
  Code2,
  Columns,
  Copy,
  FileCode2,
  FilePlus2,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Info,
  Italic,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  Maximize2,
  Merge,
  Minimize2,
  Minus,
  Palette,
  PanelTop,
  Paperclip,
  Pilcrow,
  Printer,
  Quote,
  Redo,
  RemoveFormatting,
  Replace,
  Rows,
  ScissorsLineDashed,
  Search,
  Sparkles,
  Split,
  SquareCheck,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { useAccessControl } from "./useAccessControl";

// ═══════════ Types ═══════════

export type ToolbarGroup =
  | "history"
  | "font"
  | "block"
  | "inline"
  | "format"
  | "align"
  | "list"
  | "link"
  | "table"
  | "media"
  | "callout"
  | "variables"
  | "tools";

export type RichTextVariant =
  | "default"
  | "borderless"
  | "filled"
  | "minimal"
  | "notion"
  | "document";

export type RichTextToolbarPreset =
  | "full"
  | "standard"
  | "compact"
  | "minimal"
  | "document";

export type RichTextCalloutType = "info" | "success" | "warning" | "danger";

export type RichTextAttachment = {
  id: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  url?: string;
};

export type RichTextVariable = {
  /** Key used inside `{{key}}` merge tags (e.g. `cliente_nome`) */
  key: string;
  /** Friendly display label (e.g. `Nome do Cliente`) */
  label: string;
  /** Optional grouping category */
  category?: string;
  /** Optional example preview */
  example?: string;
};

export type RichTextSnippet = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  html: string;
};

export type RichTextEditorRef = {
  editor: Editor | null;
  insertContent: (content: string) => void;
  insertVariable: (variable: RichTextVariable | string) => void;
  insertPageBreak: () => void;
  focus: () => void;
  clear: () => void;
  getHTML: () => string;
  getText: () => string;
};

export type RichTextEditorProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  maxLength?: number;
  toolbar?: ToolbarGroup[];
  toolbarPreset?: RichTextToolbarPreset;
  stickyToolbar?: boolean;
  /** Floating formatting menu above selected text. Default: true */
  bubbleMenu?: boolean;
  /** Enable `/` slash commands palette inside blocks. Default: true */
  slashCommands?: boolean;
  /** Enable `Ctrl+F` / toolbar search & replace bar. Default: true */
  searchable?: boolean;
  /** Allow switching between WYSIWYG visual mode and raw HTML source mode */
  allowSourceView?: boolean;
  /** Dynamic variables / merge tags (`{{chave}}`) available via toolbar & `{{` autocomplete */
  variables?: RichTextVariable[];
  /** Reusable clauses / templates quick-insert menu */
  snippets?: RichTextSnippet[];
  /** Optional async image uploader (avoids base64 bloat in production) */
  onUploadImage?: (file: File) => Promise<string> | string;
  /** Attached files displayed below the editor */
  attachments?: RichTextAttachment[];
  onAddAttachment?: (file: File) => Promise<void> | void;
  onRemoveAttachment?: (id: string) => Promise<void> | void;
  showAttachments?: boolean;
  /** Imperative insert registration callback for external sidebars */
  onRegisterInsertHandler?: (fn: (content: string) => void) => void;
  /** Optional document header title used in `"document"` variant and print view */
  documentTitle?: string;
  variant?: RichTextVariant;
  className?: string;
  editorClassName?: string;
  componentId?: string;
  hideIfDenied?: boolean;
  /** Optional custom compound layout (`RichTextEditor.Toolbar`, `RichTextEditor.Content`) */
  children?: React.ReactNode;
  ref?: React.Ref<RichTextEditorRef>;
};

const PRESET_GROUPS: Record<RichTextToolbarPreset, ToolbarGroup[]> = {
  full: [
    "history",
    "font",
    "block",
    "inline",
    "format",
    "align",
    "list",
    "callout",
    "link",
    "table",
    "media",
    "variables",
    "tools",
  ],
  standard: [
    "history",
    "font",
    "block",
    "inline",
    "format",
    "align",
    "list",
    "callout",
    "link",
    "table",
    "media",
    "variables",
  ],
  compact: ["history", "block", "inline", "list", "link"],
  minimal: ["inline", "list", "link"],
  document: [
    "history",
    "font",
    "block",
    "inline",
    "format",
    "align",
    "list",
    "callout",
    "link",
    "table",
    "media",
    "variables",
    "tools",
  ],
};

// ═══════════ Compound Context (@mantine/tiptap pattern) ═══════════

type RichTextContextValue = {
  editor: Editor | null;
  disabled: boolean;
  readOnly: boolean;
};

const RichTextEditorContext = createContext<RichTextContextValue | null>(null);

export function useRichTextEditorContext(): RichTextContextValue {
  const ctx = useContext(RichTextEditorContext);
  if (!ctx) {
    throw new Error("useRichTextEditorContext deve ser usado dentro de <RichTextEditor>.");
  }
  return ctx;
}

// ═══════════ Constants ═══════════

const FONT_OPTIONS = [
  { label: "Padrão", value: "" },
  { label: "Inter / Sans", value: "Inter, system-ui, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];
const DEFAULT_FONT_SIZE = 14;

const TEXT_COLORS = [
  { color: "#09090b", label: "Preto" },
  { color: "#3f3f46", label: "Grafite" },
  { color: "#2563eb", label: "Azul" },
  { color: "#0891b2", label: "Ciano" },
  { color: "#16a34a", label: "Verde" },
  { color: "#dc2626", label: "Vermelho" },
  { color: "#d97706", label: "Âmbar" },
  { color: "#db2777", label: "Rosa" },
  { color: "#7c3aed", label: "Roxo" },
  { color: "#71717a", label: "Cinza" },
];

const HIGHLIGHT_COLORS = [
  { color: "#fef08a", label: "Amarelo" },
  { color: "#bbf7d0", label: "Verde" },
  { color: "#bfdbfe", label: "Azul" },
  { color: "#fecaca", label: "Vermelho" },
  { color: "#fbcfe8", label: "Rosa" },
  { color: "#e9d5ff", label: "Roxo" },
  { color: "#fed7aa", label: "Laranja" },
  { color: "#d1fae5", label: "Menta" },
];

const CALLOUT_META: Record<
  RichTextCalloutType,
  { label: string; icon: LucideIcon; badgeCls: string; iconCls: string }
> = {
  info: {
    label: "Informação",
    icon: Info,
    badgeCls: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    iconCls: "text-blue-600 dark:text-blue-400",
  },
  success: {
    label: "Confirmação",
    icon: CheckCircle2,
    badgeCls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    iconCls: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    label: "Atenção",
    icon: AlertTriangle,
    badgeCls: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    iconCls: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    label: "Crítico",
    icon: AlertOctagon,
    badgeCls: "bg-red-500/15 text-red-700 dark:text-red-300",
    iconCls: "text-red-600 dark:text-red-400",
  },
};

function formatFileSizeShort(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ═══════════ Custom Tiptap Extensions ═══════════

const FontSizeExtension = TextStyle.extend({
  name: "textStyle",
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el: HTMLElement) => el.style.fontSize?.replace("px", "") || null,
        renderHTML: (attrs: Record<string, unknown>) =>
          !attrs.fontSize ? {} : { style: `font-size: ${String(attrs.fontSize)}px` },
      },
    };
  },
});

function applyEditorFontSize(editor: Editor, size: number) {
  editor.chain().focus().setMark("textStyle", { fontSize: String(size) }).run();
}

function clearEditorFontSize(editor: Editor) {
  editor.chain().focus().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
}

// ── Callout Block Extension ──────────────────────────────────────────────────

function CalloutNodeView({
  node,
  updateAttributes,
  deleteNode,
  editor,
}: NodeViewProps) {
  const rawType = String(node.attrs.type ?? "info");
  const type: RichTextCalloutType =
    rawType in CALLOUT_META ? (rawType as RichTextCalloutType) : "info";
  const meta = CALLOUT_META[type];
  const Icon = meta.icon;
  const editable = editor.isEditable;

  return (
    <NodeViewWrapper
      data-callout=""
      data-callout-type={type}
      className="group/callout relative my-3 rounded-xl border border-border border-l-4 p-3.5 transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <div
          contentEditable={false}
          className={twMerge("mt-0.5 shrink-0 select-none", meta.iconCls)}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          {editable && (
            <div
              contentEditable={false}
              className="mb-1.5 flex flex-wrap items-center justify-between gap-1 select-none opacity-80 group-hover/callout:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-1">
                {(Object.keys(CALLOUT_META) as RichTextCalloutType[]).map((t) => {
                  const m = CALLOUT_META[t];
                  const active = t === type;
                  return (
                    <button
                      key={t}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        updateAttributes({ type: t });
                      }}
                      className={twMerge(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer",
                        active
                          ? m.badgeCls
                          : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
                      )}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                title="Remover bloco de destaque"
                aria-label="Remover bloco de destaque"
                onMouseDown={(e) => {
                  e.preventDefault();
                  deleteNode();
                }}
                className="rounded p-0.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <NodeViewContent className="min-w-0 text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-callout-type") || "info",
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-callout": "",
          "data-callout-type": String(attrs.type || "info"),
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});

// ── PageBreak Block Extension ────────────────────────────────────────────────

const PageBreakExtension = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,
  parseHTML() {
    return [{ tag: "div[data-page-break]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-page-break": "true",
        contenteditable: "false",
      }),
      ["span", {}, "Quebra de página"],
    ];
  },
});

// ── MergeTag / Dynamic Variable Extension ────────────────────────────────────

const MergeTagExtension = Node.create({
  name: "mergeTag",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      key: {
        default: "variavel",
        parseHTML: (el: HTMLElement) =>
          el.getAttribute("data-merge-tag") ||
          el.textContent?.replace(/^\{\{|\}\}$/g, "").trim() ||
          "variavel",
      },
      label: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-merge-label") || null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-merge-tag]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const key = String(node.attrs.key || "variavel");
    const label = node.attrs.label ? String(node.attrs.label) : null;
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-merge-tag": key,
        ...(label ? { "data-merge-label": label, title: `${label} ({{${key}}})` } : {}),
      }),
      `{{${key}}}`,
    ];
  },
});

// ── ResizableImage NodeView with Caption ─────────────────────────────────────

function ResizableImageView({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = containerRef.current?.offsetWidth ?? 400;
    const onMove = (ev: MouseEvent) =>
      setLiveWidth(Math.max(80, startWidthRef.current + ev.clientX - startXRef.current));
    const onUp = (ev: MouseEvent) => {
      updateAttributes({
        width: `${Math.max(80, startWidthRef.current + ev.clientX - startXRef.current)}px`,
      });
      setLiveWidth(null);
      setIsResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const editable = editor.isEditable;
  const isActive = editable && (isHovered || selected || isResizing);
  const imgAlign: "left" | "center" | "right" = node.attrs.align ?? "center";
  const resolvedWidth = liveWidth ? `${liveWidth}px` : (node.attrs.width ?? "auto");
  const caption: string = node.attrs.caption ?? "";

  return (
    <NodeViewWrapper
      style={{
        display: "block",
        textAlign:
          imgAlign === "right" ? "right" : imgAlign === "left" ? "left" : "center",
        marginTop: "0.75rem",
        marginBottom: "0.75rem",
      }}
    >
      <div
        ref={containerRef}
        contentEditable={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!isResizing) setIsHovered(false);
        }}
        className={twMerge(
          "relative inline-block max-w-full rounded-lg select-none",
          isActive && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
          !isResizing && "transition-shadow duration-150"
        )}
        style={{
          width: resolvedWidth === "auto" ? undefined : resolvedWidth,
          cursor: isResizing ? "ew-resize" : "default",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? caption ?? "Imagem"}
          draggable={false}
          className="block w-full h-auto rounded-md shadow-sm pointer-events-none"
        />

        {(caption || editingCaption) && (
          <div className="mt-1.5 text-center">
            {editable && editingCaption ? (
              <input
                type="text"
                autoFocus
                value={caption}
                placeholder="Adicionar legenda da imagem..."
                onChange={(e) => updateAttributes({ caption: e.target.value, alt: e.target.value })}
                onBlur={() => setEditingCaption(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    e.preventDefault();
                    setEditingCaption(false);
                  }
                }}
                className="w-full rounded border border-border bg-surface px-2 py-1 text-center text-xs text-foreground focus:outline-none focus:border-primary"
              />
            ) : (
              <p
                onClick={() => editable && setEditingCaption(true)}
                className={twMerge(
                  "text-xs text-muted-foreground italic",
                  editable && "cursor-pointer hover:text-foreground"
                )}
              >
                {caption}
              </p>
            )}
          </div>
        )}

        {isActive && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-xl bg-zinc-900/92 backdrop-blur-md px-2 py-1 shadow-xl whitespace-nowrap pointer-events-auto">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                aria-label={
                  a === "left"
                    ? "Alinhar à esquerda"
                    : a === "center"
                      ? "Centralizar"
                      : "Alinhar à direita"
                }
                onMouseDown={(e) => {
                  e.preventDefault();
                  updateAttributes({ align: a });
                }}
                className={twMerge(
                  "h-5.5 w-5.5 rounded flex items-center justify-center text-[11px] cursor-pointer transition-colors",
                  imgAlign === a
                    ? "bg-white text-zinc-900 font-bold"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {a === "left" ? "←" : a === "center" ? "≡" : "→"}
              </button>
            ))}
            <div className="mx-1 h-4 w-px bg-white/15" />
            {(["25%", "50%", "75%", "100%"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const pw = containerRef.current?.parentElement?.offsetWidth;
                  if (pw) {
                    updateAttributes({ width: `${Math.round((pw * parseInt(w, 10)) / 100)}px` });
                  } else {
                    updateAttributes({ width: w });
                  }
                }}
                className="h-5.5 rounded bg-white/10 px-1.5 text-[10px] font-semibold text-white/85 hover:bg-white/20 cursor-pointer"
              >
                {w}
              </button>
            ))}
            <div className="mx-1 h-4 w-px bg-white/15" />
            <button
              type="button"
              title="Editar legenda"
              onMouseDown={(e) => {
                e.preventDefault();
                setEditingCaption(true);
              }}
              className="h-5.5 rounded bg-white/10 px-1.5 text-[10px] font-medium text-white/85 hover:bg-white/20 cursor-pointer"
            >
              Legenda
            </button>
            <button
              type="button"
              aria-label="Remover imagem"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="h-5.5 w-5.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/35 flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {isActive && (
          <div
            onMouseDown={handleResizeMouseDown}
            title="Arrastar para redimensionar"
            className="absolute bottom-1.5 right-1.5 z-40 flex h-5 w-5 cursor-se-resize items-center justify-center rounded bg-primary text-primary-foreground shadow-md"
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
              <circle cx="1.5" cy="1.5" r="1.1" />
              <circle cx="4.5" cy="4.5" r="1.1" />
              <circle cx="7.5" cy="7.5" r="1.1" />
            </svg>
          </div>
        )}

        {isResizing && liveWidth && (
          <div className="absolute bottom-8 right-1.5 z-40 rounded bg-zinc-900/90 px-2 py-0.5 font-mono text-[10px] text-white">
            {liveWidth}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-width") ?? null,
        renderHTML: (attrs: Record<string, string>) =>
          attrs.width
            ? { "data-width": attrs.width, style: `width: ${attrs.width}; max-width: 100%;` }
            : { style: "max-width: 100%;" },
      },
      align: {
        default: "center",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-align") ?? "center",
        renderHTML: (attrs: Record<string, string>) => ({
          "data-align": attrs.align ?? "center",
        }),
      },
      caption: {
        default: "",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-caption") ?? "",
        renderHTML: (attrs: Record<string, string>) =>
          attrs.caption ? { "data-caption": attrs.caption } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ═══════════ Toolbar Primitives & Compound Controls ═══════════

export type RichTextControlProps = {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function RichTextControl({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  children,
  className,
}: RichTextControlProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      className={twMerge(
        "inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer",
        "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none",
        active &&
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        className
      )}
    >
      {Icon ? <Icon size={13} strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

export function RichTextControlsGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        "inline-flex items-center gap-0.5 rounded-lg border border-border/70 bg-surface p-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function RichTextToolbarContainer({
  sticky = false,
  children,
  className,
}: {
  sticky?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        "flex flex-wrap items-center gap-1 border-b border-border bg-surface-muted/60 px-2 py-1.5 select-none",
        sticky && "sticky top-0 z-30 backdrop-blur-md bg-surface/90",
        className
      )}
    >
      {children}
    </div>
  );
}

export function RichTextContentArea({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const { editor } = useRichTextEditorContext();
  if (!editor) return null;
  return (
    <EditorContent
      editor={editor}
      className={twMerge(
        "rte-content flex-1 px-4 py-3 focus:outline-none text-foreground prose prose-sm max-w-none dark:prose-invert overflow-auto",
        className
      )}
      style={style}
    />
  );
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px bg-border shrink-0" />;
}

// ═══════════ Slash Command Definitions ═══════════

type SlashItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  icon: LucideIcon;
  action: (editor: Editor) => void;
};

function buildSlashItems(
  hasPageBreak: boolean,
  variables?: RichTextVariable[],
  snippets?: RichTextSnippet[]
): SlashItem[] {
  const base: SlashItem[] = [
    {
      id: "p",
      title: "Texto / Parágrafo",
      description: "Bloco de texto padrão",
      category: "Básico",
      keywords: ["texto", "paragrafo", "p"],
      icon: Pilcrow,
      action: (ed) => ed.chain().focus().setParagraph().run(),
    },
    {
      id: "h1",
      title: "Título 1",
      description: "Cabeçalho principal de seção",
      category: "Básico",
      keywords: ["h1", "titulo", "heading", "cabecalho"],
      icon: Heading1,
      action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: "h2",
      title: "Título 2",
      description: "Subtítulo intermediário",
      category: "Básico",
      keywords: ["h2", "subtitulo", "heading"],
      icon: Heading2,
      action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: "h3",
      title: "Título 3",
      description: "Subseção compacta",
      category: "Básico",
      keywords: ["h3", "subsecao", "heading"],
      icon: Heading3,
      action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      id: "bullet",
      title: "Lista com Marcadores",
      description: "Itens simples não ordenados",
      category: "Listas",
      keywords: ["lista", "marcadores", "ul", "bullet"],
      icon: List,
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      id: "ordered",
      title: "Lista Numerada",
      description: "Sequência ordenada 1, 2, 3...",
      category: "Listas",
      keywords: ["numerada", "ordenada", "ol", "passos"],
      icon: ListOrdered,
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "task",
      title: "Lista de Tarefas (Checklist)",
      description: "Itens marcáveis com caixa de seleção",
      category: "Listas",
      keywords: ["checklist", "tarefa", "todo", "check"],
      icon: SquareCheck,
      action: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      id: "callout-info",
      title: "Destaque Informativo",
      description: "Caixa de observação azul no documento",
      category: "Blocos Ricos",
      keywords: ["callout", "info", "nota", "destaque", "alerta"],
      icon: Info,
      action: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: "callout",
            attrs: { type: "info" },
            content: [{ type: "paragraph" }],
          })
          .run(),
    },
    {
      id: "callout-warning",
      title: "Destaque de Atenção",
      description: "Aviso importante em âmbar",
      category: "Blocos Ricos",
      keywords: ["aviso", "atencao", "warning", "cuidado"],
      icon: AlertTriangle,
      action: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: "callout",
            attrs: { type: "warning" },
            content: [{ type: "paragraph" }],
          })
          .run(),
    },
    {
      id: "callout-success",
      title: "Destaque de Confirmação",
      description: "Bloco positivo / aprovado em verde",
      category: "Blocos Ricos",
      keywords: ["sucesso", "aprovado", "ok", "confirmacao"],
      icon: CheckCircle2,
      action: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: "callout",
            attrs: { type: "success" },
            content: [{ type: "paragraph" }],
          })
          .run(),
    },
    {
      id: "quote",
      title: "Citação",
      description: "Bloco de citação com barra lateral",
      category: "Blocos Ricos",
      keywords: ["citacao", "quote", "blockquote"],
      icon: Quote,
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      id: "codeblock",
      title: "Bloco de Código",
      description: "Trecho monoespaçado formatado",
      category: "Blocos Ricos",
      keywords: ["codigo", "code", "pre", "json", "sql"],
      icon: FileCode2,
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: "table",
      title: "Tabela 3×3",
      description: "Grade estruturada com cabeçalho",
      category: "Blocos Ricos",
      keywords: ["tabela", "table", "grade", "planilha"],
      icon: TableIcon,
      action: (ed) =>
        ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      id: "divider",
      title: "Linha Divisória",
      description: "Separador horizontal de seção",
      category: "Blocos Ricos",
      keywords: ["divisor", "linha", "hr", "separador"],
      icon: Minus,
      action: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },
  ];

  if (hasPageBreak) {
    base.push({
      id: "pagebreak",
      title: "Quebra de Página",
      description: "Inicia nova folha na impressão / PDF",
      category: "Documento",
      keywords: ["quebra", "pagina", "impressao", "a4", "pagebreak"],
      icon: ScissorsLineDashed,
      action: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent([{ type: "pageBreak" }, { type: "paragraph" }])
          .run(),
    });
  }

  if (snippets && snippets.length > 0) {
    for (const snip of snippets.slice(0, 8)) {
      base.push({
        id: `snip-${snip.id}`,
        title: snip.title,
        description: snip.description ?? "Inserir modelo/cláusula",
        category: snip.category ?? "Modelos",
        keywords: ["modelo", "clausula", "template", snip.title.toLowerCase()],
        icon: Sparkles,
        action: (ed) => ed.chain().focus().insertContent(snip.html).run(),
      });
    }
  }

  if (variables && variables.length > 0) {
    for (const v of variables.slice(0, 8)) {
      base.push({
        id: `var-${v.key}`,
        title: `{{${v.key}}}`,
        description: v.label,
        category: "Variáveis",
        keywords: ["variavel", "campo", v.key.toLowerCase(), v.label.toLowerCase()],
        icon: Braces,
        action: (ed) =>
          ed
            .chain()
            .focus()
            .insertContent([
              { type: "mergeTag", attrs: { key: v.key, label: v.label } },
              { type: "text", text: " " },
            ])
            .run(),
      });
    }
  }

  return base;
}

// ═══════════ Built-in Rich Toolbar ═══════════

function Toolbar({
  editor,
  groups,
  variables,
  snippets,
  onUploadImage,
  uploadingImage,
  onUploadFileTrigger,
  allowSourceView,
  sourceMode,
  onToggleSourceMode,
  searchable,
  searchOpen,
  onToggleSearch,
  isDocumentVariant,
  onPrint,
}: {
  editor: Editor;
  groups: ToolbarGroup[];
  variables?: RichTextVariable[];
  snippets?: RichTextSnippet[];
  onUploadImage?: (file: File) => Promise<string> | string;
  uploadingImage?: boolean;
  onUploadFileTrigger: (file: File) => Promise<void>;
  allowSourceView?: boolean;
  sourceMode: boolean;
  onToggleSourceMode: () => void;
  searchable: boolean;
  searchOpen: boolean;
  onToggleSearch: () => void;
  isDocumentVariant: boolean;
  onPrint: () => void;
}) {
  const has = (g: ToolbarGroup) => groups.includes(g);
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const fontFamilyRef = useRef<HTMLDivElement>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [calloutMenuOpen, setCalloutMenuOpen] = useState(false);
  const [varMenuOpen, setVarMenuOpen] = useState(false);
  const [snippetMenuOpen, setSnippetMenuOpen] = useState(false);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [hoverTableDim, setHoverTableDim] = useState<{ r: number; c: number }>({ r: 3, c: 3 });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [copiedHtml, setCopiedHtml] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(e.target as globalThis.Node)) {
        setFontFamilyOpen(false);
      }
      if (rootRef.current && !rootRef.current.contains(e.target as globalThis.Node)) {
        setColorPickerOpen(false);
        setHighlightPickerOpen(false);
        setCalloutMenuOpen(false);
        setVarMenuOpen(false);
        setSnippetMenuOpen(false);
        setTablePickerOpen(false);
        setLinkOpen(false);
        setImageModalOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const dom = editor.view.dom;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setLinkUrl(editor.getAttributes("link").href ?? "");
        setLinkOpen(true);
      }
    };
    dom.addEventListener("keydown", onKey);
    return () => dom.removeEventListener("keydown", onKey);
  }, [editor]);

  const currentFontFamily = editor.getAttributes("textStyle")?.fontFamily ?? "";
  const currentFontLabel =
    FONT_OPTIONS.find((f) => f.value === currentFontFamily)?.label ?? "Fonte";
  const rawFontSize = editor.getAttributes("textStyle")?.fontSize;
  const currentFontSize: number = rawFontSize ? parseInt(rawFontSize, 10) : DEFAULT_FONT_SIZE;

  const decreaseFontSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(currentFontSize);
    const prev =
      idx > 0
        ? FONT_SIZES[idx - 1]
        : (FONT_SIZES.findLast((s) => s < currentFontSize) ?? FONT_SIZES[0]);
    applyEditorFontSize(editor, prev);
  }, [editor, currentFontSize]);

  const increaseFontSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(currentFontSize);
    const next =
      idx < FONT_SIZES.length - 1
        ? FONT_SIZES[idx + 1]
        : (FONT_SIZES.find((s) => s > currentFontSize) ?? FONT_SIZES[FONT_SIZES.length - 1]);
    applyEditorFontSize(editor, next);
  }, [editor, currentFontSize]);

  const applyLink = useCallback(() => {
    const raw = linkUrl.trim();
    if (!raw) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(raw) ? raw : `https://${raw}`;
      const attrs = { href, target: "_blank", rel: "noopener noreferrer" };
      if (editor.state.selection.empty && !editor.isActive("link")) {
        editor
          .chain()
          .focus()
          .insertContent({ type: "text", text: raw, marks: [{ type: "link", attrs }] })
          .run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
      }
    }
    setLinkOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const applyImageUrl = useCallback(() => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl("");
    setImageModalOpen(false);
  }, [editor, imageUrl]);

  const handleImageFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await onUploadFileTrigger(file);
      e.target.value = "";
      setImageModalOpen(false);
    },
    [onUploadFileTrigger]
  );

  const hasVariables = Boolean(variables && variables.length > 0);
  const hasSnippets = Boolean(snippets && snippets.length > 0);
  const showTools = has("tools") || Boolean(allowSourceView) || isDocumentVariant;
  const after = (...rest: ToolbarGroup[]) => rest.some(has);

  return (
    <div
      ref={rootRef}
      className="relative flex flex-wrap items-center gap-0.5 p-1.5 select-none"
    >
      {has("history") && (
        <>
          <RichTextControl
            icon={Undo}
            label="Desfazer (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={sourceMode || !editor.can().undo()}
          />
          <RichTextControl
            icon={Redo}
            label="Refazer (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={sourceMode || !editor.can().redo()}
          />
          {after(
            "font",
            "block",
            "inline",
            "format",
            "align",
            "list",
            "callout",
            "link",
            "table",
            "media"
          ) && <Sep />}
        </>
      )}

      {has("font") && !sourceMode && (
        <>
          <div className="relative" ref={fontFamilyRef}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFontFamilyOpen((p) => !p)}
              className={twMerge(
                "inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer",
                "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                fontFamilyOpen && "bg-surface-hover text-foreground"
              )}
            >
              <Type size={12} strokeWidth={2} />
              <span
                className="max-w-[60px] truncate"
                style={{ fontFamily: currentFontFamily || undefined }}
              >
                {currentFontLabel}
              </span>
              <ChevronDown size={10} />
            </button>
            {fontFamilyOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl animate-in fade-in duration-100">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!f.value) editor.chain().focus().unsetFontFamily().run();
                      else editor.chain().focus().setFontFamily(f.value).run();
                      setFontFamilyOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                    style={{ fontFamily: f.value || undefined }}
                  >
                    <span>{f.label}</span>
                    {currentFontFamily === f.value && (
                      <Check size={12} className="text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <RichTextControl
              icon={AArrowDown}
              label="Diminuir fonte"
              onClick={decreaseFontSize}
            />
            <select
              aria-label="Tamanho da fonte"
              value={currentFontSize}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                const sz = Number(e.target.value);
                if (sz === DEFAULT_FONT_SIZE) {
                  clearEditorFontSize(editor);
                } else {
                  applyEditorFontSize(editor, sz);
                }
              }}
              className="h-7 w-[48px] appearance-none rounded-md border border-border bg-transparent px-1 text-center text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s} className="bg-surface text-foreground">
                  {s}
                </option>
              ))}
            </select>
            <RichTextControl icon={AArrowUp} label="Aumentar fonte" onClick={increaseFontSize} />
          </div>
          {after(
            "block",
            "inline",
            "format",
            "align",
            "list",
            "callout",
            "link",
            "table",
            "media"
          ) && <Sep />}
        </>
      )}

      {has("block") && !sourceMode && (
        <>
          <RichTextControl
            icon={Pilcrow}
            label="Parágrafo"
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph")}
          />
          <RichTextControl
            icon={Heading1}
            label="Título 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
          />
          <RichTextControl
            icon={Heading2}
            label="Título 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          />
          <RichTextControl
            icon={Heading3}
            label="Título 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
          />
          <RichTextControl
            icon={FileCode2}
            label="Bloco de Código"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
          />
          {after("inline", "format", "align", "list", "callout", "link", "table", "media") && (
            <Sep />
          )}
        </>
      )}

      {has("inline") && !sourceMode && (
        <>
          <RichTextControl
            icon={Bold}
            label="Negrito (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          />
          <RichTextControl
            icon={Italic}
            label="Itálico (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          />
          <RichTextControl
            icon={UnderlineIcon}
            label="Sublinhado (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          />
          <RichTextControl
            icon={Strikethrough}
            label="Tachado"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
          />
          <RichTextControl
            icon={SubscriptIcon}
            label="Subscrito"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive("subscript")}
          />
          <RichTextControl
            icon={SuperscriptIcon}
            label="Sobrescrito"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive("superscript")}
          />
          <RichTextControl
            icon={Code}
            label="Código inline"
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          />
          <RichTextControl
            icon={RemoveFormatting}
            label="Limpar formatação"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          />
          {after("format", "align", "list", "callout", "link", "table", "media") && <Sep />}
        </>
      )}

      {has("format") && !sourceMode && (
        <>
          <div className="relative">
            <RichTextControl
              icon={Palette}
              label="Cor do texto"
              onClick={() => {
                setColorPickerOpen((p) => !p);
                setHighlightPickerOpen(false);
              }}
            />
            {colorPickerOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-border bg-surface p-2.5 shadow-xl animate-in fade-in duration-100"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="mb-2 grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      title={c.label}
                      aria-label={c.label}
                      onClick={() => {
                        editor.chain().focus().setColor(c.color).run();
                        setColorPickerOpen(false);
                      }}
                      className="h-5 w-5 rounded-full border border-border hover:scale-110 transition cursor-pointer"
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
                <label className="mb-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground cursor-pointer">
                  Personalizada
                  <input
                    type="color"
                    defaultValue="#09090b"
                    className="h-5 w-8 cursor-pointer border-0 bg-transparent p-0"
                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setColorPickerOpen(false);
                  }}
                  className="w-full rounded border border-border px-2 py-0.5 text-center text-[10px] text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  Restaurar padrão
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <RichTextControl
              icon={Highlighter}
              label="Marca-texto"
              active={editor.isActive("highlight")}
              onClick={() => {
                setHighlightPickerOpen((p) => !p);
                setColorPickerOpen(false);
              }}
            />
            {highlightPickerOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-border bg-surface p-2.5 shadow-xl animate-in fade-in duration-100"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="mb-2 grid grid-cols-4 gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      title={c.label}
                      aria-label={c.label}
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color: c.color }).run();
                        setHighlightPickerOpen(false);
                      }}
                      className="h-5 w-5 rounded-full border border-border hover:scale-110 transition cursor-pointer"
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setHighlightPickerOpen(false);
                  }}
                  className="w-full rounded border border-border px-2 py-0.5 text-center text-[10px] text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  Remover destaque
                </button>
              </div>
            )}
          </div>
          {after("align", "list", "callout", "link", "table", "media") && <Sep />}
        </>
      )}

      {has("align") && !sourceMode && (
        <>
          <RichTextControl
            icon={AlignLeft}
            label="Alinhar à esquerda"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
          />
          <RichTextControl
            icon={AlignCenter}
            label="Centralizar"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
          />
          <RichTextControl
            icon={AlignRight}
            label="Alinhar à direita"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
          />
          <RichTextControl
            icon={AlignJustify}
            label="Justificar"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
          />
          {after("list", "callout", "link", "table", "media") && <Sep />}
        </>
      )}

      {has("list") && !sourceMode && (
        <>
          <RichTextControl
            icon={List}
            label="Lista com marcadores"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          />
          <RichTextControl
            icon={ListOrdered}
            label="Lista numerada"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          />
          <RichTextControl
            icon={SquareCheck}
            label="Checklist de tarefas"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            active={editor.isActive("taskList")}
          />
          <RichTextControl
            icon={Quote}
            label="Citação"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          />
          <RichTextControl
            icon={Minus}
            label="Separador horizontal"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />
          {isDocumentVariant && (
            <RichTextControl
              icon={ScissorsLineDashed}
              label="Inserir quebra de página"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertContent([{ type: "pageBreak" }, { type: "paragraph" }])
                  .run()
              }
            />
          )}
          {after("callout", "link", "table", "media") && <Sep />}
        </>
      )}

      {has("callout") && !sourceMode && (
        <>
          <div className="relative">
            <RichTextControl
              icon={Info}
              label="Inserir caixa de destaque (Callout)"
              active={editor.isActive("callout") || calloutMenuOpen}
              onClick={() => setCalloutMenuOpen((p) => !p)}
            />
            {calloutMenuOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 w-44 rounded-xl border border-border bg-surface p-1 shadow-xl animate-in fade-in duration-100">
                {(Object.keys(CALLOUT_META) as RichTextCalloutType[]).map((t) => {
                  const m = CALLOUT_META[t];
                  const CIcon = m.icon;
                  return (
                    <button
                      key={t}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        editor
                          .chain()
                          .focus()
                          .insertContent({
                            type: "callout",
                            attrs: { type: t },
                            content: [{ type: "paragraph" }],
                          })
                          .run();
                        setCalloutMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-surface-hover cursor-pointer"
                    >
                      <CIcon size={14} className={m.iconCls} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {after("link", "table", "media") && <Sep />}
        </>
      )}

      {has("link") && !sourceMode && (
        <>
          <div className="relative">
            <RichTextControl
              icon={LinkIcon}
              label="Inserir ou editar link (Ctrl+K)"
              onClick={() => {
                setLinkUrl(editor.getAttributes("link").href ?? "");
                setLinkOpen((p) => !p);
              }}
              active={editor.isActive("link") || linkOpen}
            />
            {linkOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 flex w-64 items-center gap-1.5 rounded-xl border border-border bg-surface p-2 shadow-2xl animate-in fade-in duration-150">
                <input
                  autoFocus
                  type="url"
                  placeholder="https://exemplo.com.br"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyLink();
                    }
                    if (e.key === "Escape") setLinkOpen(false);
                  }}
                  className="flex-1 rounded border border-border bg-surface-muted px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={applyLink}
                  className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  OK
                </button>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setLinkOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          {editor.isActive("link") && (
            <RichTextControl
              icon={Link2Off}
              label="Remover link"
              onClick={() => editor.chain().focus().unsetLink().run()}
            />
          )}
          {after("table", "media") && <Sep />}
        </>
      )}

      {has("table") && !sourceMode && (
        <>
          <div className="relative">
            <RichTextControl
              icon={TableIcon}
              label="Inserir Tabela"
              onClick={() => setTablePickerOpen((p) => !p)}
              active={editor.isActive("table") || tablePickerOpen}
            />
            {tablePickerOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-surface p-2.5 shadow-2xl animate-in fade-in duration-100">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-foreground">
                  <span>Tabela</span>
                  <span className="font-mono text-muted-foreground">
                    {hoverTableDim.r} × {hoverTableDim.c}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({ length: 6 }).map((_, rIdx) =>
                    Array.from({ length: 6 }).map((__, cIdx) => {
                      const r = rIdx + 1;
                      const c = cIdx + 1;
                      const highlighted = r <= hoverTableDim.r && c <= hoverTableDim.c;
                      return (
                        <button
                          key={`${r}-${c}`}
                          type="button"
                          aria-label={`Inserir tabela ${r} por ${c}`}
                          onMouseEnter={() => setHoverTableDim({ r, c })}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            editor
                              .chain()
                              .focus()
                              .insertTable({ rows: r, cols: c, withHeaderRow: true })
                              .run();
                            setTablePickerOpen(false);
                          }}
                          className={twMerge(
                            "h-4 w-4 rounded-xs border transition-colors cursor-pointer",
                            highlighted
                              ? "border-primary bg-primary/25"
                              : "border-border bg-surface-muted/50 hover:border-border-strong"
                          )}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {editor.isActive("table") && (
            <div className="flex items-center gap-0.5 rounded-lg border border-primary/25 bg-primary/8 p-0.5">
              <RichTextControl
                icon={Rows}
                label="Adicionar linha abaixo"
                onClick={() => editor.chain().focus().addRowAfter().run()}
              />
              <RichTextControl
                icon={Columns}
                label="Adicionar coluna à direita"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              />
              <div className="mx-0.5 h-4 w-px bg-border shrink-0" />
              <button
                type="button"
                title="Excluir linha"
                aria-label="Excluir linha"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="inline-flex h-7 items-center gap-0.5 rounded-md px-1.5 text-danger hover:bg-danger/10 transition cursor-pointer"
              >
                <Rows size={11} />
                <X size={8} />
              </button>
              <button
                type="button"
                title="Excluir coluna"
                aria-label="Excluir coluna"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="inline-flex h-7 items-center gap-0.5 rounded-md px-1.5 text-danger hover:bg-danger/10 transition cursor-pointer"
              >
                <Columns size={11} />
                <X size={8} />
              </button>
              <div className="mx-0.5 h-4 w-px bg-border shrink-0" />
              <RichTextControl
                icon={Merge}
                label="Mesclar células"
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
              />
              <RichTextControl
                icon={Split}
                label="Dividir célula"
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
              />
              <RichTextControl
                icon={PanelTop}
                label="Alternar linha de cabeçalho"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              />
              <RichTextControl
                icon={Trash2}
                label="Excluir tabela"
                onClick={() => editor.chain().focus().deleteTable().run()}
              />
            </div>
          )}
          {has("media") && <Sep />}
        </>
      )}

      {has("media") && !sourceMode && (
        <div className="relative">
          <RichTextControl
            icon={uploadingImage ? Loader2 : ImageIcon}
            label="Inserir imagem"
            onClick={() => setImageModalOpen((p) => !p)}
            disabled={uploadingImage}
            className={uploadingImage ? "[&_svg]:animate-spin" : undefined}
          />
          {imageModalOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-72 space-y-2.5 rounded-xl border border-border bg-surface p-3 shadow-2xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Inserir Imagem</span>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setImageModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {!onUploadImage && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                  <Info size={12} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-200">
                    Sem <code>onUploadImage</code>, arquivos locais são embutidos em base64.
                  </p>
                </div>
              )}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Upload do dispositivo:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="w-full cursor-pointer text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
              </div>
              <div className="border-t border-border pt-2">
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Ou via URL externa:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="https://.../imagem.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyImageUrl();
                      }
                    }}
                    className="flex-1 rounded border border-border bg-surface-muted px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyImageUrl}
                    className="rounded bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Variables & Snippets */}
      {(hasVariables || hasSnippets) && !sourceMode && (
        <>
          <Sep />
          {hasVariables && (
            <div className="relative">
              <RichTextControl
                icon={Braces}
                label="Inserir variável dinâmica ({{...}})"
                active={varMenuOpen}
                onClick={() => {
                  setVarMenuOpen((p) => !p);
                  setSnippetMenuOpen(false);
                }}
              >
                <span className="hidden sm:inline text-[11px]">Variáveis</span>
                <ChevronDown size={10} />
              </RichTextControl>
              {varMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-50 max-h-64 w-64 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-2xl animate-in fade-in duration-100">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Campos Dinâmicos (digite {"{{"})
                  </p>
                  {variables!.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        editor
                          .chain()
                          .focus()
                          .insertContent([
                            { type: "mergeTag", attrs: { key: v.key, label: v.label } },
                            { type: "text", text: " " },
                          ])
                          .run();
                        setVarMenuOpen(false);
                      }}
                      className="flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-surface-hover cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-foreground">{v.label}</span>
                        <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {`{{${v.key}}}`}
                        </code>
                      </div>
                      {v.example && (
                        <span className="text-[10px] text-muted-foreground">
                          Ex.: {v.example}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {hasSnippets && (
            <div className="relative">
              <RichTextControl
                icon={FilePlus2}
                label="Inserir modelo ou cláusula pronta"
                active={snippetMenuOpen}
                onClick={() => {
                  setSnippetMenuOpen((p) => !p);
                  setVarMenuOpen(false);
                }}
              >
                <span className="hidden sm:inline text-[11px]">Modelos</span>
                <ChevronDown size={10} />
              </RichTextControl>
              {snippetMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-50 max-h-64 w-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-2xl animate-in fade-in duration-100">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Cláusulas & Modelos Prontos
                  </p>
                  {snippets!.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        editor.chain().focus().insertContent(s.html).run();
                        setSnippetMenuOpen(false);
                      }}
                      className="flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-surface-hover cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-foreground">{s.title}</span>
                      {s.description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-2">
                          {s.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Search, Copy, Print & Source Tools */}
      {(searchable || showTools) && (
        <>
          <Sep />
          {searchable && !sourceMode && (
            <RichTextControl
              icon={Search}
              label="Buscar e substituir (Ctrl+F)"
              active={searchOpen}
              onClick={onToggleSearch}
            />
          )}
          {showTools && (
            <>
              <RichTextControl
                icon={copiedHtml ? Check : Copy}
                label={copiedHtml ? "Texto copiado!" : "Copiar texto"}
                onClick={() => {
                  navigator.clipboard?.writeText(editor.getText());
                  setCopiedHtml(true);
                  setTimeout(() => setCopiedHtml(false), 1600);
                }}
              />
              {isDocumentVariant && (
                <RichTextControl
                  icon={Printer}
                  label="Imprimir documento"
                  onClick={onPrint}
                />
              )}
              {allowSourceView && (
                <RichTextControl
                  icon={Code2}
                  label={sourceMode ? "Voltar ao editor visual" : "Editar código HTML"}
                  active={sourceMode}
                  onClick={onToggleSourceMode}
                >
                  <span className="text-[10px] font-mono">HTML</span>
                </RichTextControl>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════ Main RichTextEditor Component ═══════════

function RichTextEditorBase({
  value,
  defaultValue,
  onChange,
  placeholder = "Escreva aqui ou digite '/' para comandos...",
  minHeight = "10rem",
  maxHeight = "32rem",
  disabled = false,
  readOnly = false,
  error = false,
  size = "md",
  showCount = false,
  maxLength,
  toolbar,
  toolbarPreset = "standard",
  stickyToolbar = false,
  bubbleMenu = true,
  slashCommands = true,
  searchable = true,
  allowSourceView = false,
  variables,
  snippets,
  onUploadImage,
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  showAttachments = false,
  onRegisterInsertHandler,
  documentTitle,
  variant = "default",
  className,
  editorClassName,
  componentId,
  hideIfDenied = false,
  children,
  ref,
}: RichTextEditorProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const [fullscreen, setFullscreen] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [rawHtml, setRawHtml] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [docZoom, setDocZoom] = useState<number>(100);

  // Search & Replace state
  const [searchOpen, setSearchOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  // Floating Bubble Menu state
  const [bubbleCoords, setBubbleCoords] = useState<{ top: number; left: number } | null>(null);

  // Slash (`/`) & Merge-Tag (`{{`) Floating Palette state
  const [paletteState, setPaletteState] = useState<{
    mode: "slash" | "variable";
    query: string;
    range: { from: number; to: number };
    coords: { top: number; left: number };
    selectedIndex: number;
  } | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const isMinimal = variant === "minimal" || variant === "notion";
  const isDocument = variant === "document";
  const isBorderless = variant === "borderless";
  const isFilled = variant === "filled";

  const resolvedGroups = useMemo<ToolbarGroup[]>(() => {
    if (toolbar) return toolbar;
    if (isDocument) return PRESET_GROUPS.document;
    return PRESET_GROUPS[toolbarPreset] ?? PRESET_GROUPS.standard;
  }, [toolbar, toolbarPreset, isDocument]);

  const slashItems = useMemo(
    () => buildSlashItems(true, variables, snippets),
    [variables, snippets]
  );

  const filteredSlashItems = useMemo(() => {
    if (!paletteState || paletteState.mode !== "slash") return [];
    const q = paletteState.query.trim().toLowerCase();
    if (!q) return slashItems;
    return slashItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
  }, [paletteState, slashItems]);

  const filteredVariables = useMemo(() => {
    if (!paletteState || paletteState.mode !== "variable" || !variables) return [];
    const q = paletteState.query.trim().toLowerCase();
    if (!q) return variables;
    return variables.filter(
      (v) => v.key.toLowerCase().includes(q) || v.label.toLowerCase().includes(q)
    );
  }, [paletteState, variables]);

  // Ref bridge so ProseMirror handleKeyDown always sees latest palette state
  const paletteHandlerRef = useRef<(event: KeyboardEvent) => boolean>(() => false);

  const uploadOrReadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (onUploadImage) {
        setUploadingImage(true);
        try {
          const url = await onUploadImage(file);
          return url || null;
        } finally {
          setUploadingImage(false);
        }
      }
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    },
    [onUploadImage]
  );

  const editor = useEditor({
    editorProps: {
      handleKeyDown(_view, event) {
        if (paletteHandlerRef.current(event)) {
          return true;
        }
        if (
          searchable &&
          (event.ctrlKey || event.metaKey) &&
          !event.shiftKey &&
          event.key.toLowerCase() === "f"
        ) {
          event.preventDefault();
          setSearchOpen(true);
          return true;
        }
        if (
          searchable &&
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "h"
        ) {
          event.preventDefault();
          setSearchOpen(true);
          setReplaceOpen(true);
          return true;
        }
        return false;
      },
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (!files.length) return false;
        event.preventDefault();
        files.forEach((file) => {
          void uploadOrReadImage(file).then((src) => {
            if (!src) return;
            const node = view.state.schema.nodes.image?.create({ src });
            if (node) view.dispatch(view.state.tr.replaceSelectionWith(node));
          });
        });
        return true;
      },
      handleDrop(view, event) {
        const files = Array.from((event as DragEvent).dataTransfer?.files ?? []).filter(
          (f) => f.type.startsWith("image/")
        );
        if (!files.length) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        files.forEach((file) => {
          void uploadOrReadImage(file).then((src) => {
            if (!src) return;
            const node = view.state.schema.nodes.image?.create({ src });
            if (!node) return;
            const tr =
              coords?.pos !== undefined
                ? view.state.tr.insert(coords.pos, node)
                : view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
          });
        });
        return true;
      },
    },
    extensions: [
      StarterKit.configure({
        underline: false,
        link: false,
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      FontSizeExtension,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-primary underline font-medium cursor-pointer",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ResizableImage.configure({ allowBase64: true }),
      CalloutExtension,
      PageBreakExtension,
      MergeTagExtension,
      Subscript,
      Superscript,
      Typography,
      TaskList,
      TaskItem.configure({ nested: true, HTMLAttributes: { class: "task-item" } }),
      CharacterCount.configure({ limit: maxLength }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? defaultValue ?? "",
    editable: !effectiveDisabled && !readOnly,
    onUpdate({ editor: ed }) {
      onChange?.(ed.getHTML());
    },
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
  });

  // Upload trigger for toolbar file input
  const handleToolbarImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      const src = await uploadOrReadImage(file);
      if (src) {
        editor.chain().focus().setImage({ src }).run();
      }
    },
    [editor, uploadOrReadImage]
  );

  // Sync controlled value
  useEffect(() => {
    if (!editor || value === undefined) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!effectiveDisabled && !readOnly);
  }, [editor, effectiveDisabled, readOnly]);

  // Imperative Ref & Insert Handler registration
  const insertContentFn = useCallback(
    (content: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(content).run();
    },
    [editor]
  );

  useEffect(() => {
    if (!editor || !onRegisterInsertHandler) return;
    onRegisterInsertHandler(insertContentFn);
  }, [editor, onRegisterInsertHandler, insertContentFn]);

  useImperativeHandle(
    ref,
    () => ({
      editor,
      insertContent: insertContentFn,
      insertVariable: (variable: RichTextVariable | string) => {
        if (!editor) return;
        const key = typeof variable === "string" ? variable : variable.key;
        const label = typeof variable === "string" ? undefined : variable.label;
        editor
          .chain()
          .focus()
          .insertContent([
            { type: "mergeTag", attrs: { key, label: label ?? null } },
            { type: "text", text: " " },
          ])
          .run();
      },
      insertPageBreak: () => {
        editor
          ?.chain()
          .focus()
          .insertContent([{ type: "pageBreak" }, { type: "paragraph" }])
          .run();
      },
      focus: () => {
        editor?.commands.focus();
      },
      clear: () => {
        editor?.commands.clearContent(true);
      },
      getHTML: () => editor?.getHTML() ?? "",
      getText: () => editor?.getText() ?? "",
    }),
    [editor, insertContentFn]
  );

  // Update Bubble Menu & Slash / Variable Palette coordinates on transactions
  useEffect(() => {
    if (!editor) return;

    const updateFloatingMenus = () => {
      if (!editor.isEditable || sourceMode || !wrapperRef.current) {
        setBubbleCoords(null);
        setPaletteState(null);
        return;
      }

      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const { state, view } = editor;
      const { selection } = state;
      const { from, to, empty } = selection;

      // 1) Bubble Selection Menu
      if (
        bubbleMenu &&
        !empty &&
        to - from > 0 &&
        !editor.isActive("codeBlock") &&
        !editor.isActive("image")
      ) {
        try {
          const start = view.coordsAtPos(from);
          const end = view.coordsAtPos(to);
          const centerX = (start.left + end.right) / 2 - wrapperRect.left;
          const topY = Math.min(start.top, end.top) - wrapperRect.top - 44;
          const clampedLeft = Math.max(
            12,
            Math.min(centerX - 135, Math.max(12, wrapperRect.width - 285))
          );
          setBubbleCoords({
            top: topY < 8 ? Math.max(start.bottom, end.bottom) - wrapperRect.top + 8 : topY,
            left: clampedLeft,
          });
        } catch {
          setBubbleCoords(null);
        }
      } else {
        setBubbleCoords(null);
      }

      // 2) Slash Command (`/`) & Variable (`{{`) Autocomplete
      if (!empty) {
        setPaletteState(null);
        return;
      }

      const $from = selection.$from;
      if (!$from.parent.isTextblock || editor.isActive("codeBlock")) {
        setPaletteState(null);
        return;
      }

      const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\0", "\0");

      // Variable `{{` trigger
      if (variables && variables.length > 0) {
        const varMatch = /\{\{([a-zA-Z0-9_.-]*)$/.exec(textBefore);
        if (varMatch) {
          try {
            const caret = view.coordsAtPos(from);
            const rangeFrom = from - varMatch[0].length;
            setPaletteState((prev) => ({
              mode: "variable",
              query: varMatch[1],
              range: { from: rangeFrom, to: from },
              coords: {
                top: caret.bottom - wrapperRect.top + 6,
                left: Math.max(
                  12,
                  Math.min(caret.left - wrapperRect.left, wrapperRect.width - 260)
                ),
              },
              selectedIndex: prev?.mode === "variable" && prev.query === varMatch[1] ? prev.selectedIndex : 0,
            }));
            return;
          } catch {
            // ignore
          }
        }
      }

      // Slash `/` trigger (start of block or preceded by space)
      if (slashCommands) {
        const slashMatch = /(?:^|\s)\/([a-zA-Z0-9À-ÿ_-]*)$/.exec(textBefore);
        if (slashMatch) {
          try {
            const caret = view.coordsAtPos(from);
            const slashTokenLen = slashMatch[1].length + 1; // `/` + query
            const rangeFrom = from - slashTokenLen;
            setPaletteState((prev) => ({
              mode: "slash",
              query: slashMatch[1],
              range: { from: rangeFrom, to: from },
              coords: {
                top: caret.bottom - wrapperRect.top + 6,
                left: Math.max(
                  12,
                  Math.min(caret.left - wrapperRect.left, wrapperRect.width - 275)
                ),
              },
              selectedIndex: prev?.mode === "slash" && prev.query === slashMatch[1] ? prev.selectedIndex : 0,
            }));
            return;
          } catch {
            // ignore
          }
        }
      }

      setPaletteState(null);
    };

    editor.on("selectionUpdate", updateFloatingMenus);
    editor.on("transaction", updateFloatingMenus);
    editor.on("blur", () => {
      // Delay slightly so mousedown on floating menu buttons fires first
      setTimeout(() => {
        if (!editor.isFocused) {
          setBubbleCoords(null);
          setPaletteState(null);
        }
      }, 150);
    });

    return () => {
      editor.off("selectionUpdate", updateFloatingMenus);
      editor.off("transaction", updateFloatingMenus);
    };
  }, [editor, bubbleMenu, slashCommands, variables, sourceMode]);

  // Apply selected Slash Item or Variable
  const executePaletteSelection = useCallback(
    (index: number) => {
      if (!editor || !paletteState) return;
      if (paletteState.mode === "slash") {
        const item = filteredSlashItems[index];
        if (!item) return;
        editor.chain().focus().deleteRange(paletteState.range).run();
        item.action(editor);
        setPaletteState(null);
      } else {
        const v = filteredVariables[index];
        if (!v) return;
        editor
          .chain()
          .focus()
          .deleteRange(paletteState.range)
          .insertContent([
            { type: "mergeTag", attrs: { key: v.key, label: v.label } },
            { type: "text", text: " " },
          ])
          .run();
        setPaletteState(null);
      }
    },
    [editor, paletteState, filteredSlashItems, filteredVariables]
  );

  // Sync keyboard navigation ref for Slash / Variable palette
  useEffect(() => {
    paletteHandlerRef.current = (event: KeyboardEvent) => {
      if (!paletteState) return false;
      const listLen =
        paletteState.mode === "slash"
          ? filteredSlashItems.length
          : filteredVariables.length;
      if (event.key === "Escape") {
        event.preventDefault();
        setPaletteState(null);
        return true;
      }
      if (listLen === 0) return false;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setPaletteState((prev) =>
          prev ? { ...prev, selectedIndex: (prev.selectedIndex + 1) % listLen } : null
        );
        return true;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setPaletteState((prev) =>
          prev
            ? { ...prev, selectedIndex: (prev.selectedIndex - 1 + listLen) % listLen }
            : null
        );
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        executePaletteSelection(paletteState.selectedIndex);
        return true;
      }
      return false;
    };
  }, [paletteState, filteredSlashItems.length, filteredVariables.length, executePaletteSelection]);

  // Escape exits fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !paletteState) setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fullscreen, paletteState]);

  // Search Matches inside ProseMirror Doc
  const searchMatches = useMemo(() => {
    if (!editor || !searchOpen || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: { from: number; to: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return;
      const lower = node.text.toLowerCase();
      let idx = lower.indexOf(q);
      while (idx !== -1) {
        matches.push({ from: pos + idx, to: pos + idx + q.length });
        idx = lower.indexOf(q, idx + Math.max(1, q.length));
      }
    });
    return matches;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, searchOpen, searchQuery, editor?.state.doc]);

  const jumpToSearchMatch = useCallback(
    (index: number) => {
      if (!editor || searchMatches.length === 0) return;
      const safe = ((index % searchMatches.length) + searchMatches.length) % searchMatches.length;
      setActiveMatchIdx(safe);
      const target = searchMatches[safe];
      editor.chain().focus().setTextSelection(target).scrollIntoView().run();
    },
    [editor, searchMatches]
  );

  const handleReplaceCurrent = useCallback(() => {
    if (!editor || searchMatches.length === 0) return;
    const safe = Math.min(activeMatchIdx, searchMatches.length - 1);
    const target = searchMatches[safe];
    editor
      .chain()
      .focus()
      .insertContentAt({ from: target.from, to: target.to }, replaceText)
      .run();
  }, [editor, searchMatches, activeMatchIdx, replaceText]);

  const handleReplaceAll = useCallback(() => {
    if (!editor || searchMatches.length === 0) return;
    const { tr } = editor.state;
    // Replace from end to start so positions stay valid
    for (let i = searchMatches.length - 1; i >= 0; i--) {
      const m = searchMatches[i];
      if (replaceText) {
        tr.insertText(replaceText, m.from, m.to);
      } else {
        tr.delete(m.from, m.to);
      }
    }
    editor.view.dispatch(tr);
  }, [editor, searchMatches, replaceText]);

  // Toggle HTML Source Mode
  const handleToggleSourceMode = useCallback(() => {
    if (!editor) return;
    if (!sourceMode) {
      setRawHtml(editor.getHTML());
      setSourceMode(true);
    } else {
      editor.commands.setContent(rawHtml);
      onChange?.(rawHtml);
      setSourceMode(false);
    }
  }, [editor, sourceMode, rawHtml, onChange]);

  // Print Document helper
  const handlePrint = useCallback(() => {
    if (!editor || typeof window === "undefined") return;
    const printWin = window.open("", "_blank", "width=860,height=960");
    if (!printWin) return;
    const title = documentTitle || "Documento";
    printWin.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Inter, system-ui, -apple-system, sans-serif; color: #18181b; line-height: 1.6; font-size: 11pt; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #d4d4d8; padding: 6px 10px; text-align: left; }
    th { background: #f4f4f5; }
    blockquote { border-left: 3px solid #a1a1aa; margin: 10px 0; padding-left: 12px; color: #52525b; }
    div[data-callout] { border: 1px solid #e4e4e7; border-left: 4px solid #18181b; border-radius: 6px; padding: 10px 12px; margin: 10px 0; }
    div[data-page-break] { page-break-after: always; break-after: page; height: 0; visibility: hidden; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>${editor.getHTML()}</body>
</html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 150);
  }, [editor, documentTitle]);

  if (!hasPermission && hideIfDenied) return null;

  const charCount = editor?.storage.characterCount.characters() ?? 0;
  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const atLimit = maxLength !== undefined && charCount >= maxLength;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const paddingBySize =
    size === "sm" ? "px-3 py-2 text-xs" : size === "lg" ? "px-6 py-5 text-base" : "px-4 py-3 text-sm";

  const containerCls = twMerge(
    "relative flex flex-col overflow-hidden text-sm transition-colors duration-150",
    !isBorderless &&
      !isMinimal &&
      "rounded-xl border bg-surface text-foreground shadow-xs",
    !isBorderless &&
      !isMinimal &&
      (error
        ? "border-danger focus-within:ring-2 focus-within:ring-danger/20"
        : "border-border focus-within:border-border-strong"),
    isFilled && "bg-surface-muted/60 focus-within:bg-surface",
    (isBorderless || isMinimal) && "bg-transparent border-0 shadow-none",
    (effectiveDisabled || readOnly) && "opacity-70",
    className,
    fullscreen && "fixed inset-0 z-[100] !rounded-none !max-h-none bg-surface"
  );

  if (!editor) {
    return (
      <div
        data-component-id={componentId}
        className={containerCls}
        style={{ minHeight }}
      />
    );
  }

  const ctxValue: RichTextContextValue = {
    editor,
    disabled: effectiveDisabled,
    readOnly,
  };

  // Custom compound mode (`<RichTextEditor><RichTextEditor.Toolbar>...</RichTextEditor>`)
  if (children) {
    return (
      <RichTextEditorContext.Provider value={ctxValue}>
        <div ref={wrapperRef} data-component-id={componentId} className={containerCls}>
          {children}
        </div>
      </RichTextEditorContext.Provider>
    );
  }

  return (
    <RichTextEditorContext.Provider value={ctxValue}>
      <div ref={wrapperRef} data-component-id={componentId} className={containerCls}>
        {/* Top Toolbar (hidden in minimal/notion mode unless fullscreen) */}
        {!readOnly && (!isMinimal || fullscreen) && (
          <div
            className={twMerge(
              "relative border-b border-border bg-surface-muted/50",
              stickyToolbar && "sticky top-0 z-30 backdrop-blur-md bg-surface/90"
            )}
          >
            <div className="pr-9">
              <Toolbar
                editor={editor}
                groups={resolvedGroups}
                variables={variables}
                snippets={snippets}
                onUploadImage={onUploadImage}
                uploadingImage={uploadingImage}
                onUploadFileTrigger={handleToolbarImageUpload}
                allowSourceView={allowSourceView}
                sourceMode={sourceMode}
                onToggleSourceMode={handleToggleSourceMode}
                searchable={searchable}
                searchOpen={searchOpen}
                onToggleSearch={() => setSearchOpen((p) => !p)}
                isDocumentVariant={isDocument}
                onPrint={handlePrint}
              />
            </div>
            <button
              type="button"
              title={fullscreen ? "Sair da tela cheia (Esc)" : "Tela cheia"}
              aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFullscreen((p) => !p)}
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer"
            >
              {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        )}

        {/* Document A4 Header Bar (Zoom + Title) */}
        {isDocument && !sourceMode && (
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={13} className="text-primary shrink-0" />
              <span className="truncate font-medium text-foreground">
                {documentTitle || "Documento A4"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                aria-label="Reduzir zoom"
                onClick={() => setDocZoom((z) => Math.max(75, z - 10))}
                className="rounded p-1 hover:bg-surface-hover hover:text-foreground cursor-pointer"
              >
                <ZoomOut size={13} />
              </button>
              <span className="w-10 text-center font-mono text-[11px]">{docZoom}%</span>
              <button
                type="button"
                aria-label="Aumentar zoom"
                onClick={() => setDocZoom((z) => Math.min(130, z + 10))}
                className="rounded p-1 hover:bg-surface-hover hover:text-foreground cursor-pointer"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Search & Replace Bar */}
        {searchOpen && !sourceMode && (
          <div className="flex flex-col gap-1.5 border-b border-border bg-surface-muted/70 px-3 py-2 animate-in fade-in duration-100">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search
                  size={12}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveMatchIdx(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      jumpToSearchMatch(e.shiftKey ? activeMatchIdx - 1 : activeMatchIdx + 1);
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setSearchOpen(false);
                      editor.commands.focus();
                    }
                  }}
                  placeholder="Buscar no documento..."
                  className="h-7 w-full rounded-lg border border-border bg-surface pl-7 pr-14 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <span className=" absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
                  {searchMatches.length > 0
                    ? `${Math.min(activeMatchIdx + 1, searchMatches.length)}/${searchMatches.length}`
                    : "0/0"}
                </span>
              </div>
              <button
                type="button"
                title="Anterior"
                disabled={searchMatches.length === 0}
                onClick={() => jumpToSearchMatch(activeMatchIdx - 1)}
                className="rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:opacity-30 cursor-pointer"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                title="Próximo"
                disabled={searchMatches.length === 0}
                onClick={() => jumpToSearchMatch(activeMatchIdx + 1)}
                className="rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:opacity-30 cursor-pointer"
              >
                <ChevronDown size={14} />
              </button>
              {!readOnly && (
                <button
                  type="button"
                  title="Substituir (Ctrl+H)"
                  onClick={() => setReplaceOpen((p) => !p)}
                  className={twMerge(
                    "rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer",
                    replaceOpen && "bg-primary/10 text-primary"
                  )}
                >
                  <Replace size={13} />
                </button>
              )}
              <button
                type="button"
                aria-label="Fechar busca"
                onClick={() => setSearchOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>

            {replaceOpen && !readOnly && (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Substituir por..."
                  className="h-7 flex-1 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  disabled={searchMatches.length === 0}
                  onClick={handleReplaceCurrent}
                  className="h-7 rounded-lg border border-border bg-surface px-2.5 text-[11px] font-medium text-foreground hover:bg-surface-hover disabled:opacity-40 cursor-pointer"
                >
                  Substituir
                </button>
                <button
                  type="button"
                  disabled={searchMatches.length === 0}
                  onClick={handleReplaceAll}
                  className="h-7 rounded-lg bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
                >
                  Tudo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Selection Bubble Menu */}
        {bubbleCoords && !readOnly && !effectiveDisabled && !sourceMode && (
          <div
            style={{ top: `${bubbleCoords.top}px`, left: `${bubbleCoords.left}px` }}
            onMouseDown={(e) => e.preventDefault()}
            className=" absolute z-40 flex items-center gap-0.5 rounded-xl border border-border bg-surface/95 backdrop-blur-md p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100"
          >
            <RichTextControl
              icon={Bold}
              label="Negrito"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <RichTextControl
              icon={Italic}
              label="Itálico"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <RichTextControl
              icon={UnderlineIcon}
              label="Sublinhado"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <RichTextControl
              icon={Strikethrough}
              label="Tachado"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <RichTextControl
              icon={Code}
              label="Código"
              active={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
            />
            <RichTextControl
              icon={Highlighter}
              label="Destacar"
              active={editor.isActive("highlight")}
              onClick={() =>
                editor.isActive("highlight")
                  ? editor.chain().focus().unsetHighlight().run()
                  : editor.chain().focus().setHighlight({ color: "#fef08a" }).run()
              }
            />
            <Sep />
            <RichTextControl
              icon={Heading1}
              label="Título 1"
              active={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            />
            <RichTextControl
              icon={Heading2}
              label="Título 2"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <RichTextControl
              icon={RemoveFormatting}
              label="Limpar formatação"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            />
          </div>
        )}

        {/* Floating Slash Command (`/`) or Variable (`{{`) Palette */}
        {paletteState && !readOnly && !effectiveDisabled && !sourceMode && (
          <div
            style={{
              top: `${paletteState.coords.top}px`,
              left: `${paletteState.coords.left}px`,
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-50 max-h-64 w-68 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          >
            {paletteState.mode === "slash" ? (
              filteredSlashItems.length === 0 ? (
                <p className="px-2.5 py-2 text-xs text-muted-foreground">
                  Nenhum comando para &ldquo;/{paletteState.query}&rdquo;
                </p>
              ) : (
                <>
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Comandos Rápidos
                  </p>
                  {filteredSlashItems.map((item, idx) => {
                    const SIcon = item.icon;
                    const selected = idx === paletteState.selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() =>
                          setPaletteState((prev) =>
                            prev ? { ...prev, selectedIndex: idx } : null
                          )
                        }
                        onClick={() => executePaletteSelection(idx)}
                        className={twMerge(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors cursor-pointer",
                          selected ? "bg-primary/10 text-foreground" : "hover:bg-surface-hover"
                        )}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-foreground">
                          <SIcon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </>
              )
            ) : filteredVariables.length === 0 ? (
              <p className="px-2.5 py-2 text-xs text-muted-foreground">
                Nenhuma variável para &ldquo;{paletteState.query}&rdquo;
              </p>
            ) : (
              <>
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Inserir Variável Dinâmica
                </p>
                {filteredVariables.map((v, idx) => {
                  const selected = idx === paletteState.selectedIndex;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onMouseEnter={() =>
                        setPaletteState((prev) =>
                          prev ? { ...prev, selectedIndex: idx } : null
                        )
                      }
                      onClick={() => executePaletteSelection(idx)}
                      className={twMerge(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors cursor-pointer",
                        selected ? "bg-primary/10 text-foreground" : "hover:bg-surface-hover"
                      )}
                    >
                      <span className="truncate text-xs font-medium text-foreground">
                        {v.label}
                      </span>
                      <code className="shrink-0 rounded bg-surface-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {`{{${v.key}}}`}
                      </code>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Main Editor Area: Source HTML vs A4 Document vs Standard WYSIWYG */}
        {sourceMode ? (
          <textarea
            value={rawHtml}
            onChange={(e) => {
              setRawHtml(e.target.value);
              onChange?.(e.target.value);
            }}
            spellCheck={false}
            className="flex-1 w-full resize-none bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none"
            style={fullscreen ? { minHeight: "16rem" } : { minHeight, maxHeight }}
          />
        ) : isDocument ? (
          <div
            className="flex-1 overflow-auto bg-zinc-100/90 dark:bg-zinc-950/80 p-3 sm:p-6"
            style={fullscreen ? { minHeight: 0 } : { minHeight, maxHeight }}
          >
            <div
              className="mx-auto w-full max-w-[794px] rounded-sm border border-border bg-surface shadow-md transition-transform origin-top"
              style={{
                minHeight: "24rem",
                zoom: `${docZoom}%`,
              }}
            >
              <EditorContent
                editor={editor}
                className={twMerge(
                  "rte-content px-6 py-7 sm:px-12 sm:py-10 focus:outline-none text-foreground prose prose-sm max-w-none dark:prose-invert",
                  editorClassName
                )}
              />
            </div>
          </div>
        ) : (
          <EditorContent
            editor={editor}
            className={twMerge(
              "rte-content flex-1 focus:outline-none text-foreground prose prose-sm max-w-none dark:prose-invert overflow-auto",
              paddingBySize,
              editorClassName
            )}
            style={fullscreen ? { minHeight: 0 } : { minHeight, maxHeight }}
          />
        )}

        {/* Optional Attachments Footer Bar */}
        {(showAttachments || attachments.length > 0 || Boolean(onAddAttachment)) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-muted/30 px-3 py-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex max-w-[240px] items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs"
              >
                <Paperclip size={12} className="shrink-0 text-muted-foreground" />
                {att.url ? (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-medium text-foreground hover:underline"
                  >
                    {att.fileName}
                  </a>
                ) : (
                  <span className="truncate font-medium text-foreground">{att.fileName}</span>
                )}
                {att.fileSize ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    ({formatFileSizeShort(att.fileSize)})
                  </span>
                ) : null}
                {onRemoveAttachment && !readOnly && !effectiveDisabled && (
                  <button
                    type="button"
                    aria-label={`Remover anexo ${att.fileName}`}
                    onClick={() => void onRemoveAttachment(att.id)}
                    className="ml-0.5 shrink-0 rounded p-0.5 text-muted-foreground hover:bg-danger/10 hover:text-danger cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}

            {onAddAttachment && !readOnly && !effectiveDisabled && (
              <>
                <input
                  ref={attachInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onAddAttachment(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => attachInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border-strong px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer"
                >
                  <Paperclip size={12} />
                  <span>Anexar arquivo</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Word / Character Count Status Bar */}
        {(showCount || fullscreen || uploadingImage) && (
          <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              {uploadingImage && (
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <Loader2 size={11} className="animate-spin" />
                  Enviando imagem...
                </span>
              )}
              {slashCommands && !readOnly && !uploadingImage && (
                <span className="hidden sm:inline text-[10.5px] opacity-75">
                  Dica: digite <kbd className="rounded border border-border px-1 font-mono">/</kbd>{" "}
                  para blocos
                  {variables?.length ? (
                    <>
                      {" "}
                      ou <kbd className="rounded border border-border px-1 font-mono">{"{{"}</kbd>{" "}
                      para variáveis
                    </>
                  ) : null}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span>~{readMinutes} min de leitura</span>
              <span>
                {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
              </span>
              <span className={twMerge(atLimit && "font-semibold text-danger")}>
                {charCount}
                {maxLength !== undefined ? ` / ${maxLength}` : ""} caracteres
              </span>
            </div>
          </div>
        )}
      </div>
    </RichTextEditorContext.Provider>
  );
}

// Attach @mantine/tiptap-style compound subcomponents
export const RichTextEditor = Object.assign(RichTextEditorBase, {
  Toolbar: RichTextToolbarContainer,
  ControlsGroup: RichTextControlsGroup,
  Control: RichTextControl,
  Content: RichTextContentArea,
});

export default RichTextEditor;
