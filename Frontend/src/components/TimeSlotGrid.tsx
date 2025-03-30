"use client";

import type React from "react";
import { useMemo } from "react";
import { Clock } from "lucide-react";
import { cn, generateTimeSlots, formatTime, formatToApiIsoString, parseApiIsoString } from "@/lib/utils"; // Import helpers
import type { Shift } from "@/types/shift"; // Use your actual Shift type

interface Props {
  currentDate: Date | null | undefined;
  shiftsForDate: Shift[]; // Existing shifts for the selected date
  pendingRanges: { startTime: string; endTime: string }[]; // New shifts user wants to add
  setPendingRanges: React.Dispatch<React.SetStateAction<{ startTime: string; endTime: string }[]>>;
}

type SlotState = "available" | "existing" | "pending";

export default function TimeSlotGrid({
  currentDate,
  shiftsForDate,
  pendingRanges,
  setPendingRanges,
}: Props) {

  // Generate potential slots for the current date
  const potentialSlots = useMemo(() => {
    return currentDate ? generateTimeSlots(currentDate) : [];
  }, [currentDate]);

  // Determine the state of each potential slot
  const getSlotState = (slot: { startTime: Date; endTime: Date }): SlotState => {
    const apiStartTime = formatToApiIsoString(slot.startTime);
    const apiEndTime = formatToApiIsoString(slot.endTime);

    // Check if it's a pending range
    if (pendingRanges.some(r => r.startTime === apiStartTime && r.endTime === apiEndTime)) {
      return "pending";
    }

    // Check if it's an existing shift
    // Compare times directly for precision
    if (shiftsForDate.some(shift =>
        shift.startTime.getTime() === slot.startTime.getTime() &&
        shift.endTime.getTime() === slot.endTime.getTime()
    )) {
      return "existing";
    }

    return "available";
  };

  const handleSlotClick = (slot: { startTime: Date; endTime: Date }) => {
    if (!currentDate) return;

    const slotState = getSlotState(slot);
    const apiStartTime = formatToApiIsoString(slot.startTime);
    const apiEndTime = formatToApiIsoString(slot.endTime);
    const range = { startTime: apiStartTime, endTime: apiEndTime };

    if (slotState === "available") {
      // Add to pending ranges
      setPendingRanges(prev => [...prev, range]);
    } else if (slotState === "pending") {
      // Remove from pending ranges
      setPendingRanges(prev => prev.filter(r => !(r.startTime === apiStartTime && r.endTime === apiEndTime)));
    }
    // Do nothing if it's an 'existing' shift (no delete functionality)
  };

  const formatDateDisplay = (date: Date | null | undefined) => {
    if (!date) return "No date selected";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Separate slots into morning/afternoon for display
  const morningSlots = potentialSlots.filter(slot => slot.startTime.getHours() < 12);
  const afternoonSlots = potentialSlots.filter(slot => slot.startTime.getHours() >= 12);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {formatDateDisplay(currentDate)}
        </h2>
      </div>

      {currentDate ? (
        <div className="space-y-6">
          {/* Morning Slots */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Morning (07:00 - 12:00)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {morningSlots.map((slot) => {
                const state = getSlotState(slot);
                const displayLabel = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
                return (
                  <button
                    key={slot.startTime.toISOString()} // Use ISO string for unique key
                    className={cn(
                      "py-3 px-2 rounded-lg border-2 transition-all duration-150 text-center",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "font-medium text-xs sm:text-sm", // Adjust text size
                      {
                        // Available slot
                        "bg-background border-border hover:bg-muted/50 hover:border-primary cursor-pointer": state === "available",
                        // Existing shift (visually distinct, not interactive for adding/removing)
                        "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-muted-foreground cursor-not-allowed opacity-75": state === "existing",
                        // Pending addition (looks selected)
                        "bg-primary text-primary-foreground border-primary cursor-pointer": state === "pending",
                      }
                    )}
                    onClick={() => handleSlotClick(slot)}
                    disabled={state === "existing"} // Disable button for existing shifts
                    title={displayLabel + (state === 'existing' ? ' (Booked)' : '')} // Add title for clarity
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Afternoon (13:00 - 18:00)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {afternoonSlots.map((slot) => {
                 const state = getSlotState(slot);
                 const displayLabel = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
                 return (
                   <button
                     key={slot.startTime.toISOString()}
                     className={cn(
                       "py-3 px-2 rounded-lg border-2 transition-all duration-150 text-center",
                       "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                       "font-medium text-xs sm:text-sm",
                       {
                         "bg-background border-border hover:bg-muted/50 hover:border-primary cursor-pointer": state === "available",
                         "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-muted-foreground cursor-not-allowed opacity-75": state === "existing",
                         "bg-primary text-primary-foreground border-primary cursor-pointer": state === "pending",
                       }
                     )}
                     onClick={() => handleSlotClick(slot)}
                     disabled={state === "existing"}
                     title={displayLabel + (state === 'existing' ? ' (Booked)' : '')}
                   >
                     {displayLabel}
                   </button>
                 );
              })}
            </div>
          </div>
        </div>
      ) : (
        // Placeholder when no date is selected
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Please select a date from the calendar to view and manage time slots.
          </p>
        </div>
      )}
    </div>
  );
}