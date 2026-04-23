"use client";

import React, { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { twMerge } from "tailwind-merge";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Link2Off,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  type LucideIcon,
} from "lucide-react";

// ── Types

export type RichTextEditorProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  readOnly?: boolean;
  showCount?: boolean;
  maxLength?: number;
  toolbar?: ToolbarGroup[];
  variant?: "default" | "borderless";
  className?: string;
  editorClassName?: string;
  componentId?: string;
};

export type ToolbarGroup =
  | "history"
  | "block"
  | "inline"
  | "align"
  | "list"
  | "link"
  | "table"
  | "media";

const ALL_GROUPS: ToolbarGroup[] = [
  "history",
  "block",
  "inline",
  "align",
  "list",
  "link",
  "table",
  "media",
];

// ── Toolbar button

function ToolBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      className={twMerge(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        "text-zinc-700 dark:text-zinc-200",
        "hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none",
        active && "bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900",
      )}
    >
      <Icon size={14} strokeWidth={1.8} />
    </button>
  );
}

function Sep() {
  return <div className="mx-0.5 h-5 w-px bg-zinc-200 shrink-0" />;
}

function LinkDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const current = editor.getAttributes("link").href ?? "";
  const [url, setUrl] = useState(current);
  const inputRef = useRef<HTMLInputElement>(null);

  const apply = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: trimmed,
          target: "_blank",
          rel: "noopener noreferrer",
        })
        .run();
    }
    onClose();
  }, [editor, url, onClose]);

  return (
    <div
      className="absolute z-50 mt-1 flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white shadow-lg px-2 py-1.5"
      onMouseDown={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        autoFocus
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
          if (e.key === "Escape") onClose();
        }}
        placeholder="https://"
        className="w-56 rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-800 outline-none focus:border-blue-400"
      />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          apply();
        }}
        className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
      >
        OK
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}

function Toolbar({
  editor,
  groups,
}: {
  editor: Editor;
  groups: ToolbarGroup[];
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const has = (g: ToolbarGroup) => groups.includes(g);

  const insertTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt("URL da imagem:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  return (
    <div className="relative flex flex-wrap items-center gap-0.5 border border-zinc-200 bg-white px-2 py-1 rounded-md shadow-sm">
      {has("history") && (
        <>
          <ToolBtn
            icon={Undo}
            label="Desfazer (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <ToolBtn
            icon={Redo}
            label="Refazer (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
          {(has("block") ||
            has("inline") ||
            has("align") ||
            has("list") ||
            has("link") ||
            has("table") ||
            has("media")) && <Sep />}
        </>
      )}

      {has("block") && (
        <>
          <ToolBtn
            icon={Pilcrow}
            label="Parágrafo"
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph")}
          />
          <ToolBtn
            icon={Heading1}
            label="Título 1"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
          />
          <ToolBtn
            icon={Heading2}
            label="Título 2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          />
          <ToolBtn
            icon={Heading3}
            label="Título 3"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
          />
          {(has("inline") ||
            has("align") ||
            has("list") ||
            has("link") ||
            has("table") ||
            has("media")) && <Sep />}
        </>
      )}

      {has("inline") && (
        <>
          <ToolBtn
            icon={Bold}
            label="Negrito (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          />
          <ToolBtn
            icon={Italic}
            label="Itálico (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          />
          <ToolBtn
            icon={UnderlineIcon}
            label="Sublinhado (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          />
          <ToolBtn
            icon={Strikethrough}
            label="Tachado"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
          />
          <ToolBtn
            icon={Code}
            label="Código inline"
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          />
          <ToolBtn
            icon={Code2}
            label="Bloco de código"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
          />
          {(has("align") ||
            has("list") ||
            has("link") ||
            has("table") ||
            has("media")) && <Sep />}
        </>
      )}

      {has("align") && (
        <>
          <ToolBtn
            icon={AlignLeft}
            label="Alinhar à esquerda"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
          />
          <ToolBtn
            icon={AlignCenter}
            label="Centralizar"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
          />
          <ToolBtn
            icon={AlignRight}
            label="Alinhar à direita"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
          />
          <ToolBtn
            icon={AlignJustify}
            label="Justificar"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
          />
          {(has("list") || has("link") || has("table") || has("media")) && (
            <Sep />
          )}
        </>
      )}

      {has("list") && (
        <>
          <ToolBtn
            icon={List}
            label="Lista"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          />
          <ToolBtn
            icon={ListOrdered}
            label="Lista numerada"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          />
          <ToolBtn
            icon={Quote}
            label="Citação"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          />
          <ToolBtn
            icon={Minus}
            label="Separador"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />
          {(has("link") || has("table") || has("media")) && <Sep />}
        </>
      )}

      {has("link") && (
        <>
          <div className="relative">
            <ToolBtn
              icon={LinkIcon}
              label="Inserir link (Ctrl+K)"
              onClick={() => setLinkOpen((s) => !s)}
              active={editor.isActive("link") || linkOpen}
            />
            {linkOpen && (
              <LinkDialog editor={editor} onClose={() => setLinkOpen(false)} />
            )}
          </div>
          {editor.isActive("link") && (
            <ToolBtn
              icon={Link2Off}
              label="Remover link"
              onClick={() => editor.chain().focus().unsetLink().run()}
            />
          )}
          {(has("table") || has("media")) && <Sep />}
        </>
      )}

      {has("table") && (
        <>
          <ToolBtn
            icon={TableIcon}
            label="Inserir tabela"
            onClick={insertTable}
          />
          {has("media") && <Sep />}
        </>
      )}

      {has("media") && (
        <ToolBtn
          icon={ImageIcon}
          label="Inserir imagem"
          onClick={insertImage}
        />
      )}
    </div>
  );
}

export default function RichTextEditor({
  value,
  defaultValue,
  onChange,
  placeholder = "Escreva aqui...",
  minHeight = "10rem",
  maxHeight = "32rem",
  disabled = false,
  readOnly = false,
  showCount = false,
  maxLength,
  toolbar = ALL_GROUPS,
  variant = "default",
  className,
  editorClassName,
  componentId,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false, allowBase64: true }),
      CharacterCount.configure({ limit: maxLength }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? defaultValue ?? "",
    editable: !disabled && !readOnly,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor || value === undefined) return;
    if (editor.getHTML() !== value) editor.commands.setContent(value);
  }, [editor, value]);

  React.useEffect(() => {
    editor?.setEditable(!disabled && !readOnly);
  }, [editor, disabled, readOnly]);

  const isBorderless = variant === "borderless";
  const charCount = editor?.storage.characterCount.characters() ?? 0;
  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const atLimit = maxLength !== undefined && charCount >= maxLength;

  if (!editor) {
    return (
      <div
        className={twMerge(
          "flex flex-col overflow-hidden text-sm",
          !isBorderless && "rounded-lg border border-zinc-200 bg-white",
          isBorderless && "bg-transparent",
          (disabled || readOnly) && "opacity-60",
          className,
        )}
        style={{ minHeight }}
        {...(componentId ? { "data-component-id": componentId } : {})}
      />
    );
  }

  return (
    <div
      className={twMerge(
        "flex flex-col overflow-hidden text-sm",
        !isBorderless && "rounded-lg border border-zinc-200 bg-white",
        isBorderless && "bg-transparent",
        (disabled || readOnly) && "opacity-60",
        className,
      )}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {!readOnly && editor && (
        <div className="px-2 pb-1">
          <Toolbar editor={editor} groups={toolbar} />
        </div>
      )}

      <EditorContent
        editor={editor}
        className={twMerge(
          "rte-content flex-1 px-4 py-3 focus:outline-none text-zinc-900 prose prose-sm max-w-none",
          editorClassName,
        )}
        style={{ minHeight, maxHeight }}
      />

      {showCount && editor && (
        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-3 py-1.5">
          <span className="text-[11px] text-zinc-400">
            {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
          </span>
          <span
            className={twMerge(
              "text-[11px]",
              atLimit ? "text-red-500 font-medium" : "text-zinc-400",
            )}
          >
            {charCount}
            {maxLength !== undefined ? ` / ${maxLength}` : ""} caracteres
          </span>
        </div>
      )}
    </div>
  );
}
