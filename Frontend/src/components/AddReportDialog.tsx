// File: src/components/features/patients/AddReportDialog.tsx
// (Đảm bảo đường dẫn import types và utils là chính xác)

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils"; // Import hàm tiện ích classnames
import { MedicalReport, Prescription, LabResult, PatientListItem } from "@/types/patientfake"; // Import types (kiểm tra lại đường dẫn)

// --- Shadcn UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Lucide Icons ---
import { CalendarIcon, PlusCircle, Trash2, Save, XCircle, Loader2, AlertCircle } from "lucide-react";

// --- Kiểu dữ liệu cho Form State (Đảm bảo prescriptions & labResults là mảng) ---
type ReportFormData = Omit<MedicalReport, 'reportId' | 'patientName' | 'prescriptions' | 'labResults'> & {
    patientName?: string;
    prescriptions: Prescription[]; // Luôn là mảng
    labResults: LabResult[];      // Luôn là mảng
};

// --- Props của Component ---
interface AddReportDialogProps {
  patient: PatientListItem | null; // Bệnh nhân cần thêm report cho
  open: boolean;                   // State điều khiển mở/đóng từ component cha
  onOpenChange: (open: boolean) => void; // Hàm callback để component cha cập nhật state `open`
  onReportAdded: () => void;       // Callback để báo cho cha fetch lại data sau khi thêm thành công
}

export function AddReportDialog({ patient, open, onOpenChange, onReportAdded }: AddReportDialogProps) {
  const router = useRouter();

  // === State ===
  const [report, setReport] = useState<ReportFormData>({
    patientId: "",
    doctorName: "Dr. Auto Fill", // TODO: Lấy tên bác sĩ hiện tại đang đăng nhập
    date: format(new Date(), 'yyyy-MM-dd'),
    diagnosis: "",
    prescriptions: [{ name: "", dosage: "", frequency: "" }], // Khởi tạo với 1 mục trống
    labResults: [{ test: "", result: "", notes: "" }],       // Khởi tạo với 1 mục trống
    doctorNotes: ""
  });
  // State riêng cho DatePicker UI
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  // State cho quá trình submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === Effects ===
  // Effect để cập nhật patientId và reset form khi prop `patient` thay đổi (khi dialog được mở cho patient)
  useEffect(() => {
    if (open && patient) { // Chỉ chạy khi dialog mở và có thông tin patient
      console.log("AddReportDialog: Patient prop changed or dialog opened, resetting form for patient:", patient.id);
      setReport(prev => ({
        // Reset hoàn toàn để tránh lẫn dữ liệu cũ
        patientId: patient.id,
        doctorName: prev.doctorName || "Dr. Auto Fill", // Giữ lại tên bác sĩ nếu đã có, hoặc TODO lấy tên thật
        date: format(new Date(), 'yyyy-MM-dd'),
        diagnosis: "",
        prescriptions: [{ name: "", dosage: "", frequency: "" }],
        labResults: [{ test: "", result: "", notes: "" }],
        doctorNotes: ""
      }));
      setSelectedDate(new Date()); // Reset date picker về ngày hiện tại
      setError(null); // Xóa lỗi cũ
      setIsSubmitting(false); // Đảm bảo trạng thái submit được reset
    }
  }, [patient, open]); // Phụ thuộc vào patient và trạng thái open

  // Effect đồng bộ DatePicker UI (selectedDate) và state form (report.date string)
   useEffect(() => {
    if (report.date) { // Nếu có giá trị date trong state form
      try {
        // Cố gắng parse chuỗi YYYY-MM-DD thành đối tượng Date
        const parsedDate = parseISO(report.date);
        // Chỉ cập nhật state của DatePicker nếu parse thành công
        if (!isNaN(parsedDate.getTime())) {
             setSelectedDate(parsedDate);
        } else {
            // Nếu parse lỗi (ví dụ: string rỗng), đặt DatePicker về ngày hiện tại (hoặc undefined)
            setSelectedDate(new Date());
            console.warn("Could not parse report.date, defaulting DatePicker");
        }
      } catch (e) {
          // Nếu có lỗi khác trong quá trình parse
          setSelectedDate(new Date());
          console.error("Error parsing report date for DatePicker:", e);
      }
    } else {
        // Nếu report.date là rỗng, đặt DatePicker về ngày hiện tại (hoặc undefined)
        setSelectedDate(new Date());
    }
  }, [report.date]); // Chạy lại khi report.date thay đổi


  // === Handlers ===
  // Cập nhật các trường chính của report state
  const handleChange = (field: keyof Omit<ReportFormData, 'prescriptions' | 'labResults'>, value: string) => {
    setReport((prev) => ({ ...prev, [field]: value }));
  };

  // Cập nhật state khi chọn ngày từ DatePicker
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date); // Cập nhật state của DatePicker
    // Cập nhật state `report.date` dưới dạng chuỗi 'yyyy-MM-dd'
    handleChange('date', date ? format(date, 'yyyy-MM-dd') : '');
  };

  // Handler cho các thay đổi trong mảng Prescriptions
  const handlePrescriptionChange = (index: number, key: keyof Prescription, value: string) => {
    setReport(prev => ({
        ...prev,
        prescriptions: prev.prescriptions.map((item, i) =>
            i === index ? { ...item, [key]: value } : item
        )
    }));
  };

  // Handler cho các thay đổi trong mảng Lab Results
  const handleLabResultChange = (index: number, key: keyof LabResult, value: string) => {
     setReport(prev => ({
         ...prev,
         labResults: prev.labResults.map((item, i) =>
             i === index ? { ...item, [key]: value } : item
         )
     }));
 };

  // Thêm một mục prescription trống
  const addPrescription = () => setReport(prev => ({ ...prev, prescriptions: [...prev.prescriptions, { name: "", dosage: "", frequency: "" }] }));
  // Xóa một mục prescription theo index
  const removePrescription = (index: number) => setReport(prev => ({ ...prev, prescriptions: prev.prescriptions.filter((_, i) => i !== index) }));
  // Thêm một mục lab result trống
  const addLabResult = () => setReport(prev => ({ ...prev, labResults: [...prev.labResults, { test: "", result: "", notes: "" }] }));
  // Xóa một mục lab result theo index
  const removeLabResult = (index: number) => setReport(prev => ({ ...prev, labResults: prev.labResults.filter((_, i) => i !== index) }));

  // === Submit Form ===
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Ngăn trình duyệt submit form theo cách mặc định
    if (!patient) {
        setError("Cannot submit report: No patient selected.");
        return;
    }
    // Optional: Thêm validation ở đây trước khi submit
    // if (!report.diagnosis) { setError("Diagnosis is required."); return; }

    setIsSubmitting(true);
    setError(null);
    console.log("Submitting Report via Dialog:", report);

    try {
      // --- !!! TODO: Thay thế bằng lệnh gọi API thật để lưu report ---
      // const response = await yourApi.addMedicalReport(report);
      // if (!response.success) throw new Error(response.message || "API Error");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập đợi API

      console.log(`Medical report for ${patient.name} added successfully (simulated)!`);
      alert(`Medical report for ${patient.name} added successfully (simulated)!`); // Thông báo tạm thời
      onReportAdded();    // Gọi callback báo cho component cha đã thêm thành công
      onOpenChange(false); // Đóng dialog

    } catch (err) {
      console.error("Failed to submit report:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while submitting.");
      // Không đóng dialog khi lỗi để người dùng có thể sửa
    } finally {
      setIsSubmitting(false); // Luôn tắt trạng thái loading
    }
  };

  // === Xử lý đóng Dialog ===
  // Hàm này được gọi khi nhấn nút X, click bên ngoài, hoặc nhấn Esc
  const handleDialogClose = (isOpen: boolean) => {
      onOpenChange(isOpen); // Thông báo cho component cha
      if (!isOpen) {
          // Reset các trạng thái tạm thời khi dialog đóng
          setError(null);
          setIsSubmitting(false);
          // Quyết định xem có muốn reset toàn bộ form fields không.
          // Thông thường với dialog "Add", không cần reset vì effect [patient, open] sẽ làm việc đó.
          console.log("AddReportDialog closed");
      }
  }

  // === Render Component ===
  return (
    // Truyền props `open` và hàm `handleDialogClose` (đã đổi tên từ onOpenChange) vào Dialog
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Medical Report</DialogTitle>
          {/* Hiển thị tên bệnh nhân nếu có */}
          {patient && <DialogDescription>For patient: <strong>{patient.name}</strong> (ID: {patient.id})</DialogDescription>}
          {!patient && <DialogDescription className="text-orange-600">Warning: No patient selected.</DialogDescription>}
        </DialogHeader>

        {/* Form với ScrollArea */}
        <ScrollArea className="max-h-[70vh] pr-6 pl-1"> {/* Thêm padding/margin nếu cần */}
            <form onSubmit={handleSubmit} className="space-y-8 py-4 ">
                {/* --- Report Information Section --- */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Report Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient ID */}
                    <div className="space-y-2">
                      <Label htmlFor="add-report-patientId">Patient ID</Label>
                      <Input id="add-report-patientId" value={report.patientId} readOnly className="bg-muted cursor-not-allowed" />
                    </div>
                    {/* Report Date */}
                    <div className="space-y-2">
                      <Label>Report Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus disabled={(date) => date > new Date()} />
                          </PopoverContent>
                        </Popover>
                    </div>
                    {/* Doctor Name */}
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="add-report-doctorName">Doctor Name</Label>
                        <Input id="add-report-doctorName" value={report.doctorName} onChange={(e) => handleChange("doctorName", e.target.value)} placeholder="Enter attending doctor's name" />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* --- Diagnosis Section --- */}
                <section className="space-y-2">
                    <Label htmlFor="add-report-diagnosis" className="text-lg font-semibold">Diagnosis</Label>
                    <Textarea id="add-report-diagnosis" placeholder="Enter the primary diagnosis..." rows={3} value={report.diagnosis} onChange={(e) => handleChange("diagnosis", e.target.value)} required/>
                </section>

                <Separator />

                {/* --- Prescriptions Section --- */}
                 <section className="space-y-4">
                     <div className="flex justify-between items-center">
                         <h3 className="text-lg font-semibold">Prescriptions</h3>
                         <Button type="button" variant="outline" size="sm" onClick={addPrescription}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                     </div>
                     {report.prescriptions.map((med, index) => (
                         <div key={`pres-${index}`} className="border p-4 rounded-md relative space-y-3 bg-muted/30">
                              {/* Nút xóa chỉ hiển thị nếu còn nhiều hơn 0 mục, hoặc luôn hiển thị */}
                              {/* {report.prescriptions.length > 1 && ( */}
                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removePrescription(index)} aria-label="Remove prescription"><Trash2 className="h-4 w-4" /></Button>
                              {/* )} */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="space-y-1.5">
                                     <Label htmlFor={`medName-${index}`}>Medicine</Label>
                                     <Input id={`medName-${index}`} value={med.name} placeholder="e.g., Paracetamol 500mg" onChange={(e) => handlePrescriptionChange(index, "name", e.target.value)} />
                                 </div>
                                 <div className="space-y-1.5">
                                    <Label htmlFor={`medDosage-${index}`}>Dosage</Label>
                                    <Input id={`medDosage-${index}`} value={med.dosage} placeholder="e.g., 1 tablet" onChange={(e) => handlePrescriptionChange(index, "dosage", e.target.value)} />
                                 </div>
                                 <div className="space-y-1.5">
                                    <Label htmlFor={`medFreq-${index}`}>Frequency</Label>
                                    <Input id={`medFreq-${index}`} value={med.frequency} placeholder="e.g., TID" onChange={(e) => handlePrescriptionChange(index, "frequency", e.target.value)} />
                                 </div>
                              </div>
                         </div>
                     ))}
                      {report.prescriptions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">No prescriptions added.</p>}
                 </section>

                <Separator />

                 {/* === Lab Results Section === */}
                <section className="space-y-4">
                     <div className="flex justify-between items-center">
                         <h3 className="text-lg font-semibold">Lab Results</h3>
                         <Button type="button" variant="outline" size="sm" onClick={addLabResult}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                     </div>
                      {report.labResults.map((res, index) => (
                         <div key={`lab-${index}`} className="border p-4 rounded-md relative space-y-3 bg-muted/30">
                             {/* {report.labResults.length > 1 && ( */}
                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeLabResult(index)} aria-label="Remove lab result"><Trash2 className="h-4 w-4" /></Button>
                             {/* )} */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor={`labTest-${index}`}>Test</Label>
                                    <Input id={`labTest-${index}`} value={res.test} placeholder="e.g., Blood Pressure" onChange={(e) => handleLabResultChange(index, "test", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`labResult-${index}`}>Result</Label>
                                    <Input id={`labResult-${index}`} value={res.result} placeholder="e.g., 120/80 mmHg" onChange={(e) => handleLabResultChange(index, "result", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`labNotes-${index}`}>Notes</Label>
                                    <Input id={`labNotes-${index}`} value={res.notes || ''} placeholder="e.g., Normal" onChange={(e) => handleLabResultChange(index, "notes", e.target.value)} />
                                </div>
                            </div>
                         </div>
                     ))}
                     {report.labResults.length === 0 && <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">No lab results added.</p>}
                </section>

                <Separator />

                {/* === Doctor's Notes Section === */}
                <section className="space-y-2">
                  <Label htmlFor="add-report-notes" className="text-lg font-semibold">Doctor's Notes</Label>
                  <Textarea id="add-report-notes" placeholder="Enter additional notes or follow-up instructions..." rows={4} value={report.doctorNotes} onChange={(e) => handleChange("doctorNotes", e.target.value)} />
                </section>

                {/* Error Message Display */}
                {error && (
                     <div className="text-destructive text-sm p-3 border border-destructive/20 rounded bg-destructive/5 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                     </div>
                 )}

                {/* Submit Buttons trong DialogFooter */}
                 <DialogFooter className="sm:justify-end pt-6 sticky bottom-0 bg-background pb-4"> {/* Sticky footer */}
                     <DialogClose asChild>
                         <Button type="button" variant="outline" disabled={isSubmitting}> <XCircle className="mr-2 h-4 w-4"/> Cancel</Button>
                     </DialogClose>
                     <Button type="submit" disabled={isSubmitting || !patient}> {/* Disable nếu đang submit hoặc không có patient */}
                         {isSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Save className="mr-2 h-4 w-4"/>)} Submit Report
                     </Button>
                 </DialogFooter>
            </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}