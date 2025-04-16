// File: app/doctor/my-patients/page.tsx (Cập nhật Parent)

"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, AlertCircle, Plus } from "lucide-react";
import { useDebouncedCallback } from 'use-debounce';

// --- API Functions ---
const fetchPatientsList = async (name?: string): Promise<PatientListItem[]> => { /* ... như cũ ... */
    console.log(`PARENT: Fetching patients with name: ${name}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockPatients = [{ id: "d3c15f68-7004-4198-253c-08dd73f93a34", name: "Minh Nguyen", dob: "2003-01-01", gender: "Male", phone: "0901234567", address: "123 To Hien Thanh Str, Ward 1, District 1", }, { id: "a2559b6b-0ca9-4d88-90b8-9565386339c0", name: "Alice Tran", dob: "2005-12-01", gender: "Female", phone: "0907654321", address: "456 Tran Hung Dao Str, Ward 5, District 10", }];
    if (!name) return mockPatients;
    return mockPatients.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
};

// --- Types ---
import { PatientListItem } from "@/types/patientfake";

// --- Child Components ---
import { PatientSearchBar } from "@/components/PatientSearchBar";
import { PatientTable } from "@/components/PatientTable";
import { PatientInfoDialog } from "@/components/PatientInfoDialog";
import { MedicalHistoryDialog } from "@/components/MedicalHistoryDialog";
import { AddPatientDialog } from "@/components/AddPatientDialog"; // *** THÊM IMPORT ***
import { AddReportDialog } from "@/components/AddReportDialog";   // *** THÊM IMPORT ***
// import { EditPatientDialog } from "@/components/EditPatientDialog"; // Sẽ thêm sau
// import { EditReportDialog } from "@/components/EditReportDialog";   // Sẽ thêm sau

// --- Shadcn UI ---
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Thêm Button cho FAB

// --- Parent Component Implementation ---
export default function MyPatientsPage() {
  // === State ===
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Dialog Info
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [selectedPatientIdForInfo, setSelectedPatientIdForInfo] = useState<string | null>(null);

  // State Dialog History
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<PatientListItem | null>(null);

  // *** THÊM STATE CHO DIALOG MỚI ***
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [isAddReportDialogOpen, setIsAddReportDialogOpen] = useState(false);
  // State cho Edit sẽ thêm sau nếu cần
  // const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false);
  // const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  // const [isEditReportDialogOpen, setIsEditReportDialogOpen] = useState(false);
  // const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // === Data Fetching ===
  const fetchPatients = useCallback(async (name?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPatientsList(name);
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients.");
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchPatients = useDebouncedCallback(fetchPatients, 500);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // === Event Handlers ===
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    debouncedFetchPatients(term);
  };
  const handleClearSearch = () => { setSearchTerm(""); fetchPatients(); };

  // Mở Dialog Info
  const handleViewInfo = (patientId: string) => {
    setSelectedPatientIdForInfo(patientId);
    setIsInfoDialogOpen(true);
  };

  // Mở Dialog History
  const handleViewHistory = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatientForHistory(patient ?? { id: patientId, name: `Patient ${patientId}`, dob: '', gender: '' });
    setIsHistoryDialogOpen(true);
  };

  // *** THÊM HANDLERS CHO DIALOG MỚI ***

  // Mở Dialog Add Patient (từ nút FAB)
  const handleOpenAddPatientDialog = () => {
      setIsAddPatientDialogOpen(true);
  };

  // Callback sau khi thêm Patient thành công
  const handlePatientAdded = () => {
      fetchPatients(); // Fetch lại danh sách chính
      // Có thể thêm thông báo thành công ở đây nếu muốn
  };

   // Mở Dialog Add Report (từ nút trong MedicalHistoryDialog -> cần truyền hàm này xuống)
   // Tạm thời gọi trực tiếp ở đây, sau này sẽ tích hợp vào MedicalHistoryDialog
   const handleOpenAddReportDialog = (patient: PatientListItem | null) => {
       if(patient){
           setSelectedPatientForHistory(patient); // Đảm bảo có thông tin patient cho dialog add report
           setIsHistoryDialogOpen(false); // Đóng dialog history nếu đang mở
           setIsAddReportDialogOpen(true); // Mở dialog add report
       } else {
           console.error("Cannot add report without selected patient")
           // Hiển thị lỗi cho người dùng nếu cần
       }
   };

    // Callback sau khi thêm Report thành công
    const handleReportAdded = () => {
      // Sau khi thêm report, người dùng có thể muốn xem lại History
      // Option 1: Không làm gì cả, dialog history sẽ tự fetch lại khi mở lần sau
      // Option 2: Mở lại dialog history cho bệnh nhân đó (nếu cần)
      // if (selectedPatientForHistory) {
      //     setIsHistoryDialogOpen(true); // Mở lại dialog history
      // }
      console.log("Report added, user needs to reopen history dialog to refresh.");
    };

  // === Render ===
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Patient Manager</h1>
        <div className="flex items-center space-x-2 rounded-lg border bg-background px-3 py-1.5 text-sm shadow-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold whitespace-nowrap">{format(new Date(), "PPP")}</span>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardHeader><CardTitle>Find Patients</CardTitle></CardHeader>
        <CardContent>
          <PatientSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} onClearSearch={handleClearSearch} isLoading={isLoading}/>
        </CardContent>
      </Card>

      {/* Loading / Error */}
      {isLoading && ( <div className="flex justify-center items-center py-10 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-lg">Loading...</span></div> )}
      {error && !isLoading && ( <div className="p-4 border border-destructive/50 rounded bg-destructive/10 text-destructive"><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span className="font-semibold">Error</span></div><p className="mt-2 text-sm">{error}</p></div> )}

      {/* Patient Table */}
      {!isLoading && !error && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle>My Patients ({patients.length})</CardTitle></CardHeader>
          <CardContent>
            <PatientTable patients={patients} onViewInfo={handleViewInfo} onViewHistory={handleViewHistory}/>
          </CardContent>
        </Card>
      )}

      {/* === Floating Action Button === */}
      {/* Thay Link bằng Button để mở Dialog */}
      <div className="fixed bottom-6 right-6 group cursor-pointer z-40">
          <Button
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full shadow-lg transition-transform group-hover:scale-110"
              onClick={handleOpenAddPatientDialog} // *** MỞ DIALOG ADD PATIENT ***
              aria-label="Add new patient"
            >
              <Plus className="h-8 w-8" />
          </Button>
           <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs px-3 py-1 rounded transition-opacity duration-200 pointer-events-none">
               Add new patient
           </span>
       </div>

      {/* === Render các Dialog Components === */}
      {/* Dialog Info */}
      <PatientInfoDialog patientId={selectedPatientIdForInfo} open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}/>

      {/* Dialog History (Truyền thêm hàm để mở Add Report Dialog) */}
      <MedicalHistoryDialog
        patient={selectedPatientForHistory}
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        // *** TRUYỀN HÀM XUỐNG ĐỂ MỞ ADD REPORT ***
        onOpenAddReport={() => handleOpenAddReportDialog(selectedPatientForHistory)}
        // Hiện tại nút Add Report đang là Link trong MedicalHistoryDialog, cần sửa lại MedicalHistoryDialog để gọi prop này
      />

       {/* *** RENDER DIALOG ADD PATIENT *** */}
       <AddPatientDialog
            open={isAddPatientDialogOpen}
            onOpenChange={setIsAddPatientDialogOpen}
            onPatientAdded={handlePatientAdded}
        />

       {/* *** RENDER DIALOG ADD REPORT *** */}
        <AddReportDialog
            patient={selectedPatientForHistory} // Dùng patient đang chọn cho History
            open={isAddReportDialogOpen}
            onOpenChange={setIsAddReportDialogOpen}
            onReportAdded={handleReportAdded}
        />

        {/* Render Edit Dialogs (sẽ thêm sau) */}
        {/* <EditPatientDialog patientId={editingPatientId} open={isEditPatientDialogOpen} onOpenChange={setIsEditPatientDialogOpen} onPatientUpdated={...} /> */}
        {/* <EditReportDialog reportId={editingReportId} open={isEditReportDialogOpen} onOpenChange={setIsEditReportDialogOpen} onReportUpdated={...} /> */}

    </div> // End container
  );
}