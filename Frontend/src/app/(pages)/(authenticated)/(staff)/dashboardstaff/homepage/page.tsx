"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { CalendarCheck, UserRound, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Assuming Shadcn's toast
import type { Doctor, DoctorDto } from "@/types/doctor"; // Use your actual types
import type { Shift, ShiftDto } from "@/types/shift"; // Use your actual types
import { getAllStaffs, getStaffShifts } from "@/lib/staff"; // Use your actual API functions
import { parseApiIsoString, formatTime } from "@/lib/utils"; // Import helpers
import { isSameDay } from 'date-fns'; // Import date-fns helper

interface DoctorShiftInfo {
    doctor: Doctor;
    shiftCount: number;
}

interface TodayScheduleItem {
    doctorName: string;
    shifts: Shift[]; // Store the actual shift objects for today
}

export default function HospitalManagerHomepage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [allShifts, setAllShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Fetch all doctors
            const doctorsData: DoctorDto = await getAllStaffs();
            const fetchedDoctors = doctorsData.staffs ?? [];
            setDoctors(fetchedDoctors);

            if (fetchedDoctors.length > 0) {
                // 2. Fetch shifts for all doctors in parallel
                const shiftPromises = fetchedDoctors.map(doc => getStaffShifts(doc.id));
                const shiftResults = await Promise.allSettled(shiftPromises); // Use allSettled to handle individual failures

                const successfullyFetchedShifts: Shift[] = [];
                shiftResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        // Parse dates for successful fetches
                        const parsed = result.value.shifts.map(shift => ({
                            ...shift,
                            startTime: parseApiIsoString(shift.startTime as unknown as string),
                            endTime: parseApiIsoString(shift.endTime as unknown as string),
                        }));
                        successfullyFetchedShifts.push(...parsed);
                    } else {
                        // Log or toast errors for individual doctor shift fetches
                        console.error(`Failed to fetch shifts for doctor ${fetchedDoctors[index]?.name}:`, result.reason);
                        // Optionally show a toast for specific failures
                        // toast({ variant: "destructive", title: `Shift Fetch Error`, description: `Could not load shifts for Dr. ${fetchedDoctors[index]?.name}.` });
                    }
                });
                setAllShifts(successfullyFetchedShifts);

                if (shiftResults.some(r => r.status === 'rejected')) {
                     toast({ variant: "destructive", title: `Partial Data`, description: `Could not load shifts for one or more doctors.` });
                }

            } else {
                setAllShifts([]); // No doctors, so no shifts
            }

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to load dashboard data: ${errorMessage}`);
            toast({
                variant: "destructive",
                title: "Error Loading Data",
                description: errorMessage,
            });
            setDoctors([]);
            setAllShifts([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]); // Include toast in dependencies

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Run fetch on mount

    // --- Calculate Statistics using useMemo ---

    const totalDoctors = useMemo(() => doctors.length, [doctors]);

    const totalScheduledSlots = useMemo(() => allShifts.length, [allShifts]);

    const busiestDoctorInfo: DoctorShiftInfo | null = useMemo(() => {
        if (!doctors.length || !allShifts.length) return null;

        const shiftsByDoctor = allShifts.reduce((acc, shift) => {
            acc[shift.staffId] = (acc[shift.staffId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let busiestId: string | null = null;
        let maxShifts = 0;

        for (const staffId in shiftsByDoctor) {
            if (shiftsByDoctor[staffId] > maxShifts) {
                maxShifts = shiftsByDoctor[staffId];
                busiestId = staffId;
            }
        }

        if (!busiestId) return null;

        const doctor = doctors.find(doc => doc.id === busiestId);
        return doctor ? { doctor, shiftCount: maxShifts } : null;

    }, [doctors, allShifts]);

    const todaySchedule: TodayScheduleItem[] = useMemo(() => {
        const today = new Date();
        const todayShifts = allShifts.filter(shift => isSameDay(shift.startTime, today));

        if (todayShifts.length === 0) return [];

        // Group shifts by doctor ID for today
        const shiftsGroupedByDoctor = todayShifts.reduce((acc, shift) => {
            if (!acc[shift.staffId]) {
                acc[shift.staffId] = [];
            }
            acc[shift.staffId].push(shift);
            // Sort shifts by start time within each group
            acc[shift.staffId].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
            return acc;
        }, {} as Record<string, Shift[]>);

        // Map grouped shifts to the desired structure including doctor name
        return Object.entries(shiftsGroupedByDoctor).map(([staffId, shifts]) => {
            const doctor = doctors.find(doc => doc.id === staffId);
            return {
                doctorName: doctor?.name ?? `Unknown Doctor (ID: ${staffId})`,
                shifts: shifts
            };
        }).sort((a, b) => a.doctorName.localeCompare(b.doctorName)); // Sort alphabetically by doctor name

    }, [allShifts, doctors]);


    // --- Render Logic ---

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="ml-4 text-xl text-muted-foreground">Loading Dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                 <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4 text-destructive">Error Loading Dashboard</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={fetchData}>
                    Retry Loading
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Hospital Manager Dashboard</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Doctors</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <UserRound className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-semibold">{totalDoctors}</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Scheduled Slots</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <CalendarCheck className="h-8 w-8 text-green-600" />
                        <span className="text-2xl font-semibold">{totalScheduledSlots}</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Busiest Doctor (Overall)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start justify-between min-h-[80px]"> {/* Added min-height */}
                        {busiestDoctorInfo ? (
                            <>
                                <div className="text-lg font-semibold">
                                    {busiestDoctorInfo.doctor.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {busiestDoctorInfo.shiftCount} slots scheduled
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground">No shift data available.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Scheduling Working Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground">
                            Manage and assign working schedules for doctors.
                        </p>
                        <Link href="/dashboardstaff/scheduling" legacyBehavior>
                            <a className="block"> {/* Wrap Button in <a> for Next 13+ Link */}
                                <Button variant="default" className="w-full">
                                    Go to Scheduling
                                </Button>
                            </a>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Manage Staff</CardTitle> {/* Changed from Tracking Workload */}
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground">
                            Add, edit, or remove doctor information. {/* Updated description */}
                        </p>
                        {/* Assuming the manage staff page is at '/dashboardstaff/manage' */}
                        <Link href="/dashboardstaff/manage" legacyBehavior>
                             <a className="block">
                                <Button variant="default" className="w-full">
                                    Go to Staff Management
                                </Button>
                            </a>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">Today's Schedule</h2>
                {todaySchedule.length === 0 ? (
                    <p className="text-muted-foreground">No doctors scheduled for today.</p>
                ) : (
                    <ul className="space-y-4">
                        {todaySchedule.map((item) => (
                            <li key={item.doctorName} className="border-b pb-3 last:border-b-0"> {/* Added border */}
                                <div className="font-semibold mb-1">{item.doctorName}</div>
                                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                                    {item.shifts.map(shift => (
                                        <span key={shift.id} className="bg-muted px-2 py-0.5 rounded text-xs">
                                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                        </span>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}