"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react"; // Thêm hook
import { format, parseISO, isValid as isDateValid, startOfDay, endOfDay, addDays, isWithinInterval } from "date-fns"; // Thêm date-fns
import { getAppointments } from "@/lib/appointment"; // Import API appointments
import { getDoctorById } from "@/lib/staff"; // Import API get doctor details (giả sử đúng path)
import { Appointment } from "@/types/appointment"; // Import type Appointment
import { Doctor } from "@/types/staff"; // Import type Doctor (từ staff)

// Shadcn UI & Lucide React
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"; // Import Table
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    // AlertDialogTrigger, // Không cần trigger
} from "@/components/ui/alert-dialog"; // Import AlertDialog
import { CalendarIcon, UserSquare, Users, CalendarCheck, History, AlertCircle, ClipboardList, Info } from "lucide-react"; // Icons
import { cn } from "@/lib/utils"; // Import cn utility

// Đổi tên component cho rõ nghĩa hơn
export default function DoctorDashboardPageWithOriginStructure() {
    const [todayFormatted, setTodayFormatted] = useState<string>("");
    const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null); // Dùng type Doctor chuẩn
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false); // State cho AlertDialog lỗi

    // --- !!! Quan trọng: Thay thế ID này bằng logic lấy ID bác sĩ đang đăng nhập ---
    const doctorId = "ce57bd24-831f-4c77-36f1-08dd78cf84fa"; // <<<--- REPLACE THIS ID

    // --- Fetch Doctor Details ---
    const fetchDoctorData = useCallback(async () => {
        if (!doctorId) { const msg = "Doctor ID is missing."; setError(msg); setIsErrorAlertOpen(true); setIsLoadingDoctor(false); return; }
        setIsLoadingDoctor(true); setError(null);
        try {
            const doctorData = await getDoctorById(doctorId);
            setCurrentDoctor(doctorData);
        } catch (err) {
            console.error("Failed doctor details:", err); const msg = "Could not load doctor information."; setError(msg); setIsErrorAlertOpen(true); setCurrentDoctor(null);
        } finally { setIsLoadingDoctor(false); }
    }, [doctorId]);

    // --- Fetch Upcoming Appointments ---
    const fetchUpcomingAppointments = useCallback(async () => {
        if (!doctorId) { const msg = "Doctor ID is missing."; setError(msg); setIsErrorAlertOpen(true); setIsLoadingAppointments(false); return; }
        setIsLoadingAppointments(true); setError(null);
        const today = startOfDay(new Date()); const nextWeek = endOfDay(addDays(today, 7));
        try {
            const allAppointments = await getAppointments(doctorId);
            const filteredAppointments = allAppointments.filter(app => {
                try {
                    const startTime = parseISO(app.startTime);
                    return isDateValid(startTime) && isWithinInterval(startTime, { start: today, end: nextWeek }) && (app.status === 'PENDING' || app.status === 'CONFIRMED');
                } catch { return false; }
            });
            filteredAppointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            setUpcomingAppointments(filteredAppointments);
        } catch (err) { console.error("Failed appointments:", err); const msg = "Could not load upcoming appointments."; setError(msg); setIsErrorAlertOpen(true); setUpcomingAppointments([]); }
        finally { setIsLoadingAppointments(false); }
    }, [doctorId]);

    // --- Initial Data Fetch ---
    useEffect(() => {
        const today = new Date(); setTodayFormatted(format(today, "PPP"));
        fetchDoctorData(); fetchUpcomingAppointments();
    }, [fetchDoctorData, fetchUpcomingAppointments]);

    // --- Calculate Stats ---
    const stats = useMemo(() => {
        const todayStart = startOfDay(new Date()); const todayEnd = endOfDay(new Date());
        const todayAppointments = upcomingAppointments.filter(app => {
            try { const startTime = parseISO(app.startTime); return isDateValid(startTime) && isWithinInterval(startTime, { start: todayStart, end: todayEnd }); } catch { return false; }
        });
        const uniqueUpcomingPatientIds = new Set(upcomingAppointments.map(app => app.patientId));
        return { numOfTodayAppointment: todayAppointments.length, numOfUpcomingPatients: uniqueUpcomingPatientIds.size, };
    }, [upcomingAppointments]);

    // --- Formatting Functions ---
    const formatAppointmentTime = (startStr: string | undefined | null, endStr: string | undefined | null): string => {
        if (!startStr || !endStr) return "Invalid Time"; try { const s = parseISO(startStr), e = parseISO(endStr); return (isDateValid(s) && isDateValid(e)) ? `${format(s, "HH:mm")} - ${format(e, "HH:mm")}` : "Invalid Time"; } catch { return "Invalid Time"; }
    };
    const formatAppointmentDate = (dateStr: string | undefined | null): string => {
        if (!dateStr) return "Invalid Date"; try { const date = parseISO(dateStr); return isDateValid(date) ? format(date, "dd/MM/yyyy") : "Invalid Date"; } catch { return "Invalid Date"; }
    };
    const formatStatus = (status: string | undefined | null): string => {
        if (!status) return 'Unknown'; try { if (typeof status !== 'string') return 'Invalid'; return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(); } catch { return 'Invalid'; }
    };

    // --- Render ---
    return (
        // Giữ cấu trúc div gốc nhưng thêm padding/space bằng Tailwind
        <div className="p-4 md:p-8 space-y-8">
            {/* Header Row - Style bằng Tailwind */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 {/* Bỏ inline style */}
                <h1 className="text-3xl font-bold tracking-tight text-gray-800">Dashboard</h1>
                 {/* Dùng div với class thay vì style */}
                <div className="flex items-center space-x-2 border rounded-lg px-3 py-1.5 text-sm shadow-sm bg-card">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Today's Date</p>
                        <p className="font-semibold">{todayFormatted}</p> {/* Dùng ngày đã format */}
                    </div>
                </div>
            </div>

            {/* Hero Section - Style bằng Tailwind, dữ liệu động */}
            <div className="relative w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden shadow-lg">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img src="/b8.jpg" alt="Hospital background" className="w-full h-full object-cover object-center brightness-90" />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/70 to-transparent"></div>
                {/* Text Content */}
                <div className="relative z-10 h-full flex items-center justify-start p-6 md:p-10 lg:p-12">
                    <div className="max-w-lg text-gray-800">
                        <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
                        {/* Hiển thị tên bác sĩ động */}
                        {isLoadingDoctor ? (
                            <Skeleton className="h-10 w-64 mb-4" />
                        ) : (
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentDoctor?.name ?? 'Doctor'}</h1>
                        )}
                        <p className="text-gray-700 mb-6 leading-relaxed">
                           Thanks for joining with us. We are always trying to get you a complete service.<br />
                           You can view your daily schedule, Reach Patients Appointment at home!
                        </p>
                        {/* Nút bấm dùng component Button */}
                        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-blue-500 hover:bg-blue-600 text-white">
                           <Link href="/dashboarddoctor/appointment"> {/* Kiểm tra lại đường dẫn */}
                               <ClipboardList className="mr-2 h-5 w-5" /> View My Appointments
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* AlertDialog để hiển thị lỗi */}
            <AlertDialog open={isErrorAlertOpen} onOpenChange={setIsErrorAlertOpen}>
               <AlertDialogContent>
                   <AlertDialogHeader>
                       <AlertDialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" />Error Occurred</AlertDialogTitle>
                       <AlertDialogDescription>{error || "An unexpected error occurred."}</AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter>
               </AlertDialogContent>
           </AlertDialog>

            {/* Stats and Upcoming Sessions Grid - Bỏ inline style width: 90% */}
            <div className="flex flex-col gap-6 lg:gap-8">
    {/* Phần Stats Cards */}
    {/* Grid này sẽ đặt 2 card cạnh nhau trên màn hình sm trở lên */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Today Appointments Card */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appts</CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 {isLoadingAppointments ? <Skeleton className="h-6 w-12" /> : (
                    <div className="text-2xl font-bold">{stats.numOfTodayAppointment}</div>
                 )}
                <p className="text-xs text-muted-foreground">Scheduled today</p>
            </CardContent>
        </Card>

        {/* Upcoming Patients Card */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoadingAppointments ? <Skeleton className="h-6 w-12" /> : (
                    <div className="text-2xl font-bold">{stats.numOfUpcomingPatients}</div>
                )}
                <p className="text-xs text-muted-foreground">Unique (next 7 days)</p>
            </CardContent>
        </Card>
    </div>

    {/* Phần Upcoming Sessions Table (chiếm toàn bộ chiều rộng) */}
    <div> {/* Bọc trong div để giữ khoảng cách gap */}
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Sessions (Next 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                   {/* ... Nội dung Table ... */}
                   <TableHeader>
                       <TableRow>
                           <TableHead>Patient</TableHead>
                           <TableHead>Date</TableHead>
                           <TableHead>Time</TableHead>
                           <TableHead>Status</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {isLoadingAppointments ? (
                           Array.from({ length: 4 }).map((_, index) => ( <TableRow key={`skel-${index}`}><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-20" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-16" /></TableCell></TableRow> ))
                       ) : upcomingAppointments.length > 0 ? (
                           upcomingAppointments.slice(0, 5).map((app) => (
                               <TableRow key={app.appointmentId}>
                                   <TableCell className="font-medium">{app.patientName}</TableCell>
                                   <TableCell>{formatAppointmentDate(app.startTime)}</TableCell>
                                   <TableCell>{formatAppointmentTime(app.startTime, app.endTime)}</TableCell>
                                   <TableCell>
                                       <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                                           app.status === "CONFIRMED" && "bg-blue-100 text-blue-800",
                                           app.status === "PENDING" && "bg-yellow-100 text-yellow-800",
                                       )}> {formatStatus(app.status)} </span>
                                   </TableCell>
                               </TableRow>
                           ))
                       ) : (
                           <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No upcoming appointments found.</TableCell></TableRow>
                       )}
                   </TableBody>
               </Table>
                {upcomingAppointments.length > 5 && (
                    <div className="mt-4 text-center">
                        <Button variant="link" asChild size="sm"><Link href="/doctor/my-appointments">View All</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
</div>
        </div>
    );
}