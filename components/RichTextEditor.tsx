"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useEditor, EditorContent, type Editor, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
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
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link as LinkIcon, Link2Off, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Table as TableIcon, Image as ImageIcon,
  Undo, Redo, Minus, Code, Heading1, Heading2, Heading3, Pilcrow,
  type LucideIcon, Palette, Highlighter, RemoveFormatting, Rows, Columns, Trash2,
  Type, ChevronDown, Check, Info, AArrowDown, AArrowUp, SquareCheck,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon, X,
  Maximize2, Minimize2, Merge, Split, PanelTop,
} from "lucide-react";

// ═══════════ Types ═══════════
export type RichTextEditorProps = {
  value?: string; defaultValue?: string; onChange?: (html: string) => void;
  placeholder?: string; minHeight?: string; maxHeight?: string; disabled?: boolean;
  readOnly?: boolean; showCount?: boolean; maxLength?: number; toolbar?: ToolbarGroup[];
  variant?: "default" | "borderless"; className?: string; editorClassName?: string; componentId?: string;
};
export type ToolbarGroup = "history"|"font"|"block"|"inline"|"format"|"align"|"list"|"link"|"table"|"media";
const ALL_GROUPS: ToolbarGroup[] = ["history","font","block","inline","format","align","list","link","table","media"];

// ═══════════ Constants ═══════════
const FONT_OPTIONS = [
  { label: "Padrão", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
];
const FONT_SIZES = [8,9,10,11,12,13,14,16,18,20,22,24,28,32,36,48,72];
const DEFAULT_FONT_SIZE = 14;
const TEXT_COLORS = [
  {color:"#09090b",label:"Preto"},{color:"#4f46e5",label:"Índigo"},{color:"#2563eb",label:"Azul"},
  {color:"#0891b2",label:"Ciano"},{color:"#16a34a",label:"Verde"},{color:"#dc2626",label:"Vermelho"},
  {color:"#d97706",label:"Âmbar"},{color:"#db2777",label:"Rosa"},{color:"#7c3aed",label:"Roxo"},
  {color:"#71717a",label:"Cinza"},
];
const HIGHLIGHT_COLORS = [
  {color:"#fef08a",label:"Amarelo"},{color:"#bbf7d0",label:"Verde"},{color:"#bfdbfe",label:"Azul"},
  {color:"#fecaca",label:"Vermelho"},{color:"#fbcfe8",label:"Rosa"},{color:"#e9d5ff",label:"Roxo"},
  {color:"#fed7aa",label:"Laranja"},{color:"#d1fae5",label:"Menta"},
];

// ═══════════ FontSize Extension ═══════════
const FontSizeExtension = TextStyle.extend({
  name: "textStyle",
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el: HTMLElement) => el.style.fontSize?.replace("px","") || null,
        renderHTML: (attrs: Record<string,any>) => !attrs.fontSize ? {} : { style: `font-size: ${attrs.fontSize}px` },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize: (size: number) => ({ chain }: any) => chain().setMark("textStyle",{fontSize:String(size)}).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark("textStyle",{fontSize:null}).removeEmptyTextStyle().run(),
    } as any;
  },
});

// ═══════════ ResizableImage NodeView ═══════════
function ResizableImageView({ node, updateAttributes, deleteNode, selected }: {
  node: any; updateAttributes: (attrs: Record<string,any>) => void; deleteNode: () => void; selected: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number|null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsResizing(true);
    startXRef.current = e.clientX; startWidthRef.current = containerRef.current?.offsetWidth ?? 400;
    const onMove = (ev: MouseEvent) => setLiveWidth(Math.max(60, startWidthRef.current+ev.clientX-startXRef.current));
    const onUp = (ev: MouseEvent) => {
      updateAttributes({ width: `${Math.max(60, startWidthRef.current+ev.clientX-startXRef.current)}px` });
      setLiveWidth(null); setIsResizing(false);
      window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp);
    };
    window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp);
  };

  const isActive = isHovered || selected || isResizing;
  const imgAlign: "left"|"center"|"right" = node.attrs.align ?? "center";
  const resolvedWidth = liveWidth ? `${liveWidth}px` : (node.attrs.width ?? "auto");

  return (
    <NodeViewWrapper style={{display:"block",
      textAlign: imgAlign==="right" ? "right" : imgAlign==="left" ? "left" : "center",
      marginTop:"0.75rem", marginBottom:"0.75rem"}}>
      <div ref={containerRef} contentEditable={false}
        onMouseEnter={()=>setIsHovered(true)}
        onMouseLeave={()=>{if(!isResizing)setIsHovered(false);}}
        className={twMerge(
          "relative inline-block max-w-full rounded-lg select-none",
          isActive && "ring-2 ring-primary ring-offset-2",
          !isResizing && "transition-shadow duration-150"
        )}
        style={{
          width: resolvedWidth==="auto" ? undefined : resolvedWidth,
          cursor: isResizing ? "ew-resize" : "default",
        }}>
        <img src={node.attrs.src} alt={node.attrs.alt??"Imagem"} draggable={false}
          style={{display:"block",width:"100%",height:"auto",borderRadius:"6px",
            boxShadow:"0 4px 6px -1px rgba(0,0,0,0.08)",pointerEvents:"none"}}/>
        {isActive && (
          <div style={{position:"absolute",top:"10px",left:"50%",transform:"translateX(-50%)",
            display:"flex",alignItems:"center",gap:"3px",background:"rgba(18,18,21,0.92)",
            backdropFilter:"blur(10px)",borderRadius:"10px",padding:"5px 8px",zIndex:40,
            boxShadow:"0 8px 24px rgba(0,0,0,0.4)",whiteSpace:"nowrap",pointerEvents:"all"}}>
            {(["left","center","right"] as const).map(a=>(
              <button key={a} type="button"
                aria-label={a === "left" ? "Alinhar à esquerda" : a === "center" ? "Centralizar" : "Alinhar à direita"}
                onMouseDown={e=>{e.preventDefault();updateAttributes({align:a});}}
                className={twMerge(
                  "border-none rounded-[5px] w-[22px] h-[22px] flex items-center justify-center cursor-pointer text-[11px]",
                  imgAlign === a ? "bg-primary text-primary-foreground" : "bg-white/10 text-white"
                )}>
                {a === "left" ? "←" : a === "center" ? "≡" : "→"}
              </button>
            ))}
            <div style={{width:"1px",height:"16px",background:"rgba(255,255,255,0.15)",margin:"0 4px"}}/>
            {(["25%","50%","75%","100%"] as const).map(w=>(
              <button key={w} type="button" onMouseDown={e=>{e.preventDefault();
                const pw=containerRef.current?.parentElement?.offsetWidth;
                if(pw)updateAttributes({width:`${Math.round(pw*parseInt(w)/100)}px`});else updateAttributes({width:w});}}
                style={{background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.75)",border:"none",
                  borderRadius:"5px",padding:"0 5px",height:"22px",display:"flex",alignItems:"center",
                  cursor:"pointer",fontSize:"9px",fontWeight:600}}>{w}</button>
            ))}
            <div style={{width:"1px",height:"16px",background:"rgba(255,255,255,0.15)",margin:"0 4px"}}/>
            <button type="button" aria-label="Remover imagem" onMouseDown={e=>{e.preventDefault();deleteNode();}}
              style={{background:"rgba(239,68,68,0.18)",color:"#f87171",border:"none",borderRadius:"5px",
                width:"22px",height:"22px",display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"pointer",fontSize:"15px",fontWeight:"bold"}}>×</button>
          </div>
        )}
        {isActive && (
          <div onMouseDown={handleResizeMouseDown} title="Arrastar para redimensionar"
            className="bg-primary text-primary-foreground shadow-md"
            style={{position:"absolute",bottom:"6px",right:"6px",width:"20px",height:"20px",
              borderRadius:"4px",cursor:"se-resize",display:"flex",
              alignItems:"center",justifyContent:"center",zIndex:40}}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
              <circle cx="1.5" cy="1.5" r="1.1"/><circle cx="4.5" cy="4.5" r="1.1"/><circle cx="7.5" cy="7.5" r="1.1"/>
            </svg>
          </div>
        )}
        {isResizing && liveWidth && (
          <div style={{position:"absolute",bottom:"32px",right:"6px",background:"rgba(18,18,21,0.9)",
            color:"white",padding:"2px 8px",borderRadius:"5px",fontSize:"10px",fontFamily:"monospace",zIndex:40}}>
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
        renderHTML: (attrs: Record<string,string>) => attrs.width
          ? { "data-width": attrs.width, style: `width: ${attrs.width}; max-width: 100%;` }
          : { style: "max-width: 100%;" },
      },
      align: {
        default: "center",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-align") ?? "center",
        renderHTML: (attrs: Record<string,string>) => ({ "data-align": attrs.align ?? "center" }),
      },
    };
  },
  addNodeView() { return ReactNodeViewRenderer(ResizableImageView); },
});

// ═══════════ Toolbar Primitives ═══════════
function ToolBtn({ icon: Icon, label, onClick, active, disabled }: {
  icon: LucideIcon; label: string; onClick: () => void; active?: boolean; disabled?: boolean;
}) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={active}
      onMouseDown={e=>e.preventDefault()} onClick={e=>{e.preventDefault();if(!disabled)onClick();}} disabled={disabled}
      className={twMerge("inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer",
        "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none",
        active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/90 dark:hover:text-primary-foreground")}>
      <Icon size={13} strokeWidth={2}/>
    </button>
  );
}

function Sep() { return <div className="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700 shrink-0"/>; }

// ═══════════ Toolbar ═══════════
function Toolbar({ editor, groups }: { editor: Editor; groups: ToolbarGroup[] }) {
  const has = (g: ToolbarGroup) => groups.includes(g);
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const fontFamilyRef = useRef<HTMLDivElement>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const imageFileRef = useRef<HTMLInputElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(e.target as Node)) setFontFamilyOpen(false);
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false); setHighlightPickerOpen(false); setLinkOpen(false); setImageModalOpen(false);
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
        setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkOpen(true);
      }
    };
    dom.addEventListener("keydown", onKey);
    return () => dom.removeEventListener("keydown", onKey);
  }, [editor]);

  const currentFontFamily = editor.getAttributes("textStyle")?.fontFamily ?? "";
  const currentFontLabel = FONT_OPTIONS.find(f => f.value === currentFontFamily)?.label ?? "Fonte";
  const rawFontSize = editor.getAttributes("textStyle")?.fontSize;
  const currentFontSize: number = rawFontSize ? parseInt(rawFontSize) : DEFAULT_FONT_SIZE;

  const decreaseFontSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(currentFontSize);
    const prev = idx > 0 ? FONT_SIZES[idx-1] : FONT_SIZES.findLast(s => s < currentFontSize) ?? FONT_SIZES[0];
    (editor.chain().focus() as any).setFontSize(prev).run();
  }, [editor, currentFontSize]);

  const increaseFontSize = useCallback(() => {
    const idx = FONT_SIZES.indexOf(currentFontSize);
    const next = idx < FONT_SIZES.length-1 ? FONT_SIZES[idx+1] : FONT_SIZES.find(s => s > currentFontSize) ?? FONT_SIZES[FONT_SIZES.length-1];
    (editor.chain().focus() as any).setFontSize(next).run();
  }, [editor, currentFontSize]);

  const applyLink = useCallback(() => {
    const raw = linkUrl.trim();
    if (!raw) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else {
      const href = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(raw) ? raw : `https://${raw}`;
      const attrs = { href, target: "_blank", rel: "noopener noreferrer" };
      if (editor.state.selection.empty && !editor.isActive("link"))
        editor.chain().focus().insertContent({ type: "text", text: raw, marks: [{ type: "link", attrs }] }).run();
      else editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    }
    setLinkOpen(false); setLinkUrl("");
  }, [editor, linkUrl]);

  const applyImageUrl = useCallback(() => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl(""); setImageModalOpen(false);
  }, [editor, imageUrl]);

  const handleImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") { editor.chain().focus().setImage({ src: reader.result }).run(); setImageModalOpen(false); }
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const insertTable = useCallback(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), [editor]);
  const after = (...rest: ToolbarGroup[]) => rest.some(has);

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-0.5 p-1.5 select-none">

      {has("history") && <>
        <ToolBtn icon={Undo} label="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}/>
        <ToolBtn icon={Redo} label="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}/>
        {after("font","block","inline","format","align","list","link","table","media") && <Sep/>}
      </>}

      {has("font") && <>
        <div className="relative" ref={fontFamilyRef}>
          <button type="button" onMouseDown={e=>e.preventDefault()} onClick={() => setFontFamilyOpen(p=>!p)}
            className={twMerge("inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer",
              "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800", fontFamilyOpen && "bg-zinc-100 dark:bg-zinc-800")}>
            <Type size={12} strokeWidth={2}/>
            <span className="max-w-[52px] truncate" style={{ fontFamily: currentFontFamily || undefined }}>{currentFontLabel}</span>
            <ChevronDown size={10}/>
          </button>
          {fontFamilyOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 w-48 py-1 overflow-hidden animate-in fade-in-50 duration-100">
              {FONT_OPTIONS.map(f => (
                <button key={f.value} type="button" onMouseDown={e=>e.preventDefault()}
                  onClick={() => { if (!f.value) editor.chain().focus().unsetFontFamily().run(); else editor.chain().focus().setFontFamily(f.value).run(); setFontFamilyOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
                  style={{ fontFamily: f.value || undefined }}>
                  <span>{f.label}</span>
                  {currentFontFamily === f.value && <Check size={12} className="text-primary shrink-0"/>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" title="Diminuir Fonte" aria-label="Diminuir Fonte" onMouseDown={e=>e.preventDefault()} onClick={decreaseFontSize}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <AArrowDown size={14} strokeWidth={2}/>
          </button>
          <select aria-label="Tamanho da fonte" value={currentFontSize} onMouseDown={e=>e.stopPropagation()}
            onChange={e => { const sz=Number(e.target.value); if(sz===DEFAULT_FONT_SIZE)(editor.chain().focus() as any).unsetFontSize().run(); else(editor.chain().focus() as any).setFontSize(sz).run(); }}
            className="h-7 w-[52px] text-center text-xs rounded-md bg-transparent text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-primary cursor-pointer appearance-none px-1">
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" title="Aumentar Fonte" aria-label="Aumentar Fonte" onMouseDown={e=>e.preventDefault()} onClick={increaseFontSize}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <AArrowUp size={14} strokeWidth={2}/>
          </button>
        </div>
        {after("block","inline","format","align","list","link","table","media") && <Sep/>}
      </>}

      {has("block") && <>
        <ToolBtn icon={Pilcrow} label="Parágrafo" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}/>
        <ToolBtn icon={Heading1} label="Título 1" onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} active={editor.isActive("heading",{level:1})}/>
        <ToolBtn icon={Heading2} label="Título 2" onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive("heading",{level:2})}/>
        <ToolBtn icon={Heading3} label="Título 3" onClick={() => editor.chain().focus().toggleHeading({level:3}).run()} active={editor.isActive("heading",{level:3})}/>
        {after("inline","format","align","list","link","table","media") && <Sep/>}
      </>}

      {has("inline") && <>
        <ToolBtn icon={Bold} label="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}/>
        <ToolBtn icon={Italic} label="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}/>
        <ToolBtn icon={UnderlineIcon} label="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}/>
        <ToolBtn icon={Strikethrough} label="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}/>
        <ToolBtn icon={SubscriptIcon} label="Subscrito" onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")}/>
        <ToolBtn icon={SuperscriptIcon} label="Sobrescrito" onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")}/>
        <ToolBtn icon={Code} label="Código inline" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}/>
        <ToolBtn icon={RemoveFormatting} label="Limpar formatação" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}/>
        {after("format","align","list","link","table","media") && <Sep/>}
      </>}

      {has("format") && <>
        <div className="relative">
          <ToolBtn icon={Palette} label="Cor do Texto" onClick={() => { setColorPickerOpen(p=>!p); setHighlightPickerOpen(false); }}/>
          {colorPickerOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in-50 duration-100"
              onMouseDown={e=>e.stopPropagation()}>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {TEXT_COLORS.map(c => (
                  <button key={c.color} type="button" title={c.label} aria-label={c.label}
                    onClick={() => { editor.chain().focus().setColor(c.color).run(); setColorPickerOpen(false); }}
                    className="w-5 h-5 rounded-full border border-zinc-200 hover:scale-110 transition cursor-pointer"
                    style={{ backgroundColor: c.color }}/>
                ))}
              </div>
              <label className="flex items-center justify-between gap-2 mb-2 text-[10px] text-zinc-500 cursor-pointer">
                Personalizada
                <input type="color" defaultValue="#09090b" className="h-5 w-8 cursor-pointer bg-transparent border-0 p-0"
                  onChange={e => editor.chain().focus().setColor(e.target.value).run()}/>
              </label>
              <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setColorPickerOpen(false); }}
                className="w-full text-center px-2 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded transition cursor-pointer">Limpar</button>
            </div>
          )}
        </div>
        <div className="relative">
          <ToolBtn icon={Highlighter} label="Marca-texto" onClick={() => { setHighlightPickerOpen(p=>!p); setColorPickerOpen(false); }}/>
          {highlightPickerOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in-50 duration-100"
              onMouseDown={e=>e.stopPropagation()}>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {HIGHLIGHT_COLORS.map(c => (
                  <button key={c.color} type="button" title={c.label} aria-label={c.label}
                    onClick={() => { editor.chain().focus().setHighlight({color:c.color}).run(); setHighlightPickerOpen(false); }}
                    className="w-5 h-5 rounded-full border border-zinc-200 hover:scale-110 transition cursor-pointer"
                    style={{ backgroundColor: c.color }}/>
                ))}
              </div>
              <label className="flex items-center justify-between gap-2 mb-2 text-[10px] text-zinc-500 cursor-pointer">
                Personalizada
                <input type="color" defaultValue="#fef08a" className="h-5 w-8 cursor-pointer bg-transparent border-0 p-0"
                  onChange={e => editor.chain().focus().setHighlight({ color: e.target.value }).run()}/>
              </label>
              <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setHighlightPickerOpen(false); }}
                className="w-full text-center px-2 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded transition cursor-pointer">Limpar</button>
            </div>
          )}
        </div>
        {after("align","list","link","table","media") && <Sep/>}
      </>}

      {has("align") && <>
        <ToolBtn icon={AlignLeft} label="Esquerda" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({textAlign:"left"})}/>
        <ToolBtn icon={AlignCenter} label="Centralizar" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({textAlign:"center"})}/>
        <ToolBtn icon={AlignRight} label="Direita" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({textAlign:"right"})}/>
        <ToolBtn icon={AlignJustify} label="Justificar" onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({textAlign:"justify"})}/>
        {after("list","link","table","media") && <Sep/>}
      </>}

      {has("list") && <>
        <ToolBtn icon={List} label="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}/>
        <ToolBtn icon={ListOrdered} label="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}/>
        <ToolBtn icon={SquareCheck} label="Checklist" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")}/>
        <ToolBtn icon={Quote} label="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}/>
        <ToolBtn icon={Minus} label="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()}/>
        {after("link","table","media") && <Sep/>}
      </>}

      {has("link") && <>
        <div className="relative">
          <ToolBtn icon={LinkIcon} label="Inserir Link" onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkOpen(p=>!p); }} active={editor.isActive("link") || linkOpen}/>
          {linkOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 w-64 animate-in fade-in-50 duration-150">
              <input autoFocus type="url" placeholder="https://exemplo.com.br" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();applyLink();}if(e.key==="Escape")setLinkOpen(false);}}
                className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary"/>
              <button type="button" onClick={applyLink} className="px-2 py-1 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded cursor-pointer">OK</button>
              <button type="button" aria-label="Fechar" onClick={() => setLinkOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"><X className="w-3.5 h-3.5"/></button>
            </div>
          )}
        </div>
        {editor.isActive("link") && <ToolBtn icon={Link2Off} label="Remover Link" onClick={() => editor.chain().focus().unsetLink().run()}/>}
        {after("table","media") && <Sep/>}
      </>}

      {has("table") && <>
        <ToolBtn icon={TableIcon} label="Inserir Tabela" onClick={insertTable} active={editor.isActive("table")}/>
        {editor.isActive("table") && (
          <div className="flex items-center gap-0.5 bg-primary/10 p-0.5 rounded border border-primary/30">
            <ToolBtn icon={Rows} label="Adicionar linha" onClick={() => editor.chain().focus().addRowAfter().run()}/>
            <ToolBtn icon={Columns} label="Adicionar coluna" onClick={() => editor.chain().focus().addColumnAfter().run()}/>
            <div className="mx-0.5 h-4 w-px bg-primary/25 shrink-0"/>
            <button type="button" title="Excluir linha" aria-label="Excluir linha" onMouseDown={e=>e.preventDefault()} onClick={() => editor.chain().focus().deleteRow().run()}
              className="inline-flex h-7 px-1.5 items-center gap-0.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer">
              <Rows size={11}/><X size={8}/>
            </button>
            <button type="button" title="Excluir coluna" aria-label="Excluir coluna" onMouseDown={e=>e.preventDefault()} onClick={() => editor.chain().focus().deleteColumn().run()}
              className="inline-flex h-7 px-1.5 items-center gap-0.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer">
              <Columns size={11}/><X size={8}/>
            </button>
            <div className="mx-0.5 h-4 w-px bg-primary/25 shrink-0"/>
            <ToolBtn icon={Merge} label="Mesclar células" onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}/>
            <ToolBtn icon={Split} label="Dividir célula" onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}/>
            <ToolBtn icon={PanelTop} label="Alternar linha de cabeçalho" onClick={() => editor.chain().focus().toggleHeaderRow().run()}/>
            <div className="mx-0.5 h-4 w-px bg-primary/25 shrink-0"/>
            <ToolBtn icon={Trash2} label="Excluir tabela" onClick={() => editor.chain().focus().deleteTable().run()}/>
          </div>
        )}
        {has("media") && <Sep/>}
      </>}

      {has("media") && (
        <div className="relative">
          <ToolBtn icon={ImageIcon} label="Inserir Imagem" onClick={() => setImageModalOpen(p=>!p)}/>
          {imageModalOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-72 space-y-2.5 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Inserir Imagem</span>
                <button type="button" aria-label="Fechar" onClick={() => setImageModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer"><X className="w-3.5 h-3.5"/></button>
              </div>
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Info size={12} className="text-amber-600 mt-0.5 shrink-0"/>
                <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                  Imagens são salvas como <strong>base64 inline</strong>. Prefira URLs externas para imagens grandes.
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">Upload do Computador:</label>
                <input ref={imageFileRef} type="file" accept="image/*" onChange={handleImageFile}
                  className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"/>
              </div>
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">Ou via URL:</label>
                <div className="flex items-center gap-1.5">
                  <input type="url" placeholder="https://.../imagem.png" value={imageUrl} onChange={e=>setImageUrl(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();applyImageUrl();}}}
                    className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary"/>
                  <button type="button" onClick={applyImageUrl} className="px-2.5 py-1 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded cursor-pointer">OK</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════ Main Component ═══════════
export default function RichTextEditor({
  value, defaultValue, onChange, placeholder = "Escreva aqui...",
  minHeight = "10rem", maxHeight = "32rem", disabled = false, readOnly = false,
  showCount = false, maxLength, toolbar = ALL_GROUPS, variant = "default",
  className, editorClassName, componentId,
}: RichTextEditorProps) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const insertImageFiles = (view: any, files: File[], pos?: number) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        const node = view.state.schema.nodes.image?.create({ src: reader.result });
        if (!node) return;
        const tr = pos !== undefined ? view.state.tr.insert(pos, node) : view.state.tr.replaceSelectionWith(node);
        view.dispatch(tr);
      };
      reader.readAsDataURL(file);
    });
  };

  const editor = useEditor({
    editorProps: {
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter(f => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        insertImageFiles(view, files);
        return true;
      },
      handleDrop(view, event) {
        const files = Array.from((event as DragEvent).dataTransfer?.files ?? []).filter(f => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        insertImageFiles(view, files, coords?.pos);
        return true;
      },
    },
    extensions: [
      // StarterKit v3 já inclui Underline e Link: desativados aqui para evitar extensões duplicadas.
      StarterKit.configure({ underline: false, link: false, bulletList: { keepMarks: true, keepAttributes: false }, orderedList: { keepMarks: true, keepAttributes: false } }),
      Underline, FontSizeExtension, Color, FontFamily,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank", class: "text-primary underline font-medium cursor-pointer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
      ResizableImage.configure({ allowBase64: true }),
      Subscript, Superscript, Typography,
      TaskList, TaskItem.configure({ nested: true, HTMLAttributes: { class: "task-item" } }),
      CharacterCount.configure({ limit: maxLength }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? defaultValue ?? "",
    editable: !disabled && !readOnly,
    onUpdate({ editor }) { onChange?.(editor.getHTML()); },
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
  });

  useEffect(() => { if (!editor || value === undefined) return; if (editor.getHTML() !== value) editor.commands.setContent(value); }, [editor, value]);
  useEffect(() => { editor?.setEditable(!disabled && !readOnly); }, [editor, disabled, readOnly]);

  const isBorderless = variant === "borderless";
  const charCount = editor?.storage.characterCount.characters() ?? 0;
  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const atLimit = maxLength !== undefined && charCount >= maxLength;

  if (!editor) {
    return (
      <div
        data-component-id={componentId}
        className={twMerge("flex flex-col overflow-hidden text-sm",
          !isBorderless && "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
          isBorderless && "bg-transparent", (disabled || readOnly) && "opacity-60", className)}
        style={{ minHeight }} />
    );
  }

  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      data-component-id={componentId}
      className={twMerge("flex flex-col overflow-hidden text-sm",
        !isBorderless && "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs",
        isBorderless && "bg-transparent", (disabled || readOnly) && "opacity-60", className,
        fullscreen && "fixed inset-0 z-[100] !rounded-none !max-h-none bg-white dark:bg-zinc-900")}
      >
      {!readOnly && (
        <div className="relative border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="pr-9"><Toolbar editor={editor} groups={toolbar}/></div>
          <button type="button" title={fullscreen ? "Sair da tela cheia (Esc)" : "Tela cheia"}
            aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
            onMouseDown={e=>e.preventDefault()} onClick={() => setFullscreen(p => !p)}
            className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
            {fullscreen ? <Minimize2 size={13}/> : <Maximize2 size={13}/>}
          </button>
        </div>
      )}
      <EditorContent editor={editor}
        className={twMerge("rte-content flex-1 px-4 py-3 focus:outline-none",
          "text-zinc-900 dark:text-zinc-100 prose prose-sm max-w-none dark:prose-invert overflow-auto", editorClassName)}
        style={fullscreen ? { minHeight: 0 } : { minHeight, maxHeight }}/>
      {(showCount || fullscreen) && (
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 px-3 py-1.5">
          <span className="text-[11px] text-zinc-400">~{readMinutes} min de leitura</span>
          <span className="text-[11px] text-zinc-400">{wordCount} {wordCount === 1 ? "palavra" : "palavras"}</span>
          <span className={twMerge("text-[11px]", atLimit ? "text-red-500 font-medium" : "text-zinc-400")}>
            {charCount}{maxLength !== undefined ? ` / ${maxLength}` : ""} caracteres
          </span>
        </div>
      )}
    </div>
  );
}
