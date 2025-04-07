"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
// Import AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Ensure the path is correct for your project structure
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";
import type { Doctor, DoctorDto } from "@/types/doctor"; // Assuming Doctor type has 'id'
import {
  registerStaff,
  getAllStaffs,
  updateStaff,
  deleteStaff,
} from "@/lib/staff"; // Adjust path as needed

// Initial state for the add/edit form
const initialFormState: Omit<Doctor, 'id'> = {
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
};

// Helper function for basic email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export default function ManageWorkerPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false); // State for Add/Edit Dialog
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Doctor, 'id'>>(initialFormState);
  const { toast } = useToast(); // Keep using toast, even if display is problematic

  // State for Delete Confirmation Dialog (AlertDialog)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<{ id: string; name: string } | null>(null);

  // State for form validation errors
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof initialFormState, string>>>({});


  // Fetch doctors data
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: DoctorDto = await getAllStaffs();
      setDoctors(data.staffs ?? []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      // Still try to show error toast
      toast({
        variant: "destructive",
        title: "Error Loading Doctors",
        description: error instanceof Error ? error.message : "Could not retrieve doctor list.",
      });
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  // Include toast in dependency array if it's stable, otherwise might cause issues if hook re-creates it often
  }, [toast]); // If toast causes infinite loops, remove it from here

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Handler to open the Add/Edit dialog for adding a new doctor
  const handleAdd = () => {
    setEditDoctorId(null);
    setForm(initialFormState);
    setFormErrors({}); // Clear errors when opening add form
    setOpen(true);
  };

  // Handler to open the Add/Edit dialog for editing an existing doctor
  const handleEdit = (doctor: Doctor) => {
    setEditDoctorId(doctor.id);
    setForm({
      name: doctor.name,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      address: doctor.address,
    });
    setFormErrors({}); // Clear errors when opening edit form
    setOpen(true);
  };

  // Handler triggered when the delete button in the table is clicked
  const handleDeleteClick = (id: string, name: string) => {
    setDoctorToDelete({ id, name });
    setIsAlertOpen(true);
  };

  // Handler for confirming the deletion after AlertDialog is shown
  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;

    setIsSubmitting(true);
    try {
      const { id, name } = doctorToDelete;
      const status = await deleteStaff(id);

      if (status >= 200 && status < 300) {
        setDoctors((prevDoctors) => prevDoctors.filter((doc) => doc.id !== id));
        // Try to show success toast
        toast({
          variant: "success",
          title: "Doctor Deleted",
          description: `Dr. ${name} has been successfully removed.`,
        });
        console.log("Delete successful - Should show toast here");
        setIsAlertOpen(false);
        setDoctorToDelete(null);
      } else {
         // Try to show error toast
         toast({
            variant: "destructive",
            title: "Error Deleting Doctor",
            description: `Server responded with status ${status}`,
        });
        console.error(`Failed to delete doctor: Server responded with status ${status}`);
        // Keep alert open on server error? Optional.
        // setIsAlertOpen(false);
        // setDoctorToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete doctor:", error);
      // Try to show error toast
      toast({
        variant: "destructive",
        title: "Error Deleting Doctor",
        description: error instanceof Error ? error.message : "Could not remove the doctor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for saving changes (Add or Edit) with validation
  const handleSave = async () => {
    // --- Validation ---
    setFormErrors({}); // Clear previous errors
    const errors: Partial<Record<keyof typeof initialFormState, string>> = {};

    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
        errors.email = "Please enter a valid email address.";
    }
    if (!form.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
    if (!form.address.trim()) errors.address = "Address is required.";

    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        // Don't set isSubmitting here, let it be handled by button click visually if needed
        return; // Stop execution if validation fails
    }
    // --- End Validation ---

    setIsSubmitting(true); // Start submitting only if validation passed
    try {
      let status: number;
      const doctorFormData = { ...form };

      if (editDoctorId) {
        // --- Editing Existing Doctor ---
        const updatedDoctor: Doctor = { id: editDoctorId, ...doctorFormData };
        status = await updateStaff(updatedDoctor);

        if (status >= 200 && status < 300) {
          setDoctors((prev) => prev.map((doc) => doc.id === editDoctorId ? updatedDoctor : doc));
          // Try to show success toast
          toast({
            variant: "success",
            title: "Doctor Updated",
            description: `Dr. ${updatedDoctor.name}'s details have been updated.`,
          });
          console.log("Update successful - Should show toast here");
          setOpen(false);
        } else {
            // Try to show error toast
            toast({
                variant: "destructive",
                title: "Error Updating Doctor",
                description: `Update failed with status ${status}`,
            });
            console.error(`Update failed with status ${status}`);
             // Keep dialog open on server error? Optional.
            // setOpen(false);
        }
      } else {
        // --- Adding New Doctor ---
        status = await registerStaff(doctorFormData as Doctor); // Adjust cast if needed

        if (status >= 200 && status < 300) {
          // Try to show success toast
          toast({
            variant: "success",
            title: "Doctor Added",
            description: `Dr. ${doctorFormData.name} has been successfully registered.`,
          });
          console.log("Registration successful - Should show toast here");
          setOpen(false);
          await fetchDoctors(); // Refetch list
        } else {
             // Try to show error toast
            toast({
                variant: "destructive",
                title: "Error Adding Doctor",
                description: `Registration failed with status ${status}`,
            });
            console.error(`Registration failed with status ${status}`);
             // Keep dialog open on server error? Optional.
            // setOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to save doctor:", error);
       // Try to show error toast
      toast({
        variant: "destructive",
        title: `Error ${editDoctorId ? "Updating" : "Adding"} Doctor`,
        description: error instanceof Error ? error.message : "Could not save doctor details.",
      });
    } finally {
      // Only set isSubmitting false if validation passed initially
       if (Object.keys(errors).length === 0) {
           setIsSubmitting(false);
       }
    }
  };

  // Handler for input changes in the Add/Edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    // Clear error for the specific field when user types
    if (formErrors[name as keyof typeof initialFormState]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  // --- JSX Structure ---
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Doctors</h1>
        <Button onClick={handleAdd} disabled={isLoading || isSubmitting}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Doctor
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading Doctors...</span>
        </div>
      ) : (
        // Doctors Table
        <Table>
          <TableCaption>List of registered doctors.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No doctors found.
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.phoneNumber}</TableCell>
                  <TableCell>{doctor.address}</TableCell>
                  <TableCell className="text-right">
                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(doctor)}
                      disabled={isSubmitting}
                      className="mr-2"
                      aria-label={`Edit Dr. ${doctor.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {/* Delete Button - Triggers AlertDialog */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(doctor.id, doctor.name)}
                      disabled={isSubmitting}
                      aria-label={`Delete Dr. ${doctor.name}`}
                    >
                      {isSubmitting && doctorToDelete?.id === doctor.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editDoctorId ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
            <DialogDescription>
              {editDoctorId ? "Update the details for this doctor." : "Enter the details for the new doctor."}
            </DialogDescription>
          </DialogHeader>
          {/* Use form tag for better semantics and accessibility */}
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid gap-4 py-4">
               {/* Name Field & Error */}
               <div className="grid grid-cols-4 items-center gap-x-4">
                 <Label htmlFor="name" className="text-right">Name</Label>
                 <Input
                   id="name"
                   name="name"
                   placeholder="e.g. Dr. John Doe"
                   value={form.name}
                   onChange={handleInputChange}
                   className="col-span-3"
                   disabled={isSubmitting}
                   aria-invalid={!!formErrors.name}
                   aria-describedby={formErrors.name ? "name-error" : undefined}
                 />
               </div>
               {formErrors.name && (
                 <div className="grid grid-cols-4 items-center gap-x-4">
                   <div></div>
                   <p id="name-error" className="col-span-3 text-sm text-destructive -mt-2">
                     {formErrors.name}
                   </p>
                 </div>
               )}

              {/* Email Field & Error */}
              <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. john.doe@example.com"
                  value={form.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                />
              </div>
              {formErrors.email && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <div></div>
                  <p id="email-error" className="col-span-3 text-sm text-destructive -mt-2">
                    {formErrors.email}
                  </p>
                </div>
              )}

              {/* Phone Field & Error */}
              <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="phoneNumber" className="text-right">Phone</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="e.g. 555-1234"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.phoneNumber}
                  aria-describedby={formErrors.phoneNumber ? "phone-error" : undefined}
                />
              </div>
              {formErrors.phoneNumber && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <div></div>
                  <p id="phone-error" className="col-span-3 text-sm text-destructive -mt-2">
                    {formErrors.phoneNumber}
                  </p>
                </div>
              )}

              {/* Address Field & Error */}
              <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="address" className="text-right">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g. 123 Main St, Anytown"
                  value={form.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.address}
                  aria-describedby={formErrors.address ? "address-error" : undefined}
                />
              </div>
              {formErrors.address && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <div></div>
                  <p id="address-error" className="col-span-3 text-sm text-destructive -mt-2">
                    {formErrors.address}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              {/* Use type="submit" for the save button */}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editDoctorId ? "Save Changes" : "Add Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete Dr.{" "}
              <span className="font-semibold">{doctorToDelete?.name ?? ""}</span> and remove their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDoctorToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}