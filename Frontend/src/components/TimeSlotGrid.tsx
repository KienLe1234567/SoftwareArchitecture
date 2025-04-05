"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"
// import { useState } from "react"

interface Props {
  selectedSlots: string[]
  setSelectedSlots: React.Dispatch<React.SetStateAction<string[]>>
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
  workload: Record<string, string[]>
}

export default function TimeSlotGrid({ selectedSlots, setSelectedSlots, currentDate, workload }: Props) {
  // Generate time slots
  const morningSlots = []
  const afternoonSlots = []

  for (let hour = 7; hour < 12; hour++) {
    morningSlots.push(`${hour.toString().padStart(2, "0")}:00`)
    morningSlots.push(`${hour.toString().padStart(2, "0")}:30`)
  }

  for (let hour = 13; hour < 18; hour++) {
    afternoonSlots.push(`${hour.toString().padStart(2, "0")}:00`)
    afternoonSlots.push(`${hour.toString().padStart(2, "0")}:30`)
  }

  // Comment lại code cũ cho việc chọn nhiều slots
  // const [isSelecting, setIsSelecting] = useState(false)
  // const [selectionMode, setSelectionMode] = useState<"add" | "remove">("add")

  // const handleMouseDown = (slot: string) => {
  //   setIsSelecting(true)
  //   if (selectedSlots.includes(slot)) {
  //     setSelectionMode("remove")
  //     setSelectedSlots((prev) => prev.filter((s) => s !== slot))
  //   } else {
  //     setSelectionMode("add")
  //     setSelectedSlots((prev) => [...prev, slot])
  //   }
  // }

  // const handleMouseEnter = (slot: string) => {
  //   if (isSelecting) {
  //     if (selectionMode === "add" && !selectedSlots.includes(slot)) {
  //       setSelectedSlots((prev) => [...prev, slot])
  //     } else if (selectionMode === "remove" && selectedSlots.includes(slot)) {
  //       setSelectedSlots((prev) => prev.filter((s) => s !== slot))
  //     }
  //   }
  // }

  // const handleMouseUp = () => {
  //   setIsSelecting(false)
  // }

  const handleSlotClick = (slot: string) => {
    setSelectedSlots([slot])
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    // <div
    //   onMouseUp={handleMouseUp}
    //   onMouseLeave={handleMouseUp}
    //   className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200"
    // >
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {currentDate ? formatDate(currentDate) : "Select a date to view time slots"}
        </h2>
      </div>

      {currentDate && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Morning</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {morningSlots.map((slot) => (
                <button
                  key={slot}
                  className={cn(
                    "py-3 px-4 rounded-lg border-2 transition-all duration-150 hover:border-primary",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "font-medium text-sm",
                    selectedSlots.includes(slot)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted/50",
                  )}
                  // onMouseDown={() => handleMouseDown(slot)}
                  // onMouseEnter={() => handleMouseEnter(slot)}
                  onClick={() => handleSlotClick(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Afternoon</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {afternoonSlots.map((slot) => (
                <button
                  key={slot}
                  className={cn(
                    "py-3 px-4 rounded-lg border-2 transition-all duration-150 hover:border-primary",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "font-medium text-sm",
                    selectedSlots.includes(slot)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted/50",
                  )}
                  // onMouseDown={() => handleMouseDown(slot)}
                  // onMouseEnter={() => handleMouseEnter(slot)}
                  onClick={() => handleSlotClick(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!currentDate && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Please select a date from the calendar to view and manage time slots</p>
        </div>
      )}
    </div>
  )
}

