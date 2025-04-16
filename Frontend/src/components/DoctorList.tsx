// components/DoctorList.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, User, Mail, Phone, Loader2 } from "lucide-react"; // Removed AlertCircle
import { Input } from "@/components/ui/input";
import { getAllStaffs } from "@/lib/staff";
import type { Doctor } from "@/types/doctor"; // Ensure your Doctor type is imported

// Import AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  // AlertDialogCancel, // Optional
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Adjust path if needed

interface Props {
  selectedDoctorId: string | null;
  onSelectDoctor: (id: string) => void;
  maxVisibleDoctors?: number;
}

export default function DoctorList({ selectedDoctorId, onSelectDoctor, maxVisibleDoctors }: Props) {
  // State for doctors list, loading, and error message for the dialog
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Holds the error message string
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data on component mount using useEffect
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors before fetching
      try {
        const data = await getAllStaffs();
        const mappedDoctors = data.staffs.map(staff => ({
            id: staff.id,
            name: staff.name,
            email: staff.email,
            phoneNumber: staff.phoneNumber,
            address: staff.address,
        }));
        setDoctors(mappedDoctors);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        let errorMessage = "Failed to load the list of doctors."; // Default
        if (err instanceof Error && err.message.includes('self-signed certificate')) {
             errorMessage = "Could not connect securely to the server (SSL certificate issue). Please check the server configuration or development settings.";
        }
        setError(errorMessage); // Set error message to trigger dialog
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []); // Run once on mount

  // Filtering logic
  const filteredDoctors = useMemo(() => doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [doctors, searchTerm]);

  // Scroll logic
  const isScrollable = useMemo(
    () => maxVisibleDoctors !== undefined && filteredDoctors.length > maxVisibleDoctors,
    [filteredDoctors.length, maxVisibleDoctors]
  );

  // Function to close the error dialog
  const handleCloseErrorDialog = () => {
      setError(null);
  }

  // --- Render Logic ---

  // Loading State - Render this first if loading
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading Doctors...</p>
      </div>
    );
  }

  // Main component render (handles showing list or empty state)
  // The error state is handled by the AlertDialog below
  return (
    <> {/* Use Fragment to wrap component and dialog */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Doctors</h2>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search doctors..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!error} // Optionally disable search if there was a load error
          />
        </div>

        <div
          className={cn(
            "space-y-2 mt-4 flex-1",
            isScrollable && "overflow-y-auto",
          )}
          style={
            isScrollable
              ? { maxHeight: `${maxVisibleDoctors! * 80}px` }
              : undefined
          }
        >
          {/* Only show list/buttons if there was no error during load */}
          {!error && filteredDoctors.length > 0 && (
            filteredDoctors.map((doctor) => (
              <button
                key={doctor.id}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-150",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                  selectedDoctorId === doctor.id
                    ? "bg-primary/10 border-l-4 border-primary"
                    : "border-l-4 border-transparent",
                )}
                onClick={() => onSelectDoctor(doctor.id)}
              >
                {/* ... button content (name, email, phone) ... */}
                 <div className="flex flex-col gap-1">
                    <div className="font-medium">{doctor.name}</div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{doctor.phoneNumber}</span>
                    </div>
                  </div>
              </button>
            ))
          )}

          {/* Show "No doctors found" only if no error and list is empty */}
          {!error && filteredDoctors.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm ? (
                  <>
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No doctors match "{searchTerm}"</p>
                  </>
              ) : (
                  <>
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No doctors available</p>
                  </>
              )}
            </div>
          )}

           {/* Optional: Show a placeholder message if there was an error */}
           {error && (
                <div className="text-center py-6 text-destructive">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Could not load doctor list.</p>
                </div>
           )}

        </div>
      </div>

      {/* --- Error Alert Dialog --- */}
      <AlertDialog open={!!error} onOpenChange={(isOpen) => {
          if (!isOpen) {
              handleCloseErrorDialog(); // Clear error when dialog closes
          }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Loading Error</AlertDialogTitle>
            <AlertDialogDescription>
              {error} {/* Display the error message */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseErrorDialog}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}