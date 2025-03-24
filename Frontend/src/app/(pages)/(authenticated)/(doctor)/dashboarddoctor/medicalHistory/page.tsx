"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MedicalHistory() {
    const [today, setToday] = useState("");
    const [reports, setReports] = useState<{
        reportId: string;
        patientName: string;
        diagnosis: string;
        date: string;
        doctorName: string;
    }[]>([]);

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0];
        setToday(currentDate);

        // Dữ liệu giả lập
        const mockReports = [
            {
                reportId: "MR-001",
                patientName: "Test Patient 1",
                diagnosis: "Migraine with aura",
                date: "2025-03-25",
                doctorName: "Dr. John Smith"
            },
            {
                reportId: "MR-002",
                patientName: "Test Patient 1",
                diagnosis: "Seasonal Allergy",
                date: "2025-02-10",
                doctorName: "Dr. Alice Nguyen"
            }
        ];

        setReports(mockReports);
    }, []);

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1
                    style={{
                        marginTop: "auto",
                        marginBottom: "auto",
                        marginLeft: "24px",
                        fontSize: "30px",
                        fontWeight: 600
                    }}
                >
                    Medical History
                </h1>
                <div className="flex items-center justify-between p-4 w-fit">
                    <div>
                        <p className="text-gray-500 text-sm">Today's Date</p>
                        <p className="text-black text-xl font-semibold">{today}</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg ml-4">
                        <img src="/calendar.svg" className="w-6 h-6" alt="Calendar Icon" />
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                    Medical Reports ({reports.length})
                </h2>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full table-fixed" style={{ borderCollapse: "separate" }}>
                        <thead>
                            <tr className="text-sm text-center">
                                <th className="px-4 py-3 border-b-2 border-blue-500">Report ID</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Patient Name</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Diagnosis</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Doctor</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Date</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => (
                                <tr key={index} className="border-t text-center">
                                    <td className="px-4 py-3 text-blue-600 font-bold">{report.reportId}</td>
                                    <td className="px-4 py-3">{report.patientName}</td>
                                    <td className="px-4 py-3">{report.diagnosis}</td>
                                    <td className="px-4 py-3">{report.doctorName}</td>
                                    <td className="px-4 py-3">{report.date}</td>
                                    <td className="px-4 py-3">
                                        <Link href="./medicalReport"> {/*{`./medicalReport/${report.reportId}`}>*/}
                                            <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md">
                                                View Detail
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-10 text-gray-500">
                                        No reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Floating Add Medical Report Button */}
            <Link href="./addReport">
                <div className="fixed bottom-6 right-6 group cursor-pointer">
                    <div className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs px-3 py-1 rounded transition-all">
                        Add new medical report
                    </span>
                </div>
            </Link>
        </div >
    );
}
