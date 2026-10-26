/**
 * Utilitários para arquivos e tamanhos
 */

/**
 * Formata um tamanho em bytes para formato legível (KB, MB, GB)
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
