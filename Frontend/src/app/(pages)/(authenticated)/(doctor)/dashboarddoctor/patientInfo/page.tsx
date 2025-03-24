"use client";
import { useRouter } from "next/navigation";

export default function PatientProfile() {
    const router = useRouter();

    // Giả sử dữ liệu bệnh nhân đến từ props/API
    const patient = {
        id: "P-123456",
        name: "Test Patient 1",
        age: 18,
        dob: "2003-01-01",
        gender: "Male",
        phone: "0901234567",
        address: "123 To Hien Thanh Str, Ward 1, District 1",
        healthInsurance: "Yes",
        livingArrangement: "With family",
        allergies: {
            drugs: "Penicillin",
            drugsReaction: "Rash",
            environment: "Dust",
            environmentReaction: "Sneezing",
            adr: "N/A",
            adrReaction: "N/A"
        },
        medical: {
            chiefComplaint: "Frequent headaches",
            history: "Recurring for 3 months",
            past: "No major illnesses",
            family: "Father has migraines"
        },
        social: {
            tobacco: "No",
            tobaccoDetail: "",
            alcohol: "Yes",
            alcoholDetail: "<2 drinks per week",
            caffeine: "Yes",
            caffeineDetail: "2-6 cups per day",
            drugs: "No",
            drugsList: ""
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg space-y-6">
            <h1 className="text-2xl font-semibold mb-2">Patient Profile</h1>

            {/* Patient Info */}
            <div>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Patient ID:</strong> {patient.id}</div>
                    <div><strong>Name:</strong> {patient.name}</div>
                    <div><strong>Age:</strong> {patient.age}</div>
                    <div><strong>Date of Birth:</strong> {patient.dob}</div>
                    <div><strong>Gender:</strong> {patient.gender}</div>
                    <div><strong>Phone Number:</strong> {patient.phone}</div>
                    <div className="col-span-2"><strong>Address:</strong> {patient.address}</div>
                    <div><strong>Health Insurance:</strong> {patient.healthInsurance}</div>
                    <div><strong>Living Arrangement:</strong> {patient.livingArrangement}</div>
                </div>
            </div>

            {/* Allergies */}
            <div>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Allergies</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Drugs:</strong> {patient.allergies.drugs}</div>
                    <div><strong>Reaction:</strong> {patient.allergies.drugsReaction}</div>
                    <div><strong>Environment:</strong> {patient.allergies.environment}</div>
                    <div><strong>Reaction:</strong> {patient.allergies.environmentReaction}</div>
                    <div><strong>ADR:</strong> {patient.allergies.adr}</div>
                    <div><strong>Reaction:</strong> {patient.allergies.adrReaction}</div>
                </div>
            </div>

            {/* Medical Info */}
            <div>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Medical Information</h2>
                <div className="space-y-2 text-sm">
                    <div><strong>Chief Complaint:</strong> {patient.medical.chiefComplaint}</div>
                    <div><strong>History of present illness:</strong> {patient.medical.history}</div>
                    <div><strong>Past Medical History:</strong> {patient.medical.past}</div>
                    <div><strong>Family History:</strong> {patient.medical.family}</div>
                </div>
            </div>

            {/* Social History */}
            <div>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Social History</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Tobacco Use:</strong> {patient.social.tobacco}</div>
                    <div>{patient.social.tobaccoDetail}</div>
                    <div><strong>Alcohol Use:</strong> {patient.social.alcohol}</div>
                    <div>{patient.social.alcoholDetail}</div>
                    <div><strong>Caffeine Use:</strong> {patient.social.caffeine}</div>
                    <div>{patient.social.caffeineDetail}</div>
                    <div><strong>Other Drug Use:</strong> {patient.social.drugs}</div>
                    <div>{patient.social.drugsList}</div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                    Back
                </button>
                <button
                    onClick={() => router.push(`./editPatient`)} //router.push(`./edit-patient/${patient.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                    Edit Info
                </button>
            </div>
        </div>
    );
}
