"use client"

import Link from "next/link"
import { useState } from "react"
import { CalendarCheck, ClipboardList, UserRound } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Doctor } from "@/types/doctor"

const dummyDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. John Doe",
    phone: "123-456-7890",
    email: "john@example.com",
    workload: {
      "2025-03-24": ["07:00", "07:30", "13:00"],
      "2025-03-25": ["08:00", "13:30", "14:00"],
    },
  },
  {
    id: "2",
    name: "Dr. Jane Smith",
    phone: "987-654-3210",
    email: "jane@example.com",
    workload: {
      "2025-03-24": ["07:00", "13:30"],
      "2025-03-26": ["07:30", "08:00", "13:00", "14:00"],
    },
  },
]

export default function HospitalManagerHomepage() {
  const [doctors] = useState<Doctor[]>(dummyDoctors)

  const totalDoctors = doctors.length

  const totalScheduledSlots = doctors.reduce(
    (acc, doc) =>
      acc +
      Object.values(doc.workload).reduce((sum, slots) => sum + slots.length, 0),
    0
  )

  const busiestDoctor = doctors
    .map((doc) => ({
      doctor: doc,
      totalSlots: Object.values(doc.workload).reduce(
        (sum, slots) => sum + slots.length,
        0
      ),
    }))
    .sort((a, b) => b.totalSlots - a.totalSlots)[0]

  const todayKey = new Date().toISOString().split("T")[0]
  const doctorsToday = doctors.filter((doc) => doc.workload[todayKey])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Hospital Manager Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Doctors</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <UserRound className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-semibold">{totalDoctors}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Scheduled Slots</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <CalendarCheck className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-semibold">{totalScheduledSlots}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Busiest Doctor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start justify-between">
            <div className="text-lg font-semibold">
              {busiestDoctor?.doctor.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {busiestDoctor?.totalSlots} slots scheduled
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Scheduling Working Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Manage and assign working schedules for doctors.
            </p>
            <Link href="/dashboardstaff/scheduling">
              <Button variant="default" className="w-full">
                Go to Scheduling
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking Employee Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              View doctors' workload and analyze performance.
            </p>
            <Link href="/dashboardstaff/trackworkload">
              <Button variant="default" className="w-full">
                Go to Workload Tracking
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Today's Schedule</h2>
        {doctorsToday.length === 0 ? (
          <p className="text-muted-foreground">No doctors scheduled for today.</p>
        ) : (
          <ul className="space-y-4">
            {doctorsToday.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{doc.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Slots: {doc.workload[todayKey].join(", ")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
