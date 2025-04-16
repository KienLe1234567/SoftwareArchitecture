import axios from "axios";

import { Shift, ShiftDto } from "@/types/shift";
import { Doctor, Nurse, Staff, StaffDto } from "@/types/staff";

import { formatToApiIsoString } from "./utils";

/**
 * Lấy danh sách tất cả nhân viên từ API
 */
export async function getAllStaffs(): Promise<StaffDto> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get staffs");
  }
}

/**
 * Lấy danh sách tất cả bác sĩ từ API
 */
export async function getAllDoctors(): Promise<Doctor[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/doctors`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get doctors");
  }
}

/**
 * Lấy danh sách tất cả y tá từ API
 */
export async function getAllNurses(): Promise<Nurse[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/nurses`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get nurses");
  }
}

/**
 * Lấy thông tin chi tiết của một nhân viên theo ID
 */
export async function getStaffById(id: string): Promise<Staff> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${id}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get staff by id");
  }
}

/**
 * Lấy thông tin chi tiết của một bác sĩ theo ID
 */
export async function getDoctorById(id: string): Promise<Doctor> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/doctors/${id}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get doctor by id");
  }
}

/**
 * Lấy thông tin chi tiết của một y tá theo ID
 */
export async function getNurseById(id: string): Promise<Nurse> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/nurses/${id}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get nurse by id");
  }
}

/**
 * Đăng ký thông tin bác sĩ mới
 */
export async function registerDoctor(
  doctor: Omit<Doctor, "id">
): Promise<number> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/doctors`,
      doctor,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.status;
  } catch (error) {
    console.error("Failed to register doctor:", error);
    throw new Error("Failed to register doctor");
  }
}

/**
 * Đăng ký thông tin y tá mới
 */
export async function registerNurse(nurse: Omit<Nurse, "id">): Promise<number> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/nurses`,
      nurse,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.status;
  } catch (error) {
    console.error("Failed to register nurse:", error);
    throw new Error("Failed to register nurse");
  }
}

/**
 * Lấy danh sách ca làm việc của một nhân viên cụ thể
 */
export async function getStaffShifts(id: string): Promise<ShiftDto> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${id}/shifts`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get shifts for staff member");
  }
}

/**
 * Đăng ký ca làm việc mới cho nhân viên
 */
export async function registerShifts(
  staffId: string,
  startTime: string,
  endTime: string,
  description?: string,
  location?: string
): Promise<string> {
  try {
    const payload = { staffId, startTime, endTime, description, location };
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${staffId}/shifts`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.id;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to register shifts for staff member");
  }
}

/**
 * Cập nhật thông tin ca làm việc
 */
export async function updateShift(shift: Shift): Promise<number> {
  try {
    const payload = {
      ...shift,
      startTime: formatToApiIsoString(shift.startTime),
      endTime: formatToApiIsoString(shift.endTime),
    };
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${shift.staffId}/shifts/${shift.id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.status;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update shift");
  }
}

/**
 * Xóa ca làm việc
 * @param staffId - ID của nhân viên
 * @param shiftId - ID của ca làm việc cần xóa
 * @returns Promise<number> - Status code trả về từ API
 */
export async function deleteShift(
  staffId: string,
  shiftId: string
): Promise<number> {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${staffId}/shifts/${shiftId}`
    );
    return res.status;
  } catch (error) {
    console.error("Failed to delete shift:", error);
    throw new Error("Failed to delete shift");
  }
}

/**
 * Cập nhật thông tin bác sĩ
 */
export async function updateDoctor(doctor: Doctor): Promise<number> {
  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/doctors/${doctor.id}`,
      doctor,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.status;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update doctor");
  }
}

/**
 * Cập nhật thông tin y tá
 */
export async function updateNurse(nurse: Nurse): Promise<number> {
  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/nurses/${nurse.id}`,
      nurse,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.status;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update nurse");
  }
}

/**
 * Xóa bác sĩ
 */
export async function deleteDoctor(id: string): Promise<number> {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/doctors/${id}`
    );
    return res.status;
  } catch (error) {
    console.error("Failed to delete doctor:", error);
    throw new Error("Failed to delete doctor");
  }
}

/**
 * Xóa y tá
 */
export async function deleteNurse(id: string): Promise<number> {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/nurses/${id}`
    );
    return res.status;
  } catch (error) {
    console.error("Failed to delete nurse:", error);
    throw new Error("Failed to delete nurse");
  }
}

/**
 * Xóa nhân viên (chung)
 */
export async function deleteStaff(id: string): Promise<number> {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${id}`
    );
    return res.status;
  } catch (error) {
    console.error("Failed to delete staff:", error);
    throw new Error("Failed to delete staff");
  }
}
