"use client"

// import { useState, useEffect } from "react";
// import type { Doctor } from "@/types/doctor";
// import type { Shift, ShiftDto } from "@/types/shift";
// import { getStaffByID, getStaffShifts } from "@/lib/staff"; // Import API functions
// import DoctorList from "@/components/DoctorList";
// import CalendarStaff from "@/components/CalendarStaff";
// import WorkloadTable from "@/components/WorkloadTable";
// import WorkloadSummary from "@/components/WorkloadSummary";
// import { DateRange } from "react-day-picker";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// // Import AlertDialog components
// import {
//   AlertDialog,
//   AlertDialogAction,
//   // AlertDialogCancel, // Optional: Use if you prefer a Cancel button style
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"; // Ensure this path is correct

export default function DoctorWorkloadPage() {
  // // State for selections
  // const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  // const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null); // Store the full selected doctor object
  // const [calendarMode, setCalendarMode] = useState<"single" | "range">("range");
  // const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  // const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
  //   from: new Date(), // Default start date (today)
  //   to: new Date(new Date().setDate(new Date().getDate() + 6)), // Default end date (6 days from today)
  // });

  // // State for fetched data, loading, and errors
  // const [shiftsData, setShiftsData] = useState<Shift[]>([]);
  // const [isLoadingData, setIsLoadingData] = useState<boolean>(false); // Combined loading state
  // const [fetchError, setFetchError] = useState<string | null>(null); // Holds error message for dialog

  // // --- Effect to fetch Doctor Details AND Shifts when selectedDoctorId changes ---
  // useEffect(() => {
  //   // Only run if an ID is selected
  //   if (selectedDoctorId) {
  //     const fetchDoctorAndShifts = async () => {
  //       setIsLoadingData(true);
  //       setFetchError(null); // Clear previous errors *before* fetching
  //       setSelectedDoctor(null); // Clear previous doctor data
  //       setShiftsData([]); // Clear previous shifts data

  //       try {
  //         // Use Promise.all to fetch both pieces of data concurrently
  //         const [doctorDetails, shiftsDto] = await Promise.all([
  //           getStaffByID(selectedDoctorId),
  //           getStaffShifts(selectedDoctorId),
  //         ]);

  //         // Process the fetched data
  //         setSelectedDoctor(doctorDetails); // Set the doctor object

  //         // IMPORTANT: Parse date strings from shifts API response into Date objects
  //         const parsedShifts = shiftsDto.shifts.map((shift) => ({
  //           ...shift,
  //           startTime: new Date(shift.startTime),
  //           endTime: new Date(shift.endTime),
  //         }));
  //         setShiftsData(parsedShifts); // Set the parsed shifts

  //       } catch (error) {
  //         console.error("Failed to fetch doctor details or shifts:", error);
  //         // Determine the error message to display
  //         let errorMessage = "An error occurred while loading workload data."; // Default message
  //         if (error instanceof Error && error.message.includes("doctor by id")) {
  //            errorMessage = "Could not load the selected doctor's details.";
  //         } else if (error instanceof Error && error.message.includes("shifts")) {
  //            errorMessage = "Could not load the shifts for the selected doctor.";
  //         }
  //         setFetchError(errorMessage); // Set the error message state to trigger the dialog
  //         setSelectedDoctor(null); // Ensure doctor is cleared on error
  //         setShiftsData([]); // Ensure shifts are cleared on error
  //       } finally {
  //         setIsLoadingData(false); // Set loading state to false
  //       }
  //     };

  //     fetchDoctorAndShifts();
  //   } else {
  //     // Clear data if no doctor is selected (deselected)
  //     setSelectedDoctor(null);
  //     setShiftsData([]);
  //     setFetchError(null); // Clear error if deselected
  //     setIsLoadingData(false);
  //   }
  // }, [selectedDoctorId]); // Dependency array: run when selectedDoctorId changes

  // // Handler function that receives the ID from DoctorList
  // // Assumes DoctorList calls onSelectDoctor with the ID string
  // const handleSelectDoctorById = (id: string | null) => {
  //   // Simply update the ID state. The useEffect will handle fetching.
  //   setSelectedDoctorId(id);
  // };

  // // Function to close the error dialog and clear the error state
  // const handleCloseErrorDialog = () => {
  //   setFetchError(null);
  // };


  // // --- Render Logic ---
  // return (
  //   <div className="min-h-screen flex flex-col">
  //     <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
  //       {/* Column 1: Doctor List & Calendar */}
  //       <div className="col-span-1 flex flex-col gap-4">
  //         <div className="flex w-full max-h-[calc(100vh-350px)]"> {/* Adjust max-height as needed */}
  //           {/* DoctorList expects onSelectDoctor to take an ID */}
  //           <DoctorList
  //             selectedDoctorId={selectedDoctorId}
  //             onSelectDoctor={handleSelectDoctorById} // Pass the ID handler
  //             maxVisibleDoctors={2} // Example: show more doctors before scrolling
  //           />
  //         </div>
  //         <div className="mt-2">
  //           <CalendarStaff
  //             calendarMode={calendarMode}
  //             setCalendarMode={setCalendarMode}
  //             selectedDate={selectedDate}
  //             selectedRange={selectedRange}
  //             onSelectDate={setSelectedDate}
  //             onSelectRange={setSelectedRange}
  //             futureOnly={false} // Or true, depending on your requirements
  //           />
  //         </div>
  //       </div>

  //       {/* Column 2: Workload Details */}
  //       <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
  //         {/* Initial state: No doctor selected */}
  //         {!selectedDoctorId && (
  //           <Card>
  //             <CardContent className="p-6 text-center text-muted-foreground">
  //               Please select a doctor from the list to view their workload.
  //             </CardContent>
  //           </Card>
  //         )}

  //         {/* Doctor selected: Show loading or data */}
  //         {/* Error is handled by the AlertDialog below, not shown inline */}
  //         {selectedDoctorId && (
  //           <>
  //             {/* Loading State */}
  //             {isLoadingData && (
  //               <div className="space-y-4">
  //                 <Skeleton className="h-24 w-full rounded-md" /> {/* Summary Skeleton */}
  //                 <Skeleton className="h-64 w-full rounded-md" /> {/* Table Skeleton */}
  //               </div>
  //             )}

  //             {/* Success State: Data loaded (doctor object must exist) */}
  //             {/* Render data only if NOT loading and NO error occurred */}
  //             {selectedDoctor && !isLoadingData && !fetchError && (
  //               <>
  //                 <WorkloadSummary
  //                   doctor={selectedDoctor} // Pass the fetched doctor object
  //                   shifts={shiftsData}     // Pass the fetched shifts
  //                   selectedRange={calendarMode === "range" ? selectedRange : undefined}
  //                   selectedDate={calendarMode === "single" ? selectedDate : undefined}
  //                 />
  //                 <WorkloadTable
  //                   doctor={selectedDoctor} // Pass the fetched doctor object
  //                   shifts={shiftsData}     // Pass the fetched shifts
  //                   selectedRange={calendarMode === "range" ? selectedRange : undefined}
  //                   selectedDate={calendarMode === "single" ? selectedDate : undefined}
  //                 />
  //               </>
  //             )}
  //           </>
  //         )}
  //       </div>
  //     </div>

  //     {/* --- Error Alert Dialog --- */}
  //     {/* Controlled by the fetchError state (true if fetchError has a message string) */}
  //     <AlertDialog open={!!fetchError} onOpenChange={(isOpen) => {
  //         // If the dialog is attempting to close (isOpen becomes false), clear the error state
  //         if (!isOpen) {
  //             handleCloseErrorDialog();
  //         }
  //         // We don't need to explicitly handle opening via state change here
  //     }}>
  //       <AlertDialogContent>
  //         <AlertDialogHeader>
  //           <AlertDialogTitle>Error Loading Data</AlertDialogTitle>
  //           <AlertDialogDescription>
  //             {fetchError} {/* Display the error message from state */}
  //           </AlertDialogDescription>
  //         </AlertDialogHeader>
  //         <AlertDialogFooter>
  //           {/* Action button usually confirms/closes */}
  //           <AlertDialogAction onClick={handleCloseErrorDialog}>OK</AlertDialogAction>
  //         </AlertDialogFooter>
  //       </AlertDialogContent>
  //     </AlertDialog>

  //   </div>
  // );
}