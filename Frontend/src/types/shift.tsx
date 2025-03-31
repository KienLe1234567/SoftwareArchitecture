export interface Shift {
  id: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  status?: "scheduled" | "completed" | "canceled";
  description?: string;
  location?: string;
}

export interface ShiftDto {
  shifts: Shift[];
}
