// Ví dụ: src/components/StaffShiftCalendar.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
    deleteShift,
    getStaffShifts,
    registerShifts, // Quan trọng: Giả định trả về Promise<string> (ID)
    updateShift,
} from "@/lib/staff";
import {
    formatToApiIsoString, // Cần có trong utils
    getRandomEventColor,  // Cần có trong utils
    addHoursToDate,       // Cần có trong utils (mặc dù không dùng trực tiếp ở đây)
    // safeParseDate,     // Sẽ định nghĩa bên dưới nếu không có trong utils
    // formatTime,        // Sẽ định nghĩa bên dưới nếu không có trong utils
 } from "@/lib/utils"; // Kiểm tra lại các hàm có sẵn trong utils của bạn
import { Shift } from "@/types/shift";
import { CalendarEvent } from "../types/types"; // Đường dẫn có thể là "@/types/types" hoặc tương tự
import { EventCalendar } from "./event-calendar";
import { toast } from "sonner";
import { format, parseISO } from 'date-fns'; // Import parseISO từ date-fns

// --- Helper Functions (Định nghĩa tại đây nếu chưa có trong utils) ---

function safeParseDate(dateString: string | Date | undefined | null): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) {
        // Kiểm tra xem Date object có hợp lệ không
        return !isNaN(dateString.getTime()) ? dateString : null;
    }
    try {
        // Ưu tiên parse ISO string
        const parsed = parseISO(dateString);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
        // Thử fallback bằng new Date() cho các định dạng khác
        const fallbackParsed = new Date(dateString);
         return !isNaN(fallbackParsed.getTime()) ? fallbackParsed : null;

    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return null;
    }
}

function formatTime(date: Date | null | undefined): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "Invalid Time"; // Hoặc trả về chuỗi trống ""
    }
    // Ví dụ: định dạng HH:mm AM/PM
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
// --- End Helper Functions ---


export default function StaffShiftCalendar({
    staffId,
}: {
    staffId: string;
}) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStaffShifts = useCallback(async () => {
        if (!staffId) {
            setEvents([]);
            setIsLoading(false);
            setError(null);
            return;
        }
        console.log(`StaffShiftCalendar: Fetching shifts for staffId: ${staffId}`);
        setIsLoading(true);
        setError(null);
        try {
            const shiftsDto = await getStaffShifts(staffId);

            // Sử dụng .map và .filter với type guard để xử lý lỗi TypeScript
            const formattedShifts = shiftsDto.shifts
                .map((shift) => {
                    const startTime = safeParseDate(shift.startTime as unknown as string);
                    const endTime = safeParseDate(shift.endTime as unknown as string);

                    if (!startTime || !endTime) {
                        console.warn(`StaffShiftCalendar: Could not parse dates for shift ${shift.id}. Start: ${shift.startTime}, End: ${shift.endTime}`);
                        return null; // Trả về null nếu date không hợp lệ
                    }

                    const title = shift.description || "Staff Shift";

                    // Tạo object gần giống CalendarEvent nhưng chưa chắc chắn type
                    const potentialEvent = {
                        id: shift.id,
                        title: title,
                        start: startTime,
                        end: endTime,
                        allDay: false, // Gán giá trị boolean cụ thể
                        color: getRandomEventColor(),
                        location: shift.location || "",
                        description: shift.description || "",
                    };
                    // Đảm bảo object này phù hợp với CalendarEvent (TypeScript sẽ tự kiểm tra)
                    return potentialEvent as CalendarEvent; // Có thể cast nhẹ nhàng ở đây nếu cần

                })
                // Sử dụng type predicate để lọc null VÀ khẳng định kiểu cho TypeScript
                .filter((event): event is CalendarEvent => event !== null);

            console.log(`StaffShiftCalendar: Fetched and formatted ${formattedShifts.length} events.`);
            setEvents(formattedShifts);
        } catch (err) {
            console.error("StaffShiftCalendar: Error fetching staff shifts:", err);
            const errorMsg = err instanceof Error ? err.message : "Failed to load shifts.";
            setError(errorMsg);
            toast.error("Error loading shifts", { description: errorMsg });
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, [staffId]);

    useEffect(() => {
        fetchStaffShifts();
    }, [fetchStaffShifts]);

    // --- Event Handlers (Giữ nguyên logic từ trước, chỉ dùng helper đúng) ---

    const handleEventAdd = async (newEventData: CalendarEvent) => {
      console.log("StaffShiftCalendar: Attempting to add event:", newEventData);
      const now = new Date();
      const shiftStartTime = newEventData.start;

    if (shiftStartTime < now) {
        console.warn("StaffShiftCalendar: Attempt to schedule shift in the past blocked.");
        toast.error("Cannot Schedule in the Past", {
            description: "You cannot add a shift that starts at a past date or time.",
            duration: 2500,
        });
        return; // Dừng xử lý nếu ca bắt đầu trong quá khứ
    }
      const newStart = newEventData.start.getTime();
      const newEnd = newEventData.end.getTime();
  
      // 1. Kiểm tra Overlap
      const overlap = events.find(existingEvent => {
          const existingStart = existingEvent.start.getTime();
          const existingEnd = existingEvent.end.getTime();
          return newStart < existingEnd && newEnd > existingStart;
      });
  
      if (overlap) {
          console.warn("StaffShiftCalendar: Overlap detected with event:", overlap);
          toast.error("Shift Overlap Detected", {
              description: `New shift overlaps with: ${formatTime(overlap.start)} - ${formatTime(overlap.end)}.`,
              duration: 2500,
          });
          return; // Dừng khi overlap
      }
  
      // 2. Gọi API
      try {
          // Giả định registerShifts trả về ID (string)
          const newShiftId: string = await registerShifts(
              staffId,
              formatToApiIsoString(newEventData.start),
              formatToApiIsoString(newEventData.end),
              newEventData.description,
              newEventData.location
          );
  
          if (typeof newShiftId === 'string' && newShiftId) {
              const eventToAdd: CalendarEvent = {
                  ...newEventData,
                  id: newShiftId,
                  color: newEventData.color || getRandomEventColor(),
                  title: newEventData.description || "Staff Shift",
               };
              setEvents(prevEvents => [...prevEvents, eventToAdd]);
              // <<<--- Toast Success cho Add nằm ở đây --- >>>
              toast.success(`Shift "${eventToAdd.title}" created`, {
                   description: `For ${format(eventToAdd.start, "MMM d, yyyy")}`, // Sử dụng date-fns format
                   position: "bottom-right",
               });
          } else {
              console.warn("StaffShiftCalendar: API might not return valid ID. Refetching...");
              toast.info("Shift created. Refreshing schedule...", { duration: 2500 });
              await fetchStaffShifts(); // Fetch lại nếu không có ID
          }
      } catch (error) {
          console.error("StaffShiftCalendar: Error registering shift:", error);
          toast.error("Failed to create shift", { description: error instanceof Error ? error.message : "Unknown error" });
      }
    };
  
    const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
      console.log("StaffShiftCalendar: Attempting to update event:", updatedEvent);
      const now = new Date();
    // now.setHours(0, 0, 0, 0); // Bỏ comment nếu chỉ muốn chặn ngày trong quá khứ
    const shiftStartTime = updatedEvent.start;

    if (shiftStartTime < now) {
        console.warn("StaffShiftCalendar: Attempt to update shift to the past blocked.");
        toast.error("Cannot Update to the Past", {
            description: "You cannot move a shift to start at a past date or time.",
            duration: 2500,
        });
        // Cần fetch lại để calendar rollback về trạng thái cũ trước khi user kéo thả
        await fetchStaffShifts(); // Hoặc có cơ chế rollback khác từ EventCalendar
        return; // Dừng xử lý nếu ca bắt đầu trong quá khứ
    }
      // ...(Logic kiểm tra overlap khi update giữ nguyên)...
       const newStart = updatedEvent.start.getTime();
       const newEnd = updatedEvent.end.getTime();
       const overlap = events.find(existingEvent => { if (existingEvent.id === updatedEvent.id) return false; const existingStart = existingEvent.start.getTime(); const existingEnd = existingEvent.end.getTime(); return newStart < existingEnd && newEnd > existingStart; });
       if (overlap) { toast.error("Shift Overlap Detected", { description: `Updated shift overlaps: ${formatTime(overlap.start)} - ${formatTime(overlap.end)}.`, duration: 3000 }); return; } // Chặn update nếu overlap
  
      try {
          const shiftToUpdate: Shift = {
               id: updatedEvent.id,
               staffId: staffId,
               startTime: updatedEvent.start,
               endTime: updatedEvent.end,
               description: updatedEvent.description,
               location: updatedEvent.location,
          };
          await updateShift(shiftToUpdate); // Gọi API Update
          const updatedEvents = events.map((event) =>
               event.id === updatedEvent.id
                   ? { ...event, ...updatedEvent, title: updatedEvent.description || "Staff Shift" }
                   : event
           );
           setEvents(updatedEvents); // Cập nhật state
           // <<<--- Toast Success cho Update nằm ở đây --- >>>
           toast.success(`Shift "${updatedEvent.title}" updated`, {
                description: `On ${format(updatedEvent.start, "MMM d, yyyy")}`, // Sử dụng date-fns format
                position: "bottom-right",
            });
      } catch (error) {
          console.error("StaffShiftCalendar: Error updating shift:", error);
           toast.error("Failed to update shift", { description: error instanceof Error ? error.message : "Unknown error" });
      }
    };
  
    const handleEventDelete = async (eventId: string) => {
      console.log("StaffShiftCalendar: Attempting to delete event:", eventId);
      const eventToDelete = events.find(e => e.id === eventId);
      setEvents(prevEvents => prevEvents.filter((event) => event.id !== eventId)); // Optimistic update
      try {
          await deleteShift(staffId, eventId); // Gọi API Delete
          // <<<--- Toast Success cho Delete nằm ở đây --- >>>
          if (eventToDelete) {
             toast.success(`Shift "${eventToDelete.title}" deleted`, {
                 description: `Was on ${format(eventToDelete.start, "MMM d, yyyy")}`, // Sử dụng date-fns format
                 position: "bottom-right",
             });
         } else {
             toast.success(`Shift deleted successfully`, { position: "bottom-right" });
         }
      } catch (error) {
          console.error("StaffShiftCalendar: Error deleting shift:", error);
          toast.error("Failed to delete shift", { description: error instanceof Error ? error.message : "Unknown error" });
          if (eventToDelete) { // Rollback
              setEvents(prevEvents => [...prevEvents, eventToDelete].sort((a, b) => a.start.getTime() - b.start.getTime()));
          }
      }
    };

    // --- Render Component ---
     if (isLoading) {
         return (
             <div className="flex justify-center items-center rounded-xl shadow-md bg-white dark:bg-gray-800 h-[600px]">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <span className="ml-2 text-muted-foreground">Loading shifts...</span>
             </div>
         );
     }

    return (
        <EventCalendar
            events={events}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            initialView="week"
        />
    );
}