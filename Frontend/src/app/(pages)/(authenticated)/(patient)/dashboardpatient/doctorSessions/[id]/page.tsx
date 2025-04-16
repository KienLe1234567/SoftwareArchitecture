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
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    const doctorId = params.id;
    const patientId = "a2559b6b-0ca9-4d88-90b8-9565386339c0";

    const fetchDoctors = async () => {
        try {
            const res = await getAllStaffs(); // res.staffs: Staff[]
            const converted: Doctor[] = res.staffs
                .filter((staff) => staff.id && staff.staffType === "Doctor") // chỉ lấy Doctor
                .map((staff) => ({
                    id: staff.id as string,
                    name: staff.name,
                    email: staff.email,
                    phoneNumber: staff.phoneNumber,
                    address: staff.address ?? "",
                }));

            setDoctors(converted);

        } catch (error) {
            console.error("Failed to fetch doctors:", error);
        }
    };

    const fetchSlots = async (date: Date) => {
        try {
            const dateString = date.toLocaleDateString("sv-SE"); // yyyy-MM-dd
            const slots: Slot[] = await getSlots(doctorId, dateString);
            setSlotsForSelectedDate(slots);
        } catch (error) {
            console.error("Error fetching slots:", error);
            setSlotsForSelectedDate([]);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setCurrentDate(date);
            fetchSlots(date);
            setSelectedSlots([]);
        }
    };

    const handleConfirmSelection = async () => {
        if (selectedSlots.length === 0) return;

        try {
            const slotId = selectedSlots[0];
            const data = { slotId, patientId };
            await createAppointment(data);
            console.log("Appointment created:", data);
            router.push("/dashboardpatient/mySessions");
        } catch (error) {
            console.error("Error creating appointment:", error);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (currentDate) {
            fetchSlots(currentDate);
        }
    }, [currentDate, doctorId]);

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Time Slot Selection</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Doctors list */}
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

                {/* Calendar */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Select Date</h2>
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={handleDateSelect}
                        className="rounded-md border w-full max-w-xs text-sm"
                        disabled={(date) => date <= new Date(new Date().toDateString())}
                    />

                </div>

                {/* Time slots */}
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
