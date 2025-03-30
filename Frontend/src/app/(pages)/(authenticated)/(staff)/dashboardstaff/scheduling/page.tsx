"use client";

// Import Suspense from React
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import type { DateRange } from "react-day-picker";
import type { Shift, ShiftDto } from "@/types/shift"; // Use your actual Shift types
import DoctorList from "@/components/DoctorList"; // Import the actual DoctorList
import CalendarStaff from "@/components/CalendarStaff";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import AssignControls from "@/components/AssignControls";
import { UserRound, Loader2 } from "lucide-react";
import { getStaffShifts, registerShifts } from "@/lib/staff"; // Use your actual API functions
// Correct the import path if necessary (usually components/ui for Shadcn)
import { useToast } from "@/hooks/use-toast";
import { formatToApiIsoString, parseApiIsoString, generateTimeSlots } from "@/lib/utils"; // Import helpers
import { isSameDay } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for fallback

// Remove the DummyDoctorList component definition
// const DummyDoctorList = (...) => { ... };


// Define a simple loading fallback for the DoctorList
const DoctorListFallback = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Doctors</h2>
        <Skeleton className="h-10 w-full mb-4" /> {/* Search input skeleton */}
        <div className="space-y-3 mt-4 flex-1">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            {/* Add more skeletons if desired */}
        </div>
    </div>
);


export default function SchedulePage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const [calendarMode, setCalendarMode] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);

  const [allShifts, setAllShifts] = useState<Shift[]>([]); // Store all fetched shifts for the doctor
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [pendingRanges, setPendingRanges] = useState<{ startTime: string; endTime: string }[]>([]); // New shifts to add

  const { toast } = useToast();

  // --- Data Fetching ---
  const fetchShifts = useCallback(async (doctorId: string) => {
    setIsLoadingShifts(true);
    setAllShifts([]); // Clear previous shifts
    try {
      const data: ShiftDto = await getStaffShifts(doctorId);
      // IMPORTANT: Parse date strings from API into Date objects
      const parsedShifts = data.shifts.map(shift => ({
        ...shift,
        startTime: parseApiIsoString(shift.startTime as unknown as string), // Cast needed if type is Date
        endTime: parseApiIsoString(shift.endTime as unknown as string),   // Cast needed if type is Date
      }));
      setAllShifts(parsedShifts);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
      toast({
        variant: "destructive",
        title: "Error Fetching Shifts",
        description: error instanceof Error ? error.message : "Could not load shifts for the selected doctor.",
      });
      setAllShifts([]); // Clear to empty array on error
    } finally {
      setIsLoadingShifts(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchShifts(selectedDoctorId);
    } else {
      setAllShifts([]); // Clear shifts if no doctor is selected
    }
    // Reset date/pending state when doctor changes
    setSelectedDate(undefined);
    setSelectedRange(undefined);
    setPendingRanges([]);
  }, [selectedDoctorId, fetchShifts]);

  // --- Derived State ---
  const currentDate = useMemo(() => {
    return calendarMode === 'single' ? selectedDate : selectedRange?.from;
  }, [calendarMode, selectedDate, selectedRange]);

  const shiftsForDate = useMemo(() => {
    if (!currentDate || !allShifts) return [];
    return allShifts.filter(shift => isSameDay(shift.startTime, currentDate));
  }, [allShifts, currentDate]);

  // --- Actions (Keep handleSaveChanges, addDefaultRanges, etc. as they were) ---
  const handleSaveChanges = async () => {
    if (!selectedDoctorId || pendingRanges.length === 0) {
      toast({ title: "No changes to save." });
      return;
    }
    setIsLoadingShifts(true); // Indicate saving activity
    try {
      const status = await registerShifts(selectedDoctorId, pendingRanges);
      if (status >= 200 && status < 300) {
        toast({
          variant: "success",
          title: "Shifts Registered",
          description: `${pendingRanges.length} new shift(s) saved successfully.`,
        });
        setPendingRanges([]); // Clear pending changes
        await fetchShifts(selectedDoctorId); // Refetch shifts
      } else {
        throw new Error(`Server responded with status ${status}`);
      }
    } catch (error) {
      console.error("Failed to register shifts:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Shifts",
        description: error instanceof Error ? error.message : "Could not save the new shifts.",
      });
    } finally {
        setIsLoadingShifts(false); // Stop saving indicator
    }
  };

  const addDefaultRanges = (targetDate: Date) => {
    const defaultSlots = generateTimeSlots(targetDate);
    const newRanges = defaultSlots
      .filter(slot => !shiftsForDate.some(existing =>
          existing.startTime.getTime() === slot.startTime.getTime() &&
          existing.endTime.getTime() === slot.endTime.getTime()
      ))
      .map(slot => ({
        startTime: formatToApiIsoString(slot.startTime),
        endTime: formatToApiIsoString(slot.endTime),
      }));

    setPendingRanges(prev => {
        const existingKeys = new Set(prev.map(r => `${r.startTime}-${r.endTime}`));
        const uniqueNewRanges = newRanges.filter(r => !existingKeys.has(`${r.startTime}-${r.endTime}`));
        return [...prev, ...uniqueNewRanges];
    });
    toast({ title: "Default slots added to pending changes." });
  };

  const handleAssignDefaultDate = () => {
    if (!selectedDate) {
      toast({ variant: "destructive", title: "Please select a date first." });
      return;
    }
    addDefaultRanges(selectedDate);
  };

  const handleAssignDefaultRange = (includeWeekend: boolean) => {
    if (!selectedRange?.from || !selectedRange.to) {
      toast({ variant: "destructive", title: "Please select a date range first." });
      return;
    }

    let current = new Date(selectedRange.from);
    const to = new Date(selectedRange.to);
    const allNewRanges: { startTime: string; endTime: string }[] = [];

    while (current <= to) {
      const dayOfWeek = current.getDay();
      if (includeWeekend || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        const defaultSlots = generateTimeSlots(current);
        const rangesForDay = defaultSlots.map(slot => ({
          startTime: formatToApiIsoString(slot.startTime),
          endTime: formatToApiIsoString(slot.endTime),
        }));
        allNewRanges.push(...rangesForDay);
      }
      current.setDate(current.getDate() + 1);
    }

     setPendingRanges(prev => {
        const existingKeys = new Set(prev.map(r => `${r.startTime}-${r.endTime}`));
        const uniqueNewRanges = allNewRanges.filter(r => {
            const key = `${r.startTime}-${r.endTime}`;
            if (existingKeys.has(key)) return false;
            const rStartTime = parseApiIsoString(r.startTime);
            const rEndTime = parseApiIsoString(r.endTime);
            return !allShifts.some(existing =>
                existing.startTime.getTime() === rStartTime.getTime() &&
                existing.endTime.getTime() === rEndTime.getTime()
            );
        });
        return [...prev, ...uniqueNewRanges];
    });

    toast({ title: "Default range slots added to pending changes." });
  };

  const handleClearPending = () => {
    setPendingRanges([]);
    toast({ title: "Pending changes cleared." });
  };


  return (
    <div className="container mx-auto py-8 px-1">
      <h1 className="text-3xl font-bold mb-8">Doctor Schedule Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doctor List - Use actual component wrapped in Suspense */}
        <div className="lg:col-span-3">
          {/* Wrap DoctorList in Suspense */}
          <Suspense fallback={<DoctorListFallback />}>
            <DoctorList
              selectedDoctorId={selectedDoctorId}
              onSelectDoctor={(id) => {
                // Avoid selecting the same doctor again if already selected
                if (id !== selectedDoctorId) {
                    setSelectedDoctorId(id);
                    // State resets (date, range, pending) are handled in useEffect [selectedDoctorId]
                }
              }}
              // Optionally pass maxVisibleDoctors if needed
              // maxVisibleDoctors={8}
            />
          </Suspense>
        </div>

        {/* Right side content (Calendar, Controls, TimeGrid) */}
        {selectedDoctorId ? (
          <>
            {/* Calendar */}
            <div className="lg:col-span-3">
              <CalendarStaff
                calendarMode={calendarMode}
                setCalendarMode={(mode) => {
                    setCalendarMode(mode);
                    setSelectedDate(undefined);
                    setSelectedRange(undefined);
                    setPendingRanges([]);
                }}
                selectedDate={selectedDate}
                selectedRange={selectedRange}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedRange(undefined);
                  setPendingRanges([]);
                }}
                onSelectRange={(range) => {
                  setSelectedRange(range);
                  setSelectedDate(undefined);
                  setPendingRanges([]);
                }}
              />
            </div>

            {/* Controls and Time Slots */}
            <div className="lg:col-span-6 space-y-6">
              <AssignControls
                onSaveChanges={handleSaveChanges}
                onAssignDefaultDate={handleAssignDefaultDate}
                onAssignDefaultRange={handleAssignDefaultRange}
                onClearPending={handleClearPending}
                calendarMode={calendarMode}
                hasPendingChanges={pendingRanges.length > 0}
                isDateOrRangeSelected={!!selectedDate || !!selectedRange?.from} // Check range.from
                // Pass loading state to disable buttons during save
                isSaving={isLoadingShifts && pendingRanges.length > 0}
              />

              {isLoadingShifts && pendingRanges.length === 0 ? ( // Show loading only when fetching, not saving
                 <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading Shifts...</span>
                 </div>
              ) : (
                <TimeSlotGrid
                  currentDate={currentDate}
                  shiftsForDate={shiftsForDate}
                  pendingRanges={pendingRanges}
                  setPendingRanges={setPendingRanges}
                />
              )}
            </div>
          </>
        ) : (
          // Placeholder when no doctor is selected
          <div className="lg:col-span-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 inline-block mb-4">
                <UserRound className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Doctor Selected</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Please select a doctor from the list to view and manage their schedule.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}