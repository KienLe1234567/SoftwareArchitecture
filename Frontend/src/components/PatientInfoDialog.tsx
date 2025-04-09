// src/components/features/patients/PatientInfoDialog.tsx (Đầy đủ và đã cập nhật)

"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Loader2, AlertCircle, Pencil } from "lucide-react";
import { Patient } from "@/types/patientfake"; // Đảm bảo đúng path
import { cn } from "@/lib/utils";

// --- Shadcn UI Components ---
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// --- Component con ---
import { EditPatientDialog } from "./EditPatientDialog"; // Đảm bảo đúng path

// --- Mock API & Helper (Để ở đây hoặc import) ---
const fetchPatientDetails = async (patientId: string): Promise<Patient | null> => { console.log(`INFO_DIALOG: Fetching details for patient: ${patientId}`); await new Promise(resolve => setTimeout(resolve, 600)); const mockPatientsFull = [{ id: "d3c15f68-7004-4198-253c-08dd73f93a34", name: "Minh Nguyen", age: 22, dob: "2003-01-01", gender: "Male", phone: "0901234567", address: "123 To Hien Thanh Str, Ward 1, District 1", healthInsurance: "Yes", livingArrangement: "With family", allergies: { drugs: "Penicillin", drugsReaction: "Rash", environment: "Dust", environmentReaction: "Sneezing" }, medical: { chiefComplaint: "Frequent headaches", history: "Recurring for 3 months", past: "No major illnesses", family: "Father has migraines" }, social: { tobacco: "No", alcohol: "Yes", alcoholDetail: "<2 drinks/week", caffeine: "Yes", caffeineDetail: "1-2 cups/day", drugs: "No" } },{ id: "a2559b6b-0ca9-4d88-90b8-9565386339c0", name: "Alice Tran", age: 19, dob: "2005-12-01", gender: "Female", phone: "0907654321", address: "456 Tran Hung Dao Str, Ward 5, District 10", healthInsurance: "No", livingArrangement: "Alone", allergies: { drugs: "None reported" }, medical: { chiefComplaint: "Checkup", history: "N/A", past: "Asthma as child", family: "Mother has diabetes" }, social: { tobacco: "No", alcohol: "No", caffeine: "No", drugs: "No" } }]; const patient = mockPatientsFull.find(p => p.id === patientId) || null; if(patient?.dob && patient.age === undefined) { const age = calculateAge(patient.dob); if(age !== undefined) patient.age = age;} return patient; };
function calculateAge(dob: string): number | undefined { try { const birthDate = new Date(dob); if (isNaN(birthDate.getTime())) return undefined; const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--; return age >= 0 ? age : undefined; } catch { return undefined; } }
//---------------------------------------------------

// --- Props ---
interface PatientInfoDialogProps {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientDataUpdated?: () => void;
}

// --- Component ---
export function PatientInfoDialog({ patientId, open, onOpenChange, onPatientDataUpdated }: PatientInfoDialogProps) {
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // --- Fetch Data ---
  const loadData = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    setError(null);
    console.log("PatientInfoDialog: Reloading data for", patientId)
    try {
      const data = await fetchPatientDetails(patientId);
      if (data) setPatientData(data);
      else setError(`Could not find details for patient ID ${patientId}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient details.");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  // --- Effects ---
  useEffect(() => {
    if (open && patientId) {
      loadData();
    } else if (!open) {
      // Reset state khi dialog đóng
      setPatientData(null); setError(null); setIsLoading(false);
      setIsEditDialogOpen(false); // Đóng cả dialog edit nếu đang mở
    }
  }, [open, patientId, loadData]);

  // --- Handlers ---
  const handleOpenEditDialog = () => { if(patientData) setIsEditDialogOpen(true); };
  const handlePatientUpdatedFromEdit = () => { setIsEditDialogOpen(false); loadData(); onPatientDataUpdated?.(); };
  const handleCloseInfoDialog = (isOpen: boolean) => { onOpenChange(isOpen); if (!isOpen) setIsEditDialogOpen(false); }

  // --- Helper Component for Display Rows ---
  const InfoRow = ({ label, value, className }: { label: string; value: React.ReactNode | string | null | undefined; className?: string }) => (
    <div className={cn("grid grid-cols-3 gap-x-2 sm:gap-x-4 items-start text-sm", className)}> {/* Đảm bảo text-sm */}
      {/* dt: Label - Đổi thành text-left, giữ font-medium */}
      <dt className="col-span-1 font-bold text-muted-foreground text-left">{label}:</dt>
      {/* dd: Value - Không thêm class font-weight để dùng mặc định (font-normal) */}
      <dd className="col-span-2 mt-0 break-words">
          {value !== null && value !== undefined && value !== ''
              ? value
              : <span className="italic text-muted-foreground/80">N/A</span>}
      </dd>
    </div>
);

   // --- Render ---
   return (
    <> {/* Fragment */}
        {/* === Dialog hiển thị thông tin === */}
        <Dialog open={open} onOpenChange={handleCloseInfoDialog}>
          {/* Tăng kích thước dialog */}
          <DialogContent className="max-w-4xl lg:max-w-5xl w-[90vw] md:w-[80vw]">
             <DialogHeader>
               <DialogTitle className="text-2xl">Patient Information</DialogTitle>
                {isLoading && <DialogDescription>Loading patient details...</DialogDescription>}
                {patientData && <DialogDescription>Details for {patientData.name} (ID: {patientId}).</DialogDescription>}
                {error && <DialogDescription className="text-destructive">{error || "Error loading details"}</DialogDescription>}
             </DialogHeader>

             {/* ScrollArea với max-height lớn hơn */}
             <ScrollArea className="max-h-[75vh] pr-4 -mr-2 py-4"> {/* Thêm pr, mr để thanh cuộn không che nội dung */}
                {isLoading && ( <div className="flex justify-center items-center h-60"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> )}
                {error && !isLoading && ( <div className="text-destructive text-sm p-4 border border-destructive/20 rounded bg-destructive/5"><AlertCircle className="inline h-4 w-4 mr-1" /> {error}</div> )}

                {patientData && !isLoading && !error && (
                    // Container chính với cỡ chữ cơ bản và khoảng cách lớn hơn
                    <div className="space-y-8 text-sm">
                        {/* --- Personal Information --- */}
                        <section>
                          <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Personal Information</h3>
                          {/* Dùng grid cho layout 2 cột, dl/dt/dd bị loại bỏ, dùng InfoRow */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"> {/* Grid 2 cột */}
                             <InfoRow label="Patient ID" value={<Badge variant="secondary">{patientData.id}</Badge>} />
                             <InfoRow label="Name" value={<span className="font-medium text-base">{patientData.name}</span>} /> {/* Giữ tên lớn hơn chút */}
                             <InfoRow label="Age" value={patientData.age} />
                             <InfoRow label="Date of Birth" value={patientData.dob ? format(parseISO(patientData.dob), "PPP") : undefined} />
                             <InfoRow label="Gender" value={patientData.gender} />
                             <InfoRow label="Phone" value={patientData.phone} />
                             <InfoRow label="Insurance" value={patientData.healthInsurance} />
                             <InfoRow label="Living Arrangement" value={patientData.livingArrangement} />
                             {/* Address chiếm cả dòng nếu cần */}
                             <InfoRow label="Address" value={patientData.address} className="md:col-span-2"/>
                          </div>
                        </section>

                        <Separator />

                        {/* --- Allergies --- */}
                        {patientData.allergies && (
                           <section>
                               <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-primary">Allergies</h3>
                               {/* Layout 1 cột với InfoRow */}
                               <div className="space-y-3">
                                   <InfoRow label="Drugs" value={<>{patientData.allergies.drugs} {patientData.allergies.drugsReaction && <span className="text-xs text-muted-foreground">({patientData.allergies.drugsReaction})</span>}</>} />
                                   <InfoRow label="Environment" value={<>{patientData.allergies.environment} {patientData.allergies.environmentReaction && <span className="text-xs text-muted-foreground">({patientData.allergies.environmentReaction})</span>}</>} />
                                   <InfoRow label="ADR" value={<>{patientData.allergies.adr} {patientData.allergies.adrReaction && <span className="text-xs text-muted-foreground">({patientData.allergies.adrReaction})</span>}</>} />
                               </div>
                           </section>
                        )}

                         <Separator />

                        {/* --- Medical History Summary --- */}
                        {patientData.medical && (
                            <section>
                                <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-primary">Medical History Summary</h3>
                                <div className="space-y-3"> {/* Danh sách dọc */}
                                    <InfoRow label="Chief Complaint" value={patientData.medical.chiefComplaint} />
                                    <InfoRow label="Present Illness Hx" value={<span className="whitespace-pre-wrap">{patientData.medical.history}</span>} />
                                    <InfoRow label="Past Medical Hx" value={<span className="whitespace-pre-wrap">{patientData.medical.past}</span>} />
                                    <InfoRow label="Family Hx" value={<span className="whitespace-pre-wrap">{patientData.medical.family}</span>} />
                                </div>
                            </section>
                         )}

                         <Separator />

                         {/* --- Social History --- */}
                         {patientData.social && (
                             <section>
                                 <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-primary">Social History</h3>
                                  <div className="space-y-3">
                                     <InfoRow label="Tobacco Use" value={<>{patientData.social.tobacco} {patientData.social.tobaccoDetail && <span className="text-xs text-muted-foreground">({patientData.social.tobaccoDetail})</span>}</>} />
                                     <InfoRow label="Alcohol Use" value={<>{patientData.social.alcohol} {patientData.social.alcoholDetail && <span className="text-xs text-muted-foreground">({patientData.social.alcoholDetail})</span>}</>} />
                                     <InfoRow label="Caffeine Use" value={<>{patientData.social.caffeine} {patientData.social.caffeineDetail && <span className="text-xs text-muted-foreground">({patientData.social.caffeineDetail})</span>}</>} />
                                     <InfoRow label="Other Drugs" value={<>{patientData.social.drugs} {patientData.social.drugsList && <span className="text-xs text-muted-foreground">({patientData.social.drugsList})</span>}</>} />
                                  </div>
                             </section>
                          )}
                    </div>
                )}
             </ScrollArea>

             {/* --- Dialog Footer --- */}
            <DialogFooter className="sm:justify-end pt-4 border-t mt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                {patientData && !isLoading && (
                    <Button type="button" variant="default" onClick={handleOpenEditDialog}>
                       <Pencil className="mr-2 h-4 w-4"/> Edit Info
                    </Button>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* === Dialog Chỉnh sửa (Rendered nhưng ẩn/hiện bởi state) === */}
        <EditPatientDialog
            patientId={patientId}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onPatientUpdated={handlePatientUpdatedFromEdit}
        />
    </> // Kết thúc Fragment
  );
}