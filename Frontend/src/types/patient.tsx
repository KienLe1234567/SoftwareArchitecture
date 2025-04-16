export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: "male" | "female" | "other";
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    address?: string;
}

export interface PatientDto {
    patients: Patient[];
}
