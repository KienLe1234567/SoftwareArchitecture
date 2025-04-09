import axios from "axios";

// Định nghĩa các kiểu dữ liệu (nếu cần)
interface Slot {
    // Định nghĩa các thuộc tính của Slot
    id: string;
    startTime: string;
    endTime: string;
    doctorId: string;
    status: number;
}

interface Appointment {
    // Định nghĩa các thuộc tính của Appointment
    id: string;
    slotId: string;
    patientId: string;
    // ... các thuộc tính khác
}

interface AppointmentDto {
    // Định nghĩa các thuộc tính của AppointmentDto nếu có
    appointments: Appointment[];
}

/**
 * Lấy danh sách các slot theo doctorId và date.
 * @param doctorId - ID của bác sĩ.
 * @param date - Ngày.
 * @returns Promise<SlotDto> - Dữ liệu trả về từ API.
 */
export async function getSlots(doctorId?: string, date?: string): Promise<Slot[]> {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/slots`,
            { params: { doctorId, date } }
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get slots");
    }
}


/**
 * Lấy thông tin chi tiết của một slot theo ID.
 * @param id - ID của slot.
 * @returns Promise<Slot> - Thông tin chi tiết của slot.
 */
export async function getSlotById(id: string): Promise<Slot> {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/slots/${id}`
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get slot by id");
    }
}

/**
 * Tạo một cuộc hẹn mới.
 * @param appointmentData - Dữ liệu cuộc hẹn (slotId, patientId).
 * @returns Promise<Appointment> - Thông tin cuộc hẹn đã tạo.
 */
export async function createAppointment(appointmentData: {
    slotId: string;
    patientId: string;
}): Promise<Appointment> {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/appointments`,
            appointmentData
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create appointment");
    }
}

/**
 * Lấy thông tin chi tiết của một cuộc hẹn theo ID.
 * @param id - ID của cuộc hẹn.
 * @returns Promise<Appointment> - Thông tin chi tiết của cuộc hẹn.
 */
export async function getAppointmentById(id: string): Promise<Appointment> {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/appointments/${id}`
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get appointment by id");
    }
}

/**
 * Lấy danh sách cuộc hẹn theo doctorId, patientId và date.
 * @param doctorId - ID của bác sĩ (tùy chọn).
 * @param patientId - ID của bệnh nhân (tùy chọn).
 * @param date - Ngày (tùy chọn).
 * @returns Promise<AppointmentDto> - Dữ liệu trả về từ API.
 */
export async function getAppointments(
    doctorId?: string,
    patientId?: string,
    date?: string
): Promise<AppointmentDto> {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/appointments`,
            {
                params: {
                    doctorId,
                    patientId,
                    date,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get appointments");
    }
}

/**
 * Hoàn thành một cuộc hẹn.
 * @param id - ID của cuộc hẹn.
 * @returns Promise<Appointment> - Thông tin cuộc hẹn sau khi hoàn thành.
 */
export async function completeAppointment(id: string): Promise<Appointment> {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/appointments/${id}/complete`
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to complete appointment");
    }
}

/**
 * Xác nhận một cuộc hẹn.
 * @param id - ID của cuộc hẹn.
 * @returns Promise<Appointment> - Thông tin cuộc hẹn sau khi xác nhận.
 */
export async function confirmAppointment(id: string): Promise<Appointment> {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/appointments/${id}/confirm`
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to confirm appointment");
    }
}

/**
 * Đặt lại lịch một cuộc hẹn.
 * @param id - ID của cuộc hẹn.
 * @returns Promise<Appointment> - Thông tin cuộc hẹn sau khi đặt lại lịch.
 */
export async function rescheduleAppointment(id: string): Promise<Appointment> {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/appointments/${id}/reschedule`
        );
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to reschedule appointment");
    }
}