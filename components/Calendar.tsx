"use client";

import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CalendarEventDot = {
  color?: "primary" | "success" | "warning" | "danger" | "info" | "default";
};

export type CalendarEvent = {
  id: string;
  date: Date | string;
  title: string;
  color?: "primary" | "success" | "warning" | "danger" | "info" | "default";
  icon?: LucideIcon;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
};

export type CalendarPreset = {
  label: string;
  /** Returns a single Date or a [start, end] range */
  getValue: () => Date | [Date, Date];
};

export type CalendarProps = {
  /** Controlled selected date */
  value?: Date | null;
  /** Uncontrolled default selected date */
  defaultValue?: Date | null;
  /** Called when a day is clicked */
  onChange?: (date: Date) => void;
  /** Events to show as dots/badges on days */
  events?: CalendarEvent[];
  /** First day of week: 0=Sunday, 1=Monday */
  firstDayOfWeek?: 0 | 1;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** Disable individual dates */
  disabledDate?: (date: Date) => boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Allow selecting a range [start, end] */
  rangeMode?: boolean;
  /** Controlled range value */
  rangeValue?: [Date | null, Date | null];
  /** Called when range changes */
  onRangeChange?: (range: [Date | null, Date | null]) => void;
  /** Number of months rendered side by side (1 or 2, shadcn/ui dual calendar pattern) */
  numberOfMonths?: 1 | 2;
  /** Quick date/range presets shown in a sidebar/footer */
  presets?: CalendarPreset[];
  /** Show compact range status footer when rangeMode is enabled (default true) */
  showRangeFooter?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show compact dot per event or small chips */
  eventDisplay?: "dot" | "chip";
  /** Make the calendar expand to the available width */
  fillWidth?: boolean;
  /** Compact layout for inputs/popovers */
  compact?: boolean;
  className?: string;
  componentId?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(d: Date, start: Date, end: Date) {
  const t = d.getTime();
  return t > start.getTime() && t < end.getTime();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatPtBr(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function diffDaysInclusive(start: Date, end: Date): number {
  const s = startOfDay(start);
  const e = startOfDay(end);
  return Math.round(Math.abs(e.getTime() - s.getTime()) / 86400000) + 1;
}

function normalizeDate(d: Date | string): Date {
  if (typeof d === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day);
    }
    return new Date(d);
  }
  return d;
}

function computeAnchorMonth(
  anchorDate: Date,
  endDate: Date | null | undefined,
  numberOfMonths: 1 | 2,
  today: Date,
  maxDate?: Date,
): { year: number; month: number } {
  const aYear = anchorDate.getFullYear();
  const aMonth = anchorDate.getMonth();
  if (numberOfMonths !== 2) {
    return { year: aYear, month: aMonth };
  }
  const capDate = maxDate && maxDate < today ? maxDate : today;
  const sameMonthAsCap =
    aYear === capDate.getFullYear() &&
    aMonth === capDate.getMonth() &&
    (!endDate || (endDate.getFullYear() === aYear && endDate.getMonth() === aMonth));

  if (sameMonthAsCap) {
    return aMonth === 0 ? { year: aYear - 1, month: 11 } : { year: aYear, month: aMonth - 1 };
  }
  return { year: aYear, month: aMonth };
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES_FULL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const EVENT_COLORS: Record<string, string> = {
  primary: "bg-blue-600",
  success: "bg-emerald-500",
  warning: "bg-amber-400",
  danger: "bg-red-500",
  info: "bg-sky-500",
  default: "bg-zinc-400",
};

const EVENT_CHIP_COLORS: Record<string, string> = {
  primary: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
  default: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const SIZE = {
  sm: { cell: "h-7 w-7 sm:h-8 sm:w-8 text-xs", header: "text-xs", dayLabel: "text-[10px]", chip: "text-[9px]" },
  md: { cell: "h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm", header: "text-xs sm:text-sm", dayLabel: "text-[10px] sm:text-[11px]", chip: "text-[9px] sm:text-[10px]" },
  lg: { cell: "h-9 w-9 sm:h-11 sm:w-11 text-sm sm:text-base", header: "text-sm sm:text-base", dayLabel: "text-[11px] sm:text-xs", chip: "text-[10px] sm:text-xs" },
};

function buildMonthRows(year: number, month: number, firstDayOfWeek: 0 | 1) {
  const daysInMonth = getDaysInMonth(year, month);
  const rawFirstDay = getFirstDayOfMonth(year, month);
  const offset = (rawFirstDay - firstDayOfWeek + 7) % 7;
  const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const cells: Array<{ date: Date; isCurrentMonth: boolean }> = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - offset + 1;
    if (dayNum < 1) {
      cells.push({ date: new Date(year, month - 1, prevMonthDays + dayNum), isCurrentMonth: false });
    } else if (dayNum > daysInMonth) {
      cells.push({ date: new Date(year, month + 1, dayNum - daysInMonth), isCurrentMonth: false });
    } else {
      cells.push({ date: new Date(year, month, dayNum), isCurrentMonth: true });
    }
  }

  const rows: Array<Array<{ date: Date; isCurrentMonth: boolean }>> = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Calendar({
  value: controlledValue,
  defaultValue,
  onChange,
  events = [],
  firstDayOfWeek = 0,
  showWeekNumbers = false,
  disabledDate,
  minDate,
  maxDate,
  rangeMode = false,
  rangeValue,
  onRangeChange,
  numberOfMonths = 1,
  presets,
  showRangeFooter = true,
  size = "md",
  eventDisplay = "dot",
  fillWidth = false,
  compact = false,
  className,
  componentId,
}: CalendarProps) {
  const today = startOfDay(new Date());

  // ── State ──────────────────────────────────────────────────────────────────
  const initialBaseDate = controlledValue ?? defaultValue ?? rangeValue?.[0] ?? today;
  const initialAnchor = computeAnchorMonth(initialBaseDate, rangeValue?.[1], numberOfMonths, today, maxDate);
  const [internalSelected, setInternalSelected] = useState<Date | null>(defaultValue ?? null);
  const [internalRange, setInternalRange] = useState<[Date | null, Date | null]>([null, null]);
  const [viewYear, setViewYear] = useState(initialAnchor.year);
  const [viewMonth, setViewMonth] = useState(initialAnchor.month);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const monthContainerRef = useRef<HTMLDivElement>(null);
  const yearContainerRef = useRef<HTMLDivElement>(null);

  const selected = controlledValue !== undefined ? controlledValue : internalSelected;
  const range = rangeValue !== undefined ? rangeValue : internalRange;

  const syncKey = rangeMode
    ? `${range?.[0]?.getTime() ?? ""}:${range?.[1]?.getTime() ?? ""}:${numberOfMonths}`
    : `${selected?.getTime() ?? ""}:${numberOfMonths}`;
  const [prevSyncKey, setPrevSyncKey] = useState<string>(syncKey);

  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    const nextAnchorSource = rangeMode ? range?.[0] : selected;
    if (nextAnchorSource) {
      const anchored = computeAnchorMonth(nextAnchorSource, range?.[1], numberOfMonths, today, maxDate);
      setViewYear(anchored.year);
      setViewMonth(anchored.month);
    }
  }

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setMonthOpen(false);
        setYearOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (monthOpen) {
      const timer = setTimeout(() => {
        const container = monthContainerRef.current;
        const activeBtn = container?.querySelector('[data-active="true"]') as HTMLElement | null;
        if (container && activeBtn) {
          container.scrollTop = activeBtn.offsetTop - container.offsetHeight / 2 + activeBtn.offsetHeight / 2;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [monthOpen]);

  useEffect(() => {
    if (yearOpen) {
      const timer = setTimeout(() => {
        const container = yearContainerRef.current;
        const activeBtn = container?.querySelector('[data-active="true"]') as HTMLElement | null;
        if (container && activeBtn) {
          container.scrollTop = activeBtn.offsetTop - container.offsetHeight / 2 + activeBtn.offsetHeight / 2;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [yearOpen]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const dayHeaders = Array.from({ length: 7 }, (_, i) => DAY_NAMES_FULL[(i + firstDayOfWeek) % 7]);

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = startOfDay(normalizeDate(ev.date)).toDateString();
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(ev);
  }

  const handleDayClick = (date: Date) => {
    const isDisabled = checkDisabled(date);
    if (isDisabled) return;

    if (rangeMode) {
      const [start, end] = range;
      let newRange: [Date | null, Date | null];
      if (!start || (start && end)) {
        newRange = [date, null];
      } else {
        newRange = date < start ? [date, start] : [start, date];
      }
      if (onRangeChange) onRangeChange(newRange);
      else setInternalRange(newRange);
    } else {
      if (onChange) onChange(date);
      else setInternalSelected(date);
    }
  };

  const handlePresetClick = (preset: CalendarPreset) => {
    const val = preset.getValue();
    if (Array.isArray(val)) {
      const [start, end] = val;
      if (onRangeChange) onRangeChange([start, end]);
      else setInternalRange([start, end]);
      const anchored = computeAnchorMonth(start, end, numberOfMonths, today, maxDate);
      setViewYear(anchored.year);
      setViewMonth(anchored.month);
    } else {
      if (onChange) onChange(val);
      else setInternalSelected(val);
      setViewYear(val.getFullYear());
      setViewMonth(val.getMonth());
    }
  };

  const isPresetActive = (preset: CalendarPreset): boolean => {
    try {
      const val = preset.getValue();
      if (Array.isArray(val)) {
        return Boolean(
          rangeMode &&
            range[0] &&
            range[1] &&
            isSameDay(range[0], val[0]) &&
            isSameDay(range[1], val[1]),
        );
      }
      return Boolean(!rangeMode && selected && isSameDay(selected, val));
    } catch {
      return false;
    }
  };

  const checkDisabled = (date: Date) => {
    if (disabledDate?.(date)) return true;
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > startOfDay(maxDate)) return true;
    return false;
  };

  const isInRange = (date: Date) => {
    if (!rangeMode) return false;
    const [start, end] = range;
    const effectiveEnd = end ?? hoverDate;
    if (!start || !effectiveEnd) return false;
    const s = start < effectiveEnd ? start : effectiveEnd;
    const e = start < effectiveEnd ? effectiveEnd : start;
    return isBetween(date, s, e);
  };

  const isRangeStart = (date: Date) => {
    if (!rangeMode || !range[0]) return false;
    const effectiveEnd = range[1] ?? hoverDate;
    if (effectiveEnd && effectiveEnd < range[0]) {
      return isSameDay(date, effectiveEnd);
    }
    return isSameDay(date, range[0]);
  };

  const isRangeEnd = (date: Date) => {
    if (!rangeMode || !range[0]) return false;
    const effectiveEnd = range[1] ?? hoverDate;
    if (!effectiveEnd) return false;
    if (effectiveEnd < range[0]) {
      return isSameDay(date, range[0]);
    }
    return isSameDay(date, effectiveEnd);
  };

  const s = SIZE[size];
  const effectiveSize = compact ? (size === "lg" ? "md" : "sm") : size;
  const eff = SIZE[effectiveSize];
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const start = Math.max(1900, currentYear - 50);
    const end = Math.min(2100, currentYear + 50);
    const years: number[] = [];
    for (let year = start; year <= end; year += 1) years.push(year);
    return years;
  }, []);

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const renderMonthDropdowns = () => (
    <div className="flex min-w-0 items-center justify-center gap-1.5">
      <div className="relative">
        <button
          data-component-id={componentId ? `${componentId}.month-trigger` : "erp.calendar.month-trigger"}
          type="button"
          onClick={() => {
            setMonthOpen((current) => !current);
            setYearOpen(false);
          }}
          aria-haspopup="listbox"
          aria-expanded={monthOpen}
          className={twMerge(
            "flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white px-2.5 py-1.5 text-left font-semibold text-zinc-800 outline-none transition-colors hover:border-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 cursor-pointer",
            compact ? "w-[108px] sm:w-[118px]" : "w-[116px] sm:w-[144px]",
            eff.header,
          )}
        >
          <span className="min-w-0 flex-1 truncate">{MONTH_NAMES[viewMonth]}</span>
          <ChevronDown size={13} className={twMerge("shrink-0 text-zinc-400 transition-transform", monthOpen && "rotate-180")} />
        </button>
        {monthOpen && (
          <div className="absolute left-0 top-full z-[60] mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div ref={monthContainerRef} className="max-h-56 overflow-y-auto p-1">
              {MONTH_NAMES.map((month, index) => (
                <button
                  data-component-id={componentId ? `${componentId}.month-${index}` : `erp.calendar.month-${index}`}
                  key={month}
                  type="button"
                  data-active={index === viewMonth ? "true" : undefined}
                  onClick={() => {
                    setViewMonth(index);
                    setMonthOpen(false);
                  }}
                  className={twMerge(
                    "flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs transition-colors cursor-pointer",
                    index === viewMonth
                      ? "bg-blue-600 text-white font-bold"
                      : "text-zinc-700 hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                  )}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          data-component-id={componentId ? `${componentId}.year-trigger` : "erp.calendar.year-trigger"}
          type="button"
          onClick={() => {
            setYearOpen((current) => !current);
            setMonthOpen(false);
          }}
          aria-haspopup="listbox"
          aria-expanded={yearOpen}
          className={twMerge(
            "flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white px-2.5 py-1.5 text-left font-semibold text-zinc-800 outline-none transition-colors hover:border-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 cursor-pointer",
            compact ? "w-[72px] sm:w-[78px]" : "w-[80px] sm:w-[92px]",
            eff.header,
          )}
        >
          <span className="min-w-0 flex-1 truncate">{viewYear}</span>
          <ChevronDown size={13} className={twMerge("shrink-0 text-zinc-400 transition-transform", yearOpen && "rotate-180")} />
        </button>
        {yearOpen && (
          <div className="absolute right-0 top-full z-[60] mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div ref={yearContainerRef} className="max-h-56 overflow-y-auto p-1">
              {yearOptions.map((year) => (
                <button
                  data-component-id={componentId ? `${componentId}.year-${year}` : `erp.calendar.year-${year}`}
                  key={year}
                  type="button"
                  data-active={year === viewYear ? "true" : undefined}
                  onClick={() => {
                    setViewYear(year);
                    setYearOpen(false);
                  }}
                  className={twMerge(
                    "flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs transition-colors cursor-pointer",
                    year === viewYear
                      ? "bg-blue-600 text-white font-bold"
                      : "text-zinc-700 hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMonthGrid = (mYear: number, mMonth: number, panelIndex: 0 | 1) => {
    const rows = buildMonthRows(mYear, mMonth, firstDayOfWeek);
    const isDual = numberOfMonths === 2;

    return (
      <div className={twMerge("min-w-0 flex-1", panelIndex === 1 && "hidden md:block")}>
        {/* ── Per-month Header ── */}
        <div className={twMerge("mb-2.5 flex items-center justify-between gap-1.5 px-0.5 min-h-[34px]")}>
          {panelIndex === 0 ? (
            <>
              <button
                data-component-id={componentId ? `${componentId}.prev-month` : "erp.calendar.prev-month"}
                type="button"
                onClick={prevMonth}
                className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={16} />
              </button>
              {renderMonthDropdowns()}
              <button
                data-component-id={componentId ? `${componentId}.next-month` : "erp.calendar.next-month"}
                type="button"
                onClick={nextMonth}
                className={twMerge(
                  "shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer",
                  isDual && "md:invisible md:pointer-events-none",
                )}
                aria-label="Próximo mês"
              >
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <>
              <span className="w-7 shrink-0" aria-hidden="true" />
              <div className={twMerge("flex items-center justify-center font-semibold text-zinc-800 dark:text-zinc-100", eff.header)}>
                {MONTH_NAMES[mMonth]} <span className="ml-1 text-zinc-400 dark:text-zinc-500 font-medium">{mYear}</span>
              </div>
              <button
                data-component-id={componentId ? `${componentId}.next-month-2` : "erp.calendar.next-month-2"}
                type="button"
                onClick={nextMonth}
                className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                aria-label="Próximo mês"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* ── Day headers ── */}
        <div className={twMerge("grid mb-1", showWeekNumbers ? "grid-cols-[auto_repeat(7,minmax(0,1fr))]" : "grid-cols-7")}>
          {showWeekNumbers && <div className={twMerge("text-center font-medium text-zinc-300 dark:text-zinc-600 pb-1", eff.dayLabel)} />}
          {dayHeaders.map((d) => (
            <div key={d} className={twMerge("text-center font-bold text-zinc-400 dark:text-zinc-500 pb-1", eff.dayLabel)}>
              {d}
            </div>
          ))}
        </div>

        {/* ── Day grid (gap-x-0 for continuous range band) ── */}
        <div className="space-y-1">
          {rows.map((row, ri) => {
            const weekNum = getWeekNumber(row[0].date);
            return (
              <div
                key={ri}
                className={twMerge("grid gap-x-0", showWeekNumbers ? "grid-cols-[auto_repeat(7,minmax(0,1fr))]" : "grid-cols-7")}
              >
                {showWeekNumbers && (
                  <div className={twMerge("flex items-center justify-center pr-1 text-zinc-300 dark:text-zinc-600 font-mono", eff.dayLabel)}>
                    {weekNum}
                  </div>
                )}
                {row.map(({ date, isCurrentMonth }, ci) => {
                  const isToday = isSameDay(date, today);
                  const isSelected = !rangeMode && selected ? isSameDay(date, selected) : false;
                  const isEffectiveStart = isRangeStart(date);
                  const isEffectiveEnd = isRangeEnd(date);
                  const isCommittedEnd = Boolean(rangeMode && range[1] && isSameDay(date, range[1]));
                  const isCommittedStart = Boolean(rangeMode && range[0] && isSameDay(date, range[0]));
                  const inRange = isInRange(date);
                  const disabled = checkDisabled(date);
                  const dayEvents = eventsByDay.get(startOfDay(date).toDateString()) ?? [];
                  const dayNum = date.getDate();

                  const isHighlighted = isSelected || isCommittedStart || isCommittedEnd;
                  const isSameStartAndEnd = isEffectiveStart && isEffectiveEnd;

                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={twMerge(
                        "relative flex flex-col items-center px-0.5",
                        eventDisplay === "chip" ? "pb-1" : "",
                        inRange && "bg-blue-50/90 dark:bg-blue-950/45",
                        isEffectiveStart && !isSameStartAndEnd && (inRange || range[1] || hoverDate) && "bg-gradient-to-r from-transparent via-blue-50/90 to-blue-50/90 dark:via-blue-950/45 dark:to-blue-950/45 rounded-l-xl",
                        isEffectiveEnd && !isSameStartAndEnd && "bg-gradient-to-l from-transparent via-blue-50/90 to-blue-50/90 dark:via-blue-950/45 dark:to-blue-950/45 rounded-r-xl",
                      )}
                      onMouseEnter={() => rangeMode && setHoverDate(date)}
                      onMouseLeave={() => rangeMode && setHoverDate(null)}
                    >
                      <button
                        data-component-id={componentId ? `${componentId}.day-${toIso(date)}` : `erp.calendar.day-${toIso(date)}`}
                        type="button"
                        onClick={() => handleDayClick(date)}
                        disabled={disabled}
                        className={twMerge(
                          "relative z-10 flex aspect-square items-center justify-center rounded-xl font-bold transition-all tabular-nums",
                          fillWidth ? "w-full h-auto" : eff.cell,
                          disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
                          isHighlighted
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                            : isToday
                              ? "border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-black"
                              : inRange
                                ? "text-blue-800 dark:text-blue-200 hover:bg-blue-100/80 dark:hover:bg-blue-900/50"
                                : isCurrentMonth
                                  ? "text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  : "text-zinc-300 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900",
                        )}
                      >
                        {dayNum}
                      </button>

                      {/* Event indicators */}
                      {dayEvents.length > 0 &&
                        (eventDisplay === "dot" ? (
                          <div className="flex gap-0.5 mt-0.5 justify-center">
                            {dayEvents.slice(0, 3).map((ev, ei) => (
                              <span
                                key={ei}
                                className={twMerge("block rounded-full w-1 h-1", EVENT_COLORS[ev.color ?? "default"])}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-full px-0.5 space-y-0.5 mt-0.5">
                            {dayEvents.slice(0, 2).map((ev, ei) => (
                              <div
                                key={ei}
                                className={twMerge(
                                  "truncate rounded px-1 leading-tight font-medium w-full text-center",
                                  s.chip,
                                  EVENT_CHIP_COLORS[ev.color ?? "default"],
                                )}
                              >
                                {ev.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className={twMerge("text-center text-zinc-400 font-medium", s.chip)}>
                                +{dayEvents.length - 2}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  return (
    <div
      ref={rootRef}
      data-component-id={componentId}
      className={twMerge(
        fillWidth
          ? "flex flex-col sm:flex-row gap-3.5 w-full select-none"
          : "inline-flex flex-col sm:flex-row gap-3.5 max-w-full select-none",
        className,
      )}
    >
      {/* Optional Presets Sidebar */}
      {presets && presets.length > 0 && (
        <div className="flex sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 pb-2 sm:pb-0 sm:pr-3 overflow-x-auto sm:min-w-[148px]">
          <p className="hidden sm:block px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Atalhos rápidos
          </p>
          {presets.map((preset, idx) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={twMerge(
                  "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30"
                    : "font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Grids (1 or 2 months) ── */}
        <div className={twMerge("flex flex-col md:flex-row", numberOfMonths === 2 && "md:gap-5")}>
          {renderMonthGrid(viewYear, viewMonth, 0)}
          {numberOfMonths === 2 && renderMonthGrid(secondYear, secondMonth, 1)}
        </div>

        {/* ── Range Selection Feedback Footer ── */}
        {rangeMode && showRangeFooter && (
          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 px-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {range[0] && range[1] ? (
              <>
                <span className="font-medium text-zinc-700 dark:text-zinc-200 tabular-nums">
                  {formatPtBr(range[0])} <span className="text-zinc-400 mx-0.5">→</span> {formatPtBr(range[1])}
                </span>
                <span className="rounded-md bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
                  {diffDaysInclusive(range[0], range[1])} {diffDaysInclusive(range[0], range[1]) === 1 ? "dia" : "dias"}
                </span>
              </>
            ) : range[0] ? (
              <>
                <span className="font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                  Início: {formatPtBr(range[0])}
                </span>
                <span className="animate-pulse font-medium text-amber-600 dark:text-amber-400">
                  Selecione a data final
                </span>
              </>
            ) : (
              <span>Clique na data inicial e depois na data final do período</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
