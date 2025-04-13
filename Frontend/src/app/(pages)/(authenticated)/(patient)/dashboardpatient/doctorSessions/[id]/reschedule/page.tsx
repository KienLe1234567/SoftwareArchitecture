"use client";

import DoctorCard from "@/components/DoctorCard";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getAppointmentById, getSlots, rescheduleAppointment } from "@/lib/appointment";
import { getStaffById } from "@/lib/staff";
import { Doctor } from "@/types/doctor";
import { Slot } from "@/types/slot";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DoctorSessions({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<Slot[]>([]);
    const [doctor, setDoctor] = useState<Doctor | null>(null); // chỉ 1 doctor
    const [doctorId, setDoctorId] = useState<string | null>(null);

    const appointmentId = params.id;
    const patientId = "a2559b6b-0ca9-4d88-90b8-9565386339c0";

    // Lấy doctorId từ appointmentId, sau đó fetch thông tin doctor
    useEffect(() => {
        const fetchDoctorInfo = async () => {
            try {
                const appointment = await getAppointmentById(appointmentId);
                const id = appointment.doctorId;
                setDoctorId(id);

                const doctorInfo = await getStaffById(id);
                if (doctorInfo.staffType === "Doctor") {
                    setDoctor({
                        id: doctorInfo.id as string,
                        name: doctorInfo.name,
                        email: doctorInfo.email,
                        phoneNumber: doctorInfo.phoneNumber,
                        address: doctorInfo.address,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch doctor by appointment:", error);
            }
        };

        fetchDoctorInfo();
    }, [appointmentId]);

    // Lấy slots theo doctorId và ngày được chọn
    const fetchSlots = async (date: Date, doctorId: string) => {
        try {
            const dateString = date.toLocaleDateString("sv-SE"); // yyyy-MM-dd
            const slots: Slot[] = await getSlots(doctorId, dateString);
            setSlotsForSelectedDate(slots);
        } catch (error) {
            console.error("Error fetching slots:", error);
            setSlotsForSelectedDate([]);
        }
    };

    // Khi doctorId hoặc currentDate thay đổi → fetch slots
    useEffect(() => {
        if (doctorId && currentDate) {
            fetchSlots(currentDate, doctorId);
        }
    }, [doctorId, currentDate]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date && doctorId) {
            setCurrentDate(date);
            fetchSlots(date, doctorId);
            setSelectedSlots([]);
        }
    };

    const handleConfirmSelection = async () => {
        if (selectedSlots.length === 0) return;

        try {
            const slotId = selectedSlots[0];
            await rescheduleAppointment(appointmentId, slotId);
            console.log("Appointment changed to slot:", slotId);
            router.push("/dashboardpatient/mySessions");
        } catch (error) {
            console.error("Error creating appointment:", error);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Reschedule Appointment</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột trái: chỉ hiển thị đúng bác sĩ của appointment */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Doctor</h2>
                    {doctor && (
                        <DoctorCard
                            name={doctor.name}
                            email={doctor.email}
                            phoneNumber={doctor.phoneNumber}
                            imageUrl="/avatar.jpg"
                            isSelected={true}
                        />
                    )}
                </div>

                {/* Cột giữa: Calendar */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Select Date</h2>
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={handleDateSelect}
                        className="rounded-md border w-full max-w-xs text-sm"
                    />
                </div>

                {/* Cột phải: Time slots */}
                <div className="space-y-6">
                    <TimeSlotGrid
                        selectedSlots={selectedSlots}
                        setSelectedSlots={setSelectedSlots}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        slots={slotsForSelectedDate}
                    />

                    <div className="flex justify-end">
                        <Button
                            onClick={handleConfirmSelection}
                            disabled={selectedSlots.length === 0}
                            className="px-6"
                        >
                            OK
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
