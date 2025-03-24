"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DateComponent() {
    const [today, setToday] = useState("");
    const [appointments, setAppointments] = useState<{
        patientName: string;
        appointmentNumber: string;
        sessionTitle: string;
        sessionDateTime: string;
        appointmentDate: string;
    }[]>([]);

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        setToday(currentDate);

        // Giả sử đây là dữ liệu appointment từ backend
        const appointment = [
            {
                patientName: "Test Patient 1",
                appointmentNumber: "1",
                sessionTitle: "Test Session 1",
                sessionDateTime: "2050-01-01 @18:00",
                appointmentDate: "2022-06-03"
            },
            {
                patientName: "Test Patient 2",
                appointmentNumber: "2",
                sessionTitle: "Session B",
                sessionDateTime: "2050-02-01 @10:00",
                appointmentDate: "2022-07-15",
            },
        ];

        setAppointments(appointment);
    }, []);

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1 style={{ marginTop: "auto", marginBottom: "auto", marginLeft: "24px", fontSize: "30px", fontWeight: 600 }}>Appointment Manager</h1>
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
                <h2 className="text-2xl font-semibold mb-4">My Appointments ({appointments.length})</h2>

                {/* Filter Section */}
                <div className="flex items-center gap-4 mb-4 justify-center">
                    {/* Date input */}
                    <div className="flex items-center gap-2">
                        <label className="text-gray-600 font-medium">Date:</label>
                        <input
                            type="date"
                            className="border rounded px-3 py-2 text-sm"
                            placeholder="mm/dd/yyyy"
                        />
                    </div>

                    {/* Filter Button */}
                    <button className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-medium">
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
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-7.414 7.414a1 1 0 01-1.414 0L4.293 6.707A1 1 0 014 6V4z"
                            />
                        </svg>
                        Filter
                    </button>

                    {/* Clear Filter Button */}
                    <button className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium">
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
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full table-fixed" style={{ borderCollapse: "separate" }}>
                        <thead>
                            <tr className="text-sm text-center">
                                <th className="px-4 py-3 border-b-2 border-blue-500">Patient name</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Appointment Number</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Session Title</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Session Date & Time</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Appointment Date</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Actions</th>
                                <th className="px-4 py-3 border-b-2 border-blue-500">Medical</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment, index) => (
                                <tr key={index} className="border-t text-center">
                                    {/* Patient Name */}
                                    <td className="px-4 py-3">
                                        {appointment.patientName}
                                    </td>

                                    {/* Appointment Number */}
                                    <td className="px-4 py-3 text-blue-600 font-bold">
                                        {appointment.appointmentNumber}
                                    </td>

                                    {/* Session Title */}
                                    <td className="px-4 py-3">
                                        {appointment.sessionTitle}
                                    </td>

                                    {/* Session DateTime */}
                                    <td className="px-4 py-3">
                                        {appointment.sessionDateTime}
                                    </td>

                                    {/* Appointment Date */}
                                    <td className="px-4 py-3">
                                        {appointment.appointmentDate}
                                    </td>

                                    {/* Cancel Button */}
                                    <td className="px-4 py-3">
                                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md">
                                            Cancel
                                        </button>
                                    </td>

                                    {/* View Patient Info Button */}
                                    <td className="px-4 py-3">
                                        <Link href="./myPatient">
                                            <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md">
                                                View Patient Info
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>

        </div>
    )
}