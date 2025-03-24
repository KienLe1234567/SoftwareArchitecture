"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Dòng hiển thị thông tin trong modal
// function InfoRow({ label, value }: { label: string, value: string }) {
//     return (
//         <div className="flex justify-between border-b pb-1">
//             <span className="font-medium text-gray-600">{label}:</span>
//             <span className="text-gray-800">{value}</span>
//         </div>
//     );
// }

export default function DateComponent() {
    const [today, setToday] = useState("");
    // const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<{
        id: string;
        name: string;
        age: string;
        dob: string;
        gender: string;
        phone: string;
        address: string;
    }[]>([]);

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0];
        setToday(currentDate);

        // Giả sử đây là dữ liệu patient từ backend
        const patient = [{
            id: "P-1",
            name: "Test Patient 1",
            age: "18",
            dob: "2003-01-01",
            gender: "Male",
            phone: "0901234567",
            address: "123 To Hien Thanh Str, Ward 1, District 1",
        },
        {
            id: "P-2",
            name: "Test Patient 2",
            age: "20",
            dob: "2005-12-01",
            gender: "Female",
            phone: "0907654321",
            address: "123 Tran Hung Dao Str, Ward 5, District 10",
        }];
        setSelectedPatient(patient);
    }, []);

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1 style={{ marginTop: "auto", marginBottom: "auto", marginLeft: "24px", fontSize: "30px", fontWeight: 600 }}>Patient Manager</h1>
                <div className="flex items-center justify-between p-4 w-fit">
                    {/* Bên trái: ngày tháng */}
                    <div>
                        <p className="text-gray-500 text-sm">Today's Date</p>
                        <p className="text-black text-xl font-semibold">{today}</p>
                    </div>

                    {/* Bên phải: icon */}
                    <div className="bg-gray-100 p-2 rounded-lg ml-4">
                        <img src="/calendar.svg" className="w-6 h-6" alt="Calendar Icon" />
                    </div>
                </div>

            </div>

            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">My Patients ({selectedPatient.length})</h2>

                {/* Search Bar for Patient Name */}
                <div className="flex items-center gap-4 mb-4 justify-center">
                    {/* Input: Patient name */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="patientName" className="text-gray-600 font-medium">Patient Name:</label>
                        <input
                            type="text"
                            id="patientName"
                            placeholder="Enter patient name"
                            className="border-2 rounded px-3 py-2 text-sm w-64"
                        />
                    </div>

                    {/* Search Button */}
                    <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md font-medium">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                            />
                        </svg>
                        Search
                    </button>

                    {/* Clear Button */}
                    <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-800"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        Clear
                    </button>
                </div>



                {/* Table */}
                <div className="border-2 rounded-lg overflow-hidden">
                    <table className="w-full table-fixed" style={{ borderCollapse: "separate" }}>
                        <thead>
                            <tr className="text-center text-sm" style={{ borderColor: "#0a76d8" }}>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Patient name</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Age</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Date of birth</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Gender</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Phone Number</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Address</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500"></th>
                                <th className="px-4 py-3 border-b-2 border-blue-500"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPatient.map((patient, index) => (
                                <tr key={index} className="border-t text-center">
                                    <td className="px-4 py-3 font-medium">{patient.name}</td>
                                    <td className="px-4 py-3 font-bold" style={{ color: "#0a76d8" }}>{patient.age}</td>
                                    <td className="px-4 py-3">{patient.dob}</td>
                                    <td className="px-4 py-3">{patient.gender}</td>
                                    <td className="px-4 py-3">{patient.phone}</td>
                                    <td className="px-4 py-3">{patient.address}</td>

                                    {/* View Info button */}
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-center">
                                            <Link href="./patientInfo">
                                                <button
                                                    // onClick={() => {
                                                    //     setSelectedPatient(patient);
                                                    //     setShowInfoModal(true);
                                                    // }}
                                                    className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    View Info
                                                </button>
                                            </Link>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-center">
                                            {/* Nút xem hồ sơ bệnh án */}
                                            <Link href="./medicalHistory">
                                                <button className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 17v-2a4 4 0 014-4h3m-7 6h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    Medical History
                                                </button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL
            {showInfoModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                            onClick={() => setShowInfoModal(false)}
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold mb-4">View Patient Info</h2>

                        <div className="space-y-3 text-sm">
                            <InfoRow label="Patient ID" value={selectedPatient.id} />
                            <InfoRow label="Name" value={selectedPatient.name} />
                            <InfoRow label="Age" value={selectedPatient.age} />
                            <InfoRow label="Date of Birth" value={selectedPatient.dob} />
                            <InfoRow label="Gender" value={selectedPatient.gender} />
                            <InfoRow label="Phone Number" value={selectedPatient.phone} />
                            <InfoRow label="Address" value={selectedPatient.address} />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium">
                                Edit Info
                            </button>
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md font-medium">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Floating Add Patient Button */}
            <Link href="./addPatient">
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
                        Add new patient
                    </span>
                </div>
            </Link>

        </div>
    )
}