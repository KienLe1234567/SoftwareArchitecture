import Link from "next/link"
import { Home, CalendarCheck, ClipboardList,Stethoscope  } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function Sidebar() {
  return (
    <div className="flex w-16 transition-all duration-200 ease-in-out">
      <div className="bg-white h-screen p-4 border-r border-gray-200 w-16 flex flex-col items-center space-y-6">
        {/* Home */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboardstaff/homepage">
              <Home className="text-gray-800 hover:text-blue-600 cursor-pointer" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Home
          </TooltipContent>
        </Tooltip>

        {/* Scheduling Working Time */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboardstaff/scheduling">
              <CalendarCheck className="text-gray-800 hover:text-blue-600 cursor-pointer" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Scheduling Working Time
          </TooltipContent>
        </Tooltip>

        {/* Tracking Employee Workload */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboardstaff/trackworkload">
              <ClipboardList className="text-gray-800 hover:text-blue-600 cursor-pointer" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Tracking Workload
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboardstaff/manageworker">
              <Stethoscope className="text-gray-800 hover:text-blue-600 cursor-pointer" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Manage Doctor
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
