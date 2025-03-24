"use client"

import { useMemo, useState, useEffect } from "react"
import type { Doctor } from "@/types/doctor"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { format, eachDayOfInterval } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Pagination } from "./pagination"

interface Props {
    doctor: Doctor | null
    selectedRange: DateRange | undefined
    selectedDate?: Date | undefined
  }

const ROWS_PER_PAGE = 10

export default function WorkloadTable({ doctor, selectedRange, selectedDate }: Props) {
    const [currentPage, setCurrentPage] = useState(1)
  
    const days = useMemo(() => {
      if (!doctor) return []
      
      // Single mode
      if (selectedDate) return [selectedDate]
  
      // Range mode
      if (selectedRange && selectedRange.from && selectedRange.to) {
        return eachDayOfInterval({
          start: selectedRange.from,
          end: selectedRange.to,
        })
      }
  
      return []
    }, [doctor, selectedRange, selectedDate])
  
    useEffect(() => {
      setCurrentPage(1)
    }, [doctor, selectedRange, selectedDate])
  
    const totalPages = Math.ceil(days.length / ROWS_PER_PAGE)
    const paginatedDays = days.slice(
      (currentPage - 1) * ROWS_PER_PAGE,
      currentPage * ROWS_PER_PAGE
    )
  
    if (!doctor) return <p className="text-muted-foreground">Select a doctor to view workload.</p>
    if (days.length === 0) return <p className="text-muted-foreground">Select a valid date.</p>
  
    return (
      <Card className="mt-4">
        <CardContent className="overflow-x-auto p-4">
          <h3 className="text-lg font-semibold mb-4">{doctor.name}'s Workload</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Assigned Time Slots</TableHead>
                <TableHead>Total Slots</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd")
                const slots = doctor.workload[dateStr] || []
                return (
                  <TableRow key={dateStr}>
                    <TableCell>{format(day, "EEE, MMM dd")}</TableCell>
                    <TableCell>{slots.length > 0 ? slots.join(", ") : "No slots assigned"}</TableCell>
                    <TableCell>{slots.length}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="flex justify-center mt-4">
            {totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
