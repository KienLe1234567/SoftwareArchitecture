"use client"

import { useState, useMemo } from "react"
import type { Doctor } from "@/types/doctor"
import { cn } from "@/lib/utils"
import { Search, User, Mail, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Props {
  doctors: Doctor[]
  selectedDoctorId: string | null
  onSelectDoctor: (id: string) => void
  maxVisibleDoctors?: number // Optional prop
}

export default function DoctorList({ doctors, selectedDoctorId, onSelectDoctor, maxVisibleDoctors }: Props) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Dynamically decide whether scroll is needed
  const isScrollable = useMemo(
    () => maxVisibleDoctors !== undefined && filteredDoctors.length > maxVisibleDoctors,
    [filteredDoctors.length, maxVisibleDoctors]
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Doctors</h2>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search doctors..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Doctor list container */}
      <div
        className={cn(
          "space-y-2 mt-4 flex-1", // Flex-1 to grow and allow scrolling inside
          isScrollable && "overflow-y-auto", // Scrollable conditionally
        )}
        style={
          isScrollable
            ? { maxHeight: `${maxVisibleDoctors! * 80}px` } // Approximate each doctor button height (adjustable)
            : undefined
        }
      >
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <button
              key={doctor.id}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-150",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                selectedDoctorId === doctor.id
                  ? "bg-primary/10 border-l-4 border-primary"
                  : "border-l-4 border-transparent",
              )}
              onClick={() => onSelectDoctor(doctor.id)}
            >
              <div className="flex flex-col gap-1">
                <div className="font-medium">{doctor.name}</div>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{doctor.phone}</span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No doctors found</p>
          </div>
        )}
      </div>
    </div>
  )
}
