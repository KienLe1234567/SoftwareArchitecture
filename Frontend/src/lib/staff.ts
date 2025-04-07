import axios from "axios";

import { Doctor, DoctorDto } from "@/types/doctor";
import { Shift, ShiftDto } from "@/types/shift";
import { formatToApiIsoString } from "./utils";

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
