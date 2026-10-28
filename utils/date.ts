/**
 * Utilitários para formatação e manipulação de datas
 */

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Converte data ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss) para formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(isoDate: string | Date | null | undefined): string {
  if (!isoDate) return '-';
  if (isoDate instanceof Date) {
    return isNaN(isoDate.getTime()) ? '-' : isoDate.toLocaleDateString('pt-BR');
  }
  const cleanDate = isoDate.split('T')[0];
  const [year, month, day] = cleanDate.split('-');
  if (year && month && day && year.length === 4) {
    return `${day}/${month}/${year}`;
  }
  try {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? isoDate : d.toLocaleDateString('pt-BR');
  } catch {
    return isoDate;
  }
}

export const formatDateBR = formatDate;

/**
 * Formata data e hora para o padrão brasileiro (DD/MM/YYYY HH:mm:ss ou DD/MM/YYYY às HH:mm:ss)
 */
export function formatDateTime(
  data: string | Date | null | undefined,
  hora?: string | null,
  separator = ' às '
): string {
  if (!data) return '-';
  const dataFmt = formatDate(data);
  if (hora) return `${dataFmt}${separator}${hora}`;
  if (data instanceof Date) {
    if (isNaN(data.getTime())) return '-';
    const hhmmss = `${pad2(data.getHours())}:${pad2(data.getMinutes())}:${pad2(data.getSeconds())}`;
    return `${dataFmt}${separator}${hhmmss}`;
  }
  if (typeof data === 'string' && data.includes('T')) {
    try {
      const d = new Date(data);
      if (!isNaN(d.getTime())) {
        const dStr = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
        const tStr = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
        return `${dStr}${separator}${tStr}`;
      }
    } catch {
      // ignore
    }
  }
  return dataFmt;
}

/**
 * Converte um objeto Date em string no formato ISO local YYYY-MM-DD (sem deslocamento UTC)
 */
export function toIsoDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Verifica se uma data em formato ISO (YYYY-MM-DD ou timestamp ISO) é estritamente anterior à data de hoje (no fuso local).
 */
export function isPastDate(isoDate: string | null | undefined): boolean {
  if (!isoDate) return false;
  const datePart = isoDate.split('T')[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (match) {
    const y = Number(match[1]);
    const m = Number(match[2]);
    const d = Number(match[3]);
    const targetMidnight = new Date(y, m - 1, d).getTime();
    return !isNaN(targetMidnight) && targetMidnight < todayMidnight;
  }

  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return false;
  const parsedMidnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  return parsedMidnight < todayMidnight;
}

/**
 * Calcula horas decorridas desde o cadastro (usando data e hora no formato HH:mm:ss)
 */
export function calculateElapsedHours(
  dataCadastro?: string | null,
  horaCadastro?: string | null
): number {
  if (!dataCadastro) return 0;
  const cleanDate = dataCadastro.split('T')[0];
  const hora = horaCadastro && horaCadastro.length >= 5 ? horaCadastro : '00:00:00';
  const dataHoraIso = `${cleanDate}T${hora.length === 5 ? `${hora}:00` : hora}`;
  const dtCriacao = new Date(dataHoraIso);
  if (isNaN(dtCriacao.getTime())) return 0;
  const agora = new Date();
  const diffMs = agora.getTime() - dtCriacao.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}
export const calcularHorasDecorridas = calculateElapsedHours;

/**
 * Formata duração em milissegundos para string legível (ex: "2d 4h 15m 30s" ou "45s")
 */
export function formatDurationFromMs(diffMs: number): string {
  if (diffMs <= 0) return '0s';
  if (diffMs < 1000) return '1s';
  const diffSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSecs / 86400);
  const hours = Math.floor((diffSecs % 86400) / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

/**
 * Formata a duração transcorrida entre duas datas/horas ISO
 */
export function formatDuration(
  startStr?: string | null,
  endStr?: string | null
): string | undefined {
  if (!startStr || !endStr) return undefined;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return undefined;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return undefined;
  return formatDurationFromMs(diffMs);
}

/**
 * Formata o tempo decorrido desde o cadastro de forma compacta (ex: "5m", "2h 15m", "3d 4h")
 */
export function formatElapsedShort(
  dataCadastro?: string | null,
  horaCadastro?: string | null
): string | null {
  if (!dataCadastro) return null;
  try {
    const cleanDate = dataCadastro.split('T')[0];
    const dataStr = horaCadastro ? `${cleanDate}T${horaCadastro}` : `${cleanDate}T00:00:00`;
    const criadoEm = new Date(dataStr).getTime();
    if (isNaN(criadoEm)) return null;
    const diffMin = Math.max(0, Math.floor((new Date().getTime() - criadoEm) / (1000 * 60)));
    if (isNaN(diffMin)) return null;
    if (diffMin < 60) return `${diffMin}m`;
    const horas = Math.floor(diffMin / 60);
    const minRest = diffMin % 60;
    if (horas < 24) return `${horas}h ${minRest}m`;
    const dias = Math.floor(horas / 24);
    return `${dias}d ${horas % 24}h`;
  } catch {
    return null;
  }
}
