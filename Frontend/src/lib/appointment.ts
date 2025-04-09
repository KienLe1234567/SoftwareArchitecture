import { Appointment } from "@/types/appointment";
import { Slot } from "@/types/slot";
import axios from "axios";


export async function getSlotsByDoctorAndDate(doctorId: string, date: string): Promise<Slot[]> {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/slots`,
        {
          params: { // Sử dụng params để axios tự động thêm vào query string
            doctorId: doctorId,
            date: date,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Failed to get slots by doctor and date:", error);
      throw new Error("Failed to get slots by doctor and date");
    }
  }
  
  export async function getSlotById(id: string): Promise<Slot> {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/slots/${id}`
      );
      // Tương tự như trên, xem xét chuyển đổi string date/time sang Date nếu cần
      return res.data;
    } catch (error) {
      console.error("Failed to get slot by id:", error);
      throw new Error("Failed to get slot by id");
    }
  }
  
  export interface GetAppointmentsParams {
    doctorId?: string;
    patientId?: string;
    date?: string; // Định dạng YYYY-MM-DD
  }
  
  export async function getAppointments(params: GetAppointmentsParams): Promise<Appointment[]> {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/appointments`,
        {
          params: params // Truyền trực tiếp object params, axios sẽ xử lý các query parameters
        }
      );
      // Xem xét chuyển đổi string date/time sang Date nếu cần
      return res.data;
    } catch (error) {
      console.error("Failed to get appointments:", error);
      throw new Error("Failed to get appointments");
    }
  }