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
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
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

function normalizeDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
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
  sm: { cell: "h-8 w-8 text-xs", header: "text-xs", dayLabel: "text-[10px]", chip: "text-[9px]" },
  md: { cell: "h-9 w-9 text-sm", header: "text-sm", dayLabel: "text-[11px]", chip: "text-[10px]" },
  lg: { cell: "h-11 w-11 text-base", header: "text-base", dayLabel: "text-xs", chip: "text-xs" },
};

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
  size = "md",
  eventDisplay = "dot",
  fillWidth = false,
  compact = false,
  className,
  componentId,
}: CalendarProps) {
  const today = startOfDay(new Date());

  // ── State ──────────────────────────────────────────────────────────────────
  const [internalSelected, setInternalSelected] = useState<Date | null>(defaultValue ?? null);
  const [internalRange, setInternalRange] = useState<[Date | null, Date | null]>([null, null]);
  const [viewYear, setViewYear] = useState((defaultValue ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState((defaultValue ?? new Date()).getMonth());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const monthContainerRef = useRef<HTMLDivElement>(null);
  const yearContainerRef = useRef<HTMLDivElement>(null);

  const selected = controlledValue !== undefined ? controlledValue : internalSelected;
  const range = rangeValue !== undefined ? rangeValue : internalRange;

  useEffect(() => {
    const activeDate = selected ?? (range[0] ?? null) ?? new Date();
    setViewYear(activeDate.getFullYear());
    setViewMonth(activeDate.getMonth());
  }, [selected, range]);

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
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ── Day grid ───────────────────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const rawFirstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const offset = (rawFirstDay - firstDayOfWeek + 7) % 7;
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  const dayHeaders = Array.from({ length: 7 }, (_, i) => DAY_NAMES_FULL[(i + firstDayOfWeek) % 7]);

  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const cells: Array<{ date: Date; isCurrentMonth: boolean }> = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - offset + 1;
    if (dayNum < 1) {
      cells.push({ date: new Date(viewYear, viewMonth - 1, prevMonthDays + dayNum), isCurrentMonth: false });
    } else if (dayNum > daysInMonth) {
      cells.push({ date: new Date(viewYear, viewMonth + 1, dayNum - daysInMonth), isCurrentMonth: false });
    } else {
      cells.push({ date: new Date(viewYear, viewMonth, dayNum), isCurrentMonth: true });
    }
  }

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

  const isRangeStart = (date: Date) => rangeMode && range[0] && isSameDay(date, range[0]);
  const isRangeEnd = (date: Date) => rangeMode && range[1] && isSameDay(date, range[1]);

  const s = SIZE[size];
  const effectiveSize = compact
    ? (size === "lg" ? "md" : "sm")
    : size;
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
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div
      ref={rootRef}
      className={twMerge(fillWidth ? "block w-full select-none" : "inline-block select-none", className)}
      >
      {/* ── Header ── */}
      <div className={twMerge("mb-3 flex items-center gap-2 px-1", compact && "gap-1.5")}>
        <button
          data-component-id={componentId ? `${componentId}.prev-month` : 'erp.calendar.prev-month'}
          type="button"
          onClick={prevMonth}
          className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <div className="relative">
            <button
              data-component-id={componentId ? `${componentId}.month-trigger` : 'erp.calendar.month-trigger'}
              type="button"
              onClick={() => {
                setMonthOpen((current) => !current);
                setYearOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={monthOpen}
              className={twMerge(
                "flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white px-3 py-1.5 text-left font-semibold text-zinc-800 outline-none transition-colors hover:border-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 cursor-pointer",
                compact ? "w-[126px]" : "w-[152px]",
                eff.header,
              )}
            >
              <span className="min-w-0 flex-1 truncate">{MONTH_NAMES[viewMonth]}</span>
              <ChevronDown size={14} className={twMerge("shrink-0 text-zinc-400 transition-transform", monthOpen && "rotate-180")} />
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
              data-component-id={componentId ? `${componentId}.year-trigger` : 'erp.calendar.year-trigger'}
              type="button"
              onClick={() => {
                setYearOpen((current) => !current);
                setMonthOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={yearOpen}
              className={twMerge(
                "flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white px-3 py-1.5 text-left font-semibold text-zinc-800 outline-none transition-colors hover:border-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 cursor-pointer",
                compact ? "w-[80px]" : "w-[96px]",
                eff.header,
              )}
            >
              <span className="min-w-0 flex-1 truncate">{viewYear}</span>
              <ChevronDown size={14} className={twMerge("shrink-0 text-zinc-400 transition-transform", yearOpen && "rotate-180")} />
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
        <button
          data-component-id={componentId ? `${componentId}.next-month` : 'erp.calendar.next-month'}
          type="button"
          onClick={nextMonth}
          className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          aria-label="Próximo mês"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Day headers ── */}
      <div className={twMerge("grid mb-1 gap-1", showWeekNumbers ? "grid-cols-[auto_repeat(7,minmax(0,1fr))]" : "grid-cols-7")}>
        {showWeekNumbers && <div className={twMerge("text-center font-medium text-zinc-300 dark:text-zinc-600 pb-1", eff.dayLabel)} />}
        {dayHeaders.map((d) => (
          <div key={d} className={twMerge("text-center font-bold text-zinc-400 dark:text-zinc-500 pb-1", eff.dayLabel)}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ── */}
      <div className="space-y-1">
        {rows.map((row, ri) => {
          const weekNum = getWeekNumber(row[0].date);
          return (
            <div
              key={ri}
              className={twMerge("grid gap-1", showWeekNumbers ? "grid-cols-[auto_repeat(7,minmax(0,1fr))]" : "grid-cols-7")}
            >
              {showWeekNumbers && (
                <div className={twMerge("flex items-center justify-center text-zinc-300 dark:text-zinc-600 font-mono", eff.dayLabel)}>
                  {weekNum}
                </div>
              )}
              {row.map(({ date, isCurrentMonth }, ci) => {
                const isToday = isSameDay(date, today);
                const isSelected = !rangeMode && selected ? isSameDay(date, selected) : false;
                const isStart = isRangeStart(date) ?? false;
                const isEnd = isRangeEnd(date) ?? false;
                const inRange = isInRange(date);
                const disabled = checkDisabled(date);
                const dayEvents = eventsByDay.get(startOfDay(date).toDateString()) ?? [];
                const dayNum = date.getDate();

                const isHighlighted = isSelected || isStart || isEnd;

                return (
                  <div
                    key={`${ri}-${ci}`}
                    className={twMerge(
                      "relative flex flex-col items-center",
                      eventDisplay === "chip" ? "pb-1" : "",
                      inRange && !isStart && !isEnd
                        ? "bg-blue-50 dark:bg-blue-950/40"
                        : "",
                      isStart && rangeMode ? "rounded-l-full" : "",
                      isEnd && rangeMode ? "rounded-r-full" : "",
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
                        "flex w-full aspect-square items-center justify-center rounded-xl font-bold transition-all",
                        fillWidth ? "h-auto" : eff.cell,
                        disabled
                          ? "opacity-25 cursor-not-allowed"
                          : "cursor-pointer",
                        isHighlighted
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                          : isToday
                            ? "border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-black"
                            : isCurrentMonth
                              ? "text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              : "text-zinc-300 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900",
                      )}
                    >
                      {dayNum}
                    </button>

                    {/* Event indicators */}
                    {dayEvents.length > 0 && (
                      eventDisplay === "dot" ? (
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
                      )
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
