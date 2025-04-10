import { Patient, PatientDto } from "@/types/patient";
import axios from "axios";

/**
 * Lấy danh sách tất cả bệnh nhân từ API
 * @returns Promise<PatientDto> - Dữ liệu trả về từ API
 */
export async function getPatients(): Promise<PatientDto> {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/patients-api/api/patients`
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to get patients");
    }
}

/**
 * Lấy thông tin chi tiết của một bệnh nhân theo ID
 * @param id - ID của bệnh nhân
 * @returns Promise<Patient> - Thông tin chi tiết của bệnh nhân
 */

export async function getPatientById(id: string): Promise<Patient> {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/patients-api/api/patients/${id}`
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to get patient by id");
    }
}

