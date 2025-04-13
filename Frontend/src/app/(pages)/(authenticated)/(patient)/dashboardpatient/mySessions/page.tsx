"use client";

import { Button } from "@/components/ui/button";
import { cancelAppointment, getAppointments } from "@/lib/appointment";
import { Appointment } from "@/types/appointment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MySessions() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

    const router = useRouter();
    const patientId = "a2559b6b-0ca9-4d88-90b8-9565386339c0";

    const openConfirmDialog = (appointmentId: string) => {
        setSelectedAppointmentId(appointmentId);
        setShowConfirmDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (selectedAppointmentId) {
            await cancelAppointment(selectedAppointmentId);
            setAppointments((prev) =>
                prev.filter((app) => app.appointmentId !== selectedAppointmentId)
            );
            setShowConfirmDialog(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await getAppointments(undefined, patientId);
            if (!res) return setAppointments([]);

            const filteredAppointments = res.filter(
                (item: Appointment) => item.status !== "CANCELLED"
            );

            setAppointments(filteredAppointments);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAppointments([]);
        }
    };

    const getToday = () => new Date().toISOString().split("T")[0];

    useEffect(() => {
        fetchAppointments();
    }, []);

    const today = getToday();
    const upcomingAppointments = appointments.filter(
        (a) => a.startTime.split("T")[0] >= today
    );
    const pastAppointments = appointments.filter(
        (a) => a.startTime.split("T")[0] < today
    );

    const renderAppointmentTable = (appointmentList: Appointment[], isPast: boolean = false) => (
        <div className="border-2 rounded-lg overflow-hidden mb-10">
            <table className="w-full table-fixed" style={{ borderCollapse: "separate" }}>
                <thead>
                    <tr className="text-center text-sm">
                        <th className="px-4 py-3 border-b-2 border-blue-500">Doctor Name</th>
                        <th className="px-4 py-3 border-b-2 border-blue-500">Date</th>
                        <th className="px-4 py-3 border-b-2 border-blue-500">Time</th>
                        <th className="px-4 py-3 border-b-2 border-blue-500">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointmentList.length > 0 ? (
                        appointmentList.map((appointment) => {
                            const date = appointment.startTime.split("T")[0];
                            const time = appointment.startTime.split("T")[1]?.slice(0, 5);
                            const isSelected = selectedAppointmentId === appointment.appointmentId;

                            return (
                                <tr key={appointment.appointmentId} className="border-t text-center">
                                    <td className="px-4 py-3 font-medium">{appointment.doctorName}</td>
                                    <td className="px-4 py-3">{date}</td>
                                    <td className="px-4 py-3">{time}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                onClick={() => openConfirmDialog(appointment.appointmentId)}
                                                className="text-white"
                                                disabled={isPast}
                                                style={{
                                                    backgroundColor: isPast ? "#ccc" : "#ef4444",
                                                    cursor: isPast ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                Cancel
                                            </Button>

                                            {showConfirmDialog && isSelected && !isPast && (
                                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                                    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
                                                        <h2 className="text-lg font-semibold mb-4">
                                                            Are you sure you want to cancel this appointment?
                                                        </h2>
                                                        <div className="flex justify-center gap-4">
                                                            <Button
                                                                onClick={handleConfirmCancel}
                                                                className="bg-red-500 text-white"
                                                            >
                                                                Yes
                                                            </Button>
                                                            <Button
                                                                onClick={() => setShowConfirmDialog(false)}
                                                                className="bg-gray-300 text-black"
                                                            >
                                                                No
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                onClick={() =>
                                                    router.push(
                                                        `/dashboardpatient/doctorSessions/${appointment.appointmentId}/reschedule`
                                                    )
                                                }
                                                className="text-white"
                                                disabled={isPast}
                                                style={{
                                                    backgroundColor: isPast ? "#ccc" : "#3b82f6",
                                                    cursor: isPast ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                Change Session
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center py-6 text-gray-500">
                                No appointments found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );


    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

            <section>
                <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                {renderAppointmentTable(upcomingAppointments, false)}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Previous Appointments</h2>
                {renderAppointmentTable(pastAppointments, true)}
            </section>

        </div>
    );
}
