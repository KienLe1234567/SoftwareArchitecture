"use client";

import { useMemo } from "react";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { differenceInMinutes, format, getMinutes, isPast } from "date-fns";

import { cn, getBorderRadiusClasses, getEventColorClasses } from "@/lib/utils";

import { CalendarEvent } from "../types/types";

// Using date-fns format with custom formatting:
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
const formatTimeWithOptionalMinutes = (date: Date) => {
  // Handle potential invalid date objects
  if (!(date instanceof Date) || isNaN(date.getTime())) {
     return "Invalid Time";
  }
  try {
    return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase();
  } catch (error) {
    console.error("Error formatting time:", date, error);
    return "Error Time";
  }
};


interface EventWrapperProps {
  event: CalendarEvent;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  currentTime?: Date;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventWrapperProps) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  // during drag operations. Otherwise, use the actual event end time.
  const effectiveEndTime = useMemo(() => {
     if (currentTime && event.start && event.end) {
       const startOriginal = new Date(event.start);
       const endOriginal = new Date(event.end);
       if (!isNaN(startOriginal.getTime()) && !isNaN(endOriginal.getTime())) {
         const duration = endOriginal.getTime() - startOriginal.getTime();
         return new Date(currentTime.getTime() + duration);
       }
     }
     return event.end ? new Date(event.end) : new Date(); // Fallback to current time if end is invalid
  }, [currentTime, event.start, event.end]);

  // Check if the event's effective end time is in the past
  const isEventInPast = useMemo(() => {
    return isPast(effectiveEndTime);
  }, [effectiveEndTime]);


  return (
    <button
      className={cn(
        // Base styles
        "flex h-full w-full select-none overflow-hidden px-1 text-left font-medium outline-none backdrop-blur-md transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-2",
        // Dragging styles
        "data-dragging:cursor-grabbing data-dragging:shadow-lg",
         // Default event color (will be overridden by past event styles if applicable)
        getEventColorClasses(event.color),
        // Border radius for multi-day events
        getBorderRadiusClasses(isFirstDay, isLastDay),

        // --- STYLES FOR PAST EVENTS ---
        // Override colors, add opacity, remove interaction
        "data-[past-event]:bg-gray-100 data-[past-event]:border-gray-200 data-[past-event]:text-gray-500 data-[past-event]:opacity-80 data-[past-event]:line-through",
        "data-[past-event]:pointer-events-none data-[past-event]:cursor-not-allowed",
        // Dark mode styles for past events
        "dark:data-[past-event]:bg-gray-800 dark:data-[past-event]:border-gray-700 dark:data-[past-event]:text-gray-400",
        // --- END PAST EVENT STYLES ---

        // Custom className from props
        className
      )}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined} // The data attribute triggering the styles
      onClick={isEventInPast ? undefined : onClick} // Disable click for past events
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  );
}

interface EventItemProps {
  event: CalendarEvent;
  view: "month" | "week" | "day" | "agenda";
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  currentTime?: Date; // For updating time during drag
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  const eventColor = event.color;

  // Use the provided currentTime (for dragging) or the event's actual time
  // Ensure dates are valid before use
  const displayStart = useMemo(() => {
    const dt = currentTime || event.start;
    const parsedDate = dt instanceof Date ? dt : new Date(dt);
    return !isNaN(parsedDate.getTime()) ? parsedDate : new Date(); // Fallback
  }, [currentTime, event.start]);

  const displayEnd = useMemo(() => {
    if (currentTime && event.start && event.end) {
       const startOriginal = new Date(event.start);
       const endOriginal = new Date(event.end);
       if (!isNaN(startOriginal.getTime()) && !isNaN(endOriginal.getTime())) {
         const duration = endOriginal.getTime() - startOriginal.getTime();
         return new Date(currentTime.getTime() + duration);
       }
     }
     const endDt = event.end instanceof Date ? event.end : new Date(event.end);
     return !isNaN(endDt.getTime()) ? endDt : new Date(); // Fallback
  }, [currentTime, event.start, event.end]);

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    // Ensure both dates are valid before calculating difference
    if (isNaN(displayStart.getTime()) || isNaN(displayEnd.getTime())) {
        return 0;
    }
    return differenceInMinutes(displayEnd, displayStart);
  }, [displayStart, displayEnd]);

  const getEventTime = () => {
    if (event.allDay) return "All day";

    // Handle potential invalid dates
     if (isNaN(displayStart.getTime()) || isNaN(displayEnd.getTime())) {
        return "Invalid Time Range";
    }

    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart);
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
  };

  // --- Render for Month View ---
  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick} // onClick disabling handled within EventWrapper
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children || (
          <span className="truncate">
            {!event.allDay && !isNaN(displayStart.getTime()) && ( // Check if displayStart is valid
              <span className="truncate text-[11px] font-normal opacity-70">
                {formatTimeWithOptionalMinutes(displayStart)}{" "}
              </span>
            )}
            {event.title || "(No title)"}
          </span>
        )}
      </EventWrapper>
    );
  }

  // --- Render for Week or Day View ---
  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick} // onClick disabling handled within EventWrapper
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {durationMinutes < 45 ? (
          <div className="truncate">
            {event.title || "(No title)"}{" "}
            {showTime && !isNaN(displayStart.getTime()) && ( // Check if displayStart is valid
              <span
                className={cn(
                  "opacity-70",
                  view === "week" ? "sm:text-[11px]" : "text-[11px]"
                )}
              >
                {formatTimeWithOptionalMinutes(displayStart)}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="truncate font-medium">{event.title || "(No title)"}</div>
            {showTime && (
              <div className="truncate text-[11px] font-normal opacity-70">
                {getEventTime()}
              </div>
            )}
          </>
        )}
      </EventWrapper>
    );
  }

  // --- Render for Agenda View ---
  // Agenda view - kept separate since it's significantly different
  // Check if event end date is valid before using isPast
  const isAgendaEventPast = useMemo(() => {
      const endDt = event.end instanceof Date ? event.end : new Date(event.end);
      return !isNaN(endDt.getTime()) ? isPast(endDt) : false; // Default to false if invalid
  }, [event.end]);


  return (
    <button
      className={cn(
        // Base styles
        "flex w-full flex-col gap-1 rounded p-2 text-left outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        // Default event color (will be overridden by past event styles if applicable) data-[past-event]:line-through
        getEventColorClasses(eventColor),

        // --- STYLES FOR PAST EVENTS ---
        "data-[past-event]:bg-gray-100 data-[past-event]:text-gray-500 data-[past-event]:opacity-80",
        "data-[past-event]:pointer-events-none data-[past-event]:cursor-not-allowed",
        // Dark mode styles for past events
        "dark:data-[past-event]:bg-gray-800 dark:data-[past-event]:text-gray-400",
         // --- END PAST EVENT STYLES ---

        className
      )}
      data-past-event={isAgendaEventPast || undefined} // The data attribute triggering the styles
      onClick={isAgendaEventPast ? undefined : onClick} // Disable click for past events
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      <div className="text-sm font-medium">{event.title || "(No title)"}</div>
      <div className="text-xs opacity-70">
        {event.allDay ? (
          <span>All day</span>
        ) : (
           // Check dates before formatting
           !isNaN(displayStart.getTime()) && !isNaN(displayEnd.getTime()) ? (
             <span className="uppercase">
                {formatTimeWithOptionalMinutes(displayStart)} -{" "}
                {formatTimeWithOptionalMinutes(displayEnd)}
             </span>
           ) : (
              <span>Invalid Time</span>
           )
        )}
        {event.location && (
          <>
            <span className="px-1 opacity-35"> · </span>
            <span>{event.location}</span>
          </>
        )}
      </div>
      {event.description && (
        <div className="my-1 text-xs opacity-90">{event.description}</div>
      )}
    </button>
  );
}