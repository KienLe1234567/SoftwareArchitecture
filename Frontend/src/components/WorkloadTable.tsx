"use client";

import { useMemo, useState, useEffect } from "react";
import type { Doctor } from "@/types/doctor";
import type { Shift } from "@/types/shift"; // Import Shift type
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption, // Import TableCaption
} from "@/components/ui/table";
import { format, eachDayOfInterval, isSameDay } from "date-fns"; // Import isSameDay
import type { DateRange } from "react-day-picker";
import { Pagination } from "./pagination"; // Assuming pagination component exists
import { formatTime } from "@/lib/utils"; // Import time formatting helper

interface Props {
  doctor: Doctor | null;
  shifts: Shift[]; // Pass the fetched shifts for the selected doctor
  selectedRange: DateRange | undefined;
  selectedDate?: Date | undefined;
}

const ROWS_PER_PAGE = 7; // Adjust as needed

export default function WorkloadTable({ doctor, shifts, selectedRange, selectedDate }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  // Determine the list of days to display in the table based on selection
  const daysInSelection = useMemo(() => {
    // No need to check for doctor here, just the date selection
    if (selectedDate) {
        return [selectedDate];
    }
    if (selectedRange?.from && selectedRange?.to) {
      // Ensure range is valid before calculating interval
      if (selectedRange.from <= selectedRange.to) {
         return eachDayOfInterval({
            start: selectedRange.from,
            end: selectedRange.to,
         });
      }
    }
    return []; // Return empty array if no valid date/range
  }, [selectedRange, selectedDate]);

  // Reset pagination when the underlying data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [doctor, shifts, selectedRange, selectedDate]); // Reset on any relevant prop change

  const totalPages = Math.ceil(daysInSelection.length / ROWS_PER_PAGE);
  const paginatedDays = useMemo(() => daysInSelection.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  ), [daysInSelection, currentPage]);

  // --- Helper to get and format shifts for a specific day ---
  const getFormattedShiftsForDay = (day: Date): { text: string; count: number } => {
    if (!shifts) return { text: "Data unavailable", count: 0 };

    const shiftsForDay = shifts
      .filter(shift => isSameDay(shift.startTime, day))
      // Sort shifts within the day by start time
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    if (shiftsForDay.length === 0) {
      return { text: "No slots assigned", count: 0 };
    }

    // Format as "HH:mm-HH:mm, HH:mm-HH:mm, ..."
    const formattedText = shiftsForDay
      .map(shift => `${formatTime(shift.startTime)}-${formatTime(shift.endTime)}`)
      .join(", ");

    return { text: formattedText, count: shiftsForDay.length };
  };
  // --- End Helper ---


  if (!doctor) {
      return <p className="text-muted-foreground mt-4 text-center">Select a doctor to view workload.</p>;
  }
  if (daysInSelection.length === 0) {
      return <p className="text-muted-foreground mt-4 text-center">Select a valid date or range.</p>;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">{doctor.name}'s Workload</h3>
        <div className="overflow-x-auto"> {/* Ensure table is scrollable on small screens */}
          <Table>
             <TableCaption>Workload details for the selected period.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead> {/* Added width hint */}
                <TableHead>Assigned Time Slots</TableHead>
                <TableHead className="w-[100px] text-right">Total Slots</TableHead> {/* Added width hint & alignment */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDays.map((day) => {
                const { text: slotsText, count: slotsCount } = getFormattedShiftsForDay(day);
                return (
                  <TableRow key={format(day, "yyyy-MM-dd")}>
                    <TableCell className="font-medium">{format(day, "EEE, MMM dd, yyyy")}</TableCell> {/* More complete date format */}
                    <TableCell className="whitespace-normal break-words">{slotsText}</TableCell> {/* Allow wrapping */}
                    <TableCell className="text-right">{slotsCount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && ( // Only show pagination if needed
          <div className="flex justify-center mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}