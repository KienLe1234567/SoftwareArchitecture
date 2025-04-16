//Ví dụ: trong @/types/patient.ts
export interface PatientAllergy {
    drugs?: string;
    drugsReaction?: string;
    environment?: string;
    environmentReaction?: string;
    adr?: string;
    adrReaction?: string;
  }
  
  export interface PatientMedical {
    chiefComplaint?: string;
    history?: string; // History of present illness
    past?: string;    // Past Medical History
    family?: string;  // Family History
  }
  
  export interface PatientSocial {
    tobacco?: string; // Yes/No
    tobaccoDetail?: string;
    alcohol?: string; // Yes/No
    alcoholDetail?: string;
    caffeine?: string; // Yes/No
    caffeineDetail?: string;
    drugs?: string; // Yes/No
    drugsList?: string;
  }
  
  export interface Patient {
    id: string; // ID duy nhất của bệnh nhân (có thể là UUID từ backend)
    name: string;
    age?: number; // Nên dùng number
    dob: string; // Định dạng YYYY-MM-DD
    gender: string; // 'Male', 'Female', 'Other'
    phone?: string;
    address?: string;
    email?: string; // Thêm email nếu có
    healthInsurance?: string;
    livingArrangement?: string;
    // Các thông tin chi tiết có thể fetch sau nếu cần
    allergies?: PatientAllergy;
    medical?: PatientMedical;
    social?: PatientSocial;
  }
  
  export interface Prescription {
    /** Tên thuốc */
    name: string;
    /** Liều lượng (ví dụ: "500mg", "1 tablet") */
    dosage: string;
    /** Tần suất/Cách dùng (ví dụ: "TID after meals", "Once daily at bedtime") */
    frequency: string;
  }
  
  /**
   * Định nghĩa cho một kết quả xét nghiệm (Lab Result).
   */
  export interface LabResult {
    /** Tên xét nghiệm (ví dụ: "Blood Pressure", "Glucose") */
    test: string;
    /** Kết quả xét nghiệm (ví dụ: "120/80 mmHg", "95 mg/dL") */
    result: string;
    /** Ghi chú thêm (tùy chọn) */
    notes?: string;
  }
  
  /**
   * Định nghĩa cho một báo cáo y tế/lần khám (Medical Report).
   */
  export interface MedicalReport {
    /** ID duy nhất của báo cáo */
    reportId: string;
    /** ID của bệnh nhân liên quan */
    patientId: string;
    /** Tên bệnh nhân (tùy chọn, có thể không cần nếu đã có ID) */
    patientName?: string;
    /** Tên bác sĩ thực hiện khám/tạo báo cáo */
    doctorName: string;
    /** Ngày tạo báo cáo (định dạng chuỗi, ví dụ: "YYYY-MM-DD") */
    date: string;
    /** Chẩn đoán chính */
    diagnosis: string;
    /** Danh sách các thuốc được kê (tùy chọn) */
    prescriptions?: Prescription[];
    /** Danh sách các kết quả xét nghiệm (tùy chọn) */
    labResults?: LabResult[];
    /** Ghi chú của bác sĩ (tùy chọn) */
    doctorNotes?: string;
  }
  
  // Type cho API trả về danh sách bệnh nhân (có thể chỉ chứa thông tin cơ bản)
  export interface PatientListItem extends Omit<Patient, 'allergies' | 'medical' | 'social'> {
    // Có thể thêm các trường tóm tắt khác nếu API trả về
  }

  // export interface Patient {
  //   id: string; 
  //   firstName: string;
  //   lastName: string; 
  //   phoneNumber: string;
  //   email: string; 
  //   dateOfBirth: string; 
  // }