// Ví dụ: src/app/admin/page.tsx (Hoặc đường dẫn phù hợp)
"use client";

import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Users,
    CalendarDays,
    Activity,
    Settings, // Không dùng nữa
    Briefcase,
    Loader2,
    AlertCircle, // Vẫn dùng icon này cho lỗi
    UserCheck,
    MousePointerClick, // Icon cho gợi ý click
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast"; // Giả sử toast hoạt động
import type { Doctor, DoctorDto } from "@/types/doctor"; // Đường dẫn types
import type { Shift } from "@/types/shift"; // Đường dẫn types
import { getAllStaffs, getStaffShifts } from "@/lib/staff"; // Đường dẫn lib/staff
// Import date-fns helpers cần thiết
import { isSameDay, eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"; // Import Recharts

// --- Helper Functions ---
// (Bạn có thể chuyển các hàm này vào @/lib/utils nếu muốn)

/**
 * Parses a date string (potentially ISO format) into a Date object safely.
 * Returns null if the date string is invalid.
 */
function safeParseDate(dateString: string | Date | undefined | null): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) {
        return !isNaN(dateString.getTime()) ? dateString : null;
    }
    try {
        const parsed = parseISO(dateString);
        if (!isNaN(parsed.getTime())) { return parsed; }
        const fallbackParsed = new Date(dateString);
        return !isNaN(fallbackParsed.getTime()) ? fallbackParsed : null;
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return null;
    }
}

/**
 * Formats a Date object into a locale-specific time string (e.g., "10:30 AM").
 * Returns an empty string if the date is invalid.
 */
function formatTime(date: Date | null | undefined): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) { return ""; }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
// --- End Helper Functions ---


export default function AdminHomepage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [allShifts, setAllShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State để lưu ngày được chọn cho biểu đồ tròn, mặc định là hôm nay
    const [selectedDayForDistribution, setSelectedDayForDistribution] = useState<Date>(startOfDay(new Date()));
    const { toast } = useToast();

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setDoctors([]);
        setAllShifts([]);
        console.log("AdminHomepage: Starting data fetch...");

        try {
            console.log("AdminHomepage: Fetching staff...");
            const doctorsData: DoctorDto = await getAllStaffs();
            const fetchedDoctors = doctorsData.staffs ?? [];
            setDoctors(fetchedDoctors);
            console.log(`AdminHomepage: Fetched ${fetchedDoctors.length} staff.`);

            if (fetchedDoctors.length > 0) {
                console.log("AdminHomepage: Fetching shifts for all staff (Warning: Potentially slow)...");
                const shiftPromises = fetchedDoctors.map(doc => getStaffShifts(doc.id));
                const shiftResults = await Promise.allSettled(shiftPromises);
                console.log("AdminHomepage: Shift fetch results received.");

                const successfullyFetchedShifts: Shift[] = [];
                let failedShiftFetches = 0;

                shiftResults.forEach((result, index) => {
                    const doctorName = fetchedDoctors[index]?.name ?? `ID ${fetchedDoctors[index]?.id}`;
                    if (result.status === 'fulfilled' && result.value?.shifts) {
                        const parsed = result.value.shifts
                            .map(shift => {
                                const startTime = safeParseDate(shift.startTime as unknown as string);
                                const endTime = safeParseDate(shift.endTime as unknown as string);
                                if (startTime && endTime) { return { ...shift, startTime, endTime }; }
                                console.warn(`AdminHomepage: Could not parse dates for a shift of ${doctorName}. Start: ${shift.startTime}, End: ${shift.endTime}`);
                                return null;
                            })
                            .filter((s): s is Shift => s !== null);
                        successfullyFetchedShifts.push(...parsed);
                    } else {
                        failedShiftFetches++;
                        console.error(`AdminHomepage: Failed to fetch shifts for ${doctorName}:`, result.status === 'rejected' ? result.reason : 'No shifts data received');
                    }
                });
                setAllShifts(successfullyFetchedShifts);
                console.log(`AdminHomepage: Processed ${successfullyFetchedShifts.length} valid shifts.`);

                if (failedShiftFetches > 0) {
                    const errorMsg = `Could not load shifts for ${failedShiftFetches} staff members. Data might be incomplete.`;
                    setError(prev => (prev ? `${prev}\n` : '') + errorMsg);
                    toast({ variant: "destructive", title: `Partial Data`, description: errorMsg, duration: 5000 });
                }
            } else {
                console.log("AdminHomepage: No staff found, skipping shift fetch.");
                setAllShifts([]);
            }
            console.log("AdminHomepage: Data fetching process completed.");
        } catch (err) {
            console.error("AdminHomepage: Critical error fetching dashboard data:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to load essential dashboard data: ${errorMessage}`);
            toast({ variant: "destructive", title: "Error Loading Data", description: errorMessage });
            setDoctors([]);
            setAllShifts([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Calculations ---
    const totalDoctors = useMemo(() => doctors.length, [doctors]);

    const shiftsTodayCount = useMemo(() => {
        if (isLoading || !allShifts.length) return 0;
        const today = new Date();
        return allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, today)).length;
    }, [allShifts, isLoading]);

    const staffWithMostShiftsToday: { name: string | undefined; count: number } | null = useMemo(() => {
        if (isLoading || doctors.length === 0 || !allShifts.length) return null;
        const today = new Date();
        const todayShiftsOnly = allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, today));
        if (todayShiftsOnly.length === 0) return null;

        const counts = todayShiftsOnly.reduce((acc, shift) => {
            acc[shift.staffId] = (acc[shift.staffId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        let busiestId: string | null = null;
        let maxCount = 0;
        for (const staffId in counts) { if (counts[staffId] > maxCount) { maxCount = counts[staffId]; busiestId = staffId; } }
        if (!busiestId) return null;
        const doctor = doctors.find(doc => doc.id === busiestId);
        return { name: doctor?.name, count: maxCount };
    }, [allShifts, doctors, isLoading]);


    // --- Chart Data Preparation ---
    const weeklyChartData = useMemo(() => {
        if (isLoading || !allShifts.length) return [];
        const today = new Date();
        const past7Days = eachDayOfInterval({
            start: startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)),
            end: startOfDay(today)
        });
        return past7Days.map(day => {
            const dayString = format(day, 'MMM d');
            const count = allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, day)).length;
            return { name: dayString, date: day, shifts: count }; // Include 'date' object
        });
    }, [allShifts, isLoading]);

    const staffDistributionData = useMemo(() => {
         const targetDayShifts = allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, selectedDayForDistribution));
         if (isLoading || targetDayShifts.length === 0 || doctors.length === 0) return [];
         const counts = targetDayShifts.reduce((acc, shift) => {
            const doctorName = doctors.find(doc => doc.id === shift.staffId)?.name ?? 'Unknown';
            acc[doctorName] = (acc[doctorName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [allShifts, doctors, isLoading, selectedDayForDistribution]); // Depend on selectedDayForDistribution

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // --- Chart Interaction Handler ---
    const handleBarClick = useCallback((data: any) => {
        const payload = data?.activePayload?.[0]?.payload;
        if (payload && payload.date instanceof Date) {
            console.log("Bar clicked, setting selected date:", payload.date);
            setSelectedDayForDistribution(payload.date);
        } else {
            console.log("Bar clicked, but no valid date found in payload:", payload);
        }
    }, []);

    // --- Render Logic ---
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* <h1 className="text-3xl font-bold">Admin Dashboard</h1> */}

            {/* Error Display using Card */}
            {error && !isLoading && (
                <Card className="border-destructive bg-destructive/10">
                    <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
                         <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                         <CardTitle className="text-destructive text-lg">Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-destructive/90 pb-4">
                        {error.split('\n').map((line, index) => (<p key={index}>{line}</p>))}
                         <Button onClick={fetchData} variant="destructive" size="sm" className="mt-3">
                             Retry Fetching Data
                         </Button>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Staff */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (<Skeleton className="h-8 w-16" />) : (<div className="text-2xl font-bold">{totalDoctors}</div>)}
                        <Skeleton className={`h-3 w-4/5 mt-1 ${isLoading ? 'visible' : 'invisible'}`} />
                        {!isLoading && <p className="text-xs text-muted-foreground">Registered staff members</p>}
                    </CardContent>
                </Card>
                {/* Shifts Today */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shifts Today</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (<Skeleton className="h-8 w-16" />) : (<div className="text-2xl font-bold">{shiftsTodayCount}</div>)}
                        <Skeleton className={`h-3 w-4/5 mt-1 ${isLoading ? 'visible' : 'invisible'}`} />
                        {!isLoading && <p className="text-xs text-muted-foreground">Total shifts scheduled today</p>}
                    </CardContent>
                </Card>
                {/* Most Active Today */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Active Today</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (<Skeleton className="h-8 w-3/4" />) : staffWithMostShiftsToday ? (<div className="text-2xl font-bold">{staffWithMostShiftsToday.name ?? 'N/A'}</div>) : (<div className="text-2xl font-bold text-muted-foreground">-</div>)}
                         <Skeleton className={`h-3 w-4/5 mt-1 ${isLoading ? 'visible' : 'invisible'}`} />
                         {!isLoading && (<p className="text-xs text-muted-foreground">{staffWithMostShiftsToday ? `with ${staffWithMostShiftsToday.count} shifts` : 'No shifts scheduled today'}</p>)}
                    </CardContent>
                </Card>
                 {/* System Status Placeholder */}
                 <Card className="bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" /> {/* Icon ví dụ */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Online</div>
                         <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation (Removed Settings) */}
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"> {/* Updated to lg:grid-cols-3 */}
                {[
                    { title: "Manage Staff", href: "/dashboardstaff/manageworker", icon: Users },
                    { title: "Scheduling", href: "/dashboardstaff/scheduling", icon: CalendarDays },
                    { title: "Track Workload", href: "/dashboardstaff/trackworkload", icon: Activity },
                ].map((section) => (
                    <Link href={section.href} key={section.title} legacyBehavior passHref>
                        <a className="block transition-transform duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
                            <Card className="h-full overflow-hidden hover:shadow-md dark:hover:bg-gray-800/60 flex flex-col">
                                <CardHeader className="pb-2">
                                     <section.icon className="h-6 w-6 text-muted-foreground mb-2" />
                                     <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow pt-0">
                                    {/* Optionally add description back here if desired */}
                                </CardContent>
                            </Card>
                        </a>
                    </Link>
                ))}
            </div>


            {/* Analytics Charts */}
            <div>
                <h2 className="mb-4 text-xl font-semibold">Analytics Overview</h2>
                {isLoading ? (
                     <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        <Card><CardHeader><Skeleton className="h-5 w-1/3 mb-2"/><Skeleton className="h-3 w-2/3"/></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-5 w-1/3 mb-2"/><Skeleton className="h-3 w-2/3"/></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
                    </div>
                ) : allShifts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        {/* Bar Chart (Interactive) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shifts in Last 7 Days</CardTitle>
                                <CardDescription className="flex items-center text-xs text-muted-foreground">
                                    <MousePointerClick className="h-3 w-3 mr-1 inline-block"/> Click a bar to see distribution for that day.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={weeklyChartData} onClick={handleBarClick} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}> {/* Adjusted margins */}
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
                                        <Bar dataKey="shifts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} cursor="pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Pie Chart (Dynamic based on selectedDayForDistribution) */}
                         <Card>
                            <CardHeader>
                                <CardTitle>Shift Distribution</CardTitle>
                                <CardDescription>
                                    Staff distribution for: {format(selectedDayForDistribution, 'EEEE, MMM d, yyyy')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                 {staffDistributionData.length > 0 ? (
                                     <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={staffDistributionData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                                                {staffDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
                                            <Legend formatter={(value) => <span className="text-foreground text-sm">{value}</span>}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                 ) : (
                                    <p className="text-muted-foreground text-center py-12">
                                        No shifts found for {format(selectedDayForDistribution, 'MMM d')}.
                                    </p>
                                 )}
                            </CardContent>
                        </Card>
                    </div>
                 ) : (
                     <Card>
                         <CardHeader><CardTitle>Analytics Overview</CardTitle></CardHeader>
                         <CardContent><p className="text-muted-foreground text-center py-12">No shift data available to display charts.</p></CardContent>
                     </Card>
                 )}
            </div>
        </div>
    );
}