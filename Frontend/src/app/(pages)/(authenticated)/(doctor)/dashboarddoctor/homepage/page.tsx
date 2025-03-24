"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DateComponent() {
    const [today, setToday] = useState("");
    const [doctor, setDoctor] = useState<{
        ID: string;
        Name: string;
        NumOfPatient: string;
        NumOfMedHistory: string;
        NumOfTodayAppointment: string;
    } | null>(null);

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        setToday(currentDate);

        const doctor = {
            ID: "D-1",
            Name: "Test Doctor 1",
            NumOfPatient: "2",
            NumOfMedHistory: "5",
            NumOfTodayAppointment: "1"
        };
        setDoctor(doctor);
    }, []);

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1 style={{ marginTop: "auto", marginBottom: "auto", marginLeft: "140px", fontSize: "30px", fontWeight: 600 }}>Dashboard</h1>
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

            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg max-w-7xl mx-auto" style={{ marginBottom: "40px" }}>
                {/* <!-- Background image --> */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/b8.jpg')", filter: "brightness(0.9)" }}>
                </div>

                {/* <!-- Overlay (optional, để làm nền tối nhẹ cho dễ đọc chữ) --> */}
                <div className="absolute inset-0 bg-white bg-opacity-40"></div>


                {/* <!-- Text content --> */}
                <div className="relative z-10 h-full flex items-center justify-start pl-10">
                    <div className="text-left max-w-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{doctor?.Name}</h1>
                        <p className="text-gray-700 mb-6">
                            Thanks for joining with us. We are always trying to get you a complete service.<br />
                            You can view your dailly schedule, Reach Patients Appointment at home!
                        </p>
                        <Link href="./appointment">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-md" style={{ boxShadow: "0 4px 5px 0 rgba(57,108,240,0.3)" }}>
                                View My Appointments
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex p-4 gap-4 mx-auto" style={{ width: "90%" }}>
                {/* Left Side - Status */}
                <div className="w-1/2 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 mx-auto">
                        <div className="border-2 rounded p-4 flex justify-between items-center" style={{ width: "16rem" }}>
                            {/* Nội dung bên trái */}
                            <div>
                                <p className="text-blue-500 text-2xl">{doctor?.ID}</p>
                                <p className="text-gray-700">Doctor ID</p>
                            </div>

                            {/* Icon bọc nền và phóng to */}
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img
                                    src="/doctors-hover.svg"
                                    className="w-8 h-8"
                                    alt="Doctor Icon"
                                />
                            </div>
                        </div>

                        {/* All Patients */}
                        <div className="border-2 rounded p-4 flex justify-between items-center" style={{ width: "16rem" }}>
                            <div>
                                <p className="text-blue-500 text-2xl">{doctor?.NumOfPatient}</p>
                                <p className="text-gray-700">Upcoming Patients</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/patients-hover.svg" className="w-8 h-8" alt="Patient Icon" />
                            </div>
                        </div>

                        {/* All Sessions */}
                        <div className="border-2 rounded p-4 flex justify-between items-center" style={{ width: "16rem" }}>
                            <div>
                                <p className="text-blue-500 text-2xl">{doctor?.NumOfMedHistory}</p>
                                <p className="text-gray-700">Medical Histories</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/book-hover.svg" className="w-8 h-8" alt="Booking Icon" />
                            </div>
                        </div>

                        {/* Today Sessions */}
                        <div className="border-2 rounded p-4 flex justify-between items-center" style={{ width: "16rem" }}>
                            <div>
                                <p className="text-blue-500 text-2xl">{doctor?.NumOfTodayAppointment}</p>
                                <p className="text-gray-700">Today Appointments</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/session-iceblue.svg" className="w-8 h-8" alt="Session Icon" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Upcoming Sessions */}
                <div className="w-1/2 border-2 rounded py-4 overflow-auto" style={{ width: "45%" }}>
                    <h2 className="text-xl text-center font-semibold mb-2">
                        Your Up Coming Sessions until Next week
                    </h2>
                    <table className="w-full table-fixed text-center" style={{ borderCollapse: "separate" }}>
                        <thead>
                            <tr>
                                <th className="border-b-2 border-blue-500">Session Title</th>
                                <th className="border-b-2 border-blue-500">Sheduled Date</th>
                                <th className="border-b-2 border-blue-500">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Nếu không có dữ liệu */}
                            <tr>
                                <td colSpan={3} className="text-center py-10">
                                    <img
                                        src="/notfound.svg"
                                        alt="No sessions"
                                        className="mx-auto w-32"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div >
    );
}
