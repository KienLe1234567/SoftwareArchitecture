import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, parseISO } from 'date-fns';
// Import only the necessary function from date-fns-tz
import { toZonedTime } from 'date-fns-tz';

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