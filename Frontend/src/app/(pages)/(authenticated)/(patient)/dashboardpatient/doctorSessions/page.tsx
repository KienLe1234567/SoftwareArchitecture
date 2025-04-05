"use client"

import TimeSlotGrid from "@/components/TimeSlotGrid"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DoctorSessions() {
    const router = useRouter()
    const [selectedSlots, setSelectedSlots] = useState<string[]>([])
    const [currentDate, setCurrentDate] = useState<Date>(new Date())

    // Dữ liệu mẫu cho workload
    const workload: Record<string, string[]> = {
        "2024-03-20": ["08:00", "08:30", "09:00"],
        "2024-03-21": ["14:00", "14:30", "15:00"],
    }

    const handleConfirmSelection = () => {
        // Xử lý logic khi người dùng xác nhận chọn lịch
        console.log("Selected date:", currentDate)
        console.log("Selected slots:", selectedSlots)
        // TODO: Thêm logic gọi API hoặc xử lý dữ liệu ở đây

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
                    />
                </div>

                <div className="space-y-6">
                    <TimeSlotGrid
                        selectedSlots={selectedSlots}
                        setSelectedSlots={setSelectedSlots}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        workload={workload}
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
    )
}