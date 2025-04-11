// components/DoctorInfoModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DoctorInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: {
        name: string;
        email: string;
        phoneNumber: string;
        address: string;
    } | null;
}

export default function DoctorInfoModal({ isOpen, onClose, doctor }: DoctorInfoModalProps) {
    return (
        <Dialog open= { isOpen } onOpenChange = { onClose } >
            <DialogContent>
            <DialogHeader>
            <DialogTitle>Doctor Information </DialogTitle>
                < DialogDescription > Details about the selected doctor </DialogDescription>
                    </DialogHeader>

    {
        doctor ? (
            <div className= "space-y-2" >
            <p><strong>Name : </strong> {doctor.name}</p >
        <p><strong>Email: </strong> {doctor.email}</p >
            <p><strong>Phone: </strong> {doctor.phoneNumber}</p >
                <p><strong>Address: </strong> {doctor.address}</p >
                    </div>
        ) : (
            <p>Loading...</p>
        )
    }

    <DialogFooter>
        <Button onClick={ onClose }> Close </Button>
            </DialogFooter>
            </DialogContent>
            </Dialog>
  );
}
