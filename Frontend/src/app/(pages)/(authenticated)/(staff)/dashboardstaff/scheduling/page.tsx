"use client";

// Import Suspense from React
import { Suspense, useState } from "react";

// Import helpers
import { UserRound } from "lucide-react";

// Import the actual DoctorList
// Use your actual Shift types
import DoctorList from "@/components/DoctorList";
// Use your actual API functions
// Correct the import path if necessary (usually components/ui for Shadcn)
import StaffShiftCalendar from "@/components/StaffShiftCalendar";
// Import Skeleton for fallback
import { Skeleton } from "@/components/ui/skeleton";

// Remove the DummyDoctorList component definition
// const DummyDoctorList = (...) => { ... };

// Define a simple loading fallback for the DoctorList
const DoctorListFallback = () => (
  <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
    <h2 className="mb-4 text-xl font-semibold">Doctors</h2>
    <Skeleton className="mb-4 h-10 w-full" /> {/* Search input skeleton */}
    <div className="mt-4 flex-1 space-y-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      {/* Add more skeletons if desired */}
    </div>
  </div>
);

export default function SchedulePage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-1 py-8">
      {/* <h1 className="mb-8 text-3xl font-bold">Doctor Schedule Management</h1> */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
          <div className="lg:col-span-9">
            <StaffShiftCalendar staffId={selectedDoctorId} />
          </div>
        ) : (
          // Placeholder when no doctor is selected
          <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-md dark:bg-gray-800 lg:col-span-9">
            <div className="text-center">
              <div className="mb-4 inline-block rounded-full bg-primary/10 p-6">
                <UserRound className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">
                No Doctor Selected
              </h2>
              <p className="mx-auto max-w-md text-muted-foreground">
                Please select a doctor from the list to view and manage their
                schedule.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
