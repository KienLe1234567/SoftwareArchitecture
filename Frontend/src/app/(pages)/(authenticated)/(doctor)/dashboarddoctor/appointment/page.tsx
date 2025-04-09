// File: app/doctor/my-appointments/page.tsx
// (Hoặc đường dẫn tương ứng trong dự án của bạn)

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Filter,
  FilterX,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle, // Icon xác nhận
  CheckCheck,  // Icon hoàn thành
} from "lucide-react";

// --- API và Types ---
import {
  getAppointments,
  GetAppointmentsParams,
  completeAppointment,
  confirmAppointment,
} from "@/lib/appointment2";
import { Appointment } from "@/types/appointment";
import { cn } from "@/lib/utils";

// --- Shadcn UI Components ---
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// *** Import lại AlertDialog ***
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

  const doctorId = "d1e9f45d-5198-401f-6110-08dd74137d53"; // <<<--- THAY THẾ ID NÀY

  const fetchAppointments = useCallback(/* ... code fetch giữ nguyên ... */
    async (date?: Date) => {
      if (!doctorId) {
        setError("Doctor ID is missing. Cannot load appointments.");
        setIsLoading(false);
        setAppointments([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params: GetAppointmentsParams = {
          doctorId: doctorId,
          date: date ? format(date, "yyyy-MM-dd") : undefined,
        };
        console.log("Fetching appointments with params:", params);
        const data = await getAppointments(params);
        setAppointments(data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to load appointments: ${errorMessage}`);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    },
    [doctorId]
  );


  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilter = () => {
    fetchAppointments(filterDate);
  };

  const handleClearFilter = () => {
    setFilterDate(undefined);
    fetchAppointments();
  };

  // --- Hàm xử lý xác nhận cuộc hẹn (sẽ được gọi từ AlertDialogAction) ---
  const handleConfirmAppointment = async (appointmentId: string) => {
    console.log("Executing confirmation for appointment ID:", appointmentId);
    setIsConfirming(appointmentId);
    setError(null);

    try {
      const status = await confirmAppointment(appointmentId);
      if (status >= 200 && status < 300) {
        console.log("Appointment confirmed successfully:", appointmentId);
        fetchAppointments(filterDate);
        // Đóng dialog sẽ tự động khi action thành công (nếu cần có thể quản lý state đóng mở dialog)
      } else {
         throw new Error(`API returned status ${status} when confirming`);
      }
    } catch (confirmError) {
      console.error("Failed to confirm appointment:", appointmentId, confirmError);
       const errorMessage = confirmError instanceof Error ? confirmError.message : String(confirmError);
      setError(`Failed to confirm appointment ${appointmentId}. Error: ${errorMessage}`);
      // Giữ dialog mở để người dùng thấy lỗi hoặc có thể đóng thủ công
    } finally {
      setIsConfirming(null); // Luôn reset loading state
    }
  };

  // --- Hàm xử lý hoàn thành cuộc hẹn (sẽ được gọi từ AlertDialogAction) ---
  const handleCompleteAppointment = async (appointmentId: string) => {
    console.log("Executing completion for appointment ID:", appointmentId);
    setIsCompleting(appointmentId);
    setError(null);

    try {
      const status = await completeAppointment(appointmentId);
      if (status >= 200 && status < 300) {
        console.log("Appointment completed successfully:", appointmentId);
        fetchAppointments(filterDate);
      } else {
           throw new Error(`API returned status ${status} when completing`);
      }
    } catch (completeError) {
      console.error("Failed to complete appointment:", appointmentId, completeError);
      const errorMessage = completeError instanceof Error ? completeError.message : String(completeError);
      setError(`Failed to complete appointment ${appointmentId}. Error: ${errorMessage}`);
    } finally {
      setIsCompleting(null);
    }
  };

  const formatAppointmentTime = /* ... code format giữ nguyên ... */
   (startTime: string, endTime: string): string => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
    } catch (e) {
      console.error("Error formatting time:", startTime, endTime, e);
      return "Invalid time";
    }
  };


  const formatAppointmentDate = /* ... code format giữ nguyên ... */
   (startTime: string): string => {
    try {
      const start = new Date(startTime);
      return format(start, "dd/MM/yyyy");
    } catch (e) {
      console.error("Error formatting date:", startTime, e);
      return "Invalid date";
    }
  };


  return (
    <div className="container mx-auto p-1 md:px-5 space-y-6">
      {/* Header, Filter, Loading, Error sections giữ nguyên */}
       {/* === Header Section === */}
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-3xl font-bold tracking-tight self-center">
          Appointment Manager
        </h1>
        <div className="flex items-center space-x-2 rounded-lg border bg-background px-3 py-1.5 text-sm shadow-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold whitespace-nowrap">
             {format(new Date(), "dd MMM,")}
           </span>
         </div>
       </div>


      {/* === Filter Section === */}
      <Card className="shadow-sm">
         <CardHeader>
           <CardTitle>Filter Appointments</CardTitle>
           <CardDescription>
             Select a date to view appointments for that specific day.
           </CardDescription>
         </CardHeader>
         <CardContent className="flex flex-wrap items-center gap-2 sm:gap-4">
           {/* Date Picker */}
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant={"outline"}
                 className={cn(
                   "w-full sm:w-[280px] justify-start text-left font-normal",
                   !filterDate && "text-muted-foreground"
                 )}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {filterDate ? (
                   format(filterDate, "PPP")
                 ) : (
                   <span>Pick a date</span>
                 )}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0" align="start">
               <Calendar
                 mode="single"
                 selected={filterDate}
                 onSelect={setFilterDate}
                 initialFocus
               />
             </PopoverContent>
           </Popover>
           {/* Nút Filter */}
           <Button onClick={handleFilter} disabled={isLoading || !filterDate}>
             <Filter className="mr-2 h-4 w-4" /> Filter
             {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
           </Button>
           {/* Nút Clear Filter */}
           <Button
             variant="ghost"
             onClick={handleClearFilter}
             disabled={!filterDate || isLoading}
           >
             <FilterX className="mr-2 h-4 w-4" /> Clear Filter
           </Button>
         </CardContent>
       </Card>


      {/* === Loading State Display === */}
      {isLoading && (
        <div className="flex justify-center items-center py-10 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading appointments...</span>
        </div>
      )}

      {/* === Error Message Display === */}
      {error && !isLoading && (
         <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400 shadow-sm">
           <div className="flex items-center gap-2">
             <AlertCircle className="h-5 w-5 flex-shrink-0" />
             <span className="font-semibold">Error Occurred</span>
           </div>
           <p className="mt-2 text-sm">{error}</p>
         </div>
       )}


      {/* === Appointments Table Section === */}
      {!isLoading && !error && (
        <Card className="shadow-sm">
           <CardHeader>
            <CardTitle>My Appointments ({appointments.length})</CardTitle>
           </CardHeader>
           <CardContent>
            <Table>
              {/* TableCaption, TableHeader giữ nguyên */}
               <TableCaption>
                {appointments.length === 0
                  ? "No appointments found for the selected criteria."
                  : "List of scheduled appointments."}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Patient Name</TableHead>
                  <TableHead>Appointment Time</TableHead>
                  <TableHead>Appointment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.appointmentId} className="hover:bg-muted/50">
                    {/* Các TableCell khác giữ nguyên */}
                     {/* Cột Tên Bệnh Nhân */}
                    <TableCell className="font-medium">
                      {appointment.patientName}
                      <div className="text-xs text-muted-foreground mt-1">
                         {appointment.patientEmail} <br/> {appointment.patientPhoneNumber}
                       </div>
                    </TableCell>
                    {/* Cột Thời Gian Hẹn */}
                    <TableCell>
                      {formatAppointmentTime(
                        appointment.startTime,
                        appointment.endTime
                      )}
                    </TableCell>
                    {/* Cột Ngày Hẹn */}
                    <TableCell>
                      {formatAppointmentDate(appointment.startTime)}
                    </TableCell>
                    {/* Cột Trạng Thái */}
                     <TableCell>
                       <span
                         className={cn(
                           "inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                           appointment.status === "CONFIRMED" &&
                             "bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300",
                           appointment.status === "PENDING" &&
                             "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300",
                           appointment.status === "COMPLETED" &&
                              "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300",
                           appointment.status === "CANCELLED" &&
                              "bg-red-100 text-red-800 line-through dark:bg-red-700/30 dark:text-red-300"
                         )}
                       >
                         {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase()}
                       </span>
                     </TableCell>

                    {/* Cột Hành động (Đã cập nhật với AlertDialog) */}
                    <TableCell className="text-right space-x-2">
                      {/* === AlertDialog cho nút CONFIRM === */}
                      {appointment.status === 'PENDING' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             {/* Nút trigger không còn onClick, chỉ vô hiệu hóa khi trang đang load chung */}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isLoading} // Chỉ disable khi trang đang loading chung
                              className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600/50 dark:hover:bg-blue-900/20"
                              aria-label={`Confirm appointment for ${appointment.patientName}`}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Confirm
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Appointment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to confirm the appointment for{' '}
                                <strong className="text-foreground">{appointment.patientName}</strong> on{' '}
                                <strong className="text-foreground">{formatAppointmentDate(appointment.startTime)}</strong> at{' '}
                                <strong className="text-foreground">{formatAppointmentTime(appointment.startTime, appointment.endTime)}</strong>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isConfirming === appointment.appointmentId}>Cancel</AlertDialogCancel>
                               {/* Nút Action gọi hàm xử lý và hiển thị loading */}
                              <AlertDialogAction
                                onClick={() => handleConfirmAppointment(appointment.appointmentId)}
                                disabled={isConfirming === appointment.appointmentId}
                                // Có thể thêm style cho nút confirm nếu muốn
                                // className={cn(buttonVariants({ variant: "default" }))}
                              >
                                {isConfirming === appointment.appointmentId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Now
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* === AlertDialog cho nút COMPLETE === */}
                      {appointment.status === 'CONFIRMED' && (
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button
                              variant="outline"
                              size="sm"
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600/50 dark:hover:bg-green-900/20"
                              aria-label={`Complete appointment for ${appointment.patientName}`}
                            >
                              <CheckCheck className="mr-1 h-4 w-4" />
                              Complete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Complete Appointment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to mark the appointment for{' '}
                                 <strong className="text-foreground">{appointment.patientName}</strong> on{' '}
                                 <strong className="text-foreground">{formatAppointmentDate(appointment.startTime)}</strong> at{' '}
                                 <strong className="text-foreground">{formatAppointmentTime(appointment.startTime, appointment.endTime)}</strong> as completed?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isCompleting === appointment.appointmentId}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCompleteAppointment(appointment.appointmentId)}
                                disabled={isCompleting === appointment.appointmentId}
                                // Thêm style màu xanh lá cho nút complete action
                                className={cn(buttonVariants({ variant: "default" }), "bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800")}
                              >
                                {isCompleting === appointment.appointmentId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Mark as Completed
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* Nút Xem Thông Tin Bệnh Nhân (Giữ nguyên) */}
                      <Link
                        href={`/doctor/my-patients/${appointment.patientId}`}
                        passHref
                        aria-label={`View patient information for ${appointment.patientName}`}
                      >
                        <Button variant="outline" size="sm" disabled={isLoading}>
                          <Eye className="mr-1 h-4 w-4" /> View Patient
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}