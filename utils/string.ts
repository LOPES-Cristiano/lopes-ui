/**
 * Utilitários para tratamento e manipulação de texto
 */

/**
 * Remove espaços em branco nas extremidades e retorna null caso a string fique vazia
 */
export function sanitizeString(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Trunca um texto se ultrapassar o tamanho máximo especificado
 */
export function truncate(value: string | null | undefined, maxLength: number): string {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

/**
 * Gera uma sugestão de código/sigla a partir de um nome ou descrição por normalização alfanumérica.
 */
export function gerarCodigoSugerido(texto: string | null | undefined, maxLength = 4): string {
  if (!texto) return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas
 */
export function normalizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Extrai até 2 iniciais maiúsculas de um nome
 */
export function formatInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Retorna os dois primeiros nomes (Primeiro Nome e Sobrenome) de um nome completo
 */
export function formatShortName(name?: string | null): string {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 2) return name.trim();
  return `${parts[0]} ${parts[1]}`;
}
export const formatarNomeCurto = formatShortName;

/**
 * Capitaliza a primeira letra de cada palavra (Title Case)
 */
export function capitalize(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Converte string para número ou null se vazia/inválida
 */
export function toNullableNumber(value: string | number | null | undefined): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Extrai mensagem de erro amigável de qualquer erro capturado
 */
export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  return fallback;
}
