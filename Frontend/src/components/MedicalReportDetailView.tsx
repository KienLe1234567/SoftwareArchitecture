// src/components/features/patients/MedicalReportDetailView.tsx (Ví dụ đường dẫn)

import { format, parseISO } from 'date-fns';
import { MedicalReport } from '@/types/patientfake'; // Đảm bảo đúng path
import { cn } from '@/lib/utils';

// --- Shadcn UI Components ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge"; // Dùng Badge cho prescriptions/lab results

// --- Props ---
interface MedicalReportDetailViewProps {
  report: MedicalReport | null;
}

export function MedicalReportDetailView({ report }: MedicalReportDetailViewProps) {

  if (!report) {
    return <div className="text-center text-muted-foreground p-4">No report data available.</div>;
  }

  // Helper để format ngày, xử lý trường hợp ngày không hợp lệ
  const formatDateSafe = (dateString: string | undefined) => {
      if (!dateString) return 'N/A';
      try {
          return format(parseISO(dateString), "PPP"); // Format đẹp hơn: Mar 25, 2025
      } catch (e) {
          return dateString; // Trả về chuỗi gốc nếu không parse được
      }
  };

  return (
    <div className="space-y-6 text-sm"> {/* Container chính */}

        {/* --- Report Information --- */}
        <section>
            <h3 className="text-base font-semibold mb-2 border-b pb-1 text-primary">Report Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                <div><strong>Report ID:</strong> <Badge variant="secondary">{report.reportId}</Badge></div>
                <div><strong>Date:</strong> {formatDateSafe(report.date)}</div>
                <div><strong>Patient ID:</strong> {report.patientId}</div>
                <div><strong>Patient Name:</strong> {report.patientName || 'N/A'}</div>
                <div className="sm:col-span-2"><strong>Doctor:</strong> {report.doctorName}</div>
            </div>
        </section>

        <Separator />

        {/* --- Diagnosis --- */}
        <section>
            <h3 className="text-base font-semibold mb-2 border-b pb-1 text-primary">Diagnosis</h3>
            <p>{report.diagnosis || 'N/A'}</p>
        </section>

        <Separator />

        {/* --- Prescriptions --- */}
        <section>
             <h3 className="text-base font-semibold mb-2 border-b pb-1 text-primary">Prescriptions</h3>
             {report.prescriptions && report.prescriptions.length > 0 ? (
                 <div className="space-y-3">
                     {report.prescriptions.map((med, index) => (
                         <Card key={`pres-${index}`} className="bg-muted/30 p-3">
                             <p><strong>Medicine:</strong> {med.name}</p>
                             <p className="text-muted-foreground"><strong>Dosage:</strong> {med.dosage}</p>
                             <p className="text-muted-foreground"><strong>Frequency:</strong> {med.frequency}</p>
                         </Card>
                     ))}
                 </div>
             ) : (
                <p className="text-muted-foreground italic">No prescriptions recorded.</p>
             )}
        </section>

        <Separator />

         {/* --- Lab Results --- */}
         <section>
              <h3 className="text-base font-semibold mb-2 border-b pb-1 text-primary">Lab Results</h3>
              {report.labResults && report.labResults.length > 0 ? (
                  <div className="space-y-3">
                      {report.labResults.map((lab, index) => (
                          <Card key={`lab-${index}`} className="bg-muted/30 p-3">
                              <p><strong>Test:</strong> {lab.test}</p>
                              <p className="text-muted-foreground"><strong>Result:</strong> {lab.result}</p>
                              {lab.notes && <p className="text-muted-foreground"><strong>Notes:</strong> {lab.notes}</p>}
                          </Card>
                      ))}
                  </div>
              ) : (
                 <p className="text-muted-foreground italic">No lab results recorded.</p>
              )}
         </section>

         <Separator />

         {/* --- Doctor's Notes --- */}
         <section>
              <h3 className="text-base font-semibold mb-2 border-b pb-1 text-primary">Doctor's Notes</h3>
              {report.doctorNotes ? (
                 <p className="whitespace-pre-line bg-muted/30 p-3 rounded-md">{report.doctorNotes}</p>
              ): (
                <p className="text-muted-foreground italic">No specific notes from the doctor.</p>
              )}
         </section>

    </div>
  );
}