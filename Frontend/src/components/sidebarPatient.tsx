"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    CalendarDays,
    Home,
    Stethoscope,
    Users,
} from "lucide-react"; // Thêm icon mới nếu cần
import Link from "next/link";

export default function PatientSidebar() {
    return (
        <div className="flex w-16 flex-shrink-0 transition-all duration-200 ease-in-out">
            <div className="flex h-screen flex-col items-center space-y-6 border-r border-gray-200 bg-white p-4">

                {/* Homepage */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboardpatient/homepage">
                            <div className="rounded-lg p-2 transition-colors hover:bg-muted">
                                <Home className="h-6 w-6 text-gray-700 group-hover:text-foreground" />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        Home
                    </TooltipContent>
                </Tooltip>

                {/* Doctor List */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboardpatient/doctorinfo">
                            <div className="rounded-lg p-2 transition-colors hover:bg-muted">
                                <Stethoscope className="h-6 w-6 text-gray-700 group-hover:text-foreground" />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        Doctor List
                    </TooltipContent>
                </Tooltip>

                {/* My Appointments */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboardpatient/mySessions">
                            <div className="rounded-lg p-2 transition-colors hover:bg-muted">
                                <CalendarDays className="h-6 w-6 text-gray-700 group-hover:text-foreground" />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        My Appointments
                    </TooltipContent>
                </Tooltip>

                {/* Patient Profile */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboardpatient/profilePatient">
                            <div className="rounded-lg p-2 transition-colors hover:bg-muted">
                                <Users className="h-6 w-6 text-gray-700 group-hover:text-foreground" />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        Patient Profile
                    </TooltipContent>
                </Tooltip>

            </div>
        </div>
    );
}
