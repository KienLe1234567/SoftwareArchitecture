"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Appointment {
    id: number;
    doctorName: string;
    date: string;
    time: string;
}

export default function MySessions() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Giả lập gọi API để lấy danh sách lịch hẹn
        // const fetchAppointments = async () => {
        //     // Thay thế bằng logic gọi API thực tế
        //     const response = await fetch("/api/appointments");
        //     const data = await response.json();
        //     setAppointments(data);
        // };

        // fetchAppointments();
        const fetchAppointments = () => {
            const fakeData = [
                { id: 1, doctorName: "Dr. Smith", date: "2024-03-20", time: "10:00" },
                { id: 2, doctorName: "Dr. Johnson", date: "2024-03-21", time: "14:00" },
                { id: 3, doctorName: "Dr. Lee", date: "2024-03-22", time: "09:30" },
            ];
            setAppointments(fakeData);
        }
        fetchAppointments();
    }, []);

    const handleCancelAppointment = (id: number) => {
        // Logic hủy lịch hẹn
        console.log("Cancel appointment with ID:", id);
        // Cập nhật lại danh sách lịch hẹn sau khi hủy
        setAppointments(appointments.filter(appointment => appointment.id !== id));
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
            <div className="border-2 rounded-lg overflow-hidden">
                <table className="w-full table-fixed" style={{ borderCollapse: "separate" }}>
                    <thead>
                        <tr className="text-center text-sm" style={{ borderColor: "#0a76d8" }}>
                            <th className="px-4 py-3 border-b-2 border-blue-500">Doctor Name</th>
                            <th className="px-4 py-3 border-b-2 border-blue-500">Date</th>
                            <th className="px-4 py-3 border-b-2 border-blue-500">Time</th>
                            <th className="px-4 py-3 border-b-2 border-blue-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment.id} className="border-t text-center">
                                <td className="px-4 py-3 font-medium">{appointment.doctorName}</td>
                                <td className="px-4 py-3">{appointment.date}</td>
                                <td className="px-4 py-3">{appointment.time}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-2">
                                        <Button onClick={() => handleCancelAppointment(appointment.id)} className="bg-red-500 text-white">
                                            Cancel
                                        </Button>
                                        <Button onClick={() => {
                                            //handleCancelAppointment(appointment.id);
                                            router.push("/dashboardpatient/doctorSessions");
                                        }} className="bg-blue-500 text-white">
                                            Change Session
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
