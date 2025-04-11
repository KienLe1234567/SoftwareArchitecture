// components/StaffList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { Loader2, Mail, Phone, Search, User } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllStaffs } from "@/lib/staff";
import { cn } from "@/lib/utils";
import type { Staff } from "@/types/staff";

// components/StaffList.tsx

interface Props {
  selectedStaffId: string | null;
  onSelectStaff: (id: string) => void;
  maxVisibleStaff?: number;
}

export default function StaffList({
  selectedStaffId,
  onSelectStaff,
  maxVisibleStaff,
}: Props) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<Staff["staffType"]>("Doctor");

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllStaffs();
        setStaff(data.staffs);
      } catch (err) {
        console.error("Failed to fetch staff:", err);
        let errorMessage = "Failed to load the list of staff members.";
        if (
          err instanceof Error &&
          err.message.includes("self-signed certificate")
        ) {
          errorMessage =
            "Could not connect securely to the server (SSL certificate issue). Please check the server configuration or development settings.";
        }
        setError(errorMessage);
        setStaff([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const filteredStaff = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          member.staffType === selectedRole
      ),
    [staff, searchTerm, selectedRole]
  );

  const isScrollable = useMemo(
    () =>
      maxVisibleStaff !== undefined && filteredStaff.length > maxVisibleStaff,
    [filteredStaff.length, maxVisibleStaff]
  );

  const handleCloseErrorDialog = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Staff...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full flex-col rounded-xl bg-white p-6 shadow-md transition-all duration-200 dark:bg-gray-800">
        <Tabs
          defaultValue="Doctor"
          className="mb-4"
          onValueChange={(value) =>
            setSelectedRole(value as Staff["staffType"])
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Doctor">Doctors</TabsTrigger>
            <TabsTrigger value="Nurse">Nurses</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${selectedRole.toLowerCase()}s...`}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!error}
          />
        </div>

        <div
          className={cn(
            "mt-4 flex-1 space-y-2",
            isScrollable && "overflow-y-auto"
          )}
          style={
            isScrollable
              ? { maxHeight: `${maxVisibleStaff! * 80}px` }
              : undefined
          }
        >
          {!error &&
            filteredStaff.length > 0 &&
            filteredStaff.map((member) => (
              <button
                key={member.id}
                className={cn(
                  "w-full rounded-lg p-3 text-left transition-all duration-150",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                  selectedStaffId === member.id
                    ? "border-l-4 border-primary bg-primary/10"
                    : "border-l-4 border-transparent"
                )}
                onClick={() => member.id && onSelectStaff(member.id)}
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{member.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{member.phoneNumber}</span>
                  </div>
                </div>
              </button>
            ))}

          {!error && filteredStaff.length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              {searchTerm ? (
                <>
                  <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>
                    No {selectedRole.toLowerCase()}s match "{searchTerm}"
                  </p>
                </>
              ) : (
                <>
                  <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No {selectedRole.toLowerCase()}s available</p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="py-6 text-center text-destructive">
              <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Could not load staff list.</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!error}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCloseErrorDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Loading Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseErrorDialog}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
