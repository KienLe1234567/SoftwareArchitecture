// src/components/features/patients/AddPatientDialog.tsx (Ví dụ đường dẫn)

"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { format, parse } from 'date-fns';
import { cn } from "@/lib/utils";

// --- Shadcn UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// --- Lucide Icons ---
import { CalendarIcon, Save, XCircle, Loader2, AlertCircle, UserPlus } from "lucide-react";

// --- Type ---
interface AddPatientFormState {
    name: string;
    dob: string; // yyyy-MM-dd
    gender: string;
    phone: string;
    address: string;
}

// --- Props ---
interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientAdded: () => void; // Callback để báo cho cha fetch lại list
}

export function AddPatientDialog({ open, onOpenChange, onPatientAdded }: AddPatientDialogProps) {
  const router = useRouter();

  const [form, setForm] = useState<AddPatientFormState>({
    name: "",
    dob: "",
    gender: "",
    phone: "",
    address: ""
  });
  const [selectedDob, setSelectedDob] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---
  const handleChange = (field: keyof AddPatientFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'dob') {
        try {
           const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
            if (!isNaN(parsedDate.getTime())) { setSelectedDob(parsedDate); }
            else { setSelectedDob(undefined); }
        } catch { setSelectedDob(undefined); }
    }
  };

  const handleDobChange = (date: Date | undefined) => {
    setSelectedDob(date);
    handleChange('dob', date ? format(date, 'yyyy-MM-dd') : '');
  };

  const handleGenderChange = (value: string) => {
      handleChange("gender", value);
  };

   // --- Submit ---
   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);
      console.log("Submitting Patient via Dialog:", form);

      try {
          // --- !!! TODO: Gọi API thật để tạo bệnh nhân ---
          // const response = await api.addPatient(form);
           await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập

           alert("Patient added successfully (simulated)!");
           onPatientAdded(); // Báo cho cha
           onOpenChange(false); // Đóng dialog

      } catch (err) {
          console.error("Failed to add patient:", err);
          setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
          setIsSubmitting(false);
      }
  };

   // Hàm xử lý khi dialog bị đóng
   const handleOpenChange = (isOpen: boolean) => {
       onOpenChange(isOpen);
       if (!isOpen) {
           // Reset form và lỗi khi đóng
           setForm({ name: "", dob: "", gender: "", phone: "", address: "" });
           setSelectedDob(undefined);
           setError(null);
           setIsSubmitting(false);
       }
   }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
             <UserPlus className="h-6 w-6"/> Add New Patient
          </DialogTitle>
          <DialogDescription>
            Enter the patient's basic information below.
          </DialogDescription>
        </DialogHeader>
        {/* Form đặt trong Dialog Content */}
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="add-pt-name">Full Name</Label>
                    <Input id="add-pt-name" value={form.name} placeholder="e.g., John Doe" onChange={(e) => handleChange("name", e.target.value)} required />
                </div>

                 {/* Date of Birth */}
                <div className="space-y-2">
                    <Label>Date of Birth</Label>
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button variant={"outline"} className={cn( "w-full justify-start text-left font-normal", !selectedDob && "text-muted-foreground" )}>
                           <CalendarIcon className="mr-2 h-4 w-4" />
                           {selectedDob ? format(selectedDob, "PPP") : <span>Pick a date</span>}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0">
                         <Calendar mode="single" selected={selectedDob} onSelect={handleDobChange} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} />
                       </PopoverContent>
                     </Popover>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label htmlFor="add-pt-gender">Gender</Label>
                     <Select value={form.gender} onValueChange={handleGenderChange}>
                       <SelectTrigger id="add-pt-gender">
                         <SelectValue placeholder="Select gender" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Male">Male</SelectItem>
                         <SelectItem value="Female">Female</SelectItem>
                         <SelectItem value="Other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <Label htmlFor="add-pt-phone">Phone Number</Label>
                    <Input id="add-pt-phone" value={form.phone} placeholder="e.g., 0901234567" onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
           </div>

           {/* Address */}
            <div className="space-y-2">
                <Label htmlFor="add-pt-address">Address</Label>
                <Textarea id="add-pt-address" placeholder="Enter full address" rows={3} value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            </div>

            {/* Error Display */}
           {error && ( <div className="text-destructive text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/>{error}</div> )}

           {/* Submit Buttons trong Footer */}
           <DialogFooter className="sm:justify-end pt-6">
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}><XCircle className="mr-2 h-4 w-4"/> Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Save className="mr-2 h-4 w-4"/> )} Add Patient
                </Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}