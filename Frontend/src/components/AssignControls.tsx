"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Calendar, CalendarRange, Trash2, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Props {
  selectedSlots: string[]
  updateDoctorWorkload: (slots: string[]) => void
  assignRangeSlots: (includeWeekend: boolean) => void
  cancelRangeSlots: () => void
  calendarMode: "single" | "range"
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  assignDefaultDateSlots: () => void
}

export default function AssignControls({
  selectedSlots,
  updateDoctorWorkload,
  assignRangeSlots,
  cancelRangeSlots,
  calendarMode,
  isDirty,
  setIsDirty,
  assignDefaultDateSlots,
}: Props) {
  const [includeWeekend, setIncludeWeekend] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    description: string
    action: () => void
  }>({
    title: "",
    description: "",
    action: () => {},
  })

  const checkModeAndRun = (requiredMode: "single" | "range", callback: () => void) => {
    if (calendarMode !== requiredMode) {
      alert(`Please toggle to "${requiredMode}" mode above before performing this action.`)
      return false
    }
    return true
  }

  const handleConfirm = (title: string, description: string, action: () => void, requiredMode?: "single" | "range") => {
    if (requiredMode && !checkModeAndRun(requiredMode, () => {})) {
      return
    }

    setConfirmAction({
      title,
      description,
      action,
    })
    setConfirmDialogOpen(true)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all duration-200">
  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
    <Button
      variant="primary"
      className="flex items-center gap-2 w-full sm:w-auto hover:bg-primary/10 hover:text-primary"
      onClick={() =>
        handleConfirm(
          "Assign Default Schedule",
          "Are you sure you want to assign default time slots for the selected date?",
          assignDefaultDateSlots,
          "single"
        )
      }
    >
      <Calendar className="h-4 w-4" />
      <span>Default Date</span>
    </Button>

    <Button
      variant="success"
      className="flex items-center gap-2 w-full sm:w-auto hover:bg-primary/10 hover:text-primary"
      onClick={() =>
        handleConfirm(
          "Assign Default Range",
          `Assign default slots to selected date range ${includeWeekend ? "including" : "excluding"} weekends?`,
          () => assignRangeSlots(includeWeekend),
          "range"
        )
      }
    >
      <CalendarRange className="h-4 w-4" />
      <span>Default Range</span>
    </Button>

    {isDirty && selectedSlots.length > 0 && (
      <Button
        variant="default"
        className="flex items-center gap-2 w-full sm:w-auto"
        onClick={() =>
          handleConfirm(
            "Update Time Slots",
            "Are you sure you want to update the selected time slots?",
            () => {
              updateDoctorWorkload(selectedSlots)
              setIsDirty(false)
            },
            "single"
          )
        }
      >
        <Save className="h-4 w-4" />
        <span>Save Changes</span>
      </Button>
    )}

    <Button
      variant="destructive"
      className="flex items-center gap-2 w-full sm:w-auto"
      onClick={() =>
        handleConfirm(
          "Cancel Slots",
          calendarMode === "single"
            ? "Are you sure you want to cancel all slots for the selected date?"
            : "Are you sure you want to cancel all slots for the selected date range?",
          cancelRangeSlots
        )
      }
    >
      <Trash2 className="h-4 w-4" />
      <span>Cancel Slots</span>
    </Button>

    <Button
      variant={includeWeekend ? "secondary" : "outline"}
      className={cn(
        "flex items-center gap-2 w-full sm:w-auto sm:ml-auto",
        includeWeekend ? "bg-secondary" : "hover:bg-secondary/10 hover:text-secondary"
      )}
      onClick={() => setIncludeWeekend(!includeWeekend)}
    >
      {includeWeekend ? (
        <>
          <Check className="h-4 w-4 text-secondary-foreground" />
          <span>Including Weekends</span>
        </>
      ) : (
        <>
          <X className="h-4 w-4" />
          <span>Excluding Weekends</span>
        </>
      )}
    </Button>
  </div>

  {/* Confirm Dialog */}
  <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{confirmAction.title}</DialogTitle>
        <DialogDescription>{confirmAction.description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            confirmAction.action()
            setConfirmDialogOpen(false)
          }}
        >
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

  )
}

