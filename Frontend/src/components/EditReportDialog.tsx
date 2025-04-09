// File: src/components/features/patients/EditReportDialog.tsx
// (Đảm bảo đường dẫn import types và utils là chính xác)

"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";
import { MedicalReport, Prescription, LabResult } from "@/types/patientfake"; // Import types

// --- Shadcn UI Components & Icons ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, PlusCircle, Trash2, Save, XCircle, Loader2, AlertCircle, Pencil } from "lucide-react";

// --- Mock API Functions (Thay thế bằng API thật) ---
// Giả sử các hàm này đã được định nghĩa ở đâu đó và được import
// import { fetchMedicalReportDetail, updateMedicalReport } from '@/lib/api/mocks';

// Hàm giả lập fetch chi tiết một report
const fetchMedicalReportDetail = async (reportId: string): Promise<MedicalReport | null> => {
    console.log(`API_MOCK: Fetching detail for report: ${reportId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    const mockReportsDb: MedicalReport[] = [ { reportId: "MR-001", patientId: "d3c15f68-7004-4198-253c-08dd73f93a34", patientName: "Minh Nguyen", diagnosis: "Migraine with aura - Updated slightly", date: "2025-03-25", doctorName: "Dr. John Smith", prescriptions: [{ name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "TID" }, { name: "Sumatriptan 50mg", dosage: "1 tablet", frequency: "PRN for attack"}], labResults: [{ test: "BP", result: "120/80 mmHg", notes: "Normal"}], doctorNotes: "Follow up in 1 month. Advised lifestyle changes. Patient feels better." }, { reportId: "MR-002", patientId: "d3c15f68-7004-4198-253c-08dd73f93a34", patientName: "Minh Nguyen", diagnosis: "Seasonal Allergy - Persistent", date: "2025-02-10", doctorName: "Dr. Alice Nguyen", prescriptions: [{ name: "Loratadine 10mg", dosage: "1 tablet", frequency: "OD" }], labResults: [], doctorNotes: "Avoid pollen. Prescribed antihistamine. Consider nasal spray if no improvement." }, { reportId: "MR-003", patientId: "a2559b6b-0ca9-4d88-90b8-9565386339c0", patientName: "Alice Tran", diagnosis: "Routine Checkup - All Clear", date: "2025-04-01", doctorName: "Dr. John Smith", prescriptions: [], labResults: [{ test: "Glucose", result: "90 mg/dL", notes:"Fasting"}, { test: "Cholesterol Panel", result: "LDL 110, HDL 55", notes: "Within limits"}], doctorNotes: "All normal. Recommend annual checkup. Discussed diet." } ];
    const report = mockReportsDb.find(r => r.reportId === reportId);
    if (!report) { console.error(`API_MOCK: Report not found: ${reportId}`); return null; }
    console.log("API_MOCK: Found report detail for edit:", report);
    return report;
};

// Hàm giả lập cập nhật report
const updateMedicalReport = async (reportData: MedicalReport): Promise<{ success: boolean; message?: string }> => {
    console.log(`API_MOCK: Updating report: ${reportData.reportId}`, reportData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("API_MOCK: Report updated successfully.");
    return { success: true };
};
//---------------------------------------------------


// --- Kiểu dữ liệu Form (Gần giống MedicalReport nhưng loại bỏ ID không sửa) ---
type ReportEditFormData = Omit<MedicalReport, 'reportId' | 'patientId' | 'patientName' | 'prescriptions' | 'labResults'> & {
    // Giữ lại các trường optional nếu cần hiển thị
    patientName?: string;
    // Đảm bảo prescriptions và labResults luôn là mảng trong state của form này
    prescriptions: Prescription[];
    labResults: LabResult[];
    doctorNotes: string; // Đảm bảo doctorNotes không bị undefined
};


// --- Props ---
interface EditReportDialogProps {
  reportId: string | null; // ID của report cần sửa
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUpdated: () => void; // Callback báo đã cập nhật thành công
}

export function EditReportDialog({ reportId, open, onOpenChange, onReportUpdated }: EditReportDialogProps) {

  // --- State ---
  const [reportData, setReportData] = useState<ReportEditFormData | null>(null); // Dữ liệu form, bắt đầu là null
  const [originalReport, setOriginalReport] = useState<MedicalReport | null>(null); // Lưu trữ report gốc để lấy patientId khi submit
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // Cho DatePicker
  const [isLoadingData, setIsLoadingData] = useState(false); // Loading khi fetch data ban đầu
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading khi submit form
  const [error, setError] = useState<string | null>(null); // Lỗi (fetch hoặc submit)

  // --- Effect để fetch dữ liệu report khi dialog mở và có reportId ---
  useEffect(() => {
    if (open && reportId) {
      const loadReportData = async () => {
        setIsLoadingData(true);
        setError(null);
        setReportData(null);
        setOriginalReport(null);
        console.log("EditReportDialog: Fetching data for reportId:", reportId);
        try {
          const fetchedReport = await fetchMedicalReportDetail(reportId); // Gọi API fetch detail
          if (fetchedReport) {
             setOriginalReport(fetchedReport); // Lưu lại report gốc

             // Chuẩn bị dữ liệu cho form state
             const formData: ReportEditFormData = {
                 patientName: fetchedReport.patientName, // Giữ tên để hiển thị (không sửa)
                 doctorName: fetchedReport.doctorName,
                 date: fetchedReport.date,
                 diagnosis: fetchedReport.diagnosis,
                 prescriptions: fetchedReport.prescriptions ?? [], // Đảm bảo là mảng
                 labResults: fetchedReport.labResults ?? [],       // Đảm bảo là mảng
                 doctorNotes: fetchedReport.doctorNotes ?? ""     // Đảm bảo là string
             };
            setReportData(formData);

            // Cập nhật DatePicker từ date string đã fetch
            if(fetchedReport.date) { try { setSelectedDate(parseISO(fetchedReport.date)); } catch { setSelectedDate(undefined);}}
            else { setSelectedDate(undefined); }

          } else {
            setError(`Could not find report with ID ${reportId}. Please close and try again.`);
          }
        } catch (err) {
          console.error("Failed to fetch report details:", err);
          setError(err instanceof Error ? err.message : "Failed to load report data.");
        } finally {
          setIsLoadingData(false);
        }
      };
      loadReportData();
    } else {
      // Reset state khi dialog đóng hoặc không có reportId
      if(!open) {
          setReportData(null);
          setOriginalReport(null);
          setSelectedDate(undefined);
          setError(null);
          setIsLoadingData(false);
          setIsSubmitting(false);
      }
    }
  }, [open, reportId]); // Chạy lại khi `open` hoặc `reportId` thay đổi

  // --- Handlers (Tương tự AddReportDialog, hoạt động trên state `reportData`) ---
   const handleChange = (field: keyof ReportEditFormData, value: string) => {
     setReportData((prev) => prev ? ({ ...prev, [field]: value }) : null);
      if (field === 'date' && reportData) {
          try { if(value) setSelectedDate(parseISO(value)); else setSelectedDate(undefined); }
          catch { setSelectedDate(undefined); }
      }
   };

   const handleDateChange = (date: Date | undefined) => {
     setSelectedDate(date);
     handleChange('date', date ? format(date, 'yyyy-MM-dd') : '');
   };

    const handlePrescriptionChange = (index: number, key: keyof Prescription, value: string) => {
     setReportData(prev => {
         if (!prev) return null;
         const updatedPrescriptions = prev.prescriptions.map((item, i) =>
                 i === index ? { ...item, [key]: value } : item
             );
         return { ...prev, prescriptions: updatedPrescriptions };
     });
   };

    const handleLabResultChange = (index: number, key: keyof LabResult, value: string) => {
      setReportData(prev => {
          if (!prev) return null;
          const updatedLabResults = prev.labResults.map((item, i) =>
                  i === index ? { ...item, [key]: value } : item
              );
          return { ...prev, labResults: updatedLabResults };
      });
  };

   // Add/Remove functions (hoạt động trên reportData)
   const addPrescription = () => setReportData(prev => prev ? ({ ...prev, prescriptions: [...prev.prescriptions, { name: "", dosage: "", frequency: "" }] }) : null);
   const removePrescription = (index: number) => setReportData(prev => prev ? ({ ...prev, prescriptions: prev.prescriptions.filter((_, i) => i !== index) }) : null);
   const addLabResult = () => setReportData(prev => prev ? ({ ...prev, labResults: [...prev.labResults, { test: "", result: "", notes: "" }] }) : null);
   const removeLabResult = (index: number) => setReportData(prev => prev ? ({ ...prev, labResults: prev.labResults.filter((_, i) => i !== index) }) : null);

   // --- Submit ---
   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Cần có reportId gốc và dữ liệu form hiện tại
    if (!reportData || !reportId || !originalReport) {
        setError("Cannot update report: Missing required data.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    // Tạo object đầy đủ để gửi đi API update
    const reportToUpdate: MedicalReport = {
      reportId: reportId, // ID gốc không đổi
      patientId: originalReport.patientId, // ID bệnh nhân gốc không đổi
      patientName: originalReport.patientName, // Tên bệnh nhân gốc không đổi (hoặc cập nhật nếu form cho phép)
      doctorName: reportData.doctorName,
      date: reportData.date,
      diagnosis: reportData.diagnosis,
      prescriptions: reportData.prescriptions,
      labResults: reportData.labResults,
      doctorNotes: reportData.doctorNotes,
    };

    console.log("Submitting Updated Report via Dialog:", reportToUpdate);

    try {
      // --- !!! TODO: Gọi API thật để CẬP NHẬT report ---
      const response = await updateMedicalReport(reportToUpdate);
       if (!response.success) {
           throw new Error(response.message || 'Failed to update report via API');
       }
      // await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập

      alert(`Medical report ${reportId} updated successfully (simulated)!`);
      onReportUpdated();    // Gọi callback báo cho component cha (MedicalHistoryDialog)
      onOpenChange(false);  // Đóng dialog edit

    } catch (err) {
      console.error("Failed to update report:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý đóng dialog
   const handleDialogClose = (isOpen: boolean) => {
       onOpenChange(isOpen);
        // Logic reset đã được xử lý trong useEffect
   }

  // --- Render ---
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
             <Pencil className="h-5 w-5"/> Edit Medical Report
          </DialogTitle>
          {/* Hiển thị thông tin hoặc trạng thái loading/error */}
           {isLoadingData && <DialogDescription>Loading report data...</DialogDescription>}
           {!isLoadingData && reportData && <DialogDescription>Editing report ID: <strong>{reportId}</strong> for {reportData.patientName || `Patient ID: ${originalReport?.patientId}`}</DialogDescription>}
           {!isLoadingData && error && <DialogDescription className="text-destructive">{error || "Error loading data."}</DialogDescription>}
           {!isLoadingData && !reportData && !error && <DialogDescription className="text-orange-600">Could not load report data to edit.</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6 pl-1">
           {/* Hiển thị Loading spinner khi fetch data ban đầu */}
           {isLoadingData && ( <div className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> )}
           {/* Hiển thị lỗi fetch ban đầu */}
           {!isLoadingData && error && ( <div className="text-destructive text-sm p-4 border border-destructive/20 rounded bg-destructive/5"><AlertCircle className="inline h-4 w-4 mr-1"/> {error}</div> )}

           {/* Chỉ render form khi có dữ liệu và không loading/error */}
           {!isLoadingData && reportData && !error && (
              <form onSubmit={handleSubmit} className="space-y-8 py-4">
                 {/* --- Report Information Section --- */}
                 <section className="space-y-4">
                     <h3 className="text-lg font-semibold border-b pb-2">Report Information</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"> <Label>Report ID</Label> <Input value={reportId || ""} readOnly className="bg-muted cursor-not-allowed" /> </div>
                        <div className="space-y-2"> <Label>Patient ID</Label> <Input value={originalReport?.patientId || ""} readOnly className="bg-muted cursor-not-allowed" /> </div>
                         {/* Date Picker */}
                        <div className="space-y-2">
                           <Label>Report Date</Label>
                           <Popover>
                               <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start font-normal",!selectedDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{selectedDate ? format(selectedDate, "PPP") : <span>Pick date</span>}</Button></PopoverTrigger>
                               <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} /></PopoverContent>
                           </Popover>
                        </div>
                        {/* Doctor Name */}
                         <div className="space-y-2">
                           <Label htmlFor="edit-report-doctorName">Doctor Name</Label>
                           <Input id="edit-report-doctorName" value={reportData.doctorName} onChange={(e) => handleChange("doctorName", e.target.value)} />
                        </div>
                     </div>
                 </section>

                 <Separator />
                 {/* --- Diagnosis Section --- */}
                 <section className="space-y-2">
                     <Label htmlFor="edit-report-diagnosis" className="text-lg font-semibold">Diagnosis</Label>
                     <Textarea id="edit-report-diagnosis" rows={3} value={reportData.diagnosis} onChange={(e) => handleChange("diagnosis", e.target.value)} required/>
                 </section>

                  <Separator />
                 {/* --- Prescriptions Section --- */}
                 <section className="space-y-4">
                    <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Prescriptions</h3><Button type="button" variant="outline" size="sm" onClick={addPrescription}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button></div>
                     {reportData.prescriptions.map((med, index) => (
                         <div key={`pres-edit-${index}`} className="border p-4 rounded-md relative space-y-3 bg-muted/30">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removePrescription(index)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="space-y-1.5"><Label htmlFor={`edit-medName-${index}`}>Medicine</Label><Input id={`edit-medName-${index}`} value={med.name} onChange={(e) => handlePrescriptionChange(index, "name", e.target.value)} /></div>
                                 <div className="space-y-1.5"><Label htmlFor={`edit-medDosage-${index}`}>Dosage</Label><Input id={`edit-medDosage-${index}`} value={med.dosage} onChange={(e) => handlePrescriptionChange(index, "dosage", e.target.value)} /></div>
                                 <div className="space-y-1.5"><Label htmlFor={`edit-medFreq-${index}`}>Frequency</Label><Input id={`edit-medFreq-${index}`} value={med.frequency} onChange={(e) => handlePrescriptionChange(index, "frequency", e.target.value)} /></div>
                             </div>
                         </div>
                     ))}
                     {reportData.prescriptions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">No prescriptions.</p>}
                 </section>

                <Separator />
                 {/* --- Lab Results Section --- */}
                 <section className="space-y-4">
                    <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Lab Results</h3><Button type="button" variant="outline" size="sm" onClick={addLabResult}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button></div>
                      {reportData.labResults.map((res, index) => (
                         <div key={`lab-edit-${index}`} className="border p-4 rounded-md relative space-y-3 bg-muted/30">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeLabResult(index)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5"><Label htmlFor={`edit-labTest-${index}`}>Test</Label><Input id={`edit-labTest-${index}`} value={res.test} onChange={(e) => handleLabResultChange(index, "test", e.target.value)} /></div>
                                <div className="space-y-1.5"><Label htmlFor={`edit-labResult-${index}`}>Result</Label><Input id={`edit-labResult-${index}`} value={res.result} onChange={(e) => handleLabResultChange(index, "result", e.target.value)} /></div>
                                <div className="space-y-1.5"><Label htmlFor={`edit-labNotes-${index}`}>Notes</Label><Input id={`edit-labNotes-${index}`} value={res.notes || ''} onChange={(e) => handleLabResultChange(index, "notes", e.target.value)} /></div>
                            </div>
                         </div>
                     ))}
                     {reportData.labResults.length === 0 && <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">No lab results.</p>}
                 </section>

                <Separator />
                 {/* --- Doctor's Notes Section --- */}
                <section className="space-y-2">
                  <Label htmlFor="edit-report-notes" className="text-lg font-semibold">Doctor's Notes</Label>
                  <Textarea id="edit-report-notes" rows={4} value={reportData.doctorNotes} onChange={(e) => handleChange("doctorNotes", e.target.value)} />
                </section>

                 {/* Submit Error Message */}
                 {error && !isLoadingData && ( <div className="text-destructive text-sm flex items-center gap-2 pt-4"><AlertCircle className="h-4 w-4"/> {error}</div> )}

                 {/* Footer Buttons */}
                <DialogFooter className="sm:justify-end pt-6 sticky bottom-0 bg-background pb-4">
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}><XCircle className="mr-2 h-4 w-4"/> Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting || isLoadingData}>
                        {isSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Save className="mr-2 h-4 w-4"/>)} Save Changes
                    </Button>
                </DialogFooter>
              </form>
           )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}