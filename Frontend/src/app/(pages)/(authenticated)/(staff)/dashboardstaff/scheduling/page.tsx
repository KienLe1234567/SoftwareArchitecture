"use client";

import { Suspense, useState } from "react";

import { UserRound } from "lucide-react";

import StaffList from "@/components/StaffList";
import StaffShiftCalendar from "@/components/StaffShiftCalendar";
import { Skeleton } from "@/components/ui/skeleton";

const StaffListFallback = () => (
  <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
    <h2 className="mb-4 text-xl font-semibold">Staff</h2>
    <Skeleton className="mb-4 h-10 w-full" />
    <div className="mt-4 flex-1 space-y-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

export default function SchedulePage() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-1 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Suspense fallback={<StaffListFallback />}>
            <StaffList
              selectedStaffId={selectedStaffId}
              onSelectStaff={(id) => {
                if (id !== selectedStaffId) {
                  setSelectedStaffId(id);
                }
              }}
            />
          </Suspense>
        </div>

        {selectedStaffId ? (
          <div className="lg:col-span-9">
            <StaffShiftCalendar staffId={selectedStaffId} />
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-md dark:bg-gray-800 lg:col-span-9">
            <div className="text-center">
              <div className="mb-4 inline-block rounded-full bg-primary/10 p-6">
                <UserRound className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">
                No Staff Member Selected
              </h2>
              <p className="mx-auto max-w-md text-muted-foreground">
                Please select a staff member from the list to view and manage
                their schedule.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
