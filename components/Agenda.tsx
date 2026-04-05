"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { Clock, MapPin, Users, type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AgendaEventColor =
  | "primary" | "success" | "warning" | "danger" | "info" | "default";

export type AgendaEventStatus =
  | "confirmed" | "tentative" | "cancelled";

export type AgendaAttendee = {
  name: string;
  avatarSrc?: string;
  initials?: string;
  /** RSVP status */
  status?: "accepted" | "declined" | "pending";
};

export type AgendaEvent = {
  id: string;
  title: string;
  /** ISO date string or Date — sets which day the event appears */
  date: Date | string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  color?: AgendaEventColor;
  icon?: LucideIcon;
  attendees?: AgendaAttendee[];
  status?: AgendaEventStatus;
  /** Called when the event row is clicked */
  onClick?: (event: AgendaEvent) => void;
};

export type AgendaProps = {
  events: AgendaEvent[];
  /** Show events starting from this date (defaults to today) */
  startDate?: Date;
  /** How many days ahead to show. 0 = all events */
  daysAhead?: number;
  /** Group label format: 'relative' = "Hoje / Amanhã / …", 'date' = "5 de abril" */
  dateFormat?: "relative" | "date" | "both";
  /** Show the time column */
  showTime?: boolean;
  /** Show location */
  showLocation?: boolean;
  /** Show attendee avatars */
  showAttendees?: boolean;
  /** Message shown when no events */
  emptyMessage?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
  componentId?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function normalizeDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DAY_FULL    = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function formatGroupLabel(date: Date, today: Date, mode: AgendaProps["dateFormat"]): string {
  const diffMs = startOfDay(date).getTime() - startOfDay(today).getTime();
  const diffDays = Math.round(diffMs / 86400000);

  let relative = "";
  if (diffDays === 0) relative = "Hoje";
  else if (diffDays === 1) relative = "Amanhã";
  else if (diffDays === -1) relative = "Ontem";
  else if (diffDays > 1 && diffDays < 7) relative = DAY_FULL[date.getDay()].charAt(0).toUpperCase() + DAY_FULL[date.getDay()].slice(1);

  const absolute = `${date.getDate()} de ${MONTH_SHORT[date.getMonth()]}${date.getFullYear() !== today.getFullYear() ? ` de ${date.getFullYear()}` : ""}`;

  if (mode === "relative") return relative || absolute;
  if (mode === "date") return `${date.getDate()} de ${MONTH_SHORT[date.getMonth()]}`;
  // both
  return relative ? `${relative} · ${absolute}` : absolute;
}

const COLOR_BAR: Record<AgendaEventColor, string> = {
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-400",
  danger:  "bg-red-500",
  info:    "bg-sky-500",
  default: "bg-zinc-300 dark:bg-zinc-600",
};

const COLOR_BG: Record<AgendaEventColor, string> = {
  primary: "bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50",
  success: "bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50",
  warning: "bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-950/50",
  danger:  "bg-red-50 dark:bg-red-950/30 hover:bg-red-100/60 dark:hover:bg-red-950/50",
  info:    "bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100/60 dark:hover:bg-sky-950/50",
  default: "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800",
};

const COLOR_ICON: Record<AgendaEventColor, string> = {
  primary: "text-indigo-600 dark:text-indigo-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger:  "text-red-600 dark:text-red-400",
  info:    "text-sky-600 dark:text-sky-400",
  default: "text-zinc-500 dark:text-zinc-400",
};

const STATUS_STYLE: Record<NonNullable<AgendaEventStatus>, string> = {
  confirmed: "",
  tentative: "opacity-70 italic",
  cancelled: "opacity-40 line-through",
};

// ── Attendee mini avatar ──────────────────────────────────────────────────────

function AttendeeAvatar({ att }: { att: AgendaAttendee }) {
  const rsvpRing =
    att.status === "accepted"  ? "ring-2 ring-emerald-400" :
    att.status === "declined"  ? "ring-2 ring-red-400" :
    "";
  return (
    <span
      title={att.name}
      className={twMerge(
        "inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-[9px] font-bold text-indigo-700 dark:text-indigo-200 shrink-0",
        rsvpRing,
      )}
    >
      {att.avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={att.avatarSrc} alt={att.name} className="w-full h-full object-cover rounded-full" />
      ) : (
        (att.initials ?? att.name.slice(0, 2).toUpperCase())
      )}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Agenda({
  events,
  startDate,
  daysAhead = 0,
  dateFormat = "both",
  showTime = true,
  showLocation = true,
  showAttendees = true,
  emptyMessage = "Nenhum evento programado.",
  size = "md",
  className,
  componentId,
}: AgendaProps) {
  const today = startOfDay(new Date());
  const anchor = startDate ? startOfDay(startDate) : today;

  // Filter & group events
  const filtered = events
    .map((ev) => ({ ev, day: startOfDay(normalizeDate(ev.date)) }))
    .filter(({ day }) => {
      if (day < anchor) return false;
      if (daysAhead > 0) {
        const cutoff = new Date(anchor);
        cutoff.setDate(cutoff.getDate() + daysAhead);
        if (day >= cutoff) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dayDiff = a.day.getTime() - b.day.getTime();
      if (dayDiff !== 0) return dayDiff;
      // Secondary sort by startTime string
      return (a.ev.startTime ?? "").localeCompare(b.ev.startTime ?? "");
    });

  // Group by day
  const groups = new Map<string, { day: Date; events: AgendaEvent[] }>();
  for (const { ev, day } of filtered) {
    const key = day.toDateString();
    if (!groups.has(key)) groups.set(key, { day, events: [] });
    groups.get(key)!.events.push(ev);
  }

  const groupList = [...groups.values()];

  const padding = size === "sm" ? "px-3 py-2" : size === "lg" ? "px-5 py-4" : "px-4 py-3";
  const titleSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const metaSize = size === "sm" ? "text-[10px]" : "text-xs";
  const headerSize = size === "sm" ? "text-[10px]" : "text-xs";

  if (groupList.length === 0) {
    return (
      <div
        className={twMerge("flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-500 text-sm", className)}
        {...(componentId ? { "data-component-id": componentId } : {})}
      >
        <Clock size={28} className="mb-2 opacity-40" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={twMerge("space-y-5", className)}
      {...(componentId ? { "data-component-id": componentId } : {})}
    >
      {groupList.map(({ day, events: dayEvents }) => (
        <div key={day.toDateString()}>
          {/* Day label */}
          <div className="flex items-center gap-2 mb-2">
            <div className={twMerge(
              "flex-shrink-0 flex items-center justify-center rounded-lg font-bold tabular-nums",
              size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm",
              isSameDay(day, today)
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200",
            )}>
              {day.getDate()}
            </div>
            <span className={twMerge(
              "font-semibold",
              headerSize,
              isSameDay(day, today)
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-500 dark:text-zinc-400",
            )}>
              {formatGroupLabel(day, today, dateFormat)}
            </span>
            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          </div>

          {/* Events */}
          <div className="space-y-1.5 ml-10">
            {dayEvents.map((ev) => {
              const color = ev.color ?? "default";
              const Icon = ev.icon;
              const statusClass = STATUS_STYLE[ev.status ?? "confirmed"];

              return (
                <div
                  key={ev.id}
                  role={ev.onClick ? "button" : undefined}
                  tabIndex={ev.onClick ? 0 : undefined}
                  onClick={() => ev.onClick?.(ev)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") ev.onClick?.(ev); }}
                  className={twMerge(
                    "flex items-start gap-3 rounded-xl border border-transparent transition-colors",
                    padding,
                    COLOR_BG[color],
                    ev.onClick ? "cursor-pointer" : "",
                    statusClass,
                  )}
                >
                  {/* Color bar */}
                  <div className={twMerge("shrink-0 w-1 self-stretch rounded-full", COLOR_BAR[color])} />

                  {/* Icon or time */}
                  {Icon ? (
                    <div className={twMerge("shrink-0 mt-0.5", COLOR_ICON[color])}>
                      <Icon size={size === "lg" ? 18 : 14} strokeWidth={1.75} />
                    </div>
                  ) : showTime && (ev.startTime || ev.allDay) ? (
                    <div className={twMerge("shrink-0 tabular-nums text-zinc-400 dark:text-zinc-500 mt-px font-medium w-14 text-right", metaSize)}>
                      {ev.allDay ? "dia todo" : ev.startTime}
                    </div>
                  ) : null}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={twMerge("font-semibold text-zinc-800 dark:text-zinc-100 leading-snug", titleSize)}>
                        {ev.title}
                      </span>
                      {showTime && ev.startTime && ev.endTime && (
                        <span className={twMerge("shrink-0 text-zinc-400 dark:text-zinc-500 whitespace-nowrap", metaSize)}>
                          {ev.startTime}–{ev.endTime}
                        </span>
                      )}
                    </div>

                    {ev.description && (
                      <p className={twMerge("text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug line-clamp-2", metaSize)}>
                        {ev.description}
                      </p>
                    )}

                    {(showLocation && ev.location) || (showAttendees && ev.attendees?.length) ? (
                      <div className={twMerge("flex flex-wrap items-center gap-3 mt-1.5", metaSize)}>
                        {showLocation && ev.location && (
                          <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                            <MapPin size={10} strokeWidth={2} />
                            {ev.location}
                          </span>
                        )}
                        {showAttendees && ev.attendees && ev.attendees.length > 0 && (
                          <span className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                            <Users size={10} strokeWidth={2} />
                            <span className="flex items-center -space-x-1">
                              {ev.attendees.slice(0, 4).map((att, i) => (
                                <AttendeeAvatar key={i} att={att} />
                              ))}
                              {ev.attendees.length > 4 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[9px] font-bold text-zinc-500 dark:text-zinc-300">
                                  +{ev.attendees.length - 4}
                                </span>
                              )}
                            </span>
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
