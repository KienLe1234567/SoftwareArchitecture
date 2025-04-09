import { cn } from "@/lib/utils"; // dùng Tailwind helper nếu bạn có
import Image from "next/image";

interface DoctorCardProps {
    name: string;
    email: string;
    phoneNumber: string;
    imageUrl: string;
    isSelected?: boolean;
}

export default function DoctorCard({
    name,
    email,
    phoneNumber,
    imageUrl,
    isSelected = false,
}: DoctorCardProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-4 p-3 border rounded-lg shadow-sm transition-all duration-150 cursor-pointer",
                isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white hover:bg-muted"
            )}
        >
            <Image
                src={imageUrl}
                alt={name}
                width={50}
                height={50}
                className="rounded-full object-cover"
            />
            <div className="space-y-1">
                <h3 className="font-semibold text-base">{name}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <p className="text-sm text-muted-foreground">{phoneNumber}</p>
            </div>
        </div>
    );
}
