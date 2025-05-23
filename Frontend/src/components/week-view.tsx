// week-view.tsx
"use client";

import React, { useMemo } from "react";
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isBefore, // <-- Đã thêm
  isSameDay,
  isToday, // <-- Đã thêm
  setHours, // <-- Đã thêm
  setMilliseconds, // <-- Đã thêm
  setMinutes, // <-- Đã thêm
  setSeconds, // <-- Đã thêm
  startOfDay, // <-- Đã thêm
  startOfWeek,
} from "date-fns";
import { useCurrentTimeIndicator } from "@/hooks/use-current-time-indicator";
import { cn, isMultiDayEvent } from "@/lib/utils"; // <-- Đảm bảo đã import
import { CalendarEvent } from "../types/types";
import { WeekCellsHeight } from "./constants";
import { DraggableEvent } from "./draggable-event";
import { DroppableCell } from "./droppable-cell";
import { EventItem } from "./event-item";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date) => void;
}

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate]
  );

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: dayStart,
      end: addHours(dayStart, 23),
    });
  }, [currentDate]);

  // Get all-day events and multi-day events for the week
  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        return event.allDay || isMultiDayEvent(event);
      })
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return days.some(
          (day) =>
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd)
        );
      });
  }, [events, days]);

  // Process events for each day to calculate positions
  const processedDayEvents = useMemo(() => {
    const result = days.map((day) => {
      // Get events for this day that are not all-day events or multi-day events
      const dayEvents = events.filter((event) => {
        if (event.allDay || isMultiDayEvent(event)) return false;
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return (
          isSameDay(day, eventStart) ||
          isSameDay(day, eventEnd) ||
          (eventStart < day && eventEnd > day)
        );
      });

      const sortedEvents = [...dayEvents].sort((a, b) => {
          const aStart = new Date(a.start);
          const bStart = new Date(b.start);
          const aEnd = new Date(a.end);
          const bEnd = new Date(b.end);
          if (aStart < bStart) return -1;
          if (aStart > bStart) return 1;
          const aDuration = differenceInMinutes(aEnd, aStart);
          const bDuration = differenceInMinutes(bEnd, bStart);
          return bDuration - aDuration;
      });

      const positionedEvents: PositionedEvent[] = [];
      const dayStart = startOfDay(day);
      const columns: { event: CalendarEvent; end: Date }[][] = [];

      sortedEvents.forEach((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart;
        const adjustedEnd = isSameDay(day, eventEnd) ? eventEnd : addHours(dayStart, 24);
        const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
        const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;
        const top = startHour * WeekCellsHeight;
        const height = (endHour - startHour) * WeekCellsHeight;

        let columnIndex = 0;
        let placed = false;
        while (!placed) {
          if (!columns[columnIndex]) {
            columns[columnIndex] = [];
            placed = true;
          } else {
            const overlaps = columns[columnIndex].some((col) =>
              areIntervalsOverlapping(
                { start: adjustedStart, end: adjustedEnd },
                { start: new Date(col.event.start), end: new Date(col.event.end) }
              )
            );
            if (!overlaps) {
              placed = true;
            } else {
              columnIndex++;
            }
          }
        }
        columns[columnIndex].push({ event, end: adjustedEnd });

        const width = columnIndex === 0 ? 1 : 0.9; // Adjust overlap logic slightly
        const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

        positionedEvents.push({ event, top, height, left, width, zIndex: 10 + columnIndex });
      });
      return positionedEvents;
    });
    return result;
  }, [days, events]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week"
  );

  // --- Thay đổi bắt đầu ---
  const today = useMemo(() => startOfDay(new Date()), []);
  const now = useMemo(() => new Date(), []);
  // --- Thay đổi kết thúc ---

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-30 grid grid-cols-8 border-b border-border/70 bg-background/80 backdrop-blur-md">
        {/* Phần header ngày giữ nguyên */}
         <div className="py-2 text-center text-sm text-muted-foreground/70">
           <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
         </div>
         {days.map((day) => (
           <div
             key={day.toString()}
             className="data-today:text-foreground data-today:font-medium py-2 text-center text-sm text-muted-foreground/70"
             data-today={isToday(day) || undefined}
           >
             <span className="sm:hidden" aria-hidden="true">
               {format(day, "E")[0]} {format(day, "d")}
             </span>
             <span className="max-sm:hidden">{format(day, "EEE dd")}</span>
           </div>
         ))}
      </div>

      {showAllDaySection && (
        <div className="border-b border-border/70 bg-muted/50">
          <div className="grid grid-cols-8">
            {/* Phần all day section giữ nguyên */}
             <div className="relative border-r border-border/70">
               <span className="absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                 All day
               </span>
             </div>
             {days.map((day, dayIndex) => {
               const dayAllDayEvents = allDayEvents.filter((event) => {
                 const eventStart = new Date(event.start);
                 const eventEnd = new Date(event.end);
                 return (
                   isSameDay(day, eventStart) ||
                   (day > eventStart && day < eventEnd) ||
                   isSameDay(day, eventEnd)
                 );
               });

               return (
                 <div
                   key={day.toString()}
                   className="relative border-r border-border/70 p-1 last:border-r-0"
                   data-today={isToday(day) || undefined}
                 >
                   {dayAllDayEvents.map((event) => {
                     const eventStart = new Date(event.start);
                     const eventEnd = new Date(event.end);
                     const isFirstDay = isSameDay(day, eventStart);
                     const isLastDay = isSameDay(day, eventEnd);
                     const isFirstVisibleDay =
                       dayIndex === 0 && isBefore(eventStart, weekStart);
                     const shouldShowTitle = isFirstDay || isFirstVisibleDay;

                     return (
                       <EventItem
                         key={`spanning-${event.id}`}
                         onClick={(e) => handleEventClick(event, e)}
                         event={event}
                         view="month"
                         isFirstDay={isFirstDay}
                         isLastDay={isLastDay}
                       >
                         <div
                           className={cn(
                             "truncate",
                             !shouldShowTitle && "invisible"
                           )}
                           aria-hidden={!shouldShowTitle}
                         >
                           {event.title}
                         </div>
                       </EventItem>
                     );
                   })}
                 </div>
               );
             })}
          </div>
        </div>
      )}

      <div className="grid flex-1 grid-cols-8">
        <div className="border-r border-border/70">
          {/* Phần cột giờ bên trái giữ nguyên */}
           {hours.map((hour, index) => (
             <div
               key={hour.toString()}
               className="relative h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
             >
               {index > 0 && (
                 <span className="absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end bg-background pe-2 text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                   {format(hour, "h a")}
                 </span>
               )}
             </div>
           ))}
        </div>

        {days.map((day, dayIndex) => {
          // --- Thay đổi bắt đầu ---
          const isPastDay = isBefore(day, today);
          const isCurrentDay = isToday(day);
          // --- Thay đổi kết thúc ---

          return (
            <div
              key={day.toString()}
              className="relative border-r border-border/70 last:border-r-0"
              data-today={isCurrentDay || undefined}
            >
              {/* Positioned events */}
              {processedDayEvents[dayIndex].map((positionedEvent) => (
                 <div
                   key={positionedEvent.event.id}
                   className="absolute z-10 px-0.5"
                   style={{
                     top: `${positionedEvent.top}px`,
                     height: `${positionedEvent.height}px`,
                     left: `${positionedEvent.left * 100}%`,
                     width: `${positionedEvent.width * 100}%`,
                     zIndex: positionedEvent.zIndex,
                   }}
                   onClick={(e) => e.stopPropagation()}
                 >
                   <div className="h-full w-full">
                     <DraggableEvent
                       event={positionedEvent.event}
                       view="week"
                       onClick={(e) => handleEventClick(positionedEvent.event, e)}
                       showTime
                       height={positionedEvent.height}
                     />
                   </div>
                 </div>
              ))}

              {/* Current time indicator */}
              {currentTimeVisible && isCurrentDay && (
                 <div
                   className="pointer-events-none absolute left-0 right-0 z-20"
                   style={{ top: `${currentTimePosition}%` }}
                 >
                   <div className="relative flex items-center">
                     <div className="absolute -left-1 h-2 w-2 rounded-full bg-primary"></div>
                     <div className="h-[2px] w-full bg-primary"></div>
                   </div>
                 </div>
               )}

              {hours.map((hour) => {
                const hourValue = getHours(hour);
                return (
                  <div
                    key={hour.toString()}
                    className="relative h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
                  >
                    {/* Quarter-hour intervals */}
                    {[0, 1, 2, 3].map((quarter) => {
                      const quarterHourTimeValue = hourValue + quarter * 0.25;
                      // --- Thay đổi bắt đầu ---
                      const cellDateTime = setMilliseconds(setSeconds(setMinutes(setHours(new Date(day), hourValue), quarter * 15), 0), 0);
                      const isPastTimeSlot = isCurrentDay && isBefore(cellDateTime, now);
                      // --- Thay đổi kết thúc ---

                      return (
                        <DroppableCell
                          key={`${hour.toString()}-${quarter}`}
                          id={`week-cell-${day.toISOString()}-${quarterHourTimeValue}`}
                          date={day}
                          time={quarterHourTimeValue}
                          // --- Thay đổi bắt đầu ---
                          className={cn(
                            "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                            quarter === 0 && "top-0",
                            quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
                            quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
                            quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]",
                            (isPastDay || isPastTimeSlot) && "bg-rose-50/80" // Áp dụng style
                          )}
                          // --- Thay đổi kết thúc ---
                          onClick={() => {
                            const startTime = new Date(day);
                            startTime.setHours(hourValue);
                            startTime.setMinutes(quarter * 15);
                            onEventCreate(startTime);
                          }}
                        />
                      );
                    })}
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