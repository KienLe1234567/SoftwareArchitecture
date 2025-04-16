"use client"

import { Calendar as CalendarUI } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarDays, CalendarRange } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  calendarMode: "single" | "range"
  setCalendarMode: (mode: "single" | "range") => void
  selectedDate: Date | undefined
  selectedRange: DateRange | undefined
  onSelectDate: (date: Date | undefined) => void
  onSelectRange: (range: DateRange | undefined) => void
  futureOnly?: boolean // New optional prop (default = true)
}

export default function CalendarStaff({
  calendarMode,
  setCalendarMode,
  selectedDate,
  selectedRange,
  onSelectDate,
  onSelectRange,
  futureOnly = true, // Default to true
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 flex flex-col items-center">
      {/* Toggle */}
      <div className="flex items-center justify-center space-x-4 mb-6 w-full">
        <div className="flex items-center gap-2">
          <CalendarDays
            className={cn(
              "h-4 w-4 transition-colors",
              calendarMode === "single" ? "text-primary" : "text-muted-foreground",
            )}
          />
          <Label
            htmlFor="calendar-mode"
            className={cn(
              "font-medium cursor-pointer transition-colors",
              calendarMode === "single" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Single
          </Label>
        </div>

        <Switch
          id="calendar-mode"
          checked={calendarMode === "range"}
          onCheckedChange={(checked) => setCalendarMode(checked ? "range" : "single")}
          className="data-[state=checked]:bg-primary"
        />

        <div className="flex items-center gap-2">
          <CalendarRange
            className={cn(
              "h-4 w-4 transition-colors",
              calendarMode === "range" ? "text-primary" : "text-muted-foreground",
            )}
          />
          <Label
            htmlFor="calendar-mode"
            className={cn(
              "font-medium cursor-pointer transition-colors",
              calendarMode === "range" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Range
          </Label>
        </div>
      </div>

      {/* Calendar */}
      <div className="border rounded-lg p-1 shadow-sm">
        {calendarMode === "single" ? (
          <CalendarUI
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            fromDate={futureOnly ? new Date() : undefined} // Only restrict if futureOnly is true
            numberOfMonths={1}
            className="rounded-md"
          />
        ) : (
          <CalendarUI
            mode="range"
            selected={selectedRange}
            onSelect={onSelectRange}
            fromDate={futureOnly ? new Date() : undefined} // Only restrict if futureOnly is true
            numberOfMonths={1}
            className="rounded-md"
          />
        )}
      </div>
    </div>
  )
}
