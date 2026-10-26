'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Code2,
  Copy,
  Check,
  Search,
  Replace,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  RotateCcw,
  WrapText,
  FileCode,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import Button from './Button';
import toast from './Toast';
import { cn } from '@/utils/cn';

export type CodeEditorLanguage = 'json' | 'sql' | 'javascript' | 'typescript' | 'html' | 'css' | 'plaintext';

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  language?: CodeEditorLanguage;
  readOnly?: boolean;
  disabled?: boolean;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  className?: string;
  editorClassName?: string;
  title?: string;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  showFormat?: boolean;
  showSearch?: boolean;
  showImportExport?: boolean;
  showFullscreen?: boolean;
  onReset?: () => void;
  onSave?: (code: string) => void;
  onApply?: () => void;
  applyLabel?: string;
  componentId?: string;
  filename?: string;
}

export interface SyntaxDiagnostic {
  isValid: boolean;
  line?: number;
  column?: number;
  message?: string;
}

// ── Formatador Inteligente ──────────────────────────────────────────────────
export function formatCode(code: string, language: CodeEditorLanguage = 'json'): string {
  if (!code) return '';

  if (language === 'json') {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return code;
    }
  }

  if (language === 'sql') {
    const keywords = [
      'SELECT', 'FROM', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN',
      'JOIN', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
      'UNION ALL', 'UNION', 'WITH', 'SET', 'VALUES',
    ];
    let formatted = code.trim().replace(/\r\n/g, '\n').replace(/\t/g, '  ');
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw.replace(' ', '\\s+')}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
    return formatted;
  }

  return code;
}

// ── Minificador Inteligente ────────────────────────────────────────────────
export function minifyCode(code: string, language: CodeEditorLanguage = 'json'): string {
  if (!code) return '';
  if (language === 'json') {
    try {
      return JSON.stringify(JSON.parse(code));
    } catch {
      return code;
    }
  }
  return code.replace(/\s+/g, ' ').trim();
}

// ── Validador de Sintaxe em Tempo Real ─────────────────────────────────────
export function validateCode(code: string, language: CodeEditorLanguage = 'json'): SyntaxDiagnostic {
  if (!code || !code.trim()) {
    return { isValid: true };
  }

  if (language === 'json') {
    try {
      JSON.parse(code);
      return { isValid: true };
    } catch (err: any) {
      const msg = err?.message || 'Erro de sintaxe JSON';
      let line = 1;
      let column = 1;

      // Extrai linha e coluna da mensagem de erro do motor V8/SpiderMonkey
      // Ex: "Unexpected token } in JSON at position 123" ou "at line 5 column 12"
      const lineColMatch = msg.match(/line (\d+) column (\d+)/i);
      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        column = parseInt(lineColMatch[2], 10);
      } else {
        const posMatch = msg.match(/position (\d+)/i);
        if (posMatch) {
          const pos = parseInt(posMatch[1], 10);
          const linesUpToPos = code.substring(0, pos).split('\n');
          line = linesUpToPos.length;
          column = linesUpToPos[linesUpToPos.length - 1].length + 1;
        }
      }

      // Traduz erros comuns para português amigável
      let friendlyMsg = msg;
      if (msg.includes('Unexpected token')) {
        friendlyMsg = msg.replace('Unexpected token', 'Caractere inesperado');
      } else if (msg.includes('Unexpected end of JSON input')) {
        friendlyMsg = 'Estrutura JSON incompleta (fechamento ausente de chave ou colchete)';
      }

      return {
        isValid: false,
        line,
        column,
        message: friendlyMsg,
      };
    }
  }

  // Validador de pares de delimitadores para outras linguagens
  const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const stack: { char: string; line: number; col: number }[] = [];
  const lines = code.split('\n');

  for (let l = 0; l < lines.length; l++) {
    const curLine = lines[l];
    for (let c = 0; c < curLine.length; c++) {
      const char = curLine[c];
      if (pairs[char]) {
        stack.push({ char, line: l + 1, col: c + 1 });
      } else if (Object.values(pairs).includes(char)) {
        if (stack.length === 0) {
          return {
            isValid: false,
            line: l + 1,
            column: c + 1,
            message: `Caractere de fechamento "${char}" inesperado sem abertura correspondente.`,
          };
        }
        const last = stack.pop()!;
        if (pairs[last.char] !== char) {
          return {
            isValid: false,
            line: l + 1,
            column: c + 1,
            message: `Esperado "${pairs[last.char]}", mas encontrado "${char}".`,
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return {
      isValid: false,
      line: unclosed.line,
      column: unclosed.col,
      message: `Delimitador "${unclosed.char}" aberto na linha ${unclosed.line} não foi fechado.`,
    };
  }

  return { isValid: true };
}

// ── Componente CodeEditor ──────────────────────────────────────────────────
export default function CodeEditor({
  value,
  onChange,
  defaultValue = '',
  language = 'json',
  readOnly = false,
  disabled = false,
  height,
  minHeight = '240px',
  maxHeight,
  className = '',
  editorClassName = '',
  title,
  showToolbar = true,
  showStatusBar = true,
  showLineNumbers = true,
  showCopy = true,
  showFormat = true,
  showSearch = true,
  showImportExport = true,
  showFullscreen = true,
  onReset,
  onSave,
  onApply,
  applyLabel,
  componentId,
  filename,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fecha o modo tela cheia com ESC com prioridade
  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [isFullscreen]);

  // Busca e Substituição
  const [searchOpen, setSearchOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState<number>(-1);

  // Valor atual controlado ou fallback
  const currentValue = value !== undefined ? value : defaultValue;

  // Linhas do código
  const lines = useMemo(() => currentValue.split('\n'), [currentValue]);
  const totalLines = lines.length;

  // Diagnóstico sintático em tempo real
  const diagnostic = useMemo(() => validateCode(currentValue, language), [currentValue, language]);

  // Sincroniza o Scroll vertical entre o Textarea e a régua de números de linha
  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !gutterRef.current) return;
    gutterRef.current.scrollTop = textareaRef.current.scrollTop;
  }, []);

  // Atualiza posição do cursor (Linha e Coluna)
  const updateCursorPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selStart = textarea.selectionStart;
    const textBefore = currentValue.substring(0, selStart);
    const linesBefore = textBefore.split('\n');
    const line = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length + 1;

    setCursorPos({ line, col });
  }, [currentValue]);

  // Pula para a linha do erro ou linha clicada
  const jumpToLine = useCallback(
    (lineNum: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      let charPos = 0;
      for (let i = 0; i < lineNum - 1 && i < lines.length; i++) {
        charPos += lines[i].length + 1;
      }

      textarea.focus();
      textarea.setSelectionRange(charPos, charPos + (lines[lineNum - 1]?.length || 0));
      // Estima a altura da linha (22px)
      textarea.scrollTop = Math.max(0, (lineNum - 4) * 22);
      if (gutterRef.current) {
        gutterRef.current.scrollTop = textarea.scrollTop;
      }
    },
    [lines]
  );

  // Teclas de atalho e indentação
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea || readOnly || disabled) return;

    const { selectionStart, selectionEnd } = textarea;
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // 1. Salvar: Ctrl + S / Cmd + S
    if (ctrlOrCmd && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (onSave) onSave(currentValue);
      return;
    }

    // 2. Formatar: Ctrl + Shift + F / Cmd + Shift + F
    if (ctrlOrCmd && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      handleFormat();
      return;
    }

    // 3. Buscar: Ctrl + F
    if (ctrlOrCmd && (e.key === 'f' || e.key === 'F') && !e.shiftKey) {
      e.preventDefault();
      setSearchOpen(true);
      return;
    }

    // 4. Substituir: Ctrl + H
    if (ctrlOrCmd && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      setSearchOpen(true);
      setReplaceOpen(true);
      return;
    }

    // 5. Indentação Inteligente com Tab e Shift + Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const indentStr = '  '; // 2 espaços

      if (selectionStart !== selectionEnd) {
        const textBefore = currentValue.substring(0, selectionStart);
        const startLineIdx = textBefore.split('\n').length - 1;
        const endLineIdx = (textBefore + currentValue.substring(selectionStart, selectionEnd)).split('\n').length - 1;

        const allLines = currentValue.split('\n');
        for (let i = startLineIdx; i <= endLineIdx; i++) {
          if (e.shiftKey) {
            allLines[i] = allLines[i].replace(/^ {1,2}/, '');
          } else {
            allLines[i] = indentStr + allLines[i];
          }
        }

        const newValue = allLines.join('\n');
        onChange?.(newValue);
      } else {
        if (e.shiftKey) {
          const textBefore = currentValue.substring(0, selectionStart);
          if (textBefore.endsWith('  ')) {
            const newValue = currentValue.substring(0, selectionStart - 2) + currentValue.substring(selectionStart);
            onChange?.(newValue);
            setTimeout(() => textarea.setSelectionRange(selectionStart - 2, selectionStart - 2), 0);
          }
        } else {
          const newValue = currentValue.substring(0, selectionStart) + indentStr + currentValue.substring(selectionEnd);
          onChange?.(newValue);
          setTimeout(() => textarea.setSelectionRange(selectionStart + 2, selectionStart + 2), 0);
        }
      }
      return;
    }

    // 6. Mover Linhas: Alt + ArrowUp / ArrowDown
    if (e.altKey && !e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const textBefore = currentValue.substring(0, selectionStart);
      const startLineIdx = textBefore.split('\n').length - 1;
      const endLineIdx = (textBefore + currentValue.substring(selectionStart, selectionEnd)).split('\n').length - 1;

      const allLines = currentValue.split('\n');
      if (e.key === 'ArrowUp') {
        if (startLineIdx === 0) return;
        const lineAbove = allLines[startLineIdx - 1];
        const movingBlock = allLines.slice(startLineIdx, endLineIdx + 1);
        allLines.splice(startLineIdx - 1, endLineIdx - startLineIdx + 2, ...movingBlock, lineAbove);
        const newValue = allLines.join('\n');
        onChange?.(newValue);
        setTimeout(() => {
          const newStart = allLines.slice(0, startLineIdx - 1).join('\n').length + (startLineIdx > 1 ? 1 : 0);
          const newEnd = newStart + movingBlock.join('\n').length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
      } else {
        if (endLineIdx >= allLines.length - 1) return;
        const lineBelow = allLines[endLineIdx + 1];
        const movingBlock = allLines.slice(startLineIdx, endLineIdx + 1);
        allLines.splice(startLineIdx, endLineIdx - startLineIdx + 2, lineBelow, ...movingBlock);
        const newValue = allLines.join('\n');
        onChange?.(newValue);
        setTimeout(() => {
          const newStart = allLines.slice(0, startLineIdx + 1).join('\n').length + 1;
          const newEnd = newStart + movingBlock.join('\n').length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
      }
      return;
    }

    // 7. Duplicar Linha: Alt + Shift + ArrowDown
    if (e.altKey && e.shiftKey && e.key === 'ArrowDown') {
      e.preventDefault();
      const textBefore = currentValue.substring(0, selectionStart);
      const startLineIdx = textBefore.split('\n').length - 1;
      const endLineIdx = (textBefore + currentValue.substring(selectionStart, selectionEnd)).split('\n').length - 1;
      const allLines = currentValue.split('\n');
      const movingBlock = allLines.slice(startLineIdx, endLineIdx + 1);
      allLines.splice(endLineIdx + 1, 0, ...movingBlock);
      onChange?.(allLines.join('\n'));
      return;
    }
  };

  // Formatação com feedback
  const handleFormat = () => {
    if (!diagnostic.isValid) {
      toast.error('Corrija os erros de sintaxe antes de formatar.');
      return;
    }
    const formatted = formatCode(currentValue, language);
    onChange?.(formatted);
    toast.success('Código formatado e indentado!');
  };

  // Minificação
  const handleMinify = () => {
    if (!diagnostic.isValid) {
      toast.error('Corrija os erros de sintaxe antes de minificar.');
      return;
    }
    const minified = minifyCode(currentValue, language);
    onChange?.(minified);
    toast.info('Código minificado.');
  };

  // Copiar
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentValue);
      setCopied(true);
      toast.success('Código copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar o código.');
    }
  };

  // Exportar / Download
  const handleDownload = () => {
    const ext = language === 'json' ? 'json' : language === 'sql' ? 'sql' : 'txt';
    const name = filename || `codigo_${new Date().toISOString().slice(0, 10)}.${ext}`;
    const blob = new Blob([currentValue], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Arquivo baixado: ${name}`);
  };

  // Importar / Upload
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onChange?.(text);
        toast.success(`Arquivo "${file.name}" carregado com sucesso!`);
      } catch {
        toast.error('Erro ao ler o arquivo.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Lógica de Busca e Substituição ──────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm || !searchOpen) {
      setSearchMatches([]);
      setCurrentMatchIdx(-1);
      return;
    }

    const matches: number[] = [];
    const lowerValue = currentValue.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    let pos = 0;

    while ((pos = lowerValue.indexOf(lowerTerm, pos)) !== -1) {
      matches.push(pos);
      pos += lowerTerm.length;
    }

    setSearchMatches(matches);
    if (matches.length > 0) {
      setCurrentMatchIdx(0);
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(matches[0], matches[0] + searchTerm.length);
      }
    } else {
      setCurrentMatchIdx(-1);
    }
  }, [searchTerm, currentValue, searchOpen]);

  const nextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIdx + 1) % searchMatches.length;
    setCurrentMatchIdx(nextIdx);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(searchMatches[nextIdx], searchMatches[nextIdx] + searchTerm.length);
    }
  };

  const prevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIdx(prevIdx);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(searchMatches[prevIdx], searchMatches[prevIdx] + searchTerm.length);
    }
  };

  const handleReplaceOne = () => {
    if (currentMatchIdx < 0 || searchMatches.length === 0 || !textareaRef.current) return;
    const matchPos = searchMatches[currentMatchIdx];
    const newValue = currentValue.substring(0, matchPos) + replaceTerm + currentValue.substring(matchPos + searchTerm.length);
    onChange?.(newValue);
  };

  const handleReplaceAll = () => {
    if (!searchTerm || searchMatches.length === 0) return;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newValue = currentValue.replace(regex, replaceTerm);
    onChange?.(newValue);
    toast.success(`${searchMatches.length} ocorrência(s) substituída(s).`);
  };

  const editorContent = (
    <div
      className={cn(
        'flex flex-col bg-card text-foreground transition-all duration-150',
        'select-text relative font-sans overflow-hidden',
        isFullscreen
          ? 'fixed inset-0 z-[12000] w-screen h-screen rounded-none border-0 shadow-none m-0 p-0'
          : cn('rounded-xl border border-border shadow-xs', className),
        disabled && 'opacity-60 pointer-events-none'
      )}
      style={{
        width: isFullscreen ? '100vw' : undefined,
        height: isFullscreen ? '100vh' : height,
        minHeight: isFullscreen ? '100vh' : minHeight,
        maxHeight: isFullscreen ? '100vh' : maxHeight,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={language === 'json' ? '.json' : language === 'sql' ? '.sql' : '*'}
        onChange={handleImportFile}
        className="hidden"
      />

      {/* ── TOOLBAR SUPERIOR ──────────────────────────────────────────────── */}
      {showToolbar && (
        <div className="h-10 px-3 border-b border-border/80 bg-surface/70 flex items-center justify-between gap-2 shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Code2 size={13} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-xs text-foreground truncate">
              {title || (language === 'json' ? 'Editor JSON' : language === 'sql' ? 'Editor SQL' : 'Editor de Código')}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-muted text-muted-foreground border border-border/60">
              {language}
            </span>
          </div>

          {/* Ações da Toolbar */}
          <div className="flex items-center gap-1 shrink-0">
            {showSearch && (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setReplaceOpen(false);
                }}
                className={cn(
                  'h-7 px-2 rounded-md inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer',
                  searchOpen && 'bg-muted text-foreground'
                )}
                title="Buscar (Ctrl + F)"
              >
                <Search size={12} />
                <span className="hidden sm:inline text-[11px]">Buscar</span>
              </button>
            )}

            {showFormat && (
              <button
                type="button"
                onClick={handleFormat}
                className="h-7 px-2 rounded-md inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                title="Formatar Código (Ctrl + Shift + F)"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span className="hidden sm:inline text-[11px]">Formatar</span>
              </button>
            )}

            {language === 'json' && (
              <button
                type="button"
                onClick={handleMinify}
                className="h-7 px-1.5 rounded-md inline-flex items-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                title="Minificar JSON"
              >
                <span className="text-[10px] font-mono font-semibold">Min</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setWordWrap((p) => !p)}
              className={cn(
                'h-7 px-1.5 rounded-md inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer',
                wordWrap && 'bg-muted text-primary'
              )}
              title={wordWrap ? 'Desativar quebra de linha' : 'Ativar quebra de linha'}
            >
              <WrapText size={13} />
            </button>

            {showCopy && (
              <button
                type="button"
                onClick={handleCopy}
                className="h-7 px-2 rounded-md inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                title="Copiar Código"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span className="hidden sm:inline text-[11px]">{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            )}

            {showImportExport && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 w-7 rounded-md inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  title="Importar Arquivo"
                >
                  <Upload size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="h-7 w-7 rounded-md inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  title="Exportar Arquivo"
                >
                  <Download size={12} />
                </button>
              </>
            )}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="h-7 w-7 rounded-md inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                title="Restaurar valor inicial"
              >
                <RotateCcw size={12} />
              </button>
            )}

            {isFullscreen && onApply && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Check size={12} />}
                onClick={onApply}
                className="h-7 px-2.5 text-xs font-semibold mr-1 shadow-xs"
              >
                {applyLabel || 'Aplicar'}
              </Button>
            )}

            {showFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen((p) => !p)}
                className={cn(
                  'h-7 px-2 rounded-md inline-flex items-center gap-1 text-xs transition-colors cursor-pointer',
                  isFullscreen
                    ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
                title={isFullscreen ? 'Restaurar Janela (Esc)' : 'Maximizar'}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                {isFullscreen && <span className="text-[11px]">Restaurar</span>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── BARRA FLUTUANTE DE BUSCA E SUBSTITUIÇÃO ───────────────────────── */}
      {searchOpen && (
        <div className="absolute top-11 right-3 z-30 p-2 rounded-xl bg-card border border-border shadow-xl space-y-2 max-w-sm w-full animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar termo..."
                className="w-full h-7 pl-2 pr-12 text-xs font-mono rounded-lg bg-surface border border-border text-foreground focus:outline-hidden focus:border-primary"
                autoFocus
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-muted-foreground font-mono">
                {searchMatches.length > 0 ? `${currentMatchIdx + 1}/${searchMatches.length}` : '0/0'}
              </span>
            </div>

            <button
              type="button"
              onClick={prevMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              title="Anterior (Shift + Enter)"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={nextMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              title="Próximo (Enter)"
            >
              <ChevronDown size={14} />
            </button>
            <button
              type="button"
              onClick={() => setReplaceOpen((p) => !p)}
              className={cn(
                'p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer',
                replaceOpen && 'bg-primary/10 text-primary'
              )}
              title="Alternar Substituição (Ctrl + H)"
            >
              <Replace size={14} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {replaceOpen && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Substituir por..."
                className="flex-1 h-7 px-2 text-xs font-mono rounded-lg bg-surface border border-border text-foreground focus:outline-hidden focus:border-primary"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReplaceOne}
                disabled={searchMatches.length === 0}
                className="h-7 px-2 text-[10px]"
              >
                Substituir
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleReplaceAll}
                disabled={searchMatches.length === 0}
                className="h-7 px-2 text-[10px]"
              >
                Tudo
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── ÁREA CENTRAL DO EDITOR (RÉGUA DE NÚMEROS + TEXTAREA) ───────────── */}
      <div className="flex-1 relative flex overflow-hidden min-h-0 bg-card text-foreground font-mono text-xs leading-[22px]">
        {/* Calha de Numeração de Linhas Sincronizada com Scroll */}
        {showLineNumbers && (
          <div
            ref={gutterRef}
            className="w-12 py-3 bg-muted/30 border-r border-border/70 select-none text-right pr-2 text-muted-foreground/60 overflow-hidden shrink-0 font-mono text-[11px] leading-[22px]"
          >
            {lines.map((_, i) => {
              const lineNum = i + 1;
              const isCurrent = cursorPos.line === lineNum;
              const isError = !diagnostic.isValid && diagnostic.line === lineNum;

              return (
                <div
                  key={i}
                  onClick={() => jumpToLine(lineNum)}
                  className={cn(
                    'cursor-pointer transition-colors relative flex items-center justify-end gap-1',
                    isError
                      ? 'text-red-500 font-bold bg-red-500/10 -mr-2 pr-2'
                      : isCurrent
                      ? 'text-primary font-bold bg-primary/10 -mr-2 pr-2'
                      : 'hover:text-foreground'
                  )}
                  title={isError ? diagnostic.message : `Linha ${lineNum}`}
                >
                  {isError && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                  <span>{lineNum}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Textarea Interativo Principal */}
        <div className="flex-1 relative h-full overflow-hidden">
          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => {
              onChange?.(e.target.value);
              updateCursorPosition();
            }}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap={wordWrap ? 'on' : 'off'}
            className={cn(
              'absolute inset-0 w-full h-full p-3 font-mono text-xs sm:text-[12.5px] leading-[22px]',
              'bg-transparent text-foreground resize-none outline-none border-none overflow-auto z-10 selection:bg-primary/25',
              wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre',
              editorClassName
            )}
            placeholder="Digite ou cole seu código aqui..."
          />
        </div>
      </div>

      {/* ── BARRA DE STATUS INFERIOR ──────────────────────────────────────── */}
      {showStatusBar && (
        <div className="h-7 px-3 border-t border-border/80 bg-surface/70 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 select-none font-mono">
          {/* Status Sintático */}
          <div className="flex items-center gap-2 min-w-0">
            {diagnostic.isValid ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 size={13} />
                <span>Sintaxe Válida</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => diagnostic.line && jumpToLine(diagnostic.line)}
                className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium truncate hover:underline text-left cursor-pointer"
                title="Clique para ir até a linha do erro"
              >
                <AlertCircle size={13} className="shrink-0" />
                <span className="truncate">
                  {diagnostic.line ? `[L${diagnostic.line}:C${diagnostic.column}] ` : ''}
                  {diagnostic.message}
                </span>
              </button>
            )}
          </div>

          {/* Posição do Cursor e Estatísticas */}
          <div className="flex items-center gap-3 text-muted-foreground/80 shrink-0 text-[10.5px]">
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span>•</span>
            <span>{totalLines} lin</span>
            <span>•</span>
            <span>{currentValue.length} car</span>
            <span>•</span>
            <span>UTF-8</span>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen && typeof document !== 'undefined') {
    return createPortal(editorContent, document.body);
  }

  return editorContent;
}
