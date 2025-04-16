"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("loginrole");
    if (role === "staff") {
      router.replace("/dashboardstaff/homepage");
    } else if (role === "doctor") {
      router.replace("/dashboarddoctor/homepage");
    } else {
      router.replace("/dashboardpatient/homepage");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
}
