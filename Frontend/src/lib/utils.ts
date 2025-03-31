import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, parseISO } from 'date-fns';
// Import only the necessary function from date-fns-tz
import { toZonedTime } from 'date-fns-tz';
import { isSameDay } from "date-fns";

import { CalendarEvent, EventColor } from "../types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to generate potential 30-min slots for a day
export function generateTimeSlots(date: Date): { startTime: Date; endTime: Date }[] {
  const slots: { startTime: Date; endTime: Date }[] = [];
  // Ensure the base date has seconds and milliseconds zeroed out for consistency
  const baseDate = setSeconds(setMilliseconds(date, 0), 0);

  // Morning: 7:00 to 11:30
  for (let hour = 7; hour < 12; hour++) {
    const start1 = setMinutes(setHours(baseDate, hour), 0);
    const end1 = addMinutes(start1, 30);
    slots.push({ startTime: start1, endTime: end1 });

    const start2 = setMinutes(setHours(baseDate, hour), 30);
    const end2 = addMinutes(start2, 30);
    slots.push({ startTime: start2, endTime: end2 });
  }

  // Afternoon: 13:00 to 17:30
  for (let hour = 13; hour < 18; hour++) {
    const start1 = setMinutes(setHours(baseDate, hour), 0);
    const end1 = addMinutes(start1, 30);
    slots.push({ startTime: start1, endTime: end1 });

    const start2 = setMinutes(setHours(baseDate, hour), 30);
    const end2 = addMinutes(start2, 30);
    slots.push({ startTime: start2, endTime: end2 });
  }

  return slots;
}

// Format Date object to "HH:mm" (local time)
export function formatTime(date: Date): string {
   // format uses the local timezone interpretation of the Date object by default
   return format(date, 'HH:mm');
}

// Format Date object to ISO string required by API ("YYYY-MM-DDTHH:mm:ssZ")
export function formatToApiIsoString(date: Date): string {
    // The Date object's internal value is UTC.
    // Formatting with 'Z' correctly outputs the UTC representation.
    // No need for zonedTimeToUtc here if 'date' correctly represents the local instant.
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

// Parse ISO string (assumed UTC like "YYYY-MM-DDTHH:mm:ssZ" or "YYYY-MM-DDTHH:mm:ss")
// from API to a Date object representing the equivalent local time for display.
export function parseApiIsoString(isoString: string): Date {
    // parseISO creates a Date object representing the UTC instant
    const utcDate = parseISO(isoString);
    // Get the user's current time zone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Convert the UTC Date object to a Date object representing the time in the user's local timezone
    return toZonedTime(utcDate, timeZone);
}

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color?: EventColor | string): string {
  const eventColor = color || "sky";

  switch (eventColor) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8";
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8";
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8";
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8";
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8";
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
  }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(
  isFirstDay: boolean,
  isLastDay: boolean
): string {
  if (isFirstDay && isLastDay) {
    return "rounded"; // Both ends rounded
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none"; // Only left end rounded
  } else if (isLastDay) {
    return "rounded-r rounded-l-none"; // Only right end rounded
  } else {
    return "rounded-none"; // No rounded corners
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      return isSameDay(day, eventStart);
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    );
  });
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (day > eventStart && day < eventEnd)
      );
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function getRandomEventColor(): EventColor {
  const colors: EventColor[] = [
    "sky",
    "amber",
    "violet",
    "rose",
    "emerald",
    "orange",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
