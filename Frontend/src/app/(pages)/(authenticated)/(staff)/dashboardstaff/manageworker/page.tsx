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
// Ensure the path is correct for your project structure
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";
import type { Doctor, DoctorDto } from "@/types/doctor";
import {
  registerStaff,
  getAllStaffs,
  updateStaff, // Now using the corrected signature
  deleteStaff,
} from "@/lib/staff";

const initialFormState: Omit<Doctor, 'id'> = {
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
};

export default function ManageWorkerPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Doctor, 'id'>>(initialFormState);
  const { toast } = useToast();

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: DoctorDto = await getAllStaffs();
      setDoctors(data.staffs ?? []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Doctors",
        description: error instanceof Error ? error.message : "Could not retrieve doctor list.",
      });
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleAdd = () => {
    setEditDoctorId(null);
    setForm(initialFormState);
    setOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditDoctorId(doctor.id);
    setForm({
      name: doctor.name,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      address: doctor.address,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Dr. ${name}? This action cannot be undone.`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      const status = await deleteStaff(id);
      if (status >= 200 && status < 300) {
        setDoctors((prevDoctors) => prevDoctors.filter((doc) => doc.id !== id));
        toast({
          variant: "success",
          title: "Doctor Deleted",
          description: `Dr. ${name} has been successfully removed.`,
        });
      } else {
        throw new Error(`Server responded with status ${status}`);
      }
    } catch (error) {
      console.error("Failed to delete doctor:", error);
      toast({
        variant: "destructive",
        title: "Error Deleting Doctor",
        description: error instanceof Error ? error.message : "Could not remove the doctor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Updated handleSave Function ---
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let status: number;
      // Get current form data (name, email, phone, address)
      const doctorFormData = { ...form };

      if (editDoctorId) {
        // --- Editing Existing Doctor ---
        // Construct the full Doctor object including the ID
        const updatedDoctor: Doctor = {
          id: editDoctorId, // Add the existing ID
          ...doctorFormData, // Spread the form data (name, email, etc.)
        };

        // Call the updateStaff API with the complete Doctor object
        status = await updateStaff(updatedDoctor);

        if (status >= 200 && status < 300) {
          // Update local state with the modified doctor data
          setDoctors((prev) =>
            prev.map((doc) =>
              doc.id === editDoctorId ? updatedDoctor : doc // Replace the old object with the updated one
            )
          );
          toast({
            variant: "success",
            title: "Doctor Updated",
            description: `Dr. ${updatedDoctor.name}'s details have been updated.`,
          });
          setOpen(false); // Close dialog on success
        } else {
          throw new Error(`Update failed with status ${status}`);
        }
      } else {
        // --- Adding New Doctor ---
        // Assuming the backend generates the ID and ignores any ID sent in the payload
        // We pass the form data. If registerStaff strictly needs a Doctor type,
        // you might need a temporary ID or adjust the API/type.
        // For now, casting assuming the API handles it.
        status = await registerStaff(doctorFormData as Doctor);

        if (status >= 200 && status < 300) {
          toast({
            variant: "success",
            title: "Doctor Added",
            description: `Dr. ${doctorFormData.name} has been successfully registered.`,
          });
          setOpen(false); // Close dialog
          await fetchDoctors(); // Refetch the list to include the new doctor with their server-generated ID
        } else {
          throw new Error(`Registration failed with status ${status}`);
        }
      }
    } catch (error) {
      console.error("Failed to save doctor:", error);
      toast({
        variant: "destructive",
        title: `Error ${editDoctorId ? "Updating" : "Adding"} Doctor`,
        description: error instanceof Error ? error.message : "Could not save doctor details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- End Updated handleSave Function ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // --- JSX remains the same ---
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Doctors</h1>
        <Button onClick={handleAdd} disabled={isLoading || isSubmitting}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Doctor
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading Doctors...</span>
        </div>
      ) : (
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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(doctor.id, doctor.name)}
                      disabled={isSubmitting}
                      aria-label={`Delete Dr. ${doctor.name}`}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Dr. John Doe"
                value={form.name}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Phone</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="e.g. 555-1234"
                value={form.phoneNumber}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="e.g. 123 Main St, Anytown"
                value={form.address}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                </Button>
            </DialogClose>
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editDoctorId ? "Save Changes" : "Add Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}