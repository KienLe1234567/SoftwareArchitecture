// src/components/features/patients/PatientTable.tsx
import { format } from "date-fns";
import { User, BookHeart } from "lucide-react";
import { PatientListItem } from "@/types/patientfake"; // Đảm bảo đúng đường dẫn type
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface PatientTableProps {
  patients: PatientListItem[];
  onViewInfo: (patientId: string) => void;
  onViewHistory: (patientId: string) => void;
}

export function PatientTable({ patients, onViewInfo, onViewHistory }: PatientTableProps) {
  return (
    <Table>
      <TableCaption>
        {patients.length === 0 ? "No patients found." : `Showing ${patients.length} patient(s).`}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date of Birth</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.dob ? format(new Date(patient.dob), "dd/MM/yyyy") : 'N/A'}</TableCell>
            <TableCell>{patient.gender}</TableCell>
            <TableCell>{patient.phone || 'N/A'}</TableCell>
            <TableCell className="text-right space-x-2">
              {/* Gọi callback với ID */}
              <Button variant="outline" size="sm" onClick={() => onViewInfo(patient.id)}>
                <User className="mr-1 h-4 w-4" /> Info
              </Button>
              <Button variant="outline" size="sm" onClick={() => onViewHistory(patient.id)}>
                <BookHeart className="mr-1 h-4 w-4" /> History
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}