/**
 * Utilitários para formatação e manipulação de datas, horas, durações e sprints (pt-BR)
 */

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Converte data ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss) para formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(isoDate: string | Date | null | undefined): string {
  if (!isoDate) return "-";
  if (isoDate instanceof Date) {
    return isNaN(isoDate.getTime()) ? "-" : isoDate.toLocaleDateString("pt-BR");
  }
  const trimmed = isoDate.trim();
  if (!trimmed) return "-";
  const cleanDate = trimmed.split("T")[0];
  const [year, month, day] = cleanDate.split("-");
  if (year && month && day && year.length === 4) {
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }
  try {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? isoDate : d.toLocaleDateString("pt-BR");
  } catch {
    return isoDate;
  }
}

export const formatDateBR = formatDate;

/**
 * Converte hora ("HH:mm:ss", "HH:mm") ou ISO DateTime/Date para o padrão brasileiro HH:mm ou HH:mm:ss
 */
export function formatTimeBR(
  timeStr: string | Date | null | undefined,
  includeSeconds = false,
): string {
  if (!timeStr) return "—";
  if (timeStr instanceof Date) {
    if (isNaN(timeStr.getTime())) return "—";
    const hhmm = `${pad2(timeStr.getHours())}:${pad2(timeStr.getMinutes())}`;
    return includeSeconds ? `${hhmm}:${pad2(timeStr.getSeconds())}` : hhmm;
  }

  const clean = timeStr.trim();
  if (!clean) return "—";

  if (!clean.includes("T") && clean.includes(":")) {
    const parts = clean.split(":");
    const hh = parts[0]?.padStart(2, "0") ?? "00";
    const mm = parts[1]?.padStart(2, "0") ?? "00";
    const ss = parts[2]?.padStart(2, "0");
    if (includeSeconds && ss) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${hh}:${mm}`;
  }

  try {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: includeSeconds ? "2-digit" : undefined,
      });
    }
  } catch {
    // ignore
  }
  return timeStr;
}

export const formatTime = formatTimeBR;

/**
 * Formata data e hora para o padrão brasileiro (DD/MM/YYYY HH:mm:ss ou DD/MM/YYYY às HH:mm:ss)
 */
export function formatDateTime(
  data: string | Date | null | undefined,
  hora?: string | null,
  separator = " às ",
): string {
  if (!data) return "-";
  const dataFmt = formatDate(data);
  if (hora) return `${dataFmt}${separator}${hora}`;
  if (data instanceof Date) {
    if (isNaN(data.getTime())) return "-";
    const hhmmss = `${pad2(data.getHours())}:${pad2(data.getMinutes())}:${pad2(data.getSeconds())}`;
    return `${dataFmt}${separator}${hhmmss}`;
  }
  if (typeof data === "string" && data.includes("T")) {
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
 * Formata data e hora concisa no padrão brasileiro: "DD/MM/YYYY às HH:mm"
 */
export function formatDateTimeBR(
  dateStr: string | Date | null | undefined,
  timeStr?: string | null | undefined,
): string {
  if (!dateStr) return "—";
  if (typeof dateStr === "string" && dateStr.trim() === "") return "—";

  if (timeStr && timeStr.trim() !== "") {
    return `${formatDateBR(dateStr)} às ${formatTimeBR(timeStr)}`;
  }

  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return "—";
    return `${formatDateBR(dateStr)} às ${formatTimeBR(dateStr)}`;
  }

  if (dateStr.includes("T") || dateStr.includes(" ")) {
    return `${formatDateBR(dateStr)} às ${formatTimeBR(dateStr)}`;
  }

  return formatDateBR(dateStr);
}

/**
 * Formata data de forma amigável e relativa no padrão brasileiro: "Hoje", "Ontem", "Amanhã" ou "DD/MM/YYYY"
 */
export function formatRelativeDateBR(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  let target: Date;

  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return "—";
    target = new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
  } else {
    if (dateStr.trim() === "") return "—";
    const clean = dateStr.trim().split("T")[0];
    const [y, m, d] = clean.split("-").map(Number);
    if (!y || !m || !d) return formatDateBR(dateStr);
    target = new Date(y, m - 1, d);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === -1) return "Ontem";
  if (diffDays === 1) return "Amanhã";

  return formatDateBR(dateStr);
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
  if (!isoDate || isoDate.trim() === "") return false;
  const datePart = isoDate.split("T")[0];
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
  const parsedMidnight = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  ).getTime();
  return parsedMidnight < todayMidnight;
}

/**
 * Calcula horas decorridas desde o cadastro (usando data e hora no formato HH:mm:ss)
 */
export function calculateElapsedHours(
  dataCadastro?: string | null,
  horaCadastro?: string | null,
): number {
  if (!dataCadastro) return 0;
  const cleanDate = dataCadastro.split("T")[0];
  const hora = horaCadastro && horaCadastro.length >= 5 ? horaCadastro : "00:00:00";
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
  if (diffMs <= 0) return "0s";
  if (diffMs < 1000) return "1s";
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
  return parts.join(" ");
}

/**
 * Formata duração em segundos para padrão conciso brasileiro ("2d 4h", "3h 15m", "45m", "30s")
 */
export function formatDurationBR(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return "0m";
  const total = Math.round(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (days > 0) {
    const parts = [`${days}d`];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 && days < 3) parts.push(`${minutes}m`);
    return parts.join(" ");
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${s}s`;
}

export const formatHumanDuration = formatDurationBR;

/**
 * Formata duração em segundos para exibição de cronômetro / relógio: "HH:MM:SS"
 */
export function formatClockBR(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return "00:00:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/**
 * Formata a duração transcorrida entre duas datas/horas ISO
 */
export function formatDuration(
  startStr?: string | null,
  endStr?: string | null,
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
  horaCadastro?: string | null,
): string | null {
  if (!dataCadastro) return null;
  try {
    const cleanDate = dataCadastro.split("T")[0];
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

/**
 * Converte strings de duração estilo GitLab/Jira ("1d 4h 30m", "8h", "30m", "1.5h", "01:30") em minutos totais.
 * Padrão ágil: 1d = 8 horas (480 minutos), 1w = 5 dias (40 horas = 2400 minutos).
 */
export function parseDurationStringToMinutes(input: string | null | undefined): number {
  if (!input || input.trim() === "") return 0;
  const str = input.trim().toLowerCase();

  if (/^\d{1,3}:\d{1,2}$/.test(str)) {
    const [h, m] = str.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  if (/^\d+(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    return Math.round(num * 60);
  }

  let totalMinutes = 0;
  let matched = false;

  const weeksMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:w|sem|semana|semanas)/);
  if (weeksMatch) {
    totalMinutes += parseFloat(weeksMatch[1]) * 40 * 60;
    matched = true;
  }

  const daysMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:d|dia|dias)/);
  if (daysMatch) {
    totalMinutes += parseFloat(daysMatch[1]) * 8 * 60;
    matched = true;
  }

  const hoursMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hora|horas)/);
  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
    matched = true;
  }

  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minuto|minutos)/);
  if (minMatch) {
    totalMinutes += parseFloat(minMatch[1]);
    matched = true;
  }

  if (matched) {
    return Math.round(totalMinutes);
  }

  const fallback = parseFloat(str.replace(/[^\d.]/g, ""));
  return isNaN(fallback) ? 0 : Math.round(fallback * 60);
}

/**
 * Obtém o número da semana ISO-8601 (1 a 53) de uma data.
 */
export function getISOWeekNumber(d: Date | string): number {
  if (!d) return 1;
  const date =
    typeof d === "string"
      ? new Date(d.includes("T") ? d : `${d}T00:00:00`)
      : new Date(d.getTime());
  if (isNaN(date.getTime())) return 1;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    )
  );
}

/**
 * Obtém o ano baseado na semana ISO-8601 de uma data.
 */
export function getISOWeekYear(d: Date | string): number {
  if (!d) return new Date().getFullYear();
  const date =
    typeof d === "string"
      ? new Date(d.includes("T") ? d : `${d}T00:00:00`)
      : new Date(d.getTime());
  if (isNaN(date.getTime())) return new Date().getFullYear();
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  return date.getFullYear();
}

/**
 * Retorna o intervalo de datas (segunda a domingo) para um determinado ano e semana ISO.
 */
export function getWeekDateRange(
  year: number,
  week: number,
): { start: Date; end: Date; formatted: string } {
  const y = year || new Date().getFullYear();
  const w = week || 1;
  const simple = new Date(y, 0, 4);
  const dayOfWeek = (simple.getDay() + 6) % 7;
  const mondayOfWeek1 = new Date(simple);
  mondayOfWeek1.setDate(simple.getDate() - dayOfWeek);

  const monday = new Date(mondayOfWeek1);
  monday.setDate(mondayOfWeek1.getDate() + (w - 1) * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fStart = `${pad2(monday.getDate())}/${pad2(monday.getMonth() + 1)}`;
  const fEnd = `${pad2(sunday.getDate())}/${pad2(sunday.getMonth() + 1)}`;

  return {
    start: monday,
    end: sunday,
    formatted: `${fStart} a ${fEnd}`,
  };
}

export type SprintInfo = {
  ano: number;
  semanaAno: number;
  semanaFormatada: string;
  label: string;
  rangeFormatted: string;
  isCurrent: boolean;
  isNext: boolean;
  isPast: boolean;
};

/**
 * Retorna informações completas do Sprint / Semana atual ou especificada.
 */
export function getSprintInfo(year?: number, week?: number): SprintInfo {
  const now = new Date();
  const targetYear = year ?? getISOWeekYear(now);
  const targetWeek = week ?? getISOWeekNumber(now);
  const range = getWeekDateRange(targetYear, targetWeek);

  const currentYear = getISOWeekYear(now);
  const currentWeek = getISOWeekNumber(now);
  const isCurrent = targetYear === currentYear && targetWeek === currentWeek;
  const isNext = targetYear === currentYear && targetWeek === currentWeek + 1;
  const isPast =
    targetYear < currentYear || (targetYear === currentYear && targetWeek < currentWeek);

  return {
    ano: targetYear,
    semanaAno: targetWeek,
    semanaFormatada: `SEMANA ${targetWeek}/${targetYear}`,
    label: `Semana ${targetWeek}/${targetYear} (${range.formatted})`,
    rangeFormatted: range.formatted,
    isCurrent,
    isNext,
    isPast,
  };
}
