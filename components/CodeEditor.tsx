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
  Maximize2,
  Minimize2,
  Play,
  Loader2,
} from 'lucide-react';
import Button from './Button';
import toast from './Toast';
import { cn } from '@/utils/cn';
import { useAccessControl } from './useAccessControl';

export type CodeEditorLanguage =
  | 'json'
  | 'sql'
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'yaml'
  | 'markdown'
  | 'xml'
  | 'bash'
  | 'plaintext';

export type CodeEditorVariant = 'default' | 'dark' | 'minimal';

export interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  language?: CodeEditorLanguage;
  allowLanguageChange?: boolean;
  onLanguageChange?: (language: CodeEditorLanguage) => void;
  variant?: CodeEditorVariant;
  syntaxHighlight?: boolean;
  autoCloseBrackets?: boolean;
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
  onExecute?: (code: string) => void | Promise<void>;
  executeLabel?: string;
  onApply?: () => void;
  applyLabel?: string;
  componentId?: string;
  hideIfDenied?: boolean;
  filename?: string;
}

export interface SyntaxDiagnostic {
  isValid: boolean;
  line?: number;
  column?: number;
  message?: string;
}

const ALL_LANGUAGES: { value: CodeEditorLanguage; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'html', label: 'HTML' },
  { value: 'xml', label: 'XML' },
  { value: 'css', label: 'CSS' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Texto' },
];

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
      'UNION ALL', 'UNION', 'WITH', 'SET', 'VALUES', 'INSERT INTO', 'UPDATE', 'DELETE FROM',
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro de sintaxe JSON';
      let line = 1;
      let column = 1;

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

  if (language === 'plaintext' || language === 'markdown') {
    return { isValid: true };
  }

  // Validador de pares de delimitadores (ignorando conteúdo dentro de strings básicas)
  const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const closingSet = new Set(Object.values(pairs));
  const stack: { char: string; line: number; col: number }[] = [];
  const lines = code.split('\n');
  let inQuote: string | null = null;

  for (let l = 0; l < lines.length; l++) {
    const curLine = lines[l];
    for (let c = 0; c < curLine.length; c++) {
      const char = curLine[c];
      const prev = c > 0 ? curLine[c - 1] : '';
      if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
        if (inQuote === char) inQuote = null;
        else if (!inQuote) inQuote = char;
        continue;
      }
      if (inQuote) continue;

      if (pairs[char]) {
        stack.push({ char, line: l + 1, col: c + 1 });
      } else if (closingSet.has(char)) {
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

// ── Lightweight Zero-Lag Syntax Highlighter ────────────────────────────────

const SQL_KW = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'ON',
  'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'ILIKE', 'BETWEEN', 'EXISTS',
  'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP',
  'TABLE', 'VIEW', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DISTINCT',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'WITH', 'RETURNING', 'TRUE', 'FALSE',
]);

const JS_TS_KW = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'finally', 'throw',
  'new', 'class', 'extends', 'implements', 'interface', 'type', 'enum', 'import', 'from',
  'export', 'async', 'await', 'typeof', 'instanceof', 'in', 'of', 'void', 'true', 'false',
  'null', 'undefined', 'this', 'super', 'readonly', 'public', 'private', 'protected',
]);

const BASH_KW = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'in', 'do', 'done', 'case', 'esac',
  'while', 'function', 'export', 'local', 'echo', 'exit', 'return', 'cd', 'npm', 'npx', 'git',
]);

function renderHighlightedCode(
  code: string,
  language: CodeEditorLanguage,
  forceDark: boolean
): React.ReactNode {
  if (!code) return null;
  if (language === 'plaintext') return code;

  const cls = {
    comment: forceDark ? 'text-zinc-500 italic' : 'text-zinc-400 dark:text-zinc-500 italic',
    key: forceDark ? 'text-sky-300' : 'text-sky-700 dark:text-sky-300',
    string: forceDark ? 'text-emerald-300' : 'text-emerald-700 dark:text-emerald-300',
    number: forceDark ? 'text-amber-300' : 'text-amber-700 dark:text-amber-300',
    keyword: forceDark
      ? 'text-violet-300 font-semibold'
      : 'text-violet-700 dark:text-violet-300 font-semibold',
    bool: forceDark
      ? 'text-orange-300 font-semibold'
      : 'text-orange-600 dark:text-orange-300 font-semibold',
    tag: forceDark ? 'text-rose-300' : 'text-rose-700 dark:text-rose-300',
    punct: forceDark ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400',
  };

  if (language === 'json') {
    const tokenRe =
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],:])/g;
    const out: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = tokenRe.exec(code)) !== null) {
      if (m.index > last) out.push(code.slice(last, m.index));
      if (m[1] !== undefined) {
        if (m[2] !== undefined) {
          out.push(
            <span key={k++} className={cls.key}>
              {m[1]}
            </span>
          );
          out.push(
            <span key={k++} className={cls.punct}>
              {m[2]}
            </span>
          );
        } else {
          out.push(
            <span key={k++} className={cls.string}>
              {m[1]}
            </span>
          );
        }
      } else if (m[3] !== undefined) {
        out.push(
          <span key={k++} className={cls.bool}>
            {m[3]}
          </span>
        );
      } else if (m[4] !== undefined) {
        out.push(
          <span key={k++} className={cls.number}>
            {m[4]}
          </span>
        );
      } else if (m[5] !== undefined) {
        out.push(
          <span key={k++} className={cls.punct}>
            {m[5]}
          </span>
        );
      }
      last = tokenRe.lastIndex;
    }
    if (last < code.length) out.push(code.slice(last));
    return out;
  }

  if (language === 'html' || language === 'xml') {
    const tokenRe = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z0-9_:-]+|\/>|>)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
    const out: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = tokenRe.exec(code)) !== null) {
      if (m.index > last) out.push(code.slice(last, m.index));
      if (m[1]) {
        out.push(
          <span key={k++} className={cls.comment}>
            {m[1]}
          </span>
        );
      } else if (m[2]) {
        out.push(
          <span key={k++} className={cls.tag}>
            {m[2]}
          </span>
        );
      } else if (m[3]) {
        out.push(
          <span key={k++} className={cls.string}>
            {m[3]}
          </span>
        );
      }
      last = tokenRe.lastIndex;
    }
    if (last < code.length) out.push(code.slice(last));
    return out;
  }

  // General tokenizer for SQL, JS, TS, CSS, YAML, Bash, Markdown
  const tokenRe =
    /(\/\/[^\n]*|--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(-?\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = tokenRe.exec(code)) !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <span key={k++} className={cls.comment}>
          {m[1]}
        </span>
      );
    } else if (m[2] !== undefined) {
      out.push(
        <span key={k++} className={cls.string}>
          {m[2]}
        </span>
      );
    } else if (m[3] !== undefined) {
      out.push(
        <span key={k++} className={cls.number}>
          {m[3]}
        </span>
      );
    } else if (m[4] !== undefined) {
      const word = m[4];
      const isKw =
        language === 'sql'
          ? SQL_KW.has(word.toUpperCase())
          : language === 'bash'
            ? BASH_KW.has(word)
            : JS_TS_KW.has(word);
      if (isKw) {
        out.push(
          <span key={k++} className={cls.keyword}>
            {word}
          </span>
        );
      } else {
        out.push(word);
      }
    }
    last = tokenRe.lastIndex;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

const BRACKET_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
};

// ── Componente CodeEditor ──────────────────────────────────────────────────
export default function CodeEditor({
  value,
  onChange,
  defaultValue = '',
  language: languageProp = 'json',
  allowLanguageChange = false,
  onLanguageChange,
  variant = 'default',
  syntaxHighlight = true,
  autoCloseBrackets = true,
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
  onExecute,
  executeLabel = 'Executar',
  onApply,
  applyLabel,
  componentId,
  hideIfDenied = false,
  filename,
}: CodeEditorProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);
  const effectiveDisabled = disabled || (!hasPermission && !hideIfDenied);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [prevLangProp, setPrevLangProp] = useState<CodeEditorLanguage>(languageProp);
  const [internalLang, setInternalLang] = useState<CodeEditorLanguage>(languageProp);
  const [executing, setExecuting] = useState(false);

  if (prevLangProp !== languageProp) {
    setPrevLangProp(languageProp);
    setInternalLang(languageProp);
  }

  const language = internalLang;
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const updateValue = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabMovesFocus, setTabMovesFocus] = useState(false);

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
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [rawMatchIdx, setCurrentMatchIdx] = useState<number>(0);

  const searchMatches = useMemo(() => {
    if (!searchTerm || !searchOpen) return [];
    const matches: number[] = [];
    const hay = caseSensitive ? currentValue : currentValue.toLowerCase();
    const needle = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    let pos = 0;

    while ((pos = hay.indexOf(needle, pos)) !== -1) {
      matches.push(pos);
      pos += Math.max(1, needle.length);
    }
    return matches;
  }, [searchTerm, currentValue, searchOpen, caseSensitive]);

  const currentMatchIdx =
    searchMatches.length === 0
      ? -1
      : Math.min(Math.max(0, rawMatchIdx), searchMatches.length - 1);

  const lines = useMemo(() => currentValue.split('\n'), [currentValue]);
  const totalLines = lines.length;

  const diagnostic = useMemo(
    () => validateCode(currentValue, language),
    [currentValue, language]
  );

  const forceDark = variant === 'dark';

  const highlightedNodes = useMemo(
    () => (syntaxHighlight ? renderHighlightedCode(currentValue, language, forceDark) : null),
    [currentValue, language, syntaxHighlight, forceDark]
  );

  // Sincroniza o Scroll entre Textarea, Gutter e Highlight Overlay
  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
  }, []);

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
      textarea.scrollTop = Math.max(0, (lineNum - 4) * 22);
      handleScroll();
    },
    [lines, handleScroll]
  );

  const handleRunExecute = useCallback(async () => {
    if (!onExecute || executing) return;
    setExecuting(true);
    try {
      await onExecute(currentValue);
    } finally {
      setExecuting(false);
    }
  }, [onExecute, executing, currentValue]);

  // Formatação com feedback
  const handleFormat = useCallback(() => {
    if (!diagnostic.isValid) {
      toast.error('Corrija os erros de sintaxe antes de formatar.');
      return;
    }
    const formatted = formatCode(currentValue, language);
    updateValue(formatted);
    toast.success('Código formatado e indentado!');
  }, [diagnostic.isValid, currentValue, language, updateValue]);

  const handleMinify = useCallback(() => {
    if (!diagnostic.isValid) {
      toast.error('Corrija os erros de sintaxe antes de minificar.');
      return;
    }
    const minified = minifyCode(currentValue, language);
    updateValue(minified);
    toast.info('Código minificado.');
  }, [diagnostic.isValid, currentValue, language, updateValue]);

  // Teclas de atalho, auto-close brackets e indentação
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea || readOnly || effectiveDisabled) return;

    const { selectionStart, selectionEnd } = textarea;
    const isMac =
      typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === 'Escape') {
      if (searchOpen) {
        e.preventDefault();
        setSearchOpen(false);
        return;
      }
      setTabMovesFocus(true);
      return;
    }

    if (e.ctrlKey && !e.altKey && !e.metaKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      setTabMovesFocus((prev) => !prev);
      return;
    }

    // Executar: Ctrl + Enter
    if (ctrlOrCmd && e.key === 'Enter' && onExecute) {
      e.preventDefault();
      void handleRunExecute();
      return;
    }

    // Salvar: Ctrl + S
    if (ctrlOrCmd && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      onSave?.(currentValue);
      return;
    }

    // Formatar: Ctrl + Shift + F
    if (ctrlOrCmd && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      handleFormat();
      return;
    }

    // Buscar: Ctrl + F
    if (ctrlOrCmd && (e.key === 'f' || e.key === 'F') && !e.shiftKey) {
      e.preventDefault();
      setSearchOpen(true);
      return;
    }

    // Substituir: Ctrl + H
    if (ctrlOrCmd && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      setSearchOpen(true);
      setReplaceOpen(true);
      return;
    }

    // Auto-fechamento de delimitadores e envolvimento de seleção
    if (autoCloseBrackets && !ctrlOrCmd && !e.altKey && BRACKET_PAIRS[e.key]) {
      const openChar = e.key;
      const closeChar = BRACKET_PAIRS[openChar];
      const selected = currentValue.substring(selectionStart, selectionEnd);

      // Se digitar o caractere de fechamento que já está logo à frente (para aspas)
      if (
        selectionStart === selectionEnd &&
        (openChar === '"' || openChar === "'" || openChar === '`') &&
        currentValue[selectionStart] === openChar
      ) {
        e.preventDefault();
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        return;
      }

      e.preventDefault();
      const nextVal =
        currentValue.substring(0, selectionStart) +
        openChar +
        selected +
        closeChar +
        currentValue.substring(selectionEnd);
      updateValue(nextVal);
      requestAnimationFrame(() => {
        if (selected.length > 0) {
          textarea.setSelectionRange(selectionStart + 1, selectionEnd + 1);
        } else {
          textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }
      });
      return;
    }

    // Auto-indentação inteligente ao pressionar Enter
    if (e.key === 'Enter' && !ctrlOrCmd && !e.shiftKey) {
      const before = currentValue.substring(0, selectionStart);
      const after = currentValue.substring(selectionEnd);
      const currentLine = before.split('\n').pop() ?? '';
      const indentMatch = /^(\s*)/.exec(currentLine);
      const baseIndent = indentMatch ? indentMatch[1] : '';
      const prevChar = before[before.length - 1];
      const nextChar = after[0];

      if (
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '[' && nextChar === ']') ||
        (prevChar === '(' && nextChar === ')')
      ) {
        e.preventDefault();
        const inner = `\n${baseIndent}  `;
        const outer = `\n${baseIndent}`;
        updateValue(before + inner + outer + after);
        requestAnimationFrame(() => {
          const pos = before.length + inner.length;
          textarea.setSelectionRange(pos, pos);
          updateCursorPosition();
        });
        return;
      }
    }

    // Indentação com Tab e Shift + Tab
    if (e.key === 'Tab') {
      if (tabMovesFocus) {
        setTabMovesFocus(false);
        return;
      }

      e.preventDefault();
      const indentStr = '  ';

      if (selectionStart !== selectionEnd) {
        const textBefore = currentValue.substring(0, selectionStart);
        const startLineIdx = textBefore.split('\n').length - 1;
        const endLineIdx =
          (textBefore + currentValue.substring(selectionStart, selectionEnd)).split('\n').length -
          1;

        const allLines = currentValue.split('\n');
        for (let i = startLineIdx; i <= endLineIdx; i++) {
          if (e.shiftKey) {
            allLines[i] = allLines[i].replace(/^ {1,2}/, '');
          } else {
            allLines[i] = indentStr + allLines[i];
          }
        }
        updateValue(allLines.join('\n'));
      } else if (e.shiftKey) {
        const textBefore = currentValue.substring(0, selectionStart);
        if (textBefore.endsWith('  ')) {
          const newValue =
            currentValue.substring(0, selectionStart - 2) + currentValue.substring(selectionStart);
          updateValue(newValue);
          setTimeout(() => textarea.setSelectionRange(selectionStart - 2, selectionStart - 2), 0);
        }
      } else {
        const newValue =
          currentValue.substring(0, selectionStart) +
          indentStr +
          currentValue.substring(selectionEnd);
        updateValue(newValue);
        setTimeout(() => textarea.setSelectionRange(selectionStart + 2, selectionStart + 2), 0);
      }
      return;
    }

    if (tabMovesFocus && !['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
      setTabMovesFocus(false);
    }

    // Mover Linhas: Alt + ArrowUp / ArrowDown
    if (e.altKey && !e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const textBefore = currentValue.substring(0, selectionStart);
      const startLineIdx = textBefore.split('\n').length - 1;
      const endLineIdx =
        (textBefore + currentValue.substring(selectionStart, selectionEnd)).split('\n').length - 1;

      const allLines = currentValue.split('\n');
      if (e.key === 'ArrowUp') {
        if (startLineIdx === 0) return;
        const lineAbove = allLines[startLineIdx - 1];
        const movingBlock = allLines.slice(startLineIdx, endLineIdx + 1);
        allLines.splice(
          startLineIdx - 1,
          endLineIdx - startLineIdx + 2,
          ...movingBlock,
          lineAbove
        );
        updateValue(allLines.join('\n'));
        setTimeout(() => {
          const newStart =
            allLines.slice(0, startLineIdx - 1).join('\n').length + (startLineIdx > 1 ? 1 : 0);
          const newEnd = newStart + movingBlock.join('\n').length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
      } else {
        if (endLineIdx >= allLines.length - 1) return;
        const lineBelow = allLines[endLineIdx + 1];
        const movingBlock = allLines.slice(startLineIdx, endLineIdx + 1);
        allLines.splice(startLineIdx, endLineIdx - startLineIdx + 2, lineBelow, ...movingBlock);
        updateValue(allLines.join('\n'));
        setTimeout(() => {
          const newStart = allLines.slice(0, startLineIdx + 1).join('\n').length + 1;
          const newEnd = newStart + movingBlock.join('\n').length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
      }
      return;
    }

    // Duplicar Linha: Alt + Shift + ArrowDown
    if (e.altKey && e.shiftKey && e.key === 'ArrowDown') {
      e.preventDefault();
      const textBefore = currentValue.substring(0, selectionStart);
      const startLineIdx = textBefore.split('\n').length - 1;
      const endLineIdx =
        (textBefore + currentValue.substring(selectionStart, selectionEnd)).split('\n').length - 1;
      const allLines = currentValue.split('\n');
      const movingBlock = allLines.slice(startLineIdx, endLineIdx + 1);
      allLines.splice(endLineIdx + 1, 0, ...movingBlock);
      updateValue(allLines.join('\n'));
    }
  };

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

  const handleDownload = () => {
    const extMap: Record<CodeEditorLanguage, string> = {
      json: 'json',
      sql: 'sql',
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      xml: 'xml',
      css: 'css',
      yaml: 'yaml',
      markdown: 'md',
      bash: 'sh',
      plaintext: 'txt',
    };
    const ext = extMap[language] || 'txt';
    const name = filename || `codigo.${ext}`;
    const blob = new Blob([currentValue], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Arquivo baixado: ${name}`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        updateValue(text);
        toast.success(`Arquivo "${file.name}" carregado com sucesso!`);
      } catch {
        toast.error('Erro ao ler o arquivo.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Busca e Substituição
  const nextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIdx + 1) % searchMatches.length;
    setCurrentMatchIdx(nextIdx);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(
        searchMatches[nextIdx],
        searchMatches[nextIdx] + searchTerm.length
      );
    }
  };

  const prevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIdx(prevIdx);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(
        searchMatches[prevIdx],
        searchMatches[prevIdx] + searchTerm.length
      );
    }
  };

  const handleReplaceOne = () => {
    if (currentMatchIdx < 0 || searchMatches.length === 0) return;
    const matchPos = searchMatches[currentMatchIdx];
    const newValue =
      currentValue.substring(0, matchPos) +
      replaceTerm +
      currentValue.substring(matchPos + searchTerm.length);
    updateValue(newValue);
  };

  const handleReplaceAll = () => {
    if (!searchTerm || searchMatches.length === 0) return;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const newValue = currentValue.replace(regex, replaceTerm);
    updateValue(newValue);
    toast.success(`${searchMatches.length} ocorrência(s) substituída(s).`);
  };

  if (!hasPermission && hideIfDenied) return null;

  const editorContent = (
    <div
      data-component-id={componentId}
      className={cn(
        'flex flex-col transition-all duration-150 select-text relative font-sans overflow-hidden',
        forceDark
          ? 'bg-zinc-950 text-zinc-100 border-zinc-800'
          : 'bg-card text-foreground border-border',
        isFullscreen
          ? 'fixed inset-0 z-[12000] w-screen h-screen rounded-none border-0 shadow-none m-0 p-0'
          : cn(
              variant === 'minimal'
                ? 'rounded-xl border border-border/60'
                : 'rounded-xl border shadow-xs',
              className
            ),
        effectiveDisabled && 'opacity-60 pointer-events-none'
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
        <div
          className={cn(
            'min-h-10 px-2.5 sm:px-3 py-1 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 select-none',
            forceDark ? 'border-zinc-800 bg-zinc-900/90' : 'border-border/80 bg-surface/70'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-lg shrink-0',
                forceDark ? 'bg-zinc-800 text-zinc-100' : 'bg-primary/10 text-primary'
              )}
            >
              <Code2 size={13} strokeWidth={2.5} />
            </div>
            <span
              className={cn(
                'font-semibold text-xs truncate',
                forceDark ? 'text-zinc-100' : 'text-foreground'
              )}
            >
              {title ||
                (language === 'json'
                  ? 'Editor JSON'
                  : language === 'sql'
                    ? 'Editor SQL'
                    : 'Editor de Código')}
            </span>

            {allowLanguageChange ? (
              <select
                aria-label="Selecionar linguagem"
                value={language}
                onChange={(e) => {
                  const nextLang = e.target.value as CodeEditorLanguage;
                  setInternalLang(nextLang);
                  onLanguageChange?.(nextLang);
                }}
                className={cn(
                  'h-6 rounded px-1.5 text-[10px] font-mono font-semibold uppercase border focus:outline-none cursor-pointer',
                  forceDark
                    ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                    : 'bg-muted text-muted-foreground border-border/60'
                )}
              >
                {ALL_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase border',
                  forceDark
                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    : 'bg-muted text-muted-foreground border-border/60'
                )}
              >
                {language}
              </span>
            )}
          </div>

          {/* Ações da Toolbar */}
          <div className="flex items-center gap-1 shrink-0">
            {onExecute && (
              <button
                type="button"
                onClick={() => void handleRunExecute()}
                disabled={executing || readOnly}
                title={`${executeLabel} (Ctrl + Enter)`}
                className="h-7 px-2.5 rounded-md inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {executing ? <Loader2 size={12} className="animate-spin" /> : <Play size={11} />}
                <span>{executeLabel}</span>
              </button>
            )}

            {showSearch && (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setReplaceOpen(false);
                }}
                className={cn(
                  'h-7 px-2 rounded-md inline-flex items-center gap-1 text-xs transition-colors cursor-pointer',
                  forceDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                  searchOpen && (forceDark ? 'bg-zinc-800 text-zinc-100' : 'bg-muted text-foreground')
                )}
                title="Buscar (Ctrl + F)"
              >
                <Search size={12} />
                <span className="hidden sm:inline text-[11px]">Buscar</span>
              </button>
            )}

            {showFormat && !readOnly && (
              <button
                type="button"
                onClick={handleFormat}
                className={cn(
                  'h-7 px-2 rounded-md inline-flex items-center gap-1 text-xs transition-colors cursor-pointer',
                  forceDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
                title="Formatar Código (Ctrl + Shift + F)"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span className="hidden sm:inline text-[11px]">Formatar</span>
              </button>
            )}

            {language === 'json' && !readOnly && (
              <button
                type="button"
                onClick={handleMinify}
                className={cn(
                  'h-7 px-1.5 rounded-md inline-flex items-center text-xs transition-colors cursor-pointer',
                  forceDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
                title="Minificar JSON"
              >
                <span className="text-[10px] font-mono font-semibold">Min</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setWordWrap((p) => !p)}
              className={cn(
                'h-7 px-1.5 rounded-md inline-flex items-center gap-1 text-xs transition-colors cursor-pointer',
                forceDark
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                wordWrap && (forceDark ? 'bg-zinc-800 text-white' : 'bg-muted text-primary')
              )}
              title={wordWrap ? 'Desativar quebra de linha' : 'Ativar quebra de linha'}
            >
              <WrapText size={13} />
            </button>

            {showCopy && (
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  'h-7 px-2 rounded-md inline-flex items-center gap-1 text-xs transition-colors cursor-pointer',
                  forceDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
                title="Copiar Código"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span className="hidden sm:inline text-[11px]">
                  {copied ? 'Copiado!' : 'Copiar'}
                </span>
              </button>
            )}

            {showImportExport && (
              <>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'h-7 w-7 rounded-md inline-flex items-center justify-center text-xs transition-colors cursor-pointer',
                      forceDark
                        ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    )}
                    title="Importar Arquivo"
                  >
                    <Upload size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDownload}
                  className={cn(
                    'h-7 w-7 rounded-md inline-flex items-center justify-center text-xs transition-colors cursor-pointer',
                    forceDark
                      ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                  title="Exportar Arquivo"
                >
                  <Download size={12} />
                </button>
              </>
            )}

            {onReset && !readOnly && (
              <button
                type="button"
                onClick={onReset}
                className={cn(
                  'h-7 w-7 rounded-md inline-flex items-center justify-center text-xs transition-colors cursor-pointer',
                  forceDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
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
                    : forceDark
                      ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
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
        <div className="absolute top-11 left-3 right-3 sm:left-auto z-30 p-2 rounded-xl bg-card text-foreground border border-border shadow-xl space-y-2 sm:max-w-sm sm:w-full animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) prevMatch();
                    else nextMatch();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setSearchOpen(false);
                    textareaRef.current?.focus();
                  }
                }}
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
              onClick={() => setCaseSensitive((p) => !p)}
              title="Diferenciar maiúsculas/minúsculas"
              className={cn(
                'h-7 px-1.5 rounded-md font-mono text-[10px] font-bold cursor-pointer',
                caseSensitive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Aa
            </button>

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
            {!readOnly && (
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
            )}
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Fechar busca"
            >
              <X size={14} />
            </button>
          </div>

          {replaceOpen && !readOnly && (
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

      {/* ── ÁREA CENTRAL DO EDITOR (RÉGUA + HIGHLIGHT OVERLAY + TEXTAREA) ── */}
      <div
        className={cn(
          'flex-1 relative flex overflow-hidden min-h-0 font-mono text-xs leading-[22px]',
          forceDark ? 'bg-zinc-950 text-zinc-100' : 'bg-card text-foreground'
        )}
      >
        {showLineNumbers && (
          <div
            ref={gutterRef}
            className={cn(
              'w-12 py-3 border-r select-none text-right pr-2 overflow-hidden shrink-0 font-mono text-[11px] leading-[22px]',
              forceDark
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                : 'bg-muted/30 border-border/70 text-muted-foreground/60'
            )}
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
                        ? forceDark
                          ? 'text-zinc-100 font-bold bg-white/10 -mr-2 pr-2'
                          : 'text-primary font-bold bg-primary/10 -mr-2 pr-2'
                        : forceDark
                          ? 'hover:text-zinc-300'
                          : 'hover:text-foreground'
                  )}
                  title={isError ? diagnostic.message : `Linha ${lineNum}`}
                >
                  {isError && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span>{lineNum}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 relative h-full overflow-hidden">
          {syntaxHighlight && currentValue.length > 0 && (
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-0 m-0 h-full w-full overflow-hidden p-3 font-mono text-xs sm:text-[12.5px] leading-[22px]',
                forceDark ? 'text-zinc-100' : 'text-foreground',
                wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
                editorClassName
              )}
            >
              {highlightedNodes}
              {currentValue.endsWith('\n') ? ' ' : null}
            </pre>
          )}

          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => {
              updateValue(e.target.value);
              updateCursorPosition();
            }}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            disabled={effectiveDisabled}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap={wordWrap ? 'on' : 'off'}
            className={cn(
              'absolute inset-0 w-full h-full p-3 font-mono text-xs sm:text-[12.5px] leading-[22px]',
              'bg-transparent resize-none outline-none border-none overflow-auto z-10 selection:bg-primary/25',
              syntaxHighlight && currentValue.length > 0
                ? cn('text-transparent', forceDark ? 'caret-zinc-100' : 'caret-foreground')
                : forceDark
                  ? 'text-zinc-100'
                  : 'text-foreground',
              wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
              editorClassName
            )}
            placeholder="Digite ou cole seu código aqui..."
          />
        </div>
      </div>

      {/* ── BARRA DE STATUS INFERIOR ──────────────────────────────────────── */}
      {showStatusBar && (
        <div
          className={cn(
            'h-7 px-3 border-t flex items-center justify-between text-[11px] shrink-0 select-none font-mono',
            forceDark
              ? 'border-zinc-800 bg-zinc-900/90 text-zinc-400'
              : 'border-border/80 bg-surface/70 text-muted-foreground'
          )}
        >
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
                className="flex items-center gap-1 text-red-500 font-medium truncate hover:underline text-left cursor-pointer"
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

          <div className="flex items-center gap-2.5 shrink-0 text-[10.5px]">
            {tabMovesFocus && (
              <>
                <span className="text-primary font-semibold">Tab move foco</span>
                <span>•</span>
              </>
            )}
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span>•</span>
            <span>{totalLines} lin</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{currentValue.length} car • UTF-8</span>
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
