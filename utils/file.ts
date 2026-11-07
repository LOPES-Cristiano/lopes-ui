/**
 * Utilitários para inspeção, classificação e tamanhos de arquivos
 */

/**
 * Formata um tamanho em bytes para formato legível (Bytes, KB, MB, GB, TB, PB)
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';
  if (bytes < 1) return `${parseFloat(bytes.toFixed(2))} Bytes`;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const rawIdx = Math.floor(Math.log(bytes) / Math.log(k));
  const i = Math.max(0, Math.min(sizes.length - 1, rawIdx));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Extrai a extensão em minúsculas de um nome de arquivo ou URL (sem o ponto inicial)
 */
export function getFileExtension(fileNameOrUrl: string | null | undefined): string {
  if (!fileNameOrUrl) return '';
  const clean = fileNameOrUrl.split('?')[0]?.split('#')[0] ?? '';
  const lastDot = clean.lastIndexOf('.');
  if (lastDot < 0 || lastDot === clean.length - 1) return '';
  return clean.slice(lastDot + 1).toLowerCase();
}

export function isImageFile(nameOrMime: string | null | undefined): boolean {
  if (!nameOrMime) return false;
  if (nameOrMime.toLowerCase().startsWith('image/')) return true;
  return /^(?:png|jpe?g|gif|webp|avif|svg|bmp|ico)$/.test(getFileExtension(nameOrMime));
}

export function isPdfFile(nameOrMime: string | null | undefined): boolean {
  if (!nameOrMime) return false;
  if (nameOrMime.toLowerCase() === 'application/pdf') return true;
  return getFileExtension(nameOrMime) === 'pdf';
}

export function isSpreadsheetFile(nameOrMime: string | null | undefined): boolean {
  if (!nameOrMime) return false;
  const lower = nameOrMime.toLowerCase();
  if (
    lower.includes('spreadsheet') ||
    lower.includes('ms-excel') ||
    lower === 'text/csv'
  ) {
    return true;
  }
  return /^(?:xlsx?|csv|ods|tsv)$/.test(getFileExtension(nameOrMime));
}
