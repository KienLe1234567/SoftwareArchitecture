"use client";

import DoctorCard from "@/components/DoctorCard";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { createAppointment, getSlots } from "@/lib/appointment";
import { getAllStaffs } from "@/lib/staff";
import { Doctor } from "@/types/doctor";
import { Slot } from "@/types/slot";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function DoctorSessions({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<Slot[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]); // 👈 danh sách bác sĩ

    const doctorId = params.id;

    const fetchDoctors = async () => {
        try {
            const res = await getAllStaffs(); // response = { staffs: [...] }
            setDoctors(res.staffs); // 👈 truy cập đúng vào mảng bên trong
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
        }
    };
    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchSlots = async (date: Date) => {
        try {
            const dateString = date.toLocaleDateString("sv-SE"); // yyyy-MM-dd
            const slots: Slot[] = await getSlots(doctorId, dateString);
            // slots.forEach(slot => {
            //     console.log(`SlotId: ${slot.id}`);
            // });

            setSlotsForSelectedDate(slots);
        } catch (error) {
            console.error("Error fetching slots:", error);
            setSlotsForSelectedDate([]);
        }
    };

    useEffect(() => {
        if (currentDate) {
            fetchSlots(currentDate);
        }
    }, [currentDate, doctorId]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setCurrentDate(date);
            fetchSlots(date);
            setSelectedSlots([]);
        }
    };

    const patientId = "a2559b6b-0ca9-4d88-90b8-9565386339c0";

    const handleConfirmSelection = async () => {
        if (selectedSlots.length === 0) return;

        try {
            //console.log(selectedSlots);
            const slotId = selectedSlots[0]; // chỉ chọn 1 slot để tạo appointment
            //console.log(`SlotID: ${slotId}`);
            const data = { slotId, patientId };
            await createAppointment(data);
            console.log("Appointment created:", data);
            router.push("/dashboardpatient/mySessions");
        } catch (error) {
            console.error("Error creating appointment:", error);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Time Slot Selection</h1>

            {/* Layout 3 cột: bác sĩ - lịch - giờ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột trái: danh sách bác sĩ */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Doctors</h2>
                    <div className="space-y-4">
                        {doctors.map((doc) => (
                            <div key={doc.id} onClick={() => router.push(`/dashboardpatient/doctorSessions/${doc.id}`)}>
                                <DoctorCard
                                    name={doc.name}
                                    email={doc.email}
                                    phoneNumber={doc.phoneNumber}
                                    imageUrl="/avatar.jpg"
                                    isSelected={doc.id === doctorId}
                                />
                            </div>
                        ))}


                    </div>
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
