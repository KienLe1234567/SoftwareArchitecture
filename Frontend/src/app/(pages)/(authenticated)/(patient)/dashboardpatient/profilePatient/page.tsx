"use client";

import { getPatientById } from "@/lib/patient";
import { Patient, PatientAllergy, PatientMedical, PatientSocial } from "@/types/patientfake";
import { useEffect, useState } from "react";

const patientId = "a2559b6b-0ca9-4d88-90b8-9565386339c0";

export default function PatientProfile() {
    const [patient, setPatient] = useState<Patient | null>(null);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await getPatientById(patientId);
                const dob = new Date(res.dateOfBirth);
                const age = new Date().getFullYear() - dob.getFullYear();
                const fullName = `${res.firstName} ${res.lastName}`;

                // Fake additional data
                const allergies: PatientAllergy = {
                    drugs: "Penicillin",
                    drugsReaction: "Rash",
                    environment: "Pollen",
                    environmentReaction: "Sneezing",
                };

                const medical: PatientMedical = {
                    chiefComplaint: "Headache",
                    history: "Intermittent for 3 days",
                    past: "Hypertension",
                    family: "Father has diabetes",
                };

                const social: PatientSocial = {
                    tobacco: "No",
                    alcohol: "Occasionally",
                    caffeine: "Yes",
                    caffeineDetail: "2 cups/day",
                    drugs: "No",
                };

                const fullPatient: Patient = {
                    id: res.id,
                    name: fullName,
                    age,
                    dob: res.dateOfBirth.split("T")[0],
                    gender: "Male",
                    phone: res.phoneNumber,
                    email: res.email,
                    address: "123 Nguyen Trai, District 5",
                    allergies,
                    medical,
                    social,
                };

                setPatient(fullPatient);
            } catch (error) {
                console.error("Failed to fetch patient:", error);
            }
        };

        fetchPatient();
    }, []);

    if (!patient) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Patient Profile</h1>

            {/* Personal Info */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <p><strong>Full Name:</strong> {patient.name}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Date of Birth:</strong> {patient.dob}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Phone:</strong> {patient.phone}</p>
                <p><strong>Email:</strong> {patient.email}</p>
                <p><strong>Address:</strong> {patient.address}</p>
            </div>

            {/* Allergies */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Allergies</h2>
                <p><strong>Drugs:</strong> {patient.allergies?.drugs} ({patient.allergies?.drugsReaction})</p>
                <p><strong>Environment:</strong> {patient.allergies?.environment} ({patient.allergies?.environmentReaction})</p>
            </div>

            {/* Medical History */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Medical History</h2>
                <p><strong>Chief Complaint:</strong> {patient.medical?.chiefComplaint}</p>
                <p><strong>History of Present Illness:</strong> {patient.medical?.history}</p>
                <p><strong>Past Medical History:</strong> {patient.medical?.past}</p>
                <p><strong>Family History:</strong> {patient.medical?.family}</p>
            </div>

            {/* Social History */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Social History</h2>
                <p><strong>Tobacco:</strong> {patient.social?.tobacco}</p>
                <p><strong>Alcohol:</strong> {patient.social?.alcohol}</p>
                <p><strong>Caffeine:</strong> {patient.social?.caffeine} ({patient.social?.caffeineDetail})</p>
                <p><strong>Drugs:</strong> {patient.social?.drugs}</p>
            </div>
        </div>
    );
}
