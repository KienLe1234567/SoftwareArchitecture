import axios from "axios";

import { Doctor, DoctorDto } from "@/types/doctor";
import { Shift, ShiftDto } from "@/types/shift";
import { formatToApiIsoString } from "./utils";

/**
 * Lấy danh sách tất cả nhân viên từ API
 * @returns Promise<DoctorDto> - Dữ liệu trả về từ API
 */
export async function getAllStaffs(): Promise<DoctorDto> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs`
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get doctors");
  }
}

/**
 * Lấy danh sách ca làm việc của một nhân viên cụ thể
 * @param id - ID của nhân viên
 * @returns Promise<ShiftDto> - Dữ liệu ca làm việc của nhân viên
 */
export async function getStaffShifts(id: string): Promise<ShiftDto> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${id}/shifts`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get shifts for chosen doctor");
  }
}

/**
 * Lấy thông tin chi tiết của một nhân viên theo ID
 * @param id - ID của nhân viên
 * @returns Promise<Doctor> - Thông tin chi tiết của nhân viên
 */
export async function getStaffByID(id: string): Promise<Doctor> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${id}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get doctor by id");
  }
}

/**
 * Đăng ký thông tin nhân viên mới
 * @param doctor - Thông tin nhân viên cần đăng ký
 * @returns Promise<number> - Status code trả về từ API
 */
export async function registerStaff(doctor: Doctor): Promise<number> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs`,
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
 * Đăng ký ca làm việc mới cho nhân viên
 * @param staffId - ID của nhân viên
 * @param startTime - Thời gian bắt đầu ca
 * @param endTime - Thời gian kết thúc ca
 * @param description - Mô tả ca làm việc (tùy chọn)
 * @param location - Địa điểm làm việc (tùy chọn)
 * @returns Promise<string> - ID của ca làm việc mới được tạo
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
    throw new Error("Failed to register shifts for chosen doctor");
  }
}

/**
 * Cập nhật thông tin ca làm việc
 * @param shift - Thông tin ca làm việc cần cập nhật
 * @returns Promise<number> - Status code trả về từ API
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
 * Cập nhật thông tin nhân viên
 * @param doctor - Thông tin nhân viên cần cập nhật
 * @returns Promise<number> - Status code trả về từ API
 */
export async function updateStaff(doctor: Doctor): Promise<number> {
  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${doctor.id}`,
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
    throw new Error("Failed to update staff");
  }
}

/**
 * Xóa nhân viên
 * @param id - ID của nhân viên cần xóa
 * @returns Promise<number> - Status code trả về từ API
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
