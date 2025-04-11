export interface Appointment {
  appointmentId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string
}