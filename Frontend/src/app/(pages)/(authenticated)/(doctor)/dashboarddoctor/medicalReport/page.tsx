"use client";
import { useRouter } from "next/navigation";

export default function MedicalReport() {
    const router = useRouter();

    const report = {
        reportId: "MR-001",
        patientId: "P-123456",
        patientName: "Test Patient 1",
        doctorName: "Dr. John Smith",
        date: "2025-03-25",
        diagnosis: "Migraine with aura",
        prescriptions: [
            {
                name: "Paracetamol 500mg",
                dosage: "1 tablet",
                frequency: "3 times a day after meals"
            },
            {
                name: "Sumatriptan",
                dosage: "50mg",
                frequency: "Take only during migraine attack"
            }
        ],
        labResults: [
            {
                test: "Blood Pressure",
                result: "120/80 mmHg",
                notes: "Normal"
            },
            {
                test: "Blood Sugar",
                result: "95 mg/dL",
                notes: "Within normal range"
            }
        ],
        doctorNotes:
            "Patient reported moderate improvement. Recommended to reduce screen time and increase water intake. Next follow-up in 1 month."
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg space-y-6">
            <h1 className="text-2xl font-semibold mb-2">Medical Report</h1>

            {/* Report Info */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Report Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Report ID:</strong> {report.reportId}</div>
                    <div><strong>Date:</strong> {report.date}</div>
                    <div><strong>Patient ID:</strong> {report.patientId}</div>
                    <div><strong>Patient Name:</strong> {report.patientName}</div>
                    <div className="col-span-2"><strong>Doctor:</strong> {report.doctorName}</div>
                </div>
            </section>

            {/* Diagnosis */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Diagnosis</h2>
                <p className="text-sm">{report.diagnosis}</p>
            </section>

            {/* Prescriptions */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Prescriptions</h2>
                <div className="space-y-2 text-sm">
                    {report.prescriptions.map((med, index) => (
                        <div key={index} className="border p-3 rounded-md">
                            <p><strong>Medicine:</strong> {med.name}</p>
                            <p><strong>Dosage:</strong> {med.dosage}</p>
                            <p><strong>Frequency:</strong> {med.frequency}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Lab Results */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Lab Results</h2>
                <div className="space-y-2 text-sm">
                    {report.labResults.map((test, index) => (
                        <div key={index} className="border p-3 rounded-md">
                            <p><strong>Test:</strong> {test.test}</p>
                            <p><strong>Result:</strong> {test.result}</p>
                            <p><strong>Notes:</strong> {test.notes}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Doctor's Notes */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Doctor's Notes</h2>
                <p className="text-sm whitespace-pre-line">{report.doctorNotes}</p>
            </section>

            {/* Action buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                    Back
                </button>
                <button
                    onClick={() => router.push(`./editReport`)} //router.push(`/edit-report/${report.reportId}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                    Edit Report
                </button>
            </div>
        </div>
    );
}
