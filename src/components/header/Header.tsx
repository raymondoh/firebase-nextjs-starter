"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/header/Navbar";

export function Header() {
  const pathname = usePathname();

  // Don't render the header on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 mx-auto">
        <Navbar />
      </div>

      {/* Add global styles for the menu buttons */}
      <style jsx global>{`
        /* Increase hamburger menu size */
        button[aria-label="Open menu"] svg,
        button[aria-label="Toggle menu"] svg {
          width: 28px !important;
          height: 28px !important;
        }

        /* Increase close button size in sheet */
        [data-radix-collection-item][role="button"] svg {
          width: 24px !important;
          height: 24px !important;
        }
      `}</style>
    </header>
  );
}
