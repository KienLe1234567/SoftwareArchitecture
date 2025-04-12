import { Patient } from "@/types/types";
import axios from "axios";

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
