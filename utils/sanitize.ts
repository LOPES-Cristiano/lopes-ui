/**
 * Utilitários de sanitização HTML, URLs e cores CSS sem dependências externas.
 * Utiliza a API nativa `Element.prototype.setHTML` (Sanitizer API) quando disponível,
 * inspeção em árvore inerte via `DOMParser` no navegador e fallback seguro em SSR.
 */

const BASE_BLOCKED_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'meta',
  'link',
  'base',
  'style',
  'foreignobject',
] as const;

const DANGEROUS_STYLE_PATTERN =
  /(?:expression\s*\(|javascript\s*:|vbscript\s*:|-moz-binding|behavior\s*:|@import)/i;

const DANGEROUS_URL_SCHEME_PATTERN =
  /^\s*(?:javascript|vbscript|data\s*:\s*(?:text\/html|application\/xhtml\+xml))\s*:/i;

const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction']);

export interface SanitizeHtmlOptions {
  allowSvg?: boolean;
  allowDataAttributes?: boolean;
}

/**
 * Escapa caracteres especiais HTML para interpolação segura como texto.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Valida uma cor CSS hexadecimal (#RGB, #RRGGBB ou #RRGGBBAA), retornando fallback seguro.
 */
export function sanitizeCssColor(
  value: string | null | undefined,
  fallback = '#4f46e5',
): string {
  const trimmed = (value ?? '').trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)
    ? trimmed
    : fallback;
}

/**
 * Valida URLs HTTP(S), mailto:, tel:, âncoras (#) ou caminhos relativos internos, bloqueando esquemas executáveis.
 */
export function sanitizeHttpUrl(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\/[^\s"'<>]+$/i.test(trimmed)) return trimmed;
  if (/^(?:mailto|tel):[^\s"'<>]+$/i.test(trimmed)) return trimmed;
  if (/^#[^\s"'<>]*$/.test(trimmed)) return trimmed;
  if (/^\/[^\s"'<>]*$/.test(trimmed) && !trimmed.startsWith('//')) return trimmed;
  return '';
}

/** Alias semântico para validação de atributos href seguros. */
export const sanitizeSafeHref = sanitizeHttpUrl;

/**
 * Valida URLs de mídia (imagens/PDFs), permitindo HTTP(S), caminhos relativos, blob: e data:image/* ou data:application/pdf.
 */
export function sanitizeMediaUrl(value: string | null | undefined): string {
  const safeHttp = sanitizeHttpUrl(value);
  if (safeHttp) return safeHttp;
  const trimmed = (value ?? '').trim();
  if (/^blob:(?:https?:\/\/|null\/)[^\s"'<>]+$/i.test(trimmed)) return trimmed;
  if (/^data:(?:image\/(?:png|jpe?g|gif|webp|avif|bmp)|application\/pdf);base64,[a-z0-9+/=\s]+$/i.test(trimmed)) {
    return trimmed;
  }
  return '';
}

function sanitizeSsrFallback(rawHtml: string, allowSvg: boolean): string {
  const blocked = allowSvg
    ? BASE_BLOCKED_TAGS.join('|')
    : [...BASE_BLOCKED_TAGS, 'svg', 'math'].join('|');

  const pairedRegex = new RegExp(`<(${blocked})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi');
  const singleRegex = new RegExp(`<(${blocked})\\b[^>]*\\/?>`, 'gi');

  return rawHtml
    .replace(pairedRegex, '')
    .replace(singleRegex, '')
    .replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]+)/gi, '')
    .replace(
      /\s+(href|src|xlink:href|action|formaction|srcdoc)\s*=\s*(?:"\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"]*"|'\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^']*'|(?:\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]*))/gi,
      ' $1="#"',
    )
    .replace(DANGEROUS_STYLE_PATTERN, '');
}

function sanitizeWithDomParser(
  rawHtml: string,
  { allowSvg = false, allowDataAttributes = false }: SanitizeHtmlOptions,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const blockedSet = new Set<string>(
    allowSvg ? BASE_BLOCKED_TAGS : [...BASE_BLOCKED_TAGS, 'svg', 'math'],
  );

  const elements = Array.from(doc.body.querySelectorAll('*'));
  for (const el of elements) {
    const tag = el.tagName.toLowerCase();
    if (blockedSet.has(tag)) {
      el.remove();
      continue;
    }

    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      const val = attr.value;

      if (name.startsWith('on') || name === 'srcdoc' || name === 'formaction') {
        el.removeAttribute(attr.name);
        continue;
      }

      if (!allowDataAttributes && name.startsWith('data-')) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (URL_ATTRIBUTES.has(name) && DANGEROUS_URL_SCHEME_PATTERN.test(val)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (name === 'style' && DANGEROUS_STYLE_PATTERN.test(val)) {
        el.removeAttribute(attr.name);
        continue;
      }
    }

    if (el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer');
    }
  }

  return doc.body.innerHTML;
}

/**
 * Sanitiza HTML de assinaturas e corpos de e-mail removendo scripts, handlers inline,
 * formulários, tags SVG/Math e atributos `data-*`.
 */
export function sanitizeEmailHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    return sanitizeWithDomParser(dirty, { allowSvg: false, allowDataAttributes: false });
  }
  return sanitizeSsrFallback(dirty, false);
}

/**
 * Sanitiza conteúdo HTML rico (ex.: saída do `RichTextEditor`) preservando atributos `data-*`
 * estruturais (como task-lists e callouts) e SVGs seguros, bloqueando scripts e vetores XSS.
 */
export function sanitizeRichHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    return sanitizeWithDomParser(dirty, { allowSvg: true, allowDataAttributes: true });
  }
  return sanitizeSsrFallback(dirty, true);
}

/**
 * Insere HTML não confiável diretamente em um elemento DOM utilizando a Sanitizer API nativa
 * (`Element.prototype.setHTML`) quando suportada pelo navegador, com fallback seguro.
 */
export function safeSetHTML(
  element: Element,
  dirty: string | null | undefined,
  options?: { allowRich?: boolean },
): void {
  const html = dirty ?? '';
  const elWithSetHtml = element as Element & {
    setHTML?: (input: string) => void;
  };
  if (
    !options?.allowRich &&
    typeof Element !== 'undefined' &&
    'setHTML' in Element.prototype &&
    typeof elWithSetHtml.setHTML === 'function'
  ) {
    elWithSetHtml.setHTML(html);
    return;
  }
  element.innerHTML = options?.allowRich ? sanitizeRichHtml(html) : sanitizeEmailHtml(html);
}
