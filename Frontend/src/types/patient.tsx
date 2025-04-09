export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    email: string;
    phoneNumber: string;
    address?: string;
}

export interface PatientDto {
    patients: Patient[];
}
