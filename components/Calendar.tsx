"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

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

function normalizeDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES_FULL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const EVENT_COLORS: Record<string, string> = {
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-400",
  danger:  "bg-red-500",
  info:    "bg-sky-500",
  default: "bg-zinc-400",
};

const EVENT_CHIP_COLORS: Record<string, string> = {
  primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  danger:  "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
  info:    "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
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

  const selected = controlledValue !== undefined ? controlledValue : internalSelected;
  const range = rangeValue !== undefined ? rangeValue : internalRange;

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

  // All cells: prev-overflow + current + next-overflow
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

  // ── Event lookup ───────────────────────────────────────────────────────────
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = startOfDay(normalizeDate(ev.date)).toDateString();
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(ev);
  }

  // ── Click handler ──────────────────────────────────────────────────────────
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
  const isRangeEnd   = (date: Date) => rangeMode && range[1] && isSameDay(date, range[1]);

  const s = SIZE[size];

  // ── Week number ────────────────────────────────────────────────────────────
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
      className={twMerge("inline-block select-none", className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className={twMerge("font-semibold text-zinc-800 dark:text-zinc-100", s.header)}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Day headers ── */}
      <div className={twMerge("grid mb-1", showWeekNumbers ? "grid-cols-[auto_repeat(7,minmax(0,1fr))]" : "grid-cols-7")}>
        {showWeekNumbers && <div className={twMerge("text-center font-medium text-zinc-300 dark:text-zinc-600 pb-1", s.dayLabel)} />}
        {dayHeaders.map((d) => (
          <div key={d} className={twMerge("text-center font-medium text-zinc-400 dark:text-zinc-500 pb-1", s.dayLabel)}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ── */}
      <div className="space-y-0.5">
        {rows.map((row, ri) => {
          const weekNum = getWeekNumber(row[0].date);
          return (
            <div
              key={ri}
              className={twMerge("grid", showWeekNumbers ? "grid-cols-[auto_repeat(7,minmax(0,1fr))]" : "grid-cols-7")}
            >
              {showWeekNumbers && (
                <div className={twMerge("flex items-center justify-center text-zinc-300 dark:text-zinc-600 font-mono", s.dayLabel)}>
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
                        ? "bg-indigo-50 dark:bg-indigo-950/40"
                        : "",
                      isStart && rangeMode ? "rounded-l-full" : "",
                      isEnd && rangeMode ? "rounded-r-full" : "",
                    )}
                    onMouseEnter={() => rangeMode && setHoverDate(date)}
                    onMouseLeave={() => rangeMode && setHoverDate(null)}
                  >
                    <button
                      type="button"
                      onClick={() => handleDayClick(date)}
                      disabled={disabled}
                      className={twMerge(
                        "flex items-center justify-center rounded-full font-medium transition-colors",
                        s.cell,
                        disabled
                          ? "opacity-30 cursor-not-allowed"
                          : "cursor-pointer",
                        isHighlighted
                          ? "bg-indigo-600 text-white shadow-sm"
                          : isToday
                            ? "border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
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
