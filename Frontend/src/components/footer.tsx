"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "/public/hos.png"; // Ensure logo path is correct
import { MapPin, Phone, Mail } from "lucide-react"; // Import icons from lucide-react
import { Separator } from "@/components/ui/separator"; // Import Separator from shadcn/ui

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    // Use a darker background, more neutral text colors, and a top border
    <footer className="bg-gray-900 text-neutral-300 border-t border-gray-700">
      <div className="container mx-auto px-6 py-12 grid gap-10 md:grid-cols-3 lg:gap-16"> {/* Increased padding and gap */}

        {/* Column 1: Logo and Application Info */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-4"> {/* Added margin below logo */}
            <Image
              src={logo}
              alt="Hospital Management System Logo" // Updated alt text
              width={120} // Adjusted logo size
              height={120} // Added height to prevent layout shift
              className="h-auto" // Maintain aspect ratio
            />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2"> {/* App name, white color for emphasis */}
            Hospital Management System
          </h2>
          {/* Added a brief description */}
          <p className="text-sm text-neutral-400">
            Streamlining hospital operations for better patient care.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        {/* Center on small screens, align start on medium and up */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3> {/* Title, white color */}
          <nav className="flex flex-col gap-2 text-sm text-center md:text-left"> {/* Center links text on small */}
            {/* Smoother hover effect */}
            <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors duration-200">About Us</Link>
            <Link href="/features" className="hover:text-white transition-colors duration-200">Features</Link>
            <Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link>
          </nav>
        </div>

        {/* Column 3: Contact Information */}
        {/* Center on small screens, align start on medium and up */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-4 text-white">Contact Information</h3> {/* Title, white color */}
           {/* Use space-y for vertical spacing */}
          <address className="not-italic text-sm space-y-3 text-center md:text-left">
            {/* Add icons and align with flex */}
            <div className="flex items-center justify-center md:justify-start gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              {/* Address - Keeping original street names is common */}
              <span>12 Le Loi, District 1, Ho Chi Minh City</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Phone className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              {/* Use tel: link, placeholder number */}
              <a href="tel:+842812345678" className="hover:text-white transition-colors duration-200">+84 (28) 1234 5678</a>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              {/* Use mailto: link, updated placeholder email */}
              <a href="mailto:info@hospitalms.com" className="hover:text-white transition-colors duration-200">info@hospitalms.com</a>
            </div>
          </address>
        </div>
      </div>

      {/* Separator and Copyright */}
      <div className="container mx-auto px-6">
        {/* Use Separator component for consistency */}
        <Separator className="bg-gray-700" />
      </div>
      <div className="container mx-auto px-6 py-6"> {/* Added padding y */}
        {/* Use muted color, updated company/project name */}
        <p className="text-center text-xs text-neutral-500">
          &copy; {currentYear} Hospital Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;