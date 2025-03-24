"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import type { Doctor } from "@/types/doctor"
import DoctorList from "@/components/DoctorList"
import CalendarStaff from "@/components/CalendarStaff"
import TimeSlotGrid from "@/components/TimeSlotGrid"
import AssignControls from "@/components/AssignControls"
import { UserRound } from "lucide-react"

const dummyDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. John Doe",
    phone: "123-456-7890",
    email: "john@example.com",
    workload: {},
  },
  {
    id: "2",
    name: "Dr. Jane Smith",
    phone: "987-654-3210",
    email: "jane@example.com",
    workload: {},
  },
]

export default function SchedulePage() {
  const [doctors, setDoctors] = useState<Doctor[]>(dummyDoctors)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)

  const [calendarMode, setCalendarMode] = useState<"single" | "range">("single")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)

  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const selectedDoctor = doctors.find((doc) => doc.id === selectedDoctorId)
  const [isDirty, setIsDirty] = useState(false)

  const dateToKey = (date: Date) => date.toISOString().split("T")[0]

  const updateDoctorWorkload = (slots: string[]) => {
    if (!selectedDoctor || !currentDate) return

    const updatedDoctors = doctors.map((doc) => {
      if (doc.id === selectedDoctor.id) {
        const workload = { ...doc.workload }
        const dateKey = dateToKey(currentDate)
        workload[dateKey] = slots
        return { ...doc, workload }
      }
      return doc
    })

    setDoctors(updatedDoctors)
  }

  const assignRangeSlots = (includeWeekend: boolean) => {
    if (!selectedDoctor || !selectedRange?.from || !selectedRange.to) return

    const slots: string[] = []
    for (let hour = 7; hour < 12; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    for (let hour = 13; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }

    const updatedDoctors = doctors.map((doc) => {
      if (doc.id === selectedDoctor.id) {
        const workload = { ...doc.workload }
        const current = new Date(selectedRange.from!)
        const to = new Date(selectedRange.to!)
        while (current <= to) {
          if (includeWeekend || (current.getDay() !== 0 && current.getDay() !== 6)) {
            workload[dateToKey(current)] = slots
          }
          current.setDate(current.getDate() + 1)
        }
        return { ...doc, workload }
      }
      return doc
    })

    setDoctors(updatedDoctors)
  }

  const cancelRangeSlots = () => {
    if (!selectedDoctor) return

    const updatedDoctors = doctors.map((doc) => {
      if (doc.id === selectedDoctor.id) {
        const workload = { ...doc.workload }

        if (calendarMode === "range" && selectedRange?.from && selectedRange.to) {
          // Handle range cancel
          const current = new Date(selectedRange.from)
          const to = new Date(selectedRange.to)
          while (current <= to) {
            delete workload[dateToKey(current)]
            current.setDate(current.getDate() + 1)
          }
        } else if (calendarMode === "single" && selectedDate) {
          // Handle single date cancel
          const dateKey = dateToKey(selectedDate)
          delete workload[dateKey]
        }

        return { ...doc, workload }
      }
      return doc
    })

    setDoctors(updatedDoctors)

    // Clear slots + reset states
    setCurrentDate(null)
    setSelectedSlots([])
    setSelectedDate(undefined)
    setSelectedRange(undefined)
  }

  const assignDefaultDateSlots = () => {
    if (!selectedDoctor || !selectedDate) {
      alert("Please select a doctor and date first.")
      return
    }

    const slots: string[] = []
    for (let hour = 7; hour < 12; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    for (let hour = 13; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }

    updateDoctorWorkload(slots)
    setSelectedSlots(slots) // Update selectedSlots for UI feedback
    setIsDirty(false) // Reset dirty state if needed
  }

  return (
    <div className="container mx-auto py-8 px-1">
      <h1 className="text-3xl font-bold mb-8">Doctor Schedule Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doctor List */}
        <div className="lg:col-span-3">
          <DoctorList
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onSelectDoctor={(id) => {
              setSelectedDoctorId(id)
              setSelectedDate(undefined)
              setSelectedRange(undefined)
              setSelectedSlots([])
              setCurrentDate(null)
            }}
          />
        </div>

        {selectedDoctor ? (
          <>
            {/* Calendar */}
            <div className="lg:col-span-3">
              <CalendarStaff
                calendarMode={calendarMode}
                setCalendarMode={setCalendarMode}
                selectedDate={selectedDate}
                selectedRange={selectedRange}
                onSelectDate={(date) => {
                  setSelectedDate(date)
                  if (selectedDoctor && date) {
                    const dateKey = dateToKey(date)
                    setSelectedSlots(selectedDoctor.workload[dateKey] || [])
                    setCurrentDate(date)
                  } else {
                    setCurrentDate(null)
                    setSelectedSlots([])
                  }
                }}
                onSelectRange={(range) => {
                  setSelectedRange(range)
                  if (selectedDoctor && range?.from) {
                    const dateKey = dateToKey(range.from)
                    setSelectedSlots(selectedDoctor.workload[dateKey] || [])
                    setCurrentDate(range.from)
                  } else {
                    setCurrentDate(null)
                    setSelectedSlots([])
                  }
                }}
              />
            </div>

            {/* Controls and Time Slots */}
            <div className="lg:col-span-6 space-y-6">
              <AssignControls
                selectedSlots={selectedSlots}
                updateDoctorWorkload={updateDoctorWorkload}
                assignRangeSlots={assignRangeSlots}
                cancelRangeSlots={cancelRangeSlots}
                calendarMode={calendarMode}
                isDirty={isDirty}
                setIsDirty={setIsDirty}
                assignDefaultDateSlots={assignDefaultDateSlots}
              />

              <TimeSlotGrid
                selectedSlots={selectedSlots}
                setSelectedSlots={(slots) => {
                  setSelectedSlots(slots)
                  setIsDirty(true) // Mark as dirty
                }}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                workload={selectedDoctor.workload}
              />
            </div>
          </>
        ) : (
          <div className="lg:col-span-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 inline-block mb-4">
                <UserRound className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Doctor Selected</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Please select a doctor from the list to view and manage their schedule
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

