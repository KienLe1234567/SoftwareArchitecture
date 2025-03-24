export interface Doctor {
    id: string;
    name: string;
    phone: string;
    email: string;
    workload: {
      [date: string]: string[]; // e.g., "2025-03-24": ["07:00", "07:30", "13:00"]
    };
  }