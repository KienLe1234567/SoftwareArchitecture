import { Card, CardContent } from "@/components/ui/card"
import { useMemo } from "react"
import type { Doctor } from "@/types/doctor"
import { eachDayOfInterval, format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface Props {
    doctor: Doctor | null
    selectedRange: DateRange | undefined
    selectedDate?: Date | undefined
  }
  
  export default function WorkloadSummary({ doctor, selectedRange, selectedDate }: Props) {
    const summary = useMemo(() => {
      if (!doctor) return null
  
      let days: Date[] = []
  
      if (selectedDate) {
        days = [selectedDate]
      } else if (selectedRange && selectedRange.from && selectedRange.to) {
        days = eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to })
      } else {
        return null
      }
  
      let totalSlots = 0
      days.forEach((day) => {
        const dateStr = format(day, "yyyy-MM-dd")
        totalSlots += doctor.workload[dateStr]?.length || 0
      })
      return { totalSlots, totalDays: days.length }
    }, [doctor, selectedRange, selectedDate])
  
    if (!doctor || !summary) {
      return (
        <Card className="mt-4">
          <CardContent className="p-4">
            <p>No doctor selected or date incomplete.</p>
          </CardContent>
        </Card>
      )
    }
  
    return (
      <Card>
        <CardContent className="p-4">
          <h4 className="text-md font-medium mb-2">Summary</h4>
          <p>
            Total Assigned Slots: <span className="font-semibold">{summary.totalSlots}</span>
          </p>
          <p>
            Days Selected: <span className="font-semibold">{summary.totalDays}</span>
          </p>
        </CardContent>
      </Card>
    )
  }
  