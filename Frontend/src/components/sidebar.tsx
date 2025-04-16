import Link from "next/link"
import { Home } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function Sidebar() {
  return (
    <div className="flex w-16 transition-all duration-200 ease-in-out">
      <div className="bg-white h-screen p-4 border-r border-gray-200 w-16 flex flex-col items-center space-y-6">
        {/* Sidebar Items */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/homepage">
              <Home className="text-gray-800 hover:text-blue-600 cursor-pointer" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Home
          </TooltipContent>
        </Tooltip>

        {/* Add more items similarly */}
      </div>
    </div>
  )
}
