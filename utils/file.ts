/**
 * Utilitários para arquivos e tamanhos
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
