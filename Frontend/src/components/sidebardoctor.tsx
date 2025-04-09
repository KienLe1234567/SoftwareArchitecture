import Link from "next/link";
import { Home, CalendarDays, Users } from "lucide-react"; 
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"; 

export default function Sidebar() {
  return (
      <div className="flex w-16 flex-shrink-0 transition-all duration-200 ease-in-out"> {/* Thêm flex-shrink-0 */}
        <div className="flex h-screen flex-col items-center space-y-6 border-r border-gray-200 bg-white p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboarddoctor/homepage"> {/* Cập nhật link nếu cần */}
                <div className="rounded-lg p-2 transition-colors hover:bg-muted"> {/* Thêm background hover */}
                  <Home className="h-6 w-6 text-gray-700 group-hover:text-foreground" /> {/* Điều chỉnh size/color */}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}> {/* Thêm sideOffset */}
              Home
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboarddoctor/appointment">
                 <div className="rounded-lg p-2 transition-colors hover:bg-muted">
                    <CalendarDays className="h-6 w-6 text-gray-700 group-hover:text-foreground" />
                 </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              My Appointments
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboarddoctor/myPatient">
                <div className="rounded-lg p-2 transition-colors hover:bg-muted">
                   <Users className="h-6 w-6 text-gray-700 group-hover:text-foreground" />
                 </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              My Patients
            </TooltipContent>
          </Tooltip>

        </div>
      </div>
  );
}