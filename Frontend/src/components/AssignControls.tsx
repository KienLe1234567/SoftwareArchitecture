"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// Import Loader2 for loading indicator
import { Check, X, Calendar, CalendarRange, Save, RotateCcw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  onSaveChanges: () => void;
  onAssignDefaultDate: () => void;
  onAssignDefaultRange: (includeWeekend: boolean) => void;
  onClearPending: () => void;
  calendarMode: "single" | "range";
  hasPendingChanges: boolean;
  isDateOrRangeSelected: boolean;
  isSaving?: boolean; // <-- 1. Add isSaving prop (optional is safer)
}

export default function AssignControls({
  onSaveChanges,
  onAssignDefaultDate,
  onAssignDefaultRange,
  onClearPending,
  calendarMode,
  hasPendingChanges,
  isDateOrRangeSelected,
  isSaving = false, // <-- 2. Destructure isSaving, provide default value
}: Props) {
  const [includeWeekend, setIncludeWeekend] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    action: () => void;
  }>({
    title: "",
    description: "",
    action: () => {},
  });

  const handleConfirm = (
    title: string,
    description: string,
    action: () => void,
    requiredMode?: "single" | "range",
    requiresSelection: boolean = true
  ) => {
    // Prevent opening confirm dialog if already saving
    if (isSaving) return;

    if (requiresSelection && !isDateOrRangeSelected) {
        alert("Please select a date or date range first.");
        return;
    }
    if (requiredMode && calendarMode !== requiredMode) {
      alert(`This action requires the calendar to be in "${requiredMode}" mode.`);
      return;
    }

    setConfirmAction({ title, description, action });
    setConfirmDialogOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all duration-200">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center">
        {/* Assign Default Date */}
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() =>
            handleConfirm(
              "Assign Default Schedule",
              "Add default time slots (7-12, 13-18) for the selected date to your pending changes?",
              onAssignDefaultDate,
              "single"
            )
          }
          // <-- 3. Disable if saving or conditions not met -->
          disabled={isSaving || !isDateOrRangeSelected || calendarMode !== 'single'}
          title={isSaving ? "Saving..." : calendarMode !== 'single' ? "Switch to single date mode" : !isDateOrRangeSelected ? "Select a date" : "Add default slots for date"}
        >
          <Calendar className="h-4 w-4" />
          <span>Default Date</span>
        </Button>

        {/* Assign Default Range */}
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() =>
            handleConfirm(
              "Assign Default Range",
              `Add default slots to the selected date range ${includeWeekend ? "including" : "excluding"} weekends to your pending changes?`,
              () => onAssignDefaultRange(includeWeekend),
              "range"
            )
          }
          // <-- 3. Disable if saving or conditions not met -->
          disabled={isSaving || !isDateOrRangeSelected || calendarMode !== 'range'}
          title={isSaving ? "Saving..." : calendarMode !== 'range' ? "Switch to range mode" : !isDateOrRangeSelected ? "Select a range" : "Add default slots for range"}
        >
          <CalendarRange className="h-4 w-4" />
          <span>Default Range</span>
        </Button>

        {/* Save Changes */}
        {hasPendingChanges && (
          <Button
            variant="success"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() =>
              handleConfirm(
                "Save Pending Shifts",
                "Are you sure you want to register the newly selected time slots?",
                onSaveChanges,
                undefined,
                false
              )
            }
            // <-- 3. Disable if saving -->
            disabled={isSaving}
            title={isSaving ? "Saving..." : "Save pending shifts to the schedule"}
          >
            {/* <-- 4. Add loading indicator --> */}
            {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Save className="mr-2 h-4 w-4" /> // Added margin for consistency
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>
        )}

        {/* Clear Pending Changes */}
        {hasPendingChanges && (
           <Button
             variant="ghost"
             className="flex items-center gap-2 w-full sm:w-auto text-muted-foreground hover:text-foreground"
             onClick={() =>
               handleConfirm(
                 "Clear Pending Changes",
                 "Are you sure you want to discard all unsaved time slot selections?",
                 onClearPending,
                 undefined,
                 false
               )
             }
             // <-- 3. Disable if saving -->
             disabled={isSaving}
             title={isSaving ? "Saving..." : "Discard unsaved selections"}
           >
             <RotateCcw className="h-4 w-4" />
             <span>Clear Pending</span>
           </Button>
        )}


        {/* Include Weekend Toggle */}
        <Button
          variant={includeWeekend ? "secondary" : "outline"}
          className={cn(
            "flex items-center gap-2 w-full sm:w-auto sm:ml-auto",
            includeWeekend ? "bg-secondary" : "hover:bg-secondary/10 hover:text-secondary",
            calendarMode !== 'range' ? 'opacity-50 cursor-not-allowed' : '',
            // <-- 3. Disable if saving -->
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          )}
          onClick={() => !isSaving && calendarMode === 'range' && setIncludeWeekend(!includeWeekend)}
          // <-- 3. Disable if saving or conditions not met -->
          disabled={isSaving || calendarMode !== 'range'}
          title={isSaving ? "Saving..." : calendarMode !== 'range' ? "Only available in range mode" : (includeWeekend ? "Exclude weekends for default range" : "Include weekends for default range")}
        >
          {includeWeekend ? (
            <>
              <Check className="h-4 w-4 text-secondary-foreground" />
              <span>Incl. Weekends</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span>Excl. Weekends</span>
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
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
              variant={confirmAction.title.includes("Save") ? "success" : confirmAction.title.includes("Clear") ? "destructive" : "default"}
              onClick={() => {
                confirmAction.action();
                setConfirmDialogOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}