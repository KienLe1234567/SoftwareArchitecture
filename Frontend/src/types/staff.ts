export interface Staff {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  staffType: "Doctor" | "Nurse";
}

export interface Doctor extends Omit<Staff, "staffType"> {
  specialization: string;
  licenseNumber: string;
  consultationRoom: string;
}

export interface Nurse extends Omit<Staff, "staffType"> {
  department: string;
  certificationNumber: string;
  shiftPreference: string;
}

export interface StaffDto {
  staffs: Staff[];
}

export interface DoctorDto {
  staffs: Doctor[];
}

export interface NurseDto {
  staffs: Nurse[];
}
