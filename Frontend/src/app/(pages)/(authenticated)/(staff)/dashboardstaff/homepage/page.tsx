// src/app/admin/page.tsx (Hoặc đường dẫn phù hợp)

"use client";

// React & Next Imports
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast"; // Đảm bảo hook này hoạt động

// API & Type Imports
import { getAllStaffs, getStaffShifts } from "@/lib/staff";
import type { Staff, StaffDto } from "@/types/staff"; // Types cho Staff
import type { Shift, ShiftDto } from "@/types/shift"; // Types cho Shift

// Charting Library
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// Date Utility Library
import {
    differenceInMinutes,
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isValid,
    parseISO,
    startOfDay,
    startOfMonth,
    subDays,
    subMonths
} from 'date-fns';

// Icons
import {
    Activity,
    AlertCircle,
    Clock,
    CalendarDays,
    MousePointerClick,
    Settings,
    TrendingUp,
    Users
} from "lucide-react";

// --- Helper Functions ---

/**
 * Parses a date string or Date object safely into a valid Date object.
 * Returns null if parsing fails or input is invalid.
 */
function safeParseDate(dateString: string | Date | undefined | null): Date | null {
    if (!dateString) return null;
    // If it's already a valid Date object, return it.
    if (dateString instanceof Date && isValid(dateString)) {
        return dateString;
    }
    // If it's a string, try parsing as ISO first, then fallback.
    if (typeof dateString === 'string') {
        try {
            const parsed = parseISO(dateString);
            if (isValid(parsed)) { return parsed; }
            // Fallback to Date constructor (less reliable)
            const fallbackParsed = new Date(dateString);
            return isValid(fallbackParsed) ? fallbackParsed : null;
        } catch (e) {
            console.error("Error parsing date string:", dateString, e);
            return null;
        }
    }
    // Log warning for unsupported types if necessary
    console.warn("Unsupported date type provided to safeParseDate:", typeof dateString, dateString);
    return null;
}

/**
 * Calculates the duration of a shift in hours.
 * Returns 0 if times are invalid or end time is before start time.
 */
function calculateShiftDurationHours(shift: Shift): number {
    // Ensure startTime and endTime are valid Date objects (already parsed)
    const startTime = shift.startTime instanceof Date && isValid(shift.startTime) ? shift.startTime : null;
    const endTime = shift.endTime instanceof Date && isValid(shift.endTime) ? shift.endTime : null;

    if (startTime && endTime && endTime > startTime) {
        const durationMinutes = differenceInMinutes(endTime, startTime);
        return durationMinutes / 60; // Convert minutes to hours
    }
    return 0; // Return 0 for invalid durations
}

// --- Main Component ---

export default function AdminHomepage() {
    // --- State Variables ---
    const [staff, setStaff] = useState<Staff[]>([]);
    const [allShifts, setAllShifts] = useState<Shift[]>([]); // Contains shifts with parsed Date objects
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDayForDistribution, setSelectedDayForDistribution] = useState<Date>(startOfDay(new Date())); // For Pie Chart
    const { toast } = useToast();

    // State for Bar Chart time range control
    const [chartStartDate, setChartStartDate] = useState<Date>(startOfDay(subDays(new Date(), 6))); // Default: Last 7 days (start day)
    const [chartEndDate, setChartEndDate] = useState<Date>(startOfDay(new Date())); // Default: Last 7 days (end day = today)

    // --- Data Fetching Logic ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setStaff([]);
        setAllShifts([]);
        console.log("AdminHomepage: Starting data fetch...");

        try {
            // 1. Fetch all staff
            console.log("AdminHomepage: Fetching staff...");
            const staffData: StaffDto = await getAllStaffs();
            const fetchedStaff = staffData.staffs ?? [];
            setStaff(fetchedStaff);
            console.log(`AdminHomepage: Fetched ${fetchedStaff.length} staff.`);

            // 2. Fetch shifts for each staff member if staff exist
            if (fetchedStaff.length > 0) {
                console.log("AdminHomepage: Fetching shifts for all staff (may take time)...");
                const shiftPromises = fetchedStaff.map(s => {
                    if (!s.id) {
                        console.warn("AdminHomepage: Staff member found without ID, skipping shift fetch.", s);
                        return Promise.resolve(null); // Return resolved promise for filtering
                    }
                    return getStaffShifts(s.id); // Assumes getStaffShifts returns Promise<ShiftDto>
                });

                // Filter out null promises before awaiting
                const validShiftPromises = shiftPromises.filter(p => p !== null) as Promise<ShiftDto>[];
                // Keep track of staff corresponding to valid promises
                const staffForValidPromises = fetchedStaff.filter(s => !!s.id);

                const shiftResults = await Promise.allSettled(validShiftPromises);
                console.log("AdminHomepage: Shift fetch results received.");

                const processedShifts: Shift[] = []; // To store shifts with parsed dates
                let failedShiftFetches = 0;

                // Process results
                shiftResults.forEach((result, index) => {
                    const currentStaff = staffForValidPromises[index];
                    const staffName = currentStaff?.name ?? `ID ${currentStaff?.id ?? 'unknown'}`;

                    // Check if fetch was successful and data structure is as expected
                    if (result.status === 'fulfilled' && result.value?.shifts) {
                        const parsedAndValidShifts = result.value.shifts
                            .map(shift => {
                                // Parse dates safely
                                const startTime = safeParseDate(shift.startTime as unknown as string);
                                const endTime = safeParseDate(shift.endTime as unknown as string);
                                // Ensure staffId is present
                                const staffId = shift.staffId ?? currentStaff?.id;

                                if (startTime && endTime && staffId) {
                                    // Return valid Shift object with Date objects
                                    return { ...shift, staffId, startTime, endTime };
                                }
                                console.warn(`AdminHomepage: Could not parse dates or missing staffId for a shift of ${staffName}. Start: ${shift.startTime}, End: ${shift.endTime}`);
                                return null;
                            })
                            .filter((s): s is Shift => s !== null); // Filter out nulls (invalid shifts)
                        processedShifts.push(...parsedAndValidShifts);
                    } else {
                        failedShiftFetches++;
                        console.error(`AdminHomepage: Failed to fetch/process shifts for ${staffName}:`, result.status === 'rejected' ? result.reason : 'No shifts data received or unexpected structure');
                    }
                });

                setAllShifts(processedShifts); // Update state with valid, parsed shifts
                console.log(`AdminHomepage: Processed ${processedShifts.length} valid shifts with Date objects.`);

                // Handle partial failures
                if (failedShiftFetches > 0) {
                    const errorMsg = `Could not load shifts for ${failedShiftFetches} staff members. Data might be incomplete.`;
                    setError(prev => (prev ? `${prev}\n` : '') + errorMsg);
                    toast({ variant: "destructive", title: `Partial Data`, description: errorMsg, duration: 5000 });
                }
            } else {
                // No staff found
                console.log("AdminHomepage: No staff found, skipping shift fetch.");
                setAllShifts([]);
            }
            console.log("AdminHomepage: Data fetching process completed.");
        } catch (err) {
            // Handle critical errors during fetching
            console.error("AdminHomepage: Critical error fetching dashboard data:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to load essential dashboard data: ${errorMessage}`);
            toast({ variant: "destructive", title: "Error Loading Data", description: errorMessage });
            // Reset state on critical error
            setStaff([]);
            setAllShifts([]);
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    }, [toast]); // Dependency array for useCallback

    // Trigger data fetching on component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Calculated Metrics (Memoized) ---

    // Total number of staff members
    const totalStaff = useMemo(() => staff.length, [staff]);

    // Total work hours scheduled to start today
    const totalHoursToday = useMemo(() => {
        if (isLoading || !allShifts.length) return 0;
        const today = startOfDay(new Date());
        // Filter shifts starting today
        const todayShifts = allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, today));
        // Calculate total duration in minutes and convert to hours
        const totalMinutes = todayShifts.reduce((sum, shift) => sum + (calculateShiftDurationHours(shift) * 60), 0);
        return totalMinutes / 60;
    }, [allShifts, isLoading]);

    // Staff member with the most scheduled work hours starting today
    const staffWithMostHoursToday: { name: string | undefined; hours: number } | null = useMemo(() => {
        if (isLoading || staff.length === 0 || !allShifts.length) return null;
        const today = startOfDay(new Date());
        const todayShiftsOnly = allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, today));
        if (todayShiftsOnly.length === 0) return null;

        // Calculate total duration (in minutes) per staff member for today's shifts
        const durationByStaff = todayShiftsOnly.reduce((acc, shift) => {
            if (shift.staffId) {
                const durationMinutes = calculateShiftDurationHours(shift) * 60;
                if (durationMinutes > 0) {
                    acc[shift.staffId] = (acc[shift.staffId] || 0) + durationMinutes;
                }
            }
            return acc;
        }, {} as Record<string, number>);

        // Find the staff member with the maximum duration
        let busiestId: string | null = null;
        let maxMinutes = 0;
        for (const staffId in durationByStaff) {
            if (durationByStaff[staffId] > maxMinutes) {
                maxMinutes = durationByStaff[staffId];
                busiestId = staffId;
            }
        }

        if (!busiestId || maxMinutes === 0) return null; // No one worked or error
        const staffMember = staff.find(s => s.id === busiestId);
        return { name: staffMember?.name, hours: maxMinutes / 60 }; // Return name and hours
    }, [allShifts, staff, isLoading]);

    // --- Chart Data Preparation (Memoized) ---

    // Data for the Bar Chart (Total hours per day within selected range)
    const barChartData = useMemo(() => {
        if (isLoading || !allShifts.length || !chartStartDate || !chartEndDate) return [];
        if (chartStartDate > chartEndDate) return []; // Ensure valid range

        // Generate array of dates within the selected interval
        const daysInInterval = eachDayOfInterval({
            start: chartStartDate,
            end: chartEndDate
        });

        // Calculate total hours for each day
        return daysInInterval.map(day => {
            // Format day for X-axis label (adjust format if range is very long)
            const dayString = format(day, 'MMM d');
            // Filter shifts starting on this specific day
            const shiftsOnDay = allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, day));
            // Sum durations for the day
            const totalMinutesOnDay = shiftsOnDay.reduce((sum, shift) => sum + (calculateShiftDurationHours(shift) * 60), 0);
            // Return data point for the chart
            return { name: dayString, date: day, hours: totalMinutesOnDay / 60 };
        });
    }, [allShifts, isLoading, chartStartDate, chartEndDate]); // Dependencies include the date range state

    // Data for the Pie Chart (Hour distribution among staff for the selected day)
    const staffDistributionData = useMemo(() => {
        // Filter shifts starting on the single day selected via bar click
        const targetDayShifts = allShifts.filter(shift => shift.startTime && isSameDay(shift.startTime, selectedDayForDistribution));
        if (isLoading || targetDayShifts.length === 0 || staff.length === 0) return [];

        // Calculate total duration (minutes) per staff member for the selected day
        const durationByStaff = targetDayShifts.reduce((acc, shift) => {
            const staffMember = staff.find(s => s.id === shift.staffId);
            if (staffMember) {
                const staffName = staffMember.name ?? 'Unknown'; // Use staff name for label
                const durationMinutes = calculateShiftDurationHours(shift) * 60;
                if (durationMinutes > 0) {
                    acc[staffName] = (acc[staffName] || 0) + durationMinutes;
                }
            }
            return acc;
        }, {} as Record<string, number>);

        // Convert to hours and format for Pie Chart ({ name, value })
        return Object.entries(durationByStaff)
                     .map(([name, totalMinutes]) => ({ name, value: totalMinutes / 60 }))
                     .filter(item => item.value > 0.01); // Filter out negligible values if needed
    }, [allShifts, staff, isLoading, selectedDayForDistribution]); // Depends on the selected day

    // Colors for Pie Chart segments
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // --- Interaction Handlers ---

    // Handles clicks on the Bar Chart to update the selected day for the Pie Chart
    const handleBarClick = useCallback((data: any) => {
        const payload = data?.activePayload?.[0]?.payload;
        // Check if payload and date are valid
        if (payload && payload.date instanceof Date && isValid(payload.date)) {
            console.log("Bar clicked, setting selected date for Pie Chart:", payload.date);
            setSelectedDayForDistribution(startOfDay(payload.date)); // Update the selected day
        } else {
            console.log("Bar clicked, but no valid date found in payload:", payload);
        }
    }, []); // No dependencies needed here

    // Sets the date range for the Bar Chart
    const setChartRange = (startDate: Date, endDate: Date) => {
        // Ensure dates are valid before setting state
        if (isValid(startDate) && isValid(endDate)) {
            setChartStartDate(startOfDay(startDate));
            setChartEndDate(startOfDay(endDate));
            console.log("Chart range updated to:", format(startDate, 'yyyy-MM-dd'), ' - ', format(endDate, 'yyyy-MM-dd'));
        } else {
            console.error("Invalid dates provided to setChartRange");
        }
    };

    // Handler functions for the time range selection buttons
    const handleSetLast7Days = () => {
        const today = new Date();
        setChartRange(subDays(today, 6), today);
    };
    const handleSetLast30Days = () => {
        const today = new Date();
        setChartRange(subDays(today, 29), today);
    };
    const handleSetThisMonth = () => {
        const today = new Date();
        setChartRange(startOfMonth(today), today); // From start of month until today
    };
    const handleSetLastMonth = () => {
        const today = new Date();
        const firstDayLastMonth = startOfMonth(subMonths(today, 1));
        const lastDayLastMonth = endOfMonth(subMonths(today, 1));
        setChartRange(firstDayLastMonth, lastDayLastMonth);
    };

    // --- Custom Tooltip Renderers for Charts ---

    // Tooltip for Pie Chart showing name and hours
    const renderPieTooltip = (props: any) => {
        const { active, payload } = props;
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-md border bg-background p-2 text-sm shadow-sm">
                    <p className="font-medium">{`${data.name}`}</p>
                    <p className="text-muted-foreground">{`Hours: ${data.value.toFixed(1)}`}</p>
                </div>
            );
        }
        return null;
    };

    // Tooltip for Bar Chart showing date and total hours
    const renderBarTooltip = (props: any) => {
        const { active, payload, label } = props; // label is the formatted date (e.g., "Apr 11")
        if (active && payload && payload.length) {
            // payload[0].value corresponds to dataKey="hours"
            return (
                <div className="rounded-md border bg-background p-2 text-sm shadow-sm">
                    <p className="font-medium">{label}</p> {/* Display formatted date */}
                    <p className="text-muted-foreground">{`Total Hours: ${payload[0].value.toFixed(1)}`}</p>
                </div>
            );
        }
        return null;
    };

    // --- JSX Rendering ---
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Display Error Card if an error occurred */}
            {error && !isLoading && (
                <Card className="border-destructive bg-destructive/10">
                    <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <CardTitle className="text-destructive text-lg">Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-destructive/90 pb-4">
                        {/* Display multi-line errors */}
                        {error.split('\n').map((line, index) => (<p key={index}>{line}</p>))}
                        <Button onClick={fetchData} variant="destructive" size="sm" className="mt-3">
                            Retry Fetching Data
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Quick Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Staff Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (<Skeleton className="h-8 w-16" />) : (<div className="text-2xl font-bold">{totalStaff}</div>)}
                        <Skeleton className={`h-3 w-4/5 mt-1 ${isLoading ? 'visible' : 'invisible'}`} />
                        {!isLoading && <p className="text-xs text-muted-foreground">Registered staff members</p>}
                    </CardContent>
                </Card>

                {/* Total Hours Today Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (<Skeleton className="h-8 w-16" />) : (<div className="text-2xl font-bold">{totalHoursToday.toFixed(1)}</div>)}
                        <Skeleton className={`h-3 w-4/5 mt-1 ${isLoading ? 'visible' : 'invisible'}`} />
                        {!isLoading && <p className="text-xs text-muted-foreground">Total work hours starting today</p>}
                    </CardContent>
                </Card>

                {/* Staff with Most Hours Today Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Longest Hours Today</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (<Skeleton className="h-8 w-3/4" />) : staffWithMostHoursToday ? (<div className="text-2xl font-bold">{staffWithMostHoursToday.name ?? 'N/A'}</div>) : (<div className="text-2xl font-bold text-muted-foreground">-</div>)}
                        <Skeleton className={`h-3 w-4/5 mt-1 ${isLoading ? 'visible' : 'invisible'}`} />
                        {!isLoading && (<p className="text-xs text-muted-foreground">{staffWithMostHoursToday ? `with ${staffWithMostHoursToday.hours.toFixed(1)} hours` : 'No shifts starting today'}</p>)}
                    </CardContent>
                </Card>

                {/* System Status Card (Placeholder) */}
                <Card className="bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Online</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation Links */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {[
                    { title: "Manage Staff", href: "/dashboardstaff/manageworker", icon: Users },
                    { title: "Scheduling", href: "/dashboardstaff/scheduling", icon: CalendarDays },
                    // { title: "Track Workload", href: "/dashboardstaff/trackworkload", icon: Activity }, // Link to view detailed workload?
                ].map((section) => (
                    <Link href={section.href} key={section.title} legacyBehavior passHref>
                        <a className="block transition-transform duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
                            <Card className="h-full overflow-hidden hover:shadow-md dark:hover:bg-gray-800/60 flex flex-col">
                                <CardHeader className="pb-2">
                                    <section.icon className="h-6 w-6 text-muted-foreground mb-2" />
                                    <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow pt-0">
                                    {/* Optional description can go here */}
                                </CardContent>
                            </Card>
                        </a>
                    </Link>
                ))}
            </div>

            {/* Analytics Charts Section */}
            <div>
                <h2 className="mb-4 text-xl font-semibold">Workload Overview</h2>
                {/* Show skeletons while loading */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        <Card><CardHeader><Skeleton className="h-6 w-1/2 mb-3" /><Skeleton className="h-4 w-3/4" /><div className="flex space-x-2 pt-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-6 w-1/2 mb-3" /><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
                    </div>
                ) : allShifts.length > 0 ? (
                    // Show charts if data exists
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        {/* Bar Chart Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Total Hours Worked
                                    {/* Display selected date range */}
                                    {chartStartDate && chartEndDate && (
                                        <span className="text-sm font-normal text-muted-foreground ml-2">
                                            ({format(chartStartDate, 'MMM d')} - {format(chartEndDate, 'MMM d, yyyy')})
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription className="flex items-center text-xs text-muted-foreground">
                                    <MousePointerClick className="h-3 w-3 mr-1 inline-block" /> Click a bar to see distribution for that day.
                                </CardDescription>
                                {/* Time Range Selection Buttons */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button variant="outline" size="sm" onClick={handleSetLast7Days} className="text-xs h-7 px-2">Last 7 Days</Button>
                                    <Button variant="outline" size="sm" onClick={handleSetLast30Days} className="text-xs h-7 px-2">Last 30 Days</Button>
                                    <Button variant="outline" size="sm" onClick={handleSetThisMonth} className="text-xs h-7 px-2">This Month</Button>
                                    <Button variant="outline" size="sm" onClick={handleSetLastMonth} className="text-xs h-7 px-2">Last Month</Button>
                                    {/* Consider adding a DateRangePicker component here for custom ranges */}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barChartData} onClick={handleBarClick} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        {/* Adjust XAxis properties based on data density */}
                                        <XAxis
                                            dataKey="name"
                                            fontSize={10} // Smaller font size for potentially many labels
                                            tickLine={false}
                                            axisLine={false}
                                            interval={barChartData.length > 14 ? 'preserveStartEnd' : 0} // Show fewer labels if range is long
                                            angle={barChartData.length > 20 ? -30 : 0} // Angle labels if very long range
                                            dy={barChartData.length > 20 ? 5 : 0} // Adjust vertical position if angled
                                            />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={true} unit="h" width={35} />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                            content={renderBarTooltip} // Use custom tooltip
                                        />
                                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} cursor="pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Pie Chart Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Hour Distribution</CardTitle>
                                <CardDescription>
                                    {/* Display the single day selected for the pie chart */}
                                    Staff distribution for: {format(selectedDayForDistribution, 'EEEE, MMM d, yyyy')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                {/* Render Pie Chart if data exists for the selected day */}
                                {staffDistributionData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={staffDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                innerRadius={40} // Optional: Make it a donut chart
                                                fill="#8884d8"
                                                dataKey="value" // Value is hours
                                                nameKey="name" // Name is staff name
                                            >
                                                {staffDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={renderPieTooltip} /> {/* Use custom tooltip */}
                                            <Legend formatter={(value: string) => <span className="text-foreground text-xs truncate max-w-[100px] inline-block align-middle">{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    // Message if no data for the selected day
                                    <p className="text-muted-foreground text-center py-12">
                                        No work hours found for {format(selectedDayForDistribution, 'MMM d')}.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    // Message if no shift data at all (after loading)
                    <Card>
                        <CardHeader><CardTitle>Workload Overview</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground text-center py-12">No shift data available to display charts.</p></CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}