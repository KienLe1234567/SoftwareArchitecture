"use client"

import TimeSlotGrid from "@/components/TimeSlotGrid"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DoctorSessions({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [selectedSlots, setSelectedSlots] = useState<string[]>([])
    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [workload, setWorkload] = useState<Record<string, string[]>>({})
    const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({})

    // Tìm ngày gần nhất có slot trống
    useEffect(() => {
        if (Object.keys(availableSlots).length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const futureDates = Object.keys(availableSlots)
                .map(dateStr => {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const d = new Date(year, month - 1, day); // Tạo Date không bị lệch múi giờ
                    d.setHours(0, 0, 0, 0);
                    return d;
                })
                .filter(date => date.getDate() > today.getDate())
                .sort((a, b) => a.getTime() - b.getTime());

            if (futureDates.length > 0) {
                setCurrentDate(futureDates[0]);
            }
        }
    }, [availableSlots]);
    console.log("availableSlots:", availableSlots);

    const doctorId = params.id;
    // console.log("doctorId:", doctorId);

    useEffect(() => {
        const fetchShiftsAndSlots = async () => {
            try {
                // console.log("doctorId:", doctorId);
                // console.log("Start fetching shifts...");
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/staffs-api/api/staffs/${doctorId}/shifts`);
                // console.log("Shifts response:", response.data);
                const shifts = response.data.shifts;

                // Tạo workload từ shifts
                const newWorkload: Record<string, string[]> = {};
                shifts.forEach((shift: any) => {
                    const date = shift.startTime.split("T")[0];
                    if (!newWorkload[date]) {
                        newWorkload[date] = [];
                    }
                    newWorkload[date].push(shift.startTime);
                });
                setWorkload(newWorkload);

                // Hàm tạo danh sách ngày giữa start và end
                const getDatesBetween = (start: Date, end: Date): string[] => {
                    const dates: string[] = [];
                    const current = new Date(start);
                    while (current <= end) {
                        dates.push(current.toISOString().split("T")[0]);
                        current.setDate(current.getDate() + 1);
                    }
                    return dates;
                };

                const newAvailableSlots: Record<string, string[]> = {};

                for (const shift of shifts) {
                    const startDate = new Date(shift.startTime);
                    const endDate = new Date(shift.endTime);

                    const datesInRange = getDatesBetween(startDate, endDate);

                    for (const date of datesInRange) {
                        try {
                            const slotsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments-api/api/slots?doctorId=${doctorId}&date=${date}`);
                            const slots = slotsResponse.data;
                            // console.log("API date:", date);
                            // console.log("First slot from API:", slots[0]?.startTime);

                            if (!Array.isArray(slots)) {
                                console.warn(`Slots for ${date} is not an array:`, slots);
                                return;
                            }

                            if (!newAvailableSlots[date]) {
                                newAvailableSlots[date] = [];
                            }

                            const slotTimes = slots.map(slot => slot.startTime);
                            newAvailableSlots[date] = [...newAvailableSlots[date], ...slotTimes];
                        } catch (err) {
                            console.error(`Error fetching slots for ${date}:`, err);
                        }
                    }
                }

                console.log("newAvailableSlots:", newAvailableSlots);
                setAvailableSlots(newAvailableSlots);

            } catch (error) {
                console.error("Error fetching shifts or slots:", error);
            }
        };

        if (doctorId) {
            fetchShiftsAndSlots();
        }
        else {
            console.warn("doctorId is undefined, skipping fetch.");
        }
    }, [doctorId]);

    const handleConfirmSelection = () => {
        console.log("Selected date:", currentDate)
        console.log("Selected slots:", selectedSlots)

        // Điều hướng đến trang thông tin lịch khám
        router.push("/dashboardpatient/mySessions")
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Time Slot Selection</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-lg font-semibold mb-4">Select Date</h2>
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(date) => date && setCurrentDate(date)}
                        className="rounded-md border"
                        disabled={(date) => {
                            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                            const dateString = localDate.toISOString().split('T')[0];
                            // console.log("Calendar date being checked:", dateString);
                            // console.log("Available dates:", Object.keys(availableSlots));
                            return !(dateString in availableSlots);
                        }}
                    />

                </div>

                <div className="space-y-6">
                    {Object.keys(availableSlots).length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                            <p className="text-gray-500 mb-4">Xin lỗi, bác sĩ này không còn lịch trống trong thời gian tới.</p>
                            <p className="text-gray-500">Vui lòng chọn bác sĩ khác.</p>
                        </div>
                    ) : (
                        <TimeSlotGrid
                            selectedSlots={selectedSlots}
                            setSelectedSlots={setSelectedSlots}
                            currentDate={currentDate}
                            setCurrentDate={setCurrentDate}
                            availableSlots={availableSlots}
                        />
                    )}

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
    )
}