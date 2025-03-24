"use client"
import { useState } from "react"
import { Doctor } from "@/types/doctor"
import DoctorList from "@/components/DoctorList"
import CalendarStaff from "@/components/CalendarStaff"
import WorkloadTable from "@/components/WorkloadTable"
import WorkloadSummary from "@/components/WorkloadSummary"
import { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"

// Dummy doctor data
const doctorsData: Doctor[] = [
  {
    id: "1",
    name: "Dr. John Doe",
    phone: "123-456-7890",
    email: "john@example.com",
    workload: {
      "2025-03-24": ["07:00", "07:30", "13:00"],
      "2025-03-25": ["08:00", "13:30", "14:00", "14:30"],
    },
  },
  {
    id: "2",
    name: "Dr. Jane Smith",
    phone: "987-654-3210",
    email: "jane@example.com",
    workload: {
      "2025-03-24": ["07:00", "13:30"],
      "2025-03-26": ["07:30", "08:00", "13:00", "14:00"],
    },
  },
  {
    id: "3",
    name: "Dr. ahihi",
    phone: "000-000-0000",
    email: "hahih@example.com",
    workload: {
      "2025-04-24": ["07:00", "13:30"],
      "2025-04-26": ["07:30", "08:00", "13:00", "14:00"],
    },
  },
]

export default function DoctorWorkloadPage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [calendarMode, setCalendarMode] = useState<"single" | "range">("range")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date() })

  const selectedDoctor = doctorsData.find((doc) => doc.id === selectedDoctorId) || null

  return (
    <div className="min-h-screen flex flex-col">
  <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
    <div className="col-span-1 flex flex-col gap-4">
      <div className="flex max-h-[calc(100vh-300px)]">
        <DoctorList
          doctors={doctorsData}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={setSelectedDoctorId}
          maxVisibleDoctors={2}
        />
      </div>
      <div className="mt-2">
        <CalendarStaff
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          selectedDate={selectedDate}
          selectedRange={selectedRange}
          onSelectDate={setSelectedDate}
          onSelectRange={setSelectedRange}
          futureOnly={false}
        />
      </div>
    </div>
    <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
      {!selectedDoctor && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Please select a doctor to view workload.
          </CardContent>
        </Card>
      )}

{selectedDoctor && (
  <>
    <WorkloadSummary
      doctor={selectedDoctor}
      selectedRange={calendarMode === "range" ? selectedRange : undefined}
      selectedDate={calendarMode === "single" ? selectedDate : undefined}
    />
    <WorkloadTable
      doctor={selectedDoctor}
      selectedRange={calendarMode === "range" ? selectedRange : undefined}
      selectedDate={calendarMode === "single" ? selectedDate : undefined}
    />
  </>
)}

    </div>
  </div>

</div>

  )
}
