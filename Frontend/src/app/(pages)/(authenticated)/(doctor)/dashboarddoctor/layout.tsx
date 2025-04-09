import AppFooter from "@/components/footer";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebardoctor";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Doctor",
    description: "The system which helps officers collect and research the data inside",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <div className="flex">
                <TooltipProvider>
                    <Sidebar />
                </TooltipProvider>
                <main className="flex-1 p-6 bg-gray-50">
                    {children}
                </main>
            </div>
            <AppFooter />
        </>
    );
}
