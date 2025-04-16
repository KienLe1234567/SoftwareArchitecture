import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Hospital management system",
  description:
    "The system which helps officers collect and research the data inside.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logoh.jpg" type="image/jpeg" sizes="16x16" />
      </head>
      <body>
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
