// File: app/doctor/my-appointments/page.tsx
// (Hoặc đường dẫn tương ứng trong dự án của bạn)

"use client"; // Đánh dấu là Client Component

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns"; // Thư viện định dạng ngày tháng
import {
  Calendar as CalendarIcon, // Icon lịch
  Filter,                   // Icon bộ lọc
  FilterX,                  // Icon xóa bộ lọc
  Loader2,                  // Icon loading xoay tròn
  AlertCircle,              // Icon cảnh báo (cho lỗi)
  Eye,                      // Icon xem
  XCircle,                  // Icon hủy (chữ X)
} from "lucide-react";       // Thư viện icon

// --- API và Types ---
// Thay đổi đường dẫn import nếu cần
import { getAppointments, GetAppointmentsParams } from "@/lib/appointment2";
import { Appointment } from "@/types/appointment";
import { cn } from "@/lib/utils"; // Hàm tiện ích classnames của Shadcn UI

// --- Shadcn UI Components ---
// Đảm bảo bạn đã cài đặt và import đúng đường dẫn các component này
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
} from "@/components/ui/alert-dialog"; // Chỉ dùng AlertDialog

// --- Component chính của trang ---
export default function MyAppointmentsPage() {
  // --- State Variables ---
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Danh sách cuộc hẹn
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined); // Ngày đang lọc (dùng Date object cho Calendar)
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading ban đầu/khi lọc
  const [error, setError] = useState<string | null>(null); // Lưu thông báo lỗi
  const [isCancelling, setIsCancelling] = useState<string | null>(null); // Lưu ID appointment đang hủy (để hiển thị loading trên nút)

  // --- !!! QUAN TRỌNG: Lấy Doctor ID ---
  // Thay thế bằng logic lấy ID bác sĩ thực tế của bạn (ví dụ: từ session, context,...)
  const doctorId = "d1e9f45d-5198-401f-6110-08dd74137d53"; // <<<--- THAY THẾ ID NÀY

  // --- Hàm Fetch Data ---
  // Sử dụng useCallback để tối ưu, chỉ tạo lại khi doctorId thay đổi
  const fetchAppointments = useCallback(
    async (date?: Date) => {
      // Kiểm tra doctorId trước khi fetch
      if (!doctorId) {
        setError("Doctor ID is missing. Cannot load appointments.");
        setIsLoading(false);
        setAppointments([]);
        return;
      }

      setIsLoading(true); // Bắt đầu loading
      setError(null);     // Xóa lỗi cũ (nếu có)

      try {
        // Chuẩn bị params cho API
        const params: GetAppointmentsParams = {
          doctorId: doctorId,
          // Chuyển Date object thành chuỗi "yyyy-MM-dd" nếu có ngày được chọn
          date: date ? format(date, "yyyy-MM-dd") : undefined,
        };
        console.log("Fetching appointments with params:", params); // Log để debug

        // Gọi API
        const data = await getAppointments(params);
        setAppointments(data); // Cập nhật state với dữ liệu mới
      } catch (err) {
        // Xử lý lỗi khi gọi API
        console.error("Failed to fetch appointments:", err); // Log lỗi chi tiết ra console
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to load appointments: ${errorMessage}`); // Cập nhật state lỗi
        setAppointments([]); // Xóa danh sách cũ khi có lỗi
      } finally {
        setIsLoading(false); // Kết thúc loading dù thành công hay thất bại
      }
    },
    [doctorId] // Dependency: hàm fetch sẽ được tạo lại nếu doctorId thay đổi
  );

  // --- Effect Hook: Fetch dữ liệu lần đầu khi component được mount ---
  useEffect(() => {
    fetchAppointments(); // Gọi hàm fetch không có tham số ngày để lấy tất cả ban đầu
  }, [fetchAppointments]); // Chạy effect này khi component mount và khi hàm fetchAppointments thay đổi

  // --- Event Handlers ---
  // Xử lý khi nhấn nút Filter
  const handleFilter = () => {
    fetchAppointments(filterDate); // Gọi fetch với ngày đang được chọn trong state
  };

  // Xử lý khi nhấn nút Clear Filter
  const handleClearFilter = () => {
    setFilterDate(undefined); // Xóa ngày lọc trong state
    fetchAppointments();      // Gọi fetch không có ngày để lấy lại tất cả
  };

  // --- Hàm thực thi việc hủy cuộc hẹn (sau khi xác nhận) ---
  const executeCancelAppointment = async (appointmentId: string) => {
    console.log("Executing cancellation for appointment ID:", appointmentId);
    setIsCancelling(appointmentId); // Đánh dấu cuộc hẹn này đang được xử lý hủy

    try {
      // --- !!! TODO: Thêm logic gọi API để hủy cuộc hẹn ở đây ---
      // Ví dụ:
      // const response = await fetch(`/api/appointments/${appointmentId}/cancel`, { method: 'POST' });
      // if (!response.ok) {
      //   throw new Error('Failed to cancel appointment via API');
      // }

      // Giả lập độ trễ của API để thấy trạng thái loading
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log("Appointment cancelled successfully (simulated):", appointmentId);

      // Quan trọng: Fetch lại danh sách appointments sau khi hủy thành công
      // để cập nhật UI. Fetch dựa trên bộ lọc hiện tại.
      fetchAppointments(filterDate);

      // (Tùy chọn) Hiển thị thông báo thành công bằng toast/sonner nếu có

    } catch (cancelError) {
      // Xử lý lỗi nếu việc hủy thất bại
      console.error("Failed to cancel appointment:", appointmentId, cancelError);
      // Cập nhật state lỗi chung hoặc hiển thị thông báo lỗi cụ thể hơn (ví dụ dùng toast)
      setError(`Failed to cancel appointment ${appointmentId}. Error: ${cancelError instanceof Error ? cancelError.message : String(cancelError)}`);
    } finally {
      setIsCancelling(null); // Xóa trạng thái đang hủy sau khi hoàn tất (thành công hoặc lỗi)
    }
  };

  // --- Hàm tiện ích định dạng hiển thị ---
  // Định dạng giờ: HH:mm - HH:mm
  const formatAppointmentTime = (startTime: string, endTime: string): string => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
    } catch (e) {
      console.error("Error formatting time:", startTime, endTime, e);
      return "Invalid time";
    }
  };

  // Định dạng ngày: dd/MM/yyyy
  const formatAppointmentDate = (startTime: string): string => {
    try {
      const start = new Date(startTime);
      return format(start, "dd/MM/yyyy");
    } catch (e) {
      console.error("Error formatting date:", startTime, e);
      return "Invalid date";
    }
  };

  // --- Render JSX ---
  return (
    <div className="container mx-auto p-1 md:px-5 space-y-6">
      {/* === Header Section === */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6"> {/* Thêm margin-bottom nếu cần */}
    <h1 className="text-3xl font-bold tracking-tight self-center"> {/* Căn giữa tiêu đề */}
      Appointment Manager
    </h1>
    {/* Hiển thị ngày gọn gàng hơn */}
    <div className="flex items-center space-x-2 rounded-lg border bg-background px-3 py-1.5 text-sm shadow-sm">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold whitespace-nowrap"> {/* Ngăn xuống dòng */}
        {format(new Date(), "dd MMM, yyyy")} {/* Định dạng: 09 Apr, 2025 */}
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
                   !filterDate && "text-muted-foreground" // Màu xám nếu chưa chọn ngày
                 )}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {filterDate ? (
                   format(filterDate, "PPP") // Định dạng dễ đọc: Apr 9, 2025
                 ) : (
                   <span>Pick a date</span> // Placeholder khi chưa chọn
                 )}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0" align="start">
               <Calendar
                 mode="single"       // Chỉ cho chọn 1 ngày
                 selected={filterDate} // Giá trị ngày đang được chọn
                 onSelect={setFilterDate} // Hàm cập nhật state khi chọn ngày
                 initialFocus       // Tự động focus vào calendar khi mở
                 // disabled={(date) => date < new Date("1900-01-01")} // Ví dụ: vô hiệu hóa ngày quá khứ
               />
             </PopoverContent>
           </Popover>
           {/* Nút Filter */}
           <Button onClick={handleFilter} disabled={isLoading || !filterDate}> {/* Vô hiệu hóa nếu đang load hoặc chưa chọn ngày */}
             <Filter className="mr-2 h-4 w-4" /> Filter
             {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />} {/* Icon loading khi đang fetch */}
           </Button>
           {/* Nút Clear Filter */}
           <Button
             variant="ghost"
             onClick={handleClearFilter}
             disabled={!filterDate || isLoading} // Vô hiệu hóa nếu đang load hoặc chưa có filter
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
      {/* Hiển thị nếu có lỗi và không đang loading */}
      {error && !isLoading && (
         <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400 shadow-sm">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold">Error Occurred</span>
            </div>
            {/* Hiển thị chi tiết lỗi */}
            <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {/* === Appointments Table Section === */}
      {/* Chỉ hiển thị bảng nếu không đang loading và không có lỗi */}
      {!isLoading && !error && (
        <Card className="shadow-sm">
          <CardHeader>
            {/* Tiêu đề bảng, hiển thị số lượng cuộc hẹn */}
            <CardTitle>My Appointments ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              {/* Chú thích dưới bảng */}
              <TableCaption>
                {appointments.length === 0
                  ? "No appointments found for the selected criteria."
                  : "List of scheduled appointments."}
              </TableCaption>
              {/* Header của bảng */}
              <TableHeader>
                 <TableRow>
                   <TableHead className="w-[250px]">Patient Name</TableHead>
                   <TableHead>Appointment Time</TableHead>
                   <TableHead>Appointment Date</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
              </TableHeader>
              {/* Body của bảng - lặp qua danh sách appointments */}
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.appointmentId} className="hover:bg-muted/50">
                     {/* Cột Tên Bệnh Nhân */}
                     <TableCell className="font-medium">
                       {appointment.patientName}
                       {/* Hiển thị thêm email/sđt nếu muốn */}
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
                       {/* Badge trạng thái với màu sắc tương ứng */}
                       <span
                         className={cn(
                           "inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                           appointment.status === "CONFIRMED" &&
                             "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300",
                           appointment.status === "PENDING" &&
                             "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300",
                           appointment.status === "CANCELLED" &&
                             "bg-red-100 text-red-800 line-through dark:bg-red-700/30 dark:text-red-300"
                           // Thêm các status khác nếu có
                         )}
                       >
                         {/* Chuyển status thành chữ viết hoa chữ cái đầu nếu muốn */}
                         {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase()}
                       </span>
                     </TableCell>
                     {/* Cột Hành động */}
                    <TableCell className="text-right space-x-2">
                      {/* Nút Hủy với Dialog xác nhận */}
                      {/* Chỉ hiển thị nút Hủy nếu trạng thái không phải là CANCELLED */}
                      {appointment.status !== 'CANCELLED' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            {/* Nút kích hoạt dialog */}
                            <Button
                              variant="outline"
                              size="sm"
                              // Vô hiệu hóa nút nếu đang hủy chính cuộc hẹn này
                              disabled={isCancelling === appointment.appointmentId}
                              className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600/50 dark:hover:bg-red-900/20"
                              aria-label={`Cancel appointment for ${appointment.patientName}`}
                            >
                              {/* Hiển thị icon loading nếu đang hủy */}
                              {isCancelling === appointment.appointmentId ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-1 h-4 w-4" />
                              )}
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          {/* Nội dung Dialog xác nhận */}
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently cancel the appointment for{' '}
                                <strong className="text-foreground">{appointment.patientName}</strong> on{' '}
                                <strong className="text-foreground">{formatAppointmentDate(appointment.startTime)}</strong> at{' '}
                                <strong className="text-foreground">{formatAppointmentTime(appointment.startTime, appointment.endTime)}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              {/* Nút đóng dialog (Cancel) */}
                              <AlertDialogCancel disabled={isCancelling === appointment.appointmentId}>
                                Back
                              </AlertDialogCancel>
                              {/* Nút xác nhận hủy (Action) */}
                              <AlertDialogAction
                                // Gọi hàm thực thi hủy khi nhấn nút này
                                onClick={() => executeCancelAppointment(appointment.appointmentId)}
                                // Vô hiệu hóa nếu đang xử lý
                                disabled={isCancelling === appointment.appointmentId}
                                // Dùng style của nút destructive
                                className={cn(buttonVariants({ variant: "destructive" }))}
                              >
                                {/* Hiển thị icon loading */}
                                {isCancelling === appointment.appointmentId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Cancellation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* Nút Xem Thông Tin Bệnh Nhân */}
                      <Link
                        // --- !!! CẬP NHẬT ĐƯỜNG DẪN NÀY cho đúng route của bạn ---
                        href={`/doctor/my-patients/${appointment.patientId}`}
                        passHref // Cần thiết cho Next.js với custom component con (Button)
                        aria-label={`View patient information for ${appointment.patientName}`}
                      >
                        <Button variant="outline" size="sm">
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