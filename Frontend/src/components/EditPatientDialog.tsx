// src/components/features/patients/EditPatientDialog.tsx

"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { format, parseISO, isValid } from 'date-fns'; // Thêm isValid
import { cn } from "@/lib/utils";
import { Patient, PatientAllergy, PatientMedical, PatientSocial } from "@/types/patientfake"; // Import types đầy đủ

// --- Shadcn UI Components & Icons ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Save, XCircle, Loader2, AlertCircle, Pencil } from "lucide-react";

// --- Mock API Functions (Giữ nguyên hoặc import từ file khác) ---
const fetchPatientDetails = async (patientId: string): Promise<Patient | null> => { console.log(`EDIT_DIALOG: Fetching details for patient: ${patientId}`); await new Promise(resolve => setTimeout(resolve, 600)); const mockPatientsFull = [{ id: "d3c15f68-7004-4198-253c-08dd73f93a34", name: "Minh Nguyen", age: 22, dob: "2003-01-01", gender: "Male", phone: "0901234567", address: "123 To Hien Thanh Str, Ward 1, District 1", healthInsurance: "Yes", livingArrangement: "With family", allergies: { drugs: "Penicillin", drugsReaction: "Rash", environment: "Dust", environmentReaction: "Sneezing" }, medical: { chiefComplaint: "Frequent headaches", history: "Recurring for 3 months", past: "No major illnesses", family: "Father has migraines" }, social: { tobacco: "No", alcohol: "Yes", alcoholDetail: "<2 drinks/week", caffeine: "Yes", caffeineDetail: "1-2 cups/day", drugs: "No" } },{ id: "a2559b6b-0ca9-4d88-90b8-9565386339c0", name: "Alice Tran", age: 19, dob: "2005-12-01", gender: "Female", phone: "0907654321", address: "456 Tran Hung Dao Str, Ward 5, District 10", healthInsurance: "No", livingArrangement: "Alone", allergies: { drugs: "None reported" }, medical: { chiefComplaint: "Checkup", history: "N/A", past: "Asthma as child", family: "Mother has diabetes" }, social: { tobacco: "No", alcohol: "No", caffeine: "No", drugs: "No" } }]; const patient = mockPatientsFull.find(p => p.id === patientId) || null; if(patient?.dob && patient.age === undefined) { const age = calculateAge(patient.dob); if(age !== undefined) patient.age = age;} return patient; };
const updatePatient = async (patientData: Patient): Promise<{ success: boolean; message?: string }> => { console.log(`API_MOCK: Updating patient: ${patientData.id}`, patientData); await new Promise(resolve => setTimeout(resolve, 1000)); console.log("API_MOCK: Patient updated successfully."); return { success: true }; };
function calculateAge(dob: string): number | undefined { try { const birthDate = new Date(dob); if (isNaN(birthDate.getTime())) return undefined; const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--; return age >= 0 ? age : undefined; } catch { return undefined; } }
//---------------------------------------------------

// --- Props ---
interface EditPatientDialogProps {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientUpdated: () => void;
}

// --- Kiểu dữ liệu khởi tạo cho form (Đảm bảo các object con tồn tại) ---
const initialPatientFormData: Omit<Patient, 'id' | 'age'> = {
    name: '', dob: '', gender: '', phone: '', address: '', healthInsurance: '', livingArrangement: '',
    allergies: { drugs: '', drugsReaction: '', environment: '', environmentReaction: '', adr: '', adrReaction: '' },
    medical: { chiefComplaint: '', history: '', past: '', family: '' },
    social: { tobacco: 'No', tobaccoDetail: '', alcohol: 'No', alcoholDetail: '', caffeine: 'No', caffeineDetail: '', drugs: 'No', drugsList: '' }
};


export function EditPatientDialog({ patientId, open, onOpenChange, onPatientUpdated }: EditPatientDialogProps) {
  // State
  const [formData, setFormData] = useState<Omit<Patient, 'id' | 'age'> | null>(null); // Bỏ id, age khỏi form state trực tiếp
  const [selectedDob, setSelectedDob] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect fetch data khi dialog mở
  useEffect(() => {
    if (open && patientId) {
      const loadPatient = async () => {
        setIsLoadingData(true);
        setError(null);
        setFormData(null);
        try {
          const data = await fetchPatientDetails(patientId);
          if (data) {
             // Chuẩn bị dữ liệu form, đảm bảo các object con được khởi tạo đầy đủ
             const initialData = {
                 ...initialPatientFormData, // Base structure with defaults
                 name: data.name,
                 dob: data.dob,
                 gender: data.gender,
                 phone: data.phone ?? '',
                 address: data.address ?? '',
                 healthInsurance: data.healthInsurance ?? '',
                 livingArrangement: data.livingArrangement ?? '',
                 allergies: { ...initialPatientFormData.allergies, ...data.allergies },
                 medical: { ...initialPatientFormData.medical, ...data.medical },
                 social: { ...initialPatientFormData.social, ...data.social },
             };
            setFormData(initialData);
            // Cập nhật DatePicker
            if(data.dob) { try { const date = parseISO(data.dob); if(isValid(date)) setSelectedDob(date); else setSelectedDob(undefined); } catch { setSelectedDob(undefined);}}
            else { setSelectedDob(undefined); }
          } else {
            setError(`Could not find patient with ID ${patientId}.`);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load patient data.");
        } finally {
          setIsLoadingData(false);
        }
      };
      loadPatient();
    } else if (!open) {
      // Reset khi đóng
      setFormData(null); setSelectedDob(undefined); setError(null); setIsLoadingData(false); setIsSubmitting(false);
    }
  }, [open, patientId]);

  // --- Handlers ---
  const handleChange = (field: keyof typeof initialPatientFormData, value: string | number) => {
     setFormData(prev => prev ? { ...prev, [field]: value } : null);
      if (field === 'dob' && typeof value === 'string') {
          try { if(value){ const d = parseISO(value); if(isValid(d)) setSelectedDob(d);} else setSelectedDob(undefined); }
          catch { setSelectedDob(undefined); }
      }
  };

  const handleDobChange = (date: Date | undefined) => {
    setSelectedDob(date);
    handleChange('dob', date ? format(date, 'yyyy-MM-dd') : '');
  };

  const handleGenderChange = (value: string) => { handleChange("gender", value); };

   const handleNestedChange = ( group: 'allergies' | 'medical' | 'social', field: string, value: string ) => {
       setFormData(prev => {
           if (!prev) return null;
           const groupData = prev[group];
           // Đảm bảo groupData tồn tại (luôn có do cách khởi tạo)
           const updatedGroupData = { ...(groupData as object), [field]: value }; // Type assertion nhỏ ở đây là chấp nhận được
           return { ...prev, [group]: updatedGroupData };
       });
   };

  // --- Submit ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData || !patientId) { setError("Form data or Patient ID is missing."); return; }

    setIsSubmitting(true);
    setError(null);

    // Tạo object Patient đầy đủ để gửi đi API
    const patientToUpdate: Patient = {
        ...formData, // Dữ liệu từ form
        id: patientId, // ID gốc
        age: formData.dob ? calculateAge(formData.dob) : undefined, // Tính lại tuổi
        // Đảm bảo các object con là đúng kiểu hoặc undefined nếu rỗng (tùy API yêu cầu)
        allergies: formData.allergies,
        medical: formData.medical,
        social: formData.social,
    };

    console.log("Submitting Updated Patient:", patientToUpdate);

    try {
      const response = await updatePatient(patientToUpdate); // Gọi API update
       if (!response.success) { throw new Error(response.message || 'Failed to update patient'); }

      alert(`Patient ${formData.name} updated successfully (simulated)!`);
      onPatientUpdated(); // Báo cho cha (PatientInfoDialog)
      onOpenChange(false); // Đóng dialog edit

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

   // Xử lý đóng dialog
   const handleDialogClose = (isOpen: boolean) => { onOpenChange(isOpen); };

  // --- Render ---
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2"><Pencil className="h-5 w-5"/> Edit Patient Information</DialogTitle>
          {isLoadingData && <DialogDescription>Loading patient data...</DialogDescription>}
          {!isLoadingData && formData && <DialogDescription>Editing details for {formData.name} (ID: {patientId}).</DialogDescription>}
          {!isLoadingData && error && <DialogDescription className="text-destructive">{error || "Error loading data."}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6 pl-1">
           {isLoadingData && ( <div className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> )}
           {!isLoadingData && error && ( <div className="text-destructive text-sm p-4 border border-destructive/20 rounded bg-destructive/5"><AlertCircle className="inline h-4 w-4 mr-1"/> {error}</div> )}

           {!isLoadingData && formData && !error && (
              <form onSubmit={handleSubmit} className="space-y-8 py-4">
                {/* --- Personal Info --- */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 text-primary">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2"> <Label>Patient ID</Label> <Input value={patientId || ""} readOnly className="bg-muted" /> </div>
                      <div className="space-y-2"> <Label htmlFor="edit-pt-name">Name</Label> <Input id="edit-pt-name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required /> </div>
                      <div className="space-y-2">
                          <Label>Date of Birth</Label>
                          <Popover>
                              <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start font-normal",!selectedDob && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{selectedDob ? format(selectedDob, "PPP") : <span>Pick date</span>}</Button></PopoverTrigger>
                              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDob} onSelect={handleDobChange} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()}/></PopoverContent>
                          </Popover>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="edit-pt-gender">Gender</Label>
                          <Select value={formData.gender} onValueChange={handleGenderChange}>
                              <SelectTrigger id="edit-pt-gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                              <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2"> <Label htmlFor="edit-pt-phone">Phone</Label> <Input id="edit-pt-phone" value={formData.phone || ''} onChange={(e) => handleChange("phone", e.target.value)} /> </div>
                      <div className="space-y-2"> <Label htmlFor="edit-pt-insurance">Insurance</Label> <Input id="edit-pt-insurance" value={formData.healthInsurance || ''} onChange={(e) => handleChange("healthInsurance", e.target.value)} /> </div>
                      <div className="space-y-2 sm:col-span-2"> <Label htmlFor="edit-pt-address">Address</Label> <Textarea id="edit-pt-address" rows={2} value={formData.address || ''} onChange={(e) => handleChange("address", e.target.value)} /> </div>
                      <div className="space-y-2"> <Label htmlFor="edit-pt-living">Living Arrangement</Label> <Input id="edit-pt-living" value={formData.livingArrangement || ''} onChange={(e) => handleChange("livingArrangement", e.target.value)} /> </div>
                  </div>
                </section>
                <Separator/>
                 {/* --- Allergies --- */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 text-primary">Allergies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Sử dụng ?? {} để an toàn với Object.keys nếu formData.allergies có thể undefined (dù đã cố gắng khởi tạo) */}
                      {Object.keys(formData.allergies ?? {}).map((key) => (
                          <div key={`allergy-${key}`} className="space-y-1.5">
                              <Label htmlFor={`edit-allergy-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</Label>
                              <Input id={`edit-allergy-${key}`} value={formData.allergies?.[key as keyof PatientAllergy] || ''} onChange={(e) => handleNestedChange('allergies', key, e.target.value)} />
                          </div>
                      ))}
                  </div>
                </section>
                <Separator/>
                 {/* --- Medical History --- */}
                 <section className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 text-primary">Medical History Summary</h3>
                     {Object.keys(formData.medical ?? {}).map((key) => (
                         <div key={`medical-${key}`} className="space-y-1.5">
                             <Label htmlFor={`edit-medical-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</Label>
                             <Textarea id={`edit-medical-${key}`} rows={2} value={formData.medical?.[key as keyof PatientMedical] || ''} onChange={(e) => handleNestedChange('medical', key, e.target.value)} />
                         </div>
                     ))}
                 </section>
                <Separator/>
                 {/* --- Social History --- */}
                 <section className="space-y-4">
                     <h3 className="text-lg font-semibold border-b pb-2 text-primary">Social History</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {(['tobacco', 'alcohol', 'caffeine', 'drugs'] as const).map((key) => (
                             <div key={`social-${key}`} className="space-y-1.5">
                                 <Label htmlFor={`edit-social-${key}`} className="capitalize">{key} Use:</Label>
                                  <Select value={formData.social?.[key] || 'No'} onValueChange={(value) => handleNestedChange('social', key, value)}>
                                     <SelectTrigger id={`edit-social-${key}`}><SelectValue /></SelectTrigger>
                                     <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                                 </Select>
                             </div>
                         ))}
                          {(['tobaccoDetail', 'alcoholDetail', 'caffeineDetail', 'drugsList'] as const).map((key) => (
                              <div key={`social-detail-${key}`} className="space-y-1.5">
                                  <Label htmlFor={`edit-social-${key}`} className="capitalize">{key.replace(/Detail|List/, "")} Details:</Label>
                                  <Input id={`edit-social-${key}`} value={formData.social?.[key] || ''} onChange={(e) => handleNestedChange('social', key, e.target.value)} />
                              </div>
                          ))}
                     </div>
                 </section>

                {/* Submit Error */}
                {error && !isLoadingData && ( <div className="text-destructive text-sm flex items-center gap-2 pt-4"><AlertCircle className="h-4 w-4"/> {error}</div> )}

                {/* Footer */}
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