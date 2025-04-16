
export interface Doctor {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}
export interface DoctorDto {
  staffs: Doctor[];
}
