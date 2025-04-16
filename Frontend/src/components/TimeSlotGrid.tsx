"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@/types/slot";
import { Clock } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  selectedSlots: string[];
  setSelectedSlots: Dispatch<SetStateAction<string[]>>;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  slots: Slot[];
}

export default function TimeSlotGrid({
  selectedSlots,
  setSelectedSlots,
  currentDate,
  setCurrentDate,
  slots,
}: Props) {
  const handleSlotClick = (slotId: string) => {
    setSelectedSlots([slotId]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (datetime: string): string => {
    const date = new Date(datetime);
    return date.toTimeString().slice(0, 5); // HH:MM
  };

  // 👉 Phân loại slot theo sáng / chiều
  const morningSlots = slots.filter((slot) => {
    const hour = new Date(slot.startTime).getHours();
    return hour >= 7 && hour < 12;
  });

  const afternoonSlots = slots.filter((slot) => {
    const hour = new Date(slot.startTime).getHours();
    return hour >= 13 && hour < 19;
  });

  const renderSlotButtons = (slotList: Slot[]) =>
    slotList.map((slot) => {
      const time = formatTime(slot.startTime);
      const isSelected = selectedSlots.includes(slot.id);
      const isAvailable = slot.status === "AVAILABLE";

      return (
        <button
          key={slot.id}
          onClick={() => handleSlotClick(slot.id)}
          disabled={!isAvailable}
          className={cn(
            "py-3 px-4 rounded-lg border-2 transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "font-medium text-sm",
            isSelected
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-muted/50",
            !isAvailable && "opacity-50 cursor-not-allowed"
          )}
        >
          {time}
        </button>
      );
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {currentDate ? formatDate(currentDate) : "Select a date to view time slots"}
        </h2>
      </div>

      {currentDate ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Morning</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {renderSlotButtons(morningSlots)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Afternoon</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {renderSlotButtons(afternoonSlots)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Please select a date from the calendar to view and manage time slots</p>
        </div>
      )}
    </div>
  );
}
