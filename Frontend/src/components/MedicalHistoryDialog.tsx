// src/components/features/patients/MedicalHistoryDialog.tsx (Đã cập nhật)

import { useState, useEffect, useCallback } from "react"; // Thêm useCallback
import { format, parseISO } from "date-fns";
import { Loader2, AlertCircle, FileText, Pencil, Trash2 } from "lucide-react"; // Đã có Pencil
import { PatientListItem, MedicalReport } from "@/types/patientfake";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// --- Import Components ---
import { MedicalReportDetailView } from "./MedicalReportDetailView";
import { EditReportDialog } from "./EditReportDialog"; // *** THÊM IMPORT EDIT DIALOG ***

// --- Mock API Function (Giữ nguyên hoặc import) ---
const fetchMedicalReportsForPatient = async (patientId: string): Promise<MedicalReport[]> => {
    console.log(`DIALOG: Fetching reports for patient: ${patientId}`);
    await new Promise(resolve => setTimeout(resolve, 700));
    const mockReportsDb: MedicalReport[] = [ { reportId: "MR-001", patientId: "d3c15f68-7004-4198-253c-08dd73f93a34", patientName: "Minh Nguyen", diagnosis: "Migraine with aura - Updated slightly", date: "2025-03-25", doctorName: "Dr. John Smith", prescriptions: [{ name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "TID" }, { name: "Sumatriptan 50mg", dosage: "1 tablet", frequency: "PRN for attack"}], labResults: [{ test: "BP", result: "120/80 mmHg", notes: "Normal"}], doctorNotes: "Follow up in 1 month. Advised lifestyle changes. Patient feels better." }, { reportId: "MR-002", patientId: "d3c15f68-7004-4198-253c-08dd73f93a34", patientName: "Minh Nguyen", diagnosis: "Seasonal Allergy - Persistent", date: "2025-02-10", doctorName: "Dr. Alice Nguyen", prescriptions: [{ name: "Loratadine 10mg", dosage: "1 tablet", frequency: "OD" }], labResults: [], doctorNotes: "Avoid pollen. Prescribed antihistamine. Consider nasal spray if no improvement." }, { reportId: "MR-003", patientId: "a2559b6b-0ca9-4d88-90b8-9565386339c0", patientName: "Alice Tran", diagnosis: "Routine Checkup - All Clear", date: "2025-04-01", doctorName: "Dr. John Smith", prescriptions: [], labResults: [{ test: "Glucose", result: "90 mg/dL", notes:"Fasting"}, { test: "Cholesterol Panel", result: "LDL 110, HDL 55", notes: "Within limits"}], doctorNotes: "All normal. Recommend annual checkup. Discussed diet." } ];
    return mockReportsDb.filter(r => r.patientId === patientId);
};
//---------------------------------------------------

interface MedicalHistoryDialogProps {
    patient: PatientListItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOpenAddReport: () => void;
    // Không cần props cho Edit/Delete nếu quản lý state trong component này
}

export function MedicalHistoryDialog({
    patient,
    open,
    onOpenChange,
    onOpenAddReport,
}: MedicalHistoryDialogProps) {

  // === State ===
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State Dialog chi tiết
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<MedicalReport | null>(null);

  // *** THÊM STATE CHO EDIT DIALOG ***
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // === Data Fetching ===
  // Dùng useCallback để loadHistory không thay đổi trừ khi patient thay đổi
  const loadHistory = useCallback(async () => {
    if (!patient) return;
    console.log("MedicalHistoryDialog: loadHistory called for patient:", patient.id)
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMedicalReportsForPatient(patient.id);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load medical history.");
    } finally {
      setIsLoading(false);
    }
  }, [patient]); // Chỉ phụ thuộc vào patient

  // Fetch khi dialog mở hoặc khi patient thay đổi
  useEffect(() => {
    if (open && patient) {
      loadHistory();
    } else if (!open) {
      // Reset tất cả state khi dialog chính đóng
      setReports([]);
      setError(null);
      setIsLoading(false);
      setIsDetailDialogOpen(false);
      setSelectedReportForDetail(null);
      setIsEditDialogOpen(false); // Đóng cả dialog edit
      setEditingReportId(null);
    }
  }, [open, patient, loadHistory]); // Thêm loadHistory vào dependencies

  // === Handlers ===
  // Mở dialog chi tiết
  const handleViewReportDetail = (report: MedicalReport) => {
    setSelectedReportForDetail(report);
    setIsDetailDialogOpen(true);
  };

  // *** HÀM MỞ DIALOG EDIT ***
  const handleOpenEditDialog = (reportId: string) => {
    console.log("Opening Edit dialog for report:", reportId);
    setEditingReportId(reportId);
    setIsEditDialogOpen(true);
    // Giữ dialog history mở ở nền
  };

   // *** HÀM GỌI LẠI KHI EDIT THÀNH CÔNG ***
   const handleReportUpdated = () => {
      console.log("Report updated, refreshing history list...");
      setIsEditDialogOpen(false); // Đóng dialog edit
      setEditingReportId(null);   // Xóa ID đang edit
      loadHistory();              // Tải lại danh sách report
   };

  // Xử lý đóng Dialog chính (Đảm bảo đóng cả các dialog con)
  const handleClosePrimaryDialog = (isOpen: boolean) => {
      onOpenChange(isOpen);
      if (!isOpen) {
          setIsDetailDialogOpen(false);
          setSelectedReportForDetail(null);
          setIsEditDialogOpen(false);
          setEditingReportId(null);
      }
  };

  return (
    // Sử dụng Fragment vì có nhiều Dialog cùng cấp
    <>
      {/* === Dialog chính (Lịch sử khám) === */}
      <Dialog open={open} onOpenChange={handleClosePrimaryDialog}>
        <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
             <DialogTitle>Medical History</DialogTitle>
              {isLoading && <DialogDescription>Loading reports...</DialogDescription>}
              {patient && !isLoading && <DialogDescription>Reports for {patient.name}.</DialogDescription>}
              {error && <DialogDescription className="text-destructive">Error loading reports</DialogDescription>}
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] pr-2 py-4">
            {isLoading && ( <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> )}
            {error && !isLoading && ( <div className="text-destructive text-sm p-4 border border-destructive/20 rounded bg-destructive/5"><AlertCircle className="inline h-4 w-4 mr-1"/> {error}</div> )}
            {!isLoading && !error && (
              <>
                {reports.length === 0 ? ( <p className="text-center text-muted-foreground py-10">No reports found.</p> ) : (
                  <Table>
                    <TableHeader> <TableRow> <TableHead>Report ID</TableHead><TableHead>Date</TableHead><TableHead>Diagnosis</TableHead><TableHead>Doctor</TableHead><TableHead className="text-right w-[180px]">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.reportId}>
                            <TableCell>{report.reportId}</TableCell>
                            <TableCell>{report.date ? format(new Date(report.date), "dd/MM/yyyy") : 'N/A'}</TableCell>
                            <TableCell>{report.diagnosis}</TableCell>
                            <TableCell>{report.doctorName}</TableCell>
                          <TableCell className="text-right space-x-1">
                            {/* Nút mở Dialog chi tiết */}
                            <Button variant="outline" size="sm" onClick={() => handleViewReportDetail(report)}> <FileText className="mr-1 h-4 w-4" /> Detail </Button>
                            {/* *** NÚT MỞ DIALOG EDIT *** */}
                            {/* <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(report.reportId)}> <Pencil className="mr-1 h-4 w-4"/> Edit </Button> */}
                             {/* Optional: Nút Delete */}
                             {/* <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"> <Trash2 className="h-4 w-4"/> </Button> */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </ScrollArea>

           <DialogFooter className="sm:justify-end pt-4 border-t">
                <DialogClose asChild><Button type="button" variant="secondary">Close History</Button></DialogClose>
                {patient && ( <Button type="button" variant="default" onClick={onOpenAddReport}>Add New Report</Button> )}
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Dialog chi tiết report (giữ nguyên) === */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
           {/* Tăng kích thước DialogContent */}
           <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl w-[90vw]"> {/* Rộng hơn */}
               <DialogHeader>
                   <DialogTitle>Medical Report Detail</DialogTitle>
                   {selectedReportForDetail && <DialogDescription>Report ID: {selectedReportForDetail.reportId} | Date: {selectedReportForDetail.date ? format(parseISO(selectedReportForDetail.date), 'PPP') : 'N/A'}</DialogDescription>}
               </DialogHeader>

               {/* Tăng chiều cao ScrollArea */}
               <ScrollArea className="max-h-[70vh] pr-4 pl-1 my-4">
                   {/* Render component view chi tiết */}
                   <MedicalReportDetailView report={selectedReportForDetail} />
               </ScrollArea>

               <DialogFooter className="sm:justify-end pt-4 border-t">
                   {/* *** Kích hoạt nút Edit This Report *** */}
                   {selectedReportForDetail && (
                       <Button
                           variant="default" // Hoặc variant khác nếu muốn
                           onClick={() => {
                               // 1. Đóng dialog chi tiết hiện tại
                               setIsDetailDialogOpen(false);
                               // 2. Gọi hàm mở dialog edit (hàm này đã được định nghĩa trong MedicalHistoryDialog)
                               handleOpenEditDialog(selectedReportForDetail.reportId);
                           }}
                       >
                           <Pencil className="mr-2 h-4 w-4"/> Edit This Report
                       </Button>
                   )}
                   {/* Nút Close Detail */}
                   <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close Detail</Button>
               </DialogFooter>
           </DialogContent>
       </Dialog>

       {/* === RENDER DIALOG EDIT REPORT === */}
       <EditReportDialog
            reportId={editingReportId}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onReportUpdated={handleReportUpdated} // Truyền callback xử lý sau khi update
        />
    </> // Kết thúc Fragment
  );
}