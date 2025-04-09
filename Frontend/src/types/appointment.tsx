export interface Appointment {
    appointmentId: string;
    slotId: string;
    startTime: string; // ISO datetime string
    endTime: string;   // ISO datetime string
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | string;
    patientId: string;
    patientName: string;
    patientPhoneNumber: string;
    patientEmail: string;
  }