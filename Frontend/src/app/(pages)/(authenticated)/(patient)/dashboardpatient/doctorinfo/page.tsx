"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DateComponent() {
    const [today, setToday] = useState("");
    const [doctors, setDoctors] = useState<{
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
    }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0];
        setToday(currentDate);

        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs`);
                const data = await response.json();
                setDoctors(data.staffs);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1 style={{ marginTop: "auto", marginBottom: "auto", marginLeft: "24px", fontSize: "30px", fontWeight: 600 }}>Doctor Information</h1>
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
                <h2 className="text-2xl font-semibold mb-4">All Doctors ({filteredDoctors.length})</h2>

                {/* Search Bar for Doctor Name */}
                <div className="flex items-center gap-4 mb-4 justify-center">
                    {/* Input: Doctor name */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="doctorName" className="text-gray-600 font-medium">Doctor Name:</label>
                        <input
                            type="text"
                            id="doctorName"
                            placeholder="Enter doctor name"
                            className="border-2 rounded px-3 py-2 text-sm w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Clear Button */}
                    <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium" onClick={() => setSearchQuery("")}>
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

                {/* Doctor Table */}
                <div className="border-2 rounded-lg overflow-hidden">
                    <table className="w-full table-fixed" style={{ borderCollapse: "separate" }}>
                        <thead>
                            <tr className="text-center text-sm" style={{ borderColor: "#0a76d8" }}>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Doctor Name</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Email</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Phone Number</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Events</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.map((doctor, index) => (
                                <tr key={index} className="border-t text-center">
                                    <td className="px-4 py-3 font-medium">{doctor.name}</td>
                                    <td className="px-4 py-3">{doctor.email}</td>
                                    <td className="px-4 py-3">{doctor.phoneNumber}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-center">
                                            <Link href="./doctorView">
                                                <button className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </Link>
                                            <Link href={`./doctorSessions/${doctor.id}`}>
                                                <button className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m-12 4h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Sessions
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