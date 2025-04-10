// day-view.tsx
"use client";

import React, { useMemo } from "react";
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachHourOfInterval,
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
} from "date-fns";
import { cn, isMultiDayEvent } from "@/lib/utils"; // <-- Đảm bảo đã import
import { useCurrentTimeIndicator } from "../hooks/use-current-time-indicator";
import { CalendarEvent } from "../types/types";
import { WeekCellsHeight } from "./constants";
import { DraggableEvent } from "./draggable-event";
import { DroppableCell } from "./droppable-cell";
import { EventItem } from "./event-item";

interface DayViewProps {
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

export function DayView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: DayViewProps) {
  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: dayStart,
      end: addHours(dayStart, 23),
    });
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return (
          isSameDay(currentDate, eventStart) ||
          isSameDay(currentDate, eventEnd) ||
          (currentDate > eventStart && currentDate < eventEnd)
        );
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
  }, [currentDate, events]);

  // Filter all-day events
  const allDayEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      return event.allDay || isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Get only single-day time-based events
  const timeEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      return !event.allDay && !isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Process events to calculate positions
  const positionedEvents = useMemo(() => {
    const result: PositionedEvent[] = [];
    const dayStart = startOfDay(currentDate);
    const sortedEvents = [...timeEvents].sort((a, b) => {
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

    const columns: { event: CalendarEvent; end: Date }[][] = [];

    sortedEvents.forEach((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const adjustedStart = isSameDay(currentDate, eventStart) ? eventStart : dayStart;
      const adjustedEnd = isSameDay(currentDate, eventEnd) ? eventEnd : addHours(dayStart, 24);
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

      result.push({ event, top, height, left, width, zIndex: 10 + columnIndex });
    });
    return result;
  }, [currentDate, timeEvents]);


  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "day"
  );

  // --- Thay đổi bắt đầu ---
  const today = useMemo(() => startOfDay(new Date()), []);
  const now = useMemo(() => new Date(), []);
  const isCurrentDay = isToday(currentDate); // Kiểm tra ngày đang XEM có phải hôm nay
  const isPastDay = isBefore(startOfDay(currentDate), today); // Kiểm tra ngày đang XEM có phải quá khứ
  // --- Thay đổi kết thúc ---

  return (
    <>
      {showAllDaySection && (
        <div className="border-t border-border/70 bg-muted/50">
          <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
            {/* Phần all day section giữ nguyên */}
             <div className="relative">
               <span className="absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                 All day
               </span>
             </div>
             <div className="relative border-r border-border/70 p-1 last:border-r-0">
               {allDayEvents.map((event) => {
                 const eventStart = new Date(event.start);
                 const eventEnd = new Date(event.end);
                 const isFirstDay = isSameDay(currentDate, eventStart);
                 const isLastDay = isSameDay(currentDate, eventEnd);

                 return (
                   <EventItem
                     key={`spanning-${event.id}`}
                     onClick={(e) => handleEventClick(event, e)}
                     event={event}
                     view="month" // or 'day' if styling differs? Using 'month' for consistency
                     isFirstDay={isFirstDay}
                     isLastDay={isLastDay}
                   >
                     <div>{event.title}</div>
                   </EventItem>
                 );
               })}
             </div>
          </div>
        </div>
      )}

      <div className="grid flex-1 grid-cols-[3rem_1fr] border-t border-border/70 sm:grid-cols-[4rem_1fr]">
        <div>
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

        <div className="relative">
          {/* Positioned events */}
          {positionedEvents.map((positionedEvent) => (
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
             >
               <div className="h-full w-full">
                 <DraggableEvent
                   event={positionedEvent.event}
                   view="day"
                   onClick={(e) => handleEventClick(positionedEvent.event, e)}
                   showTime
                   height={positionedEvent.height}
                 />
               </div>
             </div>
           ))}

          {/* Current time indicator */}
          {currentTimeVisible && (
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

          {/* Time grid */}
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
                  const cellDateTime = setMilliseconds(setSeconds(setMinutes(setHours(new Date(currentDate), hourValue), quarter * 15), 0), 0);
                  const isPastTimeSlot = isCurrentDay && isBefore(cellDateTime, now);
                  // --- Thay đổi kết thúc ---

                  return (
                    <DroppableCell
                      key={`${hour.toString()}-${quarter}`}
                      id={`day-cell-${currentDate.toISOString()}-${quarterHourTimeValue}`}
                      date={currentDate}
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
                        const startTime = new Date(currentDate);
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
      </div>
    </>
  );
}