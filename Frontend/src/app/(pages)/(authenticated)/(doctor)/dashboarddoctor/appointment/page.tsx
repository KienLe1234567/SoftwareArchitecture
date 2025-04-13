// File: app/doctor/my-appointments/page.tsx
// (Hoặc đường dẫn tương ứng trong dự án của bạn)

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link"; // Giữ lại Link nếu có thể cần cho các liên kết khác
import { format, parseISO, isValid as isDateValid } from "date-fns";
import {
    Calendar as CalendarIcon, Filter, FilterX, Loader2, AlertCircle, Eye, CheckCircle,
    CheckCheck, FileText, User, X, ClipboardList // Icons
} from "lucide-react";

// --- API và Types ---
import {
    getAppointments, GetAppointmentsParams, completeAppointment, confirmAppointment,
} from "@/lib/appointment2"; // API appointment
import { getPatientById } from "@/lib/patient2"; // API patient
import { Appointment } from "@/types/appointment"; // Interface Appointment
import { Patient } from "@/types/types"; // Interface Patient
import { cn } from "@/lib/utils";

// --- Shadcn UI Components ---
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";


export default function MyAppointmentsPage() {
    // --- State Variables ---
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState<string | null>(null);

    // State cho Patient Popup
    const [isPatientPopupOpen, setIsPatientPopupOpen] = useState(false); // Chỉ dùng để kiểm soát Dialog bên ngoài
    const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
    const [isFetchingPatientDetails, setIsFetchingPatientDetails] = useState(false);
    const [patientFetchError, setPatientFetchError] = useState<string | null>(null);
    const [currentlyViewingPatientId, setCurrentlyViewingPatientId] = useState<string | null>(null); // Lưu ID patient đang xem

    // State cho Appointment Details Popup
    const [isAppointmentPopupOpen, setIsAppointmentPopupOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // --- Doctor ID (Cần thay thế) ---
    const doctorId = "ce57bd24-831f-4c77-36f1-08dd78cf84fa"; // <<<--- THAY THẾ ID NÀY

    // --- Fetch Appointments Function ---
    const fetchAppointments = useCallback(async (date?: Date) => {
        if (!doctorId) { setError("Doctor ID missing."); setIsLoading(false); setAppointments([]); return; }
        setIsLoading(true); setError(null);
        try {
            const params: GetAppointmentsParams = { doctorId, date: date ? format(date, "yyyy-MM-dd") : undefined };
            const data = await getAppointments(params);
            setAppointments(data);
        } catch (err) { const msg = err instanceof Error ? err.message : "Unknown error."; setError(`Load failed: ${msg}`); setAppointments([]); }
        finally { setIsLoading(false); }
    }, [doctorId]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    // --- Filter Handlers ---
    const handleFilter = () => { fetchAppointments(filterDate); };
    const handleClearFilter = () => { setFilterDate(undefined); fetchAppointments(); };

    // --- Appointment Action Handlers (Confirm/Complete) ---
    const handleConfirmAppointment = async (appointmentId: string) => {
        setIsConfirming(appointmentId); setError(null);
        try {
            const status = await confirmAppointment(appointmentId);
            if (status >= 200 && status < 300) { fetchAppointments(filterDate); }
            else { throw new Error(`API error ${status}`); }
        } catch (err) { const msg = err instanceof Error ? err.message : String(err); setError(`Confirm failed: ${msg}`); }
        finally { setIsConfirming(null); }
    };
    const handleCompleteAppointment = async (appointmentId: string) => {
        setIsCompleting(appointmentId); setError(null);
        try {
            const status = await completeAppointment(appointmentId);
            if (status >= 200 && status < 300) { fetchAppointments(filterDate); }
            else { throw new Error(`API error ${status}`); }
        } catch (err) { const msg = err instanceof Error ? err.message : String(err); setError(`Completion failed: ${msg}`); }
        finally { setIsCompleting(null); }
    };

    // --- Patient Details Popup Handler ---
    // Hàm này chỉ fetch dữ liệu, việc mở/đóng Dialog sẽ do state isPatientPopupOpen quản lý
    const fetchPatientDetails = async (patientId: string) => {
        if (!patientId || isFetchingPatientDetails) return; // Tránh fetch lại khi đang fetch

        setIsFetchingPatientDetails(true); setPatientFetchError(null); setPatientDetails(null);
        try {
            console.log(`Workspaceing patient details for ID: ${patientId}`);
            const data = await getPatientById(patientId);
            if (data?.id) {
                setPatientDetails(data);
                console.log("Patient details fetched:", data);
            } else {
                throw new Error("Received invalid patient data structure.");
            }
        } catch (err) {
            console.error(`Failed to fetch patient ${patientId}:`, err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setPatientFetchError(`Could not load patient details. ${message}`);
            setPatientDetails(null);
        } finally {
            setIsFetchingPatientDetails(false);
        }
    };

    // --- Appointment Details Popup Handler ---
    const showAppointmentDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsAppointmentPopupOpen(true);
    };

    // --- Formatting Functions ---
    const formatAppointmentTime = (startStr: string, endStr: string): string => {
        try { const s = parseISO(startStr), e = parseISO(endStr); return (isDateValid(s) && isDateValid(e)) ? `${format(s, "HH:mm")} - ${format(e, "HH:mm")}` : "Invalid"; } catch { return "Invalid"; }
    };
    const formatAppointmentDate = (startStr: string): string => {
        try { const s = parseISO(startStr); return isDateValid(s) ? format(s, "dd/MM/yyyy") : "Invalid"; } catch { return "Invalid"; }
    };
    const formatPatientDOB = (dobStr: string | undefined | null): string => {
        if (!dobStr) return "N/A"; try { const d = parseISO(dobStr); return isDateValid(d) ? format(d, "dd/MM/yyyy") : "Invalid"; } catch { return "Invalid"; }
    };
    const formatStatus = (status: string | undefined | null): string => {
        if (!status) return 'Unknown'; return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    // --- Component Render ---
    return (
        <div className="container mx-auto p-1 md:px-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Appointment Manager</h1>
                <div className="flex items-center space-x-2 border rounded-lg px-3 py-1.5 text-sm"><CalendarIcon className="h-4 w-4 text-muted-foreground" /><span className="font-semibold">{format(new Date(), "dd MMM, yyyy")}</span></div>
            </div>

            {/* Filter Section */}
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Filter Appointments</CardTitle><CardDescription>Select a date to view appointments.</CardDescription></CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full sm:w-[280px] justify-start", !filterDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4" />{filterDate ? format(filterDate, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filterDate} onSelect={setFilterDate} /></PopoverContent></Popover>
                    <Button onClick={handleFilter} disabled={isLoading || !filterDate}><Filter className="mr-2 h-4" />Filter{isLoading && filterDate && <Loader2 className="ml-2 h-4 animate-spin" />}</Button>
                    <Button variant="ghost" onClick={handleClearFilter} disabled={!filterDate || isLoading}><FilterX className="mr-2 h-4" />Clear{isLoading && !filterDate && <Loader2 className="ml-2 h-4 animate-spin" />}</Button>
                </CardContent>
            </Card>

            {/* Loading / Error Display */}
            {isLoading && (<div className="flex justify-center items-center py-10 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-lg">Loading appointments...</span></div>)}
            {error && !isLoading && (<div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-lg shadow-sm"><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 flex-shrink-0" /><span className="font-semibold">Error Occurred</span></div><p className="mt-2 text-sm">{error}</p></div>)}

            {/* Appointments Table Section */}
            {!isLoading && !error && (
                <Card className="shadow-sm">
                    <CardHeader><CardTitle>My Appointments ({appointments.length})</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableCaption>{appointments.length ? "List of scheduled appointments." : "No appointments found."}</TableCaption>
                            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Time</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {appointments.map((appointment) => (
                                    <TableRow key={appointment.appointmentId} className="hover:bg-muted/50">
                                        {/* Patient Cell */}
                                        <TableCell className="font-medium">{appointment.patientName}</TableCell>
                                        {/* Time Cell */}
                                        <TableCell>{formatAppointmentTime(appointment.startTime, appointment.endTime)}</TableCell>
                                        {/* Date Cell */}
                                        <TableCell>{formatAppointmentDate(appointment.startTime)}</TableCell>
                                        {/* Status Cell */}
                                        <TableCell>
                                            <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
                                                appointment.status === "CONFIRMED" && "bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300",
                                                appointment.status === "PENDING" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300",
                                                appointment.status === "COMPLETED" && "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300",
                                                appointment.status === "CANCELLED" && "bg-red-100 text-red-800 line-through dark:bg-red-700/30 dark:text-red-300"
                                            )}>
                                                {formatStatus(appointment.status)}
                                            </span>
                                        </TableCell>
                                        {/* Actions Cell */}
                                        <TableCell className="text-right space-x-1 space-y-1 md:space-y-0">
                                            {/* --- Confirm Action --- */}
                                            {appointment.status === 'PENDING' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" disabled={isLoading || isConfirming === appointment.appointmentId} className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600/50 dark:hover:bg-blue-900/20" title="Confirm Appointment">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="hidden sm:inline ml-1">Confirm</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Confirm Appointment?</AlertDialogTitle><AlertDialogDescription>Confirm appointment for <strong>{appointment.patientName}</strong> on {formatAppointmentDate(appointment.startTime)} at {formatAppointmentTime(appointment.startTime, appointment.endTime)}?</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel disabled={isConfirming === appointment.appointmentId}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleConfirmAppointment(appointment.appointmentId)} disabled={isConfirming === appointment.appointmentId}>{isConfirming === appointment.appointmentId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Now</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                            {/* --- Complete Action --- */}
                                            {appointment.status === 'CONFIRMED' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" disabled={isLoading || isCompleting === appointment.appointmentId} className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600/50 dark:hover:bg-green-900/20" title="Mark as Completed">
                                                            <CheckCheck className="h-4 w-4" />
                                                            <span className="hidden sm:inline ml-1">Complete</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Complete Appointment?</AlertDialogTitle><AlertDialogDescription>Mark appointment for <strong>{appointment.patientName}</strong> on {formatAppointmentDate(appointment.startTime)} at {formatAppointmentTime(appointment.startTime, appointment.endTime)} as completed?</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel disabled={isCompleting === appointment.appointmentId}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleCompleteAppointment(appointment.appointmentId)} disabled={isCompleting === appointment.appointmentId} className={cn(buttonVariants({ variant: "default" }), "bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800")}>{isCompleting === appointment.appointmentId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Mark as Completed</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}

                                            {/* --- View Patient Popup Action (Corrected Logic) --- */}
                                            {/* Button hoạt động như trigger */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isLoading || !appointment.patientId || isFetchingPatientDetails}
                                                onClick={() => {
                                                    setCurrentlyViewingPatientId(appointment.patientId); // Lưu ID đang xem
                                                    setIsPatientPopupOpen(true); // Mở dialog
                                                    fetchPatientDetails(appointment.patientId); // Bắt đầu fetch
                                                }}
                                                title="View Patient Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="hidden sm:inline ml-1">Patient</span>
                                            </Button>

                                            {/* --- View Appointment Details Popup Action (Corrected Logic) --- */}
                                            {/* Button hoạt động như trigger */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isLoading}
                                                onClick={() => showAppointmentDetails(appointment)} // Set state và mở dialog
                                                title="View Appointment Details"
                                                className="text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600/50 dark:hover:bg-gray-900/20"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span className="hidden sm:inline ml-1">Details</span>
                                            </Button>

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* --- Patient Details Dialog (Rendered outside the loop, controlled by state) --- */}
            <Dialog open={isPatientPopupOpen} onOpenChange={(isOpen) => {
                setIsPatientPopupOpen(isOpen);
                if (!isOpen) {
                    // Reset state khi đóng dialog
                    setCurrentlyViewingPatientId(null);
                    setPatientDetails(null);
                    setPatientFetchError(null);
                    setIsFetchingPatientDetails(false);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center"><User className="mr-2 h-5 w-5" />Patient Information</DialogTitle>
                        {currentlyViewingPatientId && <DialogDescription>Details for patient ID: {currentlyViewingPatientId.substring(0, 8)}...</DialogDescription>}
                    </DialogHeader>
                    <div className="py-4 space-y-2 text-sm">
                        {isFetchingPatientDetails && (<div className="text-center"><Loader2 className="animate-spin inline mr-2" />Loading...</div>)}
                        {patientFetchError && !isFetchingPatientDetails && (<div className="text-red-600"><AlertCircle className="inline mr-2" />{patientFetchError}</div>)}
                        {patientDetails && !isFetchingPatientDetails && !patientFetchError && (<>
                            <div className="flex justify-between border-b pb-1"><span className="font-medium text-muted-foreground">Full Name:</span> <span>{patientDetails.firstName} {patientDetails.lastName}</span></div>
                            <div className="flex justify-between border-b pb-1"><span className="font-medium text-muted-foreground">Email:</span> <span>{patientDetails.email || 'N/A'}</span></div>
                            <div className="flex justify-between border-b pb-1"><span className="font-medium text-muted-foreground">Phone:</span> <span>{patientDetails.phoneNumber || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="font-medium text-muted-foreground">Date of Birth:</span> <span>{formatPatientDOB(patientDetails.dateOfBirth)}</span></div>
                        </>)}
                        {/* Hiển thị thông báo nếu không có ID hoặc lỗi không fetch được */}
                        {!isFetchingPatientDetails && !patientDetails && !patientFetchError && currentlyViewingPatientId && (
                            <div className="text-muted-foreground text-center">No details found for this patient.</div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* --- Appointment Details Dialog (Rendered outside the loop, controlled by state) --- */}
            <Dialog open={isAppointmentPopupOpen} onOpenChange={(isOpen) => {
                setIsAppointmentPopupOpen(isOpen);
                if (!isOpen) { setSelectedAppointment(null); } // Reset selected on close
            }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5" />Appointment Details</DialogTitle>
                        {/* Loại bỏ ID khỏi description */}
                        <DialogDescription>
                            Details for the selected appointment.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Hiển thị thông tin từ selectedAppointment state */}
                    {selectedAppointment && (
                        <div className="py-4 space-y-2 text-sm">
                            <div className="flex justify-between border-b pb-1"><span className="font-medium text-muted-foreground">Patient:</span> <span>{selectedAppointment.patientName}</span></div>
                            <div className="flex justify-between border-b pb-1"><span className="font-medium text-muted-foreground">Doctor:</span> <span>{selectedAppointment.doctorName}</span></div>
                            <div className="flex justify-between border-b pb-1"><span className="font-medium text-muted-foreground">Date:</span> <span>{formatAppointmentDate(selectedAppointment.startTime)}</span></div>
                            <div className="flex justify-between border-b pb-1"><span className="font-medium text-muted-foreground">Time:</span> <span>{formatAppointmentTime(selectedAppointment.startTime, selectedAppointment.endTime)}</span></div>
                            <div className="flex justify-between items-center"><span className="font-medium text-muted-foreground">Status:</span>
                                <span className={cn("px-2 py-0.5 rounded text-xs font-semibold",
                                    selectedAppointment.status === "CONFIRMED" && "bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300",
                                    selectedAppointment.status === "PENDING" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300",
                                    selectedAppointment.status === "COMPLETED" && "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300",
                                    selectedAppointment.status === "CANCELLED" && "bg-red-100 text-red-800 line-through dark:bg-red-700/30 dark:text-red-300"
                                )}>
                                    {formatStatus(selectedAppointment.status)}
                                </span>
                            </div>
                            {/* Đã loại bỏ Slot ID và Appointment ID khỏi đây */}
                        </div>
                    )}
                    {/* Hiển thị nếu không có selectedAppointment (trường hợp lỗi logic) */}
                    {!selectedAppointment && (
                        <div className="text-muted-foreground text-center py-4">No appointment selected.</div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}