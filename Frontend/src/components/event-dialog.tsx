"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react";
import { format, isBefore, isEqual } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { CalendarEvent, EventColor } from "../types/types";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("Staff Shift");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState<EventColor>("sky");
  const [error, setError] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [shiftDuration, setShiftDuration] = useState<"8" | "12" | "custom">(
    "custom"
  );

  // Use a ref to track the last calculated values to prevent infinite loops
  const lastCalculation = useRef({
    startTime: "",
    startDate: new Date(),
    shiftDuration: "custom" as "8" | "12" | "custom",
  });

  // Debug log to check what event is being passed
  useEffect(() => {
    console.log("EventDialog received event:", event);
  }, [event]);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "Staff Shift");
      setDescription(event.description || "");

      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start);
      setEndDate(end);
      setStartTime(formatTimeForInput(start));
      setEndTime(formatTimeForInput(end));
      setAllDay(event.allDay || false);
      setLocation(event.location || "");
      setColor((event.color as EventColor) || "sky");
      setShiftDuration("custom"); // Reset to custom when editing an event
      setError(null); // Reset error when opening dialog

      // Update the ref with initial values
      lastCalculation.current = {
        startTime: formatTimeForInput(start),
        startDate: new Date(start),
        shiftDuration: "custom",
      };
    } else {
      resetForm();
    }
  }, [event]);

  // Effect to update end time based on shift duration
  useEffect(() => {
    // Skip if all day event or custom duration
    if (allDay || shiftDuration === "custom") {
      lastCalculation.current = {
        startTime,
        startDate,
        shiftDuration,
      };
    }

    // Check if we've already calculated for these exact values to prevent infinite loops
    if (
      lastCalculation.current.startTime === startTime &&
      isEqual(lastCalculation.current.startDate, startDate) &&
      lastCalculation.current.shiftDuration === shiftDuration
    ) {
      return;
    }

    // Update our ref with current values
    lastCalculation.current = {
      startTime,
      startDate: new Date(startDate),
      shiftDuration,
    };

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const durationHours = Number.parseInt(shiftDuration);

    // Calculate new end time
    let endHours = startHours + durationHours;
    const endMinutes = startMinutes;

    // Create a new end date (initially same as start date)
    const newEndDate = new Date(startDate);

    // If end time crosses to next day, increment the end date
    if (endHours >= 24) {
      endHours = endHours - 24;
      newEndDate.setDate(newEndDate.getDate() + 1);
      setEndDate(newEndDate);
    } else {
      // Always set end date to match start date for same-day shifts
      setEndDate(newEndDate);
    }

    // Format the new end time
    const formattedEndHours = endHours.toString().padStart(2, "0");
    const formattedEndMinutes = endMinutes.toString().padStart(2, "0");
    setEndTime(`${formattedEndHours}:${formattedEndMinutes}`);
  }, [shiftDuration, startTime, startDate, allDay]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    const now = new Date();
    setStartDate(now);
    setEndDate(now);
    setStartTime("09:00");
    setEndTime("10:00");
    setAllDay(false);
    setLocation("");
    setColor("sky");
    setShiftDuration("custom");
    setError(null);

    // Reset the ref as well
    lastCalculation.current = {
      startTime: "09:00",
      startDate: new Date(now),
      shiftDuration: "custom",
    };
  };

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = Math.floor(date.getMinutes() / 15) * 15;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Memoize time options so they're only calculated once
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        const value = `${formattedHour}:${formattedMinute}`;
        // Use a fixed date to avoid unnecessary date object creations
        const date = new Date(2000, 0, 1, hour, minute);
        const label = format(date, "h:mm a");
        options.push({ value, label });
      }
    }
    return options;
  }, []); // Empty dependency array ensures this only runs once

  const handleSave = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!allDay) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("End date cannot be before start date");
      return;
    }

    // Use generic title if empty
    const eventTitle = title.trim() ? title : "(no title)";

    onSave({
      id: event?.id || "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color,
    });
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Shift" : "Create Shift"}</DialogTitle>
          <DialogDescription className="sr-only">
            {event?.id
              ? "Edit the details of this shift"
              : "Add a new shift to your staff's calendar."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid gap-4 py-4">
          <div className="*:not-first:mt-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value="Staff Shift" disabled />
          </div>

          <div className="*:not-first:mt-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <div className="*:not-first:mt-1.5 flex-1">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="shrink-0 text-muted-foreground/80"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        // If end date is before the new start date, update it to match the start date
                        if (isBefore(endDate, date)) {
                          setEndDate(date);
                        }
                        setError(null);
                        setStartDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <div className="*:not-first:mt-1.5 min-w-28">
                <Label htmlFor="start-time">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="*:not-first:mt-1.5">
            <Label>Shift Duration</Label>
            <RadioGroup
              value={shiftDuration}
              onValueChange={(value) =>
                setShiftDuration(value as "8" | "12" | "custom")
              }
              className="mt-1.5 flex space-x-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="8" id="shift-8" />
                <Label htmlFor="shift-8" className="font-normal">
                  8 hours
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="12" id="shift-12" />
                <Label htmlFor="shift-12" className="font-normal">
                  12 hours
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="shift-custom" />
                <Label htmlFor="shift-custom" className="font-normal">
                  Custom
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4">
            <div className="*:not-first:mt-1.5 flex-1">
              <Label htmlFor="end-date">End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="shrink-0 text-muted-foreground/80"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    defaultMonth={endDate}
                    disabled={{ before: startDate }}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        // When manually selecting an end date, switch to custom duration
                        setShiftDuration("custom");
                        setError(null);
                        setEndDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <div className="*:not-first:mt-1.5 min-w-28">
                <Label htmlFor="end-time">End Time</Label>
                <Select
                  value={endTime}
                  onValueChange={(value) => {
                    setEndTime(value);
                    setShiftDuration("custom");
                  }}
                  disabled={shiftDuration !== "custom"}
                >
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="*:not-first:mt-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              aria-label="Delete shift"
            >
              <RiDeleteBinLine size={16} aria-hidden="true" />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
