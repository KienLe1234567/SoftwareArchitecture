"use client";

import { useEffect, useState } from "react";

import {
  deleteShift,
  getStaffShifts,
  registerShifts,
  updateShift,
} from "@/lib/staff";
import { formatToApiIsoString, getRandomEventColor } from "@/lib/utils";
import { Shift } from "@/types/shift";

import { CalendarEvent } from "../types/types";
import { EventCalendar } from "./event-calendar";

export default function StaffShiftCalendar({
  staffId, // Example shift ID
}: {
  staffId: string;
}) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const status = await registerShifts(
        staffId,
        formatToApiIsoString(event.start),
        formatToApiIsoString(event.end),
        event.description,
        event.location
      );
      setEvents([...events, event]);
    } catch (error) {
      console.error("Error registering shift:", error);
      return;
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      const shift: Shift = {
        id: updatedEvent.id,
        staffId: staffId,
        startTime: new Date(formatToApiIsoString(updatedEvent.start)),
        endTime: new Date(formatToApiIsoString(updatedEvent.end)),
        description: updatedEvent.description,
        location: updatedEvent.location,
      };
      const status = await updateShift(shift);
      setEvents(
        events.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error("Error updating shift:", error);
      return;
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteShift(staffId, eventId);
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting shift:", error);
      return;
    }
  };

  useEffect(() => {
    const fetchStaffShifts = async () => {
      try {
        const shifts = await getStaffShifts(staffId); // Replace with actual staff ID
        const formattedShifts: CalendarEvent[] = shifts.shifts.map((shift) => {
          return {
            id: shift.id,
            title: "Staff Shift",
            start: new Date(shift.startTime),
            end: new Date(shift.endTime),
            allDay: false,
            color: getRandomEventColor(),
            location: shift.location || "Not set",
            description: shift.description,
          };
        });
        setEvents(formattedShifts);
      } catch (error) {
        console.error("Error fetching staff shifts:", error);
      }
    };

    fetchStaffShifts();
  }, [staffId]);

  return (
    <EventCalendar
      events={events}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="week"
    />
  );
}
