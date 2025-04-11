"use client";

import { useCallback, useEffect, useState } from "react";

import { Edit, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteStaff,
  getAllStaffs,
  getDoctorById,
  getNurseById,
  registerDoctor,
  registerNurse,
  updateDoctor,
  updateNurse,
} from "@/lib/staff";
import { Doctor, Nurse, Staff } from "@/types/staff";

// Mock data for dropdowns
const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Pediatrics",
  "Psychiatry",
  "Surgery",
  "Urology",
] as const;

const CONSULTATION_ROOMS = [
  "Room 101",
  "Room 102",
  "Room 103",
  "Room 201",
  "Room 202",
  "Room 203",
  "Room 301",
  "Room 302",
  "Room 303",
] as const;

const DEPARTMENTS = [
  "Emergency",
  "Intensive Care",
  "Medical-Surgical",
  "Pediatric",
  "Obstetric",
  "Operating Room",
  "Oncology",
  "Psychiatric",
  "Rehabilitation",
] as const;

const SHIFT_PREFERENCES = [
  "Morning (7AM-3PM)",
  "Afternoon (3PM-11PM)",
  "Night (11PM-7AM)",
  "Rotating",
  "Fixed Day",
  "Fixed Night",
] as const;

// Initial state for the form
const initialDoctorFormState: Omit<Doctor, "id"> = {
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
  specialization: SPECIALIZATIONS[0],
  licenseNumber: "",
  consultationRoom: CONSULTATION_ROOMS[0],
};

const initialNurseFormState: Omit<Nurse, "id"> = {
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
  department: DEPARTMENTS[0],
  certificationNumber: "",
  shiftPreference: SHIFT_PREFERENCES[0],
};

// Helper function for basic email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ManageWorkerPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [selectedStaffType, setSelectedStaffType] = useState<
    "Doctor" | "Nurse"
  >("Doctor");
  const [doctorForm, setDoctorForm] = useState<
    Omit<Doctor, "id" | "staffType">
  >(initialDoctorFormState);
  const [nurseForm, setNurseForm] = useState<Omit<Nurse, "id" | "staffType">>(
    initialNurseFormState
  );

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchStaffs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllStaffs();
      setStaffs(data.staffs ?? []);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Error Loading Staff", {
        description:
          error instanceof Error
            ? error.message
            : "Could not retrieve staff list.",
      });
      setStaffs([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const handleAdd = () => {
    setEditStaffId(null);
    setDoctorForm(initialDoctorFormState);
    setNurseForm(initialNurseFormState);
    setSelectedStaffType("Doctor");
    setFormErrors({});
    setOpen(true);
  };

  const handleEdit = async (staff: Staff) => {
    if (!staff.id) return;
    setIsSubmitting(true);

    try {
      if (staff.staffType === "Doctor") {
        const doctorData = await getDoctorById(staff.id);
        setDoctorForm({
          name: doctorData.name,
          email: doctorData.email,
          phoneNumber: doctorData.phoneNumber,
          address: doctorData.address,
          specialization: doctorData.specialization,
          licenseNumber: doctorData.licenseNumber,
          consultationRoom: doctorData.consultationRoom,
        });
        setSelectedStaffType("Doctor");
      } else {
        const nurseData = await getNurseById(staff.id);
        setNurseForm({
          name: nurseData.name,
          email: nurseData.email,
          phoneNumber: nurseData.phoneNumber,
          address: nurseData.address,
          department: nurseData.department,
          certificationNumber: nurseData.certificationNumber,
          shiftPreference: nurseData.shiftPreference,
        });
        setSelectedStaffType("Nurse");
      }
      setEditStaffId(staff.id);
      setFormErrors({});
      setOpen(true);
    } catch (error) {
      console.error("Failed to fetch staff details:", error);
      toast.error("Error Loading Staff Details", {
        description:
          error instanceof Error
            ? error.message
            : "Could not load staff details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (staff: Staff) => {
    setStaffToDelete({
      id: staff.id!,
      name: staff.name,
      type: staff.staffType,
    });
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;

    setIsSubmitting(true);
    try {
      const { id, name } = staffToDelete;
      const status = await deleteStaff(id);

      if (status >= 200 && status < 300) {
        setStaffs((prev) => prev.filter((staff) => staff.id !== id));
        toast.success("Staff Member Deleted", {
          description: `${name} has been successfully removed.`,
        });
        setIsAlertOpen(false);
        setStaffToDelete(null);
      } else {
        toast.error("Error Deleting Staff Member", {
          description: `Server responded with status ${status}`,
        });
      }
    } catch (error) {
      console.error("Failed to delete staff:", error);
      toast.error("Error Deleting Staff Member", {
        description:
          error instanceof Error
            ? error.message
            : "Could not remove the staff member.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const currentForm = selectedStaffType === "Doctor" ? doctorForm : nurseForm;

    // Common validations
    if (!currentForm.name.trim()) errors.name = "Name is required.";
    if (!currentForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(currentForm.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!currentForm.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required.";
    if (!currentForm.address.trim()) errors.address = "Address is required.";

    // Doctor-specific validations
    if (selectedStaffType === "Doctor") {
      if (!doctorForm.specialization.trim())
        errors.specialization = "Specialization is required.";
      if (!doctorForm.licenseNumber.trim())
        errors.licenseNumber = "License number is required.";
      if (!doctorForm.consultationRoom.trim())
        errors.consultationRoom = "Consultation room is required.";
    }

    // Nurse-specific validations
    if (selectedStaffType === "Nurse") {
      if (!nurseForm.department.trim())
        errors.department = "Department is required.";
      if (!nurseForm.certificationNumber.trim())
        errors.certificationNumber = "Certification number is required.";
      if (!nurseForm.shiftPreference.trim())
        errors.shiftPreference = "Shift preference is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let status: number;

      if (selectedStaffType === "Doctor") {
        if (editStaffId) {
          status = await updateDoctor({ ...doctorForm, id: editStaffId });
        } else {
          status = await registerDoctor(doctorForm);
        }
      } else {
        if (editStaffId) {
          status = await updateNurse({ ...nurseForm, id: editStaffId });
        } else {
          status = await registerNurse(nurseForm);
        }
      }

      if (status >= 200 && status < 300) {
        toast.success(
          `${selectedStaffType} ${editStaffId ? "Updated" : "Added"}`,
          {
            description: `${selectedStaffType} has been successfully ${editStaffId ? "updated" : "registered"}.`,
          }
        );
        setOpen(false);
        fetchStaffs(); // Refresh the list
      } else {
        toast(
          `Error ${editStaffId ? "Updating" : "Adding"} ${selectedStaffType}`,
          {
            description: `Operation failed with status ${status}`,
          }
        );
      }
    } catch (error) {
      console.error(
        `Failed to ${editStaffId ? "update" : "save"} ${selectedStaffType.toLowerCase()}:`,
        error
      );
      toast.error(
        `Error ${editStaffId ? "Updating" : "Adding"} ${selectedStaffType}`,
        {
          description:
            error instanceof Error
              ? error.message
              : `Could not ${editStaffId ? "update" : "save"} ${selectedStaffType.toLowerCase()}.`,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedStaffType === "Doctor") {
      setDoctorForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setNurseForm((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      // Create a new object without the error for the current field
      const { [name]: _, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };

  const currentForm = selectedStaffType === "Doctor" ? doctorForm : nurseForm;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Staff</h1>
        <Button onClick={handleAdd} disabled={isLoading || isSubmitting}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading Staff...</span>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-muted-foreground"
                >
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              staffs.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phoneNumber}</TableCell>
                  <TableCell>{staff.address}</TableCell>
                  <TableCell>{staff.staffType}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(staff)}
                      disabled={isSubmitting}
                      className="mr-2"
                      aria-label={`Edit ${staff.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(staff)}
                      disabled={isSubmitting}
                      aria-label={`Delete ${staff.name}`}
                    >
                      {isSubmitting && staffToDelete?.id === staff.id ? (
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editStaffId ? "Edit Staff Member" : "Add New Staff Member"}
            </DialogTitle>
            <DialogDescription>
              {editStaffId
                ? "Update the staff member's details."
                : "Enter the details for the new staff member."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="grid gap-4 py-4">
              {!editStaffId && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <Label htmlFor="staffType" className="text-right">
                    Staff Type
                  </Label>
                  <Select
                    value={selectedStaffType}
                    onValueChange={(value: "Doctor" | "Nurse") =>
                      setSelectedStaffType(value)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select staff type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={currentForm.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.name}
                />
              </div>
              {formErrors.name && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <div></div>
                  <p className="col-span-3 -mt-2 text-sm text-destructive">
                    {formErrors.name}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentForm.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.email}
                />
              </div>
              {formErrors.email && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <div></div>
                  <p className="col-span-3 -mt-2 text-sm text-destructive">
                    {formErrors.email}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="phoneNumber" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={currentForm.phoneNumber}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.phoneNumber}
                />
              </div>
              {formErrors.phoneNumber && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <div></div>
                  <p className="col-span-3 -mt-2 text-sm text-destructive">
                    {formErrors.phoneNumber}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={currentForm.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.address}
                />
              </div>
              {formErrors.address && (
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <div></div>
                  <p className="col-span-3 -mt-2 text-sm text-destructive">
                    {formErrors.address}
                  </p>
                </div>
              )}

              {/* Doctor-specific fields */}
              {selectedStaffType === "Doctor" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-x-4">
                    <Label htmlFor="specialization" className="text-right">
                      Specialization
                    </Label>
                    <Select
                      value={doctorForm.specialization}
                      onValueChange={(value) =>
                        setDoctorForm((prev) => ({
                          ...prev,
                          specialization: value,
                        }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-x-4">
                    <Label htmlFor="licenseNumber" className="text-right">
                      License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={doctorForm.licenseNumber}
                      onChange={handleInputChange}
                      className="col-span-3"
                      disabled={isSubmitting}
                      aria-invalid={!!formErrors.licenseNumber}
                    />
                  </div>
                  {formErrors.licenseNumber && (
                    <div className="grid grid-cols-4 items-center gap-x-4">
                      <div></div>
                      <p className="col-span-3 -mt-2 text-sm text-destructive">
                        {formErrors.licenseNumber}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-x-4">
                    <Label htmlFor="consultationRoom" className="text-right">
                      Room
                    </Label>
                    <Select
                      value={doctorForm.consultationRoom}
                      onValueChange={(value) =>
                        setDoctorForm((prev) => ({
                          ...prev,
                          consultationRoom: value,
                        }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONSULTATION_ROOMS.map((room) => (
                          <SelectItem key={room} value={room}>
                            {room}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Nurse-specific fields */}
              {selectedStaffType === "Nurse" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-x-4">
                    <Label htmlFor="department" className="text-right">
                      Department
                    </Label>
                    <Select
                      value={nurseForm.department}
                      onValueChange={(value) =>
                        setNurseForm((prev) => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-x-4">
                    <Label htmlFor="certificationNumber" className="text-right">
                      Certification
                    </Label>
                    <Input
                      id="certificationNumber"
                      name="certificationNumber"
                      value={nurseForm.certificationNumber}
                      onChange={handleInputChange}
                      className="col-span-3"
                      disabled={isSubmitting}
                      aria-invalid={!!formErrors.certificationNumber}
                    />
                  </div>
                  {formErrors.certificationNumber && (
                    <div className="grid grid-cols-4 items-center gap-x-4">
                      <div></div>
                      <p className="col-span-3 -mt-2 text-sm text-destructive">
                        {formErrors.certificationNumber}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-x-4">
                    <Label htmlFor="shiftPreference" className="text-right">
                      Preferred Shift
                    </Label>
                    <Select
                      value={nurseForm.shiftPreference}
                      onValueChange={(value) =>
                        setNurseForm((prev) => ({
                          ...prev,
                          shiftPreference: value,
                        }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select preferred shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_PREFERENCES.map((shift) => (
                          <SelectItem key={shift} value={shift}>
                            {shift}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editStaffId ? "Save Changes" : "Add Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{staffToDelete?.name}</span> and
              remove their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setStaffToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
