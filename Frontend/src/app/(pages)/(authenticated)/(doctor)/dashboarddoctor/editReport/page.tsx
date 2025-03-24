"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditReport() {
    const router = useRouter();

    const [report, setReport] = useState({
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
            }
        ],
        labResults: [
            {
                test: "Blood Pressure",
                result: "120/80 mmHg",
                notes: "Normal"
            }
        ],
        doctorNotes: "Follow up in 1 month."
    });

    // Cập nhật field đơn
    const handleChange = (field: string, value: string) => {
        setReport((prev) => ({ ...prev, [field]: value }));
    };

    // Cập nhật field trong prescriptions hoặc labResults
    const handleNestedChange = (section: string, index: number, key: string, value: string) => {
        setReport((prev) => ({
            ...prev,
            [section]: Array.isArray(prev[section as keyof typeof report])
                ? (prev[section as keyof typeof report] as any[]).map((item, i) =>
                    i === index ? { ...item, [key]: value } : item
                )
                : prev[section as keyof typeof report]
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg space-y-6">
            <h1 className="text-2xl font-semibold mb-2">Edit Medical Report</h1>

            {/* Report Info */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Report Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="font-medium">Report ID:</label>
                        <input
                            className="w-full border rounded px-2 py-1 mt-1 bg-gray-100"
                            value={report.reportId}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="font-medium">Date:</label>
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={report.date}
                            onChange={(e) => handleChange("date", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-medium">Patient Name:</label>
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={report.patientName}
                            onChange={(e) => handleChange("patientName", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-medium">Doctor Name:</label>
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={report.doctorName}
                            onChange={(e) => handleChange("doctorName", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Diagnosis */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Diagnosis</h2>
                <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                    value={report.diagnosis}
                    onChange={(e) => handleChange("diagnosis", e.target.value)}
                />
            </section>

            {/* Prescriptions */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Prescriptions</h2>
                <div className="space-y-4 text-sm">
                    {report.prescriptions.map((med, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="font-medium">Medicine</label>
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={med.name}
                                    onChange={(e) => handleNestedChange("prescriptions", index, "name", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="font-medium">Dosage</label>
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={med.dosage}
                                    onChange={(e) => handleNestedChange("prescriptions", index, "dosage", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="font-medium">Frequency</label>
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={med.frequency}
                                    onChange={(e) => handleNestedChange("prescriptions", index, "frequency", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Lab Results */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Lab Results</h2>
                <div className="space-y-4 text-sm">
                    {report.labResults.map((res, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="font-medium">Test</label>
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={res.test}
                                    onChange={(e) => handleNestedChange("labResults", index, "test", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="font-medium">Result</label>
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={res.result}
                                    onChange={(e) => handleNestedChange("labResults", index, "result", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="font-medium">Notes</label>
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={res.notes}
                                    onChange={(e) => handleNestedChange("labResults", index, "notes", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Notes */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Doctor's Notes</h2>
                <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={4}
                    value={report.doctorNotes}
                    onChange={(e) => handleChange("doctorNotes", e.target.value)}
                />
            </section>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                    Cancel
                </button>
                <button
                    onClick={() => alert("Save logic goes here")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
