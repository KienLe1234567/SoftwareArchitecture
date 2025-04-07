import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import type { Doctor } from "@/types/doctor";
import type { Shift } from "@/types/shift"; // Import Shift type
import { eachDayOfInterval, isSameDay } from "date-fns"; // Import isSameDay
import type { DateRange } from "react-day-picker";

interface Props {
  doctor: Doctor | null;
  shifts: Shift[]; // Pass the fetched shifts for the selected doctor
  selectedRange: DateRange | undefined;
  selectedDate?: Date | undefined;
}

export default function WorkloadSummary({ doctor, shifts, selectedRange, selectedDate }: Props) {
  const summary = useMemo(() => {
    // Need shifts data to calculate summary
    if (!doctor || !shifts) return null;

    let daysInSelection: Date[] = [];

    // Determine the days covered by the selection
    if (selectedDate) {
      daysInSelection = [selectedDate];
    } else if (selectedRange?.from && selectedRange?.to) {
      daysInSelection = eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to });
    } else {
      // No valid date/range selected
      return { totalSlots: 0, totalDays: 0 };
    }

    if (daysInSelection.length === 0) {
        return { totalSlots: 0, totalDays: 0 };
    }

    // Filter shifts to only include those within the selected days
    const relevantShifts = shifts.filter(shift =>
      daysInSelection.some(day => isSameDay(shift.startTime, day))
    );

    const totalSlots = relevantShifts.length;
    const totalDays = daysInSelection.length; // Number of days in the selected period

    return { totalSlots, totalDays };

  }, [doctor, shifts, selectedRange, selectedDate]); // Dependencies include shifts

  // Initial state or error state (could be handled better with loading prop)
  if (!doctor) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Select a doctor to view summary.</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary || (summary.totalDays === 0 && !selectedDate && !selectedRange?.from)) {
     return (
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">Select a date or range to view summary.</p>
          </CardContent>
        </Card>
      );
  }


  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="text-md font-medium mb-2">Selection Summary</h4>
        <p>
          Total Assigned Slots: <span className="font-semibold">{summary.totalSlots}</span>
        </p>
        <p>
          Days Selected: <span className="font-semibold">{summary.totalDays}</span>
        </p>
        {summary.totalDays > 0 && (
             <p className="text-sm text-muted-foreground mt-1">
                Average Slots/Day: <span className="font-semibold">{(summary.totalSlots / summary.totalDays).toFixed(1)}</span>
            </p>
        )}
      </CardContent>
    </Card>
  );
}